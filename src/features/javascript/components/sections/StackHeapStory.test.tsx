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
