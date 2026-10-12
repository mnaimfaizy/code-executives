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

export interface QuizAttemptState {
  id: string;
  moduleId: LearningModuleId;
  bankVersion: number;
  questionIds: string[];
  answers: Record<string, QuizStoredAnswer>;
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
