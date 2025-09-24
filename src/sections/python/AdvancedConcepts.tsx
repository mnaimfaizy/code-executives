import React, { Suspense, useState, useRef, useEffect } from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import StatsGrid from '../../components/shared/StatsGrid';
import CTASection from '../../components/shared/CTASection';

// Import 2D visualizations (lighter weight)
import ExecutionFlow2D from '../../components/models2d/python/ExecutionFlow2D';
import MemoryModel2D from '../../components/models2d/python/MemoryModel2D';
import GILVisualization from '../../components/models2d/python/GILVisualization';
import GeneratorVisualization from '../../components/models2d/python/GeneratorVisualization';
import DecoratorVisualization from '../../components/models2d/python/DecoratorVisualization';

// Lazy load heavy 3D visualizations
const PythonVM3D = React.lazy(() => import('../../components/models3d/python/PythonVM3D'));
const MemoryProfiler3D = React.lazy(
  () => import('../../components/models3d/python/MemoryProfiler3D')
);
const CallGraph3D = React.lazy(() => import('../../components/models3d/python/CallGraph3D'));

// Error boundary for 3D visualizations
class VisualizationErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Visualization Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Progressive loading hook
const useProgressiveLoading = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// Enhanced loading component
const LoadingFallback: React.FC<{ color: string; message?: string }> = ({
  color,
  message = 'Loading 3D Visualization...',
}) => (
  <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
    <div className="text-center">
      <div
        className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${color}-600 mx-auto mb-4`}
      ></div>
      <p className="text-gray-600 font-medium">{message}</p>
      <p className="text-sm text-gray-500 mt-2">This may take a moment on slower connections</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="w-full h-96 bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
    <div className="text-center">
      <div className="text-red-500 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">Visualization Failed to Load</h3>
      <p className="text-red-600 mb-4">
        This might be due to browser compatibility or network issues.
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Progressive 3D component wrapper
const Progressive3DVisualization: React.FC<{
  children: React.ReactNode;
  color: string;
  title: string;
}> = ({ children, color, title }) => {
  const { ref, isVisible } = useProgressiveLoading();
  const [error, setError] = useState(false);

  const handleRetry = () => {
    setError(false);
    window.location.reload(); // Force reload to retry loading
  };

  return (
    <div ref={ref}>
      {!isVisible ? (
        <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div
              className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center mx-auto mb-4`}
            >
              <svg
                className={`w-6 h-6 text-${color}-600`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Scroll to load {title}</p>
            <p className="text-sm text-gray-500 mt-1">3D visualization will load when visible</p>
          </div>
        </div>
      ) : error ? (
        <ErrorFallback onRetry={handleRetry} />
      ) : (
        <VisualizationErrorBoundary fallback={<ErrorFallback onRetry={handleRetry} />}>
          <Suspense fallback={<LoadingFallback color={color} />}>{children}</Suspense>
        </VisualizationErrorBoundary>
      )}
    </div>
  );
};

const AdvancedConcepts: React.FC = () => {
  const stats = [
    { label: '2D Visualizations', value: '5', description: 'Interactive SVG models' },
    { label: '3D Visualizations', value: '3', description: 'Three.js 3D scenes' },
    { label: 'Educational Steps', value: '25+', description: 'Step-by-step learning' },
    { label: 'Concepts Covered', value: '8', description: 'Advanced Python topics' },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🧠 Advanced Python Concepts</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Dive deep into Python's most powerful features through interactive 2D and 3D
          visualizations. Explore generators, decorators, memory management, and execution models.
        </p>
      </div>
      <StatsGrid stats={stats} colorScheme="python" />
    </div>
  );

  const mainContent = (
    <>
      {/* 2D Visualizations Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          📊 2D Interactive Visualizations
        </h2>
        <div className="grid gap-8">
          {/* Execution Flow */}
          <ThemeCard className="p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                ⚡ Execution Flow & Call Stack
              </h3>
              <p className="text-gray-600">
                Visualize how Python executes code through its call stack and execution model
              </p>
            </div>
            <ExecutionFlow2D />
          </ThemeCard>

          {/* Memory Model */}
          <ThemeCard className="p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">🧠 Memory Model & Heap</h3>
              <p className="text-gray-600">
                Understand Python's memory management, reference counting, and garbage collection
              </p>
            </div>
            <MemoryModel2D />
          </ThemeCard>

          {/* Global Interpreter Lock */}
          <ThemeCard className="p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                🔒 Global Interpreter Lock (GIL)
              </h3>
              <p className="text-gray-600">
                Explore Python's GIL and its impact on threading and concurrency
              </p>
            </div>
            <GILVisualization />
          </ThemeCard>

          {/* Generators */}
          <ThemeCard className="p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">🔄 Python Generators</h3>
              <p className="text-gray-600">
                Learn lazy evaluation and memory-efficient iteration with generators
              </p>
            </div>
            <GeneratorVisualization />
          </ThemeCard>

          {/* Decorators */}
          <ThemeCard className="p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">🎨 Python Decorators</h3>
              <p className="text-gray-600">
                Understand function wrappers that modify behavior dynamically
              </p>
            </div>
            <DecoratorVisualization />
          </ThemeCard>
        </div>
      </div>

      {/* 3D Visualizations Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          🌐 3D Immersive Visualizations
        </h2>
        <div className="grid gap-8">
          {/* Python Virtual Machine */}
          <ThemeCard className="p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">🚀 Python Virtual Machine</h3>
              <p className="text-gray-600">
                3D exploration of Python's execution engine with bytecode, stack, and heap
              </p>
            </div>
            <Progressive3DVisualization color="blue" title="Python VM">
              <PythonVM3D />
            </Progressive3DVisualization>
          </ThemeCard>

          {/* Memory Profiler */}
          <ThemeCard className="p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">📊 Memory Profiler</h3>
              <p className="text-gray-600">
                3D visualization of memory allocation patterns and object lifecycle
              </p>
            </div>
            <Progressive3DVisualization color="green" title="Memory Profiler">
              <MemoryProfiler3D />
            </Progressive3DVisualization>
          </ThemeCard>

          {/* Call Graph */}
          <ThemeCard className="p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">🔗 Function Call Graph</h3>
              <p className="text-gray-600">
                3D representation of function relationships and execution flow patterns
              </p>
            </div>
            <Progressive3DVisualization color="purple" title="Call Graph">
              <CallGraph3D />
            </Progressive3DVisualization>
          </ThemeCard>
        </div>
      </div>
    </>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">🎯 Learning Objectives</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Understand Python's execution model</li>
            <li>• Master memory management concepts</li>
            <li>• Learn advanced language features</li>
            <li>• Explore concurrency limitations</li>
            <li>• Apply performance optimization techniques</li>
          </ul>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">📚 Key Concepts</h3>
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Execution Flow</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Memory Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">GIL & Threading</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Generators</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Decorators</span>
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">🛠️ Tools & Techniques</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Memory profiling</li>
            <li>• Performance optimization</li>
            <li>• Concurrent programming</li>
            <li>• Metaprogramming</li>
            <li>• Code introspection</li>
          </ul>
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout
        section="python"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready to Master Python?"
        description="You've explored Python's advanced concepts through interactive visualizations. Now apply these concepts in real projects and take your Python skills to the next level."
        buttonText="Explore Python Projects"
        onButtonClick={() => {
          // Navigate to projects or next section
          window.location.href = '/?section=python&subsection=projects';
        }}
        colorScheme="python"
      />
    </>
  );
};

export default AdvancedConcepts;
