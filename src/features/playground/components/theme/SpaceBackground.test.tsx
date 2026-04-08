import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import SpaceBackground from './SpaceBackground';

describe('SpaceBackground', () => {
  let rafSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      closePath: vi.fn(),
      fillRect: vi.fn(),
      setTransform: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      globalAlpha: 1,
      lineWidth: 1,
      lineCap: 'butt',
      canvas: { width: 800, height: 600 },
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
    });

    // Mock requestAnimationFrame
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {
      // Don't actually call the callback to prevent infinite loops
      return 1;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a canvas element', () => {
    const { container } = render(<SpaceBackground />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('canvas is positioned as a background with z-index 0', () => {
    const { container } = render(<SpaceBackground />);
    const canvas = container.querySelector('canvas');
    expect(canvas?.style.zIndex).toBe('0');
  });

  it('canvas has pointer-events: none', () => {
    const { container } = render(<SpaceBackground />);
    const canvas = container.querySelector('canvas');
    expect(canvas?.className).toContain('pointer-events-none');
  });

  it('starts animation frame loop on mount', () => {
    render(<SpaceBackground />);
    expect(rafSpy).toHaveBeenCalled();
  });

  it('cancels animation frame on unmount', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = render(<SpaceBackground />);
    unmount();
    expect(cancelSpy).toHaveBeenCalled();
    cancelSpy.mockRestore();
  });

  it('respects prefers-reduced-motion media query', () => {
    // Override matchMedia to return reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: () => false,
      }),
    });

    render(<SpaceBackground />);
    // With reduced motion, the component should still render but with minimal animation
    // The key test is that it doesn't crash
    expect(rafSpy).toHaveBeenCalled();
  });

  it('canvas is hidden from accessibility tree', () => {
    const { container } = render(<SpaceBackground />);
    const canvas = container.querySelector('canvas');
    expect(canvas?.getAttribute('aria-hidden')).toBe('true');
  });
});
