/**
 * The check runner, through the real sandbox script.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import {
  buildCheckCode,
  buildWatchCode,
  describeResult,
  formatCall,
  formatValue,
  runChecks,
  sandboxCheck,
  CHECK_HOOK,
} from './runChecks';
import { installSandbox, runCheckInSandbox, sendCheck } from './sandboxForTests';
import { traceSync } from '../tracer';
import type { CheckValue, Exercise } from './types';

const base: Exercise = {
  id: 'double',
  title: 'Double',
  level: 'easy',
  task: 'Write `double(n)`.',
  starterCode: 'function double(n) {\n}\n',
  entry: 'double',
  checks: [
    { args: [2], expected: 4, explanation: '2 + 2' },
    { args: [0], expected: 0 },
    { args: [-3], expected: -6, hidden: true },
  ],
  hints: ['Multiply by two.'],
  suggestedLens: 'stack-heap',
};

const withChecks = (
  entry: string,
  checks: Array<{ args: CheckValue[]; expected: CheckValue; hidden?: boolean }>,
  compare?: 'any-order'
): Exercise => ({ ...base, entry, checks, compare });

const statuses = async (exercise: Exercise, code: string): Promise<string[]> => {
  const run = await runChecks(exercise, code, runCheckInSandbox);
  if (run.kind !== 'ran') throw new Error(`no check ran: ${run.kind}`);
  return run.results.map((result) => result.status);
};

describe('runChecks', () => {
  beforeAll(installSandbox);

  it('passes each check the function answers correctly, and reports the rest with their values', async () => {
    const run = await runChecks(
      base,
      'function double(n) { return n === 0 ? 1 : n * 2; }',
      runCheckInSandbox
    );
    expect(run).toEqual({
      kind: 'ran',
      passed: false,
      results: [
        { index: 0, hidden: false, status: 'pass', actual: '4' },
        { index: 1, hidden: false, status: 'fail', actual: '1' },
        { index: 2, hidden: true, status: 'pass' },
      ],
    });
  });

  it('reports only pass or fail for a hidden check, whatever went wrong', async () => {
    const run = await runChecks(
      base,
      'function double(n) { if (n < 0) throw new Error("secret " + n); return n * 2; }',
      runCheckInSandbox
    );
    expect(run.kind === 'ran' && run.results[2]).toEqual({
      index: 2,
      hidden: true,
      status: 'fail',
    });
    expect(run.kind === 'ran' && run.passed).toBe(false);
  });

  it('reports a thrown error with its message, and the other checks still run', async () => {
    const run = await runChecks(
      base,
      'function double(n) { if (n === 2) return null.length; return n * 2; }',
      runCheckInSandbox
    );
    if (run.kind !== 'ran') throw new Error('no check ran');
    expect(run.results[0].status).toBe('threw');
    expect(run.results[0].message).toMatch(/^TypeError: /);
    expect(run.results[0].beforeCall).toBeUndefined();
    expect(run.results[1].status).toBe('pass');
    expect(describeResult(run.results[0], 'double')).toMatch(/^Failed: double threw\. TypeError/);
  });

  it('reports an error thrown before the entry function could be called', async () => {
    const run = await runChecks(
      base,
      'function double(n) { return n * 2; }\nnotDefined();',
      runCheckInSandbox
    );
    if (run.kind !== 'ran') throw new Error('no check ran');
    expect(run.results[0]).toMatchObject({ status: 'threw', beforeCall: true });
    expect(run.results[0].message).toMatch(/ReferenceError/);
    expect(describeResult(run.results[0], 'double')).toMatch(/threw before double was called/);
  });

  it('reports a missing function', async () => {
    expect(await statuses(base, 'function twice(n) { return n * 2; }')).toEqual([
      'missing',
      'missing',
      'fail',
    ]);
    expect(await statuses(base, 'const double = 4;')).toEqual(['missing', 'missing', 'fail']);
  });

  it('finds an entry declared with const or as a class method holder', async () => {
    expect(await statuses(base, 'const double = (n) => n * 2;')).toEqual(['pass', 'pass', 'pass']);
  });

  it('reports a syntax error once, with its line, and runs nothing', async () => {
    let ran = 0;
    const run = await runChecks(base, 'function double(n) {\n  return n * ;\n}', async () => {
      ran++;
      return { status: 'pass' };
    });
    expect(run.kind).toBe('syntax-error');
    expect(run.kind === 'syntax-error' && run.line).toBe(2);
    expect(ran).toBe(0);
  });

  it('points a bracket that is never closed at a line of the learner’s code', () => {
    const built = buildCheckCode('function double(n) {\n  return n * 2;', 'double');
    expect(built.ok).toBe(false);
    if (built.ok || built.run.kind !== 'syntax-error') throw new Error('expected a syntax error');
    expect(built.run.line).toBeLessThanOrEqual(2);
  });

  it('reports code the tracer cannot rewrite, without a position in rewritten code', () => {
    const built = buildCheckCode(
      'function double() {\n  var twice = 1;\n  function twice() {}\n}',
      'double'
    );
    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.run.kind).toBe('untraceable');
    expect(built.run.message).not.toMatch(/\(\d+:\d+\)$/);
  });

  describe('an endless loop', () => {
    it('ends each check with a step-limit failure instead of hanging', async () => {
      const startedAt = performance.now();
      const run = await runChecks(
        base,
        'function double(n) { while (true) {} return n * 2; }',
        runCheckInSandbox
      );
      expect(run.kind === 'ran' && run.results.map((result) => result.status)).toEqual([
        'step-limit',
        'skipped',
        'skipped',
      ]);
      expect(performance.now() - startedAt).toBeLessThan(5_000);
      if (run.kind !== 'ran') return;
      expect(describeResult(run.results[0], 'double')).toMatch(/stopped after 2,000 steps/);
    });

    it('ends a loop that records a step on every turn', async () => {
      expect(
        await statuses(base, 'function double(n) { let i = 0; while (true) { i++; } return i; }')
      ).toEqual(['step-limit', 'skipped', 'skipped']);
    });

    it('ends a loop the learner wrapped in try/catch', async () => {
      expect(
        await statuses(
          base,
          'function double(n) { try { while (true) {} } catch (e) { return n * 2; } }'
        )
      ).toEqual(['step-limit', 'skipped', 'skipped']);
    });

    it('ends a recursion without a base case', async () => {
      const result = await statuses(base, 'function double(n) { return double(n); }');
      // The engine's own stack limit may come first: either way the check fails and ends
      expect(['step-limit', 'threw']).toContain(result[0]);
      // Every step snapshots the whole stack, so this is the slowest run there is: it takes a
      // second or two alone and longer beside the rest of the suite.
    }, 30_000);

    it('ends a loop at the top level, before the entry function is reached', async () => {
      expect(await statuses(base, 'function double(n) { return n * 2; }\nwhile (true) {}')).toEqual(
        ['step-limit', 'skipped', 'skipped']
      );
    });

    it('gives every check a full step budget of its own', async () => {
      // About 1,200 steps a call: three calls on one budget of 2,000 would not finish
      const code = 'function double(n) { let i = 0; while (i < 400) { i++; } return n * 2; }';
      expect(await statuses(base, code)).toEqual(['pass', 'pass', 'pass']);
    });

    it('skips the checks after one that was stopped, and says so', async () => {
      const code = 'function double(n) { if (n === 0) { while (true) {} } return n * 2; }';
      const run = await runChecks(base, code, runCheckInSandbox);
      if (run.kind !== 'ran') throw new Error('no check ran');
      expect(run.results.map((result) => result.status)).toEqual(['pass', 'step-limit', 'skipped']);
      expect(run.results[2]).toEqual({ index: 2, hidden: true, status: 'skipped' });
      expect(run.passed).toBe(false);
      expect(describeResult(run.results[2], 'double')).toMatch(/^Not run/);
    });
  });

  describe('comparison', () => {
    const answer = (value: string): string => `function f() { return ${value}; }`;
    const verdict = async (
      expected: CheckValue,
      value: string,
      compare?: 'any-order'
    ): Promise<string> =>
      (await statuses(withChecks('f', [{ args: [], expected }], compare), answer(value)))[0];

    it('is structural for arrays and plain objects', async () => {
      expect(await verdict([1, [2, 3]], '[1, [2, 3]]')).toBe('pass');
      expect(await verdict([1, [2, 3]], '[1, [3, 2]]')).toBe('fail');
      expect(await verdict([1, 2], '[1, 2, 3]')).toBe('fail');
      expect(await verdict({ a: 1, b: { c: null } }, '({ b: { c: null }, a: 1 })')).toBe('pass');
      expect(await verdict({ a: 1 }, '({ a: 1, b: 2 })')).toBe('fail');
      expect(await verdict({ a: 1 }, '({})')).toBe('fail');
    });

    it('does not coerce', async () => {
      expect(await verdict(1, '"1"')).toBe('fail');
      expect(await verdict(false, '0')).toBe('fail');
      expect(await verdict(false, 'undefined')).toBe('fail');
      expect(await verdict(null, 'undefined')).toBe('fail');
      expect(await verdict([1], '({ 0: 1, length: 1 })')).toBe('fail');
      expect(await verdict({}, 'new Map()')).toBe('fail');
      expect(await verdict(0, '-0')).toBe('pass');
    });

    it('survives a result that refers to itself', async () => {
      expect(
        await verdict({ next: null }, '(() => { const a = {}; a.next = a; return a; })()')
      ).toBe('fail');
    });

    it('keeps the order of a list unless the exercise leaves it open', async () => {
      expect(await verdict([0, 1], '[1, 0]')).toBe('fail');
      expect(await verdict([0, 1], '[1, 0]', 'any-order')).toBe('pass');
      expect(await verdict([0, 1], '[1, 1]', 'any-order')).toBe('fail');
      expect(await verdict([1, 1, 2], '[1, 2, 2]', 'any-order')).toBe('fail');
      expect(await verdict([0, 1], '[0, 1, 1]', 'any-order')).toBe('fail');
      expect(await verdict([0, 1], '"01"', 'any-order')).toBe('fail');
    });

    it('shows what was returned on one line', async () => {
      const shown = async (value: string): Promise<string | undefined> => {
        const run = await runChecks(
          withChecks('f', [{ args: [], expected: 'never' }]),
          answer(value),
          runCheckInSandbox
        );
        return run.kind === 'ran' ? run.results[0].actual : undefined;
      };
      expect(await shown('undefined')).toBe('undefined');
      expect(await shown('[1,{"a":null}]')).toBe('[1,{"a":null}]');
      expect(await shown('NaN')).toBe('NaN');
      expect(await shown('new Set([1])')).toBe('Set');
      expect(await shown('function g() {}')).toBe('function g');
      expect(await shown('[undefined]')).toBe('["[undefined]"]');
    });
  });

  describe('what a learner cannot use to pass', () => {
    it('is not fooled by what the code prints', async () => {
      const code = `function double(n) { console.log(4); console.log("pass"); console.log({ status: "pass" }); }`;
      expect(await statuses(base, code)).toEqual(['fail', 'fail', 'fail']);
    });

    it('fails when the code redefines the check hook', async () => {
      const code = `function ${CHECK_HOOK}() { return true; }\nfunction double(n) { return 0; }`;
      expect(await statuses(base, code)).toEqual(['not-reached', 'not-reached', 'fail']);
    });

    it('fails when the code returns before the check', async () => {
      const result = await statuses(base, 'function double(n) { return n * 2; }\nreturn;');
      expect(result).toEqual(['not-reached', 'not-reached', 'fail']);
    });

    it('compares with the built-ins it had before the code ran', async () => {
      const code = `Array.isArray = () => true; Object.keys = () => []; JSON.stringify = () => "4";
function double(n) { return {}; }`;
      const { isArray } = Array;
      const { keys } = Object;
      const { stringify } = JSON;
      try {
        expect(await statuses(withChecks('double', [{ args: [1], expected: [2] }]), code)).toEqual([
          'fail',
        ]);
      } finally {
        Array.isArray = isArray;
        Object.keys = keys;
        JSON.stringify = stringify;
      }
    });

    it('gives each call its own copy of the arguments', async () => {
      // A function that empties its argument does not change what the next check passes in
      const exercise = withChecks('f', [
        { args: [[1, 2]], expected: 2 },
        { args: [[1, 2]], expected: 2 },
      ]);
      expect(
        await statuses(
          exercise,
          'function f(list) { const n = list.length; list.length = 0; return n; }'
        )
      ).toEqual(['pass', 'pass']);
      expect(exercise.checks[0].args).toEqual([[1, 2]]);
    });

    it('does not let a listener left by an earlier run read the expected value', async () => {
      const exercise = withChecks('f', [{ args: [], expected: 'the-expected-value' }]);
      const built = buildCheckCode(
        `window.__seen = window.__seen || [];
window.addEventListener('message', (event) => { window.__seen.push(JSON.stringify(event.data)); });
function f() { return window.__seen.join(' '); }`,
        'f'
      );
      if (!built.ok) throw new Error('did not build');
      await sendCheck(built.code, sandboxCheck(exercise, exercise.checks[0]));
      const second = await sendCheck(built.code, sandboxCheck(exercise, exercise.checks[0]));
      expect(second.check.status).toBe('fail');
      expect(second.check.actual).not.toContain('the-expected-value');
    });
  });

  it('sends no steps and waits for no timer in a check run', async () => {
    const built = buildCheckCode(
      'setInterval(() => {}, 10);\nfunction double(n) { return n * 2; }',
      'double'
    );
    if (!built.ok) throw new Error('did not build');
    const startedAt = performance.now();
    const report = await sendCheck(built.code, sandboxCheck(base, base.checks[0]));
    expect(report.check).toEqual({ status: 'pass', actual: '4' });
    expect(report.trace).toBeNull();
    expect(performance.now() - startedAt).toBeLessThan(1_000);
  });

  it('reports a check the sandbox could not run as unavailable', async () => {
    const run = await runChecks(base, 'function double(n) { return n * 2; }', async () => {
      throw new Error('Sandbox iframe not available');
    });
    if (run.kind !== 'ran') throw new Error('no check ran');
    expect(run.results[0]).toMatchObject({ status: 'unavailable' });
    expect(run.passed).toBe(false);
    expect(describeResult(run.results[0], 'double')).toMatch(/^Did not run/);
  });
});

describe('formatting a check', () => {
  it('writes values as the learner would write them', () => {
    expect(formatValue([1, 'a', null, true])).toBe('[1, "a", null, true]');
    expect(formatValue({ val: 1, next: { val: 2, next: null } })).toBe(
      '{ val: 1, next: { val: 2, next: null } }'
    );
    expect(formatValue({})).toBe('{}');
    expect(formatValue([])).toBe('[]');
  });

  it('writes the call a check makes', () => {
    expect(formatCall('twoSum', { args: [[2, 7], 9], expected: [0, 1] })).toBe('twoSum([2, 7], 9)');
    expect(formatCall('f', { args: [], expected: 1 })).toBe('f()');
  });
});

describe('watching a check', () => {
  it('runs the learner’s code and then the one call, on a line after the code', () => {
    const code = 'function double(n) {\n  return n * 2;\n}';
    const watch = buildWatchCode(code, base, base.checks[0]);
    expect(watch).toBe(`${code}\ndouble(2);`);
    const trace = traceSync(watch);
    expect(trace.outcome).toBe('completed');
    // The call is made from line 4 and the body runs on line 2 of the learner's code
    expect(trace.steps.some((step) => step.kind === 'call' && step.line === 4)).toBe(true);
    expect(trace.steps.some((step) => step.line === 2)).toBe(true);
  });

  it('writes arguments that are lists and nodes as literals the engine can read', () => {
    const exercise = withChecks('f', [{ args: [{ val: 1, next: null }, ['a', 2]], expected: 0 }]);
    const watch = buildWatchCode(
      'function f(node, list) { return node.val + list.length; }',
      exercise,
      exercise.checks[0]
    );
    expect(watch.endsWith('f({ val: 1, next: null }, ["a", 2]);')).toBe(true);
    expect(traceSync(watch).outcome).toBe('completed');
  });
});
