// src/components/models2d/bigo/metaphors/UnionFindVisualization.tsx
// Interactive visualization of Union-Find data structure with path compression

import React, { useState, useEffect } from 'react';

interface UnionFindVisualizationProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface Node {
  id: number;
  parent: number;
  rank: number;
  x: number;
  y: number;
}

interface Edge {
  from: number;
  to: number;
  type: 'union' | 'find';
  active: boolean;
}

const UnionFindVisualization: React.FC<UnionFindVisualizationProps> = ({ className = '' }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize with 8 nodes in a circle
  useEffect(() => {
    const initialNodes: Node[] = [];
    const centerX = 200;
    const centerY = 150;
    const radius = 80;

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      initialNodes.push({
        id: i,
        parent: i, // Initially each node is its own parent
        rank: 0,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }

    setNodes(initialNodes);
    setOperationLog(['Initialized Union-Find with 8 disjoint sets']);
  }, []);

  const find = (nodeId: number): number => {
    if (nodes[nodeId].parent !== nodeId) {
      // Path compression
      const root = find(nodes[nodeId].parent);
      setNodes((prev) =>
        prev.map((node) => (node.id === nodeId ? { ...node, parent: root } : node))
      );
      return root;
    }
    return nodeId;
  };

  const union = (nodeA: number, nodeB: number) => {
    if (isAnimating) return;

    setIsAnimating(true);
    const rootA = find(nodeA);
    const rootB = find(nodeB);

    if (rootA === rootB) {
      setOperationLog((prev) => [
        ...prev,
        `Nodes ${nodeA} and ${nodeB} are already in the same set`,
      ]);
      setIsAnimating(false);
      return;
    }

    // Union by rank
    if (nodes[rootA].rank > nodes[rootB].rank) {
      setNodes((prev) =>
        prev.map((node) => (node.id === rootB ? { ...node, parent: rootA } : node))
      );
      setOperationLog((prev) => [...prev, `Union: Set ${rootB} → Set ${rootA} (by rank)`]);
    } else if (nodes[rootA].rank < nodes[rootB].rank) {
      setNodes((prev) =>
        prev.map((node) => (node.id === rootA ? { ...node, parent: rootA } : node))
      );
      setOperationLog((prev) => [...prev, `Union: Set ${rootA} → Set ${rootB} (by rank)`]);
    } else {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === rootB ? { ...node, parent: rootA, rank: node.rank + 1 } : node
        )
      );
      setOperationLog((prev) => [...prev, `Union: Set ${rootB} → Set ${rootA} (rank increased)`]);
    }

    // Add union edge
    setEdges((prev) => [...prev, { from: nodeA, to: nodeB, type: 'union', active: true }]);

    setTimeout(() => {
      setEdges((prev) =>
        prev.map((edge) =>
          edge.from === nodeA && edge.to === nodeB ? { ...edge, active: false } : edge
        )
      );
      setIsAnimating(false);
    }, 2000);
  };

  const performFind = (nodeId: number) => {
    if (isAnimating) return;

    setIsAnimating(true);
    const root = find(nodeId);
    setOperationLog((prev) => [...prev, `Find(${nodeId}) = ${root}`]);

    // Add find edge
    setEdges((prev) => [...prev, { from: nodeId, to: root, type: 'find', active: true }]);

    setTimeout(() => {
      setEdges((prev) =>
        prev.map((edge) =>
          edge.from === nodeId && edge.to === root ? { ...edge, active: false } : edge
        )
      );
      setIsAnimating(false);
    }, 1500);
  };

  const reset = () => {
    const initialNodes: Node[] = [];
    const centerX = 200;
    const centerY = 150;
    const radius = 80;

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      initialNodes.push({
        id: i,
        parent: i,
        rank: 0,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }

    setNodes(initialNodes);
    setEdges([]);
    setSelectedNodes([]);
    setOperationLog(['Reset: All nodes are now disjoint sets']);
  };

  const getRootNodes = () => {
    const roots = new Set<number>();
    nodes.forEach((node) => roots.add(find(node.id)));
    return Array.from(roots);
  };

  return (
    <div
      className={`relative w-full h-96 bg-white rounded-lg border-2 border-gray-200 p-4 ${className}`}
    >
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          Union-Find: Path Compression & Union by Rank
        </h3>
        <p className="text-sm text-gray-600">
          Watch how amortized analysis makes find operations nearly O(1)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-blue-600">{getRootNodes().length}</div>
          <div className="text-gray-600">Sets</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-green-600">{edges.length}</div>
          <div className="text-gray-600">Operations</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-purple-600">
            {nodes.reduce((sum, node) => sum + (node.parent === node.id ? 0 : 1), 0)}
          </div>
          <div className="text-gray-600">Compressed Paths</div>
        </div>
      </div>

      {/* Visualization */}
      <div className="relative mb-4" style={{ height: '200px' }}>
        <svg width="400" height="200" className="border border-gray-300 rounded">
          {/* Edges */}
          {edges.map((edge, index) => {
            const fromNode = nodes[edge.from];
            const toNode = nodes[edge.to];
            return (
              <line
                key={index}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={edge.type === 'union' ? '#ef4444' : '#3b82f6'}
                strokeWidth={edge.active ? 3 : 1}
                opacity={edge.active ? 1 : 0.3}
                className={edge.active ? 'animate-pulse' : ''}
              />
            );
          })}

          {/* Parent relationships */}
          {nodes.map((node) => {
            if (node.parent !== node.id) {
              const parentNode = nodes[node.parent];
              return (
                <line
                  key={`parent-${node.id}`}
                  x1={node.x}
                  y1={node.y}
                  x2={parentNode.x}
                  y2={parentNode.y}
                  stroke="#6b7280"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
              );
            }
            return null;
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="20"
                fill={node.parent === node.id ? '#10b981' : '#6b7280'}
                stroke={selectedNodes.includes(node.id) ? '#ef4444' : '#374151'}
                strokeWidth={selectedNodes.includes(node.id) ? 3 : 1}
                className="cursor-pointer hover:stroke-blue-500"
                onClick={() => {
                  if (selectedNodes.length === 0) {
                    setSelectedNodes([node.id]);
                  } else if (selectedNodes.length === 1 && selectedNodes[0] !== node.id) {
                    union(selectedNodes[0], node.id);
                    setSelectedNodes([]);
                  } else {
                    setSelectedNodes([]);
                  }
                }}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dy="0.35em"
                className="text-sm font-bold fill-white pointer-events-none"
              >
                {node.id}
              </text>
              {node.rank > 0 && (
                <text x={node.x + 25} y={node.y - 15} className="text-xs fill-gray-600">
                  r:{node.rank}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => selectedNodes.length === 1 && performFind(selectedNodes[0])}
          disabled={selectedNodes.length !== 1 || isAnimating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          Find Root
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
        >
          Reset
        </button>
      </div>

      {/* Operation Log */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Operation Log:</div>
        <div className="bg-gray-50 rounded p-2 h-20 overflow-y-auto text-xs">
          {operationLog.slice(-5).map((log, index) => (
            <div key={index} className="text-gray-600">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="text-xs text-gray-600 text-center">
        <p>
          <strong>Amortized Analysis:</strong> Path compression makes find operations very fast on
          average, approaching O(1) despite worst-case O(log n) per operation.
        </p>
      </div>
    </div>
  );
};

export default UnionFindVisualization;
