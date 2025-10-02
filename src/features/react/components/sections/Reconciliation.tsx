import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import ReconciliationVisualization from '../visualizations/2d/ReconciliationVisualization';

const Reconciliation: React.FC = () => {
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Reconciliation</h1>
      <p className="text-xl text-gray-700">
        The diffing algorithm that powers efficient UI updates
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* What is Reconciliation */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
            🔄
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Syncing Virtual DOM with Real DOM</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Reconciliation is the name React gives to the entire process of syncing the Virtual DOM
            with the real DOM. When a component's state or props change, React triggers a re-render,
            creating a new Virtual DOM tree. This new tree is then compared to the previous one, and
            based on the differences, React creates a minimal "list of updates" that must be applied
            to the real DOM.
          </p>
          <p>
            This process allows React to update the user interface with a minimum number of
            operations, a significant performance gain over direct DOM manipulation.
          </p>
          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
            <p className="text-purple-800">
              <strong>Core Goal:</strong> Transform declarative UI descriptions into efficient,
              minimal DOM operations that maintain optimal performance.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* The Diffing Algorithm */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          The Diffing Algorithm: Finding Minimal Changes
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            The core of reconciliation is the "diffing algorithm". This algorithm is a heuristic,
            meaning it uses a set of efficient rules to find the differences between the two Virtual
            DOM trees. It operates on two key assumptions:
          </p>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Different element types = Complete replacement
                </p>
                <p className="text-gray-600 text-sm">
                  If the root elements have different types (e.g., &lt;div&gt; vs &lt;p&gt;), React
                  will tear down the old tree and build a new one from scratch.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Same element types = Attribute updates</p>
                <p className="text-gray-600 text-sm">
                  When comparing elements of the same type, React preserves the existing DOM node
                  and only updates the changed attributes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Keys for list reconciliation</p>
                <p className="text-gray-600 text-sm">
                  For lists of elements, React uses keys to identify which items have been added,
                  removed, or moved, preventing unnecessary re-creation of DOM nodes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Understanding React Fiber */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          React Fiber: Concurrent Rendering Engine
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            The reconciliation engine in React 16 is called Fiber. While the original reconciliation
            process was a significant step forward, large or complex updates could still block the
            browser's main thread, leading to a "janky" or unresponsive user experience.
          </p>

          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
            <p className="text-indigo-800">
              <strong>Fiber's Innovation:</strong> Enables "incremental rendering" by breaking work
              into smaller chunks that can be paused and resumed, allowing the browser to handle
              other tasks like user input or animations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Before Fiber</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Blocking main thread</li>
                <li>• All-or-nothing updates</li>
                <li>• Janky user experience</li>
                <li>• Limited prioritization</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ With Fiber</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Incremental rendering</li>
                <li>• Pause/resume capability</li>
                <li>• Smooth user interactions</li>
                <li>• Intelligent prioritization</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive Fiber Reconciliation */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Fiber Reconciliation in Action</h3>
        <p className="text-gray-700 mb-4">
          Experience React's concurrent rendering engine. Watch how Fiber processes updates
          incrementally, marking effects and maintaining smooth user interactions.
        </p>
        <ReconciliationVisualization className="mb-4" />
        <div className="text-sm text-gray-600">
          <strong>Demo:</strong> When counter state changes from 0 to 1, Fiber marks the affected
          components and efficiently updates only the changed parts of the UI.
        </div>
      </ThemeCard>

      {/* Performance Implications */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Implications</h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            React's reconciliation process represents a fundamental shift in how web applications
            handle UI updates. Instead of the traditional approach of direct DOM manipulation, React
            introduces a layer of abstraction that enables:
          </p>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">
                <strong>Predictable Performance:</strong> Consistent update patterns regardless of
                UI complexity
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">
                <strong>Developer Productivity:</strong> Focus on business logic rather than DOM
                optimization
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">
                <strong>Scalable Architecture:</strong> Performance that improves with React's
                optimizations
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700">
                <strong>Cross-Platform Consistency:</strong> Same reconciliation logic across web,
                mobile, etc.
              </span>
            </div>
          </div>

          <p className="text-gray-700">
            The reconciliation process is what makes React's "learn once, write anywhere" philosophy
            possible - the same efficient update mechanism powers React applications across all
            platforms.
          </p>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <ThemeCard>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Reconciliation Process</h3>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Virtual DOM Diffing</p>
            <p className="text-xs text-gray-600">Compare old vs new tree structures</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Heuristic Algorithm</p>
            <p className="text-xs text-gray-600">Efficient rules for finding differences</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Minimal Updates</p>
            <p className="text-xs text-gray-600">Only changed DOM elements updated</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Fiber Architecture</p>
            <p className="text-xs text-gray-600">Concurrent rendering for smooth UX</p>
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

export default Reconciliation;
