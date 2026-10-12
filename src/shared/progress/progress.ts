/**
 * Working out progress from what is recorded (ADR 0005). Pure: nothing here reads storage or
 * the clock, so every rule can be tested with plain values.
 *
 * The rules: only a passed exercise or a completed quiz attempt counts; an exercise passed
 * after its solution was seen counts the same; a milestone, once in the record, is never
 * taken out again.
 */

import type { ExerciseProgress } from '../../features/playground/exercises/exerciseProgress';
import type { QuizResultSummary } from '../../types/quiz';
import {
  getSectionPathByLabel,
  learningModuleConfigs,
  learningModuleIds,
  type LearningModuleId,
} from '../constants/moduleNavigation';
import {
  QUIZ_MILESTONE_PERCENTAGE,
  defaultProgressSources,
  exercisesOfModule,
  milestones,
  type Milestone,
  type ProgressSources,
} from './milestones';
import type { BestQuizResult, ProgressRecord } from './progressRecord';

/** An exercise as a link, for "what is left". */
export interface ExerciseLink {
  id: string;
  title: string;
  /** Opens the exercise in the Playground. */
  href: string;
}

export interface MilestoneStatus {
  earned: boolean;
  /** ISO date and time, when earned. */
  earnedAt?: string;
  /** Exercises of today's set that are passed; for a quiz, 1 once earned. */
  done: number;
  /** Exercises in today's set; for a quiz, 1. */
  total: number;
  /** Exercises of today's set not yet passed. Empty for a quiz. */
  remaining: ExerciseLink[];
  /**
   * For an earned exercise milestone: exercises added since it was earned that are not passed
   * yet. The milestone is kept; this is the "something new" the page mentions.
   */
  newSinceEarned: ExerciseLink[];
  /** Quiz milestones: the best completed attempt so far, absent when there is none. */
  bestQuiz?: BestQuizResult;
  /** Quiz milestones: the address of the module's Quiz section. */
  quizHref?: string;
}

export interface ModuleExerciseProgress extends ExerciseLink {
  passed: boolean;
  /** Recorded so the page can say so; it takes nothing away. */
  solutionSeen: boolean;
}

export interface ModuleProgress {
  moduleId: LearningModuleId;
  title: string;
  path: string;
  exercises: ModuleExerciseProgress[];
  passedCount: number;
  totalCount: number;
  hasQuiz: boolean;
  /** The address of the module's Quiz section, when it has a quiz. */
  quizHref?: string;
  /** The best completed attempt, with its date. */
  bestQuiz?: BestQuizResult;
}

/** How a module's Quiz section is addressed (`moduleNavigation.ts` appends it to every module). */
export function quizHref(moduleId: LearningModuleId): string | undefined {
  return getSectionPathByLabel(moduleId, 'Quiz') ?? undefined;
}

const isPassed = (exerciseProgress: ExerciseProgress, id: string): boolean =>
  exerciseProgress[id]?.passed === true;

function holds(
  milestone: Milestone,
  record: ProgressRecord,
  exerciseProgress: ExerciseProgress
): boolean {
  if (milestone.kind === 'quiz') {
    const best = milestone.moduleId ? record.bestQuiz[milestone.moduleId] : undefined;
    return best !== undefined && best.scorePercentage >= QUIZ_MILESTONE_PERCENTAGE;
  }
  const ids = milestone.exerciseIds ?? [];
  return ids.length > 0 && ids.every((id) => isPassed(exerciseProgress, id));
}

/**
 * Adds every milestone whose condition holds now and that the record does not have yet.
 * Nothing is ever removed: a milestone earned before its set of exercises grew stays earned.
 * `earned` lists only the ones added by this call.
 */
export function earnMilestones(
  record: ProgressRecord,
  exerciseProgress: ExerciseProgress,
  now: Date,
  sources: ProgressSources = defaultProgressSources()
): { record: ProgressRecord; earned: Milestone[] } {
  const earned = milestones(sources).filter(
    (milestone) =>
      !Object.hasOwn(record.milestones, milestone.id) && holds(milestone, record, exerciseProgress)
  );
  if (earned.length === 0) return { record, earned };

  const earnedAt = now.toISOString();
  const next: ProgressRecord = { ...record, milestones: { ...record.milestones } };
  for (const milestone of earned) {
    next.milestones[milestone.id] = milestone.exerciseIds
      ? { earnedAt, exerciseIds: [...milestone.exerciseIds] }
      : { earnedAt };
  }
  return { record: next, earned };
}

/**
 * The record with a quiz result taken in. Only a completed attempt that beats the stored best
 * changes anything: an attempt that timed out does not count, whatever it scored.
 */
export function withQuizResult(
  record: ProgressRecord,
  result: Pick<QuizResultSummary, 'moduleId' | 'status' | 'scorePercentage' | 'completedAt'>
): ProgressRecord {
  if (result.status !== 'completed') return record;
  if (!learningModuleIds.includes(result.moduleId)) return record;
  if (!Number.isFinite(result.scorePercentage)) return record;
  const best = record.bestQuiz[result.moduleId];
  if (best && best.scorePercentage >= result.scorePercentage) return record;
  return {
    ...record,
    bestQuiz: {
      ...record.bestQuiz,
      [result.moduleId]: {
        scorePercentage: result.scorePercentage,
        completedAt: result.completedAt,
      },
    },
  };
}

/** What the page shows for one milestone: whether it is earned, and what is left with links. */
export function describeMilestone(
  milestone: Milestone,
  record: ProgressRecord,
  exerciseProgress: ExerciseProgress,
  sources: ProgressSources = defaultProgressSources()
): MilestoneStatus {
  const stored = Object.hasOwn(record.milestones, milestone.id)
    ? record.milestones[milestone.id]
    : undefined;
  const status: MilestoneStatus = {
    earned: stored !== undefined,
    done: 0,
    total: 0,
    remaining: [],
    newSinceEarned: [],
  };
  if (stored) status.earnedAt = stored.earnedAt;

  if (milestone.kind === 'quiz') {
    status.total = 1;
    status.done = stored ? 1 : 0;
    if (milestone.moduleId) {
      const best = record.bestQuiz[milestone.moduleId];
      if (best) status.bestQuiz = best;
      status.quizHref = quizHref(milestone.moduleId);
    }
    return status;
  }

  const ids = milestone.exerciseIds ?? [];
  const links = new Map(
    sources.exercises.map(({ id, title, href }) => [id, { id, title, href }] as const)
  );
  const linkOf = (id: string): ExerciseLink => links.get(id) ?? { id, title: id, href: '' };

  const notPassed = ids.filter((id) => !isPassed(exerciseProgress, id));
  status.total = ids.length;
  status.done = ids.length - notPassed.length;
  status.remaining = notPassed.map(linkOf);
  // Without the set it was earned for, nothing can be called new
  if (stored?.exerciseIds) {
    const atEarning = new Set(stored.exerciseIds);
    status.newSinceEarned = notPassed.filter((id) => !atEarning.has(id)).map(linkOf);
  }
  return status;
}

/**
 * The plain record per module: its exercises with what was done, and its best quiz score.
 * Only modules that have exercises or a quiz, in module order.
 */
export function moduleProgress(
  record: ProgressRecord,
  exerciseProgress: ExerciseProgress,
  sources: ProgressSources = defaultProgressSources()
): ModuleProgress[] {
  const list: ModuleProgress[] = [];
  for (const moduleId of learningModuleIds) {
    const exercises = exercisesOfModule(moduleId, sources.exercises).map(
      ({ id, title, href }): ModuleExerciseProgress => ({
        id,
        title,
        href,
        passed: isPassed(exerciseProgress, id),
        solutionSeen: exerciseProgress[id]?.solutionSeen === true,
      })
    );
    const hasQuiz = sources.quizModules.includes(moduleId);
    if (exercises.length === 0 && !hasQuiz) continue;

    const config = learningModuleConfigs[moduleId];
    const entry: ModuleProgress = {
      moduleId,
      title: config.title,
      path: config.path,
      exercises,
      passedCount: exercises.filter((exercise) => exercise.passed).length,
      totalCount: exercises.length,
      hasQuiz,
    };
    if (hasQuiz) {
      entry.quizHref = quizHref(moduleId);
      const best = record.bestQuiz[moduleId];
      if (best) entry.bestQuiz = best;
    }
    list.push(entry);
  }
  return list;
}
