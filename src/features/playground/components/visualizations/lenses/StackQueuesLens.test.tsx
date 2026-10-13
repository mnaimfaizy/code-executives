import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EventLoopView3DProps } from '../../../../../shared/components/viz/eventloop/types';
import type { QueueEntry, Snapshot, StackFrame } from '../../../../../shared/snapshot';
import type { Step } from '../../../tracer';
import { VIEWER_3D_MIN_WIDTH } from '../lensViewer';
import { APPROXIMATE_NOTE, MAX_DRAWN_ENTRIES, MODEL_NOTE } from './stackQueuesLensModel';

const webgl = vi.hoisted(() => ({ available: true }));
const scene = vi.hoisted(() => ({ fails: false }));
vi.mock('../../../../../shared/utils/webgl', () => ({ canUseWebGL: () => webgl.available }));
// The lens loads its 3D view with React.lazy; three.js stays out of this test.
vi.mock('../../../../../shared/viz3d/eventloop/EventLoopView3D', () => ({
  default: (props: EventLoopView3DProps) => {
    if (scene.fails) throw new Error('WebGL context lost');
    return (
      <div
        data-testid="scene-3d"
        data-theme={props.theme}
        data-extent={JSON.stringify(props.extent)}
        data-more={JSON.stringify(props.more)}
        data-running={props.running?.entry.id ?? 'none'}
        data-preset={props.camera.preset}
        data-instant={String(props.instant)}
        aria-label={props.label}
      />
    );
  },
}));

import StackQueuesLens from './StackQueuesLens';

const entry = (id: string, source: QueueEntry['source'] = 'promise', delay?: number): QueueEntry =>
  delay === undefined ? { id, label: `${id} callback`, source } : { id, label: id, source, delay };

const frame = (id: string): StackFrame => ({ id, name: `${id}()`, slots: [] });

const step = (
  frames: StackFrame[],
  queues: Pick<Snapshot, 'microtasks' | 'tasks' | 'timers'> | null,
  focus: string[] = []
): Step => ({
  snapshot: { frames, objects: [], ...(queues ?? {}) },
  line: 1,
  focus,
  kind: 'statement' as Step['kind'],
  consoleLength: 0,
  truncated: false,
});

const q = (microtasks: QueueEntry[] = [], tasks: QueueEntry[] = [], timers: QueueEntry[] = []) => ({
  microtasks,
  tasks,
  timers,
});

const G = frame('global');
const T1 = entry('t1', 'timeout', 0);
const M1 = entry('m1');

const DEMO: Step[] = [
  step([G], q()),
  step([G], q([], [], [T1]), ['t1']),
  step([G], q([M1], [], [T1]), ['m1']),
  step([G], q([M1], [T1], [])),
  step([], q([M1], [T1], [])),
  step([frame('c1')], q([], [T1], []), ['c1']),
  step([], q([], [T1], [])),
  step([frame('c2')], q()),
];

const NO_QUEUES: Step[] = [step([G], null), step([G, frame('main')], null)];

const drawing = () => screen.getByRole('img');
const notes = () => screen.getByTestId('stack-queues-lens-notes');
const card = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-viz-entry="${id}"]`);

describe('StackQueuesLens', () => {
  beforeEach(() => {
    window.localStorage.clear();
    webgl.available = true;
    scene.fails = false;
  });

  it('asks for a traced run when there are no steps', () => {
    render(<StackQueuesLens steps={[]} index={0} />);
    expect(screen.getByText(/Run your code with Trace on/)).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stack-queues-lens-model')).not.toBeInTheDocument();
  });

  it('draws the step in 2D, dark, with a description in words', () => {
    const { container } = render(<StackQueuesLens steps={DEMO} index={2} />);
    expect(drawing()).toHaveAccessibleName(
      'Stack and queues. Step 3 of 8, line 1. Call stack: 1 frame, global() on top. Microtask queue: 1, next first: m1 callback. Task queue: empty. Timers: 1, soonest first: t1. Changed: m1 callback in microtask queue.'
    );
    expect(container.querySelector('[data-viz-viewer]')).toHaveStyle({ background: '#0a0a1a' });
    expect(container.querySelector('[data-viz-viewer]')).toHaveAttribute('data-view', '2d');
    expect(card(container, 'm1')).toHaveAttribute('data-viz-in', 'microtasks');
    expect(card(container, 't1')).toHaveAttribute('data-viz-in', 'timers');
    expect(container.querySelectorAll('[data-viz-entity="frame"]')).toHaveLength(1);
    expect(notes()).toHaveTextContent('');
  });

  it('opens in 2D, with the switch to 3D and no viewer toolbar', () => {
    render(<StackQueuesLens steps={DEMO} index={2} />);
    expect(screen.getByRole('radio', { name: /2d/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /3d/i })).toBeEnabled();
    expect(screen.queryByRole('toolbar', { name: 'Viewer controls' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
  });

  it('always says the queues are a model, quietly', () => {
    render(<StackQueuesLens steps={DEMO} index={0} />);
    expect(screen.getByTestId('stack-queues-lens-model')).toHaveTextContent(MODEL_NOTE);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('says the picture is approximate when the tracer could not follow the engine', () => {
    render(<StackQueuesLens steps={DEMO} index={0} approximate />);
    expect(screen.getByTestId('stack-queues-lens-model')).toHaveTextContent(APPROXIMATE_NOTE);
    expect(screen.queryByText(MODEL_NOTE)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    // The drawing is still there.
    expect(drawing()).toBeInTheDocument();
  });

  it('keeps an entry the same element as the trace moves it from the timers to the tasks', () => {
    const { container, rerender } = render(<StackQueuesLens steps={DEMO} index={2} />);
    const before = card(container, 't1');
    rerender(<StackQueuesLens steps={DEMO} index={3} />);
    expect(card(container, 't1')).toBe(before);
    expect(before).toHaveAttribute('data-viz-in', 'tasks');
    expect(before).toHaveAttribute('data-viz-head');
  });

  it('tags the frame that runs an entry taken from a queue', () => {
    const { container, rerender } = render(<StackQueuesLens steps={DEMO} index={5} />);
    expect(container.querySelector('[data-viz-running="m1"]')).toHaveTextContent('MICROTASK');
    expect(drawing()).toHaveAccessibleName(/Running the microtask m1 callback\./);
    rerender(<StackQueuesLens steps={DEMO} index={7} />);
    expect(container.querySelector('[data-viz-running="t1"]')).toHaveTextContent('TASK');
    rerender(<StackQueuesLens steps={DEMO} index={6} />);
    expect(container.querySelector('[data-viz-running]')).toBeNull();
  });

  it('keeps the drawing the same size on every step of a run', () => {
    const { container, rerender } = render(<StackQueuesLens steps={DEMO} index={0} />);
    const viewBox = () => container.querySelector('svg')?.getAttribute('viewBox');
    const first = viewBox();
    for (let i = 1; i < DEMO.length; i++) {
      rerender(<StackQueuesLens steps={DEMO} index={i} />);
      expect(viewBox(), `step ${i}`).toBe(first);
    }
  });

  it('caps each region and says how many entries it left out', () => {
    const lots = (n: number, p: string) => Array.from({ length: n }, (_, i) => entry(`${p}${i}`));
    const deep = Array.from({ length: 9 }, (_, i) => frame(`f${i}`));
    const steps = [step(deep, q(lots(8, 'm'), lots(2, 't'), lots(11, 'x')))];
    const { container } = render(<StackQueuesLens steps={steps} index={0} />);
    expect(notes()).toHaveTextContent(
      '5 frames not shown · 2 microtasks not shown · 5 timers not shown'
    );
    expect(container.querySelectorAll('[data-viz-in="microtasks"]')).toHaveLength(
      MAX_DRAWN_ENTRIES
    );
    expect(container.querySelectorAll('[data-viz-in="timers"]')).toHaveLength(MAX_DRAWN_ENTRIES);
    expect(container.querySelector('[data-viz-more="microtasks"]')).toHaveTextContent('+2 more');
    expect(container.querySelector('[data-viz-more="timers"]')).toHaveTextContent('+5 more');
    expect(container.querySelector('[data-viz-more="tasks"]')).toBeNull();
    expect(container.querySelectorAll('[data-viz-entity="frame"]')).toHaveLength(5);
    expect(screen.getByText('… 5 more frames')).toBeInTheDocument();
  });

  it('draws frames only, with one note, for a trace that records no queues', () => {
    const { container } = render(<StackQueuesLens steps={NO_QUEUES} index={1} />);
    expect(notes()).toHaveTextContent('This run did not record the queues');
    expect(container.querySelectorAll('[data-viz-entity="frame"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-viz-region]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-viz-entry]')).toHaveLength(0);
    // No queues are drawn, so there is no model to qualify.
    expect(screen.queryByTestId('stack-queues-lens-model')).not.toBeInTheDocument();
    expect(drawing()).toHaveAccessibleName(/This run did not record the queues\.$/);
  });

  it('names Python when its run is the one without queues', () => {
    render(<StackQueuesLens steps={NO_QUEUES} index={0} heapRecorded={false} approximate />);
    expect(notes()).toHaveTextContent('The queues are not recorded for Python yet');
    expect(screen.queryByTestId('stack-queues-lens-model')).not.toBeInTheDocument();
  });

  it('clamps an index outside the trace', () => {
    render(<StackQueuesLens steps={DEMO} index={999} />);
    expect(drawing()).toHaveAccessibleName(/Step 8 of 8/);
  });

  describe('in 3D', () => {
    it('loads the 3D view on demand, and keeps the step across the switch', async () => {
      const user = userEvent.setup();
      const { container, rerender } = render(<StackQueuesLens steps={DEMO} index={5} />);

      await user.click(screen.getByRole('radio', { name: /3d/i }));
      const view = await screen.findByTestId('scene-3d');
      expect(view).toHaveAccessibleName(/^3D view\. Stack and queues\. Step 6 of 8/);
      expect(view).toHaveAttribute('data-theme', 'dark');
      expect(view).toHaveAttribute('data-running', 'm1');
      expect(view).toHaveAttribute('data-preset', 'iso');
      expect(JSON.parse(view.getAttribute('data-extent')!)).toMatchObject({
        frames: 1,
        microtasks: 1,
        tasks: 1,
        timers: 1,
      });
      expect(container.querySelector('[data-viz-viewer]')).toHaveAttribute('data-view', '3d');
      expect(container.querySelector('[data-viz-viewer]')).toHaveClass('min-w-[760px]');
      expect(screen.getByRole('toolbar', { name: 'Viewer controls' })).toBeInTheDocument();

      rerender(<StackQueuesLens steps={DEMO} index={6} />);
      expect(screen.getByTestId('scene-3d')).toHaveAccessibleName(/Step 7 of 8/);
      expect(screen.getByTestId('scene-3d')).toHaveAttribute('data-running', 'none');

      await user.click(screen.getByRole('radio', { name: /2d/i }));
      expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
      expect(drawing()).toHaveAccessibleName(/Step 7 of 8/);
    });

    it('says which view the learner picked, with the width its 3D viewer asks for', async () => {
      const user = userEvent.setup();
      const onViewChange = vi.fn();
      const { container } = render(
        <StackQueuesLens steps={DEMO} index={5} onViewChange={onViewChange} />
      );
      await user.click(screen.getByRole('radio', { name: /3d/i }));
      await screen.findByTestId('scene-3d');
      expect(onViewChange.mock.calls).toEqual([['3d']]);
      // The Playground widens the pane to this width; the class is the same number
      expect(container.querySelector('[data-viz-viewer]')).toHaveClass(
        `min-w-[${VIEWER_3D_MIN_WIDTH}px]`
      );
      await user.click(screen.getByRole('radio', { name: /2d/i }));
      expect(onViewChange.mock.calls).toEqual([['3d'], ['2d']]);
    });

    it('remembers the choice of 3D, and passes what a step leaves out', async () => {
      window.localStorage.setItem('code-executives.playground.stack-queues.view', '3d');
      const lots = (n: number, p: string) => Array.from({ length: n }, (_, i) => entry(`${p}${i}`));
      render(<StackQueuesLens steps={[step([G], q(lots(8, 'm')))]} index={0} />);
      const view = await screen.findByTestId('scene-3d');
      expect(JSON.parse(view.getAttribute('data-more')!)).toMatchObject({ microtasks: 2 });
      expect(JSON.parse(view.getAttribute('data-extent')!)).toMatchObject({
        microtasks: MAX_DRAWN_ENTRIES,
      });
    });

    it('stays in 2D without WebGL', () => {
      webgl.available = false;
      window.localStorage.setItem('code-executives.playground.stack-queues.view', '3d');
      render(<StackQueuesLens steps={DEMO} index={2} />);
      expect(screen.getByRole('radio', { name: /3d/i })).toBeDisabled();
      expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
      expect(screen.queryByRole('toolbar', { name: 'Viewer controls' })).not.toBeInTheDocument();
      expect(drawing()).toHaveAccessibleName(/Step 3 of 8/);
    });

    it('falls back to 2D when the 3D view throws', async () => {
      const user = userEvent.setup();
      const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      scene.fails = true;
      render(<StackQueuesLens steps={DEMO} index={2} />);
      await user.click(screen.getByRole('radio', { name: /3d/i }));
      expect(await screen.findByText(/3D failed to start/)).toBeInTheDocument();
      expect(drawing()).toHaveAccessibleName(/Step 3 of 8/);
      quiet.mockRestore();
    });

    it('takes another 3D renderer from its host', async () => {
      window.localStorage.setItem('code-executives.playground.stack-queues.view', '3d');
      const Other = (props: EventLoopView3DProps) => (
        <div data-testid="other-3d">{props.label}</div>
      );
      render(<StackQueuesLens steps={DEMO} index={0} view3D={Other} />);
      expect(await screen.findByTestId('other-3d')).toHaveTextContent(/Step 1 of 8/);
    });
  });
});
