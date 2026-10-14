import { describe, expect, it } from 'vitest';
import {
  getCopyTrails,
  getReferences,
  type HeapObject,
  type Placed,
  type Slot,
} from '../../../snapshot';
import { SPACE_HEADER, copyTrailPath, layout2D, refPath } from './heapGeometry';
import { checkArrows, samplePath } from './heapGeometryForTests';
import type { PlacedSnapshot } from './types';
import WITHOUT_SPACES from './__fixtures__/layoutWithoutSpaces.json';
import { STORY_BEATS as STACK_HEAP_BEATS } from '../../../../features/javascript/utils/stackHeapStory';
import { STORY_BEATS as GC_BEATS } from '../../../../features/javascript/utils/garbageCollectionStory';
import { STORY_BEATS as GENERATIONAL_BEATS } from '../../../../features/javascript/utils/generationalCollectionStory';

const COLS = 5;
const ROWS = 4;

const id = (col: number, row: number) => `o${row * COLS + col}`;

/** Slots that make objects of different heights, so rows are not all alike. */
const filler = (n: number): Slot[] =>
  Array.from({ length: n % 4 }, (_, i) => ({ name: `v${i}`, value: String(i) }));

/** A full 5×4 floor; `refs` adds reference slots to the objects named. */
function floor(refs: Record<string, string[]> = {}): Placed<HeapObject>[] {
  const objects: Placed<HeapObject>[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const own = id(col, row);
      objects.push({
        id: own,
        label: 'Node',
        kind: 'object',
        state: 'live',
        cell: { col, row },
        slots: [
          ...filler(col + row),
          ...(refs[own] ?? []).map((to, i) => ({ name: `r${i}`, refId: to })),
        ],
      });
    }
  }
  return objects;
}

const frames = (slots: Slot[][]): PlacedSnapshot['frames'] =>
  slots.map((list, i) => ({ id: `f${i}`, name: `f${i}()`, slots: list }));

describe('layout2D', () => {
  it('is the 800×480 drawing for a 2×2 floor, and not dense', () => {
    const at = layout2D({ frames: [], objects: [] });
    expect([at.width, at.height, at.dense]).toEqual([800, 480, false]);
    expect(at.rowY).toEqual([78, 268]);
  });

  it('grows with columns and rows: a full 5×4 floor is 1490 units wide', () => {
    const at = layout2D({ frames: [], objects: floor() });
    expect(at.width).toBe(340 + 5 * 230);
    expect(at.dense).toBe(true);
    expect(at.rowY).toHaveLength(4);
    expect(at.height).toBe(100 + 4 * 190);
  });

  it('is dense from the third column or the third row on', () => {
    const one = floor()[0];
    expect(layout2D({ frames: [], objects: [one] }, { cols: 3, rows: 2 }).dense).toBe(true);
    expect(layout2D({ frames: [], objects: [one] }, { cols: 2, rows: 3 }).dense).toBe(true);
    expect(layout2D({ frames: [], objects: [one] }, { cols: 2, rows: 2 }).dense).toBe(false);
  });
});

describe('refPath on the story floor (2×2)', () => {
  const objects: Placed<HeapObject>[] = [
    { ...floor()[0], id: 'a', cell: { col: 0, row: 0 }, slots: [{ name: 'x', refId: 'd' }] },
    { ...floor()[0], id: 'd', cell: { col: 1, row: 1 }, slots: [{ name: 'y', refId: 'a' }] },
  ];
  const snapshot: PlacedSnapshot = {
    frames: frames([[{ name: 'far', refId: 'd' }]]),
    objects,
  };

  it('draws every arrow as one curve, as the Stack ↔ Heap story always has', () => {
    const at = layout2D(snapshot);
    const paths = getReferences(snapshot).map((ref) => refPath(ref, snapshot, at));
    expect(paths).toHaveLength(3);
    for (const d of paths) expect(d).toMatch(/^M [\d.]+ [\d.]+ C [^LQ]+$/);
  });
});

describe('refPath for a mutual pair in one row', () => {
  const node = (id: string, col: number, row: number, slots: Slot[]): Placed<HeapObject> => ({
    id,
    label: 'Object',
    kind: 'object',
    state: 'live',
    cell: { col, row },
    slots,
  });
  const pairOf = (back: boolean): PlacedSnapshot => ({
    frames: frames([[{ name: 'p', refId: 'p' }]]),
    objects: [
      node('p', 0, 0, [
        { name: 'name', value: "'p'" },
        { name: 'child', refId: 'c' },
      ]),
      node('c', 1, 0, [
        { name: 'name', value: "'c'" },
        back ? { name: 'parent', refId: 'p' } : { name: 'parent', value: 'null' },
      ]),
    ],
  });
  const paths = (snapshot: PlacedSnapshot) => {
    const at = layout2D(snapshot);
    return Object.fromEntries(
      getReferences(snapshot).map((ref) => [ref.from, refPath(ref, snapshot, at)!])
    );
  };
  /** The least distance between any two sampled points of two paths. */
  const apart = (a: string, b: string) =>
    Math.min(
      ...samplePath(a).flatMap(([ax, ay]) =>
        samplePath(b).map(([bx, by]) => Math.hypot(ax - bx, ay - by))
      )
    );

  it('sends the way back over the top, so the two arrows never cross', () => {
    const snapshot = pairOf(true);
    const at = layout2D(snapshot);
    const { 'p.child': out, 'c.parent': back } = paths(snapshot);
    const p = at.objects.get('p')!;
    const c = at.objects.get('c')!;

    // The way out is drawn as it always was: slot line to heading, across the gutter
    expect(out).toBe(paths(pairOf(false))['p.child']);
    // The way back leaves the child's top edge and lands on the parent's, inside both
    const points = samplePath(back);
    const [start, end] = [points[0], points[points.length - 1]];
    expect(start[1]).toBe(c.y);
    expect(end[1]).toBe(p.y);
    expect(start[0]).toBeGreaterThan(c.x);
    expect(end[0]).toBeLessThan(p.x + p.w);
    for (const [, y] of points) expect(y).toBeLessThanOrEqual(p.y);
    // Under the region's top edge (20), and clear of the other arrow and of its head
    expect(Math.min(...points.map(([, y]) => y))).toBeGreaterThan(40);
    expect(apart(out, back)).toBeGreaterThan(12);
    expect(checkArrows(snapshot).crossings).toEqual([]);
  });

  it('keeps the same path whatever the state of the two objects', () => {
    const live = pairOf(true);
    const marked: PlacedSnapshot = {
      ...live,
      objects: live.objects.map((o) => ({ ...o, state: 'marked' as const })),
    };
    expect(paths(marked)).toEqual(paths(live));
  });

  it('leaves a single reference to the left as one curve between the facing edges', () => {
    const snapshot: PlacedSnapshot = {
      frames: [],
      objects: [
        node('p', 0, 0, [{ name: 'name', value: "'p'" }]),
        node('c', 1, 0, [{ name: 'parent', refId: 'p' }]),
      ],
    };
    const at = layout2D(snapshot);
    const points = samplePath(paths(snapshot)['c.parent']);
    const p = at.objects.get('p')!;
    const c = at.objects.get('c')!;
    expect(points[0][0]).toBe(c.x);
    expect(points[points.length - 1]).toEqual([p.x + p.w, p.y + 15]);
  });

  it('does the same on a dense floor without passing through an object', () => {
    const check = checkArrows({ frames: [], objects: floor({ o6: ['o7'], o7: ['o6'] }) });
    expect(check.arrows).toBe(2);
    expect(check.crossings).toEqual([]);
  });
});

describe('refPath on a dense floor (5×4)', () => {
  it('never passes through an object, from any cell to any other', () => {
    let arrows = 0;
    for (let from = 0; from < COLS * ROWS; from++) {
      const refs: Record<string, string[]> = {};
      refs[`o${from}`] = Array.from({ length: COLS * ROWS }, (_, to) => `o${to}`).filter(
        (to) => to !== `o${from}`
      );
      const check = checkArrows({ frames: [], objects: floor(refs) });
      expect(check.crossings, `from o${from}`).toEqual([]);
      arrows += check.arrows;
    }
    expect(arrows).toBe(20 * 19);
  });

  it('never passes through an object or a frame between the stack and the heap', () => {
    const all = floor().map((o) => o.id);
    // Five frames whose slots hold every object, and every object's scope points back at a frame
    const stack = frames(
      Array.from({ length: 5 }, (_, f) =>
        all.filter((_, i) => i % 5 === f).map((to) => ({ name: to, refId: to }))
      )
    );
    const refs: Record<string, string[]> = {};
    all.forEach((own, i) => (refs[own] = [`f${i % 5}`]));
    const check = checkArrows({ frames: stack, objects: floor(refs) });
    expect(check.arrows).toBe(40);
    expect(check.crossings).toEqual([]);
  });

  it('keeps a neighbour one curve and sends the rest along gutters and bands', () => {
    const snapshot: PlacedSnapshot = {
      frames: [],
      objects: floor({ o0: ['o1', 'o5', 'o12'] }),
    };
    const at = layout2D(snapshot);
    const [right, below, far] = getReferences(snapshot).map((ref) => refPath(ref, snapshot, at)!);
    expect(right).toMatch(/ C /);
    expect(below).toMatch(/ C /);
    expect(far).not.toMatch(/ C /);
    expect(far).toMatch(/ L .* Q /);
    // The far arrow starts on its slot's right edge and ends on the target's left edge,
    // at the height of its heading
    const points = samplePath(far);
    const source = at.objects.get('o0')!;
    const target = at.objects.get('o12')!;
    expect(points[0][0]).toBe(source.x + source.w);
    const last = points[points.length - 1];
    expect(last).toEqual([target.x, target.y + 15]);
  });

  it('stays inside the drawing', () => {
    const refs: Record<string, string[]> = { o19: ['o0', 'o4', 'o15'], o4: ['o19', 'o0'] };
    const snapshot: PlacedSnapshot = { frames: [], objects: floor(refs) };
    const at = layout2D(snapshot);
    for (const ref of getReferences(snapshot)) {
      for (const [x, y] of samplePath(refPath(ref, snapshot, at)!)) {
        expect(x).toBeGreaterThan(310);
        expect(x).toBeLessThan(at.width - 16);
        expect(y).toBeGreaterThan(20);
        expect(y).toBeLessThan(at.height - 16);
      }
    }
  });

  it('gives two slots of one object lanes of their own', () => {
    const snapshot: PlacedSnapshot = { frames: [], objects: floor({ o0: ['o13', 'o14'] }) };
    const at = layout2D(snapshot);
    const [a, b] = getReferences(snapshot).map((ref) => samplePath(refPath(ref, snapshot, at)!));
    // Both run down the gutter right of o0, 4 units apart
    // A point on the second straight run: past the first run and its corner (24 samples each)
    const gutter = (points: [number, number][]) => points[60][0];
    expect(Math.abs(gutter(a) - gutter(b))).toBe(4);
  });
});

describe('a snapshot without spaces', () => {
  /** Recorded from `layout2D` and `refPath` before spaces existed. */
  const signature = (snapshot: PlacedSnapshot) => {
    const at = layout2D(snapshot);
    return {
      width: at.width,
      height: at.height,
      rowY: at.rowY,
      dense: at.dense,
      frames: Object.fromEntries(at.frames),
      objects: Object.fromEntries(at.objects),
      refs: Object.fromEntries(
        getReferences(snapshot).map((ref) => [ref.id, refPath(ref, snapshot, at)])
      ),
    };
  };

  it('lays out every beat of the earlier stories exactly as before spaces existed', () => {
    const stories = { 'stack-heap': STACK_HEAP_BEATS, 'garbage-collection': GC_BEATS };
    for (const [story, beats] of Object.entries(stories)) {
      for (const beat of beats) {
        expect(signature(beat), `${story} › ${beat.id}`).toEqual(
          (WITHOUT_SPACES as Record<string, Record<string, unknown>>)[story][beat.id]
        );
        expect(layout2D(beat).spaces.size).toBe(0);
      }
    }
  });
});

describe('a heap split into spaces', () => {
  const beats = GENERATIONAL_BEATS;

  it('keeps one drawing size, one band per space and every cell on every beat', () => {
    const first = layout2D(beats[0]);
    expect([first.width, first.height]).toEqual([
      340 + 2 * 230 + 180 + 10 + 24,
      100 + 3 * (190 + SPACE_HEADER),
    ]);
    for (const beat of beats) {
      const at = layout2D(beat);
      expect([at.width, at.height, at.rowY], beat.id).toEqual([
        first.width,
        first.height,
        first.rowY,
      ]);
      expect([...at.spaces.keys()]).toEqual(['young-a', 'young-b', 'old']);
      for (const [id, band] of at.spaces) expect(band, id).toEqual(first.spaces.get(id));
    }
  });

  it('puts each header above the arrow band of its row, and each object inside its band', () => {
    for (const beat of beats) {
      const at = layout2D(beat);
      for (const space of beat.spaces) {
        const band = at.spaces.get(space.id)!;
        const rowTop = at.rowY[space.row];
        // Text 12px high on its baseline; the lanes above a row reach 28 units up
        expect(band.labelY).toBeLessThan(rowTop - 28);
        expect(band.labelY - 12).toBeGreaterThan(band.y);
        for (const o of beat.objects.filter((o) => o.cell.row === space.row)) {
          const b = at.objects.get(o.id)!;
          expect(b.y).toBeGreaterThan(band.y);
          expect(b.y + b.h).toBeLessThan(band.y + band.h);
          expect(b.x).toBeGreaterThan(band.x);
          expect(b.x + b.w).toBeLessThan(band.x + band.w);
        }
      }
      const bands = [...at.spaces.values()];
      for (let i = 1; i < bands.length; i++) {
        expect(bands[i].y).toBeGreaterThan(bands[i - 1].y + bands[i - 1].h);
      }
      expect(bands[bands.length - 1].y + bands[bands.length - 1].h).toBeLessThan(at.height - 16);
    }
  });

  it('draws the arrows of every beat through no frame and no object', () => {
    for (const beat of beats) {
      const { arrows, crossings } = checkArrows(beat);
      expect(arrows, beat.id).toBe(getReferences(beat).length);
      expect(crossings, beat.id).toEqual([]);
    }
  });

  it('runs a copy trail down the gutter right of its column, clear of every object', () => {
    for (const beat of beats) {
      const at = layout2D(beat);
      for (const trail of getCopyTrails(beat)) {
        const from = at.objects.get(trail.from)!;
        const to = at.objects.get(trail.to)!;
        const points = samplePath(copyTrailPath(from, to));
        expect(points[0], trail.id).toEqual([from.x + from.w, from.y + 15]);
        expect(points[points.length - 1]).toEqual([to.x + to.w, to.y + 15]);
        for (const [id, box] of at.objects) {
          const inside = points.some(
            ([x, y]) =>
              x > box.x + 2 && x < box.x + box.w - 2 && y > box.y + 2 && y < box.y + box.h - 2
          );
          expect(inside, `${trail.id} through ${id}`).toBe(false);
        }
      }
    }
  });
});
