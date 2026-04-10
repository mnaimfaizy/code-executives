import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface Transaction {
  id: string;
  color: string;
  label: string;
}

interface Step {
  tx: string;
  action: string;
  description: string;
  accountA: number;
  accountB: number;
  walEntry?: string;
  status: 'pending' | 'committed' | 'rolled-back';
  violation?: string;
}

interface TransactionACID2DProps {
  className?: string;
}

const TransactionACID2D: React.FC<TransactionACID2DProps> = React.memo(({ className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scenario, setScenario] = useState<'success' | 'crash'>('success');

  const transactions: Transaction[] = useMemo(
    () => [
      { id: 'T1', color: '#3b82f6', label: 'Transfer $200' },
      { id: 'T2', color: '#8b5cf6', label: 'Read Balance' },
    ],
    []
  );

  const successSteps: Step[] = useMemo(
    () => [
      {
        tx: 'T1',
        action: 'BEGIN',
        description: 'T1 starts: Transfer $200 from A → B',
        accountA: 1000,
        accountB: 500,
        status: 'pending',
      },
      {
        tx: 'T1',
        action: 'READ A',
        description: 'T1 reads Account A balance: $1000',
        accountA: 1000,
        accountB: 500,
        walEntry: 'T1: READ accounts WHERE id=A → $1000',
        status: 'pending',
      },
      {
        tx: 'T2',
        action: 'BEGIN + READ A',
        description: 'T2 starts and reads A. Isolation: T2 sees $1000 (T1 uncommitted)',
        accountA: 1000,
        accountB: 500,
        walEntry: 'T2: READ accounts WHERE id=A → $1000',
        status: 'pending',
      },
      {
        tx: 'T1',
        action: 'WRITE A = $800',
        description: 'T1 debits $200 from A. Change is NOT visible to T2 (isolation).',
        accountA: 800,
        accountB: 500,
        walEntry: 'T1: UPDATE accounts SET balance=800 WHERE id=A',
        status: 'pending',
      },
      {
        tx: 'T1',
        action: 'WRITE B = $700',
        description: 'T1 credits $200 to B. Both writes are part of the same atomic unit.',
        accountA: 800,
        accountB: 700,
        walEntry: 'T1: UPDATE accounts SET balance=700 WHERE id=B',
        status: 'pending',
      },
      {
        tx: 'T1',
        action: 'COMMIT',
        description:
          'T1 commits. WAL flushed to disk. Changes are now durable. A+B still = $1500 ✓',
        accountA: 800,
        accountB: 700,
        walEntry: 'T1: COMMIT ✓ (WAL persisted)',
        status: 'committed',
      },
      {
        tx: 'T2',
        action: 'READ A (again)',
        description:
          'T2 reads A again. In Read Committed: sees $800. In Repeatable Read: still sees $1000.',
        accountA: 800,
        accountB: 700,
        walEntry: 'T2: READ accounts WHERE id=A → depends on isolation level',
        status: 'pending',
      },
      {
        tx: 'T2',
        action: 'COMMIT',
        description: 'T2 read-only transaction commits. All ACID properties maintained.',
        accountA: 800,
        accountB: 700,
        walEntry: 'T2: COMMIT ✓',
        status: 'committed',
      },
    ],
    []
  );

  const crashSteps: Step[] = useMemo(
    () => [
      {
        tx: 'T1',
        action: 'BEGIN',
        description: 'T1 starts: Transfer $200 from A → B',
        accountA: 1000,
        accountB: 500,
        status: 'pending',
      },
      {
        tx: 'T1',
        action: 'READ A',
        description: 'T1 reads Account A balance: $1000',
        accountA: 1000,
        accountB: 500,
        walEntry: 'T1: READ accounts WHERE id=A → $1000',
        status: 'pending',
      },
      {
        tx: 'T1',
        action: 'WRITE A = $800',
        description: 'T1 debits $200 from A.',
        accountA: 800,
        accountB: 500,
        walEntry: 'T1: UPDATE accounts SET balance=800 WHERE id=A',
        status: 'pending',
      },
      {
        tx: 'T1',
        action: '⚡ CRASH',
        description:
          'SYSTEM CRASH! T1 debited A but never credited B. Without atomicity, $200 would vanish.',
        accountA: 800,
        accountB: 500,
        walEntry: '⚡ CRASH — T1 never committed',
        status: 'pending',
        violation: 'Crash before commit',
      },
      {
        tx: 'SYS',
        action: 'RECOVERY',
        description: 'System restarts. WAL replay: T1 never committed → ROLLBACK all T1 changes.',
        accountA: 1000,
        accountB: 500,
        walEntry: 'RECOVERY: T1 not committed → UNDO all T1 writes',
        status: 'rolled-back',
      },
      {
        tx: 'SYS',
        action: 'RESTORED',
        description:
          'Database restored to consistent state. A=$1000, B=$500. Total=$1500 ✓ Atomicity preserved!',
        accountA: 1000,
        accountB: 500,
        walEntry: 'RECOVERY COMPLETE — Database consistent',
        status: 'rolled-back',
      },
    ],
    []
  );

  const steps = scenario === 'success' ? successSteps : crashSteps;
  const step = steps[currentStep];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const handleToggle = useCallback(() => {
    if (currentStep >= steps.length - 1) setCurrentStep(0);
    setIsPlaying((p) => !p);
  }, [currentStep, steps.length]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Scenario Selector */}
      <div className="flex justify-center gap-3">
        {(['success', 'crash'] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setScenario(s);
              setCurrentStep(0);
              setIsPlaying(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              scenario === s
                ? s === 'success'
                  ? 'bg-emerald-600 text-white border-transparent'
                  : 'bg-red-600 text-white border-transparent'
                : 'bg-white text-gray-600 border-gray-200 hover:shadow-md'
            }`}
          >
            {s === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {s === 'success' ? 'Successful Commit' : 'Crash Recovery'}
          </button>
        ))}
      </div>

      {/* Visualization */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-hidden">
        <svg
          viewBox="0 0 700 220"
          className="w-full h-auto"
          role="img"
          aria-label="Transaction timeline showing ACID properties in action"
        >
          {/* Account boxes */}
          <g>
            <rect
              x="20"
              y="20"
              width="120"
              height="70"
              rx="10"
              fill="#eff6ff"
              stroke="#3b82f6"
              strokeWidth="1.5"
            />
            <text x="80" y="42" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e40af">
              Account A
            </text>
            <text x="80" y="68" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#1e3a8a">
              ${step.accountA}
            </text>
          </g>
          <g>
            <rect
              x="160"
              y="20"
              width="120"
              height="70"
              rx="10"
              fill="#f5f3ff"
              stroke="#8b5cf6"
              strokeWidth="1.5"
            />
            <text x="220" y="42" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#5b21b6">
              Account B
            </text>
            <text x="220" y="68" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#4c1d95">
              ${step.accountB}
            </text>
          </g>

          {/* Total */}
          <g>
            <rect
              x="300"
              y="20"
              width="100"
              height="70"
              rx="10"
              fill="#ecfdf5"
              stroke="#10b981"
              strokeWidth="1.5"
            />
            <text x="350" y="42" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#065f46">
              Total
            </text>
            <text
              x="350"
              y="68"
              textAnchor="middle"
              fontSize="22"
              fontWeight="bold"
              fill={step.accountA + step.accountB === 1500 ? '#065f46' : '#dc2626'}
            >
              ${step.accountA + step.accountB}
            </text>
          </g>

          {/* Consistency check */}
          <text
            x="350"
            y="106"
            textAnchor="middle"
            fontSize="9"
            fill={step.accountA + step.accountB === 1500 ? '#10b981' : '#ef4444'}
          >
            {step.accountA + step.accountB === 1500 ? '✓ Consistent' : '✗ Inconsistent!'}
          </text>

          {/* WAL (Write-Ahead Log) */}
          <rect
            x="430"
            y="14"
            width="250"
            height="84"
            rx="10"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1"
          />
          <text x="445" y="32" fontSize="9" fontWeight="bold" fill="#94a3b8">
            Write-Ahead Log (WAL)
          </text>
          {step.walEntry && (
            <text x="445" y="52" fontSize="8" fill="#67e8f9" fontFamily="monospace">
              {step.walEntry.length > 46 ? step.walEntry.slice(0, 46) + '...' : step.walEntry}
            </text>
          )}
          <text x="445" y="72" fontSize="8" fill="#475569">
            Step {currentStep + 1}/{steps.length} — {step.action}
          </text>
          <text x="445" y="86" fontSize="7" fill="#475569">
            {step.status === 'committed' && '💾 Persisted to disk'}
            {step.status === 'rolled-back' && '↩ Rolled back'}
            {step.status === 'pending' && '⏳ In progress...'}
          </text>

          {/* Timeline */}
          <rect x="20" y="130" width="660" height="4" rx="2" fill="#e5e7eb" />
          {steps.map((s, i) => {
            const tx = transactions.find((t) => t.id === s.tx);
            const cx = 20 + (i / (steps.length - 1)) * 660;
            const isActive = i === currentStep;
            const isPast = i < currentStep;
            const fillColor = s.violation
              ? '#ef4444'
              : s.status === 'rolled-back'
                ? '#f59e0b'
                : (tx?.color ?? '#6b7280');

            return (
              <g
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Step ${i + 1}: ${s.action}`}
                onClick={() => {
                  setCurrentStep(i);
                  setIsPlaying(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCurrentStep(i);
                    setIsPlaying(false);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={cx}
                  cy="132"
                  r={isActive ? 10 : 7}
                  fill={isPast || isActive ? fillColor : '#d1d5db'}
                  stroke={isActive ? fillColor : 'none'}
                  strokeWidth={isActive ? 3 : 0}
                  opacity={isPast || isActive ? 1 : 0.5}
                />
                <text
                  x={cx}
                  y="136"
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="bold"
                  fill="white"
                >
                  {i + 1}
                </text>
                <text
                  x={cx}
                  y="156"
                  textAnchor="middle"
                  fontSize="7"
                  fill={isActive ? '#0f172a' : '#9ca3af'}
                  fontWeight={isActive ? 'bold' : 'normal'}
                >
                  {s.tx}
                </text>
                <text
                  x={cx}
                  y="168"
                  textAnchor="middle"
                  fontSize="6"
                  fill={isActive ? '#374151' : '#d1d5db'}
                >
                  {s.action.length > 12 ? s.action.slice(0, 12) : s.action}
                </text>
              </g>
            );
          })}

          {/* Active step pulse */}
          {(() => {
            const cx = 20 + (currentStep / (steps.length - 1)) * 660;
            return (
              <circle cx={cx} cy="132" r="14" fill="none" stroke="#0d9488" strokeWidth="1.5">
                <animate attributeName="r" values="14;20;14" dur="1.5s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  values="0.5;0;0.5"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            );
          })()}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Description */}
      <div
        className={`rounded-xl border-2 p-4 transition-all duration-300 ${
          step.violation
            ? 'bg-red-50 border-red-300'
            : step.status === 'committed'
              ? 'bg-emerald-50 border-emerald-300'
              : step.status === 'rolled-back'
                ? 'bg-amber-50 border-amber-300'
                : 'bg-teal-50 border-teal-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-teal-600" />
          <span className="font-bold text-sm text-gray-900">
            Step {currentStep + 1}: {step.action}
          </span>
        </div>
        <p className="text-sm text-gray-700">{step.description}</p>
      </div>
    </div>
  );
});

TransactionACID2D.displayName = 'TransactionACID2D';

export default TransactionACID2D;
