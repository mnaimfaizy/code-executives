/**
 * Test support: the real sandbox script, evaluated in the test's own window, as
 * `sandboxRuntime.test.ts` does (jsdom does not run the scripts of an iframe's srcdoc).
 * The window is its own parent here, so the script's reports arrive on the same window.
 */

import { runtimeSource, TRACER_NAME } from '../tracer';
import { SANDBOX_RUNTIME_SOURCE } from '../components/execution/sandboxRuntime';
import { CHECK_TRACE_LIMITS } from './runChecks';
import type { CheckReport, SandboxCheck } from './types';

let installed = false;
let nextRunId = 1_000_000;

/** Evaluate the sandbox script once per test file. Call it in `beforeAll`. */
export function installSandbox(): void {
  if (installed) return;
  installed = true;
  // The script locks the network APIs for good, which is right in the iframe but
  // would stop the test environment from tearing its window down
  const defineProperty = Object.defineProperty;
  Object.defineProperty = ((target: object, key: PropertyKey, descriptor: PropertyDescriptor) =>
    defineProperty(target, key, { ...descriptor, configurable: true })) as typeof defineProperty;
  try {
    (0, eval)(SANDBOX_RUNTIME_SOURCE);
  } finally {
    Object.defineProperty = defineProperty;
  }
}

export interface CheckRunReport {
  type: 'result' | 'error';
  check: CheckReport;
  entries: Array<{ type: string; args: string[] }>;
  trace: unknown;
}

/** Send one check run to the sandbox script and wait for its whole report. */
export function sendCheck(
  instrumentedCode: string,
  check: SandboxCheck,
  limits = CHECK_TRACE_LIMITS
): Promise<CheckRunReport> {
  const runId = ++nextRunId;
  return new Promise((resolve) => {
    const onMessage = (event: MessageEvent): void => {
      const data = event.data as (Partial<CheckRunReport> & { runId?: number }) | null;
      if (!data || data.runId !== runId) return;
      if (data.type !== 'result' && data.type !== 'error') return;
      window.removeEventListener('message', onMessage);
      resolve(data as CheckRunReport);
    };
    window.addEventListener('message', onMessage);
    window.postMessage(
      {
        type: 'execute',
        code: instrumentedCode,
        timeout: 2_000,
        runId,
        tracer: { runtime: runtimeSource, name: TRACER_NAME, limits },
        check,
      },
      '*'
    );
  });
}

/** The `run` argument of `runChecks`, backed by the real sandbox script. */
export async function runCheckInSandbox(
  instrumentedCode: string,
  check: SandboxCheck
): Promise<CheckReport> {
  return (await sendCheck(instrumentedCode, check)).check;
}
