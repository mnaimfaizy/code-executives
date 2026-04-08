import { useState, useCallback } from 'react';

const STORAGE_KEY = 'pg-pane-layout';
const DEFAULT_DIVIDERS: [number, number] = [0.33, 0.66];
const MIN_FRACTION = 0.15;

/**
 * Manage the two divider positions (as fractions 0–1) for the three-pane layout.
 * Divider 0 sits between pane 1 and 2; divider 1 sits between pane 2 and 3.
 */
export function usePaneLayout(): {
  dividers: [number, number];
  setDivider: (index: 0 | 1, fraction: number) => void;
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

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage full — ignore
      }
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

  return { dividers, setDivider, resetDividers, paneStyles };
}
