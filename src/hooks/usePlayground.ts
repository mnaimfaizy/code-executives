// src/hooks/usePlayground.ts
// Custom hook for managing playground state and operations

import { useState, useEffect, useCallback } from 'react';
import type {
  PlaygroundProblem,
  Language,
  DataStructureType,
  ExecutionResult,
  TestCaseResult,
  SubmissionResult,
  PerformanceAnalysis,
  PlaygroundSession,
  UserProgress,
} from '../types/playground';

interface UsePlaygroundOptions {
  problemId: string;
  initialLanguage: Language;
  initialVisualization: DataStructureType;
}

interface UsePlaygroundReturn {
  currentProblem: PlaygroundProblem | null;
  isLoading: boolean;
  error: string | null;
  code: string;
  language: Language;
  setCode: (code: string) => void;
  setLanguage: (language: Language) => void;
  isExecuting: boolean;
  executionResult: ExecutionResult | null;
  testResults: TestCaseResult[];
  performanceAnalysis: PerformanceAnalysis | null;
  selectedVisualization: DataStructureType;
  setSelectedVisualization: (type: DataStructureType) => void;
  runCode: () => Promise<void>;
  runTests: () => Promise<void>;
  submitSolution: () => Promise<SubmissionResult | null>;
  resetCode: () => void;
  showHint: (hintId: string) => void;
  session: PlaygroundSession | null;
  progress: UserProgress | null;
}

// Mock data for development - in production this would come from an API
const mockProblems: Record<string, PlaygroundProblem> = {
  'two-sum': {
    id: 'two-sum',
    title: 'Two Sum',
    description:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'Easy',
    category: 'Algorithms',
    dataStructure: 'Array',
    examples: [
      {
        id: 'example-1',
        input: [[2, 7, 11, 15], 9],
        expectedOutput: [0, 1],
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Your solution here
}`,
      python: `def two_sum(nums, target):
    # Your solution here
    pass`,
      java: `public int[] twoSum(int[] nums, int target) {
    // Your solution here
}`,
    },
    testCases: [
      {
        id: '1',
        input: [[2, 7, 11, 15], 9],
        expectedOutput: [0, 1],
        isHidden: false,
      },
      {
        id: '2',
        input: [[3, 2, 4], 6],
        expectedOutput: [1, 2],
        isHidden: false,
      },
      {
        id: '3',
        input: [[3, 3], 6],
        expectedOutput: [0, 1],
        isHidden: true,
      },
    ],
    hints: [
      {
        id: 'hint-1',
        content: "Consider using a hash map to store numbers you've seen and their indices.",
        order: 1,
        penalty: 1,
      },
      {
        id: 'hint-2',
        content:
          'First pass: store all numbers in hash map. Second pass: find complement for each number.',
        order: 2,
        penalty: 2,
      },
    ],
    learningObjectives: [
      'Understand hash table usage for O(1) lookups',
      'Practice array iteration and index management',
      'Learn about space-time tradeoffs',
    ],
    tags: ['Array', 'Hash Table'],
    estimatedSolveTime: 15,
    solution: {
      code: {
        javascript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
      },
      explanation:
        'Using a hash map allows us to achieve O(n) time complexity by performing constant-time lookups for the complement of each number.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      approaches: [
        {
          name: 'Hash Table',
          description: 'Use a hash table to store seen numbers and their indices',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          code: {
            javascript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
          },
        },
      ],
    },
    visualizationOptions: ['Array', 'HashTable'],
  },
};

const mockProgress: UserProgress = {
  userId: 'user-1',
  solvedProblems: [
    {
      problemId: 'two-sum',
      bestScore: 95,
      attempts: 2,
      firstSolvedAt: new Date('2024-01-01'),
      lastAttemptAt: new Date('2024-01-02'),
      timeSpent: 25,
      hintsUsed: 1,
    },
  ],
  statistics: {
    totalSolved: 15,
    easySolved: 8,
    mediumSolved: 5,
    hardSolved: 2,
    averageScore: 85.5,
    totalTimeSpent: 7200, // seconds
    currentStreak: 3,
    longestStreak: 7,
  },
  achievements: [],
  preferences: {
    defaultLanguage: 'javascript',
    theme: 'light',
    autoSave: true,
    showHints: true,
    visualizationSpeed: 'normal',
  },
};

export const usePlayground = ({
  problemId,
  initialLanguage,
  initialVisualization,
}: UsePlaygroundOptions): UsePlaygroundReturn => {
  // State management
  const [currentProblem, setCurrentProblem] = useState<PlaygroundProblem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [selectedVisualization, setSelectedVisualization] =
    useState<DataStructureType>(initialVisualization);
  const [session, setSession] = useState<PlaygroundSession | null>(null);
  const [progress] = useState<UserProgress>(mockProgress);

  // Load problem data
  useEffect(() => {
    const loadProblem = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const problem = mockProblems[problemId];
        if (!problem) {
          throw new Error('Problem not found');
        }

        setCurrentProblem(problem);
        setCode(problem.starterCode[language] || '');
        setSession({
          problemId,
          startTime: new Date(),
          code: {},
          currentLanguage: language,
          selectedVisualization: initialVisualization,
          hintsUsed: [],
          submissions: [],
          isCompleted: false,
          score: 0,
          timeSpent: 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load problem');
      } finally {
        setIsLoading(false);
      }
    };

    loadProblem();
  }, [problemId, language, initialVisualization]);

  // Update code when language changes
  useEffect(() => {
    if (currentProblem && currentProblem.starterCode[language]) {
      setCode(currentProblem.starterCode[language]);
    }
  }, [language, currentProblem]);

  // Run code execution
  const runCode = useCallback(async () => {
    if (!currentProblem) return;

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      // Simulate code execution
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock execution result
      const result: ExecutionResult = {
        success: true,
        output: 'Code executed successfully',
        executionTime: Math.random() * 100,
        memoryUsage: Math.random() * 50,
        operations: [],
      };

      setExecutionResult(result);
    } catch (err) {
      setExecutionResult({
        success: false,
        output: err instanceof Error ? err.message : 'Execution failed',
        executionTime: 0,
        memoryUsage: 0,
        operations: [],
      });
    } finally {
      setIsExecuting(false);
    }
  }, [currentProblem]);

  // Run test cases
  const runTests = useCallback(async () => {
    if (!currentProblem) return;

    setIsExecuting(true);
    setTestResults([]);

    try {
      // Simulate test execution
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock test results
      const results: TestCaseResult[] = currentProblem.testCases.map((testCase) => ({
        testCaseId: testCase.id,
        passed: Math.random() > 0.3, // 70% pass rate for demo
        executionResult: {
          success: true,
          output: [0, 1],
          executionTime: Math.random() * 50,
          memoryUsage: Math.random() * 20,
          operations: [],
        },
        expectedOutput: testCase.expectedOutput,
        actualOutput: [0, 1],
        executionTime: Math.random() * 50,
        memoryUsage: Math.random() * 20,
      }));

      setTestResults(results);

      // Update performance analysis
      const analysis: PerformanceAnalysis = {
        timeComplexity: {
          best: 'O(n)',
          average: 'O(n)',
          worst: 'O(n)',
          explanation: 'Linear time complexity due to single pass through array',
        },
        spaceComplexity: {
          best: 'O(1)',
          average: 'O(n)',
          worst: 'O(n)',
          explanation: 'Space complexity depends on hash table size',
        },
        bottlenecks: [],
        optimizationSuggestions: [
          'Consider using more efficient data structures',
          'Optimize nested loops if present',
        ],
        realWorldApplications: [
          'Finding pairs in financial transactions',
          'Matching records in databases',
        ],
      };

      setPerformanceAnalysis(analysis);
    } catch (err) {
      console.error('Test execution failed:', err);
    } finally {
      setIsExecuting(false);
    }
  }, [currentProblem]);

  // Submit solution
  const submitSolution = useCallback(async (): Promise<SubmissionResult | null> => {
    if (!currentProblem || !session) return null;

    try {
      // Simulate submission
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const passedTests = testResults.filter((r) => r.passed).length;
      const totalTests = testResults.length;
      const score = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

      const result: SubmissionResult = {
        problemId: currentProblem.id,
        language,
        code,
        overallResult: score >= 80 ? 'accepted' : 'wrong_answer',
        testCaseResults: testResults,
        totalTests,
        passedTests,
        executionTime: executionResult?.executionTime || 0,
        memoryUsage: executionResult?.memoryUsage || 0,
        submittedAt: new Date(),
        hintsUsed: session?.hintsUsed.length || 0,
        score,
      };

      // Update session
      setSession((prev) =>
        prev
          ? {
              ...prev,
              submissions: [...prev.submissions, result],
              isCompleted: score >= 80,
              score: Math.max(prev.score, score),
            }
          : null
      );

      return result;
    } catch (err) {
      console.error('Submission failed:', err);
      return null;
    }
  }, [currentProblem, session, testResults, executionResult, code, language]);

  // Reset code to starter
  const resetCode = useCallback(() => {
    if (currentProblem && currentProblem.starterCode[language]) {
      setCode(currentProblem.starterCode[language]);
    }
  }, [currentProblem, language]);

  // Show hint
  const showHint = useCallback(
    (hintId: string) => {
      if (!session || !currentProblem) return;

      // Find the hint order by id
      const hint = currentProblem.hints.find((h) => h.id === hintId);
      if (!hint) return;

      setSession((prev) =>
        prev
          ? {
              ...prev,
              hintsUsed: [...prev.hintsUsed, hint.order],
            }
          : null
      );
    },
    [session, currentProblem]
  );

  return {
    currentProblem,
    isLoading,
    error,
    code,
    language,
    setCode,
    setLanguage,
    isExecuting,
    executionResult,
    testResults,
    performanceAnalysis,
    selectedVisualization,
    setSelectedVisualization,
    runCode,
    runTests,
    submitSolution,
    resetCode,
    showHint,
    session,
    progress,
  };
};
