import type {
  QuizAttemptState,
  QuizBankFile,
  QuizQuestion,
  QuizReferenceLink,
  QuizResultSummary,
  QuizStoredAnswer,
} from '../types/quiz';
import { getSectionPathByLabel, learningModuleIds } from '../shared/constants/moduleNavigation';
import type { LearningModuleId } from '../shared/constants/moduleNavigation';
import { hasQuizBank, quizBankLoaders, quizBankPath } from '../shared/constants/quizBanks';

export const QUIZ_STORAGE_PREFIX = 'code-executives.quiz';
export const QUIZ_HISTORY_LIMIT = 8;

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
  const loader = quizBankLoaders[quizBankPath(moduleId)];
  if (!loader) {
    return null;
  }

  const bank = await loader();
  return isQuizBankFile(bank, moduleId) ? bank : null;
};

/** The modules that have a quiz bank in `quiz-banks/`, in module order. Not every module has one. */
export const modulesWithQuiz = (): LearningModuleId[] => learningModuleIds.filter(hasQuizBank);

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

/** A random number in [0, 1), like `Math.random`. Injected so tests can be deterministic. */
export type QuizRandomSource = () => number;

/** Fisher-Yates shuffle of a copy of `items`. */
const shuffle = <T>(items: T[], random: QuizRandomSource): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const identityOrder = (length: number): number[] => Array.from({ length }, (_, index) => index);

export const sampleQuizQuestionIds = (
  questions: QuizQuestion[],
  questionsPerAttempt: number,
  random: QuizRandomSource = Math.random
): string[] => {
  const questionIds = shuffle(
    questions.map((question) => question.id),
    random
  );
  return questionIds.slice(0, Math.min(questionsPerAttempt, questionIds.length));
};

/** How many entries a question's presentation order covers, or null when it keeps bank order. */
const presentationLength = (question: QuizQuestion): number | null => {
  switch (question.type) {
    case 'single-choice':
    case 'multi-select':
      return question.options.length;
    case 'matching':
      return question.responses.length;
    case 'ordering':
      return question.items.length;
    default:
      return null;
  }
};

/**
 * Draws the order a question is shown in for one attempt: display position -> bank index.
 * Null for true/false, which keeps its order. An ordering question with 2 or more items never
 * starts in its correct order.
 */
export const createQuestionPresentation = (
  question: QuizQuestion,
  random: QuizRandomSource = Math.random
): number[] | null => {
  const length = presentationLength(question);
  if (length === null) {
    return null;
  }

  const order = shuffle(identityOrder(length), random);
  if (question.type !== 'ordering' || length < 2) {
    return order;
  }

  // Rotate until the starting order differs from the correct one. With distinct items the
  // first rotation already does; the loop also covers repeated item texts.
  const isCorrect = (candidate: number[]) =>
    arraysEqual(
      candidate.map((index) => question.items[index]),
      question.correctAnswer
    );
  let candidate = order;
  for (let turn = 0; turn < length && isCorrect(candidate); turn += 1) {
    candidate = [...candidate.slice(1), candidate[0]];
  }
  return candidate;
};

const isPermutation = (value: unknown, length: number): value is number[] =>
  isNumberArray(value) &&
  value.length === length &&
  new Set(value).size === length &&
  value.every((index) => Number.isInteger(index) && index >= 0 && index < length);

/**
 * The order to show a question in: the attempt's presentation order when it holds a valid one
 * for this question, otherwise bank order (attempts stored before shuffling, true/false).
 */
export const getPresentationOrder = (
  question: QuizQuestion,
  presentation: Record<string, number[]> | undefined
): number[] => {
  const length = presentationLength(question);
  if (length === null) {
    return question.type === 'true-false' ? identityOrder(question.options.length) : [];
  }
  const order = presentation?.[question.id];
  return isPermutation(order, length) ? order : identityOrder(length);
};

/**
 * Whether a stored attempt's `presentation` can be read: absent (an attempt stored before
 * shuffling) or an object of number arrays. A malformed entry is shown in bank order.
 */
export const hasReadableQuizPresentation = (attempt: { presentation?: unknown }): boolean => {
  const { presentation } = attempt;
  if (presentation === undefined) {
    return true;
  }
  return (
    typeof presentation === 'object' &&
    presentation !== null &&
    !Array.isArray(presentation) &&
    Object.values(presentation).every((order) => isNumberArray(order))
  );
};

export const createQuizAttempt = (
  moduleId: LearningModuleId,
  bank: QuizBankFile,
  random: QuizRandomSource = Math.random
): QuizAttemptState => {
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + bank.timeLimitMinutes * 60 * 1000);
  const questionIds = sampleQuizQuestionIds(bank.questions, bank.questionsPerAttempt, random);
  const questionMap = createQuestionMap(bank);
  const presentation: Record<string, number[]> = {};
  for (const questionId of questionIds) {
    const order = createQuestionPresentation(questionMap[questionId], random);
    if (order) {
      presentation[questionId] = order;
    }
  }

  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${moduleId}-${startedAt.getTime()}`,
    moduleId,
    bankVersion: bank.version,
    questionIds,
    presentation,
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
