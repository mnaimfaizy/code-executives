import React, { useState, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Info, MapPin } from 'lucide-react';

interface DijkstraNode {
  id: string;
  label: string;
  x: number;
  y: number;
  distance: number;
  previous?: string;
  visited: boolean;
  current: boolean;
  isSource: boolean;
}

interface DijkstraEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  highlighted: boolean;
  inPath: boolean;
}

interface DijkstraVisualizationProps {
  className?: string;
}

const DijkstraVisualization: React.FC<DijkstraVisualizationProps> = ({ className = '' }) => {
  const [nodes, setNodes] = useState<DijkstraNode[]>([]);
  const [edges, setEdges] = useState<DijkstraEdge[]>([]);
  const [priorityQueue, setPriorityQueue] = useState<{ nodeId: string; distance: number }[]>([]);
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [sourceNode, setSourceNode] = useState<string>('A');
  const [targetNode, setTargetNode] = useState<string>('F');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [step, setStep] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [shortestPath, setShortestPath] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeGraph = useCallback(() => {
    const initialNodes: DijkstraNode[] = [
      {
        id: 'A',
        label: 'A',
        x: 100,
        y: 150,
        distance: Infinity,
        visited: false,
        current: false,
        isSource: false,
      },
      {
        id: 'B',
        label: 'B',
        x: 250,
        y: 100,
        distance: Infinity,
        visited: false,
        current: false,
        isSource: false,
      },
      {
        id: 'C',
        label: 'C',
        x: 250,
        y: 200,
        distance: Infinity,
        visited: false,
        current: false,
        isSource: false,
      },
      {
        id: 'D',
        label: 'D',
        x: 400,
        y: 100,
        distance: Infinity,
        visited: false,
        current: false,
        isSource: false,
      },
      {
        id: 'E',
        label: 'E',
        x: 400,
        y: 200,
        distance: Infinity,
        visited: false,
        current: false,
        isSource: false,
      },
      {
        id: 'F',
        label: 'F',
        x: 550,
        y: 150,
        distance: Infinity,
        visited: false,
        current: false,
        isSource: false,
      },
    ];

    const initialEdges: DijkstraEdge[] = [
      { id: 'AB', source: 'A', target: 'B', weight: 4, highlighted: false, inPath: false },
      { id: 'AC', source: 'A', target: 'C', weight: 2, highlighted: false, inPath: false },
      { id: 'BC', source: 'B', target: 'C', weight: 1, highlighted: false, inPath: false },
      { id: 'BD', source: 'B', target: 'D', weight: 5, highlighted: false, inPath: false },
      { id: 'CD', source: 'C', target: 'D', weight: 8, highlighted: false, inPath: false },
      { id: 'CE', source: 'C', target: 'E', weight: 10, highlighted: false, inPath: false },
      { id: 'DE', source: 'D', target: 'E', weight: 2, highlighted: false, inPath: false },
      { id: 'DF', source: 'D', target: 'F', weight: 6, highlighted: false, inPath: false },
      { id: 'EF', source: 'E', target: 'F', weight: 3, highlighted: false, inPath: false },
    ];

    // Set source node distance to 0 and mark as source
    const updatedNodes = initialNodes.map((node) => ({
      ...node,
      distance: node.id === sourceNode ? 0 : Infinity,
      isSource: node.id === sourceNode,
    }));

    setNodes(updatedNodes);
    setEdges(initialEdges);
    setPriorityQueue([{ nodeId: sourceNode, distance: 0 }]);
    setCurrentNode(null);
    setStep(0);
    setIsComplete(false);
    setShortestPath([]);
  }, [sourceNode]);

  const resetVisualization = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    initializeGraph();
  }, [initializeGraph]);

  const getAdjacentNodes = useCallback(
    (nodeId: string): { nodeId: string; weight: number }[] => {
      const adjacent: { nodeId: string; weight: number }[] = [];
      edges.forEach((edge) => {
        if (edge.source === nodeId) {
          adjacent.push({ nodeId: edge.target, weight: edge.weight });
        } else if (edge.target === nodeId) {
          adjacent.push({ nodeId: edge.source, weight: edge.weight });
        }
      });
      return adjacent;
    },
    [edges]
  );

  const findShortestPath = useCallback(
    (target: string): string[] => {
      const path: string[] = [];
      let current = target;

      while (current) {
        path.unshift(current);
        const nodeData = nodes.find((n) => n.id === current);
        current = nodeData?.previous || '';
      }

      return path;
    },
    [nodes]
  );

  const performDijkstraStep = useCallback(() => {
    if (priorityQueue.length === 0) {
      // Algorithm completed, show shortest path
      const path = findShortestPath(targetNode);
      setShortestPath(path);

      // Highlight shortest path edges
      setEdges((prev) =>
        prev.map((edge) => {
          const isInPath = path.some((nodeId, index) => {
            if (index === path.length - 1) return false;
            const nextNode = path[index + 1];
            return (
              (edge.source === nodeId && edge.target === nextNode) ||
              (edge.target === nodeId && edge.source === nextNode)
            );
          });
          return { ...edge, inPath: isInPath, highlighted: false };
        })
      );

      setIsComplete(true);
      setCurrentNode(null);
      setIsPlaying(false);
      return;
    }

    // Get node with minimum distance from priority queue
    const sortedQueue = [...priorityQueue].sort((a, b) => a.distance - b.distance);
    const { nodeId: currentNodeId } = sortedQueue[0];
    const newQueue = priorityQueue.filter((item) => item.nodeId !== currentNodeId);

    setPriorityQueue(newQueue);
    setCurrentNode(currentNodeId);

    // Mark current node as visited
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        visited: node.id === currentNodeId ? true : node.visited,
        current: node.id === currentNodeId,
      }))
    );

    // Get current node data
    const currentNodeData = nodes.find((n) => n.id === currentNodeId);
    if (!currentNodeData) return;

    // Update distances to adjacent nodes
    const adjacentNodes = getAdjacentNodes(currentNodeId);

    adjacentNodes.forEach(({ nodeId: adjNodeId, weight }) => {
      const adjNode = nodes.find((n) => n.id === adjNodeId);
      if (!adjNode || adjNode.visited) return;

      const newDistance = currentNodeData.distance + weight;

      if (newDistance < adjNode.distance) {
        // Update node with new shorter distance
        setNodes((prev) =>
          prev.map((node) =>
            node.id === adjNodeId
              ? { ...node, distance: newDistance, previous: currentNodeId }
              : node
          )
        );

        // Update or add to priority queue
        setPriorityQueue((prev) => {
          const filtered = prev.filter((item) => item.nodeId !== adjNodeId);
          return [...filtered, { nodeId: adjNodeId, distance: newDistance }];
        });

        // Highlight the edge being relaxed
        setEdges((prev) =>
          prev.map((edge) => {
            const isRelaxedEdge =
              (edge.source === currentNodeId && edge.target === adjNodeId) ||
              (edge.target === currentNodeId && edge.source === adjNodeId);
            return { ...edge, highlighted: isRelaxedEdge };
          })
        );
      }
    });

    setStep((prev) => prev + 1);
  }, [priorityQueue, nodes, getAdjacentNodes, findShortestPath, targetNode]);

  const startDijkstra = useCallback(() => {
    if (isPlaying) return;

    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      performDijkstraStep();
    }, 2000);
  }, [isPlaying, performDijkstraStep]);

  const pauseDijkstra = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const stepForward = useCallback(() => {
    if (!isPlaying) {
      performDijkstraStep();
    }
  }, [isPlaying, performDijkstraStep]);

  React.useEffect(() => {
    initializeGraph();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initializeGraph]);

  const getEdgePath = (edge: DijkstraEdge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return '';

    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    const nodeRadius = 30;
    const offsetX = (dx / length) * nodeRadius;
    const offsetY = (dy / length) * nodeRadius;

    const startX = sourceNode.x + offsetX;
    const startY = sourceNode.y + offsetY;
    const endX = targetNode.x - offsetX;
    const endY = targetNode.y - offsetY;

    return `M ${startX} ${startY} L ${endX} ${endY}`;
  };

  const getEdgeColor = (edge: DijkstraEdge) => {
    if (edge.inPath) return '#10B981'; // Green for shortest path
    if (edge.highlighted) return '#EF4444'; // Red for currently being processed
    return '#9CA3AF'; // Gray for normal edges
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Dijkstra's Algorithm
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Find shortest paths in weighted graphs
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Dijkstra's Algorithm Steps:
          </h4>
          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
            <li>• Initialize all distances to infinity, except source (distance = 0)</li>
            <li>• Add all nodes to a priority queue</li>
            <li>• While priority queue is not empty:</li>
            <li>&nbsp;&nbsp;- Extract node with minimum distance</li>
            <li>&nbsp;&nbsp;- For each unvisited neighbor, calculate new distance</li>
            <li>&nbsp;&nbsp;- If new distance is shorter, update it and previous node</li>
            <li>• Continue until all nodes are processed</li>
          </ul>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Source:</label>
          <select
            value={sourceNode}
            onChange={(e) => setSourceNode(e.target.value)}
            disabled={isPlaying || step > 0}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target:</label>
          <select
            value={targetNode}
            onChange={(e) => setTargetNode(e.target.value)}
            disabled={isPlaying}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {nodes
              .filter((node) => node.id !== sourceNode)
              .map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label}
                </option>
              ))}
          </select>
        </div>

        <button
          onClick={startDijkstra}
          disabled={isPlaying || isComplete}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Start</span>
        </button>

        <button
          onClick={pauseDijkstra}
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
            <span className="ml-1 text-orange-600 dark:text-orange-400">{step}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Current:</span>
            <span className="ml-1 text-orange-600 dark:text-orange-400">
              {currentNode || 'None'}
            </span>
          </div>
          {isComplete && targetNode && (
            <div className="text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Distance to {targetNode}:
              </span>
              <span className="ml-1 text-green-600 dark:text-green-400 font-bold">
                {nodes.find((n) => n.id === targetNode)?.distance || '∞'}
              </span>
            </div>
          )}
        </div>

        {isComplete && (
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            ✓ Shortest path found!
          </div>
        )}
      </div>

      {/* Priority Queue */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Priority Queue (ordered by distance):
        </h4>
        <div className="flex items-center space-x-2 flex-wrap">
          {priorityQueue.length === 0 ? (
            <span className="text-sm text-gray-500 dark:text-gray-400 italic">Empty</span>
          ) : (
            [...priorityQueue]
              .sort((a, b) => a.distance - b.distance)
              .map((item, index) => (
                <div
                  key={`${item.nodeId}-${index}`}
                  className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 
                           rounded text-sm font-medium border border-orange-200 dark:border-orange-800"
                >
                  {item.nodeId}: {item.distance === Infinity ? '∞' : item.distance}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Shortest Path */}
      {shortestPath.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
            Shortest Path from {sourceNode} to {targetNode}:
          </h4>
          <div className="flex items-center space-x-2 flex-wrap">
            {shortestPath.map((nodeId, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 
                             rounded text-sm font-medium border border-green-200 dark:border-green-800"
                >
                  {nodeId}
                </div>
                {index < shortestPath.length - 1 && (
                  <span className="mx-2 text-green-600 dark:text-green-400">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graph Visualization */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <svg viewBox="0 0 650 300" className="w-full h-96 bg-gray-50 dark:bg-gray-900">
          {/* Background pattern */}
          <defs>
            <pattern id="dijkstra-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dijkstra-grid)" />

          {/* Edges */}
          {edges.map((edge) => (
            <g key={edge.id}>
              <path
                d={getEdgePath(edge)}
                stroke={getEdgeColor(edge)}
                strokeWidth={edge.inPath ? '5' : edge.highlighted ? '4' : '2'}
                fill="none"
                className="transition-all duration-500"
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
                className="text-xs font-bold fill-gray-700 dark:fill-gray-300"
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
                r="30"
                fill={
                  node.current
                    ? '#EF4444'
                    : node.isSource
                      ? '#10B981'
                      : node.visited
                        ? '#8B5CF6'
                        : '#6B7280'
                }
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
              <text
                x={node.x}
                y={node.y - 45}
                textAnchor="middle"
                className="text-xs font-bold fill-orange-600 dark:fill-orange-400"
              >
                {node.distance === Infinity ? '∞' : node.distance}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Source</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Unvisited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Visited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Current</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-green-500"></div>
          <span className="text-gray-700 dark:text-gray-300">Shortest Path</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-red-500"></div>
          <span className="text-gray-700 dark:text-gray-300">Being Processed</span>
        </div>
      </div>
    </div>
  );
};

export default DijkstraVisualization;
