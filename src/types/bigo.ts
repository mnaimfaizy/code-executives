// Big-O Notation Module Type Definitions

export type ComplexityType =
  | 'O(1)'
  | 'O(log n)'
  | 'O(n)'
  | 'O(n log n)'
  | 'O(n²)'
  | 'O(n³)'
  | 'O(2^n)'
  | 'O(n!)';

export type ComplexityClass =
  | 'constant'
  | 'logarithmic'
  | 'linear'
  | 'linearithmic'
  | 'quadratic'
  | 'cubic'
  | 'exponential'
  | 'factorial';

export interface ComplexityResult {
  timeComplexity: ComplexityType;
  spaceComplexity: ComplexityType;
  operations: number;
  explanation: string;
  optimizationSuggestions: string[];
  confidence: number; // 0-1, how confident the analysis is
}

export interface PerformanceDataPoint {
  inputSize: number;
  operations: number;
  timeMs: number;
  complexity: ComplexityType;
}

export interface AlgorithmDescription {
  name: string;
  description: string;
  timeComplexity: ComplexityType;
  spaceComplexity: ComplexityType;
  code?: string;
  category: string;
}

export interface ComparisonResult {
  algorithms: AlgorithmDescription[];
  winner: AlgorithmDescription;
  explanation: string;
  performanceData: PerformanceDataPoint[][];
}

// Base visualization props
export interface BaseBigOVisualizationProps {
  isActive?: boolean;
  inputSize?: number;
  showComplexity?: boolean;
  animationSpeed?: number;
  interactive?: boolean;
  metaphor?: string;
  className?: string;
  onComplexityChange?: (complexity: ComplexityType) => void;
  onAnimationComplete?: () => void;
}

// Metaphor-specific props
export interface MetaphorProps extends BaseBigOVisualizationProps {
  complexity: ComplexityType;
  isAnimating: boolean;
  showExplanation?: boolean;
}

// Complexity graph props
export interface ComplexityGraphProps extends BaseBigOVisualizationProps {
  complexities: ComplexityType[];
  maxInputSize?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  colors?: Record<ComplexityType, string>;
}

// Growth comparison props
export interface GrowthComparisonProps extends BaseBigOVisualizationProps {
  algorithm1: AlgorithmDescription;
  algorithm2: AlgorithmDescription;
  inputRange?: [number, number];
}

// Algorithm simulator props
export interface AlgorithmSimulatorProps extends BaseBigOVisualizationProps {
  algorithm: AlgorithmDescription;
  inputData?: unknown[];
  stepByStep?: boolean;
  onStep?: (step: number, data: unknown[]) => void;
}

// Complexity calculator props
export interface ComplexityCalculatorProps {
  code?: string;
  algorithm?: AlgorithmDescription;
  onResult?: (result: ComplexityResult) => void;
  showAdvanced?: boolean;
}

// Interactive components
export interface CodeAnalyzerProps {
  initialCode?: string;
  language?: 'javascript' | 'python' | 'java' | 'cpp';
  onAnalysisComplete?: (result: ComplexityResult) => void;
}

export interface AlgorithmComparerProps {
  algorithms: AlgorithmDescription[];
  onComparisonComplete?: (result: ComparisonResult) => void;
}

export interface PerformanceProfilerProps {
  algorithm: AlgorithmDescription;
  inputSizes?: number[];
  onProfileComplete?: (data: PerformanceDataPoint[]) => void;
}

export interface OptimizationCoachProps {
  code: string;
  currentComplexity: ComplexityResult;
  onSuggestionSelect?: (suggestion: string) => void;
}

// Shared component props
export interface ComplexityIndicatorProps {
  complexity: ComplexityType;
  showExplanation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export interface AnimationControlsProps {
  isPlaying: boolean;
  speed: number;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onSpeedChange?: (speed: number) => void;
  minSpeed?: number;
  maxSpeed?: number;
}

export interface InteractiveSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label?: string;
  onChange?: (value: number) => void;
  showValue?: boolean;
  logarithmic?: boolean;
}

export interface EducationalTooltipProps {
  content: string;
  complexity?: ComplexityType;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  showIcon?: boolean;
}

// Section component props
export interface BigOSectionProps {
  isActive?: boolean;
  onNavigate?: (sectionId: string) => void;
  userProgress?: Record<string, boolean>;
}

// Page component props
export interface BigOPageProps {
  initialSection?: string;
  showProgress?: boolean;
}

// Utility types
export interface ComplexityFunction {
  (n: number): number;
}

export interface ComplexityMapping {
  [key: string]: {
    function: ComplexityFunction;
    color: string;
    metaphor: string;
    description: string;
  };
}

// Animation types
export interface ComplexityAnimation {
  type: 'growth' | 'comparison' | 'metaphor' | 'optimization';
  duration: number;
  easing?: string;
  data?: Record<string, unknown>;
}

export interface AnimationQueueItem {
  animation: ComplexityAnimation;
  resolve: () => void;
  reject: (error: Error) => void;
}

// Error types
export class ComplexityAnalysisError extends Error {
  public code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ComplexityAnalysisError';
    this.code = code;
  }
}

// Constants
export const COMPLEXITY_COLORS: Record<ComplexityType, string> = {
  'O(1)': '#3B82F6', // Blue
  'O(log n)': '#10B981', // Green
  'O(n)': '#F59E0B', // Orange
  'O(n log n)': '#8B5CF6', // Purple
  'O(n²)': '#EF4444', // Red
  'O(n³)': '#DC2626', // Dark Red
  'O(2^n)': '#7F1D1D', // Very Dark Red
  'O(n!)': '#000000', // Black
};

export const COMPLEXITY_METAPHORS: Record<ComplexityType, string> = {
  'O(1)': 'teleporter',
  'O(log n)': 'librarian',
  'O(n)': 'conveyor-belt',
  'O(n log n)': 'clever-sorter',
  'O(n²)': 'thorough-turtle',
  'O(n³)': 'triple-trouble',
  'O(2^n)': 'population-explosion',
  'O(n!)': 'combinatorial-explosion',
};

export const DEFAULT_INPUT_SIZES = [10, 50, 100, 500, 1000, 5000, 10000];
export const MAX_SAFE_INPUT_SIZE = 100000;
