import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ComplexityResult } from '../../../../../../types/bigo';

interface TeleporterMetaphorProps {
  isActive?: boolean;
  inputSize?: number;
  showComplexity?: boolean;
  animationSpeed?: number;
  interactive?: boolean;
  className?: string;
  onComplexityCalculated?: (result: ComplexityResult) => void;
}

const TeleporterMetaphor: React.FC<TeleporterMetaphorProps> = ({
  isActive = false,
  inputSize = 10,
  showComplexity = true,
  animationSpeed = 1,
  interactive = true,
  className = '',
  onComplexityCalculated,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate data points representing array/hash table elements
  const dataPoints = Array.from({ length: inputSize }, (_, i) => ({
    id: i,
    x: 50 + (i * 400) / Math.max(inputSize - 1, 1),
    y: 150,
    value: `Item ${i + 1}`,
  }));

  // Calculate complexity for O(1) operation
  const calculateComplexity = (): ComplexityResult => ({
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    operations: 1,
    explanation: 'Constant time complexity - access takes the same time regardless of data size',
    optimizationSuggestions: [
      'Perfect for frequent lookups',
      'Ideal for hash tables and direct array access',
      'No performance degradation with scale',
    ],
    confidence: 1.0,
  });

  // Animation sequence for teleporter demonstration
  const animateTeleport = useCallback(
    async (targetIndex: number) => {
      if (isAnimating) return;

      setIsAnimating(true);
      setSelectedIndex(targetIndex);

      // Step 1: Highlight target
      setCurrentStep(1);
      await new Promise((resolve) => setTimeout(resolve, 500 / animationSpeed));

      // Step 2: Show teleporter beam
      setCurrentStep(2);
      await new Promise((resolve) => setTimeout(resolve, 300 / animationSpeed));

      // Step 3: Instant access (no iteration)
      setCurrentStep(3);
      await new Promise((resolve) => setTimeout(resolve, 200 / animationSpeed));

      // Step 4: Success - item retrieved
      setCurrentStep(4);
      await new Promise((resolve) => setTimeout(resolve, 500 / animationSpeed));

      setCurrentStep(0);
      setIsAnimating(false);

      // Report complexity
      if (onComplexityCalculated) {
        onComplexityCalculated(calculateComplexity());
      }
    },
    [isAnimating, animationSpeed, onComplexityCalculated]
  );

  // Auto-demo when component becomes active
  useEffect(() => {
    if (isActive && !isAnimating) {
      const demoSequence = async () => {
        for (let i = 0; i < Math.min(5, inputSize); i++) {
          await animateTeleport(i);
          await new Promise((resolve) => setTimeout(resolve, 1000 / animationSpeed));
        }
      };
      demoSequence();
    }
  }, [isActive, inputSize, animationSpeed, animateTeleport, isAnimating]);

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border-2 border-blue-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-blue-800 mb-1">O(1) - The Teleporter</h3>
        <p className="text-sm text-blue-600">Instant access, no matter the distance</p>
        {showComplexity && (
          <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full text-xs font-mono text-blue-800">
            Time: O(1) | Space: O(1)
          </div>
        )}
      </div>

      {/* Complexity explanation */}
      <div className="absolute top-4 right-4 z-10 max-w-xs">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gray-700 leading-relaxed">
            Like a teleporter, hash tables and direct array access provide instant access to any
            element, regardless of how many items are stored.
          </p>
        </div>
      </div>

      {/* SVG Visualization */}
      <svg ref={svgRef} viewBox="0 0 500 300" className="w-full h-full">
        {/* Background grid representing memory/layout */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0f2fe" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="teleporterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="500" height="300" fill="url(#grid)" />

        {/* Data points (array elements) */}
        {dataPoints.map((point, index) => (
          <g key={point.id}>
            {/* Data point */}
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill={selectedIndex === index && currentStep > 0 ? '#ef4444' : '#3b82f6'}
              stroke="#1e40af"
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer hover:r-10"
              onClick={() => interactive && animateTeleport(index)}
            />

            {/* Value label */}
            <text
              x={point.x}
              y={point.y - 15}
              textAnchor="middle"
              className="text-xs font-mono fill-gray-700"
            >
              {point.value}
            </text>

            {/* Index label */}
            <text
              x={point.x}
              y={point.y + 20}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              [{index}]
            </text>
          </g>
        ))}

        {/* Teleporter beam effect */}
        {currentStep >= 2 && (
          <g>
            {/* Beam base */}
            <circle
              cx={dataPoints[selectedIndex]?.x}
              cy={dataPoints[selectedIndex]?.y}
              r="15"
              fill="url(#teleporterGlow)"
              className="animate-pulse"
            />

            {/* Beam rays */}
            {Array.from({ length: 8 }, (_, i) => (
              <line
                key={i}
                x1={dataPoints[selectedIndex]?.x}
                y1={dataPoints[selectedIndex]?.y}
                x2={dataPoints[selectedIndex]?.x + Math.cos((i * Math.PI) / 4) * 30}
                y2={dataPoints[selectedIndex]?.y + Math.sin((i * Math.PI) / 4) * 30}
                stroke="#3b82f6"
                strokeWidth="2"
                opacity="0.7"
                className="animate-pulse"
              />
            ))}

            {/* Energy particles */}
            {Array.from({ length: 12 }, (_, i) => (
              <circle
                key={i}
                cx={dataPoints[selectedIndex]?.x + Math.cos((i * Math.PI) / 6) * 20}
                cy={dataPoints[selectedIndex]?.y + Math.sin((i * Math.PI) / 6) * 20}
                r="2"
                fill="#60a5fa"
                opacity="0.8"
                className="animate-ping"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </g>
        )}

        {/* Success indicator */}
        {currentStep === 4 && (
          <g>
            <circle
              cx={dataPoints[selectedIndex]?.x}
              cy={dataPoints[selectedIndex]?.y - 40}
              r="20"
              fill="#10b981"
              opacity="0.8"
              className="animate-bounce"
            />
            <text
              x={dataPoints[selectedIndex]?.x}
              y={dataPoints[selectedIndex]?.y - 35}
              textAnchor="middle"
              className="text-sm font-bold fill-white"
            >
              ✓
            </text>
          </g>
        )}

        {/* Operation counter */}
        <g transform="translate(20, 250)">
          <rect x="0" y="0" width="120" height="30" fill="white" stroke="#e5e7eb" rx="4" />
          <text x="10" y="20" className="text-sm fill-gray-700">
            Operations: <tspan className="font-bold text-blue-600">1</tspan>
          </text>
        </g>
      </svg>

      {/* Interactive controls */}
      {interactive && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
          <button
            onClick={() => animateTeleport(Math.floor(Math.random() * inputSize))}
            disabled={isAnimating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isAnimating ? 'Teleporting...' : 'Random Access'}
          </button>
          <button
            onClick={() => animateTeleport(selectedIndex)}
            disabled={isAnimating}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Repeat
          </button>
        </div>
      )}

      {/* Animation step indicator */}
      <div className="absolute bottom-4 right-4">
        <div className="flex space-x-1">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeleporterMetaphor;
