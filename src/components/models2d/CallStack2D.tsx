import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';

export interface StackFrame {
  id: string;
  label: string;
}

export interface CallStack2DProps {
  frames?: StackFrame[];
  width?: number;
  height?: number;
  colorFor?: (label: string) => string;
}

export interface CallStack2DHandle {
  push(label: string): void;
  pop(): void;
  reset(): void;
  getFrames(): StackFrame[];
}

const FRAME_H = 40;
const FRAME_GAP = 6;
const PADDING = 16;

const CallStack2D = React.forwardRef<CallStack2DHandle, CallStack2DProps>(
  ({ frames: controlledFrames, width = 640, height = 560, colorFor }, ref) => {
    // Initialize from controlled frames if provided; else use internal state.
    const [frames, setFrames] = useState<StackFrame[]>(controlledFrames ?? []);
    const nextId = useRef(1);

    useImperativeHandle(ref, () => ({
      push(label: string) {
        setFrames((prev) => [...prev, { id: String(nextId.current++), label }]);
      },
      pop() {
        setFrames((prev) => prev.slice(0, -1));
      },
      reset() {
        setFrames([]);
        nextId.current = 1;
      },
      getFrames() {
        return frames;
      },
    }));

    useEffect(() => {
      // keep in sync only when a controlled frames prop is provided
      if (controlledFrames) setFrames(controlledFrames);
    }, [controlledFrames]);

    const inner = useMemo(
      () => ({
        x: PADDING,
        y: PADDING,
        w: width - PADDING * 2,
        h: height - PADDING * 2,
      }),
      [width, height]
    );

    const maxVisible = Math.floor((inner.h - FRAME_GAP) / (FRAME_H + FRAME_GAP));
    const overflow = Math.max(0, frames.length - maxVisible);
    const visibleFrames = frames.slice(-maxVisible);

    return (
      <Box sx={{ width: '100%', height: '100%', borderRadius: 1, overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          {/* Background */}
          <defs>
            <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f9fafb" />
              <stop offset="100%" stopColor="#eef2f7" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={width} height={height} fill="url(#bg)" />

          {/* Title and legend */}
          <text x={inner.x} y={inner.y - 4} fill="#111827" fontSize="14" fontWeight={600}>
            Call Stack (LIFO)
          </text>

          {/* Stack container */}
          <g>
            <rect
              x={inner.x}
              y={inner.y}
              width={inner.w}
              height={inner.h}
              rx={8}
              ry={8}
              fill="#ffffff"
              stroke="#cbd5e1"
            />

            {/* Overflow indicator */}
            {overflow > 0 && (
              <text
                x={inner.x + inner.w - 6}
                y={inner.y + 16}
                textAnchor="end"
                fontSize={12}
                fill="#6b7280"
              >
                +{overflow} more
              </text>
            )}

            {/* Frames drawn from bottom up */}
            {visibleFrames.map((f, i) => {
              const idxFromBottom = i;
              const yBottom = inner.y + inner.h - FRAME_GAP - FRAME_H;
              const y = yBottom - idxFromBottom * (FRAME_H + FRAME_GAP);
              const fill = colorFor ? colorFor(f.label) : '#60a5fa';
              const stroke = '#3b82f6';
              return (
                <g key={f.id}>
                  <rect
                    x={inner.x + 8}
                    y={y}
                    width={inner.w - 16}
                    height={FRAME_H}
                    rx={6}
                    ry={6}
                    fill={fill}
                    stroke={stroke}
                    opacity={0.95}
                  />
                  <text x={inner.x + 20} y={y + 24} fontSize={14} fontWeight={600} fill="#0b1020">
                    {f.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </Box>
    );
  }
);

export default CallStack2D;
