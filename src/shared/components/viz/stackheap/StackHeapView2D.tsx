import React from 'react';
import {
  getCopyTrails,
  getReachable,
  getReferences,
  isSpaceFreed,
  originOf,
  spaceOf,
  type HeapObject,
} from '../../../snapshot';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { vizPalette, type EntityColors } from '../../../viz/palette';
import { SlotLines, StackFrames, StackPanel } from './StackFrames2D';
import { MONO, STACK_CSS, clip, slotY } from './stackGeometry';
import { copyTrailPath, layout2D, refPath } from './heapGeometry';
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
  // Every collection starts from the roots: a copying one as much as a marking one.
  const marking = gcPhase === 'mark' || gcPhase === 'scavenge';
  const focused = (key: string) => focus.includes(key);
  // Spaces freed as a whole are drawn once, with one tag, and no per-object tag in them.
  const freed = new Set(
    (snapshot.spaces ?? []).filter((s) => isSpaceFreed(snapshot, s.id)).map((s) => s.id)
  );
  const trails = getCopyTrails(snapshot);

  // Marker ids are document-wide: one pair per theme, so a light and a dark view can coexist.
  const arrowId = theme === 'light' ? 'sh-arrow' : `sh-arrow-${theme}`;
  const arrowFocusId = `${arrowId}-focus`;
  const trailId = `${arrowId}-trail`;

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
        {/* A copy trail is not a reference: an open chevron in the muted colour. */}
        <marker
          id={trailId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 1 1 L 8 5 L 1 9" fill="none" stroke={P.text.muted} strokeWidth={1.6} />
        </marker>
      </defs>

      {/* Regions */}
      <StackPanel height={at.height} palette={P} width={at.stackW} />
      <rect
        x={at.heapX}
        y={20}
        width={at.width - at.heapX - 16}
        height={at.height - 36}
        rx={14}
        fill={P.region.fill}
        stroke={P.region.stroke}
      />
      <text
        x={at.heapX + 14}
        y={42}
        fill={P.region.label}
        fontSize={12}
        fontWeight={700}
        letterSpacing={1.5}
      >
        HEAP
      </text>

      {/* Spaces: one band per heap row, its label and tags in a header above the row */}
      {snapshot.spaces?.map((space) => {
        const band = at.spaces.get(space.id)!;
        const isFreed = freed.has(space.id);
        const tags = [
          space.role === 'from' ? 'FROM-SPACE' : space.role === 'to' ? 'TO-SPACE' : null,
          isFreed ? 'FREE' : null,
        ].filter((t): t is string => t !== null);
        return (
          <g key={space.id} data-viz-space={space.id} data-viz-role={space.role}>
            <rect
              className="sh-shape"
              x={band.x}
              y={band.y}
              width={band.w}
              height={band.h}
              rx={10}
              fill={P.frame.fill}
              stroke={P.region.stroke}
              strokeDasharray={isFreed ? '6 4' : undefined}
            />
            <g data-viz-label data-viz-entity="space">
              <text
                x={band.x + 12}
                y={band.labelY}
                fill={P.region.label}
                fontSize={12}
                fontWeight={700}
                letterSpacing={1.2}
              >
                {space.label}
              </text>
              {tags.length > 0 && (
                <text
                  x={band.x + band.w - 12}
                  y={band.labelY}
                  fontSize={11}
                  fontWeight={700}
                  textAnchor="end"
                  letterSpacing={1}
                  fill={P.text.primary}
                >
                  {tags.map((tag, i) => (
                    <tspan
                      key={tag}
                      data-viz-tag={tag.toLowerCase()}
                      fill={tag === 'FREE' ? P.text.unreachable : P.text.primary}
                    >
                      {i > 0 ? `  ·  ${tag}` : tag}
                    </tspan>
                  ))}
                </text>
              )}
            </g>
          </g>
        );
      })}

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

      {/* Copy trails: from an object a collector copied to its copy (drawn under objects) */}
      {trails.map((t) => {
        const from = at.objects.get(t.from);
        const to = at.objects.get(t.to);
        if (!from || !to) return null;
        return (
          <path
            key={t.id}
            className={reducedMotion ? undefined : 'sh-enter'}
            data-viz-trail={t.id}
            d={copyTrailPath(from, to)}
            fill="none"
            stroke={P.text.muted}
            strokeWidth={2}
            strokeDasharray="2 5"
            strokeLinecap="round"
            markerEnd={`url(#${trailId})`}
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
        const copied = o.state === 'copied';
        const space = spaceOf(snapshot, o.id);
        // In a space freed as a whole there is no per-object tag: nothing was swept one by one.
        const inFreed = collected && space !== undefined && freed.has(space.id);
        // A copy is the same object to the program: its heading names the first of the chain.
        const shownId = originOf(snapshot, o.id);
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
            data-viz-copy-of={o.copyOf}
          >
            {/* The fade sits on an inner group: the enter animation's opacity would override it. */}
            <g
              data-viz-fade
              opacity={collected ? 0.18 : copied ? 0.5 : 1}
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
                {clip(o.label, labelChars(shownId))}
                <tspan fill={P.text.muted} fontWeight={400} fontSize={11}>
                  {'  #'}
                  {shownId}
                </tspan>
              </text>
              {(unmarked || (collected && !inFreed)) && (
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
              {copied && (
                <text
                  data-viz-tag="copied"
                  x={b.x + b.w - 10}
                  y={b.y + 20}
                  fontSize={10}
                  fontWeight={700}
                  textAnchor="end"
                  fill={P.text.unreachable}
                >
                  COPIED
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
          </g>
        );
      })}
    </svg>
  );
};

export default StackHeapView2D;
