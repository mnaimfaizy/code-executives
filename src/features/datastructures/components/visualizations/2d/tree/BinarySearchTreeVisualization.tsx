import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Search, Trash2, RotateCcw, SkipForward } from 'lucide-react';
import type { TreeNode, BaseVisualizationProps } from '../../../../../../types/datastructures';

interface BSTVisualizationProps extends BaseVisualizationProps {
  maxNodes?: number;
}

interface TreePosition {
  x: number;
  y: number;
}

const BinarySearchTreeVisualization: React.FC<BSTVisualizationProps> = ({
  maxNodes = 15,
  className = '',
  onOperationComplete,
}) => {
  const [nodes, setNodes] = useState<Map<string, TreeNode>>(new Map());
  const [rootId, setRootId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, TreePosition>>(new Map());
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [deleteValue, setDeleteValue] = useState('');
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [insertPath, setInsertPath] = useState<string[]>([]);
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);

  // Constants for layout
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 500;
  const NODE_RADIUS = 30;
  const LEVEL_HEIGHT = 100;

  // Calculate positions for all nodes
  const calculatePositions = useCallback(
    (rootNodeId: string | null) => {
      if (!rootNodeId || !nodes.has(rootNodeId)) return new Map();

      const positions = new Map<string, TreePosition>();

      // Calculate in-order positions for better BST layout
      const inOrderTraversal: string[] = [];
      const traverse = (nodeId: string) => {
        const node = nodes.get(nodeId);
        if (!node) return;

        if (node.left) traverse(node.left);
        inOrderTraversal.push(nodeId);
        if (node.right) traverse(node.right);
      };

      traverse(rootNodeId);

      // Assign x positions based on in-order sequence
      const xSpacing = SVG_WIDTH / (inOrderTraversal.length + 1);
      inOrderTraversal.forEach((nodeId, index) => {
        const node = nodes.get(nodeId);
        if (node) {
          const x = (index + 1) * xSpacing;
          const y = 50 + node.level * LEVEL_HEIGHT;
          positions.set(nodeId, { x, y });
        }
      });

      return positions;
    },
    [nodes, SVG_WIDTH, LEVEL_HEIGHT]
  );

  // Update positions when nodes change
  useEffect(() => {
    const newPositions = calculatePositions(rootId);
    setNodePositions(newPositions);
  }, [nodes, rootId, calculatePositions]);

  // BST Insert operation with animation
  const handleInsert = useCallback(() => {
    if (!inputValue.trim() || isInserting) return;

    const numValue = parseInt(inputValue);
    if (isNaN(numValue)) return;

    // Check if value already exists
    const existingNode = Array.from(nodes.values()).find((n) => n.value === numValue);
    if (existingNode) {
      alert('Value already exists in BST!');
      return;
    }

    setIsInserting(true);
    setInputValue('');

    if (rootId === null) {
      // First node becomes root - no animation needed
      const newNodeId = `node-${numValue}-${Date.now()}`;
      const newNode: TreeNode = {
        id: newNodeId,
        value: numValue,
        level: 0,
        isRoot: true,
      };
      setNodes(new Map([[newNodeId, newNode]]));
      setRootId(newNodeId);
      setIsInserting(false);

      onOperationComplete?.({
        type: 'insert',
        target: numValue,
        description: `Inserted ${numValue} into BST`,
        complexity: { time: 'O(log n) avg, O(n) worst', space: 'O(1)' },
      });
      return;
    }

    // Animated insertion - show path traversal
    const path: string[] = [];
    let currentId: string | null = rootId;
    let parentId: string | null = null;
    let goLeft = false;

    // Build the path to insertion point
    while (currentId) {
      const current: TreeNode = nodes.get(currentId)!;
      path.push(currentId);
      parentId = currentId;

      if (numValue < (current.value as number)) {
        if (!current.left) {
          goLeft = true;
          break;
        }
        currentId = current.left;
      } else {
        if (!current.right) {
          goLeft = false;
          break;
        }
        currentId = current.right;
      }
    }

    // Animate the traversal
    let step = 0;
    const animateStep = () => {
      if (step < path.length) {
        setInsertPath(path.slice(0, step + 1));
        step++;
        setTimeout(animateStep, 600);
      } else {
        // Insert the new node
        const newNodeId = `node-${numValue}-${Date.now()}`;
        const newNodes = new Map(nodes);
        const parent = newNodes.get(parentId!)!;

        const newNode: TreeNode = {
          id: newNodeId,
          value: numValue,
          level: parent.level + 1,
          parent: parentId || undefined,
        };

        if (goLeft) {
          parent.left = newNodeId;
        } else {
          parent.right = newNodeId;
        }

        newNodes.set(newNodeId, newNode);
        setNodes(newNodes);

        // Highlight the newly inserted node briefly
        setInsertPath([...path, newNodeId]);

        setTimeout(() => {
          setInsertPath([]);
          setIsInserting(false);
        }, 800);

        onOperationComplete?.({
          type: 'insert',
          target: numValue,
          description: `Inserted ${numValue} into BST`,
          complexity: { time: 'O(log n) avg, O(n) worst', space: 'O(1)' },
        });
      }
    };

    animateStep();
  }, [inputValue, nodes, rootId, isInserting, onOperationComplete]);

  // BST Search operation
  const handleSearch = useCallback(() => {
    if (!searchValue.trim() || !rootId) return;

    const numValue = parseInt(searchValue);
    if (isNaN(numValue)) return;

    setIsSearching(true);
    const path: string[] = [];
    let currentId: string | null = rootId;
    let found = false;

    // Animate search path
    const searchStep = () => {
      if (!currentId) {
        // Not found
        setSearchPath(path);
        setTimeout(() => {
          setSearchPath([]);
          setIsSearching(false);
        }, 2000);
        return;
      }

      const current = nodes.get(currentId)!;
      path.push(currentId);
      setSearchPath([...path]);

      if (current.value === numValue) {
        // Found!
        found = true;
        setTimeout(() => {
          setSearchPath([]);
          setIsSearching(false);
        }, 2000);
      } else if (numValue < (current.value as number)) {
        // Go left
        currentId = current.left || null;
        setTimeout(searchStep, 800);
      } else {
        // Go right
        currentId = current.right || null;
        setTimeout(searchStep, 800);
      }
    };

    searchStep();

    onOperationComplete?.({
      type: 'search',
      target: numValue,
      description: `Search for ${numValue}: ${found ? 'Found' : 'Not found'}`,
      complexity: { time: 'O(log n) avg, O(n) worst', space: 'O(1)' },
    });
  }, [searchValue, rootId, nodes, onOperationComplete]);

  // BST Delete operation with animation
  const handleDelete = useCallback(() => {
    if (!deleteValue.trim() || !rootId || isDeleting) return;

    const numValue = parseInt(deleteValue);
    if (isNaN(numValue)) return;

    // Find the node to delete
    const nodeToDelete = Array.from(nodes.values()).find((n) => n.value === numValue);
    if (!nodeToDelete) {
      alert('Value not found in BST!');
      return;
    }

    setIsDeleting(true);
    setDeleteValue('');

    // Highlight the node being deleted
    setDeletingNodeId(nodeToDelete.id);

    // Wait for animation before actual deletion
    setTimeout(() => {
      const newNodes = new Map(nodes);

      // Case 1: Leaf node
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
          nodeToDelete.isRoot = false; // Clear old root flag
          setRootId(null);
        }
      }
      // Case 2: Node with one child
      else if (!nodeToDelete.left || !nodeToDelete.right) {
        const childId = nodeToDelete.left || nodeToDelete.right!;
        const child = newNodes.get(childId)!;

        if (nodeToDelete.parent) {
          const parent = newNodes.get(nodeToDelete.parent)!;
          child.parent = nodeToDelete.parent;
          child.level = nodeToDelete.level;

          if (parent.left === nodeToDelete.id) {
            parent.left = childId;
          } else {
            parent.right = childId;
          }
        } else {
          // Deleting root with one child
          nodeToDelete.isRoot = false; // Clear old root flag
          child.parent = undefined;
          child.isRoot = true;
          child.level = 0;
          setRootId(childId);

          // Update levels of all descendants
          const updateLevels = (nodeId: string, level: number) => {
            const node = newNodes.get(nodeId);
            if (node) {
              node.level = level;
              if (node.left) updateLevels(node.left, level + 1);
              if (node.right) updateLevels(node.right, level + 1);
            }
          };
          updateLevels(childId, 0);
        }
      }
      // Case 3: Node with two children (find inorder successor)
      else {
        // Find inorder successor (leftmost node in right subtree)
        let successorId = nodeToDelete.right!;
        while (true) {
          const successor = newNodes.get(successorId)!;
          if (!successor.left) break;
          successorId = successor.left;
        }

        const successor = newNodes.get(successorId)!;

        // Replace nodeToDelete's value with successor's value
        nodeToDelete.value = successor.value;

        // Delete the successor (which has at most one child)
        if (successor.parent && successor.parent !== nodeToDelete.id) {
          const successorParent = newNodes.get(successor.parent)!;
          successorParent.left = successor.right;
          if (successor.right) {
            const rightChild = newNodes.get(successor.right)!;
            rightChild.parent = successor.parent;
          }
        } else {
          // Successor is direct right child of nodeToDelete
          nodeToDelete.right = successor.right;
          if (successor.right) {
            const rightChild = newNodes.get(successor.right)!;
            rightChild.parent = nodeToDelete.id;
          }
        }

        newNodes.delete(successorId);
        setNodes(newNodes);

        // Clear animation states
        setTimeout(() => {
          setDeletingNodeId(null);
          setIsDeleting(false);
        }, 400);

        onOperationComplete?.({
          type: 'delete',
          target: numValue,
          description: `Deleted ${numValue} from BST`,
          complexity: { time: 'O(log n) avg, O(n) worst', space: 'O(1)' },
        });
        return;
      }

      newNodes.delete(nodeToDelete.id);
      setNodes(newNodes);

      // Clear animation states
      setTimeout(() => {
        setDeletingNodeId(null);
        setIsDeleting(false);
      }, 400);

      onOperationComplete?.({
        type: 'delete',
        target: numValue,
        description: `Deleted ${numValue} from BST`,
        complexity: { time: 'O(log n) avg, O(n) worst', space: 'O(1)' },
      });
    }, 800);
  }, [deleteValue, rootId, nodes, isDeleting, onOperationComplete]);

  // Reset tree
  const handleReset = useCallback(() => {
    setNodes(new Map());
    setRootId(null);
    setNodePositions(new Map());
    setInputValue('');
    setSearchValue('');
    setDeleteValue('');
    setSearchPath([]);
    setIsSearching(false);
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
          const isHighlighted = searchPath.includes(node.id) && searchPath.includes(node.left);

          // Calculate edge endpoints on circle perimeter
          const angle = Math.atan2(leftPos.y - nodePos.y, leftPos.x - nodePos.x);
          const x1 = nodePos.x + NODE_RADIUS * Math.cos(angle);
          const y1 = nodePos.y + NODE_RADIUS * Math.sin(angle);
          const x2 = leftPos.x - NODE_RADIUS * Math.cos(angle);
          const y2 = leftPos.y - NODE_RADIUS * Math.sin(angle);

          edges.push(
            <line
              key={`edge-${node.id}-left`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isHighlighted ? '#3b82f6' : '#94a3b8'}
              strokeWidth={isHighlighted ? 3 : 2}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          );
        }
      }

      if (node.right) {
        const rightPos = nodePositions.get(node.right);
        if (rightPos) {
          const isHighlighted = searchPath.includes(node.id) && searchPath.includes(node.right);

          // Calculate edge endpoints on circle perimeter
          const angle = Math.atan2(rightPos.y - nodePos.y, rightPos.x - nodePos.x);
          const x1 = nodePos.x + NODE_RADIUS * Math.cos(angle);
          const y1 = nodePos.y + NODE_RADIUS * Math.sin(angle);
          const x2 = rightPos.x - NODE_RADIUS * Math.cos(angle);
          const y2 = rightPos.y - NODE_RADIUS * Math.sin(angle);

          edges.push(
            <line
              key={`edge-${node.id}-right`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isHighlighted ? '#3b82f6' : '#94a3b8'}
              strokeWidth={isHighlighted ? 3 : 2}
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

      const isHighlighted = searchPath.includes(node.id);
      const searchIndex = searchPath.indexOf(node.id);
      const isInInsertPath = insertPath.includes(node.id);
      const isBeingDeleted = deletingNodeId === node.id;
      const isNewlyInserted =
        isInInsertPath && insertPath[insertPath.length - 1] === node.id && insertPath.length > 1;

      return (
        <g key={node.id} className="transition-all duration-500">
          {/* Glow effect for highlighted nodes */}
          {(isHighlighted || isInInsertPath || isBeingDeleted) && (
            <circle
              cx={position.x}
              cy={position.y}
              r={NODE_RADIUS + 4}
              fill="none"
              stroke={isBeingDeleted ? '#ef4444' : isNewlyInserted ? '#10b981' : '#3b82f6'}
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
                : isNewlyInserted
                  ? '#10b981'
                  : isInInsertPath
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
                : isNewlyInserted
                  ? '#059669'
                  : isInInsertPath
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
              isBeingDeleted || isNewlyInserted || isInInsertPath || isHighlighted || node.isRoot
                ? 'fill-white'
                : 'fill-gray-700'
            }`}
            style={{ fontSize: '16px' }}
          >
            {node.value}
          </text>

          {/* Search step number badge */}
          {isHighlighted && searchIndex >= 0 && (
            <g>
              {/* Badge background */}
              <circle
                cx={position.x + NODE_RADIUS - 5}
                cy={position.y - NODE_RADIUS + 5}
                r={12}
                fill="#dbeafe"
                stroke="#3b82f6"
                strokeWidth={1.5}
              />
              {/* Badge text */}
              <text
                x={position.x + NODE_RADIUS - 5}
                y={position.y - NODE_RADIUS + 9}
                textAnchor="middle"
                className="text-xs font-bold fill-blue-600 pointer-events-none"
                style={{ fontSize: '11px' }}
              >
                {searchIndex + 1}
              </text>
            </g>
          )}
        </g>
      );
    });
  };

  // Calculate BST properties
  const isValidBST = useCallback(() => {
    if (!rootId) return true;

    const validate = (nodeId: string, min: number, max: number): boolean => {
      const node = nodes.get(nodeId);
      if (!node) return true;

      const value = node.value as number;
      if (value <= min || value >= max) return false;

      return (
        (!node.left || validate(node.left, min, value)) &&
        (!node.right || validate(node.right, value, max))
      );
    };

    return validate(rootId, -Infinity, Infinity);
  }, [rootId, nodes]);

  return (
    <div className={`bst-visualization ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Value to insert"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
          />
          <button
            onClick={handleInsert}
            disabled={nodes.size >= maxNodes || isInserting}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">{isInserting ? 'Inserting...' : 'Insert'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Value to search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm w-36 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg font-medium"
          >
            {isSearching ? <SkipForward className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            <span className="text-sm">Search</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Value to delete"
            value={deleteValue}
            onChange={(e) => setDeleteValue(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm w-36 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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

      {/* BST Properties */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm">
            <span className="font-semibold text-blue-800 dark:text-blue-300">BST Property: </span>
            <span
              className={`font-bold text-lg ${isValidBST() ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
            >
              {isValidBST() ? '✓ Valid' : '✗ Invalid'}
            </span>
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-400 font-medium bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full">
            Left subtree &lt; Node &lt; Right subtree
          </div>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-inner">
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
            <div className="text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-6xl mb-4">🌲</div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Build Your Binary Search Tree
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Values are automatically placed according to BST rules
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
            <span className="text-gray-700 dark:text-gray-300">Search Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-amber-400 rounded-full border-2 border-amber-500 shadow-lg"></div>
            <span className="text-gray-700 dark:text-gray-300">Insert Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-red-700 shadow-lg"></div>
            <span className="text-gray-700 dark:text-gray-300">Deleting</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-blue-100 rounded-full border border-blue-500 flex items-center justify-center">
              <span className="text-[8px] font-bold text-blue-600">1</span>
            </div>
            <span className="text-gray-700 dark:text-gray-300">Search Step</span>
          </div>
        </div>
      </div>

      {/* Tree Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800 shadow-sm">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{nodes.size}</div>
          <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mt-1">
            Total Nodes
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800 shadow-sm">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.max(...Array.from(nodes.values()).map((n) => n.level), -1) + 1}
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-300 font-medium mt-1">
            Height
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-800 shadow-sm">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Array.from(nodes.values()).filter((n) => !n.left && !n.right).length}
          </div>
          <div className="text-xs text-green-700 dark:text-green-300 font-medium mt-1">
            Leaf Nodes
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border-2 border-amber-200 dark:border-amber-800 shadow-sm">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {nodes.size > 0 ? Math.ceil(Math.log2(nodes.size + 1)) : 0}
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-300 font-medium mt-1">
            Optimal Height
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinarySearchTreeVisualization;
