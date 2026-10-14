import type { HeapGrid, HeapObject, Placed, Snapshot } from '../../../snapshot';
import type { VizTheme } from '../../../viz/palette';

/** A snapshot whose heap objects all have a cell: authored in a story, assigned for a trace. */
export type PlacedSnapshot = Snapshot<Placed<HeapObject>>;

/** The named framings of the stack-and-heap scene. A trace step uses `overview`. */
export type StackHeapShot = 'overview' | 'stack' | 'bridge' | 'heap' | 'gc';

/** `scavenge` = a copying (young-generation) collection; story only. */
export type GcPhase = 'mark' | 'sweep' | 'scavenge';

/**
 * What both stack-and-heap views draw. The views do not know whether the snapshot came
 * from a story beat or a Playground trace step (ADR 0004).
 */
export interface StackHeapViewProps {
  snapshot: PlacedSnapshot;
  /** Entity ids and slot keys (`owner.slot`) to spotlight. */
  focus: readonly string[];
  /** Palette variant. Stories are light; the Playground is dark. Default `light`. */
  theme?: VizTheme;
  /** Story only: the collector's phase on a GC beat. */
  gcPhase?: GcPhase;
  /**
   * Draw `live` objects that no frame can reach in the `unreachable` role. Traces turn this
   * on; the story leaves it off, because its GC beats reveal unreachability on purpose.
   */
  markUnreachable?: boolean;
  /**
   * Lay out for at least this grid. A trace passes the grid of its whole run, so the floor is
   * sized once and no cell shifts when a later step adds objects. Default: fit this snapshot.
   */
  grid?: HeapGrid;
  /** Accessible name of the drawing, e.g. the beat's title. */
  label: string;
}
