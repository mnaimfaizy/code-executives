import React, { useState, useCallback, useMemo } from 'react';
import {
  Server,
  Database,
  Cloud,
  Monitor,
  Smartphone,
  Globe,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Target,
  Layers,
  Settings,
  Eye,
  GitBranch,
  Users,
  BarChart3,
  Zap as Lightning,
} from 'lucide-react';

interface NetflixArchitecture2DProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

const NetflixArchitecture2D: React.FC<NetflixArchitecture2DProps> = React.memo(
  ({ className = '' }) => {
    const [activeLayer, setActiveLayer] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<
      'overview' | 'evolution' | 'challenges' | 'tools' | 'metrics'
    >('overview');
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationStep, setAnimationStep] = useState(0);
    const [currentScenario, setCurrentScenario] = useState<'outage' | 'peak' | 'chaos'>('outage');

    const architectureLayers = useMemo(
      () => ({
        client: {
          name: 'Client Layer',
          description: 'Multi-platform streaming applications',
          technologies: [
            'iOS App',
            'Android App',
            'Web Player',
            'Smart TV Apps',
            'Gaming Consoles',
            'Mobile Apps',
          ],
          icon: Smartphone,
          color: 'blue',
          position: { x: 50, y: 50 },
          challenges: ['Device fragmentation', 'Network variability', 'Offline capabilities'],
          solutions: [
            'Adaptive bitrate streaming',
            'Progressive download',
            'Device-specific optimizations',
          ],
        },
        edge: {
          name: 'Edge & CDN',
          description: 'Global content delivery and edge computing',
          technologies: [
            'Open Connect',
            'CloudFront',
            'Akamai',
            'Edge Computing',
            'Regional Caches',
          ],
          icon: Globe,
          color: 'green',
          position: { x: 200, y: 50 },
          challenges: ['Global distribution', 'Content localization', 'Bandwidth costs'],
          solutions: ['Custom CDN appliances', 'Regional content placement', 'Intelligent routing'],
        },
        gateway: {
          name: 'API Gateway & Routing',
          description: 'Request routing, authentication, and service discovery',
          technologies: ['Zuul 2', 'Spring Cloud Gateway', 'Eureka', 'Ribbon', 'Hystrix'],
          icon: Server,
          color: 'purple',
          position: { x: 350, y: 50 },
          challenges: ['Service discovery', 'Load balancing', 'Circuit breaking'],
          solutions: [
            'Client-side load balancing',
            'Service mesh integration',
            'Fault tolerance patterns',
          ],
        },
        services: {
          name: 'Microservices Layer',
          description: '700+ independent services handling business logic',
          technologies: [
            'Spring Boot',
            'Node.js',
            'Python',
            'Scala',
            'JVM Services',
            'Containerized Apps',
          ],
          icon: Layers,
          color: 'indigo',
          position: { x: 50, y: 200 },
          challenges: [
            'Service orchestration',
            'Inter-service communication',
            'Dependency management',
          ],
          solutions: ['Domain-driven design', 'Event-driven architecture', 'Service mesh (Istio)'],
        },
        data: {
          name: 'Data Layer',
          description: 'Distributed storage and real-time processing',
          technologies: ['Cassandra', 'MySQL', 'S3', 'Redshift', 'Elasticsearch', 'Kafka', 'Druid'],
          icon: Database,
          color: 'orange',
          position: { x: 200, y: 200 },
          challenges: ['Data consistency', 'High write throughput', 'Real-time analytics'],
          solutions: ['Eventual consistency', 'CQRS pattern', 'Lambda architecture'],
        },
        ml: {
          name: 'ML & AI Platform',
          description: 'Recommendation engines and personalization',
          technologies: [
            'TensorFlow',
            'PyTorch',
            'Metaflow',
            'MLlib',
            'Custom ML Models',
            'A/B Testing',
          ],
          icon: Monitor,
          color: 'red',
          position: { x: 350, y: 200 },
          challenges: ['Model training scale', 'Real-time inference', 'Feature engineering'],
          solutions: [
            'Distributed training',
            'Model serving optimization',
            'Automated ML pipelines',
          ],
        },
        infrastructure: {
          name: 'Cloud Infrastructure',
          description: 'AWS-based infrastructure with automation',
          technologies: ['EC2', 'Lambda', 'Kubernetes', 'Docker', 'Terraform', 'Spinnaker'],
          icon: Cloud,
          color: 'cyan',
          position: { x: 200, y: 350 },
          challenges: ['Infrastructure as code', 'Multi-region deployment', 'Cost optimization'],
          solutions: ['Immutable infrastructure', 'Blue-green deployments', 'Auto-scaling'],
        },
        observability: {
          name: 'Observability & Chaos',
          description: 'Monitoring, logging, and resilience testing',
          technologies: ['Atlas', 'Spectator', 'Mantis', 'Chaos Monkey', 'Vizceral', 'Haystack'],
          icon: Eye,
          color: 'emerald',
          position: { x: 50, y: 350 },
          challenges: ['System visibility', 'Failure detection', 'Performance monitoring'],
          solutions: ['Full-stack observability', 'Chaos engineering', 'Automated alerting'],
        },
      }),
      []
    );

    const connections = useMemo(
      () => [
        { from: 'client', to: 'edge', label: 'Stream Request', type: 'primary' },
        { from: 'edge', to: 'gateway', label: 'API Routing', type: 'primary' },
        { from: 'gateway', to: 'services', label: 'Service Calls', type: 'primary' },
        { from: 'services', to: 'data', label: 'Data Access', type: 'primary' },
        { from: 'services', to: 'ml', label: 'Recommendations', type: 'secondary' },
        { from: 'data', to: 'ml', label: 'Training Data', type: 'secondary' },
        { from: 'ml', to: 'services', label: 'Personalization', type: 'secondary' },
        { from: 'services', to: 'infrastructure', label: 'Compute', type: 'infrastructure' },
        { from: 'data', to: 'infrastructure', label: 'Storage', type: 'infrastructure' },
        { from: 'observability', to: 'services', label: 'Monitoring', type: 'observability' },
        { from: 'observability', to: 'infrastructure', label: 'Metrics', type: 'observability' },
      ],
      []
    );

    const evolutionStages = useMemo(
      () => [
        {
          year: '2007-2010',
          title: 'Monolithic Era',
          description: 'DVD-by-mail service with simple web interface',
          architecture: 'Single monolithic application on physical servers',
          challenges: [
            'Vertical scaling limits',
            'Deployment complexity',
            'Single points of failure',
          ],
          technologies: ['Java', 'Oracle DB', 'Physical Servers', 'Basic Load Balancing'],
        },
        {
          year: '2010-2012',
          title: 'Cloud Migration',
          description: 'Move to AWS cloud infrastructure',
          architecture: 'Monolithic app migrated to EC2 instances',
          challenges: ['Cloud learning curve', 'Cost management', 'Service reliability'],
          technologies: ['AWS EC2', 'ELB', 'S3', 'CloudWatch'],
        },
        {
          year: '2012-2014',
          title: 'Microservices Begin',
          description: 'Break monolithic app into smaller services',
          architecture: 'First microservices with basic service discovery',
          challenges: [
            'Service communication',
            'Deployment orchestration',
            'Monitoring complexity',
          ],
          technologies: ['Eureka', 'Zuul', 'Hystrix', 'Ribbon'],
        },
        {
          year: '2014-2016',
          title: 'Chaos Engineering',
          description: 'Implement systematic failure testing',
          architecture: 'Resilient microservices with chaos testing',
          challenges: ['System stability', 'Failure isolation', 'Recovery automation'],
          technologies: ['Chaos Monkey', 'Simian Army', 'Atlas', 'Spinnaker'],
        },
        {
          year: '2016-2018',
          title: 'Global Scale',
          description: 'Multi-region deployment and edge computing',
          architecture: 'Global microservices with regional isolation',
          challenges: ['Cross-region consistency', 'Latency optimization', 'Compliance'],
          technologies: ['Open Connect', 'Titus', 'Meson', 'Regional Caches'],
        },
        {
          year: '2018-Present',
          title: 'AI-First Platform',
          description: 'ML-driven personalization and content creation',
          architecture: 'AI-powered microservices ecosystem',
          challenges: ['ML model scale', 'Real-time inference', 'Content generation'],
          technologies: ['Metaflow', 'ML Platform', 'A/B Testing', 'Personalization Engine'],
        },
      ],
      []
    );

    const challengesAndSolutions = useMemo(
      () => [
        {
          challenge: 'Microservices Complexity',
          description: 'Managing 700+ services with interdependencies',
          solutions: [
            'Domain-driven design for service boundaries',
            'Service mesh (Istio) for traffic management',
            'Automated testing and deployment pipelines',
            "Clear ownership and Conway's Law alignment",
          ],
          impact: 'Reduced deployment time from weeks to hours',
        },
        {
          challenge: 'Global Scale Reliability',
          description: '99.99% uptime across 190+ countries',
          solutions: [
            'Chaos engineering with Chaos Monkey',
            'Multi-region active-active architecture',
            'Automated failover and recovery',
            'Circuit breaker patterns',
          ],
          impact: 'Maintained 99.99% availability during major outages',
        },
        {
          challenge: 'Data Consistency at Scale',
          description: 'Handling petabytes of data with real-time requirements',
          solutions: [
            'Eventual consistency model',
            'CQRS and event sourcing patterns',
            'Distributed transactions with sagas',
            'Conflict resolution strategies',
          ],
          impact: 'Process 1 billion+ hours of streaming data weekly',
        },
        {
          challenge: 'Cost Optimization',
          description: 'Managing $1B+ annual cloud infrastructure costs',
          solutions: [
            'Automated resource scaling',
            'Spot instances and reserved capacity',
            'Custom hardware optimization',
            'Usage-based cost allocation',
          ],
          impact: 'Optimized costs while maintaining performance',
        },
      ],
      []
    );

    const openSourceTools = useMemo(
      () => [
        {
          name: 'Zuul',
          description: 'Dynamic API Gateway and Edge Service',
          category: 'Service Routing',
          impact: 'Powers Netflix API traffic routing',
          github: 'Netflix/zuul',
        },
        {
          name: 'Eureka',
          description: 'Service Discovery and Registration',
          category: 'Service Discovery',
          impact: 'Enables dynamic service location',
          github: 'Netflix/eureka',
        },
        {
          name: 'Hystrix',
          description: 'Circuit Breaker and Fault Tolerance',
          category: 'Resilience',
          impact: 'Prevents cascading failures',
          github: 'Netflix/Hystrix',
        },
        {
          name: 'Ribbon',
          description: 'Client-Side Load Balancing',
          category: 'Load Balancing',
          impact: 'Intelligent request distribution',
          github: 'Netflix/ribbon',
        },
        {
          name: 'Chaos Monkey',
          description: 'Automated Chaos Engineering',
          category: 'Testing',
          impact: 'Improves system resilience',
          github: 'Netflix/chaosmonkey',
        },
        {
          name: 'Atlas',
          description: 'Dimensional Time-Series Database',
          category: 'Monitoring',
          impact: 'Real-time system observability',
          github: 'Netflix/atlas',
        },
      ],
      []
    );

    const scenarios = useMemo(
      () => ({
        outage: {
          name: 'Regional Outage Recovery',
          description: 'AWS us-east-1 region experiences major outage',
          steps: [
            {
              phase: 'detection',
              description: 'Atlas monitoring detects increased error rates',
              status: 'alert',
            },
            {
              phase: 'isolation',
              description: 'Traffic shifted to other regions automatically',
              status: 'recovery',
            },
            {
              phase: 'recovery',
              description: 'Services restored in backup regions',
              status: 'operational',
            },
            {
              phase: 'learning',
              description: 'Post-mortem analysis improves resilience',
              status: 'improved',
            },
          ],
        },
        peak: {
          name: 'Super Bowl Sunday',
          description: 'Massive concurrent streaming during live event',
          steps: [
            {
              phase: 'prediction',
              description: 'ML models predict traffic surge',
              status: 'prepared',
            },
            {
              phase: 'scaling',
              description: 'Auto-scaling provisions additional capacity',
              status: 'scaling',
            },
            {
              phase: 'optimization',
              description: 'CDN optimization routes traffic efficiently',
              status: 'optimized',
            },
            {
              phase: 'analysis',
              description: 'Performance data analyzed for future events',
              status: 'learned',
            },
          ],
        },
        chaos: {
          name: 'Chaos Engineering Test',
          description: 'Simulated service failures improve resilience',
          steps: [
            {
              phase: 'planning',
              description: 'Chaos Monkey selects services to disrupt',
              status: 'planned',
            },
            {
              phase: 'execution',
              description: 'Automated failure injection begins',
              status: 'testing',
            },
            {
              phase: 'monitoring',
              description: 'System behavior monitored in real-time',
              status: 'monitored',
            },
            {
              phase: 'improvement',
              description: 'Weaknesses identified and fixed',
              status: 'strengthened',
            },
          ],
        },
      }),
      []
    );

    const getConnectionPath = useCallback(
      (from: string, to: string) => {
        const fromPos = architectureLayers[from as keyof typeof architectureLayers].position;
        const toPos = architectureLayers[to as keyof typeof architectureLayers].position;
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;

        return `M ${fromPos.x + 40} ${fromPos.y + 40} Q ${midX + 40} ${midY + 40} ${toPos.x + 40} ${toPos.y + 40}`;
      },
      [architectureLayers]
    );

    const handleTabChange = useCallback((tab: typeof activeTab) => {
      setActiveTab(tab);
      setActiveLayer(null);
    }, []);

    const currentScenarioData = scenarios[currentScenario];

    return (
      <div
        className={`relative w-full min-h-screen bg-gradient-to-br from-red-50 via-white to-black rounded-2xl p-8 ${className}`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🎬 Netflix Architecture: From Monolith to Global Scale
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            The world's largest streaming service - a masterclass in microservices architecture,
            chaos engineering, and scaling to serve 270M+ subscribers worldwide.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-xl flex space-x-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Architecture', icon: Target },
              { id: 'evolution', label: 'Evolution', icon: TrendingUp },
              { id: 'challenges', label: 'Challenges', icon: AlertTriangle },
              { id: 'tools', label: 'Open Source', icon: GitBranch },
              { id: 'metrics', label: 'Scale Metrics', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id as typeof activeTab)}
                className={`px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-3 whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-red-500 text-white shadow-lg transform scale-105'
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
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Architecture Diagram */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Netflix Microservices Ecosystem
                </h3>
                <p className="text-gray-600">
                  700+ services working together to deliver seamless streaming
                </p>
              </div>

              <div className="relative w-full h-96 mx-auto mb-6">
                <svg viewBox="0 0 500 400" className="w-full h-full">
                  {/* Grid */}
                  <defs>
                    <pattern id="netflix-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1" />
                    </pattern>
                    <marker
                      id="arrow-primary"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626" />
                    </marker>
                    <marker
                      id="arrow-secondary"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#7c3aed" />
                    </marker>
                    <marker
                      id="arrow-infra"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" />
                    </marker>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#netflix-grid)" />

                  {/* Connections */}
                  {connections.map((conn, index) => {
                    const fromLayer =
                      architectureLayers[conn.from as keyof typeof architectureLayers];
                    const toLayer = architectureLayers[conn.to as keyof typeof architectureLayers];
                    const isActive = activeLayer === conn.from || activeLayer === conn.to;

                    return (
                      <g key={index}>
                        <path
                          d={getConnectionPath(conn.from, conn.to)}
                          fill="none"
                          stroke={
                            isActive
                              ? '#dc2626'
                              : conn.type === 'primary'
                                ? '#dc2626'
                                : conn.type === 'secondary'
                                  ? '#7c3aed'
                                  : conn.type === 'infrastructure'
                                    ? '#06b6d4'
                                    : '#d1d5db'
                          }
                          strokeWidth={isActive ? '4' : '2'}
                          markerEnd={`url(#arrow-${conn.type})`}
                          className="transition-all duration-200"
                        />

                        {/* Connection label */}
                        <text
                          x={(fromLayer.position.x + toLayer.position.x) / 2 + 40}
                          y={(fromLayer.position.y + toLayer.position.y) / 2 + 40}
                          textAnchor="middle"
                          className={`text-xs font-medium transition-colors ${
                            isActive ? 'fill-red-600' : 'fill-gray-500'
                          }`}
                        >
                          {conn.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Architecture Components */}
                  {Object.entries(architectureLayers).map(([key, layer]) => {
                    const Icon = layer.icon;
                    const isActive = activeLayer === key;

                    return (
                      <g key={key}>
                        {/* Component box */}
                        <rect
                          x={layer.position.x}
                          y={layer.position.y}
                          width="80"
                          height="80"
                          fill={isActive ? `var(--color-${layer.color}-100)` : 'white'}
                          stroke={isActive ? `var(--color-${layer.color}-600)` : '#d1d5db'}
                          strokeWidth={isActive ? '3' : '2'}
                          rx="12"
                          className="cursor-pointer transition-all duration-200 hover:shadow-lg"
                          onMouseEnter={() => setActiveLayer(key)}
                          onMouseLeave={() => setActiveLayer(null)}
                        />

                        {/* Icon */}
                        <foreignObject
                          x={layer.position.x + 20}
                          y={layer.position.y + 10}
                          width="40"
                          height="40"
                        >
                          <Icon
                            className={`w-10 h-10 ${
                              isActive ? `text-${layer.color}-600` : 'text-gray-600'
                            }`}
                          />
                        </foreignObject>

                        {/* Label */}
                        <text
                          x={layer.position.x + 40}
                          y={layer.position.y + 75}
                          textAnchor="middle"
                          className={`text-xs font-semibold ${
                            isActive ? `fill-${layer.color}-600` : 'fill-gray-700'
                          }`}
                        >
                          {layer.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Layer Details */}
              {activeLayer && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-lg bg-${architectureLayers[activeLayer as keyof typeof architectureLayers].color}-100`}
                    >
                      {React.createElement(
                        architectureLayers[activeLayer as keyof typeof architectureLayers].icon,
                        {
                          className: `w-8 h-8 text-${architectureLayers[activeLayer as keyof typeof architectureLayers].color}-600`,
                        }
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {architectureLayers[activeLayer as keyof typeof architectureLayers].name}
                      </h4>
                      <p className="text-gray-700 mb-4">
                        {
                          architectureLayers[activeLayer as keyof typeof architectureLayers]
                            .description
                        }
                      </p>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <Settings className="w-4 h-4 mr-2" />
                            Technologies
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {architectureLayers[
                              activeLayer as keyof typeof architectureLayers
                            ].technologies
                              .slice(0, 3)
                              .map((tech, index) => (
                                <span
                                  key={index}
                                  className={`px-2 py-1 bg-${architectureLayers[activeLayer as keyof typeof architectureLayers].color}-50 text-${architectureLayers[activeLayer as keyof typeof architectureLayers].color}-700 text-xs rounded-md font-medium`}
                                >
                                  {tech}
                                </span>
                              ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold text-red-800 mb-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Challenges
                          </h5>
                          <ul className="text-sm text-red-700 space-y-1">
                            {architectureLayers[
                              activeLayer as keyof typeof architectureLayers
                            ].challenges.map((challenge, index) => (
                              <li key={index}>• {challenge}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Solutions
                          </h5>
                          <ul className="text-sm text-green-700 space-y-1">
                            {architectureLayers[
                              activeLayer as keyof typeof architectureLayers
                            ].solutions.map((solution, index) => (
                              <li key={index}>• {solution}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Scenarios */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Real-World Scenarios</h3>
                  <p className="text-gray-600">See how Netflix handles real challenges at scale</p>
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
              <div className="bg-gradient-to-r from-gray-50 to-red-50 rounded-lg p-6 border border-gray-200">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {currentScenarioData.name}
                  </h4>
                  <p className="text-gray-600">{currentScenarioData.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {currentScenarioData.steps.map((step, index) => {
                    const isActive = isAnimating ? animationStep === index : false;
                    const statusColors = {
                      alert: 'bg-red-500',
                      recovery: 'bg-yellow-500',
                      operational: 'bg-green-500',
                      improved: 'bg-blue-500',
                      prepared: 'bg-purple-500',
                      scaling: 'bg-orange-500',
                      optimized: 'bg-teal-500',
                      learned: 'bg-indigo-500',
                      planned: 'bg-gray-500',
                      testing: 'bg-pink-500',
                      monitored: 'bg-cyan-500',
                      strengthened: 'bg-emerald-500',
                    };

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 transition-all duration-500 ${
                          isActive
                            ? 'border-red-500 bg-red-50 shadow-lg transform scale-105'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColors[step.status as keyof typeof statusColors]}`}
                          >
                            <span className="text-white text-sm font-bold">{index + 1}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-700">{step.phase}</div>
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

        {activeTab === 'evolution' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Netflix's Architectural Evolution
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From DVD-by-mail to global streaming giant: A decade of architectural transformation
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {evolutionStages.map((stage, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {stage.year}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">{stage.title}</h4>
                  </div>

                  <p className="text-gray-700 mb-4">{stage.description}</p>

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">Architecture</h5>
                      <p className="text-sm text-gray-600">{stage.architecture}</p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-red-800 mb-2">Challenges Faced</h5>
                      <ul className="text-sm text-red-700 space-y-1">
                        {stage.challenges.map((challenge, idx) => (
                          <li key={idx}>• {challenge}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-semibold text-blue-800 mb-2">Key Technologies</h5>
                      <div className="flex flex-wrap gap-2">
                        {stage.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-red-50 to-purple-50 rounded-xl p-8 border border-red-200">
              <h4 className="text-2xl font-bold text-red-800 mb-6 text-center">
                Key Lessons Learned
              </h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🏗️</div>
                  <h5 className="font-semibold text-red-700 mb-2">Start with Why</h5>
                  <p className="text-sm text-red-600">
                    Don't adopt microservices just because they're trendy. Solve real scaling
                    problems.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🔬</div>
                  <h5 className="font-semibold text-red-700 mb-2">Embrace Chaos</h5>
                  <p className="text-sm text-red-600">
                    Chaos engineering prevents failures by testing system resilience systematically.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🤝</div>
                  <h5 className="font-semibold text-red-700 mb-2">Open Source First</h5>
                  <p className="text-sm text-red-600">
                    Contributing tools back to the community creates better solutions for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Architectural Challenges & Solutions
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                How Netflix solved the hardest problems in distributed systems at massive scale
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {challengesAndSolutions.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{item.challenge}</h4>
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Solutions Implemented
                        </h5>
                        <ul className="text-sm text-green-700 space-y-1">
                          {item.solutions.map((solution, idx) => (
                            <li key={idx}>• {solution}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="text-sm font-semibold text-blue-800">
                          Impact: {item.impact}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200">
              <h4 className="text-2xl font-bold text-indigo-800 mb-6 text-center">
                Netflix Engineering Principles
              </h4>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl mb-3">🎯</div>
                  <h5 className="font-semibold text-indigo-700 mb-2">Freedom & Responsibility</h5>
                  <p className="text-sm text-indigo-600">
                    Engineers have freedom to innovate but own their code's reliability
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-3">🔄</div>
                  <h5 className="font-semibold text-indigo-700 mb-2">
                    Highly Aligned, Loosely Coupled
                  </h5>
                  <p className="text-sm text-indigo-600">
                    Teams aligned on goals but independent in implementation
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-3">🚀</div>
                  <h5 className="font-semibold text-indigo-700 mb-2">Context, Not Control</h5>
                  <p className="text-sm text-indigo-600">
                    Provide context and let teams make decisions
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-3">📊</div>
                  <h5 className="font-semibold text-indigo-700 mb-2">Data-Driven Decisions</h5>
                  <p className="text-sm text-indigo-600">
                    Use data and experimentation to guide all decisions
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Netflix Open Source Contributions
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Netflix has open-sourced dozens of tools that power their architecture and benefit
                the entire industry
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {openSourceTools.map((tool, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <GitBranch className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xl font-bold text-gray-900">{tool.name}</h4>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{tool.description}</p>
                      <div className="space-y-2">
                        <div className="text-sm text-green-700 font-medium">
                          🎯 Impact: {tool.impact}
                        </div>
                        <div className="text-sm text-blue-700">📦 GitHub: {tool.github}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
              <h4 className="text-2xl font-bold text-green-800 mb-6 text-center">
                Open Source Philosophy
              </h4>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl mb-3">🌍</div>
                  <h5 className="font-semibold text-green-700 mb-2">Community Benefit</h5>
                  <p className="text-sm text-green-600">
                    Tools that solve Netflix's problems often benefit the entire industry
                  </p>
                </div>
                <div>
                  <div className="text-4xl mb-3">🔄</div>
                  <h5 className="font-semibold text-green-700 mb-2">Continuous Improvement</h5>
                  <p className="text-sm text-green-600">
                    Community contributions improve tools beyond Netflix's internal needs
                  </p>
                </div>
                <div>
                  <div className="text-4xl mb-3">🎯</div>
                  <h5 className="font-semibold text-green-700 mb-2">Innovation Catalyst</h5>
                  <p className="text-sm text-green-600">
                    Open source accelerates innovation by enabling collaboration
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Netflix Scale Metrics</h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The numbers that make Netflix's architecture one of the most complex systems ever
                built
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-4xl font-bold mb-2">270M+</div>
                  <div className="text-red-100">Active Subscribers</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-3xl mb-2">🎬</div>
                  <div className="text-4xl font-bold mb-2">25K+</div>
                  <div className="text-blue-100">Titles in Catalog</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-3xl mb-2">⏱️</div>
                  <div className="text-4xl font-bold mb-2">1B+</div>
                  <div className="text-green-100">Hours Streamed Weekly</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-3xl mb-2">🛠️</div>
                  <div className="text-4xl font-bold mb-2">700+</div>
                  <div className="text-purple-100">Microservices</div>
                </div>
              </div>
            </div>

            {/* Technical Metrics */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                  System Performance
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Availability Target</span>
                    <span className="font-semibold text-green-600">99.99%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Global CDN Edges</span>
                    <span className="font-semibold text-blue-600">1,000+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Daily API Calls</span>
                    <span className="font-semibold text-purple-600">2B+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Data Processed Daily</span>
                    <span className="font-semibold text-orange-600">PB Scale</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-green-600" />
                  Engineering Scale
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Software Engineers</span>
                    <span className="font-semibold text-green-600">2,000+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Code Deploys Daily</span>
                    <span className="font-semibold text-blue-600">100+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">AWS Regions</span>
                    <span className="font-semibold text-purple-600">25+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Open Source Projects</span>
                    <span className="font-semibold text-orange-600">100+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chaos Engineering Impact */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8 border border-yellow-200">
              <h4 className="text-2xl font-bold text-yellow-800 mb-6 text-center flex items-center justify-center">
                <Lightning className="w-8 h-8 mr-3" />
                Chaos Engineering Results
              </h4>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600 mb-2">95%</div>
                  <div className="text-sm text-gray-600">Reduction in outage duration</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600 mb-2">60%</div>
                  <div className="text-sm text-gray-600">Faster incident response</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600 mb-2">99.99%</div>
                  <div className="text-sm text-gray-600">Uptime maintained</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 bg-gradient-to-r from-gray-50 to-red-50 rounded-xl p-8 border border-gray-200">
          <div className="grid md:grid-cols-5 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold text-gray-900 mb-2">Architecture</h4>
              <p className="text-sm text-gray-600">700+ microservices ecosystem</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔬</div>
              <h4 className="font-semibold text-gray-900 mb-2">Chaos Engineering</h4>
              <p className="text-sm text-gray-600">Systematic failure testing</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🌍</div>
              <h4 className="font-semibold text-gray-900 mb-2">Global Scale</h4>
              <p className="text-sm text-gray-600">190+ countries served</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📦</div>
              <h4 className="font-semibold text-gray-900 mb-2">Open Source</h4>
              <p className="text-sm text-gray-600">100+ tools contributed</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-900 mb-2">Data-Driven</h4>
              <p className="text-sm text-gray-600">ML-powered personalization</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default NetflixArchitecture2D;
