import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { STORY_CODE } from '../../javascript/utils/stackHeapStory';
import { instrument, TRACER_NAME } from './instrument';
import { createTracer, runtimeSource } from './runtime';
import type { Tracer } from './runtime';
import { traceSync } from './trace';
import { DEFAULT_TRACE_LIMITS, resolveTraceLimits } from './types';
import type { Trace, TraceLimits } from './types';

type CreateTracer = (limits: TraceLimits, consoleLength?: () => number) => Tracer;

const CLOSURES = `function makeCounter() {
  let count = 0;
  return () => ++count;
}
const next = makeCounter();
const fns = [];
for (let i = 0; i < 2; i++) fns.push(() => i + next());
fns.map((fn) => fn());
try { null.x; } catch ({ message }) { message; }
while (true) {}`;

/** Runs `code` against a tracer made by `create`, the way the sandbox does. */
function run(create: CreateTracer, code: string, limits = DEFAULT_TRACE_LIMITS): Trace {
  const result = instrument(code);
  if (!result.ok) throw new Error(result.error.message);
  const tracer = create(limits);
  try {
    new Function(TRACER_NAME, result.code)(tracer);
  } catch (error) {
    tracer.fail(error);
  }
  return tracer.getTrace();
}

describe('the runtime as a source string', () => {
  it('runs on its own, with nothing from the module it was written in', () => {
    // `new Function` compiles in the global scope: a reference to anything in runtime.ts
    // would be a ReferenceError here.
    const standalone = new Function(`return (${runtimeSource});`)() as CreateTracer;
    expect(standalone).not.toBe(createTracer);
    for (const code of [STORY_CODE, CLOSURES]) {
      const trace = run(standalone, code);
      expect(trace.steps.length).toBeGreaterThan(5);
      expect(trace).toEqual(run(createTracer, code));
    }
    expect(run(standalone, CLOSURES).outcome).toBe('step-limit');
  });

  it('still runs on its own after the production minifier has renamed everything', () => {
    // esbuild refuses to load under jsdom, so it minifies in a plain Node process.
    const script = `
      const { transformSync } = require('esbuild');
      const source = require('node:fs').readFileSync(process.argv[1], 'utf8');
      const options = { loader: 'ts', minify: true, target: 'esnext', format: 'iife', globalName: 'built' };
      process.stdout.write(transformSync(source, options).code);`;
    const minified = execFileSync(
      process.execPath,
      ['-e', script, path.resolve(__dirname, 'runtime.ts')],
      { encoding: 'utf8' }
    );
    const built = new Function(`${minified}; return built;`)() as { runtimeSource: string };
    expect(built.runtimeSource.length).toBeLessThan(runtimeSource.length / 2);
    const standalone = new Function(`return (${built.runtimeSource});`)() as CreateTracer;
    for (const code of [STORY_CODE, CLOSURES]) {
      expect(run(standalone, code)).toEqual(run(createTracer, code));
    }
  });
});

describe('the runtime', () => {
  it('fills in default limits and ignores ones that make no sense', () => {
    expect(resolveTraceLimits()).toEqual(DEFAULT_TRACE_LIMITS);
    expect(resolveTraceLimits({ maxSteps: 10.7, maxSlots: 0, maxHeapObjects: NaN })).toEqual({
      ...DEFAULT_TRACE_LIMITS,
      maxSteps: 10,
    });
  });

  it('tells its own stop signal from a learner error', () => {
    const tracer = createTracer(resolveTraceLimits({ maxSteps: 3 }));
    const result = instrument('while (true) { let n = 1; }');
    let thrown: unknown;
    try {
      new Function(TRACER_NAME, result.ok ? result.code : '')(tracer);
    } catch (error) {
      thrown = error;
    }
    expect(tracer.stopped(thrown)).toBe(true);
    expect(tracer.stopped(new Error('other'))).toBe(false);
    tracer.fail(thrown);
    tracer.fail(new Error('too late'));
    expect(tracer.getTrace().outcome).toBe('step-limit');
    expect(tracer.getTrace().error).toBeUndefined();
  });

  it('keeps the first error and stops whatever tries to run afterwards', () => {
    const tracer = createTracer(DEFAULT_TRACE_LIMITS);
    const frame = tracer.start(1, []);
    tracer.step(1, frame);
    tracer.fail(new TypeError('first'));
    tracer.fail(new Error('second'));
    expect(tracer.getTrace().error).toEqual({ message: 'TypeError: first', line: 1 });
    let thrown: unknown;
    try {
      tracer.step(2, frame);
    } catch (error) {
      thrown = error;
    }
    expect(tracer.stopped(thrown)).toBe(true);
    expect(tracer.getTrace().steps).toHaveLength(1);
  });

  it('returns a trace that later steps do not grow', () => {
    const tracer = createTracer(DEFAULT_TRACE_LIMITS);
    const frame = tracer.start(1, []);
    const early = tracer.getTrace();
    tracer.step(1, frame);
    tracer.step(2, frame);
    expect(early.steps).toHaveLength(1);
    expect(tracer.getTrace().steps).toHaveLength(2);
  });

  it('does not record what reading a value triggers', () => {
    // Taking a snapshot asks the proxy for its keys, which calls a traced function.
    const trace = traceSync(`let asked = 0;
const proxy = new Proxy({}, {
  ownKeys() { asked++; return []; },
});
const after = 1;
console.log(asked > 0);`);
    expect(trace.outcome).toBe('completed');
    expect(trace.steps.every((step) => step.snapshot.frames.length === 1)).toBe(true);
    expect(trace.steps.map((step) => step.line)).toEqual([1, 1, 2, 5, 6]);
  });

  it('draws an object that throws when read as an empty object', () => {
    const trace = traceSync(`const hostile = new Proxy({}, {
  ownKeys() { throw new Error('no'); },
  getPrototypeOf() { throw new Error('no'); },
});
const after = 1;`);
    expect(trace.outcome).toBe('completed');
    const end = trace.steps[trace.steps.length - 1];
    expect(end.snapshot.objects.some((object) => object.slots.length === 0)).toBe(true);
  });
});
