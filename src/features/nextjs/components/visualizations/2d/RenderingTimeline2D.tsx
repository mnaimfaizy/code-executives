import React, { useState, useEffect } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface RenderingTimeline2DProps extends BaseNextJSVisualizationProps {
  strategy: 'ssr' | 'ssg' | 'csr' | 'isr';
  showDetails?: boolean;
}

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  duration: number; // in ms
  color: string;
  icon: string;
  details?: string[];
}

const RenderingTimeline2D: React.FC<RenderingTimeline2DProps> = ({
  strategy,
  showDetails = false,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Define timeline steps for each strategy
  const getTimelineSteps = (strategy: string): TimelineStep[] => {
    switch (strategy) {
      case 'csr':
        return [
          {
            id: 'request',
            label: 'User Request',
            description: 'Browser requests HTML',
            duration: 50,
            color: 'bg-blue-500',
            icon: '🌐',
            details: ['Empty HTML shell', 'No content yet'],
          },
          {
            id: 'download',
            label: 'Download JS',
            description: 'Download React bundle',
            duration: 300,
            color: 'bg-yellow-500',
            icon: '📦',
            details: ['Large JavaScript bundle', 'Blocking render'],
          },
          {
            id: 'hydrate',
            label: 'Hydrate',
            description: 'React takes control',
            duration: 150,
            color: 'bg-green-500',
            icon: '⚡',
            details: ['Parse JavaScript', 'Build component tree'],
          },
          {
            id: 'fetch',
            label: 'Fetch Data',
            description: 'Load dynamic content',
            duration: 200,
            color: 'bg-purple-500',
            icon: '📡',
            details: ['API calls', 'Client-side data fetching'],
          },
          {
            id: 'render',
            label: 'Render Content',
            description: 'Display interactive UI',
            duration: 100,
            color: 'bg-emerald-500',
            icon: '✨',
            details: ['Interactive components', 'Full functionality'],
          },
        ];

      case 'ssr':
        return [
          {
            id: 'request',
            label: 'User Request',
            description: 'Browser requests page',
            duration: 50,
            color: 'bg-blue-500',
            icon: '🌐',
            details: ['HTTP request', 'Server receives'],
          },
          {
            id: 'server-render',
            label: 'Server Rendering',
            description: 'Next.js renders on server',
            duration: 250,
            color: 'bg-orange-500',
            icon: '🏭',
            details: ['Execute React components', 'Generate HTML', 'Fetch data if needed'],
          },
          {
            id: 'download',
            label: 'Download HTML',
            description: 'Send rendered HTML',
            duration: 100,
            color: 'bg-green-500',
            icon: '📄',
            details: ['Complete HTML page', 'SEO-friendly content'],
          },
          {
            id: 'hydrate',
            label: 'Hydration',
            description: 'Make page interactive',
            duration: 150,
            color: 'bg-teal-500',
            icon: '🔄',
            details: ['Attach event handlers', 'Enable interactions'],
          },
        ];

      case 'ssg':
        return [
          {
            id: 'build',
            label: 'Build Time',
            description: 'Pre-generate pages',
            duration: 1000,
            color: 'bg-indigo-500',
            icon: '🔨',
            details: ['Static generation', 'CDN ready', 'No server needed'],
          },
          {
            id: 'request',
            label: 'User Request',
            description: 'Fast CDN delivery',
            duration: 20,
            color: 'bg-blue-500',
            icon: '⚡',
            details: ['Edge network', 'Instant loading'],
          },
          {
            id: 'hydrate',
            label: 'Hydration',
            description: 'Add interactivity',
            duration: 100,
            color: 'bg-green-500',
            icon: '✨',
            details: ['Client-side JavaScript', 'Interactive features'],
          },
        ];

      case 'isr':
        return [
          {
            id: 'initial-build',
            label: 'Initial Build',
            description: 'Generate static pages',
            duration: 800,
            color: 'bg-indigo-500',
            icon: '🔨',
            details: ['Static generation', 'Background regeneration'],
          },
          {
            id: 'cache-serve',
            label: 'Cache Hit',
            description: 'Serve cached version',
            duration: 25,
            color: 'bg-blue-500',
            icon: '💾',
            details: ['Fast CDN delivery', 'Pre-rendered content'],
          },
          {
            id: 'background-regen',
            label: 'Background Update',
            description: 'Regenerate in background',
            duration: 300,
            color: 'bg-purple-500',
            icon: '🔄',
            details: ['Non-blocking', 'Fresh content ready'],
          },
          {
            id: 'hydrate',
            label: 'Hydration',
            description: 'Enable interactions',
            duration: 100,
            color: 'bg-green-500',
            icon: '✨',
            details: ['Client-side features', 'Full interactivity'],
          },
        ];

      default:
        return [];
    }
  };

  const steps = getTimelineSteps(strategy);
  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

  // Auto-play animation
  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const step = steps[currentStep];
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, step.duration);

      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length) {
      setIsPlaying(false);
    }
  }, [currentStep, isPlaying, steps]);

  const resetAnimation = () => {
    setCurrentStep(0);
    setIsPlaying(false);
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

      {/* Timeline Visualization */}
      <div className="relative">
        {/* Timeline bar */}
        <div className="h-2 bg-gray-200 rounded-full mb-8">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
            style={{
              width: `${(currentStep / Math.max(steps.length - 1, 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative">
          {steps.map((step, index) => {
            const isActive = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-start space-x-4 mb-6 transition-all duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-50'
                }`}
              >
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                      isActive ? step.color : 'bg-gray-300'
                    } ${isCurrent ? 'ring-4 ring-blue-200 scale-110' : ''}`}
                  >
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-8 mt-2 transition-colors ${
                        isActive ? 'bg-blue-300' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
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
                    className={`text-sm mb-2 transition-colors ${
                      isActive ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>

                  {showDetails && step.details && (
                    <ul className="text-xs text-gray-600 space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center">
                          <span className="w-1 h-1 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Performance Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Total Time</div>
            <div className="font-semibold text-gray-900">{totalDuration}ms</div>
          </div>
          <div>
            <div className="text-gray-600">Steps</div>
            <div className="font-semibold text-gray-900">{steps.length}</div>
          </div>
          <div>
            <div className="text-gray-600">Server Load</div>
            <div className="font-semibold text-gray-900">
              {strategy === 'ssg'
                ? 'Very Low'
                : strategy === 'csr'
                  ? 'Low'
                  : strategy === 'isr'
                    ? 'Medium'
                    : 'High'}
            </div>
          </div>
          <div>
            <div className="text-gray-600">SEO Ready</div>
            <div className="font-semibold text-gray-900">{strategy === 'csr' ? 'No' : 'Yes'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenderingTimeline2D;
