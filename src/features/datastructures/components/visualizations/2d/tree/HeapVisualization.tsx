import React, { useState, useCallback, useEffect } from 'react';
import { Plus, RotateCcw, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import type { BaseVisualizationProps } from '../../../../../../types/datastructures';

interface HeapNode {
  id: string;
  value: number;
  index: number;
  level: number;
  isHighlighted?: boolean;
  isComparing?: boolean;
}

interface HeapVisualizationProps extends BaseVisualizationProps {
  maxNodes?: number;
  heapType?: 'min' | 'max';
}

interface TreePosition {
  x: number;
  y: number;
}

const HeapVisualization: React.FC<HeapVisualizationProps> = ({
  maxNodes = 15,
  heapType = 'max',
  className = '',
  onOperationComplete,
}) => {
  const [heap, setHeap] = useState<HeapNode[]>([]);
  const [nodePositions, setNodePositions] = useState<Map<string, TreePosition>>(new Map());
  const [inputValue, setInputValue] = useState('');
  const [highlightedNodes, setHighlightedNodes] = useState<number[]>([]);
  const [isOperating, setIsOperating] = useState(false);

  // Constants for layout
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 500;
  const NODE_RADIUS = 20;
  const LEVEL_HEIGHT = 60;

  // Heap operations
  const getParentIndex = (index: number) => Math.floor((index - 1) / 2);
  const getLeftChildIndex = (index: number) => 2 * index + 1;
  const getRightChildIndex = (index: number) => 2 * index + 2;

  const shouldSwap = useCallback(
    (parent: number, child: number) => {
      if (heapType === 'max') {
        return parent < child;
      } else {
        return parent > child;
      }
    },
    [heapType]
  );

  // Heapify up operation
  const heapifyUp = useCallback(
    (heapArray: HeapNode[], startIndex: number): HeapNode[] => {
      let currentIndex = startIndex;

      while (currentIndex > 0) {
        const parentIndex = getParentIndex(currentIndex);

        if (!shouldSwap(heapArray[parentIndex].value, heapArray[currentIndex].value)) {
          break;
        }

        // Swap nodes
        [heapArray[currentIndex], heapArray[parentIndex]] = [
          heapArray[parentIndex],
          heapArray[currentIndex],
        ];

        // Update indices
        heapArray[currentIndex].index = currentIndex;
        heapArray[parentIndex].index = parentIndex;

        currentIndex = parentIndex;
      }

      return heapArray;
    },
    [shouldSwap]
  );

  // Heapify down operation
  const heapifyDown = useCallback(
    (heapArray: HeapNode[], startIndex: number): HeapNode[] => {
      let currentIndex = startIndex;

      while (true) {
        let targetIndex = currentIndex;
        const leftChildIndex = getLeftChildIndex(currentIndex);
        const rightChildIndex = getRightChildIndex(currentIndex);

        // Find the appropriate child to swap with
        if (
          leftChildIndex < heapArray.length &&
          shouldSwap(heapArray[targetIndex].value, heapArray[leftChildIndex].value)
        ) {
          targetIndex = leftChildIndex;
        }

        if (
          rightChildIndex < heapArray.length &&
          shouldSwap(heapArray[targetIndex].value, heapArray[rightChildIndex].value)
        ) {
          targetIndex = rightChildIndex;
        }

        if (targetIndex === currentIndex) {
          break;
        }

        // Swap nodes
        [heapArray[currentIndex], heapArray[targetIndex]] = [
          heapArray[targetIndex],
          heapArray[currentIndex],
        ];

        // Update indices
        heapArray[currentIndex].index = currentIndex;
        heapArray[targetIndex].index = targetIndex;

        currentIndex = targetIndex;
      }

      return heapArray;
    },
    [shouldSwap]
  );

  // Calculate positions for heap nodes
  const calculatePositions = useCallback(
    (heapArray: HeapNode[]) => {
      const positions = new Map<string, TreePosition>();

      heapArray.forEach((node, index) => {
        const level = Math.floor(Math.log2(index + 1));
        const nodesInLevel = Math.pow(2, level);
        const positionInLevel = index - (Math.pow(2, level) - 1);

        const levelWidth = SVG_WIDTH * 0.9;
        const xSpacing = levelWidth / (nodesInLevel + 1);
        const x = SVG_WIDTH * 0.05 + (positionInLevel + 1) * xSpacing;
        const y = 50 + level * LEVEL_HEIGHT;

        positions.set(node.id, { x, y });
      });

      return positions;
    },
    [SVG_WIDTH, LEVEL_HEIGHT]
  );

  // Update positions when heap changes
  useEffect(() => {
    const newPositions = calculatePositions(heap);
    setNodePositions(newPositions);
  }, [heap, calculatePositions]);

  // Handle insertion
  const handleInsert = useCallback(() => {
    if (!inputValue.trim() || isOperating) return;

    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || heap.length >= maxNodes) return;

    setIsOperating(true);
    setHighlightedNodes([]);

    const newNode: HeapNode = {
      id: `heap-${numValue}-${Date.now()}`,
      value: numValue,
      index: heap.length,
      level: Math.floor(Math.log2(heap.length + 1)),
    };

    const newHeap = [...heap, newNode];

    // Animate the heapify up process
    let currentIndex = newHeap.length - 1;
    const animationSteps: number[] = [];

    // Collect animation steps
    while (currentIndex > 0) {
      const parentIndex = getParentIndex(currentIndex);
      animationSteps.push(currentIndex, parentIndex);

      if (!shouldSwap(newHeap[parentIndex].value, newHeap[currentIndex].value)) {
        break;
      }

      currentIndex = parentIndex;
    }

    // Apply heapify up
    const finalHeap = heapifyUp([...newHeap], newHeap.length - 1);

    // Animate the process
    if (animationSteps.length > 0) {
      let stepIndex = 0;
      const animateStep = () => {
        if (stepIndex < animationSteps.length) {
          setHighlightedNodes([animationSteps[stepIndex], animationSteps[stepIndex + 1]]);
          stepIndex += 2;
          setTimeout(animateStep, 600);
        } else {
          setHighlightedNodes([]);
          setIsOperating(false);
        }
      };
      setTimeout(animateStep, 300);
    } else {
      setIsOperating(false);
    }

    setHeap(finalHeap);
    setInputValue('');

    onOperationComplete?.({
      type: 'insert',
      target: numValue,
      description: `Inserted ${numValue} into ${heapType} heap and restored heap property`,
      complexity: { time: 'O(log n)', space: 'O(1)' },
    });
  }, [
    inputValue,
    heap,
    maxNodes,
    heapType,
    heapifyUp,
    shouldSwap,
    isOperating,
    onOperationComplete,
  ]);

  // Extract root (remove max/min)
  const handleExtractRoot = useCallback(() => {
    if (heap.length === 0 || isOperating) return;

    setIsOperating(true);
    const rootValue = heap[0].value;

    if (heap.length === 1) {
      setHeap([]);
      setIsOperating(false);
      onOperationComplete?.({
        type: 'delete',
        target: rootValue,
        description: `Extracted ${heapType === 'max' ? 'maximum' : 'minimum'} value: ${rootValue}`,
        complexity: { time: 'O(log n)', space: 'O(1)' },
      });
      return;
    }

    // Move last element to root and remove last
    const newHeap = [...heap];
    newHeap[0] = { ...newHeap[newHeap.length - 1], index: 0 };
    newHeap.pop();

    // Update indices
    newHeap.forEach((node, index) => {
      node.index = index;
      node.level = Math.floor(Math.log2(index + 1));
    });

    // Animate heapify down
    const animationSteps: number[] = [];
    let currentIndex = 0;

    // Collect steps for animation
    while (true) {
      let targetIndex = currentIndex;
      const leftChildIndex = getLeftChildIndex(currentIndex);
      const rightChildIndex = getRightChildIndex(currentIndex);

      animationSteps.push(currentIndex);

      if (leftChildIndex < newHeap.length) {
        animationSteps.push(leftChildIndex);
        if (shouldSwap(newHeap[targetIndex].value, newHeap[leftChildIndex].value)) {
          targetIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < newHeap.length) {
        animationSteps.push(rightChildIndex);
        if (shouldSwap(newHeap[targetIndex].value, newHeap[rightChildIndex].value)) {
          targetIndex = rightChildIndex;
        }
      }

      if (targetIndex === currentIndex) {
        break;
      }

      currentIndex = targetIndex;
    }

    // Apply heapify down
    const finalHeap = heapifyDown([...newHeap], 0);

    // Animate the process
    let stepIndex = 0;
    const animateStep = () => {
      if (stepIndex < animationSteps.length) {
        const currentSteps = [];
        currentSteps.push(animationSteps[stepIndex]);
        if (stepIndex + 1 < animationSteps.length) currentSteps.push(animationSteps[stepIndex + 1]);
        if (stepIndex + 2 < animationSteps.length) currentSteps.push(animationSteps[stepIndex + 2]);

        setHighlightedNodes(currentSteps);
        stepIndex += 3;
        setTimeout(animateStep, 800);
      } else {
        setHighlightedNodes([]);
        setIsOperating(false);
      }
    };

    setHeap(finalHeap);
    setTimeout(animateStep, 300);

    onOperationComplete?.({
      type: 'delete',
      target: rootValue,
      description: `Extracted ${heapType === 'max' ? 'maximum' : 'minimum'} value: ${rootValue}`,
      complexity: { time: 'O(log n)', space: 'O(1)' },
    });
  }, [heap, heapType, heapifyDown, shouldSwap, isOperating, onOperationComplete]);

  // Build heap from array
  const handleBuildHeap = useCallback(() => {
    if (isOperating) return;

    const randomValues = Array.from({ length: 8 }, () => Math.floor(Math.random() * 100) + 1);
    setIsOperating(true);

    const nodes: HeapNode[] = randomValues.map((value, index) => ({
      id: `heap-${value}-${Date.now()}-${index}`,
      value,
      index,
      level: Math.floor(Math.log2(index + 1)),
    }));

    // Build heap using heapify
    const finalHeap = [...nodes];

    // Heapify from last non-leaf node down to root
    for (let i = Math.floor(finalHeap.length / 2) - 1; i >= 0; i--) {
      heapifyDown(finalHeap, i);
    }

    setHeap(finalHeap);
    setTimeout(() => setIsOperating(false), 1000);

    onOperationComplete?.({
      type: 'custom',
      description: `Built ${heapType} heap from random array`,
      complexity: { time: 'O(n)', space: 'O(1)' },
    });
  }, [heapType, heapifyDown, isOperating, onOperationComplete]);

  // Reset heap
  const handleReset = useCallback(() => {
    setHeap([]);
    setNodePositions(new Map());
    setInputValue('');
    setHighlightedNodes([]);
    setIsOperating(false);
  }, []);

  // Render heap edges
  const renderEdges = () => {
    const edges: React.ReactElement[] = [];

    heap.forEach((node, index) => {
      const nodePos = nodePositions.get(node.id);
      if (!nodePos) return;

      const leftChildIndex = getLeftChildIndex(index);
      const rightChildIndex = getRightChildIndex(index);

      // Left child edge
      if (leftChildIndex < heap.length) {
        const leftChild = heap[leftChildIndex];
        const leftPos = nodePositions.get(leftChild.id);
        if (leftPos) {
          const isHighlighted =
            highlightedNodes.includes(index) && highlightedNodes.includes(leftChildIndex);
          edges.push(
            <line
              key={`edge-${node.id}-left`}
              x1={nodePos.x}
              y1={nodePos.y}
              x2={leftPos.x}
              y2={leftPos.y}
              stroke={isHighlighted ? '#3b82f6' : '#6b7280'}
              strokeWidth={isHighlighted ? 3 : 2}
              className="transition-all duration-300"
            />
          );
        }
      }

      // Right child edge
      if (rightChildIndex < heap.length) {
        const rightChild = heap[rightChildIndex];
        const rightPos = nodePositions.get(rightChild.id);
        if (rightPos) {
          const isHighlighted =
            highlightedNodes.includes(index) && highlightedNodes.includes(rightChildIndex);
          edges.push(
            <line
              key={`edge-${node.id}-right`}
              x1={nodePos.x}
              y1={nodePos.y}
              x2={rightPos.x}
              y2={rightPos.y}
              stroke={isHighlighted ? '#3b82f6' : '#6b7280'}
              strokeWidth={isHighlighted ? 3 : 2}
              className="transition-all duration-300"
            />
          );
        }
      }
    });

    return edges;
  };

  // Render heap nodes
  const renderNodes = () => {
    return heap.map((node, index) => {
      const position = nodePositions.get(node.id);
      if (!position) return null;

      const isHighlighted = highlightedNodes.includes(index);
      const isRoot = index === 0;

      return (
        <g key={node.id} className="transition-all duration-300">
          {/* Node circle */}
          <circle
            cx={position.x}
            cy={position.y}
            r={NODE_RADIUS}
            fill={
              isHighlighted
                ? '#3b82f6'
                : isRoot
                  ? heapType === 'max'
                    ? '#ef4444'
                    : '#10b981'
                  : '#f3f4f6'
            }
            stroke={
              isHighlighted
                ? '#1d4ed8'
                : isRoot
                  ? heapType === 'max'
                    ? '#dc2626'
                    : '#059669'
                  : '#9ca3af'
            }
            strokeWidth={isHighlighted || isRoot ? 3 : 2}
            className="cursor-pointer hover:fill-blue-100 transition-colors"
          />

          {/* Node value */}
          <text
            x={position.x}
            y={position.y + 4}
            textAnchor="middle"
            className="text-sm font-medium fill-gray-700 pointer-events-none"
          >
            {node.value}
          </text>

          {/* Index indicator */}
          <text
            x={position.x}
            y={position.y - NODE_RADIUS - 8}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-500 pointer-events-none"
          >
            [{index}]
          </text>

          {/* Root indicator */}
          {isRoot && (
            <text
              x={position.x + NODE_RADIUS + 8}
              y={position.y + 4}
              textAnchor="start"
              className={`text-xs font-bold pointer-events-none ${
                heapType === 'max' ? 'fill-red-600' : 'fill-green-600'
              }`}
            >
              {heapType === 'max' ? 'MAX' : 'MIN'}
            </text>
          )}
        </g>
      );
    });
  };

  // Check if heap property is satisfied
  const isValidHeap = () => {
    for (let i = 0; i < heap.length; i++) {
      const leftChildIndex = getLeftChildIndex(i);
      const rightChildIndex = getRightChildIndex(i);

      if (leftChildIndex < heap.length) {
        if (shouldSwap(heap[i].value, heap[leftChildIndex].value)) {
          return false;
        }
      }

      if (rightChildIndex < heap.length) {
        if (shouldSwap(heap[i].value, heap[rightChildIndex].value)) {
          return false;
        }
      }
    }
    return true;
  };

  return (
    <div className={`heap-visualization ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Value to insert"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
            disabled={isOperating}
          />
          <button
            onClick={handleInsert}
            disabled={heap.length >= maxNodes || isOperating}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Insert</span>
          </button>
        </div>

        <button
          onClick={handleExtractRoot}
          disabled={heap.length === 0 || isOperating}
          className={`flex items-center space-x-1 px-3 py-2 text-white rounded-lg transition-colors disabled:bg-gray-400 ${
            heapType === 'max' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {heapType === 'max' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
          <span className="text-sm">Extract {heapType === 'max' ? 'Max' : 'Min'}</span>
        </button>

        <button
          onClick={handleBuildHeap}
          disabled={isOperating}
          className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">Build Heap</span>
        </button>

        <button
          onClick={handleReset}
          className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">Reset</span>
        </button>
      </div>

      {/* Heap Properties */}
      <div
        className={`mb-4 p-4 rounded-lg ${
          heapType === 'max' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span
              className={`font-medium ${
                heapType === 'max'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-green-700 dark:text-green-300'
              }`}
            >
              {heapType === 'max' ? 'Max' : 'Min'} Heap Property:
            </span>
            <span
              className={`font-semibold ml-2 ${isValidHeap() ? 'text-green-600' : 'text-red-600'}`}
            >
              {isValidHeap() ? '✓ Valid' : '✗ Invalid'}
            </span>
          </div>
          <div
            className={`text-xs ${
              heapType === 'max'
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            Parent {heapType === 'max' ? '≥' : '≤'} Children
          </div>
        </div>
      </div>

      {/* Heap Visualization */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-auto"
        >
          {renderEdges()}
          {renderNodes()}
        </svg>

        {heap.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">{heapType === 'max' ? '🔺' : '🔻'}</div>
              <p className="text-sm">
                Add nodes to build your {heapType === 'max' ? 'Max' : 'Min'} Heap
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Watch automatic reordering maintain heap property
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Array Representation */}
      <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Array Representation
        </h4>
        <div className="flex flex-wrap gap-1">
          {heap.map((node, index) => (
            <div
              key={node.id}
              className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                highlightedNodes.includes(index)
                  ? 'bg-blue-500 text-white'
                  : index === 0
                    ? heapType === 'max'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {node.value}
            </div>
          ))}
          {heap.length === 0 && (
            <div className="text-gray-500 text-sm italic">Empty heap - add some values!</div>
          )}
        </div>
      </div>

      {/* Heap Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{heap.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Nodes</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {heap.length > 0 ? Math.floor(Math.log2(heap.length)) + 1 : 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Height</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {heap.length > 0 ? heap[0].value : '-'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {heapType === 'max' ? 'Maximum' : 'Minimum'}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {isValidHeap() ? '✓' : '✗'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Valid Heap</div>
        </div>
      </div>
    </div>
  );
};

export default HeapVisualization;
