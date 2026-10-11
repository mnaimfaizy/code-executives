// Parked for the Exercise feature (docs/adr/0004, decision 5): the types the problem set needs.
// Not yet wired into the Playground; nothing imports this file except ./problems.

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
