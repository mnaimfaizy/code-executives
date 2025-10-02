import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import { Shield, Target, Layers, Code, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';

const DesignPrinciples: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/systemdesign?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-purple-100 p-4 rounded-full">
          <Shield className="w-16 h-16 text-purple-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Design Principles & Architectural Governance
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Master the fundamental principles that guide software architecture decisions. From SOLID
        principles to architectural governance, learn how to build systems that are maintainable,
        scalable, and future-proof.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          🎯 SOLID Principles
        </span>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          🏛️ Architectural Patterns
        </span>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          📋 Governance Frameworks
        </span>
        <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔧 Technical Debt Management
        </span>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* SOLID Principles */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">SOLID Principles</h2>
            <p className="text-gray-600">Five fundamental principles for object-oriented design</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Single Responsibility Principle */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                S
              </div>
              <h3 className="text-lg font-semibold text-blue-800">Single Responsibility</h3>
            </div>
            <p className="text-blue-700 text-sm mb-4">
              A class should have only one reason to change. Each class should focus on a single
              responsibility.
            </p>
            <div className="bg-blue-200 p-3 rounded text-xs">
              <strong>Example:</strong> A UserService should only handle user operations, not email
              sending or logging.
            </div>
          </div>

          {/* Open-Closed Principle */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                O
              </div>
              <h3 className="text-lg font-semibold text-green-800">Open-Closed</h3>
            </div>
            <p className="text-green-700 text-sm mb-4">
              Software entities should be open for extension but closed for modification.
            </p>
            <div className="bg-green-200 p-3 rounded text-xs">
              <strong>Example:</strong> Use interfaces and inheritance to add new functionality
              without changing existing code.
            </div>
          </div>

          {/* Liskov Substitution Principle */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                L
              </div>
              <h3 className="text-lg font-semibold text-purple-800">Liskov Substitution</h3>
            </div>
            <p className="text-purple-700 text-sm mb-4">
              Subtypes must be substitutable for their base types without altering program
              correctness.
            </p>
            <div className="bg-purple-200 p-3 rounded text-xs">
              <strong>Example:</strong> A Square class inheriting from Rectangle must maintain
              Rectangle's contract.
            </div>
          </div>

          {/* Interface Segregation Principle */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                I
              </div>
              <h3 className="text-lg font-semibold text-orange-800">Interface Segregation</h3>
            </div>
            <p className="text-orange-700 text-sm mb-4">
              Clients should not be forced to depend on interfaces they don't use.
            </p>
            <div className="bg-orange-200 p-3 rounded text-xs">
              <strong>Example:</strong> Split large interfaces into smaller, specific ones for
              different clients.
            </div>
          </div>

          {/* Dependency Inversion Principle */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                D
              </div>
              <h3 className="text-lg font-semibold text-red-800">Dependency Inversion</h3>
            </div>
            <p className="text-red-700 text-sm mb-4">
              High-level modules should not depend on low-level modules. Both should depend on
              abstractions.
            </p>
            <div className="bg-red-200 p-3 rounded text-xs">
              <strong>Example:</strong> Use dependency injection and interfaces to decouple
              high-level business logic from low-level implementations.
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Why SOLID Matters</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-800 mb-2">✅ Benefits</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Easier testing and maintenance</li>
                <li>• Reduced coupling between components</li>
                <li>• Improved code reusability</li>
                <li>• Better separation of concerns</li>
                <li>• More flexible and extensible systems</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-800 mb-2">❌ Without SOLID</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Rigid, hard-to-change code</li>
                <li>• Fragile systems that break easily</li>
                <li>• Immobile code that's hard to reuse</li>
                <li>• Complex dependencies and coupling</li>
                <li>• Difficult testing and debugging</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Architectural Governance */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Layers className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Architectural Governance</h2>
            <p className="text-gray-600">
              Establishing frameworks for architectural decision-making
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Governance Frameworks</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Architecture Review Board (ARB)
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Cross-functional team that reviews and approves architectural decisions.
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Composition:</strong> Architects, tech leads, product managers, key
                  developers
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Architecture Decision Records (ADRs)
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Documentation of architectural decisions and their rationale.
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Benefits:</strong> Historical context, knowledge sharing, decision
                  transparency
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Fitness Functions</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Automated tests that verify architectural characteristics.
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Examples:</strong> Performance tests, security scans, coupling metrics
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quality Attributes</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Maintainability:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    How easily the system can be modified
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Scalability:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Ability to handle increased load
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Reliability:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    System availability and fault tolerance
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Security:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Protection against threats and vulnerabilities
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Performance:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Response time and resource utilization
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Technical Debt Management */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-orange-100 p-3 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Technical Debt Management</h2>
            <p className="text-gray-600">Balancing speed and quality in software development</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Types of Technical Debt</h3>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Deliberate Debt</h4>
                <p className="text-red-700 text-sm">
                  Conscious decisions to take shortcuts for speed, with plans to refactor later.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Accidental Debt</h4>
                <p className="text-yellow-700 text-sm">
                  Unintentional debt from poor practices, lack of knowledge, or changing
                  requirements.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Bit Rot</h4>
                <p className="text-blue-700 text-sm">
                  Gradual deterioration as the codebase ages and becomes outdated.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Debt Management Strategies</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Regular Refactoring:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Allocate time for code improvements
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Debt Sprints:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Dedicated iterations for technical debt
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Code Reviews:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Prevent debt accumulation through quality gates
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Automated Testing:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Safety net for refactoring and changes
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Technical Debt Backlog:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Track and prioritize debt items
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                The Cost of Technical Debt
              </h3>
              <p className="text-orange-700 text-sm mb-3">
                Technical debt compounds over time, making future changes more expensive and risky.
                The longer debt is left unpaid, the higher the interest rate becomes.
              </p>
              <div className="text-sm text-orange-700">
                <strong>Rule of Thumb:</strong> Address technical debt when the cost of fixing it is
                less than the cost of maintaining it. Regular small payments prevent large interest
                charges.
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Design Patterns */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-100 p-3 rounded-lg">
            <Code className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Essential Design Patterns</h2>
            <p className="text-gray-600">Proven solutions to common design problems</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Creational Patterns</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong className="text-blue-700">Singleton:</strong> Single instance globally
              </div>
              <div>
                <strong className="text-blue-700">Factory:</strong> Object creation abstraction
              </div>
              <div>
                <strong className="text-blue-700">Builder:</strong> Complex object construction
              </div>
              <div>
                <strong className="text-blue-700">Prototype:</strong> Object cloning
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Structural Patterns</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong className="text-green-700">Adapter:</strong> Interface compatibility
              </div>
              <div>
                <strong className="text-green-700">Decorator:</strong> Dynamic behavior addition
              </div>
              <div>
                <strong className="text-green-700">Facade:</strong> Simplified interface
              </div>
              <div>
                <strong className="text-green-700">Composite:</strong> Tree structures
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Behavioral Patterns</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong className="text-purple-700">Observer:</strong> Event notification
              </div>
              <div>
                <strong className="text-purple-700">Strategy:</strong> Algorithm selection
              </div>
              <div>
                <strong className="text-purple-700">Command:</strong> Request encapsulation
              </div>
              <div>
                <strong className="text-purple-700">Template Method:</strong> Algorithm skeleton
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">When to Use Design Patterns</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-green-800 mb-2">✅ Good Candidates</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• Solving a problem that occurs repeatedly</li>
                <li>• Need for flexibility and extensibility</li>
                <li>• Complex business logic or workflows</li>
                <li>• Integration with external systems</li>
                <li>• Performance-critical code sections</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-800 mb-2">❌ Avoid When</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• Simple CRUD operations</li>
                <li>• One-off solutions</li>
                <li>• Over-engineering simple problems</li>
                <li>• Patterns would add unnecessary complexity</li>
                <li>• Team lacks pattern knowledge</li>
              </ul>
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Design Mastery</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Architecture Patterns"
            description="Monolithic vs microservices comparison"
            colorScheme="purple"
            onClick={() => navigateToSection('Architecture Patterns')}
          />
          <NavigationCard
            title="Distributed Systems"
            description="CAP theorem and consistency models"
            colorScheme="purple"
            onClick={() => navigateToSection('Distributed Systems')}
          />
          <NavigationCard
            title="Scaling Strategies"
            description="Horizontal vs vertical scaling"
            colorScheme="purple"
            onClick={() => navigateToSection('Scaling Strategies')}
          />
          <NavigationCard
            title="Interactive Architecture Demo"
            description="Visualize design principles in action"
            colorScheme="purple"
            onClick={() => navigateToSection('Interactive Architecture Demo')}
          />
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Recommended Reading</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <strong className="text-purple-800">"Clean Architecture"</strong>
            <div className="text-gray-600">Robert C. Martin</div>
          </div>
          <div>
            <strong className="text-purple-800">"Design Patterns"</strong>
            <div className="text-gray-600">Gang of Four</div>
          </div>
          <div>
            <strong className="text-purple-800">"Building Microservices"</strong>
            <div className="text-gray-600">Sam Newman</div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout
        section="systemdesign"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Explore Architecture Patterns and Scaling"
        description="Dive deeper into architectural patterns, distributed systems design, and scaling strategies that enable massive, resilient systems."
        buttonText="Study Architecture Patterns"
        onButtonClick={() => navigateToSection('Architecture Patterns')}
        colorScheme="purple"
      />
    </>
  );
};

export default DesignPrinciples;
