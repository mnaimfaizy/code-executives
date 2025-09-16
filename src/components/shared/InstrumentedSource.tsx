import React from 'react';

export type Segment = { text: string; color?: string; emphasize?: boolean };

type Props = {
  segments: Segment[];
};

const InstrumentedSource: React.FC<Props> = ({ segments }) => {
  if (!segments?.length) return null;
  return (
    <div className="min-h-0 flex-1 overflow-auto whitespace-pre rounded-md border border-dashed border-gray-300 bg-white p-2 font-mono text-sm">
      {segments.map((seg, idx) =>
        seg.color ? (
          <span
            key={idx}
            style={{
              backgroundColor: seg.color,
              color: '#0b1020',
              borderRadius: 4,
              boxShadow: seg.emphasize ? '0 0 0 2px rgba(0,0,0,0.15) inset' : undefined,
            }}
          >
            {seg.text}
          </span>
        ) : (
          <span key={idx}>{seg.text}</span>
        )
      )}
    </div>
  );
};

export default InstrumentedSource;
