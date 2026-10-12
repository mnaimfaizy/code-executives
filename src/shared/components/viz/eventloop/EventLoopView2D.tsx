import React from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { vizPalette, type VizPalette } from '../../../viz/palette';
import { StackFrames, StackPanel } from '../stackheap/StackFrames2D';
import {
  FRAME_GAP,
  FRAME_HEADER,
  MONO,
  ROW_H,
  STACK_CSS,
  STACK_PAD_BOTTOM,
  STACK_W,
  STACK_X,
  clip,
  stackBoxes,
  type Box,
} from '../stackheap/stackGeometry';
import {
  QUEUE_REGIONS,
  REGION_INFO,
  entryRows,
  entrySource,
  extentOf,
  hasQueues,
  placeEntries,
  type EventLoopExtent,
  type EventLoopRegion,
  type PlacedEntry,
  type QueueRegion,
} from './layout';
import type { EventLoopViewProps } from './types';

/*
 * Geometry. The stack is the stack-and-heap view's own; the three queue regions are columns to
 * its right, in the order the loop takes work. A cell is one card; row 0 is at the top.
 */
const QUEUE_X0 = STACK_X + STACK_W + 16;
const COL_W = 172;
const COL_GAP = 8;
const CARD_PAD = 8;
const CARD_W = COL_W - 2 * CARD_PAD;
const CARD_H = 46;
const CARD_PITCH = 54;
/** Top of row 0: under the caption (baseline 42), the note (baseline 58) and a tag on the card. */
const CARDS_Y0 = 78;
/** Under the last row: the "+N more" line, then the region's edge. */
const MORE_H = 24;
/** Above the highest frame: clears the caption, the note and a tag on the frame. */
const STACK_TOP = 78;
const REGION_MARGIN = 16;

/** 12px monospace runs about 7.2px a character: a card holds `setInterval callback` whole. */
const LABEL_CHARS = 20;
/** 12px sans runs about 6.3px a character. */
const SOURCE_CHARS = 21;
const TAG_CHAR_W = 7;

const columnX = (region: QueueRegion) =>
  QUEUE_X0 + (REGION_INFO[region].column - 1) * (COL_W + COL_GAP);

/** Top-left corner of the card in `cell` of `region`: the one place an entry is positioned. */
const cardAt = ({ region, cell }: PlacedEntry) => ({
  x: columnX(region) + CARD_PAD + cell.col * COL_W,
  y: CARDS_Y0 + cell.row * CARD_PITCH,
});

interface Layout {
  width: number;
  height: number;
  queues: boolean;
}

function layout(extent: EventLoopExtent, queues: boolean): Layout {
  const stack =
    extent.frames * (FRAME_HEADER + 8 + FRAME_GAP) +
    extent.slotRows * ROW_H +
    STACK_TOP +
    STACK_PAD_BOTTOM;
  const columns = CARDS_Y0 + entryRows(extent) * CARD_PITCH + MORE_H + REGION_MARGIN;
  return {
    width: queues
      ? QUEUE_X0 + QUEUE_REGIONS.length * COL_W + (QUEUE_REGIONS.length - 1) * COL_GAP + 16
      : STACK_X + STACK_W + STACK_X,
    height: Math.max(columns, stack),
    queues,
  };
}

/** The number that says when the loop takes work from a region, and the line that explains it. */
const RegionNote: React.FC<{
  x: number;
  order: number | null;
  note: string;
  palette: VizPalette;
}> = ({ x, order, note, palette: P }) => (
  <>
    {order !== null && (
      <>
        <circle cx={x + 22} cy={54} r={8} fill="none" stroke={P.region.label} strokeWidth={1.5} />
        <text
          x={x + 22}
          y={58}
          fontSize={11}
          fontWeight={700}
          textAnchor="middle"
          fill={P.region.label}
        >
          {order}
        </text>
      </>
    )}
    <text x={x + (order === null ? 14 : 36)} y={58} fontSize={12} fill={P.region.note}>
      {note}
    </text>
  </>
);

/** A small tag that sits on the top edge of a card or a frame, at its right end. */
const EdgeTag: React.FC<{
  right: number;
  top: number;
  text: string;
  fill: string;
  stroke: string;
  textFill: string;
}> = ({ right, top, text, fill, stroke, textFill }) => {
  const w = text.length * TAG_CHAR_W + 14;
  return (
    <>
      <rect
        x={right - 8 - w}
        y={top - 7}
        width={w}
        height={14}
        rx={7}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <text
        x={right - 8 - w / 2}
        y={top + 4}
        fontSize={11}
        fontWeight={700}
        textAnchor="middle"
        fill={textFill}
      >
        {text}
      </text>
    </>
  );
};

/** The heavier outline of a region the beat is about, drawn over the region's own panel. */
const RegionEmphasis: React.FC<{
  x: number;
  width: number;
  height: number;
  palette: VizPalette;
}> = ({ x, width, height, palette: P }) => (
  <rect
    data-viz-emphasis
    x={x}
    y={20}
    width={width}
    height={height - 36}
    rx={14}
    fill="none"
    stroke={P.region.label}
    strokeWidth={2.5}
  />
);

const EVENT_LOOP_CSS = `
        .el-enter { animation: el-fade 450ms ease-out both; }
        .el-move { transition: transform 500ms ease-in-out; }
        .el-shape { transition: fill 400ms, stroke 400ms; }
        @keyframes el-fade { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .el-enter { animation: none; }
          .el-move, .el-shape { transition: none; }
        }
      `;

/**
 * The shared 2D view of the call stack and the event loop's regions. It does not know whether
 * the snapshot is a story beat or a Playground trace step (ADR 0004); every colour comes from
 * the palette, and every position from `./layout` cells.
 */
const EventLoopView2D: React.FC<EventLoopViewProps> = ({
  snapshot,
  focus,
  theme = 'light',
  extent,
  more,
  running,
  emphasis,
  label,
}) => {
  const reducedMotion = useReducedMotion();
  const P = vizPalette[theme];
  const at = layout(extentOf([snapshot], extent), hasQueues(snapshot));
  const frames = stackBoxes(snapshot.frames, at.height);
  const focused = (key: string) => focus.includes(key);
  const emphasised = (region: EventLoopRegion) => emphasis?.includes(region) ?? false;

  // One group per entry, in an order that never changes: an entry that moves to another region
  // or another row stays the same element, so its move can be animated.
  const entries = at.queues
    ? placeEntries(snapshot).sort((a, b) => (a.entry.id < b.entry.id ? -1 : 1))
    : [];

  const top = snapshot.frames[snapshot.frames.length - 1];
  const runningFrame = running
    ? (snapshot.frames.find((f) => f.id === running.frameId) ?? (running.frameId ? null : top))
    : null;
  const runningRole = running ? REGION_INFO[running.from].role! : null;

  const tagOf = (frame: { id: string }, b: Box) =>
    running && runningRole && runningFrame?.id === frame.id ? (
      <g data-viz-running={running.entry.id}>
        <title>{`Running the ${runningRole} ${running.entry.label}`}</title>
        <EdgeTag
          right={b.x + b.w}
          top={b.y}
          text={runningRole.toUpperCase()}
          fill={P[runningRole].fill}
          stroke={P[runningRole].stroke}
          textFill={P.text.primary}
        />
      </g>
    ) : null;

  return (
    <svg
      viewBox={`0 0 ${at.width} ${at.height}`}
      className="h-full w-full"
      role="img"
      aria-label={label}
    >
      <style>{STACK_CSS + EVENT_LOOP_CSS}</style>

      {/* Regions */}
      <g data-viz-region="stack">
        <StackPanel height={at.height} palette={P} />
        {emphasised('stack') && (
          <RegionEmphasis x={STACK_X} width={STACK_W} height={at.height} palette={P} />
        )}
        {at.queues && (
          <RegionNote
            x={STACK_X}
            order={REGION_INFO.stack.order}
            note={REGION_INFO.stack.note}
            palette={P}
          />
        )}
        {snapshot.frames.length === 0 && (
          <text
            x={STACK_X + 14}
            y={at.height - STACK_PAD_BOTTOM - 14}
            fontSize={12}
            fontFamily={MONO}
            fill={P.region.note}
          >
            empty
          </text>
        )}
      </g>
      {at.queues &&
        QUEUE_REGIONS.map((region) => {
          const info = REGION_INFO[region];
          const x = columnX(region);
          const count = snapshot[region]?.length ?? 0;
          const hidden = more?.[region] ?? 0;
          return (
            <g key={region} data-viz-region={region}>
              <rect
                x={x}
                y={20}
                width={COL_W}
                height={at.height - 36}
                rx={14}
                fill={P.region.fill}
                stroke={P.region.stroke}
              />
              <text
                x={x + 14}
                y={42}
                fill={P.region.label}
                fontSize={12}
                fontWeight={700}
                letterSpacing={1}
              >
                {info.caption}
              </text>
              {emphasised(region) && (
                <RegionEmphasis x={x} width={COL_W} height={at.height} palette={P} />
              )}
              <RegionNote x={x} order={info.order} note={info.note} palette={P} />
              {count === 0 && hidden === 0 && (
                <text
                  x={x + 14}
                  y={CARDS_Y0 + 18}
                  fontSize={12}
                  fontFamily={MONO}
                  fill={P.region.note}
                >
                  empty
                </text>
              )}
              {hidden > 0 && (
                <text
                  x={x + 14}
                  y={CARDS_Y0 + count * CARD_PITCH + 10}
                  fontSize={12}
                  fontFamily={MONO}
                  fill={P.region.note}
                  data-viz-more={region}
                >
                  {`+${hidden} more`}
                </text>
              )}
            </g>
          );
        })}

      {/* Frames */}
      <StackFrames
        frames={snapshot.frames}
        boxes={frames}
        palette={P}
        focused={focused}
        extra={tagOf}
      />

      {/* Entries */}
      {entries.map((placed) => {
        const { entry, region, head } = placed;
        const info = REGION_INFO[region];
        const colors = P[info.role!];
        const { x, y } = cardAt(placed);
        const on = focused(entry.id);
        const tag = head ? info.headTag : null;
        return (
          <g
            key={entry.id}
            className={reducedMotion ? undefined : 'el-move'}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            data-viz-label
            data-viz-entity={info.role}
            data-viz-entry={entry.id}
            data-viz-in={region}
            data-viz-row={placed.cell.row}
            data-viz-head={tag ? true : undefined}
          >
            <g className={reducedMotion ? undefined : 'el-enter'}>
              <title>{`${entry.label} (${entrySource(entry)})`}</title>
              <rect
                className="el-shape"
                width={CARD_W}
                height={CARD_H}
                rx={6}
                fill={colors.fill}
                stroke={on ? P.focus : colors.stroke}
                strokeWidth={on ? 3 : tag ? 2.5 : 1.5}
                // A timer is not runnable yet: its outline is dashed, so colour is not the only cue.
                strokeDasharray={region === 'timers' ? '5 3' : undefined}
              />
              <text
                x={9}
                y={20}
                fontSize={12}
                fontWeight={700}
                fontFamily={MONO}
                fill={P.text.primary}
              >
                {clip(entry.label, LABEL_CHARS)}
              </text>
              <text x={9} y={37} fontSize={12} fill={P.text.secondary}>
                {clip(entrySource(entry), SOURCE_CHARS)}
              </text>
              {tag && (
                <EdgeTag
                  right={CARD_W}
                  top={0}
                  text={tag}
                  fill={colors.fill}
                  stroke={on ? P.focus : colors.stroke}
                  textFill={P.text.primary}
                />
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
};

export default EventLoopView2D;
