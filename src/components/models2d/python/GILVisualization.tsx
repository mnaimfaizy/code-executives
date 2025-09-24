import React, { useState, useEffect, useCallback, useMemo } from 'react';
import VisualizationControls from '../../shared/VisualizationControls';

interface GILVisualizationProps {
  activeStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface Thread {
  id: string;
  name: string;
  status: 'waiting' | 'running' | 'blocked';
  x: number;
  y: number;
  color: string;
}

interface ExecutionStep {
  title: string;
  description: string;
  threads: Thread[];
  gilHolder: string | null;
  explanation: string[];
}

const GILVisualization: React.FC<GILVisualizationProps> = ({
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
        title: 'Single Thread Execution',
        description: 'Python executes one thread at a time due to the GIL',
        threads: [
          { id: 'main', name: 'Main Thread', status: 'running', x: 200, y: 150, color: '#3B82F6' },
          { id: 'worker1', name: 'Worker 1', status: 'waiting', x: 100, y: 250, color: '#10B981' },
          { id: 'worker2', name: 'Worker 2', status: 'waiting', x: 300, y: 250, color: '#F59E0B' },
        ],
        gilHolder: 'main',
        explanation: [
          'Only one thread can execute Python bytecode at a time',
          'The GIL prevents true parallel execution of Python threads',
          'Thread switching happens at I/O operations or time slices',
        ],
      },
      {
        title: 'Thread Context Switch',
        description: 'GIL is released and acquired by different threads',
        threads: [
          { id: 'main', name: 'Main Thread', status: 'waiting', x: 200, y: 150, color: '#3B82F6' },
          { id: 'worker1', name: 'Worker 1', status: 'running', x: 100, y: 250, color: '#10B981' },
          { id: 'worker2', name: 'Worker 2', status: 'waiting', x: 300, y: 250, color: '#F59E0B' },
        ],
        gilHolder: 'worker1',
        explanation: [
          'GIL is passed between threads during execution',
          'Each thread gets a time slice to execute',
          'Context switching overhead reduces performance',
        ],
      },
      {
        title: 'I/O Operation Release',
        description: 'GIL is released during I/O operations for better concurrency',
        threads: [
          { id: 'main', name: 'Main Thread', status: 'blocked', x: 200, y: 150, color: '#3B82F6' },
          { id: 'worker1', name: 'Worker 1', status: 'running', x: 100, y: 250, color: '#10B981' },
          { id: 'worker2', name: 'Worker 2', status: 'running', x: 300, y: 250, color: '#F59E0B' },
        ],
        gilHolder: null,
        explanation: [
          'GIL is released during I/O operations',
          'Multiple threads can perform I/O simultaneously',
          'True parallelism possible for I/O-bound tasks',
        ],
      },
      {
        title: 'CPU-Bound Limitation',
        description: 'GIL prevents parallel CPU processing in Python threads',
        threads: [
          { id: 'main', name: 'Main Thread', status: 'waiting', x: 200, y: 150, color: '#3B82F6' },
          { id: 'worker1', name: 'Worker 1', status: 'running', x: 100, y: 250, color: '#10B981' },
          { id: 'worker2', name: 'Worker 2', status: 'waiting', x: 300, y: 250, color: '#F59E0B' },
        ],
        gilHolder: 'worker1',
        explanation: [
          'CPU-bound tasks cannot benefit from threading',
          'Use multiprocessing for CPU-intensive work',
          'GIL is a limitation for computational parallelism',
        ],
      },
      {
        title: 'Multiprocessing Alternative',
        description: 'Separate processes bypass the GIL limitation',
        threads: [
          {
            id: 'process1',
            name: 'Process 1',
            status: 'running',
            x: 150,
            y: 150,
            color: '#8B5CF6',
          },
          {
            id: 'process2',
            name: 'Process 2',
            status: 'running',
            x: 250,
            y: 150,
            color: '#EC4899',
          },
          {
            id: 'process3',
            name: 'Process 3',
            status: 'running',
            x: 200,
            y: 250,
            color: '#06B6D4',
          },
        ],
        gilHolder: null,
        explanation: [
          'Each process has its own GIL',
          'True parallel execution across CPU cores',
          'Use multiprocessing for CPU-bound tasks',
          'Processes have higher memory overhead',
        ],
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

  const getThreadStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#10B981';
      case 'waiting':
        return '#F59E0B';
      case 'blocked':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getThreadStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return '▶️';
      case 'waiting':
        return '⏸️';
      case 'blocked':
        return '⏹️';
      default:
        return '❓';
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-xl p-6 shadow-lg">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            🔒 Global Interpreter Lock (GIL)
          </h3>
          <p className="text-gray-600">
            Understanding Python's threading limitations and solutions
          </p>
        </div>

        <svg
          viewBox="0 0 500 350"
          className="w-full h-80 border-2 border-red-200 rounded-lg bg-white/80 backdrop-blur-sm mb-6"
        >
          {/* GIL Lock */}
          <g transform="translate(225, 50)">
            <rect
              x="-30"
              y="-20"
              width="60"
              height="40"
              fill={currentExecutionStep?.gilHolder ? '#EF4444' : '#10B981'}
              stroke="#374151"
              strokeWidth="2"
              rx="8"
            />
            <text x="0" y="-5" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
              GIL
            </text>
            <text x="0" y="10" textAnchor="middle" fontSize="10" fill="white">
              {currentExecutionStep?.gilHolder
                ? `Held by ${currentExecutionStep.gilHolder}`
                : 'Released'}
            </text>
          </g>

          {/* Threads */}
          {currentExecutionStep?.threads.map((thread) => (
            <g key={thread.id} style={{ transition: 'all 0.5s ease' }}>
              {/* Thread circle */}
              <circle
                cx={thread.x}
                cy={thread.y}
                r="25"
                fill={thread.color}
                stroke={getThreadStatusColor(thread.status)}
                strokeWidth="3"
                style={{ transition: 'all 0.5s ease' }}
              />

              {/* Status indicator */}
              <circle
                cx={thread.x + 20}
                cy={thread.y - 20}
                r="8"
                fill={getThreadStatusColor(thread.status)}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={thread.x + 20}
                y={thread.y - 16}
                textAnchor="middle"
                fontSize="10"
                fill="white"
                fontWeight="bold"
              >
                {getThreadStatusIcon(thread.status)}
              </text>

              {/* Thread name */}
              <text
                x={thread.x}
                y={thread.y + 35}
                textAnchor="middle"
                fontSize="12"
                fill="#374151"
                fontWeight="bold"
              >
                {thread.name}
              </text>

              {/* Status text */}
              <text
                x={thread.x}
                y={thread.y + 48}
                textAnchor="middle"
                fontSize="10"
                fill={getThreadStatusColor(thread.status)}
                fontWeight="600"
              >
                {thread.status.toUpperCase()}
              </text>

              {/* GIL connection line */}
              {currentExecutionStep.gilHolder === thread.id && (
                <line
                  x1={thread.x}
                  y1={thread.y - 25}
                  x2="250"
                  y2="70"
                  stroke="#EF4444"
                  strokeWidth="3"
                  markerEnd="url(#gilArrow)"
                  style={{ animation: 'pulse 1s infinite' }}
                />
              )}
            </g>
          ))}

          {/* Arrow marker */}
          <defs>
            <marker
              id="gilArrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#EF4444" />
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
        <div className="bg-white/60 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800 text-lg">{currentExecutionStep?.title}</h4>
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {executionSteps.length}
            </span>
          </div>

          <p className="text-gray-700 mb-4">{currentExecutionStep?.description}</p>

          {/* Key Points */}
          <div className="grid gap-2 mb-4">
            {currentExecutionStep?.explanation.map((point, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 text-sm">{point}</p>
              </div>
            ))}
          </div>

          {/* Thread Status Legend */}
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Running - Active execution</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">Waiting - Ready to run</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Blocked - I/O operation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GILVisualization;
