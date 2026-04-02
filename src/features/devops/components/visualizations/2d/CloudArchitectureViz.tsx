import React, { useState } from 'react';

interface ArchPattern {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  pros: string[];
  cons: string[];
}

const PATTERNS: ArchPattern[] = [
  {
    id: 'monolith',
    label: 'Monolith',
    icon: '🏢',
    color: '#6b7280',
    description:
      'A single deployable unit containing all application logic. Simple to develop and deploy initially.',
    pros: ['Simple deployment', 'Easy debugging', 'Low latency (in-process calls)'],
    cons: [
      'Scaling requires duplicating everything',
      'Single point of failure',
      'Hard to adopt new tech',
    ],
  },
  {
    id: 'microservices',
    label: 'Microservices',
    icon: '🧩',
    color: '#3b82f6',
    description: 'Application decomposed into small, independent services communicating via APIs.',
    pros: ['Independent scaling', 'Team autonomy', 'Technology diversity'],
    cons: ['Network complexity', 'Distributed debugging', 'Data consistency challenges'],
  },
  {
    id: 'serverless',
    label: 'Serverless',
    icon: '⚡',
    color: '#f59e0b',
    description: 'Event-driven functions that run on-demand. Provider manages all infrastructure.',
    pros: ['Zero idle cost', 'Auto-scaling', 'No server management'],
    cons: ['Cold starts', 'Vendor lock-in', 'Execution time limits'],
  },
  {
    id: 'loadbalanced',
    label: 'Load Balanced',
    icon: '⚖️',
    color: '#10b981',
    description: 'Distributes incoming traffic across multiple servers for high availability.',
    pros: ['High availability', 'Horizontal scaling', 'No single bottleneck'],
    cons: ['Session management', 'Configuration complexity', 'Cost overhead'],
  },
];

const CloudArchitectureViz: React.FC = () => {
  const [activePattern, setActivePattern] = useState('microservices');

  const pattern = PATTERNS.find((p) => p.id === activePattern) || PATTERNS[1];

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-white via-sky-50 to-indigo-50 rounded-2xl p-6 border border-sky-200 shadow-sm">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Cloud Architecture Patterns</h3>
          <p className="text-sm text-gray-600">
            Compare architectural approaches for cloud-native applications
          </p>
        </div>

        {/* Pattern selector */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePattern(p.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                activePattern === p.id
                  ? 'shadow-md scale-105 bg-white'
                  : 'bg-white/60 border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
              style={activePattern === p.id ? { borderColor: p.color, color: p.color } : {}}
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>

        {/* Architecture diagrams */}
        <div className="mb-6">
          <svg
            viewBox="0 0 800 300"
            className="w-full h-auto"
            aria-label={`${pattern.label} architecture diagram`}
          >
            <defs>
              <filter id="archShadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.1" />
              </filter>
            </defs>

            {activePattern === 'monolith' && (
              <g>
                {/* Single large box */}
                <rect
                  x="250"
                  y="30"
                  width="300"
                  height="240"
                  rx="16"
                  fill="#f3f4f6"
                  stroke="#6b7280"
                  strokeWidth="2"
                  filter="url(#archShadow)"
                />
                <text
                  x="400"
                  y="65"
                  textAnchor="middle"
                  fill="#374151"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  Monolithic Application
                </text>

                {/* Internal modules */}
                {[
                  'Frontend UI',
                  'Business Logic',
                  'Data Access',
                  'Auth Module',
                  'API Layer',
                  'Database',
                ].map((mod, i) => (
                  <g key={mod}>
                    <rect
                      x={280 + (i % 2) * 130}
                      y={85 + Math.floor(i / 2) * 55}
                      width="120"
                      height="40"
                      rx="8"
                      fill="#e5e7eb"
                      stroke="#9ca3af"
                      strokeWidth="1"
                    />
                    <text
                      x={340 + (i % 2) * 130}
                      y={110 + Math.floor(i / 2) * 55}
                      textAnchor="middle"
                      fill="#4b5563"
                      fontSize="10"
                      fontFamily="system-ui"
                    >
                      {mod}
                    </text>
                  </g>
                ))}

                {/* Users */}
                <text x="100" y="155" textAnchor="middle" fontSize="30">
                  👥
                </text>
                <text
                  x="100"
                  y="175"
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="10"
                  fontFamily="system-ui"
                >
                  Users
                </text>
                <line
                  x1="140"
                  y1="150"
                  x2="250"
                  y2="150"
                  stroke="#6b7280"
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />

                {/* Single deploy arrow */}
                <text x="700" y="155" textAnchor="middle" fontSize="24">
                  🖥️
                </text>
                <text
                  x="700"
                  y="175"
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="10"
                  fontFamily="system-ui"
                >
                  Single Server
                </text>
                <line
                  x1="550"
                  y1="150"
                  x2="670"
                  y2="150"
                  stroke="#6b7280"
                  strokeWidth="2"
                  strokeDasharray="6,3"
                />
              </g>
            )}

            {activePattern === 'microservices' && (
              <g>
                {/* API Gateway */}
                <rect
                  x="120"
                  y="110"
                  width="100"
                  height="70"
                  rx="12"
                  fill="#dbeafe"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  filter="url(#archShadow)"
                />
                <text
                  x="170"
                  y="140"
                  textAnchor="middle"
                  fill="#1d4ed8"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  API
                </text>
                <text
                  x="170"
                  y="155"
                  textAnchor="middle"
                  fill="#1d4ed8"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  Gateway
                </text>

                {/* Users */}
                <text x="40" y="150" textAnchor="middle" fontSize="30">
                  👥
                </text>
                <line x1="65" y1="145" x2="120" y2="145" stroke="#3b82f6" strokeWidth="2" />

                {/* Microservices */}
                {[
                  { label: 'User\nService', y: 30, color: '#818cf8' },
                  { label: 'Payment\nService', y: 110, color: '#60a5fa' },
                  { label: 'Inventory\nService', y: 190, color: '#34d399' },
                ].map((svc, i) => (
                  <g key={i}>
                    <rect
                      x="320"
                      y={svc.y}
                      width="110"
                      height="70"
                      rx="12"
                      fill={`${svc.color}20`}
                      stroke={svc.color}
                      strokeWidth="2"
                      filter="url(#archShadow)"
                    />
                    {svc.label.split('\n').map((line, li) => (
                      <text
                        key={li}
                        x="375"
                        y={svc.y + 30 + li * 14}
                        textAnchor="middle"
                        fill="#1e293b"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="system-ui"
                      >
                        {line}
                      </text>
                    ))}
                    {/* Connection from gateway */}
                    <line
                      x1="220"
                      y1="145"
                      x2="320"
                      y2={svc.y + 35}
                      stroke={svc.color}
                      strokeWidth="1.5"
                      opacity="0.6"
                    />

                    {/* Database for each */}
                    <ellipse
                      cx={540}
                      cy={svc.y + 35}
                      rx="35"
                      ry="18"
                      fill={`${svc.color}15`}
                      stroke={svc.color}
                      strokeWidth="1.5"
                    />
                    <text
                      x="540"
                      y={svc.y + 38}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="8"
                      fontFamily="system-ui"
                    >
                      DB
                    </text>
                    <line
                      x1="430"
                      y1={svc.y + 35}
                      x2="505"
                      y2={svc.y + 35}
                      stroke={svc.color}
                      strokeWidth="1.5"
                      strokeDasharray="4,3"
                    />
                  </g>
                ))}

                {/* Message Queue */}
                <rect
                  x="640"
                  y="100"
                  width="100"
                  height="90"
                  rx="12"
                  fill="#fef3c7"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  filter="url(#archShadow)"
                />
                <text
                  x="690"
                  y="135"
                  textAnchor="middle"
                  fill="#92400e"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  Message
                </text>
                <text
                  x="690"
                  y="150"
                  textAnchor="middle"
                  fill="#92400e"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  Queue
                </text>
                <text x="690" y="172" textAnchor="middle" fill="#b45309" fontSize="16">
                  📨
                </text>

                {/* Connections to queue */}
                <line
                  x1="430"
                  y1="145"
                  x2="640"
                  y2="145"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  strokeDasharray="4,3"
                  opacity="0.5"
                />
              </g>
            )}

            {activePattern === 'serverless' && (
              <g>
                {/* Event sources */}
                {[
                  { label: 'HTTP Request', icon: '🌐', y: 30 },
                  { label: 'File Upload', icon: '📁', y: 110 },
                  { label: 'Scheduled', icon: '⏰', y: 190 },
                ].map((src, i) => (
                  <g key={i}>
                    <rect
                      x="40"
                      y={src.y}
                      width="110"
                      height="55"
                      rx="12"
                      fill="#fffbeb"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      filter="url(#archShadow)"
                    />
                    <text x="95" y={src.y + 25} textAnchor="middle" fontSize="16">
                      {src.icon}
                    </text>
                    <text
                      x="95"
                      y={src.y + 42}
                      textAnchor="middle"
                      fill="#92400e"
                      fontSize="9"
                      fontFamily="system-ui"
                    >
                      {src.label}
                    </text>
                  </g>
                ))}

                {/* Event Router */}
                <rect
                  x="230"
                  y="90"
                  width="100"
                  height="70"
                  rx="12"
                  fill="#fef3c7"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  filter="url(#archShadow)"
                />
                <text
                  x="280"
                  y="120"
                  textAnchor="middle"
                  fill="#92400e"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  Event
                </text>
                <text
                  x="280"
                  y="138"
                  textAnchor="middle"
                  fill="#92400e"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  Router
                </text>

                {/* Connections to router */}
                {[57, 137, 217].map((y, i) => (
                  <line
                    key={i}
                    x1="150"
                    y1={y}
                    x2="230"
                    y2="125"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                ))}

                {/* Lambda functions */}
                {[
                  { label: 'fn_auth()', y: 25 },
                  { label: 'fn_process()', y: 100 },
                  { label: 'fn_notify()', y: 175 },
                ].map((fn, i) => (
                  <g key={i}>
                    <rect
                      x="420"
                      y={fn.y}
                      width="120"
                      height="55"
                      rx="12"
                      fill="#f0fdf4"
                      stroke="#10b981"
                      strokeWidth="2"
                      filter="url(#archShadow)"
                    />
                    <text x="480" y={fn.y + 22} textAnchor="middle" fontSize="14">
                      ⚡
                    </text>
                    <text
                      x="480"
                      y={fn.y + 40}
                      textAnchor="middle"
                      fill="#059669"
                      fontSize="10"
                      fontFamily="system-ui, monospace"
                    >
                      {fn.label}
                    </text>
                    <line
                      x1="330"
                      y1="125"
                      x2="420"
                      y2={fn.y + 27}
                      stroke="#10b981"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                  </g>
                ))}

                {/* Managed services */}
                <rect
                  x="630"
                  y="70"
                  width="130"
                  height="120"
                  rx="12"
                  fill="#f8fafc"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="6,3"
                  filter="url(#archShadow)"
                />
                <text
                  x="695"
                  y="95"
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  Managed Services
                </text>
                {['Database', 'Storage', 'Auth'].map((svc, i) => (
                  <g key={svc}>
                    <rect
                      x="645"
                      y={105 + i * 28}
                      width="100"
                      height="22"
                      rx="6"
                      fill="#e2e8f0"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <text
                      x="695"
                      y={120 + i * 28}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="9"
                      fontFamily="system-ui"
                    >
                      {svc}
                    </text>
                  </g>
                ))}

                {/* Function to services connections */}
                <line
                  x1="540"
                  y1="127"
                  x2="630"
                  y2="130"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                />
              </g>
            )}

            {activePattern === 'loadbalanced' && (
              <g>
                {/* Users */}
                <text x="60" y="135" textAnchor="middle" fontSize="40">
                  👥
                </text>
                <text
                  x="60"
                  y="165"
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="10"
                  fontFamily="system-ui"
                >
                  Traffic
                </text>

                {/* Load Balancer */}
                <rect
                  x="170"
                  y="95"
                  width="120"
                  height="75"
                  rx="12"
                  fill="#d1fae5"
                  stroke="#10b981"
                  strokeWidth="2"
                  filter="url(#archShadow)"
                />
                <text x="230" y="125" textAnchor="middle" fontSize="24">
                  ⚖️
                </text>
                <text
                  x="230"
                  y="148"
                  textAnchor="middle"
                  fill="#065f46"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  Load Balancer
                </text>

                <line x1="100" y1="130" x2="170" y2="130" stroke="#10b981" strokeWidth="2" />

                {/* Server instances */}
                {[
                  { label: 'Server 1', y: 20, load: '35%' },
                  { label: 'Server 2', y: 105, load: '40%' },
                  { label: 'Server 3', y: 190, load: '25%' },
                ].map((srv, i) => (
                  <g key={i}>
                    <rect
                      x="400"
                      y={srv.y}
                      width="130"
                      height="70"
                      rx="12"
                      fill="#f0f9ff"
                      stroke="#0ea5e9"
                      strokeWidth="2"
                      filter="url(#archShadow)"
                    />
                    <text
                      x="465"
                      y={srv.y + 25}
                      textAnchor="middle"
                      fill="#0369a1"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="system-ui"
                    >
                      {srv.label}
                    </text>
                    {/* Load bar */}
                    <rect x="420" y={srv.y + 35} width="90" height="8" rx="4" fill="#e0f2fe" />
                    <rect
                      x="420"
                      y={srv.y + 35}
                      width={parseFloat(srv.load) * 0.9}
                      height="8"
                      rx="4"
                      fill="#0ea5e9"
                    />
                    <text
                      x="465"
                      y={srv.y + 58}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="system-ui"
                    >
                      Load: {srv.load}
                    </text>
                    {/* Connection */}
                    <line
                      x1="290"
                      y1="132"
                      x2="400"
                      y2={srv.y + 35}
                      stroke="#10b981"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                  </g>
                ))}

                {/* Database */}
                <ellipse
                  cx="660"
                  cy="135"
                  rx="55"
                  ry="30"
                  fill="#ede9fe"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  filter="url(#archShadow)"
                />
                <text
                  x="660"
                  y="132"
                  textAnchor="middle"
                  fill="#5b21b6"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  Database
                </text>
                <text
                  x="660"
                  y="148"
                  textAnchor="middle"
                  fill="#7c3aed"
                  fontSize="9"
                  fontFamily="system-ui"
                >
                  Replicated
                </text>

                {[55, 140, 225].map((y, i) => (
                  <line
                    key={i}
                    x1="530"
                    y1={y}
                    x2="605"
                    y2="135"
                    stroke="#8b5cf6"
                    strokeWidth="1"
                    strokeDasharray="4,3"
                    opacity="0.5"
                  />
                ))}
              </g>
            )}
          </svg>
        </div>

        {/* Pattern info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
              <span>✅</span> Advantages
            </h4>
            <ul className="space-y-1.5">
              {pattern.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
              <span>⚠️</span> Trade-offs
            </h4>
            <ul className="space-y-1.5">
              {pattern.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-400 mt-0.5">•</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CloudArchitectureViz);
