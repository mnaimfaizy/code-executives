import { describe, expect, it } from 'vitest';
import { STORY_BEATS, STORY_OUTPUT } from './eventLoopStory';
import { consoleAt, printedCounts } from './eventLoopStoryConsole';

const beat = (id: string) => STORY_BEATS.find((b) => b.id === id)!;

describe('eventLoopStoryConsole', () => {
  it('gives the "Prints so far" column of the spec, beat by beat', () => {
    // docs/stories/javascript/event-loop.md, beats table.
    expect(printedCounts()).toEqual([0, 0, 0, 0, 0, 1, 2, 3, 3, 4, 5, 6]);
  });

  it('prints nothing before the first log and everything by the last beat', () => {
    expect(consoleAt(STORY_BEATS[0])).toEqual({ lines: [], fresh: 0 });
    expect(consoleAt(STORY_BEATS.at(-1)!).lines).toEqual([...STORY_OUTPUT]);
  });

  it('knows which line a beat itself printed', () => {
    expect(consoleAt(beat('await-splits-main'))).toEqual({ lines: ['before await'], fresh: 1 });
    expect(consoleAt(beat('stack-empties'))).toEqual({
      lines: ['before await', 'script end'],
      fresh: 1,
    });
    // queueMicrotask(onQueued) prints nothing: the Console is as the beat before left it.
    expect(consoleAt(beat('microtask-queues-microtask'))).toEqual({
      lines: ['before await', 'script end', 'promise'],
      fresh: 0,
    });
    expect(consoleAt(beat('task-runs-last')).lines.at(-1)).toBe('timeout');
  });

  it('never prints a line before the one ahead of it in the output', () => {
    // 'after await' (line 12) is stepped over on the way to 'script end' (line 15), and waits.
    expect(consoleAt(beat('stack-empties')).lines).not.toContain('after await');
    const counts = printedCounts();
    counts.forEach((n, i) => expect(n).toBeGreaterThanOrEqual(counts[i - 1] ?? 0));
  });
});
