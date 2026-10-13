import { describe, it, expect } from 'vitest';
import {
  LOOP_GUARD_LIMIT,
  LoopGuardStop,
  createLoopGuard,
  guardLoops,
  loopGuardMessage,
  type LoopGuardCounter,
} from './loopGuard';

/** Guard `code` and run it with a counter that trips after `limit` */
function run(
  code: string,
  limit = 50
): { counter: LoopGuardCounter; logs: unknown[]; thrown: unknown; returned: unknown } {
  const guarded = guardLoops(code, limit);
  if (!guarded.ok) throw new Error(guarded.error.message);
  const counter = createLoopGuard(guarded.guard);
  const logs: unknown[] = [];
  let thrown: unknown;
  let returned: unknown;
  try {
    returned = new Function(guarded.guard.name, 'log', guarded.code)(counter, (value: unknown) =>
      logs.push(value)
    );
  } catch (error) {
    thrown = error;
  }
  return { counter, logs, thrown, returned };
}

/** The guarded text of `code`, with the counter written as `G` */
function guardedText(code: string): string {
  const guarded = guardLoops(code);
  if (!guarded.ok) throw new Error(guarded.error.message);
  return guarded.code.split(guarded.guard.name).join('G');
}

describe('guardLoops: what is counted', () => {
  it('has one fixed limit of 1,000,000 and says so in plain words', () => {
    expect(LOOP_GUARD_LIMIT).toBe(1_000_000);
    const guarded = guardLoops('let a = 1;');
    expect(guarded.ok && guarded.guard.limit).toBe(1_000_000);
    expect(loopGuardMessage()).toBe(
      'Stopped after 1,000,000 loop turns and calls: a loop or recursion probably does not ' +
        'end. Turn Trace on to watch it step by step.'
    );
  });

  it('counts every turn of every kind of loop', () => {
    const { counter, logs } = run(`
      for (let i = 0; i < 3; i++) log('for');
      for (const key in { a: 1, b: 2 }) { log(key); }
      for (const item of [1, 2]) log(item);
      let n = 0;
      while (n < 4) n++;
      do { n--; } while (n > 0);
    `);
    expect(logs).toEqual(['for', 'for', 'for', 'a', 'b', 1, 2]);
    expect(counter.count()).toBe(3 + 2 + 2 + 4 + 4);
  });

  it('counts every function entry: declarations, expressions, arrows and methods', () => {
    const { counter, returned } = run(`
      function declared() { return 1; }
      const expressed = function () { return 1; };
      const arrow = () => 1;
      const blockArrow = () => { return 1; };
      const object = { method() { return 1; }, get value() { return 1; } };
      class Thing { constructor() { this.n = 1; } get() { return this.n; } static make() { return new Thing(); } }
      return declared() + expressed() + arrow() + blockArrow() + object.method() + object.value + Thing.make().get();
    `);
    expect(returned).toBe(7);
    // make, constructor and get are three entries
    expect(counter.count()).toBe(9);
  });

  it('counts async functions, generators and the code after an await', async () => {
    const { counter, returned } = run(`
      function* numbers() { yield 1; yield 2; }
      async function later() { await null; for (const n of numbers()) await n; return 'done'; }
      return later();
    `);
    await expect(returned).resolves.toBe('done');
    // later, numbers, and two turns of the loop that ran after the await
    expect(counter.count()).toBe(4);
  });

  it('keeps the value an arrow function returns, an object literal included', () => {
    const { returned } = run(`
      const pair = (a, b) => ({ a, b });
      const last = () => (1, 2);
      return [pair(1, 2), last()];
    `);
    expect(returned).toEqual([{ a: 1, b: 2 }, 2]);
  });

  it('keeps directives first, so a strict function stays strict', () => {
    expect(guardedText(`function f() { 'use strict'; return this; }`)).toBe(
      `function f() { 'use strict';;G(); return this; }`
    );
    const { returned } = run(`function f() { 'use strict'\n return this; }\nreturn f();`);
    expect(returned).toBeUndefined();
  });

  it('gives a loop or arrow without braces a body that counts first', () => {
    expect(guardedText('while (go()) step();')).toBe('while (go()) {G();step();}');
    expect(guardedText('for (;;) for (;;) x = () => y')).toBe(
      'for (;;) {G();for (;;) {G();x = () => (G(),y)}}'
    );
    expect(guardedText('do x++; while (x < 3)')).toBe('do {G();x++;} while (x < 3)');
  });

  it('keeps a labelled loop and its continue', () => {
    const { logs } = run(`
      outer: for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) { if (j === 1) continue outer; log(i + '-' + j); }
    `);
    expect(logs).toEqual(['0-0', '1-0', '2-0']);
  });

  it('uses a counter name the code does not use', () => {
    const guarded = guardLoops('const __g = 1; const __g_ = 2; while (false) {}');
    expect(guarded.ok && guarded.guard.name).toBe('__g__');
    expect(run('const __g = 5; let n = 0; while (n < __g) n++; return n;').returned).toBe(5);
  });
});

describe('guardLoops: lines', () => {
  it('adds no line break, so every statement stays on its line', () => {
    const code = [
      'function f(n) {',
      '  while (n > 0)',
      '    n--;',
      '  try { g(); } catch (e) { h(); } finally { k(); }',
      '  return [1, 2].map((x) =>',
      '    x * 2);',
      '}',
    ].join('\n');
    const guarded = guardLoops(code);
    if (!guarded.ok) throw new Error('not guarded');
    const before = code.split('\n');
    const after = guarded.code.split('\n');
    expect(after).toHaveLength(before.length);
    // Each line still holds the statement text it held
    expect(after[2]).toContain('n--;');
    expect(after[3]).toContain('h();');
    expect(after[5]).toContain('x * 2');
  });

  it("reports an error on the learner's own line", () => {
    const { thrown } = run(
      ['let total = 0;', 'for (let i = 0; i < 2; i++) {', '  total += i;', '}', 'missing();'].join(
        '\n'
      )
    );
    expect(thrown).toBeInstanceOf(ReferenceError);
    // `new Function` puts its own lines above the body; measure them on an unguarded probe
    const lineOf = (error: unknown): number =>
      Number(/<anonymous>:(\d+):\d+/.exec((error as Error).stack ?? '')?.[1]);
    let probe: unknown;
    try {
      new Function('a', 'b', 'missing();')();
    } catch (error) {
      probe = error;
    }
    expect(lineOf(thrown) - (lineOf(probe) - 1)).toBe(5);
  });

  it('reports a syntax error with its line and changes nothing', () => {
    const guarded = guardLoops('let a = 1;\nlet b = ;');
    expect(guarded).toEqual({ ok: false, error: { message: 'Unexpected token', line: 2 } });
  });
});

describe('the loop guard: stopping', () => {
  it('stops a loop that does not end', () => {
    const { thrown, counter } = run('while (true) {}');
    expect(thrown).toBeInstanceOf(LoopGuardStop);
    expect((thrown as Error).message).toBe(loopGuardMessage(50));
    expect(counter.tripped()).toBe(true);
    expect(counter.count()).toBe(51);
  });

  it('stops a recursion that does not end before the stack overflows', () => {
    const { thrown } = run('function again() { return again(); }\nagain();', 500);
    expect(thrown).toBeInstanceOf(LoopGuardStop);
  });

  it('stops loops and calls together: they share one count', () => {
    const { thrown, logs } = run(`
      const tick = () => log('tick');
      for (let i = 0; i < 100; i++) tick();
    `);
    expect(thrown).toBeInstanceOf(LoopGuardStop);
    // 50 counted points: 25 turns and 25 calls
    expect(logs).toHaveLength(25);
  });

  it("cannot be swallowed by the learner's catch", () => {
    const { thrown, logs } = run(`
      try { while (true) {} } catch (error) { log('caught'); }
      log('after');
    `);
    expect(thrown).toBeInstanceOf(LoopGuardStop);
    expect(logs).toEqual([]);
  });

  it('cannot be swallowed by a catch without a binding, or one with a pattern', () => {
    expect(run(`try { while (true) {} } catch { log('caught'); }`).thrown).toBeInstanceOf(
      LoopGuardStop
    );
    expect(
      run(`try { while (true) {} } catch ({ message }) { log(message); }`).thrown
    ).toBeInstanceOf(LoopGuardStop);
  });

  it('cannot be replaced by a finally block that returns or loops', () => {
    const returning = run(`
      function f() { try { while (true) {} } finally { return 'swallowed'; } }
      return f();
    `);
    expect(returning.thrown).toBeInstanceOf(LoopGuardStop);
    expect(returning.returned).toBeUndefined();

    const looping = run(`try { while (true) {} } finally { while (true) { log('again'); } }`);
    expect(looping.thrown).toBeInstanceOf(LoopGuardStop);
    expect(looping.logs).toEqual([]);
  });

  it('throws again at every later loop turn and call, in a loop that catches everything', () => {
    const { thrown, logs, counter } = run(`
      function risky() { log('ran'); }
      for (let i = 0; i < 1000; i++) {
        try { risky(); } catch (error) { log('caught'); }
      }
    `);
    expect(thrown).toBeInstanceOf(LoopGuardStop);
    // 50 counted points are 25 turns with a call each; the 26th turn throws outside the try
    expect(logs).toEqual(Array(25).fill('ran'));
    expect(counter.count()).toBe(51);
  });

  it('leaves a run below the limit alone, and its own errors to its own catch', () => {
    const { thrown, logs } = run(`
      try { throw new Error('mine'); } catch (error) { log(error.message); } finally { log('finally'); }
    `);
    expect(thrown).toBeUndefined();
    expect(logs).toEqual(['mine', 'finally']);
  });

  it('stops an async loop after its awaits', async () => {
    const { returned, counter } = run(`
      async function spin() { while (true) { try { await null; } catch (e) {} } }
      return spin();
    `);
    await expect(returned).rejects.toBeInstanceOf(LoopGuardStop);
    expect(counter.tripped()).toBe(true);
  });
});
