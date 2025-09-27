import React, { useState } from 'react';
import { Server, Users, Zap, ArrowUp, ArrowRight, Database } from 'lucide-react';

interface ScalingVisualization2DProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

const ScalingVisualization2D: React.FC<ScalingVisualization2DProps> = ({ className = '' }) => {
  const [scalingType, setScalingType] = useState<'vertical' | 'horizontal'>('vertical');
  const [userLoad, setUserLoad] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleScalingChange = (type: 'vertical' | 'horizontal') => {
    setIsAnimating(true);
    setTimeout(() => {
      setScalingType(type);
      setIsAnimating(false);
    }, 500);
  };

  const handleLoadChange = (load: number) => {
    setUserLoad(load);
  };

  // Calculate server count based on load and scaling type
  const getServerCount = () => {
    if (scalingType === 'vertical') {
      return 1; // Single server, just gets bigger
    } else {
      // Horizontal scaling: more servers as load increases
      return Math.max(1, Math.ceil(userLoad / 25));
    }
  };

  const serverCount = getServerCount();
  const serverSize = scalingType === 'vertical' ? Math.min(100, 50 + userLoad * 0.5) : 60;

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 ${className}`}
    >
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex space-x-2">
          <button
            onClick={() => handleScalingChange('vertical')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              scalingType === 'vertical'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <ArrowUp className="w-4 h-4 inline mr-2" />
            Vertical Scaling
          </button>
          <button
            onClick={() => handleScalingChange('horizontal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              scalingType === 'horizontal'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <ArrowRight className="w-4 h-4 inline mr-2" />
            Horizontal Scaling
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <Users className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Load:</span>
          <input
            type="range"
            min="10"
            max="100"
            value={userLoad}
            onChange={(e) => handleLoadChange(Number(e.target.value))}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-bold text-gray-900 w-12">{userLoad}%</span>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="relative h-64 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Load Balancer (for horizontal scaling) */}
        {scalingType === 'horizontal' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
              Load Balancer
            </div>
          </div>
        )}

        {/* User Requests */}
        <div className="absolute top-2 left-4 flex space-x-1">
          {Array.from({ length: Math.floor(userLoad / 10) }, (_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        {/* Servers */}
        <div
          className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${isAnimating ? 'scale-75 opacity-50' : 'scale-100 opacity-100'}`}
        >
          {scalingType === 'vertical' ? (
            // Vertical Scaling: Single server that grows
            <div className="relative">
              <div
                className="bg-blue-500 rounded-lg shadow-lg flex items-center justify-center transition-all duration-500"
                style={{
                  width: `${serverSize}px`,
                  height: `${serverSize}px`,
                }}
              >
                <div className="text-center text-white">
                  <Server
                    className={`mx-auto mb-1 transition-all duration-500`}
                    style={{ width: `${serverSize * 0.3}px`, height: `${serverSize * 0.3}px` }}
                  />
                  <div className="text-xs font-semibold">Server 1</div>
                  <div className="text-xs opacity-80">{userLoad}% Load</div>
                </div>
              </div>
              {/* Performance indicators */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-1">
                  {Array.from({ length: Math.floor(userLoad / 20) + 1 }, (_, i) => (
                    <Zap key={i} className="w-3 h-3 text-yellow-500" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Horizontal Scaling: Multiple servers
            <div className="flex space-x-4">
              {Array.from({ length: serverCount }, (_, i) => (
                <div key={i} className="relative">
                  <div className="w-16 h-16 bg-green-500 rounded-lg shadow-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Server className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-semibold">S{i + 1}</div>
                    </div>
                  </div>
                  {/* Load distribution indicator */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-2 bg-green-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 transition-all duration-500"
                        style={{ width: `${Math.min(100, (userLoad / serverCount) * 4)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Database Layer */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-gray-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md">
            <Database className="w-4 h-4 inline mr-2" />
            Database Layer
          </div>
        </div>

        {/* Network connections (for horizontal scaling) */}
        {scalingType === 'horizontal' && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              {Array.from({ length: serverCount }, (_, i) => (
                <div key={i} className="w-0.5 h-8 bg-gray-300"></div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <div className="text-xs font-semibold text-gray-800 mb-2">Performance Metrics</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Response Time:</span>
              <span
                className={`font-semibold ${userLoad > 80 ? 'text-red-600' : userLoad > 60 ? 'text-yellow-600' : 'text-green-600'}`}
              >
                {scalingType === 'vertical'
                  ? `${Math.max(50, 200 - userLoad)}ms`
                  : `${Math.max(30, 150 - userLoad / serverCount)}ms`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Throughput:</span>
              <span className="font-semibold text-blue-600">
                {scalingType === 'vertical'
                  ? `${Math.floor(userLoad * 10)} req/s`
                  : `${Math.floor(userLoad * 10 * serverCount)} req/s`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cost:</span>
              <span className="font-semibold text-purple-600">
                {scalingType === 'vertical'
                  ? `$${(serverSize / 10).toFixed(0)}`
                  : `$${serverCount * 5}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scaling Strategy Explanation */}
      <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-start space-x-3">
          <div
            className={`p-2 rounded-lg ${scalingType === 'vertical' ? 'bg-blue-100' : 'bg-green-100'}`}
          >
            {scalingType === 'vertical' ? (
              <ArrowUp
                className={`w-5 h-5 ${scalingType === 'vertical' ? 'text-blue-600' : 'text-green-600'}`}
              />
            ) : (
              <ArrowRight
                className={`w-5 h-5 ${scalingType === 'horizontal' ? 'text-green-600' : 'text-blue-600'}`}
              />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">
              {scalingType === 'vertical'
                ? 'Vertical Scaling (Scale Up)'
                : 'Horizontal Scaling (Scale Out)'}
            </h4>
            <p className="text-sm text-gray-600">
              {scalingType === 'vertical'
                ? `Increase server capacity (CPU, RAM, storage) to handle more load. Best for applications with single points of processing or when you need simplicity.`
                : `Add more servers to distribute load across multiple instances. Best for applications that can be horizontally partitioned and need high availability.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScalingVisualization2D;
