import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import ScalingVisualization2D from '../visualizations/2d/ScalingVisualization2D';
import {
  TrendingUp,
  Server,
  Database,
  Zap,
  ArrowUp,
  ArrowRight,
  Layers,
  Cpu,
  CheckCircle,
} from 'lucide-react';

const ScalingStrategies: React.FC = () => {
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
          <TrendingUp className="w-16 h-16 text-blue-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Scaling Strategies: Growing with Demand
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Scaling is not just about handling more users—it's about maintaining performance,
        reliability, and cost efficiency as your system grows. Master horizontal and vertical
        scaling, load balancing, caching strategies, and the architectural patterns that enable
        massive scale.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          📈 Horizontal Scaling
        </span>
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚖️ Load Balancing
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          💾 Caching Strategies
        </span>
        <span className="bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-semibold">
          📨 Message Queues
        </span>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* Scaling Fundamentals */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Scaling Fundamentals</h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <ArrowUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Vertical Scaling (Scale Up)</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Add more CPU, RAM, storage to existing servers
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Simpler implementation and management</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">No application changes required</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Hardware limits and single points of failure</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <ArrowRight className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Horizontal Scaling (Scale Out)
              </h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Add more servers/instances to distribute load</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Better fault tolerance and availability</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Cost-effective for large scale</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Requires application design for distribution</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Scaling Decision Framework</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <p className="text-gray-700">
                <strong>Assess Load:</strong> Measure current bottlenecks
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <p className="text-gray-700">
                <strong>Choose Strategy:</strong> Vertical vs horizontal
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <p className="text-gray-700">
                <strong>Implement:</strong> With monitoring and rollback
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Interactive Scaling Visualization */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Interactive Scaling Demonstration</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Experience the difference between vertical and horizontal scaling. Adjust the load slider
          to see how each strategy handles increasing demand, and observe the impact on performance,
          cost, and architecture.
        </p>
        <ScalingVisualization2D />
      </ThemeCard>

      {/* Load Balancing */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-indigo-100 p-3 rounded-lg">
            <Layers className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Load Balancing</h2>
            <p className="text-gray-600">Distributing traffic across multiple servers</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Load Balancing Algorithms</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Round Robin</h4>
                <p className="text-blue-700 text-sm">
                  Requests distributed sequentially to each server in order.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Least Connections</h4>
                <p className="text-green-700 text-sm">
                  Requests sent to server with fewest active connections.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">IP Hash</h4>
                <p className="text-purple-700 text-sm">
                  Client IP determines which server receives the request (session affinity).
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Weighted Round Robin</h4>
                <p className="text-orange-700 text-sm">
                  Servers with higher capacity receive more requests.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Load Balancer Types</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Hardware Load Balancers</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Dedicated hardware appliances</li>
                  <li>• High performance and reliability</li>
                  <li>• Expensive and less flexible</li>
                  <li>• F5, Citrix NetScaler</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Software Load Balancers</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• NGINX, HAProxy, Envoy</li>
                  <li>• Cost-effective and flexible</li>
                  <li>• Can run on commodity hardware</li>
                  <li>• Feature-rich with plugins</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Cloud Load Balancers</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• AWS ALB/NLB, Azure Load Balancer</li>
                  <li>• Managed service, auto-scaling</li>
                  <li>• Integrated with cloud ecosystem</li>
                  <li>• Pay-per-use pricing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Caching Strategies */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Database className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Caching Strategies</h2>
            <p className="text-gray-600">Accelerating data access and reducing load</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Browser Cache</h3>
            <p className="text-blue-700 text-sm mb-4">
              Client-side caching of static assets, API responses, and resources.
            </p>
            <div className="text-xs text-blue-600">
              <strong>Best for:</strong> Static content, user sessions
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">CDN Cache</h3>
            <p className="text-green-700 text-sm mb-4">
              Global network of edge servers caching content closer to users.
            </p>
            <div className="text-xs text-green-600">
              <strong>Best for:</strong> Static assets, global distribution
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Application Cache</h3>
            <p className="text-purple-700 text-sm mb-4">
              In-memory caching within application servers (Redis, Memcached).
            </p>
            <div className="text-xs text-purple-600">
              <strong>Best for:</strong> Database queries, API responses
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Cache Invalidation Strategies
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Cache-Aside (Lazy Loading)</h4>
              <p className="text-gray-600 text-sm">
                Application checks cache first, loads from database if miss, then caches result.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Write-Through</h4>
              <p className="text-gray-600 text-sm">
                Data written to both cache and database simultaneously.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Write-Behind (Write-Back)</h4>
              <p className="text-gray-600 text-sm">
                Data written to cache first, asynchronously persisted to database.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">TTL (Time-To-Live)</h4>
              <p className="text-gray-600 text-sm">
                Cache entries automatically expire after specified time.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Message Queues and Async Processing */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-cyan-100 p-3 rounded-lg">
            <Zap className="w-8 h-8 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Message Queues & Async Processing</h2>
            <p className="text-gray-600">
              Decoupling and scaling through asynchronous communication
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Benefits of Message Queues</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Decoupling:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Producers and consumers work independently
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Buffering:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Handle traffic spikes and load leveling
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Reliability:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Messages persist until processed
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Scalability:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Scale producers and consumers independently
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Popular Message Queue Systems
            </h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Apache Kafka</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Distributed streaming platform for high-throughput, fault-tolerant messaging.
                </p>
                <div className="text-xs text-gray-500">
                  Best for: Event streaming, log aggregation, real-time analytics
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">RabbitMQ</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Message broker implementing AMQP protocol with rich routing capabilities.
                </p>
                <div className="text-xs text-gray-500">
                  Best for: Complex routing, reliable delivery, enterprise messaging
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Amazon SQS</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Fully managed message queuing service with at-least-once delivery.
                </p>
                <div className="text-xs text-gray-500">
                  Best for: Cloud-native applications, simple queuing needs
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Async Processing Patterns</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong className="text-cyan-800">Fire and Forget:</strong>
              <span className="text-gray-600 ml-1">Send message, don't wait for response</span>
            </div>
            <div>
              <strong className="text-cyan-800">Request-Reply:</strong>
              <span className="text-gray-600 ml-1">Async request with callback/correlation ID</span>
            </div>
            <div>
              <strong className="text-cyan-800">Publish-Subscribe:</strong>
              <span className="text-gray-600 ml-1">Multiple consumers receive same message</span>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Database Scaling */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-100 p-3 rounded-lg">
            <Server className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Database Scaling Patterns</h2>
            <p className="text-gray-600">
              Scaling data layer for high performance and availability
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Read Scaling</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Read Replicas:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Multiple copies for read operations
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Connection Pooling:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Reuse database connections efficiently
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Query Optimization:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Indexes, query planning, and caching
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Write Scaling</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-blue-800">Sharding:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Split data across multiple databases
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-blue-800">Federation:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Separate databases for different concerns
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-blue-800">CQRS:</strong>
                  <span className="text-gray-700 text-sm ml-1">Separate read and write models</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <div className="flex items-start space-x-3">
            <Cpu className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Database Scaling Challenges
              </h3>
              <p className="text-yellow-700 text-sm mb-3">
                Database scaling is often the most complex part of system scaling due to ACID
                requirements, data consistency, and migration challenges.
              </p>
              <div className="text-sm text-yellow-700">
                <strong>Key Considerations:</strong> Data distribution, cross-shard queries, backup
                strategies, and maintaining referential integrity across shards.
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Scaling Mastery</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Architecture Patterns"
            description="Monolithic vs microservices comparison"
            colorScheme="blue"
            onClick={() => navigateToSection('Architecture Patterns')}
          />
          <NavigationCard
            title="Distributed Systems"
            description="CAP theorem and consistency models"
            colorScheme="blue"
            onClick={() => navigateToSection('Distributed Systems')}
          />
          <NavigationCard
            title="Interactive Scaling Demo"
            description="Visualize scaling strategies in action"
            colorScheme="blue"
            onClick={() => navigateToSection('Interactive Scaling Demo')}
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
        title="Explore Design Principles and Governance"
        description="Learn how to apply SOLID principles, manage technical debt, and establish architectural governance in large-scale systems. Understand the frameworks that guide architectural decision-making."
        buttonText="Study Design Principles"
        onButtonClick={() => navigateToSection('Design Principles')}
        colorScheme="blue"
      />
    </>
  );
};

export default ScalingStrategies;
