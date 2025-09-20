import React, { useState } from 'react';
import { Database, BookOpen, Clock, Code, ArrowRight } from 'lucide-react';

interface IntroductionProps {
  onNavigate: (section: string) => void;
}

const Introduction: React.FC<IntroductionProps> = ({ onNavigate }) => {
  const [activeDemo, setActiveDemo] = useState<string>('overview');

  const demos = [
    {
      id: 'overview',
      title: 'Data Structure Overview',
      description: 'Understand the fundamental concepts',
      icon: Database,
      color: 'text-blue-600',
    },
    {
      id: 'comparison',
      title: 'Performance Comparison',
      description: 'Compare time and space complexities',
      icon: Clock,
      color: 'text-green-600',
    },
    {
      id: 'usage',
      title: 'Real-World Usage',
      description: 'Practical applications in software',
      icon: Code,
      color: 'text-purple-600',
    },
    {
      id: 'timeline',
      title: 'Historical Timeline',
      description: 'Evolution of data structures',
      icon: BookOpen,
      color: 'text-orange-600',
    },
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Database className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Data Structures: The Building Blocks of Programming
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Data structures are specialized formats for organizing, processing, retrieving, and
            storing data. They form the foundation of efficient algorithms and are essential for
            solving complex computational problems.
          </p>
        </div>

        {/* Demo Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {demos.map((demo) => {
            const IconComponent = demo.icon;
            const isActive = activeDemo === demo.id;

            return (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`
                  flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                <IconComponent className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{demo.title}</div>
                  <div className="text-xs opacity-75">{demo.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Demo Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 mb-12">
          {activeDemo === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  What are Data Structures?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Data structures are systematic ways of organizing and storing data in computer
                  memory to enable efficient access and modification. They provide the blueprint for
                  how data is arranged and the operations that can be performed on it.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Organization</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        How data elements relate to each other
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Access Patterns
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Rules governing how data can be retrieved
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Operations</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Available methods for manipulating the data
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Categories of Data Structures
                </h4>
                <div className="space-y-3">
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                    <h5 className="font-medium text-blue-700 dark:text-blue-300">Linear</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Arrays, Lists, Stacks, Queues
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                    <h5 className="font-medium text-green-700 dark:text-green-300">Non-Linear</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Trees, Graphs, Hash Tables
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                    <h5 className="font-medium text-purple-700 dark:text-purple-300">Abstract</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Sets, Maps, Priority Queues
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 'comparison' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Performance Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Structure
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Access
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Search
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Insert
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400">
                        Array
                      </td>
                      <td className="py-3 px-4 text-green-600 dark:text-green-400">O(1)</td>
                      <td className="py-3 px-4 text-orange-600 dark:text-orange-400">O(n)</td>
                      <td className="py-3 px-4 text-orange-600 dark:text-orange-400">O(n)</td>
                      <td className="py-3 px-4 text-orange-600 dark:text-orange-400">O(n)</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-green-600 dark:text-green-400">
                        Linked List
                      </td>
                      <td className="py-3 px-4 text-orange-600 dark:text-orange-400">O(n)</td>
                      <td className="py-3 px-4 text-orange-600 dark:text-orange-400">O(n)</td>
                      <td className="py-3 px-4 text-green-600 dark:text-green-400">O(1)</td>
                      <td className="py-3 px-4 text-green-600 dark:text-green-400">O(1)</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-purple-600 dark:text-purple-400">
                        Hash Table
                      </td>
                      <td className="py-3 px-4 text-green-600 dark:text-green-400">O(1)</td>
                      <td className="py-3 px-4 text-green-600 dark:text-green-400">O(1)</td>
                      <td className="py-3 px-4 text-green-600 dark:text-green-400">O(1)</td>
                      <td className="py-3 px-4 text-green-600 dark:text-green-400">O(1)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-indigo-600 dark:text-indigo-400">
                        Binary Tree
                      </td>
                      <td className="py-3 px-4 text-yellow-600 dark:text-yellow-400">O(log n)</td>
                      <td className="py-3 px-4 text-yellow-600 dark:text-yellow-400">O(log n)</td>
                      <td className="py-3 px-4 text-yellow-600 dark:text-yellow-400">O(log n)</td>
                      <td className="py-3 px-4 text-yellow-600 dark:text-yellow-400">O(log n)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeDemo === 'usage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Real-World Applications
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Web Browsers
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Browser history (Stack), Page cache (Hash Table), DOM structure (Tree)
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                      Operating Systems
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Process scheduling (Queue), File system (Tree), Memory management (Heap)
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                      Databases
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Indexing (B-Trees), Caching (Hash Tables), Query optimization (Graphs)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Choose the Right Structure
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      For frequent searches
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Hash Tables, Binary Search Trees
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <h5 className="font-medium text-gray-900 dark:text-white">For ordered data</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Arrays, Linked Lists, Trees
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      For hierarchical data
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Trees, Graphs</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      For LIFO/FIFO operations
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Stacks, Queues</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 'timeline' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4">
                <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                History Timeline - Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                An interactive timeline showing the evolution of data structures from the 1950s to
                today.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-end">
          <button
            onClick={() => onNavigate('linear-structures')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span>Linear Structures</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Introduction;
