import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from './components/sections/Introduction';
import DOMFundamentals from './components/sections/DOMFundamentals';
import VirtualDOM from './components/sections/VirtualDOM';
import Reconciliation from './components/sections/Reconciliation';
import Components from './components/sections/Components';
import StateProps from './components/sections/StateProps';
import Hooks from './components/sections/Hooks';
import JSX from './components/sections/JSX';

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'DOM Fundamentals': DOMFundamentals,
  'Virtual DOM': VirtualDOM,
  Reconciliation,
  Components,
  'State & Props': StateProps,
  Hooks,
  JSX,
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ReactPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;
  return (
    <div className="p-4 sm:p-6">
      <Component />
    </div>
  );
};

export default ReactPage;
