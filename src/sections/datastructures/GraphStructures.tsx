import React, { useState } from 'react';
import { ArrowRight, Network, TrendingUp, MapPin, Zap, Route } from 'lucide-react';
import GraphVisualization from '../../components/models2d/datastructures/graph/GraphVisualization';
import BFSVisualization from '../../components/models2d/datastructures/graph/BFSVisualization';
import DFSVisualization from '../../components/models2d/datastructures/graph/DFSVisualization';
import DijkstraVisualization from '../../components/models2d/datastructures/graph/DijkstraVisualization';
import KruskalVisualization from '../../components/models2d/datastructures/graph/KruskalVisualization';
import ComplexityIndicator from '../../components/models2d/datastructures/shared/ComplexityIndicator';

const GraphStructures: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<
    'representation' | 'bfs' | 'dfs' | 'dijkstra' | 'mst'
  >('representation');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
          <Network className="w-8 h-8" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Graph Structures
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Complex network structures that model relationships between entities. Perfect for
          representing social networks, maps, dependencies, and countless real-world connections.
        </p>
      </div>

      {/* Introduction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Network className="w-6 h-6 mr-2 text-blue-600" />
              What are Graph Structures?
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Graphs are collections of vertices (nodes) connected by edges (links). They're
                incredibly versatile structures that can model virtually any relationship.
              </p>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Key Terminology:</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <strong>Vertex/Node:</strong> A single point in the graph
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <strong>Edge:</strong> A connection between two vertices
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    <strong>Degree:</strong> Number of edges connected to a vertex
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    <strong>Path:</strong> A sequence of vertices connected by edges
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Why Use Graphs?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>
                  <strong>Relationship modeling:</strong> Social networks, dependencies, connections
                </span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                <span>
                  <strong>Path finding:</strong> GPS navigation, network routing
                </span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-purple-600 flex-shrink-0" />
                <span>
                  <strong>Optimization:</strong> Resource allocation, scheduling
                </span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-orange-600 flex-shrink-0" />
                <span>
                  <strong>Analysis:</strong> Network analysis, recommendation systems
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {/* Graph Demo Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Interactive Graph Demos
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActiveDemo('representation')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeDemo === 'representation'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Representation
              </button>
              <button
                onClick={() => setActiveDemo('bfs')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeDemo === 'bfs'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                BFS
              </button>
              <button
                onClick={() => setActiveDemo('dfs')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeDemo === 'dfs'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                DFS
              </button>
              <button
                onClick={() => setActiveDemo('dijkstra')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeDemo === 'dijkstra'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Dijkstra's
              </button>
              <button
                onClick={() => setActiveDemo('mst')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeDemo === 'mst'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                MST
              </button>
            </div>

            {/* Active Demo */}
            <div className="min-h-[400px]">
              {activeDemo === 'representation' && (
                <GraphVisualization directed={false} weighted={false} />
              )}
              {activeDemo === 'bfs' && <BFSVisualization />}
              {activeDemo === 'dfs' && <DFSVisualization />}
              {activeDemo === 'dijkstra' && <DijkstraVisualization />}
              {activeDemo === 'mst' && <KruskalVisualization />}
            </div>
          </div>
        </div>
      </div>

      {/* Graph Types Comparison */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Types of Graphs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Directed Graph */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                <ArrowRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Directed Graph</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Edges have direction</p>
              </div>
            </div>

            <div className="space-y-3">
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• One-way relationships</li>
                <li>• Web pages linking to each other</li>
                <li>• Social media follows</li>
                <li>• Dependency graphs</li>
              </ul>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <ComplexityIndicator
                  timeComplexity="O(V + E)"
                  spaceComplexity="O(V + E)"
                  operation="Traversal"
                  explanation="V = vertices, E = edges. Space depends on representation method."
                  bestCase="O(1)"
                  averageCase="O(V + E)"
                  worstCase="O(V + E)"
                />
              </div>
            </div>
          </div>

          {/* Undirected Graph */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                <Network className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Undirected Graph
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bidirectional edges</p>
              </div>
            </div>

            <div className="space-y-3">
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Two-way relationships</li>
                <li>• Friendship networks</li>
                <li>• Road networks</li>
                <li>• Communication networks</li>
              </ul>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <ComplexityIndicator
                  timeComplexity="O(V + E)"
                  spaceComplexity="O(V + E)"
                  operation="Traversal"
                  explanation="Same complexity as directed graphs for most operations."
                  bestCase="O(1)"
                  averageCase="O(V + E)"
                  worstCase="O(V + E)"
                />
              </div>
            </div>
          </div>

          {/* Weighted Graph */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Weighted Graph</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Edges have values/costs</p>
              </div>
            </div>

            <div className="space-y-3">
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Distance, cost, or capacity values</li>
                <li>• GPS navigation systems</li>
                <li>• Network flow problems</li>
                <li>• Optimization algorithms</li>
              </ul>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <ComplexityIndicator
                  timeComplexity="O((V + E) log V)"
                  spaceComplexity="O(V + E)"
                  operation="Shortest Path (Dijkstra)"
                  explanation="Shortest path algorithms have higher complexity due to priority queue operations."
                  bestCase="O(V log V)"
                  averageCase="O((V + E) log V)"
                  worstCase="O((V + E) log V)"
                />
              </div>
            </div>
          </div>

          {/* Cyclic vs Acyclic */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-4">
                <Route className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Cyclic vs Acyclic
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">With or without cycles</p>
              </div>
            </div>

            <div className="space-y-3">
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>
                  • <strong>Acyclic:</strong> Trees, DAGs, hierarchies
                </li>
                <li>
                  • <strong>Cyclic:</strong> Social networks, circuits
                </li>
                <li>• Topological sorting (DAGs only)</li>
                <li>• Cycle detection algorithms</li>
              </ul>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <ComplexityIndicator
                  timeComplexity="O(V + E)"
                  spaceComplexity="O(V)"
                  operation="Cycle Detection"
                  explanation="DFS-based cycle detection has linear time complexity."
                  bestCase="O(V)"
                  averageCase="O(V + E)"
                  worstCase="O(V + E)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Algorithms Overview */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-2 text-purple-600" />
          Essential Graph Algorithms
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Breadth-First Search
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Level-by-level exploration
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div>• Shortest path in unweighted graphs</div>
              <div>• Level-order traversal</div>
              <div>• Connected components</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Depth-First Search</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Deep exploration first</p>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div>• Topological sorting</div>
              <div>• Cycle detection</div>
              <div>• Path finding</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Dijkstra's Algorithm
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Shortest weighted paths</p>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div>• GPS navigation</div>
              <div>• Network routing</div>
              <div>• Resource optimization</div>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Representations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Graph Representations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded mr-2 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">M</span>
              </div>
              Adjacency Matrix
            </h3>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded font-mono text-xs">
                {`  A B C
A 0 1 1
B 1 0 0  
C 1 0 0`}
              </div>
              <div className="space-y-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>
                    <strong>Pros:</strong> O(1) edge lookup, simple implementation
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>
                    <strong>Cons:</strong> O(V²) space, slow for sparse graphs
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded mr-2 flex items-center justify-center">
                <span className="text-xs font-bold text-green-600 dark:text-green-400">L</span>
              </div>
              Adjacency List
            </h3>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded font-mono text-xs">
                {`A: [B, C]
B: [A]
C: [A]`}
              </div>
              <div className="space-y-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>
                    <strong>Pros:</strong> O(V + E) space, efficient for sparse graphs
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>
                    <strong>Cons:</strong> O(V) edge lookup in worst case
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-World Applications */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Real-World Applications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Navigation Systems</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              GPS applications use weighted graphs to find optimal routes between locations,
              considering factors like distance, traffic, and road conditions.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Network className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Social Networks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Platforms like Facebook and LinkedIn model user relationships as graphs, enabling
              friend suggestions, influence analysis, and community detection.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Dependency Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Package managers and build systems use directed acyclic graphs (DAGs) to resolve
              dependencies and determine installation/compilation order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphStructures;
