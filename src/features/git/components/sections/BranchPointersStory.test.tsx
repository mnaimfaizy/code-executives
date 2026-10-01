import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { BranchPointers3DProps } from '../visualizations/3d/BranchPointers3D';
import { STORY_STEPS } from '../../utils/branchPointersStory';

const webgl = vi.hoisted(() => ({ available: true }));
const motion = vi.hoisted(() => ({ reduced: false }));

vi.mock('../../../../shared/utils/webgl', () => ({ canUseWebGL: () => webgl.available }));
vi.mock('../../../../shared/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../../shared/hooks')>()),
  useReducedMotion: () => motion.reduced,
}));
vi.mock('../visualizations/3d/BranchPointers3D', () => ({
  default: ({ step, instant, camera }: BranchPointers3DProps) => (
    <div
      data-testid="scene-3d"
      data-instant={String(Boolean(instant))}
      data-preset={camera.preset}
      data-hold={String(camera.hold)}
      data-command={camera.command?.kind ?? ''}
    >
      {step.id}
    </div>
  ),
}));

import BranchPointersStory from './BranchPointersStory';

const total = STORY_STEPS.length;
const VIEW_KEY = 'code-executives.branch-pointers-story.view';

describe('BranchPointersStory', () => {
  beforeEach(() => {
    window.localStorage.clear();
    webgl.available = true;
    motion.reduced = false;
  });

  it('starts in 2D on step 1 and steps forward and back', async () => {
    const user = userEvent.setup();
    render(<BranchPointersStory />);

    expect(screen.getByRole('radio', { name: /2d/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(`Step 1 / ${total}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByText(`Step 2 / ${total}`)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /A branch is just a label/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous step' }));
    expect(screen.getByText(`Step 1 / ${total}`)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /A commit points to its parent/ })).toBeInTheDocument();
  });

  it('steps with the arrow keys and reaches the last beat', async () => {
    const user = userEvent.setup();
    render(<BranchPointersStory />);

    screen.getByLabelText(/Branch pointers story/).focus();
    for (let i = 0; i < total + 2; i++) await user.keyboard('{ArrowRight}');
    expect(screen.getByText(`Step ${total} / ${total}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next step' })).toBeDisabled();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText(`Step ${total - 1} / ${total}`)).toBeInTheDocument();
  });

  it('shows the literal HEAD file: a branch name, then a commit id when detached', async () => {
    const user = userEvent.setup();
    const { container } = render(<BranchPointersStory />);
    const headCard = () => container.querySelector('[data-ref="HEAD"]')!;

    expect(headCard()).toHaveTextContent('ref: refs/heads/main');
    const detached = STORY_STEPS.findIndex((s) => s.id === 'detached-head');
    for (let i = 0; i < detached; i++)
      await user.click(screen.getByRole('button', { name: 'Next step' }));
    expect(headCard()).toHaveTextContent('b2c4');
    expect(headCard()).toHaveTextContent('DETACHED');
    expect(headCard()).not.toHaveTextContent('ref: refs/heads');
  });

  it('keeps the current step when switching to 3D and back', async () => {
    const user = userEvent.setup();
    render(<BranchPointersStory />);

    for (let i = 0; i < 6; i++) await user.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByText(`Step 7 / ${total}`)).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /3d/i }));
    expect(await screen.findByTestId('scene-3d')).toHaveTextContent('merge-two-parents');
    expect(screen.getByText(`Step 7 / ${total}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset view' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByTestId('scene-3d')).toHaveTextContent('detached-head');

    await user.click(screen.getByRole('radio', { name: /2d/i }));
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset view' })).not.toBeInTheDocument();
    expect(screen.getByText(`Step 8 / ${total}`)).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /HEAD points straight at a commit/ })
    ).toBeInTheDocument();
  });

  it('drives the 3D camera from the viewer toolbar and keys without losing the step', async () => {
    const user = userEvent.setup();
    const { container } = render(<BranchPointersStory />);

    await user.click(screen.getByRole('button', { name: 'Next step' }));
    await user.click(screen.getByRole('radio', { name: /3d/i }));
    const scene = await screen.findByTestId('scene-3d');
    const stepText = screen.getByText(/^Step 2 \//);

    // Reset view lives in the viewer's toolbar now, not in the step controls.
    const viewerEl = container.querySelector<HTMLElement>('[data-viz-viewer]')!;
    const reset = within(viewerEl).getByRole('button', { name: 'Reset view' });

    await user.click(screen.getByRole('radio', { name: 'Front view' }));
    expect(scene).toHaveAttribute('data-preset', 'front');

    screen.getByLabelText(/Branch pointers story/).focus();
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

  it('falls back to 2D when WebGL is unavailable', () => {
    webgl.available = false;
    window.localStorage.setItem(VIEW_KEY, '3d');
    render(<BranchPointersStory />);

    const threeD = screen.getByRole('radio', { name: /3d/i });
    expect(threeD).toBeDisabled();
    expect(threeD).toHaveAttribute('title', expect.stringMatching(/WebGL/));
    expect(screen.getByRole('radio', { name: /2d/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /A commit points to its parent/ })).toBeInTheDocument();
  });

  it('asks the 3D view for instant cuts when reduced motion is on', async () => {
    motion.reduced = true;
    window.localStorage.setItem(VIEW_KEY, '3d');
    render(<BranchPointersStory />);

    expect(await screen.findByTestId('scene-3d')).toHaveAttribute('data-instant', 'true');
  });
});
