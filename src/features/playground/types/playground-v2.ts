// Core Playground Types — Phase 0
// These types define the new standalone Playground feature module.

/** Supported languages in the Playground editor */
export type PlaygroundLanguage = 'javascript' | 'typescript' | 'python';

/** Available visualization lenses */
export type VisualizationLens = 'event-loop' | 'heap-stack' | 'data-structure' | 'stream' | 'none';

/** Execution lifecycle states */
export type ExecutionState = 'idle' | 'running' | 'paused' | 'stepping' | 'completed' | 'error';

/** A single variable captured during execution */
export interface CapturedVariable {
  name: string;
  value: unknown;
  type: string;
}

/** A single call stack frame */
export interface StackFrame {
  functionName: string;
  line: number;
  column?: number;
}

/** Represents a heap-allocated object */
export interface HeapObject {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  refCount?: number;
}

/** A queue entry (microtask or macrotask) */
export interface QueueEntry {
  id: string;
  label: string;
  type: 'microtask' | 'macrotask';
  callback: string;
}

/** A snapshot of execution state at a single step */
export interface StateSnapshot {
  step: number;
  line: number;
  column?: number;
  timestamp: number;
  callStack: StackFrame[];
  variables: CapturedVariable[];
  heapObjects: HeapObject[];
  microtaskQueue: QueueEntry[];
  macrotaskQueue: QueueEntry[];
  consoleOutput: ConsoleEntry[];
}

/** A timeline of execution snapshots */
export interface TimelineEntry {
  snapshots: StateSnapshot[];
  totalSteps: number;
  executionTimeMs: number;
}

/** Console log entry types */
export type ConsoleEntryType = 'log' | 'warn' | 'error' | 'info';

/** A single console output entry */
export interface ConsoleEntry {
  id: string;
  type: ConsoleEntryType;
  args: unknown[];
  timestamp: number;
}

/** Playground configuration state */
export interface PlaygroundConfig {
  language: PlaygroundLanguage;
  lens: VisualizationLens;
  code: string;
  executionState: ExecutionState;
  autoRun: boolean;
  executionTimeoutMs: number;
}

/** Discriminated union for iframe ↔ host postMessage communication */
export type SandboxMessage =
  | { type: 'execute'; code: string; language: PlaygroundLanguage }
  | { type: 'result'; output: ConsoleEntry[]; error?: string }
  | { type: 'timeline'; data: TimelineEntry }
  | { type: 'error'; message: string; line?: number; column?: number }
  | { type: 'ready' }
  | { type: 'terminate' };

/** Default execution timeout (10 seconds) */
export const DEFAULT_EXECUTION_TIMEOUT_MS = 10_000;
