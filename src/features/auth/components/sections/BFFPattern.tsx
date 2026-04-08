import React, { useState, useEffect, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Play, Pause, RotateCcw, ArrowRight, Shield, Lock } from 'lucide-react';

interface BFFStep {
  id: number;
  label: string;
  description: string;
  from: string;
  to: string;
  detail: string;
}

const BFFPattern: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps: BFFStep[] = [
    {
      id: 0,
      label: 'Login Request',
      description: 'SPA redirects user to BFF /login route',
      from: 'spa',
      to: 'bff',
      detail:
        'The user clicks "Log In" in the SPA. Instead of going directly to the IdP, the SPA routes to the BFF\'s /login endpoint. The SPA never handles tokens directly.',
    },
    {
      id: 1,
      label: 'OIDC Flow',
      description: 'BFF executes OIDC authorization as confidential client',
      from: 'bff',
      to: 'idp',
      detail:
        'The BFF acts as a confidential OAuth client (it can securely store a client_secret) and executes the standard OIDC Authorization Code flow with the Identity Provider.',
    },
    {
      id: 2,
      label: 'Tokens Received',
      description: 'BFF receives access_token and id_token from IdP',
      from: 'idp',
      to: 'bff',
      detail:
        'The IdP issues the access_token and id_token directly to the BFF server — these tokens never reach the browser. The BFF stores them in a secure, server-side encrypted cache.',
    },
    {
      id: 3,
      label: 'Session Cookie',
      description: 'BFF creates encrypted HttpOnly cookie for SPA',
      from: 'bff',
      to: 'spa',
      detail:
        'The BFF generates a secure session cookie (HttpOnly, Secure, SameSite=Strict) mapped to the cached tokens, and sends it to the SPA. The cookie cannot be read by JavaScript.',
    },
    {
      id: 4,
      label: 'API Request',
      description: 'SPA calls BFF with auto-attached session cookie',
      from: 'spa',
      to: 'bff',
      detail:
        'When the SPA needs data, it sends an API request to the BFF. The browser automatically attaches the HttpOnly session cookie — no token handling in JavaScript.',
    },
    {
      id: 5,
      label: 'Token Injection',
      description: 'BFF retrieves token from cache, injects into Authorization header',
      from: 'bff',
      to: 'bff',
      detail:
        'The BFF validates the session cookie, looks up the corresponding access_token from its server-side cache, and injects it into the HTTP Authorization: Bearer header.',
    },
    {
      id: 6,
      label: 'Proxied Request',
      description: 'BFF forwards request to microservice API',
      from: 'bff',
      to: 'api',
      detail:
        'The BFF securely proxies the request to the downstream microservice API with the Bearer token. The microservice validates the token and returns the requested data.',
    },
    {
      id: 7,
      label: 'Response',
      description: 'Data flows back: API → BFF → SPA',
      from: 'api',
      to: 'spa',
      detail:
        'The microservice returns data to the BFF, which forwards it to the SPA. The access token was never exposed to the browser—completely neutralizing XSS token theft.',
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

  const actors = [
    { id: 'spa', label: 'SPA (Browser)', x: 80, color: '#3b82f6' },
    { id: 'bff', label: 'BFF Server', x: 280, color: '#f59e0b' },
    { id: 'idp', label: 'Identity Provider', x: 480, color: '#8b5cf6' },
    { id: 'api', label: 'Microservice API', x: 680, color: '#10b981' },
  ];

  const getActorX = (id: string): number => actors.find((a) => a.id === id)?.x ?? 280;

  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/auth?section=' + encodeURIComponent(sectionName);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-amber-100 p-4 rounded-full">
          <Lock className="w-16 h-16 text-amber-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Backend for Frontend (BFF) Pattern</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        The architecture that keeps OAuth tokens out of the browser — neutralizing XSS token theft
        by design.
      </p>
    </div>
  );

  const mainContent = (
    <>
      <ThemeCard className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Interactive BFF Flow</h2>
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

        {/* SVG */}
        <div className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-xl border border-gray-200 p-2 mb-4">
          <svg
            viewBox="0 0 800 400"
            className="w-full h-auto"
            role="img"
            aria-label="Backend for Frontend pattern flow diagram"
          >
            {/* Actor lanes */}
            {actors.map((actor) => (
              <g key={actor.id}>
                <line
                  x1={actor.x}
                  y1={60}
                  x2={actor.x}
                  y2={380}
                  stroke={actor.color}
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  opacity="0.3"
                />
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
                  fontSize="12"
                  fontWeight="bold"
                  fill={actor.color}
                >
                  {actor.label}
                </text>
              </g>
            ))}

            {/* Steps */}
            {steps.map((step, i) => {
              const y = 80 + i * 38;
              const fromX = getActorX(step.from);
              const toX = getActorX(step.to);
              const isActive = i === currentStep;
              const isPast = i < currentStep;
              const isSelf = step.from === step.to;

              if (isSelf) {
                return (
                  <g key={i} opacity={isActive ? 1 : isPast ? 0.6 : 0.2}>
                    <path
                      d={`M ${fromX + 10} ${y} Q ${fromX + 55} ${y - 12} ${fromX + 10} ${y + 12}`}
                      fill="none"
                      stroke={isActive ? '#f59e0b' : '#9ca3af'}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      markerEnd="url(#bffArrowAmber)"
                    />
                    <text
                      x={fromX + 60}
                      y={y + 3}
                      fontSize="8"
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
                  <line
                    x1={fromX + (toX > fromX ? 10 : -10)}
                    y1={y}
                    x2={toX + (toX > fromX ? -10 : 10)}
                    y2={y}
                    stroke={isActive ? '#f59e0b' : '#9ca3af'}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    markerEnd={isActive ? 'url(#bffArrowAmber)' : 'url(#bffArrowGray)'}
                  />
                  <text
                    x={(fromX + toX) / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fontSize="8"
                    fill={isActive ? '#92400e' : '#6b7280'}
                    fontWeight={isActive ? 'bold' : 'normal'}
                  >
                    {step.label}
                  </text>
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

            <defs>
              <marker
                id="bffArrowAmber"
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
                id="bffArrowGray"
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

      {/* Why BFF? */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          <Shield className="w-6 h-6 inline mr-2 text-amber-600" />
          Why BFF Over Direct Token Handling?
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-xl p-5 border border-red-200">
            <h3 className="font-bold text-red-800 mb-2">❌ Without BFF (Insecure)</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                • Tokens stored in <code className="bg-red-100 px-1 rounded">localStorage</code>
              </li>
              <li>• JavaScript can read tokens → XSS can steal them</li>
              <li>• Attacker injects script → harvests token → impersonates user</li>
              <li>• No server-side session validation</li>
            </ul>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <h3 className="font-bold text-green-800 mb-2">✅ With BFF (Secure)</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Tokens stored server-side in encrypted cache</li>
              <li>
                • Browser only receives <code className="bg-green-100 px-1 rounded">HttpOnly</code>{' '}
                cookie
              </li>
              <li>• XSS cannot read or exfiltrate HttpOnly cookies</li>
              <li>
                • <code className="bg-green-100 px-1 rounded">SameSite=Strict</code> prevents CSRF
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => navigateToSection('AI Agent Authentication')}
          className="mt-6 inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          <span>Next: AI Agent Auth</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="auth" hero={heroContent} mainContent={mainContent} />;
};

export default BFFPattern;
