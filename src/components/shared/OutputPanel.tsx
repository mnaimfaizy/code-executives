import React, { useEffect, useRef } from 'react';

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

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className={className ?? ''}>
      <div className="mb-2 rounded-md border border-gray-200 bg-gray-100 px-2 py-1">
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-md border border-gray-300 bg-gray-50 p-2 font-mono text-sm max-h-full"
      >
        {lines.map((line, idx) => {
          const color = line.label ? colorForLabel(line.label) : undefined;
          return (
            <div
              key={idx}
              className="mb-1 block rounded-md px-1 py-0.5"
              style={{
                backgroundColor: color ?? 'transparent',
                color: color ? '#0b1020' : undefined,
              }}
            >
              <span>{line.text}</span>
            </div>
          );
        })}
        {lines.length === 0 && <div className="text-gray-500 italic">Ready.</div>}
      </div>
    </div>
  );
};

export default OutputPanel;
