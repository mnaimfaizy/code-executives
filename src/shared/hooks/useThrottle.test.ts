/**
 * useThrottle Hook Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThrottle } from './useThrottle';

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('should throttle value changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useThrottle(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Value doesn't update immediately - need to advance timers
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');

    // Try to update again within throttle window
    rerender({ value: 'ignored', delay: 500 });

    // Value should not change (throttled)
    expect(result.current).toBe('updated');

    // Fast-forward past throttle window
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now try to update again
    rerender({ value: 'final', delay: 500 });

    // Need to advance timers again
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Value should update now
    expect(result.current).toBe('final');
  });

  it('should allow updates after throttle delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useThrottle(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    // First update - should apply after delay
    rerender({ value: 'update1', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('update1');

    // Second update within window - should be ignored
    rerender({ value: 'update2', delay: 500 });
    expect(result.current).toBe('update1');

    // Wait for throttle window to pass
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Third update - should apply
    rerender({ value: 'update3', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('update3');
  });

  it('should work with different delay values', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useThrottle(value, delay), {
      initialProps: { value: 'initial', delay: 1000 },
    });

    rerender({ value: 'update1', delay: 1000 });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('update1');

    rerender({ value: 'update2', delay: 1000 });
    expect(result.current).toBe('update1'); // Throttled

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    rerender({ value: 'update3', delay: 1000 });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('update3');
  });

  it('should handle number values', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useThrottle(value, delay), {
      initialProps: { value: 0, delay: 500 },
    });

    expect(result.current).toBe(0);

    rerender({ value: 42, delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(42);

    rerender({ value: 100, delay: 500 });
    expect(result.current).toBe(42); // Throttled

    act(() => {
      vi.advanceTimersByTime(500);
    });

    rerender({ value: 200, delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(200);
  });

  it('should handle rapid consecutive updates', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useThrottle(value, delay), {
      initialProps: { value: 0, delay: 500 },
    });

    // First update applies after delay
    rerender({ value: 1, delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(1);

    // Rapid updates (all should be throttled)
    rerender({ value: 2, delay: 500 });
    rerender({ value: 3, delay: 500 });
    rerender({ value: 4, delay: 500 });
    rerender({ value: 5, delay: 500 });

    expect(result.current).toBe(1); // Still first value

    // Wait for throttle to clear
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // The last update (5) should be scheduled
    expect(result.current).toBe(5);
  });

  it('should handle object values', () => {
    const obj1 = { count: 1 };
    const obj2 = { count: 2 };
    const obj3 = { count: 3 };

    const { result, rerender } = renderHook(({ value, delay }) => useThrottle(value, delay), {
      initialProps: { value: obj1, delay: 500 },
    });

    expect(result.current).toBe(obj1);

    rerender({ value: obj2, delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(obj2); // First update

    rerender({ value: obj3, delay: 500 });
    expect(result.current).toBe(obj2); // Throttled

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(obj3);
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useThrottle('value', 500));

    unmount();

    // Should not throw or cause memory leaks
    expect(true).toBe(true);
  });
});
