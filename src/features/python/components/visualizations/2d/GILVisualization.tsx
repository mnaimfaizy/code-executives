import React, { useState, useEffect, useCallback, useMemo } from 'react';
import VisualizationControls from '../../../../../components/shared/VisualizationControls';

interface GILVisualizationProps {
  activeStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

type ThreadStatus = 'running' | 'waiting' | 'io' | 'blocked';

interface Thread {
  id: string;
  name: string;
  status: ThreadStatus;
  task: string;
  x: number;
  y: number;
  color: string;
}

interface TimeSlice {
  threadId: string;
  start: number;
  end: number;
  type: 'cpu' | 'io' | 'wait' | 'blocked';
}

interface StepData {
  title: string;
  description: string;
  code: string;
  threads: Thread[];
  gilHolder: string | null;
  gilStatus: 'locked' | 'released' | 'switching';
  timeline?: TimeSlice[];
  showProcesses?: boolean;
  showAsyncio?: boolean;
}

const GILVisualization: React.FC<GILVisualizationProps> = ({
  activeStep = 0,
  onStepChange,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(activeStep);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [animPhase, setAnimPhase] = useState(0);

  const steps: StepData[] = useMemo(
    () => [
      {
        title: '1. Single-Threaded Execution',
        description:
          'Python starts with a single main thread holding the GIL. All bytecode runs sequentially through the interpreter.',
        code: '# Single-threaded — GIL is always held\nimport time\n\ndef compute():\n    total = sum(range(10**7))\n    return total\n\nresult = compute()  # runs on main thread',
        threads: [
          {
            id: 'main',
            name: 'Main Thread',
            status: 'running',
            task: 'compute()',
            x: 350,
            y: 110,
            color: '#3B82F6',
          },
        ],
        gilHolder: 'main',
        gilStatus: 'locked',
        timeline: [{ threadId: 'main', start: 0, end: 100, type: 'cpu' }],
      },
      {
        title: '2. Multiple Threads — GIL Contention',
        description:
          'When multiple threads are created, only ONE can execute Python bytecode at a time. Others must wait for the GIL.',
        code: 'import threading\n\nt1 = threading.Thread(target=compute)\nt2 = threading.Thread(target=compute)\nt1.start(); t2.start()\n# Only one runs at a time!',
        threads: [
          {
            id: 'main',
            name: 'Main',
            status: 'waiting',
            task: 'join()',
            x: 220,
            y: 110,
            color: '#3B82F6',
          },
          {
            id: 't1',
            name: 'Thread-1',
            status: 'running',
            task: 'compute()',
            x: 350,
            y: 110,
            color: '#10B981',
          },
          {
            id: 't2',
            name: 'Thread-2',
            status: 'waiting',
            task: 'compute()',
            x: 480,
            y: 110,
            color: '#F59E0B',
          },
        ],
        gilHolder: 't1',
        gilStatus: 'locked',
        timeline: [
          { threadId: 'main', start: 0, end: 10, type: 'cpu' },
          { threadId: 'main', start: 10, end: 100, type: 'wait' },
          { threadId: 't1', start: 10, end: 55, type: 'cpu' },
          { threadId: 't1', start: 55, end: 100, type: 'wait' },
          { threadId: 't2', start: 10, end: 55, type: 'wait' },
          { threadId: 't2', start: 55, end: 100, type: 'cpu' },
        ],
      },
      {
        title: '3. GIL Context Switch (every 5ms)',
        description:
          'CPython forces a GIL release every 5ms (sys.getswitchinterval). The OS scheduler picks which waiting thread gets it next.',
        code: 'import sys\nprint(sys.getswitchinterval())  # 0.005 (5ms)\n\n# Every ~5ms CPython:\n# 1. Suspends current thread\n# 2. Releases GIL\n# 3. OS picks next thread\n# 4. New thread acquires GIL',
        threads: [
          {
            id: 'main',
            name: 'Main',
            status: 'waiting',
            task: 'join()',
            x: 220,
            y: 110,
            color: '#3B82F6',
          },
          {
            id: 't1',
            name: 'Thread-1',
            status: 'waiting',
            task: 'suspended',
            x: 350,
            y: 110,
            color: '#10B981',
          },
          {
            id: 't2',
            name: 'Thread-2',
            status: 'running',
            task: 'compute()',
            x: 480,
            y: 110,
            color: '#F59E0B',
          },
        ],
        gilHolder: 't2',
        gilStatus: 'switching',
        timeline: [
          { threadId: 'main', start: 0, end: 100, type: 'wait' },
          { threadId: 't1', start: 0, end: 20, type: 'cpu' },
          { threadId: 't1', start: 20, end: 40, type: 'wait' },
          { threadId: 't1', start: 40, end: 60, type: 'cpu' },
          { threadId: 't1', start: 60, end: 80, type: 'wait' },
          { threadId: 't1', start: 80, end: 100, type: 'cpu' },
          { threadId: 't2', start: 0, end: 20, type: 'wait' },
          { threadId: 't2', start: 20, end: 40, type: 'cpu' },
          { threadId: 't2', start: 40, end: 60, type: 'wait' },
          { threadId: 't2', start: 60, end: 80, type: 'cpu' },
          { threadId: 't2', start: 80, end: 100, type: 'wait' },
        ],
      },
      {
        title: '4. I/O Releases the GIL',
        description:
          'During I/O operations (file, network, database), the GIL is voluntarily released, allowing other threads to run Python code.',
        code: 'def download(url):\n    # GIL released during network I/O\n    resp = requests.get(url)  # others run!\n    # GIL re-acquired here\n    return resp.text\n\n# I/O-bound: threading IS effective',
        threads: [
          {
            id: 't1',
            name: 'Thread-1',
            status: 'io',
            task: 'network I/O',
            x: 220,
            y: 110,
            color: '#10B981',
          },
          {
            id: 't2',
            name: 'Thread-2',
            status: 'running',
            task: 'Python code',
            x: 350,
            y: 110,
            color: '#F59E0B',
          },
          {
            id: 't3',
            name: 'Thread-3',
            status: 'io',
            task: 'file I/O',
            x: 480,
            y: 110,
            color: '#8B5CF6',
          },
        ],
        gilHolder: 't2',
        gilStatus: 'released',
        timeline: [
          { threadId: 't1', start: 0, end: 15, type: 'cpu' },
          { threadId: 't1', start: 15, end: 70, type: 'io' },
          { threadId: 't1', start: 70, end: 85, type: 'cpu' },
          { threadId: 't1', start: 85, end: 100, type: 'io' },
          { threadId: 't2', start: 0, end: 15, type: 'wait' },
          { threadId: 't2', start: 15, end: 50, type: 'cpu' },
          { threadId: 't2', start: 50, end: 80, type: 'io' },
          { threadId: 't2', start: 80, end: 100, type: 'cpu' },
          { threadId: 't3', start: 0, end: 30, type: 'wait' },
          { threadId: 't3', start: 30, end: 50, type: 'io' },
          { threadId: 't3', start: 50, end: 70, type: 'cpu' },
          { threadId: 't3', start: 70, end: 100, type: 'io' },
        ],
      },
      {
        title: '5. CPU-Bound: GIL is the Bottleneck',
        description:
          'For CPU-bound work, threading is SLOWER than single-threaded due to GIL contention and context-switch overhead.',
        code: '# CPU-bound: threading makes it SLOWER!\nimport time, threading\n\ndef cpu_work():\n    sum(range(10**7))\n\n# Single-threaded: ~0.3s\n# Two threads: ~0.4s (SLOWER!)\n# Overhead from GIL contention',
        threads: [
          {
            id: 't1',
            name: 'Thread-1',
            status: 'running',
            task: 'CPU work',
            x: 280,
            y: 110,
            color: '#10B981',
          },
          {
            id: 't2',
            name: 'Thread-2',
            status: 'blocked',
            task: 'GIL contention',
            x: 430,
            y: 110,
            color: '#EF4444',
          },
        ],
        gilHolder: 't1',
        gilStatus: 'locked',
        timeline: [
          { threadId: 't1', start: 0, end: 25, type: 'cpu' },
          { threadId: 't1', start: 25, end: 30, type: 'wait' },
          { threadId: 't1', start: 30, end: 55, type: 'cpu' },
          { threadId: 't1', start: 55, end: 60, type: 'wait' },
          { threadId: 't1', start: 60, end: 85, type: 'cpu' },
          { threadId: 't1', start: 85, end: 100, type: 'wait' },
          { threadId: 't2', start: 0, end: 25, type: 'blocked' },
          { threadId: 't2', start: 25, end: 30, type: 'cpu' },
          { threadId: 't2', start: 30, end: 55, type: 'blocked' },
          { threadId: 't2', start: 55, end: 60, type: 'cpu' },
          { threadId: 't2', start: 60, end: 85, type: 'blocked' },
          { threadId: 't2', start: 85, end: 100, type: 'cpu' },
        ],
      },
      {
        title: '6. multiprocessing — True Parallelism',
        description:
          'Each process gets its own Python interpreter and GIL. CPU-bound work finally runs on multiple cores simultaneously.',
        code: 'from multiprocessing import Pool\n\ndef cpu_work(n):\n    return sum(range(n))\n\nwith Pool(4) as pool:\n    results = pool.map(cpu_work,\n        [10**7]*4)  # 4 cores!\n# ~4x faster than threading',
        threads: [
          {
            id: 'p1',
            name: 'Process 1',
            status: 'running',
            task: 'Core 0',
            x: 220,
            y: 110,
            color: '#3B82F6',
          },
          {
            id: 'p2',
            name: 'Process 2',
            status: 'running',
            task: 'Core 1',
            x: 350,
            y: 110,
            color: '#10B981',
          },
          {
            id: 'p3',
            name: 'Process 3',
            status: 'running',
            task: 'Core 2',
            x: 480,
            y: 110,
            color: '#F59E0B',
          },
        ],
        gilHolder: null,
        gilStatus: 'released',
        showProcesses: true,
        timeline: [
          { threadId: 'p1', start: 0, end: 100, type: 'cpu' },
          { threadId: 'p2', start: 0, end: 100, type: 'cpu' },
          { threadId: 'p3', start: 0, end: 100, type: 'cpu' },
        ],
      },
      {
        title: '7. asyncio — Cooperative Concurrency',
        description:
          'asyncio uses a single thread with an event loop. Coroutines yield control at await points — no GIL switching overhead.',
        code: 'import asyncio\n\nasync def fetch(url):\n    async with aiohttp.ClientSession() as s:\n        resp = await s.get(url) # yield\n        return await resp.text()\n\nasync def main():\n    urls = ["url1", "url2", "url3"]\n    await asyncio.gather(\n        *[fetch(u) for u in urls])',
        threads: [
          {
            id: 'loop',
            name: 'Event Loop',
            status: 'running',
            task: 'scheduling',
            x: 350,
            y: 110,
            color: '#8B5CF6',
          },
        ],
        gilHolder: 'loop',
        gilStatus: 'locked',
        showAsyncio: true,
        timeline: [
          { threadId: 'coro1', start: 0, end: 10, type: 'cpu' },
          { threadId: 'coro1', start: 10, end: 60, type: 'io' },
          { threadId: 'coro1', start: 60, end: 70, type: 'cpu' },
          { threadId: 'coro2', start: 10, end: 20, type: 'cpu' },
          { threadId: 'coro2', start: 20, end: 70, type: 'io' },
          { threadId: 'coro2', start: 70, end: 80, type: 'cpu' },
          { threadId: 'coro3', start: 20, end: 30, type: 'cpu' },
          { threadId: 'coro3', start: 30, end: 80, type: 'io' },
          { threadId: 'coro3', start: 80, end: 90, type: 'cpu' },
        ],
      },
      {
        title: '8. Python 3.13+ Free-Threaded Mode',
        description:
          'PEP 703: Python 3.13 introduces experimental free-threaded (no-GIL) builds. True thread parallelism is coming!',
        code: '# Python 3.13+ (experimental)\n# Build with: --disable-gil\n# Or: PYTHON_GIL=0 python3.13t\n\nimport sys\nprint(sys._is_gil_enabled())  # False!\n\n# Threads now run truly parallel\n# on multiple CPU cores',
        threads: [
          {
            id: 't1',
            name: 'Thread-1',
            status: 'running',
            task: 'Core 0',
            x: 220,
            y: 110,
            color: '#10B981',
          },
          {
            id: 't2',
            name: 'Thread-2',
            status: 'running',
            task: 'Core 1',
            x: 350,
            y: 110,
            color: '#F59E0B',
          },
          {
            id: 't3',
            name: 'Thread-3',
            status: 'running',
            task: 'Core 2',
            x: 480,
            y: 110,
            color: '#8B5CF6',
          },
        ],
        gilHolder: null,
        gilStatus: 'released',
        timeline: [
          { threadId: 't1', start: 0, end: 100, type: 'cpu' },
          { threadId: 't2', start: 0, end: 100, type: 'cpu' },
          { threadId: 't3', start: 0, end: 100, type: 'cpu' },
        ],
      },
    ],
    []
  );

  useEffect(() => {
    setCurrentStep(activeStep);
  }, [activeStep]);

  useEffect(() => {
    const id = window.setInterval(() => setAnimPhase((p) => (p + 1) % 60), 50);
    return () => clearInterval(id);
  }, []);

  const handlePlayPause = useCallback(() => setIsPlaying((p) => !p), []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    onStepChange?.(0);
  }, [onStepChange]);

  const handleStepBack = useCallback(() => {
    const s = Math.max(0, currentStep - 1);
    setCurrentStep(s);
    onStepChange?.(s);
  }, [currentStep, onStepChange]);

  const handleStepForward = useCallback(() => {
    const s = Math.min(steps.length - 1, currentStep + 1);
    setCurrentStep(s);
    onStepChange?.(s);
  }, [currentStep, steps.length, onStepChange]);

  const handleSpeedChange = useCallback((s: number) => setSpeed(s), []);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) return;
    const id = window.setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          setIsPlaying(false);
          return prev;
        }
        onStepChange?.(next);
        return next;
      });
    }, 3500 / speed);
    return () => clearInterval(id);
  }, [isPlaying, currentStep, steps.length, speed, onStepChange]);

  const step = steps[currentStep];
  const pulse = Math.sin(animPhase * 0.15) * 0.15 + 0.85;

  const statusColor = (s: ThreadStatus): string => {
    switch (s) {
      case 'running':
        return '#10B981';
      case 'waiting':
        return '#F59E0B';
      case 'io':
        return '#3B82F6';
      case 'blocked':
        return '#EF4444';
    }
  };

  const sliceColor = (t: string): string => {
    switch (t) {
      case 'cpu':
        return '#10B981';
      case 'io':
        return '#3B82F6';
      case 'wait':
        return '#F59E0B';
      case 'blocked':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  const gilColor =
    step.gilStatus === 'locked'
      ? '#EF4444'
      : step.gilStatus === 'switching'
        ? '#F59E0B'
        : '#10B981';

  const gilLabel =
    step.gilStatus === 'locked'
      ? 'LOCKED'
      : step.gilStatus === 'switching'
        ? 'SWITCHING'
        : 'RELEASED';

  // Group timeline slices by thread
  const timelineThreads = useMemo(() => {
    if (!step.timeline) return [];
    const ids = [...new Set(step.timeline.map((s) => s.threadId))];
    return ids.map((id) => ({
      id,
      slices: step.timeline!.filter((s) => s.threadId === id),
    }));
  }, [step.timeline]);

  const renderProcessBorders = (): React.ReactNode => (
    <g>
      {step.threads.map((t) => (
        <g key={`proc-${t.id}`}>
          <rect
            x={t.x - 45}
            y={t.y - 35}
            width="90"
            height="70"
            rx="8"
            fill="none"
            stroke={t.color}
            strokeWidth="2"
            strokeDasharray="6 3"
          />
          <rect
            x={t.x - 20}
            y={t.y + 25}
            width="40"
            height="14"
            rx="4"
            fill={t.color}
            opacity="0.2"
          />
          <text
            x={t.x}
            y={t.y + 35}
            textAnchor="middle"
            fontSize="7"
            fill={t.color}
            fontWeight="bold"
          >
            own GIL
          </text>
        </g>
      ))}
    </g>
  );

  const renderAsyncioLoop = (): React.ReactNode => (
    <g>
      <ellipse
        cx="350"
        cy="105"
        rx="140"
        ry="50"
        fill="none"
        stroke="#8B5CF6"
        strokeWidth="2"
        strokeDasharray="8 4"
      />
      <text x="350" y="72" textAnchor="middle" fontSize="9" fill="#7C3AED" fontWeight="bold">
        Event Loop (single thread)
      </text>
      {['coro1', 'coro2', 'coro3'].map((id, i) => {
        const cx = 265 + i * 85;
        const cy = 110;
        return (
          <g key={id}>
            <rect
              x={cx - 30}
              y={cy - 12}
              width="60"
              height="24"
              rx="6"
              fill="#EDE9FE"
              stroke="#8B5CF6"
              strokeWidth="1.5"
            />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fontSize="9"
              fill="#5B21B6"
              fontWeight="bold"
            >
              {id}
            </text>
          </g>
        );
      })}
      <text x="350" y="145" textAnchor="middle" fontSize="8" fill="#6B7280">
        await points yield control cooperatively
      </text>
    </g>
  );

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-xl p-5 shadow-lg border border-red-100">
        <svg
          viewBox="0 0 620 275"
          className="w-full border-2 border-red-100 rounded-lg bg-white/90 backdrop-blur-sm mb-4"
          style={{ minHeight: '220px' }}
        >
          <defs>
            <marker id="gil-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#6B7280" />
            </marker>
            <filter id="gil-shadow">
              <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* GIL Lock indicator */}
          <g>
            <rect
              x="20"
              y="15"
              width="120"
              height="40"
              rx="8"
              fill={gilColor}
              filter="url(#gil-shadow)"
              opacity={step.gilStatus === 'switching' ? pulse : 0.95}
            />
            <text x="80" y="32" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
              GIL {gilLabel}
            </text>
            <text x="80" y="46" textAnchor="middle" fontSize="8" fill="white" opacity="0.9">
              {step.gilHolder
                ? `held by ${step.gilHolder}`
                : step.showProcesses
                  ? 'each process has own'
                  : 'no holder'}
            </text>
          </g>

          {/* Thread/Process visualization area */}
          <rect
            x="170"
            y="60"
            width="430"
            height="90"
            rx="8"
            fill="#F9FAFB"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
          <text x="185" y="77" fontSize="9" fill="#9CA3AF" fontWeight="bold">
            {step.showProcesses
              ? 'PROCESSES (separate interpreters)'
              : step.showAsyncio
                ? 'ASYNC COROUTINES'
                : 'THREADS'}
          </text>

          {step.showProcesses && renderProcessBorders()}
          {step.showAsyncio && renderAsyncioLoop()}

          {/* Thread circles */}
          {!step.showAsyncio &&
            step.threads.map((t) => (
              <g key={t.id}>
                <circle
                  cx={t.x}
                  cy={t.y}
                  r="22"
                  fill={t.color}
                  opacity={t.status === 'blocked' ? 0.5 : 0.9}
                  filter="url(#gil-shadow)"
                />
                <circle
                  cx={t.x}
                  cy={t.y}
                  r="22"
                  fill="none"
                  stroke={statusColor(t.status)}
                  strokeWidth="3"
                  opacity={t.id === step.gilHolder ? pulse : 0.7}
                />
                <text
                  x={t.x}
                  y={t.y - 3}
                  textAnchor="middle"
                  fontSize="9"
                  fill="white"
                  fontWeight="bold"
                >
                  {t.name}
                </text>
                <text
                  x={t.x}
                  y={t.y + 9}
                  textAnchor="middle"
                  fontSize="7"
                  fill="white"
                  opacity="0.9"
                >
                  {t.task}
                </text>

                {/* Status badge */}
                <rect
                  x={t.x + 14}
                  y={t.y - 30}
                  width="42"
                  height="14"
                  rx="4"
                  fill={statusColor(t.status)}
                />
                <text
                  x={t.x + 35}
                  y={t.y - 20}
                  textAnchor="middle"
                  fontSize="7"
                  fill="white"
                  fontWeight="bold"
                >
                  {t.status.toUpperCase()}
                </text>

                {/* GIL arrow from lock to holder */}
                {t.id === step.gilHolder && !step.showProcesses && (
                  <line
                    x1="140"
                    y1="35"
                    x2={t.x - 24}
                    y2={t.y}
                    stroke="#6B7280"
                    strokeWidth="1.5"
                    markerEnd="url(#gil-arrow)"
                    strokeDasharray="4 2"
                  />
                )}
              </g>
            ))}

          {/* Timeline visualization */}
          {step.timeline && step.timeline.length > 0 && (
            <g>
              <text x="20" y="168" fontSize="9" fill="#6B7280" fontWeight="bold">
                Execution Timeline
              </text>
              <line x1="20" y1="175" x2="600" y2="175" stroke="#E5E7EB" strokeWidth="1" />

              {timelineThreads.map((t, ti) => {
                const y = 182 + ti * 22;
                return (
                  <g key={t.id}>
                    <text x="18" y={y + 12} fontSize="8" fill="#6B7280" textAnchor="end">
                      {t.id}
                    </text>
                    <rect x="25" y={y} width="575" height="16" rx="3" fill="#F3F4F6" />
                    {t.slices.map((sl, si) => (
                      <rect
                        key={si}
                        x={25 + sl.start * 5.75}
                        y={y + 1}
                        width={(sl.end - sl.start) * 5.75}
                        height="14"
                        rx="2"
                        fill={sliceColor(sl.type)}
                        opacity="0.85"
                      />
                    ))}
                  </g>
                );
              })}

              {/* Timeline legend */}
              {(() => {
                const legendY = 182 + timelineThreads.length * 22 + 6;
                return (
                  <g>
                    <rect x="25" y={legendY} width="10" height="8" rx="2" fill="#10B981" />
                    <text x="38" y={legendY + 7} fontSize="7" fill="#6B7280">
                      CPU
                    </text>
                    <rect x="65" y={legendY} width="10" height="8" rx="2" fill="#3B82F6" />
                    <text x="78" y={legendY + 7} fontSize="7" fill="#6B7280">
                      I/O
                    </text>
                    <rect x="100" y={legendY} width="10" height="8" rx="2" fill="#F59E0B" />
                    <text x="113" y={legendY + 7} fontSize="7" fill="#6B7280">
                      Wait
                    </text>
                    <rect x="145" y={legendY} width="10" height="8" rx="2" fill="#EF4444" />
                    <text x="158" y={legendY + 7} fontSize="7" fill="#6B7280">
                      Blocked
                    </text>
                  </g>
                );
              })()}
            </g>
          )}
        </svg>

        <VisualizationControls
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={steps.length}
          speed={speed}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onStepBack={handleStepBack}
          onStepForward={handleStepForward}
          onSpeedChange={handleSpeedChange}
          className="mb-4"
        />

        <div className="bg-white/70 rounded-lg p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full">
              {currentStep + 1}
            </span>
            <h4 className="font-bold text-gray-800">{step.title}</h4>
          </div>
          <p className="text-gray-600 text-sm mb-3">{step.description}</p>
          <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
            <pre className="text-sm font-mono">
              {step.code.split('\n').map((line, i) => (
                <div key={i} className="leading-relaxed">
                  {line.startsWith('#') ? (
                    <span className="text-gray-500">{line}</span>
                  ) : (
                    <span className="text-green-400">{line}</span>
                  )}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GILVisualization;
