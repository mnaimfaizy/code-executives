import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

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
const PADDING = 10;

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
        {/* Responsive info overlay */}
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
            display: frames.length > 0 ? 'block' : 'none',
          }}
        >
          {frames.length} {frames.length === 1 ? 'frame' : 'frames'}
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

          {/* Enhanced responsive title */}
          <g>
            <text x={inner.x + 8} y={inner.y + 22} fill="white" fontSize="20" fontWeight="700">
              📚 Call Stack
            </text>
            <text
              x={inner.x + 8}
              y={inner.y + 38}
              fill="rgba(255,255,255,0.9)"
              fontSize="12"
              fontWeight="500"
            >
              Last In, First Out (LIFO) •{' '}
              {frames.length === 0 ? 'Empty' : `${frames.length} active`}
            </text>
          </g>

          {/* Enhanced stack container with glassmorphism effect */}
          <g>
            <rect
              x={inner.x}
              y={inner.y + 50}
              width={inner.w}
              height={inner.h - 50}
              rx={20}
              ry={20}
              fill="url(#containerBg)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              filter="url(#dropShadow)"
            />

            {/* Enhanced overflow indicator */}
            {overflow > 0 && (
              <g>
                <rect
                  x={inner.x + inner.w - 100}
                  y={inner.y + 58}
                  width="90"
                  height="24"
                  rx="12"
                  fill="rgba(239, 68, 68, 0.95)"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                  filter="url(#dropShadow)"
                />
                <text
                  x={inner.x + inner.w - 55}
                  y={inner.y + 72}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight="700"
                  fill="white"
                >
                  ⚠️ +{overflow} hidden
                </text>
              </g>
            )}

            {/* Enhanced responsive frames drawn from bottom up */}
            {visibleFrames.map((f, i) => {
              const idxFromBottom = i;
              const yBottom = inner.y + inner.h - FRAME_GAP - FRAME_H;
              const y = yBottom - idxFromBottom * (FRAME_H + FRAME_GAP);
              const isAnimating = animatingFrames.has(f.id);
              const isTopFrame = i === visibleFrames.length - 1;
              const opacity = isAnimating ? '0.8' : '0.98';
              const transform = isAnimating ? 'scale(1.03)' : 'scale(1)';

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

                  {/* Function name with responsive sizing */}
                  <text
                    x={inner.x + 48}
                    y={y + FRAME_H / 2 - 2}
                    fontSize={inner.w < 400 ? '13' : '15'}
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

                  {/* Enhanced stack pointer for top frame */}
                  {isTopFrame && (
                    <g>
                      {/* Animated top indicator */}
                      <circle
                        cx={inner.x + inner.w - 28}
                        cy={y + FRAME_H / 2}
                        r="8"
                        fill="#22c55e"
                        opacity="0.9"
                      >
                        <animate
                          attributeName="r"
                          values="8;10;8"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <text
                        x={inner.x + inner.w - 28}
                        y={y + FRAME_H / 2 + 3}
                        fontSize="10"
                        fontWeight="700"
                        fill="white"
                        textAnchor="middle"
                      >
                        ↑
                      </text>
                      <text
                        x={inner.x + inner.w - 50}
                        y={y + FRAME_H / 2 + 4}
                        fontSize="10"
                        fontWeight="600"
                        fill="#22c55e"
                        textAnchor="end"
                      >
                        ACTIVE
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Enhanced empty state illustration */}
            {visibleFrames.length === 0 && (
              <g>
                <circle
                  cx={inner.x + inner.w / 2}
                  cy={inner.y + inner.h / 2 + 25}
                  r="50"
                  fill="rgba(255,255,255,0.08)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;24"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <text
                  x={inner.x + inner.w / 2}
                  y={inner.y + inner.h / 2 + 10}
                  textAnchor="middle"
                  fontSize="28"
                  fill="rgba(255,255,255,0.4)"
                >
                  📚
                </text>
                <text
                  x={inner.x + inner.w / 2}
                  y={inner.y + inner.h / 2 + 45}
                  textAnchor="middle"
                  fontSize="14"
                  fill="rgba(255,255,255,0.8)"
                  fontWeight="600"
                >
                  Call Stack Empty
                </text>
                <text
                  x={inner.x + inner.w / 2}
                  y={inner.y + inner.h / 2 + 62}
                  textAnchor="middle"
                  fontSize="11"
                  fill="rgba(255,255,255,0.6)"
                >
                  Function calls will appear here
                </text>
              </g>
            )}
          </g>
        </svg>
      </div>
    );
  }
);

export default CallStack2D;
