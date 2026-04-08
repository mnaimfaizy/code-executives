import React from 'react';
import type { StateSnapshot } from '../../../types';

interface StreamLensProps {
  currentSnapshot: StateSnapshot;
  previousSnapshot: StateSnapshot | null;
}

/* ── Color palette ── */
const COLORS = {
  pipe: '#2a2a4e',
  pipeActive: '#00d4ff',
  pipeBackpressure: '#ff4466',
  pipeDrained: '#00ff88',
  packet: '#8b5cf6',
  packetHighlight: '#ffaa00',
  buffer: '#14b8a6',
  textPrimary: '#e0e0ff',
  textSecondary: '#a0a0cc',
  textMuted: '#6b6b99',
  bg: 'rgba(18, 18, 42, 0.85)',
};

const ANIM_REDUCED = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

interface StreamStage {
  name: string;
  type: 'readable' | 'transform' | 'writable';
  bufferFill: number; // 0-1
  highWaterMark: number;
  isPaused: boolean;
}

interface DataPacket {
  id: number;
  x: number;
  stageIdx: number;
  label: string;
}

/** Default simulation scenario */
function buildDefaultScenario(step: number): { stages: StreamStage[]; packets: DataPacket[] } {
  const totalSteps = 40;
  const normalizedStep = step % totalSteps;

  // Simulate backpressure: buffer fills up, then drains
  const writerFill =
    normalizedStep < 20
      ? Math.min(normalizedStep / 15, 1)
      : Math.max(1 - (normalizedStep - 20) / 10, 0);

  const isPaused = writerFill > 0.8;

  const stages: StreamStage[] = [
    {
      name: 'Readable',
      type: 'readable',
      bufferFill: isPaused ? 0.6 : 0.2,
      highWaterMark: 16384,
      isPaused,
    },
    {
      name: 'Transform',
      type: 'transform',
      bufferFill: isPaused ? 0.4 : 0.1,
      highWaterMark: 16384,
      isPaused: false,
    },
    {
      name: 'Writable',
      type: 'writable',
      bufferFill: writerFill,
      highWaterMark: 16384,
      isPaused: false,
    },
  ];

  // Packets move through the pipeline
  const packets: DataPacket[] = [];
  if (!isPaused || normalizedStep < 5) {
    const packetCount = Math.min(Math.floor(normalizedStep / 3) + 1, 4);
    for (let i = 0; i < packetCount; i++) {
      const progress = ((normalizedStep - i * 3) / totalSteps) * 3;
      const stageIdx = Math.min(Math.floor(progress), 2);
      const localProgress = progress - stageIdx;
      packets.push({
        id: i,
        x: localProgress,
        stageIdx,
        label: `chunk${i}`,
      });
    }
  }

  return { stages, packets };
}

/* ── Buffer Gauge ── */
const BufferGauge: React.FC<{
  fill: number;
  width: number;
  x: number;
  y: number;
}> = ({ fill, width, x, y }) => {
  const gaugeHeight = 8;
  const fillColor =
    fill > 0.8 ? COLORS.pipeBackpressure : fill < 0.2 ? COLORS.pipeDrained : COLORS.buffer;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={gaugeHeight}
        rx={3}
        fill="rgba(42, 42, 78, 0.6)"
        stroke={COLORS.pipe}
        strokeWidth={0.5}
      />
      <rect
        x={x}
        y={y}
        width={width * Math.max(fill, 0.02)}
        height={gaugeHeight}
        rx={3}
        fill={fillColor}
        style={{
          transition: ANIM_REDUCED ? 'none' : 'width 400ms ease, fill 400ms ease',
        }}
      />
      <text
        x={x + width / 2}
        y={y + gaugeHeight + 12}
        textAnchor="middle"
        fill={COLORS.textMuted}
        fontSize={9}
      >
        {Math.round(fill * 100)}%
      </text>
    </g>
  );
};

/* ── Data Packet ── */
const Packet: React.FC<{
  packet: DataPacket;
  stageWidth: number;
  stageGap: number;
  startX: number;
  pipeY: number;
}> = ({ packet, stageWidth, stageGap, startX, pipeY }) => {
  const stageStart = startX + packet.stageIdx * (stageWidth + stageGap);
  const px = stageStart + packet.x * stageWidth;

  return (
    <g
      style={{
        transition: ANIM_REDUCED ? 'none' : 'transform 300ms ease',
        transform: `translate(${px}px, ${pipeY - 12}px)`,
      }}
    >
      <rect
        width={24}
        height={16}
        rx={3}
        fill={COLORS.packet}
        stroke={COLORS.packetHighlight}
        strokeWidth={0.5}
        opacity={0.9}
      />
      <text
        x={12}
        y={11}
        textAnchor="middle"
        fill={COLORS.textPrimary}
        fontSize={7}
        fontFamily="var(--pg-font-mono)"
      >
        {packet.label}
      </text>
    </g>
  );
};

/* ── Main Component ── */
const StreamLens: React.FC<StreamLensProps> = ({ currentSnapshot }) => {
  const step = currentSnapshot.step;
  const { stages, packets } = buildDefaultScenario(step);

  // SVG dimensions
  const SVG_W = 600;
  const SVG_H = 260;
  const MARGIN = 30;
  const STAGE_GAP = 40;
  const stageWidth = (SVG_W - 2 * MARGIN - (stages.length - 1) * STAGE_GAP) / stages.length;
  const stageY = 60;
  const stageH = 80;
  const pipeY = stageY + stageH / 2;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-3 overflow-auto">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-lg"
        role="img"
        aria-label="Stream pipeline visualization"
      >
        {/* Title */}
        <text
          x={SVG_W / 2}
          y={24}
          textAnchor="middle"
          fill={COLORS.textPrimary}
          fontSize={13}
          fontWeight={600}
        >
          Node.js Stream Pipeline
        </text>

        {/* Pipe connections */}
        {stages.map((_stage, i) => {
          if (i === 0) return null;
          const prevEnd = MARGIN + (i - 1) * (stageWidth + STAGE_GAP) + stageWidth;
          const nextStart = MARGIN + i * (stageWidth + STAGE_GAP);
          const isPaused = stages[i - 1].isPaused;

          return (
            <g key={`pipe-${i}`}>
              <line
                x1={prevEnd}
                y1={pipeY}
                x2={nextStart}
                y2={pipeY}
                stroke={isPaused ? COLORS.pipeBackpressure : COLORS.pipeActive}
                strokeWidth={3}
                strokeDasharray={isPaused ? '6 4' : 'none'}
                style={{
                  transition: ANIM_REDUCED ? 'none' : 'stroke 300ms ease',
                }}
              />
              {/* Arrow */}
              <polygon
                points={`${nextStart - 6},${pipeY - 5} ${nextStart},${pipeY} ${nextStart - 6},${pipeY + 5}`}
                fill={isPaused ? COLORS.pipeBackpressure : COLORS.pipeActive}
              />
            </g>
          );
        })}

        {/* Stage boxes */}
        {stages.map((stage, i) => {
          const sx = MARGIN + i * (stageWidth + STAGE_GAP);
          const borderColor = stage.isPaused ? COLORS.pipeBackpressure : COLORS.pipeActive;

          return (
            <g key={`stage-${i}`}>
              <rect
                x={sx}
                y={stageY}
                width={stageWidth}
                height={stageH}
                rx={8}
                fill={COLORS.bg}
                stroke={borderColor}
                strokeWidth={1.5}
                style={{
                  transition: ANIM_REDUCED ? 'none' : 'stroke 300ms ease',
                }}
              />
              {/* Stage name */}
              <text
                x={sx + stageWidth / 2}
                y={stageY + 20}
                textAnchor="middle"
                fill={COLORS.textPrimary}
                fontSize={11}
                fontWeight={600}
              >
                {stage.name}
              </text>
              {/* Type label */}
              <text
                x={sx + stageWidth / 2}
                y={stageY + 34}
                textAnchor="middle"
                fill={COLORS.textMuted}
                fontSize={9}
              >
                {stage.type}
              </text>
              {/* Buffer gauge inside box */}
              <BufferGauge
                fill={stage.bufferFill}
                width={stageWidth - 20}
                x={sx + 10}
                y={stageY + 46}
              />
              {/* Paused indicator */}
              {stage.isPaused && (
                <text
                  x={sx + stageWidth / 2}
                  y={stageY + stageH - 6}
                  textAnchor="middle"
                  fill={COLORS.pipeBackpressure}
                  fontSize={9}
                  fontWeight={600}
                >
                  ⏸ PAUSED
                </text>
              )}
            </g>
          );
        })}

        {/* Data packets */}
        {packets.map((p) => (
          <Packet
            key={p.id}
            packet={p}
            stageWidth={stageWidth}
            stageGap={STAGE_GAP}
            startX={MARGIN}
            pipeY={pipeY}
          />
        ))}

        {/* Legend */}
        <g transform={`translate(${MARGIN}, ${SVG_H - 30})`}>
          <circle cx={0} cy={0} r={4} fill={COLORS.pipeActive} />
          <text x={10} y={4} fill={COLORS.textMuted} fontSize={9}>
            Flowing
          </text>

          <circle cx={80} cy={0} r={4} fill={COLORS.pipeBackpressure} />
          <text x={90} y={4} fill={COLORS.textMuted} fontSize={9}>
            Backpressure
          </text>

          <circle cx={180} cy={0} r={4} fill={COLORS.pipeDrained} />
          <text x={190} y={4} fill={COLORS.textMuted} fontSize={9}>
            Drained
          </text>
        </g>
      </svg>

      {/* Status text below SVG */}
      <div className="mt-2 text-center">
        <p className="text-xs" style={{ color: COLORS.textSecondary }}>
          {stages.some((s) => s.isPaused)
            ? 'Backpressure detected — producer paused until buffer drains'
            : stages.some((s) => s.bufferFill < 0.1)
              ? '"drain" event — buffer empty, producer can resume'
              : 'Data flowing through the pipeline'}
        </p>
      </div>
    </div>
  );
};

export default React.memo(StreamLens);
