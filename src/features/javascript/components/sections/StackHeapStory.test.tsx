import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { StackHeap3DProps } from '../visualizations/3d/StackHeap3D';

const webgl = vi.hoisted(() => ({ available: true }));

vi.mock('../../../../shared/utils/webgl', () => ({ canUseWebGL: () => webgl.available }));
vi.mock('../visualizations/3d/StackHeap3D', () => ({
  default: ({ step }: StackHeap3DProps) => <div data-testid="scene-3d">{step.id}</div>,
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

  it('falls back to 2D when WebGL is unavailable', async () => {
    webgl.available = false;
    window.localStorage.setItem('code-executives.stack-heap-story.view', '3d');
    render(<StackHeapStory />);

    expect(screen.getByRole('radio', { name: /3d/i })).toBeDisabled();
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
  });
});
