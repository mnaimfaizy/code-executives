import React, { useState } from 'react';
import Engine2D from '../components/models2d/Engine2D';

const Engine: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const engineComponents = [
    {
      id: 0,
      title: 'V8 Engine Architecture',
      description: "Complete overview of V8's component architecture and pipeline",
      icon: '🏗️',
    },
    {
      id: 1,
      title: 'Parsing & AST Generation',
      description: 'Source code to Abstract Syntax Tree transformation',
      icon: '🔍',
    },
    {
      id: 2,
      title: 'Ignition Interpreter',
      description: 'AST to bytecode conversion and immediate execution',
      icon: '⚡',
    },
    {
      id: 3,
      title: 'TurboFan Optimization',
      description: 'JIT compilation and machine code optimization',
      icon: '🚀',
    },
    {
      id: 4,
      title: 'Memory Architecture',
      description: 'Call Stack, Memory Heap, and object allocation',
      icon: '🧠',
    },
  ];

  const navigateToSubSection = (sectionName: string) => {
    const baseUrl = '/javascript?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 mb-8 border border-blue-200 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            JavaScript Engine: The V8 Powerhouse
          </h1>
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            Dive deep into the sophisticated architecture of the V8 JavaScript engine - the
            high-performance powerhouse that transforms your JavaScript code into lightning-fast
            machine instructions through advanced compilation techniques.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
              🔬 JIT Compilation
            </span>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
              ⚡ Ignition Interpreter
            </span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
              🚀 TurboFan Optimizer
            </span>
            <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
              🧠 Memory Management
            </span>
          </div>
        </div>
      </div>

      {/* Core Concepts Overview */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding JavaScript Engines</h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              What is a JavaScript Engine?
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              A JavaScript engine is a sophisticated program that executes JavaScript code by
              translating human-readable code into machine-readable instructions. Every major
              browser embeds its own engine - Chrome uses V8, Firefox uses SpiderMonkey, and Safari
              uses JavaScriptCore.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The engine handles the core ECMAScript specification, managing fundamental language
              constructs like objects, functions, and control flow, while the runtime environment
              provides additional APIs and services.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">The V8 Advantage</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Google's V8 engine revolutionized JavaScript performance through innovative
              Just-in-Time (JIT) compilation. Unlike traditional interpreters, V8 compiles
              JavaScript directly to native machine code, achieving near-native performance.
            </p>
            <p className="text-gray-700 leading-relaxed">
              V8 powers not only Chrome but also Node.js, making it the backbone of both client-side
              and server-side JavaScript execution across millions of applications.
            </p>
          </div>
        </div>

        {/* Key Architecture Principles */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Core Architecture Principles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Single-Threaded Execution</h4>
              <p className="text-sm text-gray-700">
                The engine executes JavaScript on a single main thread using a Call Stack, ensuring
                predictable execution order and avoiding race conditions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">⚡ Just-in-Time Compilation</h4>
              <p className="text-sm text-gray-700">
                V8 combines fast startup through interpretation with high performance through
                optimizing compilation of frequently executed code.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🧠 Automatic Memory Management</h4>
              <p className="text-sm text-gray-700">
                Sophisticated garbage collection automatically reclaims memory from unused objects,
                preventing memory leaks without developer intervention.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🔄 Adaptive Optimization</h4>
              <p className="text-sm text-gray-700">
                The engine continuously profiles code execution and optimizes hot paths while
                maintaining the ability to deoptimize when assumptions change.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Engine Pipeline Visualization */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Interactive Engine Pipeline</h2>
          <div className="flex items-center space-x-4">
            <select
              value={activeDemo}
              onChange={(e) => setActiveDemo(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {engineComponents.map((component) => (
                <option key={component.id} value={component.id}>
                  {component.icon} {component.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {engineComponents[activeDemo].icon} {engineComponents[activeDemo].title}
            </h3>
            <p className="text-gray-700">{engineComponents[activeDemo].description}</p>
          </div>
        </div>

        {/* 2D Visualization Component */}
        <Engine2D activeDemo={activeDemo} onAnimationStateChange={setIsAnimating} />

        {isAnimating && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800 font-medium">Pipeline processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Engine Components Deep Dive */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Engine Components Breakdown</h2>

        <div className="grid gap-6">
          {/* Parser & AST */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  🔍 Parser & AST Generation
                </h3>
                <p className="text-gray-700 mb-4">
                  The first step in execution involves parsing source code into tokens and
                  constructing an Abstract Syntax Tree (AST). This structured representation serves
                  as the foundation for all subsequent compilation phases.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Key Processes:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      • <strong>Lexical Analysis:</strong> Breaking code into meaningful tokens
                    </li>
                    <li>
                      • <strong>Syntax Analysis:</strong> Building hierarchical AST structure
                    </li>
                    <li>
                      • <strong>Error Detection:</strong> Identifying syntax errors early
                    </li>
                    <li>
                      • <strong>Scope Resolution:</strong> Determining variable and function scopes
                    </li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => navigateToSubSection('Parser & AST')}
                className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Explore →
              </button>
            </div>
          </div>

          {/* Ignition Interpreter */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  ⚡ Ignition Interpreter
                </h3>
                <p className="text-gray-700 mb-4">
                  V8's interpreter quickly converts AST into bytecode for immediate execution. This
                  enables fast startup times while collecting runtime information for optimization
                  decisions.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Key Features:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      • <strong>Fast Startup:</strong> Immediate bytecode execution
                    </li>
                    <li>
                      • <strong>Memory Efficient:</strong> Compact bytecode representation
                    </li>
                    <li>
                      • <strong>Profiling:</strong> Gathering runtime type information
                    </li>
                    <li>
                      • <strong>Baseline Performance:</strong> Decent execution speed
                    </li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => navigateToSubSection('Ignition Interpreter')}
                className="ml-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Explore →
              </button>
            </div>
          </div>

          {/* TurboFan Optimizer */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  🚀 TurboFan Optimizer
                </h3>
                <p className="text-gray-700 mb-4">
                  The optimizing compiler that transforms frequently executed bytecode into highly
                  efficient machine code using advanced optimization techniques and runtime type
                  feedback.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Optimization Techniques:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      • <strong>Inline Caching:</strong> Fast property access optimization
                    </li>
                    <li>
                      • <strong>Function Inlining:</strong> Eliminating function call overhead
                    </li>
                    <li>
                      • <strong>Dead Code Elimination:</strong> Removing unused code paths
                    </li>
                    <li>
                      • <strong>Speculative Optimization:</strong> Making assumptions for speed
                    </li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => navigateToSubSection('TurboFan Optimizer')}
                className="ml-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Explore →
              </button>
            </div>
          </div>

          {/* Memory Architecture */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  🧠 Memory Architecture
                </h3>
                <p className="text-gray-700 mb-4">
                  V8's sophisticated memory management system includes the Call Stack for execution
                  context and the Memory Heap for dynamic object allocation, with automatic garbage
                  collection.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Memory Components:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      • <strong>Call Stack:</strong> Function execution and local variables
                    </li>
                    <li>
                      • <strong>Memory Heap:</strong> Dynamic object and closure storage
                    </li>
                    <li>
                      • <strong>Garbage Collector:</strong> Automatic memory reclamation
                    </li>
                    <li>
                      • <strong>Generational GC:</strong> Young and old generation optimization
                    </li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => navigateToSubSection('Memory Architecture')}
                className="ml-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Explore →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 mb-8 border border-green-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Performance Insights</h2>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-green-700 mb-3">🎯 Hot Code Optimization</h3>
            <p className="text-sm text-gray-700">
              V8 identifies frequently executed code ("hot spots") and aggressively optimizes them
              with TurboFan, achieving up to 100x performance improvements for critical paths.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">🔄 Adaptive Deoptimization</h3>
            <p className="text-sm text-gray-700">
              When optimized code's assumptions become invalid, V8 can quickly deoptimize back to
              bytecode, maintaining correctness while preserving optimization opportunities.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-purple-700 mb-3">⚡ Inline Caching</h3>
            <p className="text-sm text-gray-700">
              Property access optimization through caching of object shapes and property locations,
              dramatically reducing lookup time for object property access.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Optimization Best Practices</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✅ Engine-Friendly Patterns</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Use consistent object shapes (hidden classes)</li>
                <li>• Avoid changing variable types</li>
                <li>• Prefer monomorphic function calls</li>
                <li>• Use array methods over for loops when appropriate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-700 mb-2">❌ Performance Killers</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Changing object structure after creation</li>
                <li>• Using arguments object in functions</li>
                <li>• try/catch in hot code paths</li>
                <li>• eval() and with statements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Explore Engine Components</h2>
        <p className="text-xl text-gray-700 mb-6">
          Ready to dive deeper? Explore each engine component with interactive visualizations and
          detailed explanations.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigateToSubSection('Call Stack & Execution')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors"
          >
            <div className="text-2xl mb-2">📦</div>
            <h3 className="font-semibold text-gray-800">Call Stack & Execution</h3>
            <p className="text-sm text-gray-600 mt-1">Function execution and scope management</p>
          </button>

          <button
            onClick={() => navigateToSubSection('Memory Heap & Objects')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors"
          >
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-semibold text-gray-800">Memory Heap & Objects</h3>
            <p className="text-sm text-gray-600 mt-1">Object allocation and memory management</p>
          </button>

          <button
            onClick={() => navigateToSubSection('Parser & AST Generation')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors"
          >
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-semibold text-gray-800">Parser & AST Generation</h3>
            <p className="text-sm text-gray-600 mt-1">Source code parsing and tree construction</p>
          </button>

          <button
            onClick={() => navigateToSubSection('JIT Compilation Pipeline')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors"
          >
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-800">JIT Compilation Pipeline</h3>
            <p className="text-sm text-gray-600 mt-1">
              Ignition interpreter and TurboFan optimizer
            </p>
          </button>

          <button
            onClick={() => navigateToSubSection('Garbage Collection')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors"
          >
            <div className="text-2xl mb-2">🗑️</div>
            <h3 className="font-semibold text-gray-800">Garbage Collection</h3>
            <p className="text-sm text-gray-600 mt-1">Automatic memory cleanup and optimization</p>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Engine;
