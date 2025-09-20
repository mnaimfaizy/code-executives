import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import StatsGrid from '../../components/shared/StatsGrid';

const GraphTypes: React.FC = () => {
  const stats = [
    { label: 'Directed Graphs', value: 'One-way edges', description: 'Asymmetric relationships' },
    { label: 'Undirected Graphs', value: 'Two-way edges', description: 'Symmetric relationships' },
    { label: 'Weighted Graphs', value: 'Edge costs', description: 'Distance, capacity, time' },
    { label: 'Special Types', value: 'Trees, DAGs', description: 'Acyclic structures' },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Graph Types & Properties</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Explore the different types of graphs and their unique properties. Understanding graph
          types is crucial for choosing the right algorithms.
        </p>
      </div>
      <StatsGrid stats={stats} colorScheme="datastructures" />
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Directed vs Undirected Graphs</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Directed Graphs</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Example:</strong> Web pages linking to each other
                  </p>
                  <div className="text-center font-mono text-sm">
                    A → B (A links to B)
                    <br />B ⇏ A (B doesn't link back)
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Edges have direction (one-way)</li>
                  <li>• Represent asymmetric relationships</li>
                  <li>• Path existence depends on direction</li>
                  <li>• In-degree and out-degree matter</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Undirected Graphs</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Example:</strong> Friendship networks
                  </p>
                  <div className="text-center font-mono text-sm">
                    A — B (mutual friendship)
                    <br />A ↔ B (bidirectional)
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Edges are bidirectional</li>
                  <li>• Represent symmetric relationships</li>
                  <li>• Path exists in both directions</li>
                  <li>• Only degree (not in/out degree)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Weighted Graphs</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Weighted graphs assign costs, distances, or capacities to edges. This enables
            optimization problems like finding shortest paths or minimum spanning trees.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Weight Interpretations</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600 mr-3 mt-0.5">
                    D
                  </span>
                  <div>
                    <strong>Distance:</strong> Physical distance, travel time
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-600 mr-3 mt-0.5">
                    C
                  </span>
                  <div>
                    <strong>Cost:</strong> Monetary cost, energy consumption
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 mr-3 mt-0.5">
                    B
                  </span>
                  <div>
                    <strong>Bandwidth:</strong> Network capacity, data rate
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-xs font-bold text-teal-600 mr-3 mt-0.5">
                    R
                  </span>
                  <div>
                    <strong>Reliability:</strong> Connection strength, probability
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Example: Road Network</h3>
              <div className="bg-white p-4 rounded-lg mb-4">
                <div className="text-center font-mono text-sm mb-2">
                  A ————10———— B<br />
                  | |<br />
                  5 3<br />
                  | |<br />C ————7———— D
                </div>
                <p className="text-sm text-gray-700">
                  Numbers represent distances between cities. Finding shortest path from A to D.
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Shortest path:</strong> A → C → D (distance: 5 + 7 = 12)
                <br />
                <strong>Alternative:</strong> A → B → D (distance: 10 + 3 = 13)
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Special Graph Types</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Trees</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Connected acyclic graphs with exactly V-1 edges.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• No cycles</li>
                  <li>• Exactly one path between any two vertices</li>
                  <li>• Hierarchical structure</li>
                  <li>• Used in file systems, organization charts</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">DAGs</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Directed Acyclic Graphs - directed graphs with no cycles.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Directed edges, no cycles</li>
                  <li>• Topological ordering possible</li>
                  <li>• Task scheduling, dependency resolution</li>
                  <li>• Critical path analysis</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Bipartite Graphs</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Graphs whose vertices can be divided into two disjoint sets.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Two-colorable</li>
                  <li>• No edges within same set</li>
                  <li>• Matching problems</li>
                  <li>• Social network analysis</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Complete Graphs</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Every pair of vertices is connected by an edge.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Maximum number of edges</li>
                  <li>• Kₙ has n(n-1)/2 edges</li>
                  <li>• Used in theoretical analysis</li>
                  <li>• Dense graph representation</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sparse Graphs</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-700">Graphs with relatively few edges (E ≪ V²).</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• E is much smaller than V²</li>
                  <li>• Adjacency list is efficient</li>
                  <li>• Most real-world graphs are sparse</li>
                  <li>• Social networks, web graphs</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dense Graphs</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-700">Graphs with many edges (E ≈ V²).</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• E is close to V²</li>
                  <li>• Adjacency matrix is efficient</li>
                  <li>• Complete graphs are dense</li>
                  <li>• Matrix operations are feasible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Graph Properties & Metrics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connectivity Properties</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600 mr-3">
                    C
                  </div>
                  <div>
                    <strong>Connected:</strong> Path exists between every pair of vertices
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600 mr-3">
                    D
                  </div>
                  <div>
                    <strong>Disconnected:</strong> Some vertices are unreachable
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-600 mr-3">
                    S
                  </div>
                  <div>
                    <strong>Strongly Connected:</strong> Directed path in both directions
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600 mr-3">
                    W
                  </div>
                  <div>
                    <strong>Weakly Connected:</strong> Connected if ignoring directions
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Degree Metrics</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-xs font-bold text-teal-600 mr-3">
                    D
                  </div>
                  <div>
                    <strong>Degree:</strong> Number of edges connected to vertex
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-xs font-bold text-cyan-600 mr-3">
                    I
                  </div>
                  <div>
                    <strong>In-degree:</strong> Number of incoming edges (directed)
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 mr-3">
                    O
                  </div>
                  <div>
                    <strong>Out-degree:</strong> Number of outgoing edges (directed)
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 mr-3">
                    A
                  </div>
                  <div>
                    <strong>Average Degree:</strong> 2E/V for undirected graphs
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Cycle Properties</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cyclic Graphs</h3>
              <p className="text-gray-700 mb-3">
                Graphs that contain at least one cycle - a path that starts and ends at the same
                vertex.
              </p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Contain cycles of various lengths</li>
                <li>• May have multiple paths between vertices</li>
                <li>• Can be directed or undirected</li>
                <li>• Cycle detection is important</li>
                <li>• Used in deadlock detection, circuit analysis</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Acyclic Graphs</h3>
              <p className="text-gray-700 mb-3">
                Graphs with no cycles - trees and DAGs fall into this category.
              </p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• No cycles of any length</li>
                <li>• Exactly one path between any two vertices (trees)</li>
                <li>• Topological ordering possible (DAGs)</li>
                <li>• Used in dependency resolution</li>
                <li>• Critical for task scheduling</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Cycle Detection Algorithms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">DFS-based Detection</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use recursion stack or visited states</li>
                  <li>• Time: O(V + E)</li>
                  <li>• Space: O(V) for recursion</li>
                  <li>• Works for both directed and undirected</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Union-Find (Undirected)</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Add edges and check for same component</li>
                  <li>• Time: O(E α(V)) amortized</li>
                  <li>• Space: O(V) for parent array</li>
                  <li>• Very efficient for undirected graphs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Choosing the Right Graph Type</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                When to Use Directed Graphs
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Modeling one-way relationships</li>
                <li>• Web page linking structure</li>
                <li>• Task dependencies in workflows</li>
                <li>• Social media follow relationships</li>
                <li>• Citation networks</li>
                <li>• Transportation with one-way streets</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                When to Use Undirected Graphs
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Modeling mutual relationships</li>
                <li>• Friendship networks</li>
                <li>• Computer network topology</li>
                <li>• Road networks (bidirectional)</li>
                <li>• Molecular structures</li>
                <li>• Collaboration networks</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              When to Use Weighted Graphs
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Finding shortest/optimal paths</li>
              <li>• Resource allocation problems</li>
              <li>• Network flow optimization</li>
              <li>• Distance/cost calculations</li>
              <li>• Capacity constraints</li>
              <li>• Reliability metrics</li>
            </ul>
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
        title="Back to Graph Overview"
        description="Review all graph concepts and algorithms."
        buttonText="Graph Overview"
        onButtonClick={() => (window.location.href = '/datastructures?section=graphs')}
        colorScheme="datastructures"
      />
    </>
  );
};

export default GraphTypes;
