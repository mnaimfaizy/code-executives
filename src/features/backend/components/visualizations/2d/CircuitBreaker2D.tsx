import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  ZapOff,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
} from 'lucide-react';

interface CircuitBreaker2DProps {
  className?: string;
}

type CBState = 'closed' | 'open' | 'half-open';

interface RequestEvent {
  id: number;
  success: boolean;
  timestamp: number;
}

const STATE_META: Record<
  CBState,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    ringColor: string;
    icon: React.ElementType;
    desc: string;
  }
> = {
  closed: {
    label: 'CLOSED',
    color: 'text-green-700',
    bgColor: 'bg-green-500',
    borderColor: 'border-green-300',
    ringColor: 'ring-green-400',
    icon: ShieldCheck,
    desc: 'All requests pass through. The breaker monitors for failures.',
  },
  open: {
    label: 'OPEN',
    color: 'text-red-700',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-300',
    ringColor: 'ring-red-400',
    icon: ShieldAlert,
    desc: 'Requests are rejected immediately. The downstream service gets time to recover.',
  },
  'half-open': {
    label: 'HALF-OPEN',
    color: 'text-amber-700',
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-300',
    ringColor: 'ring-amber-400',
    icon: ShieldQuestion,
    desc: 'A single test request is allowed through. Success closes the breaker; failure re-opens it.',
  },
};

const FAILURE_THRESHOLD = 3;
const COOLDOWN_SECONDS = 5;

const CircuitBreaker2D: React.FC<CircuitBreaker2DProps> = ({ className = '' }) => {
  const [cbState, setCbState] = useState<CBState>('closed');
  const [failureCount, setFailureCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [events, setEvents] = useState<RequestEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [failureRate, setFailureRate] = useState(30);
  const [totalRequests, setTotalRequests] = useState(0);

  const reset = useCallback(() => {
    setIsSimulating(false);
    setCbState('closed');
    setFailureCount(0);
    setSuccessCount(0);
    setEvents([]);
    setCooldownRemaining(0);
    setTotalRequests(0);
  }, []);

  // Cooldown timer when circuit is open
  useEffect(() => {
    if (cbState !== 'open') return;
    setCooldownRemaining(COOLDOWN_SECONDS);
    const id = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setCbState('half-open');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cbState]);

  // Simulation loop
  useEffect(() => {
    if (!isSimulating) return;
    const id = setInterval(() => {
      const isSuccess = Math.random() * 100 > failureRate;

      setTotalRequests((p) => p + 1);

      setCbState((currentState) => {
        if (currentState === 'open') {
          // Reject immediately
          setEvents((prev) => [
            { id: Date.now(), success: false, timestamp: Date.now() },
            ...prev.slice(0, 19),
          ]);
          return 'open';
        }

        if (currentState === 'half-open') {
          if (isSuccess) {
            setSuccessCount((p) => p + 1);
            setFailureCount(0);
            setEvents((prev) => [
              { id: Date.now(), success: true, timestamp: Date.now() },
              ...prev.slice(0, 19),
            ]);
            return 'closed';
          } else {
            setFailureCount(FAILURE_THRESHOLD);
            setEvents((prev) => [
              { id: Date.now(), success: false, timestamp: Date.now() },
              ...prev.slice(0, 19),
            ]);
            return 'open';
          }
        }

        // closed state
        if (isSuccess) {
          setSuccessCount((p) => p + 1);
          setEvents((prev) => [
            { id: Date.now(), success: true, timestamp: Date.now() },
            ...prev.slice(0, 19),
          ]);
          return 'closed';
        } else {
          setEvents((prev) => [
            { id: Date.now(), success: false, timestamp: Date.now() },
            ...prev.slice(0, 19),
          ]);
          setFailureCount((prev) => {
            const next = prev + 1;
            if (next >= FAILURE_THRESHOLD) {
              return next; // state change handled below
            }
            return next;
          });
          // Check post-increment
          setFailureCount((prev) => {
            if (prev >= FAILURE_THRESHOLD) {
              setCbState('open');
            }
            return prev;
          });
          return currentState;
        }
      });
    }, 800);
    return () => clearInterval(id);
  }, [isSimulating, failureRate]);

  const meta = STATE_META[cbState];
  const StateIcon = meta.icon;

  return (
    <div
      className={`w-full bg-gradient-to-br from-slate-50 via-white to-zinc-50 rounded-2xl p-6 sm:p-8 ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Circuit Breaker Pattern
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Like an electrical breaker in your house — when too many failures occur, the circuit
          &quot;trips&quot; to protect the whole system from cascading damage.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* State Machine Visualization (left 3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* State Diagram */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">State Machine</h3>
            <svg viewBox="0 0 600 220" className="w-full h-auto">
              {/* CLOSED state */}
              <g>
                <circle
                  cx={100}
                  cy={110}
                  r={50}
                  fill={cbState === 'closed' ? '#dcfce7' : '#f9fafb'}
                  stroke={cbState === 'closed' ? '#22c55e' : '#d1d5db'}
                  strokeWidth={cbState === 'closed' ? 3 : 2}
                  className="transition-all duration-300"
                />
                {cbState === 'closed' && (
                  <circle
                    cx={100}
                    cy={110}
                    r={54}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth={2}
                    opacity={0.3}
                    className="animate-ping"
                    style={{ transformOrigin: '100px 110px' }}
                  />
                )}
                <text
                  x={100}
                  y={106}
                  textAnchor="middle"
                  className="text-xs font-bold fill-green-700"
                >
                  CLOSED
                </text>
                <text x={100} y={122} textAnchor="middle" className="text-[9px] fill-gray-500">
                  Requests pass
                </text>
              </g>

              {/* OPEN state */}
              <g>
                <circle
                  cx={500}
                  cy={110}
                  r={50}
                  fill={cbState === 'open' ? '#fef2f2' : '#f9fafb'}
                  stroke={cbState === 'open' ? '#ef4444' : '#d1d5db'}
                  strokeWidth={cbState === 'open' ? 3 : 2}
                  className="transition-all duration-300"
                />
                {cbState === 'open' && (
                  <circle
                    cx={500}
                    cy={110}
                    r={54}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={2}
                    opacity={0.3}
                    className="animate-ping"
                    style={{ transformOrigin: '500px 110px' }}
                  />
                )}
                <text
                  x={500}
                  y={106}
                  textAnchor="middle"
                  className="text-xs font-bold fill-red-700"
                >
                  OPEN
                </text>
                <text x={500} y={122} textAnchor="middle" className="text-[9px] fill-gray-500">
                  Requests blocked
                </text>
              </g>

              {/* HALF-OPEN state */}
              <g>
                <circle
                  cx={300}
                  cy={40}
                  r={40}
                  fill={cbState === 'half-open' ? '#fffbeb' : '#f9fafb'}
                  stroke={cbState === 'half-open' ? '#f59e0b' : '#d1d5db'}
                  strokeWidth={cbState === 'half-open' ? 3 : 2}
                  className="transition-all duration-300"
                />
                {cbState === 'half-open' && (
                  <circle
                    cx={300}
                    cy={40}
                    r={44}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    opacity={0.3}
                    className="animate-ping"
                    style={{ transformOrigin: '300px 40px' }}
                  />
                )}
                <text
                  x={300}
                  y={36}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-amber-700"
                >
                  HALF-OPEN
                </text>
                <text x={300} y={50} textAnchor="middle" className="text-[8px] fill-gray-500">
                  Test request
                </text>
              </g>

              {/* Arrows */}
              <defs>
                <marker
                  id="cb-arrow"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
                </marker>
                <marker
                  id="cb-arrow-red"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
                </marker>
                <marker
                  id="cb-arrow-green"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
                </marker>
              </defs>

              {/* Closed → Open (failures) */}
              <path
                d="M 150 100 Q 300 160 450 100"
                fill="none"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray={cbState === 'closed' ? '6 3' : 'none'}
                markerEnd="url(#cb-arrow-red)"
              />
              <text
                x={300}
                y={168}
                textAnchor="middle"
                className="text-[9px] fill-red-500 font-medium"
              >
                {FAILURE_THRESHOLD} failures → trip
              </text>

              {/* Open → Half-Open (timeout) */}
              <path
                d="M 460 72 Q 400 30 340 42"
                fill="none"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray={cbState === 'open' ? '6 3' : 'none'}
                markerEnd="url(#cb-arrow)"
              />
              <text
                x={420}
                y={42}
                textAnchor="middle"
                className="text-[9px] fill-amber-600 font-medium"
              >
                timeout
              </text>

              {/* Half-Open → Closed (success) */}
              <path
                d="M 260 48 Q 180 50 140 72"
                fill="none"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray={cbState === 'half-open' ? '6 3' : 'none'}
                markerEnd="url(#cb-arrow-green)"
              />
              <text
                x={180}
                y={50}
                textAnchor="middle"
                className="text-[9px] fill-green-600 font-medium"
              >
                success
              </text>

              {/* Half-Open → Open (failure) */}
              <path
                d="M 335 56 Q 420 60 460 82"
                fill="none"
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                markerEnd="url(#cb-arrow-red)"
              />
              <text x={416} y={60} textAnchor="middle" className="text-[8px] fill-red-400">
                fail
              </text>
            </svg>
          </div>

          {/* Current State Card */}
          <div
            className={`rounded-xl border-2 ${meta.borderColor} p-5 flex items-start gap-4 transition-all duration-300`}
          >
            <div
              className={`flex-shrink-0 w-14 h-14 ${meta.bgColor} rounded-xl flex items-center justify-center shadow-lg`}
            >
              <StateIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={`font-bold text-lg ${meta.color}`}>{meta.label}</span>
                {cbState === 'open' && cooldownRemaining > 0 && (
                  <span className="text-sm text-red-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {cooldownRemaining}s cooldown
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{meta.desc}</p>
              <div className="flex gap-4 mt-3 text-xs">
                <span className="text-red-600 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Failures: {failureCount}/{FAILURE_THRESHOLD}
                </span>
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Successes: {successCount}
                </span>
                <span className="text-gray-500 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Total: {totalRequests}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Simulation Controls</h3>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setIsSimulating((p) => !p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-white shadow transition-all ${
                  isSimulating ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isSimulating ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-gray-700 bg-white border border-gray-300 shadow hover:bg-gray-50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            {/* Failure Rate Slider */}
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Downstream Failure Rate:{' '}
              <span className="text-gray-900 font-bold">{failureRate}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={failureRate}
              onChange={(e) => setFailureRate(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>0% (healthy)</span>
              <span>100% (failing)</span>
            </div>
          </div>

          {/* Live Request Stream */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" /> Live Request Stream
            </h3>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {events.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  Start the simulation to see requests flow
                </p>
              )}
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all duration-300 ${
                    evt.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {evt.success ? (
                    <Zap className="w-3 h-3 flex-shrink-0" />
                  ) : (
                    <ZapOff className="w-3 h-3 flex-shrink-0" />
                  )}
                  <span className="font-medium">{evt.success ? '200 OK' : '503 Rejected'}</span>
                  <span className="text-[10px] ml-auto opacity-60">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Why It Matters
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Without a circuit breaker, a single failing service can cause{' '}
              <strong>cascading failures</strong> as upstream callers pile up waiting for timeouts.
              The breaker pattern <strong>fails fast</strong>, giving the downstream service
              breathing room to recover while upstream services get an immediate error instead of
              hanging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitBreaker2D;
