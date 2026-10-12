import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import type { StoryPlayback, StorySpeed } from './useStoryPlayback';

export interface StoryControlsProps {
  /** The story's beats, for the beat strip. */
  beats: readonly { id: string; title: string }[];
  playback: StoryPlayback;
  /** Called instead of `playback.restart` when the section has more to clear. */
  onRestart?: () => void;
  /** The 2D full-screen button; in 3D it lives in the viewer's toolbar, so pass nothing. */
  fullscreen?: { supported: boolean; isFullscreen: boolean; toggle: () => void };
}

/** A story's control row: restart, previous, play/pause, next, the beat strip and the speed. */
const StoryControls: React.FC<StoryControlsProps> = ({
  beats,
  playback,
  onRestart,
  fullscreen,
}) => {
  const { index, last, playing, speed } = playback;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <ControlButton label="Restart" onClick={onRestart ?? playback.restart}>
        <RotateCcw className="h-4 w-4" />
      </ControlButton>
      <ControlButton label="Previous beat" onClick={() => playback.go(-1)} disabled={index === 0}>
        <ChevronLeft className="h-4 w-4" />
      </ControlButton>
      <ControlButton label={playing ? 'Pause' : 'Play'} onClick={playback.togglePlay} primary>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </ControlButton>
      <ControlButton label="Next beat" onClick={() => playback.go(1)} disabled={index === last}>
        <ChevronRight className="h-4 w-4" />
      </ControlButton>

      <div className="mx-1 flex gap-1" aria-hidden>
        {beats.map((s, i) => (
          <button
            key={s.id}
            type="button"
            tabIndex={-1}
            title={s.title}
            onClick={() => playback.select(i)}
            className={`h-2 w-2 rounded-full transition-colors sm:w-4 ${
              i === index ? 'bg-indigo-600' : i < index ? 'bg-indigo-300' : 'bg-slate-300'
            }`}
          />
        ))}
      </div>

      <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-600">
        Speed
        <select
          value={speed}
          onChange={(e) => playback.setSpeed(e.target.value as StorySpeed)}
          className="rounded border border-slate-300 bg-white px-1.5 py-1 text-xs"
        >
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </select>
      </label>
      {fullscreen?.supported && (
        <ControlButton
          label={fullscreen.isFullscreen ? 'Exit full screen' : 'Full screen'}
          onClick={fullscreen.toggle}
        >
          {fullscreen.isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </ControlButton>
      )}
    </div>
  );
};

const ControlButton: React.FC<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: React.ReactNode;
}> = ({ label, onClick, disabled, primary, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
      primary ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-700 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
);

export default StoryControls;
