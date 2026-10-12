/**
 * The Event Loop story: one beat model, rendered by both the 2D (SVG) and 3D (R3F) views.
 * Spec: docs/stories/javascript/event-loop.md
 *
 * Every beat is a full snapshot of the call stack, the microtask queue, the task queue and the
 * timers, taken after the beat's line has had its effect. A callback keeps one id from the
 * region where it waits to the frame it becomes, so a view moves it instead of swapping it.
 */

import type { QueueEntry, Snapshot, StackFrame } from '../../../shared/snapshot';

// The snapshot shape is shared with Playground traces (ADR 0004).
export type { QueueEntry, QueueSource, Slot, StackFrame } from '../../../shared/snapshot';
export { slotKey } from '../../../shared/snapshot';

export type ShotId = 'overview' | 'stack' | 'timers-tasks' | 'stack-microtasks' | 'stack-tasks';

/** The four regions a callback can be in. The names of the last three are the snapshot's fields. */
export type Region = 'stack' | 'microtasks' | 'tasks' | 'timers';

/** The regions that hold waiting callbacks, in the order the event loop takes work from them. */
export const QUEUE_REGIONS = ['microtasks', 'tasks', 'timers'] as const;
export type QueueRegion = (typeof QUEUE_REGIONS)[number];

/** A snapshot plus what the author wrote. This story records all three queue regions on every beat. */
export interface StoryBeat extends Snapshot {
  id: string;
  title: string;
  caption: string;
  /** 1-based line in STORY_CODE. */
  line: number;
  shot: ShotId;
  /** Frame ids, queue entry ids and slot keys (`owner.slot`) to spotlight on this beat. */
  focus: string[];
  /** Always empty: no variable in this program holds an object. */
  objects: [];
  microtasks: QueueEntry[];
  tasks: QueueEntry[];
  timers: QueueEntry[];
}

export const STORY_CODE = `function onTimeout() { console.log('timeout'); }
function onQueued() { console.log('queued'); }
function onResolved() {
  console.log('promise');
  queueMicrotask(onQueued);
}
async function main() {
  setTimeout(onTimeout, 0);
  Promise.resolve().then(onResolved);
  console.log('before await');
  await null;
  console.log('after await');
}
main();
console.log('script end');`;

/** What the run has printed by its end, in order. A snapshot does not hold the Console. */
export const STORY_OUTPUT = [
  'before await',
  'script end',
  'promise',
  'after await',
  'queued',
  'timeout',
] as const;

const globalFrame: StackFrame = {
  id: 'global',
  name: 'global',
  slots: [
    { name: 'onTimeout', value: 'ƒ' },
    { name: 'onQueued', value: 'ƒ' },
    { name: 'onResolved', value: 'ƒ' },
    { name: 'main', value: 'ƒ' },
  ],
};

// No function here takes a parameter or declares a variable, so these frames have no slots.
const frame = (id: string): StackFrame => ({ id, name: `${id}()`, slots: [] });
const mainFrame = frame('main');
const onResolvedFrame = frame('onResolved');
const onQueuedFrame = frame('onQueued');
const onTimeoutFrame = frame('onTimeout');

// The same callbacks, while they wait. Ids match the frames above.
const onTimeoutEntry: QueueEntry = {
  id: 'onTimeout',
  label: 'onTimeout',
  source: 'timeout',
  delay: 0,
};
const onResolvedEntry: QueueEntry = { id: 'onResolved', label: 'onResolved', source: 'promise' };
const mainEntry: QueueEntry = { id: 'main', label: 'main', source: 'await' };
const onQueuedEntry: QueueEntry = {
  id: 'onQueued',
  label: 'onQueued',
  source: 'queueMicrotask',
};

export const STORY_BEATS: StoryBeat[] = [
  {
    id: 'script-starts',
    title: 'The script starts as one task',
    caption:
      'The script starts as one task. The engine pushes the global frame, which holds the four functions. Nothing is waiting anywhere yet: the microtask queue, the task queue (also called the macrotask queue) and the timers are empty.',
    line: 14,
    shot: 'overview',
    frames: [globalFrame],
    objects: [],
    microtasks: [],
    tasks: [],
    timers: [],
    focus: ['global'],
  },
  {
    id: 'call-main',
    title: 'main() is called',
    caption:
      'main() is called. An async function starts like any other: it gets a frame on top of the stack and runs right away, on the same stack as its caller.',
    line: 14,
    shot: 'stack',
    frames: [globalFrame, mainFrame],
    objects: [],
    microtasks: [],
    tasks: [],
    timers: [],
    focus: ['main'],
  },
  {
    id: 'timer-set',
    title: 'setTimeout starts a timer',
    caption:
      'setTimeout(onTimeout, 0) does not call onTimeout. It starts a timer that holds the callback and returns at once. main continues to the next line.',
    line: 8,
    shot: 'timers-tasks',
    frames: [globalFrame, mainFrame],
    objects: [],
    microtasks: [],
    tasks: [],
    timers: [onTimeoutEntry],
    focus: ['onTimeout'],
  },
  {
    id: 'timer-fires',
    title: 'The timer fires into the task queue',
    caption:
      'Zero milliseconds are already over, so the timer fires. Firing does not run the callback either: it puts onTimeout in the task queue. It is first in line, and it has to wait, because the stack is not empty.',
    line: 8,
    shot: 'timers-tasks',
    frames: [globalFrame, mainFrame],
    objects: [],
    microtasks: [],
    tasks: [onTimeoutEntry],
    timers: [],
    focus: ['onTimeout'],
  },
  {
    id: 'reaction-queued',
    title: '.then queues a microtask',
    caption:
      'Promise.resolve() is already fulfilled, so .then(onResolved) queues its reaction straight away, in a different queue: the microtask queue. Two callbacks now wait, and onTimeout has waited longer.',
    line: 9,
    shot: 'stack-microtasks',
    frames: [globalFrame, mainFrame],
    objects: [],
    microtasks: [onResolvedEntry],
    tasks: [onTimeoutEntry],
    timers: [],
    focus: ['onResolved'],
  },
  {
    id: 'await-splits-main',
    title: 'await cuts main in two',
    caption:
      "main prints 'before await' and reaches await null. await does not hold the stack. It cuts main in two: the frame leaves the stack, and the rest of the function joins the microtask queue, behind onResolved. Control goes back to the caller.",
    line: 11,
    shot: 'stack-microtasks',
    frames: [globalFrame],
    objects: [],
    microtasks: [onResolvedEntry, mainEntry],
    tasks: [onTimeoutEntry],
    timers: [],
    focus: ['main'],
  },
  {
    id: 'stack-empties',
    title: 'The stack is empty: what runs next?',
    caption:
      "The script prints 'script end', before 'after await', and ends. The global frame is popped and the stack is empty. Three callbacks wait: two microtasks and one task. onTimeout has waited longest. Which one runs next?",
    line: 15,
    shot: 'overview',
    frames: [],
    objects: [],
    microtasks: [onResolvedEntry, mainEntry],
    tasks: [onTimeoutEntry],
    timers: [],
    focus: ['onResolved', 'main', 'onTimeout'],
  },
  {
    id: 'microtask-before-task',
    title: 'A microtask runs before the task',
    caption:
      "Not the timer. With the stack empty, the event loop takes the first microtask: onResolved gets a frame and prints 'promise'. The task queue is not looked at while a microtask is waiting, however long its task has waited.",
    line: 4,
    shot: 'stack-microtasks',
    frames: [onResolvedFrame],
    objects: [],
    microtasks: [mainEntry],
    tasks: [onTimeoutEntry],
    timers: [],
    focus: ['onResolved', 'onTimeout'],
  },
  {
    id: 'microtask-queues-microtask',
    title: 'A microtask queues another microtask',
    caption:
      'Still inside onResolved, queueMicrotask(onQueued) adds a new microtask at the back of the queue. It did not exist when the stack became empty. onTimeout is still waiting.',
    line: 5,
    shot: 'stack-microtasks',
    frames: [onResolvedFrame],
    objects: [],
    microtasks: [mainEntry, onQueuedEntry],
    tasks: [onTimeoutEntry],
    timers: [],
    focus: ['onQueued'],
  },
  {
    id: 'main-resumes',
    title: 'The rest of main resumes',
    caption:
      "onResolved returns and the stack is empty again. The next microtask is the rest of main: its frame goes back on the stack and it continues after the await, printing 'after await'. Resuming an async function is one more microtask.",
    line: 12,
    shot: 'stack-microtasks',
    frames: [mainFrame],
    objects: [],
    microtasks: [onQueuedEntry],
    tasks: [onTimeoutEntry],
    timers: [],
    focus: ['main'],
  },
  {
    id: 'late-microtask-still-first',
    title: 'The late microtask still goes first',
    caption:
      "main returns. The queue is not empty: onQueued, added during this same round, runs now and prints 'queued'. The event loop does not stop at the microtasks it started with. It keeps going until the queue is empty.",
    line: 2,
    shot: 'stack-microtasks',
    frames: [onQueuedFrame],
    objects: [],
    microtasks: [],
    tasks: [onTimeoutEntry],
    timers: [],
    focus: ['onQueued', 'onTimeout'],
  },
  {
    id: 'task-runs-last',
    title: 'The task runs last',
    caption:
      "Only now, with the stack and the microtask queue both empty, does the event loop take one task. onTimeout runs and prints 'timeout': asked for first, with 0 ms, and last to run. When it returns, nothing is left to run.",
    line: 1,
    shot: 'stack-tasks',
    frames: [onTimeoutFrame],
    objects: [],
    microtasks: [],
    tasks: [],
    timers: [],
    focus: ['onTimeout'],
  },
];

// Pure helpers shared by views and tests: derive facts, never store them twice.

export const isFocused = (beat: StoryBeat, key: string) => beat.focus.includes(key);

/** Every region that holds `id` on this beat. The model's tests prove it is never more than one. */
export const regionsOf = (beat: StoryBeat, id: string): Region[] => [
  ...(beat.frames.some((f) => f.id === id) ? (['stack'] as const) : []),
  ...QUEUE_REGIONS.filter((region) => beat[region].some((e) => e.id === id)),
];

/** The region `id` is in on this beat, or undefined when it is nowhere (not yet scheduled, or done). */
export const whereIs = (beat: StoryBeat, id: string): Region | undefined => regionsOf(beat, id)[0];

/** The id of the top frame: what the engine is running on this beat. Undefined when the stack is empty. */
export const running = (beat: StoryBeat): string | undefined => beat.frames.at(-1)?.id;

/**
 * The callback the stack is running and the queue it was taken from, found by looking back to
 * the last beat where it was still waiting. Undefined when the stack is empty or its top frame
 * was called directly (`global`, the first `main()`).
 *
 * Structurally an event loop view's `RunningEntry`, so a section can pass it straight through.
 */
export const runningEntry = (
  beat: StoryBeat,
  beats: readonly StoryBeat[] = STORY_BEATS
): { entry: QueueEntry; from: 'microtasks' | 'tasks'; frameId: string } | undefined => {
  const id = running(beat);
  if (id === undefined) return undefined;
  let i = beats.indexOf(beat) - 1;
  while (i >= 0 && whereIs(beats[i], id) === 'stack') i--;
  if (i < 0) return undefined;
  const from = whereIs(beats[i], id);
  if (from !== 'microtasks' && from !== 'tasks') return undefined;
  const entry = beats[i][from].find((e) => e.id === id);
  return entry && { entry, from, frameId: id };
};
