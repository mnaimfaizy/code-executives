// Core Playground Types — Phase 0
// These types define the new standalone Playground feature module.

/** Supported languages in the Playground editor */
export type PlaygroundLanguage = 'javascript' | 'typescript' | 'python';

/** Available visualization lenses */
export type VisualizationLens = 'stack-heap' | 'none';

/** Execution lifecycle states */
export type ExecutionState = 'idle' | 'running' | 'paused' | 'stepping' | 'completed' | 'error';

/** Console log entry types */
export type ConsoleEntryType = 'log' | 'warn' | 'error' | 'info';

/** A single console output entry */
export interface ConsoleEntry {
  id: string;
  type: ConsoleEntryType;
  args: unknown[];
  timestamp: number;
  /** Line of the learner's source an error came from (1-based), when it is known */
  line?: number;
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

/** Default execution timeout (10 seconds) */
export const DEFAULT_EXECUTION_TIMEOUT_MS = 10_000;
