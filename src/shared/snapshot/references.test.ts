import { describe, expect, it } from 'vitest';
import { getReachable, getReferences, slotKey } from './index';
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
