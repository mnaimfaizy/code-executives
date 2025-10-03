import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if user prefers reduced motion
 * Respects the prefers-reduced-motion media query for accessibility.
 * Use this to disable or simplify animations for users who prefer less motion.
 *
 * @returns boolean - true if user prefers reduced motion, false otherwise
 *
 * @example
 * ```tsx
 * const AnimatedComponent = () => {
 *   const prefersReducedMotion = useReducedMotion();
 *
 *   return (
 *     <div
 *       className={prefersReducedMotion ? '' : 'animate-fade-in'}
 *       style={{
 *         transition: prefersReducedMotion ? 'none' : 'all 0.3s ease-in-out',
 *       }}
 *     >
 *       Content
 *     </div>
 *   );
 * };
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if matchMedia is supported
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Handler that works with both old and new API
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers support addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Fallback for older browsers (Safari < 14) - using deprecated API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legacyMediaQuery = mediaQuery as any;
    legacyMediaQuery.addListener(handleChange);
    return () => legacyMediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
};

export default useReducedMotion;
