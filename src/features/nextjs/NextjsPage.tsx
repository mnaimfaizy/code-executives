import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from './components/sections/Introduction';
import Routing from './components/sections/Routing';
import RenderingStrategies from './components/sections/RenderingStrategies';
import ServerClientComponents from './components/sections/ServerClientComponents';
import DataFetching from './components/sections/DataFetching';
import Middleware from './components/sections/Middleware';
import Optimization from './components/sections/Optimization';

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
      <Component />
    </div>
  );
};

export default NextJSPage;
