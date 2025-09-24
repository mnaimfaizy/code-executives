import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from '../sections/react/Introduction';
import DOMFundamentals from '../sections/react/DOMFundamentals';
import VirtualDOM from '../sections/react/VirtualDOM';
import Reconciliation from '../sections/react/Reconciliation';
import Components from '../sections/react/Components';
import StateProps from '../sections/react/StateProps';
import Hooks from '../sections/react/Hooks';
import JSX from '../sections/react/JSX';

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
