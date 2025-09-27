import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import NetflixArchitecture2D from '../../components/models2d/systemdesign/NetflixArchitecture2D';
import {
  Building,
  Globe,
  Database,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  DollarSign,
  CheckCircle,
} from 'lucide-react';

const CaseStudies: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/systemdesign?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 p-4 rounded-full">
          <Building className="w-16 h-16 text-green-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Real-World Case Studies: Architecture in Action
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Learn from the world's most successful technology companies. See how theoretical concepts
        translate into billion-dollar architectures that serve millions of users worldwide.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          🏗️ Netflix Evolution
        </span>
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          🌐 Global Scale
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          💾 Polyglot Persistence
        </span>
        <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
          📈 Performance Engineering
        </span>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* Netflix Architecture Evolution */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-red-100 p-3 rounded-lg">
            <Building className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Netflix: From Monolith to Microservices
            </h2>
            <p className="text-gray-600">
              The definitive case study of architectural transformation at scale
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">The Journey</h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h4 className="font-semibold text-red-800">2008: The Monolith Era</h4>
                </div>
                <p className="text-red-700 text-sm">
                  Single Java monolith handling DVD rentals. Simple but limited scalability.
                </p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h4 className="font-semibold text-orange-800">2010: Cloud Migration</h4>
                </div>
                <p className="text-orange-700 text-sm">
                  Moved from data centers to AWS. First step toward elasticity.
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-yellow-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <h4 className="font-semibold text-yellow-800">2012: Microservices Begin</h4>
                </div>
                <p className="text-yellow-700 text-sm">
                  Started breaking monolith into services. Chaos Monkey for resilience testing.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <h4 className="font-semibold text-green-800">2018: Polyglot Architecture</h4>
                </div>
                <p className="text-green-700 text-sm">
                  700+ microservices, multiple languages, global CDN, advanced caching.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Key Architectural Decisions
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">API Gateway Pattern:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Zuul for request routing and authentication
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Circuit Breaker:</strong>
                  <span className="text-gray-700 text-sm ml-1">Hystrix for fault tolerance</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Event Sourcing:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    For complex business logic and auditing
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Global CDN:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Open Connect for content delivery
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Chaos Engineering:</strong>
                  <span className="text-gray-700 text-sm ml-1">Proactive failure testing</span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Scale Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-blue-600 font-bold">700+</div>
                  <div className="text-blue-700">Microservices</div>
                </div>
                <div>
                  <div className="text-blue-600 font-bold">1B+</div>
                  <div className="text-blue-700">Daily Requests</div>
                </div>
                <div>
                  <div className="text-blue-600 font-bold">190+</div>
                  <div className="text-blue-700">Countries</div>
                </div>
                <div>
                  <div className="text-blue-600 font-bold">99.5%</div>
                  <div className="text-blue-700">Uptime SLA</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Lessons Learned</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-red-800 mb-2">✅ What Worked</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Gradual migration strategy</li>
                <li>• Investment in developer tooling</li>
                <li>• Culture of experimentation</li>
                <li>• Data-driven decision making</li>
                <li>• Focus on developer productivity</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-800 mb-2">⚠️ Challenges Faced</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Increased operational complexity</li>
                <li>• Distributed system debugging</li>
                <li>• Service discovery and coordination</li>
                <li>• Data consistency across services</li>
                <li>• Team coordination at scale</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Netflix Architecture Interactive Visualization */}
      <ThemeCard>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🎬 Interactive Netflix Architecture Explorer
          </h2>
          <p className="text-gray-600">
            Explore Netflix's microservices ecosystem through an interactive visualization. Click on
            components to see details, challenges, and solutions.
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-black rounded-2xl p-6">
          <NetflixArchitecture2D />
        </div>
      </ThemeCard>

      {/* Uber Architecture Evolution */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-black p-3 rounded-lg">
            <Building className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Uber: Real-Time Systems at Massive Scale
            </h2>
            <p className="text-gray-600">
              Building a real-time marketplace that connects millions of riders and drivers
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">The Evolution</h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h4 className="font-semibold text-gray-800">2010: MVP Monolith</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  Simple Ruby on Rails app for San Francisco. Manual driver-rider matching.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h4 className="font-semibold text-blue-800">2014: Global Expansion</h4>
                </div>
                <p className="text-blue-700 text-sm">
                  Multi-city launch. Real-time matching algorithm. PostgreSQL for data.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <h4 className="font-semibold text-green-800">2016: Microservices Migration</h4>
                </div>
                <p className="text-green-700 text-sm">
                  Decomposed monolith into 1,000+ services. Kafka for event streaming.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <h4 className="font-semibold text-purple-800">2020: AI-Powered Platform</h4>
                </div>
                <p className="text-purple-700 text-sm">
                  ML for dynamic pricing, ETA predictions, and driver allocation.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Technical Challenges</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Real-Time Matching:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Sub-second driver-rider pairing at scale
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Geospatial Queries:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Finding nearby drivers efficiently
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Dynamic Pricing:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Surge pricing based on supply/demand
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Multi-Modal Transport:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Cars, bikes, scooters, food delivery
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Global Compliance:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Different regulations per country/city
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Scale Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 font-bold">1,000+</div>
                  <div className="text-gray-700">Microservices</div>
                </div>
                <div>
                  <div className="text-gray-600 font-bold">15B+</div>
                  <div className="text-gray-700">Daily Requests</div>
                </div>
                <div>
                  <div className="text-gray-600 font-bold">70+</div>
                  <div className="text-gray-700">Countries</div>
                </div>
                <div>
                  <div className="text-gray-600 font-bold">99.9%</div>
                  <div className="text-gray-700">Uptime SLA</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Technical Architecture Highlights
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Real-Time Systems</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Apache Kafka for event streaming</li>
                <li>• Redis for geospatial indexing</li>
                <li>• WebSocket connections for real-time updates</li>
                <li>• CQRS for read/write optimization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Machine Learning Integration</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Dynamic pricing algorithms</li>
                <li>• ETA prediction models</li>
                <li>• Driver allocation optimization</li>
                <li>• Fraud detection systems</li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Global CDN and Caching Strategies</h2>
            <p className="text-gray-600">Delivering content at the speed of light worldwide</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">CDN Architecture Patterns</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Netflix Open Connect</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Custom-built CDN with 1,000+ PoPs worldwide. Delivers 100% of streaming traffic.
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Key Features:</strong> Custom hardware, predictive caching, 99.9% hit rate
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">CloudFront + S3 (AWS)</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Global CDN with 200+ edge locations. Automatic scaling and DDoS protection.
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Key Features:</strong> Lambda@Edge, real-time logs, cost optimization
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Akamai Intelligent Platform</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Enterprise CDN with advanced security and bot management.
                </p>
                <div className="text-xs text-gray-500">
                  <strong>Key Features:</strong> WAF, image optimization, API acceleration
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Caching Strategies</h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Multi-Level Caching</h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <div>
                    <strong>Browser Cache:</strong> Static assets, user sessions
                  </div>
                  <div>
                    <strong>CDN Cache:</strong> Regional content delivery
                  </div>
                  <div>
                    <strong>Application Cache:</strong> API responses, computed data
                  </div>
                  <div>
                    <strong>Database Cache:</strong> Query result sets
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Cache Invalidation Patterns</h4>
                <div className="text-sm text-green-700 space-y-2">
                  <div>
                    <strong>TTL-based:</strong> Time-based expiration
                  </div>
                  <div>
                    <strong>Event-driven:</strong> Invalidate on data changes
                  </div>
                  <div>
                    <strong>Write-through:</strong> Update cache on writes
                  </div>
                  <div>
                    <strong>Cache-aside:</strong> Lazy loading pattern
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Performance Impact</h4>
                <div className="text-sm text-purple-700">
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-purple-600 font-bold">95%</div>
                      <div className="text-xs">Cache Hit Rate</div>
                    </div>
                    <div>
                      <div className="text-purple-600 font-bold">10x</div>
                      <div className="text-xs">Performance Boost</div>
                    </div>
                    <div>
                      <div className="text-purple-600 font-bold">80%</div>
                      <div className="text-xs">Cost Reduction</div>
                    </div>
                    <div>
                      <div className="text-purple-600 font-bold">99.9%</div>
                      <div className="text-xs">Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Polyglot Persistence */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Database className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Polyglot Persistence: Choosing the Right Database
            </h2>
            <p className="text-gray-600">
              Using multiple database technologies for optimal performance
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-3">Relational (SQL)</h3>
            <div className="space-y-2 text-sm text-red-700">
              <div>
                <strong>Use Cases:</strong> Transactions, complex queries
              </div>
              <div>
                <strong>Examples:</strong> PostgreSQL, MySQL, Aurora
              </div>
              <div>
                <strong>Netflix Usage:</strong> User profiles, billing data
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">NoSQL Document</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div>
                <strong>Use Cases:</strong> Flexible schemas, JSON data
              </div>
              <div>
                <strong>Examples:</strong> MongoDB, DynamoDB, Couchbase
              </div>
              <div>
                <strong>Netflix Usage:</strong> User preferences, metadata
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Key-Value Store</h3>
            <div className="space-y-2 text-sm text-green-700">
              <div>
                <strong>Use Cases:</strong> Caching, sessions, counters
              </div>
              <div>
                <strong>Examples:</strong> Redis, Memcached, DynamoDB
              </div>
              <div>
                <strong>Netflix Usage:</strong> Session data, API caching
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Data Access Patterns</h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2">CQRS Pattern</h4>
                <p className="text-indigo-700 text-sm">
                  Separate read and write models. Optimize each for its specific access pattern.
                </p>
                <div className="text-xs text-indigo-600 mt-2">
                  <strong>Netflix Example:</strong> Write to SQL, read from Elasticsearch for search
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg">
                <h4 className="font-semibold text-teal-800 mb-2">Event Sourcing</h4>
                <p className="text-teal-700 text-sm">
                  Store state changes as events. Rebuild state by replaying events.
                </p>
                <div className="text-xs text-teal-600 mt-2">
                  <strong>Netflix Example:</strong> User viewing history, recommendation engine
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Migration Strategies</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Dual Writes:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Write to both old and new systems
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Feature Flags:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Gradual rollout of new data layer
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Backwards Compatibility:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Support old and new data formats
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Monitoring & Rollback:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Track performance and have rollback plans
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Performance Engineering */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-orange-100 p-3 rounded-lg">
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Performance Engineering at Scale</h2>
            <p className="text-gray-600">
              Measuring, monitoring, and optimizing for global performance
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Metrics & SLOs</h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Latency</h4>
                </div>
                <p className="text-green-700 text-sm mb-2">
                  Time for request to complete. Critical for user experience.
                </p>
                <div className="text-xs text-green-600">
                  <strong>Target:</strong> p95 &lt; 500ms for API calls, &lt; 3s for page loads
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Throughput</h4>
                </div>
                <p className="text-blue-700 text-sm mb-2">
                  Requests processed per second. Measures system capacity.
                </p>
                <div className="text-xs text-blue-600">
                  <strong>Target:</strong> Handle traffic spikes up to 10x normal load
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">Availability</h4>
                </div>
                <p className="text-purple-700 text-sm mb-2">
                  Percentage of time system is operational and responsive.
                </p>
                <div className="text-xs text-purple-600">
                  <strong>Target:</strong> 99.9% uptime (8.77 hours downtime/year)
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Performance Optimization Techniques
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Profiling & Monitoring:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    APM tools, distributed tracing, custom metrics
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Load Testing:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Simulate real-world traffic patterns and spikes
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Caching Strategy:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Multi-level caching with intelligent invalidation
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Database Optimization:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Indexing, query optimization, connection pooling
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">CDN & Edge Computing:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Reduce latency through geographic distribution
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-800">Async Processing:</strong>
                  <span className="text-gray-700 text-sm ml-1">
                    Offload heavy operations to background jobs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-start space-x-3">
            <Clock className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                Performance Engineering Culture
              </h3>
              <p className="text-orange-700 text-sm mb-3">
                Performance is not an afterthought—it's a fundamental requirement that influences
                every architectural decision. Organizations like Netflix treat performance as a
                feature that requires continuous investment and measurement.
              </p>
              <div className="text-sm text-orange-700">
                <strong>Key Principles:</strong> Measure everything, set ambitious targets, automate
                performance testing, invest in tooling, and foster a culture of performance
                awareness across all teams.
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Case Studies</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Netflix Evolution"
            description="Monolith to microservices journey"
            colorScheme="green"
            onClick={() => navigateToSection('Netflix Evolution')}
          />
          <NavigationCard
            title="Global CDN Strategies"
            description="Content delivery at scale"
            colorScheme="green"
            onClick={() => navigateToSection('Global CDN Strategies')}
          />
          <NavigationCard
            title="Polyglot Persistence"
            description="Multi-database architectures"
            colorScheme="green"
            onClick={() => navigateToSection('Polyglot Persistence')}
          />
          <NavigationCard
            title="Performance Engineering"
            description="Measuring and optimizing at scale"
            colorScheme="green"
            onClick={() => navigateToSection('Performance Engineering')}
          />
        </div>
      </ThemeCard>

      <ThemeCard>
        <div className="flex items-center space-x-3 mb-4">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">Business Impact</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <strong className="text-green-800">Revenue Growth:</strong>
            <div className="text-gray-600">Better performance = higher conversion</div>
          </div>
          <div>
            <strong className="text-green-800">Cost Reduction:</strong>
            <div className="text-gray-600">Efficient scaling reduces infrastructure costs</div>
          </div>
          <div>
            <strong className="text-green-800">User Satisfaction:</strong>
            <div className="text-gray-600">Fast, reliable systems build loyalty</div>
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
        title="Master Visualization and Communication"
        description="Learn how to communicate complex system designs effectively using the C4 model, architectural diagrams, and stakeholder communication techniques."
        buttonText="Study Visualization Techniques"
        onButtonClick={() => navigateToSection('Visualization Techniques')}
        colorScheme="green"
      />
    </>
  );
};

export default CaseStudies;
