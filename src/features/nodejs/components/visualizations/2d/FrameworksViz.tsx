import React, { useState } from 'react';

interface FrameworksVizProps {
  className?: string;
}

const FrameworksViz: React.FC<FrameworksVizProps> = ({ className = '' }) => {
  const [activeFramework, setActiveFramework] = useState<string>('express');

  const frameworks = {
    express: {
      color: '#f5f5f5',
      accentColor: '#333333',
      label: 'Express.js',
      icon: '🚂',
      type: 'Minimalist / Unopinionated',
      stars: '64k+',
      middleware: true,
      pattern: 'Middleware Chain',
      performance: 50,
      learning: 90,
      flexibility: 95,
      features: [
        'Minimal core',
        'Huge middleware ecosystem',
        'Most tutorials & docs',
        'De facto standard',
      ],
      code: 'app.get("/", (req, res) => res.json({ ok: true }))',
    },
    fastify: {
      color: '#24292e',
      accentColor: '#00c2ff',
      label: 'Fastify',
      icon: '⚡',
      type: 'Performance-Focused',
      stars: '33k+',
      middleware: false,
      pattern: 'Plugin System',
      performance: 95,
      learning: 70,
      flexibility: 80,
      features: [
        '2x faster than Express',
        'Schema-based validation',
        'Auto-generated Swagger',
        'Encapsulated plugins',
      ],
      code: 'fastify.get("/", async () => ({ ok: true }))',
    },
    nestjs: {
      color: '#e0234e',
      accentColor: '#e0234e',
      label: 'NestJS',
      icon: '🐱',
      type: 'Enterprise / Opinionated',
      stars: '68k+',
      middleware: true,
      pattern: 'Decorators + DI',
      performance: 65,
      learning: 40,
      flexibility: 60,
      features: [
        'Angular-inspired architecture',
        'Dependency injection',
        'TypeScript first',
        'Microservices built-in',
      ],
      code: '@Get() findAll(): string[] { return this.service.findAll() }',
    },
    koa: {
      color: '#F5F5F5',
      accentColor: '#6c6c6c',
      label: 'Koa',
      icon: '🍃',
      type: 'Modern Minimalist',
      stars: '35k+',
      middleware: true,
      pattern: 'Async Middleware',
      performance: 70,
      learning: 75,
      flexibility: 85,
      features: [
        'By Express creators',
        'Async/await native',
        'No bundled middleware',
        'Elegant error handling',
      ],
      code: 'app.use(async ctx => { ctx.body = { ok: true } })',
    },
    hono: {
      color: '#ff6600',
      accentColor: '#ff6600',
      label: 'Hono',
      icon: '🔥',
      type: 'Edge-First / Ultrafast',
      stars: '22k+',
      middleware: true,
      pattern: 'Web Standards',
      performance: 98,
      learning: 80,
      flexibility: 90,
      features: [
        'Multi-runtime (Node, Deno, Bun, CF)',
        'Zero dependencies',
        'Web Standard APIs',
        'Tiny bundle (14kB)',
      ],
      code: 'app.get("/", (c) => c.json({ ok: true }))',
    },
  };

  const fw = frameworks[activeFramework as keyof typeof frameworks];

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
        {/* Framework tabs */}
        <div className="flex items-center justify-center gap-1 pt-4 px-2 flex-wrap">
          {Object.entries(frameworks).map(([key, f]) => (
            <button
              key={key}
              onClick={() => setActiveFramework(key)}
              className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all"
              style={{
                background:
                  activeFramework === key ? `${f.accentColor}20` : 'rgba(255,255,255,0.05)',
                color: activeFramework === key ? f.accentColor : 'rgba(255,255,255,0.5)',
                border: `1px solid ${activeFramework === key ? `${f.accentColor}40` : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
          <text x={320} y={28} textAnchor="middle" fill="white" fontSize="15" fontWeight="700">
            🏗️ Node.js Server Frameworks: {fw.label}
          </text>
          <text x={320} y={44} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">
            {fw.type} — {fw.stars} GitHub Stars
          </text>

          {/* Architecture pattern */}
          <g>
            <rect
              x={30}
              y={58}
              width={280}
              height={145}
              rx={12}
              fill="rgba(255,255,255,0.03)"
              stroke={`${fw.accentColor}30`}
              strokeWidth="1.5"
            />
            <text
              x={170}
              y={80}
              textAnchor="middle"
              fill={fw.accentColor}
              fontSize="11"
              fontWeight="700"
            >
              {fw.icon} Architecture: {fw.pattern}
            </text>

            {/* Request flow */}
            <g>
              <rect
                x={45}
                y={92}
                width={55}
                height={30}
                rx={6}
                fill="rgba(99,102,241,0.15)"
                stroke="rgba(99,102,241,0.3)"
                strokeWidth="1"
              />
              <text x={72} y={111} textAnchor="middle" fill="#a5b4fc" fontSize="8">
                Request
              </text>

              <line
                x1={100}
                y1={107}
                x2={120}
                y2={107}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
                markerEnd="url(#arrow)"
              />

              {fw.middleware ? (
                <>
                  <rect
                    x={120}
                    y={92}
                    width={65}
                    height={30}
                    rx={6}
                    fill={`${fw.accentColor}15`}
                    stroke={`${fw.accentColor}30`}
                    strokeWidth="1"
                  />
                  <text
                    x={152}
                    y={111}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.6)"
                    fontSize="7"
                  >
                    Middleware
                  </text>
                  <line
                    x1={185}
                    y1={107}
                    x2={200}
                    y2={107}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1.5"
                  />
                </>
              ) : (
                <>
                  <rect
                    x={120}
                    y={92}
                    width={65}
                    height={30}
                    rx={6}
                    fill={`${fw.accentColor}15`}
                    stroke={`${fw.accentColor}30`}
                    strokeWidth="1"
                  />
                  <text
                    x={152}
                    y={111}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.6)"
                    fontSize="7"
                  >
                    Plugin
                  </text>
                  <line
                    x1={185}
                    y1={107}
                    x2={200}
                    y2={107}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1.5"
                  />
                </>
              )}

              <rect
                x={200}
                y={92}
                width={55}
                height={30}
                rx={6}
                fill="rgba(16,185,129,0.15)"
                stroke="rgba(16,185,129,0.3)"
                strokeWidth="1"
              />
              <text x={228} y={111} textAnchor="middle" fill="#6ee7b7" fontSize="8">
                Handler
              </text>

              <line
                x1={255}
                y1={107}
                x2={270}
                y2={107}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
              />

              <rect
                x={270}
                y={92}
                width={25}
                height={30}
                rx={6}
                fill="rgba(245,158,11,0.15)"
                stroke="rgba(245,158,11,0.3)"
                strokeWidth="1"
              />
              <text x={282} y={111} textAnchor="middle" fill="#fbbf24" fontSize="8">
                →
              </text>
            </g>

            {/* Code example */}
            <rect
              x={45}
              y={135}
              width={250}
              height={30}
              rx={6}
              fill="rgba(0,0,0,0.3)"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
            <text x={55} y={154} fill="rgba(255,255,255,0.6)" fontSize="7" fontFamily="monospace">
              {fw.code}
            </text>

            {/* Features */}
            <g>
              {fw.features.map((f, i) => (
                <text key={i} x={45} y={182 + i * 12} fill="rgba(255,255,255,0.4)" fontSize="7">
                  ✓ {f}
                </text>
              ))}
            </g>
          </g>

          {/* Comparison radar (simplified as bars) */}
          <g>
            <rect
              x={330}
              y={58}
              width={290}
              height={145}
              rx={12}
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
            <text x={475} y={80} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">
              📊 Framework Comparison
            </text>

            {/* Performance bar */}
            <text x={345} y={108} fill="rgba(255,255,255,0.4)" fontSize="8">
              Performance
            </text>
            <rect x={420} y={98} width={160} height={14} rx={7} fill="rgba(255,255,255,0.05)" />
            <rect
              x={420}
              y={98}
              width={fw.performance * 1.6}
              height={14}
              rx={7}
              fill={fw.performance > 80 ? '#10b981' : fw.performance > 60 ? '#f59e0b' : '#6366f1'}
              opacity={0.6}
              style={{ transition: 'width 0.4s' }}
            />
            <text x={590} y={109} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize="7">
              {fw.performance}%
            </text>

            {/* Learning curve bar */}
            <text x={345} y={138} fill="rgba(255,255,255,0.4)" fontSize="8">
              Ease of Use
            </text>
            <rect x={420} y={128} width={160} height={14} rx={7} fill="rgba(255,255,255,0.05)" />
            <rect
              x={420}
              y={128}
              width={fw.learning * 1.6}
              height={14}
              rx={7}
              fill={fw.learning > 80 ? '#10b981' : fw.learning > 60 ? '#f59e0b' : '#ef4444'}
              opacity={0.6}
              style={{ transition: 'width 0.4s' }}
            />
            <text x={590} y={139} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize="7">
              {fw.learning}%
            </text>

            {/* Flexibility bar */}
            <text x={345} y={168} fill="rgba(255,255,255,0.4)" fontSize="8">
              Flexibility
            </text>
            <rect x={420} y={158} width={160} height={14} rx={7} fill="rgba(255,255,255,0.05)" />
            <rect
              x={420}
              y={158}
              width={fw.flexibility * 1.6}
              height={14}
              rx={7}
              fill={fw.flexibility > 80 ? '#10b981' : fw.flexibility > 60 ? '#f59e0b' : '#6366f1'}
              opacity={0.6}
              style={{ transition: 'width 0.4s' }}
            />
            <text x={590} y={169} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize="7">
              {fw.flexibility}%
            </text>
          </g>

          {/* All frameworks quick comparison grid */}
          <g>
            <rect
              x={30}
              y={215}
              width={590}
              height={175}
              rx={12}
              fill="rgba(255,255,255,0.02)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
            <text x={325} y={238} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">
              🔍 When to Choose What?
            </text>

            {[
              {
                fw: 'Express',
                use: 'Quick prototypes, learning, APIs',
                color: '#999',
                icon: '🚂',
                perf: '★★★☆☆',
              },
              {
                fw: 'Fastify',
                use: 'High performance APIs, schema validation',
                color: '#00c2ff',
                icon: '⚡',
                perf: '★★★★★',
              },
              {
                fw: 'NestJS',
                use: 'Enterprise apps, microservices, teams',
                color: '#e0234e',
                icon: '🐱',
                perf: '★★★☆☆',
              },
              {
                fw: 'Koa',
                use: 'Clean async APIs, Express alternative',
                color: '#6c6c6c',
                icon: '🍃',
                perf: '★★★★☆',
              },
              {
                fw: 'Hono',
                use: 'Edge computing, multi-runtime, minimal',
                color: '#ff6600',
                icon: '🔥',
                perf: '★★★★★',
              },
            ].map((item, i) => (
              <g key={item.fw}>
                <rect
                  x={40}
                  y={250 + i * 27}
                  width={570}
                  height={23}
                  rx={5}
                  fill={
                    activeFramework === item.fw.toLowerCase()
                      ? `${item.color}15`
                      : 'rgba(255,255,255,0.02)'
                  }
                  stroke={
                    activeFramework === item.fw.toLowerCase()
                      ? `${item.color}30`
                      : 'rgba(255,255,255,0.05)'
                  }
                  strokeWidth="1"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveFramework(item.fw.toLowerCase())}
                />
                <text
                  x={55}
                  y={265 + i * 27}
                  fill="rgba(255,255,255,0.7)"
                  fontSize="8"
                  fontWeight="600"
                >
                  {item.icon} {item.fw}
                </text>
                <text x={140} y={265 + i * 27} fill="rgba(255,255,255,0.4)" fontSize="8">
                  {item.use}
                </text>
                <text x={560} y={265 + i * 27} textAnchor="end" fill={item.color} fontSize="8">
                  {item.perf}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default FrameworksViz;
