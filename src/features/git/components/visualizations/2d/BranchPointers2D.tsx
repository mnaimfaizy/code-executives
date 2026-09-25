import React from 'react';
import {
  getCommit,
  getReferences,
  headFileText,
  isDetached,
  isFocused,
  isRefFocused,
  type Commit,
  type Ref,
  type StoryStep,
} from '../../../utils/branchPointersStory';

interface BranchPointers2DProps {
  step: StoryStep;
}

const W = 680;
const H = 532;

// Refs region (top): HEAD / main / feature on row 0, HEAD's reflog under HEAD on row 1.
const REFS_TOP = 6;
const REFS_BOTTOM = 300;
const REF_COL_X = [14, 316, 500];
const REF_COL_W = [262, 164, 164];
const REF_ROW_Y = [36, 124];
const CARD_H = 78;
const REFLOG_H = 168;
const REFLOG_LINE = 13.5;
/** Vertical corridor between HEAD's column and main's, used by the detached HEAD arrow. */
const CORRIDOR_X = 296;

// Commit graph region (bottom): 4 x 3 grid of commit nodes.
const GRAPH_TOP = 308;
const GRAPH_BOTTOM = 526;
const NODE_X0 = 70;
const NODE_DX = 170;
const NODE_Y0 = 358;
const NODE_DY = 62;
const R = 18;

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

const COLORS = {
  parent: '#64748b', // slate-500
  branch: '#ef4444', // red-500
  head: '#db2777', // pink-600
  detached: '#e11d48', // rose-600
  focus: '#f59e0b', // amber-500
};

type ArrowColor = keyof typeof COLORS;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Point {
  x: number;
  y: number;
}

/** The one layout function: model cells to SVG coordinates, identical for every step. */
const nodeCenter = (c: Commit): Point => ({
  x: NODE_X0 + c.cell.col * NODE_DX,
  y: NODE_Y0 + c.cell.row * NODE_DY,
});

const refBox = (r: Ref): Box => ({
  x: REF_COL_X[r.cell.col],
  y: REF_ROW_Y[r.cell.row],
  w: REF_COL_W[r.cell.col],
  h: r.kind === 'reflog' ? REFLOG_H : CARD_H,
});

const onCircle = (c: Point, angle: number, radius: number): Point => ({
  x: c.x + radius * Math.cos(angle),
  y: c.y + radius * Math.sin(angle),
});

const DEG = Math.PI / 180;

/** Parent arrow: straight, from the child's rim to the parent's rim (child to parent). */
function parentPath(child: Point, parent: Point): string {
  const dx = parent.x - child.x;
  const dy = parent.y - child.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const s = { x: child.x + ux * R, y: child.y + uy * R };
  const e = { x: parent.x - ux * (R + 3), y: parent.y - uy * (R + 3) };
  return `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
}

/**
 * Branch arrow: from the card's bottom edge into the commit's upper rim. When a commit sits
 * directly above the target, drop down the gap to its right and enter from the side instead.
 */
function branchPath(card: Box, target: Point, blockedAbove: boolean): string {
  const sx = card.x + card.w / 2;
  const sy = card.y + card.h;
  if (blockedAbove) {
    const dropX = target.x + NODE_DX / 2;
    return [
      `M ${sx} ${sy}`,
      `C ${sx} ${sy + 50}, ${dropX} ${sy + 40}, ${dropX} ${sy + 90}`,
      `V ${target.y - 24}`,
      `Q ${dropX} ${target.y} ${target.x + R + 3} ${target.y}`,
    ].join(' ');
  }
  const raw = Math.atan2(sy - target.y, sx - target.x);
  const angle = Math.min(-20 * DEG, Math.max(-160 * DEG, raw));
  const end = onCircle(target, angle, R + 3);
  const c2 = onCircle(target, angle, R + 60);
  return `M ${sx} ${sy} C ${sx} ${sy + 90}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
}

/** Symbolic HEAD: straight to the adjacent card, or an arc over the cards in between. */
function headToCardPath(head: Box, card: Box): string {
  const y = head.y + head.h / 2;
  if (card.x - (head.x + head.w) < 60)
    return `M ${head.x + head.w} ${y} L ${card.x - 3} ${card.y + card.h / 2}`;
  const sx = head.x + head.w - 40;
  const tx = card.x + 50;
  return `M ${sx} ${head.y} C ${sx + 20} ${REFS_TOP + 2}, ${tx - 20} ${REFS_TOP + 2}, ${tx} ${card.y - 3}`;
}

/** Detached HEAD: down the corridor beside the reflog, then straight into the commit from above. */
function headToCommitPath(head: Box, target: Point): string {
  const hy = head.y + head.h / 2;
  const turnY = target.y - R - 26;
  const dir = target.x >= CORRIDOR_X ? 1 : -1;
  const r = 12;
  return [
    `M ${head.x + head.w} ${hy}`,
    `H ${CORRIDOR_X - r}`,
    `Q ${CORRIDOR_X} ${hy} ${CORRIDOR_X} ${hy + r}`,
    `V ${turnY - r}`,
    `Q ${CORRIDOR_X} ${turnY} ${CORRIDOR_X + dir * r} ${turnY}`,
    `H ${target.x - dir * r}`,
    `Q ${target.x} ${turnY} ${target.x} ${turnY + r}`,
    `V ${target.y - R - 3}`,
  ].join(' ');
}

interface Arrow {
  id: string;
  d: string;
  color: ArrowColor;
  width: number;
  faded: boolean;
}

function buildArrows(step: StoryStep): Arrow[] {
  const arrows: Arrow[] = [];
  const cards = new Map(step.refs.map((r) => [r.id as string, refBox(r)]));
  const liveAt = (col: number, row: number) =>
    step.commits.some((c) => c.state !== 'collected' && c.cell.col === col && c.cell.row < row);

  for (const ref of getReferences(step)) {
    const focused = isRefFocused(step, ref);
    const arrow = (d: string, color: ArrowColor, width: number, faded = false) =>
      arrows.push({
        id: ref.id,
        d,
        color: focused ? 'focus' : color,
        width: focused ? 3 : width,
        faded,
      });

    if (ref.kind === 'parent') {
      const child = getCommit(step, ref.fromOwner);
      const parent = getCommit(step, ref.to);
      if (!child || !parent) continue;
      arrow(
        parentPath(nodeCenter(child), nodeCenter(parent)),
        'parent',
        1.6,
        child.state !== 'live'
      );
    } else if (ref.fromOwner === 'HEAD') {
      const head = cards.get('HEAD')!;
      if (ref.toKind === 'ref') {
        arrow(headToCardPath(head, cards.get(ref.to)!), 'head', 2);
      } else {
        const target = getCommit(step, ref.to);
        if (target) arrow(headToCommitPath(head, nodeCenter(target)), 'detached', 2.6);
      }
    } else {
      const card = cards.get(ref.fromOwner);
      const target = getCommit(step, ref.to);
      if (!card || !target) continue;
      arrow(
        branchPath(card, nodeCenter(target), liveAt(target.cell.col, target.cell.row)),
        'branch',
        2
      );
    }
  }
  return arrows;
}

/** Keeps reflog actions inside the card: `checkout: moving from a to b` reads `checkout: a → b`. */
function shortAction(action: string): string {
  const moved = action.match(/^checkout: moving from (\S+) to (\S+)$/);
  if (moved) return `checkout: ${moved[1]} → ${moved[2]}`;
  if (action.length <= 24) return action;
  return action.split(':')[0];
}

const STATE_TAG: Record<Commit['state'], string | null> = {
  live: null,
  'reflog-only': 'reflog only',
  unreachable: 'unreachable',
  collected: null,
};

const BranchPointers2D: React.FC<BranchPointers2DProps> = ({ step }) => {
  const arrows = buildArrows(step);
  const detached = isDetached(step);
  const reflogFocused = isFocused(step, 'head-reflog');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      role="img"
      aria-label={`Branch pointers: ${step.title}`}
    >
      <style>{`
        .bp-enter { animation: bp-fade 450ms ease-out both; }
        .bp-shape { transition: fill 400ms, stroke 400ms, stroke-width 300ms; }
        .bp-fadeable { transition: opacity 600ms; }
        .bp-arrow { transition: stroke 300ms, stroke-width 300ms, opacity 400ms, d 450ms ease-in-out; }
        .bp-row { transition: transform 400ms ease-out; }
        @keyframes bp-fade { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .bp-enter { animation: none; }
          .bp-shape, .bp-fadeable, .bp-arrow, .bp-row { transition: none; }
        }
      `}</style>
      <defs>
        {(Object.keys(COLORS) as ArrowColor[]).map((k) => (
          <marker
            key={k}
            id={`bp-arrow-${k}`}
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

      {/* Regions */}
      <rect
        x={6}
        y={REFS_TOP}
        width={W - 12}
        height={REFS_BOTTOM - REFS_TOP}
        rx={14}
        fill="#fff7ed"
        stroke="#fed7aa"
      />
      <text
        x={20}
        y={24}
        fontSize={12}
        fontWeight={700}
        letterSpacing={1.5}
        className="fill-orange-700"
      >
        REFS
        <tspan fontWeight={400} letterSpacing={0} fontFamily={MONO} className="fill-orange-500">
          {'  .git/'}
        </tspan>
      </text>
      <rect
        x={6}
        y={GRAPH_TOP}
        width={W - 12}
        height={GRAPH_BOTTOM - GRAPH_TOP}
        rx={14}
        fill="#f8fafc"
        stroke="#cbd5e1"
      />
      <text
        x={20}
        y={GRAPH_TOP + 18}
        fontSize={12}
        fontWeight={700}
        letterSpacing={1.5}
        className="fill-slate-500"
      >
        COMMIT GRAPH
      </text>
      {step.phase && (
        <text
          x={W - 20}
          y={GRAPH_TOP + 18}
          fontSize={11}
          fontWeight={700}
          textAnchor="end"
          fontFamily={MONO}
          className="fill-rose-600"
        >
          {step.phase === 'expire' ? 'reflog expire' : 'gc --prune'}
        </text>
      )}

      {/* Arrows, drawn under nodes and cards */}
      {arrows.map((a) => (
        <path
          key={a.id}
          data-arrow={a.id}
          className="bp-arrow"
          d={a.d}
          fill="none"
          stroke={COLORS[a.color]}
          strokeWidth={a.width}
          strokeDasharray={a.faded ? '5 4' : undefined}
          opacity={a.faded ? 0.55 : 1}
          markerEnd={`url(#bp-arrow-${a.color})`}
        />
      ))}

      {/* Commits */}
      {step.commits.map((c) => {
        const p = nodeCenter(c);
        const focused = isFocused(step, c.id);
        const tag = STATE_TAG[c.state];
        const live = c.state === 'live';
        const unreachable = c.state === 'unreachable';
        const opacity =
          c.state === 'collected' ? 0 : c.state === 'live' ? 1 : unreachable ? 0.5 : 0.7;
        return (
          <g
            key={c.id}
            data-viz-label
            data-commit={c.id}
            data-state={c.state}
            className="bp-fadeable"
            opacity={opacity}
          >
            <g className="bp-enter">
              {focused && <circle cx={p.x} cy={p.y} r={R + 7} fill={COLORS.focus} opacity={0.22} />}
              <circle
                className="bp-shape"
                cx={p.x}
                cy={p.y}
                r={R}
                fill={live ? '#ffedd5' : unreachable ? '#ffffff' : '#e2e8f0'}
                stroke={
                  focused ? COLORS.focus : live ? '#f97316' : unreachable ? '#fb7185' : '#94a3b8'
                }
                strokeWidth={focused ? 3 : 2}
                strokeDasharray={unreachable ? '4 3' : undefined}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fontFamily={MONO}
                className={live ? 'fill-orange-900' : 'fill-slate-600'}
              >
                {c.id}
              </text>
              <text
                x={p.x}
                y={p.y + R + 15}
                textAnchor="middle"
                fontSize={12}
                className={live ? 'fill-slate-700' : 'fill-slate-500'}
              >
                {c.message}
              </text>
              {tag && (
                <text
                  x={p.x + R + 8}
                  y={p.y + 4}
                  fontSize={11}
                  fontWeight={700}
                  className={unreachable ? 'fill-rose-600' : 'fill-slate-500'}
                >
                  {tag}
                </text>
              )}
            </g>
          </g>
        );
      })}

      {/* Ref cards */}
      {step.refs.map((r) => {
        const b = refBox(r);
        const focused = isFocused(step, r.id);
        if (r.kind === 'reflog') {
          const count = r.entries.length;
          return (
            <g key={r.id} data-viz-label data-ref={r.id}>
              <rect
                className="bp-shape"
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx={8}
                fill="#ffffff"
                stroke={focused ? COLORS.focus : '#cbd5e1'}
                strokeWidth={focused ? 3 : 1.5}
              />
              <text
                x={b.x + 10}
                y={b.y + 19}
                fontSize={13}
                fontWeight={700}
                className="fill-slate-800"
              >
                HEAD reflog
              </text>
              <text
                x={b.x + b.w - 10}
                y={b.y + 19}
                fontSize={11}
                textAnchor="end"
                fontFamily={MONO}
                className="fill-slate-400"
              >
                .git/{r.path}
              </text>
              {r.entries.map((e, i) => {
                const hot = reflogFocused && isFocused(step, e.commit);
                const y = b.y + 30 + i * REFLOG_LINE;
                return (
                  <g
                    key={`${e.commit}:${e.action}`}
                    className="bp-row"
                    style={{ transform: `translate(0px, ${y}px)` }}
                  >
                    <g className="bp-enter">
                      <title>{`HEAD@{${i}} ${e.commit} ${e.action}`}</title>
                      {hot && (
                        <rect
                          x={b.x + 4}
                          y={0}
                          width={b.w - 8}
                          height={REFLOG_LINE}
                          rx={3}
                          fill="#fef3c7"
                        />
                      )}
                      <text
                        x={b.x + 10}
                        y={10.5}
                        fontSize={11}
                        fontFamily={MONO}
                        className="fill-slate-400"
                      >
                        {`HEAD@{${i}}`}
                      </text>
                      <text
                        x={b.x + 66}
                        y={10.5}
                        fontSize={11}
                        fontWeight={700}
                        fontFamily={MONO}
                        className={hot ? 'fill-amber-700' : 'fill-orange-700'}
                      >
                        {e.commit}
                      </text>
                      <text
                        x={b.x + 100}
                        y={10.5}
                        fontSize={11}
                        fontFamily={MONO}
                        className="fill-slate-600"
                      >
                        {shortAction(e.action)}
                      </text>
                    </g>
                  </g>
                );
              })}
              {count === 0 && (
                <text x={b.x + 10} y={b.y + 42} fontSize={11} className="fill-slate-400">
                  (empty)
                </text>
              )}
            </g>
          );
        }

        const isHead = r.kind === 'head';
        const stroke = focused
          ? COLORS.focus
          : isHead
            ? detached
              ? COLORS.detached
              : COLORS.head
            : '#fb923c';
        return (
          <g key={r.id} data-viz-label data-ref={r.id}>
            <g className="bp-enter">
              <rect
                className="bp-shape"
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx={8}
                fill={isHead ? (detached ? '#ffe4e6' : '#fdf2f8') : '#ffffff'}
                stroke={stroke}
                strokeWidth={focused ? 3 : 1.5}
              />
              <text
                x={b.x + 10}
                y={b.y + 20}
                fontSize={14}
                fontWeight={700}
                className="fill-slate-900"
              >
                {r.id}
              </text>
              <text
                x={b.x + b.w - 10}
                y={b.y + 20}
                fontSize={11}
                fontWeight={700}
                textAnchor="end"
                letterSpacing={0.5}
                className={
                  isHead ? (detached ? 'fill-rose-600' : 'fill-pink-600') : 'fill-orange-500'
                }
              >
                {isHead ? (detached ? 'DETACHED' : 'symbolic ref') : 'branch'}
              </text>
              {/* The file's path, then its literal contents */}
              <text
                x={b.x + 10}
                y={b.y + 37}
                fontSize={11}
                fontFamily={MONO}
                className="fill-slate-500"
              >
                .git/{r.path}
              </text>
              <rect x={b.x + 6} y={b.y + 46} width={b.w - 12} height={24} rx={4} fill="#f1f5f9" />
              <text
                x={b.x + 12}
                y={b.y + 63}
                fontSize={13}
                fontWeight={700}
                fontFamily={MONO}
                className={
                  isHead ? (detached ? 'fill-rose-700' : 'fill-pink-800') : 'fill-orange-700'
                }
              >
                {r.kind === 'head' ? headFileText(step) : r.kind === 'branch' ? r.target : ''}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
};

export default BranchPointers2D;
