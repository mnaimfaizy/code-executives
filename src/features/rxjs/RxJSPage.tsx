import React, { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../../shared/components/feedback/ErrorBoundary';
import { LoadingFallback } from '../../shared/components/feedback/LoadingFallback';

// Lazy load all section components for better code splitting
const Introduction = lazy(() => import('./components/sections/Introduction'));
const ReactiveManifesto = lazy(() => import('./components/sections/ReactiveManifesto'));
const CoreComponents = lazy(() => import('./components/sections/CoreComponents'));
const Observables = lazy(() => import('./components/sections/Observables'));
const Operators = lazy(() => import('./components/sections/Operators'));
const Subjects = lazy(() => import('./components/sections/Subjects'));
const AdvancedOperators = lazy(() => import('./components/sections/AdvancedOperators'));
const MarbleDiagrams = lazy(() => import('./components/sections/MarbleDiagrams'));
const ErrorHandling = lazy(() => import('./components/sections/ErrorHandling'));
const RealWorldExamples = lazy(() => import('./components/sections/RealWorldExamples'));
const VisualizationTool = lazy(() => import('./components/sections/VisualizationTool'));
// More imports will be added as we create the sections

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'Reactive Manifesto': ReactiveManifesto,
  'Core Components': CoreComponents,
  Observables,
  Operators,
  Subjects,
  'Advanced Operators': AdvancedOperators,
  'Marble Diagrams': MarbleDiagrams,
  'Error Handling': ErrorHandling,
  'Real-World Examples': RealWorldExamples,
  'Visualization Tool': VisualizationTool,
  // More sections will be added here as we implement them
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const RxJSPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;
  return (
    <div className="p-4 sm:p-6">
      <ErrorBoundary level="feature">
        <Suspense fallback={<LoadingFallback variant="skeleton-page" />}>
          <Component />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default RxJSPage;
