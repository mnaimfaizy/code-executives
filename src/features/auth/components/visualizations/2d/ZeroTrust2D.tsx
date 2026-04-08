import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, XCircle, AlertTriangle, Eye } from 'lucide-react';

interface AccessRequest {
  id: number;
  user: string;
  resource: string;
  device: string;
  location: string;
  risk: 'low' | 'medium' | 'high';
  checks: { name: string; passed: boolean }[];
  decision: 'allow' | 'deny' | 'step-up';
}

const ZeroTrust2D: React.FC = () => {
  const [activeRequest, setActiveRequest] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [checkIndex, setCheckIndex] = useState(-1);

  const requests: AccessRequest[] = [
    {
      id: 1,
      user: 'Alice (Engineer)',
      resource: 'Source Code Repo',
      device: 'Corp Laptop',
      location: 'Office WiFi',
      risk: 'low',
      checks: [
        { name: 'Identity verified (SSO + Passkey)', passed: true },
        { name: 'Device compliance (patched, encrypted)', passed: true },
        { name: 'Network context (corporate VPN)', passed: true },
        { name: 'Behavioral baseline (normal hours)', passed: true },
        { name: 'Least-privilege role check', passed: true },
      ],
      decision: 'allow',
    },
    {
      id: 2,
      user: 'Bob (Contractor)',
      resource: 'Prod Database',
      device: 'Personal Laptop',
      location: 'Coffee Shop WiFi',
      risk: 'high',
      checks: [
        { name: 'Identity verified (Password + SMS)', passed: true },
        { name: 'Device compliance (unmanaged)', passed: false },
        { name: 'Network context (untrusted)', passed: false },
        { name: 'Behavioral baseline (unusual time)', passed: false },
        { name: 'Least-privilege role check', passed: false },
      ],
      decision: 'deny',
    },
    {
      id: 3,
      user: 'Carol (Admin)',
      resource: 'Admin Dashboard',
      device: 'Corp Laptop',
      location: 'Home VPN',
      risk: 'medium',
      checks: [
        { name: 'Identity verified (SSO + TOTP)', passed: true },
        { name: 'Device compliance (patched, encrypted)', passed: true },
        { name: 'Network context (home VPN)', passed: true },
        { name: 'Behavioral baseline (new location)', passed: false },
        { name: 'Least-privilege role check', passed: true },
      ],
      decision: 'step-up',
    },
  ];

  const req = requests[activeRequest];

  useEffect(() => {
    setAnimating(true);
    setCheckIndex(-1);
    let i = -1;
    const timer = setInterval(() => {
      i++;
      if (i >= req.checks.length) {
        setAnimating(false);
        clearInterval(timer);
        return;
      }
      setCheckIndex(i);
    }, 600);
    return () => clearInterval(timer);
  }, [activeRequest, req.checks.length]);

  const riskColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
  const decisionColors = { allow: '#10b981', deny: '#ef4444', 'step-up': '#f59e0b' };
  const decisionLabels = {
    allow: 'ACCESS GRANTED',
    deny: 'ACCESS DENIED',
    'step-up': 'STEP-UP REQUIRED',
  };
  const decisionIcons = {
    allow: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    deny: <XCircle className="w-5 h-5 text-red-600" />,
    'step-up': <AlertTriangle className="w-5 h-5 text-amber-600" />,
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Eye className="w-5 h-5 text-amber-600" />
        Zero Trust Access Decision Engine
      </h3>

      {/* Scenario selector */}
      <div className="grid grid-cols-3 gap-2">
        {requests.map((r, i) => (
          <button
            key={r.id}
            onClick={() => setActiveRequest(i)}
            className={`p-3 rounded-xl border-2 text-left transition-all ${
              activeRequest === i
                ? `border-amber-500 bg-amber-50 shadow-md`
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-xs font-bold text-gray-900">{r.user}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">→ {r.resource}</div>
            <div className="flex items-center gap-1 mt-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: riskColors[r.risk] }}
              />
              <span className="text-[10px] font-semibold" style={{ color: riskColors[r.risk] }}>
                {r.risk.toUpperCase()} RISK
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Zero Trust Evaluation Visualization */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <svg viewBox="0 0 800 300" className="w-full" aria-label="Zero Trust evaluation flow">
          {/* Request entry */}
          <g>
            <rect
              x={20}
              y={100}
              width={120}
              height={80}
              rx={12}
              fill="#f59e0b15"
              stroke="#f59e0b"
              strokeWidth={2}
            />
            <text x={80} y={125} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#92400e">
              Access Request
            </text>
            <text x={80} y={142} textAnchor="middle" fontSize={8} fill="#78350f">
              {req.user}
            </text>
            <text x={80} y={155} textAnchor="middle" fontSize={7} fill="#92400e">
              → {req.resource}
            </text>
            <text x={80} y={168} textAnchor="middle" fontSize={7} fill="#92400e">
              {req.device}
            </text>
          </g>

          {/* Arrow to policy engine */}
          <line
            x1={142}
            y1={140}
            x2={180}
            y2={140}
            stroke="#d1d5db"
            strokeWidth={2}
            markerEnd="url(#zt-arrow)"
          />
          <defs>
            <marker id="zt-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="#6b7280" />
            </marker>
          </defs>

          {/* Policy checks area */}
          <rect
            x={185}
            y={40}
            width={380}
            height={220}
            rx={12}
            fill="#f9fafb"
            stroke="#e5e7eb"
            strokeWidth={1.5}
          />
          <text x={375} y={62} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#111827">
            Policy Decision Point (PDP)
          </text>

          {/* Individual checks */}
          {req.checks.map((check, i) => {
            const y = 78 + i * 36;
            const revealed = i <= checkIndex;
            const isAnimatingNow = i === checkIndex && animating;

            return (
              <g key={i} opacity={revealed ? 1 : 0.2} className="transition-opacity duration-400">
                <rect
                  x={200}
                  y={y}
                  width={350}
                  height={28}
                  rx={6}
                  fill={revealed ? (check.passed ? '#ecfdf5' : '#fef2f2') : '#f3f4f6'}
                  stroke={revealed ? (check.passed ? '#10b981' : '#ef4444') : '#d1d5db'}
                  strokeWidth={isAnimatingNow ? 2.5 : 1.5}
                />
                {/* Check icon */}
                {revealed && (
                  <text x={215} y={y + 18} fontSize={12}>
                    {check.passed ? '✅' : '❌'}
                  </text>
                )}
                <text
                  x={235}
                  y={y + 18}
                  fontSize={9}
                  fontWeight={revealed ? 'bold' : 'normal'}
                  fill={revealed ? (check.passed ? '#065f46' : '#991b1b') : '#9ca3af'}
                >
                  {check.name}
                </text>
                {/* Animated pulse on current */}
                {isAnimatingNow && (
                  <rect
                    x={198}
                    y={y - 2}
                    width={354}
                    height={32}
                    rx={8}
                    fill="none"
                    stroke={check.passed ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    opacity={0.5}
                  >
                    <animate
                      attributeName="opacity"
                      values="0.5;0;0.5"
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                  </rect>
                )}
              </g>
            );
          })}

          {/* Arrow to decision */}
          <line
            x1={567}
            y1={140}
            x2={610}
            y2={140}
            stroke="#d1d5db"
            strokeWidth={2}
            markerEnd="url(#zt-arrow)"
          />

          {/* Decision box */}
          <g opacity={!animating ? 1 : 0.3} className="transition-opacity duration-500">
            <rect
              x={615}
              y={90}
              width={160}
              height={100}
              rx={14}
              fill={`${decisionColors[req.decision]}15`}
              stroke={decisionColors[req.decision]}
              strokeWidth={3}
            />
            <text x={695} y={125} textAnchor="middle" fontSize={24}>
              {req.decision === 'allow' ? '✅' : req.decision === 'deny' ? '🚫' : '⚠️'}
            </text>
            <text
              x={695}
              y={148}
              textAnchor="middle"
              fontSize={11}
              fontWeight="bold"
              fill={decisionColors[req.decision]}
            >
              {decisionLabels[req.decision]}
            </text>
            {req.decision === 'step-up' && (
              <text x={695} y={170} textAnchor="middle" fontSize={8} fill="#92400e">
                Require biometric re-auth
              </text>
            )}
          </g>
        </svg>
      </div>

      {/* Decision detail */}
      <div
        className={`rounded-xl border p-4 flex items-start gap-3`}
        style={{
          backgroundColor: `${decisionColors[req.decision]}10`,
          borderColor: `${decisionColors[req.decision]}40`,
        }}
      >
        {decisionIcons[req.decision]}
        <div>
          <h4 className="font-bold text-sm text-gray-900">
            {decisionLabels[req.decision]}: {req.user} → {req.resource}
          </h4>
          <p className="text-xs text-gray-700 mt-1">
            {req.decision === 'allow' &&
              'All trust signals verified — device compliant, identity strong, behavior normal. Access granted with continuous monitoring.'}
            {req.decision === 'deny' &&
              'Multiple trust signals failed — unmanaged device, untrusted network, insufficient role permissions. Request blocked.'}
            {req.decision === 'step-up' &&
              'Most signals verified but behavioral anomaly detected (new location). Requiring additional biometric authentication before granting access.'}
          </p>
        </div>
      </div>

      {/* Core principles */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <Shield className="w-5 h-5 text-gray-600 mx-auto mb-1" />
          <h5 className="font-bold text-gray-800">Never Trust</h5>
          <p className="text-gray-500 mt-0.5">Verify every request, always</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <AlertTriangle className="w-5 h-5 text-gray-600 mx-auto mb-1" />
          <h5 className="font-bold text-gray-800">Assume Breach</h5>
          <p className="text-gray-500 mt-0.5">Minimize blast radius</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <Eye className="w-5 h-5 text-gray-600 mx-auto mb-1" />
          <h5 className="font-bold text-gray-800">Verify Explicitly</h5>
          <p className="text-gray-500 mt-0.5">Multi-signal continuous eval</p>
        </div>
      </div>
    </div>
  );
};

export default ZeroTrust2D;
