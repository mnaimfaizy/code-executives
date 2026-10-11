import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { QuadraticBezierLine, RoundedBox, type QuadraticBezierLineRef } from '@react-three/drei';
import * as THREE from 'three';
import { usePresence } from '../../hooks/usePresence';
import {
  getReachable,
  getReferences,
  slotKey,
  type HeapKind,
  type HeapObject,
  type Placed,
  type StackFrame,
} from '../../snapshot';
import type { CameraState } from '../../components/viz/viewerCamera';
import type { StackHeapShot, StackHeapViewProps } from '../../components/viz/stackheap/types';
import { vizPalette, type EntityColors, type VizPalette } from '../../viz/palette';
import { LabelFramer, StoryCamera } from '../camera';
import type { V3 } from '../frameShot';
import { MONO, UP, damp, withAlpha } from '../primitives';
import { Label, RegionLabel } from '../primitives.labels';
import {
  ENTITY_SIZE,
  FRAME_SIZE,
  ISO,
  OBJECT_LABEL_LIFT,
  STACK_X,
  cellPos,
  frameLabelPlan,
  frameY,
  layoutFor,
  refArc,
  type Arc,
  type FrameLabelPlan,
  type StackHeapLayout,
} from './layout';

/**
 * 3D renderer of one stack-and-heap snapshot, in either palette. Pure view: everything it
 * draws comes from its props, and it does not know whether the snapshot is a story beat or a
 * Playground trace step (ADR 0004).
 * Style rules (docs/3D-Visualization-Standard.md): isometric-style orthographic camera,
 * flat-shaded limited palette, DOM labels that always face the viewer, one preset shot.
 *
 * THREE.JS SIDE: load this only through a `React.lazy` renderer.
 */

export type StackHeapView3DProps = StackHeapViewProps & {
  /** The preset framing; a trace step uses `overview`. */
  shot: StackHeapShot;
  /** The learner's camera: view preset, Hold view, pan mode and one-shot commands. */
  camera: CameraState;
  /** Reduced motion: no tweening, instant camera cuts. */
  instant?: boolean;
};

type PlacedObject = Placed<HeapObject>;

const DIRECTIONS = { iso: ISO };
const CORNER_RADIUS: Record<HeapKind, number> = {
  object: 0.14,
  array: 0.05,
  function: 0.3,
  scope: 0.08,
};

/**
 * A dense scene (see `layout.ts`) is framed at a lower zoom, so its cards are tighter and their
 * lines are cut to a fixed width with an ellipsis: wide enough for a typical slot, narrower
 * than the pitch between columns. The text stays 11px.
 */
const DENSE_OBJECT_WIDTH = 104;
const DENSE_FRAME_WIDTH = 140;

/** A label card in palette colours, cut to `maxWidth` when one is given. */
const cardStyle = (P: VizPalette, maxWidth?: number): React.CSSProperties => ({
  fontFamily: MONO,
  background: withAlpha(P.label.bg, 0.95),
  ...(maxWidth && { maxWidth, overflow: 'hidden' }),
});
const lineStyle = (dense: boolean): React.CSSProperties | undefined =>
  dense ? { overflow: 'hidden', textOverflow: 'ellipsis' } : undefined;
// A title is a flex row; in a dense scene it is one inline line, so it can end in an ellipsis.
const titleClass = (dense: boolean) => (dense ? 'font-bold' : 'flex items-center gap-2 font-bold');
const badgeGap = (dense: boolean) => (dense ? ' ml-2' : '');

/**
 * Frame label cards. `half` is half the height of the one-row card (name, one row of slots,
 * padding and border) and `line` its line height, both in px: a stacked card starts from the
 * one-row card's edge and grows away from it, so its neighbour on the other side sees no change.
 */
const FRAME_CARD = {
  story: { className: 'border px-2 py-0.5 text-[11px] leading-[14px]', half: 17, line: 14 },
  dense: { className: 'border px-2 text-[11px] leading-[13px]', half: 14, line: 13 },
};
/** A stacked card leans further from the heap: its right edge stays over the slab's front. */
const STACKED_FRAME_LEAN = '-75%';

/** Lines a stacked frame label adds to the one-row label (which has one line of slots). */
const extraLines = (plan: FrameLabelPlan) =>
  plan.stacked ? plan.slots.length + (plan.more > 0 ? 1 : 0) - 1 : 0;

// ---- Stack ----------------------------------------------------------------------------

interface FrameEntry {
  frame: StackFrame;
  index: number;
}

const FrameSlab: React.FC<{
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
}> = ({ entry, exiting, isTop, focused, root, focus, plan, dense, P, instant }) => {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshLambertMaterial>(null);
  const targetY = frameY(entry.index) + (exiting ? 1.6 : 0);
  useFrame((_, dt) => {
    if (!group.current || !mat.current) return;
    group.current.position.y = damp(group.current.position.y, targetY, instant, dt);
    mat.current.opacity = damp(mat.current.opacity, exiting ? 0 : 1, instant, dt, 10);
  });

  const highlight = focused || root;
  // An overfull frame with no room to stack takes the dense card: one line, cut at its width.
  const tight = dense || (!plan.stacked && plan.cut);
  const role = isTop ? P.frameActive : P.frame;
  return (
    <group ref={group} position={[STACK_X, frameY(entry.index) + (instant ? 0 : 2), 0]}>
      <RoundedBox args={FRAME_SIZE} radius={0.08} smoothness={2}>
        <meshLambertMaterial
          ref={mat}
          color={role.solid}
          transparent
          opacity={instant ? 1 : 0}
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
  focus: readonly string[];
  dense: boolean;
  P: VizPalette;
  instant: boolean;
}> = ({ frame, plan, exiting, highlight, root, focus, dense, P, instant }) => {
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

// ---- Heap -----------------------------------------------------------------------------

const HeapBlock: React.FC<{
  object: PlacedObject;
  exiting: boolean;
  focused: boolean;
  /** A `live` object no frame can reach, drawn in the `unreachable` role. */
  unreachable: boolean;
  focus: readonly string[];
  shot: StackHeapShot;
  layout: StackHeapLayout;
  P: VizPalette;
  instant: boolean;
}> = ({ object, exiting, focused, unreachable, focus, shot, layout, P, instant }) => {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshLambertMaterial>(null);
  const size = ENTITY_SIZE[object.kind];
  const pos = cellPos(object.cell, layout);
  const lastCol = layout.grid.cols - 1;
  const collected = object.state === 'collected' || exiting;
  const offRole = object.state === 'unmarked' || object.state === 'collected' || unreachable;
  const role: EntityColors = offRole ? P.unreachable : P[object.kind];
  // Back-row labels float above their block; labels of the rows in front hang in front of
  // theirs, so the gap between rows (where heap-to-heap arcs run) stays clear.
  const labelInFront = object.cell.row > 0;
  // The GC shot adds UNMARKED/RECLAIMED badges, widening every label until neighbours in a
  // row meet over the gap between columns. With no stack arcs to cover on those beats, the
  // outer columns' labels lean outward (first column left, last column right) to open that gap.
  const labelX =
    shot !== 'gc'
      ? '-50%'
      : object.cell.col === 0
        ? '-80%'
        : object.cell.col === lastCol
          ? '-20%'
          : '-50%';
  const baseColor = useMemo(() => new THREE.Color(role.solid), [role.solid]);

  useFrame((_, dt) => {
    if (!group.current || !mat.current) return;
    const s = group.current.scale;
    s.x = damp(s.x, collected ? 0.85 : 1, instant, dt);
    s.z = s.x;
    s.y = damp(s.y, collected ? 0.04 : 1, instant, dt, 5);
    mat.current.opacity = damp(mat.current.opacity, collected ? 0.25 : 1, instant, dt, 5);
    mat.current.color.lerp(baseColor, instant ? 1 : Math.min(1, dt * 6));
  });

  return (
    <group position={pos}>
      {focused && !collected && (
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[size[0] + 0.4, size[2] + 0.4]} />
          <meshBasicMaterial color={P.focus} transparent opacity={0.6} />
        </mesh>
      )}
      <group ref={group} scale={instant ? [1, 1, 1] : [0.2, 0.01, 0.2]}>
        <RoundedBox
          args={size}
          radius={CORNER_RADIUS[object.kind]}
          smoothness={3}
          position={[0, size[1] / 2, 0]}
        >
          <meshLambertMaterial ref={mat} color={baseColor} transparent opacity={1} flatShading />
        </RoundedBox>
        {object.kind === 'array' &&
          [1, 2, 3].map((i) => (
            <mesh key={i} position={[-size[0] / 2 + (i * size[0]) / 4, size[1] + 0.005, 0]}>
              <boxGeometry args={[0.03, 0.01, size[2] * 0.8]} />
              <meshBasicMaterial color={P.array.divider} transparent opacity={0.35} />
            </mesh>
          ))}
      </group>
      <Label
        position={
          labelInFront
            ? [0, 0, size[2] / 2 + 0.15]
            : [0, collected ? 0.3 : size[1] + OBJECT_LABEL_LIFT, 0]
        }
        anchor={labelInFront ? `translate(${labelX}, 6px)` : `translate(${labelX}, -100%)`}
        opacity={collected ? 0.4 : 1}
        fadeMs={500}
        instant={instant}
        className={
          layout.dense
            ? 'border px-2 py-0.5 text-[11px] leading-[14px]'
            : 'border px-2 py-1 text-[11px] leading-4'
        }
        style={{
          ...cardStyle(P, layout.dense ? DENSE_OBJECT_WIDTH : undefined),
          borderColor: focused
            ? P.label.focusBorder
            : object.state === 'unmarked' || unreachable
              ? P.label.unreachableBorder
              : P.label.border,
        }}
      >
        <div
          className={titleClass(layout.dense)}
          style={{ color: P.text.primary, ...lineStyle(layout.dense) }}
        >
          {object.label}
          <span className={`font-normal${badgeGap(layout.dense)}`} style={{ color: P.text.muted }}>
            #{object.id}
          </span>
          {object.state === 'unmarked' && (
            <span
              className={`text-[9px]${badgeGap(layout.dense)}`}
              style={{ color: P.unreachable.stroke }}
            >
              UNMARKED
            </span>
          )}
          {collected && (
            <span
              className={`text-[9px]${badgeGap(layout.dense)}`}
              style={{ color: P.unreachable.stroke }}
            >
              RECLAIMED
            </span>
          )}
        </div>
        {!collected &&
          (object.slots.length === 0 ? (
            <div style={{ color: P.text.muted }}>(empty)</div>
          ) : (
            object.slots.map((s) => {
              const f = focus.includes(slotKey(object.id, s.name));
              return (
                <div
                  key={s.name}
                  className={f ? 'font-bold' : undefined}
                  style={{
                    color: f ? P.text.onFocus : P.text.secondary,
                    ...lineStyle(layout.dense),
                  }}
                >
                  {object.kind === 'array' ? `[${s.name}]` : s.name}: {s.refId ? '●→' : s.value}
                </div>
              );
            })
          ))}
      </Label>
    </group>
  );
};

// ---- References -----------------------------------------------------------------------

const RefArc: React.FC<Arc & { focused: boolean; P: VizPalette; instant: boolean }> = ({
  start,
  end,
  mid,
  focused,
  P,
  instant,
}) => {
  const line = useRef<QuadraticBezierLineRef>(null);
  const color = focused ? P.focus : P.reference.solid;

  const cone = useMemo(() => {
    const e = new THREE.Vector3(...end);
    const dir = e
      .clone()
      .sub(new THREE.Vector3(...mid))
      .normalize();
    return {
      position: e.clone().sub(dir.clone().multiplyScalar(0.14)).toArray() as V3,
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir),
    };
  }, [end, mid]);

  useFrame((_, dt) => {
    if (!focused || instant || !line.current) return;
    const m = line.current.material as THREE.Material & { dashOffset: number };
    m.dashOffset -= dt * 1.2;
  });

  return (
    <group>
      <QuadraticBezierLine
        ref={line}
        start={start}
        end={end}
        mid={mid}
        color={color}
        lineWidth={focused ? 3.5 : 2}
        dashed={focused}
        dashSize={0.35}
        gapSize={0.15}
      />
      <mesh position={cone.position} quaternion={cone.quaternion}>
        <coneGeometry args={[0.12, 0.3, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
};

/** GC mark phase: rings ripple out from the roots (the stack) across the heap. */
const RootPulse: React.FC<{ color: string; reach: number }> = ({ color, reach }) => {
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const t = (clock.elapsedTime * 0.45 + i / 3) % 1;
      ring.scale.setScalar(1 + t * reach);
      (ring.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - t);
    });
  });
  return (
    <group position={[STACK_X, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => void (rings.current[i] = m)}>
          <ringGeometry args={[1, 1.08, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

// ---- Regions --------------------------------------------------------------------------

const Regions: React.FC<{
  layout: StackHeapLayout;
  /** Px the bottom frame's label grows downward, over the stack caption's usual place. */
  stackLabelDrop: number;
  P: VizPalette;
}> = ({ layout, stackLabelDrop, P }) => {
  const { heapCenter, heapSize } = layout;
  return (
    <>
      <mesh position={[STACK_X, -0.06, 0]}>
        <boxGeometry args={[FRAME_SIZE[0] + 0.8, 0.12, FRAME_SIZE[2] + 0.8]} />
        <meshLambertMaterial color={P.region.plinth} flatShading />
      </mesh>
      <mesh position={[heapCenter[0], -0.06, heapCenter[2]]}>
        <boxGeometry args={heapSize} />
        <meshLambertMaterial color={P.region.floor} flatShading />
      </mesh>
      <gridHelper
        // Keyed: a helper's geometry and colours are fixed when it is built.
        key={`${heapSize[0]}:${layout.gridDivisions}:${P.region.stroke}`}
        args={[heapSize[0], layout.gridDivisions, P.region.stroke, P.region.stroke]}
        position={[heapCenter[0], 0.001, heapCenter[2]]}
        scale={[1, 1, heapSize[2] / heapSize[0]]}
      />
      <RegionLabel
        position={[STACK_X, -0.1, FRAME_SIZE[2] / 2 + 0.5]}
        color={P.region.label}
        // Under a stacked bottom label the caption moves down with the card's lower edge, and
        // ends where the card does, clear of the heap's front rows.
        anchor={stackLabelDrop > 0 ? `translate(-100%, ${stackLabelDrop}px)` : undefined}
        style={{ fontFamily: MONO }}
      >
        CALL STACK
      </RegionLabel>
      <RegionLabel
        // A dense floor's front edge lies under its front row's labels, so the caption stands
        // beside the floor's front-right corner instead.
        position={
          layout.dense
            ? [layout.floor[1][0], -0.1, layout.floor[1][2]]
            : [heapCenter[0], -0.1, heapCenter[2] + heapSize[2] / 2]
        }
        color={P.region.label}
        anchor={layout.dense ? 'translate(10px, -50%)' : undefined}
        style={{ fontFamily: MONO }}
      >
        HEAP
      </RegionLabel>
    </>
  );
};

// ---- Scene ----------------------------------------------------------------------------

const frameKey = (e: FrameEntry) => e.frame.id;
const objectKey = (o: PlacedObject) => o.id;

const Scene: React.FC<Omit<StackHeapView3DProps, 'label'>> = ({
  snapshot,
  focus,
  theme = 'light',
  gcPhase,
  markUnreachable = false,
  grid,
  shot,
  camera,
  instant = false,
}) => {
  const P = vizPalette[theme];
  const layout = layoutFor(snapshot, grid);
  const frameEntries = useMemo(
    () => snapshot.frames.map((frame, index) => ({ frame, index })),
    [snapshot.frames]
  );
  const frames = usePresence(frameEntries, frameKey, 700);
  const objects = usePresence(snapshot.objects, objectKey, 700);
  const refs = getReferences(snapshot);
  const reachable = useMemo(
    () => (markUnreachable ? getReachable(snapshot) : null),
    [markUnreachable, snapshot]
  );
  const marking = gcPhase === 'mark';
  const planFor = ({ frame, index }: FrameEntry) =>
    frameLabelPlan(index, snapshot.frames.length, frame.slots.length, (i) =>
      focus.includes(slotKey(frame.id, frame.slots[i].name))
    );
  const bottom = frameEntries[0];
  const stackLabelDrop = bottom
    ? extraLines(planFor(bottom)) * FRAME_CARD[layout.dense ? 'dense' : 'story'].line
    : 0;

  return (
    <>
      <color attach="background" args={[P.surface]} />
      <hemisphereLight args={[P.lighting.sky, P.lighting.ground, 1.4]} />
      <directionalLight position={[6, 12, 8]} intensity={1.6} />

      <Regions layout={layout} stackLabelDrop={stackLabelDrop} P={P} />

      {frames.map(({ item, exiting }) => (
        <FrameSlab
          key={item.frame.id}
          entry={item}
          exiting={exiting}
          isTop={!exiting && item.index === snapshot.frames.length - 1}
          focused={focus.includes(item.frame.id)}
          root={marking}
          focus={focus}
          plan={planFor(item)}
          dense={layout.dense}
          P={P}
          instant={instant}
        />
      ))}

      {objects.map(({ item, exiting }) => (
        <HeapBlock
          key={item.id}
          object={item}
          exiting={exiting}
          focused={focus.includes(item.id)}
          unreachable={!!reachable && item.state === 'live' && !reachable.has(item.id)}
          focus={focus}
          shot={shot}
          layout={layout}
          P={P}
          instant={instant}
        />
      ))}

      {refs.map((r) => {
        const arc = refArc(r, snapshot, layout);
        return arc ? (
          <RefArc key={r.id} {...arc} focused={focus.includes(r.from)} P={P} instant={instant} />
        ) : null;
      })}

      {marking && !instant && (
        <RootPulse
          color={P.root}
          reach={(9 * Math.max(layout.heapSize[0], layout.heapSize[2])) / 8}
        />
      )}

      <LabelFramer />
      <StoryCamera
        shot={layout.shots[shot]}
        bounds={layout.bounds}
        camera={camera}
        instant={instant}
        directions={DIRECTIONS}
      />
    </>
  );
};

const StackHeapView3D: React.FC<StackHeapView3DProps> = ({ label, ...scene }) => (
  <Canvas
    orthographic
    dpr={[1, 2]}
    camera={{ position: [10, 10, 14], zoom: 40, near: -100, far: 200 }}
    gl={{ antialias: true, powerPreference: 'high-performance' }}
    aria-label={label}
    role="img"
  >
    <Scene {...scene} />
  </Canvas>
);

export default StackHeapView3D;
