import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import GraphVisualization from '../visualizations/2d/graph/GraphVisualization';

const GraphRepresentation: React.FC = () => {
  const stats = [
    { label: 'Matrix Space', value: 'O(V²)', description: 'Adjacency Matrix' },
    { label: 'List Space', value: 'O(V+E)', description: 'Adjacency List' },
    { label: 'Matrix Lookup', value: 'O(1)', description: 'Edge Existence' },
    { label: 'List Lookup', value: 'O(V)', description: 'Edge Existence' },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Graph Representation</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Learn how to represent graphs in memory using different data structures. Each
          representation has its own advantages and trade-offs.
        </p>
      </div>
      <StatsGrid stats={stats} colorScheme="datastructures" />
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Adjacency Matrix</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            A 2D array where matrix[i][j] represents the edge between vertices i and j. This
            representation is simple but can be space-inefficient for sparse graphs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Example Matrix</h3>
              <div className="bg-white p-4 rounded-lg font-mono text-sm">
                <div className="text-center mb-2 text-gray-600">Undirected Graph: A-B-C</div>
                <pre className="text-center">
                  {`   A  B  C
A  0  1  1
B  1  0  0
C  1  0  0`}
                </pre>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Advantages</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• O(1) edge existence check</li>
                <li>• Simple to implement</li>
                <li>• Easy to add/remove edges</li>
                <li>• Good for dense graphs</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Disadvantages</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• O(V²) space complexity</li>
              <li>• Wasteful for sparse graphs</li>
              <li>• Iterating neighbors is O(V)</li>
              <li>• Not suitable for dynamic graphs</li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Adjacency List</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            An array of lists where each list contains the neighbors of a vertex. This
            representation is space-efficient and commonly used in practice.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Example List</h3>
              <div className="bg-white p-4 rounded-lg font-mono text-sm">
                <div className="text-center mb-2 text-gray-600">Undirected Graph: A-B-C</div>
                <pre className="text-left">
                  {`A: [B, C]
B: [A]
C: [A]`}
                </pre>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Advantages</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• O(V + E) space complexity</li>
                <li>• Efficient for sparse graphs</li>
                <li>• Fast neighbor iteration</li>
                <li>• Memory efficient</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Disadvantages</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• O(V) edge existence check</li>
              <li>• More complex implementation</li>
              <li>• Slower for dense graphs</li>
              <li>• Less cache-friendly</li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Interactive Visualization</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Experiment with different graph representations and see how they affect memory usage and
            performance characteristics.
          </p>
          <GraphVisualization directed={false} weighted={false} className="w-full" />
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">When to Use Each</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Use Adjacency Matrix When:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Graph is dense (E ≈ V²)</li>
                <li>• Need fast edge lookups</li>
                <li>• Memory is not a concern</li>
                <li>• Working with small graphs</li>
                <li>• Need matrix operations</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Use Adjacency List When:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Graph is sparse (E ≪ V²)</li>
                <li>• Need to iterate neighbors</li>
                <li>• Memory efficiency matters</li>
                <li>• Working with large graphs</li>
                <li>• Dynamic graph modifications</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  const sidebarContent = (
    <div className="space-y-4">
      <ThemeCard>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Graph Topics</h3>
        <div className="space-y-2">
          <NavigationCard
            title="Graph Overview"
            description="Basic concepts and terminology"
            colorScheme="datastructures"
            onClick={() => (window.location.href = '/datastructures?section=graphs')}
          />
          <NavigationCard
            title="Graph Representation"
            description="Adjacency Matrix vs List"
            colorScheme="datastructures"
            onClick={() => (window.location.href = '/datastructures?section=graph-representation')}
          />
          <NavigationCard
            title="Graph Traversal"
            description="BFS and DFS Algorithms"
            colorScheme="datastructures"
            onClick={() => (window.location.href = '/datastructures?section=graph-traversal')}
          />
          <NavigationCard
            title="Shortest Path"
            description="Dijkstra's Algorithm"
            colorScheme="datastructures"
            onClick={() => (window.location.href = '/datastructures?section=shortest-path')}
          />
          <NavigationCard
            title="Minimum Spanning Tree"
            description="Kruskal's and Prim's"
            colorScheme="datastructures"
            onClick={() => (window.location.href = '/datastructures?section=minimum-spanning-tree')}
          />
          <NavigationCard
            title="Graph Types"
            description="Directed, Undirected, Weighted"
            colorScheme="datastructures"
            onClick={() => (window.location.href = '/datastructures?section=graph-types')}
          />
        </div>
      </ThemeCard>
    </div>
  );

  return (
    <>
      <SectionLayout
        section="datastructures"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Explore Graph Algorithms"
        description="Learn how different algorithms work with these representations."
        buttonText="Graph Traversal"
        onButtonClick={() => (window.location.href = '/datastructures?section=graph-traversal')}
        colorScheme="datastructures"
      />
    </>
  );
};

export default GraphRepresentation;
