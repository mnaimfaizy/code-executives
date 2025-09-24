// Big-O Complexity Analysis Engine

import type {
  ComplexityType,
  ComplexityResult,
  AlgorithmDescription,
  PerformanceDataPoint,
} from '../../../../types/bigo';
import { calculateOperations, findDominantComplexity } from '../shared/utils';

export class ComplexityAnalyzer {
  private static readonly LOOP_PATTERNS = [
    /for\s*\([^;]*;\s*[^;]*;\s*[^)]*\)/g, // for loops
    /while\s*\([^)]*\)/g, // while loops
    /do\s*\{[\s\S]*?\}\s*while\s*\([^)]*\)/g, // do-while loops
  ];

  /**
   * Analyze code to determine its time and space complexity
   */
  static analyzeCode(code: string): ComplexityResult {
    try {
      const normalizedCode = this.normalizeCode(code);
      const timeComplexity = this.analyzeTimeComplexity(normalizedCode);
      const spaceComplexity = this.analyzeSpaceComplexity(normalizedCode);
      const operations = this.estimateOperations(normalizedCode);
      const explanation = this.generateExplanation(timeComplexity, spaceComplexity);
      const optimizationSuggestions = this.generateOptimizationSuggestions(
        normalizedCode,
        timeComplexity
      );

      return {
        timeComplexity,
        spaceComplexity,
        operations,
        explanation,
        optimizationSuggestions,
        confidence: this.calculateConfidence(normalizedCode),
      };
    } catch {
      // Fallback analysis
      return {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        operations: 100,
        explanation:
          'Unable to analyze code complexity automatically. Defaulting to linear complexity.',
        optimizationSuggestions: ['Consider manual code review for complexity analysis'],
        confidence: 0.1,
      };
    }
  }

  /**
   * Analyze algorithm description
   */
  static analyzeAlgorithm(algorithm: AlgorithmDescription): ComplexityResult {
    return {
      timeComplexity: algorithm.timeComplexity,
      spaceComplexity: algorithm.spaceComplexity,
      operations: calculateOperations(algorithm.timeComplexity, 100),
      explanation: `Algorithm: ${algorithm.name} - ${algorithm.description}`,
      optimizationSuggestions: this.generateAlgorithmSuggestions(algorithm),
      confidence: 0.9,
    };
  }

  /**
   * Compare multiple algorithms
   */
  static compareAlgorithms(algorithms: AlgorithmDescription[]): {
    algorithms: AlgorithmDescription[];
    winner: AlgorithmDescription;
    explanation: string;
    performanceData: PerformanceDataPoint[][];
  } {
    const complexities = algorithms.map((algo) => algo.timeComplexity);
    const dominant = findDominantComplexity(complexities);
    const winner = algorithms.find((algo) => algo.timeComplexity === dominant) || algorithms[0];

    const performanceData = algorithms.map((algo) =>
      [10, 50, 100, 500, 1000].map((size) => ({
        inputSize: size,
        operations: calculateOperations(algo.timeComplexity, size),
        timeMs: calculateOperations(algo.timeComplexity, size) * 0.001,
        complexity: algo.timeComplexity,
      }))
    );

    return {
      algorithms,
      winner,
      explanation: `${winner.name} has the best time complexity (${winner.timeComplexity}) among the compared algorithms.`,
      performanceData,
    };
  }

  /**
   * Normalize code for analysis
   */
  private static normalizeCode(code: string): string {
    // Remove comments
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    code = code.replace(/\/\/.*$/gm, '');

    // Remove extra whitespace
    code = code.replace(/\s+/g, ' ').trim();

    return code;
  }

  /**
   * Analyze time complexity
   */
  private static analyzeTimeComplexity(code: string): ComplexityType {
    const loopCount = this.countLoops(code);
    const recursionDepth = this.detectRecursion(code);
    const nestedLoops = this.detectNestedLoops(code);

    // Determine complexity based on patterns
    if (recursionDepth > 0) {
      return this.analyzeRecursionComplexity(code);
    }

    if (nestedLoops >= 3) return 'O(n³)';
    if (nestedLoops === 2) return 'O(n²)';
    if (loopCount > 0) return 'O(n)';
    if (this.hasLogarithmicPatterns(code)) return 'O(log n)';

    return 'O(1)';
  }

  /**
   * Analyze space complexity
   */
  private static analyzeSpaceComplexity(code: string): ComplexityType {
    // Simple heuristics for space complexity
    const arrayDeclarations = (code.match(/\b(Array|array|vector|list)\b/g) || []).length;
    const objectDeclarations = (code.match(/\{\s*\w+\s*:/g) || []).length;
    const recursionDepth = this.detectRecursion(code);

    if (recursionDepth > 0) return 'O(n)'; // Recursion stack
    if (arrayDeclarations > 0) return 'O(n)'; // Dynamic arrays
    if (objectDeclarations > 2) return 'O(n)'; // Multiple objects

    return 'O(1)';
  }

  /**
   * Count loops in code
   */
  private static countLoops(code: string): number {
    let count = 0;
    this.LOOP_PATTERNS.forEach((pattern) => {
      const matches = code.match(pattern);
      if (matches) count += matches.length;
    });
    return count;
  }

  /**
   * Detect nested loops
   */
  private static detectNestedLoops(code: string): number {
    // Simple heuristic: count maximum nesting depth
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of code) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth--;
      }
    }

    return Math.max(0, maxDepth - 2); // Subtract 2 for function and main block
  }

  /**
   * Detect recursion
   */
  private static detectRecursion(code: string): number {
    const recursiveCalls = code.match(/(\w+)\s*\([^)]*\)/g) || [];
    const functionNames = code.match(/function\s+(\w+)/g) || [];

    // Simple check: if function calls itself
    const funcNames = functionNames.map((match) => match.split(' ')[1]);
    const recursiveCount = recursiveCalls.filter((call) => {
      const funcName = call.split('(')[0].trim();
      return funcNames.includes(funcName);
    }).length;

    return recursiveCount;
  }

  /**
   * Analyze recursion complexity
   */
  private static analyzeRecursionComplexity(code: string): ComplexityType {
    // Simple heuristics for common recursive patterns
    if (code.includes('fibonacci') || code.includes('factorial')) {
      return 'O(2^n)';
    }
    if (code.includes('binary') || code.includes('divide')) {
      return 'O(log n)';
    }
    return 'O(n)';
  }

  /**
   * Check for logarithmic patterns
   */
  private static hasLogarithmicPatterns(code: string): boolean {
    return /log|binary|divide|half/i.test(code);
  }

  /**
   * Estimate operations count
   */
  private static estimateOperations(code: string): number {
    const loopCount = this.countLoops(code);
    const nestedLoops = this.detectNestedLoops(code);

    if (nestedLoops >= 2) return 10000; // Quadratic
    if (loopCount > 0) return 1000; // Linear
    return 10; // Constant
  }

  /**
   * Generate explanation
   */
  private static generateExplanation(
    timeComplexity: ComplexityType,
    spaceComplexity: ComplexityType
  ): string {
    let explanation = `Time Complexity: ${timeComplexity} - ${this.getComplexityDescription(timeComplexity)}. `;
    explanation += `Space Complexity: ${spaceComplexity} - ${this.getComplexityDescription(spaceComplexity)}.`;

    return explanation;
  }

  /**
   * Generate optimization suggestions
   */
  private static generateOptimizationSuggestions(
    code: string,
    timeComplexity: ComplexityType
  ): string[] {
    const suggestions: string[] = [];

    if (timeComplexity === 'O(n²)' || timeComplexity === 'O(n³)') {
      suggestions.push(
        'Consider using more efficient algorithms like divide-and-conquer approaches'
      );
      suggestions.push('Use hash tables or sets for O(1) lookups instead of nested loops');
    }

    if (this.detectRecursion(code) > 0) {
      suggestions.push('Consider iterative solutions to avoid recursion overhead');
      suggestions.push(
        'Implement memoization for recursive functions with overlapping subproblems'
      );
    }

    if ((timeComplexity === 'O(n)' && code.includes('indexOf')) || code.includes('find')) {
      suggestions.push('Consider using hash tables for O(1) average-case lookups');
    }

    if (suggestions.length === 0) {
      suggestions.push('Code appears to be optimally complex for its purpose');
    }

    return suggestions;
  }

  /**
   * Generate algorithm-specific suggestions
   */
  private static generateAlgorithmSuggestions(algorithm: AlgorithmDescription): string[] {
    const suggestions: string[] = [];

    switch (algorithm.timeComplexity) {
      case 'O(n²)':
        suggestions.push('Consider Merge Sort or Quick Sort for better average performance');
        break;
      case 'O(n)':
        if (algorithm.category === 'search') {
          suggestions.push('For sorted data, consider Binary Search (O(log n))');
        }
        break;
      case 'O(2^n)':
        suggestions.push('Consider dynamic programming to reduce exponential complexity');
        break;
    }

    return suggestions.length > 0 ? suggestions : ['Algorithm appears optimal for its use case'];
  }

  /**
   * Calculate confidence in analysis
   */
  private static calculateConfidence(code: string): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on clear patterns
    if (this.countLoops(code) > 0) confidence += 0.2;
    if (this.detectNestedLoops(code) > 0) confidence += 0.1;
    if (this.detectRecursion(code) > 0) confidence += 0.1;

    // Decrease confidence for complex or unclear code
    if (code.length > 1000) confidence -= 0.1;
    if (code.includes('eval') || code.includes('Function')) confidence -= 0.2;

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Get complexity description
   */
  private static getComplexityDescription(complexity: ComplexityType): string {
    const descriptions: Record<ComplexityType, string> = {
      'O(1)': 'constant time',
      'O(log n)': 'logarithmic time',
      'O(n)': 'linear time',
      'O(n log n)': 'linearithmic time',
      'O(n²)': 'quadratic time',
      'O(n³)': 'cubic time',
      'O(2^n)': 'exponential time',
      'O(n!)': 'factorial time',
    };
    return descriptions[complexity] || 'unknown complexity';
  }
}

// Export singleton instance
export const complexityAnalyzer = new ComplexityAnalyzer();
