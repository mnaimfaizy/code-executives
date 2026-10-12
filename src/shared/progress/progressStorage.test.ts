import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PROGRESS_STORAGE_KEY,
  loadProgress,
  saveProgress,
  type ExerciseProgress,
} from '../../features/playground/exercises/exerciseProgress';
import type { QuizResultSummary } from '../../types/quiz';
import { getQuizStorageKeys } from '../../utils/quiz';
import { milestones } from './milestones';
import {
  PROGRESS_RECORD_STORAGE_KEY,
  emptyProgressRecord,
  loadProgressRecord,
  readStoredProgressRecord,
} from './progressRecord';
import {
  notifyProgressChanged,
  onProgressChange,
  recordQuizResult,
  resetProgress,
  syncProgress,
} from './progressStorage';

const DAY_ONE = new Date('2026-10-12T09:00:00.000Z');
const DAY_TWO = new Date('2026-10-20T09:00:00.000Z');

/** The real exercises of the Data Structures milestone, and every exercise. */
const idsOf = (milestoneId: string): string[] =>
  milestones().find((milestone) => milestone.id === milestoneId)?.exerciseIds ?? [];
const DATA_STRUCTURES = idsOf('exercises:datastructures');
const ALL = idsOf('exercises:all');

const pass = (ids: string[]): void => {
  const progress: ExerciseProgress = loadProgress();
  for (const id of ids) progress[id] = { ...progress[id], passed: true };
  saveProgress(progress);
};

const quizResult = (
  moduleId: QuizResultSummary['moduleId'],
  scorePercentage: number,
  status: QuizResultSummary['status'] = 'completed',
  attemptId = `${moduleId}-${scorePercentage}-${status}`
): QuizResultSummary => ({
  attemptId,
  moduleId,
  status,
  startedAt: '2026-09-01T10:00:00.000Z',
  completedAt: '2026-09-01T10:10:00.000Z',
  elapsedSeconds: 600,
  totalQuestions: 10,
  answeredQuestions: 10,
  correctAnswers: Math.round(scorePercentage / 10),
  incorrectAnswers: 10 - Math.round(scorePercentage / 10),
  scorePercentage,
  questionOutcomes: [],
});

const storeQuizResults = (results: QuizResultSummary[]): void => {
  localStorage.setItem(getQuizStorageKeys(results[0].moduleId).results, JSON.stringify(results));
};

describe('progress in storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has a Data Structures milestone to work with', () => {
    expect(DATA_STRUCTURES.length).toBeGreaterThanOrEqual(3);
    expect(ALL.length).toBeGreaterThan(DATA_STRUCTURES.length);
  });

  describe('syncProgress', () => {
    it('stores an empty record for a new learner', () => {
      expect(syncProgress(DAY_ONE)).toEqual({ record: emptyProgressRecord(), earned: [] });
      expect(readStoredProgressRecord()).toEqual(emptyProgressRecord());
    });

    it('on a first visit earns silently from what is already recorded, dated that day', () => {
      pass(DATA_STRUCTURES);
      storeQuizResults([
        quizResult('react', 70),
        quizResult('react', 90),
        quizResult('react', 100, 'timed-out'),
      ]);
      storeQuizResults([quizResult('git', 79)]);
      storeQuizResults([quizResult('python', 100, 'timed-out')]);

      const first = syncProgress(DAY_ONE);
      expect(first.earned).toEqual([]);
      expect(first.record).toEqual({
        milestones: {
          'exercises:datastructures': {
            earnedAt: DAY_ONE.toISOString(),
            exerciseIds: DATA_STRUCTURES,
          },
          'quiz:react': { earnedAt: DAY_ONE.toISOString() },
        },
        bestQuiz: {
          react: { scorePercentage: 90, completedAt: '2026-09-01T10:10:00.000Z' },
          git: { scorePercentage: 79, completedAt: '2026-09-01T10:10:00.000Z' },
        },
      });
      expect(loadProgressRecord()).toEqual(first.record);

      // A second call has nothing new and changes nothing
      const second = syncProgress(DAY_TWO);
      expect(second).toEqual({ record: first.record, earned: [] });
    });

    it('returns a milestone earned by a later pass exactly once', () => {
      pass(DATA_STRUCTURES.slice(1));
      expect(syncProgress(DAY_ONE).earned).toEqual([]);

      pass(DATA_STRUCTURES.slice(0, 1));
      const reached = syncProgress(DAY_TWO);
      expect(reached.earned.map((milestone) => milestone.id)).toEqual(['exercises:datastructures']);
      expect(reached.record.milestones['exercises:datastructures'].earnedAt).toBe(
        DAY_TWO.toISOString()
      );

      expect(syncProgress(DAY_TWO).earned).toEqual([]);
      expect(loadProgressRecord()).toEqual(reached.record);
    });

    it('does not take quiz results in again after the first visit', () => {
      syncProgress(DAY_ONE);
      // Only `recordQuizResult` brings a result in from here on
      storeQuizResults([quizResult('react', 95)]);
      expect(syncProgress(DAY_TWO)).toEqual({ record: emptyProgressRecord(), earned: [] });
    });

    it('treats a corrupt record as a first visit', () => {
      pass(ALL);
      localStorage.setItem(PROGRESS_RECORD_STORAGE_KEY, '{{{');
      const outcome = syncProgress(DAY_ONE);
      expect(outcome.earned).toEqual([]);
      expect(Object.keys(outcome.record.milestones)).toEqual([
        'exercises:datastructures',
        'exercises:all',
      ]);
    });

    it('ignores quiz results that are not what the quiz wrote', () => {
      localStorage.setItem(getQuizStorageKeys('react').results, 'not json');
      localStorage.setItem(getQuizStorageKeys('git').results, JSON.stringify({ a: 1 }));
      localStorage.setItem(
        getQuizStorageKeys('rxjs').results,
        JSON.stringify([
          null,
          7,
          { status: 'completed', scorePercentage: '100', completedAt: 'x' },
          { status: 'won', scorePercentage: 100, completedAt: '2026-09-01T10:10:00.000Z' },
          { status: 'completed', scorePercentage: 100, completedAt: 'never' },
        ])
      );
      expect(syncProgress(DAY_ONE)).toEqual({ record: emptyProgressRecord(), earned: [] });
    });
  });

  describe('recordQuizResult', () => {
    it('earns the quiz milestone at 80% and reports it once', () => {
      syncProgress(DAY_ONE);

      expect(recordQuizResult(quizResult('react', 79), DAY_TWO).earned).toEqual([]);
      expect(recordQuizResult(quizResult('react', 100, 'timed-out'), DAY_TWO).earned).toEqual([]);

      const reached = recordQuizResult(quizResult('react', 80), DAY_TWO);
      expect(reached.earned.map((milestone) => milestone.id)).toEqual(['quiz:react']);
      expect(reached.record.bestQuiz.react?.scorePercentage).toBe(80);
      expect(loadProgressRecord()).toEqual(reached.record);

      const again = recordQuizResult(quizResult('react', 100), DAY_TWO);
      expect(again.earned).toEqual([]);
      expect(again.record.bestQuiz.react?.scorePercentage).toBe(100);
      expect(again.record.milestones['quiz:react'].earnedAt).toBe(DAY_TWO.toISOString());
    });

    it('with no record yet, takes older work in silently and reports only this result', () => {
      pass(DATA_STRUCTURES);
      const fresh = quizResult('react', 90, 'completed', 'attempt-now');
      // The quiz may have written its history before progress hears of the result
      storeQuizResults([fresh, quizResult('react', 85, 'completed', 'attempt-old')]);
      storeQuizResults([quizResult('git', 88)]);

      const outcome = recordQuizResult(fresh, DAY_ONE);
      // React was already reached by the older attempt, so nothing is news
      expect(outcome.earned).toEqual([]);
      expect(Object.keys(outcome.record.milestones).sort()).toEqual([
        'exercises:datastructures',
        'quiz:git',
        'quiz:react',
      ]);
      expect(outcome.record.bestQuiz.react?.scorePercentage).toBe(90);
    });

    it("reports a new learner's first quiz even when the quiz stored it first", () => {
      const fresh = quizResult('react', 90, 'completed', 'attempt-now');
      storeQuizResults([fresh]);
      const outcome = recordQuizResult(fresh, DAY_ONE);
      expect(outcome.earned.map((milestone) => milestone.id)).toEqual(['quiz:react']);
      expect(syncProgress(DAY_TWO).earned).toEqual([]);
    });
  });

  describe('resetProgress', () => {
    it('keeps the code and clears the rest', () => {
      saveProgress({
        [ALL[0]]: { passed: true, solutionSeen: true, code: 'function kept() {}' },
        [ALL[1]]: { passed: true },
        [ALL[2]]: { solutionSeen: true },
        [ALL[3]]: { code: 'also kept' },
      });
      storeQuizResults([quizResult('react', 90)]);
      storeQuizResults([quizResult('bigo', 40)]);
      localStorage.setItem(getQuizStorageKeys('react').activeAttempt, '{"id":"in-progress"}');
      localStorage.setItem('unrelated', 'stays');
      syncProgress(DAY_ONE);
      expect(loadProgressRecord().milestones['quiz:react']).toBeDefined();

      resetProgress();

      expect(localStorage.getItem(PROGRESS_RECORD_STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem(getQuizStorageKeys('react').results)).toBeNull();
      expect(localStorage.getItem(getQuizStorageKeys('bigo').results)).toBeNull();
      expect(loadProgress()).toEqual({
        [ALL[0]]: { code: 'function kept() {}' },
        [ALL[3]]: { code: 'also kept' },
      });
      // A quiz in progress is not a result, and nothing else is touched
      expect(localStorage.getItem(getQuizStorageKeys('react').activeAttempt)).toBe(
        '{"id":"in-progress"}'
      );
      expect(localStorage.getItem('unrelated')).toBe('stays');

      // Nothing comes back
      expect(syncProgress(DAY_TWO)).toEqual({ record: emptyProgressRecord(), earned: [] });
    });
  });

  describe('change notification', () => {
    it('calls listeners when a milestone is earned, a quiz is recorded and on reset', () => {
      const listener = vi.fn();
      const stop = onProgressChange(listener);

      syncProgress(DAY_ONE);
      expect(listener).not.toHaveBeenCalled();

      pass(DATA_STRUCTURES);
      syncProgress(DAY_TWO);
      expect(listener).toHaveBeenCalledTimes(1);

      // Nothing new: a listener that syncs again does not loop
      syncProgress(DAY_TWO);
      expect(listener).toHaveBeenCalledTimes(1);

      recordQuizResult(quizResult('react', 50), DAY_TWO);
      expect(listener).toHaveBeenCalledTimes(2);

      resetProgress();
      expect(listener).toHaveBeenCalledTimes(3);

      stop();
      notifyProgressChanged();
      expect(listener).toHaveBeenCalledTimes(3);
    });

    it('reaches a plain `storage` listener, which is what the exercise lists use', () => {
      const keys: (string | null)[] = [];
      const listen = (event: StorageEvent): void => {
        keys.push(event.key);
      };
      window.addEventListener('storage', listen);
      resetProgress();
      notifyProgressChanged();
      window.removeEventListener('storage', listen);
      expect(keys).toEqual([PROGRESS_STORAGE_KEY, PROGRESS_RECORD_STORAGE_KEY]);
    });
  });

  it('never throws when storage throws on every read, write and removal', () => {
    for (const method of ['getItem', 'setItem', 'removeItem'] as const) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new Error('blocked');
      });
    }
    expect(syncProgress(DAY_ONE)).toEqual({ record: emptyProgressRecord(), earned: [] });
    const outcome = recordQuizResult(quizResult('react', 90), DAY_ONE);
    // The visit still has it in memory
    expect(outcome.earned.map((milestone) => milestone.id)).toEqual(['quiz:react']);
    expect(() => resetProgress()).not.toThrow();
  });
});
