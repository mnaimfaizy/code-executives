import React, { useState, useCallback, useEffect } from 'react';
import { Plus, RotateCcw, Search } from 'lucide-react';
import type { TreeNode, BaseVisualizationProps } from '../../../../../../types/datastructures';

interface AVLNode extends TreeNode {
  balanceFactor: number;
  height: number;
}

interface AVLVisualizationProps extends BaseVisualizationProps {
  maxNodes?: number;
  showBalanceFactors?: boolean;
}

interface TreePosition {
  x: number;
  y: number;
}

const AVLTreeVisualization: React.FC<AVLVisualizationProps> = ({
  maxNodes = 15,
  showBalanceFactors = true,
  className = '',
  onOperationComplete,
}) => {
  const [nodes, setNodes] = useState<Map<string, AVLNode>>(new Map());
  const [rootId, setRootId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, TreePosition>>(new Map());
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const [rotationAnimation, setRotationAnimation] = useState<string | null>(null);
  const [isOperating, setIsOperating] = useState(false);

  // Constants for layout
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 500;
  const NODE_RADIUS = 30;
  const LEVEL_HEIGHT = 100;

  // Calculate height of a node
  const getHeight = useCallback((nodeId: string | null, nodeMap: Map<string, AVLNode>): number => {
    if (!nodeId || !nodeMap.has(nodeId)) return -1;

    const node = nodeMap.get(nodeId)!;
    const leftHeight = getHeight(node.left || null, nodeMap);
    const rightHeight = getHeight(node.right || null, nodeMap);

    return Math.max(leftHeight, rightHeight) + 1;
  }, []);

  // Calculate balance factor
  const getBalanceFactor = useCallback(
    (nodeId: string, nodeMap: Map<string, AVLNode>): number => {
      const node = nodeMap.get(nodeId);
      if (!node) return 0;

      const leftHeight = getHeight(node.left || null, nodeMap);
      const rightHeight = getHeight(node.right || null, nodeMap);

      return leftHeight - rightHeight;
    },
    [getHeight]
  );

  // Update heights and balance factors for all nodes
  const updateTreeMetrics = useCallback(
    (nodeMap: Map<string, AVLNode>, rootNodeId: string | null) => {
      if (!rootNodeId) return nodeMap;

      const updateNode = (nodeId: string): void => {
        const node = nodeMap.get(nodeId);
        if (!node) return;

        // Update children first
        if (node.left) updateNode(node.left);
        if (node.right) updateNode(node.right);

        // Update this node's metrics
        node.height = getHeight(nodeId, nodeMap);
        node.balanceFactor = getBalanceFactor(nodeId, nodeMap);
      };

      updateNode(rootNodeId);
      return nodeMap;
    },
    [getHeight, getBalanceFactor]
  );

  // Right rotation
  const rotateRight = useCallback(
    (nodeMap: Map<string, AVLNode>, yId: string): [Map<string, AVLNode>, string] => {
      const y = nodeMap.get(yId)!;
      const xId = y.left!;
      const x = nodeMap.get(xId)!;

      // Perform rotation
      y.left = x.right;
      x.right = yId;

      // Update parent references
      if (y.left) {
        const leftChild = nodeMap.get(y.left)!;
        leftChild.parent = yId;
      }
      x.parent = y.parent;
      y.parent = xId;

      // Update levels
      y.level = x.level + 1;
      const updateLevels = (nodeId: string, level: number) => {
        const node = nodeMap.get(nodeId);
        if (node) {
          node.level = level;
          if (node.left) updateLevels(node.left, level + 1);
          if (node.right) updateLevels(node.right, level + 1);
        }
      };
      updateLevels(yId, x.level + 1);

      return [nodeMap, xId];
    },
    []
  );

  // Left rotation
  const rotateLeft = useCallback(
    (nodeMap: Map<string, AVLNode>, xId: string): [Map<string, AVLNode>, string] => {
      const x = nodeMap.get(xId)!;
      const yId = x.right!;
      const y = nodeMap.get(yId)!;

      // Perform rotation
      x.right = y.left;
      y.left = xId;

      // Update parent references
      if (x.right) {
        const rightChild = nodeMap.get(x.right)!;
        rightChild.parent = xId;
      }
      y.parent = x.parent;
      x.parent = yId;

      // Update levels
      x.level = y.level + 1;
      const updateLevels = (nodeId: string, level: number) => {
        const node = nodeMap.get(nodeId);
        if (node) {
          node.level = level;
          if (node.left) updateLevels(node.left, level + 1);
          if (node.right) updateLevels(node.right, level + 1);
        }
      };
      updateLevels(xId, y.level + 1);

      return [nodeMap, yId];
    },
    []
  );

  // AVL insertion with rebalancing
  const insertAVL = useCallback(
    (
      nodeMap: Map<string, AVLNode>,
      rootNodeId: string | null,
      value: number
    ): [Map<string, AVLNode>, string] => {
      // Create new node
      const newNodeId = `avl-${value}-${Date.now()}`;
      const newNode: AVLNode = {
        id: newNodeId,
        value,
        level: 0,
        height: 0,
        balanceFactor: 0,
        isRoot: rootNodeId === null,
      };

      if (rootNodeId === null) {
        nodeMap.set(newNodeId, newNode);
        return [nodeMap, newNodeId];
      }

      // Standard BST insertion
      let currentId: string | null = rootNodeId;
      let parentId: string | null = null;

      while (currentId) {
        const current: AVLNode = nodeMap.get(currentId)!;
        parentId = currentId;

        if (value < (current.value as number)) {
          currentId = current.left || null;
        } else if (value > (current.value as number)) {
          currentId = current.right || null;
        } else {
          // Value already exists
          return [nodeMap, rootNodeId];
        }
      }

      // Insert the new node
      const parent = nodeMap.get(parentId!)!;
      newNode.parent = parentId || undefined;
      newNode.level = parent.level + 1;

      if (value < (parent.value as number)) {
        parent.left = newNodeId;
      } else {
        parent.right = newNodeId;
      }

      nodeMap.set(newNodeId, newNode);

      // Update metrics and rebalance
      updateTreeMetrics(nodeMap, rootNodeId);

      // Rebalance the tree
      let currentRoot = rootNodeId;
      let current = parentId;

      while (current) {
        const node = nodeMap.get(current)!;
        const balance = node.balanceFactor;

        // Left heavy
        if (balance > 1) {
          const leftChild = nodeMap.get(node.left!)!;

          if (leftChild.balanceFactor >= 0) {
            // Left-Left case
            setRotationAnimation('right');
            const [newMap, newRoot] = rotateRight(nodeMap, current);
            nodeMap = newMap;

            if (current === currentRoot) {
              currentRoot = newRoot;
            } else if (node.parent) {
              const grandParent = nodeMap.get(node.parent)!;
              if (grandParent.left === current) {
                grandParent.left = newRoot;
              } else {
                grandParent.right = newRoot;
              }
            }
          } else {
            // Left-Right case
            setRotationAnimation('left-right');
            const [mapAfterLeft] = rotateLeft(nodeMap, node.left!);
            const [newMap, newRoot] = rotateRight(mapAfterLeft, current);
            nodeMap = newMap;

            if (current === currentRoot) {
              currentRoot = newRoot;
            } else if (node.parent) {
              const grandParent = nodeMap.get(node.parent)!;
              if (grandParent.left === current) {
                grandParent.left = newRoot;
              } else {
                grandParent.right = newRoot;
              }
            }
          }
        }
        // Right heavy
        else if (balance < -1) {
          const rightChild = nodeMap.get(node.right!)!;

          if (rightChild.balanceFactor <= 0) {
            // Right-Right case
            setRotationAnimation('left');
            const [newMap, newRoot] = rotateLeft(nodeMap, current);
            nodeMap = newMap;

            if (current === currentRoot) {
              currentRoot = newRoot;
            } else if (node.parent) {
              const grandParent = nodeMap.get(node.parent)!;
              if (grandParent.left === current) {
                grandParent.left = newRoot;
              } else {
                grandParent.right = newRoot;
              }
            }
          } else {
            // Right-Left case
            setRotationAnimation('right-left');
            const [mapAfterRight] = rotateRight(nodeMap, node.right!);
            const [newMap, newRoot] = rotateLeft(mapAfterRight, current);
            nodeMap = newMap;

            if (current === currentRoot) {
              currentRoot = newRoot;
            } else if (node.parent) {
              const grandParent = nodeMap.get(node.parent)!;
              if (grandParent.left === current) {
                grandParent.left = newRoot;
              } else {
                grandParent.right = newRoot;
              }
            }
          }
        }

        current = node.parent || null;
      }

      // Final metrics update
      updateTreeMetrics(nodeMap, currentRoot);

      // Clear rotation animation after delay
      setTimeout(() => setRotationAnimation(null), 1500);

      return [nodeMap, currentRoot];
    },
    [updateTreeMetrics, rotateRight, rotateLeft]
  );

  // Calculate positions for all nodes
  const calculatePositions = useCallback(
    (rootNodeId: string | null) => {
      if (!rootNodeId || !nodes.has(rootNodeId)) return new Map();

      const positions = new Map<string, TreePosition>();

      // In-order traversal for x-positioning
      const inOrderTraversal: string[] = [];
      const traverse = (nodeId: string) => {
        const node = nodes.get(nodeId);
        if (!node) return;

        if (node.left) traverse(node.left);
        inOrderTraversal.push(nodeId);
        if (node.right) traverse(node.right);
      };

      traverse(rootNodeId);

      // Assign positions
      const xSpacing = SVG_WIDTH / (inOrderTraversal.length + 1);
      inOrderTraversal.forEach((nodeId, index) => {
        const node = nodes.get(nodeId);
        if (node) {
          const x = (index + 1) * xSpacing;
          const y = 60 + node.level * LEVEL_HEIGHT;
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

  // Handle insertion
  const handleInsert = useCallback(() => {
    if (!inputValue.trim() || isOperating) return;

    const numValue = parseInt(inputValue);
    if (isNaN(numValue)) return;

    setIsOperating(true);

    const [newNodes, newRootId] = insertAVL(new Map(nodes), rootId, numValue);
    setNodes(newNodes);
    setRootId(newRootId);
    setInputValue('');

    setTimeout(() => setIsOperating(false), 2000);

    onOperationComplete?.({
      type: 'insert',
      target: numValue,
      description: `Inserted ${numValue} into AVL tree with automatic rebalancing`,
      complexity: { time: 'O(log n)', space: 'O(log n)' },
    });
  }, [inputValue, nodes, rootId, insertAVL, isOperating, onOperationComplete]);

  // Handle search
  const handleSearch = useCallback(() => {
    if (!searchValue.trim() || !rootId) return;

    const numValue = parseInt(searchValue);
    if (isNaN(numValue)) return;

    const path: string[] = [];
    let currentId: string | null = rootId;

    // Animate search
    const searchStep = () => {
      if (!currentId) {
        setSearchPath(path);
        setTimeout(() => setSearchPath([]), 2000);
        return;
      }

      const current = nodes.get(currentId)!;
      path.push(currentId);
      setSearchPath([...path]);

      if (current.value === numValue) {
        setTimeout(() => setSearchPath([]), 2000);
      } else if (numValue < (current.value as number)) {
        currentId = current.left || null;
        setTimeout(searchStep, 600);
      } else {
        currentId = current.right || null;
        setTimeout(searchStep, 600);
      }
    };

    searchStep();
  }, [searchValue, rootId, nodes]);

  // Reset tree
  const handleReset = useCallback(() => {
    setNodes(new Map());
    setRootId(null);
    setNodePositions(new Map());
    setInputValue('');
    setSearchValue('');
    setSearchPath([]);
    setRotationAnimation(null);
    setIsOperating(false);
  }, []);

  // Render edges
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

  // Render nodes
  const renderNodes = () => {
    return Array.from(nodes.values()).map((node) => {
      const position = nodePositions.get(node.id);
      if (!position) return null;

      const isHighlighted = searchPath.includes(node.id);
      const isImbalanced = Math.abs(node.balanceFactor) > 1;

      return (
        <g key={node.id} className="transition-all duration-500">
          {/* Glow effect for highlighted nodes */}
          {isHighlighted && (
            <circle
              cx={position.x}
              cy={position.y}
              r={NODE_RADIUS + 4}
              fill="none"
              stroke="#3b82f6"
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
              isHighlighted
                ? '#3b82f6'
                : isImbalanced
                  ? '#ef4444'
                  : node.isRoot
                    ? '#10b981'
                    : '#ffffff'
            }
            stroke={
              isHighlighted
                ? '#1d4ed8'
                : isImbalanced
                  ? '#dc2626'
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
              isHighlighted || node.isRoot ? 'fill-white' : 'fill-gray-700'
            }`}
            style={{ fontSize: '16px' }}
          >
            {node.value}
          </text>

          {/* Balance factor badge */}
          {showBalanceFactors && (
            <g>
              {/* Badge background */}
              <circle
                cx={position.x + NODE_RADIUS - 5}
                cy={position.y - NODE_RADIUS + 5}
                r={12}
                fill={Math.abs(node.balanceFactor) > 1 ? '#fee2e2' : '#dbeafe'}
                stroke={Math.abs(node.balanceFactor) > 1 ? '#ef4444' : '#3b82f6'}
                strokeWidth={1.5}
              />
              {/* Badge text */}
              <text
                x={position.x + NODE_RADIUS - 5}
                y={position.y - NODE_RADIUS + 9}
                textAnchor="middle"
                className={`text-xs font-bold pointer-events-none ${
                  Math.abs(node.balanceFactor) > 1 ? 'fill-red-600' : 'fill-blue-600'
                }`}
                style={{ fontSize: '11px' }}
              >
                {node.balanceFactor > 0 ? `+${node.balanceFactor}` : node.balanceFactor}
              </text>
            </g>
          )}

          {/* Height indicator badge */}
          <g>
            {/* Badge background */}
            <circle
              cx={position.x - NODE_RADIUS + 5}
              cy={position.y - NODE_RADIUS + 5}
              r={12}
              fill="#d1fae5"
              stroke="#10b981"
              strokeWidth={1.5}
            />
            {/* Badge text */}
            <text
              x={position.x - NODE_RADIUS + 5}
              y={position.y - NODE_RADIUS + 9}
              textAnchor="middle"
              className="text-xs font-bold fill-green-700 pointer-events-none"
              style={{ fontSize: '11px' }}
            >
              {node.height}
            </text>
          </g>
        </g>
      );
    });
  };

  // Check if tree is balanced
  const isTreeBalanced = () => {
    return Array.from(nodes.values()).every((node) => Math.abs(node.balanceFactor) <= 1);
  };

  return (
    <div className={`avl-tree-visualization ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Value to insert"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm w-36 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
            disabled={isOperating}
          />
          <button
            onClick={handleInsert}
            disabled={nodes.size >= maxNodes || isOperating}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Insert</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Value to search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search</span>
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

      {/* AVL Properties */}
      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm">
            <span className="font-semibold text-green-800 dark:text-green-300">AVL Property: </span>
            <span
              className={`font-bold text-lg ${
                isTreeBalanced()
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isTreeBalanced() ? '✓ Balanced' : '✗ Imbalanced'}
            </span>
            {rotationAnimation && (
              <span className="ml-4 text-blue-600 dark:text-blue-400 animate-pulse font-medium">
                🔄 Performing {rotationAnimation} rotation
              </span>
            )}
          </div>
          <div className="text-xs text-green-700 dark:text-green-400 font-medium bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full">
            Balance Factor ∈ [-1, 0, 1] for all nodes
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
              <div className="text-6xl mb-4">⚖️</div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Build Your AVL Tree
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add nodes to see automatic rebalancing in action
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
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
            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-red-700"></div>
            <span className="text-gray-700 dark:text-gray-300">Imbalanced</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-5 h-5 bg-blue-100 rounded-full border border-blue-500 flex items-center justify-center">
                <span className="text-[8px] font-bold text-blue-600">±1</span>
              </div>
              <div className="w-5 h-5 bg-green-100 rounded-full border border-green-500 flex items-center justify-center">
                <span className="text-[8px] font-bold text-green-600">h</span>
              </div>
            </div>
            <span className="text-gray-700 dark:text-gray-300">Balance & Height</span>
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
            {Math.max(...Array.from(nodes.values()).map((n) => n.height), -1) + 1}
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-300 font-medium mt-1">
            Actual Height
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
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-800 shadow-sm">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {isTreeBalanced() ? '✓' : '✗'}
          </div>
          <div className="text-xs text-green-700 dark:text-green-300 font-medium mt-1">
            Balanced
          </div>
        </div>
      </div>
    </div>
  );
};

export default AVLTreeVisualization;
