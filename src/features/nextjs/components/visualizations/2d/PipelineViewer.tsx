import React, { useState, useEffect, useCallback } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface PipelineViewerProps extends BaseNextJSVisualizationProps {
  requestFlow?: RequestFlowStep[];
  onStepSelect?: (step: RequestFlowStep) => void;
  autoPlay?: boolean;
}

interface RequestFlowStep {
  id: string;
  name: string;
  type: 'middleware' | 'route-handler' | 'response' | 'error';
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration?: number;
  data?: Record<string, unknown>;
  description: string;
  position: { x: number; y: number };
  connections: string[]; // IDs of connected steps
}

interface PipelineMetrics {
  totalDuration: number;
  middlewareCount: number;
  handlerDuration: number;
  responseSize: number;
  errorCount: number;
}

const PipelineViewer: React.FC<PipelineViewerProps> = ({
  requestFlow: initialFlow = [],
  onStepSelect,
  autoPlay = false,
  className = '',
}) => {
  const [requestFlow, setRequestFlow] = useState<RequestFlowStep[]>(initialFlow);
  const [selectedStep, setSelectedStep] = useState<RequestFlowStep | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [metrics, setMetrics] = useState<PipelineMetrics>({
    totalDuration: 0,
    middlewareCount: 0,
    handlerDuration: 0,
    responseSize: 0,
    errorCount: 0,
  });

  // Default request flow for demonstration
  const defaultFlow: RequestFlowStep[] = [
    {
      id: 'start',
      name: 'Request Start',
      type: 'middleware',
      status: 'completed',
      description: 'Incoming HTTP request received',
      position: { x: 50, y: 100 },
      connections: ['auth-middleware'],
    },
    {
      id: 'auth-middleware',
      name: 'Authentication',
      type: 'middleware',
      status: 'completed',
      duration: 15,
      description: 'Validate JWT token and user permissions',
      position: { x: 200, y: 100 },
      connections: ['cors-middleware'],
    },
    {
      id: 'cors-middleware',
      name: 'CORS Headers',
      type: 'middleware',
      status: 'completed',
      duration: 5,
      description: 'Add CORS headers for cross-origin requests',
      position: { x: 350, y: 100 },
      connections: ['rate-limit'],
    },
    {
      id: 'rate-limit',
      name: 'Rate Limiting',
      type: 'middleware',
      status: 'completed',
      duration: 8,
      description: 'Check request rate limits',
      position: { x: 500, y: 100 },
      connections: ['route-handler'],
    },
    {
      id: 'route-handler',
      name: 'Route Handler',
      type: 'route-handler',
      status: 'processing',
      duration: 45,
      description: 'Process API route logic and database operations',
      position: { x: 650, y: 200 },
      connections: ['response'],
    },
    {
      id: 'response',
      name: 'Response',
      type: 'response',
      status: 'pending',
      description: 'Send HTTP response to client',
      position: { x: 800, y: 200 },
      connections: [],
    },
  ];

  const activeFlow = requestFlow.length > 0 ? requestFlow : defaultFlow;

  // Calculate metrics
  const calculateMetrics = useCallback((flow: RequestFlowStep[]): PipelineMetrics => {
    const completedSteps = flow.filter((step) => step.status === 'completed');
    const middlewareSteps = flow.filter((step) => step.type === 'middleware');
    const handlerSteps = flow.filter((step) => step.type === 'route-handler');
    const errorSteps = flow.filter((step) => step.status === 'error');

    return {
      totalDuration: completedSteps.reduce((sum, step) => sum + (step.duration || 0), 0),
      middlewareCount: middlewareSteps.length,
      handlerDuration: handlerSteps.reduce((sum, step) => sum + (step.duration || 0), 0),
      responseSize: 0, // Would be calculated from actual response data
      errorCount: errorSteps.length,
    };
  }, []);

  // Update metrics when flow changes
  useEffect(() => {
    setMetrics(calculateMetrics(activeFlow));
  }, [activeFlow, calculateMetrics]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setRequestFlow((currentFlow) => {
        const processingIndex = currentFlow.findIndex((step) => step.status === 'processing');
        const nextIndex = processingIndex + 1;

        if (nextIndex >= currentFlow.length) {
          setIsPlaying(false);
          return currentFlow;
        }

        return currentFlow.map((step, index) =>
          index === nextIndex
            ? { ...step, status: 'processing' as const }
            : index < nextIndex
              ? { ...step, status: 'completed' as const }
              : step
        );
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle step selection
  const handleStepClick = (step: RequestFlowStep) => {
    setSelectedStep(step);
    onStepSelect?.(step);
  };

  // Reset pipeline
  const resetPipeline = () => {
    setRequestFlow(defaultFlow.map((step) => ({ ...step, status: 'pending' as const })));
    setSelectedStep(null);
    setIsPlaying(false);
  };

  // Get step color based on type and status
  const getStepColor = (step: RequestFlowStep) => {
    const baseColors = {
      middleware: {
        pending: 'bg-gray-100 border-gray-300 text-gray-600',
        processing: 'bg-blue-100 border-blue-300 text-blue-700',
        completed: 'bg-green-100 border-green-300 text-green-700',
        error: 'bg-red-100 border-red-300 text-red-700',
      },
      'route-handler': {
        pending: 'bg-gray-100 border-gray-300 text-gray-600',
        processing: 'bg-purple-100 border-purple-300 text-purple-700',
        completed: 'bg-green-100 border-green-300 text-green-700',
        error: 'bg-red-100 border-red-300 text-red-700',
      },
      response: {
        pending: 'bg-gray-100 border-gray-300 text-gray-600',
        processing: 'bg-yellow-100 border-yellow-300 text-yellow-700',
        completed: 'bg-green-100 border-green-300 text-green-700',
        error: 'bg-red-100 border-red-300 text-red-700',
      },
      error: {
        pending: 'bg-gray-100 border-gray-300 text-gray-600',
        processing: 'bg-red-100 border-red-300 text-red-700',
        completed: 'bg-red-100 border-red-300 text-red-700',
        error: 'bg-red-100 border-red-300 text-red-700',
      },
    };

    return baseColors[step.type][step.status];
  };

  // Get connection path between steps
  const getConnectionPath = (fromStep: RequestFlowStep, toStep: RequestFlowStep) => {
    const fromX = fromStep.position.x + 80; // Half width of step
    const fromY = fromStep.position.y + 30; // Half height of step
    const toX = toStep.position.x;
    const toY = toStep.position.y + 30;

    // Create curved path
    const midX = (fromX + toX) / 2;
    const controlOffset = Math.abs(toY - fromY) / 3;

    return `M ${fromX} ${fromY} Q ${midX} ${fromY + controlOffset} ${toX} ${toY}`;
  };

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
          <button
            onClick={resetPipeline}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="relative" style={{ height: '400px', overflow: 'auto' }}>
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ minWidth: '1000px', minHeight: '400px' }}
          >
            {/* Connection lines */}
            {activeFlow.map((step) =>
              step.connections.map((connectionId) => {
                const toStep = activeFlow.find((s) => s.id === connectionId);
                if (!toStep) return null;

                const isActive = step.status === 'completed' && toStep.status !== 'pending';
                return (
                  <path
                    key={`${step.id}-${connectionId}`}
                    d={getConnectionPath(step, toStep)}
                    stroke={isActive ? '#10b981' : '#d1d5db'}
                    strokeWidth="2"
                    fill="none"
                    markerEnd={isActive ? 'url(#arrowhead-green)' : 'url(#arrowhead-gray)'}
                  />
                );
              })
            )}

            {/* Arrow markers */}
            <defs>
              <marker
                id="arrowhead-green"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
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
          </svg>

          {/* Pipeline steps */}
          {activeFlow.map((step) => (
            <div
              key={step.id}
              className={`absolute w-40 h-16 rounded-lg border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center text-xs font-medium ${getStepColor(
                step
              )} ${selectedStep?.id === step.id ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
              style={{
                left: step.position.x,
                top: step.position.y,
                zIndex: selectedStep?.id === step.id ? 10 : 1,
              }}
              onClick={() => handleStepClick(step)}
            >
              <div className="font-semibold truncate w-full px-1">{step.name}</div>
              {step.duration && <div className="text-xs opacity-75">{step.duration}ms</div>}
              {step.status === 'processing' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Details */}
      {selectedStep && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Step Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Name:</strong> {selectedStep.name}
                </div>
                <div>
                  <strong>Type:</strong> {selectedStep.type.replace('-', ' ')}
                </div>
                <div>
                  <strong>Status:</strong> {selectedStep.status}
                </div>
                {selectedStep.duration && (
                  <div>
                    <strong>Duration:</strong> {selectedStep.duration}ms
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm">
                <strong>Description:</strong>
                <p className="mt-1 text-gray-600">{selectedStep.description}</p>
              </div>
              {selectedStep.data && (
                <div className="mt-3">
                  <strong>Data:</strong>
                  <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedStep.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{metrics.totalDuration}ms</div>
          <div className="text-sm text-gray-600">Total Duration</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{metrics.middlewareCount}</div>
          <div className="text-sm text-gray-600">Middleware Steps</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{metrics.handlerDuration}ms</div>
          <div className="text-sm text-gray-600">Handler Time</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{metrics.errorCount}</div>
          <div className="text-sm text-gray-600">Errors</div>
        </div>
      </div>

      {/* Pipeline Concepts */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Request Pipeline Concepts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Pipeline Flow</h5>
            <ul className="text-gray-600 space-y-1">
              <li>
                • <strong>Middleware:</strong> Pre-processing (auth, CORS, rate limiting)
              </li>
              <li>
                • <strong>Route Handler:</strong> Main business logic
              </li>
              <li>
                • <strong>Response:</strong> Data formatting and delivery
              </li>
              <li>
                • <strong>Error Handling:</strong> Exception management
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Performance Monitoring</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Track processing time per step</li>
              <li>• Identify bottlenecks in the pipeline</li>
              <li>• Monitor error rates and patterns</li>
              <li>• Optimize middleware execution order</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineViewer;
