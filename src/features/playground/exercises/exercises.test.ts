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
import {
  describeStep,
  prepareTrace,
} from '../components/visualizations/lenses/stackHeapLensModel';
import { getReferences } from '../../../shared/snapshot';
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

  it('are these ten, in this order', () => {
    expect(exercises.map((exercise) => exercise.id)).toEqual([
      'two-sum',
      'contains-duplicate',
      'valid-parentheses',
      'reverse-linked-list',
      'maximum-depth-binary-tree',
      'implement-queue-using-stacks',
      'binary-tree-inorder-traversal',
      'kth-largest-element',
      'maximum-subarray',
      'linked-list-cycle',
    ]);
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
      expect(titles('/datastructures?section=Linked%20Lists')).toEqual([
        'Reverse Linked List',
        'Linked List Cycle',
      ]);
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
        // The module and the section are held apart: the section is the sidebar's own label,
        // and the full label is the module's title, a colon, then that label
        expect(lesson.moduleId).toBe(config.id);
        expect(getSectionPathByLabel(config.id, lesson.section)).toBe(lesson.href);
        expect(lesson.label).toBe(`${config.title}: ${lesson.section}`);
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

    it('has a solution the Stack & Heap lens model takes at every step of every watched check', () => {
      for (const check of exercise.checks) {
        const { steps } = traceSync(buildWatchCode(exercise.solution.code, exercise, check));
        // A step may be too large to draw; the model must still answer for it
        const lens = prepareTrace(steps);
        expect(lens.steps).toHaveLength(steps.length);
        steps.forEach((step, index) => {
          expect(describeStep(step, lens.steps[index], { index, total: steps.length })).toContain(
            `Step ${index + 1} of ${steps.length}`
          );
        });
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

  describe('linked-list-cycle', () => {
    const exercise = findExercise('linked-list-cycle')!;
    /** From the comment above the two given functions to the end of the code. */
    const GIVEN = /\/\/ The checks call hasCycleIn[\s\S]*$/;

    it('gives the same two finished functions in the starter code and in the solution', () => {
      const given = exercise.starterCode.match(GIVEN)?.[0];
      expect(given).toContain('function listWithCycle(values, pos)');
      expect(given).toContain('function hasCycleIn(values, pos)');
      expect(exercise.solution.code.match(GIVEN)?.[0]).toBe(given);
      // The task names both, says to leave them, and says which one the checks call
      expect(exercise.task).toContain('`listWithCycle(values, pos)`');
      expect(exercise.task).toContain('`hasCycleIn(values, pos)`');
      expect(exercise.task).toContain('Leave them as they are.');
      expect(exercise.task).toContain('The checks call `hasCycleIn`');
    });

    it('checks a cycle to the middle, to the first node and of one node, and three lists that end', () => {
      const cases = exercise.checks.map((check) => {
        const [values, pos] = check.args as [number[], number];
        return { length: values.length, pos, expected: check.expected, hidden: !!check.hidden };
      });
      for (const { pos, expected } of cases) expect(expected).toBe(pos >= 0);
      expect(cases.some(({ length, pos }) => pos > 0 && pos < length - 1)).toBe(true);
      expect(cases.some(({ length, pos }) => pos === 0 && length > 1)).toBe(true);
      expect(cases.some(({ length, pos }) => pos === 0 && length === 1)).toBe(true);
      expect(cases.some(({ length, pos }) => pos === -1 && length > 1)).toBe(true);
      expect(cases.some(({ length, pos }) => pos === -1 && length === 1)).toBe(true);
      expect(cases.some(({ length }) => length === 0)).toBe(true);
      // Short lists: the solution's steps stay far below the limit
      expect(Math.max(...cases.map(({ length }) => length))).toBeLessThanOrEqual(6);
    });

    it('ends a walk that only waits for null at the step limit', async () => {
      const naive = exercise.starterCode.replace(
        '  // Return true if following next from head never reaches null\n',
        '  let node = head;\n  while (node !== null) node = node.next;\n  return false;\n'
      );
      expect(naive).not.toBe(exercise.starterCode);
      const run = await runChecks(exercise, naive, runCheckInSandbox);
      expect(run.kind).toBe('ran');
      if (run.kind !== 'ran') return;
      expect(run.passed).toBe(false);
      expect(run.results[0].status).toBe('step-limit');
    });

    it('records a cycle as next references that lead back to a node, and the lens draws it', () => {
      for (const check of exercise.checks.filter((item) => item.expected === true)) {
        const { steps, outcome } = traceSync(
          buildWatchCode(exercise.solution.code, exercise, check)
        );
        expect(outcome).toBe('completed');
        const lens = prepareTrace(steps);
        // Short lists: no step is too large to draw
        expect(lens.steps.every((step) => step.status === 'drawn')).toBe(true);

        /** True when following `next` from some drawn object comes back to that object. */
        const drawsCycle = (index: number): boolean => {
          const drawn = lens.steps[index];
          if (drawn.status !== 'drawn') return false;
          const next = new Map<string, string>();
          for (const reference of getReferences(drawn.snapshot)) {
            if (reference.fromKind === 'object' && reference.from.endsWith('.next')) {
              next.set(reference.fromOwner, reference.to);
            }
          }
          return [...next.keys()].some((start) => {
            let at = next.get(start);
            for (let hops = 0; at !== undefined && at !== start && hops < next.size; hops++) {
              at = next.get(at);
            }
            return at === start;
          });
        };

        expect(steps.some((_, index) => drawsCycle(index))).toBe(true);
      }
    });
  });
});
