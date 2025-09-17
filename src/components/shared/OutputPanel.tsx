import React, { useEffect, useRef, useState } from 'react';

export type OutputLine = {
  text: string;
  label?: string;
  // domain-specific kinds allowed but not required
  kind?: string;
};

type Props = {
  lines: OutputLine[];
  colorForLabel: (label?: string) => string | undefined;
  className?: string;
  title?: string;
};

const OutputPanel: React.FC<Props> = ({ lines, colorForLabel, className, title = 'Output' }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Auto-scroll to bottom when new lines are added, but only if user was already at bottom
  useEffect(() => {
    if (scrollContainerRef.current && isAtBottom) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [lines, isAtBottom]);

  // Track if user is at bottom of scroll
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px tolerance
      setIsAtBottom(atBottom);
    }
  };

  // Scroll to bottom manually
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  };

  return (
    <div className={`flex h-full flex-col ${className ?? ''}`}>
      {/* Enhanced header */}
      <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-600 bg-gradient-to-r from-slate-800 to-slate-700 px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500"></div>
          <h4 className="text-sm font-semibold text-green-400">{title}</h4>
          <div className="hidden text-xs text-slate-400 sm:block">
            {lines.length} {lines.length === 1 ? 'line' : 'lines'}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isAtBottom && (
            <button
              onClick={scrollToBottom}
              className="rounded-md bg-slate-600 px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-500 hover:text-white"
              title="Scroll to bottom"
            >
              ↓ Bottom
            </button>
          )}
          <div className="text-xs text-slate-400">
            {lines.length > 0 ? '●' : '○'} {lines.length > 0 ? 'Active' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Enhanced output area */}
      <div className="relative flex-1 overflow-hidden rounded-lg border border-slate-600 bg-gradient-to-br from-slate-900 to-black shadow-inner">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto whitespace-pre-wrap p-3 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600"
          style={{
            fontSize: 'clamp(11px, 2.2vw, 13px)',
          }}
        >
          {lines.map((line, idx) => {
            const color = line.label ? colorForLabel(line.label) : undefined;
            const isError = line.label?.toLowerCase().includes('error');
            const isWarning = line.label?.toLowerCase().includes('warn');
            const isInfo = line.label?.toLowerCase().includes('info');

            return (
              <div
                key={idx}
                className={`mb-1.5 flex items-start gap-2 rounded-md px-2 py-1.5 transition-all hover:bg-slate-800/50 ${
                  isError
                    ? 'border-l-2 border-red-500'
                    : isWarning
                      ? 'border-l-2 border-yellow-500'
                      : isInfo
                        ? 'border-l-2 border-blue-500'
                        : ''
                }`}
                style={{
                  backgroundColor: color ? `${color}20` : 'transparent',
                }}
              >
                {/* Line indicator */}
                <div className="mt-0.5 flex-shrink-0">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      isError
                        ? 'bg-red-500'
                        : isWarning
                          ? 'bg-yellow-500'
                          : isInfo
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                    }`}
                  ></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {line.label && (
                    <span
                      className={`mr-2 text-xs font-medium ${
                        isError
                          ? 'text-red-400'
                          : isWarning
                            ? 'text-yellow-400'
                            : isInfo
                              ? 'text-blue-400'
                              : 'text-green-400'
                      }`}
                    >
                      [{line.label}]
                    </span>
                  )}
                  <span
                    className={`${
                      isError ? 'text-red-300' : isWarning ? 'text-yellow-300' : 'text-slate-300'
                    }`}
                  >
                    {line.text}
                  </span>
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-xs text-slate-500">{idx + 1}</div>
              </div>
            );
          })}

          {/* Enhanced empty state */}
          {lines.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-3 text-4xl opacity-30">💻</div>
                <div className="text-sm text-slate-500">Ready for output</div>
                <div className="mt-1 text-xs text-slate-600">Run your code to see results here</div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        {lines.length > 0 && (
          <div className="absolute bottom-2 right-2 text-xs text-slate-600">
            {isAtBottom ? '📍 Latest' : '⬆️ Scroll'}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
