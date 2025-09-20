import React, { useState } from 'react';
import { Layers, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import StackVisualization from '../../components/models2d/datastructures/linear/StackVisualization';

interface StacksProps {
  onNavigate: (section: string) => void;
}

const Stacks: React.FC<StacksProps> = ({ onNavigate }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/20">
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl mb-6 shadow-lg">
            <Layers className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Stacks
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Stacks follow the Last In, First Out (LIFO) principle, making them perfect for managing
            function calls, undo operations, and any scenario where order matters.
          </p>
        </div>

        {/* Interactive Visualization */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-200 dark:border-purple-800 rounded-2xl p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Interactive Stack Demo
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

          <div className="h-64 mb-6">
            <StackVisualization isActive={true} />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            Watch how elements are pushed and popped following the LIFO (Last In, First Out)
            principle.
          </p>
        </div>

        {/* Key Concepts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Properties */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Stack Properties
            </h3>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    LIFO Principle
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Last In, First Out - the most recently added element is the first to be removed.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    Single Access Point
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Elements can only be added or removed from the top of the stack.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                    Dynamic Size
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Can grow and shrink dynamically based on push and pop operations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
                    Memory Efficient
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Only uses memory for elements currently in the stack.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Operations & Complexity */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Stack Operations
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Push</span>
                <span className="text-green-600 dark:text-green-400 font-mono font-semibold">
                  O(1)
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Pop</span>
                <span className="text-green-600 dark:text-green-400 font-mono font-semibold">
                  O(1)
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Peek/Top</span>
                <span className="text-green-600 dark:text-green-400 font-mono font-semibold">
                  O(1)
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Is Empty</span>
                <span className="text-green-600 dark:text-green-400 font-mono font-semibold">
                  O(1)
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                Space Complexity
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                  O(n)
                </span>
                where n is the number of elements
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Excellent time complexity for all primary operations
              </p>
            </div>
          </div>
        </div>

        {/* Stack Operations Detail */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Core Stack Operations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">Push</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Add an element to the top of the stack.
              </p>
              <div className="text-xs text-purple-600 dark:text-purple-400 font-mono bg-white dark:bg-gray-800 p-2 rounded">
                stack.push(element)
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">Pop</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Remove and return the top element.
              </p>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-mono bg-white dark:bg-gray-800 p-2 rounded">
                element = stack.pop()
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">Peek/Top</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                View the top element without removing it.
              </p>
              <div className="text-xs text-green-600 dark:text-green-400 font-mono bg-white dark:bg-gray-800 p-2 rounded">
                element = stack.peek()
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-3">Is Empty</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Check if the stack contains any elements.
              </p>
              <div className="text-xs text-orange-600 dark:text-orange-400 font-mono bg-white dark:bg-gray-800 p-2 rounded">
                bool = stack.isEmpty()
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            When to Use Stacks
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Function Calls</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Managing call stack in programming languages
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Undo Operations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Implementing undo/redo functionality
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Layers className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Expression Parsing
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Evaluating mathematical expressions
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Layers className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Backtracking</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Algorithms that need to reverse decisions
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
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">
                Programming Languages
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Function call management</li>
                <li>• Local variable storage</li>
                <li>• Recursion handling</li>
                <li>• Exception handling</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">Web Browsers</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Back button functionality</li>
                <li>• JavaScript call stack</li>
                <li>• Browser history</li>
                <li>• Page state management</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">
                Text Editors
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Undo/Redo operations</li>
                <li>• Bracket matching</li>
                <li>• Syntax checking</li>
                <li>• Auto-completion</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onNavigate('Linked Lists')}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Linked Lists</span>
          </button>

          <button
            onClick={() => onNavigate('Queues')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg hover:from-purple-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span>Queues</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Stacks;
