import React, { useState } from 'react';

interface RuntimeComparisonVizProps {
  className?: string;
}

const RuntimeComparisonViz: React.FC<RuntimeComparisonVizProps> = ({ className = '' }) => {
  const [activeRuntime, setActiveRuntime] = useState<'node' | 'deno' | 'bun'>('node');

  const runtimes = {
    node: {
      color: '#68a063',
      label: 'Node.js',
      icon: '🟢',
      creator: 'Ryan Dahl (2009)',
      engine: 'V8 (Chrome)',
      lang: 'C++ / JavaScript',
      pm: 'npm / yarn / pnpm',
      ts: 'Via ts-node / tsx',
      security: 'Full access by default',
      speed: 65,
      ecosystem: 95,
      features: [
        'Massive ecosystem (2M+ packages)',
        'Battle-tested in production',
        'Huge community & enterprise support',
        'CommonJS + ESM support',
      ],
      weaknesses: [
        'No built-in TypeScript',
        'No built-in test runner (until v20)',
        'Security permissions opt-in only',
        'Legacy API surface is large',
      ],
    },
    deno: {
      color: '#70ffaf',
      label: 'Deno',
      icon: '🦕',
      creator: 'Ryan Dahl (2020)',
      engine: 'V8 (Chrome)',
      lang: 'Rust / TypeScript',
      pm: 'URL imports / deno.land',
      ts: 'Native TypeScript support',
      security: 'Sandboxed by default',
      speed: 75,
      ecosystem: 40,
      features: [
        'TypeScript out of the box',
        'Secure by default (permissions)',
        'Built-in formatter, linter, tester',
        'Web-standard APIs (fetch, etc.)',
      ],
      weaknesses: [
        'Smaller ecosystem',
        'npm compat still evolving',
        'Less enterprise adoption',
        'Breaking changes between versions',
      ],
    },
    bun: {
      color: '#fbf0df',
      label: 'Bun',
      icon: '🥟',
      creator: 'Jarred Sumner (2022)',
      engine: 'JavaScriptCore (Safari)',
      lang: 'Zig / C++',
      pm: 'Built-in (bun install)',
      ts: 'Native TypeScript support',
      security: 'Full access by default',
      speed: 95,
      ecosystem: 60,
      features: [
        'Blazing fast startup & runtime',
        'All-in-one toolkit (bundler, PM, test)',
        'Drop-in Node.js replacement',
        'Native SQLite & .env support',
      ],
      weaknesses: [
        'Youngest runtime (stability?)',
        'Not all Node APIs implemented',
        'Smaller community',
        'Production track record limited',
      ],
    },
  };

  const rt = runtimes[activeRuntime];

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
        {/* Runtime selector */}
        <div className="flex items-center justify-center gap-2 pt-4 px-4">
          {(Object.keys(runtimes) as Array<'node' | 'deno' | 'bun'>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveRuntime(key)}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
              style={{
                background:
                  activeRuntime === key ? `${runtimes[key].color}20` : 'rgba(255,255,255,0.05)',
                color: activeRuntime === key ? runtimes[key].color : 'rgba(255,255,255,0.5)',
                border: `1px solid ${activeRuntime === key ? `${runtimes[key].color}50` : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {runtimes[key].icon} {runtimes[key].label}
            </button>
          ))}
        </div>

        <svg viewBox="0 0 640 460" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
          <defs>
            <filter id="rt-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <text x={320} y={28} textAnchor="middle" fill="white" fontSize="16" fontWeight="700">
            ⚔️ Runtime Wars: {rt.label}
          </text>
          <text x={320} y={44} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">
            by {rt.creator}
          </text>

          {/* Architecture diagram */}
          <g>
            {/* JS Engine */}
            <rect
              x={30}
              y={60}
              width={280}
              height={120}
              rx={12}
              fill={`${rt.color}08`}
              stroke={`${rt.color}30`}
              strokeWidth="1.5"
            />
            <text x={170} y={82} textAnchor="middle" fill={rt.color} fontSize="11" fontWeight="700">
              ⚙️ JS Engine: {rt.engine}
            </text>

            <rect
              x={45}
              y={92}
              width={250}
              height={75}
              rx={8}
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />

            {/* Engine internals */}
            {[
              { label: 'Parser', x: 65, w: 60 },
              { label: 'Compiler', x: 135, w: 65 },
              { label: 'Runtime', x: 210, w: 75 },
            ].map((part) => (
              <g key={part.label}>
                <rect
                  x={part.x}
                  y={102}
                  width={part.w}
                  height={28}
                  rx={5}
                  fill={`${rt.color}15`}
                  stroke={`${rt.color}30`}
                  strokeWidth="1"
                />
                <text
                  x={part.x + part.w / 2}
                  y={120}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.6)"
                  fontSize="8"
                >
                  {part.label}
                </text>
              </g>
            ))}

            <text x={170} y={155} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">
              Written in: {rt.lang}
            </text>
          </g>

          {/* Info cards */}
          <g>
            <rect
              x={330}
              y={60}
              width={290}
              height={120}
              rx={12}
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
            <text x={475} y={82} textAnchor="middle" fill="white" fontSize="10" fontWeight="700">
              📋 Quick Facts
            </text>

            {[
              { label: 'Package Mgr', value: rt.pm },
              { label: 'TypeScript', value: rt.ts },
              { label: 'Security', value: rt.security },
            ].map((fact, i) => (
              <g key={fact.label}>
                <text x={345} y={102 + i * 22} fill="rgba(255,255,255,0.4)" fontSize="8">
                  {fact.label}:
                </text>
                <text
                  x={420}
                  y={102 + i * 22}
                  fill="rgba(255,255,255,0.7)"
                  fontSize="8"
                  fontWeight="600"
                >
                  {fact.value}
                </text>
              </g>
            ))}
          </g>

          {/* Strengths */}
          <g>
            <rect
              x={30}
              y={195}
              width={290}
              height={130}
              rx={12}
              fill="rgba(16,185,129,0.05)"
              stroke="rgba(16,185,129,0.2)"
              strokeWidth="1"
            />
            <text x={175} y={218} textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="700">
              ✅ Strengths
            </text>
            {rt.features.map((f, i) => (
              <text key={i} x={45} y={240 + i * 20} fill="rgba(255,255,255,0.5)" fontSize="8">
                • {f}
              </text>
            ))}
          </g>

          {/* Weaknesses */}
          <g>
            <rect
              x={330}
              y={195}
              width={290}
              height={130}
              rx={12}
              fill="rgba(239,68,68,0.05)"
              stroke="rgba(239,68,68,0.2)"
              strokeWidth="1"
            />
            <text x={475} y={218} textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="700">
              ⚠️ Limitations
            </text>
            {rt.weaknesses.map((w, i) => (
              <text key={i} x={345} y={240 + i * 20} fill="rgba(255,255,255,0.5)" fontSize="8">
                • {w}
              </text>
            ))}
          </g>

          {/* Performance comparison bars */}
          <g>
            <rect
              x={30}
              y={340}
              width={590}
              height={110}
              rx={12}
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
            <text x={325} y={362} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">
              📊 Comparative Metrics
            </text>

            {/* Speed bar */}
            <text x={50} y={390} fill="rgba(255,255,255,0.5)" fontSize="9">
              Speed
            </text>
            <rect x={120} y={380} width={200} height={14} rx={7} fill="rgba(255,255,255,0.05)" />
            {(Object.keys(runtimes) as Array<'node' | 'deno' | 'bun'>).map((key, i) => (
              <g key={`speed-${key}`}>
                <rect
                  x={120}
                  y={380 + i * 0.1}
                  width={runtimes[key].speed * 2}
                  height={14}
                  rx={7}
                  fill={key === activeRuntime ? runtimes[key].color : 'transparent'}
                  stroke={key !== activeRuntime ? `${runtimes[key].color}40` : 'none'}
                  strokeWidth="1"
                  strokeDasharray={key !== activeRuntime ? '3,2' : 'none'}
                  opacity={key === activeRuntime ? 0.6 : 0.3}
                  style={{ transition: 'all 0.4s' }}
                />
              </g>
            ))}
            <text x={330} y={391} fill="rgba(255,255,255,0.5)" fontSize="8">
              🥟 Bun fastest | 🦕 Deno fast | 🟢 Node solid
            </text>

            {/* Ecosystem bar */}
            <text x={50} y={420} fill="rgba(255,255,255,0.5)" fontSize="9">
              Ecosystem
            </text>
            <rect x={120} y={410} width={200} height={14} rx={7} fill="rgba(255,255,255,0.05)" />
            {(Object.keys(runtimes) as Array<'node' | 'deno' | 'bun'>).map((key) => (
              <g key={`eco-${key}`}>
                <rect
                  x={120}
                  y={410}
                  width={runtimes[key].ecosystem * 2}
                  height={14}
                  rx={7}
                  fill={key === activeRuntime ? runtimes[key].color : 'transparent'}
                  stroke={key !== activeRuntime ? `${runtimes[key].color}40` : 'none'}
                  strokeWidth="1"
                  strokeDasharray={key !== activeRuntime ? '3,2' : 'none'}
                  opacity={key === activeRuntime ? 0.6 : 0.3}
                  style={{ transition: 'all 0.4s' }}
                />
              </g>
            ))}
            <text x={330} y={421} fill="rgba(255,255,255,0.5)" fontSize="8">
              🟢 Node dominates | 🥟 Bun growing | 🦕 Deno niche
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default RuntimeComparisonViz;
