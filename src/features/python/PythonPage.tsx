import React from 'react';
import { useLocation } from 'react-router-dom';
import ModuleQuizSection from '../../shared/components/quiz/ModuleQuizSection';
import Introduction from './components/sections/Introduction';
import PythonPhilosophy from './components/sections/PythonPhilosophy';
import ExecutionModel from './components/sections/ExecutionModel';
import MemoryManagement from './components/sections/MemoryManagement';
import GlobalInterpreterLock from './components/sections/GlobalInterpreterLock';
import AdvancedConcepts from './components/sections/AdvancedConcepts';
import CoreDataStructures from './components/sections/CoreDataStructures';
import OOP from './components/sections/OOP';
import ErrorHandling from './components/sections/ErrorHandling';
import Comprehensions from './components/sections/Comprehensions';
import PythonForML from './components/sections/PythonForML';

const Quiz = () => <ModuleQuizSection moduleId="python" />;

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'Python Philosophy': PythonPhilosophy,
  'Execution Model': ExecutionModel,
  'Memory Management': MemoryManagement,
  'Global Interpreter Lock': GlobalInterpreterLock,
  'Advanced Concepts': AdvancedConcepts,
  'Core Data Structures': CoreDataStructures,
  OOP,
  'Error Handling': ErrorHandling,
  Comprehensions,
  'Python for ML': PythonForML,
  Quiz,
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
