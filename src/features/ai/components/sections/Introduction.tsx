import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import { Brain, Cpu, Database, Zap, TrendingUp, Network, Layers, Target } from 'lucide-react';

const Introduction: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    const baseUrl = '/ai?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  const stats = [
    {
      value: '11',
      label: 'Interactive Topics',
      icon: <Brain className="w-5 h-5" />,
    },
    {
      value: '∞',
      label: 'Parameters in Modern LLMs',
      icon: <Cpu className="w-5 h-5" />,
    },
    {
      value: '100%',
      label: 'Visual Learning',
      icon: <Target className="w-5 h-5" />,
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-rose-100 p-4 rounded-full">
          <Brain className="w-16 h-16 text-rose-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        AI Fundamentals: The Architecture of Intelligence
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Deconstruct artificial intelligence from raw data to production inference. Master neural
        networks, gradient descent, backpropagation, and modern NLP architectures through
        interactive visualizations and intuitive analogies.
      </p>
      <StatsGrid stats={stats} colorScheme="rose" />
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-rose-100 text-rose-800 px-4 py-2 rounded-full text-sm font-semibold">
          🧠 Neural Networks
        </span>
        <span className="bg-fuchsia-100 text-fuchsia-800 px-4 py-2 rounded-full text-sm font-semibold">
          📊 Gradient Descent
        </span>
        <span className="bg-violet-100 text-violet-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔗 Backpropagation
        </span>
        <span className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-semibold">
          🤖 RAG & Embeddings
        </span>
      </div>
    </div>
  );

  const mainContent = (
    <>
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Artificial Intelligence?</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              From Deterministic to Probabilistic
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Historically, software engineering relied on <strong>deterministic logic</strong> —
              developers wrote explicit, static rules governing exact inputs and outputs. Today, the
              landscape has evolved to embrace <strong>probabilistic programming</strong>, where
              systems learn from historical data to make inferences about unseen future data.
            </p>
            <p className="text-gray-700 leading-relaxed">
              As applications transition from static utilities to dynamic, learning environments,
              software engineers must understand the internal mechanics of machine learning
              algorithms to effectively build, debug, and scale these systems.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Two AI Paradigms</h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-200">
                <h4 className="font-semibold text-rose-800 mb-2">Symbolic AI (Classical)</h4>
                <p className="text-sm text-gray-700">
                  Pre-programmed rules and expert systems for logical reasoning. Highly
                  interpretable but fails with ambiguity and unstructured data.
                </p>
              </div>
              <div className="bg-gradient-to-r from-fuchsia-50 to-violet-50 rounded-xl p-4 border border-fuchsia-200">
                <h4 className="font-semibold text-fuchsia-800 mb-2">Connectionist AI (Modern)</h4>
                <p className="text-sm text-gray-700">
                  Learns directly from data using neural networks and deep learning. Excels at
                  pattern recognition in speech, text, and imagery.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-50 to-violet-50 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Core Concepts You Will Master
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-rose-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Layers className="w-6 h-6 text-rose-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">The ML Lifecycle</h4>
              <p className="text-sm text-gray-600">
                From data preparation to deployment and continuous monitoring
              </p>
            </div>
            <div className="text-center">
              <div className="bg-fuchsia-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Network className="w-6 h-6 text-fuchsia-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Neural Network Internals</h4>
              <p className="text-sm text-gray-600">
                Weights, biases, activation functions, and the math behind learning
              </p>
            </div>
            <div className="text-center">
              <div className="bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-violet-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Modern NLP & RAG</h4>
              <p className="text-sm text-gray-600">
                Word embeddings, vector databases, and retrieval-augmented generation
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-rose-500 rounded-full mt-2"></div>
            <div>
              <span className="text-gray-700 font-medium">Parametric Models</span>
              <p className="text-sm text-gray-600">
                Fixed set of parameters, like linear regression
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-fuchsia-500 rounded-full mt-2"></div>
            <div>
              <span className="text-gray-700 font-medium">Non-parametric Models</span>
              <p className="text-sm text-gray-600">
                Parameters grow with data, like decision trees
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  const sidebar = (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Explore Topics</h3>
      <NavigationCard
        title="ML Lifecycle"
        description="The end-to-end pipeline from data to deployment"
        colorScheme="rose"
        icon={<TrendingUp className="w-4 h-4 text-rose-600" />}
        onClick={() => navigateToSection('ML Lifecycle')}
      />
      <NavigationCard
        title="Feature Engineering"
        description="Transform raw data into model-ready features"
        colorScheme="rose"
        icon={<Database className="w-4 h-4 text-rose-600" />}
        onClick={() => navigateToSection('Feature Engineering')}
      />
      <NavigationCard
        title="Neural Networks"
        description="Weights, biases, and multi-layer perceptrons"
        colorScheme="rose"
        icon={<Network className="w-4 h-4 text-rose-600" />}
        onClick={() => navigateToSection('Neural Networks')}
      />
      <NavigationCard
        title="Loss Functions"
        description="Measuring how wrong predictions are"
        colorScheme="rose"
        icon={<Target className="w-4 h-4 text-rose-600" />}
        onClick={() => navigateToSection('Loss Functions')}
      />
      <NavigationCard
        title="Gradient Descent"
        description="The optimization engine of machine learning"
        colorScheme="rose"
        icon={<TrendingUp className="w-4 h-4 text-rose-600" />}
        onClick={() => navigateToSection('Gradient Descent')}
      />
      <NavigationCard
        title="Backpropagation"
        description="How neural networks learn from errors"
        colorScheme="rose"
        icon={<Layers className="w-4 h-4 text-rose-600" />}
        onClick={() => navigateToSection('Backpropagation')}
      />
      <NavigationCard
        title="Generalization"
        description="Overfitting, underfitting, and bias-variance"
        colorScheme="rose"
        icon={<Zap className="w-4 h-4 text-rose-600" />}
        onClick={() => navigateToSection('Generalization')}
      />
      <NavigationCard
        title="Training vs Inference"
        description="From building models to serving predictions"
        colorScheme="rose"
        icon={<Cpu className="w-4 h-4 text-rose-600" />}
        onClick={() => navigateToSection('Training vs Inference')}
      />
      <NavigationCard
        title="Word Embeddings"
        description="Transforming language into mathematics"
        colorScheme="rose"
        icon={<Brain className="w-4 h-4 text-rose-600" />}
        onClick={() => navigateToSection('Word Embeddings')}
      />
      <NavigationCard
        title="RAG Pipeline"
        description="Retrieval-augmented generation architecture"
        colorScheme="rose"
        icon={<Database className="w-4 h-4 text-rose-600" />}
        onClick={() => navigateToSection('RAG Pipeline')}
      />
    </div>
  );

  return (
    <>
      <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} sidebar={sidebar} />
      <CTASection
        title="Begin Your AI Journey"
        description="Start with the ML Lifecycle to understand how AI systems are built from concept to production."
        buttonText="Start Learning"
        onButtonClick={() => navigateToSection('ML Lifecycle')}
        colorScheme="rose"
      />
    </>
  );
};

export default Introduction;
