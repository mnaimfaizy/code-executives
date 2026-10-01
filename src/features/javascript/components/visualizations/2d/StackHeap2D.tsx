import React from 'react';
import {
  getReferences,
  isFocused,
  isRefFocused,
  slotKey,
  type HeapObject,
  type Reference,
  type StackFrame,
  type StoryStep,
} from '../../../utils/stackHeapStory';

interface StackHeap2DProps {
  step: StoryStep;
}

const W = 800;
const H = 480;

const STACK_X = 24;
const STACK_W = 230;
const STACK_BOTTOM = 452;
const FRAME_HEADER = 30;
const ROW_H = 22;

const HEAP_X = 310;
const CELL_X0 = 340;
const CELL_DX = 230;
const CELL_Y0 = 78;
const CELL_DY = 190;
const OBJ_W = 180;

const COLORS = {
  frame: '#e0e7ff',
  frameStroke: '#6366f1',
  object: '#d1fae5',
  objectStroke: '#10b981',
  array: '#e0f2fe',
  arrayStroke: '#0ea5e9',
  ref: '#64748b',
  focus: '#f59e0b',
  root: '#f59e0b',
  unmarked: '#ffe4e6',
  unmarkedStroke: '#f43f5e',
};

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const frameHeight = (f: StackFrame) => FRAME_HEADER + Math.max(1, f.slots.length) * ROW_H + 8;
const objectHeight = (o: HeapObject) => FRAME_HEADER + Math.max(1, o.slots.length) * ROW_H + 8;

function layoutFrames(frames: StackFrame[]): Map<string, Box> {
  const boxes = new Map<string, Box>();
  let y = STACK_BOTTOM;
  for (const f of frames) {
    const h = frameHeight(f);
    y -= h + 8;
    boxes.set(f.id, { x: STACK_X + 12, y, w: STACK_W - 24, h });
  }
  return boxes;
}

function layoutObjects(objects: HeapObject[]): Map<string, Box> {
  const boxes = new Map<string, Box>();
  for (const o of objects) {
    boxes.set(o.id, {
      x: CELL_X0 + o.cell.col * CELL_DX,
      y: CELL_Y0 + o.cell.row * CELL_DY,
      w: OBJ_W,
      h: objectHeight(o),
    });
  }
  return boxes;
}

const slotY = (box: Box, index: number) => box.y + FRAME_HEADER + index * ROW_H + ROW_H / 2 + 2;

function refPath(
  ref: Reference,
  step: StoryStep,
  frames: Map<string, Box>,
  objects: Map<string, Box>
): string | null {
  const target = objects.get(ref.to);
  const targetObj = step.objects.find((o) => o.id === ref.to);
  const owner =
    ref.fromKind === 'frame'
      ? step.frames.find((f) => f.id === ref.fromOwner)
      : step.objects.find((o) => o.id === ref.fromOwner);
  const ownerBox =
    ref.fromKind === 'frame' ? frames.get(ref.fromOwner) : objects.get(ref.fromOwner);
  if (!target || !targetObj || !owner || !ownerBox) return null;

  const idx = owner.slots.findIndex((s) => slotKey(owner.id, s.name) === ref.from);
  const sy = slotY(ownerBox, idx);
  const ty = target.y + FRAME_HEADER / 2;

  if (ref.fromKind === 'object') {
    const src = step.objects.find((o) => o.id === ref.fromOwner)!;
    if (targetObj.cell.col <= src.cell.col && targetObj.cell.row > src.cell.row) {
      // Down-left: leave from the bottom, enter from the top.
      const sx = ownerBox.x + ownerBox.w / 2;
      const sby = ownerBox.y + ownerBox.h;
      const tx = target.x + target.w / 2;
      return `M ${sx} ${sby} C ${sx} ${sby + 50}, ${tx} ${target.y - 50}, ${tx} ${target.y}`;
    }
  }
  const sx = ownerBox.x + ownerBox.w;
  const tx = target.x;
  const dx = Math.max(40, (tx - sx) / 2);
  return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
}

const StackHeap2D: React.FC<StackHeap2DProps> = ({ step }) => {
  const frames = layoutFrames(step.frames);
  const objects = layoutObjects(step.objects);
  const refs = getReferences(step);
  const marking = step.gcPhase === 'mark';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      role="img"
      aria-label={`Stack and heap: ${step.title}`}
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
          id="sh-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.ref} />
        </marker>
        <marker
          id="sh-arrow-focus"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.focus} />
        </marker>
      </defs>

      {/* Regions */}
      <rect
        x={STACK_X}
        y={20}
        width={STACK_W}
        height={H - 36}
        rx={14}
        fill="#f8fafc"
        stroke="#cbd5e1"
      />
      <text
        x={STACK_X + 14}
        y={42}
        className="fill-slate-500"
        fontSize={12}
        fontWeight={700}
        letterSpacing={1.5}
      >
        CALL STACK
      </text>
      <rect
        x={HEAP_X}
        y={20}
        width={W - HEAP_X - 16}
        height={H - 36}
        rx={14}
        fill="#f8fafc"
        stroke="#cbd5e1"
      />
      <text
        x={HEAP_X + 14}
        y={42}
        className="fill-slate-500"
        fontSize={12}
        fontWeight={700}
        letterSpacing={1.5}
      >
        HEAP
      </text>

      {/* Frames */}
      {step.frames.map((f, i) => {
        const b = frames.get(f.id)!;
        const top = i === step.frames.length - 1;
        const focused = isFocused(step, f.id);
        return (
          <g key={f.id} className="sh-enter" data-viz-label>
            <rect
              className="sh-shape"
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={8}
              fill={COLORS.frame}
              stroke={marking || focused ? COLORS.root : COLORS.frameStroke}
              strokeWidth={marking || focused ? 3 : top ? 2 : 1}
              strokeDasharray={marking ? '6 4' : undefined}
            />
            <text
              x={b.x + 10}
              y={b.y + 20}
              fontSize={13}
              fontWeight={700}
              className="fill-indigo-900"
              fontFamily="ui-monospace, monospace"
            >
              {f.name}
            </text>
            {marking && (
              <text
                x={b.x + b.w - 10}
                y={b.y + 20}
                fontSize={10}
                fontWeight={700}
                textAnchor="end"
                fill={COLORS.root}
              >
                ROOT
              </text>
            )}
            {f.slots.map((s, si) => (
              <text
                key={s.name}
                x={b.x + 12}
                y={slotY(b, si) + 4}
                fontSize={12}
                fontFamily="ui-monospace, monospace"
                className={
                  isFocused(step, slotKey(f.id, s.name)) ? 'fill-amber-700' : 'fill-slate-700'
                }
                fontWeight={isFocused(step, slotKey(f.id, s.name)) ? 700 : 400}
              >
                {s.name} = {s.refId ? '●→' : s.value}
              </text>
            ))}
          </g>
        );
      })}

      {/* References (drawn under objects) */}
      {refs.map((r) => {
        const d = refPath(r, step, frames, objects);
        if (!d) return null;
        const focused = isRefFocused(step, r);
        return (
          <path
            key={r.id}
            className="sh-ref sh-enter"
            d={d}
            fill="none"
            stroke={focused ? COLORS.focus : COLORS.ref}
            strokeWidth={focused ? 3 : 1.6}
            markerEnd={`url(#${focused ? 'sh-arrow-focus' : 'sh-arrow'})`}
          />
        );
      })}

      {/* Heap objects */}
      {step.objects.map((o) => {
        const b = objects.get(o.id)!;
        const focused = isFocused(step, o.id);
        const isArray = o.kind === 'array';
        const unmarked = o.state === 'unmarked';
        const collected = o.state === 'collected';
        return (
          <g
            data-viz-label
            key={o.id}
            className="sh-enter"
            opacity={collected ? 0.18 : 1}
            style={{ transition: 'opacity 600ms' }}
          >
            <rect
              className="sh-shape"
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={isArray ? 4 : 10}
              fill={unmarked ? COLORS.unmarked : isArray ? COLORS.array : COLORS.object}
              stroke={
                focused
                  ? COLORS.focus
                  : unmarked
                    ? COLORS.unmarkedStroke
                    : isArray
                      ? COLORS.arrayStroke
                      : COLORS.objectStroke
              }
              strokeWidth={focused ? 3 : 1.5}
              strokeDasharray={collected ? '5 4' : undefined}
            />
            <text
              x={b.x + 10}
              y={b.y + 20}
              fontSize={13}
              fontWeight={700}
              className="fill-slate-800"
            >
              {o.label}
              <tspan className="fill-slate-400" fontWeight={400} fontSize={11}>
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
                fill={COLORS.unmarkedStroke}
              >
                {collected ? 'RECLAIMED' : 'UNMARKED'}
              </text>
            )}
            {o.slots.length === 0 ? (
              <text
                x={b.x + 12}
                y={slotY(b, 0) + 4}
                fontSize={12}
                fontFamily="ui-monospace, monospace"
                className="fill-slate-400"
              >
                (empty)
              </text>
            ) : (
              o.slots.map((s, si) => (
                <text
                  key={s.name}
                  x={b.x + 12}
                  y={slotY(b, si) + 4}
                  fontSize={12}
                  fontFamily="ui-monospace, monospace"
                  className={
                    isFocused(step, slotKey(o.id, s.name)) ? 'fill-amber-700' : 'fill-slate-700'
                  }
                  fontWeight={isFocused(step, slotKey(o.id, s.name)) ? 700 : 400}
                >
                  {isArray ? `[${s.name}]` : s.name}: {s.refId ? '●→' : s.value}
                </text>
              ))
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default StackHeap2D;
