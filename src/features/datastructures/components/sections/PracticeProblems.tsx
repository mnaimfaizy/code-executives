import React, { useState } from 'react';
import {
  Code,
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  Lightbulb,
  Target,
  Trophy,
  BarChart3,
  Timer,
} from 'lucide-react';

interface ProblemCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  dataStructure: string;
  timeComplexity: string;
  spaceComplexity: string;
  testCases: ProblemCase[];
  hints: string[];
  solution: string;
  solutionExplanation: string;
}

interface SubmissionResult {
  passed: boolean;
  runtime: number;
  memoryUsage: string;
  passedTests: number;
  totalTests: number;
  error?: string;
}

const PracticeProblems: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<string>('two-sum');
  const [userCode, setUserCode] = useState<string>('');

  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'hints' | 'solution'>('problem');

  // Practice problems collection
  const problems: Problem[] = [
    {
      id: 'two-sum',
      title: 'Two Sum',
      difficulty: 'Easy',
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
      dataStructure: 'Hash Table',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      testCases: [
        { input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
        { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' },
        { input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]' },
      ],
      hints: [
        'Think about what information you need to store as you iterate through the array.',
        'A hash table is a good way to maintain a mapping of values to indices.',
        'For each element, check if the complement (target - current element) exists in your hash table.',
      ],
      solution: `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}`,
      solutionExplanation: `The optimal solution uses a hash table to store elements we've seen along with their indices. As we iterate through the array, we calculate the complement of each element (target - current element) and check if it exists in our hash table. If it does, we've found our pair! This approach has O(n) time complexity and O(n) space complexity.`,
    },
    {
      id: 'valid-parentheses',
      title: 'Valid Parentheses',
      difficulty: 'Easy',
      description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Example:
Input: s = "()[]{}"
Output: true

Input: s = "([)]"
Output: false`,
      dataStructure: 'Stack',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      testCases: [
        { input: 's = "()"', expectedOutput: 'true' },
        { input: 's = "()[]{}"', expectedOutput: 'true' },
        { input: 's = "([)]"', expectedOutput: 'false' },
        { input: 's = "((("', expectedOutput: 'false' },
      ],
      hints: [
        'Think about the Last-In-First-Out (LIFO) nature of matching brackets.',
        'Use a stack to keep track of opening brackets.',
        'When you encounter a closing bracket, check if it matches the most recent opening bracket.',
      ],
      solution: `function isValid(s) {
    const stack = [];
    const pairs = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (let char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else {
            if (stack.length === 0 || stack.pop() !== pairs[char]) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
}`,
      solutionExplanation: `This problem is a classic application of the stack data structure. We use a stack to keep track of opening brackets. When we encounter a closing bracket, we check if it matches the most recently opened bracket (top of stack). The key insight is that valid parentheses follow a LIFO pattern - the most recently opened bracket should be the first to be closed.`,
    },
    {
      id: 'binary-tree-inorder',
      title: 'Binary Tree Inorder Traversal',
      difficulty: 'Medium',
      description: `Given the root of a binary tree, return the inorder traversal of its nodes' values.

Inorder traversal visits nodes in this order: Left → Root → Right

Example:
Input: root = [1,null,2,3]
Output: [1,3,2]

Follow up: Recursive solution is trivial, could you do it iteratively?`,
      dataStructure: 'Binary Tree / Stack',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h) where h is height',
      testCases: [
        { input: 'root = [1,null,2,3]', expectedOutput: '[1,3,2]' },
        { input: 'root = []', expectedOutput: '[]' },
        { input: 'root = [1]', expectedOutput: '[1]' },
      ],
      hints: [
        'Recursive approach: Process left subtree, current node, then right subtree.',
        'For iterative approach, use a stack to simulate the recursive call stack.',
        'Keep going left and pushing nodes to stack, then process and go right.',
      ],
      solution: `// Recursive approach
function inorderTraversal(root) {
    const result = [];
    
    function inorder(node) {
        if (!node) return;
        
        inorder(node.left);   // Left
        result.push(node.val); // Root
        inorder(node.right);  // Right
    }
    
    inorder(root);
    return result;
}

// Iterative approach
function inorderTraversalIterative(root) {
    const result = [];
    const stack = [];
    let current = root;
    
    while (current || stack.length > 0) {
        // Go to the leftmost node
        while (current) {
            stack.push(current);
            current = current.left;
        }
        
        // Process current node
        current = stack.pop();
        result.push(current.val);
        
        // Move to right subtree
        current = current.right;
    }
    
    return result;
}`,
      solutionExplanation: `Inorder traversal follows the pattern: Left → Root → Right. The recursive solution is straightforward - visit left subtree, process current node, then visit right subtree. The iterative solution uses a stack to simulate recursion, continuously going left while pushing nodes, then processing them and moving right.`,
    },
    {
      id: 'find-kth-largest',
      title: 'Kth Largest Element in Array',
      difficulty: 'Medium',
      description: `Given an integer array nums and an integer k, return the kth largest element in the array.

Note that it is the kth largest element in the sorted order, not the kth distinct element.

Can you solve it without sorting?

Example:
Input: nums = [3,2,1,5,6,4], k = 2
Output: 5

Input: nums = [3,2,3,1,2,4,5,5,6], k = 4
Output: 4`,
      dataStructure: 'Heap / Priority Queue',
      timeComplexity: 'O(n log k)',
      spaceComplexity: 'O(k)',
      testCases: [
        { input: 'nums = [3,2,1,5,6,4], k = 2', expectedOutput: '5' },
        { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', expectedOutput: '4' },
        { input: 'nums = [1], k = 1', expectedOutput: '1' },
      ],
      hints: [
        'Think about maintaining only k elements instead of sorting the entire array.',
        'A min heap of size k can help you track the k largest elements.',
        'When the heap size exceeds k, remove the smallest element.',
      ],
      solution: `function findKthLargest(nums, k) {
    // Using built-in sort (simple but O(n log n))
    // return nums.sort((a, b) => b - a)[k - 1];
    
    // Using min heap approach (optimal O(n log k))
    class MinHeap {
        constructor() {
            this.heap = [];
        }
        
        push(val) {
            this.heap.push(val);
            this.bubbleUp(this.heap.length - 1);
        }
        
        pop() {
            if (this.heap.length === 1) return this.heap.pop();
            const root = this.heap[0];
            this.heap[0] = this.heap.pop();
            this.bubbleDown(0);
            return root;
        }
        
        peek() {
            return this.heap[0];
        }
        
        size() {
            return this.heap.length;
        }
        
        bubbleUp(index) {
            if (index <= 0) return;
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex] > this.heap[index]) {
                [this.heap[parentIndex], this.heap[index]] = 
                [this.heap[index], this.heap[parentIndex]];
                this.bubbleUp(parentIndex);
            }
        }
        
        bubbleDown(index) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallest = index;
            
            if (leftChild < this.heap.length && 
                this.heap[leftChild] < this.heap[smallest]) {
                smallest = leftChild;
            }
            
            if (rightChild < this.heap.length && 
                this.heap[rightChild] < this.heap[smallest]) {
                smallest = rightChild;
            }
            
            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = 
                [this.heap[smallest], this.heap[index]];
                this.bubbleDown(smallest);
            }
        }
    }
    
    const minHeap = new MinHeap();
    
    for (let num of nums) {
        minHeap.push(num);
        if (minHeap.size() > k) {
            minHeap.pop();
        }
    }
    
    return minHeap.peek();
}`,
      solutionExplanation: `The optimal solution uses a min heap of size k to track the k largest elements. As we iterate through the array, we add each element to the heap. If the heap size exceeds k, we remove the smallest element (root of min heap). At the end, the root of the heap is the kth largest element. This approach has O(n log k) time complexity, which is better than sorting for small k values.`,
    },
  ];

  const getStarterCode = (problem: Problem): string => {
    switch (problem.id) {
      case 'two-sum':
        return `function twoSum(nums, target) {
    // Your code here
    
}`;
      case 'valid-parentheses':
        return `function isValid(s) {
    // Your code here
    
}`;
      case 'binary-tree-inorder':
        return `function inorderTraversal(root) {
    // Your code here
    
}`;
      case 'find-kth-largest':
        return `function findKthLargest(nums, k) {
    // Your code here
    
}`;
      default:
        return '// Your code here';
    }
  };

  // Simulate code execution
  const runCode = async () => {
    setIsRunning(true);
    const problem = problems.find((p) => p.id === selectedProblem)!;

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Simple simulation of test results
    const passedTests = Math.floor(Math.random() * problem.testCases.length) + 1;
    const runtime = Math.floor(Math.random() * 100) + 50;

    setSubmissionResult({
      passed: passedTests === problem.testCases.length,
      runtime,
      memoryUsage: `${Math.floor(Math.random() * 20) + 10} MB`,
      passedTests,
      totalTests: problem.testCases.length,
      error:
        passedTests < problem.testCases.length ? 'Runtime Error: Index out of bounds' : undefined,
    });

    setIsRunning(false);
  };

  const resetCode = () => {
    const problem = problems.find((p) => p.id === selectedProblem)!;
    setUserCode(getStarterCode(problem));
    setSubmissionResult(null);
  };

  // Initialize with first problem's starter code if empty
  if (!userCode) {
    const problem = problems.find((p) => p.id === selectedProblem);
    if (problem) {
      setUserCode(getStarterCode(problem));
    }
  }

  const selectedProblemData = problems.find((p) => p.id === selectedProblem)!;
  const difficultyColors = {
    Easy: 'text-green-600',
    Medium: 'text-yellow-600',
    Hard: 'text-red-600',
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-purple-600">
          <Target className="w-8 h-8" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Practice Problems
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Sharpen your data structure skills with curated coding challenges. Practice
          implementation, analyze complexity, and master problem-solving patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Problem List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2" />
              Problems
            </h3>

            <div className="space-y-2">
              {problems.map((problem) => (
                <button
                  key={problem.id}
                  onClick={() => {
                    setSelectedProblem(problem.id);
                    setUserCode(getStarterCode(problem));
                    setSubmissionResult(null);
                    setActiveTab('problem');
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedProblem === problem.id
                      ? 'bg-purple-50 border border-purple-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 text-sm">{problem.title}</span>
                    <span className={`text-xs font-medium ${difficultyColors[problem.difficulty]}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">{problem.dataStructure}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Problem Header */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedProblemData.title}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[selectedProblemData.difficulty]}`}
                >
                  {selectedProblemData.difficulty}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{selectedProblemData.timeComplexity}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>{selectedProblemData.spaceComplexity}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Target className="w-4 h-4" />
              <span>Data Structure: {selectedProblemData.dataStructure}</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('problem')}
                className={`px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'problem'
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Problem
              </button>
              <button
                onClick={() => setActiveTab('hints')}
                className={`px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'hints'
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <HelpCircle className="w-4 h-4 inline mr-1" />
                Hints
              </button>
              <button
                onClick={() => setActiveTab('solution')}
                className={`px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'solution'
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Lightbulb className="w-4 h-4 inline mr-1" />
                Solution
              </button>
            </div>

            <div className="p-6">
              {/* Problem Tab */}
              {activeTab === 'problem' && (
                <div className="space-y-6">
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {selectedProblemData.description}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Test Cases</h4>
                    <div className="space-y-3">
                      {selectedProblemData.testCases.map((testCase, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium text-gray-600 mb-1">Input:</div>
                              <code className="text-sm text-gray-900">{testCase.input}</code>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-600 mb-1">
                                Expected Output:
                              </div>
                              <code className="text-sm text-gray-900">
                                {testCase.expectedOutput}
                              </code>
                            </div>
                          </div>
                          {testCase.explanation && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="text-sm text-gray-600">{testCase.explanation}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Hints Tab */}
              {activeTab === 'hints' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-blue-600 mb-4">
                    <Lightbulb className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Hints to Guide Your Solution</h3>
                  </div>

                  {selectedProblemData.hints.map((hint, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                        </div>
                        <p className="text-blue-800 text-sm leading-relaxed">{hint}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Solution Tab */}
              {activeTab === 'solution' && (
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center">
                      <Trophy className="w-5 h-5 mr-2" />
                      Optimal Solution
                    </h3>
                    <p className="text-green-800 text-sm leading-relaxed">
                      {selectedProblemData.solutionExplanation}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Implementation</h4>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100">
                        <code>{selectedProblemData.solution}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Your Solution
              </h3>

              <div className="flex items-center space-x-2">
                <button
                  onClick={resetCode}
                  className="px-3 py-2 text-sm font-medium text-gray-600 
                           hover:text-gray-900 transition-colors
                           flex items-center space-x-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400
                           text-white text-sm font-medium rounded-lg transition-colors
                           flex items-center space-x-2"
                >
                  {isRunning ? (
                    <>
                      <Timer className="w-4 h-4 animate-spin" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Run Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full h-64 font-mono text-sm bg-gray-50 
                         border border-gray-200 rounded-lg p-4
                         text-gray-900 resize-none
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Write your solution here..."
              />
            </div>
          </div>

          {/* Submission Result */}
          {submissionResult && (
            <div
              className={`rounded-xl p-6 shadow-sm border ${
                submissionResult.passed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center space-x-3 mb-4">
                {submissionResult.passed ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      submissionResult.passed ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {submissionResult.passed ? 'Accepted!' : 'Runtime Error'}
                  </h3>
                  <p
                    className={`text-sm ${
                      submissionResult.passed ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {submissionResult.passedTests}/{submissionResult.totalTests} test cases passed
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Runtime</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {submissionResult.runtime}ms
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Memory Usage</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {submissionResult.memoryUsage}
                  </div>
                </div>
              </div>

              {submissionResult.error && (
                <div className="mt-4 bg-red-100 rounded-lg p-4">
                  <div className="text-sm font-medium text-red-800 mb-1">Error Details:</div>
                  <code className="text-sm text-red-700">{submissionResult.error}</code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeProblems;
