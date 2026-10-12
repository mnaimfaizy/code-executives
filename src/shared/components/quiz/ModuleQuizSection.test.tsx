import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../feedback/Toast';
import type { QuizAttemptState, QuizBankFile } from '../../../types/quiz';
import { getQuizStorageKeys, loadQuizBank } from '../../../utils/quiz';
import { milestones, readStoredProgressRecord } from '../../progress';
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
 * Starts a quiz run, gives every question its right answer (or none) in the stored attempt,
 * which the quiz reads back as a learner's answers after a refresh, and submits it.
 */
async function takeAttempt(bank: QuizBankFile, answers: 'right' | 'none'): Promise<void> {
  const user = userEvent.setup();
  const first = renderQuiz();
  await user.click(await screen.findByRole('button', { name: /Start Quiz Run|Roll A New Set/ }));
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
    expect(await screen.findByText(/Latest score:/)).toHaveTextContent('100%');
    expect(line()).toBeEmptyDOMElement();
  });

  it('shows no line for a result that earned nothing', async () => {
    await takeAttempt(bank, 'none');
    expect(await screen.findByText(/Latest score:/)).toHaveTextContent('0%');
    expect(line()).toBeEmptyDOMElement();
    expect(readStoredProgressRecord()?.milestones[MILESTONE.id]).toBeUndefined();
  });
});
