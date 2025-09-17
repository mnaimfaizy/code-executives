import React from 'react';
import RunnerToolbar, { type Speed } from './RunnerToolbar';

export type InputMode = 'js' | 'dsl';

type EditorProps = {
  title?: string;
  selectId?: string;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;

  source: string;
  onSourceChange: (value: string) => void;
  placeholderJs: string;
  placeholderDsl: string;

  showHighlighted: boolean;
  renderHighlighted?: () => React.ReactNode;

  running: boolean;
  speed: Speed;
  onRunToggle: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (s: Speed) => void;

  onLoadExample: () => void;
  onClear: () => void;
  extraButtons?: React.ReactNode;
};

const Editor: React.FC<EditorProps> = ({
  title = 'Editor',
  selectId = 'input-mode-select',
  inputMode,
  onInputModeChange,
  source,
  onSourceChange,
  placeholderJs,
  placeholderDsl,
  showHighlighted,
  renderHighlighted,
  running,
  speed,
  onRunToggle,
  onStep,
  onReset,
  onSpeedChange,
  onLoadExample,
  onClear,
  extraButtons,
}) => {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Enhanced header with responsive design */}
      <div className="mb-3 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-3 shadow-sm">
        {/* Title row - always visible */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500"></div>
            <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
          </div>
          <div className="text-xs text-slate-500">Ready to code</div>
        </div>

        {/* Controls row - responsive layout */}
        <div className="flex flex-col gap-3 sm:justify-between">
          {/* Input mode selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600" htmlFor={selectId}>
              Language
            </label>
            <select
              id={selectId}
              className="min-w-32 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:border-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={inputMode}
              onChange={(e) => onInputModeChange(e.target.value as InputMode)}
            >
              <option value="js">JavaScript</option>
              <option value="dsl">Simple DSL</option>
            </select>
          </div>

          {/* Toolbar - responsive */}
          <div className="flex">
            <RunnerToolbar
              running={running}
              speed={speed}
              onRunToggle={onRunToggle}
              onStep={onStep}
              onReset={onReset}
              onSpeedChange={onSpeedChange}
              className="flex-shrink-0"
            />
          </div>
        </div>
      </div>
      {/* Enhanced editor area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
          {showHighlighted ? (
            renderHighlighted ? (
              <div className="h-full overflow-auto p-3">{renderHighlighted()}</div>
            ) : null
          ) : (
            <textarea
              value={source}
              onChange={(e) => onSourceChange(e.target.value)}
              className="h-full min-h-80 w-full resize-none border-0 bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none focus:ring-0 sm:min-h-96 lg:min-h-[28rem]"
              placeholder={inputMode === 'js' ? placeholderJs : placeholderDsl}
              style={{
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                lineHeight: '1.6',
              }}
            />
          )}
        </div>

        {/* Enhanced action buttons */}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:flex-initial"
              onClick={onLoadExample}
            >
              📝 Load Example
            </button>
            <button
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:flex-initial"
              onClick={onClear}
            >
              🗑️ Clear
            </button>
            {extraButtons}
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
            <span>Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
