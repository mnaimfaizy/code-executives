/**
 * World geometry and camera shots of the event loop scene, as pure functions of its extent.
 *
 * THREE-FREE: only types cross from `frameShot`, so this file can be unit-tested without WebGL.
 *
 * The regions and the cells are the 2D view's (`components/viz/eventloop/layout`): the call
 * stack, then one lane each for the microtask queue, the task queue and the timers, left to
 * right in the order the loop takes work. A lane is one column of cells running toward the
 * viewer; row 0, the head, is at the back, under the lane's caption.
 *
 * The stack is the stack-and-heap scene's own: same place, same frames, same labels.
 *
 * Labels are DOM cards of a fixed pixel size, so the pitches below are chosen for the smallest
 * viewer (`MIN_VIEWER`): there a lane is as wide as an entry's card and a row as deep as the
 * card is tall. A larger viewer only adds room.
 */
import type { Cell, Snapshot } from '../../snapshot';
import {
  QUEUE_REGIONS,
  REGION_INFO,
  entryRows,
  extentOf,
  hasQueues,
  placeEntries,
  type EventLoopExtent,
  type QueueRegion,
} from '../../components/viz/eventloop/layout';
import type { RunningEntry } from '../../components/viz/eventloop/types';
import type { Box3, V3 } from '../../components/viz/viewerCamera';
import type { Shot, ShotPad } from '../frameShot';
import { FRAME_SIZE, MIN_STACK_DEPTH, STACK_X, frameBox, frameY } from '../stackheap/layout';

/** The framings of the scene: the Event Loop story's `ShotId`. A trace step uses `overview`. */
export type EventLoopShot =
  'overview' | 'stack' | 'timers-tasks' | 'stack-microtasks' | 'stack-tasks';

// ---- Fixed measures ---------------------------------------------------------------------

/** The smallest viewer the scene is laid out for, in px. Hosts hold their viewer to it. */
export const MIN_VIEWER = { width: 760, height: 520 };

/**
 * An entry's label card, in px: its lines are cut to `width` with an ellipsis, and `height` is
 * its two lines with padding and border.
 */
export const ENTRY_CARD = { width: 124, minWidth: 84, height: 32 };

/**
 * Direction from target to camera for the isometric preset: higher and more head-on than the
 * stack-and-heap scene's, so a lane's rows run almost straight down the screen and the three
 * lanes stay side by side like the 2D view's columns.
 */
export const ISO: V3 = [3, 9, 11];

/** Centre of the first lane, and the distance between lanes (world units). */
export const LANE_X0 = 0.2;
export const LANE_PITCH = 4.6;
export const LANE_WIDTH = 4.2;
/** Distance between rows. */
export const ROW_PITCH = 2.3;
/** A waiting callback: a low slab, clearly smaller than the frame it becomes. */
export const ENTRY_SIZE: V3 = [3.2, 0.5, 1.3];

const STACK_PLINTH = 0.4;

// Frame cards lean left of the stack; lane captions stand behind the lanes' back edge.
const OVERVIEW: ShotPad = { left: 76, right: 16, top: 46, bottom: 28 };
const STACK_ONLY: ShotPad = { left: 110, right: 110, top: 60, bottom: 90 };
const LANES_ONLY: ShotPad = { left: 30, right: 16, top: 46, bottom: 28 };

// ---- Layout -----------------------------------------------------------------------------

export interface EventLoopLayout {
  /** False for a snapshot without queues: the stack alone is drawn and framed. */
  queues: boolean;
  /** Frames the stack box holds: the frame count, at least `MIN_STACK_DEPTH`. */
  depth: number;
  /** Rows every lane holds. */
  rows: number;
  rowPitch: number;
  /** More than the story's worth of frames or rows: frame cards take their tight form. */
  dense: boolean;
  /** z of row 0's centre. */
  z0: number;
  stack: Box3;
  /** The floor of each lane, from its back edge (the head) to its front edge. */
  lanes: Record<QueueRegion, Box3>;
  shots: Record<EventLoopShot, Shot>;
  /** The scene plus a margin: panning keeps the camera target inside it. */
  bounds: Box3;
}

function union(boxes: Box3[], margin: number): Box3 {
  const min: V3 = [Infinity, Infinity, Infinity];
  const max: V3 = [-Infinity, -Infinity, -Infinity];
  for (const [a, b] of boxes)
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], a[i], b[i]);
      max[i] = Math.max(max[i], a[i], b[i]);
    }
  return [min.map((v) => v - margin) as V3, max.map((v) => v + margin) as V3];
}

/** x of a lane's centre line. */
export const laneX = (region: QueueRegion): number =>
  LANE_X0 + (REGION_INFO[region].column - 1) * LANE_PITCH;

const cache = new Map<string, EventLoopLayout>();

/**
 * The layout for an extent. Equal inputs return the same object, so a camera keyed on
 * `shots[...]` only re-frames when the layout really changed.
 */
export function layoutOf(extent: EventLoopExtent, queues = true): EventLoopLayout {
  const depth = Math.max(MIN_STACK_DEPTH, extent.frames);
  const rows = entryRows(extent);
  const key = `${depth}x${rows}x${queues}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const dense = depth > MIN_STACK_DEPTH || rows > entryRows({ microtasks: 0, tasks: 0, timers: 0 });
  const rowPitch = ROW_PITCH;
  // The lanes are centred on the stack's depth, so the stack stands beside their middle.
  const z0 = (-(rows - 1) * rowPitch) / 2;

  const stack: Box3 = [
    [STACK_X - FRAME_SIZE[0] / 2 - STACK_PLINTH, 0, -FRAME_SIZE[2] / 2 - STACK_PLINTH],
    [
      STACK_X + FRAME_SIZE[0] / 2 + STACK_PLINTH,
      frameY(depth - 1) + FRAME_SIZE[1] / 2,
      FRAME_SIZE[2] / 2 + STACK_PLINTH,
    ],
  ];
  const lane = (region: QueueRegion): Box3 => [
    [laneX(region) - LANE_WIDTH / 2, 0, z0 - rowPitch / 2],
    // Half a row past the last cell: the place of the "+N more" marker.
    [laneX(region) + LANE_WIDTH / 2, ENTRY_SIZE[1], z0 + (rows - 0.5) * rowPitch + rowPitch / 2],
  ];
  const lanes = { microtasks: lane('microtasks'), tasks: lane('tasks'), timers: lane('timers') };
  const all = [stack, ...QUEUE_REGIONS.map((r) => lanes[r])];

  const stackShot: Shot = { boxes: [stack], pad: STACK_ONLY };
  const layout: EventLoopLayout = {
    queues,
    depth,
    rows,
    rowPitch,
    dense,
    z0,
    stack,
    lanes,
    shots: queues
      ? {
          overview: { boxes: all, pad: OVERVIEW },
          stack: stackShot,
          'timers-tasks': { boxes: [lanes.tasks, lanes.timers], pad: LANES_ONLY },
          // The head of the task queue stays in frame: the task that waits while microtasks run.
          'stack-microtasks': {
            boxes: [
              stack,
              lanes.microtasks,
              entryBox('tasks', { col: 0, row: 0 }, { z0, rowPitch }),
            ],
            pad: OVERVIEW,
          },
          'stack-tasks': { boxes: [stack, lanes.microtasks, lanes.tasks], pad: OVERVIEW },
        }
      : {
          overview: stackShot,
          stack: stackShot,
          'timers-tasks': stackShot,
          'stack-microtasks': stackShot,
          'stack-tasks': stackShot,
        },
    bounds: union(queues ? all : [stack], 3),
  };
  cache.set(key, layout);
  return layout;
}

/** The layout that holds `snapshot`, and at least `min` (a trace's extent for its whole run). */
export const layoutFor = (snapshot: Snapshot, min?: Partial<EventLoopExtent>): EventLoopLayout =>
  layoutOf(extentOf([snapshot], min), hasQueues(snapshot));

// ---- Cells ------------------------------------------------------------------------------

/** Floor position of a cell's centre. */
export const cellPos = (
  region: QueueRegion,
  cell: Cell,
  { z0, rowPitch }: Pick<EventLoopLayout, 'z0' | 'rowPitch'>
): V3 => [laneX(region) + cell.col * LANE_PITCH, 0, z0 + cell.row * rowPitch];

/** World box of the entry standing in `cell` of `region`. */
export function entryBox(
  region: QueueRegion,
  cell: Cell,
  layout: Pick<EventLoopLayout, 'z0' | 'rowPitch'>
): Box3 {
  const [x, , z] = cellPos(region, cell, layout);
  const [w, h, d] = ENTRY_SIZE;
  return [
    [x - w / 2, 0, z - d / 2],
    [x + w / 2, h, z + d / 2],
  ];
}

/** Where a lane's "+N more" marker stands: just past its last drawn entry. */
export const morePos = (
  region: QueueRegion,
  drawn: number,
  layout: Pick<EventLoopLayout, 'z0' | 'rowPitch'>
): V3 => {
  const [x, y, z] = cellPos(region, { col: 0, row: drawn }, layout);
  return [x, y, z - layout.rowPitch / 4];
};

// ---- Identity ---------------------------------------------------------------------------

/** Where a frame or an entry stands in one snapshot. */
export interface Place {
  kind: 'frame' | 'entry';
  box: Box3;
}

/** The box of everything `snapshot` draws, by id. A frame and an entry never share an id. */
export function placesOf(snapshot: Snapshot, layout: EventLoopLayout): Map<string, Place> {
  const places = new Map<string, Place>();
  snapshot.frames.forEach((f, i) => places.set(f.id, { kind: 'frame', box: frameBox(i) }));
  if (layout.queues)
    for (const { entry, region, cell } of placeEntries(snapshot))
      if (!places.has(entry.id))
        places.set(entry.id, { kind: 'entry', box: entryBox(region, cell, layout) });
  return places;
}

/**
 * The id a frame had while its callback was waiting: the running entry's when this frame runs
 * it (a trace), otherwise the frame's own (the story gives a callback one id everywhere).
 */
export const waitingIdOf = (frameId: string, running: RunningEntry | undefined): string =>
  running && running.frameId === frameId ? running.entry.id : frameId;

/** A box as a frame slab would be placed: its centre, and its size as a fraction of a frame's. */
export const asFrame = ([min, max]: Box3): { position: V3; scale: V3 } => ({
  position: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
  scale: [0, 1, 2].map((i) => (max[i] - min[i]) / FRAME_SIZE[i]) as V3,
});

/** A box as an entry block would be placed: the centre of its base, and its size as a fraction. */
export const asEntry = ([min, max]: Box3): { position: V3; scale: V3 } => ({
  position: [(min[0] + max[0]) / 2, min[1], (min[2] + max[2]) / 2],
  scale: [0, 1, 2].map((i) => (max[i] - min[i]) / ENTRY_SIZE[i]) as V3,
});
