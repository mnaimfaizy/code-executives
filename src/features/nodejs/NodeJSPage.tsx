import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';

// Lazy load section components for better performance
import Introduction from './components/sections/Introduction';
const EventLoop = React.lazy(() => import('./components/sections/EventLoop'));
const AsyncProgramming = React.lazy(() => import('./components/sections/AsyncProgramming'));
const BuffersStreams = React.lazy(() => import('./components/sections/BuffersStreams'));
const Scaling = React.lazy(() => import('./components/sections/Scaling'));
const MemoryManagement = React.lazy(() => import('./components/sections/MemoryManagement'));
const ModuleSystem = React.lazy(() => import('./components/sections/ModuleSystem'));
const PackageManagers = React.lazy(() => import('./components/sections/PackageManagers'));
const Frameworks = React.lazy(() => import('./components/sections/Frameworks'));
const RuntimeWars = React.lazy(() => import('./components/sections/RuntimeWars'));

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'Event Loop': EventLoop,
  'Async Programming': AsyncProgramming,
  'Buffers & Streams': BuffersStreams,
  Scaling,
  'Memory Management': MemoryManagement,
  'Module System': ModuleSystem,
  'Package Managers': PackageManagers,
  Frameworks,
  'Runtime Wars': RuntimeWars,
};

function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

const NodeJSPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;

  return (
    <div className="p-4 sm:p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  );
};

export default NodeJSPage;
