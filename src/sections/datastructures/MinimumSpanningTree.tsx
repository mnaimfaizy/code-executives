import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import StatsGrid from '../../components/shared/StatsGrid';
import KruskalVisualization from '../../components/models2d/datastructures/graph/KruskalVisualization';

const MinimumSpanningTree: React.FC = () => {
  const stats = [
    { label: 'Kruskal Time', value: 'O(E log E)', description: 'Sort edges + Union-Find' },
    { label: 'Prim Time', value: 'O((V+E) log V)', description: 'Priority Queue' },
    { label: 'MST Edges', value: 'V-1', description: 'Always connects all vertices' },
    { label: 'Applications', value: 'Network Design', description: 'Minimum cost connections' },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Minimum Spanning Tree</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Learn about algorithms that find the minimum cost subgraph connecting all vertices. MSTs
          are fundamental to network design and optimization problems.
        </p>
      </div>
      <StatsGrid stats={stats} colorScheme="datastructures" />
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">What is a Minimum Spanning Tree?</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            A Minimum Spanning Tree (MST) is a subset of edges that connects all vertices in a
            weighted undirected graph with the minimum possible total edge weight, without forming
            cycles.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">MST Properties</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Connects all vertices (spanning)</li>
                <li>• No cycles (tree property)</li>
                <li>• Minimum total edge weight</li>
                <li>• Unique for some graphs, multiple for others</li>
                <li>• Contains exactly V-1 edges</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-World Applications</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Network cable layout design</li>
                <li>• Transportation network planning</li>
                <li>• Cluster analysis in data mining</li>
                <li>• Image segmentation</li>
                <li>• Approximation algorithms</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Kruskal's Algorithm</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Kruskal's algorithm builds the MST by adding edges in order of increasing weight,
            skipping edges that would create cycles. It uses the Union-Find data structure.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Algorithm Steps</h3>
              <ol className="space-y-2 text-gray-700">
                <li>1. Sort all edges by weight (ascending)</li>
                <li>2. Initialize each vertex as its own component</li>
                <li>3. For each edge in sorted order:</li>
                <li className="ml-4">• If vertices are in different components</li>
                <li className="ml-4">• Add edge to MST</li>
                <li className="ml-4">• Union the components</li>
                <li>4. Stop when V-1 edges are added</li>
              </ol>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Greedy algorithm approach</li>
                <li>• Uses Union-Find for cycle detection</li>
                <li>• Works well with sparse graphs</li>
                <li>• Can be implemented with different Union-Find optimizations</li>
                <li>• Easy to understand and implement</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Kruskal's Algorithm Demo</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Watch Kruskal's algorithm build the MST by adding edges in order of increasing weight,
            ensuring no cycles are formed.
          </p>
          <KruskalVisualization className="w-full" />
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Prim's Algorithm</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Prim's algorithm grows the MST from a starting vertex, always adding the cheapest edge
            that connects a new vertex to the growing tree.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Algorithm Steps</h3>
              <ol className="space-y-2 text-gray-700">
                <li>1. Start with an arbitrary vertex</li>
                <li>2. Create a set of visited vertices</li>
                <li>3. While not all vertices are visited:</li>
                <li className="ml-4">• Find cheapest edge from visited to unvisited</li>
                <li className="ml-4">• Add edge to MST</li>
                <li className="ml-4">• Mark new vertex as visited</li>
                <li>4. Return MST when complete</li>
              </ol>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Grows tree from starting vertex</li>
                <li>• Uses priority queue for efficiency</li>
                <li>• Works well with dense graphs</li>
                <li>• Similar to Dijkstra's algorithm</li>
                <li>• Can be adapted for different implementations</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Kruskal vs Prim Comparison</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">When to Use Kruskal's</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Graph is sparse (few edges)</li>
                <li>• Edges are already sorted or easy to sort</li>
                <li>• Need to process edges in order</li>
                <li>• Union-Find is well-implemented</li>
                <li>• Working with disconnected graphs</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">When to Use Prim's</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Graph is dense (many edges)</li>
                <li>• Need to start from specific vertex</li>
                <li>• Priority queue is efficient</li>
                <li>• Working with adjacency matrix representation</li>
                <li>• Need intermediate MST states</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Performance Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Kruskal's Algorithm</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Time: O(E log E) for sorting</li>
                  <li>• Space: O(E + V) for edges and Union-Find</li>
                  <li>• Better for sparse graphs</li>
                  <li>• Simple cycle detection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Prim's Algorithm</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Time: O((V + E) log V) with heap</li>
                  <li>• Space: O(V) for priority queue</li>
                  <li>• Better for dense graphs</li>
                  <li>• More complex implementation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Union-Find Data Structure</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            The Union-Find (Disjoint Set) data structure is crucial for Kruskal's algorithm. It
            efficiently manages connectivity between components.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Find Operation</h3>
              <p className="text-gray-700 mb-3">Determines which component a vertex belongs to:</p>
              <div className="bg-white p-3 rounded font-mono text-sm">
                find(x):
                <br />
                if parent[x] != x:
                <br />
                &nbsp;&nbsp;return find(parent[x])
                <br />
                return x
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Union Operation</h3>
              <p className="text-gray-700 mb-3">Merges two components:</p>
              <div className="bg-white p-3 rounded font-mono text-sm">
                union(x, y):
                <br />
                rootX = find(x)
                <br />
                rootY = find(y)
                <br />
                if rootX != rootY:
                <br />
                &nbsp;&nbsp;parent[rootX] = rootY
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Optimizations</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>
                  <strong>Union by Rank:</strong> Attach smaller to larger tree
                </li>
                <li>
                  <strong>Path Compression:</strong> Flatten tree during find
                </li>
                <li>
                  <strong>Time Complexity:</strong> Nearly O(1) amortized
                </li>
                <li>
                  <strong>Space Complexity:</strong> O(V) for parent array
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">MST Properties & Theorems</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cut Property</h3>
              <p className="text-gray-700 mb-3">
                For any cut in the graph, the lightest edge across the cut is in some MST.
              </p>
              <div className="bg-white p-3 rounded text-sm">
                <strong>Implication:</strong> Greedy algorithms work because they always choose the
                lightest available edge that doesn't create a cycle.
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cycle Property</h3>
              <p className="text-gray-700 mb-3">
                In any cycle, the heaviest edge is not in any MST.
              </p>
              <div className="bg-white p-3 rounded text-sm">
                <strong>Implication:</strong> When adding edges, we can safely skip edges that would
                create cycles if a lighter alternative exists.
              </div>
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
        title="Explore Graph Types"
        description="Learn about different types of graphs and their properties."
        buttonText="Graph Types"
        onButtonClick={() => (window.location.href = '/datastructures?section=graph-types')}
        colorScheme="datastructures"
      />
    </>
  );
};

export default MinimumSpanningTree;
