import React, { useState } from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import StatsGrid from '../../components/shared/StatsGrid';
import CTASection from '../../components/shared/CTASection';
import BundleAnalyzer2D from '../../components/models2d/nextjs/BundleAnalyzer2D';
import PerformanceTimeline from '../../components/models2d/nextjs/PerformanceTimeline';
import OptimizationDashboard from '../../components/models2d/nextjs/OptimizationDashboard';
import ImageOptimizer from '../../components/models2d/nextjs/ImageOptimizer';
import BundleViewer from '../../components/models2d/nextjs/BundleViewer';
import MetricsTracker from '../../components/models2d/nextjs/MetricsTracker';

const Optimization: React.FC = () => {
  const [activeVisualization, setActiveVisualization] = useState<string | null>(null);

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Optimization & Performance</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Master Next.js performance optimization techniques to deliver lightning-fast, scalable
          applications that provide exceptional user experiences.
        </p>
        <p className="text-lg text-gray-600">
          Learn bundle analysis, image optimization, caching strategies, and real-time monitoring to
          achieve optimal Core Web Vitals and system performance.
        </p>
      </div>

      <StatsGrid
        stats={[
          { label: 'Performance Gain', value: '60%' },
          { label: 'Bundle Reduction', value: '40%' },
          { label: 'Core Web Vitals', value: '90%' },
          { label: 'User Experience', value: '3x' },
        ]}
        colorScheme="emerald"
      />
    </div>
  );

  // Main content
  const mainContent = (
    <>
      {/* Introduction */}
      <ThemeCard className="mb-8">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Performance Matters</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            In today's fast-paced digital world, performance is not just a technical concern—it's a
            business imperative. Studies show that 53% of mobile users abandon sites that take
            longer than 3 seconds to load. Next.js provides powerful built-in optimization features,
            but mastering them requires understanding both the technical details and strategic
            application.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="font-semibold text-emerald-800 mb-2">Core Web Vitals Impact</h3>
              <ul className="text-sm text-emerald-700 space-y-1">
                <li>• Largest Contentful Paint (LCP) &lt; 2.5s</li>
                <li>• Interaction to Next Paint (INP) &lt; 200ms</li>
                <li>• Cumulative Layout Shift (CLS) &lt; 0.1</li>
                <li>• Direct ranking factor in Google</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Business Benefits</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 20% increase in conversion rates</li>
                <li>• 15% improvement in user engagement</li>
                <li>• Better search engine rankings</li>
                <li>• Reduced server costs</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ThemeCard>
          <NavigationCard
            title="Bundle Analysis"
            description="Analyze your bundle composition and identify optimization opportunities"
            colorScheme="emerald"
            onClick={() => setActiveVisualization('bundle-analyzer')}
            icon="📦"
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Performance Timeline"
            description="Track Core Web Vitals and loading performance over time"
            colorScheme="emerald"
            onClick={() => setActiveVisualization('performance-timeline')}
            icon="📈"
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Optimization Dashboard"
            description="Compare before/after performance with different optimization techniques"
            colorScheme="emerald"
            onClick={() => setActiveVisualization('optimization-dashboard')}
            icon="⚡"
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Image Optimization"
            description="Master Next.js image optimization with modern formats and lazy loading"
            colorScheme="emerald"
            onClick={() => setActiveVisualization('image-optimizer')}
            icon="🖼️"
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Bundle Viewer"
            description="Interactive bundle analysis with treemap, sunburst, and list views"
            colorScheme="emerald"
            onClick={() => setActiveVisualization('bundle-viewer')}
            icon="🔍"
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Real-Time Monitor"
            description="Live performance tracking with Core Web Vitals and system metrics"
            colorScheme="emerald"
            onClick={() => setActiveVisualization('metrics-tracker')}
            icon="📊"
          />
        </ThemeCard>
      </div>

      {/* Active Visualization */}
      {activeVisualization && (
        <ThemeCard className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {activeVisualization === 'bundle-analyzer' && 'Bundle Dependency Analysis'}
              {activeVisualization === 'performance-timeline' && 'Performance Timeline'}
              {activeVisualization === 'optimization-dashboard' && 'Optimization Impact Dashboard'}
              {activeVisualization === 'image-optimizer' && 'Image Optimization Demo'}
              {activeVisualization === 'bundle-viewer' && 'Bundle Composition Analysis'}
              {activeVisualization === 'metrics-tracker' && 'Real-Time Performance Monitor'}
            </h3>
            <button
              onClick={() => setActiveVisualization(null)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          {activeVisualization === 'bundle-analyzer' && <BundleAnalyzer2D />}
          {activeVisualization === 'performance-timeline' && <PerformanceTimeline />}
          {activeVisualization === 'optimization-dashboard' && <OptimizationDashboard />}
          {activeVisualization === 'image-optimizer' && <ImageOptimizer />}
          {activeVisualization === 'bundle-viewer' && <BundleViewer />}
          {activeVisualization === 'metrics-tracker' && <MetricsTracker />}
        </ThemeCard>
      )}

      {/* Key Optimization Techniques */}
      <ThemeCard className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Key Optimization Techniques</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Bundle Optimization</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Code splitting with dynamic imports</li>
                <li>• Tree shaking unused dependencies</li>
                <li>• Bundle analysis and optimization</li>
                <li>• Compression (gzip, brotli)</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Image Optimization</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatic format selection (WebP, AVIF)</li>
                <li>• Responsive image generation</li>
                <li>• Lazy loading implementation</li>
                <li>• Quality and size optimization</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Caching Strategies</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Service Worker implementation</li>
                <li>• Optimal cache headers</li>
                <li>• Static asset caching</li>
                <li>• API response caching</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Runtime Optimization</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Core Web Vitals monitoring</li>
                <li>• Memory usage optimization</li>
                <li>• Network request optimization</li>
                <li>• Real-time performance tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Best Practices */}
      <ThemeCard className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Best Practices</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-semibold text-gray-900 mb-2">Measure First</h4>
            <p className="text-sm text-gray-600">
              Always measure performance before and after optimizations. Use tools like Lighthouse,
              WebPageTest, and Chrome DevTools.
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-3">🔄</div>
            <h4 className="font-semibold text-gray-900 mb-2">Iterate Gradually</h4>
            <p className="text-sm text-gray-600">
              Apply optimizations incrementally and measure impact. Focus on high-impact changes
              first for maximum benefit.
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-3">📱</div>
            <h4 className="font-semibold text-gray-900 mb-2">Mobile First</h4>
            <p className="text-sm text-gray-600">
              Optimize for mobile devices first, as they often have slower networks and less
              powerful hardware.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Tools and Resources */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Essential Tools & Resources</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Development Tools</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <span className="text-emerald-500">📊</span>
                <span>
                  <strong>Webpack Bundle Analyzer:</strong> Visualize bundle composition
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-emerald-500">🚀</span>
                <span>
                  <strong>Lighthouse:</strong> Comprehensive performance auditing
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-emerald-500">⚡</span>
                <span>
                  <strong>Chrome DevTools:</strong> Real-time performance monitoring
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-emerald-500">📈</span>
                <span>
                  <strong>WebPageTest:</strong> Cross-browser performance testing
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Next.js Features</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <span className="text-blue-500">🖼️</span>
                <span>
                  <strong>next/image:</strong> Automatic image optimization
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-500">📦</span>
                <span>
                  <strong>next/dynamic:</strong> Code splitting and lazy loading
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-500">⚡</span>
                <span>
                  <strong>next/script:</strong> Optimized third-party script loading
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-500">🔧</span>
                <span>
                  <strong>next.config.js:</strong> Advanced optimization configuration
                </span>
              </li>
            </ul>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar content
  const sidebarContent = (
    <>
      <ThemeCard>
        <NavigationCard
          title="Bundle Analysis"
          description="Deep dive into bundle composition"
          colorScheme="emerald"
          onClick={() => setActiveVisualization('bundle-analyzer')}
        />
      </ThemeCard>

      <ThemeCard>
        <NavigationCard
          title="Performance Monitoring"
          description="Real-time metrics tracking"
          colorScheme="emerald"
          onClick={() => setActiveVisualization('metrics-tracker')}
        />
      </ThemeCard>

      <ThemeCard>
        <NavigationCard
          title="Image Optimization"
          description="Next.js image best practices"
          colorScheme="emerald"
          onClick={() => setActiveVisualization('image-optimizer')}
        />
      </ThemeCard>

      <ThemeCard>
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Quick Stats</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Bundle Size:</span>
              <span className="font-medium">2.1 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">LCP Target:</span>
              <span className="font-medium">&lt; 2.5s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Image Savings:</span>
              <span className="font-medium">40-60%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cache Hit Rate:</span>
              <span className="font-medium">85%</span>
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
        title="Ready to Optimize Your Next.js App?"
        description="Apply these performance techniques to deliver exceptional user experiences and improve your Core Web Vitals scores."
        buttonText="Start Optimizing"
        onButtonClick={() => setActiveVisualization('optimization-dashboard')}
        colorScheme="emerald"
      />
    </>
  );
};

export default Optimization;
