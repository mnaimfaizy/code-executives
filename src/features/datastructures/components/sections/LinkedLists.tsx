import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CTASection from '../../../../components/shared/CTASection';
import LinkedListVisualization from '../visualizations/2d/linear/LinkedListVisualization';
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
      <div className="flex justify-center mb-6 animate-bounce">
        <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-4 sm:p-6 rounded-2xl shadow-lg">
          <ArrowRight className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-600" />
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
        Linked Lists: Dynamic Data Structures
      </h1>
      <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 leading-relaxed px-4">
        Linked lists are dynamic data structures where elements are connected through pointers,
        enabling efficient insertion and deletion operations with flexible memory usage.
      </p>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-4">
        <span className="bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
          🔗 Pointer-Based
        </span>
        <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
          📈 Dynamic Size
        </span>
        <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
          💾 Memory Efficient
        </span>
        <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
          ⚡ Sequential Access
        </span>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <div className="space-y-6 sm:space-y-8">
      {/* Interactive Visualization */}
      <ThemeCard>
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg mr-3 shadow-md">
              <Code className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            Interactive Linked List Demo
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-1">
            Observe how nodes are connected through pointers, enabling dynamic insertion and
            deletion. Drag nodes to rearrange them and see the connections update in real-time!
          </p>
          <LinkedListVisualization isActive={true} className="w-full" />
        </div>
      </ThemeCard>

      {/* Key Concepts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Properties */}
        <ThemeCard>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
            Linked List Properties
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:shadow-md transition-shadow">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-green-700 mb-1 text-sm sm:text-base">Dynamic Size</h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Can grow or shrink during runtime, limited only by available memory.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-md transition-shadow">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-blue-700 mb-1 text-sm sm:text-base">Pointer-Based</h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Each node contains data and a reference to the next node.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 hover:shadow-md transition-shadow">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-purple-700 mb-1 text-sm sm:text-base">
                  Memory Efficient
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Allocates memory only when needed, no wasted space.
                </p>
              </div>
            </div>
          </div>
        </ThemeCard>

        {/* Time Complexity */}
        <ThemeCard>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
            Time Complexity
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg hover:shadow-md transition-all transform hover:scale-105">
              <span className="font-semibold text-gray-900 text-xs sm:text-base">
                Insert at Head
              </span>
              <span className="text-green-600 font-mono font-bold text-sm sm:text-base">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg hover:shadow-md transition-all transform hover:scale-105">
              <span className="font-semibold text-gray-900 text-xs sm:text-base">
                Delete at Head
              </span>
              <span className="text-green-600 font-mono font-bold text-sm sm:text-base">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg hover:shadow-md transition-all transform hover:scale-105">
              <span className="font-semibold text-gray-900 text-xs sm:text-base">Search</span>
              <span className="text-yellow-600 font-mono font-bold text-sm sm:text-base">O(n)</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg hover:shadow-md transition-all transform hover:scale-105">
              <span className="font-semibold text-gray-900 text-xs sm:text-base">
                Access by Index
              </span>
              <span className="text-yellow-600 font-mono font-bold text-sm sm:text-base">O(n)</span>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* Types of Linked Lists */}
      <ThemeCard>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
          <span className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
          Types of Linked Lists
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-3 sm:p-4 border-2 border-green-300 hover:shadow-lg transition-all transform hover:scale-105">
            <h4 className="font-bold text-green-700 mb-2 text-sm sm:text-base">
              Singly Linked List
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 mb-2">
              Each node points to the next node. Traversal is unidirectional.
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border border-green-200 text-green-700">
              Node → Node → Node → NULL
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-3 sm:p-4 border-2 border-blue-300 hover:shadow-lg transition-all transform hover:scale-105">
            <h4 className="font-bold text-blue-700 mb-2 text-sm sm:text-base">
              Doubly Linked List
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 mb-2">
              Each node has pointers to both next and previous nodes.
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border border-blue-200 text-blue-700">
              NULL ← Node ↔ Node ↔ Node → NULL
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-3 sm:p-4 border-2 border-purple-300 hover:shadow-lg transition-all transform hover:scale-105">
            <h4 className="font-bold text-purple-700 mb-2 text-sm sm:text-base">
              Circular Linked List
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 mb-2">
              Last node points back to the first node, forming a circle.
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border border-purple-200 text-purple-700">
              Node → Node → Node → (back to first)
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Use Cases */}
      <ThemeCard>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
          <span className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
          When to Use Linked Lists
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all transform hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Dynamic Size</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              When the number of elements varies significantly
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all transform hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
              Frequent Insertions
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">
              When you need to insert/delete elements frequently
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all transform hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <Code className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Memory Efficiency</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              When memory usage should be optimized
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all transform hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Unknown Size</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              When the final size is not known in advance
            </p>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  return (
    <>
      <SectionLayout section="datastructures" hero={heroContent} mainContent={mainContent} />
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
