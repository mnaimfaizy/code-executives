import { afterEach, describe, expect, it, vi } from 'vitest';
import { getReferences, slotKey } from '../../../shared/snapshot';
import type { HeapObject, Slot, StackFrame } from '../../../shared/snapshot';
import { startTrace, traceSync } from './trace';
import {
  DEFAULT_MAX_STEPS,
  MAX_HEAP_OBJECTS,
  MAX_SLOTS,
  MAX_STRING_LENGTH,
  MORE_SLOTS,
  UNINITIALISED,
} from './types';
import type { Step, Trace } from './types';

const lastStep = (trace: Trace): Step => trace.steps[trace.steps.length - 1];
const frameNames = (step: Step) => step.snapshot.frames.map((frame) => frame.name);
const frameOf = (step: Step, name: string): StackFrame =>
  step.snapshot.frames.find((frame) => frame.name === name)!;
const slotOf = (owner: { slots: Slot[] }, name: string): Slot =>
  owner.slots.find((slot) => slot.name === name)!;
const objectOf = (step: Step, id: string | undefined): HeapObject =>
  step.snapshot.objects.find((object) => object.id === id)!;
/** What a slot of `owner` points at. */
const follow = (step: Step, owner: { slots: Slot[] }, name: string): HeapObject =>
  objectOf(step, slotOf(owner, name).refId);
const values = (owner: { slots: Slot[] }) =>
  Object.fromEntries(owner.slots.map((slot) => [slot.name, slot.value ?? `→${slot.refId}`]));

afterEach(() => {
  vi.useRealTimers();
});

/** Runs the code, then lets its timers and promise reactions run. */
async function traceToTheEnd(code: string) {
  vi.useFakeTimers();
  const run = startTrace(code);
  await vi.advanceTimersByTimeAsync(5000);
  return run;
}

describe('identity', () => {
  it('gives two variables that hold one array the same reference', () => {
    const trace = traceSync(`const a = [1, 2];
const b = a;
b.push(3);
const c = [...a];`);
    const end = lastStep(trace);
    const global = frameOf(end, 'global');
    expect(slotOf(global, 'a').refId).toBeDefined();
    expect(slotOf(global, 'b').refId).toBe(slotOf(global, 'a').refId);
    expect(slotOf(global, 'c').refId).not.toBe(slotOf(global, 'a').refId);
    expect(values(follow(end, global, 'a'))).toEqual({ 0: '1', 1: '2', 2: '3' });
    expect(end.snapshot.objects).toHaveLength(2);
  });

  it('keeps an id for the whole run', () => {
    const trace = traceSync(`const list = [];
list.push(1);
list.push(2);
const other = { list };`);
    const ids = trace.steps
      .map((step) => slotOf(frameOf(step, 'global'), 'list').refId)
      .filter(Boolean);
    expect(ids.length).toBeGreaterThan(2);
    expect(new Set(ids).size).toBe(1);
  });

  it('draws a cycle as two references', () => {
    const trace = traceSync(`const a = { name: 'a' };
const b = { name: 'b', other: a };
a.other = b;`);
    const end = lastStep(trace);
    const global = frameOf(end, 'global');
    const a = follow(end, global, 'a');
    const b = follow(end, global, 'b');
    expect(slotOf(a, 'other').refId).toBe(b.id);
    expect(slotOf(b, 'other').refId).toBe(a.id);
    expect(end.snapshot.objects).toHaveLength(2);
    expect(trace.outcome).toBe('completed');
  });

  it('keeps an object the program dropped, and never marks or removes it', () => {
    const trace = traceSync(`let user = { name: 'Ada' };
user = null;
const done = true;`);
    const end = lastStep(trace);
    expect(slotOf(frameOf(end, 'global'), 'user').value).toBe('null');
    expect(end.snapshot.objects).toHaveLength(1);
    expect(end.snapshot.objects[0].state).toBe('live');
    expect(getReferences(end.snapshot)).toHaveLength(0);
  });
});

describe('frames', () => {
  it('gives every frame on the stack its own slots', () => {
    const trace = traceSync(`function fact(n) {
  if (n <= 1) return 1;
  const rest = fact(n - 1);
  return n * rest;
}
fact(3);`);
    const deepest = trace.steps.find((step) => step.snapshot.frames.length === 4)!;
    expect(frameNames(deepest)).toEqual(['global', 'fact(3)', 'fact(2)', 'fact(1)']);
    expect(deepest.snapshot.frames.slice(1).map(values)).toEqual([
      { n: '3', rest: UNINITIALISED },
      { n: '2', rest: UNINITIALISED },
      { n: '1', rest: UNINITIALISED },
    ]);
    const unwinding = trace.steps.find(
      (step) => step.kind === 'return' && step.snapshot.frames.length === 3
    )!;
    expect(values(frameOf(unwinding, 'fact(2)'))).toEqual({ n: '2', rest: '1' });
    expect(new Set(deepest.snapshot.frames.map((frame) => frame.id)).size).toBe(4);
  });

  it('records a call step on the calling line and a return step before the frame pops', () => {
    const trace = traceSync(`function double(x) {
  return x * 2;
}
const four = double(2);`);
    expect(trace.steps.map((step) => [step.kind, step.line, frameNames(step)])).toEqual([
      ['call', 4, ['global']],
      ['call', 4, ['global', 'double(2)']],
      ['return', 2, ['global', 'double(2)']],
      ['statement', 4, ['global']],
    ]);
    expect(values(frameOf(lastStep(trace), 'global'))).toEqual({ double: 'ƒ', four: '4' });
  });

  it('shows primitives as short display strings', () => {
    const trace = traceSync(`const s = 'hi';
const n = 1.5;
const b = true;
const u = undefined;
const z = null;
const big = 10n;
const sym = Symbol('id');`);
    expect(values(frameOf(lastStep(trace), 'global'))).toEqual({
      s: "'hi'",
      n: '1.5',
      b: 'true',
      u: 'undefined',
      z: 'null',
      big: '10n',
      sym: 'Symbol(id)',
    });
  });

  it('shows a variable in its temporal dead zone as uninitialised', () => {
    const trace = traceSync(`const first = 1;
let second;
const third = first + 1;`);
    expect(values(frameOf(trace.steps[0], 'global'))).toEqual({
      first: UNINITIALISED,
      second: UNINITIALISED,
      third: UNINITIALISED,
    });
    expect(values(frameOf(trace.steps[2], 'global'))).toEqual({
      first: '1',
      second: 'undefined',
      third: UNINITIALISED,
    });
  });

  it('shows a var as undefined from the start, wherever it is declared', () => {
    const trace = traceSync(`function f() {
  if (true) {
    var late = 1;
  }
  return late;
}
f();`);
    const called = trace.steps.find((step) => step.kind === 'call' && step.snapshot.frames[1])!;
    expect(values(frameOf(called, 'f()'))).toEqual({ late: 'undefined' });
  });
});

describe('functions, wherever they are written', () => {
  it('traces a callback that a built-in calls', () => {
    const trace = traceSync(`const prices = [10, 20];
const doubled = prices.map((price) => price * 2);`);
    const calls = trace.steps.filter((step) => step.kind === 'call' && step.snapshot.frames[1]);
    expect(calls.map(frameNames)).toEqual([
      ['global', 'anonymous(10)'],
      ['global', 'anonymous(20)'],
    ]);
    expect(calls.every((step) => step.line === 2)).toBe(true);
    const end = lastStep(trace);
    expect(values(follow(end, frameOf(end, 'global'), 'doubled'))).toEqual({ 0: '20', 1: '40' });
  });

  it('traces function expressions, arrows and expression-bodied arrows by their names', () => {
    const trace = traceSync(`const add = function (a, b) { return a + b; };
const inc = (n) => add(n, 1);
const twice = (n) => {
  return inc(inc(n));
};
twice(1);`);
    const names = new Set(trace.steps.flatMap(frameNames));
    expect([...names]).toEqual([
      'global',
      'twice(1)',
      'inc(1)',
      'add(1, 1)',
      'inc(2)',
      'add(2, 1)',
    ]);
  });

  it('traces object methods with their receiver', () => {
    const trace = traceSync(`const user = {
  name: 'Ada',
  greet() { return 'hi ' + this.name; },
  shout: function () { return this.greet().toUpperCase(); },
};
user.shout();`);
    const inner = trace.steps.find((step) => step.snapshot.frames.length === 3)!;
    expect(frameNames(inner)).toEqual(['global', 'shout()', 'greet()']);
    const user = slotOf(frameOf(inner, 'global'), 'user').refId;
    expect(user).toBeDefined();
    expect(slotOf(frameOf(inner, 'greet()'), 'this').refId).toBe(user);
    expect(slotOf(frameOf(inner, 'shout()'), 'this').refId).toBe(user);
  });

  it('traces class constructors and methods', () => {
    const trace = traceSync(`class Counter {
  constructor(start) { this.n = start; }
  inc() { this.n++; return this; }
  static from(n) { return new Counter(n); }
}
const c = Counter.from(5);
c.inc().inc();`);
    const names = [...new Set(trace.steps.flatMap(frameNames))];
    expect(names).toEqual(['global', 'Counter.from(5)', 'new Counter(5)', 'Counter.inc()']);
    const end = lastStep(trace);
    const counter = follow(end, frameOf(end, 'global'), 'c');
    expect(counter.label).toBe('Counter');
    expect(values(counter)).toEqual({ n: '7' });
    expect(slotOf(frameOf(end, 'global'), 'Counter').value).toBe('class');
  });

  it('draws the scope a closure retains, and updates it in place', () => {
    const trace = traceSync(`function makeCounter() {
  let count = 0;
  return () => {
    count++;
    return count;
  };
}
const next = makeCounter();
next();
next();`);
    const end = lastStep(trace);
    const next = follow(end, frameOf(end, 'global'), 'next');
    expect(next.kind).toBe('function');
    const scope = follow(end, next, '[[scope]]');
    expect(scope.kind).toBe('scope');
    expect(scope.label).toBe('makeCounter() scope');
    expect(values(scope)).toEqual({ count: '2' });

    // While makeCounter is still running, the closure points at its frame, not at the heap.
    const returning = trace.steps.find(
      (step) => step.kind === 'return' && frameOf(step, 'makeCounter()')
    )!;
    expect(returning.snapshot.objects.some((object) => object.kind === 'scope')).toBe(false);
    // A step inside the closure changes a slot of the retained scope, which keeps the id the
    // frame had: line 2 changed it as a frame, line 4 as a scope on the heap.
    const counted = trace.steps.filter((step) => step.focus.includes(slotKey(scope.id, 'count')));
    expect(counted.map((step) => step.line)).toEqual([2, 4, 4]);
  });

  it('gives each turn of a loop its own scope for closures to retain', () => {
    const trace = traceSync(`const fns = [];
for (let i = 0; i < 3; i++) {
  fns.push(() => i);
}
const seen = fns.map((fn) => fn());`);
    const end = lastStep(trace);
    const fns = follow(end, frameOf(end, 'global'), 'fns');
    const retained = fns.slots.map((slot) =>
      values(follow(end, objectOf(end, slot.refId), '[[scope]]'))
    );
    expect(retained).toEqual([{ i: '0' }, { i: '1' }, { i: '2' }]);
  });

  it('runs generators, with a frame that leaves the stack at each yield', () => {
    const run = startTrace(`function* ids() {
  let n = 0;
  while (n < 2) {
    yield n++;
  }
}
const seen = [];
for (const id of ids()) {
  seen.push(id);
}
console.log(seen.join());`);
    const trace = run.getTrace();
    expect(trace.outcome).toBe('completed');
    expect(run.console).toEqual(['0,1']);
    const pushing = trace.steps.filter((step) => step.line === 9);
    expect(pushing.length).toBeGreaterThan(0);
    for (const step of pushing) expect(frameNames(step)).toEqual(['global']);
    expect(trace.steps.some((step) => frameNames(step).join() === 'global,ids()')).toBe(true);
  });
});

describe('block scopes', () => {
  it('shows a loop variable while the loop runs and drops it afterwards', () => {
    const trace = traceSync(`function sum(list) {
  let total = 0;
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    total += item;
  }
  return total;
}
sum([4, 5]);`);
    const inLoop = trace.steps.filter((step) => step.line === 5);
    expect(inLoop.map((step) => values(step.snapshot.frames[1]))).toEqual([
      expect.objectContaining({ total: '4', i: '0', item: '4' }),
      expect.objectContaining({ total: '9', i: '1', item: '5' }),
    ]);
    // The head runs again each turn: that step shows the new `i` and a fresh `item`.
    const heads = trace.steps.filter((step) => step.line === 3);
    expect(heads.map((step) => values(step.snapshot.frames[1]).i)).toEqual(['0', '1']);
    expect(values(heads[1].snapshot.frames[1]).item).toBe(UNINITIALISED);
    const returned = trace.steps.find((step) => step.kind === 'return')!;
    expect(returned.line).toBe(7);
    expect(Object.keys(values(returned.snapshot.frames[1]))).toEqual(['list', 'total']);
  });

  it('lets an inner declaration shadow an outer one in the same frame', () => {
    const trace = traceSync(`const x = 1;
{
  const x = 2;
  console.log(x);
}
console.log(x);`);
    const inner = trace.steps.find((step) => step.line === 4)!;
    expect(values(frameOf(inner, 'global'))).toEqual({ x: '2' });
    expect(values(frameOf(lastStep(trace), 'global'))).toEqual({ x: '1' });
  });
});

describe('the step limit', () => {
  const expectStopped = (trace: Trace, maxSteps: number) => {
    expect(trace.outcome).toBe('step-limit');
    expect(trace.error).toBeUndefined();
    expect(trace.steps.length).toBeLessThanOrEqual(maxSteps);
    expect(trace.steps.length).toBeGreaterThan(0);
  };

  it('stops an infinite loop at 2,000 steps by default and keeps the partial trace', () => {
    const trace = traceSync(`let n = 0;
while (true) {
  n++;
}`);
    expectStopped(trace, DEFAULT_MAX_STEPS);
    expect(trace.steps).toHaveLength(DEFAULT_MAX_STEPS);
    expect(Number(slotOf(frameOf(lastStep(trace), 'global'), 'n').value)).toBeGreaterThan(900);
  });

  it('stops a loop with an empty body', () => {
    expectStopped(traceSync(`while (true) {}`, { maxSteps: 100 }), 100);
    expectStopped(traceSync(`for (;;);`, { maxSteps: 100 }), 100);
    expectStopped(traceSync(`do {} while (true);`, { maxSteps: 100 }), 100);
  });

  it('stops a loop whose body catches everything', () => {
    const trace = traceSync(
      `let n = 0;
while (true) {
  try {
    n++;
  } catch (e) {}
}`,
      { maxSteps: 100 }
    );
    expectStopped(trace, 100);
    expect(trace.steps).toHaveLength(100);
  });

  it('is not swallowed by a catch without a binding, a destructuring catch or a finally', () => {
    expectStopped(traceSync(`while (true) { try { [].x.y; } catch {} }`, { maxSteps: 100 }), 100);
    expectStopped(
      traceSync(`while (true) { try { [].x.y; } catch ({ message }) { message; } }`, {
        maxSteps: 100,
      }),
      100
    );
    expectStopped(
      traceSync(`function f() { try { return f(); } finally { while (true) {} } } f();`, {
        maxSteps: 100,
      }),
      100
    );
  });

  it('is not swallowed by a finally that jumps away, nor by a loop in a proxy trap', () => {
    expectStopped(
      traceSync(`while (true) { try { while (true) {} } finally { continue; } }`, {
        maxSteps: 100,
      }),
      100
    );
    // Reading the proxy for a snapshot runs its trap, which records nothing but still counts.
    expectStopped(
      traceSync(
        `const trap = new Proxy({}, { ownKeys() { while (true) {} } });
const after = 1;`,
        {
          maxSteps: 100,
        }
      ),
      100
    );
  });

  it('stops runaway recursion with one frame per call', () => {
    const trace = traceSync(
      `function down(n) {
  return down(n + 1);
}
down(0);`,
      { maxSteps: 200 }
    );
    expectStopped(trace, 200);
    const frames = lastStep(trace).snapshot.frames;
    expect(frames).toHaveLength(200);
    expect(frames[199].name).toBe('down(198)');
    expect(values(frames[100])).toEqual({ n: '99' });
  });
});

describe('errors', () => {
  it('ends the trace at a thrown error, with its message and line', () => {
    const trace = traceSync(`function check(age) {
  if (age < 0) {
    throw new RangeError('age must be positive');
  }
  return age;
}
const ok = check(3);
check(-1);
const never = 1;`);
    expect(trace.outcome).toBe('error');
    expect(trace.error).toEqual({ message: 'RangeError: age must be positive', line: 3 });
    expect(values(frameOf(lastStep(trace), 'global')).never).toBe(UNINITIALISED);
  });

  it('reports the line of an error at the top level and of a thrown value that is no Error', () => {
    expect(traceSync(`const a = 1;\nconst b = a.missing.deeper;`).error).toEqual({
      message: expect.stringContaining('TypeError'),
      line: 2,
    });
    expect(traceSync(`const a = 1;\n\nthrow 'plain';`).error).toEqual({
      message: "Uncaught 'plain'",
      line: 3,
    });
  });

  it('completes when the learner catches the error', () => {
    const run = startTrace(`function fail() { throw new Error('no'); }
let message = 'none';
try {
  fail();
} catch (error) {
  message = error.message;
}
console.log(message);`);
    const trace = run.getTrace();
    expect(trace.outcome).toBe('completed');
    expect(run.console).toEqual(['no']);
    const caught = trace.steps.find((step) => step.line === 6)!;
    expect(frameNames(caught)).toEqual(['global']);
    expect(follow(caught, frameOf(caught, 'global'), 'error').label).toBe('Error');
  });

  it('ends with an error on a native stack overflow', () => {
    const trace = traceSync(`const first = 1;
const runaway = new Function('function r() { return r(); } return r();');
runaway();`);
    expect(trace.outcome).toBe('error');
    expect(trace.error?.message).toMatch(/RangeError/);
    expect(trace.error?.line).toBe(3);
    expect(trace.steps.length).toBeGreaterThan(1);
  });

  it('reports a syntax error with its line and records nothing', () => {
    const trace = traceSync(`const a = 1;\nconst b = ;`);
    expect(trace).toEqual({
      steps: [],
      outcome: 'error',
      error: { message: 'Unexpected token', line: 2 },
    });
  });
});

describe('timers and promises', () => {
  const code = `async function load() {
  console.log('before');
  const user = await Promise.resolve({ name: 'Ada' });
  console.log('after', user.name);
  return user;
}
load();
setTimeout(() => {
  const late = 1;
  console.log('timer', late);
}, 10);
console.log('sync end');`;

  it('exposes the trace so far before the run has finished', async () => {
    vi.useFakeTimers();
    const run = startTrace(code);
    const early = run.getTrace();
    expect(early.outcome).toBe('completed');
    expect(run.console).toEqual(['before', 'sync end']);
    await vi.advanceTimersByTimeAsync(5000);
    const late = run.getTrace();
    expect(late.steps.length).toBeGreaterThan(early.steps.length);
    expect(late.steps.slice(0, early.steps.length)).toEqual(early.steps);
    expect(run.console).toEqual(['before', 'sync end', 'after Ada', 'timer 1']);
  });

  it('takes an awaiting frame off the stack and puts it back when it continues', async () => {
    const run = await traceToTheEnd(code);
    const trace = run.getTrace();
    expect(trace.outcome).toBe('completed');
    expect(
      trace.steps.map((step) => `${step.kind} ${step.line} ${frameNames(step).join(' > ')}`)
    ).toEqual([
      'call 7 global',
      'call 7 global > load()',
      'statement 2 global > load()',
      'statement 7 global',
      'statement 8 global',
      'statement 12 global',
      'statement 3 global > load()',
      'statement 4 global > load()',
      'return 5 global > load()',
      'call 8 global > anonymous()',
      'statement 9 global > anonymous()',
      'return 10 global > anonymous()',
    ]);
    const resumed = trace.steps.find((step) => step.line === 3)!;
    expect(values(follow(resumed, frameOf(resumed, 'load()'), 'user'))).toEqual({ name: "'Ada'" });
    expect(trace.steps.map((step) => step.consoleLength)).toEqual([
      0, 0, 1, 1, 1, 2, 2, 3, 3, 3, 3, 4,
    ]);
  });

  it('repairs the stack when an awaited promise rejects into a catch', async () => {
    const run = await traceToTheEnd(`async function risky() {
  try {
    await Promise.reject(new Error('down'));
  } catch (error) {
    console.log(error.message);
  }
  return 'done';
}
risky().then((value) => {
  console.log(value);
});`);
    const trace = run.getTrace();
    expect(trace.outcome).toBe('completed');
    expect(run.console).toEqual(['down', 'done']);
    expect(frameNames(trace.steps.find((step) => step.line === 5)!)).toEqual(['global', 'risky()']);
    expect(frameNames(lastStep(trace))).toEqual(['global', "anonymous('done')"]);
  });

  it('ends the trace when a callback the engine runs later throws', async () => {
    const run = await traceToTheEnd(`const before = 1;
setTimeout(() => {
  null.missing;
}, 0);
setTimeout(() => {
  console.log('never');
}, 5);`);
    const trace = run.getTrace();
    expect(trace.outcome).toBe('error');
    expect(trace.error).toEqual({ message: expect.stringContaining('TypeError'), line: 3 });
    expect(run.console).toEqual([]);
  });
});

describe('size limits', () => {
  it('caps the slots of an object and says how many are missing', () => {
    const trace = traceSync(`const list = Array.from({ length: 50 }, (_, i) => i);
const wide = {};
for (const n of list) wide['k' + n] = n;`);
    const end = lastStep(trace);
    for (const name of ['list', 'wide']) {
      const object = follow(end, frameOf(end, 'global'), name);
      expect(object.slots).toHaveLength(MAX_SLOTS + 1);
      expect(object.slots[MAX_SLOTS]).toEqual({ name: MORE_SLOTS, value: '+30 more' });
    }
  });

  it('caps the length of a string value', () => {
    const trace = traceSync(`const long = 'x'.repeat(500);\nconst lines = 'a\\nb';`);
    const global = frameOf(lastStep(trace), 'global');
    expect(slotOf(global, 'long').value).toBe(`'${'x'.repeat(MAX_STRING_LENGTH)}…'`);
    expect(slotOf(global, 'lines').value).toBe("'a\\nb'");
  });

  it('caps the heap objects of a snapshot and flags the step', () => {
    const trace = traceSync(`let latest;
for (let i = 0; i < 100; i++) {
  latest = { i };
}
const done = true;`);
    const end = lastStep(trace);
    expect(end.truncated).toBe(true);
    expect(end.snapshot.objects).toHaveLength(MAX_HEAP_OBJECTS);
    expect(trace.steps[1].truncated).toBe(false);
    expect(trace.outcome).toBe('completed');

    const small = traceSync(`const a = [[1], [2], [3]];`, { maxHeapObjects: 2 });
    expect(lastStep(small).snapshot.objects).toHaveLength(2);
    expect(lastStep(small).truncated).toBe(true);
  });

  it('walks a long chain of objects without overflowing the stack', () => {
    const trace = traceSync(
      `let head = null;
for (let i = 0; i < 300; i++) head = { next: head };
const done = true;`,
      { maxHeapObjects: 1000 }
    );
    expect(trace.outcome).toBe('completed');
    expect(lastStep(trace).snapshot.objects).toHaveLength(300);
  });

  it('draws maps, sets and sparse arrays', () => {
    const trace = traceSync(`const ada = { name: 'Ada' };
const byName = new Map([['ada', ada], [7, 'seven']]);
const team = new Set([ada]);
const sparse = [1, , 3];`);
    const end = lastStep(trace);
    const global = frameOf(end, 'global');
    const ada = slotOf(global, 'ada').refId;
    expect(follow(end, global, 'byName').slots).toEqual([
      { name: "'ada'", refId: ada },
      { name: '7', value: "'seven'" },
    ]);
    expect(follow(end, global, 'team').slots).toEqual([{ name: '0', refId: ada }]);
    expect(values(follow(end, global, 'sparse'))).toEqual({ 0: '1', 1: 'empty', 2: '3' });
  });
});

describe('the step', () => {
  const trace = traceSync(`const list = [1];
const copy = list;
list.push(2);
console.log(list.length);
list.pop();
const user = { list };`);

  it('has exactly the fields a view needs, and nothing a story has', () => {
    for (const step of trace.steps) {
      expect(Object.keys(step).sort()).toEqual([
        'consoleLength',
        'focus',
        'kind',
        'line',
        'snapshot',
        'truncated',
      ]);
      for (const object of step.snapshot.objects) {
        expect(object.state).toBe('live');
        expect(object.cell).toBeUndefined();
      }
    }
  });

  it('derives the focus from what the step created or changed', () => {
    const [start, declared, aliased, pushed, logged, popped, wrapped] = trace.steps;
    const list = slotOf(frameOf(declared, 'global'), 'list').refId!;
    expect(start.focus).toEqual(['global']);
    expect(declared.focus).toEqual([slotKey('global', 'list'), list]);
    expect(aliased.focus).toEqual([slotKey('global', 'copy')]);
    expect(pushed.focus).toEqual([slotKey(list, '1')]);
    expect(logged.focus).toEqual([]);
    expect(popped.focus).toEqual([list]);
    const user = slotOf(frameOf(wrapped, 'global'), 'user').refId!;
    expect(wrapped.focus).toEqual([slotKey('global', 'user'), user]);
    expect(trace.steps.map((step) => step.consoleLength)).toEqual([0, 0, 0, 0, 1, 1, 1]);
  });

  it('keeps earlier snapshots as they were when the run mutates later', () => {
    const [, declared, , pushed, , popped] = trace.steps;
    const list = slotOf(frameOf(declared, 'global'), 'list').refId;
    expect(values(objectOf(declared, list))).toEqual({ 0: '1' });
    expect(values(objectOf(pushed, list))).toEqual({ 0: '1', 1: '2' });
    expect(values(objectOf(popped, list))).toEqual({ 0: '1' });
  });

  it('survives structuredClone and JSON unchanged', () => {
    expect(structuredClone(trace)).toEqual(trace);
    expect(JSON.parse(JSON.stringify(trace))).toEqual(trace);
  });

  it('only ever references an entity that the same snapshot holds', () => {
    for (const step of trace.steps) {
      const ids = new Set([
        ...step.snapshot.frames.map((frame) => frame.id),
        ...step.snapshot.objects.map((object) => object.id),
      ]);
      for (const reference of getReferences(step.snapshot))
        expect(ids.has(reference.to)).toBe(true);
    }
  });
});
