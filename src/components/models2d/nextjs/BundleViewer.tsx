import React, { useState, useMemo } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../types/nextjs';

interface BundleViewerProps extends BaseNextJSVisualizationProps {
  bundleData?: BundleModule[];
  viewMode?: 'treemap' | 'sunburst' | 'list';
}

interface BundleModule {
  id: string;
  name: string;
  size: number; // bytes
  gzipSize?: number; // bytes
  brotliSize?: number; // bytes
  dependencies: string[];
  category: 'vendor' | 'app' | 'polyfill' | 'style' | 'asset';
  path: string;
  children?: BundleModule[];
}

const BundleViewer: React.FC<BundleViewerProps> = ({
  bundleData: initialBundleData = [],
  viewMode: initialViewMode = 'treemap',
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'treemap' | 'sunburst' | 'list'>(initialViewMode);
  const [selectedModule, setSelectedModule] = useState<BundleModule | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'size' | 'name'>('size');

  // Generate sample bundle data
  const generateSampleBundleData = (): BundleModule[] => [
    {
      id: 'react',
      name: 'react',
      size: 45000,
      gzipSize: 12000,
      brotliSize: 10000,
      dependencies: [],
      category: 'vendor',
      path: 'node_modules/react/index.js',
    },
    {
      id: 'react-dom',
      name: 'react-dom',
      size: 120000,
      gzipSize: 35000,
      brotliSize: 28000,
      dependencies: ['react'],
      category: 'vendor',
      path: 'node_modules/react-dom/index.js',
    },
    {
      id: 'next',
      name: 'next',
      size: 85000,
      gzipSize: 25000,
      brotliSize: 20000,
      dependencies: ['react', 'react-dom'],
      category: 'vendor',
      path: 'node_modules/next/dist/index.js',
    },
    {
      id: 'lodash',
      name: 'lodash',
      size: 550000,
      gzipSize: 95000,
      brotliSize: 75000,
      dependencies: [],
      category: 'vendor',
      path: 'node_modules/lodash/lodash.js',
    },
    {
      id: 'app-main',
      name: 'pages/_app.js',
      size: 25000,
      gzipSize: 8000,
      brotliSize: 6500,
      dependencies: ['react', 'next'],
      category: 'app',
      path: 'pages/_app.js',
    },
    {
      id: 'home-page',
      name: 'pages/index.js',
      size: 15000,
      gzipSize: 5000,
      brotliSize: 4000,
      dependencies: ['react', 'next', 'app-main'],
      category: 'app',
      path: 'pages/index.js',
    },
    {
      id: 'utils-helpers',
      name: 'utils/helpers.js',
      size: 8000,
      gzipSize: 2500,
      brotliSize: 2000,
      dependencies: [],
      category: 'app',
      path: 'utils/helpers.js',
    },
    {
      id: 'polyfills',
      name: 'polyfills',
      size: 35000,
      gzipSize: 12000,
      brotliSize: 10000,
      dependencies: [],
      category: 'polyfill',
      path: 'polyfills.js',
    },
    {
      id: 'styles-main',
      name: 'styles/main.css',
      size: 45000,
      gzipSize: 8000,
      brotliSize: 6500,
      dependencies: [],
      category: 'style',
      path: 'styles/main.css',
    },
    {
      id: 'tailwind-css',
      name: 'tailwindcss',
      size: 180000,
      gzipSize: 25000,
      brotliSize: 20000,
      dependencies: [],
      category: 'style',
      path: 'node_modules/tailwindcss/dist/tailwind.css',
    },
  ];

  const bundleData = initialBundleData.length > 0 ? initialBundleData : generateSampleBundleData();

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = bundleData;

    if (filterCategory !== 'all') {
      filtered = filtered.filter((module) => module.category === filterCategory);
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'size') {
        return b.size - a.size;
      }
      return a.name.localeCompare(b.name);
    });
  }, [bundleData, filterCategory, sortBy]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalSize = bundleData.reduce((sum, module) => sum + module.size, 0);
    const totalGzip = bundleData.reduce((sum, module) => sum + (module.gzipSize || 0), 0);
    const totalBrotli = bundleData.reduce((sum, module) => sum + (module.brotliSize || 0), 0);

    return { totalSize, totalGzip, totalBrotli };
  }, [bundleData]);

  // Category colors
  const categoryColors = {
    vendor: '#ef4444',
    app: '#3b82f6',
    polyfill: '#f59e0b',
    style: '#10b981',
    asset: '#8b5cf6',
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Calculate percentage
  const calculatePercentage = (size: number): number => {
    return (size / totals.totalSize) * 100;
  };

  // Render treemap view
  const renderTreemap = () => {
    const maxSize = Math.max(...filteredData.map((m) => m.size));
    const containerHeight = 400;

    return (
      <div
        className="relative bg-gray-50 border border-gray-200 rounded-lg p-4"
        style={{ height: containerHeight }}
      >
        <div className="grid grid-cols-5 gap-1 h-full">
          {filteredData.slice(0, 20).map((module) => {
            const percentage = calculatePercentage(module.size);
            const relativeSize = (module.size / maxSize) * 100;

            return (
              <div
                key={module.id}
                className="bg-white border border-gray-300 rounded cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between p-2"
                style={{
                  minHeight: `${Math.max(40, relativeSize * 2)}px`,
                  backgroundColor: categoryColors[module.category] + '20',
                  borderColor: categoryColors[module.category],
                }}
                onClick={() => setSelectedModule(module)}
              >
                <div className="text-xs font-medium truncate" title={module.name}>
                  {module.name}
                </div>
                <div className="text-xs text-gray-600">{formatSize(module.size)}</div>
                <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>

        {filteredData.length > 20 && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            +{filteredData.length - 20} more modules
          </div>
        )}
      </div>
    );
  };

  // Render sunburst view (simplified)
  const renderSunburst = () => {
    const centerX = 300;
    const centerY = 200;
    const maxRadius = 150;

    return (
      <div className="flex justify-center">
        <svg width="600" height="400" className="border border-gray-200 rounded">
          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r="40"
            fill="#e5e7eb"
            stroke="#d1d5db"
            strokeWidth="2"
          />
          <text x={centerX} y={centerY - 5} textAnchor="middle" fontSize="12" fill="#374151">
            Bundle
          </text>
          <text x={centerX} y={centerY + 10} textAnchor="middle" fontSize="10" fill="#6b7280">
            {formatSize(totals.totalSize)}
          </text>

          {/* Category segments */}
          {Object.entries(categoryColors).map(([category, color], index) => {
            const categoryModules = filteredData.filter((m) => m.category === category);
            const categorySize = categoryModules.reduce((sum, m) => sum + m.size, 0);
            const percentage = calculatePercentage(categorySize);
            const angle = (index / Object.keys(categoryColors).length) * 2 * Math.PI;
            const radius = 60 + (percentage / 100) * (maxRadius - 60);

            return (
              <g key={category}>
                <circle
                  cx={centerX + Math.cos(angle) * radius}
                  cy={centerY + Math.sin(angle) * radius}
                  r="25"
                  fill={color + '40'}
                  stroke={color}
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => setFilterCategory(category)}
                />
                <text
                  x={centerX + Math.cos(angle) * radius}
                  y={centerY + Math.sin(angle) * radius - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#374151"
                  fontWeight="bold"
                >
                  {category}
                </text>
                <text
                  x={centerX + Math.cos(angle) * radius}
                  y={centerY + Math.sin(angle) * radius + 8}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#6b7280"
                >
                  {percentage.toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Render list view
  const renderList = () => (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {filteredData.map((module) => {
        const percentage = calculatePercentage(module.size);

        return (
          <div
            key={module.id}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelectedModule(module)}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: categoryColors[module.category] }}
              />
              <div>
                <div className="font-medium text-gray-900">{module.name}</div>
                <div className="text-sm text-gray-500 truncate max-w-xs">{module.path}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-medium text-gray-900">{formatSize(module.size)}</div>
              <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Bundle Analysis</h3>
        <p className="text-gray-600">
          Analyze your bundle composition and identify optimization opportunities
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['treemap', 'sunburst', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                  viewMode === mode
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            <option value="vendor">Vendor</option>
            <option value="app">App</option>
            <option value="polyfill">Polyfill</option>
            <option value="style">Style</option>
            <option value="asset">Asset</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'size' | 'name')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="size">Sort by Size</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Bundle Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{formatSize(totals.totalSize)}</div>
          <div className="text-sm text-gray-600">Total Bundle Size</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{formatSize(totals.totalGzip)}</div>
          <div className="text-sm text-gray-600">Gzip Compressed</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{formatSize(totals.totalBrotli)}</div>
          <div className="text-sm text-gray-600">Brotli Compressed</div>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Bundle Composition{' '}
          {viewMode === 'treemap' ? '(Treemap)' : viewMode === 'sunburst' ? '(Sunburst)' : '(List)'}
        </h4>

        {viewMode === 'treemap' && renderTreemap()}
        {viewMode === 'sunburst' && renderSunburst()}
        {viewMode === 'list' && renderList()}
      </div>

      {/* Module Details */}
      {selectedModule && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Module Details</h4>
            <button
              onClick={() => setSelectedModule(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Basic Information</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedModule.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">{selectedModule.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Path:</span>
                    <span className="font-medium text-gray-800 break-all">
                      {selectedModule.path}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Size Information</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uncompressed:</span>
                    <span className="font-medium">{formatSize(selectedModule.size)}</span>
                  </div>
                  {selectedModule.gzipSize && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gzip:</span>
                      <span className="font-medium text-green-600">
                        {formatSize(selectedModule.gzipSize)}
                      </span>
                    </div>
                  )}
                  {selectedModule.brotliSize && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Brotli:</span>
                      <span className="font-medium text-blue-600">
                        {formatSize(selectedModule.brotliSize)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bundle %:</span>
                    <span className="font-medium">
                      {calculatePercentage(selectedModule.size).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Dependencies</h5>
                {selectedModule.dependencies.length > 0 ? (
                  <div className="space-y-1">
                    {selectedModule.dependencies.map((dep) => (
                      <div key={dep} className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {dep}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No dependencies</p>
                )}
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Optimization Suggestions</h5>
                <div className="space-y-2 text-sm">
                  {selectedModule.category === 'vendor' && selectedModule.size > 100000 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-500 mt-0.5">⚠️</span>
                      <span>
                        Large vendor library. Consider lazy loading or finding alternatives.
                      </span>
                    </div>
                  )}
                  {selectedModule.category === 'app' && selectedModule.size > 50000 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-0.5">💡</span>
                      <span>Consider code splitting this module if it's not always needed.</span>
                    </div>
                  )}
                  {selectedModule.category === 'style' && selectedModule.size > 30000 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 mt-0.5">✨</span>
                      <span>
                        Consider purging unused CSS classes or using CSS-in-JS for critical styles.
                      </span>
                    </div>
                  )}
                  {selectedModule.gzipSize &&
                    selectedModule.brotliSize &&
                    selectedModule.brotliSize < selectedModule.gzipSize * 0.8 && (
                      <div className="flex items-start space-x-2">
                        <span className="text-purple-500 mt-0.5">🚀</span>
                        <span>Brotli compression provides significant savings over gzip.</span>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(categoryColors).map(([category, color]) => {
            const categoryModules = bundleData.filter((m) => m.category === category);
            const categorySize = categoryModules.reduce((sum, m) => sum + m.size, 0);
            const percentage = calculatePercentage(categorySize);

            return (
              <div key={category} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium capitalize">{category}</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{percentage.toFixed(1)}%</div>
                <div className="text-xs text-gray-600">{formatSize(categorySize)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BundleViewer;
