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
  isBubblingUp?: boolean;
  isBubblingDown?: boolean;
  isInserting?: boolean;
  isExtracting?: boolean;
}

type AnimationState =
  | 'idle'
  | 'inserting'
  | 'bubbling-up'
  | 'bubbling-down'
  | 'comparing'
  | 'extracting';
type HeapType = 'min' | 'max';

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
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [currentHeapType, setCurrentHeapType] = useState<HeapType>(heapType);

  // Constants for layout
  const SVG_WIDTH = 1200;
  const SVG_HEIGHT = 600;
  const NODE_RADIUS = 24;
  const LEVEL_HEIGHT = 80;

  // Heap operations
  const getParentIndex = (index: number) => Math.floor((index - 1) / 2);
  const getLeftChildIndex = (index: number) => 2 * index + 1;
  const getRightChildIndex = (index: number) => 2 * index + 2;

  const shouldSwap = useCallback(
    (parent: number, child: number, type?: HeapType) => {
      const effectiveType = type || heapType;
      if (effectiveType === 'max') {
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
    (heapArray: HeapNode[], startIndex: number, type?: HeapType): HeapNode[] => {
      let currentIndex = startIndex;

      while (true) {
        let targetIndex = currentIndex;
        const leftChildIndex = getLeftChildIndex(currentIndex);
        const rightChildIndex = getRightChildIndex(currentIndex);

        // Find the appropriate child to swap with
        if (
          leftChildIndex < heapArray.length &&
          shouldSwap(heapArray[targetIndex].value, heapArray[leftChildIndex].value, type)
        ) {
          targetIndex = leftChildIndex;
        }

        if (
          rightChildIndex < heapArray.length &&
          shouldSwap(heapArray[targetIndex].value, heapArray[rightChildIndex].value, type)
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
    setAnimationState('inserting');
    setStatusMessage(`Inserting ${numValue} at the end of the heap...`);

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
      setAnimationState('bubbling-up');
      setStatusMessage(`Bubbling up ${numValue} to maintain heap property...`);

      let stepIndex = 0;
      const animateStep = () => {
        if (stepIndex < animationSteps.length) {
          setHighlightedNodes([animationSteps[stepIndex], animationSteps[stepIndex + 1]]);
          stepIndex += 2;
          setTimeout(animateStep, 700);
        } else {
          setHighlightedNodes([]);
          setStatusMessage(`Successfully inserted ${numValue}. Heap property maintained!`);
          setAnimationState('idle');
          setTimeout(() => {
            setStatusMessage('');
            setIsOperating(false);
          }, 1500);
        }
      };
      setTimeout(animateStep, 500);
    } else {
      setStatusMessage(`Inserted ${numValue} at correct position. No bubbling needed!`);
      setTimeout(() => {
        setStatusMessage('');
        setAnimationState('idle');
        setIsOperating(false);
      }, 1500);
    }

    setHeap(finalHeap);
    setInputValue('');

    onOperationComplete?.({
      type: 'insert',
      target: numValue,
      description: `Inserted ${numValue} into ${currentHeapType} heap and restored heap property`,
      complexity: { time: 'O(log n)', space: 'O(1)' },
    });
  }, [
    inputValue,
    heap,
    maxNodes,
    currentHeapType,
    heapifyUp,
    shouldSwap,
    isOperating,
    onOperationComplete,
  ]);

  // Extract root (remove max/min)
  const handleExtractRoot = useCallback(() => {
    if (heap.length === 0 || isOperating) return;

    setIsOperating(true);
    setAnimationState('extracting');
    const rootValue = heap[0].value;
    setStatusMessage(
      `Extracting ${currentHeapType === 'max' ? 'maximum' : 'minimum'} value: ${rootValue}...`
    );

    if (heap.length === 1) {
      setTimeout(() => {
        setHeap([]);
        setStatusMessage(`Extracted ${rootValue}. Heap is now empty.`);
        setAnimationState('idle');
        setTimeout(() => {
          setStatusMessage('');
          setIsOperating(false);
        }, 1500);
      }, 500);

      onOperationComplete?.({
        type: 'delete',
        target: rootValue,
        description: `Extracted ${currentHeapType === 'max' ? 'maximum' : 'minimum'} value: ${rootValue}`,
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
    setAnimationState('bubbling-down');
    setStatusMessage(`Bubbling down to restore heap property...`);

    let stepIndex = 0;
    const animateStep = () => {
      if (stepIndex < animationSteps.length) {
        const currentSteps = [];
        currentSteps.push(animationSteps[stepIndex]);
        if (stepIndex + 1 < animationSteps.length) currentSteps.push(animationSteps[stepIndex + 1]);
        if (stepIndex + 2 < animationSteps.length) currentSteps.push(animationSteps[stepIndex + 2]);

        setHighlightedNodes(currentSteps);
        stepIndex += 3;
        setTimeout(animateStep, 900);
      } else {
        setHighlightedNodes([]);
        setStatusMessage(`Successfully extracted ${rootValue}. Heap property maintained!`);
        setAnimationState('idle');
        setTimeout(() => {
          setStatusMessage('');
          setIsOperating(false);
        }, 1500);
      }
    };

    setHeap(finalHeap);
    setTimeout(animateStep, 500);

    onOperationComplete?.({
      type: 'delete',
      target: rootValue,
      description: `Extracted ${currentHeapType === 'max' ? 'maximum' : 'minimum'} value: ${rootValue}`,
      complexity: { time: 'O(log n)', space: 'O(1)' },
    });
  }, [heap, currentHeapType, heapifyDown, shouldSwap, isOperating, onOperationComplete]);

  // Build heap from array
  const handleBuildHeap = useCallback(() => {
    if (isOperating) return;

    const randomValues = Array.from({ length: 8 }, () => Math.floor(Math.random() * 100) + 1);
    setIsOperating(true);
    setAnimationState('comparing');
    setStatusMessage(`Building ${currentHeapType} heap from random array...`);

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

    setTimeout(() => {
      setStatusMessage(
        `Successfully built ${currentHeapType} heap with ${finalHeap.length} nodes!`
      );
      setAnimationState('idle');
      setTimeout(() => {
        setStatusMessage('');
        setIsOperating(false);
      }, 1500);
    }, 1000);

    onOperationComplete?.({
      type: 'custom',
      description: `Built ${currentHeapType} heap from random array`,
      complexity: { time: 'O(n)', space: 'O(1)' },
    });
  }, [currentHeapType, heapifyDown, isOperating, onOperationComplete]);

  // Reset heap
  const handleReset = useCallback(() => {
    setHeap([]);
    setNodePositions(new Map());
    setInputValue('');
    setHighlightedNodes([]);
    setStatusMessage('');
    setAnimationState('idle');
    setIsOperating(false);
  }, []);

  // Toggle heap type (Max/Min)
  const handleToggleHeapType = useCallback(() => {
    if (isOperating) return;

    const newType: HeapType = currentHeapType === 'max' ? 'min' : 'max';
    setCurrentHeapType(newType);

    // If heap exists, rebuild it with the new type
    if (heap.length > 0) {
      setIsOperating(true);
      setAnimationState('comparing');
      setStatusMessage(`Converting to ${newType} heap...`);

      // Keep the same values but rebuild with new heap type
      const values = heap.map((node) => node.value);
      const newHeap: HeapNode[] = values.map((value, index) => ({
        id: `heap-${value}-${Date.now()}-${index}`,
        value,
        index,
        level: Math.floor(Math.log2(index + 1)),
      }));

      // Rebuild heap with new type
      for (let i = Math.floor(newHeap.length / 2) - 1; i >= 0; i--) {
        heapifyDown(newHeap, i, newType);
      }

      setTimeout(() => {
        setHeap(newHeap);
        setStatusMessage(`Successfully converted to ${newType} heap!`);
        setAnimationState('idle');
        setTimeout(() => {
          setStatusMessage('');
          setIsOperating(false);
        }, 1500);
      }, 800);
    }

    onOperationComplete?.({
      type: 'custom',
      description: `Switched to ${newType} heap`,
      complexity: { time: 'O(n)', space: 'O(1)' },
    });
  }, [currentHeapType, heap, heapifyDown, isOperating, onOperationComplete]);

  // Render heap edges
  const renderEdges = () => {
    const edges: React.ReactElement[] = [];

    heap.forEach((node, index) => {
      const nodePos = nodePositions.get(node.id);
      if (!nodePos) return;

      const leftChildIndex = getLeftChildIndex(index);
      const rightChildIndex = getRightChildIndex(index);

      // Determine edge color based on animation state
      const getEdgeColor = (isHighlighted: boolean) => {
        if (!isHighlighted) return '#d1d5db'; // gray-300

        if (animationState === 'inserting' || animationState === 'idle') {
          return '#3b82f6'; // blue-600
        } else if (animationState === 'bubbling-up') {
          return '#10b981'; // green-600
        } else if (animationState === 'bubbling-down') {
          return '#f59e0b'; // amber-600
        } else if (animationState === 'extracting') {
          return '#ef4444'; // red-600
        }
        return '#3b82f6';
      };

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
              stroke={getEdgeColor(isHighlighted)}
              strokeWidth={isHighlighted ? 4 : 2}
              strokeLinecap="round"
              opacity={isHighlighted ? 1 : 0.6}
              className="transition-all duration-500"
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
              stroke={getEdgeColor(isHighlighted)}
              strokeWidth={isHighlighted ? 4 : 2}
              strokeLinecap="round"
              opacity={isHighlighted ? 1 : 0.6}
              className="transition-all duration-500"
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

      // Determine node fill based on state
      let nodeFill = '#f3f4f6'; // default gray
      let nodeStroke = '#9ca3af';
      let nodeFilter = '';

      if (isRoot) {
        nodeFill = `url(#${currentHeapType === 'max' ? 'max' : 'min'}-root-gradient)`;
        nodeStroke = currentHeapType === 'max' ? '#dc2626' : '#059669';
        nodeFilter = 'url(#glow)';
      } else if (isHighlighted) {
        // Use different gradients based on animation state
        if (animationState === 'inserting' || animationState === 'idle') {
          nodeFill = 'url(#inserting-gradient)';
          nodeStroke = '#1d4ed8';
        } else if (animationState === 'bubbling-up') {
          nodeFill = 'url(#bubbling-up-gradient)';
          nodeStroke = '#059669';
        } else if (animationState === 'bubbling-down') {
          nodeFill = 'url(#bubbling-down-gradient)';
          nodeStroke = '#d97706';
        } else if (animationState === 'extracting') {
          nodeFill = 'url(#extracting-gradient)';
          nodeStroke = '#b91c1c';
        }
        nodeFilter = 'url(#glow)';
      }

      return (
        <g key={node.id} className="transition-all duration-500">
          {/* Node shadow */}
          <circle
            cx={position.x}
            cy={position.y + 2}
            r={NODE_RADIUS}
            fill="rgba(0,0,0,0.1)"
            className="transition-all duration-500"
          />

          {/* Node circle */}
          <circle
            cx={position.x}
            cy={position.y}
            r={NODE_RADIUS}
            fill={nodeFill}
            stroke={nodeStroke}
            strokeWidth={isHighlighted || isRoot ? 3 : 2}
            filter={nodeFilter}
            className="cursor-pointer hover:opacity-90 transition-all duration-300"
          />

          {/* Pulse animation for highlighted nodes */}
          {isHighlighted && (
            <circle
              cx={position.x}
              cy={position.y}
              r={NODE_RADIUS}
              fill="none"
              stroke={nodeStroke}
              strokeWidth="2"
              opacity="0.5"
              className="animate-ping"
            />
          )}

          {/* Node value */}
          <text
            x={position.x}
            y={position.y + 5}
            textAnchor="middle"
            className={`text-base font-bold pointer-events-none ${
              isRoot || isHighlighted ? 'fill-white' : 'fill-gray-700'
            }`}
          >
            {node.value}
          </text>

          {/* Index indicator */}
          <text
            x={position.x}
            y={position.y - NODE_RADIUS - 10}
            textAnchor="middle"
            className="text-xs font-semibold fill-gray-600 pointer-events-none"
          >
            [{index}]
          </text>

          {/* Root indicator */}
          {isRoot && (
            <text
              x={position.x + NODE_RADIUS + 12}
              y={position.y + 5}
              textAnchor="start"
              className={`text-sm font-black pointer-events-none ${
                currentHeapType === 'max' ? 'fill-red-600' : 'fill-green-600'
              }`}
            >
              {currentHeapType === 'max' ? 'MAX' : 'MIN'}
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
            className="px-4 py-2 border-2 border-blue-300 rounded-lg text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
            disabled={isOperating}
          />
          <button
            onClick={handleInsert}
            disabled={heap.length >= maxNodes || isOperating}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Insert</span>
          </button>
        </div>

        <button
          onClick={handleExtractRoot}
          disabled={heap.length === 0 || isOperating}
          className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium disabled:cursor-not-allowed ${
            currentHeapType === 'max'
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500'
              : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500'
          }`}
        >
          {currentHeapType === 'max' ? (
            <ArrowDown className="w-4 h-4" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
          <span className="text-sm">Extract {currentHeapType === 'max' ? 'Max' : 'Min'}</span>
        </button>

        <button
          onClick={handleBuildHeap}
          disabled={isOperating}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 font-medium"
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">Build Heap</span>
        </button>

        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">Reset</span>
        </button>

        {/* Heap Type Toggle */}
        <button
          onClick={handleToggleHeapType}
          disabled={isOperating}
          className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium disabled:cursor-not-allowed ${
            currentHeapType === 'max'
              ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500'
              : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500'
          }`}
        >
          <div className="flex items-center space-x-1">
            {currentHeapType === 'max' ? (
              <>
                <ArrowDown className="w-4 h-4" />
                <span className="text-sm font-bold">MAX</span>
              </>
            ) : (
              <>
                <ArrowUp className="w-4 h-4" />
                <span className="text-sm font-bold">MIN</span>
              </>
            )}
          </div>
          <span className="text-xs opacity-90">Toggle</span>
        </button>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`mb-4 p-4 rounded-lg border-l-4 ${
            animationState === 'inserting'
              ? 'bg-blue-50 border-blue-500 text-blue-800'
              : animationState === 'bubbling-up'
                ? 'bg-green-50 border-green-500 text-green-800'
                : animationState === 'bubbling-down'
                  ? 'bg-amber-50 border-amber-500 text-amber-800'
                  : animationState === 'extracting'
                    ? 'bg-red-50 border-red-500 text-red-800'
                    : 'bg-gray-50 border-gray-500 text-gray-800'
          }`}
        >
          <p className="text-sm font-medium">{statusMessage}</p>
        </div>
      )}

      {/* Heap Properties */}
      <div
        className={`mb-6 p-5 rounded-xl shadow-lg border-2 ${
          currentHeapType === 'max'
            ? 'bg-gradient-to-br from-red-50 via-white to-red-50 border-red-200'
            : 'bg-gradient-to-br from-green-50 via-white to-green-50 border-green-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span
              className={`font-bold text-lg ${
                currentHeapType === 'max' ? 'text-red-700' : 'text-green-700'
              }`}
            >
              {currentHeapType === 'max' ? 'Max' : 'Min'} Heap Property:
            </span>
            <span
              className={`font-bold ml-3 text-lg ${isValidHeap() ? 'text-green-600' : 'text-red-600'}`}
            >
              {isValidHeap() ? '✓ Valid' : '✗ Invalid'}
            </span>
          </div>
          <div
            className={`text-sm font-semibold px-4 py-2 rounded-lg ${
              currentHeapType === 'max' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            Parent {currentHeapType === 'max' ? '≥' : '≤'} Children
          </div>
        </div>
      </div>

      {/* Heap Visualization */}
      <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-xl p-6 mb-6">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-auto"
        >
          {/* SVG Gradients */}
          <defs>
            <linearGradient id="max-root-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <linearGradient id="min-root-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="inserting-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="bubbling-up-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="bubbling-down-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="comparing-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
            <linearGradient id="extracting-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>

            {/* Glow filters */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {renderEdges()}
          {renderNodes()}
        </svg>

        {heap.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`text-center p-8 rounded-2xl border-2 border-dashed backdrop-blur-sm bg-white/80 shadow-xl ${
                currentHeapType === 'max' ? 'border-red-300' : 'border-green-300'
              }`}
            >
              <div className="text-6xl mb-4">{currentHeapType === 'max' ? '🔺' : '🔻'}</div>
              <p
                className={`text-xl font-bold mb-2 ${
                  currentHeapType === 'max' ? 'text-red-700' : 'text-green-700'
                }`}
              >
                Build Your {currentHeapType === 'max' ? 'Max' : 'Min'} Heap
              </p>
              <p className="text-sm text-gray-600 max-w-xs">
                Insert values to see automatic reordering that maintains the heap property
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Array Representation */}
      <div className="mt-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl border-2 border-gray-200 shadow-lg p-5">
        <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📊</span>
          Array Representation
        </h4>
        <div className="flex flex-wrap gap-2">
          {heap.map((node, index) => (
            <div
              key={node.id}
              className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-md ${
                highlightedNodes.includes(index)
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-110 shadow-lg'
                  : index === 0
                    ? currentHeapType === 'max'
                      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                      : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
              }`}
            >
              <div className="text-xs opacity-75 mb-0.5">[{index}]</div>
              <div>{node.value}</div>
            </div>
          ))}
          {heap.length === 0 && (
            <div className="text-gray-500 text-sm italic py-2">Empty heap - add some values!</div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl border-2 border-gray-200 shadow-lg p-5">
        <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🎨</span>
          Node State Legend
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">MAX</span>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Max Root</div>
              <div className="text-xs text-gray-600">Largest value</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">MIN</span>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Min Root</div>
              <div className="text-xs text-gray-600">Smallest value</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md"></div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Inserting</div>
              <div className="text-xs text-gray-600">New node</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-md"></div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Bubbling Up</div>
              <div className="text-xs text-gray-600">Moving up</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shadow-md"></div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Bubbling Down</div>
              <div className="text-xs text-gray-600">Moving down</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-md"></div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Comparing</div>
              <div className="text-xs text-gray-600">Building heap</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-md"></div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Extracting</div>
              <div className="text-xs text-gray-600">Removing root</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-400 shadow-md"></div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Normal</div>
              <div className="text-xs text-gray-600">Regular node</div>
            </div>
          </div>
        </div>
      </div>

      {/* Heap Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-md">
          <div className="text-2xl font-bold text-blue-700">{heap.length}</div>
          <div className="text-sm font-medium text-blue-600 mt-1">Total Nodes</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 shadow-md">
          <div className="text-2xl font-bold text-purple-700">
            {heap.length > 0 ? Math.floor(Math.log2(heap.length)) + 1 : 0}
          </div>
          <div className="text-sm font-medium text-purple-600 mt-1">Height</div>
        </div>
        <div
          className={`bg-gradient-to-br rounded-xl p-4 shadow-md border-2 ${
            currentHeapType === 'max'
              ? 'from-red-50 to-orange-50 border-red-200'
              : 'from-green-50 to-teal-50 border-green-200'
          }`}
        >
          <div
            className={`text-2xl font-bold ${
              currentHeapType === 'max' ? 'text-red-700' : 'text-green-700'
            }`}
          >
            {heap.length > 0 ? heap[0].value : '-'}
          </div>
          <div
            className={`text-sm font-medium mt-1 ${
              currentHeapType === 'max' ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {currentHeapType === 'max' ? 'Maximum' : 'Minimum'}
          </div>
        </div>
        <div
          className={`bg-gradient-to-br rounded-xl p-4 shadow-md border-2 ${
            isValidHeap()
              ? 'from-emerald-50 to-green-50 border-emerald-200'
              : 'from-red-50 to-rose-50 border-red-200'
          }`}
        >
          <div
            className={`text-2xl font-bold ${isValidHeap() ? 'text-emerald-700' : 'text-red-700'}`}
          >
            {isValidHeap() ? '✓' : '✗'}
          </div>
          <div
            className={`text-sm font-medium mt-1 ${
              isValidHeap() ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            Valid Heap
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeapVisualization;
