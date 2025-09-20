import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Introduction from '../sections/datastructures/Introduction';
import LinearStructures from '../sections/datastructures/LinearStructures';
import Arrays from '../sections/datastructures/Arrays';
import LinkedLists from '../sections/datastructures/LinkedLists';
import Stacks from '../sections/datastructures/Stacks';
import Queues from '../sections/datastructures/Queues';
import HashTables from '../sections/datastructures/HashTables';
import TreeStructures from '../sections/datastructures/TreeStructures';
import GraphStructures from '../sections/datastructures/GraphStructures';
import ComplexityAnalysis from '../sections/datastructures/ComplexityAnalysis';
import RealWorldApplications from '../sections/datastructures/RealWorldApplications';
import PracticeProblems from '../sections/datastructures/PracticeProblems';
import Visualizations3D from '../sections/datastructures/Visualizations3D';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

/**
 * Data Structures Main Page
 * Interactive learning platform for understanding data structures
 */
const DataStructuresPage: React.FC = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const rawSection = query.get('section') || 'introduction';
  // Normalize section name to handle URL encoding and different formats
  const section = rawSection.toLowerCase().replace(/\s+/g, '-');

  const handleNavigate = (newSection: string) => {
    navigate(`/data-structures?section=${newSection}`);
  };

  const renderSection = () => {
    switch (section) {
      case 'introduction':
        return <Introduction />;
      case 'linear-structures':
        return <LinearStructures onNavigate={handleNavigate} />;
      case 'arrays':
        return <Arrays onNavigate={handleNavigate} />;
      case 'linked-lists':
        return <LinkedLists onNavigate={handleNavigate} />;
      case 'stacks':
        return <Stacks onNavigate={handleNavigate} />;
      case 'queues':
        return <Queues onNavigate={handleNavigate} />;
      case 'hash-tables':
        return <HashTables onNavigate={handleNavigate} />;
      case 'tree-structures':
      case 'binary-trees':
      case 'binary-search-trees':
      case 'avl-trees':
      case 'red-black-trees':
      case 'heaps':
      case 'b-trees':
        return <TreeStructures />;
      case 'graph-structures':
        return <GraphStructures />;
      case 'complexity-analysis':
        return <ComplexityAnalysis />;
      case 'real-world-applications':
        return <RealWorldApplications />;
      case 'practice-problems':
        return <PracticeProblems />;
      case '3d-visualizations':
        return <Visualizations3D />;
      default:
        return <Introduction />;
    }
  };

  return <div className="p-4 sm:p-6">{renderSection()}</div>;
};

export default DataStructuresPage;
