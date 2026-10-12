import React from 'react';
import { BookOpen, X } from 'lucide-react';
import { FILE_EXTENSION_MAP } from '../../hooks/useMonaco';
import type { PlaygroundLanguage } from '../../types';

interface EditorTabsProps {
  language: PlaygroundLanguage;
  onReset: () => void;
  /** What the reset button does, when it is not the default template it returns to */
  resetLabel?: string;
  /** The open exercise's title, shown beside the file name */
  exerciseTitle?: string;
  /** The story the loaded example is the program of */
  story?: { label: string; href: string } | null;
}

const EditorTabs: React.FC<EditorTabsProps> = ({
  language,
  onReset,
  resetLabel,
  exerciseTitle,
  story,
}) => {
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
          aria-label={resetLabel ?? `Reset ${filename} to default template`}
          title={resetLabel ?? 'Reset to default code'}
          style={{ color: 'var(--pg-text-muted)' }}
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {exerciseTitle && (
        <span
          className="px-3 text-xs truncate min-w-0"
          style={{ color: 'var(--pg-text-secondary)' }}
        >
          Exercise: {exerciseTitle}
        </span>
      )}

      {story && (
        <a
          href={story.href}
          className="ml-auto mr-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs shrink-0 underline-offset-2 hover:underline"
          style={{ color: 'var(--pg-accent-blue)' }}
          title={story.label}
          aria-label={`Read the story: ${story.label}`}
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          Read the story
        </a>
      )}
    </div>
  );
};

export default EditorTabs;
