import React from 'react';
import PlaygroundLayout from './components/layout/PlaygroundLayout';
import BackToSiteLink from './components/layout/BackToSiteLink';
import './components/theme/playground-theme.css';

const PlaygroundApp: React.FC = () => {
  return (
    <PlaygroundLayout>
      {/* Top toolbar area */}
      <div
        className="flex items-center gap-4 px-4 shrink-0"
        style={{
          height: 'var(--pg-toolbar-height)',
          borderBottom: '1px solid var(--pg-border)',
          background: 'var(--pg-bg-toolbar-translucent)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <BackToSiteLink />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--pg-accent-green)' }} />
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: 'var(--pg-text-primary)' }}
          >
            Playground
          </span>
        </div>
        <div className="flex-1" />
        {/* Toolbar controls will go here in Phase 1 */}
      </div>

      {/* Three-pane content area (placeholders) */}
      <div className="flex-1 grid grid-cols-3 gap-1 p-1 min-h-0">
        {/* Editor Pane */}
        <div
          className="flex flex-col items-center justify-center rounded-lg"
          style={{
            background: 'var(--pg-bg-surface-translucent)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--pg-border)',
          }}
        >
          <span
            className="text-sm font-medium"
            style={{
              color: 'var(--pg-text-muted)',
              fontFamily: 'var(--pg-font-mono)',
            }}
          >
            Editor
          </span>
          <span className="text-xs mt-1" style={{ color: 'var(--pg-text-muted)' }}>
            Monaco Editor — Phase 1
          </span>
        </div>

        {/* Visualization Pane */}
        <div
          className="flex flex-col items-center justify-center rounded-lg"
          style={{
            background: 'var(--pg-bg-surface-translucent)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--pg-border)',
          }}
        >
          <span
            className="text-sm font-medium"
            style={{
              color: 'var(--pg-text-muted)',
              fontFamily: 'var(--pg-font-mono)',
            }}
          >
            Visualization
          </span>
          <span className="text-xs mt-1" style={{ color: 'var(--pg-text-muted)' }}>
            React Flow / SVG — Phase 3
          </span>
        </div>

        {/* Output Pane */}
        <div
          className="flex flex-col items-center justify-center rounded-lg"
          style={{
            background: 'var(--pg-bg-surface-translucent)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--pg-border)',
          }}
        >
          <span
            className="text-sm font-medium"
            style={{
              color: 'var(--pg-text-muted)',
              fontFamily: 'var(--pg-font-mono)',
            }}
          >
            Output
          </span>
          <span className="text-xs mt-1" style={{ color: 'var(--pg-text-muted)' }}>
            Console & Timeline — Phase 1
          </span>
        </div>
      </div>
    </PlaygroundLayout>
  );
};

export default PlaygroundApp;
