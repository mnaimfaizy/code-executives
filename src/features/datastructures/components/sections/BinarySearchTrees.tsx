import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import BinarySearchTreeVisualization from '../visualizations/2d/tree/BinarySearchTreeVisualization';
import { Search, TreePine, Code, BookOpen, Zap, ArrowRight, TrendingUp } from 'lucide-react';

const BinarySearchTrees: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/datastructures?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-indigo-100 p-4 rounded-full">
          <Search className="w-16 h-16 text-indigo-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Binary Search Trees: Ordered Hierarchical Data
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Binary Search Trees (BSTs) are binary trees with a special ordering property: for every
        node, all values in the left subtree are smaller, and all values in the right subtree are
        larger. This ordering enables efficient searching, insertion, and deletion operations.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔍 O(log n) Search
        </span>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          📊 Ordered Structure
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ Dynamic Operations
        </span>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          🎯 Inorder Traversal = Sorted
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
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Search className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">BST Ordering Property</h3>
              <p className="text-gray-700 mb-4">
                The fundamental rule that makes binary search trees so powerful for searching
                operations.
              </p>
              <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-900 mb-2">BST Property</div>
                  <div className="text-indigo-800">
                    For any node <code className="bg-indigo-200 px-2 py-1 rounded">N</code>:
                  </div>
                  <div className="text-indigo-700 mt-2">
                    <strong>Left subtree values</strong> &lt;{' '}
                    <code className="bg-indigo-200 px-2 py-1 rounded">N.value</code> &lt;{' '}
                    <strong>Right subtree values</strong>
                  </div>
                </div>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-indigo-500" />
                  Enables binary search algorithm on trees
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-indigo-500" />
                  Inorder traversal gives sorted sequence
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-indigo-500" />
                  Efficient range queries and predecessor/successor finding
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Code className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Core Operations</h3>
              <p className="text-gray-700 mb-4">
                Understanding how search, insertion, and deletion work in BSTs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">🔍 Search</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Compare with current node</li>
                    <li>• Go left if smaller</li>
                    <li>• Go right if larger</li>
                    <li>• O(log n) average time</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">➕ Insert</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Find correct position</li>
                    <li>• Maintain BST property</li>
                    <li>• Add as leaf node</li>
                    <li>• O(log n) average time</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">🗑️ Delete</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Case 1: Leaf node</li>
                    <li>• Case 2: One child</li>
                    <li>• Case 3: Two children</li>
                    <li>• O(log n) average time</li>
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Interactive BST Visualization
              </h3>
              <p className="text-gray-700 mb-4">
                Practice BST operations and see how the ordering property is maintained.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <BinarySearchTreeVisualization
                  maxNodes={15}
                  onOperationComplete={(op) => console.log('BST operation:', op)}
                  className="w-full"
                />
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Performance Considerations</h3>
              <p className="text-gray-700 mb-4">
                Understanding when BSTs perform well and their limitations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">
                    ✅ Best Case - Balanced Tree
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Height ≈ log(n)</li>
                    <li>• Search: O(log n)</li>
                    <li>• Insert: O(log n)</li>
                    <li>• Delete: O(log n)</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">❌ Worst Case - Skewed Tree</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Height = n (linear)</li>
                    <li>• Search: O(n)</li>
                    <li>• Insert: O(n)</li>
                    <li>• Delete: O(n)</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>💡 Pro Tip:</strong> For guaranteed O(log n) performance, use
                  self-balancing trees like AVL or Red-Black trees!
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-World Applications</h3>
              <p className="text-gray-700 mb-4">
                Where BSTs shine in practical software development.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Database Systems</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Database indexing structures</li>
                    <li>• B-tree variants in SQL databases</li>
                    <li>• Range query optimization</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Programming Languages</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Symbol tables in compilers</li>
                    <li>• Standard library implementations</li>
                    <li>• Priority queue variants</li>
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
            title="Binary Trees"
            description="Learn the foundation concepts"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('Binary Trees')}
            colorScheme="blue"
          />
          <NavigationCard
            title="AVL Trees"
            description="Self-balancing BSTs"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('AVL Trees')}
            colorScheme="purple"
          />
          <NavigationCard
            title="Red-Black Trees"
            description="Another balanced BST variant"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('Red-Black Trees')}
            colorScheme="red"
          />
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-semibold text-green-900 mb-1">Average Case</div>
            <div className="text-green-700">
              Search: O(log n)
              <br />
              Insert: O(log n)
              <br />
              Delete: O(log n)
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="font-semibold text-red-900 mb-1">Worst Case</div>
            <div className="text-red-700">All operations: O(n)</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-semibold text-blue-900 mb-1">Space</div>
            <div className="text-blue-700">O(n) storage</div>
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
        title="Ready for Guaranteed Performance?"
        description="Explore self-balancing trees that maintain O(log n) performance even in worst-case scenarios."
        buttonText="Learn AVL Trees"
        onButtonClick={() => navigateToSection('AVL Trees')}
        colorScheme="indigo"
      />
    </>
  );
};

export default BinarySearchTrees;
