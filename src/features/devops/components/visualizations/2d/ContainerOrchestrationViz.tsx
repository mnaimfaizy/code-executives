import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Container {
  id: string;
  name: string;
  status: 'running' | 'creating' | 'terminating' | 'pending';
  cpu: number;
  memory: number;
  pod: string;
}

const ContainerOrchestrationViz: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([
    { id: 'c1', name: 'web-app-1', status: 'running', cpu: 45, memory: 62, pod: 'pod-1' },
    { id: 'c2', name: 'web-app-2', status: 'running', cpu: 38, memory: 55, pod: 'pod-1' },
    { id: 'c3', name: 'api-svc-1', status: 'running', cpu: 72, memory: 78, pod: 'pod-2' },
    { id: 'c4', name: 'api-svc-2', status: 'running', cpu: 65, memory: 70, pod: 'pod-2' },
    { id: 'c5', name: 'worker-1', status: 'running', cpu: 28, memory: 40, pod: 'pod-3' },
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [events, setEvents] = useState<string[]>([
    '🟢 Cluster healthy - 5 containers running across 3 pods',
  ]);
  const [scalingDemo, setScalingDemo] = useState(false);

  // Simulate container metric changes
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setContainers((prev) =>
        prev.map((c) => ({
          ...c,
          cpu: Math.min(100, Math.max(5, c.cpu + (Math.random() - 0.5) * 20)),
          memory: Math.min(100, Math.max(10, c.memory + (Math.random() - 0.5) * 10)),
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const scaleUp = useCallback(() => {
    const newId = `c${Date.now()}`;
    const newContainer: Container = {
      id: newId,
      name: `web-app-${containers.length + 1}`,
      status: 'creating',
      cpu: 0,
      memory: 0,
      pod: `pod-${Math.ceil(containers.length / 2) + 1}`,
    };
    setContainers((prev) => [...prev, newContainer]);
    setEvents((prev) => [...prev, `📦 Scaling UP: Creating ${newContainer.name}...`]);

    setTimeout(() => {
      setContainers((prev) =>
        prev.map((c) => (c.id === newId ? { ...c, status: 'running', cpu: 15, memory: 25 } : c))
      );
      setEvents((prev) => [...prev, `✅ ${newContainer.name} is now running`]);
    }, 1500);
  }, [containers.length]);

  const scaleDown = useCallback(() => {
    if (containers.length <= 2) return;
    const lastContainer = containers[containers.length - 1];
    setContainers((prev) =>
      prev.map((c) => (c.id === lastContainer.id ? { ...c, status: 'terminating' } : c))
    );
    setEvents((prev) => [...prev, `🔻 Scaling DOWN: Terminating ${lastContainer.name}...`]);

    setTimeout(() => {
      setContainers((prev) => prev.filter((c) => c.id !== lastContainer.id));
      setEvents((prev) => [...prev, `🗑️ ${lastContainer.name} terminated`]);
    }, 1200);
  }, [containers]);

  // Keep refs to avoid restarting the effect when callbacks change
  const scaleUpRef = useRef(scaleUp);
  scaleUpRef.current = scaleUp;
  const scaleDownRef = useRef(scaleDown);
  scaleDownRef.current = scaleDown;

  // Auto-scaling demo
  useEffect(() => {
    if (!scalingDemo) return;
    const sequence = [
      () => {
        setEvents((p) => [...p, '📈 Traffic spike detected! CPU > 80%']);
      },
      () => scaleUpRef.current(),
      () => scaleUpRef.current(),
      () => {
        setEvents((p) => [...p, '📉 Traffic normalizing...']);
      },
      () => scaleDownRef.current(),
      () => scaleDownRef.current(),
      () => {
        setScalingDemo(false);
        setEvents((p) => [...p, '✅ Auto-scaling complete']);
      },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        sequence[i]();
        i++;
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [scalingDemo]);

  const reset = useCallback(() => {
    setContainers([
      { id: 'c1', name: 'web-app-1', status: 'running', cpu: 45, memory: 62, pod: 'pod-1' },
      { id: 'c2', name: 'web-app-2', status: 'running', cpu: 38, memory: 55, pod: 'pod-1' },
      { id: 'c3', name: 'api-svc-1', status: 'running', cpu: 72, memory: 78, pod: 'pod-2' },
      { id: 'c4', name: 'api-svc-2', status: 'running', cpu: 65, memory: 70, pod: 'pod-2' },
      { id: 'c5', name: 'worker-1', status: 'running', cpu: 28, memory: 40, pod: 'pod-3' },
    ]);
    setEvents(['🟢 Cluster healthy - 5 containers running across 3 pods']);
    setIsSimulating(false);
    setScalingDemo(false);
  }, []);

  const getStatusColor = (status: Container['status']): string => {
    switch (status) {
      case 'running':
        return 'bg-emerald-400 border-emerald-500';
      case 'creating':
        return 'bg-sky-400 border-sky-500 animate-pulse';
      case 'terminating':
        return 'bg-red-400 border-red-500 animate-pulse';
      case 'pending':
        return 'bg-amber-400 border-amber-500';
    }
  };

  const getCpuBarColor = (cpu: number): string => {
    if (cpu > 80) return 'bg-red-500';
    if (cpu > 60) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  // Group containers by pod
  const pods = containers.reduce<Record<string, Container[]>>((acc, c) => {
    if (!acc[c.pod]) acc[c.pod] = [];
    acc[c.pod].push(c);
    return acc;
  }, {});

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 rounded-2xl p-6 overflow-hidden">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-1">Container Orchestration</h3>
          <p className="text-sm text-slate-300">Kubernetes-style pod management and auto-scaling</p>
        </div>

        {/* Cluster overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700">
            <div className="text-2xl font-bold text-sky-400">{containers.length}</div>
            <div className="text-xs text-slate-400">Containers</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700">
            <div className="text-2xl font-bold text-emerald-400">{Object.keys(pods).length}</div>
            <div className="text-xs text-slate-400">Pods</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700">
            <div className="text-2xl font-bold text-amber-400">
              {Math.round(containers.reduce((s, c) => s + c.cpu, 0) / containers.length)}%
            </div>
            <div className="text-xs text-slate-400">Avg CPU</div>
          </div>
        </div>

        {/* Pod visualization */}
        <div className="space-y-3 mb-6">
          {Object.entries(pods).map(([podName, podContainers]) => (
            <div key={podName} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-mono text-slate-300">{podName}</span>
                <span className="text-xs text-slate-500 ml-auto">
                  {podContainers.length} container{podContainers.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {podContainers.map((container) => (
                  <div
                    key={container.id}
                    className={`rounded-lg p-3 border transition-all duration-500 ${
                      container.status === 'terminating'
                        ? 'opacity-50 scale-95'
                        : container.status === 'creating'
                          ? 'opacity-70 scale-95'
                          : ''
                    } bg-slate-900/60 border-slate-600`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full border ${getStatusColor(container.status)}`}
                      />
                      <span className="text-xs font-mono text-white">{container.name}</span>
                    </div>
                    {/* CPU bar */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500 w-8">CPU</span>
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${getCpuBarColor(container.cpu)}`}
                          style={{ width: `${container.cpu}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-8 text-right">
                        {Math.round(container.cpu)}%
                      </span>
                    </div>
                    {/* Memory bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-8">MEM</span>
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-500 transition-all duration-1000"
                          style={{ width: `${container.memory}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-8 text-right">
                        {Math.round(container.memory)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Event log */}
        <div className="bg-black/50 rounded-xl p-4 font-mono text-xs max-h-32 overflow-y-auto border border-slate-700">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-400 text-xs ml-2">kubectl events</span>
          </div>
          {events.slice(-8).map((evt, i) => (
            <div key={i} className="text-slate-300 leading-relaxed">
              {evt}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors text-sm"
          aria-label={isSimulating ? 'Pause simulation' : 'Start simulation'}
        >
          {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isSimulating ? 'Pause' : 'Simulate'}
        </button>
        <button
          onClick={scaleUp}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          Scale Up ↑
        </button>
        <button
          onClick={scaleDown}
          disabled={containers.length <= 2}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
        >
          Scale Down ↓
        </button>
        <button
          onClick={() => setScalingDemo(true)}
          disabled={scalingDemo}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
        >
          🎬 Auto-Scale Demo
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors text-sm"
          aria-label="Reset cluster"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default React.memo(ContainerOrchestrationViz);
