import type { HeapKind, Slot, StackFrame } from '../../../snapshot';

/*
 * The 2D drawing of the call stack: the one piece every 2D view with a stack region shares
 * (the stack-and-heap view, the event loop view), so a frame looks the same in each of them.
 */

export const STACK_X = 24;
export const STACK_W = 230;
export const FRAME_HEADER = 30;
export const ROW_H = 22;
export const FRAME_GAP = 8;

/** Space under the lowest frame, and above the highest one (it clears the region caption). */
export const STACK_PAD_BOTTOM = 28;
export const STACK_PAD_TOP = 52;

/** Monospace 12px runs about 7.2px a character: what fits a frame and an object. */
export const FRAME_LINE_CHARS = 25;
export const OBJECT_LINE_CHARS = 21;
export const FRAME_NAME_CHARS = 18;

export const MONO = 'ui-monospace, monospace';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Height of a frame or a heap object: its heading and one row per slot. */
export const boxHeight = (slots: readonly Slot[]) =>
  FRAME_HEADER + Math.max(1, slots.length) * ROW_H + 8;

/** Vertical centre of slot `index` of the entity drawn in `box`. */
export const slotY = (box: Box, index: number) =>
  box.y + FRAME_HEADER + index * ROW_H + ROW_H / 2 + 2;

export const clip = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, Math.max(1, max - 1))}…` : text;

/** What the frames take, each with the gap above it. */
export const stackHeight = (frames: readonly StackFrame[]) =>
  frames.reduce((sum, f) => sum + boxHeight(f.slots) + FRAME_GAP, 0);

/**
 * Where each frame is drawn in a drawing `height` tall: the stack stands on its bottom edge.
 * `width` is the stack panel's (a heap split into spaces draws a narrower stack).
 */
export function stackBoxes(
  frames: readonly StackFrame[],
  height: number,
  width: number = STACK_W
): Map<string, Box> {
  const boxes = new Map<string, Box>();
  let y = height - STACK_PAD_BOTTOM;
  for (const f of frames) {
    const h = boxHeight(f.slots);
    y -= h + FRAME_GAP;
    boxes.set(f.id, { x: STACK_X + 12, y, w: width - 24, h });
  }
  return boxes;
}

export function slotLine(kind: HeapKind | 'frame', s: Slot): string {
  const value = s.refId ? '●→' : s.value;
  if (kind === 'frame' || kind === 'scope') return clip(`${s.name} = ${value}`, FRAME_LINE_CHARS);
  const name = kind === 'array' ? `[${s.name}]` : s.name;
  return clip(`${name}: ${value}`, OBJECT_LINE_CHARS);
}

/** The enter animation and colour transitions the frames use; off under reduced motion. */
export const STACK_CSS = `
        .sh-enter { animation: sh-fade 450ms ease-out both; }
        .sh-shape { transition: fill 400ms, stroke 400ms, opacity 500ms; }
        .sh-ref { transition: stroke 300ms, stroke-width 300ms, opacity 300ms; }
        @keyframes sh-fade { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .sh-enter { animation: none; }
          .sh-shape, .sh-ref { transition: none; }
        }
      `;
