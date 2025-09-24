import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from '../sections/python/Introduction';
import PythonPhilosophy from '../sections/python/PythonPhilosophy';
import ExecutionModel from '../sections/python/ExecutionModel';
import MemoryManagement from '../sections/python/MemoryManagement';
import GlobalInterpreterLock from '../sections/python/GlobalInterpreterLock';
import AdvancedConcepts from '../sections/python/AdvancedConcepts';
// Import additional sections as they are created
// import Mastery from '../sections/python/Mastery';

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
