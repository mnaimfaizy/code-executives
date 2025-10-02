import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import HooksVisualization from '../visualizations/2d/HooksVisualization';

const Hooks: React.FC = () => {
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">React Hooks</h1>
      <p className="text-xl text-gray-700">State and lifecycle management in function components</p>
    </div>
  );

  const mainContent = (
    <>
      {/* What are Hooks */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
            🪝
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Hooks: State in Function Components</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Hooks are functions that let you "hook into" React state and lifecycle features from
            function components. They were introduced in React 16.8 to solve the problem of reusing
            stateful logic between components without introducing complex patterns like render props
            or higher-order components.
          </p>
          <p>
            Hooks allow function components to have state, lifecycle methods, and side effects -
            capabilities that were previously only available in class components.
          </p>
          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
            <p className="text-purple-800">
              <strong>Hook Rules:</strong> Hooks can only be called at the top level of React
              functions and custom hooks. Never call hooks inside loops, conditions, or nested
              functions.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Essential Hooks */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Essential Hooks: useState, useEffect, useContext
        </h3>
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-blue-800 mb-2">useState: Component State</h4>
            <p className="text-blue-700 mb-3">
              The most fundamental hook - manages local component state. Returns a state value and a
              function to update it.
            </p>
            <div className="bg-blue-100 p-3 rounded text-sm font-mono text-blue-900">
              const [count, setCount] = useState(0);
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-green-800 mb-2">useEffect: Side Effects</h4>
            <p className="text-green-700 mb-3">
              Handles side effects like data fetching, subscriptions, or DOM manipulation. Runs
              after every render by default.
            </p>
            <div className="bg-green-100 p-3 rounded text-sm font-mono text-green-900">
              useEffect(() =&gt; {'{'} fetchData(); {'}'}, [dependencies]);
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-indigo-800 mb-2">
              useContext: Context Consumption
            </h4>
            <p className="text-indigo-700 mb-3">
              Subscribes to React context without introducing nesting. Eliminates "prop drilling"
              for deeply nested components.
            </p>
            <div className="bg-indigo-100 p-3 rounded text-sm font-mono text-indigo-900">
              const theme = useContext(ThemeContext);
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Additional Hooks */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Built-in Hooks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-2">useReducer</h4>
            <p className="text-sm text-orange-700 mb-2">
              Alternative to useState for complex state logic. Uses a reducer function similar to
              Redux.
            </p>
            <div className="bg-orange-100 p-2 rounded text-xs font-mono text-orange-900">
              const [state, dispatch] = useReducer(reducer, initialState);
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <h4 className="font-semibold text-teal-800 mb-2">useMemo</h4>
            <p className="text-sm text-teal-700 mb-2">
              Memoizes expensive calculations. Only recomputes when dependencies change.
            </p>
            <div className="bg-teal-100 p-2 rounded text-xs font-mono text-teal-900">
              const memoizedValue = useMemo(() =&gt; computeExpensiveValue(a, b), [a, b]);
            </div>
          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <h4 className="font-semibold text-pink-800 mb-2">useCallback</h4>
            <p className="text-sm text-pink-700 mb-2">
              Returns a memoized callback function. Prevents unnecessary re-renders of child
              components.
            </p>
            <div className="bg-pink-100 p-2 rounded text-xs font-mono text-pink-900">
              const memoizedCallback = useCallback(() =&gt; doSomething(a, b), [a, b]);
            </div>
          </div>

          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <h4 className="font-semibold text-cyan-800 mb-2">useRef</h4>
            <p className="text-sm text-cyan-700 mb-2">
              Creates a mutable ref object that persists across renders. Useful for DOM access.
            </p>
            <div className="bg-cyan-100 p-2 rounded text-xs font-mono text-cyan-900">
              const inputRef = useRef&lt;HTMLInputElement&gt;(null);
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Custom Hooks */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Custom Hooks: Reusable Logic</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            Custom hooks are JavaScript functions that start with "use" and can call other hooks.
            They allow you to extract component logic into reusable functions, promoting code reuse
            and separation of concerns.
          </p>

          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Example: useLocalStorage Hook</h4>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-900">
              function useLocalStorage(key, initialValue) {'{'}
              <br />
              &nbsp;&nbsp;const [storedValue, setStoredValue] = useState(() =&gt; {'{'}
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;try {'{'}
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;const item = window.localStorage.getItem(key);
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return item ? JSON.parse(item) : initialValue;
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;{'}'} catch (error) {'{'}
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return initialValue;
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;{'}'}
              <br />
              &nbsp;&nbsp;{'}'});
              <br />
              <br />
              &nbsp;&nbsp;const setValue = (value) =&gt; {'{'}
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;try {'{'}
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;const valueToStore = value instanceof Function ?
              value(storedValue) : value;
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;setStoredValue(valueToStore);
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;window.localStorage.setItem(key,
              JSON.stringify(valueToStore));
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;{'}'} catch (error) {'{'}
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;console.log(error);
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;{'}'}
              <br />
              &nbsp;&nbsp;{'}'};<br />
              <br />
              &nbsp;&nbsp;return [storedValue, setValue];
              <br />
              {'}'}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">
                <strong>Logic Extraction:</strong> Move complex state logic out of components
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">
                <strong>Reusability:</strong> Share logic across multiple components
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">
                <strong>Testability:</strong> Test hooks independently from UI components
              </span>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive Hooks Visualization */}
      <ThemeCard>
        <HooksVisualization />
      </ThemeCard>

      {/* Hook Patterns and Best Practices */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Hook Patterns and Best Practices</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-800">✅ Do's</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Call hooks at the top level only</li>
                <li>• Use hooks in React functions and custom hooks</li>
                <li>• Follow the naming convention (use*)</li>
                <li>• Use ESLint rules for hooks</li>
                <li>• Keep hooks simple and focused</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-red-800">❌ Don'ts</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Call hooks inside loops or conditions</li>
                <li>• Use hooks in regular JavaScript functions</li>
                <li>• Break the rules of hooks</li>
                <li>• Create hooks that are too complex</li>
                <li>• Ignore dependency arrays</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <p className="text-yellow-800">
              <strong>Dependency Arrays:</strong> Always include all dependencies in useEffect and
              other hooks. Missing dependencies can cause stale closures and bugs. Use the
              exhaustive-deps ESLint rule.
            </p>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <ThemeCard>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Hook Categories</h3>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">State Hooks</p>
            <p className="text-xs text-gray-600">useState, useReducer</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Effect Hooks</p>
            <p className="text-xs text-gray-600">useEffect, useLayoutEffect</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Context Hooks</p>
            <p className="text-xs text-gray-600">useContext</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Performance Hooks</p>
            <p className="text-xs text-gray-600">useMemo, useCallback</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Ref Hooks</p>
            <p className="text-xs text-gray-600">useRef, useImperativeHandle</p>
          </div>
        </div>
      </div>
    </ThemeCard>
  );

  return (
    <SectionLayout
      section="react"
      hero={heroContent}
      mainContent={mainContent}
      sidebar={sidebarContent}
    />
  );
};

export default Hooks;
