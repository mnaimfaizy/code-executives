/**
 * Progress and milestones for the whole site (ADR 0005). The `/progress` page, the Playground
 * and the quiz import from here and from nowhere deeper.
 */

export {
  ALL_EXERCISES_MILESTONE_ID,
  MILESTONE_MIN_EXERCISES,
  QUIZ_MILESTONE_PERCENTAGE,
  defaultProgressSources,
  exerciseModuleIds,
  exercisesOfModule,
  milestones,
} from './milestones';
export type { Milestone, ProgressExercise, ProgressSources } from './milestones';

export {
  PROGRESS_RECORD_STORAGE_KEY,
  emptyProgressRecord,
  loadProgressRecord,
  readStoredProgressRecord,
  saveProgressRecord,
} from './progressRecord';
export type { BestQuizResult, EarnedMilestone, ProgressRecord } from './progressRecord';

export {
  describeMilestone,
  earnMilestones,
  moduleProgress,
  quizHref,
  withQuizResult,
} from './progress';
export type {
  ExerciseLink,
  MilestoneStatus,
  ModuleExerciseProgress,
  ModuleProgress,
} from './progress';

export {
  notifyProgressChanged,
  onProgressChange,
  recordQuizResult,
  resetProgress,
  syncProgress,
} from './progressStorage';
export type { ProgressUpdate } from './progressStorage';
