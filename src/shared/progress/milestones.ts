/**
 * The milestones a learner can reach (ADR 0005): named points in their progress, each earned
 * only from what a check proved. Two kinds, never combined: passing every exercise of a set,
 * and a completed quiz attempt that scores high enough.
 *
 * There is no milestone for a module as a whole, and none that depends on a clock, a count of
 * visits or a score. The list is worked out from the exercises and the quiz banks, so a module
 * gains its exercise milestone when its third exercise is written.
 */

import { exerciseCards, type ExerciseCard } from '../../features/playground/exercises/catalog';
import { modulesWithQuiz } from '../../utils/quiz';
import {
  getModuleIdFromPathname,
  learningModuleConfigs,
  learningModuleIds,
  type LearningModuleId,
} from '../constants/moduleNavigation';

/** A module needs this many exercises before passing them all is a milestone. */
export const MILESTONE_MIN_EXERCISES = 3;

/** A completed quiz attempt earns the module's quiz milestone from this score up. */
export const QUIZ_MILESTONE_PERCENTAGE = 80;

/** The id of the milestone for passing every exercise there is. */
export const ALL_EXERCISES_MILESTONE_ID = 'exercises:all';

export interface Milestone {
  /** Stable: `exercises:<moduleId>`, `exercises:all` or `quiz:<moduleId>`. */
  id: string;
  kind: 'exercises' | 'quiz';
  /** Absent only for `exercises:all`. */
  moduleId?: LearningModuleId;
  /** States the act, e.g. "Passed every Data Structures exercise". */
  title: string;
  /** The exercises to pass, as the set is today. Exercise milestones only. */
  exerciseIds?: string[];
}

/** What the progress model needs to know of an exercise. */
export type ProgressExercise = Pick<ExerciseCard, 'id' | 'title' | 'href' | 'lessons'>;

/**
 * Where milestones come from. Every pure function takes it as a parameter with the real
 * catalog as its default, so a test can add an exercise or a quiz.
 */
export interface ProgressSources {
  exercises: ProgressExercise[];
  /** The modules that have a quiz. */
  quizModules: LearningModuleId[];
}

export function defaultProgressSources(): ProgressSources {
  return { exercises: exerciseCards(), quizModules: modulesWithQuiz() };
}

/**
 * The modules an exercise belongs to: those of the sections that teach it. A lesson's address
 * begins with its module's path. An exercise taught in two modules counts for each.
 */
export function exerciseModuleIds(exercise: ProgressExercise): LearningModuleId[] {
  const moduleIds = new Set<LearningModuleId>();
  for (const lesson of exercise.lessons) {
    const moduleId = getModuleIdFromPathname(lesson.href.split(/[?#]/)[0]);
    if (moduleId) moduleIds.add(moduleId);
  }
  return learningModuleIds.filter((moduleId) => moduleIds.has(moduleId));
}

/** A module's exercises, in the catalog's order. */
export function exercisesOfModule(
  moduleId: LearningModuleId,
  exercises: ProgressExercise[]
): ProgressExercise[] {
  return exercises.filter((exercise) => exerciseModuleIds(exercise).includes(moduleId));
}

/**
 * Every milestone, earned or not, in a stable order: the exercise milestones in module order,
 * then the one for every exercise, then the quizzes in module order.
 */
export function milestones(sources: ProgressSources = defaultProgressSources()): Milestone[] {
  const list: Milestone[] = [];

  for (const moduleId of learningModuleIds) {
    const ids = exercisesOfModule(moduleId, sources.exercises).map((exercise) => exercise.id);
    if (ids.length < MILESTONE_MIN_EXERCISES) continue;
    list.push({
      id: `exercises:${moduleId}`,
      kind: 'exercises',
      moduleId,
      title: `Passed every ${learningModuleConfigs[moduleId].title} exercise`,
      exerciseIds: ids,
    });
  }

  // With no exercises at all, "every exercise" would be earned by doing nothing
  if (sources.exercises.length > 0) {
    list.push({
      id: ALL_EXERCISES_MILESTONE_ID,
      kind: 'exercises',
      title: 'Passed every exercise',
      exerciseIds: sources.exercises.map((exercise) => exercise.id),
    });
  }

  for (const moduleId of learningModuleIds) {
    if (!sources.quizModules.includes(moduleId)) continue;
    list.push({
      id: `quiz:${moduleId}`,
      kind: 'quiz',
      moduleId,
      title: `Scored ${QUIZ_MILESTONE_PERCENTAGE}% or more on the ${learningModuleConfigs[moduleId].title} quiz`,
    });
  }

  return list;
}
