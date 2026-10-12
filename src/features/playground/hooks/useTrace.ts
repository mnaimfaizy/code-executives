/**
 * useTrace — Holds the trace of the last run and which of its steps is shown.
 *
 * Provides stepping and auto-play with a configurable speed. With reduced
 * motion, Play goes straight to the last step instead of advancing on a timer.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useReducedMotion } from '../../../shared/hooks';
import type { Step, Trace } from '../tracer';

/** Playback speed multipliers */
export type PlaybackSpeed = 0.5 | 1 | 2 | 4;

interface UseTraceReturn {
  /** Every step of the trace, in order */
  steps: Step[];
  /** Index of the current step */
  index: number;
  /** True when the tracer's queue model could not follow this run, so the queues are approximate */
  queuesApproximate: boolean;
  /** Number of steps */
  stepCount: number;
  /** The current step */
  currentStep: Step | null;
  /** Go to a specific step */
  goToStep: (index: number) => void;
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
  /** Load a trace (replaces the one held) and show its first step */
  loadTrace: (trace: Trace) => void;
  /** Drop the trace */
  clear: () => void;
}

/** Base interval in ms between steps at 1x speed */
const BASE_INTERVAL_MS = 500;

const NO_STEPS: Step[] = [];

/**
 * Hook for stepping through a trace.
 */
export function useTrace(): UseTraceReturn {
  const [steps, setSteps] = useState<Step[]>(NO_STEPS);
  const [index, setIndex] = useState(0);
  const [queuesApproximate, setQueuesApproximate] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const stepCount = steps.length;
  const currentStep = steps[index] ?? null;

  const stopInterval = useCallback((): void => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goToStep = useCallback(
    (target: number): void => {
      setIndex(Math.max(0, Math.min(target, stepCount - 1)));
    },
    [stepCount]
  );

  const nextStep = useCallback((): void => {
    setIndex((prev) => {
      const next = prev + 1;
      if (next >= stepCount) {
        // Stop playing at end
        setIsPlaying(false);
        stopInterval();
        return prev;
      }
      return next;
    });
  }, [stepCount, stopInterval]);

  const prevStep = useCallback((): void => {
    setIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const firstStep = useCallback((): void => {
    setIndex(0);
  }, []);

  const lastStep = useCallback((): void => {
    setIndex(Math.max(0, stepCount - 1));
  }, [stepCount]);

  const play = useCallback((): void => {
    if (stepCount === 0) return;
    if (prefersReducedMotion) {
      // With reduced motion, just go to the last step
      lastStep();
      return;
    }
    setIsPlaying(true);
  }, [stepCount, prefersReducedMotion, lastStep]);

  const pause = useCallback((): void => {
    setIsPlaying(false);
    stopInterval();
  }, [stopInterval]);

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || stepCount === 0) {
      stopInterval();
      return;
    }

    const interval = BASE_INTERVAL_MS / speed;
    intervalRef.current = setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= stepCount) {
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, interval);

    return stopInterval;
  }, [isPlaying, speed, stepCount, stopInterval]);

  const loadTrace = useCallback(
    (trace: Trace): void => {
      stopInterval();
      setIsPlaying(false);
      setSteps(trace.steps);
      setQueuesApproximate(trace.queuesApproximate === true);
      setIndex(0);
    },
    [stopInterval]
  );

  const clear = useCallback((): void => {
    stopInterval();
    setIsPlaying(false);
    setSteps(NO_STEPS);
    setQueuesApproximate(false);
    setIndex(0);
  }, [stopInterval]);

  return {
    steps,
    index,
    queuesApproximate,
    stepCount,
    currentStep,
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
    loadTrace,
    clear,
  };
}
