import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StackVisualization from '../visualizations/2d/linear/StackVisualization';
import { Layers, ArrowRight, Code } from 'lucide-react';

const Stacks: React.FC = () => {
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
          <Layers className="w-16 h-16 text-indigo-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Stacks: LIFO Data Structures</h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Stacks are fundamental data structures that follow the Last In, First Out (LIFO) principle,
        enabling efficient push and pop operations for managing data in a specific order.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
          📚 LIFO Principle
        </span>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ O(1) Operations
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔄 Reversible Actions
        </span>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          📋 Function Calls
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
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Stack Demo</h3>
          <p className="text-gray-600 mb-6">
            Watch how elements are pushed and popped following the LIFO (Last In, First Out)
            principle.
          </p>
          <StackVisualization isActive={true} className="w-full" />
        </div>
      </ThemeCard>

      {/* Key Concepts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Properties */}
        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Stack Properties</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-purple-700 mb-1">LIFO Principle</h4>
                <p className="text-sm text-gray-600">
                  Last In, First Out - the most recently added element is the first to be removed.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-blue-700 mb-1">Single Access Point</h4>
                <p className="text-sm text-gray-600">
                  Elements can only be added or removed from the top of the stack.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-green-700 mb-1">Dynamic Size</h4>
                <p className="text-sm text-gray-600">
                  Can grow and shrink dynamically based on push and pop operations.
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
              <span className="font-medium text-gray-900">Push</span>
              <span className="text-green-600 font-mono font-semibold">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="font-medium text-gray-900">Pop</span>
              <span className="text-green-600 font-mono font-semibold">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="font-medium text-gray-900">Peek/Top</span>
              <span className="text-green-600 font-mono font-semibold">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="font-medium text-gray-900">Is Empty</span>
              <span className="text-green-600 font-mono font-semibold">O(1)</span>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* Stack Operations */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Core Stack Operations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-700 mb-2">Push</h4>
            <p className="text-sm text-gray-600 mb-2">Add an element to the top of the stack.</p>
            <div className="text-xs text-purple-600 font-mono bg-white p-2 rounded">
              stack.push(element)
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-700 mb-2">Pop</h4>
            <p className="text-sm text-gray-600 mb-2">Remove and return the top element.</p>
            <div className="text-xs text-blue-600 font-mono bg-white p-2 rounded">
              element = stack.pop()
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-700 mb-2">Peek/Top</h4>
            <p className="text-sm text-gray-600 mb-2">View the top element without removing it.</p>
            <div className="text-xs text-green-600 font-mono bg-white p-2 rounded">
              element = stack.peek()
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
            <h4 className="font-semibold text-orange-700 mb-2">Is Empty</h4>
            <p className="text-sm text-gray-600 mb-2">Check if the stack contains any elements.</p>
            <div className="text-xs text-orange-600 font-mono bg-white p-2 rounded">
              bool = stack.isEmpty()
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Use Cases */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6">When to Use Stacks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Function Calls</h4>
            <p className="text-sm text-gray-600">Managing call stack in programming languages</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Undo Operations</h4>
            <p className="text-sm text-gray-600">Implementing undo/redo functionality</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Code className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Expression Parsing</h4>
            <p className="text-sm text-gray-600">Evaluating mathematical expressions</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ArrowRight className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Backtracking</h4>
            <p className="text-sm text-gray-600">Algorithms that need to reverse decisions</p>
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
          title="Linked Lists"
          description="Dynamic pointer-based data structures"
          colorScheme="datastructures"
          onClick={() => navigateToSection('linked-lists')}
        />
      </ThemeCard>

      <ThemeCard>
        <NavigationCard
          title="Queues"
          description="FIFO data structure operations"
          colorScheme="datastructures"
          onClick={() => navigateToSection('queues')}
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

export default Stacks;
