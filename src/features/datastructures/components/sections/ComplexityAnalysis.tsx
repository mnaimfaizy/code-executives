import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  BarChart3,
  Calculator,
  Info,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

interface DataStructureComplexity {
  name: string;
  access: string;
  search: string;
  insertion: string;
  deletion: string;
  space: string;
  color: string;
}

const ComplexityAnalysis: React.FC = () => {
  const [selectedComplexity, setSelectedComplexity] = useState<string>('O(n)');
  const [inputSize, setInputSize] = useState<number>(10);
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [activeComparison, setActiveComparison] = useState<'time' | 'space'>('time');
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [currentN, setCurrentN] = useState<number>(0);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Data structure complexity comparison
  const dataStructures: DataStructureComplexity[] = [
    {
      name: 'Array',
      access: 'O(1)',
      search: 'O(n)',
      insertion: 'O(n)',
      deletion: 'O(n)',
      space: 'O(n)',
      color: '#3B82F6',
    },
    {
      name: 'Linked List',
      access: 'O(n)',
      search: 'O(n)',
      insertion: 'O(1)',
      deletion: 'O(1)',
      space: 'O(n)',
      color: '#10B981',
    },
    {
      name: 'Stack',
      access: 'O(n)',
      search: 'O(n)',
      insertion: 'O(1)',
      deletion: 'O(1)',
      space: 'O(n)',
      color: '#8B5CF6',
    },
    {
      name: 'Queue',
      access: 'O(n)',
      search: 'O(n)',
      insertion: 'O(1)',
      deletion: 'O(1)',
      space: 'O(n)',
      color: '#F59E0B',
    },
    {
      name: 'Hash Table',
      access: 'O(1)',
      search: 'O(1)',
      insertion: 'O(1)',
      deletion: 'O(1)',
      space: 'O(n)',
      color: '#EF4444',
    },
    {
      name: 'Binary Search Tree',
      access: 'O(log n)',
      search: 'O(log n)',
      insertion: 'O(log n)',
      deletion: 'O(log n)',
      space: 'O(n)',
      color: '#84CC16',
    },
    {
      name: 'AVL Tree',
      access: 'O(log n)',
      search: 'O(log n)',
      insertion: 'O(log n)',
      deletion: 'O(log n)',
      space: 'O(n)',
      color: '#06B6D4',
    },
    {
      name: 'Heap',
      access: 'O(log n)',
      search: 'O(n)',
      insertion: 'O(log n)',
      deletion: 'O(log n)',
      space: 'O(n)',
      color: '#EC4899',
    },
  ];

  // Calculate complexity value for given input size
  const calculateComplexity = useCallback((complexity: string, n: number): number => {
    switch (complexity) {
      case 'O(1)':
        return 1;
      case 'O(log n)':
        return Math.log2(n);
      case 'O(n)':
        return n;
      case 'O(n log n)':
        return n * Math.log2(n);
      case 'O(n²)':
        return n * n;
      case 'O(2ⁿ)':
        return Math.pow(2, Math.min(n, 10)); // Cap for safety
      default:
        return n;
    }
  }, []);

  // Animation for complexity growth with controlled speed
  const startAnimation = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationProgress(0);
    setCurrentN(0);
    lastFrameTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTimeRef.current;

      // Update every 16ms (60fps), adjusted by speed
      if (deltaTime > 16 / animationSpeed) {
        lastFrameTimeRef.current = currentTime;

        setAnimationProgress((prev) => {
          if (prev >= 100) {
            setIsAnimating(false);
            // Don't set currentN here - it causes state update issues
            return 100;
          }
          const newProgress = prev + 0.5 * animationSpeed;
          const newN = Math.floor((newProgress / 100) * 50);
          // Use setTimeout to ensure state updates happen in correct order
          setTimeout(() => setCurrentN(newN), 0);
          return newProgress;
        });
      }

      if (animationProgress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Set final currentN value when animation completes
        setCurrentN(50);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isAnimating, animationProgress, animationSpeed]);

  const pauseAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  const resetAnimation = useCallback(() => {
    pauseAnimation();
    // Reset both progress and currentN to initial state
    setAnimationProgress(0);
    setCurrentN(0);
  }, [pauseAnimation]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Get complexity color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'O(1)':
        return '#10B981';
      case 'O(log n)':
        return '#3B82F6';
      case 'O(n)':
        return '#F59E0B';
      case 'O(n log n)':
        return '#8B5CF6';
      case 'O(n²)':
        return '#EF4444';
      case 'O(2ⁿ)':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  // Generate SVG path for complexity curve
  const generatePath = (complexity: string, maxValue: number) => {
    const width = 400;
    const height = 200;
    const maxN = 50;

    let path = `M 0 ${height}`;

    for (let i = 1; i <= maxN; i++) {
      const progress = i <= (maxN * animationProgress) / 100 ? 1 : 0;
      const x = (i / maxN) * width;
      const value = calculateComplexity(complexity, i);
      const y = height - (value / maxValue) * height * progress;
      path += ` L ${x} ${y}`;
    }

    return path;
  };

  // Get current position of animated marker on curve
  const getMarkerPosition = (complexity: string, maxValue: number) => {
    const width = 400;
    const height = 200;
    const maxN = 50;
    const n = currentN;

    if (n === 0) return { x: 0, y: height };

    const x = (n / maxN) * width;
    const value = calculateComplexity(complexity, n);
    const y = height - (value / maxValue) * height;

    return { x, y };
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-red-600">
          <TrendingUp className="w-8 h-8" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Complexity Analysis
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Master Big-O notation and understand how different data structures perform as your data
          grows. See why choosing the right data structure matters for performance.
        </p>
      </div>

      {/* Big-O Growth Curves */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Big-O Growth Visualization</h2>
              <p className="text-sm text-gray-600">
                See how different complexities scale with input size
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">Understanding Big-O Notation:</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>
                • <strong>O(1)</strong> - Constant time: Always takes the same time
              </li>
              <li>
                • <strong>O(log n)</strong> - Logarithmic: Divides problem in half each step
              </li>
              <li>
                • <strong>O(n)</strong> - Linear: Time grows proportionally with input
              </li>
              <li>
                • <strong>O(n log n)</strong> - Linearithmic: Efficient sorting algorithms
              </li>
              <li>
                • <strong>O(n²)</strong> - Quadratic: Nested loops over input
              </li>
              <li>
                • <strong>O(2ⁿ)</strong> - Exponential: Doubles with each additional input
              </li>
            </ul>
          </div>
        )}

        {/* Live Animation Description */}
        {currentN > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
            <h4 className="font-semibold text-blue-900 mb-2">
              📊 {isAnimating ? 'Currently' : 'Stopped'} at n = {currentN} (Input Size)
            </h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                {isAnimating
                  ? 'Watch how different algorithms scale as we increase the input size. Notice how:'
                  : "Here's how different algorithms performed at this input size:"}
              </p>
              <ul className="ml-4 space-y-1">
                <li>
                  • <strong className="text-green-700">O(1)</strong> stays completely flat - always
                  1 operation
                </li>
                <li>
                  • <strong className="text-blue-700">O(log n)</strong> grows very slowly - only{' '}
                  {Math.round(calculateComplexity('O(log n)', currentN))} operations
                </li>
                <li>
                  • <strong className="text-yellow-700">O(n)</strong> grows linearly - {currentN}{' '}
                  operations
                </li>
                <li>
                  • <strong className="text-purple-700">O(n log n)</strong> grows faster -{' '}
                  {Math.round(calculateComplexity('O(n log n)', currentN))} operations
                </li>
                <li>
                  • <strong className="text-red-700">O(n²)</strong> grows rapidly - already{' '}
                  {Math.round(calculateComplexity('O(n²)', currentN)).toLocaleString()} operations!
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Animation Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={startAnimation}
              disabled={isAnimating || animationProgress === 100}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Animate Growth</span>
            </button>

            <button
              onClick={pauseAnimation}
              disabled={!isAnimating}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>

            <button
              onClick={resetAnimation}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            <div className="text-sm text-gray-700 font-medium">
              Progress: {Math.round(animationProgress)}% | n = {currentN}
            </div>
          </div>

          {/* Animation Speed Control */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Animation Speed:</label>
            <div className="flex space-x-2">
              {[0.5, 1, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setAnimationSpeed(speed)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    animationSpeed === speed
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              (Slower speeds help understand growth patterns)
            </span>
          </div>
        </div>

        {/* Growth Curves Chart */}
        <div className="bg-gray-50 rounded-lg p-6">
          {/* Live Operation Counters */}
          {currentN > 0 && (
            <div className="mb-4 grid grid-cols-5 gap-2">
              {['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'].map((complexity) => {
                const operations = Math.round(calculateComplexity(complexity, currentN));
                return (
                  <div
                    key={complexity}
                    className="bg-white rounded-lg p-3 border-2 transition-all"
                    style={{ borderColor: getComplexityColor(complexity) }}
                  >
                    <div
                      className="text-xs font-semibold"
                      style={{ color: getComplexityColor(complexity) }}
                    >
                      {complexity}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {operations.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">operations</div>
                  </div>
                );
              })}
            </div>
          )}

          <svg viewBox="0 0 400 200" className="w-full h-64">
            {/* Grid lines */}
            <defs>
              <pattern id="complexity-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#complexity-grid)" />

            {/* Axes */}
            <line x1="0" y1="200" x2="400" y2="200" stroke="#6B7280" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="200" stroke="#6B7280" strokeWidth="1" />

            {/* Complexity curves */}
            {['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'].map((complexity) => {
              const color = getComplexityColor(complexity);
              const markerPos = getMarkerPosition(complexity, 100);

              return (
                <g key={complexity}>
                  {/* Curve path */}
                  <path
                    d={generatePath(complexity, 100)}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    className="transition-all duration-300"
                  />

                  {/* Animated marker at current position */}
                  {currentN > 0 && (
                    <>
                      <circle
                        cx={markerPos.x}
                        cy={markerPos.y}
                        r="5"
                        fill={color}
                        className="animate-pulse"
                      />
                      <circle
                        cx={markerPos.x}
                        cy={markerPos.y}
                        r="8"
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    </>
                  )}
                </g>
              );
            })}

            {/* Current n value indicator line */}
            {currentN > 0 && (
              <line
                x1={(currentN / 50) * 400}
                y1="0"
                x2={(currentN / 50) * 400}
                y2="200"
                stroke="#6B7280"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />
            )}

            {/* Labels */}
            <text x="200" y="195" textAnchor="middle" className="text-xs fill-gray-600">
              Input Size (n)
            </text>
            <text
              x="5"
              y="100"
              textAnchor="middle"
              className="text-xs fill-gray-600"
              transform="rotate(-90 5 100)"
            >
              Time/Operations
            </text>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'].map((complexity) => (
              <div key={complexity} className="flex items-center space-x-2">
                <div
                  className="w-4 h-1 rounded"
                  style={{ backgroundColor: getComplexityColor(complexity) }}
                ></div>
                <span className="text-sm text-gray-700">{complexity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Complexity Calculator */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calculator className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Complexity Calculator</h2>
            <p className="text-sm text-gray-600">Calculate operations for different input sizes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Size (n):
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={inputSize}
                onChange={(e) => setInputSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span className="font-medium text-blue-600">{inputSize}</span>
                <span>100</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complexity Function:
              </label>
              <select
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         bg-white text-gray-900
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="O(1)">O(1) - Constant</option>
                <option value="O(log n)">O(log n) - Logarithmic</option>
                <option value="O(n)">O(n) - Linear</option>
                <option value="O(n log n)">O(n log n) - Linearithmic</option>
                <option value="O(n²)">O(n²) - Quadratic</option>
                <option value="O(2ⁿ)">O(2ⁿ) - Exponential</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculation Results</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Input Size:</span>
                  <span className="font-bold text-gray-900">{inputSize}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Complexity:</span>
                  <span
                    className="font-bold"
                    style={{ color: getComplexityColor(selectedComplexity) }}
                  >
                    {selectedComplexity}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <span className="text-gray-600">Operations:</span>
                  <span className="font-bold text-xl text-gray-900">
                    {Math.round(
                      calculateComplexity(selectedComplexity, inputSize)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart Comparison */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Visual Comparison at n = {inputSize}
              </h4>

              <div className="space-y-3">
                {['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'].map((complexity) => {
                  const operations = Math.round(calculateComplexity(complexity, inputSize));
                  const maxOps = Math.round(calculateComplexity('O(n²)', inputSize));
                  const percentage = (operations / maxOps) * 100;
                  const isSelected = complexity === selectedComplexity;

                  return (
                    <div key={complexity} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span
                          className="font-medium"
                          style={{ color: getComplexityColor(complexity) }}
                        >
                          {complexity}
                        </span>
                        <span className="font-bold text-gray-900">
                          {operations.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500`}
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getComplexityColor(complexity),
                            boxShadow: isSelected
                              ? `0 0 0 2px white, 0 0 0 4px ${getComplexityColor(complexity)}`
                              : 'none',
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Bar lengths are relative to O(n²) ={' '}
                {Math.round(calculateComplexity('O(n²)', inputSize)).toLocaleString()} operations
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Structure Complexity Comparison */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Data Structure Performance Comparison
            </h2>
            <p className="text-sm text-gray-600">
              Compare time complexities across different operations
            </p>
          </div>
        </div>

        {/* Time vs Space toggle */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveComparison('time')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeComparison === 'time'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Time Complexity
          </button>
          <button
            onClick={() => setActiveComparison('space')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeComparison === 'space'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Space Complexity
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Data Structure</th>
                {activeComparison === 'time' ? (
                  <>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Access</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Search</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Insertion</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Deletion</th>
                  </>
                ) : (
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Space</th>
                )}
              </tr>
            </thead>
            <tbody>
              {dataStructures.map((ds, index) => (
                <tr
                  key={ds.name}
                  className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: ds.color }}
                      ></div>
                      <span className="font-medium text-gray-900">{ds.name}</span>
                    </div>
                  </td>
                  {activeComparison === 'time' ? (
                    <>
                      <td className="text-center py-3 px-4">
                        <span
                          className="px-2 py-1 rounded text-sm font-medium"
                          style={{
                            backgroundColor: `${getComplexityColor(ds.access)}20`,
                            color: getComplexityColor(ds.access),
                          }}
                        >
                          {ds.access}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span
                          className="px-2 py-1 rounded text-sm font-medium"
                          style={{
                            backgroundColor: `${getComplexityColor(ds.search)}20`,
                            color: getComplexityColor(ds.search),
                          }}
                        >
                          {ds.search}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span
                          className="px-2 py-1 rounded text-sm font-medium"
                          style={{
                            backgroundColor: `${getComplexityColor(ds.insertion)}20`,
                            color: getComplexityColor(ds.insertion),
                          }}
                        >
                          {ds.insertion}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span
                          className="px-2 py-1 rounded text-sm font-medium"
                          style={{
                            backgroundColor: `${getComplexityColor(ds.deletion)}20`,
                            color: getComplexityColor(ds.deletion),
                          }}
                        >
                          {ds.deletion}
                        </span>
                      </td>
                    </>
                  ) : (
                    <td className="text-center py-3 px-4">
                      <span
                        className="px-2 py-1 rounded text-sm font-medium"
                        style={{
                          backgroundColor: `${getComplexityColor(ds.space)}20`,
                          color: getComplexityColor(ds.space),
                        }}
                      >
                        {ds.space}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Performance Insights</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <div className="w-6 h-6 bg-green-100 rounded mr-2 flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">⚡</span>
              </div>
              Constant Time O(1)
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              The holy grail of performance - execution time doesn't change with input size.
            </p>
            <div className="text-xs text-gray-500">
              <strong>Examples:</strong> Array access, Hash table operations
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded mr-2 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">📈</span>
              </div>
              Logarithmic O(log n)
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Excellent scalability - doubles input size, adds just one more step.
            </p>
            <div className="text-xs text-gray-500">
              <strong>Examples:</strong> Binary search, Balanced tree operations
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <div className="w-6 h-6 bg-red-100 rounded mr-2 flex items-center justify-center">
                <span className="text-xs font-bold text-red-600">⚠️</span>
              </div>
              Quadratic O(n²)
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Performance degrades quickly - avoid for large datasets.
            </p>
            <div className="text-xs text-gray-500">
              <strong>Examples:</strong> Nested loops, Bubble sort
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplexityAnalysis;
