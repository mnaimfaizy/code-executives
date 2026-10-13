import { useState, useCallback } from 'react';

// v2: the defaults changed when the lens moved to the shared views, which need the widest pane
const STORAGE_KEY = 'pg-pane-layout-v2';
const DEFAULT_DIVIDERS: [number, number] = [0.3, 0.78];
const MIN_FRACTION = 0.15;

/** The narrowest the editor is made to give the lens room: about 40 characters of code. */
export const MIN_EDITOR_PX = 320;
/** The narrowest the Task and Console pane is made to give the lens room. */
export const MIN_SIDE_PX = 240;

/** Widths in CSS pixels, measured when the middle pane is asked to grow. */
export interface MiddlePaneMeasure {
  /** The middle pane's width now */
  pane: number;
  /** The width it should have */
  needed: number;
}

/**
 * The dividers that give the middle pane the width it needs, or the same dividers when it
 * already has it or the window is too small.
 *
 * The room comes from both neighbours, in proportion to what each can spare above its own
 * minimum (`MIN_EDITOR_PX`, `MIN_SIDE_PX`, and the fraction a drag is held to). When together
 * they cannot spare enough, nothing moves: a half-widened pane would squeeze the editor and
 * still not fit the view.
 */
export function widenMiddlePane(
  dividers: [number, number],
  { pane, needed }: MiddlePaneMeasure
): [number, number] {
  const [left, right] = dividers;
  if (!(pane > 0) || !(needed > pane) || !(right > left)) return dividers;
  // What one pixel is as a fraction, as the pane is laid out now (the resizers take a little)
  const perPixel = (right - left) / pane;
  // A pixel more than asked, so rounding never leaves the pane a fraction short
  const deficit = (needed - pane + 1) * perPixel;
  const spareLeft = Math.max(0, left - Math.max(MIN_FRACTION, MIN_EDITOR_PX * perPixel));
  const spareRight = Math.max(0, 1 - right - Math.max(MIN_FRACTION, MIN_SIDE_PX * perPixel));
  if (spareLeft + spareRight < deficit) return dividers;
  const fromLeft = (deficit * spareLeft) / (spareLeft + spareRight);
  return [left - fromLeft, right + (deficit - fromLeft)];
}

function store(next: [number, number]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full — ignore
  }
}

/**
 * Manage the two divider positions (as fractions 0–1) for the three-pane layout.
 * Divider 0 sits between pane 1 and 2; divider 1 sits between pane 2 and 3.
 */
export function usePaneLayout(): {
  dividers: [number, number];
  setDivider: (index: 0 | 1, fraction: number) => void;
  /**
   * Give the middle pane the width it needs, once, if the window has room for it. The
   * learner can drag the dividers back afterwards: nothing holds them.
   */
  widenMiddle: (measure: MiddlePaneMeasure) => void;
  resetDividers: () => void;
  paneStyles: { gridTemplateColumns: string };
} {
  const [dividers, setDividers] = useState<[number, number]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as [number, number];
        if (
          Array.isArray(parsed) &&
          parsed.length === 2 &&
          typeof parsed[0] === 'number' &&
          typeof parsed[1] === 'number'
        ) {
          return parsed;
        }
      }
    } catch {
      // ignore corrupt storage
    }
    return DEFAULT_DIVIDERS;
  });

  const setDivider = useCallback((index: 0 | 1, fraction: number) => {
    setDividers((prev) => {
      const next: [number, number] = [...prev];
      next[index] = fraction;

      // Enforce minimum pane widths
      // Pane 1 = 0..d0, Pane 2 = d0..d1, Pane 3 = d1..1
      if (index === 0) {
        next[0] = Math.max(MIN_FRACTION, Math.min(next[0], next[1] - MIN_FRACTION));
      } else {
        next[1] = Math.max(next[0] + MIN_FRACTION, Math.min(next[1], 1 - MIN_FRACTION));
      }

      store(next);
      return next;
    });
  }, []);

  const widenMiddle = useCallback((measure: MiddlePaneMeasure) => {
    setDividers((prev) => {
      const next = widenMiddlePane(prev, measure);
      if (next !== prev) store(next);
      return next;
    });
  }, []);

  const resetDividers = useCallback(() => {
    setDividers(DEFAULT_DIVIDERS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const paneStyles = {
    gridTemplateColumns: `${dividers[0] * 100}% ${(dividers[1] - dividers[0]) * 100}% ${(1 - dividers[1]) * 100}%`,
  };

  return { dividers, setDivider, widenMiddle, resetDividers, paneStyles };
}
