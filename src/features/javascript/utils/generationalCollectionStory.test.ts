import { describe, expect, it } from 'vitest';
import { traceSync } from '../../playground/tracer/trace';
import {
  copiesOf,
  getCopyTrails,
  getReachable,
  getReferences,
  incoming,
  isSpaceFreed,
  objectsInSpace,
  originOf,
  slotKey,
  spaceOf,
  stateOf,
  STORY_BEATS,
  STORY_CODE,
  withState,
} from './generationalCollectionStory';
import type { HeapObject, StoryBeat } from './generationalCollectionStory';

// docs/stories/javascript/generational-collection.md: the beats, and the claims proved below.

const beat = (id: string) => STORY_BEATS.find((b) => b.id === id)!;
const before = (b: StoryBeat) => STORY_BEATS[STORY_BEATS.indexOf(b) - 1];
const objectOf = (b: StoryBeat, id: string): HeapObject => b.objects.find((o) => o.id === id)!;
const codeLines = STORY_CODE.split('\n');
const words = (text: string) => text.trim().split(/\s+/).length;
const sorted = (ids: Iterable<string>) => [...ids].sort();
const roleOf = (b: StoryBeat, spaceId: string) => b.spaces.find((s) => s.id === spaceId)?.role;
const cacheRef = (b: StoryBeat) => getReferences(b).find((ref) => ref.from === 'global.cache')?.to;

/** Spec table: the object ids present on each beat, in heap order. */
const PRESENT: Record<string, string[]> = {
  'temps-made': ['cache', 't1', 't2'],
  'died-young': ['cache', 't1', 't2'],
  'minor-starts': ['cache', 't1', 't2'],
  'copy-survivor': ['cache', 't1', 't2', 'cache-b'],
  'reference-moved': ['cache', 't1', 't2', 'cache-b'],
  'from-space-freed': ['cache', 't1', 't2', 'cache-b'],
  'second-batch': ['cache', 't1', 't2', 'cache-b', 't3', 't4'],
  promoted: ['cache', 't1', 't2', 'cache-b', 't3', 't4', 'cache-old'],
  'young-freed-again': ['cache', 't1', 't2', 'cache-b', 't3', 't4', 'cache-old'],
  'in-old-generation': ['cache', 't1', 't2', 'cache-b', 't3', 't4', 'cache-old'],
};

describe('generational collection story model', () => {
  it('tells the approved 10 beats, in order, with the spec lines, shots and phases', () => {
    expect(STORY_BEATS.map((b) => [b.id, b.line, b.shot, b.gcPhase ?? 'none'])).toEqual([
      ['temps-made', 6, 'overview', 'none'],
      ['died-young', 15, 'bridge', 'none'],
      ['minor-starts', 15, 'gc', 'scavenge'],
      ['copy-survivor', 15, 'gc', 'scavenge'],
      ['reference-moved', 15, 'bridge', 'scavenge'],
      ['from-space-freed', 15, 'heap', 'scavenge'],
      ['second-batch', 16, 'overview', 'none'],
      ['promoted', 16, 'gc', 'scavenge'],
      ['young-freed-again', 16, 'heap', 'scavenge'],
      ['in-old-generation', 16, 'overview', 'none'],
    ]);
    expect(new Set(STORY_BEATS.map((b) => b.id)).size).toBe(10);
  });

  it('keeps the corrected beat 4 caption', () => {
    expect(beat('copy-survivor').caption).toContain(
      'There is no separate marking pass: finding a live object and copying it happen together.'
    );
  });

  it('walks a runnable program of 16 lines that leaves cache.calls at 4', () => {
    expect(codeLines).toHaveLength(16);
    expect(codeLines[5].trim()).toBe('return temp.doubled;');
    expect(codeLines[14]).toMatch(/^batch\(\);/);
    expect(codeLines[15]).toMatch(/^batch\(\);/);
    const calls: unknown = new Function(`${STORY_CODE}\nreturn cache.calls;`)();
    expect(calls).toBe(4);
  });

  it.each(STORY_BEATS)('$id is internally consistent', (b) => {
    expect(b.line).toBeGreaterThanOrEqual(1);
    expect(b.line).toBeLessThanOrEqual(codeLines.length);
    expect(codeLines[b.line - 1].trim()).not.toBe('');
    expect(words(b.title)).toBeLessThanOrEqual(8);
    expect(words(b.caption)).toBeLessThanOrEqual(60);

    expect(b.objects.map((o) => o.id)).toEqual(PRESENT[b.id]);

    const objectIds = new Set(b.objects.map((o) => o.id));
    for (const ref of getReferences(b)) expect(objectIds).toContain(ref.to);
    for (const o of b.objects) if (o.copyOf) expect(objectIds).toContain(o.copyOf);

    const keys = new Set<string>([
      ...b.frames.map((f) => f.id),
      ...b.objects.map((o) => o.id),
      ...b.frames.flatMap((f) => f.slots.map((sl) => slotKey(f.id, sl.name))),
      ...b.objects.flatMap((o) => o.slots.map((sl) => slotKey(o.id, sl.name))),
    ]);
    expect(b.focus.length).toBeGreaterThan(0);
    for (const key of b.focus) expect(keys).toContain(key);

    const cells = b.objects.map((o) => `${o.cell.col},${o.cell.row}`);
    expect(new Set(cells).size).toBe(cells.length);
    // A 3×3 floor, every object inside one of the three spaces.
    for (const o of b.objects) {
      expect(o.cell.col).toBeLessThan(3);
      expect(spaceOf(b, o.id)).toBeDefined();
    }
    expect(b.roots).toBeUndefined();
    expect(b.microtasks ?? b.tasks ?? b.timers).toBeUndefined();
  });

  it('keeps every object in one cell, and the same slots except cache-b.calls, across beats', () => {
    const seen = new Map<string, HeapObject>();
    for (const b of STORY_BEATS) {
      for (const o of b.objects) {
        const first = seen.get(o.id);
        if (!first) {
          seen.set(o.id, o);
          continue;
        }
        expect(o.cell).toEqual(first.cell);
        expect(o.copyOf).toBe(first.copyOf);
        if (o.id !== 'cache-b') expect(o.slots).toEqual(first.slots);
      }
    }
    expect(seen.size).toBe(7);
    // The program writes to the copy, between the collections.
    expect(
      STORY_BEATS.filter((b) => stateOf(b, 'cache-b')).map(
        (b) => objectOf(b, 'cache-b').slots[0].value
      )
    ).toEqual(['2', '2', '2', '4', '4', '4', '4']);
  });

  it('has three frames on beat 1 and only the global frame afterwards', () => {
    expect(STORY_BEATS[0].frames.map((f) => f.name)).toEqual(['global', 'batch()', 'handle(2)']);
    expect(getReferences(STORY_BEATS[0]).map((ref) => [ref.from, ref.to])).toEqual([
      ['global.cache', 'cache'],
      ['handle.temp', 't2'],
    ]);
    for (const b of STORY_BEATS.slice(1)) expect(b.frames.map((f) => f.id)).toEqual(['global']);
  });

  it('points global.cache at cache, then at each copy as it is made', () => {
    expect(STORY_BEATS.map(cacheRef)).toEqual([
      'cache',
      'cache',
      'cache',
      'cache',
      'cache-b',
      'cache-b',
      'cache-b',
      'cache-old',
      'cache-old',
      'cache-old',
    ]);
    // To the program it is one object on every beat.
    for (const b of STORY_BEATS) expect(originOf(b, cacheRef(b)!)).toBe('cache');
  });

  it('lays out the three spaces, one row each, with roles on beats 3–9 that swap on beat 7', () => {
    for (const b of STORY_BEATS) {
      expect(b.spaces.map((s) => [s.id, s.row])).toEqual([
        ['young-a', 0],
        ['young-b', 1],
        ['old', 2],
      ]);
      expect(roleOf(b, 'old')).toBeUndefined();
    }
    // Roles are set on beats 3–9 only, and swap on beat 7.
    expect(STORY_BEATS.map((b) => [roleOf(b, 'young-a'), roleOf(b, 'young-b')])).toEqual([
      [undefined, undefined],
      [undefined, undefined],
      ['from', 'to'],
      ['from', 'to'],
      ['from', 'to'],
      ['from', 'to'],
      ['to', 'from'],
      ['to', 'from'],
      ['to', 'from'],
      [undefined, undefined],
    ]);
    // New objects appear in the from-space: the first temps in A, the second in B after the swap.
    expect(spaceOf(beat('minor-starts'), 't1')?.role).toBe('from');
    expect(spaceOf(beat('second-batch'), 't3')?.role).toBe('from');
    expect(objectsInSpace(beat('second-batch'), 'young-b')).toEqual(['cache-b', 't3', 't4']);
  });
});

describe('the copy rule: a move is a copy, and the original stays in its cell', () => {
  it('gives every copied object exactly one copy, in another space', () => {
    let checked = 0;
    for (const b of STORY_BEATS) {
      for (const id of withState(b, 'copied')) {
        const copies = copiesOf(b, id);
        expect(copies).toHaveLength(1);
        expect(spaceOf(b, copies[0])?.id).not.toBe(spaceOf(b, id)?.id);
        checked++;
      }
      expect(getCopyTrails(b).map((t) => t.from)).toEqual(withState(b, 'copied'));
    }
    expect(checked).toBe(3);
  });

  it('beat 4: cache-b enters with the slots cache has on that beat', () => {
    const b = beat('copy-survivor');
    expect(stateOf(before(b), 'cache-b')).toBeUndefined();
    expect(objectOf(b, 'cache-b').copyOf).toBe('cache');
    expect(objectOf(b, 'cache-b').slots).toEqual(objectOf(b, 'cache').slots);
    expect(stateOf(b, 'cache')).toBe('copied');
    expect(getCopyTrails(b)).toEqual([{ id: 'cache->cache-b', from: 'cache', to: 'cache-b' }]);
    // The reference has not moved yet: that is beat 5.
    expect(cacheRef(b)).toBe('cache');
  });

  it('beat 8: cache-old enters with the slots cache-b had on beat 7', () => {
    const b = beat('promoted');
    expect(objectOf(b, 'cache-old').copyOf).toBe('cache-b');
    expect(objectOf(b, 'cache-old').slots).toEqual(objectOf(before(b), 'cache-b').slots);
    expect(objectOf(b, 'cache-old').slots).toEqual(objectOf(b, 'cache-b').slots);
    expect(spaceOf(b, 'cache-old')?.id).toBe('old');
    expect(originOf(b, 'cache-old')).toBe('cache');
  });

  it('beat 5: after the reference moves, nothing arrives at the original', () => {
    const b = beat('reference-moved');
    expect(incoming(b, 'cache')).toEqual([]);
    expect(incoming(b, 'cache-b').map((ref) => ref.from)).toEqual(['global.cache']);
    expect(getReachable(b)).toEqual(new Set(['cache-b']));
    expect(b.objects.filter((o) => o.id !== 'cache-b')).toEqual(
      before(b).objects.filter((o) => o.id !== 'cache-b')
    );
  });

  it('moves states only forward: live, copied, collected', () => {
    const path = (id: string) =>
      STORY_BEATS.map((b) => stateOf(b, id))
        .filter((state) => state !== undefined)
        .filter((state, index, all) => index === 0 || state !== all[index - 1]);
    expect(path('cache')).toEqual(['live', 'copied', 'collected']);
    expect(path('cache-b')).toEqual(['live', 'copied', 'collected']);
    for (const id of ['t1', 't2', 't3', 't4']) expect(path(id)).toEqual(['live', 'collected']);
    expect(path('cache-old')).toEqual(['live']);
    // A copying collection marks nothing.
    for (const b of STORY_BEATS) {
      expect(withState(b, 'marked')).toEqual([]);
      expect(withState(b, 'unmarked')).toEqual([]);
    }
  });
});

describe('the aha (beat 6): a minor collection costs what survives, not what died', () => {
  /** The beats of one collection, from its start to the beat its from-space is freed. */
  const collection = (start: string, freed: string) =>
    STORY_BEATS.slice(STORY_BEATS.indexOf(beat(start)), STORY_BEATS.indexOf(beat(freed)) + 1);

  it.each([
    ['young-a', 'minor-starts', 'from-space-freed', ['t1', 't2'], 'cache'],
    ['young-b', 'promoted', 'young-freed-again', ['t3', 't4'], 'cache-b'],
  ] as const)(
    'frees %s as a whole on %s..%s, visiting only the survivor',
    (space, start, freed, dead, survivor) => {
      const beats = collection(start, freed);
      const last = beats[beats.length - 1];
      const firstLook = beats[0].id === 'minor-starts' ? beats[0] : before(beats[0]);

      // Before the collection the dead are unreachable and the survivor is reachable.
      for (const id of dead) expect(getReachable(firstLook).has(id)).toBe(false);
      expect(getReachable(firstLook).has(survivor)).toBe(true);
      expect(roleOf(firstLook, space)).toBe('from');

      // Up to the freeing beat the dead never change and are never in focus.
      for (const b of beats.slice(0, -1)) {
        for (const id of dead) {
          expect(stateOf(b, id)).toBe('live');
          expect(objectOf(b, id)).toEqual(objectOf(firstLook, id));
          expect(b.focus).not.toContain(id);
        }
        expect(isSpaceFreed(b, space)).toBe(false);
      }

      // On the freeing beat the whole space is collected together, in that one beat.
      expect(isSpaceFreed(last, space)).toBe(true);
      const freedNow = objectsInSpace(last, space).filter(
        (id) => stateOf(before(last), id) !== 'collected'
      );
      expect(sorted(freedNow)).toEqual(sorted([survivor, ...dead]));
      expect(sorted(withState(last, 'collected')).filter((id) => freedNow.includes(id))).toEqual(
        sorted(freedNow)
      );

      // Exactly one object was copied during the collection: the survivor.
      const copied = new Set(beats.flatMap((b) => withState(b, 'copied')));
      expect([...copied]).toEqual([survivor]);
      // What the program uses is not in the freed space.
      for (const id of getReachable(last)) expect(spaceOf(last, id)?.id).not.toBe(space);
    }
  );

  it('keeps freeing one copy, whatever died: the first collection had two dead and one copy', () => {
    const freed = beat('from-space-freed');
    const dead = objectsInSpace(freed, 'young-a').filter((id) => copiesOf(freed, id).length === 0);
    const copiedOut = objectsInSpace(freed, 'young-a').filter(
      (id) => copiesOf(freed, id).length > 0
    );
    expect(dead).toEqual(['t1', 't2']);
    expect(copiedOut).toEqual(['cache']);
  });
});

describe('beat 10: the survivor lives in the old generation', () => {
  it('holds only cache-old as reachable, outside the young generation', () => {
    const end = beat('in-old-generation');
    expect(getReachable(end)).toEqual(new Set(['cache-old']));
    expect(spaceOf(end, 'cache-old')?.id).toBe('old');
    expect(isSpaceFreed(end, 'young-a')).toBe(true);
    expect(isSpaceFreed(end, 'young-b')).toBe(true);
    expect(end.objects).toEqual(before(end).objects);
  });
});

/**
 * The Playground cannot observe a collection, a copy or a promotion (ADR 0004): a trace of the
 * same program has one heap region and none of the story-only fields.
 */
describe('tracing the story code with the Playground tracer', () => {
  const trace = traceSync(STORY_CODE);

  it('runs to the end and never sets spaces, copyOf or a copied state', () => {
    expect(trace.error).toBeUndefined();
    expect(trace.outcome).toBe('completed');
    expect(trace.steps.length).toBeGreaterThan(0);
    for (const step of trace.steps) {
      expect(step.snapshot.spaces).toBeUndefined();
      for (const object of step.snapshot.objects) {
        expect(object.copyOf).toBeUndefined();
        expect(object.state).toBe('live');
      }
    }
  });
});
