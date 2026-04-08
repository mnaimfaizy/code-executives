import React from 'react';
import { Play, Square, RotateCcw, Loader2 } from 'lucide-react';
import type { ExecutionState } from '../../types';

interface ExecutionControllerProps {
  executionState: ExecutionState;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
}

const ExecutionController: React.FC<ExecutionControllerProps> = ({
  executionState,
  onRun,
  onStop,
  onReset,
}) => {
  const isRunning = executionState === 'running';
  const isIdle =
    executionState === 'idle' || executionState === 'completed' || executionState === 'error';

  return (
    <div className="flex items-center gap-2">
      {/* Run / Stop button */}
      {isRunning ? (
        <button
          onClick={onStop}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
          style={{
            color: 'var(--pg-accent-red)',
            background: 'rgba(255, 68, 102, 0.1)',
            border: '1px solid rgba(255, 68, 102, 0.3)',
          }}
          aria-label="Stop execution"
          title="Stop (Esc)"
        >
          <Square className="w-3.5 h-3.5" />
          Stop
        </button>
      ) : (
        <button
          onClick={onRun}
          disabled={!isIdle}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
          style={{
            color: isIdle ? 'var(--pg-accent-green)' : 'var(--pg-text-muted)',
            background: isIdle ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
            border: `1px solid ${isIdle ? 'rgba(0, 255, 136, 0.3)' : 'var(--pg-border)'}`,
            cursor: isIdle ? 'pointer' : 'not-allowed',
          }}
          aria-label="Run code"
          title="Run (Ctrl+Enter)"
        >
          <Play className="w-3.5 h-3.5" />
          Run
        </button>
      )}

      {/* Reset button */}
      <button
        onClick={onReset}
        disabled={isRunning}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-colors"
        style={{
          color: isRunning ? 'var(--pg-text-muted)' : 'var(--pg-text-secondary)',
          background: 'transparent',
          border: '1px solid var(--pg-border)',
          cursor: isRunning ? 'not-allowed' : 'pointer',
        }}
        aria-label="Reset code to default"
        title="Reset"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      {/* Running indicator */}
      {isRunning && (
        <Loader2
          className="w-4 h-4 animate-spin"
          style={{ color: 'var(--pg-accent-amber)' }}
          aria-label="Code is running"
        />
      )}

      {/* Execution state badge */}
      {executionState === 'error' && (
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            color: 'var(--pg-accent-red)',
            background: 'rgba(255, 68, 102, 0.1)',
          }}
        >
          Error
        </span>
      )}
      {executionState === 'completed' && (
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            color: 'var(--pg-accent-green)',
            background: 'rgba(0, 255, 136, 0.1)',
          }}
        >
          Done
        </span>
      )}
    </div>
  );
};

export default ExecutionController;
