import React, { useState } from 'react';
import type { BaseNextJSVisualizationProps, CoreWebVitals } from '../../../types/nextjs';

interface PerformanceComparisonProps extends BaseNextJSVisualizationProps {
  showMetrics?: boolean;
  compareStrategies?: boolean;
}

interface StrategyMetrics {
  strategy: 'ssr' | 'ssg' | 'csr' | 'isr';
  name: string;
  lcp: number;
  inp: number;
  cls: number;
  fcp: number;
  ttfb: number;
  bundleSize: number;
  hydrationTime: number;
  description: string;
  pros: string[];
  cons: string[];
}

const PerformanceComparison: React.FC<PerformanceComparisonProps> = ({
  showMetrics = true,
  compareStrategies = true,
  className = '',
  interactive = true,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'ssr' | 'ssg' | 'csr' | 'isr'>('ssr');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  const strategies: StrategyMetrics[] = [
    {
      strategy: 'csr',
      name: 'Client-Side Rendering',
      lcp: 2800,
      inp: 120,
      cls: 0.15,
      fcp: 2200,
      ttfb: 200,
      bundleSize: 450,
      hydrationTime: 800,
      description: 'Traditional React approach - renders entirely in browser',
      pros: ['Fast initial response', 'Rich interactivity', 'No server load'],
      cons: ['Slow initial load', 'Poor SEO', 'No content visible until JS loads'],
    },
    {
      strategy: 'ssr',
      name: 'Server-Side Rendering',
      lcp: 1200,
      inp: 80,
      cls: 0.08,
      fcp: 900,
      ttfb: 150,
      bundleSize: 380,
      hydrationTime: 600,
      description: 'Renders on server for each request',
      pros: ['Fast initial content', 'Good SEO', 'Consistent performance'],
      cons: ['Server load', 'Slower TTFB', 'Potential hydration mismatch'],
    },
    {
      strategy: 'ssg',
      name: 'Static Site Generation',
      lcp: 800,
      inp: 60,
      cls: 0.05,
      fcp: 600,
      ttfb: 50,
      bundleSize: 320,
      hydrationTime: 400,
      description: 'Pre-renders pages at build time',
      pros: ['Fastest loading', 'Best SEO', 'CDN friendly'],
      cons: ['No real-time data', 'Long build times', 'Storage intensive'],
    },
    {
      strategy: 'isr',
      name: 'Incremental Static Regeneration',
      lcp: 950,
      inp: 70,
      cls: 0.06,
      fcp: 700,
      ttfb: 80,
      bundleSize: 340,
      hydrationTime: 500,
      description: 'Combines SSG with on-demand regeneration',
      pros: ['Fresh content', 'Fast loading', 'Scalable'],
      cons: ['Complex caching', 'Potential stale data', 'Background regeneration'],
    },
  ];

  const getRating = (value: number, metric: keyof CoreWebVitals) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      inp: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return '#10b981';
      case 'needs-improvement':
        return '#f59e0b';
      case 'poor':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const renderMetricBar = (value: number, maxValue: number, label: string, unit: string) => {
    const percentage = (value / maxValue) * 100;
    const rating = getRating(value, label.toLowerCase() as keyof CoreWebVitals);
    const color = getRatingColor(rating);

    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-600">
            {value}
            {unit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
      </div>
    );
  };

  const renderStrategyCard = (strategy: StrategyMetrics) => {
    const isSelected = selectedStrategy === strategy.strategy;

    return (
      <div
        key={strategy.strategy}
        onClick={() => interactive && setSelectedStrategy(strategy.strategy)}
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{strategy.name}</h3>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {strategy.strategy.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>

        {viewMode === 'overview' && showMetrics && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{strategy.lcp}ms</div>
              <div className="text-gray-500">LCP</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{strategy.inp}ms</div>
              <div className="text-gray-500">INP</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{strategy.cls}</div>
              <div className="text-gray-500">CLS</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const selectedStrategyData = strategies.find((s) => s.strategy === selectedStrategy);

  return (
    <div className={`relative w-full bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Performance Comparison</h3>
        <p className="text-sm text-gray-600">
          Compare Next.js rendering strategies by Core Web Vitals and performance metrics
        </p>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'overview'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'detailed'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Detailed
          </button>
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {strategies.map(renderStrategyCard)}
        </div>
      </div>

      {/* Detailed Metrics */}
      {viewMode === 'detailed' && selectedStrategyData && showMetrics && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">
            {selectedStrategyData.name} - Detailed Metrics
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core Web Vitals */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Core Web Vitals</h5>
              {renderMetricBar(selectedStrategyData.lcp, 4000, 'LCP', 'ms')}
              {renderMetricBar(selectedStrategyData.inp, 500, 'INP', 'ms')}
              {renderMetricBar(selectedStrategyData.cls * 1000, 250, 'CLS', '')}
            </div>

            {/* Additional Metrics */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Additional Metrics</h5>
              {renderMetricBar(selectedStrategyData.fcp, 3000, 'FCP', 'ms')}
              {renderMetricBar(selectedStrategyData.ttfb, 500, 'TTFB', 'ms')}
              {renderMetricBar(selectedStrategyData.bundleSize, 500, 'Bundle', 'KB')}
              {renderMetricBar(selectedStrategyData.hydrationTime, 1000, 'Hydration', 'ms')}
            </div>
          </div>
        </div>
      )}

      {/* Pros and Cons */}
      {selectedStrategyData && compareStrategies && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-3">✅ Pros</h4>
              <ul className="space-y-1">
                {selectedStrategyData.pros.map((pro, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-red-700 mb-3">⚠️ Cons</h4>
              <ul className="space-y-1">
                {selectedStrategyData.cons.map((con, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Good (≤ threshold)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Needs Improvement</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Poor (&gt; threshold)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceComparison;
