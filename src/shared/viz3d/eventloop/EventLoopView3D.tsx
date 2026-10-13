import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Line, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { usePresence } from '../../hooks/usePresence';
import { slotKey } from '../../snapshot';
import {
  QUEUE_REGIONS,
  REGION_INFO,
  entrySource,
  placeEntries,
  type EventLoopRegion,
  type PlacedEntry,
  type QueueRegion,
} from '../../components/viz/eventloop/layout';
import type { EventLoopView3DProps } from '../../components/viz/eventloop/types';
import { vizPalette, type VizPalette } from '../../viz/palette';
import { LabelFramer, StoryCamera } from '../camera';
import type { V3 } from '../frameShot';
import { MONO, damp, labelStyle, withAlpha } from '../primitives';
import { Label } from '../primitives.labels';
import { useLabelHost } from '../useLabelHost';
import { FrameSlab, type FrameEntry, type FrameOrigin } from '../stackheap/FrameSlab';
import { FRAME_CARD, extraLines } from '../stackheap/frameCard';
import { FRAME_SIZE, STACK_X, frameLabelPlan } from '../stackheap/layout';
import {
  ENTRY_CARD,
  ENTRY_SIZE,
  ISO,
  LANE_WIDTH,
  asEntry,
  asFrame,
  cellPos,
  laneX,
  layoutFor,
  morePos,
  placesOf,
  waitingIdOf,
  type EventLoopLayout,
  type EventLoopShot,
  type Place,
} from './layout';

/**
 * 3D renderer of the call stack and the event loop's regions for one snapshot, in either
 * palette. Pure view: everything it draws comes from its props, and it does not know whether
 * the snapshot is a story beat or a Playground trace step (ADR 0004).
 *
 * Literal: frames are the stack-and-heap scene's slabs on the same plinth; a waiting callback
 * is a low block in a cell of its region's lane, row 0 (the head) at the back. A callback is
 * one thing wherever it is: the block slides from the timers to the task queue, and grows into
 * the frame when its turn comes.
 *
 * THREE.JS SIDE: load this only through a `React.lazy` renderer.
 */

export type EventLoopScene3DProps = EventLoopView3DProps & {
  /** The preset framing, for a story beat. A trace step passes none and gets the overview. */
  shot?: EventLoopShot;
};

const DIRECTIONS = { iso: ISO };
const NO_PLACES: ReadonlyMap<string, Place> = new Map();
/** A timer is drawn see-through with a dashed outline: it is waiting, and it is not in a queue. */
const TIMER_OPACITY = 0.45;

const ellipsis: React.CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis' };

// ---- Entries --------------------------------------------------------------------------

/** The twelve edges of a box standing on y = 0, as line segments. */
function boxEdges([w, h, d]: V3): V3[] {
  const x = w / 2;
  const z = d / 2;
  const corners: [number, number][] = [
    [-x, -z],
    [x, -z],
    [x, z],
    [-x, z],
  ];
  const out: V3[] = [];
  corners.forEach(([cx, cz], i) => {
    const [nx, nz] = corners[(i + 1) % 4];
    out.push([cx, h, cz], [nx, h, nz], [cx, 0, cz], [nx, 0, nz], [cx, 0, cz], [cx, h, cz]);
  });
  return out;
}
const ENTRY_EDGES = boxEdges([ENTRY_SIZE[0] + 0.04, ENTRY_SIZE[1] + 0.02, ENTRY_SIZE[2] + 0.04]);

const EntryBlock: React.FC<{
  placed: PlacedEntry;
  exiting: boolean;
  focused: boolean;
  /** Read once, when the entry appears: it shrinks out of this box (the frame it was). */
  enterFrom?: FrameOrigin;
  layout: EventLoopLayout;
  P: VizPalette;
  instant: boolean;
}> = ({ placed, exiting, focused, enterFrom, layout, P, instant }) => {
  const { entry, region, cell, head } = placed;
  const info = REGION_INFO[region];
  const role = P[info.role!];
  const isTimer = region === 'timers';
  const tag = head ? info.headTag : null;
  const target = cellPos(region, cell, layout);

  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshLambertMaterial>(null);
  const [origin] = useState(() => (instant ? undefined : enterFrom));
  const colour = useMemo(() => new THREE.Color(role.solid), [role.solid]);
  const opacity = exiting ? 0 : isTimer ? TIMER_OPACITY : 1;

  useFrame((_, dt) => {
    if (!group.current || !mat.current) return;
    const { position, scale } = group.current;
    position.set(
      damp(position.x, target[0], instant, dt),
      damp(position.y, target[1], instant, dt),
      damp(position.z, target[2], instant, dt)
    );
    scale.set(
      damp(scale.x, exiting ? 0.85 : 1, instant, dt),
      damp(scale.y, exiting ? 0.04 : 1, instant, dt),
      damp(scale.z, exiting ? 0.85 : 1, instant, dt)
    );
    mat.current.opacity = damp(mat.current.opacity, opacity, instant, dt, 6);
    mat.current.color.lerp(colour, instant ? 1 : Math.min(1, dt * 6));
  });

  const [w, h, d] = ENTRY_SIZE;
  return (
    <group
      ref={group}
      position={origin?.position ?? target}
      scale={origin?.scale ?? (instant ? [1, 1, 1] : [0.2, 0.01, 0.2])}
    >
      {focused && !exiting && (
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w + 0.4, d + 0.4]} />
          <meshBasicMaterial color={P.focus} transparent opacity={0.6} />
        </mesh>
      )}
      <RoundedBox args={ENTRY_SIZE} radius={0.08} smoothness={2} position={[0, h / 2, 0]}>
        <meshLambertMaterial ref={mat} color={colour} transparent opacity={opacity} flatShading />
      </RoundedBox>
      {isTimer && !exiting && (
        <Line
          points={ENTRY_EDGES}
          segments
          color={role.stroke}
          lineWidth={1.5}
          dashed
          dashSize={0.16}
          gapSize={0.1}
        />
      )}
      <Label
        // On the block's front edge, so its top face shows above the card.
        position={[0, h, d / 2]}
        anchor="translate(-50%, -30%)"
        opacity={exiting ? 0 : 1}
        fadeMs={250}
        instant={instant}
        className="px-1.5 py-0.5 text-[11px] leading-[13px]"
        attrs={{
          'data-viz-entity': info.role!,
          'data-viz-entry': entry.id,
          'data-viz-in': region,
          'data-viz-row': String(cell.row),
          ...(tag && { 'data-viz-head': 'true' }),
        }}
        style={{
          position: 'relative',
          boxSizing: 'border-box',
          minWidth: ENTRY_CARD.minWidth,
          maxWidth: ENTRY_CARD.width,
          fontFamily: MONO,
          background: withAlpha(P.label.bg, 0.95),
          borderWidth: tag || focused ? 2 : 1,
          // Not runnable yet: dashed, so colour is not the only cue.
          borderStyle: isTimer ? 'dashed' : 'solid',
          borderColor: focused ? P.label.focusBorder : role.stroke,
          // The thicker border takes its width from the padding: every card is the same size.
          margin: tag || focused ? -1 : 0,
        }}
      >
        <div className="font-bold" style={{ color: P.text.primary, ...ellipsis }}>
          {entry.label}
        </div>
        <div style={{ color: P.text.secondary, ...ellipsis }}>{entrySource(entry)}</div>
        {tag && (
          <span
            className="absolute -top-[11px] right-1.5 rounded-full border px-1.5 text-[11px] font-bold leading-[12px]"
            style={{
              background: role.fill,
              borderColor: focused ? P.label.focusBorder : role.stroke,
              color: P.text.primary,
            }}
          >
            {tag}
          </span>
        )}
      </Label>
    </group>
  );
};

// ---- Regions --------------------------------------------------------------------------

/** A region's caption with the line that says when its work runs: framed, not counted as a label. */
const Caption: React.FC<{
  region: EventLoopRegion;
  position: V3;
  anchor: string;
  /** False for a stack drawn alone: there is no order to tell. */
  note: boolean;
  P: VizPalette;
}> = ({ region, position, anchor, note, P }) => {
  const info = REGION_INFO[region];
  // On the label host from its first render: a caption that is moved there later can be left
  // empty for good (see `useLabelHost`), and its props never change to fill it again.
  const host = useLabelHost();
  return (
    <Html position={position} zIndexRange={[10, 0]} portal={host}>
      <div
        data-viz-framed
        data-viz-region={region}
        style={{ ...labelStyle, transform: anchor, fontFamily: MONO }}
        className="text-[11px] leading-[14px]"
      >
        <div className="font-bold tracking-[0.12em]" style={{ color: P.region.label }}>
          {info.caption}
        </div>
        {note && (
          <div className="flex items-center gap-1" style={{ color: P.region.note }}>
            {info.order !== null && (
              <span
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full border font-bold"
                style={{ borderColor: P.region.label, color: P.region.label }}
              >
                {info.order}
              </span>
            )}
            {info.note}
          </div>
        )}
      </div>
    </Html>
  );
};

/** A quiet word on a region's floor, e.g. "empty". */
const FloorNote: React.FC<{ position: V3; P: VizPalette; children: React.ReactNode }> = ({
  position,
  P,
  children,
}) => (
  <Html position={position} zIndexRange={[10, 0]} portal={useLabelHost()}>
    <div
      data-viz-framed
      style={{
        ...labelStyle,
        transform: 'translate(-50%, -50%)',
        fontFamily: MONO,
        color: P.region.note,
      }}
      className="text-[11px]"
    >
      {children}
    </div>
  </Html>
);

const Lane: React.FC<{
  region: QueueRegion;
  /** Entries drawn in the lane, and entries the snapshot leaves out. */
  count: number;
  more: number;
  layout: EventLoopLayout;
  P: VizPalette;
  instant: boolean;
}> = ({ region, count, more, layout, P, instant }) => {
  const info = REGION_INFO[region];
  const role = P[info.role!];
  const isQueue = info.headTag !== null;
  const [min, max] = layout.lanes[region];
  const x = laneX(region);
  const depth = max[2] - min[2];
  const midZ = (min[2] + max[2]) / 2;
  const head = cellPos(region, { col: 0, row: 0 }, layout);

  const outline = useMemo<V3[]>(
    () => [
      [min[0], 0.01, min[2]],
      [max[0], 0.01, min[2]],
      [max[0], 0.01, max[2]],
      [min[0], 0.01, max[2]],
      [min[0], 0.01, min[2]],
    ],
    [min, max]
  );

  return (
    <>
      <mesh position={[x, -0.06, midZ]}>
        <boxGeometry args={[LANE_WIDTH, 0.12, depth]} />
        <meshLambertMaterial color={P.region.floor} flatShading />
      </mesh>
      {isQueue ? (
        <>
          {/* The head cell: the one place the loop takes work from. */}
          <mesh position={[x, 0.006, head[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[LANE_WIDTH, layout.rowPitch]} />
            <meshBasicMaterial color={role.solid} transparent opacity={0.28} />
          </mesh>
          {Array.from({ length: layout.rows }, (_, row) => (
            <mesh key={row} position={[x, 0.004, head[2] + (row + 0.5) * layout.rowPitch]}>
              <boxGeometry args={[LANE_WIDTH, 0.008, 0.04]} />
              <meshBasicMaterial color={P.region.stroke} />
            </mesh>
          ))}
          <Line points={outline} color={P.region.stroke} lineWidth={1.5} />
        </>
      ) : (
        // The timers are not a queue: no cells, no head, a dashed edge.
        <Line
          points={outline}
          color={role.stroke}
          lineWidth={1.5}
          dashed
          dashSize={0.3}
          gapSize={0.2}
        />
      )}
      <Caption
        region={region}
        // From the back-left corner, the highest point of the lane on screen.
        position={[min[0], 0, min[2]]}
        anchor="translate(2px, calc(-100% - 4px))"
        note
        P={P}
      />
      {count === 0 && more === 0 && (
        <FloorNote position={head} P={P}>
          empty
        </FloorNote>
      )}
      {more > 0 && (
        <Label
          position={morePos(region, count, layout)}
          anchor="translate(-50%, -50%)"
          instant={instant}
          className="border px-1.5 text-[11px] leading-[14px]"
          attrs={{ 'data-viz-more': region }}
          style={{
            fontFamily: MONO,
            background: withAlpha(P.label.bg, 0.95),
            borderColor: P.label.border,
            color: P.region.note,
          }}
        >
          +{more} more
        </Label>
      )}
    </>
  );
};

// ---- Scene ----------------------------------------------------------------------------

const frameKey = (e: FrameEntry) => e.frame.id;
const entryKey = (p: PlacedEntry) => p.entry.id;
const NO_ENTRIES: PlacedEntry[] = [];

const Scene: React.FC<Omit<EventLoopScene3DProps, 'label'>> = ({
  snapshot,
  focus,
  theme = 'light',
  extent,
  more,
  running,
  shot = 'overview',
  camera,
  instant = false,
}) => {
  const P = vizPalette[theme];
  const layout = layoutFor(snapshot, extent);

  const frameEntries = useMemo(
    () => snapshot.frames.map((frame, index) => ({ frame, index })),
    [snapshot.frames]
  );
  const placed = useMemo(
    () => (layout.queues ? placeEntries(snapshot) : NO_ENTRIES),
    [snapshot, layout.queues]
  );
  const frames = usePresence(frameEntries, frameKey, 700);
  const entries = usePresence(placed, entryKey, 700);

  // The frame that runs the entry taken from a queue: the one named, or the top frame.
  const top = snapshot.frames[snapshot.frames.length - 1];
  const runningFrame = running
    ? (snapshot.frames.find((f) => f.id === running.frameId) ?? (running.frameId ? null : top))
    : null;
  const runs = running && runningFrame ? { ...running, frameId: runningFrame.id } : undefined;
  const runningRole = runs ? REGION_INFO[runs.from].role! : null;

  // Where everything stood in the snapshot before this one: a frame that was an entry grows
  // out of the entry's cell, and an entry that was a frame (after an `await`) shrinks out of it.
  const places = useMemo(() => placesOf(snapshot, layout), [snapshot, layout]);
  const [track, setTrack] = useState({ snapshot, places, before: NO_PLACES });
  let before = track.before;
  if (track.snapshot !== snapshot) {
    before = track.places;
    setTrack({ snapshot, places, before });
  }
  const was = (id: string, kind: Place['kind']) => {
    const place = before.get(id);
    return place?.kind === kind ? place.box : undefined;
  };
  const waitingIds = new Set(snapshot.frames.map((f) => waitingIdOf(f.id, runs)));

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

      {/* Call stack */}
      <mesh position={[STACK_X, -0.06, 0]}>
        <boxGeometry args={[FRAME_SIZE[0] + 0.8, 0.12, FRAME_SIZE[2] + 0.8]} />
        <meshLambertMaterial color={P.region.plinth} flatShading />
      </mesh>
      <Caption
        region="stack"
        position={[STACK_X, -0.1, FRAME_SIZE[2] / 2 + 0.5]}
        // Under a stacked bottom label the caption moves down with the card's lower edge.
        anchor={stackLabelDrop > 0 ? `translate(-100%, ${stackLabelDrop}px)` : 'translate(-50%, 0)'}
        note={layout.queues}
        P={P}
      />
      {snapshot.frames.length === 0 && (
        <FloorNote position={[STACK_X, 0.05, 0]} P={P}>
          empty
        </FloorNote>
      )}
      {frames
        // A frame that went back to wait (an `await`) is drawn as its entry, not as a ghost.
        .filter(({ item, exiting }) => !(exiting && places.get(item.frame.id)?.kind === 'entry'))
        .map(({ item, exiting }) => {
          const box = was(waitingIdOf(item.frame.id, runs), 'entry');
          const tagged = !exiting && runs && runningRole && runs.frameId === item.frame.id;
          return (
            <FrameSlab
              key={item.frame.id}
              entry={item}
              exiting={exiting}
              isTop={!exiting && item.index === snapshot.frames.length - 1}
              focused={focus.includes(item.frame.id)}
              root={false}
              focus={focus}
              plan={planFor(item)}
              dense={layout.dense}
              P={P}
              instant={instant}
              enterFrom={box && asFrame(box)}
              tag={
                tagged
                  ? {
                      text: runningRole.toUpperCase(),
                      // Text, so not the role's stroke. Only the two queues are run from.
                      color: runningRole === 'microtask' ? P.text.microtask : P.text.task,
                      attrs: { 'data-viz-running': runs.entry.id },
                    }
                  : undefined
              }
            />
          );
        })}

      {/* Microtask queue, task queue, timers */}
      {layout.queues &&
        QUEUE_REGIONS.map((region) => (
          <Lane
            key={region}
            region={region}
            count={snapshot[region]?.length ?? 0}
            more={more?.[region] ?? 0}
            layout={layout}
            P={P}
            instant={instant}
          />
        ))}
      {entries
        // An entry whose callback is now a frame has become that frame.
        .filter(({ item, exiting }) => !(exiting && waitingIds.has(item.entry.id)))
        .map(({ item, exiting }) => {
          const box = was(item.entry.id, 'frame');
          return (
            <EntryBlock
              key={item.entry.id}
              placed={item}
              exiting={exiting}
              focused={focus.includes(item.entry.id)}
              enterFrom={box && asEntry(box)}
              layout={layout}
              P={P}
              instant={instant}
            />
          );
        })}

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

const EventLoopView3D: React.FC<EventLoopScene3DProps> = ({ label, ...scene }) => (
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

export default EventLoopView3D;
