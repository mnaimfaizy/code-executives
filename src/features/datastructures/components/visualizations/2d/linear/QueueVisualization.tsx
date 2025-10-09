import React, { useState, useCallback } from 'react';
import type { QueueVisualizationProps, QueueElement } from '../../../../../../types/datastructures';
import { ComplexityIndicator } from '../shared/ComplexityIndicator';

/**
 * QueueVisualization Component
 *
 * Interactive visualization of a queue data structure showing:
 * - FIFO (First In, First Out) principle
 * - Enqueue and dequeue operations
 * - Front and rear pointers
 * - Queue overflow and underflow conditions
 */
export const QueueVisualization: React.FC<QueueVisualizationProps> = ({
  initialData = [10, 20, 30],
  maxSize = 8,
  orientation = 'horizontal',
  showPointers = true,
  className = '',
  debugState,
}) => {
  // State for queue elements
  const [queue, setQueue] = useState<QueueElement[]>(() => {
    if (debugState?.isDebugging && debugState.dataStructureState.currentElements) {
      return debugState.dataStructureState.currentElements;
    }
    return initialData.map((value: number, index: number) => ({
      id: `queue-${index}`,
      value,
      position: { x: 0, y: 0 },
      queueIndex: index,
      isFront: index === 0,
      isRear: index === initialData.length - 1,
    }));
  });

  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [lastOperation, setLastOperation] = useState<string>('');

  // Update queue when debug state changes
  React.useEffect(() => {
    if (debugState?.isDebugging && debugState.dataStructureState.currentElements) {
      setQueue(debugState.dataStructureState.currentElements);
      if (debugState.currentOperation) {
        setLastOperation(debugState.currentOperation);
      }
    }
  }, [debugState]);

  // Get current operation complexity
  const getCurrentComplexity = useCallback((operation: string): { time: string; space: string } => {
    switch (operation) {
      case 'enqueue':
      case 'dequeue':
      case 'front':
      case 'rear':
        return { time: 'O(1)', space: 'O(1)' };
      case 'search':
        return { time: 'O(n)', space: 'O(1)' };
      default:
        return { time: 'O(1)', space: 'O(1)' };
    }
  }, []);

  // Enqueue element to rear of queue
  const enqueueElement = useCallback(
    async (value: number) => {
      if (queue.length >= maxSize) {
        setLastOperation(
          `Queue Overflow! Cannot enqueue ${value} - maximum size ${maxSize} reached`
        );
        return;
      }

      setIsAnimating(true);
      setLastOperation(`Enqueueing ${value} to rear of queue`);

      const newElement: QueueElement = {
        id: `queue-${Date.now()}`,
        value,
        position: { x: 0, y: 0 },
        queueIndex: queue.length,
        isFront: queue.length === 0, // First element becomes front
        isRear: true, // New element is always rear
      };

      // Update existing elements to not be rear
      const updatedQueue = queue.map((el, index) => ({
        ...el,
        isRear: false,
        isFront: index === 0, // Keep front status for first element
      }));

      // Add new element
      setQueue([...updatedQueue, newElement]);
      setHighlightedElement(newElement.id);

      // Animation sequence
      await new Promise((resolve) => setTimeout(resolve, 800));
      setHighlightedElement(null);
      setIsAnimating(false);
      setLastOperation(`Enqueued ${value} successfully`);
    },
    [queue, maxSize]
  );

  // Dequeue element from front of queue
  const dequeueElement = useCallback(async () => {
    if (queue.length === 0) {
      setLastOperation('Queue Underflow! Cannot dequeue from empty queue');
      return;
    }

    setIsAnimating(true);
    const frontElement = queue[0];
    setLastOperation(`Dequeuing ${frontElement.value} from front of queue`);
    setHighlightedElement(frontElement.id);

    // Animation sequence
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Remove front element and update indices
    const newQueue = queue.slice(1).map((el, index) => ({
      ...el,
      queueIndex: index,
      isFront: index === 0, // New first element becomes front
      isRear: index === queue.length - 2, // Keep rear status for last element
    }));

    setQueue(newQueue);
    setHighlightedElement(null);
    setIsAnimating(false);
    setLastOperation(`Dequeued ${frontElement.value} successfully`);

    return frontElement.value;
  }, [queue]);

  // Peek at front element
  const peekFront = useCallback(async () => {
    if (queue.length === 0) {
      setLastOperation('Queue is empty - nothing to peek');
      return;
    }

    setIsAnimating(true);
    const frontElement = queue[0];
    setLastOperation(`Peeking at front element: ${frontElement.value}`);
    setHighlightedElement(frontElement.id);

    // Animation sequence
    await new Promise((resolve) => setTimeout(resolve, 800));
    setHighlightedElement(null);
    setIsAnimating(false);
    setLastOperation(`Front element is ${frontElement.value}`);

    return frontElement.value;
  }, [queue]);

  // Peek at rear element
  const peekRear = useCallback(async () => {
    if (queue.length === 0) {
      setLastOperation('Queue is empty - nothing to peek');
      return;
    }

    setIsAnimating(true);
    const rearElement = queue[queue.length - 1];
    setLastOperation(`Peeking at rear element: ${rearElement.value}`);
    setHighlightedElement(rearElement.id);

    // Animation sequence
    await new Promise((resolve) => setTimeout(resolve, 800));
    setHighlightedElement(null);
    setIsAnimating(false);
    setLastOperation(`Rear element is ${rearElement.value}`);

    return rearElement.value;
  }, [queue]);

  // Search for a value
  const searchValue = useCallback(
    async (value: number) => {
      if (queue.length === 0) {
        setLastOperation('Queue is empty - nothing to search');
        return;
      }

      setIsAnimating(true);
      setLastOperation(`Searching for ${value} in queue`);

      // Search from front to rear
      let found = false;
      for (let i = 0; i < queue.length; i++) {
        const element = queue[i];
        setHighlightedElement(element.id);
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (element.value === value) {
          found = true;
          setLastOperation(`Found ${value} at position ${i + 1} from front`);
          await new Promise((resolve) => setTimeout(resolve, 800));
          break;
        }
      }

      if (!found) {
        setLastOperation(`${value} not found in queue`);
      }

      setHighlightedElement(null);
      setIsAnimating(false);
      return found;
    },
    [queue]
  );

  // Reset the queue
  const resetQueue = useCallback(() => {
    if (debugState?.isDebugging && debugState.dataStructureState.currentElements) {
      setQueue(debugState.dataStructureState.currentElements);
    } else {
      const resetQueue = initialData.map((value: number, index: number) => ({
        id: `queue-${index}`,
        value,
        position: { x: 0, y: 0 },
        queueIndex: index,
        isFront: index === 0,
        isRear: index === initialData.length - 1,
      }));

      setQueue(resetQueue);
    }
    setHighlightedElement(null);
    setIsAnimating(false);
    setLastOperation('Queue reset to initial state');
  }, [initialData, debugState]);

  // Handle operations
  const handleOperation = useCallback(
    async (operation: string) => {
      const value = parseInt(inputValue, 10);

      switch (operation) {
        case 'enqueue':
          if (!isNaN(value)) {
            await enqueueElement(value);
            setInputValue('');
          }
          break;
        case 'dequeue':
          await dequeueElement();
          break;
        case 'front':
          await peekFront();
          break;
        case 'rear':
          await peekRear();
          break;
        case 'search':
          if (!isNaN(value)) {
            await searchValue(value);
          }
          break;
        case 'reset':
          resetQueue();
          break;
      }
    },
    [inputValue, enqueueElement, dequeueElement, peekFront, peekRear, searchValue, resetQueue]
  );

  // Calculate element positions for rendering
  const getElementPositions = () => {
    const positions: { [key: string]: { x: number; y: number } } = {};
    const baseX = 50;
    const baseY = 200;
    const elementWidth = 60;
    const elementHeight = 40;
    const elementSpacing = 5;

    queue.forEach((element, index) => {
      if (orientation === 'horizontal') {
        positions[element.id] = {
          x: baseX + index * (elementWidth + elementSpacing),
          y: baseY,
        };
      } else {
        positions[element.id] = {
          x: baseX,
          y: baseY - index * (elementHeight + elementSpacing),
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
          <h3 className="text-2xl font-bold text-gray-900">Queue Visualization</h3>
          <p className="text-gray-600 mt-1">
            FIFO (First In, First Out) - Elements added at rear, removed from front
          </p>
        </div>
        <ComplexityIndicator
          operation="Queue Operations"
          timeComplexity={getCurrentComplexity('enqueue').time}
          spaceComplexity={getCurrentComplexity('enqueue').space}
          explanation="All basic queue operations are constant time"
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
            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900"
            disabled={isAnimating}
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleOperation('enqueue')}
            disabled={isAnimating || !inputValue || queue.length >= maxSize}
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded transition-colors"
          >
            Enqueue
          </button>
          <button
            onClick={() => handleOperation('dequeue')}
            disabled={isAnimating || queue.length === 0}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded transition-colors"
          >
            Dequeue
          </button>
          <button
            onClick={() => handleOperation('front')}
            disabled={isAnimating || queue.length === 0}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition-colors"
          >
            Front
          </button>
          <button
            onClick={() => handleOperation('rear')}
            disabled={isAnimating || queue.length === 0}
            className="px-3 py-1 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded transition-colors"
          >
            Rear
          </button>
          <button
            onClick={() => handleOperation('search')}
            disabled={isAnimating || !inputValue || queue.length === 0}
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

        <div className="flex items-center text-sm text-gray-600">
          <span>
            Size: {queue.length}/{maxSize}
          </span>
        </div>
      </div>

      {/* Queue Visualization */}
      <div className="p-6 bg-gray-50 rounded-lg overflow-x-auto">
        <svg
          viewBox="0 0 600 300"
          className="w-full h-64 min-w-[500px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Queue frame */}
          <rect
            x="40"
            y="180"
            width={Math.max(400, queue.length * 65 + 20)}
            height="50"
            className="fill-none stroke-gray-400 stroke-2 stroke-dashed"
            rx="4"
          />

          {/* Front and Rear pointer indicators */}
          {showPointers && queue.length > 0 && (
            <g>
              {/* Front pointer */}
              <text
                x={elementPositions[queue[0].id]?.x + 30 || 0}
                y="170"
                className="text-sm font-mono fill-blue-600"
                textAnchor="middle"
              >
                FRONT
              </text>
              <line
                x1={elementPositions[queue[0].id]?.x + 30 || 0}
                y1="175"
                x2={elementPositions[queue[0].id]?.x + 30 || 0}
                y2="180"
                className="stroke-blue-600 stroke-2"
                markerEnd="url(#frontArrow)"
              />

              {/* Rear pointer */}
              <text
                x={elementPositions[queue[queue.length - 1].id]?.x + 30 || 0}
                y="260"
                className="text-sm font-mono fill-orange-600"
                textAnchor="middle"
              >
                REAR
              </text>
              <line
                x1={elementPositions[queue[queue.length - 1].id]?.x + 30 || 0}
                y1="255"
                x2={elementPositions[queue[queue.length - 1].id]?.x + 30 || 0}
                y2="230"
                className="stroke-orange-600 stroke-2"
                markerEnd="url(#rearArrow)"
              />
            </g>
          )}

          {/* Arrow marker definitions */}
          <defs>
            <marker
              id="frontArrow"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" className="fill-blue-600" />
            </marker>
            <marker id="rearArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" className="fill-orange-600" />
            </marker>
          </defs>

          {/* Render queue elements */}
          {queue.map((element, index) => {
            const position = elementPositions[element.id];
            if (!position) return null;

            const isHighlighted = highlightedElement === element.id;
            const isFront = element.isFront;
            const isRear = element.isRear;

            return (
              <g key={element.id}>
                {/* Element container */}
                <rect
                  x={position.x}
                  y={position.y - 20}
                  width="60"
                  height="40"
                  rx="4"
                  className={`transition-all duration-300 ${
                    isHighlighted
                      ? 'fill-yellow-100 stroke-yellow-500 stroke-3'
                      : isFront
                        ? 'fill-blue-100 stroke-blue-500 stroke-2'
                        : isRear
                          ? 'fill-orange-100 stroke-orange-500 stroke-2'
                          : 'fill-white stroke-gray-300 stroke-1'
                  }`}
                />

                {/* Element value */}
                <text
                  x={position.x + 30}
                  y={position.y + 5}
                  textAnchor="middle"
                  className={`text-lg font-bold transition-colors duration-300 ${
                    isHighlighted
                      ? 'fill-yellow-700'
                      : isFront
                        ? 'fill-blue-700'
                        : isRear
                          ? 'fill-orange-700'
                          : 'fill-gray-700'
                  }`}
                >
                  {element.value}
                </text>

                {/* Queue index */}
                <text
                  x={position.x + 30}
                  y={position.y - 30}
                  textAnchor="middle"
                  className="text-xs fill-gray-500 font-mono"
                >
                  [{index}]
                </text>

                {/* Flow direction arrow */}
                {index < queue.length - 1 && (
                  <line
                    x1={position.x + 65}
                    y1={position.y}
                    x2={position.x + 70}
                    y2={position.y}
                    className="stroke-gray-400 stroke-2"
                    markerEnd="url(#flowArrow)"
                  />
                )}
              </g>
            );
          })}

          {/* Flow direction arrow marker */}
          <defs>
            <marker id="flowArrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" className="fill-gray-400" />
            </marker>
          </defs>

          {/* Empty queue indicator */}
          {queue.length === 0 && (
            <text x="300" y="205" textAnchor="middle" className="text-lg fill-gray-400">
              Empty Queue
            </text>
          )}

          {/* Direction indicators */}
          <g>
            <text
              x="30"
              y="160"
              className="text-sm fill-blue-600 font-semibold"
              textAnchor="middle"
            >
              Dequeue
            </text>
            <text x="30" y="175" className="text-xs fill-blue-500" textAnchor="middle">
              (Remove)
            </text>

            <text
              x={Math.max(450, queue.length * 65 + 60)}
              y="160"
              className="text-sm fill-orange-600 font-semibold"
              textAnchor="middle"
            >
              Enqueue
            </text>
            <text
              x={Math.max(450, queue.length * 65 + 60)}
              y="175"
              className="text-xs fill-orange-500"
              textAnchor="middle"
            >
              (Add)
            </text>
          </g>
        </svg>

        {/* Operation Status */}
        {lastOperation && (
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">{lastOperation}</p>
          </div>
        )}
      </div>

      {/* Queue Information */}
      <div className="mt-4 p-4 bg-orange-50 rounded-lg">
        <h4 className="font-semibold text-orange-900 mb-2">Queue Properties:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-orange-800">FIFO Principle:</strong>
            <span className="text-orange-700 ml-2">First element added is first to be removed</span>
          </div>
          <div>
            <strong className="text-orange-800">Access Pattern:</strong>
            <span className="text-orange-700 ml-2">Front and rear elements accessible</span>
          </div>
          <div>
            <strong className="text-orange-800">Enqueue:</strong>
            <span className="text-orange-700 ml-2">Add element to rear of queue</span>
          </div>
          <div>
            <strong className="text-orange-800">Dequeue:</strong>
            <span className="text-orange-700 ml-2">Remove and return front element</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueVisualization;
