import React, { useState, useCallback, useEffect } from 'react';
import { Plus, RotateCcw, Search } from 'lucide-react';
import type { TreeNode, BaseVisualizationProps } from '../../../../types/datastructures';

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
  onOperationComplete
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
  const SVG_WIDTH = 900;
  const SVG_HEIGHT = 600;
  const NODE_RADIUS = 25;
  const LEVEL_HEIGHT = 80;

  // Calculate height of a node
  const getHeight = useCallback((nodeId: string | null, nodeMap: Map<string, AVLNode>): number => {
    if (!nodeId || !nodeMap.has(nodeId)) return -1;
    
    const node = nodeMap.get(nodeId)!;
    const leftHeight = getHeight(node.left || null, nodeMap);
    const rightHeight = getHeight(node.right || null, nodeMap);
    
    return Math.max(leftHeight, rightHeight) + 1;
  }, []);

  // Calculate balance factor
  const getBalanceFactor = useCallback((nodeId: string, nodeMap: Map<string, AVLNode>): number => {
    const node = nodeMap.get(nodeId);
    if (!node) return 0;
    
    const leftHeight = getHeight(node.left || null, nodeMap);
    const rightHeight = getHeight(node.right || null, nodeMap);
    
    return leftHeight - rightHeight;
  }, [getHeight]);

  // Update heights and balance factors for all nodes
  const updateTreeMetrics = useCallback((nodeMap: Map<string, AVLNode>, rootNodeId: string | null) => {
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
  }, [getHeight, getBalanceFactor]);

  // Right rotation
  const rotateRight = useCallback((nodeMap: Map<string, AVLNode>, yId: string): [Map<string, AVLNode>, string] => {
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
  }, []);

  // Left rotation
  const rotateLeft = useCallback((nodeMap: Map<string, AVLNode>, xId: string): [Map<string, AVLNode>, string] => {
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
  }, []);

  // AVL insertion with rebalancing
  const insertAVL = useCallback((nodeMap: Map<string, AVLNode>, rootNodeId: string | null, value: number): [Map<string, AVLNode>, string] => {
    // Create new node
    const newNodeId = `avl-${value}-${Date.now()}`;
    const newNode: AVLNode = {
      id: newNodeId,
      value,
      level: 0,
      height: 0,
      balanceFactor: 0,
      isRoot: rootNodeId === null
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
  }, [updateTreeMetrics, rotateRight, rotateLeft]);

  // Calculate positions for all nodes
  const calculatePositions = useCallback((rootNodeId: string | null) => {
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
  }, [nodes, SVG_WIDTH, LEVEL_HEIGHT]);

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
      complexity: { time: 'O(log n)', space: 'O(log n)' }
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

      if (node.right) {
        const rightPos = nodePositions.get(node.right);
        if (rightPos) {
          const isHighlighted = searchPath.includes(node.id) && searchPath.includes(node.right);
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

  // Render nodes
  const renderNodes = () => {
    return Array.from(nodes.values()).map((node) => {
      const position = nodePositions.get(node.id);
      if (!position) return null;

      const isHighlighted = searchPath.includes(node.id);
      const isImbalanced = Math.abs(node.balanceFactor) > 1;

      return (
        <g key={node.id} className="transition-all duration-500">
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
                    : '#f3f4f6'
            }
            stroke={
              isHighlighted 
                ? '#1d4ed8' 
                : isImbalanced 
                  ? '#dc2626' 
                  : node.isRoot 
                    ? '#059669' 
                    : '#9ca3af'
            }
            strokeWidth={isHighlighted || isImbalanced ? 3 : 2}
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
          
          {/* Balance factor */}
          {showBalanceFactors && (
            <text
              x={position.x + NODE_RADIUS + 8}
              y={position.y - NODE_RADIUS + 8}
              textAnchor="middle"
              className={`text-xs font-bold pointer-events-none ${
                Math.abs(node.balanceFactor) > 1 ? 'fill-red-600' : 'fill-blue-600'
              }`}
            >
              {node.balanceFactor > 0 ? `+${node.balanceFactor}` : node.balanceFactor}
            </text>
          )}
          
          {/* Height indicator */}
          <text
            x={position.x - NODE_RADIUS - 8}
            y={position.y - NODE_RADIUS + 8}
            textAnchor="middle"
            className="text-xs font-medium fill-green-600 pointer-events-none"
          >
            h:{node.height}
          </text>
        </g>
      );
    });
  };

  // Check if tree is balanced
  const isTreeBalanced = () => {
    return Array.from(nodes.values()).every(node => Math.abs(node.balanceFactor) <= 1);
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
            disabled={isOperating}
          />
          <button
            onClick={handleInsert}
            disabled={nodes.size >= maxNodes || isOperating}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search</span>
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

      {/* AVL Properties */}
      <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium text-green-700 dark:text-green-300">AVL Property: </span>
            <span className={`font-semibold ${isTreeBalanced() ? 'text-green-600' : 'text-red-600'}`}>
              {isTreeBalanced() ? '✓ Balanced' : '✗ Imbalanced'}
            </span>
            {rotationAnimation && (
              <span className="ml-4 text-blue-600 dark:text-blue-400 animate-pulse">
                🔄 {rotationAnimation} rotation
              </span>
            )}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            Balance Factor ∈ [-1, 0, 1] for all nodes
          </div>
        </div>
      </div>

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
              <div className="text-4xl mb-2">⚖️</div>
              <p className="text-sm">Add nodes to build your AVL Tree</p>
              <p className="text-xs text-gray-400 mt-1">Watch automatic rebalancing maintain optimal height</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Root Node</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Search Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Imbalanced</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 font-bold">±2</span>
            <span>Balance Factor</span>
          </div>
        </div>
      </div>

      {/* Tree Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {nodes.size}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Nodes</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.max(...Array.from(nodes.values()).map(n => n.height), -1) + 1}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Actual Height</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {nodes.size > 0 ? Math.ceil(Math.log2(nodes.size + 1)) : 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Optimal Height</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {isTreeBalanced() ? '✓' : '✗'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Balanced</div>
        </div>
      </div>
    </div>
  );
};

export default AVLTreeVisualization;