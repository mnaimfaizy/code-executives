import type { QueueEntry, Snapshot } from '../../../snapshot';
import type { VizTheme } from '../../../viz/palette';
import type { CameraState } from '../viewerCamera';
import type { EventLoopExtent, EventLoopRegion, QueueRegion } from './layout';

/**
 * The callback the stack is running: an entry that has left its queue. A snapshot does not
 * hold it any more, so whoever knows (a beat's author, a lens comparing steps) passes it.
 */
export interface RunningEntry {
  entry: QueueEntry;
  /** The queue it was taken from. */
  from: Exclude<QueueRegion, 'timers'>;
  /** The frame its callback runs in. Without it the views tag the top frame. */
  frameId?: string;
}

/**
 * What both event loop views draw: the call stack, the microtask queue, the task queue and the
 * timers of one snapshot. The views do not know whether the snapshot came from a story beat or
 * a Playground trace step (ADR 0004). Regions and cells come from `./layout`.
 *
 * A snapshot with none of the three queue fields is drawn as its call stack alone.
 *
 * There is no clock here on purpose: a snapshot carries no time today. When it does, the views
 * read it from the snapshot and draw it in the timers region, whose header line keeps room for it.
 */
export interface EventLoopViewProps {
  snapshot: Snapshot;
  /** Entity ids (frames, entries) and slot keys (`owner.slot`) to spotlight. */
  focus: readonly string[];
  /** Palette variant. Stories are light; the Playground is dark. Default `light`. */
  theme?: VizTheme;
  /**
   * Lay out for at least this much. A trace passes the extent of its whole run (`extentOf`),
   * so no region changes size from step to step. Default: fit this snapshot.
   */
  extent?: Partial<EventLoopExtent>;
  /** Entries of a region that the snapshot leaves out, drawn as "+N more" after the last one. */
  more?: Partial<Record<QueueRegion, number>>;
  /** The entry whose callback is on the stack, when that is known. */
  running?: RunningEntry;
  /**
   * 2D only: the regions the current beat is about, drawn with a heavier outline. A story
   * derives it from the beat's shot; a trace has no shots and leaves it out, which draws every
   * region alike.
   */
  emphasis?: readonly EventLoopRegion[];
  /** Accessible name of the drawing, e.g. the beat's title. */
  label: string;
}

/** What the 3D view takes on top: the learner's camera, as in the stack-and-heap scene. */
export type EventLoopView3DProps = EventLoopViewProps & {
  /** The learner's camera: view preset, Hold view, pan mode and one-shot commands. */
  camera: CameraState;
  /** Reduced motion: no tweening, instant camera cuts. */
  instant?: boolean;
};
