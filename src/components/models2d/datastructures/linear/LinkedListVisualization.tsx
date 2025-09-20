import React, { useState, useCallback } from 'react';
import type {
  LinkedListVisualizationProps,
  LinkedListNode,
} from '../../../../types/datastructures';

import { ComplexityIndicator } from '../shared/ComplexityIndicator';

/**
 * LinkedListVisualization Component
 *
 * Interactive visualization of a singly linked list showing:
 * - Node structure with data and next pointer
 * - Dynamic insertion and deletion operations
 * - Memory representation with pointers
 * - Traversal animations
 */
export const LinkedListVisualization: React.FC<LinkedListVisualizationProps> = ({
  initialData = [10, 20, 30],
  maxSize = 6,
  showMemoryAddresses = true,
  className = '',
}) => {
  // State for linked list nodes
  const [nodes, setNodes] = useState<LinkedListNode[]>(() =>
    initialData.map((value, index) => ({
      id: `node-${index}`,
      value,
      next: index < initialData.length - 1 ? `node-${index + 1}` : null,
      memoryAddress: `0x${(1000 + index * 8).toString(16).toUpperCase()}`,
    }))
  );

  const [head, setHead] = useState<string | null>(nodes.length > 0 ? nodes[0].id : null);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<number>(0);

  // Get current operation complexity
  const getCurrentComplexity = useCallback((operation: string): { time: string; space: string } => {
    switch (operation) {
      case 'insert':
      case 'delete':
      case 'search':
      case 'access':
        return { time: 'O(n)', space: 'O(1)' };
      case 'prepend':
        return { time: 'O(1)', space: 'O(1)' };
      default:
        return { time: 'O(1)', space: 'O(1)' };
    }
  }, []);

  // Insert node at specific position
  const insertNode = useCallback(
    async (value: number, position: number) => {
      if (nodes.length >= maxSize) {
        alert(`Maximum size of ${maxSize} reached!`);
        return;
      }

      setIsAnimating(true);
      setAnimationStep(0);

      const newNodeId = `node-${Date.now()}`;
      const newNode: LinkedListNode = {
        id: newNodeId,
        value,
        next: null,
        memoryAddress: `0x${(1000 + nodes.length * 8).toString(16).toUpperCase()}`,
      };

      if (position === 0 || !head) {
        // Insert at head
        newNode.next = head;
        setNodes((prev) => [newNode, ...prev]);
        setHead(newNodeId);
      } else {
        // Insert at position
        const newNodes = [...nodes];
        let current = newNodes.find((n) => n.id === head);
        let prevNode: LinkedListNode | null = null;

        // Traverse to position
        for (let i = 0; i < position - 1 && current; i++) {
          prevNode = current;
          const nextId = current?.next;
          current = nextId ? newNodes.find((n) => n.id === nextId) : undefined;
        }

        if (prevNode) {
          newNode.next = prevNode.next;
          prevNode.next = newNodeId;
        }

        newNodes.push(newNode);
        setNodes(newNodes);
      }

      // Animation sequence
      setHighlightedNode(newNodeId);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setHighlightedNode(null);
      setIsAnimating(false);
    },
    [nodes, head, maxSize]
  );

  // Delete node at specific position
  const deleteNode = useCallback(
    async (position: number) => {
      if (nodes.length === 0) return;

      setIsAnimating(true);
      setAnimationStep(0);

      if (position === 0 && head) {
        // Delete head
        const headNode = nodes.find((n) => n.id === head);
        if (headNode) {
          setHighlightedNode(head);
          await new Promise((resolve) => setTimeout(resolve, 500));

          setHead(headNode.next || null);
          setNodes((prev) => prev.filter((n) => n.id !== head));
        }
      } else {
        // Delete at position
        const newNodes = [...nodes];
        let current = newNodes.find((n) => n.id === head);
        let prevNode: LinkedListNode | null = null;

        // Traverse to position
        for (let i = 0; i < position && current; i++) {
          prevNode = current;
          const nextId = current?.next;
          current = nextId ? newNodes.find((n) => n.id === nextId) : undefined;
        }

        if (current) {
          setHighlightedNode(current.id);
          await new Promise((resolve) => setTimeout(resolve, 500));

          if (prevNode) {
            prevNode.next = current.next;
          }
          setNodes((prev) => prev.filter((n) => n.id !== current!.id));
        }
      }

      setHighlightedNode(null);
      setIsAnimating(false);
    },
    [nodes, head]
  );

  // Search for a value
  const searchValue = useCallback(
    async (value: number) => {
      setIsAnimating(true);
      setAnimationStep(0);

      let current = nodes.find((n) => n.id === head);
      let position = 0;

      while (current) {
        setHighlightedNode(current.id);
        setAnimationStep(position);
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (current.value === value) {
          // Found the value
          await new Promise((resolve) => setTimeout(resolve, 800));
          break;
        }

        const nextId = current?.next;
        current = nextId ? nodes.find((n) => n.id === nextId) : undefined;
        position++;
      }

      setHighlightedNode(null);
      setIsAnimating(false);
      setAnimationStep(0);
    },
    [nodes, head]
  );

  // Reset the list
  const resetList = useCallback(() => {
    const resetNodes = initialData.map((value, index) => ({
      id: `node-${index}`,
      value,
      next: index < initialData.length - 1 ? `node-${index + 1}` : null,
      memoryAddress: `0x${(1000 + index * 8).toString(16).toUpperCase()}`,
    }));

    setNodes(resetNodes);
    setHead(resetNodes.length > 0 ? resetNodes[0].id : null);
    setHighlightedNode(null);
    setIsAnimating(false);
    setAnimationStep(0);
  }, [initialData]);

  // Handle operations
  const handleOperation = useCallback(
    async (operation: string) => {
      const value = parseInt(inputValue, 10);

      switch (operation) {
        case 'insert':
          if (!isNaN(value)) {
            await insertNode(value, selectedPosition);
            setInputValue('');
          }
          break;
        case 'delete':
          await deleteNode(selectedPosition);
          break;
        case 'search':
          if (!isNaN(value)) {
            await searchValue(value);
          }
          break;
        case 'reset':
          resetList();
          break;
      }
    },
    [inputValue, selectedPosition, insertNode, deleteNode, searchValue, resetList]
  );

  // Calculate node positions for rendering
  const getNodePositions = () => {
    const positions: { [key: string]: { x: number; y: number } } = {};
    let currentId = head;
    let x = 50;
    const y = 150;

    while (currentId) {
      positions[currentId] = { x, y };
      x += 120; // Space between nodes
      const currentNode = nodes.find((n) => n.id === currentId);
      currentId = currentNode?.next || null;
    }

    return positions;
  };

  const nodePositions = getNodePositions();

  return (
    <div className={`bg-white border border-blue-200 rounded-xl p-8 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Linked List Visualization</h3>
          <p className="text-gray-600 mt-1">
            Dynamic memory allocation with pointer-based connections
          </p>
        </div>
        <ComplexityIndicator
          operation="Linked List Operations"
          timeComplexity={getCurrentComplexity('search').time}
          spaceComplexity={getCurrentComplexity('search').space}
          explanation="Dynamic memory allocation with pointer traversal"
        />
      </div>

      {/* Control Panel */}
      {/* Custom Control Panel */}
      <div className="flex flex-wrap items-center gap-4 p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-gray-200 rounded-lg">
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

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Position:</label>
          <input
            type="number"
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(parseInt(e.target.value, 10) || 0)}
            min="0"
            max={nodes.length}
            className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isAnimating}
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleOperation('insert')}
            disabled={isAnimating || !inputValue}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition-colors"
          >
            Insert
          </button>
          <button
            onClick={() => handleOperation('delete')}
            disabled={isAnimating || nodes.length === 0}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => handleOperation('search')}
            disabled={isAnimating || !inputValue}
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded transition-colors"
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
      </div>

      {/* Linked List Visualization */}
      <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto">
        <svg
          viewBox="0 0 800 300"
          className="w-full h-64 min-w-[600px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Head pointer indicator */}
          {head && (
            <g>
              <text
                x="20"
                y="140"
                className="text-sm font-mono fill-blue-600 dark:fill-blue-400"
                textAnchor="middle"
              >
                HEAD
              </text>
              <line
                x1="20"
                y1="145"
                x2={nodePositions[head]?.x - 10 || 40}
                y2="175"
                className="stroke-blue-600 dark:stroke-blue-400 stroke-2"
                markerEnd="url(#arrowhead)"
              />
            </g>
          )}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" className="fill-gray-600 dark:fill-gray-400" />
            </marker>
          </defs>

          {/* Render nodes and connections */}
          {nodes.map((node) => {
            const position = nodePositions[node.id];
            if (!position) return null;

            const isHighlighted = highlightedNode === node.id;
            const nextNode = nodes.find((n) => n.id === node.next);
            const nextPosition = nextNode ? nodePositions[nextNode.id] : null;

            return (
              <g key={node.id}>
                {/* Node container */}
                <rect
                  x={position.x - 40}
                  y={position.y - 25}
                  width="80"
                  height="50"
                  rx="4"
                  className={`transition-all duration-300 ${
                    isHighlighted
                      ? 'fill-blue-100 dark:fill-blue-900 stroke-blue-500 stroke-2'
                      : 'fill-white dark:fill-gray-700 stroke-gray-300 dark:stroke-gray-600 stroke-1'
                  }`}
                  style={{
                    opacity: isAnimating ? 0.7 + animationStep * 0.1 : 1,
                  }}
                />

                {/* Data section */}
                <rect
                  x={position.x - 35}
                  y={position.y - 20}
                  width="40"
                  height="40"
                  className={`${
                    isHighlighted
                      ? 'fill-blue-50 dark:fill-blue-800'
                      : 'fill-gray-50 dark:fill-gray-600'
                  }`}
                />

                {/* Next pointer section */}
                <rect
                  x={position.x + 5}
                  y={position.y - 20}
                  width="30"
                  height="40"
                  className={`${
                    isHighlighted
                      ? 'fill-green-50 dark:fill-green-800'
                      : 'fill-gray-100 dark:fill-gray-600'
                  }`}
                />

                {/* Data value */}
                <text
                  x={position.x - 15}
                  y={position.y + 5}
                  textAnchor="middle"
                  className={`text-sm font-bold ${
                    isHighlighted
                      ? 'fill-blue-700 dark:fill-blue-300'
                      : 'fill-gray-700 dark:fill-gray-300'
                  }`}
                >
                  {node.value}
                </text>

                {/* Next pointer */}
                {node.next ? (
                  <text
                    x={position.x + 20}
                    y={position.y + 5}
                    textAnchor="middle"
                    className="text-xs fill-green-600 dark:fill-green-400 font-mono"
                  >
                    →
                  </text>
                ) : (
                  <text
                    x={position.x + 20}
                    y={position.y + 5}
                    textAnchor="middle"
                    className="text-xs fill-red-600 dark:fill-red-400 font-mono"
                  >
                    ∅
                  </text>
                )}

                {/* Connection to next node */}
                {nextPosition && (
                  <line
                    x1={position.x + 40}
                    y1={position.y}
                    x2={nextPosition.x - 40}
                    y2={nextPosition.y}
                    className="stroke-gray-600 dark:stroke-gray-400 stroke-2"
                    markerEnd="url(#arrowhead)"
                  />
                )}

                {/* Memory address (if enabled) */}
                {showMemoryAddresses && (
                  <text
                    x={position.x}
                    y={position.y + 40}
                    textAnchor="middle"
                    className="text-xs font-mono fill-gray-500 dark:fill-gray-400"
                  >
                    {node.memoryAddress}
                  </text>
                )}

                {/* Node label */}
                <text
                  x={position.x}
                  y={position.y - 35}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  Node {nodes.findIndex((n) => n.id === node.id)}
                </text>
              </g>
            );
          })}

          {/* Empty list indicator */}
          {nodes.length === 0 && (
            <text
              x="400"
              y="150"
              textAnchor="middle"
              className="text-lg fill-gray-400 dark:fill-gray-500"
            >
              Empty List
            </text>
          )}
        </svg>
      </div>

      {/* Operation Info */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Linked List Operations:
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-blue-800 dark:text-blue-200">Insert:</strong>
            <span className="text-blue-700 dark:text-blue-300 ml-2">
              Add new node at specified position
            </span>
          </div>
          <div>
            <strong className="text-blue-800 dark:text-blue-200">Delete:</strong>
            <span className="text-blue-700 dark:text-blue-300 ml-2">
              Remove node and update pointers
            </span>
          </div>
          <div>
            <strong className="text-blue-800 dark:text-blue-200">Search:</strong>
            <span className="text-blue-700 dark:text-blue-300 ml-2">
              Traverse list to find value
            </span>
          </div>
          <div>
            <strong className="text-blue-800 dark:text-blue-200">Memory:</strong>
            <span className="text-blue-700 dark:text-blue-300 ml-2">
              Dynamic allocation, non-contiguous
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedListVisualization;
