import React, { useState, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Info } from 'lucide-react';

interface BFSNode {
  id: string;
  label: string;
  x: number;
  y: number;
  visited: boolean;
  current: boolean;
  distance: number;
  parent?: string;
  level: number;
}

interface BFSEdge {
  id: string;
  source: string;
  target: string;
  traversed: boolean;
  highlighted: boolean;
}

interface BFSVisualizationProps {
  className?: string;
}

const BFSVisualization: React.FC<BFSVisualizationProps> = ({ className = '' }) => {
  const [nodes, setNodes] = useState<BFSNode[]>([]);
  const [edges, setEdges] = useState<BFSEdge[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startNode, setStartNode] = useState<string>('A');
  const [step, setStep] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeGraph = useCallback(() => {
    const initialNodes: BFSNode[] = [
      {
        id: 'A',
        label: 'A',
        x: 200,
        y: 100,
        visited: false,
        current: false,
        distance: -1,
        level: 0,
      },
      {
        id: 'B',
        label: 'B',
        x: 400,
        y: 100,
        visited: false,
        current: false,
        distance: -1,
        level: 0,
      },
      {
        id: 'C',
        label: 'C',
        x: 100,
        y: 200,
        visited: false,
        current: false,
        distance: -1,
        level: 0,
      },
      {
        id: 'D',
        label: 'D',
        x: 300,
        y: 200,
        visited: false,
        current: false,
        distance: -1,
        level: 0,
      },
      {
        id: 'E',
        label: 'E',
        x: 500,
        y: 200,
        visited: false,
        current: false,
        distance: -1,
        level: 0,
      },
      {
        id: 'F',
        label: 'F',
        x: 200,
        y: 300,
        visited: false,
        current: false,
        distance: -1,
        level: 0,
      },
      {
        id: 'G',
        label: 'G',
        x: 400,
        y: 300,
        visited: false,
        current: false,
        distance: -1,
        level: 0,
      },
    ];

    const initialEdges: BFSEdge[] = [
      { id: 'AB', source: 'A', target: 'B', traversed: false, highlighted: false },
      { id: 'AC', source: 'A', target: 'C', traversed: false, highlighted: false },
      { id: 'BD', source: 'B', target: 'D', traversed: false, highlighted: false },
      { id: 'BE', source: 'B', target: 'E', traversed: false, highlighted: false },
      { id: 'CD', source: 'C', target: 'D', traversed: false, highlighted: false },
      { id: 'CF', source: 'C', target: 'F', traversed: false, highlighted: false },
      { id: 'DG', source: 'D', target: 'G', traversed: false, highlighted: false },
      { id: 'EG', source: 'E', target: 'G', traversed: false, highlighted: false },
      { id: 'FG', source: 'F', target: 'G', traversed: false, highlighted: false },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
    setQueue([]);
    setCurrentNode(null);
    setStep(0);
    setIsComplete(false);
  }, []);

  const resetVisualization = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    initializeGraph();
  }, [initializeGraph]);

  const getAdjacentNodes = useCallback(
    (nodeId: string): string[] => {
      const adjacentNodes: string[] = [];
      edges.forEach((edge) => {
        if (edge.source === nodeId) {
          adjacentNodes.push(edge.target);
        } else if (edge.target === nodeId) {
          adjacentNodes.push(edge.source);
        }
      });
      return adjacentNodes;
    },
    [edges]
  );

  const performBFSStep = useCallback(() => {
    if (queue.length === 0 && step === 0) {
      // Initialize BFS
      setNodes((prev) =>
        prev.map((node) =>
          node.id === startNode
            ? { ...node, visited: true, current: true, distance: 0, level: 0 }
            : node
        )
      );
      setQueue([startNode]);
      setCurrentNode(startNode);
      setStep(1);
      return;
    }

    if (queue.length === 0) {
      // BFS completed
      setIsComplete(true);
      setCurrentNode(null);
      setIsPlaying(false);
      return;
    }

    // Dequeue the front node
    const current = queue[0];
    const newQueue = queue.slice(1);

    setCurrentNode(current);

    // Get unvisited adjacent nodes
    const adjacentNodes = getAdjacentNodes(current);
    const unvisitedAdjacent = adjacentNodes.filter(
      (nodeId) => !nodes.find((n) => n.id === nodeId)?.visited
    );

    // Update nodes and edges
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === current) {
          return { ...node, current: false };
        }
        if (unvisitedAdjacent.includes(node.id)) {
          const currentNodeData = prev.find((n) => n.id === current);
          return {
            ...node,
            visited: true,
            current: true,
            distance: (currentNodeData?.distance ?? 0) + 1,
            level: (currentNodeData?.level ?? 0) + 1,
            parent: current,
          };
        }
        return { ...node, current: false };
      })
    );

    setEdges((prev) =>
      prev.map((edge) => {
        const isTraversingEdge =
          (edge.source === current && unvisitedAdjacent.includes(edge.target)) ||
          (edge.target === current && unvisitedAdjacent.includes(edge.source));
        return {
          ...edge,
          traversed: edge.traversed || isTraversingEdge,
          highlighted: isTraversingEdge,
        };
      })
    );

    // Add unvisited adjacent nodes to queue
    setQueue([...newQueue, ...unvisitedAdjacent]);
    setStep((prev) => prev + 1);
  }, [queue, step, startNode, nodes, getAdjacentNodes]);

  const startBFS = useCallback(() => {
    if (isPlaying) return;

    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      performBFSStep();
    }, 1500);
  }, [isPlaying, performBFSStep]);

  const pauseBFS = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const stepForward = useCallback(() => {
    if (!isPlaying) {
      performBFSStep();
    }
  }, [isPlaying, performBFSStep]);

  React.useEffect(() => {
    initializeGraph();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initializeGraph]);

  const getEdgePath = (edge: BFSEdge) => {
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

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-green-600 rounded-full"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Breadth-First Search (BFS)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Level-by-level graph traversal using a queue
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            BFS Algorithm Steps:
          </h4>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <li>• Start from the selected node and mark it as visited</li>
            <li>• Add the start node to a queue</li>
            <li>• While queue is not empty:</li>
            <li>&nbsp;&nbsp;- Dequeue a node and examine its neighbors</li>
            <li>&nbsp;&nbsp;- Add unvisited neighbors to queue and mark as visited</li>
            <li>• Continue until all reachable nodes are visited</li>
          </ul>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Node:
          </label>
          <select
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            disabled={isPlaying || step > 0}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={startBFS}
          disabled={isPlaying || isComplete}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Start BFS</span>
        </button>

        <button
          onClick={pauseBFS}
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
            <span className="font-medium text-gray-700 dark:text-gray-300">Step:</span>
            <span className="ml-1 text-green-600 dark:text-green-400">{step}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Current:</span>
            <span className="ml-1 text-green-600 dark:text-green-400">{currentNode || 'None'}</span>
          </div>
        </div>

        {isComplete && (
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            ✓ BFS Complete!
          </div>
        )}
      </div>

      {/* Queue Display */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Queue (FIFO):</h4>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Front →</span>
          {queue.length === 0 ? (
            <span className="text-sm text-gray-500 dark:text-gray-400 italic">Empty</span>
          ) : (
            queue.map((nodeId, index) => (
              <div
                key={`${nodeId}-${index}`}
                className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 
                         rounded text-sm font-medium border border-green-200 dark:border-green-800"
              >
                {nodeId}
              </div>
            ))
          )}
          <span className="text-xs text-gray-600 dark:text-gray-400">← Rear</span>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <svg viewBox="0 0 600 400" className="w-full h-96 bg-gray-50 dark:bg-gray-900">
          {/* Background pattern */}
          <defs>
            <pattern id="bfs-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bfs-grid)" />

          {/* Edges */}
          {edges.map((edge) => (
            <path
              key={edge.id}
              d={getEdgePath(edge)}
              stroke={edge.highlighted ? '#EF4444' : edge.traversed ? '#10B981' : '#9CA3AF'}
              strokeWidth={edge.highlighted ? '4' : edge.traversed ? '3' : '2'}
              fill="none"
              className="transition-all duration-500"
            />
          ))}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="25"
                fill={node.current ? '#EF4444' : node.visited ? '#10B981' : '#6B7280'}
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

              {/* Distance label */}
              {node.distance >= 0 && (
                <text
                  x={node.x}
                  y={node.y - 35}
                  textAnchor="middle"
                  className="text-xs font-medium fill-green-600 dark:fill-green-400"
                >
                  d: {node.distance}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Unvisited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Visited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Current</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-green-500"></div>
          <span className="text-gray-700 dark:text-gray-300">Traversed Edge</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-red-500"></div>
          <span className="text-gray-700 dark:text-gray-300">Active Edge</span>
        </div>
      </div>
    </div>
  );
};

export default BFSVisualization;
