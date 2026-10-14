import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Html,
  Line,
  QuadraticBezierLine,
  RoundedBox,
  type QuadraticBezierLineRef,
} from '@react-three/drei';
import * as THREE from 'three';
import { usePresence } from '../../hooks/usePresence';
import {
  getCopyTrails,
  getReachable,
  getReferences,
  isSpaceFreed,
  originOf,
  slotKey,
  spaceOf,
  type Cell,
  type HeapKind,
  type HeapSpace,
  type HeapObject,
  type Placed,
} from '../../snapshot';
import type { CameraState } from '../../components/viz/viewerCamera';
import type { StackHeapShot, StackHeapViewProps } from '../../components/viz/stackheap/types';
import { vizPalette, type EntityColors, type VizPalette } from '../../viz/palette';
import { LabelFramer, StoryCamera } from '../camera';
import type { V3 } from '../frameShot';
import { MONO, UP, damp, labelStyle } from '../primitives';
import { Label, RegionLabel } from '../primitives.labels';
import { useLabelHost } from '../useLabelHost';
import { FrameSlab, type FrameEntry } from './FrameSlab';
import {
  framesAreRoots,
  inStackArcPath,
  labelLean,
  markTag,
  reclaimedTag,
  rootPulsePlays,
} from './gcCues';
import {
  DENSE_OBJECT_WIDTH,
  FRAME_CARD,
  badgeGap,
  cardStyle,
  extraLines,
  lineStyle,
  titleClass,
} from './frameCard';
import {
  ENTITY_SIZE,
  FRAME_SIZE,
  ISO,
  OBJECT_LABEL_LIFT,
  STACK_X,
  cellPos,
  copyTrail,
  frameLabelPlan,
  glideOffset,
  layoutFor,
  refArc,
  type Arc,
  type SpaceSlab,
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

// ---- Heap -----------------------------------------------------------------------------

/** Px added round the 1px border of a marked object's card: the cue that is not a colour. */
const MARKED_OUTLINE = 2;
const MARKED_ATTRS = { 'data-viz-marked': '' };

const HeapBlock: React.FC<{
  object: PlacedObject;
  exiting: boolean;
  focused: boolean;
  /** A `live` object no frame can reach, drawn in the `unreachable` role. */
  unreachable: boolean;
  focus: readonly string[];
  /** An arc from a frame's slot lands on this object or passes in front of its label. */
  stackHeld: boolean;
  /** The id the label shows: the first object of a chain of copies (`originOf`). */
  shownId: string;
  /** It stands in a space freed as a whole: no RECLAIMED tag of its own. */
  inFreedSpace: boolean;
  /** Set when the object enters as a copy: the floor point of its original's cell. */
  glideFrom?: V3;
  /** The collector's phase: a mark is drawn only while a collection runs. */
  gcPhase: StackHeapViewProps['gcPhase'];
  shot: StackHeapShot;
  layout: StackHeapLayout;
  P: VizPalette;
  instant: boolean;
}> = ({
  object,
  exiting,
  focused,
  unreachable,
  focus,
  stackHeld,
  shownId,
  inFreedSpace,
  glideFrom,
  gcPhase,
  shot,
  layout,
  P,
  instant,
}) => {
  const group = useRef<THREE.Group>(null);
  const glider = useRef<THREE.Group>(null);
  // A glide is decided once, when the block mounts: the copy enters on its copying beat.
  const [glide] = useState(() => (glideFrom && !instant ? { from: glideFrom, t: 0 } : null));
  const mat = useRef<THREE.MeshLambertMaterial>(null);
  const size = ENTITY_SIZE[object.kind];
  const pos = cellPos(object.cell, layout);
  const lastCol = layout.grid.cols - 1;
  const collected = object.state === 'collected' || exiting;
  // Copied: what is left here is garbage, but not yet freed. It keeps its colour, half faded.
  const copied = object.state === 'copied' && !exiting;
  const offRole = object.state === 'unmarked' || object.state === 'collected' || unreachable;
  const role: EntityColors = offRole ? P.unreachable : P[object.kind];
  const tag = markTag(object.state, gcPhase);
  // A marked object is a live object: it keeps its own colour. The mark is the tag and a
  // heavier border on its card, in the object's own stroke.
  const marked = tag === 'MARKED' && !collected;
  // Back-row labels float above their block; labels of the rows in front hang in front of
  // theirs, so the gap between rows (where heap-to-heap arcs run) stays clear.
  const labelInFront = object.cell.row > 0;
  const labelX = labelLean(shot, object.cell.col, lastCol, stackHeld, !layout.spaces);
  const baseColor = useMemo(() => new THREE.Color(role.solid), [role.solid]);

  useFrame((_, dt) => {
    if (!group.current || !mat.current) return;
    if (glide && glider.current && glide.t < 1) {
      glide.t = instant ? 1 : Math.min(1, glide.t + dt / GLIDE_SECONDS);
      glider.current.position.set(...glideOffset(glide.from, pos, glide.t));
    }
    const s = group.current.scale;
    s.x = damp(s.x, collected ? 0.85 : 1, instant, dt);
    s.z = s.x;
    s.y = damp(s.y, collected ? 0.04 : 1, instant, dt, 5);
    const opacity = collected ? 0.25 : copied ? 0.5 : 1;
    mat.current.opacity = damp(mat.current.opacity, opacity, instant, dt, 5);
    mat.current.color.lerp(baseColor, instant ? 1 : Math.min(1, dt * 6));
  });

  return (
    <group position={pos}>
      <group ref={glider} position={glide ? glideOffset(glide.from, pos, glide.t) : undefined}>
        {focused && !collected && (
          <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[size[0] + 0.4, size[2] + 0.4]} />
            <meshBasicMaterial color={P.focus} transparent opacity={0.6} />
          </mesh>
        )}
        <group ref={group} scale={instant || glide ? [1, 1, 1] : [0.2, 0.01, 0.2]}>
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
          opacity={collected ? 0.4 : copied ? 0.8 : 1}
          fadeMs={500}
          instant={instant}
          className={
            layout.dense
              ? 'border px-2 py-0.5 text-[11px] leading-[14px]'
              : 'border px-2 py-1 text-[11px] leading-4'
          }
          attrs={marked ? MARKED_ATTRS : undefined}
          style={{
            ...cardStyle(P, layout.dense ? DENSE_OBJECT_WIDTH : undefined),
            borderColor: focused
              ? P.label.focusBorder
              : object.state === 'unmarked' || unreachable
                ? P.label.unreachableBorder
                : marked
                  ? role.stroke
                  : P.label.border,
            // The outline takes no room, so a card does not grow or move when it gets its mark.
            ...(marked && {
              outline: `${MARKED_OUTLINE}px solid ${focused ? P.label.focusBorder : role.stroke}`,
            }),
          }}
        >
          <div
            className={titleClass(layout.dense)}
            style={{ color: P.text.primary, ...lineStyle(layout.dense) }}
          >
            {object.label}
            <span
              // A split heap's ids are longer (`#cache`): a narrower gap keeps `Object #cache`
              // inside a dense card.
              className={`font-normal${layout.spaces ? ' ml-1' : badgeGap(layout.dense)}`}
              style={{ color: P.text.muted }}
            >
              #{shownId}
            </span>
            {tag === 'UNMARKED' && (
              <span
                className={`text-[9px]${badgeGap(layout.dense)}`}
                style={{ color: P.unreachable.stroke }}
              >
                UNMARKED
              </span>
            )}
            {marked && (
              <span
                data-viz-tag="marked"
                className={`text-[9px]${badgeGap(layout.dense)}`}
                style={{ color: P.text.primary }}
              >
                MARKED
              </span>
            )}
            {reclaimedTag(collected, inFreedSpace) && (
              <span
                className={`text-[9px]${badgeGap(layout.dense)}`}
                style={{ color: P.unreachable.stroke }}
              >
                RECLAIMED
              </span>
            )}
          </div>
          {/* Its own line: a dense title has no room left for it after `Object #cache`. */}
          {tag === 'COPIED' && copied && (
            <div
              data-viz-tag="copied"
              className="font-bold"
              style={{ color: P.text.unreachable, ...lineStyle(layout.dense) }}
            >
              COPIED
            </div>
          )}
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
    </group>
  );
};

/** How long a copy takes to rise out of its original's cell and settle in its own. */
const GLIDE_SECONDS = 1.6;

// ---- Copies ---------------------------------------------------------------------------

/**
 * The dotted line on the floor from an object a collector copied to its copy. Not a
 * reference: muted, thin and dotted, with an open chevron instead of the reference cone.
 */
const CopyTrail: React.FC<{ start: V3; end: V3; color: string }> = ({ start, end, color }) => {
  const chevron = useMemo(() => {
    const tip = new THREE.Vector3(...end);
    const back = tip
      .clone()
      .sub(new THREE.Vector3(...start))
      .setY(0)
      .normalize()
      .multiplyScalar(0.35);
    const side = new THREE.Vector3(-back.z, 0, back.x);
    return [
      tip.clone().sub(back).add(side).toArray(),
      tip.toArray(),
      tip.clone().sub(back).sub(side).toArray(),
    ] as V3[];
  }, [start, end]);
  return (
    <group>
      <Line
        points={[start, end]}
        color={color}
        lineWidth={2}
        dashed
        dashSize={0.08}
        gapSize={0.22}
      />
      <Line points={chevron} color={color} lineWidth={2} />
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

/** A floor slab with its grid: the whole heap, or one space of it. */
const FloorSlab: React.FC<{ center: V3; size: V3; divisions: number; P: VizPalette }> = ({
  center,
  size,
  divisions,
  P,
}) => (
  <>
    <mesh position={[center[0], -0.06, center[2]]}>
      <boxGeometry args={size} />
      <meshLambertMaterial color={P.region.floor} flatShading />
    </mesh>
    <gridHelper
      // Keyed: a helper's geometry and colours are fixed when it is built.
      key={`${size[0]}:${size[2]}:${divisions}:${P.region.stroke}`}
      args={[size[0], divisions, P.region.stroke, P.region.stroke]}
      position={[center[0], 0.001, center[2]]}
      scale={[1, 1, size[2] / size[0]]}
    />
  </>
);

const SPACE_ROLE_TAG = { from: 'FROM-SPACE', to: 'TO-SPACE' } as const;
/** Px the HEAP caption keeps above the back-right corner: clear of the back space's caption. */
const HEAP_ABOVE_SPACES = 16;

/**
 * A space's caption: its name, and under it the tags it has now (a semi-space's role, FREE).
 * Drawn like a region caption, but marked `data-viz-label`, so the label checks hold its tags
 * to the same rules as every other label (in frame, overlapping nothing).
 */
const SpaceLabel: React.FC<{
  slab: SpaceSlab;
  space: HeapSpace;
  freed: boolean;
  P: VizPalette;
}> = ({ slab, space, freed, P }) => {
  const tags = [space.role ? SPACE_ROLE_TAG[space.role] : null, freed ? 'FREE' : null].filter(
    (t): t is string => t !== null
  );
  return (
    <Html position={slab.label} zIndexRange={[10, 0]} portal={useLabelHost()}>
      <div
        data-viz-label
        data-viz-entity="space"
        data-viz-space={space.id}
        data-viz-role={space.role}
        style={{ ...labelStyle, transform: 'translate(12px, -50%)', fontFamily: MONO }}
        className="text-[11px] font-bold leading-[14px] tracking-[0.1em]"
      >
        {/* One part of the name per line ("YOUNG", "SEMI-SPACE A"), and one tag per line: a
            narrow caption needs little room right of the floor. */}
        {space.label.split(' · ').map((part) => (
          <div key={part} style={{ color: P.region.label }}>
            {part}
          </div>
        ))}
        {tags.map((tag) => (
          <div
            key={tag}
            data-viz-tag={tag.toLowerCase()}
            style={{ color: tag === 'FREE' ? P.text.unreachable : P.text.primary }}
          >
            {tag}
          </div>
        ))}
      </div>
    </Html>
  );
};

const Regions: React.FC<{
  layout: StackHeapLayout;
  /** The snapshot's spaces, when its heap is split into them. */
  spaces?: readonly HeapSpace[];
  /** Ids of the spaces freed as a whole. */
  freed: ReadonlySet<string>;
  /** Px the bottom frame's label grows downward, over the stack caption's usual place. */
  stackLabelDrop: number;
  P: VizPalette;
}> = ({ layout, spaces, freed, stackLabelDrop, P }) => {
  const { heapCenter, heapSize } = layout;
  return (
    <>
      <mesh position={[STACK_X, -0.06, 0]}>
        <boxGeometry args={[FRAME_SIZE[0] + 0.8, 0.12, FRAME_SIZE[2] + 0.8]} />
        <meshLambertMaterial color={P.region.plinth} flatShading />
      </mesh>
      {layout.spaces && spaces ? (
        layout.spaces.map((slab) => {
          const space = spaces.find((s) => s.id === slab.id);
          return (
            <React.Fragment key={slab.id}>
              <FloorSlab
                center={slab.center}
                size={slab.size}
                divisions={layout.gridDivisions}
                P={P}
              />
              {space && <SpaceLabel slab={slab} space={space} freed={freed.has(space.id)} P={P} />}
            </React.Fragment>
          );
        })
      ) : (
        <FloorSlab center={heapCenter} size={heapSize} divisions={layout.gridDivisions} P={P} />
      )}
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
        // beside the floor's front-right corner instead. A floor split into spaces has their
        // captions down its right side; HEAP heads them, beside the back-right corner.
        position={
          layout.spaces
            ? [layout.floor[1][0], -0.1, layout.floor[0][2]]
            : layout.dense
              ? [layout.floor[1][0], -0.1, layout.floor[1][2]]
              : [heapCenter[0], -0.1, heapCenter[2] + heapSize[2] / 2]
        }
        color={P.region.label}
        anchor={
          layout.spaces
            ? `translate(12px, calc(-100% - ${HEAP_ABOVE_SPACES}px))`
            : layout.dense
              ? 'translate(10px, -50%)'
              : undefined
        }
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
  const marking = framesAreRoots(gcPhase);
  const freed = useMemo(
    () =>
      new Set((snapshot.spaces ?? []).filter((s) => isSpaceFreed(snapshot, s.id)).map((s) => s.id)),
    [snapshot]
  );
  const trails = getCopyTrails(snapshot);
  // Cells an arc from a frame lands on: first-column labels in such an arc's path stay centred.
  const landings: Cell[] = refs
    .filter((r) => r.fromKind === 'frame')
    .flatMap((r) => snapshot.objects.filter((o) => o.id === r.to).map((o) => o.cell));
  // A copy glides in only when it enters while the scene is showing, never on the first render.
  const shown = useRef(false);
  useEffect(() => {
    shown.current = true;
  }, []);
  const glideFrom = (o: PlacedObject): V3 | undefined => {
    if (!shown.current || !o.copyOf) return undefined;
    const original = snapshot.objects.find((x) => x.id === o.copyOf);
    return original?.state === 'copied' ? cellPos(original.cell, layout) : undefined;
  };
  const inFreedSpace = (id: string) => {
    const space = spaceOf(snapshot, id);
    return space !== undefined && freed.has(space.id);
  };
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

      <Regions
        layout={layout}
        spaces={snapshot.spaces}
        freed={freed}
        stackLabelDrop={stackLabelDrop}
        P={P}
      />

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
          stackHeld={inStackArcPath(item.cell, landings)}
          shownId={originOf(snapshot, item.id)}
          inFreedSpace={inFreedSpace(item.id)}
          glideFrom={exiting ? undefined : glideFrom(item)}
          gcPhase={gcPhase}
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

      {trails.map((t) => {
        const line = copyTrail(t.from, t.to, snapshot, layout);
        return line ? <CopyTrail key={t.id} {...line} color={P.text.muted} /> : null;
      })}

      {rootPulsePlays(gcPhase, focus, snapshot.frames) && !instant && (
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
