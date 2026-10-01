import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePresence } from './usePresence';

const keyOf = (s: string) => s;
const keys = (r: { item: string; exiting: boolean }[]) =>
  r.map((p) => `${p.item}${p.exiting ? '(exiting)' : ''}`);

describe('usePresence', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('keeps a removed item as exiting, then drops it after ms', () => {
    const { result, rerender } = renderHook(({ items }) => usePresence(items, keyOf, 700), {
      initialProps: { items: ['a', 'b'] },
    });
    rerender({ items: ['a'] });
    expect(keys(result.current)).toEqual(['a', 'b(exiting)']);
    act(() => vi.advanceTimersByTime(700));
    expect(keys(result.current)).toEqual(['a']);
  });

  it('never strands an exiting item when the next change comes sooner than ms', () => {
    const { result, rerender } = renderHook(({ items }) => usePresence(items, keyOf, 700), {
      initialProps: { items: ['a', 'b', 'c'] },
    });
    rerender({ items: ['a', 'c'] }); // b leaves
    act(() => vi.advanceTimersByTime(100));
    rerender({ items: ['a'] }); // c leaves before b's exit finished
    act(() => vi.advanceTimersByTime(100));
    rerender({ items: ['a', 'd'] });
    act(() => vi.advanceTimersByTime(700));
    expect(keys(result.current)).toEqual(['a', 'd']);
  });

  it('shows an item that returns while exiting as present', () => {
    const { result, rerender } = renderHook(({ items }) => usePresence(items, keyOf, 700), {
      initialProps: { items: ['a', 'b'] },
    });
    rerender({ items: ['a'] });
    rerender({ items: ['a', 'b'] });
    expect(keys(result.current)).toEqual(['a', 'b']);
    act(() => vi.advanceTimersByTime(700));
    expect(keys(result.current)).toEqual(['a', 'b']);
  });
});
