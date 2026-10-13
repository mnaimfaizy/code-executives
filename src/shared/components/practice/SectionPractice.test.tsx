import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SectionPractice from './SectionPractice';
import { exerciseCardsFor } from '../../../features/playground/exercises/catalog';
import { getSectionPathByLabel } from '../../constants/moduleNavigation';

vi.mock('../../../features/playground/exercises/catalog', () => ({
  exerciseCardsFor: vi.fn(),
}));

const cardsFor = vi.mocked(exerciseCardsFor);

beforeEach(() => {
  cardsFor.mockReset();
  cardsFor.mockReturnValue([]);
});

describe('SectionPractice', () => {
  it('asks the catalog for the section by the address the navigation gives it', () => {
    render(<SectionPractice moduleId="datastructures" section="Hash Tables" />);

    expect(cardsFor).toHaveBeenCalledWith('/datastructures?section=Hash%20Tables');
  });

  it('lists the exercises the section teaches under a Practice heading', () => {
    cardsFor.mockReturnValue([
      {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        level: 'easy',
        summary: 'Decide whether every bracket is closed in the right order.',
        href: '/playground?exercise=valid-parentheses',
        lessons: [
          {
            moduleId: 'datastructures',
            section: 'Stacks',
            label: 'Data Structures: Stacks',
            href: '/datastructures?section=Stacks',
          },
        ],
      },
    ]);
    render(<SectionPractice moduleId="datastructures" section="Stacks" />);

    expect(screen.getByRole('region', { name: 'Practice' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Practice in the Playground: Valid Parentheses/ })
    ).toHaveAttribute('href', '/playground?exercise=valid-parentheses');
  });

  it('renders nothing when the catalog has nothing for the section', () => {
    const { container } = render(<SectionPractice moduleId="datastructures" section="Stacks" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing, and asks for nothing, when the section is unknown', () => {
    const { container } = render(
      <SectionPractice moduleId="datastructures" section="No Such Section" />
    );

    expect(container).toBeEmptyDOMElement();
    expect(cardsFor).not.toHaveBeenCalled();
  });

  // A mistyped label would make a block vanish without an error, so the labels in use are pinned
  it.each([
    ['datastructures', 'Hash Tables'],
    ['datastructures', 'Sets'],
    ['datastructures', 'Stacks'],
    ['datastructures', 'Queues'],
    ['datastructures', 'Linked Lists'],
    ['datastructures', 'Binary Trees'],
    ['datastructures', 'Heaps'],
    ['bigo', 'Real-World Applications'],
  ] as const)('%s, %s: the section has an address', (moduleId, section) => {
    expect(getSectionPathByLabel(moduleId, section)).not.toBeNull();
  });
});
