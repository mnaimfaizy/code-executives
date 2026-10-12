import React, { useId } from 'react';
import { exerciseCardsFor } from '../../../features/playground/exercises/catalog';
import { getSectionPathByLabel, type LearningModuleId } from '../../constants/moduleNavigation';
import ExerciseList from './ExerciseList';

export interface SectionPracticeProps {
  moduleId: LearningModuleId;
  /** The section's sidebar label, exactly as in `moduleNavigation.ts`. */
  section: string;
}

/**
 * The "Practice" block that ends a section: the exercises this section teaches. The section's
 * address comes from the navigation constants, and the block is absent when the catalog lists
 * nothing for it.
 */
const SectionPractice: React.FC<SectionPracticeProps> = ({ moduleId, section }) => {
  const headingId = useId();
  const sectionHref = getSectionPathByLabel(moduleId, section);
  const exercises = sectionHref ? exerciseCardsFor(sectionHref) : [];

  if (exercises.length === 0) return null;

  return (
    <section
      aria-labelledby={headingId}
      data-testid="section-practice"
      className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 id={headingId} className="text-xl font-bold text-gray-900">
        Practice
      </h2>
      <p className="mt-1 mb-4 text-sm text-gray-700">
        Write the code yourself. Each exercise opens in the Playground, where your code runs against
        checks that pass or fail.
      </p>
      <ExerciseList exercises={exercises} />
    </section>
  );
};

export default SectionPractice;
