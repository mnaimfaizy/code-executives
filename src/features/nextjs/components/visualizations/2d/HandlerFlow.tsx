import React, { useState, useEffect } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface HandlerFlowProps extends BaseNextJSVisualizationProps {
  handlerType: 'rest' | 'graphql' | 'streaming';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  showCode?: boolean;
}

interface HandlerStep {
  id: string;
  label: string;
  description: string;
  duration: number;
  color: string;
  icon: string;
  phase: 'setup' | 'processing' | 'response';
  code?: string;
  async?: boolean;
}

const HandlerFlow: React.FC<HandlerFlowProps> = ({
  handlerType = 'rest',
  method = 'GET',
  showCode = false,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [responseData, setResponseData] = useState<string | object | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Define handler steps based on type and method
  const getHandlerSteps = (type: string, httpMethod: string): HandlerStep[] => {
    const baseSteps: HandlerStep[] = [
      {
        id: 'receive',
        label: 'Receive Request',
        description: 'Handler function receives HTTP request',
        duration: 5,
        color: 'bg-blue-500',
        icon: '📨',
        phase: 'setup',
        code: `export async function ${httpMethod}(request: Request) {`,
      },
      {
        id: 'parse',
        label: 'Parse Request',
        description: 'Extract data from request body/params',
        duration: 15,
        color: 'bg-yellow-500',
        icon: '📋',
        phase: 'setup',
        code:
          httpMethod === 'GET'
            ? 'const { searchParams } = new URL(request.url)'
            : 'const body = await request.json()',
      },
    ];

    if (type === 'rest') {
      baseSteps.push(
        {
          id: 'validate',
          label: 'Validate Input',
          description: 'Check request data against schema',
          duration: 25,
          color: 'bg-orange-500',
          icon: '✅',
          phase: 'processing',
          code: 'if (!data.id) return Response.json({ error: "Missing ID" }, { status: 400 })',
        },
        {
          id: 'database',
          label: 'Database Query',
          description: 'Execute database operation',
          duration: 80,
          color: 'bg-red-500',
          icon: '💾',
          phase: 'processing',
          async: true,
          code:
            httpMethod === 'GET'
              ? 'const user = await db.user.findUnique({ where: { id } })'
              : httpMethod === 'POST'
                ? 'const user = await db.user.create({ data })'
                : 'const user = await db.user.update({ where: { id }, data })',
        },
        {
          id: 'serialize',
          label: 'Serialize Response',
          description: 'Format data for JSON response',
          duration: 20,
          color: 'bg-green-500',
          icon: '📦',
          phase: 'response',
          code: 'return Response.json({ success: true, data: user })',
        }
      );
    } else if (type === 'graphql') {
      baseSteps.push(
        {
          id: 'parse-graphql',
          label: 'Parse GraphQL',
          description: 'Extract query/mutation from request',
          duration: 20,
          color: 'bg-purple-500',
          icon: '🔍',
          phase: 'setup',
          code: 'const { query, variables } = await request.json()',
        },
        {
          id: 'validate-schema',
          label: 'Validate Schema',
          description: 'Check query against GraphQL schema',
          duration: 30,
          color: 'bg-indigo-500',
          icon: '📋',
          phase: 'processing',
          code: 'const validation = validate(schema, document)',
        },
        {
          id: 'execute-query',
          label: 'Execute Query',
          description: 'Run GraphQL resolvers',
          duration: 100,
          color: 'bg-pink-500',
          icon: '⚙️',
          phase: 'processing',
          async: true,
          code: 'const result = await execute({ schema, document, contextValue })',
        },
        {
          id: 'format-response',
          label: 'Format Response',
          description: 'Structure GraphQL response',
          duration: 15,
          color: 'bg-teal-500',
          icon: '📤',
          phase: 'response',
          code: 'return Response.json({ data: result.data, errors: result.errors })',
        }
      );
    } else if (type === 'streaming') {
      baseSteps.push(
        {
          id: 'init-stream',
          label: 'Initialize Stream',
          description: 'Set up streaming response',
          duration: 10,
          color: 'bg-cyan-500',
          icon: '🌊',
          phase: 'setup',
          code: 'const stream = new ReadableStream()',
        },
        {
          id: 'process-data',
          label: 'Process Data Stream',
          description: 'Handle streaming data processing',
          duration: 200,
          color: 'bg-blue-600',
          icon: '📊',
          phase: 'processing',
          async: true,
          code: 'for await (const chunk of dataStream) { yield processChunk(chunk) }',
        },
        {
          id: 'stream-response',
          label: 'Stream Response',
          description: 'Send data chunks as they become available',
          duration: 50,
          color: 'bg-emerald-600',
          icon: '📡',
          phase: 'response',
          code: 'return new Response(stream, { headers: { "Content-Type": "text/plain" } })',
        }
      );
    }

    // Add final response step
    baseSteps.push({
      id: 'complete',
      label: 'Request Complete',
      description: 'Response sent to client',
      duration: 5,
      color: 'bg-gray-500',
      icon: '✅',
      phase: 'response',
      code: '// Request handled successfully',
    });

    return baseSteps;
  };

  const steps = getHandlerSteps(handlerType, method);
  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

  // Auto-play animation
  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const step = steps[currentStep];
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);

        // Simulate streaming for streaming type
        if (handlerType === 'streaming' && currentStep === 1) {
          setIsStreaming(true);
        }

        // Generate mock response data
        if (currentStep === steps.length - 2) {
          if (handlerType === 'rest') {
            setResponseData({ success: true, data: { id: 1, name: 'John Doe' } });
          } else if (handlerType === 'graphql') {
            setResponseData({ data: { user: { id: 1, name: 'John Doe' } } });
          } else {
            setResponseData('Streaming data chunks...');
          }
        }
      }, step.duration);

      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length) {
      setIsPlaying(false);
      setIsStreaming(false);
    }
  }, [currentStep, isPlaying, steps, handlerType]);

  const resetAnimation = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setResponseData(null);
    setIsStreaming(false);
  };

  const togglePlay = () => {
    if (currentStep >= steps.length) {
      resetAnimation();
    }
    setIsPlaying(!isPlaying);
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'setup':
        return 'border-blue-200 bg-blue-50';
      case 'processing':
        return 'border-orange-200 bg-orange-50';
      case 'response':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getMethodColor = (httpMethod: string) => {
    switch (httpMethod) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <span>Setup</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Processing</span>
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
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(method)}`}>
              {method}
            </div>
            <code className="text-gray-900 font-mono">/api/{handlerType}</code>
            <span className="text-gray-600">•</span>
            <span className="text-sm text-gray-600 capitalize">{handlerType} Handler</span>
          </div>
          <div className="text-sm text-gray-600">
            Duration: {totalDuration}ms • Steps: {steps.length}
          </div>
        </div>

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="animate-pulse">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-sm text-blue-600 font-medium">Streaming active...</span>
          </div>
        )}
      </div>

      {/* Handler Flow Visualization */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Phase headers */}
        <div className="grid grid-cols-3 border-b border-gray-200">
          <div className="p-3 bg-blue-50 border-r border-gray-200 text-center">
            <div className="font-semibold text-blue-900">Setup</div>
            <div className="text-xs text-blue-700">Request parsing</div>
          </div>
          <div className="p-3 bg-orange-50 border-r border-gray-200 text-center">
            <div className="font-semibold text-orange-900">Processing</div>
            <div className="text-xs text-orange-700">Business logic</div>
          </div>
          <div className="p-3 bg-green-50 text-center">
            <div className="font-semibold text-green-900">Response</div>
            <div className="text-xs text-green-700">Send result</div>
          </div>
        </div>

        {/* Handler steps */}
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
                        ? `border-gray-200 ${getPhaseColor(step.phase)}`
                        : 'border-gray-200'
                }`}
              >
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500'
                        : isActive
                          ? step.color + ' ring-4 ring-blue-200 scale-110'
                          : isActive
                            ? step.color
                            : 'bg-gray-300'
                    }`}
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
                      {step.async && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          async
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          step.phase === 'setup'
                            ? 'bg-blue-100 text-blue-800'
                            : step.phase === 'processing'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {step.phase}
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

                  {showCode && step.code && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-x-auto">
                      {step.code}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Response preview */}
        {responseData && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-2">Response Preview</h4>
            <div className="bg-white p-3 rounded border text-sm font-mono text-gray-800 max-h-32 overflow-y-auto">
              {typeof responseData === 'string'
                ? responseData
                : JSON.stringify(responseData, null, 2)}
            </div>
          </div>
        )}

        {/* Performance summary */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Total Duration</div>
              <div className="font-semibold text-gray-900">{totalDuration}ms</div>
            </div>
            <div>
              <div className="text-gray-600">Setup Steps</div>
              <div className="font-semibold text-blue-600">
                {steps.filter((s) => s.phase === 'setup').length}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Processing Steps</div>
              <div className="font-semibold text-orange-600">
                {steps.filter((s) => s.phase === 'processing').length}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Response Steps</div>
              <div className="font-semibold text-green-600">
                {steps.filter((s) => s.phase === 'response').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Handler Types Comparison */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Handler Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div
            className={`p-3 rounded-lg ${handlerType === 'rest' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">REST API</div>
            <div className="text-gray-600 mt-1">Traditional HTTP methods with JSON responses</div>
            <div className="text-xs text-gray-500 mt-2">
              • CRUD operations
              <br />
              • Structured responses
              <br />• HTTP status codes
            </div>
          </div>
          <div
            className={`p-3 rounded-lg ${handlerType === 'graphql' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">GraphQL API</div>
            <div className="text-gray-600 mt-1">Query language with flexible data fetching</div>
            <div className="text-xs text-gray-500 mt-2">
              • Single endpoint
              <br />
              • Client-defined queries
              <br />• Type-safe schemas
            </div>
          </div>
          <div
            className={`p-3 rounded-lg ${handlerType === 'streaming' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">Streaming API</div>
            <div className="text-gray-600 mt-1">Real-time data streaming with low latency</div>
            <div className="text-xs text-gray-500 mt-2">
              • Real-time updates
              <br />
              • Server-sent events
              <br />• WebSocket support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandlerFlow;
