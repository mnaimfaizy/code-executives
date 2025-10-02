import React, { useState, useCallback, useMemo } from 'react';
import type {
  LinkedListVisualizationProps,
  LinkedListNode,
} from '../../../../../../types/datastructures';

import { ComplexityIndicator } from '../shared/ComplexityIndicator';
import { Play, Pause, RotateCcw, Plus, Minus, Search, Zap, ArrowLeft, Target } from 'lucide-react';

// Extended node type for doubly linked lists
interface DoublyLinkedListNode extends LinkedListNode {
  prev?: string | null;
}

// List type enum
type ListType = 'singly' | 'doubly';

/**
 * Enhanced LinkedListVisualization Component
 *
 * Interactive visualization supporting both singly and doubly linked lists with:
 * - Proper Head and Tail indicators
 * - Bidirectional traversal for doubly linked lists
 * - Smooth animations and visual feedback
 * - Comprehensive operations (insert, delete, search, reverse, etc.)
 * - Memory address visualization
 * - Responsive layout with controls on the right
 */
export const LinkedListVisualization: React.FC<LinkedListVisualizationProps> = ({
  initialData = [10, 20, 30],
  maxSize = 8,
  showMemoryAddresses = true,
  className = '',
  debugState,
}) => {
  // List type state
  const [listType, setListType] = useState<ListType>('singly');

  // State for linked list nodes
  const [nodes, setNodes] = useState<DoublyLinkedListNode[]>(() =>
    initialData.map((value, index) => ({
      id: `node-${index}`,
      value,
      next: index < initialData.length - 1 ? `node-${index + 1}` : null,
      prev: index > 0 ? `node-${index - 1}` : null,
      memoryAddress: `0x${(1000 + index * 12).toString(16).toUpperCase()}`,
    }))
  );

  const [head, setHead] = useState<string | null>(nodes.length > 0 ? nodes[0].id : null);
  const [tail, setTail] = useState<string | null>(
    nodes.length > 0 ? nodes[nodes.length - 1].id : null
  );
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [animatingNodes, setAnimatingNodes] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<number>(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // State for drag functionality
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [customNodePositions, setCustomNodePositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});
  const [headPosition, setHeadPosition] = useState<{ x: number; y: number }>({ x: 40, y: 180 });
  const [tailPosition, setTailPosition] = useState<{ x: number; y: number }>({ x: 960, y: 180 });

  // Animation controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Initialize node positions
  React.useEffect(() => {
    const positions: { [key: string]: { x: number; y: number } } = {};
    let currentId = head;
    let x = 150; // Start after Head indicator
    const y = 180;

    while (currentId) {
      positions[currentId] = { x, y };
      x += 140; // Space between nodes
      const currentNode = nodes.find((n) => n.id === currentId);
      currentId = currentNode?.next || null;
    }

    setCustomNodePositions(positions);
  }, [nodes, head]);

  // Use debug state if debugging is active
  const currentNodes = useMemo(() => {
    if (debugState?.isDebugging && debugState.dataStructureState.linkedList) {
      const debugList = debugState.dataStructureState.linkedList as DoublyLinkedListNode[];
      if (Array.isArray(debugList)) {
        return debugList.map((node, index) => ({
          ...node,
          id: `debug-node-${index}`,
          highlighted: debugState.currentOperation?.indices?.includes(index) || false,
        }));
      }
    }
    return nodes;
  }, [debugState, nodes]);

  // Update visualization when debug state changes
  React.useEffect(() => {
    if (debugState?.isDebugging && debugState.dataStructureState.linkedList) {
      const debugList = debugState.dataStructureState.linkedList as DoublyLinkedListNode[];
      if (Array.isArray(debugList)) {
        const debugNodes = debugList.map((node, index) => ({
          ...node,
          id: `debug-node-${index}`,
          highlighted: debugState.currentOperation?.indices?.includes(index) || false,
        }));
        setNodes(debugNodes);
        setHead(debugNodes.length > 0 ? debugNodes[0].id : null);
        setTail(debugNodes.length > 0 ? debugNodes[debugNodes.length - 1].id : null);
      }
    }
  }, [debugState]);

  // Get current operation complexity
  const getCurrentComplexity = useCallback(
    (operation: string): { time: string; space: string } => {
      switch (operation) {
        case 'insert':
        case 'delete':
        case 'search':
          return { time: 'O(n)', space: 'O(1)' };
        case 'prepend':
        case 'append':
          return listType === 'doubly'
            ? { time: 'O(1)', space: 'O(1)' }
            : { time: 'O(1)/O(n)', space: 'O(1)' };
        case 'reverse':
          return { time: 'O(n)', space: 'O(1)' };
        case 'findMiddle':
          return { time: 'O(n)', space: 'O(1)' };
        default:
          return { time: 'O(1)', space: 'O(1)' };
      }
    },
    [listType]
  );

  // Animation helper functions
  const animateNode = useCallback(
    async (nodeId: string, duration: number = 500) => {
      setAnimatingNodes((prev) => new Set(prev).add(nodeId));
      await new Promise((resolve) => setTimeout(resolve, duration / animationSpeed));
      setAnimatingNodes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });
    },
    [animationSpeed]
  );

  const highlightNode = useCallback(
    async (nodeId: string, duration: number = 800) => {
      setHighlightedNodes((prev) => new Set(prev).add(nodeId));
      await new Promise((resolve) => setTimeout(resolve, duration / animationSpeed));
      setHighlightedNodes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });
    },
    [animationSpeed]
  );

  // Insert node at specific position
  const insertNode = useCallback(
    async (value: number, position: number) => {
      if (nodes.length >= maxSize) {
        alert(`Maximum size of ${maxSize} reached!`);
        return;
      }

      setIsAnimating(true);
      setCurrentOperation(`Inserting ${value} at position ${position}`);

      const newNodeId = `node-${Date.now()}`;
      const newNode: DoublyLinkedListNode = {
        id: newNodeId,
        value,
        next: null,
        prev: null,
        memoryAddress: `0x${(1000 + nodes.length * 12).toString(16).toUpperCase()}`,
      };

      const newNodes = [...nodes];

      if (position === 0 || !head) {
        // Insert at head
        newNode.next = head;
        if (head && listType === 'doubly') {
          const headNode = newNodes.find((n) => n.id === head);
          if (headNode) headNode.prev = newNodeId;
        }
        newNodes.unshift(newNode);
        setHead(newNodeId);
        if (newNodes.length === 1) setTail(newNodeId);
      } else if (position >= nodes.length) {
        // Insert at tail
        newNode.prev = tail;
        if (tail && listType === 'doubly') {
          const tailNode = newNodes.find((n) => n.id === tail);
          if (tailNode) tailNode.next = newNodeId;
        }
        newNodes.push(newNode);
        setTail(newNodeId);
      } else {
        // Insert at position
        let current = newNodes.find((n) => n.id === head);
        let currentIndex = 0;

        while (current && currentIndex < position - 1) {
          await highlightNode(current.id, 300);
          const nextId = current.next;
          current = nextId ? newNodes.find((n) => n.id === nextId) : undefined;
          currentIndex++;
        }

        if (current) {
          await highlightNode(current.id, 400);
          newNode.next = current.next;
          newNode.prev = current.id;

          if (current.next && listType === 'doubly') {
            const nextNode = newNodes.find((n) => n.id === current.next);
            if (nextNode) nextNode.prev = newNodeId;
          }

          current.next = newNodeId;
          newNodes.splice(currentIndex + 1, 0, newNode);
        }
      }

      setNodes(newNodes);
      await animateNode(newNodeId, 800);
      setCurrentOperation('');
      setIsAnimating(false);
    },
    [nodes, head, tail, maxSize, listType, highlightNode, animateNode]
  );

  // Delete node at specific position
  const deleteNode = useCallback(
    async (position: number) => {
      if (nodes.length === 0) return;

      setIsAnimating(true);
      setCurrentOperation(`Deleting node at position ${position}`);

      const newNodes = [...nodes];

      if (position === 0 && head) {
        // Delete head
        const headNode = newNodes.find((n) => n.id === head);
        if (headNode) {
          await highlightNode(head, 600);
          const newHead = headNode.next;
          setHead(newHead);

          if (newHead && listType === 'doubly') {
            const newHeadNode = newNodes.find((n) => n.id === newHead);
            if (newHeadNode) newHeadNode.prev = null;
          }

          if (nodes.length === 1) setTail(null);
          setNodes((prev) => prev.filter((n) => n.id !== head));
        }
      } else if (position === nodes.length - 1 && tail) {
        // Delete tail
        const tailNode = newNodes.find((n) => n.id === tail);
        if (tailNode) {
          await highlightNode(tail, 600);
          const newTail = tailNode.prev;
          setTail(newTail || null);

          if (newTail && listType === 'doubly') {
            const newTailNode = newNodes.find((n) => n.id === newTail);
            if (newTailNode) newTailNode.next = null;
          }

          setNodes((prev) => prev.filter((n) => n.id !== tail));
        }
      } else {
        // Delete at position
        let current = newNodes.find((n) => n.id === head);
        let currentIndex = 0;

        while (current && currentIndex < position) {
          await highlightNode(current.id, 300);
          const nextId = current.next;
          current = nextId ? newNodes.find((n) => n.id === nextId) : undefined;
          currentIndex++;
        }

        if (current) {
          await highlightNode(current.id, 600);

          const prevId = current.prev;
          const nextId = current.next;

          if (prevId && listType === 'doubly') {
            const prevNode = newNodes.find((n) => n.id === prevId);
            if (prevNode) prevNode.next = nextId;
          }

          if (nextId && listType === 'doubly') {
            const nextNode = newNodes.find((n) => n.id === nextId);
            if (nextNode) nextNode.prev = prevId;
          }

          setNodes((prev) => prev.filter((n) => n.id !== current.id));
        }
      }

      setCurrentOperation('');
      setIsAnimating(false);
    },
    [nodes, head, tail, listType, highlightNode]
  );

  // Search for a value
  const searchValue = useCallback(
    async (value: number) => {
      setIsAnimating(true);
      setCurrentOperation(`Searching for value ${value}`);

      let current = nodes.find((n) => n.id === head);
      let position = 0;
      let found = false;

      while (current) {
        await highlightNode(current.id, 600);

        if (current.value === value) {
          await animateNode(current.id, 1000);
          found = true;
          break;
        }

        const nextId = current.next;
        current = nextId ? nodes.find((n) => n.id === nextId) : undefined;
        position++;
      }

      setCurrentOperation(found ? `Found ${value} at position ${position}` : `${value} not found`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCurrentOperation('');
      setIsAnimating(false);
    },
    [nodes, head, highlightNode, animateNode]
  );

  // Reverse the list
  const reverseList = useCallback(async () => {
    if (nodes.length <= 1) return;

    setIsAnimating(true);
    setCurrentOperation('Reversing the linked list');

    const newNodes = [...nodes].reverse();

    // Update pointers
    newNodes.forEach((node, index) => {
      node.next = index < newNodes.length - 1 ? newNodes[index + 1].id : null;
      node.prev = index > 0 ? newNodes[index - 1].id : null;
    });

    // Animate the reversal
    for (let i = 0; i < newNodes.length; i++) {
      await highlightNode(newNodes[i].id, 400);
    }

    setNodes(newNodes);
    setHead(newNodes[0].id);
    setTail(newNodes[newNodes.length - 1].id);

    setCurrentOperation('List reversed successfully');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCurrentOperation('');
    setIsAnimating(false);
  }, [nodes, highlightNode]);

  // Find middle element
  const findMiddle = useCallback(async () => {
    if (nodes.length === 0) return;

    setIsAnimating(true);
    setCurrentOperation('Finding middle element');

    let slow = nodes.find((n) => n.id === head);
    let fast = nodes.find((n) => n.id === head);

    while (fast && fast.next && slow) {
      await highlightNode(slow.id, 400);
      await highlightNode(fast.id, 300);

      if (fast && fast.next) {
        const fastNext = nodes.find((n) => n.id === fast!.next);
        if (fastNext && fast) {
          fast = nodes.find((n) => n.id === fastNext.next) || fastNext;
          if (slow && slow.next) {
            const slowNext = nodes.find((n) => n.id === slow!.next);
            if (slowNext && slow) slow = slowNext;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    }

    if (slow) {
      await animateNode(slow.id, 1000);
      setCurrentOperation(`Middle element: ${slow.value}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCurrentOperation('');
    setIsAnimating(false);
  }, [nodes, head, highlightNode, animateNode]);

  // Reset the list
  const resetList = useCallback(() => {
    const resetNodes = initialData.map((value, index) => ({
      id: `node-${index}`,
      value,
      next: index < initialData.length - 1 ? `node-${index + 1}` : null,
      prev: listType === 'doubly' && index > 0 ? `node-${index - 1}` : null,
      memoryAddress: `0x${(1000 + index * 12).toString(16).toUpperCase()}`,
    }));

    setNodes(resetNodes);
    setHead(resetNodes.length > 0 ? resetNodes[0].id : null);
    setTail(resetNodes.length > 0 ? resetNodes[resetNodes.length - 1].id : null);
    setHighlightedNodes(new Set());
    setAnimatingNodes(new Set());
    setIsAnimating(false);
    setCurrentOperation('');
    setSelectedNode(null);
  }, [initialData, listType]);

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
        case 'reverse':
          await reverseList();
          break;
        case 'findMiddle':
          await findMiddle();
          break;
        case 'reset':
          resetList();
          break;
      }
    },
    [
      inputValue,
      selectedPosition,
      insertNode,
      deleteNode,
      searchValue,
      reverseList,
      findMiddle,
      resetList,
    ]
  );

  // Calculate node positions for rendering (combines auto and custom positions)
  const getNodePositions = useCallback(() => {
    const positions: { [key: string]: { x: number; y: number } } = {};
    let currentId = head;
    let x = 150; // Start after Head indicator
    const y = 180;

    // Head position
    positions['head'] = headPosition || { x: 40, y: 180 };

    // Tail position
    positions['tail'] = tailPosition || { x: 1100, y: 180 };

    while (currentId) {
      // Use custom position if available, otherwise use auto position
      positions[currentId] = customNodePositions[currentId] || { x, y };
      x += 140; // Space between nodes for auto positioning
      const currentNode = nodes.find((n) => n.id === currentId);
      currentId = currentNode?.next || null;
    }

    return positions;
  }, [head, nodes, customNodePositions, headPosition, tailPosition]);

  // Drag functionality
  const handleMouseDown = useCallback(
    (itemId: string, event: React.MouseEvent) => {
      if (isAnimating) return;

      const svgRect = (event.currentTarget as SVGElement).closest('svg')!.getBoundingClientRect();
      const scaleX = 1200 / svgRect.width; // viewBox width / actual width
      const scaleY = 400 / svgRect.height; // viewBox height / actual height

      const mouseX = (event.clientX - svgRect.left) * scaleX;
      const mouseY = (event.clientY - svgRect.top) * scaleY;

      let currentPos: { x: number; y: number } | undefined;

      if (itemId === 'head') {
        currentPos = headPosition;
      } else if (itemId === 'tail') {
        currentPos = tailPosition;
      } else {
        currentPos = customNodePositions[itemId] || getNodePositions()[itemId];
      }

      if (currentPos) {
        setDraggedNode(itemId);
        setDragOffset({
          x: mouseX - currentPos.x,
          y: mouseY - currentPos.y,
        });
      }
    },
    [isAnimating, customNodePositions, getNodePositions, headPosition, tailPosition]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!draggedNode || !dragOffset) return;

      const svgRect = (event.currentTarget as SVGElement).getBoundingClientRect();
      const scaleX = 1200 / svgRect.width;
      const scaleY = 400 / svgRect.height;

      const mouseX = (event.clientX - svgRect.left) * scaleX;
      const mouseY = (event.clientY - svgRect.top) * scaleY;

      const newX = mouseX - dragOffset.x;
      const newY = mouseY - dragOffset.y;

      // Constrain to reasonable bounds
      const constrainedX = Math.max(20, Math.min(1180, newX));
      const constrainedY = Math.max(20, Math.min(380, newY));

      if (draggedNode === 'head') {
        setHeadPosition({ x: constrainedX, y: constrainedY });
      } else if (draggedNode === 'tail') {
        setTailPosition({ x: constrainedX, y: constrainedY });
      } else {
        setCustomNodePositions((prev) => ({
          ...prev,
          [draggedNode]: { x: constrainedX, y: constrainedY },
        }));
      }
    },
    [draggedNode, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setDragOffset(null);
  }, []);

  const nodePositions = getNodePositions();

  return (
    <div className={`bg-white border border-blue-200 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Linked List Visualization</h3>
            <p className="text-gray-600 mt-1">
              {listType === 'singly'
                ? 'Dynamic memory allocation with unidirectional pointers'
                : 'Bidirectional traversal with prev and next pointers'}
            </p>
          </div>
          <ComplexityIndicator
            operation={currentOperation || 'Linked List Operations'}
            timeComplexity={getCurrentComplexity('search').time}
            spaceComplexity={getCurrentComplexity('search').space}
            explanation={
              listType === 'singly'
                ? 'Dynamic memory allocation with pointer traversal'
                : 'Bidirectional pointers enable efficient operations'
            }
          />
        </div>

        {/* List Type Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">List Type:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setListType('singly');
                  resetList();
                }}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  listType === 'singly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Singly Linked
              </button>
              <button
                onClick={() => {
                  setListType('doubly');
                  resetList();
                }}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  listType === 'doubly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Doubly Linked
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Size: <span className="font-bold">{currentNodes.length}</span> / {maxSize}
          </div>
        </div>
      </div>

      {/* Main Content: Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-6">
        {/* Left Side: Linked List Visualization */}
        <div className="xl:col-span-3">
          <div
            className={`border border-gray-200 rounded-lg p-6 ${
              listType === 'singly'
                ? 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
                : 'bg-gradient-to-br from-purple-50 via-white to-violet-50'
            }`}
          >
            {/* List Type Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      listType === 'singly'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}
                  >
                    {listType === 'singly' ? '🔗 Singly Linked List' : '🔄 Doubly Linked List'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentNodes.length} nodes •{' '}
                    {listType === 'doubly' ? 'Bidirectional' : 'Unidirectional'}
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Visualization */}
            <div className="overflow-x-auto">
              <svg
                viewBox="0 0 1200 400"
                className="w-full h-80 min-w-[1000px]"
                preserveAspectRatio="xMidYMid meet"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Memory Layout Background */}
                <defs>
                  <pattern id="memoryGrid" width="100" height="25" patternUnits="userSpaceOnUse">
                    <rect width="100" height="25" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
                  </pattern>
                  <marker
                    id="arrowhead"
                    markerWidth="12"
                    markerHeight="8"
                    refX="11"
                    refY="4"
                    orient="auto"
                  >
                    <polygon points="0 0, 12 4, 0 8" className="fill-gray-600" />
                  </marker>
                  <marker
                    id="arrowhead-reverse"
                    markerWidth="12"
                    markerHeight="8"
                    refX="1"
                    refY="4"
                    orient="auto"
                  >
                    <polygon points="12 0, 0 4, 12 8" className="fill-gray-600" />
                  </marker>
                </defs>

                <rect width="1200" height="400" fill="url(#memoryGrid)" opacity="0.3" />

                {/* Head pointer indicator */}
                {head && (
                  <g>
                    <circle
                      cx={nodePositions['head']?.x || 40}
                      cy={nodePositions['head']?.y || 180}
                      r="20"
                      className="fill-blue-100 stroke-blue-500 stroke-2 cursor-pointer"
                      onMouseDown={(e) => handleMouseDown('head', e)}
                    />
                    <text
                      x={nodePositions['head']?.x || 40}
                      y={(nodePositions['head']?.y || 180) - 5}
                      className="text-xs font-bold fill-blue-700"
                      textAnchor="middle"
                    >
                      HEAD
                    </text>
                    <text
                      x={nodePositions['head']?.x || 40}
                      y={(nodePositions['head']?.y || 180) + 8}
                      className="text-xs fill-blue-600"
                      textAnchor="middle"
                    >
                      →
                    </text>
                    <line
                      x1={(nodePositions['head']?.x || 40) + 20}
                      y1={nodePositions['head']?.y || 180}
                      x2={nodePositions[head]?.x - 50 || 100}
                      y2={nodePositions[head]?.y || 180}
                      className="stroke-blue-600 stroke-2"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                )}

                {/* Tail pointer indicator */}
                {tail && (
                  <g>
                    <circle
                      cx={nodePositions['tail']?.x || 1100}
                      cy={nodePositions['tail']?.y || 180}
                      r="20"
                      className="fill-red-100 stroke-red-500 stroke-2 cursor-pointer"
                      onMouseDown={(e) => handleMouseDown('tail', e)}
                    />
                    <text
                      x={nodePositions['tail']?.x || 1100}
                      y={(nodePositions['tail']?.y || 180) - 5}
                      className="text-xs font-bold fill-red-700"
                      textAnchor="middle"
                    >
                      TAIL
                    </text>
                    <text
                      x={nodePositions['tail']?.x || 1100}
                      y={(nodePositions['tail']?.y || 180) + 8}
                      className="text-xs fill-red-600"
                      textAnchor="middle"
                    >
                      ←
                    </text>
                    <line
                      x1={(nodePositions['tail']?.x || 1100) - 20}
                      y1={nodePositions['tail']?.y || 180}
                      x2={nodePositions[tail]?.x + 50 || 900}
                      y2={nodePositions[tail]?.y || 180}
                      className="stroke-red-600 stroke-2"
                      markerEnd="url(#arrowhead-reverse)"
                    />
                  </g>
                )}

                {/* Render nodes and connections */}
                {currentNodes.map((node, index) => {
                  const position = nodePositions[node.id];
                  if (!position) return null;

                  const isHighlighted = highlightedNodes.has(node.id);
                  const isAnimating = animatingNodes.has(node.id);
                  const isSelected = selectedNode === node.id;
                  const nextNode = node.next ? currentNodes.find((n) => n.id === node.next) : null;
                  const prevNode = node.prev ? currentNodes.find((n) => n.id === node.prev) : null;
                  const nextPosition = nextNode ? nodePositions[nextNode.id] : null;
                  const prevPosition = prevNode ? nodePositions[prevNode.id] : null;

                  return (
                    <g key={node.id}>
                      {/* Node container */}
                      <rect
                        x={position.x - 50}
                        y={position.y - 35}
                        width="100"
                        height="70"
                        rx="8"
                        className={`transition-all duration-300 cursor-pointer ${draggedNode === node.id ? 'cursor-grabbing' : 'cursor-grab'} ${
                          isSelected
                            ? 'fill-blue-200 stroke-blue-600 stroke-3'
                            : isHighlighted
                              ? 'fill-yellow-100 stroke-yellow-500 stroke-2'
                              : 'fill-white stroke-gray-300 stroke-1'
                        } ${isAnimating ? 'animate-pulse' : ''}`}
                        onClick={() => setSelectedNode(isSelected ? null : node.id)}
                        onMouseDown={(e) => handleMouseDown(node.id, e)}
                      />

                      {/* Data section */}
                      <rect
                        x={position.x - 45}
                        y={position.y - 30}
                        width="45"
                        height="60"
                        rx="4"
                        className={isHighlighted ? 'fill-yellow-50' : 'fill-gray-50'}
                      />

                      {/* Pointers section */}
                      <rect
                        x={position.x}
                        y={position.y - 30}
                        width="45"
                        height="60"
                        rx="4"
                        className={isHighlighted ? 'fill-green-50' : 'fill-gray-100'}
                      />

                      {/* Data value */}
                      <text
                        x={position.x - 22.5}
                        y={position.y + 5}
                        textAnchor="middle"
                        className={`text-lg font-bold ${
                          isHighlighted ? 'fill-yellow-800' : 'fill-gray-900'
                        }`}
                      >
                        {node.value}
                      </text>

                      {/* Next pointer */}
                      <text
                        x={position.x + 22.5}
                        y={position.y - 5}
                        textAnchor="middle"
                        className="text-sm fill-green-600 font-mono"
                      >
                        →
                      </text>

                      {/* Prev pointer (doubly linked) */}
                      {listType === 'doubly' && (
                        <text
                          x={position.x + 22.5}
                          y={position.y + 15}
                          textAnchor="middle"
                          className="text-sm fill-blue-600 font-mono"
                        >
                          ←
                        </text>
                      )}

                      {/* Null indicators */}
                      {!node.next && (
                        <text
                          x={position.x + 22.5}
                          y={position.y + 5}
                          textAnchor="middle"
                          className="text-sm fill-red-500 font-mono"
                        >
                          ∅
                        </text>
                      )}

                      {listType === 'doubly' && !node.prev && index > 0 && (
                        <text
                          x={position.x + 22.5}
                          y={position.y + 15}
                          textAnchor="middle"
                          className="text-sm fill-red-500 font-mono"
                        >
                          ∅
                        </text>
                      )}

                      {/* Connection to next node */}
                      {nextPosition && (
                        <line
                          x1={position.x + 50}
                          y1={position.y}
                          x2={nextPosition.x - 50}
                          y2={nextPosition.y}
                          className="stroke-green-600 stroke-2"
                          markerEnd="url(#arrowhead)"
                        />
                      )}

                      {/* Connection to prev node (doubly linked) */}
                      {listType === 'doubly' && prevPosition && (
                        <line
                          x1={position.x - 50}
                          y1={position.y}
                          x2={prevPosition.x + 50}
                          y2={prevPosition.y}
                          className="stroke-blue-600 stroke-2"
                          markerEnd="url(#arrowhead-reverse)"
                        />
                      )}

                      {/* Memory address (if enabled) */}
                      {showMemoryAddresses && (
                        <text
                          x={position.x}
                          y={position.y + 45}
                          textAnchor="middle"
                          className="text-xs font-mono fill-gray-500"
                        >
                          {node.memoryAddress}
                        </text>
                      )}

                      {/* Node index */}
                      <text
                        x={position.x}
                        y={position.y - 45}
                        textAnchor="middle"
                        className="text-xs fill-gray-600 font-medium"
                      >
                        [{index}]
                      </text>
                    </g>
                  );
                })}

                {/* Empty list indicator */}
                {currentNodes.length === 0 && (
                  <g>
                    <text x="500" y="180" textAnchor="middle" className="text-xl fill-gray-400">
                      Empty List
                    </text>
                    <text x="500" y="200" textAnchor="middle" className="text-sm fill-gray-500">
                      Head: null, Tail: null
                    </text>
                  </g>
                )}

                {/* Current operation status */}
                {currentOperation && (
                  <text
                    x="500"
                    y="350"
                    textAnchor="middle"
                    className="text-sm fill-blue-600 font-medium"
                  >
                    {currentOperation}
                  </text>
                )}
              </svg>
            </div>

            {/* Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 text-blue-900 text-sm font-medium">
                <span>
                  Type: <span className="font-bold capitalize">{listType}</span>
                </span>
                <span>
                  Size: <span className="font-bold">{currentNodes.length}</span>
                </span>
                <span>
                  Head: <span className="font-bold">{head ? 'Set' : 'Null'}</span>
                </span>
                <span>
                  Tail: <span className="font-bold">{tail ? 'Set' : 'Null'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Controls */}
        <div className="xl:col-span-1 space-y-6">
          {/* Animation Controls */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <Play className="w-4 h-4 mr-2" />
              Animation Controls
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={resetList}
                  className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">Speed:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 min-w-[2rem]">{animationSpeed}x</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operation Controls */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              List Operations
            </h4>

            {/* Insert Operation */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleOperation('insert');
              }}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <label className="block font-medium text-gray-800 text-sm">Insert Element</label>
              <div className="space-y-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Value"
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isAnimating}
                />
                <input
                  type="number"
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(parseInt(e.target.value) || 0)}
                  placeholder="Position"
                  min="0"
                  max={currentNodes.length}
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isAnimating}
                />
              </div>
              <button
                type="submit"
                disabled={isAnimating || !inputValue || currentNodes.length >= maxSize}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Plus className="w-4 h-4" />
                <span>Insert</span>
              </button>
            </form>

            {/* Delete Operation */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <label className="block font-medium text-gray-800 text-sm">Delete Element</label>
              <input
                type="number"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(parseInt(e.target.value) || 0)}
                placeholder="Position"
                min="0"
                max={currentNodes.length - 1}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isAnimating}
              />
              <button
                onClick={() => handleOperation('delete')}
                disabled={isAnimating || currentNodes.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Minus className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>

            {/* Search Operation */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleOperation('search');
              }}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <label className="block font-medium text-gray-800 text-sm">Search Element</label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Value"
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isAnimating}
              />
              <button
                type="submit"
                disabled={isAnimating || !inputValue || currentNodes.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </form>

            {/* Advanced Operations */}
            <div className="space-y-3">
              <button
                onClick={() => handleOperation('reverse')}
                disabled={isAnimating || currentNodes.length <= 1}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Reverse List</span>
              </button>

              <button
                onClick={() => handleOperation('findMiddle')}
                disabled={isAnimating || currentNodes.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Target className="w-4 h-4" />
                <span>Find Middle</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedListVisualization;
