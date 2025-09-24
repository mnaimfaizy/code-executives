import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from './../sections/git/Introduction';
import Architecture from './../sections/git/Architecture';
import ThreeTreeModel from './../sections/git/ThreeTreeModel';
import ObjectModel from './../sections/git/ObjectModel';
import CoreWorkflow from './../sections/git/CoreWorkflow';
import BranchingMerging from './../sections/git/BranchingMerging';
import ProfessionalWorkflows from './../sections/git/ProfessionalWorkflows';
import HistoryManagement from './../sections/git/HistoryManagement';
import Troubleshooting from './../sections/git/Troubleshooting';
import Visualization from './../sections/git/Visualization';

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'Git Architecture': Architecture,
  'Three-Tree Model': ThreeTreeModel,
  'Object Model': ObjectModel,
  'Core Workflow': CoreWorkflow,
  'Branching & Merging': BranchingMerging,
  'Professional Workflows': ProfessionalWorkflows,
  'History Management': HistoryManagement,
  Troubleshooting,
  Visualization,
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const GitPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;
  return (
    <div className="p-4 sm:p-6">
      <Component />
    </div>
  );
};

export default GitPage;
