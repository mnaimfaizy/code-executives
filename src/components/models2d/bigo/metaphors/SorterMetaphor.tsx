import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ComplexityResult } from '../../../../types/bigo';

interface SorterMetaphorProps {
  isActive?: boolean;
  inputSize?: number;
  showComplexity?: boolean;
  animationSpeed?: number;
  interactive?: boolean;
  className?: string;
  onComplexityCalculated?: (result: ComplexityResult) => void;
}

const SorterMetaphor: React.FC<SorterMetaphorProps> = ({
  isActive = false,
  inputSize = 8,
  showComplexity = true,
  animationSpeed = 1,
  interactive = true,
  className = '',
  onComplexityCalculated,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'divide' | 'sort' | 'merge'>('divide');
  const [dividingGroups, setDividingGroups] = useState<
    Array<{ start: number; end: number; level: number }>
  >([]);
  const [mergingGroups, setMergingGroups] = useState<
    Array<{ left: number[]; right: number[]; result: number[] }>
  >([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate array elements for sorting
  const arrayElements = Array.from({ length: inputSize }, (_, i) => ({
    id: i,
    value: Math.floor(Math.random() * 20) + 1, // Random values for demo
    x: 80 + (i * 340) / Math.max(inputSize - 1, 1),
    y: 200,
    height: 20,
  }));

  // Calculate complexity for O(n log n) operation
  const calculateComplexity = useCallback(
    (operations: number): ComplexityResult => ({
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      operations: operations,
      explanation: `Linearithmic time complexity - divide and conquer approach. For n=${inputSize}, approximately ${inputSize * Math.log2(inputSize)} operations`,
      optimizationSuggestions: [
        'Excellent for large datasets',
        'Stable and predictable performance',
        'Good general-purpose sorting algorithm',
      ],
      confidence: 0.95,
    }),
    [inputSize]
  );

  // Merge sort animation
  const animateMergeSort = useCallback(async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentStep(0);
    setDividingGroups([]);
    setMergingGroups([]);

    const elements = arrayElements.map((el) => el.value);
    let operations = 0;

    // Divide phase
    setCurrentPhase('divide');
    const divide = async (arr: number[], start: number, level: number) => {
      if (arr.length <= 1) return arr;

      const mid = Math.floor(arr.length / 2);
      const left = arr.slice(0, mid);
      const right = arr.slice(mid);

      // Show division
      setDividingGroups((prev) => [...prev, { start, end: start + arr.length - 1, level }]);
      operations++;
      setCurrentStep(operations);
      await new Promise((resolve) => setTimeout(resolve, 600 / animationSpeed));

      await divide(left, start, level + 1);
      await divide(right, start + mid, level + 1);

      // Merge phase
      setCurrentPhase('merge');
      const merged = await merge(left, right);
      return merged;
    };

    const merge = async (left: number[], right: number[]): Promise<number[]> => {
      const result: number[] = [];
      let i = 0,
        j = 0;

      setMergingGroups((prev) => [...prev, { left: [...left], right: [...right], result: [] }]);

      while (i < left.length && j < right.length) {
        operations++;
        setCurrentStep(operations);

        if (left[i] <= right[j]) {
          result.push(left[i++]);
        } else {
          result.push(right[j++]);
        }

        // Update merge progress
        setMergingGroups((prev) => {
          const newGroups = [...prev];
          if (newGroups.length > 0) {
            newGroups[newGroups.length - 1].result = [...result];
          }
          return newGroups;
        });

        await new Promise((resolve) => setTimeout(resolve, 400 / animationSpeed));
      }

      // Add remaining elements
      while (i < left.length) {
        result.push(left[i++]);
        operations++;
        setCurrentStep(operations);
        setMergingGroups((prev) => {
          const newGroups = [...prev];
          if (newGroups.length > 0) {
            newGroups[newGroups.length - 1].result = [...result];
          }
          return newGroups;
        });
        await new Promise((resolve) => setTimeout(resolve, 200 / animationSpeed));
      }

      while (j < right.length) {
        result.push(right[j++]);
        operations++;
        setCurrentStep(operations);
        setMergingGroups((prev) => {
          const newGroups = [...prev];
          if (newGroups.length > 0) {
            newGroups[newGroups.length - 1].result = [...result];
          }
          return newGroups;
        });
        await new Promise((resolve) => setTimeout(resolve, 200 / animationSpeed));
      }

      return result;
    };

    await divide(elements, 0, 0);
    setCurrentPhase('sort');
    setIsAnimating(false);

    // Report complexity
    if (onComplexityCalculated) {
      onComplexityCalculated(calculateComplexity(operations));
    }
  }, [isAnimating, arrayElements, animationSpeed, onComplexityCalculated, calculateComplexity]);

  // Auto-demo when component becomes active
  useEffect(() => {
    if (isActive && !isAnimating) {
      animateMergeSort();
    }
  }, [isActive, animateMergeSort, isAnimating]);

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl border-2 border-purple-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-purple-800 mb-1">O(n log n) - The Clever Sorter</h3>
        <p className="text-sm text-purple-600">Divide, conquer, and merge efficiently</p>
        {showComplexity && (
          <div className="mt-2 px-3 py-1 bg-purple-100 rounded-full text-xs font-mono text-purple-800">
            Time: O(n log n) | Space: O(n)
          </div>
        )}
      </div>

      {/* Complexity explanation */}
      <div className="absolute top-4 right-4 z-10 max-w-xs">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gray-700 leading-relaxed">
            Like a master strategist dividing problems and merging solutions, these algorithms
            achieve remarkable efficiency through smart organization.
          </p>
        </div>
      </div>

      {/* SVG Visualization */}
      <svg ref={svgRef} viewBox="0 0 500 300" className="w-full h-full">
        {/* Tree structure background */}
        <defs>
          <pattern id="treeGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e9d5ff" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="mergeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="500" height="300" fill="url(#treeGrid)" />

        {/* Division visualization (tree branches) */}
        {dividingGroups.map((group, index) => {
          const y = 60 + group.level * 40;
          const width = (group.end - group.start + 1) * (340 / inputSize);
          const x = 80 + (group.start * 340) / inputSize;

          return (
            <g key={index}>
              {/* Division rectangle */}
              <rect
                x={x}
                y={y}
                width={width}
                height="20"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2"
                strokeDasharray={currentPhase === 'divide' ? '5,5' : 'none'}
                opacity="0.7"
              />
              {/* Division label */}
              <text
                x={x + width / 2}
                y={y + 15}
                textAnchor="middle"
                className="text-xs font-bold fill-purple-700"
              >
                DIVIDE
              </text>
            </g>
          );
        })}

        {/* Array elements */}
        {arrayElements.map((element) => {
          const isMerging = mergingGroups.some(
            (group) => group.left.includes(element.value) || group.right.includes(element.value)
          );

          return (
            <g key={element.id}>
              {/* Element circle */}
              <circle
                cx={element.x}
                cy={element.y}
                r="12"
                fill={isMerging ? '#8b5cf6' : '#6b7280'}
                stroke={isMerging ? '#7c3aed' : '#374151'}
                strokeWidth="2"
                className="transition-all duration-300"
              />

              {/* Element value */}
              <text
                x={element.x}
                y={element.y + 4}
                textAnchor="middle"
                className={`text-sm font-bold ${isMerging ? 'fill-white' : 'fill-gray-700'}`}
              >
                {element.value}
              </text>
            </g>
          );
        })}

        {/* Merge visualization */}
        {mergingGroups.map((group, index) => {
          const y = 120 + index * 60;

          return (
            <g key={index} transform={`translate(50, ${y})`}>
              {/* Left array */}
              <g transform="translate(0, 0)">
                <text x="0" y="-5" className="text-xs font-bold fill-purple-700">
                  LEFT:
                </text>
                {group.left.map((val, i) => (
                  <g key={i} transform={`translate(${i * 25}, 0)`}>
                    <rect
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      fill="#fef3c7"
                      stroke="#f59e0b"
                      strokeWidth="1"
                    />
                    <text
                      x="10"
                      y="14"
                      textAnchor="middle"
                      className="text-xs font-bold fill-orange-800"
                    >
                      {val}
                    </text>
                  </g>
                ))}
              </g>

              {/* Right array */}
              <g transform="translate(150, 0)">
                <text x="0" y="-5" className="text-xs font-bold fill-purple-700">
                  RIGHT:
                </text>
                {group.right.map((val, i) => (
                  <g key={i} transform={`translate(${i * 25}, 0)`}>
                    <rect
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      fill="#fef3c7"
                      stroke="#f59e0b"
                      strokeWidth="1"
                    />
                    <text
                      x="10"
                      y="14"
                      textAnchor="middle"
                      className="text-xs font-bold fill-orange-800"
                    >
                      {val}
                    </text>
                  </g>
                ))}
              </g>

              {/* Merge arrow */}
              <path
                d="M 120 10 L 135 10 L 135 5 L 145 10 L 135 15 L 135 10"
                fill="#8b5cf6"
                stroke="#7c3aed"
                strokeWidth="2"
              />

              {/* Result array */}
              <g transform="translate(200, 0)">
                <text x="0" y="-5" className="text-xs font-bold fill-green-700">
                  MERGED:
                </text>
                {group.result.map((val, i) => (
                  <g key={i} transform={`translate(${i * 25}, 0)`}>
                    <rect
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      fill="#d1fae5"
                      stroke="#10b981"
                      strokeWidth="1"
                    />
                    <text
                      x="10"
                      y="14"
                      textAnchor="middle"
                      className="text-xs font-bold fill-green-800"
                    >
                      {val}
                    </text>
                  </g>
                ))}
              </g>
            </g>
          );
        })}

        {/* Strategy figure (divide and conquer) */}
        <g transform="translate(400, 220)">
          {/* Body */}
          <rect x="5" y="10" width="20" height="30" fill="#8b5cf6" rx="10" />
          {/* Head */}
          <circle cx="15" cy="5" r="8" fill="#fbbf24" />
          {/* Sword (divide) */}
          <rect x="-5" y="15" width="15" height="2" fill="#ef4444" transform="rotate(-45 2.5 16)" />
          {/* Shield (conquer) */}
          <ellipse cx="30" cy="20" rx="3" ry="8" fill="#10b981" />
        </g>

        {/* Phase indicator */}
        <g transform="translate(20, 40)">
          <circle
            cx="10"
            cy="10"
            r="8"
            fill={currentPhase === 'divide' ? '#8b5cf6' : '#e5e7eb'}
            className="transition-all duration-300"
          />
          <text x="25" y="15" className="text-sm fill-gray-700">
            Divide {currentPhase === 'divide' && '✓'}
          </text>

          <circle
            cx="10"
            cy="30"
            r="8"
            fill={currentPhase === 'merge' ? '#8b5cf6' : '#e5e7eb'}
            className="transition-all duration-300"
          />
          <text x="25" y="35" className="text-sm fill-gray-700">
            Merge {currentPhase === 'merge' && '✓'}
          </text>

          <circle
            cx="10"
            cy="50"
            r="8"
            fill={currentPhase === 'sort' ? '#10b981' : '#e5e7eb'}
            className="transition-all duration-300"
          />
          <text x="25" y="55" className="text-sm fill-gray-700">
            Complete {currentPhase === 'sort' && '✓'}
          </text>
        </g>

        {/* Operation counter */}
        <g transform="translate(20, 250)">
          <rect x="0" y="0" width="160" height="30" fill="white" stroke="#e5e7eb" rx="4" />
          <text x="10" y="20" className="text-sm fill-gray-700">
            Operations: <tspan className="font-bold text-purple-600">{currentStep}</tspan>
            <tspan className="text-xs"> / ~{Math.round(inputSize * Math.log2(inputSize))}</tspan>
          </text>
        </g>
      </svg>

      {/* Interactive controls */}
      {interactive && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
          <button
            onClick={animateMergeSort}
            disabled={isAnimating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isAnimating ? 'Sorting...' : 'Start Merge Sort'}
          </button>
          <button
            onClick={() => {
              setCurrentStep(0);
              setDividingGroups([]);
              setMergingGroups([]);
              setCurrentPhase('divide');
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
          {Array.from({ length: Math.round(inputSize * Math.log2(inputSize)) }, (_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-colors ${
                i < currentStep ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SorterMetaphor;
