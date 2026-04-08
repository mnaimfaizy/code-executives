/**
 * useTimeline — Manages the timeline of execution snapshots.
 *
 * Provides step navigation, auto-play with configurable speed,
 * and respects prefers-reduced-motion to disable auto-advance animations.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { StateSnapshot } from '../types';

/** Playback speed multipliers */
export type PlaybackSpeed = 0.5 | 1 | 2 | 4;

interface UseTimelineReturn {
  /** Current step index */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Current snapshot data */
  currentSnapshot: StateSnapshot | null;
  /** Previous snapshot (for diff highlighting) */
  previousSnapshot: StateSnapshot | null;
  /** Go to a specific step */
  goToStep: (step: number) => void;
  /** Advance to next step */
  nextStep: () => void;
  /** Go to previous step */
  prevStep: () => void;
  /** Go to first step */
  firstStep: () => void;
  /** Go to last step */
  lastStep: () => void;
  /** Start auto-playing */
  play: () => void;
  /** Pause auto-playing */
  pause: () => void;
  /** Whether auto-play is active */
  isPlaying: boolean;
  /** Current playback speed */
  speed: PlaybackSpeed;
  /** Set playback speed */
  setSpeed: (speed: PlaybackSpeed) => void;
  /** Load new snapshots (replaces existing) */
  loadSnapshots: (snapshots: StateSnapshot[]) => void;
  /** Clear all snapshots */
  clear: () => void;
  /** Whether timeline has data */
  hasData: boolean;
}

/** Base interval in ms between steps at 1x speed */
const BASE_INTERVAL_MS = 500;

/**
 * Hook for managing time-travel through execution snapshots.
 */
export function useTimeline(): UseTimelineReturn {
  const [snapshots, setSnapshots] = useState<StateSnapshot[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const totalSteps = snapshots.length;
  const currentSnapshot = totalSteps > 0 ? (snapshots[currentStep] ?? null) : null;
  const previousSnapshot =
    totalSteps > 0 && currentStep > 0 ? (snapshots[currentStep - 1] ?? null) : null;
  const hasData = totalSteps > 0;

  const stopInterval = useCallback((): void => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goToStep = useCallback(
    (step: number): void => {
      const clamped = Math.max(0, Math.min(step, totalSteps - 1));
      setCurrentStep(clamped);
    },
    [totalSteps]
  );

  const nextStep = useCallback((): void => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      if (next >= totalSteps) {
        // Stop playing at end
        setIsPlaying(false);
        stopInterval();
        return prev;
      }
      return next;
    });
  }, [totalSteps, stopInterval]);

  const prevStep = useCallback((): void => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const firstStep = useCallback((): void => {
    setCurrentStep(0);
  }, []);

  const lastStep = useCallback((): void => {
    setCurrentStep(Math.max(0, totalSteps - 1));
  }, [totalSteps]);

  const play = useCallback((): void => {
    if (totalSteps === 0) return;
    if (prefersReducedMotion) {
      // With reduced motion, just go to the last step
      lastStep();
      return;
    }
    setIsPlaying(true);
  }, [totalSteps, prefersReducedMotion, lastStep]);

  const pause = useCallback((): void => {
    setIsPlaying(false);
    stopInterval();
  }, [stopInterval]);

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || totalSteps === 0) {
      stopInterval();
      return;
    }

    const interval = BASE_INTERVAL_MS / speed;
    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= totalSteps) {
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, interval);

    return stopInterval;
  }, [isPlaying, speed, totalSteps, stopInterval]);

  // Stop playing when isPlaying becomes false
  useEffect(() => {
    if (!isPlaying) {
      stopInterval();
    }
  }, [isPlaying, stopInterval]);

  const loadSnapshots = useCallback(
    (newSnapshots: StateSnapshot[]): void => {
      stopInterval();
      setIsPlaying(false);
      setSnapshots(newSnapshots);
      setCurrentStep(0);
    },
    [stopInterval]
  );

  const clear = useCallback((): void => {
    stopInterval();
    setIsPlaying(false);
    setSnapshots([]);
    setCurrentStep(0);
  }, [stopInterval]);

  return {
    currentStep,
    totalSteps,
    currentSnapshot,
    previousSnapshot,
    goToStep,
    nextStep,
    prevStep,
    firstStep,
    lastStep,
    play,
    pause,
    isPlaying,
    speed,
    setSpeed,
    loadSnapshots,
    clear,
    hasData,
  };
}
