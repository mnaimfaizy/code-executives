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
      data-spaces={(snapshot.spaces ?? []).map((s) => `${s.id}:${s.role ?? ''}`).join(' ')}
      aria-label={label}
    >
      {snapshot.objects.map((o) => `${o.id}:${o.state}`).join(' ')}
    </div>
  ),
}));

import GenerationalCollectionStory from './GenerationalCollectionStory';
import {
  STORY_BEATS,
  STORY_CODE,
  isSpaceFreed,
  withState,
} from '../../utils/generationalCollectionStory';
import { labelPx, storyContentWidth } from '../../../../shared/components/viz/storyLayout';

const VIEW_KEY = 'code-executives.generational-collection-story.view';
const COUNT = STORY_BEATS.length;

const next = () => screen.getByRole('button', { name: 'Next beat' });
const previous = () => screen.getByRole('button', { name: 'Previous beat' });
const stepTo = async (user: ReturnType<typeof userEvent.setup>, beat: number) => {
  for (let i = 1; i < beat; i++) await user.click(next());
};
const drawing = () => screen.getByRole('img', { name: /^Stack and heap: / });
/** How many heap objects carry a tag. */
const taggedObjects = (tag: string) =>
  [...drawing().querySelectorAll(`[data-viz-state] [data-viz-tag="${tag}"]`)].length;
const spaceTags = (id: string) =>
  [...drawing().querySelectorAll(`[data-viz-space="${id}"] [data-viz-tag]`)].map((t) =>
    t.getAttribute('data-viz-tag')
  );

describe('GenerationalCollectionStory', () => {
  beforeEach(() => {
    window.localStorage.clear();
    webgl.available = true;
    motion.reduced = false;
  });

  it('starts in 2D on beat 1 and steps forward and back', async () => {
    const user = userEvent.setup();
    render(<GenerationalCollectionStory />);

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
    render(<GenerationalCollectionStory />);
    const lines = STORY_CODE.split('\n');

    for (const [i, beat] of STORY_BEATS.entries()) {
      expect(screen.getByText(`Beat ${i + 1} / ${COUNT}`)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: beat.title })).toBeInTheDocument();
      expect(screen.getByText(beat.caption)).toBeInTheDocument();
      expect(drawing()).toHaveAttribute('aria-label', `Stack and heap: ${beat.title}`);
      const current = screen.getByLabelText('Story code').querySelectorAll('[aria-current="step"]');
      expect(current).toHaveLength(1);
      expect(current[0].querySelector('code')!.textContent).toBe(lines[beat.line - 1]);
      // The collector's work, read off the drawing
      expect(taggedObjects('copied'), beat.id).toBe(withState(beat, 'copied').length);
      expect(drawing().textContent, beat.id).not.toContain('RECLAIMED');
      for (const space of beat.spaces) {
        expect(spaceTags(space.id), `${beat.id} › ${space.id}`).toEqual([
          ...(space.role ? [`${space.role}-space`] : []),
          ...(isSpaceFreed(beat, space.id) ? ['free'] : []),
        ]);
      }
      const roots = [...drawing().querySelectorAll('text')].filter((t) => t.textContent === 'ROOT');
      expect(roots, beat.id).toHaveLength(beat.gcPhase === 'scavenge' ? 1 : 0);
      expect(drawing().querySelectorAll('[data-viz-trail]'), beat.id).toHaveLength(
        withState(beat, 'copied').length
      );
      if (i < COUNT - 1) await user.click(next());
    }
    expect(next()).toBeDisabled();
  });

  it('says how many beats the model has, with one dot per beat', () => {
    const { container } = render(<GenerationalCollectionStory />);
    expect(screen.getByText(new RegExp(`^A ${COUNT}-beat story\\.`))).toBeVisible();
    const dots = [...container.querySelectorAll('[aria-hidden] > button[title]')];
    expect(dots.map((dot) => dot.getAttribute('title'))).toEqual(STORY_BEATS.map((b) => b.title));
  });

  it('jumps to a beat from the beat strip', async () => {
    const user = userEvent.setup();
    const { container } = render(<GenerationalCollectionStory />);
    const dots = [
      ...container.querySelectorAll<HTMLButtonElement>('[aria-hidden] > button[title]'),
    ];
    await user.click(dots[5]);
    expect(screen.getByText(`Beat 6 / ${COUNT}`)).toBeInTheDocument();
  });

  it('steps with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<GenerationalCollectionStory />);
    screen.getByLabelText(/Generational collection story/).focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByText(`Beat 3 / ${COUNT}`)).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText(`Beat 2 / ${COUNT}`)).toBeInTheDocument();
  });

  it('keeps the beat when switching to 3D and back, and hands 3D the same snapshot', async () => {
    const user = userEvent.setup();
    render(<GenerationalCollectionStory />);
    await stepTo(user, 4);
    const beat = STORY_BEATS[3];

    await user.click(screen.getByRole('radio', { name: /3d/i }));
    const scene = await screen.findByTestId('scene-3d');
    expect(scene).toHaveTextContent(beat.objects.map((o) => `${o.id}:${o.state}`).join(' '));
    expect(scene).toHaveAttribute('data-shot', beat.shot);
    expect(scene).toHaveAttribute('data-gc', 'scavenge');
    expect(scene).toHaveAttribute('data-spaces', 'young-a:from young-b:to old:');
    expect(scene).toHaveAttribute('data-focus', beat.focus.join(' '));
    expect(scene).toHaveAttribute('aria-label', `3D view of the stack and heap: ${beat.title}`);
    expect(screen.getByText(`Beat 4 / ${COUNT}`)).toBeInTheDocument();
    expect(window.localStorage.getItem(VIEW_KEY)).toBe('3d');

    await user.click(next());
    expect(scene).toHaveAttribute('data-focus', STORY_BEATS[4].focus.join(' '));

    await user.click(screen.getByRole('radio', { name: /2d/i }));
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    expect(drawing()).toHaveAttribute('aria-label', `Stack and heap: ${STORY_BEATS[4].title}`);
    expect(screen.getByText(`Beat 5 / ${COUNT}`)).toBeInTheDocument();
  });

  it('remembers the view under its own key, apart from the Garbage Collection story', async () => {
    window.localStorage.setItem('code-executives.garbage-collection-story.view', '3d');
    render(<GenerationalCollectionStory />);
    expect(screen.getByRole('radio', { name: /2d/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
  });

  it('cuts instead of gliding in 3D under reduced motion', async () => {
    motion.reduced = true;
    window.localStorage.setItem(VIEW_KEY, '3d');
    render(<GenerationalCollectionStory />);
    expect(await screen.findByTestId('scene-3d')).toHaveAttribute('data-instant', 'true');
  });

  it('draws the copy trail without its enter animation under reduced motion', async () => {
    motion.reduced = true;
    const user = userEvent.setup();
    render(<GenerationalCollectionStory />);
    await stepTo(user, 4);
    const trail = drawing().querySelector('[data-viz-trail]')!;
    expect(trail).not.toHaveClass('sh-enter');
  });

  it('falls back to 2D when WebGL is unavailable', () => {
    webgl.available = false;
    window.localStorage.setItem(VIEW_KEY, '3d');
    render(<GenerationalCollectionStory />);

    expect(screen.getByRole('radio', { name: /3d/i })).toBeDisabled();
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    expect(drawing()).toBeInTheDocument();
  });

  it('keeps the code above the picture at every width, and draws 12-unit labels at 10px or more from 1280 up', () => {
    const { container } = render(<GenerationalCollectionStory />);
    const viewer = container.querySelector<HTMLElement>('[data-viz-viewer]')!;
    const column = viewer.parentElement!;
    const aside = screen.getByLabelText('Story code').parentElement!.closest('.grid')!;

    // Never split: the viewer column takes the section's full width.
    expect(column.parentElement!.className).toBe('flex min-w-0 flex-col gap-3');
    expect(column.className).not.toMatch(/w-\[/);
    expect(aside.parentElement).toBe(column.parentElement);
    expect(aside.compareDocumentPosition(column) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // In 2D the viewer has no fixed height: it is as high as the drawing at that width.
    expect(viewer.className).not.toMatch(/(^| )(xl:|sm:)?h-\[/);
    const [, , width, height] = drawing().getAttribute('viewBox')!.split(' ').map(Number);
    expect([width, height]).toEqual([1014, 760]);
    for (const page of [1280, 1440, 1536, 1920]) {
      // labelPx's viewer column is the full content width below the split; here it always is.
      const px = 12 * ((storyContentWidth(page) - 2) / width);
      expect(px, `${page}`).toBeGreaterThanOrEqual(10);
      if (page < 1536) expect(px).toBe(labelPx(page, { view: { width, height }, inset: 2 }));
    }
  });
});
