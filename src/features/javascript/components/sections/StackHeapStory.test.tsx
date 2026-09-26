import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { StackHeap3DProps } from '../visualizations/3d/StackHeap3D';

const webgl = vi.hoisted(() => ({ available: true }));

vi.mock('../../../../shared/utils/webgl', () => ({ canUseWebGL: () => webgl.available }));
vi.mock('../visualizations/3d/StackHeap3D', () => ({
  default: ({ step, camera }: StackHeap3DProps) => (
    <div
      data-testid="scene-3d"
      data-preset={camera.preset}
      data-hold={String(camera.hold)}
      data-command={camera.command?.kind ?? ''}
    >
      {step.id}
    </div>
  ),
}));

import StackHeapStory from './StackHeapStory';

describe('StackHeapStory', () => {
  beforeEach(() => {
    window.localStorage.clear();
    webgl.available = true;
  });

  it('starts in 2D on step 1 and steps forward and back', async () => {
    const user = userEvent.setup();
    render(<StackHeapStory />);

    expect(screen.getByRole('radio', { name: /2d/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Step 1 / 10')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByText('main() is called')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous step' }));
    expect(screen.getByText('The program starts')).toBeInTheDocument();
  });

  it('keeps the current step when switching to 3D and back', async () => {
    const user = userEvent.setup();
    render(<StackHeapStory />);

    for (let i = 0; i < 6; i++) await user.click(screen.getByRole('button', { name: 'Next step' }));
    await user.click(screen.getByRole('radio', { name: /3d/i }));

    expect(await screen.findByTestId('scene-3d')).toHaveTextContent('bob-null');
    expect(screen.getByText('Step 7 / 10')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /2d/i }));
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /bob = null/ })).toBeInTheDocument();
  });

  it('drives the 3D camera from the viewer toolbar and keys without losing the step', async () => {
    const user = userEvent.setup();
    const { container } = render(<StackHeapStory />);

    await user.click(screen.getByRole('button', { name: 'Next step' }));
    await user.click(screen.getByRole('radio', { name: /3d/i }));
    const scene = await screen.findByTestId('scene-3d');
    const stepText = screen.getByText(/^Step 2 \//);

    // Reset view lives in the viewer's toolbar now, not in the step controls.
    const viewerEl = container.querySelector<HTMLElement>('[data-viz-viewer]')!;
    const reset = within(viewerEl).getByRole('button', { name: 'Reset view' });

    await user.click(screen.getByRole('radio', { name: 'Front view' }));
    expect(scene).toHaveAttribute('data-preset', 'front');

    screen.getByLabelText(/Stack and heap story/).focus();
    await user.keyboard('h');
    expect(scene).toHaveAttribute('data-hold', 'true');
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(scene).toHaveAttribute('data-command', 'orbit');
    expect(stepText).toHaveTextContent(/^Step 2 \//);

    await user.click(reset);
    expect(scene).toHaveAttribute('data-preset', 'iso');
    expect(scene).toHaveAttribute('data-hold', 'false');
    expect(scene).toHaveAttribute('data-command', 'reset');

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText(/^Step 3 \//)).toBeInTheDocument();
  });

  it('falls back to 2D when WebGL is unavailable', async () => {
    webgl.available = false;
    window.localStorage.setItem('code-executives.stack-heap-story.view', '3d');
    render(<StackHeapStory />);

    expect(screen.getByRole('radio', { name: /3d/i })).toBeDisabled();
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
  });
});
