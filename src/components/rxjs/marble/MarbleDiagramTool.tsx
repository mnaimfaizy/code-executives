import React, { useState, useCallback, useEffect } from 'react';
import type { MarbleStream, AppliedOperator } from '../shared/types';
import { createMarbleStream, applyOperatorSimulation, operatorConfigs } from '../shared/utils';
import { MarbleEditor } from '../visualization/MarbleEditor';
import { MarbleTimeline } from '../visualization/MarbleTimeline';
import { OperatorSelector } from '../visualization/OperatorSelector';

interface MarbleDiagramToolState {
  inputMarbleString: string;
  appliedOperators: AppliedOperator[];
}

interface MarbleDiagramToolProps {
  initialState?: Partial<MarbleDiagramToolState>;
  className?: string;
}

export const MarbleDiagramTool: React.FC<MarbleDiagramToolProps> = ({
  initialState,
  className = '',
}) => {
  const [state, setState] = useState<MarbleDiagramToolState>({
    inputMarbleString: '--a--b--c--|',
    appliedOperators: [],
    ...initialState,
  });

  const [streams, setStreams] = useState<{
    input: MarbleStream;
    output: MarbleStream;
  }>({
    input: {
      id: 'input',
      name: 'Input',
      events: [],
      duration: 1000,
      isComplete: false,
      hasError: false,
    },
    output: {
      id: 'output',
      name: 'Output',
      events: [],
      duration: 1000,
      isComplete: false,
      hasError: false,
    },
  });

  const updateStreams = useCallback(() => {
    try {
      const inputStream = createMarbleStream('input', 'Input', state.inputMarbleString);

      // Apply operators to create output stream
      let outputStream = inputStream;
      for (const appliedOp of state.appliedOperators) {
        if (appliedOp.enabled) {
          outputStream = applyOperatorSimulation(
            outputStream,
            appliedOp.config.name,
            appliedOp.parameters
          );
        }
      }

      setStreams({ input: inputStream, output: outputStream });
    } catch (error) {
      console.error('Error updating streams:', error);
      // Keep previous valid streams on error
    }
  }, [state.inputMarbleString, state.appliedOperators]);

  useEffect(() => {
    updateStreams();
  }, [updateStreams]);

  const clearTool = useCallback(() => {
    setState({
      inputMarbleString: '',
      appliedOperators: [],
    });
  }, []);

  const loadExample = useCallback((example: 'basic' | 'advanced' | 'error') => {
    const examples: Record<string, MarbleDiagramToolState> = {
      basic: {
        inputMarbleString: '--1--2--3--|',
        appliedOperators: [],
      },
      advanced: {
        inputMarbleString: '--a--b--c--d--e--|',
        appliedOperators: [
          {
            id: 'map-example',
            config: operatorConfigs[0], // map
            parameters: { transform: 'x => x.toUpperCase()' },
            enabled: true,
          },
        ],
      },
      error: {
        inputMarbleString: '--1--2--#',
        appliedOperators: [],
      },
    };

    setState(examples[example]);
  }, []);

  return (
    <div className={`marble-diagram-tool ${className}`}>
      {/* Description */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Interactive Marble Diagrams</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Write a stream in marble notation, pick an operator and see the stream it produces. The
          result is simulated: no RxJS code is run.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Marble Diagram Tool</h3>
          <div className="flex gap-2">
            <button
              onClick={() => loadExample('basic')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Basic Example
            </button>
            <button
              onClick={() => loadExample('advanced')}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              Advanced Example
            </button>
            <button
              onClick={() => loadExample('error')}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Error Handling
            </button>
            <button
              onClick={clearTool}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Stream (Marble Notation)
          </label>
          <MarbleEditor
            initialValue={state.inputMarbleString}
            onStreamChange={(stream) => {
              setState((prev) => ({ ...prev, inputMarbleString: stream.name }));
            }}
            className="w-full"
          />
        </div>

        {/* Operator Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Operators Chain</label>
          <OperatorSelector
            onOperatorAdd={(appliedOperator: AppliedOperator) => {
              setState((prev) => ({
                ...prev,
                appliedOperators: [...prev.appliedOperators, appliedOperator],
              }));
            }}
            className="w-full"
          />
        </div>

        {/* Visualization */}
        <div className="space-y-4">
          {/* Input Stream Visualization */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Input Stream</h4>
            <MarbleTimeline stream={streams.input} className="border rounded p-2" />
          </div>

          {/* Operator Chain Visualization */}
          {state.appliedOperators.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Operators:</span>
                {state.appliedOperators.map((op, index) => (
                  <React.Fragment key={op.id}>
                    <span className="px-2 py-1 bg-white rounded border text-xs font-mono">
                      {op.config.name}
                    </span>
                    {index < state.appliedOperators.length - 1 && <span>→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Output Stream Visualization */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Output Stream</h4>
            <MarbleTimeline stream={streams.output} className="border rounded p-2" />
          </div>
        </div>

        {/* Stream Information */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-800 mb-1">Input Stream</div>
            <div className="text-blue-600">{streams.input.events.length} events</div>
            <div className="text-blue-600">Duration: {streams.input.duration}ms</div>
            <div className="text-blue-600">
              Status:{' '}
              {streams.input.isComplete ? 'Complete' : streams.input.hasError ? 'Error' : 'Active'}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-800 mb-1">Output Stream</div>
            <div className="text-green-600">{streams.output.events.length} events</div>
            <div className="text-green-600">Duration: {streams.output.duration}ms</div>
            <div className="text-green-600">
              Status:{' '}
              {streams.output.isComplete
                ? 'Complete'
                : streams.output.hasError
                  ? 'Error'
                  : 'Active'}
            </div>
          </div>
        </div>
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
          <li>
            • Use <code className="bg-yellow-100 px-1 rounded">-</code> for time gaps,{' '}
            <code className="bg-yellow-100 px-1 rounded">|</code> for completion,{' '}
            <code className="bg-yellow-100 px-1 rounded">#</code> for errors
          </li>
          <li>• Values can be letters, numbers, or any character (except special ones)</li>
          <li>• Chain operators to see how data transforms through the pipeline</li>
        </ul>
      </div>
    </div>
  );
};
