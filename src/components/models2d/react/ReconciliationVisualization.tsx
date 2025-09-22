import React, { useState, useEffect } from 'react';

interface FiberNode {
  id: string;
  type: string;
  state?: Record<string, unknown>;
  props?: Record<string, unknown>;
  children?: FiberNode[];
  alternate?: FiberNode; // Link to previous version
  effectTag?: 'PLACEMENT' | 'UPDATE' | 'DELETION';
}

interface ReconciliationVisualizationProps {
  isActive?: boolean;
  animationStep?: number;
  className?: string;
}

const ReconciliationVisualization: React.FC<ReconciliationVisualizationProps> = ({
  isActive = false,
  animationStep = 0,
  className = '',
}) => {
  const [phase, setPhase] = useState<'idle' | 'render' | 'reconcile' | 'commit'>('idle');
  const [currentStep, setCurrentStep] = useState(0);

  // Fiber tree structure
  const fiberTree: FiberNode = {
    id: 'root',
    type: 'App',
    children: [
      {
        id: 'header',
        type: 'Header',
        children: [
          {
            id: 'title',
            type: 'h1',
            props: { children: 'My App' },
          },
        ],
      },
      {
        id: 'counter',
        type: 'Counter',
        state: { count: 0 },
        children: [
          {
            id: 'display',
            type: 'div',
            props: { children: 'Count: 0' },
          },
          {
            id: 'button',
            type: 'button',
            props: { onClick: () => {}, children: 'Increment' },
          },
        ],
      },
    ],
  };

  // Updated fiber tree (after state change)
  const updatedFiberTree: FiberNode = {
    id: 'root',
    type: 'App',
    children: [
      {
        id: 'header',
        type: 'Header',
        children: [
          {
            id: 'title',
            type: 'h1',
            props: { children: 'My App' },
          },
        ],
      },
      {
        id: 'counter',
        type: 'Counter',
        state: { count: 1 },
        effectTag: 'UPDATE',
        children: [
          {
            id: 'display',
            type: 'div',
            props: { children: 'Count: 1' },
            effectTag: 'UPDATE',
          },
          {
            id: 'button',
            type: 'button',
            props: { onClick: () => {}, children: 'Increment' },
          },
        ],
      },
    ],
  };

  useEffect(() => {
    if (isActive && animationStep > 0) {
      const phases = ['idle', 'render', 'reconcile', 'commit'] as const;
      const newPhase = phases[Math.min(animationStep - 1, phases.length - 1)];
      setPhase(newPhase);
      setCurrentStep(animationStep);
    }
  }, [isActive, animationStep]);

  const renderFiberNode = (
    node: FiberNode,
    x: number,
    y: number,
    level: number = 0,
    showAlternate: boolean = false
  ): React.ReactElement => {
    const nodeWidth = Math.max(90, node.type.length * 7 + 30);
    const nodeHeight = 35;

    let bgColor = '#E5E7EB'; // default gray
    let borderColor = '#9CA3AF';

    if (node.effectTag) {
      switch (node.effectTag) {
        case 'UPDATE':
          bgColor = '#DBEAFE'; // blue-100
          borderColor = '#3B82F6'; // blue-500
          break;
        case 'PLACEMENT':
          bgColor = '#D1FAE5'; // green-100
          borderColor = '#10B981'; // green-500
          break;
        case 'DELETION':
          bgColor = '#FEE2E2'; // red-100
          borderColor = '#EF4444'; // red-500
          break;
      }
    }

    // Highlight current phase
    if (phase === 'render' && level === currentStep % 3) {
      bgColor = '#FEF3C7'; // yellow-100
      borderColor = '#F59E0B'; // yellow-500
    }

    return (
      <g key={`${node.id}-${showAlternate ? 'alt' : 'current'}`}>
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
          className="transition-all duration-500"
        />

        {/* Node text */}
        <text
          x={x}
          y={y + 22}
          textAnchor="middle"
          className="text-sm font-medium pointer-events-none fill-gray-900"
        >
          {node.type}
        </text>

        {/* State indicator */}
        {node.state && (
          <circle
            cx={x - nodeWidth / 2 + 8}
            cy={y + 8}
            r={4}
            fill="#8B5CF6"
            className="pointer-events-none"
          />
        )}

        {/* Effect tag indicator */}
        {node.effectTag && (
          <text
            x={x + nodeWidth / 2 - 8}
            y={y + 12}
            textAnchor="middle"
            className="text-xs font-bold pointer-events-none fill-white"
          >
            {node.effectTag[0]}
          </text>
        )}

        {/* Alternate link (previous version) */}
        {showAlternate && node.alternate && (
          <line
            x1={x}
            y1={y + nodeHeight}
            x2={x - 50}
            y2={y + 60}
            stroke="#6B7280"
            strokeWidth={1}
            strokeDasharray="5,5"
            className="pointer-events-none"
          />
        )}

        {/* Children */}
        {(node.children || []).map((child, index) => {
          const childX = x + (index - ((node.children || []).length - 1) / 2) * 130;
          const childY = y + 70;

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
              {renderFiberNode(child, childX, childY, level + 1, showAlternate)}
            </g>
          );
        })}
      </g>
    );
  };

  const getCurrentTree = () => {
    if (phase === 'idle') return fiberTree;
    if (phase === 'render') return fiberTree;
    if (phase === 'reconcile') return updatedFiberTree;
    return updatedFiberTree; // commit phase
  };

  const getPhaseDescription = () => {
    switch (phase) {
      case 'idle':
        return 'Initial state - no updates pending';
      case 'render':
        return 'Render phase: Creating new Virtual DOM tree';
      case 'reconcile':
        return 'Reconcile phase: Diffing trees and marking effects';
      case 'commit':
        return 'Commit phase: Applying changes to real DOM';
      default:
        return 'Ready for updates';
    }
  };

  return (
    <div
      className={`relative w-full h-96 bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gray-50 border-b border-gray-200 p-3">
        <h3 className="text-lg font-semibold text-gray-900">Fiber Reconciliation</h3>
        <p className="text-sm text-gray-600">React's concurrent rendering engine</p>
      </div>

      {/* Phase indicator */}
      <div className="absolute top-2 right-2">
        <div className="flex space-x-1">
          {(['idle', 'render', 'reconcile', 'commit'] as const).map((phaseName) => (
            <div
              key={phaseName}
              className={`px-2 py-1 text-xs rounded capitalize ${
                phase === phaseName
                  ? 'bg-indigo-500 text-white'
                  : phaseName === 'idle' || phase === 'idle'
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {phaseName}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-2 left-2 bg-white border border-gray-200 rounded p-2 text-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span>Update</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Add</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span>Remove</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            <span>Has State</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        className="w-full h-full pt-16"
        viewBox="0 0 800 400"
        style={{ background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)' }}
      >
        {renderFiberNode(getCurrentTree(), 400, 40, 0, phase === 'reconcile')}
      </svg>

      {/* Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-3">
        <div className="text-sm">
          <strong className="text-gray-900">Current Phase:</strong>
          <span className="ml-2 text-gray-700 capitalize">{phase}</span>
        </div>
        <div className="mt-1 text-xs text-gray-600">{getPhaseDescription()}</div>
        {phase === 'reconcile' && (
          <div className="mt-2 text-xs text-blue-600">
            <strong>Effects marked:</strong> Counter state changed (0 → 1), display text updated
          </div>
        )}
      </div>

      {/* Animation overlay */}
      {isActive && (
        <div className="absolute inset-0 bg-indigo-500 bg-opacity-5 pointer-events-none">
          <div className="absolute top-1/4 right-4">
            <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-3 text-xs max-w-xs">
              <div className="font-semibold text-indigo-800 mb-1">Fiber Architecture</div>
              <div className="text-indigo-700">
                Each component becomes a Fiber node with work scheduling capabilities. Updates are
                processed incrementally to maintain smooth UI performance.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconciliationVisualization;
