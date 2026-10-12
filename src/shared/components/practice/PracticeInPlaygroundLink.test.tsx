import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PracticeInPlaygroundLink from './PracticeInPlaygroundLink';

describe('PracticeInPlaygroundLink', () => {
  it('names the exercise and links to it', () => {
    render(<PracticeInPlaygroundLink title="Two Sum" href="/playground?exercise=two-sum" />);
    const link = screen.getByRole('link', { name: /Practice in the Playground: Two Sum/ });

    expect(link).toHaveAttribute('href', '/playground?exercise=two-sum');
  });

  it('opens in a new tab and says so to a screen reader', () => {
    render(<PracticeInPlaygroundLink title="Two Sum" href="/playground?exercise=two-sum" />);
    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAccessibleName(
      /^Practice in the Playground: Two Sum ?\(opens in a new tab\)$/
    );
  });

  it('keeps the title in the accessible name when it is hidden from sight', () => {
    render(
      <PracticeInPlaygroundLink title="Two Sum" href="/playground?exercise=two-sum" titleHidden />
    );

    expect(screen.getByRole('link')).toHaveAccessibleName(
      /^Practice in the Playground: Two Sum ?\(opens in a new tab\)$/
    );
    expect(screen.getByText(': Two Sum')).toHaveClass('sr-only');
  });
});
