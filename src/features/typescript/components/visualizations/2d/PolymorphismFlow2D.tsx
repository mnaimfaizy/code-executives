import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * PolymorphismFlow2D — Interactive polymorphism & method overriding visualization.
 * Self-contained: built-in examples, step-by-step animation, full controls.
 */

// Keep legacy exports so TypeScriptVisualization.tsx doesn't break at import time
export interface PolymorphicMethod {
  name: string;
  baseClass: string;
  implementations: Array<{
    className: string;
    signature: string;
    body: string;
    isOverride: boolean;
  }>;
}
export interface PolymorphismFlow2DProps {
  methods?: PolymorphicMethod[];
  width?: number;
  height?: number;
  animationSpeed?: number;
}
export interface PolymorphismFlow2DHandle {
  animatePolymorphism(): void;
  showMethodImplementation(methodName: string, className: string): void;
  reset(): void;
}

/* ------------------------------------------------------------------ */
/*  Built-in example data                                              */
/* ------------------------------------------------------------------ */

interface Example {
  title: string;
  baseMethod: string;
  baseClass: string;
  implementations: {
    className: string;
    signature: string;
    body: string;
    color: string;
  }[];
}

const EXAMPLES: Example[] = [
  {
    title: 'Shape Area',
    baseMethod: 'calculateArea()',
    baseClass: 'Shape',
    implementations: [
      {
        className: 'Circle',
        signature: '(radius: number): number',
        body: 'return Math.PI * radius * radius;',
        color: '#f59e0b',
      },
      {
        className: 'Rectangle',
        signature: '(w: number, h: number): number',
        body: 'return w * h;',
        color: '#10b981',
      },
      {
        className: 'Triangle',
        signature: '(base: number, h: number): number',
        body: 'return (base * h) / 2;',
        color: '#3b82f6',
      },
    ],
  },
  {
    title: 'Animal Sound',
    baseMethod: 'makeSound()',
    baseClass: 'Animal',
    implementations: [
      {
        className: 'Dog',
        signature: '(): string',
        body: 'return "Woof!";',
        color: '#f59e0b',
      },
      {
        className: 'Cat',
        signature: '(): string',
        body: 'return "Meow!";',
        color: '#ec4899',
      },
      {
        className: 'Duck',
        signature: '(): string',
        body: 'return "Quack!";',
        color: '#06b6d4',
      },
    ],
  },
  {
    title: 'Payment Processing',
    baseMethod: 'processPayment()',
    baseClass: 'PaymentMethod',
    implementations: [
      {
        className: 'CreditCard',
        signature: '(amount: number): boolean',
        body: 'return this.chargeCard(amount);',
        color: '#6366f1',
      },
      {
        className: 'PayPal',
        signature: '(amount: number): boolean',
        body: 'return this.sendPayPal(amount);',
        color: '#0ea5e9',
      },
      {
        className: 'Crypto',
        signature: '(amount: number): boolean',
        body: 'return this.transferCrypto(amount);',
        color: '#f97316',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */
const SVG_W = 700;
const SVG_H = 420;
const BASE_Y = 50;
const BASE_W = 200;
const BASE_H = 70;
const IMPL_W = 200;
const IMPL_H = 90;
const IMPL_START_Y = 180;
const IMPL_GAP = 30;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const PolymorphismFlow2D: React.FC = () => {
  const [exampleIdx, setExampleIdx] = useState(0);
  const [animStep, setAnimStep] = useState(-1); // -1 = idle, 0..n = highlighting impl
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedImpl, setSelectedImpl] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const example = EXAMPLES[exampleIdx];
  const totalSteps = example.implementations.length;

  // Clean up on unmount or example change
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);
    setSelectedImpl(null);
    let s = -1;
    setAnimStep(-1);

    intervalRef.current = setInterval(() => {
      s++;
      if (s >= totalSteps) {
        // done — keep the last state visible
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
      } else {
        setAnimStep(s);
      }
    }, 1000);
  }, [isPlaying, totalSteps]);

  const reset = useCallback(() => {
    stopAnimation();
    setAnimStep(-1);
    setSelectedImpl(null);
  }, [stopAnimation]);

  const nextStep = useCallback(() => {
    if (isPlaying) return;
    setAnimStep((prev) => Math.min(prev + 1, totalSteps - 1));
    setSelectedImpl(null);
  }, [isPlaying, totalSteps]);

  const prevStep = useCallback(() => {
    if (isPlaying) return;
    setAnimStep((prev) => Math.max(prev - 1, -1));
    setSelectedImpl(null);
  }, [isPlaying]);

  const changeExample = useCallback(
    (idx: number) => {
      stopAnimation();
      setExampleIdx(idx);
      setAnimStep(-1);
      setSelectedImpl(null);
    },
    [stopAnimation]
  );

  // Implementation horizontal layout — centered, evenly spaced
  const implPositions = example.implementations.map((_, i) => {
    const totalWidth = totalSteps * IMPL_W + (totalSteps - 1) * IMPL_GAP;
    const startX = (SVG_W - totalWidth) / 2;
    return {
      x: startX + i * (IMPL_W + IMPL_GAP),
      y: IMPL_START_Y,
    };
  });

  const baseX = (SVG_W - BASE_W) / 2;

  return (
    <div className="space-y-4">
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

      {/* SVG diagram */}
      <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 rounded-2xl overflow-hidden shadow-lg">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          style={{ minHeight: '22rem' }}
        >
          {/* Arrow marker */}
          <defs>
            <marker id="poly-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="white" fillOpacity="0.7" />
            </marker>
            <marker id="poly-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#fbbf24" />
            </marker>
          </defs>

          {/* Title */}
          <text x="20" y="30" fill="white" fontSize="16" fontWeight="700" opacity="0.95">
            Polymorphism Flow
          </text>

          {/* Legend — top right */}
          <rect x={SVG_W - 170} y="10" width="160" height="50" rx="8" fill="white" fillOpacity="0.9" />
          <circle cx={SVG_W - 152} cy="28" r="5" fill="#10b981" />
          <text x={SVG_W - 142} y="32" fontSize="10" fill="#374151" fontWeight="500">New Implementation</text>
          <circle cx={SVG_W - 152} cy="46" r="5" fill="#f59e0b" />
          <text x={SVG_W - 142} y="50" fontSize="10" fill="#374151" fontWeight="500">Method Override</text>

          {/* Base class node */}
          <rect x={baseX} y={BASE_Y} width={BASE_W} height={BASE_H} rx="12" fill="white" stroke="white" strokeWidth="2" />
          <rect x={baseX} y={BASE_Y} width={BASE_W} height={32} rx="12" fill="#6366f1" />
          <rect x={baseX} y={BASE_Y + 20} width={BASE_W} height={12} fill="#6366f1" />
          <text x={baseX + BASE_W / 2} y={BASE_Y + 20} textAnchor="middle" fill="white" fontSize="13" fontWeight="700">
            {example.baseClass}
          </text>
          <text x={baseX + BASE_W / 2} y={BASE_Y + 52} textAnchor="middle" fill="#6b7280" fontSize="12" fontFamily="ui-monospace, monospace">
            {example.baseMethod}
          </text>

          {/* Arrows from base to each impl */}
          {implPositions.map((pos, i) => {
            const active = animStep >= i;
            const fromX = baseX + BASE_W / 2;
            const fromY = BASE_Y + BASE_H;
            const toX = pos.x + IMPL_W / 2;
            const toY = pos.y;
            return (
              <g key={`arrow-${i}`}>
                <line
                  x1={fromX}
                  y1={fromY + 4}
                  x2={toX}
                  y2={toY - 4}
                  stroke={active ? '#fbbf24' : 'rgba(255,255,255,0.35)'}
                  strokeWidth={active ? 2.5 : 1.5}
                  strokeDasharray={active ? 'none' : '6 4'}
                  markerEnd={active ? 'url(#poly-arrow-active)' : 'url(#poly-arrow)'}
                  style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
                />
                <text
                  x={(fromX + toX) / 2 + (i === 0 ? -20 : i === totalSteps - 1 ? 20 : 0)}
                  y={(fromY + toY) / 2}
                  textAnchor="middle"
                  fill={active ? '#fbbf24' : 'rgba(255,255,255,0.5)'}
                  fontSize="10"
                  fontWeight="600"
                  fontStyle="italic"
                >
                  overrides
                </text>
              </g>
            );
          })}

          {/* Implementation nodes */}
          {example.implementations.map((impl, i) => {
            const pos = implPositions[i];
            const active = animStep >= i;
            const isCurrent = animStep === i;
            const isSelected = selectedImpl === i;

            return (
              <g
                key={impl.className}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedImpl(isSelected ? null : i)}
              >
                {/* Glow ring for current step */}
                {isCurrent && (
                  <rect
                    x={pos.x - 4}
                    y={pos.y - 4}
                    width={IMPL_W + 8}
                    height={IMPL_H + 8}
                    rx={14}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                    opacity="0.7"
                  >
                    <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite" />
                  </rect>
                )}

                {/* Card */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={IMPL_W}
                  height={IMPL_H}
                  rx={10}
                  fill="white"
                  stroke={isSelected ? '#fbbf24' : active ? impl.color : 'rgba(255,255,255,0.3)'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  opacity={active ? 1 : 0.5}
                  style={{ transition: 'opacity 0.4s, stroke 0.3s' }}
                />

                {/* Header bar */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={IMPL_W}
                  height={28}
                  rx={10}
                  fill={impl.color}
                  opacity={active ? 1 : 0.5}
                  style={{ transition: 'opacity 0.4s' }}
                />
                <rect
                  x={pos.x}
                  y={pos.y + 18}
                  width={IMPL_W}
                  height={10}
                  fill={impl.color}
                  opacity={active ? 1 : 0.5}
                />

                <text
                  x={pos.x + IMPL_W / 2}
                  y={pos.y + 18}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="700"
                >
                  {impl.className}
                </text>

                {/* Signature */}
                <text
                  x={pos.x + 10}
                  y={pos.y + 48}
                  fill="#374151"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="ui-monospace, monospace"
                  opacity={active ? 1 : 0.5}
                >
                  {example.baseMethod.replace('()', impl.signature)}
                </text>

                {/* Body */}
                <text
                  x={pos.x + 10}
                  y={pos.y + 66}
                  fill="#6b7280"
                  fontSize="9.5"
                  fontFamily="ui-monospace, monospace"
                  opacity={active ? 0.8 : 0.4}
                >
                  {impl.body.length > 28 ? impl.body.substring(0, 28) + '...' : impl.body}
                </text>

                {/* Override badge */}
                <text
                  x={pos.x + IMPL_W - 10}
                  y={pos.y + IMPL_H - 8}
                  textAnchor="end"
                  fill={impl.color}
                  fontSize="9"
                  fontWeight="700"
                  opacity={active ? 0.8 : 0.3}
                >
                  OVERRIDE
                </text>
              </g>
            );
          })}

          {/* Selected implementation detail — bottom overlay */}
          {selectedImpl !== null && (
            <g>
              <rect
                x={30}
                y={SVG_H - 100}
                width={SVG_W - 60}
                height={80}
                rx={10}
                fill="white"
                fillOpacity="0.97"
                stroke={example.implementations[selectedImpl].color}
                strokeWidth="2"
              />
              <text x={50} y={SVG_H - 74} fill={example.implementations[selectedImpl].color} fontSize="13" fontWeight="700">
                {example.implementations[selectedImpl].className}.{example.baseMethod}
              </text>
              <text x={50} y={SVG_H - 54} fill="#374151" fontSize="11" fontFamily="ui-monospace, monospace">
                {example.implementations[selectedImpl].signature}
              </text>
              <text x={50} y={SVG_H - 36} fill="#6b7280" fontSize="11" fontFamily="ui-monospace, monospace">
                {example.implementations[selectedImpl].body}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={play}
          disabled={isPlaying}
          className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-colors"
        >
          {isPlaying ? '\u25B6 Animating...' : '\u25B6 Animate Polymorphism'}
        </button>
        <button
          onClick={prevStep}
          disabled={isPlaying || animStep <= -1}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
        >
          ← Prev
        </button>
        <button
          onClick={nextStep}
          disabled={isPlaying || animStep >= totalSteps - 1}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
        >
          Next →
        </button>
        <button
          onClick={reset}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
        <div className="ml-auto flex gap-1.5">
          {example.implementations.map((impl, i) => (
            <div
              key={impl.className}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                backgroundColor:
                  animStep >= i ? impl.color : '#d1d5db',
                transform: animStep === i ? 'scale(1.3)' : 'scale(1)',
              }}
              title={impl.className}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PolymorphismFlow2D);
