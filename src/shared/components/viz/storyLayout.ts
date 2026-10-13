/**
 * Where a story section puts its code panel: above the picture, or beside it.
 *
 * The picture is the lesson, so it is never the part that shrinks. A 2D view scales with the
 * width it is given, and its 12-unit labels must be drawn at 10px or more. Beside the code the
 * picture gets 62% of the section; that is only wide enough once the page content has reached
 * its full width, so the code stays above the picture below Tailwind's `2xl`.
 *
 * Pure: no React. The numbers model the page chrome from `lg` up (sidebar visible), and
 * `storyLayout.test.ts` holds each split story to the 10px rule with them.
 */

/** Tailwind `2xl`: the first breakpoint where the page content is at its full width. */
export const SPLIT_FROM = 1536;

/** The classes of a split story. Written out whole: Tailwind cannot see built class names. */
export const STORY_SPLIT = {
  /** Wraps the code column and the viewer column. */
  row: 'flex min-w-0 flex-col gap-3 2xl:flex-row',
  /** Code and narration: side by side above the picture, a column beside it. */
  aside:
    'grid min-w-0 gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] 2xl:flex 2xl:w-[38%] 2xl:flex-col',
  /** The viewer and its controls. */
  viewer: 'flex min-w-0 flex-col gap-2 2xl:w-[62%]',
} as const;

/** The viewer column's share beside the code (`2xl:w-[62%]`), and the gap between them (`gap-3`). */
const VIEWER_SHARE = 0.62;
const SPLIT_GAP = 12;

/*
 * The page chrome around a story section, from `lg` (1024px) up:
 * - the sidebar is `w-64` (src/components/Sidebar.tsx);
 * - <main> is `max-w-7xl` with `lg:px-8` (src/App.tsx);
 * - a module page pads its section with `sm:p-6` (e.g. JavaScriptPage.tsx, GitPage.tsx);
 * - the story section has a 1px border and `sm:p-6`.
 */
const SIDEBAR = 256;
const MAIN_MAX = 1280;
const CHROME = 2 * (32 + 24 + 24 + 1);

/** Width of a story section's content box on a page `page` px wide (1024 and up). */
export function storyContentWidth(page: number): number {
  return Math.min(page - SIDEBAR, MAIN_MAX) - CHROME;
}

/** Width of the viewer column: the whole section above the split, its share beside the code. */
export function viewerColumnWidth(page: number): number {
  const content = storyContentWidth(page);
  // Two flex items of 38% and 62% and a gap: each gives up its share of the gap.
  return page >= SPLIT_FROM ? VIEWER_SHARE * (content - SPLIT_GAP) : content;
}

export interface ViewerBox {
  /** The 2D view's viewBox. */
  view: { width: number; height: number };
  /** What the viewer box takes from the column's width: its border, and any padding. */
  inset: number;
  /** Inner height of the viewer box when it is fixed; the drawing then has to fit it too. */
  height?: number;
}

/** The size, in CSS px, at which a 2D view draws a `units`-unit label on a page `page` px wide. */
export function labelPx(page: number, box: ViewerBox, units = 12): number {
  const byWidth = (viewerColumnWidth(page) - box.inset) / box.view.width;
  const byHeight = box.height === undefined ? Infinity : box.height / box.view.height;
  return units * Math.min(byWidth, byHeight);
}
