import React, { useState, useEffect, useMemo } from 'react';

interface LifecyclePhase {
  name: string;
  description: string;
  color: string;
  hooks: string[];
  methods: string[];
}

interface ComponentLifecycleProps {
  isActive?: boolean;
  animationStep?: number;
  className?: string;
}

const ComponentLifecycle: React.FC<ComponentLifecycleProps> = ({
  isActive = false,
  animationStep = 0,
  className = '',
}) => {
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const lifecyclePhases: LifecyclePhase[] = useMemo(
    () => [
      {
        name: 'Mounting',
        description: 'Component is being created and inserted into the DOM',
        color: '#10B981', // green
        hooks: ['useState', 'useEffect (with [])', 'useLayoutEffect'],
        methods: ['constructor', 'render', 'componentDidMount'],
      },
      {
        name: 'Updating',
        description: 'Component is re-rendering due to props or state changes',
        color: '#3B82F6', // blue
        hooks: ['useState setters', 'useEffect (with deps)', 'useLayoutEffect'],
        methods: ['shouldComponentUpdate', 'render', 'componentDidUpdate'],
      },
      {
        name: 'Unmounting',
        description: 'Component is being removed from the DOM',
        color: '#EF4444', // red
        hooks: ['useEffect cleanup functions'],
        methods: ['componentWillUnmount'],
      },
    ],
    []
  );

  useEffect(() => {
    if (isActive && animationStep > 0) {
      const phaseIndex = Math.min(animationStep - 1, lifecyclePhases.length - 1);
      setActivePhase(lifecyclePhases[phaseIndex].name);
      setCurrentStep(animationStep);
    } else {
      setActivePhase(null);
      setCurrentStep(0);
    }
  }, [isActive, animationStep, lifecyclePhases]);

  const getPhasePosition = (index: number) => {
    const centerX = 400;
    const centerY = 200;
    const radius = 120;
    const angle = (index * 2 * Math.PI) / lifecyclePhases.length - Math.PI / 2;

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const renderPhaseNode = (phase: LifecyclePhase, index: number): React.ReactElement => {
    const position = getPhasePosition(index);
    const isActive = activePhase === phase.name;
    const nodeSize = isActive ? 80 : 70;

    return (
      <g key={phase.name}>
        {/* Phase circle */}
        <circle
          cx={position.x}
          cy={position.y}
          r={nodeSize / 2}
          fill={phase.color}
          stroke={isActive ? '#1F2937' : '#9CA3AF'}
          strokeWidth={isActive ? 3 : 2}
          className="cursor-pointer transition-all duration-500"
          onMouseEnter={() => setActivePhase(phase.name)}
          onMouseLeave={() => setActivePhase(isActive ? phase.name : null)}
        />

        {/* Phase text */}
        <text
          x={position.x}
          y={position.y + 5}
          textAnchor="middle"
          className="text-sm font-semibold pointer-events-none fill-white"
        >
          {phase.name}
        </text>

        {/* Connection lines */}
        {index < lifecyclePhases.length - 1 && (
          <line
            x1={position.x}
            y1={position.y}
            x2={getPhasePosition(index + 1).x}
            y2={getPhasePosition(index + 1).y}
            stroke="#9CA3AF"
            strokeWidth={2}
            className="pointer-events-none"
          />
        )}

        {/* Flow arrow */}
        {index < lifecyclePhases.length - 1 && (
          <polygon
            points={`${getPhasePosition(index + 1).x - 8},${getPhasePosition(index + 1).y - 3} ${getPhasePosition(index + 1).x - 8},${getPhasePosition(index + 1).y + 3} ${getPhasePosition(index + 1).x - 2},${getPhasePosition(index + 1).y}`}
            fill="#9CA3AF"
            className="pointer-events-none"
          />
        )}
      </g>
    );
  };

  const getActivePhaseData = () => {
    return lifecyclePhases.find((phase) => phase.name === activePhase);
  };

  const activePhaseData = getActivePhaseData();

  return (
    <div
      className={`relative w-full h-96 bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gray-50 border-b border-gray-200 p-3">
        <h3 className="text-lg font-semibold text-gray-900">Component Lifecycle</h3>
        <p className="text-sm text-gray-600">The journey of a React component</p>
      </div>

      {/* SVG Canvas */}
      <svg
        className="w-full h-full pt-16"
        viewBox="0 0 800 400"
        style={{ background: 'linear-gradient(to bottom, #fefefe 0%, #ffffff 100%)' }}
      >
        {/* Central component representation */}
        <circle cx={400} cy={200} r={40} fill="#E5E7EB" stroke="#9CA3AF" strokeWidth={2} />
        <text x={400} y={205} textAnchor="middle" className="text-sm font-medium fill-gray-900">
          Component
        </text>

        {/* Lifecycle phases */}
        {lifecyclePhases.map((phase, index) => renderPhaseNode(phase, index))}

        {/* Animation indicator */}
        {isActive && currentStep > 0 && (
          <circle
            cx={400}
            cy={200}
            r={45 + currentStep * 5}
            fill="none"
            stroke="#3B82F6"
            strokeWidth={2}
            strokeDasharray="5,5"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Phase Details Panel */}
      {activePhaseData && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{activePhaseData.name}</h4>
              <p className="text-sm text-gray-600">{activePhaseData.description}</p>
            </div>

            <div>
              <h5 className="font-medium text-gray-800 mb-1">Hooks</h5>
              <div className="flex flex-wrap gap-1">
                {activePhaseData.hooks.map((hook, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {hook}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-800 mb-1">Class Methods</h5>
              <div className="flex flex-wrap gap-1">
                {activePhaseData.methods.map((method, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hover instruction */}
      {!activePhase && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-3">
          <p className="text-sm text-gray-600 text-center">
            Hover over lifecycle phases to see details
          </p>
        </div>
      )}

      {/* Animation overlay */}
      {isActive && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-5 pointer-events-none">
          <div className="absolute top-4 left-4">
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-xs max-w-xs">
              <div className="font-semibold text-blue-800 mb-1">Lifecycle Flow</div>
              <div className="text-blue-700">
                Components go through these phases throughout their existence. Modern React favors
                hooks over class lifecycle methods.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentLifecycle;
