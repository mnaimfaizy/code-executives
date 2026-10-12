/**
 * StepControls — Step slider, playback controls, speed selector, and a compact
 * panel of the current step's snapshot: the top frame's slots and the call stack.
 *
 * Keyboard shortcuts:
 * - Left/Right arrows: step backward/forward
 * - Space: toggle play/pause
 * - Home/End: first/last step
 */

import React, { useCallback } from 'react';
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
import { slotKey } from '../../../../shared/snapshot';
import type { Slot, Snapshot, StackFrame } from '../../../../shared/snapshot';
import type { Step } from '../../tracer';
import type { PlaybackSpeed } from '../../hooks/useTrace';

interface StepControlsProps {
  /** Index of the current step */
  index: number;
  /** Number of steps in the trace */
  stepCount: number;
  /** The current step */
  step: Step | null;
  /** Whether auto-play is active */
  isPlaying: boolean;
  /** Current playback speed */
  speed: PlaybackSpeed;
  /** Go to a specific step */
  onGoToStep: (index: number) => void;
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
  /**
   * Leave out the top frame and call stack. Set while a lens is drawing the step,
   * because the lens shows the same frames and needs the height.
   */
  compact?: boolean;
}

const SPEED_OPTIONS: PlaybackSpeed[] = [0.5, 1, 2, 4];

const StepControls: React.FC<StepControlsProps> = ({
  index,
  stepCount,
  step,
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
  compact = false,
}) => {
  // Keyboard shortcuts (Arrow, Space, Home, End) are handled globally
  // by PlaygroundApp to avoid duplicate listeners that conflict with
  // Monaco editor input.

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      onGoToStep(parseInt(e.target.value, 10));
    },
    [onGoToStep]
  );

  if (stepCount === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full p-4"
        style={{ color: 'var(--pg-text-muted)' }}
      >
        <Layers size={32} className="mb-2 opacity-40" />
        <span className="text-sm font-medium">No steps yet</span>
        <span className="text-xs mt-1">Run code with Trace on to record its steps</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" role="region" aria-label="Steps">
      {/* Step slider + controls */}
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
            Step {index + 1} of {stepCount}
          </span>
          {step && (
            <span
              className="text-xs"
              style={{ color: 'var(--pg-text-muted)', fontFamily: 'var(--pg-font-mono)' }}
            >
              Line {step.line}
            </span>
          )}
        </div>

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={stepCount - 1}
          value={index}
          onChange={handleSliderChange}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
          style={{
            accentColor: 'var(--pg-accent-blue)',
            background: 'var(--pg-bg-panel)',
          }}
          aria-label={`Step ${index + 1} of ${stepCount}`}
        />

        {/* Playback buttons */}
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <IconButton onClick={onFirstStep} label="First step" disabled={index === 0}>
            <SkipBack size={14} />
          </IconButton>
          <IconButton onClick={onPrevStep} label="Previous step" disabled={index === 0}>
            <ChevronLeft size={14} />
          </IconButton>
          <IconButton
            onClick={isPlaying ? onPause : onPlay}
            label={isPlaying ? 'Pause' : 'Play'}
            accent
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </IconButton>
          <IconButton onClick={onNextStep} label="Next step" disabled={index >= stepCount - 1}>
            <ChevronRight size={14} />
          </IconButton>
          <IconButton onClick={onLastStep} label="Last step" disabled={index >= stepCount - 1}>
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

      {/* The step's snapshot: top frame and call stack */}
      {step && !compact && (
        <div className="flex-1 overflow-y-auto min-h-0">
          <TopFramePanel snapshot={step.snapshot} focus={step.focus} />
          <CallStackPanel frames={step.snapshot.frames} />
        </div>
      )}
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

/** What a slot shows: its value, or an arrow to the entity it references */
function slotText(slot: Slot, snapshot: Snapshot): string {
  if (slot.refId === undefined) return slot.value ?? '';
  const target =
    snapshot.objects.find((object) => object.id === slot.refId)?.label ??
    snapshot.frames.find((frame) => frame.id === slot.refId)?.name;
  return `→ ${target ?? '?'}`;
}

/** Panel showing the slots of the frame on top of the stack */
function TopFramePanel({
  snapshot,
  focus,
}: {
  snapshot: Snapshot;
  focus: string[];
}): React.ReactElement {
  const frame = snapshot.frames[snapshot.frames.length - 1];
  const slots = frame?.slots ?? [];

  return (
    <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--pg-border)' }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Variable size={12} style={{ color: 'var(--pg-accent-blue)' }} />
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--pg-text-muted)' }}
        >
          Top Frame
        </span>
        {frame && (
          <span
            className="text-xs"
            style={{ color: 'var(--pg-text-muted)', fontFamily: 'var(--pg-font-mono)' }}
          >
            {frame.name}
          </span>
        )}
      </div>

      {slots.length === 0 ? (
        <span className="text-xs" style={{ color: 'var(--pg-text-muted)' }}>
          No slots in this frame
        </span>
      ) : (
        <div className="space-y-0.5">
          {slots.map((slot) => {
            const isChanged = focus.includes(slotKey(frame.id, slot.name));

            return (
              <div
                key={slot.name}
                data-changed={isChanged ? 'true' : undefined}
                className="flex items-start gap-2 text-xs rounded px-1.5 py-0.5"
                style={{
                  background: isChanged ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  fontFamily: 'var(--pg-font-mono)',
                }}
              >
                <span
                  className="shrink-0 font-medium"
                  style={{
                    color: isChanged ? 'var(--pg-accent-blue)' : 'var(--pg-text-primary)',
                  }}
                >
                  {slot.name}
                </span>
                <span className="break-all" style={{ color: 'var(--pg-text-secondary)' }}>
                  {slotText(slot, snapshot)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Panel showing the call stack, top frame first */
function CallStackPanel({ frames }: { frames: StackFrame[] }): React.ReactElement {
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
          ({frames.length})
        </span>
      </div>

      <div className="space-y-0.5">
        {[...frames].reverse().map((frame, idx) => (
          <div
            key={frame.id}
            className="text-xs rounded px-1.5 py-0.5 font-medium"
            style={{
              background: idx === 0 ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
              color: idx === 0 ? 'var(--pg-accent-purple)' : 'var(--pg-text-primary)',
              fontFamily: 'var(--pg-font-mono)',
            }}
          >
            {frame.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StepControls;
