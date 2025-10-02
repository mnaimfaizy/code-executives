import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from './components/sections/Introduction';
import ReactiveManifesto from './components/sections/ReactiveManifesto';
import CoreComponents from './components/sections/CoreComponents';
import Observables from './components/sections/Observables';
import Operators from './components/sections/Operators';
import Subjects from './components/sections/Subjects';
import AdvancedOperators from './components/sections/AdvancedOperators';
import MarbleDiagrams from './components/sections/MarbleDiagrams';
import ErrorHandling from './components/sections/ErrorHandling';
import RealWorldExamples from './components/sections/RealWorldExamples';
import VisualizationTool from './components/sections/VisualizationTool';
// More imports will be added as we create the sections

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'Reactive Manifesto': ReactiveManifesto,
  'Core Components': CoreComponents,
  Observables,
  Operators,
  Subjects,
  'Advanced Operators': AdvancedOperators,
  'Marble Diagrams': MarbleDiagrams,
  'Error Handling': ErrorHandling,
  'Real-World Examples': RealWorldExamples,
  'Visualization Tool': VisualizationTool,
  // More sections will be added here as we implement them
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const RxJSPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;
  return (
    <div className="p-4 sm:p-6">
      <Component />
    </div>
  );
};

export default RxJSPage;
