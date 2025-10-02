import { Profiler } from 'react';
import type { ProfilerOnRenderCallback, ReactNode } from 'react';

export interface ProfilerData {
  id: string;
  phase: 'mount' | 'update' | 'nested-update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
}

interface PerformanceProfilerProps {
  id: string;
  children: ReactNode;
  enabled?: boolean;
  onRender?: (data: ProfilerData) => void;
  logToConsole?: boolean;
  threshold?: number; // Log only if render time exceeds threshold (ms)
}

/**
 * Performance Profiler wrapper component
 * Tracks React component render performance using the Profiler API
 */
export const PerformanceProfiler: React.FC<PerformanceProfilerProps> = ({
  id,
  children,
  enabled = import.meta.env.DEV,
  onRender,
  logToConsole = import.meta.env.DEV,
  threshold = 16, // 16ms = 60fps target
}) => {
  const handleRender: ProfilerOnRenderCallback = (
    profileId,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    const data: ProfilerData = {
      id: profileId,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    };

    // Call custom handler
    onRender?.(data);

    // Log to console if enabled and exceeds threshold
    if (logToConsole && actualDuration > threshold) {
      const emoji = actualDuration > 50 ? '🔴' : actualDuration > 30 ? '🟡' : '🟢';
      console.log(`${emoji} [Profiler] ${id} (${phase})`, `${actualDuration.toFixed(2)}ms`, data);
    }

    // Report to analytics in production
    if (import.meta.env.PROD && actualDuration > threshold) {
      // Example: Send to analytics service
      // analytics.track('react_render_performance', {
      //   component: id,
      //   phase,
      //   duration: actualDuration,
      //   timestamp: Date.now(),
      // });
    }
  };

  // If profiling disabled, render children directly
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
};

export default PerformanceProfiler;
