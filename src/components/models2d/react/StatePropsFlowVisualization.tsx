import React, { useState } from 'react';

interface ComponentNode {
  id: string;
  name: string;
  type: 'parent' | 'child';
  props?: Record<string, unknown>;
  state?: Record<string, unknown>;
  x: number;
  y: number;
}

interface DataFlow {
  from: string;
  to: string;
  type: 'props' | 'state-update';
  data: Record<string, unknown>;
}

const StatePropsFlowVisualization: React.FC = () => {
  const [components, setComponents] = useState<ComponentNode[]>([
    {
      id: 'parent',
      name: 'ParentComponent',
      type: 'parent',
      state: { count: 0, message: 'Hello' },
      x: 200,
      y: 100,
    },
    {
      id: 'child1',
      name: 'ChildComponent',
      type: 'child',
      props: { count: 0, onIncrement: () => {} },
      x: 100,
      y: 250,
    },
    {
      id: 'child2',
      name: 'DisplayComponent',
      type: 'child',
      props: { message: 'Hello' },
      x: 300,
      y: 250,
    },
  ]);

  const [dataFlows, setDataFlows] = useState<DataFlow[]>([]);
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const animateDataFlow = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationStep(0);

    // Step 1: Show initial state
    setTimeout(() => {
      setAnimationStep(1);
      setDataFlows([]);
    }, 500);

    // Step 2: Parent updates state
    setTimeout(() => {
      setAnimationStep(2);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.id === 'parent' ? { ...comp, state: { count: 1, message: 'Updated!' } } : comp
        )
      );
      setDataFlows([{ from: 'parent', to: 'parent', type: 'state-update', data: { count: 1 } }]);
    }, 1500);

    // Step 3: Props flow to children
    setTimeout(() => {
      setAnimationStep(3);
      setComponents((prev) =>
        prev.map((comp) => {
          if (comp.id === 'child1') {
            return { ...comp, props: { count: 1, onIncrement: () => {} } };
          }
          if (comp.id === 'child2') {
            return { ...comp, props: { message: 'Updated!' } };
          }
          return comp;
        })
      );
      setDataFlows([
        { from: 'parent', to: 'child1', type: 'props', data: { count: 1 } },
        { from: 'parent', to: 'child2', type: 'props', data: { message: 'Updated!' } },
      ]);
    }, 2500);

    // Step 4: Child triggers callback
    setTimeout(() => {
      setAnimationStep(4);
      setDataFlows([{ from: 'child1', to: 'parent', type: 'props', data: { action: 'callback' } }]);
    }, 3500);

    // Reset
    setTimeout(() => {
      setAnimationStep(0);
      setDataFlows([]);
      setIsAnimating(false);
    }, 4500);
  };

  const resetDemo = () => {
    setComponents([
      {
        id: 'parent',
        name: 'ParentComponent',
        type: 'parent',
        state: { count: 0, message: 'Hello' },
        x: 200,
        y: 100,
      },
      {
        id: 'child1',
        name: 'ChildComponent',
        type: 'child',
        props: { count: 0, onIncrement: () => {} },
        x: 100,
        y: 250,
      },
      {
        id: 'child2',
        name: 'DisplayComponent',
        type: 'child',
        props: { message: 'Hello' },
        x: 300,
        y: 250,
      },
    ]);
    setDataFlows([]);
    setAnimationStep(0);
    setIsAnimating(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Interactive State & Props Flow</h3>
        <div className="flex gap-2">
          <button
            onClick={animateDataFlow}
            disabled={isAnimating}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnimating ? 'Animating...' : '▶️ Run Demo'}
          </button>
          <button
            onClick={resetDemo}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="relative">
        <svg viewBox="0 0 400 350" className="w-full h-80 border rounded-lg bg-gray-50">
          {/* Data flow arrows */}
          {dataFlows.map((flow, index) => {
            const fromComp = components.find((c) => c.id === flow.from);
            const toComp = components.find((c) => c.id === flow.to);
            if (!fromComp || !toComp) return null;

            const isSelfFlow = flow.from === flow.to;
            const midX = (fromComp.x + toComp.x) / 2;
            const midY = (fromComp.y + toComp.y) / 2;

            return (
              <g key={index}>
                {isSelfFlow ? (
                  // Self-loop for state updates
                  <path
                    d={`M ${fromComp.x} ${fromComp.y - 20} Q ${fromComp.x - 30} ${fromComp.y - 40} ${fromComp.x} ${fromComp.y - 20}`}
                    stroke={flow.type === 'state-update' ? '#10b981' : '#3b82f6'}
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="animate-pulse"
                  />
                ) : (
                  // Arrow between components
                  <line
                    x1={fromComp.x}
                    y1={fromComp.y + 20}
                    x2={toComp.x}
                    y2={toComp.y - 20}
                    stroke={flow.type === 'props' ? '#3b82f6' : '#10b981'}
                    strokeWidth="3"
                    markerEnd="url(#arrowhead)"
                    className="animate-pulse"
                  />
                )}
                {/* Data label */}
                <text
                  x={isSelfFlow ? fromComp.x - 35 : midX}
                  y={isSelfFlow ? fromComp.y - 45 : midY - 10}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-700"
                >
                  {flow.type === 'props' ? 'props' : 'state update'}
                </text>
              </g>
            );
          })}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>

          {/* Component nodes */}
          {components.map((comp) => (
            <g key={comp.id}>
              {/* Component box */}
              <rect
                x={comp.x - 60}
                y={comp.y - 25}
                width="120"
                height="50"
                rx="8"
                fill={comp.type === 'parent' ? '#dbeafe' : '#f0f9ff'}
                stroke={comp.type === 'parent' ? '#3b82f6' : '#0ea5e9'}
                strokeWidth="2"
                className={animationStep > 0 ? 'animate-pulse' : ''}
              />

              {/* Component name */}
              <text
                x={comp.x}
                y={comp.y - 5}
                textAnchor="middle"
                className="text-sm font-bold fill-gray-900"
              >
                {comp.name}
              </text>

              {/* Component type label */}
              <text
                x={comp.x}
                y={comp.y + 10}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {comp.type}
              </text>

              {/* State display */}
              {comp.state && (
                <text
                  x={comp.x}
                  y={comp.y + 35}
                  textAnchor="middle"
                  className="text-xs fill-green-600 font-medium"
                >
                  State: {JSON.stringify(comp.state)}
                </text>
              )}

              {/* Props display */}
              {comp.props && (
                <text
                  x={comp.x}
                  y={comp.y + 50}
                  textAnchor="middle"
                  className="text-xs fill-blue-600 font-medium"
                >
                  Props: {JSON.stringify(comp.props)}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500"></div>
            <span className="text-blue-700">Props Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500"></div>
            <span className="text-green-700">State Update</span>
          </div>
        </div>
      </div>

      {/* Step explanation */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Current Step:</h4>
        <p className="text-gray-700 text-sm">
          {animationStep === 0 &&
            "Click 'Run Demo' to see how state changes flow through props to child components"}
          {animationStep === 1 && "Initial state: Parent has count: 0, message: 'Hello'"}
          {animationStep === 2 &&
            "Parent updates its state (count: 0 → 1, message: 'Hello' → 'Updated!')"}
          {animationStep === 3 &&
            "Props flow down to children: Child1 receives count: 1, Child2 receives message: 'Updated!'"}
          {animationStep === 4 && 'Child can trigger callbacks to update parent state'}
        </p>
      </div>
    </div>
  );
};

// Memoize visualization component to avoid unnecessary re-renders
export default React.memo(StatePropsFlowVisualization);
