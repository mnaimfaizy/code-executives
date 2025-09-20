import React, { useState } from 'react';
import { BarChart3, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import ArrayVisualization from '../../components/models2d/datastructures/linear/ArrayVisualization';
import { getSectionTheme } from '../../utils/theme';

interface ArraysProps {
  onNavigate: (section: string) => void;
}

const Arrays: React.FC<ArraysProps> = ({ onNavigate }) => {
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
            className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-${theme.primary}-600 to-${theme.primary}-800 rounded-2xl mb-6 shadow-lg`}
          >
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1
            className={`text-5xl font-bold bg-gradient-to-r from-${theme.primary}-600 via-${theme.secondary}-700 to-${theme.accent}-800 bg-clip-text text-transparent mb-6`}
          >
            Arrays
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Arrays are the most fundamental data structure, storing elements in contiguous memory
            locations with constant-time access by index. Perfect for scenarios requiring fast
            random access.
          </p>
        </div>

        {/* Interactive Visualization */}
        <div
          className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-${theme.primary}-200 dark:border-${theme.primary}-800 rounded-2xl p-8 mb-12`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Interactive Array Demo
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
            <ArrayVisualization isActive={true} />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            Watch how array elements are stored in contiguous memory locations with fixed indexes.
          </p>
        </div>

        {/* Key Concepts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Properties */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Array Properties
            </h3>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    Contiguous Memory
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Elements are stored in consecutive memory locations, enabling efficient access
                    patterns.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                    Index-Based Access
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Direct access to any element using its index in O(1) constant time.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    Fixed Size
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Traditional arrays have a fixed size determined at creation time.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
                    Homogeneous Elements
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    All elements are typically of the same data type and size.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Operations & Complexity */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Time Complexity
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Access by Index</span>
                <span className="text-green-600 dark:text-green-400 font-mono font-semibold">
                  O(1)
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Linear Search</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-mono font-semibold">
                  O(n)
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Insertion</span>
                <span className="text-red-600 dark:text-red-400 font-mono font-semibold">O(n)</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">Deletion</span>
                <span className="text-red-600 dark:text-red-400 font-mono font-semibold">O(n)</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Space Complexity
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                  O(n)
                </span>
                where n is the number of elements
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Additional space for dynamic operations may be required
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            When to Use Arrays
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Random Access</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                When you need fast access to elements by index
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Fixed Size Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                When the number of elements is known and stable
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Mathematical Operations
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Matrix operations, vectors, and mathematical computations
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Memory Efficiency
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                When memory layout and cache performance matter
              </p>
            </div>
          </div>
        </div>

        {/* Real-World Examples */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Real-World Applications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">
                Image Processing
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Pixel data storage</li>
                <li>• Color channel arrays</li>
                <li>• Image transformations</li>
                <li>• Filter operations</li>
              </ul>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">Gaming</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Game board representation</li>
                <li>• Player inventories</li>
                <li>• Level data storage</li>
                <li>• Animation frames</li>
              </ul>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">
                Data Analysis
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Time series data</li>
                <li>• Statistical samples</li>
                <li>• Lookup tables</li>
                <li>• Frequency counters</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onNavigate('linear-structures')}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Linear Structures</span>
          </button>

          <button
            onClick={() => onNavigate('Linked Lists')}
            className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-${theme.primary}-600 to-${theme.secondary}-600 text-white rounded-lg hover:from-${theme.primary}-700 hover:to-${theme.secondary}-700 transition-all duration-200 shadow-lg hover:shadow-xl`}
          >
            <span>Linked Lists</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Arrays;
