import React, { useState, useEffect, useCallback, useMemo } from 'react';
import VisualizationControls from '../../shared/VisualizationControls';

interface DecoratorVisualizationProps {
  activeStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface FunctionCall {
  id: string;
  name: string;
  args: string[];
  returnValue?: string;
  x: number;
  y: number;
  isActive: boolean;
}

interface ExecutionStep {
  title: string;
  description: string;
  functions: FunctionCall[];
  explanation: string[];
  codeSnippet: string;
  decorators: string[];
}

const DecoratorVisualization: React.FC<DecoratorVisualizationProps> = ({
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
        title: 'Function Definition',
        description: 'Creating a simple function that will be decorated',
        functions: [
          {
            id: 'greet',
            name: 'greet',
            args: ['name'],
            x: 200,
            y: 150,
            isActive: false,
          },
        ],
        explanation: [
          'Start with a regular function definition',
          'Function takes parameters and returns a value',
          'No decorators applied yet',
        ],
        codeSnippet: `def greet(name):\n    return f"Hello, {name}!"`,
        decorators: [],
      },
      {
        title: 'Decorator Function',
        description: 'Creating a decorator that wraps the original function',
        functions: [
          {
            id: 'greet',
            name: 'greet',
            args: ['name'],
            x: 200,
            y: 150,
            isActive: false,
          },
          {
            id: 'uppercase_decorator',
            name: 'uppercase_decorator',
            args: ['func'],
            x: 350,
            y: 120,
            isActive: true,
          },
        ],
        explanation: [
          'Decorators are functions that take a function as input',
          "They return a new function that 'wraps' the original",
          'The wrapper can add behavior before/after the original function',
        ],
        codeSnippet: `def uppercase_decorator(func):\n    def wrapper(*args, **kwargs):\n        result = func(*args, **kwargs)\n        return result.upper()\n    return wrapper`,
        decorators: ['@uppercase_decorator'],
      },
      {
        title: 'Applying Decorator',
        description: 'Using the @ syntax to apply the decorator',
        functions: [
          {
            id: 'greet',
            name: 'greet',
            args: ['name'],
            x: 200,
            y: 150,
            isActive: false,
          },
          {
            id: 'uppercase_decorator',
            name: 'uppercase_decorator',
            args: ['func'],
            x: 350,
            y: 120,
            isActive: true,
          },
          {
            id: 'decorated_greet',
            name: 'greet',
            args: ['name'],
            returnValue: 'HELLO, ALICE!',
            x: 200,
            y: 200,
            isActive: true,
          },
        ],
        explanation: [
          '@decorator syntax is syntactic sugar',
          'Equivalent to: greet = uppercase_decorator(greet)',
          'The original function is replaced by the decorated version',
          'Decorator executes at function definition time',
        ],
        codeSnippet: `@uppercase_decorator\ndef greet(name):\n    return f"Hello, {name}!"\n\n# Equivalent to:\n# greet = uppercase_decorator(greet)`,
        decorators: ['@uppercase_decorator'],
      },
      {
        title: 'Function Call',
        description: 'Calling the decorated function',
        functions: [
          {
            id: 'greet',
            name: 'greet',
            args: ['name'],
            returnValue: 'HELLO, ALICE!',
            x: 200,
            y: 150,
            isActive: true,
          },
          {
            id: 'uppercase_decorator',
            name: 'uppercase_decorator',
            args: ['func'],
            x: 350,
            y: 120,
            isActive: false,
          },
        ],
        explanation: [
          "When you call greet(), you're actually calling the wrapper",
          'The wrapper calls the original function first',
          'Then applies additional behavior (uppercase conversion)',
          'User sees the enhanced result without knowing about decoration',
        ],
        codeSnippet: `result = greet("Alice")\nprint(result)  # Output: HELLO, ALICE!`,
        decorators: ['@uppercase_decorator'],
      },
      {
        title: 'Multiple Decorators',
        description: 'Stacking multiple decorators on a single function',
        functions: [
          {
            id: 'greet',
            name: 'greet',
            args: ['name'],
            returnValue: '***HELLO, ALICE!***',
            x: 200,
            y: 150,
            isActive: true,
          },
          {
            id: 'uppercase_decorator',
            name: 'uppercase_decorator',
            args: ['func'],
            x: 350,
            y: 120,
            isActive: false,
          },
          {
            id: 'add_stars_decorator',
            name: 'add_stars_decorator',
            args: ['func'],
            x: 350,
            y: 180,
            isActive: false,
          },
        ],
        explanation: [
          'Decorators are applied from bottom to top',
          '@add_stars is applied first, then @uppercase',
          'Result: add_stars(uppercase(greet()))',
          'Order matters - decorators compose the function',
        ],
        codeSnippet: `@add_stars_decorator\n@uppercase_decorator\ndef greet(name):\n    return f"Hello, {name}!"\n\n# Execution order: add_stars(uppercase(greet))`,
        decorators: ['@add_stars_decorator', '@uppercase_decorator'],
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
      }, 4000 / speed);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, executionSteps.length, speed, onStepChange]);

  useEffect(() => {
    setCurrentStep(activeStep);
  }, [activeStep]);

  const currentExecutionStep = executionSteps[currentStep];

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-xl p-6 shadow-lg">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">🎨 Python Decorators</h3>
          <p className="text-gray-600">Function wrappers that modify behavior</p>
        </div>

        <svg
          viewBox="0 0 500 350"
          className="w-full h-80 border-2 border-purple-200 rounded-lg bg-white/80 backdrop-blur-sm mb-6"
        >
          {/* Functions */}
          {currentExecutionStep?.functions.map((func) => (
            <g key={func.id} style={{ transition: 'all 0.5s ease' }}>
              {/* Function box */}
              <rect
                x={func.x - 70}
                y={func.y - 30}
                width="140"
                height="60"
                fill={func.isActive ? '#EDE9FE' : '#FFFFFF'}
                stroke={func.isActive ? '#8B5CF6' : '#D1D5DB'}
                strokeWidth={func.isActive ? '3' : '2'}
                rx="8"
                style={{ transition: 'all 0.5s ease' }}
              />

              {/* Function name */}
              <text
                x={func.x}
                y={func.y - 8}
                textAnchor="middle"
                fontSize="14"
                fill="#374151"
                fontWeight="bold"
              >
                {func.name}({func.args.join(', ')})
              </text>

              {/* Return value */}
              {func.returnValue && (
                <text
                  x={func.x}
                  y={func.y + 8}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#8B5CF6"
                  fontWeight="600"
                >
                  → {func.returnValue}
                </text>
              )}

              {/* Active indicator */}
              {func.isActive && (
                <circle
                  cx={func.x + 55}
                  cy={func.y - 25}
                  r="8"
                  fill="#8B5CF6"
                  stroke="white"
                  strokeWidth="2"
                >
                  <animate
                    attributeName="opacity"
                    values="1;0.5;1"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          ))}

          {/* Decorator arrows */}
          {currentStep >= 1 && (
            <g>
              <line
                x1="270"
                y1="150"
                x2="290"
                y2="135"
                stroke="#8B5CF6"
                strokeWidth="3"
                markerEnd="url(#decoratorArrow)"
              />
              <text x="285" y="125" fontSize="10" fill="#8B5CF6" fontWeight="bold">
                wraps
              </text>
            </g>
          )}

          {/* Multiple decorator arrows */}
          {currentStep >= 4 && (
            <g>
              <line
                x1="270"
                y1="150"
                x2="290"
                y2="175"
                stroke="#8B5CF6"
                strokeWidth="3"
                markerEnd="url(#decoratorArrow)"
              />
              <text x="285" y="195" fontSize="10" fill="#8B5CF6" fontWeight="bold">
                wraps
              </text>
            </g>
          )}

          {/* Arrow marker */}
          <defs>
            <marker
              id="decoratorArrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#8B5CF6" />
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

            {/* Applied Decorators */}
            {currentExecutionStep?.decorators.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-800 mb-2">Applied Decorators:</h5>
                <div className="flex flex-wrap gap-2">
                  {currentExecutionStep.decorators.map((decorator, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {decorator}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Points */}
            <div className="grid gap-2">
              {currentExecutionStep?.explanation.map((point, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Code example */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h5 className="font-semibold text-white mb-3">Code Example</h5>
            <pre className="text-purple-400 text-sm font-mono bg-gray-800 p-3 rounded border border-gray-700 overflow-x-auto">
              <code>{currentExecutionStep?.codeSnippet}</code>
            </pre>

            {/* Decorator Pattern */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h6 className="font-medium text-white mb-2">Decorator Pattern:</h6>
              <div className="text-xs text-gray-300 space-y-1">
                <div>def decorator(func):</div>
                <div className="ml-4">def wrapper(*args, **kwargs):</div>
                <div className="ml-8 text-purple-400"># Pre-processing</div>
                <div className="ml-8">result = func(*args, **kwargs)</div>
                <div className="ml-8 text-purple-400"># Post-processing</div>
                <div className="ml-8">return result</div>
                <div className="ml-4">return wrapper</div>
                <div>return wrapper</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecoratorVisualization;
