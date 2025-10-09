// src/components/playground/TestRunner.tsx
// Component for running and displaying test case results

import React, { useState } from 'react';
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Target,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import type { TestRunnerProps, TestCaseResult, TestCase } from '../../types/playground';

const TestRunner: React.FC<TestRunnerProps> = ({
  testCases,
  results,
  isRunning,
  onRun,
  className = '',
}) => {
  const [selectedTestCase, setSelectedTestCase] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Handle test execution
  const handleRunTests = async () => {
    onRun();
    // The actual test execution is handled by the parent component
    // This component just displays the results
  };

  // Get status icon and color for a test result
  const getTestStatus = (result?: TestCaseResult) => {
    if (!result) {
      return {
        icon: <Clock className="w-4 h-4" />,
        color: 'text-gray-400',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        status: 'Not run',
      };
    }

    if (result.passed) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        status: 'Passed',
      };
    } else {
      return {
        icon: <XCircle className="w-4 h-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        status: 'Failed',
      };
    }
  };

  // Categorize test cases
  const categorizeTestCases = () => {
    const categories = {
      basic: [] as typeof testCases,
      edge: [] as typeof testCases,
      performance: [] as typeof testCases,
      complex: [] as typeof testCases,
    };

    testCases.forEach((testCase) => {
      // Simple categorization based on input characteristics
      const input = Array.isArray(testCase.input) ? testCase.input : [testCase.input];
      const inputSize = input.length;

      if (inputSize <= 3) {
        categories.basic.push(testCase);
      } else if (inputSize > 100) {
        categories.performance.push(testCase);
      } else if (
        input.includes(null) ||
        input.includes(undefined) ||
        input.includes(0) ||
        input.includes('')
      ) {
        categories.edge.push(testCase);
      } else {
        categories.complex.push(testCase);
      }
    });

    return categories;
  };

  // Calculate summary statistics
  const totalTests = testCases.length;
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = results.filter((r) => !r.passed).length;
  const notRunTests = totalTests - results.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  // Performance statistics
  const avgExecutionTime =
    results.length > 0 ? results.reduce((sum, r) => sum + r.executionTime, 0) / results.length : 0;
  const maxExecutionTime = Math.max(...results.map((r) => r.executionTime), 0);
  const avgMemoryUsage =
    results.length > 0 ? results.reduce((sum, r) => sum + r.memoryUsage, 0) / results.length : 0;

  const categories = categorizeTestCases();

  // Generate hints for failed tests
  const generateHints = (testCase: TestCase, result: TestCaseResult) => {
    const hints = [];

    if (!result.passed) {
      // Common failure patterns
      if (result.actualOutput === undefined) {
        hints.push(
          'Your function might not be returning a value. Check that you have a return statement.'
        );
      } else if (Array.isArray(result.expectedOutput) && !Array.isArray(result.actualOutput)) {
        hints.push('Expected an array but got a different type. Check your return type.');
      } else if (
        typeof result.expectedOutput === 'number' &&
        typeof result.actualOutput === 'number'
      ) {
        if (Math.abs(result.actualOutput - result.expectedOutput) < 0.01) {
          hints.push(
            'Your result is very close but not exact. Check for floating-point precision issues.'
          );
        } else {
          hints.push(
            'Check your algorithm logic. The result differs significantly from expected output.'
          );
        }
      } else if (JSON.stringify(result.actualOutput) !== JSON.stringify(result.expectedOutput)) {
        hints.push(
          "The output structure or values don't match. Review your algorithm step by step."
        );
      }

      // Input-specific hints
      const input = Array.isArray(testCase.input) ? testCase.input : [testCase.input];
      if (input.includes(0)) {
        hints.push('Consider edge cases like zero values or empty inputs.');
      }
      if (input.length === 0) {
        hints.push('Handle empty input arrays or null values properly.');
      }
    }

    return hints;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Play className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Test Results</span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Tests</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Test Progress</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{passRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Pass Rate</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${passRate}%` }}
          ></div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{passedTests}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{failedTests}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{notRunTests}</div>
            <div className="text-sm text-gray-600">Not Run</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      {results.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{avgExecutionTime.toFixed(2)}ms</div>
              <div className="text-sm text-gray-600">Avg Execution Time</div>
              <div className="text-xs text-gray-500 mt-1">Max: {maxExecutionTime.toFixed(2)}ms</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{avgMemoryUsage.toFixed(2)}MB</div>
              <div className="text-sm text-gray-600">Avg Memory Usage</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{results.length}</div>
              <div className="text-sm text-gray-600">Tests Completed</div>
            </div>
          </div>
        </div>
      )}

      {/* Test Categories */}
      {showDetails && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Test Categories</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categories).map(([category, tests]) => {
              const passedInCategory = results.filter(
                (r) => r.passed && tests.some((t) => t.id === r.testCaseId)
              ).length;

              return (
                <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900 capitalize">{category}</div>
                  <div className="text-sm text-gray-600">
                    {passedInCategory}/{tests.length} passed
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Test Case Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Test Cases</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BarChart3 className="w-4 h-4" />
            <span>Click test cases for details</span>
          </div>
        </div>

        {testCases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No test cases available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {testCases.map((testCase, index) => {
              const result = results.find((r) => r.testCaseId === testCase.id);
              const { icon, color, bgColor, borderColor, status } = getTestStatus(result);
              const isSelected = selectedTestCase === testCase.id;
              const hints = result && !result.passed ? generateHints(testCase, result) : [];

              return (
                <div
                  key={testCase.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? `${borderColor} ${bgColor}`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTestCase(isSelected ? null : testCase.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`mt-1 ${color}`}>{icon}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">Test Case {index + 1}</span>
                          <span
                            className={`text-sm px-2 py-1 rounded-full ${color} ${bgColor} border ${borderColor}`}
                          >
                            {status}
                          </span>
                          {result && (
                            <span className="text-xs text-gray-500">
                              {result.executionTime.toFixed(2)}ms
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2">
                          <div>
                            <span className="font-medium text-gray-600">Input:</span>
                            <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-gray-800 text-xs break-all">
                              {Array.isArray(testCase.input)
                                ? JSON.stringify(testCase.input)
                                : String(testCase.input)}
                            </code>
                          </div>

                          <div>
                            <span className="font-medium text-gray-600">Expected:</span>
                            <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-gray-800 text-xs break-all">
                              {JSON.stringify(testCase.expectedOutput)}
                            </code>
                          </div>
                        </div>

                        {result && (
                          <div className="mb-2">
                            <span className="font-medium text-gray-600">Actual:</span>
                            <code
                              className={`ml-2 px-2 py-1 rounded text-xs break-all ${
                                result.passed
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {JSON.stringify(result.actualOutput)}
                            </code>
                          </div>
                        )}

                        {/* Hints for failed tests */}
                        {hints.length > 0 && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                            <div className="flex items-start space-x-2">
                              <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-yellow-800 mb-1">
                                  Hints for this test case:
                                </div>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                  {hints.map((hint, hintIndex) => (
                                    <li key={hintIndex}>• {hint}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Error message */}
                        {result && result.executionResult.error && (
                          <div className="mt-3 p-3 bg-red-50 rounded-md border border-red-200">
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-red-800 mb-1">
                                  Runtime Error:
                                </div>
                                <div className="text-sm text-red-700 font-mono">
                                  {result.executionResult.error.message}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expand/collapse indicator */}
                    <div
                      className={`transform transition-transform ${isSelected ? 'rotate-90' : ''}`}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestRunner;
