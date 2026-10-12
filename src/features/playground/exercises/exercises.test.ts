/**
 * The proof that the exercise data is right: every exercise's solution passes
 * all its checks, and its starter code fails at least one, through the real sandbox script.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { exercises, exercisesByLevel, findExercise } from './exercises';
import { runChecks } from './runChecks';
import { installSandbox, runCheckInSandbox } from './sandboxForTests';
import { parsePlaygroundLink } from '../utils/playgroundLink';

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

    it('fails at least one check with the starter code', async () => {
      const run = await runChecks(exercise, exercise.starterCode, runCheckInSandbox);
      expect(run.kind).toBe('ran');
      if (run.kind !== 'ran') return;
      expect(run.passed).toBe(false);
      expect(run.results.some((result) => result.status !== 'pass')).toBe(true);
    });
  });
});
