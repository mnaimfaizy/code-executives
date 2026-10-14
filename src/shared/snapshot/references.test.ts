import { describe, expect, it } from 'vitest';
import {
  copiesOf,
  getCopyTrails,
  getReachable,
  getReferences,
  isSpaceFreed,
  objectsInSpace,
  originOf,
  slotKey,
  spaceOf,
} from './index';
import type { HeapObject, HeapState, Slot, Snapshot, StackFrame } from './index';

const frame = (id: string, slots: Slot[]): StackFrame => ({ id, name: id, slots });
const object = (id: string, slots: Slot[] = [], state: HeapState = 'live'): HeapObject => ({
  id,
  label: id,
  kind: 'object',
  slots,
  state,
});

describe('slotKey', () => {
  it('joins owner and slot name', () => {
    expect(slotKey('main', 'ada')).toBe('main.ada');
  });
});

describe('getReferences', () => {
  it('reports a stack slot pointing at a heap object', () => {
    const snapshot: Snapshot = {
      frames: [
        frame('main', [
          { name: 'n', value: '1' },
          { name: 'a', refId: 'a' },
        ]),
      ],
      objects: [object('a')],
    };
    expect(getReferences(snapshot)).toEqual([
      { id: 'main.a', from: 'main.a', fromOwner: 'main', fromKind: 'frame', to: 'a' },
    ]);
  });

  it('reports a heap slot pointing at another heap object, after the stack references', () => {
    const snapshot: Snapshot = {
      frames: [frame('main', [{ name: 'a', refId: 'a' }])],
      objects: [object('a', [{ name: 'next', refId: 'b' }]), object('b')],
    };
    expect(getReferences(snapshot)).toEqual([
      { id: 'main.a', from: 'main.a', fromOwner: 'main', fromKind: 'frame', to: 'a' },
      { id: 'a.next', from: 'a.next', fromOwner: 'a', fromKind: 'object', to: 'b' },
    ]);
  });

  it('takes no references from a collected object', () => {
    const snapshot: Snapshot = {
      frames: [frame('main', [])],
      objects: [object('a', [{ name: 'next', refId: 'b' }], 'collected'), object('b')],
    };
    expect(getReferences(snapshot)).toEqual([]);
  });

  it('takes no references from a copied object: its contents live on in the copy', () => {
    const snapshot: Snapshot = {
      frames: [frame('main', [])],
      objects: [
        object('a', [{ name: 'next', refId: 'b' }], 'copied'),
        { ...object('a2', [{ name: 'next', refId: 'b' }]), copyOf: 'a' },
        object('b'),
      ],
    };
    expect(getReferences(snapshot).map((r) => r.from)).toEqual(['a2.next']);
  });

  it('reports a reference to a frame id like any other', () => {
    const snapshot: Snapshot = {
      frames: [frame('outer', [{ name: 'fn', refId: 'fn' }])],
      objects: [{ ...object('fn', [{ name: '[[Scope]]', refId: 'outer' }]), kind: 'function' }],
    };
    expect(getReferences(snapshot)).toContainEqual({
      id: 'fn.[[Scope]]',
      from: 'fn.[[Scope]]',
      fromOwner: 'fn',
      fromKind: 'object',
      to: 'outer',
    });
  });

  it('reports a dangling refId as it is written', () => {
    const snapshot: Snapshot = {
      frames: [frame('main', [{ name: 'ghost', refId: 'nowhere' }])],
      objects: [],
    };
    expect(getReferences(snapshot).map((r) => r.to)).toEqual(['nowhere']);
  });
});

describe('getReachable', () => {
  it('follows stack → heap → heap', () => {
    const snapshot: Snapshot = {
      frames: [frame('main', [{ name: 'a', refId: 'a' }])],
      objects: [object('a', [{ name: 'next', refId: 'b' }]), object('b'), object('c')],
    };
    expect(getReachable(snapshot)).toEqual(new Set(['a', 'b']));
  });

  it('does not reach a cycle that no root points at', () => {
    const snapshot: Snapshot = {
      frames: [frame('main', [{ name: 'a', value: 'null' }])],
      objects: [object('a', [{ name: 'b', refId: 'b' }]), object('b', [{ name: 'a', refId: 'a' }])],
    };
    expect(getReachable(snapshot)).toEqual(new Set());
  });

  it('terminates on a reachable cycle', () => {
    const snapshot: Snapshot = {
      frames: [frame('main', [{ name: 'a', refId: 'a' }])],
      objects: [object('a', [{ name: 'b', refId: 'b' }]), object('b', [{ name: 'a', refId: 'a' }])],
    };
    expect(getReachable(snapshot)).toEqual(new Set(['a', 'b']));
  });

  it('does not follow references out of a collected object', () => {
    const snapshot: Snapshot = {
      frames: [frame('main', [{ name: 'a', refId: 'a' }])],
      objects: [object('a', [{ name: 'next', refId: 'b' }], 'collected'), object('b')],
    };
    expect(getReachable(snapshot)).toEqual(new Set(['a']));
  });

  it('returns only heap object ids when a slot references a frame', () => {
    const snapshot: Snapshot = {
      frames: [
        frame('global', [{ name: 'x', refId: 'x' }]),
        frame('outer', [
          { name: 'fn', refId: 'fn' },
          { name: 'self', refId: 'outer' },
          { name: 'parent', refId: 'global' },
        ]),
      ],
      objects: [
        { ...object('fn', [{ name: '[[Scope]]', refId: 'outer' }]), kind: 'function' },
        object('x'),
      ],
    };
    expect(getReachable(snapshot)).toEqual(new Set(['fn', 'x']));
  });

  it('reaches from the extra roots when no frame is left', () => {
    const snapshot: Snapshot = {
      frames: [],
      objects: [object('scope', [{ name: 'list', refId: 'list' }]), object('list'), object('lost')],
      roots: ['scope', 'nothing'],
    };
    expect([...getReachable(snapshot)].sort()).toEqual(['list', 'scope']);
  });

  it('ignores a refId that matches nothing', () => {
    const snapshot: Snapshot = {
      frames: [
        frame('main', [
          { name: 'ghost', refId: 'nowhere' },
          { name: 'a', refId: 'a' },
        ]),
      ],
      objects: [object('a', [{ name: 'lost', refId: 'gone' }])],
    };
    expect(getReachable(snapshot)).toEqual(new Set(['a']));
  });
});

describe('spaces and copies', () => {
  const placed = (id: string, row: number, state: HeapState = 'live', copyOf?: string) => ({
    ...object(id, [], state),
    cell: { col: 0, row },
    ...(copyOf ? { copyOf } : {}),
  });
  const snapshot: Snapshot = {
    frames: [frame('main', [{ name: 'a', refId: 'a3' }])],
    objects: [
      placed('a', 0, 'collected'),
      { ...placed('t', 0, 'collected'), cell: { col: 1, row: 0 } },
      placed('a2', 1, 'copied', 'a'),
      placed('a3', 2, 'live', 'a2'),
    ],
    spaces: [
      { id: 'from', label: 'FROM', row: 0, role: 'from' },
      { id: 'to', label: 'TO', row: 1, role: 'to' },
      { id: 'old', label: 'OLD', row: 2 },
      { id: 'empty', label: 'EMPTY', row: 3 },
    ],
  };

  it('finds an object space by its cell row, and nothing without spaces', () => {
    expect(spaceOf(snapshot, 'a2')?.id).toBe('to');
    expect(spaceOf(snapshot, 'nowhere')).toBeUndefined();
    expect(spaceOf({ ...snapshot, spaces: undefined }, 'a2')).toBeUndefined();
    expect(objectsInSpace(snapshot, 'from')).toEqual(['a', 't']);
    expect(objectsInSpace({ ...snapshot, spaces: undefined }, 'from')).toEqual([]);
  });

  it('follows copyOf back to the origin, and lists copies', () => {
    expect(originOf(snapshot, 'a3')).toBe('a');
    expect(originOf(snapshot, 'a')).toBe('a');
    expect(originOf(snapshot, 'unknown')).toBe('unknown');
    expect(copiesOf(snapshot, 'a2')).toEqual(['a3']);
    // A cycle of copyOf (a modelling error) still terminates.
    const looped: Snapshot = {
      frames: [],
      objects: [
        { ...object('x'), copyOf: 'y' },
        { ...object('y'), copyOf: 'x' },
      ],
    };
    expect(['x', 'y']).toContain(originOf(looped, 'x'));
  });

  it('calls a space freed only when it holds objects and all are collected', () => {
    expect(isSpaceFreed(snapshot, 'from')).toBe(true);
    expect(isSpaceFreed(snapshot, 'to')).toBe(false);
    expect(isSpaceFreed(snapshot, 'empty')).toBe(false);
  });

  it('draws a copy trail only from a copied object to its copy', () => {
    expect(getCopyTrails(snapshot)).toEqual([{ id: 'a2->a3', from: 'a2', to: 'a3' }]);
  });
});
