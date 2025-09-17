import React, { useState } from 'react';
import MemoryManagement2D from './../components/models2d/MemoryManagement2D';

const MemoryManagement: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      id: 0,
      title: 'Memory Allocation',
      description:
        'When objects are created, they are allocated in the young generation (Eden space) of the memory heap.',
      code: `let user = { name: "John", age: 30 };
let items = [1, 2, 3, 4, 5];
let callback = () => console.log("Hello");`,
    },
    {
      id: 1,
      title: 'Young Generation Collection',
      description:
        'The Scavenger collector frequently scans the young generation, copying live objects to the survivor space.',
      code: `// Objects that are still referenced survive
function processUser(userData) {
  return userData; // user object survives
}
let result = processUser(user);`,
    },
    {
      id: 2,
      title: 'Promotion to Old Generation',
      description:
        'Objects that survive multiple collections are promoted to the old generation for long-term storage.',
      code: `// Long-lived objects get promoted
class UserSession {
  constructor(user) {
    this.user = user; // Promoted after surviving collections
    this.startTime = Date.now();
  }
}`,
    },
    {
      id: 3,
      title: 'Mark Phase',
      description:
        'The Mark-and-Sweep collector marks all reachable objects starting from GC roots (global variables, stack frames).',
      code: `// GC traces from roots
window.globalUser = user; // GC root
function activeFunction() {
  let localVar = items; // Stack frame reference
}`,
    },
    {
      id: 4,
      title: 'Sweep Phase',
      description:
        'Unmarked objects are identified as garbage and their memory is reclaimed for future allocations.',
      code: `// Unreferenced objects become garbage
let oldData = { temp: "data" };
oldData = null; // No longer referenced
// Memory will be reclaimed during sweep`,
    },
    {
      id: 5,
      title: 'Compaction',
      description:
        'Optional compaction phase moves live objects together to reduce fragmentation and improve allocation efficiency.',
      code: `// Memory layout after compaction
// [LiveObj1][LiveObj2][LiveObj3][FreeSpace...]
// Instead of: [LiveObj1][Gap][LiveObj2][Gap][LiveObj3]`,
    },
  ];

  const handleStepChange = (stepIndex: number) => {
    if (!isAnimating) {
      setActiveStep(stepIndex);
    }
  };

  const handleNext = () => {
    if (!isAnimating && activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isAnimating && activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleReset = () => {
    if (!isAnimating) {
      setActiveStep(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">JavaScript Memory Management</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understand how JavaScript engines automatically manage memory through garbage
            collection, generational hypothesis, and advanced optimization techniques.
          </p>
        </div>

        {/* Theory Overview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold">🧠</span>
              </div>
              Memory Heap Structure
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-green-700">Young Generation</h3>
                <p className="text-gray-600 text-sm">
                  Newly created objects start here. Divided into Eden space and Survivor spaces.
                  Fast, frequent garbage collection using the Scavenger algorithm.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-blue-700">Old Generation</h3>
                <p className="text-gray-600 text-sm">
                  Long-lived objects that survived multiple collections. Less frequent but more
                  thorough Mark-and-Sweep collection.
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-orange-700">Large Object Space</h3>
                <p className="text-gray-600 text-sm">
                  Objects too large for normal heap allocation. Collected independently to optimize
                  performance.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold">⚡</span>
              </div>
              Garbage Collection Algorithms
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Scavenger (Young Gen)</h3>
                <p className="text-green-700 text-sm">
                  Semi-space copying collector. Copies live objects from "from-space" to "to-space",
                  leaving garbage behind implicitly.
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Mark-and-Sweep (Old Gen)</h3>
                <p className="text-blue-700 text-sm">
                  Three-phase process: Mark reachable objects, sweep unmarked objects, optionally
                  compact memory to reduce fragmentation.
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">Incremental Marking</h3>
                <p className="text-purple-700 text-sm">
                  Reduces pause times by breaking marking work into small increments interleaved
                  with application execution.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Visualization */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Interactive Memory Management Visualization
          </h2>
          <MemoryManagement2D activeStep={activeStep} onAnimationStateChange={setIsAnimating} />
        </div>

        {/* Step Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepChange(index)}
                disabled={isAnimating}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeStep === index
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {index + 1}. {step.title}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={isAnimating || activeStep === 0}
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
              disabled={isAnimating || activeStep === steps.length - 1}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* Step Description */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Step {activeStep + 1}: {steps[activeStep].title}
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">{steps[activeStep].description}</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Example Code:</h4>
              <pre className="text-sm text-gray-600 overflow-x-auto">
                <code>{steps[activeStep].code}</code>
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Key Concepts</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Generational Hypothesis</h4>
                  <p className="text-gray-600 text-sm">
                    Most objects "die young" - they become unreachable shortly after creation. This
                    principle drives the two-generation heap design.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Reachability</h4>
                  <p className="text-gray-600 text-sm">
                    Objects are reachable if they can be accessed from GC roots (global variables,
                    stack frames, etc.) through a chain of references.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Write Barriers</h4>
                  <p className="text-gray-600 text-sm">
                    Mechanisms that track when old generation objects reference young generation
                    objects, ensuring complete garbage collection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Topics */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Memory Management</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
              <h3 className="font-bold text-red-800 mb-2 flex items-center">
                <span className="mr-2">🚫</span>
                Memory Leaks
              </h3>
              <p className="text-red-700 text-sm mb-3">
                Common causes and prevention strategies for memory leaks in JavaScript applications.
              </p>
              <ul className="text-red-600 text-xs space-y-1">
                <li>• Unremoved event listeners</li>
                <li>• Circular references</li>
                <li>• Global variables accumulation</li>
                <li>• Detached DOM nodes</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-2 flex items-center">
                <span className="mr-2">⚡</span>
                Optimization Techniques
              </h3>
              <p className="text-green-700 text-sm mb-3">
                Strategies to optimize memory usage and garbage collection performance.
              </p>
              <ul className="text-green-600 text-xs space-y-1">
                <li>• Object pooling</li>
                <li>• Lazy initialization</li>
                <li>• Weak references</li>
                <li>• Manual cleanup</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                <span className="mr-2">🔍</span>
                Profiling Tools
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                Tools and techniques for analyzing memory usage and identifying bottlenecks.
              </p>
              <ul className="text-blue-600 text-xs space-y-1">
                <li>• Chrome DevTools Memory tab</li>
                <li>• Heap snapshots</li>
                <li>• Allocation profiling</li>
                <li>• Performance timeline</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Sections */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
          <p className="mb-6 opacity-90">
            Explore other aspects of JavaScript execution to build a complete understanding:
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="?section=engine-runtime"
              className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors"
            >
              <h3 className="font-semibold mb-2">Engine & Runtime</h3>
              <p className="text-sm opacity-90">V8 architecture and runtime environment</p>
            </a>
            <a
              href="?section=event-loop"
              className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors"
            >
              <h3 className="font-semibold mb-2">Event Loop</h3>
              <p className="text-sm opacity-90">Asynchronous execution and task queues</p>
            </a>
            <a
              href="?section=call-stack"
              className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors"
            >
              <h3 className="font-semibold mb-2">Call Stack</h3>
              <p className="text-sm opacity-90">Function execution and stack management</p>
            </a>
            <a
              href="?section=execution-model"
              className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors"
            >
              <h3 className="font-semibold mb-2">Execution Model</h3>
              <p className="text-sm opacity-90">Single-threaded execution with concurrency</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryManagement;
