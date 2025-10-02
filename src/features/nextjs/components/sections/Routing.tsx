import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';
import RoutingFlow2D from '../visualizations/2d/RoutingFlow2D';
import RouterComparison from '../../../../components/shared/RouterComparison';

const Routing: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/nextjs?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Routing Systems in Next.js</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          From file-based routing to the revolutionary App Router - understand how Next.js handles
          navigation
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: 'File-based', label: 'Automatic route generation' },
          { value: 'Nested', label: 'Layouts and shared UI' },
          { value: 'Server-first', label: 'Component architecture' },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  // Main content
  const mainContent = (
    <>
      {/* What is Routing */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">📁</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">File-System Based Routing</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Next.js revolutionized React routing by introducing{' '}
            <strong>file-system based routing</strong>, where your file structure automatically
            determines your application's URL structure.
          </p>
          <p>
            Unlike traditional React routers that require manual route configuration, Next.js
            automatically creates routes based on files in your{' '}
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">pages/</code> or
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">app/</code> directories.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800">
              <strong>Zero Configuration:</strong> Create a file, get a route. Delete a file, remove
              a route. It's that simple.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Router Evolution */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">The Evolution: Pages to App Router</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pages Router */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-orange-600 font-bold text-sm">P</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Pages Router (Legacy)</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  • File-based routing in <code className="bg-gray-100 px-1 rounded">pages/</code>
                </li>
                <li>• Client-side navigation by default</li>
                <li>• Special functions: getServerSideProps, getStaticProps</li>
                <li>• Global layouts with _app.js</li>
                <li>• Simple but limited for complex apps</li>
              </ul>
            </div>

            {/* App Router */}
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold text-sm">A</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">App Router (Modern)</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  • Folder-based routing in <code className="bg-gray-100 px-1 rounded">app/</code>
                </li>
                <li>• Server Components by default</li>
                <li>• Native fetch() API for data fetching</li>
                <li>• Nested layouts with layout.js</li>
                <li>• Streaming and partial rendering</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive Visualization */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Interactive Route Mapping</h3>
        <p className="text-gray-700 mb-6">
          See how your file structure translates to URLs in real-time. Click on different router
          types to explore the differences.
        </p>
        <RoutingFlow2D />
      </ThemeCard>

      {/* Router Comparison Table */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Feature Comparison</h3>
        <RouterComparison />
      </ThemeCard>

      {/* Nested Layouts */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Nested Layouts & Shared UI</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            The App Router introduces nested layouts that allow you to share UI across related
            routes while maintaining state during navigation.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Layout Hierarchy</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <code className="text-blue-600">app/layout.js</code>
                <span className="text-gray-600">- Root layout (required)</span>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <code className="text-green-600">app/dashboard/layout.js</code>
                <span className="text-gray-600">- Nested layout</span>
              </div>
              <div className="flex items-center space-x-2 ml-8">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <code className="text-purple-600">app/dashboard/page.js</code>
                <span className="text-gray-600">- Page component</span>
              </div>
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">Routing Concepts</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Dynamic Routes"
            description="[id].js for parameterized URLs"
            colorScheme="blue"
            onClick={() => {}}
          />
          <NavigationCard
            title="API Routes"
            description="pages/api/ for backend endpoints"
            colorScheme="blue"
            onClick={() => {}}
          />
          <NavigationCard
            title="Middleware"
            description="Request processing and redirects"
            colorScheme="blue"
            onClick={() => {}}
          />
          <NavigationCard
            title="Loading States"
            description="loading.js for instant feedback"
            colorScheme="blue"
            onClick={() => {}}
          />
        </div>
      </ThemeCard>

      {/* Key Benefits */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Why File-Based Routing?</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Developer Experience</p>
              <p className="text-xs text-gray-600">No route configuration files to maintain</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Type Safety</p>
              <p className="text-xs text-gray-600">Routes are validated at build time</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">SEO Friendly</p>
              <p className="text-xs text-gray-600">Clear URL structure for search engines</p>
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
        title="Ready for Rendering Strategies?"
        description="Now that you understand routing, let's explore how Next.js renders your pages with different strategies optimized for performance and user experience."
        buttonText="Explore Rendering"
        onButtonClick={() => navigateToSection('Rendering Strategies')}
        colorScheme="blue"
      />
    </>
  );
};

export default Routing;
