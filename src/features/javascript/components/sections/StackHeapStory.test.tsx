import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { StackHeap3DProps } from '../visualizations/3d/StackHeap3D';

const webgl = vi.hoisted(() => ({ available: true }));

vi.mock('../../../../shared/utils/webgl', () => ({ canUseWebGL: () => webgl.available }));
vi.mock('../visualizations/3d/StackHeap3D', () => ({
  default: ({ beat, camera }: StackHeap3DProps) => (
    <div
      data-testid="scene-3d"
      data-preset={camera.preset}
      data-hold={String(camera.hold)}
      data-command={camera.command?.kind ?? ''}
    >
      {beat.id}
    </div>
  ),
}));

import StackHeapStory from './StackHeapStory';
import { STORY_BEATS } from '../../utils/stackHeapStory';
import { SPLIT_FROM, STORY_SPLIT, labelPx } from '../../../../shared/components/viz/storyLayout';

describe('StackHeapStory', () => {
  beforeEach(() => {
    window.localStorage.clear();
    webgl.available = true;
  });

  it('starts in 2D on beat 1 and steps forward and back', async () => {
    const user = userEvent.setup();
    render(<StackHeapStory />);

    expect(screen.getByRole('radio', { name: /2d/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Beat 1 / 10')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next beat' }));
    expect(screen.getByText('main() is called')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous beat' }));
    expect(screen.getByText('The program starts')).toBeInTheDocument();
  });

  it('keeps the current beat when switching to 3D and back', async () => {
    const user = userEvent.setup();
    render(<StackHeapStory />);

    for (let i = 0; i < 6; i++) await user.click(screen.getByRole('button', { name: 'Next beat' }));
    await user.click(screen.getByRole('radio', { name: /3d/i }));

    expect(await screen.findByTestId('scene-3d')).toHaveTextContent('bob-null');
    expect(screen.getByText('Beat 7 / 10')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /2d/i }));
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /bob = null/ })).toBeInTheDocument();
  });

  it('drives the 3D camera from the viewer toolbar and keys without losing the beat', async () => {
    const user = userEvent.setup();
    const { container } = render(<StackHeapStory />);

    await user.click(screen.getByRole('button', { name: 'Next beat' }));
    await user.click(screen.getByRole('radio', { name: /3d/i }));
    const scene = await screen.findByTestId('scene-3d');
    const beatText = screen.getByText(/^Beat 2 \//);

    // Reset view lives in the viewer's toolbar now, not in the beat controls.
    const viewerEl = container.querySelector<HTMLElement>('[data-viz-viewer]')!;
    const reset = within(viewerEl).getByRole('button', { name: 'Reset view' });

    await user.click(screen.getByRole('radio', { name: 'Front view' }));
    expect(scene).toHaveAttribute('data-preset', 'front');

    screen.getByLabelText(/Stack and heap story/).focus();
    await user.keyboard('h');
    expect(scene).toHaveAttribute('data-hold', 'true');
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(scene).toHaveAttribute('data-command', 'orbit');
    expect(beatText).toHaveTextContent(/^Beat 2 \//);

    await user.click(reset);
    expect(scene).toHaveAttribute('data-preset', 'iso');
    expect(scene).toHaveAttribute('data-hold', 'false');
    expect(scene).toHaveAttribute('data-command', 'reset');

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText(/^Beat 3 \//)).toBeInTheDocument();
  });

  it('says how many beats the story has', () => {
    render(<StackHeapStory />);
    expect(screen.getByText(new RegExp(`^A ${STORY_BEATS.length}-beat story\\.`))).toBeVisible();
    expect(screen.getByText(`Beat 1 / ${STORY_BEATS.length}`)).toBeInTheDocument();
  });

  it('puts the code above the picture, and draws 12-unit labels at 10px or more from 1280 up', () => {
    const { container } = render(<StackHeapStory />);
    const viewer = container.querySelector<HTMLElement>('[data-viz-viewer]')!;
    const column = viewer.parentElement!;
    const aside = screen.getByLabelText('Story code').closest(`[class="${STORY_SPLIT.aside}"]`)!;

    // One row that only splits at 2xl; in the document the code comes first.
    expect(column.className).toBe(STORY_SPLIT.viewer);
    expect(column.parentElement!.className).toBe(STORY_SPLIT.row);
    expect(aside.parentElement).toBe(column.parentElement);
    expect(aside.compareDocumentPosition(column) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // The viewer box: a 1px border; in 2D it is 500px high from xl and as high as the drawing
    // below, so nothing but the width limits the drawing there.
    expect(viewer.className).toContain('xl:h-[500px]');
    expect(viewer.className).not.toMatch(/(^| )h-\[/);
    const [, , width, height] = screen
      .getByRole('img', { name: /Stack and heap/ })
      .getAttribute('viewBox')!
      .split(' ')
      .map(Number);
    const box = (page: number) => ({
      view: { width, height },
      inset: 2,
      height: page >= 1280 ? 498 : undefined,
    });

    expect(labelPx(1280, box(1280))).toBeGreaterThanOrEqual(10);
    expect(labelPx(1440, box(1440))).toBeGreaterThanOrEqual(10);
    expect(labelPx(SPLIT_FROM, box(SPLIT_FROM))).toBeGreaterThanOrEqual(10);
    // At 1024 the section is 606px wide and the drawing 800 units: the whole width gives 9.06px.
    // Only narrower page chrome could give more; the picture is not made to scroll for it.
    expect(labelPx(1024, box(1024))).toBeCloseTo(9.06, 2);
  });

  it('gives the 3D view the same column, at a fixed height', async () => {
    const user = userEvent.setup();
    const { container } = render(<StackHeapStory />);
    const viewer = container.querySelector<HTMLElement>('[data-viz-viewer]')!;
    await user.click(screen.getByRole('radio', { name: /3d/i }));
    await screen.findByTestId('scene-3d');

    expect(viewer).toHaveAttribute('data-view', '3d');
    expect(viewer.parentElement!.className).toBe(STORY_SPLIT.viewer);
    expect(viewer.className).toContain('sm:h-[500px]');
  });

  it('opens its own program in the Playground, with its lens, in a new tab', () => {
    render(<StackHeapStory />);
    const link = screen.getByRole('link', { name: /Try it in the Playground/ });
    expect(link).toHaveAttribute('href', '/playground?example=stack-heap-story&lens=stack-heap');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.closest('p')).toHaveTextContent(/opens there with the Stack & Heap lens chosen/);
  });

  it('falls back to 2D when WebGL is unavailable', async () => {
    webgl.available = false;
    window.localStorage.setItem('code-executives.stack-heap-story.view', '3d');
    render(<StackHeapStory />);

    expect(screen.getByRole('radio', { name: /3d/i })).toBeDisabled();
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
  });
});
