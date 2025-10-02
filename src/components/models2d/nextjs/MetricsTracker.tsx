import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../types/nextjs';

interface MetricsTrackerProps extends BaseNextJSVisualizationProps {
  autoStart?: boolean;
  updateInterval?: number; // ms
  maxDataPoints?: number;
}

interface PerformanceMetrics {
  timestamp: number;
  lcp?: number;
  inp?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  memoryUsage?: number;
  heapUsed?: number;
  heapTotal?: number;
  cpuUsage?: number;
  networkRequests?: number;
  domNodes?: number;
  jsHeapSize?: number;
}

interface MetricConfig {
  key: keyof PerformanceMetrics;
  label: string;
  unit: string;
  color: string;
  good: number;
  poor: number;
  higherIsBetter?: boolean;
}

const MetricsTracker: React.FC<MetricsTrackerProps> = ({
  autoStart = false,
  updateInterval = 1000,
  maxDataPoints = 100,
  className = '',
}) => {
  const [isTracking, setIsTracking] = useState(autoStart);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
    new Set(['lcp', 'inp', 'cls', 'memoryUsage'])
  );
  const [viewMode, setViewMode] = useState<'realtime' | 'summary'>('realtime');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Metric configurations
  const metricConfigs: Record<string, MetricConfig> = {
    lcp: { key: 'lcp', label: 'LCP', unit: 'ms', color: '#ef4444', good: 2500, poor: 4000 },
    inp: { key: 'inp', label: 'INP', unit: 'ms', color: '#f59e0b', good: 200, poor: 500 },
    cls: { key: 'cls', label: 'CLS', unit: '', color: '#10b981', good: 0.1, poor: 0.25 },
    fcp: { key: 'fcp', label: 'FCP', unit: 'ms', color: '#3b82f6', good: 1800, poor: 3000 },
    ttfb: { key: 'ttfb', label: 'TTFB', unit: 'ms', color: '#8b5cf6', good: 800, poor: 1800 },
    memoryUsage: {
      key: 'memoryUsage',
      label: 'Memory',
      unit: 'MB',
      color: '#ec4899',
      good: 50,
      poor: 150,
    },
    heapUsed: {
      key: 'heapUsed',
      label: 'Heap Used',
      unit: 'MB',
      color: '#06b6d4',
      good: 30,
      poor: 100,
    },
    cpuUsage: {
      key: 'cpuUsage',
      label: 'CPU',
      unit: '%',
      color: '#84cc16',
      good: 20,
      poor: 80,
      higherIsBetter: false,
    },
    networkRequests: {
      key: 'networkRequests',
      label: 'Requests',
      unit: '',
      color: '#f97316',
      good: 10,
      poor: 50,
      higherIsBetter: false,
    },
    domNodes: {
      key: 'domNodes',
      label: 'DOM Nodes',
      unit: '',
      color: '#6366f1',
      good: 500,
      poor: 2000,
      higherIsBetter: false,
    },
  };

  // Generate mock performance data
  const generateMockMetrics = (): Omit<PerformanceMetrics, 'timestamp'> => {
    const baseMetrics = {
      lcp: 2000 + Math.random() * 2000,
      inp: 100 + Math.random() * 400,
      cls: Math.max(0, 0.05 + Math.random() * 0.2),
      fcp: 1500 + Math.random() * 1000,
      ttfb: 200 + Math.random() * 600,
      memoryUsage: 40 + Math.random() * 60,
      heapUsed: 25 + Math.random() * 50,
      heapTotal: 100 + Math.random() * 50,
      cpuUsage: Math.random() * 100,
      networkRequests: Math.floor(Math.random() * 20),
      domNodes: 800 + Math.floor(Math.random() * 1200),
      jsHeapSize: 30 + Math.random() * 70,
    };

    // Add some realistic variations
    const timeOfDay = new Date().getHours();
    if (timeOfDay > 9 && timeOfDay < 17) {
      // Business hours
      baseMetrics.cpuUsage += 20;
      baseMetrics.memoryUsage += 15;
    }

    return baseMetrics;
  };

  // Collect performance metrics
  const collectMetrics = useCallback(() => {
    const newMetrics: PerformanceMetrics = {
      timestamp: Date.now(),
      ...generateMockMetrics(),
    };

    setMetrics((prev) => {
      const updated = [...prev, newMetrics];
      // Keep only the last maxDataPoints
      return updated.slice(-maxDataPoints);
    });
  }, [maxDataPoints]);

  // Start/stop tracking
  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  // Clear metrics
  const clearMetrics = () => {
    setMetrics([]);
  };

  // Effect for tracking
  useEffect(() => {
    if (isTracking) {
      collectMetrics(); // Collect initial metrics
      intervalRef.current = setInterval(collectMetrics, updateInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, updateInterval, collectMetrics]);

  // Get latest metrics
  const latestMetrics = metrics[metrics.length - 1];

  // Calculate averages
  const averages = React.useMemo(() => {
    if (metrics.length === 0) return {};

    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};

    metrics.forEach((metric) => {
      Object.entries(metric).forEach(([key, value]) => {
        if (key !== 'timestamp' && typeof value === 'number') {
          sums[key] = (sums[key] || 0) + value;
          counts[key] = (counts[key] || 0) + 1;
        }
      });
    });

    const result: Record<string, number> = {};
    Object.keys(sums).forEach((key) => {
      result[key] = sums[key] / counts[key];
    });

    return result;
  }, [metrics]);

  // Get performance score
  const getPerformanceScore = (
    value: number,
    config: MetricConfig
  ): 'good' | 'needs-improvement' | 'poor' => {
    if (config.higherIsBetter === false) {
      if (value <= config.good) return 'good';
      if (value <= config.poor) return 'needs-improvement';
      return 'poor';
    } else {
      if (value <= config.good) return 'good';
      if (value <= config.poor) return 'needs-improvement';
      return 'poor';
    }
  };

  // Format value
  const formatValue = (value: number, config: MetricConfig): string => {
    if (config.key === 'cls') {
      return value.toFixed(3);
    }
    if (config.unit === 'ms') {
      return `${Math.round(value)}ms`;
    }
    if (config.unit === 'MB') {
      return `${value.toFixed(1)}MB`;
    }
    if (config.unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    return value.toString();
  };

  // Render real-time chart
  const renderRealtimeChart = () => {
    if (metrics.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div>Start tracking to see real-time metrics</div>
          </div>
        </div>
      );
    }

    const chartWidth = 800;
    const chartHeight = 300;
    const margin = { top: 20, right: 80, bottom: 40, left: 60 };

    // Get selected metric configs
    const selectedConfigs = Array.from(selectedMetrics)
      .map((key) => metricConfigs[key])
      .filter(Boolean);

    if (selectedConfigs.length === 0) return null;

    // Calculate scales
    const maxValues: Record<string, number> = {};

    selectedConfigs.forEach((config) => {
      const values = metrics.map((m) => m[config.key]).filter((v) => v !== undefined) as number[];
      maxValues[config.key] = Math.max(...values, config.poor * 1.2);
    });

    return (
      <div className="relative">
        <svg width={chartWidth} height={chartHeight} className="border border-gray-200 rounded">
          {/* Grid */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Threshold lines */}
          {selectedConfigs.map((config) => {
            const y =
              chartHeight -
              margin.bottom -
              (config.good / maxValues[config.key]) * (chartHeight - margin.top - margin.bottom);
            return (
              <line
                key={`threshold-${config.key}`}
                x1={margin.left}
                y1={y}
                x2={chartWidth - margin.right}
                y2={y}
                stroke={config.color}
                strokeWidth="1"
                strokeDasharray="5,5"
                opacity="0.5"
              />
            );
          })}

          {/* Data lines */}
          {selectedConfigs.map((config) => {
            const points = metrics
              .map((metric, index) => {
                const value = metric[config.key];
                if (value === undefined) return null;

                const x =
                  margin.left +
                  (index / Math.max(metrics.length - 1, 1)) *
                    (chartWidth - margin.left - margin.right);
                const y =
                  chartHeight -
                  margin.bottom -
                  (value / maxValues[config.key]) * (chartHeight - margin.top - margin.bottom);

                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .filter(Boolean)
              .join(' ');

            if (!points) return null;

            return (
              <path key={config.key} d={points} stroke={config.color} strokeWidth="2" fill="none" />
            );
          })}

          {/* Data points */}
          {selectedConfigs.map((config) =>
            metrics.map((metric, index) => {
              const value = metric[config.key];
              if (value === undefined) return null;

              const x =
                margin.left +
                (index / Math.max(metrics.length - 1, 1)) *
                  (chartWidth - margin.left - margin.right);
              const y =
                chartHeight -
                margin.bottom -
                (value / maxValues[config.key]) * (chartHeight - margin.top - margin.bottom);

              return (
                <circle key={`${config.key}-${index}`} cx={x} cy={y} r="3" fill={config.color} />
              );
            })
          )}
        </svg>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="space-y-2">
            {selectedConfigs.map((config) => (
              <div key={config.key} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                <span className="text-sm font-medium">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render summary view
  const renderSummaryView = () => {
    if (metrics.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No metrics collected yet. Start tracking to see summary statistics.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(metricConfigs).map((config) => {
          const latest = latestMetrics?.[config.key];
          const average = averages[config.key];

          if (latest === undefined || average === undefined) return null;

          const score = getPerformanceScore(latest, config);

          return (
            <div key={config.key} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{config.label}</h4>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    score === 'good'
                      ? 'bg-green-100 text-green-800'
                      : score === 'needs-improvement'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {score === 'good'
                    ? 'Good'
                    : score === 'needs-improvement'
                      ? 'Needs Work'
                      : 'Poor'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current:</span>
                  <span className="font-medium" style={{ color: config.color }}>
                    {formatValue(latest, config)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average:</span>
                  <span className="font-medium text-gray-900">{formatValue(average, config)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Threshold:</span>
                  <span className="text-sm text-gray-500">≤{formatValue(config.good, config)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Real-Time Performance Monitor</h3>
        <p className="text-gray-600">
          Track Core Web Vitals and system performance metrics in real-time
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTracking}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              isTracking
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <span>{isTracking ? '⏸️' : '▶️'}</span>
            <span>{isTracking ? 'Stop Tracking' : 'Start Tracking'}</span>
          </button>

          <button
            onClick={clearMetrics}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            disabled={metrics.length === 0}
          >
            Clear Data
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('realtime')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'realtime'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Real-time
            </button>
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'summary'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Summary
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            <span className="font-medium">
              {isTracking ? 'Tracking Active' : 'Tracking Paused'}
            </span>
            {isTracking && (
              <span className="text-sm text-gray-600">Updates every {updateInterval}ms</span>
            )}
          </div>
          <div className="text-sm text-gray-600">{metrics.length} data points collected</div>
        </div>
      </div>

      {/* Metric Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Select Metrics to Track</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {Object.values(metricConfigs).map((config) => (
            <label key={config.key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMetrics.has(config.key)}
                onChange={(e) => {
                  const newSelected = new Set(selectedMetrics);
                  if (e.target.checked) {
                    newSelected.add(config.key);
                  } else {
                    newSelected.delete(config.key);
                  }
                  setSelectedMetrics(newSelected);
                }}
                className="text-blue-600"
              />
              <span className="text-sm">{config.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {viewMode === 'realtime' ? renderRealtimeChart() : renderSummaryView()}
      </div>

      {/* Performance Insights */}
      {latestMetrics && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Core Web Vitals Status</h5>
              <div className="space-y-2">
                {['lcp', 'inp', 'cls'].map((key) => {
                  const config = metricConfigs[key];
                  const value = latestMetrics[config.key];
                  const score =
                    value !== undefined ? getPerformanceScore(value, config) : 'unknown';

                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{config.label}:</span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            score === 'good'
                              ? 'bg-green-100 text-green-800'
                              : score === 'needs-improvement'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {score === 'good'
                            ? 'Good'
                            : score === 'needs-improvement'
                              ? 'Needs Work'
                              : 'Poor'}
                        </span>
                        {value !== undefined && (
                          <span className="text-sm text-gray-600">
                            {formatValue(value, config)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-3">System Health</h5>
              <div className="space-y-2">
                {['memoryUsage', 'cpuUsage', 'domNodes'].map((key) => {
                  const config = metricConfigs[key];
                  const value = latestMetrics[config.key];
                  const score =
                    value !== undefined ? getPerformanceScore(value, config) : 'unknown';

                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{config.label}:</span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            score === 'good'
                              ? 'bg-green-100 text-green-800'
                              : score === 'needs-improvement'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {score === 'good'
                            ? 'Good'
                            : score === 'needs-improvement'
                              ? 'Needs Work'
                              : 'Poor'}
                        </span>
                        {value !== undefined && (
                          <span className="text-sm text-gray-600">
                            {formatValue(value, config)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsTracker;
