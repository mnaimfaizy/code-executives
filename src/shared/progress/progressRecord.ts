/**
 * The stored part of a learner's progress that cannot be worked out again (ADR 0005): which
 * milestones were earned and when, and the best quiz score per module.
 *
 * Both are kept because their sources move. A milestone worked out on every visit would be
 * taken away when an exercise is added, so it is stored with the set of exercises it was
 * earned for. A quiz keeps only its last 8 results, so the best one is copied here.
 *
 * Kept in `localStorage` of this browser only. Every read and write may fail (a private
 * window, blocked site data), and what is read is checked field by field: it may have been
 * written by an older version or by hand.
 */

import { learningModuleIds, type LearningModuleId } from '../constants/moduleNavigation';

export interface EarnedMilestone {
  /** ISO date and time. */
  earnedAt: string;
  /** For an exercise milestone: the set of exercises as it was when the milestone was earned. */
  exerciseIds?: string[];
}

export interface BestQuizResult {
  scorePercentage: number;
  /** ISO date and time of the attempt. */
  completedAt: string;
}

export interface ProgressRecord {
  /** By milestone id. An entry is never removed except by the learner's own reset. */
  milestones: Record<string, EarnedMilestone>;
  /** The best completed attempt per module. */
  bestQuiz: Partial<Record<LearningModuleId, BestQuizResult>>;
}

export const PROGRESS_RECORD_STORAGE_KEY = 'code-executives.progress';

export function emptyProgressRecord(): ProgressRecord {
  return { milestones: {}, bestQuiz: {} };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isDateString = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value));

const isScore = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;

function parseProgressRecord(parsed: unknown): ProgressRecord | null {
  if (!isRecord(parsed)) return null;
  const record = emptyProgressRecord();

  if (isRecord(parsed.milestones)) {
    for (const [id, value] of Object.entries(parsed.milestones)) {
      if (!isRecord(value) || !isDateString(value.earnedAt)) continue;
      const earned: EarnedMilestone = { earnedAt: value.earnedAt };
      if (
        Array.isArray(value.exerciseIds) &&
        value.exerciseIds.every((item) => typeof item === 'string')
      ) {
        earned.exerciseIds = value.exerciseIds as string[];
      }
      record.milestones[id] = earned;
    }
  }

  if (isRecord(parsed.bestQuiz)) {
    for (const moduleId of learningModuleIds) {
      const value = parsed.bestQuiz[moduleId];
      if (!isRecord(value) || !isScore(value.scorePercentage) || !isDateString(value.completedAt)) {
        continue;
      }
      record.bestQuiz[moduleId] = {
        scorePercentage: value.scorePercentage,
        completedAt: value.completedAt,
      };
    }
  }

  return record;
}

/**
 * The record as stored, or `null` when there is none to read: nothing stored yet, storage
 * unavailable, or what is stored is not a record. `null` is how a first visit is told from a
 * record that is stored but empty.
 */
export function readStoredProgressRecord(): ProgressRecord | null {
  try {
    const stored = localStorage.getItem(PROGRESS_RECORD_STORAGE_KEY);
    if (!stored) return null;
    return parseProgressRecord(JSON.parse(stored));
  } catch {
    // Unavailable or corrupt: as if nothing was stored
    return null;
  }
}

/** The stored record, or an empty one. */
export function loadProgressRecord(): ProgressRecord {
  return readStoredProgressRecord() ?? emptyProgressRecord();
}

export function saveProgressRecord(record: ProgressRecord): void {
  try {
    localStorage.setItem(PROGRESS_RECORD_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Unavailable or full: this visit still has it in memory
  }
}
