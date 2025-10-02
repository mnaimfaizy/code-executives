import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';
import ReactConceptMapVisualization from '../visualizations/2d/ReactConceptMapVisualization';

const Introduction: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    // Navigate using the existing URL structure
    const baseUrl = '/react?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">The React Revolution</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Discover the declarative framework that transformed web development through
          component-based architecture and virtual DOM innovation
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '2013', label: 'Open-sourced by Facebook' },
          { value: '10M+', label: 'Weekly npm downloads' },
          { value: 'Declarative', label: 'UI programming paradigm' },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* What is React */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">⚛️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">What is React?</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            React is a <strong>declarative, component-based JavaScript library</strong> for building
            user interfaces. It was created by Facebook in 2013 to solve the problem of managing
            complex, dynamic user interfaces efficiently.
          </p>
          <p>
            Unlike traditional imperative approaches that require developers to manually track and
            update DOM elements, React introduces a <strong>declarative paradigm</strong> where you
            describe what the UI should look like for any given state, and React handles the
            efficient DOM updates automatically.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800">
              <strong>Core Innovation:</strong> React's Virtual DOM and reconciliation algorithm
              enable lightning-fast UI updates by minimizing expensive real DOM manipulations.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* The Virtual DOM Revolution */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Virtual DOM: The Performance Breakthrough
        </h3>
        <p className="text-gray-700 mb-4">
          React's Virtual DOM is a lightweight, in-memory representation of the actual DOM that
          enables efficient UI updates through intelligent diffing and minimal DOM manipulation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">❌ Traditional Approach</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Imperative DOM manipulation</li>
              <li>• Expensive reflows and repaints</li>
              <li>• Manual change tracking</li>
              <li>• Error-prone and complex</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">✅ React's Solution</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Declarative UI descriptions</li>
              <li>• Intelligent diffing algorithm</li>
              <li>• Minimal DOM updates</li>
              <li>• Automatic optimization</li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* Component Architecture */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Component-Based Architecture</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            React applications are built from small, reusable, self-contained components that manage
            their own state and render their own UI. This modular approach makes applications easier
            to build, test, and maintain.
          </p>
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
            <p className="text-indigo-800">
              <strong>Key Benefits:</strong> Reusability, maintainability, testability, and clear
              separation of concerns through unidirectional data flow.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Reusable', icon: '🔄' },
              { name: 'Composable', icon: '🧩' },
              { name: 'Testable', icon: '🧪' },
              { name: 'Maintainable', icon: '🔧' },
            ].map((benefit) => (
              <div
                key={benefit.name}
                className="text-center p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="text-2xl mb-2">{benefit.icon}</div>
                <div className="text-sm font-medium text-gray-900">{benefit.name}</div>
              </div>
            ))}
          </div>
        </div>
      </ThemeCard>

      {/* The Ecosystem */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Rich Ecosystem & Community</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Core Library Focus</h4>
              <p className="text-gray-600 text-sm">
                React intentionally focuses only on UI rendering, creating space for a rich
                ecosystem of complementary libraries for routing, state management, and more.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Modern Tooling</h4>
              <p className="text-gray-600 text-sm">
                JSX syntax, Hooks API, Concurrent Mode, and Server Components represent React's
                evolution toward more powerful and developer-friendly patterns.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive React Concept Map */}
      <ThemeCard>
        <ReactConceptMapVisualization />
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Explore React's Architecture</h3>
        <div className="space-y-3">
          <NavigationCard
            title="DOM Fundamentals"
            description="Understanding the Document Object Model"
            colorScheme="blue"
            onClick={() => navigateToSection('DOM Fundamentals')}
          />
          <NavigationCard
            title="Virtual DOM"
            description="React's performance innovation"
            colorScheme="blue"
            onClick={() => navigateToSection('Virtual DOM')}
          />
          <NavigationCard
            title="Reconciliation"
            description="The diffing algorithm that powers updates"
            colorScheme="blue"
            onClick={() => navigateToSection('Reconciliation')}
          />
          <NavigationCard
            title="Components"
            description="Building blocks of React applications"
            colorScheme="blue"
            onClick={() => navigateToSection('Components')}
          />
          <NavigationCard
            title="State & Props"
            description="Data flow and component communication"
            colorScheme="blue"
            onClick={() => navigateToSection('State & Props')}
          />
        </div>
      </ThemeCard>

      {/* Key Concepts */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Core Concepts</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Declarative Programming</p>
              <p className="text-xs text-gray-600">
                Describe what UI should look like, not how to update it
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Component Composition</p>
              <p className="text-xs text-gray-600">
                Build complex UIs from simple, reusable components
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Unidirectional Data Flow</p>
              <p className="text-xs text-gray-600">
                Predictable data flow from parent to child components
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Virtual DOM Diffing</p>
              <p className="text-xs text-gray-600">
                Efficient reconciliation through intelligent comparison
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
        section="react"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready to Master React?"
        description="Dive into interactive visualizations of React's core concepts, from Virtual DOM reconciliation to component lifecycle management, and understand how modern web applications are built."
        buttonText="Start Learning"
        onButtonClick={() => navigateToSection('DOM Fundamentals')}
        colorScheme="blue"
      />
    </>
  );
};

export default Introduction;
