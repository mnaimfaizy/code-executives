// src/sections/bigo/AdvancedConcepts.tsx
// Advanced Big-O concepts: Amortized Analysis and NP-Completeness

import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';
import {
  DynamicArrayVisualization,
  UnionFindVisualization,
  PNPSpaceVisualization,
  TSPVisualization,
} from '../visualizations/2d/metaphors';
import {
  DatabaseIndexingVisualization,
  SocialFeedVisualization,
  SearchEngineVisualization,
  NetworkRoutingVisualization,
} from '../visualizations/2d/casestudies';

const AdvancedConcepts: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'amortized' | 'np-complete' | 'tsp' | 'casestudies'>(
    'amortized'
  );
  const [activeCaseStudy, setActiveCaseStudy] = useState<
    'database' | 'social' | 'search' | 'network'
  >('database');

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Advanced Complexity: Beyond Basic Big-O
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Explore amortized analysis techniques and the fascinating world of NP-completeness.
          Understanding these concepts separates proficient developers from algorithmic masters.
        </p>
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveDemo('amortized')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeDemo === 'amortized'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Amortized Analysis
          </button>
          <button
            onClick={() => setActiveDemo('np-complete')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeDemo === 'np-complete'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            P vs NP
          </button>
          <button
            onClick={() => setActiveDemo('tsp')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeDemo === 'tsp'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Traveling Salesman
          </button>
          <button
            onClick={() => setActiveDemo('casestudies')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeDemo === 'casestudies'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Real-World Case Studies
          </button>
        </div>
      </div>

      <StatsGrid
        stats={[
          { label: 'Complexity Classes', value: '4+', icon: '🎯' },
          { label: 'NP-Complete Problems', value: '1000+', icon: '🧩' },
          { label: 'Real-World Case Studies', value: '4', icon: '🏢' },
          { label: 'Production Systems', value: 'Millions', icon: '🌍' },
        ]}
        colorScheme="emerald"
      />
    </div>
  );

  // Main content with advanced visualizations
  const mainContent = (
    <div className="space-y-8">
      {/* Interactive Demo Section */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Algorithmic Concepts</h2>
        <p className="text-gray-700 mb-6">
          Dive deep into sophisticated complexity analysis techniques that power modern software
          systems. These concepts explain why some algorithms perform better than their worst-case
          bounds suggest.
        </p>

        <div className="bg-gray-50 rounded-lg p-6">
          {activeDemo === 'amortized' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-emerald-600 mb-3">
                  Dynamic Arrays: Amortized O(1) Insertion
                </h3>
                <DynamicArrayVisualization className="w-full" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-600 mb-3">
                  Union-Find: Path Compression & Union by Rank
                </h3>
                <UnionFindVisualization className="w-full" />
              </div>
            </div>
          )}

          {activeDemo === 'np-complete' && (
            <div>
              <h3 className="text-lg font-semibold text-emerald-600 mb-3">P vs NP Problem Space</h3>
              <PNPSpaceVisualization className="w-full" />
            </div>
          )}

          {activeDemo === 'tsp' && (
            <div>
              <h3 className="text-lg font-semibold text-emerald-600 mb-3">
                Traveling Salesman Problem (TSP)
              </h3>
              <TSPVisualization className="w-full" />
            </div>
          )}

          {activeDemo === 'casestudies' && (
            <div className="space-y-6">
              <div className="flex justify-center space-x-2 mb-4">
                <button
                  onClick={() => setActiveCaseStudy('database')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeCaseStudy === 'database'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Database Indexing
                </button>
                <button
                  onClick={() => setActiveCaseStudy('social')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeCaseStudy === 'social'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Social Feed Ranking
                </button>
                <button
                  onClick={() => setActiveCaseStudy('search')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeCaseStudy === 'search'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Search Engines
                </button>
                <button
                  onClick={() => setActiveCaseStudy('network')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeCaseStudy === 'network'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Network Routing
                </button>
              </div>

              {activeCaseStudy === 'database' && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-3">
                    Database Indexing: B-Trees vs Hash Tables
                  </h3>
                  <DatabaseIndexingVisualization className="w-full" />
                </div>
              )}

              {activeCaseStudy === 'social' && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-3">
                    Social Feed Ranking: Priority Queues & Heaps
                  </h3>
                  <SocialFeedVisualization className="w-full" />
                </div>
              )}

              {activeCaseStudy === 'search' && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-3">
                    Search Engine Algorithms: Inverted Indexes
                  </h3>
                  <SearchEngineVisualization className="w-full" />
                </div>
              )}

              {activeCaseStudy === 'network' && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-3">
                    Network Routing: Dijkstra vs A* Search
                  </h3>
                  <NetworkRoutingVisualization className="w-full" />
                </div>
              )}
            </div>
          )}
        </div>
      </ThemeCard>

      {/* Learning Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ThemeCard>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Amortized Analysis</h3>
            <p className="text-gray-700 mb-4">
              When worst-case analysis is too pessimistic, amortized analysis shows the average
              performance over many operations. This technique explains why dynamic arrays and other
              data structures work efficiently in practice.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>• Aggregate Method:</strong> Total cost ÷ number of operations
              </p>
              <p>
                <strong>• Accounting Method:</strong> Prepaid costs for future operations
              </p>
              <p>
                <strong>• Potential Method:</strong> Stored energy in data structure state
              </p>
            </div>
          </div>
        </ThemeCard>

        <ThemeCard>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">NP-Completeness</h3>
            <p className="text-gray-700 mb-4">
              NP-complete problems are the hardest problems in NP. If you can solve any one
              NP-complete problem efficiently, you can solve all NP problems efficiently.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>• P:</strong> Problems solvable in polynomial time
              </p>
              <p>
                <strong>• NP:</strong> Problems verifiable in polynomial time
              </p>
              <p>
                <strong>• NP-Complete:</strong> Hardest problems in NP
              </p>
              <p>
                <strong>• NP-Hard:</strong> At least as hard as NP-complete
              </p>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* Key Insights */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why These Concepts Matter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🚀 Real-World Performance</h3>
            <p className="text-gray-700 mb-4">
              Amortized analysis explains why ArrayList in Java, vector in C++, and similar dynamic
              arrays work efficiently despite occasional expensive resizing operations.
            </p>
            <div className="bg-emerald-50 p-4 rounded-lg">
              <p className="text-sm text-emerald-800">
                <strong>Fact:</strong> HashMap's load factor management uses amortized analysis to
                maintain O(1) average-case performance.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 Algorithm Design</h3>
            <p className="text-gray-700 mb-4">
              Understanding NP-completeness helps you recognize when to use approximations,
              heuristics, or specialized algorithms instead of trying to find optimal solutions.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Pro Tip:</strong> Many real-world optimization problems (routing,
                scheduling, resource allocation) are NP-complete, so approximation algorithms are
                essential.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemeCard>
          <NavigationCard
            title="Core Big-O"
            description="Master the fundamental complexity classes and their applications."
            colorScheme="emerald"
            onClick={() => console.log('Navigate to Core Concepts')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Algorithm Analysis"
            description="Learn systematic techniques for analyzing code complexity."
            colorScheme="blue"
            onClick={() => console.log('Navigate to Algorithm Analysis')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Practice Challenges"
            description="Apply your knowledge with interactive coding challenges."
            colorScheme="purple"
            onClick={() => console.log('Navigate to Practice Challenges')}
          />
        </ThemeCard>
      </div>
    </div>
  );

  // Sidebar with key concepts
  const sidebarContent = (
    <div className="space-y-6">
      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Amortized Analysis Methods</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong className="text-emerald-600">Aggregate Analysis</strong>
            <p>Total operations cost ÷ number of operations</p>
          </div>
          <div>
            <strong className="text-emerald-600">Accounting Method</strong>
            <p>Charge extra for cheap operations to pay for expensive ones</p>
          </div>
          <div>
            <strong className="text-emerald-600">Potential Method</strong>
            <p>Energy stored in data structure state</p>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Famous NP-Complete Problems</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• Traveling Salesman Problem</p>
          <p>• Knapsack Problem</p>
          <p>• Boolean Satisfiability (SAT)</p>
          <p>• Graph Coloring</p>
          <p>• Hamiltonian Path</p>
          <p>• Subset Sum</p>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Complexity Relationships</h3>
        <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
          <p>
            <strong>If P = NP:</strong> Every efficiently verifiable problem is also efficiently
            solvable
          </p>
          <br />
          <p>
            <strong>If P ≠ NP:</strong> There are problems that are easy to check but hard to solve
          </p>
          <br />
          <p>
            <strong>Current consensus:</strong> P ≠ NP, but the question remains unsolved
          </p>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Practical Implications</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            🔍 <strong>Approximation Algorithms:</strong> Get close to optimal solutions efficiently
          </p>
          <p>
            🎲 <strong>Heuristics:</strong> Practical solutions that work well in practice
          </p>
          <p>
            ⚡ <strong>Special Cases:</strong> Many NP-complete problems become tractable with
            constraints
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
        title="Master Advanced Algorithmic Complexity"
        description="Continue your journey into the depths of computational complexity theory."
        buttonText="Explore More"
        onButtonClick={() => console.log('Continue advanced learning')}
        colorScheme="emerald"
      />
    </>
  );
};

export default AdvancedConcepts;
