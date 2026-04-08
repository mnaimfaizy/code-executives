import React, { useState } from 'react';
import { Shield, AlertTriangle, Lock, Fingerprint, Key, Smartphone } from 'lucide-react';

interface AuthMethod {
  name: string;
  security: number;
  usability: number;
  phishResistant: boolean;
  factors: string[];
  weaknesses: string[];
  color: string;
}

const AuthMethodComparison2D: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);

  const methods: AuthMethod[] = [
    {
      name: 'Password Only',
      security: 15,
      usability: 90,
      phishResistant: false,
      factors: ['Knowledge'],
      weaknesses: ['Brute force', 'Credential stuffing', 'Phishing', 'Reuse'],
      color: '#ef4444',
    },
    {
      name: 'Password + SMS OTP',
      security: 40,
      usability: 70,
      phishResistant: false,
      factors: ['Knowledge', 'Possession'],
      weaknesses: ['SIM swap', 'SS7 interception', 'Social engineering'],
      color: '#f97316',
    },
    {
      name: 'Password + TOTP App',
      security: 55,
      usability: 60,
      phishResistant: false,
      factors: ['Knowledge', 'Possession'],
      weaknesses: ['AiTM proxy attacks', 'MFA fatigue'],
      color: '#eab308',
    },
    {
      name: 'Push Notification MFA',
      security: 65,
      usability: 75,
      phishResistant: false,
      factors: ['Knowledge', 'Possession'],
      weaknesses: ['MFA fatigue / prompt bombing', 'AiTM'],
      color: '#84cc16',
    },
    {
      name: 'FIDO2 / Passkeys',
      security: 95,
      usability: 85,
      phishResistant: true,
      factors: ['Possession', 'Inherence'],
      weaknesses: ['Device loss (mitigated by sync)', 'Initial setup'],
      color: '#10b981',
    },
  ];

  const barWidth = 600;
  const barStartX = 150;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Lock className="w-5 h-5 text-amber-600" />
        Authentication Method Security Comparison
      </h3>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <svg viewBox="0 0 800 360" className="w-full" aria-label="Auth method comparison chart">
          {/* Title */}
          <text x={400} y={25} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#111827">
            Security Strength Spectrum
          </text>

          {/* Gradient background bar */}
          <defs>
            <linearGradient id="sec-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <rect
            x={barStartX}
            y={40}
            width={barWidth}
            height={250}
            rx={8}
            fill="url(#sec-gradient)"
          />

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((v) => {
            const x = barStartX + (v / 100) * barWidth;
            return (
              <g key={v}>
                <line
                  x1={x}
                  y1={45}
                  x2={x}
                  y2={285}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                <text x={x} y={300} textAnchor="middle" fontSize={9} fill="#9ca3af">
                  {v}%
                </text>
              </g>
            );
          })}

          {/* Labels */}
          <text
            x={barStartX}
            y={315}
            textAnchor="start"
            fontSize={9}
            fill="#ef4444"
            fontWeight="bold"
          >
            Weak
          </text>
          <text
            x={barStartX + barWidth}
            y={315}
            textAnchor="end"
            fontSize={9}
            fill="#10b981"
            fontWeight="bold"
          >
            Strong
          </text>

          {/* Method bars */}
          {methods.map((method, i) => {
            const y = 55 + i * 48;
            const secWidth = (method.security / 100) * barWidth;
            const isSelected = selected === i;

            return (
              <g
                key={i}
                onClick={() => setSelected(isSelected ? null : i)}
                className="cursor-pointer"
                role="button"
                aria-label={`${method.name}: ${method.security}% security`}
              >
                {/* Label */}
                <text
                  x={barStartX - 8}
                  y={y + 20}
                  textAnchor="end"
                  fontSize={10}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fill={isSelected ? method.color : '#374151'}
                >
                  {method.name}
                </text>

                {/* Bar background */}
                <rect
                  x={barStartX}
                  y={y + 6}
                  width={barWidth}
                  height={26}
                  rx={6}
                  fill="#f3f4f6"
                  stroke={isSelected ? method.color : 'transparent'}
                  strokeWidth={isSelected ? 2 : 0}
                />

                {/* Security bar */}
                <rect
                  x={barStartX}
                  y={y + 6}
                  width={secWidth}
                  height={26}
                  rx={6}
                  fill={method.color}
                  opacity={isSelected ? 1 : 0.7}
                  className="transition-all duration-300"
                />

                {/* Score label */}
                <text
                  x={barStartX + secWidth + 6}
                  y={y + 24}
                  fontSize={10}
                  fontWeight="bold"
                  fill={method.color}
                >
                  {method.security}%
                </text>

                {/* Phish-resistant badge */}
                {method.phishResistant && (
                  <g transform={`translate(${barStartX + secWidth - 28}, ${y + 9})`}>
                    <rect x={0} y={0} width={20} height={20} rx={4} fill="white" opacity={0.9} />
                    <text x={10} y={15} textAnchor="middle" fontSize={12}>
                      🛡️
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Legend */}
          <g transform="translate(150, 330)">
            <rect x={0} y={0} width={12} height={12} rx={2} fill="#10b981" />
            <text x={16} y={10} fontSize={9} fill="#374151">
              Phish-Resistant
            </text>
            <text x={130} y={10} fontSize={9} fill="#374151">
              🛡️ = Phishing-proof
            </text>
            <text x={280} y={10} fontSize={9} fill="#6b7280">
              Click a method for details
            </text>
          </g>
        </svg>
      </div>

      {/* Detail panel */}
      {selected !== null && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              {methods[selected].name === 'FIDO2 / Passkeys' ? (
                <Fingerprint className="w-4 h-4 text-green-600" />
              ) : methods[selected].name.includes('SMS') ? (
                <Smartphone className="w-4 h-4 text-orange-600" />
              ) : methods[selected].name.includes('Push') ? (
                <Shield className="w-4 h-4 text-lime-600" />
              ) : (
                <Key className="w-4 h-4" style={{ color: methods[selected].color }} />
              )}
              {methods[selected].name}
            </h4>
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{
                backgroundColor: `${methods[selected].color}20`,
                color: methods[selected].color,
              }}
            >
              {methods[selected].security}% Security
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <h5 className="font-semibold text-gray-700 mb-1">Authentication Factors</h5>
              <div className="flex flex-wrap gap-1">
                {methods[selected].factors.map((f) => (
                  <span key={f} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" /> Vulnerabilities
              </h5>
              <ul className="space-y-0.5 text-gray-600">
                {methods[selected].weaknesses.map((w) => (
                  <li key={w}>• {w}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Phishing Resistant:</span>
            {methods[selected].phishResistant ? (
              <span className="text-green-700 font-bold">Yes — Cryptographic origin-bound</span>
            ) : (
              <span className="text-red-700 font-bold">
                No — Susceptible to credential interception
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthMethodComparison2D;
