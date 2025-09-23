import React, { useState } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../types/nextjs';

interface OptimizationDashboardProps extends BaseNextJSVisualizationProps {
  optimizations?: OptimizationScenario[];
  selectedScenario?: string;
}

interface OptimizationScenario {
  id: string;
  name: string;
  description: string;
  before: PerformanceMetrics;
  after: PerformanceMetrics;
  improvements: string[];
  category: 'bundle' | 'image' | 'code-splitting' | 'caching' | 'other';
}

interface PerformanceMetrics {
  bundleSize: number; // KB
  firstLoad: number; // ms
  subsequentLoad: number; // ms
  lcp: number; // ms
  cls: number;
  requests: number;
  transferred: number; // KB
}

const OptimizationDashboard: React.FC<OptimizationDashboardProps> = ({
  optimizations: initialOptimizations = [],
  selectedScenario: initialSelectedScenario,
  className = '',
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(
    initialSelectedScenario || null
  );
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Generate sample optimization scenarios
  const generateSampleOptimizations = (): OptimizationScenario[] => [
    {
      id: 'code-splitting',
      name: 'Code Splitting',
      description: 'Split large bundles into smaller chunks loaded on demand',
      category: 'code-splitting',
      before: {
        bundleSize: 2500,
        firstLoad: 3200,
        subsequentLoad: 2800,
        lcp: 2800,
        cls: 0.15,
        requests: 12,
        transferred: 2100,
      },
      after: {
        bundleSize: 1800,
        firstLoad: 2100,
        subsequentLoad: 800,
        lcp: 1900,
        cls: 0.08,
        requests: 8,
        transferred: 1500,
      },
      improvements: [
        'Reduced initial bundle by 28%',
        'Faster subsequent page loads',
        'Improved LCP by 32%',
        'Reduced layout shifts',
      ],
    },
    {
      id: 'image-optimization',
      name: 'Image Optimization',
      description: 'Optimize images with modern formats and responsive loading',
      category: 'image',
      before: {
        bundleSize: 2200,
        firstLoad: 2900,
        subsequentLoad: 2500,
        lcp: 2600,
        cls: 0.25,
        requests: 15,
        transferred: 3200,
      },
      after: {
        bundleSize: 2100,
        firstLoad: 2200,
        subsequentLoad: 2100,
        lcp: 1800,
        cls: 0.05,
        requests: 12,
        transferred: 1800,
      },
      improvements: [
        '44% reduction in image transfer size',
        'Improved LCP by 31%',
        'Eliminated layout shifts',
        'Better Core Web Vitals scores',
      ],
    },
    {
      id: 'bundle-analysis',
      name: 'Bundle Analysis & Tree Shaking',
      description: 'Remove unused code and analyze bundle composition',
      category: 'bundle',
      before: {
        bundleSize: 2800,
        firstLoad: 3500,
        subsequentLoad: 3200,
        lcp: 3200,
        cls: 0.12,
        requests: 10,
        transferred: 2400,
      },
      after: {
        bundleSize: 1950,
        firstLoad: 2400,
        subsequentLoad: 2200,
        lcp: 2100,
        cls: 0.08,
        requests: 9,
        transferred: 1700,
      },
      improvements: [
        'Reduced bundle size by 30%',
        'Faster initial load by 31%',
        'Improved caching efficiency',
        'Better development experience',
      ],
    },
    {
      id: 'caching-strategy',
      name: 'Advanced Caching Strategy',
      description: 'Implement service worker and optimal cache headers',
      category: 'caching',
      before: {
        bundleSize: 2000,
        firstLoad: 3000,
        subsequentLoad: 2800,
        lcp: 2700,
        cls: 0.1,
        requests: 14,
        transferred: 1900,
      },
      after: {
        bundleSize: 2000,
        firstLoad: 3000,
        subsequentLoad: 450,
        lcp: 2200,
        cls: 0.08,
        requests: 6,
        transferred: 300,
      },
      improvements: [
        '94% faster subsequent loads',
        'Reduced network requests by 57%',
        'Minimal data transfer on repeat visits',
        'Improved offline experience',
      ],
    },
  ];

  const optimizations =
    initialOptimizations.length > 0 ? initialOptimizations : generateSampleOptimizations();

  const selectedOptimization = optimizations.find((opt) => opt.id === selectedScenario);

  // Calculate improvement percentages
  const calculateImprovement = (before: number, after: number): number => {
    return ((before - after) / before) * 100;
  };

  // Get performance score color
  const getScoreColor = (value: number, metric: keyof PerformanceMetrics): string => {
    const thresholds = {
      bundleSize: { good: 2000, poor: 3000 },
      firstLoad: { good: 2000, poor: 3500 },
      subsequentLoad: { good: 1000, poor: 2500 },
      lcp: { good: 2500, poor: 4000 },
      cls: { good: 0.1, poor: 0.25 },
      requests: { good: 10, poor: 20 },
      transferred: { good: 1500, poor: 3000 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return '#6b7280';

    if (metric === 'cls') {
      if (value <= threshold.good) return '#10b981';
      if (value <= threshold.poor) return '#f59e0b';
      return '#ef4444';
    } else {
      if (value <= threshold.good) return '#10b981';
      if (value <= threshold.poor) return '#f59e0b';
      return '#ef4444';
    }
  };

  // Format metric value
  const formatMetric = (value: number, metric: keyof PerformanceMetrics): string => {
    switch (metric) {
      case 'bundleSize':
      case 'transferred':
        return `${Math.round(value)} KB`;
      case 'firstLoad':
      case 'subsequentLoad':
      case 'lcp':
        return `${Math.round(value)}ms`;
      case 'cls':
        return value.toFixed(3);
      case 'requests':
        return value.toString();
      default:
        return value.toString();
    }
  };

  // Category colors
  const categoryColors = {
    bundle: '#3b82f6',
    image: '#10b981',
    'code-splitting': '#f59e0b',
    caching: '#8b5cf6',
    other: '#6b7280',
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Optimization Impact Dashboard</h3>
        <p className="text-gray-600">
          Compare performance before and after applying Next.js optimizations
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'overview'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'detailed'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Detailed
          </button>
        </div>
      </div>

      {viewMode === 'overview' ? (
        /* Overview Mode - All optimizations grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {optimizations.map((optimization) => {
            const bundleImprovement = calculateImprovement(
              optimization.before.bundleSize,
              optimization.after.bundleSize
            );
            const loadImprovement = calculateImprovement(
              optimization.before.firstLoad,
              optimization.after.firstLoad
            );

            return (
              <div
                key={optimization.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedScenario(optimization.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{optimization.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{optimization.description}</p>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: categoryColors[optimization.category] }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {formatMetric(optimization.before.bundleSize, 'bundleSize')}
                    </div>
                    <div className="text-sm text-gray-600">Before</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {formatMetric(optimization.after.bundleSize, 'bundleSize')}
                    </div>
                    <div className="text-sm text-gray-600">After</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bundle Size:</span>
                    <span className="font-medium text-green-600">
                      {bundleImprovement > 0 ? '-' : '+'}
                      {Math.abs(bundleImprovement).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Load Time:</span>
                    <span className="font-medium text-green-600">
                      {loadImprovement > 0 ? '-' : '+'}
                      {Math.abs(loadImprovement).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">Key Improvements:</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {optimization.improvements.slice(0, 2).map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      ) : /* Detailed Mode - Selected optimization comparison */
      selectedOptimization ? (
        <div className="space-y-6">
          {/* Selected Optimization Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{selectedOptimization.name}</h4>
                <p className="text-gray-600 mt-1">{selectedOptimization.description}</p>
              </div>
              <button
                onClick={() => setSelectedScenario(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Before/After Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="text-lg font-semibold text-red-600 border-b border-red-200 pb-2">
                  Before Optimization
                </h5>
                {Object.entries(selectedOptimization.before).map(([metric, value]) => (
                  <div key={metric} className="flex justify-between items-center">
                    <span className="capitalize text-gray-700">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: getScoreColor(value, metric as keyof PerformanceMetrics) }}
                    >
                      {formatMetric(value, metric as keyof PerformanceMetrics)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h5 className="text-lg font-semibold text-green-600 border-b border-green-200 pb-2">
                  After Optimization
                </h5>
                {Object.entries(selectedOptimization.after).map(([metric, value]) => (
                  <div key={metric} className="flex justify-between items-center">
                    <span className="capitalize text-gray-700">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: getScoreColor(value, metric as keyof PerformanceMetrics) }}
                    >
                      {formatMetric(value, metric as keyof PerformanceMetrics)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements List */}
            <div className="mt-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Improvements Achieved</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedOptimization.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">{improvement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Impact Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h5 className="text-lg font-semibold text-gray-900 mb-4">Performance Impact</h5>
            <div className="space-y-4">
              {Object.keys(selectedOptimization.before).map((metric) => {
                const before = selectedOptimization.before[metric as keyof PerformanceMetrics];
                const after = selectedOptimization.after[metric as keyof PerformanceMetrics];
                const improvement = calculateImprovement(before, after);

                return (
                  <div key={metric} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">
                        {metric.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span
                        className={`font-medium ${
                          improvement > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {improvement > 0 ? '↓' : '↑'} {Math.abs(improvement).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(0, Math.min(100, 100 - improvement))}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* No selection message */
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">Select an Optimization</h4>
          <p className="text-gray-600">
            Click on any optimization card above to see detailed before/after comparisons
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Optimization Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{optimizations.length}</div>
            <div className="text-sm text-gray-600">Techniques</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(
                optimizations.reduce(
                  (acc, opt) =>
                    acc + calculateImprovement(opt.before.firstLoad, opt.after.firstLoad),
                  0
                ) / optimizations.length
              )}
              %
            </div>
            <div className="text-sm text-gray-600">Avg Load Time Reduction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                optimizations.reduce(
                  (acc, opt) =>
                    acc + calculateImprovement(opt.before.bundleSize, opt.after.bundleSize),
                  0
                ) / optimizations.length
              )}
              %
            </div>
            <div className="text-sm text-gray-600">Avg Bundle Size Reduction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {optimizations.reduce((acc, opt) => acc + opt.improvements.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Improvements</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationDashboard;
