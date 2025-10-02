import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import BinaryTreeVisualization from '../visualizations/2d/tree/BinaryTreeVisualization';
import { TreePine, Code, BookOpen, Zap, ArrowRight } from 'lucide-react';

const BinaryTrees: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/datastructures?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-blue-100 p-4 rounded-full">
          <TreePine className="w-16 h-16 text-blue-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Binary Trees: The Foundation of Hierarchical Data
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Binary trees are fundamental hierarchical data structures where each node has at most two
        children, referred to as the left and right child. They form the basis for many advanced
        tree structures and are essential for understanding computer science algorithms.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          🌳 Hierarchical Structure
        </span>
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
          📊 O(log n) Average
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔗 Parent-Child Links
        </span>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ Efficient Traversal
        </span>
      </div>
    </div>
  );

  // Main content with information and examples
  const mainContent = (
    <>
      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <TreePine className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Binary Tree Properties</h3>
              <p className="text-gray-700 mb-4">
                Understanding the fundamental characteristics that define binary trees and their
                behavior.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-blue-500" />
                  Each node has at most two children (left and right)
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-blue-500" />
                  One designated root node with no parent
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-blue-500" />
                  Leaf nodes have no children
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-blue-500" />
                  Height is the longest path from root to leaf
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
              <Code className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tree Traversal Methods</h3>
              <p className="text-gray-700 mb-4">
                Different ways to visit nodes in a binary tree, each serving specific purposes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Depth-First Traversals</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • <strong>Preorder:</strong> Root → Left → Right
                    </li>
                    <li>
                      • <strong>Inorder:</strong> Left → Root → Right
                    </li>
                    <li>
                      • <strong>Postorder:</strong> Left → Right → Root
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Breadth-First Traversal</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • <strong>Level Order:</strong> Visit level by level
                    </li>
                    <li>• Uses queue for implementation</li>
                    <li>• Good for finding shortest paths</li>
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Binary Tree</h3>
              <p className="text-gray-700 mb-4">
                Explore binary tree operations with this interactive visualization.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <BinaryTreeVisualization
                  maxNodes={15}
                  onOperationComplete={(op) => console.log('Binary tree operation:', op)}
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
            <div className="bg-purple-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Common Applications</h3>
              <p className="text-gray-700 mb-4">
                Real-world uses of binary trees in software development and computer science.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Data Processing</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Expression parsing and evaluation</li>
                    <li>• Syntax trees in compilers</li>
                    <li>• Decision trees in AI/ML</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">System Design</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• File system hierarchies</li>
                    <li>• Huffman coding for compression</li>
                    <li>• Binary heaps for priority queues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar with navigation to other tree types
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Explore Tree Structures</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Binary Search Trees"
            description="Ordered binary trees for efficient searching"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('Binary Search Trees')}
            colorScheme="indigo"
          />
          <NavigationCard
            title="AVL Trees"
            description="Self-balancing binary search trees"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('AVL Trees')}
            colorScheme="purple"
          />
          <NavigationCard
            title="Red-Black Trees"
            description="Balanced trees with color properties"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('Red-Black Trees')}
            colorScheme="red"
          />
          <NavigationCard
            title="Heaps"
            description="Complete binary trees for priority queues"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('Heaps')}
            colorScheme="orange"
          />
          <NavigationCard
            title="B-Trees"
            description="Multi-way trees for databases"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('B-Trees')}
            colorScheme="teal"
          />
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Reference</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-semibold text-blue-900 mb-1">Time Complexity</div>
            <div className="text-blue-700">
              Search: O(n)
              <br />
              Insert: O(n)
              <br />
              Delete: O(n)
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-semibold text-green-900 mb-1">Space Complexity</div>
            <div className="text-green-700">O(n) for storage</div>
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
        title="Ready to Master Advanced Trees?"
        description="Build on your binary tree knowledge with specialized tree structures designed for specific use cases."
        buttonText="Explore Binary Search Trees"
        onButtonClick={() => navigateToSection('Binary Search Trees')}
        colorScheme="blue"
      />
    </>
  );
};

export default BinaryTrees;
