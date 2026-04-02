import React, { useState } from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import {
  Activity,
  Lightbulb,
  Eye,
  BarChart3,
  Bell,
  Search,
  LineChart,
  AlertTriangle,
} from 'lucide-react';

const pillars = [
  {
    title: 'Metrics',
    icon: BarChart3,
    color: 'sky',
    description:
      'Numeric measurements collected over time — CPU usage, request latency, error rates, memory consumption.',
    tools: ['Prometheus', 'Grafana', 'Datadog', 'CloudWatch'],
    examples: [
      { metric: 'p99 latency', value: '< 200ms', status: 'good' },
      { metric: 'Error rate', value: '< 0.1%', status: 'good' },
      { metric: 'CPU usage', value: '< 70%', status: 'warning' },
      { metric: 'Memory', value: '< 80%', status: 'good' },
    ],
  },
  {
    title: 'Logs',
    icon: Search,
    color: 'cyan',
    description:
      'Timestamped text records of discrete events — errors, warnings, info messages, audit trails.',
    tools: ['ELK Stack', 'Loki + Grafana', 'Splunk', 'CloudWatch Logs'],
    examples: [
      { level: 'INFO', msg: 'User login successful', time: '14:23:01' },
      { level: 'WARN', msg: 'DB query slow (2.3s)', time: '14:23:15' },
      { level: 'ERROR', msg: 'Payment gateway timeout', time: '14:23:22' },
      { level: 'INFO', msg: 'Cache hit ratio: 94%', time: '14:23:30' },
    ],
  },
  {
    title: 'Traces',
    icon: LineChart,
    color: 'teal',
    description:
      'Follow a single request as it travels through multiple services — see where time is spent and where failures occur.',
    tools: ['Jaeger', 'Zipkin', 'AWS X-Ray', 'OpenTelemetry'],
    spans: [
      { service: 'API Gateway', duration: 5, color: 'sky' },
      { service: 'Auth Service', duration: 12, color: 'cyan' },
      { service: 'Order Service', duration: 45, color: 'teal' },
      { service: 'Payment API', duration: 120, color: 'rose' },
      { service: 'DB Write', duration: 8, color: 'emerald' },
    ],
  },
];

const Observability: React.FC = () => {
  const [activePillar, setActivePillar] = useState(0);
  const pillar = pillars[activePillar];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 rounded-2xl p-8 border border-sky-100 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-sky-100 p-3 rounded-full">
            <Eye className="w-8 h-8 text-sky-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Observability &amp; Monitoring</h1>
            <p className="text-gray-600">Metrics, Logs, Traces &amp; the Future of Software</p>
          </div>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">
          Observability is the ability to understand the internal state of your system by examining
          its external outputs. In complex distributed systems, you can&apos;t debug by reading code
          alone — you need Metrics, Logs, and Traces to understand what&apos;s happening in
          production.
        </p>
      </div>

      {/* Three Pillars Interactive */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          The Three Pillars of Observability
        </h2>
        <div className="flex gap-2 mb-6">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <button
                key={i}
                onClick={() => setActivePillar(i)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activePillar === i
                    ? `bg-${p.color}-600 text-white shadow-lg`
                    : `bg-${p.color}-50 text-${p.color}-700 border border-${p.color}-200 hover:bg-${p.color}-100`
                }`}
              >
                <Icon className="w-4 h-4" />
                {p.title}
              </button>
            );
          })}
        </div>

        <div className={`bg-${pillar.color}-50 rounded-xl p-6 border border-${pillar.color}-200`}>
          <p className="text-gray-700 mb-4 leading-relaxed">{pillar.description}</p>

          {/* Metrics View */}
          {activePillar === 0 && pillar.examples && 'metric' in pillar.examples[0] && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(pillar.examples as Array<{ metric: string; value: string; status: string }>).map(
                (m, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-3 border border-gray-200 text-center"
                  >
                    <div
                      className={`text-lg font-bold ${m.status === 'good' ? 'text-emerald-600' : 'text-amber-600'}`}
                    >
                      {m.value}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{m.metric}</div>
                    <div
                      className={`w-2 h-2 rounded-full mx-auto mt-2 ${m.status === 'good' ? 'bg-emerald-400' : 'bg-amber-400'}`}
                    />
                  </div>
                )
              )}
            </div>
          )}

          {/* Logs View */}
          {activePillar === 1 && pillar.examples && 'level' in pillar.examples[0] && (
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
              {(pillar.examples as Array<{ level: string; msg: string; time: string }>).map(
                (log, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-gray-500">{log.time}</span>
                    <span
                      className={`font-bold ${
                        log.level === 'ERROR'
                          ? 'text-red-400'
                          : log.level === 'WARN'
                            ? 'text-yellow-400'
                            : 'text-cyan-400'
                      }`}
                    >
                      [{log.level.padEnd(5)}]
                    </span>
                    <span className="text-gray-300">{log.msg}</span>
                  </div>
                )
              )}
            </div>
          )}

          {/* Traces View */}
          {activePillar === 2 && pillar.spans && (
            <div className="space-y-2">
              {pillar.spans.map((span, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-700 w-24 text-right flex-shrink-0 font-medium">
                    {span.service}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className={`bg-${span.color}-500 h-full rounded-full flex items-center px-2 transition-all duration-500`}
                      style={{ width: `${Math.min((span.duration / 190) * 100, 100)}%` }}
                    >
                      <span className="text-white text-xs font-medium">{span.duration}ms</span>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-2">
                Total trace duration: {pillar.spans.reduce((sum, s) => sum + s.duration, 0)}ms
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {pillar.tools.map((tool, i) => (
              <span
                key={i}
                className={`bg-white px-3 py-1 rounded-full text-xs font-medium text-${pillar.color}-700 border border-${pillar.color}-200`}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </ThemeCard>

      {/* Alerting */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-6 h-6 text-sky-600" /> Alerting Best Practices
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Good alerting is critical — too many alerts cause &quot;alert fatigue&quot; (people ignore
          them), too few means missing real incidents.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h4 className="font-semibold text-emerald-800 mb-2">✅ Do</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Alert on symptoms, not causes (high latency, not high CPU)</li>
              <li>• Use SLO-based alerting (error budget burn rate)</li>
              <li>• Include runbook links in every alert</li>
              <li>• Page only for customer-impacting issues</li>
            </ul>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">❌ Don&apos;t</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Alert on every metric threshold</li>
              <li>• Page for non-urgent issues at 3 AM</li>
              <li>• Create alerts without clear ownership</li>
              <li>• Ignore alert fatigue (it causes real outages)</li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* Incident Management */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" /> Incident Management Lifecycle
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            {
              step: '1',
              phase: 'Detect',
              desc: 'Alert fires, on-call engineer responds',
              emoji: '🔔',
            },
            {
              step: '2',
              phase: 'Triage',
              desc: 'Assess severity, assign incident commander',
              emoji: '🏥',
            },
            {
              step: '3',
              phase: 'Mitigate',
              desc: 'Stop the bleeding — rollback, scale, failover',
              emoji: '🛡️',
            },
            { step: '4', phase: 'Resolve', desc: 'Fix root cause, verify recovery', emoji: '🔧' },
            { step: '5', phase: 'Learn', desc: 'Blameless postmortem, action items', emoji: '📝' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
              <span className="text-2xl">{item.emoji}</span>
              <h4 className="font-bold text-gray-900 mt-2 text-sm">{item.phase}</h4>
              <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Future of Software Delivery */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-sky-600" /> The Future of Software Delivery
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          DevOps continues to evolve. Here are the trends shaping the next decade of software
          delivery:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              trend: 'Platform Engineering',
              desc: 'Internal developer platforms replace ad-hoc DevOps tooling with self-service golden paths.',
              maturity: 'Growing Rapidly',
            },
            {
              trend: 'AI-Powered Operations (AIOps)',
              desc: 'ML models predict outages, auto-remediate issues, and optimize resource allocation.',
              maturity: 'Emerging',
            },
            {
              trend: 'FinOps',
              desc: 'Financial accountability for cloud spend — engineering teams own their cloud costs.',
              maturity: 'Established',
            },
            {
              trend: 'GitOps Everything',
              desc: 'Git as the single source of truth for infrastructure, policies, and configuration.',
              maturity: 'Mainstream',
            },
            {
              trend: 'Edge Computing',
              desc: 'Push compute to 300+ global edge locations for sub-10ms latency worldwide.',
              maturity: 'Growing',
            },
            {
              trend: 'Green Computing',
              desc: 'Carbon-aware scheduling — run batch jobs when the grid uses renewable energy.',
              maturity: 'Emerging',
            },
          ].map((item, i) => (
            <div key={i} className="bg-sky-50 rounded-xl p-4 border border-sky-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900">{item.trend}</h4>
                <span className="text-xs bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full font-medium">
                  {item.maturity}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* DORA Metrics */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          DORA Metrics — Measuring DevOps Success
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          The DORA (DevOps Research and Assessment) team identified 4 key metrics that predict
          software delivery performance:
        </p>
        <div className="grid md:grid-cols-4 gap-3">
          {[
            {
              metric: 'Deployment Frequency',
              elite: 'Multiple/day',
              low: 'Monthly',
              desc: 'How often you deploy to production',
            },
            {
              metric: 'Lead Time',
              elite: '< 1 hour',
              low: '> 6 months',
              desc: 'Time from commit to production',
            },
            {
              metric: 'Change Failure Rate',
              elite: '< 5%',
              low: '> 46%',
              desc: '% of deployments causing failures',
            },
            {
              metric: 'MTTR',
              elite: '< 1 hour',
              low: '> 1 week',
              desc: 'Time to restore service after an incident',
            },
          ].map((m, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-bold text-gray-900 text-sm mb-2">{m.metric}</h4>
              <p className="text-xs text-gray-600 mb-3">{m.desc}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-gray-700">Elite: {m.elite}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-xs text-gray-700">Low: {m.low}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* ELI10 */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">
              Think of it like a doctor&apos;s checkup 🏥
            </h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Metrics</strong> are your vitals — heart rate, temperature, blood pressure
              (the numbers). <strong>Logs</strong> are your medical history — what happened and
              when. <strong>Traces</strong> are like following a single blood cell through your body
              to see where it gets stuck. Together, they help the doctor (you!) figure out if the
              patient (your app) is healthy or needs treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Observability;
