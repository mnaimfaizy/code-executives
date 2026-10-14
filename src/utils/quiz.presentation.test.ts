import { describe, expect, it } from 'vitest';
import type {
  QuizAttemptState,
  QuizBankFile,
  QuizChoiceQuestion,
  QuizOrderingQuestion,
  QuizQuestion,
  QuizStoredAnswer,
} from '../types/quiz';
import { quizBankLoaders } from '../shared/constants/quizBanks';
import {
  buildQuizResult,
  createQuestionPresentation,
  createQuizAttempt,
  getPresentationOrder,
  hasReadableQuizPresentation,
} from './quiz';

/** A seeded random source (mulberry32), so every shuffle in these tests is repeatable */
const seeded = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

const base = {
  difficulty: 'advanced' as const,
  scenario: '',
  prompt: '',
  explanation: '',
  tags: [],
  references: [],
};

const questions: QuizQuestion[] = [
  { ...base, id: 'single', type: 'single-choice', options: ['a', 'b', 'c', 'd'], correctAnswer: 0 },
  {
    ...base,
    id: 'multi',
    type: 'multi-select',
    options: ['a', 'b', 'c', 'd', 'e'],
    correctAnswer: [0, 2],
  },
  { ...base, id: 'tf', type: 'true-false', options: ['True', 'False'], correctAnswer: 0 },
  {
    ...base,
    id: 'order',
    type: 'ordering',
    items: ['one', 'two', 'three', 'four'],
    correctAnswer: ['one', 'two', 'three', 'four'],
  },
  {
    ...base,
    id: 'order-2',
    type: 'ordering',
    items: ['first', 'second'],
    correctAnswer: ['first', 'second'],
  },
  {
    ...base,
    id: 'match',
    type: 'matching',
    premises: ['p1', 'p2', 'p3'],
    responses: ['r1', 'r2', 'r3'],
    correctAnswer: [0, 1, 2],
  },
];

const bank: QuizBankFile = {
  moduleId: 'javascript',
  moduleTitle: 'JavaScript',
  description: 'A bank for the test',
  version: 1,
  timeLimitMinutes: 10,
  questionsPerAttempt: questions.length,
  questions,
};

const sorted = (items: number[]) => [...items].sort((left, right) => left - right);

describe('presentation order', () => {
  it('is a permutation of the options, responses or items, and true/false keeps its order', () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const presentation = createQuizAttempt('javascript', bank, seeded(seed)).presentation!;
      expect(presentation).not.toHaveProperty('tf');
      expect(sorted(presentation.single)).toEqual([0, 1, 2, 3]);
      expect(sorted(presentation.multi)).toEqual([0, 1, 2, 3, 4]);
      expect(sorted(presentation.order)).toEqual([0, 1, 2, 3]);
      expect(sorted(presentation['order-2'])).toEqual([0, 1]);
      expect(sorted(presentation.match)).toEqual([0, 1, 2]);
    }
  });

  it('never starts an ordering question in its correct order', () => {
    const ordering = questions.filter(
      (question): question is QuizOrderingQuestion => question.type === 'ordering'
    );
    for (const question of ordering) {
      for (let seed = 1; seed <= 200; seed += 1) {
        const order = createQuestionPresentation(question, seeded(seed))!;
        expect(order.map((index) => question.items[index])).not.toEqual(question.correctAnswer);
      }
      // Even a random source whose shuffle leaves every item where it is
      const order = createQuestionPresentation(question, () => 0.999999)!;
      expect(order.map((index) => question.items[index])).not.toEqual(question.correctAnswer);
    }
  });

  it('is the same for the same random source', () => {
    const left = createQuizAttempt('javascript', bank, seeded(7));
    const right = createQuizAttempt('javascript', bank, seeded(7));
    expect(left.questionIds).toEqual(right.questionIds);
    expect(left.presentation).toEqual(right.presentation);
  });

  it('falls back to bank order when there is none, or the entry is malformed', () => {
    const [single] = questions;
    expect(getPresentationOrder(single, undefined)).toEqual([0, 1, 2, 3]);
    expect(getPresentationOrder(single, { single: [0, 0, 1, 2] })).toEqual([0, 1, 2, 3]);
    expect(getPresentationOrder(single, { single: [3, 1] })).toEqual([0, 1, 2, 3]);
    expect(getPresentationOrder(single, { single: [3, 1, 0, 2] })).toEqual([3, 1, 0, 2]);
    expect(hasReadableQuizPresentation({})).toBe(true);
    expect(hasReadableQuizPresentation({ presentation: { single: [1, 0] } })).toBe(true);
    expect(hasReadableQuizPresentation({ presentation: [1, 0] })).toBe(false);
    expect(hasReadableQuizPresentation({ presentation: { single: 'no' } })).toBe(false);
  });

  it('scores the same whether answers are given through the shuffled display or directly', () => {
    const completedAt = new Date(Date.now() + 60_000);
    for (let seed = 1; seed <= 30; seed += 1) {
      const attempt = createQuizAttempt('javascript', bank, seeded(seed));

      const direct: Record<string, QuizStoredAnswer> = Object.fromEntries(
        questions.map((question) => [question.id, question.correctAnswer])
      );

      // Through the display: pick each correct entry by its display position, as a learner
      // clicking it would, and map the position back to the bank index as the renderer does
      const viaDisplay: Record<string, QuizStoredAnswer> = {};
      for (const question of questions) {
        const order = getPresentationOrder(question, attempt.presentation);
        const positionOf = (bankIndex: number) => order.indexOf(bankIndex);
        switch (question.type) {
          case 'single-choice':
          case 'true-false':
            viaDisplay[question.id] = order[positionOf(question.correctAnswer)];
            break;
          case 'multi-select':
          case 'matching':
            viaDisplay[question.id] = question.correctAnswer.map(
              (index) => order[positionOf(index)]
            );
            break;
          case 'ordering': {
            // Start from the displayed order and move items into place
            const shown = order.map((index) => question.items[index]);
            viaDisplay[question.id] = [...shown].sort(
              (left, right) =>
                question.correctAnswer.indexOf(left) - question.correctAnswer.indexOf(right)
            );
            break;
          }
        }
      }

      const shuffledResult = buildQuizResult(
        bank,
        { ...attempt, answers: viaDisplay },
        'completed',
        completedAt
      );
      const directResult = buildQuizResult(
        bank,
        { ...attempt, answers: direct },
        'completed',
        completedAt
      );
      expect(shuffledResult).toEqual(directResult);
      expect(shuffledResult.scorePercentage).toBe(100);
    }
  });

  it('scores an untouched ordering question as unanswered, as before shuffling', () => {
    const attempt = createQuizAttempt('javascript', bank, seeded(3));
    const result = buildQuizResult(bank, attempt, 'completed');
    expect(result.questionOutcomes.find((item) => item.questionId === 'order')).toEqual({
      questionId: 'order',
      isCorrect: false,
      selectedAnswer: null,
    });
  });

  it('reads and scores an attempt stored before shuffling, in bank order', () => {
    const old: QuizAttemptState = {
      id: 'old',
      moduleId: 'javascript',
      bankVersion: 1,
      questionIds: ['single', 'multi', 'match'],
      answers: { single: 0, multi: [2, 0], match: [0, 2, 1] },
      currentQuestionIndex: 0,
      startedAt: '2026-09-01T10:00:00.000Z',
      expiresAt: '2026-09-01T10:10:00.000Z',
    };
    expect(hasReadableQuizPresentation(old)).toBe(true);
    expect(getPresentationOrder(questions[0], old.presentation)).toEqual([0, 1, 2, 3]);
    expect(getPresentationOrder(questions[5], old.presentation)).toEqual([0, 1, 2]);
    const result = buildQuizResult(bank, old, 'completed');
    expect(result.correctAnswers).toBe(2);
    expect(result.answeredQuestions).toBe(3);
  });
});

describe('presentation order over every real bank', () => {
  const banks = Object.entries(quizBankLoaders);

  it('has banks to check', () => {
    expect(banks.length).toBeGreaterThan(0);
  });

  it.each(banks)(
    '%s: no single-choice answer always sits at display position 0',
    async (_path, load) => {
      const realBank = await load();
      const singles = realBank.questions.filter(
        (question): question is QuizChoiceQuestion => question.type === 'single-choice'
      );
      for (const question of singles) {
        const positions = new Set<number>();
        for (let seed = 1; seed <= 20; seed += 1) {
          const order = createQuestionPresentation(question, seeded(seed))!;
          positions.add(order.indexOf(question.correctAnswer));
        }
        expect(positions.size, question.id).toBeGreaterThan(1);
      }

      for (const question of realBank.questions) {
        if (question.type !== 'ordering') continue;
        for (let seed = 1; seed <= 20; seed += 1) {
          const order = createQuestionPresentation(question, seeded(seed))!;
          expect(
            order.map((index) => question.items[index]),
            question.id
          ).not.toEqual(question.correctAnswer);
        }
      }
    }
  );
});
