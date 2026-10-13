import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback, useState } from 'react';
import type { ConsoleEntry, ConsoleEntryType } from '../../types';
import {
  runtimeSource,
  TRACER_NAME,
  type LoopGuard,
  type Trace,
  type TraceLimits,
} from '../../tracer';
import type { CheckReport, SandboxCheck } from '../../exercises/types';
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
      timeout: number;
      runId: number;
      tracer?: SandboxTracer;
      /** A run with Trace off: the counter its code calls, and the limit it stops at */
      guard?: LoopGuard;
      /** An exercise's check: the sandbox calls the entry function and compares */
      check?: SandboxCheck;
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
  check?: CheckReport;
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

/** One sandbox iframe. A new `id` makes React discard the element and mount a fresh one. */
interface Frame {
  id: number;
  srcDoc: string;
}

function newFrame(id: number): Frame {
  return { id, srcDoc: createSandboxHTML(generateNonce()) };
}

export interface SandboxExecutionResult {
  entries: ConsoleEntry[];
  error?: string;
  /** The trace of a traced run */
  trace?: Trace;
  /** The verdict of a run that carried a check */
  check?: CheckReport;
}

export interface SandboxFrameHandle {
  /**
   * With `traceLimits`, `code` is instrumented code and the result carries its trace.
   * With `check`, `code` ends by calling the check hook and the result carries the verdict.
   * With `guard`, `code` is guarded code (tracer/loopGuard.ts) and Trace is off.
   */
  execute: (
    code: string,
    timeout: number,
    traceLimits?: TraceLimits,
    check?: SandboxCheck,
    guard?: LoopGuard
  ) => Promise<SandboxExecutionResult>;
  /**
   * Ends the run in progress: its promise rejects, and the iframe is discarded and replaced
   * by a fresh one, so whatever the old one was doing is gone and the next run starts clean.
   */
  terminate: () => void;
}

const SandboxFrame = forwardRef<SandboxFrameHandle>((_props, ref) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [frame, setFrame] = useState<Frame>(() => newFrame(0));
  /** True once the current iframe's script has said it listens */
  const readyRef = useRef(false);
  /** A run asked for before the current iframe was ready; sent when it is */
  const queuedRef = useRef<HostToSandbox | null>(null);
  const runIdRef = useRef(0);
  const pendingRef = useRef<{
    runId: number;
    resolve: (value: SandboxExecutionResult) => void;
    reject: (err: Error) => void;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);

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
      // Only accept messages from our sandbox iframe. One that was discarded is no longer
      // `iframeRef.current`, so nothing it still sends is heard.
      const iframe = iframeRef.current;
      if (!iframe || event.source !== iframe.contentWindow) return;

      const data = event.data as SandboxToHost;
      if (!data || !data.type) return;

      if (data.type === 'ready') {
        readyRef.current = true;
        const queued = queuedRef.current;
        queuedRef.current = null;
        if (queued) iframe.contentWindow?.postMessage(queued, '*');
        return;
      }

      if (data.type === 'result' || data.type === 'error') {
        const pending = pendingRef.current;
        if (pending && pending.runId === data.runId) {
          clearTimeout(pending.timeoutId);
          pending.resolve({
            entries: parseEntries(data.entries),
            error: data.type === 'error' ? data.error : undefined,
            trace: data.trace ?? undefined,
            check: data.check,
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

  /**
   * Discard the iframe and mount a fresh one. Removing the element destroys its document,
   * with its timers, its promise work and everything the code left on its globals.
   */
  const recreate = useCallback((): void => {
    // Until the old element is gone it still exists: tell it to drop the run's timers
    const cancel: HostToSandbox = { type: 'cancel' };
    iframeRef.current?.contentWindow?.postMessage(cancel, '*');
    readyRef.current = false;
    queuedRef.current = null;
    setFrame((previous) => newFrame(previous.id + 1));
  }, []);

  const terminate = useCallback((): void => {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timeoutId);
      pendingRef.current.reject(new Error('Execution terminated'));
      pendingRef.current = null;
    }
    recreate();
  }, [recreate]);

  const execute = useCallback(
    (
      code: string,
      timeout: number,
      traceLimits?: TraceLimits,
      check?: SandboxCheck,
      guard?: LoopGuard
    ): Promise<SandboxExecutionResult> => {
      // Terminate any pending execution
      if (pendingRef.current) terminate();

      return new Promise((resolve, reject) => {
        if (!iframeRef.current) {
          reject(new Error('Sandbox iframe not available'));
          return;
        }

        const runId = ++runIdRef.current;

        const timeoutId = setTimeout(() => {
          if (pendingRef.current?.runId !== runId) return;
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
          // The sandbox ends a run itself at `timeout`. This is the backstop for a sandbox
          // that did not answer; the margin covers a background tab, where the browser
          // only wakes the sandbox's timers once a second. A sandbox that did not answer
          // cannot be trusted with the next run, so it is replaced.
          recreate();
        }, timeout + 1500);

        pendingRef.current = { runId, resolve, reject, timeoutId };

        const msg: HostToSandbox = {
          type: 'execute',
          code,
          timeout,
          runId,
          ...(traceLimits
            ? { tracer: { runtime: runtimeSource, name: TRACER_NAME, limits: traceLimits } }
            : {}),
          ...(guard ? { guard } : {}),
          ...(check ? { check } : {}),
        };

        // A fresh iframe takes a moment to load its script: the run waits for it
        const target = iframeRef.current.contentWindow;
        if (readyRef.current && target) target.postMessage(msg, '*');
        else queuedRef.current = msg;
      });
    },
    [terminate, recreate]
  );

  useImperativeHandle(ref, () => ({ execute, terminate }), [execute, terminate]);

  return (
    <iframe
      key={frame.id}
      ref={iframeRef}
      sandbox="allow-scripts"
      srcDoc={frame.srcDoc}
      style={{ display: 'none' }}
      title="Code execution sandbox"
      aria-hidden="true"
    />
  );
});

SandboxFrame.displayName = 'SandboxFrame';

export default SandboxFrame;
