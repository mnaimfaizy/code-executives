import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import {
  Brain,
  Cpu,
  Database,
  Zap,
  TrendingUp,
  Network,
  Layers,
  Target,
  Lightbulb,
  MessageSquare,
  Music,
  Camera,
  Map,
  ShieldCheck,
} from 'lucide-react';

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
      value: '175B+',
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
        Ever wondered how your phone recognizes your face, or how ChatGPT writes essays? This module
        breaks down the magic behind artificial intelligence into simple, visual, and interactive
        lessons — no PhD required.
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
      {/* Simple Explanation Box */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">Explain Like I&apos;m 10 🧒</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Imagine you have a really smart pet dog. You don&apos;t program the dog with a rule
              book — instead, you <strong>show the dog many examples</strong>. &quot;This is a cat,
              this is not a cat.&quot; After seeing thousands of examples, the dog learns to
              recognize cats on its own — even cats it has never seen before!
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>That&apos;s essentially what AI does.</strong> Instead of following rules
              humans wrote, AI learns patterns from data. The more examples you give it, the smarter
              it gets. This course teaches you <em>exactly</em> how that learning process works,
              step by step.
            </p>
          </div>
        </div>
      </div>

      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Artificial Intelligence?</h2>

        {/* AI in Your Daily Life */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            🌍 AI Is Already Everywhere In Your Life
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            You might think AI is some futuristic technology, but you already use it dozens of times
            every day without realizing it:
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
                title: 'Autocomplete',
                desc: 'When your phone predicts the next word you want to type',
              },
              {
                icon: <Camera className="w-5 h-5 text-purple-600" />,
                title: 'Face Unlock',
                desc: 'Your phone recognizing your face to unlock the screen',
              },
              {
                icon: <Music className="w-5 h-5 text-green-600" />,
                title: 'Spotify / YouTube',
                desc: 'Recommending songs or videos you might like',
              },
              {
                icon: <Map className="w-5 h-5 text-red-600" />,
                title: 'Google Maps',
                desc: 'Predicting traffic and finding the fastest route',
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
                title: 'Spam Filter',
                desc: 'Your email automatically catching spam messages',
              },
              {
                icon: <Brain className="w-5 h-5 text-rose-600" />,
                title: 'ChatGPT',
                desc: 'Having conversations and answering questions',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-100 shadow-sm"
              >
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <span className="font-semibold text-gray-800 text-sm">{item.title}</span>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              From Rules to Learning: A Big Shift
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              In traditional software, a programmer writes every rule by hand. For example:{' '}
              <em>&quot;If temperature &gt; 30°C, turn on the AC.&quot;</em> The computer only does
              what it&apos;s explicitly told.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              With AI, something fundamentally different happens. Instead of writing rules, you give
              the computer <strong>thousands of examples</strong> of inputs and correct outputs, and
              the computer figures out the rules by itself. This is called{' '}
              <strong>machine learning</strong>.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 font-mono mb-2">
                <strong>Traditional:</strong> Human writes rules → Computer follows them
              </p>
              <p className="text-sm text-gray-700 font-mono">
                <strong>AI/ML:</strong> Human provides examples → Computer discovers rules
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Two Schools of AI</h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-200">
                <h4 className="font-semibold text-rose-800 mb-2">
                  Symbolic AI (The &quot;Rule Book&quot; Approach)
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  Humans manually write logical rules for the computer to follow. Think of it like a
                  recipe book — the computer follows each step exactly.
                </p>
                <p className="text-xs text-gray-500 italic">
                  Example: A medical system with 10,000 hand-coded rules like &quot;IF fever AND
                  cough AND fatigue THEN possibly flu&quot;
                </p>
              </div>
              <div className="bg-gradient-to-r from-fuchsia-50 to-violet-50 rounded-xl p-4 border border-fuchsia-200">
                <h4 className="font-semibold text-fuchsia-800 mb-2">
                  Connectionist AI (The &quot;Learning Brain&quot; Approach)
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  Inspired by how the human brain works. The computer learns patterns from data
                  using networks of simple connected units (neurons). This is what ChatGPT, image
                  recognition, and self-driving cars use.
                </p>
                <p className="text-xs text-gray-500 italic">
                  Example: Show a network 1 million photos of cats and dogs — it learns to tell them
                  apart without any explicit rules
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How Does a Machine Actually "Learn"? */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-8 border border-emerald-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            🤔 How Does a Machine Actually &quot;Learn&quot;?
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Machine learning follows a surprisingly simple loop, repeated millions of times:
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center mb-4">
            {[
              { step: '1', label: 'Make a guess', color: 'bg-emerald-100 text-emerald-800' },
              { step: '→', label: '', color: 'text-gray-400' },
              {
                step: '2',
                label: 'Check how wrong it was',
                color: 'bg-amber-100 text-amber-800',
              },
              { step: '→', label: '', color: 'text-gray-400' },
              {
                step: '3',
                label: 'Adjust to be less wrong',
                color: 'bg-blue-100 text-blue-800',
              },
              { step: '→', label: '', color: 'text-gray-400' },
              { step: '🔁', label: 'Repeat!', color: 'bg-rose-100 text-rose-800' },
            ].map((item, i) =>
              item.label === '' ? (
                <span key={i} className={`text-xl font-bold ${item.color} hidden sm:block`}>
                  {item.step}
                </span>
              ) : (
                <div key={i} className={`${item.color} rounded-lg px-4 py-2 text-sm font-medium`}>
                  {item.step !== '🔁' && <span className="font-bold mr-1">Step {item.step}:</span>}
                  {item.label}
                </div>
              )
            )}
          </div>
          <p className="text-sm text-gray-600 italic">
            This is exactly how you learned to ride a bike — try, fall, adjust, try again. The
            difference is that a computer can do this loop millions of times per second.
          </p>
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
                The complete journey from raw data → trained model → real-world predictions
              </p>
            </div>
            <div className="text-center">
              <div className="bg-fuchsia-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Network className="w-6 h-6 text-fuchsia-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Neural Network Internals</h4>
              <p className="text-sm text-gray-600">
                How tiny math operations (weights × inputs + bias) connect to create intelligence
              </p>
            </div>
            <div className="text-center">
              <div className="bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-violet-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Modern NLP & RAG</h4>
              <p className="text-sm text-gray-600">
                How computers understand human language and retrieve knowledge to answer questions
              </p>
            </div>
          </div>
        </div>

        {/* Key Terminology */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📖 Key Terminology</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="text-gray-800 font-semibold">Parametric Models</span>
                <p className="text-sm text-gray-600 mt-1">
                  Models with a <strong>fixed number of knobs</strong> to tune, no matter how much
                  data you give them. Like a recipe with exactly 5 ingredients — you adjust the
                  amounts but never add new ones.
                </p>
                <p className="text-xs text-gray-500 mt-1 italic">
                  Examples: Linear Regression, Neural Networks
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-2 h-2 bg-fuchsia-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="text-gray-800 font-semibold">Non-parametric Models</span>
                <p className="text-sm text-gray-600 mt-1">
                  Models that <strong>grow more complex</strong> as you give them more data. Like a
                  photo album — the more photos you add, the more detailed the collection becomes.
                </p>
                <p className="text-xs text-gray-500 mt-1 italic">
                  Examples: Decision Trees, K-Nearest Neighbors
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="text-gray-800 font-semibold">Training</span>
                <p className="text-sm text-gray-600 mt-1">
                  The process of showing a model thousands of examples so it can learn patterns.
                  Like studying for an exam — the more practice problems you solve, the better you
                  get.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <span className="text-gray-800 font-semibold">Inference</span>
                <p className="text-sm text-gray-600 mt-1">
                  Using a trained model to make predictions on new, unseen data. Like taking the
                  actual exam after you&apos;ve studied — you apply what you learned to new
                  questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Learning Path Overview */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🗺️ Your Learning Journey (11 Sections)
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Each section builds on the previous one. We recommend going in order, but feel free to
          jump to any topic that interests you:
        </p>
        <div className="space-y-3">
          {[
            {
              num: 1,
              title: 'ML Lifecycle',
              desc: 'The end-to-end pipeline — from collecting data to shipping a model',
            },
            {
              num: 2,
              title: 'Feature Engineering',
              desc: 'How to prepare and transform raw data so machines can understand it',
            },
            {
              num: 3,
              title: 'Neural Networks',
              desc: 'The brain-inspired architecture that powers modern AI',
            },
            {
              num: 4,
              title: 'Loss Functions',
              desc: 'How we measure "how wrong" a prediction is',
            },
            {
              num: 5,
              title: 'Gradient Descent',
              desc: 'The algorithm that makes models smarter, step by step',
            },
            {
              num: 6,
              title: 'Backpropagation',
              desc: 'How errors flow backward through a network to fix mistakes',
            },
            {
              num: 7,
              title: 'Generalization',
              desc: 'Why "memorizing answers" is bad and how to avoid it',
            },
            {
              num: 8,
              title: 'Training vs Inference',
              desc: 'The difference between learning and applying knowledge',
            },
            {
              num: 9,
              title: 'Word Embeddings',
              desc: 'How computers turn words into numbers that capture meaning',
            },
            {
              num: 10,
              title: 'RAG Pipeline',
              desc: 'How AI retrieves knowledge to give accurate, grounded answers',
            },
          ].map((item) => (
            <button
              key={item.num}
              onClick={() => navigateToSection(item.title)}
              className="w-full flex items-center gap-4 p-3 bg-gray-50 hover:bg-rose-50 rounded-lg border border-gray-200 hover:border-rose-200 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                {item.num}
              </div>
              <div>
                <span className="font-semibold text-gray-800">{item.title}</span>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </button>
          ))}
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
