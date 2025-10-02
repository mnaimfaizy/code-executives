import React, { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';

// Lazy load all section components for better code splitting
const Introduction = lazy(() => import('./components/sections/Introduction'));
const Routing = lazy(() => import('./components/sections/Routing'));
const RenderingStrategies = lazy(() => import('./components/sections/RenderingStrategies'));
const ServerClientComponents = lazy(() => import('./components/sections/ServerClientComponents'));
const DataFetching = lazy(() => import('./components/sections/DataFetching'));
const Middleware = lazy(() => import('./components/sections/Middleware'));
const Optimization = lazy(() => import('./components/sections/Optimization'));

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'Routing Systems': Routing,
  'Rendering Strategies': RenderingStrategies,
  'Server & Client Components': ServerClientComponents,
  'Data Fetching & Mutations': DataFetching,
  'Middleware & Route Handlers': Middleware,
  'Optimization & Performance': Optimization,
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const NextJSPage: React.FC = () => {
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
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  );
};

export default NextJSPage;
