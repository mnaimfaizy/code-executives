import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import ExerciseList from './ExerciseList';
import type { ExerciseCard } from '../../../features/playground/exercises/catalog';
import { PROGRESS_STORAGE_KEY } from '../../../features/playground/exercises/exerciseProgress';

const cards: ExerciseCard[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    level: 'easy',
    summary: 'Find the two numbers that add up to a target.',
    href: '/playground?exercise=two-sum',
    lessons: [
      {
        moduleId: 'datastructures',
        section: 'Hash Tables',
        label: 'Data Structures: Hash Tables',
        href: '/datastructures?section=Hash%20Tables',
      },
      {
        moduleId: 'bigo',
        section: 'Real-World Applications',
        label: 'Big-O Notation: Real-World Applications',
        href: '/bigo?section=real-world-applications',
      },
    ],
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray',
    level: 'medium',
    summary: '',
    href: '/playground?exercise=maximum-subarray',
    lessons: [],
  },
];

const row = (id: string) => within(screen.getByTestId(`exercise-row-${id}`));

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('ExerciseList', () => {
  it('renders nothing at all for an empty list', () => {
    const { container } = render(<ExerciseList exercises={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the title, level, summary and practice link of each exercise', () => {
    render(<ExerciseList exercises={cards} />);

    expect(row('two-sum').getByText('Two Sum')).toBeInTheDocument();
    expect(row('two-sum').getByText('Easy')).toBeInTheDocument();
    expect(
      row('two-sum').getByText('Find the two numbers that add up to a target.')
    ).toBeInTheDocument();
    expect(
      row('two-sum').getByRole('link', { name: /Practice in the Playground: Two Sum/ })
    ).toHaveAttribute('href', '/playground?exercise=two-sum');
    expect(row('maximum-subarray').getByText('Medium')).toBeInTheDocument();
  });

  it('leaves the "taught in" links out unless asked for them', () => {
    render(<ExerciseList exercises={cards} />);

    expect(screen.queryByText(/Taught in/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Hash Tables/ })).not.toBeInTheDocument();
  });

  it('links each exercise to the sections that teach it, in the same tab', () => {
    render(<ExerciseList exercises={cards} showLessons />);
    const lesson = row('two-sum').getByRole('link', { name: 'Data Structures: Hash Tables' });

    expect(lesson).toHaveAttribute('href', '/datastructures?section=Hash%20Tables');
    expect(lesson).not.toHaveAttribute('target');
    expect(
      row('two-sum').getByRole('link', { name: 'Big-O Notation: Real-World Applications' })
    ).toHaveAttribute('href', '/bigo?section=real-world-applications');
    // No lessons, no "Taught in" line
    expect(row('maximum-subarray').queryByText(/Taught in/)).not.toBeInTheDocument();
  });

  it('names a lesson of the page’s own module by its section alone, and any other in full', () => {
    const { rerender } = render(
      <ExerciseList exercises={cards} showLessons moduleId="datastructures" />
    );

    expect(row('two-sum').getByRole('link', { name: 'Hash Tables' })).toHaveAttribute(
      'href',
      '/datastructures?section=Hash%20Tables'
    );
    expect(
      row('two-sum').getByRole('link', { name: 'Big-O Notation: Real-World Applications' })
    ).toBeInTheDocument();
    expect(row('two-sum').getByText(/Taught in/)).toHaveTextContent(
      'Taught in Hash Tables, Big-O Notation: Real-World Applications'
    );

    rerender(<ExerciseList exercises={cards} showLessons moduleId="bigo" />);
    expect(row('two-sum').getByText(/Taught in/)).toHaveTextContent(
      'Taught in Data Structures: Hash Tables, Real-World Applications'
    );
  });

  it('marks a passed exercise in words, and only that one', () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ 'two-sum': { passed: true } }));
    render(<ExerciseList exercises={cards} />);

    expect(row('two-sum').getByText('Passed')).toBeInTheDocument();
    expect(row('maximum-subarray').queryByText('Passed')).not.toBeInTheDocument();
  });

  it('renders without a mark when storage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(<ExerciseList exercises={cards} />);

    expect(screen.getByText('Two Sum')).toBeInTheDocument();
    expect(screen.queryByText('Passed')).not.toBeInTheDocument();
  });

  it('picks up a pass made in another tab', () => {
    render(<ExerciseList exercises={cards} />);
    expect(screen.queryByText('Passed')).not.toBeInTheDocument();

    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ 'maximum-subarray': { passed: true } })
    );
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: PROGRESS_STORAGE_KEY }));
    });

    expect(row('maximum-subarray').getByText('Passed')).toBeInTheDocument();
  });
});
