import React, { useState, useEffect } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface EdgeNetworkProps extends BaseNextJSVisualizationProps {
  region: 'global' | 'regional' | 'local';
}

interface EdgeLocation {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  latency: number;
  status: 'active' | 'standby' | 'maintenance';
  load: number; // 0-100
}

interface RequestPath {
  id: string;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  progress: number; // 0-100
  latency: number;
  color: string;
}

const EdgeNetwork: React.FC<EdgeNetworkProps> = ({ region = 'global', className = '' }) => {
  const [userLocation] = useState({ lat: 40.7128, lng: -74.006 }); // New York
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [activeRequests, setActiveRequests] = useState<RequestPath[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Define edge locations based on region
  const getEdgeLocations = (regionType: string): EdgeLocation[] => {
    const globalLocations: EdgeLocation[] = [
      {
        id: 'nyc',
        name: 'New York',
        country: 'US',
        lat: 40.7128,
        lng: -74.006,
        latency: 5,
        status: 'active',
        load: 45,
      },
      {
        id: 'london',
        name: 'London',
        country: 'UK',
        lat: 51.5074,
        lng: -0.1278,
        latency: 85,
        status: 'active',
        load: 60,
      },
      {
        id: 'tokyo',
        name: 'Tokyo',
        country: 'JP',
        lat: 35.6762,
        lng: 139.6503,
        latency: 180,
        status: 'active',
        load: 70,
      },
      {
        id: 'sydney',
        name: 'Sydney',
        country: 'AU',
        lat: -33.8688,
        lng: 151.2093,
        latency: 220,
        status: 'active',
        load: 35,
      },
      {
        id: 'frankfurt',
        name: 'Frankfurt',
        country: 'DE',
        lat: 50.1109,
        lng: 8.6821,
        latency: 95,
        status: 'active',
        load: 55,
      },
      {
        id: 'singapore',
        name: 'Singapore',
        country: 'SG',
        lat: 1.3521,
        lng: 103.8198,
        latency: 160,
        status: 'active',
        load: 65,
      },
      {
        id: 'sao-paulo',
        name: 'São Paulo',
        country: 'BR',
        lat: -23.5505,
        lng: -46.6333,
        latency: 140,
        status: 'standby',
        load: 25,
      },
      {
        id: 'mumbai',
        name: 'Mumbai',
        country: 'IN',
        lat: 19.076,
        lng: 72.8777,
        latency: 150,
        status: 'active',
        load: 75,
      },
    ];

    const regionalLocations: EdgeLocation[] = [
      {
        id: 'nyc',
        name: 'New York',
        country: 'US',
        lat: 40.7128,
        lng: -74.006,
        latency: 5,
        status: 'active',
        load: 45,
      },
      {
        id: 'chicago',
        name: 'Chicago',
        country: 'US',
        lat: 41.8781,
        lng: -87.6298,
        latency: 25,
        status: 'active',
        load: 50,
      },
      {
        id: 'dallas',
        name: 'Dallas',
        country: 'US',
        lat: 32.7767,
        lng: -96.797,
        latency: 35,
        status: 'active',
        load: 40,
      },
      {
        id: 'los-angeles',
        name: 'Los Angeles',
        country: 'US',
        lat: 34.0522,
        lng: -118.2437,
        latency: 45,
        status: 'active',
        load: 60,
      },
      {
        id: 'miami',
        name: 'Miami',
        country: 'US',
        lat: 25.7617,
        lng: -80.1918,
        latency: 20,
        status: 'standby',
        load: 30,
      },
    ];

    const localLocations: EdgeLocation[] = [
      {
        id: 'nyc-1',
        name: 'Manhattan',
        country: 'US',
        lat: 40.7589,
        lng: -73.9851,
        latency: 2,
        status: 'active',
        load: 80,
      },
      {
        id: 'nyc-2',
        name: 'Brooklyn',
        country: 'US',
        lat: 40.6782,
        lng: -73.9442,
        latency: 3,
        status: 'active',
        load: 65,
      },
      {
        id: 'nyc-3',
        name: 'Queens',
        country: 'US',
        lat: 40.7282,
        lng: -73.7949,
        latency: 4,
        status: 'active',
        load: 55,
      },
      {
        id: 'nj-1',
        name: 'Newark',
        country: 'US',
        lat: 40.7357,
        lng: -74.1724,
        latency: 5,
        status: 'standby',
        load: 40,
      },
    ];

    switch (regionType) {
      case 'regional':
        return regionalLocations;
      case 'local':
        return localLocations;
      default:
        return globalLocations;
    }
  };

  const edgeLocations = getEdgeLocations(region);

  // Simulate requests
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(
      () => {
        // Create new request to random edge
        const availableEdges = edgeLocations.filter((e) => e.status === 'active');
        if (availableEdges.length === 0) return;

        const targetEdge = availableEdges[Math.floor(Math.random() * availableEdges.length)];
        const requestId = `req-${Date.now()}-${Math.random()}`;

        const newRequest: RequestPath = {
          id: requestId,
          from: userLocation,
          to: { lat: targetEdge.lat, lng: targetEdge.lng },
          progress: 0,
          latency: targetEdge.latency,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        };

        setActiveRequests((prev) => [...prev, newRequest]);

        // Animate request
        const animateRequest = () => {
          setActiveRequests((prev) =>
            prev.map((req) =>
              req.id === requestId ? { ...req, progress: Math.min(req.progress + 2, 100) } : req
            )
          );
        };

        const animationInterval = setInterval(animateRequest, 50);

        // Remove completed request
        setTimeout(() => {
          clearInterval(animationInterval);
          setActiveRequests((prev) => prev.filter((req) => req.id !== requestId));
        }, 2500);
      },
      1000 + Math.random() * 2000
    ); // Random interval between 1-3 seconds

    return () => clearInterval(interval);
  }, [isSimulating, edgeLocations, userLocation]);

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'standby':
        return 'bg-yellow-500';
      case 'maintenance':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLoadColor = (load: number) => {
    if (load < 40) return 'bg-green-500';
    if (load < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Calculate position on map (simple projection)
  const getMapPosition = (lat: number, lng: number) => {
    const mapWidth = 800;
    const mapHeight = 400;

    // Simple Mercator-like projection
    const x = ((lng + 180) / 360) * mapWidth;
    const y = ((90 - lat) / 180) * mapHeight;

    return { x, y };
  };

  const selectedEdgeData = selectedEdge ? edgeLocations.find((e) => e.id === selectedEdge) : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSimulation}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              isSimulating
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <span>{isSimulating ? '⏸️' : '▶️'}</span>
            <span>{isSimulating ? 'Stop Simulation' : 'Start Simulation'}</span>
          </button>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Standby</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Network Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{edgeLocations.length}</div>
          <div className="text-sm text-gray-600">Edge Locations</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {edgeLocations.filter((e) => e.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Edges</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{activeRequests.length}</div>
          <div className="text-sm text-gray-600">Active Requests</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(edgeLocations.reduce((sum, e) => sum + e.load, 0) / edgeLocations.length)}%
          </div>
          <div className="text-sm text-gray-600">Avg Load</div>
        </div>
      </div>

      {/* Network Map */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">Edge Network Distribution</h3>
          <p className="text-sm text-gray-600 mt-1">
            {region === 'global' && 'Global CDN with worldwide edge locations'}
            {region === 'regional' && 'Regional distribution across North America'}
            {region === 'local' && 'Local edge network in New York metropolitan area'}
          </p>
        </div>

        <div
          className="relative bg-gradient-to-b from-blue-50 to-green-50 rounded-lg overflow-hidden"
          style={{ height: '400px' }}
        >
          {/* World map background (simplified) */}
          <svg viewBox="0 0 800 400" className="w-full h-full absolute inset-0">
            {/* Simplified world map outline */}
            <path
              d="M100,200 Q150,150 200,180 Q250,160 300,200 Q350,180 400,220 Q450,200 500,240 Q550,220 600,260 Q650,240 700,280 Q750,260 800,300 L800,400 L0,400 Z"
              fill="rgba(255,255,255,0.3)"
              stroke="#e5e7eb"
              strokeWidth="1"
            />

            {/* Edge locations */}
            {edgeLocations.map((edge) => {
              const pos = getMapPosition(edge.lat, edge.lng);
              const isSelected = selectedEdge === edge.id;

              return (
                <g key={edge.id}>
                  {/* Connection lines to user */}
                  {isSelected && (
                    <line
                      x1={getMapPosition(userLocation.lat, userLocation.lng).x}
                      y1={getMapPosition(userLocation.lat, userLocation.lng).y}
                      x2={pos.x}
                      y2={pos.y}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.6"
                    />
                  )}

                  {/* Edge location */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? '8' : '6'}
                    fill={getStatusColor(edge.status)}
                    stroke={isSelected ? '#1d4ed8' : '#6b7280'}
                    strokeWidth={isSelected ? '3' : '1'}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => setSelectedEdge(selectedEdge === edge.id ? null : edge.id)}
                  />

                  {/* Load indicator */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="12"
                    fill="none"
                    stroke={getLoadColor(edge.load)}
                    strokeWidth="2"
                    strokeDasharray={`${(edge.load / 100) * 75.4} 75.4`}
                    transform={`rotate(-90 ${pos.x} ${pos.y})`}
                    opacity="0.7"
                  />

                  {/* Location label */}
                  <text
                    x={pos.x}
                    y={pos.y - 15}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700 pointer-events-none"
                  >
                    {edge.name}
                  </text>
                </g>
              );
            })}

            {/* User location */}
            <circle
              cx={getMapPosition(userLocation.lat, userLocation.lng).x}
              cy={getMapPosition(userLocation.lat, userLocation.lng).y}
              r="8"
              fill="#ef4444"
              stroke="#dc2626"
              strokeWidth="2"
            />
            <text
              x={getMapPosition(userLocation.lat, userLocation.lng).x}
              y={getMapPosition(userLocation.lat, userLocation.lng).y - 15}
              textAnchor="middle"
              className="text-xs font-medium fill-red-700"
            >
              You
            </text>

            {/* Active requests */}
            {activeRequests.map((request) => {
              const fromPos = getMapPosition(request.from.lat, request.from.lng);
              const toPos = getMapPosition(request.to.lat, request.to.lng);

              // Calculate current position along the path
              const currentX = fromPos.x + (toPos.x - fromPos.x) * (request.progress / 100);
              const currentY = fromPos.y + (toPos.y - fromPos.y) * (request.progress / 100);

              return (
                <circle
                  key={request.id}
                  cx={currentX}
                  cy={currentY}
                  r="3"
                  fill={request.color}
                  className="animate-pulse"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Edge Details */}
      {selectedEdgeData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">Edge Location Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-700 font-medium">{selectedEdgeData.name}</div>
              <div className="text-blue-600">{selectedEdgeData.country}</div>
            </div>
            <div>
              <div className="text-gray-600">Status</div>
              <div
                className={`font-medium capitalize ${
                  selectedEdgeData.status === 'active'
                    ? 'text-green-600'
                    : selectedEdgeData.status === 'standby'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {selectedEdgeData.status}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Latency</div>
              <div className="font-medium text-gray-900">{selectedEdgeData.latency}ms</div>
            </div>
            <div>
              <div className="text-gray-600">Load</div>
              <div className="font-medium text-gray-900">{selectedEdgeData.load}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Network Types Comparison */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Network Distribution Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div
            className={`p-3 rounded-lg ${region === 'local' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">Local Network</div>
            <div className="text-gray-600 mt-1">City-level distribution with minimal latency</div>
            <div className="text-xs text-gray-500 mt-2">
              • &lt; 5ms latency
              <br />
              • High capacity
              <br />• Local redundancy
            </div>
          </div>
          <div
            className={`p-3 rounded-lg ${region === 'regional' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">Regional Network</div>
            <div className="text-gray-600 mt-1">
              Continental distribution with optimized routing
            </div>
            <div className="text-xs text-gray-500 mt-2">
              • &lt; 50ms latency
              <br />
              • Regional failover
              <br />• Cost-effective
            </div>
          </div>
          <div
            className={`p-3 rounded-lg ${region === 'global' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">Global Network</div>
            <div className="text-gray-600 mt-1">Worldwide distribution with edge computing</div>
            <div className="text-xs text-gray-500 mt-2">
              • Global coverage
              <br />
              • Edge functions
              <br />• Highest redundancy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EdgeNetwork;
