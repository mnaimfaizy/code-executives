import React, { useState, useEffect } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../types/nextjs';

interface MutationFlowProps extends BaseNextJSVisualizationProps {
  actionType: 'form' | 'client' | 'optimistic';
  showCode?: boolean;
}

interface FlowStep {
  id: string;
  label: string;
  description: string;
  duration: number;
  color: string;
  icon: string;
  code?: string;
  side: 'client' | 'server' | 'network';
}

const MutationFlow: React.FC<MutationFlowProps> = ({
  actionType = 'form',
  showCode = false,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pendingState, setPendingState] = useState(false);

  // Define flow steps based on action type
  const getFlowSteps = (type: string): FlowStep[] => {
    const baseSteps: FlowStep[] = [
      {
        id: 'trigger',
        label: 'Action Triggered',
        description: 'User interaction starts the mutation',
        duration: 50,
        color: 'bg-blue-500',
        icon: '👆',
        side: 'client',
        code:
          type === 'form'
            ? '<form action={createPost}>'
            : type === 'client'
              ? 'onClick={() => mutate()}'
              : 'startTransition(() => mutate())',
      },
      {
        id: 'serialize',
        label: 'Serialize Data',
        description: 'Prepare data for server transmission',
        duration: 30,
        color: 'bg-yellow-500',
        icon: '📦',
        side: 'client',
        code: 'FormData → JSON serialization',
      },
      {
        id: 'network',
        label: 'Network Request',
        description: 'Send data to server endpoint',
        duration: 100,
        color: 'bg-purple-500',
        icon: '📡',
        side: 'network',
        code: 'POST /action/createPost',
      },
      {
        id: 'server-validation',
        label: 'Server Validation',
        description: 'Validate data on the server',
        duration: 80,
        color: 'bg-orange-500',
        icon: '✅',
        side: 'server',
        code: 'if (!title) throw Error("Required")',
      },
      {
        id: 'database',
        label: 'Database Operation',
        description: 'Execute database mutation',
        duration: 120,
        color: 'bg-red-500',
        icon: '💾',
        side: 'server',
        code: 'await db.post.create({ data })',
      },
      {
        id: 'revalidate',
        label: 'Cache Revalidation',
        description: 'Update cached pages and data',
        duration: 60,
        color: 'bg-green-500',
        icon: '🔄',
        side: 'server',
        code: 'revalidatePath("/posts")',
      },
      {
        id: 'response',
        label: 'Send Response',
        description: 'Return result to client',
        duration: 40,
        color: 'bg-teal-500',
        icon: '📤',
        side: 'network',
        code: '{ success: true, post }',
      },
      {
        id: 'client-update',
        label: 'Client Update',
        description: 'Update UI with server response',
        duration: 50,
        color: 'bg-emerald-500',
        icon: '✨',
        side: 'client',
        code: 'router.refresh() or state update',
      },
    ];

    // Add optimistic updates for optimistic type
    if (type === 'optimistic') {
      baseSteps.splice(1, 0, {
        id: 'optimistic',
        label: 'Optimistic Update',
        description: 'Update UI immediately (before server response)',
        duration: 20,
        color: 'bg-cyan-500',
        icon: '⚡',
        side: 'client',
        code: 'setPosts([...posts, newPost])',
      });
    }

    return baseSteps;
  };

  const steps = getFlowSteps(actionType);
  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

  // Auto-play animation
  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const step = steps[currentStep];
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setPendingState(currentStep >= 0 && currentStep < steps.length - 2);
      }, step.duration);

      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length) {
      setIsPlaying(false);
      setPendingState(false);
    }
  }, [currentStep, isPlaying, steps]);

  const resetAnimation = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setPendingState(false);
  };

  const togglePlay = () => {
    if (currentStep >= steps.length) {
      resetAnimation();
    }
    setIsPlaying(!isPlaying);
  };

  const getSideColor = (side: string) => {
    switch (side) {
      case 'client':
        return 'border-blue-200 bg-blue-50';
      case 'server':
        return 'border-orange-200 bg-orange-50';
      case 'network':
        return 'border-purple-200 bg-purple-50';
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
            <span>Client</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Server</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Network</span>
          </div>
        </div>
      </div>

      {/* Pending State Indicator */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-4 h-4 rounded-full transition-colors ${
                pendingState ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span className="font-medium text-gray-900">
              Mutation Status: {pendingState ? 'Pending' : 'Idle'}
            </span>
          </div>
          <div className="text-sm text-gray-600">Action Type: {actionType.toUpperCase()}</div>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Client/Server/Network lanes */}
        <div className="grid grid-cols-3 border-b border-gray-200">
          <div className="p-3 bg-blue-50 border-r border-gray-200 text-center">
            <div className="font-semibold text-blue-900">Client</div>
            <div className="text-xs text-blue-700">Browser/React</div>
          </div>
          <div className="p-3 bg-orange-50 border-r border-gray-200 text-center">
            <div className="font-semibold text-orange-900">Server</div>
            <div className="text-xs text-orange-700">Next.js Runtime</div>
          </div>
          <div className="p-3 bg-purple-50 text-center">
            <div className="font-semibold text-purple-900">Network</div>
            <div className="text-xs text-purple-700">HTTP Requests</div>
          </div>
        </div>

        {/* Flow steps */}
        <div className="p-6 space-y-4">
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
                        ? `border-gray-300 ${getSideColor(step.side)}`
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
                    <h3
                      className={`font-semibold transition-colors ${
                        isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          step.side === 'client'
                            ? 'bg-blue-100 text-blue-800'
                            : step.side === 'server'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {step.side}
                      </span>
                      <span className="text-sm text-gray-500">{step.duration}ms</span>
                    </div>
                  </div>

                  <p
                    className={`text-sm transition-colors ${
                      isActive ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>

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

        {/* Performance summary */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Total Time</div>
              <div className="font-semibold text-gray-900">{totalDuration}ms</div>
            </div>
            <div>
              <div className="text-gray-600">Client Steps</div>
              <div className="font-semibold text-blue-600">
                {steps.filter((s) => s.side === 'client').length}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Server Steps</div>
              <div className="font-semibold text-orange-600">
                {steps.filter((s) => s.side === 'server').length}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Network Steps</div>
              <div className="font-semibold text-purple-600">
                {steps.filter((s) => s.side === 'network').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Types Comparison */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Server Action Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div
            className={`p-3 rounded-lg ${actionType === 'form' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">Form Actions</div>
            <div className="text-gray-600 mt-1">Progressive enhancement with HTML forms</div>
            <div className="text-xs text-gray-500 mt-2">
              • Works without JavaScript
              <br />
              • Automatic form handling
              <br />• Built-in validation
            </div>
          </div>
          <div
            className={`p-3 rounded-lg ${actionType === 'client' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">Client Actions</div>
            <div className="text-gray-600 mt-1">Called from Client Components</div>
            <div className="text-xs text-gray-500 mt-2">
              • Requires JavaScript
              <br />
              • useTransition for loading
              <br />• Error boundaries
            </div>
          </div>
          <div
            className={`p-3 rounded-lg ${actionType === 'optimistic' ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}
          >
            <div className="font-medium text-gray-900">Optimistic Updates</div>
            <div className="text-gray-600 mt-1">Update UI before server response</div>
            <div className="text-xs text-gray-500 mt-2">
              • Instant UI feedback
              <br />
              • Rollback on error
              <br />• Improved UX
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MutationFlow;
