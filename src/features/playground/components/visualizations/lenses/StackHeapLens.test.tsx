import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { StackHeapView3DProps } from '../../../../../shared/viz3d/stackheap/StackHeapView3D';
import { STORY_CODE } from '../../../../javascript/utils/stackHeapStory';
import { traceSync, type Step } from '../../../tracer';

const webgl = vi.hoisted(() => ({ available: true }));
const scene = vi.hoisted(() => ({ fails: false }));

vi.mock('../../../../../shared/utils/webgl', () => ({ canUseWebGL: () => webgl.available }));
vi.mock('../../../../../shared/viz3d/stackheap/StackHeapView3D', () => ({
  default: (props: StackHeapView3DProps) => {
    if (scene.fails) throw new Error('WebGL context lost');
    return (
      <div
        data-testid="scene-3d"
        data-theme={props.theme}
        data-shot={props.shot}
        data-grid={`${props.grid?.cols}x${props.grid?.rows}`}
        data-unreachable={String(props.markUnreachable)}
        data-gc={props.gcPhase ?? 'none'}
        data-objects={props.snapshot.objects.length}
        aria-label={props.label}
      />
    );
  },
}));

import StackHeapLens from './StackHeapLens';
import { VIEWER_3D_MIN_WIDTH } from '../lensViewer';

const stepsOf = (code: string): Step[] => traceSync(code).steps;

const STORY = stepsOf(STORY_CODE);
const KEEPING = stepsOf(`const keep = [];
for (let i = 0; i < 15; i++) {
  keep.push({ i });
}`);
/** 25 pushed; a trace records the first 20 slots of the array, so the last step holds 21 objects */
const KEEPING_25 = stepsOf(`const keep = [];
for (let i = 0; i < 25; i++) {
  keep.push({ i });
}`);
const CHURN = stepsOf(`let last = null;
for (let i = 0; i < 30; i++) {
  last = { i };
}`);
const RECURSION = stepsOf(`function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);
}
fact(10);`);

const drawing = () => screen.getByRole('img');

describe('StackHeapLens', () => {
  beforeEach(() => {
    window.localStorage.clear();
    webgl.available = true;
    scene.fails = false;
  });

  it('asks for a traced run when there are no steps', () => {
    render(<StackHeapLens steps={[]} index={0} />);
    expect(screen.getByText(/Run your code with Trace on/)).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('draws the step in 2D by default, dark, with a description in words', () => {
    const at = 3;
    const { container } = render(<StackHeapLens steps={STORY} index={at} />);
    expect(screen.getByRole('radio', { name: /2d/i })).toHaveAttribute('aria-checked', 'true');
    expect(drawing()).toHaveAccessibleName(
      `Stack and heap. Step 4 of ${STORY.length}, line 2. Call stack: 3 frames, makeUser('Ada') on top. Heap: 2 objects. Changed: user in makeUser('Ada'), Object #o3, Array #o4.`
    );
    // The dark palette's surface, and no collector phase: a run cannot observe a sweep.
    // The color is the longhand. jsdom serializes the `background` shorthand with the other layers' initial values.
    expect(container.querySelector('[data-viz-viewer]')).toHaveStyle({ backgroundColor: '#0a0a1a' });
    expect(container.querySelector('svg')?.textContent).not.toMatch(/ROOT|UNMARKED|RECLAIMED/);
  });

  it('marks unreachable objects', () => {
    const { container } = render(<StackHeapLens steps={STORY} index={STORY.length - 1} />);
    expect(container.querySelectorAll('[data-viz-unreachable]')).toHaveLength(4);
  });

  it('keeps the floor the same size on every step of a run', () => {
    const { container, rerender } = render(<StackHeapLens steps={STORY} index={0} />);
    const viewBox = () => container.querySelector('svg')?.getAttribute('viewBox');
    const first = viewBox();
    rerender(<StackHeapLens steps={STORY} index={STORY.length - 1} />);
    expect(viewBox()).toBe(first);
  });

  it('switches to 3D and back without losing the step', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<StackHeapLens steps={STORY} index={5} />);

    await user.click(screen.getByRole('radio', { name: /3d/i }));
    const view3D = await screen.findByTestId('scene-3d');
    expect(view3D).toHaveAccessibleName(/^3D view\. Stack and heap\. Step 6 of /);
    expect(view3D).toHaveAttribute('data-theme', 'dark');
    expect(view3D).toHaveAttribute('data-shot', 'overview');
    expect(view3D).toHaveAttribute('data-grid', '2x2');
    expect(view3D).toHaveAttribute('data-unreachable', 'true');
    expect(view3D).toHaveAttribute('data-gc', 'none');
    expect(screen.getByRole('toolbar', { name: 'Viewer controls' })).toBeInTheDocument();

    rerender(<StackHeapLens steps={STORY} index={6} />);
    expect(screen.getByTestId('scene-3d')).toHaveAccessibleName(/Step 7 of /);

    await user.click(screen.getByRole('radio', { name: /2d/i }));
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    expect(drawing()).toHaveAccessibleName(/Step 7 of /);
  });

  it('stays in 2D without WebGL', () => {
    webgl.available = false;
    window.localStorage.setItem('code-executives.playground.stack-heap.view', '3d');
    render(<StackHeapLens steps={STORY} index={2} />);
    expect(screen.getByRole('radio', { name: /3d/i })).toBeDisabled();
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    expect(drawing()).toHaveAccessibleName(/Step 3 of /);
  });

  it('falls back to 2D when the 3D view throws', async () => {
    const user = userEvent.setup();
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    scene.fails = true;
    render(<StackHeapLens steps={STORY} index={2} />);
    await user.click(screen.getByRole('radio', { name: /3d/i }));
    expect(await screen.findByText(/3D failed to start/)).toBeInTheDocument();
    expect(drawing()).toHaveAccessibleName(/Step 3 of /);
    quiet.mockRestore();
  });

  it('folds a deep stack into a placeholder and says how many frames it left out', () => {
    const deepest = RECURSION.reduce(
      (a, s, i) => (s.snapshot.frames.length > RECURSION[a].snapshot.frames.length ? i : a),
      0
    );
    const { container } = render(<StackHeapLens steps={RECURSION} index={deepest} />);
    expect(screen.getByTestId('stack-heap-lens-notes')).toHaveTextContent('7 frames not shown');
    expect(container.querySelectorAll('[data-viz-entity="frame"]')).toHaveLength(5);
    expect(screen.getByText('… 7 more frames')).toBeInTheDocument();
  });

  it('hides unreachable objects when the heap would not fit, and says so', () => {
    const { container } = render(<StackHeapLens steps={CHURN} index={CHURN.length - 1} />);
    expect(screen.getByTestId('stack-heap-lens-notes')).toHaveTextContent(
      '29 unreachable objects hidden'
    );
    expect(container.querySelectorAll('[data-viz-entity="object"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-viz-unreachable]')).toHaveLength(0);
  });

  it('draws a step of 16 objects in 2D, on a floor of its own', () => {
    const { container } = render(<StackHeapLens steps={KEEPING} index={KEEPING.length - 1} />);
    expect(screen.queryByText('Too large to draw')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-viz-entity="object"]')).toHaveLength(15);
    expect(container.querySelectorAll('[data-viz-entity="array"]')).toHaveLength(1);
    // Four columns (340 + 4 × 230 units): wider than the 3×3 floor both views shared
    expect(drawing().getAttribute('viewBox')).toMatch(/^0 0 1260 /);
    expect(screen.getByTestId('stack-heap-lens-notes')).toHaveTextContent('');
  });

  it('shows a step too large for 3D in 2D with a quiet line, and returns to 3D when it fits', async () => {
    const user = userEvent.setup();
    const fits = KEEPING.findIndex((step) => step.snapshot.objects.length === 9);
    const tooLarge = KEEPING.findIndex((step) => step.snapshot.objects.length === 10);
    const onViewChange = vi.fn();
    const { container, rerender } = render(
      <StackHeapLens steps={KEEPING} index={fits} onViewChange={onViewChange} />
    );
    const viewer = () => container.querySelector('[data-viz-viewer]');
    const notes = () => screen.getByTestId('stack-heap-lens-notes');

    await user.click(screen.getByRole('radio', { name: /3d/i }));
    expect(onViewChange).toHaveBeenCalledWith('3d');
    expect(await screen.findByTestId('scene-3d')).toHaveAttribute('data-objects', '9');
    expect(screen.getByTestId('scene-3d')).toHaveAttribute('data-grid', '3x3');
    expect(viewer()).toHaveAttribute('data-view', '3d');
    expect(viewer()).toHaveClass(`min-w-[${VIEWER_3D_MIN_WIDTH}px]`);
    expect(notes()).toHaveTextContent('');

    // One object more: this step is drawn in 2D, and the lens says why in one line
    rerender(<StackHeapLens steps={KEEPING} index={tooLarge} onViewChange={onViewChange} />);
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    expect(viewer()).toHaveAttribute('data-view', '2d');
    expect(viewer()).not.toHaveClass(`min-w-[${VIEWER_3D_MIN_WIDTH}px]`);
    expect(drawing()).toHaveAccessibleName(
      new RegExp(`^Stack and heap\\. Step ${tooLarge + 1} of`)
    );
    expect(container.querySelectorAll('[data-viz-entity="object"]')).toHaveLength(9);
    expect(notes()).toHaveTextContent('This step is too large for 3D, so it is shown in 2D');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    // The learner's choice is kept: the toggle still says 3D, and so does storage
    expect(screen.getByRole('radio', { name: /3d/i })).toHaveAttribute('aria-checked', 'true');
    expect(window.localStorage.getItem('code-executives.playground.stack-heap.view')).toBe('3d');
    expect(screen.queryByRole('toolbar', { name: 'Viewer controls' })).not.toBeInTheDocument();

    // Back to a step that fits: 3D again, without the line
    rerender(<StackHeapLens steps={KEEPING} index={fits} onViewChange={onViewChange} />);
    expect(await screen.findByTestId('scene-3d')).toHaveAttribute('data-objects', '9');
    expect(notes()).toHaveTextContent('');
    expect(onViewChange).toHaveBeenCalledTimes(1);
  });

  it('says nothing about 3D when 2D was chosen', () => {
    render(<StackHeapLens steps={KEEPING} index={KEEPING.length - 1} />);
    expect(screen.getByTestId('stack-heap-lens-notes')).not.toHaveTextContent(/3D/);
  });

  it('shows a calm message, in either view, when a step is too large to draw', async () => {
    const user = userEvent.setup();
    render(<StackHeapLens steps={KEEPING_25} index={KEEPING_25.length - 1} />);
    expect(screen.getByText('Too large to draw')).toBeInTheDocument();
    expect(
      screen.getByText(
        /This step holds 21 heap objects, 21 of them reachable\. The lens draws up to 20\./
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /3d/i }));
    expect(screen.getByText('Too large to draw')).toBeInTheDocument();
    expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
  });

  it('shows the too-large message when the tracer cut the heap short', () => {
    const cut = STORY.map((step) => ({ ...step, truncated: true }));
    render(<StackHeapLens steps={cut} index={3} />);
    expect(screen.getByText(/more than a trace records/)).toBeInTheDocument();
  });

  it('draws frames only, with a note, when the heap was not recorded', () => {
    const { container } = render(<StackHeapLens steps={STORY} index={3} heapRecorded={false} />);
    expect(screen.getByTestId('stack-heap-lens-notes')).toHaveTextContent(
      'Heap objects are not recorded for Python yet'
    );
    expect(container.querySelectorAll('[data-viz-entity="frame"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-viz-entity="object"]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-viz-ref]')).toHaveLength(0);
    expect(drawing()).toHaveAccessibleName(/Heap objects are not recorded for Python yet\./);
  });

  it('clamps an index outside the trace', () => {
    render(<StackHeapLens steps={STORY} index={999} />);
    expect(drawing()).toHaveAccessibleName(new RegExp(`Step ${STORY.length} of ${STORY.length}`));
  });
});
