import { afterEach, describe, expect, it, vi } from 'vitest';
import { codeTemplates } from '../utils/codeTemplates';
import { startTrace } from './trace';

interface Listed {
  id: string;
  language: string;
  code: string;
}

/**
 * The examples the Playground offers. The file that lists them is being renamed, so this
 * finds it under either name and takes every entry that has JavaScript code.
 */
const modules = import.meta.glob<Record<string, unknown>>(
  ['../utils/examples.ts', '../utils/exampleSnippets.ts'],
  { eager: true }
);
const isListed = (entry: unknown): entry is Listed =>
  typeof entry === 'object' &&
  entry !== null &&
  typeof (entry as Listed).code === 'string' &&
  typeof (entry as Listed).id === 'string';
const examples = Object.values(modules)
  .flatMap((module) => Object.values(module))
  .filter(Array.isArray)
  .flat()
  .filter(isListed)
  .filter((entry) => entry.language === 'javascript');

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
