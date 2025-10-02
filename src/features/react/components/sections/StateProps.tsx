import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatePropsFlowVisualization from '../visualizations/2d/StatePropsFlowVisualization';

const StateProps: React.FC = () => {
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">State & Props</h1>
      <p className="text-xl text-gray-700">Data flow and component communication in React</p>
    </div>
  );

  const mainContent = (
    <>
      {/* Understanding Props */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            📥
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Props: Data Flowing Down</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Props (short for "properties") are the mechanism by which data flows from parent
            components to child components. They are read-only and cannot be modified by the
            receiving component. This unidirectional data flow is a fundamental principle of React.
          </p>
          <p>
            Props enable component composition and reusability - the same component can render
            differently based on the props it receives from its parent.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800">
              <strong>Key Principle:</strong> Props are immutable. A component cannot change its own
              props. Only the parent component that owns the data can change it.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Understanding State */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
            🔄
          </div>
          <h2 className="text-2xl font-bold text-gray-900">State: Component Memory</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            State represents data that can change over time and affects how a component renders.
            Unlike props, state is managed within the component itself and can be updated using the{' '}
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">useState</code> hook.
          </p>
          <p>
            When state changes, React automatically triggers a re-render of the component and its
            children, ensuring the UI stays synchronized with the data.
          </p>
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <p className="text-green-800">
              <strong>State Rule:</strong> Never mutate state directly. Always use the setter
              function returned by useState to update state.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Props vs State Comparison */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Props vs State: When to Use What</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                  Aspect
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                  Props
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                  State
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">Ownership</td>
                <td className="px-4 py-3 text-sm text-gray-700">Passed from parent</td>
                <td className="px-4 py-3 text-sm text-gray-700">Managed by component</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">Mutability</td>
                <td className="px-4 py-3 text-sm text-gray-700">Read-only (immutable)</td>
                <td className="px-4 py-3 text-sm text-gray-700">Mutable (via setters)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">Updates</td>
                <td className="px-4 py-3 text-sm text-gray-700">Parent component only</td>
                <td className="px-4 py-3 text-sm text-gray-700">Component itself</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">Use Case</td>
                <td className="px-4 py-3 text-sm text-gray-700">Configuration, data display</td>
                <td className="px-4 py-3 text-sm text-gray-700">User interactions, dynamic data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ThemeCard>

      {/* Lifting State Up */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Lifting State Up: Sharing State Between Components
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            When multiple components need to share and synchronize the same state, the state should
            be "lifted up" to their closest common ancestor. This ensures that all components stay
            in sync and the data flow remains predictable.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <p className="text-yellow-800">
              <strong>Common Pattern:</strong> Child components communicate changes back to the
              parent via callback functions passed as props, which then update the shared state.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 font-bold text-sm">❌</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Avoid: Sibling state sharing</p>
                <p className="text-gray-600 text-sm">
                  Don't try to synchronize state between sibling components directly.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 font-bold text-sm">✅</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Do: Lift to common ancestor</p>
                <p className="text-gray-600 text-sm">
                  Move shared state to the closest parent component that contains both siblings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive State & Props Flow Visualization */}
      <ThemeCard>
        <StatePropsFlowVisualization />
      </ThemeCard>

      {/* State Management Patterns */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Advanced State Management Patterns</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            As applications grow, managing state becomes more complex. React provides several
            patterns and tools to handle different state management needs:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-800 mb-2">useReducer for Complex State</h4>
              <p className="text-sm text-indigo-700">
                For state logic that involves multiple sub-values or complex transitions, useReducer
                provides a more predictable way to update state.
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Context API for Global State</h4>
              <p className="text-sm text-purple-700">
                When state needs to be shared across many components at different nesting levels,
                Context provides a way to pass data through the component tree without props.
              </p>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h4 className="font-semibold text-teal-800 mb-2">Custom Hooks</h4>
              <p className="text-sm text-teal-700">
                Extract stateful logic into reusable custom hooks that can be shared across multiple
                components.
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">External State Libraries</h4>
              <p className="text-sm text-orange-700">
                For very large applications, libraries like Redux, Zustand, or Jotai provide more
                sophisticated state management solutions.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <ThemeCard>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Data Flow Principles</h3>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Props Down</p>
            <p className="text-xs text-gray-600">Data flows from parent to child</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">State Up</p>
            <p className="text-xs text-gray-600">Changes flow back to parent</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Unidirectional</p>
            <p className="text-xs text-gray-600">Predictable data flow pattern</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Immutable</p>
            <p className="text-xs text-gray-600">Props cannot be modified</p>
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

export default StateProps;
