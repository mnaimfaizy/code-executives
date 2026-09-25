import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BranchPointersStory from './BranchPointersStory';
import { STORY_STEPS } from '../../utils/branchPointersStory';

const total = STORY_STEPS.length;

describe('BranchPointersStory', () => {
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

  it('keeps the current step when the view toggle is used mid-story', async () => {
    const user = userEvent.setup();
    render(<BranchPointersStory />);

    for (let i = 0; i < 6; i++) await user.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByText(`Step 7 / ${total}`)).toBeInTheDocument();

    const threeD = screen.getByRole('radio', { name: /3d/i });
    expect(threeD).toBeDisabled();
    expect(threeD).toHaveAttribute('title', '3D coming soon');
    await user.click(threeD);
    expect(screen.getByText(`Step 7 / ${total}`)).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /2d/i }));
    expect(screen.getByText(`Step 7 / ${total}`)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /A merge commit has two parents/ })).toBeInTheDocument();
  });
});
