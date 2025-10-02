import React, { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';

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
      <Suspense
        fallback={
          <div className="space-y-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-96 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  );
};

export default RxJSPage;
