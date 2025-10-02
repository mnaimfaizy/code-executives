import React, { useState, useEffect, useMemo, useCallback } from 'react';
import VisualizationControls from '../../../../../components/shared/VisualizationControls';

interface MemoryModel2DProps {
  activeStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface MemoryItem {
  id: string;
  type: 'variable' | 'object' | 'function';
  name: string;
  value: string;
  address: string;
  x: number;
  y: number;
  isHighlighted: boolean;
}

const MemoryModel2D: React.FC<MemoryModel2DProps> = ({
  activeStep = 0,
  onStepChange,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(activeStep);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Sample memory data for demonstration
  const [stackItems, setStackItems] = useState<MemoryItem[]>([
    {
      id: 'var1',
      type: 'variable',
      name: 'x',
      value: '42',
      address: '0x1000',
      x: 100,
      y: 80,
      isHighlighted: false,
    },
    {
      id: 'var2',
      type: 'variable',
      name: 'name',
      value: '"Alice"',
      address: '0x1008',
      x: 100,
      y: 140,
      isHighlighted: false,
    },
    {
      id: 'var3',
      type: 'variable',
      name: 'data',
      value: '0x2000',
      address: '0x1010',
      x: 100,
      y: 200,
      isHighlighted: false,
    },
  ]);

  const [heapItems, setHeapItems] = useState<MemoryItem[]>([
    {
      id: 'obj1',
      type: 'object',
      name: 'Person',
      value: '{name: "Alice", age: 30}',
      address: '0x2000',
      x: 350,
      y: 100,
      isHighlighted: false,
    },
    {
      id: 'obj2',
      type: 'object',
      name: 'List',
      value: '[1, 2, 3, 4, 5]',
      address: '0x2010',
      x: 350,
      y: 180,
      isHighlighted: false,
    },
    {
      id: 'obj3',
      type: 'function',
      name: 'greet',
      value: 'def greet(): ...',
      address: '0x2020',
      x: 350,
      y: 260,
      isHighlighted: false,
    },
  ]);

  const steps = useMemo(
    () => [
      {
        title: 'Memory Allocation',
        description:
          'When you create variables and objects in Python, they are stored in different memory regions.',
        highlights: [],
      },
      {
        title: 'Stack Memory',
        description:
          'The stack stores function calls, local variables, and references to objects in the heap.',
        highlights: ['var1', 'var2', 'var3'],
      },
      {
        title: 'Heap Memory',
        description:
          'The heap stores dynamically allocated objects, arrays, and complex data structures.',
        highlights: ['obj1', 'obj2', 'obj3'],
      },
      {
        title: 'References',
        description:
          'Variables on the stack hold references (pointers) to objects stored in the heap memory.',
        highlights: ['var3', 'obj1'],
      },
      {
        title: 'Garbage Collection',
        description:
          'Python automatically manages memory using reference counting and garbage collection.',
        highlights: [],
      },
    ],
    []
  );

  useEffect(() => {
    setCurrentStep(activeStep);
  }, [activeStep]);

  useEffect(() => {
    // Update highlights based on current step
    const highlights = steps[currentStep]?.highlights || [];

    setStackItems((prev) =>
      prev.map((item) => ({
        ...item,
        isHighlighted: highlights.includes(item.id),
      }))
    );

    setHeapItems((prev) =>
      prev.map((item) => ({
        ...item,
        isHighlighted: highlights.includes(item.id),
      }))
    );
  }, [currentStep, steps]);

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
    const newStep = Math.min(steps.length - 1, currentStep + 1);
    setCurrentStep(newStep);
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
          if (onStepChange) onStepChange(nextStep);
        } else {
          setIsPlaying(false);
        }
      }, 2500 / speed); // Base 2.5 seconds, adjusted by speed
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, steps.length, speed, onStepChange]);

  const getItemColor = (item: MemoryItem, isStack: boolean) => {
    if (item.isHighlighted) {
      return isStack ? '#10B981' : '#3B82F6'; // green for stack, blue for heap
    }
    return isStack ? '#6B7280' : '#8B5CF6'; // gray for stack, purple for heap
  };

  const getItemOpacity = (item: MemoryItem) => {
    if (currentStep === 0) return 0.3; // Dim everything initially
    return item.isHighlighted || currentStep >= 4 ? 1 : 0.5;
  };

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-xl p-6 shadow-lg">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">🧠 Python Memory Model</h3>
          <p className="text-gray-600">Understanding Stack vs Heap memory allocation</p>
        </div>

        <svg
          viewBox="0 0 600 400"
          className="w-full h-96 border-2 border-indigo-100 rounded-lg bg-white/80 backdrop-blur-sm mb-6"
        >
          {/* Stack Memory Region */}
          <rect
            x="50"
            y="50"
            width="180"
            height="300"
            fill="url(#stackGradient)"
            stroke="#374151"
            strokeWidth="2"
            rx="8"
          />
          <text x="140" y="35" textAnchor="middle" className="text-sm font-bold" fill="#374151">
            📚 STACK MEMORY
          </text>
          <text x="140" y="48" textAnchor="middle" className="text-xs" fill="#6B7280">
            Local Variables & References
          </text>

          {/* Heap Memory Region */}
          <rect
            x="300"
            y="50"
            width="250"
            height="300"
            fill="url(#heapGradient)"
            stroke="#374151"
            strokeWidth="2"
            rx="8"
          />
          <text x="425" y="35" textAnchor="middle" className="text-sm font-bold" fill="#374151">
            🏗️ HEAP MEMORY
          </text>
          <text x="425" y="48" textAnchor="middle" className="text-xs" fill="#6B7280">
            Objects & Dynamic Data
          </text>

          {/* Gradients */}
          <defs>
            <linearGradient id="stackGradient" x1="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#F3F4F6" />
              <stop offset="100%" stopColor="#E5E7EB" />
            </linearGradient>
            <linearGradient id="heapGradient" x1="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#F3E8FF" />
              <stop offset="100%" stopColor="#E9D5FF" />
            </linearGradient>
          </defs>

          {/* Stack Items */}
          {stackItems.map((item) => (
            <g key={item.id} style={{ transition: 'all 0.3s ease' }}>
              {/* Memory cell */}
              <rect
                x={item.x - 40}
                y={item.y - 15}
                width="80"
                height="30"
                fill={getItemColor(item, true)}
                stroke="#FFFFFF"
                strokeWidth="2"
                rx="4"
                opacity={getItemOpacity(item)}
                style={{ transition: 'all 0.3s ease' }}
              />

              {/* Address */}
              <text x={item.x - 35} y={item.y - 2} fontSize="9" fill="white" fontWeight="bold">
                {item.address}
              </text>

              {/* Variable name */}
              <text
                x={item.x}
                y={item.y + 8}
                textAnchor="middle"
                fontSize="11"
                fill="white"
                fontWeight="bold"
              >
                {item.name}
              </text>

              {/* Value */}
              <text x={item.x} y={item.y + 20} textAnchor="middle" fontSize="9" fill="white">
                {item.value}
              </text>

              {/* Highlight indicator */}
              {item.isHighlighted && (
                <circle
                  cx={item.x + 35}
                  cy={item.y}
                  r="8"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  className="animate-pulse"
                />
              )}
            </g>
          ))}

          {/* Heap Items */}
          {heapItems.map((item) => (
            <g key={item.id} style={{ transition: 'all 0.3s ease' }}>
              {/* Memory cell */}
              <rect
                x={item.x - 60}
                y={item.y - 20}
                width="120"
                height="40"
                fill={getItemColor(item, false)}
                stroke="#FFFFFF"
                strokeWidth="2"
                rx="6"
                opacity={getItemOpacity(item)}
                style={{ transition: 'all 0.3s ease' }}
              />

              {/* Address */}
              <text x={item.x - 55} y={item.y - 8} fontSize="9" fill="white" fontWeight="bold">
                {item.address}
              </text>

              {/* Object name */}
              <text
                x={item.x}
                y={item.y + 2}
                textAnchor="middle"
                fontSize="12"
                fill="white"
                fontWeight="bold"
              >
                {item.name}
              </text>

              {/* Value (truncated for display) */}
              <text x={item.x} y={item.y + 15} textAnchor="middle" fontSize="9" fill="white">
                {item.value.length > 15 ? item.value.substring(0, 15) + '...' : item.value}
              </text>

              {/* Highlight indicator */}
              {item.isHighlighted && (
                <circle
                  cx={item.x + 55}
                  cy={item.y}
                  r="8"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  className="animate-pulse"
                />
              )}
            </g>
          ))}

          {/* Reference arrows */}
          {currentStep >= 3 && (
            <>
              {/* Arrow from data variable to Person object */}
              <line
                x1="140"
                y1="200"
                x2="290"
                y2="100"
                stroke="#10B981"
                strokeWidth="3"
                markerEnd="url(#arrowhead-green)"
                opacity="0.8"
              />
              <text
                x="215"
                y="145"
                textAnchor="middle"
                fontSize="10"
                fill="#10B981"
                fontWeight="bold"
              >
                REFERENCE
              </text>
            </>
          )}

          {/* Arrow markers */}
          <defs>
            <marker
              id="arrowhead-green"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
            </marker>
          </defs>
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
          className="mb-6"
        />

        {/* Current step description */}
        <div className="bg-white/60 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">{steps[currentStep]?.title}</h4>
          <p className="text-gray-600 text-sm mb-3">{steps[currentStep]?.description}</p>

          {/* Key insights */}
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h5 className="font-semibold text-blue-800 mb-1">Stack Memory</h5>
              <ul className="text-blue-700 space-y-1">
                <li>• Fast access (LIFO structure)</li>
                <li>• Automatic cleanup on function exit</li>
                <li>• Fixed size, limited space</li>
                <li>• Stores primitive values & references</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <h5 className="font-semibold text-purple-800 mb-1">Heap Memory</h5>
              <ul className="text-purple-700 space-y-1">
                <li>• Dynamic allocation</li>
                <li>• Slower access but flexible</li>
                <li>• Managed by garbage collector</li>
                <li>• Stores objects & complex data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryModel2D;
