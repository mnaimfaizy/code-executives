import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for throttling a value
 * Limits the rate at which a value can update. Useful for
 * scroll handlers, resize events, and rapid state changes.
 *
 * @template T - The type of value to throttle
 * @param value - The value to throttle
 * @param limit - The minimum time between updates in milliseconds (default: 200ms)
 * @returns The throttled value
 *
 * @example
 * ```tsx
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 *
 * useEffect(() => {
 *   const handleScroll = () => setScrollY(window.scrollY);
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, []);
 * ```
 */
export function useThrottle<T>(value: T, limit: number = 200): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current)
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Custom hook for throttling a callback function
 * Returns a throttled version of the callback that executes at most once
 * per specified time limit, regardless of how many times it's called.
 *
 * @param callback - The function to throttle
 * @param limit - The minimum time between executions in milliseconds (default: 200ms)
 * @returns Throttled callback function
 *
 * @example
 * ```tsx
 * const handleScroll = useThrottledCallback(
 *   () => {
 *     console.log('Scroll position:', window.scrollY);
 *     // Perform expensive operation
 *   },
 *   100
 * );
 *
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, [handleScroll]);
 * ```
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number = 200
): (...args: Parameters<T>) => void {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastRan.current >= limit) {
      // Execute immediately if enough time has passed
      callback(...args);
      lastRan.current = now;
    } else {
      // Schedule execution for the next available time slot
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(
        () => {
          callback(...args);
          lastRan.current = Date.now();
        },
        limit - (now - lastRan.current)
      );
    }
  };
}

export default useThrottle;
