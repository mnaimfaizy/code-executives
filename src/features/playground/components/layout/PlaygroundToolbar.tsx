import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import BackToSiteLink from './BackToSiteLink';
import LanguagePicker from '../editor/LanguagePicker';
import ExecutionController from '../execution/ExecutionController';
import LensSelector from '../visualizations/LensSelector';
import { examples, type Example } from '../../utils/examples';
import type { PlaygroundLanguage, VisualizationLens, ExecutionState } from '../../types';

interface PlaygroundToolbarProps {
  language: PlaygroundLanguage;
  onLanguageChange: (lang: PlaygroundLanguage) => void;
  activeLens: VisualizationLens;
  onLensChange: (lens: VisualizationLens) => void;
  instrumentedMode: boolean;
  onInstrumentedModeChange: (on: boolean) => void;
  executionState: ExecutionState;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onLoadExample: (example: Example) => void;
  onOpenSettings: () => void;
}

const PlaygroundToolbar: React.FC<PlaygroundToolbarProps> = ({
  language,
  onLanguageChange,
  activeLens,
  onLensChange,
  instrumentedMode,
  onInstrumentedModeChange,
  executionState,
  onRun,
  onStop,
  onReset,
  onLoadExample,
  onOpenSettings,
}) => {
  const [exampleMenuOpen, setExampleMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!exampleMenuOpen) return;
    const handler = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setExampleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [exampleMenuOpen]);

  // Close on Escape
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      setExampleMenuOpen(false);
    }
  }, []);

  const languageExamples = examples.filter((s) => s.language === language);

  return (
    // Below 2xl the lens and the examples move to a second row, so the first row
    // (with Run at its end) always fits; from 2xl everything is one row.
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-1.5 shrink-0 2xl:flex-nowrap"
      style={{
        minHeight: 'var(--pg-toolbar-height)',
        borderBottom: '1px solid var(--pg-border)',
        background: 'var(--pg-bg-toolbar-translucent)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <BackToSiteLink />

      <div className="flex items-center gap-2 shrink-0">
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
        className="flex items-center gap-1.5 text-xs cursor-pointer select-none shrink-0"
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

      {/* Lens and examples: a row of their own below 2xl */}
      <div className="order-last flex basis-full items-center gap-3 min-w-0 2xl:order-none 2xl:basis-auto">
        {/* Separator */}
        <div
          className="hidden w-px h-5 2xl:block"
          style={{ background: 'var(--pg-border)' }}
          aria-hidden="true"
        />

        {/* Lens selector */}
        <LensSelector activeLens={activeLens} onLensChange={onLensChange} />

        {/* Separator */}
        <div className="w-px h-5" style={{ background: 'var(--pg-border)' }} aria-hidden="true" />

        {/* Examples dropdown */}
        <div ref={menuRef} className="relative" onKeyDown={handleMenuKeyDown}>
          <button
            onClick={() => setExampleMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors duration-150"
            style={{
              color: 'var(--pg-text-secondary)',
              border: '1px solid var(--pg-border)',
              background: exampleMenuOpen ? 'var(--pg-bg-surface-hover)' : 'transparent',
            }}
            aria-haspopup="listbox"
            aria-expanded={exampleMenuOpen}
          >
            <BookOpen size={13} />
            <span>Examples</span>
            <ChevronDown
              size={12}
              className={`transition-transform duration-150 ${exampleMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {exampleMenuOpen && (
            <div
              role="listbox"
              className="absolute top-full left-0 mt-1 min-w-56 rounded-lg shadow-xl overflow-hidden z-50"
              style={{
                border: '1px solid var(--pg-border)',
                background: 'var(--pg-bg-secondary)',
              }}
            >
              {languageExamples.length > 0 ? (
                languageExamples.map((example) => (
                  <button
                    key={example.id}
                    role="option"
                    aria-selected={false}
                    onClick={() => {
                      onLoadExample(example);
                      setExampleMenuOpen(false);
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
                    <div className="text-xs font-medium">{example.label}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--pg-text-muted)' }}>
                      {example.description}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-xs" style={{ color: 'var(--pg-text-muted)' }}>
                  No examples for this language yet.
                </div>
              )}

              {/* Show other languages' examples as dimmed */}
              {examples.filter((s) => s.language !== language).length > 0 && (
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
                  {examples
                    .filter((s) => s.language !== language)
                    .map((example) => (
                      <button
                        key={example.id}
                        role="option"
                        aria-selected={false}
                        onClick={() => {
                          onLoadExample(example);
                          setExampleMenuOpen(false);
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
                          <span>{example.label}</span>
                          <span
                            className="px-1 py-0.5 rounded text-[9px]"
                            style={{ background: 'var(--pg-bg-tertiary)' }}
                          >
                            {example.language}
                          </span>
                        </div>
                        <div className="text-[10px] mt-0.5">{example.description}</div>
                      </button>
                    ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1" />

      {/* Settings gear */}
      <button
        onClick={onOpenSettings}
        className="p-1.5 rounded-md transition-colors duration-150 shrink-0"
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
