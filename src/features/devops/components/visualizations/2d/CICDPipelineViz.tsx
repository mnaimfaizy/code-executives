import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface PipelineStage {
  id: string;
  label: string;
  icon: string;
  duration: string;
  status: 'waiting' | 'running' | 'success' | 'failed';
  details: string[];
}

const INITIAL_STAGES: PipelineStage[] = [
  {
    id: 'source',
    label: 'Source',
    icon: '📝',
    duration: '~0s',
    status: 'waiting',
    details: ['Git push detected', 'Webhook triggered', 'Branch: main'],
  },
  {
    id: 'build',
    label: 'Build',
    icon: '🔨',
    duration: '~2min',
    status: 'waiting',
    details: ['Install dependencies', 'Compile TypeScript', 'Bundle assets'],
  },
  {
    id: 'test',
    label: 'Test',
    icon: '🧪',
    duration: '~5min',
    status: 'waiting',
    details: ['Unit tests (312 passed)', 'Integration tests', 'E2E tests (Playwright)'],
  },
  {
    id: 'security',
    label: 'Security Scan',
    icon: '🔒',
    duration: '~1min',
    status: 'waiting',
    details: ['SAST analysis', 'Dependency audit', 'Container scan'],
  },
  {
    id: 'staging',
    label: 'Deploy Staging',
    icon: '🔄',
    duration: '~3min',
    status: 'waiting',
    details: ['Container build', 'Push to registry', 'Rolling update'],
  },
  {
    id: 'approval',
    label: 'Approval Gate',
    icon: '✅',
    duration: 'Manual',
    status: 'waiting',
    details: ['Code review approved', 'QA sign-off', 'Release manager OK'],
  },
  {
    id: 'production',
    label: 'Deploy Prod',
    icon: '🚀',
    duration: '~2min',
    status: 'waiting',
    details: ['Blue-green deploy', 'Health checks pass', 'Traffic shifted 100%'],
  },
];

const CICDPipelineViz: React.FC = () => {
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [currentStage, setCurrentStage] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [logs, setLogs] = useState<string[]>(['🟡 Pipeline ready. Press Play to start...']);

  useEffect(() => {
    if (!isPlaying || currentStage >= stages.length) return;

    const timer = setTimeout(() => {
      const nextStage = currentStage + 1;
      if (nextStage >= stages.length) {
        setIsPlaying(false);
        setLogs((prev) => [...prev, '✅ Pipeline completed successfully!']);
        return;
      }

      setCurrentStage(nextStage);
      setStages((prev) =>
        prev.map((s, i) => ({
          ...s,
          status: i < nextStage ? 'success' : i === nextStage ? 'running' : 'waiting',
        }))
      );

      const stage = INITIAL_STAGES[nextStage];
      setLogs((prev) => [
        ...prev,
        `🔵 [${stage.label}] Starting...`,
        ...stage.details.map((d) => `   ├─ ${d}`),
      ]);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStage, stages.length]);

  const reset = useCallback(() => {
    setStages(INITIAL_STAGES);
    setCurrentStage(-1);
    setIsPlaying(false);
    setLogs(['🟡 Pipeline ready. Press Play to start...']);
  }, []);

  const getStatusColor = (status: PipelineStage['status']): string => {
    switch (status) {
      case 'success':
        return 'bg-emerald-500 border-emerald-400';
      case 'running':
        return 'bg-sky-500 border-sky-400 animate-pulse';
      case 'failed':
        return 'bg-red-500 border-red-400';
      default:
        return 'bg-slate-600 border-slate-500';
    }
  };

  const getConnectorColor = (index: number): string => {
    if (index >= stages.length - 1) return '';
    const nextStage = stages[index + 1];
    if (stages[index].status === 'success' && nextStage.status !== 'waiting')
      return 'bg-emerald-500';
    if (stages[index].status === 'success') return 'bg-emerald-500';
    return 'bg-slate-600';
  };

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 rounded-2xl p-6 overflow-hidden">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-1">CI/CD Pipeline Visualization</h3>
          <p className="text-sm text-slate-300">From code commit to production deployment</p>
        </div>

        {/* Pipeline stages - horizontal on desktop, vertical on mobile */}
        <div className="hidden md:flex items-start justify-between mb-6 relative px-4">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center flex-1 relative z-10">
                {/* Node */}
                <div
                  className={`w-14 h-14 rounded-xl ${getStatusColor(stage.status)} border-2 flex items-center justify-center text-2xl shadow-lg transition-all duration-500`}
                >
                  {stage.status === 'running' ? (
                    <div className="animate-spin text-lg">⏳</div>
                  ) : stage.status === 'success' ? (
                    '✓'
                  ) : (
                    stage.icon
                  )}
                </div>
                {/* Label */}
                <div className="mt-2 text-center">
                  <p className="text-xs font-semibold text-white">{stage.label}</p>
                  <p className="text-xs text-slate-400">{stage.duration}</p>
                </div>
              </div>
              {/* Connector */}
              {index < stages.length - 1 && (
                <div className="flex items-center flex-shrink-0 mt-6 mx-1">
                  <div
                    className={`h-1 w-8 ${getConnectorColor(index)} rounded transition-colors duration-500`}
                  />
                  <div
                    className={`w-0 h-0 border-t-4 border-b-4 border-l-6 border-t-transparent border-b-transparent ${stages[index].status === 'success' ? 'border-l-emerald-500' : 'border-l-slate-600'} transition-colors duration-500`}
                    style={{ borderLeftWidth: '6px' }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile vertical view */}
        <div className="md:hidden space-y-3 mb-6">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-lg ${getStatusColor(stage.status)} border flex items-center justify-center text-lg shadow-md transition-all duration-500`}
                >
                  {stage.status === 'running'
                    ? '⏳'
                    : stage.status === 'success'
                      ? '✓'
                      : stage.icon}
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={`w-0.5 h-4 ${getConnectorColor(index)} transition-colors duration-500`}
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{stage.label}</p>
                <p className="text-xs text-slate-400">{stage.duration}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Log output - terminal style */}
        <div className="bg-black/50 rounded-xl p-4 font-mono text-xs max-h-40 overflow-y-auto border border-slate-700">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-400 text-xs ml-2">pipeline-output</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => {
            if (currentStage >= stages.length - 1) reset();
            setIsPlaying(!isPlaying);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors text-sm"
          aria-label={isPlaying ? 'Pause pipeline' : 'Run pipeline'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Run Pipeline'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors text-sm"
          aria-label="Reset pipeline"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default React.memo(CICDPipelineViz);
