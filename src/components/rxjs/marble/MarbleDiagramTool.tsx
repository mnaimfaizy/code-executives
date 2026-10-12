import React, { useId, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { AppliedOperator } from '../shared/types';
import { createMarbleStream, applyOperators, describeOperator } from '../shared/utils';
import type { OperatorSettings } from '../shared/utils';
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

const examples: Record<'basic' | 'advanced' | 'error', MarbleDiagramToolState> = {
  basic: {
    inputMarbleString: '--1--2--3--|',
    appliedOperators: [],
  },
  advanced: {
    inputMarbleString: '--a--b--c--d--e--|',
    appliedOperators: [{ id: 'map-example', name: 'map', choice: 'upperCase' }],
  },
  error: {
    inputMarbleString: '--1--2--#',
    appliedOperators: [],
  },
};

const streamStatus = (stream: { isComplete: boolean; hasError: boolean }): string =>
  stream.isComplete ? 'Complete' : stream.hasError ? 'Error' : 'Active';

export const MarbleDiagramTool: React.FC<MarbleDiagramToolProps> = ({
  initialState,
  className = '',
}) => {
  const [state, setState] = useState<MarbleDiagramToolState>({
    inputMarbleString: '--a--b--c--|',
    appliedOperators: [],
    ...initialState,
  });
  const nextOperatorId = useRef(0);
  const chainLabelId = useId();

  // Both streams are worked out from the state, so the text box, the chain and
  // the diagram cannot disagree.
  const streams = useMemo(() => {
    const input = createMarbleStream('input', 'Input', state.inputMarbleString);
    const output = {
      ...applyOperators(input, state.appliedOperators),
      id: 'output',
      name: 'Output',
    };
    return { input, output };
  }, [state.inputMarbleString, state.appliedOperators]);

  const clearTool = () => {
    setState({ inputMarbleString: '', appliedOperators: [] });
  };

  const loadExample = (example: keyof typeof examples) => {
    setState(examples[example]);
  };

  const addOperator = (operator: OperatorSettings) => {
    nextOperatorId.current += 1;
    const id = `${operator.name}-${nextOperatorId.current}`;
    setState((prev) => ({
      ...prev,
      appliedOperators: [...prev.appliedOperators, { ...operator, id }],
    }));
  };

  const removeOperator = (id: string) => {
    setState((prev) => ({
      ...prev,
      appliedOperators: prev.appliedOperators.filter((operator) => operator.id !== id),
    }));
  };

  return (
    <div className={`marble-diagram-tool ${className}`}>
      {/* Description */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Interactive Marble Diagrams</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Write a stream in marble notation, pick an operator and see the stream it produces. The
          result is worked out from the marbles: no code is run.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Marble Diagram Tool</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadExample('basic')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Basic Example
            </button>
            <button
              type="button"
              onClick={() => loadExample('advanced')}
              className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
            >
              Advanced Example
            </button>
            <button
              type="button"
              onClick={() => loadExample('error')}
              className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Error Handling
            </button>
            <button
              type="button"
              onClick={clearTool}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <MarbleEditor
            value={state.inputMarbleString}
            onChange={(inputMarbleString) => {
              setState((prev) => ({ ...prev, inputMarbleString }));
            }}
            className="w-full"
          />
        </div>

        {/* Operator Selection */}
        <div className="mb-6">
          <OperatorSelector onOperatorAdd={addOperator} className="w-full" />
        </div>

        {/* Visualization */}
        <div className="space-y-4">
          {/* Input Stream Visualization */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Input Stream</h4>
            <MarbleTimeline
              stream={streams.input}
              showName={false}
              className="border rounded p-2"
            />
          </div>

          {/* Operator Chain */}
          {state.appliedOperators.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 rounded">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span id={chainLabelId}>Operators:</span>
                <ol aria-labelledby={chainLabelId} className="flex flex-wrap items-center gap-2">
                  {state.appliedOperators.map((op, index) => (
                    <li key={op.id} className="flex items-center gap-2">
                      {index > 0 && <span aria-hidden="true">→</span>}
                      <span className="flex items-center gap-1 pl-2 pr-1 py-1 bg-white rounded border text-xs font-mono">
                        {describeOperator(op)}
                        <button
                          type="button"
                          onClick={() => removeOperator(op.id)}
                          aria-label={`Remove ${describeOperator(op)}`}
                          className="p-0.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Output Stream Visualization */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Output Stream</h4>
            <MarbleTimeline
              stream={streams.output}
              showName={false}
              className="border rounded p-2"
            />
          </div>
        </div>

        {/* Stream Information */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-800 mb-1">Input Stream</div>
            <div className="text-blue-600">{streams.input.events.length} events</div>
            <div className="text-blue-600">Duration: {streams.input.duration}ms</div>
            <div className="text-blue-600">Status: {streamStatus(streams.input)}</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-800 mb-1">Output Stream</div>
            <div className="text-green-600">{streams.output.events.length} events</div>
            <div className="text-green-600">Duration: {streams.output.duration}ms</div>
            <div className="text-green-600">Status: {streamStatus(streams.output)}</div>
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
