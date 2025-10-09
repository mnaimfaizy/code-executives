// src/components/playground/PerformanceAnalyzer.tsx
// Component for analyzing and displaying performance metrics

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity,
} from 'lucide-react';
import type { PerformanceAnalyzerProps, ComplexityClass } from '../../types/playground';

const PerformanceAnalyzer: React.FC<PerformanceAnalyzerProps> = ({
  operations,
  testResults,
  problem,
  className = '',
}) => {
  const [selectedScenario, setSelectedScenario] = useState<'best' | 'average' | 'worst'>('average');
  const [showTimeline, setShowTimeline] = useState(false);

  // Calculate performance metrics
  const totalExecutionTime = testResults.reduce((sum, result) => sum + result.executionTime, 0);
  const averageExecutionTime = testResults.length > 0 ? totalExecutionTime / testResults.length : 0;
  const maxExecutionTime = Math.max(...testResults.map((r) => r.executionTime), 0);
  const minExecutionTime = Math.min(...testResults.map((r) => r.executionTime), 0);
  const totalMemoryUsage = testResults.reduce((sum, result) => sum + result.memoryUsage, 0);
  const averageMemoryUsage = testResults.length > 0 ? totalMemoryUsage / testResults.length : 0;

  // Scenario analysis data
  const scenarioData = {
    best: {
      time: minExecutionTime,
      operations: Math.floor(operations.length * 0.3),
      description: 'Optimal input arrangement',
      color: 'green',
    },
    average: {
      time: averageExecutionTime,
      operations: operations.length,
      description: 'Typical performance',
      color: 'blue',
    },
    worst: {
      time: maxExecutionTime,
      operations: Math.floor(operations.length * 1.5),
      description: 'Worst-case input arrangement',
      color: 'red',
    },
  };

  // Complexity analysis with detailed explanations
  const getComplexityInfo = (complexity: ComplexityClass) => {
    const info: Record<
      ComplexityClass,
      { color: string; description: string; examples: string; whenToUse: string; visual: string }
    > = {
      'O(1)': {
        color: 'text-green-600 bg-green-100',
        description: 'Constant time - Performance remains the same regardless of input size',
        examples: 'Array access by index, Hash table lookup',
        whenToUse: 'When you need guaranteed fast performance',
        visual: 'Flat horizontal line - no growth with input size',
      },
      'O(1) amortized': {
        color: 'text-emerald-600 bg-emerald-100',
        description:
          'Amortized constant time - Average O(1) over many operations, some may be O(n)',
        examples: 'Dynamic arrays (ArrayList), Hash tables with resizing',
        whenToUse: 'When occasional expensive operations are acceptable for average performance',
        visual: 'Mostly flat with occasional spikes - average remains constant',
      },
      'O(log n)': {
        color: 'text-blue-600 bg-blue-100',
        description: 'Logarithmic time - Performance grows slowly as input size increases',
        examples: 'Binary search, Balanced tree operations',
        whenToUse: 'When dealing with sorted data or hierarchical structures',
        visual: 'Shallow upward curve - halves the problem each step',
      },
      'O(n)': {
        color: 'text-yellow-600 bg-yellow-100',
        description: 'Linear time - Performance scales directly with input size',
        examples: 'Linear search, Single loop traversals',
        whenToUse: 'When you need to process every element once',
        visual: 'Straight diagonal line - direct proportion to input size',
      },
      'O(n log n)': {
        color: 'text-orange-600 bg-orange-100',
        description: 'Linearithmic time - Good performance for most practical purposes',
        examples: 'Quick sort, Merge sort, Heap sort',
        whenToUse: 'When sorting or divide-and-conquer algorithms are needed',
        visual: 'Moderate upward curve - acceptable for most applications',
      },
      'O(n²)': {
        color: 'text-red-600 bg-red-100',
        description: 'Quadratic time - Performance degrades quickly with larger inputs',
        examples: 'Bubble sort, Nested loops, Simple matrix operations',
        whenToUse: 'Only for small inputs or when simplicity is more important than performance',
        visual: 'Steep upward curve - becomes unusable for large datasets',
      },
      'O(n³)': {
        color: 'text-red-700 bg-red-200',
        description: 'Cubic time - Very inefficient, avoid when possible',
        examples: 'Triple nested loops, Some graph algorithms',
        whenToUse: 'Rarely, only for very small inputs',
        visual: 'Very steep curve - impractical for real-world use',
      },
      'O(2^n)': {
        color: 'text-purple-600 bg-purple-100',
        description: 'Exponential time - Grows extremely rapidly',
        examples: 'Subset generation, Some recursive algorithms',
        whenToUse: 'Only for very small inputs (n ≤ 20)',
        visual: 'Explosive growth - becomes unusable very quickly',
      },
      'O(n!)': {
        color: 'text-red-800 bg-red-200',
        description: 'Factorial time - Extremely inefficient, worst possible complexity',
        examples: 'Brute force permutations, Traveling salesman (naive)',
        whenToUse: 'Never - find a better algorithm',
        visual: 'Insanely steep curve - completely impractical',
      },
      'O(h)': {
        color: 'text-indigo-600 bg-indigo-100',
        description:
          'Height of tree - Depends on tree balance, typically O(log n) for balanced trees',
        examples: 'Tree traversal recursion stack, Binary tree height',
        whenToUse: 'When analyzing tree algorithms and recursion depth',
        visual: 'Depends on tree structure - O(log n) for balanced, O(n) for skewed',
      },
      'O(w)': {
        color: 'text-cyan-600 bg-cyan-100',
        description: 'Tree width - Maximum nodes at any level, varies by tree structure',
        examples: 'Breadth-first search queue size, Level-order traversal',
        whenToUse: 'When analyzing BFS algorithms and level-based operations',
        visual: 'Varies by tree shape - can be O(1) to O(n) depending on structure',
      },
    };
    return info[complexity] || info['O(n)'];
  };

  // Performance bottlenecks detection
  const detectBottlenecks = () => {
    const bottlenecks = [];

    if (maxExecutionTime > 1000) {
      bottlenecks.push('High execution time detected - consider optimizing the algorithm');
    }

    if (averageMemoryUsage > 100) {
      bottlenecks.push('High memory usage - consider using more memory-efficient data structures');
    }

    if (operations.length > 1000) {
      bottlenecks.push('High number of operations - algorithm may be inefficient');
    }

    return bottlenecks;
  };

  const bottlenecks = detectBottlenecks();

  const timeComplexityInfo = getComplexityInfo(problem.solution.timeComplexity);
  const spaceComplexityInfo = getComplexityInfo(problem.solution.spaceComplexity);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Performance Analysis</span>
        </div>
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Activity className="w-4 h-4" />
          <span>{showTimeline ? 'Hide' : 'Show'} Timeline</span>
        </button>
      </div>

      {/* Scenario Analysis */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Scenarios</h3>

        {/* Scenario Selector */}
        <div className="flex space-x-2 mb-6">
          {(['best', 'average', 'worst'] as const).map((scenario) => (
            <button
              key={scenario}
              onClick={() => setSelectedScenario(scenario)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                selectedScenario === scenario
                  ? `bg-${scenarioData[scenario].color}-600 text-white`
                  : `bg-gray-100 text-gray-700 hover:bg-gray-200`
              }`}
            >
              {scenario} Case
            </button>
          ))}
        </div>

        {/* Scenario Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['best', 'average', 'worst'] as const).map((scenario) => {
            const data = scenarioData[scenario];
            const isSelected = selectedScenario === scenario;

            return (
              <div
                key={scenario}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  isSelected
                    ? `border-${data.color}-500 bg-${data.color}-50`
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {scenario} Case
                  </span>
                  {isSelected && (
                    <div className={`w-2 h-2 bg-${data.color}-500 rounded-full`}></div>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{data.time.toFixed(2)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Operations:</span>
                    <span className="font-medium">{data.operations}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{data.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complexity Analysis with Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Complexity */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Time Complexity</h3>
          </div>

          <div className="space-y-4">
            {/* Complexity Badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Algorithm Complexity</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${timeComplexityInfo.color}`}
              >
                {problem.solution.timeComplexity}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 leading-relaxed">
              {timeComplexityInfo.description}
            </p>

            {/* Examples */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xs font-medium text-gray-600 mb-1">Examples:</div>
              <div className="text-sm text-gray-700">{timeComplexityInfo.examples}</div>
            </div>

            {/* When to Use */}
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-xs font-medium text-blue-600 mb-1">When to Use:</div>
              <div className="text-sm text-blue-700">{timeComplexityInfo.whenToUse}</div>
            </div>

            {/* Visual Representation */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xs font-medium text-gray-600 mb-2">Visual Growth:</div>
              <div className="text-sm text-gray-700">{timeComplexityInfo.visual}</div>
            </div>
          </div>
        </div>

        {/* Space Complexity */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Space Complexity</h3>
          </div>

          <div className="space-y-4">
            {/* Complexity Badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${spaceComplexityInfo.color}`}
              >
                {problem.solution.spaceComplexity}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 leading-relaxed">
              {spaceComplexityInfo.description}
            </p>

            {/* Examples */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xs font-medium text-gray-600 mb-1">Examples:</div>
              <div className="text-sm text-gray-700">{spaceComplexityInfo.examples}</div>
            </div>

            {/* When to Use */}
            <div className="bg-green-50 p-3 rounded-md">
              <div className="text-xs font-medium text-green-600 mb-1">When to Use:</div>
              <div className="text-sm text-green-700">{spaceComplexityInfo.whenToUse}</div>
            </div>

            {/* Visual Representation */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xs font-medium text-gray-600 mb-2">Visual Growth:</div>
              <div className="text-sm text-gray-700">{spaceComplexityInfo.visual}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Timeline */}
      {showTimeline && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Execution Timeline</h3>
          </div>

          <div className="space-y-4">
            {/* Timeline visualization would go here */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-600 mb-2">
                Operation Sequence (First 20 operations):
              </div>
              <div className="flex flex-wrap gap-1">
                {operations.slice(0, 20).map((op, index) => (
                  <div
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    title={`${op.type} operation at indices: ${op.indices?.join(', ') || 'N/A'}`}
                  >
                    {op.type}
                  </div>
                ))}
                {operations.length > 20 && (
                  <div className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{operations.length - 20} more
                  </div>
                )}
              </div>
            </div>

            {/* Performance trend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Execution Time Trend</div>
                <div className="h-20 bg-gray-100 rounded flex items-end justify-around px-2">
                  {testResults.slice(0, 8).map((result, index) => (
                    <div
                      key={index}
                      className="bg-blue-500 rounded-t min-w-[8px]"
                      style={{
                        height: `${Math.max((result.executionTime / maxExecutionTime) * 100, 5)}%`,
                        opacity: 0.7 + (index / testResults.length) * 0.3,
                      }}
                      title={`Test ${index + 1}: ${result.executionTime.toFixed(2)}ms`}
                    ></div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Memory Usage Trend</div>
                <div className="h-20 bg-gray-100 rounded flex items-end justify-around px-2">
                  {testResults.slice(0, 8).map((result, index) => (
                    <div
                      key={index}
                      className="bg-green-500 rounded-t min-w-[8px]"
                      style={{
                        height: `${Math.max((result.memoryUsage / Math.max(...testResults.map((r) => r.memoryUsage))) * 100, 5)}%`,
                        opacity: 0.7 + (index / testResults.length) * 0.3,
                      }}
                      title={`Test ${index + 1}: ${result.memoryUsage.toFixed(2)}MB`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {averageExecutionTime.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Avg Time (ms)</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{averageMemoryUsage.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Avg Memory (MB)</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{operations.length}</div>
            <div className="text-sm text-gray-600">Operations</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{testResults.length}</div>
            <div className="text-sm text-gray-600">Test Cases</div>
          </div>
        </div>
      </div>

      {/* Bottlenecks and Suggestions */}
      <div className="space-y-4">
        {/* Bottlenecks */}
        {bottlenecks.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Performance Bottlenecks</h4>
                <ul className="space-y-1 text-sm text-yellow-700">
                  {bottlenecks.map((bottleneck, index) => (
                    <li key={index}>• {bottleneck}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Optimization Suggestions */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Optimization Suggestions</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Consider using more efficient data structures for better performance</li>
                <li>• Optimize nested loops and reduce unnecessary operations</li>
                <li>• Use appropriate algorithms based on input size and constraints</li>
                <li>• Profile your code to identify specific performance bottlenecks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalyzer;
