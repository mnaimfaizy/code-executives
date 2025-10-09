// src/types/playground.ts
// TypeScript interfaces for the Visual Algorithm Playground

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp';
export type ComplexityClass =
  | 'O(1)'
  | 'O(1) amortized'
  | 'O(log n)'
  | 'O(n)'
  | 'O(n log n)'
  | 'O(n²)'
  | 'O(n³)'
  | 'O(2^n)'
  | 'O(n!)'
  | 'O(h)'
  | 'O(w)';
export type DataStructureType =
  | 'Array'
  | 'LinkedList'
  | 'Stack'
  | 'Queue'
  | 'HashTable'
  | 'BinaryTree'
  | 'BinarySearchTree'
  | 'AVLTree'
  | 'Heap'
  | 'Graph';

// Test case interface
export interface TestCase {
  id: string;
  input: unknown[];
  expectedOutput: unknown;
  explanation?: string;
  isHidden?: boolean; // Hidden test cases for judging
  timeLimit?: number; // Time limit in milliseconds
  memoryLimit?: number; // Memory limit in MB
}

// Hint system
export interface Hint {
  id: string;
  content: string;
  order: number;
  penalty?: number; // Points deducted for using this hint
  unlocksAfter?: number; // Minutes after problem start
}

// Solution interface
export interface Solution {
  code: { [key in Language]?: string };
  explanation: string;
  timeComplexity: ComplexityClass;
  spaceComplexity: ComplexityClass;
  approaches: SolutionApproach[];
}

export interface SolutionApproach {
  name: string;
  description: string;
  timeComplexity: ComplexityClass;
  spaceComplexity: ComplexityClass;
  code: { [key in Language]?: string };
  visualizationNotes?: string;
}

// Problem definition
export interface PlaygroundProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: 'Data Structures' | 'Algorithms' | 'Big-O Analysis';
  dataStructure?: DataStructureType;
  description: string;
  examples: TestCase[];
  constraints: string[];
  starterCode: { [key in Language]?: string };
  testCases: TestCase[];
  hints: Hint[];
  solution: Solution;
  visualizationOptions: DataStructureType[];
  learningObjectives: string[];
  tags: string[];
  relatedProblems?: string[]; // IDs of related problems
  prerequisites?: string[]; // Required knowledge/concepts
  estimatedSolveTime: number; // Estimated time in minutes
}

// Code execution and instrumentation
export interface InstrumentedOperation {
  id: string;
  type:
    | 'access'
    | 'insert'
    | 'delete'
    | 'search'
    | 'swap'
    | 'compare'
    | 'traverse'
    | 'function-call'
    | 'function-return';
  dataStructure: DataStructureType;
  indices?: number[];
  values?: unknown[];
  timestamp: number;
  lineNumber?: number;
  functionName?: string;
  complexity: {
    time: ComplexityClass;
    space: ComplexityClass;
    explanation: string;
  };
  metadata?: Record<string, unknown>;
}

// Execution result
export interface ExecutionResult {
  success: boolean;
  output: unknown;
  executionTime: number; // in milliseconds
  memoryUsage: number; // in MB
  operations: InstrumentedOperation[];
  error?: {
    type: 'runtime' | 'timeout' | 'memory' | 'syntax';
    message: string;
    lineNumber?: number;
    stackTrace?: string;
  };
}

// Test case result
export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  executionResult: ExecutionResult;
  expectedOutput: unknown;
  actualOutput: unknown;
  executionTime: number;
  memoryUsage: number;
}

// Submission result
export interface SubmissionResult {
  problemId: string;
  userId?: string;
  language: Language;
  code: string;
  overallResult:
    | 'accepted'
    | 'wrong_answer'
    | 'time_limit_exceeded'
    | 'memory_limit_exceeded'
    | 'runtime_error'
    | 'compilation_error';
  testCaseResults: TestCaseResult[];
  totalTests: number;
  passedTests: number;
  executionTime: number; // Total execution time
  memoryUsage: number; // Peak memory usage
  submittedAt: Date;
  hintsUsed: number;
  score: number; // Based on correctness, time, hints used, etc.
}

// Performance analysis
export interface PerformanceAnalysis {
  timeComplexity: {
    best: ComplexityClass;
    average: ComplexityClass;
    worst: ComplexityClass;
    explanation: string;
  };
  spaceComplexity: {
    best: ComplexityClass;
    average: ComplexityClass;
    worst: ComplexityClass;
    explanation: string;
  };
  bottlenecks: string[];
  optimizationSuggestions: string[];
  realWorldApplications: string[];
}

// Visualization mapping
export interface VisualizationMapping {
  problemId: string;
  dataStructure: DataStructureType;
  visualizationComponent: string; // Component name/path
  operationMappings: {
    [operationType: string]: {
      method: string; // Method name on visualization component
      parameters: string[]; // Parameter mapping
      animation?: {
        duration: number;
        easing: string;
      };
    };
  };
  stateMappings: {
    [stateProperty: string]: string; // Maps execution state to visualization props
  };
}

// Playground session state
export interface PlaygroundSession {
  problemId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  code: { [key in Language]?: string };
  currentLanguage: Language;
  selectedVisualization: DataStructureType;
  hintsUsed: number[];
  submissions: SubmissionResult[];
  isCompleted: boolean;
  score: number;
  timeSpent: number; // in minutes
}

// User progress and statistics
export interface UserProgress {
  userId: string;
  solvedProblems: {
    problemId: string;
    bestScore: number;
    attempts: number;
    firstSolvedAt: Date;
    lastAttemptAt: Date;
    timeSpent: number;
    hintsUsed: number;
  }[];
  statistics: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    averageScore: number;
    totalTimeSpent: number;
    currentStreak: number;
    longestStreak: number;
    favoriteDataStructure?: DataStructureType;
    weakestArea?: string;
  };
  achievements: Achievement[];
  preferences: {
    defaultLanguage: Language;
    theme: 'light';
    autoSave: boolean;
    showHints: boolean;
    visualizationSpeed: 'slow' | 'normal' | 'fast';
  };
}

// Achievement system
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'solving' | 'performance' | 'learning' | 'consistency';
  progress?: {
    current: number;
    target: number;
  };
}

// Scoring and Achievements
export interface Score {
  totalPoints: number;
  level: number;
  experiencePoints: number;
  experienceToNextLevel: number;
  achievements: Achievement[];
  stats: {
    problemsSolved: number;
    debugSessions: number;
    timeSpentDebugging: number;
    averageExecutionTime: number;
    bestPerformanceScore: number;
  };
}

export interface ProblemScore {
  problemId: string;
  points: number;
  timeBonus: number;
  efficiencyBonus: number;
  completedAt: Date;
  attempts: number;
  bestTime: number;
  bestComplexity: string;
}
export interface PlaygroundConfig {
  execution: {
    timeLimit: number; // Default time limit in ms
    memoryLimit: number; // Default memory limit in MB
    maxRecursionDepth: number;
    allowedLibraries: string[];
  };
  visualization: {
    defaultSpeed: number;
    maxOperationsPerSecond: number;
    animationDuration: number;
  };
  scoring: {
    basePoints: number;
    timeBonus: number;
    hintPenalty: number;
    difficultyMultiplier: {
      Easy: number;
      Medium: number;
      Hard: number;
    };
  };
  ui: {
    maxHintsPerProblem: number;
    autoSaveInterval: number; // in seconds
    maxCodeLength: number;
  };
}

// Error types for better error handling
export class PlaygroundError extends Error {
  type: 'validation' | 'execution' | 'timeout' | 'security';
  details?: unknown;

  constructor(
    message: string,
    type: 'validation' | 'execution' | 'timeout' | 'security',
    details?: unknown
  ) {
    super(message);
    this.name = 'PlaygroundError';
    this.type = type;
    this.details = details;
  }
}

// Hook return types
export interface UsePlaygroundReturn {
  // Problem state
  currentProblem: PlaygroundProblem | null;
  isLoading: boolean;
  error: string | null;

  // Code state
  code: string;
  language: Language;
  setCode: (code: string) => void;
  setLanguage: (language: Language) => void;

  // Execution state
  isExecuting: boolean;
  executionResult: ExecutionResult | null;
  testResults: TestCaseResult[];
  performanceAnalysis: PerformanceAnalysis | null;

  // Visualization state
  selectedVisualization: DataStructureType;
  setSelectedVisualization: (type: DataStructureType) => void;
  visualizationData: unknown;

  // Actions
  runCode: () => Promise<void>;
  runTests: () => Promise<void>;
  submitSolution: () => Promise<SubmissionResult>;
  resetCode: () => void;
  showHint: (hintId: string) => void;

  // Progress
  session: PlaygroundSession;
  progress: UserProgress;
}

// Component prop types
export interface PlaygroundProps {
  problemId?: string;
  initialLanguage?: Language;
  initialVisualization?: DataStructureType;
  onProblemChange?: (problem: PlaygroundProblem) => void;
  onSubmission?: (result: SubmissionResult) => void;
  className?: string;
}

export interface ProblemDisplayProps {
  problem: PlaygroundProblem;
  showHints?: boolean;
  hintsUsed?: number[];
  onHintClick?: (hintId: string) => void;
  className?: string;
}

export interface CodeEditorProps {
  code: string;
  language: Language;
  onChange: (code: string) => void;
  onLanguageChange: (language: Language) => void;
  starterCode?: { [key in Language]?: string };
  readOnly?: boolean;
  className?: string;
}

export interface VisualizationSelectorProps {
  options: DataStructureType[];
  selected: DataStructureType;
  onSelect: (type: DataStructureType) => void;
  disabled?: boolean;
  className?: string;
}

export interface ExecutionEngineProps {
  code: string;
  language: Language;
  testCases: TestCase[];
  onResult: (result: ExecutionResult) => void;
  onOperation: (operation: InstrumentedOperation) => void;
  timeLimit?: number;
  memoryLimit?: number;
  className?: string;
}

export interface PerformanceAnalyzerProps {
  operations: InstrumentedOperation[];
  testResults: TestCaseResult[];
  problem: PlaygroundProblem;
  onAnalysis: (analysis: PerformanceAnalysis) => void;
  className?: string;
}

export interface TestRunnerProps {
  testCases: TestCase[];
  results: TestCaseResult[];
  isRunning: boolean;
  onRun: () => void;
  onResult: (results: TestCaseResult[]) => void;
  className?: string;
}
