import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  AlgorithmDescription,
  PerformanceDataPoint,
  ComplexityType,
} from '../../../../types/bigo';

interface PerformanceProfilerProps {
  isActive?: boolean;
  algorithm?: AlgorithmDescription;
  inputSizes?: number[];
  showGraph?: boolean;
  animationSpeed?: number;
  interactive?: boolean;
  className?: string;
  onProfileComplete?: (data: PerformanceDataPoint[]) => void;
  onAlgorithmChange?: (algorithm: AlgorithmDescription) => void;
}

const PerformanceProfiler: React.FC<PerformanceProfilerProps> = ({
  isActive = false,
  algorithm,
  inputSizes = [10, 50, 100, 500, 1000],
  showGraph = true,
  animationSpeed = 1,
  interactive = true,
  className = '',
  onProfileComplete,
  onAlgorithmChange,
}) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmDescription | null>(
    algorithm || null
  );
  const [isProfiling, setIsProfiling] = useState(false);
  const [profileData, setProfileData] = useState<PerformanceDataPoint[]>([]);
  const [currentTestSize, setCurrentTestSize] = useState(0);
  const [progress, setProgress] = useState(0);

  // Available algorithms for profiling
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

  // Simulate algorithm performance for a given input size
  const simulatePerformance = useCallback(
    async (algo: AlgorithmDescription, size: number): Promise<PerformanceDataPoint> => {
      let operations = 0;
      const startTime = performance.now();

      // Simulate different complexity behaviors
      switch (algo.timeComplexity) {
        case 'O(1)': {
          operations = 1;
          await new Promise((resolve) => setTimeout(resolve, 1 / animationSpeed));
          break;
        }
        case 'O(log n)': {
          operations = Math.ceil(Math.log2(size));
          await new Promise((resolve) => setTimeout(resolve, (operations * 10) / animationSpeed));
          break;
        }
        case 'O(n)': {
          operations = size;
          await new Promise((resolve) => setTimeout(resolve, (operations * 2) / animationSpeed));
          break;
        }
        case 'O(n log n)': {
          operations = size * Math.ceil(Math.log2(size));
          await new Promise((resolve) => setTimeout(resolve, (operations * 1) / animationSpeed));
          break;
        }
        case 'O(n²)': {
          operations = size * size;
          const delay = Math.min(operations * 0.1, 2000) / animationSpeed;
          await new Promise((resolve) => setTimeout(resolve, delay));
          break;
        }
        case 'O(2^n)': {
          operations = Math.pow(2, Math.min(size, 20));
          const expDelay = Math.min(operations * 0.001, 1000) / animationSpeed;
          await new Promise((resolve) => setTimeout(resolve, expDelay));
          break;
        }
        default: {
          operations = size;
          await new Promise((resolve) => setTimeout(resolve, operations / animationSpeed));
        }
      }

      const endTime = performance.now();
      return {
        inputSize: size,
        operations,
        timeMs: endTime - startTime,
        complexity: algo.timeComplexity,
      };
    },
    [animationSpeed]
  );

  // Run performance profiling
  const runProfiling = useCallback(async () => {
    if (!selectedAlgorithm || isProfiling) return;

    setIsProfiling(true);
    setProfileData([]);
    setProgress(0);
    const results: PerformanceDataPoint[] = [];

    for (let i = 0; i < inputSizes.length; i++) {
      const size = inputSizes[i];
      setCurrentTestSize(size);

      const dataPoint = await simulatePerformance(selectedAlgorithm, size);
      results.push(dataPoint);

      setProfileData((prev) => [...prev, dataPoint]);
      setProgress(((i + 1) / inputSizes.length) * 100);
    }

    setIsProfiling(false);
    setCurrentTestSize(0);
    setProgress(100);

    if (onProfileComplete) {
      onProfileComplete(results);
    }
  }, [selectedAlgorithm, isProfiling, inputSizes, simulatePerformance, onProfileComplete]);

  // Auto-run profiling when component becomes active
  useEffect(() => {
    if (isActive && selectedAlgorithm && !isProfiling && profileData.length === 0) {
      runProfiling();
    }
  }, [isActive, selectedAlgorithm, runProfiling, isProfiling, profileData.length]);

  // Handle algorithm selection
  const handleAlgorithmChange = (algo: AlgorithmDescription) => {
    setSelectedAlgorithm(algo);
    setProfileData([]);
    setProgress(0);
    if (onAlgorithmChange) {
      onAlgorithmChange(algo);
    }
  };

  // Get color for complexity
  const getComplexityColor = (complexity: ComplexityType) => {
    switch (complexity) {
      case 'O(1)':
        return '#3B82F6';
      case 'O(log n)':
        return '#10B981';
      case 'O(n)':
        return '#F59E0B';
      case 'O(n log n)':
        return '#8B5CF6';
      case 'O(n²)':
        return '#EF4444';
      case 'O(2^n)':
        return '#7F1D1D';
      default:
        return '#6B7280';
    }
  };

  // Calculate graph dimensions and scaling
  const graphWidth = 600;
  const graphHeight = 300;
  const padding = 60;

  const maxOperations = Math.max(...profileData.map((d) => d.operations), 1);
  const maxTime = Math.max(...profileData.map((d) => d.timeMs), 1);
  const maxInputSize = Math.max(...inputSizes, 1);

  const scaleX = (graphWidth - 2 * padding) / maxInputSize;
  const scaleYOps = (graphHeight - 2 * padding) / maxOperations;
  const scaleYTime = (graphHeight - 2 * padding) / maxTime;

  // Generate SVG path for operations line
  const operationsPath =
    profileData.length > 1
      ? profileData
          .map((point, index) => {
            const x = padding + point.inputSize * scaleX;
            const y = graphHeight - padding - point.operations * scaleYOps;
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
          })
          .join(' ')
      : '';

  // Generate SVG path for time line
  const timePath =
    profileData.length > 1
      ? profileData
          .map((point, index) => {
            const x = padding + point.inputSize * scaleX;
            const y = graphHeight - padding - point.timeMs * scaleYTime;
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
          })
          .join(' ')
      : '';

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl border-2 border-slate-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Performance Profiler</h3>
        <p className="text-sm text-slate-600">Analyze algorithm performance across input sizes</p>
      </div>

      {/* Algorithm Selection */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <label className="block text-xs font-bold text-gray-700 mb-2">Select Algorithm:</label>
          <select
            value={selectedAlgorithm?.name || ''}
            onChange={(e) => {
              const algo = availableAlgorithms.find((a) => a.name === e.target.value);
              if (algo) handleAlgorithmChange(algo);
            }}
            disabled={isProfiling}
            className="w-48 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose algorithm...</option>
            {availableAlgorithms.map((algo) => (
              <option key={algo.name} value={algo.name}>
                {algo.name} - {algo.timeComplexity}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Indicator */}
      {isProfiling && (
        <div className="absolute top-20 left-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Profiling: Input size {currentTestSize}
              </span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Graph */}
      {showGraph && profileData.length > 0 && (
        <div className="absolute bottom-20 left-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Performance Graph</h4>
            <div className="flex justify-center">
              <svg
                width={graphWidth}
                height={graphHeight}
                className="border border-gray-200 rounded"
              >
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Axes */}
                <line
                  x1={padding}
                  y1={padding}
                  x2={padding}
                  y2={graphHeight - padding}
                  stroke="#374151"
                  strokeWidth="2"
                />
                <line
                  x1={padding}
                  y1={graphHeight - padding}
                  x2={graphWidth - padding}
                  y2={graphHeight - padding}
                  stroke="#374151"
                  strokeWidth="2"
                />

                {/* Axis labels */}
                <text
                  x={padding - 10}
                  y={padding - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  Operations/Time
                </text>
                <text
                  x={graphWidth - padding}
                  y={graphHeight - padding + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  Input Size
                </text>

                {/* Operations line */}
                {operationsPath && (
                  <path
                    d={operationsPath}
                    fill="none"
                    stroke={getComplexityColor(selectedAlgorithm!.timeComplexity)}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Time line (dashed) */}
                {timePath && (
                  <path
                    d={timePath}
                    fill="none"
                    stroke={getComplexityColor(selectedAlgorithm!.timeComplexity)}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.7"
                  />
                )}

                {/* Data points */}
                {profileData.map((point, index) => (
                  <circle
                    key={index}
                    cx={padding + point.inputSize * scaleX}
                    cy={graphHeight - padding - point.operations * scaleYOps}
                    r="4"
                    fill={getComplexityColor(point.complexity)}
                    stroke="white"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex justify-center mt-3 space-x-6">
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-0.5 bg-current"
                  style={{ color: getComplexityColor(selectedAlgorithm!.timeComplexity) }}
                ></div>
                <span className="text-xs text-gray-600">Operations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-0.5 bg-current opacity-70"
                  style={{ color: getComplexityColor(selectedAlgorithm!.timeComplexity) }}
                ></div>
                <span className="text-xs text-gray-600">Time (ms)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {profileData.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-h-32 overflow-y-auto">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Performance Data</h4>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="font-medium text-gray-600">Size</div>
              <div className="font-medium text-gray-600">Operations</div>
              <div className="font-medium text-gray-600">Time (ms)</div>
              <div className="font-medium text-gray-600">Complexity</div>
              {profileData.map((point, index) => (
                <React.Fragment key={index}>
                  <div className="text-gray-800">{point.inputSize}</div>
                  <div className="text-gray-800">{point.operations.toLocaleString()}</div>
                  <div className="text-gray-800">{point.timeMs.toFixed(1)}</div>
                  <div className="text-gray-800">{point.complexity}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      {interactive && selectedAlgorithm && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
          <button
            onClick={runProfiling}
            disabled={isProfiling}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors text-sm"
          >
            {isProfiling ? 'Profiling...' : 'Run Profile'}
          </button>
        </div>
      )}

      {/* Algorithm Info */}
      {selectedAlgorithm && (
        <div className="absolute top-20 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
            <h4 className="text-sm font-bold text-gray-700 mb-1">{selectedAlgorithm.name}</h4>
            <p className="text-xs text-gray-600 mb-2">{selectedAlgorithm.description}</p>
            <div className="flex space-x-2">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                Time: {selectedAlgorithm.timeComplexity}
              </span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                Space: {selectedAlgorithm.spaceComplexity}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceProfiler;
