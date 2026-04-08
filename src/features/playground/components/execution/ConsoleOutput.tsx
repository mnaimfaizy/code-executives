import React, { useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import type { ConsoleEntry } from '../../types';

interface ConsoleOutputProps {
  entries: ConsoleEntry[];
  onClear: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  log: 'var(--pg-text-primary)',
  warn: 'var(--pg-accent-amber)',
  error: 'var(--pg-accent-red)',
  info: 'var(--pg-accent-blue)',
};

const TYPE_PREFIXES: Record<string, string> = {
  log: '',
  warn: '⚠ ',
  error: '✖ ',
  info: 'ℹ ',
};

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ entries, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest entry
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="flex flex-col h-full">
      {/* Console header */}
      <div
        className="flex items-center justify-between px-3 shrink-0"
        style={{
          height: '32px',
          borderBottom: '1px solid var(--pg-border)',
          background: 'var(--pg-bg-surface)',
        }}
      >
        <span
          className="text-xs font-medium"
          style={{ color: 'var(--pg-text-secondary)', fontFamily: 'var(--pg-font-mono)' }}
        >
          Console
        </span>
        <button
          onClick={onClear}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: 'var(--pg-text-muted)' }}
          aria-label="Clear console"
          title="Clear console (Ctrl+L)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Console entries */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2"
        role="log"
        aria-live="polite"
        aria-label="Console output"
        style={{ background: 'var(--pg-bg-primary)' }}
      >
        {entries.length === 0 ? (
          <div
            className="flex items-center justify-center h-full text-xs"
            style={{ color: 'var(--pg-text-muted)', fontFamily: 'var(--pg-font-mono)' }}
          >
            Run code to see output here...
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-2 px-2 py-1 text-xs leading-relaxed hover:bg-white/[0.02] rounded"
              style={{
                fontFamily: 'var(--pg-font-mono)',
                color: TYPE_COLORS[entry.type] ?? TYPE_COLORS.log,
                borderBottom: '1px solid rgba(42, 42, 78, 0.3)',
              }}
            >
              <span className="shrink-0 select-none" style={{ width: '1ch' }}>
                {TYPE_PREFIXES[entry.type]}
              </span>
              <pre className="whitespace-pre-wrap break-all flex-1 m-0">
                {entry.args.map(String).join(' ')}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsoleOutput;
