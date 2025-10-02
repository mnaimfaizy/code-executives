import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';

const Introduction: React.FC = () => {
  const navigate = useNavigate();

  const navigateToSection = (sectionName: string) => {
    // Use React Router navigation instead of window.location
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/python?section=${encodedSection}`);
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Python: From Philosophy to Architecture
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Discover the elegant design principles and internal mechanics that make Python the world's
          most approachable yet powerful programming language
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '30+', label: 'Years of Evolution' },
          { value: '#1', label: 'Most Loved Language' },
          { value: 'Multi', label: 'paradigm approach' },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* What is Python */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">Py</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">What is Python?</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Python is a <strong>high-level, interpreted programming language</strong> renowned for
            its emphasis on code readability and developer productivity. Created by Guido van Rossum
            in 1989, Python has evolved from a hobby project into the backbone of modern software
            development.
          </p>
          <p>
            Unlike lower-level languages that require manual memory management and complex syntax,
            Python provides an elegant abstraction layer that allows developers to focus on
            <strong>solving problems rather than managing implementation details</strong>.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800">
              <strong>Core Philosophy:</strong> "There should be one—and preferably only one—obvious
              way to do it." This principle guides Python's design toward clarity and simplicity.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Design Philosophy */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">The Zen of Python</h3>
        <p className="text-gray-700 mb-4">
          Python's design is guided by a philosophy that prioritizes human readability and developer
          experience above all else. This manifests in several key principles:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              principle: 'Readability Counts',
              description: 'Code is read more often than written',
            },
            { principle: 'Explicit is Better', description: 'Clear intent over clever tricks' },
            {
              principle: 'Simple is Better',
              description: 'Complexity should be avoided when possible',
            },
            {
              principle: 'Complex is OK',
              description: 'When complexity is necessary, it should be contained',
            },
            {
              principle: 'Flat is Better than Nested',
              description: 'Shallow hierarchies are preferable',
            },
            {
              principle: 'Sparse is Better than Dense',
              description: 'Space and clarity improve comprehension',
            },
          ].map((item) => (
            <div key={item.principle} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">{item.principle}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Architecture Evolution */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">From Hobby to Global Standard</h3>
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
              <h4 className="font-semibold text-gray-900">The Christmas Project (1989)</h4>
              <p className="text-gray-600 text-sm">
                Born as a personal project during Christmas break, Python was designed to be a
                successor to ABC with improved syntax and broader applicability.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 11-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">The Python 3 Revolution (2008)</h4>
              <p className="text-gray-600 text-sm">
                A deliberate breaking change to eliminate accumulated inconsistencies, demonstrating
                a commitment to long-term architectural purity over short-term convenience.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Community Governance (2018)</h4>
              <p className="text-gray-600 text-sm">
                Guido van Rossum stepped down as BDFL, transitioning to a collaborative, PEP-driven
                governance model that scales with Python's global community.
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">Explore Python's Architecture</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Python Philosophy"
            description="The Zen of Python and design principles"
            colorScheme="blue"
            onClick={() => navigateToSection('Python Philosophy')}
          />
          <NavigationCard
            title="Execution Model"
            description="CPython interpreter and bytecode"
            colorScheme="blue"
            onClick={() => navigateToSection('Execution Model')}
          />
          <NavigationCard
            title="Memory Management"
            description="Stack, heap, and garbage collection"
            colorScheme="blue"
            onClick={() => navigateToSection('Memory Management')}
          />
          <NavigationCard
            title="Global Interpreter Lock"
            description="GIL mechanics and concurrency"
            colorScheme="blue"
            onClick={() => navigateToSection('Global Interpreter Lock')}
          />
          <NavigationCard
            title="Advanced Concepts"
            description="Decorators, async, metaclasses"
            colorScheme="blue"
            onClick={() => navigateToSection('Advanced Concepts')}
          />
        </div>
      </ThemeCard>

      {/* Key Facts */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Facts</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Dynamic Typing</p>
              <p className="text-xs text-gray-600">
                Variables determined at runtime, no explicit declarations needed
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Automatic Memory</p>
              <p className="text-xs text-gray-600">
                Garbage collection handles memory management automatically
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Indentation Matters</p>
              <p className="text-xs text-gray-600">
                Code blocks defined by indentation, not curly braces
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Batteries Included</p>
              <p className="text-xs text-gray-600">
                Rich standard library covers most common programming tasks
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
        section="python"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready to Explore Python's Architecture?"
        description="Dive into interactive visualizations of Python's execution model, from the CPython interpreter to advanced concepts like the GIL and asynchronous programming."
        buttonText="Start Exploring"
        onButtonClick={() => navigateToSection('Execution Model')}
        colorScheme="blue"
      />
    </>
  );
};

export default Introduction;
