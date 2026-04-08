import React from 'react';
import type { StateSnapshot, StackFrame, QueueEntry } from '../../../types';

interface EventLoopLensProps {
  currentSnapshot: StateSnapshot;
  previousSnapshot: StateSnapshot | null;
}

/* ── Color palette ── */
const COLORS = {
  callStack: '#00d4ff', // electric blue
  microtask: '#8b5cf6', // purple
  macrotask: '#14b8a6', // teal
  loopArrow: '#ffaa00', // amber
  textPrimary: '#e0e0ff',
  textSecondary: '#a0a0cc',
  border: '#2a2a4e',
  bgItem: 'rgba(18, 18, 42, 0.85)',
};

const ANIM_REDUCED = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ── Small helper to truncate long labels ── */
function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

/* ── Call Stack Item ── */
const StackItem: React.FC<{ frame: StackFrame; index: number; total: number }> = ({
  frame,
  index,
  total,
}) => {
  const isTop = index === total - 1;
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono"
      style={{
        background: isTop ? 'rgba(0, 212, 255, 0.15)' : COLORS.bgItem,
        border: `1px solid ${isTop ? COLORS.callStack : COLORS.border}`,
        color: isTop ? COLORS.callStack : COLORS.textSecondary,
        transition: ANIM_REDUCED ? 'none' : 'all 300ms ease',
        animation: ANIM_REDUCED ? 'none' : isTop ? 'elSlideIn 250ms ease-out' : 'none',
      }}
    >
      <span className="truncate flex-1">{truncate(frame.functionName || '(anonymous)', 20)}</span>
      <span className="opacity-60 shrink-0">:{frame.line}</span>
    </div>
  );
};

/* ── Queue Item ── */
const QueueItem: React.FC<{ entry: QueueEntry; color: string }> = ({ entry, color }) => (
  <div
    className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono"
    style={{
      background: COLORS.bgItem,
      border: `1px solid ${color}`,
      color,
      transition: ANIM_REDUCED ? 'none' : 'all 300ms ease',
      animation: ANIM_REDUCED ? 'none' : 'elSlideIn 250ms ease-out',
    }}
  >
    <span className="truncate flex-1">{truncate(entry.label, 24)}</span>
  </div>
);

/* ── Section Header ── */
const SectionHeader: React.FC<{
  title: string;
  color: string;
  count: number;
}> = ({ title, color, count }) => (
  <div className="flex items-center gap-2 mb-2">
    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
      {title}
    </span>
    <span className="text-xs px-1.5 rounded-full" style={{ background: `${color}22`, color }}>
      {count}
    </span>
  </div>
);

/* ── Animated Loop Indicator ── */
const LoopIndicator: React.FC<{ phase: 'stack' | 'microtask' | 'macrotask' }> = ({ phase }) => {
  const phaseColors: Record<string, string> = {
    stack: COLORS.callStack,
    microtask: COLORS.microtask,
    macrotask: COLORS.macrotask,
  };
  const phaseLabels: Record<string, string> = {
    stack: 'Executing Call Stack',
    microtask: 'Draining Microtasks',
    macrotask: 'Processing Task Queue',
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{
        background: `${phaseColors[phase]}15`,
        border: `1px solid ${phaseColors[phase]}40`,
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{
          background: phaseColors[phase],
          animation: ANIM_REDUCED ? 'none' : 'elPulse 1.2s ease-in-out infinite',
        }}
      />
      <span className="text-xs font-medium" style={{ color: phaseColors[phase] }}>
        {phaseLabels[phase]}
      </span>
    </div>
  );
};

/* ── Main Component ── */
const EventLoopLens: React.FC<EventLoopLensProps> = ({ currentSnapshot }) => {
  const { callStack, microtaskQueue, macrotaskQueue } = currentSnapshot;

  // Determine which phase the event loop is in
  const phase: 'stack' | 'microtask' | 'macrotask' =
    callStack.length > 0 ? 'stack' : microtaskQueue.length > 0 ? 'microtask' : 'macrotask';

  return (
    <div className="h-full flex flex-col p-3 gap-3 overflow-auto">
      {/* CSS animations */}
      <style>{`
        @keyframes elSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes elPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
      `}</style>

      {/* Loop phase indicator */}
      <LoopIndicator phase={phase} />

      {/* Three-area layout */}
      <div className="flex-1 grid grid-rows-3 gap-3 min-h-0">
        {/* Call Stack (LIFO — bottom to top) */}
        <div
          className="rounded-lg p-3 overflow-auto flex flex-col"
          style={{ background: 'rgba(0, 212, 255, 0.04)', border: `1px solid ${COLORS.border}` }}
        >
          <SectionHeader title="Call Stack" color={COLORS.callStack} count={callStack.length} />
          <div className="flex-1 flex flex-col-reverse gap-1 overflow-auto">
            {callStack.length === 0 ? (
              <p className="text-xs italic" style={{ color: COLORS.textSecondary }}>
                Stack is empty
              </p>
            ) : (
              callStack.map((frame, i) => (
                <StackItem
                  key={`${frame.functionName}-${frame.line}-${i}`}
                  frame={frame}
                  index={i}
                  total={callStack.length}
                />
              ))
            )}
          </div>
        </div>

        {/* Microtask Queue (FIFO) */}
        <div
          className="rounded-lg p-3 overflow-auto flex flex-col"
          style={{ background: 'rgba(139, 92, 246, 0.04)', border: `1px solid ${COLORS.border}` }}
        >
          <SectionHeader
            title="Microtask Queue"
            color={COLORS.microtask}
            count={microtaskQueue.length}
          />
          <div className="flex-1 flex flex-col gap-1 overflow-auto">
            {microtaskQueue.length === 0 ? (
              <p className="text-xs italic" style={{ color: COLORS.textSecondary }}>
                Queue is empty
              </p>
            ) : (
              microtaskQueue.map((entry) => (
                <QueueItem key={entry.id} entry={entry} color={COLORS.microtask} />
              ))
            )}
          </div>
        </div>

        {/* Macrotask (Task) Queue (FIFO) */}
        <div
          className="rounded-lg p-3 overflow-auto flex flex-col"
          style={{ background: 'rgba(20, 184, 166, 0.04)', border: `1px solid ${COLORS.border}` }}
        >
          <SectionHeader
            title="Task Queue"
            color={COLORS.macrotask}
            count={macrotaskQueue.length}
          />
          <div className="flex-1 flex flex-col gap-1 overflow-auto">
            {macrotaskQueue.length === 0 ? (
              <p className="text-xs italic" style={{ color: COLORS.textSecondary }}>
                Queue is empty
              </p>
            ) : (
              macrotaskQueue.map((entry) => (
                <QueueItem key={entry.id} entry={entry} color={COLORS.macrotask} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EventLoopLens);
