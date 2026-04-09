import React, { useState, useEffect, useCallback } from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import {
  Globe,
  Shield,
  Server,
  Database,
  MessageSquare,
  ArrowRight,
  Play,
  RotateCcw,
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  detail: string;
  latency: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'DNS Resolution',
    icon: <Globe className="w-5 h-5" />,
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    description: 'Browser resolves "shop.example.com" to an IP address',
    detail:
      'The browser asks: "Where does shop.example.com live?" DNS servers act like the city\'s address registry — translating human-readable domain names to IP addresses (e.g., 93.184.216.34). The query cascades: browser cache → OS cache → router cache → ISP recursive resolver → authoritative DNS server. Results are cached at every level with TTL (Time To Live) values, typically 300 seconds. A cache hit resolves in <1ms; a full recursive lookup can take 50ms+ across multiple nameservers.',
    latency: '~1–50ms',
  },
  {
    id: 2,
    title: 'TCP / TLS Handshake',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Establish a secure connection with the server',
    detail:
      'TCP three-way handshake (SYN → SYN-ACK → ACK) establishes a reliable, ordered byte stream. Then TLS 1.3 negotiates encryption in just one round trip — the client and server agree on cipher suites, exchange ephemeral keys (ECDHE), and verify certificates. This ensures all data is encrypted in transit, preventing eavesdropping and man-in-the-middle attacks. HTTP/2 and HTTP/3 (QUIC) reduce this further with 0-RTT resumption for repeat visits.',
    latency: '~10–100ms',
  },
  {
    id: 3,
    title: 'Load Balancer → API Gateway',
    icon: <Server className="w-5 h-5" />,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Request is routed, authenticated, and rate-limited',
    detail:
      "The load balancer (Nginx, HAProxy, AWS ALB) distributes traffic across server instances using algorithms like round-robin, least-connections, or weighted. The API Gateway (Kong, AWS API Gateway) handles cross-cutting concerns: JWT validation (is this user authenticated?), rate limiting (max 100 req/s per user), request transformation (rename fields, add headers), and routing to the correct microservice based on URL path. Think of it as the city's security checkpoint and traffic control center combined.",
    latency: '~2–10ms',
  },
  {
    id: 4,
    title: 'Application Logic + Cache',
    icon: <Database className="w-5 h-5" />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Business logic executes, cache is checked, database queried',
    detail:
      'The service first checks the in-memory cache (Redis at <1ms) for precomputed results — a cache hit can skip the slowest step entirely. On cache miss, it queries the primary database (PostgreSQL, MySQL) which may take 5-50ms for indexed reads or 100ms+ for complex joins. Business rules execute: validate inventory levels, calculate pricing with regional taxes, apply promotional discounts, check fraud signals. Results are written back to cache (with TTL) so the next request for the same data is instant.',
    latency: '~5–200ms',
  },
  {
    id: 5,
    title: 'Message Queue (Async)',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Async tasks dispatched: email confirmation, inventory update',
    detail:
      'Non-critical tasks are pushed to a message queue (RabbitMQ, Apache Kafka, AWS SQS) — a conveyor belt that decouples the sender from the receiver. The order confirmation email, inventory sync to warehouse systems, analytics events, and loyalty points calculation all happen asynchronously. Worker processes consume these messages independently, often minutes after the user sees their confirmation page. This pattern is critical: it lets the user response return fast while heavy work continues in the background.',
    latency: '~1–5ms (enqueue)',
  },
  {
    id: 6,
    title: 'Response to Client',
    icon: <ArrowRight className="w-5 h-5" />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'JSON response sent back through the same path',
    detail:
      'The response travels back through the pipeline in reverse: Service → API Gateway (adds CORS headers, strips internal metadata) → Load Balancer → TLS encryption → Client. Typically a JSON payload with HTTP status code (200 OK), response body ({orderId, status, estimatedDelivery}), and metadata headers (X-Request-Id for tracing, Cache-Control). The browser renders the confirmation UI. Meanwhile, observability systems (the "security cameras") have captured logs, metrics, and trace spans for every hop — available instantly if something goes wrong.',
    latency: '~5–20ms',
  },
];

const RequestLifecycle: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const totalSteps = steps.length;

  const advance = useCallback(() => {
    setActiveStep((prev) => {
      if (prev >= totalSteps - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [totalSteps]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(advance, 1800);
    return () => clearInterval(timer);
  }, [isPlaying, advance]);

  const handleReset = (): void => {
    setIsPlaying(false);
    setActiveStep(0);
  };

  const step = steps[activeStep];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-zinc-50 rounded-2xl p-8 border border-slate-200 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="w-8 h-8 text-slate-600" />
          <h1 className="text-4xl font-bold text-gray-900">Request Lifecycle</h1>
        </div>
        <p className="text-xl text-gray-700 leading-relaxed max-w-4xl">
          When you click &ldquo;Buy Now&rdquo; on a website, a single HTTP request embarks on an
          extraordinary journey through dozens of systems in under 200 milliseconds. Picture an
          industrial city: your request enters through a massive gate (DNS), passes security
          checkpoints (TLS), is routed by a traffic controller (Load Balancer), processed in a
          factory (Application Server), stored in a warehouse (Database), and dispatched via
          conveyor belt (Message Queue). Let&apos;s follow it step by step.
        </p>
      </div>

      {/* Animated Journey */}
      <ThemeCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">The &ldquo;Buy Now&rdquo; Journey</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Play className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium">{isPlaying ? 'Playing…' : 'Play'}</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-medium">Reset</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-8">
          <div className="h-2 bg-gray-100 rounded-full">
            <div
              className="h-2 bg-gradient-to-r from-slate-500 to-zinc-400 rounded-full transition-all duration-500"
              style={{ width: `${((activeStep + 1) / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveStep(i);
                  setIsPlaying(false);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i <= activeStep
                    ? `${s.bgColor} ${s.color} border-2 ${s.borderColor} scale-110`
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                {s.id}
              </button>
            ))}
          </div>
        </div>

        {/* Step Cards Row */}
        <div className="grid grid-cols-6 gap-2 mb-8">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveStep(i);
                setIsPlaying(false);
              }}
              className={`p-3 rounded-lg border text-center transition-all duration-300 ${
                i === activeStep
                  ? `${s.bgColor} ${s.borderColor} border-2 shadow-md`
                  : i < activeStep
                    ? `${s.bgColor} ${s.borderColor} opacity-60`
                    : 'bg-gray-50 border-gray-200 opacity-40'
              }`}
            >
              <div
                className={`flex justify-center mb-1 ${i <= activeStep ? s.color : 'text-gray-300'}`}
              >
                {s.icon}
              </div>
              <div
                className={`text-[10px] font-semibold leading-tight ${i <= activeStep ? s.color : 'text-gray-400'}`}
              >
                {s.title}
              </div>
            </button>
          ))}
        </div>

        {/* Active Step Detail */}
        <div
          className={`${step.bgColor} rounded-xl p-6 border-2 ${step.borderColor} transition-all duration-500`}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div
              className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center ${step.color} shadow-sm`}
            >
              {step.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Step {step.id}: {step.title}
              </h3>
              <div className="text-sm text-gray-500">Latency: {step.latency}</div>
            </div>
          </div>
          <p className="text-gray-800 font-medium mb-3">{step.description}</p>
          <p className="text-gray-700 leading-relaxed">{step.detail}</p>
        </div>
      </ThemeCard>

      {/* Total Latency Summary */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Latency Budget</h2>
        <p className="text-gray-600 mb-6">
          A well-optimized &ldquo;Buy Now&rdquo; request completes its entire journey in under
          200ms. Here&apos;s where the time goes:
        </p>
        <div className="space-y-3">
          {steps.map((s) => {
            const ms = parseInt(s.latency.replace(/[^0-9]/g, '')) || 5;
            const maxMs = 200;
            const pct = Math.min((ms / maxMs) * 100, 80);
            return (
              <div key={s.id} className="flex items-center space-x-3">
                <div className="w-40 text-sm font-medium text-gray-700 flex-shrink-0">
                  {s.title}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-4 rounded-full ${s.bgColor} border ${s.borderColor} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <div className="w-20 text-right text-xs text-gray-500 flex-shrink-0">
                  {s.latency}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="font-bold text-gray-900">Total Budget</span>
          <span className="text-lg font-bold text-slate-600">&lt; 200ms</span>
        </div>
      </ThemeCard>

      {/* Key Takeaways */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Takeaways</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Caching is Critical',
              desc: 'Cache hits (Redis, CDN) can skip the slowest parts — database queries. A cache hit vs. miss can mean 1ms vs. 100ms.',
              color: 'bg-amber-50 border-amber-200',
            },
            {
              title: 'Async Matters',
              desc: 'Message queues let the response return fast while background workers handle emails, analytics, and inventory updates independently.',
              color: 'bg-pink-50 border-pink-200',
            },
            {
              title: 'Every Hop Has Cost',
              desc: 'Each network hop (DNS, TLS, load balancer, service mesh) adds latency. Minimize the number of synchronous hops in the critical path.',
              color: 'bg-teal-50 border-teal-200',
            },
          ].map((item, i) => (
            <div key={i} className={`${item.color} border rounded-xl p-5`}>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </ThemeCard>
    </div>
  );
};

export default RequestLifecycle;
