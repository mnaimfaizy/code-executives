import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AlgorithmAnalysis from './AlgorithmAnalysis';
import bank from '../../../../../quiz-banks/bigo.quiz.json';

const show = () =>
  render(
    <MemoryRouter>
      <AlgorithmAnalysis />
    </MemoryRouter>
  );

describe('Algorithm Analysis: measuring versus deriving', () => {
  it('says what one timing can and cannot tell, and names the two ways to see growth', () => {
    show();
    const card = screen.getByRole('heading', { name: 'Measuring Versus Deriving' }).parentElement!;

    expect(card).toHaveTextContent('One timing cannot tell you the Big-O class.');
    expect(card).toHaveTextContent('Constants.');
    expect(card).toHaveTextContent('Noise.');
    expect(card).toHaveTextContent('Derive it from the code');
    expect(card).toHaveTextContent('Measure at several sizes');
  });

  it('shows a quadratic algorithm doing less work than a linear one at a small size only', () => {
    show();
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    const cells = rows.map((row) =>
      within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    );

    expect(cells).toEqual([
      ['1,000', '100', 'B'],
      ['10,000', '10,000', 'Equal'],
      ['100,000', '1,000,000', 'A'],
      ['1,000,000', '100,000,000', 'A'],
    ]);
  });

  it('is the section the quiz question about one benchmark refers to', () => {
    const question = bank.questions.find((item) => item.id === 'bigo-q25');
    expect(question?.prompt).toMatch(/one benchmark measurement at a single n/);
    expect(question?.references).toEqual(['Algorithm Analysis']);
  });
});
