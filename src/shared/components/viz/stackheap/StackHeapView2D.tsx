import React from 'react';
import { getReachable, getReferences, type HeapObject } from '../../../snapshot';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { vizPalette, type EntityColors } from '../../../viz/palette';
import { SlotLines, StackFrames, StackPanel } from './StackFrames2D';
import { MONO, STACK_CSS, clip, slotY } from './stackGeometry';
import { HEAP_X, layout2D, refPath } from './heapGeometry';
import type { StackHeapViewProps } from './types';

/** How each heap kind is outlined; colour alone never carries the difference. */
const KIND_RX: Record<HeapObject['kind'], number> = {
  object: 10,
  array: 4,
  function: 16,
  scope: 8,
};

/** Outline of an object in focus, and of one the collector has marked (1.5 otherwise). */
const HEAVY_STROKE = 3;

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
  const at = layout2D(snapshot, grid);
  const refs = getReferences(snapshot);
  const reachable = markUnreachable ? getReachable(snapshot) : null;
  const marking = gcPhase === 'mark';
  const focused = (key: string) => focus.includes(key);

  // Marker ids are document-wide: one pair per theme, so a light and a dark view can coexist.
  const arrowId = theme === 'light' ? 'sh-arrow' : `sh-arrow-${theme}`;
  const arrowFocusId = `${arrowId}-focus`;

  return (
    <svg
      viewBox={`0 0 ${at.width} ${at.height}`}
      className="h-full w-full"
      role="img"
      aria-label={label}
    >
      <style>{STACK_CSS}</style>
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
      <StackPanel height={at.height} palette={P} />
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
      <StackFrames
        frames={snapshot.frames}
        boxes={at.frames}
        palette={P}
        focused={focused}
        marking={marking}
      />

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
        // A mark belongs to a collection, so it is drawn only while one runs. A Playground trace
        // never passes `gcPhase`; its lens uses `marked` for "reachable from a frame not drawn".
        const marked = o.state === 'marked' && gcPhase !== undefined;
        const unreachable = reachable !== null && o.state === 'live' && !reachable.has(o.id);
        const colors: EntityColors = unmarked || unreachable ? P.unreachable : P[o.kind];
        return (
          <g
            data-viz-label
            data-viz-entity={o.kind}
            data-viz-unreachable={unreachable || undefined}
            data-viz-state={o.state}
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
              // A marked object keeps its own colour: the heavier outline is the cue.
              strokeWidth={on || marked ? HEAVY_STROKE : 1.5}
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
                fill={P.text.unreachable}
              >
                {collected ? 'RECLAIMED' : 'UNMARKED'}
              </text>
            )}
            {marked && (
              <text
                data-viz-tag="marked"
                x={b.x + b.w - 10}
                y={b.y + 20}
                fontSize={10}
                fontWeight={700}
                textAnchor="end"
                fill={P.text.primary}
              >
                MARKED
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
              <SlotLines owner={o} kind={o.kind} box={b} palette={P} focused={focused} />
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default StackHeapView2D;
