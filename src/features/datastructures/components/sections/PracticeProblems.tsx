import React from 'react';
import { Target } from 'lucide-react';
import { exerciseCards, type ExerciseCard } from '../../../playground/exercises/catalog';
import ExerciseList from '../../../../shared/components/practice/ExerciseList';

const LEVELS: { level: ExerciseCard['level']; heading: string }[] = [
  { level: 'easy', heading: 'Easy' },
  { level: 'medium', heading: 'Medium' },
  { level: 'hard', heading: 'Hard' },
];

/**
 * The Playground's exercises, grouped by level, each with the sections that teach it. Nothing
 * runs on this page: every exercise opens in the Playground.
 */
const PracticeProblems: React.FC = () => {
  const exercises = exerciseCards();
  const groups = LEVELS.map(({ level, heading }) => ({
    level,
    heading,
    exercises: exercises.filter((exercise) => exercise.level === level),
  })).filter((group) => group.exercises.length > 0);

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-purple-600">
          <Target className="w-8 h-8" aria-hidden />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Practice Problems
          </h1>
        </div>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          These exercises open in the Playground, where your code really runs. Each exercise has
          checks: a check calls your function and either passes or fails. You can watch a run step
          by step to see what your code does. Exercises are in JavaScript.
        </p>
      </div>

      {groups.map((group) => (
        <section key={group.level} aria-labelledby={`practice-level-${group.level}`}>
          <h2 id={`practice-level-${group.level}`} className="text-xl font-bold text-gray-900 mb-3">
            {group.heading}
          </h2>
          <ExerciseList exercises={group.exercises} showLessons />
        </section>
      ))}
    </div>
  );
};

export default PracticeProblems;
