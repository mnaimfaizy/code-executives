import React from 'react';
import { List, BarChart3, ArrowRight } from 'lucide-react';
import ArrayVisualization from '../../components/models2d/datastructures/linear/ArrayVisualization';
import LinkedListVisualization from '../../components/models2d/datastructures/linear/LinkedListVisualization';
import StackVisualization from '../../components/models2d/datastructures/linear/StackVisualization';
import QueueVisualization from '../../components/models2d/datastructures/linear/QueueVisualization';

interface LinearStructuresProps {
  onNavigate: (section: string) => void;
}

const LinearStructures: React.FC<LinearStructuresProps> = ({ onNavigate }) => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <List className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Linear Data Structures
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Explore the fundamental building blocks of computer science: arrays, linked lists,
            stacks, and queues. These linear structures organize data in sequential relationships.
          </p>
        </div>

        {/* Structure Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Array Card */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-blue-200 dark:border-blue-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500 text-white">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Arrays</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Fixed-size collections with indexed access and contiguous memory allocation.
            </p>
            <div className="h-32 mb-4">
              <ArrayVisualization isActive={true} />
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Time: O(1) access • Space: O(n)
            </div>
          </div>

          {/* Linked List Card */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-green-200 dark:border-green-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500 text-white">
                <ArrowRight className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Linked Lists</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Dynamic collections connected through pointers, allowing flexible memory usage.
            </p>
            <div className="h-32 mb-4">
              <LinkedListVisualization isActive={true} />
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Time: O(n) access • Space: O(n)
            </div>
          </div>

          {/* Stack Card */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-purple-200 dark:border-purple-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500 text-white">
                <List className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Stacks</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              LIFO (Last In, First Out) structure perfect for managing function calls and undo
              operations.
            </p>
            <div className="h-32 mb-4">
              <StackVisualization isActive={true} />
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              Time: O(1) push/pop • Space: O(n)
            </div>
          </div>

          {/* Queue Card */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-orange-200 dark:border-orange-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-500 text-white">
                <ArrowRight className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Queues</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              FIFO (First In, First Out) structure ideal for scheduling and buffering systems.
            </p>
            <div className="h-32 mb-4">
              <QueueVisualization isActive={true} />
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">
              Time: O(1) enqueue/dequeue • Space: O(n)
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              When to Use Each Structure
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Arrays</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  When you need fast random access by index and the size is relatively fixed.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                  Linked Lists
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  When frequent insertions/deletions are needed and size varies significantly.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Stacks</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  For managing nested operations, recursion, and when order matters (most recent
                  first).
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Queues</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  For fair scheduling, breadth-first processing, and buffering systems.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Real-World Applications
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Arrays</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Image pixels, database records, game boards
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-1">
                  Linked Lists
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Music playlists, browser history, undo systems
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-1">Stacks</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Function calls, expression parsing, back buttons
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-1">Queues</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Print queues, CPU scheduling, web servers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onNavigate('introduction')}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Introduction</span>
          </button>

          <button
            onClick={() => onNavigate('hash-tables')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span>Hash Tables</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default LinearStructures;
