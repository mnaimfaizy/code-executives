import React, { useState } from 'react';

interface VirtualDOMNode {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: VirtualDOMNode[];
}

interface VirtualDOMDiffingProps {
  isActive?: boolean;
  animationStep?: number;
  className?: string;
}

const VirtualDOMDiffing: React.FC<VirtualDOMDiffingProps> = ({
  isActive = false,
  animationStep = 0,
  className = '',
}) => {
  const [diffMode, setDiffMode] = useState<'before' | 'after' | 'diff'>('before');

  // Before update Virtual DOM
  const beforeVDOM: VirtualDOMNode = {
    id: 'root',
    type: 'div',
    props: { className: 'container' },
    children: [
      {
        id: 'header',
        type: 'h1',
        props: {},
        children: [{ id: 'text1', type: 'TEXT', props: { nodeValue: 'Counter: 0' } }],
      },
      {
        id: 'button',
        type: 'button',
        props: { onClick: () => {} },
        children: [{ id: 'text2', type: 'TEXT', props: { nodeValue: 'Increment' } }],
      },
    ],
  };

  // After update Virtual DOM
  const afterVDOM: VirtualDOMNode = {
    id: 'root',
    type: 'div',
    props: { className: 'container' },
    children: [
      {
        id: 'header',
        type: 'h1',
        props: {},
        children: [{ id: 'text1', type: 'TEXT', props: { nodeValue: 'Counter: 1' } }],
      },
      {
        id: 'button',
        type: 'button',
        props: { onClick: () => {} },
        children: [{ id: 'text2', type: 'TEXT', props: { nodeValue: 'Increment' } }],
      },
    ],
  };

  const renderVDOMNode = (
    node: VirtualDOMNode,
    x: number,
    y: number,
    isChanged: boolean = false,
    isAdded: boolean = false,
    isRemoved: boolean = false
  ): React.ReactElement => {
    const nodeWidth = Math.max(100, node.type.length * 8 + 40);
    const nodeHeight = 35;

    let bgColor = '#E5E7EB'; // default gray
    let borderColor = '#9CA3AF';
    let textColor = '#374151';

    if (isChanged) {
      bgColor = '#FED7D7'; // red-200
      borderColor = '#FC8181'; // red-400
      textColor = '#C53030'; // red-600
    } else if (isAdded) {
      bgColor = '#C6F6D5'; // green-200
      borderColor = '#68D391'; // green-400
      textColor = '#276749'; // green-800
    } else if (isRemoved) {
      bgColor = '#FED7CC'; // orange-200
      borderColor = '#F6AD55'; // orange-400
      textColor = '#9C4221'; // orange-800
    }

    return (
      <g key={node.id}>
        {/* Node rectangle */}
        <rect
          x={x - nodeWidth / 2}
          y={y}
          width={nodeWidth}
          height={nodeHeight}
          fill={bgColor}
          stroke={borderColor}
          strokeWidth={2}
          rx={6}
          className="transition-all duration-300"
        />

        {/* Node text */}
        <text
          x={x}
          y={y + 22}
          textAnchor="middle"
          className="text-sm font-medium pointer-events-none"
          fill={textColor}
        >
          {node.type === 'TEXT' ? `"${node.props?.nodeValue}"` : `<${node.type}>`}
        </text>

        {/* Change indicator */}
        {(isChanged || isAdded || isRemoved) && (
          <circle
            cx={x + nodeWidth / 2 - 8}
            cy={y + 8}
            r={6}
            fill={isChanged ? '#EF4444' : isAdded ? '#10B981' : '#F59E0B'}
            className="pointer-events-none"
          >
            <text
              x={x + nodeWidth / 2 - 8}
              y={y + 12}
              textAnchor="middle"
              className="text-xs font-bold fill-white pointer-events-none"
            >
              {isChanged ? '!' : isAdded ? '+' : '-'}
            </text>
          </circle>
        )}

        {/* Children */}
        {(node.children || []).map((child, index) => {
          const childX = x + (index - ((node.children || []).length - 1) / 2) * 140;
          const childY = y + 70;

          // Determine if child has changes
          const childChanged = diffMode === 'diff' && child.id === 'text1';
          const childAdded = false;
          const childRemoved = false;

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
              {renderVDOMNode(child, childX, childY, childChanged, childAdded, childRemoved)}
            </g>
          );
        })}
      </g>
    );
  };

  const getCurrentVDOM = () => {
    switch (diffMode) {
      case 'before':
        return beforeVDOM;
      case 'after':
        return afterVDOM;
      case 'diff':
        return afterVDOM; // We'll show the after tree with diff highlighting
      default:
        return beforeVDOM;
    }
  };

  return (
    <div
      className={`relative w-full h-96 bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gray-50 border-b border-gray-200 p-3">
        <h3 className="text-lg font-semibold text-gray-900">Virtual DOM Diffing</h3>
        <p className="text-sm text-gray-600">See how React compares Virtual DOM trees</p>
      </div>

      {/* Controls */}
      <div className="absolute top-2 right-2 flex space-x-2">
        <button
          onClick={() => setDiffMode('before')}
          className={`px-3 py-1 text-xs rounded ${
            diffMode === 'before'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Before
        </button>
        <button
          onClick={() => setDiffMode('after')}
          className={`px-3 py-1 text-xs rounded ${
            diffMode === 'after'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          After
        </button>
        <button
          onClick={() => setDiffMode('diff')}
          className={`px-3 py-1 text-xs rounded ${
            diffMode === 'diff'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Diff
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-2 left-2 bg-white border border-gray-200 rounded p-2 text-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span>Changed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Added</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
            <span>Removed</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        className="w-full h-full pt-16"
        viewBox="0 0 800 400"
        style={{ background: 'linear-gradient(to bottom, #f0f9ff 0%, #ffffff 100%)' }}
      >
        {renderVDOMNode(getCurrentVDOM(), 400, 40)}
      </svg>

      {/* Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-3">
        <div className="text-sm">
          <strong className="text-gray-900">Current View:</strong>
          <span className="ml-2 text-gray-700">
            {diffMode === 'before' && 'Original Virtual DOM tree'}
            {diffMode === 'after' && 'Updated Virtual DOM tree'}
            {diffMode === 'diff' && 'Differences between trees (minimal changes needed)'}
          </span>
        </div>
        {diffMode === 'diff' && (
          <div className="mt-2 text-xs text-gray-600">
            <strong>Changes detected:</strong> Text content "Counter: 0" → "Counter: 1"
          </div>
        )}
      </div>

      {/* Animation overlay */}
      {isActive && animationStep > 0 && (
        <div className="absolute inset-0 bg-indigo-500 bg-opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <p className="text-indigo-800 font-medium">Diffing in Progress</p>
              <p className="text-indigo-600 text-sm">Finding minimal changes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualDOMDiffing;
