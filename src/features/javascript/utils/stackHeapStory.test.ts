import { describe, expect, it } from 'vitest';
import { getReachable, getReferences, STORY_CODE, STORY_BEATS, slotKey } from './stackHeapStory';

const beat = (id: string) => STORY_BEATS.find((s) => s.id === id)!;
const codeLines = STORY_CODE.split('\n').length;

describe('stack & heap story model', () => {
  it('tells the agreed 10 beats', () => {
    expect(STORY_BEATS).toHaveLength(10);
    expect(new Set(STORY_BEATS.map((s) => s.id)).size).toBe(10);
  });

  it.each(STORY_BEATS)('$id is internally consistent', (s) => {
    expect(s.line).toBeGreaterThanOrEqual(1);
    expect(s.line).toBeLessThanOrEqual(codeLines);
    const objectIds = new Set(s.objects.map((o) => o.id));
    for (const ref of getReferences(s)) expect(objectIds).toContain(ref.to);

    const keys = new Set<string>([
      ...s.frames.map((f) => f.id),
      ...s.objects.map((o) => o.id),
      ...s.frames.flatMap((f) => f.slots.map((sl) => slotKey(f.id, sl.name))),
      ...s.objects.flatMap((o) => o.slots.map((sl) => slotKey(o.id, sl.name))),
    ]);
    for (const key of s.focus) expect(keys).toContain(key);

    const cells = s.objects.map((o) => `${o.cell.col},${o.cell.row}`);
    expect(new Set(cells).size).toBe(cells.length);
  });

  it('keeps Ada alive after her creating frame is popped', () => {
    const s = beat('return-ada');
    expect(s.frames.map((f) => f.id)).not.toContain('makeUser');
    expect(getReachable(s)).toContain('ada');
  });

  it('keeps Bob reachable through Ada after bob = null', () => {
    const s = beat('bob-null');
    const direct = getReferences(s)
      .filter((r) => r.fromKind === 'frame')
      .map((r) => r.to);
    expect(direct).not.toContain('bob');
    expect(getReachable(s)).toContain('bob');
  });

  it('has nothing reachable once ada = null, and GC marks accordingly', () => {
    expect(getReachable(beat('ada-null')).size).toBe(0);
    const mark = beat('gc-mark');
    for (const o of mark.objects)
      expect(o.state).toBe(getReachable(mark).has(o.id) ? 'marked' : 'unmarked');
    expect(beat('gc-sweep').objects.every((o) => o.state === 'collected')).toBe(true);
  });
});
