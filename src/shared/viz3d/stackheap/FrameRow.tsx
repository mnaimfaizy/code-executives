import React from 'react';
import { slotKey, type Slot, type StackFrame } from '../../snapshot';
import type { VizPalette } from '../../viz/palette';
import { lineStyle } from './frameCard';
import type { FrameLabelPlan } from './layout';

/**
 * The slots of a frame's one-row label card: the line under the frame's name.
 *
 * A frame whose slots fit the row lists them all. A frame with more, and no room to stack
 * them (a `cut` plan), shows the slots the plan chose and ends with `+N more`: the count
 * never shrinks, and a long slot gives way with an ellipsis, so the card keeps its height.
 *
 * THREE.JS SIDE (through `frameCard`): load this only through a `React.lazy` renderer.
 */
export const FrameRow: React.FC<{
  frame: StackFrame;
  plan: Extract<FrameLabelPlan, { stacked: false }>;
  focus: readonly string[];
  /** The dense card: one inline line instead of a flex row. */
  tight: boolean;
  P: VizPalette;
}> = ({ frame, plan, focus, tight, P }) => {
  const isFocused = (s: Slot) => focus.includes(slotKey(frame.id, s.name));
  const text = (s: Slot) => `${s.name}: ${s.refId ? '●→' : s.value}`;

  if (plan.cut) {
    return (
      <div className="flex gap-2 whitespace-nowrap" data-viz-frame-row="cut">
        {plan.slots.map((i) => {
          const s = frame.slots[i];
          const f = isFocused(s);
          return (
            <span
              key={s.name}
              className={`min-w-0${f ? ' font-bold' : ''}`}
              // When the row is too narrow for both, the slot the step did not change gives way first
              style={{
                color: f ? P.text.onFocus : P.text.secondary,
                flexShrink: f ? 1 : 4,
                ...lineStyle(true),
              }}
            >
              {text(s)}
            </span>
          );
        })}
        <span className="shrink-0" style={{ color: P.text.muted }}>
          +{plan.more} more
        </span>
      </div>
    );
  }

  return (
    <div className={tight ? undefined : 'flex gap-2.5'} style={lineStyle(tight)}>
      {frame.slots.map((s, i) => {
        const f = isFocused(s);
        return (
          <span
            key={s.name}
            className={`${f ? 'font-bold' : ''}${tight && i > 0 ? ' ml-2.5' : ''}`}
            style={{ color: f ? P.text.onFocus : P.text.secondary }}
          >
            {text(s)}
          </span>
        );
      })}
    </div>
  );
};

export default FrameRow;
