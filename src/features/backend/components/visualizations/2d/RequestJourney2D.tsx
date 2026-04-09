import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Globe,
  Shield,
  Server,
  Database,
  Mail,
  CheckCircle,
  Zap,
  Clock,
} from 'lucide-react';

interface RequestJourney2DProps {
  className?: string;
}

interface JourneyStep {
  id: number;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  latency: string;
  description: string;
  detail: string;
}

const steps: JourneyStep[] = [
  {
    id: 0,
    label: 'DNS Resolution',
    shortLabel: 'DNS',
    icon: Globe,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    latency: '1–50 ms',
    description: 'Browser resolves shop.example.com → 93.184.216.34',
    detail:
      'The browser asks a DNS resolver to translate the human-readable domain into an IP address the network understands.',
  },
  {
    id: 1,
    label: 'TCP / TLS Handshake',
    shortLabel: 'TLS',
    icon: Shield,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
    latency: '10–100 ms',
    description: 'Secure tunnel established with 3-way handshake + certificate exchange',
    detail:
      'A TCP connection is opened, then TLS negotiates encryption keys so all further traffic is encrypted end-to-end.',
  },
  {
    id: 2,
    label: 'Load Balancer → Gateway',
    shortLabel: 'LB / GW',
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
    latency: '2–10 ms',
    description: 'Request routed, authenticated, and rate-limited at the edge',
    detail:
      'The load balancer picks the healthiest server. The API gateway validates the JWT, applies rate limits, and forwards the cleaned request.',
  },
  {
    id: 3,
    label: 'Application Logic + Cache',
    shortLabel: 'App',
    icon: Server,
    color: 'text-violet-600',
    bgColor: 'bg-violet-500',
    latency: '5–200 ms',
    description: 'Business rules execute; Redis cache checked before hitting database',
    detail:
      'The application server runs validation, pricing logic, and inventory checks. A cache hit returns in < 1 ms; a miss triggers a full database round-trip.',
  },
  {
    id: 4,
    label: 'Database Write',
    shortLabel: 'DB',
    icon: Database,
    color: 'text-rose-600',
    bgColor: 'bg-rose-500',
    latency: '5–50 ms',
    description: 'Order row inserted inside an ACID transaction',
    detail:
      'A transactional INSERT writes the order. The database guarantees Atomicity — if any constraint fails the whole write is rolled back.',
  },
  {
    id: 5,
    label: 'Async Queue Dispatch',
    shortLabel: 'Queue',
    icon: Mail,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-500',
    latency: '1–5 ms',
    description: 'Confirmation email and warehouse packing dispatched to background workers',
    detail:
      'The server publishes tasks to a message queue (e.g., RabbitMQ). Background workers pick them up asynchronously so the user does not wait.',
  },
  {
    id: 6,
    label: 'Response → Client',
    shortLabel: 'Done',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    latency: '5–20 ms',
    description: '200 OK — JSON receipt travels back through the same tunnel',
    detail:
      'The JSON response traverses back through the gateway and load balancer to arrive at the browser in under half a second. The spinner becomes a green checkmark.',
  },
];

const TOTAL_STEPS = steps.length;

const RequestJourney2D: React.FC<RequestJourney2DProps> = ({ className = '' }) => {
  const [activeStep, setActiveStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [packetPosition, setPacketPosition] = useState(-1);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setActiveStep(-1);
    setPacketPosition(-1);
  }, []);

  const togglePlay = useCallback(() => {
    if (activeStep >= TOTAL_STEPS - 1) {
      reset();
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying((p) => !p);
    }
  }, [activeStep, reset]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setActiveStep((prev) => {
        const next = prev + 1;
        if (next >= TOTAL_STEPS) {
          setIsPlaying(false);
          return prev;
        }
        setPacketPosition(next);
        return next;
      });
    }, 1800);
    return () => clearInterval(id);
  }, [isPlaying]);

  const totalLatencyMs =
    activeStep >= 0
      ? steps.slice(0, activeStep + 1).reduce((sum, s) => {
          const nums = s.latency.match(/\d+/g);
          return sum + (nums ? (parseInt(nums[0]) + parseInt(nums[1])) / 2 : 0);
        }, 0)
      : 0;

  const currentStep = activeStep >= 0 ? steps[activeStep] : null;

  return (
    <div
      className={`w-full bg-gradient-to-br from-slate-50 via-white to-zinc-50 rounded-2xl p-6 sm:p-8 ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          The Life of a &quot;Buy Now&quot; Click
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Follow a single HTTP request as it travels through the backend infrastructure — from
          browser to database and back — in under 200 ms.
        </p>
      </div>

      {/* SVG Pipeline */}
      <div className="relative overflow-x-auto pb-4">
        <svg
          viewBox="0 0 980 160"
          className="w-full min-w-[700px] h-auto"
          aria-label="Request journey pipeline"
        >
          {/* Connection lines */}
          {steps.map((step, i) => {
            if (i === 0) return null;
            const x1 = (i - 1) * 140 + 70;
            const x2 = i * 140 + 70;
            const reached = activeStep >= i;
            return (
              <g key={`line-${step.id}`}>
                <line
                  x1={x1}
                  y1={80}
                  x2={x2}
                  y2={80}
                  stroke={reached ? '#6366f1' : '#d1d5db'}
                  strokeWidth={reached ? 3 : 2}
                  strokeDasharray={reached ? 'none' : '6 4'}
                  className="transition-all duration-500"
                />
                {/* Animated packet */}
                {packetPosition === i && isPlaying && (
                  <circle r="5" fill="#6366f1" className="animate-pulse">
                    <animateMotion dur="0.8s" fill="freeze" path={`M${x1 - 70},0 L${x2 - x1},0`}>
                      <mpath xlinkHref={`#path-${i}`} />
                    </animateMotion>
                  </circle>
                )}
              </g>
            );
          })}

          {/* Step nodes */}
          {steps.map((step, i) => {
            const cx = i * 140 + 70;
            const cy = 80;
            const reached = activeStep >= i;
            const isCurrent = activeStep === i;

            return (
              <g
                key={step.id}
                className="cursor-pointer"
                onClick={() => {
                  setIsPlaying(false);
                  setActiveStep(i);
                  setPacketPosition(i);
                }}
              >
                {/* Glow ring on current */}
                {isCurrent && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={32}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth={2}
                    opacity={0.4}
                    className="animate-ping"
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />
                )}

                {/* Node circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={26}
                  fill={reached ? 'white' : '#f3f4f6'}
                  stroke={reached ? '#6366f1' : '#d1d5db'}
                  strokeWidth={isCurrent ? 3 : 2}
                  className="transition-all duration-300"
                />

                {/* Step number */}
                <text
                  x={cx}
                  y={cy + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`text-xs font-bold ${reached ? 'fill-indigo-600' : 'fill-gray-400'}`}
                >
                  {i + 1}
                </text>

                {/* Label */}
                <text
                  x={cx}
                  y={cy + 46}
                  textAnchor="middle"
                  className={`text-[10px] font-medium ${reached ? 'fill-gray-800' : 'fill-gray-400'}`}
                >
                  {step.shortLabel}
                </text>

                {/* Latency badge */}
                {reached && (
                  <g>
                    <rect
                      x={cx - 22}
                      y={cy - 48}
                      width={44}
                      height={18}
                      rx={9}
                      fill="#eef2ff"
                      stroke="#c7d2fe"
                      strokeWidth={1}
                    />
                    <text
                      x={cx}
                      y={cy - 37}
                      textAnchor="middle"
                      className="text-[8px] fill-indigo-700 font-semibold"
                    >
                      {step.latency}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={togglePlay}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-white shadow-lg transition-all duration-200 ${
            isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : activeStep >= TOTAL_STEPS - 1 ? 'Replay' : 'Play'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-gray-700 bg-white border border-gray-300 shadow hover:bg-gray-50 transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        {activeStep >= 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 font-medium text-sm">
            <Clock className="w-4 h-4" />~{Math.round(totalLatencyMs)} ms elapsed
          </div>
        )}
      </div>

      {/* Detail Card */}
      <div
        className={`transition-all duration-500 ${currentStep ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        {currentStep && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-12 h-12 ${currentStep.bgColor} rounded-xl flex items-center justify-center shadow`}
              >
                <currentStep.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Step {currentStep.id + 1}: {currentStep.label}
                </h3>
                <p className="text-gray-700 mb-2">{currentStep.description}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{currentStep.detail}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  {currentStep.latency}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Latency Budget Bar */}
      {activeStep >= 0 && (
        <div className="mt-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Latency Budget</span>
            <span>{Math.round(totalLatencyMs)} / 200 ms</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                totalLatencyMs > 200
                  ? 'bg-red-500'
                  : totalLatencyMs > 150
                    ? 'bg-amber-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((totalLatencyMs / 200) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestJourney2D;
