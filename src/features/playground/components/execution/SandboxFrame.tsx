import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { ConsoleEntry, ConsoleEntryType, StateSnapshot } from '../../types';

/** Messages sent from host → sandbox iframe */
interface HostToSandbox {
  type: 'execute';
  code: string;
  nonce: string;
  timeout: number;
}

/** Messages sent from sandbox iframe → host */
interface SandboxToHost {
  type: 'console' | 'result' | 'error' | 'ready' | 'timeline';
  entries?: Array<{ type: ConsoleEntryType; args: string[] }>;
  error?: string;
  line?: number;
  column?: number;
  snapshots?: StateSnapshot[];
  totalSteps?: number;
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
<script nonce="${nonce}">
(function() {
  'use strict';

  // Block network APIs with helpful error messages
  function blockedNetwork(name) {
    return function() {
      throw new Error(name + ' is blocked in the sandbox for security. Network access is not allowed.');
    };
  }
  Object.defineProperty(window, 'fetch', { get: blockedNetwork('fetch'), configurable: false });
  Object.defineProperty(window, 'XMLHttpRequest', { get: blockedNetwork('XMLHttpRequest'), configurable: false });
  Object.defineProperty(window, 'WebSocket', { get: blockedNetwork('WebSocket'), configurable: false });
  Object.defineProperty(window, 'EventSource', { get: blockedNetwork('EventSource'), configurable: false });

  // Block additional dangerous APIs
  Object.defineProperty(window, 'importScripts', { get: blockedNetwork('importScripts'), configurable: false });
  window.open = blockedNetwork('window.open');
  navigator.sendBeacon = blockedNetwork('navigator.sendBeacon');

  // Capture real parent reference for postMessage before we lock it down
  var _hostWindow = window.parent;

  // Block access to parent/opener (defense-in-depth beyond sandbox attr)
  try { Object.defineProperty(window, 'parent', { get: function() { return window; }, configurable: false }); } catch(e) {}
  try { Object.defineProperty(window, 'top', { get: function() { return window; }, configurable: false }); } catch(e) {}
  try { Object.defineProperty(window, 'opener', { get: function() { return null; }, configurable: false }); } catch(e) {}

  var entries = [];
  var MAX_ENTRIES = 500;
  var MAX_ENTRY_LENGTH = 10240;

  function safeStringify(val) {
    if (val === undefined) return 'undefined';
    if (val === null) return 'null';
    if (typeof val === 'function') return val.toString();
    if (typeof val === 'symbol') return val.toString();
    try {
      var seen = new WeakSet();
      return JSON.stringify(val, function(key, value) {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return '[Circular]';
          seen.add(value);
        }
        if (typeof value === 'bigint') return value.toString() + 'n';
        return value;
      }, 2);
    } catch (e) {
      return String(val);
    }
  }

  function truncate(str) {
    if (str.length > MAX_ENTRY_LENGTH) return str.slice(0, MAX_ENTRY_LENGTH) + '... (truncated)';
    return str;
  }

  function captureConsole(type) {
    return function() {
      if (entries.length >= MAX_ENTRIES) return;
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args.push(truncate(safeStringify(arguments[i])));
      }
      entries.push({ type: type, args: args });
    };
  }

  console.log = captureConsole('log');
  console.warn = captureConsole('warn');
  console.error = captureConsole('error');
  console.info = captureConsole('info');

  window.addEventListener('message', function(event) {
    var msg = event.data;
    if (!msg || msg.type !== 'execute') return;

    entries = [];
    var timeoutId = null;

    try {
      // Set execution timeout
      var timedOut = false;
      timeoutId = setTimeout(function() {
        timedOut = true;
        _hostWindow.postMessage({
          type: 'error',
          error: 'Execution timed out (exceeded ' + (msg.timeout / 1000) + 's limit)',
          entries: entries
        }, '*');
      }, msg.timeout);

      // Execute user code
      var fn = new Function(msg.code);
      fn();

      // Allow microtasks to drain, then report
      Promise.resolve().then(function() {
        if (timedOut) return;
        clearTimeout(timeoutId);

        // Wait for any pending macrotasks (setTimeout with 0) briefly
        setTimeout(function() {
          if (timedOut) return;
          // If instrumented code injected a __tracker__, include its snapshots
          var snapshots = null;
          var totalSteps = 0;
          if (typeof __tracker__ !== 'undefined') {
            try {
              snapshots = __tracker__.getSnapshots();
              totalSteps = __tracker__.getStepCount();
            } catch(e) { /* tracker may not be available */ }
          }
          _hostWindow.postMessage({
            type: 'result',
            entries: entries,
            snapshots: snapshots,
            totalSteps: totalSteps
          }, '*');
        }, 50);
      });
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      var errorMsg = err instanceof Error ? err.message : String(err);
      var errorLine = err instanceof Error && err.stack
        ? parseInt((err.stack.match(/<anonymous>:(\\d+)/) || [])[1] || '0', 10)
        : undefined;

      entries.push({ type: 'error', args: [errorMsg] });
      _hostWindow.postMessage({
        type: 'error',
        error: errorMsg,
        line: errorLine,
        entries: entries
      }, '*');
    }
  });

  _hostWindow.postMessage({ type: 'ready' }, '*');
})();
</script>
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
  /** Timeline snapshots from instrumented execution (if __tracker__ was present) */
  snapshots?: StateSnapshot[];
  totalSteps?: number;
}

export interface SandboxFrameHandle {
  execute: (code: string, timeout: number) => Promise<SandboxExecutionResult>;
  terminate: () => void;
}

const SandboxFrame = forwardRef<SandboxFrameHandle>((_props, ref) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const pendingRef = useRef<{
    resolve: (value: SandboxExecutionResult) => void;
    reject: (err: Error) => void;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);
  const nonceRef = useRef(generateNonce());

  const parseEntries = useCallback(
    (rawEntries?: Array<{ type: ConsoleEntryType; args: string[] }>): ConsoleEntry[] => {
      if (!rawEntries) return [];
      return rawEntries.map((entry, index) => ({
        id: `${Date.now()}-${index}`,
        type: entry.type,
        args: entry.args,
        timestamp: Date.now(),
      }));
    },
    []
  );

  const handleMessage = useCallback(
    (event: MessageEvent): void => {
      // Only accept messages from our sandbox iframe
      const iframe = iframeRef.current;
      if (!iframe || event.source !== iframe.contentWindow) return;

      const data = event.data as SandboxToHost;
      if (!data || !data.type) return;

      if (data.type === 'result' || data.type === 'error') {
        const pending = pendingRef.current;
        if (pending) {
          clearTimeout(pending.timeoutId);
          pending.resolve({
            entries: parseEntries(data.entries),
            error: data.type === 'error' ? data.error : undefined,
            snapshots: data.snapshots ?? undefined,
            totalSteps: data.totalSteps ?? undefined,
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
    // Recreate the iframe to kill any running code
    nonceRef.current = generateNonce();
  }, []);

  const execute = useCallback(
    (code: string, timeout: number): Promise<SandboxExecutionResult> => {
      // Terminate any pending execution
      if (pendingRef.current) terminate();

      return new Promise((resolve, reject) => {
        const iframe = iframeRef.current;
        if (!iframe?.contentWindow) {
          reject(new Error('Sandbox iframe not available'));
          return;
        }

        const timeoutId = setTimeout(() => {
          if (pendingRef.current) {
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
        }, timeout + 200); // Small buffer over the iframe's internal timeout

        pendingRef.current = { resolve, reject, timeoutId };

        const msg: HostToSandbox = {
          type: 'execute',
          code,
          nonce: nonceRef.current,
          timeout,
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
