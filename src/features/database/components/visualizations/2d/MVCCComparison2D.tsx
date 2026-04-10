import React, { useState, useCallback, useMemo } from 'react';
import { RefreshCw, Database } from 'lucide-react';

interface RowVersion {
  xmin: number;
  xmax: number | null;
  data: string;
  location: string;
}

interface MVCCComparison2DProps {
  className?: string;
}

const MVCCComparison2D: React.FC<MVCCComparison2DProps> = React.memo(({ className = '' }) => {
  const [step, setStep] = useState(0);
  const [engine, setEngine] = useState<'oracle' | 'postgres'>('oracle');

  const oracleSteps = useMemo(
    () => [
      {
        title: 'Initial State',
        description: 'Row exists in data table with value "Alice, $1000".',
        table: [
          { xmin: 100, xmax: null, data: 'Alice, $1000', location: 'Data Block #42' },
        ] as RowVersion[],
        undo: [] as RowVersion[],
        note: 'Data block holds the current version. UNDO tablespace is empty for this row.',
      },
      {
        title: 'T200: UPDATE balance = $800',
        description: 'T200 writes new value in-place. Old version moved to UNDO tablespace.',
        table: [
          { xmin: 200, xmax: null, data: 'Alice, $800', location: 'Data Block #42' },
        ] as RowVersion[],
        undo: [
          { xmin: 100, xmax: 200, data: 'Alice, $1000', location: 'UNDO Segment' },
        ] as RowVersion[],
        note: 'New row written IN-PLACE. Old version copied to separate UNDO storage.',
      },
      {
        title: 'T150 reads (started before T200)',
        description: 'T150 needs the pre-T200 version. Oracle reconstructs it from UNDO.',
        table: [
          { xmin: 200, xmax: null, data: 'Alice, $800', location: 'Data Block #42' },
        ] as RowVersion[],
        undo: [
          {
            xmin: 100,
            xmax: 200,
            data: 'Alice, $1000 ← T150 reads this',
            location: 'UNDO Segment',
          },
        ] as RowVersion[],
        note: 'T150 follows the UNDO chain to find a version visible at its SCN. This is "consistent read".',
      },
      {
        title: 'UNDO purged (after all readers done)',
        description: 'Once no transaction needs the old version, UNDO space is reclaimed.',
        table: [
          { xmin: 200, xmax: null, data: 'Alice, $800', location: 'Data Block #42' },
        ] as RowVersion[],
        undo: [] as RowVersion[],
        note: 'UNDO automatically managed. If purged too early → ORA-01555 "snapshot too old" error.',
      },
    ],
    []
  );

  const postgresSteps = useMemo(
    () => [
      {
        title: 'Initial State',
        description: 'Row lives in the heap page with xmin=100, xmax=0 (not expired).',
        table: [
          { xmin: 100, xmax: null, data: 'Alice, $1000', location: 'Heap Page #42' },
        ] as RowVersion[],
        deadTuples: 0,
        note: 'All versions stored inline in the same heap page. No separate UNDO storage.',
      },
      {
        title: 'T200: UPDATE balance = $800',
        description: 'PostgreSQL creates a NEW tuple. Old tuple marked xmax=200 (dead).',
        table: [
          { xmin: 100, xmax: 200, data: 'Alice, $1000 (dead)', location: 'Heap Page #42' },
          { xmin: 200, xmax: null, data: 'Alice, $800', location: 'Heap Page #42' },
        ] as RowVersion[],
        deadTuples: 1,
        note: 'BOTH versions coexist in the same page. Old tuple is "dead" but not removed yet.',
      },
      {
        title: 'T150 reads (started before T200)',
        description: "T150's snapshot sees xmin=100 as visible. The dead tuple serves the read.",
        table: [
          {
            xmin: 100,
            xmax: 200,
            data: 'Alice, $1000 ← T150 reads this',
            location: 'Heap Page #42',
          },
          { xmin: 200, xmax: null, data: 'Alice, $800', location: 'Heap Page #42' },
        ] as RowVersion[],
        deadTuples: 1,
        note: 'Dead tuple is still needed by T150. Visibility check: xmin ≤ snapshot < xmax.',
      },
      {
        title: 'Autovacuum cleans dead tuples',
        description: 'After all readers finish, Autovacuum marks space as reusable.',
        table: [
          { xmin: 200, xmax: null, data: 'Alice, $800', location: 'Heap Page #42' },
        ] as RowVersion[],
        deadTuples: 0,
        note: 'VACUUM reclaims dead tuple space. Without it → table bloat. Autovacuum runs automatically.',
      },
    ],
    []
  );

  const steps = engine === 'oracle' ? oracleSteps : postgresSteps;
  const current = steps[step];

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }, [steps.length]);

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleEngineSwitch = useCallback((e: 'oracle' | 'postgres') => {
    setEngine(e);
    setStep(0);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Engine Selector */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => handleEngineSwitch('oracle')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
            engine === 'oracle'
              ? 'bg-blue-600 text-white border-transparent shadow-lg'
              : 'bg-white text-gray-600 border-gray-200 hover:shadow-md'
          }`}
        >
          <Database className="w-4 h-4" />
          Oracle (Undo/Redo)
        </button>
        <button
          onClick={() => handleEngineSwitch('postgres')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
            engine === 'postgres'
              ? 'bg-emerald-600 text-white border-transparent shadow-lg'
              : 'bg-white text-gray-600 border-gray-200 hover:shadow-md'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          PostgreSQL (Inline MVCC)
        </button>
      </div>

      {/* SVG Visualization */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-hidden">
        <svg
          viewBox="0 0 720 200"
          className="w-full h-auto"
          role="img"
          aria-label={`MVCC visualization for ${engine === 'oracle' ? 'Oracle' : 'PostgreSQL'}`}
        >
          {/* Data Table Area */}
          <rect x="10" y="10" width="340" height="180" rx="10" fill="#f8fafc" stroke="#e2e8f0" />
          <text x="180" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#334155">
            {engine === 'oracle' ? 'Data Block' : 'Heap Page'}
          </text>

          {current.table.map((row, i) => {
            const ry = 42 + i * 60;
            const isDead = row.xmax !== null;
            return (
              <g key={`row-${i}`}>
                <rect
                  x="20"
                  y={ry}
                  width="320"
                  height="48"
                  rx="6"
                  fill={isDead ? '#fef2f2' : '#ecfdf5'}
                  stroke={isDead ? '#fca5a5' : '#6ee7b7'}
                  strokeWidth="1.5"
                />
                {/* xmin */}
                <text x="30" y={ry + 18} fontSize="8" fill="#6b7280">
                  xmin={row.xmin}
                </text>
                {/* xmax */}
                <text x="30" y={ry + 32} fontSize="8" fill="#6b7280">
                  xmax={row.xmax ?? '∅'}
                </text>
                {/* Data */}
                <text
                  x="180"
                  y={ry + 26}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill={isDead ? '#ef4444' : '#059669'}
                >
                  {row.data}
                </text>
                {/* Location */}
                <text x="330" y={ry + 26} textAnchor="end" fontSize="7" fill="#94a3b8">
                  {row.location}
                </text>
              </g>
            );
          })}

          {/* UNDO / Dead Tuples Area (right side) */}
          <rect
            x="380"
            y="10"
            width="330"
            height="180"
            rx="10"
            fill={engine === 'oracle' ? '#eff6ff' : '#faf5ff'}
            stroke={engine === 'oracle' ? '#bfdbfe' : '#e9d5ff'}
          />
          <text x="545" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#334155">
            {engine === 'oracle' ? 'UNDO Tablespace' : 'Autovacuum Status'}
          </text>

          {engine === 'oracle' ? (
            // Oracle UNDO entries
            (current as (typeof oracleSteps)[number]).undo.length > 0 ? (
              (current as (typeof oracleSteps)[number]).undo.map((row, i) => {
                const ry = 42 + i * 60;
                return (
                  <g key={`undo-${i}`}>
                    <rect
                      x="390"
                      y={ry}
                      width="310"
                      height="48"
                      rx="6"
                      fill="#fef3c7"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                    />
                    <text x="400" y={ry + 18} fontSize="8" fill="#6b7280">
                      xmin={row.xmin} xmax={row.xmax ?? '∅'}
                    </text>
                    <text
                      x="540"
                      y={ry + 36}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#92400e"
                    >
                      {row.data}
                    </text>
                  </g>
                );
              })
            ) : (
              <text x="545" y="100" textAnchor="middle" fontSize="12" fill="#94a3b8">
                (empty)
              </text>
            )
          ) : (
            // PostgreSQL dead tuple meter
            <g>
              <text x="545" y="60" textAnchor="middle" fontSize="10" fill="#6b7280">
                Dead Tuples
              </text>
              <rect x="430" y="70" width="230" height="20" rx="4" fill="#e5e7eb" />
              <rect
                x="430"
                y="70"
                width={(current as (typeof postgresSteps)[number]).deadTuples > 0 ? 115 : 0}
                height="20"
                rx="4"
                fill="#f59e0b"
                style={{ transition: 'width 0.3s ease' }}
              />
              <text
                x="545"
                y="84"
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#374151"
              >
                {(current as (typeof postgresSteps)[number]).deadTuples} dead tuple(s)
              </text>
              <text x="545" y="120" textAnchor="middle" fontSize="9" fill="#6b7280">
                {(current as (typeof postgresSteps)[number]).deadTuples > 0
                  ? 'Autovacuum will clean these up'
                  : 'No cleanup needed'}
              </text>
            </g>
          )}

          {/* Progress dots */}
          {steps.map((_, i) => (
            <circle
              key={i}
              cx={300 + i * 30}
              cy="196"
              r={i === step ? 5 : 3}
              fill={i === step ? '#0d9488' : i < step ? '#6ee7b7' : '#d1d5db'}
            />
          ))}
        </svg>
      </div>

      {/* Step Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePrev}
          disabled={step === 0}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>
        <span className="text-sm text-gray-500">
          Step {step + 1} / {steps.length}
        </span>
        <button
          onClick={handleNext}
          disabled={step === steps.length - 1}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Description */}
      <div
        className={`rounded-xl border-2 p-4 transition-all duration-300 ${
          engine === 'oracle' ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'
        }`}
      >
        <h3
          className={`font-bold text-sm mb-1 ${
            engine === 'oracle' ? 'text-blue-800' : 'text-emerald-800'
          }`}
        >
          {current.title}
        </h3>
        <p className="text-sm text-gray-700 mb-2">{current.description}</p>
        <p className="text-xs text-gray-500 italic">{current.note}</p>
      </div>
    </div>
  );
});

MVCCComparison2D.displayName = 'MVCCComparison2D';

export default MVCCComparison2D;
