import React, { useState, useEffect } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../types/nextjs';

interface DataFlow2DProps extends BaseNextJSVisualizationProps {
  cacheStrategy: 'none' | 'memoization' | 'isr' | 'static';
  showCache?: boolean;
}

interface FlowStep {
  id: string;
  label: string;
  description: string;
  duration: number;
  color: string;
  icon: string;
  cacheHit?: boolean;
  cacheMiss?: boolean;
}

const DataFlow2D: React.FC<DataFlow2DProps> = ({
  cacheStrategy = 'none',
  showCache = true,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cacheState, setCacheState] = useState<'empty' | 'stale' | 'fresh'>('empty');

  // Define flow steps based on cache strategy
  const getFlowSteps = (strategy: string): FlowStep[] => {
    switch (strategy) {
      case 'none':
        return [
          {
            id: 'request',
            label: 'User Request',
            description: 'Page requests data',
            duration: 50,
            color: 'bg-blue-500',
            icon: '🌐',
          },
          {
            id: 'server-fetch',
            label: 'Server Fetch',
            description: 'Server makes API call',
            duration: 200,
            color: 'bg-orange-500',
            icon: '🏭',
          },
          {
            id: 'api-response',
            label: 'API Response',
            description: 'External API returns data',
            duration: 150,
            color: 'bg-green-500',
            icon: '📡',
          },
          {
            id: 'render',
            label: 'Render Page',
            description: 'Server renders with fresh data',
            duration: 100,
            color: 'bg-emerald-500',
            icon: '✨',
          },
        ];

      case 'memoization':
        return [
          {
            id: 'request1',
            label: 'First Request',
            description: 'Page requests data',
            duration: 50,
            color: 'bg-blue-500',
            icon: '🌐',
          },
          {
            id: 'server-fetch1',
            label: 'Server Fetch',
            description: 'Server makes API call',
            duration: 200,
            color: 'bg-orange-500',
            icon: '🏭',
          },
          {
            id: 'cache-store',
            label: 'Cache Store',
            description: 'Result cached in memory',
            duration: 20,
            color: 'bg-purple-500',
            icon: '💾',
          },
          {
            id: 'request2',
            label: 'Second Request',
            description: 'Same page requested again',
            duration: 50,
            color: 'bg-blue-500',
            icon: '🌐',
          },
          {
            id: 'cache-hit',
            label: 'Cache Hit',
            description: 'Same request deduplicated',
            duration: 10,
            color: 'bg-green-500',
            icon: '⚡',
            cacheHit: true,
          },
          {
            id: 'render',
            label: 'Render Page',
            description: 'Server renders with cached data',
            duration: 100,
            color: 'bg-emerald-500',
            icon: '✨',
          },
        ];

      case 'isr':
        return [
          {
            id: 'build-time',
            label: 'Build Time',
            description: 'Pre-generate page with data',
            duration: 300,
            color: 'bg-indigo-500',
            icon: '🔨',
          },
          {
            id: 'cache-store',
            label: 'Cache Page',
            description: 'Store rendered HTML',
            duration: 20,
            color: 'bg-purple-500',
            icon: '💾',
          },
          {
            id: 'request',
            label: 'User Request',
            description: 'Page requested by user',
            duration: 50,
            color: 'bg-blue-500',
            icon: '🌐',
          },
          {
            id: 'cache-check',
            label: 'Cache Check',
            description: 'Check if cache is fresh',
            duration: 15,
            color: 'bg-yellow-500',
            icon: '🔍',
          },
          {
            id: 'cache-hit',
            label: 'Cache Hit',
            description: 'Serve cached version instantly',
            duration: 5,
            color: 'bg-green-500',
            icon: '⚡',
            cacheHit: true,
          },
          {
            id: 'background-regen',
            label: 'Background Regen',
            description: 'Regenerate in background',
            duration: 200,
            color: 'bg-orange-500',
            icon: '🔄',
          },
        ];

      case 'static':
        return [
          {
            id: 'build-time',
            label: 'Build Time',
            description: 'Generate static page',
            duration: 250,
            color: 'bg-indigo-500',
            icon: '🔨',
          },
          {
            id: 'deploy',
            label: 'Deploy',
            description: 'Deploy to CDN',
            duration: 50,
            color: 'bg-purple-500',
            icon: '🚀',
          },
          {
            id: 'request',
            label: 'User Request',
            description: 'Request from anywhere',
            duration: 20,
            color: 'bg-blue-500',
            icon: '🌍',
          },
          {
            id: 'cdn-serve',
            label: 'CDN Serve',
            description: 'Instant delivery from edge',
            duration: 5,
            color: 'bg-green-500',
            icon: '⚡',
            cacheHit: true,
          },
        ];

      default:
        return [];
    }
  };

  const steps = getFlowSteps(cacheStrategy);
  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

  // Auto-play animation
  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const step = steps[currentStep];
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        // Update cache state based on step
        if (step.cacheHit) {
          setCacheState('fresh');
        } else if (step.id.includes('cache-store')) {
          setCacheState('fresh');
        }
      }, step.duration);

      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length) {
      setIsPlaying(false);
    }
  }, [currentStep, isPlaying, steps]);

  const resetAnimation = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setCacheState('empty');
  };

  const togglePlay = () => {
    if (currentStep >= steps.length) {
      resetAnimation();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlay}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>{isPlaying ? '⏸️' : '▶️'}</span>
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={resetAnimation}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Reset</span>
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
        </div>
      </div>

      {/* Cache Status */}
      {showCache && cacheStrategy !== 'none' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  cacheState === 'fresh'
                    ? 'bg-green-500'
                    : cacheState === 'stale'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                }`}
              />
              <span className="font-medium text-gray-900">Cache Status:</span>
              <span
                className={`font-semibold ${
                  cacheState === 'fresh'
                    ? 'text-green-600'
                    : cacheState === 'stale'
                      ? 'text-yellow-600'
                      : 'text-gray-600'
                }`}
              >
                {cacheState === 'fresh' ? 'Fresh' : cacheState === 'stale' ? 'Stale' : 'Empty'}
              </span>
            </div>
            <div className="text-sm text-gray-600">Strategy: {cacheStrategy.toUpperCase()}</div>
          </div>
        </div>
      )}

      {/* Flow Visualization */}
      <div className="relative bg-white border border-gray-200 rounded-lg p-6">
        {/* Flow steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = index <= currentStep;
            const isCurrent = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-300 ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : isCompleted
                      ? 'border-green-300 bg-green-50'
                      : isActive
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-200'
                }`}
              >
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500'
                        : isCurrent
                          ? step.color + ' ring-4 ring-blue-200 scale-110'
                          : isActive
                            ? step.color
                            : 'bg-gray-300'
                    }`}
                  >
                    {step.cacheHit ? '⚡' : step.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-6 mt-2 transition-colors ${
                        isCompleted ? 'bg-green-300' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`font-semibold transition-colors ${
                        isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </h3>
                    <span className="text-sm text-gray-500">{step.duration}ms</span>
                  </div>

                  <p
                    className={`text-sm transition-colors ${
                      isActive ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>

                  {step.cacheHit && (
                    <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="mr-1">💾</span>
                      Cache Hit - Instant!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Total Time</div>
              <div className="font-semibold text-gray-900">{totalDuration}ms</div>
            </div>
            <div>
              <div className="text-gray-600">API Calls</div>
              <div className="font-semibold text-gray-900">
                {steps.filter((s) => s.icon === '📡').length}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Cache Hits</div>
              <div className="font-semibold text-green-600">
                {steps.filter((s) => s.cacheHit).length}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Efficiency</div>
              <div className="font-semibold text-blue-600">
                {cacheStrategy === 'static'
                  ? '100%'
                  : cacheStrategy === 'isr'
                    ? '95%'
                    : cacheStrategy === 'memoization'
                      ? '80%'
                      : '0%'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy comparison */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Strategy Comparison</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-900">No Cache</div>
            <div className="text-red-600">Slowest</div>
            <div className="text-xs text-gray-600">Every request fetches</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">Memoization</div>
            <div className="text-yellow-600">Fast</div>
            <div className="text-xs text-gray-600">Per-render dedup</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">ISR</div>
            <div className="text-green-600">Very Fast</div>
            <div className="text-xs text-gray-600">Background refresh</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">Static</div>
            <div className="text-emerald-600">Instant</div>
            <div className="text-xs text-gray-600">CDN delivery</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataFlow2D;
