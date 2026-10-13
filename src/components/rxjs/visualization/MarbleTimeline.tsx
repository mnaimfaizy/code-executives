import React from 'react';
import type { MarbleStream } from '../shared/types';
import { describeStream } from '../shared/utils';

interface MarbleTimelineProps {
  stream: MarbleStream;
  className?: string;
  showName?: boolean;
}

export const MarbleTimeline: React.FC<MarbleTimelineProps> = ({
  stream,
  className = '',
  showName = true,
}) => {
  const timelineWidth = Math.max(stream.duration, 400);
  const scale = timelineWidth / stream.duration;

  return (
    <div className={`marble-timeline ${className}`}>
      {showName && <div className="text-sm font-medium text-gray-700 mb-2">{stream.name}</div>}

      <div
        className="relative"
        role="img"
        aria-label={`${stream.name} stream: ${describeStream(stream)}`}
      >
        {/* Timeline base */}
        <div
          className="h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full border-2 border-blue-300 relative overflow-visible"
          style={{ width: `${timelineWidth}px` }}
        >
          {/* Marble events */}
          {stream.events.map((event) => (
            <div
              key={event.id}
              className={`absolute top-1 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                event.type === 'next'
                  ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                  : event.type === 'complete'
                    ? 'bg-gradient-to-br from-green-400 to-green-600'
                    : 'bg-gradient-to-br from-red-400 to-red-600'
              }`}
              style={{
                left: `${event.time * scale - 20}px`,
                backgroundColor: event.color && event.type === 'next' ? event.color : undefined,
              }}
              title={
                event.type === 'next'
                  ? `Value: ${event.value} at ${event.time}ms`
                  : `${event.type} at ${event.time}ms`
              }
            >
              {event.type === 'next' ? (
                <span>{String(event.value)}</span>
              ) : event.type === 'complete' ? (
                <span>✓</span>
              ) : (
                <span>✗</span>
              )}
            </div>
          ))}

          {/* Timeline markers */}
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
            <span>0ms</span>
            <span>{stream.duration}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
