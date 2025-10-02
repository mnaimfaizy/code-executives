import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface HookExample {
  name: string;
  description: string;
  code: string;
  visual: React.ReactNode;
}

const HooksVisualization: React.FC = () => {
  const [activeHook, setActiveHook] = useState<string>('useState');
  const [counter, setCounter] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // useEffect example
  useEffect(() => {
    document.title = `Counter: ${counter}`;
    return () => {
      // Cleanup would go here
    };
  }, [counter]);

  // useMemo example
  const expensiveCalculation = useMemo(() => {
    console.log('Expensive calculation running...');
    return counter * 2 + 10;
  }, [counter]);

  // useCallback example
  const incrementCallback = useCallback(() => {
    setCounter((prev) => prev + 1);
  }, []);

  const startTimer = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setCounter((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetCounter = () => {
    setCounter(0);
    stopTimer();
  };

  const hooks: HookExample[] = [
    {
      name: 'useState',
      description: 'Manages local component state',
      code: `const [count, setCount] = useState(0);`,
      visual: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCounter((prev) => prev - 1)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              -1
            </button>
            <span className="text-2xl font-bold text-gray-900">Count: {counter}</span>
            <button
              onClick={() => setCounter((prev) => prev + 1)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              +1
            </button>
          </div>
          <div className="text-sm text-gray-600">
            State value: <code className="bg-gray-100 px-2 py-1 rounded">{counter}</code>
          </div>
        </div>
      ),
    },
    {
      name: 'useEffect',
      description: 'Handles side effects and lifecycle events',
      code: `useEffect(() => { document.title = \`Count: \${count}\`; }, [count]);`,
      visual: (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              Check the browser tab title - it updates automatically!
            </p>
            <p className="text-blue-600 text-xs mt-1">Current title: "Counter: {counter}"</p>
          </div>
          <div className="text-sm text-gray-600">
            Effect runs when counter changes:{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">[{counter}]</code>
          </div>
        </div>
      ),
    },
    {
      name: 'useMemo',
      description: 'Memoizes expensive calculations',
      code: `const result = useMemo(() => expensiveCalc(input), [input]);`,
      visual: (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              Expensive calculation result: <strong>{expensiveCalculation}</strong>
            </p>
            <p className="text-green-600 text-xs mt-1">Only recalculates when counter changes</p>
          </div>
          <div className="text-sm text-gray-600">
            Check console - calculation only runs when counter changes
          </div>
        </div>
      ),
    },
    {
      name: 'useCallback',
      description: 'Memoizes function references',
      code: `const callback = useCallback(() => doSomething(), [deps]);`,
      visual: (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={incrementCallback}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Increment (useCallback)
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Function reference is stable across re-renders
          </div>
        </div>
      ),
    },
    {
      name: 'useRef',
      description: 'Persists mutable values across renders',
      code: `const ref = useRef(initialValue);`,
      visual: (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={startTimer}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Start Timer
            </button>
            <button
              onClick={stopTimer}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Stop Timer
            </button>
            <button
              onClick={resetCounter}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Timer uses useRef to persist interval ID across renders
          </div>
        </div>
      ),
    },
  ];

  const currentHook = hooks.find((h) => h.name === activeHook) || hooks[0];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Interactive React Hooks Demo</h3>
        <p className="text-gray-700">
          Click on different hooks to see them in action. Each hook demonstrates its core
          functionality with interactive examples.
        </p>
      </div>

      {/* Hook Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {hooks.map((hook) => (
          <button
            key={hook.name}
            onClick={() => setActiveHook(hook.name)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeHook === hook.name
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {hook.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hook Information */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-bold text-gray-900 mb-2">{currentHook.name}</h4>
            <p className="text-gray-700 mb-3">{currentHook.description}</p>
            <div className="bg-white p-3 rounded border font-mono text-sm">{currentHook.code}</div>
          </div>

          {/* Hook Lifecycle Visualization */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-3">When does it run?</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-blue-800">
                  {currentHook.name === 'useState' && 'Every render (but state persists)'}
                  {currentHook.name === 'useEffect' && 'After render (with dependency checks)'}
                  {currentHook.name === 'useMemo' && 'Only when dependencies change'}
                  {currentHook.name === 'useCallback' && 'Returns memoized function'}
                  {currentHook.name === 'useRef' && 'Creates persistent reference'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="space-y-4">
          <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-3">Interactive Demo</h5>
            {currentHook.visual}
          </div>

          {/* Hook Rules Reminder */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h5 className="font-semibold text-yellow-900 mb-2">⚠️ Rules of Hooks</h5>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Only call hooks at the top level</li>
              <li>• Only call hooks from React functions</li>
              <li>• Hooks must be called in the same order</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Component State Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-semibold text-gray-900 mb-3">Component State Summary</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Counter:</span>
            <span className="font-mono ml-2">{counter}</span>
          </div>
          <div>
            <span className="text-gray-600">Memo Result:</span>
            <span className="font-mono ml-2">{expensiveCalculation}</span>
          </div>
          <div>
            <span className="text-gray-600">Timer Active:</span>
            <span className="font-mono ml-2">{intervalRef.current ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HooksVisualization;
