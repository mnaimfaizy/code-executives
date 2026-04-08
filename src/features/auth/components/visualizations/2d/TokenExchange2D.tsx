import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, RefreshCw, Zap } from 'lucide-react';

const TokenExchange2D: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [flow, setFlow] = useState<'exchange' | 'client-cred'>('exchange');

  const exchangeSteps = [
    {
      label: 'User authenticates with app',
      from: 0,
      to: 1,
      description: 'User logs in and the application receives an access token',
    },
    {
      label: 'App delegates task to AI Agent',
      from: 1,
      to: 2,
      description: 'Application instructs AI agent to perform a task on behalf of the user',
    },
    {
      label: 'Agent requests token exchange (RFC 8693)',
      from: 2,
      to: 3,
      description:
        'Agent sends subject_token + grant_type=urn:ietf:params:oauth:grant-type:token-exchange',
    },
    {
      label: 'STS validates and issues scoped token',
      from: 3,
      to: 2,
      description:
        'Security Token Service validates original token, issues narrower-scoped agent token',
    },
    {
      label: 'Agent calls API with delegated token',
      from: 2,
      to: 4,
      description:
        'Agent uses scoped token — can only access what the user authorized, nothing more',
    },
    {
      label: 'API validates token & serves response',
      from: 4,
      to: 2,
      description: 'API validates token audience, scope, and act claim for audit trail',
    },
  ];

  const clientCredSteps = [
    {
      label: 'AI Agent authenticates as itself',
      from: 2,
      to: 3,
      description: 'Agent uses client_credentials grant with its own client_id/client_secret',
    },
    {
      label: 'STS issues app-level token',
      from: 3,
      to: 2,
      description: 'Token has full application permissions — no user context, no delegation',
    },
    {
      label: 'Agent calls API with broad permissions',
      from: 2,
      to: 4,
      description:
        '⚠️ Agent has its own permissions, not limited to what a specific user authorized',
    },
  ];

  const steps = flow === 'exchange' ? exchangeSteps : clientCredSteps;
  const totalSteps = steps.length;

  const actors = [
    { label: 'User', x: 80, color: '#f59e0b', emoji: '🧑‍💻' },
    { label: 'Application', x: 230, color: '#3b82f6', emoji: '📱' },
    { label: 'AI Agent', x: 400, color: '#8b5cf6', emoji: '🤖' },
    { label: 'Token Service', x: 570, color: '#10b981', emoji: '🔐' },
    { label: 'Resource API', x: 720, color: '#ef4444', emoji: '🗄️' },
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          AI Agent Token Exchange
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
            <button
              onClick={() => {
                setFlow('exchange');
                reset();
              }}
              className={`px-3 py-1.5 flex items-center gap-1 ${flow === 'exchange' ? 'bg-purple-100 text-purple-800 font-bold' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <RefreshCw className="w-3 h-3" /> Token Exchange
            </button>
            <button
              onClick={() => {
                setFlow('client-cred');
                reset();
              }}
              className={`px-3 py-1.5 ${flow === 'client-cred' ? 'bg-orange-100 text-orange-800 font-bold' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Client Credentials
            </button>
          </div>
          <button
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded-lg border ${isPlaying ? 'bg-purple-100 border-purple-300 text-purple-700' : 'border-gray-200 hover:bg-gray-50'}`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setCurrentStep((p) => Math.min(totalSteps - 1, p + 1))}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={reset}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
            aria-label="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= currentStep ? (flow === 'exchange' ? 'bg-purple-500' : 'bg-orange-500') : 'bg-gray-200'}`}
          />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <svg viewBox="0 0 800 320" className="w-full" aria-label="Token exchange diagram">
          <defs>
            <marker id="te-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="#6b7280" />
            </marker>
          </defs>

          {actors.map((actor, i) => {
            const dimmed = flow === 'client-cred' && (i === 0 || i === 1);
            return (
              <g key={i} opacity={dimmed ? 0.2 : 1}>
                <rect
                  x={actor.x - 50}
                  y={8}
                  width={100}
                  height={50}
                  rx={10}
                  fill={`${actor.color}10`}
                  stroke={actor.color}
                  strokeWidth={2}
                />
                <text x={actor.x} y={28} textAnchor="middle" fontSize={16}>
                  {actor.emoji}
                </text>
                <text
                  x={actor.x}
                  y={48}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight="bold"
                  fill={actor.color}
                >
                  {actor.label}
                </text>
                <line
                  x1={actor.x}
                  y1={60}
                  x2={actor.x}
                  y2={300}
                  stroke={actor.color}
                  strokeWidth={1}
                  strokeDasharray="4,4"
                  opacity={0.2}
                />
              </g>
            );
          })}

          {steps.map((step, i) => {
            const yPos = 90 + i * 35;
            const isActive = i === currentStep;
            const isPast = i < currentStep;
            const opacity = isActive ? 1 : isPast ? 0.45 : 0.12;
            const fromX = actors[step.from].x;
            const toX = actors[step.to].x;
            const dir = toX > fromX ? 1 : -1;

            return (
              <g key={i} opacity={opacity} className="transition-opacity duration-500">
                <line
                  x1={fromX + dir * 15}
                  y1={yPos}
                  x2={toX - dir * 15}
                  y2={yPos}
                  stroke={actors[step.from].color}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  markerEnd="url(#te-arrow)"
                />
                {isActive && (
                  <circle r={4} fill={actors[step.from].color}>
                    <animateMotion
                      dur="1.5s"
                      repeatCount="indefinite"
                      path={`M${fromX + dir * 15},${yPos} L${toX - dir * 15},${yPos}`}
                    />
                  </circle>
                )}
                <text
                  x={(fromX + toX) / 2}
                  y={yPos - 5}
                  textAnchor="middle"
                  fontSize={7.5}
                  fontWeight={isActive ? 'bold' : 'normal'}
                  fill={isActive ? '#111827' : '#9ca3af'}
                >
                  {step.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div
        className={`rounded-xl border p-4 ${flow === 'exchange' ? 'bg-purple-50 border-purple-200' : 'bg-orange-50 border-orange-200'}`}
      >
        <h4
          className={`font-bold text-sm ${flow === 'exchange' ? 'text-purple-900' : 'text-orange-900'}`}
        >
          Step {currentStep + 1}: {steps[currentStep].label}
        </h4>
        <p
          className={`text-xs mt-1 ${flow === 'exchange' ? 'text-purple-800' : 'text-orange-800'}`}
        >
          {steps[currentStep].description}
        </p>
      </div>

      {/* Least privilege comparison */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <h5 className="font-bold text-purple-800 mb-1">Token Exchange (Recommended)</h5>
          <ul className="space-y-1 text-purple-700">
            <li>• User-delegated scope only</li>
            <li>• Audit trail via "act" claim</li>
            <li>• Least privilege enforced</li>
          </ul>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <h5 className="font-bold text-orange-800 mb-1">Client Credentials</h5>
          <ul className="space-y-1 text-orange-700">
            <li>• Full app-level permissions</li>
            <li>• No user identity context</li>
            <li>• Over-privileged risk</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TokenExchange2D;
