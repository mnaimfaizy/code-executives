import React, { useState, useEffect, useCallback } from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import {
  ShieldAlert,
  Plug,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Zap,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

type CircuitState = 'closed' | 'open' | 'half-open';

const ResiliencePatterns: React.FC = () => {
  // Circuit Breaker interactive state
  const [circuitState, setCircuitState] = useState<CircuitState>('closed');
  const [failureCount, setFailureCount] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [requests, setRequests] = useState<
    Array<{ id: number; status: 'success' | 'fail' | 'rejected' }>
  >([]);
  const failureThreshold = 3;

  const simulateRequest = useCallback((): void => {
    const id = Date.now();

    if (circuitState === 'open') {
      setRequests((prev) => [...prev.slice(-8), { id, status: 'rejected' }]);
      return;
    }

    // In half-open, try one request
    const willFail = circuitState === 'closed' ? Math.random() > 0.5 : Math.random() > 0.6;

    if (willFail) {
      const newCount = failureCount + 1;
      setFailureCount(newCount);
      setRequests((prev) => [...prev.slice(-8), { id, status: 'fail' }]);
      if (newCount >= failureThreshold) {
        setCircuitState('open');
        // After timeout, go to half-open
        setTimeout(() => setCircuitState('half-open'), 3000);
      }
    } else {
      setRequests((prev) => [...prev.slice(-8), { id, status: 'success' }]);
      if (circuitState === 'half-open') {
        setCircuitState('closed');
        setFailureCount(0);
      }
    }
  }, [circuitState, failureCount]);

  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(simulateRequest, 800);
    return () => clearInterval(interval);
  }, [isSimulating, simulateRequest]);

  const resetCircuit = (): void => {
    setCircuitState('closed');
    setFailureCount(0);
    setRequests([]);
    setIsSimulating(false);
  };

  const circuitColors: Record<
    CircuitState,
    { bg: string; text: string; border: string; label: string }
  > = {
    closed: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      label: 'CLOSED (Healthy)',
    },
    open: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      label: 'OPEN (Tripped)',
    },
    'half-open': {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-300',
      label: 'HALF-OPEN (Testing)',
    },
  };

  const cc = circuitColors[circuitState];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-zinc-50 rounded-2xl p-8 border border-slate-200 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <ShieldAlert className="w-8 h-8 text-slate-600" />
          <h1 className="text-4xl font-bold text-gray-900">Resilience Patterns</h1>
        </div>
        <p className="text-xl text-gray-700 leading-relaxed max-w-4xl">
          In a distributed system, failure is not a question of <em>if</em> but <em>when</em>.
          Network cables get cut. Servers run out of memory. Databases hit connection limits.
          Resilience patterns are the sentinel systems that protect your architecture — ensuring
          that partial failures don&apos;t cascade into total outages.
        </p>
      </div>

      {/* Circuit Breaker Interactive */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="w-6 h-6 text-amber-600" />
          <h2 className="text-2xl font-bold text-gray-900">Circuit Breaker Pattern</h2>
        </div>
        <p className="text-gray-700 mb-2 leading-relaxed">
          Named after the electrical device in your home&apos;s fuse box. When a downstream service
          starts failing, the circuit breaker "trips" to prevent cascading failures across your
          entire system. Without it, one slow database can consume all connection pool threads,
          causing every service to time out and creating a domino effect of failures.
        </p>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          <strong>Three states:</strong>{' '}
          <span className="text-green-600 font-semibold">Closed</span> (healthy — requests pass
          through normally), <span className="text-red-600 font-semibold">Open</span> (tripped — all
          requests instantly rejected with a fallback response), and{' '}
          <span className="text-amber-600 font-semibold">Half-Open</span> (testing — a single probe
          request is allowed through to check if the downstream service has recovered). Libraries
          like Netflix Hystrix, Resilience4j, and Polly implement this pattern.
        </p>

        {/* Interactive Visualization */}
        <div
          className={`${cc.bg} ${cc.border} border-2 rounded-xl p-6 mb-4 transition-all duration-500`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${cc.text} font-bold text-lg`}>{cc.label}</div>
            <div className="text-sm text-gray-600">
              Failures: {failureCount} / {failureThreshold}
            </div>
          </div>

          {/* Visual state machine */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            {(['closed', 'open', 'half-open'] as CircuitState[]).map((state) => (
              <div key={state} className="flex items-center space-x-2">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                    circuitState === state
                      ? `${circuitColors[state].bg} ${circuitColors[state].border} ${circuitColors[state].text} shadow-lg scale-110`
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                  }`}
                >
                  {state === 'closed' && <CheckCircle className="w-6 h-6" />}
                  {state === 'open' && <AlertTriangle className="w-6 h-6" />}
                  {state === 'half-open' && <RefreshCw className="w-6 h-6" />}
                </div>
                {state !== 'half-open' && <div className="w-8 h-0.5 bg-gray-300"></div>}
              </div>
            ))}
          </div>

          {/* Request stream */}
          <div className="flex items-center space-x-2 min-h-[32px] overflow-hidden">
            <span className="text-xs text-gray-500 w-16 flex-shrink-0">Requests:</span>
            {requests.map((r) => (
              <div
                key={r.id}
                className={`w-6 h-6 rounded-full flex-shrink-0 animate-pulse transition-all ${
                  r.status === 'success'
                    ? 'bg-green-400'
                    : r.status === 'fail'
                      ? 'bg-red-400'
                      : 'bg-gray-400'
                }`}
                title={r.status}
              ></div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex space-x-3">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isSimulating ? 'Pause' : 'Simulate'}</span>
          </button>
          <button
            onClick={resetCircuit}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </ThemeCard>

      {/* Sidecar Pattern */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-4">
          <Plug className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Sidecar Pattern</h2>
        </div>
        <p className="text-gray-700 mb-4 leading-relaxed">
          A &ldquo;helper&rdquo; process that runs alongside the main application container to
          handle cross-cutting concerns — logging, monitoring, TLS termination, service mesh
          proxying — without modifying the service code. In Kubernetes, the sidecar runs as a second
          container in the same Pod, sharing the same network namespace and lifecycle.
        </p>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          <strong>Real-world example:</strong> Envoy proxy (used by Istio service mesh) runs as a
          sidecar next to every microservice. It handles mTLS encryption, load balancing, retry
          logic, and distributed tracing — so application developers can focus purely on business
          logic. Datadog agents also commonly deploy as sidecars for telemetry collection.
        </p>

        {/* Visual */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-4">
          <div className="flex items-center justify-center space-x-6">
            <div className="bg-white rounded-xl p-6 border-2 border-blue-300 text-center shadow-md">
              <div className="text-3xl mb-2">🎬</div>
              <div className="font-bold text-blue-700">Main Service</div>
              <div className="text-xs text-gray-500">Business Logic Only</div>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-16 h-0.5 bg-blue-300"></div>
              <span className="text-xs text-blue-500 font-semibold">Attached</span>
              <div className="w-16 h-0.5 bg-blue-300"></div>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-blue-300 text-center shadow-md">
              <div className="text-3xl mb-2">🤝</div>
              <div className="font-bold text-blue-700">Sidecar</div>
              <div className="text-xs text-gray-500">Logging · Security · Proxy</div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4 italic">
            Like a celebrity&apos;s personal assistant — the celebrity only focuses on acting while
            the assistant handles phone calls, scheduling, and security.
          </p>
        </div>
      </ThemeCard>

      {/* Saga Pattern */}
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-4">
          <RefreshCw className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Saga Pattern</h2>
        </div>
        <p className="text-gray-700 mb-4 leading-relaxed">
          In a monolith, a database transaction guarantees atomicity — either everything succeeds or
          nothing does. But in microservices, a single business operation (e.g., placing an order)
          spans multiple services, each with its own database. The Saga pattern breaks this
          distributed transaction into a sequence of local transactions, each with a
          &ldquo;compensating action&rdquo; that triggers if a later step fails.
        </p>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          <strong>Two coordination strategies:</strong> <em>Choreography</em> (each service
          publishes events that trigger the next step — decentralized, like a dance where each
          dancer knows the routine) and <em>Orchestration</em> (a central Saga coordinator tells
          each service what to do — like a conductor directing an orchestra). Choreography is
          simpler but harder to debug; orchestration adds a central point of control but is easier
          to reason about.
        </p>

        {/* Saga flow visualization */}
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
          <h3 className="font-semibold text-gray-800 mb-4 text-center">E-Commerce Saga Flow</h3>
          <div className="flex flex-col space-y-3">
            {[
              { step: '1. Create Order', compensate: 'Cancel Order', icon: '📋' },
              { step: '2. Reserve Inventory', compensate: 'Release Inventory', icon: '📦' },
              { step: '3. Process Payment', compensate: 'Refund Payment', icon: '💳' },
              { step: '4. Ship Package', compensate: 'Cancel Shipment', icon: '🚚' },
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 bg-white rounded-lg p-3 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-700 text-sm">{item.step}</span>
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">
                      ↩ {item.compensate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-4 italic">
            If Step 3 fails, Steps 2 and 1 are automatically compensated (inventory released, order
            cancelled).
          </p>
        </div>
      </ThemeCard>

      {/* Summary Table */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pattern Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Pattern</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Primary Benefit</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Analogy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-amber-700">Circuit Breaker</td>
                <td className="py-3 px-4">Resilience</td>
                <td className="py-3 px-4 text-gray-700">Prevents cascading failures</td>
                <td className="py-3 px-4 text-gray-600 italic text-xs">
                  A household electrical fuse
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-blue-700">Sidecar</td>
                <td className="py-3 px-4">Infrastructure</td>
                <td className="py-3 px-4 text-gray-700">Modularity and separation of concerns</td>
                <td className="py-3 px-4 text-gray-600 italic text-xs">
                  Celebrity&apos;s personal assistant
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-emerald-700">Saga</td>
                <td className="py-3 px-4">Transaction</td>
                <td className="py-3 px-4 text-gray-700">Consistency across services</td>
                <td className="py-3 px-4 text-gray-600 italic text-xs">
                  Travel agent&apos;s booking flow
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ThemeCard>
    </div>
  );
};

export default ResiliencePatterns;
