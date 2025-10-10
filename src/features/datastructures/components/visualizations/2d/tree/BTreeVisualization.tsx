import React, { useState, useCallback } from 'react';
import { Play, RotateCcw, Plus, Info, Search, Trash2 } from 'lucide-react';

interface BTreeNode {
  keys: number[];
  children: BTreeNode[];
  isLeaf: boolean;
  level: number;
  x: number;
  y: number;
  id?: string;
}

type AnimationState =
  | 'inserting'
  | 'splitting'
  | 'promoting'
  | 'searching'
  | 'found'
  | 'deleting'
  | 'borrowing'
  | 'merging'
  | null;

interface BTreeVisualizationProps {
  degree?: number;
  className?: string;
}

const BTreeVisualization: React.FC<BTreeVisualizationProps> = ({ degree = 3, className = '' }) => {
  const [root, setRoot] = useState<BTreeNode | null>(null);
  const [insertValue, setInsertValue] = useState<string>('');
  const [deleteValue, setDeleteValue] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');

  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedNode, setHighlightedNode] = useState<BTreeNode | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>(null);
  // const [highlightedKeys, setHighlightedKeys] = useState<Set<number>>(new Set());
  const [searchPath, setSearchPath] = useState<BTreeNode[]>([]);
  const [foundNode, setFoundNode] = useState<BTreeNode | null>(null);
  const [message, setMessage] = useState<string>('');
  const [showInfo, setShowInfo] = useState(false);

  // Canvas dimensions
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 600;
  const LEVEL_HEIGHT = 120;

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
    id: Math.random().toString(36).substr(2, 9),
  });

  const calculatePositions = useCallback(
    (
      node: BTreeNode | null,
      x: number = CANVAS_WIDTH / 2,
      y: number = 60,
      level: number = 0
    ): void => {
      if (!node) return;

      node.x = x;
      node.y = y;
      node.level = level;

      if (!node.isLeaf && node.children.length > 0) {
        const childSpacing = Math.max(150, 400 / Math.pow(2, level));
        const totalWidth = (node.children.length - 1) * childSpacing;
        const startX = x - totalWidth / 2;

        node.children.forEach((child, index) => {
          const childX = startX + index * childSpacing;
          calculatePositions(child, childX, y + LEVEL_HEIGHT, level + 1);
        });
      }
    },
    [CANVAS_WIDTH, LEVEL_HEIGHT]
  );

  const splitChild = useCallback(
    (parent: BTreeNode, index: number, fullChild: BTreeNode): BTreeNode => {
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
    },
    [maxKeys]
  );

  const insertNonFull = useCallback(
    (node: BTreeNode, key: number): void => {
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
    },
    [maxKeys, splitChild]
  );

  const insert = useCallback(
    (key: number) => {
      setIsAnimating(true);
      setAnimationState('inserting');
      setMessage(`Inserting ${key}...`);

      setTimeout(() => {
        let newRoot: BTreeNode;

        if (!root) {
          newRoot = createNode([key]);
          setMessage(`Created root with key ${key}`);
        } else {
          if (root.keys.length === maxKeys) {
            // Root is full, need to split
            setAnimationState('splitting');
            newRoot = createNode([], false);
            newRoot.children.push(root);
            splitChild(newRoot, 0, root);
            insertNonFull(newRoot, key);
            setMessage(`Split root and inserted ${key}`);
          } else {
            newRoot = root;
            insertNonFull(newRoot, key);
            setMessage(`Inserted ${key} into B-Tree`);
          }
        }

        // Recalculate positions and update state
        calculatePositions(newRoot);
        setRoot({ ...newRoot });
        setAnimationState(null);
        setIsAnimating(false);
      }, 500);
    },
    [root, maxKeys, calculatePositions, insertNonFull, splitChild]
  );

  const search = useCallback(
    (key: number) => {
      if (!root) {
        setMessage('Tree is empty');
        return;
      }

      setIsAnimating(true);
      setAnimationState('searching');
      setSearchPath([]);
      setFoundNode(null);
      setMessage(`Searching for ${key}...`);

      const path: BTreeNode[] = [];
      const current: BTreeNode | null = root;

      const searchStep = (node: BTreeNode | null, step: number) => {
        if (!node) {
          setMessage(`Key ${key} not found`);
          setSearchPath([]);
          setAnimationState(null);
          setIsAnimating(false);
          return;
        }

        setTimeout(() => {
          path.push(node);
          setSearchPath([...path]);

          // Check if key is in current node
          if (node.keys.includes(key)) {
            setFoundNode(node);
            setAnimationState('found');
            setMessage(`Found ${key}!`);
            setTimeout(() => {
              setSearchPath([]);
              setFoundNode(null);
              setAnimationState(null);
              setIsAnimating(false);
            }, 2000);
            return;
          }

          // Find child to search
          if (node.isLeaf) {
            setMessage(`Key ${key} not found`);
            setTimeout(() => {
              setSearchPath([]);
              setAnimationState(null);
              setIsAnimating(false);
            }, 1500);
            return;
          }

          let i = 0;
          while (i < node.keys.length && key > node.keys[i]) {
            i++;
          }

          if (i < node.children.length) {
            searchStep(node.children[i], step + 1);
          } else {
            setMessage(`Key ${key} not found`);
            setTimeout(() => {
              setSearchPath([]);
              setAnimationState(null);
              setIsAnimating(false);
            }, 1500);
          }
        }, step * 600);
      };

      searchStep(current, 0);
    },
    [root]
  );

  // Deletion helper functions
  const findKey = (node: BTreeNode, key: number): number => {
    let idx = 0;
    while (idx < node.keys.length && node.keys[idx] < key) {
      idx++;
    }
    return idx;
  };

  const merge = useCallback((node: BTreeNode, idx: number): void => {
    const child = node.children[idx];
    const sibling = node.children[idx + 1];

    // Pull key from current node and merge with right sibling
    child.keys.push(node.keys[idx]);

    // Copy keys from sibling to child
    child.keys = [...child.keys, ...sibling.keys];

    // Copy child pointers from sibling to child
    if (!child.isLeaf) {
      child.children = [...child.children, ...sibling.children];
    }

    // Remove key from current node
    node.keys.splice(idx, 1);

    // Remove sibling
    node.children.splice(idx + 1, 1);
  }, []);

  const borrowFromPrev = (node: BTreeNode, idx: number): void => {
    const child = node.children[idx];
    const sibling = node.children[idx - 1];

    // Move a key from parent to child
    child.keys.unshift(node.keys[idx - 1]);

    // Move a key from sibling to parent
    node.keys[idx - 1] = sibling.keys.pop()!;

    // Move child pointer if not leaf
    if (!child.isLeaf) {
      child.children.unshift(sibling.children.pop()!);
    }
  };

  const borrowFromNext = (node: BTreeNode, idx: number): void => {
    const child = node.children[idx];
    const sibling = node.children[idx + 1];

    // Move a key from parent to child
    child.keys.push(node.keys[idx]);

    // Move a key from sibling to parent
    node.keys[idx] = sibling.keys.shift()!;

    // Move child pointer if not leaf
    if (!child.isLeaf) {
      child.children.push(sibling.children.shift()!);
    }
  };

  const fill = useCallback(
    (node: BTreeNode, idx: number): void => {
      // If previous sibling has more than minKeys, borrow from it
      if (idx !== 0 && node.children[idx - 1].keys.length > minKeys) {
        borrowFromPrev(node, idx);
      }
      // If next sibling has more than minKeys, borrow from it
      else if (idx !== node.children.length - 1 && node.children[idx + 1].keys.length > minKeys) {
        borrowFromNext(node, idx);
      }
      // Merge with sibling
      else {
        if (idx !== node.children.length - 1) {
          merge(node, idx);
        } else {
          merge(node, idx - 1);
        }
      }
    },
    [minKeys, merge]
  );

  const removeFromLeaf = (node: BTreeNode, idx: number): void => {
    node.keys.splice(idx, 1);
  };

  const getPredecessor = (node: BTreeNode, idx: number): number => {
    let current = node.children[idx];
    while (!current.isLeaf) {
      current = current.children[current.children.length - 1];
    }
    return current.keys[current.keys.length - 1];
  };

  const getSuccessor = (node: BTreeNode, idx: number): number => {
    let current = node.children[idx + 1];
    while (!current.isLeaf) {
      current = current.children[0];
    }
    return current.keys[0];
  };

  const removeFromNonLeaf = useCallback(
    (node: BTreeNode, idx: number): void => {
      const key = node.keys[idx];

      if (node.children[idx].keys.length > minKeys) {
        const predecessor = getPredecessor(node, idx);
        node.keys[idx] = predecessor;
        deleteKey(node.children[idx], predecessor);
      } else if (node.children[idx + 1].keys.length > minKeys) {
        const successor = getSuccessor(node, idx);
        node.keys[idx] = successor;
        deleteKey(node.children[idx + 1], successor);
      } else {
        merge(node, idx);
        deleteKey(node.children[idx], key);
      }
    },
    [minKeys, merge]
  );

  const deleteKey = useCallback(
    (node: BTreeNode, key: number): void => {
      const idx = findKey(node, key);

      if (idx < node.keys.length && node.keys[idx] === key) {
        // Key found in this node
        if (node.isLeaf) {
          removeFromLeaf(node, idx);
        } else {
          removeFromNonLeaf(node, idx);
        }
      } else {
        // Key not in this node
        if (node.isLeaf) {
          return; // Key not in tree
        }

        const isInLastChild = idx === node.keys.length;

        // If child has only minKeys keys, fill it first
        if (node.children[idx].keys.length <= minKeys) {
          fill(node, idx);
        }

        // After fill, the key might have moved
        if (isInLastChild && idx > node.keys.length) {
          deleteKey(node.children[idx - 1], key);
        } else {
          deleteKey(node.children[idx], key);
        }
      }
    },
    [minKeys, fill, removeFromNonLeaf]
  );

  const deleteFromTree = useCallback(
    (key: number) => {
      if (!root) {
        setMessage('Tree is empty');
        return;
      }

      setIsAnimating(true);
      setAnimationState('deleting');
      setMessage(`Deleting ${key}...`);

      setTimeout(() => {
        const newRoot = { ...root };

        // Deep clone the tree to avoid mutation issues
        const cloneNode = (node: BTreeNode): BTreeNode => ({
          ...node,
          keys: [...node.keys],
          children: node.children.map(cloneNode),
        });

        const clonedRoot = cloneNode(newRoot);

        try {
          deleteKey(clonedRoot, key);

          // If root is empty after deletion, make its only child the new root
          let finalRoot: BTreeNode | null = clonedRoot;
          if (clonedRoot.keys.length === 0) {
            if (!clonedRoot.isLeaf && clonedRoot.children.length > 0) {
              finalRoot = clonedRoot.children[0];
              setMessage(`Deleted ${key} and updated root`);
            } else {
              finalRoot = null;
              setMessage(`Deleted ${key}, tree is now empty`);
            }
          } else {
            setMessage(`Deleted ${key} from B-Tree`);
          }

          if (finalRoot) {
            calculatePositions(finalRoot);
          }
          setRoot(finalRoot ? { ...finalRoot } : null);
        } catch {
          setMessage(`Key ${key} not found in tree`);
        }

        setAnimationState(null);
        setIsAnimating(false);
      }, 500);
    },
    [root, calculatePositions, deleteKey]
  );

  const handleSearch = () => {
    const value = parseInt(searchValue);
    if (!isNaN(value)) {
      search(value);
      setSearchValue('');
    }
  };

  const handleInsert = () => {
    const value = parseInt(insertValue);
    if (!isNaN(value)) {
      insert(value);
      setInsertValue('');
    }
  };

  const handleDelete = () => {
    const value = parseInt(deleteValue);
    if (!isNaN(value)) {
      deleteFromTree(value);
      setDeleteValue('');
    }
  };

  const handleReset = () => {
    setRoot(null);
    setMessage('B-Tree reset');
    setHighlightedNode(null);
    setSearchPath([]);
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

  const renderNode = (node: BTreeNode, index: number = 0) => {
    const nodeWidth = Math.max(100, node.keys.length * 40 + 30);
    const nodeHeight = 50;
    const isHighlighted = highlightedNode === node;
    const isInSearchPath = searchPath.includes(node);
    const isFoundNode = foundNode === node;
    const isRoot = node === root;

    // Determine node color based on state
    let fillColor = 'url(#node-gradient)';
    let strokeColor = '#9CA3AF';
    let glowColor = 'none';

    if (isFoundNode) {
      fillColor = 'url(#found-gradient)';
      strokeColor = '#F59E0B';
      glowColor = '#F59E0B';
    } else if (isRoot) {
      fillColor = 'url(#root-gradient)';
      strokeColor = '#9333EA';
      glowColor = '#9333EA';
    } else if (isHighlighted) {
      fillColor = 'url(#highlight-gradient)';
      strokeColor = '#A855F7';
      glowColor = '#A855F7';
    } else if (isInSearchPath) {
      fillColor = 'url(#search-gradient)';
      strokeColor = '#10B981';
      glowColor = '#10B981';
    }

    return (
      <g key={`node-${node.x}-${node.y}-${index}`}>
        {/* Glow effect */}
        {glowColor !== 'none' && (
          <rect
            x={node.x - nodeWidth / 2 - 4}
            y={node.y - nodeHeight / 2 - 4}
            width={nodeWidth + 8}
            height={nodeHeight + 8}
            fill="none"
            stroke={glowColor}
            strokeWidth="2"
            opacity="0.3"
            rx="12"
            className="animate-pulse"
          />
        )}

        {/* Shadow */}
        <rect
          x={node.x - nodeWidth / 2 + 2}
          y={node.y - nodeHeight / 2 + 2}
          width={nodeWidth}
          height={nodeHeight}
          fill="black"
          opacity="0.1"
          rx="10"
        />

        {/* Node rectangle */}
        <rect
          x={node.x - nodeWidth / 2}
          y={node.y - nodeHeight / 2}
          width={nodeWidth}
          height={nodeHeight}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2.5"
          rx="10"
          className="transition-all duration-300"
        />

        {/* Keys */}
        {node.keys.map((key, keyIndex) => (
          <g key={`key-${keyIndex}`}>
            {/* Key separator lines */}
            {keyIndex > 0 && (
              <line
                x1={node.x - nodeWidth / 2 + (keyIndex * nodeWidth) / node.keys.length}
                y1={node.y - nodeHeight / 2 + 5}
                x2={node.x - nodeWidth / 2 + (keyIndex * nodeWidth) / node.keys.length}
                y2={node.y + nodeHeight / 2 - 5}
                stroke="#D1D5DB"
                strokeWidth="1.5"
                opacity="0.6"
              />
            )}

            {/* Key text */}
            <text
              x={node.x - nodeWidth / 2 + ((keyIndex + 0.5) * nodeWidth) / node.keys.length}
              y={node.y + 6}
              textAnchor="middle"
              className="text-base font-bold"
              fill={
                isRoot || isHighlighted || isInSearchPath || isFoundNode ? '#FFFFFF' : '#1F2937'
              }
            >
              {key}
            </text>
          </g>
        ))}
      </g>
    );
  };

  const renderEdges = (node: BTreeNode): React.ReactElement[] => {
    const edges: React.ReactElement[] = [];
    const nodeHeight = 50;

    if (!node.isLeaf && node.children.length > 0) {
      node.children.forEach((child, childIndex) => {
        edges.push(
          <g key={`edge-${node.x}-${node.y}-${childIndex}`}>
            {/* Shadow for edge */}
            <line
              x1={node.x}
              y1={node.y + nodeHeight / 2 + 1}
              x2={child.x}
              y2={child.y - nodeHeight / 2 + 1}
              stroke="black"
              strokeWidth="2.5"
              opacity="0.1"
            />
            {/* Edge */}
            <line
              x1={node.x}
              y1={node.y + nodeHeight / 2}
              x2={child.x}
              y2={child.y - nodeHeight / 2}
              stroke="#6B7280"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </g>
        );
      });
    }

    return edges;
  };

  const renderTree = (node: BTreeNode | null): React.ReactElement[] => {
    if (!node) return [];

    const elements: React.ReactElement[] = [];

    // First render all edges (so they appear behind nodes)
    const edges = renderEdges(node);
    elements.push(...edges);

    // Render children edges recursively
    if (!node.isLeaf) {
      node.children.forEach((child) => {
        elements.push(...renderTree(child));
      });
    }

    // Finally render the node itself (so it appears on top)
    elements.push(renderNode(node));

    return elements;
  };

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-purple-600 rounded"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">B-Tree (Degree {degree})</h3>
            <p className="text-sm text-gray-600">Balanced multi-way search tree</p>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2">
            B-Tree Properties (Degree {degree}):
          </h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Min keys per node: {minKeys} (except root)</li>
            <li>• Max keys per node: {maxKeys}</li>
            <li>• All leaves at same level</li>
            <li>• Keys in sorted order within nodes</li>
            <li>• Used in databases and file systems</li>
          </ul>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={insertValue}
            onChange={(e) => setInsertValue(e.target.value)}
            placeholder="Insert value"
            className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm
                     bg-white text-gray-900
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
          />
          <button
            onClick={handleInsert}
            disabled={isAnimating || !insertValue}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg 
                     hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Insert</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={deleteValue}
            onChange={(e) => setDeleteValue(e.target.value)}
            placeholder="Delete value"
            className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm
                     bg-white text-gray-900
                     focus:ring-2 focus:ring-red-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleDelete()}
          />
          <button
            onClick={handleDelete}
            disabled={isAnimating || !deleteValue || !root}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg 
                     hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <Trash2 className="w-4 h-4" />
            <span className="font-medium">Delete</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search value"
            className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm
                     bg-white text-gray-900
                     focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isAnimating || !searchValue || !root}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg 
                     hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Search className="w-4 h-4" />
            <span className="font-medium">Search</span>
          </button>
        </div>

        <button
          onClick={initializeSample}
          disabled={isAnimating}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg 
                   hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed 
                   transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Play className="w-4 h-4" />
          <span className="font-medium">Sample Data</span>
        </button>

        <button
          onClick={handleReset}
          disabled={isAnimating}
          className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg 
                   hover:from-gray-700 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed 
                   transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg
                   focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="font-medium">Reset</span>
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg border ${
            animationState === 'found'
              ? 'bg-amber-50 border-amber-200'
              : animationState === 'searching'
                ? 'bg-green-50 border-green-200'
                : animationState === 'deleting'
                  ? 'bg-red-50 border-red-200'
                  : animationState === 'borrowing'
                    ? 'bg-amber-50 border-amber-200'
                    : animationState === 'merging'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-blue-50 border-blue-200'
          }`}
        >
          <p
            className={`text-sm font-medium ${
              animationState === 'found'
                ? 'text-amber-800'
                : animationState === 'searching'
                  ? 'text-green-800'
                  : animationState === 'deleting'
                    ? 'text-red-800'
                    : animationState === 'borrowing'
                      ? 'text-amber-800'
                      : animationState === 'merging'
                        ? 'text-orange-800'
                        : 'text-blue-800'
            }`}
          >
            {message}
          </p>
        </div>
      )}

      {/* Tree Visualization */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
        <svg
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="w-full bg-gradient-to-br from-gray-50 to-white"
        >
          {/* Gradient definitions */}
          <defs>
            {/* Background pattern */}
            <pattern id="btree-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="0.5"
                opacity="0.2"
              />
            </pattern>

            {/* Node gradients */}
            <linearGradient id="root-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>

            <linearGradient id="node-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F3F4F6" />
            </linearGradient>

            <linearGradient id="highlight-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>

            <linearGradient id="search-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <linearGradient id="found-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="delete-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>

            <linearGradient id="borrow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            <linearGradient id="merge-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#btree-grid)" />

          {/* Tree */}
          {root && renderTree(root)}

          {/* Empty state */}
          {!root && (
            <g>
              <rect
                x={CANVAS_WIDTH / 2 - 200}
                y={CANVAS_HEIGHT / 2 - 80}
                width="400"
                height="160"
                fill="white"
                fillOpacity="0.8"
                stroke="url(#root-gradient)"
                strokeWidth="2"
                rx="16"
                className="backdrop-blur-sm"
              />
              <text
                x={CANVAS_WIDTH / 2}
                y={CANVAS_HEIGHT / 2 - 30}
                textAnchor="middle"
                className="text-4xl"
              >
                🌳
              </text>
              <text
                x={CANVAS_WIDTH / 2}
                y={CANVAS_HEIGHT / 2 + 15}
                textAnchor="middle"
                className="text-xl font-bold fill-purple-600"
              >
                Build Your B-Tree
              </text>
              <text
                x={CANVAS_WIDTH / 2}
                y={CANVAS_HEIGHT / 2 + 45}
                textAnchor="middle"
                className="text-sm fill-gray-600"
              >
                Insert values to see multi-way tree structure
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🎨</span>
          Node States Legend
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-16 h-10 rounded-lg"
              style={{ background: 'linear-gradient(to bottom, #9333EA, #7C3AED)' }}
            ></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Root Node</div>
              <div className="text-xs text-gray-600">Tree root</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-16 h-10 bg-white rounded-lg border-2 border-gray-400"></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Regular Node</div>
              <div className="text-xs text-gray-600">Normal node</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className="w-16 h-10 rounded-lg"
              style={{ background: 'linear-gradient(to bottom, #A855F7, #9333EA)' }}
            ></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Inserting</div>
              <div className="text-xs text-gray-600">During insert</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className="w-16 h-10 rounded-lg"
              style={{ background: 'linear-gradient(to bottom, #10B981, #059669)' }}
            ></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Searching</div>
              <div className="text-xs text-gray-600">Search path</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className="w-16 h-10 rounded-lg"
              style={{ background: 'linear-gradient(to bottom, #F59E0B, #D97706)' }}
            ></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Found</div>
              <div className="text-xs text-gray-600">Target found</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className="w-16 h-10 rounded-lg"
              style={{ background: 'linear-gradient(to bottom, #EF4444, #DC2626)' }}
            ></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Deleting</div>
              <div className="text-xs text-gray-600">Being removed</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className="w-16 h-10 rounded-lg"
              style={{ background: 'linear-gradient(to bottom, #FBBF24, #F59E0B)' }}
            ></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Borrowing</div>
              <div className="text-xs text-gray-600">Key borrowed</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className="w-16 h-10 rounded-lg"
              style={{ background: 'linear-gradient(to bottom, #FB923C, #F97316)' }}
            ></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Merging</div>
              <div className="text-xs text-gray-600">Nodes merged</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className="w-16 h-10 rounded-lg"
              style={{ background: 'linear-gradient(to bottom, #F59E0B, #F97316)' }}
            ></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Splitting</div>
              <div className="text-xs text-gray-600">Node split</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className="w-16 h-10 rounded-lg"
              style={{ background: 'linear-gradient(to bottom, #06B6D4, #0891B2)' }}
            ></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Promoted</div>
              <div className="text-xs text-gray-600">Key moved up</div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Display */}
      {root && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium opacity-90">Height</div>
              <div className="text-2xl">📏</div>
            </div>
            <div className="text-3xl font-bold">
              {(() => {
                const getHeight = (node: BTreeNode | null): number => {
                  if (!node || node.isLeaf) return 1;
                  return 1 + Math.max(...node.children.map(getHeight));
                };
                return getHeight(root);
              })()}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-4 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium opacity-90">Total Keys</div>
              <div className="text-2xl">🔢</div>
            </div>
            <div className="text-3xl font-bold">
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

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium opacity-90">Nodes</div>
              <div className="text-2xl">📦</div>
            </div>
            <div className="text-3xl font-bold">
              {(() => {
                const countNodes = (node: BTreeNode | null): number => {
                  if (!node) return 0;
                  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
                };
                return countNodes(root);
              })()}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-4 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium opacity-90">Balanced</div>
              <div className="text-2xl">⚖️</div>
            </div>
            <div className="text-2xl font-bold">✓ Always</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BTreeVisualization;
