import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  loadProgress,
  saveProgress,
  useExerciseProgress,
  PROGRESS_STORAGE_KEY,
} from './exerciseProgress';

describe('exercise progress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts empty', () => {
    expect(loadProgress()).toEqual({});
  });

  it('remembers passed exercises and the last code per exercise', () => {
    const { result } = renderHook(() => useExerciseProgress());
    act(() => {
      result.current.saveCode('two-sum', 'function twoSum() {}');
      result.current.markPassed('two-sum');
      result.current.saveCode('valid-parentheses', 'function isValid() {}');
    });
    expect(result.current.progress).toEqual({
      'two-sum': { code: 'function twoSum() {}', passed: true },
      'valid-parentheses': { code: 'function isValid() {}' },
    });
    // A later visit reads the same from storage
    expect(loadProgress()).toEqual(result.current.progress);
  });

  it('forgets the code of an exercise but not that it was passed', () => {
    const { result } = renderHook(() => useExerciseProgress());
    act(() => {
      result.current.saveCode('two-sum', 'x');
      result.current.markPassed('two-sum');
      result.current.forgetCode('two-sum');
    });
    expect(result.current.progress['two-sum']).toEqual({ passed: true });
  });

  it('remembers that a solution was seen, apart from passing and across starting over', () => {
    const { result } = renderHook(() => useExerciseProgress());
    act(() => {
      result.current.markSolutionSeen('two-sum');
    });
    expect(result.current.progress['two-sum']).toEqual({ solutionSeen: true });

    act(() => {
      result.current.saveCode('two-sum', 'x');
      result.current.markPassed('two-sum');
      result.current.markSolutionSeen('two-sum');
      result.current.forgetCode('two-sum');
    });
    expect(result.current.progress['two-sum']).toEqual({ passed: true, solutionSeen: true });
    expect(loadProgress()['two-sum']).toEqual({ passed: true, solutionSeen: true });
    // Nothing is counted or scored
    expect(Object.keys(loadProgress()['two-sum']).sort()).toEqual(['passed', 'solutionSeen']);
  });

  it('ignores stored data that is not what it wrote', () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, 'not json');
    expect(loadProgress()).toEqual({});
    localStorage.setItem(PROGRESS_STORAGE_KEY, '[1,2]');
    expect(loadProgress()).toEqual({});
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        a: { passed: 'yes', code: 7, solutionSeen: 1 },
        b: null,
        c: { passed: true, score: 100, solutionSeen: true },
      })
    );
    expect(loadProgress()).toEqual({ a: {}, c: { passed: true, solutionSeen: true } });
  });

  it('works for the visit when storage throws on every read and write', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadProgress()).toEqual({});
    expect(() => saveProgress({ a: { passed: true } })).not.toThrow();

    const { result } = renderHook(() => useExerciseProgress());
    act(() => {
      result.current.saveCode('two-sum', 'kept in memory');
      result.current.markPassed('two-sum');
      result.current.markSolutionSeen('two-sum');
    });
    expect(result.current.progress['two-sum']).toEqual({
      code: 'kept in memory',
      passed: true,
      solutionSeen: true,
    });
  });

  it('does not remember code too long to run', () => {
    const { result } = renderHook(() => useExerciseProgress());
    act(() => {
      result.current.saveCode('two-sum', 'x'.repeat(50 * 1024 + 1));
    });
    expect(result.current.progress['two-sum']).toBeUndefined();
  });
});
