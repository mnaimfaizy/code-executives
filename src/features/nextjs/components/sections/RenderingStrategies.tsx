import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';
import RenderingTimeline2D from '../visualizations/2d/RenderingTimeline2D';
import StrategySelector from '../visualizations/2d/StrategySelector';

const RenderingStrategies: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/nextjs?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  const [selectedStrategy, setSelectedStrategy] = useState<'ssr' | 'ssg' | 'csr' | 'isr'>('ssr');

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Rendering Strategies in Next.js</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Choose the perfect rendering approach for each page - from instant static sites to dynamic
          server-rendered content
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '4', label: 'Rendering strategies' },
          { value: 'Performance', label: 'Optimized per use case' },
          { value: 'SEO', label: 'Search engine friendly' },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  // Main content
  const mainContent = (
    <>
      {/* What is Rendering */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">⚡</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">The Rendering Revolution</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Traditional React applications rely on <strong>Client-Side Rendering (CSR)</strong>,
            where the browser downloads a minimal HTML shell and JavaScript bundle, then renders the
            entire application client-side.
          </p>
          <p>
            Next.js breaks this paradigm by offering{' '}
            <strong>four different rendering strategies</strong>, each optimized for specific use
            cases. You can choose the perfect approach for each page, balancing performance, SEO,
            and user experience.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800">
              <strong>Key Insight:</strong> The best rendering strategy depends on your content's
              characteristics: how often it changes, how important SEO is, and how quickly users
              need to see it.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Strategy Selector */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Interactive Strategy Explorer</h3>
        <p className="text-gray-700 mb-6">
          Select a rendering strategy below to see how it works, when to use it, and its performance
          characteristics.
        </p>
        <StrategySelector
          selectedStrategy={selectedStrategy}
          onStrategyChange={setSelectedStrategy}
        />
      </ThemeCard>

      {/* Strategy Details */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Strategy Deep Dive</h3>
        <div className="space-y-6">
          {selectedStrategy === 'csr' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🌐</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Client-Side Rendering (CSR)
                  </h4>
                  <p className="text-sm text-gray-600">Traditional React approach</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">How it works:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Browser receives minimal HTML</li>
                    <li>• JavaScript downloads and executes</li>
                    <li>• React renders components client-side</li>
                    <li>• Content appears after hydration</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Best for:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Highly interactive dashboards</li>
                    <li>• User-specific content</li>
                    <li>• Applications where SEO isn't critical</li>
                    <li>• Real-time data updates</li>
                  </ul>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-semibold text-yellow-900 mb-2">⚠️ Trade-offs:</h5>
                <p className="text-sm text-yellow-800">
                  Poor initial load performance and SEO. Users see a blank page while JavaScript
                  loads.
                </p>
              </div>
            </div>
          )}

          {selectedStrategy === 'ssr' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏭</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Server-Side Rendering (SSR)
                  </h4>
                  <p className="text-sm text-gray-600">Fresh content on every request</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">How it works:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Server generates HTML for each request</li>
                    <li>• Includes fresh data and user context</li>
                    <li>• Browser receives complete HTML</li>
                    <li>• JavaScript hydrates for interactivity</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Best for:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• E-commerce product pages</li>
                    <li>• Personalized dashboards</li>
                    <li>• Real-time data (news, stocks)</li>
                    <li>• A/B testing pages</li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-900 mb-2">💡 When to choose SSR:</h5>
                <p className="text-sm text-blue-800">
                  Content changes frequently and needs to be fresh for each user. SEO is important.
                </p>
              </div>
            </div>
          )}

          {selectedStrategy === 'ssg' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Static Site Generation (SSG)
                  </h4>
                  <p className="text-sm text-gray-600">Pre-built for instant delivery</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">How it works:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• HTML generated at build time</li>
                    <li>• Served from global CDN</li>
                    <li>• Same content for all users</li>
                    <li>• Extremely fast loading</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Best for:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Marketing websites</li>
                    <li>• Blog posts and articles</li>
                    <li>• Documentation sites</li>
                    <li>• Product landing pages</li>
                  </ul>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-semibold text-green-900 mb-2">🚀 Performance benefits:</h5>
                <p className="text-sm text-green-800">
                  Best possible performance with instant loading from CDN. Excellent for SEO and
                  Core Web Vitals.
                </p>
              </div>
            </div>
          )}

          {selectedStrategy === 'isr' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔄</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Incremental Static Regeneration (ISR)
                  </h4>
                  <p className="text-sm text-gray-600">Static with smart updates</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">How it works:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Pre-generated static pages</li>
                    <li>• Background regeneration on demand</li>
                    <li>• Stale-while-revalidate pattern</li>
                    <li>• Combines speed and freshness</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Best for:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• E-commerce catalogs</li>
                    <li>• News websites</li>
                    <li>• Social media feeds</li>
                    <li>• Large content sites</li>
                  </ul>
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-semibold text-purple-900 mb-2">🎯 Sweet spot:</h5>
                <p className="text-sm text-purple-800">
                  Content that changes periodically but doesn't need real-time updates. Gets both
                  speed and freshness.
                </p>
              </div>
            </div>
          )}
        </div>
      </ThemeCard>

      {/* Request Lifecycle Visualization */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Request Lifecycle Visualization</h3>
        <p className="text-gray-700 mb-6">
          See how each rendering strategy handles a user request from start to finish.
        </p>
        <RenderingTimeline2D strategy={selectedStrategy} />
      </ThemeCard>

      {/* Performance Comparison */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Characteristics</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Metric
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-600">
                  CSR
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-green-600">
                  SSR
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-blue-600">
                  SSG
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-purple-600">
                  ISR
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-3 text-sm font-medium">
                  First Load Time
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-red-600 font-semibold">
                  Slow
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-yellow-600 font-semibold">
                  Medium
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-green-600 font-semibold">
                  Fast
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-green-600 font-semibold">
                  Fast
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 text-sm font-medium">SEO</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-red-600 font-semibold">
                  Poor
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-green-600 font-semibold">
                  Excellent
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-green-600 font-semibold">
                  Excellent
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-green-600 font-semibold">
                  Excellent
                </td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 text-sm font-medium">
                  Server Load
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-green-600 font-semibold">
                  Low
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-red-600 font-semibold">
                  High
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-green-600 font-semibold">
                  Low
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-yellow-600 font-semibold">
                  Medium
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 text-sm font-medium">
                  Data Freshness
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-green-600 font-semibold">
                  Real-time
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-green-600 font-semibold">
                  Real-time
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-red-600 font-semibold">
                  Static
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center text-yellow-600 font-semibold">
                  Periodic
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar content
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Rendering Strategies</h3>
        <div className="space-y-3">
          <NavigationCard
            title="CSR vs SSR"
            description="Client vs Server rendering"
            colorScheme="blue"
            onClick={() => {}}
          />
          <NavigationCard
            title="Static Generation"
            description="Build-time optimization"
            colorScheme="blue"
            onClick={() => {}}
          />
          <NavigationCard
            title="Incremental Regeneration"
            description="Hybrid approach benefits"
            colorScheme="blue"
            onClick={() => {}}
          />
          <NavigationCard
            title="Core Web Vitals"
            description="Performance metrics impact"
            colorScheme="blue"
            onClick={() => {}}
          />
        </div>
      </ThemeCard>

      {/* Decision Guide */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Decision Guide</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Content changes frequently?</p>
              <p className="text-xs text-gray-600 mt-1">→ Use SSR for real-time data</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Content is mostly static?</p>
              <p className="text-xs text-gray-600 mt-1">→ Use SSG for best performance</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Content updates periodically?</p>
              <p className="text-xs text-gray-600 mt-1">→ Use ISR for optimal balance</p>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout
        section="nextjs"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Master Server & Client Components"
        description="Now that you understand rendering strategies, learn how Next.js components work across server and client boundaries."
        buttonText="Explore Components"
        onButtonClick={() => navigateToSection('Server & Client Components')}
        colorScheme="blue"
      />
    </>
  );
};

export default RenderingStrategies;
