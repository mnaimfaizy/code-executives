/**
 * Runs the sandbox script for real, in the test's own window: jsdom does not run
 * the scripts of an iframe's srcdoc. The window is its own parent here, so the
 * script's messages to the host arrive on the same window.
 */
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { instrument, resolveTraceLimits, runtimeSource, TRACER_NAME } from '../../tracer';
import type { Trace } from '../../tracer';
import { SANDBOX_RUNTIME_SOURCE } from './sandboxRuntime';

interface Report {
  type: 'result' | 'error';
  runId: number;
  error?: string;
  entries: Array<{ type: string; args: string[]; line?: number }>;
  trace: Trace | null;
}

let nextRunId = 0;

/** Send code to the sandbox script and wait for its report */
function runInSandbox(
  code: string,
  timeout = 2_000,
  tracer?: object
): Promise<Report & { elapsedMs: number }> {
  const runId = ++nextRunId;
  const startedAt = performance.now();
  return new Promise((resolve) => {
    const onMessage = (event: MessageEvent): void => {
      const data = event.data as Partial<Report> | null;
      if (!data || data.runId !== runId) return;
      if (data.type !== 'result' && data.type !== 'error') return;
      window.removeEventListener('message', onMessage);
      resolve({ ...(data as Report), elapsedMs: performance.now() - startedAt });
    };
    window.addEventListener('message', onMessage);
    window.postMessage({ type: 'execute', code, timeout, runId, tracer }, '*');
  });
}

/** Instrument code and run it the way the Playground does with Trace on */
function runTraced(code: string, maxSteps?: number): Promise<Report & { elapsedMs: number }> {
  const instrumented = instrument(code);
  if (!instrumented.ok) throw new Error(instrumented.error.message);
  return runInSandbox(instrumented.code, 2_000, {
    runtime: runtimeSource,
    name: TRACER_NAME,
    limits: resolveTraceLimits({ maxSteps }),
  });
}

function printed(report: Report): string[] {
  return report.entries.map((entry) => entry.args.join(' '));
}

// The script replaces the window's timer functions; the test keeps the real one
const realSetTimeout = window.setTimeout.bind(window);

/** Delays the script asked the real setTimeout for */
const waits: number[] = [];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => realSetTimeout(resolve, ms));
}

describe('sandbox runtime', () => {
  beforeAll(() => {
    // The script locks the network APIs for good, which is right in the iframe but
    // would stop the test environment from tearing its window down
    const defineProperty = Object.defineProperty;
    Object.defineProperty = ((target: object, key: PropertyKey, descriptor: PropertyDescriptor) =>
      defineProperty(target, key, { ...descriptor, configurable: true })) as typeof defineProperty;
    // Record every delay the script asks the real setTimeout for
    window.setTimeout = ((handler: TimerHandler, delay?: number, ...args: unknown[]) => {
      waits.push(delay ?? 0);
      return realSetTimeout(handler, delay, ...args);
    }) as typeof window.setTimeout;
    try {
      // The script is what the iframe evaluates; evaluate it the same way
      (0, eval)(SANDBOX_RUNTIME_SOURCE);
    } finally {
      Object.defineProperty = defineProperty;
    }
  });

  afterEach(() => {
    window.postMessage({ type: 'cancel' }, '*');
  });

  it('reports a run with no timers without a fixed wait', async () => {
    const before = waits.length;
    const report = await runInSandbox('console.log("sync")', 2_000);
    expect(report.type).toBe('result');
    expect(printed(report)).toEqual(['sync']);
    // The script asked for the cap and for turns of the event loop, nothing else
    // (it used to wait 50 ms after every run)
    const asked = waits.slice(before).filter((delay) => delay !== 2_000);
    expect(asked.length).toBeGreaterThan(0);
    expect(asked.every((delay) => delay === 0)).toBe(true);
  });

  it('waits for a timer before it reports', async () => {
    const report = await runInSandbox(`
      console.log("first");
      setTimeout(() => console.log("late"), 100);
    `);
    expect(report.type).toBe('result');
    expect(printed(report)).toEqual(['first', 'late']);
    expect(report.elapsedMs).toBeGreaterThanOrEqual(95);
  });

  it('waits for timers started by timers and by promise work', async () => {
    const report = await runInSandbox(`
      setTimeout(() => {
        console.log("one");
        Promise.resolve().then(() => {
          setTimeout(() => console.log("three"), 20);
          console.log("two");
        });
      }, 20);
    `);
    expect(printed(report)).toEqual(['one', 'two', 'three']);
  });

  it('lets promise work finish before it reports', async () => {
    const report = await runInSandbox(`
      Promise.resolve(1)
        .then((n) => n + 1)
        .then((n) => console.log("then", n))
        .finally(() => console.log("done"));
    `);
    expect(printed(report)).toEqual(['then 2', 'done']);
  });

  it('does not wait for a timer that was cleared', async () => {
    const report = await runInSandbox(`
      const id = setTimeout(() => console.log("never"), 1500);
      clearTimeout(id);
      console.log("cleared");
    `);
    expect(printed(report)).toEqual(['cleared']);
    expect(report.elapsedMs).toBeLessThan(500);
  });

  it('ends when an interval clears itself', async () => {
    const report = await runInSandbox(`
      let ticks = 0;
      const id = setInterval(() => {
        ticks++;
        console.log("tick", ticks);
        if (ticks === 3) clearInterval(id);
      }, 10);
    `);
    expect(report.type).toBe('result');
    expect(printed(report)).toEqual(['tick 1', 'tick 2', 'tick 3']);
  });

  it('ends an interval that never clears at the cap, with a note', async () => {
    const report = await runInSandbox('console.log("before");\nsetInterval(() => {}, 20);', 200);
    expect(report.type).toBe('result');
    expect(report.entries[0].args).toEqual(['before']);
    const note = report.entries[report.entries.length - 1];
    expect(note.type).toBe('warn');
    expect(note.args[0]).toMatch(/Stopped after 0\.2s with 1 timer still pending/);
    expect(report.elapsedMs).toBeGreaterThanOrEqual(195);

    // The interval is gone: a later run is not held up by it
    const next = await runInSandbox('console.log("next")');
    expect(printed(next)).toEqual(['next']);
  });

  it('reports an uncaught error with the line it came from', async () => {
    const report = await runInSandbox('const a = 1;\nconst b = 2;\nnull.x;\n');
    expect(report.type).toBe('error');
    expect(report.error).toMatch(/^TypeError: /);
    expect(report.entries).toHaveLength(1);
    expect(report.entries[0].type).toBe('error');
    expect(report.entries[0].args[0]).toMatch(/^Uncaught TypeError: /);
    expect(report.entries[0].line).toBe(3);
  });

  it('reports an error thrown inside a timer, and keeps what was printed', async () => {
    const report = await runInSandbox(
      'console.log("before");\nsetTimeout(() => {\n  throw new Error("boom");\n}, 10);'
    );
    expect(report.type).toBe('error');
    expect(report.error).toBe('Error: boom');
    expect(printed(report)).toEqual(['before', 'Uncaught Error: boom']);
    expect(report.entries[1].line).toBe(3);
  });

  it('reports code that does not parse without running it', async () => {
    const report = await runInSandbox('const = ;');
    expect(report.type).toBe('error');
    expect(report.error).toMatch(/^SyntaxError: /);
  });

  it('reports nothing for a run that was cancelled', async () => {
    const reports: unknown[] = [];
    const onMessage = (event: MessageEvent): void => {
      const data = event.data as { type?: string } | null;
      if (data?.type === 'result' || data?.type === 'error') reports.push(data);
    };
    window.addEventListener('message', onMessage);
    window.postMessage(
      {
        type: 'execute',
        code: 'setTimeout(() => console.log("late"), 30)',
        timeout: 2_000,
        runId: -1,
      },
      '*'
    );
    await wait(10);
    window.postMessage({ type: 'cancel' }, '*');
    await wait(80);
    window.removeEventListener('message', onMessage);
    expect(reports).toEqual([]);
  });

  describe('a traced run', () => {
    it('reports no trace for code that was not instrumented', async () => {
      const report = await runInSandbox('console.log("plain")');
      expect(report.trace).toBeNull();
    });

    it('records two slots that reference one array as one object', async () => {
      const report = await runTraced('const a = [1];\nconst b = a;\nb.push(2);\nconsole.log(a);');
      expect(report.type).toBe('result');
      const trace = report.trace!;
      expect(trace.outcome).toBe('completed');
      expect(trace.steps.map((step) => step.line)).toContain(3);

      const { frames, objects } = trace.steps[trace.steps.length - 1].snapshot;
      const slot = (name: string) => frames[0].slots.find((s) => s.name === name);
      expect(slot('a')?.refId).toBeDefined();
      expect(slot('b')?.refId).toBe(slot('a')?.refId);
      expect(objects.filter((object) => object.kind === 'array')).toHaveLength(1);
      // Each step knows how much of the Console had been printed by then
      expect(trace.steps[0].consoleLength).toBe(0);
      expect(trace.steps[trace.steps.length - 1].consoleLength).toBe(1);
      // What crossed postMessage is plain data
      expect(structuredClone(trace)).toEqual(trace);
    });

    it('waits for a timer, and the steps of its callback are in the trace', async () => {
      const report = await runTraced(
        'let count = 0;\nsetTimeout(() => {\n  count = count + 1;\n  console.log("late", count);\n}, 30);\nconsole.log("first");'
      );
      expect(report.type).toBe('result');
      expect(printed(report)).toEqual(['first', 'late 1']);
      const trace = report.trace!;
      expect(trace.outcome).toBe('completed');

      const lines = trace.steps.map((step) => step.line);
      expect(lines.lastIndexOf(6)).toBeLessThan(lines.indexOf(3));
      expect(lines).toContain(4);
      const last = trace.steps[trace.steps.length - 1];
      expect(last.snapshot.frames[0].slots.find((s) => s.name === 'count')?.value).toBe('1');
    });

    it('ends an infinite loop at the step limit, keeps its steps and says so once', async () => {
      const report = await runTraced('let i = 0;\nwhile (true) {\n  i++;\n}', 50);
      expect(report.type).toBe('result');
      expect(report.error).toBeUndefined();
      expect(report.elapsedMs).toBeLessThan(1_500);
      const trace = report.trace!;
      expect(trace.outcome).toBe('step-limit');
      expect(trace.error).toBeUndefined();
      expect(trace.steps).toHaveLength(50);
      expect(report.entries).toEqual([
        {
          type: 'warn',
          args: ['Stopped after 50 steps. The steps recorded so far are kept.'],
        },
      ]);
    });

    it('ends a loop with nothing to record, and one that timers keep going', async () => {
      const empty = await runTraced('while (true) {}');
      expect(empty.trace?.outcome).toBe('step-limit');
      expect(printed(empty)).toEqual([
        'Stopped after 2,000 loop turns or calls that recorded no step. The steps recorded so far are kept.',
      ]);

      const ticking = await runTraced('let n = 0;\nsetInterval(() => {\n  n++;\n}, 1);', 20);
      expect(ticking.type).toBe('result');
      expect(ticking.trace?.outcome).toBe('step-limit');
      expect(ticking.entries).toHaveLength(1);
      expect(ticking.elapsedMs).toBeLessThan(1_500);
    });

    it('reports a thrown error with the line of the learner’s code, and keeps the steps', async () => {
      const report = await runTraced(
        'const a = 1;\nfunction fail() {\n  throw new Error("boom");\n}\nfail();\nconsole.log("never");'
      );
      expect(report.type).toBe('error');
      expect(report.error).toBe('Error: boom');
      expect(report.entries).toEqual([{ type: 'error', args: ['Uncaught Error: boom'], line: 3 }]);
      const trace = report.trace!;
      expect(trace.outcome).toBe('error');
      expect(trace.error).toEqual({ message: 'Error: boom', line: 3 });
      expect(trace.steps.length).toBeGreaterThan(2);
    });

    // jsdom does not raise unhandledrejection, so a rejected promise is checked in a browser
    it('reports an error thrown in a timer', async () => {
      const timer = await runTraced(
        'console.log("before");\nsetTimeout(() => {\n  null.x;\n}, 10);'
      );
      expect(timer.type).toBe('error');
      expect(timer.trace?.outcome).toBe('error');
      expect(timer.entries[1].args[0]).toMatch(/^Uncaught TypeError: /);
      expect(timer.entries[1].line).toBe(3);
    });
  });
});
