import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';

export interface StackFrame {
  id: string;
  label: string;
  timestamp?: number;
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

const FRAME_H = 50;
const FRAME_GAP = 8;
const PADDING = 20;

const CallStack2D = React.forwardRef<CallStack2DHandle, CallStack2DProps>(
  ({ frames: controlledFrames, colorFor }, ref) => {
    // Initialize from controlled frames if provided; else use internal state.
    const [frames, setFrames] = useState<StackFrame[]>(controlledFrames ?? []);
    const [animatingFrames, setAnimatingFrames] = useState<Set<string>>(new Set());
    const nextId = useRef(1);

    useImperativeHandle(ref, () => ({
      push(label: string) {
        const id = String(nextId.current++);
        const newFrame = { id, label, timestamp: Date.now() };
        setFrames((prev) => [...prev, newFrame]);

        // Add animation for new frame
        setAnimatingFrames((prev) => new Set([...prev, id]));
        setTimeout(() => {
          setAnimatingFrames((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, 600);
      },
      pop() {
        setFrames((prev) => {
          if (prev.length > 0) {
            const frameToRemove = prev[prev.length - 1];
            setAnimatingFrames((prevAnim) => new Set([...prevAnim, frameToRemove.id]));
            setTimeout(() => {
              setFrames((current) => current.filter((f) => f.id !== frameToRemove.id));
              setAnimatingFrames((prevAnim) => {
                const next = new Set(prevAnim);
                next.delete(frameToRemove.id);
                return next;
              });
            }, 300);
            return prev; // Keep the frame temporarily for animation
          }
          return prev;
        });
      },
      reset() {
        setFrames([]);
        setAnimatingFrames(new Set());
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

    const maxVisible = Math.floor((inner.h - FRAME_GAP) / (FRAME_H + FRAME_GAP));
    const overflow = Math.max(0, frames.length - maxVisible);
    const visibleFrames = frames.slice(-maxVisible);

    // Color palette for different function types
    const getFrameColor = (
      label: string,
      index: number
    ): { bg: string; light: string; shadow: string } => {
      if (colorFor) {
        const color = colorFor(label);
        return { bg: color, light: color, shadow: color };
      }

      const colors = [
        { bg: '#6366f1', light: '#8b5cf6', shadow: '#4f46e5' }, // Indigo
        { bg: '#06b6d4', light: '#0891b2', shadow: '#0e7490' }, // Cyan
        { bg: '#10b981', light: '#059669', shadow: '#047857' }, // Emerald
        { bg: '#f59e0b', light: '#d97706', shadow: '#b45309' }, // Amber
        { bg: '#ef4444', light: '#dc2626', shadow: '#b91c1c' }, // Red
        { bg: '#8b5cf6', light: '#7c3aed', shadow: '#6d28d9' }, // Violet
      ];
      return colors[index % colors.length];
    };

    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 20px 48px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 640 400"
          preserveAspectRatio="none"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        >
          {/* Enhanced background with multiple gradients */}
          <defs>
            <linearGradient id="mainBg" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="50%" stopColor="#764ba2" />
              <stop offset="100%" stopColor="#667eea" />
            </linearGradient>
            <linearGradient id="containerBg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="100%" stopColor="rgba(248,250,252,0.95)" />
            </linearGradient>
            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.1)" />
            </filter>
            <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              <feOffset dx="0" dy="2" result="offset" />
              <feFlood floodColor="rgba(0,0,0,0.1)" />
              <feComposite in2="offset" operator="in" />
            </filter>
            {/* Frame gradients */}
            {visibleFrames.map((f, i) => {
              const colors = getFrameColor(f.label, i);
              return (
                <React.Fragment key={`gradient-${f.id}`}>
                  <linearGradient id={`frameGrad-${f.id}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={colors.light} />
                    <stop offset="100%" stopColor={colors.bg} />
                  </linearGradient>
                  <linearGradient id={`frameGradHover-${f.id}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={colors.light} />
                    <stop offset="50%" stopColor={colors.bg} />
                    <stop offset="100%" stopColor={colors.shadow} />
                  </linearGradient>
                </React.Fragment>
              );
            })}
          </defs>

          {/* Main background */}
          <rect x={0} y={0} width={viewBoxWidth} height={viewBoxHeight} fill="url(#mainBg)" />

          {/* Title with improved styling */}
          <g>
            <text x={inner.x + 8} y={inner.y + 20} fill="white" fontSize="18" fontWeight="700">
              Call Stack
            </text>
            <text
              x={inner.x + 110}
              y={inner.y + 20}
              fill="rgba(255,255,255,0.8)"
              fontSize="13"
              fontWeight="400"
            >
              Last In, First Out (LIFO)
            </text>
          </g>

          {/* Stack container with glassmorphism effect */}
          <g>
            <rect
              x={inner.x}
              y={inner.y + 35}
              width={inner.w}
              height={inner.h - 35}
              rx={16}
              ry={16}
              fill="url(#containerBg)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              filter="url(#dropShadow)"
            />

            {/* Overflow indicator with better styling */}
            {overflow > 0 && (
              <g>
                <rect
                  x={inner.x + inner.w - 80}
                  y={inner.y + 43}
                  width="70"
                  height="20"
                  rx="10"
                  fill="rgba(239, 68, 68, 0.9)"
                />
                <text
                  x={inner.x + inner.w - 45}
                  y={inner.y + 55}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight="600"
                  fill="white"
                >
                  +{overflow} more
                </text>
              </g>
            )}

            {/* Enhanced frames drawn from bottom up */}
            {visibleFrames.map((f, i) => {
              const idxFromBottom = i;
              const yBottom = inner.y + inner.h - FRAME_GAP - FRAME_H;
              const y = yBottom - idxFromBottom * (FRAME_H + FRAME_GAP);
              const isAnimating = animatingFrames.has(f.id);
              const opacity = isAnimating ? '0.7' : '0.95';
              const transform = isAnimating ? 'scale(1.05)' : 'scale(1)';

              return (
                <g key={f.id} style={{ transform, transformOrigin: 'center' }}>
                  {/* Frame shadow */}
                  <rect
                    x={inner.x + 14}
                    y={y + 2}
                    width={inner.w - 28}
                    height={FRAME_H}
                    rx={12}
                    ry={12}
                    fill="rgba(0,0,0,0.1)"
                  />

                  {/* Main frame */}
                  <rect
                    x={inner.x + 12}
                    y={y}
                    width={inner.w - 24}
                    height={FRAME_H}
                    rx={12}
                    ry={12}
                    fill={`url(#frameGrad-${f.id})`}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                    opacity={opacity}
                  />

                  {/* Function icon */}
                  <circle
                    cx={inner.x + 28}
                    cy={y + FRAME_H / 2}
                    r="10"
                    fill="rgba(255,255,255,0.3)"
                  />
                  <text
                    x={inner.x + 28}
                    y={y + FRAME_H / 2 + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="white"
                  >
                    ƒ
                  </text>

                  {/* Function name */}
                  <text
                    x={inner.x + 48}
                    y={y + FRAME_H / 2 - 2}
                    fontSize="15"
                    fontWeight="600"
                    fill="white"
                  >
                    {f.label}()
                  </text>

                  {/* Stack level indicator */}
                  <text
                    x={inner.x + 48}
                    y={y + FRAME_H / 2 + 16}
                    fontSize="11"
                    fill="rgba(255,255,255,0.7)"
                  >
                    Level {visibleFrames.length - i}
                  </text>

                  {/* Stack pointer for top frame */}
                  {i === visibleFrames.length - 1 && (
                    <g>
                      <polygon
                        points={`${inner.x + inner.w - 32},${y + FRAME_H / 2 - 6} ${inner.x + inner.w - 20},${y + FRAME_H / 2} ${inner.x + inner.w - 32},${y + FRAME_H / 2 + 6}`}
                        fill="#22c55e"
                      />
                      <text
                        x={inner.x + inner.w - 44}
                        y={y + FRAME_H / 2 + 4}
                        fontSize="11"
                        fontWeight="600"
                        fill="#22c55e"
                        textAnchor="end"
                      >
                        TOP
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Empty state illustration */}
            {visibleFrames.length === 0 && (
              <g>
                <circle
                  cx={inner.x + inner.w / 2}
                  cy={inner.y + inner.h / 2 + 20}
                  r="40"
                  fill="rgba(148, 163, 184, 0.1)"
                  stroke="rgba(148, 163, 184, 0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text
                  x={inner.x + inner.w / 2}
                  y={inner.y + inner.h / 2 + 15}
                  textAnchor="middle"
                  fontSize="16"
                  fill="rgba(148, 163, 184, 0.6)"
                >
                  📚
                </text>
                <text
                  x={inner.x + inner.w / 2}
                  y={inner.y + inner.h / 2 + 40}
                  textAnchor="middle"
                  fontSize="12"
                  fill="rgba(148, 163, 184, 0.8)"
                  fontWeight="500"
                >
                  Stack is empty
                </text>
              </g>
            )}
          </g>
        </svg>
      </Box>
    );
  }
);

export default CallStack2D;
