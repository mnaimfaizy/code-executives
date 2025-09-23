import React, { useState, useMemo } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../types/nextjs';

interface BundleAnalyzer2DProps extends BaseNextJSVisualizationProps {
  bundleData?: BundleModule[];
  showSizes?: boolean;
  maxDepth?: number;
}

interface BundleModule {
  id: string;
  name: string;
  size: number;
  dependencies: string[];
  depth: number;
  category: 'core' | 'framework' | 'ui' | 'utility' | 'data' | 'other';
  position: { x: number; y: number };
}

interface Connection {
  from: string;
  to: string;
  strength: number;
}

const BundleAnalyzer2D: React.FC<BundleAnalyzer2DProps> = ({
  bundleData: initialBundleData = [],
  showSizes = true,
  maxDepth = 3,
  className = '',
}) => {
  const [selectedModule, setSelectedModule] = useState<BundleModule | null>(null);
  const [hoveredModule, setHoveredModule] = useState<BundleModule | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Default bundle data for demonstration
  const defaultBundleData: BundleModule[] = [
    {
      id: 'app',
      name: 'App',
      size: 25,
      dependencies: ['react', 'next', 'pages'],
      depth: 0,
      category: 'core',
      position: { x: 400, y: 50 },
    },
    {
      id: 'react',
      name: 'React',
      size: 150,
      dependencies: ['react-dom', 'scheduler'],
      depth: 1,
      category: 'framework',
      position: { x: 200, y: 150 },
    },
    {
      id: 'next',
      name: 'Next.js',
      size: 200,
      dependencies: ['react', 'webpack', 'babel'],
      depth: 1,
      category: 'framework',
      position: { x: 400, y: 150 },
    },
    {
      id: 'pages',
      name: 'Pages',
      size: 45,
      dependencies: ['components', 'utils'],
      depth: 1,
      category: 'core',
      position: { x: 600, y: 150 },
    },
    {
      id: 'react-dom',
      name: 'React DOM',
      size: 120,
      dependencies: ['react'],
      depth: 2,
      category: 'framework',
      position: { x: 100, y: 250 },
    },
    {
      id: 'scheduler',
      name: 'Scheduler',
      size: 30,
      dependencies: [],
      depth: 2,
      category: 'framework',
      position: { x: 300, y: 250 },
    },
    {
      id: 'webpack',
      name: 'Webpack',
      size: 180,
      dependencies: ['loader-utils', 'schema-utils'],
      depth: 2,
      category: 'framework',
      position: { x: 400, y: 250 },
    },
    {
      id: 'babel',
      name: 'Babel',
      size: 95,
      dependencies: ['babel-core', 'babel-preset'],
      depth: 2,
      category: 'framework',
      position: { x: 500, y: 250 },
    },
    {
      id: 'components',
      name: 'Components',
      size: 85,
      dependencies: ['ui-lib', 'icons'],
      depth: 2,
      category: 'ui',
      position: { x: 600, y: 250 },
    },
    {
      id: 'utils',
      name: 'Utils',
      size: 35,
      dependencies: ['lodash', 'date-fns'],
      depth: 2,
      category: 'utility',
      position: { x: 700, y: 250 },
    },
  ];

  const bundleData = initialBundleData.length > 0 ? initialBundleData : defaultBundleData;

  // Calculate connections between modules
  const connections: Connection[] = useMemo(() => {
    const connMap = new Map<string, Connection>();

    bundleData.forEach((module) => {
      module.dependencies.forEach((depId) => {
        const dep = bundleData.find((m) => m.id === depId);
        if (dep) {
          const key = `${module.id}-${depId}`;
          const existing = connMap.get(key);
          if (existing) {
            existing.strength += 1;
          } else {
            connMap.set(key, {
              from: module.id,
              to: depId,
              strength: 1,
            });
          }
        }
      });
    });

    return Array.from(connMap.values());
  }, [bundleData]);

  // Get visible modules based on maxDepth
  const visibleModules = bundleData.filter((module) => module.depth <= maxDepth);

  // Calculate total bundle size
  const totalSize = bundleData.reduce((sum, module) => sum + module.size, 0);

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core':
        return { bg: '#3b82f6', border: '#1d4ed8', text: '#ffffff' };
      case 'framework':
        return { bg: '#10b981', border: '#059669', text: '#ffffff' };
      case 'ui':
        return { bg: '#f59e0b', border: '#d97706', text: '#ffffff' };
      case 'utility':
        return { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff' };
      case 'data':
        return { bg: '#ef4444', border: '#dc2626', text: '#ffffff' };
      default:
        return { bg: '#6b7280', border: '#4b5563', text: '#ffffff' };
    }
  };

  // Handle module click
  const handleModuleClick = (module: BundleModule) => {
    setSelectedModule(module);
  };

  // Handle zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Calculate module radius based on size
  const getModuleRadius = (size: number) => {
    const minRadius = 20;
    const maxRadius = 50;
    const scale = size / Math.max(...bundleData.map((m) => m.size));
    return minRadius + (maxRadius - minRadius) * scale;
  };

  // Get connection path
  const getConnectionPath = (from: BundleModule, to: BundleModule) => {
    const fromX = from.position.x;
    const fromY = from.position.y;
    const toX = to.position.x;
    const toY = to.position.y;

    // Create curved path
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const curvature = Math.min(distance * 0.3, 50);

    // Control points for curve
    const cp1x = fromX + curvature;
    const cp1y = fromY;
    const cp2x = toX - curvature;
    const cp2y = toY;

    return `M ${fromX} ${fromY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${toX} ${toY}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomIn}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            >
              -
            </button>
            <button
              onClick={handleResetView}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
            >
              Reset
            </button>
            <span className="text-sm text-gray-600">Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Core</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Framework</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>UI</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Utility</span>
          </div>
        </div>
      </div>

      {/* Bundle Visualization */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="relative" style={{ height: '500px', overflow: 'hidden' }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 500"
            className="absolute inset-0"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'center',
            }}
          >
            {/* Connection lines */}
            {connections.map((connection, index) => {
              const fromModule = bundleData.find((m) => m.id === connection.from);
              const toModule = bundleData.find((m) => m.id === connection.to);

              if (
                !fromModule ||
                !toModule ||
                fromModule.depth > maxDepth ||
                toModule.depth > maxDepth
              ) {
                return null;
              }

              const isHighlighted =
                selectedModule?.id === connection.from || selectedModule?.id === connection.to;
              const isHovered =
                hoveredModule?.id === connection.from || hoveredModule?.id === connection.to;

              return (
                <g key={index}>
                  <path
                    d={getConnectionPath(fromModule, toModule)}
                    stroke={isHighlighted ? '#3b82f6' : isHovered ? '#6b7280' : '#d1d5db'}
                    strokeWidth={isHighlighted ? 3 : isHovered ? 2 : 1}
                    fill="none"
                    opacity={isHighlighted ? 1 : isHovered ? 0.8 : 0.4}
                    markerEnd={isHighlighted ? 'url(#arrowhead-blue)' : 'url(#arrowhead-gray)'}
                  />
                </g>
              );
            })}

            {/* Arrow markers */}
            <defs>
              <marker
                id="arrowhead-blue"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
              </marker>
              <marker
                id="arrowhead-gray"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
              </marker>
            </defs>

            {/* Modules */}
            {visibleModules.map((module) => {
              const radius = getModuleRadius(module.size);
              const colors = getCategoryColor(module.category);
              const isSelected = selectedModule?.id === module.id;
              const isHovered = hoveredModule?.id === module.id;

              return (
                <g key={module.id}>
                  {/* Module circle */}
                  <circle
                    cx={module.position.x}
                    cy={module.position.y}
                    r={radius}
                    fill={colors.bg}
                    stroke={isSelected ? '#1d4ed8' : colors.border}
                    strokeWidth={isSelected ? 3 : 2}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => handleModuleClick(module)}
                    onMouseEnter={() => setHoveredModule(module)}
                    onMouseLeave={() => setHoveredModule(null)}
                    style={{
                      filter: isHovered ? 'brightness(1.1)' : 'none',
                    }}
                  />

                  {/* Module label */}
                  <text
                    x={module.position.x}
                    y={module.position.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={colors.text}
                    fontSize="12"
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    {module.name}
                  </text>

                  {/* Size label */}
                  {showSizes && (
                    <text
                      x={module.position.x}
                      y={module.position.y + radius + 15}
                      textAnchor="middle"
                      fill="#6b7280"
                      fontSize="10"
                      className="pointer-events-none select-none"
                    >
                      {module.size}KB
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Module Details */}
      {selectedModule && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Module Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Name:</strong> {selectedModule.name}
                </div>
                <div>
                  <strong>Category:</strong> {selectedModule.category}
                </div>
                <div>
                  <strong>Size:</strong> {selectedModule.size}KB
                </div>
                <div>
                  <strong>Depth:</strong> {selectedModule.depth}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm">
                <strong>Dependencies:</strong>
                {selectedModule.dependencies.length > 0 ? (
                  <ul className="mt-1 space-y-1">
                    {selectedModule.dependencies.map((depId, index) => {
                      const dep = bundleData.find((m) => m.id === depId);
                      return (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span>{dep?.name || depId}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-1 text-gray-500">No dependencies</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bundle Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{bundleData.length}</div>
          <div className="text-sm text-gray-600">Total Modules</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalSize}KB</div>
          <div className="text-sm text-gray-600">Bundle Size</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {bundleData.filter((m) => m.category === 'framework').length}
          </div>
          <div className="text-sm text-gray-600">Framework Modules</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.max(...bundleData.map((m) => m.depth)) + 1}
          </div>
          <div className="text-sm text-gray-600">Dependency Levels</div>
        </div>
      </div>

      {/* Bundle Analysis Concepts */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Bundle Analysis Concepts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Module Categories</h5>
            <ul className="text-gray-600 space-y-1">
              <li>
                • <strong>Core:</strong> Application-specific code
              </li>
              <li>
                • <strong>Framework:</strong> Next.js, React, Webpack
              </li>
              <li>
                • <strong>UI:</strong> Components and styling libraries
              </li>
              <li>
                • <strong>Utility:</strong> Helper functions and tools
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Optimization Strategies</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Code splitting reduces initial bundle size</li>
              <li>• Tree shaking removes unused code</li>
              <li>• Dynamic imports load code on demand</li>
              <li>• Bundle analysis identifies optimization opportunities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleAnalyzer2D;
