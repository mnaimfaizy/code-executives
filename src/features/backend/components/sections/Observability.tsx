import React, { useState } from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { FileText, BarChart3, Route, Eye, ArrowRight } from 'lucide-react';

type Pillar = 'logs' | 'metrics' | 'traces';

interface PillarInfo {
  id: Pillar;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  analogy: string;
  description: string;
  examples: string[];
  tools: string[];
}

const pillars: PillarInfo[] = [
  {
    id: 'logs',
    title: 'Logs',
    icon: <FileText className="w-6 h-6" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    analogy:
      "A diary or a flight's black box recorder. They capture every important event that happens in the system, timestamped and detailed. When something goes wrong at 3 AM, logs are the first place the on-call engineer looks — 'What happened right before the crash?'",
    description:
      'Structured or unstructured text records of discrete events. Include timestamps, severity levels (DEBUG, INFO, WARN, ERROR, FATAL), source context (service name, request ID), and human-readable messages. Modern practice favors structured JSON logs (machine-parseable) over plain text. Log aggregation platforms (ELK, Loki) centralize logs from hundreds of services into a searchable index.',
    examples: [
      '[2024-01-15 14:32:01] INFO: User 12345 logged in',
      '[2024-01-15 14:32:05] ERROR: Payment failed for order 67890 — timeout',
      '[2024-01-15 14:32:06] WARN: Database connection pool at 90% capacity',
    ],
    tools: [
      'ELK Stack (Elasticsearch, Logstash, Kibana)',
      'Fluentd',
      'Datadog Logs',
      'Loki + Grafana',
    ],
  },
  {
    id: 'metrics',
    title: 'Metrics',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    analogy:
      "A car dashboard. You don't need to understand the entire engine — you just glance at the speedometer, fuel gauge, and temperature warning light. Metrics give you a real-time health overview: is the system fast? Is it error-free? Is it running out of resources?",
    description:
      'Numeric measurements collected over time: request rates, error percentages, latency distributions (p50, p95, p99), CPU/memory usage, queue depths. Stored as time-series data, ideal for dashboards and automated alerting ("page me if error rate > 5%"). Far cheaper to store than logs because metrics are pre-aggregated numbers, not verbose text. The RED method (Rate, Errors, Duration) and USE method (Utilization, Saturation, Errors) are standard frameworks for choosing what to measure.',
    examples: [
      'http_requests_total{method="GET", status="200"} → 1,234,567',
      'api_latency_p99 → 142ms',
      'cpu_usage_percent → 68%',
      'error_rate_5m → 0.3%',
    ],
    tools: ['Prometheus + Grafana', 'Datadog Metrics', 'CloudWatch', 'StatsD'],
  },
  {
    id: 'traces',
    title: 'Traces',
    icon: <Route className="w-6 h-6" />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    analogy:
      'A GPS tracker on a delivery package. You can see the complete journey — from warehouse to sorting facility to delivery truck to doorstep — with timing at each stop. In microservices, traces follow a single request across every service it touches, showing exactly where the 2-second delay is hiding.',
    description:
      'Distributed traces capture the complete journey of a request across multiple services. Each "span" represents work done by one service (API Gateway: 12ms, Auth: 34ms, DB Query: 89ms). Spans are linked by a shared trace ID propagated via HTTP headers. Essential for diagnosing the #1 microservices problem: "the request is slow, but which of the 47 services is the bottleneck?" OpenTelemetry auto-instruments most frameworks to generate traces with zero code changes.',
    examples: [
      'TraceID: abc123 — Total: 245ms',
      '  ├─ API Gateway (12ms)',
      '  ├─ Auth Service (34ms)',
      '  ├─ Product Service (89ms)',
      '  │   └─ Database Query (45ms)',
      '  └─ Payment Service (110ms)',
    ],
    tools: ['Jaeger', 'Zipkin', 'OpenTelemetry', 'Datadog APM'],
  },
];

const Observability: React.FC = () => {
  const [activePillar, setActivePillar] = useState<Pillar>('metrics');
  const pillar = pillars.find((p) => p.id === activePillar) || pillars[1];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-zinc-50 rounded-2xl p-8 border border-slate-200 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Eye className="w-8 h-8 text-slate-600" />
          <h1 className="text-4xl font-bold text-gray-900">Observability</h1>
        </div>
        <p className="text-xl text-gray-700 leading-relaxed max-w-4xl">
          If your distributed system is a hospital patient, observability is the collection of
          monitors, blood tests, and charts that let doctors understand what&apos;s happening
          inside. The three pillars — Logs, Metrics, and Traces — work together like a detective
          investigation. <strong>OpenTelemetry</strong> has emerged as the industry-standard
          framework (backed by CNCF) for collecting and exporting all three signals through a
          single, vendor-neutral SDK.
        </p>
      </div>

      {/* Three Pillars Selector */}
      <div className="grid grid-cols-3 gap-4">
        {pillars.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePillar(p.id)}
            className={`p-6 rounded-xl border-2 transition-all duration-300 text-center ${
              activePillar === p.id
                ? `${p.bgColor} ${p.borderColor} shadow-md scale-[1.03]`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div
              className={`flex justify-center mb-3 ${activePillar === p.id ? p.color : 'text-gray-400'}`}
            >
              {p.icon}
            </div>
            <div
              className={`text-lg font-bold ${activePillar === p.id ? p.color : 'text-gray-700'}`}
            >
              {p.title}
            </div>
          </button>
        ))}
      </div>

      {/* Pillar Relationship Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">The Three Pillars</h2>
        <div className="flex justify-center">
          <svg viewBox="0 0 400 320" className="w-full max-w-md">
            {/* Connecting lines */}
            <line
              x1="200"
              y1="60"
              x2="80"
              y2="240"
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <line
              x1="200"
              y1="60"
              x2="320"
              y2="240"
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <line
              x1="80"
              y1="240"
              x2="320"
              y2="240"
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            {/* Center label */}
            <text x="200" y="165" textAnchor="middle" className="text-xs fill-gray-400 font-medium">
              Observability
            </text>

            {/* Metrics (top) */}
            <g className="cursor-pointer" onClick={() => setActivePillar('metrics')}>
              <circle
                cx="200"
                cy="50"
                r="36"
                fill={activePillar === 'metrics' ? '#DBEAFE' : '#F3F4F6'}
                stroke={activePillar === 'metrics' ? '#3B82F6' : '#D1D5DB'}
                strokeWidth="2"
              />
              <text
                x="200"
                y="46"
                textAnchor="middle"
                className="text-lg"
                dominantBaseline="middle"
              >
                📊
              </text>
              <text
                x="200"
                y="100"
                textAnchor="middle"
                className={`text-sm font-semibold ${activePillar === 'metrics' ? 'fill-blue-700' : 'fill-gray-500'}`}
              >
                Metrics
              </text>
            </g>

            {/* Logs (bottom-left) */}
            <g className="cursor-pointer" onClick={() => setActivePillar('logs')}>
              <circle
                cx="80"
                cy="240"
                r="36"
                fill={activePillar === 'logs' ? '#FFF7ED' : '#F3F4F6'}
                stroke={activePillar === 'logs' ? '#F97316' : '#D1D5DB'}
                strokeWidth="2"
              />
              <text
                x="80"
                y="236"
                textAnchor="middle"
                className="text-lg"
                dominantBaseline="middle"
              >
                📝
              </text>
              <text
                x="80"
                y="290"
                textAnchor="middle"
                className={`text-sm font-semibold ${activePillar === 'logs' ? 'fill-orange-700' : 'fill-gray-500'}`}
              >
                Logs
              </text>
            </g>

            {/* Traces (bottom-right) */}
            <g className="cursor-pointer" onClick={() => setActivePillar('traces')}>
              <circle
                cx="320"
                cy="240"
                r="36"
                fill={activePillar === 'traces' ? '#ECFDF5' : '#F3F4F6'}
                stroke={activePillar === 'traces' ? '#10B981' : '#D1D5DB'}
                strokeWidth="2"
              />
              <text
                x="320"
                y="236"
                textAnchor="middle"
                className="text-lg"
                dominantBaseline="middle"
              >
                🗺️
              </text>
              <text
                x="320"
                y="290"
                textAnchor="middle"
                className={`text-sm font-semibold ${activePillar === 'traces' ? 'fill-emerald-700' : 'fill-gray-500'}`}
              >
                Traces
              </text>
            </g>
          </svg>
        </div>
      </ThemeCard>

      {/* Active Pillar Detail */}
      <ThemeCard>
        <div className="flex items-center space-x-4 mb-6">
          <div
            className={`w-14 h-14 rounded-xl ${pillar.bgColor} flex items-center justify-center ${pillar.color}`}
          >
            {pillar.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{pillar.title}</h2>
          </div>
        </div>

        <p className="text-gray-700 mb-6 leading-relaxed">{pillar.description}</p>

        {/* Analogy */}
        <div className={`${pillar.bgColor} rounded-xl p-5 mb-6 border ${pillar.borderColor}`}>
          <h3 className="font-semibold text-gray-800 mb-2">💡 Analogy</h3>
          <p className="text-gray-700 italic">&ldquo;{pillar.analogy}&rdquo;</p>
        </div>

        {/* Examples */}
        <div className="bg-gray-900 rounded-xl p-5 mb-6">
          <div className="text-xs text-gray-400 mb-3">Examples</div>
          <div className="space-y-1">
            {pillar.examples.map((ex, i) => (
              <div key={i} className="text-green-400 text-sm font-mono">
                {ex}
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">🛠️ Popular Tools</h3>
          <div className="flex flex-wrap gap-2">
            {pillar.tools.map((tool, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${pillar.bgColor} ${pillar.color} border ${pillar.borderColor}`}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </ThemeCard>

      {/* Observability in Practice */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Observability in Practice</h2>
        <p className="text-gray-600 mb-6">
          When an incident occurs, the three pillars work together like a detective investigation:
        </p>
        <div className="space-y-4">
          {[
            {
              step: 1,
              pillar: 'Metrics',
              action: 'Alert fires: error rate exceeds 5%',
              color: 'bg-blue-100 text-blue-700 border-blue-200',
            },
            {
              step: 2,
              pillar: 'Logs',
              action: 'Search for ERROR-level logs around the alert timestamp',
              color: 'bg-orange-100 text-orange-700 border-orange-200',
            },
            {
              step: 3,
              pillar: 'Traces',
              action: 'Follow a failing request across services to find the bottleneck',
              color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            },
            {
              step: 4,
              pillar: 'Resolution',
              action: 'Identify root cause, deploy fix, verify metrics return to normal',
              color: 'bg-slate-100 text-slate-700 border-slate-200',
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
                {item.step}
              </div>
              {i < 3 && (
                <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0 hidden md:block" />
              )}
              <div className={`flex-1 ${item.color} border rounded-lg px-4 py-3`}>
                <span className="font-semibold">{item.pillar}</span>
                <span className="mx-2">→</span>
                <span className="text-sm">{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>
    </div>
  );
};

export default Observability;
