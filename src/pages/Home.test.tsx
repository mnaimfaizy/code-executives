import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import Home from './Home';

const SENTENCE =
  'Run your own JavaScript and watch the stack, the heap and the queues change, step by step. Or practice with exercises.';

describe('Home', () => {
  it('links to the Playground in a new tab, with its sentence', () => {
    render(
      <HelmetProvider>
        <Home />
      </HelmetProvider>
    );

    const card = screen.getByRole('link', { name: /^Playground/ });
    expect(card).toHaveAttribute('href', '/playground');
    expect(card).toHaveAttribute('target', '_blank');
    expect(card).toHaveAttribute('rel', 'noopener noreferrer');
    expect(within(card).getByRole('heading', { name: 'Playground' })).toBeInTheDocument();
    expect(within(card).getByText(SENTENCE)).toBeInTheDocument();
    expect(within(card).getByText(/\(opens in a new tab\)/)).toBeInTheDocument();
  });
});
