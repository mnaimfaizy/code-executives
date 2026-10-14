import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { QuizQuestion, QuizStoredAnswer } from '../../../types/quiz';
import QuestionRenderer from './QuestionRenderer';

const base = {
  difficulty: 'advanced' as const,
  scenario: 'A scenario',
  prompt: 'A prompt',
  explanation: '',
  tags: [],
  references: [],
};

const single: QuizQuestion = {
  ...base,
  id: 'single',
  type: 'single-choice',
  options: ['alpha', 'beta', 'gamma'],
  correctAnswer: 0,
};

const multi: QuizQuestion = {
  ...base,
  id: 'multi',
  type: 'multi-select',
  options: ['alpha', 'beta', 'gamma'],
  correctAnswer: [0, 2],
};

const ordering: QuizQuestion = {
  ...base,
  id: 'ordering',
  type: 'ordering',
  items: ['one', 'two', 'three'],
  correctAnswer: ['one', 'two', 'three'],
};

const matching: QuizQuestion = {
  ...base,
  id: 'matching',
  type: 'matching',
  premises: ['p1', 'p2'],
  responses: ['r1', 'r2', 'r3'],
  correctAnswer: [0, 1],
};

const renderQuestion = (
  question: QuizQuestion,
  presentation: number[] | undefined,
  answer: QuizStoredAnswer | null = null
) => {
  const onAnswerChange = vi.fn();
  render(
    <QuestionRenderer
      question={question}
      answer={answer}
      presentation={presentation}
      colorScheme="blue"
      onAnswerChange={onAnswerChange}
    />
  );
  return onAnswerChange;
};

const optionTexts = () => screen.getAllByRole('radio').map((option) => option.textContent);

describe('QuestionRenderer with a presentation order', () => {
  it('shows single-choice options in the presentation order, lettered by display position', () => {
    renderQuestion(single, [2, 0, 1]);
    expect(optionTexts()).toEqual(['Agamma', 'Balpha', 'Cbeta']);
  });

  it('stores the bank index of the option clicked', async () => {
    const onAnswerChange = renderQuestion(single, [2, 0, 1]);
    await userEvent.click(screen.getByRole('radio', { name: /gamma/ }));
    expect(onAnswerChange).toHaveBeenCalledWith(2);
    await userEvent.click(screen.getByRole('radio', { name: /alpha/ }));
    expect(onAnswerChange).toHaveBeenLastCalledWith(0);
  });

  it('marks the selected option by its bank index', () => {
    renderQuestion(single, [2, 0, 1], 0);
    expect(screen.getByRole('radio', { name: /alpha/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /gamma/ })).toHaveAttribute('aria-checked', 'false');
  });

  it('stores bank indices for a multi-select answer', async () => {
    const onAnswerChange = renderQuestion(multi, [1, 2, 0], [2]);
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual(['Abeta', 'Bgamma', 'Calpha']);
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(buttons[2]);
    expect(onAnswerChange).toHaveBeenCalledWith([2, 0]);
  });

  it('starts an ordering question in the presentation order, and stores what the learner saw', async () => {
    const onAnswerChange = renderQuestion(ordering, [2, 0, 1]);
    const items = screen.getAllByRole('listitem');
    expect(items.map((item) => within(item).getByText(/one|two|three/).textContent)).toEqual([
      'three',
      'one',
      'two',
    ]);
    await userEvent.click(within(items[0]).getByRole('button', { name: 'Down' }));
    expect(onAnswerChange).toHaveBeenCalledWith(['one', 'three', 'two']);
  });

  it('lists matching responses in the presentation order, with bank indices as values', async () => {
    const onAnswerChange = renderQuestion(matching, [2, 0, 1]);
    const [first] = screen.getAllByRole('combobox');
    expect(
      within(first)
        .getAllByRole('option')
        .map((option) => option.textContent)
    ).toEqual(['Select the best match', 'r3', 'r1', 'r2']);
    await userEvent.selectOptions(first, 'r3');
    expect(onAnswerChange).toHaveBeenCalledWith([2, -1]);
  });

  it('shows an attempt stored before shuffling in bank order', async () => {
    const onAnswerChange = renderQuestion(single, undefined);
    expect(optionTexts()).toEqual(['Aalpha', 'Bbeta', 'Cgamma']);
    await userEvent.click(screen.getByRole('radio', { name: /beta/ }));
    expect(onAnswerChange).toHaveBeenCalledWith(1);
  });
});
