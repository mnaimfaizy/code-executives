import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import LinkedListVisualization from '../../components/models2d/datastructures/linear/LinkedListVisualization';
import { ArrowRight, Database, Zap, Code } from 'lucide-react';

const LinkedLists: React.FC = () => {
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
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Linked Lists: Dynamic Data Structures
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Linked lists are dynamic data structures where elements are connected through pointers,
        enabling efficient insertion and deletion operations with flexible memory usage.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔗 Pointer-Based
        </span>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          📈 Dynamic Size
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          💾 Memory Efficient
        </span>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ Sequential Access
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
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Linked List Demo</h3>
          <p className="text-gray-600 mb-6">
            Observe how nodes are connected through pointers, enabling dynamic insertion and deletion.
          </p>
          <LinkedListVisualization isActive={true} className="w-full" />
        </div>
      </ThemeCard>

      {/* Key Concepts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Properties */}
        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Linked List Properties</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-green-700 mb-1">Dynamic Size</h4>
                <p className="text-sm text-gray-600">
                  Can grow or shrink during runtime, limited only by available memory.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-blue-700 mb-1">Pointer-Based</h4>
                <p className="text-sm text-gray-600">
                  Each node contains data and a reference to the next node.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-purple-700 mb-1">Memory Efficient</h4>
                <p className="text-sm text-gray-600">
                  Allocates memory only when needed, no wasted space.
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
              <span className="font-medium text-gray-900">Insert at Head</span>
              <span className="text-green-600 font-mono font-semibold">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="font-medium text-gray-900">Delete at Head</span>
              <span className="text-green-600 font-mono font-semibold">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="font-medium text-gray-900">Search</span>
              <span className="text-yellow-600 font-mono font-semibold">O(n)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="font-medium text-gray-900">Access by Index</span>
              <span className="text-yellow-600 font-mono font-semibold">O(n)</span>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* Types of Linked Lists */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Types of Linked Lists</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-700 mb-2">Singly Linked List</h4>
            <p className="text-sm text-gray-600 mb-2">
              Each node points to the next node. Traversal is unidirectional.
            </p>
            <div className="text-xs text-green-600 font-mono">Node → Node → Node → NULL</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-700 mb-2">Doubly Linked List</h4>
            <p className="text-sm text-gray-600 mb-2">
              Each node has pointers to both next and previous nodes.
            </p>
            <div className="text-xs text-blue-600 font-mono">NULL ← Node ↔ Node ↔ Node → NULL</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-700 mb-2">Circular Linked List</h4>
            <p className="text-sm text-gray-600 mb-2">
              Last node points back to the first node, forming a circle.
            </p>
            <div className="text-xs text-purple-600 font-mono">Node → Node → Node → (back to first)</div>
          </div>
        </div>
      </ThemeCard>

      {/* Use Cases */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6">When to Use Linked Lists</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Dynamic Size</h4>
            <p className="text-sm text-gray-600">
              When the number of elements varies significantly
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Frequent Insertions</h4>
            <p className="text-sm text-gray-600">
              When you need to insert/delete elements frequently
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Code className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Memory Efficiency</h4>
            <p className="text-sm text-gray-600">
              When memory usage should be optimized
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ArrowRight className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Unknown Size</h4>
            <p className="text-sm text-gray-600">
              When the final size is not known in advance
            </p>
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
          title="Arrays"
          description="Fixed-size sequential data structures"
          colorScheme="datastructures"
          onClick={() => navigateToSection('Arrays')}
        />
      </ThemeCard>

      <ThemeCard>
        <NavigationCard
          title="Stacks"
          description="LIFO data structure operations"
          colorScheme="datastructures"
          onClick={() => navigateToSection('Stacks')}
        />
      </ThemeCard>

      <ThemeCard>
        <NavigationCard
          title="Queues"
          description="FIFO data structure operations"
          colorScheme="datastructures"
          onClick={() => navigateToSection('Queues')}
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
        onButtonClick={() => navigateToSection('TreeStructures')}
        colorScheme="datastructures"
      />
    </>
  );
};

export default LinkedLists;
