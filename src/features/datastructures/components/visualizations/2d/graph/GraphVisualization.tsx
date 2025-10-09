import React, { useState, useCallback, useRef } from 'react';
import { Play, RotateCcw, Plus, Minus, Info, MousePointer } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  visited?: boolean;
  distance?: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight?: number;
  directed?: boolean;
  color: string;
  highlighted?: boolean;
}

interface GraphVisualizationProps {
  directed?: boolean;
  weighted?: boolean;
  className?: string;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  directed = false,
  weighted = false,
  className = '',
}) => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [edgeStart, setEdgeStart] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);
  const [mode, setMode] = useState<'add-node' | 'add-edge' | 'select'>('select');
  const svgRef = useRef<SVGSVGElement>(null);

  const addNode = useCallback(
    (x: number, y: number) => {
      const nodeId = `node-${nodes.length + 1}`;
      const newNode: GraphNode = {
        id: nodeId,
        label: String.fromCharCode(65 + nodes.length), // A, B, C, ...
        x,
        y,
        color: '#3B82F6',
        visited: false,
      };
      setNodes((prev) => [...prev, newNode]);
    },
    [nodes.length]
  );

  const addEdge = useCallback(
    (sourceId: string, targetId: string) => {
      const edgeId = `edge-${sourceId}-${targetId}`;
      const existingEdge = edges.find(
        (e) =>
          (e.source === sourceId && e.target === targetId) ||
          (!directed && e.source === targetId && e.target === sourceId)
      );

      if (!existingEdge) {
        const newEdge: GraphEdge = {
          id: edgeId,
          source: sourceId,
          target: targetId,
          weight: weighted ? Math.floor(Math.random() * 10) + 1 : undefined,
          directed,
          color: '#6B7280',
          highlighted: false,
        };
        setEdges((prev) => [...prev, newEdge]);
      }
    },
    [edges, directed, weighted]
  );

  const handleSVGClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 800;
      const y = ((event.clientY - rect.top) / rect.height) * 400;

      if (mode === 'add-node') {
        addNode(x, y);
      }
    },
    [mode, addNode]
  );

  const handleNodeClick = useCallback(
    (nodeId: string, event: React.MouseEvent) => {
      event.stopPropagation();

      if (mode === 'add-edge') {
        if (!edgeStart) {
          setEdgeStart(nodeId);
          setSelectedNode(nodeId);
        } else if (edgeStart !== nodeId) {
          addEdge(edgeStart, nodeId);
          setEdgeStart(null);
          setSelectedNode(null);
          setMode('select');
        }
      } else {
        setSelectedNode(selectedNode === nodeId ? null : nodeId);
      }
    },
    [mode, edgeStart, addEdge, selectedNode]
  );

  const handleNodeMouseDown = useCallback(
    (nodeId: string, event: React.MouseEvent) => {
      if (mode === 'select') {
        setDraggedNode(nodeId);
        const node = nodes.find((n) => n.id === nodeId);
        if (node && svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 800;
          const y = ((event.clientY - rect.top) / rect.height) * 400;
          setDragOffset({ x: x - node.x, y: y - node.y });
        }
      }
    },
    [mode, nodes]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (draggedNode && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 800;
        const y = ((event.clientY - rect.top) / rect.height) * 400;

        setNodes((prev) =>
          prev.map((node) =>
            node.id === draggedNode ? { ...node, x: x - dragOffset.x, y: y - dragOffset.y } : node
          )
        );
      }
    },
    [draggedNode, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const resetGraph = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setEdgeStart(null);
    setMode('select');
  };

  const createSampleGraph = () => {
    resetGraph();
    setTimeout(() => {
      const sampleNodes: GraphNode[] = [
        { id: 'A', label: 'A', x: 150, y: 100, color: '#3B82F6' },
        { id: 'B', label: 'B', x: 350, y: 100, color: '#3B82F6' },
        { id: 'C', label: 'C', x: 250, y: 200, color: '#3B82F6' },
        { id: 'D', label: 'D', x: 450, y: 200, color: '#3B82F6' },
        { id: 'E', label: 'E', x: 350, y: 300, color: '#3B82F6' },
      ];

      const sampleEdges: GraphEdge[] = [
        {
          id: 'AB',
          source: 'A',
          target: 'B',
          color: '#6B7280',
          directed,
          weight: weighted ? 5 : undefined,
        },
        {
          id: 'AC',
          source: 'A',
          target: 'C',
          color: '#6B7280',
          directed,
          weight: weighted ? 3 : undefined,
        },
        {
          id: 'BC',
          source: 'B',
          target: 'C',
          color: '#6B7280',
          directed,
          weight: weighted ? 2 : undefined,
        },
        {
          id: 'BD',
          source: 'B',
          target: 'D',
          color: '#6B7280',
          directed,
          weight: weighted ? 4 : undefined,
        },
        {
          id: 'CE',
          source: 'C',
          target: 'E',
          color: '#6B7280',
          directed,
          weight: weighted ? 6 : undefined,
        },
        {
          id: 'DE',
          source: 'D',
          target: 'E',
          color: '#6B7280',
          directed,
          weight: weighted ? 1 : undefined,
        },
      ];

      setNodes(sampleNodes);
      setEdges(sampleEdges);
    }, 100);
  };

  const getEdgePath = (edge: GraphEdge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return '';

    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Offset to node radius
    const nodeRadius = 25;
    const offsetX = (dx / length) * nodeRadius;
    const offsetY = (dy / length) * nodeRadius;

    const startX = sourceNode.x + offsetX;
    const startY = sourceNode.y + offsetY;
    const endX = targetNode.x - offsetX;
    const endY = targetNode.y - offsetY;

    return `M ${startX} ${startY} L ${endX} ${endY}`;
  };

  const getEdgeMidpoint = (edge: GraphEdge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return { x: 0, y: 0 };

    return {
      x: (sourceNode.x + targetNode.x) / 2,
      y: (sourceNode.y + targetNode.y) / 2,
    };
  };

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {directed ? 'Directed' : 'Undirected'} Graph {weighted && '(Weighted)'}
            </h3>
            <p className="text-sm text-gray-600">Interactive graph builder and visualizer</p>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Graph Builder Instructions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Select "Add Node" mode and click on canvas to add nodes</li>
            <li>• Select "Add Edge" mode and click two nodes to connect them</li>
            <li>• Use "Select" mode to drag nodes around</li>
            <li>• {directed ? 'Edges have direction (arrows)' : 'Edges are bidirectional'}</li>
            {weighted && <li>• Edge weights are randomly assigned</li>}
          </ul>
        </div>
      )}

      {/* Mode Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setMode('select');
            setEdgeStart(null);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
            mode === 'select'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MousePointer className="w-4 h-4" />
          <span>Select</span>
        </button>

        <button
          onClick={() => {
            setMode('add-node');
            setEdgeStart(null);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
            mode === 'add-node'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Node</span>
        </button>

        <button
          onClick={() => {
            setMode('add-edge');
            setEdgeStart(null);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
            mode === 'add-edge'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Minus className="w-4 h-4 rotate-90" />
          <span>Add Edge</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={createSampleGraph}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Sample Graph</span>
        </button>

        <button
          onClick={resetGraph}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Status */}
      {mode === 'add-edge' && edgeStart && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            Selected node: <strong>{nodes.find((n) => n.id === edgeStart)?.label}</strong>. Click
            another node to create an edge.
          </p>
        </div>
      )}

      {/* Graph Visualization */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 800 400"
          className="w-full h-96 bg-gray-50 cursor-pointer"
          onClick={handleSVGClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Background pattern */}
          <defs>
            <pattern id="graph-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>

            {/* Arrow marker for directed graphs */}
            {directed && (
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
              </marker>
            )}
          </defs>
          <rect width="100%" height="100%" fill="url(#graph-grid)" />

          {/* Edges */}
          {edges.map((edge) => {
            const midpoint = getEdgeMidpoint(edge);
            return (
              <g key={edge.id}>
                <path
                  d={getEdgePath(edge)}
                  stroke={edge.highlighted ? '#EF4444' : edge.color}
                  strokeWidth={edge.highlighted ? '3' : '2'}
                  fill="none"
                  markerEnd={directed ? 'url(#arrowhead)' : undefined}
                  className="transition-all duration-300"
                />

                {/* Weight label */}
                {weighted && edge.weight && (
                  <g>
                    <circle
                      cx={midpoint.x}
                      cy={midpoint.y}
                      r="12"
                      fill="white"
                      stroke="#6B7280"
                      strokeWidth="1"
                    />
                    <text
                      x={midpoint.x}
                      y={midpoint.y + 4}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-800"
                    >
                      {edge.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="25"
                fill={selectedNode === node.id ? '#EF4444' : node.color}
                stroke={selectedNode === node.id ? '#DC2626' : '#1F2937'}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-300 hover:stroke-4"
                onClick={(e) => handleNodeClick(node.id, e)}
                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                className="text-sm font-bold fill-white pointer-events-none"
              >
                {node.label}
              </text>
            </g>
          ))}

          {/* Empty state */}
          {nodes.length === 0 && (
            <text x="400" y="200" textAnchor="middle" className="text-lg fill-gray-400">
              Click "Sample Graph" or add nodes to build your graph
            </text>
          )}
        </svg>
      </div>

      {/* Graph Statistics */}
      {nodes.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-semibold text-gray-900">Vertices</div>
            <div className="text-blue-600">{nodes.length}</div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-semibold text-gray-900">Edges</div>
            <div className="text-blue-600">{edges.length}</div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-semibold text-gray-900">Type</div>
            <div className="text-blue-600">{directed ? 'Directed' : 'Undirected'}</div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-semibold text-gray-900">Density</div>
            <div className="text-blue-600">
              {nodes.length > 1
                ? (
                    (edges.length / ((nodes.length * (nodes.length - 1)) / (directed ? 1 : 2))) *
                    100
                  ).toFixed(1) + '%'
                : '0%'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;
