import { describe, expect, it } from 'vitest';
import {
  SPLIT_FROM,
  STORY_SPLIT,
  labelPx,
  storyContentWidth,
  viewerColumnWidth,
} from './storyLayout';

describe('storyLayout', () => {
  it('measures the story section inside the page chrome', () => {
    // 1024 - 256 (sidebar) - 64 (main) - 48 (page) - 50 (section padding and border).
    expect(storyContentWidth(1024)).toBe(606);
    expect(storyContentWidth(1280)).toBe(862);
    expect(storyContentWidth(1440)).toBe(1022);
    // <main> stops growing at max-w-7xl.
    expect(storyContentWidth(1536)).toBe(1118);
    expect(storyContentWidth(1920)).toBe(1118);
  });

  it('gives the picture the whole section until the page is 2xl wide', () => {
    for (const page of [1024, 1280, 1440, SPLIT_FROM - 1]) {
      expect(viewerColumnWidth(page), `${page}`).toBe(storyContentWidth(page));
    }
    expect(viewerColumnWidth(SPLIT_FROM)).toBeCloseTo(0.62 * (1118 - 12), 5);
  });

  it('splits with 2xl classes only: the code never sits beside the picture below it', () => {
    expect(SPLIT_FROM).toBe(1536);
    for (const classes of Object.values(STORY_SPLIT)) {
      const responsive = classes.split(' ').filter((c) => c.includes(':'));
      // `md:` lays the code beside the narration, both above the picture.
      for (const c of responsive) expect(c).toMatch(/^(2xl|md):/);
    }
    expect(STORY_SPLIT.row).toContain('flex-col');
    expect(STORY_SPLIT.row).toContain('2xl:flex-row');
    expect(STORY_SPLIT.viewer).toContain('2xl:w-[62%]');
    expect(STORY_SPLIT.aside).toContain('2xl:w-[38%]');
  });

  it('shows why the split waits for 2xl: beside the code at xl the labels fall under 10px', () => {
    // What a 62% column at xl would give an 800-unit view at 1280 and 1440, and a 680-unit one
    // at 1280.
    const beside = (page: number, viewWidth: number) =>
      (12 * (0.62 * (storyContentWidth(page) - 12) - 2)) / viewWidth;
    expect(beside(1280, 800)).toBeLessThan(10);
    expect(beside(1440, 800)).toBeLessThan(10);
    expect(beside(1280, 680)).toBeLessThan(10);
    expect(beside(SPLIT_FROM, 800)).toBeGreaterThanOrEqual(10);
  });

  it('sizes a label by the width, and by the height when the viewer box is fixed', () => {
    const view = { width: 800, height: 480 };
    expect(labelPx(1024, { view, inset: 2 })).toBeCloseTo((12 * 604) / 800, 5);
    expect(labelPx(1280, { view, inset: 2, height: 498 })).toBeCloseTo((12 * 498) / 480, 5);
    expect(labelPx(1280, { view, inset: 2 }, 10)).toBeCloseTo((10 * 860) / 800, 5);
  });
});
