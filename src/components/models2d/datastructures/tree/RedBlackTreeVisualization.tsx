import React, { useState, useCallback, useEffect } from 'react';
import { Plus, RotateCcw, Search, Palette } from 'lucide-react';
import type { TreeNode, BaseVisualizationProps } from '../../../../types/datastructures';

interface RBNode extends TreeNode {
  color: 'red' | 'black';
  isNIL?: boolean;
}

interface RBVisualizationProps extends BaseVisualizationProps {
  maxNodes?: number;
}

interface TreePosition {
  x: number;
  y: number;
}

const RedBlackTreeVisualization: React.FC<RBVisualizationProps> = ({
  maxNodes = 15,
  className = '',
  onOperationComplete,
}) => {
  const [nodes, setNodes] = useState<Map<string, RBNode>>(new Map());
  const [rootId, setRootId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, TreePosition>>(new Map());
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const [violationNodes, setViolationNodes] = useState<string[]>([]);
  const [isOperating, setIsOperating] = useState(false);

  // Constants for layout
  const SVG_WIDTH = 900;
  const SVG_HEIGHT = 600;
  const NODE_RADIUS = 25;
  const LEVEL_HEIGHT = 80;

  // Red-Black Tree Properties Check
  const checkRBProperties = useCallback(
    (nodeMap: Map<string, RBNode>, rootNodeId: string | null): string[] => {
      const violations: string[] = [];
      if (!rootNodeId) return violations;

      // Property 1: Root is black
      const rootNode = nodeMap.get(rootNodeId);
      if (rootNode?.color !== 'black') {
        violations.push(rootNodeId);
      }

      // Property 4: Red nodes have black children
      const checkRedNodeProperty = (nodeId: string) => {
        const node = nodeMap.get(nodeId);
        if (!node) return;

        if (node.color === 'red') {
          if (node.left) {
            const leftChild = nodeMap.get(node.left);
            if (leftChild?.color === 'red') {
              violations.push(nodeId);
            }
          }
          if (node.right) {
            const rightChild = nodeMap.get(node.right);
            if (rightChild?.color === 'red') {
              violations.push(nodeId);
            }
          }
        }

        if (node.left) checkRedNodeProperty(node.left);
        if (node.right) checkRedNodeProperty(node.right);
      };

      checkRedNodeProperty(rootNodeId);
      return violations;
    },
    []
  );

  // Left rotation
  const rotateLeft = useCallback(
    (nodeMap: Map<string, RBNode>, xId: string): [Map<string, RBNode>, string] => {
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

  // Right rotation
  const rotateRight = useCallback(
    (nodeMap: Map<string, RBNode>, yId: string): [Map<string, RBNode>, string] => {
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

  // Red-Black Tree insertion with fixup
  const insertRB = useCallback(
    (
      nodeMap: Map<string, RBNode>,
      rootNodeId: string | null,
      value: number
    ): [Map<string, RBNode>, string] => {
      // Create new node
      const newNodeId = `rb-${value}-${Date.now()}`;
      const newNode: RBNode = {
        id: newNodeId,
        value,
        level: 0,
        color: 'red', // New nodes are always red
        isRoot: rootNodeId === null,
      };

      if (rootNodeId === null) {
        newNode.color = 'black'; // Root is always black
        nodeMap.set(newNodeId, newNode);
        return [nodeMap, newNodeId];
      }

      // Standard BST insertion
      let currentId: string | null = rootNodeId;
      let parentId: string | null = null;

      while (currentId) {
        const current: RBNode = nodeMap.get(currentId)!;
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

      // Fix Red-Black Tree properties
      let currentRoot = rootNodeId;
      let current = newNodeId;

      while (current !== currentRoot) {
        const node = nodeMap.get(current)!;
        const parentNode = node.parent ? nodeMap.get(node.parent) : null;

        if (!parentNode || parentNode.color === 'black') {
          break;
        }

        const grandparentId = parentNode.parent;
        if (!grandparentId) {
          parentNode.color = 'black';
          break;
        }

        const grandparent = nodeMap.get(grandparentId)!;

        if (parentNode.id === grandparent.left) {
          // Parent is left child of grandparent
          const uncleId = grandparent.right;
          const uncle = uncleId ? nodeMap.get(uncleId) : null;

          if (uncle && uncle.color === 'red') {
            // Case 1: Uncle is red
            parentNode.color = 'black';
            uncle.color = 'black';
            grandparent.color = 'red';
            current = grandparentId;
          } else {
            // Case 2 & 3: Uncle is black
            if (current === parentNode.right) {
              // Case 2: Node is right child
              current = parentNode.id;
              const [newMap] = rotateLeft(nodeMap, current);
              nodeMap = newMap;
              const updatedNode = nodeMap.get(current)!;
              const updatedParent = updatedNode.parent ? nodeMap.get(updatedNode.parent) : null;
              if (updatedParent) {
                current = updatedParent.id;
              }
            }

            // Case 3: Node is left child
            const currentNode = nodeMap.get(current)!;
            const currentParent = currentNode.parent ? nodeMap.get(currentNode.parent) : null;
            const currentGrandparent = currentParent?.parent
              ? nodeMap.get(currentParent.parent)
              : null;

            if (currentParent && currentGrandparent) {
              currentParent.color = 'black';
              currentGrandparent.color = 'red';

              const [newMap, newRoot] = rotateRight(nodeMap, currentGrandparent.id);
              nodeMap = newMap;

              if (currentGrandparent.id === currentRoot) {
                currentRoot = newRoot;
              }
            }
            break;
          }
        } else {
          // Parent is right child of grandparent (symmetric cases)
          const uncleId = grandparent.left;
          const uncle = uncleId ? nodeMap.get(uncleId) : null;

          if (uncle && uncle.color === 'red') {
            // Case 1: Uncle is red
            parentNode.color = 'black';
            uncle.color = 'black';
            grandparent.color = 'red';
            current = grandparentId;
          } else {
            // Case 2 & 3: Uncle is black
            if (current === parentNode.left) {
              // Case 2: Node is left child
              current = parentNode.id;
              const [newMap] = rotateRight(nodeMap, current);
              nodeMap = newMap;
              const updatedNode = nodeMap.get(current)!;
              const updatedParent = updatedNode.parent ? nodeMap.get(updatedNode.parent) : null;
              if (updatedParent) {
                current = updatedParent.id;
              }
            }

            // Case 3: Node is right child
            const currentNode = nodeMap.get(current)!;
            const currentParent = currentNode.parent ? nodeMap.get(currentNode.parent) : null;
            const currentGrandparent = currentParent?.parent
              ? nodeMap.get(currentParent.parent)
              : null;

            if (currentParent && currentGrandparent) {
              currentParent.color = 'black';
              currentGrandparent.color = 'red';

              const [newMap, newRoot] = rotateLeft(nodeMap, currentGrandparent.id);
              nodeMap = newMap;

              if (currentGrandparent.id === currentRoot) {
                currentRoot = newRoot;
              }
            }
            break;
          }
        }
      }

      // Ensure root is black
      const finalRoot = nodeMap.get(currentRoot)!;
      finalRoot.color = 'black';

      return [nodeMap, currentRoot];
    },
    [rotateLeft, rotateRight]
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

    // Check for violations
    const violations = checkRBProperties(nodes, rootId);
    setViolationNodes(violations);
  }, [nodes, rootId, calculatePositions, checkRBProperties]);

  // Handle insertion
  const handleInsert = useCallback(() => {
    if (!inputValue.trim() || isOperating) return;

    const numValue = parseInt(inputValue);
    if (isNaN(numValue)) return;

    setIsOperating(true);

    const [newNodes, newRootId] = insertRB(new Map(nodes), rootId, numValue);
    setNodes(newNodes);
    setRootId(newRootId);
    setInputValue('');

    setTimeout(() => setIsOperating(false), 1500);

    onOperationComplete?.({
      type: 'insert',
      target: numValue,
      description: `Inserted ${numValue} into Red-Black tree with property preservation`,
      complexity: { time: 'O(log n)', space: 'O(1)' },
    });
  }, [inputValue, nodes, rootId, insertRB, isOperating, onOperationComplete]);

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
    setViolationNodes([]);
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
      const hasViolation = violationNodes.includes(node.id);

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
                : hasViolation
                  ? '#f59e0b'
                  : node.color === 'red'
                    ? '#ef4444'
                    : '#1f2937'
            }
            stroke={
              isHighlighted
                ? '#1d4ed8'
                : hasViolation
                  ? '#d97706'
                  : node.color === 'red'
                    ? '#dc2626'
                    : '#111827'
            }
            strokeWidth={isHighlighted || hasViolation ? 3 : 2}
            className="cursor-pointer hover:opacity-80 transition-colors"
          />

          {/* Node value */}
          <text
            x={position.x}
            y={position.y + 4}
            textAnchor="middle"
            className={`text-sm font-medium pointer-events-none ${
              node.color === 'red' ? 'fill-white' : 'fill-white'
            }`}
          >
            {node.value}
          </text>

          {/* Color indicator */}
          <circle
            cx={position.x + NODE_RADIUS + 8}
            cy={position.y - NODE_RADIUS + 8}
            r={6}
            fill={node.color === 'red' ? '#ef4444' : '#1f2937'}
            stroke={node.color === 'red' ? '#dc2626' : '#111827'}
            strokeWidth={1}
            className="pointer-events-none"
          />

          {/* Violation indicator */}
          {hasViolation && (
            <text
              x={position.x}
              y={position.y - NODE_RADIUS - 8}
              textAnchor="middle"
              className="text-xs font-bold fill-yellow-600 pointer-events-none"
            >
              ⚠️
            </text>
          )}
        </g>
      );
    });
  };

  // Check if tree follows Red-Black properties
  const isValidRBTree = () => {
    return violationNodes.length === 0;
  };

  return (
    <div className={`rb-tree-visualization ${className}`}>
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
            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
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

      {/* Red-Black Properties */}
      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium text-red-700 dark:text-red-300">RB Properties: </span>
            <span
              className={`font-semibold ${isValidRBTree() ? 'text-green-600' : 'text-red-600'}`}
            >
              {isValidRBTree() ? '✓ Valid' : '✗ Violations Found'}
            </span>
            {violationNodes.length > 0 && (
              <span className="ml-2 text-xs text-yellow-600">
                ⚠️ {violationNodes.length} violation(s)
              </span>
            )}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">
            Root=Black, Red→Black children, Equal black heights
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
              <div className="text-4xl mb-2">🔴⚫</div>
              <p className="text-sm">Add nodes to build your Red-Black Tree</p>
              <p className="text-xs text-gray-400 mt-1">
                Watch automatic recoloring and rotations maintain balance
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
          <Palette className="w-4 h-4 mr-2" />
          Legend
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Red Node</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
            <span>Black Node</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Search Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Property Violation</span>
          </div>
        </div>
      </div>

      {/* Red-Black Properties Reference */}
      <div className="mt-4 bg-gradient-to-br from-red-50 to-gray-50 dark:from-red-900/20 dark:to-gray-900/20 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Red-Black Tree Properties
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
          <div>1. Every node is either red or black</div>
          <div>2. Root is always black</div>
          <div>3. All leaves (NIL) are black</div>
          <div>4. Red nodes have black children</div>
          <div className="md:col-span-2">
            5. All paths from node to leaves have equal black height
          </div>
        </div>
      </div>

      {/* Tree Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{nodes.size}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Nodes</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {Array.from(nodes.values()).filter((n) => n.color === 'red').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Red Nodes</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {Array.from(nodes.values()).filter((n) => n.color === 'black').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Black Nodes</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.max(...Array.from(nodes.values()).map((n) => n.level), -1) + 1}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Height</div>
        </div>
      </div>
    </div>
  );
};

export default RedBlackTreeVisualization;
