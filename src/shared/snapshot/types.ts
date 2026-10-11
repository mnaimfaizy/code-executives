/**
 * The stack-and-heap snapshot: the state of everything at one moment.
 *
 * A story beat and a Playground trace step hold this same shape (ADR 0004), so one set of
 * views can draw either. Pure data: no React, no three.js, no DOM.
 */

/** A fixed grid position inside a region, shared by the 2D and 3D views. */
export interface Cell {
  col: number;
  row: number;
}

/**
 * A slot holds either a primitive `value` or a reference (`refId`) to another entity:
 * a heap object, or a frame whose scope is still on the stack.
 */
export interface Slot {
  name: string;
  value?: string;
  refId?: string;
}

export interface StackFrame {
  id: string;
  name: string;
  slots: Slot[];
}

/**
 * `function` is a closure and `scope` is the popped frame it keeps alive; traces need both,
 * no story uses them yet.
 */
export type HeapKind = 'object' | 'array' | 'function' | 'scope';

/**
 * `unmarked` = GC mark phase found no path from a root; `collected` = swept.
 * Reachability is not a state: derive it with `getReachable`.
 */
export type HeapState = 'live' | 'marked' | 'unmarked' | 'collected';

export interface HeapObject<K extends HeapKind = HeapKind> {
  id: string;
  label: string;
  kind: K;
  slots: Slot[];
  state: HeapState;
  /** Stable grid position on the heap floor. Authored in a story; absent in a trace until placed. */
  cell?: Cell;
}

/** An entity whose cell is known, e.g. `Placed<HeapObject>`. */
export type Placed<T> = T & { cell: Cell };

export interface Snapshot<O extends HeapObject = HeapObject> {
  /** Bottom of the stack first. */
  frames: StackFrame[];
  objects: O[];
}

/** A link from a slot to the entity it points at. Derived by `getReferences`, never stored. */
export interface Reference {
  id: string;
  /** Slot key: `${frameId|objectId}.${slotName}` */
  from: string;
  fromOwner: string;
  fromKind: 'frame' | 'object';
  to: string;
}
