import React, { useState, useEffect, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Play, Pause, RotateCcw, ArrowRight, Bot, Shield } from 'lucide-react';

interface TokenExchangeStep {
  id: number;
  label: string;
  description: string;
  from: string;
  to: string;
  detail: string;
}

const AIAgentAuth: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFlow, setActiveFlow] = useState<'exchange' | 'credentials'>('exchange');

  const exchangeSteps: TokenExchangeStep[] = [
    {
      id: 0,
      label: 'Human OIDC Login',
      description: 'User authenticates via standard OIDC flow',
      from: 'user',
      to: 'authserver',
      detail:
        'The human user completes standard OIDC login with the Authorization Server, receiving an id_token (proving their identity) and an access_token.',
    },
    {
      id: 1,
      label: 'Task Delegation',
      description: 'User delegates task to AI Agent with id_token',
      from: 'user',
      to: 'agent',
      detail:
        'The user delegates a specific task (e.g., "summarize my emails") to the AI Agent Platform, passing their id_token as proof of identity and authorization to act on their behalf.',
    },
    {
      id: 2,
      label: 'Token Exchange Request',
      description: 'Agent requests constrained token via RFC 8693',
      from: 'agent',
      to: 'authserver',
      detail:
        "The AI Agent sends a Token Exchange POST (RFC 8693) to the Authorization Server with its own client_credentials, the user's id_token as subject_token, and requesting restricted scope (e.g., api.read_only).",
    },
    {
      id: 3,
      label: 'Validation',
      description: 'Auth Server validates agent + user identity',
      from: 'authserver',
      to: 'authserver',
      detail:
        "The Authorization Server validates the Agent's credentials and cryptographically verifies the User's identity token — confirming both the agent's identity and the human's delegation.",
    },
    {
      id: 4,
      label: 'Constrained Token',
      description: 'Auth Server issues short-lived, scoped agent token',
      from: 'authserver',
      to: 'agent',
      detail:
        "The Authorization Server issues a new, short-lived access_token strictly scoped to the requested permissions (e.g., read-only). This token cannot exceed the human user's own permissions.",
    },
    {
      id: 5,
      label: 'API Call',
      description: 'Agent queries Target API on behalf of user',
      from: 'agent',
      to: 'targetapi',
      detail:
        "The AI Agent uses the constrained token to securely query the Target API on behalf of the User. The API can verify both the human identity and the agent's limited scope from the token claims.",
    },
  ];

  const credentialSteps: TokenExchangeStep[] = [
    {
      id: 0,
      label: 'Client Credentials',
      description: 'Agent authenticates with its own identity',
      from: 'agent',
      to: 'authserver',
      detail:
        'The AI agent operates as a backend service. It presents its own client_id and client_secret to the Authorization Server — no human user is involved.',
    },
    {
      id: 1,
      label: 'Machine Token',
      description: 'Auth Server issues machine-identity token',
      from: 'authserver',
      to: 'agent',
      detail:
        "The Authorization Server validates the agent's credentials and issues an access_token that identifies the agent itself (not a human user). Scopes are pre-defined by the agent's registration.",
    },
    {
      id: 2,
      label: 'Backend API Call',
      description: 'Agent calls API as itself',
      from: 'agent',
      to: 'targetapi',
      detail:
        'The agent uses the machine-identity token to access backend APIs. The API sees the request as coming from the agent service, not from any human user.',
    },
  ];

  const steps = activeFlow === 'exchange' ? exchangeSteps : credentialSteps;

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

  const switchFlow = (flow: 'exchange' | 'credentials'): void => {
    setActiveFlow(flow);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const exchangeActors = [
    { id: 'user', label: 'Human User', x: 80, color: '#3b82f6' },
    { id: 'agent', label: 'AI Agent', x: 280, color: '#f59e0b' },
    { id: 'authserver', label: 'Auth Server', x: 480, color: '#8b5cf6' },
    { id: 'targetapi', label: 'Target API', x: 680, color: '#10b981' },
  ];

  const credentialActors = [
    { id: 'agent', label: 'AI Agent', x: 180, color: '#f59e0b' },
    { id: 'authserver', label: 'Auth Server', x: 420, color: '#8b5cf6' },
    { id: 'targetapi', label: 'Target API', x: 660, color: '#10b981' },
  ];

  const actors = activeFlow === 'exchange' ? exchangeActors : credentialActors;
  const getActorX = (id: string): number => actors.find((a) => a.id === id)?.x ?? 350;

  const active = steps[currentStep];

  const navigateToSection = (sectionName: string): void => {
    window.location.href = '/auth?section=' + encodeURIComponent(sectionName);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-amber-100 p-4 rounded-full">
          <Bot className="w-16 h-16 text-amber-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Authentication for AI Agents</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        How autonomous AI agents obtain scoped, least-privilege tokens — via Client Credentials for
        backend bots, or Token Exchange (RFC 8693) when acting on behalf of a human user.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Flow Selector */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose an Agent Auth Flow</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => switchFlow('exchange')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              activeFlow === 'exchange'
                ? 'border-amber-500 bg-amber-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <h3
              className={`font-bold mb-1 ${activeFlow === 'exchange' ? 'text-amber-800' : 'text-gray-700'}`}
            >
              Token Exchange (RFC 8693)
            </h3>
            <p className="text-xs text-gray-500">Agent acts on behalf of a human user</p>
          </button>
          <button
            onClick={() => switchFlow('credentials')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              activeFlow === 'credentials'
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <h3
              className={`font-bold mb-1 ${activeFlow === 'credentials' ? 'text-purple-800' : 'text-gray-700'}`}
            >
              Client Credentials
            </h3>
            <p className="text-xs text-gray-500">Agent operates as a backend service</p>
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {activeFlow === 'exchange' ? 'Token Exchange Flow' : 'Client Credentials Flow'}
          </h3>
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
            </button>
          </div>
        </div>

        {/* SVG */}
        <div className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-xl border border-gray-200 p-2 mb-4">
          <svg
            viewBox="0 0 800 300"
            className="w-full h-auto"
            role="img"
            aria-label={`${activeFlow === 'exchange' ? 'Token Exchange' : 'Client Credentials'} flow diagram`}
          >
            {actors.map((actor) => (
              <g key={actor.id}>
                <line
                  x1={actor.x}
                  y1={60}
                  x2={actor.x}
                  y2={280}
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

            {steps.map((step, i) => {
              const y = 85 + i * 38;
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
                      markerEnd="url(#aiArrowAmber)"
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
                    markerEnd={isActive ? 'url(#aiArrowAmber)' : 'url(#aiArrowGray)'}
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
                id="aiArrowAmber"
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
                id="aiArrowGray"
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

        {/* Progress + Detail */}
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

      {/* Key Principle */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          <Shield className="w-6 h-6 inline mr-2 text-amber-600" />
          The Principle of Least Privilege for Agents
        </h2>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <p className="text-gray-800 leading-relaxed mb-4">
            Without strict authentication and highly granular authorization, an autonomous agent
            could <strong>modify records or leak secrets at machine speed</strong>. The token
            exchange pattern ensures:
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              {
                label: 'Scoped Access',
                desc: 'Agents receive only the permissions they need for the specific task',
              },
              {
                label: 'Short-lived Tokens',
                desc: 'Agent tokens expire quickly, limiting the blast radius of compromise',
              },
              {
                label: 'Human Context',
                desc: "The human user's identity travels with the agent's token — full auditability",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 text-sm mb-1">{item.label}</h4>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigateToSection('Visualization')}
          className="mt-6 inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          <span>View All Visualizations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="auth" hero={heroContent} mainContent={mainContent} />;
};

export default AIAgentAuth;
