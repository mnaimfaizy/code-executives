/**
 * TimelinePlayer — Timeline slider, playback controls, speed selector,
 * variables panel, and call stack panel.
 *
 * Keyboard shortcuts:
 * - Left/Right arrows: step backward/forward
 * - Space: toggle play/pause
 * - Home/End: first/last step
 */

import React, { useCallback, useEffect } from 'react';
import {
  SkipBack,
  ChevronLeft,
  Play,
  Pause,
  ChevronRight,
  SkipForward,
  Gauge,
  Layers,
  Variable,
} from 'lucide-react';
import type { StateSnapshot, CapturedVariable, StackFrame } from '../../types';
import type { PlaybackSpeed } from '../../hooks/useTimeline';
import { diffSnapshots, formatValue } from '../../instrumentation/StateSnapshot';

interface TimelinePlayerProps {
  /** Current step index */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Current snapshot data */
  currentSnapshot: StateSnapshot | null;
  /** Previous snapshot (for diff highlighting) */
  previousSnapshot: StateSnapshot | null;
  /** Whether auto-play is active */
  isPlaying: boolean;
  /** Current playback speed */
  speed: PlaybackSpeed;
  /** Go to a specific step */
  onGoToStep: (step: number) => void;
  /** Next step */
  onNextStep: () => void;
  /** Previous step */
  onPrevStep: () => void;
  /** First step */
  onFirstStep: () => void;
  /** Last step */
  onLastStep: () => void;
  /** Start auto-playing */
  onPlay: () => void;
  /** Pause auto-playing */
  onPause: () => void;
  /** Set playback speed */
  onSetSpeed: (speed: PlaybackSpeed) => void;
}

const SPEED_OPTIONS: PlaybackSpeed[] = [0.5, 1, 2, 4];

const TimelinePlayer: React.FC<TimelinePlayerProps> = ({
  currentStep,
  totalSteps,
  currentSnapshot,
  previousSnapshot,
  isPlaying,
  speed,
  onGoToStep,
  onNextStep,
  onPrevStep,
  onFirstStep,
  onLastStep,
  onPlay,
  onPause,
  onSetSpeed,
}) => {
  const diff = currentSnapshot ? diffSnapshots(previousSnapshot, currentSnapshot) : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onPrevStep();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNextStep();
          break;
        case ' ':
          e.preventDefault();
          if (isPlaying) {
            onPause();
          } else {
            onPlay();
          }
          break;
        case 'Home':
          e.preventDefault();
          onFirstStep();
          break;
        case 'End':
          e.preventDefault();
          onLastStep();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onNextStep, onPrevStep, onPlay, onPause, onFirstStep, onLastStep]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      onGoToStep(parseInt(e.target.value, 10));
    },
    [onGoToStep]
  );

  if (totalSteps === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full p-4"
        style={{ color: 'var(--pg-text-muted)' }}
      >
        <Layers size={32} className="mb-2 opacity-40" />
        <span className="text-sm font-medium">No timeline data</span>
        <span className="text-xs mt-1">Run code with instrumentation to see execution steps</span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      role="region"
      aria-label="Timeline player"
    >
      {/* Timeline slider + controls */}
      <div
        className="px-3 py-2 shrink-0"
        style={{
          borderBottom: '1px solid var(--pg-border)',
          background: 'var(--pg-bg-surface-translucent)',
        }}
      >
        {/* Step counter */}
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--pg-text-secondary)', fontFamily: 'var(--pg-font-mono)' }}
          >
            Step {currentStep + 1} / {totalSteps}
          </span>
          {currentSnapshot && (
            <span
              className="text-xs"
              style={{ color: 'var(--pg-text-muted)', fontFamily: 'var(--pg-font-mono)' }}
            >
              Line {currentSnapshot.line}
            </span>
          )}
        </div>

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={totalSteps - 1}
          value={currentStep}
          onChange={handleSliderChange}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
          style={{
            accentColor: 'var(--pg-accent-blue)',
            background: 'var(--pg-bg-panel)',
          }}
          aria-label={`Timeline step ${currentStep + 1} of ${totalSteps}`}
        />

        {/* Playback buttons */}
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <IconButton onClick={onFirstStep} label="First step" disabled={currentStep === 0}>
            <SkipBack size={14} />
          </IconButton>
          <IconButton onClick={onPrevStep} label="Previous step" disabled={currentStep === 0}>
            <ChevronLeft size={14} />
          </IconButton>
          <IconButton
            onClick={isPlaying ? onPause : onPlay}
            label={isPlaying ? 'Pause' : 'Play'}
            accent
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </IconButton>
          <IconButton
            onClick={onNextStep}
            label="Next step"
            disabled={currentStep >= totalSteps - 1}
          >
            <ChevronRight size={14} />
          </IconButton>
          <IconButton
            onClick={onLastStep}
            label="Last step"
            disabled={currentStep >= totalSteps - 1}
          >
            <SkipForward size={14} />
          </IconButton>

          {/* Speed control */}
          <div className="ml-2 flex items-center gap-1">
            <Gauge size={12} style={{ color: 'var(--pg-text-muted)' }} />
            <select
              value={speed}
              onChange={(e) => onSetSpeed(parseFloat(e.target.value) as PlaybackSpeed)}
              className="text-xs rounded px-1 py-0.5"
              style={{
                background: 'var(--pg-bg-panel)',
                color: 'var(--pg-text-primary)',
                border: '1px solid var(--pg-border)',
                fontFamily: 'var(--pg-font-mono)',
              }}
              aria-label="Playback speed"
            >
              {SPEED_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}x
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Variables and call stack panels */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Variables panel */}
        <VariablesPanel
          variables={currentSnapshot?.variables ?? []}
          changedNames={new Set(diff?.changedVars.map((v) => v.name) ?? [])}
          addedNames={new Set(diff?.addedVars.map((v) => v.name) ?? [])}
        />

        {/* Call stack panel */}
        <CallStackPanel callStack={currentSnapshot?.callStack ?? []} />
      </div>
    </div>
  );
};

/** Small icon button used in the playback controls */
function IconButton({
  onClick,
  label,
  disabled,
  accent,
  children,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  accent?: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="p-1.5 rounded transition-colors duration-150"
      style={{
        color: disabled
          ? 'var(--pg-text-muted)'
          : accent
            ? 'var(--pg-accent-blue)'
            : 'var(--pg-text-secondary)',
        background: accent ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

/** Panel showing current variable values */
function VariablesPanel({
  variables,
  changedNames,
  addedNames,
}: {
  variables: CapturedVariable[];
  changedNames: Set<string>;
  addedNames: Set<string>;
}): React.ReactElement {
  return (
    <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--pg-border)' }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Variable size={12} style={{ color: 'var(--pg-accent-blue)' }} />
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--pg-text-muted)' }}
        >
          Variables
        </span>
        <span
          className="text-xs"
          style={{ color: 'var(--pg-text-muted)', fontFamily: 'var(--pg-font-mono)' }}
        >
          ({variables.length})
        </span>
      </div>

      {variables.length === 0 ? (
        <span className="text-xs" style={{ color: 'var(--pg-text-muted)' }}>
          No variables in scope
        </span>
      ) : (
        <div className="space-y-0.5">
          {variables.map((v) => {
            const isChanged = changedNames.has(v.name);
            const isNew = addedNames.has(v.name);

            return (
              <div
                key={v.name}
                className="flex items-start gap-2 text-xs rounded px-1.5 py-0.5"
                style={{
                  background: isNew
                    ? 'rgba(34, 197, 94, 0.1)'
                    : isChanged
                      ? 'rgba(59, 130, 246, 0.1)'
                      : 'transparent',
                  fontFamily: 'var(--pg-font-mono)',
                }}
              >
                <span
                  className="shrink-0 font-medium"
                  style={{
                    color: isNew
                      ? 'var(--pg-accent-green)'
                      : isChanged
                        ? 'var(--pg-accent-blue)'
                        : 'var(--pg-text-primary)',
                  }}
                >
                  {v.name}
                </span>
                <span style={{ color: 'var(--pg-text-muted)' }}>=</span>
                <span className="break-all" style={{ color: 'var(--pg-text-secondary)' }}>
                  {formatValue(v.value)}
                </span>
                <span
                  className="shrink-0 ml-auto"
                  style={{ color: 'var(--pg-text-muted)', fontSize: '10px' }}
                >
                  {v.type}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Panel showing the current call stack */
function CallStackPanel({ callStack }: { callStack: StackFrame[] }): React.ReactElement {
  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Layers size={12} style={{ color: 'var(--pg-accent-purple)' }} />
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--pg-text-muted)' }}
        >
          Call Stack
        </span>
        <span
          className="text-xs"
          style={{ color: 'var(--pg-text-muted)', fontFamily: 'var(--pg-font-mono)' }}
        >
          ({callStack.length})
        </span>
      </div>

      {callStack.length === 0 ? (
        <span className="text-xs" style={{ color: 'var(--pg-text-muted)' }}>
          (global scope)
        </span>
      ) : (
        <div className="space-y-0.5">
          {[...callStack].reverse().map((frame, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs rounded px-1.5 py-0.5"
              style={{
                background: idx === 0 ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                fontFamily: 'var(--pg-font-mono)',
              }}
            >
              <span
                className="font-medium"
                style={{
                  color: idx === 0 ? 'var(--pg-accent-purple)' : 'var(--pg-text-primary)',
                }}
              >
                {frame.functionName}
              </span>
              <span style={{ color: 'var(--pg-text-muted)' }}>:L{frame.line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TimelinePlayer;
