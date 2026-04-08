import { useState, useCallback, useRef } from 'react';
import {
  loadPyodideRuntime,
  isPyodideReady,
  type PyodideInstance,
  type PyodideLoadingState,
} from '../services/pyodide-loader';
import type { ConsoleEntry, ConsoleEntryType, StateSnapshot } from '../types';
import {
  wrapPythonCodeWithTrace,
  parsePythonSnapshots,
} from '../instrumentation/PythonInstrumenter';

/** Maximum allowed code length (50 KB) */
const MAX_CODE_LENGTH = 50 * 1024;

/** Default Python execution timeout (10 seconds) */
const PYTHON_TIMEOUT_MS = 10_000;

/** Result returned directly from run functions for immediate use by the caller */
export interface PyodideExecuteResult {
  error: string | null;
  snapshots: StateSnapshot[];
}

interface UsePyodideReturn {
  /** Execute Python code and return console entries */
  runPython: (code: string) => Promise<PyodideExecuteResult>;
  /** Execute Python code with instrumentation (sys.settrace) */
  runPythonInstrumented: (code: string) => Promise<PyodideExecuteResult>;
  /** Current loading state */
  loadingState: PyodideLoadingState;
  /** Whether Pyodide is ready to execute */
  isReady: boolean;
  /** Whether Python code is currently running */
  isRunning: boolean;
  /** Console output entries */
  entries: ConsoleEntry[];
  /** Clear console output */
  clearEntries: () => void;
  /** Last execution error */
  error: string | null;
  /** Pre-load Pyodide (e.g., on hover) */
  preload: () => void;
  /** Timeline snapshots from the last instrumented execution */
  snapshots: StateSnapshot[];
  /** Clear the snapshots */
  clearSnapshots: () => void;
}

/**
 * Hook that manages Pyodide lifecycle and Python code execution.
 * Lazy-loads Pyodide only on first use or explicit preload call.
 */
export function usePyodide(): UsePyodideReturn {
  const [loadingState, setLoadingState] = useState<PyodideLoadingState>({
    status: isPyodideReady() ? 'ready' : 'idle',
  });
  const [isRunning, setIsRunning] = useState(false);
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const instanceRef = useRef<PyodideInstance | null>(null);
  const [snapshots, setSnapshots] = useState<StateSnapshot[]>([]);

  const clearEntries = useCallback((): void => {
    setEntries([]);
    setError(null);
  }, []);

  const clearSnapshots = useCallback((): void => {
    setSnapshots([]);
  }, []);

  const ensureLoaded = useCallback(async (): Promise<PyodideInstance> => {
    if (instanceRef.current) return instanceRef.current;

    setLoadingState({ status: 'loading' });
    try {
      const instance = await loadPyodideRuntime();
      instanceRef.current = instance;
      setLoadingState({ status: 'ready' });
      return instance;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load Python runtime';
      setLoadingState({ status: 'error', error: message });
      throw err;
    }
  }, []);

  const preload = useCallback((): void => {
    if (loadingState.status === 'idle') {
      ensureLoaded().catch(() => {
        // Error is captured in loadingState
      });
    }
  }, [ensureLoaded, loadingState.status]);

  const runPython = useCallback(
    async (code: string): Promise<PyodideExecuteResult> => {
      // Input validation
      if (code.length > MAX_CODE_LENGTH) {
        const msg = `Code exceeds maximum length (${MAX_CODE_LENGTH / 1024} KB)`;
        setError(msg);
        setEntries((prev) => [
          ...prev,
          {
            id: `${Date.now()}-validation`,
            type: 'error' as ConsoleEntryType,
            args: [msg],
            timestamp: Date.now(),
          },
        ]);
        return { error: msg, snapshots: [] };
      }

      setIsRunning(true);
      setError(null);

      try {
        const pyodide = await ensureLoaded();

        const newEntries: ConsoleEntry[] = [];

        // Redirect stdout/stderr to capture console output
        pyodide.setStdout({
          batched: (msg: string) => {
            newEntries.push({
              id: `${Date.now()}-${newEntries.length}`,
              type: 'log',
              args: [msg],
              timestamp: Date.now(),
            });
          },
        });

        pyodide.setStderr({
          batched: (msg: string) => {
            newEntries.push({
              id: `${Date.now()}-${newEntries.length}`,
              type: 'error',
              args: [msg],
              timestamp: Date.now(),
            });
          },
        });

        // Execute with timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error(`Execution timed out (exceeded ${PYTHON_TIMEOUT_MS / 1000}s limit)`)
              ),
            PYTHON_TIMEOUT_MS
          );
        });

        await Promise.race([pyodide.runPythonAsync(code), timeoutPromise]);

        setEntries((prev) => [...prev, ...newEntries]);
        return { error: null, snapshots: [] };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown Python execution error';
        setError(message);
        setEntries((prev) => [
          ...prev,
          {
            id: `${Date.now()}-error`,
            type: 'error',
            args: [message],
            timestamp: Date.now(),
          },
        ]);
        return { error: message, snapshots: [] };
      } finally {
        setIsRunning(false);
      }
    },
    [ensureLoaded]
  );

  const runPythonInstrumented = useCallback(
    async (code: string): Promise<PyodideExecuteResult> => {
      // Input validation
      if (code.length > MAX_CODE_LENGTH) {
        const msg = `Code exceeds maximum length (${MAX_CODE_LENGTH / 1024} KB)`;
        setError(msg);
        return { error: msg, snapshots: [] };
      }

      setIsRunning(true);
      setError(null);
      setSnapshots([]);

      try {
        const pyodide = await ensureLoaded();

        const newEntries: ConsoleEntry[] = [];

        pyodide.setStdout({
          batched: (msg: string) => {
            newEntries.push({
              id: `${Date.now()}-${newEntries.length}`,
              type: 'log',
              args: [msg],
              timestamp: Date.now(),
            });
          },
        });

        pyodide.setStderr({
          batched: (msg: string) => {
            newEntries.push({
              id: `${Date.now()}-${newEntries.length}`,
              type: 'error',
              args: [msg],
              timestamp: Date.now(),
            });
          },
        });

        const instrumentedCode = wrapPythonCodeWithTrace(code);

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error(`Execution timed out (exceeded ${PYTHON_TIMEOUT_MS / 1000}s limit)`)
              ),
            PYTHON_TIMEOUT_MS
          );
        });

        await Promise.race([pyodide.runPythonAsync(instrumentedCode), timeoutPromise]);

        // Retrieve the snapshots from the Python global
        const resultJson = pyodide.globals.get('_instrumentation_result') as string;
        let resultSnapshots: StateSnapshot[] = [];
        if (resultJson) {
          resultSnapshots = parsePythonSnapshots(resultJson);
          setSnapshots(resultSnapshots);
        }

        setEntries((prev) => [...prev, ...newEntries]);
        return { error: null, snapshots: resultSnapshots };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown Python execution error';
        setError(message);
        setEntries((prev) => [
          ...prev,
          {
            id: `${Date.now()}-error`,
            type: 'error',
            args: [message],
            timestamp: Date.now(),
          },
        ]);
        return { error: message, snapshots: [] };
      } finally {
        setIsRunning(false);
      }
    },
    [ensureLoaded]
  );

  return {
    runPython,
    runPythonInstrumented,
    loadingState,
    isReady: loadingState.status === 'ready',
    isRunning,
    entries,
    clearEntries,
    error,
    preload,
    snapshots,
    clearSnapshots,
  };
}
