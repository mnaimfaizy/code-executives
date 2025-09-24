// src/sections/bigo/CoreConcepts.tsx
// Core concepts of Big-O notation and asymptotic analysis

import React, { useState } from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import StatsGrid from '../../components/shared/StatsGrid';
import CTASection from '../../components/shared/CTASection';

interface ComplexityExample {
  name: string;
  bigO: string;
  description: string;
  example: string;
  visualization: React.ReactNode;
}

const CoreConcepts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notation' | 'analysis' | 'examples'>('notation');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('O(n)');

  const complexityExamples: ComplexityExample[] = [
    {
      name: 'Constant Time',
      bigO: 'O(1)',
      description: 'Operations that take the same amount of time regardless of input size',
      example: 'Accessing an array element by index: arr[5]',
      visualization: (
        <div className="flex items-center justify-center h-32">
          <div className="text-6xl">⚡</div>
          <div className="ml-4 text-center">
            <div className="text-2xl font-bold text-green-600">O(1)</div>
            <div className="text-sm text-gray-600">Always constant</div>
          </div>
        </div>
      ),
    },
    {
      name: 'Logarithmic Time',
      bigO: 'O(log n)',
      description: 'Operations that divide the problem size in half each time',
      example: 'Binary search in a sorted array',
      visualization: (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <div className="text-2xl font-bold text-blue-600">O(log n)</div>
            <div className="text-sm text-gray-600">Grows slowly</div>
          </div>
        </div>
      ),
    },
    {
      name: 'Linear Time',
      bigO: 'O(n)',
      description: 'Operations that process each element once',
      example: 'Finding the maximum value in an unsorted array',
      visualization: (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-2xl font-bold text-yellow-600">O(n)</div>
            <div className="text-sm text-gray-600">Directly proportional</div>
          </div>
        </div>
      ),
    },
    {
      name: 'Linearithmic Time',
      bigO: 'O(n log n)',
      description: 'Operations that divide and conquer, then combine results',
      example: 'Merge sort, quick sort (average case)',
      visualization: (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-4xl mb-2">🔀</div>
            <div className="text-2xl font-bold text-orange-600">O(n log n)</div>
            <div className="text-sm text-gray-600">Divide and conquer</div>
          </div>
        </div>
      ),
    },
    {
      name: 'Quadratic Time',
      bigO: 'O(n²)',
      description: 'Operations that compare every element with every other element',
      example: 'Bubble sort, selection sort, nested loops',
      visualization: (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-4xl mb-2">📈📈</div>
            <div className="text-2xl font-bold text-red-600">O(n²)</div>
            <div className="text-sm text-gray-600">Grows quickly</div>
          </div>
        </div>
      ),
    },
    {
      name: 'Exponential Time',
      bigO: 'O(2^n)',
      description: 'Operations that try all possible combinations',
      example: 'Solving the traveling salesman problem with brute force',
      visualization: (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-4xl mb-2">🚀</div>
            <div className="text-2xl font-bold text-purple-600">O(2^n)</div>
            <div className="text-sm text-gray-600">Explosive growth</div>
          </div>
        </div>
      ),
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Big-O Notation: Core Concepts</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Master the fundamental language of algorithmic complexity analysis. Learn Big-O,
          Big-Omega, Big-Theta, and how to analyze algorithm performance.
        </p>
        <div className="flex justify-center items-center space-x-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">O()</div>
            <div className="text-sm text-gray-600">Big-O</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">Ω()</div>
            <div className="text-sm text-gray-600">Big-Omega</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">Θ()</div>
            <div className="text-sm text-gray-600">Big-Theta</div>
          </div>
        </div>
      </div>

      <StatsGrid
        stats={[
          { label: 'Complexity Classes', value: '6+', icon: '📊' },
          { label: 'Analysis Methods', value: '3', icon: '🔍' },
          { label: 'Real Examples', value: '15+', icon: '💡' },
          { label: 'Interactive Tools', value: '5', icon: '🎮' },
        ]}
        colorScheme="emerald"
      />
    </div>
  );

  const renderNotationTab = () => (
    <div className="space-y-8">
      {/* Big-O Notation */}
      <ThemeCard className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-4xl mr-3">O</span>
              Big-O Notation (Upper Bound)
            </h3>
            <p className="text-gray-700 mb-4">
              Big-O notation describes the <strong>worst-case</strong> asymptotic behavior of a
              function. It provides an upper bound on the growth rate of an algorithm's running time
              or space usage.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-emerald-800 mb-2">Mathematical Definition:</h4>
              <p className="text-emerald-700 font-mono text-sm">
                f(n) = O(g(n)) means there exist constants c &gt; 0 and n₀ ≥ 0 such that
                <br />0 ≤ f(n) ≤ c × g(n) for all n ≥ n₀
              </p>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                🔹 <strong>Asymptotic upper bound</strong>
              </p>
              <p>
                🔹 <strong>Worst-case analysis</strong>
              </p>
              <p>
                🔹 <strong>Most commonly used</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4">📈</div>
              <div className="text-lg font-semibold text-gray-700">Upper Bound</div>
              <div className="text-sm text-gray-500">Never exceeds this growth rate</div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Big-Omega Notation */}
      <ThemeCard className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-4xl mr-3">Ω</span>
              Big-Omega Notation (Lower Bound)
            </h3>
            <p className="text-gray-700 mb-4">
              Big-Omega notation describes the <strong>best-case</strong> asymptotic behavior of a
              function. It provides a lower bound on the growth rate of an algorithm's running time
              or space usage.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Mathematical Definition:</h4>
              <p className="text-blue-700 font-mono text-sm">
                f(n) = Ω(g(n)) means there exist constants c &gt; 0 and n₀ ≥ 0 such that
                <br />0 ≤ c × g(n) ≤ f(n) for all n ≥ n₀
              </p>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                🔹 <strong>Asymptotic lower bound</strong>
              </p>
              <p>
                🔹 <strong>Best-case analysis</strong>
              </p>
              <p>
                🔹 <strong>Less commonly used</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4">📉</div>
              <div className="text-lg font-semibold text-gray-700">Lower Bound</div>
              <div className="text-sm text-gray-500">Never goes below this growth rate</div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Big-Theta Notation */}
      <ThemeCard className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-4xl mr-3">Θ</span>
              Big-Theta Notation (Tight Bound)
            </h3>
            <p className="text-gray-700 mb-4">
              Big-Theta notation describes the <strong>exact</strong> asymptotic behavior of a
              function. It provides both upper and lower bounds, giving a tight bound on growth
              rate.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-purple-800 mb-2">Mathematical Definition:</h4>
              <p className="text-purple-700 font-mono text-sm">
                f(n) = Θ(g(n)) means there exist constants c₁, c₂ &gt; 0 and n₀ ≥ 0 such that
                <br />0 ≤ c₁ × g(n) ≤ f(n) ≤ c₂ × g(n) for all n ≥ n₀
              </p>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                🔹 <strong>Asymptotic tight bound</strong>
              </p>
              <p>
                🔹 <strong>Exact growth rate</strong>
              </p>
              <p>
                🔹 <strong>Most precise notation</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4">🎯</div>
              <div className="text-lg font-semibold text-gray-700">Tight Bound</div>
              <div className="text-sm text-gray-500">Exact asymptotic behavior</div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Notation Relationships */}
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Notation Relationships
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-emerald-100 rounded-lg p-4 mb-4">
              <div className="text-2xl font-bold text-emerald-600">O</div>
            </div>
            <h4 className="font-semibold mb-2">Big-O</h4>
            <p className="text-sm text-gray-600">Upper bound only</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-lg p-4 mb-4">
              <div className="text-2xl font-bold text-blue-600">Ω</div>
            </div>
            <h4 className="font-semibold mb-2">Big-Omega</h4>
            <p className="text-sm text-gray-600">Lower bound only</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-lg p-4 mb-4">
              <div className="text-2xl font-bold text-purple-600">Θ</div>
            </div>
            <h4 className="font-semibold mb-2">Big-Theta</h4>
            <p className="text-sm text-gray-600">Both bounds (tight)</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <div className="bg-gray-100 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-700">
              <strong>Θ(g(n))</strong> ⊆ <strong>O(g(n))</strong> ∩ <strong>Ω(g(n))</strong>
            </p>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  const renderAnalysisTab = () => (
    <div className="space-y-8">
      {/* Analysis Methods */}
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Analysis Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-red-100 rounded-lg p-6 mb-4">
              <div className="text-4xl mb-2">😱</div>
              <h4 className="font-bold text-red-800">Worst Case</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              The maximum time/space an algorithm takes for any input of size n
            </p>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-700 font-mono text-sm">O(notation)</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 rounded-lg p-6 mb-4">
              <div className="text-4xl mb-2">😊</div>
              <h4 className="font-bold text-yellow-800">Best Case</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              The minimum time/space an algorithm takes for any input of size n
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-700 font-mono text-sm">Ω(notation)</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-lg p-6 mb-4">
              <div className="text-4xl mb-2">😐</div>
              <h4 className="font-bold text-green-800">Average Case</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              The expected time/space an algorithm takes over all possible inputs
            </p>
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-700 font-mono text-sm">Often Θ(notation)</p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* How to Analyze Code */}
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          How to Analyze Algorithm Complexity
        </h3>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Identify the Input Size</h4>
              <p className="text-gray-700 mb-2">
                Find the variable that represents the size of the input (usually n)
              </p>
              <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                function search(arr, target) // n = arr.length
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Count Basic Operations</h4>
              <p className="text-gray-700 mb-2">
                Focus on the most expensive operations (loops, recursion, function calls)
              </p>
              <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                for (let i = 0; i &lt; n; i++) // n iterations
                <br />
                &nbsp;&nbsp;if (arr[i] === target) return i; // O(1) per iteration
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Analyze Loops and Recursion</h4>
              <p className="text-gray-700 mb-2">
                Nested loops multiply, recursion creates call trees
              </p>
              <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                for (let i = 0; i &lt; n; i++)
                <br />
                &nbsp;&nbsp;for (let j = 0; j &lt; n; j++)
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;// O(1) work
                <br />
                // Total: O(n²)
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Drop Constants and Lower Terms</h4>
              <p className="text-gray-700 mb-2">
                Focus on the dominant term as n approaches infinity
              </p>
              <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                3n² + 2n + 5 → O(n²)
                <br />
                2ⁿ + n³ + n → O(2ⁿ)
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Common Mistakes */}
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Analysis Mistakes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">❌ Counting Everything</h4>
            <p className="text-red-700 text-sm">
              Don't count every single operation. Focus on the dominant factors that grow with input
              size.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">❌ Forgetting Recursion</h4>
            <p className="text-red-700 text-sm">
              Recursive algorithms create call trees. Each level multiplies the work of the previous
              level.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">❌ Ignoring Constants</h4>
            <p className="text-red-700 text-sm">
              While we drop constants in Big-O, they matter in practice for small inputs.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">❌ Wrong Variable</h4>
            <p className="text-red-700 text-sm">
              Make sure you're analyzing complexity in terms of the correct input parameter.
            </p>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  const renderExamplesTab = () => (
    <div className="space-y-8">
      {/* Complexity Selector */}
      <ThemeCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Complexity Classes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {complexityExamples.map((example) => (
            <button
              key={example.bigO}
              onClick={() => setSelectedComplexity(example.bigO)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedComplexity === example.bigO
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="font-mono font-bold text-center">{example.bigO}</div>
              <div className="text-xs text-center mt-1">{example.name}</div>
            </button>
          ))}
        </div>
      </ThemeCard>

      {/* Selected Complexity Details */}
      {complexityExamples.find((ex) => ex.bigO === selectedComplexity) && (
        <ThemeCard className="p-8">
          {(() => {
            const example = complexityExamples.find((ex) => ex.bigO === selectedComplexity)!;
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{example.name}</h3>
                  <div className="text-4xl font-mono font-bold text-emerald-600 mb-4">
                    {example.bigO}
                  </div>
                  <p className="text-gray-700 mb-6">{example.description}</p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Example:</h4>
                    <div className="bg-white border rounded p-3 font-mono text-sm">
                      {example.example}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Characteristics:</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {example.bigO === 'O(1)' && (
                        <>
                          <div className="flex items-center text-green-600">
                            <span className="mr-2">✅</span> Constant time regardless of input
                          </div>
                          <div className="flex items-center text-green-600">
                            <span className="mr-2">✅</span> Most efficient complexity class
                          </div>
                          <div className="flex items-center text-green-600">
                            <span className="mr-2">✅</span> Array access, hash table lookup
                          </div>
                        </>
                      )}
                      {example.bigO === 'O(log n)' && (
                        <>
                          <div className="flex items-center text-blue-600">
                            <span className="mr-2">📈</span> Grows very slowly
                          </div>
                          <div className="flex items-center text-blue-600">
                            <span className="mr-2">📈</span> Divide and conquer algorithms
                          </div>
                          <div className="flex items-center text-blue-600">
                            <span className="mr-2">📈</span> Binary search, balanced BST operations
                          </div>
                        </>
                      )}
                      {example.bigO === 'O(n)' && (
                        <>
                          <div className="flex items-center text-yellow-600">
                            <span className="mr-2">📊</span> Linear growth with input size
                          </div>
                          <div className="flex items-center text-yellow-600">
                            <span className="mr-2">📊</span> Single pass through data
                          </div>
                          <div className="flex items-center text-yellow-600">
                            <span className="mr-2">📊</span> Linear search, array traversal
                          </div>
                        </>
                      )}
                      {example.bigO === 'O(n log n)' && (
                        <>
                          <div className="flex items-center text-orange-600">
                            <span className="mr-2">🔀</span> Efficient sorting algorithms
                          </div>
                          <div className="flex items-center text-orange-600">
                            <span className="mr-2">🔀</span> Divide and conquer with merging
                          </div>
                          <div className="flex items-center text-orange-600">
                            <span className="mr-2">🔀</span> Merge sort, quick sort, heap sort
                          </div>
                        </>
                      )}
                      {example.bigO === 'O(n²)' && (
                        <>
                          <div className="flex items-center text-red-600">
                            <span className="mr-2">⚠️</span> Grows quickly with input size
                          </div>
                          <div className="flex items-center text-red-600">
                            <span className="mr-2">⚠️</span> Nested loops comparing elements
                          </div>
                          <div className="flex items-center text-red-600">
                            <span className="mr-2">⚠️</span> Bubble sort, insertion sort, selection
                            sort
                          </div>
                        </>
                      )}
                      {example.bigO === 'O(2^n)' && (
                        <>
                          <div className="flex items-center text-purple-600">
                            <span className="mr-2">🚫</span> Exponential growth - avoid when
                            possible
                          </div>
                          <div className="flex items-center text-purple-600">
                            <span className="mr-2">🚫</span> Tries all possible combinations
                          </div>
                          <div className="flex items-center text-purple-600">
                            <span className="mr-2">🚫</span> Subset sum, traveling salesman (brute
                            force)
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">{example.visualization}</div>
              </div>
            );
          })()}
        </ThemeCard>
      )}

      {/* Complexity Comparison */}
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Complexity Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-3 text-left font-semibold">
                  Input Size (n)
                </th>
                <th className="border border-gray-300 p-3 text-center font-semibold">O(1)</th>
                <th className="border border-gray-300 p-3 text-center font-semibold">O(log n)</th>
                <th className="border border-gray-300 p-3 text-center font-semibold">O(n)</th>
                <th className="border border-gray-300 p-3 text-center font-semibold">O(n log n)</th>
                <th className="border border-gray-300 p-3 text-center font-semibold">O(n²)</th>
                <th className="border border-gray-300 p-3 text-center font-semibold">O(2^n)</th>
              </tr>
            </thead>
            <tbody>
              {[10, 100, 1000, 10000].map((n) => (
                <tr key={n} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-mono font-semibold">{n}</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-mono">
                    1
                  </td>
                  <td className="border border-gray-300 p-3 text-center text-blue-600 font-mono">
                    {Math.round(Math.log2(n))}
                  </td>
                  <td className="border border-gray-300 p-3 text-center text-yellow-600 font-mono">
                    {n}
                  </td>
                  <td className="border border-gray-300 p-3 text-center text-orange-600 font-mono">
                    {n * Math.round(Math.log2(n))}
                  </td>
                  <td className="border border-gray-300 p-3 text-center text-red-600 font-mono">
                    {n * n}
                  </td>
                  <td className="border border-gray-300 p-3 text-center text-purple-600 font-mono">
                    {Math.pow(2, Math.min(n, 20))} {/* Cap at 2^20 for display */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          Operations required for different input sizes and complexity classes
        </div>
      </ThemeCard>
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <ThemeCard className="p-6">
        <div className="flex justify-center">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'notation', label: 'Asymptotic Notation', icon: '📐' },
              { id: 'analysis', label: 'Analysis Methods', icon: '🔍' },
              { id: 'examples', label: 'Complexity Classes', icon: '📊' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </ThemeCard>

      {/* Tab Content */}
      {activeTab === 'notation' && renderNotationTab()}
      {activeTab === 'analysis' && renderAnalysisTab()}
      {activeTab === 'examples' && renderExamplesTab()}

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemeCard>
          <NavigationCard
            title="Common Complexities"
            description="Interactive exploration of O(1), O(log n), O(n), O(n²) with metaphors and examples."
            colorScheme="emerald"
            onClick={() => console.log('Navigate to Common Complexities')}
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
            title="Practice Challenges"
            description="Test your Big-O analysis skills with interactive coding challenges."
            colorScheme="purple"
            onClick={() => (window.location.href = '/bigo?section=practice-challenges')}
          />
        </ThemeCard>
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="space-y-6">
      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Big-O Notation Summary</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong className="text-emerald-600">O(f(n)):</strong> Upper bound (worst case)
          </div>
          <div>
            <strong className="text-blue-600">Ω(f(n)):</strong> Lower bound (best case)
          </div>
          <div>
            <strong className="text-purple-600">Θ(f(n)):</strong> Tight bound (exact)
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Complexity Hierarchy</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-green-600 font-mono">O(1)</span>
            <span>Constant</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-600 font-mono">O(log n)</span>
            <span>Logarithmic</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-600 font-mono">O(n)</span>
            <span>Linear</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-600 font-mono">O(n log n)</span>
            <span>Linearithmic</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-600 font-mono">O(n²)</span>
            <span>Quadratic</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-600 font-mono">O(2^n)</span>
            <span>Exponential</span>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Key Principles</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            🎯 <strong>Focus on growth:</strong> How does runtime change with input size?
          </p>
          <p>
            ⚡ <strong>Drop constants:</strong> O(2n) becomes O(n)
          </p>
          <p>
            📈 <strong>Dominant terms:</strong> Keep only the fastest-growing term
          </p>
          <p>
            🔄 <strong>Worst case:</strong> Usually what we care about
          </p>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Reference</h3>
        <div className="space-y-2 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-mono text-emerald-600">O(1)</div>
            <div className="text-xs text-gray-600">Array access, hash lookup</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-mono text-blue-600">O(log n)</div>
            <div className="text-xs text-gray-600">Binary search, BST</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-mono text-yellow-600">O(n)</div>
            <div className="text-xs text-gray-600">Linear search, traversal</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-mono text-orange-600">O(n log n)</div>
            <div className="text-xs text-gray-600">Efficient sorting</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-mono text-red-600">O(n²)</div>
            <div className="text-xs text-gray-600">Simple sorting, nested loops</div>
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
        title="Ready to Explore Common Complexities?"
        description="Dive deeper into O(1), O(log n), O(n), O(n²) with interactive metaphors and real examples."
        buttonText="Explore Complexities"
        onButtonClick={() => console.log('Navigate to Common Complexities')}
        colorScheme="emerald"
      />
    </>
  );
};

export default CoreConcepts;
