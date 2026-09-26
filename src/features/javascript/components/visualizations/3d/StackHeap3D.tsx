import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Html,
  QuadraticBezierLine,
  RoundedBox,
  type QuadraticBezierLineRef,
} from '@react-three/drei';
import * as THREE from 'three';
import {
  getReferences,
  isFocused,
  isRefFocused,
  slotKey,
  type HeapObject,
  type Reference,
  type ShotId,
  type StackFrame,
  type StoryStep,
} from '../../../utils/stackHeapStory';
import type { CameraState } from '../../../../../shared/components/viz/viewerCamera';
import { LabelFramer, StoryCamera } from '../../../../../shared/viz3d/camera';
import { boundsOf, type Box3, type Shot, type V3 } from '../../../../../shared/viz3d/frameShot';

/**
 * 3D renderer for the Stack & Heap story. Pure view: everything it draws comes from `step`.
 * Style rules (docs/3D-Visualization-Standard.md): isometric-style orthographic camera,
 * flat-shaded limited palette, DOM labels that always face the viewer, preset shot per beat.
 */

export interface StackHeap3DProps {
  step: StoryStep;
  /** The learner's camera: view preset, Hold view, pan mode and one-shot commands. */
  camera: CameraState;
  /** Reduced motion: no tweening, instant camera cuts. */
  instant?: boolean;
}

const PALETTE = {
  ground: '#e2e8f0',
  stackBase: '#cbd5e1',
  heapFloor: '#f1f5f9',
  heapEdge: '#cbd5e1',
  frame: '#818cf8',
  frameTop: '#6366f1',
  object: '#34d399',
  array: '#38bdf8',
  unmarked: '#fb7185',
  ref: '#475569',
  focus: '#f59e0b',
  root: '#f59e0b',
};

// ---- Layout (world units) ----------------------------------------------------------

const STACK_X = -4.6;
const FRAME_SIZE: V3 = [3, 1.1, 2.4];
const FRAME_GAP = 0.45;
const frameY = (i: number) => FRAME_SIZE[1] / 2 + i * (FRAME_SIZE[1] + FRAME_GAP) + 0.02;

const CELL_X0 = 0.9;
const CELL_DX = 3.6;
const CELL_Z0 = -1.8;
const CELL_DZ = 3.6;
const OBJ_SIZE: Record<HeapObject['kind'], V3> = {
  object: [2.4, 0.7, 1.6],
  array: [2.4, 0.4, 1.1],
};
// Back-row object labels float above this height; heap-to-heap arcs peak below it.
const OBJECT_LABEL_LIFT = 0.9;
const HEAP_ARC_LIFT = 0.45;
const cellPos = (o: HeapObject): V3 => [
  CELL_X0 + o.cell.col * CELL_DX,
  0,
  CELL_Z0 + o.cell.row * CELL_DZ,
];

const HEAP_CENTER: V3 = [CELL_X0 + CELL_DX / 2, 0, CELL_Z0 + CELL_DZ / 2];
const HEAP_SIZE: V3 = [CELL_DX + 4.4, 0.1, CELL_DZ + 3.8];

// ---- Camera shots ---------------------------------------------------------------------

/** Direction from target to camera for the isometric preset; this story's own angle. */
const ISO: V3 = [6, 7, 11];

const STACK: Box3 = [
  [STACK_X - FRAME_SIZE[0] / 2, 0, -FRAME_SIZE[2] / 2],
  [STACK_X + FRAME_SIZE[0] / 2, frameY(2) + FRAME_SIZE[1] / 2, FRAME_SIZE[2] / 2],
];
const OBJECTS: Box3 = [
  [CELL_X0 - 1.3, 0, CELL_Z0 - 0.9],
  [CELL_X0 + CELL_DX + 1.3, 1, CELL_Z0 + CELL_DZ + 0.9],
];
const FLOOR: Box3 = [
  [HEAP_CENTER[0] - HEAP_SIZE[0] / 2, 0, HEAP_CENTER[2] - HEAP_SIZE[2] / 2],
  [HEAP_CENTER[0] + HEAP_SIZE[0] / 2, 1, HEAP_CENTER[2] + HEAP_SIZE[2] / 2],
];

// Frame labels sit on the slab fronts; object labels sit above the blocks and overhang them.
const WITH_STACK = { left: 40, right: 60, top: 70, bottom: 80 };
const HEAP_ONLY = { left: 60, right: 60, top: 70, bottom: 80 };

const SHOTS: Record<ShotId, Shot> = {
  overview: { boxes: [STACK, FLOOR], pad: WITH_STACK },
  stack: { boxes: [STACK], pad: WITH_STACK },
  bridge: { boxes: [STACK, OBJECTS], pad: WITH_STACK },
  heap: { boxes: [OBJECTS], pad: HEAP_ONLY },
  gc: { boxes: [STACK, FLOOR], pad: WITH_STACK, isoDir: [5, 9, 11] },
};

/** The scene plus a margin: panning keeps the camera target inside it. */
const SCENE_BOUNDS: Box3 = boundsOf([STACK, FLOOR], 3);
const DIRECTIONS = { iso: ISO };

// ---- Helpers --------------------------------------------------------------------------

const damp = (from: number, to: number, instant: boolean, dt: number, lambda = 8) =>
  instant ? to : THREE.MathUtils.damp(from, to, lambda, dt);

/** Keeps removed items mounted briefly so they can animate out. */
function usePresence<T>(items: T[], keyOf: (t: T) => string, ms: number) {
  const [leaving, setLeaving] = useState<Map<string, T>>(() => new Map());
  const prev = useRef(items);

  useEffect(() => {
    const now = new Set(items.map(keyOf));
    const removed = prev.current.filter((i) => !now.has(keyOf(i)));
    prev.current = items;
    if (!removed.length) return;
    setLeaving((m) => new Map([...m, ...removed.map((r) => [keyOf(r), r] as const)]));
    setTimeout(() => {
      setLeaving((m) => {
        const next = new Map(m);
        removed.forEach((r) => next.delete(keyOf(r)));
        return next;
      });
    }, ms);
  }, [items, keyOf, ms]);

  const present = new Set(items.map(keyOf));
  return [
    ...items.map((item) => ({ item, exiting: false })),
    ...[...leaving.entries()]
      .filter(([k]) => !present.has(k))
      .map(([, item]) => ({ item, exiting: true })),
  ];
}

const labelStyle: React.CSSProperties = {
  pointerEvents: 'none',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
};

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
  step: StoryStep;
  instant: boolean;
}> = ({ entry, exiting, isTop, focused, root, step, instant }) => {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshLambertMaterial>(null);
  const targetY = frameY(entry.index) + (exiting ? 1.6 : 0);
  useFrame((_, dt) => {
    if (!group.current || !mat.current) return;
    group.current.position.y = damp(group.current.position.y, targetY, instant, dt);
    mat.current.opacity = damp(mat.current.opacity, exiting ? 0 : 1, instant, dt, 10);
  });

  const highlight = focused || root;
  return (
    <group ref={group} position={[STACK_X, frameY(entry.index) + (instant ? 0 : 2), 0]}>
      <RoundedBox args={FRAME_SIZE} radius={0.08} smoothness={2}>
        <meshLambertMaterial
          ref={mat}
          color={isTop ? PALETTE.frameTop : PALETTE.frame}
          transparent
          opacity={instant ? 1 : 0}
          flatShading
        />
      </RoundedBox>
      {highlight && !exiting && (
        <mesh position={[0, -FRAME_SIZE[1] / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[FRAME_SIZE[0] + 0.35, FRAME_SIZE[2] + 0.35]} />
          <meshBasicMaterial color={PALETTE.root} transparent opacity={0.55} />
        </mesh>
      )}
      <Html position={[0, 0, FRAME_SIZE[2] / 2 + 0.02]} zIndexRange={[10, 0]}>
        {/* The wrapper fades exits; the inner label's opacity belongs to LabelFramer. */}
        <div
          style={{
            ...labelStyle,
            transform: 'translate(-50%, -50%)',
            opacity: exiting ? 0 : 1,
            transition: instant ? undefined : 'opacity 250ms',
          }}
        >
          <div
            data-viz-label
            className={`rounded-md border bg-white/95 px-2 py-0.5 text-[11px] leading-[14px] shadow-sm ${
              highlight ? 'border-amber-400' : 'border-indigo-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-indigo-900">
              {entry.frame.name}
              {root && <span className="text-[9px] font-bold text-amber-600">ROOT</span>}
            </div>
            <div className="flex gap-2.5">
              {entry.frame.slots.map((s) => {
                const f = isFocused(step, slotKey(entry.frame.id, s.name));
                return (
                  <span key={s.name} className={f ? 'font-bold text-amber-700' : 'text-slate-600'}>
                    {s.name}: {s.refId ? '●→' : s.value}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

// ---- Heap -----------------------------------------------------------------------------

const HeapBlock: React.FC<{
  object: HeapObject;
  exiting: boolean;
  focused: boolean;
  step: StoryStep;
  instant: boolean;
}> = ({ object, exiting, focused, step, instant }) => {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshLambertMaterial>(null);
  const size = OBJ_SIZE[object.kind];
  const pos = cellPos(object);
  const collected = object.state === 'collected' || exiting;
  // Back-row labels float above their block; front-row labels hang in front of it, so the
  // gap between rows (where heap-to-heap arcs run) stays clear.
  const labelInFront = object.cell.row > 0;
  const baseColor = useMemo(
    () =>
      new THREE.Color(
        object.state === 'unmarked' || object.state === 'collected'
          ? PALETTE.unmarked
          : object.kind === 'array'
            ? PALETTE.array
            : PALETTE.object
      ),
    [object.state, object.kind]
  );

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
          <meshBasicMaterial color={PALETTE.focus} transparent opacity={0.6} />
        </mesh>
      )}
      <group ref={group} scale={instant ? [1, 1, 1] : [0.2, 0.01, 0.2]}>
        <RoundedBox
          args={size}
          radius={object.kind === 'array' ? 0.05 : 0.14}
          smoothness={3}
          position={[0, size[1] / 2, 0]}
        >
          <meshLambertMaterial ref={mat} color={baseColor} transparent opacity={1} flatShading />
        </RoundedBox>
        {object.kind === 'array' &&
          [1, 2, 3].map((i) => (
            <mesh key={i} position={[-size[0] / 2 + (i * size[0]) / 4, size[1] + 0.005, 0]}>
              <boxGeometry args={[0.03, 0.01, size[2] * 0.8]} />
              <meshBasicMaterial color="#0369a1" transparent opacity={0.35} />
            </mesh>
          ))}
      </group>
      <Html
        position={
          labelInFront
            ? [0, 0, size[2] / 2 + 0.15]
            : [0, collected ? 0.3 : size[1] + OBJECT_LABEL_LIFT, 0]
        }
        zIndexRange={[10, 0]}
      >
        <div
          data-viz-label
          style={{
            ...labelStyle,
            transform: labelInFront ? 'translate(-50%, 6px)' : 'translate(-50%, -100%)',
          }}
          className={`rounded-md border bg-white/95 px-2 py-1 text-[11px] leading-4 shadow-sm transition-opacity duration-500 ${
            focused
              ? 'border-amber-400'
              : object.state === 'unmarked'
                ? 'border-rose-300'
                : 'border-slate-200'
          } ${collected ? 'opacity-40' : 'opacity-100'}`}
        >
          <div className="flex items-center gap-2 font-bold text-slate-800">
            {object.label}
            <span className="font-normal text-slate-400">#{object.id}</span>
            {object.state === 'unmarked' && (
              <span className="text-[9px] text-rose-500">UNMARKED</span>
            )}
            {collected && <span className="text-[9px] text-rose-500">RECLAIMED</span>}
          </div>
          {!collected &&
            (object.slots.length === 0 ? (
              <div className="text-slate-400">(empty)</div>
            ) : (
              object.slots.map((s) => {
                const f = isFocused(step, slotKey(object.id, s.name));
                return (
                  <div key={s.name} className={f ? 'font-bold text-amber-700' : 'text-slate-600'}>
                    {object.kind === 'array' ? `[${s.name}]` : s.name}: {s.refId ? '●→' : s.value}
                  </div>
                );
              })
            ))}
        </div>
      </Html>
    </group>
  );
};

// ---- References -----------------------------------------------------------------------

function refEndpoints(ref: Reference, step: StoryStep): { start: V3; end: V3; mid: V3 } | null {
  const target = step.objects.find((o) => o.id === ref.to);
  if (!target) return null;
  const th = OBJ_SIZE[target.kind][1];

  if (ref.fromKind === 'frame') {
    const index = step.frames.findIndex((f) => f.id === ref.fromOwner);
    const frame = step.frames[index];
    if (!frame) return null;
    const slotIdx = frame.slots.findIndex((s) => slotKey(frame.id, s.name) === ref.from);
    const z = -FRAME_SIZE[2] / 4 + (slotIdx * FRAME_SIZE[2]) / 2;
    const start: V3 = [STACK_X + FRAME_SIZE[0] / 2, frameY(index), z];
    // Land on the face turned toward the stack, so the arc never reaches up into the
    // object's label.
    const end = faceToward(target, start, th);
    const mid: V3 = [
      (start[0] + end[0]) / 2,
      Math.max(start[1], end[1]) + 2.2,
      (start[2] + end[2]) / 2,
    ];
    return { start, end, mid };
  }

  const source = step.objects.find((o) => o.id === ref.fromOwner);
  if (!source) return null;
  const sh = OBJ_SIZE[source.kind][1];
  // Heap → heap: a low bridge between the facing top edges, below the object labels.
  const start = faceToward(source, cellPos(target), sh);
  const end = faceToward(target, cellPos(source), th);
  const mid: V3 = [
    (start[0] + end[0]) / 2,
    Math.max(sh, th) + HEAP_ARC_LIFT,
    (start[2] + end[2]) / 2,
  ];
  return { start, end, mid };
}

/** Point on an object's footprint edge facing `toward`, at height `y`. */
function faceToward(object: HeapObject, toward: V3, y: number): V3 {
  const [cx, , cz] = cellPos(object);
  const [w, , d] = OBJ_SIZE[object.kind];
  const dx = toward[0] - cx;
  const dz = toward[2] - cz;
  const s = Math.min(
    dx === 0 ? Infinity : w / 2 / Math.abs(dx),
    dz === 0 ? Infinity : d / 2 / Math.abs(dz)
  );
  return [cx + dx * s, y + 0.02, cz + dz * s];
}

const UP = new THREE.Vector3(0, 1, 0);

const RefArc: React.FC<{ start: V3; end: V3; mid: V3; focused: boolean; instant: boolean }> = ({
  start,
  end,
  mid,
  focused,
  instant,
}) => {
  const line = useRef<QuadraticBezierLineRef>(null);
  const color = focused ? PALETTE.focus : PALETTE.ref;

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
const RootPulse: React.FC = () => {
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const t = (clock.elapsedTime * 0.45 + i / 3) % 1;
      ring.scale.setScalar(1 + t * 9);
      (ring.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - t);
    });
  });
  return (
    <group position={[STACK_X, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => void (rings.current[i] = m)}>
          <ringGeometry args={[1, 1.08, 64]} />
          <meshBasicMaterial color={PALETTE.root} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

// ---- Scene ----------------------------------------------------------------------------

const frameKey = (e: FrameEntry) => e.frame.id;
const objectKey = (o: HeapObject) => o.id;

const Scene: React.FC<StackHeap3DProps> = ({ step, camera, instant = false }) => {
  const frameEntries = useMemo(
    () => step.frames.map((frame, index) => ({ frame, index })),
    [step.frames]
  );
  const frames = usePresence(frameEntries, frameKey, 700);
  const objects = usePresence(step.objects, objectKey, 700);
  const refs = getReferences(step);
  const marking = step.gcPhase === 'mark';

  return (
    <>
      <color attach="background" args={['#f8fafc']} />
      <hemisphereLight args={['#ffffff', '#cbd5e1', 1.4]} />
      <directionalLight position={[6, 12, 8]} intensity={1.6} />

      {/* Stack plinth + heap floor */}
      <mesh position={[STACK_X, -0.06, 0]}>
        <boxGeometry args={[FRAME_SIZE[0] + 0.8, 0.12, FRAME_SIZE[2] + 0.8]} />
        <meshLambertMaterial color={PALETTE.stackBase} flatShading />
      </mesh>
      <mesh position={[HEAP_CENTER[0], -0.06, HEAP_CENTER[2]]}>
        <boxGeometry args={HEAP_SIZE} />
        <meshLambertMaterial color={PALETTE.heapFloor} flatShading />
      </mesh>
      <gridHelper
        args={[HEAP_SIZE[0], 12, PALETTE.heapEdge, PALETTE.heapEdge]}
        position={[HEAP_CENTER[0], 0.001, HEAP_CENTER[2]]}
        scale={[1, 1, HEAP_SIZE[2] / HEAP_SIZE[0]]}
      />
      <Html position={[STACK_X, -0.1, FRAME_SIZE[2] / 2 + 0.5]} zIndexRange={[10, 0]}>
        <div
          data-viz-framed
          style={{ ...labelStyle, transform: 'translate(-50%, 0)' }}
          className="text-[11px] font-bold tracking-[0.2em] text-slate-500"
        >
          CALL STACK
        </div>
      </Html>
      <Html
        position={[HEAP_CENTER[0], -0.1, HEAP_CENTER[2] + HEAP_SIZE[2] / 2]}
        zIndexRange={[10, 0]}
      >
        <div
          data-viz-framed
          style={{ ...labelStyle, transform: 'translate(-50%, 0)' }}
          className="text-[11px] font-bold tracking-[0.2em] text-slate-500"
        >
          HEAP
        </div>
      </Html>

      {frames.map(({ item, exiting }) => (
        <FrameSlab
          key={item.frame.id}
          entry={item}
          exiting={exiting}
          isTop={!exiting && item.index === step.frames.length - 1}
          focused={isFocused(step, item.frame.id)}
          root={marking}
          step={step}
          instant={instant}
        />
      ))}

      {objects.map(({ item, exiting }) => (
        <HeapBlock
          key={item.id}
          object={item}
          exiting={exiting}
          focused={isFocused(step, item.id)}
          step={step}
          instant={instant}
        />
      ))}

      {refs.map((r) => {
        const pts = refEndpoints(r, step);
        return pts ? (
          <RefArc key={r.id} {...pts} focused={isRefFocused(step, r)} instant={instant} />
        ) : null;
      })}

      {marking && !instant && <RootPulse />}

      <LabelFramer />
      <StoryCamera
        shot={SHOTS[step.shot]}
        bounds={SCENE_BOUNDS}
        camera={camera}
        instant={instant}
        directions={DIRECTIONS}
      />
    </>
  );
};

const StackHeap3D: React.FC<StackHeap3DProps> = (props) => (
  <Canvas
    orthographic
    dpr={[1, 2]}
    camera={{ position: [10, 10, 14], zoom: 40, near: -100, far: 200 }}
    gl={{ antialias: true, powerPreference: 'high-performance' }}
    aria-label={`3D view of the stack and heap: ${props.step.title}`}
    role="img"
  >
    <Scene {...props} />
  </Canvas>
);

export default StackHeap3D;
