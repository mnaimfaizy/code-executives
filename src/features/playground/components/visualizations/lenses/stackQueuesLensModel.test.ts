import { describe, expect, it } from 'vitest';
import type { HeapObject, QueueEntry, Snapshot, StackFrame } from '../../../../../shared/snapshot';
import type { Step } from '../../../tracer';
import { MAX_DRAWN_FRAMES as STACK_HEAP_FRAMES, SKIPPED_FRAMES_ID } from './stackHeapLensModel';
import {
  APPROXIMATE_NOTE,
  MAX_DRAWN_ENTRIES,
  MAX_DRAWN_FRAMES,
  MODEL_NOTE,
  describeQueueStep,
  prepareQueues,
  queueNotesFor,
  runningEntries,
  selectQueueStep,
} from './stackQueuesLensModel';

const entry = (id: string, source: QueueEntry['source'] = 'promise', delay?: number): QueueEntry =>
  delay === undefined ? { id, label: `${id} callback`, source } : { id, label: id, source, delay };

const frame = (id: string, slots: StackFrame['slots'] = []): StackFrame => ({
  id,
  name: `${id}()`,
  slots,
});

/** A hand-written step that follows the snapshot contract: the tracer's own are not needed here. */
const step = (
  frames: StackFrame[],
  queues: Pick<Snapshot, 'microtasks' | 'tasks' | 'timers'> | null,
  extra: { focus?: string[]; line?: number; objects?: HeapObject[] } = {}
): Step => ({
  snapshot: { frames, objects: extra.objects ?? [], ...(queues ?? {}) },
  line: extra.line ?? 1,
  focus: extra.focus ?? [],
  kind: 'statement' as Step['kind'],
  consoleLength: 0,
  truncated: false,
});

const q = (microtasks: QueueEntry[] = [], tasks: QueueEntry[] = [], timers: QueueEntry[] = []) => ({
  microtasks,
  tasks,
  timers,
});

const G = frame('global');
const T1 = entry('t1', 'timeout', 0);
const M1 = entry('m1');
const M2 = entry('m2');

/** setTimeout, then a promise chain: the microtasks run before the task whose timer fired first. */
const DEMO: Step[] = [
  step([G], q()),
  step([G], q([], [], [T1]), { focus: ['t1'], line: 3 }),
  step([G], q([M1], [], [T1]), { focus: ['m1'], line: 6 }),
  step([G], q([M1], [T1], [])),
  step([], q([M1], [T1], [])),
  step([frame('c1')], q([], [T1], []), { focus: ['c1'] }),
  step([frame('c1'), frame('helper')], q([M2], [T1], []), { focus: ['m2'] }),
  step([], q([M2], [T1], [])),
  step([frame('c2')], q([], [T1], [])),
  step([], q([], [T1], [])),
  step([frame('c3')], q()),
  step([], q()),
];

describe('stackQueuesLensModel', () => {
  it('trims frames exactly as the stack-and-heap lens does', () => {
    expect(MAX_DRAWN_FRAMES).toBe(STACK_HEAP_FRAMES);
    const deep = Array.from({ length: 12 }, (_, i) => frame(`f${i}`));
    const lens = selectQueueStep(step(deep, q()));
    expect(lens.snapshot.frames).toHaveLength(MAX_DRAWN_FRAMES);
    expect(lens.snapshot.frames[1].id).toBe(SKIPPED_FRAMES_ID);
    expect(lens.counts).toMatchObject({ frames: 12, framesNotShown: 8 });
  });

  it('draws at most MAX_DRAWN_ENTRIES of a region, the first to run, and counts the rest', () => {
    const nine = Array.from({ length: 9 }, (_, i) => entry(`m${i}`));
    const lens = selectQueueStep(step([G], q(nine, [T1], [])));
    expect(lens.snapshot.microtasks!.map((e) => e.id)).toEqual(
      nine.slice(0, MAX_DRAWN_ENTRIES).map((e) => e.id)
    );
    expect(lens.counts.entries).toEqual({ microtasks: 9, tasks: 1, timers: 0 });
    expect(lens.counts.more).toEqual({ microtasks: 9 - MAX_DRAWN_ENTRIES, tasks: 0, timers: 0 });
    expect(lens.snapshot.tasks).toEqual([T1]);
    expect(lens.snapshot.timers).toEqual([]);
  });

  it('leaves the queue fields absent when the step did not record them', () => {
    const lens = selectQueueStep(step([G], null));
    expect(lens.snapshot).toEqual({ frames: [G], objects: [] });
    expect(lens.counts.more).toEqual({ microtasks: 0, tasks: 0, timers: 0 });
  });

  it('names what a reference slot refers to, because this lens draws no heap', () => {
    const user: HeapObject = {
      id: 'o1',
      label: 'Object',
      kind: 'object',
      slots: [],
      state: 'live',
    };
    const frames = [
      frame('global', [
        { name: 'user', refId: 'o1' },
        { name: 'count', value: '2' },
        { name: 'gone', refId: 'o9' },
      ]),
      frame('inner', [{ name: '[[outer]]', refId: 'global' }]),
    ];
    const lens = selectQueueStep(step(frames, q(), { objects: [user] }));
    expect(lens.snapshot.objects).toEqual([]);
    expect(lens.snapshot.frames[0].slots).toEqual([
      { name: 'user', value: 'Object' },
      { name: 'count', value: '2' },
      { name: 'gone', value: '(not shown)' },
    ]);
    expect(lens.snapshot.frames[1].slots).toEqual([{ name: '[[outer]]', value: 'global()' }]);
    // The step itself is left as it was recorded.
    expect(frames[0].slots[0]).toEqual({ name: 'user', refId: 'o1' });
  });

  it('pins one extent for the whole run', () => {
    const trace = prepareQueues(DEMO);
    expect(trace.recorded).toBe(true);
    expect(trace.steps).toHaveLength(DEMO.length);
    expect(trace.extent).toEqual({ frames: 2, slotRows: 2, microtasks: 1, tasks: 1, timers: 1 });

    const busy = Array.from({ length: 20 }, (_, i) => entry(`m${i}`));
    expect(prepareQueues([step([G], q(busy))]).extent.microtasks).toBe(MAX_DRAWN_ENTRIES);
  });

  it('knows a trace that records no queues at all', () => {
    const trace = prepareQueues([step([G], null), step([G, frame('main')], null)]);
    expect(trace.recorded).toBe(false);
    expect(queueNotesFor(trace.steps[0], trace)).toEqual(['This run did not record the queues']);
    expect(queueNotesFor(trace.steps[0], trace, { heapRecorded: false })).toEqual([
      'The queues are not recorded for Python yet',
    ]);
    expect(prepareQueues([]).recorded).toBe(false);
  });

  it('finds the entry a frame is running: it left its queue as that frame was pushed', () => {
    const running = runningEntries(DEMO);
    expect(running.map((r) => (r ? `${r.entry.id}:${r.from}:${r.frameId}` : null))).toEqual([
      null,
      null,
      null,
      null,
      null,
      'm1:microtasks:c1',
      // Still m1 while its frame is on the stack, whatever it calls.
      'm1:microtasks:c1',
      null,
      'm2:microtasks:c2',
      null,
      't1:tasks:c3',
      null,
    ]);
    expect(prepareQueues(DEMO).steps[10].running).toMatchObject({ entry: T1, from: 'tasks' });
    expect(prepareQueues(DEMO).steps[0]).not.toHaveProperty('running');
  });

  it('does not take a timer that fires, or an entry that only moves up, for one that runs', () => {
    const fires = [step([G], q([], [], [T1])), step([G, frame('f')], q([], [T1], []))];
    expect(runningEntries(fires)).toEqual([undefined, undefined]);
    const shuffles = [step([G], q([M1, M2])), step([G, frame('f')], q([M2, M1]))];
    expect(runningEntries(shuffles)).toEqual([undefined, undefined]);
  });

  it('claims nothing when a step pushes no frame or takes two entries at once', () => {
    const noFrame = [step([], q([M1])), step([], q())];
    expect(runningEntries(noFrame)).toEqual([undefined, undefined]);
    const two = [step([], q([M1, M2])), step([frame('c')], q())];
    expect(runningEntries(two)).toEqual([undefined, undefined]);
  });

  it('still sees an interval run when its timer is armed again in the same step', () => {
    const tick = entry('i1', 'interval', 100);
    const run = [step([], q([], [tick], [])), step([frame('onTick')], q([], [], [tick]))];
    expect(runningEntries(run)[1]).toMatchObject({ entry: tick, from: 'tasks', frameId: 'onTick' });
  });

  it('takes the tracer at its word when a trace names the entry a step started', () => {
    const started = (s: Step, entryId: string): Step => ({ ...s, entryId });
    const resume = entry('a1', 'await');
    const named: Step[] = [
      step([G], q([M1, resume], [], [T1])),
      // The global frame is still there when m1's callback is pushed.
      started(step([G, frame('c1')], q([resume], [], [T1])), 'm1'),
      step([G], q([resume], [], [T1])),
      // An async function going on: the tracer pushes its frame again.
      started(step([G, frame('load')], q([], [], [T1])), 'a1'),
      // A timer that fired and ran between two steps was never seen in the task queue.
      started(step([frame('tick')], q()), 't1'),
      step([frame('tick'), frame('inner')], q()),
      step([], q()),
    ];
    expect(
      runningEntries(named).map((r) => (r ? `${r.entry.id}:${r.from}:${r.frameId}` : null))
    ).toEqual([
      null,
      'm1:microtasks:c1',
      null,
      'a1:microtasks:load',
      't1:tasks:tick',
      't1:tasks:tick',
      null,
    ]);
    // An id the trace never showed waiting names nothing.
    expect(runningEntries([step([G], q()), started(step([G, frame('f')], q()), 'ghost')])).toEqual([
      undefined,
      undefined,
    ]);
  });

  it('says so when the tracer cut a region short', () => {
    const cut: Step = { ...step([G], q([M1])), queuesTruncated: true };
    const trace = prepareQueues([cut]);
    expect(trace.steps[0].counts.truncated).toBe(true);
    expect(queueNotesFor(trace.steps[0], trace)).toEqual([
      'A region holds more entries than a trace records',
    ]);
  });

  it('notes what a step leaves out, region by region', () => {
    const deep = Array.from({ length: 8 }, (_, i) => frame(`f${i}`));
    const lots = (n: number, p: string) => Array.from({ length: n }, (_, i) => entry(`${p}${i}`));
    const trace = prepareQueues([step(deep, q(lots(7, 'm'), lots(9, 't'), lots(6, 'x')))]);
    expect(queueNotesFor(trace.steps[0], trace)).toEqual([
      '4 frames not shown',
      '1 microtask not shown',
      '3 tasks not shown',
    ]);
    const calm = prepareQueues(DEMO);
    expect(queueNotesFor(calm.steps[2], calm)).toEqual([]);
  });

  it('says the queues are a model, in both wordings', () => {
    expect(MODEL_NOTE).toMatch(/tracer's model of the specification/);
    expect(APPROXIMATE_NOTE).toBe(
      "The queues are the tracer's model of the specification; for this run the picture is approximate."
    );
  });

  it('describes a step in the order the loop takes work', () => {
    const trace = prepareQueues(DEMO);
    const say = (i: number) =>
      describeQueueStep(DEMO[i], trace.steps[i], { index: i, total: DEMO.length }, trace);
    expect(say(2)).toBe(
      'Step 3 of 12, line 6. Call stack: 1 frame, global() on top. Microtask queue: 1, next first: m1 callback. Task queue: empty. Timers: 1, soonest first: t1. Changed: m1 callback in microtask queue.'
    );
    expect(say(5)).toBe(
      'Step 6 of 12, line 1. Call stack: 1 frame, c1() on top. Running the microtask m1 callback. Microtask queue: empty. Task queue: 1, next first: t1. Timers: empty. Changed: frame c1().'
    );
    expect(say(11)).toMatch(/Call stack: empty\. Microtask queue: empty\./);
  });

  it('describes everything a region holds, including what the drawing leaves out', () => {
    const nine = Array.from({ length: 9 }, (_, i) => entry(`m${i}`));
    const steps = [step([G], q(nine))];
    const trace = prepareQueues(steps);
    expect(describeQueueStep(steps[0], trace.steps[0], { index: 0, total: 1 }, trace)).toContain(
      'Microtask queue: 9, next first: m0 callback, m1 callback, m2 callback, m3 callback and 5 more.'
    );
    const bare = [step([G], null)];
    const none = prepareQueues(bare);
    expect(describeQueueStep(bare[0], none.steps[0], { index: 0, total: 1 }, none)).toBe(
      'Step 1 of 1, line 1. Call stack: 1 frame, global() on top. This run did not record the queues.'
    );
  });
});
