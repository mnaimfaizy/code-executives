import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import type { ExerciseCard } from '../../../features/playground/exercises/catalog';
import {
  loadProgress,
  type ExerciseProgress,
} from '../../../features/playground/exercises/exerciseProgress';
import PracticeInPlaygroundLink from './PracticeInPlaygroundLink';

export interface ExerciseListProps {
  exercises: ExerciseCard[];
  /** Also name the section(s) that teach each exercise, as links. */
  showLessons?: boolean;
}

const LEVELS: Record<ExerciseCard['level'], { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  medium: { label: 'Medium', className: 'border-amber-200 bg-amber-50 text-amber-800' },
  hard: { label: 'Hard', className: 'border-rose-200 bg-rose-50 text-rose-800' },
};

/**
 * What this viewer has passed, as the Playground recorded it in this browser. Empty on the
 * first render and when storage is unavailable; it follows a pass made in another tab, which
 * is where a practice link opens the Playground.
 */
function useExerciseProgress(): ExerciseProgress {
  const [progress, setProgress] = useState<ExerciseProgress>({});

  useEffect(() => {
    const read = (): void => setProgress(loadProgress());
    read();
    window.addEventListener('storage', read);
    return () => window.removeEventListener('storage', read);
  }, []);

  return progress;
}

/**
 * Exercises of the Playground as rows on a module page: what each asks for, its level, whether
 * this viewer has passed it, and the link that opens it. Renders nothing for an empty list.
 */
const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, showLessons = false }) => {
  const progress = useExerciseProgress();

  if (exercises.length === 0) return null;

  return (
    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {exercises.map((exercise) => {
        const level = LEVELS[exercise.level];
        return (
          <li
            key={exercise.id}
            data-testid={`exercise-row-${exercise.id}`}
            className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:gap-6"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold text-slate-900">{exercise.title}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${level.className}`}
                >
                  {level.label}
                </span>
                {progress[exercise.id]?.passed && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    Passed
                  </span>
                )}
              </div>
              {exercise.summary && (
                <p className="mt-1 text-sm text-slate-700">{exercise.summary}</p>
              )}
              {showLessons && exercise.lessons.length > 0 && (
                <p className="mt-1 text-sm text-slate-600">
                  Taught in{' '}
                  {exercise.lessons.map((lesson, index) => (
                    <React.Fragment key={lesson.href}>
                      {index > 0 && ', '}
                      <a
                        href={lesson.href}
                        className="font-medium text-slate-800 underline underline-offset-2 hover:text-slate-950"
                      >
                        {lesson.label}
                      </a>
                    </React.Fragment>
                  ))}
                </p>
              )}
            </div>
            <div className="shrink-0">
              <PracticeInPlaygroundLink title={exercise.title} href={exercise.href} titleHidden />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ExerciseList;
