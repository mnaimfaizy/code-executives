import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Settings } from 'lucide-react';
import type { ControlPanelProps } from '../../../../../../types/datastructures';

/**
 * Control Panel for Data Structure Visualizations
 * Provides play/pause, step controls, speed adjustment, and operation buttons
 */
export const DSControlPanel: React.FC<ControlPanelProps> = ({
  operations,
  onOperation,
  canUndo,
  canRedo,
  canPlay,
  canPause,
  canReset,
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onSpeedChange,
  onStepChange,
}) => {
  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(event.target.value);
    onSpeedChange(newSpeed);
  };

  const handleStepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStep = parseInt(event.target.value, 10);
    onStepChange(newStep);
  };

  const progressPercentage = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-3">
        {/* Step Backward */}
        <button
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          disabled={!canUndo}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:opacity-50 transition-colors"
          title="Previous Step"
        >
          <SkipBack className="w-5 h-5 text-gray-700" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => (isPlaying ? onOperation('pause') : onOperation('play'))}
          disabled={!canPlay && !canPause}
          className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:opacity-50 text-white transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        {/* Step Forward */}
        <button
          onClick={() => onStepChange(Math.min(totalSteps - 1, currentStep + 1))}
          disabled={!canRedo}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:opacity-50 transition-colors"
          title="Next Step"
        >
          <SkipForward className="w-5 h-5 text-gray-700" />
        </button>

        {/* Reset */}
        <button
          onClick={() => onOperation('reset')}
          disabled={!canReset}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:opacity-50 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={totalSteps - 1}
          value={currentStep}
          onChange={handleStepChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          disabled={isPlaying}
        />
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Animation Speed: {speed.toFixed(1)}x
        </label>
        <input
          type="range"
          min={0.1}
          max={3}
          step={0.1}
          value={speed}
          onChange={handleSpeedChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0.1x</span>
          <span>1.0x</span>
          <span>3.0x</span>
        </div>
      </div>

      {/* Operation Buttons */}
      {operations.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Operations
          </label>
          <div className="grid grid-cols-2 gap-2">
            {operations.map((operation: string) => (
              <button
                key={operation}
                onClick={() => onOperation(operation)}
                disabled={isPlaying}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:opacity-50 rounded-lg transition-colors capitalize"
              >
                {operation.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings Button */}
      <div className="flex justify-center pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onOperation('settings')}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default DSControlPanel;
