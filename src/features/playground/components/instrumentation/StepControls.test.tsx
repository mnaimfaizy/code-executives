import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StepControls from './StepControls';
import { traceSync, type Step } from '../../tracer';
import type { PlaybackSpeed } from '../../hooks/useTrace';

function makeStep(overrides: Partial<Step> = {}): Step {
  return {
    snapshot: { frames: [{ id: 'global', name: 'global', slots: [] }], objects: [] },
    line: 1,
    focus: [],
    kind: 'statement',
    consoleLength: 0,
    truncated: false,
    ...overrides,
  };
}

describe('StepControls', () => {
  const defaultProps = {
    index: 0,
    stepCount: 5,
    step: makeStep(),
    isPlaying: false,
    speed: 1 as PlaybackSpeed,
    onGoToStep: vi.fn(),
    onNextStep: vi.fn(),
    onPrevStep: vi.fn(),
    onFirstStep: vi.fn(),
    onLastStep: vi.fn(),
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onSetSpeed: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('says there are no steps yet when the trace is empty', () => {
    render(<StepControls {...defaultProps} stepCount={0} step={null} />);
    expect(screen.getByText('No steps yet')).toBeInTheDocument();
  });

  it('leaves out the top frame and call stack when compact, and keeps the controls', () => {
    render(<StepControls {...defaultProps} compact />);
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    expect(screen.queryByText(/call stack/i)).not.toBeInTheDocument();
  });

  it('displays step counter', () => {
    render(<StepControls {...defaultProps} index={2} stepCount={10} />);
    expect(screen.getByText('Step 3 of 10')).toBeInTheDocument();
  });

  it('displays current line number', () => {
    render(<StepControls {...defaultProps} step={makeStep({ line: 42 })} />);
    expect(screen.getByText('Line 42')).toBeInTheDocument();
  });

  it('calls onPlay when play button is clicked', async () => {
    const user = userEvent.setup();
    render(<StepControls {...defaultProps} isPlaying={false} />);
    await user.click(screen.getByLabelText('Play'));
    expect(defaultProps.onPlay).toHaveBeenCalledTimes(1);
  });

  it('calls onPause when pause button is clicked', async () => {
    const user = userEvent.setup();
    render(<StepControls {...defaultProps} isPlaying={true} />);
    await user.click(screen.getByLabelText('Pause'));
    expect(defaultProps.onPause).toHaveBeenCalledTimes(1);
  });

  it('calls onNextStep when next button is clicked', async () => {
    const user = userEvent.setup();
    render(<StepControls {...defaultProps} index={0} />);
    await user.click(screen.getByLabelText('Next step'));
    expect(defaultProps.onNextStep).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevStep when previous button is clicked', async () => {
    const user = userEvent.setup();
    render(<StepControls {...defaultProps} index={2} />);
    await user.click(screen.getByLabelText('Previous step'));
    expect(defaultProps.onPrevStep).toHaveBeenCalledTimes(1);
  });

  it('calls onFirstStep when first step button is clicked', async () => {
    const user = userEvent.setup();
    render(<StepControls {...defaultProps} index={3} />);
    await user.click(screen.getByLabelText('First step'));
    expect(defaultProps.onFirstStep).toHaveBeenCalledTimes(1);
  });

  it('calls onLastStep when last step button is clicked', async () => {
    const user = userEvent.setup();
    render(<StepControls {...defaultProps} index={0} />);
    await user.click(screen.getByLabelText('Last step'));
    expect(defaultProps.onLastStep).toHaveBeenCalledTimes(1);
  });

  it('disables previous and first step buttons at step 0', () => {
    render(<StepControls {...defaultProps} index={0} />);
    expect(screen.getByLabelText('Previous step')).toBeDisabled();
    expect(screen.getByLabelText('First step')).toBeDisabled();
  });

  it('disables next and last step buttons at the last step', () => {
    render(<StepControls {...defaultProps} index={4} stepCount={5} />);
    expect(screen.getByLabelText('Next step')).toBeDisabled();
    expect(screen.getByLabelText('Last step')).toBeDisabled();
  });

  it('calls onSetSpeed when speed is changed', async () => {
    const user = userEvent.setup();
    render(<StepControls {...defaultProps} />);
    await user.selectOptions(screen.getByLabelText('Playback speed'), '2');
    expect(defaultProps.onSetSpeed).toHaveBeenCalledWith(2);
  });

  it('renders the step slider', () => {
    render(<StepControls {...defaultProps} />);
    const slider = screen.getByRole('slider', { name: /^Step \d+ of \d+$/ });
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '4');
  });

  it('has a region landmark for accessibility', () => {
    render(<StepControls {...defaultProps} />);
    expect(screen.getByRole('region', { name: 'Steps' })).toBeInTheDocument();
  });

  it('says so when the top frame has no slots', () => {
    render(<StepControls {...defaultProps} />);
    expect(screen.getByText('No slots in this frame')).toBeInTheDocument();
  });

  it('shows the slots of the top frame only, and every frame of the call stack', () => {
    const step = makeStep({
      snapshot: {
        frames: [
          { id: 'f0', name: 'global', slots: [{ name: 'total', value: '0' }] },
          { id: 'f1', name: 'add(1, 2)', slots: [{ name: 'a', value: '1' }] },
        ],
        objects: [],
      },
    });
    render(<StepControls {...defaultProps} step={step} />);

    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.queryByText('total')).not.toBeInTheDocument();
    expect(screen.getByText('global')).toBeInTheDocument();
    // Once as the top frame's name, once in the call stack
    expect(screen.getAllByText('add(1, 2)')).toHaveLength(2);
  });

  it('shows a reference as an arrow to the label of the object it points at', () => {
    const step = makeStep({
      snapshot: {
        frames: [{ id: 'f0', name: 'global', slots: [{ name: 'list', refId: 'o1' }] }],
        objects: [{ id: 'o1', label: 'Array', kind: 'array', slots: [], state: 'live' }],
      },
    });
    render(<StepControls {...defaultProps} step={step} />);
    expect(screen.getByText('→ Array')).toBeInTheDocument();
  });

  it('highlights the slots in the focus of the step, and no others', () => {
    const step = makeStep({
      snapshot: {
        frames: [
          {
            id: 'f0',
            name: 'global',
            slots: [
              { name: 'kept', value: '1' },
              { name: 'changed', value: '2' },
            ],
          },
        ],
        objects: [],
      },
      focus: ['f0.changed'],
    });
    render(<StepControls {...defaultProps} step={step} />);

    expect(screen.getByText('changed').parentElement).toHaveAttribute('data-changed', 'true');
    expect(screen.getByText('kept').parentElement).not.toHaveAttribute('data-changed');
  });

  it('draws a step of a real trace: two slots that reference one array', () => {
    const { steps } = traceSync('const a = [1];\nconst b = a;\nb.push(2);');
    const last = steps[steps.length - 1];
    render(<StepControls {...defaultProps} index={steps.length - 1} step={last} />);

    const arrows = screen.getAllByText(/^→ /);
    expect(arrows).toHaveLength(2);
    expect(arrows[0].textContent).toBe(arrows[1].textContent);
  });
});
