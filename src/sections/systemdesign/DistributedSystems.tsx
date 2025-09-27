import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import CAPTheorem2D from '../../components/models2d/systemdesign/CAPTheorem2D';
import { Network, Shield, Zap, AlertTriangle, CheckCircle, Triangle } from 'lucide-react';

const DistributedSystems: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/systemdesign?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-indigo-100 p-4 rounded-full">
          <Network className="w-16 h-16 text-indigo-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Distributed Systems: The Fundamental Constraints
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Distributed systems introduce unique challenges that don't exist in single-machine
        applications. Master the CAP theorem, understand consistency models, and learn to design
        systems that remain reliable despite network failures and partial outages.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔒 CAP Theorem
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔄 Consistency Models
        </span>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          🛡️ Fault Tolerance
        </span>
        <span className="bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ Performance Trade-offs
        </span>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* CAP Theorem */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-indigo-100 p-3 rounded-lg">
            <Triangle className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">The CAP Theorem</h2>
            <p className="text-gray-600">The fundamental trade-off in distributed systems</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">The Three Properties</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="font-semibold text-blue-800">Consistency (C)</h4>
                </div>
                <p className="text-blue-700 text-sm">
                  Every read receives the most recent write or an error. All nodes see the same data
                  simultaneously.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-semibold text-green-800">Availability (A)</h4>
                </div>
                <p className="text-green-700 text-sm">
                  Every request receives a non-error response, without guaranteeing the most recent
                  data.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h4 className="font-semibold text-purple-800">Partition Tolerance (P)</h4>
                </div>
                <p className="text-purple-700 text-sm">
                  The system continues to operate despite network failures between nodes.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">The Impossible Triangle</h3>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                <strong>CAP Theorem:</strong> In a distributed system, you can only guarantee two
                out of three properties simultaneously.
              </p>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 text-sm">
                    <strong>CA:</strong> Traditional databases (ACID)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 text-sm">
                    <strong>CP:</strong> Some NoSQL databases
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 text-sm">
                    <strong>AP:</strong> Most web applications
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-800 text-sm font-medium mb-1">
                    Network Partitions Are Inevitable
                  </p>
                  <p className="text-yellow-700 text-xs">
                    In real-world distributed systems, network failures happen. You must choose
                    between consistency and availability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive CAP Theorem Visualization */}
      <ThemeCard>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Interactive CAP Theorem Simulator
          </h2>
          <p className="text-gray-600">
            Experience the CAP theorem trade-offs through interactive exploration
          </p>
        </div>
        <CAPTheorem2D />
      </ThemeCard>

      {/* ACID vs BASE */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">ACID vs BASE: Transaction Models</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* ACID */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">ACID (Traditional Databases)</h3>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-blue-800">Atomicity:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    All operations succeed or all fail
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-blue-800">Consistency:</strong>
                  <span className="text-gray-700 text-sm ml-1">Data remains in valid state</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-blue-800">Isolation:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Concurrent transactions don't interfere
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-blue-800">Durability:</strong>
                  <span className="text-gray-700 text-sm ml-1">Committed changes persist</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Best For:</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Financial transactions</li>
                <li>• Inventory management</li>
                <li>• Critical business data</li>
                <li>• Strong consistency requirements</li>
              </ul>
            </div>
          </div>

          {/* BASE */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">BASE (Modern Distributed Systems)</h3>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-green-800">Basically Available:</strong>
                  <span className="text-gray-700 text-sm ml-1">System remains operational</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-green-800">Soft State:</strong>
                  <span className="text-gray-700 text-sm ml-1">State may change over time</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <strong className="text-green-800">Eventual Consistency:</strong>
                  <span className="text-gray-700 text-sm ml-1">Data converges over time</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Best For:</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Social media feeds</li>
                <li>• User session data</li>
                <li>• Analytics and logging</li>
                <li>• High availability requirements</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Consistency Models */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Consistency Models</h2>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Strong Consistency</h3>
            <p className="text-blue-700 text-sm mb-4">
              All reads return the most recent write. Highest consistency, lowest availability.
            </p>
            <div className="text-xs text-blue-600">
              <strong>Use when:</strong> Financial data, critical state
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Eventual Consistency</h3>
            <p className="text-green-700 text-sm mb-4">
              Data will eventually be consistent. Highest availability, eventual accuracy.
            </p>
            <div className="text-xs text-green-600">
              <strong>Use when:</strong> User preferences, social data
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Causal Consistency</h3>
            <p className="text-purple-700 text-sm mb-4">
              Causally related operations are seen in order. Balanced approach.
            </p>
            <div className="text-xs text-purple-600">
              <strong>Use when:</strong> Collaborative editing, messaging
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Practical Implementation</h3>
          <p className="text-gray-700 mb-4">
            Most systems use multiple consistency models for different data types. For example:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-blue-800">Strong Consistency:</strong>
              <span className="text-gray-600 ml-1">User account balances, order status</span>
            </div>
            <div>
              <strong className="text-green-800">Eventual Consistency:</strong>
              <span className="text-gray-600 ml-1">Product recommendations, user profiles</span>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Fault Tolerance */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Fault Tolerance and Resilience</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Common Failure Modes</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-red-800">Network Partitions:</strong>
                  <span className="text-gray-700 text-sm ml-1">Nodes can't communicate</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-red-800">Node Failures:</strong>
                  <span className="text-gray-700 text-sm ml-1">Individual servers crash</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-red-800">Byzantine Failures:</strong>
                  <span className="text-gray-700 text-sm ml-1">Nodes behave unpredictably</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-red-800">Cascading Failures:</strong>
                  <span className="text-gray-700 text-sm ml-1">One failure triggers others</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Resilience Patterns</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Circuit Breakers:</strong>
                  <span className="text-gray-700 text-sm ml-1">Stop cascading failures</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Bulkheads:</strong>
                  <span className="text-gray-700 text-sm ml-1">Isolate failure domains</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Retries with Backoff:</strong>
                  <span className="text-gray-700 text-sm ml-1">Handle transient failures</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Graceful Degradation:</strong>
                  <span className="text-gray-700 text-sm ml-1">Maintain partial functionality</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Designing for Failure</h3>
          <p className="text-gray-700">
            In distributed systems, failures are not exceptions—they're expected. Design your
            systems to degrade gracefully, recover automatically, and maintain availability even
            when components fail. The goal is not to prevent failures, but to contain them and
            minimize their impact.
          </p>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">🔄 Distributed Systems</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Architecture Patterns"
            description="Monolithic vs microservices comparison"
            colorScheme="blue"
            onClick={() => navigateToSection('Architecture Patterns')}
          />
          <NavigationCard
            title="Scaling Strategies"
            description="Horizontal/vertical scaling and load balancing"
            colorScheme="blue"
            onClick={() => navigateToSection('Scaling Strategies')}
          />
          <NavigationCard
            title="CAP Theorem Interactive"
            description="Explore the CAP trade-offs visually"
            colorScheme="blue"
            onClick={() => navigateToSection('CAP Theorem Interactive')}
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
        title="Master Scaling Strategies"
        description="Learn how to scale systems effectively with horizontal scaling, load balancing, caching, and message queues. Understand the trade-offs and implementation patterns for building scalable distributed systems."
        buttonText="Explore Scaling Strategies"
        onButtonClick={() => navigateToSection('Scaling Strategies')}
        colorScheme="blue"
      />
    </>
  );
};

export default DistributedSystems;
