import React from 'react';
import { useLocation } from 'react-router-dom';
import ModuleQuizSection from '../../shared/components/quiz/ModuleQuizSection';
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

const Quiz = () => <ModuleQuizSection moduleId="typescript" />;

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
  Quiz,
};

// Build a reverse lookup from URL-friendly slug → display name
const slugToDisplayName: Record<string, string> = {};
for (const key of Object.keys(sectionComponents)) {
  slugToDisplayName[key.toLowerCase().replace(/[&\s]+/g, '-')] = key;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const TypeScriptPage: React.FC = () => {
  const query = useQuery();
  const rawSection = query.get('section') || 'Introduction';
  // Support both display names ("Type System") and URL slugs ("type-system")
  const resolvedName = sectionComponents[rawSection]
    ? rawSection
    : slugToDisplayName[rawSection.toLowerCase().replace(/[&\s]+/g, '-')] || 'Introduction';
  const Component = sectionComponents[resolvedName] || Introduction;
  return (
    <div className="p-4 sm:p-6">
      <Component />
    </div>
  );
};

export default TypeScriptPage;
