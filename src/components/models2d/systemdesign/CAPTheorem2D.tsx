import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Database,
  Zap,
  Clock,
  Network,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Shield,
  Activity,
  Target,
} from 'lucide-react';

interface CAPTheorem2DProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

const CAPTheorem2D: React.FC<CAPTheorem2DProps> = React.memo(({ className = '' }) => {
  const [selectedProperties, setSelectedProperties] = useState<Set<'C' | 'A' | 'P'>>(new Set());
  const [hoveredProperty, setHoveredProperty] = useState<'C' | 'A' | 'P' | null>(null);
  const [activeTab, setActiveTab] = useState<'basics' | 'metaphors' | 'databases' | 'pacelc'>(
    'basics'
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [currentScenario, setCurrentScenario] = useState<'bank' | 'social' | 'ecommerce'>('bank');

  const properties = useMemo(
    () => ({
      C: {
        name: 'Consistency',
        fullName: 'Strong Consistency',
        description: 'All nodes see the same data simultaneously',
        longDescription:
          'Every read receives the most recent write or an error. All nodes are in perfect sync.',
        color: 'blue',
        icon: Shield,
        emoji: '🔒',
        implications: {
          positive: [
            'Data integrity guaranteed',
            'Predictable behavior',
            'ACID transactions',
            'No stale reads',
          ],
          negative: [
            'Higher latency possible',
            'Reduced availability during partitions',
            'Complex coordination overhead',
          ],
        },
        examples: [
          'Banking systems',
          'Financial transactions',
          'Inventory management',
          'Order processing',
        ],
        databases: ['PostgreSQL', 'MySQL', 'Oracle', 'MongoDB (configurable)'],
        metaphor:
          'Like a perfectly synchronized orchestra where every musician plays in perfect harmony',
      },
      A: {
        name: 'Availability',
        fullName: 'High Availability',
        description: 'System remains operational despite failures',
        longDescription:
          'Every request receives a non-error response, though data may not be the most recent.',
        color: 'green',
        icon: Activity,
        emoji: '⚡',
        implications: {
          positive: [
            'Fault tolerance',
            'Continuous operation',
            'Better user experience',
            'Handles failures gracefully',
          ],
          negative: [
            'Eventual consistency',
            'Potential stale data',
            'Conflict resolution needed',
            'Complex reconciliation',
          ],
        },
        examples: [
          'Social media platforms',
          'E-commerce sites',
          'Content delivery networks',
          'Real-time messaging',
        ],
        databases: ['Cassandra', 'DynamoDB', 'CouchDB', 'Riak'],
        metaphor:
          'Like a resilient bridge that stays open even during storms, though traffic might be slower',
      },
      P: {
        name: 'Partition Tolerance',
        fullName: 'Partition Tolerance',
        description: 'System operates despite network failures',
        longDescription:
          'The system continues to function even when network partitions isolate nodes.',
        color: 'purple',
        icon: Network,
        emoji: '🌐',
        implications: {
          positive: [
            'Resilient to network failures',
            'Global distribution possible',
            'Scalable architecture',
            'Fault isolation',
          ],
          negative: [
            'Consistency challenges',
            'Complex reconciliation',
            'Eventual consistency trade-offs',
            'Higher complexity',
          ],
        },
        examples: [
          'Distributed databases',
          'Global applications',
          'Microservices architectures',
          'Cloud-native systems',
        ],
        databases: ['Cassandra', 'DynamoDB', 'CockroachDB', 'Cosmos DB'],
        metaphor:
          'Like a distributed city where neighborhoods can function independently during communication blackouts',
      },
    }),
    []
  );

  const scenarios = useMemo(
    () => ({
      bank: {
        name: 'Banking Transaction',
        description: 'Transferring $1000 between accounts',
        steps: [
          {
            phase: 'normal',
            description: 'Both accounts show correct balances',
            consistency: true,
            availability: true,
          },
          {
            phase: 'partition',
            description: 'Network partition occurs between bank branches',
            consistency: false,
            availability: false,
          },
          {
            phase: 'cp_choice',
            description: 'Bank chooses consistency - transaction fails to prevent inconsistency',
            consistency: true,
            availability: false,
          },
          {
            phase: 'ap_choice',
            description:
              'Bank chooses availability - transaction succeeds but creates temporary inconsistency',
            consistency: false,
            availability: true,
          },
        ],
      },
      social: {
        name: 'Social Media Post',
        description: 'User posts a message that gets millions of views',
        steps: [
          {
            phase: 'normal',
            description: 'Post appears instantly everywhere',
            consistency: true,
            availability: true,
          },
          {
            phase: 'partition',
            description: 'Global CDN experiences regional outage',
            consistency: false,
            availability: false,
          },
          {
            phase: 'cp_choice',
            description: "Platform chooses consistency - some users can't see post",
            consistency: true,
            availability: false,
          },
          {
            phase: 'ap_choice',
            description:
              'Platform chooses availability - post shows but may be temporarily inconsistent',
            consistency: false,
            availability: true,
          },
        ],
      },
      ecommerce: {
        name: 'E-commerce Purchase',
        description: 'Buying the last item in stock',
        steps: [
          {
            phase: 'normal',
            description: 'Inventory shows 1 item available',
            consistency: true,
            availability: true,
          },
          {
            phase: 'partition',
            description: 'Network split between warehouses and stores',
            consistency: false,
            availability: false,
          },
          {
            phase: 'cp_choice',
            description: 'Store chooses consistency - purchase blocked to prevent overselling',
            consistency: true,
            availability: false,
          },
          {
            phase: 'ap_choice',
            description: 'Store chooses availability - multiple customers might buy the same item',
            consistency: false,
            availability: true,
          },
        ],
      },
    }),
    []
  );

  const databaseExamples = useMemo(
    () => ({
      cp: [
        {
          name: 'PostgreSQL',
          description: 'Traditional RDBMS prioritizing consistency',
          useCase: 'Financial systems, inventory',
        },
        {
          name: 'MySQL',
          description: 'Relational database with strong consistency',
          useCase: 'E-commerce, CMS systems',
        },
        {
          name: 'MongoDB (CP mode)',
          description: 'NoSQL with configurable consistency',
          useCase: 'Content management, analytics',
        },
        {
          name: 'Oracle Database',
          description: 'Enterprise RDBMS with ACID guarantees',
          useCase: 'Banking, healthcare',
        },
      ],
      ap: [
        {
          name: 'Apache Cassandra',
          description: 'Distributed NoSQL prioritizing availability',
          useCase: 'Time-series data, IoT',
        },
        {
          name: 'Amazon DynamoDB',
          description: 'AWS NoSQL with eventual consistency',
          useCase: 'Mobile apps, gaming',
        },
        {
          name: 'CouchDB',
          description: 'Document database with multi-master replication',
          useCase: 'Offline-first apps',
        },
        {
          name: 'Riak',
          description: 'Distributed key-value store',
          useCase: 'Session storage, caching',
        },
      ],
      ca: [
        {
          name: 'Single-node databases',
          description: 'Traditional databases without distribution',
          useCase: 'Local applications',
        },
        {
          name: 'SQLite',
          description: 'Embedded database for single applications',
          useCase: 'Mobile apps, desktop software',
        },
      ],
    }),
    []
  );

  const metaphors = useMemo(
    () => [
      {
        title: 'ATM Network',
        description: 'Like interconnected ATMs across a city',
        analogy:
          'When the network fails, do you prevent all withdrawals (CP) or allow withdrawals with potential overdrafts (AP)?',
        icon: '🏧',
      },
      {
        title: 'Pizza Restaurant Chain',
        description: 'Multiple locations taking orders simultaneously',
        analogy:
          'During phone outages, do you stop taking orders (CP) or take orders and reconcile later (AP)?',
        icon: '🍕',
      },
      {
        title: 'Bank Branches',
        description: 'Distributed bank branches with shared accounts',
        analogy:
          'When inter-branch communication fails, do you freeze transactions (CP) or allow local operations (AP)?',
        icon: '🏦',
      },
      {
        title: 'Concert Hall',
        description: 'Musicians playing in perfect synchronization',
        analogy:
          'When stage monitors fail, do you stop the performance (CP) or continue with imperfect coordination (AP)?',
        icon: '🎵',
      },
    ],
    []
  );

  const handlePropertyToggle = useCallback(
    (property: 'C' | 'A' | 'P') => {
      const newSelected = new Set(selectedProperties);
      if (newSelected.has(property)) {
        newSelected.delete(property);
      } else if (newSelected.size < 2) {
        newSelected.add(property);
      }
      setSelectedProperties(newSelected);
    },
    [selectedProperties]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, property: 'C' | 'A' | 'P') => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handlePropertyToggle(property);
      }
    },
    [handlePropertyToggle]
  );

  const getUnavailableProperty = useCallback(() => {
    const all = new Set(['C', 'A', 'P'] as const);
    for (const prop of selectedProperties) {
      all.delete(prop);
    }
    return all.size === 1 ? Array.from(all)[0] : null;
  }, [selectedProperties]);

  const unavailableProperty = getUnavailableProperty();

  useEffect(() => {
    let interval: number;
    if (isAnimating) {
      interval = setInterval(() => {
        setAnimationStep((prev) => (prev + 1) % 4);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  const currentScenarioData = scenarios[currentScenario];

  return (
    <div
      className={`relative w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-2xl p-8 ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">🎯 CAP Theorem Explorer</h2>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          Discover the fundamental trade-offs in distributed systems through interactive
          visualizations, real-world metaphors, and practical database examples.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-2xl p-2 shadow-xl flex space-x-2 border border-gray-200">
          {[
            { id: 'basics', label: 'CAP Basics', icon: Target },
            { id: 'metaphors', label: 'Metaphors', icon: Lightbulb },
            { id: 'databases', label: 'Databases', icon: Database },
            { id: 'pacelc', label: 'PACELC', icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'basics' | 'metaphors' | 'databases' | 'pacelc')}
              className={`px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-3 ${
                activeTab === id
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'basics' && (
        <div className="space-y-8">
          {/* CAP Triangle */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">The CAP Triangle</h3>
              <p className="text-gray-600">
                Choose any 2 out of 3 properties. The third becomes unavailable during network
                partitions.
              </p>
            </div>

            <div className="relative w-96 h-96 mx-auto mb-6">
              <svg viewBox="0 0 300 260" className="w-full h-full">
                {/* Triangle */}
                <polygon
                  points="150,30 30,230 270,230"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                  className="transition-all duration-500"
                />

                {/* Property Labels */}
                <text
                  x="150"
                  y="20"
                  textAnchor="middle"
                  className="text-lg font-bold fill-gray-800"
                >
                  Consistency (C)
                </text>
                <text x="15" y="245" textAnchor="start" className="text-lg font-bold fill-gray-800">
                  Availability (A)
                </text>
                <text x="285" y="245" textAnchor="end" className="text-lg font-bold fill-gray-800">
                  Partition Tolerance (P)
                </text>

                {/* Interactive Areas */}
                {Object.entries(properties).map(([key, prop]) => {
                  const isSelected = selectedProperties.has(key as 'C' | 'A' | 'P');
                  const isUnavailable = unavailableProperty === key;
                  const isHovered = hoveredProperty === key;

                  let circleX = 150,
                    circleY = 130;
                  if (key === 'C') {
                    circleX = 150;
                    circleY = 80;
                  } else if (key === 'A') {
                    circleX = 80;
                    circleY = 180;
                  } else if (key === 'P') {
                    circleX = 220;
                    circleY = 180;
                  }

                  return (
                    <g key={key}>
                      {/* Clickable area */}
                      <circle
                        cx={circleX}
                        cy={circleY}
                        r="30"
                        fill={
                          isSelected
                            ? `var(--color-${prop.color}-500)`
                            : isUnavailable
                              ? '#ef4444'
                              : isHovered
                                ? `var(--color-${prop.color}-100)`
                                : '#f3f4f6'
                        }
                        stroke={isHovered ? `var(--color-${prop.color}-600)` : '#d1d5db'}
                        strokeWidth={isSelected ? '4' : '2'}
                        className="cursor-pointer transition-all duration-300 hover:scale-110"
                        onClick={() => handlePropertyToggle(key as 'C' | 'A' | 'P')}
                        onMouseEnter={() => setHoveredProperty(key as 'C' | 'A' | 'P')}
                        onMouseLeave={() => setHoveredProperty(null)}
                        onKeyDown={(e) => handleKeyDown(e, key as 'C' | 'A' | 'P')}
                        tabIndex={0}
                        role="button"
                        aria-label={`${prop.fullName}: ${prop.description}. ${isSelected ? 'Selected' : isUnavailable ? 'Unavailable' : 'Available'}. Press Enter or Space to ${isSelected ? 'deselect' : 'select'}.`}
                        aria-pressed={isSelected}
                      />

                      {/* Icon */}
                      <foreignObject x={circleX - 12} y={circleY - 12} width="24" height="24">
                        <div className="flex items-center justify-center w-full h-full">
                          <prop.icon className="w-6 h-6 text-white" />
                        </div>
                      </foreignObject>

                      {/* Property letter */}
                      <text
                        x={circleX}
                        y={circleY + 40}
                        textAnchor="middle"
                        className={`text-sm font-bold ${
                          isSelected
                            ? 'fill-white'
                            : isUnavailable
                              ? 'fill-red-600'
                              : 'fill-gray-600'
                        }`}
                      >
                        {key}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selection Status */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-4 bg-gray-50 px-6 py-3 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Selected:</span>
                {selectedProperties.size === 0 ? (
                  <span className="text-gray-500">None</span>
                ) : (
                  Array.from(selectedProperties).map((prop) => (
                    <span
                      key={prop}
                      className={`px-3 py-1 rounded-full text-xs font-semibold bg-${properties[prop].color}-100 text-${properties[prop].color}-800 border border-${properties[prop].color}-200`}
                    >
                      {properties[prop].name}
                    </span>
                  ))
                )}
                {unavailableProperty && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm font-medium text-red-600">Unavailable:</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                      {properties[unavailableProperty].name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Property Details */}
            {hoveredProperty && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-${properties[hoveredProperty].color}-100`}>
                    {React.createElement(properties[hoveredProperty].icon, {
                      className: 'w-8 h-8 text-white',
                    })}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {properties[hoveredProperty].fullName}
                    </h4>
                    <p className="text-gray-700 mb-4">
                      {properties[hoveredProperty].longDescription}
                    </p>
                    <p className="text-sm text-gray-600 italic mb-4">
                      {properties[hoveredProperty].metaphor}
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-700">Benefits</span>
                        </div>
                        <ul className="text-sm text-green-700 space-y-1">
                          {properties[hoveredProperty].implications.positive.map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-red-700">Trade-offs</span>
                        </div>
                        <ul className="text-sm text-red-700 space-y-1">
                          {properties[hoveredProperty].implications.negative.map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="font-semibold text-gray-700 text-sm mb-2">Use Cases:</div>
                      <div className="flex flex-wrap gap-2">
                        {properties[hoveredProperty].examples.map((example, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 bg-${properties[hoveredProperty].color}-50 text-${properties[hoveredProperty].color}-700 text-xs rounded-full border border-${properties[hoveredProperty].color}-200`}
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Real-world Implications */}
            {selectedProperties.size === 2 && unavailableProperty && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 mt-6">
                <h4 className="text-lg font-bold text-purple-800 mb-3 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Real-World Implications
                </h4>
                <div className="text-sm text-purple-700">
                  {unavailableProperty === 'C' && (
                    <p>
                      Choosing <strong>Availability + Partition Tolerance</strong> means sacrificing
                      strong consistency. This is common in systems like DynamoDB, Cassandra, and
                      social media platforms where eventual consistency is acceptable for better
                      user experience.
                    </p>
                  )}
                  {unavailableProperty === 'A' && (
                    <p>
                      Choosing <strong>Consistency + Partition Tolerance</strong> means sacrificing
                      availability during partitions. Traditional RDBMS like PostgreSQL and MySQL
                      follow this approach, ensuring data integrity even at the cost of temporary
                      unavailability.
                    </p>
                  )}
                  {unavailableProperty === 'P' && (
                    <p>
                      Choosing <strong>Consistency + Availability</strong> means you cannot tolerate
                      network partitions. This is only possible in single-datacenter systems where
                      network failures don't create partitions.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Scenarios */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Interactive Scenarios</h3>
                <p className="text-gray-600">See CAP theorem in action with real-world examples</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAnimating(!isAnimating)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isAnimating ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}
                >
                  {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setAnimationStep(0)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scenario Selector */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
                {Object.entries(scenarios).map(([key, scenario]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentScenario(key as keyof typeof scenarios)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentScenario === key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {scenario.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario Visualization */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">{currentScenarioData.name}</h4>
                <p className="text-gray-600">{currentScenarioData.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {currentScenarioData.steps.map((step, index) => {
                  const isActive = isAnimating ? animationStep === index : false;
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all duration-500 ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.consistency && step.availability
                              ? 'bg-green-500'
                              : step.consistency
                                ? 'bg-blue-500'
                                : step.availability
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                          }`}
                        >
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        <div className="flex space-x-2">
                          {step.consistency && <Shield className="w-4 h-4 text-blue-600" />}
                          {step.availability && <Activity className="w-4 h-4 text-green-600" />}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{step.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metaphors' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">CAP Theorem Through Metaphors</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complex distributed systems concepts become clearer when explained through everyday
              analogies
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {metaphors.map((metaphor, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{metaphor.icon}</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{metaphor.title}</h4>
                  <p className="text-gray-600 mb-4">{metaphor.description}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 italic">{metaphor.analogy}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200">
            <h4 className="text-2xl font-bold text-indigo-800 mb-4 text-center">
              Why Metaphors Matter
            </h4>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-3">🧠</div>
                <h5 className="font-semibold text-indigo-700 mb-2">Memory Aid</h5>
                <p className="text-sm text-indigo-600">
                  Metaphors help you remember complex concepts by connecting them to familiar
                  experiences.
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">💡</div>
                <h5 className="font-semibold text-indigo-700 mb-2">Intuition</h5>
                <p className="text-sm text-indigo-600">
                  Analogies build intuition about system behavior during different failure
                  scenarios.
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">🎯</div>
                <h5 className="font-semibold text-indigo-700 mb-2">Decision Making</h5>
                <p className="text-sm text-indigo-600">
                  Metaphors guide architectural decisions by highlighting real-world consequences.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'databases' && (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">CAP Theorem in Real Databases</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how popular databases implement CAP theorem trade-offs in practice
            </p>
          </div>

          {/* CP Databases */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900">
                  CP Databases (Consistency + Partition Tolerance)
                </h4>
                <p className="text-gray-600">
                  Prioritize data consistency, may sacrifice availability during partitions
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {databaseExamples.cp.map((db, index) => (
                <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h5 className="font-semibold text-blue-800 mb-2">{db.name}</h5>
                  <p className="text-sm text-blue-700 mb-2">{db.description}</p>
                  <div className="text-xs text-blue-600">
                    <strong>Use Case:</strong> {db.useCase}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AP Databases */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900">
                  AP Databases (Availability + Partition Tolerance)
                </h4>
                <p className="text-gray-600">
                  Prioritize availability, accept eventual consistency
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {databaseExamples.ap.map((db, index) => (
                <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <h5 className="font-semibold text-green-800 mb-2">{db.name}</h5>
                  <p className="text-sm text-green-700 mb-2">{db.description}</p>
                  <div className="text-xs text-green-600">
                    <strong>Use Case:</strong> {db.useCase}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CA Databases */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Database className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900">
                  CA Databases (Consistency + Availability)
                </h4>
                <p className="text-gray-600">
                  No partition tolerance - single-node or non-distributed systems
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {databaseExamples.ca.map((db, index) => (
                <div key={index} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <h5 className="font-semibold text-purple-800 mb-2">{db.name}</h5>
                  <p className="text-sm text-purple-700 mb-2">{db.description}</p>
                  <div className="text-xs text-purple-600">
                    <strong>Use Case:</strong> {db.useCase}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8 border border-yellow-200">
            <div className="flex items-center space-x-3 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-600" />
              <h4 className="text-xl font-bold text-yellow-800">Key Insights</h4>
            </div>
            <ul className="text-yellow-700 space-y-2">
              <li>
                • <strong>Most databases are configurable:</strong> Many modern databases allow you
                to tune the CAP balance based on your needs
              </li>
              <li>
                • <strong>Context matters:</strong> The "right" choice depends on your specific use
                case and business requirements
              </li>
              <li>
                • <strong>Hybrid approaches:</strong> Some systems use different CAP configurations
                for different data types or operations
              </li>
              <li>
                • <strong>Evolution continues:</strong> New databases and techniques are constantly
                pushing the boundaries of what's possible
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'pacelc' && (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">PACELC Theorem</h3>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              The modern extension to CAP theorem that considers latency-consistency trade-offs
              during normal operation
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-purple-100 to-blue-100 px-8 py-4 rounded-2xl border border-purple-200">
                <h4 className="text-2xl font-bold text-purple-800 mb-2">PACELC</h4>
                <p className="text-purple-700">Partitioned Else Latency vs Consistency</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h5 className="text-lg font-bold text-red-800 mb-3 flex items-center">
                    <Network className="w-5 h-5 mr-2" />
                    During Partition (P)
                  </h5>
                  <p className="text-red-700 mb-4">
                    When a network partition occurs, you must choose between:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Consistency (C)</span>
                      <span className="text-sm text-blue-600">or</span>
                      <Activity className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Availability (A)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h5 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Else (E) - Normal Operation
                  </h5>
                  <p className="text-green-700 mb-4">
                    During normal operation (no partitions), you must choose between:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-800">Latency (L)</span>
                      <span className="text-sm text-orange-600">or</span>
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Consistency (C)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h5 className="text-lg font-bold text-blue-800 mb-4">
                    Common PACELC Configurations
                  </h5>
                  <div className="space-y-4">
                    <div className="border border-blue-200 rounded p-3">
                      <div className="font-semibold text-blue-800">PA/EC (MongoDB)</div>
                      <div className="text-sm text-blue-600">
                        Partition-tolerant + Available, Else prioritize Consistency
                      </div>
                    </div>
                    <div className="border border-blue-200 rounded p-3">
                      <div className="font-semibold text-blue-800">PA/EL (Cassandra)</div>
                      <div className="text-sm text-blue-600">
                        Partition-tolerant + Available, Else prioritize Latency
                      </div>
                    </div>
                    <div className="border border-blue-200 rounded p-3">
                      <div className="font-semibold text-blue-800">PC/EC (CockroachDB)</div>
                      <div className="text-sm text-blue-600">
                        Partition-tolerant + Consistent, Else prioritize Consistency
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h5 className="text-lg font-bold text-purple-800 mb-4">Why PACELC Matters</h5>
                  <ul className="text-purple-700 space-y-2 text-sm">
                    <li>
                      • <strong>More nuanced decisions:</strong> Considers performance during normal
                      operation
                    </li>
                    <li>
                      • <strong>Real-world accuracy:</strong> Partitions are rare, but latency
                      trade-offs are constant
                    </li>
                    <li>
                      • <strong>Better architecture:</strong> Helps choose between strong
                      consistency vs. low latency
                    </li>
                    <li>
                      • <strong>Modern relevance:</strong> Addresses limitations of the original CAP
                      theorem
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200">
            <h4 className="text-2xl font-bold text-indigo-800 mb-6 text-center">
              PACELC in Action
            </h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🏦</div>
                <h5 className="font-semibold text-indigo-700 mb-2">Banking (PC/EC)</h5>
                <p className="text-sm text-indigo-600">
                  Strong consistency even during normal operation, partitions handled with
                  consistency priority
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📱</div>
                <h5 className="font-semibold text-indigo-700 mb-2">Social Media (PA/EL)</h5>
                <p className="text-sm text-indigo-600">
                  Fast responses during normal operation, eventual consistency acceptable
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🛒</div>
                <h5 className="font-semibold text-indigo-700 mb-2">E-commerce (PA/EC)</h5>
                <p className="text-sm text-indigo-600">
                  Available during partitions, but consistent during normal operation
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8 border border-gray-200">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl mb-2">🎯</div>
            <h4 className="font-semibold text-gray-900 mb-2">CAP Basics</h4>
            <p className="text-sm text-gray-600">
              Understand the fundamental trade-offs in distributed systems
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">💡</div>
            <h4 className="font-semibold text-gray-900 mb-2">Metaphors</h4>
            <p className="text-sm text-gray-600">
              Learn through real-world analogies and everyday examples
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">🗄️</div>
            <h4 className="font-semibold text-gray-900 mb-2">Databases</h4>
            <p className="text-sm text-gray-600">
              See CAP theorem applied in popular database systems
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">📈</div>
            <h4 className="font-semibold text-gray-900 mb-2">PACELC</h4>
            <p className="text-sm text-gray-600">
              Explore the modern extension considering latency trade-offs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CAPTheorem2D;
