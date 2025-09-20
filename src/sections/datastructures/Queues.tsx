import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import QueueVisualization from '../../components/models2d/datastructures/linear/QueueVisualization';
import { ArrowRight, Database, Zap, Code } from 'lucide-react';

const Queues: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/datastructures?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-indigo-100 p-4 rounded-full">
          <ArrowRight className="w-16 h-16 text-indigo-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Queues: FIFO Data Structures</h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Queues are fundamental data structures that follow the First In, First Out (FIFO) principle,
        enabling efficient enqueue and dequeue operations for managing ordered data processing.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
          📋 FIFO Principle
        </span>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ O(1) Operations
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔄 Ordered Processing
        </span>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          📊 Sequential Access
        </span>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* Interactive Visualization */}
      <ThemeCard>
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Queue Demo</h3>
          <p className="text-gray-600 mb-6">
            Watch how elements are enqueued at the rear and dequeued from the front following the
            FIFO principle.
          </p>
          <QueueVisualization isActive={true} className="w-full" />
        </div>
      </ThemeCard>

      {/* Key Concepts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Properties */}
        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Queue Properties</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-orange-700 mb-1">FIFO Principle</h4>
                <p className="text-sm text-gray-600">
                  First In, First Out - the first element added is the first to be removed.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-blue-700 mb-1">Two Access Points</h4>
                <p className="text-sm text-gray-600">
                  Elements are added at the rear and removed from the front.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-green-700 mb-1">Fair Processing</h4>
                <p className="text-sm text-gray-600">
                  Ensures fair treatment where first come, first served.
                </p>
              </div>
            </div>
          </div>
        </ThemeCard>

        {/* Time Complexity */}
        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Time Complexity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="font-medium text-gray-900">Enqueue</span>
              <span className="text-green-600 font-mono font-semibold">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="font-medium text-gray-900">Dequeue</span>
              <span className="text-green-600 font-mono font-semibold">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="font-medium text-gray-900">Front/Peek</span>
              <span className="text-green-600 font-mono font-semibold">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="font-medium text-gray-900">Is Empty</span>
              <span className="text-green-600 font-mono font-semibold">O(1)</span>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* Queue Types */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Types of Queues</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4">
            <h4 className="font-semibold text-orange-700 mb-2">Simple Queue</h4>
            <p className="text-sm text-gray-600 mb-2">
              Basic FIFO queue with rear insertion and front deletion.
            </p>
            <div className="text-xs text-orange-600 font-mono">Front → [1][2][3][4] ← Rear</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-700 mb-2">Circular Queue</h4>
            <p className="text-sm text-gray-600 mb-2">
              Uses circular array to optimize space utilization.
            </p>
            <div className="text-xs text-blue-600 font-mono">[4][1][2][3] (circular)</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-700 mb-2">Priority Queue</h4>
            <p className="text-sm text-gray-600 mb-2">
              Elements are dequeued based on priority rather than order.
            </p>
            <div className="text-xs text-purple-600 font-mono">[High][Med][Low] priorities</div>
          </div>
        </div>
      </ThemeCard>

      {/* Queue Operations */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Core Queue Operations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-orange-700 mb-2">Enqueue</h4>
            <p className="text-sm text-gray-600 mb-2">Add an element to the rear of the queue.</p>
            <div className="text-xs text-orange-600 font-mono bg-gray-50 p-2 rounded">
              queue.enqueue(element)
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-700 mb-2">Dequeue</h4>
            <p className="text-sm text-gray-600 mb-2">Remove and return the front element.</p>
            <div className="text-xs text-blue-600 font-mono bg-gray-50 p-2 rounded">
              element = queue.dequeue()
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-green-700 mb-2">Front/Peek</h4>
            <p className="text-sm text-gray-600 mb-2">
              View the front element without removing it.
            </p>
            <div className="text-xs text-green-600 font-mono bg-gray-50 p-2 rounded">
              element = queue.front()
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-700 mb-2">Is Empty</h4>
            <p className="text-sm text-gray-600 mb-2">Check if the queue contains any elements.</p>
            <div className="text-xs text-purple-600 font-mono bg-gray-50 p-2 rounded">
              bool = queue.isEmpty()
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Use Cases */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6">When to Use Queues</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Database className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Task Scheduling</h4>
            <p className="text-sm text-gray-600">Fair scheduling of jobs or processes</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Buffering</h4>
            <p className="text-sm text-gray-600">Managing data flow between components</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Code className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">BFS Algorithms</h4>
            <p className="text-sm text-gray-600">Breadth-first search implementations</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Request Handling</h4>
            <p className="text-sm text-gray-600">Processing requests in order received</p>
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
          title="Stacks"
          description="LIFO data structure operations"
          colorScheme="datastructures"
          onClick={() => navigateToSection('stacks')}
        />
      </ThemeCard>

      <ThemeCard>
        <NavigationCard
          title="Hash Tables"
          description="Key-value data structure with fast lookups"
          colorScheme="datastructures"
          onClick={() => navigateToSection('hash-tables')}
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
        title="Ready to Explore More Data Structures?"
        description="Continue your journey through fundamental data structures and algorithms."
        buttonText="Explore Tree Structures"
        onButtonClick={() => navigateToSection('tree-structures')}
        colorScheme="datastructures"
      />
    </>
  );
};

export default Queues;
