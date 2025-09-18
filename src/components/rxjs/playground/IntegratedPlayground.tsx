import React, { useState } from 'react';
import { MarblePlayground } from './MarblePlayground';
import { CodePlayground } from './CodePlayground';

type PlaygroundMode = 'marble' | 'code';

interface IntegratedPlaygroundProps {
  className?: string;
}

export const IntegratedPlayground: React.FC<IntegratedPlaygroundProps> = ({ className = '' }) => {
  const [mode, setMode] = useState<PlaygroundMode>('marble');

  return (
    <div className={`integrated-playground ${className}`}>
      {/* Mode Selector */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setMode('marble')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'marble'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Marble Playground
          </button>
          <button
            onClick={() => setMode('code')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'code'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Code Playground
          </button>
        </div>
      </div>

      {/* Mode Description */}
      <div className="text-center mb-6">
        {mode === 'marble' ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Interactive Marble Diagrams</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visualize RxJS streams using marble notation. Create input streams, apply operators,
              and see the transformation in real-time.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Live RxJS Code Editor</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Write and execute RxJS code directly in the browser. Experiment with operators,
              observables, and reactive patterns.
            </p>
          </div>
        )}
      </div>

      {/* Playground Content */}
      <div className="playground-content">
        {mode === 'marble' ? <MarblePlayground /> : <CodePlayground />}
      </div>

      {/* Learning Resources */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-blue-600 mb-2">Marble Diagrams</h4>
            <p className="text-sm text-gray-600">
              Learn how to read and create marble diagrams to visualize observable streams.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-green-600 mb-2">RxJS Operators</h4>
            <p className="text-sm text-gray-600">
              Discover the power of transformation, filtering, and combination operators.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-purple-600 mb-2">Error Handling</h4>
            <p className="text-sm text-gray-600">
              Master error handling patterns and recovery strategies in reactive programming.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">💡 Quick Tips</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          {mode === 'marble' ? (
            <>
              <li>
                • Use <code className="bg-yellow-100 px-1 rounded">-</code> for time gaps,{' '}
                <code className="bg-yellow-100 px-1 rounded">|</code> for completion,{' '}
                <code className="bg-yellow-100 px-1 rounded">#</code> for errors
              </li>
              <li>• Values can be letters, numbers, or any character (except special ones)</li>
              <li>• Chain operators to see how data transforms through the pipeline</li>
            </>
          ) : (
            <>
              <li>
                • Start with simple observables using{' '}
                <code className="bg-yellow-100 px-1 rounded">of()</code> or{' '}
                <code className="bg-yellow-100 px-1 rounded">from()</code>
              </li>
              <li>
                • Always call <code className="bg-yellow-100 px-1 rounded">.subscribe()</code> to
                activate the observable
              </li>
              <li>
                • Use <code className="bg-yellow-100 px-1 rounded">pipe()</code> to chain multiple
                operators
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};
