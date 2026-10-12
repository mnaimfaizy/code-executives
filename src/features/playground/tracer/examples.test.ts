import { afterEach, describe, expect, it, vi } from 'vitest';
import { codeTemplates } from '../utils/codeTemplates';
import { examples as allExamples } from '../utils/examples';
import { getReferences } from '../../../shared/snapshot';
import { startTrace } from './trace';
import type { Trace } from './types';

const examples = allExamples.filter((example) => example.language === 'javascript');

afterEach(() => {
  vi.useRealTimers();
});

/** What the code prints with no tracer near it. */
async function printsUntraced(code: string): Promise<string[]> {
  const printed: string[] = [];
  const print = (...args: unknown[]) => {
    printed.push(args.map((arg) => (typeof arg === 'string' ? arg : String(arg))).join(' '));
  };
  new Function('console', code)({ log: print, info: print, warn: print, error: print });
  await vi.advanceTimersByTimeAsync(5000);
  return printed;
}

describe('tracing the code the Playground ships', () => {
  it('finds the examples', () => {
    expect(examples.length).toBeGreaterThanOrEqual(3);
  });

  const cases = [
    { id: 'the default JavaScript template', code: codeTemplates.javascript },
    ...examples.map(({ id, code }) => ({ id, code })),
  ];

  for (const { id, code } of cases) {
    it(`traces ${id} without an error, printing what the untraced code prints`, async () => {
      vi.useFakeTimers();
      const untraced = await printsUntraced(code);
      const run = startTrace(code);
      await vi.advanceTimersByTimeAsync(5000);
      const trace = run.getTrace();

      expect(trace.error).toBeUndefined();
      expect(trace.outcome).not.toBe('error');
      expect(trace.steps.length).toBeGreaterThan(3);
      if (trace.outcome === 'completed') expect(run.console).toEqual(untraced);
      else expect(untraced.slice(0, run.console.length)).toEqual(run.console);
      expect(structuredClone(trace)).toEqual(trace);
    });
  }
});

/** The most entities of one kind any step of the trace holds. */
const most = (trace: Trace, count: (step: Trace['steps'][number]) => number): number =>
  Math.max(0, ...trace.steps.map(count));

/**
 * The rule a section's sample must meet to be an example: it runs unchanged to its end with no
 * error, prints what the untraced program prints, and its lens has something to draw.
 */
describe('tracing the examples taken from a section', () => {
  const fromSections = examples.filter((example) => example.source?.kind === 'section');

  it('finds them', () => {
    expect(fromSections.length).toBeGreaterThan(0);
  });

  for (const { id, code, suggestedLens } of fromSections) {
    it(`${id} runs to its end, and the ${suggestedLens} lens has something to draw`, async () => {
      vi.useFakeTimers();
      const untraced = await printsUntraced(code);
      const run = startTrace(code);
      await vi.advanceTimersByTimeAsync(5000);
      const trace = run.getTrace();

      expect(trace.error).toBeUndefined();
      expect(trace.outcome).toBe('completed');
      expect(run.console).toEqual(untraced);
      // The queues are the tracer's model: a run it could not follow is not shown as an example
      expect(trace.queuesApproximate).toBeUndefined();
      expect(trace.steps.some((step) => step.truncated || step.queuesTruncated)).toBe(false);

      const frames = most(trace, (step) => step.snapshot.frames.length);
      const onHeap = most(
        trace,
        (step) => step.snapshot.objects.length + getReferences(step.snapshot).length
      );
      const queued = most(
        trace,
        ({ snapshot }) =>
          (snapshot.microtasks?.length ?? 0) +
          (snapshot.tasks?.length ?? 0) +
          (snapshot.timers?.length ?? 0)
      );
      expect(suggestedLens).not.toBe('none');
      if (suggestedLens === 'stack-queues') expect(queued).toBeGreaterThan(0);
      // Stack & Heap: objects and references, or for a program of calls alone, a stack that grows
      else expect(onHeap > 0 || frames > 1).toBe(true);
    });
  }
});
