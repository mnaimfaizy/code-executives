import type {
  QuizAttemptState,
  QuizBankFile,
  QuizQuestion,
  QuizReferenceLink,
  QuizResultSummary,
  QuizStoredAnswer,
} from '../types/quiz';
import { getSectionPathByLabel } from '../shared/constants/moduleNavigation';
import type { LearningModuleId } from '../shared/constants/moduleNavigation';

const quizBankLoaders = import.meta.glob<QuizBankFile>('/quiz-banks/*.quiz.json', {
  import: 'default',
});

export const QUIZ_STORAGE_PREFIX = 'code-executives.quiz';
export const QUIZ_HISTORY_LIMIT = 8;

const PERFORMANCE_TIERS = [
  { minScore: 95, label: 'Executive Strategist' },
  { minScore: 85, label: 'Systems Thinker' },
  { minScore: 70, label: 'Scenario Navigator' },
  { minScore: 50, label: 'Concept Builder' },
  { minScore: 0, label: 'Needs Another Pass' },
] as const;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'number');

const hasBaseQuestionShape = (value: unknown): value is Omit<QuizQuestion, 'correctAnswer'> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.difficulty === 'string' &&
    typeof candidate.scenario === 'string' &&
    typeof candidate.prompt === 'string' &&
    typeof candidate.explanation === 'string' &&
    isStringArray(candidate.tags) &&
    isStringArray(candidate.references)
  );
};

export const isQuizQuestion = (value: unknown): value is QuizQuestion => {
  if (!hasBaseQuestionShape(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  switch (candidate.type) {
    case 'single-choice':
    case 'true-false':
      return isStringArray(candidate.options) && typeof candidate.correctAnswer === 'number';
    case 'multi-select':
      return isStringArray(candidate.options) && isNumberArray(candidate.correctAnswer);
    case 'ordering':
      return isStringArray(candidate.items) && isStringArray(candidate.correctAnswer);
    case 'matching':
      return (
        isStringArray(candidate.premises) &&
        isStringArray(candidate.responses) &&
        isNumberArray(candidate.correctAnswer)
      );
    default:
      return false;
  }
};

export const isQuizBankFile = (
  value: unknown,
  moduleId: LearningModuleId
): value is QuizBankFile => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    candidate.moduleId === moduleId &&
    typeof candidate.moduleTitle === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.version === 'number' &&
    typeof candidate.timeLimitMinutes === 'number' &&
    typeof candidate.questionsPerAttempt === 'number' &&
    Array.isArray(candidate.questions) &&
    candidate.questions.every((question) => isQuizQuestion(question))
  );
};

export const loadQuizBank = async (moduleId: LearningModuleId): Promise<QuizBankFile | null> => {
  const loader = quizBankLoaders[`/quiz-banks/${moduleId}.quiz.json`];
  if (!loader) {
    return null;
  }

  const bank = await loader();
  return isQuizBankFile(bank, moduleId) ? bank : null;
};

export const getQuizStorageKeys = (moduleId: LearningModuleId) => ({
  activeAttempt: `${QUIZ_STORAGE_PREFIX}.${moduleId}.active-attempt`,
  results: `${QUIZ_STORAGE_PREFIX}.${moduleId}.results`,
});

const sortNumberArray = (items: number[]): number[] =>
  [...items].sort((left, right) => left - right);

const arraysEqual = <T>(left: T[], right: T[]): boolean =>
  left.length === right.length && left.every((item, index) => item === right[index]);

export const isQuizAnswerComplete = (
  question: QuizQuestion,
  answer: QuizStoredAnswer | null | undefined
): boolean => {
  if (answer === null || answer === undefined) {
    return false;
  }

  switch (question.type) {
    case 'single-choice':
    case 'true-false':
      return typeof answer === 'number';
    case 'multi-select':
      return isNumberArray(answer) && answer.length > 0;
    case 'ordering':
      return isStringArray(answer) && answer.length === question.items.length;
    case 'matching':
      return (
        isNumberArray(answer) &&
        answer.length === question.premises.length &&
        answer.every((item) => item >= 0)
      );
    default:
      return false;
  }
};

export const isCorrectQuizAnswer = (
  question: QuizQuestion,
  answer: QuizStoredAnswer | null | undefined
): boolean => {
  if (!isQuizAnswerComplete(question, answer)) {
    return false;
  }

  switch (question.type) {
    case 'single-choice':
    case 'true-false':
      return typeof answer === 'number' && question.correctAnswer === answer;
    case 'multi-select':
      return (
        isNumberArray(answer) &&
        arraysEqual(sortNumberArray(question.correctAnswer), sortNumberArray(answer))
      );
    case 'ordering':
      return isStringArray(answer) && arraysEqual(question.correctAnswer, answer);
    case 'matching':
      return isNumberArray(answer) && arraysEqual(question.correctAnswer, answer);
    default:
      return false;
  }
};

export const formatRemainingTime = (remainingSeconds: number): string => {
  const safeSeconds = Math.max(0, remainingSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const getPerformanceTier = (scorePercentage: number): string =>
  PERFORMANCE_TIERS.find((tier) => scorePercentage >= tier.minScore)?.label ?? 'Needs Another Pass';

export const sampleQuizQuestionIds = (
  questions: QuizQuestion[],
  questionsPerAttempt: number
): string[] => {
  const questionIds = questions.map((question) => question.id);
  for (let index = questionIds.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [questionIds[index], questionIds[swapIndex]] = [questionIds[swapIndex], questionIds[index]];
  }

  return questionIds.slice(0, Math.min(questionsPerAttempt, questionIds.length));
};

export const createQuizAttempt = (
  moduleId: LearningModuleId,
  bank: QuizBankFile
): QuizAttemptState => {
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + bank.timeLimitMinutes * 60 * 1000);

  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${moduleId}-${startedAt.getTime()}`,
    moduleId,
    bankVersion: bank.version,
    questionIds: sampleQuizQuestionIds(bank.questions, bank.questionsPerAttempt),
    answers: {},
    currentQuestionIndex: 0,
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
};

export const createQuestionMap = (bank: QuizBankFile): Record<string, QuizQuestion> =>
  bank.questions.reduce<Record<string, QuizQuestion>>((accumulator, question) => {
    accumulator[question.id] = question;
    return accumulator;
  }, {});

export const buildQuizResult = (
  bank: QuizBankFile,
  attempt: QuizAttemptState,
  status: 'completed' | 'timed-out',
  completedAt: Date = new Date()
): QuizResultSummary => {
  const questionMap = createQuestionMap(bank);
  const questionOutcomes = attempt.questionIds.map((questionId) => {
    const question = questionMap[questionId];
    const selectedAnswer = attempt.answers[questionId] ?? null;

    return {
      questionId,
      isCorrect: question ? isCorrectQuizAnswer(question, selectedAnswer) : false,
      selectedAnswer,
    };
  });

  const answeredQuestions = questionOutcomes.filter(
    (outcome) => outcome.selectedAnswer !== null
  ).length;
  const correctAnswers = questionOutcomes.filter((outcome) => outcome.isCorrect).length;
  const totalQuestions = questionOutcomes.length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const scorePercentage =
    totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);
  const startedAt = new Date(attempt.startedAt);
  const elapsedSeconds = Math.max(
    0,
    Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)
  );
  const totalAllowedSeconds = bank.timeLimitMinutes * 60;
  const timeBonusRatio = Math.max(0, (totalAllowedSeconds - elapsedSeconds) / totalAllowedSeconds);
  const points = Math.round(correctAnswers * 120 + timeBonusRatio * 80);

  return {
    attemptId: attempt.id,
    moduleId: attempt.moduleId,
    status,
    startedAt: attempt.startedAt,
    completedAt: completedAt.toISOString(),
    elapsedSeconds,
    totalQuestions,
    answeredQuestions,
    correctAnswers,
    incorrectAnswers,
    scorePercentage,
    performanceTier: getPerformanceTier(scorePercentage),
    points,
    questionOutcomes,
  };
};

export const resolveQuizReferences = (
  moduleId: LearningModuleId,
  references: string[]
): QuizReferenceLink[] =>
  references
    .map((label) => {
      const path = getSectionPathByLabel(moduleId, label);
      return path ? { label, path } : null;
    })
    .filter((item): item is QuizReferenceLink => item !== null);

export const formatQuizAnswer = (
  question: QuizQuestion,
  answer: QuizStoredAnswer | null | undefined
): string => {
  if (!isQuizAnswerComplete(question, answer)) {
    return 'Not answered';
  }

  switch (question.type) {
    case 'single-choice':
    case 'true-false':
      return typeof answer === 'number'
        ? (question.options[answer] ?? 'Unknown choice')
        : 'Not answered';
    case 'multi-select':
      return isNumberArray(answer)
        ? answer.map((index: number) => question.options[index] ?? 'Unknown choice').join(', ')
        : 'Not answered';
    case 'ordering':
      return isStringArray(answer) ? answer.join(' -> ') : 'Not answered';
    case 'matching':
      return isNumberArray(answer)
        ? answer
            .map((responseIndex: number, premiseIndex: number) => {
              const premise = question.premises[premiseIndex] ?? `Pair ${premiseIndex + 1}`;
              const response = question.responses[responseIndex] ?? 'Unmatched';
              return `${premise}: ${response}`;
            })
            .join(' | ')
        : 'Not answered';
    default:
      return 'Not answered';
  }
};
