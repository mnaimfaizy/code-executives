import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import CTASection from '../../../../components/shared/CTASection';
import ArrayVisualization from '../visualizations/2d/linear/ArrayVisualization';
import {
  BarChart3,
  ArrowRight,
  Zap,
  Code,
  Database,
  Clock,
  MemoryStick,
  ListOrdered,
} from 'lucide-react';

const Arrays: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/datastructures?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-full shadow-lg">
          <BarChart3 className="w-16 h-16 text-blue-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Arrays: The Foundation of Data Structures
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed max-w-3xl mx-auto">
        Arrays are the most fundamental data structure in computer science, storing elements in
        contiguous memory locations for lightning-fast access and efficient data management.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
          📊 O(1) Access
        </span>
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
          🔢 Indexed Elements
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
          💾 Contiguous Memory
        </span>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
          ⚡ Cache Friendly
        </span>
      </div>
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      {/* Interactive Visualization - Featured Section */}
      <ThemeCard>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Array Visualization</h3>
          <p className="text-gray-600 mb-6">
            Explore how arrays work with this interactive demonstration. Try different array types,
            perform operations, and see real-time animations of data manipulation.
          </p>
        </div>
        <ArrayVisualization isActive={true} className="w-full" />
      </ThemeCard>

      {/* Core Concepts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Array Properties */}
        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            Array Properties
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-blue-700 mb-1">Contiguous Memory</h4>
                <p className="text-sm text-gray-600">
                  Elements are stored in adjacent memory locations, enabling fast sequential access
                  and cache optimization.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-indigo-700 mb-1">Index-Based Access</h4>
                <p className="text-sm text-gray-600">
                  Direct access to any element using its index with constant time complexity O(1).
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-purple-700 mb-1">Fixed or Dynamic Size</h4>
                <p className="text-sm text-gray-600">
                  Static arrays have fixed size, while dynamic arrays can grow or shrink as needed.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-green-700 mb-1">Homogeneous Elements</h4>
                <p className="text-sm text-gray-600">
                  All elements are typically of the same data type, ensuring uniform memory
                  allocation.
                </p>
              </div>
            </div>
          </div>
        </ThemeCard>

        {/* Time Complexity */}
        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            Time Complexity
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="font-medium text-gray-900">Access by Index</span>
              <span className="text-green-600 font-mono font-semibold text-lg">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="font-medium text-gray-900">Update Element</span>
              <span className="text-green-600 font-mono font-semibold text-lg">O(1)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="font-medium text-gray-900">Search (Linear)</span>
              <span className="text-yellow-600 font-mono font-semibold text-lg">O(n)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <span className="font-medium text-gray-900">Insert/Delete</span>
              <span className="text-orange-600 font-mono font-semibold text-lg">O(n)</span>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 <strong>Pro Tip:</strong> For sorted arrays, binary search reduces search time to
                O(log n)!
              </p>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* Types of Arrays */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <ListOrdered className="w-5 h-5 text-purple-600" />
          </div>
          Types of Arrays
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100 hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-blue-700 mb-2 text-lg">Static Array</h4>
            <p className="text-sm text-gray-600 mb-3">
              Fixed size determined at creation. Fast and memory-efficient.
            </p>
            <div className="text-xs text-blue-600 font-mono bg-blue-100 p-2 rounded">
              int arr[5] = {'{1,2,3,4,5}'};
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100 hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-green-700 mb-2 text-lg">Dynamic Array</h4>
            <p className="text-sm text-gray-600 mb-3">
              Can grow or shrink during runtime. Flexible size management.
            </p>
            <div className="text-xs text-green-600 font-mono bg-green-100 p-2 rounded">
              vector{'<int>'} arr;
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100 hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-purple-700 mb-2 text-lg">2D Array</h4>
            <p className="text-sm text-gray-600 mb-3">
              Matrix structure with rows and columns for multi-dimensional data.
            </p>
            <div className="text-xs text-purple-600 font-mono bg-purple-100 p-2 rounded">
              int matrix[3][4];
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-5 border border-orange-100 hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-orange-700 mb-2 text-lg">Sparse Array</h4>
            <p className="text-sm text-gray-600 mb-3">
              Optimized for arrays with many default values. Saves memory.
            </p>
            <div className="text-xs text-orange-600 font-mono bg-orange-100 p-2 rounded">
              SparseArray{'<T>'}
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Common Operations */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
            <Code className="w-5 h-5 text-indigo-600" />
          </div>
          Common Array Operations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Traversal
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Visit each element sequentially from start to end.
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border border-blue-200">
              for (int i = 0; i {'<'} n; i++) {'{ /* use arr[i] */ }'}
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Insertion
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Add elements at specific positions (requires shifting).
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border border-green-200">
              arr.splice(index, 0, value);
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
              <MemoryStick className="w-4 h-4 mr-2" />
              Deletion
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Remove elements from specific positions (requires shifting).
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border border-purple-200">
              arr.splice(index, 1);
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
              <ArrowRight className="w-4 h-4 mr-2" />
              Searching
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Find elements using linear or binary search algorithms.
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border border-orange-200">
              arr.indexOf(value) // Linear O(n)
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Real-World Applications */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Real-World Applications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Image Processing</h4>
            <p className="text-sm text-gray-600">Pixel data stored as 2D arrays for manipulation</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Databases</h4>
            <p className="text-sm text-gray-600">Storing records and rows in tabular format</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Code className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Algorithms</h4>
            <p className="text-sm text-gray-600">Foundation for sorting, searching algorithms</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Gaming</h4>
            <p className="text-sm text-gray-600">Game boards, inventories, and player data</p>
          </div>
        </div>
      </ThemeCard>

      {/* Advantages vs Disadvantages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThemeCard>
          <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center">✅ Advantages</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">▪</span>
              <span className="text-gray-700">
                <strong>Fast Access:</strong> O(1) random access to any element
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">▪</span>
              <span className="text-gray-700">
                <strong>Cache Friendly:</strong> Contiguous memory improves performance
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">▪</span>
              <span className="text-gray-700">
                <strong>Simple:</strong> Easy to understand and implement
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">▪</span>
              <span className="text-gray-700">
                <strong>Efficient:</strong> Low memory overhead per element
              </span>
            </li>
          </ul>
        </ThemeCard>

        <ThemeCard>
          <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center">
            ⚠️ Disadvantages
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-1">▪</span>
              <span className="text-gray-700">
                <strong>Fixed Size:</strong> Static arrays can't change size
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-1">▪</span>
              <span className="text-gray-700">
                <strong>Expensive Insert/Delete:</strong> O(n) due to shifting
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-1">▪</span>
              <span className="text-gray-700">
                <strong>Memory Waste:</strong> Unused allocated space in static arrays
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-1">▪</span>
              <span className="text-gray-700">
                <strong>Resizing Cost:</strong> Dynamic arrays need to copy all elements
              </span>
            </li>
          </ul>
        </ThemeCard>
      </div>
    </div>
  );

  return (
    <>
      <SectionLayout section="datastructures" hero={heroContent} mainContent={mainContent} />
      <CTASection
        title="Ready to Explore More Data Structures?"
        description="Continue your journey with linked lists and discover how dynamic data structures complement arrays."
        buttonText="Next: Linked Lists"
        onButtonClick={() => navigateToSection('Linked Lists')}
        colorScheme="blue"
      />
    </>
  );
};

export default Arrays;
