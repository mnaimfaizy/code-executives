import React, { useState } from 'react';
import { Building2, Zap, Server, Database, ArrowRight, Users, Globe, Shield } from 'lucide-react';

interface ArchitectureComparison2DProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

const ArchitectureComparison2D: React.FC<ArchitectureComparison2DProps> = ({ className = '' }) => {
  const [currentArchitecture, setCurrentArchitecture] = useState<
    'monolithic' | 'microservices' | 'serverless'
  >('monolithic');
  const [isAnimating, setIsAnimating] = useState(false);

  const architectures = {
    monolithic: {
      name: 'Monolithic Architecture',
      description: 'Single unified application with all components tightly coupled',
      color: 'blue',
      components: ['UI', 'Business Logic', 'Database'],
      pros: ['Simple deployment', 'Easy testing', 'Performance'],
      cons: ['Scalability limits', 'Technology lock-in', 'Large codebases'],
      icon: Building2,
    },
    microservices: {
      name: 'Microservices Architecture',
      description: 'Decoupled services that communicate via APIs',
      color: 'green',
      components: ['User Service', 'Order Service', 'Payment Service', 'Notification Service'],
      pros: ['Independent scaling', 'Technology diversity', 'Fault isolation'],
      cons: ['Complex deployment', 'Network latency', 'Data consistency'],
      icon: Server,
    },
    serverless: {
      name: 'Serverless Architecture',
      description: 'Event-driven functions running on managed infrastructure',
      color: 'purple',
      components: ['API Gateway', 'Lambda Functions', 'Event Triggers', 'Managed Services'],
      pros: ['Zero server management', 'Auto-scaling', 'Pay-per-use'],
      cons: ['Cold starts', 'Vendor lock-in', 'Debugging complexity'],
      icon: Zap,
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
      }, 300);
    }
  };

  const currentArch = architectures[currentArchitecture];
  const IconComponent = currentArch.icon;

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 ${className}`}
    >
      {/* Architecture Selector */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg p-1 shadow-sm flex space-x-1">
          {Object.entries(architectures).map(([key, arch]) => (
            <button
              key={key}
              onClick={() => handleArchitectureChange(key as keyof typeof architectures)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                currentArchitecture === key
                  ? `bg-${arch.color}-500 text-white shadow-md`
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {arch.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Architecture Visualization */}
      <div className="flex flex-col lg:flex-row items-center justify-between h-64">
        {/* Left Side - Architecture Diagram */}
        <div className="flex-1 flex justify-center">
          <div
            className={`relative transition-all duration-500 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
          >
            {currentArchitecture === 'monolithic' && (
              <div className="relative">
                {/* Monolithic Block */}
                <div className="w-48 h-32 bg-blue-500 rounded-lg shadow-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Building2 className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-semibold">Monolithic App</div>
                  </div>
                </div>
                {/* Database Connection */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                </div>
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-8 bg-gray-600 rounded flex items-center justify-center">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            )}

            {currentArchitecture === 'microservices' && (
              <div className="relative">
                {/* Microservices */}
                <div className="flex space-x-4">
                  {currentArch.components.slice(0, 3).map((service) => (
                    <div key={service} className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-500 rounded-lg shadow-md flex items-center justify-center mb-2">
                        <Server className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-xs text-center text-gray-600 font-medium">{service}</div>
                    </div>
                  ))}
                </div>
                {/* API Gateway */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                  <div className="w-20 h-8 bg-orange-400 rounded flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs text-center text-gray-600 mt-1">API Gateway</div>
                </div>
                {/* Arrows */}
                <div className="absolute -top-4 left-1/4 w-1/2 h-8 flex justify-between">
                  <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                  <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                  <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                </div>
              </div>
            )}

            {currentArchitecture === 'serverless' && (
              <div className="relative">
                {/* Serverless Functions */}
                <div className="flex space-x-6">
                  {currentArch.components.slice(0, 3).map((component) => (
                    <div key={component} className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg shadow-md flex items-center justify-center mb-2">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xs text-center text-gray-600 font-medium">
                        {component}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Event Triggers */}
                <div className="absolute -top-8 left-0 right-0 flex justify-center space-x-8">
                  <div className="flex flex-col items-center">
                    <Users className="w-6 h-6 text-orange-500" />
                    <div className="text-xs text-gray-600 mt-1">User Action</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Shield className="w-6 h-6 text-red-500" />
                    <div className="text-xs text-gray-600 mt-1">Security Event</div>
                  </div>
                </div>
                {/* Cloud Infrastructure */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="w-32 h-6 bg-gray-300 rounded flex items-center justify-center">
                    <div className="text-xs text-gray-600 font-medium">Cloud Provider</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Architecture Details */}
        <div className="flex-1 lg:ml-8 mt-6 lg:mt-0">
          <div
            className={`transition-all duration-500 ${isAnimating ? 'opacity-50 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg bg-${currentArch.color}-100`}>
                <IconComponent className={`w-6 h-6 text-${currentArch.color}-600`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{currentArch.name}</h3>
                <p className="text-sm text-gray-600">{currentArch.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-green-800 mb-2">✅ Advantages</h4>
                <ul className="text-xs text-green-700 space-y-1">
                  {currentArch.pros.map((pro, index) => (
                    <li key={index}>• {pro}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-red-800 mb-2">⚠️ Challenges</h4>
                <ul className="text-xs text-red-700 space-y-1">
                  {currentArch.cons.map((con, index) => (
                    <li key={index}>• {con}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Key Components */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Key Components:</h4>
              <div className="flex flex-wrap gap-2">
                {currentArch.components.map((component, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 bg-${currentArch.color}-100 text-${currentArch.color}-800 text-xs rounded-full`}
                  >
                    {component}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button
          onClick={() => handleArchitectureChange('monolithic')}
          className={`w-3 h-3 rounded-full transition-all duration-200 ${
            currentArchitecture === 'monolithic'
              ? 'bg-blue-500 scale-125'
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          title="Monolithic Architecture"
        />
        <button
          onClick={() => handleArchitectureChange('microservices')}
          className={`w-3 h-3 rounded-full transition-all duration-200 ${
            currentArchitecture === 'microservices'
              ? 'bg-green-500 scale-125'
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          title="Microservices Architecture"
        />
        <button
          onClick={() => handleArchitectureChange('serverless')}
          className={`w-3 h-3 rounded-full transition-all duration-200 ${
            currentArchitecture === 'serverless'
              ? 'bg-purple-500 scale-125'
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          title="Serverless Architecture"
        />
      </div>
    </div>
  );
};

export default ArchitectureComparison2D;
