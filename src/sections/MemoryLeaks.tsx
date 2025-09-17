import React, { useState } from 'react';
import MemoryLeaks2D from '../components/models2d/MemoryLeaks2D';

const MemoryLeaks: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const leakExamples = [
    {
      id: 0,
      title: 'Event Listener Memory Leak',
      description:
        'Forgetting to remove event listeners causes references to DOM elements and callback functions to persist in memory.',
      problemCode: `// PROBLEM: Event listener not removed
function setupButton() {
  const button = document.getElementById('myButton');
  const handler = () => console.log('Clicked!');
  
  button.addEventListener('click', handler);
  // Missing: button.removeEventListener('click', handler);
}

// Each call creates a new listener
setupButton(); // Leak 1
setupButton(); // Leak 2
setupButton(); // Leak 3`,
      solutionCode: `// SOLUTION: Properly remove event listeners
function setupButton() {
  const button = document.getElementById('myButton');
  const handler = () => console.log('Clicked!');
  
  button.addEventListener('click', handler);
  
  // Cleanup function
  return () => {
    button.removeEventListener('click', handler);
  };
}

// Use cleanup function
const cleanup = setupButton();
// Later, when component unmounts:
cleanup();`,
      impact: 'High - DOM elements and callback functions remain in memory indefinitely',
    },
    {
      id: 1,
      title: 'Circular Reference Memory Leak',
      description:
        'Objects that reference each other in a circular pattern prevent garbage collection even when no longer needed.',
      problemCode: `// PROBLEM: Circular references
function createCircularReference() {
  const parent = { name: 'Parent' };
  const child = { name: 'Child' };
  
  // Creating circular reference
  parent.child = child;
  child.parent = parent;
  
  return { parent, child };
}

// Each call creates unreachable circular objects
let refs = [];
for (let i = 0; i < 1000; i++) {
  refs.push(createCircularReference());
}
refs = null; // Objects still not garbage collected!`,
      solutionCode: `// SOLUTION: Break circular references
function createCircularReference() {
  const parent = { name: 'Parent' };
  const child = { name: 'Child' };
  
  parent.child = child;
  child.parent = parent;
  
  // Cleanup function to break cycles
  const cleanup = () => {
    parent.child = null;
    child.parent = null;
  };
  
  return { parent, child, cleanup };
}

// Proper cleanup
const { parent, child, cleanup } = createCircularReference();
// When done:
cleanup(); // Breaks the cycle for GC`,
      impact: 'Medium - Objects remain in memory until circular references are broken',
    },
    {
      id: 2,
      title: 'Global Variable Accumulation',
      description:
        'Accidentally creating global variables or not cleaning up global references leads to memory accumulation.',
      problemCode: `// PROBLEM: Accidental global variables
function processData() {
  // Missing 'var', 'let', or 'const' - creates global!
  largeDataArray = new Array(1000000).fill('data');
  
  // Another accidental global
  this.cache = new Map();
  
  return largeDataArray.length;
}

// Each call adds to global scope
processData(); // window.largeDataArray created
processData(); // window.cache created
// Variables never cleaned up!`,
      solutionCode: `// SOLUTION: Proper variable scoping and cleanup
function processData() {
  // Properly scoped variables
  const largeDataArray = new Array(1000000).fill('data');
  const cache = new Map();
  
  // Process data...
  const result = largeDataArray.length;
  
  // Explicit cleanup for large objects
  largeDataArray.length = 0;
  cache.clear();
  
  return result;
}

// Or use a class with proper lifecycle
class DataProcessor {
  constructor() {
    this.cache = new Map();
  }
  
  process() {
    const data = new Array(1000000).fill('data');
    return data.length;
  }
  
  cleanup() {
    this.cache.clear();
    this.cache = null;
  }
}`,
      impact: 'High - Global variables persist for the entire page lifetime',
    },
    {
      id: 3,
      title: 'Detached DOM Nodes',
      description:
        "Keeping references to DOM elements after they've been removed from the document prevents garbage collection.",
      problemCode: `// PROBLEM: Detached DOM node references
let domCache = [];

function cacheElements() {
  const elements = document.querySelectorAll('.dynamic-content');
  
  // Store DOM references
  elements.forEach(el => {
    domCache.push({
      element: el,
      data: el.dataset
    });
  });
}

// Later, DOM is updated
function updateDOM() {
  const container = document.getElementById('container');
  container.innerHTML = ''; // Removes elements from DOM
  
  // BUT domCache still holds references!
  // Elements can't be garbage collected
}

cacheElements();
updateDOM(); // Memory leak!`,
      solutionCode: `// SOLUTION: Use WeakMap or clear references
const domCache = new WeakMap(); // WeakMap allows GC

function cacheElements() {
  const elements = document.querySelectorAll('.dynamic-content');
  
  elements.forEach(el => {
    // WeakMap won't prevent GC
    domCache.set(el, {
      data: el.dataset,
      timestamp: Date.now()
    });
  });
}

// OR: Clear references explicitly
let domRefs = [];

function clearDOMCache() {
  domRefs.forEach(ref => {
    ref.element = null; // Clear reference
  });
  domRefs.length = 0; // Clear array
}

function updateDOM() {
  clearDOMCache(); // Clear before DOM update
  const container = document.getElementById('container');
  container.innerHTML = '';
}`,
      impact: 'High - DOM elements and their entire subtrees remain in memory',
    },
    {
      id: 4,
      title: 'Timer and Interval Leaks',
      description:
        'Forgetting to clear timers and intervals keeps their callback functions and referenced variables in memory.',
      problemCode: `// PROBLEM: Uncleaned timers and intervals
function startDataPolling() {
  const largeDataSet = new Array(100000).fill('data');
  
  // Timer never cleared
  setInterval(() => {
    // Closure keeps largeDataSet in memory
    console.log('Data size:', largeDataSet.length);
    
    // Even more data accumulation
    largeDataSet.push(new Date().toISOString());
  }, 1000);
  
  // setTimeout also never cleared
  setTimeout(() => {
    // Another closure keeping data alive
    processData(largeDataSet);
  }, 5000);
}

// Multiple calls create multiple leaking timers
startDataPolling();
startDataPolling();
startDataPolling();`,
      solutionCode: `// SOLUTION: Always clear timers and manage lifecycle
function startDataPolling() {
  let largeDataSet = new Array(100000).fill('data');
  
  // Store timer IDs for cleanup
  const intervalId = setInterval(() => {
    console.log('Data size:', largeDataSet.length);
    largeDataSet.push(new Date().toISOString());
  }, 1000);
  
  const timeoutId = setTimeout(() => {
    processData(largeDataSet);
  }, 5000);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    clearTimeout(timeoutId);
    largeDataSet = null; // Clear reference
  };
}

// Proper usage with cleanup
const stopPolling = startDataPolling();

// Later, when component unmounts or feature disabled:
stopPolling(); // Clean up all timers and references`,
      impact: 'Medium - Timer callbacks and their closures remain in memory indefinitely',
    },
  ];

  const handleExampleChange = (exampleIndex: number) => {
    if (!isAnimating) {
      setActiveExample(exampleIndex);
    }
  };

  const handleNext = () => {
    if (!isAnimating && activeExample < leakExamples.length - 1) {
      setActiveExample(activeExample + 1);
    }
  };

  const handlePrevious = () => {
    if (!isAnimating && activeExample > 0) {
      setActiveExample(activeExample - 1);
    }
  };

  const handleReset = () => {
    if (!isAnimating) {
      setActiveExample(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">JavaScript Memory Leaks</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understanding common memory leak patterns, their causes, detection methods, and
            prevention strategies to build more efficient JavaScript applications.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold">⚠️</span>
              </div>
              What are Memory Leaks?
            </h2>
            <p className="text-gray-700 mb-4">
              Memory leaks occur when a program allocates memory but fails to release it back to the
              system, causing memory usage to grow over time and potentially leading to performance
              degradation or crashes.
            </p>
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Key Characteristics:</h3>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Memory usage increases over time</li>
                <li>• Objects remain referenced when no longer needed</li>
                <li>• Garbage collector cannot reclaim the memory</li>
                <li>• Can lead to application slowdown or crashes</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold">🔍</span>
              </div>
              Detection Methods
            </h2>
            <div className="space-y-4">
              <div className="bg-orange-50 rounded-lg p-3">
                <h3 className="font-semibold text-orange-800 mb-1">Chrome DevTools</h3>
                <p className="text-orange-700 text-sm">
                  Use Memory tab, heap snapshots, and allocation profiling to identify leaks.
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <h3 className="font-semibold text-orange-800 mb-1">Performance Monitoring</h3>
                <p className="text-orange-700 text-sm">
                  Monitor memory usage patterns and identify abnormal growth over time.
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <h3 className="font-semibold text-orange-800 mb-1">Memory Testing</h3>
                <p className="text-orange-700 text-sm">
                  Automated tests that measure memory usage before and after operations.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold">🛡️</span>
              </div>
              Prevention Strategies
            </h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                <p className="text-gray-700 text-sm">Always remove event listeners when done</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                <p className="text-gray-700 text-sm">Clear timers and intervals properly</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                <p className="text-gray-700 text-sm">Avoid creating circular references</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                <p className="text-gray-700 text-sm">Use proper variable scoping</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                <p className="text-gray-700 text-sm">Implement cleanup lifecycle methods</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Visualization */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Interactive Memory Leak Visualization
          </h2>
          <MemoryLeaks2D activeExample={activeExample} onAnimationStateChange={setIsAnimating} />
        </div>

        {/* Example Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {leakExamples.map((example, index) => (
              <button
                key={example.id}
                onClick={() => handleExampleChange(index)}
                disabled={isAnimating}
                className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  activeExample === index
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {index + 1}. {example.title}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={isAnimating || activeExample === 0}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleReset}
              disabled={isAnimating}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleNext}
              disabled={isAnimating || activeExample === leakExamples.length - 1}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* Code Examples */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              Problem Code
            </h3>
            <p className="text-gray-700 mb-4">{leakExamples[activeExample].description}</p>
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <span className="text-red-600 font-semibold text-sm">Impact: </span>
                <span className="text-red-800 text-sm ml-1">
                  {leakExamples[activeExample].impact}
                </span>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100">
                <code>{leakExamples[activeExample].problemCode}</code>
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Solution Code
            </h3>
            <p className="text-gray-700 mb-4">
              Best practices to prevent this type of memory leak:
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-800 mb-2">Key Improvements:</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Proper cleanup and resource management</li>
                <li>• Breaking circular references</li>
                <li>• Using appropriate data structures</li>
                <li>• Implementing lifecycle methods</li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100">
                <code>{leakExamples[activeExample].solutionCode}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Real-World Impact */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl shadow-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">Real-World Impact & Case Studies</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Performance Impact</h3>
              <ul className="space-y-2 text-red-100">
                <li>• Single-page applications become sluggish over time</li>
                <li>• Mobile devices crash due to memory exhaustion</li>
                <li>• Server-side Node.js applications consume excessive RAM</li>
                <li>• Browser tabs become unresponsive</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Business Consequences</h3>
              <ul className="space-y-2 text-red-100">
                <li>• Poor user experience and customer churn</li>
                <li>• Increased server costs due to memory usage</li>
                <li>• Application downtime and reliability issues</li>
                <li>• Development time spent debugging performance issues</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Memory Leak Prevention Best Practices
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                <span className="mr-2">🎯</span>
                Event Management
              </h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Use AbortController for fetch requests</li>
                <li>• Remove event listeners in cleanup functions</li>
                <li>• Prefer event delegation over individual listeners</li>
                <li>• Use WeakMap for DOM element associations</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-2 flex items-center">
                <span className="mr-2">⏰</span>
                Timer Management
              </h3>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Always store timer IDs for cleanup</li>
                <li>• Clear intervals and timeouts in useEffect cleanup</li>
                <li>• Use requestAnimationFrame instead of setInterval</li>
                <li>• Consider using libraries like RxJS for complex timing</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <h3 className="font-bold text-purple-800 mb-2 flex items-center">
                <span className="mr-2">🔗</span>
                Reference Management
              </h3>
              <ul className="text-purple-700 text-sm space-y-1">
                <li>• Avoid circular references in object design</li>
                <li>• Use WeakSet and WeakMap when appropriate</li>
                <li>• Set large objects to null when done</li>
                <li>• Implement proper component lifecycle methods</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Topics */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
          <p className="mb-6 opacity-90">
            Deepen your understanding of JavaScript memory management:
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="?section=memory-management"
              className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors"
            >
              <h3 className="font-semibold mb-2">Memory Management</h3>
              <p className="text-sm opacity-90">Garbage collection and heap structure</p>
            </a>
            <a
              href="?section=engine-runtime"
              className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors"
            >
              <h3 className="font-semibold mb-2">Engine & Runtime</h3>
              <p className="text-sm opacity-90">V8 engine and memory allocation</p>
            </a>
            <a
              href="?section=event-loop"
              className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors"
            >
              <h3 className="font-semibold mb-2">Event Loop</h3>
              <p className="text-sm opacity-90">Asynchronous patterns and cleanup</p>
            </a>
            <a
              href="?section=visualization"
              className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors"
            >
              <h3 className="font-semibold mb-2">Visualization</h3>
              <p className="text-sm opacity-90">Memory profiling and debugging tools</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryLeaks;
