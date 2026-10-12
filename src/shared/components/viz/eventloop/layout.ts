/**
 * The layout of the event loop scene as data: its four regions, the order the loop takes work
 * from them, and the cell of every entry inside its region.
 *
 * THREE-FREE and DOM-free: the 2D view and the 3D view both read this, so an entry sits in the
 * same cell of the same region in each of them. A view only decides how large a cell is.
 */
import type { Cell, QueueEntry, Snapshot } from '../../../snapshot';
import type { QueueRole } from '../../../viz/palette';

/** Left to right in both views, which is also the order the loop takes work. */
export const EVENT_LOOP_REGIONS = ['stack', 'microtasks', 'tasks', 'timers'] as const;
export type EventLoopRegion = (typeof EVENT_LOOP_REGIONS)[number];

/** The three regions that hold callbacks. Their names are the snapshot's own fields. */
export const QUEUE_REGIONS = ['microtasks', 'tasks', 'timers'] as const;
export type QueueRegion = (typeof QUEUE_REGIONS)[number];

export interface RegionInfo {
  /** Position among the regions, left to right from 0. */
  column: number;
  /** The region's name, as drawn. */
  caption: string;
  /** When the loop takes work from here: 1 first. Null for the timers, which it never runs. */
  order: number | null;
  /** One short line, drawn under the caption, that says when this region's work runs. */
  note: string;
  /** The palette role of an entry here. Null for the stack, which holds frames. */
  role: QueueRole | null;
  /** The tag on the entry in row 0. Null where the first entry is not about to run. */
  headTag: string | null;
}

export const REGION_INFO: Record<EventLoopRegion, RegionInfo> = {
  stack: {
    column: 0,
    caption: 'CALL STACK',
    order: 1,
    note: 'runs first, until empty',
    role: null,
    headTag: null,
  },
  microtasks: {
    column: 1,
    caption: 'MICROTASK QUEUE',
    order: 2,
    note: 'then all of these',
    role: 'microtask',
    headTag: 'NEXT',
  },
  tasks: {
    column: 2,
    caption: 'TASK QUEUE',
    order: 3,
    note: 'then one, back to 2',
    role: 'task',
    headTag: 'NEXT',
  },
  timers: {
    column: 3,
    caption: 'TIMERS',
    order: null,
    note: 'wait, then join tasks',
    role: 'timer',
    headTag: null,
  },
};

/**
 * The cell of the entry at `index` of its region. A region is one column of cells and row 0 is
 * the first to run: an entry moves up a row each time the one ahead of it leaves.
 */
export const entryCell = (index: number): Cell => ({ col: 0, row: index });

export interface PlacedEntry {
  entry: QueueEntry;
  region: QueueRegion;
  cell: Cell;
  /** Row 0: the next to run in a queue, the soonest of the timers. */
  head: boolean;
}

type Queues = Pick<Snapshot, QueueRegion>;

/** True when the snapshot records the event loop's regions at all (empty ones count). */
export const hasQueues = (snapshot: Queues): boolean =>
  QUEUE_REGIONS.some((region) => snapshot[region] !== undefined);

/**
 * Every entry of the snapshot with its region and cell. An id is placed once: an entry keeps
 * its identity when it changes region, so it can never be in two of them.
 */
export function placeEntries(snapshot: Queues): PlacedEntry[] {
  const seen = new Set<string>();
  const placed: PlacedEntry[] = [];
  for (const region of QUEUE_REGIONS) {
    let index = 0;
    for (const entry of snapshot[region] ?? []) {
      if (seen.has(entry.id)) continue;
      seen.add(entry.id);
      placed.push({ entry, region, cell: entryCell(index), head: index === 0 });
      index++;
    }
  }
  return placed;
}

/**
 * How much the scene has to hold. A trace passes the extent of its whole run, so every region
 * is sized once and nothing shifts when a later step adds a frame or an entry.
 */
export interface EventLoopExtent {
  /** Frames on the stack. */
  frames: number;
  /** Slot rows over the whole stack; a frame with no slots still takes one. */
  slotRows: number;
  microtasks: number;
  tasks: number;
  timers: number;
}

/** Every region is laid out for at least this many entries, so a quiet run is not a sliver. */
export const MIN_ENTRY_ROWS = 4;

const EXTENT_KEYS = ['frames', 'slotRows', 'microtasks', 'tasks', 'timers'] as const;

/** The extent that holds every one of `snapshots`, and at least `min`. */
export function extentOf(
  snapshots: readonly Snapshot[],
  min: Partial<EventLoopExtent> = {}
): EventLoopExtent {
  const extent: EventLoopExtent = { frames: 0, slotRows: 0, microtasks: 0, tasks: 0, timers: 0 };
  for (const key of EXTENT_KEYS) extent[key] = Math.max(0, Math.floor(min[key] ?? 0));
  for (const s of snapshots) {
    extent.frames = Math.max(extent.frames, s.frames.length);
    extent.slotRows = Math.max(
      extent.slotRows,
      s.frames.reduce((sum, f) => sum + Math.max(1, f.slots.length), 0)
    );
    for (const region of QUEUE_REGIONS) {
      extent[region] = Math.max(extent[region], s[region]?.length ?? 0);
    }
  }
  return extent;
}

/** Rows every queue region is laid out for: the fullest region's, at least `MIN_ENTRY_ROWS`. */
export const entryRows = (extent: Pick<EventLoopExtent, QueueRegion>): number =>
  Math.max(MIN_ENTRY_ROWS, extent.microtasks, extent.tasks, extent.timers);

/** How an entry's second line reads: where it came from, and the delay a timer asked for. */
export const entrySource = (entry: QueueEntry): string =>
  entry.delay === undefined ? entry.source : `${entry.source} · ${entry.delay} ms`;
