/**
 * The look of the label cards in the stack-and-heap scene, and of a frame's card wherever a
 * call stack is drawn (the event loop scene draws the same frames).
 *
 * THREE.JS SIDE (through `primitives`): import it only from a lazy renderer.
 */
import type React from 'react';
import type { VizPalette } from '../../viz/palette';
import { MONO, withAlpha } from '../primitives';
import type { FrameLabelPlan } from './layout';

/**
 * A dense scene (see `layout.ts`) is framed at a lower zoom, so its cards are tighter and their
 * lines are cut to a fixed width with an ellipsis: wide enough for a typical slot, narrower
 * than the pitch between columns. The text stays 11px.
 */
export const DENSE_OBJECT_WIDTH = 104;
export const DENSE_FRAME_WIDTH = 140;

/** A label card in palette colours, cut to `maxWidth` when one is given. */
export const cardStyle = (P: VizPalette, maxWidth?: number): React.CSSProperties => ({
  fontFamily: MONO,
  background: withAlpha(P.label.bg, 0.95),
  ...(maxWidth && { maxWidth, overflow: 'hidden' }),
});
export const lineStyle = (dense: boolean): React.CSSProperties | undefined =>
  dense ? { overflow: 'hidden', textOverflow: 'ellipsis' } : undefined;
// A title is a flex row; in a dense scene it is one inline line, so it can end in an ellipsis.
export const titleClass = (dense: boolean) =>
  dense ? 'font-bold' : 'flex items-center gap-2 font-bold';
export const badgeGap = (dense: boolean) => (dense ? ' ml-2' : '');

/**
 * Frame label cards. `half` is half the height of the one-row card (name, one row of slots,
 * padding and border) and `line` its line height, both in px: a stacked card starts from the
 * one-row card's edge and grows away from it, so its neighbour on the other side sees no change.
 */
export const FRAME_CARD = {
  story: { className: 'border px-2 py-0.5 text-[11px] leading-[14px]', half: 17, line: 14 },
  dense: { className: 'border px-2 text-[11px] leading-[13px]', half: 14, line: 13 },
};
/** A stacked card leans further from the heap: its right edge stays over the slab's front. */
export const STACKED_FRAME_LEAN = '-75%';

/** Lines a stacked frame label adds to the one-row label (which has one line of slots). */
export const extraLines = (plan: FrameLabelPlan) =>
  plan.stacked ? plan.slots.length + (plan.more > 0 ? 1 : 0) - 1 : 0;
