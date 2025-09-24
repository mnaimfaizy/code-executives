import React, { useState, useEffect, useCallback } from 'react';
import VisualizationControls from '../../shared/VisualizationControls';

interface ExecutionFlow2DProps {
  activeStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface ExecutionStep {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
  isActive: boolean;
}

const ExecutionFlow2D: React.FC<ExecutionFlow2DProps> = ({
  activeStep = 0,
  onStepChange,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(activeStep);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(1);

  const steps: ExecutionStep[] = [
    {
      id: 'source',
      label: 'Source Code',
      description: 'Python .py file',
      x: 100,
      y: 50,
      isActive: currentStep >= 0,
    },
    {
      id: 'lexer',
      label: 'Lexical Analysis',
      description: 'Token generation',
      x: 300,
      y: 50,
      isActive: currentStep >= 1,
    },
    {
      id: 'parser',
      label: 'Parsing',
      description: 'Syntax tree creation',
      x: 500,
      y: 50,
      isActive: currentStep >= 2,
    },
    {
      id: 'bytecode',
      label: 'Bytecode Generation',
      description: 'Compile to .pyc',
      x: 400,
      y: 150,
      isActive: currentStep >= 3,
    },
    {
      id: 'pvm',
      label: 'Python Virtual Machine',
      description: 'Execute bytecode',
      x: 200,
      y: 250,
      isActive: currentStep >= 4,
    },
    {
      id: 'output',
      label: 'Program Output',
      description: 'Results & execution',
      x: 500,
      y: 250,
      isActive: currentStep >= 5,
    },
  ];

  const connections = [
    { from: 'source', to: 'lexer' },
    { from: 'lexer', to: 'parser' },
    { from: 'parser', to: 'bytecode' },
    { from: 'bytecode', to: 'pvm' },
    { from: 'pvm', to: 'output' },
  ];

  useEffect(() => {
    setCurrentStep(activeStep);
  }, [activeStep]);

  // Control handlers
  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    if (onStepChange) onStepChange(0);
  }, [onStepChange]);

  const handleStepBack = useCallback(() => {
    const newStep = Math.max(0, currentStep - 1);
    setCurrentStep(newStep);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    if (onStepChange) onStepChange(newStep);
  }, [currentStep, onStepChange]);

  const handleStepForward = useCallback(() => {
    const newStep = Math.min(steps.length - 1, currentStep + 1);
    setCurrentStep(newStep);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    if (onStepChange) onStepChange(newStep);
  }, [currentStep, steps.length, onStepChange]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  // Auto-play effect
  useEffect(() => {
    let interval: number;

    if (isPlaying && currentStep < steps.length - 1) {
      interval = window.setInterval(() => {
        const nextStep = currentStep + 1;
        if (nextStep < steps.length) {
          setCurrentStep(nextStep);
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 600);
          if (onStepChange) onStepChange(nextStep);
        } else {
          setIsPlaying(false);
        }
      }, 2000 / speed); // Base 2 seconds, adjusted by speed
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, steps.length, speed, onStepChange]);

  const handleStepClick = (stepIndex: number) => {
    if (onStepChange) {
      onStepChange(stepIndex);
    }
    setCurrentStep(stepIndex);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const getStepColor = (step: ExecutionStep) => {
    if (step.isActive && currentStep >= steps.findIndex((s) => s.id === step.id)) {
      return { bg: '#3B82F6', border: '#1D4ED8', text: '#FFFFFF' }; // blue
    }
    return { bg: '#F3F4F6', border: '#D1D5DB', text: '#6B7280' }; // gray
  };

  const getConnectionColor = (toId: string) => {
    const toIndex = steps.findIndex((s) => s.id === toId);
    return currentStep >= toIndex ? '#3B82F6' : '#D1D5DB';
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 rounded-xl p-6 shadow-lg">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">🐍 Python Execution Flow</h3>
          <p className="text-gray-600">From source code to program execution</p>
        </div>

        <svg
          viewBox="0 0 600 350"
          className="w-full h-80 border-2 border-blue-100 rounded-lg bg-white/80 backdrop-blur-sm"
        >
          {/* Definitions */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
            </marker>
            <marker
              id="arrowhead-gray"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#D1D5DB" />
            </marker>
          </defs>

          {/* Connections */}
          {connections.map((conn, index) => {
            const fromStep = steps.find((s) => s.id === conn.from)!;
            const toStep = steps.find((s) => s.id === conn.to)!;
            const color = getConnectionColor(conn.to);
            const markerId = color === '#3B82F6' ? 'arrowhead' : 'arrowhead-gray';

            return (
              <line
                key={`conn-${index}`}
                x1={fromStep.x}
                y1={fromStep.y}
                x2={toStep.x}
                y2={toStep.y}
                stroke={color}
                strokeWidth="3"
                markerEnd={`url(#${markerId})`}
                style={{ transition: 'stroke 0.3s ease' }}
              />
            );
          })}

          {/* Steps */}
          {steps.map((step, index) => {
            const colors = getStepColor(step);
            const isCurrentActive = currentStep === index;
            const scale = isCurrentActive && isAnimating ? 1.1 : 1;

            return (
              <g
                key={step.id}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: `${step.x}px ${step.y}px`,
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer',
                }}
                onClick={() => handleStepClick(index)}
              >
                {/* Step circle */}
                <circle
                  cx={step.x}
                  cy={step.y}
                  r="35"
                  fill={colors.bg}
                  stroke={colors.border}
                  strokeWidth="3"
                  style={{ transition: 'all 0.3s ease' }}
                />

                {/* Step icon */}
                <text
                  x={step.x}
                  y={step.y - 8}
                  textAnchor="middle"
                  fontSize="16"
                  fill={colors.text}
                  fontWeight="bold"
                >
                  {index === 0 && '📄'}
                  {index === 1 && '🔤'}
                  {index === 2 && '🌳'}
                  {index === 3 && '⚙️'}
                  {index === 4 && '🚀'}
                  {index === 5 && '📤'}
                </text>

                {/* Step label */}
                <text
                  x={step.x}
                  y={step.y + 45}
                  textAnchor="middle"
                  fontSize="12"
                  fill={colors.text}
                  fontWeight="600"
                  style={{ transition: 'fill 0.3s ease' }}
                >
                  {step.label}
                </text>

                {/* Step description */}
                <text
                  x={step.x}
                  y={step.y + 58}
                  textAnchor="middle"
                  fontSize="10"
                  fill={colors.text === '#FFFFFF' ? '#E5E7EB' : '#9CA3AF'}
                  style={{ transition: 'fill 0.3s ease' }}
                >
                  {step.description}
                </text>

                {/* Active indicator */}
                {isCurrentActive && (
                  <circle
                    cx={step.x}
                    cy={step.y}
                    r="40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Control buttons */}
        <VisualizationControls
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={steps.length}
          speed={speed}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onStepBack={handleStepBack}
          onStepForward={handleStepForward}
          onSpeedChange={handleSpeedChange}
          className="mt-6"
        />

        {/* Current step description */}
        <div className="mt-4 p-4 bg-white/60 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">{steps[currentStep]?.label}</h4>
          <p className="text-gray-600 text-sm">
            {currentStep === 0 &&
              'Python execution begins with your source code file (.py). This human-readable code contains the instructions you want to execute.'}
            {currentStep === 1 &&
              'The lexer (lexical analyzer) breaks the source code into tokens - keywords, identifiers, operators, and literals that the parser can understand.'}
            {currentStep === 2 &&
              "The parser analyzes the token stream and builds an Abstract Syntax Tree (AST) representing the program's structure and relationships."}
            {currentStep === 3 &&
              "The AST is compiled into bytecode (.pyc files), Python's intermediate representation that's platform-independent and optimized for execution."}
            {currentStep === 4 &&
              'The Python Virtual Machine (PVM) reads and executes the bytecode instructions, translating them into machine code that your computer can run.'}
            {currentStep === 5 &&
              'The program produces output - this could be printed text, files written to disk, network communications, or any other result of your code execution.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExecutionFlow2D;
