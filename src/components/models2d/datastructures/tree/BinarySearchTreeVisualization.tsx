import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Search, Trash2, RotateCcw, SkipForward } from 'lucide-react';
import type { TreeNode, BaseVisualizationProps } from '../../../../types/datastructures';

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
  onOperationComplete
}) => {
  const [nodes, setNodes] = useState<Map<string, TreeNode>>(new Map());
  const [rootId, setRootId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, TreePosition>>(new Map());
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [deleteValue, setDeleteValue] = useState('');
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Constants for layout
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 500;
  const NODE_RADIUS = 20;
  const LEVEL_HEIGHT = 60;

  // Calculate positions for all nodes
  const calculatePositions = useCallback((rootNodeId: string | null) => {
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
  }, [nodes, SVG_WIDTH, LEVEL_HEIGHT]);

  // Update positions when nodes change
  useEffect(() => {
    const newPositions = calculatePositions(rootId);
    setNodePositions(newPositions);
  }, [nodes, rootId, calculatePositions]);

  // BST Insert operation
  const handleInsert = useCallback(() => {
    if (!inputValue.trim()) return;

    const numValue = parseInt(inputValue);
    if (isNaN(numValue)) return;

    // Check if value already exists
    const existingNode = Array.from(nodes.values()).find(n => n.value === numValue);
    if (existingNode) {
      alert('Value already exists in BST!');
      return;
    }

    const newNodeId = `node-${numValue}-${Date.now()}`;
    const newNode: TreeNode = {
      id: newNodeId,
      value: numValue,
      level: 0,
      isRoot: rootId === null
    };

    if (rootId === null) {
      // First node becomes root
      newNode.level = 0;
      newNode.isRoot = true;
      setNodes(new Map([[newNodeId, newNode]]));
      setRootId(newNodeId);
    } else {
      // BST insertion logic
      const newNodes = new Map(nodes);
      let currentId = rootId;
      let inserted = false;

      while (!inserted) {
        const current = newNodes.get(currentId)!;
        
        if (numValue < (current.value as number)) {
          // Go left
          if (!current.left) {
            newNode.level = current.level + 1;
            newNode.parent = currentId;
            current.left = newNodeId;
            inserted = true;
          } else {
            currentId = current.left;
          }
        } else {
          // Go right
          if (!current.right) {
            newNode.level = current.level + 1;
            newNode.parent = currentId;
            current.right = newNodeId;
            inserted = true;
          } else {
            currentId = current.right;
          }
        }
      }

      newNodes.set(newNodeId, newNode);
      setNodes(newNodes);
    }

    setInputValue('');
    
    onOperationComplete?.({
      type: 'insert',
      target: numValue,
      description: `Inserted ${numValue} into BST`,
      complexity: { time: 'O(log n) avg, O(n) worst', space: 'O(1)' }
    });
  }, [inputValue, nodes, rootId, onOperationComplete]);

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
      complexity: { time: 'O(log n) avg, O(n) worst', space: 'O(1)' }
    });
  }, [searchValue, rootId, nodes, onOperationComplete]);

  // BST Delete operation (simplified)
  const handleDelete = useCallback(() => {
    if (!deleteValue.trim() || !rootId) return;
    
    const numValue = parseInt(deleteValue);
    if (isNaN(numValue)) return;

    // Find the node to delete
    const nodeToDelete = Array.from(nodes.values()).find(n => n.value === numValue);
    if (!nodeToDelete) return;

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
      setDeleteValue('');
      return;
    }

    newNodes.delete(nodeToDelete.id);
    setNodes(newNodes);
    setDeleteValue('');

    onOperationComplete?.({
      type: 'delete',
      target: numValue,
      description: `Deleted ${numValue} from BST`,
      complexity: { time: 'O(log n) avg, O(n) worst', space: 'O(1)' }
    });
  }, [deleteValue, rootId, nodes, onOperationComplete]);

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

  // Render tree nodes
  const renderNodes = () => {
    return Array.from(nodes.values()).map((node) => {
      const position = nodePositions.get(node.id);
      if (!position) return null;

      const isHighlighted = searchPath.includes(node.id);
      const searchIndex = searchPath.indexOf(node.id);

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
          {isHighlighted && searchIndex >= 0 && (
            <text
              x={position.x}
              y={position.y - NODE_RADIUS - 8}
              textAnchor="middle"
              className="text-xs font-bold fill-blue-600"
            >
              {searchIndex + 1}
            </text>
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
          />
          <button
            onClick={handleInsert}
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
            placeholder="Value to search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
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

      {/* BST Properties */}
      <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium text-green-700 dark:text-green-300">BST Property: </span>
            <span className={`font-semibold ${isValidBST() ? 'text-green-600' : 'text-red-600'}`}>
              {isValidBST() ? '✓ Valid' : '✗ Invalid'}
            </span>
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            Left subtree &lt; Node &lt; Right subtree
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
              <div className="text-4xl mb-2">🌲</div>
              <p className="text-sm">Add nodes to build your Binary Search Tree</p>
              <p className="text-xs text-gray-400 mt-1">Values are automatically placed according to BST rules</p>
            </div>
          </div>
        )}
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
            {Math.max(...Array.from(nodes.values()).map(n => n.level), -1) + 1}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Height</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {Array.from(nodes.values()).filter(n => !n.left && !n.right).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Leaf Nodes</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {nodes.size > 0 ? Math.ceil(Math.log2(nodes.size + 1)) : 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Optimal Height</div>
        </div>
      </div>
    </div>
  );
};

export default BinarySearchTreeVisualization;