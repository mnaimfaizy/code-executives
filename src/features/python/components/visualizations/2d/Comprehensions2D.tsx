import React, { useState, useEffect, useCallback, useMemo } from 'react';
import VisualizationControls from '../../../../../components/shared/VisualizationControls';

interface CompStep {
  title: string;
  description: string;
  inputItems: { value: string; included: boolean; transformed?: string }[];
  expression: string;
  result: string[];
  annotations: string[];
  type: 'list' | 'dict' | 'set' | 'generator';
}

const Comprehensions2D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const typeColors: Record<string, string> = {
    list: '#3b82f6',
    dict: '#8b5cf6',
    set: '#ef4444',
    generator: '#10b981',
  };

  const steps = useMemo<CompStep[]>(
    () => [
      {
        title: 'List Comprehension',
        description: '[expression for item in iterable if condition]',
        type: 'list',
        inputItems: [
          { value: '1', included: true, transformed: '1' },
          { value: '2', included: true, transformed: '4' },
          { value: '3', included: true, transformed: '9' },
          { value: '4', included: true, transformed: '16' },
          { value: '5', included: true, transformed: '25' },
        ],
        expression: '[x**2 for x in range(1, 6)]',
        result: ['1', '4', '9', '16', '25'],
        annotations: [
          'Iterates over range(1, 6): 1, 2, 3, 4, 5',
          'Applies expression x**2 to each element',
          'Builds a new list from the results',
          'Equivalent to a for-loop with append',
        ],
      },
      {
        title: 'Filtered List Comprehension',
        description: 'Add a condition to filter elements',
        type: 'list',
        inputItems: [
          { value: '1', included: false },
          { value: '2', included: true, transformed: '4' },
          { value: '3', included: false },
          { value: '4', included: true, transformed: '16' },
          { value: '5', included: false },
          { value: '6', included: true, transformed: '36' },
        ],
        expression: '[x**2 for x in range(1, 7) if x % 2 == 0]',
        result: ['4', '16', '36'],
        annotations: [
          'First filters: keep only even numbers (x % 2 == 0)',
          'Then transforms: square each remaining number',
          'Odd numbers (1, 3, 5) are skipped entirely',
          '3 items pass the filter → 3 results',
        ],
      },
      {
        title: 'Dictionary Comprehension',
        description: '{key: value for item in iterable}',
        type: 'dict',
        inputItems: [
          { value: 'a', included: true, transformed: 'a: 1' },
          { value: 'b', included: true, transformed: 'b: 2' },
          { value: 'c', included: true, transformed: 'c: 3' },
        ],
        expression: '{ch: i for i, ch in enumerate("abc", 1)}',
        result: ['a: 1', 'b: 2', 'c: 3'],
        annotations: [
          'Creates key-value pairs from an iterable',
          'enumerate() provides both index and value',
          'Result is a dictionary, not a list',
          'Useful for inverting dicts, counting, mapping',
        ],
      },
      {
        title: 'Set Comprehension',
        description: '{expression for item in iterable}',
        type: 'set',
        inputItems: [
          { value: '"hello"', included: true, transformed: 'h' },
          { value: '"hello"', included: true, transformed: 'e' },
          { value: '"hello"', included: true, transformed: 'l' },
          { value: '"hello"', included: false },
          { value: '"hello"', included: true, transformed: 'o' },
        ],
        expression: '{ch for ch in "hello"}',
        result: ['h', 'e', 'l', 'o'],
        annotations: [
          'Produces a set — duplicate "l" is removed',
          'Order is not guaranteed (sets are unordered)',
          'Useful for extracting unique values',
          'Same syntax as dict comp but without key: value',
        ],
      },
      {
        title: 'Generator Expression',
        description: '(expression for item in iterable) — lazy evaluation',
        type: 'generator',
        inputItems: [
          { value: '0', included: true, transformed: '0' },
          { value: '1', included: true, transformed: '1' },
          { value: '2', included: true, transformed: '4' },
          { value: '...', included: true, transformed: '...' },
          { value: 'n', included: true, transformed: 'n²' },
        ],
        expression: 'sum(x**2 for x in range(1_000_000))',
        result: ['lazy', 'one-at-a-time', 'memory-efficient'],
        annotations: [
          'Uses parentheses () instead of brackets []',
          'Yields values one at a time (lazy evaluation)',
          'Does NOT create a list in memory',
          'Perfect for large sequences or pipeline processing',
        ],
      },
      {
        title: 'Nested Comprehension',
        description: 'Flatten or process multi-dimensional data',
        type: 'list',
        inputItems: [
          { value: '[1,2]', included: true, transformed: '1' },
          { value: '[1,2]', included: true, transformed: '2' },
          { value: '[3,4]', included: true, transformed: '3' },
          { value: '[3,4]', included: true, transformed: '4' },
        ],
        expression: '[x for row in matrix for x in row]',
        result: ['1', '2', '3', '4'],
        annotations: [
          'Outer loop: iterate over rows',
          'Inner loop: iterate over elements in each row',
          'Read left-to-right as nested for loops',
          'matrix = [[1, 2], [3, 4]] → [1, 2, 3, 4]',
        ],
      },
    ],
    []
  );

  const handlePlayPause = useCallback(() => setIsPlaying((p) => !p), []);
  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);
  const handleStepBack = useCallback(() => setCurrentStep((s) => Math.max(0, s - 1)), []);
  const handleStepForward = useCallback(
    () => setCurrentStep((s) => Math.min(steps.length - 1, s + 1)),
    [steps.length]
  );
  const handleSpeedChange = useCallback((s: number) => setSpeed(s), []);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) return;
    const interval = window.setInterval(() => {
      setCurrentStep((s) => {
        if (s >= steps.length - 1) {
          setIsPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 4000 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];
  const color = typeColors[step.type];
  const brackets = { list: ['[', ']'], dict: ['{', '}'], set: ['{', '}'], generator: ['(', ')'] };
  const [openBracket, closeBracket] = brackets[step.type];

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className="rounded-lg p-4 border"
        style={{ backgroundColor: `${color}08`, borderColor: `${color}30` }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="px-2 py-0.5 rounded text-xs font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {step.type}
          </span>
          <h4 className="font-bold text-gray-900 text-lg">{step.title}</h4>
        </div>
        <code className="text-sm text-gray-600 font-mono">{step.description}</code>
      </div>

      {/* Visual pipeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
        <svg viewBox="0 0 650 180" className="w-full" style={{ maxHeight: '180px' }}>
          {/* Input items */}
          <text x="10" y="15" fontSize="11" fill="#6b7280" fontWeight="bold">
            Input:
          </text>
          {step.inputItems.map((item, i) => {
            const x = 10 + i * 90;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={25}
                  width={75}
                  height={32}
                  rx="6"
                  fill={item.included ? '#f0fdf4' : '#fef2f2'}
                  stroke={item.included ? '#22c55e' : '#ef4444'}
                  strokeWidth="1.5"
                  className="transition-all duration-500"
                />
                <text
                  x={x + 37}
                  y={45}
                  fontSize="11"
                  fill={item.included ? '#166534' : '#991b1b'}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {item.value}
                </text>
                {item.included && item.transformed && (
                  <>
                    {/* Arrow down */}
                    <line
                      x1={x + 37}
                      y1={57}
                      x2={x + 37}
                      y2={73}
                      stroke={color}
                      strokeWidth="1.5"
                      markerEnd="url(#compArrow)"
                    />
                    <text
                      x={x + 37}
                      y={68}
                      fontSize="8"
                      fill={color}
                      textAnchor="middle"
                      fontStyle="italic"
                    >
                      →
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Transform label */}
          <text x="10" y="88" fontSize="11" fill="#6b7280" fontWeight="bold">
            Transform:
          </text>
          {step.inputItems.map((item, i) => {
            if (!item.included || !item.transformed) return null;
            const x = 10 + i * 90;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={95}
                  width={75}
                  height={32}
                  rx="6"
                  fill={`${color}15`}
                  stroke={color}
                  strokeWidth="1.5"
                  className="transition-all duration-500"
                />
                <text
                  x={x + 37}
                  y={115}
                  fontSize="11"
                  fill={color}
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {item.transformed}
                </text>
              </g>
            );
          })}

          {/* Result */}
          <text x="10" y="155" fontSize="11" fill="#6b7280" fontWeight="bold">
            Result:
          </text>
          <text x="70" y="155" fontSize="12" fill={color} fontFamily="monospace" fontWeight="bold">
            {openBracket}
            {step.result.join(', ')}
            {closeBracket}
          </text>

          <defs>
            <marker id="compArrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill={color} />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Expression */}
      <div className="bg-[#1e1e2e] rounded-lg px-4 py-3 font-mono text-base text-green-400 overflow-x-auto">
        <span className="text-gray-500">{'>>> '}</span>
        {step.expression}
      </div>

      {/* Annotations */}
      <div
        className="rounded-lg p-4 border"
        style={{ backgroundColor: `${color}08`, borderColor: `${color}30` }}
      >
        <h5 className="font-semibold mb-2" style={{ color }}>
          💡 How It Works
        </h5>
        <ul className="space-y-1">
          {step.annotations.map((note, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
              <span style={{ color }} className="mt-0.5">
                •
              </span>
              {note}
            </li>
          ))}
        </ul>
      </div>

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
      />
    </div>
  );
};

export default React.memo(Comprehensions2D);
