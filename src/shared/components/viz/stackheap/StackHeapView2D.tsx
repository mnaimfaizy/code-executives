import React from 'react';
import {
  getReachable,
  getReferences,
  gridOf,
  type HeapGrid,
  slotKey,
  type HeapObject,
  type Placed,
  type Reference,
  type Slot,
  type StackFrame,
} from '../../../snapshot';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { vizPalette, type EntityColors } from '../../../viz/palette';
import type { PlacedSnapshot, StackHeapViewProps } from './types';

/*
 * Geometry. A 2×2 heap with a short stack is the 800×480 drawing of the Stack ↔ Heap story;
 * more columns widen the viewBox, more rows, taller objects or more frames make it taller.
 */
const STACK_X = 24;
const STACK_W = 230;
const FRAME_HEADER = 30;
const ROW_H = 22;
const FRAME_GAP = 8;

const HEAP_X = 310;
const CELL_X0 = 340;
const CELL_DX = 230;
const CELL_Y0 = 78;
/** The least a heap row takes; a row holding a taller object grows to fit it. */
const CELL_DY = 190;
/** Clear space kept under the tallest object of a row. */
const ROW_CLEARANCE = 40;
const OBJ_W = 180;

/** Space under the lowest frame, and above the highest one (it clears the region caption). */
const STACK_PAD_BOTTOM = 28;
const STACK_PAD_TOP = 52;
/** What the heap needs around its rows: 78 above the first, 22 under the last. */
const HEAP_PAD_Y = 100;

/** Monospace 12px runs about 7.2px a character: what fits a frame and an object. */
const FRAME_LINE_CHARS = 25;
const OBJECT_LINE_CHARS = 21;
const FRAME_NAME_CHARS = 18;

const MONO = 'ui-monospace, monospace';

type PlacedObject = Placed<HeapObject>;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Layout {
  width: number;
  height: number;
  frames: Map<string, Box>;
  objects: Map<string, Box>;
}

const boxHeight = (slots: readonly Slot[]) => FRAME_HEADER + Math.max(1, slots.length) * ROW_H + 8;

const slotY = (box: Box, index: number) => box.y + FRAME_HEADER + index * ROW_H + ROW_H / 2 + 2;

const clip = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, Math.max(1, max - 1))}…` : text;

/** The one place positions are decided, so an entity keeps its place from snapshot to snapshot. */
function layout(snapshot: PlacedSnapshot, minGrid?: HeapGrid): Layout {
  const grid = gridOf(snapshot.objects, minGrid);

  const rowPitch = Array.from({ length: grid.rows }, () => CELL_DY);
  for (const o of snapshot.objects) {
    rowPitch[o.cell.row] = Math.max(rowPitch[o.cell.row], boxHeight(o.slots) + ROW_CLEARANCE);
  }
  const rowY: number[] = [];
  let nextRowY = CELL_Y0;
  for (const pitch of rowPitch) {
    rowY.push(nextRowY);
    nextRowY += pitch;
  }

  const stackHeight = snapshot.frames.reduce((sum, f) => sum + boxHeight(f.slots) + FRAME_GAP, 0);
  const width = CELL_X0 + grid.cols * CELL_DX;
  const height = Math.max(
    HEAP_PAD_Y + rowPitch.reduce((sum, pitch) => sum + pitch, 0),
    STACK_PAD_TOP + stackHeight + STACK_PAD_BOTTOM
  );

  const frames = new Map<string, Box>();
  let y = height - STACK_PAD_BOTTOM;
  for (const f of snapshot.frames) {
    const h = boxHeight(f.slots);
    y -= h + FRAME_GAP;
    frames.set(f.id, { x: STACK_X + 12, y, w: STACK_W - 24, h });
  }

  const objects = new Map<string, Box>();
  for (const o of snapshot.objects) {
    objects.set(o.id, {
      x: CELL_X0 + o.cell.col * CELL_DX,
      y: rowY[o.cell.row],
      w: OBJ_W,
      h: boxHeight(o.slots),
    });
  }

  return { width, height, frames, objects };
}

/** The arrow for a reference, or null when its source or its target is not in the drawing. */
function refPath(ref: Reference, snapshot: PlacedSnapshot, at: Layout): string | null {
  const fromFrame = ref.fromKind === 'frame';
  const owner = fromFrame
    ? snapshot.frames.find((f) => f.id === ref.fromOwner)
    : snapshot.objects.find((o) => o.id === ref.fromOwner);
  const ownerBox = fromFrame ? at.frames.get(ref.fromOwner) : at.objects.get(ref.fromOwner);
  if (!owner || !ownerBox) return null;

  const idx = owner.slots.findIndex((s) => slotKey(owner.id, s.name) === ref.from);
  if (idx < 0) return null;
  const sy = slotY(ownerBox, idx);
  const right = ownerBox.x + ownerBox.w;

  const targetObj = snapshot.objects.find((o) => o.id === ref.to);
  const target = targetObj ? at.objects.get(ref.to) : undefined;

  if (!targetObj || !target) {
    // Not a heap object: a frame whose scope is still on the stack, or nothing at all.
    const frame = at.frames.get(ref.to);
    if (!frame) return null;
    const fx = frame.x + frame.w;
    const fy = frame.y + FRAME_HEADER / 2;
    if (fromFrame) {
      // Frame to frame: a bracket in the gutter between the stack and the heap.
      return `M ${right} ${sy} C ${right + 50} ${sy}, ${fx + 50} ${fy}, ${fx} ${fy}`;
    }
    // Heap back to the stack: leave from the left edge.
    const dx = Math.max(40, (ownerBox.x - fx) / 2);
    return `M ${ownerBox.x} ${sy} C ${ownerBox.x - dx} ${sy}, ${fx + dx} ${fy}, ${fx} ${fy}`;
  }

  const ty = target.y + FRAME_HEADER / 2;

  if (!fromFrame) {
    const src = owner as PlacedObject;
    const dCol = targetObj.cell.col - src.cell.col;
    const dRow = targetObj.cell.row - src.cell.row;
    const sx = ownerBox.x + ownerBox.w / 2;
    const tx = target.x + target.w / 2;
    if (src.id === targetObj.id) {
      // An object that points at itself: a loop off its right edge.
      return `M ${right} ${sy} C ${right + 46} ${sy}, ${right + 46} ${ty}, ${right} ${ty}`;
    }
    if (dCol <= 0 && dRow > 0) {
      // Down-left: leave from the bottom, enter from the top.
      const sby = ownerBox.y + ownerBox.h;
      return `M ${sx} ${sby} C ${sx} ${sby + 50}, ${tx} ${target.y - 50}, ${tx} ${target.y}`;
    }
    if (dCol <= 0 && dRow < 0) {
      // Up-left: leave from the top, enter from the bottom.
      const tby = target.y + target.h;
      return `M ${sx} ${ownerBox.y} C ${sx} ${ownerBox.y - 50}, ${tx} ${tby + 50}, ${tx} ${tby}`;
    }
    if (dCol < 0) {
      // Straight left along a row: leave from the left edge, enter the right edge.
      const tRight = target.x + target.w;
      const dx = Math.max(40, (ownerBox.x - tRight) / 2);
      return `M ${ownerBox.x} ${sy} C ${ownerBox.x - dx} ${sy}, ${tRight + dx} ${ty}, ${tRight} ${ty}`;
    }
  }
  const tx = target.x;
  const dx = Math.max(40, (tx - right) / 2);
  return `M ${right} ${sy} C ${right + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
}

/** How each heap kind is outlined; colour alone never carries the difference. */
const KIND_RX: Record<HeapObject['kind'], number> = {
  object: 10,
  array: 4,
  function: 16,
  scope: 8,
};

function slotLine(kind: HeapObject['kind'] | 'frame', s: Slot): string {
  const value = s.refId ? '●→' : s.value;
  if (kind === 'frame' || kind === 'scope') return clip(`${s.name} = ${value}`, FRAME_LINE_CHARS);
  const name = kind === 'array' ? `[${s.name}]` : s.name;
  return clip(`${name}: ${value}`, OBJECT_LINE_CHARS);
}

/** The label shares its line with `#id`, so it gets what the id leaves (13px bold ≈ 7.5px). */
const labelChars = (id: string) => Math.max(6, Math.floor((160 - (id.length + 3) * 6.2) / 7.5));

/**
 * The shared 2D view of a stack-and-heap snapshot. It does not know whether the snapshot is a
 * story beat or a Playground trace step (ADR 0004); every colour comes from the palette.
 */
const StackHeapView2D: React.FC<StackHeapViewProps> = ({
  snapshot,
  focus,
  theme = 'light',
  gcPhase,
  markUnreachable = false,
  grid,
  label,
}) => {
  const reducedMotion = useReducedMotion();
  const P = vizPalette[theme];
  const at = layout(snapshot, grid);
  const refs = getReferences(snapshot);
  const reachable = markUnreachable ? getReachable(snapshot) : null;
  const marking = gcPhase === 'mark';
  const focused = (key: string) => focus.includes(key);

  // Marker ids are document-wide: one pair per theme, so a light and a dark view can coexist.
  const arrowId = theme === 'light' ? 'sh-arrow' : `sh-arrow-${theme}`;
  const arrowFocusId = `${arrowId}-focus`;

  const slotText = (owner: StackFrame | PlacedObject, kind: HeapObject['kind'] | 'frame', b: Box) =>
    owner.slots.map((s, si) => {
      const on = focused(slotKey(owner.id, s.name));
      return (
        <text
          key={s.name}
          x={b.x + 12}
          y={slotY(b, si) + 4}
          fontSize={12}
          fontFamily={MONO}
          fill={on ? P.text.onFocus : P.text.slot}
          fontWeight={on ? 700 : 400}
        >
          {slotLine(kind, s)}
        </text>
      );
    });

  return (
    <svg
      viewBox={`0 0 ${at.width} ${at.height}`}
      className="h-full w-full"
      role="img"
      aria-label={label}
    >
      <style>{`
        .sh-enter { animation: sh-fade 450ms ease-out both; }
        .sh-shape { transition: fill 400ms, stroke 400ms, opacity 500ms; }
        .sh-ref { transition: stroke 300ms, stroke-width 300ms, opacity 300ms; }
        @keyframes sh-fade { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .sh-enter { animation: none; }
          .sh-shape, .sh-ref { transition: none; }
        }
      `}</style>
      <defs>
        <marker
          id={arrowId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={P.reference.stroke} />
        </marker>
        <marker
          id={arrowFocusId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={P.focus} />
        </marker>
      </defs>

      {/* Regions */}
      <rect
        x={STACK_X}
        y={20}
        width={STACK_W}
        height={at.height - 36}
        rx={14}
        fill={P.region.fill}
        stroke={P.region.stroke}
      />
      <text
        x={STACK_X + 14}
        y={42}
        fill={P.region.label}
        fontSize={12}
        fontWeight={700}
        letterSpacing={1.5}
      >
        CALL STACK
      </text>
      <rect
        x={HEAP_X}
        y={20}
        width={at.width - HEAP_X - 16}
        height={at.height - 36}
        rx={14}
        fill={P.region.fill}
        stroke={P.region.stroke}
      />
      <text
        x={HEAP_X + 14}
        y={42}
        fill={P.region.label}
        fontSize={12}
        fontWeight={700}
        letterSpacing={1.5}
      >
        HEAP
      </text>

      {/* Frames */}
      {snapshot.frames.map((f, i) => {
        const b = at.frames.get(f.id)!;
        const top = i === snapshot.frames.length - 1;
        const on = focused(f.id);
        return (
          <g key={f.id} className="sh-enter" data-viz-label data-viz-entity="frame">
            <rect
              className="sh-shape"
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={8}
              fill={P.frame.fill}
              stroke={marking || on ? P.root : P.frame.stroke}
              strokeWidth={marking || on ? 3 : top ? 2 : 1}
              strokeDasharray={marking ? '6 4' : undefined}
            />
            <text
              x={b.x + 10}
              y={b.y + 20}
              fontSize={13}
              fontWeight={700}
              fill={P.text.frameName}
              fontFamily={MONO}
            >
              {clip(f.name, FRAME_NAME_CHARS)}
            </text>
            {marking && (
              <text
                x={b.x + b.w - 10}
                y={b.y + 20}
                fontSize={10}
                fontWeight={700}
                textAnchor="end"
                fill={P.root}
              >
                ROOT
              </text>
            )}
            {slotText(f, 'frame', b)}
          </g>
        );
      })}

      {/* References (drawn under objects) */}
      {refs.map((r) => {
        const d = refPath(r, snapshot, at);
        if (!d) return null;
        const on = focused(r.from);
        return (
          <path
            key={r.id}
            className="sh-ref sh-enter"
            data-viz-ref={r.id}
            d={d}
            fill="none"
            stroke={on ? P.focus : P.reference.stroke}
            strokeWidth={on ? 3 : 1.6}
            markerEnd={`url(#${on ? arrowFocusId : arrowId})`}
          />
        );
      })}

      {/* Heap objects */}
      {snapshot.objects.map((o) => {
        const b = at.objects.get(o.id)!;
        const on = focused(o.id);
        const isScope = o.kind === 'scope';
        const unmarked = o.state === 'unmarked';
        const collected = o.state === 'collected';
        const unreachable = reachable !== null && o.state === 'live' && !reachable.has(o.id);
        const colors: EntityColors = unmarked || unreachable ? P.unreachable : P[o.kind];
        return (
          <g
            data-viz-label
            data-viz-entity={o.kind}
            data-viz-unreachable={unreachable || undefined}
            key={o.id}
            className="sh-enter"
            opacity={collected ? 0.18 : 1}
            style={{ transition: reducedMotion ? 'none' : 'opacity 600ms' }}
          >
            <rect
              className="sh-shape"
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={KIND_RX[o.kind]}
              fill={colors.fill}
              stroke={on ? P.focus : colors.stroke}
              strokeWidth={on ? 3 : 1.5}
              strokeDasharray={
                collected ? '5 4' : isScope ? '6 4' : unreachable ? '2 3' : undefined
              }
            />
            <text
              x={b.x + 10}
              y={b.y + 20}
              fontSize={13}
              fontWeight={700}
              fill={isScope ? P.text.frameName : P.text.primary}
              fontFamily={isScope ? MONO : undefined}
            >
              {clip(o.label, labelChars(o.id))}
              <tspan fill={P.text.muted} fontWeight={400} fontSize={11}>
                {'  #'}
                {o.id}
              </tspan>
            </text>
            {(unmarked || collected) && (
              <text
                x={b.x + b.w - 10}
                y={b.y + 20}
                fontSize={10}
                fontWeight={700}
                textAnchor="end"
                fill={P.unreachable.stroke}
              >
                {collected ? 'RECLAIMED' : 'UNMARKED'}
              </text>
            )}
            {o.slots.length === 0 ? (
              <text
                x={b.x + 12}
                y={slotY(b, 0) + 4}
                fontSize={12}
                fontFamily={MONO}
                fill={P.text.muted}
              >
                (empty)
              </text>
            ) : (
              slotText(o, o.kind, b)
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default StackHeapView2D;
