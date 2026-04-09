import React, { Suspense, useState } from 'react';
import CTASection from '../../../../components/shared/CTASection';
import { Eye, Layers, Zap, Globe, ArrowRight } from 'lucide-react';

const RequestJourney2D = React.lazy(() => import('../visualizations/2d/RequestJourney2D'));
const CircuitBreaker2D = React.lazy(() => import('../visualizations/2d/CircuitBreaker2D'));
const ArchitecturePatterns2D = React.lazy(
  () => import('../visualizations/2d/ArchitecturePatterns2D')
);
const APIEvolution2D = React.lazy(() => import('../visualizations/2d/APIEvolution2D'));

const vizTabs = [
  { key: 'request', label: 'Request Lifecycle', icon: ArrowRight },
  { key: 'circuit', label: 'Circuit Breaker', icon: Zap },
  { key: 'architecture', label: 'Architecture Patterns', icon: Layers },
  { key: 'api', label: 'API Evolution', icon: Globe },
] as const;

type VizTab = (typeof vizTabs)[number]['key'];

const fallback = (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-500" />
  </div>
);

const Visualization: React.FC = () => {
  const [active, setActive] = useState<VizTab>('request');

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-zinc-50 rounded-2xl p-8 border border-slate-200 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Eye className="w-8 h-8 text-slate-600" />
          <h1 className="text-4xl font-bold text-gray-900">Interactive Visualizations</h1>
        </div>
        <p className="text-xl text-gray-700 leading-relaxed max-w-4xl">
          Backend concepts can feel abstract — invisible processes communicating over networks.
          These interactive visualizations make the invisible visible. Choose a topic below to
          explore.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {vizTabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                active === tab.key
                  ? 'bg-slate-700 text-white border-transparent shadow-lg scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:shadow-md'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Visualization */}
      <Suspense fallback={fallback}>
        {active === 'request' && <RequestJourney2D />}
        {active === 'circuit' && <CircuitBreaker2D />}
        {active === 'architecture' && <ArchitecturePatterns2D />}
        {active === 'api' && <APIEvolution2D />}
      </Suspense>

      {/* CTA */}
      <CTASection
        title="Start Your Backend Journey"
        description="Begin with the Introduction to understand the big picture, then dive into any section that interests you."
        buttonText="Start from the Beginning"
        onButtonClick={() => {
          window.location.href = '/backend?section=Introduction';
        }}
        colorScheme="slate"
      />
    </div>
  );
};

export default Visualization;
