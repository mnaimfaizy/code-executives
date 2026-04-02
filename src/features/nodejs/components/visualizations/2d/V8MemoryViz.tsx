import React, { useState, useEffect } from 'react';

interface V8MemoryVizProps {
  className?: string;
}

const V8MemoryViz: React.FC<V8MemoryVizProps> = ({ className = '' }) => {
  const [gcRunning, setGcRunning] = useState(false);
  const [newSpaceUsage, setNewSpaceUsage] = useState(65);
  const [oldSpaceUsage, setOldSpaceUsage] = useState(40);
  const [gcCount, setGcCount] = useState(0);
  const [heapUsed, setHeapUsed] = useState(128);
  const [tickCount, setTickCount] = useState(0);

  // Objects in new space
  const [newObjects, setNewObjects] = useState([
    { id: 1, label: 'req.body', age: 0, alive: true },
    { id: 2, label: 'temp[]', age: 0, alive: true },
    { id: 3, label: 'callback', age: 1, alive: false },
    { id: 4, label: 'res.json', age: 0, alive: true },
    { id: 5, label: 'buffer', age: 2, alive: true },
    { id: 6, label: 'str concat', age: 0, alive: false },
  ]);

  // Objects in old space (long-lived)
  const [oldObjects] = useState([
    { id: 101, label: 'DB Pool', age: 50, alive: true },
    { id: 102, label: 'Cache Map', age: 45, alive: true },
    { id: 103, label: 'Config', age: 60, alive: true },
    { id: 104, label: 'Logger', age: 55, alive: true },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickCount((prev) => prev + 1);
      setNewSpaceUsage((prev) => {
        const next = prev + (Math.random() * 8 - 2);
        return Math.min(95, Math.max(20, next));
      });
      setHeapUsed((prev) => prev + Math.random() * 4 - 1.5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerMinorGC = () => {
    setGcRunning(true);
    setGcCount((prev) => prev + 1);
    setTimeout(() => {
      setNewObjects((prev) =>
        prev.map((obj) => (!obj.alive ? { ...obj, age: -1 } : { ...obj, age: obj.age + 1 }))
      );
      setNewSpaceUsage((prev) => prev * 0.4);
      setGcRunning(false);
      // Promote old objects
      setTimeout(() => {
        setNewObjects((prev) =>
          prev
            .filter((obj) => obj.alive && obj.age < 3)
            .concat([
              { id: Date.now(), label: 'new req', age: 0, alive: Math.random() > 0.3 },
              { id: Date.now() + 1, label: 'temp var', age: 0, alive: Math.random() > 0.5 },
            ])
        );
      }, 500);
    }, 800);
  };

  const triggerMajorGC = () => {
    setGcRunning(true);
    setGcCount((prev) => prev + 1);
    setTimeout(() => {
      setOldSpaceUsage((prev) => prev * 0.6);
      setHeapUsed((prev) => prev * 0.65);
      setGcRunning(false);
    }, 1500);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        style={{
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #1a0a2e 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        <svg viewBox="0 0 640 460" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
          <defs>
            <linearGradient id="new-space-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="old-space-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="stack-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>
            <filter id="mem-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Title */}
          <text x={320} y={28} textAnchor="middle" fill="white" fontSize="16" fontWeight="700">
            🧠 V8 Memory Architecture &amp; Garbage Collection
          </text>
          <text x={320} y={46} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">
            Generational Hypothesis: Most objects die young
          </text>

          {/* GC pulse indicator */}
          {gcRunning && (
            <rect
              x={0}
              y={0}
              width={640}
              height={460}
              fill="rgba(239,68,68,0.05)"
              style={{ animation: 'gc-flash 0.4s ease-in-out' }}
            />
          )}

          {/* ===== STACK ===== */}
          <g>
            <rect
              x={20}
              y={65}
              width={130}
              height={200}
              rx={10}
              fill="url(#stack-grad)"
              stroke="#10b981"
              strokeWidth="1.5"
            />
            <text x={85} y={85} textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="700">
              📚 Stack
            </text>
            <text x={85} y={98} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
              Static/Primitives
            </text>

            {/* Stack frames */}
            {['main()', 'handleReq()', 'parseJSON()', 'validate()'].map((frame, i) => (
              <g key={`stack-${i}`}>
                <rect
                  x={30}
                  y={108 + i * 36}
                  width={110}
                  height={28}
                  rx={5}
                  fill={i === 3 ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.1)'}
                  stroke={i === 3 ? '#10b981' : 'rgba(16,185,129,0.2)'}
                  strokeWidth="1"
                />
                <text
                  x={85}
                  y={126 + i * 36}
                  textAnchor="middle"
                  fill={i === 3 ? '#6ee7b7' : 'rgba(255,255,255,0.6)'}
                  fontSize="9"
                  fontWeight={i === 3 ? '600' : '400'}
                >
                  {frame}
                </text>
              </g>
            ))}
          </g>

          {/* Arrow from Stack to Heap */}
          <g>
            <line
              x1={150}
              y1={165}
              x2={175}
              y2={165}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
            />
            <text x={163} y={157} fill="rgba(255,255,255,0.4)" fontSize="7">
              refs→
            </text>
          </g>

          {/* ===== HEAP CONTAINER ===== */}
          <g>
            <rect
              x={175}
              y={65}
              width={445}
              height={310}
              rx={12}
              fill="rgba(255,255,255,0.02)"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              strokeDasharray="6,3"
            />
            <text x={398} y={83} textAnchor="middle" fill="white" fontSize="11" fontWeight="600">
              V8 Heap Memory
            </text>
          </g>

          {/* ===== NEW SPACE ===== */}
          <g>
            <rect
              x={190}
              y={95}
              width={200}
              height={180}
              rx={10}
              fill="url(#new-space-grad)"
              stroke="#6366f1"
              strokeWidth="1.5"
            />
            <text x={290} y={115} textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="700">
              🌱 New Space (Young Gen)
            </text>
            <text x={290} y={128} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
              Short-lived objects · Frequent Minor GC
            </text>

            {/* Objects */}
            {newObjects.slice(0, 6).map((obj, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              return (
                <g key={obj.id}>
                  <rect
                    x={200 + col * 62}
                    y={140 + row * 50}
                    width={55}
                    height={38}
                    rx={6}
                    fill={
                      !obj.alive
                        ? 'rgba(239,68,68,0.15)'
                        : obj.age >= 2
                          ? 'rgba(251,191,36,0.2)'
                          : 'rgba(99,102,241,0.2)'
                    }
                    stroke={
                      !obj.alive ? '#ef4444' : obj.age >= 2 ? '#f59e0b' : 'rgba(99,102,241,0.4)'
                    }
                    strokeWidth="1"
                    strokeDasharray={!obj.alive ? '3,3' : '0'}
                    style={{ transition: 'all 0.5s ease' }}
                  />
                  <text
                    x={228 + col * 62}
                    y={157 + row * 50}
                    textAnchor="middle"
                    fill={!obj.alive ? '#fca5a5' : 'rgba(255,255,255,0.7)'}
                    fontSize="7"
                    fontWeight="500"
                  >
                    {obj.label}
                  </text>
                  <text
                    x={228 + col * 62}
                    y={170 + row * 50}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.35)"
                    fontSize="6"
                  >
                    {!obj.alive ? '💀 dead' : `age: ${obj.age}`}
                  </text>
                </g>
              );
            })}

            {/* Usage bar */}
            <rect x={200} y={249} width={180} height={8} rx={4} fill="rgba(255,255,255,0.05)" />
            <rect
              x={200}
              y={249}
              width={newSpaceUsage * 1.8}
              height={8}
              rx={4}
              fill={newSpaceUsage > 80 ? '#ef4444' : '#6366f1'}
              style={{ transition: 'width 0.5s ease' }}
            />
            <text x={290} y={269} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
              {newSpaceUsage.toFixed(0)}% used
            </text>
          </g>

          {/* Promotion arrow */}
          <g>
            <line
              x1={390}
              y1={185}
              x2={415}
              y2={185}
              stroke="#f59e0b"
              strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
            />
            <text x={403} y={178} textAnchor="middle" fill="#fbbf24" fontSize="7" fontWeight="600">
              Promote
            </text>
            <text x={403} y={195} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="6">
              survived 2+ GC
            </text>
          </g>

          {/* ===== OLD SPACE ===== */}
          <g>
            <rect
              x={415}
              y={95}
              width={190}
              height={180}
              rx={10}
              fill="url(#old-space-grad)"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
            <text x={510} y={115} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="700">
              🏛️ Old Space (Tenured)
            </text>
            <text x={510} y={128} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
              Long-lived objects · Rare Major GC
            </text>

            {/* Old objects */}
            {oldObjects.map((obj, i) => (
              <g key={obj.id}>
                <rect
                  x={425 + (i % 2) * 88}
                  y={138 + Math.floor(i / 2) * 50}
                  width={80}
                  height={38}
                  rx={6}
                  fill="rgba(251,191,36,0.15)"
                  stroke="rgba(251,191,36,0.3)"
                  strokeWidth="1"
                />
                <text
                  x={465 + (i % 2) * 88}
                  y={157 + Math.floor(i / 2) * 50}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="8"
                  fontWeight="500"
                >
                  {obj.label}
                </text>
                <text
                  x={465 + (i % 2) * 88}
                  y={170 + Math.floor(i / 2) * 50}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.35)"
                  fontSize="6"
                >
                  age: {obj.age} · persistent
                </text>
              </g>
            ))}

            {/* Usage bar */}
            <rect x={425} y={249} width={170} height={8} rx={4} fill="rgba(255,255,255,0.05)" />
            <rect
              x={425}
              y={249}
              width={oldSpaceUsage * 1.7}
              height={8}
              rx={4}
              fill={oldSpaceUsage > 70 ? '#ef4444' : '#f59e0b'}
              style={{ transition: 'width 0.5s ease' }}
            />
            <text x={510} y={269} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
              {oldSpaceUsage.toFixed(0)}% used
            </text>
          </g>

          {/* Stats panel */}
          <g>
            <rect
              x={20}
              y={290}
              width={600}
              height={80}
              rx={10}
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />

            {/* Heap stats */}
            <text x={60} y={315} fill="rgba(255,255,255,0.5)" fontSize="8">
              Heap Used
            </text>
            <text x={60} y={335} fill="#a5b4fc" fontSize="16" fontWeight="700">
              {heapUsed.toFixed(0)} MB
            </text>
            <text x={60} y={350} fill="rgba(255,255,255,0.3)" fontSize="7">
              / 512 MB max
            </text>

            {/* GC stats */}
            <text x={200} y={315} fill="rgba(255,255,255,0.5)" fontSize="8">
              GC Runs
            </text>
            <text x={200} y={335} fill="#10b981" fontSize="16" fontWeight="700">
              {gcCount}
            </text>
            <text x={200} y={350} fill="rgba(255,255,255,0.3)" fontSize="7">
              collections
            </text>

            {/* Tick count */}
            <text x={320} y={315} fill="rgba(255,255,255,0.5)" fontSize="8">
              Allocation Ticks
            </text>
            <text x={320} y={335} fill="#06b6d4" fontSize="16" fontWeight="700">
              {tickCount}
            </text>

            {/* Mark-Sweep algorithm info */}
            <text x={460} y={310} fill="rgba(255,255,255,0.5)" fontSize="8">
              GC Algorithms
            </text>
            <rect x={460} y={318} width={100} height={16} rx={4} fill="rgba(99,102,241,0.15)" />
            <text x={510} y={330} textAnchor="middle" fill="#a5b4fc" fontSize="7" fontWeight="600">
              Minor: Scavenge
            </text>
            <rect x={460} y={340} width={100} height={16} rx={4} fill="rgba(251,191,36,0.15)" />
            <text x={510} y={352} textAnchor="middle" fill="#fbbf24" fontSize="7" fontWeight="600">
              Major: Mark-Sweep
            </text>
          </g>
        </svg>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pb-4 px-4">
          <button
            onClick={triggerMinorGC}
            disabled={gcRunning}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50"
            style={{
              background: 'rgba(99,102,241,0.2)',
              color: '#a5b4fc',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            🌱 Minor GC (Scavenge)
          </button>
          <button
            onClick={triggerMajorGC}
            disabled={gcRunning}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50"
            style={{
              background: 'rgba(251,191,36,0.2)',
              color: '#fbbf24',
              border: '1px solid rgba(251,191,36,0.3)',
            }}
          >
            🏛️ Major GC (Mark-Sweep)
          </button>
          <span
            className="text-xs px-3 py-1 rounded-full"
            style={{
              background: gcRunning ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.15)',
              color: gcRunning ? '#fca5a5' : '#6ee7b7',
            }}
          >
            {gcRunning ? '⏳ GC Running...' : '✓ Idle'}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes gc-flash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default V8MemoryViz;
