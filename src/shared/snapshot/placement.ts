/**
 * Automatic placement: gives every heap object a cell.
 *
 * A story's author places each object by hand; a Playground trace has no author (ADR 0004),
 * so its objects are placed here. The one rule that matters to the learner: an object never
 * moves between steps, and nothing ever appears where something else just was.
 *
 * Pure data: no React, no three.js, no DOM.
 */

import type { Cell, HeapObject, Placed, Snapshot } from './types';

export interface PlacementOptions {
  /** Cells assigned on earlier steps. An id found here keeps its cell, and no other id takes it. */
  previous?: ReadonlyMap<string, Cell>;
  /** Columns filled before a new row starts. Default 2. */
  cols?: number;
}

export interface PlacementResult {
  snapshot: Snapshot<Placed<HeapObject>>;
  /** Every cell given so far: `previous` plus this snapshot's objects. Pass it on as `previous`. */
  cells: Map<string, Cell>;
}

export const DEFAULT_PLACEMENT_COLS = 2;

const cellKey = ({ col, row }: Cell) => `${col},${row}`;

const columnsOf = (cols: number | undefined) =>
  cols !== undefined && Number.isFinite(cols)
    ? Math.max(1, Math.floor(cols))
    : DEFAULT_PLACEMENT_COLS;

/**
 * Places one snapshot. Objects with a known cell (from `previous`, else authored) keep it;
 * the rest take the first free cell in row-major order, in the order they appear.
 */
export function placeSnapshot(snapshot: Snapshot, options: PlacementOptions = {}): PlacementResult {
  const cols = columnsOf(options.cols);
  const cells = new Map<string, Cell>();
  const taken = new Set<string>();

  const assign = (id: string, cell: Cell) => {
    const copy = { col: cell.col, row: cell.row };
    cells.set(id, copy);
    taken.add(cellKey(copy));
  };

  for (const [id, cell] of options.previous ?? []) assign(id, cell);

  // Authored cells are reserved before anything is placed, so an object earlier in the list
  // is never put on a cell that a later object was given by hand.
  for (const object of snapshot.objects) {
    if (object.cell && !cells.has(object.id)) assign(object.id, object.cell);
  }

  let next = 0;
  const firstFree = (): Cell => {
    for (;;) {
      const cell = { col: next % cols, row: Math.floor(next / cols) };
      next += 1;
      if (!taken.has(cellKey(cell))) return cell;
    }
  };

  const objects = snapshot.objects.map((object): Placed<HeapObject> => {
    let cell = cells.get(object.id);
    if (!cell) {
      cell = firstFree();
      assign(object.id, cell);
    }
    return { ...object, cell: { col: cell.col, row: cell.row } };
  });

  return { snapshot: { ...snapshot, objects }, cells };
}

/** Places every snapshot of a trace in order, so each id keeps one cell from start to end. */
export function placeTrace(
  snapshots: readonly Snapshot[],
  options: PlacementOptions = {}
): Snapshot<Placed<HeapObject>>[] {
  let previous = options.previous;
  return snapshots.map((snapshot) => {
    const placed = placeSnapshot(snapshot, { ...options, previous });
    previous = placed.cells;
    return placed.snapshot;
  });
}
