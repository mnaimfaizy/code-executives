/**
 * What the stack-and-queues lens draws for each step of a trace.
 *
 * A trace has no author (ADR 0004), so this file decides what stays legible: how many frames
 * and how many entries of each region are drawn, what is left out, the size every region keeps
 * for the whole run, which frame is running an entry taken from a queue, and the words that
 * describe a step.
 *
 * Pure data: no React, no three.js, no DOM.
 */

import type { QueueEntry, Slot, Snapshot, StackFrame } from '../../../../../shared/snapshot';
import {
  QUEUE_REGIONS,
  extentOf,
  hasQueues,
  type EventLoopExtent,
  type QueueRegion,
} from '../../../../../shared/components/viz/eventloop/layout';
import type { RunningEntry } from '../../../../../shared/components/viz/eventloop/types';
import type { Step } from '../../../tracer';
import { NOT_SHOWN, trimFrames } from './stackHeapLensModel';

// ---- Limits -------------------------------------------------------------------------------

/**
 * The most entries a step draws in one region; the rest are counted by a "+N more" line. Six
 * cards keep the drawing about as tall as five frames, the most the stack draws.
 */
export const MAX_DRAWN_ENTRIES = 6;

export { MAX_DRAWN_FRAMES, MIN_2D_SCALE } from './stackHeapLensModel';

// ---- Words --------------------------------------------------------------------------------

/** Shown wherever the queues are drawn: they are a model, not the engine's own queues. */
export const MODEL_NOTE =
  "The queues are the tracer's model of the specification, not the engine's own queues.";
/** Shown instead when the tracer could not follow the engine for this run. */
export const APPROXIMATE_NOTE =
  "The queues are the tracer's model of the specification; for this run the picture is approximate.";

const REGION_WORDS: Record<QueueRegion, { one: string; many: string; name: string }> = {
  microtasks: { one: 'microtask', many: 'microtasks', name: 'Microtask queue' },
  tasks: { one: 'task', many: 'tasks', name: 'Task queue' },
  timers: { one: 'timer', many: 'timers', name: 'Timers' },
};

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// ---- Types --------------------------------------------------------------------------------

export interface QueueStepCounts {
  frames: number;
  /** Frames folded into the placeholder. */
  framesNotShown: number;
  /** Entries each region holds, drawn or not. */
  entries: Record<QueueRegion, number>;
  /** Entries each region leaves out of the drawing. */
  more: Record<QueueRegion, number>;
  /** True when the tracer itself stopped recording a region's entries on this step. */
  truncated: boolean;
}

export interface QueueLensStep {
  /** What the views draw: trimmed frames, and at most `MAX_DRAWN_ENTRIES` entries a region. */
  snapshot: Snapshot;
  counts: QueueStepCounts;
  /** The entry whose callback this step's stack is running, when the trace shows it. */
  running?: RunningEntry;
}

export interface QueueLensTrace {
  /** One entry per step of the trace, in order. */
  steps: QueueLensStep[];
  /** What every drawn step fits in: pinned for the whole run. */
  extent: EventLoopExtent;
  /** False when no step of the trace records the queues: only frames are drawn. */
  recorded: boolean;
}

export interface QueueLensOptions {
  /** False when the run could not record heap objects (Python): it records no queues either. */
  heapRecorded?: boolean;
}

// ---- One step -----------------------------------------------------------------------------

/**
 * This lens draws no heap, so a slot that holds a reference names what it refers to instead of
 * pointing at it.
 */
function nameReferences(frames: readonly StackFrame[], full: Snapshot): StackFrame[] {
  const nameOf = (id: string) =>
    full.objects.find((o) => o.id === id)?.label ?? full.frames.find((f) => f.id === id)?.name;
  const settle = (slot: Slot): Slot =>
    slot.refId ? { name: slot.name, value: nameOf(slot.refId) ?? NOT_SHOWN } : slot;
  return frames.map((f) =>
    f.slots.some((s) => s.refId) ? { ...f, slots: f.slots.map(settle) } : f
  );
}

/** Chooses what one step draws. */
export function selectQueueStep(step: Step): Omit<QueueLensStep, 'running'> {
  const full = step.snapshot;
  const { frames, skipped } = trimFrames(full.frames);
  const snapshot: Snapshot = { frames: nameReferences(frames, full), objects: [] };

  const entries = { microtasks: 0, tasks: 0, timers: 0 };
  const more = { microtasks: 0, tasks: 0, timers: 0 };
  if (hasQueues(full)) {
    for (const region of QUEUE_REGIONS) {
      const all = full[region] ?? [];
      // The first to run are the ones kept: what is left out is always the back of the queue.
      snapshot[region] = all.slice(0, MAX_DRAWN_ENTRIES);
      entries[region] = all.length;
      more[region] = all.length - snapshot[region].length;
    }
  }

  return {
    snapshot,
    counts: {
      frames: full.frames.length,
      framesNotShown: skipped.length,
      entries,
      more,
      truncated: step.queuesTruncated === true,
    },
  };
}

// ---- The whole trace ----------------------------------------------------------------------

type Runnable = RunningEntry['from'];
const RUNNABLE: readonly Runnable[] = ['microtasks', 'tasks'];

/** The entry with this id as it last waited before step `at`, and the region it waited in. */
function lastWaiting(
  steps: readonly Step[],
  at: number,
  id: string
): { entry: QueueEntry; from: Runnable } | undefined {
  for (let i = at - 1; i >= 0; i--) {
    for (const region of QUEUE_REGIONS) {
      const entry = (steps[i].snapshot[region] ?? []).find((e) => e.id === id);
      // A timer that fired and ran within one step was a task in between.
      if (entry) return { entry, from: region === 'timers' ? 'tasks' : region };
    }
  }
  return undefined;
}

/**
 * For each step, the entry its stack is running, and the frame that runs it. The entry is
 * running for as long as that frame is on the stack.
 *
 * A trace names the entry a step started (`Step.entryId`). In a trace that never does, an
 * entry that was in the microtask queue or the task queue one step ago and is in neither now
 * was taken to run. Either way the frame is the one that step pushed, or the top frame when it
 * pushed none (an async function going on after an `await`). Nothing is claimed when a step
 * takes more than one entry, or leaves the stack empty.
 */
export function runningEntries(steps: readonly Step[]): (RunningEntry | undefined)[] {
  const out: (RunningEntry | undefined)[] = steps.map(() => undefined);
  const named = steps.some((s) => s.entryId !== undefined);
  let current: Required<RunningEntry> | undefined;

  for (let i = 0; i < steps.length; i++) {
    const prev = steps[i - 1]?.snapshot;
    const cur = steps[i].snapshot;
    const frameId = current?.frameId;
    if (frameId && !cur.frames.some((f) => f.id === frameId)) current = undefined;

    let taken: { entry: QueueEntry; from: Runnable }[] = [];
    if (named) {
      const id = steps[i].entryId;
      const found = id === undefined ? undefined : lastWaiting(steps, i, id);
      if (found) taken = [found];
    } else if (prev) {
      const waiting = new Set(RUNNABLE.flatMap((r) => cur[r] ?? []).map((e) => e.id));
      for (const from of RUNNABLE) {
        for (const entry of prev[from] ?? []) {
          if (!waiting.has(entry.id)) taken.push({ entry, from });
        }
      }
    }

    if (taken.length === 1) {
      const before = new Set((prev?.frames ?? []).map((f) => f.id));
      const pushed = cur.frames.find((f) => !before.has(f.id));
      const frame = pushed ?? (named ? cur.frames[cur.frames.length - 1] : undefined);
      current = frame ? { ...taken[0], frameId: frame.id } : undefined;
    } else if (taken.length > 1) {
      current = undefined;
    }
    out[i] = current;
  }
  return out;
}

/** Prepares every step of a trace: what is drawn, and the one extent every step is laid out in. */
export function prepareQueues(steps: readonly Step[]): QueueLensTrace {
  const running = runningEntries(steps);
  const prepared: QueueLensStep[] = steps.map((step, i) => {
    const selected = selectQueueStep(step);
    return running[i] ? { ...selected, running: running[i] } : selected;
  });
  return {
    steps: prepared,
    extent: extentOf(prepared.map((s) => s.snapshot)),
    recorded: steps.some((s) => hasQueues(s.snapshot)),
  };
}

// ---- Notes and descriptions ---------------------------------------------------------------

const notRecorded = (options: QueueLensOptions) =>
  options.heapRecorded === false
    ? 'The queues are not recorded for Python yet'
    : 'This run did not record the queues';

/** The one-line notes above the drawing: what this step leaves out. */
export function queueNotesFor(
  lens: QueueLensStep,
  trace: Pick<QueueLensTrace, 'recorded'>,
  options: QueueLensOptions = {}
): string[] {
  const notes: string[] = [];
  const { framesNotShown, more } = lens.counts;
  if (framesNotShown > 0) notes.push(`${plural(framesNotShown, 'frame')} not shown`);
  for (const region of QUEUE_REGIONS) {
    const { one, many } = REGION_WORDS[region];
    if (more[region] > 0) notes.push(`${plural(more[region], one, many)} not shown`);
  }
  if (lens.counts.truncated) notes.push('A region holds more entries than a trace records');
  if (!trace.recorded) notes.push(notRecorded(options));
  return notes;
}

/** How many labels a description lists before it says "and N more". */
const MAX_LISTED = 4;

/**
 * The text alternative of a step: where it is, the frames, each region in the order the loop
 * takes work, and what the step changed. It describes the whole step, including what the
 * drawing leaves out.
 */
export function describeQueueStep(
  step: Step,
  lens: QueueLensStep,
  position: { index: number; total: number },
  trace: Pick<QueueLensTrace, 'recorded'>,
  options: QueueLensOptions = {}
): string {
  const full = step.snapshot;
  const parts = [`Step ${position.index + 1} of ${position.total}, line ${step.line}.`];

  const top = full.frames[full.frames.length - 1];
  parts.push(
    top
      ? `Call stack: ${plural(full.frames.length, 'frame')}, ${top.name} on top.`
      : 'Call stack: empty.'
  );
  if (lens.running) {
    const { one } = REGION_WORDS[lens.running.from];
    parts.push(`Running the ${one} ${lens.running.entry.label}.`);
  }

  if (!trace.recorded) {
    parts.push(`${notRecorded(options)}.`);
  } else {
    for (const region of QUEUE_REGIONS) {
      const { name } = REGION_WORDS[region];
      const all = full[region] ?? [];
      if (all.length === 0) {
        parts.push(`${name}: empty.`);
        continue;
      }
      const listed = all.slice(0, MAX_LISTED).map((e) => e.label);
      const rest = all.length - listed.length;
      const lead = region === 'timers' ? 'soonest first' : 'next first';
      parts.push(
        `${name}: ${all.length}, ${lead}: ${listed.join(', ')}${rest > 0 ? ` and ${rest} more` : ''}.`
      );
    }
  }

  const changed = step.focus
    .map((key) => {
      for (const region of QUEUE_REGIONS) {
        const entry = (full[region] ?? []).find((e) => e.id === key);
        if (entry) return `${entry.label} in ${REGION_WORDS[region].name.toLowerCase()}`;
      }
      const frame = full.frames.find((f) => f.id === key);
      return frame ? `frame ${frame.name}` : null;
    })
    .filter((name): name is string => name !== null);
  if (changed.length > 0) parts.push(`Changed: ${changed.join(', ')}.`);

  return parts.join(' ');
}
