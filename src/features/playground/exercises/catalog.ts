/**
 * The exercises as a module page lists them: what each is, where it is taught, and the link
 * that opens it in the Playground. A module page imports this file and nothing else of the
 * Playground's.
 */

import { playgroundHref } from '../utils/playgroundLink';
import { exercises } from './exercises';
import type { ExerciseLesson, ExerciseLevel } from './types';

export interface ExerciseCard {
  id: string;
  title: string;
  level: ExerciseLevel;
  /** The task in one sentence. */
  summary: string;
  /** Opens the exercise in the Playground. */
  href: string;
  /** The sections that teach it, the main one first. Empty when no section does. */
  lessons: ExerciseLesson[];
}

/** Every exercise, in the Playground's own order. */
export function exerciseCards(): ExerciseCard[] {
  return exercises.map((exercise) => ({
    id: exercise.id,
    title: exercise.title,
    level: exercise.level,
    summary: exercise.summary,
    href: playgroundHref({ exercise: exercise.id }),
    lessons: exercise.teaches ?? [],
  }));
}

/** The exercises a section lists at its end. `lessonHref` is the section's own address. */
export function exerciseCardsFor(lessonHref: string): ExerciseCard[] {
  return exerciseCards().filter((card) =>
    card.lessons.some((lesson) => lesson.href === lessonHref)
  );
}
