// Data Structures Types and Interfaces
// Following Code Executives TypeScript standards

export interface DataStructureElement {
  id: string;
  value: number | string;
  position?: { x: number; y: number };
  highlighted?: boolean;
  color?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface DataStructureOperation {
  type: 'insert' | 'delete' | 'search' | 'access' | 'traverse' | 'sort' | 'custom';
  target?: string | number;
  value?: number | string;
  index?: number;
  description: string;
  complexity: {
    time: string;
    space: string;
  };
}

export interface AnimationStep {
  id: string;
  description: string;
  duration: number;
  elements: DataStructureElement[];
  highlightedElements?: string[];
  activeOperation?: string;
}

export interface VisualizationState<T = DataStructureElement> {
  data: T[];
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  isCompleted: boolean;
  speed: number;
  history: T[][];
  operations: DataStructureOperation[];
}

export interface BaseVisualizationProps {
  isActive?: boolean;
  data?: DataStructureElement[];
  onDataChange?: (newData: DataStructureElement[]) => void;
  animationSpeed?: number;
  showComplexity?: boolean;
  interactive?: boolean;
  autoPlay?: boolean;
  className?: string;
  onOperationComplete?: (operation: DataStructureOperation) => void;
}

export interface ControlPanelProps {
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
}

export interface ComplexityIndicatorProps {
  timeComplexity: string;
  spaceComplexity: string;
  operation: string;
  explanation: string;
  worstCase?: string;
  averageCase?: string;
  bestCase?: string;
}

export interface CodeExampleProps {
  language: 'javascript' | 'python' | 'java' | 'typescript';
  code: string;
  title?: string;
  explanation?: string;
  highlightedLines?: number[];
}

// Specific data structure interfaces
export interface ArrayElement extends DataStructureElement {
  index: number;
}

export interface LinkedListNode extends DataStructureElement {
  next: string | null;
  prev?: string | null; // for doubly linked lists
  memoryAddress?: string;
}

export interface StackElement extends DataStructureElement {
  stackIndex: number;
  isTop?: boolean;
}

export interface QueueElement extends DataStructureElement {
  queueIndex: number;
  isFront?: boolean;
  isRear?: boolean;
}

export interface TreeNode extends DataStructureElement {
  left?: string;
  right?: string;
  parent?: string;
  level: number;
  isRoot?: boolean;
  isLeaf?: boolean;
}

export interface GraphNode extends DataStructureElement {
  connections: string[];
  weight?: number;
  visited?: boolean;
  distance?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  directed?: boolean;
  highlighted?: boolean;
}

export interface HashTableEntry extends DataStructureElement {
  key: string;
  bucket: number;
  collisionChain?: string[];
}

// Animation and interaction types
export type AnimationType =
  | 'slide-in'
  | 'slide-out'
  | 'highlight'
  | 'fade'
  | 'scale'
  | 'rotate'
  | 'path'
  | 'connect'
  | 'disconnect';

export interface Animation {
  id: string;
  type: AnimationType;
  target: string;
  duration: number;
  delay?: number;
  easing?: string;
  properties?: Record<string, string | number | boolean>;
}

export interface InteractionEvent {
  type: 'click' | 'hover' | 'drag' | 'drop';
  target: string;
  data?: DataStructureElement[];
  position?: { x: number; y: number };
}

// Component Props interfaces
export interface LinkedListVisualizationProps extends BaseVisualizationProps {
  initialData?: number[];
  maxSize?: number;
  showMemoryAddresses?: boolean;
}

export interface StackVisualizationProps extends BaseVisualizationProps {
  initialData?: number[];
  maxSize?: number;
  orientation?: 'vertical' | 'horizontal';
  showStackPointer?: boolean;
}

export interface QueueVisualizationProps extends BaseVisualizationProps {
  initialData?: number[];
  maxSize?: number;
  orientation?: 'horizontal' | 'vertical';
  showPointers?: boolean;
}

// Learning and assessment types
export interface LearningObjective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  section: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
}

export interface PracticeProfile {
  userId?: string;
  completedSections: string[];
  currentProgress: Record<string, number>;
  achievements: string[];
  timeSpent: Record<string, number>;
  problemsSolved: number;
  favoriteDataStructures: string[];
}

// Configuration types
export interface DataStructureConfig {
  maxElements: number;
  allowDuplicates: boolean;
  showIndices: boolean;
  showPointers: boolean;
  showComplexity: boolean;
  animationSpeed: number;
  colorScheme: 'default' | 'colorblind' | 'dark' | 'light';
  language: 'javascript' | 'python' | 'java' | 'typescript';
}

export interface VisualizationTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
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
