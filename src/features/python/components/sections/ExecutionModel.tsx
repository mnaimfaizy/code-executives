import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';

const ExecutionModel: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Python Execution Model</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          How Python transforms source code into running programs
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '3', label: 'Execution Phases' },
          { value: '.pyc', label: 'Bytecode Files' },
          { value: 'CPython', label: 'Default Interpreter' },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  const executionSteps = [
    {
      title: 'Source Code (.py)',
      description: 'Human-readable Python code',
      details:
        'Your .py files contain the source code written in Python syntax. This is what you write and edit.',
      color: 'bg-blue-100 border-blue-300',
      textColor: 'text-blue-800',
      icon: '📝',
    },
    {
      title: 'Compilation to Bytecode',
      description: 'Source code → Bytecode (.pyc)',
      details:
        "Python compiles your source code into bytecode, an intermediate representation that's platform-independent.",
      color: 'bg-yellow-100 border-yellow-300',
      textColor: 'text-yellow-800',
      icon: '⚙️',
    },
    {
      title: 'Python Virtual Machine',
      description: 'Bytecode execution',
      details:
        'The PVM executes the bytecode instructions, managing memory, calling functions, and handling data.',
      color: 'bg-green-100 border-green-300',
      textColor: 'text-green-800',
      icon: '🚀',
    },
  ];

  // Interactive execution flow visualization
  const executionFlow = (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Execution Flow</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button
            onClick={() => setActiveStep(0)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Connection lines */}
        <div className="absolute top-16 left-1/3 w-1/3 h-0.5 bg-gray-300 -translate-y-1/2"></div>
        <div className="absolute top-32 left-1/3 w-1/3 h-0.5 bg-gray-300 -translate-y-1/2"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {executionSteps.map((step, index) => (
            <div
              key={index}
              className={`relative p-4 rounded-lg border-2 transition-all duration-500 cursor-pointer ${
                activeStep === index
                  ? `${step.color} shadow-lg scale-105`
                  : activeStep > index
                    ? 'bg-gray-100 border-gray-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setActiveStep(index)}
            >
              <div className="text-center mb-3">
                <div
                  className={`text-3xl mb-2 ${activeStep === index ? step.textColor : 'text-gray-400'}`}
                >
                  {step.icon}
                </div>
                <h4
                  className={`font-semibold ${activeStep === index ? step.textColor : 'text-gray-600'}`}
                >
                  {step.title}
                </h4>
              </div>

              <p
                className={`text-sm text-center mb-2 ${activeStep === index ? step.textColor : 'text-gray-500'}`}
              >
                {step.description}
              </p>

              {activeStep === index && (
                <div className="mt-3 p-2 bg-white bg-opacity-80 rounded text-xs animate-in slide-in-from-bottom duration-300">
                  {step.details}
                </div>
              )}

              {/* Step indicator */}
              <div
                className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep > index
                    ? 'bg-green-500 text-white'
                    : activeStep === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* Execution Overview */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">⚡</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">How Python Executes Code</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Python uses a unique execution model that combines compilation and interpretation.
            Unlike languages that compile directly to machine code, Python compiles to bytecode
            which is then executed by the Python Virtual Machine (PVM).
          </p>
          <p>
            This approach provides several benefits: platform independence, dynamic typing, and the
            ability to execute code interactively. However, it also means Python programs generally
            run slower than compiled languages like C++ or Java.
          </p>
        </div>
      </ThemeCard>

      {/* Interactive Execution Flow */}
      <ThemeCard>{executionFlow}</ThemeCard>

      {/* Detailed Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Code Analysis */}
        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-blue-500 mr-2">📝</span>
            Source Code Analysis
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-semibold text-blue-900 mb-1">Lexical Analysis</h4>
              <p>Breaks source code into tokens (keywords, identifiers, operators, etc.)</p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-semibold text-blue-900 mb-1">Parsing</h4>
              <p>Creates an Abstract Syntax Tree (AST) representing the code structure</p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-semibold text-blue-900 mb-1">Symbol Table</h4>
              <p>Tracks variable names, functions, and their scopes</p>
            </div>
          </div>
        </ThemeCard>

        {/* Bytecode Generation */}
        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-yellow-500 mr-2">⚙️</span>
            Bytecode Generation
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-yellow-50 p-3 rounded">
              <h4 className="font-semibold text-yellow-900 mb-1">Code Objects</h4>
              <p>Compiled bytecode stored in code objects with metadata</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <h4 className="font-semibold text-yellow-900 mb-1">.pyc Files</h4>
              <p>Cached bytecode files for faster subsequent executions</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <h4 className="font-semibold text-yellow-900 mb-1">Optimization</h4>
              <p>Basic optimizations like constant folding and peephole optimization</p>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* Python Virtual Machine */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-green-500 mr-2">🚀</span>
          Python Virtual Machine (PVM)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Core Components</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>
                  <strong>Stack-based execution:</strong> Uses evaluation stack for operations
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>
                  <strong>Frame objects:</strong> Represent function call execution context
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>
                  <strong>Garbage collection:</strong> Automatic memory management
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>
                  <strong>Dynamic typing:</strong> Runtime type checking and conversion
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Execution Example</h4>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
              <div>LOAD_CONST 1</div>
              <div>LOAD_CONST 2</div>
              <div>BINARY_ADD</div>
              <div>STORE_NAME 'result'</div>
              <div>LOAD_CONST None</div>
              <div>RETURN_VALUE</div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Bytecode for: result = 1 + 2</p>
          </div>
        </div>
      </ThemeCard>

      {/* Performance Characteristics */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Characteristics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl mb-2">🐌</div>
            <h4 className="font-semibold text-red-900 mb-1">Slower Startup</h4>
            <p className="text-xs text-red-800">Compilation step before execution</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl mb-2">⚖️</div>
            <h4 className="font-semibold text-yellow-900 mb-1">Balanced Runtime</h4>
            <p className="text-xs text-yellow-800">JIT compilation in some implementations</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">🔄</div>
            <h4 className="font-semibold text-green-900 mb-1">Fast Development</h4>
            <p className="text-xs text-green-800">No separate compilation step</p>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Execution Model</h3>
        <div className="text-sm text-gray-600 space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Three Phases</h4>
            <p>Source → Bytecode → Execution</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Key Components</h4>
            <p>Compiler, PVM, and runtime</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Performance</h4>
            <p>Trade-offs and optimizations</p>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Execution Steps</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${activeStep >= 0 ? 'bg-blue-400' : 'bg-gray-300'}`}
            ></div>
            <span>Source Code</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${activeStep >= 1 ? 'bg-yellow-400' : 'bg-gray-300'}`}
            ></div>
            <span>Bytecode Compilation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${activeStep >= 2 ? 'bg-green-400' : 'bg-gray-300'}`}
            ></div>
            <span>PVM Execution</span>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  return (
    <SectionLayout
      section="python"
      hero={heroContent}
      mainContent={mainContent}
      sidebar={sidebarContent}
    />
  );
};

export default ExecutionModel;
