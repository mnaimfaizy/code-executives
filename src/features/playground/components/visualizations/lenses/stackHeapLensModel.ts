/**
 * What the stack-and-heap lens draws for each step of a trace.
 *
 * A story's author keeps every beat small enough to read. A trace has no author (ADR 0004), so
 * this file decides what stays legible: how many frames and heap objects are drawn, what is
 * left out, where each drawn object stands for the whole run, and the words that describe a step.
 *
 * Pure data: no React, no three.js, no DOM.
 */

import {
  getReachable,
  gridOf,
  placeSnapshot,
  type Cell,
  type HeapGrid,
  type HeapObject,
  type Placed,
  type Slot,
  type Snapshot,
  type StackFrame,
} from '../../../../../shared/snapshot';
import type { Step } from '../../../tracer';

// ---- Limits -------------------------------------------------------------------------------

/**
 * Frames drawn above the global frame when the stack is deeper than `MAX_DRAWN_FRAMES`: the
 * frame that is running and its two callers.
 */
export const TOP_FRAMES = 3;
/**
 * The most frame boxes a step draws. A deeper stack is drawn as the global frame, one
 * placeholder and the top `TOP_FRAMES` frames, so it is never taller than this. Five boxes is
 * what the 3D view frames beside a full heap without its labels meeting.
 */
export const MAX_DRAWN_FRAMES = TOP_FRAMES + 2;
/** The widest heap floor. A fourth column makes the 2D drawing wider than most panes. */
export const MAX_HEAP_COLS = 3;
/** Rows of the heap floor that stay legible in both views. */
export const MAX_HEAP_ROWS = 3;
/** The most heap objects a step draws: a full `MAX_HEAP_COLS` × `MAX_HEAP_ROWS` floor. */
export const MAX_DRAWN_OBJECTS = MAX_HEAP_COLS * MAX_HEAP_ROWS;

/**
 * Columns of the floor for a run whose fullest step draws `mostDrawn` objects. A run that fits
 * two columns keeps them (the Stack ↔ Heap story's own floor, and narrow enough for a side
 * pane); only a fuller run takes the third.
 */
export const heapColsFor = (mostDrawn: number) =>
  mostDrawn <= 2 * MAX_HEAP_ROWS ? 2 : MAX_HEAP_COLS;

/**
 * The 2D drawing is never scaled below this: its 12px text stays near 10px, and a full floor
 * (about 1030 × 700 units) still fits a pane of about 820 × 560. A smaller pane scrolls.
 */
export const MIN_2D_SCALE = 0.8;

/** The id of the placeholder frame that stands for the frames not drawn. */
export const SKIPPED_FRAMES_ID = 'frames-not-shown';

/** The value a slot shows when the entity it refers to is not in the drawing. */
export const NOT_SHOWN = '(not shown)';
export const NOT_RECORDED = '(not recorded)';

// ---- Types --------------------------------------------------------------------------------

type PlacedObject = Placed<HeapObject>;
type PlacedSnapshot = Snapshot<PlacedObject>;

/** How many entities a step holds, and how many of them the lens leaves out. */
export interface StepCounts {
  frames: number;
  /** Frames folded into the placeholder. */
  framesNotShown: number;
  objects: number;
  /** Objects a frame can still reach. */
  reachable: number;
  /** Unreachable objects left out so that the rest fit. */
  unreachableHidden: number;
}

export type LensStep = {
  counts: StepCounts;
} & (
  | {
      status: 'drawn';
      /** What the views draw: trimmed frames and the objects that fit, each with its cell. */
      snapshot: PlacedSnapshot;
    }
  | {
      /** Still too many objects after hiding the unreachable ones, or the tracer cut the heap. */
      status: 'too-large';
      /** True when the tracer itself stopped recording objects on this step. */
      truncated: boolean;
    }
);

export interface LensTrace {
  /** One entry per step of the trace, in order. */
  steps: LensStep[];
  /** The floor that holds every object drawn at any step: pinned for the whole run. */
  grid: HeapGrid;
}

export interface LensOptions {
  /** False when the run could not record heap objects: only frames are drawn. */
  heapRecorded?: boolean;
}

// ---- Frames -------------------------------------------------------------------------------

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export interface TrimmedFrames {
  frames: StackFrame[];
  /** Ids of the frames folded into the placeholder, bottom first. */
  skipped: string[];
}

/**
 * A stack deeper than `MAX_DRAWN_FRAMES` keeps its global frame and its top `TOP_FRAMES` frames;
 * one placeholder frame between them says how many are not shown.
 */
export function trimFrames(frames: readonly StackFrame[]): TrimmedFrames {
  if (frames.length <= MAX_DRAWN_FRAMES) return { frames: [...frames], skipped: [] };
  const top = frames.slice(-TOP_FRAMES);
  const skipped = frames.slice(1, -TOP_FRAMES);
  const placeholder: StackFrame = {
    id: SKIPPED_FRAMES_ID,
    name: `… ${skipped.length} more frames`,
    slots: [{ name: 'frames', value: 'not shown' }],
  };
  return { frames: [frames[0], placeholder, ...top], skipped: skipped.map((f) => f.id) };
}

// ---- One step -----------------------------------------------------------------------------

interface Selection {
  counts: StepCounts;
  /** Null when the step is too large to draw. */
  drawn: { frames: StackFrame[]; objects: HeapObject[]; roots?: string[] } | null;
  truncated: boolean;
}

/**
 * Chooses what one step draws. Unreachable objects are hidden only when the heap would not fit
 * otherwise; a heap that still does not fit, or one the tracer cut short, is not drawn at all.
 */
export function selectStep(step: Step, options: LensOptions = {}): Selection {
  const heapRecorded = options.heapRecorded !== false;
  const full = step.snapshot;
  const all = heapRecorded ? full.objects : [];
  // The roots a run holds without a frame (the global scope once the script has ended, callbacks
  // waiting in a queue) come along, or everything they hold would be drawn as unreachable.
  const roots = full.roots ? { roots: full.roots } : {};
  const reachable = getReachable({ frames: full.frames, objects: all, ...roots });
  const { frames, skipped } = trimFrames(full.frames);

  const overLimit = all.length > MAX_DRAWN_OBJECTS;
  const kept = overLimit ? all.filter((o) => reachable.has(o.id)) : all;
  const counts: StepCounts = {
    frames: full.frames.length,
    framesNotShown: skipped.length,
    objects: all.length,
    reachable: reachable.size,
    unreachableHidden: all.length - kept.length,
  };

  const truncated = heapRecorded && step.truncated;
  if (truncated || kept.length > MAX_DRAWN_OBJECTS) {
    return { counts: { ...counts, unreachableHidden: 0 }, drawn: null, truncated };
  }

  // No slot may point at something that is not drawn: both views draw `●→` for it and no arrow.
  const drawnIds = new Set([...frames.map((f) => f.id), ...kept.map((o) => o.id)]);
  const skippedIds = new Set(skipped);
  const absent = heapRecorded ? NOT_SHOWN : NOT_RECORDED;
  const settle = (slot: Slot): Slot => {
    if (!slot.refId || drawnIds.has(slot.refId)) return slot;
    // A scope that is still on the stack, among the frames the placeholder stands for.
    if (skippedIds.has(slot.refId)) return { name: slot.name, refId: SKIPPED_FRAMES_ID };
    return { name: slot.name, value: absent };
  };
  const settled = <T extends { slots: Slot[] }>(owner: T): T =>
    owner.slots.some((s) => settle(s) !== s) ? { ...owner, slots: owner.slots.map(settle) } : owner;

  const drawnFrames = frames.map(settled);
  let objects = kept.map(settled);

  // An object held only by a frame that is not drawn is still reachable. The views work
  // reachability out from what they are given, so such an object is handed over as `marked`
  // (found from a root), which they draw as live and never as unreachable.
  if (skipped.length > 0) {
    const fromDrawn = getReachable({ frames: drawnFrames, objects, ...roots });
    objects = objects.map((o) =>
      o.state === 'live' && reachable.has(o.id) && !fromDrawn.has(o.id)
        ? { ...o, state: 'marked' as const }
        : o
    );
  }

  return { counts, drawn: { frames: drawnFrames, objects, ...roots }, truncated: false };
}

// ---- The whole trace ----------------------------------------------------------------------

const cellKey = ({ col, row }: Cell) => `${col},${row}`;

/**
 * Prepares every step of a trace: what is drawn, and one cell per drawn object.
 *
 * An object keeps its cell for as long as it is drawn. While every object of the run fits, this
 * is exactly `placeTrace`. Once unreachable objects are being hidden, the cells they leave are
 * given out again, so a loop that allocates hundreds of short-lived objects still fits the
 * floor; a freed cell is reused only when no other is left, and never in the step that freed it
 * unless the floor is full.
 */
export function prepareTrace(steps: readonly Step[], options: LensOptions = {}): LensTrace {
  /** The cell each id had when it was last drawn. */
  const cells = new Map<string, Cell>();
  let before = new Set<string>();
  const out: LensStep[] = [];
  const drawnObjects: PlacedObject[] = [];

  const selections = steps.map((step) => selectStep(step, options));
  const cols = heapColsFor(Math.max(0, ...selections.map((s) => s.drawn?.objects.length ?? 0)));

  for (const { counts, drawn, truncated } of selections) {
    if (!drawn) {
      out.push({ status: 'too-large', counts, truncated });
      continue;
    }

    // Cells that stay with their object. An object seen in the previous step claims first, so
    // one that comes back after being hidden never pushes a newer object off its cell.
    const kept = new Map<string, Cell>();
    const taken = new Set<string>();
    const claim = (id: string) => {
      const cell = cells.get(id);
      if (!cell || kept.has(id) || taken.has(cellKey(cell))) return;
      kept.set(id, cell);
      taken.add(cellKey(cell));
    };
    for (const o of drawn.objects) if (before.has(o.id)) claim(o.id);
    for (const o of drawn.objects) claim(o.id);

    // First try to leave alone the cells of what was drawn a step ago and is hidden now.
    const resting = new Map(kept);
    for (const id of before) {
      const cell = cells.get(id);
      if (cell && !kept.has(id) && !taken.has(cellKey(cell))) resting.set(id, cell);
    }
    const bare = {
      frames: drawn.frames,
      objects: drawn.objects,
      ...(drawn.roots && { roots: drawn.roots }),
    };
    let placed = placeSnapshot(bare, { previous: resting, cols });
    if (resting.size > kept.size && gridOf(placed.snapshot.objects).rows > MAX_HEAP_ROWS) {
      placed = placeSnapshot(bare, { previous: kept, cols });
    }

    before = new Set();
    for (const o of placed.snapshot.objects) {
      cells.set(o.id, o.cell);
      before.add(o.id);
      drawnObjects.push(o);
    }
    out.push({ status: 'drawn', counts, snapshot: placed.snapshot });
  }

  return { steps: out, grid: gridOf(drawnObjects) };
}

// ---- Words --------------------------------------------------------------------------------

/** The one-line notes under the lens: what this step leaves out. */
export function notesFor(lens: LensStep, options: LensOptions = {}): string[] {
  const notes: string[] = [];
  const { framesNotShown, unreachableHidden } = lens.counts;
  // A step that is not drawn leaves nothing out of a drawing.
  if (lens.status === 'drawn') {
    if (framesNotShown > 0) notes.push(`${plural(framesNotShown, 'frame')} not shown`);
    if (unreachableHidden > 0) {
      notes.push(`${plural(unreachableHidden, 'unreachable object')} hidden`);
    }
  }
  if (options.heapRecorded === false) notes.push('Heap objects are not recorded for Python yet');
  return notes;
}

/** The calm message shown in place of a drawing that would be unreadable. */
export function tooLargeMessage(lens: LensStep): string {
  const { objects, reachable } = lens.counts;
  if (lens.status === 'too-large' && lens.truncated) {
    return `This step holds more than ${objects} heap objects, more than a trace records. The lens draws up to ${MAX_DRAWN_OBJECTS}.`;
  }
  return `This step holds ${plural(objects, 'heap object')}, ${reachable} of them reachable. The lens draws up to ${MAX_DRAWN_OBJECTS}.`;
}

/** What a focus key names, in words: an entity, or a slot of one. */
function changed(key: string, snapshot: Snapshot): string | null {
  const frame = snapshot.frames.find((f) => f.id === key);
  if (frame) return `frame ${frame.name}`;
  const object = snapshot.objects.find((o) => o.id === key);
  if (object) return `${object.label} #${object.id}`;
  for (const owner of [...snapshot.frames, ...snapshot.objects]) {
    if (!key.startsWith(`${owner.id}.`)) continue;
    const slot = owner.slots.find((s) => `${owner.id}.${s.name}` === key);
    if (slot) return `${slot.name} in ${'name' in owner ? owner.name : `#${owner.id}`}`;
  }
  return null;
}

/** How many names a description lists before it says "and N more". */
const MAX_LISTED = 4;

const listed = (names: string[]) =>
  names.length <= MAX_LISTED
    ? names.join(', ')
    : `${names.slice(0, MAX_LISTED).join(', ')} and ${names.length - MAX_LISTED} more`;

/**
 * The text alternative of a step: where it is, the frames, the heap, and what the step changed.
 * It describes the whole step, including what the drawing leaves out.
 */
export function describeStep(
  step: Step,
  lens: LensStep,
  position: { index: number; total: number },
  options: LensOptions = {}
): string {
  const { frames } = step.snapshot;
  const { counts } = lens;
  const parts = [`Step ${position.index + 1} of ${position.total}, line ${step.line}.`];

  const top = frames[frames.length - 1];
  parts.push(
    frames.length === 0
      ? 'Call stack: empty.'
      : `Call stack: ${plural(frames.length, 'frame')}, ${top.name} on top.`
  );
  if (counts.framesNotShown > 0) {
    parts.push(`${plural(counts.framesNotShown, 'frame')} in the middle not shown.`);
  }

  if (options.heapRecorded === false) {
    parts.push('Heap objects are not recorded for Python yet.');
  } else if (lens.status === 'too-large') {
    parts.push(`Heap: too large to draw. ${tooLargeMessage(lens)}`);
  } else {
    const unreachable = counts.objects - counts.reachable;
    parts.push(
      counts.objects === 0
        ? 'Heap: empty.'
        : `Heap: ${plural(counts.objects, 'object')}${unreachable > 0 ? `, ${unreachable} unreachable` : ''}.`
    );
    if (counts.unreachableHidden > 0) {
      parts.push(`${plural(counts.unreachableHidden, 'unreachable object')} hidden.`);
    }
  }

  const names = step.focus
    .map((key) => changed(key, step.snapshot))
    .filter((name): name is string => name !== null);
  if (names.length > 0) parts.push(`Changed: ${listed(names)}.`);

  return parts.join(' ');
}
