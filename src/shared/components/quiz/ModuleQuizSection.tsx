import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  Brain,
  Clock3,
  Flag,
  Play,
  RefreshCcw,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react';
import SectionLayout from '../../../components/shared/SectionLayout';
import ThemeCard from '../../../components/shared/ThemeCard';
import StatsGrid from '../../../components/shared/StatsGrid';
import { LoadingFallback } from '../feedback/LoadingFallback';
import { useToast } from '../feedback/Toast';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useQuizSession } from '../../hooks/useQuizSession';
import { learningModuleConfigs } from '../../constants/moduleNavigation';
import type { LearningModuleId } from '../../constants/moduleNavigation';
import type { QuizQuestion } from '../../../types/quiz';
import {
  formatQuizAnswer,
  formatRemainingTime,
  isQuizAnswerComplete,
  resolveQuizReferences,
} from '../../../utils/quiz';
import QuestionRenderer from './QuestionRenderer';
import { getSectionTheme } from '../../../utils/theme';

interface ModuleQuizSectionProps {
  moduleId: LearningModuleId;
}

const getProgressTone = (scorePercentage: number): string => {
  if (scorePercentage >= 85) {
    return 'text-green-700';
  }
  if (scorePercentage >= 60) {
    return 'text-blue-700';
  }
  return 'text-rose-700';
};

const ModuleQuizSection: React.FC<ModuleQuizSectionProps> = ({ moduleId }) => {
  const moduleConfig = learningModuleConfigs[moduleId];
  const theme = getSectionTheme(moduleConfig.theme);
  const prefersReducedMotion = useReducedMotion();
  const { showToast } = useToast();
  const latestToastResultId = useRef<string | null>(null);
  const {
    bank,
    isLoading,
    loadError,
    activeAttempt,
    questionsForAttempt,
    currentQuestion,
    currentQuestionIndex,
    answeredQuestions,
    remainingSeconds,
    recentResults,
    latestResult,
    startAttempt,
    restartAttempt,
    submitAttempt,
    goToQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    updateAnswer,
    getAnswer,
  } = useQuizSession(moduleId);

  useEffect(() => {
    if (!latestResult || latestToastResultId.current === latestResult.attemptId) {
      return;
    }

    latestToastResultId.current = latestResult.attemptId;
    showToast(
      latestResult.scorePercentage >= 70 ? 'success' : 'info',
      `${moduleConfig.title} quiz finished with ${latestResult.scorePercentage}% in ${formatRemainingTime(
        latestResult.elapsedSeconds
      )}.`,
      4000
    );
  }, [latestResult, moduleConfig.title, showToast]);

  const currentQuestionAnswer = currentQuestion ? getAnswer(currentQuestion.id) : null;
  const totalQuestions = activeAttempt?.questionIds.length ?? bank?.questionsPerAttempt ?? 5;
  const totalBankQuestions = bank?.questions.length ?? 0;
  const totalAllowedSeconds = (bank?.timeLimitMinutes ?? 10) * 60;
  const timerProgress = totalAllowedSeconds === 0 ? 0 : remainingSeconds / totalAllowedSeconds;
  const attemptProgress = totalQuestions === 0 ? 0 : answeredQuestions / totalQuestions;
  const lowTime = remainingSeconds <= 60;
  const timerAnnouncement = useMemo(() => {
    if (!activeAttempt) {
      return null;
    }

    if (remainingSeconds <= 30) {
      return `${remainingSeconds} seconds remaining`;
    }

    if (remainingSeconds > 0 && remainingSeconds % 60 === 0) {
      return `${remainingSeconds / 60} minutes remaining`;
    }

    return null;
  }, [activeAttempt, remainingSeconds]);

  const reviewItems = useMemo(() => {
    if (!bank || !latestResult) {
      return [];
    }

    const questionMap = bank.questions.reduce<Record<string, QuizQuestion>>(
      (accumulator, question) => {
        accumulator[question.id] = question;
        return accumulator;
      },
      {}
    );

    return latestResult.questionOutcomes
      .filter((outcome) => !outcome.isCorrect)
      .map((outcome) => {
        const question = questionMap[outcome.questionId];
        if (!question) {
          return null;
        }

        return {
          question,
          selectedAnswer: formatQuizAnswer(question, outcome.selectedAnswer),
          correctAnswer: formatQuizAnswer(question, question.correctAnswer),
          references: resolveQuizReferences(moduleId, question.references),
        };
      })
      .filter(
        (
          item
        ): item is {
          question: QuizQuestion;
          selectedAnswer: string;
          correctAnswer: string;
          references: ReturnType<typeof resolveQuizReferences>;
        } => item !== null
      );
  }, [bank, latestResult, moduleId]);

  const heroStats = [
    {
      value: `${totalBankQuestions}`,
      label: 'Scenario Bank Size',
      icon: <Brain className="h-4 w-4" />,
    },
    {
      value: `${bank?.questionsPerAttempt ?? 5}`,
      label: 'Questions Per Run',
      icon: <Target className="h-4 w-4" />,
    },
    {
      value: `${bank?.timeLimitMinutes ?? 10} min`,
      label: 'Challenge Clock',
      icon: <Clock3 className="h-4 w-4" />,
    },
  ];

  const renderIntro = () => (
    <div className="space-y-6">
      <ThemeCard className="space-y-5">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
            Scenario Challenge
          </p>
          <h3 className="text-3xl font-bold text-gray-900">
            Five hard questions. Ten minutes. No filler.
          </h3>
          <p className="text-base leading-7 text-gray-700">{bank?.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h4 className="text-lg font-semibold text-gray-900">Rules</h4>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
              <li>
                Expect scenario-based questions that focus on tradeoffs, debugging choices, and
                architecture judgment.
              </li>
              <li>Each run samples a fresh set of five questions from the module bank.</li>
              <li>Your active attempt resumes after a refresh until the timer expires.</li>
              <li>
                After grading, every incorrect answer links you back to the relevant module
                sections.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h4 className="text-lg font-semibold text-gray-900">Recent Performance</h4>
            {latestResult ? (
              <div className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
                <p>
                  Latest score:{' '}
                  <span
                    className={`font-semibold ${getProgressTone(latestResult.scorePercentage)}`}
                  >
                    {latestResult.scorePercentage}%
                  </span>
                </p>
                <p>
                  Tier:{' '}
                  <span className="font-semibold text-gray-900">
                    {latestResult.performanceTier}
                  </span>
                </p>
                <p>
                  Points earned:{' '}
                  <span className="font-semibold text-gray-900">{latestResult.points}</span>
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-gray-600">
                No attempts yet. Start with a timed run to seed your local progress history.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startAttempt}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            <Play className="h-4 w-4" />
            Start Quiz Run
          </button>
          {latestResult && (
            <button
              type="button"
              onClick={restartAttempt}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Roll A New Set
            </button>
          )}
        </div>
      </ThemeCard>

      {latestResult && reviewItems.length > 0 && (
        <ThemeCard className="space-y-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-rose-600" />
            <h4 className="text-xl font-semibold text-gray-900">Last Run Review</h4>
          </div>
          <div className="space-y-4">
            {reviewItems.map((item) => (
              <div
                key={item.question.id}
                className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">
                  Review Reference
                </p>
                <h5 className="mt-2 text-lg font-semibold text-gray-900">{item.question.prompt}</h5>
                <p className="mt-3 text-sm leading-6 text-gray-700">{item.question.explanation}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-white/80 bg-white p-4 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">Your answer</p>
                    <p className="mt-2">{item.selectedAnswer}</p>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white p-4 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">Best answer</p>
                    <p className="mt-2">{item.correctAnswer}</p>
                  </div>
                </div>
                {item.references.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.references.map((reference) => (
                      <Link
                        key={`${item.question.id}-${reference.label}`}
                        to={reference.path}
                        className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                      >
                        Review {reference.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ThemeCard>
      )}
    </div>
  );

  const renderActiveQuestion = () => {
    if (!currentQuestion) {
      return null;
    }

    return (
      <div className="space-y-6">
        <ThemeCard className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">Timed Scenario</h3>
            </div>
            <div
              className={`rounded-2xl border px-4 py-3 text-right ${
                lowTime
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              } ${lowTime && !prefersReducedMotion ? 'animate-pulse' : ''}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">Time Left</p>
              <p className="mt-1 text-2xl font-bold">{formatRemainingTime(remainingSeconds)}</p>
            </div>
          </div>

          <div aria-live="polite" className="sr-only">
            {timerAnnouncement}
          </div>

          <div className="h-2 rounded-full bg-gray-100">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${lowTime ? 'bg-rose-500' : 'bg-gray-900'}`}
              style={{ width: `${Math.max(timerProgress, 0) * 100}%` }}
            />
          </div>

          <QuestionRenderer
            question={currentQuestion}
            answer={currentQuestionAnswer}
            colorScheme={theme.primary}
            onAnswerChange={(answer) => updateAnswer(currentQuestion.id, answer)}
          />
        </ThemeCard>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={goToPreviousQuestion}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              type="button"
              onClick={submitAttempt}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              <Flag className="h-4 w-4" />
              Submit Quiz
            </button>
          ) : (
            <button
              type="button"
              onClick={goToNextQuestion}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Next Question
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderSidebarContent = () => {
    if (isLoading) {
      return null;
    }

    return (
      <div className="space-y-4">
        <ThemeCard className="space-y-4">
          <div className="flex items-center gap-3">
            <AlarmClock className="h-5 w-5 text-gray-700" />
            <h4 className="text-lg font-semibold text-gray-900">Run Tracker</h4>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Answered</span>
              <span className="font-semibold text-gray-900">
                {answeredQuestions}/{totalQuestions}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-gray-900"
                style={{ width: `${attemptProgress * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Clock</span>
              <span className={`font-semibold ${lowTime ? 'text-rose-700' : 'text-gray-900'}`}>
                {formatRemainingTime(remainingSeconds)}
              </span>
            </div>
          </div>
        </ThemeCard>

        {activeAttempt && (
          <ThemeCard className="space-y-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-gray-700" />
              <h4 className="text-lg font-semibold text-gray-900">Question Map</h4>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {questionsForAttempt.map((question, index) => {
                const isCurrent = index === currentQuestionIndex;
                const isAnswered = isQuizAnswerComplete(question, getAnswer(question.id));
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => goToQuestion(index)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                      isCurrent
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : isAnswered
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </ThemeCard>
        )}

        <ThemeCard className="space-y-3">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-gray-700" />
            <h4 className="text-lg font-semibold text-gray-900">Local History</h4>
          </div>
          {recentResults.length > 0 ? (
            <div className="space-y-3">
              {recentResults.slice(0, 4).map((result) => (
                <div
                  key={result.attemptId}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{result.performanceTier}</span>
                    <span>{result.scorePercentage}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {result.correctAnswers}/{result.totalQuestions} correct
                    </span>
                    <span>{result.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-gray-600">
              Results are saved in localStorage once you finish a timed run.
            </p>
          )}
        </ThemeCard>
      </div>
    );
  };

  const hero = (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
          End-of-Module Quiz
        </p>
        <h1 className="text-4xl font-bold text-gray-900">{moduleConfig.title} scenario gauntlet</h1>
        <p className="max-w-3xl text-lg leading-8 text-gray-700">
          Use the timed quiz to check whether the concepts in this module hold up under
          production-style pressure. Every run picks five harder questions from a larger bank and
          records your local progress for the next session.
        </p>
      </div>
      <StatsGrid stats={heroStats} colorScheme={theme.primary} className="mb-0" />
    </div>
  );

  if (isLoading) {
    return (
      <SectionLayout
        section={moduleConfig.theme}
        hero={hero}
        mainContent={<LoadingFallback variant="skeleton-page" />}
      />
    );
  }

  if (loadError || !bank) {
    return (
      <SectionLayout
        section={moduleConfig.theme}
        hero={hero}
        mainContent={
          <ThemeCard className="space-y-4 border border-rose-200 bg-rose-50/70">
            <div className="flex items-center gap-3 text-rose-700">
              <XCircle className="h-5 w-5" />
              <h3 className="text-xl font-semibold text-rose-900">Quiz bank unavailable</h3>
            </div>
            <p className="text-sm leading-6 text-rose-800">
              {loadError ?? 'This module is still missing its quiz bank.'}
            </p>
            <p className="text-sm leading-6 text-rose-800">
              Expected file:{' '}
              <span className="font-semibold">quiz-banks/{moduleConfig.bankFile}</span>
            </p>
          </ThemeCard>
        }
      />
    );
  }

  return (
    <SectionLayout
      section={moduleConfig.theme}
      hero={hero}
      mainContent={activeAttempt ? renderActiveQuestion() : renderIntro()}
      sidebar={renderSidebarContent()}
    />
  );
};

export default ModuleQuizSection;
