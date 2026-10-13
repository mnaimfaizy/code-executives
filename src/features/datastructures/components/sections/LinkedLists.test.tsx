import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LinkedLists from './LinkedLists';
import bank from '../../../../../quiz-banks/datastructures.quiz.json';

// The interactive list is not what these tests are about
vi.mock('../visualizations/2d/linear/LinkedListVisualization', () => ({ default: () => null }));

const show = () =>
  render(
    <MemoryRouter>
      <LinkedLists />
    </MemoryRouter>
  );

const card = () => screen.getByRole('heading', { name: 'Detecting a Cycle' }).parentElement!;

describe('Linked Lists: detecting a cycle', () => {
  it('explains the cycle, the cost of a set, and the two references', () => {
    show();

    expect(card()).toHaveTextContent('never reaches null');
    expect(card()).toHaveTextContent('O(n) extra memory');
    expect(card()).toHaveTextContent("Floyd's cycle detection");
    expect(card()).toHaveTextContent('slow moves one node and fast moves two');
    // The common name is mentioned once, and is not the explanation
    expect(card().textContent!.match(/tortoise/gi)).toHaveLength(1);
  });

  it('draws the list literally: five nodes, and a next that refers back to node 3', () => {
    show();
    const diagram = within(card()).getByRole('img');

    expect(diagram).toHaveAccessibleName(/next of node 5 refers back to node 3/);
    expect(diagram.querySelectorAll('circle')).toHaveLength(5);
    // Four references forward and one back
    expect(diagram.querySelectorAll('line')).toHaveLength(4);
    expect(diagram.querySelectorAll('path')).toHaveLength(1);
  });

  it('follows both references turn by turn until they hold the same node', () => {
    show();
    const rows = within(within(card()).getByRole('table')).getAllByRole('row').slice(1);
    const turns = rows.map((row) => [
      within(row).getByRole('rowheader').textContent,
      ...within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ]);

    expect(turns).toEqual([
      ['Start', 'node 1', 'node 1'],
      ['1', 'node 2', 'node 3'],
      ['2', 'node 3', 'node 5'],
      ['3', 'node 4', 'node 4same node: there is a cycle'],
    ]);
  });

  it('states the cost: O(n) time and O(1) extra memory', () => {
    show();

    expect(within(card()).getByText('Time').parentElement).toHaveTextContent('O(n)');
    expect(within(card()).getByText('Extra memory').parentElement).toHaveTextContent('O(1)');
  });

  it('is the section the quiz question about cycle detection refers to', () => {
    const question = bank.questions.find((item) => item.id === 'datastructures-q26');
    expect(question?.prompt).toMatch(/detects the cycle without extra memory/);
    expect(question?.references).toEqual(['Linked Lists']);
  });
});
