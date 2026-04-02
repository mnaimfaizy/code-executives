import React, { useState } from 'react';

interface ClusterVsWorkerVizProps {
  className?: string;
}

const ClusterVsWorkerViz: React.FC<ClusterVsWorkerVizProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'cluster' | 'worker'>('cluster');
  const [activeWorker, setActiveWorker] = useState<number | null>(null);

  const clusterWorkers = [
    { id: 0, label: 'Worker 1', status: 'active', cpu: 78, requests: 1240 },
    { id: 1, label: 'Worker 2', status: 'active', cpu: 45, requests: 980 },
    { id: 2, label: 'Worker 3', status: 'active', cpu: 62, requests: 1100 },
    { id: 3, label: 'Worker 4', status: 'crashed', cpu: 0, requests: 0 },
  ];

  const threadWorkers = [
    { id: 0, label: 'Main Thread', task: 'HTTP Server', cpu: 12 },
    { id: 1, label: 'Worker 1', task: 'Image Resize', cpu: 95 },
    { id: 2, label: 'Worker 2', task: 'Crypto Hash', cpu: 88 },
    { id: 3, label: 'Worker 3', task: 'ML Inference', cpu: 72 },
  ];

  return (
    <div className={`relative w-full ${className}`}>
      <div
        style={{
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, #0c1220 0%, #1a1a3e 50%, #0f172a 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Tab switcher */}
        <div className="flex items-center justify-center gap-2 pt-4 px-4">
          <button
            onClick={() => setActiveTab('cluster')}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              background:
                activeTab === 'cluster' ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'cluster' ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${activeTab === 'cluster' ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            🏢 Cluster Mode
          </button>
          <button
            onClick={() => setActiveTab('worker')}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              background:
                activeTab === 'worker' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'worker' ? '#6ee7b7' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${activeTab === 'worker' ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            🧵 Worker Threads
          </button>
        </div>

        <svg viewBox="0 0 640 420" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
          <defs>
            <filter id="scale-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="master-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="shared-mem-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Title */}
          <text x={320} y={30} textAnchor="middle" fill="white" fontSize="16" fontWeight="700">
            {activeTab === 'cluster'
              ? '🏢 Cluster: Multi-Process Architecture'
              : '🧵 Worker Threads: Multi-Thread Architecture'}
          </text>
          <text x={320} y={48} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">
            {activeTab === 'cluster'
              ? 'Separate OS processes sharing one port'
              : 'Threads within a single process sharing memory'}
          </text>

          {activeTab === 'cluster' ? (
            <>
              {/* Master Process */}
              <g>
                <rect
                  x={240}
                  y={60}
                  width={160}
                  height={60}
                  rx={12}
                  fill="url(#master-grad)"
                  stroke="#6366f1"
                  strokeWidth="2"
                />
                <text
                  x={320}
                  y={85}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="700"
                >
                  👑 Master Process
                </text>
                <text x={320} y={102} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8">
                  PID: 1024 · Load Balancer
                </text>
              </g>

              {/* Fork lines */}
              {clusterWorkers.map((w, i) => {
                const workerX = 50 + i * 155;
                return (
                  <line
                    key={`fork-${i}`}
                    x1={320}
                    y1={120}
                    x2={workerX + 60}
                    y2={160}
                    stroke={w.status === 'crashed' ? '#ef4444' : 'rgba(99,102,241,0.4)'}
                    strokeWidth="1.5"
                    strokeDasharray={w.status === 'crashed' ? '4,4' : '0'}
                  />
                );
              })}

              {/* Worker Processes */}
              {clusterWorkers.map((w, i) => {
                const workerX = 50 + i * 155;
                const isActive = activeWorker === w.id;
                const isCrashed = w.status === 'crashed';

                return (
                  <g
                    key={`cluster-w-${i}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveWorker(isActive ? null : w.id)}
                  >
                    {/* Worker box */}
                    <rect
                      x={workerX}
                      y={160}
                      width={120}
                      height={140}
                      rx={10}
                      fill={
                        isCrashed
                          ? 'rgba(239,68,68,0.1)'
                          : isActive
                            ? 'rgba(99,102,241,0.15)'
                            : 'rgba(255,255,255,0.04)'
                      }
                      stroke={
                        isCrashed ? '#ef4444' : isActive ? '#6366f1' : 'rgba(255,255,255,0.12)'
                      }
                      strokeWidth={isActive ? 2 : 1}
                      style={{ transition: 'all 0.3s ease' }}
                    />

                    {/* Worker label */}
                    <text
                      x={workerX + 60}
                      y={182}
                      textAnchor="middle"
                      fill={isCrashed ? '#fca5a5' : 'white'}
                      fontSize="10"
                      fontWeight="600"
                    >
                      {isCrashed ? '💀' : '⚡'} {w.label}
                    </text>

                    {/* V8 Engine */}
                    <rect
                      x={workerX + 10}
                      y={190}
                      width={100}
                      height={20}
                      rx={4}
                      fill={isCrashed ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)'}
                      stroke={isCrashed ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}
                      strokeWidth="0.5"
                    />
                    <text
                      x={workerX + 60}
                      y={204}
                      textAnchor="middle"
                      fill={isCrashed ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.6)'}
                      fontSize="7"
                    >
                      V8 Engine + Event Loop
                    </text>

                    {/* Memory */}
                    <rect
                      x={workerX + 10}
                      y={215}
                      width={100}
                      height={20}
                      rx={4}
                      fill="rgba(139,92,246,0.1)"
                      stroke="rgba(139,92,246,0.2)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={workerX + 60}
                      y={229}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.5)"
                      fontSize="7"
                    >
                      🔒 Isolated Memory
                    </text>

                    {/* CPU bar */}
                    <rect
                      x={workerX + 10}
                      y={245}
                      width={100}
                      height={6}
                      rx={3}
                      fill="rgba(255,255,255,0.05)"
                    />
                    <rect
                      x={workerX + 10}
                      y={245}
                      width={w.cpu}
                      height={6}
                      rx={3}
                      fill={isCrashed ? '#ef4444' : w.cpu > 70 ? '#f59e0b' : '#10b981'}
                    />
                    <text
                      x={workerX + 60}
                      y={262}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.4)"
                      fontSize="7"
                    >
                      CPU: {w.cpu}% · {w.requests} req/s
                    </text>

                    {/* Status badge */}
                    <rect
                      x={workerX + 30}
                      y={272}
                      width={60}
                      height={18}
                      rx={9}
                      fill={isCrashed ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}
                    />
                    <text
                      x={workerX + 60}
                      y={284}
                      textAnchor="middle"
                      fill={isCrashed ? '#fca5a5' : '#6ee7b7'}
                      fontSize="7"
                      fontWeight="600"
                    >
                      {isCrashed ? 'CRASHED' : 'HEALTHY'}
                    </text>
                  </g>
                );
              })}

              {/* IPC messaging */}
              <g>
                <rect
                  x={180}
                  y={320}
                  width={280}
                  height={35}
                  rx={8}
                  fill="rgba(251,191,36,0.08)"
                  stroke="rgba(251,191,36,0.2)"
                  strokeWidth="1"
                />
                <text
                  x={320}
                  y={340}
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="9"
                  fontWeight="600"
                >
                  📨 IPC Message Passing (No Shared Memory)
                </text>
                <text x={320} y={350} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
                  Workers communicate via serialized message channels
                </text>
              </g>

              {/* Port sharing */}
              <g>
                <rect
                  x={220}
                  y={365}
                  width={200}
                  height={30}
                  rx={15}
                  fill="rgba(99,102,241,0.15)"
                  stroke="rgba(99,102,241,0.3)"
                  strokeWidth="1"
                />
                <text
                  x={320}
                  y={384}
                  textAnchor="middle"
                  fill="#a5b4fc"
                  fontSize="9"
                  fontWeight="600"
                >
                  🌐 Shared Port :3000
                </text>
              </g>
            </>
          ) : (
            <>
              {/* Single Process Container */}
              <g>
                <rect
                  x={30}
                  y={60}
                  width={580}
                  height={280}
                  rx={14}
                  fill="rgba(255,255,255,0.02)"
                  stroke="rgba(16,185,129,0.3)"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                />
                <text
                  x={320}
                  y={80}
                  textAnchor="middle"
                  fill="#10b981"
                  fontSize="11"
                  fontWeight="700"
                >
                  📦 Single Node.js Process (PID: 2048)
                </text>
              </g>

              {/* Threads */}
              {threadWorkers.map((w, i) => {
                const threadX = 50 + i * 145;
                const isMain = i === 0;
                const isActive = activeWorker === w.id;

                return (
                  <g
                    key={`thread-${i}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveWorker(isActive ? null : w.id)}
                  >
                    <rect
                      x={threadX}
                      y={95}
                      width={130}
                      height={130}
                      rx={10}
                      fill={
                        isMain
                          ? 'rgba(99,102,241,0.1)'
                          : isActive
                            ? 'rgba(16,185,129,0.12)'
                            : 'rgba(255,255,255,0.03)'
                      }
                      stroke={isMain ? '#6366f1' : isActive ? '#10b981' : 'rgba(255,255,255,0.1)'}
                      strokeWidth={isActive ? 2 : 1}
                    />

                    <text
                      x={threadX + 65}
                      y={115}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {isMain ? '🧠' : '🔧'} {w.label}
                    </text>

                    {/* Task */}
                    <rect
                      x={threadX + 10}
                      y={125}
                      width={110}
                      height={22}
                      rx={4}
                      fill={isMain ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)'}
                      stroke={isMain ? 'rgba(99,102,241,0.3)' : 'rgba(16,185,129,0.3)'}
                      strokeWidth="0.5"
                    />
                    <text
                      x={threadX + 65}
                      y={140}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.7)"
                      fontSize="8"
                    >
                      {w.task}
                    </text>

                    {/* JS Context */}
                    <rect
                      x={threadX + 10}
                      y={153}
                      width={110}
                      height={18}
                      rx={4}
                      fill="rgba(255,255,255,0.03)"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={threadX + 65}
                      y={166}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.4)"
                      fontSize="7"
                    >
                      Isolated JS Context
                    </text>

                    {/* CPU gauge */}
                    <rect
                      x={threadX + 10}
                      y={180}
                      width={110}
                      height={6}
                      rx={3}
                      fill="rgba(255,255,255,0.05)"
                    />
                    <rect
                      x={threadX + 10}
                      y={180}
                      width={w.cpu * 1.1}
                      height={6}
                      rx={3}
                      fill={w.cpu > 80 ? '#ef4444' : w.cpu > 50 ? '#f59e0b' : '#10b981'}
                    />
                    <text
                      x={threadX + 65}
                      y={200}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.4)"
                      fontSize="7"
                    >
                      CPU: {w.cpu}%
                    </text>
                  </g>
                );
              })}

              {/* Shared Memory */}
              <g>
                <rect
                  x={140}
                  y={240}
                  width={360}
                  height={50}
                  rx={10}
                  fill="url(#shared-mem-grad)"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                <text
                  x={320}
                  y={262}
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="10"
                  fontWeight="700"
                >
                  🔗 SharedArrayBuffer — Direct Memory Sharing
                </text>
                <text x={320} y={278} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8">
                  Threads can read/write same memory · No serialization overhead
                </text>
              </g>

              {/* Connection lines to shared memory */}
              {threadWorkers.map((_, i) => {
                const threadX = 50 + i * 145 + 65;
                return (
                  <line
                    key={`mem-line-${i}`}
                    x1={threadX}
                    y1={225}
                    x2={threadX}
                    y2={240}
                    stroke="rgba(251,191,36,0.3)"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                );
              })}

              {/* parentPort messaging */}
              <g>
                <rect
                  x={180}
                  y={300}
                  width={280}
                  height={30}
                  rx={8}
                  fill="rgba(16,185,129,0.08)"
                  stroke="rgba(16,185,129,0.2)"
                  strokeWidth="1"
                />
                <text
                  x={320}
                  y={319}
                  textAnchor="middle"
                  fill="#6ee7b7"
                  fontSize="8"
                  fontWeight="600"
                >
                  💬 parentPort.postMessage() + SharedMemory
                </text>
              </g>
            </>
          )}

          {/* Comparison summary at bottom */}
          <g>
            <rect
              x={50}
              y={380}
              width={540}
              height={30}
              rx={8}
              fill={activeTab === 'cluster' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)'}
              stroke={activeTab === 'cluster' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)'}
              strokeWidth="1"
            />
            <text x={320} y={399} textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
              {activeTab === 'cluster'
                ? '✅ Best for: I/O-bound HTTP servers · High fault isolation · No shared state'
                : '✅ Best for: CPU-bound tasks · Shared memory · Image/crypto/ML processing'}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default ClusterVsWorkerViz;
