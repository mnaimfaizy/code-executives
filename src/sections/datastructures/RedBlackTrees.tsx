import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import RedBlackTreeVisualization from '../../components/models2d/datastructures/tree/RedBlackTreeVisualization';
import { TreePine, Palette, BookOpen, Zap, ArrowRight, TrendingUp } from 'lucide-react';

const RedBlackTrees: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/datastructures?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-red-100 p-4 rounded-full">
          <Palette className="w-16 h-16 text-red-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Red-Black Trees: Efficiently Balanced Binary Search Trees
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Red-Black trees are self-balancing binary search trees where each node has a color (red or
        black) and follows specific rules to maintain balance. They provide guaranteed O(log n)
        performance with fewer rotations than AVL trees, making them ideal for frequent insertions
        and deletions.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔴 Color-Based Balance
        </span>
        <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚫ Smart Properties
        </span>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          🎯 O(log n) Guaranteed
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ Fewer Rotations
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
            <div className="bg-red-100 p-3 rounded-lg">
              <Palette className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Red-Black Properties</h3>
              <p className="text-gray-700 mb-4">
                Five fundamental rules that every red-black tree must satisfy to maintain balance.
              </p>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <div className="text-lg font-bold text-red-900 mb-3 text-center">
                  Red-Black Tree Rules
                </div>
                <div className="space-y-2 text-red-800">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      1
                    </span>
                    Every node is either red or black
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      2
                    </span>
                    The root is always black
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      3
                    </span>
                    All leaves (NIL nodes) are black
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      4
                    </span>
                    Red nodes cannot have red children
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      5
                    </span>
                    All paths from node to leaves have same black depth
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>💡 Key Insight:</strong> These properties ensure the longest path is at
                  most twice as long as the shortest path.
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Red-Black Tree</h3>
              <p className="text-gray-700 mb-4">
                Explore how red-black trees maintain their properties through color changes and
                rotations.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <RedBlackTreeVisualization className="w-full" />
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Red-Black vs AVL Trees</h3>
              <p className="text-gray-700 mb-4">
                Understanding the trade-offs between these two popular balanced tree
                implementations.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-900">Aspect</th>
                      <th className="text-left p-3 font-semibold text-red-900">Red-Black Trees</th>
                      <th className="text-left p-3 font-semibold text-purple-900">AVL Trees</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b">
                      <td className="p-3 font-medium">Height Bound</td>
                      <td className="p-3">≤ 2 log(n + 1)</td>
                      <td className="p-3">≤ 1.44 log(n + 2)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Search Time</td>
                      <td className="p-3 text-yellow-600">O(log n) - slightly slower</td>
                      <td className="p-3 text-green-600">O(log n) - faster</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Insert/Delete</td>
                      <td className="p-3 text-green-600">Fewer rotations needed</td>
                      <td className="p-3 text-yellow-600">More rotations needed</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Memory</td>
                      <td className="p-3">1 bit per node (color)</td>
                      <td className="p-3">1-2 bits per node (balance factor)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Best Use Case</td>
                      <td className="p-3 text-green-600">Frequent insertions/deletions</td>
                      <td className="p-3 text-blue-600">Search-heavy applications</td>
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-World Usage</h3>
              <p className="text-gray-700 mb-4">
                Red-black trees power many critical systems and programming language
                implementations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Programming Languages</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• C++ STL (map, set, multimap)</li>
                    <li>• Java TreeMap and TreeSet</li>
                    <li>• Linux kernel's CFS scheduler</li>
                    <li>• .NET Framework collections</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">System Applications</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Database query optimization</li>
                    <li>• Memory management systems</li>
                    <li>• File system B-trees</li>
                    <li>• Network routing tables</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>🏆 Industry Standard:</strong> Red-black trees are the go-to choice for
                  general-purpose balanced trees in production systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <ArrowRight className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Implementation Strategies</h3>
              <p className="text-gray-700 mb-4">
                Key techniques for implementing efficient red-black trees.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🔄 Insertion Strategy</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Insert as red node initially</li>
                    <li>• Fix violations bottom-up</li>
                    <li>• Use color flips before rotations</li>
                    <li>• At most 2 rotations needed</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">🗑️ Deletion Strategy</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Complex when deleting black nodes</li>
                    <li>• May need to "borrow" blackness</li>
                    <li>• Up to 3 rotations required</li>
                    <li>• Sentinel nodes simplify implementation</li>
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">Related Tree Structures</h3>
        <div className="space-y-3">
          <NavigationCard
            title="AVL Trees"
            description="Height-balanced alternative"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('AVL Trees')}
            colorScheme="purple"
          />
          <NavigationCard
            title="Binary Search Trees"
            description="Foundation concepts"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('Binary Search Trees')}
            colorScheme="indigo"
          />
          <NavigationCard
            title="B-Trees"
            description="Multi-way balanced trees"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('B-Trees')}
            colorScheme="teal"
          />
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Color Properties</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="font-semibold text-red-900 mb-1">Red Nodes</div>
            <div className="text-red-700">
              • Must have black parent
              <br />
              • Can have black children
              <br />• Never two reds in a row
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-semibold text-gray-900 mb-1">Black Nodes</div>
            <div className="text-gray-700">
              • Can have any color children
              <br />
              • All paths have same black count
              <br />• Root is always black
            </div>
          </div>
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
        title="Explore More Tree Structures"
        description="Discover specialized trees designed for specific use cases like priority queues and database storage."
        buttonText="Learn About Heaps"
        onButtonClick={() => navigateToSection('Heaps')}
        colorScheme="red"
      />
    </>
  );
};

export default RedBlackTrees;
