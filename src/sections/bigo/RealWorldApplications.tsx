// src/sections/bigo/RealWorldApplications.tsx
// Real-world applications of Big-O analysis in algorithms and data structures

import React, { useState } from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import StatsGrid from '../../components/shared/StatsGrid';
import CTASection from '../../components/shared/CTASection';
import ComplexityLandscape from '../../components/models3d/ComplexityLandscape3D';

interface ApplicationExample {
  category: string;
  name: string;
  description: string;
  algorithms: {
    name: string;
    complexity: string;
    useCase: string;
    pros: string[];
    cons: string[];
  }[];
  realWorldScenario: string;
  visualization: React.ReactNode;
}

const RealWorldApplications: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('sorting');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');

  const applicationExamples: ApplicationExample[] = [
    {
      category: 'sorting',
      name: 'Sorting Algorithms',
      description: 'Comparing different approaches to sorting data',
      algorithms: [
        {
          name: 'Quick Sort',
          complexity: 'O(n log n) average, O(n²) worst',
          useCase: 'General-purpose sorting, in-place sorting',
          pros: ['Fast in practice', 'In-place sorting', 'Good cache performance'],
          cons: ['Worst case O(n²)', 'Not stable', 'Recursive stack space'],
        },
        {
          name: 'Merge Sort',
          complexity: 'O(n log n) always',
          useCase: 'External sorting, stable sorting needed',
          pros: ['Guaranteed O(n log n)', 'Stable sort', 'Good for linked lists'],
          cons: ['O(n) extra space', 'Not in-place', 'Slower constants than quicksort'],
        },
        {
          name: 'Bubble Sort',
          complexity: 'O(n²) always',
          useCase: 'Educational purposes, nearly sorted data',
          pros: ['Simple to implement', 'Stable sort', 'In-place'],
          cons: ['Very slow', 'O(n²) complexity', 'Inefficient for large datasets'],
        },
        {
          name: 'Insertion Sort',
          complexity: 'O(n²) worst, O(n) best',
          useCase: 'Small datasets, online sorting',
          pros: ['Excellent for small n', 'Stable sort', 'In-place', 'Online algorithm'],
          cons: ['O(n²) worst case', 'Poor for large datasets'],
        },
      ],
      realWorldScenario:
        'A database needs to sort 1 million customer records by purchase history. Quick sort is chosen for its speed, but with a random pivot to avoid worst-case performance.',
      visualization: (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-6xl mb-4">🔀</div>
            <div className="text-2xl font-bold text-emerald-600">Sorting</div>
            <div className="text-sm text-gray-600">Organizing data efficiently</div>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <div className="w-3 h-3 bg-red-500 rounded"></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      category: 'searching',
      name: 'Search Algorithms',
      description: 'Finding elements in different data structures',
      algorithms: [
        {
          name: 'Binary Search',
          complexity: 'O(log n)',
          useCase: 'Searching sorted arrays, databases with sorted indexes',
          pros: ['Very fast', 'Simple to implement', 'Memory efficient'],
          cons: ['Requires sorted data', 'Not suitable for dynamic data'],
        },
        {
          name: 'Linear Search',
          complexity: 'O(n)',
          useCase: 'Small datasets, unsorted data, simple searches',
          pros: ['Works on any data', 'Simple implementation', 'No preprocessing needed'],
          cons: ['Slow for large datasets', 'Inefficient for frequent searches'],
        },
        {
          name: 'Hash Table Lookup',
          complexity: 'O(1) average',
          useCase: 'Key-value storage, caches, dictionaries',
          pros: ['Constant time lookup', 'Fast insertions/deletions', 'Flexible key types'],
          cons: ['Hash collisions', 'Extra memory overhead', 'No ordering'],
        },
        {
          name: 'Binary Search Tree',
          complexity: 'O(log n) average',
          useCase: 'Dynamic sorted data, ordered operations',
          pros: ['Maintains sorted order', 'Logarithmic operations', 'Dynamic insertions'],
          cons: ['Can become unbalanced', 'Extra memory per node', 'Complex implementation'],
        },
      ],
      realWorldScenario:
        'A search engine indexes billions of web pages. Binary search is used on sorted indexes, while hash tables provide O(1) lookups for frequently accessed data.',
      visualization: (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-2xl font-bold text-blue-600">Searching</div>
            <div className="text-sm text-gray-600">Finding data quickly</div>
            <div className="mt-4 flex justify-center">
              <div className="relative">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                  ?
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      category: 'data-structures',
      name: 'Data Structures',
      description: 'Choosing the right data structure for the job',
      algorithms: [
        {
          name: 'Array',
          complexity: 'O(1) access, O(n) search',
          useCase: 'Fixed-size collections, random access needed',
          pros: ['Fast random access', 'Memory efficient', 'Simple operations'],
          cons: ['Fixed size', 'Expensive insertions/deletions', 'Linear search'],
        },
        {
          name: 'Linked List',
          complexity: 'O(n) access, O(1) insert/delete at ends',
          useCase: 'Dynamic collections, frequent insertions/deletions',
          pros: ['Dynamic size', 'Efficient insertions/deletions', 'No wasted space'],
          cons: ['Slow random access', 'Extra memory per element', 'No cache locality'],
        },
        {
          name: 'Hash Table',
          complexity: 'O(1) average operations',
          useCase: 'Key-value storage, fast lookups',
          pros: ['Fast operations', 'Flexible keys', 'Good average performance'],
          cons: ['Hash collisions', 'No ordering', 'Memory overhead'],
        },
        {
          name: 'Binary Search Tree',
          complexity: 'O(log n) operations',
          useCase: 'Ordered data with dynamic operations',
          pros: ['Maintains order', 'Logarithmic operations', 'Dynamic'],
          cons: ['Can become unbalanced', 'Complex balancing needed'],
        },
      ],
      realWorldScenario:
        'A social media platform stores user relationships. Hash tables provide O(1) user lookups, while graphs with adjacency lists efficiently represent friend connections.',
      visualization: (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <div className="text-2xl font-bold text-purple-600">Data Structures</div>
            <div className="text-sm text-gray-600">Organizing data efficiently</div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <div className="w-4 h-4 bg-purple-400 rounded"></div>
              <div className="w-4 h-4 bg-purple-300 rounded"></div>
              <div className="w-4 h-4 bg-purple-200 rounded"></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      category: 'optimization',
      name: 'Algorithm Optimization',
      description: 'Improving performance through algorithmic choices',
      algorithms: [
        {
          name: 'Two Sum - Brute Force',
          complexity: 'O(n²)',
          useCase: 'Small datasets, simple implementation',
          pros: ['Simple to understand', 'Works on any data'],
          cons: ['Very slow', 'Inefficient for large n'],
        },
        {
          name: 'Two Sum - Hash Table',
          complexity: 'O(n)',
          useCase: 'Large datasets, performance critical',
          pros: ['Linear time', 'Single pass', 'Optimal for this problem'],
          cons: ['Extra space', 'Hash table overhead'],
        },
        {
          name: 'Fibonacci - Recursive',
          complexity: 'O(2^n)',
          useCase: 'Educational purposes',
          pros: ['Clean code', 'Easy to understand'],
          cons: ['Exponential time', 'Stack overflow risk'],
        },
        {
          name: 'Fibonacci - Dynamic Programming',
          complexity: 'O(n)',
          useCase: 'Computing Fibonacci numbers efficiently',
          pros: ['Linear time', 'Optimal space/time tradeoff'],
          cons: ['More complex implementation'],
        },
      ],
      realWorldScenario:
        'A financial trading system processes millions of transactions per second. O(n²) algorithms are replaced with O(n) or O(n log n) solutions to handle the volume.',
      visualization: (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-6xl mb-4">⚡</div>
            <div className="text-2xl font-bold text-orange-600">Optimization</div>
            <div className="text-sm text-gray-600">Making algorithms faster</div>
            <div className="mt-4 flex justify-center space-x-4">
              <div className="text-2xl">🐌</div>
              <div className="text-2xl">→</div>
              <div className="text-2xl">🚀</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Real-World Applications</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          See Big-O analysis in action across sorting algorithms, data structures, and optimization
          problems that matter in software development.
        </p>
        <div className="flex justify-center items-center space-x-4 mb-8">
          <div className="text-center">
            <div className="text-3xl">🏢</div>
            <div className="text-sm text-gray-600">Industry</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">💻</div>
            <div className="text-sm text-gray-600">Software</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">📊</div>
            <div className="text-sm text-gray-600">Performance</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">🎯</div>
            <div className="text-sm text-gray-600">Optimization</div>
          </div>
        </div>
      </div>

      <StatsGrid
        stats={[
          { label: 'Application Areas', value: '4', icon: '🏢' },
          { label: 'Algorithm Comparisons', value: '16', icon: '⚖️' },
          { label: 'Real Scenarios', value: '4', icon: '💼' },
          { label: 'Performance Insights', value: '∞', icon: '📈' },
        ]}
        colorScheme="emerald"
      />
    </div>
  );

  const renderCategorySelector = () => (
    <ThemeCard className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
        Choose an Application Area
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {applicationExamples.map((app) => (
          <button
            key={app.category}
            onClick={() => {
              setSelectedCategory(app.category);
              setSelectedAlgorithm('');
            }}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedCategory === app.category
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="text-center">
              {app.visualization}
              <div className="text-sm font-bold mt-2">{app.name}</div>
            </div>
          </button>
        ))}
      </div>
    </ThemeCard>
  );

  const renderApplicationDetails = () => {
    const application = applicationExamples.find((app) => app.category === selectedCategory);
    if (!application) return null;

    return (
      <div className="space-y-6">
        {/* Overview */}
        <ThemeCard className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{application.name}</h3>
              <p className="text-gray-700 mb-6">{application.description}</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Real-World Scenario</h4>
                <p className="text-blue-700 text-sm">{application.realWorldScenario}</p>
              </div>
            </div>

            <div className="flex items-center justify-center">{application.visualization}</div>
          </div>
        </ThemeCard>

        {/* Algorithm Comparison */}
        <ThemeCard className="p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Algorithm Comparison
          </h3>
          <div className="space-y-4">
            {application.algorithms.map((algorithm) => (
              <div
                key={algorithm.name}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAlgorithm === algorithm.name
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() =>
                  setSelectedAlgorithm(selectedAlgorithm === algorithm.name ? '' : algorithm.name)
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{algorithm.name}</h4>
                  <div className="text-emerald-600 font-mono font-bold">{algorithm.complexity}</div>
                </div>
                <p className="text-gray-700 text-sm mb-3">{algorithm.useCase}</p>

                {selectedAlgorithm === algorithm.name && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-green-600 mb-2">✅ Pros</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {algorithm.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-red-600 mb-2">❌ Cons</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {algorithm.cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ThemeCard>
      </div>
    );
  };

  const renderPerformanceInsights = () => (
    <div className="space-y-6">
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Performance Decision Framework
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-100 rounded-lg p-6 mb-4">
              <div className="text-4xl mb-2">🎯</div>
              <h4 className="font-bold text-green-800">Small Data (n &lt; 1000)</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Simple algorithms often perform well enough
            </p>
            <div className="space-y-2 text-sm">
              <div className="bg-green-50 p-2 rounded">O(n²) might be acceptable</div>
              <div className="bg-green-50 p-2 rounded">Readability matters</div>
              <div className="bg-green-50 p-2 rounded">Development speed prioritized</div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-yellow-100 rounded-lg p-6 mb-4">
              <div className="text-4xl mb-2">⚖️</div>
              <h4 className="font-bold text-yellow-800">Medium Data (1000 &lt; n &lt; 1M)</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">Balance between efficiency and complexity</p>
            <div className="space-y-2 text-sm">
              <div className="bg-yellow-50 p-2 rounded">O(n log n) preferred</div>
              <div className="bg-yellow-50 p-2 rounded">Consider constants</div>
              <div className="bg-yellow-50 p-2 rounded">Profile performance</div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-red-100 rounded-lg p-6 mb-4">
              <div className="text-4xl mb-2">🚀</div>
              <h4 className="font-bold text-red-800">Large Data (n &gt; 1M)</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Efficiency is critical, complexity is justified
            </p>
            <div className="space-y-2 text-sm">
              <div className="bg-red-50 p-2 rounded">Optimal algorithms required</div>
              <div className="bg-red-50 p-2 rounded">O(n²) usually unacceptable</div>
              <div className="bg-red-50 p-2 rounded">Advanced data structures</div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Common Optimization Patterns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-emerald-600">🔄 Algorithm Selection</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-emerald-50 p-3 rounded">
                <strong>Sorting:</strong> Quick sort for general use, merge sort for stability
              </div>
              <div className="bg-emerald-50 p-3 rounded">
                <strong>Searching:</strong> Hash tables for O(1), trees for O(log n)
              </div>
              <div className="bg-emerald-50 p-3 rounded">
                <strong>Dynamic data:</strong> Trees over arrays for frequent modifications
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-blue-600">💾 Space-Time Tradeoffs</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-blue-50 p-3 rounded">
                <strong>Memoization:</strong> O(n) space for O(2^n) → O(n) time
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <strong>Hash tables:</strong> O(n) space for O(1) lookups
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <strong>Precomputation:</strong> O(n) preprocessing for O(1) queries
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      {/* Category Selector */}
      {renderCategorySelector()}

      {/* Application Details */}
      {renderApplicationDetails()}

      {/* Performance Insights */}
      {renderPerformanceInsights()}

      {/* 3D Complexity Landscape */}
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          3D Algorithm Complexity Landscape
        </h3>
        <p className="text-gray-700 text-center mb-6">
          Explore algorithms in three-dimensional complexity space. Each point represents an
          algorithm, positioned by its time complexity (X), space complexity (Y), and overall
          efficiency (Z).
        </p>
        <ComplexityLandscape
          showAxes={true}
          showGrid={true}
          interactive={true}
          className="w-full"
        />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-1">Time Complexity (X-axis)</h4>
            <p className="text-blue-700">How algorithm performance scales with input size</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-1">Space Complexity (Y-axis)</h4>
            <p className="text-green-700">Memory usage relative to input size</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-1">Efficiency Score (Z-axis)</h4>
            <p className="text-purple-700">Overall algorithmic efficiency metric</p>
          </div>
        </div>
      </ThemeCard>

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemeCard>
          <NavigationCard
            title="Algorithm Analysis"
            description="Learn systematic methods to analyze code complexity with step-by-step examples."
            colorScheme="emerald"
            onClick={() => (window.location.href = '/bigo?section=algorithm-analysis')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Practice Challenges"
            description="Test your Big-O knowledge with interactive coding challenges and quizzes."
            colorScheme="blue"
            onClick={() => (window.location.href = '/bigo?section=practice-challenges')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Advanced Concepts"
            description="Explore amortized analysis, complexity hierarchies, and advanced algorithmic techniques."
            colorScheme="purple"
            onClick={() => (window.location.href = '/bigo?section=advanced-concepts')}
          />
        </ThemeCard>
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="space-y-6">
      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Application Areas</h3>
        <div className="space-y-2 text-sm">
          <div
            className={`p-2 rounded cursor-pointer ${
              selectedCategory === 'sorting'
                ? 'bg-emerald-100 text-emerald-800'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedCategory('sorting')}
          >
            🔀 Sorting Algorithms
          </div>
          <div
            className={`p-2 rounded cursor-pointer ${
              selectedCategory === 'searching'
                ? 'bg-emerald-100 text-emerald-800'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedCategory('searching')}
          >
            🔍 Search Algorithms
          </div>
          <div
            className={`p-2 rounded cursor-pointer ${
              selectedCategory === 'data-structures'
                ? 'bg-emerald-100 text-emerald-800'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedCategory('data-structures')}
          >
            🏗️ Data Structures
          </div>
          <div
            className={`p-2 rounded cursor-pointer ${
              selectedCategory === 'optimization'
                ? 'bg-emerald-100 text-emerald-800'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedCategory('optimization')}
          >
            ⚡ Algorithm Optimization
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Performance Scale</h3>
        <div className="space-y-2 text-sm">
          <div className="bg-green-100 p-2 rounded text-green-800">
            <div className="font-semibold">Excellent</div>
            <div className="text-xs">O(1), O(log n)</div>
          </div>
          <div className="bg-yellow-100 p-2 rounded text-yellow-800">
            <div className="font-semibold">Good</div>
            <div className="text-xs">O(n), O(n log n)</div>
          </div>
          <div className="bg-orange-100 p-2 rounded text-orange-800">
            <div className="font-semibold">Careful</div>
            <div className="text-xs">O(n²)</div>
          </div>
          <div className="bg-red-100 p-2 rounded text-red-800">
            <div className="font-semibold">Problematic</div>
            <div className="text-xs">O(2^n), O(n!)</div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Industry Applications</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            💻 <strong>Databases:</strong> Query optimization
          </p>
          <p>
            🌐 <strong>Web:</strong> Search engines, caching
          </p>
          <p>
            🎮 <strong>Games:</strong> Pathfinding, AI
          </p>
          <p>
            📱 <strong>Mobile:</strong> Battery optimization
          </p>
          <p>
            🤖 <strong>ML:</strong> Training efficiency
          </p>
          <p>
            ☁️ <strong>Cloud:</strong> Resource allocation
          </p>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Key Takeaways</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            🎯 <strong>Choose wisely:</strong> Right algorithm for the job
          </p>
          <p>
            📊 <strong>Measure performance:</strong> Profile, don't assume
          </p>
          <p>
            ⚖️ <strong>Trade-offs exist:</strong> Time vs space vs complexity
          </p>
          <p>
            🔄 <strong>Context matters:</strong> Data size and access patterns
          </p>
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
        title="Ready to Test Your Knowledge?"
        description="Challenge yourself with interactive coding problems and Big-O analysis exercises."
        buttonText="Start Challenges"
        onButtonClick={() => (window.location.href = '/bigo?section=practice-challenges')}
        colorScheme="emerald"
      />
    </>
  );
};

export default RealWorldApplications;
