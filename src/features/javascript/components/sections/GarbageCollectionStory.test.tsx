import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { StackHeapView3DProps } from '../../../../shared/viz3d/stackheap/StackHeapView3D';

const webgl = vi.hoisted(() => ({ available: true }));
const motion = vi.hoisted(() => ({ reduced: false }));

vi.mock('../../../../shared/utils/webgl', () => ({ canUseWebGL: () => webgl.available }));
vi.mock('../../../../shared/hooks/useReducedMotion', () => ({
  useReducedMotion: () => motion.reduced,
  default: () => motion.reduced,
}));
vi.mock('../../../../shared/viz3d/stackheap/StackHeapView3D', () => ({
  default: ({ snapshot, shot, gcPhase, focus, camera, instant, label }: StackHeapView3DProps) => (
    <div
      data-testid="scene-3d"
      data-shot={shot}
      data-gc={gcPhase ?? ''}
      data-focus={focus.join(' ')}
      data-preset={camera.preset}
      data-instant={String(Boolean(instant))}
      aria-label={label}
    >
      {snapshot.objects.map((o) => `${o.id}:${o.state}`).join(' ')}
    </div>
  ),
}));

import GarbageCollectionStory from './GarbageCollectionStory';
import { STORY_BEATS, STORY_CODE, withState } from '../../utils/garbageCollectionStory';
import { SPLIT_FROM, STORY_SPLIT, labelPx } from '../../../../shared/components/viz/storyLayout';

const VIEW_KEY = 'code-executives.garbage-collection-story.view';
const COUNT = STORY_BEATS.length;

const next = () => screen.getByRole('button', { name: 'Next beat' });
const previous = () => screen.getByRole('button', { name: 'Previous beat' });
const stepTo = async (user: ReturnType<typeof userEvent.setup>, beat: number) => {
  for (let i = 1; i < beat; i++) await user.click(next());
};
const drawing = () => screen.getByRole('img', { name: /^Stack and heap: / });
const tagged = (tag: string) =>
  [...drawing().querySelectorAll('[data-viz-label]')]
    .filter((g) => [...g.querySelectorAll('text')].some((t) => t.textContent === tag))
    // A heap object's heading carries `#id` in a tspan; a frame has none
    .map((g) => g.querySelector('tspan')?.textContent?.trim().slice(1) ?? 'frame');

describe('GarbageCollectionStory', () => {
  beforeEach(() => {
    window.localStorage.clear();
    webgl.available = true;
    motion.reduced = false;
  });

  it('starts in 2D on beat 1 and steps forward and back', async () => {
    const user = userEvent.setup();
    render(<GarbageCollectionStory />);

    expect(screen.getByRole('radio', { name: /2d/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(`Beat 1 / ${COUNT}`)).toBeInTheDocument();
    expect(previous()).toBeDisabled();

    await user.click(next());
    expect(screen.getByRole('heading', { name: STORY_BEATS[1].title })).toBeInTheDocument();
    expect(screen.getByText(`Beat 2 / ${COUNT}`)).toBeInTheDocument();

    await user.click(previous());
    expect(screen.getByRole('heading', { name: STORY_BEATS[0].title })).toBeInTheDocument();
  });

  it("shows every beat's title, caption, line and drawing, in order", async () => {
    const user = userEvent.setup();
    render(<GarbageCollectionStory />);
    const lines = STORY_CODE.split('\n');

    for (const [i, beat] of STORY_BEATS.entries()) {
      expect(screen.getByText(`Beat ${i + 1} / ${COUNT}`)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: beat.title })).toBeInTheDocument();
      expect(screen.getByText(beat.caption)).toBeInTheDocument();
      expect(drawing()).toHaveAttribute('aria-label', `Stack and heap: ${beat.title}`);
      // The code panel highlights the beat's line
      const current = screen.getByLabelText('Story code').querySelectorAll('[aria-current="step"]');
      expect(current).toHaveLength(1);
      expect(current[0].querySelector('code')!.textContent).toBe(lines[beat.line - 1]);
      // The collector's work, read off the drawing
      expect(tagged('MARKED'), beat.id).toEqual(beat.gcPhase ? withState(beat, 'marked') : []);
      expect(tagged('UNMARKED'), beat.id).toEqual(withState(beat, 'unmarked'));
      expect(tagged('RECLAIMED'), beat.id).toEqual(withState(beat, 'collected'));
      expect(tagged('ROOT'), beat.id).toHaveLength(beat.gcPhase === 'mark' ? 2 : 0);
      if (i < COUNT - 1) await user.click(next());
    }
    expect(next()).toBeDisabled();
  });

  it('asks its question in the caption of beat 7, with no quiz widget', async () => {
    const user = userEvent.setup();
    const { container } = render(<GarbageCollectionStory />);
    await stepTo(user, 7);
    expect(screen.getByText(/Will the collector keep them\?$/)).toBeInTheDocument();
    expect(container.querySelectorAll('input, textarea, form, [data-viz-choice]')).toHaveLength(0);
    expect(next()).toBeEnabled();
  });

  it('says how many beats the model has', () => {
    const { container } = render(<GarbageCollectionStory />);
    expect(screen.getByText(new RegExp(`^A ${COUNT}-beat story\\.`))).toBeVisible();
    // The beat strip: one dot per beat, named by its title
    const dots = [...container.querySelectorAll('[aria-hidden] > button[title]')];
    expect(dots.map((dot) => dot.getAttribute('title'))).toEqual(STORY_BEATS.map((b) => b.title));
  });

  it('steps with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<GarbageCollectionStory />);
    screen.getByLabelText(/Garbage collection story/).focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByText(`Beat 3 / ${COUNT}`)).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText(`Beat 2 / ${COUNT}`)).toBeInTheDocument();
  });

  it('keeps the beat when switching to 3D and back, and hands 3D the same snapshot', async () => {
    const user = userEvent.setup();
    render(<GarbageCollectionStory />);
    await stepTo(user, 5);
    const beat = STORY_BEATS[4];

    await user.click(screen.getByRole('radio', { name: /3d/i }));
    const scene = await screen.findByTestId('scene-3d');
    expect(scene).toHaveTextContent('page:marked page0:marked draft:live draft0:live');
    expect(scene).toHaveAttribute('data-shot', beat.shot);
    expect(scene).toHaveAttribute('data-gc', 'mark');
    expect(scene).toHaveAttribute('data-focus', beat.focus.join(' '));
    expect(scene).toHaveAttribute('aria-label', `3D view of the stack and heap: ${beat.title}`);
    expect(screen.getByText(`Beat 5 / ${COUNT}`)).toBeInTheDocument();
    expect(window.localStorage.getItem(VIEW_KEY)).toBe('3d');

    await user.click(next());
    expect(scene).toHaveAttribute('data-focus', STORY_BEATS[5].focus.join(' '));

    await user.click(screen.getByRole('radio', { name: /2d/i }));
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    expect(drawing()).toHaveAttribute('aria-label', `Stack and heap: ${STORY_BEATS[5].title}`);
    expect(screen.getByText(`Beat 6 / ${COUNT}`)).toBeInTheDocument();
  });

  it('remembers the view under its own key, apart from the Stack ↔ Heap story', async () => {
    window.localStorage.setItem('code-executives.stack-heap-story.view', '3d');
    render(<GarbageCollectionStory />);
    expect(screen.getByRole('radio', { name: /2d/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
  });

  it('cuts instead of gliding in 3D under reduced motion', async () => {
    motion.reduced = true;
    window.localStorage.setItem(VIEW_KEY, '3d');
    render(<GarbageCollectionStory />);
    expect(await screen.findByTestId('scene-3d')).toHaveAttribute('data-instant', 'true');
  });

  it('falls back to 2D when WebGL is unavailable', () => {
    webgl.available = false;
    window.localStorage.setItem(VIEW_KEY, '3d');
    render(<GarbageCollectionStory />);

    expect(screen.getByRole('radio', { name: /3d/i })).toBeDisabled();
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    expect(drawing()).toBeInTheDocument();
  });

  it('puts the code above the picture, and draws 12-unit labels at 10px or more from 1280 up', () => {
    const { container } = render(<GarbageCollectionStory />);
    const viewer = container.querySelector<HTMLElement>('[data-viz-viewer]')!;
    const column = viewer.parentElement!;
    const aside = screen.getByLabelText('Story code').closest(`[class="${STORY_SPLIT.aside}"]`)!;

    // One row that only splits at 2xl; in the document the code comes first.
    expect(column.className).toBe(STORY_SPLIT.viewer);
    expect(column.parentElement!.className).toBe(STORY_SPLIT.row);
    expect(aside.parentElement).toBe(column.parentElement);
    expect(aside.compareDocumentPosition(column) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // In 2D the viewer is 500px high from xl and as high as the drawing below.
    expect(viewer.className).toContain('xl:h-[500px]');
    expect(viewer.className).not.toMatch(/(^| )h-\[/);
    const [, , width, height] = drawing().getAttribute('viewBox')!.split(' ').map(Number);
    expect([width, height]).toEqual([800, 480]);
    const box = (page: number) => ({
      view: { width, height },
      inset: 2,
      height: page >= 1280 ? 498 : undefined,
    });
    for (const page of [1280, 1440, SPLIT_FROM]) {
      expect(labelPx(page, box(page)), `${page}`).toBeGreaterThanOrEqual(10);
    }
  });

  it('gives the 3D view the same column, at a fixed height', async () => {
    const user = userEvent.setup();
    const { container } = render(<GarbageCollectionStory />);
    const viewer = container.querySelector<HTMLElement>('[data-viz-viewer]')!;
    await user.click(screen.getByRole('radio', { name: /3d/i }));
    await screen.findByTestId('scene-3d');

    expect(viewer).toHaveAttribute('data-view', '3d');
    expect(viewer.parentElement!.className).toBe(STORY_SPLIT.viewer);
    expect(viewer.className).toContain('sm:h-[500px]');
  });
});
