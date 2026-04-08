import React from 'react';
import { Loader2, AlertCircle, Download } from 'lucide-react';
import type { PyodideLoadingState } from '../../services/pyodide-loader';

interface PythonRunnerProps {
  loadingState: PyodideLoadingState;
}

const PythonRunner: React.FC<PythonRunnerProps> = ({ loadingState }) => {
  if (loadingState.status === 'ready' || loadingState.status === 'idle') {
    return null;
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-2"
      style={{
        background: 'var(--pg-bg-surface)',
        borderBottom: '1px solid var(--pg-border)',
      }}
    >
      {loadingState.status === 'loading' && (
        <>
          <Loader2
            className="w-4 h-4 animate-spin shrink-0"
            style={{ color: 'var(--pg-accent-amber)' }}
          />
          <div className="flex flex-col">
            <span className="text-xs font-medium" style={{ color: 'var(--pg-text-primary)' }}>
              Initializing Python runtime...
            </span>
            <span className="text-xs" style={{ color: 'var(--pg-text-muted)' }}>
              <Download className="w-3 h-3 inline mr-1" />
              Downloading Pyodide (~11 MB, first time only)
            </span>
          </div>
        </>
      )}

      {loadingState.status === 'error' && (
        <>
          <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--pg-accent-red)' }} />
          <div className="flex flex-col">
            <span className="text-xs font-medium" style={{ color: 'var(--pg-accent-red)' }}>
              Failed to load Python runtime
            </span>
            <span className="text-xs" style={{ color: 'var(--pg-text-muted)' }}>
              {loadingState.error ?? 'Unknown error'}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default PythonRunner;
