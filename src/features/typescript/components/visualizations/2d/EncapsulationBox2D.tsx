import React, { useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Legacy type exports (kept for backward compatibility)             */
/* ------------------------------------------------------------------ */
export interface ClassMember {
  name: string;
  type: 'property' | 'method';
  visibility: 'public' | 'private' | 'protected';
  value?: string;
  signature?: string;
}

export interface EncapsulationClass {
  name: string;
  publicMembers: ClassMember[];
  privateMembers: ClassMember[];
  protectedMembers: ClassMember[];
}

export type EncapsulationBox2DProps = Record<string, never>;
export interface EncapsulationBox2DHandle {
  toggleVisibility(v: 'public' | 'private' | 'protected'): void;
  highlightMember(name: string): void;
  reset(): void;
}

/* ------------------------------------------------------------------ */
/*  Built-in example data                                             */
/* ------------------------------------------------------------------ */
interface Member {
  name: string;
  kind: 'property' | 'method';
  typeOrSig: string;
}

interface Example {
  label: string;
  className: string;
  publicMembers: Member[];
  protectedMembers: Member[];
  privateMembers: Member[];
}

const EXAMPLES: Example[] = [
  {
    label: 'Bank Account',
    className: 'BankAccount',
    publicMembers: [
      { name: 'accountNumber', kind: 'property', typeOrSig: 'string' },
      { name: 'deposit', kind: 'method', typeOrSig: '(amount: number): void' },
      { name: 'withdraw', kind: 'method', typeOrSig: '(amount: number): boolean' },
      { name: 'getBalance', kind: 'method', typeOrSig: '(): number' },
    ],
    protectedMembers: [
      { name: 'minimumBalance', kind: 'property', typeOrSig: 'number' },
      { name: 'calculateInterest', kind: 'method', typeOrSig: '(): number' },
    ],
    privateMembers: [
      { name: 'balance', kind: 'property', typeOrSig: 'number' },
      { name: 'transactionHistory', kind: 'property', typeOrSig: 'Transaction[]' },
      { name: 'validateAmount', kind: 'method', typeOrSig: '(amount: number): boolean' },
    ],
  },
  {
    label: 'User Account',
    className: 'UserAccount',
    publicMembers: [
      { name: 'username', kind: 'property', typeOrSig: 'string' },
      { name: 'login', kind: 'method', typeOrSig: '(password: string): boolean' },
      { name: 'logout', kind: 'method', typeOrSig: '(): void' },
    ],
    protectedMembers: [
      { name: 'role', kind: 'property', typeOrSig: 'Role' },
      { name: 'hasPermission', kind: 'method', typeOrSig: '(action: string): boolean' },
    ],
    privateMembers: [
      { name: 'passwordHash', kind: 'property', typeOrSig: 'string' },
      { name: 'sessions', kind: 'property', typeOrSig: 'Session[]' },
      { name: 'hashPassword', kind: 'method', typeOrSig: '(pw: string): string' },
      { name: 'verifyToken', kind: 'method', typeOrSig: '(token: string): boolean' },
    ],
  },
  {
    label: 'HTTP Client',
    className: 'HttpClient',
    publicMembers: [
      { name: 'baseURL', kind: 'property', typeOrSig: 'string' },
      { name: 'get', kind: 'method', typeOrSig: '<T>(url: string): Promise<T>' },
      { name: 'post', kind: 'method', typeOrSig: '<T>(url: string, body: unknown): Promise<T>' },
    ],
    protectedMembers: [
      { name: 'timeout', kind: 'property', typeOrSig: 'number' },
      { name: 'interceptors', kind: 'property', typeOrSig: 'Interceptor[]' },
    ],
    privateMembers: [
      { name: 'authToken', kind: 'property', typeOrSig: 'string | null' },
      { name: 'retryCount', kind: 'property', typeOrSig: 'number' },
      { name: 'refreshToken', kind: 'method', typeOrSig: '(): Promise<string>' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Visibility config                                                 */
/* ------------------------------------------------------------------ */
type Vis = 'public' | 'protected' | 'private';

const VIS_META: Record<Vis, { color: string; bg: string; border: string; activeBg: string; icon: string; label: string }> = {
  public:    { color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', activeBg: 'bg-emerald-600', icon: '🌐', label: 'Public' },
  protected: { color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   activeBg: 'bg-amber-500',   icon: '🛡️', label: 'Protected' },
  private:   { color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200',     activeBg: 'bg-red-600',     icon: '🔒', label: 'Private' },
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
const EncapsulationBox2D: React.FC = () => {
  const [exIdx, setExIdx] = useState(0);
  const [visible, setVisible] = useState<Record<Vis, boolean>>({ public: true, protected: true, private: false });
  const [selectedMember, setSelectedMember] = useState<{ vis: Vis; member: Member } | null>(null);

  const ex = EXAMPLES[exIdx];

  const toggle = useCallback((v: Vis) => {
    setVisible((prev) => ({ ...prev, [v]: !prev[v] }));
    setSelectedMember(null);
  }, []);

  const selectExample = useCallback((i: number) => {
    setExIdx(i);
    setVisible({ public: true, protected: true, private: false });
    setSelectedMember(null);
  }, []);

  const sections: { vis: Vis; title: string; members: Member[] }[] = [
    { vis: 'public',    title: 'Public Interface',       members: ex.publicMembers },
    { vis: 'protected', title: 'Protected Members',      members: ex.protectedMembers },
    { vis: 'private',   title: 'Private Implementation', members: ex.privateMembers },
  ];

  /* concentric ring radii */
  const rings: { vis: Vis; r: number }[] = [
    { vis: 'public',    r: 90 },
    { vis: 'protected', r: 64 },
    { vis: 'private',   r: 38 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            🔒 Data Encapsulation
          </h3>
          <p className="text-indigo-200 text-sm mt-0.5">
            Toggle visibility levels &bull; Click members for details
          </p>
        </div>
        {/* Example tabs */}
        <div className="flex gap-1.5">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.label}
              onClick={() => selectExample(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                i === exIdx
                  ? 'bg-white text-indigo-700 shadow'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-6 p-5">
        {/* Left: member list */}
        <div className="lg:col-span-3 space-y-4">
          {/* Class name badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-3 py-1 rounded-full">
              📦 {ex.className}
            </span>
          </div>

          {sections.map(({ vis, title, members }) => {
            const meta = VIS_META[vis];
            const isOpen = visible[vis];
            return (
              <div
                key={vis}
                className={`rounded-xl border-2 transition-all duration-300 ${
                  isOpen
                    ? `${meta.border} ${meta.bg} shadow-sm`
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                {/* Section header */}
                <button
                  onClick={() => toggle(vis)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-t-xl focus:outline-none"
                >
                  <span className={`font-bold text-sm ${isOpen ? meta.color : 'text-gray-500'}`}>
                    {meta.icon} {title}
                  </span>
                  <span className="text-xs text-gray-400">
                    {members.length} member{members.length !== 1 ? 's' : ''} &middot;{' '}
                    {isOpen ? 'visible' : 'hidden'}
                  </span>
                </button>

                {/* Members */}
                {isOpen && (
                  <ul className="px-4 pb-3 space-y-1.5">
                    {members.map((m) => {
                      const isSel =
                        selectedMember?.vis === vis && selectedMember?.member.name === m.name;
                      return (
                        <li key={m.name}>
                          <button
                            onClick={() =>
                              setSelectedMember(isSel ? null : { vis, member: m })
                            }
                            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isSel
                                ? 'bg-white shadow ring-2 ring-indigo-300'
                                : 'hover:bg-white/70'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${
                                m.kind === 'method' ? 'bg-blue-500' : 'bg-violet-500'
                              }`}
                            >
                              {m.kind === 'method' ? 'M' : 'P'}
                            </span>
                            <span className="font-mono font-semibold text-gray-800">
                              {m.name}
                            </span>
                            <span className="text-gray-400 text-xs truncate">
                              {m.kind === 'property' ? `: ${m.typeOrSig}` : m.typeOrSig}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: concentric diagram + detail */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center mt-6 lg:mt-0">
          {/* SVG concentric rings */}
          <svg viewBox="0 0 220 220" className="w-48 h-48 sm:w-56 sm:h-56">
            {rings.map(({ vis: v, r }) => {
              const meta = VIS_META[v];
              const isOn = visible[v];
              const strokeColor =
                v === 'public'
                  ? '#10B981'
                  : v === 'protected'
                    ? '#F59E0B'
                    : '#EF4444';
              const fillColor =
                v === 'private' && isOn
                  ? 'rgba(239,68,68,0.12)'
                  : 'transparent';
              return (
                <g key={v}>
                  <circle
                    cx={110}
                    cy={110}
                    r={r}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isOn ? 3 : 1.5}
                    strokeDasharray={isOn ? 'none' : '6,4'}
                    opacity={isOn ? 1 : 0.35}
                    style={{ transition: 'all 0.4s ease' }}
                  />
                  <text
                    x={110}
                    y={110 - r - 4}
                    textAnchor="middle"
                    fill={strokeColor}
                    fontSize={10}
                    fontWeight={600}
                    opacity={isOn ? 1 : 0.4}
                  >
                    {meta.label}
                  </text>
                </g>
              );
            })}
            {/* Center icon */}
            <circle cx={110} cy={110} r={16} fill="#6366F1" />
            <text x={110} y={115} textAnchor="middle" fill="white" fontSize={12} fontWeight={700}>
              📦
            </text>
          </svg>

          {/* Selected member detail card */}
          {selectedMember ? (
            <div className="mt-4 w-full max-w-xs bg-white border border-indigo-200 rounded-xl shadow-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                  selectedMember.vis === 'public'
                    ? 'bg-emerald-600'
                    : selectedMember.vis === 'protected'
                      ? 'bg-amber-500'
                      : 'bg-red-600'
                }`}>
                  {VIS_META[selectedMember.vis].label}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  selectedMember.member.kind === 'method'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-violet-100 text-violet-700'
                }`}>
                  {selectedMember.member.kind}
                </span>
              </div>
              <p className="font-mono font-bold text-gray-900 text-sm">
                {selectedMember.member.name}
              </p>
              <p className="text-gray-500 text-xs font-mono mt-1">
                {selectedMember.member.kind === 'property'
                  ? `Type: ${selectedMember.member.typeOrSig}`
                  : selectedMember.member.typeOrSig}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                {selectedMember.vis === 'public' && 'Accessible from anywhere — this is the class\'s external API.'}
                {selectedMember.vis === 'protected' && 'Accessible within the class and its subclasses only.'}
                {selectedMember.vis === 'private' && 'Accessible only within this class — implementation detail.'}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-gray-400 text-xs text-center">
              Click a member to see details
            </p>
          )}
        </div>
      </div>

      {/* Toggle bar */}
      <div className="flex items-center justify-center gap-3 px-5 pb-5">
        {(['public', 'protected', 'private'] as Vis[]).map((v) => {
          const meta = VIS_META[v];
          return (
            <button
              key={v}
              onClick={() => toggle(v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                visible[v]
                  ? `${meta.activeBg} text-white`
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {meta.icon} {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(EncapsulationBox2D);
