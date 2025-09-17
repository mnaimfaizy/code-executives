import React from 'react';
import { Play, Square, RotateCcw, StepForward } from 'lucide-react';

export type Speed = 'very-slow' | 'slow' | 'normal';

type Props = {
  running: boolean;
  speed: Speed;
  onRunToggle: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (s: Speed) => void;
  className?: string;
};

const RunnerToolbar: React.FC<Props> = ({
  running,
  speed,
  onRunToggle,
  onStep,
  onReset,
  onSpeedChange,
  className,
}) => {
  return (
    <div className={className ?? ''}>
      <div className="flex gap-2">
        {/* Control buttons */}
        <div className="flex items-center justify-center gap-1.5">
          <button
            title={running ? 'Stop Execution' : 'Run Code'}
            onClick={onRunToggle}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 sm:h-9 sm:w-9 ${
              running
                ? 'bg-red-600 hover:bg-red-500 focus:ring-red-200'
                : 'bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-200'
            }`}
          >
            {running ? (
              <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </button>
          <button
            title="Step Through Code"
            onClick={onStep}
            disabled={running}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition-all hover:bg-emerald-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-1 disabled:bg-gray-400 disabled:cursor-not-allowed sm:h-9 sm:w-9"
          >
            <StepForward className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            title="Reset Code"
            onClick={onReset}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-600 text-white shadow-sm transition-all hover:bg-slate-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1 sm:h-9 sm:w-9"
          >
            <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Speed control - now always below buttons for better mobile/tablet experience */}
        <div className="flex items-center justify-center gap-2">
          <select
            id="speed-select-shared"
            className="min-w-28 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium shadow-sm transition-colors hover:border-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:min-w-32 sm:text-sm"
            value={speed}
            onChange={(e) => onSpeedChange(e.target.value as Speed)}
          >
            <option value="very-slow">🐌 Very Slow</option>
            <option value="slow">🚶 Slow</option>
            <option value="normal">🏃 Normal</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RunnerToolbar;
