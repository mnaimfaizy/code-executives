import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import ModuleQuizSection from '../../shared/components/quiz/ModuleQuizSection';

// Lazy load section components for better performance
import Introduction from './components/sections/Introduction';
const BackendEvolution = React.lazy(() => import('./components/sections/BackendEvolution'));
const ArchitecturePatterns = React.lazy(() => import('./components/sections/ArchitecturePatterns'));
const ResiliencePatterns = React.lazy(() => import('./components/sections/ResiliencePatterns'));
const DatabaseTheory = React.lazy(() => import('./components/sections/DatabaseTheory'));
const APIDesign = React.lazy(() => import('./components/sections/APIDesign'));
const RealTimeCommunication = React.lazy(
  () => import('./components/sections/RealTimeCommunication')
);
const Observability = React.lazy(() => import('./components/sections/Observability'));
const RequestLifecycle = React.lazy(() => import('./components/sections/RequestLifecycle'));
const Visualization = React.lazy(() => import('./components/sections/Visualization'));
const Quiz = () => <ModuleQuizSection moduleId="backend" />;

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'Backend Evolution': BackendEvolution,
  'Architecture Patterns': ArchitecturePatterns,
  'Resilience Patterns': ResiliencePatterns,
  'Database Theory': DatabaseTheory,
  'API Design': APIDesign,
  'Real-Time Communication': RealTimeCommunication,
  Observability,
  'Request Lifecycle': RequestLifecycle,
  Visualization,
  Quiz,
};

function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

const BackendPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;

  return (
    <div className="p-4 sm:p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  );
};

export default BackendPage;
