// Next.js Types and Interfaces
// Following Code Executives TypeScript standards

export interface NextJSElement {
  id: string;
  type: 'component' | 'route' | 'request' | 'response' | 'cache' | 'middleware';
  position?: { x: number; y: number };
  highlighted?: boolean;
  color?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface NextJSOperation {
  type: 'render' | 'fetch' | 'cache' | 'hydrate' | 'navigate' | 'mutate';
  target?: string;
  value?: string | number;
  description: string;
  strategy?: 'ssr' | 'ssg' | 'csr' | 'isr';
  performance?: {
    lcp: number;
    inp: number;
    cls: number;
  };
}

export interface NextJSAnimationStep {
  id: string;
  description: string;
  duration: number;
  elements: NextJSElement[];
  highlightedElements?: string[];
  activeOperation?: string;
  phase?: 'request' | 'render' | 'hydrate' | 'interactive';
}

export interface NextJSVisualizationState<T = NextJSElement> {
  data: T[];
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  isCompleted: boolean;
  speed: number;
  history: T[][];
  operations: NextJSOperation[];
  currentStrategy: 'ssr' | 'ssg' | 'csr' | 'isr';
}

export interface BaseNextJSVisualizationProps {
  isActive?: boolean;
  data?: NextJSElement[];
  onDataChange?: (newData: NextJSElement[]) => void;
  animationSpeed?: number;
  showPerformance?: boolean;
  interactive?: boolean;
  autoPlay?: boolean;
  className?: string;
  onOperationComplete?: (operation: NextJSOperation) => void;
}

// Routing specific types
export interface RouteElement extends NextJSElement {
  path: string;
  component: string;
  layout?: string;
  isDynamic?: boolean;
  isNested?: boolean;
}

export interface RouterState {
  currentRoute: string;
  history: string[];
  params: Record<string, string>;
  query: Record<string, string>;
  isLoading: boolean;
}

// Rendering specific types
export interface RenderElement extends NextJSElement {
  strategy: 'ssr' | 'ssg' | 'csr' | 'isr';
  phase: 'server' | 'client' | 'hydration';
  isStreaming?: boolean;
  chunks?: string[];
}

export interface RenderingTimeline {
  startTime: number;
  phases: {
    name: string;
    start: number;
    end: number;
    duration: number;
  }[];
  metrics: {
    lcp: number;
    inp: number;
    cls: number;
  };
}

// Component specific types
export interface ComponentElement extends NextJSElement {
  componentType: 'server' | 'client' | 'shared';
  props: Record<string, string | number | boolean | null | undefined>;
  state?: Record<string, string | number | boolean | null | undefined>;
  children?: string[];
  parent?: string;
}

export interface ComponentTree {
  root: string;
  nodes: Record<string, ComponentElement>;
  serverComponents: string[];
  clientComponents: string[];
  sharedComponents: string[];
}

// Data fetching specific types
export interface FetchElement extends NextJSElement {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  isCached: boolean;
  cacheKey?: string;
  responseTime: number;
  data?: Record<string, unknown>;
}

export interface DataFlow {
  requests: FetchElement[];
  cache: Record<string, Record<string, unknown>>;
  mutations: NextJSOperation[];
  isMemoized: boolean;
}

// Performance specific types
export interface PerformanceMetrics {
  lcp: number;
  inp: number;
  cls: number;
  fcp: number;
  ttfb: number;
  bundleSize: number;
  hydrationTime: number;
}

export interface CoreWebVitals {
  lcp: {
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    unit: 'ms';
  };
  inp: {
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    unit: 'ms';
  };
  cls: {
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    unit: '';
  };
}

// Educational content types
export interface NextJSLearningObjective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  section: 'routing' | 'rendering' | 'components' | 'data' | 'middleware' | 'optimization';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface NextJSCodeExample {
  id: string;
  title: string;
  language: 'javascript' | 'typescript';
  code: string;
  explanation: string;
  highlightedLines?: number[];
  runnable?: boolean;
  output?: string;
}

export interface NextJSQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  strategy?: 'ssr' | 'ssg' | 'csr' | 'isr';
}

// Component Props interfaces
export interface RoutingFlowVisualizationProps extends BaseNextJSVisualizationProps {
  routerType: 'pages' | 'app';
  showLayouts?: boolean;
  showNestedRoutes?: boolean;
}

export interface RenderingTimelineVisualizationProps extends BaseNextJSVisualizationProps {
  strategy: 'ssr' | 'ssg' | 'csr' | 'isr';
  showMetrics?: boolean;
  showStreaming?: boolean;
}

export interface ComponentTreeVisualizationProps extends BaseNextJSVisualizationProps {
  showComposition?: boolean;
  highlightServerComponents?: boolean;
  showHydration?: boolean;
}

export interface DataFlowVisualizationProps extends BaseNextJSVisualizationProps {
  showCaching?: boolean;
  showMutations?: boolean;
  showMemoization?: boolean;
}

export interface PerformanceMetricsVisualizationProps extends BaseNextJSVisualizationProps {
  metrics: PerformanceMetrics;
  showComparison?: boolean;
  targetMetrics?: Partial<PerformanceMetrics>;
}

// Control panel types
export interface NextJSControlPanelProps {
  operations: string[];
  onOperation: (operation: string, ...args: (string | number | boolean)[]) => void;
  canUndo: boolean;
  canRedo: boolean;
  canPlay: boolean;
  canPause: boolean;
  canReset: boolean;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onStepChange: (step: number) => void;
  currentStrategy?: 'ssr' | 'ssg' | 'csr' | 'isr';
  onStrategyChange?: (strategy: 'ssr' | 'ssg' | 'csr' | 'isr') => void;
}

// Historical timeline types
export interface NextJSMilestone {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  features: string[];
  impact: 'major' | 'minor' | 'patch';
  category: 'routing' | 'rendering' | 'performance' | 'features' | 'architecture';
}

export interface NextJSHistoricalTimeline {
  milestones: NextJSMilestone[];
  currentVersion: string;
  totalVersions: number;
}

// Configuration types
export interface NextJSConfig {
  routerType: 'pages' | 'app';
  renderingStrategy: 'ssr' | 'ssg' | 'csr' | 'isr';
  showPerformance: boolean;
  showComplexity: boolean;
  animationSpeed: number;
  colorScheme: 'default' | 'colorblind' | 'dark' | 'light';
  language: 'javascript' | 'typescript';
  theme: 'nextjs' | 'custom';
}

// Theme types
export interface NextJSVisualizationTheme {
  colors: {
    server: string;
    client: string;
    route: string;
    cache: string;
    middleware: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
  };
  fonts: {
    primary: string;
    code: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  animations: {
    fast: number;
    medium: number;
    slow: number;
  };
}

// Animation types
export type NextJSAnimationType =
  | 'slide-in'
  | 'slide-out'
  | 'highlight'
  | 'fade'
  | 'scale'
  | 'connect'
  | 'disconnect'
  | 'hydrate'
  | 'stream'
  | 'cache-hit'
  | 'cache-miss';

export interface NextJSAnimation {
  id: string;
  type: NextJSAnimationType;
  target: string;
  duration: number;
  delay?: number;
  easing?: string;
  properties?: Record<string, string | number | boolean>;
}

// Interaction types
export interface NextJSInteractionEvent {
  type: 'click' | 'hover' | 'strategy-change' | 'step-navigate';
  target: string;
  data?: NextJSElement[];
  position?: { x: number; y: number };
  strategy?: 'ssr' | 'ssg' | 'csr' | 'isr';
  step?: number;
}
