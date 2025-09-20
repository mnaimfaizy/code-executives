import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import StatsGrid from '../../components/shared/StatsGrid';
import BFSVisualization from '../../components/models2d/datastructures/graph/BFSVisualization';
import DFSVisualization from '../../components/models2d/datastructures/graph/DFSVisualization';

const GraphTraversal: React.FC = () => {
  const stats = [
    { label: 'BFS Time', value: 'O(V+E)', description: 'Breadth-First Search' },
    { label: 'DFS Time', value: 'O(V+E)', description: 'Depth-First Search' },
    { label: 'BFS Space', value: 'O(V)', description: 'Queue-based' },
    { label: 'DFS Space', value: 'O(V)', description: 'Stack-based' },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Graph Traversal</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Master the fundamental algorithms for exploring graphs: Breadth-First Search (BFS) and
          Depth-First Search (DFS). Each has unique characteristics and use cases.
        </p>
      </div>
      <StatsGrid stats={stats} colorScheme="datastructures" />
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Breadth-First Search (BFS)</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            BFS explores the graph level by level, visiting all neighbors of a vertex before moving
            to the next level. It's perfect for finding shortest paths in unweighted graphs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How BFS Works</h3>
              <ol className="space-y-2 text-gray-700">
                <li>1. Start with a source vertex</li>
                <li>2. Visit all its unvisited neighbors</li>
                <li>3. Mark them as visited and enqueue</li>
                <li>4. Dequeue next vertex and repeat</li>
                <li>5. Continue until queue is empty</li>
              </ol>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">BFS Applications</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Shortest path in unweighted graphs</li>
                <li>• Level-order tree traversal</li>
                <li>• Finding connected components</li>
                <li>• Web crawling (BFS for breadth)</li>
                <li>• Social network analysis</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">BFS Characteristics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Time Complexity: O(V + E)</h4>
                <p className="text-sm text-gray-600">Each vertex and edge is visited once</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Space Complexity: O(V)</h4>
                <p className="text-sm text-gray-600">Queue can hold all vertices in worst case</p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">BFS Interactive Demo</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Watch BFS in action. The algorithm explores the graph level by level, finding the
            shortest path to each reachable vertex.
          </p>
          <BFSVisualization className="w-full" />
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Depth-First Search (DFS)</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            DFS explores as far as possible along each branch before backtracking. It's useful for
            topological sorting and finding connected components.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How DFS Works</h3>
              <ol className="space-y-2 text-gray-700">
                <li>1. Start with a source vertex</li>
                <li>2. Visit an unvisited neighbor</li>
                <li>3. Mark it as visited and recurse</li>
                <li>4. Backtrack when no unvisited neighbors</li>
                <li>5. Continue until all reachable vertices visited</li>
              </ol>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">DFS Applications</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Topological sorting</li>
                <li>• Cycle detection</li>
                <li>• Path finding in mazes</li>
                <li>• Solving puzzles (backtracking)</li>
                <li>• Finding strongly connected components</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">DFS Characteristics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Time Complexity: O(V + E)</h4>
                <p className="text-sm text-gray-600">Each vertex and edge is visited once</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Space Complexity: O(V)</h4>
                <p className="text-sm text-gray-600">Recursion stack can reach O(V) depth</p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">DFS Interactive Demo</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Observe DFS exploring deep into the graph before backtracking. Notice how it creates a
            depth-first spanning tree.
          </p>
          <DFSVisualization className="w-full" />
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">BFS vs DFS Comparison</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">When to Use BFS</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Finding shortest paths (unweighted)</li>
                <li>• Level-order processing needed</li>
                <li>• Graph is wide and shallow</li>
                <li>• Memory is not a major constraint</li>
                <li>• Need to find minimum steps</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">When to Use DFS</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Finding any path (not necessarily shortest)</li>
                <li>• Graph is deep and narrow</li>
                <li>• Need topological ordering</li>
                <li>• Memory efficiency is important</li>
                <li>• Solving puzzles or games</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Implementation Differences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">BFS Implementation</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Uses Queue data structure</li>
                  <li>• Iterative approach</li>
                  <li>• FIFO (First In, First Out)</li>
                  <li>• Explores breadth first</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">DFS Implementation</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Uses Stack (recursion)</li>
                  <li>• Can be recursive or iterative</li>
                  <li>• LIFO (Last In, First Out)</li>
                  <li>• Explores depth first</li>
                </ul>
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
        title="Explore Advanced Algorithms"
        description="Learn shortest path and minimum spanning tree algorithms."
        buttonText="Shortest Path"
        onButtonClick={() => (window.location.href = '/datastructures?section=shortest-path')}
        colorScheme="datastructures"
      />
    </>
  );
};

export default GraphTraversal;
