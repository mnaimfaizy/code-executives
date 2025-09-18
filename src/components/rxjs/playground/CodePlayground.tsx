import React, { useState, useCallback } from 'react';
import type { CodeExample } from '../shared/types';

interface CodePlaygroundProps {
  initialCode?: string;
  className?: string;
}

const defaultCode = `// RxJS Code Playground
import { Observable, map, filter, take } from 'rxjs';

// Create a simple observable
const source$ = new Observable(subscriber => {
  let count = 1;
  const interval = setInterval(() => {
    subscriber.next(count++);
    if (count > 5) {
      subscriber.complete();
      clearInterval(interval);
    }
  }, 1000);
});

// Transform the stream
const result$ = source$.pipe(
  filter(x => x % 2 === 0), // Only even numbers
  map(x => x * 10),         // Multiply by 10
  take(2)                   // Take only first 2 values
);

// Subscribe and log results
result$.subscribe({
  next: value => console.log('Result:', value),
  complete: () => console.log('Complete!')
});`;

const codeExamples: CodeExample[] = [
  {
    id: 'basic-observable',
    title: 'Basic Observable',
    description: 'Create and subscribe to a simple observable',
    code: `import { Observable } from 'rxjs';

const obs$ = new Observable(subscriber => {
  subscriber.next('Hello');
  subscriber.next('World');
  subscriber.complete();
});

obs$.subscribe(value => console.log(value));`,
    expectedOutput: 'Hello\\nWorld',
    difficulty: 'beginner',
    category: 'creation',
  },
  {
    id: 'operators-chain',
    title: 'Operator Chain',
    description: 'Use multiple operators together',
    code: `import { of, map, filter, tap } from 'rxjs';

of(1, 2, 3, 4, 5)
  .pipe(
    tap(x => console.log('Before filter:', x)),
    filter(x => x % 2 === 0),
    map(x => x * x),
    tap(x => console.log('After map:', x))
  )
  .subscribe(result => console.log('Final:', result));`,
    expectedOutput: 'Before filter: 1\\nBefore filter: 2\\nAfter map: 4\\nFinal: 4\\n...',
    difficulty: 'intermediate',
    category: 'transformation',
  },
  {
    id: 'error-handling',
    title: 'Error Handling',
    description: 'Handle errors in observables',
    code: `import { throwError, catchError, of } from 'rxjs';

throwError(() => new Error('Something went wrong!'))
  .pipe(
    catchError(err => {
      console.error('Caught error:', err.message);
      return of('Recovered with default value');
    })
  )
  .subscribe(value => console.log('Result:', value));`,
    expectedOutput: 'Caught error: Something went wrong!\\nResult: Recovered with default value',
    difficulty: 'intermediate',
    category: 'error-handling',
  },
];

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode = defaultCode,
  className = '',
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedExample, setSelectedExample] = useState<string>('');

  const captureConsole = useCallback(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const capturedOutput: string[] = [];

    console.log = (...args: unknown[]) => {
      capturedOutput.push(`LOG: ${args.map((arg) => String(arg)).join(' ')}`);
      originalLog.apply(console, args);
    };

    console.error = (...args: unknown[]) => {
      capturedOutput.push(`ERROR: ${args.map((arg) => String(arg)).join(' ')}`);
      originalError.apply(console, args);
    };

    return {
      restore: () => {
        console.log = originalLog;
        console.error = originalError;
      },
      getOutput: () => capturedOutput,
    };
  }, []);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput([]);

    const { restore } = captureConsole();

    try {
      // Note: In a real implementation, you would need to compile and execute the RxJS code
      // This is a simplified simulation
      setOutput([
        '// Code execution simulation',
        '// In a real environment, this would execute your RxJS code',
      ]);

      // Simulate some delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOutput((prev) => [
        ...prev,
        '// Simulated output:',
        'Observable created successfully',
        'Stream completed',
      ]);
    } catch (error) {
      setOutput((prev) => [
        ...prev,
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ]);
    } finally {
      restore();
      setIsRunning(false);
    }
  }, [captureConsole]);

  const loadExample = useCallback((exampleId: string) => {
    const example = codeExamples.find((ex) => ex.id === exampleId);
    if (example) {
      setCode(example.code);
      setSelectedExample(exampleId);
      setOutput([]);
    }
  }, []);

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  return (
    <div className={`code-playground bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">RxJS Code Playground</h3>
        <div className="flex gap-2">
          <select
            value={selectedExample}
            onChange={(e) => loadExample(e.target.value)}
            className="px-3 py-1 text-sm border rounded hover:border-blue-400 focus:outline-none focus:border-blue-500"
          >
            <option value="">Select Example</option>
            {codeExamples.map((example) => (
              <option key={example.id} value={example.id}>
                {example.title} ({example.difficulty})
              </option>
            ))}
          </select>
          <button
            onClick={runCode}
            disabled={isRunning}
            className="px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          <button
            onClick={clearOutput}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Clear Output
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">RxJS Code Editor</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your RxJS code here..."
            spellCheck={false}
          />

          {/* Code Editor Toolbar */}
          <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
            <span>Lines: {code.split('\n').length}</span>
            <span>Characters: {code.length}</span>
          </div>
        </div>

        {/* Output Panel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Output Console</label>
          <div className="w-full h-96 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg overflow-y-auto">
            {output.length === 0 ? (
              <div className="text-gray-500">Click "Run Code" to see output...</div>
            ) : (
              output.map((line, index) => (
                <div key={index} className="mb-1">
                  {line}
                </div>
              ))
            )}
            {isRunning && <div className="text-yellow-400 animate-pulse">Executing code...</div>}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Quick Tips:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • Import RxJS operators at the top:{' '}
            <code className="bg-blue-100 px-1 rounded">
              import {`{ Observable, map, filter }`} from 'rxjs';
            </code>
          </li>
          <li>
            • Use <code className="bg-blue-100 px-1 rounded">pipe()</code> to chain operators
            together
          </li>
          <li>
            • Always <code className="bg-blue-100 px-1 rounded">subscribe()</code> to observables to
            see results
          </li>
          <li>
            • Use <code className="bg-blue-100 px-1 rounded">console.log()</code> to debug
            intermediate values
          </li>
          <li>
            • Remember to handle errors with{' '}
            <code className="bg-blue-100 px-1 rounded">catchError</code>
          </li>
        </ul>
      </div>

      {/* Selected Example Info */}
      {selectedExample && (
        <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
          {(() => {
            const example = codeExamples.find((ex) => ex.id === selectedExample);
            return example ? (
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">{example.title}</h4>
                <p className="text-sm text-yellow-700 mb-2">{example.description}</p>
                <div className="text-xs text-yellow-600">
                  <span className="inline-block bg-yellow-200 px-2 py-1 rounded mr-2">
                    Difficulty: {example.difficulty}
                  </span>
                  <span className="inline-block bg-yellow-200 px-2 py-1 rounded">
                    Category: {example.category}
                  </span>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};
