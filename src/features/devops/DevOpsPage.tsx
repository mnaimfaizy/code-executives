import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import ModuleQuizSection from '../../shared/components/quiz/ModuleQuizSection';

// Lazy load section components for better performance
import Introduction from './components/sections/Introduction';
const CICDPipeline = React.lazy(() => import('./components/sections/CICDPipeline'));
const CloudServiceModels = React.lazy(() => import('./components/sections/CloudServiceModels'));
const CloudArchitecture = React.lazy(() => import('./components/sections/CloudArchitecture'));
const ContainerOrchestration = React.lazy(
  () => import('./components/sections/ContainerOrchestration')
);
const InfrastructureAsCode = React.lazy(() => import('./components/sections/InfrastructureAsCode'));
const ModernDevRoles = React.lazy(() => import('./components/sections/ModernDevRoles'));
const Observability = React.lazy(() => import('./components/sections/Observability'));
const Quiz = () => <ModuleQuizSection moduleId="devops" />;

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'CI/CD Pipeline': CICDPipeline,
  'Cloud Service Models': CloudServiceModels,
  'Cloud Architecture': CloudArchitecture,
  'Container Orchestration': ContainerOrchestration,
  'Infrastructure as Code': InfrastructureAsCode,
  'Modern Dev Roles': ModernDevRoles,
  Observability,
  Quiz,
};

function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

const DevOpsPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;

  return (
    <div className="p-4 sm:p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  );
};

export default DevOpsPage;
