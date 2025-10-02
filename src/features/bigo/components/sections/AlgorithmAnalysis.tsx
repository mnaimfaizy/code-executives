// src/sections/bigo/AlgorithmAnalysis.tsx
// Interactive algorithm analysis tools and step-by-step examples

import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';

interface AnalysisStep {
  title: string;
  description: string;
  code: string;
  explanation: string;
  complexity: string;
}

interface AlgorithmExample {
  name: string;
  description: string;
  code: string;
  analysis: AnalysisStep[];
  finalComplexity: string;
}

const AlgorithmAnalysis: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('linear-search');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showHints, setShowHints] = useState<boolean>(false);

  const algorithmExamples: AlgorithmExample[] = [
    {
      name: 'Linear Search',
      description: 'Finding an element in an unsorted array',
      code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`,
      analysis: [
        {
          title: 'Identify Input Size',
          description: 'The input size n is arr.length',
          code: 'function linearSearch(arr, target) // n = arr.length',
          explanation: 'We analyze complexity in terms of the primary input parameter',
          complexity: 'n',
        },
        {
          title: 'Count Operations',
          description: 'The loop runs n times in worst case',
          code: 'for (let i = 0; i < arr.length; i++) // n iterations',
          explanation: 'Each iteration performs constant-time operations',
          complexity: 'n',
        },
        {
          title: 'Determine Complexity',
          description: 'Worst case: O(n), Best case: O(1), Average case: O(n)',
          code: '// Worst case: element not found or at end\n// Best case: element at index 0',
          explanation: 'Linear search has linear time complexity',
          complexity: 'O(n)',
        },
      ],
      finalComplexity: 'O(n)',
    },
    {
      name: 'Binary Search',
      description: 'Finding an element in a sorted array using divide and conquer',
      code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}`,
      analysis: [
        {
          title: 'Identify Input Size',
          description: 'Input size n is arr.length',
          code: 'function binarySearch(arr, target) // n = arr.length',
          explanation: 'Same as linear search - we analyze in terms of n',
          complexity: 'n',
        },
        {
          title: 'Analyze Loop',
          description: 'Each iteration reduces search space by half',
          code: 'while (left <= right) // log₂(n) iterations',
          explanation: 'The search space halves each time: n → n/2 → n/4 → ... → 1',
          complexity: 'log n',
        },
        {
          title: 'Determine Complexity',
          description: 'Always O(log n) regardless of element position',
          code: '// Each iteration: O(1) work\n// Total iterations: O(log n)',
          explanation: 'Binary search has logarithmic time complexity',
          complexity: 'O(log n)',
        },
      ],
      finalComplexity: 'O(log n)',
    },
    {
      name: 'Bubble Sort',
      description: 'Simple sorting algorithm with nested loops',
      code: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      analysis: [
        {
          title: 'Identify Loops',
          description: 'Two nested loops, both depend on n',
          code: 'for (let i = 0; i < arr.length; i++) // Outer: n times',
          explanation: 'The outer loop runs n times, inner loop runs n-i-1 times',
          complexity: 'n × n',
        },
        {
          title: 'Calculate Total Operations',
          description: 'Inner loop runs approximately n times per outer iteration',
          code: 'for (let j = 0; j < arr.length - i - 1; j++) // Inner: ~n times',
          explanation: 'Total comparisons: (n×(n-1))/2 ≈ n²/2 operations',
          complexity: 'n²',
        },
        {
          title: 'Determine Complexity',
          description: 'Always O(n²) - quadratic time',
          code: '// Best case: O(n) - already sorted\n// Worst case: O(n²) - reverse sorted',
          explanation: 'Bubble sort has quadratic time complexity',
          complexity: 'O(n²)',
        },
      ],
      finalComplexity: 'O(n²)',
    },
    {
      name: 'Two Sum Problem',
      description: 'Finding two numbers that add up to a target',
      code: `function twoSum(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}`,
      analysis: [
        {
          title: 'Identify Nested Loops',
          description: 'Two nested loops checking all pairs',
          code: 'for (let i = 0; i < arr.length; i++) // n times',
          explanation: 'Outer loop: n iterations, Inner loop: n-i-1 iterations',
          complexity: 'n × n',
        },
        {
          title: 'Count Comparisons',
          description: 'Each pair is checked once',
          code: 'if (arr[i] + arr[j] === target) // O(1) check',
          explanation: 'Total pairs checked: n×(n-1)/2 ≈ n²/2',
          complexity: 'n²',
        },
        {
          title: 'Determine Complexity',
          description: 'Brute force approach is O(n²)',
          code: '// Can be optimized to O(n) using hash table',
          explanation: 'Two sum brute force has quadratic time complexity',
          complexity: 'O(n²)',
        },
      ],
      finalComplexity: 'O(n²)',
    },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Algorithm Analysis</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Learn systematic methods to analyze code complexity with step-by-step examples and
          interactive analysis tools.
        </p>
        <div className="flex justify-center items-center space-x-4 mb-8">
          <div className="text-center">
            <div className="text-3xl">🔍</div>
            <div className="text-sm text-gray-600">Step-by-Step</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">📊</div>
            <div className="text-sm text-gray-600">Interactive</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">💡</div>
            <div className="text-sm text-gray-600">Real Examples</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">🎯</div>
            <div className="text-sm text-gray-600">Practice</div>
          </div>
        </div>
      </div>

      <StatsGrid
        stats={[
          { label: 'Analysis Methods', value: '4', icon: '🔍' },
          { label: 'Example Algorithms', value: '4', icon: '📊' },
          { label: 'Step-by-Step Guides', value: '12+', icon: '📝' },
          { label: 'Interactive Tools', value: '3', icon: '🎮' },
        ]}
        colorScheme="emerald"
      />
    </div>
  );

  const renderAlgorithmSelector = () => (
    <ThemeCard className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
        Choose an Algorithm to Analyze
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {algorithmExamples.map((algorithm) => (
          <button
            key={algorithm.name.toLowerCase().replace(/\s+/g, '-')}
            onClick={() => {
              setSelectedAlgorithm(algorithm.name.toLowerCase().replace(/\s+/g, '-'));
              setCurrentStep(0);
            }}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedAlgorithm === algorithm.name.toLowerCase().replace(/\s+/g, '-')
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-bold mb-1">{algorithm.name}</div>
              <div className="text-sm text-emerald-600 font-mono">{algorithm.finalComplexity}</div>
              <div className="text-xs mt-2 text-gray-600">{algorithm.description}</div>
            </div>
          </button>
        ))}
      </div>
    </ThemeCard>
  );

  const renderAnalysisSteps = () => {
    const algorithm = algorithmExamples.find(
      (alg) => alg.name.toLowerCase().replace(/\s+/g, '-') === selectedAlgorithm
    );
    if (!algorithm) return null;

    const step = algorithm.analysis[currentStep];

    return (
      <ThemeCard className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{algorithm.name}</h3>
          <p className="text-gray-700 mb-4">{algorithm.description}</p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="text-emerald-800 font-mono text-sm mb-2">
              Final Complexity: {algorithm.finalComplexity}
            </div>
            <div className="text-emerald-700 text-sm">
              {algorithm.analysis[algorithm.analysis.length - 1].description}
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Analysis Steps</h4>
            <div className="flex items-center space-x-2">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showHints}
                  onChange={(e) => setShowHints(e.target.checked)}
                  className="mr-2"
                />
                Show hints
              </label>
            </div>
          </div>

          <div className="flex space-x-2 mb-4">
            {algorithm.analysis.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  currentStep === index
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Current Step */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-800 mb-2">{step.title}</h5>
            <p className="text-blue-700 mb-3">{step.description}</p>
            <div className="bg-white rounded p-3 font-mono text-sm text-blue-800 mb-2">
              {step.code}
            </div>
            <p className="text-blue-700 text-sm">{step.explanation}</p>
            {showHints && (
              <div className="mt-3 pt-3 border-t border-blue-300">
                <div className="text-blue-600 font-mono text-sm">Complexity: {step.complexity}</div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous Step
            </button>
            <button
              onClick={() =>
                setCurrentStep(Math.min(algorithm.analysis.length - 1, currentStep + 1))
              }
              disabled={currentStep === algorithm.analysis.length - 1}
              className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          </div>
        </div>
      </ThemeCard>
    );
  };

  const renderCodeViewer = () => {
    const algorithm = algorithmExamples.find(
      (alg) => alg.name.toLowerCase().replace(/\s+/g, '-') === selectedAlgorithm
    );
    if (!algorithm) return null;

    return (
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Complete Algorithm</h3>
        <div className="bg-gray-900 rounded-lg p-6">
          <pre className="text-green-400 font-mono text-sm overflow-x-auto">
            <code>{algorithm.code}</code>
          </pre>
        </div>
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg">
            <span className="font-semibold">Time Complexity:</span>
            <span className="font-mono font-bold">{algorithm.finalComplexity}</span>
          </div>
        </div>
      </ThemeCard>
    );
  };

  const renderAnalysisTips = () => (
    <div className="space-y-6">
      <ThemeCard className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Analysis Best Practices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-emerald-600">✅ Do This</h4>
            <div className="space-y-3 text-sm">
              <div className="bg-emerald-50 p-3 rounded">
                <strong>Focus on dominant terms:</strong> O(n² + n) becomes O(n²)
              </div>
              <div className="bg-emerald-50 p-3 rounded">
                <strong>Consider worst case:</strong> Usually what matters most
              </div>
              <div className="bg-emerald-50 p-3 rounded">
                <strong>Count operations:</strong> Not lines of code
              </div>
              <div className="bg-emerald-50 p-3 rounded">
                <strong>Analyze loops:</strong> Nested loops multiply complexity
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-red-600">❌ Avoid This</h4>
            <div className="space-y-3 text-sm">
              <div className="bg-red-50 p-3 rounded">
                <strong>Don't count constants:</strong> O(2n) is still O(n)
              </div>
              <div className="bg-red-50 p-3 rounded">
                <strong>Don't ignore recursion:</strong> Each call adds complexity
              </div>
              <div className="bg-red-50 p-3 rounded">
                <strong>Don't assume best case:</strong> Worst case is usually analyzed
              </div>
              <div className="bg-red-50 p-3 rounded">
                <strong>Don't forget space:</strong> Consider memory usage too
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      {/* Algorithm Selector */}
      {renderAlgorithmSelector()}

      {/* Analysis Steps */}
      {renderAnalysisSteps()}

      {/* Code Viewer */}
      {renderCodeViewer()}

      {/* Analysis Tips */}
      {renderAnalysisTips()}

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemeCard>
          <NavigationCard
            title="Common Complexities"
            description="Explore O(1), O(log n), O(n), O(n²) with interactive metaphors and examples."
            colorScheme="emerald"
            onClick={() => (window.location.href = '/bigo?section=common-complexities')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Real-World Applications"
            description="See Big-O analysis applied to real algorithms and optimization problems."
            colorScheme="blue"
            onClick={() => console.log('Navigate to Real-World Applications')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Practice Challenges"
            description="Test your analysis skills with interactive coding challenges and quizzes."
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
        <h3 className="text-lg font-bold text-gray-900 mb-3">Analysis Framework</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">
              1
            </span>
            <div>
              <div className="font-semibold">Identify Input Size</div>
              <div className="text-gray-600 text-xs">Find the parameter n</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">
              2
            </span>
            <div>
              <div className="font-semibold">Count Operations</div>
              <div className="text-gray-600 text-xs">Focus on expensive operations</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">
              3
            </span>
            <div>
              <div className="font-semibold">Analyze Loops</div>
              <div className="text-gray-600 text-xs">Nested loops multiply</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">
              4
            </span>
            <div>
              <div className="font-semibold">Drop Constants</div>
              <div className="text-gray-600 text-xs">Keep dominant terms</div>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Complexity Patterns</h3>
        <div className="space-y-2 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-mono text-emerald-600 text-xs">Single loop</div>
            <div className="text-xs text-gray-600">Usually O(n)</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-mono text-blue-600 text-xs">Nested loops</div>
            <div className="text-xs text-gray-600">Often O(n²)</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-mono text-orange-600 text-xs">Divide & conquer</div>
            <div className="text-xs text-gray-600">Typically O(n log n)</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-mono text-purple-600 text-xs">All combinations</div>
            <div className="text-xs text-gray-600">Usually O(2^n)</div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Current Algorithm</h3>
        {(() => {
          const algorithm = algorithmExamples.find(
            (alg) => alg.name.toLowerCase().replace(/\s+/g, '-') === selectedAlgorithm
          );
          return algorithm ? (
            <div className="text-sm">
              <div className="font-semibold mb-2">{algorithm.name}</div>
              <div className="text-emerald-600 font-mono mb-2">{algorithm.finalComplexity}</div>
              <div className="text-gray-600">{algorithm.description}</div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Step {currentStep + 1} of {algorithm.analysis.length}
                </div>
              </div>
            </div>
          ) : null;
        })()}
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Analysis</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            🔹 <strong>Loops:</strong> Add iterations
          </p>
          <p>
            🔹 <strong>Nested:</strong> Multiply depths
          </p>
          <p>
            🔹 <strong>Recursion:</strong> Call tree height
          </p>
          <p>
            🔹 <strong>Constants:</strong> Usually ignored
          </p>
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
        title="Ready for Real-World Applications?"
        description="See Big-O analysis applied to sorting algorithms, data structures, and optimization problems."
        buttonText="Explore Applications"
        onButtonClick={() => console.log('Navigate to Real-World Applications')}
        colorScheme="emerald"
      />
    </>
  );
};

export default AlgorithmAnalysis;
