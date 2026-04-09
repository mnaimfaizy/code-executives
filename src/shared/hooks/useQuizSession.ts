import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LearningModuleId } from '../constants/moduleNavigation';
import type {
  QuizAttemptState,
  QuizBankFile,
  QuizQuestion,
  QuizResultSummary,
  QuizStoredAnswer,
} from '../../types/quiz';
import {
  QUIZ_HISTORY_LIMIT,
  buildQuizResult,
  createQuestionMap,
  createQuizAttempt,
  getQuizStorageKeys,
  isQuizAnswerComplete,
  loadQuizBank,
} from '../../utils/quiz';

interface UseQuizSessionResult {
  bank: QuizBankFile | null;
  isLoading: boolean;
  loadError: string | null;
  activeAttempt: QuizAttemptState | null;
  questionsForAttempt: QuizQuestion[];
  currentQuestion: QuizQuestion | null;
  currentQuestionIndex: number;
  answeredQuestions: number;
  remainingSeconds: number;
  recentResults: QuizResultSummary[];
  latestResult: QuizResultSummary | null;
  startAttempt: () => void;
  restartAttempt: () => void;
  submitAttempt: () => void;
  goToQuestion: (index: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  updateAnswer: (questionId: string, answer: QuizStoredAnswer) => void;
  getAnswer: (questionId: string) => QuizStoredAnswer | null;
}

const safeParse = <T,>(value: string | null): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const useQuizSession = (moduleId: LearningModuleId): UseQuizSessionResult => {
  const [bank, setBank] = useState<QuizBankFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<QuizAttemptState | null>(null);
  const [recentResults, setRecentResults] = useState<QuizResultSummary[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [hasHydrated, setHasHydrated] = useState(false);

  const storageKeys = useMemo(() => getQuizStorageKeys(moduleId), [moduleId]);

  const questionMap = useMemo(() => (bank ? createQuestionMap(bank) : {}), [bank]);

  const finalizeAttempt = useCallback(
    (status: 'completed' | 'timed-out') => {
      if (!bank || !activeAttempt) {
        return;
      }

      const result = buildQuizResult(bank, activeAttempt, status);
      setRecentResults((previousResults) =>
        [result, ...previousResults.filter((item) => item.attemptId !== result.attemptId)].slice(
          0,
          QUIZ_HISTORY_LIMIT
        )
      );
      setActiveAttempt(null);
      setRemainingSeconds(bank.timeLimitMinutes * 60);
    },
    [activeAttempt, bank]
  );

  useEffect(() => {
    let isCancelled = false;

    const fetchQuizBank = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const loadedBank = await loadQuizBank(moduleId);
        if (isCancelled) {
          return;
        }

        if (!loadedBank) {
          setBank(null);
          setLoadError('Quiz bank is missing or invalid for this module.');
        } else {
          setBank(loadedBank);
          setRemainingSeconds(loadedBank.timeLimitMinutes * 60);
        }
      } catch {
        if (!isCancelled) {
          setBank(null);
          setLoadError('Quiz bank could not be loaded for this module.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchQuizBank();

    return () => {
      isCancelled = true;
    };
  }, [moduleId]);

  useEffect(() => {
    if (!bank) {
      return;
    }

    const storedResults = safeParse<QuizResultSummary[]>(localStorage.getItem(storageKeys.results));
    const initialResults = Array.isArray(storedResults) ? storedResults : [];

    const storedAttempt = safeParse<QuizAttemptState>(localStorage.getItem(storageKeys.activeAttempt));
    if (
      storedAttempt &&
      storedAttempt.bankVersion === bank.version &&
      storedAttempt.questionIds.every((questionId) => Boolean(questionMap[questionId]))
    ) {
      const expiresAt = new Date(storedAttempt.expiresAt).getTime();
      if (expiresAt <= Date.now()) {
        const timedOutResult = buildQuizResult(bank, storedAttempt, 'timed-out');
        setRecentResults(
          [timedOutResult, ...initialResults.filter((item) => item.attemptId !== timedOutResult.attemptId)].slice(
            0,
            QUIZ_HISTORY_LIMIT
          )
        );
        localStorage.removeItem(storageKeys.activeAttempt);
        setActiveAttempt(null);
      } else {
        setRecentResults(initialResults);
        setActiveAttempt(storedAttempt);
      }
    } else {
      setRecentResults(initialResults);
      localStorage.removeItem(storageKeys.activeAttempt);
      setActiveAttempt(null);
    }

    setHasHydrated(true);
  }, [bank, questionMap, storageKeys.activeAttempt, storageKeys.results]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!activeAttempt) {
      localStorage.removeItem(storageKeys.activeAttempt);
      return;
    }

    localStorage.setItem(storageKeys.activeAttempt, JSON.stringify(activeAttempt));
  }, [activeAttempt, hasHydrated, storageKeys.activeAttempt]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    localStorage.setItem(storageKeys.results, JSON.stringify(recentResults));
  }, [hasHydrated, recentResults, storageKeys.results]);

  useEffect(() => {
    if (!activeAttempt || !bank) {
      return;
    }

    const updateRemainingTime = () => {
      const nextRemainingSeconds = Math.max(
        0,
        Math.round((new Date(activeAttempt.expiresAt).getTime() - Date.now()) / 1000)
      );

      setRemainingSeconds(nextRemainingSeconds);
      if (nextRemainingSeconds <= 0) {
        finalizeAttempt('timed-out');
      }
    };

    updateRemainingTime();
    const timerId = window.setInterval(updateRemainingTime, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [activeAttempt, bank, finalizeAttempt]);

  const questionsForAttempt = useMemo(
    () =>
      activeAttempt
        ? activeAttempt.questionIds
            .map((questionId) => questionMap[questionId])
            .filter((question): question is QuizQuestion => Boolean(question))
        : [],
    [activeAttempt, questionMap]
  );

  const currentQuestion = useMemo(() => {
    if (!activeAttempt) {
      return null;
    }

    return questionMap[activeAttempt.questionIds[activeAttempt.currentQuestionIndex]] ?? null;
  }, [activeAttempt, questionMap]);

  const answeredQuestions = useMemo(() => {
    if (!activeAttempt) {
      return 0;
    }

    return activeAttempt.questionIds.reduce((count, questionId) => {
      const question = questionMap[questionId];
      const answer = activeAttempt.answers[questionId];
      return question && isQuizAnswerComplete(question, answer) ? count + 1 : count;
    }, 0);
  }, [activeAttempt, questionMap]);

  const startAttempt = useCallback(() => {
    if (!bank) {
      return;
    }

    const nextAttempt = createQuizAttempt(moduleId, bank);
    setActiveAttempt(nextAttempt);
    setRemainingSeconds(bank.timeLimitMinutes * 60);
  }, [bank, moduleId]);

  const restartAttempt = useCallback(() => {
    startAttempt();
  }, [startAttempt]);

  const submitAttempt = useCallback(() => {
    finalizeAttempt('completed');
  }, [finalizeAttempt]);

  const goToQuestion = useCallback((index: number) => {
    setActiveAttempt((previousAttempt) => {
      if (!previousAttempt) {
        return previousAttempt;
      }

      const nextIndex = Math.max(0, Math.min(index, previousAttempt.questionIds.length - 1));
      return { ...previousAttempt, currentQuestionIndex: nextIndex };
    });
  }, []);

  const goToNextQuestion = useCallback(() => {
    setActiveAttempt((previousAttempt) => {
      if (!previousAttempt) {
        return previousAttempt;
      }

      return {
        ...previousAttempt,
        currentQuestionIndex: Math.min(
          previousAttempt.currentQuestionIndex + 1,
          previousAttempt.questionIds.length - 1
        ),
      };
    });
  }, []);

  const goToPreviousQuestion = useCallback(() => {
    setActiveAttempt((previousAttempt) => {
      if (!previousAttempt) {
        return previousAttempt;
      }

      return {
        ...previousAttempt,
        currentQuestionIndex: Math.max(previousAttempt.currentQuestionIndex - 1, 0),
      };
    });
  }, []);

  const updateAnswer = useCallback((questionId: string, answer: QuizStoredAnswer) => {
    setActiveAttempt((previousAttempt) => {
      if (!previousAttempt) {
        return previousAttempt;
      }

      return {
        ...previousAttempt,
        answers: {
          ...previousAttempt.answers,
          [questionId]: answer,
        },
      };
    });
  }, []);

  const getAnswer = useCallback(
    (questionId: string) => activeAttempt?.answers[questionId] ?? null,
    [activeAttempt]
  );

  return {
    bank,
    isLoading,
    loadError,
    activeAttempt,
    questionsForAttempt,
    currentQuestion,
    currentQuestionIndex: activeAttempt?.currentQuestionIndex ?? 0,
    answeredQuestions,
    remainingSeconds,
    recentResults,
    latestResult: recentResults[0] ?? null,
    startAttempt,
    restartAttempt,
    submitAttempt,
    goToQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    updateAnswer,
    getAnswer,
  };
};

export default useQuizSession;