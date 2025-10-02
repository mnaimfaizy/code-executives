import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import ArchitectureComparison2D from '../visualizations/2d/ArchitectureComparison2D';
import {
  Layers,
  Zap,
  Server,
  Cloud,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

const ArchitecturePatterns: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/systemdesign?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-blue-100 p-4 rounded-full">
          <Layers className="w-16 h-16 text-blue-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Architecture Patterns: Choosing the Right Foundation
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Every great system begins with the right architectural foundation. Learn to evaluate
        trade-offs between monolithic and microservices architectures, understand when to use
        event-driven systems, and master the principles that guide architectural decision-making.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          🏗️ Architectural Trade-offs
        </span>
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔄 Microservices vs Monolithic
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ Event-Driven Systems
        </span>
        <span className="bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-semibold">
          ☁️ Serverless Architecture
        </span>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* Architecture Pattern Overview */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Understanding Architecture Patterns
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              What is an Architecture Pattern?
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              An architecture pattern is a general, reusable solution to a commonly occurring
              problem in software architecture within a given context. These patterns provide
              tested, proven development paradigms that help architects make informed decisions
              about system structure, component relationships, and communication mechanisms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The choice of architecture pattern fundamentally shapes how your system will scale,
              how it handles failures, how teams collaborate, and how the system evolves over time.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Decision Factors</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>Scale:</strong> Expected user load and data volume
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>Team Size:</strong> Number of developers and teams
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>Domain Complexity:</strong> Business logic intricacy
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>Time to Market:</strong> Speed vs quality trade-offs
                </span>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Monolithic Architecture */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gray-100 p-3 rounded-lg">
            <Server className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Monolithic Architecture</h2>
            <p className="text-gray-600">The traditional approach - single unified application</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Characteristics</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Single codebase and deployment unit</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Shared database and memory space</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Simple development and testing</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Consistent transactions and data integrity</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">When to Choose Monolithic</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="space-y-2 text-gray-700">
                <li>• Small to medium-sized applications</li>
                <li>• Teams with &lt; 10 developers</li>
                <li>• Simple domain with clear boundaries</li>
                <li>• Fast time-to-market requirements</li>
                <li>• Limited scaling needs</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Scaling Challenges</h4>
              <p className="text-yellow-700 text-sm">
                Monolithic applications become difficult to scale as they grow. All components must
                be scaled together, leading to inefficient resource usage and increased complexity
                in large systems.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Microservices Architecture */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-100 p-3 rounded-lg">
            <Zap className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Microservices Architecture</h2>
            <p className="text-gray-600">Decoupled services that can evolve independently</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Characteristics</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Independently deployable services</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Technology diversity allowed</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Horizontal scaling per service</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Fault isolation and resilience</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              When to Choose Microservices
            </h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <ul className="space-y-2 text-gray-700">
                <li>• Large-scale applications</li>
                <li>• Multiple development teams</li>
                <li>• Complex domains with evolving requirements</li>
                <li>• High availability and scalability needs</li>
                <li>• Technology diversity requirements</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800 mb-2">Operational Complexity</h4>
              <p className="text-red-700 text-sm">
                Microservices introduce significant operational complexity including service
                discovery, distributed transactions, monitoring, and inter-service communication
                challenges.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Other Architecture Patterns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Event-Driven Architecture */}
        <ThemeCard>
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Event-Driven Architecture</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Components communicate through events rather than direct calls. Ideal for systems
            requiring high decoupling, real-time processing, and complex workflows.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Asynchronous communication</div>
            <div>• Loose coupling between components</div>
            <div>• Scalable event processing</div>
            <div>• Complex for debugging and tracing</div>
          </div>
        </ThemeCard>

        {/* Serverless Architecture */}
        <ThemeCard>
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-cyan-100 p-2 rounded-lg">
              <Cloud className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Serverless Architecture</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Functions execute on-demand without managing servers. Perfect for variable workloads,
            rapid prototyping, and cost optimization.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Pay-per-execution pricing</div>
            <div>• Automatic scaling</div>
            <div>• Reduced operational overhead</div>
            <div>• Cold start latency concerns</div>
          </div>
        </ThemeCard>
      </div>

      {/* Architecture Decision Framework */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Making Architecture Decisions</h2>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Decision Framework</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Assess Requirements</h4>
              <p className="text-sm text-gray-600">
                Evaluate scale, complexity, team size, and business constraints
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Layers className="w-6 h-6 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Evaluate Patterns</h4>
              <p className="text-sm text-gray-600">
                Compare trade-offs, risks, and benefits of each approach
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <ArrowRight className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Start Small</h4>
              <p className="text-sm text-gray-600">
                Begin with proven patterns and evolve as needs change
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Remember: Architecture Evolves
          </h3>
          <p className="text-gray-700">
            No architecture decision is permanent. Successful systems start with patterns that match
            current needs and evolve as requirements change. The key is understanding the trade-offs
            and having a clear migration path for when the current architecture no longer serves
            your needs.
          </p>
        </div>
      </ThemeCard>

      {/* Interactive Architecture Comparison */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Interactive Architecture Comparison
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Explore the visual differences between architecture patterns. Click through the options
          below to see how monolithic, microservices, and serverless architectures compare in
          structure, advantages, and challenges.
        </p>
        <ArchitectureComparison2D />
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">🏗️ Architecture Deep Dive</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Distributed Systems"
            description="CAP theorem, consistency models, and fault tolerance"
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
            title="Interactive Comparison"
            description="Compare architecture patterns visually"
            colorScheme="blue"
            onClick={() => navigateToSection('Architecture Comparison')}
          />
          <NavigationCard
            title="Design Principles"
            description="SOLID principles and architectural governance"
            colorScheme="blue"
            onClick={() => navigateToSection('Design Principles')}
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
        title="Explore Distributed Systems Fundamentals"
        description="Dive deeper into the constraints and trade-offs that shape distributed system design. Understanding CAP theorem and consistency models is crucial for building reliable distributed applications."
        buttonText="Learn Distributed Systems"
        onButtonClick={() => navigateToSection('Distributed Systems')}
        colorScheme="blue"
      />
    </>
  );
};

export default ArchitecturePatterns;
