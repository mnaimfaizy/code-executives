/**
 * useKeyboardNavigation Hook Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation } from './useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  let container: HTMLDivElement;
  let items: HTMLButtonElement[];

  beforeEach(() => {
    // Create a container with focusable elements
    container = document.createElement('div');
    items = [];

    for (let i = 0; i < 5; i++) {
      const button = document.createElement('button');
      button.textContent = `Item ${i}`;
      button.tabIndex = 0;
      container.appendChild(button);
      items.push(button);
    }

    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should initialize with selectedIndex as 0', () => {
    const { result } = renderHook(() => useKeyboardNavigation({ target: container }));

    expect(result.current.selectedIndex).toBe(0);
  });

  it('should move to next item on ArrowDown', () => {
    const { result } = renderHook(() => useKeyboardNavigation({ target: container }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      container.dispatchEvent(event);
    });

    expect(result.current.selectedIndex).toBe(1);
  });

  it('should move to next item on ArrowRight', () => {
    const { result } = renderHook(() => useKeyboardNavigation({ target: container }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      container.dispatchEvent(event);
    });

    expect(result.current.selectedIndex).toBe(1);
  });

  it('should move to previous item on ArrowUp', () => {
    const { result } = renderHook(() => useKeyboardNavigation({ target: container }));

    // Move to item 1 first
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      container.dispatchEvent(event);
    });

    expect(result.current.selectedIndex).toBe(1);

    // Move back to item 0
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      container.dispatchEvent(event);
    });

    expect(result.current.selectedIndex).toBe(0);
  });

  it('should move to previous item on ArrowLeft', () => {
    const { result } = renderHook(() => useKeyboardNavigation({ target: container }));

    // Move to item 1 first
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      container.dispatchEvent(event);
    });

    // Move back to item 0
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      container.dispatchEvent(event);
    });

    expect(result.current.selectedIndex).toBe(0);
  });

  it('should jump to first item on Home', () => {
    const { result } = renderHook(() => useKeyboardNavigation({ target: container }));

    // Move to item 2
    act(() => {
      const event1 = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      container.dispatchEvent(event1);
      const event2 = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      container.dispatchEvent(event2);
    });

    expect(result.current.selectedIndex).toBe(2);

    // Jump to first
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Home' });
      container.dispatchEvent(event);
    });

    expect(result.current.selectedIndex).toBe(0);
  });

  it('should jump to last item on End', () => {
    const { result } = renderHook(() => useKeyboardNavigation({ target: container }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'End' });
      container.dispatchEvent(event);
    });

    expect(result.current.selectedIndex).toBe(4); // Last item index
  });

  it('should loop to beginning when reaching end (with loop enabled)', () => {
    const { result } = renderHook(() => useKeyboardNavigation({ target: container, loop: true }));

    // Move to last item
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'End' });
      container.dispatchEvent(event);
    });

    expect(result.current.selectedIndex).toBe(4);

    // Move forward - should loop to 0
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      container.dispatchEvent(event);
    });

    expect(result.current.selectedIndex).toBe(0);
  });

  it('should not loop when reaching end (with loop disabled)', () => {
    const { result } = renderHook(() => useKeyboardNavigation({ target: container, loop: false }));

    // Move to last item
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'End' });
      container.dispatchEvent(event);
    });

    expect(result.current.selectedIndex).toBe(4);

    // Try to move forward - should stay at 4
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      container.dispatchEvent(event);
    });

    expect(result.current.selectedIndex).toBe(4);
  });

  it('should call handleSelect with selected index on Enter', () => {
    const handleSelect = vi.fn();
    renderHook(() => useKeyboardNavigation({ target: container, onSelect: handleSelect }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      container.dispatchEvent(event);
    });

    expect(handleSelect).toHaveBeenCalledWith(0);
  });

  it('should call handleSelect with selected index on Space', () => {
    const handleSelect = vi.fn();
    renderHook(() => useKeyboardNavigation({ target: container, onSelect: handleSelect }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      container.dispatchEvent(event);
    });

    expect(handleSelect).toHaveBeenCalledWith(0);
  });

  it('should not respond to keyboard when disabled', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ target: container, enabled: false })
    );

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      container.dispatchEvent(event);
    });

    expect(result.current.selectedIndex).toBe(0); // Should not change
  });

  it('should remove event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(container, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardNavigation({ target: container }));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
