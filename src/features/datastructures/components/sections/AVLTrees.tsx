import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import AVLTreeVisualization from '../visualizations/2d/tree/AVLTreeVisualization';
import { Scale, TreePine, RotateCcw, BookOpen, Zap, ArrowRight, TrendingUp } from 'lucide-react';

const AVLTrees: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/datastructures?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-purple-100 p-4 rounded-full">
          <Scale className="w-16 h-16 text-purple-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        AVL Trees: Self-Balancing Binary Search Trees
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        AVL trees are height-balanced binary search trees named after Adelson-Velsky and Landis.
        They automatically maintain balance through rotations, guaranteeing O(log n) performance for
        all operations even in worst-case scenarios.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚖️ Height Balanced
        </span>
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔄 Automatic Rotations
        </span>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          🎯 O(log n) Guaranteed
        </span>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          📈 Optimal for Search-Heavy
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
            <div className="bg-purple-100 p-3 rounded-lg">
              <Scale className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">AVL Balance Property</h3>
              <p className="text-gray-700 mb-4">
                The key invariant that makes AVL trees maintain their balanced structure.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-900 mb-2">AVL Balance Factor</div>
                  <div className="text-purple-800 mb-2">
                    Balance Factor = Height(Left Subtree) - Height(Right Subtree)
                  </div>
                  <div className="text-purple-700">
                    <strong>AVL Property:</strong> Balance factor must be -1, 0, or 1 for every node
                  </div>
                </div>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-purple-500" />
                  Height difference between subtrees ≤ 1
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-purple-500" />
                  Tree height is always O(log n)
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-purple-500" />
                  Maintained through rotations after insertions/deletions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <RotateCcw className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rotation Operations</h3>
              <p className="text-gray-700 mb-4">
                How AVL trees maintain balance through four types of rotations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🔄 Single Rotations</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • <strong>Left Rotation (LL):</strong> Right-heavy tree
                    </li>
                    <li>
                      • <strong>Right Rotation (RR):</strong> Left-heavy tree
                    </li>
                    <li>• Used for simple imbalances</li>
                    <li>• O(1) time complexity</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">🔄🔄 Double Rotations</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>
                      • <strong>Left-Right (LR):</strong> Left then right
                    </li>
                    <li>
                      • <strong>Right-Left (RL):</strong> Right then left
                    </li>
                    <li>• Used for zigzag imbalances</li>
                    <li>• Two single rotations = O(1)</li>
                  </ul>
                </div>
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive AVL Tree</h3>
              <p className="text-gray-700 mb-4">
                Watch how AVL trees automatically rebalance themselves through rotations.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <AVLTreeVisualization className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Performance Analysis</h3>
              <p className="text-gray-700 mb-4">
                Why AVL trees provide consistent performance across all scenarios.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Search Operations</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Always O(log n)</li>
                    <li>• Height ≤ 1.44 log(n)</li>
                    <li>• Optimal for read-heavy workloads</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">⚖️ Insert/Delete</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• O(log n) + rotation cost</li>
                    <li>• At most 2 rotations needed</li>
                    <li>• Slightly slower than BST</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">💾 Space</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• O(n) storage</li>
                    <li>• Extra balance factor storage</li>
                    <li>• Typically 1 bit per node</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">AVL vs Other Trees</h3>
              <p className="text-gray-700 mb-4">
                Understanding when to choose AVL trees over alternatives.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-900">Tree Type</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Search</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Insert</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Delete</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Best For</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b">
                      <td className="p-3 font-medium">AVL Tree</td>
                      <td className="p-3 text-green-600">O(log n)</td>
                      <td className="p-3 text-yellow-600">O(log n)</td>
                      <td className="p-3 text-yellow-600">O(log n)</td>
                      <td className="p-3">Search-heavy applications</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Red-Black</td>
                      <td className="p-3 text-green-600">O(log n)</td>
                      <td className="p-3 text-green-600">O(log n)</td>
                      <td className="p-3 text-green-600">O(log n)</td>
                      <td className="p-3">Balanced read/write operations</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Regular BST</td>
                      <td className="p-3 text-red-600">O(n)</td>
                      <td className="p-3 text-red-600">O(n)</td>
                      <td className="p-3 text-red-600">O(n)</td>
                      <td className="p-3">Simple, temporary structures</td>
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
            <div className="bg-teal-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-World Applications</h3>
              <p className="text-gray-700 mb-4">Where AVL trees excel in production systems.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Database Systems</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• In-memory database indexes</li>
                    <li>• Query optimization structures</li>
                    <li>• Range query processing</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">System Software</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• File system metadata</li>
                    <li>• Memory management structures</li>
                    <li>• Priority-based schedulers</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>💡 Best Choice When:</strong> You have more searches than
                  insertions/deletions and need guaranteed performance.
                </p>
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
            title="Binary Search Trees"
            description="The foundation of AVL trees"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('Binary Search Trees')}
            colorScheme="indigo"
          />
          <NavigationCard
            title="Red-Black Trees"
            description="Alternative balanced tree"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('Red-Black Trees')}
            colorScheme="red"
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">AVL Properties</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="font-semibold text-purple-900 mb-1">Balance Factor</div>
            <div className="text-purple-700">
              Must be -1, 0, or 1<br />
              for every node
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-semibold text-blue-900 mb-1">Height Bound</div>
            <div className="text-blue-700">Height ≤ 1.44 log(n + 2) - 1</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-semibold text-green-900 mb-1">Rotations</div>
            <div className="text-green-700">
              At most 2 per insertion
              <br />
              O(log n) per deletion
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
        title="Compare with Red-Black Trees"
        description="Explore another popular self-balancing tree with different trade-offs for insertion and deletion performance."
        buttonText="Learn Red-Black Trees"
        onButtonClick={() => navigateToSection('Red-Black Trees')}
        colorScheme="purple"
      />
    </>
  );
};

export default AVLTrees;
