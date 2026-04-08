import { useRef, useCallback, useState } from 'react';
import type { SandboxFrameHandle } from '../components/execution/SandboxFrame';
import type { ConsoleEntry, StateSnapshot } from '../types';
import { DEFAULT_EXECUTION_TIMEOUT_MS } from '../types/playground-v2';

/** Maximum allowed code length (50 KB) */
const MAX_CODE_LENGTH = 50 * 1024;

/** Result returned directly from execute() for immediate use by the caller */
export interface SandboxExecuteResult {
  error: string | null;
  snapshots: StateSnapshot[];
}

interface UseSandboxReturn {
  /** Execute JS/TS code in the sandbox */
  execute: (code: string) => Promise<SandboxExecuteResult>;
  /** Terminate current execution */
  terminate: () => void;
  /** Whether code is currently running */
  isRunning: boolean;
  /** Console output entries */
  entries: ConsoleEntry[];
  /** Clear console output */
  clearEntries: () => void;
  /** Last execution error */
  error: string | null;
  /** Ref to attach to the SandboxFrame component */
  sandboxRef: React.RefObject<SandboxFrameHandle | null>;
  /** Timeline snapshots from the last instrumented execution */
  snapshots: StateSnapshot[];
  /** Clear the snapshots */
  clearSnapshots: () => void;
}

/**
 * Hook that orchestrates JS/TS code execution via the sandboxed iframe.
 * For TypeScript, the code should be transpiled before passing to execute.
 */
export function useSandbox(): UseSandboxReturn {
  const sandboxRef = useRef<SandboxFrameHandle | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<StateSnapshot[]>([]);

  const clearEntries = useCallback((): void => {
    setEntries([]);
    setError(null);
  }, []);

  const clearSnapshots = useCallback((): void => {
    setSnapshots([]);
  }, []);

  const execute = useCallback(async (code: string): Promise<SandboxExecuteResult> => {
    const sandbox = sandboxRef.current;
    if (!sandbox) {
      const msg = 'Sandbox not initialized';
      setError(msg);
      return { error: msg, snapshots: [] };
    }

    // Input validation
    if (code.length > MAX_CODE_LENGTH) {
      const msg = `Code exceeds maximum length (${MAX_CODE_LENGTH / 1024} KB)`;
      setError(msg);
      setEntries((prev) => [
        ...prev,
        {
          id: `${Date.now()}-validation`,
          type: 'error',
          args: [msg],
          timestamp: Date.now(),
        },
      ]);
      return { error: msg, snapshots: [] };
    }

    setIsRunning(true);
    setError(null);

    try {
      const result = await sandbox.execute(code, DEFAULT_EXECUTION_TIMEOUT_MS);
      setEntries((prev) => [...prev, ...result.entries]);
      const resultSnapshots = result.snapshots ?? [];
      if (resultSnapshots.length > 0) {
        setSnapshots(resultSnapshots);
      }
      if (result.error) {
        setError(result.error);
      }
      return { error: result.error ?? null, snapshots: resultSnapshots };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown execution error';
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
  }, []);

  const terminate = useCallback((): void => {
    sandboxRef.current?.terminate();
    setIsRunning(false);
  }, []);

  return {
    execute,
    terminate,
    isRunning,
    entries,
    clearEntries,
    error,
    sandboxRef,
    snapshots,
    clearSnapshots,
  };
}
