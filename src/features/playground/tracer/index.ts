export type {
  Step,
  StepKind,
  Trace,
  TraceError,
  TraceLimits,
  TraceOptions,
  TraceOutcome,
} from './types';
export {
  DEFAULT_MAX_STEPS,
  DEFAULT_TRACE_LIMITS,
  MAX_HEAP_OBJECTS,
  MAX_QUEUE_ENTRIES,
  MAX_SLOTS,
  MAX_STRING_LENGTH,
  MORE_SLOTS,
  UNINITIALISED,
  resolveTraceLimits,
} from './types';
export type { InstrumentResult } from './instrument';
export { instrument, TRACER_NAME } from './instrument';
export type { GuardResult, LoopGuard, LoopGuardCounter } from './loopGuard';
export {
  LOOP_GUARD_LIMIT,
  LoopGuardStop,
  createLoopGuard,
  guardLoops,
  loopGuardMessage,
} from './loopGuard';
export type { Getter, ScopeHandle, Tracer, TracerHooks } from './runtime';
export { createTracer, runtimeSource } from './runtime';
export type { TraceRun } from './trace';
export { startTrace, traceSync } from './trace';
