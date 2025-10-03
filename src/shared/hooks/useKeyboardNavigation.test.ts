/**
 * useKeyboardNavigation Hook Tests
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation } from './useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with selectedIndex as 0', () => {
    const handleSelect = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation(5, handleSelect));

    expect(result.current).toBe(0);
  });

  it('should move to next item on ArrowDown', () => {
    const handleSelect = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation(5, handleSelect));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);
    });

    expect(result.current).toBe(1);
  });

  it('should move to next item on ArrowRight', () => {
    const handleSelect = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation(5, handleSelect));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(event);
    });

    expect(result.current).toBe(1);
  });

  it('should move to previous item on ArrowUp', () => {
    const handleSelect = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation(5, handleSelect));

    // Move to item 1 first
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);
    });

    expect(result.current).toBe(1);

    // Move back to item 0
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      window.dispatchEvent(event);
    });

    expect(result.current).toBe(0);
  });

  it('should move to previous item on ArrowLeft', () => {
    const handleSelect = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation(5, handleSelect));

    // Move to item 1 first
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);
    });

    // Move back to item 0
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);
    });

    expect(result.current).toBe(0);
  });

  it('should jump to first item on Home', () => {
    const handleSelect = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation(5, handleSelect));

    // Move to item 2
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });

    expect(result.current).toBe(2);

    // Jump to first
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    });

    expect(result.current).toBe(0);
  });

  it('should jump to last item on End', () => {
    const handleSelect = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation(5, handleSelect));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    });

    expect(result.current).toBe(4);
  });

  it('should loop to beginning when reaching end (with loop enabled)', () => {
    const handleSelect = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation(5, handleSelect, { loop: true }));

    // Jump to last item
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    });

    expect(result.current).toBe(4);

    // Move forward - should loop to 0
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });

    expect(result.current).toBe(0);
  });

  it('should not loop when reaching end (with loop disabled)', () => {
    const handleSelect = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation(5, handleSelect, { loop: false }));

    // Jump to last item
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    });

    expect(result.current).toBe(4);

    // Try to move forward - should stay at 4
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });

    expect(result.current).toBe(4);
  });

  it('should call handleSelect with selected index on Enter', () => {
    const handleSelect = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation(5, handleSelect));

    expect(result.current).toBe(0);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(handleSelect).toHaveBeenCalledWith(0);
  });

  it('should call handleSelect with selected index on Space', () => {
    const handleSelect = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation(5, handleSelect));

    expect(result.current).toBe(0);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    });

    expect(handleSelect).toHaveBeenCalledWith(0);
  });

  it('should not respond to keyboard when disabled', () => {
    const handleSelect = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation(5, handleSelect, { enabled: false }));

    expect(result.current).toBe(0);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });

    expect(result.current).toBe(0); // Should not change
  });

  it('should remove event listener on unmount', () => {
    const handleSelect = vi.fn();
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardNavigation(5, handleSelect));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
