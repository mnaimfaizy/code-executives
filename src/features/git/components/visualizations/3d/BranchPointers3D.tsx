import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Edges,
  Html,
  QuadraticBezierLine,
  RoundedBox,
  type QuadraticBezierLineRef,
} from '@react-three/drei';
import * as THREE from 'three';
import {
  getCommit,
  getRef,
  getReferences,
  headFileText,
  isDetached,
  isFocused,
  isRefFocused,
  reachabilityState,
  type BranchRef,
  type Commit,
  type HeadRef,
  type Reference,
  type ReflogRef,
  type ShotId,
  type StoryStep,
} from '../../../utils/branchPointersStory';
import type { CameraState } from '../../../../../shared/components/viz/viewerCamera';
import { LabelFramer, StoryCamera } from '../../../../../shared/viz3d/camera';
import { boundsOf, type Box3, type Shot, type V3 } from '../../../../../shared/viz3d/frameShot';

/**
 * 3D renderer for the Branch Pointers story. Pure view: everything it draws comes from `step`.
 * Style rules (docs/3D-Visualization-Standard.md): isometric-style orthographic camera,
 * flat-shaded limited palette, DOM labels that always face the viewer, preset shot per beat.
 *
 * Space: the commit graph lies on a floor; the refs (the literal files in `.git/`) stand as
 * upright cards on a raised shelf behind it. Every ref drops one arrow onto what it names, so
 * a branch reads as a label hovering over a commit, never as a container of commits.
 */

export interface BranchPointers3DProps {
  step: StoryStep;
  /** The learner's camera: view preset, Hold view, pan mode and one-shot commands. */
  camera: CameraState;
  /** Reduced motion: no tweening, instant camera cuts. */
  instant?: boolean;
}

const PALETTE = {
  floor: '#f1f5f9',
  floorEdge: '#cbd5e1',
  shelf: '#fed7aa',
  shelfSide: '#fdba74',
  commit: '#fb923c',
  reflogOnly: '#cbd5e1',
  unreachable: '#fb7185',
  head: '#f472b6',
  detached: '#e11d48',
  branch: '#f87171',
  reflogCard: '#e2e8f0',
  focus: '#f59e0b',
};

const ARROW = {
  parent: '#64748b',
  branch: '#ef4444',
  head: '#db2777',
  detached: '#e11d48',
  reflog: '#94a3b8',
  focus: '#f59e0b',
};

// ---- Layout (world units) ----------------------------------------------------------

// Commit graph: 4 x 3 cells on the floor. Row 0 is the back row (nearest the refs shelf).
const COL_X = [-5.7, -1.9, 1.9, 5.7];
const ROW_Z = [-4.4, 0, 5.2];
const COMMIT: V3 = [2, 0.6, 1.3];
const commitPos = (c: Commit): V3 => [COL_X[c.cell.col], 0, ROW_Z[c.cell.row]];

const FLOOR_MIN: V3 = [COL_X[0] - 1.6, 0, ROW_Z[0] - 1.3];
const FLOOR_MAX: V3 = [COL_X[3] + 1.6, 0, ROW_Z[2] + 1.9];

// Refs shelf: a raised strip behind the graph where HEAD, main and feature stand (refs row 0).
// HEAD's reflog (refs row 1) stands on a lower step in front of HEAD, over the graph's empty
// back-left cells, as in the 2D view where it sits under HEAD.
const SHELF_Z = -10;
const SHELF_Y = 1.4;
const SHELF_DEPTH = 2.2;
const CARD_D = 0.2;
const CARD_H = 2.2;
const REF_X: Record<'HEAD' | 'main' | 'feature', number> = { HEAD: -5.9, main: 0.8, feature: 6.8 };
const CARD_W: Record<'HEAD' | 'main' | 'feature', number> = { HEAD: 5.2, main: 4.4, feature: 4.4 };

const WING_Y = 0.5;
const REFLOG_POS: V3 = [REF_X.HEAD - 1.9, WING_Y, -3.9];
const REFLOG_SIZE: V3 = [4.8, 3.4, CARD_D];
const REFLOG_ROWS = 5;
/** Viewer width (px) under which labels switch to their compact form. */
const COMPACT_BELOW = 640;

const SHELF_MIN: V3 = [REF_X.HEAD - CARD_W.HEAD / 2 - 0.6, 0, SHELF_Z - SHELF_DEPTH / 2];
const SHELF_MAX: V3 = [
  REF_X.feature + CARD_W.feature / 2 + 0.6,
  SHELF_Y,
  SHELF_Z + SHELF_DEPTH / 2,
];
const WING_MIN: V3 = [REFLOG_POS[0] - REFLOG_SIZE[0] / 2 - 0.4, 0, SHELF_MAX[2]];
const WING_MAX: V3 = [REFLOG_POS[0] + REFLOG_SIZE[0] / 2 + 0.4, WING_Y, REFLOG_POS[2] + 0.7];

type CardId = keyof typeof REF_X;
const cardCenter = (id: CardId): V3 => [REF_X[id], SHELF_Y + CARD_H / 2, SHELF_Z];

// ---- Camera shots ---------------------------------------------------------------------

const commitBox = (col: number, row: number): Box3 => [
  [COL_X[col] - COMMIT[0] / 2, 0, ROW_Z[row] - COMMIT[2] / 2],
  [COL_X[col] + COMMIT[0] / 2, COMMIT[1], ROW_Z[row] + COMMIT[2] / 2],
];
const cardBox = (id: CardId): Box3 => [
  [REF_X[id] - CARD_W[id] / 2, SHELF_Y, SHELF_Z - CARD_D],
  [REF_X[id] + CARD_W[id] / 2, SHELF_Y + CARD_H + 0.6, SHELF_Z + CARD_D],
];
const REFLOG_BOX: Box3 = [
  [REFLOG_POS[0] - REFLOG_SIZE[0] / 2, WING_Y, REFLOG_POS[2]],
  [REFLOG_POS[0] + REFLOG_SIZE[0] / 2, WING_Y + REFLOG_SIZE[1], REFLOG_POS[2]],
];
const GRAPH: Box3[] = [
  commitBox(0, 1),
  commitBox(1, 1),
  commitBox(3, 1),
  commitBox(2, 0),
  commitBox(2, 2),
];
const REFS: Box3[] = [cardBox('HEAD'), cardBox('main'), cardBox('feature'), REFLOG_BOX];

// The reflog's label is wider than its card, so shots that hold it keep extra room on the left.
/** The scene plus a margin: panning keeps the camera target inside it. */
const SCENE_BOUNDS: Box3 = boundsOf([...GRAPH, ...REFS, [FLOOR_MIN, FLOOR_MAX]], 3);

const SHOTS: Record<ShotId, Shot> = {
  overview: { boxes: [...GRAPH, ...REFS], pad: { left: 80, right: 70, top: 30, bottom: 56 } },
  graph: { boxes: GRAPH, pad: { left: 40, right: 90, top: 50, bottom: 70 } },
  refs: {
    boxes: [...REFS, commitBox(1, 1), commitBox(2, 1)],
    pad: { left: 80, right: 50, top: 30, bottom: 30 },
  },
  bridge: {
    boxes: [...REFS, ...GRAPH.slice(1)],
    pad: { left: 80, right: 70, top: 30, bottom: 56 },
  },
  orphan: {
    boxes: [cardBox('HEAD'), REFLOG_BOX, commitBox(1, 1), commitBox(2, 0)],
    pad: { left: 80, right: 60, top: 40, bottom: 60 },
  },
};

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
};
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** Reflog lines keep only the verb: `checkout: moving from a to b` reads `checkout → b`. */
function shortAction(action: string): string {
  const moved = action.match(/^checkout: moving from \S+ to (\S+)$/);
  if (moved) return `checkout → ${moved[1]}`;
  return action.split(/[: ]/)[0];
}

/**
 * A DOM label pinned to a world point. The outer box carries fade-in/out; the inner box is the
 * `data-viz-label` that LabelFramer hides whenever it would be cut by the viewer's edge.
 */
const Label: React.FC<{
  position: V3;
  anchor: string;
  opacity?: number;
  instant: boolean;
  className: string;
  attrs?: Record<string, string>;
  children: React.ReactNode;
}> = ({ position, anchor, opacity = 1, instant, className, attrs, children }) => (
  <Html position={position} zIndexRange={[10, 0]}>
    <div
      style={{
        ...labelStyle,
        transform: anchor,
        opacity,
        transition: instant ? undefined : 'opacity 400ms',
      }}
    >
      <div
        data-viz-label
        {...attrs}
        style={{ transition: instant ? undefined : 'opacity 200ms' }}
        className={`rounded-md bg-white/95 shadow-sm ${className}`}
      >
        {children}
      </div>
    </div>
  </Html>
);

// ---- Commit graph ----------------------------------------------------------------------

const STATE_TAG: Record<Commit['state'], string | null> = {
  live: null,
  'reflog-only': 'reflog only',
  unreachable: 'unreachable',
  collected: 'deleted by gc',
};

const CommitBlock: React.FC<{
  commit: Commit;
  exiting: boolean;
  focused: boolean;
  instant: boolean;
}> = ({ commit, exiting, focused, instant }) => {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshLambertMaterial>(null);
  const gone = commit.state === 'collected' || exiting;
  const unreachable = commit.state === 'unreachable';
  const color = useMemo(
    () =>
      new THREE.Color(
        commit.state === 'live'
          ? PALETTE.commit
          : commit.state === 'reflog-only'
            ? PALETTE.reflogOnly
            : PALETTE.unreachable
      ),
    [commit.state]
  );
  const opacity = gone ? 0 : unreachable ? 0.22 : 1;

  useFrame((_, dt) => {
    if (!group.current || !mat.current) return;
    const s = group.current.scale;
    s.x = damp(s.x, gone ? 0.8 : 1, instant, dt);
    s.z = s.x;
    s.y = damp(s.y, gone ? 0.05 : 1, instant, dt, 5);
    mat.current.opacity = damp(mat.current.opacity, opacity, instant, dt, 5);
    mat.current.color.lerp(color, instant ? 1 : Math.min(1, dt * 6));
  });

  const tag = exiting ? null : STATE_TAG[commit.state];
  return (
    <group position={commitPos(commit)}>
      {focused && !gone && (
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[COMMIT[0] + 0.45, COMMIT[2] + 0.45]} />
          <meshBasicMaterial color={PALETTE.focus} transparent opacity={0.6} />
        </mesh>
      )}
      {gone && !exiting && (
        // The footprint gc leaves behind: where f6b1 used to be.
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[COMMIT[0], COMMIT[2]]} />
          <meshBasicMaterial color={PALETTE.unreachable} transparent opacity={0.15} />
        </mesh>
      )}
      <group ref={group} scale={instant ? [1, 1, 1] : [0.2, 0.01, 0.2]}>
        <RoundedBox args={COMMIT} radius={0.12} smoothness={3} position={[0, COMMIT[1] / 2, 0]}>
          <meshLambertMaterial
            ref={mat}
            color={color}
            transparent
            opacity={instant ? opacity : 1}
            flatShading
          />
        </RoundedBox>
        {unreachable && (
          <mesh position={[0, COMMIT[1] / 2, 0]}>
            <boxGeometry args={COMMIT} />
            <meshBasicMaterial visible={false} />
            <Edges color={PALETTE.unreachable} lineWidth={2} />
          </mesh>
        )}
      </group>
      {/* Every commit label hangs in front of its block: arrows land on tops and sides. */}
      <Label
        position={[0, 0, COMMIT[2] / 2 + 0.1]}
        // The last column has nothing to its right, so its (wider) labels lean that way.
        anchor={
          commit.cell.col === COL_X.length - 1 ? 'translate(-30%, 4px)' : 'translate(-50%, 4px)'
        }
        opacity={exiting ? 0 : gone ? 0.6 : commit.state === 'live' ? 1 : 0.85}
        instant={instant}
        attrs={{ 'data-commit': commit.id }}
        className={`border px-2 py-0.5 text-center text-[11px] leading-4 ${
          focused
            ? 'border-amber-400'
            : unreachable || gone
              ? 'border-rose-300'
              : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span
            style={{ fontFamily: MONO }}
            className={`text-[12px] font-bold ${
              commit.state === 'live' ? 'text-orange-800' : 'text-slate-500'
            } ${gone ? 'line-through' : ''}`}
          >
            {commit.id}
          </span>
          {tag && (
            <span
              className={`font-bold ${
                commit.state === 'reflog-only' ? 'text-slate-500' : 'text-rose-600'
              }`}
            >
              {tag}
            </span>
          )}
        </div>
        {!gone && (
          // Long messages (the merge commit's) wrap, so the label stays clear of the arrows.
          <div
            className="text-slate-600"
            style={commit.message.length > 16 ? { width: 104, whiteSpace: 'normal' } : undefined}
          >
            {commit.message}
          </div>
        )}
      </Label>
    </group>
  );
};

// ---- Refs -----------------------------------------------------------------------------

const RefCard: React.FC<{
  ref_: HeadRef | BranchRef;
  exiting: boolean;
  focused: boolean;
  step: StoryStep;
  instant: boolean;
  compact: boolean;
}> = ({ ref_, exiting, focused, step, instant, compact }) => {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshLambertMaterial>(null);
  const isHead = ref_.kind === 'head';
  const detached = isHead && isDetached(step);
  const id = ref_.id as CardId;
  const color = useMemo(
    () => new THREE.Color(isHead ? (detached ? PALETTE.detached : PALETTE.head) : PALETTE.branch),
    [isHead, detached]
  );

  useFrame((_, dt) => {
    if (!group.current || !mat.current) return;
    group.current.scale.y = damp(group.current.scale.y, exiting ? 0.01 : 1, instant, dt);
    mat.current.color.lerp(color, instant ? 1 : Math.min(1, dt * 6));
  });

  const [cx, , cz] = cardCenter(id);
  const text = ref_.kind === 'head' ? headFileText(step) : ref_.target;
  return (
    <group position={[cx, SHELF_Y, cz]}>
      <group ref={group} scale={[1, instant ? 1 : 0.01, 1]}>
        <RoundedBox
          args={[CARD_W[id], CARD_H, CARD_D]}
          radius={0.08}
          smoothness={2}
          position={[0, CARD_H / 2, 0]}
        >
          <meshLambertMaterial ref={mat} color={color} flatShading />
        </RoundedBox>
        {focused && !exiting && (
          <mesh position={[0, 0.02, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[CARD_W[id] + 0.5, 1]} />
            <meshBasicMaterial color={PALETTE.focus} transparent opacity={0.7} />
          </mesh>
        )}
      </group>
      <Label
        position={[0, CARD_H / 2, CARD_D / 2 + 0.02]}
        anchor="translate(-50%, -50%)"
        opacity={exiting ? 0 : 1}
        instant={instant}
        attrs={{ 'data-ref': ref_.id }}
        className={`border-2 px-2 py-1 text-[11px] leading-4 ${
          focused ? 'border-amber-400' : detached ? 'border-rose-500' : 'border-transparent'
        }`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-bold text-slate-900">
            {isHead ? (
              'HEAD'
            ) : (
              <>
                {!compact && (
                  <span
                    style={{ fontFamily: MONO }}
                    className="text-[11px] font-normal text-slate-400"
                  >
                    refs/heads/
                  </span>
                )}
                {ref_.id}
              </>
            )}
          </span>
          {isHead && (!compact || detached) && (
            <span
              className={`font-bold tracking-wide ${detached ? 'text-rose-600' : 'text-pink-600'}`}
            >
              {detached ? 'DETACHED' : 'symbolic ref'}
            </span>
          )}
        </div>
        <div
          style={{ fontFamily: MONO }}
          className={`mt-0.5 rounded bg-slate-100 px-1.5 text-[12px] font-bold ${
            isHead ? (detached ? 'text-rose-700' : 'text-pink-800') : 'text-red-700'
          }`}
        >
          {text}
        </div>
      </Label>
    </group>
  );
};

const ReflogCard: React.FC<{
  reflog: ReflogRef;
  step: StoryStep;
  instant: boolean;
  compact: boolean;
}> = ({ reflog, step, instant, compact }) => {
  const focused = isFocused(step, reflog.id);
  const shown = reflog.entries.slice(0, REFLOG_ROWS);
  const older = reflog.entries.length - shown.length;
  return (
    <group position={REFLOG_POS}>
      <RoundedBox
        args={REFLOG_SIZE}
        radius={0.08}
        smoothness={2}
        position={[0, REFLOG_SIZE[1] / 2, 0]}
      >
        <meshLambertMaterial color={PALETTE.reflogCard} flatShading />
      </RoundedBox>
      {focused && (
        <mesh position={[0, 0.02, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[REFLOG_SIZE[0] + 0.5, 1]} />
          <meshBasicMaterial color={PALETTE.focus} transparent opacity={0.7} />
        </mesh>
      )}
      <Label
        position={[0, REFLOG_SIZE[1] / 2, CARD_D / 2 + 0.02]}
        anchor="translate(-50%, -50%)"
        instant={instant}
        attrs={{ 'data-ref': reflog.id }}
        className={`border-2 px-2 py-1 text-[11px] leading-[15px] ${
          focused ? 'border-amber-400' : 'border-transparent'
        }`}
      >
        <div className="mb-0.5 flex items-baseline justify-between gap-3">
          <span className="text-[13px] font-bold text-slate-900">HEAD reflog</span>
          {!compact && (
            <span style={{ fontFamily: MONO }} className="text-slate-400">
              {reflog.path}
            </span>
          )}
        </div>
        {shown.map((e, i) => {
          const hot = focused && isFocused(step, e.commit);
          return (
            <div
              key={`${e.commit}:${e.action}`}
              style={{ fontFamily: MONO }}
              className={`flex gap-2 rounded px-0.5 ${hot ? 'bg-amber-100' : ''} ${
                instant ? '' : 'transition-colors duration-300'
              }`}
            >
              <span className="text-slate-400">{`HEAD@{${i}}`}</span>
              <span className={`font-bold ${hot ? 'text-amber-700' : 'text-orange-700'}`}>
                {e.commit}
              </span>
              {!compact && <span className="text-slate-600">{shortAction(e.action)}</span>}
            </div>
          );
        })}
        {older > 0 && <div className="text-slate-400">… {older} older</div>}
      </Label>
    </group>
  );
};

// ---- Arrows ---------------------------------------------------------------------------

type ArrowKind = keyof typeof ARROW;

interface ArrowSpec {
  id: string;
  kind: ArrowKind;
  start: V3;
  mid: V3;
  end: V3;
  focused: boolean;
  faded: boolean;
}

/** Point on a commit's top face, nudged toward the side the arrow comes from. */
function commitTop(c: Commit, from: V3): V3 {
  const [cx, , cz] = commitPos(c);
  const dx = THREE.MathUtils.clamp((from[0] - cx) * 0.08, -COMMIT[0] * 0.3, COMMIT[0] * 0.3);
  return [cx + dx, COMMIT[1] + 0.03, cz - COMMIT[2] * 0.15];
}

/**
 * A drop onto a commit: leaves the source, then falls onto the commit's top face. When a
 * commit stands right behind the target (its label hangs over the target on screen), the
 * arrow comes down the gap to the left of that label and lands on the top's left edge.
 */
function dropOnto(
  start: V3,
  target: Commit,
  step: StoryStep,
  lift = 1.2
): Pick<ArrowSpec, 'start' | 'mid' | 'end'> {
  const blocked = step.commits.some(
    (c) =>
      c.state !== 'collected' &&
      c.cell.col === target.cell.col &&
      c.cell.row === target.cell.row - 1
  );
  if (blocked) {
    const [cx, , cz] = commitPos(target);
    const end: V3 = [cx - COMMIT[0] * 0.38, COMMIT[1] + 0.03, cz - COMMIT[2] * 0.1];
    const mid: V3 = [end[0] - 1.3, start[1] + lift + 1.5, cz - 1.2];
    return { start, mid, end };
  }
  const end = commitTop(target, start);
  const mid: V3 = [end[0], start[1] + lift, THREE.MathUtils.lerp(start[2], end[2], 0.75)];
  return { start, mid, end };
}

/** Parent arrows run low, from the child's left face to the parent's right face. */
function parentArc(child: Commit, parent: Commit): Pick<ArrowSpec, 'start' | 'mid' | 'end'> {
  const [cx, , cz] = commitPos(child);
  const [px, , pz] = commitPos(parent);
  const lean = (dz: number) => THREE.MathUtils.clamp(dz * 0.12, -COMMIT[2] * 0.3, COMMIT[2] * 0.3);
  const y = COMMIT[1] * 0.55;
  const start: V3 = [cx - COMMIT[0] / 2 - 0.02, y, cz + lean(pz - cz)];
  const end: V3 = [px + COMMIT[0] / 2 + 0.04, y, pz + lean(cz - pz)];
  const mid: V3 = [(start[0] + end[0]) / 2, y + (cz === pz ? 0.5 : 0.2), (start[2] + end[2]) / 2];
  return { start, mid, end };
}

function buildArrows(step: StoryStep): ArrowSpec[] {
  const arrows: ArrowSpec[] = [];
  const push = (
    ref: Reference,
    kind: ArrowKind,
    pts: Pick<ArrowSpec, 'start' | 'mid' | 'end'>,
    faded = false
  ) => arrows.push({ id: ref.id, kind, ...pts, focused: isRefFocused(step, ref), faded });

  const refs = getReferences(step);
  // The reflog only draws an arrow where it is the last thing keeping a commit alive.
  for (const r of getReferences(step, { includeReflog: true }))
    if (r.kind === 'reflog' && reachabilityState(step, r.to) === 'reflog-only') refs.push(r);

  for (const ref of refs) {
    if (ref.kind === 'parent') {
      const child = getCommit(step, ref.fromOwner);
      const parent = getCommit(step, ref.to);
      if (child && parent) push(ref, 'parent', parentArc(child, parent), child.state !== 'live');
    } else if (ref.kind === 'reflog') {
      const target = getCommit(step, ref.to);
      if (!target) continue;
      const start: V3 = [REFLOG_POS[0] + REFLOG_SIZE[0] / 2 + 0.05, WING_Y + 0.3, REFLOG_POS[2]];
      push(ref, 'reflog', dropOnto(start, target, step, 0.6), true);
    } else if (ref.fromOwner === 'HEAD') {
      const [hx] = cardCenter('HEAD');
      if (ref.toKind === 'ref') {
        // Symbolic: HEAD hops over to the top edge of the branch card it names.
        const [tx] = cardCenter(ref.to as CardId);
        const top = SHELF_Y + CARD_H + 0.02;
        const start: V3 = [hx + CARD_W.HEAD * 0.3, top, SHELF_Z];
        const end: V3 = [tx - CARD_W[ref.to as CardId] * 0.2, top + 0.05, SHELF_Z];
        const mid: V3 = [
          (start[0] + end[0]) / 2,
          top + 1.1 + Math.abs(end[0] - start[0]) * 0.08,
          SHELF_Z,
        ];
        push(ref, 'head', { start, mid, end });
      } else {
        // Detached: HEAD dives from its foot straight onto a commit, under every branch card.
        const target = getCommit(step, ref.to);
        if (!target) continue;
        const start: V3 = [hx + CARD_W.HEAD / 2 - 0.1, SHELF_Y + 0.05, SHELF_Z + 0.4];
        push(ref, 'detached', dropOnto(start, target, step, 0.5));
      }
    } else {
      const target = getCommit(step, ref.to);
      if (!target) continue;
      const [bx] = cardCenter(ref.fromOwner as CardId);
      const start: V3 = [bx, SHELF_Y + 0.05, SHELF_Z + CARD_D / 2 + 0.1];
      push(ref, 'branch', dropOnto(start, target, step));
    }
  }
  return arrows;
}

const UP = new THREE.Vector3(0, 1, 0);
const CONE_LEN = 0.34;

/**
 * One arrow, keyed by reference id: when its target changes (a branch moves, HEAD switches),
 * the same arrow swings to the new target instead of popping.
 */
const Arrow: React.FC<{ spec: ArrowSpec; instant: boolean }> = ({ spec, instant }) => {
  const line = useRef<QuadraticBezierLineRef>(null);
  const cone = useRef<THREE.Mesh>(null);
  // New arrows grow out of their source.
  const [initial] = useState(() => ({
    start: spec.start,
    mid: instant ? spec.mid : spec.start,
    end: instant ? spec.end : spec.start,
  }));
  const cur = useRef({
    start: new THREE.Vector3(...initial.start),
    mid: new THREE.Vector3(...initial.mid),
    end: new THREE.Vector3(...initial.end),
  });
  const color = spec.focused ? ARROW.focus : ARROW[spec.kind];
  const dashed = spec.focused || spec.faded;
  const dir = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const l = line.current;
    const c = cur.current;
    if (!l) return;
    let moved = false;
    (['start', 'mid', 'end'] as const).forEach((k) => {
      const v = c[k];
      const [tx, ty, tz] = spec[k];
      if (v.x === tx && v.y === ty && v.z === tz) return;
      moved = true;
      if (instant || v.distanceToSquared(new THREE.Vector3(tx, ty, tz)) < 1e-6) v.set(tx, ty, tz);
      else
        v.set(
          damp(v.x, tx, false, dt, 6),
          damp(v.y, ty, false, dt, 6),
          damp(v.z, tz, false, dt, 6)
        );
    });
    if (moved) l.setPoints(c.start, c.end, c.mid);
    // Dash spacing follows the curve's current length (20 points, cheap).
    if (dashed) l.computeLineDistances();
    if (cone.current) {
      dir.copy(c.end).sub(c.mid).normalize();
      if (dir.lengthSq() > 0) {
        cone.current.quaternion.setFromUnitVectors(UP, dir);
        cone.current.position.copy(c.end).addScaledVector(dir, -CONE_LEN / 2);
      }
      cone.current.visible = c.end.distanceToSquared(c.start) > 0.2;
    }
    if (spec.focused && !instant) {
      const m = l.material as THREE.Material & { dashOffset: number };
      m.dashOffset -= dt * 1.2;
    }
  });

  const width =
    spec.kind === 'detached' ? 4 : spec.focused ? 3.5 : spec.kind === 'parent' ? 2 : 2.5;
  return (
    <group>
      <QuadraticBezierLine
        ref={line}
        start={initial.start}
        end={initial.end}
        mid={initial.mid}
        color={color}
        lineWidth={width}
        dashed={dashed}
        dashSize={spec.faded && !spec.focused ? 0.18 : 0.35}
        gapSize={0.15}
        transparent
        opacity={spec.faded && !spec.focused ? 0.7 : 1}
      />
      <mesh ref={cone} visible={instant}>
        <coneGeometry args={[0.14, CONE_LEN, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
};

// ---- Scene ----------------------------------------------------------------------------

const commitKey = (c: Commit) => c.id;
const cardKey = (r: HeadRef | BranchRef) => r.id;

const RegionLabel: React.FC<{ position: V3; children: React.ReactNode }> = ({
  position,
  children,
}) => (
  <Html position={position} zIndexRange={[10, 0]}>
    <div
      data-viz-framed
      style={{ ...labelStyle, transition: 'opacity 200ms' }}
      className="text-[11px] font-bold tracking-[0.2em] text-slate-500"
    >
      {children}
    </div>
  </Html>
);

const Scene: React.FC<BranchPointers3DProps> = ({ step, camera, instant = false }) => {
  const commits = usePresence(step.commits, commitKey, 700);
  const cardRefs = useMemo(
    () => step.refs.filter((r): r is HeadRef | BranchRef => r.kind !== 'reflog'),
    [step.refs]
  );
  const cards = usePresence(cardRefs, cardKey, 500);
  const reflog = getRef(step, 'head-reflog');
  // Narrow viewers get terser ref labels (no path prefixes, no reflog verbs) to keep them apart.
  const compact = useThree((s) => s.size.width) < COMPACT_BELOW;
  // Compact labels overhang less: the reflog needs less room on the left.
  const shot = useMemo(() => {
    const s = SHOTS[step.shot];
    return compact ? { ...s, pad: { ...s.pad, left: Math.min(s.pad.left, 44) } } : s;
  }, [step.shot, compact]);
  const arrows = buildArrows(step);

  const floorCenter: V3 = [
    (FLOOR_MIN[0] + FLOOR_MAX[0]) / 2,
    -0.06,
    (FLOOR_MIN[2] + FLOOR_MAX[2]) / 2,
  ];
  const floorSize: V3 = [FLOOR_MAX[0] - FLOOR_MIN[0], 0.12, FLOOR_MAX[2] - FLOOR_MIN[2]];

  return (
    <>
      <color attach="background" args={['#f8fafc']} />
      <hemisphereLight args={['#ffffff', '#cbd5e1', 1.4]} />
      <directionalLight position={[6, 12, 8]} intensity={1.6} />

      {/* Commit graph floor */}
      <mesh position={floorCenter}>
        <boxGeometry args={floorSize} />
        <meshLambertMaterial color={PALETTE.floor} flatShading />
      </mesh>
      <gridHelper
        args={[floorSize[0], 16, PALETTE.floorEdge, PALETTE.floorEdge]}
        position={[floorCenter[0], 0.001, floorCenter[2]]}
        scale={[1, 1, floorSize[2] / floorSize[0]]}
      />
      <RegionLabel position={[FLOOR_MIN[0] + 0.3, 0.02, FLOOR_MAX[2]]}>COMMIT GRAPH</RegionLabel>

      {/* Refs shelf (.git/) and the reflog's lower wing */}
      <mesh
        position={[
          (SHELF_MIN[0] + SHELF_MAX[0]) / 2,
          SHELF_Y / 2,
          (SHELF_MIN[2] + SHELF_MAX[2]) / 2,
        ]}
      >
        <boxGeometry args={[SHELF_MAX[0] - SHELF_MIN[0], SHELF_Y, SHELF_MAX[2] - SHELF_MIN[2]]} />
        <meshLambertMaterial color={PALETTE.shelf} flatShading />
      </mesh>
      <mesh
        position={[(WING_MIN[0] + WING_MAX[0]) / 2, WING_Y / 2, (WING_MIN[2] + WING_MAX[2]) / 2]}
      >
        <boxGeometry args={[WING_MAX[0] - WING_MIN[0], WING_Y, WING_MAX[2] - WING_MIN[2]]} />
        <meshLambertMaterial color={PALETTE.shelf} flatShading />
      </mesh>
      <RegionLabel position={[REF_X.main + CARD_W.main / 2, SHELF_Y * 0.6, SHELF_MAX[2]]}>
        REFS <span className="font-normal tracking-normal text-orange-500">.git/</span>
      </RegionLabel>

      {commits.map(({ item, exiting }) => (
        <CommitBlock
          key={item.id}
          commit={item}
          exiting={exiting}
          focused={isFocused(step, item.id)}
          instant={instant}
        />
      ))}

      {cards.map(({ item, exiting }) => (
        <RefCard
          key={item.id}
          ref_={item}
          exiting={exiting}
          focused={isFocused(step, item.id)}
          step={step}
          instant={instant}
          compact={compact}
        />
      ))}

      {reflog && <ReflogCard reflog={reflog} step={step} instant={instant} compact={compact} />}

      {arrows.map((a) => (
        <Arrow key={a.id} spec={a} instant={instant} />
      ))}

      <LabelFramer />
      <StoryCamera shot={shot} bounds={SCENE_BOUNDS} camera={camera} instant={instant} />
    </>
  );
};

const BranchPointers3D: React.FC<BranchPointers3DProps> = (props) => (
  <Canvas
    orthographic
    dpr={[1, 2]}
    camera={{ position: [10, 10, 14], zoom: 30, near: -100, far: 200 }}
    gl={{ antialias: true, powerPreference: 'high-performance' }}
    aria-label={`3D view of branch pointers: ${props.step.title}`}
    role="img"
  >
    <Scene {...props} />
  </Canvas>
);

export default BranchPointers3D;
