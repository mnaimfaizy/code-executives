import React, { lazy, Suspense, useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { LoadingFallback } from '../../../../shared/components/feedback/LoadingFallback';
import { Shield, Eye } from 'lucide-react';

const PKCEFlowViz = lazy(() => import('../visualizations/2d/PKCEFlow2D'));
const BFFPatternViz = lazy(() => import('../visualizations/2d/BFFPattern2D'));
const TokenExchangeViz = lazy(() => import('../visualizations/2d/TokenExchange2D'));
const AuthMethodComparison = lazy(() => import('../visualizations/2d/AuthMethodComparison2D'));
const ZeroTrustViz = lazy(() => import('../visualizations/2d/ZeroTrust2D'));

type VizKey = 'pkce' | 'bff' | 'tokenexchange' | 'comparison' | 'zerotrust';

const Visualization: React.FC = () => {
  const [activeViz, setActiveViz] = useState<VizKey>('pkce');

  const vizOptions: Array<{ key: VizKey; label: string; desc: string }> = [
    { key: 'pkce', label: 'PKCE Auth Flow', desc: 'Step-through OAuth 2.0 PKCE flow' },
    { key: 'bff', label: 'BFF Pattern', desc: 'Backend for Frontend token architecture' },
    {
      key: 'tokenexchange',
      label: 'AI Agent Token Exchange',
      desc: 'RFC 8693 delegated auth for agents',
    },
    { key: 'comparison', label: 'Auth Method Security', desc: 'Compare authentication methods' },
    { key: 'zerotrust', label: 'Zero Trust Access', desc: 'Continuous verification model' },
  ];

  const vizComponents: Record<VizKey, React.ComponentType> = {
    pkce: PKCEFlowViz,
    bff: BFFPatternViz,
    tokenexchange: TokenExchangeViz,
    comparison: AuthMethodComparison,
    zerotrust: ZeroTrustViz,
  };

  const ActiveComponent = vizComponents[activeViz];

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-amber-100 p-4 rounded-full">
          <Eye className="w-16 h-16 text-amber-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Interactive Visualizations</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Explore authentication and authorization flows through animated, step-by-step interactive
        diagrams.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Viz Selector */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          <Shield className="w-6 h-6 inline mr-2 text-amber-600" />
          Choose a Visualization
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          {vizOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActiveViz(opt.key)}
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                activeViz === opt.key
                  ? 'border-amber-500 bg-amber-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <h4
                className={`text-xs font-bold ${activeViz === opt.key ? 'text-amber-800' : 'text-gray-700'}`}
              >
                {opt.label}
              </h4>
              <p className="text-[10px] text-gray-500 mt-1 leading-tight">{opt.desc}</p>
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          <Suspense fallback={<LoadingFallback variant="skeleton-page" />}>
            <ActiveComponent />
          </Suspense>
        </div>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="auth" hero={heroContent} mainContent={mainContent} />;
};

export default Visualization;
