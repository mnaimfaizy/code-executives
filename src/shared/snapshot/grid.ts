import type { Cell, HeapObject, Placed } from './types';

/** How many columns and rows of cells the heap floor needs. */
export interface HeapGrid {
  cols: number;
  rows: number;
}

/** The smallest floor either view draws; the Stack ↔ Heap story fills exactly this. */
export const MIN_HEAP_GRID: HeapGrid = { cols: 2, rows: 2 };

/** The grid that holds every placed object, never smaller than `min`. */
export function gridOf(
  objects: readonly Placed<HeapObject>[],
  min: HeapGrid = MIN_HEAP_GRID
): HeapGrid {
  let cols = min.cols;
  let rows = min.rows;
  for (const { cell } of objects) {
    cols = Math.max(cols, cell.col + 1);
    rows = Math.max(rows, cell.row + 1);
  }
  return { cols, rows };
}

export const sameCell = (a: Cell, b: Cell) => a.col === b.col && a.row === b.row;
