import React, { useState, useEffect } from 'react';

interface StreamsBuffersVizProps {
  className?: string;
}

interface DataChunk {
  id: number;
  x: number;
  stage: 'source' | 'readable' | 'buffer' | 'transform' | 'writable' | 'dest';
  compressed: boolean;
}

const StreamsBuffersViz: React.FC<StreamsBuffersVizProps> = ({ className = '' }) => {
  const [chunks, setChunks] = useState<DataChunk[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nextId, setNextId] = useState(0);
  const [bytesProcessed, setBytesProcessed] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(12);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Spawn new chunk
      if (Math.random() > 0.4) {
        setNextId((prev) => prev + 1);
        setChunks((prev) => [
          ...prev,
          {
            id: nextId,
            x: 0,
            stage: 'source',
            compressed: false,
          },
        ]);
      }

      // Move existing chunks forward
      setChunks((prev) =>
        prev
          .map((chunk) => {
            const newX = chunk.x + 2.5;
            let stage = chunk.stage;
            let compressed = chunk.compressed;

            if (newX > 10 && newX <= 25) stage = 'readable';
            else if (newX > 25 && newX <= 38) stage = 'buffer';
            else if (newX > 38 && newX <= 55) {
              stage = 'transform';
              compressed = true;
            } else if (newX > 55 && newX <= 75) stage = 'writable';
            else if (newX > 75) stage = 'dest';

            return { ...chunk, x: newX, stage, compressed };
          })
          .filter((chunk) => chunk.x < 100)
      );

      setBytesProcessed((prev) => prev + 64);
      setMemoryUsage(12 + Math.random() * 8);
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying, nextId]);

  const reset = () => {
    setIsPlaying(false);
    setChunks([]);
    setBytesProcessed(0);
    setMemoryUsage(12);
    setNextId(0);
  };

  const getChunkColor = (stage: string, compressed: boolean): string => {
    if (compressed) return '#10b981';
    switch (stage) {
      case 'source':
        return '#3b82f6';
      case 'readable':
        return '#6366f1';
      case 'buffer':
        return '#8b5cf6';
      case 'transform':
        return '#10b981';
      case 'writable':
        return '#06b6d4';
      case 'dest':
        return '#22d3ee';
      default:
        return '#6366f1';
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        style={{
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <svg viewBox="0 0 640 380" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
          <defs>
            <linearGradient id="pipe-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(99,102,241,0.3)" />
              <stop offset="50%" stopColor="rgba(99,102,241,0.15)" />
              <stop offset="100%" stopColor="rgba(6,182,212,0.3)" />
            </linearGradient>
            <filter id="stream-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="source-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="dest-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Title */}
          <text x={320} y={28} textAnchor="middle" fill="white" fontSize="16" fontWeight="700">
            🌊 Node.js Streams &amp; Buffer Pipeline
          </text>

          {/* Source Reservoir */}
          <g>
            <rect
              x={10}
              y={80}
              width={80}
              height={120}
              rx={10}
              fill="url(#source-grad)"
              stroke="#3b82f6"
              strokeWidth="1.5"
            />
            {/* Water level animation */}
            <rect x={14} y={100} width={72} height={96} rx={6} fill="#3b82f6" opacity={0.2} />
            {/* Animated ripples */}
            {[0, 1, 2].map((i) => (
              <line
                key={`ripple-${i}`}
                x1={20}
                y1={110 + i * 25}
                x2={80}
                y2={110 + i * 25}
                stroke="#60a5fa"
                strokeWidth="0.5"
                opacity={0.4}
                strokeDasharray="4,4"
              />
            ))}
            <text x={50} y={160} textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
              10GB File
            </text>
            <text x={50} y={175} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">
              Source
            </text>
          </g>

          {/* Readable Stream Pipe */}
          <g>
            <rect
              x={100}
              y={120}
              width={120}
              height={40}
              rx={20}
              fill="url(#pipe-grad)"
              stroke="rgba(99,102,241,0.4)"
              strokeWidth="1.5"
            />
            {/* Flow indicators */}
            {[0, 1, 2, 3].map((i) => (
              <circle
                key={`flow-r-${i}`}
                cx={115 + i * 28}
                cy={140}
                r={2}
                fill="#6366f1"
                opacity={isPlaying ? 0.6 : 0.2}
                style={{
                  animation: isPlaying ? `flowDot 1.5s ease-in-out infinite ${i * 0.3}s` : 'none',
                }}
              />
            ))}
            <text x={160} y={138} textAnchor="middle" fill="#a5b4fc" fontSize="8" fontWeight="600">
              Readable Stream
            </text>
            <text x={160} y={150} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
              fs.createReadStream()
            </text>
          </g>

          {/* Buffer Buckets */}
          <g>
            <rect
              x={230}
              y={90}
              width={80}
              height={100}
              rx={8}
              fill="rgba(139,92,246,0.1)"
              stroke="rgba(139,92,246,0.3)"
              strokeWidth="1.5"
              strokeDasharray="6,3"
            />
            <text x={270} y={108} textAnchor="middle" fill="#c4b5fd" fontSize="9" fontWeight="600">
              🪣 Buffers
            </text>
            {/* Buffer slots */}
            {[0, 1, 2].map((i) => {
              const bufferChunks = chunks.filter((c) => c.stage === 'buffer');
              const hasCh = i < bufferChunks.length;
              return (
                <rect
                  key={`buf-${i}`}
                  x={240}
                  y={115 + i * 22}
                  width={60}
                  height={18}
                  rx={4}
                  fill={hasCh ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.03)'}
                  stroke={hasCh ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}
                  strokeWidth="1"
                />
              );
            })}
            <text x={270} y={183} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
              Temporary Memory
            </text>
          </g>

          {/* Transform Stream (Gzip Compressor) */}
          <g>
            <rect
              x={320}
              y={100}
              width={100}
              height={80}
              rx={10}
              fill="rgba(16,185,129,0.1)"
              stroke="#10b981"
              strokeWidth="1.5"
            />
            {/* Gear icon */}
            <circle
              cx={370}
              cy={130}
              r={16}
              fill="rgba(16,185,129,0.15)"
              stroke="#10b981"
              strokeWidth="1"
              style={{
                animation: isPlaying ? 'spin-gear 3s linear infinite' : 'none',
                transformOrigin: '370px 130px',
              }}
            />
            <text x={370} y={134} textAnchor="middle" fontSize="14">
              ⚙️
            </text>
            <text x={370} y={160} textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="600">
              Transform
            </text>
            <text x={370} y={172} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
              zlib.createGzip()
            </text>
          </g>

          {/* Writable Stream Pipe */}
          <g>
            <rect
              x={430}
              y={120}
              width={110}
              height={40}
              rx={20}
              fill="rgba(6,182,212,0.15)"
              stroke="rgba(6,182,212,0.4)"
              strokeWidth="1.5"
            />
            {[0, 1, 2, 3].map((i) => (
              <circle
                key={`flow-w-${i}`}
                cx={445 + i * 26}
                cy={140}
                r={2}
                fill="#06b6d4"
                opacity={isPlaying ? 0.6 : 0.2}
                style={{
                  animation: isPlaying ? `flowDot 1.5s ease-in-out infinite ${i * 0.3}s` : 'none',
                }}
              />
            ))}
            <text x={485} y={138} textAnchor="middle" fill="#67e8f9" fontSize="8" fontWeight="600">
              Writable Stream
            </text>
            <text x={485} y={150} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
              fs.createWriteStream()
            </text>
          </g>

          {/* Destination Server */}
          <g>
            <rect
              x={550}
              y={80}
              width={80}
              height={120}
              rx={10}
              fill="url(#dest-grad)"
              stroke="#06b6d4"
              strokeWidth="1.5"
            />
            <text x={590} y={135} textAnchor="middle" fontSize="20">
              🗄️
            </text>
            <text x={590} y={160} textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
              .csv.gz
            </text>
            <text x={590} y={175} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">
              Destination
            </text>
          </g>

          {/* Data Chunks flowing */}
          {chunks.map((chunk) => {
            const chunkX = 50 + (chunk.x / 100) * 540;
            const chunkY = 140;
            const color = getChunkColor(chunk.stage, chunk.compressed);
            const size = chunk.compressed ? 6 : 10;

            return (
              <g key={chunk.id}>
                <rect
                  x={chunkX - size / 2}
                  y={chunkY - size / 2}
                  width={size}
                  height={size}
                  rx={chunk.compressed ? 2 : 3}
                  fill={color}
                  opacity={0.8}
                  filter="url(#stream-glow)"
                  style={{ transition: 'all 0.1s linear' }}
                />
              </g>
            );
          })}

          {/* Pipe connection arrows */}
          <g>
            <text x={97} y={145} fill="rgba(255,255,255,0.5)" fontSize="14">
              →
            </text>
            <text x={223} y={145} fill="rgba(255,255,255,0.5)" fontSize="14">
              →
            </text>
            <text x={312} y={145} fill="rgba(255,255,255,0.5)" fontSize="14">
              →
            </text>
            <text x={423} y={145} fill="rgba(255,255,255,0.5)" fontSize="14">
              →
            </text>
            <text x={543} y={145} fill="rgba(255,255,255,0.5)" fontSize="14">
              →
            </text>
          </g>

          {/* .pipe() labels */}
          <text x={115} y={110} fill="#fbbf24" fontSize="8" fontWeight="600">
            .pipe()
          </text>
          <text x={340} y={95} fill="#fbbf24" fontSize="8" fontWeight="600">
            .pipe()
          </text>
          <text x={460} y={110} fill="#fbbf24" fontSize="8" fontWeight="600">
            .pipe()
          </text>

          {/* Stats bar */}
          <g>
            <rect
              x={20}
              y={230}
              width={600}
              height={50}
              rx={8}
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />

            {/* Memory vs Traditional comparison */}
            <text x={40} y={250} fill="rgba(255,255,255,0.5)" fontSize="8">
              Memory Usage
            </text>
            {/* Streaming bar */}
            <rect x={40} y={255} width={120} height={8} rx={4} fill="rgba(255,255,255,0.05)" />
            <rect
              x={40}
              y={255}
              width={memoryUsage}
              height={8}
              rx={4}
              fill="#10b981"
              style={{ transition: 'width 0.3s ease' }}
            />
            <text x={165} y={262} fill="#10b981" fontSize="7" fontWeight="600">
              {memoryUsage.toFixed(0)} MB (Streaming)
            </text>

            {/* Traditional bar */}
            <rect x={40} y={268} width={120} height={8} rx={4} fill="rgba(255,255,255,0.05)" />
            <rect x={40} y={268} width={120} height={8} rx={4} fill="#ef4444" opacity={0.6} />
            <text x={165} y={275} fill="#ef4444" fontSize="7" fontWeight="600">
              10,240 MB (Load All)
            </text>

            {/* Throughput */}
            <text x={350} y={250} fill="rgba(255,255,255,0.5)" fontSize="8">
              Throughput
            </text>
            <text x={350} y={268} fill="#06b6d4" fontSize="12" fontWeight="700">
              {(bytesProcessed / 1024).toFixed(1)} KB
            </text>
            <text x={420} y={268} fill="rgba(255,255,255,0.4)" fontSize="8">
              processed
            </text>

            {/* Stream Types Legend */}
            <g>
              <text x={510} y={248} fill="rgba(255,255,255,0.5)" fontSize="8">
                Stream Types:
              </text>
              <circle cx={520} cy={258} r={3} fill="#6366f1" />
              <text x={526} y={261} fill="rgba(255,255,255,0.5)" fontSize="7">
                Readable
              </text>
              <circle cx={570} cy={258} r={3} fill="#10b981" />
              <text x={576} y={261} fill="rgba(255,255,255,0.5)" fontSize="7">
                Transform
              </text>
              <circle cx={520} cy={272} r={3} fill="#06b6d4" />
              <text x={526} y={275} fill="rgba(255,255,255,0.5)" fontSize="7">
                Writable
              </text>
              <circle cx={570} cy={272} r={3} fill="#8b5cf6" />
              <text x={576} y={275} fill="rgba(255,255,255,0.5)" fontSize="7">
                Duplex
              </text>
            </g>
          </g>

          {/* Backpressure indicator */}
          <g>
            <rect
              x={230}
              y={195}
              width={80}
              height={24}
              rx={12}
              fill={
                chunks.filter((c) => c.stage === 'buffer').length > 2
                  ? 'rgba(239,68,68,0.2)'
                  : 'rgba(16,185,129,0.15)'
              }
              stroke={chunks.filter((c) => c.stage === 'buffer').length > 2 ? '#ef4444' : '#10b981'}
              strokeWidth="1"
            />
            <text
              x={270}
              y={210}
              textAnchor="middle"
              fill={chunks.filter((c) => c.stage === 'buffer').length > 2 ? '#fca5a5' : '#6ee7b7'}
              fontSize="7"
              fontWeight="600"
            >
              {chunks.filter((c) => c.stage === 'buffer').length > 2
                ? '⚠ Backpressure!'
                : '✓ Flow Normal'}
            </text>
          </g>
        </svg>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pb-4 px-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              background: isPlaying ? 'rgba(239,68,68,0.2)' : 'rgba(6,182,212,0.2)',
              color: isPlaying ? '#fca5a5' : '#67e8f9',
              border: `1px solid ${isPlaying ? 'rgba(239,68,68,0.3)' : 'rgba(6,182,212,0.3)'}`,
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Stream'}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            ↺ Reset
          </button>
        </div>
      </div>

      <style>{`
        @keyframes flowDot {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes spin-gear {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StreamsBuffersViz;
