import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import { Network, Shield, Zap, Users, CheckCircle } from 'lucide-react';

const Introduction: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/systemdesign?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // System design statistics
  const stats = [
    {
      value: '99.9%',
      label: 'System Availability Target',
      icon: <Shield className="w-5 h-5" />,
    },
    {
      value: '10M+',
      label: 'Users at Scale',
      icon: <Users className="w-5 h-5" />,
    },
    {
      value: '<100ms',
      label: 'Response Time Goal',
      icon: <Zap className="w-5 h-5" />,
    },
  ];

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-blue-100 p-4 rounded-full">
          <Network className="w-16 h-16 text-blue-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Master System Design: The Art of Scalable Architecture
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        System design is the discipline that transforms coding proficiency into engineering mastery.
        Learn to architect systems that scale, remain reliable, and evolve with business needs. This
        module bridges the gap between interview preparation and real-world engineering excellence.
      </p>
      <StatsGrid stats={stats} colorScheme="blue" />
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          🏗️ Scalable Architecture
        </span>
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔄 Distributed Systems
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ Performance Optimization
        </span>
        <span className="bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-semibold">
          🚀 Enterprise Solutions
        </span>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* What is System Design? */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">What is System Design?</h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Architectural Decision Making
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              System design is the comprehensive process of defining the{' '}
              <strong>architecture, components, and interfaces</strong> required for a system to
              fulfill both functional and non-functional requirements. It involves making strategic
              decisions about technology stacks, data flow, scalability patterns, and trade-offs
              that impact the entire system's lifecycle.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Unlike coding interviews that focus on algorithmic solutions, system design addresses
              the challenges of building production systems that serve millions of users reliably.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Core Principles</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>Scalability:</strong> Handle growth in users and data
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>Reliability:</strong> Ensure system availability and fault tolerance
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>Efficiency:</strong> Optimize for performance and cost
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>Maintainability:</strong> Design for long-term evolution
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Concepts Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Why System Design Matters</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Reduces Technical Debt</h4>
              <p className="text-sm text-gray-600">
                Proper architectural decisions prevent costly refactoring and maintenance issues
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Accelerates Development</h4>
              <p className="text-sm text-gray-600">
                Clear architectural boundaries enable faster feature development and deployment
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Enables Scale</h4>
              <p className="text-sm text-gray-600">
                Design systems that grow from startup to enterprise without complete rewrites
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Learning Journey */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Your System Design Learning Journey
        </h3>
        <p className="text-gray-700 mb-6 leading-relaxed">
          This module takes you from understanding basic architectural concepts to designing
          complex, scalable systems. Each section builds upon the previous one, providing both
          theoretical knowledge and practical design patterns.
        </p>

        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Module Progress</h4>
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">5 of 6</span> sections completed
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
              style={{ width: '83%' }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Architecture Patterns</span>
            <span>Distributed Systems</span>
            <span>Scaling Strategies</span>
            <span>Visualization</span>
            <span>Case Studies</span>
            <span className="text-blue-600 font-medium">Design Principles</span>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              name: 'Architecture Patterns',
              description: 'Monolithic vs Microservices, Event-Driven Systems',
              completed: true,
              current: false,
            },
            {
              name: 'Distributed Systems',
              description: 'CAP Theorem, Consistency Models, Fault Tolerance',
              completed: true,
              current: false,
            },
            {
              name: 'Scaling Strategies',
              description: 'Horizontal/Vertical Scaling, Load Balancing, Caching',
              completed: true,
              current: false,
            },
            {
              name: 'Visualization Tools',
              description: 'C4 Model, Architecture Diagrams, Interactive Builders',
              completed: true,
              current: false,
            },
            {
              name: 'Design Principles',
              description: 'SOLID, Design Patterns, Technical Debt Management',
              completed: false,
              current: true,
            },
            {
              name: 'Real-World Case Studies',
              description: 'Netflix, Uber, and Enterprise System Analysis',
              completed: true,
              current: false,
            },
          ].map((step, index) => (
            <div
              key={index}
              className="group flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              onClick={() => (step.completed || step.current ? navigateToSection(step.name) : null)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                  step.current
                    ? 'bg-blue-500 text-white shadow-md'
                    : step.completed
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`font-semibold transition-colors duration-200 ${
                    step.current
                      ? 'text-blue-800'
                      : step.completed
                        ? 'text-green-800'
                        : 'text-gray-700'
                  }`}
                >
                  {step.name}
                  {step.current && <span className="ml-2 text-blue-600">(In Progress)</span>}
                  {step.completed && <span className="ml-2 text-green-600">✓ Completed</span>}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              {!step.completed && !step.current && (
                <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  Coming Next
                </div>
              )}
              {(step.completed || step.current) && (
                <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Explore →
                </div>
              )}
            </div>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 System Design Modules</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Architecture Patterns"
            description="Compare monolithic, microservices, and other patterns"
            colorScheme="blue"
            onClick={() => navigateToSection('Architecture Patterns')}
          />
          <NavigationCard
            title="Distributed Systems"
            description="CAP theorem, consistency models, and trade-offs"
            colorScheme="blue"
            onClick={() => navigateToSection('Distributed Systems')}
          />
          <NavigationCard
            title="Scaling Strategies"
            description="Horizontal/vertical scaling and load balancing"
            colorScheme="blue"
            onClick={() => navigateToSection('Scaling Strategies')}
          />
          <NavigationCard
            title="Design Principles"
            description="SOLID principles and architectural governance"
            colorScheme="blue"
            onClick={() => navigateToSection('Design Principles')}
          />
          <NavigationCard
            title="Case Studies"
            description="Real-world system design examples"
            colorScheme="blue"
            onClick={() => navigateToSection('Case Studies')}
          />
          <NavigationCard
            title="Visualization Tools"
            description="C4 model and architectural diagramming"
            colorScheme="blue"
            onClick={() => navigateToSection('Visualization Tools')}
          />
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
        title="Ready to Become a System Architect?"
        description="Dive into interactive visualizations that will transform how you design scalable, reliable systems. Start your journey from interview preparation to engineering mastery."
        buttonText="Explore Architecture Patterns"
        onButtonClick={() => navigateToSection('Architecture Patterns')}
        colorScheme="blue"
      />
    </>
  );
};

export default Introduction;
