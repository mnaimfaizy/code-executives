import { useState, useEffect, useCallback } from 'react';

/**
 * Options for keyboard navigation behavior
 */
export interface KeyboardNavigationOptions {
  /** Whether to loop from last to first item and vice versa (default: true) */
  loop?: boolean;
  /** Whether to enable keyboard navigation (default: true) */
  enabled?: boolean;
  /** Element to attach event listener to (default: window) */
  target?: HTMLElement | null;
}

/**
 * Custom hook for implementing keyboard navigation in visualizations and lists
 * Provides accessible keyboard controls for navigating through elements.
 *
 * @param elementCount - Total number of elements to navigate through
 * @param onSelect - Callback function when an element is selected (Enter/Space)
 * @param options - Configuration options for navigation behavior
 * @returns The currently selected index
 *
 * @example
 * ```tsx
 * const VisualizationComponent = ({ items }) => {
 *   const handleSelect = (index: number) => {
 *     console.log('Selected item:', items[index]);
 *   };
 *
 *   const selectedIndex = useKeyboardNavigation(
 *     items.length,
 *     handleSelect,
 *     { loop: true, enabled: true }
 *   );
 *
 *   return (
 *     <div role="list" aria-label="Visualization items">
 *       {items.map((item, index) => (
 *         <div
 *           key={index}
 *           role="listitem"
 *           tabIndex={0}
 *           aria-selected={index === selectedIndex}
 *           className={index === selectedIndex ? 'selected' : ''}
 *         >
 *           {item.name}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 *
 * **Keyboard Controls:**
 * - `ArrowRight` / `ArrowDown`: Move to next item
 * - `ArrowLeft` / `ArrowUp`: Move to previous item
 * - `Enter` / `Space`: Select current item
 * - `Home`: Jump to first item
 * - `End`: Jump to last item
 */
export const useKeyboardNavigation = (
  elementCount: number,
  onSelect: (index: number) => void,
  options: KeyboardNavigationOptions = {}
): number => {
  const { loop = true, enabled = true, target } = options;
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Memoize the selection handler
  const handleSelect = useCallback(() => {
    onSelect(selectedIndex);
  }, [onSelect, selectedIndex]);

  useEffect(() => {
    // Don't attach listener if disabled or no elements
    if (!enabled || elementCount === 0) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => {
            if (loop) {
              return (prev + 1) % elementCount;
            }
            return Math.min(prev + 1, elementCount - 1);
          });
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => {
            if (loop) {
              return (prev - 1 + elementCount) % elementCount;
            }
            return Math.max(prev - 1, 0);
          });
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          handleSelect();
          break;

        case 'Home':
          e.preventDefault();
          setSelectedIndex(0);
          break;

        case 'End':
          e.preventDefault();
          setSelectedIndex(elementCount - 1);
          break;

        default:
          break;
      }
    };

    const eventTarget = target || window;
    eventTarget.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      eventTarget.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [selectedIndex, elementCount, handleSelect, enabled, loop, target]);

  return selectedIndex;
};

export default useKeyboardNavigation;
