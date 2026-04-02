import React, { useState, useEffect, useCallback } from 'react';

interface EventLoopVizProps {
  className?: string;
}

interface Task {
  id: string;
  label: string;
  type: 'timer' | 'io' | 'check' | 'close' | 'microtask' | 'request';
  color: string;
}

const PHASES = [
  { name: 'Timers', color: '#6366f1', description: 'setTimeout / setInterval callbacks' },
  { name: 'Pending', color: '#8b5cf6', description: 'System-level I/O callbacks' },
  { name: 'Poll', color: '#06b6d4', description: 'Retrieve new I/O events' },
  { name: 'Check', color: '#10b981', description: 'setImmediate() callbacks' },
  { name: 'Close', color: '#f59e0b', description: 'Socket close events' },
];

const MICROTASK_COLOR = '#ec4899';

const EventLoopViz: React.FC<EventLoopVizProps> = ({ className = '' }) => {
  const [activePhase, setActivePhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waiterAngle, setWaiterAngle] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [microtaskQueue, setMicrotaskQueue] = useState<Task[]>([]);
  const [processingMicrotask, setProcessingMicrotask] = useState(false);
  const [speed, setSpeed] = useState(1);

  const addSampleTasks = useCallback(() => {
    const sampleTasks: Task[] = [
      { id: 't1', label: 'setTimeout(cb, 100)', type: 'timer', color: PHASES[0].color },
      { id: 't2', label: 'fs.readFile()', type: 'io', color: PHASES[2].color },
      { id: 't3', label: 'setImmediate(cb)', type: 'check', color: PHASES[3].color },
      { id: 't4', label: 'socket.on("close")', type: 'close', color: PHASES[4].color },
    ];
    const sampleMicrotasks: Task[] = [
      { id: 'm1', label: 'Promise.resolve()', type: 'microtask', color: MICROTASK_COLOR },
      { id: 'm2', label: 'process.nextTick()', type: 'microtask', color: MICROTASK_COLOR },
    ];
    setTasks(sampleTasks);
    setMicrotaskQueue(sampleMicrotasks);
    setCompletedTasks([]);
    setActivePhase(0);
    setProcessingMicrotask(false);
  }, []);

  useEffect(() => {
    addSampleTasks();
  }, [addSampleTasks]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setWaiterAngle((prev) => {
        const target = activePhase * 72;
        const diff = target - (prev % 360);
        if (Math.abs(diff) < 2) return target;
        return prev + (diff > 0 ? 3 : -3);
      });

      if (processingMicrotask) {
        if (microtaskQueue.length > 0) {
          const processed = microtaskQueue[0];
          setMicrotaskQueue((prev) => prev.slice(1));
          setCompletedTasks((prev) => [...prev, processed.id]);
        } else {
          setProcessingMicrotask(false);
        }
        return;
      }

      // Check if current phase has tasks
      const phaseTypes: Record<number, string> = {
        0: 'timer',
        1: 'io',
        2: 'io',
        3: 'check',
        4: 'close',
      };
      const currentType = phaseTypes[activePhase];
      const phaseTask = tasks.find((t) => t.type === currentType && !completedTasks.includes(t.id));

      if (phaseTask) {
        setCompletedTasks((prev) => [...prev, phaseTask.id]);
        // After completing a phase task, check microtasks
        if (microtaskQueue.length > 0) {
          setProcessingMicrotask(true);
        }
      } else {
        // Move to next phase
        setActivePhase((prev) => (prev + 1) % 5);
        if (microtaskQueue.length > 0) {
          setProcessingMicrotask(true);
        }
      }
    }, 1200 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, activePhase, tasks, completedTasks, microtaskQueue, processingMicrotask, speed]);

  const reset = () => {
    setIsPlaying(false);
    addSampleTasks();
    setWaiterAngle(0);
  };

  // Geometry for the circular phases
  const cx = 320;
  const cy = 210;
  const radius = 130;

  const getPhasePosition = (index: number) => {
    const angle = (index * 72 - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const waiterPos = (() => {
    const angle = ((waiterAngle * 72) / 72 - 90) * (Math.PI / 180);
    return {
      x: cx + (radius - 40) * Math.cos(angle),
      y: cy + (radius - 40) * Math.sin(angle),
    };
  })();

  return (
    <div className={`relative w-full ${className}`}>
      <div
        style={{
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated bg particles */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            opacity: 0.15,
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
                borderRadius: '50%',
                background: PHASES[i % 5].color,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `floatParticle ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <svg viewBox="0 0 640 440" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
          <defs>
            {/* Glow filters */}
            <filter id="el-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="el-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Phase gradients */}
            {PHASES.map((phase, i) => (
              <linearGradient key={i} id={`phase-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={phase.color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={phase.color} stopOpacity="0.6" />
              </linearGradient>
            ))}
            <radialGradient id="center-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="microtask-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={MICROTASK_COLOR} stopOpacity="0.9" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Title */}
          <text x={cx} y={30} textAnchor="middle" fill="white" fontSize="18" fontWeight="700">
            ⚡ Node.js Event Loop Architecture
          </text>

          {/* Center glow */}
          <circle cx={cx} cy={cy} r={60} fill="url(#center-grad)" />

          {/* Orbit ring */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
            strokeDasharray="8,4"
          />

          {/* Phase connection arcs */}
          {PHASES.map((_, i) => {
            const start = getPhasePosition(i);
            const end = getPhasePosition((i + 1) % 5);
            return (
              <line
                key={`conn-${i}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={activePhase === i ? PHASES[i].color : 'rgba(255,255,255,0.08)'}
                strokeWidth={activePhase === i ? 3 : 1}
                strokeDasharray={activePhase === i ? '0' : '4,4'}
                style={{
                  transition: 'all 0.5s ease',
                  filter: activePhase === i ? 'url(#el-glow)' : 'none',
                }}
              />
            );
          })}

          {/* Phase nodes */}
          {PHASES.map((phase, i) => {
            const pos = getPhasePosition(i);
            const isActive = activePhase === i;
            const hasTask = tasks.some(
              (t) =>
                !completedTasks.includes(t.id) &&
                ((i === 0 && t.type === 'timer') ||
                  (i === 1 && t.type === 'io') ||
                  (i === 2 && t.type === 'io') ||
                  (i === 3 && t.type === 'check') ||
                  (i === 4 && t.type === 'close'))
            );

            return (
              <g key={i} style={{ cursor: 'pointer' }} onClick={() => setActivePhase(i)}>
                {/* Pulse ring for active */}
                {isActive && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={38}
                    fill="none"
                    stroke={phase.color}
                    strokeWidth="2"
                    opacity="0.4"
                    style={{ animation: 'pulse-ring 1.5s ease-out infinite' }}
                  />
                )}
                {/* Node background */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isActive ? 34 : 30}
                  fill={`url(#phase-grad-${i})`}
                  stroke={isActive ? 'white' : 'rgba(255,255,255,0.2)'}
                  strokeWidth={isActive ? 3 : 1}
                  filter={isActive ? 'url(#el-glow-strong)' : 'none'}
                  style={{ transition: 'all 0.4s ease' }}
                />
                {/* Phase name */}
                <text
                  x={pos.x}
                  y={pos.y - 2}
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="700"
                >
                  {phase.name}
                </text>
                {/* Phase number */}
                <text
                  x={pos.x}
                  y={pos.y + 14}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="9"
                >
                  Phase {i + 1}
                </text>
                {/* Task indicator */}
                {hasTask && (
                  <circle
                    cx={pos.x + 22}
                    cy={pos.y - 22}
                    r={6}
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth="2"
                    style={{ animation: 'pulse-ring 1s infinite' }}
                  />
                )}
              </g>
            );
          })}

          {/* Waiter (Event Loop cursor) */}
          <g filter="url(#el-glow)" style={{ transition: 'transform 0.5s ease' }}>
            <circle
              cx={waiterPos.x}
              cy={waiterPos.y}
              r={14}
              fill="#fbbf24"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={waiterPos.x}
              y={waiterPos.y + 5}
              textAnchor="middle"
              fontSize="14"
              fill="white"
            >
              🤖
            </text>
          </g>

          {/* Center label */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="13" fontWeight="600">
            Event Loop
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">
            Single Thread
          </text>

          {/* Microtask Queue (VIP section) */}
          <g>
            <rect
              x={490}
              y={60}
              width={140}
              height={microtaskQueue.length > 0 ? 80 + microtaskQueue.length * 22 : 80}
              rx={12}
              fill={processingMicrotask ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.05)'}
              stroke={processingMicrotask ? MICROTASK_COLOR : 'rgba(255,255,255,0.15)'}
              strokeWidth={processingMicrotask ? 2 : 1}
              style={{ transition: 'all 0.3s ease' }}
            />
            <text
              x={560}
              y={82}
              textAnchor="middle"
              fill={MICROTASK_COLOR}
              fontSize="10"
              fontWeight="700"
            >
              ⭐ VIP QUEUE
            </text>
            <text x={560} y={96} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8">
              Microtasks
            </text>
            {microtaskQueue.map((task, i) => (
              <g key={task.id}>
                <rect
                  x={500}
                  y={108 + i * 22}
                  width={120}
                  height={18}
                  rx={4}
                  fill="url(#microtask-grad)"
                  opacity={0.8}
                />
                <text
                  x={560}
                  y={120 + i * 22}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="500"
                >
                  {task.label}
                </text>
              </g>
            ))}
            {microtaskQueue.length === 0 && (
              <text x={560} y={120} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">
                (empty)
              </text>
            )}
          </g>

          {/* Thread Pool (Kitchen) */}
          <g>
            <rect
              x={10}
              y={340}
              width={200}
              height={90}
              rx={12}
              fill="rgba(255,255,255,0.05)"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
            />
            <text x={110} y={362} textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="700">
              🏭 libuv Thread Pool
            </text>
            {[0, 1, 2, 3].map((i) => (
              <g key={`thread-${i}`}>
                <rect
                  x={20 + i * 48}
                  y={374}
                  width={40}
                  height={44}
                  rx={6}
                  fill={i < 2 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)'}
                  stroke={i < 2 ? '#06b6d4' : 'rgba(255,255,255,0.1)'}
                  strokeWidth="1"
                />
                <text
                  x={40 + i * 48}
                  y={394}
                  textAnchor="middle"
                  fill={i < 2 ? '#06b6d4' : 'rgba(255,255,255,0.4)'}
                  fontSize="8"
                  fontWeight="600"
                >
                  T{i + 1}
                </text>
                <text
                  x={40 + i * 48}
                  y={410}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="7"
                >
                  {i < 2 ? 'Busy' : 'Idle'}
                </text>
              </g>
            ))}
          </g>

          {/* Callback Queue */}
          <g>
            <rect
              x={430}
              y={340}
              width={200}
              height={90}
              rx={12}
              fill="rgba(255,255,255,0.05)"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
            />
            <text x={530} y={362} textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">
              📬 Callback Queue
            </text>
            {tasks
              .filter((t) => !completedTasks.includes(t.id))
              .slice(0, 3)
              .map((task, i) => (
                <g key={task.id}>
                  <rect
                    x={440}
                    y={372 + i * 18}
                    width={180}
                    height={15}
                    rx={4}
                    fill={`${task.color}33`}
                    stroke={task.color}
                    strokeWidth="0.5"
                  />
                  <text x={530} y={383 + i * 18} textAnchor="middle" fill="white" fontSize="8">
                    {task.label}
                  </text>
                </g>
              ))}
          </g>

          {/* Phase description tooltip */}
          <g>
            <rect
              x={220}
              y={395}
              width={200}
              height={40}
              rx={8}
              fill="rgba(255,255,255,0.08)"
              stroke={PHASES[activePhase].color}
              strokeWidth="1"
            />
            <text
              x={320}
              y={413}
              textAnchor="middle"
              fill={PHASES[activePhase].color}
              fontSize="9"
              fontWeight="600"
            >
              {PHASES[activePhase].name} Phase
            </text>
            <text x={320} y={427} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8">
              {PHASES[activePhase].description}
            </text>
          </g>
        </svg>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pb-4 px-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
              color: isPlaying ? '#fca5a5' : '#a5b4fc',
              border: `1px solid ${isPlaying ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}`,
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            ↺ Reset
          </button>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% { r: 34; opacity: 0.6; }
          100% { r: 48; opacity: 0; }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.3); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default EventLoopViz;
