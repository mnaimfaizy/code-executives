import React from 'react';
import { Check, Circle, Eye, Lightbulb, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CheckResult, ChecksRun, Exercise } from '../../exercises/types';
import type { ExerciseGroup } from '../../exercises/exercises';
import { describeResult, formatCall, formatValue } from '../../exercises/runChecks';
import PassedMark from './PassedMark';
import Prose from './Prose';
import SolutionSection from './SolutionSection';

interface TaskPanelProps {
  /** The open exercise, or null in free play. */
  exercise: Exercise | null;
  /** Every exercise, grouped by level: shown when none is open. */
  groups: ExerciseGroup[];
  /** Ids of the exercises this viewer has passed. */
  passedIds: ReadonlySet<string>;
  /** Ids of the exercises whose solution this viewer has seen. */
  solutionSeenIds: ReadonlySet<string>;
  onOpenExercise: (exercise: Exercise) => void;
  /** The result of the last Check action on this exercise. */
  run: ChecksRun | null;
  /** True while the checks are running. */
  checking: boolean;
  /** True when the code was edited after `run` was made. */
  stale: boolean;
  /** Set when the checks cannot run right now, with the reason. */
  blockedReason?: string;
  /** How many hints are shown. */
  hintsShown: number;
  onRevealHint: () => void;
  onCheck: () => void;
  /** Run one visible check traced and show its steps in the lens. */
  onWatch: (index: number) => void;
  /** The check whose steps the lens shows now. */
  watchedIndex: number | null;
  onStartOver: () => void;
  onLeave: () => void;
  /** The learner asked for the solution and confirmed. */
  onRevealSolution: () => void;
  /** Put the solution in the editor, asking first when the learner has edits. */
  onLoadSolution: () => void;
  /** Trace the solution on the first visible check into the lens. The editor keeps its code. */
  onWatchSolution: () => void;
  /** The lens shows the solution's steps now. */
  watchingSolution: boolean;
  /** The line of the solution the current step ran, while its steps are in the lens. */
  solutionLine?: number;
  /** The editor holds the solution's code. */
  solutionInEditor: boolean;
}

const LEVEL_LABELS: Record<Exercise['level'], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const mono: React.CSSProperties = { fontFamily: 'var(--pg-font-mono)' };

interface Verdict {
  label: string;
  icon: LucideIcon;
  color: string;
}

/** Pass and fail differ by icon and by word, not by colour alone. */
function verdictOf(result: CheckResult | undefined): Verdict {
  if (!result) return { label: 'Not run yet', icon: Circle, color: 'var(--pg-text-muted)' };
  if (result.status === 'pass')
    return { label: 'Passed', icon: Check, color: 'var(--pg-accent-green)' };
  if (result.status === 'unavailable' || result.status === 'skipped') {
    return { label: 'Did not run', icon: Circle, color: 'var(--pg-accent-amber)' };
  }
  return { label: 'Failed', icon: X, color: 'var(--pg-accent-red)' };
}

const buttonStyle: React.CSSProperties = {
  color: 'var(--pg-text-secondary)',
  border: '1px solid var(--pg-border)',
  background: 'transparent',
};

/** What the last Check action found, in one sentence. Announced politely. */
function summaryOf(run: ChecksRun | null, checking: boolean, total: number): string {
  if (checking) return 'Running the checks…';
  if (!run) return '';
  if (run.kind === 'syntax-error') {
    return `No check ran: the code has a syntax error${run.line ? ` on line ${run.line}` : ''}. ${run.message}`;
  }
  if (run.kind === 'untraceable') return `No check ran. ${run.message}.`;
  const passed = run.results.filter((result) => result.status === 'pass').length;
  if (run.passed) return `All ${total} checks passed.`;
  const notRun = run.results.filter(
    (result) => result.status === 'skipped' || result.status === 'unavailable'
  ).length;
  const failed = total - passed - notRun;
  return `${passed} of ${total} checks passed, ${failed} failed${notRun > 0 ? `, ${notRun} did not run` : ''}.`;
}

const TaskPanel: React.FC<TaskPanelProps> = ({
  exercise,
  groups,
  passedIds,
  solutionSeenIds,
  onOpenExercise,
  run,
  checking,
  stale,
  blockedReason,
  hintsShown,
  onRevealHint,
  onCheck,
  onWatch,
  watchedIndex,
  onStartOver,
  onLeave,
  onRevealSolution,
  onLoadSolution,
  onWatchSolution,
  watchingSolution,
  solutionLine,
  solutionInEditor,
}) => {
  if (!exercise) {
    return (
      <div
        className="h-full overflow-y-auto p-3"
        style={{ background: 'var(--pg-bg-primary)', color: 'var(--pg-text-secondary)' }}
      >
        <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--pg-text-primary)' }}>
          Exercises
        </h2>
        <p className="text-xs leading-relaxed mb-3">
          An exercise gives you a task, checks that run on your code, and hints. Pick one to start.
          Your own code stays in free play until you do.
        </p>
        {groups.map((group) => (
          <section key={group.level} className="mb-3" aria-label={`${group.label} exercises`}>
            <h3
              className="text-[10px] uppercase tracking-wider mb-1"
              style={{ color: 'var(--pg-text-muted)' }}
            >
              {group.label}
            </h3>
            <ul className="space-y-1">
              {group.exercises.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onOpenExercise(item)}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-white/5"
                    style={{ ...buttonStyle, color: 'var(--pg-text-primary)' }}
                  >
                    <span>{item.title}</span>
                    {passedIds.has(item.id) && (
                      <PassedMark label="Passed" solutionSeen={solutionSeenIds.has(item.id)} />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  const results = run?.kind === 'ran' ? run.results : [];
  const total = exercise.checks.length;
  const summary = summaryOf(run, checking, total);
  const allPassed = run?.kind === 'ran' && run.passed;
  const hints = exercise.hints.slice(0, hintsShown);
  const hintsLeft = exercise.hints.length - hints.length;
  /** Hidden checks are numbered among themselves: their place in the list says nothing */
  const hiddenNumber = (index: number): number =>
    exercise.checks.slice(0, index + 1).filter((check) => check.hidden).length;

  return (
    <div
      className="h-full overflow-y-auto p-3"
      style={{ background: 'var(--pg-bg-primary)', color: 'var(--pg-text-secondary)' }}
    >
      {/* Title */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--pg-text-primary)' }}>
          {exercise.title}
        </h2>
        <span
          className="px-1.5 py-0.5 rounded text-[10px]"
          style={{ background: 'var(--pg-bg-tertiary)', color: 'var(--pg-text-secondary)' }}
        >
          {LEVEL_LABELS[exercise.level]}
        </span>
        {/* Announced when a pass or a seen solution is first recorded */}
        <span aria-live="polite">
          {passedIds.has(exercise.id) && (
            <PassedMark label="Passed before" solutionSeen={solutionSeenIds.has(exercise.id)} />
          )}
        </span>
      </div>

      {/* The task */}
      <div className="mb-3">
        <Prose text={exercise.task} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <button
          type="button"
          onClick={onCheck}
          disabled={checking || blockedReason !== undefined}
          className="px-3 py-1 rounded-md text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--pg-accent-blue)', color: 'var(--pg-bg-primary)' }}
          title="Run the checks on your code (Ctrl+Shift+Enter)"
        >
          {checking ? 'Checking…' : 'Check'}
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="px-2.5 py-1 rounded-md text-xs hover:bg-white/5"
          style={buttonStyle}
        >
          Start over
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="px-2.5 py-1 rounded-md text-xs hover:bg-white/5"
          style={buttonStyle}
        >
          Leave exercise
        </button>
      </div>
      {blockedReason && (
        <p className="text-[11px] mb-2" style={{ color: 'var(--pg-accent-amber)' }}>
          {blockedReason}
        </p>
      )}

      {/* The outcome of the last Check, announced politely */}
      <div role="status" aria-live="polite" className="min-h-4 mb-2 text-xs">
        {summary && (
          <p
            className="flex items-start gap-1.5 font-medium"
            style={{ color: allPassed ? 'var(--pg-accent-green)' : 'var(--pg-text-primary)' }}
          >
            {allPassed && <Check size={13} className="mt-0.5 shrink-0" aria-hidden="true" />}
            <span>{summary}</span>
          </p>
        )}
        {stale && !checking && run && (
          <p className="mt-1 text-[11px]" style={{ color: 'var(--pg-text-muted)' }}>
            The code has changed since these results. Check again to update them.
          </p>
        )}
      </div>

      {/* The checks */}
      <h3
        className="text-[10px] uppercase tracking-wider mb-1"
        style={{ color: 'var(--pg-text-muted)' }}
      >
        Checks
      </h3>
      <ol className="space-y-1.5 mb-4">
        {exercise.checks.map((check, index) => {
          const result = results.find((item) => item.index === index);
          const verdict = verdictOf(result);
          const Icon = verdict.icon;
          const ran =
            result !== undefined && result.status !== 'skipped' && result.status !== 'unavailable';
          const failed = ran && result.status !== 'pass';

          if (check.hidden) {
            return (
              <li
                key={index}
                className="rounded-md px-2.5 py-1.5 text-xs"
                style={{ border: '1px solid var(--pg-border)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>Hidden check {hiddenNumber(index)}</span>
                  <span
                    className="inline-flex items-center gap-1 shrink-0 font-medium"
                    style={{ color: verdict.color }}
                  >
                    <Icon size={12} aria-hidden="true" />
                    {verdict.label}
                  </span>
                </div>
              </li>
            );
          }

          const watched = watchedIndex === index;
          return (
            <li
              key={index}
              className="rounded-md px-2.5 py-1.5 text-xs"
              style={{ border: '1px solid var(--pg-border)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <code
                  className="[overflow-wrap:anywhere] text-[11px]"
                  style={{ ...mono, color: 'var(--pg-text-primary)' }}
                >
                  {formatCall(exercise.entry, check)}
                </code>
                <span
                  className="inline-flex items-center gap-1 shrink-0 font-medium"
                  style={{ color: verdict.color }}
                >
                  <Icon size={12} aria-hidden="true" />
                  {verdict.label}
                </span>
              </div>
              <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]">
                <dt style={{ color: 'var(--pg-text-muted)' }}>Expected</dt>
                <dd className="[overflow-wrap:anywhere]" style={mono}>
                  {formatValue(check.expected)}
                  {exercise.compare === 'any-order' && (
                    <span
                      style={{ fontFamily: 'var(--pg-font-sans)', color: 'var(--pg-text-muted)' }}
                    >
                      {' '}
                      (in any order)
                    </span>
                  )}
                </dd>
                {result?.status === 'fail' && (
                  <>
                    <dt style={{ color: 'var(--pg-text-muted)' }}>Returned</dt>
                    <dd
                      className="[overflow-wrap:anywhere]"
                      style={{ ...mono, color: 'var(--pg-accent-red)' }}
                    >
                      {result.actual}
                    </dd>
                  </>
                )}
              </dl>
              {result !== undefined && result.status !== 'pass' && result.status !== 'fail' && (
                <p
                  className="mt-1 text-[11px] break-words"
                  style={{ color: failed ? 'var(--pg-accent-red)' : 'var(--pg-accent-amber)' }}
                >
                  {describeResult(result, exercise.entry)}
                </p>
              )}
              {failed && check.explanation && (
                <p className="mt-1 text-[11px]" style={{ color: 'var(--pg-text-secondary)' }}>
                  Why: {check.explanation}
                </p>
              )}
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onWatch(index)}
                  disabled={blockedReason !== undefined}
                  aria-label={`Watch check ${index + 1}: ${formatCall(exercise.entry, check)}`}
                  aria-pressed={watched}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    ...buttonStyle,
                    ...(watched
                      ? {
                          border: '1px solid var(--pg-accent-blue)',
                          color: 'var(--pg-accent-blue)',
                        }
                      : {}),
                  }}
                  title="Run this call on your code and step through it in the lens"
                >
                  <Eye size={11} aria-hidden="true" />
                  Watch
                </button>
                {watched && (
                  <span className="text-[11px]" style={{ color: 'var(--pg-text-muted)' }}>
                    Its steps are in the lens.
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Hints, one at a time */}
      <h3
        className="text-[10px] uppercase tracking-wider mb-1"
        style={{ color: 'var(--pg-text-muted)' }}
      >
        Hints
      </h3>
      <div aria-live="polite">
        {hints.length > 0 && (
          <ol className="space-y-1 mb-2">
            {hints.map((hint, index) => (
              <li
                key={index}
                className="flex items-start gap-1.5 rounded-md px-2.5 py-1.5"
                style={{ background: 'var(--pg-bg-surface)' }}
              >
                <Lightbulb
                  size={12}
                  className="mt-0.5 shrink-0"
                  style={{ color: 'var(--pg-accent-amber)' }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <span className="sr-only">Hint {index + 1}: </span>
                  <Prose text={hint} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
      {hintsLeft > 0 ? (
        <button
          type="button"
          onClick={onRevealHint}
          className="px-2.5 py-1 rounded-md text-xs hover:bg-white/5"
          style={buttonStyle}
        >
          {hints.length === 0 ? 'Show a hint' : 'Show the next hint'} ({hints.length} of{' '}
          {exercise.hints.length} shown)
        </button>
      ) : (
        <p className="text-[11px]" style={{ color: 'var(--pg-text-muted)' }}>
          All {exercise.hints.length} hints are shown.
        </p>
      )}

      {/* The solution, after the hints */}
      <SolutionSection
        key={exercise.id}
        exercise={exercise}
        hintsLeft={hintsLeft}
        seen={solutionSeenIds.has(exercise.id)}
        onReveal={onRevealSolution}
        onLoad={onLoadSolution}
        onWatch={onWatchSolution}
        watching={watchingSolution}
        line={solutionLine}
        inEditor={solutionInEditor}
        blocked={blockedReason !== undefined}
      />
    </div>
  );
};

export default TaskPanel;
