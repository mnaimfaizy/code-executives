import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from '../sections/typescript/Introduction';
import TypeScriptBasics from '../sections/typescript/TypeScriptBasics';
import TypeScriptVsJavaScript from '../sections/typescript/TypeScriptVsJavaScript';
import ClassesAndObjects from '../sections/typescript/ClassesAndObjects';
import Abstraction from '../sections/typescript/Abstraction';
import AdvancedTypeScript from '../sections/typescript/AdvancedTypeScript';
import Decorators from '../sections/typescript/Decorators';
import TypeGuards from '../sections/typescript/TypeGuards';
import BestPractices from '../sections/typescript/BestPractices';
import MigrationGuide from '../sections/typescript/MigrationGuide';
import TypeSystem from '../sections/typescript/TypeSystem';
import OOPFundamentals from '../sections/typescript/OOPFundamentals';
import ClassHierarchy from '../sections/typescript/ClassHierarchy';
import Inheritance from '../sections/typescript/Inheritance';
import Polymorphism from '../sections/typescript/Polymorphism';
import Encapsulation from '../sections/typescript/Encapsulation';
import SOLIDPrinciples from '../sections/typescript/SOLIDPrinciples';
import AdvancedTypes from '../sections/typescript/AdvancedTypes';
import Generics from '../sections/typescript/Generics';
import TypeScriptVisualization from '../sections/typescript/TypeScriptVisualization';

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
