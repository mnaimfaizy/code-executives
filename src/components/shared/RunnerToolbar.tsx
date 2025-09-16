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
      <div className="flex items-center gap-2">
        <button
          title={running ? 'Stop' : 'Run'}
          onClick={onRunToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
        >
          {running ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button
          title="Step"
          onClick={onStep}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
        >
          <StepForward className="h-4 w-4" />
        </button>
        <button
          title="Reset"
          onClick={onReset}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-700 text-white hover:bg-gray-600"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <label className="ml-2 text-xs text-gray-600" htmlFor="speed-select-shared">
          Speed
        </label>
        <select
          id="speed-select-shared"
          className="min-w-36 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
          value={speed}
          onChange={(e) => onSpeedChange(e.target.value as Speed)}
        >
          <option value="very-slow">Very Slow</option>
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
        </select>
      </div>
    </div>
  );
};

export default RunnerToolbar;
