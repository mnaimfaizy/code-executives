import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from '../sections/nextjs/Introduction';
import Routing from '../sections/nextjs/Routing';
import RenderingStrategies from '../sections/nextjs/RenderingStrategies';
import ServerClientComponents from '../sections/nextjs/ServerClientComponents';
import DataFetching from '../sections/nextjs/DataFetching';
import Middleware from '../sections/nextjs/Middleware';
import Optimization from '../sections/nextjs/Optimization';

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
