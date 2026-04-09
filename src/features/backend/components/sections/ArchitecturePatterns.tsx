import React, { useState } from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import {
  Building2,
  Layers,
  Boxes,
  Radio,
  CircleDot,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface PatternData {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  analogy: string;
  mechanism: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

const patterns: PatternData[] = [
  {
    id: 'monolithic',
    title: 'Monolithic Architecture',
    subtitle: 'The Unified Estate',
    icon: <Building2 className="w-7 h-7" />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description:
      'The entire system — UI, business rules, and database logic — lives within a single, unified codebase. All components are tightly integrated and run as a single process. This is how most applications start and how many successful products (Basecamp, Stack Overflow) still operate.',
    analogy:
      'A giant single-room mansion. Easy to build at first, but if you want to paint the bathroom, you have to vacate the entire house. If the kitchen catches fire, the whole mansion burns down.',
    mechanism:
      'All code compiles into one deployable artifact (JAR, binary, bundle). Function calls between modules happen in-process — zero network overhead. The trade-off: any change, no matter how small, requires the entire application to be rebuilt and redeployed. All components share the same memory space, runtime, and deployment unit. At scale, build times grow, and a memory leak in one module can crash the entire system.',
    pros: [
      'Simple to develop, test, and deploy initially',
      'Zero-latency in-process calls between modules',
      'Easy end-to-end debugging with a single debugger',
      'Great for small teams, MVPs, and products with < 10 developers',
    ],
    cons: [
      'Hard to scale individual components independently',
      'Single failure can crash entire system ("blast radius = everything")',
      'Deployment requires full rebuild — risky for large codebases',
      'Technology lock-in — stuck with one language/framework',
    ],
    bestFor: 'Small teams, prototypes, MVPs. Real-world: Basecamp, early Twitter, early eBay',
  },
  {
    id: 'layered',
    title: 'Layered (N-Tier) Architecture',
    subtitle: 'The Corporate Hierarchy',
    icon: <Layers className="w-7 h-7" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description:
      'Code is organized into horizontal layers — Presentation, Business, Persistence, and Database — each with a specific responsibility. Communication only happens between adjacent layers. This is the most common architecture in enterprise Java and .NET applications.',
    analogy:
      'A corporate hierarchy. The Customer (Presentation) gives an order to the Clerk (Business), who writes it down for the Archivist (Persistence), who files it in the Cabinet (Database). The Customer never talks directly to the File Cabinet — every request flows through the proper chain of command.',
    mechanism:
      'Each layer depends only on the layer directly below it: Presentation → Business Logic → Data Access → Database. The key rule is that a layer NEVER skips levels — the UI cannot directly query the database. This creates clean contracts between layers. However, beware the "sink-hole anti-pattern" where a layer simply passes data through without adding logic (e.g., 80% of requests just pass through Business to Persistence unchanged).',
    pros: [
      'Clear separation of concerns — each layer has one job',
      'Easy to understand, widely known, and heavily documented',
      'Layers can be developed by different teams independently',
      'Industry-standard since the 1990s — massive tooling support',
    ],
    cons: [
      'Can become a "sink-hole" with pass-through layers adding no value',
      'Changes to database schema cascade through multiple layers',
      'Tight coupling between adjacent layers makes testing harder',
      'Performance overhead from layer traversal in high-throughput systems',
    ],
    bestFor: 'Enterprise CRUD apps, banking systems. Real-world: Spring Boot, ASP.NET MVC apps',
  },
  {
    id: 'microservices',
    title: 'Microservices Architecture',
    subtitle: 'The Modular City',
    icon: <Boxes className="w-7 h-7" />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description:
      'Break a large application into many tiny, independent services that communicate over a network. Each service has its own code and its own private database. Netflix runs over 1,000 microservices; Amazon deploys code every 11.6 seconds using this approach.',
    analogy:
      'A city of specialized shops — butcher, baker, candlestick maker. If the baker runs out of flour, people can still buy meat. But the city now needs roads and a post office (network, service mesh) to function.',
    mechanism:
      'Every service is a mini-application with its own code, private database, and deployment pipeline. Teams can update the Email Service without ever touching the Order Service. Communication happens via lightweight protocols (REST, gRPC, message queues). The "database-per-service" rule prevents coupling, but creates distributed data challenges. Requires infrastructure investment: service discovery, API gateway, distributed tracing, circuit breakers, and container orchestration (Kubernetes).',
    pros: [
      'Independent deployment — update one service without touching others',
      'Scale individual services based on demand (scale payment, not marketing)',
      'Technology diversity — use Python for ML, Go for networking, Node for API',
      "Failure isolation — a crash in one service doesn't cascade",
    ],
    cons: [
      'Network complexity — every call is now a network hop with latency',
      'Distributed data management — cross-service transactions are hard (Saga pattern)',
      'Operational overhead — need Kubernetes, service mesh, distributed tracing',
      'Debugging across 50+ services requires sophisticated observability tools',
    ],
    bestFor: 'Large-scale apps with multiple teams. Real-world: Netflix, Amazon, Uber, Spotify',
  },
  {
    id: 'event-driven',
    title: 'Event-Driven Architecture',
    subtitle: 'The Newsroom',
    icon: <Radio className="w-7 h-7" />,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description:
      'Components react to "events" announced to the whole system via a message broker. An Event Producer publishes events while Event Consumers listen and act on them asynchronously — producers and consumers never know about each other.',
    analogy:
      'A busy newsroom. A reporter (Producer) shouts "Breaking News!" Different departments (Consumers) independently start writing articles, printing papers, and updating the website. The reporter doesn\'t need to know who\'s listening.',
    mechanism:
      'When a user clicks "Buy," the Order Service publishes an OrderCreated event to a message broker (Kafka, RabbitMQ). Inventory, Shipping, Notification, and Analytics services each consume this event independently and asynchronously. Adding a new consumer (e.g., Fraud Detection) requires zero changes to the producer. Patterns include Event Sourcing (store every event as an immutable log) and CQRS (separate read and write models).',
    pros: [
      "Highly decoupled — producers don't know about consumers",
      'Excellent horizontal scalability via partitioned message brokers',
      'Real-time processing — react to events in milliseconds',
      'Easy to add new consumers without modifying existing services',
    ],
    cons: [
      'Event ordering and deduplication are hard at scale',
      'Complex debugging — events are asynchronous and distributed',
      'Eventual consistency — different services might be temporarily out of sync',
      'Message broker becomes a critical single point of failure',
    ],
    bestFor: 'Real-time systems, IoT, event streaming. Real-world: LinkedIn (Kafka), Uber, Stripe',
  },
  {
    id: 'hexagonal',
    title: 'Hexagonal / Onion Architecture',
    subtitle: 'The Protected Sanctuary',
    icon: <CircleDot className="w-7 h-7" />,
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    description:
      'The central "Core" contains only business rules and domain logic. Everything else — databases, UI frameworks, external APIs, message brokers — are "Adapters" that plug into the core via strictly-defined "Ports" (interfaces).',
    analogy:
      "A high-end stereo system. The Core is the amplifier — it processes audio regardless of the source. You can plug in a record player, CD player, or smartphone (Adapters) using standard audio cables (Ports). The amplifier doesn't care where the music comes from, and upgrading your speakers doesn't require changing the amplifier.",
    mechanism:
      'Dependency arrows always point inward toward the core. The domain layer defines Ports (interfaces like UserRepository or PaymentGateway). Infrastructure adapters implement those ports (PostgresUserRepository, StripePaymentAdapter). You can swap PostgreSQL for MongoDB, or Stripe for PayPal, without changing a single line of business logic. Testing becomes trivial — inject mock adapters and test pure domain logic in isolation.',
    pros: [
      'Business logic is 100% isolated from infrastructure decisions',
      'Highly testable — test domain logic without databases or HTTP',
      'Infrastructure can be swapped freely (SQL → NoSQL, REST → gRPC)',
      'Clean dependency direction — domain never depends on frameworks',
    ],
    cons: [
      'Higher initial complexity — more interfaces and abstractions upfront',
      'More boilerplate code (ports, adapters, dependency injection)',
      'Can be overkill for simple CRUD apps with minimal domain logic',
      'Steeper learning curve — team must understand dependency inversion',
    ],
    bestFor:
      'Domain-heavy apps needing long-term maintainability. Real-world: banking platforms, healthcare systems',
  },
];

const ArchitecturePatterns: React.FC = () => {
  const [activePattern, setActivePattern] = useState<string>('monolithic');
  const pattern = patterns.find((p) => p.id === activePattern) || patterns[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-zinc-50 rounded-2xl p-8 border border-slate-200 shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Core Backend Architectural Patterns
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed max-w-4xl">
          Architecture provides the blueprints of the digital world — guidelines and recipes that
          allow developers to build consistent, efficient, and resilient applications.
        </p>
      </div>

      {/* Pattern Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {patterns.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePattern(p.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
              activePattern === p.id
                ? `${p.bgColor} ${p.borderColor} ${p.color} shadow-md scale-105`
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-center mb-2">{p.icon}</div>
            <div className="text-xs font-semibold">{p.title.split(' ')[0]}</div>
          </button>
        ))}
      </div>

      {/* Active Pattern Detail */}
      <ThemeCard>
        <div className="flex items-center space-x-4 mb-6">
          <div
            className={`w-14 h-14 rounded-xl ${pattern.bgColor} flex items-center justify-center ${pattern.color}`}
          >
            {pattern.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{pattern.title}</h2>
            <p className="text-gray-500">{pattern.subtitle}</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6 leading-relaxed">{pattern.description}</p>

        {/* Visual representation */}
        <div className={`${pattern.bgColor} rounded-xl p-6 mb-6 border ${pattern.borderColor}`}>
          <h3 className="font-semibold text-gray-800 mb-3">How It Works</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{pattern.mechanism}</p>
        </div>

        {/* Analogy */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">💡 Physical Analogy</h3>
          <p className="text-gray-700 italic">&ldquo;{pattern.analogy}&rdquo;</p>
        </div>

        {/* Pros & Cons */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-green-700 mb-3 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Advantages</span>
            </h3>
            <ul className="space-y-2">
              {pattern.pros.map((pro, i) => (
                <li key={i} className="flex items-start space-x-2 text-gray-700 text-sm">
                  <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-red-700 mb-3 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Trade-offs</span>
            </h3>
            <ul className="space-y-2">
              {pattern.cons.map((con, i) => (
                <li key={i} className="flex items-start space-x-2 text-gray-700 text-sm">
                  <ArrowRight className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={`${pattern.bgColor} rounded-lg p-4 border ${pattern.borderColor} text-center`}
        >
          <span className="text-sm font-semibold text-gray-700">Best For: {pattern.bestFor}</span>
        </div>
      </ThemeCard>
    </div>
  );
};

export default ArchitecturePatterns;
