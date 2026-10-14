import type { LearningModuleId } from '../shared/constants/moduleNavigation';

export type QuizDifficulty = 'intermediate' | 'advanced' | 'expert';
export type QuizQuestionType =
  | 'single-choice'
  | 'multi-select'
  | 'true-false'
  | 'ordering'
  | 'matching';

export interface QuizQuestionBase {
  id: string;
  type: QuizQuestionType;
  difficulty: QuizDifficulty;
  scenario: string;
  prompt: string;
  explanation: string;
  tags: string[];
  references: string[];
}

export interface QuizChoiceQuestion extends QuizQuestionBase {
  type: 'single-choice' | 'true-false';
  options: string[];
  correctAnswer: number;
}

export interface QuizMultiSelectQuestion extends QuizQuestionBase {
  type: 'multi-select';
  options: string[];
  correctAnswer: number[];
}

export interface QuizOrderingQuestion extends QuizQuestionBase {
  type: 'ordering';
  items: string[];
  correctAnswer: string[];
}

export interface QuizMatchingQuestion extends QuizQuestionBase {
  type: 'matching';
  premises: string[];
  responses: string[];
  correctAnswer: number[];
}

export type QuizQuestion =
  | QuizChoiceQuestion
  | QuizMultiSelectQuestion
  | QuizOrderingQuestion
  | QuizMatchingQuestion;

export type QuizStoredAnswer = number | number[] | string[];

export interface QuizBankFile {
  moduleId: LearningModuleId;
  moduleTitle: string;
  description: string;
  version: number;
  timeLimitMinutes: number;
  questionsPerAttempt: number;
  questions: QuizQuestion[];
}

/**
 * The order one question is shown in during an attempt: display position -> bank index.
 * For single-choice and multi-select it orders `options`, for matching it orders `responses`
 * (premises stay in order), and for ordering it is the starting order of `items`.
 * True/false questions have no entry and keep the bank order.
 */
export type QuizPresentationOrder = number[];

export interface QuizAttemptState {
  id: string;
  moduleId: LearningModuleId;
  bankVersion: number;
  questionIds: string[];
  /** Answers in the bank's own indices and strings, whatever order they were shown in. */
  answers: Record<string, QuizStoredAnswer>;
  /**
   * The presentation order per question id, drawn when the attempt is created. Attempts stored
   * before options were shuffled have none and are shown in bank order.
   */
  presentation?: Record<string, QuizPresentationOrder>;
  currentQuestionIndex: number;
  startedAt: string;
  expiresAt: string;
}

export interface QuizQuestionOutcome {
  questionId: string;
  isCorrect: boolean;
  selectedAnswer: QuizStoredAnswer | null;
}

/**
 * The result of one attempt: correct answers out of a total, a percentage and the time taken.
 * It carries no points and no tier (ADR 0005). Results stored by an earlier version of the site
 * still hold `points` and `performanceTier`; they are read as they are and those two are ignored.
 */
export interface QuizResultSummary {
  attemptId: string;
  moduleId: LearningModuleId;
  status: 'completed' | 'timed-out';
  startedAt: string;
  completedAt: string;
  elapsedSeconds: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  scorePercentage: number;
  questionOutcomes: QuizQuestionOutcome[];
}

export interface QuizReferenceLink {
  label: string;
  path: string;
}
