import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { UIProvider } from '../shared/contexts';
import Header from './Header';

const SENTENCE =
  'Run your own JavaScript and watch the stack, the heap and the queues change, step by step. Or practice with exercises.';

describe('Header', () => {
  it("says what the Playground does in the mobile menu's item", async () => {
    render(
      <MemoryRouter>
        <UIProvider>
          <Header />
        </UIProvider>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /menu/i }));

    const menu = screen.getByLabelText('Mobile navigation menu');
    const item = within(menu).getByRole('link', { name: /^Playground/ });
    expect(item).toHaveAttribute('href', '/playground');
    expect(item).toHaveAttribute('target', '_blank');
    expect(item).toHaveAttribute('rel', 'noopener noreferrer');
    expect(within(item).getByText(SENTENCE)).toBeInTheDocument();
    expect(within(item).getByText(/\(opens in a new tab\)/)).toBeInTheDocument();
    expect(screen.queryByText('Interactive coding environment')).not.toBeInTheDocument();
  });

  it('links to the progress page in the desktop header and in the mobile menu', async () => {
    render(
      <MemoryRouter>
        <UIProvider>
          <Header />
        </UIProvider>
      </MemoryRouter>
    );

    // Before the mobile menu is open, the only one is the desktop header's
    const desktop = screen.getByRole('link', { name: 'Progress' });
    expect(desktop).toHaveAttribute('href', '/progress');
    expect(desktop).not.toHaveAttribute('target');

    await userEvent.click(screen.getByRole('button', { name: /menu/i }));
    const menu = screen.getByLabelText('Mobile navigation menu');
    expect(within(menu).getByRole('link', { name: 'Progress' })).toHaveAttribute(
      'href',
      '/progress'
    );
  });
});
