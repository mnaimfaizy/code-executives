import { useCallback, useEffect, useRef } from 'react';

export interface PerformanceMark {
  name: string;
  startTime: number;
  duration?: number;
}

export interface UsePerformanceMarksOptions {
  enabled?: boolean;
  prefix?: string;
  logToConsole?: boolean;
}

/**
 * Custom hook for performance marks and measurements
 * Tracks custom user interactions and feature timings
 */
export const usePerformanceMarks = (options: UsePerformanceMarksOptions = {}) => {
  const { enabled = true, prefix = 'app', logToConsole = import.meta.env.DEV } = options;

  const marksRef = useRef<Map<string, number>>(new Map());

  // Mark the start of a performance measurement
  const mark = useCallback(
    (name: string) => {
      if (!enabled) return;

      const markName = `${prefix}:${name}`;
      const startTime = performance.now();

      marksRef.current.set(markName, startTime);

      // Use Performance API mark
      if (performance.mark) {
        performance.mark(markName);
      }

      if (logToConsole) {
        console.log(`⏱️ [Performance Mark] Started: ${markName}`);
      }
    },
    [enabled, prefix, logToConsole]
  );

  // Measure the duration since mark was called
  const measure = useCallback(
    (name: string): number | null => {
      if (!enabled) return null;

      const markName = `${prefix}:${name}`;
      const measureName = `${markName}:measure`;
      const startTime = marksRef.current.get(markName);

      if (!startTime) {
        console.warn(`[Performance] No mark found for: ${markName}`);
        return null;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Use Performance API measure
      if (performance.measure) {
        try {
          performance.measure(measureName, markName);
        } catch (e) {
          // Mark might not exist in Performance API
          console.warn('Performance measure failed:', e);
        }
      }

      // Clean up mark
      marksRef.current.delete(markName);

      if (logToConsole) {
        const emoji = duration > 1000 ? '🔴' : duration > 500 ? '🟡' : '🟢';
        console.log(`${emoji} [Performance Measure] ${markName}: ${duration.toFixed(2)}ms`);
      }

      // Report to analytics
      if (import.meta.env.PROD && duration > 100) {
        // analytics.track('performance_measure', {
        //   name: markName,
        //   duration,
        //   timestamp: Date.now(),
        // });
      }

      return duration;
    },
    [enabled, prefix, logToConsole]
  );

  // Convenience function: mark + measure in one call
  const measureAsync = useCallback(
    async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
      mark(name);
      try {
        const result = await fn();
        measure(name);
        return result;
      } catch (error) {
        measure(name);
        throw error;
      }
    },
    [mark, measure]
  );

  // Get all performance entries
  const getEntries = useCallback(() => {
    if (!enabled || !performance.getEntriesByType) return [];
    return performance.getEntriesByType('measure').filter((entry) => entry.name.startsWith(prefix));
  }, [enabled, prefix]);

  // Clear all marks and measures
  const clearMarks = useCallback(() => {
    marksRef.current.clear();
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMarks();
    };
  }, [clearMarks]);

  return {
    mark,
    measure,
    measureAsync,
    getEntries,
    clearMarks,
  };
};

export default usePerformanceMarks;
