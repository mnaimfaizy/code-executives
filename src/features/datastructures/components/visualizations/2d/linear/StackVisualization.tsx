import React, { useState, useCallback } from 'react';
import type { StackVisualizationProps, StackElement } from '../../../../../../types/datastructures';
import { ComplexityIndicator } from '../shared/ComplexityIndicator';

/**
 * StackVisualization Component
 *
 * Interactive visualization of a stack data structure showing:
 * - LIFO (Last In, First Out) principle
 * - Push and pop operations
 * - Stack overflow and underflow conditions
 * - Visual representation as a vertical stack
 */
export const StackVisualization: React.FC<StackVisualizationProps> = ({
  initialData = [10, 20, 30],
  maxSize = 8,
  orientation = 'vertical',
  showStackPointer = true,
  className = '',
  debugState,
}) => {
  // State for stack elements
  const [stack, setStack] = useState<StackElement[]>(() => {
    if (debugState?.isDebugging && debugState.dataStructureState.currentElements) {
      return debugState.dataStructureState.currentElements;
    }
    return initialData.map((value: number, index: number) => ({
      id: `stack-${index}`,
      value,
      position: { x: 0, y: 0 },
      stackIndex: index,
      isTop: index === initialData.length - 1,
    }));
  });

  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [lastOperation, setLastOperation] = useState<string>('');

  // Update stack when debug state changes
  React.useEffect(() => {
    if (debugState?.isDebugging && debugState.dataStructureState.currentElements) {
      setStack(debugState.dataStructureState.currentElements);
      if (debugState.currentOperation) {
        setLastOperation(debugState.currentOperation);
      }
    }
  }, [debugState]);

  // Get current operation complexity
  const getCurrentComplexity = useCallback((operation: string): { time: string; space: string } => {
    switch (operation) {
      case 'push':
      case 'pop':
      case 'peek':
        return { time: 'O(1)', space: 'O(1)' };
      case 'search':
        return { time: 'O(n)', space: 'O(1)' };
      default:
        return { time: 'O(1)', space: 'O(1)' };
    }
  }, []);

  // Push element to stack
  const pushElement = useCallback(
    async (value: number) => {
      if (stack.length >= maxSize) {
        setLastOperation(`Stack Overflow! Cannot push ${value} - maximum size ${maxSize} reached`);
        return;
      }

      setIsAnimating(true);
      setLastOperation(`Pushing ${value} onto stack`);

      const newElement: StackElement = {
        id: `stack-${Date.now()}`,
        value,
        position: { x: 0, y: 0 },
        stackIndex: stack.length,
        isTop: true,
      };

      // Update existing elements to not be top
      const updatedStack = stack.map((el) => ({ ...el, isTop: false }));

      // Add new element
      setStack([...updatedStack, newElement]);
      setHighlightedElement(newElement.id);

      // Animation sequence
      await new Promise((resolve) => setTimeout(resolve, 800));
      setHighlightedElement(null);
      setIsAnimating(false);
      setLastOperation(`Pushed ${value} successfully`);
    },
    [stack, maxSize]
  );

  // Pop element from stack
  const popElement = useCallback(async () => {
    if (stack.length === 0) {
      setLastOperation('Stack Underflow! Cannot pop from empty stack');
      return;
    }

    setIsAnimating(true);
    const topElement = stack[stack.length - 1];
    setLastOperation(`Popping ${topElement.value} from stack`);
    setHighlightedElement(topElement.id);

    // Animation sequence
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Remove top element and update the new top
    const newStack = stack.slice(0, -1);
    if (newStack.length > 0) {
      newStack[newStack.length - 1].isTop = true;
    }

    setStack(newStack);
    setHighlightedElement(null);
    setIsAnimating(false);
    setLastOperation(`Popped ${topElement.value} successfully`);

    return topElement.value;
  }, [stack]);

  // Peek at top element
  const peekElement = useCallback(async () => {
    if (stack.length === 0) {
      setLastOperation('Stack is empty - nothing to peek');
      return;
    }

    setIsAnimating(true);
    const topElement = stack[stack.length - 1];
    setLastOperation(`Peeking at top element: ${topElement.value}`);
    setHighlightedElement(topElement.id);

    // Animation sequence
    await new Promise((resolve) => setTimeout(resolve, 800));
    setHighlightedElement(null);
    setIsAnimating(false);
    setLastOperation(`Top element is ${topElement.value}`);

    return topElement.value;
  }, [stack]);

  // Search for a value
  const searchValue = useCallback(
    async (value: number) => {
      if (stack.length === 0) {
        setLastOperation('Stack is empty - nothing to search');
        return;
      }

      setIsAnimating(true);
      setLastOperation(`Searching for ${value} in stack`);

      // Search from top to bottom
      let found = false;
      for (let i = stack.length - 1; i >= 0; i--) {
        const element = stack[i];
        setHighlightedElement(element.id);
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (element.value === value) {
          found = true;
          setLastOperation(`Found ${value} at position ${stack.length - i} from top`);
          await new Promise((resolve) => setTimeout(resolve, 800));
          break;
        }
      }

      if (!found) {
        setLastOperation(`${value} not found in stack`);
      }

      setHighlightedElement(null);
      setIsAnimating(false);
      return found;
    },
    [stack]
  );

  // Reset the stack
  const resetStack = useCallback(() => {
    if (debugState?.isDebugging && debugState.dataStructureState.currentElements) {
      setStack(debugState.dataStructureState.currentElements);
    } else {
      const resetStack = initialData.map((value: number, index: number) => ({
        id: `stack-${index}`,
        value,
        position: { x: 0, y: 0 },
        stackIndex: index,
        isTop: index === initialData.length - 1,
      }));

      setStack(resetStack);
    }
    setHighlightedElement(null);
    setIsAnimating(false);
    setLastOperation('Stack reset to initial state');
  }, [initialData, debugState]);

  // Handle operations
  const handleOperation = useCallback(
    async (operation: string) => {
      const value = parseInt(inputValue, 10);

      switch (operation) {
        case 'push':
          if (!isNaN(value)) {
            await pushElement(value);
            setInputValue('');
          }
          break;
        case 'pop':
          await popElement();
          break;
        case 'peek':
          await peekElement();
          break;
        case 'search':
          if (!isNaN(value)) {
            await searchValue(value);
          }
          break;
        case 'reset':
          resetStack();
          break;
      }
    },
    [inputValue, pushElement, popElement, peekElement, searchValue, resetStack]
  );

  // Calculate element positions for rendering
  const getElementPositions = () => {
    const positions: { [key: string]: { x: number; y: number } } = {};
    const baseX = 200;
    const baseY = 350;
    const elementHeight = 40;
    const elementSpacing = 5;

    stack.forEach((element, index) => {
      if (orientation === 'vertical') {
        positions[element.id] = {
          x: baseX,
          y: baseY - index * (elementHeight + elementSpacing),
        };
      } else {
        positions[element.id] = {
          x: baseX + index * (elementHeight + elementSpacing),
          y: baseY,
        };
      }
    });

    return positions;
  };

  const elementPositions = getElementPositions();

  return (
    <div className={`bg-white border border-blue-200 rounded-xl p-8 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Stack Visualization</h3>
          <p className="text-gray-600 mt-1">
            LIFO (Last In, First Out) - Elements added and removed from the top
          </p>
        </div>
        <ComplexityIndicator
          operation="Stack Operations"
          timeComplexity={getCurrentComplexity('push').time}
          spaceComplexity={getCurrentComplexity('push').space}
          explanation="All basic stack operations are constant time"
        />
      </div>

      {/* Control Panel */}
      <div className="flex flex-wrap items-center gap-4 p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-gray-200 rounded-lg mb-8">
        <div className="flex items-center space-x-2">
          <label className="font-medium text-gray-800">Value:</label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isAnimating}
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleOperation('push')}
            disabled={isAnimating || !inputValue || stack.length >= maxSize}
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded transition-colors"
          >
            Push
          </button>
          <button
            onClick={() => handleOperation('pop')}
            disabled={isAnimating || stack.length === 0}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded transition-colors"
          >
            Pop
          </button>
          <button
            onClick={() => handleOperation('peek')}
            disabled={isAnimating || stack.length === 0}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition-colors"
          >
            Peek
          </button>
          <button
            onClick={() => handleOperation('search')}
            disabled={isAnimating || !inputValue || stack.length === 0}
            className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded transition-colors"
          >
            Search
          </button>
          <button
            onClick={() => handleOperation('reset')}
            disabled={isAnimating}
            className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <span>
            Size: {stack.length}/{maxSize}
          </span>
        </div>
      </div>

      {/* Stack Visualization */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
        <svg viewBox="0 0 500 400" className="w-full h-80" preserveAspectRatio="xMidYMid meet">
          {/* Stack base */}
          <rect
            x="150"
            y="360"
            width="100"
            height="8"
            className="fill-gray-600 dark:fill-gray-400"
          />

          {/* Stack frame */}
          <rect
            x="145"
            y="40"
            width="110"
            height="320"
            className="fill-none stroke-gray-400 dark:stroke-gray-500 stroke-2 stroke-dashed"
            rx="4"
          />

          {/* Stack pointer indicator */}
          {showStackPointer && stack.length > 0 && (
            <g>
              <text
                x="270"
                y={elementPositions[stack[stack.length - 1].id]?.y + 25 || 0}
                className="text-sm font-mono fill-orange-600 dark:fill-orange-400"
                textAnchor="start"
              >
                ← TOP
              </text>
              <line
                x1="250"
                y1={elementPositions[stack[stack.length - 1].id]?.y + 20 || 0}
                x2="265"
                y2={elementPositions[stack[stack.length - 1].id]?.y + 20 || 0}
                className="stroke-orange-600 dark:stroke-orange-400 stroke-2"
                markerEnd="url(#arrow)"
              />
            </g>
          )}

          {/* Arrow marker definition */}
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" className="fill-orange-600 dark:fill-orange-400" />
            </marker>
          </defs>

          {/* Render stack elements */}
          {stack.map((element, index) => {
            const position = elementPositions[element.id];
            if (!position) return null;

            const isHighlighted = highlightedElement === element.id;
            const isTop = element.isTop;

            return (
              <g key={element.id}>
                {/* Element container */}
                <rect
                  x={position.x - 50}
                  y={position.y - 20}
                  width="100"
                  height="35"
                  rx="4"
                  className={`transition-all duration-300 ${
                    isHighlighted
                      ? 'fill-yellow-100 dark:fill-yellow-900 stroke-yellow-500 stroke-3'
                      : isTop
                        ? 'fill-green-100 dark:fill-green-900 stroke-green-500 stroke-2'
                        : 'fill-white dark:fill-gray-700 stroke-gray-300 dark:stroke-gray-600 stroke-1'
                  }`}
                />

                {/* Element value */}
                <text
                  x={position.x}
                  y={position.y + 5}
                  textAnchor="middle"
                  className={`text-lg font-bold transition-colors duration-300 ${
                    isHighlighted
                      ? 'fill-yellow-700 dark:fill-yellow-300'
                      : isTop
                        ? 'fill-green-700 dark:fill-green-300'
                        : 'fill-gray-700 dark:fill-gray-300'
                  }`}
                >
                  {element.value}
                </text>

                {/* Stack index */}
                <text
                  x={position.x - 65}
                  y={position.y + 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-500 dark:fill-gray-400 font-mono"
                >
                  [{index}]
                </text>

                {/* Top indicator */}
                {isTop && !isHighlighted && (
                  <text
                    x={position.x}
                    y={position.y - 25}
                    textAnchor="middle"
                    className="text-xs fill-green-600 dark:fill-green-400 font-semibold"
                  >
                    TOP
                  </text>
                )}
              </g>
            );
          })}

          {/* Empty stack indicator */}
          {stack.length === 0 && (
            <text
              x="200"
              y="200"
              textAnchor="middle"
              className="text-lg fill-gray-400 dark:fill-gray-500"
            >
              Empty Stack
            </text>
          )}

          {/* Stack growth direction indicator */}
          <g>
            <line
              x1="120"
              y1="100"
              x2="120"
              y2="50"
              className="stroke-blue-500 stroke-2"
              markerEnd="url(#growthArrow)"
            />
            <text
              x="90"
              y="80"
              className="text-xs fill-blue-600 dark:fill-blue-400 font-medium"
              textAnchor="middle"
            >
              Growth
            </text>
          </g>

          <defs>
            <marker
              id="growthArrow"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" className="fill-blue-500" />
            </marker>
          </defs>
        </svg>

        {/* Operation Status */}
        {lastOperation && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">{lastOperation}</p>
          </div>
        )}
      </div>

      {/* Stack Information */}
      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Stack Properties:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-green-800 dark:text-green-200">LIFO Principle:</strong>
            <span className="text-green-700 dark:text-green-300 ml-2">
              Last element added is first to be removed
            </span>
          </div>
          <div>
            <strong className="text-green-800 dark:text-green-200">Access Pattern:</strong>
            <span className="text-green-700 dark:text-green-300 ml-2">
              Only top element is accessible
            </span>
          </div>
          <div>
            <strong className="text-green-800 dark:text-green-200">Push Operation:</strong>
            <span className="text-green-700 dark:text-green-300 ml-2">
              Add element to top of stack
            </span>
          </div>
          <div>
            <strong className="text-green-800 dark:text-green-200">Pop Operation:</strong>
            <span className="text-green-700 dark:text-green-300 ml-2">
              Remove and return top element
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackVisualization;
