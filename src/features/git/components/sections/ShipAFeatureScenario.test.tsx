import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShipAFeatureScenario from './ShipAFeatureScenario';
import { routeFor } from '../../utils/shipAFeatureScenario';

type User = ReturnType<typeof userEvent.setup>;

const MAIN = routeFor([]);
const CHOICE_BEAT = MAIN.length; // 1-based beat number of the choice point
const next = (user: User) => user.click(screen.getByRole('button', { name: 'Next step' }));
const prev = (user: User) => user.click(screen.getByRole('button', { name: 'Previous step' }));
const choice = (id: string) =>
  document.querySelector<HTMLButtonElement>(`[data-viz-choice="${id}"]`);
const strip = () => screen.getByTestId('route-strip').querySelectorAll('button');
const scene = (title: string) => screen.getByRole('img', { name: `Shipping a feature: ${title}` });

async function toChoice(user: User) {
  for (let i = 1; i < CHOICE_BEAT; i++) await next(user);
}

async function toEnd(user: User) {
  while (!screen.getByRole('button', { name: 'Next step' }).hasAttribute('disabled'))
    await next(user);
}

describe('ShipAFeatureScenario', () => {
  it('starts on beat 1 in 2D and stops at the choice point with Next disabled', async () => {
    const user = userEvent.setup();
    render(<ShipAFeatureScenario />);

    expect(screen.getByRole('radio', { name: /2d/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Beat 1')).toBeInTheDocument();
    expect(scene('Branch off main')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled();
    expect(choice('rebase')).toBeNull();

    await toChoice(user);
    expect(screen.getByText(`Beat ${CHOICE_BEAT}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next step' })).toBeDisabled();
    expect(
      screen.getByText("How do you bring Sam's work into feature/search?")
    ).toBeInTheDocument();
    expect(choice('rebase')).toBeInTheDocument();
    expect(choice('merge')).toBeInTheDocument();
    expect(strip()).toHaveLength(CHOICE_BEAT);
  });

  it('builds the transcript from every beat so far, the current one marked', async () => {
    const user = userEvent.setup();
    render(<ShipAFeatureScenario />);
    const transcript = screen.getByRole('list', { name: 'Transcript' });

    for (let i = 0; i < 3; i++) await next(user);
    const entries = within(transcript).getAllByRole('listitem');
    expect(entries).toHaveLength(4);
    expect(entries[0]).toHaveTextContent('git switch -c feature/search');
    expect(entries[3]).toHaveTextContent('Merged pull request #6 on GitHub');
    expect(entries[3]).toHaveAttribute('aria-current', 'step');
    const cast = screen.getByLabelText('Cast');
    expect(within(cast).getByText('Sam').closest('[data-cast]')).toHaveAttribute(
      'aria-current',
      'true'
    );
  });

  it('follows the rebase path to its ending and offers the other path', async () => {
    const user = userEvent.setup();
    render(<ShipAFeatureScenario />);
    await toChoice(user);

    await user.click(choice('rebase')!);
    expect(screen.getByText(`Beat ${CHOICE_BEAT + 1}`)).toBeInTheDocument();
    expect(scene('Rebase writes a new commit')).toBeInTheDocument();
    expect(choice('rebase')).toBeNull();
    expect(strip()).toHaveLength(routeFor(['rebase']).length);

    await toEnd(user);
    expect(scene('Pull request #7 merged')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Outcome' })).toHaveTextContent(
      /Rebasing bought a linear branch/
    );

    await user.click(screen.getByRole('button', { name: /Try the other path/ }));
    expect(screen.getByText(`Beat ${CHOICE_BEAT}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next step' })).toBeDisabled();
    expect(strip()).toHaveLength(CHOICE_BEAT);

    await user.click(choice('merge')!);
    expect(scene('Merge origin/main into your branch')).toBeInTheDocument();
  });

  it('follows the merge path to its own outcome', async () => {
    const user = userEvent.setup();
    render(<ShipAFeatureScenario />);
    await toChoice(user);
    await user.click(choice('merge')!);
    await toEnd(user);

    expect(screen.getByText(`Beat ${routeFor(['merge']).length}`)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Outcome' })).toHaveTextContent(
      /Merging preserved the true history/
    );
  });

  it('clears the pick when Previous steps back across the choice', async () => {
    const user = userEvent.setup();
    render(<ShipAFeatureScenario />);
    await toChoice(user);
    await user.click(choice('rebase')!);
    await next(user);

    await prev(user);
    expect(scene('Rebase writes a new commit')).toBeInTheDocument();
    await prev(user);
    expect(screen.getByText(`Beat ${CHOICE_BEAT}`)).toBeInTheDocument();
    expect(choice('rebase')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next step' })).toBeDisabled();
    expect(strip()).toHaveLength(CHOICE_BEAT);
  });

  it('Restart returns to beat 1 and clears every pick', async () => {
    const user = userEvent.setup();
    render(<ShipAFeatureScenario />);
    await toChoice(user);
    await user.click(choice('merge')!);
    await next(user);

    await user.click(screen.getByRole('button', { name: 'Restart' }));
    expect(screen.getByText('Beat 1')).toBeInTheDocument();
    expect(strip()).toHaveLength(CHOICE_BEAT);

    await toChoice(user);
    expect(screen.getByRole('button', { name: 'Next step' })).toBeDisabled();
    expect(choice('merge')).toBeInTheDocument();
  });

  it('keeps the beat across a view toggle; 3D is a disabled placeholder', async () => {
    const user = userEvent.setup();
    render(<ShipAFeatureScenario />);
    for (let i = 0; i < 4; i++) await next(user);
    expect(screen.getByText('Beat 5')).toBeInTheDocument();

    const threeD = screen.getByRole('radio', { name: /3d/i });
    expect(threeD).toBeDisabled();
    expect(threeD).toHaveAttribute('title', expect.stringMatching(/coming soon/i));
    await user.click(threeD);
    await user.click(screen.getByRole('radio', { name: /2d/i }));

    expect(screen.getByText('Beat 5')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /2d/i })).toHaveAttribute('aria-checked', 'true');
    expect(scene('Git says you are up to date')).toBeInTheDocument();
  });

  it('steps with the arrow keys and stops at the choice point', async () => {
    const user = userEvent.setup();
    render(<ShipAFeatureScenario />);
    screen.getByLabelText(/scenario\. Use the left and right arrow keys/).focus();
    for (let i = 0; i < CHOICE_BEAT + 3; i++) await user.keyboard('{ArrowRight}');
    expect(screen.getByText(`Beat ${CHOICE_BEAT}`)).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText(`Beat ${CHOICE_BEAT - 1}`)).toBeInTheDocument();
  });

  it('draws stale tracking links broken, only in overview and bridge shots', async () => {
    const user = userEvent.setup();
    const { container } = render(<ShipAFeatureScenario />);
    const link = (id: string) => container.querySelector(`[data-link="${id}"]`);

    expect(link('link.you.origin/main')).toBeNull(); // shot `you`
    for (let i = 0; i < 3; i++) await next(user); // sam-merges, overview
    expect(link('link.you.origin/main')).toHaveAttribute('data-stale', 'true');
    for (let i = 0; i < 2; i++) await next(user); // fetch, bridge
    expect(link('link.you.origin/main')).toHaveAttribute('data-stale', 'false');
    expect(container.querySelectorAll('[data-crossing]')).toHaveLength(2);
  });
});
