import React, { useState } from 'react';
import { Castle, Building2, Layers, Radio, Hexagon, CheckCircle, XCircle, Zap } from 'lucide-react';

interface ArchitecturePatterns2DProps {
  className?: string;
}

type PatternKey = 'monolithic' | 'layered' | 'microservices' | 'event-driven' | 'hexagonal';

interface PatternDef {
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentBg: string;
  analogy: string;
  tagline: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

const patterns: Record<PatternKey, PatternDef> = {
  monolithic: {
    name: 'Monolithic',
    icon: Castle,
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    accentBg: 'bg-blue-500',
    analogy: 'A single medieval castle — one structure houses everything',
    tagline: 'Single deployable unit containing all application logic',
    pros: [
      'Simple to develop & deploy',
      'Easy debugging (single process)',
      'Low operational overhead',
    ],
    cons: ['Hard to scale individual parts', 'One bug can crash everything', 'Tech-stack locked'],
    bestFor: 'MVPs, small teams, simple domains',
  },
  layered: {
    name: 'Layered (N-Tier)',
    icon: Layers,
    color: '#8b5cf6',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    textColor: 'text-violet-800',
    accentBg: 'bg-violet-500',
    analogy: 'A corporate headquarters — each floor has a specific responsibility',
    tagline: 'Presentation → Business Logic → Persistence → Database',
    pros: [
      'Clear separation of concerns',
      'Each layer independently testable',
      'Well-understood pattern',
    ],
    cons: [
      'Tight vertical coupling',
      'Changes often cascade through layers',
      'Can lead to "pass-through" code',
    ],
    bestFor: 'Enterprise apps, CRUD systems, team specialization',
  },
  microservices: {
    name: 'Microservices',
    icon: Building2,
    color: '#10b981',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    accentBg: 'bg-emerald-500',
    analogy: 'A city of specialized buildings connected by roads and transit',
    tagline: 'Independent services, each with its own database and deployment pipeline',
    pros: ['Scale each service independently', 'Polyglot tech per service', 'Fault isolation'],
    cons: [
      'Distributed system complexity',
      'Network latency',
      'Operational overhead (monitoring, tracing)',
    ],
    bestFor: 'Large teams, high-traffic apps, diverse scaling needs',
  },
  'event-driven': {
    name: 'Event-Driven',
    icon: Radio,
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    accentBg: 'bg-amber-500',
    analogy: 'A newsroom — events are published and any interested party subscribes',
    tagline: 'Producers emit events; consumers react asynchronously',
    pros: [
      'Decoupled producers & consumers',
      'Highly scalable async processing',
      'Natural audit trail',
    ],
    cons: [
      'Eventual consistency challenges',
      'Hard to debug event chains',
      'Message ordering complexity',
    ],
    bestFor: 'IoT, financial trading, notification systems',
  },
  hexagonal: {
    name: 'Hexagonal (Ports & Adapters)',
    icon: Hexagon,
    color: '#ec4899',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-800',
    accentBg: 'bg-pink-500',
    analogy: 'A stereo system — swap speakers or source without changing the amplifier',
    tagline: 'Core logic is isolated; external systems connect through adapters',
    pros: ['Technology-agnostic core', 'Easy to swap databases, UIs, etc.', 'Highly testable'],
    cons: ['Higher initial complexity', 'Requires strict discipline', 'More boilerplate code'],
    bestFor: 'Complex domains, long-lived systems, DDD projects',
  },
};

const patternKeys: PatternKey[] = [
  'monolithic',
  'layered',
  'microservices',
  'event-driven',
  'hexagonal',
];

const ArchitecturePatterns2D: React.FC<ArchitecturePatterns2DProps> = ({ className = '' }) => {
  const [selected, setSelected] = useState<PatternKey>('monolithic');
  const [hoveredTrait, setHoveredTrait] = useState<string | null>(null);
  const p = patterns[selected];
  const Icon = p.icon;

  const renderDiagram = (): React.ReactNode => {
    switch (selected) {
      case 'monolithic':
        return (
          <svg viewBox="0 0 400 260" className="w-full h-auto">
            {/* Single large block */}
            <rect
              x={80}
              y={30}
              width={240}
              height={180}
              rx={12}
              fill="#dbeafe"
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <text x={200} y={56} textAnchor="middle" className="text-xs font-bold fill-blue-800">
              Monolithic Application
            </text>
            {/* Internal modules */}
            {[
              { label: 'UI Layer', y: 70, color: '#93c5fd' },
              { label: 'Business Logic', y: 110, color: '#60a5fa' },
              { label: 'Data Access', y: 150, color: '#3b82f6' },
            ].map((mod) => (
              <g key={mod.label}>
                <rect
                  x={100}
                  y={mod.y}
                  width={200}
                  height={30}
                  rx={6}
                  fill={mod.color}
                  opacity={0.6}
                />
                <text
                  x={200}
                  y={mod.y + 19}
                  textAnchor="middle"
                  className="text-[10px] font-medium fill-blue-900"
                >
                  {mod.label}
                </text>
              </g>
            ))}
            {/* DB */}
            <ellipse
              cx={200}
              cy={235}
              rx={40}
              ry={14}
              fill="#bfdbfe"
              stroke="#3b82f6"
              strokeWidth={1.5}
            />
            <text
              x={200}
              y={239}
              textAnchor="middle"
              className="text-[9px] fill-blue-800 font-medium"
            >
              Single DB
            </text>
            <line
              x1={200}
              y1={210}
              x2={200}
              y2={221}
              stroke="#3b82f6"
              strokeWidth={1.5}
              markerEnd="url(#arch-arrow)"
            />
            <defs>
              <marker
                id="arch-arrow"
                markerWidth="7"
                markerHeight="5"
                refX="6"
                refY="2.5"
                orient="auto"
              >
                <polygon points="0 0,7 2.5,0 5" fill="#3b82f6" />
              </marker>
            </defs>
          </svg>
        );

      case 'layered':
        return (
          <svg viewBox="0 0 400 280" className="w-full h-auto">
            {[
              { label: 'Presentation Layer', y: 20, fill: '#e0e7ff', stroke: '#818cf8' },
              { label: 'Business Logic Layer', y: 85, fill: '#ddd6fe', stroke: '#8b5cf6' },
              { label: 'Persistence Layer', y: 150, fill: '#c4b5fd', stroke: '#7c3aed' },
              { label: 'Database Layer', y: 215, fill: '#a78bfa', stroke: '#6d28d9' },
            ].map((layer, i) => (
              <g key={layer.label}>
                <rect
                  x={60}
                  y={layer.y}
                  width={280}
                  height={50}
                  rx={8}
                  fill={layer.fill}
                  stroke={layer.stroke}
                  strokeWidth={2}
                />
                <text
                  x={200}
                  y={layer.y + 30}
                  textAnchor="middle"
                  className="text-[11px] font-semibold"
                  fill={layer.stroke}
                >
                  {layer.label}
                </text>
                {i < 3 && (
                  <line
                    x1={200}
                    y1={layer.y + 50}
                    x2={200}
                    y2={layer.y + 65}
                    stroke="#7c3aed"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    markerEnd="url(#layer-arrow)"
                  />
                )}
              </g>
            ))}
            <defs>
              <marker
                id="layer-arrow"
                markerWidth="7"
                markerHeight="5"
                refX="6"
                refY="2.5"
                orient="auto"
              >
                <polygon points="0 0,7 2.5,0 5" fill="#7c3aed" />
              </marker>
            </defs>
          </svg>
        );

      case 'microservices':
        return (
          <svg viewBox="0 0 440 280" className="w-full h-auto">
            {/* API Gateway */}
            <rect
              x={160}
              y={10}
              width={120}
              height={36}
              rx={18}
              fill="#d1fae5"
              stroke="#10b981"
              strokeWidth={2}
            />
            <text
              x={220}
              y={33}
              textAnchor="middle"
              className="text-[10px] font-bold fill-emerald-800"
            >
              API Gateway
            </text>
            {/* Services */}
            {[
              { label: 'Auth', icon: '🔑', x: 30, color: '#6ee7b7' },
              { label: 'Orders', icon: '🛒', x: 130, color: '#6ee7b7' },
              { label: 'Payments', icon: '💳', x: 230, color: '#6ee7b7' },
              { label: 'Notify', icon: '📧', x: 330, color: '#6ee7b7' },
            ].map((svc) => (
              <g key={svc.label}>
                <rect
                  x={svc.x}
                  y={80}
                  width={80}
                  height={60}
                  rx={8}
                  fill={svc.color}
                  opacity={0.3}
                  stroke="#10b981"
                  strokeWidth={1.5}
                />
                <text x={svc.x + 40} y={105} textAnchor="middle" className="text-base">
                  {svc.icon}
                </text>
                <text
                  x={svc.x + 40}
                  y={128}
                  textAnchor="middle"
                  className="text-[9px] font-semibold fill-emerald-800"
                >
                  {svc.label}
                </text>
                {/* Connection from gateway */}
                <line
                  x1={220}
                  y1={46}
                  x2={svc.x + 40}
                  y2={80}
                  stroke="#10b981"
                  strokeWidth={1}
                  strokeDasharray="3 2"
                />
                {/* Per-service DB */}
                <ellipse
                  cx={svc.x + 40}
                  cy={170}
                  rx={24}
                  ry={10}
                  fill="#d1fae5"
                  stroke="#10b981"
                  strokeWidth={1}
                />
                <text
                  x={svc.x + 40}
                  y={173}
                  textAnchor="middle"
                  className="text-[7px] fill-emerald-700"
                >
                  DB
                </text>
                <line
                  x1={svc.x + 40}
                  y1={140}
                  x2={svc.x + 40}
                  y2={160}
                  stroke="#10b981"
                  strokeWidth={1}
                  strokeDasharray="3 2"
                />
              </g>
            ))}
            {/* Message Bus */}
            <rect
              x={40}
              y={200}
              width={360}
              height={30}
              rx={6}
              fill="#ecfdf5"
              stroke="#10b981"
              strokeWidth={1.5}
              strokeDasharray="6 3"
            />
            <text
              x={220}
              y={220}
              textAnchor="middle"
              className="text-[10px] font-medium fill-emerald-700"
            >
              Message Bus / Event Stream
            </text>
          </svg>
        );

      case 'event-driven':
        return (
          <svg viewBox="0 0 440 260" className="w-full h-auto">
            {/* Event Bus */}
            <rect
              x={40}
              y={110}
              width={360}
              height={40}
              rx={20}
              fill="#fef3c7"
              stroke="#f59e0b"
              strokeWidth={2}
            />
            <text
              x={220}
              y={135}
              textAnchor="middle"
              className="text-[11px] font-bold fill-amber-800"
            >
              Event Bus / Message Broker
            </text>
            {/* Producers (top) */}
            {[
              { label: 'Order Service', x: 60 },
              { label: 'User Service', x: 190 },
              { label: 'Payment Service', x: 320 },
            ].map((prod) => (
              <g key={prod.label}>
                <rect
                  x={prod.x}
                  y={30}
                  width={100}
                  height={44}
                  rx={8}
                  fill="#fde68a"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                />
                <text
                  x={prod.x + 50}
                  y={46}
                  textAnchor="middle"
                  className="text-[8px] fill-amber-600 font-medium"
                >
                  Producer
                </text>
                <text
                  x={prod.x + 50}
                  y={62}
                  textAnchor="middle"
                  className="text-[9px] fill-amber-900 font-semibold"
                >
                  {prod.label}
                </text>
                <line
                  x1={prod.x + 50}
                  y1={74}
                  x2={prod.x + 50}
                  y2={110}
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  markerEnd="url(#evt-arrow)"
                />
              </g>
            ))}
            {/* Consumers (bottom) */}
            {[
              { label: 'Email Worker', x: 40 },
              { label: 'Analytics', x: 140 },
              { label: 'Inventory', x: 240 },
              { label: 'Audit Log', x: 340 },
            ].map((cons) => (
              <g key={cons.label}>
                <rect
                  x={cons.x}
                  y={190}
                  width={80}
                  height={44}
                  rx={8}
                  fill="#fef9c3"
                  stroke="#eab308"
                  strokeWidth={1.5}
                />
                <text
                  x={cons.x + 40}
                  y={206}
                  textAnchor="middle"
                  className="text-[8px] fill-amber-600 font-medium"
                >
                  Consumer
                </text>
                <text
                  x={cons.x + 40}
                  y={222}
                  textAnchor="middle"
                  className="text-[9px] fill-amber-900 font-semibold"
                >
                  {cons.label}
                </text>
                <line
                  x1={cons.x + 40}
                  y1={150}
                  x2={cons.x + 40}
                  y2={190}
                  stroke="#eab308"
                  strokeWidth={1.5}
                  markerEnd="url(#evt-arrow)"
                />
              </g>
            ))}
            <defs>
              <marker
                id="evt-arrow"
                markerWidth="7"
                markerHeight="5"
                refX="6"
                refY="2.5"
                orient="auto"
              >
                <polygon points="0 0,7 2.5,0 5" fill="#f59e0b" />
              </marker>
            </defs>
          </svg>
        );

      case 'hexagonal':
        return (
          <svg viewBox="0 0 440 300" className="w-full h-auto">
            {/* Core hexagon */}
            <polygon
              points="220,40 310,85 310,175 220,220 130,175 130,85"
              fill="#fce7f3"
              stroke="#ec4899"
              strokeWidth={2.5}
            />
            <text x={220} y={120} textAnchor="middle" className="text-xs font-bold fill-pink-800">
              Core Domain
            </text>
            <text x={220} y={140} textAnchor="middle" className="text-[9px] fill-pink-600">
              (Business Logic)
            </text>
            <text x={220} y={158} textAnchor="middle" className="text-[8px] fill-pink-500">
              Technology-agnostic
            </text>
            {/* Ports (circles on hex edges) */}
            {[
              { label: 'REST API', x: 130, y: 85, align: 'end' as const },
              { label: 'gRPC', x: 130, y: 175, align: 'end' as const },
              { label: 'GraphQL', x: 310, y: 85, align: 'start' as const },
              { label: 'DB Adapter', x: 310, y: 175, align: 'start' as const },
              { label: 'HTTP In', x: 220, y: 40, align: 'middle' as const },
              { label: 'Events Out', x: 220, y: 220, align: 'middle' as const },
            ].map((port) => (
              <g key={port.label}>
                <circle cx={port.x} cy={port.y} r={6} fill="#ec4899" />
                <text
                  x={
                    port.align === 'end'
                      ? port.x - 14
                      : port.align === 'start'
                        ? port.x + 14
                        : port.x
                  }
                  y={
                    port.align === 'middle'
                      ? port.y < 130
                        ? port.y - 12
                        : port.y + 18
                      : port.y + 4
                  }
                  textAnchor={port.align === 'middle' ? 'middle' : port.align}
                  className="text-[8px] fill-pink-700 font-medium"
                >
                  {port.label}
                </text>
              </g>
            ))}
            {/* Adapters (outer boxes) */}
            {[
              { label: 'Web UI', x: 20, y: 60 },
              { label: 'Mobile App', x: 20, y: 170 },
              { label: 'PostgreSQL', x: 360, y: 60 },
              { label: 'Redis Cache', x: 360, y: 170 },
            ].map((adapter) => (
              <g key={adapter.label}>
                <rect
                  x={adapter.x}
                  y={adapter.y}
                  width={72}
                  height={32}
                  rx={6}
                  fill="#fbcfe8"
                  stroke="#ec4899"
                  strokeWidth={1.2}
                />
                <text
                  x={adapter.x + 36}
                  y={adapter.y + 20}
                  textAnchor="middle"
                  className="text-[8px] fill-pink-800 font-medium"
                >
                  {adapter.label}
                </text>
              </g>
            ))}
            {/* Connecting lines */}
            <line
              x1={92}
              y1={76}
              x2={130}
              y2={85}
              stroke="#ec4899"
              strokeWidth={1}
              strokeDasharray="3 2"
            />
            <line
              x1={92}
              y1={186}
              x2={130}
              y2={175}
              stroke="#ec4899"
              strokeWidth={1}
              strokeDasharray="3 2"
            />
            <line
              x1={360}
              y1={76}
              x2={310}
              y2={85}
              stroke="#ec4899"
              strokeWidth={1}
              strokeDasharray="3 2"
            />
            <line
              x1={360}
              y1={186}
              x2={310}
              y2={175}
              stroke="#ec4899"
              strokeWidth={1}
              strokeDasharray="3 2"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`w-full bg-gradient-to-br from-slate-50 via-white to-zinc-50 rounded-2xl p-6 sm:p-8 ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Architecture Patterns Compared
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select a pattern to explore its structure, trade-offs, and ideal use cases.
        </p>
      </div>

      {/* Pattern Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {patternKeys.map((key) => {
          const pat = patterns[key];
          const PatIcon = pat.icon;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                selected === key
                  ? `${pat.accentBg} text-white border-transparent shadow-lg scale-105`
                  : 'bg-white text-gray-600 border-gray-200 hover:shadow-md hover:border-gray-300'
              }`}
            >
              <PatIcon className="w-4 h-4" />
              {pat.name}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Diagram */}
        <div className={`rounded-xl border-2 ${p.borderColor} ${p.bgColor} p-6 shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 ${p.accentBg} rounded-lg flex items-center justify-center shadow`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${p.textColor}`}>{p.name}</h3>
              <p className="text-xs text-gray-500">{p.analogy}</p>
            </div>
          </div>
          <div className="bg-white/60 rounded-lg p-4">{renderDiagram()}</div>
          <p className="text-sm text-gray-600 mt-4">{p.tagline}</p>
        </div>

        {/* Trade-offs */}
        <div className="space-y-5">
          {/* Pros */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5">
            <h4 className="text-sm font-bold text-green-700 flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4" /> Advantages
            </h4>
            <ul className="space-y-2">
              {p.pros.map((pro) => (
                <li key={pro} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5">
            <h4 className="text-sm font-bold text-red-700 flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4" /> Trade-offs
            </h4>
            <ul className="space-y-2">
              {p.cons.map((con) => (
                <li key={con} className="flex items-start gap-2 text-sm text-gray-700">
                  <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  {con}
                </li>
              ))}
            </ul>
          </div>

          {/* Best For */}
          <div className={`rounded-xl border-2 ${p.borderColor} ${p.bgColor} p-5`}>
            <h4 className={`text-sm font-bold ${p.textColor} flex items-center gap-2 mb-2`}>
              <Zap className="w-4 h-4" /> Best For
            </h4>
            <p className="text-sm text-gray-700">{p.bestFor}</p>
          </div>

          {/* Quick Comparison Radar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Quick Comparison</h4>
            {[
              {
                label: 'Simplicity',
                monolithic: 5,
                layered: 4,
                microservices: 2,
                'event-driven': 2,
                hexagonal: 2,
              },
              {
                label: 'Scalability',
                monolithic: 2,
                layered: 2,
                microservices: 5,
                'event-driven': 5,
                hexagonal: 3,
              },
              {
                label: 'Flexibility',
                monolithic: 1,
                layered: 2,
                microservices: 5,
                'event-driven': 4,
                hexagonal: 5,
              },
              {
                label: 'Testability',
                monolithic: 3,
                layered: 3,
                microservices: 4,
                'event-driven': 3,
                hexagonal: 5,
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="mb-2 last:mb-0"
                onMouseEnter={() => setHoveredTrait(metric.label)}
                onMouseLeave={() => setHoveredTrait(null)}
              >
                <div className="flex items-center justify-between text-xs text-gray-600 mb-0.5">
                  <span className={hoveredTrait === metric.label ? 'font-bold text-gray-900' : ''}>
                    {metric.label}
                  </span>
                  <span className="font-semibold">{metric[selected]}/5</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${p.accentBg}`}
                    style={{ width: `${(metric[selected] / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitecturePatterns2D;
