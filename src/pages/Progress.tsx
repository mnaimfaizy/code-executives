import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Circle, ExternalLink } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  loadProgress,
  type ExerciseProgress,
} from '../features/playground/exercises/exerciseProgress';
import { learningModuleConfigs } from '../shared/constants/moduleNavigation';
import {
  describeMilestone,
  loadProgressRecord,
  milestones,
  moduleProgress,
  onProgressChange,
  resetProgress,
  syncProgress,
  type ExerciseLink,
  type Milestone,
  type MilestoneStatus,
  type ModuleProgress,
  type ProgressRecord,
} from '../shared/progress';

/** Everything the page draws, read from this browser in one go. */
interface Snapshot {
  record: ProgressRecord;
  exercises: ExerciseProgress;
}

const readSnapshot = (): Snapshot => ({
  record: loadProgressRecord(),
  exercises: loadProgress(),
});

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';
const linkClass = `font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-900 ${focusRing}`;

/** The day only: a milestone is not a time to beat. */
function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const Day: React.FC<{ iso: string }> = ({ iso }) => <time dateTime={iso}>{formatDay(iso)}</time>;

/** A link to one exercise. It opens the Playground in a new tab, as every practice link does. */
const ExerciseAnchor: React.FC<{ exercise: ExerciseLink }> = ({ exercise }) => (
  <a href={exercise.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
    {exercise.title}
    <ExternalLink className="ml-1 inline h-3 w-3 align-baseline" aria-hidden />
    <span className="sr-only"> (opens in the Playground, in a new tab)</span>
  </a>
);

const ExerciseLinks: React.FC<{ exercises: ExerciseLink[] }> = ({ exercises }) => (
  <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
    {exercises.map((exercise) => (
      <li key={exercise.id}>
        <ExerciseAnchor exercise={exercise} />
      </li>
    ))}
  </ul>
);

const quizLinkText = (milestone: Milestone): string =>
  milestone.moduleId
    ? `Take the ${learningModuleConfigs[milestone.moduleId].title} quiz`
    : 'Take the quiz';

const MilestoneRow: React.FC<{ milestone: Milestone; status: MilestoneStatus }> = ({
  milestone,
  status,
}) => {
  // Earned or not is said in words below; the icon only repeats it
  const Icon: LucideIcon = status.earned ? Check : Circle;

  return (
    <li data-testid={`milestone-${milestone.id}`} className="flex gap-3 p-4">
      <Icon
        className={`mt-1 h-4 w-4 shrink-0 ${status.earned ? 'text-emerald-700' : 'text-slate-400'}`}
        aria-hidden
      />
      <div className="min-w-0 text-sm text-slate-700">
        <h3 className="text-base font-semibold text-slate-900">{milestone.title}</h3>

        {status.earned && status.earnedAt && (
          <p className="mt-1">
            Reached <Day iso={status.earnedAt} />
          </p>
        )}

        {status.earned && status.newSinceEarned.length > 0 && (
          <div className="mt-2">
            <p>There is something new since you reached this. You keep the milestone.</p>
            <ExerciseLinks exercises={status.newSinceEarned} />
          </div>
        )}

        {!status.earned && milestone.kind === 'exercises' && (
          <div className="mt-1">
            <p>
              {status.done} of {status.total} passed. Left to pass:
            </p>
            <ExerciseLinks exercises={status.remaining} />
          </div>
        )}

        {!status.earned && milestone.kind === 'quiz' && (
          <p className="mt-1">
            {status.bestQuiz
              ? `Best score so far: ${status.bestQuiz.scorePercentage}%.`
              : 'No completed attempt yet.'}{' '}
            {status.quizHref && (
              <Link to={status.quizHref} className={linkClass}>
                {quizLinkText(milestone)}
              </Link>
            )}
          </p>
        )}
      </div>
    </li>
  );
};

const ModuleRow: React.FC<{ entry: ModuleProgress }> = ({ entry: module }) => (
  <li data-testid={`module-${module.moduleId}`} className="p-4 text-sm text-slate-700">
    <h3 className="text-base font-semibold text-slate-900">
      <Link to={module.path} className={`underline underline-offset-2 ${focusRing}`}>
        {module.title}
      </Link>
    </h3>

    {module.totalCount > 0 && (
      <div className="mt-2">
        <p>
          Exercises: {module.passedCount} of {module.totalCount} passed
        </p>
        <ul className="mt-1 space-y-1">
          {module.exercises.map((exercise) => (
            <li
              key={exercise.id}
              data-testid={`module-${module.moduleId}-exercise-${exercise.id}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-0.5"
            >
              <ExerciseAnchor exercise={exercise} />
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                {exercise.passed ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    Passed
                  </>
                ) : (
                  'Not passed yet'
                )}
                {exercise.solutionSeen && ', solution seen'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {module.hasQuiz && (
      <p className="mt-2">
        Quiz:{' '}
        {module.bestQuiz ? (
          <>
            best score {module.bestQuiz.scorePercentage}%, on{' '}
            <Day iso={module.bestQuiz.completedAt} />.
          </>
        ) : (
          'No completed attempt yet.'
        )}{' '}
        {module.quizHref && (
          <Link to={module.quizHref} className={linkClass}>
            Take the {module.title} quiz
          </Link>
        )}
      </p>
    )}
  </li>
);

const CLEARED_TEXT =
  'your passed marks, your solution-seen marks, your milestones and your quiz results';

/**
 * The one control that clears progress. It asks in the page, with the safe answer first and
 * focused; Escape gives that answer. Focus returns to the control afterwards.
 */
const StartOver: React.FC<{ onCleared: () => void }> = ({ onCleared }) => {
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  useEffect(() => {
    if (confirming) keepRef.current?.focus();
    else if (wasConfirming.current) triggerRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  const clear = (): void => {
    resetProgress();
    // An empty record is stored at once, so the next thing earned is told as news
    syncProgress();
    setConfirming(false);
    setCleared(true);
    onCleared();
  };

  return (
    <section aria-labelledby="progress-start-over" className="space-y-3">
      <h2 id="progress-start-over" className="text-xl font-semibold text-slate-900">
        Start over
      </h2>
      <p className="text-sm text-slate-700">
        Clearing your progress removes {CLEARED_TEXT} from this browser. The code you wrote for
        exercises is kept.
      </p>

      {confirming ? (
        <div
          role="alertdialog"
          aria-labelledby="progress-confirm-title"
          aria-describedby="progress-confirm-body"
          className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-4"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              setConfirming(false);
            }
          }}
        >
          <p id="progress-confirm-title" className="font-semibold text-slate-900">
            Clear your progress?
          </p>
          <p id="progress-confirm-body" className="text-sm text-slate-800">
            This removes {CLEARED_TEXT}. The code you wrote for exercises is kept. It cannot be
            undone.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              ref={keepRef}
              type="button"
              onClick={() => setConfirming(false)}
              className={`rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 ${focusRing}`}
            >
              Keep my progress
            </button>
            <button
              type="button"
              onClick={clear}
              className={`rounded-lg border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 ${focusRing}`}
            >
              Clear my progress
            </button>
          </div>
        </div>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setCleared(false);
            setConfirming(true);
          }}
          className={`rounded-lg border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 ${focusRing}`}
        >
          Clear my progress…
        </button>
      )}

      <p role="status" className="text-sm text-slate-700">
        {cleared && 'Your progress was cleared.'}
      </p>
    </section>
  );
};

/**
 * The learner's progress for the whole site (ADR 0005): every milestone, earned or not, with
 * what is left; the plain record per module; and the control that clears it.
 */
const Progress: React.FC = () => {
  const [snapshot, setSnapshot] = useState<Snapshot>(readSnapshot);

  useEffect(() => {
    const refresh = (): void => setSnapshot(readSnapshot());
    // Brings the stored milestones up to date; a first visit is worked out without news
    syncProgress();
    refresh();
    return onProgressChange(refresh);
  }, []);

  const { record, exercises } = snapshot;
  const modules = moduleProgress(record, exercises);

  return (
    <div className="space-y-10 p-4 sm:p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Progress</h1>
        <p className="max-w-3xl text-slate-700">
          Your progress is kept in this browser only: it is lost if you clear the site&rsquo;s data
          or use another browser.
        </p>
      </header>

      <section aria-labelledby="progress-milestones" className="space-y-3">
        <h2 id="progress-milestones" className="text-xl font-semibold text-slate-900">
          Milestones
        </h2>
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {milestones().map((milestone) => (
            <MilestoneRow
              key={milestone.id}
              milestone={milestone}
              status={describeMilestone(milestone, record, exercises)}
            />
          ))}
        </ul>
      </section>

      <section aria-labelledby="progress-by-module" className="space-y-3">
        <h2 id="progress-by-module" className="text-xl font-semibold text-slate-900">
          By module
        </h2>
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {modules.map((module) => (
            <ModuleRow key={module.moduleId} entry={module} />
          ))}
        </ul>
      </section>

      <StartOver onCleared={() => setSnapshot(readSnapshot())} />
    </div>
  );
};

export default Progress;
