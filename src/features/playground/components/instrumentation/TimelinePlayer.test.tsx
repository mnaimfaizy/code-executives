import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimelinePlayer from './TimelinePlayer';
import type { StateSnapshot } from '../../types';
import type { PlaybackSpeed } from '../../hooks/useTimeline';

function makeSnapshot(overrides: Partial<StateSnapshot> = {}): StateSnapshot {
  return {
    step: 0,
    line: 1,
    timestamp: Date.now(),
    callStack: [],
    variables: [],
    heapObjects: [],
    microtaskQueue: [],
    macrotaskQueue: [],
    consoleOutput: [],
    ...overrides,
  };
}

describe('TimelinePlayer', () => {
  const defaultProps = {
    currentStep: 0,
    totalSteps: 5,
    currentSnapshot: makeSnapshot({ step: 0, line: 1 }),
    previousSnapshot: null,
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

  it('renders "No timeline data" when totalSteps is 0', () => {
    render(<TimelinePlayer {...defaultProps} totalSteps={0} />);
    expect(screen.getByText('No timeline data')).toBeInTheDocument();
  });

  it('displays step counter', () => {
    render(<TimelinePlayer {...defaultProps} currentStep={2} totalSteps={10} />);
    expect(screen.getByText('Step 3 / 10')).toBeInTheDocument();
  });

  it('displays current line number', () => {
    render(<TimelinePlayer {...defaultProps} currentSnapshot={makeSnapshot({ line: 42 })} />);
    expect(screen.getByText('Line 42')).toBeInTheDocument();
  });

  it('calls onPlay when play button is clicked', async () => {
    const user = userEvent.setup();
    render(<TimelinePlayer {...defaultProps} isPlaying={false} />);
    const playBtn = screen.getByLabelText('Play');
    await user.click(playBtn);
    expect(defaultProps.onPlay).toHaveBeenCalledTimes(1);
  });

  it('calls onPause when pause button is clicked', async () => {
    const user = userEvent.setup();
    render(<TimelinePlayer {...defaultProps} isPlaying={true} />);
    const pauseBtn = screen.getByLabelText('Pause');
    await user.click(pauseBtn);
    expect(defaultProps.onPause).toHaveBeenCalledTimes(1);
  });

  it('calls onNextStep when next button is clicked', async () => {
    const user = userEvent.setup();
    render(<TimelinePlayer {...defaultProps} currentStep={0} />);
    const nextBtn = screen.getByLabelText('Next step');
    await user.click(nextBtn);
    expect(defaultProps.onNextStep).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevStep when previous button is clicked', async () => {
    const user = userEvent.setup();
    render(<TimelinePlayer {...defaultProps} currentStep={2} />);
    const prevBtn = screen.getByLabelText('Previous step');
    await user.click(prevBtn);
    expect(defaultProps.onPrevStep).toHaveBeenCalledTimes(1);
  });

  it('calls onFirstStep when first step button is clicked', async () => {
    const user = userEvent.setup();
    render(<TimelinePlayer {...defaultProps} currentStep={3} />);
    const firstBtn = screen.getByLabelText('First step');
    await user.click(firstBtn);
    expect(defaultProps.onFirstStep).toHaveBeenCalledTimes(1);
  });

  it('calls onLastStep when last step button is clicked', async () => {
    const user = userEvent.setup();
    render(<TimelinePlayer {...defaultProps} currentStep={0} />);
    const lastBtn = screen.getByLabelText('Last step');
    await user.click(lastBtn);
    expect(defaultProps.onLastStep).toHaveBeenCalledTimes(1);
  });

  it('disables previous and first step buttons at step 0', () => {
    render(<TimelinePlayer {...defaultProps} currentStep={0} />);
    expect(screen.getByLabelText('Previous step')).toBeDisabled();
    expect(screen.getByLabelText('First step')).toBeDisabled();
  });

  it('disables next and last step buttons at the last step', () => {
    render(<TimelinePlayer {...defaultProps} currentStep={4} totalSteps={5} />);
    expect(screen.getByLabelText('Next step')).toBeDisabled();
    expect(screen.getByLabelText('Last step')).toBeDisabled();
  });

  it('renders the speed selector', () => {
    render(<TimelinePlayer {...defaultProps} />);
    const speedSelect = screen.getByLabelText('Playback speed');
    expect(speedSelect).toBeInTheDocument();
  });

  it('calls onSetSpeed when speed is changed', async () => {
    const user = userEvent.setup();
    render(<TimelinePlayer {...defaultProps} />);
    const speedSelect = screen.getByLabelText('Playback speed');
    await user.selectOptions(speedSelect, '2');
    expect(defaultProps.onSetSpeed).toHaveBeenCalledWith(2);
  });

  it('shows "No variables in scope" when variables are empty', () => {
    render(<TimelinePlayer {...defaultProps} />);
    expect(screen.getByText('No variables in scope')).toBeInTheDocument();
  });

  it('displays variables when present in snapshot', () => {
    const snapshot = makeSnapshot({
      variables: [
        { name: 'x', value: 42, type: 'number' },
        { name: 'y', value: 'hello', type: 'string' },
      ],
    });
    render(<TimelinePlayer {...defaultProps} currentSnapshot={snapshot} />);
    expect(screen.getByText('x')).toBeInTheDocument();
    expect(screen.getByText('y')).toBeInTheDocument();
  });

  it('renders the timeline slider', () => {
    render(<TimelinePlayer {...defaultProps} />);
    const slider = screen.getByLabelText(/Timeline step/);
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '4');
  });

  it('has a region landmark for accessibility', () => {
    render(<TimelinePlayer {...defaultProps} />);
    expect(screen.getByRole('region', { name: 'Timeline player' })).toBeInTheDocument();
  });
});
