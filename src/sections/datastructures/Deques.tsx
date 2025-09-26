import React from 'react';
import { Hash } from 'lucide-react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import StatsGrid from '../../components/shared/StatsGrid';
import CTASection from '../../components/shared/CTASection';
import DequeVisualization from '../../components/models2d/datastructures/deques/DequeVisualization';

/**
 * Deques (Double-Ended Queues) Section
 * Interactive learning module for understanding deque data structures
 */
const Deques: React.FC = () => {
  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Deques (Double-Ended Queues)</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Master the versatile deque data structure that allows efficient insertion and deletion
          from both ends. Perfect for implementing stacks, queues, and more complex data flow
          patterns.
        </p>
      </div>
      <StatsGrid
        stats={[
          { label: 'Time Complexity', value: 'O(1)' },
          { label: 'Space Complexity', value: 'O(n)' },
          { label: 'Operations', value: '8+' },
          { label: 'Use Cases', value: '5+' },
        ]}
        colorScheme="datastructures"
      />
    </div>
  );

  // Main content with visualization and information
  const mainContent = (
    <>
      {/* Interactive Visualization */}
      <ThemeCard className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Hash className="w-6 h-6 mr-2 text-indigo-600" />
            Interactive Deque Visualization
          </h2>
          <p className="text-gray-600 mb-6">
            Explore deque operations with this interactive visualization. Add and remove elements
            from both ends, and see how the structure maintains efficiency.
          </p>
          <DequeVisualization />
        </div>
      </ThemeCard>

      {/* Core Concepts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ThemeCard>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">What is a Deque?</h3>
            <div className="space-y-4 text-gray-700">
              <p>
                A <strong>deque (double-ended queue)</strong> is a linear data structure that allows
                insertion and deletion of elements from both ends efficiently. Unlike regular queues
                that only allow operations at one end, deques provide flexibility for various use
                cases.
              </p>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">Key Characteristics:</h4>
                <ul className="space-y-1 text-indigo-800">
                  <li>
                    • <strong>Double-ended:</strong> Operations at both front and back
                  </li>
                  <li>
                    • <strong>Efficient:</strong> O(1) time for all basic operations
                  </li>
                  <li>
                    • <strong>Versatile:</strong> Can implement stacks, queues, and more
                  </li>
                  <li>
                    • <strong>Dynamic:</strong> Size can grow and shrink as needed
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ThemeCard>

        <ThemeCard>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Core Operations</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-900 text-sm">Front Operations</h4>
                  <ul className="text-xs text-green-800 mt-1 space-y-1">
                    <li>
                      • <code>addFront()</code> - O(1)
                    </li>
                    <li>
                      • <code>removeFront()</code> - O(1)
                    </li>
                    <li>
                      • <code>peekFront()</code> - O(1)
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-900 text-sm">Back Operations</h4>
                  <ul className="text-xs text-blue-800 mt-1 space-y-1">
                    <li>
                      • <code>addBack()</code> - O(1)
                    </li>
                    <li>
                      • <code>removeBack()</code> - O(1)
                    </li>
                    <li>
                      • <code>peekBack()</code> - O(1)
                    </li>
                  </ul>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <h4 className="font-semibold text-purple-900 text-sm">Utility Operations</h4>
                <ul className="text-xs text-purple-800 mt-1 space-y-1">
                  <li>
                    • <code>size()</code> - Get current size
                  </li>
                  <li>
                    • <code>isEmpty()</code> - Check if empty
                  </li>
                  <li>
                    • <code>clear()</code> - Remove all elements
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* Implementation Comparison */}
      <ThemeCard className="mb-8">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Implementation Approaches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Array-based Deque</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-700 mb-3">
                  Uses a circular array with front and back pointers for efficient operations.
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">addFront/removeFront:</span>
                    <span className="font-mono text-green-600">O(1) amortized</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">addBack/removeBack:</span>
                    <span className="font-mono text-green-600">O(1) amortized</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Space usage:</span>
                    <span className="font-mono text-blue-600">O(n)</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Linked List Deque</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-700 mb-3">
                  Uses doubly-linked list with head and tail pointers for constant-time operations.
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">addFront/removeFront:</span>
                    <span className="font-mono text-green-600">O(1)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">addBack/removeBack:</span>
                    <span className="font-mono text-green-600">O(1)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Space usage:</span>
                    <span className="font-mono text-blue-600">O(n)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Real-World Applications */}
      <ThemeCard className="mb-8">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Real-World Applications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">Browser History</h4>
              <p className="text-sm text-indigo-800">
                Navigate forward and backward through web pages efficiently.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Undo/Redo Systems</h4>
              <p className="text-sm text-green-800">
                Implement undo and redo functionality in text editors and applications.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Task Scheduling</h4>
              <p className="text-sm text-orange-800">
                Manage tasks with different priorities at front and back.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Palindrome Checking</h4>
              <p className="text-sm text-blue-800">
                Compare characters from both ends efficiently.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Sliding Window</h4>
              <p className="text-sm text-purple-800">
                Maintain sliding windows for algorithms like maximum subarray.
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Cache Implementation</h4>
              <p className="text-sm text-yellow-800">
                Implement LRU cache with efficient front/back operations.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <NavigationCard
          title="Hash Tables"
          description="Fast key-value lookups"
          colorScheme="datastructures"
          onClick={() => (window.location.href = '/datastructures?section=Hash%20Tables')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Tree Structures"
          description="Hierarchical data organization"
          colorScheme="datastructures"
          onClick={() => (window.location.href = '/datastructures?section=Tree%20Structures')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Complexity Analysis"
          description="Big O notation and performance"
          colorScheme="datastructures"
          onClick={() => (window.location.href = '/datastructures?section=Complexity%20Analysis')}
        />
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout
        section="datastructures"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready to Explore More?"
        description="Continue your journey through data structures and algorithms"
        buttonText="View All Data Structures"
        onButtonClick={() => (window.location.href = '/datastructures?section=Introduction')}
        colorScheme="datastructures"
      />
    </>
  );
};

export default Deques;
