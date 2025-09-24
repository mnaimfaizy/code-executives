import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ComplexityResult } from '../../../../types/bigo';

interface ConveyorBeltMetaphorProps {
  isActive?: boolean;
  inputSize?: number;
  showComplexity?: boolean;
  animationSpeed?: number;
  interactive?: boolean;
  className?: string;
  onComplexityCalculated?: (result: ComplexityResult) => void;
}

const ConveyorBeltMetaphor: React.FC<ConveyorBeltMetaphorProps> = ({
  isActive = false,
  inputSize = 12,
  showComplexity = true,
  animationSpeed = 1,
  interactive = true,
  className = '',
  onComplexityCalculated,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [processedItems, setProcessedItems] = useState<Set<number>>(new Set());
  const [searchTarget, setSearchTarget] = useState(7);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate conveyor belt items
  const conveyorItems = Array.from({ length: inputSize }, (_, i) => ({
    id: i,
    value: i + 1,
    x: 80 + (i * 320) / Math.max(inputSize - 1, 1),
    y: 150,
    isProcessed: processedItems.has(i),
    isTarget: i + 1 === searchTarget,
  }));

  // Calculate complexity for O(n) operation
  const calculateComplexity = useCallback(
    (steps: number): ComplexityResult => ({
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      operations: steps,
      explanation: `Linear time complexity - each item must be checked sequentially. For n=${inputSize}, worst case is ${inputSize} operations`,
      optimizationSuggestions: [
        'Acceptable for small datasets',
        'Consider sorting for binary search',
        'Good for unsorted data traversal',
      ],
      confidence: 0.95,
    }),
    [inputSize]
  );

  // Linear search animation
  const animateLinearSearch = useCallback(
    async (target: number) => {
      if (isAnimating) return;

      setIsAnimating(true);
      setSearchTarget(target);
      setProcessedItems(new Set());
      setFoundIndex(null);
      setCurrentStep(0);

      for (let i = 0; i < inputSize; i++) {
        setCurrentStep(i + 1);
        setProcessedItems((prev) => new Set([...prev, i]));

        // Check if this item matches target
        if (conveyorItems[i].value === target) {
          setFoundIndex(i);
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 600 / animationSpeed));
      }

      setIsAnimating(false);

      // Report complexity
      if (onComplexityCalculated) {
        onComplexityCalculated(calculateComplexity(currentStep));
      }
    },
    [
      isAnimating,
      inputSize,
      animationSpeed,
      onComplexityCalculated,
      conveyorItems,
      currentStep,
      calculateComplexity,
    ]
  );

  // Auto-demo when component becomes active
  useEffect(() => {
    if (isActive && !isAnimating) {
      const demoSequence = async () => {
        const targets = [3, 7, 10, 12];
        for (const target of targets) {
          await animateLinearSearch(target);
          await new Promise((resolve) => setTimeout(resolve, 2000 / animationSpeed));
        }
      };
      demoSequence();
    }
  }, [isActive, animateLinearSearch, isAnimating, animationSpeed]);

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl border-2 border-orange-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-orange-800 mb-1">O(n) - The Conveyor Belt</h3>
        <p className="text-sm text-orange-600">Sequential processing, one item at a time</p>
        {showComplexity && (
          <div className="mt-2 px-3 py-1 bg-orange-100 rounded-full text-xs font-mono text-orange-800">
            Time: O(n) | Space: O(1)
          </div>
        )}
      </div>

      {/* Complexity explanation */}
      <div className="absolute top-4 right-4 z-10 max-w-xs">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gray-700 leading-relaxed">
            Like items moving along a conveyor belt, linear search must check each item sequentially
            until finding the target or reaching the end.
          </p>
        </div>
      </div>

      {/* SVG Visualization */}
      <svg ref={svgRef} viewBox="0 0 500 300" className="w-full h-full">
        {/* Conveyor belt background */}
        <defs>
          <pattern id="conveyor" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#fed7aa" />
            <rect x="0" y="18" width="20" height="2" fill="#9a3412" />
          </pattern>
          <radialGradient id="itemGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="beltGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="50%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>
        </defs>

        {/* Conveyor belt surface */}
        <rect x="50" y="140" width="400" height="20" fill="url(#beltGradient)" rx="2" />
        <rect x="50" y="155" width="400" height="5" fill="#9a3412" rx="2" />

        {/* Conveyor belt rollers */}
        {Array.from({ length: 8 }, (_, i) => (
          <circle
            key={i}
            cx={70 + i * 45}
            cy={170}
            r="3"
            fill="#6b7280"
            className="animate-spin"
            style={{ animationDuration: '2s', animationDelay: `${i * 0.1}s` }}
          />
        ))}

        {/* Conveyor items */}
        {conveyorItems.map((item, index) => {
          const isProcessed = processedItems.has(index);
          const isCurrent = currentStep === index + 1 && isAnimating;
          const isFound = foundIndex === index;

          return (
            <g key={item.id}>
              {/* Item box */}
              <rect
                x={item.x - 12}
                y={item.y - 25}
                width="24"
                height="24"
                fill={
                  isFound ? '#ef4444' : isCurrent ? '#f97316' : isProcessed ? '#eab308' : '#e5e7eb'
                }
                stroke={isFound ? '#dc2626' : isCurrent ? '#ea580c' : '#9ca3af'}
                strokeWidth="2"
                rx="2"
                className="transition-all duration-300"
              />

              {/* Item value */}
              <text
                x={item.x}
                y={item.y - 10}
                textAnchor="middle"
                className={`text-sm font-bold ${isFound || isCurrent ? 'fill-white' : 'fill-gray-700'}`}
              >
                {item.value}
              </text>

              {/* Processing indicator */}
              {isProcessed && !isFound && (
                <g>
                  <circle cx={item.x} cy={item.y - 35} r="4" fill="#eab308" opacity="0.8" />
                  <text
                    x={item.x}
                    y={item.y - 32}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white"
                  >
                    ✓
                  </text>
                </g>
              )}

              {/* Current processing beam */}
              {isCurrent && (
                <g>
                  <rect
                    x={item.x - 15}
                    y={item.y - 45}
                    width="30"
                    height="8"
                    fill="#f97316"
                    opacity="0.7"
                    rx="4"
                  />
                  <text
                    x={item.x}
                    y={item.y - 40}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white"
                  >
                    CHECKING
                  </text>
                </g>
              )}

              {/* Found indicator */}
              {isFound && (
                <g>
                  <circle
                    cx={item.x}
                    cy={item.y - 45}
                    r="15"
                    fill="#10b981"
                    opacity="0.8"
                    className="animate-bounce"
                  />
                  <text
                    x={item.x}
                    y={item.y - 40}
                    textAnchor="middle"
                    className="text-sm font-bold fill-white"
                  >
                    FOUND!
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Worker figure */}
        <g transform="translate(420, 200)">
          {/* Body */}
          <rect x="5" y="10" width="20" height="30" fill="#f97316" rx="10" />
          {/* Head */}
          <circle cx="15" cy="5" r="8" fill="#fbbf24" />
          {/* Arms (reaching for item) */}
          <rect x="0" y="15" width="8" height="4" fill="#f97316" rx="2" />
          <rect x="22" y="15" width="8" height="4" fill="#f97316" rx="2" />
          {/* Legs */}
          <rect x="8" y="40" width="4" height="15" fill="#f97316" rx="2" />
          <rect x="18" y="40" width="4" height="15" fill="#f97316" rx="2" />
        </g>

        {/* Progress indicator */}
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="200" height="8" fill="#e5e7eb" rx="4" />
          <rect
            x="0"
            y="0"
            width={`${(currentStep / inputSize) * 200}`}
            height="8"
            fill="#f97316"
            rx="4"
            className="transition-all duration-300"
          />
          <text x="100" y="18" textAnchor="middle" className="text-xs fill-gray-600">
            Progress: {currentStep}/{inputSize}
          </text>
        </g>

        {/* Operation counter */}
        <g transform="translate(20, 250)">
          <rect x="0" y="0" width="140" height="30" fill="white" stroke="#e5e7eb" rx="4" />
          <text x="10" y="20" className="text-sm fill-gray-700">
            Operations: <tspan className="font-bold text-orange-600">{currentStep}</tspan>
            {foundIndex !== null && <tspan> | Found at position {foundIndex + 1}</tspan>}
          </text>
        </g>
      </svg>

      {/* Interactive controls */}
      {interactive && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
          <input
            type="number"
            min="1"
            max={inputSize}
            value={searchTarget}
            onChange={(e) =>
              setSearchTarget(Math.max(1, Math.min(inputSize, parseInt(e.target.value) || 1)))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-20"
            disabled={isAnimating}
          />
          <button
            onClick={() => animateLinearSearch(searchTarget)}
            disabled={isAnimating}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isAnimating ? 'Searching...' : 'Find Item'}
          </button>
          <button
            onClick={() => animateLinearSearch(Math.floor(Math.random() * inputSize) + 1)}
            disabled={isAnimating}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Random
          </button>
        </div>
      )}

      {/* Animation step indicator */}
      <div className="absolute bottom-4 right-4">
        <div className="flex space-x-1">
          {Array.from({ length: inputSize }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < currentStep
                  ? 'bg-orange-600'
                  : i === currentStep - 1
                    ? 'bg-amber-500'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConveyorBeltMetaphor;
