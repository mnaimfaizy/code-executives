import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { QuizAttemptState, QuizResultSummary } from '../../types/quiz';
import { getQuizStorageKeys } from '../../utils/quiz';
import * as progress from '../progress';
import { useQuizSession } from './useQuizSession';

const MODULE = 'javascript' as const;
const MILESTONE_ID = `quiz:${MODULE}`;
const keys = getQuizStorageKeys(MODULE);

const storedResults = (): QuizResultSummary[] =>
  JSON.parse(localStorage.getItem(keys.results) ?? '[]') as QuizResultSummary[];

/** A quiz whose bank is loaded and whose stored state is read */
async function openQuiz() {
  const rendered = renderHook(() => useQuizSession(MODULE));
  await waitFor(() => expect(rendered.result.current.isLoading).toBe(false));
  return rendered;
}

type Quiz = Awaited<ReturnType<typeof openQuiz>>['result'];

/** Start an attempt, answer `correct` of its questions rightly, and submit it */
function takeAttempt(quiz: Quiz, correct: 'all' | 'none'): void {
  act(() => quiz.current.startAttempt());
  if (correct === 'all') {
    act(() => {
      for (const question of quiz.current.questionsForAttempt) {
        quiz.current.updateAnswer(question.id, question.correctAnswer);
      }
    });
  }
  act(() => quiz.current.submitAttempt());
}

describe('useQuizSession and progress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('records a completed attempt once and reports the milestone it earned', async () => {
    const record = vi.spyOn(progress, 'recordQuizResult');
    const { result } = await openQuiz();
    expect(result.current.milestonesReached).toEqual([]);

    takeAttempt(result, 'all');

    expect(result.current.latestResult?.scorePercentage).toBe(100);
    expect(result.current.milestonesReached.map((milestone) => milestone.id)).toEqual([
      MILESTONE_ID,
    ]);
    expect(progress.readStoredProgressRecord()?.milestones[MILESTONE_ID]).toBeDefined();
    expect(progress.readStoredProgressRecord()?.bestQuiz[MODULE]?.scorePercentage).toBe(100);
    // The result is in the quiz's own history too, once
    expect(storedResults()).toHaveLength(1);
    await waitFor(() => expect(storedResults()[0].attemptId).toBeDefined());
    expect(record).toHaveBeenCalledTimes(1);
  });

  it('does not report the milestone again on a reload', async () => {
    const first = await openQuiz();
    takeAttempt(first.result, 'all');
    expect(first.result.current.milestonesReached).toHaveLength(1);
    first.unmount();

    const record = vi.spyOn(progress, 'recordQuizResult');
    const second = await openQuiz();
    expect(second.result.current.latestResult?.scorePercentage).toBe(100);
    expect(second.result.current.milestonesReached).toEqual([]);
    expect(record).not.toHaveBeenCalled();
  });

  it('reports nothing for a score below the mark, and nothing for a milestone already earned', async () => {
    const { result } = await openQuiz();
    takeAttempt(result, 'none');
    expect(result.current.latestResult?.scorePercentage).toBe(0);
    expect(result.current.milestonesReached).toEqual([]);
    expect(progress.readStoredProgressRecord()?.bestQuiz[MODULE]?.scorePercentage).toBe(0);

    takeAttempt(result, 'all');
    expect(result.current.milestonesReached).toHaveLength(1);

    // A second good attempt: the milestone is kept, not announced again
    takeAttempt(result, 'all');
    expect(result.current.milestonesReached).toEqual([]);
    expect(storedResults()).toHaveLength(3);
  });

  it('records an attempt that ran out of time while the page was closed, once, and it earns nothing', async () => {
    const first = await openQuiz();
    act(() => first.result.current.startAttempt());
    act(() => {
      for (const question of first.result.current.questionsForAttempt) {
        first.result.current.updateAnswer(question.id, question.correctAnswer);
      }
    });
    await waitFor(() => expect(localStorage.getItem(keys.activeAttempt)).not.toBeNull());
    first.unmount();

    const attempt = JSON.parse(localStorage.getItem(keys.activeAttempt)!) as QuizAttemptState;
    localStorage.setItem(
      keys.activeAttempt,
      JSON.stringify({ ...attempt, expiresAt: new Date(Date.now() - 1000).toISOString() })
    );

    const record = vi.spyOn(progress, 'recordQuizResult');
    const second = await openQuiz();
    await waitFor(() => expect(second.result.current.latestResult?.status).toBe('timed-out'));
    expect(record).toHaveBeenCalledTimes(1);
    expect(second.result.current.milestonesReached).toEqual([]);
    expect(progress.readStoredProgressRecord()?.milestones[MILESTONE_ID]).toBeUndefined();
    second.unmount();

    // Nothing is left to record on the next visit
    record.mockClear();
    const third = await openQuiz();
    expect(third.result.current.recentResults).toHaveLength(1);
    expect(record).not.toHaveBeenCalled();
  });

  it('drops the results it holds when progress is cleared, here or in another tab', async () => {
    const { result } = await openQuiz();
    takeAttempt(result, 'all');
    expect(result.current.recentResults).toHaveLength(1);

    act(() => progress.resetProgress());

    expect(result.current.recentResults).toEqual([]);
    expect(result.current.latestResult).toBeNull();
    expect(result.current.milestonesReached).toEqual([]);
    // What it held is not written back
    await waitFor(() => expect(storedResults()).toEqual([]));
    expect(progress.readStoredProgressRecord()).toBeNull();
  });
});
