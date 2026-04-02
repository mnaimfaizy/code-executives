import React, { useState } from 'react';

interface ModuleSystemVizProps {
  className?: string;
}

const ModuleSystemViz: React.FC<ModuleSystemVizProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'cjs' | 'esm'>('cjs');
  const [loadStep, setLoadStep] = useState(0);

  const maxStepsCJS = 4;
  const maxStepsESM = 5;
  const maxSteps = activeTab === 'cjs' ? maxStepsCJS : maxStepsESM;

  return (
    <div className={`relative w-full ${className}`}>
      <div
        style={{
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1a2e 50%, #0f172a 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Tab switcher */}
        <div className="flex items-center justify-center gap-2 pt-4 px-4">
          <button
            onClick={() => {
              setActiveTab('cjs');
              setLoadStep(0);
            }}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              background: activeTab === 'cjs' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'cjs' ? '#f59e0b' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${activeTab === 'cjs' ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            CommonJS (require)
          </button>
          <button
            onClick={() => {
              setActiveTab('esm');
              setLoadStep(0);
            }}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              background: activeTab === 'esm' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'esm' ? '#6366f1' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${activeTab === 'esm' ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            ES Modules (import)
          </button>
        </div>

        <svg viewBox="0 0 640 420" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
          <defs>
            <filter id="mod-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {activeTab === 'cjs' ? (
            <>
              <text x={320} y={28} textAnchor="middle" fill="white" fontSize="15" fontWeight="700">
                CommonJS — Synchronous &amp; Dynamic Loading
              </text>
              <text x={320} y={46} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">
                require() loads modules at runtime, one by one, blocking execution
              </text>

              {/* Source file */}
              <g opacity={loadStep >= 0 ? 1 : 0.3} style={{ transition: 'opacity 0.4s' }}>
                <rect
                  x={30}
                  y={70}
                  width={180}
                  height={110}
                  rx={10}
                  fill="rgba(245,158,11,0.08)"
                  stroke="rgba(245,158,11,0.3)"
                  strokeWidth="1.5"
                />
                <text
                  x={120}
                  y={92}
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="10"
                  fontWeight="700"
                >
                  📄 app.js
                </text>
                <text
                  x={50}
                  y={115}
                  fill="rgba(255,255,255,0.6)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  const fs = require(&apos;fs&apos;);
                </text>
                <text
                  x={50}
                  y={132}
                  fill="rgba(255,255,255,0.6)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  const http = require(&apos;http&apos;);
                </text>
                <text
                  x={50}
                  y={149}
                  fill="rgba(255,255,255,0.6)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  const utils = require(&apos;./utils&apos;);
                </text>
              </g>

              {/* Step 1: require('fs') */}
              <g opacity={loadStep >= 1 ? 1 : 0.2} style={{ transition: 'opacity 0.4s' }}>
                <line
                  x1={210}
                  y1={115}
                  x2={270}
                  y2={115}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
                <text x={240} y={108} textAnchor="middle" fill="#f59e0b" fontSize="7">
                  ①
                </text>
                <rect
                  x={270}
                  y={80}
                  width={140}
                  height={50}
                  rx={8}
                  fill="rgba(245,158,11,0.12)"
                  stroke="rgba(245,158,11,0.4)"
                  strokeWidth="1.5"
                />
                <text
                  x={340}
                  y={100}
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="9"
                  fontWeight="600"
                >
                  📦 fs (built-in)
                </text>
                <text x={340} y={115} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
                  Loaded & cached ✓
                </text>
              </g>

              {/* Step 2: require('http') — BLOCKS until fs is done */}
              <g opacity={loadStep >= 2 ? 1 : 0.2} style={{ transition: 'opacity 0.4s' }}>
                <line
                  x1={210}
                  y1={132}
                  x2={270}
                  y2={165}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
                <text x={240} y={143} textAnchor="middle" fill="#f59e0b" fontSize="7">
                  ②
                </text>
                <rect
                  x={270}
                  y={145}
                  width={140}
                  height={50}
                  rx={8}
                  fill="rgba(245,158,11,0.12)"
                  stroke="rgba(245,158,11,0.4)"
                  strokeWidth="1.5"
                />
                <text
                  x={340}
                  y={165}
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="9"
                  fontWeight="600"
                >
                  📦 http (built-in)
                </text>
                <text x={340} y={180} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
                  Waits for fs first ⏳
                </text>
              </g>

              {/* Step 3: require('./utils') — BLOCKS until http is done */}
              <g opacity={loadStep >= 3 ? 1 : 0.2} style={{ transition: 'opacity 0.4s' }}>
                <line
                  x1={210}
                  y1={149}
                  x2={270}
                  y2={230}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
                <text x={240} y={190} textAnchor="middle" fill="#f59e0b" fontSize="7">
                  ③
                </text>
                <rect
                  x={270}
                  y={210}
                  width={140}
                  height={50}
                  rx={8}
                  fill="rgba(245,158,11,0.12)"
                  stroke="rgba(245,158,11,0.4)"
                  strokeWidth="1.5"
                />
                <text
                  x={340}
                  y={230}
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="9"
                  fontWeight="600"
                >
                  📄 ./utils.js
                </text>
                <text x={340} y={245} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
                  Waits for http first ⏳
                </text>
              </g>

              {/* Properties panel */}
              <g opacity={loadStep >= 4 ? 1 : 0.2} style={{ transition: 'opacity 0.4s' }}>
                <rect
                  x={440}
                  y={70}
                  width={180}
                  height={195}
                  rx={10}
                  fill="rgba(239,68,68,0.06)"
                  stroke="rgba(239,68,68,0.2)"
                  strokeWidth="1"
                />
                <text
                  x={530}
                  y={92}
                  textAnchor="middle"
                  fill="#fca5a5"
                  fontSize="10"
                  fontWeight="700"
                >
                  ⚠️ CJS Characteristics
                </text>
                {[
                  '• Synchronous loading',
                  '• Dynamic — can require() in if()',
                  '• Wraps in function wrapper',
                  '• module.exports = {...}',
                  '• Exports are COPIES',
                  '• Cannot tree-shake',
                  '• No top-level await',
                ].map((line, i) => (
                  <text key={i} x={455} y={115 + i * 20} fill="rgba(255,255,255,0.5)" fontSize="8">
                    {line}
                  </text>
                ))}
              </g>

              {/* Module cache */}
              <rect
                x={30}
                y={200}
                width={180}
                height={80}
                rx={10}
                fill="rgba(16,185,129,0.06)"
                stroke="rgba(16,185,129,0.2)"
                strokeWidth="1"
              />
              <text
                x={120}
                y={220}
                textAnchor="middle"
                fill="#6ee7b7"
                fontSize="9"
                fontWeight="700"
              >
                📋 require.cache
              </text>
              <text x={120} y={240} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
                Second require() returns
              </text>
              <text x={120} y={254} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
                cached export object
              </text>

              {/* Timeline bar */}
              <g>
                <rect
                  x={30}
                  y={310}
                  width={590}
                  height={45}
                  rx={8}
                  fill="rgba(255,255,255,0.03)"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <text x={50} y={328} fill="rgba(255,255,255,0.5)" fontSize="8">
                  Timeline:
                </text>
                {['Load fs', 'Load http', 'Load utils', 'Run app.js'].map((label, i) => (
                  <g key={label}>
                    <rect
                      x={120 + i * 125}
                      y={318}
                      width={110}
                      height={20}
                      rx={4}
                      fill={loadStep > i ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)'}
                      stroke={loadStep > i ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}
                      strokeWidth="1"
                    />
                    <text
                      x={175 + i * 125}
                      y={332}
                      textAnchor="middle"
                      fill={loadStep > i ? '#fbbf24' : 'rgba(255,255,255,0.3)'}
                      fontSize="8"
                    >
                      {label} {loadStep > i ? '✓' : ''}
                    </text>
                  </g>
                ))}
                <text x={320} y={350} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">
                  Sequential — each blocks until previous finishes
                </text>
              </g>
            </>
          ) : (
            <>
              <text x={320} y={28} textAnchor="middle" fill="white" fontSize="15" fontWeight="700">
                ES Modules — Async &amp; Static Analysis
              </text>
              <text x={320} y={46} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">
                import/export enables tree-shaking and parallel loading
              </text>

              {/* Source file */}
              <g opacity={loadStep >= 0 ? 1 : 0.3} style={{ transition: 'opacity 0.4s' }}>
                <rect
                  x={30}
                  y={65}
                  width={180}
                  height={100}
                  rx={10}
                  fill="rgba(99,102,241,0.08)"
                  stroke="rgba(99,102,241,0.3)"
                  strokeWidth="1.5"
                />
                <text
                  x={120}
                  y={87}
                  textAnchor="middle"
                  fill="#a5b4fc"
                  fontSize="10"
                  fontWeight="700"
                >
                  📄 app.mjs
                </text>
                <text
                  x={50}
                  y={108}
                  fill="rgba(255,255,255,0.6)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  import fs from &apos;fs&apos;;
                </text>
                <text
                  x={50}
                  y={125}
                  fill="rgba(255,255,255,0.6)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  import http from &apos;http&apos;;
                </text>
                <text
                  x={50}
                  y={142}
                  fill="rgba(255,255,255,0.6)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  import {'{'} helper {'}'} from &apos;./utils.mjs&apos;;
                </text>
              </g>

              {/* Phase 1: Parse — all 3 in parallel */}
              <g opacity={loadStep >= 1 ? 1 : 0.2} style={{ transition: 'opacity 0.4s' }}>
                <text
                  x={345}
                  y={72}
                  textAnchor="middle"
                  fill="#6366f1"
                  fontSize="9"
                  fontWeight="700"
                >
                  ① Parse (Static Analysis)
                </text>
                {[
                  { label: 'fs', y: 80 },
                  { label: 'http', y: 115 },
                  { label: './utils.mjs', y: 150 },
                ].map((mod, i) => (
                  <g key={`parse-${i}`}>
                    <line
                      x1={210}
                      y1={108 + i * 17}
                      x2={270}
                      y2={mod.y + 15}
                      stroke="#6366f1"
                      strokeWidth="1.5"
                      strokeDasharray="3,2"
                    />
                    <rect
                      x={270}
                      y={mod.y}
                      width={150}
                      height={30}
                      rx={6}
                      fill="rgba(99,102,241,0.1)"
                      stroke="rgba(99,102,241,0.3)"
                      strokeWidth="1"
                    />
                    <text
                      x={345}
                      y={mod.y + 19}
                      textAnchor="middle"
                      fill="#a5b4fc"
                      fontSize="8"
                      fontWeight="600"
                    >
                      📦 {mod.label}
                    </text>
                  </g>
                ))}
                <text x={345} y={198} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">
                  All imports discovered at parse time
                </text>
              </g>

              {/* Phase 2: Instantiate — create live bindings */}
              <g opacity={loadStep >= 2 ? 1 : 0.2} style={{ transition: 'opacity 0.4s' }}>
                <text
                  x={530}
                  y={72}
                  textAnchor="middle"
                  fill="#10b981"
                  fontSize="9"
                  fontWeight="700"
                >
                  ② Instantiate
                </text>
                {['fs', 'http', 'utils'].map((mod, i) => (
                  <g key={`inst-${i}`}>
                    <line
                      x1={420}
                      y1={95 + i * 35}
                      x2={460}
                      y2={95 + i * 35}
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="3,2"
                    />
                    <rect
                      x={460}
                      y={80 + i * 35}
                      width={160}
                      height={28}
                      rx={6}
                      fill="rgba(16,185,129,0.08)"
                      stroke="rgba(16,185,129,0.2)"
                      strokeWidth="1"
                    />
                    <text x={540} y={98 + i * 35} textAnchor="middle" fill="#6ee7b7" fontSize="8">
                      🔗 Live binding → {mod}
                    </text>
                  </g>
                ))}
                <text x={540} y={198} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">
                  Live references (not copies!)
                </text>
              </g>

              {/* Phase 3: Evaluate */}
              <g opacity={loadStep >= 3 ? 1 : 0.2} style={{ transition: 'opacity 0.4s' }}>
                <rect
                  x={30}
                  y={215}
                  width={590}
                  height={40}
                  rx={8}
                  fill="rgba(245,158,11,0.06)"
                  stroke="rgba(245,158,11,0.2)"
                  strokeWidth="1"
                />
                <text
                  x={325}
                  y={235}
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="10"
                  fontWeight="700"
                >
                  ③ Evaluate — modules executed in dependency order
                </text>
                <text x={325} y={248} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
                  fs → http → utils → app.mjs (depth-first post-order)
                </text>
              </g>

              {/* ESM Features */}
              <g opacity={loadStep >= 4 ? 1 : 0.2} style={{ transition: 'opacity 0.4s' }}>
                <rect
                  x={30}
                  y={270}
                  width={285}
                  height={100}
                  rx={10}
                  fill="rgba(16,185,129,0.05)"
                  stroke="rgba(16,185,129,0.2)"
                  strokeWidth="1"
                />
                <text
                  x={172}
                  y={290}
                  textAnchor="middle"
                  fill="#6ee7b7"
                  fontSize="10"
                  fontWeight="700"
                >
                  ✅ ESM Advantages
                </text>
                {[
                  '• Static imports → tree-shakeable',
                  '• Async loading — non-blocking',
                  '• Live bindings (not copies)',
                  '• Top-level await supported',
                ].map((line, i) => (
                  <text key={i} x={45} y={310 + i * 15} fill="rgba(255,255,255,0.5)" fontSize="8">
                    {line}
                  </text>
                ))}
              </g>

              {/* Tree shaking demo */}
              <g opacity={loadStep >= 5 ? 1 : 0.2} style={{ transition: 'opacity 0.4s' }}>
                <rect
                  x={330}
                  y={270}
                  width={290}
                  height={100}
                  rx={10}
                  fill="rgba(99,102,241,0.05)"
                  stroke="rgba(99,102,241,0.2)"
                  strokeWidth="1"
                />
                <text
                  x={475}
                  y={290}
                  textAnchor="middle"
                  fill="#a5b4fc"
                  fontSize="10"
                  fontWeight="700"
                >
                  🌳 Tree Shaking
                </text>
                <text x={345} y={310} fill="rgba(255,255,255,0.5)" fontSize="8">
                  utils.mjs exports: helper, unused
                </text>
                <rect
                  x={345}
                  y={318}
                  width={80}
                  height={20}
                  rx={4}
                  fill="rgba(16,185,129,0.15)"
                  stroke="rgba(16,185,129,0.3)"
                  strokeWidth="1"
                />
                <text x={385} y={332} textAnchor="middle" fill="#6ee7b7" fontSize="8">
                  ✓ helper
                </text>
                <rect
                  x={435}
                  y={318}
                  width={80}
                  height={20}
                  rx={4}
                  fill="rgba(239,68,68,0.15)"
                  stroke="rgba(239,68,68,0.3)"
                  strokeWidth="1"
                />
                <text
                  x={475}
                  y={332}
                  textAnchor="middle"
                  fill="#fca5a5"
                  fontSize="8"
                  textDecoration="line-through"
                >
                  ✗ unused
                </text>
                <text x={475} y={358} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">
                  Dead code eliminated from bundle
                </text>
              </g>

              {/* Parallel loading timeline */}
              <g>
                <rect
                  x={30}
                  y={380}
                  width={590}
                  height={30}
                  rx={6}
                  fill="rgba(255,255,255,0.03)"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <text x={50} y={400} fill="rgba(255,255,255,0.4)" fontSize="8">
                  Loading:
                </text>
                {['Parse all', 'Instantiate', 'Evaluate', 'Ready'].map((label, i) => (
                  <g key={label}>
                    <rect
                      x={120 + i * 125}
                      y={387}
                      width={110}
                      height={16}
                      rx={4}
                      fill={loadStep > i ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'}
                      stroke={loadStep > i ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}
                      strokeWidth="1"
                    />
                    <text
                      x={175 + i * 125}
                      y={399}
                      textAnchor="middle"
                      fill={loadStep > i ? '#a5b4fc' : 'rgba(255,255,255,0.3)'}
                      fontSize="7"
                    >
                      {label} {loadStep > i ? '✓' : ''}
                    </text>
                  </g>
                ))}
              </g>
            </>
          )}
        </svg>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pb-4 px-4">
          <button
            onClick={() => setLoadStep((s) => Math.max(0, s - 1))}
            className="px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            ◀ Prev
          </button>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Step {loadStep}/{maxSteps}
          </span>
          <button
            onClick={() => setLoadStep((s) => Math.min(maxSteps, s + 1))}
            className="px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: activeTab === 'cjs' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)',
              color: activeTab === 'cjs' ? '#f59e0b' : '#6366f1',
              border: `1px solid ${activeTab === 'cjs' ? 'rgba(245,158,11,0.4)' : 'rgba(99,102,241,0.4)'}`,
            }}
          >
            Next ▶
          </button>
          <button
            onClick={() => setLoadStep(0)}
            className="px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            ↺ Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleSystemViz;
