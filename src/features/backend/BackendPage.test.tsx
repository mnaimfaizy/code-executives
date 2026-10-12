import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BackendPage from './BackendPage';

// No bank for this module, whatever `quiz-banks/` holds
vi.mock('../../shared/constants/quizBanks', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../shared/constants/quizBanks')>();
  return { ...original, hasQuizBank: (moduleId: string) => moduleId !== 'backend' };
});

vi.mock('./components/sections/Introduction', () => ({
  default: () => <p>The introduction</p>,
}));

describe('BackendPage without a quiz bank', () => {
  it('shows the Introduction, not a dead quiz, at ?section=Quiz', () => {
    render(
      <MemoryRouter initialEntries={['/backend?section=Quiz']}>
        <BackendPage />
      </MemoryRouter>
    );

    expect(screen.getByText('The introduction')).toBeInTheDocument();
    expect(screen.queryByText(/Quiz bank unavailable/)).not.toBeInTheDocument();
  });
});
