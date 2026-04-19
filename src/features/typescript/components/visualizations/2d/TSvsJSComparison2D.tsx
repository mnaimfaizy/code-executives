import React, { useState } from 'react';

/**
 * TSvsJSComparison2D — Side-by-side TypeScript vs JavaScript comparison.
 * Interactive diagram highlighting the differences: type system, tooling, safety, etc.
 */

interface ComparisonCategory {
  title: string;
  icon: string;
  js: { label: string; detail: string; color: string };
  ts: { label: string; detail: string; color: string };
}

const CATEGORIES: ComparisonCategory[] = [
  {
    title: 'Type System',
    icon: '\u{1F50D}',
    js: {
      label: 'Dynamic',
      detail: 'Types checked at runtime — errors discovered when code runs',
      color: '#f59e0b',
    },
    ts: {
      label: 'Static',
      detail: 'Types checked at compile time — errors caught before running',
      color: '#6366f1',
    },
  },
  {
    title: 'Error Detection',
    icon: '\u{1F6E1}',
    js: {
      label: 'Runtime Errors',
      detail: '"undefined is not a function" — found by users in production',
      color: '#ef4444',
    },
    ts: {
      label: 'Compile-Time Errors',
      detail: 'Red squiggly lines in editor — found before deployment',
      color: '#22c55e',
    },
  },
  {
    title: 'Tooling & IDE',
    icon: '\u{1F4BB}',
    js: {
      label: 'Basic Autocomplete',
      detail: 'Limited inference, minimal refactoring support',
      color: '#f97316',
    },
    ts: {
      label: 'Rich IntelliSense',
      detail: 'Full autocomplete, go-to-definition, safe refactoring',
      color: '#3b82f6',
    },
  },
  {
    title: 'Code Documentation',
    icon: '\u{1F4C4}',
    js: {
      label: 'JSDoc Comments',
      detail: 'Types live in comments — easily out of sync with code',
      color: '#f59e0b',
    },
    ts: {
      label: 'Types ARE Docs',
      detail: 'Type annotations serve as living documentation',
      color: '#8b5cf6',
    },
  },
  {
    title: 'Refactoring Safety',
    icon: '\u{1F527}',
    js: {
      label: 'Manual & Risky',
      detail: 'Rename breaks callers — no compiler to catch mismatches',
      color: '#ef4444',
    },
    ts: {
      label: 'Safe & Automated',
      detail: 'Rename symbol → all references updated, errors flagged',
      color: '#22c55e',
    },
  },
  {
    title: 'Scalability',
    icon: '\u{1F4C8}',
    js: {
      label: 'Small Scripts',
      detail: 'Works well for small projects, risky in large codebases',
      color: '#f97316',
    },
    ts: {
      label: 'Enterprise-Ready',
      detail: 'Designed for large codebases with multiple contributors',
      color: '#6366f1',
    },
  },
];

interface FeatureTag {
  label: string;
  exclusive: 'ts' | 'both';
  color: string;
}

const FEATURES: FeatureTag[] = [
  { label: 'Interfaces', exclusive: 'ts', color: '#6366f1' },
  { label: 'Generics', exclusive: 'ts', color: '#8b5cf6' },
  { label: 'Enums', exclusive: 'ts', color: '#a855f7' },
  { label: 'Type Guards', exclusive: 'ts', color: '#3b82f6' },
  { label: 'Decorators', exclusive: 'both', color: '#06b6d4' },
  { label: 'Union Types', exclusive: 'ts', color: '#6366f1' },
  { label: 'Intersection Types', exclusive: 'ts', color: '#8b5cf6' },
  { label: 'Namespaces', exclusive: 'ts', color: '#a855f7' },
  { label: 'Async/Await', exclusive: 'both', color: '#06b6d4' },
  { label: 'Modules', exclusive: 'both', color: '#06b6d4' },
];

const TSvsJSComparison2D: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [view, setView] = useState<'comparison' | 'features'>('comparison');

  const cat = CATEGORIES[activeCategory];

  return (
    <div className="space-y-5">
      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('comparison')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'comparison'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Side-by-Side Comparison
        </button>
        <button
          onClick={() => setView('features')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'features'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Feature Coverage
        </button>
      </div>

      {view === 'comparison' && (
        <>
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c, i) => (
              <button
                key={c.title}
                onClick={() => setActiveCategory(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === i
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c.icon} {c.title}
              </button>
            ))}
          </div>

          {/* Side-by-side SVG */}
          <div className="relative bg-gradient-to-br from-amber-50/40 via-white to-indigo-50/40 rounded-2xl border border-gray-200 overflow-hidden">
            <svg viewBox="0 0 700 260" className="w-full" style={{ minHeight: '14rem' }}>
              {/* Header labels */}
              <text
                x={175}
                y={30}
                textAnchor="middle"
                fontSize="16"
                fontWeight="800"
                fill="#f59e0b"
              >
                JavaScript
              </text>
              <text
                x={525}
                y={30}
                textAnchor="middle"
                fontSize="16"
                fontWeight="800"
                fill="#6366f1"
              >
                TypeScript
              </text>

              {/* Divider */}
              <line
                x1={350}
                y1={10}
                x2={350}
                y2={250}
                stroke="#e5e7eb"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
              <text
                x={350}
                y={30}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#9ca3af"
              >
                VS
              </text>

              {/* Category title */}
              <text
                x={350}
                y={60}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill="#374151"
              >
                {cat.icon} {cat.title}
              </text>

              {/* JS side */}
              <rect
                x={30}
                y={80}
                width={290}
                height={120}
                rx={14}
                fill={`${cat.js.color}10`}
                stroke={cat.js.color}
                strokeWidth={1.5}
              />
              <text
                x={175}
                y={110}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill={cat.js.color}
              >
                {cat.js.label}
              </text>
              {/* Word-wrap detail text */}
              {cat.js.detail.split(' — ').map((line, i) => (
                <text
                  key={i}
                  x={175}
                  y={135 + i * 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#6b7280"
                >
                  {line}
                </text>
              ))}

              {/* TS side */}
              <rect
                x={380}
                y={80}
                width={290}
                height={120}
                rx={14}
                fill={`${cat.ts.color}10`}
                stroke={cat.ts.color}
                strokeWidth={1.5}
              />
              <text
                x={525}
                y={110}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill={cat.ts.color}
              >
                {cat.ts.label}
              </text>
              {cat.ts.detail.split(' — ').map((line, i) => (
                <text
                  key={i}
                  x={525}
                  y={135 + i * 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#6b7280"
                >
                  {line}
                </text>
              ))}

              {/* Arrow from JS to TS at bottom */}
              <defs>
                <marker
                  id="ts-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 Z" fill="#6366f1" />
                </marker>
              </defs>
              <line
                x1={190}
                y1={230}
                x2={495}
                y2={230}
                stroke="#6366f1"
                strokeWidth={2}
                markerEnd="url(#ts-arrow)"
              />
              <text
                x={350}
                y={248}
                textAnchor="middle"
                fontSize="10"
                fill="#6366f1"
                fontWeight="600"
              >
                TypeScript = JavaScript + Type Safety
              </text>
            </svg>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2">
            {CATEGORIES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === activeCategory ? 'bg-indigo-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Category ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {view === 'features' && (
        <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl border border-indigo-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
              JS
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
              TS
            </span>
            <span className="text-sm text-gray-600">
              TypeScript adds these features on top of JavaScript
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {FEATURES.map((f) => (
              <span
                key={f.label}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: `${f.color}15`,
                  color: f.color,
                  border: `1px solid ${f.color}40`,
                }}
              >
                {f.exclusive === 'ts' ? '\u2728 ' : '\u2705 '}
                {f.label}
                {f.exclusive === 'both' && (
                  <span className="ml-1 text-xs opacity-60">(shared)</span>
                )}
              </span>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-gray-500">
            <span>✨ = TypeScript-only</span>
            <span>✅ = Available in both</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(TSvsJSComparison2D);
