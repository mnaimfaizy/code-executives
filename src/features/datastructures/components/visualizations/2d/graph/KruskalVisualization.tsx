import React, { useState, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Info, GitBranch } from 'lucide-react';

interface MSTNode {
  id: string;
  label: string;
  x: number;
  y: number;
  parent: string;
  rank: number;
}

interface MSTEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  selected: boolean;
  rejected: boolean;
  highlighted: boolean;
  processed: boolean;
}

interface KruskalVisualizationProps {
  className?: string;
}

const KruskalVisualization: React.FC<KruskalVisualizationProps> = ({ className = '' }) => {
  const [nodes, setNodes] = useState<MSTNode[]>([]);
  const [edges, setEdges] = useState<MSTEdge[]>([]);
  const [sortedEdges, setSortedEdges] = useState<MSTEdge[]>([]);
  const [currentEdgeIndex, setCurrentEdgeIndex] = useState(0);
  const [mstEdges, setMstEdges] = useState<MSTEdge[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [step, setStep] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [unionFindSets, setUnionFindSets] = useState<{ [key: string]: string[] }>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeGraph = useCallback(() => {
    const initialNodes: MSTNode[] = [
      { id: 'A', label: 'A', x: 150, y: 100, parent: 'A', rank: 0 },
      { id: 'B', label: 'B', x: 350, y: 100, parent: 'B', rank: 0 },
      { id: 'C', label: 'C', x: 500, y: 150, parent: 'C', rank: 0 },
      { id: 'D', label: 'D', x: 450, y: 280, parent: 'D', rank: 0 },
      { id: 'E', label: 'E', x: 250, y: 300, parent: 'E', rank: 0 },
      { id: 'F', label: 'F', x: 100, y: 250, parent: 'F', rank: 0 },
    ];

    const initialEdges: MSTEdge[] = [
      {
        id: 'AB',
        source: 'A',
        target: 'B',
        weight: 4,
        selected: false,
        rejected: false,
        highlighted: false,
        processed: false,
      },
      {
        id: 'AC',
        source: 'A',
        target: 'C',
        weight: 6,
        selected: false,
        rejected: false,
        highlighted: false,
        processed: false,
      },
      {
        id: 'AF',
        source: 'A',
        target: 'F',
        weight: 2,
        selected: false,
        rejected: false,
        highlighted: false,
        processed: false,
      },
      {
        id: 'BC',
        source: 'B',
        target: 'C',
        weight: 3,
        selected: false,
        rejected: false,
        highlighted: false,
        processed: false,
      },
      {
        id: 'BE',
        source: 'B',
        target: 'E',
        weight: 7,
        selected: false,
        rejected: false,
        highlighted: false,
        processed: false,
      },
      {
        id: 'CD',
        source: 'C',
        target: 'D',
        weight: 5,
        selected: false,
        rejected: false,
        highlighted: false,
        processed: false,
      },
      {
        id: 'CE',
        source: 'C',
        target: 'E',
        weight: 8,
        selected: false,
        rejected: false,
        highlighted: false,
        processed: false,
      },
      {
        id: 'DE',
        source: 'D',
        target: 'E',
        weight: 2,
        selected: false,
        rejected: false,
        highlighted: false,
        processed: false,
      },
      {
        id: 'EF',
        source: 'E',
        target: 'F',
        weight: 9,
        selected: false,
        rejected: false,
        highlighted: false,
        processed: false,
      },
      {
        id: 'FD',
        source: 'F',
        target: 'D',
        weight: 1,
        selected: false,
        rejected: false,
        highlighted: false,
        processed: false,
      },
    ];

    // Sort edges by weight for Kruskal's algorithm
    const sorted = [...initialEdges].sort((a, b) => a.weight - b.weight);

    setNodes(initialNodes);
    setEdges(initialEdges);
    setSortedEdges(sorted);
    setCurrentEdgeIndex(0);
    setMstEdges([]);
    setTotalWeight(0);
    setStep(0);
    setIsComplete(false);

    // Initialize union-find sets (each node is its own set initially)
    const initialSets: { [key: string]: string[] } = {};
    initialNodes.forEach((node) => {
      initialSets[node.id] = [node.id];
    });
    setUnionFindSets(initialSets);
  }, []);

  const resetVisualization = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    initializeGraph();
  }, [initializeGraph]);

  const findParent = useCallback((nodeId: string, nodes: MSTNode[]): string => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.parent === nodeId) return nodeId;

    // Path compression
    const root = findParent(node.parent, nodes);
    return root;
  }, []);

  const union = useCallback(
    (nodeId1: string, nodeId2: string, nodes: MSTNode[]): MSTNode[] => {
      const root1 = findParent(nodeId1, nodes);
      const root2 = findParent(nodeId2, nodes);

      if (root1 === root2) return nodes; // Already in same set

      // Union by rank
      const node1 = nodes.find((n) => n.id === root1);
      const node2 = nodes.find((n) => n.id === root2);

      if (!node1 || !node2) return nodes;

      return nodes.map((node) => {
        if (node.id === root1 && node1.rank < node2.rank) {
          return { ...node, parent: root2 };
        } else if (node.id === root2 && node2.rank < node1.rank) {
          return { ...node, parent: root1 };
        } else if (node.id === root2 && node1.rank === node2.rank) {
          return { ...node, parent: root1 };
        } else if (node.id === root1 && node1.rank === node2.rank) {
          return { ...node, rank: node.rank + 1 };
        }
        return node;
      });
    },
    [findParent]
  );

  const updateUnionFindSets = useCallback(
    (nodes: MSTNode[]) => {
      const sets: { [key: string]: string[] } = {};

      nodes.forEach((node) => {
        const root = findParent(node.id, nodes);
        if (!sets[root]) {
          sets[root] = [];
        }
        sets[root].push(node.id);
      });

      setUnionFindSets(sets);
    },
    [findParent]
  );

  const performKruskalStep = useCallback(() => {
    if (currentEdgeIndex >= sortedEdges.length) {
      // Algorithm completed
      setIsComplete(true);
      setIsPlaying(false);

      // Clear all highlights
      setEdges((prev) => prev.map((edge) => ({ ...edge, highlighted: false })));
      return;
    }

    const currentEdge = sortedEdges[currentEdgeIndex];

    // Highlight current edge being considered
    setEdges((prev) =>
      prev.map((edge) => ({
        ...edge,
        highlighted: edge.id === currentEdge.id,
        processed: edge.id === currentEdge.id ? true : edge.processed,
      }))
    );

    // Check if adding this edge would create a cycle
    const sourceRoot = findParent(currentEdge.source, nodes);
    const targetRoot = findParent(currentEdge.target, nodes);

    if (sourceRoot !== targetRoot) {
      // No cycle - add edge to MST
      const newNodes = union(currentEdge.source, currentEdge.target, nodes);
      setNodes(newNodes);

      // Add edge to MST
      setMstEdges((prev) => [...prev, currentEdge]);
      setTotalWeight((prev) => prev + currentEdge.weight);

      // Mark edge as selected
      setEdges((prev) =>
        prev.map((edge) => (edge.id === currentEdge.id ? { ...edge, selected: true } : edge))
      );

      // Update union-find visualization
      updateUnionFindSets(newNodes);
    } else {
      // Cycle detected - reject edge
      setEdges((prev) =>
        prev.map((edge) => (edge.id === currentEdge.id ? { ...edge, rejected: true } : edge))
      );
    }

    setCurrentEdgeIndex((prev) => prev + 1);
    setStep((prev) => prev + 1);
  }, [currentEdgeIndex, sortedEdges, nodes, findParent, union, updateUnionFindSets]);

  const startKruskal = useCallback(() => {
    if (isPlaying) return;

    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      performKruskalStep();
    }, 2000);
  }, [isPlaying, performKruskalStep]);

  const pauseKruskal = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const stepForward = useCallback(() => {
    if (!isPlaying) {
      performKruskalStep();
    }
  }, [isPlaying, performKruskalStep]);

  React.useEffect(() => {
    initializeGraph();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initializeGraph]);

  const getEdgePath = (edge: MSTEdge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return '';

    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    const nodeRadius = 25;
    const offsetX = (dx / length) * nodeRadius;
    const offsetY = (dy / length) * nodeRadius;

    const startX = sourceNode.x + offsetX;
    const startY = sourceNode.y + offsetY;
    const endX = targetNode.x - offsetX;
    const endY = targetNode.y - offsetY;

    return `M ${startX} ${startY} L ${endX} ${endY}`;
  };

  const getEdgeColor = (edge: MSTEdge) => {
    if (edge.selected) return '#10B981'; // Green for MST edges
    if (edge.rejected) return '#EF4444'; // Red for rejected edges
    if (edge.highlighted) return '#F59E0B'; // Yellow for current edge
    if (edge.processed) return '#9CA3AF'; // Gray for processed edges
    return '#D1D5DB'; // Light gray for unprocessed edges
  };

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Kruskal's Algorithm</h3>
            <p className="text-sm text-gray-600">Find minimum spanning tree using union-find</p>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 text-gray-600 hover:text-teal-600 transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
          <h4 className="font-semibold text-teal-900 mb-2">Kruskal's Algorithm Steps:</h4>
          <ul className="text-sm text-teal-800 space-y-1">
            <li>• Sort all edges by weight in ascending order</li>
            <li>• Initialize each vertex as its own disjoint set</li>
            <li>• For each edge in sorted order:</li>
            <li>&nbsp;&nbsp;- Check if endpoints are in different sets (no cycle)</li>
            <li>&nbsp;&nbsp;- If different sets: add edge to MST, union the sets</li>
            <li>&nbsp;&nbsp;- If same set: reject edge (would create cycle)</li>
            <li>• Continue until MST has V-1 edges</li>
          </ul>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={startKruskal}
          disabled={isPlaying || isComplete}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Start Kruskal's</span>
        </button>

        <button
          onClick={pauseKruskal}
          disabled={!isPlaying}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Pause className="w-4 h-4" />
          <span>Pause</span>
        </button>

        <button
          onClick={stepForward}
          disabled={isPlaying || isComplete}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <SkipForward className="w-4 h-4" />
          <span>Step</span>
        </button>

        <button
          onClick={resetVisualization}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-6">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Step:</span>
            <span className="ml-1 text-teal-600">{step}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">MST Edges:</span>
            <span className="ml-1 text-teal-600">
              {mstEdges.length}/{nodes.length - 1}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Total Weight:</span>
            <span className="ml-1 text-teal-600">{totalWeight}</span>
          </div>
        </div>

        {isComplete && <div className="text-sm text-green-600 font-medium">✓ MST Complete!</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Edge List */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Edges (sorted by weight):</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {sortedEdges.map((edge, index) => (
              <div
                key={edge.id}
                className={`flex items-center justify-between px-3 py-2 rounded text-sm ${
                  index === currentEdgeIndex && !isComplete
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : edge.selected
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : edge.rejected
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : edge.processed
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-white text-gray-600'
                }`}
              >
                <span className="font-medium">
                  {edge.source}-{edge.target}
                </span>
                <span className="font-bold">{edge.weight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Union-Find Sets */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Disjoint Sets (Union-Find):</h4>
          <div className="space-y-2">
            {Object.entries(unionFindSets).map(([root, members], index) => (
              <div key={root} className="flex items-center space-x-2">
                <div
                  className={`px-3 py-1 rounded text-sm font-medium border ${
                    index % 2 === 0
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-purple-100 text-purple-800 border-purple-200'
                  }`}
                >
                  {members.sort().join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MST Edges */}
      {mstEdges.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-semibold text-green-900 mb-2">
            Minimum Spanning Tree Edges:
          </h4>
          <div className="flex items-center space-x-2 flex-wrap">
            {mstEdges.map((edge, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="px-3 py-1 bg-green-100 text-green-800 
                             rounded text-sm font-medium border border-green-200"
                >
                  {edge.source}-{edge.target} ({edge.weight})
                </div>
                {index < mstEdges.length - 1 && <span className="mx-2 text-green-600">+</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graph Visualization */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <svg viewBox="0 0 600 400" className="w-full h-96 bg-gray-50">
          {/* Background pattern */}
          <defs>
            <pattern id="mst-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mst-grid)" />

          {/* Edges */}
          {edges.map((edge) => (
            <g key={edge.id}>
              <path
                d={getEdgePath(edge)}
                stroke={getEdgeColor(edge)}
                strokeWidth={edge.selected ? '5' : edge.highlighted ? '4' : '2'}
                fill="none"
                className="transition-all duration-500"
                strokeDasharray={edge.rejected ? '5,5' : 'none'}
              />

              {/* Edge weight label */}
              <text
                x={
                  ((nodes.find((n) => n.id === edge.source)?.x || 0) +
                    (nodes.find((n) => n.id === edge.target)?.x || 0)) /
                  2
                }
                y={
                  ((nodes.find((n) => n.id === edge.source)?.y || 0) +
                    (nodes.find((n) => n.id === edge.target)?.y || 0)) /
                    2 -
                  5
                }
                textAnchor="middle"
                className="text-xs font-bold fill-gray-700"
                style={{ pointerEvents: 'none' }}
              >
                {edge.weight}
              </text>
            </g>
          ))}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="25"
                fill="#6366F1"
                stroke="#1F2937"
                strokeWidth="2"
                className="transition-all duration-500"
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                className="text-sm font-bold fill-white"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-green-500"></div>
          <span className="text-gray-700">MST Edge</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-red-500" style={{ strokeDasharray: '2,2' }}></div>
          <span className="text-gray-700">Rejected Edge</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-yellow-500"></div>
          <span className="text-gray-700">Current Edge</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-gray-400"></div>
          <span className="text-gray-700">Unprocessed</span>
        </div>
      </div>
    </div>
  );
};

export default KruskalVisualization;
