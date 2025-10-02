import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';

const Introduction: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    // Navigate using the existing URL structure
    const baseUrl = '/rxjs?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Reactive Programming with RxJS</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Master asynchronous data streams and the reactive programming paradigm
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '7M+', label: 'weekly downloads on npm' },
          { value: '2010', label: 'First introduced as Rx.NET' },
          { value: 'Streams', label: 'Everything is a data stream' },
        ]}
        colorScheme="purple"
      />
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* What is RxJS */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">Rx</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">What is RxJS?</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            RxJS (Reactive Extensions for JavaScript) is a{' '}
            <strong>powerful library for reactive programming</strong>
            using Observables, making it easier to compose asynchronous or callback-based code.
          </p>
          <p>
            Think of RxJS as <strong>lodash for events</strong> - any event, whether it's user
            input, an HTTP request, or a timer, can be treated as a continuous stream of data that
            you can query, transform, and manipulate.
          </p>
          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
            <p className="text-purple-800">
              <strong>Core Philosophy:</strong> Everything can be modeled as a stream - from user
              clicks and HTTP responses to complex data transformations and real-time updates.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Reactive Paradigm */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">The Reactive Paradigm</h3>
        <p className="text-gray-700 mb-4">
          RxJS enables a declarative programming style where you describe what should happen when
          data changes, rather than imperatively managing state and callbacks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">Traditional Approach</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Callback hell and nested promises</li>
              <li>• Manual state management</li>
              <li>• Imperative control flow</li>
              <li>• Difficult error handling</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Reactive Approach</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Declarative stream composition</li>
              <li>• Automated state updates</li>
              <li>• Functional programming patterns</li>
              <li>• Built-in error propagation</li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* Use Cases */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Common Use Cases</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Type-ahead Search</h4>
              <p className="text-gray-600 text-sm">
                Debounce user input, cancel previous requests, and handle search results reactively.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Real-time Data Updates</h4>
              <p className="text-gray-600 text-sm">
                Handle WebSocket connections, live data feeds, and push notifications seamlessly.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Form Validation</h4>
              <p className="text-gray-600 text-sm">
                Async validation, dependent fields, and complex form state management.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Explore RxJS Concepts</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Reactive Manifesto"
            description="The paradigm shift to reactive programming"
            colorScheme="purple"
            onClick={() => navigateToSection('Reactive Manifesto')}
          />
          <NavigationCard
            title="Core Components"
            description="Observables, Observers, and Subscriptions"
            colorScheme="purple"
            onClick={() => navigateToSection('Core Components')}
          />
          <NavigationCard
            title="Observables"
            description="The foundation of reactive streams"
            colorScheme="purple"
            onClick={() => navigateToSection('Observables')}
          />
          <NavigationCard
            title="Operators"
            description="Transform and compose data streams"
            colorScheme="purple"
            onClick={() => navigateToSection('Operators')}
          />
          <NavigationCard
            title="Marble Diagrams"
            description="Visualize streams over time"
            colorScheme="purple"
            onClick={() => navigateToSection('Marble Diagrams')}
          />
        </div>
      </ThemeCard>

      {/* Key Concepts */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Concepts</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Observable Streams</p>
              <p className="text-xs text-gray-600">Lazy collections that emit values over time</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-violet-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Functional Composition</p>
              <p className="text-xs text-gray-600">
                Chain operators to transform data declaratively
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Error Handling</p>
              <p className="text-xs text-gray-600">
                Built-in error propagation and recovery patterns
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Backpressure</p>
              <p className="text-xs text-gray-600">
                Handle fast producers and slow consumers gracefully
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout
        section="rxjs"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready to Think Reactively?"
        description="Dive into interactive visualizations that will transform how you think about asynchronous programming and data flow in your applications."
        buttonText="Start Learning"
        onButtonClick={() => navigateToSection('Core Components')}
        colorScheme="purple"
      />
    </>
  );
};

export default Introduction;
