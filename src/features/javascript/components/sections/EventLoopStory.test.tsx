import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EventLoop3DProps } from '../visualizations/3d/EventLoop3D';

const webgl = vi.hoisted(() => ({ available: true }));
const motion = vi.hoisted(() => ({ reduced: false }));

vi.mock('../../../../shared/utils/webgl', () => ({ canUseWebGL: () => webgl.available }));
vi.mock('../../../../shared/hooks/useReducedMotion', () => ({
  useReducedMotion: () => motion.reduced,
  default: () => motion.reduced,
}));
vi.mock('../visualizations/3d/EventLoop3D', () => ({
  default: ({ beat, camera, instant }: EventLoop3DProps) => (
    <div
      data-testid="scene-3d"
      data-shot={beat.shot}
      data-preset={camera.preset}
      data-instant={String(Boolean(instant))}
    >
      {beat.id}
    </div>
  ),
}));

import EventLoopStory from './EventLoopStory';
import { STORY_BEATS, STORY_OUTPUT } from '../../utils/eventLoopStory';
import { labelPx } from '../../../../shared/components/viz/storyLayout';

const next = () => screen.getByRole('button', { name: 'Next beat' });
const stepTo = async (user: ReturnType<typeof userEvent.setup>, beat: number) => {
  for (let i = 1; i < beat; i++) await user.click(next());
};
const consoleLines = () =>
  within(screen.getByRole('list', { name: 'Console output so far' }))
    .getAllByRole('listitem')
    .map((li) => li.textContent!.replace(' (printed on this beat)', ''));

describe('EventLoopStory', () => {
  beforeEach(() => {
    window.localStorage.clear();
    webgl.available = true;
    motion.reduced = false;
  });

  it('starts on beat 1 and steps forward and back', async () => {
    const user = userEvent.setup();
    render(<EventLoopStory />);

    expect(screen.getByRole('radio', { name: /2d/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Beat 1 / 12')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /The script starts as one task/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous beat' })).toBeDisabled();

    await user.click(next());
    expect(screen.getByText('Beat 2 / 12')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'main() is called' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous beat' }));
    expect(screen.getByText('Beat 1 / 12')).toBeInTheDocument();
  });

  it('says how many beats the story has', () => {
    render(<EventLoopStory />);
    expect(screen.getByText(new RegExp(`^A ${STORY_BEATS.length}-beat story\\.`))).toBeVisible();
  });

  it('gives the picture the whole width, above the code, at every page size', () => {
    const { container } = render(<EventLoopStory />);
    const viewer = container.querySelector<HTMLElement>('[data-viz-viewer]')!;
    const code = screen.getByLabelText('Story code');

    expect(viewer.compareDocumentPosition(code) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // The viewer is a direct child of a plain column: nothing ever stands beside it.
    expect(viewer.parentElement!.className).toBe('flex min-w-0 flex-col gap-3');
    // In 2D the box has a 1px border, no fixed height, and padding (8px a side) only from xl.
    expect(viewer.className).toContain('xl:p-2');
    expect(viewer.className).not.toMatch(/(^| )(sm:)?(p|h)-/);

    const [, , width, height] = screen
      .getByRole('img', { name: /The script starts as one task/ })
      .getAttribute('viewBox')!
      .split(' ')
      .map(Number);
    const view = { width, height };

    expect(labelPx(1280, { view, inset: 18 })).toBeGreaterThanOrEqual(10);
    expect(labelPx(1440, { view, inset: 18 })).toBeGreaterThanOrEqual(10);
    // At 1024 the section is 606px wide and the drawing 818 units: the whole width, with no
    // padding, gives 8.86px. 10px needs 684px, more than <main> has (704px) once the page and
    // the section are padded. The picture is not made to scroll for it.
    expect(width).toBe(818);
    expect(labelPx(1024, { view, inset: 2 })).toBeCloseTo(8.86, 2);
  });

  it('steps with the arrow keys and stops at the last beat', async () => {
    const user = userEvent.setup();
    render(<EventLoopStory />);

    screen.getByLabelText(/Event loop story/).focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByText('Beat 3 / 12')).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText('Beat 2 / 12')).toBeInTheDocument();

    await stepTo(user, STORY_BEATS.length - 1);
    expect(screen.getByText('Beat 12 / 12')).toBeInTheDocument();
    expect(next()).toBeDisabled();
  });

  it('highlights the line of the beat in the code', async () => {
    const user = userEvent.setup();
    render(<EventLoopStory />);
    const current = () => screen.getByLabelText('Story code').querySelector('[aria-current]')!;

    expect(current()).toHaveTextContent('main();');
    await stepTo(user, 3);
    expect(current()).toHaveTextContent('setTimeout(onTimeout, 0);');
  });

  it('draws the beat: the regions it is about, and what the stack is running', async () => {
    const user = userEvent.setup();
    const { container } = render(<EventLoopStory />);
    const about = () =>
      [...container.querySelectorAll('[data-viz-emphasis]')].map((r) =>
        r.closest('[data-viz-region]')!.getAttribute('data-viz-region')
      );

    // The overview is about every region, so none stands out.
    expect(about()).toEqual([]);
    await stepTo(user, 4);
    expect(about()).toEqual(['tasks', 'timers']);
    expect(container.querySelector('[data-viz-entry="onTimeout"]')).toHaveAttribute(
      'data-viz-in',
      'tasks'
    );

    await stepTo(user, 5); // four more beats: beat 8
    expect(screen.getByText('Beat 8 / 12')).toBeInTheDocument();
    expect(about()).toEqual(['stack', 'microtasks']);
    const tag = container.querySelector('[data-viz-running="onResolved"]')!;
    expect(tag.closest('[data-viz-entity="frame"]')).toHaveTextContent('onResolved()');
    expect(tag).toHaveTextContent('MICROTASK');
  });

  it('shows what the Console holds so far, and what the beat printed', async () => {
    const user = userEvent.setup();
    render(<EventLoopStory />);

    expect(screen.getByText('Nothing printed yet.')).toBeInTheDocument();

    await stepTo(user, 7);
    expect(consoleLines()).toEqual(['before await', 'script end']);
    const fresh = screen.getByRole('list', { name: 'Console output so far' });
    expect(fresh.querySelectorAll('[data-fresh]')).toHaveLength(1);
    expect(fresh.querySelector('[data-fresh]')).toHaveTextContent('script end');

    await stepTo(user, 6); // five more beats: beat 12
    expect(consoleLines()).toEqual([...STORY_OUTPUT]);
  });

  it('asks for a prediction on beat 7 and answers it on beat 8', async () => {
    const user = userEvent.setup();
    render(<EventLoopStory />);

    expect(screen.queryByRole('group', { name: /Predict/ })).not.toBeInTheDocument();
    await stepTo(user, 7);

    const prompt = screen.getByRole('group', { name: 'Predict: which callback runs next?' });
    const options = within(prompt).getAllByRole('button');
    expect(options.map((b) => b.textContent)).toEqual([
      'onResolvedmicrotask queue',
      'mainmicrotask queue',
      'onTimeouttask queue',
    ]);
    // Predicting is an invitation: the story goes on without it.
    expect(next()).toBeEnabled();

    await user.click(within(prompt).getByRole('button', { name: /onTimeout/ }));
    expect(within(prompt).getByRole('button', { name: /onTimeout/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(within(prompt).getByRole('status')).toHaveTextContent('You picked onTimeout.');

    await user.click(next());
    expect(screen.queryByRole('group', { name: /Predict/ })).not.toBeInTheDocument();
    expect(screen.getByTestId('prediction-result')).toHaveTextContent(
      'You predicted onTimeout. onResolved ran: it was first in the microtask queue.'
    );

    // Stepping back keeps the pick; a right one is confirmed.
    await user.click(screen.getByRole('button', { name: 'Previous beat' }));
    await user.click(screen.getByRole('button', { name: /onResolved/ }));
    await user.click(next());
    expect(screen.getByTestId('prediction-result')).toHaveTextContent(
      'You predicted onResolved, and that is what ran.'
    );
  });

  it('says nothing about a prediction that was not made, and forgets it on restart', async () => {
    const user = userEvent.setup();
    render(<EventLoopStory />);

    await stepTo(user, 8);
    expect(screen.queryByTestId('prediction-result')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous beat' }));
    await user.click(screen.getByRole('button', { name: /main/ }));
    await user.click(screen.getByRole('button', { name: 'Restart' }));
    expect(screen.getByText('Beat 1 / 12')).toBeInTheDocument();

    await stepTo(user, 7);
    for (const option of within(screen.getByRole('group', { name: /Predict/ })).getAllByRole(
      'button'
    )) {
      expect(option).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('opens its own program in the Playground, with its lens, in a new tab', () => {
    render(<EventLoopStory />);
    const link = screen.getByRole('link', { name: /Try it in the Playground/ });
    expect(link).toHaveAttribute('href', '/playground?example=event-loop-story&lens=stack-queues');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.closest('p')).toHaveTextContent(/opens there with the Stack & Queues lens chosen/);
    expect(link.closest('p')).not.toHaveTextContent(/paste/);
  });

  it('keeps the beat, the Console and the prediction when switching to 3D and back', async () => {
    const user = userEvent.setup();
    const { container } = render(<EventLoopStory />);

    await stepTo(user, 7);
    await user.click(screen.getByRole('button', { name: /onTimeout/ }));
    await user.click(next());
    await user.click(screen.getByRole('radio', { name: /3d/i }));

    const scene = await screen.findByTestId('scene-3d');
    expect(scene).toHaveTextContent('microtask-before-task');
    // The 3D view frames the beat's shot.
    expect(scene).toHaveAttribute('data-shot', 'stack-microtasks');
    expect(container.querySelector('[data-viz-viewer]')).toHaveAttribute('data-view', '3d');
    expect(screen.getByText('Beat 8 / 12')).toBeInTheDocument();
    expect(consoleLines()).toEqual(['before await', 'script end', 'promise']);
    expect(screen.getByTestId('prediction-result')).toHaveTextContent('You predicted onTimeout.');

    await user.click(next());
    expect(scene).toHaveTextContent('microtask-queues-microtask');

    await user.click(screen.getByRole('radio', { name: /2d/i }));
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    expect(screen.getByText('Beat 9 / 12')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /A microtask queues another microtask/ })
    ).toBeInTheDocument();
  });

  it('puts the camera controls in the 3D viewer and cuts instantly under reduced motion', async () => {
    motion.reduced = true;
    const user = userEvent.setup();
    const { container } = render(<EventLoopStory />);
    const viewerEl = container.querySelector<HTMLElement>('[data-viz-viewer]')!;

    expect(within(viewerEl).queryByRole('toolbar')).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /3d/i }));
    const scene = await screen.findByTestId('scene-3d');
    expect(scene).toHaveAttribute('data-instant', 'true');

    await user.click(within(viewerEl).getByRole('radio', { name: 'Front view' }));
    expect(scene).toHaveAttribute('data-preset', 'front');
    await user.click(within(viewerEl).getByRole('button', { name: 'Reset view' }));
    expect(scene).toHaveAttribute('data-preset', 'iso');
    expect(screen.getByText('Beat 1 / 12')).toBeInTheDocument();
  });

  it('falls back to 2D when WebGL is unavailable', () => {
    webgl.available = false;
    window.localStorage.setItem('code-executives.event-loop-story.view', '3d');
    const { container } = render(<EventLoopStory />);

    expect(screen.getByRole('radio', { name: /3d/i })).toBeDisabled();
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    expect(container.querySelector('[data-viz-viewer]')).toHaveAttribute('data-view', '2d');
    expect(screen.getByRole('img', { name: /Event loop:/ })).toBeInTheDocument();
  });
});
