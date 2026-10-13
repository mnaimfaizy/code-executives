import { describe, expect, it } from 'vitest';
import {
  QUIZ_SECTION_LABEL,
  getSectionPathByLabel,
  learningModuleConfigs,
  learningModuleIds,
  moduleHasQuiz,
  moduleNavigationSections,
  withQuizItem,
} from './moduleNavigation';
import type { SidebarItem } from './moduleNavigation';
import { hasQuizBank } from './quizBanks';

const items: SidebarItem[] = [{ label: 'Introduction', path: '/backend?section=Introduction' }];

describe('withQuizItem', () => {
  it('appends the Quiz item to a module that has a quiz', () => {
    expect(withQuizItem('/backend', items, () => true)).toEqual([
      ...items,
      { label: 'Quiz', path: '/backend?section=Quiz' },
    ]);
  });

  it('leaves a module without a quiz as it is', () => {
    expect(withQuizItem('/backend', items, () => false)).toEqual(items);
  });

  it('never appends to a path that is not a module', () => {
    expect(withQuizItem('/', [], () => true)).toEqual([]);
    expect(withQuizItem('/about', [], () => true)).toEqual([]);
  });
});

describe('the Quiz item in the navigation', () => {
  it('is decided by the bank files in quiz-banks/', () => {
    for (const moduleId of learningModuleIds) {
      expect(moduleHasQuiz(moduleId), moduleId).toBe(hasQuizBank(moduleId));
    }
    expect(hasQuizBank('javascript')).toBe(true);
    expect(hasQuizBank('no-such-module')).toBe(false);
  });

  it('is there for a module with a bank and absent for a module without one', () => {
    for (const moduleId of learningModuleIds) {
      const { path } = learningModuleConfigs[moduleId];
      const labels = moduleNavigationSections[path].map((item) => item.label);
      const quizPath = getSectionPathByLabel(moduleId, QUIZ_SECTION_LABEL);

      if (hasQuizBank(moduleId)) {
        expect(labels.at(-1), moduleId).toBe('Quiz');
        expect(
          labels.filter((label) => label === 'Quiz'),
          moduleId
        ).toHaveLength(1);
        expect(quizPath, moduleId).toBe(`${path}?section=Quiz`);
      } else {
        expect(labels, moduleId).not.toContain('Quiz');
        expect(quizPath, moduleId).toBeNull();
      }
    }
  });
});
