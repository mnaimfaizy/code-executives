import React, { useState, useEffect } from 'react';
import {
  Castle,
  Building2,
  Zap,
  Database,
  Users,
  Shield,
  Cloud,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  ShoppingCart,
  Mail,
  CreditCard,
} from 'lucide-react';

interface ArchitectureComparison2DProps {
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

const ArchitectureComparison2D: React.FC<ArchitectureComparison2DProps> = ({ className = '' }) => {
  const [currentArchitecture, setCurrentArchitecture] = useState<
    'monolithic' | 'microservices' | 'serverless'
  >('monolithic');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const architectures = {
    monolithic: {
      name: 'Monolithic Architecture',
      shortName: 'Monolith',
      description: 'Single unified fortress - strong and simple, but inflexible at scale',
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      accentColor: 'bg-blue-500',
      icon: Castle,
      metaphor: 'A medieval castle - impenetrable but hard to expand',
      evolution: ['Simple MVP', 'Growing Complexity', 'Scaling Challenges'],
      visualElements: {
        main: '🏰',
        components: ['⚔️', '🛡️', '🏇'],
        connections: '🔗',
      },
    },
    microservices: {
      name: 'Microservices Architecture',
      shortName: 'Microservices',
      description: 'A bustling city of specialized buildings - flexible and scalable',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      accentColor: 'bg-green-500',
      icon: Building2,
      metaphor: 'A modern city - each building serves a purpose, connected by roads',
      evolution: ['Service Split', 'Independent Scaling', 'Complex Orchestration'],
      visualElements: {
        main: '🏙️',
        components: ['🏢', '🚗', '🌉'],
        connections: '🚦',
      },
    },
    serverless: {
      name: 'Serverless Architecture',
      shortName: 'Serverless',
      description: 'Magical cloud functions - appear when needed, vanish when done',
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      accentColor: 'bg-purple-500',
      icon: Zap,
      metaphor: 'A magical cloud - functions appear and disappear like lightning',
      evolution: ['Event Triggers', 'Auto Scaling', 'Cost Optimization'],
      visualElements: {
        main: '☁️',
        components: ['⚡', '🔮', '💨'],
        connections: '🌩️',
      },
    },
  };

  const metrics = {
    monolithic: {
      scalability: { value: 3, label: 'Scalability', description: 'Whole system scales together' },
      complexity: { value: 2, label: 'Complexity', description: 'Simple to understand initially' },
      deployment: { value: 4, label: 'Deployment', description: 'Single deploy, fast and easy' },
      maintenance: { value: 2, label: 'Maintenance', description: 'All in one place' },
      cost: { value: 3, label: 'Cost Efficiency', description: 'Predictable resource usage' },
      innovation: { value: 2, label: 'Innovation Speed', description: 'Slow to adopt new tech' },
    },
    microservices: {
      scalability: { value: 5, label: 'Scalability', description: 'Scale individual services' },
      complexity: { value: 4, label: 'Complexity', description: 'Distributed system challenges' },
      deployment: { value: 2, label: 'Deployment', description: 'Complex orchestration needed' },
      maintenance: { value: 4, label: 'Maintenance', description: 'Multiple services to manage' },
      cost: { value: 4, label: 'Cost Efficiency', description: 'Pay for what you scale' },
      innovation: { value: 5, label: 'Innovation Speed', description: 'Adopt tech per service' },
    },
    serverless: {
      scalability: { value: 5, label: 'Scalability', description: 'Infinite auto-scaling' },
      complexity: { value: 3, label: 'Complexity', description: 'Abstract away infrastructure' },
      deployment: { value: 5, label: 'Deployment', description: 'Deploy functions instantly' },
      maintenance: { value: 3, label: 'Maintenance', description: 'No server management' },
      cost: { value: 5, label: 'Cost Efficiency', description: 'Pay per execution' },
      innovation: { value: 4, label: 'Innovation Speed', description: 'Focus on business logic' },
    },
  };

  const handleArchitectureChange = (
    architecture: 'monolithic' | 'microservices' | 'serverless'
  ) => {
    if (architecture !== currentArchitecture) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentArchitecture(architecture);
        setIsAnimating(false);
        setAnimationStep(0);
      }, 400);
    }
  };

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setAnimationStep(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setAnimationStep((prev) => (prev + 1) % 3);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentArch = architectures[currentArchitecture];
  const currentMetrics = metrics[currentArchitecture];
  const IconComponent = currentArch.icon;

  return (
    <div
      className={`relative w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-2xl p-8 ${className}`}
    >
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Architecture Evolution: From Castle to Cloud
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Watch how software architectures evolved from monolithic fortresses to distributed cities
          and magical clouds
        </p>
      </div>

      {/* Architecture Selector */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-2xl p-2 shadow-xl flex space-x-2 border border-gray-200">
          {Object.entries(architectures).map(([key, arch]) => (
            <button
              key={key}
              onClick={() => handleArchitectureChange(key as keyof typeof architectures)}
              className={`px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-3 ${
                currentArchitecture === key
                  ? `${arch.accentColor} text-white shadow-lg transform scale-105`
                  : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <arch.icon className="w-5 h-5" />
              <span>{arch.shortName}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side - Visual Architecture */}
        <div className="space-y-6">
          {/* Main Architecture Visualization */}
          <div
            className={`${currentArch.bgColor} ${currentArch.borderColor} border-2 rounded-2xl p-8 shadow-lg`}
          >
            <div className="text-center mb-6">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 ${currentArch.accentColor} rounded-2xl mb-4 shadow-lg`}
              >
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${currentArch.textColor} mb-2`}>
                {currentArch.name}
              </h3>
              <p className="text-gray-600 text-lg">{currentArch.description}</p>
            </div>

            {/* Animated Architecture Diagram */}
            <div className="relative h-80 flex items-center justify-center">
              <div
                className={`transition-all duration-500 ${isAnimating ? 'opacity-0 scale-75 rotate-12' : 'opacity-100 scale-100 rotate-0'}`}
              >
                {currentArchitecture === 'monolithic' && (
                  <div className="relative">
                    {/* Castle/Fortress */}
                    <div className="relative w-64 h-48 bg-gradient-to-b from-stone-600 to-stone-800 rounded-lg shadow-2xl">
                      {/* Castle towers */}
                      <div className="absolute -top-6 left-4 w-8 h-12 bg-stone-700 rounded-t-lg"></div>
                      <div className="absolute -top-6 right-4 w-8 h-12 bg-stone-700 rounded-t-lg"></div>
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-stone-700 rounded-t-lg"></div>

                      {/* Castle details */}
                      <div className="absolute top-4 left-4 right-4 h-2 bg-stone-500 rounded"></div>
                      <div className="absolute bottom-4 left-4 right-4 h-8 bg-stone-900 rounded flex items-center justify-center">
                        <Shield className="w-6 h-6 text-stone-300" />
                      </div>

                      {/* Pulsing effect */}
                      <div className="absolute inset-0 bg-blue-400 rounded-lg opacity-20 animate-pulse"></div>
                    </div>

                    {/* Single database */}
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                      <div className="w-20 h-8 bg-gray-600 rounded flex items-center justify-center shadow-lg">
                        <Database className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                {currentArchitecture === 'microservices' && (
                  <div className="relative">
                    {/* City of Services */}
                    <div className="flex justify-center space-x-4">
                      {/* Service buildings */}
                      {[
                        { icon: Users, label: 'Auth', color: 'bg-blue-500' },
                        { icon: ShoppingCart, label: 'Orders', color: 'bg-green-500' },
                        { icon: Mail, label: 'Notify', color: 'bg-purple-500' },
                        { icon: CreditCard, label: 'Payment', color: 'bg-red-500' },
                      ].map((service, index) => (
                        <div key={service.label} className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 ${service.color} rounded-lg shadow-lg flex items-center justify-center mb-2 animate-bounce`}
                            style={{ animationDelay: `${index * 0.2}s` }}
                          >
                            <service.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-xs text-gray-600 font-medium">{service.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* API Gateway */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        API Gateway
                      </div>
                    </div>

                    {/* Communication lines */}
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                        </marker>
                      </defs>
                      <path
                        d="M 80 60 Q 160 40 240 60"
                        stroke="#10b981"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                      <path
                        d="M 160 100 Q 160 80 160 60"
                        stroke="#10b981"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                    </svg>
                  </div>
                )}

                {currentArchitecture === 'serverless' && (
                  <div className="relative">
                    {/* Cloud with Functions */}
                    <div className="relative">
                      {/* Cloud */}
                      <div className="w-48 h-24 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full shadow-xl relative">
                        <div className="absolute inset-2 bg-white rounded-full opacity-90"></div>
                        <Cloud className="absolute inset-0 w-full h-full text-purple-600 p-4" />
                      </div>

                      {/* Lightning bolts (functions) */}
                      <div className="absolute -top-8 left-8 animate-bounce">
                        <Zap className="w-8 h-8 text-yellow-400" />
                      </div>
                      <div
                        className="absolute -top-6 right-8 animate-bounce"
                        style={{ animationDelay: '0.5s' }}
                      >
                        <Zap className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div
                        className="absolute -bottom-6 left-12 animate-bounce"
                        style={{ animationDelay: '1s' }}
                      >
                        <Zap className="w-5 h-5 text-yellow-600" />
                      </div>

                      {/* Event triggers */}
                      <div className="absolute -left-8 top-4 flex flex-col space-y-2">
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow">
                          User Login
                        </div>
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded shadow">
                          API Call
                        </div>
                      </div>

                      <div className="absolute -right-8 top-8 flex flex-col space-y-2">
                        <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded shadow">
                          File Upload
                        </div>
                        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded shadow">
                          Payment
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Evolution Timeline */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Evolution Path</h4>
              <div className="flex justify-between items-center">
                {currentArch.evolution.map((stage, index) => (
                  <div key={stage} className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full mb-2 transition-all duration-300 ${
                        index <= animationStep ? currentArch.accentColor : 'bg-gray-300'
                      }`}
                    ></div>
                    <div
                      className={`text-xs text-center font-medium ${
                        index <= animationStep ? currentArch.textColor : 'text-gray-400'
                      }`}
                    >
                      {stage}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Animation Controls */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={toggleAnimation}
                className={`p-3 rounded-full ${isPlaying ? 'bg-red-500' : 'bg-green-500'} text-white shadow-lg hover:shadow-xl transition-all duration-200`}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={resetAnimation}
                className="p-3 rounded-full bg-gray-500 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                {isPlaying ? 'Playing Evolution' : 'Click Play to see evolution'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Metrics & Details */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Architecture Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(currentMetrics).map(([key, metric]) => (
                <div
                  key={key}
                  className="relative"
                  onMouseEnter={() => setHoveredMetric(key)}
                  onMouseLeave={() => setHoveredMetric(null)}
                >
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < metric.value ? currentArch.accentColor : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${currentArch.accentColor} transition-all duration-500`}
                        style={{ width: `${(metric.value / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Tooltip */}
                  {hoveredMetric === key && (
                    <div className="absolute z-10 bg-black text-white text-xs rounded-lg p-2 shadow-lg -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      {metric.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real World Examples */}
          <div className={`${currentArch.bgColor} rounded-xl p-6 shadow-lg`}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Real World Examples</h3>
            <div className="space-y-3">
              {currentArchitecture === 'monolithic' && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">W</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">WordPress</div>
                      <div className="text-sm text-gray-600">Single PHP application</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Shopify (early days)</div>
                      <div className="text-sm text-gray-600">Rails monolith</div>
                    </div>
                  </div>
                </>
              )}

              {currentArchitecture === 'microservices' && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">N</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Netflix</div>
                      <div className="text-sm text-gray-600">600+ microservices</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">U</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Uber</div>
                      <div className="text-sm text-gray-600">1,000+ services</div>
                    </div>
                  </div>
                </>
              )}

              {currentArchitecture === 'serverless' && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">T</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Twilio</div>
                      <div className="text-sm text-gray-600">Event-driven functions</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Coca-Cola</div>
                      <div className="text-sm text-gray-600">IoT vending machines</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Architecture Metaphor */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">The Metaphor</h3>
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{currentArch.visualElements.main}</div>
              <div>
                <p className="text-gray-700 leading-relaxed">{currentArch.metaphor}</p>
                <div className="mt-3 flex space-x-2">
                  {currentArch.visualElements.components.map((emoji, index) => (
                    <span
                      key={index}
                      className="text-2xl animate-pulse"
                      style={{ animationDelay: `${index * 0.3}s` }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Comparison Table */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Architecture Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Aspect</th>
                <th className="text-center py-3 px-4 font-semibold text-blue-700">Monolithic</th>
                <th className="text-center py-3 px-4 font-semibold text-green-700">
                  Microservices
                </th>
                <th className="text-center py-3 px-4 font-semibold text-purple-700">Serverless</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-900">Development Speed</td>
                <td className="text-center py-3 px-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-900">Scalability</td>
                <td className="text-center py-3 px-4">
                  <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-900">Cost Efficiency</td>
                <td className="text-center py-3 px-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-gray-900">Operational Complexity</td>
                <td className="text-center py-3 px-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureComparison2D;
