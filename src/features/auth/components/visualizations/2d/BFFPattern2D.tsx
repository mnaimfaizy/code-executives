import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Shield } from 'lucide-react';

const BFFPattern2D: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [view, setView] = useState<'secure' | 'insecure'>('secure');

  const secureSteps = [
    {
      label: 'User visits SPA',
      from: 0,
      to: 1,
      description: 'Browser loads the single-page application',
    },
    {
      label: 'SPA calls BFF login',
      from: 1,
      to: 2,
      description: 'SPA initiates login via BFF endpoint (no tokens in browser)',
    },
    {
      label: 'BFF redirects to IdP',
      from: 2,
      to: 3,
      description: 'BFF redirects user to Identity Provider for authentication',
    },
    {
      label: 'User authenticates',
      from: 0,
      to: 3,
      description: 'User enters credentials at the IdP login page',
    },
    {
      label: 'IdP returns auth code',
      from: 3,
      to: 2,
      description: 'IdP redirects back with authorization code to BFF',
    },
    {
      label: 'BFF exchanges code for tokens',
      from: 2,
      to: 3,
      description: 'BFF sends code + client_secret to IdP token endpoint (server-to-server)',
    },
    {
      label: 'BFF stores tokens, sets HttpOnly cookie',
      from: 2,
      to: 1,
      description: 'Tokens stored server-side; browser only gets secure HttpOnly cookie',
    },
    {
      label: 'SPA calls API via BFF',
      from: 1,
      to: 2,
      description: 'SPA makes API requests to BFF with cookie (no token in JS)',
    },
    {
      label: 'BFF attaches Bearer token, proxies request',
      from: 2,
      to: 4,
      description: 'BFF attaches access_token and forwards request to API',
    },
  ];

  const insecureSteps = [
    {
      label: 'SPA receives tokens directly',
      from: 3,
      to: 1,
      description: 'Tokens stored in localStorage — vulnerable to XSS!',
    },
    {
      label: 'SPA calls API with token',
      from: 1,
      to: 4,
      description: 'Token exposed in JavaScript — can be stolen by malicious scripts',
    },
  ];

  const steps = view === 'secure' ? secureSteps : insecureSteps;
  const totalSteps = steps.length;

  const actors = [
    { label: 'User', x: 80, color: '#f59e0b', emoji: '🧑‍💻' },
    { label: 'SPA', x: 230, color: '#3b82f6', emoji: '📱' },
    { label: 'BFF Server', x: 400, color: '#10b981', emoji: '🛡️' },
    { label: 'Identity Provider', x: 570, color: '#8b5cf6', emoji: '🔐' },
    { label: 'API', x: 720, color: '#ef4444', emoji: '🗄️' },
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
          <Shield className="w-5 h-5 text-green-600" />
          BFF Pattern
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
            <button
              onClick={() => {
                setView('secure');
                reset();
              }}
              className={`px-3 py-1.5 ${view === 'secure' ? 'bg-green-100 text-green-800 font-bold' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Secure (BFF)
            </button>
            <button
              onClick={() => {
                setView('insecure');
                reset();
              }}
              className={`px-3 py-1.5 ${view === 'insecure' ? 'bg-red-100 text-red-800 font-bold' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Insecure (SPA-only)
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
            className={`p-1.5 rounded-lg border ${isPlaying ? 'bg-green-100 border-green-300 text-green-700' : 'border-gray-200 hover:bg-gray-50'}`}
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

      {/* Progress */}
      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= currentStep ? (view === 'secure' ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {/* SVG */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <svg viewBox="0 0 800 380" className="w-full" aria-label="BFF pattern diagram">
          <defs>
            <marker id="bff-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="#6b7280" />
            </marker>
          </defs>

          {/* Actors */}
          {actors.map((actor, i) => {
            // In insecure view, grey out BFF
            const dimmed = view === 'insecure' && i === 2;
            return (
              <g key={i} opacity={dimmed ? 0.25 : 1}>
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
                {/* Lifeline */}
                <line
                  x1={actor.x}
                  y1={60}
                  x2={actor.x}
                  y2={360}
                  stroke={actor.color}
                  strokeWidth={1}
                  strokeDasharray="4,4"
                  opacity={0.2}
                />
              </g>
            );
          })}

          {/* Insecure warning */}
          {view === 'insecure' && (
            <g>
              <rect
                x={240}
                y={140}
                width={300}
                height={60}
                rx={10}
                fill="#fef2f2"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="6,4"
              />
              <text
                x={390}
                y={165}
                textAnchor="middle"
                fontSize={12}
                fontWeight="bold"
                fill="#991b1b"
              >
                ⚠️ Tokens Exposed in Browser
              </text>
              <text x={390} y={182} textAnchor="middle" fontSize={9} fill="#b91c1c">
                Vulnerable to XSS, token theft, CSRF
              </text>
            </g>
          )}

          {/* Flow arrows */}
          {steps.map((step, i) => {
            const yPos = 90 + i * 30;
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
                  stroke={view === 'insecure' ? '#ef4444' : actors[step.from].color}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  markerEnd="url(#bff-arrow)"
                />
                {isActive && (
                  <circle r={4} fill={view === 'insecure' ? '#ef4444' : actors[step.from].color}>
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

      {/* Step detail */}
      <div
        className={`rounded-xl border p-4 ${view === 'secure' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
      >
        <h4
          className={`font-bold text-sm ${view === 'secure' ? 'text-green-900' : 'text-red-900'}`}
        >
          Step {currentStep + 1}: {steps[currentStep].label}
        </h4>
        <p className={`text-xs mt-1 ${view === 'secure' ? 'text-green-800' : 'text-red-800'}`}>
          {steps[currentStep].description}
        </p>
      </div>

      {/* Key insight */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h5 className="font-bold text-green-800 mb-1">BFF Secure Pattern</h5>
          <ul className="space-y-1 text-green-700">
            <li>• Tokens never reach the browser</li>
            <li>• HttpOnly cookies prevent XSS theft</li>
            <li>• Server handles token refresh</li>
          </ul>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h5 className="font-bold text-red-800 mb-1">SPA-Only (Insecure)</h5>
          <ul className="space-y-1 text-red-700">
            <li>• Tokens in localStorage / JS memory</li>
            <li>• XSS can steal access tokens</li>
            <li>• No server-side token management</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BFFPattern2D;
