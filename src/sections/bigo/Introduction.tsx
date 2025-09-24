import React, { useState } from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import StatsGrid from '../../components/shared/StatsGrid';
import CTASection from '../../components/shared/CTASection';
import { AlgorithmComparer, PerformanceProfiler } from '../../components/models2d/bigo/interactive';
import {
  TeleporterMetaphor,
  LibrarianMetaphor,
  ConveyorBeltMetaphor,
} from '../../components/models2d/bigo/metaphors';

const Introduction: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'comparer' | 'profiler' | 'metaphor'>('comparer');

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Big-O Notation: The Language of Algorithm Performance
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Master algorithmic complexity through interactive visualizations that transform abstract
          concepts into concrete understanding. Learn why some algorithms scale brilliantly while
          others crumble under real-world data.
        </p>
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveDemo('comparer')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeDemo === 'comparer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Algorithm Comparison
          </button>
          <button
            onClick={() => setActiveDemo('profiler')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeDemo === 'profiler'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Performance Profiling
          </button>
          <button
            onClick={() => setActiveDemo('metaphor')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeDemo === 'metaphor'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Visual Metaphors
          </button>
        </div>
      </div>

      <StatsGrid
        stats={[
          { label: 'Algorithms Analyzed', value: '50+' },
          { label: 'Performance Insights', value: '1000+' },
          { label: 'Learning Hours Saved', value: '100+' },
          { label: 'Complexity Classes', value: '7' },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  // Main content with interactive demos
  const mainContent = (
    <div className="space-y-8">
      {/* Interactive Demo Section */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive Learning Tools</h2>
        <p className="text-gray-700 mb-6">
          Experience algorithmic complexity through hands-on tools. Compare algorithms side-by-side,
          profile performance across input sizes, and explore visual metaphors that make complexity
          intuitive.
        </p>

        <div className="bg-gray-50 rounded-lg p-6">
          {activeDemo === 'comparer' && (
            <AlgorithmComparer
              isActive={true}
              inputSize={100}
              animationSpeed={1}
              interactive={true}
              onComparisonComplete={(result) => {
                console.log('Comparison complete:', result);
              }}
            />
          )}

          {activeDemo === 'profiler' && (
            <PerformanceProfiler
              isActive={true}
              inputSizes={[10, 50, 100, 500, 1000]}
              showGraph={true}
              animationSpeed={1}
              interactive={true}
              onProfileComplete={(data) => {
                console.log('Profiling complete:', data);
              }}
            />
          )}

          {activeDemo === 'metaphor' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-blue-600">O(1) - Instant Access</h3>
                <TeleporterMetaphor
                  isActive={true}
                  inputSize={100}
                  animationSpeed={1}
                  className="h-48"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-600">O(log n) - Smart Search</h3>
                <LibrarianMetaphor
                  isActive={true}
                  inputSize={100}
                  animationSpeed={1}
                  className="h-48"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-orange-600">O(n) - Linear Processing</h3>
                <ConveyorBeltMetaphor
                  isActive={true}
                  inputSize={100}
                  animationSpeed={1}
                  className="h-48"
                />
              </div>
            </div>
          )}
        </div>
      </ThemeCard>

      {/* Learning Path Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ThemeCard>
          <NavigationCard
            title="Core Concepts"
            description="Master the fundamental principles of algorithmic complexity analysis."
            colorScheme="blue"
            onClick={() => console.log('Navigate to Core Concepts')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Common Complexities"
            description="Explore the seven essential complexity classes with interactive metaphors."
            colorScheme="green"
            onClick={() => console.log('Navigate to Common Complexities')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Algorithm Analysis"
            description="Learn systematic techniques for analyzing code complexity."
            colorScheme="purple"
            onClick={() => console.log('Navigate to Algorithm Analysis')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Real-World Applications"
            description="See how complexity analysis applies to production software systems."
            colorScheme="orange"
            onClick={() => console.log('Navigate to Real-World Applications')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Advanced Topics"
            description="Dive into amortized analysis, NP-completeness, and optimization techniques."
            colorScheme="red"
            onClick={() => console.log('Navigate to Advanced Topics')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Practice Challenges"
            description="Test your understanding with interactive coding challenges and optimizations."
            colorScheme="indigo"
            onClick={() => console.log('Navigate to Practice Challenges')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Interactive Playground"
            description="Solve LeetCode-style problems with real-time visualizations and performance analysis."
            colorScheme="purple"
            onClick={() => (window.location.href = '/bigo?section=playground')}
          />
        </ThemeCard>
      </div>

      {/* Why Big-O Matters */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Big-O Notation Matters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🚀 Performance Prediction</h3>
            <p className="text-gray-700 mb-4">
              Big-O tells you how your algorithms will perform as data scales. A linear search that
              works fine with 100 items becomes unusable with 1 million items.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Example:</strong> Processing 1 million users with O(n²) algorithm = 1
                trillion operations!
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 Algorithm Selection</h3>
            <p className="text-gray-700 mb-4">
              Choose the right tool for the job. Understanding complexity helps you select
              algorithms that scale with your application's needs.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Pro Tip:</strong> O(n log n) sorting algorithms handle millions of items
                efficiently, while O(n²) sorts struggle with thousands.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  // Sidebar with quick facts and navigation
  const sidebarContent = (
    <div className="space-y-6">
      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Facts</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Big-O measures worst-case performance</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-500 mt-1">•</span>
            <span>O(1) is the ideal complexity</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-orange-500 mt-1">•</span>
            <span>O(n²) algorithms are often optimization targets</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-red-500 mt-1">•</span>
            <span>O(2^n) algorithms are impractical for large inputs</span>
          </li>
        </ul>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Complexity Classes</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-600 font-medium">O(1)</span>
            <span className="text-gray-600">Constant</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-green-600 font-medium">O(log n)</span>
            <span className="text-gray-600">Logarithmic</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-orange-600 font-medium">O(n)</span>
            <span className="text-gray-600">Linear</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-purple-600 font-medium">O(n log n)</span>
            <span className="text-gray-600">Linearithmic</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-red-600 font-medium">O(n²)</span>
            <span className="text-gray-600">Quadratic</span>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Learning Tips</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>🎯 Focus on worst-case analysis for reliability</p>
          <p>⚡ O(1) and O(log n) are your performance friends</p>
          <p>🚨 Watch out for nested loops creating O(n²)</p>
          <p>🔍 Test algorithms with large input sizes</p>
        </div>
      </ThemeCard>
    </div>
  );

  return (
    <>
      <SectionLayout
        section="bigo"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready to Master Algorithmic Complexity?"
        description="Dive deeper into Big-O notation and transform how you think about algorithm performance."
        buttonText="Start Learning"
        onButtonClick={() => console.log('Start Big-O learning journey')}
        colorScheme="blue"
      />
    </>
  );
};

export default Introduction;
