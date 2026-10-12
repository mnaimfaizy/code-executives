import React from 'react';
import { slotKey, type HeapKind, type Slot, type StackFrame } from '../../../snapshot';
import type { VizPalette } from '../../../viz/palette';
import {
  FRAME_NAME_CHARS,
  MONO,
  STACK_W,
  STACK_X,
  clip,
  slotLine,
  slotY,
  type Box,
} from './stackGeometry';

/** One line of text per slot of a frame or a heap object. */
export const SlotLines: React.FC<{
  owner: { id: string; slots: readonly Slot[] };
  kind: HeapKind | 'frame';
  box: Box;
  palette: VizPalette;
  focused: (key: string) => boolean;
}> = ({ owner, kind, box: b, palette: P, focused }) =>
  owner.slots.map((s, si) => {
    const on = focused(slotKey(owner.id, s.name));
    return (
      <text
        key={s.name}
        x={b.x + 12}
        y={slotY(b, si) + 4}
        fontSize={12}
        fontFamily={MONO}
        fill={on ? P.text.onFocus : P.text.slot}
        fontWeight={on ? 700 : 400}
      >
        {slotLine(kind, s)}
      </text>
    );
  });

/** The stack region's panel and its caption. */
export const StackPanel: React.FC<{ height: number; palette: VizPalette }> = ({
  height,
  palette: P,
}) => (
  <>
    <rect
      x={STACK_X}
      y={20}
      width={STACK_W}
      height={height - 36}
      rx={14}
      fill={P.region.fill}
      stroke={P.region.stroke}
    />
    <text
      x={STACK_X + 14}
      y={42}
      fill={P.region.label}
      fontSize={12}
      fontWeight={700}
      letterSpacing={1.5}
    >
      CALL STACK
    </text>
  </>
);

export interface StackFramesProps {
  /** Bottom of the stack first. */
  frames: readonly StackFrame[];
  /** From `stackBoxes`. */
  boxes: ReadonlyMap<string, Box>;
  palette: VizPalette;
  focused: (key: string) => boolean;
  /** The collector's mark phase: every frame is drawn as a root. */
  marking?: boolean;
  /** Drawn last inside a frame's group, e.g. a tag saying what the frame is running. */
  extra?: (frame: StackFrame, box: Box) => React.ReactNode;
}

/** One labelled group per frame. */
export const StackFrames: React.FC<StackFramesProps> = ({
  frames,
  boxes,
  palette: P,
  focused,
  marking = false,
  extra,
}) => (
  <>
    {frames.map((f, i) => {
      const b = boxes.get(f.id)!;
      const top = i === frames.length - 1;
      const on = focused(f.id);
      return (
        <g key={f.id} className="sh-enter" data-viz-label data-viz-entity="frame">
          <rect
            className="sh-shape"
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={8}
            fill={P.frame.fill}
            stroke={marking || on ? P.root : P.frame.stroke}
            strokeWidth={marking || on ? 3 : top ? 2 : 1}
            strokeDasharray={marking ? '6 4' : undefined}
          />
          <text
            x={b.x + 10}
            y={b.y + 20}
            fontSize={13}
            fontWeight={700}
            fill={P.text.frameName}
            fontFamily={MONO}
          >
            {clip(f.name, FRAME_NAME_CHARS)}
          </text>
          {marking && (
            <text
              x={b.x + b.w - 10}
              y={b.y + 20}
              fontSize={10}
              fontWeight={700}
              textAnchor="end"
              fill={P.root}
            >
              ROOT
            </text>
          )}
          <SlotLines owner={f} kind="frame" box={b} palette={P} focused={focused} />
          {extra?.(f, b)}
        </g>
      );
    })}
  </>
);
