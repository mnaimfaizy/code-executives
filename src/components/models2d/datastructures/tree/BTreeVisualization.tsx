import React, { useState, useCallback } from 'react';
import { Play, RotateCcw, Plus, Info } from 'lucide-react';

interface BTreeNode {
  keys: number[];
  children: BTreeNode[];
  isLeaf: boolean;
  level: number;
  x: number;
  y: number;
}

interface BTreeVisualizationProps {
  degree?: number;
  className?: string;
}

const BTreeVisualization: React.FC<BTreeVisualizationProps> = ({ degree = 3, className = '' }) => {
  const [root, setRoot] = useState<BTreeNode | null>(null);
  const [insertValue, setInsertValue] = useState<string>('');

  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedNode, setHighlightedNode] = useState<BTreeNode | null>(null);
  const [message, setMessage] = useState<string>('');
  const [showInfo, setShowInfo] = useState(false);

  // B-Tree properties
  const minKeys = degree - 1;
  const maxKeys = 2 * degree - 1;

  const createNode = (keys: number[] = [], isLeaf: boolean = true): BTreeNode => ({
    keys: [...keys],
    children: [],
    isLeaf,
    level: 0,
    x: 0,
    y: 0,
  });

  const calculatePositions = useCallback(
    (node: BTreeNode | null, x: number = 400, y: number = 50, level: number = 0): void => {
      if (!node) return;

      node.x = x;
      node.y = y;
      node.level = level;

      if (!node.isLeaf && node.children.length > 0) {
        const childSpacing = Math.max(120, 200 / Math.pow(2, level));
        const totalWidth = (node.children.length - 1) * childSpacing;
        const startX = x - totalWidth / 2;

        node.children.forEach((child, index) => {
          const childX = startX + index * childSpacing;
          calculatePositions(child, childX, y + 80, level + 1);
        });
      }
    },
    []
  );

  const splitChild = (parent: BTreeNode, index: number, fullChild: BTreeNode): BTreeNode => {
    const newChild = createNode([], fullChild.isLeaf);
    const midIndex = Math.floor(maxKeys / 2);

    // Move second half of keys to new node
    newChild.keys = fullChild.keys.splice(midIndex + 1);

    // Move second half of children if not leaf
    if (!fullChild.isLeaf) {
      newChild.children = fullChild.children.splice(midIndex + 1);
    }

    // Insert new child into parent
    parent.children.splice(index + 1, 0, newChild);

    // Move middle key up to parent
    const middleKey = fullChild.keys.splice(midIndex, 1)[0];
    parent.keys.splice(index, 0, middleKey);

    return parent;
  };

  const insertNonFull = (node: BTreeNode, key: number): void => {
    let i = node.keys.length - 1;

    if (node.isLeaf) {
      // Insert into leaf node
      node.keys.push(0);
      while (i >= 0 && node.keys[i] > key) {
        node.keys[i + 1] = node.keys[i];
        i--;
      }
      node.keys[i + 1] = key;
    } else {
      // Find child to insert into
      while (i >= 0 && node.keys[i] > key) {
        i--;
      }
      i++;

      // Check if child is full
      if (node.children[i].keys.length === maxKeys) {
        splitChild(node, i, node.children[i]);
        if (node.keys[i] < key) {
          i++;
        }
      }
      insertNonFull(node.children[i], key);
    }
  };

  const insert = useCallback(
    (key: number) => {
      setIsAnimating(true);
      setMessage(`Inserting ${key}...`);

      setTimeout(() => {
        if (!root) {
          const newRoot = createNode([key]);
          setRoot(newRoot);
          setMessage(`Created root with key ${key}`);
        } else {
          if (root.keys.length === maxKeys) {
            // Root is full, need to split
            const newRoot = createNode([], false);
            newRoot.children.push(root);
            splitChild(newRoot, 0, root);
            setRoot(newRoot);
            insertNonFull(newRoot, key);
          } else {
            insertNonFull(root, key);
          }
          setMessage(`Inserted ${key} into B-Tree`);
        }

        // Recalculate positions
        const newRoot = root;
        if (newRoot) {
          calculatePositions(newRoot);
          setRoot({ ...newRoot });
        }

        setIsAnimating(false);
      }, 500);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [root, maxKeys, calculatePositions]
  );

  const handleInsert = () => {
    const value = parseInt(insertValue);
    if (!isNaN(value)) {
      insert(value);
      setInsertValue('');
    }
  };

  const handleReset = () => {
    setRoot(null);
    setMessage('B-Tree reset');
    setHighlightedNode(null);
  };

  const initializeSample = () => {
    handleReset();
    setTimeout(() => {
      const sampleValues = [10, 20, 5, 6, 12, 30, 7, 17];
      sampleValues.forEach((value, index) => {
        setTimeout(() => insert(value), index * 600);
      });
    }, 100);
  };

  // Calculate tree positions when root changes
  React.useEffect(() => {
    if (root) {
      calculatePositions(root);
    }
  }, [root, calculatePositions]);

  const renderNode = (node: BTreeNode, index: number = 0) => {
    const nodeWidth = Math.max(80, node.keys.length * 30 + 20);
    const nodeHeight = 40;
    const isHighlighted = highlightedNode === node;

    return (
      <g key={`node-${node.x}-${node.y}-${index}`}>
        {/* Node rectangle */}
        <rect
          x={node.x - nodeWidth / 2}
          y={node.y - nodeHeight / 2}
          width={nodeWidth}
          height={nodeHeight}
          fill={isHighlighted ? '#3B82F6' : '#F3F4F6'}
          stroke={isHighlighted ? '#1E40AF' : '#9CA3AF'}
          strokeWidth="2"
          rx="8"
          className="transition-all duration-300"
        />

        {/* Keys */}
        {node.keys.map((key, keyIndex) => (
          <g key={`key-${keyIndex}`}>
            {/* Key separator lines */}
            {keyIndex > 0 && (
              <line
                x1={node.x - nodeWidth / 2 + (keyIndex * nodeWidth) / node.keys.length}
                y1={node.y - nodeHeight / 2}
                x2={node.x - nodeWidth / 2 + (keyIndex * nodeWidth) / node.keys.length}
                y2={node.y + nodeHeight / 2}
                stroke="#9CA3AF"
                strokeWidth="1"
              />
            )}

            {/* Key text */}
            <text
              x={node.x - nodeWidth / 2 + ((keyIndex + 0.5) * nodeWidth) / node.keys.length}
              y={node.y + 5}
              textAnchor="middle"
              className="text-sm font-medium fill-gray-800"
            >
              {key}
            </text>
          </g>
        ))}

        {/* Children connections */}
        {!node.isLeaf &&
          node.children.map((child, childIndex) => (
            <line
              key={`connection-${childIndex}`}
              x1={node.x}
              y1={node.y + nodeHeight / 2}
              x2={child.x}
              y2={child.y - nodeHeight / 2}
              stroke="#6B7280"
              strokeWidth="2"
              className="transition-all duration-300"
            />
          ))}
      </g>
    );
  };

  const renderTree = (node: BTreeNode | null): React.ReactElement[] => {
    if (!node) return [];

    const nodes = [renderNode(node)];

    // Render children
    if (!node.isLeaf) {
      node.children.forEach((child) => {
        nodes.push(...renderTree(child));
      });
    }

    return nodes;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-purple-600 rounded"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              B-Tree (Degree {degree})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Balanced multi-way search tree
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
            B-Tree Properties (Degree {degree}):
          </h4>
          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
            <li>• Min keys per node: {minKeys} (except root)</li>
            <li>• Max keys per node: {maxKeys}</li>
            <li>• All leaves at same level</li>
            <li>• Keys in sorted order within nodes</li>
            <li>• Used in databases and file systems</li>
          </ul>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={insertValue}
            onChange={(e) => setInsertValue(e.target.value)}
            placeholder="Insert value"
            className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
          />
          <button
            onClick={handleInsert}
            disabled={isAnimating || !insertValue}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Insert</span>
          </button>
        </div>

        <button
          onClick={initializeSample}
          disabled={isAnimating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Sample Data</span>
        </button>

        <button
          onClick={handleReset}
          disabled={isAnimating}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">{message}</p>
        </div>
      )}

      {/* Tree Visualization */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <svg viewBox="0 0 800 400" className="w-full h-96 bg-gray-50 dark:bg-gray-900">
          {/* Background pattern */}
          <defs>
            <pattern id="btree-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#btree-grid)" />

          {/* Tree */}
          {root && renderTree(root)}

          {/* Empty state */}
          {!root && (
            <text
              x="400"
              y="200"
              textAnchor="middle"
              className="text-lg fill-gray-400 dark:fill-gray-500"
            >
              Insert values to build the B-Tree
            </text>
          )}
        </svg>
      </div>

      {/* Properties Display */}
      {root && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="font-semibold text-gray-900 dark:text-white">Height</div>
            <div className="text-purple-600 dark:text-purple-400">
              {(() => {
                const getHeight = (node: BTreeNode | null): number => {
                  if (!node || node.isLeaf) return 1;
                  return 1 + Math.max(...node.children.map(getHeight));
                };
                return getHeight(root);
              })()}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="font-semibold text-gray-900 dark:text-white">Total Keys</div>
            <div className="text-purple-600 dark:text-purple-400">
              {(() => {
                const countKeys = (node: BTreeNode | null): number => {
                  if (!node) return 0;
                  return (
                    node.keys.length +
                    node.children.reduce((sum, child) => sum + countKeys(child), 0)
                  );
                };
                return countKeys(root);
              })()}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="font-semibold text-gray-900 dark:text-white">Nodes</div>
            <div className="text-purple-600 dark:text-purple-400">
              {(() => {
                const countNodes = (node: BTreeNode | null): number => {
                  if (!node) return 0;
                  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
                };
                return countNodes(root);
              })()}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="font-semibold text-gray-900 dark:text-white">Balanced</div>
            <div className="text-green-600 dark:text-green-400">✓ Always</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BTreeVisualization;
