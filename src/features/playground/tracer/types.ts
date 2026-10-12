/**
 * A trace: the record of one run of the learner's code (ADR 0004).
 *
 * Pure data. A trace crosses `postMessage` from the sandbox, so everything here survives
 * `structuredClone` and JSON.
 */

import type { Snapshot } from '../../../shared/snapshot';

/**
 * - `statement`: one statement ran; `line` is that statement.
 * - `call`: a frame was pushed; `line` is the statement that made the call, or the function's
 *   own first line when the engine called it later (a timer or a promise reaction).
 * - `return`: a frame is about to be popped; `line` is the last statement that ran in it.
 *   The script's own end is the exception: when callbacks are still waiting, its step is
 *   recorded once the global frame is gone, so it shows the empty stack they wait for.
 */
export type StepKind = 'statement' | 'call' | 'return';

export interface Step {
  /** Everything as it was once `line` had run. Never changed by what the run does later. */
  snapshot: Snapshot;
  /** 1-based line in the learner's own source. */
  line: number;
  /** Entity ids this step created and slot keys (`slotKey`) it changed, derived, never authored. */
  focus: string[];
  kind: StepKind;
  /** How many Console entries had been printed when this step was recorded. */
  consoleLength: number;
  /** True when the heap held more objects than `maxHeapObjects`, so some are missing. */
  truncated: boolean;
  /**
   * The queue entry that started to run at this step: the step pushed its callback's frame, or
   * continued its async function. The entry left its region in this same step.
   */
  entryId?: string;
  /** True when a region held more entries than `maxQueueEntries`, so the last ones are missing. */
  queuesTruncated?: boolean;
}

export type TraceOutcome = 'completed' | 'step-limit' | 'error';

export interface TraceError {
  message: string;
  /** 1-based line in the learner's own source, when it is known. */
  line?: number;
}

export interface Trace {
  steps: Step[];
  outcome: TraceOutcome;
  error?: TraceError;
  /**
   * Set when the engine ran a callback the tracer's model of the queues did not expect next
   * (ADR 0004: the queues are a model of the specification, not the engine's own). The steps
   * and the Console are still what really happened; the three regions may be wrong for this run.
   */
  queuesApproximate?: true;
}

/** What bounds a trace. Plain numbers, so the limits can be sent to the sandbox. */
export interface TraceLimits {
  /** The run is stopped once this many steps are recorded, or as many loop turns pass without one. */
  maxSteps: number;
  /** Slots drawn per frame or object; the rest collapse into one final `…` slot. */
  maxSlots: number;
  /** Characters of a string value shown before it is cut with `…`. */
  maxStringLength: number;
  /** Heap objects per snapshot; past this the step is marked `truncated`. */
  maxHeapObjects: number;
  /** Entries per region (`microtasks`, `tasks`, `timers`); past this the step is `queuesTruncated`. */
  maxQueueEntries: number;
}

export type TraceOptions = Partial<TraceLimits>;

export const DEFAULT_MAX_STEPS = 2000;
export const MAX_SLOTS = 20;
export const MAX_STRING_LENGTH = 40;
export const MAX_HEAP_OBJECTS = 60;
export const MAX_QUEUE_ENTRIES = 20;

export const DEFAULT_TRACE_LIMITS: TraceLimits = {
  maxSteps: DEFAULT_MAX_STEPS,
  maxSlots: MAX_SLOTS,
  maxStringLength: MAX_STRING_LENGTH,
  maxHeapObjects: MAX_HEAP_OBJECTS,
  maxQueueEntries: MAX_QUEUE_ENTRIES,
};

/** The slot value of a variable that is declared but still in its temporal dead zone. */
export const UNINITIALISED = 'uninit';
/** The name of the final slot that stands for the slots past `maxSlots`. */
export const MORE_SLOTS = '…';

const positive = (value: number | undefined, fallback: number) =>
  value !== undefined && Number.isFinite(value) && value >= 1 ? Math.floor(value) : fallback;

/** Fills in the default limits. The result is what `createTracer` takes. */
export function resolveTraceLimits(options: TraceOptions = {}): TraceLimits {
  return {
    maxSteps: positive(options.maxSteps, DEFAULT_MAX_STEPS),
    maxSlots: positive(options.maxSlots, MAX_SLOTS),
    maxStringLength: positive(options.maxStringLength, MAX_STRING_LENGTH),
    maxHeapObjects: positive(options.maxHeapObjects, MAX_HEAP_OBJECTS),
    maxQueueEntries: positive(options.maxQueueEntries, MAX_QUEUE_ENTRIES),
  };
}
