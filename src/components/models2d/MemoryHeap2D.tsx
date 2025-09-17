import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

export interface HeapObject {
  id: string;
  label: string;
  size?: number; // abstract size units, affects relative box area (optional)
  timestamp?: number;
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

const CELL_W = 110;
const CELL_H = 70;
const GAP = 12;
const PADDING = 20;

const MemoryHeap2D = React.forwardRef<MemoryHeap2DHandle, MemoryHeap2DProps>(
  ({ objects: controlled, colorFor }, ref) => {
    const [objects, setObjects] = useState<HeapObject[]>(controlled ?? []);
    const [animatingObjects, setAnimatingObjects] = useState<Set<string>>(new Set());
    const nextId = useRef(1);

    useImperativeHandle(ref, () => ({
      alloc(label: string, size?: number) {
        const id = String(nextId.current++);
        const newObject = { id, label, size, timestamp: Date.now() };
        setObjects((prev) => [...prev, newObject]);

        // Add allocation animation
        setAnimatingObjects((prev) => new Set([...prev, id]));
        setTimeout(() => {
          setAnimatingObjects((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, 800);

        return id;
      },
      free(idOrLabel: string) {
        setObjects((prev) => {
          const objectToRemove = prev.find((o) => o.id === idOrLabel || o.label === idOrLabel);
          if (objectToRemove) {
            // Add deallocation animation
            setAnimatingObjects((prevAnim) => new Set([...prevAnim, objectToRemove.id]));
            setTimeout(() => {
              setObjects((current) => current.filter((o) => o.id !== objectToRemove.id));
              setAnimatingObjects((prevAnim) => {
                const next = new Set(prevAnim);
                next.delete(objectToRemove.id);
                return next;
              });
            }, 400);
            return prev; // Keep temporarily for animation
          }
          // If no match, remove last
          const lastObject = prev[prev.length - 1];
          if (lastObject) {
            setAnimatingObjects((prevAnim) => new Set([...prevAnim, lastObject.id]));
            setTimeout(() => {
              setObjects((current) => current.slice(0, -1));
              setAnimatingObjects((prevAnim) => {
                const next = new Set(prevAnim);
                next.delete(lastObject.id);
                return next;
              });
            }, 400);
          }
          return prev;
        });
      },
      reset() {
        setObjects([]);
        setAnimatingObjects(new Set());
        nextId.current = 1;
      },
      getObjects() {
        return objects;
      },
    }));

    useEffect(() => {
      if (controlled) setObjects(controlled);
    }, [controlled]);

    // Use fixed viewBox dimensions that scale with the container
    const viewBoxWidth = 640;
    const viewBoxHeight = 400;

    const inner = useMemo(
      () => ({
        x: PADDING,
        y: PADDING,
        w: viewBoxWidth - PADDING * 2,
        h: viewBoxHeight - PADDING * 2,
      }),
      []
    );

    // Compute layout grid (left-to-right, top-to-bottom)
    const cols = Math.max(1, Math.floor((inner.w - GAP) / (CELL_W + GAP)));
    const availableHeight = inner.h - 70; // Account for title and controls area
    const rows = Math.max(1, Math.floor((availableHeight - GAP) / (CELL_H + GAP)));
    const capacity = cols * rows;
    const overflow = Math.max(0, objects.length - capacity);
    const visible = objects.slice(-capacity);

    // Color system for different object types
    const getObjectColor = (
      label: string,
      index: number
    ): { bg: string; light: string; shadow: string; accent: string } => {
      if (colorFor) {
        const color = colorFor(label);
        return { bg: color, light: color, shadow: color, accent: color };
      }

      const colors = [
        { bg: '#ec4899', light: '#f472b6', shadow: '#db2777', accent: '#fce7f3' }, // Pink
        { bg: '#06b6d4', light: '#22d3ee', shadow: '#0891b2', accent: '#e0f7fa' }, // Cyan
        { bg: '#10b981', light: '#34d399', shadow: '#059669', accent: '#d1fae5' }, // Emerald
        { bg: '#f59e0b', light: '#fbbf24', shadow: '#d97706', accent: '#fef3c7' }, // Amber
        { bg: '#8b5cf6', light: '#a78bfa', shadow: '#7c3aed', accent: '#ede9fe' }, // Violet
        { bg: '#ef4444', light: '#f87171', shadow: '#dc2626', accent: '#fee2e2' }, // Red
        { bg: '#3b82f6', light: '#60a5fa', shadow: '#2563eb', accent: '#dbeafe' }, // Blue
        { bg: '#84cc16', light: '#a3e635', shadow: '#65a30d', accent: '#ecfccb' }, // Lime
      ];
      return colors[index % colors.length];
    };

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15), 0 25px 60px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'stretch',
          position: 'relative',
        }}
      >
        {/* Responsive stats overlay */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '11px',
            color: 'white',
            fontWeight: '500',
            zIndex: 10,
            display: objects.length > 0 ? 'block' : 'none',
          }}
        >
          {objects.length}/{capacity} objects • {Math.round((objects.length / capacity) * 100)}%
          full
        </div>

        <svg
          width="100%"
          height="100%"
          viewBox="0 0 640 400"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            minHeight: '200px',
          }}
        >
          <defs>
            {/* Main background gradient */}
            <linearGradient id="heapMainBg" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="50%" stopColor="#764ba2" />
              <stop offset="100%" stopColor="#667eea" />
            </linearGradient>

            {/* Container background with grid pattern */}
            <pattern id="heapGridPattern" patternUnits="userSpaceOnUse" width="20" height="20">
              <rect width="20" height="20" fill="rgba(255,255,255,0.95)" />
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(148,163,184,0.2)"
                strokeWidth="0.5"
              />
            </pattern>
            <linearGradient id="heapContainerBg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="100%" stopColor="rgba(248,250,252,0.95)" />
            </linearGradient>

            {/* Shadow filters */}
            <filter id="heapDropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.15)" />
            </filter>

            <filter id="objectShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.1)" />
            </filter>

            {/* Object gradients */}
            {visible.map((obj, i) => {
              const colors = getObjectColor(obj.label, i);
              return (
                <React.Fragment key={`heap-gradient-${obj.id}`}>
                  <linearGradient id={`objGrad-${obj.id}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={colors.light} />
                    <stop offset="100%" stopColor={colors.bg} />
                  </linearGradient>
                  <linearGradient id={`objAccent-${obj.id}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor={colors.accent} />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
                  </linearGradient>
                </React.Fragment>
              );
            })}
          </defs>

          {/* Main background */}
          <rect x={0} y={0} width={viewBoxWidth} height={viewBoxHeight} fill="url(#heapMainBg)" />

          {/* Enhanced responsive title section */}
          <g>
            <text x={inner.x + 8} y={inner.y + 22} fill="white" fontSize="20" fontWeight="700">
              🗂️ Memory Heap
            </text>
            <text
              x={inner.x + 8}
              y={inner.y + 38}
              fill="rgba(255,255,255,0.9)"
              fontSize="12"
              fontWeight="500"
            >
              Dynamic Object Allocation •{' '}
              {objects.length === 0 ? 'Empty' : `${objects.length} objects allocated`}
            </text>
          </g>

          {/* Enhanced heap container with glassmorphism */}
          <g>
            <rect
              x={inner.x}
              y={inner.y + 50}
              width={inner.w}
              height={inner.h - 50}
              rx={20}
              ry={20}
              fill="url(#heapGridPattern)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              filter="url(#heapDropShadow)"
            />

            {/* Enhanced memory usage indicator */}
            <g>
              <rect
                x={inner.x + 12}
                y={inner.y + 62}
                width="140"
                height="8"
                rx="4"
                fill="rgba(255,255,255,0.2)"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
              <rect
                x={inner.x + 12}
                y={inner.y + 62}
                width={Math.min(140, (visible.length / capacity) * 140)}
                height="8"
                rx="4"
                fill={
                  visible.length / capacity > 0.8
                    ? '#ef4444'
                    : visible.length / capacity > 0.6
                      ? '#f59e0b'
                      : '#22c55e'
                }
              >
                {visible.length > 0 && (
                  <animate
                    attributeName="opacity"
                    values="0.8;1;0.8"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </rect>
              <text
                x={inner.x + 160}
                y={inner.y + 69}
                fontSize="11"
                fill="rgba(255,255,255,0.9)"
                fontWeight="600"
              >
                {Math.round((visible.length / capacity) * 100)}% used
              </text>
            </g>

            {/* Enhanced overflow indicator */}
            {overflow > 0 && (
              <g>
                <rect
                  x={inner.x + inner.w - 110}
                  y={inner.y + 58}
                  width="100"
                  height="26"
                  rx="13"
                  fill="rgba(239, 68, 68, 0.95)"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                  filter="url(#objectShadow)"
                />
                <text
                  x={inner.x + inner.w - 60}
                  y={inner.y + 73}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="white"
                >
                  📊 +{overflow} hidden
                </text>
              </g>
            )}

            {/* Enhanced responsive objects grid */}
            {visible.map((obj, i) => {
              const row = Math.floor(i / cols);
              const col = i % cols;
              const x = inner.x + GAP + col * (CELL_W + GAP);
              const y = inner.y + 90 + GAP + row * (CELL_H + GAP);
              const colors = getObjectColor(obj.label, i);
              const sizeNote = obj.size ? `${obj.size}` : '';
              const isAnimating = animatingObjects.has(obj.id);
              const isRecent = obj.timestamp && Date.now() - obj.timestamp < 5000;
              const opacity = isAnimating ? '0.8' : '0.98';

              return (
                <g key={obj.id} style={{ opacity }}>
                  {/* Object shadow */}
                  <rect
                    x={x + 2}
                    y={y + 2}
                    width={CELL_W}
                    height={CELL_H}
                    rx={12}
                    ry={12}
                    fill="rgba(0,0,0,0.1)"
                  />

                  {/* Main object container */}
                  <rect
                    x={x}
                    y={y}
                    width={CELL_W}
                    height={CELL_H}
                    rx={12}
                    ry={12}
                    fill={`url(#objGrad-${obj.id})`}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                    filter="url(#objectShadow)"
                  />

                  {/* Accent highlight */}
                  <rect
                    x={x + 2}
                    y={y + 2}
                    width={CELL_W - 4}
                    height="8"
                    rx="6"
                    fill={`url(#objAccent-${obj.id})`}
                    opacity="0.7"
                  />

                  {/* Object type icon */}
                  <circle cx={x + 18} cy={y + 26} r="10" fill="rgba(255,255,255,0.9)" />
                  <text
                    x={x + 18}
                    y={y + 30}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill={colors.shadow}
                  >
                    ⬢
                  </text>

                  {/* Object label with responsive sizing */}
                  <text
                    x={x + 36}
                    y={y + 22}
                    fontSize={inner.w < 500 ? '12' : '14'}
                    fontWeight="600"
                    fill="rgba(30,41,59,0.9)"
                  >
                    {obj.label}
                  </text>

                  {/* Size information */}
                  {sizeNote && (
                    <text
                      x={x + 36}
                      y={y + 38}
                      fontSize="11"
                      fill="rgba(71,85,105,0.8)"
                      fontWeight="500"
                    >
                      {sizeNote} units
                    </text>
                  )}

                  {/* Memory address simulation */}
                  <text
                    x={x + 10}
                    y={y + CELL_H - 10}
                    fontSize="9"
                    fill="rgba(100,116,139,0.7)"
                    fontFamily="monospace"
                  >
                    0x{obj.id.padStart(4, '0')}
                  </text>

                  {/* Enhanced activity indicator for recent objects */}
                  {isRecent && (
                    <g>
                      <circle cx={x + CELL_W - 14} cy={y + 14} r="6" fill="#22c55e" opacity="0.8">
                        <animate
                          attributeName="r"
                          values="6;8;6"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <text
                        x={x + CELL_W - 14}
                        y={y + 17}
                        textAnchor="middle"
                        fontSize="8"
                        fill="white"
                        fontWeight="700"
                      >
                        ●
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Enhanced empty state with animation */}
            {visible.length === 0 && (
              <g>
                <circle
                  cx={inner.x + inner.w / 2}
                  cy={inner.y + inner.h / 2 + 25}
                  r="60"
                  fill="rgba(255,255,255,0.08)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                  strokeDasharray="10,6"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;32"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
                <text
                  x={inner.x + inner.w / 2}
                  y={inner.y + inner.h / 2 + 5}
                  textAnchor="middle"
                  fontSize="32"
                  fill="rgba(255,255,255,0.4)"
                >
                  🗂️
                </text>
                <text
                  x={inner.x + inner.w / 2}
                  y={inner.y + inner.h / 2 + 45}
                  textAnchor="middle"
                  fontSize="16"
                  fill="rgba(255,255,255,0.8)"
                  fontWeight="600"
                >
                  Heap Memory Empty
                </text>
                <text
                  x={inner.x + inner.w / 2}
                  y={inner.y + inner.h / 2 + 62}
                  textAnchor="middle"
                  fontSize="12"
                  fill="rgba(255,255,255,0.6)"
                >
                  Objects will be allocated here
                </text>
                <text
                  x={inner.x + inner.w / 2}
                  y={inner.y + inner.h / 2 + 78}
                  textAnchor="middle"
                  fontSize="10"
                  fill="rgba(255,255,255,0.5)"
                >
                  Available: {capacity} slots
                </text>
              </g>
            )}
          </g>
        </svg>
      </div>
    );
  }
);

export default MemoryHeap2D;
