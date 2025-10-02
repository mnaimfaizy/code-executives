import React, { useState } from 'react';
import { Info, Clock, HardDrive, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ComplexityIndicatorProps } from '../../../../../../types/datastructures';

/**
 * Complexity Indicator Component
 * Shows Big-O complexity information with visual indicators and explanations
 */
export const ComplexityIndicator: React.FC<ComplexityIndicatorProps> = ({
  timeComplexity,
  spaceComplexity,
  operation,
  explanation,
  worstCase,
  averageCase,
  bestCase,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Color mapping for complexity classes
  const getComplexityColor = (complexity: string) => {
    const normalizedComplexity = complexity.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (normalizedComplexity.includes('o1') || normalizedComplexity === 'constant') {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    if (normalizedComplexity.includes('ologn') || normalizedComplexity === 'logarithmic') {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
    if (
      normalizedComplexity.includes('on') &&
      !normalizedComplexity.includes('on2') &&
      !normalizedComplexity.includes('onlogn')
    ) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    if (normalizedComplexity.includes('onlogn')) {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    }
    if (normalizedComplexity.includes('on2') || normalizedComplexity === 'quadratic') {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    if (normalizedComplexity.includes('on3') || normalizedComplexity === 'cubic') {
      return 'text-purple-600 bg-purple-50 border-purple-200';
    }
    if (normalizedComplexity.includes('2n') || normalizedComplexity === 'exponential') {
      return 'text-red-800 bg-red-100 border-red-300';
    }
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // Get performance icon based on complexity
  const getPerformanceIcon = (complexity: string) => {
    const normalizedComplexity = complexity.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (normalizedComplexity.includes('o1') || normalizedComplexity === 'constant') {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    if (normalizedComplexity.includes('ologn') || normalizedComplexity === 'logarithmic') {
      return <TrendingUp className="w-4 h-4 text-blue-600" />;
    }
    if (normalizedComplexity.includes('on') && !normalizedComplexity.includes('on2')) {
      return <Minus className="w-4 h-4 text-yellow-600" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const timeColorClass = getComplexityColor(timeComplexity);
  const spaceColorClass = getComplexityColor(spaceComplexity);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Complexity Analysis</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Toggle Details"
        >
          <Info className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Current Operation */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium">Operation:</span> {operation}
      </div>

      {/* Main Complexity Display */}
      <div className="grid grid-cols-2 gap-4">
        {/* Time Complexity */}
        <div className={`p-3 rounded-lg border ${timeColorClass}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Time</span>
            {getPerformanceIcon(timeComplexity)}
          </div>
          <div className="text-lg font-bold">{timeComplexity}</div>
        </div>

        {/* Space Complexity */}
        <div className={`p-3 rounded-lg border ${spaceColorClass}`}>
          <div className="flex items-center space-x-2 mb-2">
            <HardDrive className="w-4 h-4" />
            <span className="text-sm font-medium">Space</span>
            {getPerformanceIcon(spaceComplexity)}
          </div>
          <div className="text-lg font-bold">{spaceComplexity}</div>
        </div>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          {explanation}
        </div>
      )}

      {/* Detailed Analysis */}
      {showDetails && (bestCase || averageCase || worstCase) && (
        <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Detailed Analysis</h4>

          <div className="grid gap-2 text-sm">
            {bestCase && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Best Case:</span>
                <span
                  className={`px-2 py-1 rounded border text-xs ${getComplexityColor(bestCase)}`}
                >
                  {bestCase}
                </span>
              </div>
            )}

            {averageCase && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Average Case:</span>
                <span
                  className={`px-2 py-1 rounded border text-xs ${getComplexityColor(averageCase)}`}
                >
                  {averageCase}
                </span>
              </div>
            )}

            {worstCase && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Worst Case:</span>
                <span
                  className={`px-2 py-1 rounded border text-xs ${getComplexityColor(worstCase)}`}
                >
                  {worstCase}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complexity Reference */}
      {showDetails && (
        <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Complexity Reference
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>O(1) - Excellent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>O(log n) - Good</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>O(n) - Fair</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>O(n log n) - OK</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>O(n²) - Poor</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-800 rounded-full"></div>
              <span>O(2ⁿ) - Terrible</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplexityIndicator;
