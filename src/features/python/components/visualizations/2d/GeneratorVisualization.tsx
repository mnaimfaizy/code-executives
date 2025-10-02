import React, { useState, useEffect, useCallback, useMemo } from 'react';
import VisualizationControls from '../../../../../components/shared/VisualizationControls';

interface GeneratorVisualizationProps {
  activeStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface GeneratorState {
  name: string;
  status: 'created' | 'running' | 'suspended' | 'completed';
  currentValue: number | null;
  yieldedValues: number[];
  x: number;
  y: number;
}

interface ExecutionStep {
  title: string;
  description: string;
  generators: GeneratorState[];
  explanation: string[];
  codeSnippet: string;
}

const GeneratorVisualization: React.FC<GeneratorVisualizationProps> = ({
  activeStep = 0,
  onStepChange,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(activeStep);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const executionSteps = useMemo<ExecutionStep[]>(
    () => [
      {
        title: 'Generator Creation',
        description: 'Defining a generator function with yield statements',
        generators: [
          {
            name: 'fibonacci',
            status: 'created',
            currentValue: null,
            yieldedValues: [],
            x: 200,
            y: 150,
          },
        ],
        explanation: [
          "Generator functions use 'yield' instead of 'return'",
          'Calling the function returns a generator object',
          "Execution doesn't start until next() is called",
        ],
        codeSnippet: `def fibonacci():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b`,
      },
      {
        title: 'First next() Call',
        description: 'Starting generator execution and yielding first value',
        generators: [
          {
            name: 'fibonacci',
            status: 'running',
            currentValue: 0,
            yieldedValues: [0],
            x: 200,
            y: 150,
          },
        ],
        explanation: [
          'Generator starts executing from the beginning',
          "Runs until it hits the first 'yield' statement",
          'Returns the yielded value and suspends execution',
          'Internal state is preserved between calls',
        ],
        codeSnippet: `gen = fibonacci()\nprint(next(gen))  # Output: 0`,
      },
      {
        title: 'Second next() Call',
        description: 'Resuming execution from where it left off',
        generators: [
          {
            name: 'fibonacci',
            status: 'running',
            currentValue: 1,
            yieldedValues: [0, 1],
            x: 200,
            y: 150,
          },
        ],
        explanation: [
          'Execution resumes right after the previous yield',
          "Variables 'a' and 'b' retain their values",
          'Generator continues the infinite loop',
          'Memory efficient - no need to store entire sequence',
        ],
        codeSnippet: `print(next(gen))  # Output: 1`,
      },
      {
        title: 'Multiple Generators',
        description: 'Running multiple generator instances independently',
        generators: [
          {
            name: 'fib1',
            status: 'suspended',
            currentValue: 5,
            yieldedValues: [0, 1, 1, 2, 3, 5],
            x: 120,
            y: 150,
          },
          {
            name: 'fib2',
            status: 'running',
            currentValue: 2,
            yieldedValues: [0, 1, 1, 2],
            x: 280,
            y: 150,
          },
        ],
        explanation: [
          'Each generator instance has independent state',
          'Multiple generators can run concurrently',
          'Perfect for cooperative multitasking',
          'Memory usage scales with active generators',
        ],
        codeSnippet: `gen1 = fibonacci()\ngen2 = fibonacci()\nprint(next(gen1))  # 0\nprint(next(gen2))  # 0`,
      },
      {
        title: 'Generator Completion',
        description: 'What happens when a generator finishes',
        generators: [
          {
            name: 'fibonacci',
            status: 'completed',
            currentValue: null,
            yieldedValues: [0, 1, 1, 2, 3, 5, 8, 13, 21],
            x: 200,
            y: 150,
          },
        ],
        explanation: [
          'Generators can run indefinitely or terminate',
          'When function returns, generator raises StopIteration',
          'All yielded values are consumed',
          'Generator object becomes unusable',
        ],
        codeSnippet: `# After many next() calls...\ntry:\n    next(gen)\nexcept StopIteration:\n    print("Generator exhausted")`,
      },
    ],
    []
  );

  // Control handlers
  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (onStepChange) onStepChange(0);
  }, [onStepChange]);

  const handleStepBack = useCallback(() => {
    const newStep = Math.max(0, currentStep - 1);
    setCurrentStep(newStep);
    if (onStepChange) onStepChange(newStep);
  }, [currentStep, onStepChange]);

  const handleStepForward = useCallback(() => {
    const newStep = Math.min(executionSteps.length - 1, currentStep + 1);
    setCurrentStep(newStep);
    if (onStepChange) onStepChange(newStep);
  }, [currentStep, executionSteps.length, onStepChange]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  // Auto-play effect
  useEffect(() => {
    let interval: number;

    if (isPlaying && currentStep < executionSteps.length - 1) {
      interval = window.setInterval(() => {
        const nextStep = currentStep + 1;
        if (nextStep < executionSteps.length) {
          setCurrentStep(nextStep);
          if (onStepChange) onStepChange(nextStep);
        } else {
          setIsPlaying(false);
        }
      }, 3500 / speed);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, executionSteps.length, speed, onStepChange]);

  useEffect(() => {
    setCurrentStep(activeStep);
  }, [activeStep]);

  const currentExecutionStep = executionSteps[currentStep];

  const getGeneratorStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return '#6B7280';
      case 'running':
        return '#10B981';
      case 'suspended':
        return '#F59E0B';
      case 'completed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getGeneratorStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return '📄';
      case 'running':
        return '⚡';
      case 'suspended':
        return '⏸️';
      case 'completed':
        return '✅';
      default:
        return '❓';
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-6 shadow-lg">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">🔄 Python Generators</h3>
          <p className="text-gray-600">Lazy evaluation and memory-efficient iteration</p>
        </div>

        <svg
          viewBox="0 0 500 350"
          className="w-full h-80 border-2 border-green-200 rounded-lg bg-white/80 backdrop-blur-sm mb-6"
        >
          {/* Generators */}
          {currentExecutionStep?.generators.map((gen) => (
            <g key={gen.name} style={{ transition: 'all 0.5s ease' }}>
              {/* Generator box */}
              <rect
                x={gen.x - 60}
                y={gen.y - 40}
                width="120"
                height="80"
                fill="#FFFFFF"
                stroke={getGeneratorStatusColor(gen.status)}
                strokeWidth="3"
                rx="8"
                style={{ transition: 'all 0.5s ease' }}
              />

              {/* Status indicator */}
              <circle
                cx={gen.x + 45}
                cy={gen.y - 35}
                r="12"
                fill={getGeneratorStatusColor(gen.status)}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={gen.x + 45}
                y={gen.y - 31}
                textAnchor="middle"
                fontSize="12"
                fill="white"
                fontWeight="bold"
              >
                {getGeneratorStatusIcon(gen.status)}
              </text>

              {/* Generator name */}
              <text
                x={gen.x}
                y={gen.y - 15}
                textAnchor="middle"
                fontSize="14"
                fill="#374151"
                fontWeight="bold"
              >
                {gen.name}()
              </text>

              {/* Current value */}
              {gen.currentValue !== null && (
                <text
                  x={gen.x}
                  y={gen.y + 5}
                  textAnchor="middle"
                  fontSize="16"
                  fill="#10B981"
                  fontWeight="bold"
                >
                  Current: {gen.currentValue}
                </text>
              )}

              {/* Yielded values */}
              <text x={gen.x} y={gen.y + 25} textAnchor="middle" fontSize="10" fill="#6B7280">
                Yielded: [{gen.yieldedValues.join(', ')}]
              </text>

              {/* Status text */}
              <text
                x={gen.x}
                y={gen.y + 45}
                textAnchor="middle"
                fontSize="11"
                fill={getGeneratorStatusColor(gen.status)}
                fontWeight="600"
              >
                {gen.status.toUpperCase()}
              </text>

              {/* Execution arrow for running generators */}
              {gen.status === 'running' && (
                <polygon
                  points={`${gen.x - 70},${gen.y} ${gen.x - 85},${gen.y - 5} ${gen.x - 85},${gen.y + 5}`}
                  fill="#10B981"
                  style={{ animation: 'bounce 1s infinite' }}
                />
              )}
            </g>
          ))}

          {/* Flow arrows between steps */}
          {currentStep > 0 && (
            <g>
              <line
                x1="200"
                y1="100"
                x2="200"
                y2="120"
                stroke="#10B981"
                strokeWidth="3"
                markerEnd="url(#flowArrow)"
              />
              <text x="220" y="110" fontSize="12" fill="#10B981" fontWeight="bold">
                next()
              </text>
            </g>
          )}

          {/* Arrow marker */}
          <defs>
            <marker
              id="flowArrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#10B981" />
            </marker>
          </defs>
        </svg>

        {/* Controls */}
        <VisualizationControls
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={executionSteps.length}
          speed={speed}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onStepBack={handleStepBack}
          onStepForward={handleStepForward}
          onSpeedChange={handleSpeedChange}
          className="mb-6"
        />

        {/* Educational Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Main explanation */}
          <div className="bg-white/60 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800 text-lg">{currentExecutionStep?.title}</h4>
              <span className="text-sm text-gray-600">Step {currentStep + 1}</span>
            </div>

            <p className="text-gray-700 mb-4">{currentExecutionStep?.description}</p>

            {/* Key Points */}
            <div className="grid gap-2">
              {currentExecutionStep?.explanation.map((point, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Code example */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h5 className="font-semibold text-white mb-3">Code Example</h5>
            <pre className="text-green-400 text-sm font-mono bg-gray-800 p-3 rounded border border-gray-700 overflow-x-auto">
              <code>{currentExecutionStep?.codeSnippet}</code>
            </pre>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span className="text-xs text-gray-300">Created</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-300">Running</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-xs text-gray-300">Suspended</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-300">Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorVisualization;
