import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';

// Import 2D visualizations (lighter weight)
import ExecutionFlow2D from '../visualizations/2d/ExecutionFlow2D';
import MemoryModel2D from '../visualizations/2d/MemoryModel2D';
import GILVisualization from '../visualizations/2d/GILVisualization';
import GeneratorVisualization from '../visualizations/2d/GeneratorVisualization';
import DecoratorVisualization from '../visualizations/2d/DecoratorVisualization';

const AdvancedConcepts: React.FC = () => {
  const stats = [
    { label: '2D Visualizations', value: '5', description: 'Interactive SVG models' },
    { label: 'Educational Steps', value: '25+', description: 'Step-by-step learning' },
    { label: 'Concepts Covered', value: '8', description: 'Advanced Python topics' },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🧠 Advanced Python Concepts</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Dive deep into Python's most powerful features through interactive 2D visualizations.
          Explore generators, decorators, memory management, and execution models.
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
