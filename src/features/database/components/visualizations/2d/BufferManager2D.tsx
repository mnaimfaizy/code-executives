import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface PageSlot {
  id: number;
  pageId: string | null;
  dirty: boolean;
  pinned: boolean;
  accessTime: number;
}

interface BufferManager2DProps {
  className?: string;
}

const BufferManager2D: React.FC<BufferManager2DProps> = React.memo(({ className = '' }) => {
  const POOL_SIZE = 8;
  const [pool, setPool] = useState<PageSlot[]>(() =>
    Array.from({ length: POOL_SIZE }, (_, i) => ({
      id: i,
      pageId: null,
      dirty: false,
      pinned: false,
      accessTime: 0,
    }))
  );
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState({ hits: 0, misses: 0 });
  const [log, setLog] = useState<string[]>(['Buffer pool initialized (8 slots)']);
  const [lastRequest, setLastRequest] = useState<string | null>(null);

  const diskPages = useMemo(
    () => ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'],
    []
  );

  const requestPage = useCallback(
    (pageId: string) => {
      setLastRequest(pageId);
      setTick((t) => t + 1);

      setPool((prev) => {
        const newPool = prev.map((s) => ({ ...s }));

        // Check if already in pool (HIT)
        const cached = newPool.find((s) => s.pageId === pageId);
        if (cached) {
          cached.accessTime = tick + 1;
          cached.pinned = true;
          setTimeout(() => {
            setPool((p) => p.map((s) => (s.id === cached.id ? { ...s, pinned: false } : s)));
          }, 600);
          setStats((s) => ({ ...s, hits: s.hits + 1 }));
          setLog((l) => [`✓ HIT — Page ${pageId} found in slot ${cached.id}`, ...l.slice(0, 9)]);
          return newPool;
        }

        // MISS — need to load from disk
        setStats((s) => ({ ...s, misses: s.misses + 1 }));

        // Find empty slot first
        let target = newPool.find((s) => s.pageId === null);

        if (!target) {
          // LRU eviction — find unpinned slot with oldest access time
          const unpinned = newPool.filter((s) => !s.pinned);
          if (unpinned.length === 0) {
            setLog((l) => ['✗ All pages pinned — cannot evict!', ...l.slice(0, 9)]);
            return newPool;
          }
          target = unpinned.reduce((a, b) => (a.accessTime < b.accessTime ? a : b));

          const evictedId = target.pageId;
          if (target.dirty) {
            setLog((l) => [
              `✗ MISS — Evicting dirty page ${evictedId} from slot ${target!.id} (written to disk)`,
              ...l.slice(0, 9),
            ]);
          } else {
            setLog((l) => [
              `✗ MISS — Evicting clean page ${evictedId} from slot ${target!.id}`,
              ...l.slice(0, 9),
            ]);
          }
        } else {
          setLog((l) => [
            `✗ MISS — Loading page ${pageId} into empty slot ${target!.id}`,
            ...l.slice(0, 9),
          ]);
        }

        target.pageId = pageId;
        target.dirty = false;
        target.pinned = true;
        target.accessTime = tick + 1;

        setTimeout(() => {
          setPool((p) => p.map((s) => (s.id === target!.id ? { ...s, pinned: false } : s)));
        }, 600);

        return newPool;
      });
    },
    [tick]
  );

  const markDirty = useCallback((slotId: number) => {
    setPool((prev) => prev.map((s) => (s.id === slotId && s.pageId ? { ...s, dirty: true } : s)));
    setLog((l) => [`⬡ Slot ${slotId} marked dirty (modified)`, ...l.slice(0, 9)]);
  }, []);

  // Auto-play random requests
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      const page = diskPages[Math.floor(Math.random() * diskPages.length)];
      requestPage(page);
    }, 1200);
    return () => clearInterval(timer);
  }, [isPlaying, diskPages, requestPage]);

  const handleReset = useCallback(() => {
    setPool(
      Array.from({ length: POOL_SIZE }, (_, i) => ({
        id: i,
        pageId: null,
        dirty: false,
        pinned: false,
        accessTime: 0,
      }))
    );
    setStats({ hits: 0, misses: 0 });
    setLog(['Buffer pool reset']);
    setLastRequest(null);
    setIsPlaying(false);
  }, []);

  const hitRate =
    stats.hits + stats.misses > 0
      ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(0)
      : '—';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Buffer Pool SVG */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <svg
          viewBox="0 0 800 240"
          className="w-full h-auto"
          role="img"
          aria-label="Buffer pool with 8 slots showing cached disk pages"
        >
          {/* Disk icon */}
          <g>
            <rect
              x="10"
              y="160"
              width="120"
              height="60"
              rx="8"
              fill="#f1f5f9"
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <text x="70" y="182" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">
              DISK
            </text>
            <text x="70" y="200" textAnchor="middle" fontSize="8" fill="#94a3b8">
              {diskPages.length} pages
            </text>
          </g>

          {/* Arrow from disk to pool */}
          <line
            x1="130"
            y1="190"
            x2="160"
            y2="190"
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x="145" y="182" textAnchor="middle" fontSize="7" fill="#94a3b8">
            I/O
          </text>

          {/* Buffer Pool */}
          <rect
            x="160"
            y="10"
            width="620"
            height="220"
            rx="12"
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <text x="470" y="32" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">
            Buffer Pool ({POOL_SIZE} slots)
          </text>

          {/* Slots */}
          {pool.map((slot, i) => {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const sx = 185 + col * 148;
            const sy = 44 + row * 100;
            const isRequested = lastRequest === slot.pageId && slot.pageId !== null;

            return (
              <g key={slot.id}>
                <rect
                  x={sx}
                  y={sy}
                  width="128"
                  height="76"
                  rx="8"
                  fill={
                    slot.pinned
                      ? '#fef3c7'
                      : slot.dirty
                        ? '#fee2e2'
                        : slot.pageId
                          ? '#ecfdf5'
                          : '#f9fafb'
                  }
                  stroke={
                    isRequested
                      ? '#0d9488'
                      : slot.pinned
                        ? '#f59e0b'
                        : slot.dirty
                          ? '#ef4444'
                          : slot.pageId
                            ? '#10b981'
                            : '#d1d5db'
                  }
                  strokeWidth={isRequested ? 2.5 : 1}
                />
                {/* Slot label */}
                <text x={sx + 8} y={sy + 16} fontSize="9" fill="#9ca3af">
                  Slot {slot.id}
                </text>

                {slot.pageId ? (
                  <>
                    {/* Page ID */}
                    <text
                      x={sx + 64}
                      y={sy + 40}
                      textAnchor="middle"
                      fontSize="16"
                      fontWeight="bold"
                      fill={slot.dirty ? '#dc2626' : '#059669'}
                    >
                      {slot.pageId}
                    </text>
                    {/* Status badges */}
                    <text x={sx + 64} y={sy + 58} textAnchor="middle" fontSize="8" fill="#6b7280">
                      {slot.dirty ? '● dirty' : '○ clean'}
                      {slot.pinned ? ' 📌 pinned' : ''}
                    </text>
                    {/* Click to mark dirty */}
                    <rect
                      x={sx}
                      y={sy}
                      width="128"
                      height="76"
                      rx="8"
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Mark slot ${slot.id} (${slot.pageId}) as dirty`}
                      onClick={() => markDirty(slot.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          markDirty(slot.id);
                        }
                      }}
                    />
                  </>
                ) : (
                  <text x={sx + 64} y={sy + 44} textAnchor="middle" fontSize="10" fill="#d1d5db">
                    — empty —
                  </text>
                )}

                {/* Pulse on access */}
                {slot.pinned && (
                  <rect
                    x={sx - 2}
                    y={sy - 2}
                    width="132"
                    height="80"
                    rx="10"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.8;0;0.8"
                      dur="0.6s"
                      repeatCount="1"
                    />
                  </rect>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {diskPages.map((page) => (
            <button
              key={page}
              onClick={() => requestPage(page)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                lastRequest === page
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isPlaying ? 'Pause' : 'Auto'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
          <p className="text-2xl font-bold text-emerald-700">{stats.hits}</p>
          <p className="text-xs text-gray-500">Cache Hits</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
          <p className="text-2xl font-bold text-red-600">{stats.misses}</p>
          <p className="text-xs text-gray-500">Cache Misses</p>
        </div>
        <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
          <p className="text-2xl font-bold text-teal-700">{hitRate}%</p>
          <p className="text-xs text-gray-500">Hit Rate</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
          <p className="text-2xl font-bold text-amber-700">LRU</p>
          <p className="text-xs text-gray-500">Eviction Policy</p>
        </div>
      </div>

      {/* Event Log */}
      <div className="bg-gray-900 rounded-xl p-4 max-h-40 overflow-y-auto">
        {log.map((entry, i) => (
          <p key={i} className={`text-xs font-mono ${i === 0 ? 'text-teal-400' : 'text-gray-500'}`}>
            {entry}
          </p>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Click page buttons to request from disk. Click occupied slots to mark dirty. LRU eviction
        replaces the least recently used clean page.
      </p>
    </div>
  );
});

BufferManager2D.displayName = 'BufferManager2D';

export default BufferManager2D;
