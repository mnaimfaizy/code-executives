import React, { useState, useCallback } from 'react';

/**
 * Interactive Venn-diagram style visualization for Union & Intersection types.
 * Users toggle between Union (A | B) and Intersection (A & B) to see visually
 * which properties are included.
 */

interface TypeMember {
  name: string;
  type: string;
}

interface TypeDef {
  name: string;
  color: string;
  members: TypeMember[];
}

const TYPE_A: TypeDef = {
  name: 'User',
  color: '#818cf8',
  members: [
    { name: 'id', type: 'number' },
    { name: 'name', type: 'string' },
    { name: 'email', type: 'string' },
  ],
};

const TYPE_B: TypeDef = {
  name: 'Admin',
  color: '#f472b6',
  members: [
    { name: 'id', type: 'number' },
    { name: 'role', type: 'string' },
    { name: 'permissions', type: 'string[]' },
  ],
};

type Mode = 'union' | 'intersection';

function getShared(a: TypeDef, b: TypeDef): string[] {
  const bNames = new Set(b.members.map((m) => m.name));
  return a.members.filter((m) => bNames.has(m.name)).map((m) => m.name);
}

function getOnlyA(a: TypeDef, b: TypeDef): string[] {
  const bNames = new Set(b.members.map((m) => m.name));
  return a.members.filter((m) => !bNames.has(m.name)).map((m) => m.name);
}

const UnionIntersection2D: React.FC = () => {
  const [mode, setMode] = useState<Mode>('union');
  const [hovered, setHovered] = useState<string | null>(null);

  const shared = getShared(TYPE_A, TYPE_B);
  const onlyA = getOnlyA(TYPE_A, TYPE_B);
  const onlyB = getOnlyA(TYPE_B, TYPE_A);

  const isIncluded = useCallback(
    (memberName: string): boolean => {
      if (mode === 'union') return true; // union includes everything
      return shared.includes(memberName); // intersection = only shared
    },
    [mode, shared]
  );

  const allMembers = [
    ...TYPE_A.members.map((m) => ({ ...m, source: 'A' as const })),
    ...TYPE_B.members
      .filter((m) => !shared.includes(m.name))
      .map((m) => ({ ...m, source: 'B' as const })),
  ];

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 rounded-xl p-1 flex">
          <button
            onClick={() => setMode('union')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'union'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Union (A | B)
          </button>
          <button
            onClick={() => setMode('intersection')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'intersection'
                ? 'bg-white text-pink-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Intersection (A & B)
          </button>
        </div>
      </div>

      {/* Venn Diagram */}
      <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl border border-indigo-100 p-4 overflow-hidden">
        <svg viewBox="0 0 600 320" className="w-full h-72">
          <defs>
            <clipPath id="clip-left">
              <circle cx="220" cy="160" r="130" />
            </clipPath>
            <clipPath id="clip-right">
              <circle cx="380" cy="160" r="130" />
            </clipPath>
            <filter id="vi-shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* Left circle (Type A) */}
          <circle
            cx="220"
            cy="160"
            r="130"
            fill={TYPE_A.color}
            opacity={mode === 'intersection' ? 0.15 : 0.2}
            stroke={TYPE_A.color}
            strokeWidth="2.5"
            style={{ transition: 'all 0.5s' }}
          />
          {/* Right circle (Type B) */}
          <circle
            cx="380"
            cy="160"
            r="130"
            fill={TYPE_B.color}
            opacity={mode === 'intersection' ? 0.15 : 0.2}
            stroke={TYPE_B.color}
            strokeWidth="2.5"
            style={{ transition: 'all 0.5s' }}
          />

          {/* Intersection highlight */}
          <circle
            cx="380"
            cy="160"
            r="130"
            clipPath="url(#clip-left)"
            fill={mode === 'intersection' ? '#a78bfa' : '#d8b4fe'}
            opacity={mode === 'intersection' ? 0.45 : 0.2}
            style={{ transition: 'all 0.5s' }}
          />

          {/* Type A label */}
          <text
            x="155"
            y="55"
            textAnchor="middle"
            fill={TYPE_A.color}
            fontSize="16"
            fontWeight="700"
          >
            {TYPE_A.name}
          </text>

          {/* Type B label */}
          <text
            x="445"
            y="55"
            textAnchor="middle"
            fill={TYPE_B.color}
            fontSize="16"
            fontWeight="700"
          >
            {TYPE_B.name}
          </text>

          {/* Only-A members */}
          {onlyA.map((name, i) => {
            const included = isIncluded(name);
            const member = TYPE_A.members.find((m) => m.name === name)!;
            return (
              <g
                key={name}
                onMouseEnter={() => setHovered(name)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x="115"
                  y={95 + i * 40}
                  width="140"
                  height="30"
                  rx="8"
                  fill={included ? (hovered === name ? TYPE_A.color : 'white') : '#f1f5f9'}
                  stroke={included ? TYPE_A.color : '#e2e8f0'}
                  strokeWidth={included ? '2' : '1'}
                  opacity={included ? 1 : 0.4}
                  filter={included ? 'url(#vi-shadow)' : 'none'}
                  style={{ transition: 'all 0.4s' }}
                />
                <text
                  x="185"
                  y={114 + i * 40}
                  textAnchor="middle"
                  fill={included ? (hovered === name ? 'white' : '#374151') : '#9ca3af'}
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="ui-monospace, monospace"
                  style={{ transition: 'all 0.3s' }}
                >
                  {name}: {member.type}
                </text>
                {!included && (
                  <line
                    x1="125"
                    y1={110 + i * 40}
                    x2="245"
                    y2={110 + i * 40}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                )}
              </g>
            );
          })}

          {/* Shared members (center) */}
          {shared.map((name, i) => {
            const member = TYPE_A.members.find((m) => m.name === name)!;
            return (
              <g
                key={name}
                onMouseEnter={() => setHovered(name)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x="230"
                  y={120 + i * 42}
                  width="140"
                  height="32"
                  rx="8"
                  fill={hovered === name ? '#a78bfa' : 'white'}
                  stroke="#a78bfa"
                  strokeWidth="2.5"
                  filter="url(#vi-shadow)"
                  style={{ transition: 'all 0.3s' }}
                />
                <text
                  x="300"
                  y={140 + i * 42}
                  textAnchor="middle"
                  fill={hovered === name ? 'white' : '#374151'}
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="ui-monospace, monospace"
                  style={{ transition: 'all 0.3s' }}
                >
                  {name}: {member.type}
                </text>
                {/* Shared badge */}
                <circle cx="365" cy={136 + i * 42} r="6" fill="#a78bfa" opacity="0.8" />
                <text
                  x="365"
                  y={139 + i * 42}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                >
                  ∩
                </text>
              </g>
            );
          })}

          {/* Only-B members */}
          {onlyB.map((name, i) => {
            const included = isIncluded(name);
            const member = TYPE_B.members.find((m) => m.name === name)!;
            return (
              <g
                key={name}
                onMouseEnter={() => setHovered(name)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x="345"
                  y={95 + i * 40}
                  width="140"
                  height="30"
                  rx="8"
                  fill={included ? (hovered === name ? TYPE_B.color : 'white') : '#f1f5f9'}
                  stroke={included ? TYPE_B.color : '#e2e8f0'}
                  strokeWidth={included ? '2' : '1'}
                  opacity={included ? 1 : 0.4}
                  filter={included ? 'url(#vi-shadow)' : 'none'}
                  style={{ transition: 'all 0.4s' }}
                />
                <text
                  x="415"
                  y={114 + i * 40}
                  textAnchor="middle"
                  fill={included ? (hovered === name ? 'white' : '#374151') : '#9ca3af'}
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="ui-monospace, monospace"
                  style={{ transition: 'all 0.3s' }}
                >
                  {name}: {member.type}
                </text>
                {!included && (
                  <line
                    x1="355"
                    y1={110 + i * 40}
                    x2="475"
                    y2={110 + i * 40}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                )}
              </g>
            );
          })}

          {/* Result type indicator */}
          <rect
            x="170"
            y="270"
            width="260"
            height="36"
            rx="18"
            fill={mode === 'union' ? '#6366f1' : '#ec4899'}
            opacity="0.9"
          />
          <text
            x="300"
            y="293"
            textAnchor="middle"
            fill="white"
            fontSize="13"
            fontWeight="700"
            fontFamily="ui-monospace, monospace"
          >
            {mode === 'union'
              ? `${TYPE_A.name} | ${TYPE_B.name}`
              : `${TYPE_A.name} & ${TYPE_B.name}`}
          </text>
        </svg>
      </div>

      {/* Result breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={`rounded-xl border p-4 transition-all ${mode === 'union' ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-200 bg-gray-50/50'}`}
        >
          <h4 className="font-semibold text-gray-900 text-sm mb-2">
            Union: {TYPE_A.name} | {TYPE_B.name}
          </h4>
          <p className="text-xs text-gray-600 mb-2">
            Contains <strong>all</strong> properties from both types. You can only access shared
            properties without narrowing.
          </p>
          <div className="flex flex-wrap gap-1">
            {allMembers.map((m) => (
              <span
                key={m.name}
                className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-mono"
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>
        <div
          className={`rounded-xl border p-4 transition-all ${mode === 'intersection' ? 'border-pink-200 bg-pink-50/50' : 'border-gray-200 bg-gray-50/50'}`}
        >
          <h4 className="font-semibold text-gray-900 text-sm mb-2">
            Intersection: {TYPE_A.name} & {TYPE_B.name}
          </h4>
          <p className="text-xs text-gray-600 mb-2">
            Must satisfy <strong>both</strong> types. Includes all properties from both — like
            merging.
          </p>
          <div className="flex flex-wrap gap-1">
            {allMembers.map((m) => (
              <span
                key={m.name}
                className="text-xs bg-white border border-pink-200 text-pink-700 px-2 py-0.5 rounded-full font-mono"
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UnionIntersection2D);
