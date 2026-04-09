import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Globe,
  FileCode,
  Braces,
  Layers,
  Zap,
} from 'lucide-react';

interface APIEvolution2DProps {
  className?: string;
}

type APIGen = 'rpc' | 'soap' | 'rest' | 'graphql' | 'grpc';

interface APIInfo {
  name: string;
  year: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentBg: string;
  format: string;
  speed: string;
  flexibility: string;
  analogy: string;
  mechanism: string;
  requestExample: string;
  responseExample: string;
  keyInsight: string;
}

const apis: Record<APIGen, APIInfo> = {
  rpc: {
    name: 'Remote Procedure Call',
    year: '1970s-80s',
    icon: Globe,
    color: '#6b7280',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-800',
    accentBg: 'bg-gray-600',
    format: 'Binary',
    speed: 'Fast',
    flexibility: 'Very Low',
    analogy: 'Shouting to a colleague across the room — tight coupling, same "language"',
    mechanism:
      'A client calls a function that transparently executes on a remote server. Stubs and skeletons marshal parameters across the network.',
    requestExample: 'getUser(42)',
    responseExample: '{ name: "Alice", age: 30 }',
    keyInsight:
      'The earliest form of remote communication between processes. Simple but tightly coupled.',
  },
  soap: {
    name: 'SOAP',
    year: '1998',
    icon: FileCode,
    color: '#7c3aed',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-300',
    textColor: 'text-violet-800',
    accentBg: 'bg-violet-600',
    format: 'XML',
    speed: 'Slow (verbose)',
    flexibility: 'Low',
    analogy: 'Sending a certified letter — formal, reliable, lots of paperwork',
    mechanism:
      'Messages wrapped in XML envelopes with strict WSDL contracts. Built-in WS-Security, WS-ReliableMessaging, and transaction support.',
    requestExample: '<soap:Envelope>\n  <GetUser><Id>42</Id></GetUser>\n</soap:Envelope>',
    responseExample: '<soap:Envelope>\n  <User><Name>Alice</Name></User>\n</soap:Envelope>',
    keyInsight:
      'Enterprise-grade with built-in security and reliability specs, but the XML overhead and rigid contracts led to "SOAP fatigue."',
  },
  rest: {
    name: 'REST',
    year: '2000',
    icon: Braces,
    color: '#2563eb',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-800',
    accentBg: 'bg-blue-600',
    format: 'JSON / Text',
    speed: 'Good',
    flexibility: 'Moderate',
    analogy: 'A fast-food counter — pick from a predictable menu using standard verbs',
    mechanism:
      'Resources identified by URLs, manipulated through HTTP verbs (GET, POST, PUT, DELETE). Stateless requests, cacheable responses.',
    requestExample: 'GET /api/users/42',
    responseExample: '{ "name": "Alice", "age": 30 }',
    keyInsight:
      'Became the web default because it piggy-backs on HTTP. The trade-off: over-fetching (you get the whole resource) or under-fetching (you need multiple calls).',
  },
  graphql: {
    name: 'GraphQL',
    year: '2015',
    icon: Layers,
    color: '#e542a8',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    textColor: 'text-pink-800',
    accentBg: 'bg-pink-600',
    format: 'JSON',
    speed: 'Variable',
    flexibility: 'Very High',
    analogy: 'A personal shopper — you describe exactly what you want and get nothing more',
    mechanism:
      'Clients send a query describing the exact shape of data they need. A single endpoint resolves the request by composing multiple data sources.',
    requestExample: '{ user(id: 42) {\n    name\n    orders { total }\n  }\n}',
    responseExample: '{ "user": {\n    "name": "Alice",\n    "orders": [{ "total": 99 }]\n  }\n}',
    keyInsight:
      'Invented at Facebook to solve mobile over-fetching. One round-trip replaces multiple REST calls, but shifts complexity to the server resolver.',
  },
  grpc: {
    name: 'gRPC',
    year: '2015',
    icon: Zap,
    color: '#059669',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-800',
    accentBg: 'bg-emerald-600',
    format: 'Protobuf (binary)',
    speed: 'Very Fast',
    flexibility: 'Low (strict contract)',
    analogy: 'A high-speed pneumatic tube — binary, efficient, built for speed',
    mechanism:
      'Uses HTTP/2 and Protocol Buffers for compact binary serialization. Supports 4 streaming modes: unary, server-stream, client-stream, bidirectional.',
    requestExample: 'service UserService {\n  rpc GetUser (UserId)\n    returns (User);\n}',
    responseExample: 'Binary Protobuf → { name: "Alice" }',
    keyInsight:
      'Designed by Google for service-to-service communication. 7-10x faster than REST+JSON. Not browser-friendly without a proxy (grpc-web).',
  },
};

const timeline: APIGen[] = ['rpc', 'soap', 'rest', 'graphql', 'grpc'];

const APIEvolution2D: React.FC<APIEvolution2DProps> = ({ className = '' }) => {
  const [selected, setSelected] = useState<APIGen>('rest');
  const [isPlaying, setIsPlaying] = useState(false);
  const playIndexRef = React.useRef(2); // rest by default

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      const prev = playIndexRef.current;
      const next = (prev + 1) % timeline.length;
      playIndexRef.current = next;
      setSelected(timeline[next]);
      if (next === timeline.length - 1) {
        setIsPlaying(false);
      }
    }, 2500);
    return () => clearInterval(id);
  }, [isPlaying]);

  const startTimeline = (): void => {
    playIndexRef.current = 0;
    setSelected('rpc');
    setIsPlaying(true);
  };

  const api = apis[selected];
  const Icon = api.icon;

  return (
    <div
      className={`w-full bg-gradient-to-br from-slate-50 via-white to-zinc-50 rounded-2xl p-6 sm:p-8 ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">The Evolution of APIs</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          From raw procedure calls to intelligent query languages — trace how APIs evolved to
          balance speed, flexibility, and developer experience.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto px-4">
          {timeline.map((key, i) => {
            const a = apis[key];
            const isActive = selected === key;
            const isPast = timeline.indexOf(selected) >= i;
            return (
              <React.Fragment key={key}>
                <button
                  onClick={() => {
                    setSelected(key);
                    playIndexRef.current = i;
                    setIsPlaying(false);
                  }}
                  className={`relative flex flex-col items-center group z-10 transition-all duration-300 ${
                    isActive ? 'scale-110' : ''
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow ${
                      isActive
                        ? `${a.accentBg} text-white border-transparent ring-4 ${a.borderColor}`
                        : isPast
                          ? 'bg-white border-gray-400 text-gray-600'
                          : 'bg-gray-100 border-gray-200 text-gray-400'
                    }`}
                  >
                    <a.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`mt-2 text-xs font-bold transition-all ${
                      isActive ? a.textColor : isPast ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {a.name.split(' ').pop()}
                  </span>
                  <span className={`text-[10px] ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                    {a.year}
                  </span>
                </button>
                {i < timeline.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1">
                    <div
                      className={`h-full transition-all duration-500 ${
                        timeline.indexOf(selected) > i ? 'bg-indigo-400' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={isPlaying ? () => setIsPlaying(false) : startTimeline}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-white shadow-lg transition-all ${
            isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Play Timeline'}
        </button>
        <button
          onClick={() => {
            setIsPlaying(false);
            setSelected('rpc');
            playIndexRef.current = 0;
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-gray-700 bg-white border border-gray-300 shadow hover:bg-gray-50 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Detail Grid */}
      <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Overview */}
        <div className={`rounded-xl border-2 ${api.borderColor} ${api.bgColor} p-6 shadow-lg`}>
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-14 h-14 ${api.accentBg} rounded-xl flex items-center justify-center shadow-lg`}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${api.textColor}`}>{api.name}</h3>
              <p className="text-sm text-gray-500">{api.year}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed italic">
            &quot;{api.analogy}&quot;
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{api.mechanism}</p>

          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Format', value: api.format },
              { label: 'Speed', value: api.speed },
              { label: 'Flexibility', value: api.flexibility },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/70 rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-500 font-medium">{stat.label}</div>
                <div className={`text-xs font-bold ${api.textColor}`}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Request / Response */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" /> Request Example
            </h4>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              {api.requestExample}
            </pre>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-emerald-600 rotate-180" /> Response Example
            </h4>
            <pre className="bg-gray-900 text-blue-400 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              {api.responseExample}
            </pre>
          </div>

          <div className={`rounded-xl border-2 ${api.borderColor} ${api.bgColor} p-5`}>
            <h4 className={`text-sm font-bold ${api.textColor} mb-2`}>Key Insight</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{api.keyInsight}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIEvolution2D;
