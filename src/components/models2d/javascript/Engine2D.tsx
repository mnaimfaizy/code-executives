import React, { useEffect, useState } from 'react';

interface Engine2DProps {
  activeDemo: number;
  onAnimationStateChange: (isAnimating: boolean) => void;
}

interface PipelineStep {
  id: string;
  name: string;
  status: 'idle' | 'active' | 'complete';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  icon: string;
}

const Engine2D: React.FC<Engine2DProps> = ({ activeDemo, onAnimationStateChange }) => {
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'processing' | 'complete'>('idle');

  // Initialize pipeline based on active demo
  useEffect(() => {
    onAnimationStateChange(true);

    const startPipelineAnimation = () => {
      setAnimationPhase('processing');
      setCurrentStep(0);

      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = prev + 1;

          if (nextStep >= steps.length) {
            setAnimationPhase('complete');
            clearInterval(stepInterval);

            setTimeout(() => {
              setAnimationPhase('idle');
              setCurrentStep(0);
            }, 2000);

            return 0;
          }

          return nextStep;
        });
      }, 1200);
    };

    const timer = setTimeout(() => {
      switch (activeDemo) {
        case 0: // V8 Engine Architecture
          setupEngineArchitecture();
          break;
        case 1: // Parsing & AST Generation
          setupParsingDemo();
          break;
        case 2: // Ignition Interpreter
          setupIgnitionDemo();
          break;
        case 3: // TurboFan Optimization
          setupTurboFanDemo();
          break;
        case 4: // Memory Architecture
          setupMemoryArchitecture();
          break;
        default:
          setupEngineArchitecture();
      }

      startPipelineAnimation();

      setTimeout(() => {
        onAnimationStateChange(false);
      }, 1000);
    }, 200);

    return () => clearTimeout(timer);
  }, [activeDemo, onAnimationStateChange, steps.length]);

  const setupEngineArchitecture = () => {
    const newSteps: PipelineStep[] = [
      {
        id: 'parser',
        name: 'Parser',
        status: 'idle',
        x: 50,
        y: 80,
        width: 80,
        height: 40,
        color: '#3B82F6',
        icon: '🔍',
      },
      {
        id: 'ast',
        name: 'AST',
        status: 'idle',
        x: 180,
        y: 80,
        width: 60,
        height: 40,
        color: '#8B5CF6',
        icon: '🌳',
      },
      {
        id: 'ignition',
        name: 'Ignition',
        status: 'idle',
        x: 290,
        y: 80,
        width: 80,
        height: 40,
        color: '#10B981',
        icon: '⚡',
      },
      {
        id: 'profiler',
        name: 'Profiler',
        status: 'idle',
        x: 420,
        y: 80,
        width: 70,
        height: 40,
        color: '#F59E0B',
        icon: '📊',
      },
      {
        id: 'turbofan',
        name: 'TurboFan',
        status: 'idle',
        x: 340,
        y: 160,
        width: 90,
        height: 40,
        color: '#EF4444',
        icon: '🚀',
      },
      {
        id: 'machine',
        name: 'Machine Code',
        status: 'idle',
        x: 180,
        y: 240,
        width: 100,
        height: 40,
        color: '#6366F1',
        icon: '⚙️',
      },
    ];

    setSteps(newSteps);
  };

  const setupParsingDemo = () => {
    const newSteps: PipelineStep[] = [
      {
        id: 'lexer',
        name: 'Lexical Analysis',
        status: 'idle',
        x: 60,
        y: 60,
        width: 120,
        height: 40,
        color: '#3B82F6',
        icon: '📝',
      },
      {
        id: 'tokens',
        name: 'Tokens',
        status: 'idle',
        x: 220,
        y: 60,
        width: 80,
        height: 40,
        color: '#8B5CF6',
        icon: '🏷️',
      },
      {
        id: 'syntax',
        name: 'Syntax Analysis',
        status: 'idle',
        x: 340,
        y: 60,
        width: 120,
        height: 40,
        color: '#10B981',
        icon: '🔍',
      },
      {
        id: 'ast-final',
        name: 'Abstract Syntax Tree',
        status: 'idle',
        x: 200,
        y: 160,
        width: 140,
        height: 40,
        color: '#F59E0B',
        icon: '🌳',
      },
      {
        id: 'scope',
        name: 'Scope Resolution',
        status: 'idle',
        x: 200,
        y: 240,
        width: 140,
        height: 40,
        color: '#EF4444',
        icon: '🎯',
      },
    ];

    setSteps(newSteps);
  };

  const setupIgnitionDemo = () => {
    const newSteps: PipelineStep[] = [
      {
        id: 'ast-input',
        name: 'AST Input',
        status: 'idle',
        x: 60,
        y: 80,
        width: 80,
        height: 40,
        color: '#8B5CF6',
        icon: '🌳',
      },
      {
        id: 'bytecode-gen',
        name: 'Bytecode Generator',
        status: 'idle',
        x: 180,
        y: 80,
        width: 130,
        height: 40,
        color: '#10B981',
        icon: '⚡',
      },
      {
        id: 'bytecode',
        name: 'Bytecode',
        status: 'idle',
        x: 350,
        y: 80,
        width: 90,
        height: 40,
        color: '#F59E0B',
        icon: '📜',
      },
      {
        id: 'interpreter',
        name: 'Interpreter',
        status: 'idle',
        x: 220,
        y: 160,
        width: 100,
        height: 40,
        color: '#EF4444',
        icon: '🔄',
      },
      {
        id: 'execution',
        name: 'Execution',
        status: 'idle',
        x: 220,
        y: 240,
        width: 100,
        height: 40,
        color: '#6366F1',
        icon: '▶️',
      },
    ];

    setSteps(newSteps);
  };

  const setupTurboFanDemo = () => {
    const newSteps: PipelineStep[] = [
      {
        id: 'hot-code',
        name: 'Hot Code Detection',
        status: 'idle',
        x: 50,
        y: 60,
        width: 130,
        height: 40,
        color: '#EF4444',
        icon: '🔥',
      },
      {
        id: 'type-feedback',
        name: 'Type Feedback',
        status: 'idle',
        x: 220,
        y: 60,
        width: 110,
        height: 40,
        color: '#F59E0B',
        icon: '📊',
      },
      {
        id: 'optimizer',
        name: 'TurboFan Optimizer',
        status: 'idle',
        x: 370,
        y: 60,
        width: 130,
        height: 40,
        color: '#8B5CF6',
        icon: '🚀',
      },
      {
        id: 'optimized',
        name: 'Optimized Code',
        status: 'idle',
        x: 200,
        y: 160,
        width: 120,
        height: 40,
        color: '#10B981',
        icon: '⚡',
      },
      {
        id: 'deopt',
        name: 'Deoptimization',
        status: 'idle',
        x: 360,
        y: 160,
        width: 110,
        height: 40,
        color: '#6B7280',
        icon: '↩️',
      },
    ];

    setSteps(newSteps);
  };

  const setupMemoryArchitecture = () => {
    const newSteps: PipelineStep[] = [
      {
        id: 'call-stack',
        name: 'Call Stack',
        status: 'idle',
        x: 80,
        y: 60,
        width: 100,
        height: 120,
        color: '#3B82F6',
        icon: '📚',
      },
      {
        id: 'heap',
        name: 'Memory Heap',
        status: 'idle',
        x: 220,
        y: 60,
        width: 120,
        height: 120,
        color: '#10B981',
        icon: '🧠',
      },
      {
        id: 'gc',
        name: 'Garbage Collector',
        status: 'idle',
        x: 380,
        y: 60,
        width: 110,
        height: 60,
        color: '#EF4444',
        icon: '🗑️',
      },
      {
        id: 'young-gen',
        name: 'Young Generation',
        status: 'idle',
        x: 220,
        y: 200,
        width: 110,
        height: 40,
        color: '#F59E0B',
        icon: '👶',
      },
      {
        id: 'old-gen',
        name: 'Old Generation',
        status: 'idle',
        x: 360,
        y: 200,
        width: 110,
        height: 40,
        color: '#8B5CF6',
        icon: '👴',
      },
    ];

    setSteps(newSteps);
  };

  const getStepStatus = (index: number): 'idle' | 'active' | 'complete' => {
    if (animationPhase === 'idle') return 'idle';
    if (index < currentStep) return 'complete';
    if (index === currentStep) return 'active';
    return 'idle';
  };

  const getStepColor = (step: PipelineStep, status: string) => {
    switch (status) {
      case 'active':
        return '#F59E0B';
      case 'complete':
        return '#10B981';
      default:
        return step.color;
    }
  };

  const getDemoTitle = () => {
    const titles = [
      'V8 Engine Complete Architecture',
      'Parsing & AST Generation Pipeline',
      'Ignition Interpreter Execution',
      'TurboFan Optimization Process',
      'Memory Architecture Overview',
    ];
    return titles[activeDemo] || 'Engine Architecture';
  };

  const getDemoDescription = () => {
    const descriptions = [
      'Complete flow from source code through parsing, interpretation, optimization, and execution',
      'Source code transformation through lexical analysis, tokenization, and AST construction',
      'Fast bytecode generation and interpretation for immediate execution with profiling',
      'Hot code optimization through type feedback and speculative compilation techniques',
      'Memory management with Call Stack, Heap allocation, and generational garbage collection',
    ];
    return descriptions[activeDemo] || 'Engine processing pipeline';
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Engine Pipeline Visualization */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{getDemoTitle()}</h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-600">Phase: </span>
              <span className="font-semibold text-blue-600 capitalize">{animationPhase}</span>
            </div>
            {animationPhase === 'processing' && (
              <div className="text-sm">
                <span className="text-gray-600">Step: </span>
                <span className="font-semibold text-green-600">
                  {currentStep + 1}/{steps.length}
                </span>
              </div>
            )}
          </div>
        </div>

        <svg
          viewBox="0 0 520 300"
          className="w-full h-80 border-2 border-gray-200 rounded-lg bg-white"
        >
          {/* Background Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F3F4F6" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Pipeline Steps */}
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const color = getStepColor(step, status);

            return (
              <g key={step.id} style={{ transition: 'all 0.8s ease-in-out' }}>
                {/* Step Rectangle */}
                <rect
                  x={step.x}
                  y={step.y}
                  width={step.width}
                  height={step.height}
                  fill={color}
                  stroke={status === 'active' ? '#F59E0B' : color}
                  strokeWidth={status === 'active' ? '3' : '1'}
                  rx="8"
                  opacity={status === 'idle' ? 0.6 : 1}
                  style={{ transition: 'all 0.8s ease-in-out' }}
                />

                {/* Step Icon */}
                <text x={step.x + 12} y={step.y + 25} className="text-lg" fill="white">
                  {step.icon}
                </text>

                {/* Step Name */}
                <text
                  x={step.x + step.width / 2}
                  y={step.y + step.height + 20}
                  textAnchor="middle"
                  className="text-xs font-medium"
                  fill="#374151"
                >
                  {step.name}
                </text>

                {/* Active Animation */}
                {status === 'active' && (
                  <circle
                    cx={step.x + step.width - 12}
                    cy={step.y + 12}
                    r="6"
                    fill="#F59E0B"
                    opacity="0.8"
                  >
                    <animate attributeName="r" values="4;8;4" dur="1s" repeatCount="indefinite" />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.4;0.8"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Complete Checkmark */}
                {status === 'complete' && (
                  <g>
                    <circle
                      cx={step.x + step.width - 12}
                      cy={step.y + 12}
                      r="8"
                      fill="#10B981"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <path
                      d={`M ${step.x + step.width - 16} ${step.y + 12} L ${step.x + step.width - 12} ${step.y + 16} L ${step.x + step.width - 8} ${step.y + 8}`}
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* Data Flow Lines */}
          {steps.length > 1 &&
            steps.map((step, index) => {
              if (index === steps.length - 1) return null;

              const nextStep = steps[index + 1];
              const isActive =
                getStepStatus(index) === 'complete' && getStepStatus(index + 1) === 'active';

              return (
                <line
                  key={`flow-${index}`}
                  x1={step.x + step.width}
                  y1={step.y + step.height / 2}
                  x2={nextStep.x}
                  y2={nextStep.y + nextStep.height / 2}
                  stroke={isActive ? '#F59E0B' : '#D1D5DB'}
                  strokeWidth={isActive ? '3' : '2'}
                  strokeDasharray={isActive ? 'none' : '5,5'}
                  markerEnd="url(#arrowhead)"
                  opacity={isActive ? 1 : 0.6}
                  style={{ transition: 'all 0.5s ease-in-out' }}
                />
              );
            })}

          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#D1D5DB" />
            </marker>
          </defs>

          {/* Performance Indicators */}
          {activeDemo === 3 && animationPhase === 'processing' && (
            <g>
              <rect x="50" y="20" width="200" height="20" fill="#E5E7EB" rx="10" />
              <rect
                x="50"
                y="20"
                width={Math.min((currentStep / steps.length) * 200, 200)}
                height="20"
                fill="#10B981"
                rx="10"
                style={{ transition: 'width 0.5s ease-in-out' }}
              />
              <text x="55" y="35" className="text-xs font-semibold" fill="white">
                Optimization Progress: {Math.round((currentStep / steps.length) * 100)}%
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Current Step Description */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Pipeline Overview</h3>
        <p className="text-gray-700 mb-4">{getDemoDescription()}</p>

        {animationPhase === 'processing' && currentStep < steps.length && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              Currently Processing: {steps[currentStep]?.name}
            </h4>
            <p className="text-blue-700 text-sm">
              {activeDemo === 0 &&
                currentStep === 0 &&
                'Parsing source code and building Abstract Syntax Tree...'}
              {activeDemo === 0 &&
                currentStep === 1 &&
                'AST generated, ready for bytecode generation...'}
              {activeDemo === 0 &&
                currentStep === 2 &&
                'Ignition interpreter converting AST to bytecode...'}
              {activeDemo === 0 &&
                currentStep === 3 &&
                'Profiler collecting runtime type information...'}
              {activeDemo === 0 && currentStep === 4 && 'TurboFan optimizing hot functions...'}
              {activeDemo === 0 && currentStep === 5 && 'Executing optimized machine code...'}

              {activeDemo === 1 &&
                currentStep === 0 &&
                'Breaking source code into meaningful tokens...'}
              {activeDemo === 1 &&
                currentStep === 1 &&
                'Tokens generated and ready for syntax analysis...'}
              {activeDemo === 1 &&
                currentStep === 2 &&
                'Building hierarchical syntax tree structure...'}
              {activeDemo === 1 &&
                currentStep === 3 &&
                'Abstract Syntax Tree construction complete...'}
              {activeDemo === 1 && currentStep === 4 && 'Resolving variable and function scopes...'}

              {activeDemo === 2 &&
                currentStep === 0 &&
                'Receiving Abstract Syntax Tree from parser...'}
              {activeDemo === 2 &&
                currentStep === 1 &&
                'Generating compact bytecode representation...'}
              {activeDemo === 2 && currentStep === 2 && 'Bytecode ready for immediate execution...'}
              {activeDemo === 2 && currentStep === 3 && 'Interpreting bytecode instructions...'}
              {activeDemo === 2 &&
                currentStep === 4 &&
                'Executing code with baseline performance...'}

              {activeDemo === 3 &&
                currentStep === 0 &&
                'Identifying frequently executed code paths...'}
              {activeDemo === 3 &&
                currentStep === 1 &&
                'Collecting runtime type and behavior data...'}
              {activeDemo === 3 &&
                currentStep === 2 &&
                'Applying advanced optimization techniques...'}
              {activeDemo === 3 &&
                currentStep === 3 &&
                'Generated highly optimized machine code...'}
              {activeDemo === 3 &&
                currentStep === 4 &&
                'Fallback mechanism for assumption violations...'}

              {activeDemo === 4 && currentStep === 0 && 'Managing function execution contexts...'}
              {activeDemo === 4 &&
                currentStep === 1 &&
                'Allocating objects and variables in heap...'}
              {activeDemo === 4 &&
                currentStep === 2 &&
                'Automatic memory cleanup and optimization...'}
              {activeDemo === 4 &&
                currentStep === 3 &&
                'Young generation for short-lived objects...'}
              {activeDemo === 4 && currentStep === 4 && 'Old generation for long-lived objects...'}
            </p>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <h3 className="text-sm font-semibold text-gray-600">Processing Speed</h3>
          <div className="text-2xl font-bold text-blue-600">
            {animationPhase === 'processing'
              ? 'Active'
              : animationPhase === 'complete'
                ? 'Complete'
                : 'Ready'}
          </div>
          <p className="text-xs text-gray-500">Pipeline Status</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <h3 className="text-sm font-semibold text-gray-600">Optimization</h3>
          <div className="text-2xl font-bold text-green-600">
            {activeDemo === 3 ? 'TurboFan' : activeDemo === 2 ? 'Ignition' : 'V8'}
          </div>
          <p className="text-xs text-gray-500">Engine Component</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <h3 className="text-sm font-semibold text-gray-600">Pipeline Steps</h3>
          <div className="text-2xl font-bold text-purple-600">{steps.length}</div>
          <p className="text-xs text-gray-500">Total Stages</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-500">
          <h3 className="text-sm font-semibold text-gray-600">Current Step</h3>
          <div className="text-2xl font-bold text-orange-600">
            {animationPhase === 'processing'
              ? currentStep + 1
              : animationPhase === 'complete'
                ? steps.length
                : 0}
          </div>
          <p className="text-xs text-gray-500">Active Stage</p>
        </div>
      </div>

      {/* Engine Architecture Legend */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Component Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">🔍 Parser & Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">⚡ Ignition Interpreter</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm">🚀 TurboFan Optimizer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm">🌳 AST & Structures</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm">📊 Profiling & Feedback</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-indigo-500 rounded"></div>
            <span className="text-sm">⚙️ Machine Code</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Visualization Guide:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            <div>• Orange outline indicates active processing</div>
            <div>• Green checkmark shows completed steps</div>
            <div>• Animated pulse shows real-time activity</div>
            <div>• Arrows indicate data flow direction</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Engine2D;
