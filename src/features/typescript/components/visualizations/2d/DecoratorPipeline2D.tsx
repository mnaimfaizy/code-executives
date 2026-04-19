import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * DecoratorPipeline2D — Interactive decorator wrapping/pipeline visualization.
 * Shows how decorators wrap and compose around a target function/class.
 */

interface DecoratorLayer {
  name: string;
  color: string;
  description: string;
  code: string;
}

interface DecoratorExample {
  title: string;
  target: string;
  layers: DecoratorLayer[];
}

const EXAMPLES: DecoratorExample[] = [
  {
    title: 'Method Decorators',
    target: 'greet()',
    layers: [
      {
        name: '@log',
        color: '#6366f1',
        description: 'Logs method entry and exit',
        code: 'console.log(`Calling ${name}...`);',
      },
      {
        name: '@measure',
        color: '#8b5cf6',
        description: 'Measures execution time',
        code: 'const start = performance.now();',
      },
      {
        name: '@validate',
        color: '#a855f7',
        description: 'Validates input parameters',
        code: 'if (!args[0]) throw new Error("Invalid");',
      },
    ],
  },
  {
    title: 'Class Decorators',
    target: 'UserService',
    layers: [
      {
        name: '@injectable',
        color: '#0ea5e9',
        description: 'Registers class in DI container',
        code: 'Container.register(target);',
      },
      {
        name: '@sealed',
        color: '#06b6d4',
        description: 'Prevents extension of the class',
        code: 'Object.seal(target.prototype);',
      },
    ],
  },
  {
    title: 'Property Decorators',
    target: 'email: string',
    layers: [
      {
        name: '@required',
        color: '#f59e0b',
        description: 'Marks field as required',
        code: 'if (value == null) throw new Error("Required");',
      },
      {
        name: '@format("email")',
        color: '#f97316',
        description: 'Validates email format',
        code: 'if (!isEmail(value)) throw new Error();',
      },
      {
        name: '@maxLength(255)',
        color: '#ef4444',
        description: 'Enforces maximum string length',
        code: 'if (value.length > 255) throw new Error();',
      },
    ],
  },
];

const DecoratorPipeline2D: React.FC = () => {
  const [exampleIdx, setExampleIdx] = useState(0);
  const [animStep, setAnimStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const example = EXAMPLES[exampleIdx];
  const totalSteps = example.layers.length;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const play = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);
    setAnimStep(0);
    let s = 0;
    intervalRef.current = setInterval(() => {
      s++;
      if (s >= totalSteps) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
      } else {
        setAnimStep(s);
      }
    }, 1200);
  }, [isPlaying, totalSteps]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAnimStep(-1);
    setIsPlaying(false);
  }, []);

  const changeExample = useCallback((idx: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setExampleIdx(idx);
    setAnimStep(-1);
    setIsPlaying(false);
  }, []);

  const isLayerVisible = (idx: number): boolean => animStep === -1 || idx <= animStep;
  const isLayerActive = (idx: number): boolean => animStep === idx;

  // Layout: concentric rounded rects from outside in
  const centerX = 350;
  const centerY = 160;
  const baseW = 120;
  const baseH = 40;
  const layerPadding = 36;

  return (
    <div className="space-y-5">
      {/* Example picker */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex, i) => (
          <button
            key={ex.title}
            onClick={() => changeExample(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              exampleIdx === i
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {ex.title}
          </button>
        ))}
      </div>

      {/* SVG */}
      <div className="relative bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-2xl border border-purple-100 overflow-hidden">
        <svg viewBox="0 0 700 320" className="w-full" style={{ minHeight: '16rem' }}>
          {/* Decorator layers (outermost first) */}
          {[...example.layers].reverse().map((layer, reverseIdx) => {
            const idx = example.layers.length - 1 - reverseIdx;
            if (!isLayerVisible(idx)) return null;
            const active = isLayerActive(idx);
            const depth = example.layers.length - idx;
            const w = baseW + depth * layerPadding * 2;
            const h = baseH + depth * layerPadding * 2;
            const x = centerX - w / 2;
            const y = centerY - h / 2;

            return (
              <g key={layer.name}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={12}
                  fill={`${layer.color}18`}
                  stroke={layer.color}
                  strokeWidth={active ? 2.5 : 1.5}
                  strokeDasharray={active ? '8 4' : 'none'}
                >
                  {active && (
                    <animate
                      attributeName="stroke-dashoffset"
                      values="24;0"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  )}
                </rect>
                {/* Decorator name label — top-left */}
                <text
                  x={x + 10}
                  y={y + 16}
                  fill={layer.color}
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="ui-monospace, monospace"
                >
                  {layer.name}
                </text>
                {/* Description — top-right */}
                <text
                  x={x + w - 10}
                  y={y + 16}
                  textAnchor="end"
                  fill={layer.color}
                  fontSize="10"
                  opacity="0.7"
                >
                  {layer.description}
                </text>
                {/* Active pulse */}
                {active && (
                  <rect
                    x={x - 3}
                    y={y - 3}
                    width={w + 6}
                    height={h + 6}
                    rx={14}
                    fill="none"
                    stroke={layer.color}
                    strokeWidth="2"
                    opacity="0.4"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.4;0.1;0.4"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </rect>
                )}
              </g>
            );
          })}

          {/* Target (innermost) */}
          <rect
            x={centerX - baseW / 2}
            y={centerY - baseH / 2}
            width={baseW}
            height={baseH}
            rx={8}
            fill="#f0fdf4"
            stroke="#22c55e"
            strokeWidth={2}
          />
          <text
            x={centerX}
            y={centerY + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#166534"
            fontSize="13"
            fontWeight="700"
            fontFamily="ui-monospace, monospace"
          >
            {example.target}
          </text>

          {/* Execution order arrow on the right */}
          {animStep >= 0 && (
            <g>
              <text x={640} y={50} textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="600">
                Execution Order
              </text>
              {example.layers.map((layer, i) => {
                if (!isLayerVisible(i)) return null;
                const yPos = 70 + i * 28;
                const active = isLayerActive(i);
                return (
                  <g key={`order-${i}`}>
                    <circle
                      cx={620}
                      cy={yPos}
                      r={10}
                      fill={active ? layer.color : `${layer.color}40`}
                    />
                    <text
                      x={620}
                      y={yPos + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={active ? 'white' : layer.color}
                      fontSize="10"
                      fontWeight="700"
                    >
                      {i + 1}
                    </text>
                    <text
                      x={645}
                      y={yPos + 1}
                      dominantBaseline="middle"
                      fill={active ? layer.color : '#9ca3af'}
                      fontSize="10"
                      fontWeight={active ? '600' : '400'}
                    >
                      {layer.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Active layer code preview */}
      {animStep >= 0 && animStep < example.layers.length && (
        <div
          className="rounded-xl border p-4 font-mono text-sm"
          style={{
            borderColor: example.layers[animStep].color,
            backgroundColor: `${example.layers[animStep].color}08`,
          }}
        >
          <span
            className="font-bold"
            style={{ color: example.layers[animStep].color }}
          >
            {example.layers[animStep].name}
          </span>
          <span className="text-gray-500"> — {example.layers[animStep].description}</span>
          <pre className="mt-2 text-gray-700">{example.layers[animStep].code}</pre>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={play}
          disabled={isPlaying}
          className="px-5 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60 shadow-sm transition-colors"
        >
          {isPlaying ? '\u25B6 Wrapping...' : '\u25B6 Animate Pipeline'}
        </button>
        <button
          onClick={() => setAnimStep((s) => Math.min(s + 1, totalSteps - 1))}
          disabled={isPlaying}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
        >
          Next \u2192
        </button>
        <button
          onClick={reset}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
        <div className="ml-auto flex gap-1.5">
          {example.layers.map((layer, i) => (
            <div
              key={layer.name}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                backgroundColor:
                  animStep === -1
                    ? `${layer.color}60`
                    : i <= animStep
                      ? layer.color
                      : '#d1d5db',
                transform: i === animStep ? 'scale(1.3)' : 'scale(1)',
              }}
              title={layer.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(DecoratorPipeline2D);
