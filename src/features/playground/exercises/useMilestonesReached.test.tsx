import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  PROGRESS_RECORD_STORAGE_KEY,
  emptyProgressRecord,
  milestones,
  readStoredProgressRecord,
} from '../../../shared/progress';
import { PROGRESS_STORAGE_KEY, useExerciseProgress } from './exerciseProgress';
import { useMilestonesReached } from './useMilestonesReached';

/** A module's exercise milestone, from the real catalog */
const MODULE = milestones().find(
  (milestone) => milestone.kind === 'exercises' && milestone.moduleId !== undefined
)!;
const IDS = MODULE.exerciseIds!;
const LAST = IDS[IDS.length - 1];

const storePassed = (ids: string[]): void =>
  localStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify(Object.fromEntries(ids.map((id) => [id, { passed: true }])))
  );

/** The two hooks as the Playground uses them: a pass is noted, then marked */
function usePlaygroundProgress() {
  const exerciseProgress = useExerciseProgress();
  const milestonesReached = useMilestonesReached(exerciseProgress.progress);
  const pass = (id: string): void => {
    milestonesReached.notePassed(id);
    exerciseProgress.markPassed(id);
  };
  return { pass, saveCode: exerciseProgress.saveCode, reached: milestonesReached.reached };
}

const titles = (reached: { milestones: { title: string }[] } | null): string[] =>
  (reached?.milestones ?? []).map((milestone) => milestone.title);

describe('useMilestonesReached', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reports the milestone the last pass earned, read after the pass is stored', () => {
    storePassed(IDS.slice(0, -1));
    localStorage.setItem(PROGRESS_RECORD_STORAGE_KEY, JSON.stringify(emptyProgressRecord()));
    const { result } = renderHook(usePlaygroundProgress);
    expect(result.current.reached).toBeNull();

    // `markPassed` stores the pass in a state updater: the milestone must still be seen
    act(() => result.current.pass(LAST));

    expect(result.current.reached?.exerciseId).toBe(LAST);
    expect(titles(result.current.reached)).toContain(MODULE.title);
    expect(readStoredProgressRecord()?.milestones[MODULE.id]).toBeDefined();
  });

  it('sees the pass when it is queued behind another update, and so stored later', () => {
    storePassed(IDS.slice(0, -1));
    localStorage.setItem(PROGRESS_RECORD_STORAGE_KEY, JSON.stringify(emptyProgressRecord()));
    const { result } = renderHook(usePlaygroundProgress);

    // React runs a queued updater at the next render, after this callback has returned
    act(() => {
      result.current.saveCode(LAST, '// my solution');
      result.current.pass(LAST);
    });

    expect(titles(result.current.reached)).toContain(MODULE.title);
  });

  it('reports nothing for a pass that earns no milestone', () => {
    const { result } = renderHook(usePlaygroundProgress);
    act(() => result.current.pass(IDS[0]));
    expect(result.current.reached).toBeNull();
  });

  it('does not report a milestone again: not on a second pass, not on a later visit', () => {
    storePassed(IDS.slice(0, -1));
    localStorage.setItem(PROGRESS_RECORD_STORAGE_KEY, JSON.stringify(emptyProgressRecord()));
    const first = renderHook(usePlaygroundProgress);
    act(() => first.result.current.pass(LAST));
    const earnedAt = readStoredProgressRecord()?.milestones[MODULE.id]?.earnedAt;
    expect(earnedAt).toBeDefined();

    // Passing it again keeps the line as it is and earns nothing more
    const shown = first.result.current.reached;
    act(() => first.result.current.pass(LAST));
    expect(first.result.current.reached).toBe(shown);
    first.unmount();

    // A later visit starts with no line, and passing again does not bring it back
    const second = renderHook(usePlaygroundProgress);
    expect(second.result.current.reached).toBeNull();
    act(() => second.result.current.pass(LAST));
    expect(second.result.current.reached).toBeNull();
    expect(readStoredProgressRecord()?.milestones[MODULE.id]?.earnedAt).toBe(earnedAt);
  });

  it('works out a first visit without reporting it, and stores the record', () => {
    // Passed before the record existed: the milestone is deserved but is not news
    storePassed(IDS);
    expect(readStoredProgressRecord()).toBeNull();
    const { result } = renderHook(usePlaygroundProgress);

    expect(result.current.reached).toBeNull();
    expect(readStoredProgressRecord()?.milestones[MODULE.id]).toBeDefined();

    act(() => result.current.pass(LAST));
    expect(result.current.reached).toBeNull();
  });

  it('reports a milestone earned on the first visit after the record was stored', () => {
    // A new learner: opening stores an empty record, so what they earn then is news
    const { result } = renderHook(usePlaygroundProgress);
    for (const id of IDS) act(() => result.current.pass(id));
    expect(result.current.reached?.exerciseId).toBe(LAST);
    expect(titles(result.current.reached)).toContain(MODULE.title);
  });

  it('does not read storage again for every saved keystroke', () => {
    const { result } = renderHook(usePlaygroundProgress);
    localStorage.removeItem(PROGRESS_RECORD_STORAGE_KEY);
    act(() => result.current.saveCode(IDS[0], '// typing'));
    // Had it run again, the record of a first visit would have been stored again
    expect(readStoredProgressRecord()).toBeNull();
  });
});
