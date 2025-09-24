// src/components/models2d/bigo/casestudies/NetworkRoutingVisualization.tsx
// Interactive visualization of network routing algorithms and their complexity

import React, { useState, useEffect } from 'react';

interface NetworkRoutingVisualizationProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
  active?: boolean;
}

interface RoutingResult {
  algorithm: string;
  path: string[];
  totalCost: number;
  time: number;
  description: string;
  visitedNodes: string[];
}

const NetworkRoutingVisualization: React.FC<NetworkRoutingVisualizationProps> = ({
  className = '',
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [routingResults, setRoutingResults] = useState<RoutingResult[]>([]);
  const [isRouting, setIsRouting] = useState(false);
  const [startNode, setStartNode] = useState('A');
  const [endNode, setEndNode] = useState('F');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);

  // Initialize network topology
  useEffect(() => {
    const networkNodes: Node[] = [
      { id: 'A', x: 50, y: 100, label: 'NYC' },
      { id: 'B', x: 150, y: 50, label: 'Boston' },
      { id: 'C', x: 250, y: 100, label: 'DC' },
      { id: 'D', x: 150, y: 150, label: 'Philly' },
      { id: 'E', x: 350, y: 50, label: 'Chicago' },
      { id: 'F', x: 350, y: 150, label: 'Detroit' },
    ];

    const networkEdges: Edge[] = [
      { from: 'A', to: 'B', weight: 4 },
      { from: 'A', to: 'D', weight: 2 },
      { from: 'B', to: 'C', weight: 3 },
      { from: 'B', to: 'E', weight: 7 },
      { from: 'C', to: 'E', weight: 5 },
      { from: 'C', to: 'F', weight: 6 },
      { from: 'D', to: 'C', weight: 1 },
      { from: 'D', to: 'F', weight: 8 },
      { from: 'E', to: 'F', weight: 2 },
    ];

    setNodes(networkNodes);
    setEdges(networkEdges);
  }, []);

  const simulateRouting = (
    algorithm: string,
    start: string,
    end: string,
    nodes: Node[],
    edges: Edge[]
  ): RoutingResult => {
    const graph: { [key: string]: { [key: string]: number } } = {};

    // Build adjacency list
    nodes.forEach((node) => {
      graph[node.id] = {};
    });

    edges.forEach((edge) => {
      graph[edge.from][edge.to] = edge.weight;
      graph[edge.to][edge.from] = edge.weight; // Undirected graph
    });

    switch (algorithm) {
      case 'brute-force': {
        // O(n!) - Try all possible paths
        let bruteTime = 0;
        let bestPath: string[] = [];
        let bestCost = Infinity;

        const findAllPaths = (
          current: string,
          target: string,
          path: string[],
          cost: number,
          visited: Set<string>
        ): void => {
          bruteTime += 2; // Processing time per node visit

          if (current === target) {
            if (cost < bestCost) {
              bestCost = cost;
              bestPath = [...path];
            }
            return;
          }

          for (const neighbor in graph[current]) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              path.push(neighbor);
              findAllPaths(neighbor, target, path, cost + graph[current][neighbor], visited);
              path.pop();
              visited.delete(neighbor);
            }
          }
        };

        const visited = new Set<string>();
        visited.add(start);
        findAllPaths(start, end, [start], 0, visited);

        return {
          algorithm: 'Brute Force',
          path: bestPath,
          totalCost: bestCost,
          time: bruteTime,
          description: 'Tries every possible path - exponential time',
          visitedNodes: [], // Too many to track
        };
      }

      case 'dijkstra': {
        // O((V+E)log V) - Dijkstra's algorithm
        let dijkstraTime = 0;
        const distances: { [key: string]: number } = {};
        const previous: { [key: string]: string | null } = {};
        const unvisited = new Set<string>();
        const visitedNodes: string[] = [];

        // Initialize
        nodes.forEach((node) => {
          distances[node.id] = node.id === start ? 0 : Infinity;
          previous[node.id] = null;
          unvisited.add(node.id);
        });

        while (unvisited.size > 0) {
          dijkstraTime += 5; // Priority queue operations

          // Find minimum distance node
          let minNode = '';
          let minDistance = Infinity;
          for (const node of unvisited) {
            if (distances[node] < minDistance) {
              minDistance = distances[node];
              minNode = node;
            }
          }

          if (minNode === '' || distances[minNode] === Infinity) break;

          unvisited.delete(minNode);
          visitedNodes.push(minNode);

          if (minNode === end) break;

          // Update neighbors
          for (const neighbor in graph[minNode]) {
            if (unvisited.has(neighbor)) {
              dijkstraTime += 3; // Distance update
              const alt = distances[minNode] + graph[minNode][neighbor];
              if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = minNode;
              }
            }
          }
        }

        // Reconstruct path
        const path: string[] = [];
        let current: string | null = end;
        while (current) {
          path.unshift(current);
          current = previous[current];
        }

        return {
          algorithm: 'Dijkstra',
          path: path,
          totalCost: distances[end],
          time: dijkstraTime,
          description: 'Priority queue based shortest path',
          visitedNodes: visitedNodes,
        };
      }

      case 'bellman-ford': {
        // O(V*E) - Bellman-Ford algorithm
        let bfTime = 0;
        const distances: { [key: string]: number } = {};
        const previous: { [key: string]: string | null } = {};

        // Initialize
        nodes.forEach((node) => {
          distances[node.id] = node.id === start ? 0 : Infinity;
          previous[node.id] = null;
        });

        // Relax edges V-1 times
        for (let i = 0; i < nodes.length - 1; i++) {
          for (const edge of edges) {
            bfTime += 2; // Edge relaxation
            const u = edge.from;
            const v = edge.to;
            const weight = edge.weight;

            if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
              distances[v] = distances[u] + weight;
              previous[v] = u;
            }

            // Since undirected, also check reverse
            if (distances[v] !== Infinity && distances[v] + weight < distances[u]) {
              distances[u] = distances[v] + weight;
              previous[u] = v;
            }
          }
        }

        // Reconstruct path
        const path: string[] = [];
        let current: string | null = end;
        while (current) {
          path.unshift(current);
          current = previous[current];
        }

        return {
          algorithm: 'Bellman-Ford',
          path: path,
          totalCost: distances[end],
          time: bfTime,
          description: 'Handles negative edges, slower but robust',
          visitedNodes: [], // All edges processed multiple times
        };
      }

      case 'a-star': {
        // O(b^d) worst case, but often much better with heuristic
        let astarTime = 0;
        const previous: { [key: string]: string | null } = {};
        const fScores: { [key: string]: number } = {};
        const gScores: { [key: string]: number } = {};
        const openSet = new Set<string>();
        const closedSet = new Set<string>();
        const visitedNodes: string[] = [];

        // Simple heuristic: Euclidean distance
        const heuristic = (nodeId: string, goalId: string): number => {
          const node = nodes.find((n) => n.id === nodeId)!;
          const goal = nodes.find((n) => n.id === goalId)!;
          return Math.sqrt(Math.pow(node.x - goal.x, 2) + Math.pow(node.y - goal.y, 2));
        };

        // Initialize
        nodes.forEach((node) => {
          gScores[node.id] = node.id === start ? 0 : Infinity;
          fScores[node.id] = node.id === start ? heuristic(start, end) : Infinity;
          previous[node.id] = null;
        });

        openSet.add(start);

        while (openSet.size > 0) {
          astarTime += 4; // Priority queue operations

          // Find node with lowest f-score
          let current = '';
          let lowestF = Infinity;
          for (const node of openSet) {
            if (fScores[node] < lowestF) {
              lowestF = fScores[node];
              current = node;
            }
          }

          if (current === end) {
            visitedNodes.push(current);
            break;
          }

          openSet.delete(current);
          closedSet.add(current);
          visitedNodes.push(current);

          // Check neighbors
          for (const neighbor in graph[current]) {
            if (closedSet.has(neighbor)) continue;

            const tentativeG = gScores[current] + graph[current][neighbor];

            if (!openSet.has(neighbor)) {
              openSet.add(neighbor);
            } else if (tentativeG >= gScores[neighbor]) {
              continue;
            }

            astarTime += 3; // Neighbor processing
            previous[neighbor] = current;
            gScores[neighbor] = tentativeG;
            fScores[neighbor] = gScores[neighbor] + heuristic(neighbor, end);
          }
        }

        // Reconstruct path
        const path: string[] = [];
        let current: string | null = end;
        while (current) {
          path.unshift(current);
          current = previous[current];
        }

        return {
          algorithm: 'A* Search',
          path: path,
          totalCost: gScores[end],
          time: astarTime,
          description: 'Heuristic-guided search, often optimal',
          visitedNodes: visitedNodes,
        };
      }

      default:
        return {
          algorithm: '',
          path: [],
          totalCost: 0,
          time: 0,
          description: '',
          visitedNodes: [],
        };
    }
  };

  const runRouting = async () => {
    if (!startNode || !endNode || startNode === endNode) return;

    setIsRouting(true);
    const algorithms = ['brute-force', 'dijkstra', 'bellman-ford', 'a-star'];
    const results: RoutingResult[] = [];

    for (const algorithm of algorithms) {
      const result = simulateRouting(algorithm, startNode, endNode, nodes, edges);
      results.push(result);
      setRoutingResults([...results]);
      await new Promise((resolve) => setTimeout(resolve, 800)); // Animation delay
    }

    setIsRouting(false);
  };

  const getBarHeight = (time: number) => {
    const maxTime = Math.max(...routingResults.map((r) => r.time));
    return maxTime > 0 ? (time / maxTime) * 120 : 0;
  };

  const getTimeColor = (time: number) => {
    const maxTime = Math.max(...routingResults.map((r) => r.time));
    const ratio = time / maxTime;
    if (ratio < 0.25) return '#10b981'; // green
    if (ratio < 0.5) return '#84cc16'; // lime
    if (ratio < 0.75) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const renderNetwork = () => {
    const selectedResult = routingResults.find((r) => r.algorithm === selectedAlgorithm);
    const activePath = selectedResult?.path || [];
    const visitedNodes = selectedResult?.visitedNodes || [];

    return (
      <svg viewBox="0 0 400 200" className="w-full h-48 border rounded bg-gray-50">
        {/* Edges */}
        {edges.map((edge, index) => {
          const fromNode = nodes.find((n) => n.id === edge.from)!;
          const toNode = nodes.find((n) => n.id === edge.to)!;
          const isActive =
            activePath.includes(edge.from) &&
            activePath.includes(edge.to) &&
            Math.abs(activePath.indexOf(edge.from) - activePath.indexOf(edge.to)) === 1;

          return (
            <g key={index}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={isActive ? '#3b82f6' : '#d1d5db'}
                strokeWidth={isActive ? 3 : 2}
                className={isActive ? 'animate-pulse' : ''}
              />
              <text
                x={(fromNode.x + toNode.x) / 2}
                y={(fromNode.y + toNode.y) / 2 - 5}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {edge.weight}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isStart = node.id === startNode;
          const isEnd = node.id === endNode;
          const isInPath = activePath.includes(node.id);
          const isVisited = visitedNodes.includes(node.id);

          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={isStart || isEnd ? 12 : 10}
                fill={
                  isStart
                    ? '#10b981'
                    : isEnd
                      ? '#ef4444'
                      : isInPath
                        ? '#3b82f6'
                        : isVisited
                          ? '#fbbf24'
                          : '#e5e7eb'
                }
                stroke="#374151"
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                className="text-xs font-bold fill-white"
              >
                {node.id}
              </text>
              <text
                x={node.x}
                y={node.y + 20}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div
      className={`relative w-full h-96 bg-white rounded-lg border-2 border-gray-200 p-4 ${className}`}
    >
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Network Routing Algorithms</h3>
        <p className="text-sm text-gray-600">
          From O(n!) brute force to O((V+E)log V) optimized routing
        </p>
      </div>

      {/* Network Visualization */}
      <div className="mb-4">{renderNetwork()}</div>

      {/* Controls */}
      <div className="flex justify-center items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">From:</label>
          <select
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">To:</label>
          <select
            value={endNode}
            onChange={(e) => setEndNode(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={runRouting}
          disabled={isRouting || startNode === endNode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isRouting ? 'Routing...' : 'Find Route'}
        </button>
      </div>

      {/* Performance Comparison */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Algorithm Performance:</div>
        <div className="flex items-end justify-center space-x-4 h-24">
          {routingResults.map((result, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-12 bg-gradient-to-t rounded-t cursor-pointer transition-all hover:opacity-80"
                style={{
                  height: `${getBarHeight(result.time)}px`,
                  backgroundColor:
                    getBarHeight(result.time) > 0 ? getTimeColor(result.time) : '#e5e7eb',
                }}
                onClick={() => setSelectedAlgorithm(result.algorithm)}
                title={`${result.algorithm}: ${result.time}ms, cost: ${result.totalCost}`}
              />
              <div className="text-xs text-gray-600 mt-2 text-center max-w-16 truncate">
                {result.algorithm}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Details */}
      {selectedAlgorithm && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">{selectedAlgorithm} Route:</h4>
          <div className="bg-blue-50 rounded p-3">
            <div className="text-sm text-blue-800 mb-2">
              <strong>Path:</strong>{' '}
              {routingResults.find((r) => r.algorithm === selectedAlgorithm)?.path.join(' → ') ||
                'No path found'}
            </div>
            <div className="text-sm text-blue-800 mb-2">
              <strong>Total Cost:</strong>{' '}
              {routingResults.find((r) => r.algorithm === selectedAlgorithm)?.totalCost || 'N/A'}
            </div>
            <div className="text-sm text-blue-800">
              <strong>Description:</strong>{' '}
              {routingResults.find((r) => r.algorithm === selectedAlgorithm)?.description || ''}
            </div>
          </div>
        </div>
      )}

      {/* Algorithm Explanations */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
        <div>
          <strong className="text-red-600">Brute Force:</strong> O(n!) - tries all paths,
          impractical for large networks
        </div>
        <div>
          <strong className="text-green-600">Dijkstra:</strong> O((V+E)log V) - priority queue,
          finds shortest path
        </div>
        <div>
          <strong className="text-blue-600">Bellman-Ford:</strong> O(V×E) - handles negative edges,
          slower but robust
        </div>
        <div>
          <strong className="text-purple-600">A* Search:</strong> O(b^d) worst case -
          heuristic-guided, often much faster
        </div>
      </div>

      {/* Real-World Impact */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="text-xs text-blue-800">
          <strong>Real-World Impact:</strong> GPS navigation uses A* variants to route millions of
          users. Internet routing protocols like OSPF use Dijkstra's algorithm for optimal path
          finding!
        </div>
      </div>
    </div>
  );
};

export default NetworkRoutingVisualization;
