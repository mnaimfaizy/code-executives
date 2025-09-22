import React, { useState } from 'react';

interface DOMNode {
  id: string;
  tagName: string;
  children?: DOMNode[];
  attributes?: Record<string, string>;
  content?: string;
}

interface DOMTreeVisualizationProps {
  isActive?: boolean;
  animationStep?: number;
  className?: string;
}

const DOMTreeVisualization: React.FC<DOMTreeVisualizationProps> = ({
  isActive = false,
  animationStep = 0,
  className = '',
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Sample DOM tree structure
  const domTree: DOMNode = {
    id: 'root',
    tagName: 'html',
    children: [
      {
        id: 'head',
        tagName: 'head',
        children: [
          { id: 'title', tagName: 'title', content: 'My App' },
          { id: 'meta', tagName: 'meta', attributes: { charset: 'UTF-8' } },
        ],
      },
      {
        id: 'body',
        tagName: 'body',
        children: [
          {
            id: 'header',
            tagName: 'header',
            children: [{ id: 'h1', tagName: 'h1', content: 'Welcome' }],
          },
          {
            id: 'main',
            tagName: 'main',
            children: [
              {
                id: 'div1',
                tagName: 'div',
                attributes: { class: 'container' },
                children: [
                  { id: 'p1', tagName: 'p', content: 'Hello World!' },
                  {
                    id: 'ul',
                    tagName: 'ul',
                    children: [
                      { id: 'li1', tagName: 'li', content: 'Item 1' },
                      { id: 'li2', tagName: 'li', content: 'Item 2' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const renderNode = (
    node: DOMNode,
    x: number,
    y: number,
    level: number = 0
  ): React.ReactElement => {
    const isSelected = selectedNode === node.id;
    const isHovered = hoveredNode === node.id;
    const nodeWidth = Math.max(80, node.tagName.length * 8 + 20);
    const nodeHeight = 30;

    return (
      <g key={node.id}>
        {/* Node rectangle */}
        <rect
          x={x - nodeWidth / 2}
          y={y}
          width={nodeWidth}
          height={nodeHeight}
          fill={isSelected ? '#3B82F6' : isHovered ? '#93C5FD' : '#E5E7EB'}
          stroke={isSelected ? '#1D4ED8' : '#9CA3AF'}
          strokeWidth={2}
          rx={4}
          className="cursor-pointer transition-all duration-200"
          onClick={() => setSelectedNode(node.id)}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
        />

        {/* Node text */}
        <text
          x={x}
          y={y + 20}
          textAnchor="middle"
          className="text-sm font-medium fill-gray-900 pointer-events-none"
        >
          &lt;{node.tagName}&gt;
        </text>

        {/* Content indicator */}
        {node.content && (
          <circle
            cx={x + nodeWidth / 2 - 8}
            cy={y + 8}
            r={4}
            fill="#10B981"
            className="pointer-events-none"
          />
        )}

        {/* Attributes indicator */}
        {node.attributes && Object.keys(node.attributes).length > 0 && (
          <circle
            cx={x - nodeWidth / 2 + 8}
            cy={y + 8}
            r={4}
            fill="#F59E0B"
            className="pointer-events-none"
          />
        )}

        {/* Children */}
        {(node.children || []).map((child, index) => {
          const childX = x + (index - ((node.children || []).length - 1) / 2) * 120;
          const childY = y + 80;

          return (
            <g key={child.id}>
              {/* Connection line */}
              <line
                x1={x}
                y1={y + nodeHeight}
                x2={childX}
                y2={childY}
                stroke="#9CA3AF"
                strokeWidth={2}
                className="pointer-events-none"
              />
              {renderNode(child, childX, childY, level + 1)}
            </g>
          );
        })}
      </g>
    );
  };

  const getNodeInfo = (node: DOMNode): string => {
    let info = `<${node.tagName}`;
    if (node.attributes) {
      Object.entries(node.attributes).forEach(([key, value]) => {
        info += ` ${key}="${value}"`;
      });
    }
    info += '>';
    if (node.content) {
      info += node.content;
    }
    info += `</${node.tagName}>`;
    return info;
  };

  return (
    <div
      className={`relative w-full h-96 bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gray-50 border-b border-gray-200 p-3">
        <h3 className="text-lg font-semibold text-gray-900">DOM Tree Structure</h3>
        <p className="text-sm text-gray-600">Click nodes to explore the document structure</p>
      </div>

      {/* Legend */}
      <div className="absolute top-2 right-2 bg-white border border-gray-200 rounded p-2 text-xs">
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Has content</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Has attributes</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        className="w-full h-full pt-16"
        viewBox="0 0 800 400"
        style={{ background: 'linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%)' }}
      >
        {renderNode(domTree, 400, 40)}
      </svg>

      {/* Node Info Panel */}
      {selectedNode && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-3">
          <div className="text-sm">
            <strong className="text-gray-900">Selected Node:</strong>
            <code className="ml-2 bg-gray-200 px-2 py-1 rounded text-xs font-mono">
              {(() => {
                const findNode = (node: DOMNode): DOMNode | null => {
                  if (node.id === selectedNode) return node;
                  for (const child of node.children || []) {
                    const found = findNode(child);
                    if (found) return found;
                  }
                  return null;
                };
                const node = findNode(domTree);
                return node ? getNodeInfo(node) : '';
              })()}
            </code>
          </div>
        </div>
      )}

      {/* Animation overlay for educational purposes */}
      {isActive && animationStep > 0 && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-center">
              <div className="text-2xl mb-2">🔍</div>
              <p className="text-blue-800 font-medium">Exploring DOM Structure</p>
              <p className="text-blue-600 text-sm">Step {animationStep}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DOMTreeVisualization;
