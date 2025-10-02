import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from './components/sections/Introduction';
import LinearStructures from './components/sections/LinearStructures';
import Arrays from './components/sections/Arrays';
import LinkedLists from './components/sections/LinkedLists';
import Stacks from './components/sections/Stacks';
import Queues from './components/sections/Queues';
import HashTables from './components/sections/HashTables';
import Sets from './components/sections/Sets';
import Deques from './components/sections/Deques';
import Strings from './components/sections/Strings';
import TreeStructures from './components/sections/TreeStructures';
import BinaryTrees from './components/sections/BinaryTrees';
import BinarySearchTrees from './components/sections/BinarySearchTrees';
import AVLTrees from './components/sections/AVLTrees';
import RedBlackTrees from './components/sections/RedBlackTrees';
import Heaps from './components/sections/Heaps';
import BTrees from './components/sections/BTrees';
import GraphStructures from './components/sections/GraphStructures';
import GraphRepresentation from './components/sections/GraphRepresentation';
import GraphTraversal from './components/sections/GraphTraversal';
import ShortestPath from './components/sections/ShortestPath';
import MinimumSpanningTree from './components/sections/MinimumSpanningTree';
import GraphTypes from './components/sections/GraphTypes';
import ComplexityAnalysis from './components/sections/ComplexityAnalysis';
import RealWorldApplications from './components/sections/RealWorldApplications';
import PracticeProblems from './components/sections/PracticeProblems';
import Visualizations3D from './components/sections/Visualizations3D';
import Playground from '../../components/playground/Playground';

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

  return <div className="p-4 sm:p-6">{renderSection()}</div>;
};

export default DataStructuresPage;
