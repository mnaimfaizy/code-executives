import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import C4ModelBuilder2D from '../../components/models2d/systemdesign/C4ModelBuilder2D';
import {
  Eye,
  Layers,
  Box,
  Code,
  Users,
  MessageSquare,
  FileText,
  Target,
  CheckCircle,
} from 'lucide-react';

const Visualization: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/systemdesign?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-cyan-100 p-4 rounded-full">
          <Eye className="w-16 h-16 text-cyan-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Visualization & Communication: The C4 Model
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Master the art of communicating complex system architectures. Learn the C4 model, create
        effective diagrams, and communicate technical decisions to stakeholders at all levels.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-semibold">
          🎯 C4 Model
        </span>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          📊 System Context
        </span>
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          🏗️ Container View
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔧 Component View
        </span>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* C4 Model Overview */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-cyan-100 p-3 rounded-lg">
            <Layers className="w-8 h-8 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              The C4 Model: A Structured Approach
            </h2>
            <p className="text-gray-600">
              Context, Containers, Components, and Code - four levels of architectural diagrams
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Level 1: System Context</h3>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-lg">1</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-800">Context Diagram</h4>
                  <p className="text-blue-700">High-level view of the system and its environment</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-blue-700">
                <div>
                  <strong>Purpose:</strong> Show what the system does and who uses it
                </div>
                <div>
                  <strong>Audience:</strong> Non-technical stakeholders, product managers
                </div>
                <div>
                  <strong>Scope:</strong> System boundaries, users, external systems
                </div>
                <div>
                  <strong>Notation:</strong> Simple boxes and arrows, no technical details
                </div>
              </div>

              <div className="mt-4 bg-blue-200 p-3 rounded text-xs">
                <strong>Example Elements:</strong> Users, external APIs, databases, third-party
                services
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Level 2: Container Diagram</h3>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-lg">2</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-green-800">Container View</h4>
                  <p className="text-green-700">Applications and data stores at high level</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-green-700">
                <div>
                  <strong>Purpose:</strong> Show technology choices and deployment
                </div>
                <div>
                  <strong>Audience:</strong> Architects, developers, operations teams
                </div>
                <div>
                  <strong>Scope:</strong> Web apps, mobile apps, databases, message queues
                </div>
                <div>
                  <strong>Notation:</strong> Technology stack, deployment environments
                </div>
              </div>

              <div className="mt-4 bg-green-200 p-3 rounded text-xs">
                <strong>Example Elements:</strong> React SPA, Node.js API, PostgreSQL, Redis cache
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Level 3: Component Diagram</h3>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-lg">3</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-purple-800">Component View</h4>
                  <p className="text-purple-700">Major building blocks within containers</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-purple-700">
                <div>
                  <strong>Purpose:</strong> Show internal structure and responsibilities
                </div>
                <div>
                  <strong>Audience:</strong> Senior developers, architects
                </div>
                <div>
                  <strong>Scope:</strong> Services, modules, libraries within containers
                </div>
                <div>
                  <strong>Notation:</strong> Interfaces, dependencies, data flow
                </div>
              </div>

              <div className="mt-4 bg-purple-200 p-3 rounded text-xs">
                <strong>Example Elements:</strong> UserService, PaymentService, NotificationService
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Level 4: Code Diagram</h3>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-lg">4</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-orange-800">Code View</h4>
                  <p className="text-orange-700">Classes, interfaces, and relationships</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-orange-700">
                <div>
                  <strong>Purpose:</strong> Show implementation details and design patterns
                </div>
                <div>
                  <strong>Audience:</strong> Developers working on specific components
                </div>
                <div>
                  <strong>Scope:</strong> UML class diagrams, sequence diagrams
                </div>
                <div>
                  <strong>Notation:</strong> Standard UML or simplified notation
                </div>
              </div>

              <div className="mt-4 bg-orange-200 p-3 rounded text-xs">
                <strong>Example Elements:</strong> UserController, UserRepository, UserModel
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive C4 Model Builder */}
      <ThemeCard>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Interactive C4 Model Builder</h2>
          <p className="text-gray-600">
            Create and explore C4 architectural diagrams interactively
          </p>
        </div>
        <C4ModelBuilder2D />
      </ThemeCard>

      {/* Diagramming Best Practices */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Diagramming Best Practices</h2>
            <p className="text-gray-600">Creating effective, maintainable architectural diagrams</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Content Principles</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Audience-First:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Design for your audience's needs and knowledge level
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Progressive Disclosure:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Start simple, add complexity as needed
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Truth Over Beauty:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Accuracy is more important than aesthetics
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Living Documentation:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Keep diagrams current with code changes
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Single Responsibility:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    One diagram, one purpose, one audience
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Visual Principles</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-blue-800">Consistent Notation:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Use standard symbols and colors consistently
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-blue-800">Clear Layout:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Left-to-right, top-to-bottom flow
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-blue-800">Meaningful Names:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Use business domain terminology
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-blue-800">Appropriate Detail:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Include only relevant information
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-blue-800">Version Control:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Track diagram changes with system versions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Communication Techniques */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-100 p-3 rounded-lg">
            <MessageSquare className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Stakeholder Communication</h2>
            <p className="text-gray-600">
              Tailoring your message for different audiences and contexts
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Business Stakeholders</h3>
            </div>
            <div className="space-y-2 text-sm text-blue-700">
              <div>
                <strong>Focus:</strong> Business value, ROI, timelines
              </div>
              <div>
                <strong>Diagrams:</strong> Context and container level
              </div>
              <div>
                <strong>Language:</strong> Business terminology
              </div>
              <div>
                <strong>Concerns:</strong> Cost, time, risk, benefits
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Code className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">Development Teams</h3>
            </div>
            <div className="space-y-2 text-sm text-green-700">
              <div>
                <strong>Focus:</strong> Technical implementation, APIs
              </div>
              <div>
                <strong>Diagrams:</strong> Component and code level
              </div>
              <div>
                <strong>Language:</strong> Technical specifications
              </div>
              <div>
                <strong>Concerns:</strong> Feasibility, complexity, dependencies
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Box className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-800">Operations Teams</h3>
            </div>
            <div className="space-y-2 text-sm text-purple-700">
              <div>
                <strong>Focus:</strong> Deployment, monitoring, scaling
              </div>
              <div>
                <strong>Diagrams:</strong> Container and deployment views
              </div>
              <div>
                <strong>Language:</strong> Infrastructure and operations
              </div>
              <div>
                <strong>Concerns:</strong> Reliability, performance, maintenance
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Communication Scenarios</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-indigo-800 mb-2">Architecture Review Meetings</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Present context and container diagrams first</li>
                <li>• Use component diagrams for detailed discussions</li>
                <li>• Prepare multiple views for different concerns</li>
                <li>• Have code-level diagrams ready for deep dives</li>
                <li>• Document decisions and rationale</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">Technical Documentation</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Start with system context for new team members</li>
                <li>• Include deployment and runtime views</li>
                <li>• Link diagrams to code and documentation</li>
                <li>• Update diagrams with architectural changes</li>
                <li>• Use consistent notation across all docs</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Tools and Techniques */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-orange-100 p-3 rounded-lg">
            <Target className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Tools and Techniques</h2>
            <p className="text-gray-600">
              Practical tools for creating and maintaining architectural diagrams
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Diagram Creation Tools</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Structurizr</h4>
                <p className="text-gray-600 text-sm mb-2">
                  C4 model native tool with code-based diagram definitions.
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Best for:</strong> Code-as-documentation, automated generation
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Draw.io / Diagrams.net</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Free, web-based diagramming with C4 model templates.
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Best for:</strong> Quick diagrams, collaboration, cost-effective
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">PlantUML</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Text-based diagramming that generates C4 diagrams from code.
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Best for:</strong> Version control, automation, developer-friendly
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Lucidchart / Visio</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Professional diagramming tools with collaboration features.
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Best for:</strong> Enterprise teams, polished presentations
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Maintenance Strategies</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Version Control Integration:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Store diagrams with code, track changes
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Automated Generation:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Generate diagrams from code annotations
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Review Processes:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Regular diagram reviews with architecture changes
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Living Documentation:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Treat diagrams as code that must be maintained
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Tool Standardization:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Use consistent tools and templates across teams
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Common Pitfalls</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Diagrams that become outdated</li>
                <li>• Inconsistent notation and styling</li>
                <li>• Too much detail for the audience</li>
                <li>• Missing context or scope</li>
                <li>• No version control or maintenance process</li>
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">🎨 Visualization</h3>
        <div className="space-y-3">
          <NavigationCard
            title="C4 Model Overview"
            description="Context, containers, components, code"
            colorScheme="cyan"
            onClick={() => navigateToSection('C4 Model Overview')}
          />
          <NavigationCard
            title="Diagramming Best Practices"
            description="Creating effective architectural diagrams"
            colorScheme="cyan"
            onClick={() => navigateToSection('Diagramming Best Practices')}
          />
          <NavigationCard
            title="Stakeholder Communication"
            description="Tailoring messages for different audiences"
            colorScheme="cyan"
            onClick={() => navigateToSection('Stakeholder Communication')}
          />
          <NavigationCard
            title="Interactive C4 Builder"
            description="Create C4 diagrams interactively"
            colorScheme="cyan"
            onClick={() => navigateToSection('Interactive C4 Builder')}
          />
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-900">Resources</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <strong className="text-cyan-800">
              "Visualize, Document & Explore Your Software Architecture"
            </strong>
            <div className="text-gray-600">C4 Model Website</div>
          </div>
          <div>
            <strong className="text-cyan-800">Structurizr</strong>
            <div className="text-gray-600">C4 model tooling</div>
          </div>
          <div>
            <strong className="text-cyan-800">PlantUML</strong>
            <div className="text-gray-600">Text-based diagramming</div>
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
        title="Explore Interactive Architecture Simulations"
        description="Experience the CAP theorem, consistency models, and architectural trade-offs through interactive visualizations and simulations."
        buttonText="Try Interactive Simulations"
        onButtonClick={() => navigateToSection('Interactive Simulations')}
        colorScheme="cyan"
      />
    </>
  );
};

export default Visualization;
