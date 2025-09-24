import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from '../sections/rxjs/Introduction';
import ReactiveManifesto from '../sections/rxjs/ReactiveManifesto';
import CoreComponents from '../sections/rxjs/CoreComponents';
import Observables from '../sections/rxjs/Observables';
import Operators from '../sections/rxjs/Operators';
import Subjects from '../sections/rxjs/Subjects';
import AdvancedOperators from '../sections/rxjs/AdvancedOperators';
import MarbleDiagrams from '../sections/rxjs/MarbleDiagrams';
import ErrorHandling from '../sections/rxjs/ErrorHandling';
import RealWorldExamples from '../sections/rxjs/RealWorldExamples';
import VisualizationTool from '../sections/rxjs/VisualizationTool';
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
