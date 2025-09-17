import React from 'react';
import { Play, Square, RotateCcw, StepForward, Camera } from 'lucide-react';
import { type Speed } from '../shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../shared/OutputPanel';

interface ThreeDControlPanelProps {
  // Runner controls
  running: boolean;
  speed: Speed;
  onRunToggle: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: Speed) => void;

  // 3D specific controls
  onFocusCamera: () => void;

  // Output
  outputLines: OutputLine[];
  colorForLabel?: (label?: string) => string | undefined;
}

const ThreeDControlPanel: React.FC<ThreeDControlPanelProps> = ({
  running,
  speed,
  onRunToggle,
  onStep,
  onReset,
  onSpeedChange,
  onFocusCamera,
  outputLines,
  colorForLabel,
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Controls Section */}
      <div className="p-4 space-y-4">
        {/* Animation Controls */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Memory Operations</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onRunToggle}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                running
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {running ? <Square size={14} /> : <Play size={14} />}
              {running ? 'Stop' : 'Run'}
            </button>

            <button
              onClick={onStep}
              disabled={running}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <StepForward size={14} />
              Step
            </button>

            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>

        {/* Speed Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Animation Speed</label>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(e.target.value as Speed)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="very-slow">Very Slow</option>
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
          </select>
        </div>

        {/* 3D Controls */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">3D Scene</h4>
          <button
            onClick={onFocusCamera}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          >
            <Camera size={14} />
            Focus Camera
          </button>
        </div>

        {/* Library Legend */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Library Elements</h4>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>🤖 Robot Librarian</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-800 rounded"></div>
              <span>📚 Bookshelves (Memory)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span>📘 User Objects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>📗 Settings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded"></div>
              <span>📙 Cache Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-400 rounded"></div>
              <span>📕 Lists/Arrays</span>
            </div>
          </div>
        </div>

        {/* Interaction Help */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">3D Controls</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div>
              🖱️ <strong>Left Click + Drag:</strong> Rotate camera
            </div>
            <div>
              🔍 <strong>Mouse Wheel:</strong> Zoom in/out
            </div>
            <div>
              🎯 <strong>Right Click + Drag:</strong> Pan scene
            </div>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 border-t border-gray-300 flex flex-col min-h-0">
        <div className="p-2 flex-shrink-0">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Console Output</h4>
        </div>
        <div className="flex-1 px-2 pb-2 min-h-0">
          <OutputPanel
            lines={outputLines}
            colorForLabel={colorForLabel || (() => undefined)}
            className="h-full flex flex-col"
          />
        </div>
      </div>
    </div>
  );
};

export default ThreeDControlPanel;
