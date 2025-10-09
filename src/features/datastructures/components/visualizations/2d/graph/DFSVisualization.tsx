import React, { useState, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Info, ArrowDown } from 'lucide-react';

interface DFSNode {
  id: string;
  label: string;
  x: number;
  y: number;
  visited: boolean;
  current: boolean;
  discoveryTime: number;
  finishTime: number;
  parent?: string;
  depth: number;
}

interface DFSEdge {
  id: string;
  source: string;
  target: string;
  traversed: boolean;
  highlighted: boolean;
  type: 'tree' | 'back' | 'forward' | 'cross' | 'unvisited';
}

interface DFSVisualizationProps {
  className?: string;
}

const DFSVisualization: React.FC<DFSVisualizationProps> = ({ className = '' }) => {
  const [nodes, setNodes] = useState<DFSNode[]>([]);
  const [edges, setEdges] = useState<DFSEdge[]>([]);
  const [stack, setStack] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startNode, setStartNode] = useState<string>('A');
  const [step, setStep] = useState(0);
  const [time, setTime] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [traversalOrder, setTraversalOrder] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeGraph = useCallback(() => {
    const initialNodes: DFSNode[] = [
      {
        id: 'A',
        label: 'A',
        x: 200,
        y: 100,
        visited: false,
        current: false,
        discoveryTime: -1,
        finishTime: -1,
        depth: 0,
      },
      {
        id: 'B',
        label: 'B',
        x: 400,
        y: 100,
        visited: false,
        current: false,
        discoveryTime: -1,
        finishTime: -1,
        depth: 0,
      },
      {
        id: 'C',
        label: 'C',
        x: 100,
        y: 200,
        visited: false,
        current: false,
        discoveryTime: -1,
        finishTime: -1,
        depth: 0,
      },
      {
        id: 'D',
        label: 'D',
        x: 300,
        y: 200,
        visited: false,
        current: false,
        discoveryTime: -1,
        finishTime: -1,
        depth: 0,
      },
      {
        id: 'E',
        label: 'E',
        x: 500,
        y: 200,
        visited: false,
        current: false,
        discoveryTime: -1,
        finishTime: -1,
        depth: 0,
      },
      {
        id: 'F',
        label: 'F',
        x: 200,
        y: 300,
        visited: false,
        current: false,
        discoveryTime: -1,
        finishTime: -1,
        depth: 0,
      },
      {
        id: 'G',
        label: 'G',
        x: 400,
        y: 300,
        visited: false,
        current: false,
        discoveryTime: -1,
        finishTime: -1,
        depth: 0,
      },
    ];

    const initialEdges: DFSEdge[] = [
      {
        id: 'AB',
        source: 'A',
        target: 'B',
        traversed: false,
        highlighted: false,
        type: 'unvisited',
      },
      {
        id: 'AC',
        source: 'A',
        target: 'C',
        traversed: false,
        highlighted: false,
        type: 'unvisited',
      },
      {
        id: 'BD',
        source: 'B',
        target: 'D',
        traversed: false,
        highlighted: false,
        type: 'unvisited',
      },
      {
        id: 'BE',
        source: 'B',
        target: 'E',
        traversed: false,
        highlighted: false,
        type: 'unvisited',
      },
      {
        id: 'CD',
        source: 'C',
        target: 'D',
        traversed: false,
        highlighted: false,
        type: 'unvisited',
      },
      {
        id: 'CF',
        source: 'C',
        target: 'F',
        traversed: false,
        highlighted: false,
        type: 'unvisited',
      },
      {
        id: 'DG',
        source: 'D',
        target: 'G',
        traversed: false,
        highlighted: false,
        type: 'unvisited',
      },
      {
        id: 'EG',
        source: 'E',
        target: 'G',
        traversed: false,
        highlighted: false,
        type: 'unvisited',
      },
      {
        id: 'FG',
        source: 'F',
        target: 'G',
        traversed: false,
        highlighted: false,
        type: 'unvisited',
      },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
    setStack([]);
    setCurrentNode(null);
    setStep(0);
    setTime(0);
    setIsComplete(false);
    setTraversalOrder([]);
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
      return adjacentNodes.sort(); // Sort for consistent ordering
    },
    [edges]
  );

  const performDFSStep = useCallback(() => {
    if (stack.length === 0 && step === 0) {
      // Initialize DFS
      setNodes((prev) =>
        prev.map((node) =>
          node.id === startNode
            ? { ...node, visited: true, current: true, discoveryTime: time, depth: 0 }
            : node
        )
      );
      setStack([startNode]);
      setCurrentNode(startNode);
      setTraversalOrder([startNode]);
      setStep(1);
      setTime(1);
      return;
    }

    if (stack.length === 0) {
      // DFS completed
      setIsComplete(true);
      setCurrentNode(null);
      setIsPlaying(false);
      return;
    }

    // Get top of stack (current node)
    const current = stack[stack.length - 1];
    setCurrentNode(current);

    // Get unvisited adjacent nodes
    const adjacentNodes = getAdjacentNodes(current);
    const unvisitedAdjacent = adjacentNodes.filter(
      (nodeId) => !nodes.find((n) => n.id === nodeId)?.visited
    );

    if (unvisitedAdjacent.length > 0) {
      // Visit first unvisited adjacent node
      const nextNode = unvisitedAdjacent[0];
      const currentNodeData = nodes.find((n) => n.id === current);

      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === current) {
            return { ...node, current: false };
          }
          if (node.id === nextNode) {
            return {
              ...node,
              visited: true,
              current: true,
              discoveryTime: time + 1,
              depth: (currentNodeData?.depth ?? 0) + 1,
              parent: current,
            };
          }
          return node;
        })
      );

      // Mark edge as tree edge
      setEdges((prev) =>
        prev.map((edge) => {
          const isTreeEdge =
            (edge.source === current && edge.target === nextNode) ||
            (edge.target === current && edge.source === nextNode);
          if (isTreeEdge) {
            return {
              ...edge,
              traversed: true,
              highlighted: true,
              type: 'tree',
            };
          }
          return { ...edge, highlighted: false };
        })
      );

      // Push to stack
      setStack((prev) => [...prev, nextNode]);
      setTraversalOrder((prev) => [...prev, nextNode]);
      setTime((prev) => prev + 1);
    } else {
      // Backtrack - pop from stack
      const poppedNode = stack[stack.length - 1];
      const newStack = stack.slice(0, -1);

      // Set finish time for the node being popped
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === poppedNode) {
            return { ...node, current: false, finishTime: time + 1 };
          }
          if (newStack.length > 0 && node.id === newStack[newStack.length - 1]) {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );

      setStack(newStack);
      setTime((prev) => prev + 1);

      // Clear edge highlighting
      setEdges((prev) => prev.map((edge) => ({ ...edge, highlighted: false })));
    }

    setStep((prev) => prev + 1);
  }, [stack, step, startNode, nodes, getAdjacentNodes, time]);

  const startDFS = useCallback(() => {
    if (isPlaying) return;

    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      performDFSStep();
    }, 1500);
  }, [isPlaying, performDFSStep]);

  const pauseDFS = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const stepForward = useCallback(() => {
    if (!isPlaying) {
      performDFSStep();
    }
  }, [isPlaying, performDFSStep]);

  React.useEffect(() => {
    initializeGraph();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initializeGraph]);

  const getEdgePath = (edge: DFSEdge) => {
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

  const getEdgeColor = (edge: DFSEdge) => {
    if (edge.highlighted) return '#EF4444';
    switch (edge.type) {
      case 'tree':
        return '#10B981';
      case 'back':
        return '#F59E0B';
      case 'forward':
        return '#8B5CF6';
      case 'cross':
        return '#06B6D4';
      default:
        return '#9CA3AF';
    }
  };

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <ArrowDown className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Depth-First Search (DFS)</h3>
            <p className="text-sm text-gray-600">Deep exploration graph traversal using a stack</p>
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
          <h4 className="font-semibold text-purple-900 mb-2">DFS Algorithm Steps:</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Start from the selected node and mark it as visited</li>
            <li>• Push the start node onto a stack</li>
            <li>• While stack is not empty:</li>
            <li>&nbsp;&nbsp;- Look at the top node of the stack</li>
            <li>&nbsp;&nbsp;- If it has unvisited neighbors, visit one and push to stack</li>
            <li>&nbsp;&nbsp;- If no unvisited neighbors, pop from stack (backtrack)</li>
            <li>• Continue until stack is empty</li>
          </ul>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Start Node:</label>
          <select
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            disabled={isPlaying || step > 0}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm
                     bg-white text-gray-900
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={startDFS}
          disabled={isPlaying || isComplete}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Start DFS</span>
        </button>

        <button
          onClick={pauseDFS}
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
            <span className="ml-1 text-purple-600">{step}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Time:</span>
            <span className="ml-1 text-purple-600">{time}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Current:</span>
            <span className="ml-1 text-purple-600">{currentNode || 'None'}</span>
          </div>
        </div>

        {isComplete && <div className="text-sm text-purple-600 font-medium">✓ DFS Complete!</div>}
      </div>

      {/* Stack Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Stack (LIFO):</h4>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">Bottom</span>
          {stack.length === 0 ? (
            <span className="text-sm text-gray-500 italic">Empty</span>
          ) : (
            <>
              {stack.map((nodeId, index) => (
                <div
                  key={`${nodeId}-${index}`}
                  className={`px-3 py-1 rounded text-sm font-medium border ${
                    index === stack.length - 1
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}
                >
                  {nodeId}
                </div>
              ))}
            </>
          )}
          <span className="text-xs text-gray-600">← Top</span>
        </div>
      </div>

      {/* Traversal Order */}
      {traversalOrder.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Traversal Order:</h4>
          <div className="flex items-center space-x-2 flex-wrap">
            {traversalOrder.map((nodeId, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="px-3 py-1 bg-purple-100 text-purple-800 
                             rounded text-sm font-medium border border-purple-200"
                >
                  {nodeId}
                </div>
                {index < traversalOrder.length - 1 && <span className="mx-2 text-gray-400">→</span>}
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
            <pattern id="dfs-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dfs-grid)" />

          {/* Edges */}
          {edges.map((edge) => (
            <path
              key={edge.id}
              d={getEdgePath(edge)}
              stroke={getEdgeColor(edge)}
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
                fill={node.current ? '#EF4444' : node.visited ? '#8B5CF6' : '#6B7280'}
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

              {/* Discovery/Finish time labels */}
              {node.discoveryTime >= 0 && (
                <text
                  x={node.x - 15}
                  y={node.y - 35}
                  textAnchor="middle"
                  className="text-xs font-medium fill-purple-600"
                >
                  {node.discoveryTime}
                  {node.finishTime >= 0 ? `/${node.finishTime}` : ''}
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
          <span className="text-gray-700">Unvisited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
          <span className="text-gray-700">Visited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-gray-700">Current</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-green-500"></div>
          <span className="text-gray-700">Tree Edge</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-red-500"></div>
          <span className="text-gray-700">Active Edge</span>
        </div>
      </div>
    </div>
  );
};

export default DFSVisualization;
