import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  CubicBezierLine,
  Edges,
  Html,
  Line,
  QuadraticBezierLine,
  RoundedBox,
} from '@react-three/drei';
import * as THREE from 'three';
import {
  GRAPH_REGIONS,
  SCENARIO,
  getPullRequestCheck,
  getPullRequestTargets,
  getTrackingLinks,
  hasHeadBadge,
  isFocused,
  isStale,
  type CastId,
  type Cell,
  type Commit,
  type Crossing,
  type GraphRegionId,
  type PullRequest,
  type RefCard,
  type ScenarioBeat,
  type ShotId,
  type TrackingLink,
} from '../../../utils/shipAFeatureScenario';
import type { CameraState } from '../../../../../shared/components/viz/viewerCamera';
import { LabelFramer, StoryCamera } from '../../../../../shared/viz3d/camera';
import { boundsOf, type Box3, type Shot, type V3 } from '../../../../../shared/viz3d/frameShot';

/**
 * 3D renderer for the "Shipping a feature" scenario. Pure view: everything it draws comes from
 * `beat`. Style rules (docs/3D-Visualization-Standard.md): isometric-style orthographic camera,
 * flat-shaded limited palette, DOM labels that always face the viewer, preset shot per beat.
 *
 * Space: each cast member owns a platform, laid out like the 2D view. Your clone (back left)
 * and origin (back right) face each other across a gutter; Sam's clone and the CI runner sit in
 * front. A clone platform holds a commit grid (4 x 3) and, in front of it, a rail of upright ref
 * cards. Tracking links cross the gutter from a clone's remote-tracking card to origin's branch
 * card; a pushed or fetched commit glides along its row from one platform to the other.
 */

export interface ShipAFeature3DProps {
  beat: ScenarioBeat;
  /** The learner's camera: view preset, Hold view, pan mode and one-shot commands. */
  camera: CameraState;
  /** Reduced motion: no tweening, instant camera cuts. */
  instant?: boolean;
}

const PALETTE = {
  commit: '#fb923c',
  reflogOnly: '#cbd5e1',
  unreachable: '#fb7185',
  branch: '#f87171',
  remote: '#7dd3fc',
  prOpen: '#86efac',
  prMerged: '#c4b5fd',
  ci: '#6ee7b7',
  ghost: '#38bdf8',
  focus: '#f59e0b',
};

const PLATFORM_STYLE: Record<CastId, { top: string; side: string; accent: string }> = {
  you: { top: '#fff7ed', side: '#fed7aa', accent: '#ea580c' },
  sam: { top: '#fdf2f8', side: '#fbcfe8', accent: '#db2777' },
  origin: { top: '#f8fafc', side: '#cbd5e1', accent: '#475569' },
  ci: { top: '#ecfdf5', side: '#a7f3d0', accent: '#059669' },
};

const LINE = {
  parent: '#64748b',
  link: '#0ea5e9',
  stale: '#e11d48',
  crossing: '#0284c7',
  focus: '#f59e0b',
};

// ---- Layout (world units) -------------------------------------------------------------
// Every platform is laid out in local coordinates: `lx` across (centre 0), `lz` from its back
// edge toward the viewer.

const PW = 10.8; // platform width
const HALF = PW / 2;
const GX = 2.2; // gutter between left and right platforms (tracking links cross it)
const GZ = 1.2; // gutter between back and front rows
const PLAT_H = 0.3;
const COL_X = [-3.6, -1.2, 1.2, 3.6];
const ROW_Z = [3.1, 5.0, 6.9];
const BLOCK: V3 = [1.5, 0.45, 0.9];

// Ref rail: branches on the left column, remote-tracking refs on the right, as in 2D. Origin's
// branches fill the left column's three rows; its PR card spans the right column.
const RAIL_ROW_Z = [9.2, 12];
const RAIL_COL = [
  { x: -3.45, w: 3.7 },
  { x: 2.95, w: 4.7 },
];
const CARD_H = 1;
const CARD_D = 0.4;
const PR_H = 1.6;
/** Viewer width (px) under which labels switch to their compact form. */
const COMPACT_BELOW = 700;

const DEPTH: Record<CastId, number> = { you: 13.2, origin: 13.2, sam: 13.2, ci: 8.4 };
const LEFT_X = -(PW + GX) / 2;
const RIGHT_X = (PW + GX) / 2;
const BACK_Z = -GZ / 2 - DEPTH.you;
const FRONT_Z = GZ / 2;
const PLATFORM: Record<CastId, { x: number; z: number }> = {
  you: { x: LEFT_X, z: BACK_Z },
  origin: { x: RIGHT_X, z: BACK_Z },
  sam: { x: LEFT_X, z: FRONT_Z },
  ci: { x: RIGHT_X, z: FRONT_Z },
};

/** World point from a platform's local coordinates. */
const at = (r: CastId, lx: number, y: number, lz: number): V3 => [
  PLATFORM[r].x + lx,
  y,
  PLATFORM[r].z + lz,
];

const commitPos = (r: GraphRegionId, cell: Cell): V3 => at(r, COL_X[cell.col], 0, ROW_Z[cell.row]);

/** Rail slot to (col, row). Clones: 0 main, 1 own branch, 2-3 remote-tracking refs. */
const CLONE_RAIL: Cell[] = [
  { col: 0, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 0 },
  { col: 1, row: 1 },
];
/**
 * Origin: 0 main, 1 rate-limit, 2 feature/search. rate-limit is gone before PR #7 opens, so it
 * borrows the front of the column the PR card later fills.
 */
const ORIGIN_RAIL: Cell[] = [
  { col: 0, row: 0 },
  { col: 1, row: 1 },
  { col: 0, row: 1 },
];

const railCell = (region: GraphRegionId, slot: number) =>
  region === 'origin' ? ORIGIN_RAIL[slot] : CLONE_RAIL[slot];

/** Centre of a ref card's base. */
const cardBase = (region: GraphRegionId, slot: number): V3 => {
  const c = railCell(region, slot);
  return at(region, RAIL_COL[c.col].x, 0, RAIL_ROW_Z[c.row]);
};
const cardWidth = (region: GraphRegionId, slot: number) => RAIL_COL[railCell(region, slot).col].w;

const PR_BASE: V3 = at('origin', RAIL_COL[1].x, 0, (RAIL_ROW_Z[0] + RAIL_ROW_Z[1]) / 2);
const CI_CARD_Z = [3.8, 6.8];
const CI_CARD_W = PW - 1;

// ---- Camera shots ---------------------------------------------------------------------

const platformBox = (r: CastId): Box3 => {
  const { x, z } = PLATFORM[r];
  return [
    [x - HALF, -PLAT_H, z],
    [x + HALF, CARD_H, z + DEPTH[r]],
  ];
};

const localBox = (r: CastId, lx0: number, lx1: number, lz0: number, lz1: number): Box3 => {
  const a = at(r, lx0, 0, lz0);
  const b = at(r, lx1, CARD_H, lz1);
  return [a, b];
};

const SCENE_BOUNDS: Box3 = boundsOf((['you', 'sam', 'origin', 'ci'] as const).map(platformBox), 3);

const PAD = { left: 14, right: 14, top: 16, bottom: 24 };
const SHOTS: Record<ShotId, Shot> = {
  overview: { boxes: (['you', 'sam', 'origin', 'ci'] as const).map(platformBox), pad: PAD },
  you: { boxes: [platformBox('you')], pad: PAD },
  origin: { boxes: [platformBox('origin')], pad: PAD },
  bridge: { boxes: [platformBox('you'), platformBox('origin')], pad: PAD },
  ship: {
    boxes: [
      // Origin's grid columns 2-3, its whole rail (branches and PR #7), and the CI runner.
      localBox('origin', COL_X[2] - BLOCK[0], HALF, ROW_Z[0] - 1, ROW_Z[2] + 1),
      localBox('origin', -HALF, HALF, RAIL_ROW_Z[0] - 1, DEPTH.origin),
      platformBox('ci'),
    ],
    pad: PAD,
  },
};

/** The isometric preset turned a little toward the front: the scene is two platforms wide. */
const DIRECTIONS = { iso: [0.8, 10, 11] as V3 };

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
    const t = setTimeout(() => {
      setLeaving((m) => {
        const next = new Map(m);
        removed.forEach((r) => next.delete(keyOf(r)));
        return next;
      });
    }, ms);
    return () => clearTimeout(t);
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

const Pill: React.FC<{ className: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <span className={`rounded-full px-1.5 text-[11px] font-bold leading-4 ${className}`}>
    {children}
  </span>
);

/** Amber footprint under a focused object. */
const FocusPad: React.FC<{ w: number; d: number; y?: number; z?: number }> = ({
  w,
  d,
  y = 0.012,
  z = 0,
}) => (
  <mesh position={[0, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[w, d]} />
    <meshBasicMaterial color={PALETTE.focus} transparent opacity={0.6} />
  </mesh>
);

// ---- Platforms -------------------------------------------------------------------------

const Platform: React.FC<{ id: CastId; acting: boolean; compact: boolean; instant: boolean }> = ({
  id,
  acting,
  compact,
  instant,
}) => {
  const { x, z } = PLATFORM[id];
  const d = DEPTH[id];
  const style = PLATFORM_STYLE[id];
  const member = SCENARIO.cast.find((m) => m.id === id)!;
  return (
    <group>
      <mesh position={[x, -PLAT_H / 2, z + d / 2]}>
        <boxGeometry args={[PW, PLAT_H, d]} />
        <meshLambertMaterial color={style.side} flatShading />
      </mesh>
      <mesh position={[x, 0.002, z + d / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PW - 0.2, d - 0.2]} />
        <meshLambertMaterial color={style.top} />
      </mesh>
      {acting && (
        // The acting member's platform gets an accent rim.
        <mesh position={[x, -PLAT_H / 2, z + d / 2]}>
          <boxGeometry args={[PW + 0.02, PLAT_H + 0.02, d + 0.02]} />
          <meshBasicMaterial visible={false} />
          <Edges color={style.accent} lineWidth={2.5} />
        </mesh>
      )}
      <Label
        position={at(id, -HALF + 0.3, 0.01, 1.05)}
        anchor="translate(0, -50%)"
        instant={instant}
        attrs={{ 'data-region-tag': id }}
        className={`border px-2 py-0.5 text-[11px] leading-4 ${
          acting ? 'border-slate-300' : 'border-transparent'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold" style={{ color: style.accent }}>
            {member.name}
          </span>
          <span className="text-slate-500">{member.role}</span>
          {acting && (
            <span
              className="rounded-full px-1.5 text-[11px] font-bold leading-4 text-white"
              style={{ background: style.accent }}
            >
              acting
            </span>
          )}
        </div>
        {!compact && <div className="text-slate-500">{member.copy}</div>}
      </Label>
    </group>
  );
};

// ---- Commits ---------------------------------------------------------------------------

const STATE_TAG: Record<Commit['state'], string | null> = {
  live: null,
  'reflog-only': 'reflog only',
  unreachable: 'unreachable',
};

const CommitBlock: React.FC<{
  commit: Commit;
  exiting: boolean;
  focused: boolean;
  /** Seconds to wait before growing in: a crossing commit lands when its ghost arrives. */
  enterDelay: number;
  /** A wide label leans toward an empty neighbour cell. */
  lean: 'left' | 'right' | 'centre';
  instant: boolean;
}> = ({ commit, exiting, focused, enterDelay, lean, instant }) => {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshLambertMaterial>(null);
  const age = useRef(0);
  const [landed, setLanded] = useState(instant || enterDelay === 0);
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
  const opacity = exiting ? 0 : unreachable ? 0.3 : 1;

  useFrame((_, dt) => {
    if (!group.current || !mat.current) return;
    age.current += dt;
    const waiting = !instant && age.current < enterDelay;
    if (!waiting && !landed) setLanded(true);
    const s = group.current.scale;
    const grow = exiting || waiting ? 0.05 : 1;
    s.x = damp(s.x, exiting ? 0.8 : waiting ? 0.2 : 1, instant, dt);
    s.z = s.x;
    s.y = damp(s.y, grow, instant, dt, 6);
    mat.current.opacity = damp(mat.current.opacity, opacity, instant, dt, 5);
    mat.current.color.lerp(color, instant ? 1 : Math.min(1, dt * 6));
  });

  const tag = STATE_TAG[commit.state];
  const anchor =
    tag && lean === 'left'
      ? 'translate(calc(-100% + 24px), -50%)'
      : tag && lean === 'right'
        ? 'translate(-24px, -50%)'
        : 'translate(-50%, -50%)';
  return (
    <group position={commitPos(commit.region, commit.cell)}>
      {focused && !exiting && <FocusPad w={BLOCK[0] + 0.45} d={BLOCK[2] + 0.45} />}
      <group ref={group} scale={instant ? [1, 1, 1] : [0.2, 0.01, 0.2]}>
        <RoundedBox args={BLOCK} radius={0.1} smoothness={3} position={[0, BLOCK[1] / 2, 0]}>
          <meshLambertMaterial
            ref={mat}
            color={color}
            transparent
            opacity={instant ? opacity : 1}
            flatShading
          />
        </RoundedBox>
        {unreachable && (
          <mesh position={[0, BLOCK[1] / 2, 0]}>
            <boxGeometry args={BLOCK} />
            <meshBasicMaterial visible={false} />
            <Edges color={PALETTE.unreachable} lineWidth={2} />
          </mesh>
        )}
      </group>
      {/* The label sits on the block's top face; arrows land on its sides. */}
      <Label
        position={[0, BLOCK[1], 0]}
        anchor={anchor}
        opacity={exiting || !landed ? 0 : 1}
        instant={instant}
        attrs={{ 'data-commit': commit.id, 'data-state': commit.state }}
        className={`border px-1.5 text-[11px] leading-4 ${
          focused
            ? 'border-2 border-amber-400'
            : unreachable
              ? 'border-rose-300'
              : 'border-slate-200'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span
            style={{ fontFamily: MONO }}
            className={`text-[12px] font-bold ${
              commit.state === 'live' ? 'text-orange-800' : 'text-slate-500'
            }`}
          >
            {commit.sha}
          </span>
          {tag && (
            <span className={`font-bold ${unreachable ? 'text-rose-600' : 'text-slate-500'}`}>
              {tag}
            </span>
          )}
        </span>
      </Label>
    </group>
  );
};

// ---- Ref cards ---------------------------------------------------------------------------

/** An upright card on a rail; its DOM label covers the front face. */
const CardSlab: React.FC<{
  width: number;
  height: number;
  color: string;
  exiting: boolean;
  faded: boolean;
  focused: boolean;
  instant: boolean;
}> = ({ width, height, color, exiting, faded, focused, instant }) => {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshLambertMaterial>(null);
  const target = useMemo(() => new THREE.Color(color), [color]);
  useFrame((_, dt) => {
    if (!group.current || !mat.current) return;
    group.current.scale.y = damp(group.current.scale.y, exiting ? 0.01 : 1, instant, dt);
    mat.current.color.lerp(target, instant ? 1 : Math.min(1, dt * 6));
    mat.current.opacity = damp(mat.current.opacity, faded ? 0.35 : 1, instant, dt, 5);
  });
  return (
    <>
      {focused && !exiting && <FocusPad w={width + 0.4} d={CARD_D + 0.7} />}
      <group ref={group} scale={[1, instant ? 1 : 0.01, 1]}>
        <RoundedBox
          args={[width, height, CARD_D]}
          radius={0.06}
          smoothness={2}
          position={[0, height / 2, 0]}
        >
          <meshLambertMaterial ref={mat} color={color} transparent flatShading />
        </RoundedBox>
      </group>
    </>
  );
};

const RefCardView: React.FC<{
  beat: ScenarioBeat;
  card: RefCard;
  exiting: boolean;
  compact: boolean;
  instant: boolean;
}> = ({ beat, card, exiting, compact, instant }) => {
  const focused = isFocused(beat, card.id);
  const remote = card.kind === 'remote-tracking';
  const deleted = card.state === 'deleted';
  const head = hasHeadBadge(beat, card.id);
  const stale = remote && isStale(beat, card.id);
  const w = cardWidth(card.region, card.slot);
  return (
    <group position={cardBase(card.region, card.slot)}>
      <CardSlab
        width={w}
        height={CARD_H}
        color={remote ? PALETTE.remote : PALETTE.branch}
        exiting={exiting}
        faded={deleted}
        focused={focused}
        instant={instant}
      />
      <Label
        position={[0, CARD_H / 2, CARD_D / 2 + 0.02]}
        anchor="translate(-50%, -50%)"
        opacity={exiting ? 0 : deleted ? 0.75 : 1}
        instant={instant}
        attrs={{ 'data-ref': card.id, 'data-state': card.state }}
        className={`border px-1.5 text-[11px] leading-4 ${
          focused
            ? 'border-2 border-amber-400'
            : deleted
              ? 'border-dashed border-rose-300'
              : remote
                ? 'border-sky-300'
                : 'border-orange-300'
        }`}
      >
        <div
          className={`${compact ? 'font-medium' : 'font-bold'} ${
            deleted ? 'text-slate-500 line-through' : 'text-slate-900'
          }`}
        >
          {card.name}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            style={{ fontFamily: MONO }}
            className={`font-bold ${remote ? 'text-sky-700' : 'text-orange-700'}`}
          >
            {`→ ${card.target}`}
          </span>
          {head && <Pill className="bg-pink-100 text-pink-700">HEAD</Pill>}
          {stale && <Pill className="bg-rose-100 text-rose-700">stale</Pill>}
          {deleted && <Pill className="bg-rose-100 text-rose-700">deleted</Pill>}
        </div>
      </Label>
    </group>
  );
};

const PRCardView: React.FC<{
  beat: ScenarioBeat;
  shown: PullRequest;
  exiting: boolean;
  instant: boolean;
}> = ({ beat, shown, exiting, instant }) => {
  const focused = isFocused(beat, shown.id);
  const targets = getPullRequestTargets(beat);
  const check = getPullRequestCheck(beat);
  const merged = shown.state === 'merged';
  return (
    <group position={PR_BASE}>
      <CardSlab
        width={RAIL_COL[1].w}
        height={PR_H}
        color={merged ? PALETTE.prMerged : PALETTE.prOpen}
        exiting={exiting}
        faded={false}
        focused={focused}
        instant={instant}
      />
      <Label
        position={[0, PR_H / 2, CARD_D / 2 + 0.02]}
        anchor="translate(-50%, -50%)"
        opacity={exiting ? 0 : 1}
        instant={instant}
        attrs={{ 'data-pr': shown.id, 'data-state': shown.state }}
        className={`border px-2 py-0.5 text-[11px] leading-4 ${
          focused ? 'border-2 border-amber-400' : merged ? 'border-violet-300' : 'border-green-400'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-bold text-slate-900">{`PR #${shown.number}`}</span>
          <Pill
            className={merged ? 'bg-violet-100 text-violet-700' : 'bg-green-100 text-green-700'}
          >
            {shown.state}
          </Pill>
        </div>
        <div style={{ fontFamily: MONO }} className="text-slate-700">
          {`${shown.head} → ${shown.base}`}
        </div>
        <div className="text-slate-500">
          head{' '}
          <span style={{ fontFamily: MONO }} className="font-bold text-orange-700">
            {targets?.head ?? '—'}
          </span>{' '}
          base{' '}
          <span style={{ fontFamily: MONO }} className="font-bold text-orange-700">
            {targets?.base ?? '—'}
          </span>
        </div>
        <div
          className={`font-bold ${
            check === 'passed'
              ? 'text-emerald-600'
              : check === 'pending'
                ? 'text-amber-600'
                : 'text-slate-400'
          }`}
        >
          {check === 'none' ? 'no check yet' : `check ${check}`}
        </div>
      </Label>
    </group>
  );
};

// ---- CI runner ---------------------------------------------------------------------------

const JOB_DETAIL = {
  idle: 'waits for a pull request',
  running: 'running the tests on the merge result',
  passed: 'tests passed on the merge result',
} as const;

const CICards: React.FC<{ beat: ScenarioBeat; instant: boolean }> = ({ beat, instant }) => {
  const { job, checkout } = beat.ci;
  const jobFocused = isFocused(beat, job.id);
  const coFocused = isFocused(beat, checkout.id);
  const jobPill =
    job.state === 'passed'
      ? 'bg-emerald-100 text-emerald-700'
      : job.state === 'running'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-slate-100 text-slate-500';
  return (
    <>
      <group position={at('ci', 0, 0, CI_CARD_Z[job.slot])}>
        <CardSlab
          width={CI_CARD_W}
          height={CARD_H}
          color={PALETTE.ci}
          exiting={false}
          faded={job.state === 'idle'}
          focused={jobFocused}
          instant={instant}
        />
        <Label
          position={[0, CARD_H / 2, CARD_D / 2 + 0.02]}
          anchor="translate(-50%, -50%)"
          instant={instant}
          attrs={{ 'data-ci': job.id, 'data-state': job.state }}
          className={`border px-2 text-[11px] leading-4 ${
            jobFocused ? 'border-2 border-amber-400' : 'border-emerald-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900">job</span>
            <span style={{ fontFamily: MONO }} className="text-slate-600">
              test
            </span>
            <Pill className={jobPill}>{job.state}</Pill>
          </div>
          <div className="text-slate-500">{JOB_DETAIL[job.state]}</div>
        </Label>
      </group>
      <group position={at('ci', 0, 0, CI_CARD_Z[checkout.slot])}>
        <CardSlab
          width={CI_CARD_W}
          height={CARD_H}
          color={PALETTE.ci}
          exiting={false}
          faded={!checkout.ref}
          focused={coFocused}
          instant={instant}
        />
        <Label
          position={[0, CARD_H / 2, CARD_D / 2 + 0.02]}
          anchor="translate(-50%, -50%)"
          instant={instant}
          attrs={{ 'data-ci': checkout.id }}
          className={`border px-2 text-[11px] leading-4 ${
            coFocused ? 'border-2 border-amber-400' : 'border-emerald-300'
          }`}
        >
          <div className="font-bold text-slate-900">checkout</div>
          <div
            style={{ fontFamily: MONO }}
            className={checkout.ref ? 'font-bold text-emerald-700' : 'text-slate-400'}
          >
            {checkout.ref ?? 'nothing checked out'}
          </div>
        </Label>
      </group>
    </>
  );
};

// ---- Lines ---------------------------------------------------------------------------------

const UP = new THREE.Vector3(0, 1, 0);
const CONE_LEN = 0.32;

/** A cone at `end`, pointing along `end - from`. */
const ArrowHead: React.FC<{ from: V3; end: V3; color: string; size?: number }> = ({
  from,
  end,
  color,
  size = 1,
}) => {
  const { position, quaternion } = useMemo(() => {
    const e = new THREE.Vector3(...end);
    const dir = e
      .clone()
      .sub(new THREE.Vector3(...from))
      .normalize();
    return {
      position: e.clone().addScaledVector(dir, (-CONE_LEN * size) / 2),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir),
    };
  }, [from, end, size]);
  return (
    <mesh position={position} quaternion={quaternion}>
      <coneGeometry args={[0.13 * size, CONE_LEN * size, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

interface LineStyle {
  color: string;
  lineWidth: number;
  dashed?: boolean;
  dashSize?: number;
  gapSize?: number;
  opacity?: number;
}

const Quad: React.FC<{ pts: [V3, V3, V3]; style: LineStyle }> = ({ pts, style }) => (
  <QuadraticBezierLine
    start={pts[0]}
    mid={pts[1]}
    end={pts[2]}
    transparent
    opacity={style.opacity ?? 1}
    {...style}
  />
);

// Parent arrows run low inside a region, from the child's side face to the parent's.
function parentArc(r: GraphRegionId, child: Commit, parent: Commit): [V3, V3, V3] {
  const [cx, , cz] = commitPos(r, child.cell);
  const [px, , pz] = commitPos(r, parent.cell);
  const y = BLOCK[1] * 0.5;
  if (child.cell.col === parent.cell.col) {
    // Same column: back face to front face, over the empty cell between them.
    const start: V3 = [cx, y, cz - BLOCK[2] / 2 - 0.02];
    const end: V3 = [px, y, pz + BLOCK[2] / 2 + 0.05];
    return [start, [cx - 0.5, y + 0.3, (cz + pz) / 2], end];
  }
  const lean = (dz: number) => THREE.MathUtils.clamp(dz * 0.1, -BLOCK[2] * 0.3, BLOCK[2] * 0.3);
  const start: V3 = [cx - BLOCK[0] / 2 - 0.02, y, cz + lean(pz - cz)];
  const end: V3 = [px + BLOCK[0] / 2 + 0.05, y, pz + lean(cz - pz)];
  const mid: V3 = [(start[0] + end[0]) / 2, y + (cz === pz ? 0.4 : 0.15), (start[2] + end[2]) / 2];
  return [start, mid, end];
}

const ParentArrows: React.FC<{ beat: ScenarioBeat }> = ({ beat }) => (
  <>
    {GRAPH_REGIONS.flatMap((r) => {
      const commits = beat.regions[r].commits;
      return commits.flatMap((child) =>
        child.parents.flatMap((sha) => {
          const parent = commits.find((c) => c.sha === sha);
          if (!parent) return [];
          const pts = parentArc(r, child, parent);
          const faded = child.state !== 'live';
          return [
            <group key={`${child.id}>${sha}`}>
              <Quad
                pts={pts}
                style={{
                  color: LINE.parent,
                  lineWidth: 2,
                  dashed: faded,
                  dashSize: 0.18,
                  gapSize: 0.12,
                  opacity: faded ? 0.6 : 1,
                }}
              />
              <ArrowHead from={pts[1]} end={pts[2]} color={LINE.parent} size={0.8} />
            </group>,
          ];
        })
      );
    })}
  </>
);

const REMOTE_SLOT: Record<string, number> = { main: 0, 'rate-limit': 1, 'feature/search': 2 };
const vec = (p: V3) => new THREE.Vector3(...p);
const v3 = (p: THREE.Vector3): V3 => [p.x, p.y, p.z];

/**
 * Tracking link: from the clone's remote-tracking card to the side of origin's branch card that
 * faces it. Your links cross the gutter at their own row and land high; Sam's climb the gutter
 * from the front and land low, so the two never meet.
 */
function linkCurve(beat: ScenarioBeat, link: TrackingLink): THREE.Curve<THREE.Vector3> | null {
  const local = beat.regions[link.local.split('.')[0] as GraphRegionId].refs.find(
    (r) => r.id === link.local
  );
  if (!local) return null;
  const slot = REMOTE_SLOT[link.remote.slice('origin.'.length)];
  const [sx, , sz] = cardBase(local.region, local.slot);
  const [ex, , ez] = cardBase('origin', slot);
  const start = vec([sx + cardWidth(local.region, local.slot) / 2 + 0.02, CARD_H * 0.55, sz]);
  const endX = ex - cardWidth('origin', slot) / 2 - 0.04;
  if (local.region === 'you') {
    const end = vec([endX, CARD_H * 0.7, ez]);
    const mid = start
      .clone()
      .lerp(end, 0.5)
      .setY(CARD_H + 0.4);
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }
  const end = vec([endX, CARD_H * 0.3, ez + CARD_D * 0.2]);
  const front = railCell('origin', slot).col === 1;
  return new THREE.CubicBezierCurve3(
    start,
    start.clone().add(vec([1.4, 0, front ? -1.5 : -1])),
    // A card in origin's right column is reached through the gap between the rail columns.
    end.clone().add(vec(front ? [-0.9, 0, 2.6] : [-1.2, 0, 1.6])),
    end
  );
}

/** Points of `curve` between `t0` and `t1`. */
const piece = (curve: THREE.Curve<THREE.Vector3>, t0: number, t1: number, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => v3(curve.getPoint(t0 + ((t1 - t0) * i) / n)));

const TrackingLinks: React.FC<{ beat: ScenarioBeat }> = ({ beat }) => (
  <>
    {getTrackingLinks(beat).map((l) => {
      const curve = linkCurve(beat, l);
      if (!curve) return null;
      const focused = isFocused(beat, l.local) || isFocused(beat, l.remote);
      const color = l.stale ? LINE.stale : focused ? LINE.focus : LINE.link;
      const lineWidth = focused ? 3.5 : 2.5;
      // Stale: the link is broken in the middle, in the warning colour.
      const pieces = l.stale
        ? [piece(curve, 0, 0.42), piece(curve, 0.58, 1)]
        : [piece(curve, 0, 1)];
      const end = v3(curve.getPoint(1));
      return (
        <group key={l.id} userData={{ link: l.id, stale: l.stale }}>
          {pieces.map((pts, i) => (
            <Line key={i} points={pts} color={color} lineWidth={lineWidth} />
          ))}
          {l.remoteTarget ? (
            <ArrowHead from={v3(curve.getPoint(0.96))} end={end} color={color} />
          ) : (
            // origin's branch is gone: the link ends in a cross.
            <group position={end}>
              {[1, -1].map((s) => (
                <mesh key={s} rotation={[0, 0, (s * Math.PI) / 4]}>
                  <boxGeometry args={[0.5, 0.08, 0.08]} />
                  <meshBasicMaterial color={LINE.stale} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      );
    })}
  </>
);

// ---- Crossings ------------------------------------------------------------------------------

const CROSS_PERIOD = 2.8; // seconds per glide, repeated while the beat is on screen
const CROSS_DELAY = 1.1; // the arriving commit grows in after the first glide

/**
 * A commit copied between regions: a track runs along the lane in front of its row, from the
 * source block's side, across the gutter, into the target block's side. A ghost of the commit
 * glides along it.
 */
function crossingCurve(c: Crossing, cell: Cell): THREE.CubicBezierCurve3 {
  const [sx, , sz] = commitPos(c.from, cell);
  const [ex, , ez] = commitPos(c.to, cell);
  const dir = Math.sign(ex - sx);
  const y = BLOCK[1] * 0.5;
  const start = new THREE.Vector3(sx + (dir * BLOCK[0]) / 2, y, sz);
  const end = new THREE.Vector3(ex - (dir * BLOCK[0]) / 2 - dir * 0.05, y, ez);
  const lane = 0.95;
  return new THREE.CubicBezierCurve3(
    start,
    new THREE.Vector3(start.x + dir * 1.6, 0.08, sz + lane),
    new THREE.Vector3(end.x - dir * 1.6, 0.08, ez + lane),
    end
  );
}

const CrossingView: React.FC<{ crossing: Crossing; cell: Cell; instant: boolean }> = ({
  crossing,
  cell,
  instant,
}) => {
  const curve = useMemo(() => crossingCurve(crossing, cell), [crossing, cell]);
  const ghost = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshLambertMaterial>(null);
  const t = useRef(0);
  const v = v3;

  useFrame((_, dt) => {
    if (!ghost.current || !mat.current || instant) return;
    t.current = (t.current + dt / CROSS_PERIOD) % 1;
    const k = t.current;
    const u = THREE.MathUtils.smoothstep(k, 0.08, 0.7);
    ghost.current.position.copy(curve.getPoint(u));
    ghost.current.position.y = 0;
    mat.current.opacity = k < 0.08 ? k / 0.08 : k > 0.75 ? Math.max(0, 1 - (k - 0.75) / 0.2) : 1;
  });

  const end = curve.v3;
  return (
    <group>
      <CubicBezierLine
        start={v(curve.v0)}
        midA={v(curve.v1)}
        midB={v(curve.v2)}
        end={v(end)}
        color={LINE.crossing}
        lineWidth={2.5}
        dashed
        dashSize={0.3}
        gapSize={0.18}
      />
      <ArrowHead from={v(curve.getPoint(0.95))} end={v(end)} color={LINE.crossing} />
      {!instant && (
        <group ref={ghost} position={v(curve.v0)}>
          <RoundedBox
            args={[BLOCK[0] * 0.9, BLOCK[1] * 0.9, BLOCK[2] * 0.9]}
            radius={0.1}
            smoothness={3}
            position={[0, BLOCK[1] / 2, 0]}
          >
            <meshLambertMaterial ref={mat} color={PALETTE.ghost} transparent opacity={0} />
          </RoundedBox>
        </group>
      )}
    </group>
  );
};

// ---- Scene ----------------------------------------------------------------------------------

const commitKey = (c: Commit) => c.id;
const cardKey = (c: RefCard) => c.id;
const prKey = (p: PullRequest) => p.id;

/** A tagged (wide) label leans toward whichever neighbour cell is empty. */
function leanOf(commits: Commit[], c: Commit): 'left' | 'right' | 'centre' {
  const taken = (col: number) =>
    commits.some((o) => o.cell.row === c.cell.row && o.cell.col === col);
  if (!taken(c.cell.col - 1) && c.cell.col > 0) return 'left';
  if (!taken(c.cell.col + 1) && c.cell.col < COL_X.length - 1) return 'right';
  return 'centre';
}

const Scene: React.FC<ShipAFeature3DProps> = ({ beat, camera, instant = false }) => {
  const allCommits = useMemo(() => GRAPH_REGIONS.flatMap((r) => beat.regions[r].commits), [beat]);
  const allCards = useMemo(() => GRAPH_REGIONS.flatMap((r) => beat.regions[r].refs), [beat]);
  const commits = usePresence(allCommits, commitKey, 700);
  const cards = usePresence(allCards, cardKey, 500);
  const showLinks = beat.shot === 'overview' || beat.shot === 'bridge';
  const arriving = new Set(beat.crossings.map((c) => `${c.to}.${c.sha}`));
  const prList = useMemo(() => (beat.regions.origin.pr ? [beat.regions.origin.pr] : []), [beat]);
  const prs = usePresence(prList, prKey, 500);
  // Narrow viewers get terser labels (no region blurb, lighter ref names) to keep them apart.
  const compact = useThree((s) => s.size.width) < COMPACT_BELOW;

  return (
    <>
      <color attach="background" args={['#f8fafc']} />
      <hemisphereLight args={['#ffffff', '#cbd5e1', 1.4]} />
      <directionalLight position={[6, 12, 8]} intensity={1.6} />

      {(['you', 'sam', 'origin', 'ci'] as const).map((id) => (
        <Platform key={id} id={id} acting={beat.actor === id} compact={compact} instant={instant} />
      ))}

      {commits.map(({ item, exiting }) => (
        <CommitBlock
          key={item.id}
          commit={item}
          exiting={exiting}
          focused={isFocused(beat, item.id)}
          enterDelay={arriving.has(item.id) ? CROSS_DELAY : 0}
          lean={leanOf(beat.regions[item.region].commits, item)}
          instant={instant}
        />
      ))}

      {cards.map(({ item, exiting }) => (
        <RefCardView
          key={item.id}
          beat={beat}
          card={item}
          exiting={exiting}
          compact={compact}
          instant={instant}
        />
      ))}
      {prs.map(({ item, exiting }) => (
        <PRCardView key={item.id} beat={beat} shown={item} exiting={exiting} instant={instant} />
      ))}
      <CICards beat={beat} instant={instant} />

      <ParentArrows beat={beat} />
      {showLinks && <TrackingLinks beat={beat} />}
      {beat.crossings.map((c) => {
        const cell = beat.regions[c.to].commits.find((x) => x.sha === c.sha)?.cell;
        return cell ? (
          <CrossingView key={`${beat.id}:${c.id}`} crossing={c} cell={cell} instant={instant} />
        ) : null;
      })}

      <LabelFramer />
      <StoryCamera
        shot={SHOTS[beat.shot]}
        bounds={SCENE_BOUNDS}
        camera={camera}
        instant={instant}
        directions={DIRECTIONS}
      />
    </>
  );
};

const ShipAFeature3D: React.FC<ShipAFeature3DProps> = (props) => (
  <Canvas
    orthographic
    dpr={[1, 2]}
    camera={{ position: [10, 10, 14], zoom: 20, near: -200, far: 400 }}
    gl={{ antialias: true, powerPreference: 'high-performance' }}
    aria-label={`3D view of shipping a feature: ${props.beat.title}`}
    role="img"
  >
    <Scene {...props} />
  </Canvas>
);

export default ShipAFeature3D;
