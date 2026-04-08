import React, { useCallback, useRef, useEffect } from 'react';

interface PaneResizerProps {
  /** Current position as a fraction (0–1) of the container width */
  position: number;
  /** Called while dragging with the new fraction */
  onResize: (fraction: number) => void;
  /** Called on double-click to reset to default */
  onReset: () => void;
  /** Accessible label for the resizer */
  'aria-label': string;
}

/**
 * Draggable vertical divider between panes.
 * Reports positions as fractions of the container width.
 */
const PaneResizer: React.FC<PaneResizerProps> = ({
  onResize,
  onReset,
  'aria-label': ariaLabel,
}) => {
  const resizerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const container = resizerRef.current?.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const fraction = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0.1), 0.9);
      onResize(fraction);
    },
    [onResize]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  /** Arrow keys move by 2% of container width */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const container = resizerRef.current?.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const resizerRect = resizerRef.current!.getBoundingClientRect();
      const currentFraction = (resizerRect.left + resizerRect.width / 2 - rect.left) / rect.width;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onResize(Math.max(currentFraction - 0.02, 0.1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onResize(Math.min(currentFraction + 0.02, 0.9));
      }
    },
    [onResize]
  );

  // Set cursor on body during drag so it doesn't flicker
  useEffect(() => {
    const el = resizerRef.current;
    if (!el) return;

    const onDown = (): void => {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };
    const onUp = (): void => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      onUp();
    };
  }, []);

  return (
    <div
      ref={resizerRef}
      role="separator"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={onReset}
      onKeyDown={handleKeyDown}
      className="shrink-0 w-1.5 cursor-col-resize group relative z-10 focus-visible:outline-none"
      style={{ touchAction: 'none' }}
    >
      {/* Visual handle */}
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 rounded-full transition-colors duration-150 group-hover:w-1 group-focus-visible:w-1"
        style={{
          background: 'var(--pg-border)',
        }}
      />
      {/* Wider hit area */}
      <div className="absolute inset-y-0 -left-1 -right-1" />
      {/* Grip dots (visible on hover) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full"
            style={{ background: 'var(--pg-text-muted)' }}
          />
        ))}
      </div>
    </div>
  );
};

export default PaneResizer;
