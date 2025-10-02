import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';
import ComponentTree2D from '../visualizations/2d/ComponentTree2D';
import HydrationFlow from '../visualizations/2d/HydrationFlow';
import CompositionPatterns from '../visualizations/2d/CompositionPatterns';
import ComponentPlayground from '../visualizations/2d/ComponentPlayground';
import CodeSplitter from '../visualizations/2d/CodeSplitter';
import PayloadViewer from '../visualizations/2d/PayloadViewer';

const ServerClientComponents: React.FC = () => {
  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Server & Client Components</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Master the art of component composition in Next.js App Router. Learn when to use Server
          Components for performance and Client Components for interactivity.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Key Concept:</strong> Server Components run on the server, Client Components run
            in the browser. Choose wisely to optimize performance and user experience.
          </p>
        </div>
      </div>
      <StatsGrid
        stats={[
          { label: 'Performance Boost', value: '40%' },
          { label: 'Bundle Reduction', value: '60%' },
          { label: 'SEO Improvement', value: '100%' },
          { label: 'Interactivity', value: '∞' },
        ]}
        colorScheme="primary"
      />
    </div>
  );

  // Main content
  const mainContent = (
    <>
      {/* Introduction */}
      <ThemeCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Understanding Server vs Client Components
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">S</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Server Components</h3>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• Run on the server during build or request</li>
                    <li>• Can access databases, APIs, file system</li>
                    <li>• Reduce client bundle size</li>
                    <li>• Cannot use browser APIs or React hooks</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">C</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Client Components</h3>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• Run in the browser after hydration</li>
                    <li>• Can use React hooks and browser APIs</li>
                    <li>• Enable user interactions</li>
                    <li>• Increase bundle size</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Component Tree Visualization */}
      <ThemeCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Component Hierarchy</h2>
          <p className="text-gray-600 mb-6">
            See how server and client components work together in a typical Next.js application.
          </p>
          <ComponentTree2D />
        </div>
      </ThemeCard>

      {/* Hydration Flow */}
      <ThemeCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hydration Process</h2>
          <p className="text-gray-600 mb-6">
            Watch how server-rendered HTML becomes interactive through the hydration process.
          </p>
          <HydrationFlow />
        </div>
      </ThemeCard>

      {/* Composition Patterns */}
      <ThemeCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Composition Patterns</h2>
          <p className="text-gray-600 mb-6">
            Learn the correct and incorrect ways to combine server and client components.
          </p>
          <CompositionPatterns />
        </div>
      </ThemeCard>

      {/* Interactive Playground */}
      <ThemeCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive Playground</h2>
          <p className="text-gray-600 mb-6">
            Experiment with different component combinations and see the generated code.
          </p>
          <ComponentPlayground />
        </div>
      </ThemeCard>

      {/* Code Splitting */}
      <ThemeCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Splitting</h2>
          <p className="text-gray-600 mb-6">
            Understand how Next.js automatically splits your code between server and client bundles.
          </p>
          <CodeSplitter />
        </div>
      </ThemeCard>

      {/* RSC Payload */}
      <ThemeCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">RSC Payload Inspection</h2>
          <p className="text-gray-600 mb-6">
            Explore the React Server Components protocol and see how data flows between server and
            client.
          </p>
          <PayloadViewer />
        </div>
      </ThemeCard>

      {/* Best Practices */}
      <ThemeCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">When to Use Server Components</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Static content and layouts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Data fetching and API calls</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Accessing server-side resources</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Reducing client bundle size</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">When to Use Client Components</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>User interactions and event handlers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>Browser API usage (localStorage, etc.)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>React hooks (useState, useEffect)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>Custom hooks and complex state logic</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar content
  const sidebarContent = (
    <>
      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Facts</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Server Components are the default</li>
            <li>• Add 'use client' for Client Components</li>
            <li>• Props flow from Server to Client</li>
            <li>• Client Components break server rendering</li>
          </ul>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Common Patterns</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Server Component with Client islands</li>
            <li>• Client wrapper for interactivity</li>
            <li>• Server data, Client interactions</li>
            <li>• Progressive enhancement</li>
          </ul>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Migration Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Start with Server Components</li>
            <li>• Add Client Components as needed</li>
            <li>• Use composition over conversion</li>
            <li>• Test hydration carefully</li>
          </ul>
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
        title="Ready to Build Better Next.js Apps?"
        description="Master server and client component patterns to create faster, more interactive applications."
        buttonText="Explore More Next.js Features"
        onButtonClick={() => console.log('Navigate to next section')}
        colorScheme="primary"
      />
    </>
  );
};

export default ServerClientComponents;
