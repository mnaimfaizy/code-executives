import { useRef, useCallback, useState } from 'react';
import type { SandboxFrameHandle } from '../components/execution/SandboxFrame';
import type { ConsoleEntry, StateSnapshot } from '../types';
import { DEFAULT_EXECUTION_TIMEOUT_MS } from '../types/playground-v2';
import { isTextContent, enforceEntryLimit } from '../utils/sanitize';

/** Maximum allowed code length (50 KB) */
const MAX_CODE_LENGTH = 50 * 1024;

/** Minimum interval between executions (ms) — rate limit */
const MIN_EXECUTION_INTERVAL_MS = 1_000;

/** Result returned directly from execute() for immediate use by the caller */
export interface SandboxExecuteResult {
  error: string | null;
  snapshots: StateSnapshot[];
}

/** Options for one execution */
export interface SandboxExecuteOptions {
  /**
   * Turns a line of the code that runs into a line of the learner's source.
   * Needed when the code was compiled first (TypeScript); applied to every step
   * and to the line of an uncaught error.
   */
  mapLine?: (line: number) => number;
}

/** Give every line a step carries its place in the learner's source */
export function mapSnapshotLines(
  snapshots: StateSnapshot[],
  mapLine: (line: number) => number
): StateSnapshot[] {
  return snapshots.map((snapshot) => ({
    ...snapshot,
    line: mapLine(snapshot.line),
    callStack: snapshot.callStack.map((frame) => ({ ...frame, line: mapLine(frame.line) })),
  }));
}

interface UseSandboxReturn {
  /** Execute JavaScript in the sandbox */
  execute: (code: string, options?: SandboxExecuteOptions) => Promise<SandboxExecuteResult>;
  /** Write an error to the Console for a run that never reached the sandbox */
  reportError: (message: string, line?: number) => void;
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
  /** Snapshots from the last instrumented execution */
  snapshots: StateSnapshot[];
  /** Clear the snapshots */
  clearSnapshots: () => void;
}

/**
 * Hook that orchestrates JS/TS code execution via the sandboxed iframe.
 * The sandbox runs JavaScript: the caller strips TypeScript's types first
 * (services/transpileTypeScript) and passes the `mapLine` it got back.
 */
export function useSandbox(): UseSandboxReturn {
  const sandboxRef = useRef<SandboxFrameHandle | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<StateSnapshot[]>([]);
  const lastExecutionRef = useRef<number>(0);

  const clearEntries = useCallback((): void => {
    setEntries([]);
    setError(null);
  }, []);

  const clearSnapshots = useCallback((): void => {
    setSnapshots([]);
  }, []);

  const reportError = useCallback((message: string, line?: number): void => {
    setError(message);
    setEntries((prev) =>
      enforceEntryLimit([
        ...prev,
        {
          id: `${Date.now()}-report`,
          type: 'error',
          args: [message],
          timestamp: Date.now(),
          ...(line ? { line } : {}),
        },
      ])
    );
  }, []);

  const execute = useCallback(
    async (code: string, options?: SandboxExecuteOptions): Promise<SandboxExecuteResult> => {
      const sandbox = sandboxRef.current;
      if (!sandbox) {
        const msg = 'Sandbox not initialized';
        setError(msg);
        return { error: msg, snapshots: [] };
      }

      // Input validation: max code length
      if (code.length > MAX_CODE_LENGTH) {
        const msg = `Code exceeds maximum length (${MAX_CODE_LENGTH / 1024} KB)`;
        setError(msg);
        setEntries((prev) =>
          enforceEntryLimit([
            ...prev,
            {
              id: `${Date.now()}-validation`,
              type: 'error',
              args: [msg],
              timestamp: Date.now(),
            },
          ])
        );
        return { error: msg, snapshots: [] };
      }

      // Input validation: reject binary content
      if (!isTextContent(code)) {
        const msg = 'Code contains binary content and cannot be executed';
        setError(msg);
        setEntries((prev) =>
          enforceEntryLimit([
            ...prev,
            {
              id: `${Date.now()}-validation`,
              type: 'error',
              args: [msg],
              timestamp: Date.now(),
            },
          ])
        );
        return { error: msg, snapshots: [] };
      }

      // Rate limiting: max 1 execution per second
      const now = Date.now();
      if (now - lastExecutionRef.current < MIN_EXECUTION_INTERVAL_MS) {
        const msg = 'Please wait before running again';
        setError(msg);
        return { error: msg, snapshots: [] };
      }
      lastExecutionRef.current = now;

      setIsRunning(true);
      setError(null);

      try {
        const result = await sandbox.execute(code, DEFAULT_EXECUTION_TIMEOUT_MS);
        const mapLine = options?.mapLine;
        const resultEntries = mapLine
          ? result.entries.map((entry) =>
              entry.line ? { ...entry, line: mapLine(entry.line) } : entry
            )
          : result.entries;
        setEntries((prev) => enforceEntryLimit([...prev, ...resultEntries]));
        const resultSnapshots = mapLine
          ? mapSnapshotLines(result.snapshots ?? [], mapLine)
          : (result.snapshots ?? []);
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
        setEntries((prev) =>
          enforceEntryLimit([
            ...prev,
            {
              id: `${Date.now()}-error`,
              type: 'error',
              args: [message],
              timestamp: Date.now(),
            },
          ])
        );
        return { error: message, snapshots: [] };
      } finally {
        setIsRunning(false);
      }
    },
    []
  );

  const terminate = useCallback((): void => {
    sandboxRef.current?.terminate();
    setIsRunning(false);
  }, []);

  return {
    execute,
    reportError,
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
