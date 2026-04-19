import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Zap,
  Rocket,
  Database,
  Search,
  Layers,
  RefreshCw,
  Trash2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Building2,
} from 'lucide-react';
import Engine2D from '../visualizations/2d/Engine2D';

const Engine: React.FC = () => {
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const engineComponents = [
    {
      id: 0,
      title: 'V8 Engine Architecture',
      description: "Complete overview of V8's component architecture and pipeline",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 1,
      title: 'Parsing & AST Generation',
      description: 'Source code to Abstract Syntax Tree transformation',
      icon: <Search className="w-4 h-4" />,
    },
    {
      id: 2,
      title: 'Ignition Interpreter',
      description: 'AST to bytecode conversion and immediate execution',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 3,
      title: 'TurboFan Optimization',
      description: 'JIT compilation and machine code optimization',
      icon: <Rocket className="w-4 h-4" />,
    },
    {
      id: 4,
      title: 'Memory Architecture',
      description: 'Call Stack, Memory Heap, and object allocation',
      icon: <Database className="w-4 h-4" />,
    },
  ];

  const navigateToSubSection = (sectionName: string) => {
    navigate(`/javascript?section=${encodeURIComponent(sectionName)}`);
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
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
              <Cpu className="w-4 h-4" /> JIT Compilation
            </span>
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
              <Zap className="w-4 h-4" /> Ignition Interpreter
            </span>
            <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
              <Rocket className="w-4 h-4" /> TurboFan Optimizer
            </span>
            <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
              <Database className="w-4 h-4" /> Memory Management
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
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Single-Threaded Execution
              </h4>
              <p className="text-sm text-gray-700">
                The engine executes JavaScript on a single main thread using a Call Stack, ensuring
                predictable execution order and avoiding race conditions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Just-in-Time Compilation
              </h4>
              <p className="text-sm text-gray-700">
                V8 combines fast startup through interpretation with high performance through
                optimizing compilation of frequently executed code.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" /> Automatic Memory Management
              </h4>
              <p className="text-sm text-gray-700">
                Sophisticated garbage collection automatically reclaims memory from unused objects,
                preventing memory leaks without developer intervention.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Adaptive Optimization
              </h4>
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
                  {component.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {engineComponents[activeDemo].icon}
              </span>
              {engineComponents[activeDemo].title}
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
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Search className="w-4 h-4 text-blue-600" />
                  </span>
                  Parser & AST Generation
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
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-green-600" />
                  </span>
                  Ignition Interpreter
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
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-4 h-4 text-purple-600" />
                  </span>
                  TurboFan Optimizer
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
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Database className="w-4 h-4 text-orange-600" />
                  </span>
                  Memory Architecture
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
            <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Hot Code Optimization
            </h3>
            <p className="text-sm text-gray-700">
              V8 identifies frequently executed code ("hot spots") and aggressively optimizes them
              with TurboFan, achieving up to 100x performance improvements for critical paths.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" /> Adaptive Deoptimization
            </h3>
            <p className="text-sm text-gray-700">
              When optimized code's assumptions become invalid, V8 can quickly deoptimize back to
              bytecode, maintaining correctness while preserving optimization opportunities.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" /> Inline Caching
            </h3>
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
              <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Engine-Friendly Patterns
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Use consistent object shapes (hidden classes)</li>
                <li>• Avoid changing variable types</li>
                <li>• Prefer monomorphic function calls</li>
                <li>• Use array methods over for loops when appropriate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Performance Killers
              </h4>
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
            className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl p-5 text-left transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Call Stack & Execution</h3>
            <p className="text-sm text-gray-600 mt-1">Function execution and scope management</p>
          </button>

          <button
            onClick={() => navigateToSubSection('Memory Heap & Objects')}
            className="bg-white hover:bg-green-50 border border-gray-200 hover:border-green-200 rounded-xl p-5 text-left transition-colors group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Memory Heap & Objects</h3>
            <p className="text-sm text-gray-600 mt-1">Object allocation and memory management</p>
          </button>

          <button
            onClick={() => navigateToSubSection('Parser & AST Generation')}
            className="bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-xl p-5 text-left transition-colors group"
          >
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
              <Search className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Parser & AST Generation</h3>
            <p className="text-sm text-gray-600 mt-1">Source code parsing and tree construction</p>
          </button>

          <button
            onClick={() => navigateToSubSection('JIT Compilation Pipeline')}
            className="bg-white hover:bg-yellow-50 border border-gray-200 hover:border-yellow-200 rounded-xl p-5 text-left transition-colors group"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-yellow-200 transition-colors">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-800">JIT Compilation Pipeline</h3>
            <p className="text-sm text-gray-600 mt-1">
              Ignition interpreter and TurboFan optimizer
            </p>
          </button>

          <button
            onClick={() => navigateToSubSection('Garbage Collection')}
            className="bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl p-5 text-left transition-colors group"
          >
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-red-200 transition-colors">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Garbage Collection</h3>
            <p className="text-sm text-gray-600 mt-1">Automatic memory cleanup and optimization</p>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Engine;
