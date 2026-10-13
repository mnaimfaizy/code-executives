import { describe, expect, it } from 'vitest';
import {
  getReachable,
  getReferences,
  gridOf,
  placeTrace,
  type Snapshot,
} from '../../../../../shared/snapshot';
import { STORY_CODE } from '../../../../javascript/utils/stackHeapStory';
import { traceSync, type Step } from '../../../tracer';
import {
  HEAP_LIMITS,
  MAX_DRAWN_FRAMES,
  MAX_DRAWN_OBJECTS_2D,
  MAX_DRAWN_OBJECTS_3D,
  NOT_RECORDED,
  SHOWN_IN_2D_NOTE,
  SKIPPED_FRAMES_ID,
  TOP_FRAMES,
  describeStep,
  heapColsFor,
  heapFloorFor,
  notesFor,
  prepareTrace,
  selectStep,
  tooLargeMessage,
  trimFrames,
  viewForStep,
  type LensStep,
} from './stackHeapLensModel';

// The 3D floor, which was the floor of both views before 2D got its own
const { cols: MAX_HEAP_COLS, rows: MAX_HEAP_ROWS, objects: MAX_DRAWN_OBJECTS } = HEAP_LIMITS['3d'];

const RECURSION = `function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);
}
const r = fact(12);`;

/** 40 objects, each unreachable one turn after it is made; every tenth is kept. */
const LOOP = `const keep = [];
for (let i = 0; i < 40; i++) {
  const o = { i };
  if (i % 10 === 0) keep.push(o);
}`;

/** 15 objects that all stay reachable, and the array that holds them. */
const LOOP_KEEPING = `const keep = [];
for (let i = 0; i < 15; i++) {
  keep.push({ i });
}`;

/**
 * 25 objects that all stay reachable: too many for either view. A trace records the first 20
 * slots of the array that holds them, so the step holds 21 objects.
 */
const LOOP_KEEPING_25 = LOOP_KEEPING.replace('15', '25');

const ALIASING = `const a = { n: 1 };
const b = a;
b.n = 2;
const list = [a, b];`;

/** Each call holds an object that only its own frame can reach. */
const DEEP_HOLDERS = `function down(n) {
  const mine = { n };
  if (n === 0) return 0;
  return down(n - 1);
}
down(6);`;

const CLOSURE_ON_STACK = `function outer() {
  const inc = function () { return 1; };
  function deep(n) { return n === 0 ? inc() : deep(n - 1); }
  return deep(6);
}
outer();`;

const stepsOf = (code: string): Step[] => {
  const trace = traceSync(code);
  expect(trace.outcome).toBe('completed');
  return trace.steps;
};

const drawn = (step: LensStep) => {
  if (step.status !== 'drawn') throw new Error('step is not drawn');
  return step.snapshot;
};

/** Every reference in a drawing lands on something that is drawn. */
const expectNoDanglingReferences = (snapshot: Snapshot) => {
  const ids = new Set([...snapshot.frames.map((f) => f.id), ...snapshot.objects.map((o) => o.id)]);
  for (const ref of getReferences(snapshot)) expect(ids.has(ref.to), ref.id).toBe(true);
};

describe('limits', () => {
  it('draws at most a full floor, 20 objects in 2D and 9 in 3D, and five frame boxes', () => {
    expect(HEAP_LIMITS['2d']).toEqual({ cols: 5, rows: 4, objects: 20 });
    expect(HEAP_LIMITS['3d']).toEqual({ cols: 3, rows: 3, objects: 9 });
    expect(MAX_DRAWN_OBJECTS_2D).toBe(20);
    expect(MAX_DRAWN_OBJECTS_3D).toBe(9);
    expect(MAX_DRAWN_FRAMES).toBe(5);
    expect(MAX_DRAWN_FRAMES).toBe(TOP_FRAMES + 2);
  });

  it('keeps two columns until a run needs the third', () => {
    for (const view of ['2d', '3d'] as const) {
      expect(heapColsFor(0, view)).toBe(2);
      expect(heapColsFor(6, view)).toBe(2);
      expect(heapColsFor(7, view)).toBe(3);
      expect(heapFloorFor(9, view)).toEqual({ cols: 3, rows: 3 });
    }
  });

  it('gives 2D a fourth and a fifth column, with a fourth row; 3D stays at 3×3', () => {
    expect(heapFloorFor(10, '2d')).toEqual({ cols: 4, rows: 4 });
    expect(heapFloorFor(16, '2d')).toEqual({ cols: 4, rows: 4 });
    expect(heapFloorFor(17, '2d')).toEqual({ cols: 5, rows: 4 });
    expect(heapFloorFor(20, '2d')).toEqual({ cols: 5, rows: 4 });
    expect(heapFloorFor(10, '3d')).toEqual({ cols: 3, rows: 3 });
    expect(heapFloorFor(20)).toEqual(heapFloorFor(20, '2d'));
  });
});

describe('the Stack ↔ Heap story code', () => {
  const steps = stepsOf(STORY_CODE);
  const trace = prepareTrace(steps);

  it('draws every step whole, exactly as placeTrace places it', () => {
    // This lens draws the stack and the heap; the queue regions belong to the other lens.
    const placed = placeTrace(
      steps.map(({ snapshot }) => ({
        frames: snapshot.frames,
        objects: snapshot.objects,
        ...(snapshot.roots && { roots: snapshot.roots }),
      }))
    );
    trace.steps.forEach((step, i) => {
      expect(drawn(step)).toEqual(placed[i]);
      expect(notesFor(step)).toEqual([]);
    });
  });

  it("pins the story's own 2×2 floor for the whole run", () => {
    expect(trace.grid).toEqual({ cols: 2, rows: 2 });
  });

  it('never sets a garbage-collection state', () => {
    for (const step of trace.steps) {
      expect(drawn(step).objects.every((o) => o.state === 'live')).toBe(true);
    }
  });

  it('leaves the unreachable objects in the drawing, for the view to mark', () => {
    const last = drawn(trace.steps[trace.steps.length - 1]);
    expect(last.objects).toHaveLength(4);
    expect(getReachable(last).size).toBe(0);
  });
});

describe('deep recursion', () => {
  const steps = stepsOf(RECURSION);
  const trace = prepareTrace(steps);
  const deepest = steps.reduce(
    (a, s, i) => (s.snapshot.frames.length > steps[a].snapshot.frames.length ? i : a),
    0
  );

  it('leaves a short stack alone', () => {
    const frames = steps[deepest].snapshot.frames.slice(0, MAX_DRAWN_FRAMES);
    expect(trimFrames(frames)).toEqual({ frames, skipped: [] });
  });

  it('draws the global frame, one placeholder and the top frames', () => {
    const full = steps[deepest].snapshot.frames;
    expect(full).toHaveLength(13);
    const { frames } = drawn(trace.steps[deepest]);
    expect(frames).toHaveLength(MAX_DRAWN_FRAMES);
    expect(frames[0]).toEqual(full[0]);
    expect(frames[1].id).toBe(SKIPPED_FRAMES_ID);
    expect(frames[1].name).toBe('… 9 more frames');
    expect(frames.slice(2)).toEqual(full.slice(-TOP_FRAMES));
    expect(trace.steps[deepest].counts).toMatchObject({ frames: 13, framesNotShown: 9 });
    expect(notesFor(trace.steps[deepest])).toEqual(['9 frames not shown']);
  });

  it('never draws more than the limit of frames', () => {
    for (const step of trace.steps) {
      expect(drawn(step).frames.length).toBeLessThanOrEqual(MAX_DRAWN_FRAMES);
    }
  });

  it('keeps an object live when only a frame that is not drawn holds it', () => {
    const holders = stepsOf(DEEP_HOLDERS);
    const at = holders.reduce(
      (a, s, i) => (s.snapshot.frames.length > holders[a].snapshot.frames.length ? i : a),
      0
    );
    const full = holders[at].snapshot;
    const lens = prepareTrace(holders).steps[at];
    const snapshot = drawn(lens);
    const reachable = getReachable(full);
    const seenByView = getReachable(snapshot);
    const rescued = snapshot.objects.filter((o) => o.state === 'marked');
    expect(rescued.length).toBeGreaterThan(0);
    for (const o of snapshot.objects) {
      // What the view will call unreachable is exactly what the whole snapshot cannot reach.
      const viewSaysUnreachable = o.state === 'live' && !seenByView.has(o.id);
      expect(viewSaysUnreachable, o.id).toBe(!reachable.has(o.id));
    }
    expectNoDanglingReferences(snapshot);
  });

  it('points a closure at the placeholder when its scope is among the frames not drawn', () => {
    const closure = stepsOf(CLOSURE_ON_STACK);
    const lens = prepareTrace(closure);
    let repointed = 0;
    lens.steps.forEach((step, i) => {
      const snapshot = drawn(step);
      expectNoDanglingReferences(snapshot);
      if (step.counts.framesNotShown === 0) return;
      const skipped = new Set(closure[i].snapshot.frames.slice(1, -TOP_FRAMES).map((f) => f.id));
      for (const ref of getReferences(closure[i].snapshot)) {
        if (!skipped.has(ref.to)) continue;
        const now = getReferences(snapshot).find((r) => r.id === ref.id);
        if (now) {
          expect(now.to).toBe(SKIPPED_FRAMES_ID);
          repointed += 1;
        }
      }
    });
    expect(repointed).toBeGreaterThan(0);
  });
});

describe('a loop that allocates 40 objects, prepared for 3D', () => {
  const steps = stepsOf(LOOP);
  const trace = prepareTrace(steps, { view: '3d' });

  it('holds more objects than the lens draws', () => {
    expect(steps[steps.length - 1].snapshot.objects.length).toBe(41);
  });

  it('draws every step by hiding the unreachable objects once they no longer fit', () => {
    trace.steps.forEach((step, i) => {
      const full = steps[i].snapshot;
      const snapshot = drawn(step);
      expect(snapshot.objects.length).toBeLessThanOrEqual(MAX_DRAWN_OBJECTS);
      if (full.objects.length <= MAX_DRAWN_OBJECTS) {
        expect(snapshot.objects).toHaveLength(full.objects.length);
        expect(step.counts.unreachableHidden).toBe(0);
      } else {
        const reachable = getReachable(full);
        expect(snapshot.objects.map((o) => o.id)).toEqual(
          full.objects.filter((o) => reachable.has(o.id)).map((o) => o.id)
        );
        expect(step.counts.unreachableHidden).toBe(full.objects.length - reachable.size);
      }
      expectNoDanglingReferences(snapshot);
    });
  });

  it('says how many it hid', () => {
    const last = trace.steps[trace.steps.length - 1];
    expect(last.counts).toMatchObject({ objects: 41, reachable: 6, unreachableHidden: 35 });
    expect(notesFor(last)).toEqual(['35 unreachable objects hidden']);
  });

  it('pins a floor no larger than the limit, computed from what is drawn', () => {
    expect(trace.grid.cols).toBeLessThanOrEqual(MAX_HEAP_COLS);
    expect(trace.grid.rows).toBeLessThanOrEqual(MAX_HEAP_ROWS);
    const everyDrawn = trace.steps.flatMap((s) => drawn(s).objects);
    expect(trace.grid).toEqual(gridOf(everyDrawn));
    // Placing everything the run ever made would need a far deeper floor.
    const all = placeTrace(
      steps.map((s) => s.snapshot),
      { cols: MAX_HEAP_COLS }
    );
    expect(gridOf(all[all.length - 1].objects).rows).toBeGreaterThan(MAX_HEAP_ROWS);
  });

  it('never moves an object while it stays drawn, and never puts two on one cell', () => {
    let before = new Map<string, string>();
    for (const step of trace.steps) {
      const now = new Map(drawn(step).objects.map((o) => [o.id, `${o.cell.col},${o.cell.row}`]));
      expect(new Set(now.values()).size).toBe(now.size);
      for (const [id, cell] of now) {
        if (before.has(id)) expect(cell, id).toBe(before.get(id));
      }
      before = now;
    }
  });

  it('is too large when every object stays reachable', () => {
    const keeping = stepsOf(LOOP_KEEPING);
    const lens = prepareTrace(keeping, { view: '3d' });
    const last = lens.steps[lens.steps.length - 1];
    expect(last.status).toBe('too-large');
    expect(tooLargeMessage(last)).toBe(
      'This step holds 16 heap objects, 16 of them reachable. The lens draws up to 9.'
    );
    expect(notesFor(last)).toEqual([]);
    // The early steps still fit and are drawn; the floor comes from those alone.
    expect(lens.steps[0].status).toBe('drawn');
    expect(lens.grid.rows).toBeLessThanOrEqual(MAX_HEAP_ROWS);
    expect(lens.grid.cols).toBeLessThanOrEqual(MAX_HEAP_COLS);
  });

  it('is too large when the tracer cut the heap short', () => {
    const [first] = steps;
    const cut: Step = { ...first, truncated: true };
    const selection = selectStep(cut);
    expect(selection.drawn).toBeNull();
    const [lens] = prepareTrace([cut]).steps;
    expect(lens.status).toBe('too-large');
    expect(tooLargeMessage(lens)).toMatch(/more than a trace records/);
  });
});

describe('the 2D floor: up to 20 objects', () => {
  it('draws 16 reachable objects whole, on a 4×4 floor, where 3D cannot', () => {
    const steps = stepsOf(LOOP_KEEPING);
    const in2D = prepareTrace(steps);
    const in3D = prepareTrace(steps, { view: '3d' });
    const at = steps.length - 1;
    expect(steps[at].snapshot.objects).toHaveLength(16);
    expect(drawn(in2D.steps[at]).objects).toHaveLength(16);
    expect(in2D.grid).toEqual({ cols: 4, rows: 4 });
    expect(in2D.steps.every((step) => step.status === 'drawn')).toBe(true);
    expect(notesFor(in2D.steps[at])).toEqual([]);
    expect(in3D.steps[at].status).toBe('too-large');
    in2D.steps.forEach((step) => expectNoDanglingReferences(drawn(step)));
  });

  it('hides unreachable objects only past 20, and then fits the 5×4 floor', () => {
    const steps = stepsOf(LOOP);
    const trace = prepareTrace(steps, { view: '2d' });
    trace.steps.forEach((step, i) => {
      const full = steps[i].snapshot;
      const snapshot = drawn(step);
      expect(snapshot.objects.length).toBeLessThanOrEqual(20);
      if (full.objects.length <= 20) {
        expect(snapshot.objects).toHaveLength(full.objects.length);
        expect(step.counts.unreachableHidden).toBe(0);
      } else {
        expect(step.counts.unreachableHidden).toBe(full.objects.length - snapshot.objects.length);
      }
    });
    expect(trace.grid.cols).toBeLessThanOrEqual(5);
    expect(trace.grid.rows).toBeLessThanOrEqual(4);
    expect(trace.grid).toEqual({ cols: 5, rows: 4 });
  });

  it('never moves an object while it stays drawn, and never puts two on one cell', () => {
    const trace = prepareTrace(stepsOf(LOOP));
    let before = new Map<string, string>();
    for (const step of trace.steps) {
      const now = new Map(drawn(step).objects.map((o) => [o.id, `${o.cell.col},${o.cell.row}`]));
      expect(new Set(now.values()).size).toBe(now.size);
      for (const [id, cell] of now) {
        if (before.has(id)) expect(cell, id).toBe(before.get(id));
      }
      before = now;
    }
  });

  it('is too large above 20, and says the number', () => {
    const steps = stepsOf(LOOP_KEEPING_25);
    const lens = prepareTrace(steps);
    const last = lens.steps[lens.steps.length - 1];
    expect(last.status).toBe('too-large');
    expect(tooLargeMessage(last)).toBe(
      'This step holds 21 heap objects, 21 of them reachable. The lens draws up to 20.'
    );
    // The steps with up to 20 objects are drawn
    const fullest = Math.max(
      ...lens.steps.map((step) => (step.status === 'drawn' ? step.snapshot.objects.length : 0))
    );
    expect(fullest).toBe(20);
  });

  it('places a run that fits 3D the same in both views', () => {
    const steps = stepsOf(ALIASING);
    expect(prepareTrace(steps, { view: '3d' })).toEqual(prepareTrace(steps, { view: '2d' }));
  });
});

describe('a step chosen in 3D that only fits 2D', () => {
  const steps = stepsOf(LOOP_KEEPING);
  const in2D = prepareTrace(steps, { view: '2d' });
  const in3D = prepareTrace(steps, { view: '3d' });

  it('is drawn in 2D with a note, and the steps that fit stay in 3D', () => {
    const shown = steps.map((_, i) => viewForStep('3d', in2D.steps[i], in3D.steps[i]));
    // The run starts small and ends with 16 objects
    expect(shown[0]).toEqual({ view: '3d', fellBack: false });
    expect(shown[shown.length - 1]).toEqual({ view: '2d', fellBack: true });
    shown.forEach((choice, i) => {
      const fits3D = steps[i].snapshot.objects.length <= 9;
      expect(choice, `step ${i}`).toEqual(
        fits3D ? { view: '3d', fellBack: false } : { view: '2d', fellBack: true }
      );
    });
    expect(SHOWN_IN_2D_NOTE).toBe('This step is too large for 3D, so it is shown in 2D');
  });

  it('never falls back when the learner chose 2D', () => {
    steps.forEach((_, i) => {
      expect(viewForStep('2d', in2D.steps[i], undefined)).toEqual({ view: '2d', fellBack: false });
    });
  });

  it('is not a fallback when the step fits neither view', () => {
    const large = stepsOf(LOOP_KEEPING_25);
    const at = large.length - 1;
    const a = prepareTrace(large, { view: '2d' }).steps[at];
    const b = prepareTrace(large, { view: '3d' }).steps[at];
    expect(viewForStep('3d', a, b)).toEqual({ view: '2d', fellBack: false });
  });
});

describe('aliasing', () => {
  const steps = stepsOf(ALIASING);
  const trace = prepareTrace(steps);

  it('draws one object for two names', () => {
    const last = drawn(trace.steps[trace.steps.length - 1]);
    const frame = last.frames[0];
    const a = frame.slots.find((s) => s.name === 'a');
    const b = frame.slots.find((s) => s.name === 'b');
    expect(a?.refId).toBeDefined();
    expect(b?.refId).toBe(a?.refId);
    expect(last.objects.filter((o) => o.id === a?.refId)).toHaveLength(1);
  });

  it('describes a step in words', () => {
    const at = steps.findIndex((s) =>
      s.snapshot.frames[0].slots.some((x) => x.name === 'b' && x.refId)
    );
    const text = describeStep(steps[at], trace.steps[at], { index: at, total: steps.length });
    expect(text).toContain(`Step ${at + 1} of ${steps.length}, line 2.`);
    expect(text).toContain('Call stack: 1 frame, global on top.');
    expect(text).toContain('Heap: 1 object.');
    expect(text).toContain('Changed: b in global.');
  });
});

describe('describeStep', () => {
  it('names what is left out', () => {
    const steps = stepsOf(RECURSION);
    const trace = prepareTrace(steps);
    const at = trace.steps.findIndex((s) => s.counts.framesNotShown === 9);
    const text = describeStep(steps[at], trace.steps[at], { index: at, total: steps.length });
    expect(text).toContain('Call stack: 13 frames, fact(1) on top.');
    expect(text).toContain('9 frames in the middle not shown.');
    expect(text).toContain('Heap: empty.');
  });

  it('counts unreachable and hidden objects', () => {
    const steps = stepsOf(LOOP);
    const trace = prepareTrace(steps);
    const at = steps.length - 1;
    const text = describeStep(steps[at], trace.steps[at], { index: at, total: steps.length });
    expect(text).toContain('Heap: 41 objects, 35 unreachable.');
    expect(text).toContain('35 unreachable objects hidden.');
  });

  it('says a step is too large to draw', () => {
    const steps = stepsOf(LOOP_KEEPING_25);
    const trace = prepareTrace(steps);
    const at = steps.length - 1;
    const text = describeStep(steps[at], trace.steps[at], { index: at, total: steps.length });
    expect(text).toContain('Heap: too large to draw.');
    expect(text).toContain('21 heap objects');
    expect(text).toContain('The lens draws up to 20.');
  });
});

describe('a run that records no heap', () => {
  const steps = stepsOf(ALIASING);
  const trace = prepareTrace(steps, { heapRecorded: false });

  it('draws frames only, with no reference left dangling', () => {
    for (const step of trace.steps) {
      const snapshot = drawn(step);
      expect(snapshot.objects).toEqual([]);
      expect(getReferences(snapshot)).toEqual([]);
    }
    const last = drawn(trace.steps[trace.steps.length - 1]);
    expect(last.frames[0].slots.find((s) => s.name === 'a')?.value).toBe(NOT_RECORDED);
  });

  it('says so in a note and in the description', () => {
    const at = steps.length - 1;
    expect(notesFor(trace.steps[at], { heapRecorded: false })).toEqual([
      'Heap objects are not recorded for Python yet',
    ]);
    expect(
      describeStep(
        steps[at],
        trace.steps[at],
        { index: at, total: steps.length },
        { heapRecorded: false }
      )
    ).toContain('Heap objects are not recorded for Python yet.');
  });
});
