import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const STAGES = [
  {
    id: 'plan',
    label: 'Plan',
    icon: '📋',
    color: '#6366f1',
    desc: 'Define requirements & sprint goals',
  },
  {
    id: 'code',
    label: 'Code',
    icon: '💻',
    color: '#818cf8',
    desc: 'Write & review application code',
  },
  {
    id: 'build',
    label: 'Build',
    icon: '🔨',
    color: '#3b82f6',
    desc: 'Compile, bundle & create artifacts',
  },
  { id: 'test', label: 'Test', icon: '🧪', color: '#2563eb', desc: 'Run automated test suites' },
  {
    id: 'release',
    label: 'Release',
    icon: '📦',
    color: '#10b981',
    desc: 'Tag & version for deployment',
  },
  {
    id: 'deploy',
    label: 'Deploy',
    icon: '🚀',
    color: '#059669',
    desc: 'Push to production servers',
  },
  {
    id: 'operate',
    label: 'Operate',
    icon: '⚙️',
    color: '#14b8a6',
    desc: 'Run & maintain live systems',
  },
  {
    id: 'monitor',
    label: 'Monitor',
    icon: '📊',
    color: '#0ea5e9',
    desc: 'Observe metrics & alerting',
  },
];

const DevOpsInfiniteLoop: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const reset = useCallback(() => {
    setActiveStage(0);
    setIsPlaying(false);
  }, []);

  // Generate infinity-path coordinates for 8 stages
  const cx = 400;
  const cy = 200;
  const rx = 160;
  const ry = 100;

  const getPosition = (index: number): { x: number; y: number } => {
    // Map stages around an infinity / figure-8 shape
    const t = (index / STAGES.length) * 2 * Math.PI;
    const denom = 1 + Math.sin(t) * Math.sin(t);
    const x = cx + (rx * Math.cos(t)) / denom;
    const y = cy + (ry * Math.sin(t) * Math.cos(t)) / denom;
    return { x, y };
  };

  // Draw infinity path
  const pathPoints: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const t = (i / 200) * 2 * Math.PI;
    const denom = 1 + Math.sin(t) * Math.sin(t);
    const x = cx + (rx * Math.cos(t)) / denom;
    const y = cy + (ry * Math.sin(t) * Math.cos(t)) / denom;
    pathPoints.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
  }
  pathPoints.push('Z');
  const infinityPath = pathPoints.join(' ');

  const displayStage = hoveredStage !== null ? hoveredStage : activeStage;

  return (
    <div className="w-full">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-2xl p-6 overflow-hidden">
        {/* Animated background dots */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 23) % 100}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* Title */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white mb-1">DevOps Infinite Loop</h3>
            <p className="text-sm text-slate-300">Continuous Integration & Continuous Delivery</p>
          </div>

          {/* SVG Visualization */}
          <svg
            viewBox="0 0 800 400"
            className="w-full h-auto"
            aria-label="DevOps Infinite Loop showing 8 stages: Plan, Code, Build, Test, Release, Deploy, Operate, Monitor"
          >
            <defs>
              {/* Glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* Pulse animation filter */}
              <filter id="pulse-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="devPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="opsPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#059669" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Side labels */}
            <text
              x="200"
              y="35"
              textAnchor="middle"
              fill="#818cf8"
              fontSize="14"
              fontWeight="bold"
              fontFamily="system-ui"
            >
              DEVELOPMENT
            </text>
            <text
              x="600"
              y="35"
              textAnchor="middle"
              fill="#10b981"
              fontSize="14"
              fontWeight="bold"
              fontFamily="system-ui"
            >
              OPERATIONS
            </text>

            {/* Infinity path outline */}
            <path
              d={infinityPath}
              fill="none"
              stroke="url(#devPathGrad)"
              strokeWidth="3"
              opacity="0.4"
            />

            {/* Animated moving dot along path */}
            <circle r="5" fill="#a5b4fc" opacity="0.8">
              <animateMotion dur="8s" repeatCount="indefinite" path={infinityPath} />
            </circle>
            <circle r="3" fill="#c4b5fd">
              <animateMotion dur="8s" repeatCount="indefinite" path={infinityPath} begin="-4s" />
            </circle>

            {/* Connection lines between nodes */}
            {STAGES.map((_, index) => {
              const from = getPosition(index);
              const to = getPosition((index + 1) % STAGES.length);
              const isActive = index === displayStage;
              return (
                <line
                  key={`line-${index}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isActive ? STAGES[index].color : '#475569'}
                  strokeWidth={isActive ? 3 : 1.5}
                  opacity={isActive ? 0.8 : 0.3}
                  strokeDasharray={isActive ? '' : '4,4'}
                />
              );
            })}

            {/* Stage nodes */}
            {STAGES.map((stage, index) => {
              const pos = getPosition(index);
              const isActive = index === displayStage;
              const nodeRadius = isActive ? 36 : 30;

              return (
                <g
                  key={stage.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setActiveStage(index);
                    setIsPlaying(false);
                  }}
                  onMouseEnter={() => setHoveredStage(index)}
                  onMouseLeave={() => setHoveredStage(null)}
                  role="button"
                  aria-label={`${stage.label}: ${stage.desc}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setActiveStage(index);
                      setIsPlaying(false);
                    }
                  }}
                >
                  {/* Active glow ring */}
                  {isActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeRadius + 8}
                      fill="none"
                      stroke={stage.color}
                      strokeWidth="2"
                      opacity="0.4"
                    >
                      <animate
                        attributeName="r"
                        values={`${nodeRadius + 4};${nodeRadius + 12};${nodeRadius + 4}`}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.4;0.1;0.4"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Node circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius}
                    fill={isActive ? stage.color : '#1e293b'}
                    stroke={isActive ? stage.color : '#475569'}
                    strokeWidth={isActive ? 3 : 1.5}
                    filter={isActive ? 'url(#glow)' : ''}
                    style={{ transition: 'all 0.3s ease-out' }}
                  />

                  {/* Emoji icon */}
                  <text
                    x={pos.x}
                    y={pos.y - 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isActive ? '20' : '16'}
                    style={{ transition: 'font-size 0.3s ease' }}
                  >
                    {stage.icon}
                  </text>

                  {/* Label */}
                  <text
                    x={pos.x}
                    y={pos.y + 16}
                    textAnchor="middle"
                    fill={isActive ? '#ffffff' : '#94a3b8'}
                    fontSize="10"
                    fontWeight={isActive ? 'bold' : 'normal'}
                    fontFamily="system-ui"
                  >
                    {stage.label}
                  </text>
                </g>
              );
            })}

            {/* Center hub */}
            <rect
              x="360"
              y="175"
              width="80"
              height="50"
              rx="10"
              fill="#1e293b"
              stroke="#6366f1"
              strokeWidth="1.5"
            />
            <text
              x="400"
              y="196"
              textAnchor="middle"
              fill="#a5b4fc"
              fontSize="9"
              fontWeight="bold"
              fontFamily="system-ui"
            >
              CI/CD
            </text>
            <text
              x="400"
              y="210"
              textAnchor="middle"
              fill="#64748b"
              fontSize="7"
              fontFamily="system-ui"
            >
              Pipeline
            </text>
          </svg>

          {/* Active stage detail card */}
          <div
            className="mt-4 bg-slate-800/60 backdrop-blur rounded-xl p-4 border transition-all duration-300"
            style={{ borderColor: STAGES[displayStage].color + '40' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{STAGES[displayStage].icon}</span>
              <div>
                <h4 className="text-white font-bold">{STAGES[displayStage].label}</h4>
                <p className="text-slate-300 text-sm">{STAGES[displayStage].desc}</p>
              </div>
              <div
                className="ml-auto text-xs font-mono px-3 py-1 rounded-full"
                style={{
                  backgroundColor: STAGES[displayStage].color + '20',
                  color: STAGES[displayStage].color,
                }}
              >
                Step {displayStage + 1}/8
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors text-sm"
          aria-label="Reset animation"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={() => setActiveStage((prev) => (prev + 1) % STAGES.length)}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors text-sm"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default React.memo(DevOpsInfiniteLoop);
