// Big-O Notation Shared Utilities

import type {
  ComplexityType,
  ComplexityFunction,
  PerformanceDataPoint,
  AlgorithmDescription,
} from '../../../../../../types/bigo';
import {
  COMPLEXITY_COLORS,
  COMPLEXITY_METAPHORS,
  DEFAULT_INPUT_SIZES,
} from '../../../../../../types/bigo';

/**
 * Complexity calculation functions for different Big-O classes
 */
export const COMPLEXITY_FUNCTIONS: Record<ComplexityType, ComplexityFunction> = {
  'O(1)': () => 1,
  'O(log n)': (n: number) => Math.log2(Math.max(n, 1)),
  'O(n)': (n: number) => n,
  'O(n log n)': (n: number) => n * Math.log2(Math.max(n, 1)),
  'O(n²)': (n: number) => n * n,
  'O(n³)': (n: number) => n * n * n,
  'O(2^n)': (n: number) => Math.pow(2, Math.min(n, 20)), // Cap to prevent overflow
  'O(n!)': (n: number) => factorial(Math.min(n, 10)), // Cap to prevent overflow
};

/**
 * Calculate factorial (with safety limits)
 */
function factorial(n: number): number {
  if (n <= 1) return 1;
  if (n > 20) return Infinity; // Prevent overflow
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
    if (result > Number.MAX_SAFE_INTEGER) return Infinity;
  }
  return result;
}

/**
 * Get complexity class from type string
 */
export function getComplexityClass(complexity: ComplexityType): string {
  const mapping: Record<ComplexityType, string> = {
    'O(1)': 'constant',
    'O(log n)': 'logarithmic',
    'O(n)': 'linear',
    'O(n log n)': 'linearithmic',
    'O(n²)': 'quadratic',
    'O(n³)': 'cubic',
    'O(2^n)': 'exponential',
    'O(n!)': 'factorial',
  };
  return mapping[complexity] || 'unknown';
}

/**
 * Get color for complexity type
 */
export function getComplexityColor(complexity: ComplexityType): string {
  return COMPLEXITY_COLORS[complexity] || '#666666';
}

/**
 * Get metaphor for complexity type
 */
export function getComplexityMetaphor(complexity: ComplexityType): string {
  return COMPLEXITY_METAPHORS[complexity] || 'unknown';
}

/**
 * Calculate operations for a given complexity and input size
 */
export function calculateOperations(complexity: ComplexityType, inputSize: number): number {
  const func = COMPLEXITY_FUNCTIONS[complexity];
  return Math.round(func(inputSize));
}

/**
 * Generate performance data points for visualization
 */
export function generatePerformanceData(
  complexity: ComplexityType,
  inputSizes: number[] = DEFAULT_INPUT_SIZES
): PerformanceDataPoint[] {
  return inputSizes.map((inputSize) => ({
    inputSize,
    operations: calculateOperations(complexity, inputSize),
    timeMs: calculateOperations(complexity, inputSize) * 0.001, // Rough time estimate
    complexity,
  }));
}

/**
 * Compare two complexities at a given input size
 */
export function compareComplexities(
  complexity1: ComplexityType,
  complexity2: ComplexityType,
  inputSize: number
): { winner: ComplexityType; ratio: number; explanation: string } {
  const ops1 = calculateOperations(complexity1, inputSize);
  const ops2 = calculateOperations(complexity2, inputSize);

  if (ops1 < ops2) {
    return {
      winner: complexity1,
      ratio: ops2 / ops1,
      explanation: `${complexity1} performs ${Math.round(ops2 / ops1)}x better than ${complexity2} at input size ${inputSize}`,
    };
  } else if (ops2 < ops1) {
    return {
      winner: complexity2,
      ratio: ops1 / ops2,
      explanation: `${complexity2} performs ${Math.round(ops1 / ops2)}x better than ${complexity1} at input size ${inputSize}`,
    };
  } else {
    return {
      winner: complexity1,
      ratio: 1,
      explanation: `Both complexities perform similarly at input size ${inputSize}`,
    };
  }
}

/**
 * Find the dominant complexity from a list
 */
export function findDominantComplexity(complexities: ComplexityType[]): ComplexityType {
  const order: Record<ComplexityType, number> = {
    'O(1)': 0,
    'O(log n)': 1,
    'O(n)': 2,
    'O(n log n)': 3,
    'O(n²)': 4,
    'O(n³)': 5,
    'O(2^n)': 6,
    'O(n!)': 7,
  };

  return complexities.reduce((dominant, current) =>
    order[current] > order[dominant] ? current : dominant
  );
}

/**
 * Format complexity for display
 */
export function formatComplexity(complexity: ComplexityType): string {
  return complexity.replace('n²', 'n²').replace('n³', 'n³');
}

/**
 * Get complexity description
 */
export function getComplexityDescription(complexity: ComplexityType): string {
  const descriptions: Record<ComplexityType, string> = {
    'O(1)': 'Constant time - fixed operations regardless of input size',
    'O(log n)': 'Logarithmic time - operations halve with each step',
    'O(n)': 'Linear time - operations proportional to input size',
    'O(n log n)': 'Linearithmic time - efficient sorting complexity',
    'O(n²)': 'Quadratic time - nested operations, grows rapidly',
    'O(n³)': 'Cubic time - triple nested operations',
    'O(2^n)': 'Exponential time - doubles with each input addition',
    'O(n!)': 'Factorial time - all possible permutations',
  };
  return descriptions[complexity] || 'Unknown complexity';
}

/**
 * Validate input size for complexity calculations
 */
export function validateInputSize(inputSize: number): boolean {
  return Number.isInteger(inputSize) && inputSize >= 1 && inputSize <= 1000000;
}

/**
 * Clamp input size to safe bounds
 */
export function clampInputSize(inputSize: number): number {
  return Math.max(1, Math.min(inputSize, 1000000));
}

/**
 * Animation utilities
 */
export class AnimationUtils {
  static readonly DEFAULT_DURATION = 1000;
  static readonly EASING_FUNCTIONS = {
    linear: (t: number) => t,
    easeIn: (t: number) => t * t,
    easeOut: (t: number) => t * (2 - t),
    easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  };

  static animate(
    duration: number = this.DEFAULT_DURATION,
    easing: keyof typeof this.EASING_FUNCTIONS = 'easeInOut'
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const easingFn = this.EASING_FUNCTIONS[easing];

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        easingFn(progress); // Apply easing (for consistency, even if not used)

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Math utilities for complexity calculations
 */
export class MathUtils {
  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static log10(value: number): number {
    return Math.log10(Math.max(value, 1));
  }

  static isPowerOf2(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  static nextPowerOf2(n: number): number {
    if (n <= 0) return 1;
    n--;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
  }
}

/**
 * Common algorithm examples for demonstration
 */
export const SAMPLE_ALGORITHMS: AlgorithmDescription[] = [
  {
    name: 'Linear Search',
    description: 'Search for an element in an unsorted array',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    category: 'search',
  },
  {
    name: 'Binary Search',
    description: 'Search for an element in a sorted array',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    category: 'search',
  },
  {
    name: 'Bubble Sort',
    description: 'Simple sorting algorithm with nested loops',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    category: 'sorting',
  },
  {
    name: 'Merge Sort',
    description: 'Efficient divide-and-conquer sorting',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    category: 'sorting',
  },
  {
    name: 'Array Access',
    description: 'Access element by index',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    category: 'data-structure',
  },
  {
    name: 'Hash Table Lookup',
    description: 'Average case constant time lookup',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(n)',
    category: 'data-structure',
  },
];
