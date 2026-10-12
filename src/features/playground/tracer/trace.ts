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
  /** The trace once no task and no timer is left. Timers take no real time in a traced run. */
  finished: Promise<Trace>;
}

/** Starts a run and returns as soon as its synchronous part has ended. */
export function startTrace(code: string, options: TraceOptions = {}): TraceRun {
  const printed: string[] = [];
  const instrumented = instrument(code);
  if (!instrumented.ok) {
    const trace: Trace = { steps: [], outcome: 'error', error: instrumented.error };
    return { getTrace: () => trace, console: printed, finished: Promise.resolve(trace) };
  }

  let settle: (trace: Trace) => void = () => {};
  const finished = new Promise<Trace>((resolve) => {
    settle = resolve;
  });
  const tracer = createTracer(resolveTraceLimits(options), () => printed.length, {
    // Looked up at each turn, so a test's fake timers drive the event loop too.
    defer: (turn) => {
      if (typeof setImmediate === 'function') setImmediate(turn);
      else setTimeout(turn, 0);
    },
    settled: () => settle(tracer.getTrace()),
  });
  const print = (...args: unknown[]) => {
    printed.push(args.map((arg) => (typeof arg === 'string' ? arg : String(arg))).join(' '));
  };
  const fakeConsole = { log: print, info: print, warn: print, error: print, debug: print };

  try {
    new Function(TRACER_NAME, 'console', instrumented.code)(tracer, fakeConsole);
  } catch (error) {
    tracer.fail(error);
  }
  return { getTrace: () => tracer.getTrace(), console: printed, finished };
}

/** Traces the synchronous part of `code`. Work left to timers and promises is not waited for. */
export function traceSync(code: string, options: TraceOptions = {}): Trace {
  return startTrace(code, options).getTrace();
}
