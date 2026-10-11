import { describe, expect, it } from 'vitest';
import { STORY_BEATS } from '../../features/javascript/utils/stackHeapStory';
import { gridOf, placeSnapshot, placeTrace } from './index';
import type { Cell, HeapObject, Snapshot, StackFrame } from './index';

const object = (id: string, cell?: Cell): HeapObject => ({
  id,
  label: id,
  kind: 'object',
  slots: [],
  state: 'live',
  ...(cell ? { cell } : {}),
});

const frames: StackFrame[] = [{ id: 'main', name: 'main()', slots: [{ name: 'a', refId: 'a' }] }];

const snap = (...objects: HeapObject[]): Snapshot => ({ frames, objects });

const cellsOf = (snapshot: Snapshot) =>
  Object.fromEntries(snapshot.objects.map((o) => [o.id, o.cell]));

describe('placeSnapshot', () => {
  it("reproduces the Stack ↔ Heap story's authored cells from its object order", () => {
    const beat = STORY_BEATS.find((b) => b.objects.length === 4);
    expect(beat).toBeDefined();
    const authored = beat!.objects;
    expect(authored.map((o) => o.id)).toEqual(['ada', 'adaFriends', 'bob', 'bobFriends']);

    const stripped = authored.map((o): HeapObject => {
      const copy: HeapObject = { ...o };
      delete copy.cell;
      return copy;
    });
    expect(stripped.every((o) => !('cell' in o))).toBe(true);
    const { snapshot } = placeSnapshot({ frames: beat!.frames, objects: stripped });

    expect(cellsOf(snapshot)).toEqual(cellsOf(beat!));
  });

  it('fills cells in row-major order, two columns by default', () => {
    const { snapshot, cells } = placeSnapshot(snap(object('a'), object('b'), object('c')));
    expect(cellsOf(snapshot)).toEqual({
      a: { col: 0, row: 0 },
      b: { col: 1, row: 0 },
      c: { col: 0, row: 1 },
    });
    expect(Object.fromEntries(cells)).toEqual(cellsOf(snapshot));
  });

  it('honours cols: 3', () => {
    const { snapshot } = placeSnapshot(snap(...['a', 'b', 'c', 'd'].map((id) => object(id))), {
      cols: 3,
    });
    expect(cellsOf(snapshot)).toEqual({
      a: { col: 0, row: 0 },
      b: { col: 1, row: 0 },
      c: { col: 2, row: 0 },
      d: { col: 0, row: 1 },
    });
  });

  it('keeps the cell an id was given on an earlier step', () => {
    const previous = new Map<string, Cell>([['b', { col: 1, row: 0 }]]);
    const { snapshot } = placeSnapshot(snap(object('x'), object('y'), object('b')), { previous });
    expect(cellsOf(snapshot)).toEqual({
      x: { col: 0, row: 0 },
      y: { col: 0, row: 1 },
      b: { col: 1, row: 0 },
    });
  });

  it('does not reuse a cell whose object has vanished', () => {
    const previous = new Map<string, Cell>([['gone', { col: 0, row: 0 }]]);
    const { snapshot, cells } = placeSnapshot(snap(object('a')), { previous });
    expect(cellsOf(snapshot)).toEqual({ a: { col: 1, row: 0 } });
    expect(cells.get('gone')).toEqual({ col: 0, row: 0 });
  });

  it('respects authored cells and places the others around them', () => {
    const { snapshot, cells } = placeSnapshot(
      snap(
        object('a'),
        object('b'),
        object('pinned', { col: 0, row: 0 }),
        object('far', { col: 4, row: 2 })
      )
    );
    expect(cellsOf(snapshot)).toEqual({
      a: { col: 1, row: 0 },
      b: { col: 0, row: 1 },
      pinned: { col: 0, row: 0 },
      far: { col: 4, row: 2 },
    });
    expect(cells.get('far')).toEqual({ col: 4, row: 2 });
  });

  it('returns an empty snapshot for an empty one', () => {
    const { snapshot, cells } = placeSnapshot({ frames: [], objects: [] });
    expect(snapshot).toEqual({ frames: [], objects: [] });
    expect(cells.size).toBe(0);
  });

  it('does not mutate its input and passes frames through unchanged', () => {
    const input = snap(object('a'), object('b', { col: 3, row: 3 }));
    const previous = new Map<string, Cell>([['old', { col: 0, row: 0 }]]);
    const before = structuredClone(input);

    const { snapshot, cells } = placeSnapshot(input, { previous });

    expect(input).toEqual(before);
    expect(input.objects[0]).not.toHaveProperty('cell');
    expect([...previous]).toEqual([['old', { col: 0, row: 0 }]]);
    expect(cells).not.toBe(previous);
    expect(snapshot.frames).toBe(input.frames);
    expect(snapshot.objects[0]).not.toBe(input.objects[0]);
  });

  it.each([2, 3, 7])('packs 50 objects into a compact grid of %i columns', (cols) => {
    const objects = Array.from({ length: 50 }, (_, i) => object(`o${i}`));
    const { snapshot } = placeSnapshot(snap(...objects), { cols });

    expect(gridOf(snapshot.objects)).toEqual({ cols, rows: Math.ceil(50 / cols) });
    expect(new Set(snapshot.objects.map((o) => `${o.cell.col},${o.cell.row}`)).size).toBe(50);
  });
});

describe('placeTrace', () => {
  it('returns one placed snapshot per step', () => {
    expect(placeTrace([])).toEqual([]);
    expect(placeTrace([snap(), snap(object('a'))])).toHaveLength(2);
  });

  it('keeps an id on its cell when new objects appear before it', () => {
    const trace = placeTrace([
      snap(object('a'), object('b')),
      snap(object('new1'), object('new2'), object('a'), object('b')),
      snap(object('b'), object('new3'), object('a')),
    ]);

    for (const step of trace) {
      expect(cellsOf(step)).toMatchObject({ a: { col: 0, row: 0 }, b: { col: 1, row: 0 } });
    }
    expect(cellsOf(trace[1])).toMatchObject({ new1: { col: 0, row: 1 }, new2: { col: 1, row: 1 } });
    expect(cellsOf(trace[2])).toMatchObject({ new3: { col: 0, row: 2 } });
  });

  it('never gives two ids the same cell anywhere in a trace', () => {
    // Objects come and go, and the order is shuffled from step to step.
    const steps = Array.from({ length: 12 }, (_, step) => {
      const ids = Array.from({ length: 8 }, (_, i) => `o${step + i * 2}`);
      return snap(...(step % 2 ? ids.reverse() : ids).map((id) => object(id)));
    });

    const owner = new Map<string, string>();
    const cellOfId = new Map<string, string>();
    for (const step of placeTrace(steps, { cols: 3 })) {
      for (const { id, cell } of step.objects) {
        const key = `${cell.col},${cell.row}`;
        expect(owner.get(key) ?? id).toBe(id);
        expect(cellOfId.get(id) ?? key).toBe(key);
        owner.set(key, id);
        cellOfId.set(id, key);
      }
    }
    expect(owner.size).toBe(cellOfId.size);
  });

  it('does not reuse the cell of an object that vanished, even if it never returns', () => {
    const trace = placeTrace([
      snap(object('a'), object('b')),
      snap(object('b')),
      snap(object('b'), object('c')),
    ]);
    expect(cellsOf(trace[2])).toEqual({ b: { col: 1, row: 0 }, c: { col: 0, row: 1 } });
  });

  it('gives a returning object its old cell back', () => {
    const trace = placeTrace([snap(object('a')), snap(), snap(object('z'), object('a'))]);
    expect(cellsOf(trace[2])).toEqual({ z: { col: 1, row: 0 }, a: { col: 0, row: 0 } });
  });

  it('continues from cells given before the trace', () => {
    const previous = new Map<string, Cell>([['a', { col: 1, row: 1 }]]);
    const [first] = placeTrace([snap(object('a'), object('b'))], { previous, cols: 2 });
    expect(cellsOf(first)).toEqual({ a: { col: 1, row: 1 }, b: { col: 0, row: 0 } });
  });
});
