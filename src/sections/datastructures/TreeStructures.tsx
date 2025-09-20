import React, { useState } from 'react';
import { ArrowRight, TreePine, TrendingUp, BarChart3, Zap } from 'lucide-react';
import BinaryTreeVisualization from '../../components/models2d/datastructures/tree/BinaryTreeVisualization';
import BinarySearchTreeVisualization from '../../components/models2d/datastructures/tree/BinarySearchTreeVisualization';
import AVLTreeVisualization from '../../components/models2d/datastructures/tree/AVLTreeVisualization';
import RedBlackTreeVisualization from '../../components/models2d/datastructures/tree/RedBlackTreeVisualization';
import HeapVisualization from '../../components/models2d/datastructures/tree/HeapVisualization';
import BTreeVisualization from '../../components/models2d/datastructures/tree/BTreeVisualization';
import ComplexityIndicator from '../../components/models2d/datastructures/shared/ComplexityIndicator';

const TreeStructures: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'binary' | 'bst' | 'avl' | 'rb' | 'heap' | 'btree'>('binary');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
          <TreePine className="w-8 h-8" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Tree Structures
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Hierarchical data structures that organize data in a tree-like format with parent-child relationships.
          Perfect for representing hierarchical data and enabling efficient search operations.
        </p>
      </div>

      {/* Introduction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <TreePine className="w-6 h-6 mr-2 text-green-600" />
              What are Tree Structures?
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Trees are hierarchical data structures consisting of nodes connected by edges. 
                Each tree has a single root node and every other node has exactly one parent.
              </p>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Key Terminology:</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <strong>Root:</strong> The top node with no parent
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <strong>Leaf:</strong> A node with no children
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    <strong>Height:</strong> Maximum depth from root to leaf
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    <strong>Subtree:</strong> A tree formed by a node and its descendants
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Why Use Trees?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                <span><strong>Hierarchical representation:</strong> Natural for file systems, org charts</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                <span><strong>Efficient searching:</strong> O(log n) in balanced trees</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-purple-600 flex-shrink-0" />
                <span><strong>Dynamic size:</strong> Can grow and shrink as needed</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-orange-600 flex-shrink-0" />
                <span><strong>Ordered data:</strong> Binary search trees maintain sorted order</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {/* Tree Type Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Interactive Tree Demos
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActiveDemo('binary')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeDemo === 'binary'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Binary
              </button>
              <button
                onClick={() => setActiveDemo('bst')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeDemo === 'bst'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                BST
              </button>
              <button
                onClick={() => setActiveDemo('avl')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeDemo === 'avl'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                AVL
              </button>
              <button
                onClick={() => setActiveDemo('rb')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeDemo === 'rb'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Red-Black
              </button>
              <button
                onClick={() => setActiveDemo('heap')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeDemo === 'heap'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Heap
              </button>
              <button
                onClick={() => setActiveDemo('btree')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeDemo === 'btree'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                B-Tree
              </button>
            </div>

            {/* Active Demo */}
            <div className="min-h-[400px]">
              {activeDemo === 'binary' && (
                <BinaryTreeVisualization 
                  maxNodes={15}
                  onOperationComplete={(op) => console.log('Tree operation:', op)}
                />
              )}
              {activeDemo === 'bst' && (
                <BinarySearchTreeVisualization 
                  maxNodes={15}
                  onOperationComplete={(op) => console.log('BST operation:', op)}
                />
              )}
              {activeDemo === 'avl' && (
                <AVLTreeVisualization />
              )}
              {activeDemo === 'rb' && (
                <RedBlackTreeVisualization />
              )}
              {activeDemo === 'heap' && (
                <HeapVisualization />
              )}
              {activeDemo === 'btree' && (
                <BTreeVisualization degree={3} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tree Types Comparison */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Types of Trees
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Binary Tree */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                <TreePine className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Binary Tree</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Each node has at most 2 children</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Properties:</span>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Left and right child nodes</li>
                <li>• No ordering requirement</li>
                <li>• Used in expression parsing</li>
                <li>• Foundation for other tree types</li>
              </ul>
              
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <ComplexityIndicator
                  timeComplexity="O(n)"
                  spaceComplexity="O(h)"
                  operation="Search"
                  explanation="Search time depends on tree balance. Height h can range from log n (balanced) to n (skewed)."
                  bestCase="O(log n)"
                  averageCase="O(n)"
                  worstCase="O(n)"
                />
              </div>
            </div>
          </div>

          {/* Binary Search Tree */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Binary Search Tree</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ordered binary tree for fast searching</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Properties:</span>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Left subtree &lt; Node &lt; Right subtree</li>
                <li>• Enables binary search</li>
                <li>• In-order traversal gives sorted data</li>
                <li>• Used in databases and indexes</li>
              </ul>
              
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <ComplexityIndicator
                  timeComplexity="O(log n)"
                  spaceComplexity="O(h)"
                  operation="Search/Insert/Delete"
                  explanation="BST operations are efficient when tree is balanced. Degenerate cases can lead to O(n) performance."
                  bestCase="O(log n)"
                  averageCase="O(log n)"
                  worstCase="O(n)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tree Traversals */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-2 text-purple-600" />
          Tree Traversal Methods
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pre-order</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Root → Left → Right</p>
            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
              visit(root)<br/>
              preorder(left)<br/>
              preorder(right)
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Used for: Tree copying, expression parsing
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">In-order</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Left → Root → Right</p>
            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
              inorder(left)<br/>
              visit(root)<br/>
              inorder(right)
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Used for: BST sorted output
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Post-order</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Left → Right → Root</p>
            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
              postorder(left)<br/>
              postorder(right)<br/>
              visit(root)
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Used for: Tree deletion, expression evaluation
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases and Applications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Real-World Applications
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TreePine className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">File Systems</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Directory structures where folders contain subfolders and files, 
              representing hierarchical file organization.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Database Indexes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              B-trees and B+ trees used in database systems for efficient 
              data retrieval and range queries.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Expression Parsing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Abstract syntax trees (AST) used in compilers and calculators 
              to represent and evaluate mathematical expressions.
            </p>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Performance Considerations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tree Balance Matters
            </h3>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span><strong>Balanced Tree:</strong> Height ≈ log n, optimal performance</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span><strong>Slightly Unbalanced:</strong> Still good performance</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span><strong>Highly Unbalanced:</strong> Degrades to linear search</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              When to Use Trees
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Need hierarchical data representation</span>
              </div>
              <div className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Frequent search operations required</span>
              </div>
              <div className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-purple-600 flex-shrink-0" />
                <span>Data needs to be kept in sorted order</span>
              </div>
              <div className="flex items-start">
                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-orange-600 flex-shrink-0" />
                <span>Dynamic insertions and deletions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeStructures;