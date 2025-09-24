import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ComplexityResult } from '../../../../types/bigo';

interface LibrarianMetaphorProps {
  isActive?: boolean;
  inputSize?: number;
  showComplexity?: boolean;
  animationSpeed?: number;
  interactive?: boolean;
  className?: string;
  onComplexityCalculated?: (result: ComplexityResult) => void;
}

const LibrarianMetaphor: React.FC<LibrarianMetaphorProps> = ({
  isActive = false,
  inputSize = 16,
  showComplexity = true,
  animationSpeed = 1,
  interactive = true,
  className = '',
  onComplexityCalculated,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchValue, setSearchValue] = useState(8);
  const [currentRange, setCurrentRange] = useState({ start: 0, end: inputSize - 1 });
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate sorted bookshelf data
  const bookshelf = Array.from({ length: inputSize }, (_, i) => ({
    id: i,
    value: i + 1,
    x: 50 + (i * 400) / Math.max(inputSize - 1, 1),
    y: 180,
    height: 40 + Math.random() * 20, // Varying book heights
  }));

  // Calculate complexity for O(log n) operation
  const calculateComplexity = useCallback(
    (steps: number): ComplexityResult => ({
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      operations: steps,
      explanation: `Logarithmic time complexity - search space halves with each step. For n=${inputSize}, takes ~${Math.ceil(Math.log2(inputSize))} steps`,
      optimizationSuggestions: [
        'Perfect for sorted data',
        'Ideal for binary search trees',
        'Excellent scalability for large datasets',
      ],
      confidence: 0.95,
    }),
    [inputSize]
  );

  // Binary search animation
  const animateBinarySearch = useCallback(
    async (target: number) => {
      if (isAnimating) return;

      setIsAnimating(true);
      setSearchValue(target);
      setFoundIndex(null);
      setCurrentRange({ start: 0, end: inputSize - 1 });
      setCurrentStep(0);

      let left = 0;
      let right = inputSize - 1;
      let steps = 0;

      while (left <= right) {
        steps++;
        const mid = Math.floor((left + right) / 2);
        const midValue = bookshelf[mid].value;

        // Update current range
        setCurrentRange({ start: left, end: right });
        setCurrentStep(steps);

        // Highlight middle book
        await new Promise((resolve) => setTimeout(resolve, 800 / animationSpeed));

        if (midValue === target) {
          // Found it!
          setFoundIndex(mid);
          setCurrentStep(steps + 1);
          break;
        } else if (midValue < target) {
          // Search right half
          left = mid + 1;
        } else {
          // Search left half
          right = mid - 1;
        }

        await new Promise((resolve) => setTimeout(resolve, 600 / animationSpeed));
      }

      setIsAnimating(false);

      // Report complexity
      if (onComplexityCalculated) {
        onComplexityCalculated(calculateComplexity(steps));
      }
    },
    [isAnimating, inputSize, animationSpeed, onComplexityCalculated, bookshelf, calculateComplexity]
  );

  // Auto-demo when component becomes active
  useEffect(() => {
    if (isActive && !isAnimating) {
      const demoSequence = async () => {
        const targets = [3, 8, 12, 15];
        for (const target of targets) {
          await animateBinarySearch(target);
          await new Promise((resolve) => setTimeout(resolve, 1500 / animationSpeed));
        }
      };
      demoSequence();
    }
  }, [isActive, animateBinarySearch, isAnimating, animationSpeed]);

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border-2 border-green-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-green-800 mb-1">O(log n) - The Librarian</h3>
        <p className="text-sm text-green-600">Efficient search through organized knowledge</p>
        {showComplexity && (
          <div className="mt-2 px-3 py-1 bg-green-100 rounded-full text-xs font-mono text-green-800">
            Time: O(log n) | Space: O(1)
          </div>
        )}
      </div>

      {/* Complexity explanation */}
      <div className="absolute top-4 right-4 z-10 max-w-xs">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gray-700 leading-relaxed">
            Like a skilled librarian finding a book by halving the search space each time, binary
            search efficiently locates items in sorted data.
          </p>
        </div>
      </div>

      {/* SVG Visualization */}
      <svg ref={svgRef} viewBox="0 0 500 300" className="w-full h-full">
        {/* Bookshelf background */}
        <defs>
          <pattern id="bookshelf" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#fef3c7" />
            <rect x="0" y="18" width="20" height="2" fill="#92400e" />
          </pattern>
          <radialGradient id="bookGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Bookshelf base */}
        <rect x="30" y="160" width="440" height="20" fill="#92400e" rx="2" />
        <rect x="30" y="140" width="440" height="40" fill="url(#bookshelf)" />

        {/* Books */}
        {bookshelf.map((book, index) => {
          const isInRange = index >= currentRange.start && index <= currentRange.end;
          const isMiddle = Math.floor((currentRange.start + currentRange.end) / 2) === index;
          const isFound = foundIndex === index;

          return (
            <g key={book.id}>
              {/* Book spine */}
              <rect
                x={book.x - 8}
                y={book.y - book.height}
                width="16"
                height={book.height}
                fill={
                  isFound
                    ? '#ef4444'
                    : isMiddle && currentStep > 0
                      ? '#f59e0b'
                      : isInRange
                        ? '#10b981'
                        : '#6b7280'
                }
                stroke={isFound ? '#dc2626' : isMiddle && currentStep > 0 ? '#d97706' : '#374151'}
                strokeWidth="1"
                className="transition-all duration-300"
              />

              {/* Book title (value) */}
              <text
                x={book.x}
                y={book.y - book.height + 15}
                textAnchor="middle"
                className={`text-xs font-bold ${isFound || (isMiddle && currentStep > 0) ? 'fill-white' : 'fill-gray-700'}`}
                transform={`rotate(-90 ${book.x} ${book.y - book.height + 15})`}
              >
                {book.value}
              </text>

              {/* Search beam for middle book */}
              {isMiddle && currentStep > 0 && (
                <g>
                  <circle
                    cx={book.x}
                    cy={book.y - book.height - 10}
                    r="8"
                    fill="url(#bookGlow)"
                    className="animate-pulse"
                  />
                  <text
                    x={book.x}
                    y={book.y - book.height - 25}
                    textAnchor="middle"
                    className="text-xs font-bold fill-green-700"
                  >
                    CHECKING
                  </text>
                </g>
              )}

              {/* Found indicator */}
              {isFound && (
                <g>
                  <circle
                    cx={book.x}
                    cy={book.y - book.height - 15}
                    r="12"
                    fill="#10b981"
                    opacity="0.8"
                    className="animate-bounce"
                  />
                  <text
                    x={book.x}
                    y={book.y - book.height - 10}
                    textAnchor="middle"
                    className="text-sm font-bold fill-white"
                  >
                    ✓
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Search range indicator */}
        {currentStep > 0 && (
          <g>
            <rect
              x={bookshelf[currentRange.start]?.x - 10}
              y={120}
              width={bookshelf[currentRange.end]?.x - bookshelf[currentRange.start]?.x + 20}
              height="15"
              fill="#fef3c7"
              stroke="#f59e0b"
              strokeWidth="2"
              rx="2"
              opacity="0.8"
            />
            <text
              x={(bookshelf[currentRange.start]?.x + bookshelf[currentRange.end]?.x) / 2}
              y={132}
              textAnchor="middle"
              className="text-xs font-bold fill-orange-800"
            >
              SEARCHING: {currentRange.start + 1} to {currentRange.end + 1}
            </text>
          </g>
        )}

        {/* Librarian figure */}
        <g transform="translate(400, 220)">
          {/* Body */}
          <rect x="5" y="10" width="20" height="30" fill="#8b5cf6" rx="10" />
          {/* Head */}
          <circle cx="15" cy="5" r="8" fill="#fbbf24" />
          {/* Arms */}
          <rect x="0" y="15" width="30" height="4" fill="#8b5cf6" rx="2" />
          {/* Legs */}
          <rect x="8" y="40" width="4" height="15" fill="#8b5cf6" rx="2" />
          <rect x="18" y="40" width="4" height="15" fill="#8b5cf6" rx="2" />
        </g>

        {/* Operation counter */}
        <g transform="translate(20, 250)">
          <rect x="0" y="0" width="140" height="30" fill="white" stroke="#e5e7eb" rx="4" />
          <text x="10" y="20" className="text-sm fill-gray-700">
            Steps: <tspan className="font-bold text-green-600">{currentStep}</tspan>
            {foundIndex !== null && <tspan> | Found: {bookshelf[foundIndex].value}</tspan>}
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
            value={searchValue}
            onChange={(e) =>
              setSearchValue(Math.max(1, Math.min(inputSize, parseInt(e.target.value) || 1)))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-20"
            disabled={isAnimating}
          />
          <button
            onClick={() => animateBinarySearch(searchValue)}
            disabled={isAnimating}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isAnimating ? 'Searching...' : 'Find Book'}
          </button>
          <button
            onClick={() => animateBinarySearch(Math.floor(Math.random() * inputSize) + 1)}
            disabled={isAnimating}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Random
          </button>
        </div>
      )}

      {/* Animation step indicator */}
      <div className="absolute bottom-4 right-4">
        <div className="flex space-x-1">
          {Array.from({ length: Math.ceil(Math.log2(inputSize)) + 1 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentStep > i
                  ? 'bg-green-600'
                  : currentStep === i + 1
                    ? 'bg-orange-500'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LibrarianMetaphor;
