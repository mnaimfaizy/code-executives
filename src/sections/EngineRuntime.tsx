import React, { useState, useEffect } from 'react';

interface AnimationState {
  engineStep: number;
  runtimeStep: number;
  isPlaying: boolean;
}

const EngineRuntime: React.FC = () => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    engineStep: 0,
    runtimeStep: 0,
    isPlaying: false,
  });

  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/javascript?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  const startAnimation = () => {
    setAnimationState(prev => ({ ...prev, isPlaying: true, engineStep: 0, runtimeStep: 0 }));
  };

  const stopAnimation = () => {
    setAnimationState(prev => ({ ...prev, isPlaying: false }));
  };

  useEffect(() => {
    if (!animationState.isPlaying) return;

    const interval = setInterval(() => {
      setAnimationState(prev => {
        const nextEngineStep = (prev.engineStep + 1) % 5;
        const nextRuntimeStep = (prev.runtimeStep + 1) % 6;
        
        if (nextEngineStep === 0 && nextRuntimeStep === 0) {
          return { ...prev, isPlaying: false };
        }
        
        return {
          ...prev,
          engineStep: nextEngineStep,
          runtimeStep: nextRuntimeStep,
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [animationState.isPlaying]);

  const EngineVisualization = () => (
    <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">V8</span>
        </div>
        JavaScript Engine
      </h3>
      
      <div className="mb-6">
        <svg viewBox="0 0 400 300" className="w-full h-48 border border-gray-200 rounded-lg bg-gray-50">
          {/* Source Code Input */}
          <rect 
            x="10" y="10" width="80" height="40" 
            rx="5" 
            fill={animationState.engineStep >= 1 ? "#3b82f6" : "#e5e7eb"}
            className="transition-all duration-300"
          />
          <text x="50" y="35" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
            Source Code
          </text>
          
          {/* Arrow 1 */}
          <path 
            d="M90 30 L120 30" 
            stroke={animationState.engineStep >= 1 ? "#3b82f6" : "#9ca3af"} 
            strokeWidth="2" 
            markerEnd="url(#arrowhead)"
            className="transition-all duration-300"
          />
          
          {/* Parser */}
          <rect 
            x="120" y="10" width="60" height="40" 
            rx="5" 
            fill={animationState.engineStep >= 2 ? "#10b981" : "#e5e7eb"}
            className="transition-all duration-300"
          />
          <text x="150" y="35" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
            Parser
          </text>
          
          {/* Arrow 2 */}
          <path 
            d="M180 30 L210 30" 
            stroke={animationState.engineStep >= 2 ? "#10b981" : "#9ca3af"} 
            strokeWidth="2" 
            markerEnd="url(#arrowhead)"
            className="transition-all duration-300"
          />
          
          {/* AST */}
          <rect 
            x="210" y="10" width="50" height="40" 
            rx="5" 
            fill={animationState.engineStep >= 3 ? "#f59e0b" : "#e5e7eb"}
            className="transition-all duration-300"
          />
          <text x="235" y="35" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
            AST
          </text>
          
          {/* Arrow 3 */}
          <path 
            d="M260 30 L290 30" 
            stroke={animationState.engineStep >= 3 ? "#f59e0b" : "#9ca3af"} 
            strokeWidth="2" 
            markerEnd="url(#arrowhead)"
            className="transition-all duration-300"
          />
          
          {/* Ignition Interpreter */}
          <rect 
            x="290" y="10" width="70" height="40" 
            rx="5" 
            fill={animationState.engineStep >= 4 ? "#8b5cf6" : "#e5e7eb"}
            className="transition-all duration-300"
          />
          <text x="325" y="35" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
            Ignition
          </text>
          
          {/* Arrow down */}
          <path 
            d="M325 50 L325 80" 
            stroke={animationState.engineStep >= 4 ? "#8b5cf6" : "#9ca3af"} 
            strokeWidth="2" 
            markerEnd="url(#arrowhead)"
            className="transition-all duration-300"
          />
          
          {/* Bytecode */}
          <rect 
            x="290" y="80" width="70" height="40" 
            rx="5" 
            fill={animationState.engineStep >= 4 ? "#06b6d4" : "#e5e7eb"}
            className="transition-all duration-300"
          />
          <text x="325" y="105" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
            Bytecode
          </text>
          
          {/* Arrow to TurboFan */}
          <path 
            d="M290 100 L220 100" 
            stroke={animationState.engineStep >= 5 ? "#ef4444" : "#9ca3af"} 
            strokeWidth="2" 
            markerEnd="url(#arrowhead)"
            className="transition-all duration-300"
          />
          
          {/* TurboFan Compiler */}
          <rect 
            x="150" y="80" width="70" height="40" 
            rx="5" 
            fill={animationState.engineStep >= 5 ? "#ef4444" : "#e5e7eb"}
            className="transition-all duration-300"
          />
          <text x="185" y="105" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
            TurboFan
          </text>
          
          {/* Arrow down to Machine Code */}
          <path 
            d="M185 120 L185 150" 
            stroke={animationState.engineStep >= 5 ? "#ef4444" : "#9ca3af"} 
            strokeWidth="2" 
            markerEnd="url(#arrowhead)"
            className="transition-all duration-300"
          />
          
          {/* Machine Code */}
          <rect 
            x="150" y="150" width="70" height="40" 
            rx="5" 
            fill={animationState.engineStep >= 5 ? "#dc2626" : "#e5e7eb"}
            className="transition-all duration-300"
          />
          <text x="185" y="175" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
            Machine Code
          </text>
          
          {/* Call Stack */}
          <rect 
            x="10" y="80" width="60" height="80" 
            rx="5" 
            fill="#fbbf24" 
            opacity="0.8"
          />
          <text x="40" y="125" textAnchor="middle" fontSize="9" fill="#92400e" fontWeight="bold">
            Call Stack
          </text>
          
          {/* Memory Heap */}
          <rect 
            x="80" y="80" width="60" height="80" 
            rx="5" 
            fill="#34d399" 
            opacity="0.8"
          />
          <text x="110" y="125" textAnchor="middle" fontSize="9" fill="#065f46" fontWeight="bold">
            Memory Heap
          </text>
          
          {/* Arrow markers */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                    refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
          </defs>
          
          {/* Labels */}
          <text x="200" y="280" textAnchor="middle" fontSize="12" fill="#374151" fontWeight="bold">
            V8 Engine: ECMAScript Implementation
          </text>
        </svg>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-700"><strong>Core Responsibility:</strong> Parse, compile, and execute JavaScript code</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-700"><strong>JIT Compilation:</strong> Ignition interpreter + TurboFan optimizer</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-sm text-gray-700"><strong>Memory Management:</strong> Call Stack + Memory Heap + Garbage Collection</span>
        </div>
      </div>
    </div>
  );

  const RuntimeVisualization = () => (
    <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">RT</span>
        </div>
        JavaScript Runtime
      </h3>
      
      <div className="mb-6">
        <svg viewBox="0 0 400 300" className="w-full h-48 border border-gray-200 rounded-lg bg-gray-50">
          {/* V8 Engine (compact) */}
          <rect 
            x="10" y="10" width="100" height="60" 
            rx="5" 
            fill="#3b82f6" 
            opacity="0.8"
          />
          <text x="60" y="45" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
            V8 Engine
          </text>
          
          {/* Web APIs */}
          <rect 
            x="130" y="10" width="80" height="60" 
            rx="5" 
            fill={animationState.runtimeStep >= 1 ? "#10b981" : "#e5e7eb"}
            className="transition-all duration-300"
          />
          <text x="170" y="35" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
            Web APIs
          </text>
          <text x="170" y="50" textAnchor="middle" fontSize="8" fill="white">
            setTimeout, fetch
          </text>
          
          {/* Event Loop */}
          <circle 
            cx="320" cy="150" r="30" 
            fill={animationState.runtimeStep >= 2 ? "#f59e0b" : "#e5e7eb"}
            className="transition-all duration-300"
          />
          <text x="320" y="155" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
            Event Loop
          </text>
          
          {/* Callback Queue (Macrotask) */}
          <rect 
            x="10" y="100" width="100" height="40" 
            rx="5" 
            fill={animationState.runtimeStep >= 3 ? "#8b5cf6" : "#e5e7eb"}
            className="transition-all duration-300"
          />
          <text x="60" y="125" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
            Macrotask Queue
          </text>
          
          {/* Microtask Queue */}
          <rect 
            x="10" y="150" width="100" height="40" 
            rx="5" 
            fill={animationState.runtimeStep >= 4 ? "#ef4444" : "#e5e7eb"}
            className="transition-all duration-300"
          />
          <text x="60" y="175" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
            Microtask Queue
          </text>
          
          {/* Call Stack (in runtime context) */}
          <rect 
            x="130" y="100" width="80" height="90" 
            rx="5" 
            fill={animationState.runtimeStep >= 5 ? "#06b6d4" : "#e5e7eb"}
            className="transition-all duration-300"
          />
          <text x="170" y="150" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
            Call Stack
          </text>
          
          {/* Arrows showing flow */}
          <path 
            d="M210 40 L290 130" 
            stroke={animationState.runtimeStep >= 1 ? "#10b981" : "#9ca3af"} 
            strokeWidth="2" 
            markerEnd="url(#arrowhead2)"
            className="transition-all duration-300"
          />
          
          <path 
            d="M290 150 L220 150" 
            stroke={animationState.runtimeStep >= 2 ? "#f59e0b" : "#9ca3af"} 
            strokeWidth="2" 
            markerEnd="url(#arrowhead2)"
            className="transition-all duration-300"
          />
          
          <path 
            d="M110 120 L290 140" 
            stroke={animationState.runtimeStep >= 3 ? "#8b5cf6" : "#9ca3af"} 
            strokeWidth="2" 
            markerEnd="url(#arrowhead2)"
            className="transition-all duration-300"
          />
          
          <path 
            d="M110 170 L290 160" 
            stroke={animationState.runtimeStep >= 4 ? "#ef4444" : "#9ca3af"} 
            strokeWidth="2" 
            markerEnd="url(#arrowhead2)"
            className="transition-all duration-300"
          />
          
          {/* Arrow markers */}
          <defs>
            <marker id="arrowhead2" markerWidth="10" markerHeight="7" 
                    refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
          </defs>
          
          {/* Labels */}
          <text x="200" y="280" textAnchor="middle" fontSize="12" fill="#374151" fontWeight="bold">
            Runtime: Engine + Environment APIs + Event Loop
          </text>
        </svg>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-sm text-gray-700"><strong>Core Responsibility:</strong> Provide complete execution environment</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-700"><strong>Environment APIs:</strong> Browser (DOM, fetch) or Node.js (fs, http)</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-sm text-gray-700"><strong>Async Coordination:</strong> Event Loop manages queues and execution</span>
        </div>
      </div>
    </div>
  );

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-200 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Engine vs Runtime: The Critical Distinction
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            Understanding the difference between the JavaScript engine and runtime environment is crucial for mastering how JavaScript really works under the hood.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">V8</span>
                </div>
              </div>
              <h3 className="font-bold text-blue-800 mb-2">JavaScript Engine</h3>
              <p className="text-sm text-blue-600">
                Parses, compiles, and executes ECMAScript code with Call Stack and Memory Heap
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">RT</span>
                </div>
              </div>
              <h3 className="font-bold text-purple-800 mb-2">JavaScript Runtime</h3>
              <p className="text-sm text-purple-600">
                Engine + Environment APIs + Event Loop providing complete execution environment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Theory Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Engine Theory */}
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">⚙️</span>
            </div>
            The JavaScript Engine
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              A JavaScript engine is the program responsible for <strong>translating human-readable JavaScript code into machine-readable instructions</strong> that a computer's hardware can execute. The engine acts as a crucial intermediary between developer code and the underlying machine.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Core Components</h3>
              <ul className="space-y-2 text-blue-700">
                <li><strong>Call Stack:</strong> LIFO structure managing function execution order</li>
                <li><strong>Memory Heap:</strong> Unstructured pool storing objects and variables</li>
                <li><strong>Parser:</strong> Converts source code to Abstract Syntax Tree (AST)</li>
                <li><strong>JIT Compiler:</strong> Ignition interpreter + TurboFan optimizer</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">V8 Engine Pipeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">1</div>
                  <span><strong>Parsing:</strong> Source Code → Abstract Syntax Tree (AST)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">2</div>
                  <span><strong>Ignition:</strong> AST → Bytecode (fast startup)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded text-white text-xs flex items-center justify-center font-bold">3</div>
                  <span><strong>Profiling:</strong> Identify "hot spots" and gather type feedback</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">4</div>
                  <span><strong>TurboFan:</strong> Bytecode → Optimized Machine Code</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 italic">
              <strong>Key Insight:</strong> The engine implements the ECMAScript specification but provides no I/O capabilities - it's purely about code execution.
            </p>
          </div>
        </div>

        {/* Runtime Theory */}
        <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">🌐</span>
            </div>
            The JavaScript Runtime
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              The JavaScript runtime is the <strong>complete execution environment</strong> that hosts the engine and provides critical external functionalities needed for a program to interact with the outside world. It's the engine plus everything else needed to run JavaScript applications.
            </p>
            
            <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Runtime Components</h3>
              <ul className="space-y-2 text-purple-700">
                <li><strong>JavaScript Engine:</strong> The core execution component (V8, SpiderMonkey, etc.)</li>
                <li><strong>Environment APIs:</strong> Browser (DOM, fetch) or Node.js (fs, http)</li>
                <li><strong>Event Loop:</strong> Manages asynchronous operations and queues</li>
                <li><strong>Task Queues:</strong> Macrotask and Microtask queues for callbacks</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Runtime Examples</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-lg">🌐</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Browser Runtime</h4>
                    <p className="text-sm text-gray-600">V8 + Web APIs + DOM + Event Loop</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-lg">🚀</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Node.js Runtime</h4>
                    <p className="text-sm text-gray-600">V8 + libuv + fs/http APIs + Event Loop</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 italic">
              <strong>Key Insight:</strong> The runtime determines what your JavaScript can actually do - the engine just executes the core language features.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Comparison */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Interactive Comparison</h2>
          <div className="flex space-x-3">
            <button
              onClick={startAnimation}
              disabled={animationState.isPlaying}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>▶️</span>
              <span>Play Animation</span>
            </button>
            <button
              onClick={stopAnimation}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <span>⏹️</span>
              <span>Stop</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EngineVisualization />
          <RuntimeVisualization />
        </div>
      </div>

      {/* Key Differences Table */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Engine vs Runtime Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Aspect</th>
                <th className="text-left py-3 px-4 font-semibold text-blue-700">JavaScript Engine</th>
                <th className="text-left py-3 px-4 font-semibold text-purple-700">JavaScript Runtime</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-900">Purpose</td>
                <td className="py-3 px-4 text-gray-700">Parse, compile, and execute JavaScript code</td>
                <td className="py-3 px-4 text-gray-700">Provide complete environment for program execution</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-900">Core Standard</td>
                <td className="py-3 px-4 text-gray-700">ECMA-262 (ECMAScript)</td>
                <td className="py-3 px-4 text-gray-700">Host-specific (HTML standard, Node.js APIs)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-900">Key Components</td>
                <td className="py-3 px-4 text-gray-700">Call Stack, Memory Heap, Parser, JIT Compiler</td>
                <td className="py-3 px-4 text-gray-700">Engine + Web APIs + Event Loop + Queues</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-900">Example APIs</td>
                <td className="py-3 px-4 text-gray-700">Object, Array, Promise, switch statement</td>
                <td className="py-3 px-4 text-gray-700">setTimeout(), fetch(), DOM APIs, fs.readFile()</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-gray-900">Examples</td>
                <td className="py-3 px-4 text-gray-700">V8, SpiderMonkey, JavaScriptCore</td>
                <td className="py-3 px-4 text-gray-700">Chrome Browser, Node.js, Deno</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Exploration Links */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Related Concepts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigateToSection('Call Stack')}
            className="p-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors group text-left"
          >
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center mr-2">
                <span className="text-blue-700 text-sm">📚</span>
              </div>
              <h3 className="font-semibold text-blue-800 group-hover:text-blue-900">Call Stack</h3>
            </div>
            <p className="text-xs text-blue-600">LIFO execution tracking</p>
          </button>

          <button
            onClick={() => navigateToSection('Memory Heap')}
            className="p-4 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors group text-left"
          >
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center mr-2">
                <span className="text-green-700 text-sm">🧠</span>
              </div>
              <h3 className="font-semibold text-green-800 group-hover:text-green-900">Memory Heap</h3>
            </div>
            <p className="text-xs text-green-600">Object storage pool</p>
          </button>

          <button
            onClick={() => navigateToSection('Event Loop')}
            className="p-4 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors group text-left"
          >
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center mr-2">
                <span className="text-purple-700 text-sm">🔄</span>
              </div>
              <h3 className="font-semibold text-purple-800 group-hover:text-purple-900">Event Loop</h3>
            </div>
            <p className="text-xs text-purple-600">Async orchestrator</p>
          </button>

          <button
            onClick={() => navigateToSection('Memory Management')}
            className="p-4 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors group text-left"
          >
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center mr-2">
                <span className="text-red-700 text-sm">🗑️</span>
              </div>
              <h3 className="font-semibold text-red-800 group-hover:text-red-900">Memory Mgmt</h3>
            </div>
            <p className="text-xs text-red-600">Garbage collection</p>
          </button>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="text-center max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Master the Foundation</h3>
          <p className="text-blue-100 mb-6 leading-relaxed">
            Understanding the engine-runtime distinction is crucial for debugging performance issues, 
            optimizing code execution, and building efficient JavaScript applications. The engine handles 
            the language itself, while the runtime provides the environment and APIs that make real applications possible.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl mb-2">⚙️</div>
              <div className="font-semibold">Engine Mastery</div>
              <div className="text-sm text-blue-200">JIT compilation, Call Stack, Memory Heap</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌐</div>
              <div className="font-semibold">Runtime Understanding</div>
              <div className="text-sm text-blue-200">Event Loop, APIs, async coordination</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-semibold">Performance Optimization</div>
              <div className="text-sm text-blue-200">Efficient code patterns and execution</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngineRuntime;
