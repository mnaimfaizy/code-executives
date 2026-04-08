import React, { useState, useEffect, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Play, Pause, RotateCcw, ArrowRight, Shield } from 'lucide-react';

interface FlowStep {
  id: number;
  label: string;
  description: string;
  from: string;
  to: string;
  detail: string;
}

const PKCEFlow: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = `/auth?section=${encodeURIComponent(sectionName)}`;
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [codeVerifier] = useState('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');
  const [codeChallenge] = useState('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');

  const steps: FlowStep[] = [
    {
      id: 0,
      label: 'Generate PKCE Pair',
      description: 'Client generates code_verifier and code_challenge',
      from: 'client',
      to: 'client',
      detail:
        'The client creates a cryptographically random code_verifier string, then SHA-256 hashes it to produce the code_challenge. This ensures each login attempt has a unique, verifiable secret.',
    },
    {
      id: 1,
      label: 'Authorization Request',
      description: 'Redirect user to Identity Provider with code_challenge',
      from: 'client',
      to: 'idp',
      detail:
        "Client redirects the user's browser to the IdP /authorize endpoint with client_id, requested scopes (openid profile), state parameter, and the code_challenge.",
    },
    {
      id: 2,
      label: 'User Authentication',
      description: 'User authenticates at the Identity Provider',
      from: 'user',
      to: 'idp',
      detail:
        'The user authenticates directly with the IdP (via Passkey, SSO, or MFA) and consents to the requested scopes. The IdP verifies the user and stores the code_challenge.',
    },
    {
      id: 3,
      label: 'Authorization Code',
      description: 'IdP redirects back with short-lived authorization code',
      from: 'idp',
      to: 'client',
      detail:
        "The IdP redirects the user's browser back to the client's redirect_uri, appending a short-lived, single-use authorization_code and the original state parameter.",
    },
    {
      id: 4,
      label: 'Token Exchange',
      description: 'Client sends code + original code_verifier to IdP',
      from: 'client',
      to: 'idp',
      detail:
        'The client makes a secure backend POST to the IdP /token endpoint, sending the authorization_code AND the original plaintext code_verifier.',
    },
    {
      id: 5,
      label: 'PKCE Validation',
      description: 'IdP hashes verifier and compares to stored challenge',
      from: 'idp',
      to: 'idp',
      detail:
        'The IdP SHA-256 hashes the received code_verifier and compares it to the code_challenge stored in Step 1. If they match, the entity redeeming the code is the same entity that requested it.',
    },
    {
      id: 6,
      label: 'Tokens Issued',
      description: 'IdP returns access_token and id_token',
      from: 'idp',
      to: 'client',
      detail:
        'Upon successful PKCE validation, the IdP issues the access_token (for API authorization) and id_token (for identity verification) to the client. The flow is complete.',
    },
  ];

  const handleNext = useCallback((): void => {
    setCurrentStep((prev) => {
      if (prev >= steps.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [steps.length]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(handleNext, 2500);
    return () => clearInterval(interval);
  }, [isPlaying, handleNext]);

  const reset = (): void => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const active = steps[currentStep];

  // Actor positions for SVG
  const actors = [
    { id: 'user', label: 'User', x: 100, color: '#f59e0b' },
    { id: 'client', label: 'Client App', x: 350, color: '#3b82f6' },
    { id: 'idp', label: 'Identity Provider', x: 600, color: '#8b5cf6' },
  ];

  const getActorX = (id: string): number => actors.find((a) => a.id === id)?.x ?? 350;

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-amber-100 p-4 rounded-full">
          <Shield className="w-16 h-16 text-amber-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">PKCE Authorization Code Flow</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Step through the most secure OAuth 2.0 flow for SPAs and mobile apps — watch how PKCE
        mathematically prevents authorization code interception.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Interactive Flow Diagram */}
      <ThemeCard className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Interactive PKCE Flow</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-1 bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors text-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={reset}
              className="flex items-center space-x-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* SVG Visualization */}
        <div className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-xl border border-gray-200 p-2 mb-4">
          <svg
            viewBox="0 0 750 350"
            className="w-full h-auto"
            role="img"
            aria-label="PKCE Authorization Code Flow diagram"
          >
            {/* Actor Lanes */}
            {actors.map((actor) => (
              <g key={actor.id}>
                {/* Lane line */}
                <line
                  x1={actor.x}
                  y1={60}
                  x2={actor.x}
                  y2={330}
                  stroke={actor.color}
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  opacity="0.3"
                />
                {/* Actor box */}
                <rect
                  x={actor.x - 55}
                  y={10}
                  width={110}
                  height={40}
                  rx={10}
                  fill={actor.color}
                  opacity="0.15"
                  stroke={actor.color}
                  strokeWidth="1.5"
                />
                <text
                  x={actor.x}
                  y={35}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill={actor.color}
                >
                  {actor.label}
                </text>
              </g>
            ))}

            {/* Flow arrows */}
            {steps.map((step, i) => {
              const y = 80 + i * 37;
              const fromX = getActorX(step.from);
              const toX = getActorX(step.to);
              const isActive = i === currentStep;
              const isPast = i < currentStep;
              const isSelf = step.from === step.to;

              if (isSelf) {
                return (
                  <g key={i} opacity={isActive ? 1 : isPast ? 0.6 : 0.2}>
                    {/* Self-referencing arc */}
                    <path
                      d={`M ${fromX + 10} ${y} Q ${fromX + 60} ${y - 15} ${fromX + 10} ${y + 15}`}
                      fill="none"
                      stroke={isActive ? '#f59e0b' : '#9ca3af'}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      markerEnd="url(#arrowAmber)"
                    />
                    <text
                      x={fromX + 65}
                      y={y + 4}
                      fontSize="9"
                      fill={isActive ? '#92400e' : '#6b7280'}
                      fontWeight={isActive ? 'bold' : 'normal'}
                    >
                      {step.label}
                    </text>
                    {isActive && (
                      <circle cx={fromX + 10} cy={y} r={4} fill="#f59e0b">
                        <animate
                          attributeName="r"
                          values="3;6;3"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              }

              return (
                <g key={i} opacity={isActive ? 1 : isPast ? 0.6 : 0.2}>
                  {/* Arrow line */}
                  <line
                    x1={fromX + (toX > fromX ? 10 : -10)}
                    y1={y}
                    x2={toX + (toX > fromX ? -10 : 10)}
                    y2={y}
                    stroke={isActive ? '#f59e0b' : '#9ca3af'}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    markerEnd={isActive ? 'url(#arrowAmber)' : 'url(#arrowGray)'}
                  />
                  {/* Label */}
                  <text
                    x={(fromX + toX) / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fontSize="9"
                    fill={isActive ? '#92400e' : '#6b7280'}
                    fontWeight={isActive ? 'bold' : 'normal'}
                  >
                    {step.label}
                  </text>
                  {/* Animated dot on active */}
                  {isActive && (
                    <circle r={4} fill="#f59e0b">
                      <animateMotion
                        dur="1.5s"
                        repeatCount="indefinite"
                        path={`M ${fromX} ${y} L ${toX} ${y}`}
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Arrow markers */}
            <defs>
              <marker
                id="arrowAmber"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
              </marker>
              <marker
                id="arrowGray"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Step Progress */}
        <div className="flex items-center space-x-1 mb-4">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentStep(i);
                setIsPlaying(false);
              }}
              className={`flex-1 h-2 rounded-full transition-all ${
                i === currentStep
                  ? 'bg-amber-500'
                  : i < currentStep
                    ? 'bg-amber-300'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step Detail */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center space-x-3 mb-2">
            <span className="bg-amber-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
              {active.id + 1}
            </span>
            <h3 className="font-bold text-gray-900 text-lg">{active.label}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">{active.description}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{active.detail}</p>
        </div>
      </ThemeCard>

      {/* PKCE Crypto Demo */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">PKCE Cryptographic Proof</h2>
        <p className="text-gray-700 mb-4 text-sm">
          Each login attempt generates a fresh, random{' '}
          <code className="bg-gray-100 px-1 rounded">code_verifier</code>. The SHA-256 hash produces
          the <code className="bg-gray-100 px-1 rounded">code_challenge</code> sent to the IdP. Only
          the original verifier can produce the matching hash.
        </p>
        <div className="space-y-3">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
              code_verifier (secret, never sent to IdP during auth)
            </div>
            <code className="text-sm text-blue-900 break-all font-mono">{codeVerifier}</code>
          </div>
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm font-mono text-gray-600">
              SHA-256( code_verifier ) → code_challenge
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">
              code_challenge (sent to IdP in Step 1)
            </div>
            <code className="text-sm text-purple-900 break-all font-mono">{codeChallenge}</code>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
              Validation (Step 6)
            </div>
            <code className="text-sm text-green-900 font-mono">
              SHA-256(received_verifier) === stored_challenge ✓
            </code>
          </div>
        </div>

        <button
          onClick={() => navigateToSection('BFF Pattern')}
          className="mt-6 inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          <span>Next: BFF Pattern</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="auth" hero={heroContent} mainContent={mainContent} />;
};

export default PKCEFlow;
