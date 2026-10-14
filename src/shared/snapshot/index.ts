export type {
  Cell,
  HeapKind,
  HeapObject,
  HeapSpace,
  HeapState,
  Placed,
  QueueEntry,
  QueueSource,
  Reference,
  Slot,
  Snapshot,
  StackFrame,
} from './types';
export type { CopyTrail } from './references';
export {
  copiesOf,
  getCopyTrails,
  getReachable,
  getReferences,
  isSpaceFreed,
  objectsInSpace,
  originOf,
  slotKey,
  spaceOf,
} from './references';
export type { HeapGrid } from './grid';
export { gridOf, MIN_HEAP_GRID, sameCell } from './grid';
export type { PlacementResult, PlacementOptions } from './placement';
export { DEFAULT_PLACEMENT_COLS, placeSnapshot, placeTrace } from './placement';
