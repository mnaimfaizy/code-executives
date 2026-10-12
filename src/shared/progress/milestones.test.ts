import { describe, it, expect } from 'vitest';
import {
  MILESTONE_MIN_EXERCISES,
  QUIZ_MILESTONE_PERCENTAGE,
  exerciseModuleIds,
  milestones,
  type ProgressExercise,
  type ProgressSources,
} from './milestones';
import { modulesWithQuiz } from '../../utils/quiz';

const exercise = (id: string, ...lessonHrefs: string[]): ProgressExercise => ({
  id,
  title: `Title of ${id}`,
  href: `/playground?exercise=${id}`,
  lessons: lessonHrefs.map((href) => ({ label: href, href })),
});

const sources = (
  exercises: ProgressExercise[],
  quizModules: ProgressSources['quizModules'] = []
): ProgressSources => ({ exercises, quizModules });

describe('milestones', () => {
  it('holds the minimum and the quiz percentage of ADR 0005', () => {
    expect(MILESTONE_MIN_EXERCISES).toBe(3);
    expect(QUIZ_MILESTONE_PERCENTAGE).toBe(80);
  });

  it('gives exactly these modules an exercise milestone today', () => {
    // A module gains its milestone when its third exercise is written: change this list then
    const ids = milestones()
      .filter((milestone) => milestone.kind === 'exercises')
      .map((milestone) => milestone.id);
    expect(ids).toEqual(['exercises:datastructures', 'exercises:all']);
  });

  it('has one quiz milestone per module with a quiz bank, in module order', () => {
    const quizzes = milestones().filter((milestone) => milestone.kind === 'quiz');
    expect(quizzes.map((milestone) => milestone.moduleId)).toEqual(modulesWithQuiz());
    expect(quizzes).toHaveLength(16);
    expect(quizzes[0]).toEqual({
      id: 'quiz:javascript',
      kind: 'quiz',
      moduleId: 'javascript',
      title: 'Scored 80% or more on the JavaScript quiz',
    });
    // Every module has a bank today;
    expect(modulesWithQuiz()).toContain('backend');
    expect(modulesWithQuiz()).toContain('database');
  });

  it('gives a module with three exercises a milestone and a module with two none', () => {
    const list = milestones(
      sources([
        exercise('a', '/datastructures?section=Arrays'),
        exercise('b', '/datastructures?section=Stacks'),
        exercise('c', '/datastructures?section=Queues'),
        exercise('d', '/bigo?section=introduction'),
        exercise('e', '/bigo?section=core-concepts'),
      ])
    );
    expect(list).toEqual([
      {
        id: 'exercises:datastructures',
        kind: 'exercises',
        moduleId: 'datastructures',
        title: 'Passed every Data Structures exercise',
        exerciseIds: ['a', 'b', 'c'],
      },
      {
        id: 'exercises:all',
        kind: 'exercises',
        title: 'Passed every exercise',
        exerciseIds: ['a', 'b', 'c', 'd', 'e'],
      },
    ]);
  });

  it('counts an exercise taught in two modules for each, and once per module', () => {
    const shared = exercise(
      'shared',
      '/datastructures?section=Hash%20Tables',
      '/datastructures?section=Sets',
      '/bigo?section=real-world-applications'
    );
    expect(exerciseModuleIds(shared)).toEqual(['datastructures', 'bigo']);

    const list = milestones(
      sources([
        shared,
        exercise('a', '/datastructures?section=Arrays'),
        exercise('b', '/datastructures?section=Stacks'),
        exercise('c', '/bigo?section=introduction'),
        exercise('d', '/bigo?section=core-concepts'),
      ])
    );
    const byId = Object.fromEntries(list.map((milestone) => [milestone.id, milestone.exerciseIds]));
    expect(byId['exercises:datastructures']).toEqual(['shared', 'a', 'b']);
    expect(byId['exercises:bigo']).toEqual(['shared', 'c', 'd']);
  });

  it('ignores a lesson outside every module and an exercise no section teaches', () => {
    expect(exerciseModuleIds(exercise('x', '/about', '/nowhere?section=A'))).toEqual([]);
    expect(exerciseModuleIds(exercise('y'))).toEqual([]);
    // It still counts for "every exercise"
    expect(milestones(sources([exercise('y')])).map((milestone) => milestone.id)).toEqual([
      'exercises:all',
    ]);
  });

  it('lists exercise milestones, then every exercise, then quizzes in module order', () => {
    const list = milestones(
      sources(
        [
          exercise('a', '/bigo?section=introduction'),
          exercise('b', '/bigo?section=introduction'),
          exercise('c', '/bigo?section=introduction'),
        ],
        ['react', 'javascript']
      )
    );
    expect(list.map((milestone) => milestone.id)).toEqual([
      'exercises:bigo',
      'exercises:all',
      'quiz:javascript',
      'quiz:react',
    ]);
  });

  it('has no "every exercise" milestone when there are no exercises', () => {
    expect(milestones(sources([]))).toEqual([]);
  });

  it('has unique ids, no milestone for a module as a whole, and plain titles', () => {
    const list = milestones();
    expect(new Set(list.map((milestone) => milestone.id)).size).toBe(list.length);
    for (const milestone of list) {
      expect(milestone.id).toMatch(/^(exercises|quiz):[a-z]+$/);
      expect(milestone.title).not.toMatch(/achievement|badge|streak|points/i);
    }
  });
});
