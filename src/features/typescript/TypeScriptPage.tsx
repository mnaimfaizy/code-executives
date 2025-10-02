import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from './components/sections/Introduction';
import TypeScriptBasics from './components/sections/TypeScriptBasics';
import TypeScriptVsJavaScript from './components/sections/TypeScriptVsJavaScript';
import ClassesAndObjects from './components/sections/ClassesAndObjects';
import Abstraction from './components/sections/Abstraction';
import AdvancedTypeScript from './components/sections/AdvancedTypeScript';
import Decorators from './components/sections/Decorators';
import TypeGuards from './components/sections/TypeGuards';
import BestPractices from './components/sections/BestPractices';
import MigrationGuide from './components/sections/MigrationGuide';
import TypeSystem from './components/sections/TypeSystem';
import OOPFundamentals from './components/sections/OOPFundamentals';
import ClassHierarchy from './components/sections/ClassHierarchy';
import Inheritance from './components/sections/Inheritance';
import Polymorphism from './components/sections/Polymorphism';
import Encapsulation from './components/sections/Encapsulation';
import SOLIDPrinciples from './components/sections/SOLIDPrinciples';
import AdvancedTypes from './components/sections/AdvancedTypes';
import Generics from './components/sections/Generics';
import TypeScriptVisualization from './components/sections/TypeScriptVisualization';

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'TypeScript Basics': TypeScriptBasics,
  'TypeScript vs JavaScript': TypeScriptVsJavaScript,
  'Classes & Objects': ClassesAndObjects,
  Abstraction: Abstraction,
  'Advanced TypeScript': AdvancedTypeScript,
  Decorators: Decorators,
  'Type Guards': TypeGuards,
  'Best Practices': BestPractices,
  'Migration Guide': MigrationGuide,
  'Type System': TypeSystem,
  'OOP Fundamentals': OOPFundamentals,
  'Class Hierarchy': ClassHierarchy,
  Inheritance: Inheritance,
  Polymorphism: Polymorphism,
  Encapsulation: Encapsulation,
  'SOLID Principles': SOLIDPrinciples,
  'Advanced Types': AdvancedTypes,
  Generics: Generics,
  'TypeScript Visualization': TypeScriptVisualization,
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const TypeScriptPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;
  return (
    <div className="p-4 sm:p-6">
      <Component />
    </div>
  );
};

export default TypeScriptPage;
