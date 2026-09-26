import React from 'react';
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
  type GraphRegionId,
  type RefCard,
  type ScenarioBeat,
  type TrackingLink,
} from '../../../utils/shipAFeatureScenario';

interface ShipAFeature2DProps {
  beat: ScenarioBeat;
}

// Layout: two columns. Left: your clone above Sam's. Right: origin above the CI runner.
// Remote-tracking cards sit on the right of each clone's rail and origin's branch cards on the
// left of its rail, so tracking links cross the middle gutter.
const W = 660;
const H = 496;
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const REGION: Record<CastId, Box> = {
  you: { x: 6, y: 6, w: 304, h: 236 },
  sam: { x: 6, y: 254, w: 304, h: 236 },
  origin: { x: 350, y: 6, w: 304, h: 276 },
  ci: { x: 350, y: 294, w: 304, h: 196 },
};

/** Lanes in the middle gutter for Sam's links, which climb to origin's rail. */
const GUTTER_LANE: Record<string, number> = {
  'link.sam.origin/main': 322,
  'link.sam.origin/rate-limit': 334,
};

// Commit grid: 4 cols x 3 rows.
const NODE_X0 = 36;
const NODE_DX = 74;
const NODE_Y0 = 53;
const NODE_DY = 34;
const NODE_W = 44;
const NODE_H = 22;

// Ref rail: two columns of cards under the grid.
const RAIL_TOP = 154;
const RAIL_ROW = 40;
const CARD_H = 34;
const RAIL_COL_X = [8, 134];
const RAIL_COL_W = [118, 162];

/** Rail slot to (col, row). Origin keeps rate-limit lowest so Sam's link to it stays short. */
const CLONE_RAIL: Cell[] = [
  { col: 0, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 0 },
  { col: 1, row: 1 },
];
const ORIGIN_RAIL: Cell[] = [
  { col: 0, row: 0 },
  { col: 0, row: 2 },
  { col: 0, row: 1 },
];

const COLORS = {
  parent: '#64748b', // slate-500
  link: '#0ea5e9', // sky-500
  stale: '#e11d48', // rose-600 (warning)
  crossing: '#0284c7', // sky-600
  focus: '#f59e0b', // amber-500
};

type MarkerColor = keyof typeof COLORS;

interface Point {
  x: number;
  y: number;
}

const REGION_STYLE: Record<CastId, { fill: string; stroke: string; accent: string }> = {
  you: { fill: '#fff7ed', stroke: '#fdba74', accent: '#ea580c' }, // orange
  sam: { fill: '#fdf2f8', stroke: '#f9a8d4', accent: '#db2777' }, // pink
  origin: { fill: '#f8fafc', stroke: '#94a3b8', accent: '#475569' }, // slate
  ci: { fill: '#ecfdf5', stroke: '#6ee7b7', accent: '#059669' }, // emerald
};

/** The one layout function for commits: region + cell, identical for every beat. */
const nodeCenter = (region: GraphRegionId, cell: Cell): Point => ({
  x: REGION[region].x + NODE_X0 + cell.col * NODE_DX,
  y: REGION[region].y + NODE_Y0 + cell.row * NODE_DY,
});

const railBox = (region: GraphRegionId, slot: number): Box => {
  const cell = region === 'origin' ? ORIGIN_RAIL[slot] : CLONE_RAIL[slot];
  const r = REGION[region];
  return {
    x: r.x + RAIL_COL_X[cell.col],
    y: r.y + RAIL_TOP + cell.row * RAIL_ROW,
    w: RAIL_COL_W[cell.col],
    h: CARD_H,
  };
};

/** The PR card spans origin's right rail column, all three rows. */
const PR_BOX: Box = {
  x: REGION.origin.x + RAIL_COL_X[1],
  y: REGION.origin.y + RAIL_TOP,
  w: RAIL_COL_W[1],
  h: 2 * RAIL_ROW + CARD_H,
};

const CI_CARD = (slot: number): Box => ({
  x: REGION.ci.x + 8,
  y: REGION.ci.y + 44 + slot * 68,
  w: REGION.ci.w - 16,
  h: 60,
});

/** Where a segment from `c` towards `to` leaves the commit block's rim. */
function blockEdge(c: Point, to: Point, pad = 0): Point {
  const dx = to.x - c.x;
  const dy = to.y - c.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const hw = NODE_W / 2 + pad;
  const hh = NODE_H / 2 + pad;
  const t = Math.min(ux ? hw / Math.abs(ux) : Infinity, uy ? hh / Math.abs(uy) : Infinity);
  return { x: c.x + ux * t, y: c.y + uy * t };
}

interface ParentArrow {
  id: string;
  d: string;
  faded: boolean;
}

function parentArrows(beat: ScenarioBeat): ParentArrow[] {
  const arrows: ParentArrow[] = [];
  for (const r of GRAPH_REGIONS) {
    const commits = beat.regions[r].commits;
    for (const child of commits) {
      for (const sha of child.parents) {
        const parent = commits.find((c) => c.sha === sha);
        if (!parent) continue;
        const a = nodeCenter(r, child.cell);
        const b = nodeCenter(r, parent.cell);
        const s = blockEdge(a, b);
        const e = blockEdge(b, a, 3);
        arrows.push({
          id: `${child.id}>${sha}`,
          d: `M ${s.x} ${s.y} L ${e.x} ${e.y}`,
          faded: child.state !== 'live',
        });
      }
    }
  }
  return arrows;
}

/** Tracking link: clone card's right edge, across the gutter, into origin's card. */
function linkPath(beat: ScenarioBeat, link: TrackingLink): { d: string; end: Point } | null {
  const local = beat.regions[link.local.split('.')[0] as GraphRegionId].refs.find(
    (r) => r.id === link.local
  );
  if (!local) return null;
  const from = railBox(local.region, local.slot);
  const remoteName = link.remote.slice('origin.'.length);
  const remoteSlot: Record<string, number> = { main: 0, 'rate-limit': 1, 'feature/search': 2 };
  const to = railBox('origin', remoteSlot[remoteName]);
  const sx = from.x + from.w;
  const sy = from.y + from.h / 2;
  const ex = to.x - 3;
  if (local.region === 'you') {
    const ey = to.y + to.h / 2 - 5;
    return { d: `M ${sx} ${sy - 5} L ${ex} ${ey}`, end: { x: ex, y: ey } };
  }
  const lane = GUTTER_LANE[link.id] ?? 328;
  const ey = to.y + to.h / 2 + 8;
  const r = 6;
  return {
    d: [
      `M ${sx} ${sy}`,
      `H ${lane - r}`,
      `Q ${lane} ${sy} ${lane} ${sy - r}`,
      `V ${ey + r}`,
      `Q ${lane} ${ey} ${lane + r} ${ey}`,
      `H ${ex}`,
    ].join(' '),
    end: { x: ex, y: ey },
  };
}

const STATE_TAG: Record<Commit['state'], string | null> = {
  live: null,
  'reflog-only': 'reflog only',
  unreachable: 'unreachable',
};

const castName = (id: CastId) => SCENARIO.cast.find((m) => m.id === id)!;

const RegionFrame: React.FC<{ id: CastId; acting: boolean }> = ({ id, acting }) => {
  const b = REGION[id];
  const s = REGION_STYLE[id];
  const member = castName(id);
  return (
    <g data-region={id}>
      <rect
        className="sf-shape"
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        rx={12}
        fill={s.fill}
        stroke={acting ? s.accent : s.stroke}
        strokeWidth={acting ? 2.5 : 1.2}
      />
      <g data-viz-label data-region-tag={id}>
        <text x={b.x + 10} y={b.y + 18} fontSize={13} fontWeight={700} fill={s.accent}>
          {member.name}
          <tspan dx={6} fontSize={11} fontWeight={400} fill="#64748b">
            {member.role}
          </tspan>
        </text>
        <text x={b.x + 10} y={b.y + 33} fontSize={11} fill="#64748b">
          {member.copy}
        </text>
        {acting && (
          <g>
            <rect x={b.x + b.w - 58} y={b.y + 7} width={50} height={16} rx={8} fill={s.accent} />
            <text
              x={b.x + b.w - 33}
              y={b.y + 19}
              fontSize={11}
              fontWeight={700}
              textAnchor="middle"
              fill="#ffffff"
            >
              acting
            </text>
          </g>
        )}
      </g>
    </g>
  );
};

const Pill: React.FC<{ x: number; y: number; text: string; fill: string; color: string }> = ({
  x,
  y,
  text,
  fill,
  color,
}) => {
  const w = text.length * 6.6 + 10;
  return (
    <g>
      <rect x={x - w} y={y - 11} width={w} height={15} rx={7.5} fill={fill} />
      <text x={x - w / 2} y={y} fontSize={11} fontWeight={700} textAnchor="middle" fill={color}>
        {text}
      </text>
    </g>
  );
};

const RefCardView: React.FC<{ beat: ScenarioBeat; card: RefCard }> = ({ beat, card }) => {
  const b = railBox(card.region, card.slot);
  const focused = isFocused(beat, card.id);
  const remote = card.kind === 'remote-tracking';
  const deleted = card.state === 'deleted';
  const head = hasHeadBadge(beat, card.id);
  const stale = remote && isStale(beat, card.id);
  return (
    <g
      data-viz-label
      data-ref={card.id}
      data-state={card.state}
      className="sf-fadeable"
      opacity={deleted ? 0.6 : 1}
    >
      <g className="sf-enter">
        <title>
          {`${card.name} (${remote ? 'remote-tracking ref' : 'branch'}) names ${card.target}${
            deleted ? ', deleted' : ''
          }`}
        </title>
        <rect
          className="sf-shape"
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx={6}
          fill={remote ? '#f0f9ff' : '#ffffff'}
          stroke={focused ? COLORS.focus : remote ? '#38bdf8' : '#fb923c'}
          strokeWidth={focused ? 3 : 1.4}
          strokeDasharray={deleted ? '4 3' : undefined}
        />
        <text
          x={b.x + 8}
          y={b.y + 13}
          fontSize={12}
          fontWeight={700}
          fill={deleted ? '#64748b' : '#0f172a'}
          textDecoration={deleted ? 'line-through' : undefined}
        >
          {card.name}
        </text>
        <text
          x={b.x + 8}
          y={b.y + 29}
          fontSize={11}
          fontWeight={700}
          fontFamily={MONO}
          fill={remote ? '#0369a1' : '#c2410c'}
        >
          {`→ ${card.target}`}
        </text>
        {head && <Pill x={b.x + b.w - 6} y={b.y + 29} text="HEAD" fill="#fce7f3" color="#be185d" />}
        {stale && (
          <Pill x={b.x + b.w - 6} y={b.y + 29} text="stale" fill="#ffe4e6" color="#be123c" />
        )}
        {deleted && (
          <Pill x={b.x + b.w - 6} y={b.y + 29} text="deleted" fill="#ffe4e6" color="#be123c" />
        )}
      </g>
    </g>
  );
};

const PRCardView: React.FC<{ beat: ScenarioBeat }> = ({ beat }) => {
  const pr = beat.regions.origin.pr;
  if (!pr) return null;
  const b = PR_BOX;
  const focused = isFocused(beat, pr.id);
  const targets = getPullRequestTargets(beat);
  const check = getPullRequestCheck(beat);
  const merged = pr.state === 'merged';
  const checkColor = check === 'passed' ? '#059669' : check === 'pending' ? '#d97706' : '#94a3b8';
  return (
    <g data-viz-label data-pr={pr.id} data-state={pr.state}>
      <g className="sf-enter">
        <rect
          className="sf-shape"
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx={8}
          fill="#ffffff"
          stroke={focused ? COLORS.focus : merged ? '#7c3aed' : '#16a34a'}
          strokeWidth={focused ? 3 : 1.6}
        />
        <text x={b.x + 10} y={b.y + 19} fontSize={13} fontWeight={700} fill="#0f172a">
          {`PR #${pr.number}`}
        </text>
        <Pill
          x={b.x + b.w - 8}
          y={b.y + 18}
          text={pr.state}
          fill={merged ? '#ede9fe' : '#dcfce7'}
          color={merged ? '#6d28d9' : '#15803d'}
        />
        <text x={b.x + 10} y={b.y + 38} fontSize={11} fontFamily={MONO} fill="#334155">
          {`${pr.head} → ${pr.base}`}
        </text>
        <text x={b.x + 10} y={b.y + 58} fontSize={11} fill="#64748b">
          head
          <tspan dx={6} fontFamily={MONO} fontWeight={700} fill="#c2410c">
            {targets?.head ?? '—'}
          </tspan>
          <tspan dx={12}>base</tspan>
          <tspan dx={6} fontFamily={MONO} fontWeight={700} fill="#c2410c">
            {targets?.base ?? '—'}
          </tspan>
        </text>
        <circle cx={b.x + 15} cy={b.y + 80} r={4.5} fill={checkColor} />
        <text x={b.x + 26} y={b.y + 84} fontSize={11} fontWeight={700} fill={checkColor}>
          {check === 'none' ? 'no check yet' : `check ${check}`}
        </text>
        <text x={b.x + 10} y={b.y + 104} fontSize={11} fill="#64748b">
          {merged ? 'merge commit on main' : 'needs review + check'}
        </text>
      </g>
    </g>
  );
};

const CIRegionView: React.FC<{ beat: ScenarioBeat }> = ({ beat }) => {
  const { job, checkout } = beat.ci;
  const jb = CI_CARD(job.slot);
  const cb = CI_CARD(checkout.slot);
  const jobFocused = isFocused(beat, job.id);
  const coFocused = isFocused(beat, checkout.id);
  const pill =
    job.state === 'passed'
      ? { fill: '#d1fae5', color: '#047857' }
      : job.state === 'running'
        ? { fill: '#fef3c7', color: '#b45309' }
        : { fill: '#f1f5f9', color: '#64748b' };
  const detail =
    job.state === 'idle'
      ? 'waits for a pull request'
      : job.state === 'running'
        ? 'running the tests on the merge result'
        : 'tests passed on the merge result';
  return (
    <>
      <g data-viz-label data-ci={job.id} data-state={job.state}>
        <rect
          className="sf-shape"
          x={jb.x}
          y={jb.y}
          width={jb.w}
          height={jb.h}
          rx={8}
          fill="#ffffff"
          stroke={jobFocused ? COLORS.focus : '#34d399'}
          strokeWidth={jobFocused ? 3 : 1.4}
        />
        <text x={jb.x + 10} y={jb.y + 21} fontSize={12} fontWeight={700} fill="#0f172a">
          job
          <tspan dx={6} fontFamily={MONO} fontWeight={400} fill="#475569">
            test
          </tspan>
        </text>
        <g className={job.state === 'running' ? 'sf-pulse' : undefined}>
          <Pill x={jb.x + jb.w - 8} y={jb.y + 20} text={job.state} {...pill} />
        </g>
        <text x={jb.x + 10} y={jb.y + 45} fontSize={11} fill="#64748b">
          {detail}
        </text>
      </g>
      <g data-viz-label data-ci={checkout.id}>
        <rect
          className="sf-shape"
          x={cb.x}
          y={cb.y}
          width={cb.w}
          height={cb.h}
          rx={8}
          fill="#ffffff"
          stroke={coFocused ? COLORS.focus : '#34d399'}
          strokeWidth={coFocused ? 3 : 1.4}
        />
        <text x={cb.x + 10} y={cb.y + 21} fontSize={12} fontWeight={700} fill="#0f172a">
          checkout
        </text>
        <text
          x={cb.x + 10}
          y={cb.y + 45}
          fontSize={11}
          fontFamily={MONO}
          fontWeight={checkout.ref ? 700 : 400}
          fill={checkout.ref ? '#047857' : '#94a3b8'}
        >
          {checkout.ref ?? 'nothing checked out'}
        </text>
      </g>
    </>
  );
};

const ShipAFeature2D: React.FC<ShipAFeature2DProps> = ({ beat }) => {
  const arrows = parentArrows(beat);
  const showLinks = beat.shot === 'overview' || beat.shot === 'bridge';
  const links = showLinks ? getTrackingLinks(beat) : [];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      role="img"
      aria-label={`Shipping a feature: ${beat.title}`}
    >
      <style>{`
        .sf-enter { animation: sf-fade 450ms ease-out both; }
        .sf-shape { transition: fill 400ms, stroke 400ms, stroke-width 300ms; }
        .sf-fadeable { transition: opacity 500ms; }
        .sf-arrow { transition: stroke 300ms, opacity 400ms; }
        .sf-ghost { animation: sf-cross 2400ms ease-in-out infinite; }
        .sf-pulse { animation: sf-pulse 1200ms ease-in-out infinite; }
        @keyframes sf-fade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        @keyframes sf-cross {
          0% { transform: translate(0px, 0px); opacity: 0; }
          10% { opacity: 0.95; }
          70% { transform: translate(var(--sf-dx), var(--sf-dy)); opacity: 0.95; }
          100% { transform: translate(var(--sf-dx), var(--sf-dy)); opacity: 0; }
        }
        @keyframes sf-pulse { 50% { opacity: 0.45; } }
        @media (prefers-reduced-motion: reduce) {
          .sf-enter, .sf-pulse { animation: none; }
          .sf-ghost { animation: none; opacity: 0; }
          .sf-shape, .sf-fadeable, .sf-arrow { transition: none; }
        }
      `}</style>
      <defs>
        {(Object.keys(COLORS) as MarkerColor[]).map((k) => (
          <marker
            key={k}
            id={`sf-arrow-${k}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS[k]} />
          </marker>
        ))}
      </defs>

      {/* Regions: one copy of the system per cast member */}
      {(['you', 'sam', 'origin', 'ci'] as const).map((id) => (
        <RegionFrame key={id} id={id} acting={beat.actor === id} />
      ))}

      {/* Crossing tracks, under the commits: an object copied between regions this beat */}
      {beat.crossings.map((c) => {
        const cell = beat.regions[c.to].commits.find((x) => x.sha === c.sha)?.cell;
        if (!cell) return null;
        const s = nodeCenter(c.from, cell);
        const e = nodeCenter(c.to, cell);
        const end = blockEdge(e, s, 3);
        return (
          <path
            key={c.id}
            data-crossing={c.id}
            d={`M ${s.x} ${s.y} L ${end.x} ${end.y}`}
            fill="none"
            stroke={COLORS.crossing}
            strokeWidth={2}
            strokeDasharray="6 4"
            opacity={0.8}
            markerEnd="url(#sf-arrow-crossing)"
          />
        );
      })}

      {/* Parent arrows: child to parent */}
      {arrows.map((a) => (
        <path
          key={a.id}
          className="sf-arrow"
          d={a.d}
          fill="none"
          stroke={COLORS.parent}
          strokeWidth={1.5}
          strokeDasharray={a.faded ? '4 3' : undefined}
          opacity={a.faded ? 0.55 : 1}
          markerEnd="url(#sf-arrow-parent)"
        />
      ))}

      {/* Tracking links: a clone's record of origin's branch, broken when stale */}
      {links.map((l) => {
        const p = linkPath(beat, l);
        if (!p) return null;
        const color = l.stale ? 'stale' : 'link';
        return (
          <g key={l.id} data-link={l.id} data-stale={String(l.stale)}>
            <title>
              {l.stale
                ? `${l.local} is stale: it names ${l.localTarget}, origin has ${l.remoteTarget ?? 'no such branch'}`
                : `${l.local} matches origin (${l.localTarget})`}
            </title>
            <path
              className="sf-arrow"
              d={p.d}
              fill="none"
              stroke={COLORS[color]}
              strokeWidth={l.stale ? 2 : 1.8}
              pathLength={100}
              strokeDasharray={l.stale ? '40 20 40' : undefined}
              markerEnd={l.remoteTarget ? `url(#sf-arrow-${color})` : undefined}
            />
            {!l.remoteTarget && (
              <path
                d={`M ${p.end.x - 4} ${p.end.y - 4} l 8 8 m 0 -8 l -8 8`}
                stroke={COLORS.stale}
                strokeWidth={2}
              />
            )}
          </g>
        );
      })}

      {/* Commits */}
      {GRAPH_REGIONS.flatMap((r) =>
        beat.regions[r].commits.map((c) => {
          const p = nodeCenter(r, c.cell);
          const focused = isFocused(beat, c.id);
          const tag = STATE_TAG[c.state];
          const live = c.state === 'live';
          const unreachable = c.state === 'unreachable';
          return (
            <g
              key={c.id}
              data-viz-label
              data-commit={c.id}
              data-state={c.state}
              className="sf-fadeable"
              opacity={live ? 1 : unreachable ? 0.55 : 0.75}
            >
              <g className="sf-enter">
                <title>{`${c.sha} ${c.message}`}</title>
                {focused && (
                  <rect
                    x={p.x - NODE_W / 2 - 5}
                    y={p.y - NODE_H / 2 - 5}
                    width={NODE_W + 10}
                    height={NODE_H + 10}
                    rx={9}
                    fill={COLORS.focus}
                    opacity={0.22}
                  />
                )}
                <rect
                  className="sf-shape"
                  x={p.x - NODE_W / 2}
                  y={p.y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={5}
                  fill={live ? '#ffedd5' : unreachable ? '#ffffff' : '#e2e8f0'}
                  stroke={
                    focused ? COLORS.focus : live ? '#f97316' : unreachable ? '#fb7185' : '#94a3b8'
                  }
                  strokeWidth={focused ? 3 : 1.8}
                  strokeDasharray={unreachable ? '4 3' : undefined}
                />
                <text
                  x={p.x}
                  y={p.y + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fontFamily={MONO}
                  fill={live ? '#7c2d12' : '#475569'}
                >
                  {c.sha}
                </text>
                {tag && (
                  <text
                    x={p.x}
                    y={p.y + NODE_H / 2 + 13}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={700}
                    fill={unreachable ? '#e11d48' : '#64748b'}
                  >
                    {tag}
                  </text>
                )}
              </g>
            </g>
          );
        })
      )}

      {/* Ref rails */}
      {GRAPH_REGIONS.flatMap((r) =>
        beat.regions[r].refs.map((card) => <RefCardView key={card.id} beat={beat} card={card} />)
      )}
      <PRCardView beat={beat} />
      <CIRegionView beat={beat} />

      {/* Crossing ghosts, above everything: the copied commit gliding to its new region */}
      {beat.crossings.map((c) => {
        const cell = beat.regions[c.to].commits.find((x) => x.sha === c.sha)?.cell;
        if (!cell) return null;
        const s = nodeCenter(c.from, cell);
        const e = nodeCenter(c.to, cell);
        const style = {
          '--sf-dx': `${e.x - s.x}px`,
          '--sf-dy': `${e.y - s.y}px`,
        } as React.CSSProperties;
        return (
          <g key={`${beat.id}:${c.id}`} className="sf-ghost" style={style} aria-hidden>
            <rect
              x={s.x - NODE_W / 2}
              y={s.y - NODE_H / 2}
              width={NODE_W}
              height={NODE_H}
              rx={5}
              fill="#e0f2fe"
              stroke={COLORS.crossing}
              strokeWidth={1.8}
              strokeDasharray="4 2"
            />
            <text
              x={s.x}
              y={s.y + 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fontFamily={MONO}
              fill="#075985"
            >
              {c.sha}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default ShipAFeature2D;
