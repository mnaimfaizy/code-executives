import React from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CloudArchitectureViz from '../visualizations/2d/CloudArchitectureViz';
import { Network, Lightbulb, Shield, Zap } from 'lucide-react';

const CloudArchitecture: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 rounded-2xl p-8 border border-sky-100 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-sky-100 p-3 rounded-full">
            <Network className="w-8 h-8 text-sky-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cloud Architecture Patterns</h1>
            <p className="text-gray-600">Monolith, Microservices, Serverless &amp; More</p>
          </div>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">
          Architecture patterns define how applications are structured, deployed, and scaled.
          Choosing the right pattern depends on your team size, scale requirements, and operational
          maturity — there is no one-size-fits-all solution.
        </p>
      </div>

      {/* Interactive Architecture Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive Architecture Diagrams</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Click each pattern to see an interactive architecture diagram with trade-offs and
          real-world examples.
        </p>
        <CloudArchitectureViz />
      </ThemeCard>

      {/* Architecture Evolution */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">The Architecture Evolution</h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-sky-200 hidden md:block" />

          {[
            {
              era: '2000s',
              title: 'Monolithic Architecture',
              desc: 'One big application. Simple to develop and deploy, but hard to scale parts independently. A change anywhere requires redeploying everything.',
              color: 'sky',
              icon: '🏢',
            },
            {
              era: '2010s',
              title: 'Microservices Architecture',
              desc: 'Break the monolith into small, independent services. Each team owns their service, deploys independently, and can use different tech stacks.',
              color: 'cyan',
              icon: '🧩',
            },
            {
              era: '2015+',
              title: 'Serverless / Event-Driven',
              desc: 'Write functions, not servers. The cloud provider handles all infrastructure. Functions trigger from events — pay only when code runs.',
              color: 'teal',
              icon: '⚡',
            },
            {
              era: '2020+',
              title: 'Edge Computing',
              desc: 'Push computation to the network edge, closer to users. CDN workers execute code in 300+ locations globally for ultra-low latency.',
              color: 'emerald',
              icon: '🌍',
            },
          ].map((item, i) => (
            <div key={i} className="relative flex gap-6 mb-6 last:mb-0">
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full bg-${item.color}-100 border-2 border-${item.color}-400 flex items-center justify-center text-xl`}
                >
                  {item.icon}
                </div>
              </div>
              <div
                className={`bg-${item.color}-50 rounded-xl p-5 border border-${item.color}-200 flex-1`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-xs font-bold text-${item.color}-700 bg-${item.color}-200 px-2 py-0.5 rounded-full`}
                  >
                    {item.era}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Cloud Design Patterns */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-sky-600" /> Cloud Design Patterns
        </h2>
        <p className="text-gray-600 mb-4">
          Patterns from Microsoft Azure Architecture Center and AWS Well-Architected Framework:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              name: 'Cache-Aside',
              desc: 'Load data into cache on demand. If not in cache, read from store, place in cache, return. Dramatically reduces database load.',
              useCase: 'High-read workloads with rarely changing data',
            },
            {
              name: 'Circuit Breaker',
              desc: 'Stop calling a failing service. After N failures, \"open\" the circuit and return fallback. Periodically test if the service recovered.',
              useCase: 'Preventing cascade failures in distributed systems',
            },
            {
              name: 'Sidecar',
              desc: 'Deploy helper components alongside your main service (logging, monitoring, proxying). The main service stays focused on business logic.',
              useCase: 'Service mesh, observability, security policies',
            },
            {
              name: 'Strangler Fig',
              desc: 'Gradually migrate from a monolith by routing traffic to new microservices one endpoint at a time. The old system shrinks until it disappears.',
              useCase: 'Incremental monolith-to-microservices migration',
            },
            {
              name: 'CQRS',
              desc: 'Separate read and write operations into different models. Reads can use denormalized views optimized for queries, writes enforce invariants.',
              useCase: 'Complex domains with different read/write patterns',
            },
            {
              name: 'Valet Key',
              desc: 'Give clients a limited-access token to access resources directly (e.g., pre-signed S3 URLs) instead of proxying all traffic through your server.',
              useCase: 'File uploads, media streaming, CDN access',
            },
          ].map((pattern, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">{pattern.name}</h4>
              <p className="text-sm text-gray-700 mb-2 leading-relaxed">{pattern.desc}</p>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-sky-500 flex-shrink-0" />
                <span className="text-xs text-sky-700 font-medium">{pattern.useCase}</span>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Decision Guide */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Architecture Decision Guide</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-sky-200">
                <th className="text-left py-2 px-3 text-gray-900">Factor</th>
                <th className="text-left py-2 px-3 text-gray-900">Monolith</th>
                <th className="text-left py-2 px-3 text-gray-900">Microservices</th>
                <th className="text-left py-2 px-3 text-gray-900">Serverless</th>
              </tr>
            </thead>
            <tbody>
              {[
                { factor: 'Team Size', mono: '1–10', micro: '10–100+', server: 'Any' },
                {
                  factor: 'Startup Speed',
                  mono: 'Fast ⚡',
                  micro: 'Slow 🐢',
                  server: 'Very Fast ⚡⚡',
                },
                { factor: 'Scaling', mono: 'Vertical', micro: 'Horizontal', server: 'Auto' },
                { factor: 'Complexity', mono: 'Low', micro: 'High', server: 'Medium' },
                { factor: 'Cost at Scale', mono: 'Medium', micro: 'Optimized', server: 'Variable' },
                { factor: 'Vendor Lock-in', mono: 'None', micro: 'Low', server: 'High' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-200 even:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-900">{row.factor}</td>
                  <td className="py-2 px-3 text-gray-700">{row.mono}</td>
                  <td className="py-2 px-3 text-gray-700">{row.micro}</td>
                  <td className="py-2 px-3 text-gray-700">{row.server}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
              Think of it like building with LEGOs 🧱
            </h3>
            <p className="text-gray-700 leading-relaxed">
              A <strong>monolith</strong> is like one giant LEGO structure — if one piece breaks,
              the whole thing might fall apart. <strong>Microservices</strong> are like separate
              LEGO sets (spaceship, castle, car) — each works independently.{' '}
              <strong>Serverless</strong> is like a magical LEGO table where pieces assemble
              themselves when someone walks by and disappear when nobody&apos;s watching!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudArchitecture;
