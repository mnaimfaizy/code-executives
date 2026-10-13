/**
 * What the 3D stack-and-heap scene shows of a collection, decided from the data alone.
 *
 * THREE-FREE: no three.js here, so these rules are unit-tested without WebGL.
 */
import type { HeapState, StackFrame } from '../../snapshot';
import type { GcPhase, StackHeapShot } from '../../components/viz/stackheap/types';

export type MarkTag = 'MARKED' | 'UNMARKED';

/**
 * The tag a collection puts on an object, if any.
 *
 * A mark belongs to a collection, so `MARKED` is drawn only while one runs (`gcPhase` set), as
 * in the 2D view. A Playground trace never passes `gcPhase`: its lens uses `marked` for "held
 * by a frame that is not drawn", and such an object must look like any live one.
 */
export const markTag = (state: HeapState, gcPhase: GcPhase | undefined): MarkTag | null =>
  state === 'unmarked' ? 'UNMARKED' : state === 'marked' && gcPhase !== undefined ? 'MARKED' : null;

/**
 * Whether the root pulse (rings rippling from the stack across the whole floor) plays.
 *
 * It says "the search starts here, at the roots", so it plays on the mark beat that is about
 * the roots: one whose focus holds a frame. On a beat that follows one reference it would say
 * the search reaches every object, the unreachable ones too.
 */
export const rootPulsePlays = (
  gcPhase: GcPhase | undefined,
  focus: readonly string[],
  frames: readonly StackFrame[]
): boolean => gcPhase === 'mark' && frames.some((frame) => focus.includes(frame.id));

/**
 * The horizontal anchor of an object's label, as the CSS `translate` x of its card.
 *
 * The `gc` shot adds MARKED/UNMARKED/RECLAIMED tags, widening every label until neighbours in a
 * row meet over the gap between columns. So the outer columns' labels lean outward there: first
 * column left, last column right. The first column leans toward the stack, into the path of an
 * arc from a frame's slot; an object such an arc lands on keeps its label centred, clear of it.
 */
export const labelLean = (
  shot: StackHeapShot,
  col: number,
  lastCol: number,
  stackHeld: boolean
): string => {
  if (shot !== 'gc') return '-50%';
  if (col === 0) return stackHeld ? '-50%' : '-80%';
  return col === lastCol ? '-20%' : '-50%';
};
