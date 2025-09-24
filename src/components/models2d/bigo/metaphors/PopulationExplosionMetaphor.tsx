import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ComplexityResult } from '../../../../types/bigo';

interface PopulationExplosionMetaphorProps {
  isActive?: boolean;
  inputSize?: number;
  showComplexity?: boolean;
  animationSpeed?: number;
  interactive?: boolean;
  className?: string;
  onComplexityCalculated?: (result: ComplexityResult) => void;
}

const PopulationExplosionMetaphor: React.FC<PopulationExplosionMetaphorProps> = ({
  isActive = false,
  inputSize = 4,
  showComplexity = true,
  animationSpeed = 1,
  interactive = true,
  className = '',
  onComplexityCalculated,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const [population, setPopulation] = useState<
    Array<{ id: number; x: number; y: number; generation: number }>
  >([]);
  const [subsets, setSubsets] = useState<string[][]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate initial population
  const initialPopulation = Array.from({ length: inputSize }, (_, i) => ({
    id: i,
    value: String.fromCharCode(65 + i), // A, B, C, D...
    x: 100 + (i * 300) / Math.max(inputSize - 1, 1),
    y: 200,
  }));

  // Calculate complexity for O(2^n) operation
  const calculateComplexity = useCallback(
    (operations: number): ComplexityResult => ({
      timeComplexity: 'O(2^n)',
      spaceComplexity: 'O(2^n)',
      operations: operations,
      explanation: `Exponential time complexity - each addition doubles the work. For n=${inputSize}, generates ${Math.pow(2, inputSize)} subsets`,
      optimizationSuggestions: [
        'Avoid when possible',
        'Only suitable for very small n (n ≤ 20)',
        'Consider approximation algorithms',
        'Use dynamic programming when feasible',
      ],
      confidence: 0.95,
    }),
    [inputSize]
  );

  // Generate all subsets (power set) animation
  const animatePowerSet = useCallback(async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentStep(0);
    setCurrentGeneration(0);
    setPopulation([]);
    setSubsets([]);

    const elements = initialPopulation.map((p) => p.value);
    let operations = 0;
    const allSubsets: string[][] = [];

    // Generate power set using bit manipulation
    const totalSubsets = Math.pow(2, elements.length);

    for (let i = 0; i < totalSubsets; i++) {
      const subset: string[] = [];
      let gen = 0;

      // Convert number to binary to get subset
      for (let j = 0; j < elements.length; j++) {
        if (i & (1 << j)) {
          subset.push(elements[j]);
          gen = Math.max(gen, j + 1);
        }
      }

      operations++;
      setCurrentStep(operations);
      setCurrentGeneration(gen);

      allSubsets.push(subset);
      setSubsets([...allSubsets]);

      // Create population dots for visualization
      const newPopulation = allSubsets.flatMap((subset, subsetIndex) =>
        subset.map((_item, itemIndex) => ({
          id: subsetIndex * elements.length + itemIndex,
          x: 50 + Math.random() * 400,
          y: 50 + Math.random() * 150,
          generation: gen,
        }))
      );
      setPopulation(newPopulation);

      await new Promise((resolve) => setTimeout(resolve, 300 / animationSpeed));
    }

    setIsAnimating(false);

    // Report complexity
    if (onComplexityCalculated) {
      onComplexityCalculated(calculateComplexity(operations));
    }
  }, [isAnimating, initialPopulation, animationSpeed, onComplexityCalculated, calculateComplexity]);

  // Auto-demo when component becomes active
  useEffect(() => {
    if (isActive && !isAnimating) {
      animatePowerSet();
    }
  }, [isActive, animatePowerSet, isAnimating]);

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-red-50 to-pink-100 rounded-xl border-2 border-red-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-red-800 mb-1">O(2^n) - Population Explosion</h3>
        <p className="text-sm text-red-600">Exponential growth becomes unmanageable</p>
        {showComplexity && (
          <div className="mt-2 px-3 py-1 bg-red-100 rounded-full text-xs font-mono text-red-800">
            Time: O(2^n) | Space: O(2^n)
          </div>
        )}
      </div>

      {/* Complexity explanation */}
      <div className="absolute top-4 right-4 z-10 max-w-xs">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gray-700 leading-relaxed">
            Like a population explosion where each generation doubles, exponential algorithms
            quickly become computationally infeasible.
          </p>
        </div>
      </div>

      {/* SVG Visualization */}
      <svg ref={svgRef} viewBox="0 0 500 300" className="w-full h-full">
        {/* Explosion background */}
        <defs>
          <radialGradient id="explosionGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="populationGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Explosion effect */}
        {currentStep > 1 && (
          <circle
            cx="250"
            cy="150"
            r={Math.min(currentStep * 10, 150)}
            fill="url(#explosionGradient)"
            opacity="0.3"
            className="animate-pulse"
          />
        )}

        {/* Initial elements */}
        {initialPopulation.map((element) => (
          <g key={element.id}>
            {/* Element circle */}
            <circle
              cx={element.x}
              cy={element.y}
              r="15"
              fill="#6b7280"
              stroke="#374151"
              strokeWidth="2"
            />

            {/* Element label */}
            <text
              x={element.x}
              y={element.y + 5}
              textAnchor="middle"
              className="text-sm font-bold fill-white"
            >
              {element.value}
            </text>
          </g>
        ))}

        {/* Population dots (representing subsets) */}
        {population.map((dot) => (
          <circle
            key={dot.id}
            cx={dot.x}
            cy={dot.y}
            r="3"
            fill={`hsl(${200 + dot.generation * 30}, 70%, 50%)`}
            opacity="0.8"
            className="animate-ping"
          />
        ))}

        {/* Subset display */}
        <g transform="translate(20, 20)">
          <rect
            x="0"
            y="0"
            width="180"
            height="80"
            fill="white"
            stroke="#e5e7eb"
            rx="4"
            opacity="0.9"
          />
          <text x="10" y="15" className="text-xs font-bold fill-gray-700">
            Recent Subsets:
          </text>
          {subsets.slice(-3).map((subset, i) => (
            <text key={i} x="10" y={30 + i * 15} className="text-xs fill-gray-600">
              {'{}'}
              {subset.length > 0 && `{${subset.join(', ')}}`}
            </text>
          ))}
        </g>

        {/* Growth chart */}
        <g transform="translate(250, 20)">
          <text x="0" y="0" className="text-xs font-bold fill-gray-700">
            Exponential Growth:
          </text>
          <rect x="0" y="5" width="100" height="6" fill="#e5e7eb" rx="3" />
          <rect
            x="0"
            y="5"
            width={`${Math.min((currentStep / Math.pow(2, inputSize)) * 100, 100)}`}
            height="6"
            fill="#ef4444"
            rx="3"
            className="transition-all duration-300"
          />
          <text x="0" y="20" className="text-xs fill-gray-600">
            {currentStep} / {Math.pow(2, inputSize)} subsets
          </text>
        </g>

        {/* Warning signs */}
        {currentStep > Math.pow(2, inputSize) * 0.7 && (
          <g>
            {/* Warning triangle */}
            <polygon
              points="400,50 420,80 380,80"
              fill="#ef4444"
              stroke="#dc2626"
              strokeWidth="2"
              className="animate-bounce"
            />
            <text x="400" y="70" textAnchor="middle" className="text-sm font-bold fill-white">
              !
            </text>

            {/* Warning text */}
            <text x="350" y="100" className="text-xs font-bold fill-red-700">
              DANGER: Exponential explosion!
            </text>
          </g>
        )}

        {/* Rabbit figure (representing rapid reproduction) */}
        <g transform="translate(420, 220)">
          {/* Body */}
          <ellipse cx="0" cy="0" rx="12" ry="8" fill="#8b5cf6" />
          {/* Head */}
          <circle cx="-10" cy="-5" r="6" fill="#8b5cf6" />
          {/* Ears */}
          <ellipse cx="-12" cy="-10" rx="2" ry="6" fill="#8b5cf6" />
          <ellipse cx="-8" cy="-10" rx="2" ry="6" fill="#8b5cf6" />
          {/* Legs */}
          <ellipse cx="-5" cy="10" rx="2" ry="4" fill="#8b5cf6" />
          <ellipse cx="5" cy="10" rx="2" ry="4" fill="#8b5cf6" />
          {/* Tail */}
          <circle cx="10" cy="-5" r="3" fill="#fbbf24" />
        </g>

        {/* Generation indicator */}
        <g transform="translate(20, 120)">
          <text x="0" y="0" className="text-sm font-bold fill-gray-700">
            Generation: {currentGeneration}
          </text>
          <text x="0" y="15" className="text-xs fill-gray-600">
            Each new element doubles the possibilities
          </text>
        </g>

        {/* Operation counter */}
        <g transform="translate(20, 250)">
          <rect x="0" y="0" width="180" height="30" fill="white" stroke="#e5e7eb" rx="4" />
          <text x="10" y="20" className="text-sm fill-gray-700">
            Operations: <tspan className="font-bold text-red-600">{currentStep}</tspan>
            <tspan className="text-xs"> / {Math.pow(2, inputSize)}</tspan>
          </text>
        </g>
      </svg>

      {/* Interactive controls */}
      {interactive && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
          <button
            onClick={animatePowerSet}
            disabled={isAnimating}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isAnimating ? 'Exploding...' : 'Generate Subsets'}
          </button>
          <button
            onClick={() => {
              setCurrentStep(0);
              setPopulation([]);
              setSubsets([]);
              setCurrentGeneration(0);
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
          {Array.from({ length: Math.pow(2, inputSize) }, (_, i) => (
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

export default PopulationExplosionMetaphor;
