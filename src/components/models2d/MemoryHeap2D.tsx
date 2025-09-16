import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';

export interface HeapObject {
  id: string;
  label: string;
  size?: number; // abstract size units, affects relative box area (optional)
}

export interface MemoryHeap2DProps {
  objects?: HeapObject[]; // controlled mode
  width?: number;
  height?: number;
  colorFor?: (label: string) => string;
}

export interface MemoryHeap2DHandle {
  alloc(label: string, size?: number): string; // returns id
  free(idOrLabel: string): void;
  reset(): void;
  getObjects(): HeapObject[];
}

const CELL_W = 96;
const CELL_H = 54;
const GAP = 8;
const PADDING = 16;

const MemoryHeap2D = React.forwardRef<MemoryHeap2DHandle, MemoryHeap2DProps>(
  ({ objects: controlled, width = 640, height = 560, colorFor }, ref) => {
    const [objects, setObjects] = useState<HeapObject[]>(controlled ?? []);
    const nextId = useRef(1);

    useImperativeHandle(ref, () => ({
      alloc(label: string, size?: number) {
        const id = String(nextId.current++);
        setObjects((prev) => [...prev, { id, label, size }]);
        return id;
      },
      free(idOrLabel: string) {
        setObjects((prev) => {
          const idx = prev.findIndex((o) => o.id === idOrLabel || o.label === idOrLabel);
          if (idx >= 0) return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
          // if no match, remove last
          return prev.slice(0, -1);
        });
      },
      reset() {
        setObjects([]);
        nextId.current = 1;
      },
      getObjects() {
        return objects;
      },
    }));

    useEffect(() => {
      if (controlled) setObjects(controlled);
    }, [controlled]);

    const inner = useMemo(
      () => ({
        x: PADDING,
        y: PADDING,
        w: width - PADDING * 2,
        h: height - PADDING * 2,
      }),
      [width, height]
    );

    // Compute layout grid (left-to-right, top-to-bottom)
    const cols = Math.max(1, Math.floor((inner.w - GAP) / (CELL_W + GAP)));
    const rows = Math.max(1, Math.floor((inner.h - GAP) / (CELL_H + GAP)));
    const capacity = cols * rows;
    const overflow = Math.max(0, objects.length - capacity);
    const visible = objects.slice(-capacity);

    return (
      <Box sx={{ width: '100%', height: '100%', borderRadius: 1, overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="heap-bg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f9fafb" />
              <stop offset="100%" stopColor="#eef2f7" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={width} height={height} fill="url(#heap-bg)" />

          {/* Title */}
          <text x={inner.x} y={inner.y - 4} fill="#111827" fontSize="14" fontWeight={600}>
            Memory Heap (Objects)
          </text>

          {/* Heap container */}
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

            {/* Objects grid */}
            {visible.map((obj, i) => {
              const row = Math.floor(i / cols);
              const col = i % cols;
              const x = inner.x + GAP + col * (CELL_W + GAP);
              const y = inner.y + GAP + row * (CELL_H + GAP);
              const fill = colorFor ? colorFor(obj.label) : '#34d399';
              const stroke = '#059669';
              const sizeNote = obj.size ? `${obj.size}` : '';
              return (
                <g key={obj.id}>
                  <rect
                    x={x}
                    y={y}
                    width={CELL_W}
                    height={CELL_H}
                    rx={6}
                    ry={6}
                    fill={fill}
                    stroke={stroke}
                    opacity={0.95}
                  />
                  <text x={x + 10} y={y + 22} fontSize={13} fontWeight={700} fill="#0b1020">
                    {obj.label}
                  </text>
                  {sizeNote && (
                    <text x={x + 10} y={y + 40} fontSize={11} fill="#0b1020" opacity={0.8}>
                      {sizeNote} units
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </Box>
    );
  }
);

export default MemoryHeap2D;
