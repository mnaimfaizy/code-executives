import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import VirtualDOMDiffing from '../visualizations/2d/VirtualDOMDiffing';

const VirtualDOM: React.FC = () => {
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Virtual DOM</h1>
      <p className="text-xl text-gray-700">
        React's performance innovation for efficient UI updates
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* What is Virtual DOM */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
            ⚡
          </div>
          <h2 className="text-2xl font-bold text-gray-900">A Lightweight Abstraction</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            The Virtual DOM (VDOM) is a core concept of React and is essential to its performance.
            It is a "programming concept," not a browser technology. The VDOM is an "ideal, or
            'virtual', representation of a UI" that is maintained completely in memory.
          </p>
          <p>
            It is a "lightweight and in-memory representation" of the actual DOM, structured as a
            tree of JavaScript objects. The individual nodes in this virtual tree are called React
            Elements, which are simple JavaScript objects that represent a DOM element.
          </p>
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
            <p className="text-indigo-800">
              <strong>Key Distinction:</strong> The Virtual DOM itself is incapable of manipulating
              elements on the screen; it is merely an abstraction used to calculate what changes
              should be made to the real DOM.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Real DOM vs Virtual DOM */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Real DOM vs Virtual DOM</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-3 text-left font-semibold">Aspect</th>
                <th className="border border-gray-300 p-3 text-left font-semibold text-red-600">
                  Real DOM
                </th>
                <th className="border border-gray-300 p-3 text-left font-semibold text-green-600">
                  Virtual DOM
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-3 font-medium">Representation</td>
                <td className="border border-gray-300 p-3 text-red-700">
                  Actual webpage structure
                </td>
                <td className="border border-gray-300 p-3 text-green-700">
                  Lightweight JavaScript objects
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-medium">Update Cost</td>
                <td className="border border-gray-300 p-3 text-red-700">
                  Expensive - triggers layout recalculation
                </td>
                <td className="border border-gray-300 p-3 text-green-700">
                  Cheap - in-memory object manipulation
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 font-medium">Manipulation</td>
                <td className="border border-gray-300 p-3 text-red-700">
                  Direct browser API calls
                </td>
                <td className="border border-gray-300 p-3 text-green-700">
                  JavaScript object operations
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-medium">Performance</td>
                <td className="border border-gray-300 p-3 text-red-700">
                  Slow for frequent updates
                </td>
                <td className="border border-gray-300 p-3 text-green-700">
                  Fast diffing and minimal updates
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ThemeCard>

      {/* How Virtual DOM Works */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">How the Virtual DOM Powers React</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            React's Virtual DOM enables efficient UI updates through a three-step process:
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">State/Props Change</h4>
                <p className="text-gray-600 text-sm">
                  When a component's state or props change, React creates a new Virtual DOM tree
                  representing the desired UI state.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Diffing Algorithm</h4>
                <p className="text-gray-600 text-sm">
                  React compares the new Virtual DOM with the previous version, identifying the
                  minimal set of changes needed.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Reconciliation</h4>
                <p className="text-gray-600 text-sm">
                  React updates only the changed parts of the real DOM, minimizing expensive browser
                  operations.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <p className="text-green-800">
              <strong>Performance Benefit:</strong> Instead of re-rendering the entire DOM tree,
              React performs surgical updates, making applications feel fast and responsive even
              with complex UIs.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive Virtual DOM Diffing */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Virtual DOM Diffing in Action</h3>
        <p className="text-gray-700 mb-4">
          See how React's diffing algorithm compares Virtual DOM trees. Switch between "Before",
          "After", and "Diff" views to understand how React identifies minimal changes.
        </p>
        <VirtualDOMDiffing className="mb-4" />
        <div className="text-sm text-gray-600">
          <strong>Example:</strong> When a counter increments from 0 to 1, React only updates the
          text content node, leaving the rest of the DOM unchanged.
        </div>
      </ThemeCard>

      {/* Why Virtual DOM Matters */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Why Virtual DOM Revolutionized Web Development
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            Before React, developers had to manually manage DOM updates, leading to:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Traditional Challenges</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Imperative DOM manipulation</li>
                <li>• Manual change tracking</li>
                <li>• Complex, error-prone code</li>
                <li>• Performance bottlenecks</li>
                <li>• Difficult debugging</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ React's Solution</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Declarative UI descriptions</li>
                <li>• Automatic optimization</li>
                <li>• Predictable updates</li>
                <li>• Better developer experience</li>
                <li>• Improved performance</li>
              </ul>
            </div>
          </div>

          <p className="text-gray-700">
            The Virtual DOM abstraction allows developers to focus on describing what the UI should
            look like, while React handles the complex task of efficiently updating the actual DOM.
          </p>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <ThemeCard>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Virtual DOM Essentials</h3>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Lightweight Representation</p>
            <p className="text-xs text-gray-600">JavaScript objects, not DOM elements</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">In-Memory Operations</p>
            <p className="text-xs text-gray-600">Fast object manipulation vs slow DOM updates</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Intelligent Diffing</p>
            <p className="text-xs text-gray-600">Minimal changes calculation</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Surgical Updates</p>
            <p className="text-xs text-gray-600">Only changed parts of real DOM updated</p>
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

export default VirtualDOM;
