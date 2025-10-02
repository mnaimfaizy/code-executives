import React, { useState, useEffect } from 'react';
import {
  Server,
  Users,
  Zap,
  ArrowUp,
  ArrowRight,
  Database,
  Cloud,
  Layers,
  Network,
  TrendingUp,
  Info,
  Play,
  Pause,
  RotateCcw,
  BarChart3,
  Globe,
  Cpu,
  HardDrive,
} from 'lucide-react';

interface ScalingVisualization2DProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

type ScalingPattern =
  | 'vertical'
  | 'horizontal'
  | 'auto-scaling'
  | 'database-sharding'
  | 'replication'
  | 'hybrid';

interface ScalingMetrics {
  responseTime: number;
  throughput: number;
  cost: number;
  availability: number;
  complexity: 'Low' | 'Medium' | 'High';
}

interface RealWorldExample {
  company: string;
  pattern: ScalingPattern;
  challenge: string;
  solution: string;
  metrics: string;
}

const ScalingVisualization2D: React.FC<ScalingVisualization2DProps> = ({ className = '' }) => {
  const [scalingPattern, setScalingPattern] = useState<ScalingPattern>('vertical');
  const [userLoad, setUserLoad] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(0);

  // Auto-animation for demo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setUserLoad((prev) => {
          const newLoad = prev + 5;
          return newLoad > 100 ? 20 : newLoad;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePatternChange = (pattern: ScalingPattern) => {
    setIsAnimating(true);
    setTimeout(() => {
      setScalingPattern(pattern);
      setIsAnimating(false);
    }, 500);
  };

  const getMetrics = (): ScalingMetrics => {
    const baseMetrics = {
      vertical: {
        responseTime: 200 - userLoad,
        throughput: userLoad * 10,
        cost: userLoad * 2,
        availability: 95 - userLoad * 0.1,
        complexity: 'Low' as const,
      },
      horizontal: {
        responseTime: 150 - userLoad / getServerCount(),
        throughput: userLoad * 10 * getServerCount(),
        cost: getServerCount() * 50,
        availability: 99.5,
        complexity: 'Medium' as const,
      },
      'auto-scaling': {
        responseTime: 120 - userLoad / (getServerCount() + 1),
        throughput: userLoad * 12 * (getServerCount() + 1),
        cost: (getServerCount() + 1) * 60,
        availability: 99.9,
        complexity: 'High' as const,
      },
      'database-sharding': {
        responseTime: 100 - userLoad / getShardCount(),
        throughput: userLoad * 15 * getShardCount(),
        cost: getShardCount() * 40,
        availability: 99.7,
        complexity: 'High' as const,
      },
      replication: {
        responseTime: 80,
        throughput: userLoad * 20,
        cost: getReplicaCount() * 30,
        availability: 99.8,
        complexity: 'Medium' as const,
      },
      hybrid: {
        responseTime: 90 - userLoad / (getServerCount() + getShardCount()),
        throughput: userLoad * 18 * (getServerCount() + getShardCount()),
        cost: getServerCount() * 50 + getShardCount() * 40,
        availability: 99.95,
        complexity: 'High' as const,
      },
    };
    return baseMetrics[scalingPattern];
  };

  const getServerCount = () => {
    if (scalingPattern === 'vertical') return 1;
    if (scalingPattern === 'auto-scaling') return Math.max(1, Math.floor(userLoad / 20) + 1);
    return Math.max(1, Math.ceil(userLoad / 25));
  };

  const getShardCount = () => {
    return Math.max(1, Math.ceil(userLoad / 30));
  };

  const getReplicaCount = () => {
    return Math.max(2, Math.ceil(userLoad / 40));
  };

  const realWorldExamples: RealWorldExample[] = [
    {
      company: 'Netflix',
      pattern: 'auto-scaling',
      challenge:
        'Handle millions of concurrent streaming requests with unpredictable traffic spikes',
      solution:
        'Auto-scaling on AWS with thousands of microservices, CDN integration, and chaos engineering',
      metrics: '99.99% uptime, handles 1B+ hours of content daily',
    },
    {
      company: 'Twitter',
      pattern: 'database-sharding',
      challenge: 'Store and retrieve billions of tweets with real-time search requirements',
      solution: 'Database sharding by user ID, read replicas, and distributed caching',
      metrics: '500M+ tweets daily, sub-second search responses',
    },
    {
      company: 'Facebook',
      pattern: 'replication',
      challenge: 'Handle massive read loads for news feed and messaging with global distribution',
      solution: 'Multi-region replication with Apache Cassandra, read replicas, and edge caching',
      metrics: '2.8B+ users, 100B+ messages daily',
    },
    {
      company: 'Amazon',
      pattern: 'hybrid',
      challenge: 'E-commerce platform with complex transactions and massive product catalog',
      solution:
        'Hybrid approach: vertical scaling for critical services, horizontal for microservices, database sharding',
      metrics: '300M+ active customers, $500B+ annual revenue',
    },
  ];

  const scalingScenarios = [
    { name: 'Normal Load', load: 30, description: 'Typical daily traffic' },
    { name: 'Peak Hours', load: 70, description: 'High traffic periods' },
    { name: 'Traffic Spike', load: 95, description: 'Unexpected viral event' },
    { name: 'System Failure', load: 85, description: 'Partial system outage recovery' },
  ];

  const metrics = getMetrics();

  return (
    <div
      className={`relative w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 ${className}`}
    >
      {/* Header with Pattern Selection */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
          Scaling Strategies & Patterns
        </h3>

        {/* Pattern Selection Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {[
            { key: 'vertical', label: 'Vertical Scaling', icon: ArrowUp, color: 'blue' },
            { key: 'horizontal', label: 'Horizontal Scaling', icon: ArrowRight, color: 'green' },
            { key: 'auto-scaling', label: 'Auto-Scaling', icon: Zap, color: 'purple' },
            {
              key: 'database-sharding',
              label: 'Database Sharding',
              icon: Database,
              color: 'orange',
            },
            { key: 'replication', label: 'Replication', icon: Layers, color: 'indigo' },
            { key: 'hybrid', label: 'Hybrid Approach', icon: Network, color: 'teal' },
          ].map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => handlePatternChange(key as ScalingPattern)}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                scalingPattern === key
                  ? `bg-${color}-500 text-white shadow-md`
                  : `bg-white text-gray-600 hover:bg-${color}-50 border border-gray-200`
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Load Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">System Load:</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={userLoad}
              onChange={(e) => setUserLoad(Number(e.target.value))}
              className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-bold text-gray-900 w-12">{userLoad}%</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-lg transition-colors ${
                isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setUserLoad(50)}
              className="p-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="mt-4 flex flex-wrap gap-2">
          {scalingScenarios.map((scenario, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentScenario(index);
                setUserLoad(scenario.load);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                currentScenario === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {scenario.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="relative h-80 bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        {/* Cloud Layer (for auto-scaling) */}
        {scalingPattern === 'auto-scaling' && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center space-x-2">
              <Cloud className="w-4 h-4" />
              <span>Auto-Scaling Cloud</span>
            </div>
          </div>
        )}

        {/* Load Balancer */}
        {(scalingPattern === 'horizontal' ||
          scalingPattern === 'auto-scaling' ||
          scalingPattern === 'hybrid') && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center space-x-1">
              <Network className="w-3 h-3" />
              <span>Load Balancer</span>
            </div>
          </div>
        )}

        {/* User Requests Animation */}
        <div className="absolute top-4 left-4 flex space-x-1">
          {Array.from({ length: Math.floor(userLoad / 8) }, (_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${1 - userLoad / 200}s`,
              }}
            />
          ))}
        </div>

        {/* Application Servers */}
        <div
          className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${isAnimating ? 'scale-75 opacity-50' : 'scale-100 opacity-100'}`}
        >
          {scalingPattern === 'vertical' ? (
            // Vertical Scaling: Single powerful server
            <div className="relative">
              <div
                className="bg-blue-500 rounded-lg shadow-lg flex items-center justify-center transition-all duration-500"
                style={{
                  width: `${Math.min(120, 60 + userLoad * 0.6)}px`,
                  height: `${Math.min(120, 60 + userLoad * 0.6)}px`,
                }}
              >
                <div className="text-center text-white">
                  <Server className="w-8 h-8 mx-auto mb-1" />
                  <div className="text-xs font-semibold">Server 1</div>
                  <div className="text-xs opacity-80 flex items-center justify-center space-x-1">
                    <Cpu className="w-3 h-3" />
                    <span>{userLoad}%</span>
                  </div>
                </div>
              </div>
              {/* Resource indicators */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {Array.from({ length: Math.floor(userLoad / 20) + 1 }, (_, i) => (
                  <Zap key={i} className="w-3 h-3 text-yellow-500 animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            // Horizontal Scaling: Multiple servers
            <div className="flex space-x-3">
              {Array.from({ length: getServerCount() }, (_, i) => (
                <div key={i} className="relative">
                  <div
                    className={`w-16 h-16 rounded-lg shadow-lg flex items-center justify-center transition-all duration-300 ${
                      scalingPattern === 'auto-scaling' ? 'bg-purple-500' : 'bg-green-500'
                    }`}
                  >
                    <div className="text-center text-white">
                      <Server className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-semibold">S{i + 1}</div>
                    </div>
                  </div>
                  {/* Load distribution */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-2 bg-green-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 transition-all duration-500"
                        style={{ width: `${Math.min(100, (userLoad / getServerCount()) * 4)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Database Layer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          {scalingPattern === 'database-sharding' ? (
            // Sharded Database
            <div className="flex space-x-2">
              {Array.from({ length: getShardCount() }, (_, i) => (
                <div
                  key={i}
                  className="bg-orange-500 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center space-x-1"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>Shard {i + 1}</span>
                </div>
              ))}
            </div>
          ) : scalingPattern === 'replication' ? (
            // Replicated Database
            <div className="space-y-2">
              <div className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Primary DB</span>
              </div>
              <div className="flex space-x-2 justify-center">
                {Array.from({ length: getReplicaCount() - 1 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-indigo-400 text-white px-3 py-1 rounded text-xs font-semibold"
                  >
                    Replica {i + 1}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center space-x-1">
              <Database className="w-4 h-4" />
              <span>Database Layer</span>
            </div>
          )}
        </div>

        {/* Network Connections */}
        {(scalingPattern === 'horizontal' ||
          scalingPattern === 'auto-scaling' ||
          scalingPattern === 'hybrid') && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              {Array.from({ length: getServerCount() }, (_, i) => (
                <div key={i} className="w-0.5 h-8 bg-gray-400 animate-pulse"></div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Metrics Panel */}
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-48">
          <div className="flex items-center space-x-2 mb-3">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-800">Performance Metrics</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Response Time:</span>
              <span
                className={`font-semibold ${
                  metrics.responseTime < 100
                    ? 'text-green-600'
                    : metrics.responseTime < 150
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {metrics.responseTime}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Throughput:</span>
              <span className="font-semibold text-blue-600">{metrics.throughput} req/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Availability:</span>
              <span className="font-semibold text-green-600">
                {metrics.availability.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cost:</span>
              <span className="font-semibold text-purple-600">${metrics.cost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Complexity:</span>
              <span
                className={`font-semibold ${
                  metrics.complexity === 'Low'
                    ? 'text-green-600'
                    : metrics.complexity === 'Medium'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {metrics.complexity}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pattern Explanation */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-3">
            <div
              className={`p-2 rounded-lg ${
                scalingPattern === 'vertical'
                  ? 'bg-blue-100'
                  : scalingPattern === 'horizontal'
                    ? 'bg-green-100'
                    : scalingPattern === 'auto-scaling'
                      ? 'bg-purple-100'
                      : scalingPattern === 'database-sharding'
                        ? 'bg-orange-100'
                        : scalingPattern === 'replication'
                          ? 'bg-indigo-100'
                          : 'bg-teal-100'
              }`}
            >
              {scalingPattern === 'vertical' ? (
                <ArrowUp className="w-5 h-5 text-blue-600" />
              ) : scalingPattern === 'horizontal' ? (
                <ArrowRight className="w-5 h-5 text-green-600" />
              ) : scalingPattern === 'auto-scaling' ? (
                <Zap className="w-5 h-5 text-purple-600" />
              ) : scalingPattern === 'database-sharding' ? (
                <Database className="w-5 h-5 text-orange-600" />
              ) : scalingPattern === 'replication' ? (
                <Layers className="w-5 h-5 text-indigo-600" />
              ) : (
                <Network className="w-5 h-5 text-teal-600" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                {scalingPattern === 'vertical' && 'Vertical Scaling (Scale Up)'}
                {scalingPattern === 'horizontal' && 'Horizontal Scaling (Scale Out)'}
                {scalingPattern === 'auto-scaling' && 'Auto-Scaling with Cloud'}
                {scalingPattern === 'database-sharding' && 'Database Sharding'}
                {scalingPattern === 'replication' && 'Read Replication'}
                {scalingPattern === 'hybrid' && 'Hybrid Scaling Approach'}
              </h4>
              <p className="text-sm text-gray-600">
                {scalingPattern === 'vertical' &&
                  'Increase server capacity (CPU, RAM, storage) to handle more load. Simple but has physical limits and potential downtime during upgrades.'}
                {scalingPattern === 'horizontal' &&
                  'Add more servers to distribute load across multiple instances. Provides better fault tolerance and unlimited scaling potential.'}
                {scalingPattern === 'auto-scaling' &&
                  'Automatically add/remove servers based on demand using cloud platforms. Optimal for unpredictable traffic with minimal manual intervention.'}
                {scalingPattern === 'database-sharding' &&
                  'Split database into smaller pieces (shards) distributed across servers. Scales writes effectively but increases complexity.'}
                {scalingPattern === 'replication' &&
                  'Create multiple copies of data for read scaling. Primary handles writes, replicas handle reads. Improves availability and read performance.'}
                {scalingPattern === 'hybrid' &&
                  'Combines multiple scaling strategies for optimal performance. Uses vertical scaling for critical components and horizontal for distributed services.'}
              </p>
            </div>
          </div>
        </div>

        {/* Real-World Examples */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-800">Real-World Examples</span>
          </div>
          <div className="space-y-3">
            {realWorldExamples
              .filter((example) => example.pattern === scalingPattern)
              .map((example, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-3">
                  <div className="text-sm font-semibold text-gray-800">{example.company}</div>
                  <div className="text-xs text-gray-600 mt-1">{example.challenge}</div>
                  <div className="text-xs text-green-600 mt-1 font-medium">{example.metrics}</div>
                </div>
              ))}
            {realWorldExamples.filter((example) => example.pattern === scalingPattern).length ===
              0 && (
              <div className="text-sm text-gray-500 italic">
                This pattern is commonly used by modern cloud-native applications and microservices
                architectures.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trade-offs and Best Practices */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Key Considerations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-600">Advantages:</span>
                <ul className="text-gray-600 mt-1 space-y-1">
                  {scalingPattern === 'vertical' && (
                    <>
                      <li>• Simple implementation and management</li>
                      <li>• No code changes required</li>
                      <li>• Good for small to medium applications</li>
                    </>
                  )}
                  {scalingPattern === 'horizontal' && (
                    <>
                      <li>• Virtually unlimited scaling potential</li>
                      <li>• Better fault tolerance</li>
                      <li>• Cost-effective for large scale</li>
                    </>
                  )}
                  {scalingPattern === 'auto-scaling' && (
                    <>
                      <li>• Automatic resource management</li>
                      <li>• Cost optimization</li>
                      <li>• Handles traffic spikes gracefully</li>
                    </>
                  )}
                  {scalingPattern === 'database-sharding' && (
                    <>
                      <li>• Scales write operations effectively</li>
                      <li>• Distributes data geographically</li>
                      <li>• Reduces single points of failure</li>
                    </>
                  )}
                  {scalingPattern === 'replication' && (
                    <>
                      <li>• Improves read performance</li>
                      <li>• High availability and redundancy</li>
                      <li>• Easier to implement than sharding</li>
                    </>
                  )}
                  {scalingPattern === 'hybrid' && (
                    <>
                      <li>• Combines best of multiple approaches</li>
                      <li>• Optimized for specific use cases</li>
                      <li>• Maximum flexibility</li>
                    </>
                  )}
                </ul>
              </div>
              <div>
                <span className="font-medium text-red-600">Challenges:</span>
                <ul className="text-gray-600 mt-1 space-y-1">
                  {scalingPattern === 'vertical' && (
                    <>
                      <li>• Hardware limitations and vendor lock-in</li>
                      <li>• Potential downtime during upgrades</li>
                      <li>• Expensive for very large scale</li>
                    </>
                  )}
                  {scalingPattern === 'horizontal' && (
                    <>
                      <li>• Increased complexity in management</li>
                      <li>• Requires load balancing</li>
                      <li>• Data consistency challenges</li>
                    </>
                  )}
                  {scalingPattern === 'auto-scaling' && (
                    <>
                      <li>• Requires cloud infrastructure</li>
                      <li>• Scaling lag during sudden spikes</li>
                      <li>• Cost monitoring complexity</li>
                    </>
                  )}
                  {scalingPattern === 'database-sharding' && (
                    <>
                      <li>• Complex queries across shards</li>
                      <li>• Rebalancing data is difficult</li>
                      <li>• Increased operational complexity</li>
                    </>
                  )}
                  {scalingPattern === 'replication' && (
                    <>
                      <li>• Write operations still bottlenecked</li>
                      <li>• Replication lag issues</li>
                      <li>• Storage costs increase</li>
                    </>
                  )}
                  {scalingPattern === 'hybrid' && (
                    <>
                      <li>• Most complex to implement</li>
                      <li>• Requires deep expertise</li>
                      <li>• Higher operational costs</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScalingVisualization2D;
