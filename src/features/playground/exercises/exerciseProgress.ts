/**
 * What one viewer has done with the exercises: which they passed, which solutions they have
 * seen, and their last code for each. Kept in `localStorage` as a convenience; every read and write may fail (a private
 * window, blocked site data), and the Playground works the same without it for one visit.
 *
 * Nothing here is a score: no points, streaks or achievements (ADR 0004 leaves those open).
 * That a solution was seen is recorded so the page can say so beside "passed"; it takes
 * nothing away.
 */

import { useCallback, useEffect, useState } from 'react';

export interface ExerciseRecord {
  /** True once every check passed at least once. */
  passed?: true;
  /** True once the learner asked for the solution and it was shown. */
  solutionSeen?: true;
  /** The learner's last code for this exercise. */
  code?: string;
}

export type ExerciseProgress = Record<string, ExerciseRecord>;

export const PROGRESS_STORAGE_KEY = 'pg-exercise-progress';

/** Code longer than this is not remembered (the sandbox does not run it either). */
const MAX_CODE_LENGTH = 50 * 1024;

export function loadProgress(): ExerciseProgress {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!stored) return {};
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const progress: ExerciseProgress = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== 'object') continue;
      const { passed, solutionSeen, code } = value as {
        passed?: unknown;
        solutionSeen?: unknown;
        code?: unknown;
      };
      const record: ExerciseRecord = {};
      if (passed === true) record.passed = true;
      if (solutionSeen === true) record.solutionSeen = true;
      if (typeof code === 'string' && code.length <= MAX_CODE_LENGTH) record.code = code;
      progress[id] = record;
    }
    return progress;
  } catch {
    // Unavailable or corrupt: start empty
    return {};
  }
}

export function saveProgress(progress: ExerciseProgress): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Unavailable or full: this visit still has it in memory
  }
}

interface UseExerciseProgressReturn {
  progress: ExerciseProgress;
  /** Remember the learner's code for an exercise. */
  saveCode: (id: string, code: string) => void;
  /** Forget the learner's code for an exercise, so it opens with its starter code again. */
  forgetCode: (id: string) => void;
  markPassed: (id: string) => void;
  markSolutionSeen: (id: string) => void;
}

/** The viewer's progress, held in state and mirrored to `localStorage`. */
export function useExerciseProgress(): UseExerciseProgressReturn {
  const [progress, setProgress] = useState<ExerciseProgress>(loadProgress);

  // Another tab changed what is stored (a pass, or the learner clearing their progress):
  // read it again, so the next write here does not put the old marks back
  useEffect(() => {
    const handle = (event: StorageEvent): void => {
      // A null key is the whole storage being cleared
      if (event.key !== null && event.key !== PROGRESS_STORAGE_KEY) return;
      setProgress(loadProgress());
    };
    window.addEventListener('storage', handle);
    return () => window.removeEventListener('storage', handle);
  }, []);

  const update = useCallback((id: string, change: (record: ExerciseRecord) => ExerciseRecord) => {
    setProgress((previous) => {
      const next = { ...previous, [id]: change(previous[id] ?? {}) };
      saveProgress(next);
      return next;
    });
  }, []);

  const saveCode = useCallback(
    (id: string, code: string): void => {
      if (code.length > MAX_CODE_LENGTH) return;
      update(id, (record) => ({ ...record, code }));
    },
    [update]
  );

  const forgetCode = useCallback(
    (id: string): void => {
      // Only the code is forgotten: what was passed and what was seen stay true
      update(id, (record) => {
        const kept = { ...record };
        delete kept.code;
        return kept;
      });
    },
    [update]
  );

  const markPassed = useCallback(
    (id: string): void => {
      update(id, (record) => (record.passed ? record : { ...record, passed: true }));
    },
    [update]
  );

  const markSolutionSeen = useCallback(
    (id: string): void => {
      update(id, (record) => (record.solutionSeen ? record : { ...record, solutionSeen: true }));
    },
    [update]
  );

  return { progress, saveCode, forgetCode, markPassed, markSolutionSeen };
}
