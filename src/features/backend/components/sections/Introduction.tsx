import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import { Server, Shield, Zap, Globe, CheckCircle, Database, Network, Layers } from 'lucide-react';

const Introduction: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    const baseUrl = '/backend?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  const stats = [
    {
      value: '9',
      label: 'Deep-Dive Sections',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      value: '6+',
      label: 'Interactive Visualizations',
      icon: <Network className="w-5 h-5" />,
    },
    {
      value: '<200ms',
      label: 'Response Time Goal',
      icon: <Zap className="w-5 h-5" />,
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-slate-100 p-4 rounded-full">
          <Server className="w-16 h-16 text-slate-700" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Backend Architecture: The Invisible Industrial Complex
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        The digital landscape is supported by a sprawling, sophisticated industrial complex known as
        the backend. While the frontend serves as the storefront, the backend encompasses the
        machinery, logistics, power grids, and foundational logic that allow a single user
        interaction to manifest as a global event.
      </p>
      <StatsGrid stats={stats} colorScheme="slate" />
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-slate-100 text-slate-800 px-4 py-2 rounded-full text-sm font-semibold">
          🏗️ Architecture Patterns
        </span>
        <span className="bg-zinc-100 text-zinc-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔗 API Design
        </span>
        <span className="bg-stone-100 text-stone-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ Resilience & Scale
        </span>
        <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔍 Observability
        </span>
      </div>
    </div>
  );

  const mainContent = (
    <>
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">What is the Backend?</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              The Invisible Infrastructure
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              The backend encompasses everything that happens between a user clicking a button and
              seeing the result. It is the <strong>machinery, logistics, and power grids</strong> of
              the digital world — from database queries and authentication checks to message queues
              and load balancers.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Understanding this invisible infrastructure transforms you from someone who writes
              code into an engineer who designs systems that can serve millions of users reliably.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What You Will Learn</h3>
            <div className="space-y-3">
              {[
                { label: 'Architecture Patterns', desc: 'Monolith → Microservices evolution' },
                { label: 'Resilience Engineering', desc: 'Circuit Breakers, Sagas, Sidecars' },
                { label: 'Database Theory', desc: 'ACID vs BASE, CAP Theorem trade-offs' },
                { label: 'API Design', desc: 'REST, GraphQL, gRPC comparative analysis' },
                { label: 'Real-Time Systems', desc: 'WebSockets, SSE, Webhooks' },
                { label: 'Observability', desc: 'Logs, Metrics, Traces — the three pillars' },
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-slate-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">
                    <strong>{item.label}:</strong> {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-slate-50 to-zinc-50 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Why Backend Knowledge Matters
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-slate-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Build Resilient Systems</h4>
              <p className="text-sm text-gray-600">
                Design systems that gracefully handle failures and recover automatically
              </p>
            </div>
            <div className="text-center">
              <div className="bg-zinc-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-zinc-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Scale Globally</h4>
              <p className="text-sm text-gray-600">
                Architect backend systems that serve millions of users across the globe
              </p>
            </div>
            <div className="text-center">
              <div className="bg-stone-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-stone-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Make Better Trade-offs</h4>
              <p className="text-sm text-gray-600">
                Choose between consistency and availability with deep understanding of CAP
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Your Backend Architecture Journey</h3>
        <p className="text-gray-700 mb-6 leading-relaxed">
          This module takes you from the historical foundations of backend systems through modern
          architectural patterns, resilience engineering, and the end-to-end lifecycle of a
          production request.
        </p>
        <div className="space-y-4">
          {[
            {
              name: 'Backend Evolution',
              description: 'From mainframes to microservices — the history of backend systems',
              completed: true,
              current: false,
            },
            {
              name: 'Architecture Patterns',
              description: 'Monolith, Layered, Microservices, Event-Driven, and Hexagonal patterns',
              completed: true,
              current: false,
            },
            {
              name: 'Resilience Patterns',
              description: 'Circuit Breaker, Sidecar, and Saga patterns for fault tolerance',
              completed: true,
              current: false,
            },
            {
              name: 'Database Theory',
              description: 'ACID vs BASE philosophies and the CAP Theorem',
              completed: true,
              current: false,
            },
            {
              name: 'API Design',
              description: 'REST, GraphQL, and gRPC — evolution of digital communication',
              completed: true,
              current: false,
            },
            {
              name: 'Real-Time Communication',
              description: 'WebSockets, Server-Sent Events, and Webhooks',
              completed: true,
              current: false,
            },
            {
              name: 'Observability',
              description: 'The three pillars: Logs, Metrics, and Traces',
              completed: true,
              current: false,
            },
            {
              name: 'Request Lifecycle',
              description: 'End-to-end journey of a production request',
              completed: false,
              current: true,
            },
            {
              name: 'Visualization',
              description: 'Interactive diagrams of all backend concepts',
              completed: true,
              current: false,
            },
          ].map((step, index) => (
            <div
              key={index}
              className="group flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              onClick={() =>
                step.completed || step.current ? navigateToSection(step.name) : undefined
              }
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                  step.current
                    ? 'bg-slate-500 text-white shadow-md'
                    : step.completed
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`font-semibold transition-colors duration-200 ${
                    step.current
                      ? 'text-slate-800'
                      : step.completed
                        ? 'text-green-800'
                        : 'text-gray-700'
                  }`}
                >
                  {step.name}
                  {step.current && <span className="ml-2 text-slate-600">(In Progress)</span>}
                  {step.completed && <span className="ml-2 text-green-600">✓ Completed</span>}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              {(step.completed || step.current) && (
                <div className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Explore →
                </div>
              )}
            </div>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">🏗️ Backend Modules</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Backend Evolution"
            description="From mainframes to containers"
            colorScheme="slate"
            onClick={() => navigateToSection('Backend Evolution')}
          />
          <NavigationCard
            title="Architecture Patterns"
            description="Monolith, Microservices & more"
            colorScheme="slate"
            onClick={() => navigateToSection('Architecture Patterns')}
          />
          <NavigationCard
            title="Resilience Patterns"
            description="Circuit Breaker, Saga, Sidecar"
            colorScheme="slate"
            onClick={() => navigateToSection('Resilience Patterns')}
          />
          <NavigationCard
            title="Database Theory"
            description="ACID vs BASE & CAP Theorem"
            colorScheme="slate"
            onClick={() => navigateToSection('Database Theory')}
          />
          <NavigationCard
            title="API Design"
            description="REST, GraphQL, gRPC compared"
            colorScheme="slate"
            onClick={() => navigateToSection('API Design')}
          />
          <NavigationCard
            title="Request Lifecycle"
            description="End-to-end journey of a request"
            colorScheme="slate"
            onClick={() => navigateToSection('Request Lifecycle')}
          />
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout
        section="backend"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready to Explore the Invisible Infrastructure?"
        description="Dive into interactive visualizations that reveal how backend systems actually work — from a single click to a global response in under 200ms."
        buttonText="Start with Backend Evolution"
        onButtonClick={() => navigateToSection('Backend Evolution')}
        colorScheme="slate"
      />
    </>
  );
};

export default Introduction;
