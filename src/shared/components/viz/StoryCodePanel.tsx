import React from 'react';

export interface StoryCodePanelProps {
  /** The story's code, one entry per line. */
  lines: readonly string[];
  /** 1-based line the current beat is on. */
  activeLine: number;
}

/** A story's code with the current beat's line highlighted. */
const StoryCodePanel: React.FC<StoryCodePanelProps> = ({ lines, activeLine }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 py-3 shadow">
    <pre className="text-[12.5px] leading-6" aria-label="Story code">
      {lines.map((text, i) => {
        const active = i + 1 === activeLine;
        return (
          <div
            key={i}
            className={`flex pr-4 ${active ? 'bg-amber-400/20' : ''}`}
            aria-current={active ? 'step' : undefined}
          >
            <span
              className={`w-9 shrink-0 select-none border-l-2 pr-3 text-right ${
                active ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-500'
              }`}
            >
              {i + 1}
            </span>
            <code className={active ? 'text-amber-100' : 'text-slate-300'}>{text || ' '}</code>
          </div>
        );
      })}
    </pre>
  </div>
);

export default StoryCodePanel;
