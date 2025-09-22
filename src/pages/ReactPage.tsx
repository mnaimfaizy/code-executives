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

const sectionComponents: Record<string, React.ReactNode> = {
  Introduction: <Introduction />,
  'DOM Fundamentals': <DOMFundamentals />,
  'Virtual DOM': <VirtualDOM />,
  Reconciliation: <Reconciliation />,
  Components: <Components />,
  'State & Props': <StateProps />,
  Hooks: <Hooks />,
  JSX: <JSX />,
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ReactPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  return <div className="p-4 sm:p-6">{sectionComponents[section] || <Introduction />}</div>;
};

export default ReactPage;
