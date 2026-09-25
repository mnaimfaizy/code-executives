import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  CameraControls,
  CameraControlsImpl,
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

/**
 * 3D renderer for the Stack & Heap story. Pure view: everything it draws comes from `step`.
 * Style rules (docs/3D-Visualization-Standard.md): isometric-style orthographic camera,
 * flat-shaded limited palette, DOM labels that always face the viewer, preset shot per beat.
 */

export interface StackHeap3DProps {
  step: StoryStep;
  /** Bump to snap the camera back to the beat's preset shot. */
  resetViewToken: number;
  /** Reduced motion: no tweening, instant camera cuts. */
  instant?: boolean;
}

type V3 = [number, number, number];

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
const FRAME_SIZE: V3 = [3, 0.95, 2.4];
const FRAME_GAP = 0.3;
const frameY = (i: number) => FRAME_SIZE[1] / 2 + i * (FRAME_SIZE[1] + FRAME_GAP) + 0.02;

const CELL_X0 = 0.9;
const CELL_DX = 3.6;
const CELL_Z0 = -1.8;
const CELL_DZ = 3.6;
const OBJ_SIZE: Record<HeapObject['kind'], V3> = {
  object: [2.4, 0.7, 1.6],
  array: [2.4, 0.4, 1.1],
};
const cellPos = (o: HeapObject): V3 => [
  CELL_X0 + o.cell.col * CELL_DX,
  0,
  CELL_Z0 + o.cell.row * CELL_DZ,
];

const HEAP_CENTER: V3 = [CELL_X0 + CELL_DX / 2, 0, CELL_Z0 + CELL_DZ / 2];
const HEAP_SIZE: V3 = [CELL_DX + 4.4, 0.1, CELL_DZ + 3.8];

// ---- Camera shots ---------------------------------------------------------------------

interface Shot {
  /** World-space region the shot must frame. */
  min: V3;
  max: V3;
  /** Direction from target to camera; kept isometric-ish across shots for continuity. */
  dir: V3;
  /** Screen-space room (px) reserved around the region for DOM labels. */
  pad: { left: number; right: number; top: number; bottom: number };
}

const ISO: V3 = [6, 7, 11];

const STACK_MIN: V3 = [STACK_X - FRAME_SIZE[0] / 2, 0, -FRAME_SIZE[2] / 2];
const STACK_MAX: V3 = [
  STACK_X + FRAME_SIZE[0] / 2,
  frameY(2) + FRAME_SIZE[1] / 2,
  FRAME_SIZE[2] / 2,
];
const OBJECTS_MIN: V3 = [CELL_X0 - 1.3, 0, CELL_Z0 - 0.9];
const OBJECTS_MAX: V3 = [CELL_X0 + CELL_DX + 1.3, 1, CELL_Z0 + CELL_DZ + 0.9];
const FLOOR_MIN: V3 = [HEAP_CENTER[0] - HEAP_SIZE[0] / 2, 0, HEAP_CENTER[2] - HEAP_SIZE[2] / 2];
const FLOOR_MAX: V3 = [HEAP_CENTER[0] + HEAP_SIZE[0] / 2, 1, HEAP_CENTER[2] + HEAP_SIZE[2] / 2];

const union = (a: V3, b: V3, pick: typeof Math.min): V3 => [
  pick(a[0], b[0]),
  pick(a[1], b[1]),
  pick(a[2], b[2]),
];

// Frame labels sit on the slab fronts; object labels sit above the blocks and overhang them.
const WITH_STACK = { left: 40, right: 60, top: 70, bottom: 30 };
const HEAP_ONLY = { left: 60, right: 60, top: 70, bottom: 30 };

const SHOTS: Record<ShotId, Shot> = {
  overview: {
    min: union(STACK_MIN, FLOOR_MIN, Math.min),
    max: union(STACK_MAX, FLOOR_MAX, Math.max),
    dir: ISO,
    pad: WITH_STACK,
  },
  stack: { min: STACK_MIN, max: STACK_MAX, dir: ISO, pad: WITH_STACK },
  bridge: {
    min: union(STACK_MIN, OBJECTS_MIN, Math.min),
    max: union(STACK_MAX, OBJECTS_MAX, Math.max),
    dir: ISO,
    pad: WITH_STACK,
  },
  heap: { min: OBJECTS_MIN, max: OBJECTS_MAX, dir: ISO, pad: HEAP_ONLY },
  gc: {
    min: union(STACK_MIN, FLOOR_MIN, Math.min),
    max: union(STACK_MAX, FLOOR_MAX, Math.max),
    dir: [5, 9, 11],
    pad: WITH_STACK,
  },
};

/**
 * Orthographic framing: project the region's corners onto the camera plane, pick the
 * zoom that fits them plus the label padding, and offset the target so the padded
 * content is centred.
 */
function frameShot(shot: Shot, width: number, height: number) {
  const center = new THREE.Vector3(...shot.min)
    .add(new THREE.Vector3(...shot.max))
    .multiplyScalar(0.5);
  const forward = new THREE.Vector3(...shot.dir).normalize().negate();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, forward).normalize();

  let halfW = 0;
  let halfH = 0;
  for (const x of [shot.min[0], shot.max[0]])
    for (const y of [shot.min[1], shot.max[1]])
      for (const z of [shot.min[2], shot.max[2]]) {
        const d = new THREE.Vector3(x, y, z).sub(center);
        halfW = Math.max(halfW, Math.abs(d.dot(right)));
        halfH = Math.max(halfH, Math.abs(d.dot(up)));
      }

  const { left, right: padR, top, bottom } = shot.pad;
  const zoom = Math.max(
    8,
    Math.min((width - left - padR) / (2 * halfW), (height - top - bottom) / (2 * halfH))
  );
  const target = center
    .clone()
    .add(right.clone().multiplyScalar((padR - left) / (2 * zoom)))
    .add(up.clone().multiplyScalar((top - bottom) / (2 * zoom)));
  const position = target.clone().add(new THREE.Vector3(...shot.dir));
  return { target, position, zoom };
}

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
        <div
          style={{
            ...labelStyle,
            transform: 'translate(-50%, -50%)',
            opacity: exiting ? 0 : 1,
            transition: instant ? undefined : 'opacity 250ms',
          }}
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
      <Html position={[0, collected ? 0.3 : size[1] + 0.25, 0]} zIndexRange={[10, 0]}>
        <div
          style={{ ...labelStyle, transform: 'translate(-50%, -100%)' }}
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
  const [tx, , tz] = cellPos(target);
  const th = OBJ_SIZE[target.kind][1];

  if (ref.fromKind === 'frame') {
    const index = step.frames.findIndex((f) => f.id === ref.fromOwner);
    const frame = step.frames[index];
    if (!frame) return null;
    const slotIdx = frame.slots.findIndex((s) => slotKey(frame.id, s.name) === ref.from);
    const z = -FRAME_SIZE[2] / 4 + (slotIdx * FRAME_SIZE[2]) / 2;
    const start: V3 = [STACK_X + FRAME_SIZE[0] / 2, frameY(index), z];
    const end: V3 = [tx - 0.5, th + 0.02, tz];
    const mid: V3 = [
      (start[0] + end[0]) / 2,
      Math.max(start[1], end[1]) + 2.2,
      (start[2] + end[2]) / 2,
    ];
    return { start, end, mid };
  }

  const source = step.objects.find((o) => o.id === ref.fromOwner);
  if (!source) return null;
  const [sx, , sz] = cellPos(source);
  const sh = OBJ_SIZE[source.kind][1];
  const start: V3 = [sx + 0.6, sh + 0.02, sz];
  const end: V3 = [tx - 0.3, th + 0.02, tz];
  const mid: V3 = [(start[0] + end[0]) / 2, Math.max(sh, th) + 1.4, (start[2] + end[2]) / 2];
  return { start, end, mid };
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

// ---- Camera ---------------------------------------------------------------------------

const ShotDirector: React.FC<{ shot: ShotId; resetViewToken: number; instant: boolean }> = ({
  shot,
  resetViewToken,
  instant,
}) => {
  const controls = useRef<CameraControlsImpl>(null);
  const size = useThree((s) => s.size);

  useLayoutEffect(() => {
    const c = controls.current;
    if (!c) return;
    const { target, position, zoom } = frameShot(SHOTS[shot], size.width, size.height);
    const smooth = !instant;
    void c.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, smooth);
    void c.zoomTo(zoom, smooth);
  }, [shot, resetViewToken, instant, size.width, size.height]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.6}
      minPolarAngle={0.25}
      maxPolarAngle={Math.PI / 2.3}
      minAzimuthAngle={-Math.PI / 3}
      maxAzimuthAngle={Math.PI / 2}
      mouseButtons={{
        left: CameraControlsImpl.ACTION.ROTATE,
        middle: CameraControlsImpl.ACTION.NONE,
        right: CameraControlsImpl.ACTION.NONE,
        // Keep the page scrollable: the wheel never zooms the scene.
        wheel: CameraControlsImpl.ACTION.NONE,
      }}
      touches={{
        one: CameraControlsImpl.ACTION.TOUCH_ROTATE,
        two: CameraControlsImpl.ACTION.NONE,
        three: CameraControlsImpl.ACTION.NONE,
      }}
    />
  );
};

// ---- Scene ----------------------------------------------------------------------------

const frameKey = (e: FrameEntry) => e.frame.id;
const objectKey = (o: HeapObject) => o.id;

const Scene: React.FC<StackHeap3DProps> = ({ step, resetViewToken, instant = false }) => {
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

      <ShotDirector shot={step.shot} resetViewToken={resetViewToken} instant={instant} />
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
