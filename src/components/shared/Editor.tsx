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
      <div className="mb-2 rounded-md border border-gray-200 bg-gray-100 p-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 text-sm font-semibold">{title}</div>
          <label className="text-xs text-gray-600" htmlFor={selectId}>
            Input
          </label>
          <select
            id={selectId}
            className="min-w-40 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
            value={inputMode}
            onChange={(e) => onInputModeChange(e.target.value as InputMode)}
          >
            <option value="js">JavaScript</option>
            <option value="dsl">Simple DSL</option>
          </select>
          <div className="mx-2 h-5 w-px bg-gray-300" />
          <RunnerToolbar
            running={running}
            speed={speed}
            onRunToggle={onRunToggle}
            onStep={onStep}
            onReset={onReset}
            onSpeedChange={onSpeedChange}
          />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-auto">
          {showHighlighted ? (
            renderHighlighted ? (
              <>{renderHighlighted()}</>
            ) : null
          ) : (
            <textarea
              value={source}
              onChange={(e) => onSourceChange(e.target.value)}
              className="h-full min-h-64 w-full resize-none rounded-md border border-gray-300 p-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              placeholder={inputMode === 'js' ? placeholderJs : placeholderDsl}
              rows={12}
            />
          )}
        </div>
        <div className="my-2 h-px bg-gray-200" />
        <div className="flex flex-row flex-wrap gap-2">
          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            onClick={onLoadExample}
          >
            Load Example
          </button>
          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            onClick={onClear}
          >
            Clear
          </button>
          {extraButtons}
        </div>
      </div>
    </div>
  );
};

export default Editor;
