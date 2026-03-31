import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';

// Lazy load section components for better performance
import Introduction from './components/sections/Introduction';
const MLLifecycle = React.lazy(() => import('./components/sections/MLLifecycle'));
const FeatureEngineering = React.lazy(() => import('./components/sections/FeatureEngineering'));
const NeuralNetworks = React.lazy(() => import('./components/sections/NeuralNetworks'));
const LossFunctions = React.lazy(() => import('./components/sections/LossFunctions'));
const GradientDescent = React.lazy(() => import('./components/sections/GradientDescent'));
const Backpropagation = React.lazy(() => import('./components/sections/Backpropagation'));
const Generalization = React.lazy(() => import('./components/sections/Generalization'));
const TrainingVsInference = React.lazy(() => import('./components/sections/TrainingVsInference'));
const WordEmbeddings = React.lazy(() => import('./components/sections/WordEmbeddings'));
const RAGPipeline = React.lazy(() => import('./components/sections/RAGPipeline'));

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'ML Lifecycle': MLLifecycle,
  'Feature Engineering': FeatureEngineering,
  'Neural Networks': NeuralNetworks,
  'Loss Functions': LossFunctions,
  'Gradient Descent': GradientDescent,
  Backpropagation,
  Generalization,
  'Training vs Inference': TrainingVsInference,
  'Word Embeddings': WordEmbeddings,
  'RAG Pipeline': RAGPipeline,
};

function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

const AIFundamentalsPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;

  return (
    <div className="p-4 sm:p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  );
};

export default AIFundamentalsPage;
