import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from './components/sections/Introduction';
import PythonPhilosophy from './components/sections/PythonPhilosophy';
import ExecutionModel from './components/sections/ExecutionModel';
import MemoryManagement from './components/sections/MemoryManagement';
import GlobalInterpreterLock from './components/sections/GlobalInterpreterLock';
import AdvancedConcepts from './components/sections/AdvancedConcepts';
// Import additional sections as they are created
// import Mastery from './components/sections/Mastery';

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'Python Philosophy': PythonPhilosophy,
  'Execution Model': ExecutionModel,
  'Memory Management': MemoryManagement,
  'Global Interpreter Lock': GlobalInterpreterLock,
  'Advanced Concepts': AdvancedConcepts,
  // Add more sections as they are implemented
  // Mastery: Mastery,
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PythonPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;
  return (
    <div className="p-4 sm:p-6">
      <Component />
    </div>
  );
};

export default PythonPage;
