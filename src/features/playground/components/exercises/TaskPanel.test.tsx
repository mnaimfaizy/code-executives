import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import TaskPanel from './TaskPanel';
import { exercises, exercisesByLevel } from '../../exercises/exercises';
import type { ChecksRun } from '../../exercises/types';

const twoSum = exercises.find((exercise) => exercise.id === 'two-sum')!;
const groups = exercisesByLevel();

type Props = React.ComponentProps<typeof TaskPanel>;

const baseProps = (): Props => ({
  exercise: twoSum,
  groups,
  passedIds: new Set<string>(),
  onOpenExercise: vi.fn(),
  run: null,
  checking: false,
  stale: false,
  hintsShown: 0,
  onRevealHint: vi.fn(),
  onCheck: vi.fn(),
  onWatch: vi.fn(),
  watchedIndex: null,
  onStartOver: vi.fn(),
  onLeave: vi.fn(),
});

interface Rendered {
  props: Props;
  /** Render again with some props changed */
  update: (overrides: Partial<Props>) => void;
}

function renderPanel(overrides: Partial<Props> = {}): Rendered {
  const props: Props = { ...baseProps(), ...overrides };
  const { rerender } = render(<TaskPanel {...props} />);
  return {
    props,
    update: (next) => rerender(<TaskPanel {...props} {...next} />),
  };
}

const mixedRun: ChecksRun = {
  kind: 'ran',
  passed: false,
  results: [
    { index: 0, hidden: false, status: 'pass', actual: '[0,1]' },
    { index: 1, hidden: false, status: 'fail', actual: 'undefined' },
    { index: 2, hidden: false, status: 'threw', message: 'TypeError: nums.at is not a function' },
    { index: 3, hidden: true, status: 'pass' },
    { index: 4, hidden: true, status: 'fail' },
  ],
};

describe('TaskPanel', () => {
  it('shows the task, with its code in code elements, and the level', () => {
    renderPanel();
    expect(screen.getByRole('heading', { name: 'Two Sum' })).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    const code = screen.getByText('twoSum(nums, target)');
    expect(code.tagName).toBe('CODE');
    expect(screen.getByText(/in any order\./)).toBeInTheDocument();
  });

  it('lists every check before any ran: visible ones with their call and expected value, hidden ones by number only', () => {
    renderPanel();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(twoSum.checks.length);
    expect(within(items[0]).getByText('twoSum([2, 7, 11, 15], 9)')).toBeInTheDocument();
    expect(within(items[0]).getByText('[0, 1]')).toBeInTheDocument();
    expect(within(items[0]).getByText('(in any order)')).toBeInTheDocument();
    expect(within(items[0]).getByText('Not run yet')).toBeInTheDocument();
    expect(within(items[3]).getByText('Hidden check 1')).toBeInTheDocument();
    expect(within(items[4]).getByText('Hidden check 2')).toBeInTheDocument();
    // A hidden check never shows its arguments or its expected value
    expect(items[3].textContent).not.toContain('-8');
    expect(items[3].textContent).not.toContain('[2, 4]');
    expect(within(items[3]).queryByRole('button')).toBeNull();
  });

  it('shows each result in words, with what was returned and why it is wrong', () => {
    renderPanel({ run: mixedRun });
    const items = screen.getAllByRole('listitem').slice(0, twoSum.checks.length);

    expect(within(items[0]).getByText('Passed')).toBeInTheDocument();
    expect(within(items[0]).queryByText('Returned')).toBeNull();
    expect(within(items[0]).queryByText(/^Why:/)).toBeNull();

    expect(within(items[1]).getByText('Failed')).toBeInTheDocument();
    expect(within(items[1]).getByText('Returned')).toBeInTheDocument();
    expect(within(items[1]).getByText('undefined')).toBeInTheDocument();
    expect(within(items[1]).getByText(`Why: ${twoSum.checks[1].explanation}`)).toBeInTheDocument();

    expect(within(items[2]).getByText('Failed')).toBeInTheDocument();
    expect(
      within(items[2]).getByText(/twoSum threw\. TypeError: nums\.at is not a function/)
    ).toBeInTheDocument();

    // Hidden checks: the verdict and nothing else
    expect(items[3].textContent).toBe('Hidden check 1Passed');
    expect(items[4].textContent).toBe('Hidden check 2Failed');
  });

  it('announces the outcome politely', () => {
    renderPanel({ run: mixedRun });
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('2 of 5 checks passed, 3 failed.');
  });

  it('says so when every check passed', () => {
    renderPanel({
      run: {
        kind: 'ran',
        passed: true,
        results: twoSum.checks.map((check, index) => ({
          index,
          hidden: check.hidden === true,
          status: 'pass' as const,
        })),
      },
      passedIds: new Set(['two-sum']),
    });
    expect(screen.getByRole('status')).toHaveTextContent('All 5 checks passed.');
    expect(screen.getByText('Passed before')).toBeInTheDocument();
  });

  it('reports a syntax error with its line, and the other reasons no check ran', () => {
    const { update } = renderPanel({
      run: { kind: 'syntax-error', message: 'Unexpected token', line: 3 },
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'No check ran: the code has a syntax error on line 3. Unexpected token'
    );
    expect(screen.getAllByText('Not run yet').length).toBe(twoSum.checks.length);

    update({ run: { kind: 'untraceable', message: 'This code cannot be traced: x' } });
    expect(screen.getByRole('status')).toHaveTextContent(
      'No check ran. This code cannot be traced: x.'
    );
  });

  it('describes a missing function and an endless loop', () => {
    renderPanel({
      run: {
        kind: 'ran',
        passed: false,
        results: [
          { index: 0, hidden: false, status: 'missing' },
          { index: 1, hidden: false, status: 'step-limit' },
        ],
      },
    });
    expect(screen.getByText(/no function named twoSum was found/)).toBeInTheDocument();
    expect(screen.getByText(/stopped after 2,000 steps/)).toBeInTheDocument();
  });

  it('says which checks did not run after one was stopped', () => {
    renderPanel({
      run: {
        kind: 'ran',
        passed: false,
        results: [
          { index: 0, hidden: false, status: 'pass', actual: '[0,1]' },
          { index: 1, hidden: false, status: 'step-limit' },
          { index: 2, hidden: false, status: 'skipped' },
          { index: 3, hidden: true, status: 'skipped' },
          { index: 4, hidden: true, status: 'skipped' },
        ],
      },
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      '1 of 5 checks passed, 1 failed, 3 did not run.'
    );
    expect(screen.getAllByText('Did not run')).toHaveLength(3);
    expect(screen.getByText(/^Not run: an earlier check was stopped/)).toBeInTheDocument();
  });

  it('marks results as out of date once the code changed', () => {
    renderPanel({ run: mixedRun, stale: true });
    expect(screen.getByText(/The code has changed since these results/)).toBeInTheDocument();
  });

  it('runs the checks from the Check button, and disables it while they run', () => {
    const { props } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(props.onCheck).toHaveBeenCalledTimes(1);
  });

  it('shows that the checks are running', () => {
    renderPanel({ checking: true });
    expect(screen.getByRole('button', { name: 'Checking…' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Running the checks…');
  });

  it('offers Watch on every visible check, named by its call', () => {
    const { props } = renderPanel({ watchedIndex: 1 });
    const watch = screen.getAllByRole('button', { name: /^Watch check/ });
    expect(watch).toHaveLength(3);
    expect(watch[1]).toHaveAccessibleName('Watch check 2: twoSum([3, 2, 4], 6)');
    expect(watch[1]).toHaveAttribute('aria-pressed', 'true');
    expect(watch[0]).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Its steps are in the lens.')).toBeInTheDocument();
    fireEvent.click(watch[2]);
    expect(props.onWatch).toHaveBeenCalledWith(2);
  });

  it('reveals hints one at a time, in order', () => {
    const { props, update } = renderPanel();
    expect(screen.queryByText(twoSum.hints[0])).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show a hint (0 of 3 shown)' }));
    expect(props.onRevealHint).toHaveBeenCalledTimes(1);

    update({ hintsShown: 1 });
    expect(screen.getByText(twoSum.hints[0])).toBeInTheDocument();
    expect(screen.queryByText(twoSum.hints[1])).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Show the next hint (1 of 3 shown)' })
    ).toBeInTheDocument();

    update({ hintsShown: 3 });
    expect(screen.getByText(twoSum.hints[2])).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /hint/ })).toBeNull();
    expect(screen.getByText('All 3 hints are shown.')).toBeInTheDocument();
  });

  it('starts over and leaves from its own buttons', () => {
    const { props } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
    fireEvent.click(screen.getByRole('button', { name: 'Leave exercise' }));
    expect(props.onStartOver).toHaveBeenCalledTimes(1);
    expect(props.onLeave).toHaveBeenCalledTimes(1);
  });

  it('says why the checks cannot run in another language, and disables Check and Watch', () => {
    renderPanel({ blockedReason: 'Exercises run JavaScript.' });
    expect(screen.getByText('Exercises run JavaScript.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check' })).toBeDisabled();
    expect(screen.getAllByRole('button', { name: /^Watch check/ })[0]).toBeDisabled();
  });

  it('lists the exercises by level when none is open, marking the passed ones', () => {
    const { props } = renderPanel({ exercise: null, passedIds: new Set(['two-sum']) });
    expect(screen.getByRole('heading', { name: 'Exercises' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Easy exercises' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Medium exercises' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Two Sum.*Passed/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Valid Parentheses' }));
    expect(props.onOpenExercise).toHaveBeenCalledWith(
      exercises.find((exercise) => exercise.id === 'valid-parentheses')
    );
  });
});
