import React, { useState } from 'react';
import { ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import QueueVisualization from '../../components/models2d/datastructures/linear/QueueVisualization';
import { getSectionTheme } from '../../utils/theme';

interface QueuesProps {
  onNavigate: (section: string) => void;
}

const Queues: React.FC<QueuesProps> = ({ onNavigate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const theme = getSectionTheme('datastructures');

  return (
    <section
      className={`relative min-h-screen bg-gradient-to-br from-${theme.primary}-50 via-${theme.secondary}-50 to-${theme.accent}-50 dark:from-gray-900 dark:via-${theme.primary}-900/20 dark:to-${theme.accent}-900/20`}
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
            Queues
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Queues follow the First In, First Out (FIFO) principle, making them ideal for
            scheduling, buffering, and any scenario where fairness and order preservation matter.
          </p>
        </div>

        {/* Interactive Visualization */}
        <div
          className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-${theme.primary}-200 dark:border-${theme.primary}-800 rounded-2xl p-8 mb-12`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Interactive Queue Demo
            </h3>
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

          <div className="h-64 mb-6">
            <QueueVisualization isActive={true} />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            Watch how elements are enqueued at the rear and dequeued from the front following FIFO
            principle.
          </p>
        </div>

        {/* Key Concepts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Properties */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Queue Properties
            </h3>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
                    FIFO Principle
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    First In, First Out - the first element added is the first to be removed.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    Two Access Points
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Elements are added at the rear and removed from the front.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                    Fair Processing
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Ensures fair treatment where first come, first served.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    Buffering
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Excellent for managing data flow between different speed components.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Operations & Complexity */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Queue Operations
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Enqueue</span>
                <span className="text-green-600 dark:text-green-400 font-mono font-semibold">
                  O(1)
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Dequeue</span>
                <span className="text-green-600 dark:text-green-400 font-mono font-semibold">
                  O(1)
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Front</span>
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

            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
                Space Complexity
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                  O(n)
                </span>
                where n is the number of elements
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Optimal time complexity for all primary operations
              </p>
            </div>
          </div>
        </div>

        {/* Queue Types */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Types of Queues</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-3">
                Simple Queue
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Basic FIFO queue with rear insertion and front deletion.
              </p>
              <div className="text-xs text-orange-600 dark:text-orange-400 font-mono">
                Front → [1][2][3][4] ← Rear
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">
                Circular Queue
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Uses circular array to optimize space utilization.
              </p>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                [4][1][2][3] (circular)
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">
                Priority Queue
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Elements are dequeued based on priority rather than order.
              </p>
              <div className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                [High][Med][Low] priorities
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">
                Double-Ended Queue
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                (Deque) Insertion and deletion at both ends.
              </p>
              <div className="text-xs text-green-600 dark:text-green-400 font-mono">
                ↔ [1][2][3][4] ↔
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6">
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-3">
                Blocking Queue
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Thread-safe queue that blocks when full or empty.
              </p>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 font-mono">
                Thread1 ⇄ Queue ⇄ Thread2
              </div>
            </div>
          </div>
        </div>

        {/* Queue Operations Detail */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Core Queue Operations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-6">
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-3">Enqueue</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Add an element to the rear of the queue.
              </p>
              <div className="text-xs text-orange-600 dark:text-orange-400 font-mono bg-white dark:bg-gray-800 p-2 rounded">
                queue.enqueue(element)
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-6">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">Dequeue</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Remove and return the front element.
              </p>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-mono bg-white dark:bg-gray-800 p-2 rounded">
                element = queue.dequeue()
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-6">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">Front/Peek</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                View the front element without removing it.
              </p>
              <div className="text-xs text-green-600 dark:text-green-400 font-mono bg-white dark:bg-gray-800 p-2 rounded">
                element = queue.front()
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-6">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">
                Size/Is Empty
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Check queue size or if it's empty.
              </p>
              <div className="text-xs text-purple-600 dark:text-purple-400 font-mono bg-white dark:bg-gray-800 p-2 rounded">
                queue.isEmpty()
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            When to Use Queues
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Task Scheduling</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Fair scheduling of jobs or processes
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Buffering</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Managing data flow between components
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">BFS Algorithms</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Breadth-first search implementations
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Request Handling</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Processing requests in order received
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
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-3">
                Operating Systems
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Process scheduling</li>
                <li>• Print job queuing</li>
                <li>• I/O request handling</li>
                <li>• CPU task management</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">
                Web Applications
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Server request handling</li>
                <li>• Message queuing systems</li>
                <li>• Background job processing</li>
                <li>• Rate limiting</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">
                Real-Life Systems
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Call center systems</li>
                <li>• Ticket booking systems</li>
                <li>• Traffic light management</li>
                <li>• Customer service lines</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onNavigate('Stacks')}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Stacks</span>
          </button>

          <button
            onClick={() => onNavigate('hash-tables')}
            className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-${theme.primary}-600 to-${theme.secondary}-600 text-white rounded-lg hover:from-${theme.primary}-700 hover:to-${theme.secondary}-700 transition-all duration-200 shadow-lg hover:shadow-xl`}
          >
            <span>Hash Tables</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Queues;
