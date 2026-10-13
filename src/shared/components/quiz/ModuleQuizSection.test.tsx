import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../feedback/Toast';
import type { QuizAttemptState, QuizBankFile, QuizResultSummary } from '../../../types/quiz';
import { getQuizStorageKeys, loadQuizBank } from '../../../utils/quiz';
import { QUIZ_MILESTONE_PERCENTAGE, milestones, readStoredProgressRecord } from '../../progress';
import ModuleQuizSection from './ModuleQuizSection';

const MODULE = 'javascript' as const;
const MILESTONE = milestones().find((milestone) => milestone.id === `quiz:${MODULE}`)!;
const keys = getQuizStorageKeys(MODULE);

const renderQuiz = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <ModuleQuizSection moduleId={MODULE} />
      </ToastProvider>
    </MemoryRouter>
  );

const line = (): HTMLElement => screen.getByTestId('milestones-reached');

/**
 * Starts an attempt, gives every question its right answer (or none) in the stored attempt,
 * which the quiz reads back as a learner's answers after a refresh, and submits it.
 */
async function takeAttempt(bank: QuizBankFile, answers: 'right' | 'none'): Promise<void> {
  const user = userEvent.setup();
  const first = renderQuiz();
  await user.click(await screen.findByRole('button', { name: /Start Quiz|Try New Questions/ }));
  await waitFor(() => expect(localStorage.getItem(keys.activeAttempt)).not.toBeNull());
  first.unmount();

  const attempt = JSON.parse(localStorage.getItem(keys.activeAttempt)!) as QuizAttemptState;
  const byId = new Map(bank.questions.map((question) => [question.id, question]));
  localStorage.setItem(
    keys.activeAttempt,
    JSON.stringify({
      ...attempt,
      currentQuestionIndex: attempt.questionIds.length - 1,
      answers:
        answers === 'right'
          ? Object.fromEntries(attempt.questionIds.map((id) => [id, byId.get(id)!.correctAnswer]))
          : {},
    })
  );

  renderQuiz();
  await user.click(await screen.findByRole('button', { name: 'Submit Quiz' }));
}

describe('ModuleQuizSection and milestones', () => {
  let bank: QuizBankFile;

  beforeEach(async () => {
    localStorage.clear();
    bank = (await loadQuizBank(MODULE))!;
  });

  it('shows one quiet line on the result when the attempt earned the milestone, and not on a reload', async () => {
    await takeAttempt(bank, 'right');

    const region = line();
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveTextContent(`Milestone reached: ${MILESTONE.title}`);
    expect(within(region).getAllByText(/Milestone reached/)).toHaveLength(1);
    expect(within(region).getByRole('link', { name: MILESTONE.title })).toHaveAttribute(
      'href',
      '/progress'
    );
    expect(region.innerHTML).not.toMatch(/animate|transition/);
    expect(readStoredProgressRecord()?.milestones[MILESTONE.id]).toBeDefined();

    // The result is still shown after a reload; the line is not
    cleanup();
    renderQuiz();
    expect(await screen.findByTestId('latest-result')).toHaveTextContent('100%');
    expect(line()).toBeEmptyDOMElement();
  });

  it('shows no line for a result that earned nothing', async () => {
    await takeAttempt(bank, 'none');
    expect(await screen.findByTestId('latest-result')).toHaveTextContent('0%');
    expect(line()).toBeEmptyDOMElement();
    expect(readStoredProgressRecord()?.milestones[MILESTONE.id]).toBeUndefined();
  });
});

/** Words the quiz never shows a learner (ADR 0005). "Progress" and "milestone" are the words. */
const GAME_WORDS = /achievement|badge|gamification|streak|points|\bpts\b|level|tier|gauntlet/i;

describe('ModuleQuizSection without points or tiers', () => {
  let bank: QuizBankFile;

  beforeEach(async () => {
    localStorage.clear();
    bank = (await loadQuizBank(MODULE))!;
  });

  it('says what the bar for the milestone is before any attempt, with a link to Progress', async () => {
    renderQuiz();

    const bar = await screen.findByTestId('quiz-milestone-bar');
    expect(bar).toHaveTextContent(
      `${QUIZ_MILESTONE_PERCENTAGE}% or more on a completed attempt reaches this module's quiz milestone`
    );
    expect(within(bar).getByRole('link', { name: 'Progress page' })).toHaveAttribute(
      'href',
      '/progress'
    );
    expect(screen.getByText('No attempts yet.')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(GAME_WORDS);
  });

  it('shows a result as correct answers out of the total, a percentage and the time taken', async () => {
    await takeAttempt(bank, 'right');

    const total = bank.questionsPerAttempt;
    const latest = await screen.findByTestId('latest-result');
    expect(latest).toHaveTextContent(
      new RegExp(`^${total} of ${total} correct, 100%, in \\d{2}:\\d{2}$`)
    );

    const history = screen.getByTestId('quiz-history');
    expect(history).toHaveTextContent(`${total} of ${total} correct`);
    expect(history).toHaveTextContent('100%');
    expect(history).toHaveTextContent(/Time taken: \d{2}:\d{2}/);

    expect(screen.getByTestId('quiz-milestone-bar')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(GAME_WORDS);

    const [stored] = JSON.parse(localStorage.getItem(keys.results)!) as Record<string, unknown>[];
    expect(stored).not.toHaveProperty('points');
    expect(stored).not.toHaveProperty('performanceTier');
  });

  it('reads a result stored with points and a tier, and shows neither', async () => {
    const old: QuizResultSummary & { performanceTier: string; points: number } = {
      attemptId: 'old-attempt',
      moduleId: MODULE,
      status: 'completed',
      startedAt: '2026-09-01T10:00:00.000Z',
      completedAt: '2026-09-01T10:04:05.000Z',
      elapsedSeconds: 245,
      totalQuestions: 5,
      answeredQuestions: 5,
      correctAnswers: 3,
      incorrectAnswers: 2,
      scorePercentage: 60,
      performanceTier: 'Concept Builder',
      points: 407,
      questionOutcomes: [],
    };
    localStorage.setItem(keys.results, JSON.stringify([old]));

    renderQuiz();

    expect(await screen.findByTestId('latest-result')).toHaveTextContent(
      '3 of 5 correct, 60%, in 04:05'
    );
    const history = screen.getByTestId('quiz-history');
    expect(history).toHaveTextContent('3 of 5 correct');
    expect(history).toHaveTextContent('Time taken: 04:05');
    expect(document.body.textContent).not.toMatch(/Concept Builder|407/);
    expect(document.body.textContent).not.toMatch(GAME_WORDS);
  });
});
