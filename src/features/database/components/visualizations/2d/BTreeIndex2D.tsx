import React, { useState, useCallback, useMemo } from 'react';
import { Search, Plus, RotateCcw, ChevronRight } from 'lucide-react';

interface BTreeIndex2DProps {
  className?: string;
}

const BTreeIndex2D: React.FC<BTreeIndex2DProps> = React.memo(({ className = '' }) => {
  const [searchKey, setSearchKey] = useState<number | null>(null);
  const [insertValue, setInsertValue] = useState('');
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const [message, setMessage] = useState(
    'Click a key in the tree to search, or insert a new value.'
  );

  // Static B-Tree structure (order 3) for visualization
  const [tree, setTree] = useState<{
    root: number[];
    children: number[][];
  }>({
    root: [30, 60],
    children: [
      [10, 20],
      [40, 50],
      [70, 80, 90],
    ],
  });

  const handleSearch = useCallback(
    (key: number) => {
      setSearchKey(key);
      const path: string[] = [];

      // Check root
      path.push('root');
      const rootIdx = tree.root.findIndex((k) => k === key);
      if (rootIdx >= 0) {
        setSearchPath(path);
        setMessage(`Found ${key} in the root node! Search complete in ${path.length} step(s).`);
        return;
      }

      // Determine which child to descend into
      let childIdx = 0;
      for (let i = 0; i < tree.root.length; i++) {
        if (key > tree.root[i]) childIdx = i + 1;
      }
      path.push(`child-${childIdx}`);

      const leaf = tree.children[childIdx];
      if (leaf && leaf.includes(key)) {
        setSearchPath(path);
        setMessage(
          `Found ${key} in leaf node ${childIdx}! Path: Root → Leaf ${childIdx}. Total: ${path.length} step(s).`
        );
      } else {
        setSearchPath(path);
        setMessage(
          `Key ${key} not found. Searched Root → Leaf ${childIdx}. In a real B-Tree, each step eliminates half the keys.`
        );
      }
    },
    [tree]
  );

  const handleInsert = useCallback(() => {
    const val = parseInt(insertValue, 10);
    if (isNaN(val) || val < 1 || val > 99) {
      setMessage('Enter a number between 1 and 99.');
      return;
    }

    // Check if already exists
    if (tree.root.includes(val) || tree.children.some((c) => c.includes(val))) {
      setMessage(`${val} already exists in the tree.`);
      return;
    }

    // Find correct leaf
    let childIdx = 0;
    for (let i = 0; i < tree.root.length; i++) {
      if (val > tree.root[i]) childIdx = i + 1;
    }

    const newChildren = tree.children.map((child, i) => {
      if (i === childIdx) {
        return [...child, val].sort((a, b) => a - b);
      }
      return child;
    });

    // If child index doesn't exist yet, create it
    if (childIdx >= tree.children.length) {
      while (newChildren.length <= childIdx) {
        newChildren.push([]);
      }
      newChildren[childIdx] = [val];
    }

    setTree({ ...tree, children: newChildren });
    setSearchKey(val);
    setSearchPath([`child-${childIdx}`]);
    setInsertValue('');
    setMessage(
      `Inserted ${val} into leaf node ${childIdx}. In a real B-Tree, node splits occur when a leaf exceeds its capacity.`
    );
  }, [insertValue, tree]);

  const handleReset = useCallback(() => {
    setTree({
      root: [30, 60],
      children: [
        [10, 20],
        [40, 50],
        [70, 80, 90],
      ],
    });
    setSearchKey(null);
    setSearchPath([]);
    setMessage('Tree reset. Click a key to search, or insert a new value.');
  }, []);

  const allKeys = useMemo(
    () => [...tree.root, ...tree.children.flat()].sort((a, b) => a - b),
    [tree]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* B-Tree SVG */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-hidden">
        <svg
          viewBox="0 0 700 260"
          className="w-full h-auto"
          role="img"
          aria-label="B-Tree index visualization with root and leaf nodes"
        >
          <defs>
            <marker
              id="bt-arrow"
              viewBox="0 0 10 7"
              refX="10"
              refY="3.5"
              markerWidth="8"
              markerHeight="6"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
            </marker>
          </defs>

          {/* Root Node */}
          <g>
            <rect
              x="230"
              y="20"
              width="240"
              height="50"
              rx="10"
              fill={searchPath.includes('root') ? '#ecfdf5' : '#f9fafb'}
              stroke={searchPath.includes('root') ? '#059669' : '#d1d5db'}
              strokeWidth={searchPath.includes('root') ? 2.5 : 1}
            />
            <text x="260" y="12" fontSize="10" fill="#6b7280" fontWeight="bold">
              ROOT
            </text>
            {tree.root.map((key, i) => {
              const kx = 290 + i * 120;
              const isHighlighted = searchKey === key;
              return (
                <g
                  key={`root-${key}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Search for key ${key}`}
                  onClick={() => handleSearch(key)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSearch(key);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={kx - 28}
                    y="30"
                    width="56"
                    height="30"
                    rx="6"
                    fill={isHighlighted ? '#10b981' : '#e5e7eb'}
                    stroke={isHighlighted ? '#059669' : '#9ca3af'}
                    strokeWidth={isHighlighted ? 2 : 0.5}
                  />
                  <text
                    x={kx}
                    y="50"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill={isHighlighted ? 'white' : '#374151'}
                  >
                    {key}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Leaf Nodes */}
          {tree.children.map((child, ci) => {
            const lx = 60 + ci * 250;
            const ly = 160;
            const nodeW = Math.max(160, child.length * 52 + 20);
            const isInPath = searchPath.includes(`child-${ci}`);

            return (
              <g key={`leaf-${ci}`}>
                {/* Connector from root to leaf */}
                <line
                  x1={ci === 0 ? 290 : ci === 1 ? 350 : 410}
                  y1="70"
                  x2={lx + nodeW / 2}
                  y2={ly}
                  stroke={isInPath ? '#059669' : '#d1d5db'}
                  strokeWidth={isInPath ? 2 : 1}
                  markerEnd="url(#bt-arrow)"
                />

                {/* Leaf box */}
                <rect
                  x={lx}
                  y={ly}
                  width={nodeW}
                  height="50"
                  rx="10"
                  fill={isInPath ? '#ecfdf5' : '#f9fafb'}
                  stroke={isInPath ? '#059669' : '#d1d5db'}
                  strokeWidth={isInPath ? 2.5 : 1}
                />
                <text x={lx + 6} y={ly - 6} fontSize="9" fill="#6b7280">
                  Leaf {ci}
                </text>

                {/* Keys in leaf */}
                {child.map((key, ki) => {
                  const kx = lx + 25 + ki * 48;
                  const isHighlighted = searchKey === key;
                  return (
                    <g
                      key={`leaf-${ci}-${key}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Search for key ${key}`}
                      onClick={() => handleSearch(key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSearch(key);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect
                        x={kx - 18}
                        y={ly + 10}
                        width="36"
                        height="28"
                        rx="5"
                        fill={isHighlighted ? '#10b981' : '#e5e7eb'}
                        stroke={isHighlighted ? '#059669' : '#9ca3af'}
                        strokeWidth={isHighlighted ? 2 : 0.5}
                      />
                      <text
                        x={kx}
                        y={ly + 29}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight={isHighlighted ? 'bold' : 'normal'}
                        fill={isHighlighted ? 'white' : '#374151'}
                      >
                        {key}
                      </text>
                    </g>
                  );
                })}

                {/* Next-leaf pointer (doubly linked) */}
                {ci < tree.children.length - 1 && (
                  <line
                    x1={lx + nodeW}
                    y1={ly + 25}
                    x2={lx + nodeW + 28}
                    y2={ly + 25}
                    stroke="#d1d5db"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    markerEnd="url(#bt-arrow)"
                  />
                )}
              </g>
            );
          })}

          {/* Legend */}
          <text x="10" y="252" fontSize="9" fill="#9ca3af">
            ← Leaf pointers enable range scans without revisiting the root →
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <input
            type="number"
            min={1}
            max={99}
            value={insertValue}
            onChange={(e) => setInsertValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInsert();
            }}
            placeholder="1-99"
            className="w-16 px-2 py-1 rounded border border-gray-300 text-sm"
            aria-label="Value to insert into B-Tree"
          />
          <button
            onClick={handleInsert}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-3 h-3" /> Insert
          </button>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>

        <div className="text-xs text-gray-500">
          <Search className="w-3 h-3 inline mr-1" />
          Click any key to search
        </div>
      </div>

      {/* Message */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-800">
        <ChevronRight className="w-4 h-4 inline mr-1" />
        {message}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-teal-700">{allKeys.length}</p>
          <p className="text-xs text-gray-500">Total Keys</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-teal-700">2</p>
          <p className="text-xs text-gray-500">Tree Depth</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-teal-700">O(log n)</p>
          <p className="text-xs text-gray-500">Search Time</p>
        </div>
      </div>
    </div>
  );
});

BTreeIndex2D.displayName = 'BTreeIndex2D';

export default BTreeIndex2D;
