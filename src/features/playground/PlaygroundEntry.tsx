import React from 'react';
import { ErrorBoundary } from '../../shared/components/feedback/ErrorBoundary';
import { SEO } from '../../shared/components/SEO/SEO';
import PlaygroundApp from './PlaygroundApp';

const PlaygroundEntry: React.FC = () => {
  return (
    <ErrorBoundary level="feature">
      <SEO
        title="Playground - Code Executives"
        description="Interactive coding playground with real-time visualizations. Write JavaScript, TypeScript, or Python and see your code come to life with step-by-step execution tracing."
        keywords={[
          'code playground',
          'interactive coding',
          'JavaScript',
          'TypeScript',
          'Python',
          'code visualization',
          'event loop',
          'data structures',
        ]}
      />
      <PlaygroundApp />
    </ErrorBoundary>
  );
};

export default PlaygroundEntry;
