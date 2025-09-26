import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Search, Scissors, Plus } from 'lucide-react';
import type { StringVisualizationProps, StringElement } from '../../../../types/datastructures';
import { createButtonClass, createCardClass } from '../../../../utils/theme';

/**
 * StringVisualization Component
 * Interactive 2D visualization for string operations and algorithms
 */
const StringVisualization: React.FC<StringVisualizationProps> = ({
  initialString = 'Hello, World!',
  maxLength = 50,
  showIndices = true,
  showASCII = false,
  className = '',
}) => {
  const [currentString, setCurrentString] = useState<string>(initialString);
  const [stringElements, setStringElements] = useState<StringElement[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [operation, setOperation] = useState<string>('idle');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [replaceTerm, setReplaceTerm] = useState<string>('');
  const [substringStart, setSubstringStart] = useState<number>(0);
  const [substringEnd, setSubstringEnd] = useState<number>(5);

  // Convert string to elements
  const stringToElements = useCallback((str: string): StringElement[] => {
    return str.split('').map((char, index) => ({
      id: `char-${index}`,
      value: char,
      charIndex: index,
      position: { x: index * 40, y: 0 },
      highlighted: false,
      color: '#3B82F6',
    }));
  }, []);

  // Initialize string elements
  useEffect(() => {
    setStringElements(stringToElements(currentString));
  }, [currentString, stringToElements]);

  // Animation controls
  const playAnimation = () => setIsPlaying(true);
  const pauseAnimation = () => setIsPlaying(false);
  const resetAnimation = () => {
    setIsPlaying(false);
    setOperation('idle');
    setStringElements(stringToElements(currentString));
  };

  // String operations
  const performSearch = () => {
    if (!searchTerm) return;

    setOperation('search');
    setIsPlaying(true);

    const newElements = stringToElements(currentString);
    let found = false;

    for (let i = 0; i <= currentString.length - searchTerm.length; i++) {
      let match = true;
      for (let j = 0; j < searchTerm.length; j++) {
        if (currentString[i + j] !== searchTerm[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        found = true;
        for (let j = 0; j < searchTerm.length; j++) {
          newElements[i + j].highlighted = true;
          newElements[i + j].color = '#10B981';
        }
        break;
      }
    }

    setStringElements(newElements);
    if (!found) {
      setTimeout(() => {
        alert(`Pattern "${searchTerm}" not found in string`);
      }, 1000);
    }
  };

  const performReplace = () => {
    if (!searchTerm || !replaceTerm) return;

    const newString = currentString.replace(new RegExp(searchTerm, 'g'), replaceTerm);
    setCurrentString(newString);
    setOperation('replace');
  };

  const performSubstring = () => {
    const start = Math.max(0, substringStart);
    const end = Math.min(currentString.length, substringEnd);
    const substring = currentString.substring(start, end);

    const newElements = stringToElements(currentString);
    for (let i = start; i < end; i++) {
      newElements[i].highlighted = true;
      newElements[i].color = '#F59E0B';
    }

    setStringElements(newElements);
    setOperation('substring');
    setTimeout(() => {
      alert(`Substring: "${substring}"`);
    }, 1000);
  };

  const performConcat = () => {
    const concatStr = prompt('Enter string to concatenate:');
    if (concatStr) {
      setCurrentString(currentString + concatStr);
      setOperation('concat');
    }
  };

  const performReverse = () => {
    setCurrentString(currentString.split('').reverse().join(''));
    setOperation('reverse');
  };

  const performToUpper = () => {
    setCurrentString(currentString.toUpperCase());
    setOperation('toUpper');
  };

  const performToLower = () => {
    setCurrentString(currentString.toLowerCase());
    setOperation('toLower');
  };

  const performTrim = () => {
    setCurrentString(currentString.trim());
    setOperation('trim');
  };

  // Button classes
  const primaryButtonClass = createButtonClass('primary');
  const secondaryButtonClass = createButtonClass('secondary');
  const cardClass = createCardClass();

  return (
    <div className={`w-full ${className}`}>
      {/* Control Panel */}
      <div className={`${cardClass} p-4 mb-4`}>
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Animation Controls */}
          <button
            onClick={playAnimation}
            disabled={isPlaying}
            className={`${primaryButtonClass} flex items-center gap-1`}
          >
            <Play className="w-4 h-4" />
            Play
          </button>
          <button
            onClick={pauseAnimation}
            disabled={!isPlaying}
            className={`${secondaryButtonClass} flex items-center gap-1`}
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
          <button
            onClick={resetAnimation}
            className={`${secondaryButtonClass} flex items-center gap-1`}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* String Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Current String:</label>
          <input
            type="text"
            value={currentString}
            onChange={(e) => setCurrentString(e.target.value.slice(0, maxLength))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter a string..."
            maxLength={maxLength}
          />
        </div>

        {/* Operation Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
            <div className="flex gap-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="pattern"
              />
              <button
                onClick={performSearch}
                className={`${primaryButtonClass} px-2 py-1 text-xs flex items-center`}
              >
                <Search className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Replace</label>
            <div className="flex gap-1">
              <input
                type="text"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="with"
              />
              <button
                onClick={performReplace}
                className={`${primaryButtonClass} px-2 py-1 text-xs`}
              >
                Replace
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Substring</label>
            <div className="flex gap-1">
              <input
                type="number"
                value={substringStart}
                onChange={(e) => setSubstringStart(Number(e.target.value))}
                className="w-12 px-1 py-1 text-xs border border-gray-300 rounded"
                min="0"
                max={currentString.length}
              />
              <input
                type="number"
                value={substringEnd}
                onChange={(e) => setSubstringEnd(Number(e.target.value))}
                className="w-12 px-1 py-1 text-xs border border-gray-300 rounded"
                min="0"
                max={currentString.length}
              />
              <button
                onClick={performSubstring}
                className={`${primaryButtonClass} px-2 py-1 text-xs flex items-center`}
              >
                <Scissors className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Operations</label>
            <div className="flex gap-1">
              <button
                onClick={performConcat}
                className={`${secondaryButtonClass} px-2 py-1 text-xs flex items-center`}
                title="Concatenate"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={performReverse}
                className={`${secondaryButtonClass} px-2 py-1 text-xs`}
                title="Reverse"
              >
                ↺
              </button>
              <button
                onClick={performToUpper}
                className={`${secondaryButtonClass} px-2 py-1 text-xs`}
                title="Uppercase"
              >
                AA
              </button>
              <button
                onClick={performToLower}
                className={`${secondaryButtonClass} px-2 py-1 text-xs`}
                title="Lowercase"
              >
                aa
              </button>
              <button
                onClick={performTrim}
                className={`${secondaryButtonClass} px-2 py-1 text-xs`}
                title="Trim"
              >
                ✂
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Area */}
      <div className={`${cardClass} p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">String Visualization</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Length: {currentString.length}</span>
            {operation !== 'idle' && (
              <span className="text-indigo-600 font-medium">Operation: {operation}</span>
            )}
          </div>
        </div>

        {/* String Display */}
        <div className="relative mb-6">
          <svg
            width="100%"
            height="120"
            viewBox={`0 0 ${Math.max(800, stringElements.length * 40 + 40)} 120`}
            className="border border-gray-200 rounded-lg bg-gray-50"
          >
            {/* String elements */}
            {stringElements.map((element, index) => (
              <g key={element.id} transform={`translate(${index * 40 + 20}, 60)`}>
                {/* Character box */}
                <rect
                  x="-15"
                  y="-15"
                  width="30"
                  height="30"
                  fill={element.highlighted ? element.color : '#FFFFFF'}
                  stroke={element.highlighted ? '#000000' : '#E5E7EB'}
                  strokeWidth="2"
                  rx="4"
                  className="transition-all duration-300"
                />

                {/* Character text */}
                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  className="text-sm font-mono font-bold fill-gray-900 pointer-events-none"
                >
                  {element.value}
                </text>

                {/* Index */}
                {showIndices && (
                  <text
                    x="0"
                    y="-20"
                    textAnchor="middle"
                    className="text-xs fill-gray-500 pointer-events-none"
                  >
                    {index}
                  </text>
                )}

                {/* ASCII value */}
                {showASCII && (
                  <text
                    x="0"
                    y="35"
                    textAnchor="middle"
                    className="text-xs fill-gray-500 pointer-events-none"
                  >
                    {typeof element.value === 'string'
                      ? element.value.charCodeAt(0)
                      : element.value}
                  </text>
                )}
              </g>
            ))}

            {/* String boundaries */}
            <line
              x1="10"
              y1="45"
              x2="10"
              y2="75"
              stroke="#6B7280"
              strokeWidth="1"
              markerEnd="url(#arrowhead)"
            />
            <line
              x1={stringElements.length * 40 + 30}
              y1="45"
              x2={stringElements.length * 40 + 30}
              y2="75"
              stroke="#6B7280"
              strokeWidth="1"
              markerEnd="url(#arrowhead)"
            />

            {/* Arrow markers */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* String Properties */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-gray-900">Length</div>
            <div className="text-gray-600">{currentString.length} characters</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-gray-900">Memory</div>
            <div className="text-gray-600">{currentString.length * 2} bytes</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-gray-900">Encoding</div>
            <div className="text-gray-600">UTF-16</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-gray-900">Operations</div>
            <div className="text-gray-600">{operation === 'idle' ? 'None' : operation}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StringVisualization;
