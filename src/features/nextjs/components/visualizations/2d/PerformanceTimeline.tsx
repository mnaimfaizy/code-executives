import React, { useState, useMemo } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface PerformanceTimelineProps extends BaseNextJSVisualizationProps {
  metrics?: PerformanceMetric[];
  timeRange?: number; // in seconds
  showThresholds?: boolean;
}

interface PerformanceMetric {
  timestamp: number;
  lcp?: number; // Largest Contentful Paint (ms)
  inp?: number; // Interaction to Next Paint (ms)
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint (ms)
  ttfb?: number; // Time to First Byte (ms)
  bundleSize?: number; // Bundle size in KB
  memoryUsage?: number; // Memory usage in MB
  event?: string; // Special events like 'hydration', 'route-change', etc.
}

interface MetricThresholds {
  lcp: { good: number; poor: number };
  inp: { good: number; poor: number };
  cls: { good: number; poor: number };
  fcp: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

const PerformanceTimeline: React.FC<PerformanceTimelineProps> = ({
  metrics: initialMetrics = [],
  timeRange = 30,
  showThresholds = true,
  className = '',
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<PerformanceMetric | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Core Web Vitals thresholds
  const thresholds: MetricThresholds = {
    lcp: { good: 2500, poor: 4000 },
    inp: { good: 200, poor: 500 },
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1800, poor: 3000 },
    ttfb: { good: 800, poor: 1800 },
  };

  // Generate sample performance data
  const generateSampleMetrics = (): PerformanceMetric[] => {
    const metrics: PerformanceMetric[] = [];
    const startTime = Date.now() - timeRange * 1000;

    for (let i = 0; i < timeRange; i++) {
      const timestamp = startTime + i * 1000;
      const baseLCP = 2000 + Math.random() * 2000;
      const baseINP = 100 + Math.random() * 400;
      const baseCLS = Math.random() * 0.3;

      metrics.push({
        timestamp,
        lcp: baseLCP + (Math.random() - 0.5) * 500,
        inp: baseINP + (Math.random() - 0.5) * 100,
        cls: Math.max(0, baseCLS + (Math.random() - 0.5) * 0.1),
        fcp: 1500 + Math.random() * 1000,
        ttfb: 200 + Math.random() * 600,
        bundleSize: 2500 + Math.random() * 500,
        memoryUsage: 50 + Math.random() * 30,
      });
    }

    // Add some special events
    metrics[5].event = 'route-change';
    metrics[15].event = 'hydration';
    metrics[25].event = 'bundle-loaded';

    return metrics;
  };

  const metrics = initialMetrics.length > 0 ? initialMetrics : generateSampleMetrics();

  // Calculate chart dimensions
  const chartWidth = 800;
  const chartHeight = 400;
  const margin = { top: 20, right: 80, bottom: 60, left: 60 };

  // Get visible metrics based on time range
  const visibleMetrics = useMemo(() => {
    const endTime = Date.now();
    const startTime = endTime - timeRange * 1000;
    return metrics.filter((m) => m.timestamp >= startTime && m.timestamp <= endTime);
  }, [metrics, timeRange]);

  // Calculate scales
  const timeScale = useMemo(() => {
    if (visibleMetrics.length === 0) return { min: 0, max: timeRange * 1000 };
    const timestamps = visibleMetrics.map((m) => m.timestamp);
    return {
      min: Math.min(...timestamps),
      max: Math.max(...timestamps),
    };
  }, [visibleMetrics, timeRange]);

  // Metric configurations
  const metricConfigs = {
    lcp: { color: '#ef4444', label: 'LCP (ms)', unit: 'ms', max: 5000 },
    inp: { color: '#f59e0b', label: 'INP (ms)', unit: 'ms', max: 1000 },
    cls: { color: '#10b981', label: 'CLS', unit: '', max: 0.5 },
    fcp: { color: '#3b82f6', label: 'FCP (ms)', unit: 'ms', max: 4000 },
    ttfb: { color: '#8b5cf6', label: 'TTFB (ms)', unit: 'ms', max: 2000 },
    bundleSize: { color: '#ec4899', label: 'Bundle (KB)', unit: 'KB', max: 4000 },
    memoryUsage: { color: '#06b6d4', label: 'Memory (MB)', unit: 'MB', max: 200 },
  };

  // Convert data point to chart coordinates
  const getPointPosition = (metric: PerformanceMetric, metricKey: keyof PerformanceMetric) => {
    const value = metric[metricKey] as number;
    if (value === undefined) return null;

    const config = metricConfigs[metricKey as keyof typeof metricConfigs];
    if (!config) return null;

    const x =
      ((metric.timestamp - timeScale.min) / (timeScale.max - timeScale.min)) *
        (chartWidth - margin.left - margin.right) +
      margin.left;
    const y =
      chartHeight -
      margin.bottom -
      (value / config.max) * (chartHeight - margin.top - margin.bottom);

    return { x, y };
  };

  // Get performance score color
  const getPerformanceColor = (value: number, metricKey: string): string => {
    if (!showThresholds) return '#6b7280';

    const threshold = thresholds[metricKey as keyof MetricThresholds];
    if (!threshold) return '#6b7280';

    if (value <= threshold.good) return '#10b981'; // Good - green
    if (value <= threshold.poor) return '#f59e0b'; // Needs improvement - yellow
    return '#ef4444'; // Poor - red
  };

  // Format value for display
  const formatValue = (value: number, metricKey: string): string => {
    const config = metricConfigs[metricKey as keyof typeof metricConfigs];
    if (metricKey === 'cls') {
      return value.toFixed(3);
    }
    if (config?.unit === 'ms') {
      return `${Math.round(value)}ms`;
    }
    if (config?.unit === 'KB' || config?.unit === 'MB') {
      return `${Math.round(value)}${config.unit}`;
    }
    return value.toString();
  };

  // Get current metrics summary
  const currentMetrics = useMemo(() => {
    if (visibleMetrics.length === 0) return null;
    const latest = visibleMetrics[visibleMetrics.length - 1];
    return {
      lcp: latest.lcp,
      inp: latest.inp,
      cls: latest.cls,
      fcp: latest.fcp,
      ttfb: latest.ttfb,
      bundleSize: latest.bundleSize,
      memoryUsage: latest.memoryUsage,
    };
  }, [visibleMetrics]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <span>{isPlaying ? '⏸️' : '▶️'}</span>
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Good</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Needs Work</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Poor</span>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="relative">
          <svg width={chartWidth} height={chartHeight} className="border border-gray-200 rounded">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Threshold lines */}
            {showThresholds &&
              selectedMetric &&
              thresholds[selectedMetric as keyof MetricThresholds] && (
                <g>
                  {Object.entries(thresholds[selectedMetric as keyof MetricThresholds]).map(
                    ([level, value]) => {
                      const config = metricConfigs[selectedMetric as keyof typeof metricConfigs];
                      if (!config) return null;

                      const y =
                        chartHeight -
                        margin.bottom -
                        (value / config.max) * (chartHeight - margin.top - margin.bottom);
                      const color = level === 'good' ? '#10b981' : '#ef4444';
                      const label = level === 'good' ? 'Good' : 'Poor';

                      return (
                        <g key={level}>
                          <line
                            x1={margin.left}
                            y1={y}
                            x2={chartWidth - margin.right}
                            y2={y}
                            stroke={color}
                            strokeWidth="1"
                            strokeDasharray="5,5"
                            opacity="0.7"
                          />
                          <text
                            x={chartWidth - margin.right + 5}
                            y={y + 4}
                            fill={color}
                            fontSize="10"
                            fontWeight="bold"
                          >
                            {label}
                          </text>
                        </g>
                      );
                    }
                  )}
                </g>
              )}

            {/* Data lines */}
            {Object.keys(metricConfigs).map((metricKey) => {
              const config = metricConfigs[metricKey as keyof typeof metricConfigs];
              const points = visibleMetrics
                .map((metric) => getPointPosition(metric, metricKey as keyof PerformanceMetric))
                .filter((point) => point !== null) as { x: number; y: number }[];

              if (points.length < 2) return null;

              const pathData = points
                .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
                .join(' ');

              return (
                <g key={metricKey}>
                  <path
                    d={pathData}
                    stroke={config.color}
                    strokeWidth={selectedMetric === metricKey ? 3 : 2}
                    fill="none"
                    opacity={selectedMetric === null || selectedMetric === metricKey ? 1 : 0.3}
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedMetric(selectedMetric === metricKey ? null : metricKey)
                    }
                  />

                  {/* Data points */}
                  {points.map((point, index) => {
                    const metric = visibleMetrics[index];
                    const value = metric[metricKey as keyof PerformanceMetric] as number;
                    const isHovered = hoveredPoint === metric;

                    return (
                      <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r={isHovered ? 6 : 4}
                        fill={getPerformanceColor(value, metricKey)}
                        stroke={config.color}
                        strokeWidth="2"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(metric)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Event markers */}
            {visibleMetrics.map((metric, index) => {
              if (!metric.event) return null;
              const point = getPointPosition(metric, 'lcp'); // Use any metric for positioning
              if (!point) return null;

              return (
                <g key={`event-${index}`}>
                  <line
                    x1={point.x}
                    y1={margin.top}
                    x2={point.x}
                    y2={chartHeight - margin.bottom}
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <text
                    x={point.x}
                    y={margin.top - 5}
                    textAnchor="middle"
                    fill="#8b5cf6"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {metric.event}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(metricConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMetric(selectedMetric === key ? null : key)}
                  className={`flex items-center space-x-2 p-1 rounded transition-colors ${
                    selectedMetric === key ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className={selectedMetric === key ? 'font-bold' : ''}>{config.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Current Metrics Summary */}
      {currentMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(currentMetrics).map(([key, value]) => {
            if (value === undefined) return null;
            const config = metricConfigs[key as keyof typeof metricConfigs];
            if (!config) return null;

            return (
              <div key={key} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: getPerformanceColor(value, key) }}
                >
                  {formatValue(value, key)}
                </div>
                <div className="text-sm text-gray-600">{config.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Metric Details */}
      {hoveredPoint && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Metric Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {Object.entries(hoveredPoint).map(([key, value]) => {
              if (key === 'timestamp' || key === 'event' || value === undefined) return null;
              const config = metricConfigs[key as keyof typeof metricConfigs];
              if (!config) return null;

              return (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{config.label}:</span>
                  <span style={{ color: getPerformanceColor(value as number, key) }}>
                    {formatValue(value as number, key)}
                  </span>
                </div>
              );
            })}
          </div>
          {hoveredPoint.event && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Event:</span> {hoveredPoint.event}
            </div>
          )}
        </div>
      )}

      {/* Performance Concepts */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Core Web Vitals</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-red-600 mb-2">Largest Contentful Paint (LCP)</h5>
            <p className="text-gray-600">
              Measures loading performance. Should be &lt; 2.5s for good user experience.
            </p>
          </div>
          <div>
            <h5 className="font-medium text-yellow-600 mb-2">Interaction to Next Paint (INP)</h5>
            <p className="text-gray-600">
              Measures interactivity. Should be &lt; 200ms for good responsiveness.
            </p>
          </div>
          <div>
            <h5 className="font-medium text-green-600 mb-2">Cumulative Layout Shift (CLS)</h5>
            <p className="text-gray-600">
              Measures visual stability. Should be &lt; 0.1 for good stability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTimeline;
