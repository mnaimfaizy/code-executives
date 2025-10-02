// src/sections/bigo/CommonComplexities.tsx
// Interactive exploration of common complexity classes with metaphors and examples

import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';

interface ComplexityMetaphor {
  name: string;
  bigO: string;
  metaphor: string;
  realWorldExample: string;
  icon: string;
  visualization: React.ReactNode;
  interactiveDemo: React.ReactNode;
}

const CommonComplexities: React.FC = () => {
  const [selectedComplexity, setSelectedComplexity] = useState<string>('O(1)');
  const [demoInput, setDemoInput] = useState<number>(10);

  const complexityMetaphors: ComplexityMetaphor[] = [
    {
      name: 'Constant Time',
      bigO: 'O(1)',
      metaphor: 'Opening a specific page in a book by page number',
      realWorldExample: 'Array access by index: arr[5]',
      icon: '📖',
      visualization: (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-6xl mb-4">📖</div>
            <div className="text-2xl font-bold text-green-600">O(1)</div>
            <div className="text-sm text-gray-600">Instant access</div>
            <div className="mt-4 bg-green-100 rounded-lg p-3">
              <div className="text-xs text-green-800">Page 42 → Open directly</div>
            </div>
          </div>
        </div>
      ),
      interactiveDemo: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-sm text-gray-600 mb-4">Array of {demoInput} books</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-mono">
                arr[{Math.min(5, demoInput - 1)}] → Instant access!
              </p>
              <p className="text-xs text-green-600 mt-2">
                Always takes the same time, regardless of array size
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: 'Logarithmic Time',
      bigO: 'O(log n)',
      metaphor: 'Finding a name in a phone book by repeatedly dividing in half',
      realWorldExample: 'Binary search in a sorted array',
      icon: '📞',
      visualization: (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-5xl mb-4">📞</div>
            <div className="text-2xl font-bold text-blue-600">O(log n)</div>
            <div className="text-sm text-gray-600">Divide and conquer</div>
            <div className="mt-4 bg-blue-100 rounded-lg p-3">
              <div className="text-xs text-blue-800">1000 pages → 10 steps</div>
            </div>
          </div>
        </div>
      ),
      interactiveDemo: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-sm text-gray-600 mb-4">Searching in {demoInput} sorted items</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-mono">
                Binary search: {Math.ceil(Math.log2(demoInput))} steps
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Each step eliminates half the remaining possibilities
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: 'Linear Time',
      bigO: 'O(n)',
      metaphor: 'Reading every page of a book from start to finish',
      realWorldExample: 'Finding the maximum value in an unsorted array',
      icon: '📖',
      visualization: (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-5xl mb-4">📖</div>
            <div className="text-2xl font-bold text-yellow-600">O(n)</div>
            <div className="text-sm text-gray-600">One pass through</div>
            <div className="mt-4 bg-yellow-100 rounded-lg p-3">
              <div className="text-xs text-yellow-800">100 pages → 100 reads</div>
            </div>
          </div>
        </div>
      ),
      interactiveDemo: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">🔄</div>
            <p className="text-sm text-gray-600 mb-4">Processing {demoInput} items</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-mono">Linear scan: {demoInput} operations</p>
              <p className="text-xs text-yellow-600 mt-2">Each item must be examined once</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: 'Linearithmic Time',
      bigO: 'O(n log n)',
      metaphor: 'Sorting a deck of cards using divide and conquer',
      realWorldExample: 'Merge sort, quick sort (average case)',
      icon: '🃏',
      visualization: (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-5xl mb-4">🃏</div>
            <div className="text-2xl font-bold text-orange-600">O(n log n)</div>
            <div className="text-sm text-gray-600">Divide & merge</div>
            <div className="mt-4 bg-orange-100 rounded-lg p-3">
              <div className="text-xs text-orange-800">100 cards → ~460 operations</div>
            </div>
          </div>
        </div>
      ),
      interactiveDemo: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">🔀</div>
            <p className="text-sm text-gray-600 mb-4">Sorting {demoInput} items</p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 font-mono">
                Merge sort: {demoInput * Math.ceil(Math.log2(demoInput))} operations
              </p>
              <p className="text-xs text-orange-600 mt-2">
                Divide into halves, sort each, then merge
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: 'Quadratic Time',
      bigO: 'O(n²)',
      metaphor: 'Checking every person at a party against every other person',
      realWorldExample: 'Bubble sort, selection sort, nested loops',
      icon: '👥',
      visualization: (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-5xl mb-4">👥</div>
            <div className="text-2xl font-bold text-red-600">O(n²)</div>
            <div className="text-sm text-gray-600">Every vs every</div>
            <div className="mt-4 bg-red-100 rounded-lg p-3">
              <div className="text-xs text-red-800">10 people → 100 comparisons</div>
            </div>
          </div>
        </div>
      ),
      interactiveDemo: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-sm text-gray-600 mb-4">Comparing {demoInput} items</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-mono">
                Nested loops: {demoInput * demoInput} operations
              </p>
              <p className="text-xs text-red-600 mt-2">Each item compared with every other item</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: 'Exponential Time',
      bigO: 'O(2^n)',
      metaphor: 'Trying every possible combination of a lock',
      realWorldExample: 'Solving the traveling salesman problem with brute force',
      icon: '🔐',
      visualization: (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-5xl mb-4">🔐</div>
            <div className="text-2xl font-bold text-purple-600">O(2^n)</div>
            <div className="text-sm text-gray-600">All combinations</div>
            <div className="mt-4 bg-purple-100 rounded-lg p-3">
              <div className="text-xs text-purple-800">10 items → 1024 subsets</div>
            </div>
          </div>
        </div>
      ),
      interactiveDemo: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">🚫</div>
            <p className="text-sm text-gray-600 mb-4">
              All subsets of {Math.min(demoInput, 20)} items
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 font-mono">
                2^{Math.min(demoInput, 20)} ={' '}
                {Math.pow(2, Math.min(demoInput, 20)).toLocaleString()} combinations
              </p>
              <p className="text-xs text-purple-600 mt-2">
                Tries every possible subset - becomes impractical quickly
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Common Complexity Classes</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Explore the most common algorithmic complexities through interactive metaphors,
          visualizations, and real-world examples.
        </p>
        <div className="flex justify-center items-center space-x-4 mb-8">
          <div className="text-center">
            <div className="text-3xl">📊</div>
            <div className="text-sm text-gray-600">6 Classes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">🎭</div>
            <div className="text-sm text-gray-600">Metaphors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">🎮</div>
            <div className="text-sm text-gray-600">Interactive</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">💡</div>
            <div className="text-sm text-gray-600">Examples</div>
          </div>
        </div>
      </div>

      <StatsGrid
        stats={[
          { label: 'Complexity Classes', value: '6', icon: '📈' },
          { label: 'Interactive Metaphors', value: '6', icon: '🎭' },
          { label: 'Real Examples', value: '15+', icon: '💡' },
          { label: 'Visual Comparisons', value: '∞', icon: '📊' },
        ]}
        colorScheme="emerald"
      />
    </div>
  );

  const renderComplexitySelector = () => (
    <ThemeCard className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
        Choose a Complexity Class
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {complexityMetaphors.map((complexity) => (
          <button
            key={complexity.bigO}
            onClick={() => setSelectedComplexity(complexity.bigO)}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedComplexity === complexity.bigO
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{complexity.icon}</div>
              <div className="font-mono font-bold text-sm">{complexity.bigO}</div>
              <div className="text-xs mt-1">{complexity.name}</div>
            </div>
          </button>
        ))}
      </div>
    </ThemeCard>
  );

  const renderInteractiveDemo = () => {
    const complexity = complexityMetaphors.find((c) => c.bigO === selectedComplexity);
    if (!complexity) return null;

    return (
      <ThemeCard className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{complexity.name}</h3>
            <div className="text-3xl font-mono font-bold text-emerald-600 mb-4">
              {complexity.bigO}
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">🤔 Metaphor</h4>
                <p className="text-blue-700">{complexity.metaphor}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">💻 Real Example</h4>
                <div className="bg-white rounded p-2 font-mono text-sm text-green-800">
                  {complexity.realWorldExample}
                </div>
              </div>
            </div>

            {/* Input Controls */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🎮 Try It Yourself</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Input Size (n): {demoInput}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={demoInput}
                    onChange={(e) => setDemoInput(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Visualization */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 text-center">Visualization</h4>
              {complexity.visualization}
            </div>

            {/* Interactive Demo */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 text-center">Interactive Demo</h4>
              {complexity.interactiveDemo}
            </div>
          </div>
        </div>
      </ThemeCard>
    );
  };

  const renderComplexityComparison = () => (
    <ThemeCard className="p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Complexity Comparison</h3>

      {/* Growth Rate Visualization */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 mb-4 text-center">
          Growth Rates (n = {demoInput})
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {complexityMetaphors.map((complexity) => {
            let operations = 0;
            switch (complexity.bigO) {
              case 'O(1)':
                operations = 1;
                break;
              case 'O(log n)':
                operations = Math.ceil(Math.log2(demoInput));
                break;
              case 'O(n)':
                operations = demoInput;
                break;
              case 'O(n log n)':
                operations = demoInput * Math.ceil(Math.log2(demoInput));
                break;
              case 'O(n²)':
                operations = demoInput * demoInput;
                break;
              case 'O(2^n)':
                operations = Math.pow(2, Math.min(demoInput, 20));
                break;
            }

            return (
              <div key={complexity.bigO} className="text-center">
                <div
                  className={`p-3 rounded-lg border-2 ${
                    selectedComplexity === complexity.bigO
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="font-mono font-bold text-sm mb-1">{complexity.bigO}</div>
                  <div className="text-lg font-bold text-gray-900">
                    {operations.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">operations</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practical Limits */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 mb-4 text-center">
          Practical Limits (1 second = ~10^8 operations)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-3 text-left font-semibold">Complexity</th>
                <th className="border border-gray-300 p-3 text-center font-semibold">
                  Max n (1 sec)
                </th>
                <th className="border border-gray-300 p-3 text-center font-semibold">
                  Max n (1 hour)
                </th>
                <th className="border border-gray-300 p-3 text-center font-semibold">
                  Feasibility
                </th>
              </tr>
            </thead>
            <tbody>
              {complexityMetaphors.map((complexity) => {
                let maxN1Sec = 0;
                let maxN1Hour = 0;
                let feasibility = '';

                switch (complexity.bigO) {
                  case 'O(1)':
                    maxN1Sec = Infinity;
                    maxN1Hour = Infinity;
                    feasibility = '✅ Always';
                    break;
                  case 'O(log n)':
                    maxN1Sec = Math.pow(2, 26);
                    maxN1Hour = Math.pow(2, 36);
                    feasibility = '✅ Excellent';
                    break;
                  case 'O(n)':
                    maxN1Sec = 1e8;
                    maxN1Hour = 3.6e9;
                    feasibility = '✅ Good';
                    break;
                  case 'O(n log n)':
                    maxN1Sec = 5e6;
                    maxN1Hour = 2e8;
                    feasibility = '✅ Good';
                    break;
                  case 'O(n²)':
                    maxN1Sec = 10000;
                    maxN1Hour = 60000;
                    feasibility = '⚠️ Careful';
                    break;
                  case 'O(2^n)':
                    maxN1Sec = 26;
                    maxN1Hour = 36;
                    feasibility = '❌ Avoid';
                    break;
                }

                return (
                  <tr key={complexity.bigO} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-mono font-semibold">
                      {complexity.bigO}
                    </td>
                    <td className="border border-gray-300 p-3 text-center font-mono">
                      {maxN1Sec === Infinity ? '∞' : maxN1Sec.toLocaleString()}
                    </td>
                    <td className="border border-gray-300 p-3 text-center font-mono">
                      {maxN1Hour === Infinity ? '∞' : maxN1Hour.toLocaleString()}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">{feasibility}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ThemeCard>
  );

  const renderAlgorithmExamples = () => (
    <div className="space-y-8">
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Algorithm Examples by Complexity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-green-600">O(1) - Constant Time</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-green-50 p-3 rounded">
                <strong>Array Access:</strong>{' '}
                <code className="bg-white px-1 rounded">arr[index]</code>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <strong>Hash Table Lookup:</strong>{' '}
                <code className="bg-white px-1 rounded">map.get(key)</code>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <strong>Stack Push/Pop:</strong>{' '}
                <code className="bg-white px-1 rounded">stack.push(item)</code>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-blue-600">O(log n) - Logarithmic Time</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-blue-50 p-3 rounded">
                <strong>Binary Search:</strong> Finding item in sorted array
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <strong>Binary Search Tree:</strong> Insert/lookup/delete operations
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <strong>Balanced BST:</strong> AVL trees, Red-Black trees
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-yellow-600">O(n) - Linear Time</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-yellow-50 p-3 rounded">
                <strong>Linear Search:</strong> Finding item in unsorted array
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <strong>Array Traversal:</strong> Sum, min, max of array
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <strong>String Operations:</strong> Length, substring search
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-orange-600">O(n log n) - Linearithmic Time</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-orange-50 p-3 rounded">
                <strong>Merge Sort:</strong> Divide and conquer sorting
              </div>
              <div className="bg-orange-50 p-3 rounded">
                <strong>Quick Sort:</strong> Average case performance
              </div>
              <div className="bg-orange-50 p-3 rounded">
                <strong>Heap Sort:</strong> Using heap data structure
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-red-600">O(n²) - Quadratic Time</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-red-50 p-3 rounded">
                <strong>Bubble Sort:</strong> Simple comparison sorting
              </div>
              <div className="bg-red-50 p-3 rounded">
                <strong>Selection Sort:</strong> Finding min repeatedly
              </div>
              <div className="bg-red-50 p-3 rounded">
                <strong>Nested Loops:</strong> Comparing all pairs
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-purple-600">O(2^n) - Exponential Time</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-purple-50 p-3 rounded">
                <strong>Subset Sum:</strong> Brute force all combinations
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <strong>TSP Brute Force:</strong> Try all possible routes
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <strong>Knapsack:</strong> 0/1 knapsack brute force
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      {/* Complexity Selector */}
      {renderComplexitySelector()}

      {/* Interactive Demo */}
      {renderInteractiveDemo()}

      {/* Complexity Comparison */}
      {renderComplexityComparison()}

      {/* Algorithm Examples */}
      {renderAlgorithmExamples()}

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemeCard>
          <NavigationCard
            title="Core Concepts"
            description="Back to Big-O, Big-Omega, Big-Theta notation and asymptotic analysis fundamentals."
            colorScheme="emerald"
            onClick={() => (window.location.href = '/bigo?section=core-concepts')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Algorithm Analysis"
            description="Learn to analyze code complexity with step-by-step examples and practice exercises."
            colorScheme="blue"
            onClick={() => console.log('Navigate to Algorithm Analysis')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Real-World Applications"
            description="See Big-O in action with sorting algorithms, data structures, and optimization examples."
            colorScheme="purple"
            onClick={() => console.log('Navigate to Real-World Applications')}
          />
        </ThemeCard>
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="space-y-6">
      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Complexity Classes</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-green-600 font-mono">O(1)</span>
            <span>Constant</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-600 font-mono">O(log n)</span>
            <span>Logarithmic</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-yellow-600 font-mono">O(n)</span>
            <span>Linear</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-orange-600 font-mono">O(n log n)</span>
            <span>Linearithmic</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-red-600 font-mono">O(n²)</span>
            <span>Quadratic</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-600 font-mono">O(2^n)</span>
            <span>Exponential</span>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Performance Scale</h3>
        <div className="space-y-2 text-sm">
          <div className="bg-green-100 p-2 rounded text-green-800">
            <div className="font-semibold">Excellent</div>
            <div className="text-xs">O(1), O(log n)</div>
          </div>
          <div className="bg-yellow-100 p-2 rounded text-yellow-800">
            <div className="font-semibold">Good</div>
            <div className="text-xs">O(n), O(n log n)</div>
          </div>
          <div className="bg-orange-100 p-2 rounded text-orange-800">
            <div className="font-semibold">Careful</div>
            <div className="text-xs">O(n²)</div>
          </div>
          <div className="bg-red-100 p-2 rounded text-red-800">
            <div className="font-semibold">Problematic</div>
            <div className="text-xs">O(2^n), O(n!)</div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Key Insights</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            🎯 <strong>Constants matter:</strong> O(100n) is still O(n)
          </p>
          <p>
            📈 <strong>Growth dominates:</strong> Focus on largest term
          </p>
          <p>
            ⚡ <strong>Logarithms are fast:</strong> O(log n) scales incredibly well
          </p>
          <p>
            🚫 <strong>Exponentials are bad:</strong> O(2^n) becomes unusable quickly
          </p>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Common Patterns</h3>
        <div className="space-y-2 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-mono text-emerald-600 text-xs">Single loop</div>
            <div className="text-xs text-gray-600">Usually O(n)</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-mono text-blue-600 text-xs">Divide & conquer</div>
            <div className="text-xs text-gray-600">Often O(n log n)</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-mono text-red-600 text-xs">Nested loops</div>
            <div className="text-xs text-gray-600">Typically O(n²)</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-mono text-purple-600 text-xs">All combinations</div>
            <div className="text-xs text-gray-600">Usually O(2^n)</div>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  return (
    <>
      <SectionLayout
        section="bigo"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready to Analyze Algorithms?"
        description="Learn systematic methods to analyze code complexity with step-by-step examples and practice exercises."
        buttonText="Start Algorithm Analysis"
        onButtonClick={() => console.log('Navigate to Algorithm Analysis')}
        colorScheme="emerald"
      />
    </>
  );
};

export default CommonComplexities;
