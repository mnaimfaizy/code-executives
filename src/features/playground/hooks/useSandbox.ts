import { useRef, useCallback, useState } from 'react';
import type { SandboxFrameHandle } from '../components/execution/SandboxFrame';
import type { ConsoleEntry } from '../types';
import { DEFAULT_EXECUTION_TIMEOUT_MS } from '../types/playground-v2';

/** Maximum allowed code length (50 KB) */
const MAX_CODE_LENGTH = 50 * 1024;

interface UseSandboxReturn {
  /** Execute JS/TS code in the sandbox */
  execute: (code: string) => Promise<void>;
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
 * For TypeScript, the code should be transpiled before passing to execute.
 */
export function useSandbox(): UseSandboxReturn {
  const sandboxRef = useRef<SandboxFrameHandle | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clearEntries = useCallback((): void => {
    setEntries([]);
    setError(null);
  }, []);

  const execute = useCallback(async (code: string): Promise<void> => {
    const sandbox = sandboxRef.current;
    if (!sandbox) {
      setError('Sandbox not initialized');
      return;
    }

    // Input validation
    if (code.length > MAX_CODE_LENGTH) {
      setError(`Code exceeds maximum length (${MAX_CODE_LENGTH / 1024} KB)`);
      setEntries((prev) => [
        ...prev,
        {
          id: `${Date.now()}-validation`,
          type: 'error',
          args: [`Code exceeds maximum length (${MAX_CODE_LENGTH / 1024} KB)`],
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      const result = await sandbox.execute(code, DEFAULT_EXECUTION_TIMEOUT_MS);
      setEntries((prev) => [...prev, ...result.entries]);
      if (result.error) {
        setError(result.error);
      }
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
  };
}
