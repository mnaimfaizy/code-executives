import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import StatsGrid from '../../components/shared/StatsGrid';
import CTASection from '../../components/shared/CTASection';

const Introduction: React.FC = () => {
  const navigate = useNavigate();

  const navigateToSection = (sectionName: string) => {
    // Use React Router navigation instead of window.location
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/javascript?section=${encodedSection}`);
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">The Inner Workings of JavaScript</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Explore the sophisticated execution model that powers the web's most ubiquitous
          programming language
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '90%+', label: 'of websites use JavaScript' },
          { value: '1995', label: 'Created in just 10 days' },
          { value: 'Multi', label: 'paradigm language' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* What is JavaScript */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mr-3">
            <span className="text-black font-bold text-sm">JS</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">What is JavaScript?</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            JavaScript is a <strong>powerful, multi-paradigm programming language</strong> and a
            foundational technology of the World Wide Web, operating in concert with HTML and CSS to
            create rich, interactive user experiences.
          </p>
          <p>
            While HTML provides the structure and CSS the style, JavaScript supplies the
            <strong> dynamic functionality and behavior</strong> that modern web users expect, such
            as animated image carousels, responsive menus, and dynamic content changes.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800">
              <strong>Modern Reality:</strong> Contemporary engines employ Just-in-Time (JIT)
              compilation, combining the speed of interpretation with performance optimizations to
              execute code with remarkable efficiency.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Multi-Paradigm Nature */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-Paradigm Flexibility</h3>
        <p className="text-gray-700 mb-4">
          JavaScript supports multiple programming paradigms, allowing developers to choose the
          style best suited for their task or combine them within a single application.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: 'Event-Driven', color: 'bg-green-100 text-green-800 border-green-200' },
            { name: 'Functional', color: 'bg-blue-100 text-blue-800 border-blue-200' },
            { name: 'Imperative', color: 'bg-purple-100 text-purple-800 border-purple-200' },
            { name: 'Procedural', color: 'bg-orange-100 text-orange-800 border-orange-200' },
            { name: 'Object-Oriented', color: 'bg-red-100 text-red-800 border-red-200' },
            {
              name: 'Prototype-Based',
              color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            },
          ].map((paradigm) => (
            <div
              key={paradigm.name}
              className={`px-3 py-2 rounded-lg border text-sm font-medium text-center ${paradigm.color}`}
            >
              {paradigm.name}
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Ecosystem Evolution */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">From Browser to Everywhere</h3>
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
              <h4 className="font-semibold text-gray-900">Client-Side Origins</h4>
              <p className="text-gray-600 text-sm">
                Historically, JavaScript ran exclusively within web browsers to make static webpages
                dynamic, responding to user events and modifying webpage structure in real-time.
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
              <h4 className="font-semibold text-gray-900">Server-Side Revolution</h4>
              <p className="text-gray-600 text-sm">
                With Node.js (2009), JavaScript expanded beyond browsers, enabling server-side
                development, desktop applications, mobile apps, and even IoT device programming.
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Explore JavaScript's Inner Workings
        </h3>
        <div className="space-y-3">
          <NavigationCard
            title="JavaScript History"
            description="From 10-day creation to global dominance"
            colorScheme="indigo"
            onClick={() => navigateToSection('JavaScript History')}
          />
          <NavigationCard
            title="Execution Model"
            description="Single-threaded with concurrency magic"
            colorScheme="indigo"
            onClick={() => navigateToSection('Execution Model')}
          />
          <NavigationCard
            title="Engine & Runtime"
            description="V8, Call Stack, Memory Heap & more"
            colorScheme="indigo"
            onClick={() => navigateToSection('Engine & Runtime')}
          />
          <NavigationCard
            title="Event Loop"
            description="The master orchestrator of async behavior"
            colorScheme="indigo"
            onClick={() => navigateToSection('Event Loop')}
          />
          <NavigationCard
            title="Memory Management"
            description="Garbage collection and memory optimization"
            colorScheme="indigo"
            onClick={() => navigateToSection('Memory Management')}
          />
        </div>
      </ThemeCard>

      {/* Key Facts */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Facts</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">ECMAScript Standard</p>
              <p className="text-xs text-gray-600">
                Standardized by ECMA in 1997 to unify implementations
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">JIT Compilation</p>
              <p className="text-xs text-gray-600">
                Modern engines use Just-in-Time compilation for performance
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Runtime Environment</p>
              <p className="text-xs text-gray-600">
                Engine + APIs + Event Loop = Complete execution environment
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Single-Threaded</p>
              <p className="text-xs text-gray-600">
                One Call Stack, but non-blocking through async operations
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
        section="javascript"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready to Dive Deeper?"
        description="Explore interactive visualizations of JavaScript's execution model, from the Call Stack to the Event Loop, and understand how your code really runs under the hood."
        buttonText="Start Exploring"
        onButtonClick={() => navigateToSection('Execution Model')}
        colorScheme="indigo"
      />
    </>
  );
};

export default Introduction;
