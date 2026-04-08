import React from 'react';
import { X } from 'lucide-react';
import { FILE_EXTENSION_MAP } from '../../hooks/useMonaco';
import type { PlaygroundLanguage } from '../../types';

interface EditorTabsProps {
  language: PlaygroundLanguage;
  onReset: () => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({ language, onReset }) => {
  const filename = FILE_EXTENSION_MAP[language];

  return (
    <div
      className="flex items-center shrink-0"
      style={{
        height: '32px',
        borderBottom: '1px solid var(--pg-border)',
        background: 'var(--pg-bg-surface)',
      }}
    >
      {/* Active tab */}
      <div
        className="flex items-center gap-2 px-3 h-full text-xs font-medium"
        style={{
          color: 'var(--pg-text-primary)',
          borderBottom: '2px solid var(--pg-accent-blue)',
          background: 'var(--pg-bg-primary)',
          fontFamily: 'var(--pg-font-mono)',
        }}
      >
        <span>{filename}</span>
        <button
          onClick={onReset}
          className="p-0.5 rounded hover:bg-white/10 transition-colors"
          aria-label={`Reset ${filename} to default template`}
          title="Reset to default code"
          style={{ color: 'var(--pg-text-muted)' }}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default EditorTabs;
