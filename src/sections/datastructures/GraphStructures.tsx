import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import StatsGrid from '../../components/shared/StatsGrid';
import GraphVisualization from '../../components/models2d/datastructures/graph/GraphVisualization';

const GraphStructures: React.FC = () => {
  const stats = [
    { label: 'Graph Types', value: '7+', description: 'Directed, Undirected, Weighted, etc.' },
    { label: 'Algorithms', value: '10+', description: 'Traversal, Shortest Path, MST' },
    { label: 'Applications', value: '15+', description: 'Social Networks, Maps, Networks' },
    { label: 'Complexity', value: 'O(V+E)', description: 'Typical Graph Operations' },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Graph Structures</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Explore the fundamental concepts of graph theory and algorithms that power modern
          computing systems. From social networks to GPS routing, graphs are everywhere in computer
          science.
        </p>
      </div>
      <StatsGrid stats={stats} colorScheme="datastructures" />
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">What are Graphs?</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Graphs are fundamental data structures that represent relationships between objects.
            They consist of vertices (nodes) connected by edges, making them perfect for modeling
            complex relationships in real-world scenarios.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Components</h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Vertices (Nodes):</strong> Objects being represented
                </li>
                <li>
                  <strong>Edges:</strong> Relationships between vertices
                </li>
                <li>
                  <strong>Weight:</strong> Cost or distance of relationships
                </li>
                <li>
                  <strong>Direction:</strong> One-way or bidirectional relationships
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-World Applications</h3>
              <ul className="space-y-2 text-gray-700">
                <li>Social Network Connections</li>
                <li>GPS and Route Planning</li>
                <li>Computer Network Topology</li>
                <li>Dependency Management</li>
                <li>Recommendation Systems</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Interactive Graph Visualization</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Explore how graphs work with this interactive visualization. You can add vertices,
            create edges, and see how different algorithms traverse the graph structure.
          </p>
          <GraphVisualization directed={false} weighted={false} className="w-full" />
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
        title="Ready to Dive Deeper?"
        description="Explore specific graph algorithms and implementations in detail."
        buttonText="Explore Graph Algorithms"
        onButtonClick={() =>
          (window.location.href = '/datastructures?section=graph-representation')
        }
        colorScheme="datastructures"
      />
    </>
  );
};

export default GraphStructures;
