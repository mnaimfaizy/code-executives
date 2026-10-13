import { describe, expect, it } from 'vitest';
import type { QuizAttemptState, QuizBankFile } from '../types/quiz';
import { learningModuleIds } from '../shared/constants/moduleNavigation';
import { hasQuizBank } from '../shared/constants/quizBanks';
import * as quiz from './quiz';
import { buildQuizResult, modulesWithQuiz } from './quiz';

const bank: QuizBankFile = {
  moduleId: 'javascript',
  moduleTitle: 'JavaScript',
  description: 'A bank for the test',
  version: 1,
  timeLimitMinutes: 10,
  questionsPerAttempt: 4,
  questions: ['q1', 'q2', 'q3', 'q4'].map((id) => ({
    id,
    type: 'single-choice' as const,
    difficulty: 'advanced' as const,
    scenario: '',
    prompt: id,
    explanation: '',
    tags: [],
    references: [],
    options: ['a', 'b'],
    correctAnswer: 0,
  })),
};

const attempt: QuizAttemptState = {
  id: 'attempt-1',
  moduleId: 'javascript',
  bankVersion: 1,
  questionIds: ['q1', 'q2', 'q3', 'q4'],
  answers: { q1: 0, q2: 0, q3: 0, q4: 1 },
  currentQuestionIndex: 3,
  startedAt: '2026-09-01T10:00:00.000Z',
  expiresAt: '2026-09-01T10:10:00.000Z',
};

describe('buildQuizResult', () => {
  it('holds the correct answers, the percentage and the time taken', () => {
    const result = buildQuizResult(
      bank,
      attempt,
      'completed',
      new Date('2026-09-01T10:02:30.000Z')
    );

    expect(result).toMatchObject({
      attemptId: 'attempt-1',
      status: 'completed',
      totalQuestions: 4,
      answeredQuestions: 4,
      correctAnswers: 3,
      incorrectAnswers: 1,
      scorePercentage: 75,
      elapsedSeconds: 150,
    });
  });

  it('produces no points and no tier, however fast the attempt was', () => {
    const fast = buildQuizResult(bank, attempt, 'completed', new Date('2026-09-01T10:00:01.000Z'));
    const slow = buildQuizResult(bank, attempt, 'completed', new Date('2026-09-01T10:09:59.000Z'));

    for (const result of [fast, slow]) {
      expect(Object.keys(result).join(' ')).not.toMatch(/points|tier|level|bonus/i);
    }
    // Time is recorded, and it changes nothing else about the result
    expect({ ...fast, elapsedSeconds: 0, completedAt: '' }).toEqual({
      ...slow,
      elapsedSeconds: 0,
      completedAt: '',
    });
  });

  it('exports nothing that works out a tier', () => {
    expect(Object.keys(quiz).join(' ')).not.toMatch(/tier|points/i);
  });
});

describe('modulesWithQuiz', () => {
  it('is the modules that have a bank file, in module order', () => {
    expect(modulesWithQuiz()).toEqual(learningModuleIds.filter((id) => hasQuizBank(id)));
    expect(modulesWithQuiz()).toContain('javascript');
  });
});
