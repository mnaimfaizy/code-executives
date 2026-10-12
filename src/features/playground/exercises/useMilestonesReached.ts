/**
 * Tells the Playground which milestones a pass has just earned (ADR 0005), for the one quiet
 * line in the Task panel.
 *
 * The order matters. `markPassed` stores the pass inside a React state updater, which runs
 * when the component next renders, not when `markPassed` is called. Working out milestones
 * right after the call would read the record as it was before the pass. So the work is done
 * in an effect that follows the passed set: by then the updater has run and the pass is stored.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { syncProgress, type Milestone } from '../../../shared/progress';
import type { ExerciseProgress } from './exerciseProgress';

export interface MilestonesReached {
  /** The exercise whose pass earned them. */
  exerciseId: string;
  milestones: Milestone[];
}

interface UseMilestonesReachedReturn {
  /** What the last pass in this visit earned, or null. Never set by opening the Playground. */
  reached: MilestonesReached | null;
  /** Call beside `markPassed`, with the same exercise. */
  notePassed: (exerciseId: string) => void;
}

export function useMilestonesReached(progress: ExerciseProgress): UseMilestonesReachedReturn {
  const [reached, setReached] = useState<MilestonesReached | null>(null);
  /** The exercise a check has just passed, until the effect below has dealt with it */
  const justPassed = useRef<string | null>(null);

  // Changes only when an exercise becomes passed (or stops being, after a reset elsewhere),
  // not on every keystroke that saves the learner's code
  const passedKey = Object.keys(progress)
    .filter((id) => progress[id].passed)
    .sort()
    .join('\n');

  useEffect(() => {
    const exerciseId = justPassed.current;
    justPassed.current = null;
    // On opening, this stores the record of a first visit and is told nothing is new
    const { earned } = syncProgress();
    // Without a pass made here there is nothing to announce: the progress page shows it
    if (exerciseId !== null && earned.length > 0) {
      setReached({ exerciseId, milestones: earned });
    }
  }, [passedKey]);

  const notePassed = useCallback((exerciseId: string): void => {
    justPassed.current = exerciseId;
  }, []);

  return { reached, notePassed };
}
