import React, { useState } from 'react';
import { IntegratedPlayground } from '../../components/rxjs/playground/IntegratedPlayground';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  isCompleted: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'intro',
    title: 'Welcome to RxJS Visualization',
    description: 'Learn reactive programming through interactive examples',
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Welcome to the RxJS Visualization Tool!
        </h3>
        <p className="text-gray-600">
          This interactive learning environment helps you understand RxJS concepts through:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>
            <strong>Marble Diagrams:</strong> Visual representations of observable streams
          </li>
          <li>
            <strong>Interactive Playground:</strong> Experiment with operators and see real-time
            results
          </li>
          <li>
            <strong>Live Code Editor:</strong> Write and execute RxJS code directly in your browser
          </li>
          <li>
            <strong>Step-by-step Tutorials:</strong> Guided learning for all skill levels
          </li>
        </ul>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-medium">
            💡 Pro Tip: Start with the Marble Playground to get familiar with stream visualization!
          </p>
        </div>
      </div>
    ),
    isCompleted: false,
  },
  {
    id: 'marble-basics',
    title: 'Understanding Marble Diagrams',
    description: 'Learn to read and create marble diagrams',
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Marble Diagram Basics</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Marble Notation:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <code className="bg-gray-200 px-2 py-1 rounded">-</code> Time passing (10ms each)
            </div>
            <div>
              <code className="bg-gray-200 px-2 py-1 rounded">a, b, c</code> Values emitted
            </div>
            <div>
              <code className="bg-gray-200 px-2 py-1 rounded">|</code> Stream completion
            </div>
            <div>
              <code className="bg-gray-200 px-2 py-1 rounded">#</code> Error occurrence
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Example:</h4>
          <code className="bg-white px-3 py-2 rounded border text-green-700">--a--b--c--|</code>
          <p className="text-green-700 mt-2 text-sm">
            This stream emits values 'a', 'b', 'c' with 20ms gaps, then completes.
          </p>
        </div>
      </div>
    ),
    isCompleted: false,
  },
  {
    id: 'operators-intro',
    title: 'Introduction to Operators',
    description: 'Learn about transformation and filtering operators',
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">RxJS Operators</h3>
        <p className="text-gray-600">
          Operators are functions that enable a declarative way to compose asynchronous operations.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Transformation</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • <code>map</code> - Transform values
              </li>
              <li>
                • <code>scan</code> - Accumulate values
              </li>
              <li>
                • <code>switchMap</code> - Switch to new observable
              </li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Filtering</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>
                • <code>filter</code> - Filter values
              </li>
              <li>
                • <code>take</code> - Take first N values
              </li>
              <li>
                • <code>skip</code> - Skip first N values
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
    isCompleted: false,
  },
];

type ViewMode = 'tutorial' | 'playground' | 'reference';

const VisualizationTool: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('playground');
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  const renderTutorial = () => {
    const step = tutorialSteps[currentTutorialStep];

    return (
      <div className="max-w-4xl mx-auto">
        {/* Tutorial Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{step.title}</h2>
              <p className="text-gray-600">{step.description}</p>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentTutorialStep + 1} of {tutorialSteps.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentTutorialStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          {/* Tutorial Content */}
          <div className="tutorial-content">{step.content}</div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <button
              onClick={() => setCurrentTutorialStep(Math.max(0, currentTutorialStep - 1))}
              disabled={currentTutorialStep === 0}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTutorialStep(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTutorialStep
                      ? 'bg-blue-600'
                      : index <= currentTutorialStep
                        ? 'bg-blue-300'
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                if (currentTutorialStep < tutorialSteps.length - 1) {
                  setCurrentTutorialStep(currentTutorialStep + 1);
                } else {
                  setViewMode('playground');
                }
              }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {currentTutorialStep === tutorialSteps.length - 1 ? 'Start Practicing' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReference = () => (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">RxJS Quick Reference</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Common Operators */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Common Operators</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-blue-600 mb-2">map</h4>
                <p className="text-sm text-gray-600 mb-2">Transform each value using a function</p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {`source.pipe(map(x => x * 2))`}
                </code>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-green-600 mb-2">filter</h4>
                <p className="text-sm text-gray-600 mb-2">Only emit values that pass a test</p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {`source.pipe(filter(x => x > 5))`}
                </code>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-purple-600 mb-2">take</h4>
                <p className="text-sm text-gray-600 mb-2">Take only the first N values</p>
                <code className="text-xs bg-gray-100 p-2 rounded block">source.pipe(take(3))</code>
              </div>
            </div>
          </div>

          {/* Marble Notation Reference */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Marble Notation</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <code className="bg-gray-200 px-2 py-1 rounded text-sm">-</code>
                <span className="text-sm text-gray-600">10ms time unit</span>
              </div>
              <div className="flex items-center space-x-3">
                <code className="bg-gray-200 px-2 py-1 rounded text-sm">a</code>
                <span className="text-sm text-gray-600">Emitted value</span>
              </div>
              <div className="flex items-center space-x-3">
                <code className="bg-gray-200 px-2 py-1 rounded text-sm">|</code>
                <span className="text-sm text-gray-600">Completion</span>
              </div>
              <div className="flex items-center space-x-3">
                <code className="bg-gray-200 px-2 py-1 rounded text-sm">#</code>
                <span className="text-sm text-gray-600">Error</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Examples:</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="bg-yellow-100 px-2 py-1 rounded mr-2">--a--b--c--|</code>
                  <span className="text-yellow-700">Simple sequence</span>
                </div>
                <div>
                  <code className="bg-yellow-100 px-2 py-1 rounded mr-2">-a-b-c-d-e|</code>
                  <span className="text-yellow-700">Fast sequence</span>
                </div>
                <div>
                  <code className="bg-yellow-100 px-2 py-1 rounded mr-2">--a--b--#</code>
                  <span className="text-yellow-700">Sequence with error</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">RxJS Visualization Tool</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master reactive programming through interactive marble diagrams, live code execution,
            and step-by-step tutorials designed for all skill levels.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-white shadow-sm p-1">
            <button
              onClick={() => setViewMode('tutorial')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'tutorial'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📚 Tutorial
            </button>
            <button
              onClick={() => setViewMode('playground')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'playground'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎮 Playground
            </button>
            <button
              onClick={() => setViewMode('reference')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'reference'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📖 Reference
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'tutorial' && renderTutorial()}
        {viewMode === 'playground' && <IntegratedPlayground />}
        {viewMode === 'reference' && renderReference()}
      </div>
    </div>
  );
};

export default VisualizationTool;
