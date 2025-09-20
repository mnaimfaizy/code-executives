import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  VisualizationState,
  DataStructureOperation,
  AnimationStep,
} from '../types/datastructures';

/**
 * Custom hook for managing data structure visualization state
 * Provides state management, animation control, and operation history
 */
export const useVisualizationState = <T>(initialData: T[], maxHistorySize: number = 50) => {
  const [state, setState] = useState<VisualizationState<T>>({
    data: initialData,
    currentStep: 0,
    totalSteps: 1,
    isPlaying: false,
    isCompleted: false,
    speed: 1,
    history: [initialData],
    operations: [],
  });

  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Core state management methods
  const updateData = useCallback(
    (newData: T[], operation?: DataStructureOperation) => {
      setState((prev) => {
        const newHistory = [...prev.history.slice(-maxHistorySize + 1), newData];
        const newOperations = operation ? [...prev.operations, operation] : prev.operations;

        return {
          ...prev,
          data: newData,
          history: newHistory,
          currentStep: newHistory.length - 1,
          totalSteps: newHistory.length,
          operations: newOperations,
          isCompleted: false,
        };
      });
    },
    [maxHistorySize]
  );

  const goToStep = useCallback((step: number) => {
    setState((prev) => {
      const clampedStep = Math.max(0, Math.min(step, prev.totalSteps - 1));
      return {
        ...prev,
        currentStep: clampedStep,
        data: prev.history[clampedStep] || prev.data,
        isCompleted: clampedStep === prev.totalSteps - 1,
      };
    });
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep < prev.totalSteps - 1) {
        const newStep = prev.currentStep + 1;
        return {
          ...prev,
          currentStep: newStep,
          data: prev.history[newStep],
          isCompleted: newStep === prev.totalSteps - 1,
        };
      }
      return { ...prev, isPlaying: false, isCompleted: true };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep > 0) {
        const newStep = prev.currentStep - 1;
        return {
          ...prev,
          currentStep: newStep,
          data: prev.history[newStep],
          isCompleted: false,
        };
      }
      return prev;
    });
  }, []);

  const play = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: true, isCompleted: false }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 0,
      data: prev.history[0] || initialData,
      isPlaying: false,
      isCompleted: false,
    }));
  }, [initialData]);

  const setSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, speed: Math.max(0.1, Math.min(5, speed)) }));
  }, []);

  const clear = useCallback(() => {
    setState({
      data: initialData,
      currentStep: 0,
      totalSteps: 1,
      isPlaying: false,
      isCompleted: false,
      speed: 1,
      history: [initialData],
      operations: [],
    });
  }, [initialData]);

  const undo = useCallback(() => {
    prevStep();
  }, [prevStep]);

  const redo = useCallback(() => {
    nextStep();
  }, [nextStep]);

  // Auto-play functionality
  useEffect(() => {
    if (state.isPlaying && !state.isCompleted) {
      const delay = 1000 / state.speed; // Convert speed to delay
      timeoutRef.current = window.setTimeout(() => {
        nextStep();
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.isPlaying, state.isCompleted, state.speed, nextStep]);

  // Cleanup on unmount
  useEffect(() => {
    const currentAnimationFrame = animationRef.current;
    const currentTimeout = timeoutRef.current;

    return () => {
      if (currentAnimationFrame) {
        cancelAnimationFrame(currentAnimationFrame);
      }
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, []);

  // Computed values
  const canUndo = state.currentStep > 0;
  const canRedo = state.currentStep < state.totalSteps - 1;
  const canPlay = !state.isPlaying && !state.isCompleted;
  const canPause = state.isPlaying;
  const canReset = state.currentStep > 0 || state.operations.length > 0;

  const progress = state.totalSteps > 0 ? (state.currentStep + 1) / state.totalSteps : 0;
  const currentOperation = state.operations[state.currentStep];

  return {
    // State
    state: {
      ...state,
      progress,
      currentOperation,
    },

    // Actions
    actions: {
      updateData,
      goToStep,
      nextStep,
      prevStep,
      play,
      pause,
      reset,
      setSpeed,
      clear,
      undo,
      redo,
    },

    // Computed flags
    flags: {
      canUndo,
      canRedo,
      canPlay,
      canPause,
      canReset,
    },
  };
};

/**
 * Hook for managing animation sequences
 */
export const useAnimationSequence = () => {
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const [animationQueue, setAnimationQueue] = useState<AnimationStep[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const addAnimation = useCallback((animation: AnimationStep) => {
    setAnimationQueue((prev) => [...prev, animation]);
  }, []);

  const playNext = useCallback(() => {
    setAnimationQueue((prev) => {
      if (prev.length > 0) {
        const [next, ...rest] = prev;
        setCurrentAnimation(next.id);
        setIsAnimating(true);

        // Auto-complete animation after duration
        window.setTimeout(() => {
          setCurrentAnimation(null);
          setIsAnimating(false);
        }, next.duration);

        return rest;
      }
      return prev;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setAnimationQueue([]);
    setCurrentAnimation(null);
    setIsAnimating(false);
  }, []);

  useEffect(() => {
    if (!isAnimating && animationQueue.length > 0) {
      playNext();
    }
  }, [isAnimating, animationQueue.length, playNext]);

  return {
    currentAnimation,
    isAnimating,
    queueLength: animationQueue.length,
    addAnimation,
    clearQueue,
  };
};

/**
 * Hook for handling user interactions in visualizations
 */
export const useVisualizationInteraction = () => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);

  const handleElementClick = useCallback((elementId: string) => {
    setSelectedElement((prev) => (prev === elementId ? null : elementId));
  }, []);

  const handleElementHover = useCallback((elementId: string | null) => {
    setHoveredElement(elementId);
  }, []);

  const handleElementDragStart = useCallback((elementId: string) => {
    setDraggedElement(elementId);
  }, []);

  const handleElementDragEnd = useCallback(() => {
    setDraggedElement(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElement(null);
    setHoveredElement(null);
    setDraggedElement(null);
  }, []);

  return {
    selectedElement,
    hoveredElement,
    draggedElement,
    handleElementClick,
    handleElementHover,
    handleElementDragStart,
    handleElementDragEnd,
    clearSelection,
  };
};
