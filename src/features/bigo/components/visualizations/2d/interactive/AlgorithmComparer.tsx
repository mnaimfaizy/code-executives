import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  AlgorithmDescription,
  ComparisonResult,
  ComplexityType,
} from '../../../../../../types/bigo';

interface AlgorithmComparerProps {
  isActive?: boolean;
  inputSize?: number;
  animationSpeed?: number;
  interactive?: boolean;
  className?: string;
  onComparisonComplete?: (result: ComparisonResult) => void;
}

const AlgorithmComparer: React.FC<AlgorithmComparerProps> = ({
  isActive = false,
  inputSize = 100,
  animationSpeed = 1,
  interactive = true,
  className = '',
  onComparisonComplete,
}) => {
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['linear', 'binary']);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult | null>(null);
  const [currentInputSize, setCurrentInputSize] = useState(inputSize);
  const [performanceData, setPerformanceData] = useState<
    Array<{ algorithm: string; operations: number; time: number; complexity: string }>
  >([]);

  // Available algorithms for comparison
  const availableAlgorithms: AlgorithmDescription[] = useMemo(
    () => [
      {
        name: 'Linear Search',
        description: 'Sequential search through unsorted array',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        code: 'for(let i = 0; i < arr.length; i++) { if(arr[i] === target) return i; }',
        category: 'search',
      },
      {
        name: 'Binary Search',
        description: 'Divide and conquer search in sorted array',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        code: 'let left = 0, right = arr.length - 1; while(left <= right) { const mid = Math.floor((left + right) / 2); if(arr[mid] === target) return mid; arr[mid] < target ? left = mid + 1 : right = mid - 1; }',
        category: 'search',
      },
      {
        name: 'Bubble Sort',
        description: 'Simple sorting with nested comparisons',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        code: 'for(let i = 0; i < arr.length; i++) { for(let j = 0; j < arr.length - i - 1; j++) { if(arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; } }',
        category: 'sort',
      },
      {
        name: 'Merge Sort',
        description: 'Efficient divide and conquer sorting',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        code: 'function mergeSort(arr) { if(arr.length <= 1) return arr; const mid = Math.floor(arr.length / 2); const left = mergeSort(arr.slice(0, mid)); const right = mergeSort(arr.slice(mid)); return merge(left, right); }',
        category: 'sort',
      },
      {
        name: 'Hash Table Lookup',
        description: 'Constant time key-value access',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(n)',
        code: 'return hashTable[key];',
        category: 'data-structure',
      },
      {
        name: 'Power Set Generation',
        description: 'Generate all possible subsets',
        timeComplexity: 'O(2^n)',
        spaceComplexity: 'O(2^n)',
        code: 'const result = []; for(let i = 0; i < Math.pow(2, arr.length); i++) { const subset = []; for(let j = 0; j < arr.length; j++) { if(i & (1 << j)) subset.push(arr[j]); } result.push(subset); }',
        category: 'combinatorial',
      },
    ],
    []
  );

  // Simulate algorithm performance
  const simulateAlgorithm = useCallback(
    async (
      algorithm: AlgorithmDescription,
      size: number
    ): Promise<{ operations: number; time: number }> => {
      let operations = 0;
      const startTime = performance.now();

      // Simulate different complexity behaviors
      switch (algorithm.timeComplexity) {
        case 'O(1)':
          operations = 1;
          await new Promise((resolve) => setTimeout(resolve, 1 / animationSpeed));
          break;

        case 'O(log n)':
          operations = Math.ceil(Math.log2(size));
          await new Promise((resolve) => setTimeout(resolve, (operations * 10) / animationSpeed));
          break;

        case 'O(n)':
          operations = size;
          await new Promise((resolve) => setTimeout(resolve, (operations * 2) / animationSpeed));
          break;

        case 'O(n log n)':
          operations = size * Math.ceil(Math.log2(size));
          await new Promise((resolve) => setTimeout(resolve, (operations * 1) / animationSpeed));
          break;

        case 'O(n²)': {
          operations = size * size;
          // Cap the delay for large inputs to prevent UI freezing
          const delay = Math.min(operations * 0.1, 2000) / animationSpeed;
          await new Promise((resolve) => setTimeout(resolve, delay));
          break;
        }

        case 'O(2^n)': {
          operations = Math.pow(2, Math.min(size, 20)); // Cap at 2^20 to prevent overflow
          const expDelay = Math.min(operations * 0.001, 1000) / animationSpeed;
          await new Promise((resolve) => setTimeout(resolve, expDelay));
          break;
        }

        default:
          operations = size;
          await new Promise((resolve) => setTimeout(resolve, operations / animationSpeed));
      }

      const endTime = performance.now();
      return { operations, time: endTime - startTime };
    },
    [animationSpeed]
  );

  // Run comparison
  const runComparison = useCallback(async () => {
    if (isComparing || selectedAlgorithms.length < 2) return;

    setIsComparing(true);
    setComparisonResults(null);
    const results: Array<{
      algorithm: string;
      operations: number;
      time: number;
      complexity: string;
    }> = [];

    for (const algoId of selectedAlgorithms) {
      const algorithm = availableAlgorithms.find(
        (a) => a.name.toLowerCase().replace(/\s+/g, '') === algoId
      );
      if (algorithm) {
        const performance = await simulateAlgorithm(algorithm, currentInputSize);
        results.push({
          algorithm: algorithm.name,
          operations: performance.operations,
          time: performance.time,
          complexity: algorithm.timeComplexity,
        });
      }
    }

    // Determine winner (lowest operations for this input size)
    const winner =
      results.length > 0
        ? results.reduce((prev, current) => (prev.operations < current.operations ? prev : current))
        : null;

    if (!winner) {
      setIsComparing(false);
      return;
    }

    const comparisonResult: ComparisonResult = {
      algorithms: selectedAlgorithms
        .map(
          (id) => availableAlgorithms.find((a) => a.name.toLowerCase().replace(/\s+/g, '') === id)!
        )
        .filter(Boolean),
      winner: availableAlgorithms.find((a) => a.name === winner.algorithm)!,
      explanation: `For input size ${currentInputSize}, ${winner.algorithm} performs best with ${winner.operations} operations (${winner.complexity} complexity).`,
      performanceData: results.map((r) => [
        {
          inputSize: currentInputSize,
          operations: r.operations,
          timeMs: r.time,
          complexity: r.complexity as ComplexityType,
        },
      ]),
    };

    setComparisonResults(comparisonResult);
    setPerformanceData(results);
    setIsComparing(false);

    if (onComparisonComplete) {
      onComparisonComplete(comparisonResult);
    }
  }, [
    isComparing,
    selectedAlgorithms,
    currentInputSize,
    simulateAlgorithm,
    availableAlgorithms,
    onComparisonComplete,
  ]);

  // Auto-run comparison when component becomes active
  useEffect(() => {
    if (isActive && !isComparing && selectedAlgorithms.length >= 2) {
      runComparison();
    }
  }, [isActive, runComparison, isComparing, selectedAlgorithms]);

  // Toggle algorithm selection
  const toggleAlgorithm = (algoId: string) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(algoId) ? prev.filter((id) => id !== algoId) : [...prev, algoId]
    );
  };

  // Get color for complexity
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'O(1)':
        return 'text-blue-600 bg-blue-100';
      case 'O(log n)':
        return 'text-green-600 bg-green-100';
      case 'O(n)':
        return 'text-orange-600 bg-orange-100';
      case 'O(n log n)':
        return 'text-purple-600 bg-purple-100';
      case 'O(n²)':
        return 'text-red-600 bg-red-100';
      case 'O(2^n)':
        return 'text-pink-600 bg-pink-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl border-2 border-slate-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Algorithm Comparison</h3>
        <p className="text-sm text-slate-600">Compare algorithm performance side-by-side</p>
      </div>

      {/* Input Size Control */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <label className="block text-xs font-bold text-gray-700 mb-2">
            Input Size: {currentInputSize}
          </label>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={currentInputSize}
            onChange={(e) => setCurrentInputSize(Number(e.target.value))}
            className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            disabled={isComparing}
          />
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="absolute top-20 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Select Algorithms to Compare:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableAlgorithms.map((algo) => {
              const algoId = algo.name.toLowerCase().replace(/\s+/g, '');
              const isSelected = selectedAlgorithms.includes(algoId);

              return (
                <button
                  key={algoId}
                  onClick={() => toggleAlgorithm(algoId)}
                  disabled={isComparing}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${isComparing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="font-bold">{algo.name}</div>
                  <div
                    className={`text-xs px-1 py-0.5 rounded mt-1 ${getComplexityColor(algo.timeComplexity)}`}
                  >
                    {algo.timeComplexity}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Visualization */}
      <div className="absolute bottom-20 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Performance Results:</h4>

          {performanceData.length > 0 ? (
            <div className="space-y-2">
              {performanceData.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-sm">{result.algorithm}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getComplexityColor(result.complexity)}`}
                    >
                      {result.complexity}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">
                      {result.operations.toLocaleString()} ops
                    </div>
                    <div className="text-xs text-gray-600">{result.time.toFixed(1)}ms</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              Run a comparison to see performance results
            </div>
          )}
        </div>
      </div>

      {/* Winner Announcement */}
      {comparisonResults && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl text-center animate-bounce">
            <div className="text-2xl font-bold mb-2">🏆 Winner!</div>
            <div className="text-lg">{comparisonResults.winner.name}</div>
            <div className="text-sm opacity-90 mt-1">{comparisonResults.explanation}</div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      {interactive && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
          <button
            onClick={runComparison}
            disabled={isComparing || selectedAlgorithms.length < 2}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
          >
            {isComparing ? 'Comparing...' : 'Run Comparison'}
          </button>
          <button
            onClick={() => {
              setPerformanceData([]);
              setComparisonResults(null);
            }}
            disabled={isComparing}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          >
            Clear Results
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      {isComparing && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700">Running algorithm comparison...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a moment for large inputs</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgorithmComparer;
