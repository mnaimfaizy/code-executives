import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../../../shared/snapshot';
import { traceSync } from '../../playground/tracer/trace';
import {
  getReachable,
  getReferences,
  incoming,
  slotKey,
  stateOf,
  STORY_BEATS,
  STORY_CODE,
  withState,
} from './garbageCollectionStory';
import type { HeapObjectState, StoryBeat } from './garbageCollectionStory';

// docs/stories/javascript/garbage-collection.md: the beats, and the key claim proved below.

const beat = (id: string) => STORY_BEATS.find((b) => b.id === id)!;
const before = (b: StoryBeat) => STORY_BEATS[STORY_BEATS.indexOf(b) - 1];
const codeLines = STORY_CODE.split('\n');
const words = (text: string) => text.trim().split(/\s+/).length;
const sorted = (ids: Iterable<string>) => [...ids].sort();

const OBJECTS = ['page', 'page0', 'draft', 'draft0'];
const PAIRS = [
  ['page', 'page0'],
  ['draft', 'draft0'],
];

const markingDone = beat('marking-done');
const swept = beat('cycle-swept');

describe('garbage collection story model', () => {
  it('tells the approved 9 beats, in order', () => {
    expect(STORY_BEATS.map((b) => b.id)).toEqual([
      'two-pairs',
      'draft-dropped',
      'roots',
      'mark-from-root',
      'mark-through-heap',
      'already-marked',
      'marking-done',
      'cycle-swept',
      'collection-ends',
    ]);
    expect(new Set(STORY_BEATS.map((b) => b.id)).size).toBe(9);
  });

  it('walks a runnable program of at most 20 lines that returns what the last beat reads', () => {
    expect(codeLines.length).toBeLessThanOrEqual(20);
    const result: unknown = new Function(STORY_CODE.replace(/run\(\);$/, 'return run();'))();
    expect(result).toBe('page.0');
  });

  it.each(STORY_BEATS)('$id is internally consistent', (b) => {
    expect(b.line).toBeGreaterThanOrEqual(1);
    expect(b.line).toBeLessThanOrEqual(codeLines.length);
    expect(codeLines[b.line - 1].trim()).not.toBe('');
    expect(words(b.title)).toBeLessThanOrEqual(8);
    expect(words(b.caption)).toBeLessThanOrEqual(60);

    const objectIds = new Set(b.objects.map((o) => o.id));
    for (const ref of getReferences(b)) expect(objectIds).toContain(ref.to);

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
  });

  it('keeps both frames, all four objects and every cell on every beat', () => {
    const first = STORY_BEATS[0];
    for (const b of STORY_BEATS) {
      expect(b.frames.map((f) => f.id)).toEqual(['global', 'run']);
      expect(b.objects.map((o) => o.id)).toEqual(OBJECTS);
      expect(b.objects.map((o) => o.cell)).toEqual(first.objects.map((o) => o.cell));
      // The only roots in this story are its frames, and no queue region is recorded.
      expect(b.roots).toBeUndefined();
      expect(b.microtasks ?? b.tasks ?? b.timers).toBeUndefined();
    }
    // A 2×2 floor.
    for (const { cell } of first.objects) {
      expect(cell.col).toBeLessThan(2);
      expect(cell.row).toBeLessThan(2);
    }
  });

  it('marks from line 12 on, with the collector at work on beats 3 to 8 only', () => {
    expect(STORY_BEATS.map((b) => b.gcPhase ?? 'none')).toEqual([
      'none',
      'none',
      'mark',
      'mark',
      'mark',
      'mark',
      'mark',
      'sweep',
      'none',
    ]);
    for (const b of STORY_BEATS.filter((s) => s.gcPhase)) expect(b.line).toBe(12);
    expect(codeLines[11]).toContain('page.child.name');
  });

  it('starts with six references, and draft = null removes exactly one, from the stack', () => {
    const built = getReferences(beat('two-pairs')).map((ref) => ref.from);
    const dropped = getReferences(beat('draft-dropped')).map((ref) => ref.from);
    expect(built).toHaveLength(6);
    expect(built.filter((from) => !dropped.includes(from))).toEqual(['run.draft']);
    expect(sorted(getReachable(beat('two-pairs')))).toEqual(sorted(OBJECTS));
    // Nothing on the heap is freed, or changed, by the line.
    expect(beat('draft-dropped').objects).toEqual(beat('two-pairs').objects);
  });
});

describe('the key claim: the sweep reclaims what no root reaches, referenced or not', () => {
  it('1. reclaims two objects that each still have a reference arriving (the aha)', () => {
    for (const [id, other] of [
      ['draft', 'draft0'],
      ['draft0', 'draft'],
    ]) {
      const arriving = incoming(markingDone, id);
      expect(arriving).toHaveLength(1);
      expect(arriving[0].fromOwner).toBe(other);
      expect(getReachable(markingDone).has(id)).toBe(false);
      expect(stateOf(swept, id)).toBe('collected');
    }
    // A rule that waits for no reference to arrive never fires for either, on any beat before.
    for (const b of STORY_BEATS.slice(0, STORY_BEATS.indexOf(swept))) {
      expect(incoming(b, 'draft').length).toBeGreaterThan(0);
      expect(incoming(b, 'draft0').length).toBeGreaterThan(0);
    }
  });

  it('2. treats two pairs of the same shape differently because of one reference', () => {
    const fromHeap = (id: string) =>
      incoming(markingDone, id).filter((ref) => ref.fromKind === 'object');
    const inside = ([parent, child]: string[]) => [
      fromHeap(child).map((ref) => [ref.fromOwner === parent, ref.from.split('.')[1]]),
      fromHeap(parent).map((ref) => [ref.fromOwner === child, ref.from.split('.')[1]]),
    ];
    expect(inside(PAIRS[0])).toEqual([[[true, 'child']], [[true, 'parent']]]);
    expect(inside(PAIRS[1])).toEqual(inside(PAIRS[0]));
    for (const id of OBJECTS) expect(fromHeap(id)).toHaveLength(1);

    const fromStack = getReferences(markingDone).filter((ref) => ref.fromKind === 'frame');
    expect(fromStack.map((ref) => ref.from)).toEqual(['run.page']);

    const withoutIt: Snapshot = {
      ...markingDone,
      frames: markingDone.frames.map((frame) => ({
        ...frame,
        slots: frame.slots.map((slot) =>
          slotKey(frame.id, slot.name) === 'run.page' ? { name: slot.name, value: 'null' } : slot
        ),
      })),
    };
    expect(getReachable(withoutIt).size).toBe(0);
  });

  it('3. marks exactly what is reachable, and never marks anything else', () => {
    const reachable = sorted(getReachable(markingDone));
    expect(sorted(withState(markingDone, 'marked'))).toEqual(reachable);
    expect(sorted(withState(markingDone, 'unmarked'))).toEqual(
      sorted(OBJECTS.filter((id) => !reachable.includes(id)))
    );
    expect(withState(markingDone, 'marked').length).toBeGreaterThan(0);
    expect(withState(markingDone, 'unmarked').length).toBeGreaterThan(0);
    for (const b of STORY_BEATS) {
      for (const id of withState(b, 'marked')) expect(getReachable(b).has(id)).toBe(true);
    }
  });

  it('4. gives a mark only along a focused reference from a root or a marked object', () => {
    const marking: string[] = [];
    for (const b of STORY_BEATS.slice(1)) {
      const earlier = before(b);
      const newlyMarked = withState(b, 'marked').filter((id) => stateOf(earlier, id) !== 'marked');
      if (newlyMarked.length === 0) continue;
      marking.push(b.id);
      expect(newlyMarked).toHaveLength(1);
      const followed = incoming(b, newlyMarked[0]).filter((ref) => b.focus.includes(ref.from));
      expect(followed).toHaveLength(1);
      const [ref] = followed;
      expect(ref.fromKind === 'frame' || stateOf(earlier, ref.fromOwner) === 'marked').toBe(true);
      expect(b.focus).toContain(newlyMarked[0]);
    }
    expect(marking).toEqual(['mark-from-root', 'mark-through-heap']);
    // The first mark comes from a frame, the second from the object marked before it.
    expect(incoming(beat('mark-from-root'), 'page').map((ref) => ref.fromKind)).toContain('frame');
    expect(stateOf(beat('mark-from-root'), 'page0')).toBe('live');
  });

  it('5. is not trapped by a cycle: the reference back ends at an object already marked', () => {
    const back = beat('already-marked');
    expect(back.objects).toEqual(before(back).objects);
    const followed = getReferences(back).filter((ref) => back.focus.includes(ref.from));
    expect(followed.map((ref) => [ref.from, ref.to])).toEqual([['page0.parent', 'page']]);
    expect(stateOf(before(back), 'page')).toBe('marked');
    // With that reference the page pair is a cycle: each of the two reaches the other.
    expect(incoming(back, 'page0').map((ref) => ref.fromOwner)).toEqual(['page']);
    expect(incoming(back, 'page').map((ref) => ref.fromOwner)).toContain('page0');
  });

  it('6. sweeps by the marks: every unmarked object, and no marked one', () => {
    expect(withState(swept, 'collected')).toEqual(withState(markingDone, 'unmarked'));
    expect(withState(swept, 'collected')).toEqual(['draft', 'draft0']);
    for (const id of withState(markingDone, 'marked')) expect(stateOf(swept, id)).toBe('marked');
    // The reclaimed objects' slots no longer count as references.
    expect(getReferences(swept).map((ref) => ref.from)).toEqual([
      'run.page',
      'page.child',
      'page0.parent',
    ]);
  });

  it('7. loses nothing the program uses', () => {
    const end = beat('collection-ends');
    for (const id of PAIRS[0]) {
      expect(stateOf(end, id)).toBe('live');
      expect(getReachable(end).has(id)).toBe(true);
    }
    expect(withState(end, 'marked')).toEqual([]);
    const collected = withState(end, 'collected');
    expect(collected).toEqual(['draft', 'draft0']);
    for (const ref of getReferences(end)) expect(collected).not.toContain(ref.to);
    // What line 12 reads is still there: run.page → page → child → page0.name.
    const page = end.objects.find((o) => o.id === end.frames[1].slots[0].refId)!;
    const child = end.objects.find(
      (o) => o.id === page.slots.find((s) => s.name === 'child')!.refId
    );
    expect(child?.slots.find((s) => s.name === 'name')?.value).toBe("'page.0'");
  });

  it('8. only moves states forward, and a collected object never returns', () => {
    const path = (id: string) =>
      STORY_BEATS.map((b) => stateOf(b, id)!).filter(
        (state, index, all) => index === 0 || state !== all[index - 1]
      );
    const kept: HeapObjectState[] = ['live', 'marked', 'live'];
    const freed: HeapObjectState[] = ['live', 'unmarked', 'collected'];
    expect(path('page')).toEqual(kept);
    expect(path('page0')).toEqual(kept);
    expect(path('draft')).toEqual(freed);
    expect(path('draft0')).toEqual(freed);
    // No object is called unmarked before marking has ended.
    for (const b of STORY_BEATS.slice(0, STORY_BEATS.indexOf(markingDone))) {
      expect(withState(b, 'unmarked')).toEqual([]);
    }
  });
});

/**
 * The same program in the Playground (ADR 0004). A trace's ids are its own, so a step is read by
 * shape: a frame is its place on the stack, and an object is the string in its `name` slot, which
 * is what the story's ids are made from (`'page.0'` is `page0`).
 */
describe('tracing the story code with the Playground tracer', () => {
  const trace = traceSync(STORY_CODE);
  const FRAME_IDS = ['global', 'run'];

  /** Frames, objects and slots only, with the story's ids: no cell, and no authored field. */
  const byShape = (snapshot: Snapshot): Snapshot => {
    const renamed = new Map<string, string>();
    snapshot.frames.forEach((frame, index) => renamed.set(frame.id, FRAME_IDS[index] ?? frame.id));
    for (const object of snapshot.objects) {
      const name = object.slots.find((slot) => slot.name === 'name')?.value;
      if (name) renamed.set(object.id, name.replace(/['.]/g, ''));
    }
    const slots = (owner: { slots: Snapshot['frames'][number]['slots'] }) =>
      owner.slots.map((slot) =>
        slot.refId
          ? { name: slot.name, refId: renamed.get(slot.refId) ?? slot.refId }
          : { name: slot.name, value: slot.value }
      );
    return {
      frames: snapshot.frames.map((frame) => ({
        id: renamed.get(frame.id)!,
        name: frame.name,
        slots: slots(frame),
      })),
      objects: snapshot.objects.map((object) => ({
        id: renamed.get(object.id) ?? object.id,
        label: object.label,
        kind: object.kind,
        slots: slots(object),
        state: object.state,
      })),
    };
  };

  /** The step that has just run a line of `run`, with the stack back to `global` and `run`. */
  const after = (line: number) => {
    const step = trace.steps.find(
      (s) => s.line === line && s.kind === 'statement' && s.snapshot.frames.length === 2
    );
    expect(step, `a step after line ${line}`).toBeDefined();
    return byShape(step!.snapshot);
  };

  const pairsOnly = (ids: Iterable<string>) => sorted(ids).filter((id) => OBJECTS.includes(id));

  it('runs to the end', () => {
    expect(trace.error).toBeUndefined();
    expect(trace.outcome).toBe('completed');
  });

  it.each([
    ['two-pairs', 10, 6],
    ['draft-dropped', 11, 5],
  ] as const)(
    'holds beat %s after line %i: the same frames, objects and references',
    (id, line, n) => {
      const step = after(line);
      const wanted = byShape(beat(id));
      expect(beat(id).line).toBe(line);
      expect(step.frames).toEqual(wanted.frames);
      // Whatever else a trace puts on the heap, the story's four objects are there with these slots.
      expect(step.objects.filter((object) => OBJECTS.includes(object.id))).toEqual(wanted.objects);
      const between = getReferences(step).filter((ref) => OBJECTS.includes(ref.to));
      expect(between).toEqual(getReferences(wanted));
      expect(between).toHaveLength(n);
    }
  );

  it('leaves unreachable after line 11 exactly the two objects the story sweeps', () => {
    const step = after(11);
    const unreachable = step.objects
      .map((object) => object.id)
      .filter((id) => !getReachable(step).has(id));
    expect(sorted(unreachable)).toEqual(sorted(withState(swept, 'collected')));
    expect(pairsOnly(getReachable(step))).toEqual(sorted(withState(swept, 'marked')));
    // Before the line, nothing is: the run and the story agree on what the line changes.
    const built = after(10);
    expect(built.objects.filter((object) => !getReachable(built).has(object.id))).toEqual([]);
  });

  it('has the stack of the last beat while line 12 runs', () => {
    const returning = trace.steps.find((s) => s.line === 12 && s.snapshot.frames.length === 2);
    expect(returning).toBeDefined();
    expect(byShape(returning!.snapshot).frames).toEqual(byShape(beat('collection-ends')).frames);
  });

  /**
   * Beats 3 to 8 are authored: a run cannot observe roots being read, a mark or a sweep, and it
   * cannot make a collection start at line 12 (ADR 0004). So no step is compared with them.
   */
  it('cannot show the collection: beats 3 to 8 are authored, and a run never marks or reclaims', () => {
    const authored = STORY_BEATS.filter((b) => b.gcPhase !== undefined);
    expect(authored.map((b) => b.id)).toEqual(STORY_BEATS.slice(2, 8).map((b) => b.id));
    for (const b of authored) {
      // Each is the moment of the run after line 11: only what the collector knows differs.
      expect(byShape(b).frames).toEqual(after(11).frames);
      expect(b.objects.some((o) => o.state !== 'live') || b.id === 'roots').toBe(true);
    }
    for (const step of trace.steps) {
      for (const object of step.snapshot.objects) expect(object.state).toBe('live');
    }
    // The draft pair stays on the heap to the last step, where the story has it reclaimed.
    const end = byShape(trace.steps[trace.steps.length - 1].snapshot);
    expect(pairsOnly(end.objects.map((object) => object.id))).toEqual(sorted(OBJECTS));
    expect(withState(beat('collection-ends'), 'collected')).toEqual(['draft', 'draft0']);
  });
});
