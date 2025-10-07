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
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);
  const [replacementNodeId, setReplacementNodeId] = useState<string | null>(null);

  // Constants for layout
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 500;
  const NODE_RADIUS = 30;
  const LEVEL_HEIGHT = 100;

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
    if (!deleteValue.trim() || isDeleting) return;

    const numValue = parseInt(deleteValue);
    if (isNaN(numValue)) return;

    // Find the node to delete
    const nodeToDelete = Array.from(nodes.values()).find((n) => n.value === numValue);
    if (!nodeToDelete) {
      alert('Value not found in tree!');
      return;
    }

    setIsDeleting(true);
    setDeleteValue('');

    // Step 1: Highlight the node being deleted
    setDeletingNodeId(nodeToDelete.id);

    // Wait for user to see which node is being deleted
    setTimeout(() => {
      const newNodes = new Map(nodes);

      // Helper function to update all node levels after restructuring
      const updateLevels = (nodeId: string, level: number) => {
        const node = newNodes.get(nodeId);
        if (node) {
          node.level = level;
          if (node.left) updateLevels(node.left, level + 1);
          if (node.right) updateLevels(node.right, level + 1);
        }
      };

      // Case 1: Node is a leaf (no children)
      if (!nodeToDelete.left && !nodeToDelete.right) {
        if (nodeToDelete.parent) {
          const parent = newNodes.get(nodeToDelete.parent)!;
          if (parent.left === nodeToDelete.id) {
            parent.left = undefined;
          } else {
            parent.right = undefined;
          }
        } else {
          // Deleting root with no children
          setRootId(null);
        }
      }
      // Case 2: Node has only one child
      else if (!nodeToDelete.left || !nodeToDelete.right) {
        const childId = nodeToDelete.left || nodeToDelete.right!;
        const child = newNodes.get(childId)!;

        if (nodeToDelete.parent) {
          // Replace node with its child
          const parent = newNodes.get(nodeToDelete.parent)!;
          child.parent = nodeToDelete.parent;

          if (parent.left === nodeToDelete.id) {
            parent.left = childId;
          } else {
            parent.right = childId;
          }

          // Update levels of the subtree
          updateLevels(childId, nodeToDelete.level);
        } else {
          // Deleting root with one child
          nodeToDelete.isRoot = false;
          child.parent = undefined;
          child.isRoot = true;
          child.level = 0;
          setRootId(childId);

          // Update levels of all descendants
          updateLevels(childId, 0);
        }
      }
      // Case 3: Node has two children
      else {
        // Replace with the rightmost node of the left subtree (in-order predecessor)
        // or leftmost node of the right subtree (in-order successor)
        // For simplicity, we'll use the rightmost node of left subtree

        // Find the rightmost node in left subtree
        let predecessorId = nodeToDelete.left;
        let predecessor = newNodes.get(predecessorId)!;

        while (predecessor.right) {
          predecessorId = predecessor.right;
          predecessor = newNodes.get(predecessorId)!;
        }

        // Step 2: Show which node will replace it
        setReplacementNodeId(predecessorId);

        // Wait for user to see the replacement node
        setTimeout(() => {
          // Replace nodeToDelete's value with predecessor's value
          nodeToDelete.value = predecessor.value;

          // Now delete the predecessor (which has at most one child - left)
          if (predecessor.parent && predecessor.parent !== nodeToDelete.id) {
            const predecessorParent = newNodes.get(predecessor.parent)!;
            predecessorParent.right = predecessor.left;

            if (predecessor.left) {
              const leftChild = newNodes.get(predecessor.left)!;
              leftChild.parent = predecessor.parent;
            }
          } else {
            // Predecessor is the direct left child of nodeToDelete
            nodeToDelete.left = predecessor.left;

            if (predecessor.left) {
              const leftChild = newNodes.get(predecessor.left)!;
              leftChild.parent = nodeToDelete.id;
            }
          }

          // Delete the predecessor node
          newNodes.delete(predecessorId);
          setNodes(newNodes);

          // Clear animation states
          setTimeout(() => {
            setDeletingNodeId(null);
            setReplacementNodeId(null);
            setIsDeleting(false);
          }, 400);

          onOperationComplete?.({
            type: 'delete',
            target: numValue,
            description: `Deleted ${numValue} from binary tree`,
            complexity: { time: 'O(n)', space: 'O(1)' },
          });
        }, 600); // Wait 600ms to show replacement node
        return;
      }

      newNodes.delete(nodeToDelete.id);
      setNodes(newNodes);

      // Clear animation states
      setTimeout(() => {
        setDeletingNodeId(null);
        setReplacementNodeId(null);
        setIsDeleting(false);
      }, 400);

      onOperationComplete?.({
        type: 'delete',
        target: numValue,
        description: `Deleted ${numValue} from binary tree`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      });
    }, 800); // Wait 800ms to show deleting node
  }, [deleteValue, nodes, isDeleting, onOperationComplete]);

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
          // Calculate edge endpoints on circle perimeters
          const angle = Math.atan2(leftPos.y - nodePos.y, leftPos.x - nodePos.x);
          const startX = nodePos.x + NODE_RADIUS * Math.cos(angle);
          const startY = nodePos.y + NODE_RADIUS * Math.sin(angle);
          const endX = leftPos.x - NODE_RADIUS * Math.cos(angle);
          const endY = leftPos.y - NODE_RADIUS * Math.sin(angle);

          edges.push(
            <line
              key={`edge-${node.id}-left`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="#94a3b8"
              strokeWidth={2}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          );
        }
      }

      if (node.right) {
        const rightPos = nodePositions.get(node.right);
        if (rightPos) {
          // Calculate edge endpoints on circle perimeters
          const angle = Math.atan2(rightPos.y - nodePos.y, rightPos.x - nodePos.x);
          const startX = nodePos.x + NODE_RADIUS * Math.cos(angle);
          const startY = nodePos.y + NODE_RADIUS * Math.sin(angle);
          const endX = rightPos.x - NODE_RADIUS * Math.cos(angle);
          const endY = rightPos.y - NODE_RADIUS * Math.sin(angle);

          edges.push(
            <line
              key={`edge-${node.id}-right`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="#94a3b8"
              strokeWidth={2}
              strokeLinecap="round"
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
      const isBeingDeleted = deletingNodeId === node.id;
      const isReplacement = replacementNodeId === node.id;

      return (
        <g key={node.id} className="transition-all duration-500">
          {/* Glow effect for highlighted nodes */}
          {(isHighlighted || isBeingDeleted || isReplacement) && (
            <circle
              cx={position.x}
              cy={position.y}
              r={NODE_RADIUS + 4}
              fill="none"
              stroke={isBeingDeleted ? '#ef4444' : isReplacement ? '#f59e0b' : '#3b82f6'}
              strokeWidth={2}
              opacity={0.3}
              className="animate-pulse"
            />
          )}

          {/* Node shadow */}
          <circle
            cx={position.x + 2}
            cy={position.y + 2}
            r={NODE_RADIUS}
            fill="rgba(0, 0, 0, 0.1)"
          />

          {/* Node circle */}
          <circle
            cx={position.x}
            cy={position.y}
            r={NODE_RADIUS}
            fill={
              isBeingDeleted
                ? '#ef4444'
                : isReplacement
                  ? '#fbbf24'
                  : isHighlighted
                    ? '#3b82f6'
                    : node.isRoot
                      ? '#10b981'
                      : '#ffffff'
            }
            stroke={
              isBeingDeleted
                ? '#dc2626'
                : isReplacement
                  ? '#f59e0b'
                  : isHighlighted
                    ? '#1d4ed8'
                    : node.isRoot
                      ? '#059669'
                      : '#3b82f6'
            }
            strokeWidth={3}
            className="cursor-pointer hover:opacity-90 transition-all"
          />

          {/* Node value */}
          <text
            x={position.x}
            y={position.y + 6}
            textAnchor="middle"
            className={`text-base font-bold pointer-events-none ${
              isBeingDeleted || isReplacement || isHighlighted || node.isRoot
                ? 'fill-white'
                : 'fill-gray-700'
            }`}
            style={{ fontSize: '16px' }}
          >
            {node.value}
          </text>

          {/* Traversal step indicator with badge */}
          {isHighlighted && traversalIndex >= 0 && (
            <g>
              <circle
                cx={position.x}
                cy={position.y - NODE_RADIUS - 12}
                r={10}
                fill="#dbeafe"
                stroke="#3b82f6"
                strokeWidth={1.5}
              />
              <text
                x={position.x}
                y={position.y - NODE_RADIUS - 8}
                textAnchor="middle"
                className="text-xs font-bold fill-blue-600 pointer-events-none"
                style={{ fontSize: '11px' }}
              >
                {traversalIndex + 1}
              </text>
            </g>
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
            className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm w-36 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
          />
          <button
            onClick={() => handleInsert()}
            disabled={nodes.size >= maxNodes}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
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
            className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm w-36 focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleDelete()}
          />
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg hover:from-gray-700 hover:to-gray-600 transition-all shadow-md hover:shadow-lg font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">Reset</span>
        </button>
      </div>

      {/* Traversal Controls */}
      {showTraversal && nodes.size > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-100 shadow-sm">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Traversal:
            </label>
            <select
              value={currentTraversalType}
              onChange={(e) =>
                setCurrentTraversalType(
                  e.target.value as 'inorder' | 'preorder' | 'postorder' | 'levelorder'
                )
              }
              className="px-3 py-2 border-2 border-blue-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
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
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
          >
            {isTraversing ? <SkipForward className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-sm">
              {isTraversing ? `Step ${traversalStep}/${traversalOrder.length}` : 'Start Traversal'}
            </span>
          </button>

          {traversalOrder.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Order:</span>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {traversalOrder.map((id) => nodes.get(id)?.value).join(' → ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tree Visualization */}
      <div className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-inner">
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
            <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="text-6xl mb-4">🌳</div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Build Your Binary Tree
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Insert nodes to start visualizing the tree structure
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-green-600"></div>
            <span className="text-gray-700 dark:text-gray-300">Root Node</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white rounded-full border-2 border-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Regular Node</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-blue-700 shadow-lg"></div>
            <span className="text-gray-700 dark:text-gray-300">Traversal Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-amber-400 rounded-full border-2 border-amber-500 shadow-lg"></div>
            <span className="text-gray-700 dark:text-gray-300">Replacement</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-red-700 shadow-lg"></div>
            <span className="text-gray-700 dark:text-gray-300">Deleting</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-blue-100 rounded-full border border-blue-500 flex items-center justify-center">
              <span className="text-[8px] font-bold text-blue-600">1</span>
            </div>
            <span className="text-gray-700 dark:text-gray-300">Traversal Step</span>
          </div>
        </div>
      </div>

      {/* Tree Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-4 border-2 border-blue-100 dark:border-blue-800 shadow-sm">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{nodes.size}</div>
          <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Nodes</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4 border-2 border-purple-100 dark:border-purple-800 shadow-sm">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.max(...Array.from(nodes.values()).map((n) => n.level), -1) + 1}
          </div>
          <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Height</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 border-2 border-green-100 dark:border-green-800 shadow-sm">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Array.from(nodes.values()).filter((n) => !n.left && !n.right).length}
          </div>
          <div className="text-sm font-medium text-green-700 dark:text-green-300">Leaf Nodes</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl p-4 border-2 border-amber-100 dark:border-amber-800 shadow-sm">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {maxNodes - nodes.size}
          </div>
          <div className="text-sm font-medium text-amber-700 dark:text-amber-300">Remaining</div>
        </div>
      </div>
    </div>
  );
};

export default BinaryTreeVisualization;
