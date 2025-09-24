import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ComplexityResult } from '../../../../types/bigo';

interface TurtleMetaphorProps {
  isActive?: boolean;
  inputSize?: number;
  showComplexity?: boolean;
  animationSpeed?: number;
  interactive?: boolean;
  className?: string;
  onComplexityCalculated?: (result: ComplexityResult) => void;
}

const TurtleMetaphor: React.FC<TurtleMetaphorProps> = ({
  isActive = false,
  inputSize = 6,
  showComplexity = true,
  animationSpeed = 1,
  interactive = true,
  className = '',
  onComplexityCalculated,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentI, setCurrentI] = useState(0);
  const [currentJ, setCurrentJ] = useState(0);
  const [comparisons, setComparisons] = useState<Array<{ i: number; j: number; swapped: boolean }>>(
    []
  );
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate array elements for sorting
  const arrayElements = Array.from({ length: inputSize }, (_, i) => ({
    id: i,
    value: inputSize - i, // Reverse sorted for worst case
    x: 100 + (i * 300) / Math.max(inputSize - 1, 1),
    y: 180,
    height: 20 + (inputSize - i) * 8,
  }));

  // Calculate complexity for O(n²) operation
  const calculateComplexity = useCallback(
    (operations: number): ComplexityResult => ({
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      operations: operations,
      explanation: `Quadratic time complexity - nested operations create n×n comparisons. For n=${inputSize}, worst case is ${inputSize * inputSize} operations`,
      optimizationSuggestions: [
        'Avoid for large datasets',
        'Consider more efficient sorting algorithms',
        'Use for small datasets only (n < 100)',
      ],
      confidence: 0.95,
    }),
    [inputSize]
  );

  // Bubble sort animation (O(n²) example)
  const animateBubbleSort = useCallback(async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentStep(0);
    setComparisons([]);
    setCurrentI(0);
    setCurrentJ(0);

    const elements = [...arrayElements];
    const newComparisons: Array<{ i: number; j: number; swapped: boolean }> = [];
    let operations = 0;

    for (let i = 0; i < elements.length; i++) {
      setCurrentI(i);

      for (let j = 0; j < elements.length - i - 1; j++) {
        setCurrentJ(j);
        operations++;

        // Compare elements
        const comparison = {
          i: j,
          j: j + 1,
          swapped: elements[j].value > elements[j + 1].value,
        };
        newComparisons.push(comparison);
        setComparisons([...newComparisons]);

        setCurrentStep(operations);

        // Swap if needed
        if (comparison.swapped) {
          [elements[j], elements[j + 1]] = [elements[j + 1], elements[j]];
        }

        await new Promise((resolve) => setTimeout(resolve, 800 / animationSpeed));
      }
    }

    setIsAnimating(false);

    // Report complexity
    if (onComplexityCalculated) {
      onComplexityCalculated(calculateComplexity(operations));
    }
  }, [isAnimating, arrayElements, animationSpeed, onComplexityCalculated, calculateComplexity]);

  // Auto-demo when component becomes active
  useEffect(() => {
    if (isActive && !isAnimating) {
      animateBubbleSort();
    }
  }, [isActive, animateBubbleSort, isAnimating]);

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-red-50 to-rose-100 rounded-xl border-2 border-red-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-red-800 mb-1">O(n²) - The Thorough Turtle</h3>
        <p className="text-sm text-red-600">Methodical but slow nested comparisons</p>
        {showComplexity && (
          <div className="mt-2 px-3 py-1 bg-red-100 rounded-full text-xs font-mono text-red-800">
            Time: O(n²) | Space: O(1)
          </div>
        )}
      </div>

      {/* Complexity explanation */}
      <div className="absolute top-4 right-4 z-10 max-w-xs">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gray-700 leading-relaxed">
            Like a turtle carefully comparing every pair, quadratic algorithms check each element
            against every other element, leading to n×n operations.
          </p>
        </div>
      </div>

      {/* SVG Visualization */}
      <svg ref={svgRef} viewBox="0 0 500 300" className="w-full h-full">
        {/* Grid background representing comparison matrix */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#fecaca" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="comparisonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="500" height="300" fill="url(#grid)" />

        {/* Array elements */}
        {arrayElements.map((element, index) => {
          const isComparing = (index === currentJ || index === currentJ + 1) && isAnimating;
          const isCurrentI = index >= arrayElements.length - currentI - 1;

          return (
            <g key={element.id}>
              {/* Element bar */}
              <rect
                x={element.x - 8}
                y={element.y - element.height}
                width="16"
                height={element.height}
                fill={isComparing ? '#ef4444' : isCurrentI ? '#10b981' : '#6b7280'}
                stroke={isComparing ? '#dc2626' : '#374151'}
                strokeWidth="2"
                className="transition-all duration-300"
              />

              {/* Element value */}
              <text
                x={element.x}
                y={element.y + 15}
                textAnchor="middle"
                className={`text-sm font-bold ${isComparing ? 'fill-red-700' : 'fill-gray-700'}`}
              >
                {element.value}
              </text>

              {/* Comparison indicator */}
              {isComparing && (
                <g>
                  <circle
                    cx={element.x}
                    cy={element.y - element.height - 10}
                    r="8"
                    fill="url(#comparisonGlow)"
                    className="animate-pulse"
                  />
                  <text
                    x={element.x}
                    y={element.y - element.height - 5}
                    textAnchor="middle"
                    className="text-xs font-bold fill-red-700"
                  >
                    COMPARE
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Turtle figure */}
        <g transform={`translate(${100 + (currentJ * 300) / Math.max(inputSize - 1, 1)}, 220)`}>
          {/* Turtle shell */}
          <ellipse cx="0" cy="0" rx="15" ry="10" fill="#16a34a" />
          <ellipse cx="0" cy="-2" rx="12" ry="7" fill="#15803d" />

          {/* Shell pattern */}
          <ellipse cx="0" cy="-2" rx="8" ry="4" fill="#22c55e" opacity="0.7" />

          {/* Head */}
          <circle cx="-12" cy="2" r="4" fill="#16a34a" />
          {/* Legs */}
          <circle cx="-8" cy="8" r="2" fill="#16a34a" />
          <circle cx="-2" cy="10" r="2" fill="#16a34a" />
          <circle cx="4" cy="8" r="2" fill="#16a34a" />
          <circle cx="10" cy="6" r="2" fill="#16a34a" />

          {/* Eyes */}
          <circle cx="-14" cy="0" r="1" fill="#000" />
          <circle cx="-10" cy="0" r="1" fill="#000" />
        </g>

        {/* Comparison matrix visualization (mini grid) */}
        <g transform="translate(350, 20)">
          <text x="0" y="0" className="text-xs font-bold fill-gray-700">
            Comparisons:
          </text>
          {Array.from({ length: Math.min(inputSize, 6) }, (_, i) => (
            <g key={i}>
              {Array.from({ length: Math.min(inputSize, 6) }, (_, j) => {
                const isCompared = comparisons.some((c) => c.i === j && c.j === i);
                const wasSwapped = comparisons.find((c) => c.i === j && c.j === i)?.swapped;

                return (
                  <rect
                    key={j}
                    x={j * 8}
                    y={i * 8 + 10}
                    width="6"
                    height="6"
                    fill={isCompared ? (wasSwapped ? '#ef4444' : '#10b981') : '#e5e7eb'}
                    stroke="#9ca3af"
                    strokeWidth="0.5"
                  />
                );
              })}
            </g>
          ))}
        </g>

        {/* Progress indicators */}
        <g transform="translate(20, 20)">
          <text x="0" y="0" className="text-xs font-bold fill-gray-700">
            Outer Loop (i): {currentI}
          </text>
          <rect x="0" y="5" width="100" height="6" fill="#e5e7eb" rx="3" />
          <rect
            x="0"
            y="5"
            width={`${(currentI / inputSize) * 100}`}
            height="6"
            fill="#ef4444"
            rx="3"
            className="transition-all duration-300"
          />

          <text x="0" y="20" className="text-xs font-bold fill-gray-700">
            Inner Loop (j): {currentJ}
          </text>
          <rect x="0" y="25" width="100" height="6" fill="#e5e7eb" rx="3" />
          <rect
            x="0"
            y="25"
            width={`${(currentJ / (inputSize - currentI - 1)) * 100 || 0}`}
            height="6"
            fill="#f97316"
            rx="3"
            className="transition-all duration-300"
          />
        </g>

        {/* Operation counter */}
        <g transform="translate(20, 250)">
          <rect x="0" y="0" width="160" height="30" fill="white" stroke="#e5e7eb" rx="4" />
          <text x="10" y="20" className="text-sm fill-gray-700">
            Operations: <tspan className="font-bold text-red-600">{currentStep}</tspan>
            <tspan className="text-xs"> / {inputSize * inputSize}</tspan>
          </text>
        </g>
      </svg>

      {/* Interactive controls */}
      {interactive && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
          <button
            onClick={animateBubbleSort}
            disabled={isAnimating}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isAnimating ? 'Sorting...' : 'Start Bubble Sort'}
          </button>
          <button
            onClick={() => {
              setCurrentStep(0);
              setComparisons([]);
              setCurrentI(0);
              setCurrentJ(0);
            }}
            disabled={isAnimating}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {/* Animation step indicator */}
      <div className="absolute bottom-4 right-4">
        <div className="flex space-x-1">
          {Array.from({ length: inputSize * inputSize }, (_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-colors ${
                i < currentStep ? 'bg-red-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TurtleMetaphor;
