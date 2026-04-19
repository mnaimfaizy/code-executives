import React, { useState, useCallback } from 'react';

/**
 * Interactive Generics visualization.
 * Users pick a type parameter and see how it flows through a generic function/class,
 * showing the concrete type at each usage point.
 */

interface GenericSlot {
  label: string;
  position: { x: number; y: number };
  description: string;
}

interface GenericExample {
  name: string;
  signature: string;
  typeParam: string;
  slots: GenericSlot[];
  code: string;
}

const CONCRETE_TYPES = [
  {
    label: 'string',
    color: '#818cf8',
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-300',
  },
  {
    label: 'number',
    color: '#34d399',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
  },
  {
    label: 'User',
    color: '#f472b6',
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    border: 'border-pink-300',
  },
  {
    label: 'boolean',
    color: '#fb923c',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
  },
];

const EXAMPLES: GenericExample[] = [
  {
    name: 'Identity Function',
    signature: 'function identity<T>(arg: T): T',
    typeParam: 'T',
    slots: [
      { label: 'Parameter type', position: { x: 140, y: 100 }, description: 'arg: T — input type' },
      {
        label: 'Function body',
        position: { x: 300, y: 170 },
        description: 'return arg — same type preserved',
      },
      {
        label: 'Return type',
        position: { x: 460, y: 100 },
        description: ': T — output matches input',
      },
    ],
    code: 'function identity<T>(arg: T): T {\n  return arg;\n}',
  },
  {
    name: 'Array Wrapper',
    signature: 'class Box<T> { value: T; map<U>(fn: (v: T) => U): Box<U> }',
    typeParam: 'T',
    slots: [
      {
        label: 'Stored value',
        position: { x: 120, y: 100 },
        description: 'value: T — held inside the box',
      },
      { label: 'Map input', position: { x: 300, y: 170 }, description: 'fn receives T' },
      {
        label: 'Map output',
        position: { x: 480, y: 100 },
        description: 'Returns Box<U> — transformed',
      },
    ],
    code: 'class Box<T> {\n  constructor(public value: T) {}\n\n  map<U>(fn: (v: T) => U): Box<U> {\n    return new Box(fn(this.value));\n  }\n}',
  },
  {
    name: 'Promise Chain',
    signature: 'Promise<T>.then<U>(fn: (v: T) => U): Promise<U>',
    typeParam: 'T',
    slots: [
      {
        label: 'Resolved value',
        position: { x: 120, y: 100 },
        description: 'Resolves with value of type T',
      },
      {
        label: '.then() callback',
        position: { x: 300, y: 170 },
        description: 'fn: (v: T) => U — transform T to U',
      },
      { label: 'Chained result', position: { x: 480, y: 100 }, description: 'Returns Promise<U>' },
    ],
    code: 'const result = fetchUser() // Promise<User>\n  .then(user => user.name)  // Promise<string>\n  .then(name => name.length); // Promise<number>',
  },
];

const GenericsVisualizer2D: React.FC = () => {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [selectedType, setSelectedType] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [activeSlot, setActiveSlot] = useState(-1);

  const example = EXAMPLES[exampleIndex];
  const concreteType = CONCRETE_TYPES[selectedType];

  const animateFlow = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setActiveSlot(-1);
    let s = 0;
    const iv = setInterval(() => {
      setActiveSlot(s);
      s++;
      if (s >= example.slots.length) {
        clearInterval(iv);
        setTimeout(() => {
          setAnimating(false);
        }, 1000);
      }
    }, 800);
  }, [animating, example.slots.length]);

  return (
    <div className="space-y-5">
      {/* Example tabs */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => {
              setExampleIndex(i);
              setActiveSlot(-1);
              setAnimating(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              exampleIndex === i
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* Type parameter selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">
          Choose type for{' '}
          <code className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700 font-mono text-xs">
            {example.typeParam}
          </code>
          :
        </span>
        <div className="flex gap-2">
          {CONCRETE_TYPES.map((ct, i) => (
            <button
              key={ct.label}
              onClick={() => {
                setSelectedType(i);
                setActiveSlot(-1);
                setAnimating(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono font-semibold border-2 transition-all ${
                selectedType === i
                  ? `${ct.bg} ${ct.text} ${ct.border} shadow-sm scale-105`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl border border-indigo-100 p-4 overflow-hidden">
        <svg viewBox="0 0 600 250" className="w-full h-56">
          <defs>
            <marker
              id="gen-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={concreteType.color} />
            </marker>
            <filter id="gen-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Flow arrows between slots */}
          {example.slots.map((slot, i) => {
            if (i === example.slots.length - 1) return null;
            const next = example.slots[i + 1];
            const isActive = activeSlot >= i;
            return (
              <line
                key={i}
                x1={slot.position.x + 40}
                y1={slot.position.y}
                x2={next.position.x - 40}
                y2={next.position.y}
                stroke={isActive ? concreteType.color : '#d1d5db'}
                strokeWidth={isActive ? '3' : '2'}
                strokeDasharray={isActive ? 'none' : '6 4'}
                markerEnd={isActive ? 'url(#gen-arrow)' : 'none'}
                style={{ transition: 'all 0.5s' }}
              />
            );
          })}

          {/* Slot nodes */}
          {example.slots.map((slot, i) => {
            const isActive = activeSlot >= i;
            const isCurrent = activeSlot === i;
            return (
              <g key={i}>
                {/* Glow for current */}
                {isCurrent && (
                  <circle
                    cx={slot.position.x}
                    cy={slot.position.y}
                    r="50"
                    fill={concreteType.color}
                    opacity="0.08"
                    filter="url(#gen-glow)"
                  >
                    <animate
                      attributeName="r"
                      values="45;55;45"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Node circle */}
                <circle
                  cx={slot.position.x}
                  cy={slot.position.y}
                  r="38"
                  fill={isActive ? concreteType.color : '#f1f5f9'}
                  stroke={isActive ? concreteType.color : '#d1d5db'}
                  strokeWidth={isCurrent ? '3' : '2'}
                  opacity={isActive ? 1 : 0.5}
                  style={{ transition: 'all 0.5s' }}
                />

                {/* Type label inside */}
                <text
                  x={slot.position.x}
                  y={slot.position.y - 6}
                  textAnchor="middle"
                  fill={isActive ? 'white' : '#9ca3af'}
                  fontSize="14"
                  fontWeight="700"
                  fontFamily="ui-monospace, monospace"
                  style={{ transition: 'fill 0.3s' }}
                >
                  {isActive ? concreteType.label : example.typeParam}
                </text>
                <text
                  x={slot.position.x}
                  y={slot.position.y + 12}
                  textAnchor="middle"
                  fill={isActive ? 'rgba(255,255,255,0.8)' : '#9ca3af'}
                  fontSize="9"
                  style={{ transition: 'fill 0.3s' }}
                >
                  {slot.label}
                </text>
              </g>
            );
          })}

          {/* Signature at top */}
          <rect x="75" y="15" width="450" height="30" rx="15" fill="#1e1b4b" opacity="0.9" />
          <text
            x="300"
            y="35"
            textAnchor="middle"
            fill="#c7d2fe"
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            fontWeight="600"
          >
            {example.signature.replace(
              new RegExp(`\\b${example.typeParam}\\b`, 'g'),
              concreteType.label
            )}
          </text>
        </svg>
      </div>

      {/* Active slot description */}
      {activeSlot >= 0 && activeSlot < example.slots.length && (
        <div
          className={`rounded-xl border-2 p-4 transition-all ${concreteType.border} ${concreteType.bg}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold ${concreteType.text} uppercase tracking-wider`}>
              Step {activeSlot + 1}: {example.slots[activeSlot].label}
            </span>
          </div>
          <p className="text-sm text-gray-700">
            {example.slots[activeSlot].description.replace(
              new RegExp(`\\b${example.typeParam}\\b`, 'g'),
              concreteType.label
            )}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={animateFlow}
          disabled={animating}
          className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 shadow-sm transition-colors"
        >
          {animating ? '▶ Flowing...' : '▶ Animate Type Flow'}
        </button>
        <button
          onClick={() => {
            setActiveSlot(-1);
            setAnimating(false);
          }}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Code preview */}
      <div className="rounded-xl overflow-hidden border border-gray-700/50">
        <div className="flex items-center px-4 py-2 bg-gray-800/90 border-b border-gray-700/50">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 mr-1.5" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 mr-1.5" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 mr-3" />
          <span className="text-xs text-gray-400 font-mono">
            {example.typeParam} = {concreteType.label}
          </span>
        </div>
        <pre className="bg-[#1e1e2e] text-gray-200 p-4 text-sm font-mono leading-6 overflow-x-auto">
          {example.code.replace(new RegExp(`\\b${example.typeParam}\\b`, 'g'), concreteType.label)}
        </pre>
      </div>
    </div>
  );
};

export default React.memo(GenericsVisualizer2D);
