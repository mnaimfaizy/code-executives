import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';

const PythonPhilosophy: React.FC = () => {
  const [activePrinciple, setActivePrinciple] = useState<number | null>(null);

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Python Philosophy</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          The guiding principles that make Python elegant, readable, and powerful
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '19', label: 'Guiding Principles' },
          { value: '1994', label: 'Zen of Python Created' },
          { value: 'PEP 20', label: 'The Zen of Python' },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  const zenPrinciples = [
    {
      principle: 'Beautiful is better than ugly',
      explanation: 'Code should be aesthetically pleasing and elegant',
      example: 'Clean, readable code that follows consistent patterns',
      icon: '🎨',
    },
    {
      principle: 'Explicit is better than implicit',
      explanation: 'Make your intentions clear and avoid hidden behavior',
      example: 'Use explicit variable names and avoid magic methods when possible',
      icon: '📝',
    },
    {
      principle: 'Simple is better than complex',
      explanation: 'Prefer straightforward solutions over complicated ones',
      example: 'One obvious way to solve a problem vs. multiple complex approaches',
      icon: '🎯',
    },
    {
      principle: 'Complex is better than complicated',
      explanation: 'When complexity is necessary, it should be well-structured',
      example: "Complex algorithms are OK if they're properly organized",
      icon: '🧩',
    },
    {
      principle: 'Flat is better than nested',
      explanation: 'Avoid deep nesting of code structures',
      example: 'Early returns and guard clauses instead of deeply nested if statements',
      icon: '🏗️',
    },
    {
      principle: 'Sparse is better than dense',
      explanation: 'Use whitespace and spacing to improve readability',
      example: 'Proper indentation and spacing between logical sections',
      icon: '🌌',
    },
    {
      principle: 'Readability counts',
      explanation: "Code is read more often than it's written",
      example: 'Clear variable names, comments, and documentation',
      icon: '📖',
    },
    {
      principle: "Special cases aren't special enough to break the rules",
      explanation: 'Consistency is more important than accommodating edge cases',
      example: 'Follow established patterns even for unusual situations',
      icon: '⚖️',
    },
    {
      principle: 'Although practicality beats purity',
      explanation: 'Common sense can override theoretical perfection',
      example: 'Sometimes the practical solution is better than the theoretically perfect one',
      icon: '🎭',
    },
    {
      principle: 'Errors should never pass silently',
      explanation: 'Handle errors explicitly and informatively',
      example: 'Proper exception handling with meaningful error messages',
      icon: '🚨',
    },
    {
      principle: 'Unless explicitly silenced',
      explanation: 'Only ignore errors when you have a good reason',
      example: 'Use try/except blocks judiciously, not as a catch-all',
      icon: '🤫',
    },
    {
      principle: 'In the face of ambiguity, refuse the temptation to guess',
      explanation: 'When uncertain, ask for clarification rather than assuming',
      example: "Explicit is better than implicit - don't make assumptions",
      icon: '❓',
    },
    {
      principle: 'There should be one—and preferably only one—obvious way to do it',
      explanation: 'Python provides a single, clear way to accomplish tasks',
      example: 'No multiple syntaxes for the same operation',
      icon: '🎯',
    },
    {
      principle: "Although that way may not be obvious at first unless you're Dutch",
      explanation: 'Some Python idioms take time to learn but become natural',
      example: 'List comprehensions, generator expressions, and context managers',
      icon: '🇳🇱',
    },
    {
      principle: 'Now is better than never',
      explanation: "It's better to implement something now than to wait for perfection",
      example: 'Iterative development and continuous improvement',
      icon: '⏰',
    },
    {
      principle: 'Although never is often better than *right* now',
      explanation: 'Rushing can lead to poor decisions - timing matters',
      example: "Take time to design properly, but don't procrastinate indefinitely",
      icon: '⏳',
    },
    {
      principle: "If the implementation is hard to explain, it's a bad idea",
      explanation: "If you can't explain how your code works, it needs simplification",
      example: 'Complex code should be broken down into understandable parts',
      icon: '🤔',
    },
    {
      principle: 'If the implementation is easy to explain, it may be a good idea',
      explanation: 'Clear, explainable solutions are often the best solutions',
      example: 'Simplicity and clarity as markers of good design',
      icon: '💡',
    },
    {
      principle: "Namespaces are one honking great idea—let's do more of those!",
      explanation: 'Use namespaces to avoid naming conflicts and organize code',
      example: 'Modules, classes, and functions create clean namespaces',
      icon: '📦',
    },
  ];

  // Main content with cards and information
  const mainContent = (
    <>
      {/* The Zen of Python */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">☯️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">The Zen of Python (PEP 20)</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            The Zen of Python is a collection of 19 guiding principles that capture the philosophy
            behind Python's design. Written by Tim Peters in 1999, these aphorisms have shaped
            Python's development and community culture.
          </p>
          <p>
            These principles aren't rigid rules, but rather philosophical guidelines that help
            developers make decisions about code design, architecture, and problem-solving
            approaches.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800">
              <strong>Access the Zen:</strong> You can see these principles anytime by running
              <code className="bg-blue-100 px-2 py-1 rounded text-sm mx-1">import this</code>
              in a Python interpreter.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive Principles */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Explore the Principles</h3>
        <p className="text-gray-700 mb-6">
          Click on any principle below to see a detailed explanation and practical examples:
        </p>
        <div className="grid grid-cols-1 gap-3">
          {zenPrinciples.map((item, index) => (
            <div
              key={index}
              className={`border rounded-lg cursor-pointer transition-all duration-200 ${
                activePrinciple === index
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
              }`}
              onClick={() => setActivePrinciple(activePrinciple === index ? null : index)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <h4 className="font-semibold text-gray-900">{item.principle}</h4>
                  </div>
                  <svg
                    className={`w-5 h-5 text-blue-500 transition-transform ${
                      activePrinciple === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {activePrinciple === index && (
                  <div className="mt-4 pt-4 border-t border-blue-200 animate-in slide-in-from-top duration-300">
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-blue-900 mb-1">Explanation:</h5>
                        <p className="text-sm text-blue-800">{item.explanation}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-900 mb-1">Example:</h5>
                        <p className="text-sm text-blue-800">{item.example}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Design Philosophy in Practice */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Philosophy in Practice</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                Good Python (Following Zen)
              </h4>
              <pre className="text-xs bg-green-100 p-2 rounded text-green-800 overflow-x-auto">
                {`# Clear, readable, explicit
def calculate_total(items):
    """Calculate total price with tax."""
    subtotal = sum(item.price for item in items)
    tax_rate = 0.08  # 8% tax
    tax = subtotal * tax_rate
    return subtotal + tax`}
              </pre>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                <span className="text-red-600 mr-2">❌</span>
                Not Pythonic (Against Zen)
              </h4>
              <pre className="text-xs bg-red-100 p-2 rounded text-red-800 overflow-x-auto">
                {`# Unclear, implicit, complex
def calc(x):
    return sum([i[1]*i[2] for i in x]) * 1.08`}
              </pre>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">The Pythonic Way</h4>
            <p className="text-blue-800 text-sm mb-3">
              Pythonic code follows the Zen principles: it's readable, explicit, and elegant. The
              Python community values code that is not just functional, but also beautiful and
              maintainable.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-white rounded p-2">
                <div className="text-2xl mb-1">📖</div>
                <div className="text-xs font-medium">Readable</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs font-medium">Explicit</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-2xl mb-1">🧹</div>
                <div className="text-xs font-medium">Clean</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-2xl mb-1">💎</div>
                <div className="text-xs font-medium">Elegant</div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Python Philosophy</h3>
        <div className="text-sm text-gray-600 space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">The Zen of Python</h4>
            <p>19 guiding principles for Python development</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Design Philosophy</h4>
            <p>Readability, simplicity, and explicitness</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Pythonic Code</h4>
            <p>Writing code the Python way</p>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Principles</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Beautiful over ugly</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Explicit over implicit</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Simple over complex</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Readability counts</span>
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

export default PythonPhilosophy;
