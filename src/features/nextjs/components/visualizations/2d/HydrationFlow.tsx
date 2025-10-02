import React, { useState, useEffect } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface HydrationStep {
  id: string;
  title: string;
  description: string;
  serverContent: string;
  clientContent: string;
  duration: number;
  highlights: string[];
}

interface HydrationFlowProps extends BaseNextJSVisualizationProps {
  steps?: HydrationStep[];
  autoPlay?: boolean;
  showCode?: boolean;
}

const HydrationFlow: React.FC<HydrationFlowProps> = ({
  steps: initialSteps,
  autoPlay = false,
  showCode = true,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);

  // Generate default hydration steps
  const generateDefaultSteps = (): HydrationStep[] => [
    {
      id: 'server-render',
      title: 'Server-Side Rendering',
      description: 'Server renders initial HTML with static content',
      serverContent: `<div class="counter">
  <h2>Counter: 0</h2>
  <button>Increment</button>
</div>`,
      clientContent: '',
      duration: 2000,
      highlights: ['Static HTML generated', 'No interactivity yet', 'Fast initial page load'],
    },
    {
      id: 'html-delivery',
      title: 'HTML Delivery',
      description: 'Browser receives and displays the server-rendered HTML',
      serverContent: `<div class="counter">
  <h2>Counter: 0</h2>
  <button>Increment</button>
</div>`,
      clientContent: '',
      duration: 1500,
      highlights: [
        'HTML displayed immediately',
        'User sees content instantly',
        'No JavaScript executed yet',
      ],
    },
    {
      id: 'js-download',
      title: 'JavaScript Download',
      description: 'Browser downloads and parses the client-side JavaScript bundle',
      serverContent: `<div class="counter">
  <h2>Counter: 0</h2>
  <button>Increment</button>
</div>`,
      clientContent: `// Client component code
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,
      duration: 2500,
      highlights: [
        'JavaScript bundle loading',
        'React components downloading',
        'Event handlers being prepared',
      ],
    },
    {
      id: 'hydration-start',
      title: 'Hydration Begins',
      description: 'React reconciles server HTML with client component tree',
      serverContent: `<div class="counter">
  <h2>Counter: 0</h2>
  <button>Increment</button>
</div>`,
      clientContent: `function Counter() {
  const [count, setCount] = useState(0); // ← Attaching state
  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}> // ← Attaching event
        Increment
      </button>
    </div>
  );
}`,
      duration: 2000,
      highlights: [
        'State being attached',
        'Event handlers connected',
        'Component becoming interactive',
      ],
    },
    {
      id: 'hydration-complete',
      title: 'Hydration Complete',
      description: 'Component is now fully interactive with client-side functionality',
      serverContent: `<div class="counter">
  <h2>Counter: 0</h2>
  <button>Increment</button>
</div>`,
      clientContent: `function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
// ✅ Fully interactive!`,
      duration: 1000,
      highlights: ['Component is interactive', 'State updates work', 'Event handlers functional'],
    },
  ];

  const steps = initialSteps || generateDefaultSteps();
  const currentStepData = steps[currentStep];

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const stepDuration = currentStepData?.duration || 2000;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (stepDuration / 100);
        if (newProgress >= 100) {
          setCurrentStep((prevStep) => {
            const nextStep = (prevStep + 1) % steps.length;
            if (nextStep === 0) {
              setIsPlaying(false);
              return 0;
            }
            return nextStep;
          });
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, currentStepData?.duration, steps.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStepChange = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Hydration Flow Animation</h3>
        <p className="text-gray-600">
          Step-by-step visualization of how server-rendered content becomes interactive
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handlePlayPause}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          {isPlaying ? 'Pause' : 'Play'} Animation
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Step:</span>
          <select
            value={currentStep}
            onChange={(e) => handleStepChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            {steps.map((step, index) => (
              <option key={step.id} value={index}>
                {index + 1}. {step.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Current Step Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold text-gray-900">
            Step {currentStep + 1}: {currentStepData.title}
          </h4>
          <span className="text-sm text-gray-500">
            {currentStep + 1} of {steps.length}
          </span>
        </div>

        <p className="text-gray-600 mb-6">{currentStepData.description}</p>

        {/* Key Highlights */}
        <div className="mb-6">
          <h5 className="font-medium text-gray-900 mb-2">Key Points:</h5>
          <ul className="list-disc list-inside space-y-1">
            {currentStepData.highlights.map((highlight, index) => (
              <li key={index} className="text-gray-600">
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {/* Code Visualization */}
        {showCode && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Server-Side */}
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Server-Side HTML</span>
              </h5>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {currentStepData.serverContent}
                </pre>
              </div>
            </div>

            {/* Client-Side */}
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span>Client-Side JavaScript</span>
              </h5>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {currentStepData.clientContent ? (
                  <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                    {currentStepData.clientContent}
                  </pre>
                ) : (
                  <div className="text-gray-500 italic text-sm">No client-side code yet...</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visual Flow Diagram */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h5 className="font-medium text-gray-900 mb-4 text-center">Hydration Process Flow</h5>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300 ${
                  index < currentStep
                    ? 'bg-green-500'
                    : index === currentStep
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-gray-300'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>

              {/* Step Title */}
              <div className="text-center mt-2 max-w-24">
                <div
                  className={`text-xs font-medium ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </div>
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute mt-6 ml-16">
                  <div
                    className={`w-8 h-0.5 ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'}`}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h5 className="font-medium text-gray-900 mb-4">Interactive Demo</h5>
        <div className="text-center">
          <div className="inline-block p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="counter mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Counter: <span className="text-blue-600">0</span>
              </h2>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentStep >= 4
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={currentStep < 4}
              >
                Increment
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {currentStep < 4
                ? 'Button becomes interactive after hydration completes'
                : 'Component is now fully hydrated and interactive!'}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {steps.slice(0, 2).reduce((acc, step) => acc + step.duration, 0)}ms
          </div>
          <div className="text-sm text-gray-600">Time to First Content</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {steps.slice(2, 4).reduce((acc, step) => acc + step.duration, 0)}ms
          </div>
          <div className="text-sm text-gray-600">Hydration Time</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {steps.reduce((acc, step) => acc + step.duration, 0)}ms
          </div>
          <div className="text-sm text-gray-600">Total Interactive Time</div>
        </div>
      </div>
    </div>
  );
};

export default HydrationFlow;
