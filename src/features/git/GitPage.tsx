import React from 'react';
import { useLocation } from 'react-router-dom';
import { SEO } from '../../shared/components/SEO/SEO';
import Introduction from './components/sections/Introduction';
import Architecture from './components/sections/Architecture';
import ThreeTreeModel from './components/sections/ThreeTreeModel';
import ObjectModel from './components/sections/ObjectModel';
import CoreWorkflow from './components/sections/CoreWorkflow';
import BranchingMerging from './components/sections/BranchingMerging';
import ProfessionalWorkflows from './components/sections/ProfessionalWorkflows';
import HistoryManagement from './components/sections/HistoryManagement';
import Troubleshooting from './components/sections/Troubleshooting';
import Visualization from './components/sections/Visualization';

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
    <>
      <SEO
        title="Git Version Control & Workflows"
        description="Learn Git fundamentals with visual diagrams of branching, merging, and the Three-Tree architecture. Master professional Git workflows and troubleshooting."
        keywords={[
          'git tutorial',
          'version control',
          'git branching',
          'git workflow',
          'git merge',
          'git rebase',
          'distributed version control',
          'git commands',
        ]}
        canonicalUrl="https://code-executives.com/git"
      />
      <div className="p-4 sm:p-6">
        <Component />
      </div>
    </>
  );
};

export default GitPage;
