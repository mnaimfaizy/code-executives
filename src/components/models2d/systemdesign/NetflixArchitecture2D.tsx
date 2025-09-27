import React, { useState } from 'react';
import { Server, Database, Cloud, Zap, Monitor, Smartphone, Globe } from 'lucide-react';

interface NetflixArchitecture2DProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

const NetflixArchitecture2D: React.FC<NetflixArchitecture2DProps> = ({ className = '' }) => {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const architectureLayers = {
    client: {
      name: 'Client Layer',
      description: 'Multiple device platforms and applications',
      technologies: ['iOS App', 'Android App', 'Web App', 'Smart TV Apps', 'Gaming Consoles'],
      icon: Smartphone,
      color: 'blue',
      position: { x: 50, y: 50 },
    },
    cdn: {
      name: 'Content Delivery Network',
      description: 'Global CDN for video streaming',
      technologies: ['Akamai', 'CloudFront', 'Fastly', 'Edge Computing'],
      icon: Globe,
      color: 'green',
      position: { x: 200, y: 50 },
    },
    api: {
      name: 'API Gateway & Services',
      description: 'Microservices architecture with API gateway',
      technologies: ['Zuul', 'Spring Boot', 'Node.js', 'GraphQL', 'gRPC'],
      icon: Server,
      color: 'purple',
      position: { x: 350, y: 50 },
    },
    data: {
      name: 'Data Layer',
      description: 'Distributed data storage and processing',
      technologies: ['Cassandra', 'MySQL', 'S3', 'Redshift', 'Elasticsearch'],
      icon: Database,
      color: 'orange',
      position: { x: 50, y: 200 },
    },
    processing: {
      name: 'Data Processing',
      description: 'Real-time and batch data processing',
      technologies: ['Kafka', 'Spark', 'Flink', 'Hadoop', 'Presto'],
      icon: Zap,
      color: 'red',
      position: { x: 200, y: 200 },
    },
    ml: {
      name: 'Machine Learning',
      description: 'Recommendation and personalization engines',
      technologies: ['TensorFlow', 'PyTorch', 'MLlib', 'Custom ML Models'],
      icon: Monitor,
      color: 'indigo',
      position: { x: 350, y: 200 },
    },
    cloud: {
      name: 'Cloud Infrastructure',
      description: 'Multi-cloud deployment with AWS primary',
      technologies: ['EC2', 'Lambda', 'Kubernetes', 'Docker', 'Terraform'],
      icon: Cloud,
      color: 'cyan',
      position: { x: 200, y: 350 },
    },
  };

  const connections = [
    { from: 'client', to: 'cdn', label: 'Stream Request' },
    { from: 'cdn', to: 'api', label: 'API Calls' },
    { from: 'api', to: 'data', label: 'Data Access' },
    { from: 'api', to: 'processing', label: 'Event Streaming' },
    { from: 'data', to: 'processing', label: 'Batch Processing' },
    { from: 'processing', to: 'ml', label: 'Training Data' },
    { from: 'ml', to: 'api', label: 'Recommendations' },
    { from: 'api', to: 'cloud', label: 'Infrastructure' },
    { from: 'data', to: 'cloud', label: 'Storage' },
    { from: 'processing', to: 'cloud', label: 'Compute' },
  ];

  const getConnectionPath = (from: string, to: string) => {
    const fromPos = architectureLayers[from as keyof typeof architectureLayers].position;
    const toPos = architectureLayers[to as keyof typeof architectureLayers].position;
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;

    return `M ${fromPos.x + 40} ${fromPos.y + 40} Q ${midX + 40} ${midY + 40} ${toPos.x + 40} ${toPos.y + 40}`;
  };

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-red-50 to-black rounded-xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Netflix Architecture Case Study</h3>
          <p className="text-gray-600 text-sm">
            World's largest streaming service - handling billions of hours of content daily
          </p>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Architecture Diagram */}
      <div className="relative bg-white border-2 border-gray-200 rounded-lg h-80 overflow-hidden">
        <svg viewBox="0 0 500 400" className="w-full h-full">
          {/* Grid */}
          <defs>
            <pattern id="netflix-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#netflix-grid)" />

          {/* Connections */}
          {connections.map((conn, index) => {
            const fromLayer = architectureLayers[conn.from as keyof typeof architectureLayers];
            const toLayer = architectureLayers[conn.to as keyof typeof architectureLayers];
            const isActive = activeLayer === conn.from || activeLayer === conn.to;

            return (
              <g key={index}>
                <path
                  d={getConnectionPath(conn.from, conn.to)}
                  fill="none"
                  stroke={isActive ? '#dc2626' : '#d1d5db'}
                  strokeWidth={isActive ? '3' : '2'}
                  markerEnd="url(#netflix-arrow)"
                  className="transition-all duration-200"
                />
                {/* Arrow marker */}
                <defs>
                  <marker
                    id="netflix-arrow"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill={isActive ? '#dc2626' : '#d1d5db'} />
                  </marker>
                </defs>

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

      {/* Details Panel */}
      {showDetails && activeLayer && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-start space-x-4">
            <div
              className={`p-2 rounded-lg bg-${architectureLayers[activeLayer as keyof typeof architectureLayers].color}-100`}
            >
              {React.createElement(
                architectureLayers[activeLayer as keyof typeof architectureLayers].icon,
                {
                  className: `w-6 h-6 text-${architectureLayers[activeLayer as keyof typeof architectureLayers].color}-600`,
                }
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                {architectureLayers[activeLayer as keyof typeof architectureLayers].name}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {architectureLayers[activeLayer as keyof typeof architectureLayers].description}
              </p>

              <div>
                <div className="font-semibold text-gray-700 text-sm mb-2">Key Technologies:</div>
                <div className="flex flex-wrap gap-2">
                  {architectureLayers[
                    activeLayer as keyof typeof architectureLayers
                  ].technologies.map((tech, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 bg-${architectureLayers[activeLayer as keyof typeof architectureLayers].color}-50 text-${architectureLayers[activeLayer as keyof typeof architectureLayers].color}-700 text-xs rounded-md font-medium`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="mt-4 grid md:grid-cols-3 gap-4 text-center">
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-red-600">220M+</div>
          <div className="text-sm text-gray-600">Active Subscribers</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-red-600">15B+</div>
          <div className="text-sm text-gray-600">Hours Streamed Daily</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-red-600">190+</div>
          <div className="text-sm text-gray-600">Countries Served</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 max-w-xs">
        Hover over components to see connections and details. Netflix serves content to millions
        simultaneously.
      </div>
    </div>
  );
};

export default NetflixArchitecture2D;
