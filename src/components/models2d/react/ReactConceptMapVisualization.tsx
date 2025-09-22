import React, { useState } from 'react';

interface ConceptNode {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  color: string;
  connections: string[];
}

const ReactConceptMapVisualization: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);

  const concepts: ConceptNode[] = [
    {
      id: 'declarative',
      title: 'Declarative UI',
      description: 'Describe what UI should look like, React handles the how',
      x: 200,
      y: 100,
      color: '#3b82f6',
      connections: ['components', 'virtual-dom'],
    },
    {
      id: 'components',
      title: 'Components',
      description: 'Reusable UI building blocks with their own logic and styling',
      x: 100,
      y: 200,
      color: '#10b981',
      connections: ['jsx', 'props', 'state', 'hooks'],
    },
    {
      id: 'virtual-dom',
      title: 'Virtual DOM',
      description: 'Lightweight in-memory representation for efficient updates',
      x: 300,
      y: 200,
      color: '#f59e0b',
      connections: ['reconciliation', 'diffing'],
    },
    {
      id: 'jsx',
      title: 'JSX',
      description: 'Syntax extension that lets you write HTML in JavaScript',
      x: 50,
      y: 320,
      color: '#ec4899',
      connections: ['babel'],
    },
    {
      id: 'props',
      title: 'Props',
      description: 'Read-only data passed from parent to child components',
      x: 150,
      y: 320,
      color: '#8b5cf6',
      connections: ['data-flow'],
    },
    {
      id: 'state',
      title: 'State',
      description: 'Mutable data that triggers component re-renders',
      x: 250,
      y: 320,
      color: '#ef4444',
      connections: ['data-flow', 'lifecycle'],
    },
    {
      id: 'hooks',
      title: 'Hooks',
      description: 'Functions that let you use state and lifecycle in function components',
      x: 350,
      y: 320,
      color: '#06b6d4',
      connections: ['lifecycle', 'useState', 'useEffect'],
    },
    {
      id: 'reconciliation',
      title: 'Reconciliation',
      description: 'Process of updating the DOM to match virtual DOM changes',
      x: 450,
      y: 200,
      color: '#84cc16',
      connections: ['diffing', 'fiber'],
    },
    {
      id: 'babel',
      title: 'Babel',
      description: 'JavaScript compiler that transforms JSX to React.createElement',
      x: 50,
      y: 420,
      color: '#f97316',
      connections: [],
    },
    {
      id: 'data-flow',
      title: 'Data Flow',
      description: 'Unidirectional flow: props down, events up',
      x: 200,
      y: 420,
      color: '#6366f1',
      connections: [],
    },
    {
      id: 'lifecycle',
      title: 'Lifecycle',
      description: 'Component phases: mounting, updating, unmounting',
      x: 350,
      y: 420,
      color: '#14b8a6',
      connections: [],
    },
    {
      id: 'diffing',
      title: 'Diffing Algorithm',
      description: 'Efficiently finds what changed between virtual DOM trees',
      x: 500,
      y: 320,
      color: '#a855f7',
      connections: [],
    },
    {
      id: 'fiber',
      title: 'Fiber Architecture',
      description: "React's reimplementation of reconciliation for better performance",
      x: 550,
      y: 420,
      color: '#dc2626',
      connections: [],
    },
    {
      id: 'useState',
      title: 'useState',
      description: 'Hook for managing local component state',
      x: 400,
      y: 520,
      color: '#059669',
      connections: [],
    },
    {
      id: 'useEffect',
      title: 'useEffect',
      description: 'Hook for side effects and lifecycle events',
      x: 500,
      y: 520,
      color: '#d97706',
      connections: [],
    },
  ];

  const selectedConceptData = selectedConcept
    ? concepts.find((c) => c.id === selectedConcept)
    : null;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Interactive React Concept Map</h3>
        <p className="text-gray-700 mb-4">
          Explore how React's core concepts interconnect. Click on any concept to learn more about
          it and see its relationships.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Concept Map */}
        <div className="lg:col-span-2">
          <div
            className="relative bg-gray-50 rounded-lg border-2 border-gray-200"
            style={{ height: '600px' }}
          >
            <svg viewBox="0 0 600 600" className="w-full h-full">
              {/* Connection lines */}
              {concepts.map((concept) =>
                concept.connections.map((targetId) => {
                  const target = concepts.find((c) => c.id === targetId);
                  if (!target) return null;

                  const isHighlighted =
                    hoveredConcept === concept.id ||
                    hoveredConcept === targetId ||
                    selectedConcept === concept.id ||
                    selectedConcept === targetId;

                  return (
                    <line
                      key={`${concept.id}-${targetId}`}
                      x1={concept.x}
                      y1={concept.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isHighlighted ? '#3b82f6' : '#d1d5db'}
                      strokeWidth={isHighlighted ? '3' : '2'}
                      className="transition-all duration-200"
                    />
                  );
                })
              )}

              {/* Concept nodes */}
              {concepts.map((concept) => {
                const isSelected = selectedConcept === concept.id;
                const isHovered = hoveredConcept === concept.id;
                const isConnected =
                  selectedConcept &&
                  (concepts
                    .find((c) => c.id === selectedConcept)
                    ?.connections.includes(concept.id) ||
                    concept.connections.includes(selectedConcept!));

                return (
                  <g key={concept.id}>
                    {/* Node circle */}
                    <circle
                      cx={concept.x}
                      cy={concept.y}
                      r={isSelected ? '35' : '30'}
                      fill={concept.color}
                      stroke={isSelected ? '#1f2937' : isHovered ? '#6b7280' : '#d1d5db'}
                      strokeWidth={isSelected ? '3' : '2'}
                      className="cursor-pointer transition-all duration-200 hover:stroke-gray-600"
                      onClick={() => setSelectedConcept(isSelected ? null : concept.id)}
                      onMouseEnter={() => setHoveredConcept(concept.id)}
                      onMouseLeave={() => setHoveredConcept(null)}
                      style={{
                        filter: isConnected && !isSelected ? 'brightness(1.1)' : 'none',
                        opacity: selectedConcept && !isSelected && !isConnected ? 0.4 : 1,
                      }}
                    />

                    {/* Node text */}
                    <text
                      x={concept.x}
                      y={concept.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-semibold fill-white pointer-events-none select-none"
                      style={{ fontSize: isSelected ? '11px' : '10px' }}
                    >
                      {concept.title}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Core Concepts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Component System</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span>Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
              <span>Syntax/Tools</span>
            </div>
          </div>
        </div>

        {/* Concept Details */}
        <div className="space-y-4">
          {selectedConceptData ? (
            <>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">{selectedConceptData.title}</h4>
                <p className="text-sm text-gray-700 mb-3">{selectedConceptData.description}</p>
                <div
                  className="w-full h-3 rounded-full"
                  style={{ backgroundColor: selectedConceptData.color }}
                />
              </div>

              {/* Connected Concepts */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-3">Related Concepts</h5>
                <div className="space-y-2">
                  {selectedConceptData.connections.map((connectedId) => {
                    const connectedConcept = concepts.find((c) => c.id === connectedId);
                    if (!connectedConcept) return null;

                    return (
                      <button
                        key={connectedId}
                        onClick={() => setSelectedConcept(connectedId)}
                        className="w-full text-left p-2 rounded bg-white hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: connectedConcept.color }}
                          />
                          <span className="text-sm font-medium text-blue-900">
                            {connectedConcept.title}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">🖱️</div>
              <h4 className="font-semibold text-gray-900 mb-2">Select a Concept</h4>
              <p className="text-sm text-gray-600">
                Click on any node in the concept map to explore React's interconnected ideas
              </p>
            </div>
          )}

          {/* React Philosophy */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h5 className="font-semibold text-green-900 mb-2">🎯 React's Philosophy</h5>
            <p className="text-sm text-green-800">
              React isn't just a library - it's a way of thinking about UI development. Everything
              revolves around components, data flow, and efficient updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactConceptMapVisualization;
