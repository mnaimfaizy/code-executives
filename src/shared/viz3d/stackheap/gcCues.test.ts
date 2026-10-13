import { describe, expect, it } from 'vitest';
import { STORY_BEATS as GC_BEATS } from '../../../features/javascript/utils/garbageCollectionStory';
import { STORY_BEATS as STACK_HEAP_BEATS } from '../../../features/javascript/utils/stackHeapStory';
import { getReferences, type HeapState } from '../../snapshot';
import { labelLean, markTag, rootPulsePlays } from './gcCues';

const STATES: HeapState[] = ['live', 'marked', 'unmarked', 'collected'];

describe('markTag', () => {
  it('tags a marked object only while a collection runs', () => {
    expect(markTag('marked', 'mark')).toBe('MARKED');
    expect(markTag('marked', 'sweep')).toBe('MARKED');
    // A Playground trace passes no phase: its lens uses `marked` for an object held by a frame
    // that is not drawn, and that object must look like any live one.
    expect(markTag('marked', undefined)).toBeNull();
  });

  it('tags an unmarked object whatever the phase, as before', () => {
    expect(markTag('unmarked', 'mark')).toBe('UNMARKED');
    expect(markTag('unmarked', undefined)).toBe('UNMARKED');
  });

  it('gives a live or a collected object no mark tag', () => {
    for (const phase of ['mark', 'sweep', undefined] as const) {
      expect(markTag('live', phase)).toBeNull();
      expect(markTag('collected', phase)).toBeNull();
    }
  });

  it('never tags anything MARKED without a phase', () => {
    for (const state of STATES) expect(markTag(state, undefined)).not.toBe('MARKED');
  });

  it('tags the Garbage Collection story as its spec says', () => {
    const tagged = (index: number) =>
      GC_BEATS[index].objects.map((o) => markTag(o.state, GC_BEATS[index].gcPhase));
    // Beats 1 to 3: no mark yet. Beat 4: page. Beats 5 and 6: the page pair.
    for (const i of [0, 1, 2]) expect(tagged(i)).toEqual([null, null, null, null]);
    expect(tagged(3)).toEqual(['MARKED', null, null, null]);
    expect(tagged(4)).toEqual(['MARKED', 'MARKED', null, null]);
    expect(tagged(5)).toEqual(['MARKED', 'MARKED', null, null]);
    // Beat 7: all four objects carry a tag at once. Beat 8: the draft pair is reclaimed.
    expect(tagged(6)).toEqual(['MARKED', 'MARKED', 'UNMARKED', 'UNMARKED']);
    expect(tagged(7)).toEqual(['MARKED', 'MARKED', null, null]);
    // Beat 9: the collection is over and the marks are gone.
    expect(tagged(8)).toEqual([null, null, null, null]);
  });
});

describe('rootPulsePlays', () => {
  const plays = (beats: typeof GC_BEATS | typeof STACK_HEAP_BEATS) =>
    beats.filter((b) => rootPulsePlays(b.gcPhase, b.focus, b.frames)).map((b) => b.id);

  it('plays on the one beat of the Garbage Collection story that is about the roots', () => {
    expect(GC_BEATS.filter((b) => b.gcPhase === 'mark')).toHaveLength(5);
    expect(plays(GC_BEATS)).toEqual(['roots']);
  });

  it("still plays on the Stack ↔ Heap story's mark beat, which focuses its frames", () => {
    const markBeats = STACK_HEAP_BEATS.filter((b) => b.gcPhase === 'mark').map((b) => b.id);
    expect(markBeats).toHaveLength(1);
    expect(plays(STACK_HEAP_BEATS)).toEqual(markBeats);
  });

  it('needs a mark phase and a frame in focus', () => {
    const frames = [{ id: 'main', name: 'main()', slots: [] }];
    expect(rootPulsePlays('mark', ['main'], frames)).toBe(true);
    expect(rootPulsePlays('mark', ['main.x', 'obj'], frames)).toBe(false);
    expect(rootPulsePlays('sweep', ['main'], frames)).toBe(false);
    expect(rootPulsePlays(undefined, ['main'], frames)).toBe(false);
  });
});

describe('labelLean', () => {
  it('centres every label outside the gc shot', () => {
    for (const shot of ['overview', 'stack', 'bridge', 'heap'] as const)
      for (const col of [0, 1, 2])
        for (const held of [true, false]) expect(labelLean(shot, col, 2, held)).toBe('-50%');
  });

  it('leans the outer columns outward in the gc shot', () => {
    expect(labelLean('gc', 0, 2, false)).toBe('-80%');
    expect(labelLean('gc', 1, 2, false)).toBe('-50%');
    expect(labelLean('gc', 2, 2, false)).toBe('-20%');
    // A one-column floor keeps its lean toward the stack.
    expect(labelLean('gc', 0, 0, false)).toBe('-80%');
  });

  it('keeps a first-column label centred when an arc from the stack lands on its object', () => {
    expect(labelLean('gc', 0, 1, true)).toBe('-50%');
    // The other columns are not in that arc's path.
    expect(labelLean('gc', 1, 1, true)).toBe('-20%');
  });

  it("leaves every label of the Stack ↔ Heap story's gc beats where it was", () => {
    const gcBeats = STACK_HEAP_BEATS.filter((b) => b.shot === 'gc');
    expect(gcBeats.length).toBeGreaterThan(0);
    for (const beat of gcBeats)
      expect(
        getReferences(beat).filter((r) => r.fromKind === 'frame'),
        beat.id
      ).toEqual([]);
  });

  it('centres the label of `page` on every gc beat of the Garbage Collection story', () => {
    const gcBeats = GC_BEATS.filter((b) => b.shot === 'gc');
    expect(gcBeats.map((b) => b.id)).toEqual([
      'mark-from-root',
      'mark-through-heap',
      'already-marked',
      'marking-done',
      'cycle-swept',
    ]);
    for (const beat of gcBeats) {
      const held = getReferences(beat)
        .filter((r) => r.fromKind === 'frame')
        .map((r) => r.to);
      expect(held, beat.id).toEqual(['page']);
    }
  });
});
