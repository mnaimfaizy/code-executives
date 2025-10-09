import React from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Zap } from 'lucide-react';

interface VisualizationControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onPlayPause: () => void;
  onReset: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onSpeedChange: (speed: number) => void;
  className?: string;
}

const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onPlayPause,
  onReset,
  onStepBack,
  onStepForward,
  onSpeedChange,
  className = '',
}) => {
  const speedOptions = [0.25, 0.5, 1, 1.5, 2];

  return (
    <div
      className={`flex items-center gap-2 p-4 bg-white rounded-lg border border-gray-200 ${className}`}
    >
      {/* Play/Pause */}
      <button
        onClick={onPlayPause}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Step Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onStepBack}
          disabled={currentStep === 0}
          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          title="Previous Step"
        >
          <SkipBack size={16} />
        </button>

        <span className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">
          {currentStep + 1} / {totalSteps}
        </span>

        <button
          onClick={onStepForward}
          disabled={currentStep === totalSteps - 1}
          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          title="Next Step"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
        title="Reset"
      >
        <RotateCcw size={16} />
        Reset
      </button>

      {/* Speed Control */}
      <div className="flex items-center gap-2 ml-4">
        <Zap size={16} className="text-gray-600" />
        <select
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm"
        >
          {speedOptions.map((option) => (
            <option key={option} value={option}>
              {option}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Memoize controls to prevent re-renders when props haven't changed
// Callbacks should be wrapped in useCallback by parent component
export default React.memo(VisualizationControls);
