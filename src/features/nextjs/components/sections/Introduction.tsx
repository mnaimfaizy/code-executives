import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';

const Introduction: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    // Navigate using the existing URL structure
    const baseUrl = '/nextjs?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Mastering Next.js</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          The comprehensive guide to modern React web development with server-first architecture
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '15M+', label: 'Weekly npm downloads' },
          { value: '2016', label: 'Launched by Vercel' },
          { value: '15+', label: 'Major versions released' },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* What is Next.js */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">What is Next.js?</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Next.js is a <strong>full-stack React framework</strong> that enables you to build
            production-ready web applications with built-in optimizations for performance, SEO, and
            developer experience.
          </p>
          <p>
            Created by Guillermo Rauch and the Vercel team, Next.js revolutionized React development
            by bringing <strong>server-side rendering and static generation</strong> to the React
            ecosystem, solving the critical issues of poor SEO and slow initial page loads.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800">
              <strong>Core Philosophy:</strong> Move rendering logic as close to the database as
              possible to enable efficient data retrieval and presentation.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Historical Evolution */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Evolution of Next.js</h3>
        <div className="space-y-6">
          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Version 1.0 (2016)</h4>
                <p className="text-sm text-gray-600">Initial release with Server-Side Rendering</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Version 9.5 (2020)</h4>
                <p className="text-sm text-gray-600">Incremental Static Regeneration (ISR)</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Version 13 (2022)</h4>
                <p className="text-sm text-gray-600">App Router & Server Components</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Version 15 (2024)</h4>
                <p className="text-sm text-gray-600">Latest with enhanced performance</p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Core Principles */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Six Founding Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              principle: 'Zero Setup',
              description: 'Everything works out-of-the-box',
              icon: '⚡',
            },
            {
              principle: 'JavaScript Everywhere',
              description: 'All functions written in JavaScript',
              icon: '🟨',
            },
            {
              principle: 'Automatic Code Splitting',
              description: 'Server-rendering with optimized bundles',
              icon: '📦',
            },
            {
              principle: 'Configurable Data Fetching',
              description: 'Flexible data loading strategies',
              icon: '🔄',
            },
            {
              principle: 'Predictive Prefetching',
              description: 'Anticipating user navigation',
              icon: '🔮',
            },
            {
              principle: 'Simplified Deployment',
              description: 'One-command deployment process',
              icon: '🚀',
            },
          ].map((item) => (
            <div
              key={item.principle}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{item.principle}</h4>
                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Rendering Strategies Overview */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Rendering Strategies</h3>
        <p className="text-gray-700 mb-4">
          Next.js provides multiple rendering strategies, each optimized for different use cases:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'SSR',
              fullName: 'Server-Side Rendering',
              description: 'Fresh HTML on every request',
              useCase: 'Real-time data, personalization',
              color: 'bg-green-100 text-green-800 border-green-200',
            },
            {
              name: 'SSG',
              fullName: 'Static Site Generation',
              description: 'Pre-built HTML at build time',
              useCase: 'Marketing pages, blogs',
              color: 'bg-blue-100 text-blue-800 border-blue-200',
            },
            {
              name: 'ISR',
              fullName: 'Incremental Static Regeneration',
              description: 'Static with periodic updates',
              useCase: 'E-commerce, news sites',
              color: 'bg-purple-100 text-purple-800 border-purple-200',
            },
          ].map((strategy) => (
            <div
              key={strategy.name}
              className={`p-4 rounded-lg border text-center ${strategy.color}`}
            >
              <div className="font-bold text-lg mb-1">{strategy.name}</div>
              <div className="text-xs font-medium mb-2">{strategy.fullName}</div>
              <p className="text-xs mb-2">{strategy.description}</p>
              <div className="text-xs opacity-75">{strategy.useCase}</div>
            </div>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Explore Next.js Architecture</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Routing Systems"
            description="Pages Router vs App Router"
            colorScheme="blue"
            onClick={() => navigateToSection('Routing Systems')}
          />
          <NavigationCard
            title="Rendering Strategies"
            description="SSR, SSG, ISR, and CSR"
            colorScheme="blue"
            onClick={() => navigateToSection('Rendering Strategies')}
          />
          <NavigationCard
            title="Server & Client Components"
            description="Component architecture evolution"
            colorScheme="blue"
            onClick={() => navigateToSection('Server & Client Components')}
          />
          <NavigationCard
            title="Data Fetching"
            description="Fetch API and Server Actions"
            colorScheme="blue"
            onClick={() => navigateToSection('Data Fetching & Mutations')}
          />
          <NavigationCard
            title="Middleware & APIs"
            description="Route handlers and edge functions"
            colorScheme="blue"
            onClick={() => navigateToSection('Middleware & Route Handlers')}
          />
        </div>
      </ThemeCard>

      {/* Key Features */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Features</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">File-System Routing</p>
              <p className="text-xs text-gray-600">
                Automatic route generation from file structure
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Server Components</p>
              <p className="text-xs text-gray-600">Zero client-side JavaScript by default</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Built-in Optimizations</p>
              <p className="text-xs text-gray-600">Image, font, and script optimization</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Edge Runtime</p>
              <p className="text-xs text-gray-600">Global deployment with instant cold starts</p>
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
        title="Ready to Master Next.js?"
        description="Dive into interactive visualizations of Next.js architecture, from routing systems to rendering strategies, and understand how modern React applications are built."
        buttonText="Start Learning"
        onButtonClick={() => navigateToSection('Routing Systems')}
        colorScheme="blue"
      />
    </>
  );
};

export default Introduction;
