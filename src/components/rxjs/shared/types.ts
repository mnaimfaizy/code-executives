// Core types for the RxJS marble diagram tool

export interface MarbleEvent {
  id: string;
  value: string | number | boolean | null;
  time: number;
  type: 'next' | 'complete' | 'error';
  color?: string;
}

export interface MarbleStream {
  id: string;
  name: string;
  events: MarbleEvent[];
  duration: number;
  isComplete: boolean;
  hasError: boolean;
}

export type OperatorName = 'map' | 'filter' | 'take' | 'skip' | 'distinctUntilChanged';

/** One entry of an operator's fixed list of choices. */
export interface OperatorChoice {
  id: string;
  label: string;
}

export interface OperatorConfig {
  name: OperatorName;
  displayName: string;
  description: string;
  category: 'transformation' | 'filtering';
  /** A fixed list to pick from (map, filter). The first entry is the default. */
  choices?: { label: string; options: OperatorChoice[] };
  /** A whole number of values (take, skip). */
  count?: { label: string; defaultValue: number };
}

/** An operator the learner has added to the chain. */
export interface AppliedOperator {
  id: string;
  name: OperatorName;
  /** Id of the picked `OperatorChoice`, for operators with `choices`. */
  choice?: string;
  /** For operators with `count`. */
  count?: number;
}
