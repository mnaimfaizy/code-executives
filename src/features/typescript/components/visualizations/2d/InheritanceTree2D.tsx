import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * InheritanceTree2D — Interactive inheritance hierarchy visualization.
 * Shows parent → child class relationships with properties & methods
 * flowing down the tree. Animated step-by-step inheritance flow.
 */

interface TreeNode {
  name: string;
  properties: string[];
  methods: string[];
  children?: TreeNode[];
}

const EXAMPLES: Record<string, { title: string; tree: TreeNode }> = {
  vehicle: {
    title: 'Vehicle Hierarchy',
    tree: {
      name: 'Vehicle',
      properties: ['make: string', 'model: string', 'year: number'],
      methods: ['start(): void', 'stop(): void'],
      children: [
        {
          name: 'Car',
          properties: ['doors: number'],
          methods: ['drive(): void'],
          children: [
            {
              name: 'ElectricCar',
              properties: ['batteryLevel: number'],
              methods: ['charge(): void'],
            },
          ],
        },
        {
          name: 'Truck',
          properties: ['payload: number'],
          methods: ['loadCargo(): void'],
        },
      ],
    },
  },
  animal: {
    title: 'Animal Kingdom',
    tree: {
      name: 'Animal',
      properties: ['name: string', 'age: number'],
      methods: ['eat(): void', 'sleep(): void'],
      children: [
        {
          name: 'Dog',
          properties: ['breed: string'],
          methods: ['bark(): void', 'fetch(): void'],
        },
        {
          name: 'Cat',
          properties: ['color: string'],
          methods: ['meow(): void', 'scratch(): void'],
        },
        {
          name: 'Bird',
          properties: ['wingspan: number'],
          methods: ['fly(): void', 'sing(): void'],
        },
      ],
    },
  },
  shape: {
    title: 'Shape Classes',
    tree: {
      name: 'Shape',
      properties: ['color: string'],
      methods: ['getArea(): number', 'draw(): void'],
      children: [
        {
          name: 'Circle',
          properties: ['radius: number'],
          methods: ['getArea(): number'],
        },
        {
          name: 'Rectangle',
          properties: ['width: number', 'height: number'],
          methods: ['getArea(): number'],
          children: [
            {
              name: 'Square',
              properties: [],
              methods: ['getArea(): number'],
            },
          ],
        },
      ],
    },
  },
};

interface FlatNode {
  name: string;
  ownProps: string[];
  ownMethods: string[];
  inheritedProps: string[];
  inheritedMethods: string[];
  depth: number;
  parent: string | null;
  x: number;
  y: number;
  childCount: number;
}

function flattenTree(
  node: TreeNode,
  depth: number,
  parent: string | null,
  parentProps: string[],
  parentMethods: string[]
): FlatNode[] {
  const result: FlatNode[] = [];
  const flat: FlatNode = {
    name: node.name,
    ownProps: node.properties,
    ownMethods: node.methods,
    inheritedProps: parentProps,
    inheritedMethods: parentMethods,
    depth,
    parent,
    x: 0,
    y: 0,
    childCount: node.children?.length ?? 0,
  };
  result.push(flat);

  if (node.children) {
    const allProps = [...parentProps, ...node.properties];
    const allMethods = [...parentMethods, ...node.methods];
    for (const child of node.children) {
      result.push(...flattenTree(child, depth + 1, node.name, allProps, allMethods));
    }
  }
  return result;
}

function layoutNodes(nodes: FlatNode[], svgWidth: number): FlatNode[] {
  const levels: Map<number, FlatNode[]> = new Map();
  for (const n of nodes) {
    if (!levels.has(n.depth)) levels.set(n.depth, []);
    levels.get(n.depth)!.push(n);
  }

  for (const [depth, group] of levels.entries()) {
    const spacing = svgWidth / (group.length + 1);
    group.forEach((n, i) => {
      n.x = (i + 1) * spacing;
      n.y = 40 + depth * 180;
    });
  }
  return nodes;
}

const NODE_COLORS = [
  { bg: '#eef2ff', border: '#6366f1', header: '#4f46e5', text: '#312e81' },
  { bg: '#f0fdf4', border: '#22c55e', header: '#16a34a', text: '#14532d' },
  { bg: '#fefce8', border: '#eab308', header: '#ca8a04', text: '#713f12' },
  { bg: '#fdf2f8', border: '#ec4899', header: '#db2777', text: '#831843' },
];

const InheritanceTree2D: React.FC = () => {
  const [example, setExample] = useState<keyof typeof EXAMPLES>('vehicle');
  const [animStep, setAnimStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tree = EXAMPLES[example].tree;
  const flatNodes = layoutNodes(flattenTree(tree, 0, null, [], []), 700);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const play = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);
    setAnimStep(0);
    setSelectedNode(null);
    let s = 0;
    intervalRef.current = setInterval(() => {
      s++;
      if (s >= flatNodes.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
      } else {
        setAnimStep(s);
      }
    }, 1400);
  }, [isPlaying, flatNodes.length]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAnimStep(-1);
    setIsPlaying(false);
    setSelectedNode(null);
  }, []);

  const changeExample = useCallback((key: keyof typeof EXAMPLES) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setExample(key);
    setAnimStep(-1);
    setIsPlaying(false);
    setSelectedNode(null);
  }, []);

  const isNodeVisible = (idx: number): boolean => animStep === -1 || idx <= animStep;
  const isNodeActive = (idx: number): boolean => animStep === idx;

  const sel = selectedNode ? flatNodes.find((n) => n.name === selectedNode) : null;

  const maxDepth = Math.max(...flatNodes.map((n) => n.depth));
  const svgHeight = 40 + (maxDepth + 1) * 180 + 40;

  return (
    <div className="space-y-5">
      {/* Example picker */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(EXAMPLES).map(([key, { title }]) => (
          <button
            key={key}
            onClick={() => changeExample(key as keyof typeof EXAMPLES)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              example === key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {title}
          </button>
        ))}
      </div>

      {/* SVG Visualization */}
      <div className="relative bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl border border-indigo-100 overflow-hidden">
        <svg viewBox={`0 0 700 ${svgHeight}`} className="w-full" style={{ minHeight: '20rem' }}>
          <defs>
            <marker
              id="inh-arrow"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#6366f1" />
            </marker>
          </defs>

          {/* Connection arrows */}
          {flatNodes.map((node, idx) => {
            if (!node.parent) return null;
            const parentNode = flatNodes.find((n) => n.name === node.parent);
            if (!parentNode) return null;
            if (!isNodeVisible(idx)) return null;

            const active = isNodeActive(idx);
            return (
              <g key={`arrow-${node.name}`}>
                <line
                  x1={parentNode.x}
                  y1={parentNode.y + 30}
                  x2={node.x}
                  y2={node.y - 10}
                  stroke={active ? '#10b981' : '#6366f1'}
                  strokeWidth={active ? 3 : 2}
                  strokeDasharray={active ? '8 4' : 'none'}
                  markerEnd="url(#inh-arrow)"
                  opacity={active ? 1 : 0.6}
                >
                  {active && (
                    <animate
                      attributeName="stroke-dashoffset"
                      values="24;0"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  )}
                </line>
                <text
                  x={(parentNode.x + node.x) / 2 + 8}
                  y={(parentNode.y + 30 + node.y - 10) / 2}
                  fill={active ? '#10b981' : '#818cf8'}
                  fontSize="11"
                  fontWeight="600"
                  fontStyle="italic"
                >
                  extends
                </text>
              </g>
            );
          })}

          {/* Class nodes */}
          {flatNodes.map((node, idx) => {
            if (!isNodeVisible(idx)) return null;
            const active = isNodeActive(idx);
            const colors = NODE_COLORS[node.depth % NODE_COLORS.length];
            const isSelected = selectedNode === node.name;

            const boxWidth = 160;
            const inheritedCount = node.inheritedProps.length + node.inheritedMethods.length;
            const memberCount = node.ownProps.length + node.ownMethods.length;
            const boxHeight =
              34 +
              (isSelected
                ? (memberCount + inheritedCount) * 16 +
                  (inheritedCount > 0 ? 20 : 0) +
                  10
                : 0);

            return (
              <g
                key={node.name}
                transform={`translate(${node.x - boxWidth / 2}, ${node.y - 14})`}
                onClick={() => setSelectedNode(isSelected ? null : node.name)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x="2"
                  y="2"
                  width={boxWidth}
                  height={boxHeight}
                  rx="10"
                  fill="rgba(0,0,0,0.06)"
                />
                <rect
                  width={boxWidth}
                  height={boxHeight}
                  rx="10"
                  fill={colors.bg}
                  stroke={isSelected ? colors.header : active ? '#10b981' : colors.border}
                  strokeWidth={isSelected || active ? 2.5 : 1.5}
                />
                <rect width={boxWidth} height="30" rx="10" fill={colors.header} />
                <rect y="20" width={boxWidth} height="10" fill={colors.header} />
                <text
                  x={boxWidth / 2}
                  y="20"
                  textAnchor="middle"
                  fill="white"
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="ui-monospace, monospace"
                >
                  {node.name}
                </text>

                {isSelected && (
                  <g>
                    {node.inheritedProps.length + node.inheritedMethods.length > 0 && (
                      <>
                        <text x="10" y="50" fill="#6b7280" fontSize="10" fontWeight="600">
                          ↓ Inherited
                        </text>
                        {node.inheritedProps.map((p, i) => (
                          <text
                            key={`ip-${i}`}
                            x="14"
                            y={64 + i * 16}
                            fill="#9ca3af"
                            fontSize="10"
                            fontFamily="ui-monospace, monospace"
                          >
                            📋 {p}
                          </text>
                        ))}
                        {node.inheritedMethods.map((m, i) => (
                          <text
                            key={`im-${i}`}
                            x="14"
                            y={64 + (node.inheritedProps.length + i) * 16}
                            fill="#9ca3af"
                            fontSize="10"
                            fontFamily="ui-monospace, monospace"
                          >
                            ⚡ {m}
                          </text>
                        ))}
                      </>
                    )}
                    {(node.ownProps.length > 0 || node.ownMethods.length > 0) && (
                      <>
                        <text
                          x="10"
                          y={50 + (inheritedCount > 0 ? inheritedCount * 16 + 20 : 0)}
                          fill={colors.text}
                          fontSize="10"
                          fontWeight="600"
                        >
                          ★ Own
                        </text>
                        {node.ownProps.map((p, i) => (
                          <text
                            key={`op-${i}`}
                            x="14"
                            y={
                              64 +
                              (inheritedCount > 0 ? inheritedCount * 16 + 20 : 0) +
                              i * 16
                            }
                            fill={colors.text}
                            fontSize="10"
                            fontFamily="ui-monospace, monospace"
                          >
                            📋 {p}
                          </text>
                        ))}
                        {node.ownMethods.map((m, i) => (
                          <text
                            key={`om-${i}`}
                            x="14"
                            y={
                              64 +
                              (inheritedCount > 0 ? inheritedCount * 16 + 20 : 0) +
                              (node.ownProps.length + i) * 16
                            }
                            fill={colors.text}
                            fontSize="10"
                            fontFamily="ui-monospace, monospace"
                          >
                            ⚡ {m}
                          </text>
                        ))}
                      </>
                    )}
                  </g>
                )}

                {!isSelected && (
                  <text
                    x={boxWidth / 2}
                    y={boxHeight - 6}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="10"
                    opacity="0.7"
                  >
                    {memberCount} own · {inheritedCount} inherited — click to expand
                  </text>
                )}

                {active && (
                  <rect
                    x="-4"
                    y="-4"
                    width={boxWidth + 8}
                    height={boxHeight + 8}
                    rx="12"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.5;0.15;0.5"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </rect>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected node detail panel */}
      {sel && (
        <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-2">
            class {sel.name}
            {sel.parent && (
              <span className="text-indigo-500 font-normal"> extends {sel.parent}</span>
            )}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-gray-700 mb-1">Own Members</h5>
              {sel.ownProps.map((p) => (
                <div key={p} className="text-emerald-700 font-mono text-xs">
                  📋 {p}
                </div>
              ))}
              {sel.ownMethods.map((m) => (
                <div key={m} className="text-blue-700 font-mono text-xs">
                  ⚡ {m}
                </div>
              ))}
            </div>
            {sel.inheritedProps.length + sel.inheritedMethods.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-500 mb-1">Inherited Members</h5>
                {sel.inheritedProps.map((p) => (
                  <div key={p} className="text-gray-400 font-mono text-xs">
                    📋 {p}
                  </div>
                ))}
                {sel.inheritedMethods.map((m) => (
                  <div key={m} className="text-gray-400 font-mono text-xs">
                    ⚡ {m}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={play}
          disabled={isPlaying}
          className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 shadow-sm transition-colors"
        >
          {isPlaying ? '▶ Animating...' : '▶ Animate Inheritance'}
        </button>
        <button
          onClick={() => setAnimStep((s) => Math.min(s + 1, flatNodes.length - 1))}
          disabled={isPlaying}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
        >
          Next →
        </button>
        <button
          onClick={reset}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
        <div className="ml-auto flex gap-1.5">
          {flatNodes.map((n, i) => (
            <div
              key={n.name}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                animStep === -1
                  ? 'bg-indigo-300'
                  : i <= animStep
                    ? 'bg-indigo-600'
                    : 'bg-gray-300'
              } ${i === animStep ? 'scale-125' : ''}`}
              title={n.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(InheritanceTree2D);
