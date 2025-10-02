import React, { useState, useEffect } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface RequestPipeline2DProps extends BaseNextJSVisualizationProps {
  middlewareType: 'simple' | 'complex' | 'edge';
  showCode?: boolean;
}

interface PipelineStep {
  id: string;
  label: string;
  description: string;
  duration: number;
  color: string;
  icon: string;
  type: 'middleware' | 'handler' | 'response';
  code?: string;
  condition?: string;
}

const RequestPipeline2D: React.FC<RequestPipeline2DProps> = ({
  middlewareType = 'simple',
  showCode = false,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [requestData] = useState({
    method: 'GET',
    path: '/api/users',
    headers: { 'user-agent': 'Mozilla/5.0', accept: 'application/json' },
    body: null,
  });

  // Define pipeline steps based on middleware type
  const getPipelineSteps = (type: string): PipelineStep[] => {
    const baseSteps: PipelineStep[] = [
      {
        id: 'request',
        label: 'Incoming Request',
        description: 'HTTP request arrives at edge/server',
        duration: 10,
        color: 'bg-blue-500',
        icon: '🌐',
        type: 'middleware',
        code: `${requestData.method} ${requestData.path}`,
      },
      {
        id: 'middleware-check',
        label: 'Middleware Check',
        description: 'Check if middleware matches this route',
        duration: 20,
        color: 'bg-yellow-500',
        icon: '🔍',
        type: 'middleware',
        code: 'middleware.ts matcher check',
      },
    ];

    if (type === 'simple') {
      baseSteps.push(
        {
          id: 'auth-middleware',
          label: 'Authentication',
          description: 'Validate user session/token',
          duration: 50,
          color: 'bg-green-500',
          icon: '🔐',
          type: 'middleware',
          code: 'if (!session) return NextResponse.redirect("/login")',
          condition: 'Simple auth check',
        },
        {
          id: 'cors-middleware',
          label: 'CORS Headers',
          description: 'Add CORS headers for cross-origin requests',
          duration: 15,
          color: 'bg-purple-500',
          icon: '🌍',
          type: 'middleware',
          code: 'response.headers.set("Access-Control-Allow-Origin", "*")',
          condition: 'CORS required',
        }
      );
    } else if (type === 'complex') {
      baseSteps.push(
        {
          id: 'auth-middleware',
          label: 'JWT Validation',
          description: 'Verify JWT token and extract user claims',
          duration: 80,
          color: 'bg-green-500',
          icon: '🔐',
          type: 'middleware',
          code: 'const payload = jwt.verify(token, SECRET)',
          condition: 'JWT present',
        },
        {
          id: 'rate-limit',
          label: 'Rate Limiting',
          description: 'Check request rate against limits',
          duration: 30,
          color: 'bg-orange-500',
          icon: '⏱️',
          type: 'middleware',
          code: 'if (requests > limit) return 429',
          condition: 'Within limits',
        },
        {
          id: 'rewrite',
          label: 'URL Rewrite',
          description: 'Rewrite URL for A/B testing or routing',
          duration: 25,
          color: 'bg-indigo-500',
          icon: '🔄',
          type: 'middleware',
          code: 'return NextResponse.rewrite("/api/v2/users")',
          condition: 'Rewrite needed',
        },
        {
          id: 'feature-flags',
          label: 'Feature Flags',
          description: 'Check feature flags for request routing',
          duration: 20,
          color: 'bg-cyan-500',
          icon: '🚩',
          type: 'middleware',
          code: 'if (featureEnabled) rewrite("/new-feature")',
          condition: 'Feature enabled',
        }
      );
    } else if (type === 'edge') {
      baseSteps.push(
        {
          id: 'geo-location',
          label: 'Geo Location',
          description: 'Determine user location from IP',
          duration: 40,
          color: 'bg-teal-500',
          icon: '📍',
          type: 'middleware',
          code: 'const country = getCountryFromIP(request.ip)',
          condition: 'Edge runtime',
        },
        {
          id: 'cdn-routing',
          label: 'CDN Optimization',
          description: 'Route to nearest CDN edge location',
          duration: 35,
          color: 'bg-pink-500',
          icon: '⚡',
          type: 'middleware',
          code: 'return NextResponse.rewrite(nearestCDN)',
          condition: 'CDN available',
        },
        {
          id: 'edge-compute',
          label: 'Edge Compute',
          description: 'Run lightweight computation at edge',
          duration: 60,
          color: 'bg-violet-500',
          icon: '🧠',
          type: 'middleware',
          code: 'const result = await edgeFunction(request)',
          condition: 'Edge function',
        }
      );
    }

    // Add common steps
    baseSteps.push(
      {
        id: 'route-handler',
        label: 'Route Handler',
        description: 'Execute API route handler logic',
        duration: 100,
        color: 'bg-red-500',
        icon: '⚙️',
        type: 'handler',
        code: 'export async function GET(request) { ... }',
      },
      {
        id: 'response',
        label: 'Response',
        description: 'Send response back to client',
        duration: 30,
        color: 'bg-emerald-500',
        icon: '📤',
        type: 'response',
        code: 'return NextResponse.json(data)',
      }
    );

    return baseSteps;
  };

  const steps = getPipelineSteps(middlewareType);
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

  const getStepColor = (step: PipelineStep, isActive: boolean, isCompleted: boolean) => {
    if (isCompleted) return 'bg-green-500';
    if (isActive) return step.color;
    return 'bg-gray-300';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'middleware':
        return 'border-blue-200 bg-blue-50';
      case 'handler':
        return 'border-orange-200 bg-orange-50';
      case 'response':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
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
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Middleware</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Handler</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Response</span>
          </div>
        </div>
      </div>

      {/* Request Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {requestData.method}
            </div>
            <code className="text-gray-900 font-mono">{requestData.path}</code>
          </div>
          <div className="text-sm text-gray-600">
            Pipeline: {middlewareType.toUpperCase()} • Duration: {totalDuration}ms
          </div>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Pipeline Header */}
        <div className="border-b border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900">Request Processing Pipeline</h3>
          <p className="text-sm text-gray-600 mt-1">
            {middlewareType === 'simple' && 'Basic middleware with authentication and CORS'}
            {middlewareType === 'complex' &&
              'Advanced middleware with JWT, rate limiting, and feature flags'}
            {middlewareType === 'edge' && 'Edge runtime with geo-location and CDN optimization'}
          </p>
        </div>

        {/* Pipeline Steps */}
        <div className="p-6 space-y-4">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isUpcoming = index > currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-300 ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : isCompleted
                      ? 'border-green-300 bg-green-50'
                      : isUpcoming
                        ? `border-gray-200 ${getTypeColor(step.type)}`
                        : 'border-gray-200'
                }`}
              >
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${getStepColor(
                      step,
                      isActive,
                      isCompleted
                    )} ${isActive ? 'ring-4 ring-blue-200 scale-110' : ''}`}
                  >
                    {step.icon}
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
                    <h4
                      className={`font-semibold transition-colors ${
                        isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          step.type === 'middleware'
                            ? 'bg-blue-100 text-blue-800'
                            : step.type === 'handler'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {step.type}
                      </span>
                      <span className="text-sm text-gray-500">{step.duration}ms</span>
                    </div>
                  </div>

                  <p
                    className={`text-sm transition-colors ${
                      isActive || isCompleted ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>

                  {step.condition && (
                    <div className="mt-2 text-xs text-gray-600">
                      <strong>Condition:</strong> {step.condition}
                    </div>
                  )}

                  {showCode && step.code && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800">
                      {step.code}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance Summary */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Total Steps</div>
              <div className="font-semibold text-gray-900">{steps.length}</div>
            </div>
            <div>
              <div className="text-gray-600">Middleware Steps</div>
              <div className="font-semibold text-blue-600">
                {steps.filter((s) => s.type === 'middleware').length}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Handler Steps</div>
              <div className="font-semibold text-orange-600">
                {steps.filter((s) => s.type === 'handler').length}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Response Steps</div>
              <div className="font-semibold text-green-600">
                {steps.filter((s) => s.type === 'response').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middleware Types Comparison */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Middleware Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div
            className={`p-3 rounded-lg ${middlewareType === 'simple' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">Simple Middleware</div>
            <div className="text-gray-600 mt-1">Basic request processing with auth and CORS</div>
            <div className="text-xs text-gray-500 mt-2">
              • Authentication checks
              <br />
              • CORS header injection
              <br />• Basic redirects
            </div>
          </div>
          <div
            className={`p-3 rounded-lg ${middlewareType === 'complex' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">Complex Middleware</div>
            <div className="text-gray-600 mt-1">
              Advanced logic with rate limiting and feature flags
            </div>
            <div className="text-xs text-gray-500 mt-2">
              • JWT validation
              <br />
              • Rate limiting
              <br />• A/B testing routing
            </div>
          </div>
          <div
            className={`p-3 rounded-lg ${middlewareType === 'edge' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">Edge Middleware</div>
            <div className="text-gray-600 mt-1">Global distribution with edge computing</div>
            <div className="text-xs text-gray-500 mt-2">
              • Geo-based routing
              <br />
              • CDN optimization
              <br />• Edge functions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPipeline2D;
