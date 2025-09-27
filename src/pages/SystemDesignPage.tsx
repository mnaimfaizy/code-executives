import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';

// Lazy load section components for better performance
const Introduction = React.lazy(() => import('../sections/systemdesign/Introduction'));
const ArchitecturePatterns = React.lazy(
  () => import('../sections/systemdesign/ArchitecturePatterns')
);
const DistributedSystems = React.lazy(() => import('../sections/systemdesign/DistributedSystems'));
const ScalingStrategies = React.lazy(() => import('../sections/systemdesign/ScalingStrategies'));
const DesignPrinciples = React.lazy(() => import('../sections/systemdesign/DesignPrinciples'));
const CaseStudies = React.lazy(() => import('../sections/systemdesign/CaseStudies'));
const Visualization = React.lazy(() => import('../sections/systemdesign/Visualization'));

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'Architecture Patterns': ArchitecturePatterns,
  'Distributed Systems': DistributedSystems,
  'Scaling Strategies': ScalingStrategies,
  'Design Principles': DesignPrinciples,
  'Case Studies': CaseStudies,
  Visualization,
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SystemDesignPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;

  return (
    <div className="p-4 sm:p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  );
};

export default SystemDesignPage;
