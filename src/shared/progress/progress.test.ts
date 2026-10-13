import { describe, it, expect } from 'vitest';
import type { ExerciseProgress } from '../../features/playground/exercises/exerciseProgress';
import { milestones, type ProgressExercise, type ProgressSources } from './milestones';
import { describeMilestone, earnMilestones, moduleProgress, withQuizResult } from './progress';
import { emptyProgressRecord, type ProgressRecord } from './progressRecord';

const NOW = new Date('2026-10-12T09:00:00.000Z');
const LATER = new Date('2026-11-01T09:00:00.000Z');

const exercise = (id: string, ...lessonHrefs: string[]): ProgressExercise => ({
  id,
  title: `Title of ${id}`,
  href: `/playground?exercise=${id}`,
  // Progress reads only a lesson's address; the other parts are filled in to complete the type
  lessons: lessonHrefs.map((href) => ({
    moduleId: 'datastructures',
    section: href,
    label: href,
    href,
  })),
});

/** Three Data Structures exercises (one shared with Big-O), two Big-O ones, and two quizzes. */
const SOURCES: ProgressSources = {
  exercises: [
    exercise('a', '/datastructures?section=Arrays', '/bigo?section=introduction'),
    exercise('b', '/datastructures?section=Stacks'),
    exercise('c', '/datastructures?section=Queues'),
    exercise('d', '/bigo?section=core-concepts'),
  ],
  quizModules: ['react', 'bigo'],
};

const passed = (...ids: string[]): ExerciseProgress =>
  Object.fromEntries(ids.map((id) => [id, { passed: true as const }]));

const result = (
  scorePercentage: number,
  status: 'completed' | 'timed-out' = 'completed',
  completedAt = NOW.toISOString()
) => ({ moduleId: 'react' as const, status, scorePercentage, completedAt });

const milestone = (id: string, sources: ProgressSources = SOURCES) => {
  const found = milestones(sources).find((item) => item.id === id);
  if (!found) throw new Error(`no milestone ${id}`);
  return found;
};

describe('earnMilestones', () => {
  it('earns nothing from nothing, and returns the same record', () => {
    const record = emptyProgressRecord();
    const outcome = earnMilestones(record, {}, NOW, SOURCES);
    expect(outcome.earned).toEqual([]);
    expect(outcome.record).toBe(record);
  });

  it('earns a module milestone only when every one of its exercises is passed', () => {
    expect(earnMilestones(emptyProgressRecord(), passed('a', 'b'), NOW, SOURCES).earned).toEqual(
      []
    );

    const outcome = earnMilestones(emptyProgressRecord(), passed('a', 'b', 'c'), NOW, SOURCES);
    expect(outcome.earned.map((item) => item.id)).toEqual(['exercises:datastructures']);
    expect(outcome.record.milestones).toEqual({
      'exercises:datastructures': { earnedAt: NOW.toISOString(), exerciseIds: ['a', 'b', 'c'] },
    });
  });

  it('gives a module with two exercises no milestone, even with both passed', () => {
    const outcome = earnMilestones(emptyProgressRecord(), passed('a', 'd'), NOW, SOURCES);
    expect(outcome.earned).toEqual([]);
  });

  it('earns "every exercise" with the last one', () => {
    const outcome = earnMilestones(emptyProgressRecord(), passed('a', 'b', 'c', 'd'), NOW, SOURCES);
    expect(outcome.earned.map((item) => item.id)).toEqual([
      'exercises:datastructures',
      'exercises:all',
    ]);
  });

  it('counts an exercise passed after its solution was seen the same', () => {
    const progress: ExerciseProgress = {
      a: { passed: true, solutionSeen: true },
      b: { passed: true, solutionSeen: true, code: 'x' },
      c: { passed: true },
    };
    const outcome = earnMilestones(emptyProgressRecord(), progress, NOW, SOURCES);
    expect(outcome.earned.map((item) => item.id)).toEqual(['exercises:datastructures']);
  });

  it('does not count a solution seen without a pass, or code written', () => {
    const progress: ExerciseProgress = {
      a: { passed: true },
      b: { passed: true },
      c: { solutionSeen: true, code: 'x' },
    };
    expect(earnMilestones(emptyProgressRecord(), progress, NOW, SOURCES).earned).toEqual([]);
  });

  it('does not earn a quiz milestone at 79% and does at 80%', () => {
    const at79 = withQuizResult(emptyProgressRecord(), result(79));
    expect(earnMilestones(at79, {}, NOW, SOURCES).earned).toEqual([]);

    const at80 = withQuizResult(at79, result(80));
    const outcome = earnMilestones(at80, {}, NOW, SOURCES);
    expect(outcome.earned.map((item) => item.id)).toEqual(['quiz:react']);
    expect(outcome.record.milestones['quiz:react']).toEqual({ earnedAt: NOW.toISOString() });
  });

  it('does not earn a quiz milestone from an attempt that timed out at 100%', () => {
    const record = withQuizResult(emptyProgressRecord(), result(100, 'timed-out'));
    expect(record.bestQuiz).toEqual({});
    expect(earnMilestones(record, {}, NOW, SOURCES).earned).toEqual([]);
  });

  it('never combines the two kinds: a quiz earns no exercise milestone and the reverse', () => {
    const record = withQuizResult(emptyProgressRecord(), result(100));
    const outcome = earnMilestones(record, passed('a', 'b', 'c', 'd'), NOW, SOURCES);
    expect(outcome.earned.map((item) => item.id)).toEqual([
      'exercises:datastructures',
      'exercises:all',
      'quiz:react',
    ]);
    expect(outcome.earned.every((item) => item.kind === 'exercises' || item.kind === 'quiz')).toBe(
      true
    );
  });

  it('reports a milestone once and keeps its first date', () => {
    const first = earnMilestones(emptyProgressRecord(), passed('a', 'b', 'c'), NOW, SOURCES);
    const second = earnMilestones(first.record, passed('a', 'b', 'c'), LATER, SOURCES);
    expect(second.earned).toEqual([]);
    expect(second.record.milestones['exercises:datastructures'].earnedAt).toBe(NOW.toISOString());
  });

  it('never takes a milestone back when its set grows, and reports the addition as new', () => {
    const first = earnMilestones(emptyProgressRecord(), passed('a', 'b', 'c', 'd'), NOW, SOURCES);
    const grown: ProgressSources = {
      ...SOURCES,
      exercises: [...SOURCES.exercises, exercise('e', '/datastructures?section=Heaps')],
    };

    const second = earnMilestones(first.record, passed('a', 'b', 'c', 'd'), LATER, grown);
    expect(second.earned).toEqual([]);
    expect(second.record.milestones).toEqual(first.record.milestones);

    const status = describeMilestone(
      milestone('exercises:datastructures', grown),
      second.record,
      passed('a', 'b', 'c', 'd'),
      grown
    );
    expect(status).toEqual({
      earned: true,
      earnedAt: NOW.toISOString(),
      done: 3,
      total: 4,
      remaining: [{ id: 'e', title: 'Title of e', href: '/playground?exercise=e' }],
      newSinceEarned: [{ id: 'e', title: 'Title of e', href: '/playground?exercise=e' }],
    });

    // Once the new exercise is passed there is nothing new, and the first date stays
    const caughtUp = passed('a', 'b', 'c', 'd', 'e');
    const third = earnMilestones(second.record, caughtUp, LATER, grown);
    expect(third.earned).toEqual([]);
    expect(
      describeMilestone(milestone('exercises:all', grown), third.record, caughtUp, grown)
    ).toMatchObject({ earned: true, earnedAt: NOW.toISOString(), newSinceEarned: [], done: 5 });
  });

  it('keeps a milestone even when a pass mark it was earned from is gone', () => {
    const first = earnMilestones(emptyProgressRecord(), passed('a', 'b', 'c'), NOW, SOURCES);
    const second = earnMilestones(first.record, {}, LATER, SOURCES);
    expect(second.record.milestones).toEqual(first.record.milestones);
    // Not new since it was earned: it was in the set then
    const status = describeMilestone(
      milestone('exercises:datastructures'),
      second.record,
      {},
      SOURCES
    );
    expect(status.earned).toBe(true);
    expect(status.remaining.map((item) => item.id)).toEqual(['a', 'b', 'c']);
    expect(status.newSinceEarned).toEqual([]);
  });

  it('does not change the record it was given', () => {
    const record = emptyProgressRecord();
    earnMilestones(record, passed('a', 'b', 'c'), NOW, SOURCES);
    expect(record).toEqual(emptyProgressRecord());
  });
});

describe('withQuizResult', () => {
  it('keeps the best completed attempt with its date', () => {
    let record = withQuizResult(emptyProgressRecord(), result(60, 'completed', '2026-01-01T00:00:00.000Z'));
    record = withQuizResult(record, result(90, 'completed', '2026-02-01T00:00:00.000Z'));
    record = withQuizResult(record, result(70, 'completed', '2026-03-01T00:00:00.000Z'));
    expect(record.bestQuiz).toEqual({
      react: { scorePercentage: 90, completedAt: '2026-02-01T00:00:00.000Z' },
    });
  });

  it('returns the same record for an equal score, a lower score and a timed-out attempt', () => {
    const record = withQuizResult(emptyProgressRecord(), result(90));
    expect(withQuizResult(record, result(90, 'completed', LATER.toISOString()))).toBe(record);
    expect(withQuizResult(record, result(50))).toBe(record);
    expect(withQuizResult(record, result(100, 'timed-out'))).toBe(record);
  });

  it('ignores a result that is not for a module or has no score', () => {
    const record = emptyProgressRecord();
    expect(
      withQuizResult(record, { ...result(90), moduleId: 'nope' as unknown as 'react' })
    ).toBe(record);
    expect(withQuizResult(record, result(Number.NaN))).toBe(record);
  });
});

describe('describeMilestone', () => {
  it('says what is left of an exercise milestone, with links', () => {
    const status = describeMilestone(
      milestone('exercises:datastructures'),
      emptyProgressRecord(),
      passed('b'),
      SOURCES
    );
    expect(status).toEqual({
      earned: false,
      done: 1,
      total: 3,
      remaining: [
        { id: 'a', title: 'Title of a', href: '/playground?exercise=a' },
        { id: 'c', title: 'Title of c', href: '/playground?exercise=c' },
      ],
      newSinceEarned: [],
    });
  });

  it('gives a quiz milestone its best score so far and the link to the quiz', () => {
    const none = describeMilestone(milestone('quiz:react'), emptyProgressRecord(), {}, SOURCES);
    expect(none).toEqual({
      earned: false,
      done: 0,
      total: 1,
      remaining: [],
      newSinceEarned: [],
      quizHref: '/react?section=Quiz',
    });

    const below = withQuizResult(emptyProgressRecord(), result(65));
    expect(describeMilestone(milestone('quiz:react'), below, {}, SOURCES)).toMatchObject({
      earned: false,
      done: 0,
      bestQuiz: { scorePercentage: 65, completedAt: NOW.toISOString() },
    });

    const reached = earnMilestones(withQuizResult(below, result(95)), {}, LATER, SOURCES).record;
    expect(describeMilestone(milestone('quiz:react'), reached, {}, SOURCES)).toMatchObject({
      earned: true,
      earnedAt: LATER.toISOString(),
      done: 1,
      total: 1,
      bestQuiz: { scorePercentage: 95 },
    });
  });

  it('calls nothing new when the record does not say what the set was', () => {
    const record: ProgressRecord = {
      milestones: { 'exercises:datastructures': { earnedAt: NOW.toISOString() } },
      bestQuiz: {},
    };
    const status = describeMilestone(
      milestone('exercises:datastructures'),
      record,
      passed('a'),
      SOURCES
    );
    expect(status.earned).toBe(true);
    expect(status.remaining.map((item) => item.id)).toEqual(['b', 'c']);
    expect(status.newSinceEarned).toEqual([]);
  });
});

describe('moduleProgress', () => {
  it('lists the modules that have exercises or a quiz, in module order', () => {
    const record = withQuizResult(emptyProgressRecord(), result(85));
    const progress: ExerciseProgress = {
      a: { passed: true, solutionSeen: true },
      b: { solutionSeen: true },
    };
    expect(moduleProgress(record, progress, SOURCES)).toEqual([
      {
        moduleId: 'datastructures',
        title: 'Data Structures',
        path: '/datastructures',
        exercises: [
          { id: 'a', title: 'Title of a', href: '/playground?exercise=a', passed: true, solutionSeen: true },
          { id: 'b', title: 'Title of b', href: '/playground?exercise=b', passed: false, solutionSeen: true },
          { id: 'c', title: 'Title of c', href: '/playground?exercise=c', passed: false, solutionSeen: false },
        ],
        passedCount: 1,
        totalCount: 3,
        hasQuiz: false,
      },
      {
        moduleId: 'react',
        title: 'React',
        path: '/react',
        exercises: [],
        passedCount: 0,
        totalCount: 0,
        hasQuiz: true,
        quizHref: '/react?section=Quiz',
        bestQuiz: { scorePercentage: 85, completedAt: NOW.toISOString() },
      },
      {
        moduleId: 'bigo',
        title: 'Big-O Notation',
        path: '/bigo',
        exercises: [
          { id: 'a', title: 'Title of a', href: '/playground?exercise=a', passed: true, solutionSeen: true },
          { id: 'd', title: 'Title of d', href: '/playground?exercise=d', passed: false, solutionSeen: false },
        ],
        passedCount: 1,
        totalCount: 2,
        hasQuiz: true,
        quizHref: '/bigo?section=Quiz',
      },
    ]);
  });

  it('covers every exercise and quiz of the real catalog and holds no score of its own', () => {
    const modules = moduleProgress(emptyProgressRecord(), {});
    expect(modules.find((item) => item.moduleId === 'datastructures')?.totalCount).toBeGreaterThan(2);
    expect(modules.filter((item) => item.hasQuiz)).toHaveLength(16);
    for (const item of modules) {
      expect(Object.keys(item).join(' ')).not.toMatch(/points|streak|level|badge/i);
    }
  });
});
