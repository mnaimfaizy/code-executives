// Core types for RxJS visualization components

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

export interface OperatorConfig {
  name: string;
  displayName: string;
  description: string;
  example: string;
  category: 'creation' | 'transformation' | 'filtering' | 'combination' | 'utility';
  parameters?: OperatorParameter[];
}

export interface OperatorParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'function';
  defaultValue: string | number | boolean;
  description: string;
  required: boolean;
}

export interface PlaygroundState {
  sourceStream: MarbleStream;
  operators: AppliedOperator[];
  resultStream: MarbleStream;
  isPlaying: boolean;
  currentTime: number;
  speed: number;
}

export interface AppliedOperator {
  id: string;
  config: OperatorConfig;
  parameters: Record<string, string | number | boolean>;
  enabled: boolean;
}

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  code: string;
  expectedOutput: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  marbleInput?: string;
  expectedOutput?: string;
  explanation: string;
  hints?: string[];
}
