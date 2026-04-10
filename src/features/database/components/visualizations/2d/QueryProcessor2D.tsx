import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw, ArrowRight } from 'lucide-react';

interface Stage {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  fill: string;
  description: string;
  detail: string;
}

interface QueryProcessor2DProps {
  className?: string;
}

const QueryProcessor2D: React.FC<QueryProcessor2DProps> = React.memo(({ className = '' }) => {
  const [activeStage, setActiveStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const stages: Stage[] = useMemo(
    () => [
      {
        id: 'sql',
        label: 'SQL Query',
        shortLabel: 'SQL',
        color: '#6366f1',
        fill: '#eef2ff',
        description: 'Raw SQL text arrives from the client application.',
        detail: 'SELECT name, balance FROM accounts WHERE balance > 1000 ORDER BY balance DESC;',
      },
      {
        id: 'parser',
        label: 'Parser',
        shortLabel: 'Parse',
        color: '#0891b2',
        fill: '#ecfeff',
        description: 'Lexer tokenizes SQL → Parser builds an Abstract Syntax Tree (AST).',
        detail:
          'Validates syntax, resolves table/column names against the data dictionary, checks permissions.',
      },
      {
        id: 'rewriter',
        label: 'Query Rewriter',
        shortLabel: 'Rewrite',
        color: '#7c3aed',
        fill: '#f5f3ff',
        description: 'Transforms the AST: expands views, applies rules, simplifies predicates.',
        detail:
          'View expansion, subquery de-correlation, constant folding, predicate pushdown (logical rewrites).',
      },
      {
        id: 'optimizer',
        label: 'Cost-Based Optimizer',
        shortLabel: 'Optimize',
        color: '#059669',
        fill: '#ecfdf5',
        description:
          'Generates candidate plans, estimates cost using statistics, picks the cheapest plan.',
        detail:
          'Join ordering, index selection, nested loop vs hash join vs merge join. Uses table stats + histograms.',
      },
      {
        id: 'executor',
        label: 'Execution Engine',
        shortLabel: 'Execute',
        color: '#dc2626',
        fill: '#fef2f2',
        description: 'Executes the chosen physical plan using an iterator (Volcano) model.',
        detail:
          'Each operator (Seq Scan, Index Scan, Hash Join, Sort) is a node that pulls rows from child nodes.',
      },
      {
        id: 'result',
        label: 'Result Set',
        shortLabel: 'Result',
        color: '#0d9488',
        fill: '#f0fdfa',
        description: 'Rows are returned to the client, one batch at a time.',
        detail: 'Streamed via the wire protocol (e.g., PostgreSQL protocol or Oracle Net).',
      },
    ],
    []
  );

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStage((prev) => {
        if (prev >= stages.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [isPlaying, stages.length]);

  const handleReset = useCallback(() => {
    setActiveStage(0);
    setIsPlaying(false);
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (activeStage >= stages.length - 1) {
      setActiveStage(0);
    }
    setIsPlaying((p) => !p);
  }, [activeStage, stages.length]);

  const currentStage = stages[activeStage];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Pipeline SVG */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-hidden">
        <svg
          viewBox="0 0 840 120"
          className="w-full h-auto"
          role="img"
          aria-label="SQL query processing pipeline showing 6 stages from SQL input to result output"
        >
          <defs>
            <marker
              id="qp-arrow"
              viewBox="0 0 10 7"
              refX="10"
              refY="3.5"
              markerWidth="8"
              markerHeight="6"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
            </marker>
          </defs>

          {stages.map((stage, i) => {
            const x = 20 + i * 138;
            const y = 15;
            const w = 118;
            const h = 70;
            const isActive = i === activeStage;
            const isPast = i < activeStage;

            return (
              <g key={stage.id}>
                {/* Arrow between nodes */}
                {i > 0 && (
                  <line
                    x1={x - 20}
                    y1={y + h / 2}
                    x2={x}
                    y2={y + h / 2}
                    stroke={isPast || isActive ? stage.color : '#d1d5db'}
                    strokeWidth={isPast || isActive ? 2 : 1}
                    markerEnd="url(#qp-arrow)"
                  />
                )}

                {/* Stage box */}
                <g
                  role="button"
                  tabIndex={0}
                  aria-label={`Stage ${i + 1}: ${stage.label}`}
                  aria-pressed={isActive}
                  onClick={() => {
                    setActiveStage(i);
                    setIsPlaying(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveStage(i);
                      setIsPlaying(false);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx="10"
                    fill={isActive || isPast ? stage.fill : '#f9fafb'}
                    stroke={isActive ? stage.color : isPast ? stage.color : '#e5e7eb'}
                    strokeWidth={isActive ? 2.5 : 1}
                  />
                  {/* Stage number */}
                  <circle
                    cx={x + 18}
                    cy={y + 20}
                    r="10"
                    fill={isActive || isPast ? stage.color : '#d1d5db'}
                  />
                  <text
                    x={x + 18}
                    y={y + 24}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="white"
                  >
                    {i + 1}
                  </text>
                  {/* Label */}
                  <text
                    x={x + w / 2}
                    y={y + 50}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={isActive ? 'bold' : 'normal'}
                    fill={isActive ? stage.color : '#4b5563'}
                  >
                    {stage.shortLabel}
                  </text>
                </g>

                {/* Active pulse */}
                {isActive && (
                  <rect
                    x={x - 2}
                    y={y - 2}
                    width={w + 4}
                    height={h + 4}
                    rx="12"
                    fill="none"
                    stroke={stage.color}
                    strokeWidth="1.5"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.6;0;0.6"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </rect>
                )}

                {/* Data flow dot (animated) */}
                {isActive && isPlaying && i < stages.length - 1 && (
                  <circle r="4" fill={stage.color}>
                    <animateMotion
                      dur="1.5s"
                      repeatCount="1"
                      path={`M${x + w / 2},${y + h / 2} L${x + 138 + 59},${y + h / 2}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Progress bar */}
          <rect x="20" y="100" width="800" height="4" rx="2" fill="#e5e7eb" />
          <rect
            x="20"
            y="100"
            width={(800 * activeStage) / (stages.length - 1)}
            height="4"
            rx="2"
            fill="#0d9488"
            style={{ transition: 'width 0.3s ease' }}
          />
        </svg>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleTogglePlay}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
          aria-label="Reset animation"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <div className="text-sm text-gray-500 ml-2">
          Stage {activeStage + 1} / {stages.length}
        </div>
      </div>

      {/* Detail Panel */}
      <div
        className="rounded-xl border-2 p-5 transition-all duration-300"
        style={{ borderColor: currentStage.color, backgroundColor: currentStage.fill }}
      >
        <div className="flex items-center gap-2 mb-2">
          <ArrowRight className="w-5 h-5" style={{ color: currentStage.color }} />
          <h3 className="text-lg font-bold" style={{ color: currentStage.color }}>
            {currentStage.label}
          </h3>
        </div>
        <p className="text-sm text-gray-700 mb-2">{currentStage.description}</p>
        <div className="bg-white/60 rounded-lg p-3 text-xs font-mono text-gray-600">
          {currentStage.detail}
        </div>
      </div>
    </div>
  );
});

QueryProcessor2D.displayName = 'QueryProcessor2D';

export default QueryProcessor2D;
