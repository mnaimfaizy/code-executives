import { describe, expect, it } from 'vitest';
import {
  QUEUE_REGIONS,
  regionsOf,
  running,
  runningEntry,
  slotKey,
  STORY_BEATS,
  STORY_CODE,
  STORY_OUTPUT,
  whereIs,
} from './eventLoopStory';
import type { ShotId } from './eventLoopStory';

const beat = (id: string) => STORY_BEATS.find((b) => b.id === id)!;
const indexOf = (id: string) => STORY_BEATS.findIndex((b) => b.id === id);
const codeLines = STORY_CODE.split('\n');
const words = (text: string) => text.trim().split(/\s+/).length;

const SHOTS: ShotId[] = ['overview', 'stack', 'timers-tasks', 'stack-microtasks', 'stack-tasks'];
const CALLBACKS = ['main', 'onTimeout', 'onResolved', 'onQueued'];
const ALL_IDS = ['global', ...CALLBACKS];

/** Ids in the order they first reach the top of the stack between two beats (both included). */
const startedBetween = (fromId: string, toId: string) => {
  const started: string[] = [];
  for (let i = indexOf(fromId); i <= indexOf(toId); i++) {
    const id = running(STORY_BEATS[i]);
    if (id !== undefined && id !== running(STORY_BEATS[i - 1])) started.push(id);
  }
  return started;
};

describe('event loop story model', () => {
  it('tells the approved 12 beats', () => {
    expect(STORY_BEATS.map((b) => b.id)).toEqual([
      'script-starts',
      'call-main',
      'timer-set',
      'timer-fires',
      'reaction-queued',
      'await-splits-main',
      'stack-empties',
      'microtask-before-task',
      'microtask-queues-microtask',
      'main-resumes',
      'late-microtask-still-first',
      'task-runs-last',
    ]);
    expect(new Set(STORY_BEATS.map((b) => b.id)).size).toBe(12);
  });

  it('walks a 15-line program', () => {
    expect(codeLines).toHaveLength(15);
  });

  it.each(STORY_BEATS)('$id is internally consistent', (b) => {
    expect(b.line).toBeGreaterThanOrEqual(1);
    expect(b.line).toBeLessThanOrEqual(codeLines.length);
    expect(words(b.title)).toBeLessThanOrEqual(8);
    expect(words(b.caption)).toBeLessThanOrEqual(60);
    expect(b.caption).not.toContain('`');
    expect(SHOTS).toContain(b.shot);

    // The heap is empty and all three queue regions are recorded, on every beat.
    expect(b.objects).toEqual([]);
    for (const region of QUEUE_REGIONS) expect(Array.isArray(b[region])).toBe(true);

    const keys = new Set<string>([
      ...b.frames.map((f) => f.id),
      ...b.frames.flatMap((f) => f.slots.map((s) => slotKey(f.id, s.name))),
      ...QUEUE_REGIONS.flatMap((region) => b[region].map((e) => e.id)),
    ]);
    expect(b.focus.length).toBeGreaterThan(0);
    for (const key of b.focus) expect(keys).toContain(key);

    // Only the entities of the spec's table, and no slot points anywhere.
    for (const key of keys) expect(ALL_IDS).toContain(key.split('.')[0]);
    for (const f of b.frames) for (const s of f.slots) expect(s.refId).toBeUndefined();

    // Only timers carry a delay.
    for (const region of QUEUE_REGIONS)
      for (const e of b[region]) expect(e.delay !== undefined).toBe(e.source === 'timeout');
  });

  it('points every beat at the line that names what the beat is about', () => {
    const expected: Record<string, string> = {
      'script-starts': 'main();',
      'call-main': 'main();',
      'timer-set': 'setTimeout(onTimeout, 0)',
      'timer-fires': 'setTimeout(onTimeout, 0)',
      'reaction-queued': '.then(onResolved)',
      'await-splits-main': 'await null',
      'stack-empties': "console.log('script end')",
      'microtask-before-task': "console.log('promise')",
      'microtask-queues-microtask': 'queueMicrotask(onQueued)',
      'main-resumes': "console.log('after await')",
      'late-microtask-still-first': "console.log('queued')",
      'task-runs-last': "console.log('timeout')",
    };
    for (const b of STORY_BEATS) expect(codeLines[b.line - 1]).toContain(expected[b.id]);
  });

  it('keeps one label, source and frame name per id across all beats', () => {
    const seen = new Map<string, string>();
    const check = (key: string, value: string) => {
      if (seen.has(key)) expect(value).toBe(seen.get(key));
      seen.set(key, value);
    };
    for (const b of STORY_BEATS) {
      for (const f of b.frames) check(`frame:${f.id}`, JSON.stringify(f));
      for (const region of QUEUE_REGIONS)
        for (const e of b[region]) check(`entry:${e.id}`, JSON.stringify(e));
    }
    expect(beat('script-starts').frames[0].slots).toEqual([
      { name: 'onTimeout', value: 'ƒ' },
      { name: 'onQueued', value: 'ƒ' },
      { name: 'onResolved', value: 'ƒ' },
      { name: 'main', value: 'ƒ' },
    ]);
  });

  it('asks the learner to predict on beat 7 only', () => {
    const asking = STORY_BEATS.filter((b) => b.caption.trim().endsWith('?')).map((b) => b.id);
    expect(asking).toEqual(['stack-empties']);
  });

  it('names the macrotask queue once, where the task queue is first named', () => {
    const first = STORY_BEATS.find((b) => b.caption.includes('task queue'))!;
    const naming = STORY_BEATS.filter((b) => b.caption.includes('macrotask')).map((b) => b.id);
    expect(naming).toEqual([first.id]);
  });

  // The spec's key claim, in its six numbered proofs.

  it('1. never runs a task while a microtask waits', () => {
    const tasksStarted = STORY_BEATS.filter((b, i) => {
      const id = running(b);
      const before = STORY_BEATS[i - 1];
      return id !== undefined && before !== undefined && whereIs(before, id) === 'tasks';
    });
    expect(tasksStarted.map((b) => b.id)).toEqual(['task-runs-last']);

    for (const b of tasksStarted) {
      const before = STORY_BEATS[STORY_BEATS.indexOf(b) - 1];
      expect(before.microtasks).toEqual([]);
      // The stack held the last microtask's frame, not a task's.
      expect(runningEntry(before)?.from).toBe('microtasks');
    }
  });

  it('2. keeps the timer in the task queue through the whole drain (aha #8, #11)', () => {
    const places = STORY_BEATS.map((b) => whereIs(b, 'onTimeout'));
    expect(places).toEqual([
      undefined,
      undefined,
      'timers',
      ...Array<string>(8).fill('tasks'),
      'stack',
    ]);
    // It is at the front of its queue the whole time, and still does not run.
    for (const b of STORY_BEATS.slice(3, 11)) expect(b.tasks[0].id).toBe('onTimeout');

    expect(startedBetween('stack-empties', 'task-runs-last')).toEqual([
      'onResolved',
      'main',
      'onQueued',
      'onTimeout',
    ]);
    // On the predict beat the task has waited longest: it was scheduled before either microtask.
    const firstWaiting = (id: string) =>
      STORY_BEATS.findIndex((b) => QUEUE_REGIONS.some((r) => b[r].some((e) => e.id === id)));
    expect(firstWaiting('onTimeout')).toBeLessThan(firstWaiting('onResolved'));
    expect(firstWaiting('onResolved')).toBeLessThan(firstWaiting('main'));
    expect(runningEntry(beat('microtask-before-task'))?.entry.id).toBe('onResolved');
  });

  it('3. queues the late microtask after the stack emptied, and runs it before the task (aha #11)', () => {
    expect(beat('stack-empties').frames).toEqual([]);
    expect(whereIs(beat('stack-empties'), 'onQueued')).toBeUndefined();
    expect(whereIs(beat('microtask-queues-microtask'), 'onQueued')).toBe('microtasks');
    expect(beat('microtask-queues-microtask').microtasks.at(-1)).toMatchObject({
      id: 'onQueued',
      source: 'queueMicrotask',
    });
    expect(running(beat('late-microtask-still-first'))).toBe('onQueued');
    expect(whereIs(beat('late-microtask-still-first'), 'onTimeout')).toBe('tasks');
    expect(indexOf('late-microtask-still-first')).toBeLessThan(indexOf('task-runs-last'));
  });

  it('4. splits main at the await and resumes it under the same id (aha #6)', () => {
    expect(running(beat('reaction-queued'))).toBe('main');

    const split = beat('await-splits-main');
    expect(split.frames.map((f) => f.id)).toEqual(['global']);
    expect(whereIs(split, 'main')).toBe('microtasks');
    expect(split.microtasks.map((e) => e.id)).toEqual(['onResolved', 'main']);
    expect(split.microtasks[1].source).toBe('await');

    const resumed = beat('main-resumes');
    expect(running(resumed)).toBe('main');
    expect(runningEntry(resumed)).toMatchObject({ from: 'microtasks', frameId: 'main' });
    expect(resumed.frames).toEqual(beat('call-main').frames.slice(1));
    // The first call of main was a plain call, not a queued callback.
    expect(runningEntry(beat('call-main'))).toBeUndefined();
  });

  it('5. empties each queue first in, first out', () => {
    const order = (region: 'microtasks' | 'tasks', pick: 'entered' | 'left') => {
      const ids: string[] = [];
      STORY_BEATS.forEach((b, i) => {
        const before = (STORY_BEATS[i - 1]?.[region] ?? []).map((e) => e.id);
        const now = b[region].map((e) => e.id);
        const changed =
          pick === 'entered'
            ? now.filter((id) => !before.includes(id))
            : before.filter((id) => !now.includes(id));
        ids.push(...changed);
        // Whoever leaves was at the front, and whoever joins goes to the back.
        if (pick === 'left') expect(changed).toEqual(before.slice(0, changed.length));
        else expect(changed).toEqual(now.slice(now.length - changed.length));
      });
      return ids;
    };
    expect(order('microtasks', 'entered')).toEqual(['onResolved', 'main', 'onQueued']);
    expect(order('microtasks', 'left')).toEqual(['onResolved', 'main', 'onQueued']);
    expect(order('tasks', 'entered')).toEqual(order('tasks', 'left'));

    // An entry that leaves a queue is the next thing on the stack.
    STORY_BEATS.forEach((b, i) => {
      const before = STORY_BEATS[i - 1];
      if (!before) return;
      for (const region of ['microtasks', 'tasks'] as const)
        for (const e of before[region])
          if (!b[region].some((x) => x.id === e.id)) expect(running(b)).toBe(e.id);
    });
  });

  it.each(STORY_BEATS)('6. $id holds no id in two regions at once', (b) => {
    for (const id of ALL_IDS) expect(regionsOf(b, id).length).toBeLessThanOrEqual(1);
    const ids = [
      ...b.frames.map((f) => f.id),
      ...QUEUE_REGIONS.flatMap((region) => b[region].map((e) => e.id)),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('follows each callback along the path the spec gives it', () => {
    const path = (id: string) =>
      STORY_BEATS.map((b) => whereIs(b, id)).filter(
        (place, i, all) => place !== undefined && place !== all[i - 1]
      );
    expect(path('global')).toEqual(['stack']);
    expect(path('main')).toEqual(['stack', 'microtasks', 'stack']);
    expect(path('onTimeout')).toEqual(['timers', 'tasks', 'stack']);
    expect(path('onResolved')).toEqual(['microtasks', 'stack']);
    expect(path('onQueued')).toEqual(['microtasks', 'stack']);
  });

  it('runs one callback at a time once the script has ended', () => {
    for (const b of STORY_BEATS.slice(indexOf('stack-empties'))) {
      expect(b.frames.length).toBeLessThanOrEqual(1);
      expect(whereIs(b, 'global')).toBeUndefined();
    }
  });

  it('prints what a real run of STORY_CODE prints, in that order', async () => {
    const printed: string[] = [];
    const fakeConsole = { log: (...args: unknown[]) => printed.push(args.join(' ')) };
    // The story's own program, run by this engine, with only `console` swapped for a recorder.
    const run = new Function('console', STORY_CODE) as (c: typeof fakeConsole) => void;
    run(fakeConsole);

    // Synchronously, only what ran before the stack emptied has printed.
    expect(printed).toEqual(STORY_OUTPUT.slice(0, 2));

    // A timer set after the story's 0 ms timer fires after it, so every callback has run by then.
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(printed).toEqual([
      'before await',
      'script end',
      'promise',
      'after await',
      'queued',
      'timeout',
    ]);
    expect(printed).toEqual([...STORY_OUTPUT]);
  });

  it('prints each line on the beat whose caption says so', () => {
    // Each printed line is quoted by the caption of the beat that prints it, in output order.
    const printedOn = STORY_OUTPUT.map((text) =>
      STORY_BEATS.findIndex(
        (b) => b.caption.includes(`prints '${text}'`) || b.caption.includes(`printing '${text}'`)
      )
    );
    expect(printedOn.every((i) => i >= 0)).toBe(true);
    expect([...printedOn].sort((a, b) => a - b)).toEqual(printedOn);
    // And that beat's line is the console.log that prints it.
    STORY_OUTPUT.forEach((text, n) => {
      const b = STORY_BEATS[printedOn[n]];
      if (b.id === 'await-splits-main') return; // its line is the await, one below the log
      expect(codeLines[b.line - 1]).toContain(`console.log('${text}')`);
    });
  });

  // The comparison with a Playground trace of STORY_CODE lives beside the tracer:
  // src/features/playground/tracer/queues.test.ts, 'the Event Loop story program'.
});
