import React, { useState, useMemo, useCallback } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../types/nextjs';

interface ComponentNode {
  id: string;
  name: string;
  type: 'server' | 'client' | 'shared';
  children?: ComponentNode[];
  props?: Record<string, unknown>;
  state?: Record<string, unknown>;
  effects?: string[];
  description?: string;
}

interface TreeLayout {
  node: ComponentNode;
  x: number;
  y: number;
  width: number;
  height: number;
  children: TreeLayout[];
}

interface ComponentTree2DProps extends BaseNextJSVisualizationProps {
  componentTree?: ComponentNode;
  showDetails?: boolean;
  highlightPath?: string[];
}

const ComponentTree2D: React.FC<ComponentTree2DProps> = ({
  componentTree: initialTree,
  showDetails = true,
  className = '',
}) => {
  const [selectedNode, setSelectedNode] = useState<ComponentNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Generate sample component tree
  const generateSampleTree = (): ComponentNode => ({
    id: 'root',
    name: 'App',
    type: 'server',
    children: [
      {
        id: 'layout',
        name: 'RootLayout',
        type: 'server',
        children: [
          {
            id: 'header',
            name: 'Header',
            type: 'client',
            props: { user: 'John Doe', theme: 'dark' },
            state: { isMenuOpen: false },
            effects: ['useEffect(() => { ... })'],
            description: 'Client component with interactive menu',
          },
          {
            id: 'main',
            name: 'MainContent',
            type: 'server',
            children: [
              {
                id: 'sidebar',
                name: 'Sidebar',
                type: 'client',
                props: { items: ['Home', 'About', 'Contact'] },
                state: { activeItem: 'Home' },
                effects: ['useState', 'useEffect'],
                description: 'Interactive navigation sidebar',
              },
              {
                id: 'content',
                name: 'PageContent',
                type: 'server',
                children: [
                  {
                    id: 'hero',
                    name: 'HeroSection',
                    type: 'server',
                    props: { title: 'Welcome', subtitle: 'Learn Next.js' },
                    description: 'Static hero section',
                  },
                  {
                    id: 'interactive',
                    name: 'InteractiveDemo',
                    type: 'client',
                    props: { data: [1, 2, 3, 4, 5] },
                    state: { selectedItems: [1, 3] },
                    effects: ['useState', 'useCallback'],
                    description: 'Interactive data visualization',
                  },
                  {
                    id: 'comments',
                    name: 'CommentsSection',
                    type: 'client',
                    props: { postId: '123' },
                    state: { comments: [], isLoading: false },
                    effects: ['useEffect', 'useState'],
                    description: 'Dynamic comments with API calls',
                  },
                ],
              },
            ],
          },
          {
            id: 'footer',
            name: 'Footer',
            type: 'server',
            props: { year: 2025, links: ['Privacy', 'Terms'] },
            description: 'Static footer content',
          },
        ],
      },
    ],
  });

  const componentTree = initialTree || generateSampleTree();

  // Get node color based on type
  const getNodeColor = (type: string): string => {
    switch (type) {
      case 'server':
        return '#10b981'; // green
      case 'client':
        return '#3b82f6'; // blue
      case 'shared':
        return '#8b5cf6'; // purple
      default:
        return '#6b7280'; // gray
    }
  };

  // Get node icon based on type
  const getNodeIcon = (type: string): string => {
    switch (type) {
      case 'server':
        return '🖥️';
      case 'client':
        return '💻';
      case 'shared':
        return '🔄';
      default:
        return '📦';
    }
  };

  // Calculate tree layout
  const calculateLayout = useCallback(
    (node: ComponentNode, level = 0, index = 0, parentX = 400): TreeLayout => {
      const children = node.children || [];
      const nodeWidth = 120;
      const nodeHeight = 60;
      const levelSpacing = 120;
      const siblingSpacing = 140;

      // Calculate position
      const x = parentX + (index - (children.length - 1) / 2) * siblingSpacing;
      const y = level * levelSpacing + 50;

      // Calculate children positions
      const childLayouts = children.map((child, childIndex) =>
        calculateLayout(child, level + 1, childIndex, x)
      );

      return {
        node,
        x,
        y,
        width: nodeWidth,
        height: nodeHeight,
        children: childLayouts,
      };
    },
    []
  );

  const treeLayout = useMemo(
    () => calculateLayout(componentTree),
    [calculateLayout, componentTree]
  );

  // Render tree node
  const renderNode = (layout: TreeLayout, isHighlighted = false) => {
    const { node, x, y, width, height, children } = layout;
    const isSelected = selectedNode?.id === node.id;
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = children && children.length > 0;

    return (
      <g key={node.id}>
        {/* Connection lines to children */}
        {hasChildren &&
          children.map((child: TreeLayout) => (
            <line
              key={`line-${node.id}-${child.node.id}`}
              x1={x + width / 2}
              y1={y + height}
              x2={child.x + child.width / 2}
              y2={child.y}
              stroke="#d1d5db"
              strokeWidth="2"
              opacity={isExpanded ? 1 : 0.3}
            />
          ))}

        {/* Node */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={getNodeColor(node.type)}
          stroke={isSelected ? '#ef4444' : isHighlighted ? '#f59e0b' : '#374151'}
          strokeWidth={isSelected ? 3 : isHighlighted ? 2 : 1}
          rx="8"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setSelectedNode(node)}
        />

        {/* Node icon */}
        <text x={x + 15} y={y + 20} fontSize="16" fill="white" className="pointer-events-none">
          {getNodeIcon(node.type)}
        </text>

        {/* Node name */}
        <text
          x={x + width / 2}
          y={y + 35}
          textAnchor="middle"
          fontSize="11"
          fill="white"
          fontWeight="bold"
          className="pointer-events-none"
        >
          {node.name}
        </text>

        {/* Node type label */}
        <text
          x={x + width / 2}
          y={y + 48}
          textAnchor="middle"
          fontSize="9"
          fill="white"
          opacity="0.9"
          className="pointer-events-none"
        >
          {node.type.toUpperCase()}
        </text>

        {/* Expand/collapse button */}
        {hasChildren && (
          <circle
            cx={x + width - 12}
            cy={y + 12}
            r="8"
            fill="rgba(255,255,255,0.2)"
            className="cursor-pointer hover:fill-white hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              const newExpanded = new Set(expandedNodes);
              if (newExpanded.has(node.id)) {
                newExpanded.delete(node.id);
              } else {
                newExpanded.add(node.id);
              }
              setExpandedNodes(newExpanded);
            }}
          />
        )}

        {/* Render children if expanded */}
        {isExpanded && children && children.map((child: TreeLayout) => renderNode(child))}
      </g>
    );
  };

  // Get all nodes in the tree
  const getAllNodes = (node: ComponentNode): ComponentNode[] => {
    const nodes = [node];
    if (node.children) {
      node.children.forEach((child) => {
        nodes.push(...getAllNodes(child));
      });
    }
    return nodes;
  };

  const allNodes = getAllNodes(componentTree);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Server & Client Component Tree</h3>
        <p className="text-gray-600">
          Visual representation of component hierarchy and execution environment
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setExpandedNodes(new Set())}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Reset View
          </button>
          <button
            onClick={() => {
              const newExpanded = new Set(allNodes.map((n) => n.id));
              setExpandedNodes(newExpanded);
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedNodes(new Set())}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Collapse All
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Server Component</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Client Component</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Shared Component</span>
          </div>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="relative overflow-x-auto">
          <svg width="800" height="600" viewBox="0 0 800 600" className="w-full h-auto">
            {renderNode(treeLayout)}
          </svg>
        </div>
      </div>

      {/* Node Details */}
      {selectedNode && showDetails && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <span>{getNodeIcon(selectedNode.type)}</span>
              <span>{selectedNode.name}</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  selectedNode.type === 'server'
                    ? 'bg-green-100 text-green-800'
                    : selectedNode.type === 'client'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                }`}
              >
                {selectedNode.type.toUpperCase()}
              </span>
            </h4>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {selectedNode.description && (
            <p className="text-gray-600 mb-4">{selectedNode.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Props */}
            {selectedNode.props && Object.keys(selectedNode.props).length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Props</h5>
                <div className="space-y-1">
                  {Object.entries(selectedNode.props).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-blue-600">{key}:</span>{' '}
                      <span className="text-gray-700">
                        {Array.isArray(value) ? `[${value.join(', ')}]` : JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* State */}
            {selectedNode.state && Object.keys(selectedNode.state).length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">State</h5>
                <div className="space-y-1">
                  {Object.entries(selectedNode.state).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-purple-600">{key}:</span>{' '}
                      <span className="text-gray-700">
                        {Array.isArray(value) ? `[${value.join(', ')}]` : JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Effects */}
            {selectedNode.effects && selectedNode.effects.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Effects</h5>
                <div className="space-y-1">
                  {selectedNode.effects.map((effect, index) => (
                    <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {effect}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Execution Environment Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Execution Environment</h5>
            <div className="text-sm text-gray-600">
              {selectedNode.type === 'server' && (
                <div>
                  <p className="mb-2">
                    <strong>Server Components</strong> run on the server during the build process or
                    request time. They can access server-side resources like databases, file
                    systems, and environment variables.
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Cannot use browser APIs (window, document, etc.)</li>
                    <li>Cannot use React hooks like useState, useEffect</li>
                    <li>Can be async and fetch data directly</li>
                    <li>Reduce bundle size by keeping logic on server</li>
                  </ul>
                </div>
              )}
              {selectedNode.type === 'client' && (
                <div>
                  <p className="mb-2">
                    <strong>Client Components</strong> run in the browser and provide interactivity.
                    They have access to browser APIs and can respond to user interactions.
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Can use browser APIs and DOM manipulation</li>
                    <li>Can use React hooks (useState, useEffect, etc.)</li>
                    <li>Increase bundle size as code ships to browser</li>
                    <li>Enable user interactions and dynamic behavior</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {allNodes.filter((n) => n.type === 'server').length}
          </div>
          <div className="text-sm text-gray-600">Server Components</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {allNodes.filter((n) => n.type === 'client').length}
          </div>
          <div className="text-sm text-gray-600">Client Components</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{allNodes.length}</div>
          <div className="text-sm text-gray-600">Total Components</div>
        </div>
      </div>
    </div>
  );
};

export default ComponentTree2D;
