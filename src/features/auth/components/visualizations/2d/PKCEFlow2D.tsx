import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Shield,
  Lock,
  Key,
  Hash,
} from 'lucide-react';

interface FlowStep {
  id: number;
  label: string;
  description: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
}

const PKCEFlow2D: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCrypto, setShowCrypto] = useState(false);

  const actors = [
    { label: 'User / Browser', x: 100, y: 30, color: '#f59e0b', icon: '🧑‍💻' },
    { label: 'Client (SPA)', x: 300, y: 30, color: '#3b82f6', icon: '📱' },
    { label: 'Auth Server', x: 500, y: 30, color: '#8b5cf6', icon: '🔐' },
    { label: 'Resource API', x: 700, y: 30, color: '#10b981', icon: '🗄️' },
  ];

  const steps: FlowStep[] = [
    {
      id: 0,
      label: 'Generate Code Verifier & Challenge',
      description:
        'SPA generates random code_verifier, then SHA-256 hashes it to create code_challenge',
      from: { x: 300, y: 80 },
      to: { x: 300, y: 80 },
      color: '#3b82f6',
    },
    {
      id: 1,
      label: 'Authorization Request + code_challenge',
      description: 'Redirect user to auth server with code_challenge and method=S256',
      from: { x: 300, y: 80 },
      to: { x: 500, y: 80 },
      color: '#f59e0b',
    },
    {
      id: 2,
      label: 'User Authenticates',
      description: 'User enters credentials and consents to requested scopes',
      from: { x: 100, y: 80 },
      to: { x: 500, y: 80 },
      color: '#8b5cf6',
    },
    {
      id: 3,
      label: 'Authorization Code',
      description: 'Auth server redirects back with a one-time authorization_code',
      from: { x: 500, y: 80 },
      to: { x: 300, y: 80 },
      color: '#8b5cf6',
    },
    {
      id: 4,
      label: 'Token Request + code_verifier',
      description: 'SPA sends code + original code_verifier to token endpoint',
      from: { x: 300, y: 80 },
      to: { x: 500, y: 80 },
      color: '#3b82f6',
    },
    {
      id: 5,
      label: 'Verify: SHA-256(verifier) == challenge',
      description: 'Auth server hashes verifier and compares with stored challenge',
      from: { x: 500, y: 80 },
      to: { x: 500, y: 80 },
      color: '#8b5cf6',
    },
    {
      id: 6,
      label: 'Access Token + ID Token',
      description: 'If verified, returns access_token, id_token, and refresh_token',
      from: { x: 500, y: 80 },
      to: { x: 300, y: 80 },
      color: '#10b981',
    },
    {
      id: 7,
      label: 'API Request with Bearer Token',
      description: 'SPA calls protected resource with Authorization: Bearer <token>',
      from: { x: 300, y: 80 },
      to: { x: 700, y: 80 },
      color: '#3b82f6',
    },
  ];

  const totalSteps = steps.length;

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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          PKCE Authorization Code Flow
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
            aria-label="Previous step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded-lg border ${isPlaying ? 'bg-amber-100 border-amber-300 text-amber-700' : 'border-gray-200 hover:bg-gray-50'}`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setCurrentStep((p) => Math.min(totalSteps - 1, p + 1))}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
            aria-label="Next step"
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

      {/* Progress bar */}
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= currentStep ? 'bg-amber-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {/* SVG Diagram */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <svg viewBox="0 0 800 420" className="w-full" aria-label="PKCE flow sequence diagram">
          <defs>
            <marker
              id="pkce-arrow"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L8,3 L0,6 Z" fill="#6b7280" />
            </marker>
            {['amber', 'blue', 'purple', 'green'].map((c) => (
              <marker
                key={c}
                id={`pkce-arrow-${c}`}
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <path
                  d="M0,0 L8,3 L0,6 Z"
                  fill={
                    c === 'amber'
                      ? '#f59e0b'
                      : c === 'blue'
                        ? '#3b82f6'
                        : c === 'purple'
                          ? '#8b5cf6'
                          : '#10b981'
                  }
                />
              </marker>
            ))}
          </defs>

          {/* Actor columns */}
          {actors.map((actor, i) => (
            <g key={i}>
              <rect
                x={actor.x - 55}
                y={8}
                width={110}
                height={50}
                rx={10}
                fill={`${actor.color}15`}
                stroke={actor.color}
                strokeWidth={2}
              />
              <text x={actor.x} y={28} textAnchor="middle" fontSize={16}>
                {actor.icon}
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
                y2={400}
                stroke={actor.color}
                strokeWidth={1}
                strokeDasharray="4,4"
                opacity={0.3}
              />
            </g>
          ))}

          {/* Flow arrows */}
          {steps.map((step, i) => {
            const yPos = 90 + i * 40;
            const isActive = i === currentStep;
            const isPast = i < currentStep;
            const opacity = isActive ? 1 : isPast ? 0.5 : 0.15;

            if (step.from.x === step.to.x) {
              // Self-action
              return (
                <g key={i} opacity={opacity} className="transition-opacity duration-500">
                  <rect
                    x={step.from.x - 40}
                    y={yPos - 8}
                    width={80}
                    height={20}
                    rx={4}
                    fill={isActive ? `${step.color}20` : 'transparent'}
                    stroke={step.color}
                    strokeWidth={isActive ? 2 : 1}
                    strokeDasharray={isActive ? '' : '3,3'}
                  />
                  <text
                    x={step.from.x}
                    y={yPos + 6}
                    textAnchor="middle"
                    fontSize={7}
                    fontWeight="bold"
                    fill={step.color}
                  >
                    {i === 0 ? 'Generate' : 'Verify'}
                  </text>
                  {/* Label */}
                  <text
                    x={step.from.x + 50}
                    y={yPos + 5}
                    fontSize={8}
                    fill={isActive ? '#111827' : '#9ca3af'}
                    fontWeight={isActive ? 'bold' : 'normal'}
                  >
                    {step.label.slice(0, 40)}
                  </text>
                </g>
              );
            }

            const dir = step.to.x > step.from.x ? 1 : -1;
            const arrowColor =
              step.color === '#f59e0b'
                ? 'amber'
                : step.color === '#3b82f6'
                  ? 'blue'
                  : step.color === '#8b5cf6'
                    ? 'purple'
                    : 'green';

            return (
              <g key={i} opacity={opacity} className="transition-opacity duration-500">
                <line
                  x1={step.from.x + dir * 20}
                  y1={yPos}
                  x2={step.to.x - dir * 20}
                  y2={yPos}
                  stroke={step.color}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  markerEnd={`url(#pkce-arrow-${arrowColor})`}
                />
                {/* Animated dot */}
                {isActive && (
                  <circle r={4} fill={step.color}>
                    <animateMotion
                      dur="1.5s"
                      repeatCount="indefinite"
                      path={`M${step.from.x + dir * 20},${yPos} L${step.to.x - dir * 20},${yPos}`}
                    />
                  </circle>
                )}
                {/* Label above arrow */}
                <text
                  x={(step.from.x + step.to.x) / 2}
                  y={yPos - 6}
                  textAnchor="middle"
                  fontSize={8}
                  fontWeight={isActive ? 'bold' : 'normal'}
                  fill={isActive ? '#111827' : '#9ca3af'}
                >
                  {step.label.slice(0, 45)}
                </text>
              </g>
            );
          })}

          {/* Step indicator */}
          <text x={10} y={395} fontSize={10} fill="#6b7280">
            Step {currentStep + 1} of {totalSteps}
          </text>
        </svg>
      </div>

      {/* Current step detail */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Key className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 text-sm">
              Step {currentStep + 1}: {steps[currentStep].label}
            </h4>
            <p className="text-amber-800 text-xs mt-1">{steps[currentStep].description}</p>
          </div>
        </div>
      </div>

      {/* PKCE Crypto demo toggle */}
      <button
        onClick={() => setShowCrypto(!showCrypto)}
        className="text-sm text-amber-700 font-medium flex items-center gap-1 hover:text-amber-800"
      >
        <Hash className="w-4 h-4" />
        {showCrypto ? 'Hide' : 'Show'} PKCE Crypto Demo
      </button>
      {showCrypto && (
        <div className="bg-gray-900 rounded-xl p-4 text-sm font-mono space-y-2 text-green-400">
          <p className="text-gray-400">{'// 1. Generate random code_verifier'}</p>
          <p>
            code_verifier ={' '}
            <span className="text-amber-400">"dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"</span>
          </p>
          <p className="text-gray-400 mt-2">{'// 2. SHA-256 hash → Base64-URL encode'}</p>
          <p>
            code_challenge = <span className="text-cyan-400">BASE64URL</span>(
            <span className="text-purple-400">SHA256</span>(code_verifier))
          </p>
          <p className="ml-16">
            = <span className="text-amber-400">"E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"</span>
          </p>
          <p className="text-gray-400 mt-2">
            {'// 3. Server verifies: SHA256(received_verifier) === stored_challenge'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Lock className="w-3 h-3 text-green-400" />
            <span className="text-green-400">Match confirmed → tokens issued</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PKCEFlow2D;
