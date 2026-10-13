import { afterEach, describe, expect, it, vi } from 'vitest';
import { sectionSamples } from './sectionSamples';

afterEach(() => {
  vi.useRealTimers();
});

/** What the code prints when it runs on its own, timers included. */
async function prints(code: string): Promise<string[]> {
  const printed: string[] = [];
  const print = (...args: unknown[]) => {
    printed.push(args.map((arg) => (typeof arg === 'string' ? arg : String(arg))).join(' '));
  };
  new Function('console', code)({ log: print });
  await vi.advanceTimersByTimeAsync(5000);
  return printed;
}

/** The lines a sample lists after its `// Output:` comment, without the notes after an arrow. */
function listedOutput(code: string): string[] | null {
  const lines = code.split('\n');
  const start = lines.findIndex((line) => /^\/\/ (Console output|Output( order)?):$/.test(line));
  if (start === -1) return null;
  return lines.slice(start + 1).map((line) => line.replace(/^\/\/ /, '').replace(/\s+←.*$/, ''));
}

/**
 * A sample is shown in a section and opened in the Playground, so a comment that speaks of the
 * page, of a tool that rewrites the code, or of a framework's lifecycle is wrong in one of them.
 */
describe('the comments of the section samples', () => {
  it.each(sectionSamples.map((sample) => [sample.example, sample.code] as const))(
    '%s says nothing that is true only on the section’s page',
    (_, code) => {
      const comments = code
        .split('\n')
        .filter((line) => line.includes('//'))
        .map((line) => line.slice(line.indexOf('//')));
      for (const comment of comments) {
        expect(comment).not.toMatch(/SOLUTION|PROBLEM/);
        expect(comment).not.toMatch(/\binstrument|\bWe'll\b|Write JavaScript/i);
        expect(comment).not.toMatch(/component|unmount|lifecycle/i);
        // A placeholder says nothing about the code
        expect(comment).not.toMatch(/^\/\/ (work|todo|\.\.\.)$/i);
      }
    }
  );

  it('finds the samples that list their output', () => {
    const listing = sectionSamples.filter((sample) => listedOutput(sample.code) !== null);
    expect(listing.length).toBeGreaterThanOrEqual(8);
  });

  it.each(
    sectionSamples
      .filter((sample) => listedOutput(sample.code) !== null)
      .map((sample) => [sample.example, sample.code] as const)
  )('%s lists exactly what it prints, line by line', async (_, code) => {
    vi.useFakeTimers();
    expect(listedOutput(code)).toEqual(await prints(code));
  });
});
