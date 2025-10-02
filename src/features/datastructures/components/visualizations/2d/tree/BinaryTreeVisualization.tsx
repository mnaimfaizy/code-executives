import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, RotateCcw, Eye, SkipForward } from 'lucide-react';
import type { TreeNode, BaseVisualizationProps } from '../../../../../../types/datastructures';

interface BinaryTreeVisualizationProps extends BaseVisualizationProps {
  initialData?: number[];
  maxNodes?: number;
  showTraversal?: boolean;
  traversalType?: 'inorder' | 'preorder' | 'postorder' | 'levelorder';
}

interface TreePosition {
  x: number;
  y: number;
}

const BinaryTreeVisualization: React.FC<BinaryTreeVisualizationProps> = ({
  maxNodes = 15,
  showTraversal = true,
  traversalType = 'inorder',
  className = '',
  onOperationComplete,
}) => {
  const [nodes, setNodes] = useState<Map<string, TreeNode>>(new Map());
  const [rootId, setRootId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, TreePosition>>(new Map());
  const [inputValue, setInputValue] = useState('');
  const [deleteValue, setDeleteValue] = useState('');
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [traversalOrder, setTraversalOrder] = useState<string[]>([]);
  const [isTraversing, setIsTraversing] = useState(false);
  const [traversalStep, setTraversalStep] = useState(0);
  const [currentTraversalType, setCurrentTraversalType] = useState<
    'inorder' | 'preorder' | 'postorder' | 'levelorder'
  >(traversalType);

  // Constants for layout
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 500;
  const NODE_RADIUS = 20;
  const LEVEL_HEIGHT = 60;

  // Calculate positions for all nodes using level-order layout
  const calculatePositions = useCallback(
    (rootNodeId: string | null) => {
      if (!rootNodeId || !nodes.has(rootNodeId)) return new Map();

      const positions = new Map<string, TreePosition>();
      const queue: Array<{ nodeId: string; x: number; y: number; width: number }> = [];

      // Start with root at center top
      queue.push({ nodeId: rootNodeId, x: SVG_WIDTH / 2, y: 50, width: SVG_WIDTH });

      while (queue.length > 0) {
        const { nodeId, x, y, width } = queue.shift()!;
        const node = nodes.get(nodeId);
        if (!node) continue;

        positions.set(nodeId, { x, y });

        // Add children to queue
        const childWidth = width / 2;
        const nextY = y + LEVEL_HEIGHT;

        if (node.left) {
          queue.push({
            nodeId: node.left,
            x: x - childWidth / 2,
            y: nextY,
            width: childWidth,
          });
        }

        if (node.right) {
          queue.push({
            nodeId: node.right,
            x: x + childWidth / 2,
            y: nextY,
            width: childWidth,
          });
        }
      }

      return positions;
    },
    [nodes, SVG_WIDTH, LEVEL_HEIGHT]
  );

  // Update positions when nodes change
  useEffect(() => {
    const newPositions = calculatePositions(rootId);
    setNodePositions(newPositions);
  }, [nodes, rootId, calculatePositions]);

  // Insert a new node
  const handleInsert = useCallback(
    (value?: string) => {
      const insertValue = value || inputValue;
      if (!insertValue.trim()) return;

      const numValue = parseInt(insertValue);
      if (isNaN(numValue)) return;

      const newNodeId = `node-${numValue}-${Date.now()}`;
      const newNode: TreeNode = {
        id: newNodeId,
        value: numValue,
        level: 0,
        isRoot: rootId === null,
      };

      if (rootId === null) {
        // First node becomes root
        newNode.level = 0;
        newNode.isRoot = true;
        setNodes(new Map([[newNodeId, newNode]]));
        setRootId(newNodeId);
      } else {
        // Insert into existing tree (simple insertion, not BST rules)
        const newNodes = new Map(nodes);

        // Find a position to insert (level-order insertion)
        const queue = [rootId];
        let inserted = false;

        while (queue.length > 0 && !inserted) {
          const currentId = queue.shift()!;
          const currentNode = newNodes.get(currentId)!;

          if (!currentNode.left) {
            newNode.level = currentNode.level + 1;
            newNode.parent = currentId;
            currentNode.left = newNodeId;
            inserted = true;
          } else if (!currentNode.right) {
            newNode.level = currentNode.level + 1;
            newNode.parent = currentId;
            currentNode.right = newNodeId;
            inserted = true;
          } else {
            queue.push(currentNode.left);
            queue.push(currentNode.right);
          }
        }

        if (inserted) {
          newNodes.set(newNodeId, newNode);
          setNodes(newNodes);
        }
      }

      if (!value) setInputValue('');

      onOperationComplete?.({
        type: 'insert',
        target: numValue,
        description: `Inserted ${numValue} into binary tree`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      });
    },
    [inputValue, nodes, rootId, onOperationComplete]
  );

  // Delete a node
  const handleDelete = useCallback(() => {
    if (!deleteValue.trim()) return;

    const numValue = parseInt(deleteValue);
    if (isNaN(numValue)) return;

    // Find the node to delete
    const nodeToDelete = Array.from(nodes.values()).find((n) => n.value === numValue);
    if (!nodeToDelete) return;

    const newNodes = new Map(nodes);

    // Simple deletion - remove node and reconnect children
    if (nodeToDelete.parent) {
      const parent = newNodes.get(nodeToDelete.parent)!;
      if (parent.left === nodeToDelete.id) {
        parent.left = nodeToDelete.left || nodeToDelete.right || undefined;
      } else if (parent.right === nodeToDelete.id) {
        parent.right = nodeToDelete.left || nodeToDelete.right || undefined;
      }

      // Update parent reference for the moved child
      const movedChildId = nodeToDelete.left || nodeToDelete.right;
      if (movedChildId) {
        const movedChild = newNodes.get(movedChildId);
        if (movedChild) {
          movedChild.parent = nodeToDelete.parent;
        }
      }
    } else {
      // Deleting root
      const newRootId = nodeToDelete.left || nodeToDelete.right || null;
      if (newRootId) {
        const newRoot = newNodes.get(newRootId)!;
        newRoot.parent = undefined;
        newRoot.isRoot = true;
      }
      setRootId(newRootId);
    }

    newNodes.delete(nodeToDelete.id);
    setNodes(newNodes);
    setDeleteValue('');

    onOperationComplete?.({
      type: 'delete',
      target: numValue,
      description: `Deleted ${numValue} from binary tree`,
      complexity: { time: 'O(n)', space: 'O(1)' },
    });
  }, [deleteValue, nodes, onOperationComplete]);

  // Tree traversal algorithms
  const traverseTree = useCallback(
    (type: 'inorder' | 'preorder' | 'postorder' | 'levelorder') => {
      if (!rootId) return [];

      const result: string[] = [];

      if (type === 'levelorder') {
        const queue = [rootId];
        while (queue.length > 0) {
          const nodeId = queue.shift()!;
          const node = nodes.get(nodeId);
          if (node) {
            result.push(nodeId);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
          }
        }
      } else {
        const traverse = (nodeId: string) => {
          const node = nodes.get(nodeId);
          if (!node) return;

          if (type === 'preorder') result.push(nodeId);
          if (node.left) traverse(node.left);
          if (type === 'inorder') result.push(nodeId);
          if (node.right) traverse(node.right);
          if (type === 'postorder') result.push(nodeId);
        };

        traverse(rootId);
      }

      return result;
    },
    [rootId, nodes]
  );

  // Start traversal animation
  const startTraversal = useCallback(() => {
    if (isTraversing) return;

    const order = traverseTree(currentTraversalType);
    setTraversalOrder(order);
    setTraversalStep(0);
    setIsTraversing(true);
    setHighlightedNodes([]);

    // Animate traversal
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < order.length) {
        setHighlightedNodes(order.slice(0, currentStep + 1));
        setTraversalStep(currentStep + 1);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsTraversing(false);
        setTimeout(() => {
          setHighlightedNodes([]);
          setTraversalStep(0);
        }, 2000);
      }
    }, 800);

    onOperationComplete?.({
      type: 'traverse',
      description: `${currentTraversalType.charAt(0).toUpperCase() + currentTraversalType.slice(1)} traversal completed`,
      complexity: { time: 'O(n)', space: 'O(h)' },
    });
  }, [isTraversing, currentTraversalType, traverseTree, onOperationComplete]);

  // Reset tree
  const handleReset = useCallback(() => {
    setNodes(new Map());
    setRootId(null);
    setNodePositions(new Map());
    setInputValue('');
    setDeleteValue('');
    setHighlightedNodes([]);
    setTraversalOrder([]);
    setIsTraversing(false);
    setTraversalStep(0);
  }, []);

  // Render tree edges
  const renderEdges = () => {
    const edges: React.ReactElement[] = [];

    nodes.forEach((node) => {
      const nodePos = nodePositions.get(node.id);
      if (!nodePos) return;

      if (node.left) {
        const leftPos = nodePositions.get(node.left);
        if (leftPos) {
          edges.push(
            <line
              key={`edge-${node.id}-left`}
              x1={nodePos.x}
              y1={nodePos.y}
              x2={leftPos.x}
              y2={leftPos.y}
              stroke="#6b7280"
              strokeWidth={2}
              className="transition-all duration-300"
            />
          );
        }
      }

      if (node.right) {
        const rightPos = nodePositions.get(node.right);
        if (rightPos) {
          edges.push(
            <line
              key={`edge-${node.id}-right`}
              x1={nodePos.x}
              y1={nodePos.y}
              x2={rightPos.x}
              y2={rightPos.y}
              stroke="#6b7280"
              strokeWidth={2}
              className="transition-all duration-300"
            />
          );
        }
      }
    });

    return edges;
  };

  // Render tree nodes
  const renderNodes = () => {
    return Array.from(nodes.values()).map((node) => {
      const position = nodePositions.get(node.id);
      if (!position) return null;

      const isHighlighted = highlightedNodes.includes(node.id);
      const traversalIndex = highlightedNodes.indexOf(node.id);

      return (
        <g key={node.id} className="transition-all duration-300">
          <circle
            cx={position.x}
            cy={position.y}
            r={NODE_RADIUS}
            fill={isHighlighted ? '#3b82f6' : node.isRoot ? '#10b981' : '#f3f4f6'}
            stroke={isHighlighted ? '#1d4ed8' : node.isRoot ? '#059669' : '#9ca3af'}
            strokeWidth={isHighlighted ? 3 : 2}
            className="cursor-pointer hover:fill-blue-100 transition-colors"
          />
          <text
            x={position.x}
            y={position.y + 4}
            textAnchor="middle"
            className="text-sm font-medium fill-gray-700 pointer-events-none"
          >
            {node.value}
          </text>
          {isHighlighted && traversalIndex >= 0 && (
            <text
              x={position.x}
              y={position.y - NODE_RADIUS - 8}
              textAnchor="middle"
              className="text-xs font-bold fill-blue-600"
            >
              {traversalIndex + 1}
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <div className={`binary-tree-visualization ${className}`}>
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
          />
          <button
            onClick={() => handleInsert()}
            disabled={nodes.size >= maxNodes}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Insert</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Value to delete"
            value={deleteValue}
            onChange={(e) => setDeleteValue(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
            onKeyPress={(e) => e.key === 'Enter' && handleDelete()}
          />
          <button
            onClick={handleDelete}
            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </button>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">Reset</span>
        </button>
      </div>

      {/* Traversal Controls */}
      {showTraversal && nodes.size > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Traversal:
            </label>
            <select
              value={currentTraversalType}
              onChange={(e) =>
                setCurrentTraversalType(
                  e.target.value as 'inorder' | 'preorder' | 'postorder' | 'levelorder'
                )
              }
              className="px-2 py-1 border border-blue-300 rounded text-sm"
              disabled={isTraversing}
            >
              <option value="inorder">In-order</option>
              <option value="preorder">Pre-order</option>
              <option value="postorder">Post-order</option>
              <option value="levelorder">Level-order</option>
            </select>
          </div>

          <button
            onClick={startTraversal}
            disabled={isTraversing || nodes.size === 0}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isTraversing ? <SkipForward className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-sm">
              {isTraversing ? `Step ${traversalStep}/${traversalOrder.length}` : 'Start Traversal'}
            </span>
          </button>

          {traversalOrder.length > 0 && (
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Order: {traversalOrder.map((id) => nodes.get(id)?.value).join(' → ')}
            </div>
          )}
        </div>
      )}

      {/* Tree Visualization */}
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

        {nodes.size === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🌳</div>
              <p className="text-sm">Add nodes to build your binary tree</p>
            </div>
          </div>
        )}
      </div>

      {/* Tree Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{nodes.size}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Nodes</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.max(...Array.from(nodes.values()).map((n) => n.level), -1) + 1}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Height</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {Array.from(nodes.values()).filter((n) => !n.left && !n.right).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Leaf Nodes</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {maxNodes - nodes.size}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
        </div>
      </div>
    </div>
  );
};

export default BinaryTreeVisualization;
