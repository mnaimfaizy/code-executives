import React, { useState, useCallback, useMemo } from 'react';
import {
  Minus,
  Eye,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Code,
} from 'lucide-react';
import type { DequeElement, DataStructureOperation } from '../../../../../../types/datastructures';
import {
  useVisualizationState,
  useVisualizationInteraction,
} from '../../../../../../hooks/useDataStructures';

interface DequeVisualizationProps {
  isActive?: boolean;
  maxSize?: number;
  initialData?: string[] | number[];
  showIndices?: boolean;
  className?: string;
  debugState?: {
    isDebugging: boolean;
    dataStructureState: Record<string, unknown>;
    currentOperation?: {
      type: string;
      indices?: number[];
      values?: unknown[];
    };
  };
}

/**
 * Interactive Deque (Double-Ended Queue) Visualization Component
 * Demonstrates deque operations with front/back insertion and deletion
 */
export const DequeVisualization: React.FC<DequeVisualizationProps> = ({
  maxSize = 12,
  initialData = [10, 20, 30, 40],
  showIndices = false,
  className = '',
  debugState,
}) => {
  // Component state
  const [newFrontValue, setNewFrontValue] = useState<string>('');
  const [newBackValue, setNewBackValue] = useState<string>('');
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [showCode, setShowCode] = useState(false);
  const [currentExample, setCurrentExample] = useState<string>('default');

  // Convert initial data to deque elements
  const initialElements = useMemo(() => {
    return initialData.map((value, index) => ({
      id: `element-${index}`,
      value,
      position: { x: 50 + index * 80, y: 50 },
      highlighted: false,
      color: '#10B981',
      isFront: index === 0,
      isRear: index === initialData.length - 1,
    })) as DequeElement[];
  }, [initialData]);

  const { state, actions } = useVisualizationState(initialElements);
  const { selectedElement, handleElementClick, clearSelection } = useVisualizationInteraction();

  // Use debug state if debugging is active
  const currentData = useMemo(() => {
    if (debugState?.isDebugging && debugState.dataStructureState.deque) {
      const debugDeque = debugState.dataStructureState.deque as (string | number)[];
      if (Array.isArray(debugDeque)) {
        return debugDeque.map((value, index) => ({
          id: `debug-element-${index}`,
          value,
          position: { x: 50 + index * 80, y: 50 },
          highlighted: debugState.currentOperation?.indices?.includes(index) || false,
          color: debugState.currentOperation?.indices?.includes(index) ? '#F59E0B' : '#10B981',
          isFront: index === 0,
          isRear: index === debugDeque.length - 1,
        })) as DequeElement[];
      }
    }
    return state.data;
  }, [debugState, state.data]);

  // Preset examples
  const examples = useMemo(
    () => ({
      default: { data: [10, 20, 30, 40], description: 'Basic deque with numbers' },
      letters: { data: ['A', 'B', 'C', 'D'], description: 'Character deque' },
      empty: { data: [], description: 'Empty deque' },
      single: { data: [42], description: 'Single element' },
      mixed: { data: [1, 'two', 3.14, 'four'], description: 'Mixed types' },
    }),
    []
  );

  // Load example data
  const loadExample = useCallback(
    (exampleKey: string) => {
      const example = examples[exampleKey as keyof typeof examples];
      if (example) {
        const newElements = example.data.map((value, index) => ({
          id: `element-${index}`,
          value,
          position: { x: 50 + index * 80, y: 50 },
          highlighted: false,
          color: '#10B981',
          isFront: index === 0,
          isRear: index === example.data.length - 1,
        }));
        actions.updateData(newElements);
        setCurrentExample(exampleKey);
        clearSelection();
      }
    },
    [examples, actions, clearSelection]
  );

  // Handle deque operations
  const handleAddFront = useCallback(
    (value: string | number) => {
      if (currentData.length >= maxSize) return;

      setCurrentOperation('addFront');
      const newElement: DequeElement = {
        id: `element-${Date.now()}`,
        value,
        position: { x: 50, y: 50 },
        highlighted: true,
        color: '#10B981',
        isFront: true,
        isRear: false,
      };

      // Shift existing elements to the right
      const shiftedElements = currentData.map((el, index) => ({
        ...el,
        position: { x: 50 + (index + 1) * 80, y: 50 },
        isFront: false,
        isRear: index + 1 === currentData.length,
      }));

      const operation: DataStructureOperation = {
        type: 'insert',
        value,
        description: `Added ${value} to front of deque`,
        complexity: { time: 'O(1)', space: 'O(1)' },
      };

      actions.updateData([newElement, ...shiftedElements], operation);

      // Clear highlight after animation
      setTimeout(() => {
        const updatedElements = [newElement, ...shiftedElements].map((el) => ({
          ...el,
          highlighted: false,
          color: '#10B981',
        }));
        actions.updateData(updatedElements);
        setCurrentOperation('');
      }, 1000);
    },
    [currentData, maxSize, actions]
  );

  const handleAddBack = useCallback(
    (value: string | number) => {
      if (currentData.length >= maxSize) return;

      setCurrentOperation('addBack');
      const newElement: DequeElement = {
        id: `element-${Date.now()}`,
        value,
        position: { x: 50 + currentData.length * 80, y: 50 },
        highlighted: true,
        color: '#10B981',
        isFront: false,
        isRear: true,
      };

      // Update existing elements' back status
      const updatedElements = currentData.map((el, index) => ({
        ...el,
        isRear: index === currentData.length - 1,
      }));

      const operation: DataStructureOperation = {
        type: 'insert',
        value,
        description: `Added ${value} to back of deque`,
        complexity: { time: 'O(1)', space: 'O(1)' },
      };

      actions.updateData([...updatedElements, newElement], operation);

      // Clear highlight after animation
      setTimeout(() => {
        const resetElements = [...updatedElements, newElement].map((el) => ({
          ...el,
          highlighted: false,
          color: '#10B981',
        }));
        actions.updateData(resetElements);
        setCurrentOperation('');
      }, 1000);
    },
    [currentData, maxSize, actions]
  );

  const handleRemoveFront = useCallback(() => {
    if (currentData.length === 0) return;

    setCurrentOperation('removeFront');
    const elementToRemove = currentData[0];
    const updatedElements = currentData.map((el) => ({
      ...el,
      highlighted: el.id === elementToRemove.id,
      color: el.id === elementToRemove.id ? '#EF4444' : '#10B981',
    }));

    actions.updateData(updatedElements);

    setTimeout(() => {
      const remainingElements = currentData.slice(1).map((el, index) => ({
        ...el,
        position: { x: 50 + index * 80, y: 50 },
        highlighted: false,
        color: '#10B981',
        isFront: index === 0,
        isRear: index === currentData.length - 2,
      }));

      const operation: DataStructureOperation = {
        type: 'delete',
        value: elementToRemove.value,
        description: `Removed ${elementToRemove.value} from front of deque`,
        complexity: { time: 'O(1)', space: 'O(1)' },
      };

      actions.updateData(remainingElements, operation);
      setCurrentOperation('');
    }, 1000);
  }, [currentData, actions]);

  const handleRemoveBack = useCallback(() => {
    if (currentData.length === 0) return;

    setCurrentOperation('removeBack');
    const elementToRemove = currentData[currentData.length - 1];
    const updatedElements = currentData.map((el) => ({
      ...el,
      highlighted: el.id === elementToRemove.id,
      color: el.id === elementToRemove.id ? '#EF4444' : '#10B981',
    }));

    actions.updateData(updatedElements);

    setTimeout(() => {
      const remainingElements = currentData.slice(0, -1).map((el, index) => ({
        ...el,
        highlighted: false,
        color: '#10B981',
        isFront: index === 0,
        isRear: index === currentData.length - 2,
      }));

      const operation: DataStructureOperation = {
        type: 'delete',
        value: elementToRemove.value,
        description: `Removed ${elementToRemove.value} from back of deque`,
        complexity: { time: 'O(1)', space: 'O(1)' },
      };

      actions.updateData(remainingElements, operation);
      setCurrentOperation('');
    }, 1000);
  }, [currentData, actions]);

  const handlePeekFront = useCallback(() => {
    if (currentData.length === 0) return;

    setCurrentOperation('peekFront');
    const frontElement = currentData[0];
    const updatedElements = currentData.map((el) => ({
      ...el,
      highlighted: el.id === frontElement.id,
      color: el.id === frontElement.id ? '#F59E0B' : '#10B981',
    }));

    const operation: DataStructureOperation = {
      type: 'search',
      value: frontElement.value,
      description: `Peeked at front element: ${frontElement.value}`,
      complexity: { time: 'O(1)', space: 'O(1)' },
    };

    actions.updateData(updatedElements, operation);

    setTimeout(() => {
      const resetElements = updatedElements.map((el) => ({
        ...el,
        highlighted: false,
        color: '#10B981',
      }));
      actions.updateData(resetElements);
      setCurrentOperation('');
    }, 1500);
  }, [currentData, actions]);

  const handlePeekBack = useCallback(() => {
    if (currentData.length === 0) return;

    setCurrentOperation('peekBack');
    const backElement = currentData[currentData.length - 1];
    const updatedElements = currentData.map((el) => ({
      ...el,
      highlighted: el.id === backElement.id,
      color: el.id === backElement.id ? '#F59E0B' : '#10B981',
    }));

    const operation: DataStructureOperation = {
      type: 'search',
      value: backElement.value,
      description: `Peeked at back element: ${backElement.value}`,
      complexity: { time: 'O(1)', space: 'O(1)' },
    };

    actions.updateData(updatedElements, operation);

    setTimeout(() => {
      const resetElements = updatedElements.map((el) => ({
        ...el,
        highlighted: false,
        color: '#10B981',
      }));
      actions.updateData(resetElements);
      setCurrentOperation('');
    }, 1500);
  }, [currentData, actions]);

  // Handle form submissions
  const handleAddFrontSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = newFrontValue.trim();
    if (value) {
      handleAddFront(value);
      setNewFrontValue('');
    }
  };

  const handleAddBackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = newBackValue.trim();
    if (value) {
      handleAddBack(value);
      setNewBackValue('');
    }
  };

  // Generate code example based on current operation
  const getCodeExample = () => {
    const dequeName = 'myDeque';
    const currentValues = currentData.map((el) => el.value);

    switch (currentOperation) {
      case 'addFront':
        return `// Add element to front of deque (O(1))
let ${dequeName} = new Deque([${currentValues.slice(1).join(', ')}]);
${dequeName}.addFront(${newFrontValue});
// Result: Deque(${currentValues.length}) [${currentValues.join(', ')}]`;

      case 'addBack':
        return `// Add element to back of deque (O(1))
let ${dequeName} = new Deque([${currentValues.slice(0, -1).join(', ')}]);
${dequeName}.addBack(${newBackValue});
// Result: Deque(${currentValues.length}) [${currentValues.join(', ')}]`;

      case 'removeFront':
        return `// Remove element from front of deque (O(1))
let ${dequeName} = new Deque([${currentValues.join(', ')}]);
const removed = ${dequeName}.removeFront();
// Result: removed = ${currentValues[0]}, deque = [${currentValues.slice(1).join(', ')}]`;

      case 'removeBack':
        return `// Remove element from back of deque (O(1))
let ${dequeName} = new Deque([${currentValues.join(', ')}]);
const removed = ${dequeName}.removeBack();
// Result: removed = ${currentValues[currentValues.length - 1]}, deque = [${currentValues.slice(0, -1).join(', ')}]`;

      case 'peekFront':
        return `// Peek at front element (O(1))
let ${dequeName} = new Deque([${currentValues.join(', ')}]);
const front = ${dequeName}.peekFront();
// Result: front = ${currentValues[0]}`;

      case 'peekBack':
        return `// Peek at back element (O(1))
let ${dequeName} = new Deque([${currentValues.join(', ')}]);
const back = ${dequeName}.peekBack();
// Result: back = ${currentValues[currentValues.length - 1]}`;

      default:
        return `// Deque operations - all O(1) time complexity
class Deque {
  constructor() {
    this.front = 0;
    this.back = 0;
    this.data = {};
    this.size = 0;
  }

  // Front operations
  addFront(value) {
    this.front--;
    this.data[this.front] = value;
    this.size++;
  }

  removeFront() {
    if (this.isEmpty()) return undefined;
    const value = this.data[this.front];
    delete this.data[this.front];
    this.front++;
    this.size--;
    return value;
  }

  peekFront() {
    return this.isEmpty() ? undefined : this.data[this.front];
  }

  // Back operations
  addBack(value) {
    this.data[this.back] = value;
    this.back++;
    this.size++;
  }

  removeBack() {
    if (this.isEmpty()) return undefined;
    this.back--;
    const value = this.data[this.back];
    delete this.data[this.back];
    this.size--;
    return value;
  }

  peekBack() {
    return this.isEmpty() ? undefined : this.data[this.back - 1];
  }

  // Utility methods
  isEmpty() {
    return this.size === 0;
  }

  getSize() {
    return this.size;
  }
}`;
    }
  };

  // Calculate SVG dimensions
  const svgWidth = Math.min(1000, Math.max(400, currentData.length * 80 + 100));
  const svgHeight = Math.min(200, Math.max(120, 100));

  return (
    <div
      className={`bg-white border border-indigo-200 rounded-xl p-4 sm:p-6 lg:p-8 space-y-6 ${className}`}
      aria-label="Deque Visualization"
    >
      {/* Sticky Header with Controls */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-indigo-100 pb-2 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
            Interactive Deque Visualization
          </h3>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Explore double-ended queue operations with efficient front and back access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${showCode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            aria-label="Toggle Code Example"
          >
            <Code className="w-4 h-4" />
            <span>Code</span>
          </button>
        </div>
      </div>

      {/* Examples Section */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-indigo-900 mb-4 flex items-center">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Try These Examples
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {Object.entries(examples).map(([key, example]) => (
            <button
              key={key}
              onClick={() => loadExample(key)}
              className={`p-2 sm:p-3 rounded-lg text-left transition-all text-xs sm:text-sm ${currentExample === key ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-indigo-50 border border-indigo-200'}`}
            >
              <div className="font-medium capitalize">{key}</div>
              <div
                className={`text-xs ${currentExample === key ? 'text-indigo-100' : 'text-gray-600'}`}
              >
                {example.data.length} elements
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-indigo-800">
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

      {/* Deque Visualization */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <svg width={svgWidth} height={svgHeight} className="w-full h-auto" aria-label="Deque SVG">
          {/* Background grid */}
          <defs>
            <pattern id="dequeGrid" width="80" height="60" patternUnits="userSpaceOnUse">
              <rect width="80" height="60" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
            </pattern>
          </defs>

          <rect width={svgWidth} height={svgHeight} fill="url(#dequeGrid)" opacity="0.3" />

          {/* Deque container */}
          <rect
            x={20}
            y={20}
            width={svgWidth - 40}
            height={60}
            fill="none"
            stroke="#6366F1"
            strokeWidth="2"
            rx="8"
          />

          {/* Front and Back labels */}
          <text x={30} y={15} className="text-sm font-semibold fill-indigo-600">
            FRONT
          </text>
          <text x={svgWidth - 60} y={15} className="text-sm font-semibold fill-indigo-600">
            BACK
          </text>

          {/* Deque elements */}
          {currentData.map((element, index) => {
            const x = element.position?.x ?? 50 + index * 80;
            const y = element.position?.y ?? 50;
            const isSelected = selectedElement === element.id;

            return (
              <g key={element.id} className="deque-element">
                {/* Element rectangle */}
                <rect
                  x={x - 30}
                  y={y - 20}
                  width={60}
                  height={40}
                  fill={element.highlighted ? element.color : isSelected ? '#DBEAFE' : 'white'}
                  stroke={element.highlighted ? element.color : isSelected ? '#6366F1' : '#D1D5DB'}
                  strokeWidth={element.highlighted || isSelected ? 3 : 2}
                  rx="6"
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => handleElementClick(element.id)}
                  aria-label={`Deque element ${element.value}`}
                />

                {/* Value text */}
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  className={`text-sm font-semibold ${element.highlighted ? 'fill-white' : 'fill-gray-900'}`}
                >
                  {element.value}
                </text>

                {/* Index (if enabled) */}
                {showIndices && (
                  <text x={x} y={y - 25} textAnchor="middle" className="text-xs fill-gray-500">
                    [{index}]
                  </text>
                )}

                {/* Front/Back indicators */}
                {element.isFront && (
                  <ArrowLeft
                    x={x - 45}
                    y={y - 8}
                    width={12}
                    height={12}
                    className="fill-green-600"
                  />
                )}
                {element.isRear && (
                  <ArrowRight
                    x={x + 35}
                    y={y - 8}
                    width={12}
                    height={12}
                    className="fill-red-600"
                  />
                )}
              </g>
            );
          })}

          {/* Empty deque message */}
          {currentData.length === 0 && (
            <text
              x={svgWidth / 2}
              y={svgHeight / 2 + 5}
              textAnchor="middle"
              className="text-gray-400 fill-current"
            >
              Deque is empty
            </text>
          )}
        </svg>

        {/* Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 px-2 py-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex items-center gap-3 text-indigo-900 text-sm font-medium">
            <span>
              Size: <span className="font-bold">{currentData.length}</span>
            </span>
            <span>
              Max Size: <span className="font-bold">{maxSize}</span>
            </span>
            <span>
              Front:{' '}
              <span className="font-bold">
                {currentData.length > 0 ? currentData[0].value : '∅'}
              </span>
            </span>
            <span>
              Back:{' '}
              <span className="font-bold">
                {currentData.length > 0 ? currentData[currentData.length - 1].value : '∅'}
              </span>
            </span>
          </div>
          {state.currentOperation && (
            <div className="text-indigo-800 text-sm">
              Last Operation:{' '}
              <span className="font-bold">{state.currentOperation.description}</span>
            </div>
          )}
        </div>
      </div>

      {/* Animation Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => actions.prevStep()}
            disabled={!state.history || state.currentStep === 0}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={state.isPlaying ? actions.pause : actions.play}
            className="p-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            title={state.isPlaying ? 'Pause' : 'Play'}
          >
            {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => actions.nextStep()}
            disabled={!state.history || state.currentStep >= state.totalSteps - 1}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={actions.reset}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 font-medium">Speed:</span>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={state.speed}
            onChange={(e) => actions.setSpeed(parseFloat(e.target.value))}
            className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-600 min-w-[2rem]">{state.speed}x</span>
        </div>

        <div className="text-sm text-gray-600 font-medium">
          Step {state.currentStep + 1} of {state.totalSteps}
        </div>
      </div>

      {/* Operation Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Add Front */}
        <form onSubmit={handleAddFrontSubmit} className="space-y-3">
          <label className="block font-medium text-gray-800 text-sm">Add to Front</label>
          <input
            type="text"
            value={newFrontValue}
            onChange={(e) => setNewFrontValue(e.target.value)}
            placeholder="Enter value"
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!!currentOperation}
          />
          <button
            type="submit"
            disabled={!!currentOperation || currentData.length >= maxSize}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Add Front</span>
          </button>
        </form>

        {/* Add Back */}
        <form onSubmit={handleAddBackSubmit} className="space-y-3">
          <label className="block font-medium text-gray-800 text-sm">Add to Back</label>
          <input
            type="text"
            value={newBackValue}
            onChange={(e) => setNewBackValue(e.target.value)}
            placeholder="Enter value"
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!!currentOperation}
          />
          <button
            type="submit"
            disabled={!!currentOperation || currentData.length >= maxSize}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Add Back</span>
          </button>
        </form>

        {/* Remove Front */}
        <div className="space-y-3">
          <label className="block font-medium text-gray-800 text-sm">Remove from Front</label>
          <p className="text-xs text-gray-600">Removes and returns the front element</p>
          <button
            onClick={handleRemoveFront}
            disabled={!!currentOperation || currentData.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm"
          >
            <Minus className="w-4 h-4" />
            <span>Remove Front</span>
          </button>
        </div>

        {/* Remove Back */}
        <div className="space-y-3">
          <label className="block font-medium text-gray-800 text-sm">Remove from Back</label>
          <p className="text-xs text-gray-600">Removes and returns the back element</p>
          <button
            onClick={handleRemoveBack}
            disabled={!!currentOperation || currentData.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm"
          >
            <Minus className="w-4 h-4" />
            <span>Remove Back</span>
          </button>
        </div>
      </div>

      {/* Peek Operations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block font-medium text-gray-800 text-sm">Peek Front</label>
          <p className="text-xs text-gray-600">View the front element without removing it</p>
          <button
            onClick={handlePeekFront}
            disabled={!!currentOperation || currentData.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Peek Front</span>
          </button>
        </div>

        <div className="space-y-3">
          <label className="block font-medium text-gray-800 text-sm">Peek Back</label>
          <p className="text-xs text-gray-600">View the back element without removing it</p>
          <button
            onClick={handlePeekBack}
            disabled={!!currentOperation || currentData.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Peek Back</span>
          </button>
        </div>
      </div>

      {/* Complexity Information */}
      {state.currentOperation && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-indigo-900">
              Operation: {state.currentOperation.description}
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <span className="font-medium text-indigo-800">Time Complexity:</span>
              <span className="ml-2 font-mono text-indigo-900 text-lg">
                {state.currentOperation.complexity.time}
              </span>
            </div>
            <div>
              <span className="font-medium text-indigo-800">Space Complexity:</span>
              <span className="ml-2 font-mono text-indigo-900 text-lg">
                {state.currentOperation.complexity.space}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Educational Information */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-indigo-900 mb-4">
          Understanding Deques
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h5 className="font-medium text-indigo-800 mb-2 text-sm sm:text-base">
              Key Characteristics
            </h5>
            <ul className="text-xs sm:text-sm text-indigo-700 space-y-1">
              <li>
                • <strong>Double-ended:</strong> Operations at both ends
              </li>
              <li>
                • <strong>Efficient:</strong> O(1) for all basic operations
              </li>
              <li>
                • <strong>Versatile:</strong> Can implement stacks and queues
              </li>
              <li>
                • <strong>Linear:</strong> Elements stored in sequence
              </li>
              <li>
                • <strong>Dynamic:</strong> Size changes as elements are added/removed
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-indigo-800 mb-2 text-sm sm:text-base">
              Common Use Cases
            </h5>
            <ul className="text-xs sm:text-sm text-indigo-700 space-y-1">
              <li>
                • <strong>Browser History:</strong> Forward/backward navigation
              </li>
              <li>
                • <strong>Undo/Redo:</strong> Text editor functionality
              </li>
              <li>
                • <strong>Task Scheduling:</strong> Priority-based processing
              </li>
              <li>
                • <strong>Palindrome Checking:</strong> Character comparison
              </li>
              <li>
                • <strong>Sliding Windows:</strong> Algorithm optimization
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
            checked={showIndices}
            onChange={() => {
              /* Will be handled by parent component */
            }}
            className="rounded"
          />
          <span className="text-gray-700">Show Element Indices</span>
        </label>
        <div className="text-gray-600">
          Size: {currentData.length}/{maxSize}
        </div>
      </div>
    </div>
  );
};

export default DequeVisualization;
