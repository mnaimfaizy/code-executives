import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import HeapVisualization from '../../components/models2d/datastructures/tree/HeapVisualization';
import { Layers, TrendingUp, BookOpen, Zap, ArrowUp, ArrowDown } from 'lucide-react';

const Heaps: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/datastructures?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-orange-100 p-4 rounded-full">
          <Layers className="w-16 h-16 text-orange-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Heaps: Priority-Based Tree Structures
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Heaps are complete binary trees that satisfy the heap property, making them perfect for
        priority queues and sorting algorithms. They provide efficient access to the maximum or
        minimum element while maintaining a compact array-based representation.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
          🏔️ Max/Min Heap
        </span>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          📊 Complete Tree
        </span>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ O(log n) Insert/Delete
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          🎯 Priority Queue
        </span>
      </div>
    </div>
  );

  // Main content
  const mainContent = (
    <>
      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Layers className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Heap Properties</h3>
              <p className="text-gray-700 mb-4">
                Understanding the fundamental characteristics that define heap data structures.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <ArrowUp className="w-5 h-5 text-red-600 mr-2" />
                    <h4 className="font-semibold text-red-900">Max Heap</h4>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Parent ≥ all children</li>
                    <li>• Root is maximum element</li>
                    <li>• Used in heap sort (descending)</li>
                    <li>• Priority queue for max priority</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <ArrowDown className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-900">Min Heap</h4>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Parent ≤ all children</li>
                    <li>• Root is minimum element</li>
                    <li>• Used in Dijkstra's algorithm</li>
                    <li>• Priority queue for min priority</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>🏗️ Complete Binary Tree:</strong> All levels filled except possibly the
                  last, which fills left to right.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Interactive Heap Visualization
              </h3>
              <p className="text-gray-700 mb-4">
                Explore heap operations and see how the heap property is maintained through heapify
                operations.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <HeapVisualization className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Heap Operations</h3>
              <p className="text-gray-700 mb-4">
                Core operations that maintain the heap property efficiently.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-900">Operation</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Time Complexity</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b">
                      <td className="p-3 font-medium">Insert</td>
                      <td className="p-3 text-green-600">O(log n)</td>
                      <td className="p-3">Add element and bubble up</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Extract Max/Min</td>
                      <td className="p-3 text-green-600">O(log n)</td>
                      <td className="p-3">Remove root and heapify down</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Peek</td>
                      <td className="p-3 text-blue-600">O(1)</td>
                      <td className="p-3">Access root without removal</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Build Heap</td>
                      <td className="p-3 text-yellow-600">O(n)</td>
                      <td className="p-3">Create heap from array</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Heapify</td>
                      <td className="p-3 text-green-600">O(log n)</td>
                      <td className="p-3">Restore heap property</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Array Implementation</h3>
              <p className="text-gray-700 mb-4">
                Heaps are efficiently implemented using arrays with simple index calculations.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Index Relationships</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-100 p-3 rounded">
                    <div className="font-bold text-blue-900">Parent</div>
                    <div className="text-blue-700 font-mono">floor((i-1)/2)</div>
                  </div>
                  <div className="bg-green-100 p-3 rounded">
                    <div className="font-bold text-green-900">Left Child</div>
                    <div className="text-green-700 font-mono">2*i + 1</div>
                  </div>
                  <div className="bg-purple-100 p-3 rounded">
                    <div className="font-bold text-purple-900">Right Child</div>
                    <div className="text-purple-700 font-mono">2*i + 2</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-orange-800 text-sm">
                  <strong>💾 Memory Efficient:</strong> No pointers needed - just a single array
                  with O(1) parent/child access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-World Applications</h3>
              <p className="text-gray-700 mb-4">
                Heaps power many fundamental algorithms and system components.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Algorithms</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Heap Sort - O(n log n) sorting</li>
                    <li>• Dijkstra's shortest path</li>
                    <li>• Prim's minimum spanning tree</li>
                    <li>• Huffman coding compression</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">System Applications</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Process scheduling (priority queues)</li>
                    <li>• Event simulation systems</li>
                    <li>• Load balancing algorithms</li>
                    <li>• Memory management (garbage collection)</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-purple-800 text-sm">
                  <strong>🎯 Priority Queues:</strong> Heaps are the standard implementation for
                  priority queues in most programming languages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Heap Variants</h3>
              <p className="text-gray-700 mb-4">
                Specialized heap implementations for different use cases and performance
                requirements.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">🔗 Binomial Heap</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• O(log n) merge operation</li>
                    <li>• Support for decrease-key</li>
                    <li>• Used in advanced algorithms</li>
                    <li>• Complex structure, better asymptotics</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-2">🌟 Fibonacci Heap</h4>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• O(1) amortized insert/decrease-key</li>
                    <li>• Best for decrease-key heavy workloads</li>
                    <li>• Used in Dijkstra's and Prim's</li>
                    <li>• Complex but theoretically optimal</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar content
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Heap Operations</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-semibold text-green-900 mb-1">Bubble Up (Insert)</div>
            <div className="text-green-700">
              Compare with parent, swap if needed, repeat until heap property restored.
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="font-semibold text-red-900 mb-1">Bubble Down (Extract)</div>
            <div className="text-red-700">
              Replace root with last element, compare with children, swap with larger/smaller child.
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Related Structures</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Binary Trees"
            description="Foundation concepts"
            icon={<Layers className="w-5 h-5" />}
            onClick={() => navigateToSection('Binary Trees')}
            colorScheme="indigo"
          />
          <NavigationCard
            title="Priority Queues"
            description="Abstract data type"
            icon={<TrendingUp className="w-5 h-5" />}
            onClick={() => navigateToSection('Queues')}
            colorScheme="purple"
          />
          <NavigationCard
            title="Binary Search Trees"
            description="Ordered tree structures"
            icon={<Layers className="w-5 h-5" />}
            onClick={() => navigateToSection('Binary Search Trees')}
            colorScheme="blue"
          />
        </div>
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
        title="Master Advanced Tree Structures"
        description="Explore B-Trees and other specialized tree structures used in databases and file systems."
        buttonText="Learn B-Trees"
        onButtonClick={() => navigateToSection('B-Trees')}
        colorScheme="orange"
      />
    </>
  );
};

export default Heaps;
