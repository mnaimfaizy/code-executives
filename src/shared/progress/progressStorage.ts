/**
 * The thin part of progress that touches `localStorage`: read what is recorded, apply the pure
 * rules of `progress.ts`, write the result (ADR 0005).
 *
 * The first visit is special. A learner who used the site before this record existed already
 * has passed exercises and quiz results, so their milestones are worked out from those, dated
 * that day, and reported as nothing new: no "reached" line for work done long ago.
 *
 * Open components learn of a change through the window's `storage` event, the same event the
 * exercise lists already follow for a pass made in another tab. The browser sends it only to
 * other tabs, so a change made here is announced to this tab by hand.
 */

import {
  PROGRESS_STORAGE_KEY,
  loadProgress,
  saveProgress,
  type ExerciseProgress,
} from '../../features/playground/exercises/exerciseProgress';
import type { QuizResultSummary } from '../../types/quiz';
import { getQuizStorageKeys } from '../../utils/quiz';
import { learningModuleIds } from '../constants/moduleNavigation';
import type { Milestone } from './milestones';
import { earnMilestones, withQuizResult } from './progress';
import {
  PROGRESS_RECORD_STORAGE_KEY,
  emptyProgressRecord,
  readStoredProgressRecord,
  saveProgressRecord,
  type ProgressRecord,
} from './progressRecord';

export interface ProgressUpdate {
  record: ProgressRecord;
  /** The milestones this call earned, for the one quiet line. Empty on a first visit. */
  earned: Milestone[];
}

/** Tell this tab's open components that progress changed. Other tabs hear it from the browser. */
export function notifyProgressChanged(key: string = PROGRESS_RECORD_STORAGE_KEY): void {
  try {
    window.dispatchEvent(new StorageEvent('storage', { key }));
  } catch {
    // No window or no StorageEvent: nothing is listening
  }
}

/**
 * Calls `listener` whenever progress may have changed, in this tab or another. Returns the
 * function that stops it. The listener should read again, not assume what changed.
 */
export function onProgressChange(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handle = (): void => listener();
  window.addEventListener('storage', handle);
  return () => window.removeEventListener('storage', handle);
}

type StoredQuizResult = Pick<
  QuizResultSummary,
  'moduleId' | 'status' | 'scorePercentage' | 'completedAt'
>;

/** A module's stored quiz results, each checked: only the fields progress needs are trusted. */
function storedQuizResults(
  moduleId: (typeof learningModuleIds)[number],
  exceptAttemptId?: string
): StoredQuizResult[] {
  try {
    const stored = localStorage.getItem(getQuizStorageKeys(moduleId).results);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    const results: StoredQuizResult[] = [];
    for (const item of parsed as unknown[]) {
      if (!item || typeof item !== 'object') continue;
      const { attemptId, status, scorePercentage, completedAt } = item as Record<string, unknown>;
      if (exceptAttemptId !== undefined && attemptId === exceptAttemptId) continue;
      if (status !== 'completed' && status !== 'timed-out') continue;
      if (typeof scorePercentage !== 'number' || !Number.isFinite(scorePercentage)) continue;
      if (typeof completedAt !== 'string' || Number.isNaN(Date.parse(completedAt))) continue;
      results.push({ moduleId, status, scorePercentage, completedAt });
    }
    return results;
  } catch {
    // Unavailable or corrupt: no results to take in
    return [];
  }
}

/**
 * The record of a learner whose progress was never stored: every quiz result still kept is
 * taken in, then every milestone already deserved is earned, dated `now`.
 * `exceptAttemptId` leaves one attempt out, so it can be taken in afterwards and announced.
 */
function firstVisitRecord(
  exerciseProgress: ExerciseProgress,
  now: Date,
  exceptAttemptId?: string
): ProgressRecord {
  let record = emptyProgressRecord();
  for (const moduleId of learningModuleIds) {
    for (const result of storedQuizResults(moduleId, exceptAttemptId)) {
      record = withQuizResult(record, result);
    }
  }
  return earnMilestones(record, exerciseProgress, now).record;
}

/**
 * Brings the stored record up to date with the exercises passed and returns what was newly
 * earned. Call it when the progress page opens and after an exercise is passed. On a first
 * visit it returns `earned: []`, whatever was worked out.
 */
export function syncProgress(now: Date = new Date()): ProgressUpdate {
  const exerciseProgress = loadProgress();
  const stored = readStoredProgressRecord();

  if (!stored) {
    const record = firstVisitRecord(exerciseProgress, now);
    saveProgressRecord(record);
    return { record, earned: [] };
  }

  const { record, earned } = earnMilestones(stored, exerciseProgress, now);
  if (earned.length > 0) {
    saveProgressRecord(record);
    notifyProgressChanged();
  }
  return { record, earned };
}

/**
 * Takes in a quiz result as it is produced and returns what it earned. Safe to call whether
 * or not the quiz has already written the result to its own history.
 */
export function recordQuizResult(result: QuizResultSummary, now: Date = new Date()): ProgressUpdate {
  const exerciseProgress = loadProgress();
  // Without a record yet, older work is taken in silently first, so only this result is news
  const before =
    readStoredProgressRecord() ?? firstVisitRecord(exerciseProgress, now, result.attemptId);
  const { record, earned } = earnMilestones(
    withQuizResult(before, result),
    exerciseProgress,
    now
  );
  saveProgressRecord(record);
  notifyProgressChanged();
  return { record, earned };
}

/**
 * The learner's own "clear my progress": milestones, best quiz scores, quiz results, and the
 * passed and solution-seen marks. The code they wrote for each exercise is kept, and so is a
 * quiz attempt in progress, which is not a result yet.
 */
export function resetProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_RECORD_STORAGE_KEY);
  } catch {
    // Unavailable: nothing was stored
  }

  for (const moduleId of learningModuleIds) {
    try {
      localStorage.removeItem(getQuizStorageKeys(moduleId).results);
    } catch {
      // Unavailable: nothing was stored
    }
  }

  const kept: ExerciseProgress = {};
  for (const [id, record] of Object.entries(loadProgress())) {
    if (record.code !== undefined) kept[id] = { code: record.code };
  }
  saveProgress(kept);

  // Both keys changed; one event is enough, because listeners read again whatever the key
  notifyProgressChanged(PROGRESS_STORAGE_KEY);
}
