import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import DijkstraVisualization from '../visualizations/2d/graph/DijkstraVisualization';

const ShortestPath: React.FC = () => {
  const stats = [
    { label: 'Time Complexity', value: 'O((V+E)log V)', description: 'With Binary Heap' },
    { label: 'Space Complexity', value: 'O(V)', description: 'Priority Queue' },
    { label: 'Works With', value: 'Positive Weights', description: 'Non-negative edges' },
    { label: 'Applications', value: 'GPS Routing', description: 'Network optimization' },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Shortest Path Algorithms</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Discover Dijkstra's algorithm, the cornerstone of shortest path finding in weighted
          graphs. Learn how it powers GPS navigation and network routing systems.
        </p>
      </div>
      <StatsGrid stats={stats} colorScheme="datastructures" />
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Dijkstra's Algorithm</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Dijkstra's algorithm finds the shortest path between a source vertex and all other
            vertices in a weighted graph with non-negative edge weights. It's a greedy algorithm
            that always chooses the closest unvisited vertex.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Algorithm Steps</h3>
              <ol className="space-y-2 text-gray-700">
                <li>1. Initialize distances: source = 0, others = ∞</li>
                <li>2. Create priority queue with all vertices</li>
                <li>3. While queue is not empty:</li>
                <li className="ml-4">• Extract vertex with minimum distance</li>
                <li className="ml-4">• Update distances of its neighbors</li>
                <li className="ml-4">• Mark vertex as visited</li>
                <li>4. Return shortest path distances</li>
              </ol>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Properties</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Works only with non-negative weights</li>
                <li>• Greedy algorithm approach</li>
                <li>• Uses priority queue for efficiency</li>
                <li>• Finds shortest path to all vertices</li>
                <li>• Optimal for single-source shortest paths</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Interactive Dijkstra Demo</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Watch Dijkstra's algorithm in action. The algorithm progressively finds shorter paths
            and updates distances as it explores the graph.
          </p>
          <DijkstraVisualization className="w-full" />
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Why Dijkstra Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Greedy Choice Property</h3>
              <p className="text-gray-700 mb-3">
                At each step, Dijkstra chooses the vertex with the smallest tentative distance. This
                greedy choice is always optimal because:
              </p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• No shorter path exists to chosen vertex</li>
                <li>• All future paths will be longer</li>
                <li>• The choice is irrevocable and optimal</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Relaxation Process</h3>
              <p className="text-gray-700 mb-3">The relaxation step updates neighbor distances:</p>
              <div className="bg-white p-3 rounded font-mono text-sm mb-3">
                if distance[u] + weight(u,v) &lt; distance[v]:
                <br />
                &nbsp;&nbsp;distance[v] = distance[u] + weight(u,v)
              </div>
              <p className="text-gray-700 text-sm">
                This ensures we always have the shortest known path to each vertex.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Implementation Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Priority Queue Implementation
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800">Binary Heap: O((V+E) log V)</h4>
                  <p className="text-sm text-gray-600">
                    Standard implementation with good performance
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Fibonacci Heap: O(V log V + E)</h4>
                  <p className="text-sm text-gray-600">
                    Theoretical optimal but complex to implement
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Structures Used</h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Distance Array:</strong> Stores shortest distances
                </li>
                <li>
                  <strong>Priority Queue:</strong> Selects next vertex to process
                </li>
                <li>
                  <strong>Visited Set:</strong> Tracks processed vertices
                </li>
                <li>
                  <strong>Previous Array:</strong> Reconstructs paths
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Real-World Applications</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">GPS Navigation</h3>
              <p className="text-sm text-gray-700">
                Finds optimal routes considering distance, traffic, and road conditions
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Network Routing</h3>
              <p className="text-sm text-gray-700">
                Determines shortest paths in computer networks and telecommunications
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resource Optimization</h3>
              <p className="text-sm text-gray-700">
                Optimizes resource allocation and scheduling in various systems
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Limitations & Alternatives</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dijkstra's Limitations</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Doesn't work with negative edge weights</li>
                <li>• Can be slow for dense graphs</li>
                <li>• Not suitable for all-pairs shortest paths</li>
                <li>• Requires non-negative weights assumption</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Alternative Algorithms</h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Bellman-Ford:</strong> Handles negative weights
                </li>
                <li>
                  <strong>Floyd-Warshall:</strong> All-pairs shortest paths
                </li>
                <li>
                  <strong>A* Search:</strong> Heuristic-based optimization
                </li>
                <li>
                  <strong>Bidirectional Dijkstra:</strong> Faster convergence
                </li>
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
        title="Explore Spanning Trees"
        description="Learn about minimum spanning tree algorithms and their applications."
        buttonText="Minimum Spanning Tree"
        onButtonClick={() =>
          (window.location.href = '/datastructures?section=minimum-spanning-tree')
        }
        colorScheme="datastructures"
      />
    </>
  );
};

export default ShortestPath;
