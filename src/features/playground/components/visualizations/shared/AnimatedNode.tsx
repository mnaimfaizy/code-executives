import React from 'react';
import { Handle, Position } from '@xyflow/react';

export type AnimationState = 'normal' | 'highlight' | 'pulse' | 'fade-out';

interface AnimatedNodeData {
  label: string;
  sublabel?: string;
  color: string;
  animationState: AnimationState;
  /** Whether to show left/right handles (for linked structures) */
  showLeftHandle?: boolean;
  showRightHandle?: boolean;
  /** Whether to show top/bottom handles (for trees) */
  showTopHandle?: boolean;
  showBottomHandle?: boolean;
}

const ANIM_REDUCED = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function AnimatedNode({ data }: { data: AnimatedNodeData }): React.ReactElement {
  const {
    label,
    sublabel,
    color,
    animationState,
    showLeftHandle = false,
    showRightHandle = false,
    showTopHandle = false,
    showBottomHandle = false,
  } = data;

  const borderColor =
    animationState === 'highlight'
      ? color
      : animationState === 'pulse'
        ? color
        : 'var(--pg-border)';

  const bgColor =
    animationState === 'highlight'
      ? `${color}22`
      : animationState === 'pulse'
        ? `${color}15`
        : 'rgba(18, 18, 42, 0.9)';

  const opacity = animationState === 'fade-out' ? 0.3 : 1;

  let animation = 'none';
  if (!ANIM_REDUCED) {
    if (animationState === 'pulse') animation = 'anPulse 1s ease-in-out infinite';
    if (animationState === 'highlight') animation = 'anGlow 600ms ease-out';
  }

  return (
    <>
      <style>{`
        @keyframes anPulse {
          0%, 100% { box-shadow: 0 0 0 0 ${color}44; }
          50%      { box-shadow: 0 0 8px 4px ${color}44; }
        }
        @keyframes anGlow {
          from { box-shadow: 0 0 12px 6px ${color}66; }
          to   { box-shadow: 0 0 0 0 ${color}00; }
        }
      `}</style>

      {showTopHandle && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: color, width: 6, height: 6 }}
        />
      )}
      {showLeftHandle && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: color, width: 6, height: 6 }}
        />
      )}

      <div
        style={{
          background: bgColor,
          border: `1.5px solid ${borderColor}`,
          borderRadius: 6,
          padding: '6px 10px',
          minWidth: 40,
          textAlign: 'center',
          opacity,
          animation,
          transition: ANIM_REDUCED ? 'none' : 'all 300ms ease',
          fontFamily: 'var(--pg-font-mono)',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color }}>{label}</div>
        {sublabel && (
          <div style={{ fontSize: 9, color: 'var(--pg-text-muted)', marginTop: 1 }}>{sublabel}</div>
        )}
      </div>

      {showRightHandle && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: color, width: 6, height: 6 }}
        />
      )}
      {showBottomHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: color, width: 6, height: 6 }}
        />
      )}
    </>
  );
}

export default React.memo(AnimatedNode);
