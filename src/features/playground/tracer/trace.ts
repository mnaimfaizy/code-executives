/**
 * Runs a trace in this realm, without the sandbox: instrument, run through `new Function`,
 * read the trace. Tests use it; the Playground runs the same two halves inside its iframe.
 */

import { instrument, TRACER_NAME } from './instrument';
import { createTracer } from './runtime';
import { resolveTraceLimits } from './types';
import type { Trace, TraceOptions } from './types';

export interface TraceRun {
  /** The trace so far. Call it again once timers and promises have had time to run. */
  getTrace(): Trace;
  /** What the code printed, one string per Console entry. */
  console: string[];
}

type Callback = (...args: unknown[]) => unknown;

/** Starts a run and returns as soon as its synchronous part has ended. */
export function startTrace(code: string, options: TraceOptions = {}): TraceRun {
  const printed: string[] = [];
  const instrumented = instrument(code);
  if (!instrumented.ok) {
    const trace: Trace = { steps: [], outcome: 'error', error: instrumented.error };
    return { getTrace: () => trace, console: printed };
  }

  const tracer = createTracer(resolveTraceLimits(options), () => printed.length);
  const print = (...args: unknown[]) => {
    printed.push(args.map((arg) => (typeof arg === 'string' ? arg : String(arg))).join(' '));
  };
  const fakeConsole = { log: print, info: print, warn: print, error: print, debug: print };
  // A callback the engine runs later has no caller to throw to, so its error ends the trace here.
  const guarded =
    (callback: Callback): Callback =>
    (...args) => {
      try {
        return callback(...args);
      } catch (error) {
        tracer.fail(error);
      }
    };
  const later = (callback: Callback, delay?: number, ...args: unknown[]) =>
    setTimeout(guarded(callback), delay, ...args);
  const repeat = (callback: Callback, delay?: number, ...args: unknown[]) =>
    setInterval(guarded(callback), delay, ...args);
  const microtask = (callback: Callback) => queueMicrotask(guarded(callback));

  try {
    new Function(
      TRACER_NAME,
      'console',
      'setTimeout',
      'setInterval',
      'queueMicrotask',
      instrumented.code
    )(tracer, fakeConsole, later, repeat, microtask);
  } catch (error) {
    tracer.fail(error);
  }
  return { getTrace: () => tracer.getTrace(), console: printed };
}

/** Traces the synchronous part of `code`. Work left to timers and promises is not waited for. */
export function traceSync(code: string, options: TraceOptions = {}): Trace {
  return startTrace(code, options).getTrace();
}
