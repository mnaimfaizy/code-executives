/**
 * Runs the sandbox script for real, in the test's own window: jsdom does not run
 * the scripts of an iframe's srcdoc. The window is its own parent here, so the
 * script's messages to the host arrive on the same window.
 */
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { SANDBOX_RUNTIME_SOURCE } from './sandboxRuntime';

interface Report {
  type: 'result' | 'error';
  runId: number;
  error?: string;
  entries: Array<{ type: string; args: string[]; line?: number }>;
}

let nextRunId = 0;

/** Send code to the sandbox script and wait for its report */
function runInSandbox(code: string, timeout = 2_000): Promise<Report & { elapsedMs: number }> {
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
    window.postMessage({ type: 'execute', code, timeout, runId }, '*');
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
});
