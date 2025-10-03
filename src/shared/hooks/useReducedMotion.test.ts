/**
 * useReducedMotion Hook Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

describe('useReducedMotion', () => {
  let matchMediaMock: MediaQueryList;

  beforeEach(() => {
    // Reset matchMedia mock before each test
    matchMediaMock = {
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    window.matchMedia = vi.fn().mockImplementation(() => matchMediaMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return false when user does not prefer reduced motion', () => {
    matchMediaMock.matches = false;

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it('should return true when user prefers reduced motion', () => {
    matchMediaMock.matches = true;

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it('should add event listener for media query changes', () => {
    renderHook(() => useReducedMotion());

    expect(matchMediaMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useReducedMotion());

    unmount();

    expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should update when media query changes', () => {
    let changeHandler: ((event: Partial<MediaQueryListEvent>) => void) | undefined;
    matchMediaMock.addEventListener = vi.fn(
      (_event: string, handler: (event: Partial<MediaQueryListEvent>) => void) => {
        changeHandler = handler;
      }
    );
    matchMediaMock.matches = false;

    const { result, rerender } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);

    // Simulate media query change
    matchMediaMock.matches = true;
    if (changeHandler) {
      changeHandler({ matches: true } as MediaQueryListEvent);
    }
    rerender();

    expect(result.current).toBe(true);
  });

  it('should handle legacy addListener API', () => {
    // Simulate browser without addEventListener
    delete (matchMediaMock as Partial<MediaQueryList>).addEventListener;
    matchMediaMock.addListener = vi.fn();

    renderHook(() => useReducedMotion());

    expect(matchMediaMock.addListener).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should handle legacy removeListener on unmount', () => {
    // Simulate browser without removeEventListener
    delete (matchMediaMock as Partial<MediaQueryList>).addEventListener;
    delete (matchMediaMock as Partial<MediaQueryList>).removeEventListener;
    matchMediaMock.addListener = vi.fn();
    matchMediaMock.removeListener = vi.fn();

    const { unmount } = renderHook(() => useReducedMotion());

    unmount();

    expect(matchMediaMock.removeListener).toHaveBeenCalledWith(expect.any(Function));
  });
});
