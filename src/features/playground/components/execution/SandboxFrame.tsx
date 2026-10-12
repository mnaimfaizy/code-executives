import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { ConsoleEntry, ConsoleEntryType } from '../../types';
import { runtimeSource, TRACER_NAME, type Trace, type TraceLimits } from '../../tracer';
import { SANDBOX_RUNTIME_SOURCE } from './sandboxRuntime';

/** What the sandbox needs to record a trace: the tracer runtime as source, and its limits */
interface SandboxTracer {
  runtime: string;
  /** The name instrumented code calls the tracer by */
  name: string;
  limits: TraceLimits;
}

/** Messages sent from host → sandbox iframe */
type HostToSandbox =
  | {
      type: 'execute';
      code: string;
      nonce: string;
      timeout: number;
      runId: number;
      tracer?: SandboxTracer;
    }
  | { type: 'cancel' };

interface RawConsoleEntry {
  type: ConsoleEntryType;
  args: string[];
  /** Line of the code that was run, for an uncaught error */
  line?: number;
}

/** Messages sent from sandbox iframe → host */
interface SandboxToHost {
  type: 'console' | 'result' | 'error' | 'ready';
  /** The run this message reports on; a message from a run that was stopped is ignored */
  runId?: number;
  entries?: RawConsoleEntry[];
  error?: string;
  trace?: Trace | null;
}

/**
 * Generate the iframe srcdoc HTML with strict CSP.
 * All user code is received via postMessage — never injected into the HTML.
 */
function createSandboxHTML(nonce: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none'; script-src 'nonce-${nonce}' 'unsafe-eval'; connect-src 'none'; img-src 'none'; style-src 'none'; frame-src 'none'; object-src 'none';" />
</head>
<body>
<script nonce="${nonce}">${SANDBOX_RUNTIME_SOURCE}</script>
</body>
</html>`;
}

/** Generate a cryptographic nonce for CSP */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export interface SandboxExecutionResult {
  entries: ConsoleEntry[];
  error?: string;
  /** The trace of a traced run */
  trace?: Trace;
}

export interface SandboxFrameHandle {
  /** With `traceLimits`, `code` is instrumented code and the result carries its trace */
  execute: (
    code: string,
    timeout: number,
    traceLimits?: TraceLimits
  ) => Promise<SandboxExecutionResult>;
  terminate: () => void;
}

const SandboxFrame = forwardRef<SandboxFrameHandle>((_props, ref) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const runIdRef = useRef(0);
  const pendingRef = useRef<{
    runId: number;
    resolve: (value: SandboxExecutionResult) => void;
    reject: (err: Error) => void;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);
  const nonceRef = useRef(generateNonce());

  const parseEntries = useCallback((rawEntries?: RawConsoleEntry[]): ConsoleEntry[] => {
    if (!rawEntries) return [];
    return rawEntries.map((entry, index) => ({
      id: `${Date.now()}-${index}`,
      type: entry.type,
      args: entry.args,
      timestamp: Date.now(),
      ...(entry.line ? { line: entry.line } : {}),
    }));
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent): void => {
      // Only accept messages from our sandbox iframe
      const iframe = iframeRef.current;
      if (!iframe || event.source !== iframe.contentWindow) return;

      const data = event.data as SandboxToHost;
      if (!data || !data.type) return;

      if (data.type === 'result' || data.type === 'error') {
        const pending = pendingRef.current;
        if (pending && pending.runId === data.runId) {
          clearTimeout(pending.timeoutId);
          pending.resolve({
            entries: parseEntries(data.entries),
            error: data.type === 'error' ? data.error : undefined,
            trace: data.trace ?? undefined,
          });
          pendingRef.current = null;
        }
      }
    },
    [parseEntries]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (pendingRef.current) {
        clearTimeout(pendingRef.current.timeoutId);
        pendingRef.current = null;
      }
    };
  }, [handleMessage]);

  const terminate = useCallback((): void => {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timeoutId);
      pendingRef.current.reject(new Error('Execution terminated'));
      pendingRef.current = null;
    }
    // Tell the sandbox to drop the run's pending timers; it reports nothing for it
    const cancel: HostToSandbox = { type: 'cancel' };
    iframeRef.current?.contentWindow?.postMessage(cancel, '*');
    // Recreate the iframe to kill any running code
    nonceRef.current = generateNonce();
  }, []);

  const execute = useCallback(
    (code: string, timeout: number, traceLimits?: TraceLimits): Promise<SandboxExecutionResult> => {
      // Terminate any pending execution
      if (pendingRef.current) terminate();

      return new Promise((resolve, reject) => {
        const iframe = iframeRef.current;
        if (!iframe?.contentWindow) {
          reject(new Error('Sandbox iframe not available'));
          return;
        }

        const runId = ++runIdRef.current;

        const timeoutId = setTimeout(() => {
          if (pendingRef.current?.runId === runId) {
            pendingRef.current = null;
            resolve({
              entries: [
                {
                  id: `${Date.now()}-timeout`,
                  type: 'error',
                  args: [`Execution timed out (exceeded ${timeout / 1000}s limit)`],
                  timestamp: Date.now(),
                },
              ],
              error: `Execution timed out (exceeded ${timeout / 1000}s limit)`,
            });
          }
          // The sandbox ends a run itself at `timeout`. This is the backstop for code
          // that never yields; the margin covers a background tab, where the browser
          // only wakes the sandbox's timers once a second.
        }, timeout + 1500);

        pendingRef.current = { runId, resolve, reject, timeoutId };

        const msg: HostToSandbox = {
          type: 'execute',
          code,
          nonce: nonceRef.current,
          timeout,
          runId,
          ...(traceLimits
            ? { tracer: { runtime: runtimeSource, name: TRACER_NAME, limits: traceLimits } }
            : {}),
        };

        iframe.contentWindow.postMessage(msg, '*');
      });
    },
    [terminate]
  );

  useImperativeHandle(ref, () => ({ execute, terminate }), [execute, terminate]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts"
      srcDoc={createSandboxHTML(nonceRef.current)}
      style={{ display: 'none' }}
      title="Code execution sandbox"
      aria-hidden="true"
    />
  );
});

SandboxFrame.displayName = 'SandboxFrame';

export default SandboxFrame;
