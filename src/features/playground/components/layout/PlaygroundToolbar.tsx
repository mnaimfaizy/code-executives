import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import BackToSiteLink from './BackToSiteLink';
import LanguagePicker from '../editor/LanguagePicker';
import ExecutionController from '../execution/ExecutionController';
import LensSelector from '../visualizations/LensSelector';
import { exampleSnippets, type ExampleSnippet } from '../../utils/exampleSnippets';
import type {
  PlaygroundLanguage,
  VisualizationLens,
  ExecutionState,
  StateSnapshot,
} from '../../types';

interface PlaygroundToolbarProps {
  language: PlaygroundLanguage;
  onLanguageChange: (lang: PlaygroundLanguage) => void;
  activeLens: VisualizationLens;
  onLensChange: (lens: VisualizationLens) => void;
  currentSnapshot: StateSnapshot | null;
  instrumentedMode: boolean;
  onInstrumentedModeChange: (on: boolean) => void;
  executionState: ExecutionState;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onLoadSnippet: (snippet: ExampleSnippet) => void;
  onOpenSettings: () => void;
}

const PlaygroundToolbar: React.FC<PlaygroundToolbarProps> = ({
  language,
  onLanguageChange,
  activeLens,
  onLensChange,
  currentSnapshot,
  instrumentedMode,
  onInstrumentedModeChange,
  executionState,
  onRun,
  onStop,
  onReset,
  onLoadSnippet,
  onOpenSettings,
}) => {
  const [snippetMenuOpen, setSnippetMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!snippetMenuOpen) return;
    const handler = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSnippetMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [snippetMenuOpen]);

  // Close on Escape
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      setSnippetMenuOpen(false);
    }
  }, []);

  const filteredSnippets = exampleSnippets.filter((s) => s.language === language);

  return (
    <div
      className="flex items-center gap-3 px-4 shrink-0"
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

      {/* Separator */}
      <div className="w-px h-5" style={{ background: 'var(--pg-border)' }} aria-hidden="true" />

      {/* Language picker */}
      <LanguagePicker language={language} onLanguageChange={onLanguageChange} />

      {/* Trace toggle */}
      <label
        className="flex items-center gap-1.5 text-xs cursor-pointer select-none"
        style={{ color: 'var(--pg-text-secondary)' }}
      >
        <input
          type="checkbox"
          checked={instrumentedMode}
          onChange={(e) => onInstrumentedModeChange(e.target.checked)}
          className="accent-blue-500"
        />
        <span>Trace</span>
      </label>

      {/* Separator */}
      <div className="w-px h-5" style={{ background: 'var(--pg-border)' }} aria-hidden="true" />

      {/* Lens selector */}
      <LensSelector
        activeLens={activeLens}
        onLensChange={onLensChange}
        currentSnapshot={currentSnapshot}
      />

      {/* Separator */}
      <div className="w-px h-5" style={{ background: 'var(--pg-border)' }} aria-hidden="true" />

      {/* Example snippets dropdown */}
      <div ref={menuRef} className="relative" onKeyDown={handleMenuKeyDown}>
        <button
          onClick={() => setSnippetMenuOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors duration-150"
          style={{
            color: 'var(--pg-text-secondary)',
            border: '1px solid var(--pg-border)',
            background: snippetMenuOpen ? 'var(--pg-bg-surface-hover)' : 'transparent',
          }}
          aria-haspopup="listbox"
          aria-expanded={snippetMenuOpen}
        >
          <BookOpen size={13} />
          <span>Examples</span>
          <ChevronDown
            size={12}
            className={`transition-transform duration-150 ${snippetMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {snippetMenuOpen && (
          <div
            role="listbox"
            className="absolute top-full left-0 mt-1 min-w-56 rounded-lg shadow-xl overflow-hidden z-50"
            style={{
              border: '1px solid var(--pg-border)',
              background: 'var(--pg-bg-secondary)',
            }}
          >
            {filteredSnippets.length > 0 ? (
              filteredSnippets.map((snippet) => (
                <button
                  key={snippet.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    onLoadSnippet(snippet);
                    setSnippetMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 transition-colors duration-100"
                  style={{
                    borderBottom: '1px solid var(--pg-border)',
                    color: 'var(--pg-text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      'var(--pg-bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <div className="text-xs font-medium">{snippet.label}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--pg-text-muted)' }}>
                    {snippet.description}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-xs" style={{ color: 'var(--pg-text-muted)' }}>
                No examples for this language yet.
              </div>
            )}

            {/* Show other languages' snippets as dimmed */}
            {exampleSnippets.filter((s) => s.language !== language).length > 0 && (
              <>
                <div
                  className="px-3 py-1.5 text-[10px] uppercase tracking-wider"
                  style={{
                    color: 'var(--pg-text-muted)',
                    background: 'var(--pg-bg-tertiary)',
                  }}
                >
                  Other Languages
                </div>
                {exampleSnippets
                  .filter((s) => s.language !== language)
                  .map((snippet) => (
                    <button
                      key={snippet.id}
                      role="option"
                      aria-selected={false}
                      onClick={() => {
                        onLoadSnippet(snippet);
                        setSnippetMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 transition-colors duration-100"
                      style={{
                        borderBottom: '1px solid var(--pg-border)',
                        color: 'var(--pg-text-muted)',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          'var(--pg-bg-surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <span>{snippet.label}</span>
                        <span
                          className="px-1 py-0.5 rounded text-[9px]"
                          style={{ background: 'var(--pg-bg-tertiary)' }}
                        >
                          {snippet.language}
                        </span>
                      </div>
                      <div className="text-[10px] mt-0.5">{snippet.description}</div>
                    </button>
                  ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Settings gear */}
      <button
        onClick={onOpenSettings}
        className="p-1.5 rounded-md transition-colors duration-150"
        style={{ color: 'var(--pg-text-muted)' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = 'var(--pg-text-primary)';
          (e.currentTarget as HTMLElement).style.background = 'var(--pg-bg-surface-hover)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = 'var(--pg-text-muted)';
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }}
        aria-label="Playground settings"
        title="Settings"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {/* Execution controls */}
      <ExecutionController
        executionState={executionState}
        onRun={onRun}
        onStop={onStop}
        onReset={onReset}
      />
    </div>
  );
};

export default PlaygroundToolbar;
