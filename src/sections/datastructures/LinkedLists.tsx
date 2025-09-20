import React, { useState } from 'react';
import { ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import LinkedListVisualization from '../../components/models2d/datastructures/linear/LinkedListVisualization';
import { getSectionTheme } from '../../utils/theme';

interface LinkedListsProps {
  onNavigate: (section: string) => void;
}

const LinkedLists: React.FC<LinkedListsProps> = ({ onNavigate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const theme = getSectionTheme('datastructures');

  return (
    <section
      className={`relative min-h-screen bg-gradient-to-br from-${theme.primary}-50 via-white to-${theme.secondary}-50`}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-${theme.primary}-600 to-${theme.secondary}-600 rounded-2xl mb-6 shadow-lg`}
          >
            <ArrowRight className="w-10 h-10 text-white" />
          </div>
          <h1
            className={`text-5xl font-bold bg-gradient-to-r from-${theme.primary}-600 via-${theme.secondary}-600 to-${theme.accent}-600 bg-clip-text text-transparent mb-6`}
          >
            Linked Lists
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Linked lists are dynamic data structures where elements are connected through pointers,
            allowing efficient insertion and deletion operations with flexible memory usage.
          </p>
        </div>

        {/* Interactive Visualization - Full Width */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900">Interactive Linked List Demo</h3>
              <p className="text-gray-600 mt-2">
                Observe how nodes are connected through pointers, enabling dynamic insertion and
                deletion.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center space-x-2 px-4 py-2 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition-colors`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <LinkedListVisualization isActive={true} className="w-full" />
        </div>

        {/* Key Concepts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Properties */}
          <div className="bg-white border border-blue-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Linked List Properties</h3>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Dynamic Size</h4>
                  <p className="text-gray-600">
                    Can grow or shrink during runtime, limited only by available memory.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Pointer-Based</h4>
                  <p className="text-gray-600">
                    Each node contains data and a reference to the next node in the sequence.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-purple-700 mb-2">Memory Efficient</h4>
                  <p className="text-gray-600">
                    Allocates memory only when needed, no wasted space for unused elements.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">Sequential Access</h4>
                  <p className="text-gray-600">
                    Elements must be accessed sequentially from the head node.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Operations & Complexity */}
          <div className="bg-white border border-blue-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Time Complexity</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium text-gray-900">Insert at Head</span>
                <span className="text-green-600 font-mono font-semibold text-lg">O(1)</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium text-gray-900">Delete at Head</span>
                <span className="text-green-600 font-mono font-semibold text-lg">O(1)</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="font-medium text-gray-900">Search</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-mono font-semibold">
                  O(n)
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Access by Index</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-mono font-semibold">
                  O(n)
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                Space Complexity
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                  O(n)
                </span>
                where n is the number of nodes
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Additional space overhead for storing pointers
              </p>
            </div>
          </div>
        </div>

        {/* Types of Linked Lists */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Types of Linked Lists
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">
                Singly Linked List
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Each node points to the next node. Traversal is unidirectional.
              </p>
              <div className="text-xs text-green-600 dark:text-green-400 font-mono">
                Node → Node → Node → NULL
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">
                Doubly Linked List
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Each node has pointers to both next and previous nodes.
              </p>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                NULL ← Node ↔ Node ↔ Node → NULL
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">
                Circular Linked List
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Last node points back to the first node, forming a circle.
              </p>
              <div className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                Node → Node → Node → (back to first)
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            When to Use Linked Lists
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Dynamic Size</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                When the number of elements varies significantly
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Frequent Insertions
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                When you need to insert/delete elements frequently
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Memory Efficiency
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                When memory usage should be optimized
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Unknown Size</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                When the final size is not known in advance
              </p>
            </div>
          </div>
        </div>

        {/* Real-World Examples */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Real-World Applications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">
                Music Players
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Playlist management</li>
                <li>• Next/previous song navigation</li>
                <li>• Dynamic playlist updates</li>
                <li>• Shuffle and repeat modes</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">Web Browsers</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Browser history</li>
                <li>• Tab management</li>
                <li>• Forward/back navigation</li>
                <li>• Bookmark organization</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">
                Text Editors
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Undo/Redo operations</li>
                <li>• Text buffer management</li>
                <li>• Cursor position tracking</li>
                <li>• Dynamic text insertion</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onNavigate('Arrays')}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Arrays</span>
          </button>

          <button
            onClick={() => onNavigate('Stacks')}
            className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-${theme.primary}-600 to-${theme.secondary}-600 text-white rounded-lg hover:from-${theme.primary}-700 hover:to-${theme.secondary}-700 transition-all duration-200 shadow-lg hover:shadow-xl`}
          >
            <span>Stacks</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default LinkedLists;
