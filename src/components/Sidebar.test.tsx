import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UIProvider } from '../shared/contexts';
import {
  learningModuleConfigs,
  learningModuleIds,
  moduleNavigationSections,
} from '../shared/constants/moduleNavigation';
import Sidebar from './Sidebar';

// The bank files decide which modules have a quiz. Two are taken away here, so that the test
// has modules without a bank whatever `quiz-banks/` holds.
const WITHOUT_BANK = ['react', 'backend'];

vi.mock('../shared/constants/quizBanks', async (importOriginal) => {
  const original = await importOriginal<typeof import('../shared/constants/quizBanks')>();
  return {
    ...original,
    hasQuizBank: (moduleId: string) =>
      !['react', 'backend'].includes(moduleId) && original.hasQuizBank(moduleId),
  };
});

// The sidebar is closed until the learner opens it, so its links are queried as hidden ones
const renderSidebar = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <UIProvider>
        <Sidebar />
      </UIProvider>
    </MemoryRouter>
  );

const topLevelLabels = (): string[] =>
  screen.getAllByRole('link', { hidden: true }).map((link) => link.textContent?.trim() ?? '');

describe('Sidebar', () => {
  afterEach(cleanup);

  it('shows no Quiz item for a module without a quiz bank', () => {
    for (const moduleId of WITHOUT_BANK) {
      const { path } = learningModuleConfigs[moduleId as keyof typeof learningModuleConfigs];
      renderSidebar(path);
      expect(screen.getByRole('link', { name: 'Introduction', hidden: true })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Quiz', hidden: true })).not.toBeInTheDocument();
      cleanup();
    }
  });

  it('shows the Quiz item, last, for a module with a quiz bank', () => {
    renderSidebar('/javascript');
    expect(screen.getByRole('link', { name: 'Quiz', hidden: true })).toHaveAttribute(
      'href',
      '/javascript?section=Quiz'
    );
    expect(topLevelLabels().at(-1)).toBe('Quiz');
  });

  it('agrees with the navigation about every module', () => {
    for (const moduleId of learningModuleIds) {
      const { path } = learningModuleConfigs[moduleId];
      renderSidebar(path);
      const inNavigation = moduleNavigationSections[path].some((item) => item.label === 'Quiz');
      expect(screen.queryAllByRole('link', { name: 'Quiz', hidden: true }), moduleId).toHaveLength(
        inNavigation ? 1 : 0
      );
      cleanup();
    }
  });
});
