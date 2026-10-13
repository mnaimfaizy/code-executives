import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MIN_EDITOR_PX, MIN_SIDE_PX, usePaneLayout, widenMiddlePane } from './usePaneLayout';

const DEFAULTS: [number, number] = [0.3, 0.78];

/** The pane widths, in pixels, that `dividers` give a content area `width` wide */
const widths = ([left, right]: [number, number], width: number) => ({
  editor: left * width,
  lens: (right - left) * width,
  side: (1 - right) * width,
});

describe('widenMiddlePane', () => {
  it('gives the lens pane the width 3D needs at 1440, taking from both neighbours', () => {
    const width = 1432;
    const before = widths(DEFAULTS, width);
    expect(Math.round(before.lens)).toBe(687);

    const next = widenMiddlePane(DEFAULTS, { pane: before.lens, needed: 762 });
    const after = widths(next, width);
    expect(after.lens).toBeGreaterThanOrEqual(762);
    expect(after.lens).toBeLessThan(765);
    // Both neighbours gave, and both are still usable
    expect(after.editor).toBeLessThan(before.editor);
    expect(after.side).toBeLessThan(before.side);
    expect(after.editor).toBeGreaterThanOrEqual(MIN_EDITOR_PX);
    expect(after.side).toBeGreaterThanOrEqual(MIN_SIDE_PX);
    expect(after.editor + after.lens + after.side).toBeCloseTo(width, 6);
  });

  it('changes nothing when the pane is already wide enough', () => {
    expect(widenMiddlePane(DEFAULTS, { pane: 800, needed: 762 })).toBe(DEFAULTS);
    expect(widenMiddlePane(DEFAULTS, { pane: 762, needed: 762 })).toBe(DEFAULTS);
  });

  it('changes nothing when the window is too small to keep the editor usable', () => {
    // 1024 wide: the lens pane has 491px, and the neighbours cannot spare 271 more
    const width = 1024;
    const pane = widths(DEFAULTS, width).lens;
    expect(widenMiddlePane(DEFAULTS, { pane, needed: 762 })).toBe(DEFAULTS);
  });

  it('never takes a neighbour below its minimum', () => {
    for (const width of [1200, 1280, 1366, 1440, 1600, 1920]) {
      for (const dividers of [DEFAULTS, [0.2, 0.6], [0.45, 0.85], [0.5, 0.7]] as [
        number,
        number,
      ][]) {
        const before = widths(dividers, width);
        const next = widenMiddlePane(dividers, { pane: before.lens, needed: 762 });
        const after = widths(next, width);
        const label = `${width} ${dividers.join('/')}`;
        if (next === dividers) continue;
        expect(after.lens, label).toBeGreaterThanOrEqual(762);
        expect(after.editor, label).toBeGreaterThanOrEqual(Math.min(before.editor, MIN_EDITOR_PX));
        expect(after.side, label).toBeGreaterThanOrEqual(Math.min(before.side, MIN_SIDE_PX));
        expect(next[0], label).toBeGreaterThanOrEqual(0.15 - 1e-9);
        expect(1 - next[1], label).toBeGreaterThanOrEqual(0.15 - 1e-9);
      }
    }
  });

  it('takes only from the neighbour that has room', () => {
    // The editor is already at its minimum: the Console pane gives everything
    const width = 1600;
    const dividers: [number, number] = [MIN_EDITOR_PX / width, 0.6];
    const before = widths(dividers, width);
    const next = widenMiddlePane(dividers, { pane: before.lens, needed: 762 });
    expect(next[0]).toBeCloseTo(dividers[0], 9);
    expect(widths(next, width).lens).toBeGreaterThanOrEqual(762);
  });

  it('works from the width the pane really has, which the resizers make a little smaller', () => {
    // Laid out, the pane is 8px narrower than its fraction of the container
    const width = 1432;
    const pane = widths(DEFAULTS, width).lens - 8;
    const next = widenMiddlePane(DEFAULTS, { pane, needed: 762 });
    const scale = pane / (DEFAULTS[1] - DEFAULTS[0]);
    expect((next[1] - next[0]) * scale).toBeGreaterThanOrEqual(762);
  });

  it('ignores a measurement that makes no sense', () => {
    expect(widenMiddlePane(DEFAULTS, { pane: 0, needed: 762 })).toBe(DEFAULTS);
    expect(widenMiddlePane(DEFAULTS, { pane: Number.NaN, needed: 762 })).toBe(DEFAULTS);
  });
});

describe('usePaneLayout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('widens once, remembers it, and leaves a later drag alone', () => {
    const { result } = renderHook(() => usePaneLayout());
    expect(result.current.dividers).toEqual(DEFAULTS);

    act(() => result.current.widenMiddle({ pane: 687, needed: 762 }));
    const widened = result.current.dividers;
    expect(widened[1] - widened[0]).toBeGreaterThan(DEFAULTS[1] - DEFAULTS[0]);
    expect(JSON.parse(localStorage.getItem('pg-pane-layout-v2') ?? '')).toEqual(widened);

    // The learner drags the lens pane narrow again: nothing widens it back
    act(() => result.current.setDivider(1, 0.6));
    expect(result.current.dividers[1]).toBe(0.6);
    expect(result.current.dividers[0]).toBe(widened[0]);
  });

  it('changes nothing, and stores nothing, when there is no room', () => {
    const { result } = renderHook(() => usePaneLayout());
    act(() => result.current.widenMiddle({ pane: 400, needed: 762 }));
    expect(result.current.dividers).toEqual(DEFAULTS);
    expect(localStorage.getItem('pg-pane-layout-v2')).toBeNull();
  });
});
