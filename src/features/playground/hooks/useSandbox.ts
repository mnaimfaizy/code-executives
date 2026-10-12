import { useRef, useCallback, useState } from 'react';
import type { SandboxFrameHandle } from '../components/execution/SandboxFrame';
import type { ConsoleEntry } from '../types';
import type { Trace, TraceLimits } from '../tracer';
import type { CheckReport, SandboxCheck } from '../exercises/types';
import { DEFAULT_EXECUTION_TIMEOUT_MS } from '../types/playground-v2';
import { isTextContent, enforceEntryLimit } from '../utils/sanitize';

/** Maximum allowed code length (50 KB) */
const MAX_CODE_LENGTH = 50 * 1024;

/** Minimum interval between executions (ms) — rate limit */
const MIN_EXECUTION_INTERVAL_MS = 1_000;

/** Result returned directly from execute() for immediate use by the caller */
export interface SandboxExecuteResult {
  error: string | null;
  /** The trace of a traced run that reached the sandbox, otherwise null */
  trace: Trace | null;
}

/** Options for one execution */
export interface SandboxExecuteOptions {
  /**
   * Turns a line of the code that runs into a line of the learner's source.
   * Needed when the code was compiled first (TypeScript); applied to every step
   * and to the line of an uncaught error.
   */
  mapLine?: (line: number) => number;
  /** Set when `code` is instrumented code: the sandbox records a trace within these limits */
  traceLimits?: TraceLimits;
  /** False for a run a control in the page starts on its own, such as watching a check */
  rateLimit?: boolean;
}

/** Give every line a trace carries its place in the learner's source */
export function mapTraceLines(trace: Trace, mapLine: (line: number) => number): Trace {
  const mapped: Trace = {
    ...trace,
    steps: trace.steps.map((step) => ({ ...step, line: mapLine(step.line) })),
  };
  if (trace.error?.line !== undefined) {
    mapped.error = { ...trace.error, line: mapLine(trace.error.line) };
  }
  return mapped;
}

interface UseSandboxReturn {
  /** Execute JavaScript in the sandbox */
  execute: (code: string, options?: SandboxExecuteOptions) => Promise<SandboxExecuteResult>;
  /**
   * Run one check of an exercise: `code` is instrumented code that ends by calling the check
   * hook. Nothing is written to the Console, and the rate limit does not apply, because one
   * Check action is several runs.
   */
  runCheck: (
    code: string,
    check: SandboxCheck,
    traceLimits: TraceLimits,
    timeout: number
  ) => Promise<CheckReport>;
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
  const lastExecutionRef = useRef<number>(0);
  /** Keeps the ids of errors reported in the same millisecond apart */
  const reportCountRef = useRef(0);

  const clearEntries = useCallback((): void => {
    setEntries([]);
    setError(null);
  }, []);

  const reportError = useCallback((message: string, line?: number): void => {
    setError(message);
    setEntries((prev) =>
      enforceEntryLimit([
        ...prev,
        {
          id: `${Date.now()}-report-${++reportCountRef.current}`,
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
        return { error: msg, trace: null };
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
        return { error: msg, trace: null };
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
        return { error: msg, trace: null };
      }

      // Rate limiting: max 1 execution per second
      const now = Date.now();
      if (
        options?.rateLimit !== false &&
        now - lastExecutionRef.current < MIN_EXECUTION_INTERVAL_MS
      ) {
        const msg = 'Please wait before running again';
        setError(msg);
        return { error: msg, trace: null };
      }
      lastExecutionRef.current = now;

      setIsRunning(true);
      setError(null);

      try {
        const result = await sandbox.execute(
          code,
          DEFAULT_EXECUTION_TIMEOUT_MS,
          options?.traceLimits
        );
        const mapLine = options?.mapLine;
        const resultEntries = mapLine
          ? result.entries.map((entry) =>
              entry.line ? { ...entry, line: mapLine(entry.line) } : entry
            )
          : result.entries;
        setEntries((prev) => enforceEntryLimit([...prev, ...resultEntries]));
        const trace = result.trace ?? null;
        if (result.error) {
          setError(result.error);
        }
        return {
          error: result.error ?? null,
          trace: trace && mapLine ? mapTraceLines(trace, mapLine) : trace,
        };
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
        return { error: message, trace: null };
      } finally {
        setIsRunning(false);
      }
    },
    []
  );

  const runCheck = useCallback(
    async (
      code: string,
      check: SandboxCheck,
      traceLimits: TraceLimits,
      timeout: number
    ): Promise<CheckReport> => {
      const sandbox = sandboxRef.current;
      if (!sandbox) return { status: 'unavailable', message: 'Sandbox not initialized' };
      setIsRunning(true);
      try {
        const result = await sandbox.execute(code, timeout, traceLimits, check);
        // No verdict means the sandbox never answered: the host's backstop ended the run
        return (
          result.check ?? {
            status: 'unavailable',
            message: result.error ?? 'The sandbox did not answer',
          }
        );
      } catch (err) {
        return {
          status: 'unavailable',
          message: err instanceof Error ? err.message : 'Unknown execution error',
        };
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
    runCheck,
    reportError,
    terminate,
    isRunning,
    entries,
    clearEntries,
    error,
    sandboxRef,
  };
}
