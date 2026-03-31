import React, { useState, useEffect, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { RefreshCw, Play, Pause } from 'lucide-react';

const PHASES = [
  {
    id: 'define',
    label: 'Problem\nDefinition',
    emoji: '🎯',
    color: '#e11d48',
    lightColor: '#ffe4e6',
  },
  { id: 'data', label: 'Data\nPreparation', emoji: '🧹', color: '#c026d3', lightColor: '#fae8ff' },
  { id: 'train', label: 'Model\nTraining', emoji: '🏋️', color: '#7c3aed', lightColor: '#ede9fe' },
  { id: 'eval', label: 'Model\nEvaluation', emoji: '📊', color: '#2563eb', lightColor: '#dbeafe' },
  {
    id: 'deploy',
    label: 'Model\nDeployment',
    emoji: '🚀',
    color: '#059669',
    lightColor: '#d1fae5',
  },
  {
    id: 'monitor',
    label: 'Monitoring\n& Maintenance',
    emoji: '👁️',
    color: '#d97706',
    lightColor: '#fef3c7',
  },
];

const PHASE_DETAILS: Record<
  string,
  { title: string; description: string; outputs: string[]; infra: string }
> = {
  define: {
    title: 'Problem Definition',
    description:
      'Identify the specific task the AI must solve, define success metrics, and establish baseline performance requirements.',
    outputs: ['Project Roadmap', 'KPIs & Metrics', 'Data Requirements'],
    infra: 'Collaboration Platforms',
  },
  data: {
    title: 'Data Preparation',
    description:
      'Gather raw data, clean it, handle missing values, and transform it into a format digestible by mathematical models.',
    outputs: ['Clean Datasets', 'Feature Store', 'Data Versioning'],
    infra: 'Data Lakes & Feature Stores',
  },
  train: {
    title: 'Model Training',
    description:
      'Select optimal architecture, feed prepared data, and iteratively refine hyperparameters to learn underlying patterns.',
    outputs: ['Trained Weights', 'Hyperparameters', 'Training Logs'],
    infra: 'GPU/TPU Clusters',
  },
  eval: {
    title: 'Model Evaluation',
    description:
      'Rigorously test the trained model against unseen data to validate generalization and prevent memorization.',
    outputs: ['Accuracy Metrics', 'Confusion Matrix', 'Error Analysis'],
    infra: 'Model Registry',
  },
  deploy: {
    title: 'Model Deployment',
    description:
      'Package the validated model using containerization and deploy it behind an API endpoint for production use.',
    outputs: ['API Endpoint', 'Docker Container', 'Scaling Config'],
    infra: 'Kubernetes / Cloud',
  },
  monitor: {
    title: 'Monitoring & Maintenance',
    description:
      'Continuously track model accuracy, detect data drift, and trigger retraining pipelines when performance degrades.',
    outputs: ['Drift Alerts', 'Performance Logs', 'Retrain Triggers'],
    infra: 'Feedback Loops & Schedulers',
  },
};

const MLLifecycle: React.FC = () => {
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [animatingPhase, setAnimatingPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pulseOpacity, setPulseOpacity] = useState(1);

  const cx = 300;
  const cy = 240;
  const radius = 160;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAnimatingPhase((prev) => (prev + 1) % PHASES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    let frame: number;
    let start: number;
    const animate = (ts: number): void => {
      if (!start) start = ts;
      const elapsed = (ts - start) % 2000;
      setPulseOpacity(0.4 + 0.6 * Math.abs(Math.sin((elapsed / 2000) * Math.PI)));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const getNodePosition = useCallback(
    (index: number): { x: number; y: number } => {
      const angle = (index / PHASES.length) * 2 * Math.PI - Math.PI / 2;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    },
    [cx, cy, radius]
  );

  const detail = activePhase ? PHASE_DETAILS[activePhase] : null;

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">The Machine Learning Lifecycle</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        AI development is a structured, iterative, and highly cyclical process. Explore each phase
        of the pipeline — from problem definition to continuous monitoring.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Interactive Lifecycle Visualization */}
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Interactive Lifecycle Pipeline</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Animate'}
            </button>
            <button
              onClick={() => {
                setActivePhase(null);
                setAnimatingPhase(0);
                setIsPlaying(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-gray-50 to-rose-50/30 rounded-xl p-4 border border-rose-100">
          <svg
            viewBox="0 0 600 480"
            className="w-full h-auto"
            role="img"
            aria-label="ML Lifecycle circular diagram"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
              </marker>
            </defs>

            {/* Connection arrows between phases */}
            {PHASES.map((_, i) => {
              const from = getNodePosition(i);
              const to = getNodePosition((i + 1) % PHASES.length);
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              const offsetX = (midX - cx) * 0.15;
              const offsetY = (midY - cy) * 0.15;
              const isActive = animatingPhase === i && isPlaying;

              return (
                <path
                  key={`arrow-${i}`}
                  d={`M ${from.x} ${from.y} Q ${midX + offsetX} ${midY + offsetY} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={isActive ? PHASES[i].color : '#d1d5db'}
                  strokeWidth={isActive ? 3 : 1.5}
                  strokeDasharray={isActive ? '' : '6 4'}
                  markerEnd="url(#arrowhead)"
                  className="transition-all duration-500"
                />
              );
            })}

            {/* Feedback loop arrow (Monitor -> Data) */}
            <path
              d={`M ${getNodePosition(5).x - 20} ${getNodePosition(5).y + 10}
                  C ${cx - radius * 1.4} ${cy + radius * 0.8},
                    ${cx - radius * 1.4} ${cy - radius * 0.5},
                    ${getNodePosition(1).x - 20} ${getNodePosition(1).y - 10}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="8 4"
              opacity={pulseOpacity}
              markerEnd="url(#arrowhead)"
            />
            <text
              x={cx - radius * 1.35}
              y={cy + 15}
              textAnchor="middle"
              className="text-[10px] font-semibold"
              fill="#d97706"
              transform={`rotate(-90, ${cx - radius * 1.35}, ${cy + 15})`}
            >
              Feedback Loop
            </text>

            {/* Phase nodes */}
            {PHASES.map((phase, i) => {
              const pos = getNodePosition(i);
              const isActive = activePhase === phase.id || (isPlaying && animatingPhase === i);

              return (
                <g
                  key={phase.id}
                  onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
                  className="cursor-pointer"
                  role="button"
                  aria-label={`Phase: ${phase.label.replace('\n', ' ')}`}
                >
                  {/* Glow ring when active */}
                  {isActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={48}
                      fill="none"
                      stroke={phase.color}
                      strokeWidth={2}
                      opacity={0.4}
                      filter="url(#glow)"
                    />
                  )}
                  {/* Node circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={42}
                    fill={isActive ? phase.lightColor : 'white'}
                    stroke={phase.color}
                    strokeWidth={isActive ? 3 : 2}
                    className="transition-all duration-300"
                  />
                  {/* Emoji */}
                  <text x={pos.x} y={pos.y - 8} textAnchor="middle" className="text-lg">
                    {phase.emoji}
                  </text>
                  {/* Label */}
                  {phase.label.split('\n').map((line, li) => (
                    <text
                      key={li}
                      x={pos.x}
                      y={pos.y + 10 + li * 12}
                      textAnchor="middle"
                      className="text-[9px] font-semibold"
                      fill={phase.color}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}

            {/* Center label */}
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              className="text-sm font-bold"
              fill="#374151"
            >
              ML
            </text>
            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              className="text-sm font-bold"
              fill="#374151"
            >
              Lifecycle
            </text>
          </svg>
        </div>

        {/* Detail panel */}
        {detail && (
          <div className="mt-6 p-5 bg-gradient-to-r from-rose-50 to-fuchsia-50 rounded-xl border border-rose-200 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{detail.title}</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">{detail.description}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 text-sm mb-2">Key Outputs</h4>
                <div className="flex flex-wrap gap-2">
                  {detail.outputs.map((o) => (
                    <span
                      key={o}
                      className="px-3 py-1 bg-white rounded-full text-xs font-medium text-rose-700 border border-rose-200"
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm mb-2">Infrastructure</h4>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-fuchsia-700 border border-fuchsia-200">
                  {detail.infra}
                </span>
              </div>
            </div>
          </div>
        )}
      </ThemeCard>

      {/* Analogy */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🏃 The Analogy: Professional Athlete
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Imagine the career of an Olympic sprinter. <strong>Problem Definition</strong> is deciding
          which race to run — the 100-meter dash. <strong>Data Preparation</strong> is diet and
          conditioning; bad food means poor performance. <strong>Training</strong> is the daily
          regimen on the track, making tiny adjustments to shave off milliseconds.
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong>Evaluation</strong> is the trial race before the Olympics.{' '}
          <strong>Deployment</strong> is the Olympic final itself. And <strong>Monitoring</strong>{' '}
          is post-race physical therapy and off-season training to prevent performance degradation.
        </p>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default MLLifecycle;
