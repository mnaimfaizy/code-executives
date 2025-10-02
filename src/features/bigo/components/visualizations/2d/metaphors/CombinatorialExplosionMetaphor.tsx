import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ComplexityResult } from '../../../../../../types/bigo';

interface CombinatorialExplosionMetaphorProps {
  isActive?: boolean;
  inputSize?: number;
  showComplexity?: boolean;
  animationSpeed?: number;
  interactive?: boolean;
  className?: string;
  onComplexityCalculated?: (result: ComplexityResult) => void;
}

const CombinatorialExplosionMetaphor: React.FC<CombinatorialExplosionMetaphorProps> = ({
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
  const [permutations, setPermutations] = useState<string[][]>([]);
  const [currentPermutation, setCurrentPermutation] = useState<number>(0);
  const [explosionRadius, setExplosionRadius] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // Factorial calculation
  const factorial = useCallback((n: number): number => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  }, []);

  // Generate initial elements
  const elements = Array.from({ length: inputSize }, (_, i) => ({
    id: i,
    value: String.fromCharCode(65 + i), // A, B, C, D...
    x: 100 + (i * 300) / Math.max(inputSize - 1, 1),
    y: 200,
  }));

  // Calculate complexity for O(n!) operation
  const calculateComplexity = useCallback(
    (operations: number): ComplexityResult => ({
      timeComplexity: 'O(n!)',
      spaceComplexity: 'O(n!)',
      operations: operations,
      explanation: `Factorial time complexity - all possible arrangements. For n=${inputSize}, generates ${factorial(inputSize)} permutations`,
      optimizationSuggestions: [
        'Computationally infeasible for n > 10',
        'Consider heuristic approaches',
        'Use approximation algorithms',
        'Look for problem-specific optimizations',
      ],
      confidence: 0.95,
    }),
    [inputSize, factorial]
  );

  // Generate permutations using Heap's algorithm
  const generatePermutations = useCallback(
    async (arr: string[]): Promise<string[][]> => {
      const result: string[][] = [];

      const heapPermute = async (array: string[], size: number): Promise<void> => {
        if (size === 1) {
          result.push([...array]);
          setPermutations([...result]);
          setCurrentStep(result.length);
          await new Promise((resolve) => setTimeout(resolve, 200 / animationSpeed));
          return;
        }

        for (let i = 0; i < size; i++) {
          await heapPermute(array, size - 1);

          if (size % 2 === 1) {
            [array[0], array[size - 1]] = [array[size - 1], array[0]];
          } else {
            [array[i], array[size - 1]] = [array[size - 1], array[i]];
          }
        }
      };

      await heapPermute([...arr], arr.length);
      return result;
    },
    [animationSpeed]
  );

  // Animate combinatorial explosion
  const animateExplosion = useCallback(async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentStep(0);
    setPermutations([]);
    setCurrentPermutation(0);
    setExplosionRadius(0);

    const elementValues = elements.map((e) => e.value);
    await generatePermutations(elementValues);

    // Explosion effect
    for (let i = 0; i < 50; i++) {
      setExplosionRadius(i * 3);
      setCurrentPermutation(Math.floor((i / 50) * permutations.length));
      await new Promise((resolve) => setTimeout(resolve, 50 / animationSpeed));
    }

    setIsAnimating(false);

    // Report complexity
    if (onComplexityCalculated) {
      onComplexityCalculated(calculateComplexity(permutations.length));
    }
  }, [
    isAnimating,
    elements,
    generatePermutations,
    permutations.length,
    animationSpeed,
    onComplexityCalculated,
    calculateComplexity,
  ]);

  // Auto-demo when component becomes active
  useEffect(() => {
    if (isActive && !isAnimating) {
      animateExplosion();
    }
  }, [isActive, animateExplosion, isAnimating]);

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border-2 border-gray-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-gray-800 mb-1">O(n!) - Combinatorial Explosion</h3>
        <p className="text-sm text-gray-600">All possible arrangements become impossible</p>
        {showComplexity && (
          <div className="mt-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-mono text-gray-800">
            Time: O(n!) | Space: O(n!)
          </div>
        )}
      </div>

      {/* Complexity explanation */}
      <div className="absolute top-4 right-4 z-10 max-w-xs">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gray-700 leading-relaxed">
            Like trying every possible combination, factorial complexity represents the worst-case
            scenario - examining all permutations.
          </p>
        </div>
      </div>

      {/* SVG Visualization */}
      <svg ref={svgRef} viewBox="0 0 500 300" className="w-full h-full">
        {/* Explosion background */}
        <defs>
          <radialGradient id="blackHole" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#374151" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#6b7280" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="permutationGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Black hole effect */}
        {explosionRadius > 0 && (
          <circle
            cx="250"
            cy="150"
            r={explosionRadius}
            fill="url(#blackHole)"
            opacity="0.6"
            className="animate-pulse"
          />
        )}

        {/* Initial elements */}
        {elements.map((element) => (
          <g key={element.id}>
            {/* Element circle */}
            <circle
              cx={element.x}
              cy={element.y}
              r="15"
              fill="#6b7280"
              stroke="#374151"
              strokeWidth="2"
              opacity={explosionRadius > 50 ? 0.3 : 1}
            />

            {/* Element label */}
            <text
              x={element.x}
              y={element.y + 5}
              textAnchor="middle"
              className="text-sm font-bold fill-white"
              opacity={explosionRadius > 50 ? 0.3 : 1}
            >
              {element.value}
            </text>
          </g>
        ))}

        {/* Permutation clouds */}
        {permutations.slice(0, currentPermutation + 1).map((perm, index) => {
          const angle = (index / Math.max(permutations.length, 1)) * Math.PI * 2;
          const distance = 50 + (index / Math.max(permutations.length, 1)) * 100;
          const x = 250 + Math.cos(angle) * distance;
          const y = 150 + Math.sin(angle) * distance;

          return (
            <g key={index}>
              {/* Permutation cloud */}
              <circle
                cx={x}
                cy={y}
                r="20"
                fill="url(#permutationGlow)"
                opacity="0.7"
                className="animate-pulse"
              />

              {/* Permutation text */}
              <text x={x} y={y + 4} textAnchor="middle" className="text-xs font-bold fill-white">
                {perm.join('')}
              </text>
            </g>
          );
        })}

        {/* Current permutation highlight */}
        {permutations[currentPermutation] && (
          <g>
            <circle
              cx={
                250 +
                Math.cos((currentPermutation / Math.max(permutations.length, 1)) * Math.PI * 2) *
                  (50 + (currentPermutation / Math.max(permutations.length, 1)) * 100)
              }
              cy={
                150 +
                Math.sin((currentPermutation / Math.max(permutations.length, 1)) * Math.PI * 2) *
                  (50 + (currentPermutation / Math.max(permutations.length, 1)) * 100)
              }
              r="25"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              className="animate-ping"
            />
          </g>
        )}

        {/* Statistics display */}
        <g transform="translate(20, 20)">
          <rect
            x="0"
            y="0"
            width="200"
            height="60"
            fill="white"
            stroke="#e5e7eb"
            rx="4"
            opacity="0.9"
          />
          <text x="10" y="15" className="text-xs font-bold fill-gray-700">
            Factorial Growth:
          </text>
          <text x="10" y="30" className="text-xs fill-gray-600">
            n = {inputSize}, permutations = {factorial(inputSize)}
          </text>
          <text x="10" y="45" className="text-xs fill-red-600 font-bold">
            {inputSize > 3 ? 'COMPUTATIONALLY IMPOSSIBLE!' : 'Still manageable...'}
          </text>
        </g>

        {/* Skull and crossbones warning */}
        {inputSize >= 5 && (
          <g transform="translate(380, 50)">
            {/* Skull */}
            <circle cx="10" cy="8" r="8" fill="#000" />
            <circle cx="6" cy="5" r="1.5" fill="#fff" />
            <circle cx="14" cy="5" r="1.5" fill="#fff" />
            <path d="M 8 10 Q 10 12 12 10" stroke="#fff" strokeWidth="1" fill="none" />

            {/* Crossbones */}
            <line x1="0" y1="15" x2="20" y2="25" stroke="#000" strokeWidth="2" />
            <line x1="20" y1="15" x2="0" y2="25" stroke="#000" strokeWidth="2" />

            {/* Warning text */}
            <text x="10" y="35" textAnchor="middle" className="text-xs font-bold fill-red-600">
              DANGER!
            </text>
          </g>
        )}

        {/* Mathematician figure (looking overwhelmed) */}
        <g transform="translate(420, 220)">
          {/* Body */}
          <rect x="5" y="10" width="20" height="30" fill="#6b7280" rx="10" />
          {/* Head (with sweat drops) */}
          <circle cx="15" cy="5" r="8" fill="#fbbf24" />
          {/* Sweat drops */}
          {Array.from({ length: 3 }, (_, i) => (
            <circle
              key={i}
              cx={18 + i * 2}
              cy={0 - i * 2}
              r="1"
              fill="#3b82f6"
              opacity="0.7"
              className="animate-bounce"
            />
          ))}
          {/* Arms (raised in despair) */}
          <rect
            x="0"
            y="5"
            width="4"
            height="15"
            fill="#6b7280"
            rx="2"
            transform="rotate(-30 2 5)"
          />
          <rect
            x="26"
            y="5"
            width="4"
            height="15"
            fill="#6b7280"
            rx="2"
            transform="rotate(30 28 5)"
          />
        </g>

        {/* Scale comparison */}
        <g transform="translate(20, 140)">
          <text x="0" y="0" className="text-xs font-bold fill-gray-700">
            Scale Comparison:
          </text>
          <text x="0" y="15" className="text-xs fill-gray-600">
            n=3: 6 permutations
          </text>
          <text x="0" y="30" className="text-xs fill-gray-600">
            n=4: 24 permutations
          </text>
          <text x="0" y="45" className="text-xs fill-red-600 font-bold">
            n=5: 120 permutations
          </text>
          <text x="0" y="60" className="text-xs fill-red-600 font-bold">
            n=10: 3.6 million!
          </text>
        </g>

        {/* Operation counter */}
        <g transform="translate(20, 250)">
          <rect x="0" y="0" width="200" height="30" fill="white" stroke="#e5e7eb" rx="4" />
          <text x="10" y="20" className="text-sm fill-gray-700">
            Permutations: <tspan className="font-bold text-gray-600">{currentStep}</tspan>
            <tspan className="text-xs"> / {factorial(inputSize)}</tspan>
          </text>
        </g>
      </svg>

      {/* Interactive controls */}
      {interactive && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
          <button
            onClick={animateExplosion}
            disabled={isAnimating}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isAnimating ? 'Exploding...' : 'Generate Permutations'}
          </button>
          <button
            onClick={() => {
              setCurrentStep(0);
              setPermutations([]);
              setCurrentPermutation(0);
              setExplosionRadius(0);
            }}
            disabled={isAnimating}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {/* Animation step indicator */}
      <div className="absolute bottom-4 right-4">
        <div className="flex space-x-1">
          {Array.from({ length: factorial(inputSize) }, (_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-colors ${
                i < currentStep ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CombinatorialExplosionMetaphor;
