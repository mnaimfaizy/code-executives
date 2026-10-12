import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { slotKey, type StackFrame } from '../../snapshot';
import type { VizPalette } from '../../viz/palette';
import type { V3 } from '../frameShot';
import { damp } from '../primitives';
import { Label } from '../primitives.labels';
import {
  DENSE_FRAME_WIDTH,
  FRAME_CARD,
  STACKED_FRAME_LEAN,
  badgeGap,
  cardStyle,
  lineStyle,
  titleClass,
} from './frameCard';
import { FRAME_SIZE, STACK_X, frameY, type FrameLabelPlan } from './layout';

/**
 * One frame of a call stack: its slab and its label card. Shared by every scene that draws a
 * stack (stack and heap, event loop), so a frame looks the same in each.
 *
 * THREE.JS SIDE: load this only through a `React.lazy` renderer.
 */

export interface FrameEntry {
  frame: StackFrame;
  index: number;
}

/** A tag after a frame's name, e.g. the kind of queue entry whose callback the frame runs. */
export interface FrameTag {
  text: string;
  color: string;
  /** Marker attributes on the tag, e.g. `data-viz-running`. */
  attrs?: Record<string, string>;
}

/** Where a frame starts from when it is not pushed from above: the box of what it was before. */
export interface FrameOrigin {
  /** Centre of that box. */
  position: V3;
  /** Its size as a fraction of a frame's, per axis. */
  scale: V3;
}

const Tag: React.FC<{ tag: FrameTag; tight: boolean }> = ({ tag, tight }) => (
  <span
    {...tag.attrs}
    className={`text-[11px] font-bold${badgeGap(tight)}`}
    style={{ color: tag.color }}
  >
    {tag.text}
  </span>
);

export const FrameSlab: React.FC<{
  entry: FrameEntry;
  exiting: boolean;
  isTop: boolean;
  focused: boolean;
  root: boolean;
  focus: readonly string[];
  /** How the label lays out the frame's slots: one row, or one per line. */
  plan: FrameLabelPlan;
  dense: boolean;
  P: VizPalette;
  instant: boolean;
  /** Shown after the frame's name. */
  tag?: FrameTag;
  /** Read once, when the frame appears: it grows out of this box instead of dropping in. */
  enterFrom?: FrameOrigin;
}> = ({ entry, exiting, isTop, focused, root, focus, plan, dense, P, instant, tag, enterFrom }) => {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshLambertMaterial>(null);
  const [origin] = useState(() => (instant ? undefined : enterFrom));
  const targetY = frameY(entry.index) + (exiting ? 1.6 : 0);
  useFrame((_, dt) => {
    if (!group.current || !mat.current) return;
    group.current.position.y = damp(group.current.position.y, targetY, instant, dt);
    if (origin) {
      const { position, scale } = group.current;
      position.x = damp(position.x, STACK_X, instant, dt);
      position.z = damp(position.z, 0, instant, dt);
      scale.set(
        damp(scale.x, 1, instant, dt),
        damp(scale.y, 1, instant, dt),
        damp(scale.z, 1, instant, dt)
      );
    }
    mat.current.opacity = damp(mat.current.opacity, exiting ? 0 : 1, instant, dt, 10);
  });

  const highlight = focused || root;
  // An overfull frame with no room to stack takes the dense card: one line, cut at its width.
  const tight = dense || (!plan.stacked && plan.cut);
  const role = isTop ? P.frameActive : P.frame;
  return (
    <group
      ref={group}
      position={origin?.position ?? [STACK_X, frameY(entry.index) + (instant ? 0 : 2), 0]}
      scale={origin?.scale}
    >
      <RoundedBox args={FRAME_SIZE} radius={0.08} smoothness={2}>
        <meshLambertMaterial
          ref={mat}
          color={role.solid}
          transparent
          opacity={instant || origin ? 1 : 0}
          flatShading
        />
      </RoundedBox>
      {highlight && !exiting && (
        <mesh position={[0, -FRAME_SIZE[1] / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[FRAME_SIZE[0] + 0.35, FRAME_SIZE[2] + 0.35]} />
          <meshBasicMaterial color={P.root} transparent opacity={0.55} />
        </mesh>
      )}
      {plan.stacked ? (
        <StackedFrameLabel
          frame={entry.frame}
          plan={plan}
          exiting={exiting}
          highlight={highlight}
          root={root}
          tag={tag}
          focus={focus}
          dense={dense}
          P={P}
          instant={instant}
        />
      ) : (
        <Label
          position={[0, 0, FRAME_SIZE[2] / 2 + 0.02]}
          // A dense frame label leans away from the heap, clear of the back row's labels.
          anchor={tight ? 'translate(-65%, -50%)' : 'translate(-50%, -50%)'}
          opacity={exiting ? 0 : 1}
          fadeMs={250}
          instant={instant}
          className={FRAME_CARD[tight ? 'dense' : 'story'].className}
          style={{
            ...cardStyle(P, tight ? DENSE_FRAME_WIDTH : undefined),
            borderColor: highlight ? P.label.focusBorder : P.label.frameBorder,
          }}
        >
          <div
            className={titleClass(tight)}
            style={{ color: P.text.frameName, ...lineStyle(tight) }}
          >
            {entry.frame.name}
            {root && (
              <span
                className={`text-[9px] font-bold${badgeGap(tight)}`}
                style={{ color: P.text.root }}
              >
                ROOT
              </span>
            )}
            {tag && <Tag tag={tag} tight={tight} />}
          </div>
          <div className={tight ? undefined : 'flex gap-2.5'} style={lineStyle(tight)}>
            {entry.frame.slots.map((s, i) => {
              const f = focus.includes(slotKey(entry.frame.id, s.name));
              return (
                <span
                  key={s.name}
                  className={`${f ? 'font-bold' : ''}${tight && i > 0 ? ' ml-2.5' : ''}`}
                  style={{ color: f ? P.text.onFocus : P.text.secondary }}
                >
                  {s.name}: {s.refId ? '●→' : s.value}
                </span>
              );
            })}
          </div>
        </Label>
      )}
    </group>
  );
};

/**
 * The label of a frame with more slots than one row holds: its slots one per line, like a heap
 * object's label, capped by the plan with a final `+N more` line. Every line is cut at the
 * card's width.
 */
const StackedFrameLabel: React.FC<{
  frame: StackFrame;
  plan: Extract<FrameLabelPlan, { stacked: true }>;
  exiting: boolean;
  highlight: boolean;
  root: boolean;
  tag?: FrameTag;
  focus: readonly string[];
  dense: boolean;
  P: VizPalette;
  instant: boolean;
}> = ({ frame, plan, exiting, highlight, root, tag, focus, dense, P, instant }) => {
  const card = FRAME_CARD[dense ? 'dense' : 'story'];
  // The card keeps the one-row card's top edge when it grows down, and its bottom edge when
  // it grows up.
  const y = plan.grow === 'down' ? `-${card.half}px` : `calc(-100% + ${card.half}px)`;
  return (
    <Label
      position={[0, 0, FRAME_SIZE[2] / 2 + 0.02]}
      anchor={`translate(${STACKED_FRAME_LEAN}, ${y})`}
      opacity={exiting ? 0 : 1}
      fadeMs={250}
      instant={instant}
      className={card.className}
      style={{
        ...cardStyle(P, DENSE_FRAME_WIDTH),
        borderColor: highlight ? P.label.focusBorder : P.label.frameBorder,
      }}
    >
      <div className="font-bold" style={{ color: P.text.frameName, ...lineStyle(true) }}>
        {frame.name}
        {root && (
          <span className="ml-2 text-[9px] font-bold" style={{ color: P.text.root }}>
            ROOT
          </span>
        )}
        {tag && <Tag tag={tag} tight />}
      </div>
      {plan.slots.map((i) => {
        const s = frame.slots[i];
        const f = focus.includes(slotKey(frame.id, s.name));
        return (
          <div
            key={s.name}
            className={f ? 'font-bold' : undefined}
            style={{ color: f ? P.text.onFocus : P.text.secondary, ...lineStyle(true) }}
          >
            {s.name}: {s.refId ? '●→' : s.value}
          </div>
        );
      })}
      {plan.more > 0 && <div style={{ color: P.text.muted }}>+{plan.more} more</div>}
    </Label>
  );
};
