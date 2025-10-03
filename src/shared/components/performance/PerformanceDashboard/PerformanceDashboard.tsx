import React, { useState, useMemo, useCallback } from 'react';
import { Activity, Zap, Clock, TrendingUp, X } from 'lucide-react';
import { useWebVitals, getMetricRating, WEB_VITALS_THRESHOLDS } from '../../../hooks/useWebVitals';

interface PerformanceDashboardProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  defaultOpen?: boolean;
}

/**
 * Performance monitoring dashboard component
 * Displays Core Web Vitals and other performance metrics in real-time
 */
export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  enabled = import.meta.env.DEV,
  position = 'bottom-right',
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { metrics, loading } = useWebVitals({ enabled });

  // Memoize position classes (constant, but demonstrates pattern)
  const positionClasses = useMemo(
    () => ({
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
    }),
    []
  );

  // Memoize metric descriptions (constant)
  const metricDescriptions = useMemo<Record<string, string>>(
    () => ({
      LCP: 'Largest Contentful Paint - Loading performance',
      FID: 'First Input Delay - Interactivity (deprecated)',
      CLS: 'Cumulative Layout Shift - Visual stability',
      FCP: 'First Contentful Paint - Initial render',
      TTFB: 'Time to First Byte - Server response',
      INP: 'Interaction to Next Paint - Responsiveness',
    }),
    []
  );

  // Memoize helper functions with useCallback
  const getMetricColor = useCallback(
    (metricName: keyof typeof WEB_VITALS_THRESHOLDS, value?: number) => {
      if (value === undefined) return 'text-gray-400';

      const rating = getMetricRating(metricName, value);
      switch (rating) {
        case 'good':
          return 'text-green-600';
        case 'needs-improvement':
          return 'text-yellow-600';
        case 'poor':
          return 'text-red-600';
        default:
          return 'text-gray-400';
      }
    },
    []
  );

  const getMetricBgColor = useCallback(
    (metricName: keyof typeof WEB_VITALS_THRESHOLDS, value?: number) => {
      if (value === undefined) return 'bg-gray-100';

      const rating = getMetricRating(metricName, value);
      switch (rating) {
        case 'good':
          return 'bg-green-100';
        case 'needs-improvement':
          return 'bg-yellow-100';
        case 'poor':
          return 'bg-red-100';
        default:
          return 'bg-gray-100';
      }
    },
    []
  );

  const formatMetricValue = useCallback((metricName: string, value?: number) => {
    if (value === undefined) return '-';

    if (metricName === 'CLS') {
      return value.toFixed(3);
    }

    return `${Math.round(value)}ms`;
  }, []);

  // Memoize toggle handlers
  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  // Don't render if disabled (after all hooks)
  if (!enabled) return null;

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Open performance dashboard"
        >
          <Activity className="h-5 w-5" />
          <span className="text-sm font-medium">Performance</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 w-96`}>
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5" />
            <h3 className="font-semibold">Performance Monitor</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded p-1 transition-colors"
            aria-label="Close performance dashboard"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading metrics...</p>
            </div>
          ) : (
            <>
              {/* Core Web Vitals */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  Core Web Vitals
                </h4>
                <div className="space-y-2">
                  {(['LCP', 'INP', 'CLS'] as const).map((metric) => (
                    <MetricCard
                      key={metric}
                      name={metric}
                      description={metricDescriptions[metric]}
                      color={getMetricColor(metric, metrics[metric])}
                      bgColor={getMetricBgColor(metric, metrics[metric])}
                      formattedValue={formatMetricValue(metric, metrics[metric])}
                    />
                  ))}
                </div>
              </div>

              {/* Other Metrics */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  Additional Metrics
                </h4>
                <div className="space-y-2">
                  {(['FCP', 'TTFB'] as const).map((metric) => (
                    <MetricCard
                      key={metric}
                      name={metric}
                      description={metricDescriptions[metric]}
                      color={getMetricColor(metric, metrics[metric])}
                      bgColor={getMetricBgColor(metric, metrics[metric])}
                      formattedValue={formatMetricValue(metric, metrics[metric])}
                    />
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                  Rating Guide
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-600">Good - Meets target performance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-gray-600">Needs Improvement - Below target</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-gray-600">Poor - Significant issues</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Metrics update in real-time. Refresh page to reset measurements.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  name: string;
  description: string;
  color: string;
  bgColor: string;
  formattedValue: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  name,
  description,
  color,
  bgColor,
  formattedValue,
}) => (
  <div className={`${bgColor} rounded-lg p-3 border border-gray-200`}>
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm font-bold text-gray-900">{name}</span>
      <span className={`text-lg font-bold ${color}`}>{formattedValue}</span>
    </div>
    <p className="text-xs text-gray-600">{description}</p>
  </div>
);

export default PerformanceDashboard;
