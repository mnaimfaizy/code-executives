import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import ComponentLifecycle from '../../components/models2d/react/ComponentLifecycle';

const Components: React.FC = () => {
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Components</h1>
      <p className="text-xl text-gray-700">Building blocks of React applications</p>
    </div>
  );

  const mainContent = (
    <>
      {/* What are Components */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
            🧱
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Components: Reusable UI Building Blocks
          </h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Components are the fundamental building blocks of React applications. They are
            self-contained pieces of UI that can be reused throughout your application. Each
            component encapsulates its own logic, styling, and rendering behavior.
          </p>
          <p>
            Components allow you to break down complex UIs into smaller, manageable pieces that can
            be developed, tested, and maintained independently.
          </p>
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
            <p className="text-indigo-800">
              <strong>Component Philosophy:</strong> "Everything is a component" - from simple
              buttons to entire page layouts, React encourages thinking in terms of composable UI
              elements.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Function vs Class Components */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Function Components vs Class Components
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            React supports two types of components, each with different capabilities and use cases.
            Modern React development heavily favors function components with hooks.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3 text-white">
                  λ
                </span>
                Function Components
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-700">Simpler syntax</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-700">Hooks for state and lifecycle</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-700">Better performance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-700">Modern React standard</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 text-white">
                  C
                </span>
                Class Components
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-blue-700">this.state and this.setState</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-blue-700">Lifecycle methods</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-blue-700">Legacy code support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-blue-700">More verbose syntax</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Component Lifecycle */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Component Lifecycle: Birth, Life, and Death
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            Every React component goes through a lifecycle of phases: mounting (creation), updating
            (re-rendering), and unmounting (cleanup). Understanding these phases helps you manage
            side effects and optimize performance.
          </p>

          <div className="space-y-4">
            <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-r-lg">
              <h4 className="font-semibold text-emerald-800 mb-2">🍼 Mounting Phase</h4>
              <p className="text-sm text-emerald-700">
                Component is created and inserted into the DOM. This happens once per component
                instance. Use{' '}
                <code className="bg-emerald-100 px-1 rounded">useEffect(() =&gt; ..., [])</code> for
                setup.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🔄 Updating Phase</h4>
              <p className="text-sm text-blue-700">
                Component re-renders due to props or state changes. This can happen many times. Use{' '}
                <code className="bg-blue-100 px-1 rounded">useEffect(() =&gt; ..., [deps])</code>{' '}
                for side effects.
              </p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <h4 className="font-semibold text-red-800 mb-2">💀 Unmounting Phase</h4>
              <p className="text-sm text-red-700">
                Component is removed from the DOM. Use cleanup functions in useEffect to prevent
                memory leaks. Return a cleanup function from useEffect for teardown.
              </p>
            </div>
          </div>

          {/* Interactive Lifecycle Visualization */}
          <div className="mt-6">
            <ComponentLifecycle />
          </div>
        </div>
      </ThemeCard>

      {/* Component Composition */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Component Composition: Building Complex UIs
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            React's composition model allows you to build complex UIs by combining simpler
            components. This approach is more flexible and maintainable than inheritance-based
            patterns.
          </p>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Containment</p>
                <p className="text-gray-600 text-sm">
                  Components can contain other components as children, allowing flexible layouts.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-600 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Specialization</p>
                <p className="text-gray-600 text-sm">
                  Create specific components by configuring general-purpose ones with props.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-teal-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Render Props</p>
                <p className="text-gray-600 text-sm">
                  Share code between components by passing render functions as props.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Component Patterns */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Common Component Patterns</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            As you build more React applications, you'll encounter several patterns that help solve
            common problems and improve code organization.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">Higher-Order Components (HOC)</h4>
              <p className="text-sm text-orange-700">
                Functions that take a component and return a new component with additional props or
                behavior. Used for cross-cutting concerns like authentication or data fetching.
              </p>
            </div>
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <h4 className="font-semibold text-cyan-800 mb-2">Custom Hooks</h4>
              <p className="text-sm text-cyan-700">
                Extract stateful logic into reusable functions. Custom hooks can share logic between
                components without adding extra nesting.
              </p>
            </div>
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h4 className="font-semibold text-pink-800 mb-2">Compound Components</h4>
              <p className="text-sm text-pink-700">
                Groups of components that work together. The parent component provides context, and
                child components consume it implicitly.
              </p>
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <h4 className="font-semibold text-violet-800 mb-2">Controlled vs Uncontrolled</h4>
              <p className="text-sm text-violet-700">
                Controlled components have their value managed by React state. Uncontrolled
                components manage their own state internally.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <ThemeCard>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Component Types</h3>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Function Components</p>
            <p className="text-xs text-gray-600">Modern, hooks-based</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Class Components</p>
            <p className="text-xs text-gray-600">Legacy, lifecycle methods</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Pure Components</p>
            <p className="text-xs text-gray-600">Optimized re-rendering</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Memo Components</p>
            <p className="text-xs text-gray-600">React.memo optimization</p>
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

export default Components;
