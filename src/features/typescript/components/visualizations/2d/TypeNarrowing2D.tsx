import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Interactive TypeNarrowing2D visualization.
 * Shows how TypeScript narrows types through control flow analysis.
 * Users can click through narrowing steps and see types visually narrow.
 */

interface NarrowingStep {
  label: string;
  guard: string;
  inputType: string[];
  outputType: string[];
  explanation: string;
}

const SCENARIOS: Record<string, { title: string; variable: string; steps: NarrowingStep[] }> = {
  typeof: {
    title: 'typeof Guard',
    variable: 'value',
    steps: [
      {
        label: 'Initial',
        guard: 'let value: string | number | boolean',
        inputType: ['string', 'number', 'boolean'],
        outputType: ['string', 'number', 'boolean'],
        explanation: 'The variable starts as a union of three types.',
      },
      {
        label: 'typeof === "string"',
        guard: 'if (typeof value === "string")',
        inputType: ['string', 'number', 'boolean'],
        outputType: ['string'],
        explanation: 'TypeScript narrows to string inside this branch.',
      },
      {
        label: 'typeof === "number"',
        guard: 'else if (typeof value === "number")',
        inputType: ['number', 'boolean'],
        outputType: ['number'],
        explanation: 'string is excluded; TypeScript narrows to number.',
      },
      {
        label: 'else branch',
        guard: 'else { /* only boolean left */ }',
        inputType: ['boolean'],
        outputType: ['boolean'],
        explanation: 'string and number are excluded; only boolean remains.',
      },
    ],
  },
  instanceof: {
    title: 'instanceof Guard',
    variable: 'shape',
    steps: [
      {
        label: 'Initial',
        guard: 'let shape: Circle | Rectangle | Triangle',
        inputType: ['Circle', 'Rectangle', 'Triangle'],
        outputType: ['Circle', 'Rectangle', 'Triangle'],
        explanation: 'shape can be any of the three Shape subclasses.',
      },
      {
        label: 'instanceof Circle',
        guard: 'if (shape instanceof Circle)',
        inputType: ['Circle', 'Rectangle', 'Triangle'],
        outputType: ['Circle'],
        explanation: 'Narrowed to Circle — access .radius safely.',
      },
      {
        label: 'instanceof Rectangle',
        guard: 'else if (shape instanceof Rectangle)',
        inputType: ['Rectangle', 'Triangle'],
        outputType: ['Rectangle'],
        explanation: 'Narrowed to Rectangle — access .width, .height.',
      },
      {
        label: 'else',
        guard: 'else { /* Triangle */ }',
        inputType: ['Triangle'],
        outputType: ['Triangle'],
        explanation: 'Only Triangle remains — exhaustive narrowing.',
      },
    ],
  },
  discriminated: {
    title: 'Discriminated Union',
    variable: 'event',
    steps: [
      {
        label: 'Initial',
        guard: 'type AppEvent = ClickEvent | KeyEvent | ScrollEvent',
        inputType: ['ClickEvent', 'KeyEvent', 'ScrollEvent'],
        outputType: ['ClickEvent', 'KeyEvent', 'ScrollEvent'],
        explanation: 'A discriminated union with a shared "kind" field.',
      },
      {
        label: 'kind === "click"',
        guard: 'case "click":',
        inputType: ['ClickEvent', 'KeyEvent', 'ScrollEvent'],
        outputType: ['ClickEvent'],
        explanation: 'Switch narrows to ClickEvent — access .x, .y.',
      },
      {
        label: 'kind === "key"',
        guard: 'case "key":',
        inputType: ['ClickEvent', 'KeyEvent', 'ScrollEvent'],
        outputType: ['KeyEvent'],
        explanation: 'Narrowed to KeyEvent — access .keyCode, .key.',
      },
      {
        label: 'kind === "scroll"',
        guard: 'case "scroll":',
        inputType: ['ClickEvent', 'KeyEvent', 'ScrollEvent'],
        outputType: ['ScrollEvent'],
        explanation: 'Narrowed to ScrollEvent — access .deltaX, .deltaY.',
      },
    ],
  },
};

const TYPE_COLORS: Record<string, string> = {
  string: '#818cf8', // indigo-400
  number: '#34d399', // emerald-400
  boolean: '#fb923c', // orange-400
  Circle: '#f472b6', // pink-400
  Rectangle: '#60a5fa', // blue-400
  Triangle: '#a78bfa', // violet-400
  ClickEvent: '#f87171', // red-400
  KeyEvent: '#38bdf8', // sky-400
  ScrollEvent: '#facc15', // yellow-400
};

const TypeNarrowing2D: React.FC = () => {
  const [scenario, setScenario] = useState<keyof typeof SCENARIOS>('typeof');
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const data = SCENARIOS[scenario];
  const current = data.steps[step];

  // Clean up interval on unmount or when playing stops
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const play = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);
    setStep(0);
    let s = 0;
    intervalRef.current = setInterval(() => {
      s++;
      if (s >= data.steps.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
      } else {
        setStep(s);
      }
    }, 1800);
  }, [isPlaying, data.steps.length]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStep(0);
    setIsPlaying(false);
  }, []);

  const changeScenario = useCallback((key: keyof typeof SCENARIOS) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setScenario(key);
    setStep(0);
    setIsPlaying(false);
  }, []);

  // Determine which types are "alive" at this step
  const allTypes = data.steps[0].inputType;
  const aliveSet = new Set(current.outputType);

  return (
    <div className="space-y-5">
      {/* Scenario picker */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(SCENARIOS).map(([key, { title }]) => (
          <button
            key={key}
            onClick={() => changeScenario(key as keyof typeof SCENARIOS)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              scenario === key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {title}
          </button>
        ))}
      </div>

      {/* Visualization area */}
      <div className="relative bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl border border-indigo-100 p-6 min-h-[24rem] overflow-hidden">
        {/* Variable name banner */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm font-mono shadow-md">
          {data.variable}: {current.outputType.join(' | ')}
        </div>

        {/* Type bubbles funnel */}
        <svg viewBox="0 0 600 300" className="w-full h-64 mt-10">
          <defs>
            {/* Glow filter */}
            <filter id="tn-glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Arrow marker */}
            <marker
              id="tn-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
            </marker>
          </defs>

          {/* Funnel shape */}
          <path
            d="M 50 40 L 550 40 L 400 260 L 200 260 Z"
            fill="none"
            stroke="#c7d2fe"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.5"
          />
          <text x="300" y="280" textAnchor="middle" fill="#818cf8" fontSize="12" fontWeight="600">
            Narrowed Type
          </text>

          {/* Type bubbles */}
          {allTypes.map((typeName) => {
            const isAlive = aliveSet.has(typeName);
            const aliveTypes = current.outputType;
            const aliveIndex = aliveTypes.indexOf(typeName);

            // Position: spread across top if still in input, compact at bottom if narrowed
            let cx: number, cy: number, r: number;
            if (isAlive) {
              // Narrowed types gather at center-bottom
              const aliveCount = aliveTypes.length;
              const spacing = Math.min(140, 400 / aliveCount);
              cx = 300 + (aliveIndex - (aliveCount - 1) / 2) * spacing;
              cy = 180;
              r = 38;
            } else {
              // Eliminated types fade to top corners
              const elimIndex = allTypes.filter((t) => !aliveSet.has(t)).indexOf(typeName);
              const elimCount = allTypes.filter((t) => !aliveSet.has(t)).length;
              const spacing = 100;
              cx = 300 + (elimIndex - (elimCount - 1) / 2) * spacing;
              cy = 55;
              r = 28;
            }

            const color = TYPE_COLORS[typeName] || '#94a3b8';

            return (
              <g
                key={typeName}
                style={{ transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                {/* Glow ring for alive types */}
                {isAlive && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 6}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity="0.3"
                    filter="url(#tn-glow)"
                  >
                    <animate
                      attributeName="r"
                      values={`${r + 4};${r + 10};${r + 4}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.3;0.15;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={isAlive ? color : '#e5e7eb'}
                  opacity={isAlive ? 1 : 0.35}
                  style={{ transition: 'all 0.8s ease, fill 0.5s' }}
                />
                {/* Strikethrough for eliminated */}
                {!isAlive && (
                  <line
                    x1={cx - r + 5}
                    y1={cy}
                    x2={cx + r - 5}
                    y2={cy}
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    opacity="0.7"
                    strokeLinecap="round"
                  />
                )}
                <text
                  x={cx}
                  y={cy + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isAlive ? 'white' : '#9ca3af'}
                  fontSize={isAlive ? '13' : '11'}
                  fontWeight="600"
                  fontFamily="ui-monospace, monospace"
                  style={{ transition: 'all 0.5s' }}
                >
                  {typeName}
                </text>
              </g>
            );
          })}

          {/* Guard label */}
          <rect x="140" y="120" width="320" height="28" rx="14" fill="#6366f1" opacity="0.9" />
          <text
            x="300"
            y="138"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="600"
            fontFamily="ui-monospace, monospace"
          >
            {current.guard}
          </text>
        </svg>
      </div>

      {/* Explanation card */}
      <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-indigo-600 text-sm font-bold">{step + 1}</span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">{current.label}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{current.explanation}</p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Result type:</span>
              <code className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono">
                {current.outputType.join(' | ')}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0 || isPlaying}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={play}
            disabled={isPlaying}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 shadow-sm transition-colors"
          >
            {isPlaying ? '▶ Playing...' : '▶ Play All'}
          </button>
          <button
            onClick={() => setStep(Math.min(data.steps.length - 1, step + 1))}
            disabled={step >= data.steps.length - 1 || isPlaying}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
          <button
            onClick={reset}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5">
          {data.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStep(i);
                setIsPlaying(false);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === step ? 'bg-indigo-600 scale-125' : i < step ? 'bg-indigo-300' : 'bg-gray-300'
              }`}
              title={`Step ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TypeNarrowing2D);
