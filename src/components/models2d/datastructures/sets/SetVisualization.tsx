import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Minus, Search, BookOpen, Code, Zap, Hash } from 'lucide-react';
import type { SetElement } from '../../../../types/datastructures';

interface SetVisualizationProps {
  isActive?: boolean;
  maxSize?: number;
  initialData?: string[] | number[];
  showHashValues?: boolean;
  className?: string;
}

/**
 * Interactive Set Visualization Component
 * Demonstrates set operations with unique elements, hashing, and set algebra
 */
export const SetVisualization: React.FC<SetVisualizationProps> = ({
  maxSize = 15,
  initialData = [42, 17, 89, 3, 56],
  showHashValues = false,
  className = '',
}) => {
  // Simple hash function for demonstration
  const hashFunction = (value: string | number): number => {
    const str = String(value);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 1000; // Keep it small for display
  };

  // Component state
  const [currentData, setCurrentData] = useState<SetElement[]>(() => {
    const uniqueData = Array.from(new Set(initialData.map(String))); // Remove duplicates, convert to strings
    return uniqueData.map((value, index) => ({
      id: `element-${index}`,
      value,
      hash: hashFunction(value),
      position: { x: (index % 5) * 100 + 50, y: Math.floor(index / 5) * 80 + 50 },
      highlighted: false,
      color: '#10B981',
    })) as SetElement[];
  });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [newValue, setNewValue] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [setA, setSetA] = useState<string[]>(['A', 'B', 'C', 'D']);
  const [setB, setSetB] = useState<string[]>(['C', 'D', 'E', 'F']);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [showCode, setShowCode] = useState(false);
  const [currentExample, setCurrentExample] = useState<string>('default');

  // Preset examples
  const examples = useMemo(
    () => ({
      default: { data: [42, 17, 89, 3, 56], description: 'Basic integer set' },
      letters: { data: ['A', 'B', 'C', 'D', 'E'], description: 'Letter set' },
      primes: { data: [2, 3, 5, 7, 11, 13, 17, 19], description: 'Prime numbers' },
      colors: { data: ['Red', 'Green', 'Blue', 'Yellow'], description: 'Color names' },
      ids: { data: [101, 205, 303, 404, 505], description: 'User IDs' },
    }),
    []
  );

  // Load example data
  const loadExample = useCallback(
    (exampleKey: string) => {
      const example = examples[exampleKey as keyof typeof examples];
      if (example) {
        const uniqueData = Array.from(new Set(example.data.map(String))); // Ensure uniqueness, convert to strings
        const newElements = uniqueData.map((value, index) => ({
          id: `element-${index}`,
          value,
          hash: hashFunction(value),
          position: { x: (index % 5) * 100 + 50, y: Math.floor(index / 5) * 80 + 50 },
          highlighted: false,
          color: '#10B981',
        }));
        setCurrentData(newElements);
        setCurrentExample(exampleKey);
      }
    },
    [examples]
  );

  // Handle set operations
  const handleAdd = useCallback(
    (value: string | number) => {
      if (currentData.length >= maxSize) return;

      // Check if value already exists
      const exists = currentData.some((el: SetElement) => el.value === value);
      if (exists) {
        // Highlight existing element briefly
        const existingElement = currentData.find((el: SetElement) => el.value === value);
        if (existingElement) {
          const updatedElements = currentData.map((el: SetElement) =>
            el.id === existingElement.id ? { ...el, highlighted: true, color: '#F59E0B' } : el
          );
          setCurrentData(updatedElements);

          setTimeout(() => {
            const resetElements = updatedElements.map((el: SetElement) => ({
              ...el,
              highlighted: false,
              color: '#10B981',
            }));
            setCurrentData(resetElements);
          }, 1000);
        }
        return;
      }

      setCurrentOperation('add');
      const newElement: SetElement = {
        id: `element-${Date.now()}`,
        value,
        hash: hashFunction(value),
        position: {
          x: (currentData.length % 5) * 100 + 50,
          y: Math.floor(currentData.length / 5) * 80 + 50,
        },
        highlighted: true,
        color: '#10B981',
      };

      setCurrentData([...currentData, newElement]);

      // Clear highlight after animation
      setTimeout(() => {
        const updatedElements = [...currentData, newElement].map((el: SetElement) => ({
          ...el,
          highlighted: false,
          color: '#10B981',
        }));
        setCurrentData(updatedElements);
        setCurrentOperation('');
      }, 1000);
    },
    [currentData, maxSize]
  );

  const handleRemove = useCallback(
    (value: string | number) => {
      const elementToRemove = currentData.find((el: SetElement) => el.value === value);
      if (!elementToRemove) return;

      setCurrentOperation('remove');
      const updatedElements = currentData.map((el: SetElement) =>
        el.id === elementToRemove.id ? { ...el, highlighted: true, color: '#EF4444' } : el
      );
      setCurrentData(updatedElements);

      setTimeout(() => {
        const filteredElements = currentData.filter((el: SetElement) => el.value !== value);
        setCurrentData(filteredElements);
        setCurrentOperation('');
      }, 1000);
    },
    [currentData]
  );

  const handleContains = useCallback(
    (value: string | number) => {
      setCurrentOperation('contains');

      const element = currentData.find((el: SetElement) => el.value === value);
      const found = element !== undefined;

      if (found && element) {
        // Highlight found element
        const updatedElements = currentData.map((el: SetElement) =>
          el.id === element.id ? { ...el, highlighted: true, color: '#F59E0B' } : el
        );
        setCurrentData(updatedElements);

        // Clear highlight after animation
        setTimeout(() => {
          const resetElements = updatedElements.map((el: SetElement) => ({
            ...el,
            highlighted: false,
            color: '#10B981',
          }));
          setCurrentData(resetElements);
          setCurrentOperation('');
        }, 1500);
      } else {
        // Show not found (brief flash of all elements)
        const updatedElements = currentData.map((el: SetElement) => ({
          ...el,
          highlighted: true,
          color: '#6B7280',
        }));
        setCurrentData(updatedElements);

        setTimeout(() => {
          const resetElements = updatedElements.map((el: SetElement) => ({
            ...el,
            highlighted: false,
            color: '#10B981',
          }));
          setCurrentData(resetElements);
          setCurrentOperation('');
        }, 1500);
      }
    },
    [currentData]
  );

  // Set operations
  const performUnion = useCallback(() => {
    const unionSet = [...new Set([...setA, ...setB])];
    const unionElements = unionSet.map((value, index) => ({
      id: `union-${index}`,
      value,
      hash: hashFunction(value),
      position: { x: (index % 5) * 100 + 50, y: Math.floor(index / 5) * 80 + 50 },
      highlighted: false,
      color: '#10B981',
    }));

    setCurrentData(unionElements);
  }, [setA, setB]);

  const performIntersection = useCallback(() => {
    const intersectionSet = setA.filter((value: string) => setB.includes(value));
    const intersectionElements = intersectionSet.map((value: string, index: number) => ({
      id: `intersection-${index}`,
      value,
      hash: hashFunction(value),
      position: { x: (index % 5) * 100 + 50, y: Math.floor(index / 5) * 80 + 50 },
      highlighted: false,
      color: '#10B981',
    }));

    setCurrentData(intersectionElements);
  }, [setA, setB]);

  const performDifference = useCallback(() => {
    const differenceSet = setA.filter((value: string) => !setB.includes(value));
    const differenceElements = differenceSet.map((value: string, index: number) => ({
      id: `difference-${index}`,
      value,
      hash: hashFunction(value),
      position: { x: (index % 5) * 100 + 50, y: Math.floor(index / 5) * 80 + 50 },
      highlighted: false,
      color: '#10B981',
    }));

    setCurrentData(differenceElements);
  }, [setA, setB]);

  // Handle element click
  const handleElementClick = useCallback((elementId: string) => {
    setSelectedElement((prev) => (prev === elementId ? null : elementId));
  }, []);
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = newValue.trim();
    if (value) {
      handleAdd(value);
      setNewValue('');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = searchValue.trim();
    if (value) {
      handleContains(value);
      setSearchValue('');
    }
  };

  // Generate code example based on current operation
  const getCodeExample = () => {
    const setName = 'mySet';
    const currentValues = currentData.map((el) => el.value);

    switch (currentOperation) {
      case 'add':
        return `// Add element to set (O(1))
let ${setName} = new Set([${currentValues.slice(0, -1).join(', ')}]);
${setName}.add(${newValue});
// Result: Set(${currentValues.length}) {${currentValues.join(', ')}}`;

      case 'remove':
        return `// Remove element from set (O(1))
let ${setName} = new Set([${currentValues.join(', ')}]);
${setName}.delete(${searchValue});
// Result: Set(${currentValues.length - 1})`;

      case 'contains':
        return `// Check membership (O(1))
let ${setName} = new Set([${currentValues.join(', ')}]);
const hasValue = ${setName}.has(${searchValue});
// Result: ${currentValues.includes(searchValue)}`;

      default:
        return `// Set operations
let ${setName} = new Set([${currentValues.join(', ')}]);

// Basic operations
${setName}.add('newItem');        // O(1)
${setName}.delete('item');        // O(1)
${setName}.has('item');           // O(1)
${setName}.size;                  // O(1)

// Set algebra
const setA = new Set(['A', 'B', 'C']);
const setB = new Set(['B', 'C', 'D']);

// Union
const union = new Set([...setA, ...setB]);

// Intersection
const intersection = new Set([...setA].filter(x => setB.has(x)));

// Difference
const difference = new Set([...setA].filter(x => !setB.has(x)));`;
    }
  };

  // Calculate SVG dimensions
  const svgWidth = Math.min(800, Math.max(400, 600));
  const svgHeight = Math.min(400, Math.max(200, Math.ceil(currentData.length / 5) * 80 + 100));

  return (
    <div
      className={`bg-white border border-green-200 rounded-xl p-4 sm:p-6 lg:p-8 space-y-6 ${className}`}
      aria-label="Set Visualization"
    >
      {/* Sticky Header with Controls */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-green-100 pb-2 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
            Interactive Set Visualization
          </h3>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Explore set operations with unique elements and fast membership testing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${showCode ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            aria-label="Toggle Code Example"
          >
            <Code className="w-4 h-4" />
            <span>Code</span>
          </button>
        </div>
      </div>

      {/* Examples Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-green-900 mb-4 flex items-center">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Try These Examples
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {Object.entries(examples).map(([key, example]) => (
            <button
              key={key}
              onClick={() => loadExample(key)}
              className={`p-2 sm:p-3 rounded-lg text-left transition-all text-xs sm:text-sm ${currentExample === key ? 'bg-green-600 text-white shadow-md' : 'bg-white hover:bg-green-50 border border-green-200'}`}
            >
              <div className="font-medium capitalize">{key}</div>
              <div
                className={`text-xs ${currentExample === key ? 'text-green-100' : 'text-gray-600'}`}
              >
                {example.data.length} elements
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-green-800">
          <strong>Current:</strong> {examples[currentExample as keyof typeof examples]?.description}
        </div>
      </div>

      {/* Code Example Pane */}
      {showCode && (
        <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">JavaScript Code Example</h4>
            <button onClick={() => setShowCode(false)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>
          <pre className="whitespace-pre-wrap">{getCodeExample()}</pre>
        </div>
      )}

      {/* Set Visualization */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <svg width={svgWidth} height={svgHeight} className="w-full h-auto" aria-label="Set SVG">
          {/* Background grid */}
          <defs>
            <pattern id="setGrid" width="100" height="80" patternUnits="userSpaceOnUse">
              <rect width="100" height="80" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
            </pattern>
          </defs>

          <rect width={svgWidth} height={svgHeight} fill="url(#setGrid)" opacity="0.3" />

          {/* Set elements */}
          {currentData.map((element) => {
            const x = element.position?.x ?? 50;
            const y = element.position?.y ?? 50;
            const isSelected = selectedElement === element.id;

            return (
              <g key={element.id} className="set-element">
                {/* Element circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={25}
                  fill={element.highlighted ? element.color : isSelected ? '#DBEAFE' : 'white'}
                  stroke={element.highlighted ? element.color : isSelected ? '#10B981' : '#D1D5DB'}
                  strokeWidth={element.highlighted || isSelected ? 3 : 2}
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => handleElementClick(element.id)}
                  aria-label={`Set element ${element.value}`}
                >
                  <title>{`Value: ${element.value}${showHashValues ? `\nHash: ${element.hash}` : ''}`}</title>
                </circle>

                {/* Value text */}
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  className={`text-sm font-semibold ${element.highlighted ? 'fill-white' : 'fill-gray-900'}`}
                >
                  {element.value}
                </text>

                {/* Hash value (if enabled) */}
                {showHashValues && (
                  <text x={x} y={y + 40} textAnchor="middle" className="text-xs fill-gray-500">
                    #{element.hash}
                  </text>
                )}
              </g>
            );
          })}

          {/* Set label */}
          <text x={20} y={svgHeight - 20} className="text-sm font-semibold fill-gray-700">
            Set: {currentData.length} unique elements
          </text>
        </svg>

        {/* Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 px-2 py-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3 text-green-900 text-sm font-medium">
            <span>
              Size: <span className="font-bold">{currentData.length}</span>
            </span>
            <span>
              Max Size: <span className="font-bold">{maxSize}</span>
            </span>
            <span>
              Unique: <span className="font-bold">✓</span>
            </span>
          </div>
        </div>
      </div>

      {/* Set Algebra Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-green-900 mb-4 flex items-center">
          <Hash className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Set Algebra Operations
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Set A and Set B inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-800 mb-2">Set A</label>
              <input
                type="text"
                value={setA.join(',')}
                onChange={(e) =>
                  setSetA(
                    e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter((s) => s)
                  )
                }
                placeholder="A,B,C,D"
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-800 mb-2">Set B</label>
              <input
                type="text"
                value={setB.join(',')}
                onChange={(e) =>
                  setSetB(
                    e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter((s) => s)
                  )
                }
                placeholder="C,D,E,F"
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Operation buttons */}
          <div className="space-y-3">
            <button
              onClick={performUnion}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Union (A ∪ B)</span>
            </button>
            <button
              onClick={performIntersection}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Intersection (A ∩ B)</span>
            </button>
            <button
              onClick={performDifference}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              <Minus className="w-4 h-4" />
              <span>Difference (A - B)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operation Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add Operation */}
        <form onSubmit={handleAddSubmit} className="space-y-3">
          <label className="block font-medium text-gray-800 text-sm">Add Element</label>
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Enter value"
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={!!currentOperation}
          />
          <button
            type="submit"
            disabled={!!currentOperation || currentData.length >= maxSize}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Search Operation */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <label className="block font-medium text-gray-800 text-sm">Check Membership</label>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter value"
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={!!currentOperation}
          />
          <button
            type="submit"
            disabled={!!currentOperation}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm"
          >
            <Search className="w-4 h-4" />
            <span>Contains</span>
          </button>
        </form>

        {/* Remove Operation */}
        <div className="space-y-3">
          <label className="block font-medium text-gray-800 text-sm">Remove Element</label>
          <p className="text-xs text-gray-600">Click an element above to remove it</p>
          <button
            onClick={() => {
              if (selectedElement) {
                const element = currentData.find((el) => el.id === selectedElement);
                if (element) {
                  handleRemove(element.value);
                }
              }
            }}
            disabled={!!currentOperation || !selectedElement}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm"
          >
            <Minus className="w-4 h-4" />
            <span>Remove Selected</span>
          </button>
        </div>
      </div>

      {/* Educational Information */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-green-900 mb-4">
          Understanding Sets
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h5 className="font-medium text-green-800 mb-2 text-sm sm:text-base">
              Key Characteristics
            </h5>
            <ul className="text-xs sm:text-sm text-green-700 space-y-1">
              <li>
                • <strong>Uniqueness:</strong> No duplicate elements allowed
              </li>
              <li>
                • <strong>Unordered:</strong> No inherent order to elements
              </li>
              <li>
                • <strong>Fast Lookup:</strong> O(1) average case membership testing
              </li>
              <li>
                • <strong>Hash-based:</strong> Uses hashing for efficient operations
              </li>
              <li>
                • <strong>Mutable:</strong> Can add/remove elements dynamically
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-green-800 mb-2 text-sm sm:text-base">
              Real-World Applications
            </h5>
            <ul className="text-xs sm:text-sm text-green-700 space-y-1">
              <li>
                • <strong>Database Queries:</strong> Unique constraints and joins
              </li>
              <li>
                • <strong>Search Engines:</strong> Removing duplicate results
              </li>
              <li>
                • <strong>Programming:</strong> Eliminating duplicate values
              </li>
              <li>
                • <strong>Mathematics:</strong> Set theory operations
              </li>
              <li>
                • <strong>Caching:</strong> Tracking unique keys or items
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-200">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={showHashValues}
            onChange={() => {
              /* Will be handled by parent component */
            }}
            className="rounded"
          />
          <span className="text-gray-700">Show Hash Values</span>
        </label>
        <div className="text-gray-600">
          Size: {currentData.length}/{maxSize}
        </div>
      </div>
    </div>
  );
};

export default SetVisualization;
