import { describe, expect, it } from 'vitest';
import { getReferences, type HeapObject, type Placed, type Slot } from '../../../snapshot';
import { layout2D, refPath } from './heapGeometry';
import { checkArrows, samplePath } from './heapGeometryForTests';
import type { PlacedSnapshot } from './types';

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
