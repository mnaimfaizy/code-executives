import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PROGRESS_RECORD_STORAGE_KEY,
  emptyProgressRecord,
  loadProgressRecord,
  readStoredProgressRecord,
  saveProgressRecord,
  type ProgressRecord,
} from './progressRecord';

const DAY = '2026-10-12T09:00:00.000Z';

describe('progress record', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is under one key', () => {
    expect(PROGRESS_RECORD_STORAGE_KEY).toBe('code-executives.progress');
  });

  it('tells nothing stored yet from stored but empty', () => {
    expect(readStoredProgressRecord()).toBeNull();
    expect(loadProgressRecord()).toEqual(emptyProgressRecord());

    saveProgressRecord(emptyProgressRecord());
    expect(readStoredProgressRecord()).toEqual({ milestones: {}, bestQuiz: {} });
  });

  it('reads back what it wrote', () => {
    const record: ProgressRecord = {
      milestones: {
        'exercises:datastructures': { earnedAt: DAY, exerciseIds: ['two-sum', 'valid-parentheses'] },
        'quiz:react': { earnedAt: DAY },
      },
      bestQuiz: { react: { scorePercentage: 90, completedAt: DAY } },
    };
    saveProgressRecord(record);
    expect(loadProgressRecord()).toEqual(record);
  });

  it('treats stored data that is not a record as nothing stored', () => {
    for (const stored of ['not json', '[1,2]', '7', 'null', '"text"']) {
      localStorage.setItem(PROGRESS_RECORD_STORAGE_KEY, stored);
      expect(readStoredProgressRecord()).toBeNull();
      expect(loadProgressRecord()).toEqual(emptyProgressRecord());
    }
  });

  it('keeps only the fields that are what it wrote', () => {
    localStorage.setItem(
      PROGRESS_RECORD_STORAGE_KEY,
      JSON.stringify({
        milestones: {
          good: { earnedAt: DAY, exerciseIds: ['a'], points: 50 },
          badIds: { earnedAt: DAY, exerciseIds: ['a', 2] },
          noDate: { exerciseIds: ['a'] },
          notADate: { earnedAt: 'yesterday-ish' },
          nothing: null,
        },
        bestQuiz: {
          react: { scorePercentage: 85, completedAt: DAY, streak: 3 },
          git: { scorePercentage: '85', completedAt: DAY },
          rxjs: { scorePercentage: 850, completedAt: DAY },
          python: { scorePercentage: 85 },
          notAModule: { scorePercentage: 85, completedAt: DAY },
        },
        level: 4,
      })
    );
    expect(loadProgressRecord()).toEqual({
      milestones: { good: { earnedAt: DAY, exerciseIds: ['a'] }, badIds: { earnedAt: DAY } },
      bestQuiz: { react: { scorePercentage: 85, completedAt: DAY } },
    });

    localStorage.setItem(
      PROGRESS_RECORD_STORAGE_KEY,
      JSON.stringify({ milestones: [], bestQuiz: 'none' })
    );
    expect(loadProgressRecord()).toEqual(emptyProgressRecord());
  });

  it('never throws when storage throws on every read and write', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readStoredProgressRecord()).toBeNull();
    expect(loadProgressRecord()).toEqual(emptyProgressRecord());
    expect(() => saveProgressRecord(emptyProgressRecord())).not.toThrow();
  });
});
