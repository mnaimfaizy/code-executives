import React, { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../../shared/components/feedback/ErrorBoundary';
import { LoadingFallback } from '../../shared/components/feedback/LoadingFallback';

// Lazy load all section components for better code splitting
const Introduction = lazy(() => import('./components/sections/Introduction'));
const LinearStructures = lazy(() => import('./components/sections/LinearStructures'));
const Arrays = lazy(() => import('./components/sections/Arrays'));
const LinkedLists = lazy(() => import('./components/sections/LinkedLists'));
const Stacks = lazy(() => import('./components/sections/Stacks'));
const Queues = lazy(() => import('./components/sections/Queues'));
const HashTables = lazy(() => import('./components/sections/HashTables'));
const Sets = lazy(() => import('./components/sections/Sets'));
const Deques = lazy(() => import('./components/sections/Deques'));
const Strings = lazy(() => import('./components/sections/Strings'));
const TreeStructures = lazy(() => import('./components/sections/TreeStructures'));
const BinaryTrees = lazy(() => import('./components/sections/BinaryTrees'));
const BinarySearchTrees = lazy(() => import('./components/sections/BinarySearchTrees'));
const AVLTrees = lazy(() => import('./components/sections/AVLTrees'));
const RedBlackTrees = lazy(() => import('./components/sections/RedBlackTrees'));
const Heaps = lazy(() => import('./components/sections/Heaps'));
const BTrees = lazy(() => import('./components/sections/BTrees'));
const GraphStructures = lazy(() => import('./components/sections/GraphStructures'));
const GraphRepresentation = lazy(() => import('./components/sections/GraphRepresentation'));
const GraphTraversal = lazy(() => import('./components/sections/GraphTraversal'));
const ShortestPath = lazy(() => import('./components/sections/ShortestPath'));
const MinimumSpanningTree = lazy(() => import('./components/sections/MinimumSpanningTree'));
const GraphTypes = lazy(() => import('./components/sections/GraphTypes'));
const ComplexityAnalysis = lazy(() => import('./components/sections/ComplexityAnalysis'));
const RealWorldApplications = lazy(() => import('./components/sections/RealWorldApplications'));
const PracticeProblems = lazy(() => import('./components/sections/PracticeProblems'));
const Visualizations3D = lazy(() => import('./components/sections/Visualizations3D'));
const Playground = lazy(() => import('../../components/playground/Playground'));

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

/**
 * Data Structures Main Page
 * Interactive learning platform for understanding data structures
 */
const DataStructuresPage: React.FC = () => {
  const query = useQuery();
  const rawSection = query.get('section') || 'introduction';
  // Normalize section name to handle URL encoding and different formats
  const section = rawSection.toLowerCase().replace(/\s+/g, '-');

  const renderSection = () => {
    switch (section) {
      case 'introduction':
        return <Introduction />;
      case 'linear-structures':
        return <LinearStructures />;
      case 'arrays':
        return <Arrays />;
      case 'linked-lists':
        return <LinkedLists />;
      case 'stacks':
        return <Stacks />;
      case 'queues':
        return <Queues />;
      case 'hash-tables':
        return <HashTables />;
      case 'sets':
        return <Sets />;
      case 'deques':
        return <Deques />;
      case 'strings':
        return <Strings />;
      case 'tree-structures':
        return <TreeStructures />;
      case 'binary-trees':
        return <BinaryTrees />;
      case 'binary-search-trees':
        return <BinarySearchTrees />;
      case 'avl-trees':
        return <AVLTrees />;
      case 'red-black-trees':
        return <RedBlackTrees />;
      case 'heaps':
        return <Heaps />;
      case 'b-trees':
        return <BTrees />;
      case 'graph-structures':
        return <GraphStructures />;
      case 'graphs':
        return <GraphStructures />;
      case 'graph-representation':
        return <GraphRepresentation />;
      case 'graph-traversal':
        return <GraphTraversal />;
      case 'shortest-path':
        return <ShortestPath />;
      case 'minimum-spanning-tree':
        return <MinimumSpanningTree />;
      case 'graph-types':
        return <GraphTypes />;
      case 'complexity-analysis':
        return <ComplexityAnalysis />;
      case 'real-world-applications':
        return <RealWorldApplications />;
      case 'practice-problems':
        return <PracticeProblems />;
      case '3d-visualizations':
        return <Visualizations3D />;
      case 'playground':
        return <Playground />;
      default:
        return <Introduction />;
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <ErrorBoundary level="feature">
        <Suspense fallback={<LoadingFallback variant="skeleton-page" />}>
          {renderSection()}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default DataStructuresPage;
