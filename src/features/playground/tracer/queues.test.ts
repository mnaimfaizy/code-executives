/**
 * The corpus of known orderings behind the tracer's model of the event loop (ADR 0004).
 *
 * Every program runs twice in its test: as written, on the engine alone, and traced. The
 * Console must agree, which shows the tracer did not reorder the run. Then the three regions
 * are compared, step by step, with what the specification says waits where.
 */
import { describe, expect, it } from 'vitest';
import { getReachable } from '../../../shared/snapshot';
import type { QueueEntry } from '../../../shared/snapshot';
import { STORY_BEATS, STORY_CODE, STORY_OUTPUT } from '../../javascript/utils/eventLoopStory';
import { startTrace } from './trace';
import { MAX_QUEUE_ENTRIES } from './types';
import type { Step, Trace } from './types';

const text = (args: unknown[]) =>
  args.map((arg) => (typeof arg === 'string' ? arg : String(arg))).join(' ');

/** What the code prints with no tracer near it, on real timers. `wait` covers its longest delay. */
async function printsUntraced(code: string, wait = 250): Promise<string[]> {
  const printed: string[] = [];
  const print = (...args: unknown[]) => void printed.push(text(args));
  new Function('console', code)({ log: print, error: print });
  await new Promise((resolve) => setTimeout(resolve, wait));
  return printed;
}

const labels = (entries: QueueEntry[] | undefined) => (entries ?? []).map((entry) => entry.label);

/** One step's regions: `M` the microtask queue, `T` the task queue, `W` the timers still waiting. */
const regionsOf = (step: Step): string => {
  const { microtasks, tasks, timers } = step.snapshot;
  return `M[${labels(microtasks)}] T[${labels(tasks)}] W[${labels(timers)}]`;
};

/** The regions through the run: one line each time they change, with the stack at that step. */
function timeline(trace: Trace): string[] {
  const out: string[] = [];
  let before = '';
  for (const step of trace.steps) {
    const now = regionsOf(step);
    if (now === before) continue;
    before = now;
    out.push(`${step.snapshot.frames.map((frame) => frame.name).join(' > ') || '(empty)'} ${now}`);
  }
  return out;
}

/** Runs the code both ways. The trace must be exact, and print what the engine alone prints. */
async function both(code: string, wait?: number): Promise<{ trace: Trace; printed: string[] }> {
  const [untraced, traced] = await Promise.all([
    printsUntraced(code, wait),
    (async () => {
      const run = startTrace(code);
      return { trace: await run.finished, printed: run.console };
    })(),
  ]);
  expect(traced.trace.error).toBeUndefined();
  expect(traced.trace.outcome).toBe('completed');
  expect(traced.printed).toEqual(untraced);
  expect(traced.trace.queuesApproximate).toBeUndefined();
  return traced;
}

/** A chain of `n` reactions that print `tick 1`, `tick 2`…: a ruler for counting microtasks. */
const TICKS = (n: number) =>
  'Promise.resolve()' +
  Array.from(
    { length: n },
    (_, i) => `.then(function tick${i + 1}() { console.log('tick ${i + 1}'); })`
  ).join('') +
  ';';

const CORPUS: Record<string, string> = {
  'sync, microtask, timer': `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,

  'two then chains take turns': `Promise.resolve(1)
  .then(function a(v) { console.log('a', v); return v + 1; })
  .then(function b(v) { console.log('b', v); });
Promise.resolve(10)
  .then(function c(v) { console.log('c', v); return v + 1; })
  .then(function d(v) { console.log('d', v); });`,

  'a then that returns a promise costs two more microtasks': `const start = Promise.resolve();
start
  .then(function first() { console.log('first'); return Promise.resolve('inner'); })
  .then(function second(v) { console.log('second', v); });
${TICKS(4)}`,

  'Promise.all waits for a timer': `const slow = new Promise((resolve) => setTimeout(function fire() { resolve('slow'); }, 40));
Promise.all([slow, Promise.resolve('fast'), 3]).then(function all(values) {
  console.log('all', values.join());
});
${TICKS(3)}`,

  'Promise.race settles with the first': `const slow = new Promise((resolve) => setTimeout(function fire() { resolve('slow'); }, 40));
Promise.race([slow, Promise.resolve('fast')]).then(function won(v) { console.log('race', v); });
${TICKS(3)}`,

  'Promise.allSettled keeps rejections': `Promise.allSettled([Promise.resolve(1), Promise.reject(new Error('no'))]).then(function settled(r) {
  console.log(r.map((x) => x.status).join());
});
${TICKS(3)}`,

  'await of a value that is no promise': `async function main() {
  console.log('before');
  const v = await 1;
  console.log('after', v);
}
main();
Promise.resolve().then(function reaction() { console.log('reaction'); });
console.log('end');`,

  'await of a resolved promise': `const ready = Promise.resolve('ready');
ready.then(function early() { console.log('early'); });
async function main() {
  const v = await ready;
  console.log('after', v);
}
main();
ready.then(function late() { console.log('late'); });
console.log('end');`,

  'await of a pending promise': `let open;
const gate = new Promise((resolve) => { open = resolve; });
async function main() {
  console.log('waiting');
  console.log('got', await gate);
}
main();
setTimeout(function opener() { console.log('opening'); open('key'); console.log('opened'); }, 30);
Promise.resolve().then(function reaction() { console.log('reaction'); });`,

  'an async function awaiting another': `async function inner() { console.log('inner'); return 'value'; }
async function outer() {
  console.log('outer start');
  const v = await inner();
  console.log('outer got', v);
}
outer().then(function done() { console.log('outer done'); });
${TICKS(3)}
console.log('end');`,

  'an async function that returns a promise': `async function wrapped() { return Promise.resolve('w'); }
wrapped().then(function got(v) { console.log(v); });
${TICKS(4)}`,

  'queueMicrotask shares the queue with reactions': `queueMicrotask(function one() { console.log('one'); queueMicrotask(function four() { console.log('four'); }); });
Promise.resolve().then(function two() { console.log('two'); });
queueMicrotask(function three() { console.log('three'); });
console.log('sync');`,

  'a rejection skips then, lands in catch, passes finally': `Promise.reject(new Error('boom'))
  .then(function skipped() { console.log('skipped'); })
  .catch(function caught(e) { console.log('caught', e.message); return 'ok'; })
  .finally(function cleanup() { console.log('finally'); })
  .then(function after(v) { console.log('after', v); });
${TICKS(7)}`,

  'a throw in then and a rejected await': `async function risky() {
  try {
    await Promise.reject(new Error('down'));
  } catch (error) {
    console.log('caught', error.message);
  } finally {
    console.log('cleanup');
  }
  throw new Error('late');
}
risky().catch(function last(e) { console.log('last', e.message); });
Promise.resolve()
  .then(function thrower() { throw new Error('thrown'); })
  .then(undefined, function handler(e) { console.log('handled', e.message); });
${TICKS(3)}`,

  'timers run by delay, then by registration': `setTimeout(function ninety() { console.log(90); }, 90);
setTimeout(function thirtyA() { console.log('30 a'); }, 30);
setTimeout(function sixty() { console.log(60); }, 60);
setTimeout(function zero() { console.log(0); }, 0);
setTimeout(function thirtyB() { console.log('30 b'); }, 30);
console.log('sync');`,

  'a timer set in a microtask and a microtask queued in a timer': `Promise.resolve().then(function micro() {
  console.log('micro');
  setTimeout(function fromMicro() { console.log('timer from micro'); }, 0);
});
setTimeout(function timer() {
  console.log('timer');
  Promise.resolve().then(function fromTimer() { console.log('micro from timer'); });
  queueMicrotask(function alsoFromTimer() { console.log('also from timer'); });
}, 0);
setTimeout(function last() { console.log('last'); }, 0);`,

  'clearTimeout removes a waiting timer and a fired one': `const waiting = setTimeout(function never() { console.log('never'); }, 60);
const fired = setTimeout(function neverEither() { console.log('never either'); }, 0);
setTimeout(function kept() { console.log('kept'); }, 30);
clearTimeout(waiting);
Promise.resolve().then(function clearer() { clearTimeout(fired); console.log('cleared'); });`,

  'an interval cleared after 3 turns': `let turns = 0;
const id = setInterval(function tick() {
  turns++;
  console.log('tick', turns);
  if (turns === 3) clearInterval(id);
}, 100);
setTimeout(function between() { console.log('between'); }, 150);`,

  'thenables are called in a microtask of their own': `const thenable = { then(resolve) { console.log('then called'); resolve('thenable'); } };
Promise.resolve(thenable).then(function got(v) { console.log('got', v); });
async function main() {
  console.log('awaited', await thenable);
}
main();
${TICKS(3)}
console.log('end');`,

  'a promise resolved with a promise, and several reactions on one promise': `const inner = new Promise((resolve) => setTimeout(function fire() { resolve('late'); }, 30));
const outer = new Promise((resolve) => { console.log('executor'); resolve(inner); });
outer.then(function one(v) { console.log('one', v); });
outer.then(function two(v) { console.log('two', v); });
inner.then(function direct(v) { console.log('direct', v); });
console.log('end');`,

  'timers inside timers, and Promise.any': `setTimeout(function outerTimer() {
  console.log('outer');
  setTimeout(function innerTimer() { console.log('inner'); }, 80);
  Promise.any([Promise.reject(new Error('x')), Promise.resolve('any')]).then(function anyDone(v) { console.log(v); });
}, 20);
setTimeout(function sibling() { console.log('sibling'); }, 60);`,

  'async arrows and methods keep this and their arguments': `const counter = {
  count: 2,
  async add(n) { await null; this.count += n; return this.count + arguments.length; },
};
const double = async (n) => (await n) * 2;
class Box {
  constructor() { this.v = 5; }
  async get() { return this.v; }
}
counter.add(3).then(function added(v) { console.log('added', v); });
double(4).then(function doubled(v) { console.log('doubled', v); });
new Box().get().then(function boxed(v) { console.log('boxed', v); });`,

  'a finally that returns a rejected promise': `Promise.resolve('fine')
  .finally(function spoil() { return Promise.reject(new Error('spoiled')); })
  .then(function unreached() { console.log('unreached'); }, function reason(e) { console.log('reason', e.message); });
${TICKS(6)}`,
};

/**
 * The regions of each corpus program, as `timeline` prints them. Each line was checked by hand
 * against the specification: what joins the microtask queue, the task queue or the timers, when.
 */
const EXPECTED: Record<string, string[]> = {
  'sync, microtask, timer': [
    'global M[] T[] W[]',
    'global M[] T[setTimeout callback] W[]',
    'global M[then callback] T[setTimeout callback] W[]',
    'anonymous() M[] T[setTimeout callback] W[]',
    'anonymous() M[] T[] W[]',
  ],
  'two then chains take turns': [
    'global M[] T[] W[]',
    'global M[a] T[] W[]',
    'global M[a,c] T[] W[]',
    'a(1) M[c] T[] W[]',
    'c(10) M[b] T[] W[]',
    'b(2) M[d] T[] W[]',
    'd(11) M[] T[] W[]',
  ],
  'a then that returns a promise costs two more microtasks': [
    'global M[] T[] W[]',
    'global M[first] T[] W[]',
    'global M[first,tick1] T[] W[]',
    'first() M[tick1] T[] W[]',
    'tick1() M[promise.then] T[] W[]',
    'tick2() M[resolve promise] T[] W[]',
    'tick3() M[second] T[] W[]',
    "second('inner') M[tick4] T[] W[]",
    'tick4() M[] T[] W[]',
  ],
  'Promise.all waits for a timer': [
    'global M[] T[] W[]',
    'global > anonymous(ƒ) M[] T[] W[fire]',
    'global M[Promise.all,Promise.all] T[] W[fire]',
    'global M[Promise.all,Promise.all,tick1] T[] W[fire]',
    'tick1() M[] T[] W[fire]',
    'fire() M[] T[] W[]',
    'fire() M[Promise.all] T[] W[]',
    'all([…]) M[] T[] W[]',
  ],
  'Promise.race settles with the first': [
    'global M[] T[] W[]',
    'global > anonymous(ƒ) M[] T[] W[fire]',
    'global M[resolve promise] T[] W[fire]',
    'global M[resolve promise,tick1] T[] W[fire]',
    'tick1() M[won] T[] W[fire]',
    "won('fast') M[tick2] T[] W[fire]",
    'tick2() M[] T[] W[fire]',
    'fire() M[] T[] W[]',
    'fire() M[resolve promise] T[] W[]',
  ],
  'Promise.allSettled keeps rejections': [
    'global M[] T[] W[]',
    'global M[Promise.allSettled,Promise.allSettled] T[] W[]',
    'global M[Promise.allSettled,Promise.allSettled,tick1] T[] W[]',
    'tick1() M[settled] T[] W[]',
    'settled([…]) M[tick2] T[] W[]',
    'tick2() M[] T[] W[]',
  ],
  'await of a value that is no promise': [
    'global M[] T[] W[]',
    'global M[main] T[] W[]',
    'global M[main,reaction] T[] W[]',
    'main() M[reaction] T[] W[]',
    'reaction() M[] T[] W[]',
  ],
  'await of a resolved promise': [
    'global M[] T[] W[]',
    'global M[early] T[] W[]',
    'global M[early,main] T[] W[]',
    'global M[early,main,late] T[] W[]',
    'early() M[main,late] T[] W[]',
    'main() M[late] T[] W[]',
    'late() M[] T[] W[]',
  ],
  'await of a pending promise': [
    'global M[] T[] W[]',
    'global M[] T[] W[opener]',
    'global M[reaction] T[] W[opener]',
    'reaction() M[] T[] W[opener]',
    'opener() M[] T[] W[]',
    'opener() M[main] T[] W[]',
    'main() M[] T[] W[]',
  ],
  'an async function awaiting another': [
    'global M[] T[] W[]',
    'global M[outer] T[] W[]',
    'global M[outer,tick1] T[] W[]',
    'outer() M[tick1] T[] W[]',
    'tick1() M[done] T[] W[]',
    'done() M[tick2] T[] W[]',
    'tick2() M[] T[] W[]',
  ],
  'an async function that returns a promise': [
    'global M[] T[] W[]',
    'global M[promise.then] T[] W[]',
    'global M[promise.then,tick1] T[] W[]',
    'tick1() M[resolve promise] T[] W[]',
    'tick2() M[got] T[] W[]',
    "got('w') M[tick3] T[] W[]",
    'tick3() M[] T[] W[]',
  ],
  'queueMicrotask shares the queue with reactions': [
    'global M[] T[] W[]',
    'global M[one] T[] W[]',
    'global M[one,two] T[] W[]',
    'global M[one,two,three] T[] W[]',
    'one() M[two,three] T[] W[]',
    'one() M[two,three,four] T[] W[]',
    'two() M[three,four] T[] W[]',
    'three() M[four] T[] W[]',
    'four() M[] T[] W[]',
  ],
  'a rejection skips then, lands in catch, passes finally': [
    'global M[] T[] W[]',
    'global M[then skipped] T[] W[]',
    'global M[then skipped,tick1] T[] W[]',
    'tick1() M[caught] T[] W[]',
    'caught({…}) M[tick2] T[] W[]',
    'tick2() M[cleanup] T[] W[]',
    'cleanup() M[tick3] T[] W[]',
    'tick3() M[finally passes on,promise.then] T[] W[]',
    'tick4() M[resolve promise] T[] W[]',
    'tick5() M[after] T[] W[]',
    "after('ok') M[tick6] T[] W[]",
    'tick6() M[] T[] W[]',
  ],
  'a throw in then and a rejected await': [
    'global M[] T[] W[]',
    'global M[risky] T[] W[]',
    'global M[risky,thrower] T[] W[]',
    'global M[risky,thrower,tick1] T[] W[]',
    'risky() M[thrower,tick1] T[] W[]',
    'thrower() M[tick1,last] T[] W[]',
    'tick1() M[last,handler] T[] W[]',
    'last({…}) M[handler,tick2] T[] W[]',
    'handler({…}) M[tick2] T[] W[]',
    'tick2() M[] T[] W[]',
  ],
  'timers run by delay, then by registration': [
    'global M[] T[] W[]',
    'global M[] T[] W[ninety]',
    'global M[] T[] W[thirtyA,ninety]',
    'global M[] T[] W[thirtyA,sixty,ninety]',
    'global M[] T[zero] W[thirtyA,sixty,ninety]',
    'global M[] T[zero] W[thirtyA,thirtyB,sixty,ninety]',
    'zero() M[] T[] W[thirtyA,thirtyB,sixty,ninety]',
    'thirtyA() M[] T[thirtyB] W[sixty,ninety]',
    'thirtyB() M[] T[] W[sixty,ninety]',
    'sixty() M[] T[] W[ninety]',
    'ninety() M[] T[] W[]',
  ],
  'a timer set in a microtask and a microtask queued in a timer': [
    'global M[] T[] W[]',
    'global M[micro] T[] W[]',
    'global M[micro] T[timer] W[]',
    'global M[micro] T[timer,last] W[]',
    'micro() M[] T[timer,last] W[]',
    'micro() M[] T[timer,last,fromMicro] W[]',
    'timer() M[] T[last,fromMicro] W[]',
    'timer() M[fromTimer] T[last,fromMicro] W[]',
    'timer() M[fromTimer,alsoFromTimer] T[last,fromMicro] W[]',
    'fromTimer() M[alsoFromTimer] T[last,fromMicro] W[]',
    'alsoFromTimer() M[] T[last,fromMicro] W[]',
    'last() M[] T[fromMicro] W[]',
    'fromMicro() M[] T[] W[]',
  ],
  'clearTimeout removes a waiting timer and a fired one': [
    'global M[] T[] W[]',
    'global M[] T[] W[never]',
    'global M[] T[neverEither] W[never]',
    'global M[] T[neverEither] W[kept,never]',
    'global M[] T[neverEither] W[kept]',
    'global M[clearer] T[neverEither] W[kept]',
    'clearer() M[] T[neverEither] W[kept]',
    'clearer() M[] T[] W[kept]',
    'kept() M[] T[] W[]',
  ],
  'an interval cleared after 3 turns': [
    'global M[] T[] W[]',
    'global M[] T[] W[tick]',
    'global M[] T[] W[tick,between]',
    'tick() M[] T[] W[between,tick]',
    'between() M[] T[] W[tick]',
    'tick() M[] T[] W[]',
  ],
  'thenables are called in a microtask of their own': [
    'global M[] T[] W[]',
    'global M[thenable.then] T[] W[]',
    'global M[thenable.then,thenable.then] T[] W[]',
    'global M[thenable.then,thenable.then,tick1] T[] W[]',
    'then(ƒ) M[thenable.then,tick1] T[] W[]',
    'then(ƒ) M[thenable.then,tick1,got] T[] W[]',
    'then(ƒ) M[tick1,got] T[] W[]',
    'then(ƒ) M[tick1,got,main] T[] W[]',
    'tick1() M[got,main] T[] W[]',
    "got('thenable') M[main,tick2] T[] W[]",
    'main() M[tick2] T[] W[]',
    'tick2() M[] T[] W[]',
  ],
  'a promise resolved with a promise, and several reactions on one promise': [
    'global M[] T[] W[]',
    'global > anonymous(ƒ) M[] T[] W[fire]',
    'global > anonymous(ƒ) M[promise.then] T[] W[fire]',
    'fire() M[] T[] W[]',
    'fire() M[direct,resolve promise] T[] W[]',
    "direct('late') M[resolve promise] T[] W[]",
    "one('late') M[two] T[] W[]",
    "two('late') M[] T[] W[]",
  ],
  'timers inside timers, and Promise.any': [
    'global M[] T[] W[]',
    'global M[] T[] W[outerTimer]',
    'global M[] T[] W[outerTimer,sibling]',
    'outerTimer() M[] T[] W[sibling]',
    'outerTimer() M[] T[] W[sibling,innerTimer]',
    'outerTimer() M[Promise.any,resolve promise] T[] W[sibling,innerTimer]',
    "anyDone('any') M[] T[] W[sibling,innerTimer]",
    'sibling() M[] T[] W[innerTimer]',
    'innerTimer() M[] T[] W[]',
  ],
  'async arrows and methods keep this and their arguments': [
    'global M[] T[] W[]',
    'global M[add] T[] W[]',
    'global M[add,double] T[] W[]',
    'global M[add,double,boxed] T[] W[]',
    'add(3) M[double,boxed] T[] W[]',
    'double(4) M[boxed,added] T[] W[]',
    'boxed(5) M[added,doubled] T[] W[]',
    'added(6) M[doubled] T[] W[]',
    'doubled(8) M[] T[] W[]',
  ],
  'a finally that returns a rejected promise': [
    'global M[] T[] W[]',
    'global M[spoil] T[] W[]',
    'global M[spoil,tick1] T[] W[]',
    'spoil() M[tick1] T[] W[]',
    'tick1() M[then skipped,promise.then] T[] W[]',
    'tick2() M[reject promise] T[] W[]',
    'tick3() M[reason] T[] W[]',
    'reason({…}) M[tick4] T[] W[]',
    'tick4() M[] T[] W[]',
  ],
};

describe('the corpus: orderings the specification fixes', () => {
  it('holds at least 20 programs, each with its regions', () => {
    expect(Object.keys(CORPUS).length).toBeGreaterThanOrEqual(20);
    expect(Object.keys(EXPECTED).sort()).toEqual(Object.keys(CORPUS).sort());
  });

  // The untraced program runs on real timers, which a busy machine fires late. An interval is
  // armed again from the moment it ran, so its timers are spaced wide and given longer to end;
  // a retry covers the rare run in which the engine's own timers still land out of order.
  const WAIT: Record<string, number> = { 'an interval cleared after 3 turns': 600 };

  for (const [name, code] of Object.entries(CORPUS)) {
    it(name, { retry: 2 }, async () => {
      const { trace } = await both(code, WAIT[name]);
      expect(timeline(trace)).toEqual(EXPECTED[name]);
      // What crossed to the host is plain data, and every step holds all three regions.
      expect(structuredClone(trace)).toEqual(trace);
      for (const step of trace.steps) {
        expect(step.snapshot.microtasks).toBeDefined();
        expect(step.snapshot.tasks).toBeDefined();
        expect(step.snapshot.timers).toBeDefined();
      }
    });
  }
});

describe('the Event Loop story program', () => {
  // docs/stories/javascript/event-loop.md: its code and what each beat has on screen.

  type Beat = [id: string, line: number, frames: string[], micro: string[], tasks: string[]];
  // Beat 3, `timer-set`, is the one a run cannot show: it has the 0 ms timer in `timers` for a
  // moment, and a trace has it in `tasks` from the first step after `setTimeout` returns.
  const BEATS: Beat[] = STORY_BEATS.filter((beat) => beat.id !== 'timer-set').map((beat) => [
    beat.id,
    beat.line,
    beat.frames.map((frame) => frame.name),
    labels(beat.microtasks),
    labels(beat.tasks),
  ]);

  it('prints in the story order and holds every beat a run can show, in order', async () => {
    const { trace, printed } = await both(STORY_CODE);
    expect(printed).toEqual([...STORY_OUTPUT]);

    let from = 0;
    for (const [id, line, frames, micro, tasks] of BEATS) {
      const wanted = JSON.stringify([line, frames, micro, tasks, []]);
      const at = trace.steps.findIndex(
        (step, index) =>
          index >= from &&
          JSON.stringify([
            step.line,
            step.snapshot.frames.map((frame) => frame.name),
            labels(step.snapshot.microtasks),
            labels(step.snapshot.tasks),
            labels(step.snapshot.timers),
          ]) === wanted
      );
      expect(at, `beat ${id}`).toBeGreaterThanOrEqual(0);
      from = at + 1;
    }
  });

  it('gives each entry the source and delay the story gives it', async () => {
    const { trace } = await both(STORY_CODE);
    const seen = new Map<string, QueueEntry>();
    for (const { snapshot } of trace.steps) {
      for (const entry of [...snapshot.microtasks!, ...snapshot.tasks!, ...snapshot.timers!]) {
        seen.set(entry.label, entry);
      }
    }
    const described = [...seen.values()].map(({ label, source, delay }) => ({
      label,
      source,
      delay,
    }));
    expect(described).toEqual([
      { label: 'onTimeout', source: 'timeout', delay: 0 },
      { label: 'onResolved', source: 'promise', delay: undefined },
      { label: 'main', source: 'await', delay: undefined },
      { label: 'onQueued', source: 'queueMicrotask', delay: undefined },
    ]);
  });
});

describe('entries, focus and the frame an entry becomes', () => {
  const code = CORPUS['sync, microtask, timer'];
  const where = (step: Step, id: string) =>
    (['microtasks', 'tasks', 'timers'] as const).filter((region) =>
      step.snapshot[region]!.some((entry) => entry.id === id)
    );

  it('keeps one id from joining a region to running, in focus when it joins and leaves', async () => {
    const { trace } = await both(code);
    const joined = trace.steps.find((step) => step.snapshot.tasks!.length === 1)!;
    const task = joined.snapshot.tasks![0];
    expect(joined.line).toBe(2);
    expect(joined.focus).toContain(task.id);
    expect(task).toEqual({
      id: task.id,
      label: 'setTimeout callback',
      source: 'timeout',
      delay: 0,
    });

    const queued = trace.steps.find((step) => step.snapshot.microtasks!.length === 1)!;
    const microtask = queued.snapshot.microtasks![0];
    expect(queued.line).toBe(3);
    expect(queued.focus).toContain(microtask.id);
    expect(queued.focus).not.toContain(task.id);

    // The step that pushes a callback's frame names the entry it was, and the entry is gone.
    const runs = trace.steps.filter((step) => step.entryId !== undefined);
    expect(runs.map((step) => [step.kind, step.entryId])).toEqual([
      ['call', microtask.id],
      ['call', task.id],
    ]);
    for (const step of runs) {
      expect(step.focus).toContain(step.entryId);
      expect(where(step, step.entryId!)).toEqual([]);
      expect(step.snapshot.frames).toHaveLength(1);
    }
    // In between, the entry is in exactly one region on every step.
    const first = trace.steps.indexOf(joined);
    const last = trace.steps.indexOf(runs[1]);
    for (const step of trace.steps.slice(first, last))
      expect(where(step, task.id)).toEqual(['tasks']);
  });

  it('names the entry an async function continues from on its next step', async () => {
    const { trace } = await both(CORPUS['await of a value that is no promise']);
    const waiting = trace.steps.find((step) => step.snapshot.microtasks!.length === 1)!;
    const entry = waiting.snapshot.microtasks![0];
    expect(entry).toEqual({ id: entry.id, label: 'main', source: 'await' });
    // The step of the `await` itself: the frame has left, the rest of the function waits.
    expect(waiting.line).toBe(3);
    expect(waiting.snapshot.frames.map((frame) => frame.name)).toEqual(['global']);
    const resumed = trace.steps.find((step) => step.entryId === entry.id)!;
    expect(resumed.kind).toBe('statement');
    expect(resumed.snapshot.frames.map((frame) => frame.name)).toEqual(['main()']);
  });

  it('pops the global frame when the script ends, and shows the empty stack when something waits', async () => {
    const { trace } = await both(code);
    const empty = trace.steps.filter((step) => step.snapshot.frames.length === 0);
    expect(empty).toHaveLength(1);
    expect(empty[0].kind).toBe('return');
    expect(empty[0].line).toBe(4);
    expect(regionsOf(empty[0])).toBe('M[then callback] T[setTimeout callback] W[]');
    const after = trace.steps.slice(trace.steps.indexOf(empty[0]) + 1);
    expect(after.length).toBeGreaterThan(0);
    for (const step of after) {
      expect(step.snapshot.frames.map((frame) => frame.name)).toEqual(['anonymous()']);
    }
  });

  it('leaves a program with nothing waiting as it was: its last step has the global frame', async () => {
    const run = startTrace('const a = 1;\nconst b = a + 1;');
    const trace = await run.finished;
    const end = trace.steps[trace.steps.length - 1];
    expect(end.snapshot.frames.map((frame) => frame.name)).toEqual(['global']);
    expect(end.snapshot).toMatchObject({ microtasks: [], tasks: [], timers: [] });
    expect(end.snapshot.roots).toBeUndefined();
    expect(trace.queuesApproximate).toBeUndefined();
  });
});

describe('roots: what the engine holds without a frame', () => {
  it('keeps what a global variable holds reachable after the script has ended', async () => {
    const { trace } = await both(`const list = [1, 2];
setTimeout(function later() { console.log('late', list.length); }, 10);`);
    const end = trace.steps[trace.steps.length - 1];
    expect(end.snapshot.frames.map((frame) => frame.name)).toEqual(['later()']);
    const globals = end.snapshot.objects.find((object) => object.label === 'global')!;
    expect(globals.kind).toBe('scope');
    expect(end.snapshot.roots).toEqual([globals.id]);
    const list = globals.slots.find((slot) => slot.name === 'list')!.refId!;
    expect(getReachable(end.snapshot).has(list)).toBe(true);
    // Without the root the array would look dropped: no frame points at it.
    expect(getReachable({ ...end.snapshot, roots: undefined }).has(list)).toBe(false);
    // The same slots as the frame had, and nothing refers to the scope: only the root holds it.
    const before = trace.steps.find(
      (step) => step.snapshot.frames[0]?.name === 'global' && step.line === 2
    )!;
    expect(globals.slots).toEqual(before.snapshot.frames[0].slots);
    for (const owner of [...end.snapshot.frames, ...end.snapshot.objects]) {
      expect(owner.slots.some((slot) => slot.refId === globals.id)).toBe(false);
    }
  });

  it('keeps what a closure waiting in a timer holds reachable', async () => {
    const { trace } = await both(`function arm() {
  const data = { n: 1 };
  setTimeout(() => console.log(data.n), 10);
}
arm();
const after = 1;`);
    const waiting = trace.steps.find((step) => step.snapshot.frames.length === 0)!;
    expect(labels(waiting.snapshot.timers)).toEqual(['setTimeout callback']);
    const closure = waiting.snapshot.objects.find((object) => object.kind === 'function')!;
    const data = waiting.snapshot.objects.find((object) => object.kind === 'object')!;
    expect(waiting.snapshot.roots).toContain(closure.id);
    expect(getReachable(waiting.snapshot).has(data.id)).toBe(true);
    expect(getReachable({ ...waiting.snapshot, roots: undefined }).has(data.id)).toBe(false);
  });
});

describe('the virtual clock', () => {
  it('finishes a run with a 5 second timer at once, and its code sees 5 seconds pass', async () => {
    const started = performance.now();
    const run = startTrace(`const start = Date.now();
const t0 = performance.now();
setTimeout(function later() {
  console.log(Date.now() - start, performance.now() - t0, new Date().getTime() - start);
}, 5000);
console.log(Date.now() - start);`);
    const trace = await run.finished;
    expect(performance.now() - started).toBeLessThan(1000);
    expect(trace.outcome).toBe('completed');
    expect(run.console).toEqual(['0', '5000 5000 5000']);
    const waiting = trace.steps.find((step) => step.snapshot.timers!.length === 1)!;
    expect(waiting.snapshot.timers![0]).toMatchObject({ label: 'later', delay: 5000 });
  });

  it('ends an interval that is never cleared at the step limit, with its steps', async () => {
    const run = startTrace('let n = 0;\nsetInterval(function tick() {\n  n++;\n}, 10);', {
      maxSteps: 60,
    });
    const trace = await run.finished;
    expect(trace.outcome).toBe('step-limit');
    expect(trace.steps).toHaveLength(60);
    expect(trace.queuesApproximate).toBeUndefined();
    const end = trace.steps[trace.steps.length - 1];
    // The next turn was already waiting when the run was stopped.
    expect(end.snapshot.timers).toEqual([
      { id: expect.any(String), label: 'tick', source: 'interval', delay: 10 },
    ]);
  });

  it('ends an interval whose callback records no step, too', async () => {
    const run = startTrace('setInterval(Math.random, 10);', { maxSteps: 40 });
    const trace = await run.finished;
    expect(trace.outcome).toBe('step-limit');
    expect(trace.steps.length).toBeLessThan(40);
  });
});

describe('limits', () => {
  it('stops a microtask that keeps queueing microtasks at the step limit: the task never runs', async () => {
    const run = startTrace(
      `function again() {
  Promise.resolve().then(again);
}
again();
setTimeout(function starved() { console.log('never'); }, 0);`,
      { maxSteps: 200 }
    );
    const trace = await run.finished;
    expect(trace.outcome).toBe('step-limit');
    expect(trace.steps).toHaveLength(200);
    expect(run.console).toEqual([]);
    expect(trace.queuesApproximate).toBeUndefined();
    const armed = trace.steps.findIndex((step) => step.snapshot.tasks!.length > 0);
    expect(armed).toBeGreaterThan(0);
    for (const step of trace.steps.slice(armed)) {
      expect(labels(step.snapshot.tasks)).toEqual(['starved']);
    }
  });

  it('caps the entries of a region and says so on the step', async () => {
    const { trace, printed } = await both(`for (let i = 0; i < ${MAX_QUEUE_ENTRIES + 5}; i++) {
  setTimeout(function timer() { console.log(i); }, 20);
}`);
    expect(printed).toHaveLength(MAX_QUEUE_ENTRIES + 5);
    const fullest = trace.steps.find((step) => step.snapshot.frames.length === 0)!;
    expect(fullest.snapshot.timers).toHaveLength(MAX_QUEUE_ENTRIES);
    expect(fullest.queuesTruncated).toBe(true);
    expect(trace.steps[0].queuesTruncated).toBeUndefined();
    expect(trace.steps[trace.steps.length - 1].queuesTruncated).toBeUndefined();
  });
});

describe('the self-check', () => {
  /** Like `both`, for a program the model is not expected to follow. */
  async function approximately(code: string) {
    const [untraced, run] = await Promise.all([printsUntraced(code), startTrace(code)]);
    const trace = await run.finished;
    expect(trace.outcome).toBe('completed');
    expect(run.console).toEqual(untraced);
    return trace;
  }

  it('marks the trace when the engine runs a reaction the model did not have in its queue', async () => {
    // The promise an async generator returns is made by the engine, out of the tracer's sight.
    const trace = await approximately(`async function* feed() { yield 1; yield 2; }
const reader = feed();
reader.next().then(function got(result) { console.log('got', result.value); });
Promise.resolve().then(function plain() { console.log('plain'); });
setTimeout(function later() { console.log('later'); }, 0);`);
    expect(trace.queuesApproximate).toBe(true);
    // The run went on, and the model is sane again afterwards.
    const end = trace.steps[trace.steps.length - 1];
    expect(end.snapshot.frames.map((frame) => frame.name)).toEqual(['later()']);
    expect(regionsOf(end)).toBe('M[] T[] W[]');
  });

  it('marks the trace for a `for await` loop, whose waits it does not model', async () => {
    const trace = await approximately(`async function read() {
  for await (const item of [1, Promise.resolve(2)]) console.log('item', item);
  console.log('read');
}
read();
Promise.resolve().then(function plain() { console.log('plain'); });`);
    expect(trace.queuesApproximate).toBe(true);
  });
});
