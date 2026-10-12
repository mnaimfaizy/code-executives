/**
 * The proof that the exercise data is right: every exercise's solution passes
 * all its checks, and its starter code fails at least one, through the real sandbox script.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { exercises, exercisesByLevel, findExercise } from './exercises';
import { exerciseCards, exerciseCardsFor } from './catalog';
import { buildWatchCode, runChecks } from './runChecks';
import { installSandbox, runCheckInSandbox } from './sandboxForTests';
import { traceSync } from '../tracer';
import { parsePlaygroundLink, playgroundHref } from '../utils/playgroundLink';
import {
  getModuleConfigFromPathname,
  getSectionPathByLabel,
  getSectionQueryValue,
} from '../../../shared/constants/moduleNavigation';
import bigOPageSource from '../../bigo/BigOPage.tsx?raw';

/** The section keys the Big-O page answers to: the cases of its switch. */
const bigOSectionKeys = [...bigOPageSource.matchAll(/case '([a-z-]+)':/g)].map((match) => match[1]);

/** A solution's steps stay far below the 2,000-step limit, so a learner's own way has room. */
const SOLUTION_MAX_STEPS = 600;

describe('exercises', () => {
  beforeAll(installSandbox);

  it('have unique ids that a link can carry', () => {
    const ids = exercises.map((exercise) => exercise.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(parsePlaygroundLink(`?exercise=${id}`).exercise).toBe(id);
      expect(findExercise(id)?.id).toBe(id);
    }
    expect(findExercise('no-such-exercise')).toBeUndefined();
    expect(findExercise(undefined)).toBeUndefined();
  });

  it('are grouped by level, easiest first, with every exercise in one group', () => {
    const groups = exercisesByLevel();
    expect(groups.map((group) => group.label)).toEqual(['Easy', 'Medium']);
    expect(groups.flatMap((group) => group.exercises)).toHaveLength(exercises.length);
  });

  it('finds the section keys of the Big-O page', () => {
    expect(bigOSectionKeys).toContain('introduction');
    expect(bigOSectionKeys.length).toBeGreaterThan(5);
  });

  describe('as cards for a module page', () => {
    it("lists every exercise in the Playground's order, with a link that opens it", () => {
      const cards = exerciseCards();
      expect(cards.map((card) => card.id)).toEqual(exercises.map((exercise) => exercise.id));
      for (const card of cards) {
        const exercise = findExercise(card.id)!;
        expect(card.href).toBe(playgroundHref({ exercise: card.id }));
        expect(parsePlaygroundLink(card.href.split('?')[1]).exercise).toBe(card.id);
        expect(card.title).toBe(exercise.title);
        expect(card.level).toBe(exercise.level);
        expect(card.summary).toBe(exercise.summary);
        expect(card.lessons).toEqual(exercise.teaches ?? []);
      }
    });

    it('gives a section its exercises, in order, whether it is their first lesson or not', () => {
      const titles = (href: string): string[] => exerciseCardsFor(href).map((card) => card.title);
      expect(titles('/datastructures?section=Stacks')).toEqual([
        'Valid Parentheses',
        'Implement Queue using Stacks',
      ]);
      expect(titles('/datastructures?section=Hash%20Tables')).toEqual([
        'Two Sum',
        'Contains Duplicate',
      ]);
      expect(titles('/datastructures?section=Binary%20Trees')).toEqual([
        'Maximum Depth of Binary Tree',
        'Binary Tree Inorder Traversal',
      ]);
      expect(titles('/datastructures?section=Heaps')).toEqual(['Kth Largest Element']);
      expect(titles('/bigo?section=real-world-applications')).toEqual(['Two Sum']);
      expect(titles('/datastructures?section=Arrays')).toEqual([]);
    });

    it('teaches every exercise somewhere, except Maximum Subarray', () => {
      const untaught = exerciseCards().filter((card) => card.lessons.length === 0);
      expect(untaught.map((card) => card.id)).toEqual(['maximum-subarray']);
    });
  });

  describe.each(exercises)('$id', (exercise) => {
    it('states a task, names its entry in the starter code, and has hints and checks', () => {
      expect(exercise.task).toContain(exercise.entry);
      expect(exercise.starterCode).toContain(exercise.entry);
      expect(exercise.hints.length).toBeGreaterThan(0);
      // The learner can see why at least two checks expect what they expect
      const visible = exercise.checks.filter((check) => !check.hidden);
      expect(visible.length).toBeGreaterThanOrEqual(2);
      expect(exercise.checks.some((check) => check.hidden)).toBe(true);
      // Order is only ever left open where the task says so
      expect(exercise.task.includes('any order')).toBe(exercise.compare === 'any-order');
    });

    it('has a summary of one plain sentence, at most 110 characters', () => {
      const summary = exercise.summary;
      expect(summary.trim()).toBe(summary);
      expect(summary.length).toBeGreaterThan(0);
      expect(summary.length).toBeLessThanOrEqual(110);
      expect(summary.endsWith('.')).toBe(true);
      expect(summary.slice(0, -1)).not.toMatch(/\.\s/);
      expect(summary).not.toContain('`');
    });

    it('names lessons that are real sections, by their own address', () => {
      const lessons = exercise.teaches ?? [];
      // Absent, not empty, when no section teaches the idea
      if (exercise.teaches) expect(lessons.length).toBeGreaterThan(0);
      expect(new Set(lessons.map((lesson) => lesson.href)).size).toBe(lessons.length);
      for (const lesson of lessons) {
        const pathname = lesson.href.split('?')[0];
        const config = getModuleConfigFromPathname(pathname);
        expect(config, lesson.href).not.toBeNull();
        if (!config) continue;
        // The label is the module's title, then the sidebar's label of the section
        const prefix = `${config.title}: `;
        expect(lesson.label.startsWith(prefix), lesson.label).toBe(true);
        const sectionLabel = lesson.label.slice(prefix.length);
        expect(getSectionPathByLabel(config.id, sectionLabel)).toBe(lesson.href);
        if (config.id === 'bigo') {
          expect(bigOSectionKeys).toContain(getSectionQueryValue(lesson.href));
        }
      }
    });

    it('has checks made of plain data', () => {
      for (const check of exercise.checks) {
        expect(JSON.parse(JSON.stringify(check.args))).toEqual(check.args);
        expect(JSON.parse(JSON.stringify(check.expected))).toEqual(check.expected);
      }
    });

    it('has a solution with an explanation of two to four sentences', () => {
      const { code, explanation } = exercise.solution;
      expect(code.trim()).not.toBe('');
      expect(code).toContain(exercise.entry);
      expect(code).not.toBe(exercise.starterCode);
      expect(explanation.trim()).not.toBe('');
      // Prose for the Task panel, in one paragraph
      expect(explanation).not.toContain('\n');
      // A sentence ends with a full stop followed by a space or by the end
      const sentences = explanation.split(/\.(?:\s+|$)/).filter((part) => part.trim() !== '');
      expect(sentences.length).toBeGreaterThanOrEqual(2);
      expect(sentences.length).toBeLessThanOrEqual(4);
    });

    it('passes every check with its solution', async () => {
      const run = await runChecks(exercise, exercise.solution.code, runCheckInSandbox);
      expect(run.kind).toBe('ran');
      if (run.kind !== 'ran') return;
      expect(run.results.map((result) => result.status)).toEqual(exercise.checks.map(() => 'pass'));
      expect(run.passed).toBe(true);
    });

    it('has a solution that every check can be watched to the end of, in few steps', () => {
      for (const check of exercise.checks) {
        const trace = traceSync(buildWatchCode(exercise.solution.code, exercise, check));
        expect(trace.outcome).toBe('completed');
        expect(trace.steps.length).toBeLessThanOrEqual(SOLUTION_MAX_STEPS);
      }
    });

    it('fails at least one check with the starter code', async () => {
      const run = await runChecks(exercise, exercise.starterCode, runCheckInSandbox);
      expect(run.kind).toBe('ran');
      if (run.kind !== 'ran') return;
      expect(run.passed).toBe(false);
      expect(run.results.some((result) => result.status !== 'pass')).toBe(true);
    });
  });
});
