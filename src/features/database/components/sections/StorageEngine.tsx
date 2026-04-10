import React from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import {
  HardDrive,
  RefreshCw,
  Lock,
  Shield,
  Database,
  AlertTriangle,
  Layers,
  FileText,
} from 'lucide-react';
import BufferManager2D from '../visualizations/2d/BufferManager2D';

const StorageEngine: React.FC = () => {
  return (
    <div className="space-y-6">
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-cyan-100 p-3 rounded-full">
            <HardDrive className="w-8 h-8 text-cyan-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">The Storage Engine</h1>
        </div>
        <p className="text-gray-700 mb-6 leading-relaxed">
          The Storage Engine is the physical workhorse of the DBMS. It manages how data is organized
          on disk, cached in memory, locked for concurrent access, and recovered after failures.
          Understanding these mechanics is critical for performance tuning.
        </p>
      </ThemeCard>

      {/* Page Format */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <FileText className="w-6 h-6 text-cyan-600" />
          <span>Data Page Format</span>
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Databases read and write data in fixed-size <strong>pages</strong> (typically 8 KB).
          Understanding the page layout explains why some operations are fast and others cause
          expensive page splits.
        </p>

        <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-5 border border-gray-200">
          {/* Page diagram */}
          <div className="font-mono text-xs space-y-0">
            <div className="bg-blue-100 border border-blue-300 rounded-t-lg p-2 text-center text-blue-800">
              <strong>Page Header</strong> (24 bytes) — LSN, checksum, free space pointers, flags
            </div>
            <div className="bg-indigo-50 border-x border-indigo-300 p-2 text-center text-indigo-800">
              <strong>Item Pointers (Line Pointers)</strong> — array of (offset, length) pairs
              pointing to tuples
            </div>
            <div className="bg-gray-100 border-x border-gray-300 p-3 text-center text-gray-500 italic">
              ↕ Free Space ↕
            </div>
            <div className="bg-emerald-50 border-x border-emerald-300 p-2 text-center text-emerald-800">
              <strong>Tuple Data</strong> — actual row data, grows backwards from end of page
            </div>
            <div className="bg-amber-50 border border-amber-300 rounded-b-lg p-2 text-center text-amber-800">
              <strong>Special Space</strong> (B-tree: sibling pointers; Heap: unused)
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Item pointers grow forward; tuples grow backward. When they meet → page is full.
            PostgreSQL uses HOT (Heap-Only Tuples) for updates that don&apos;t change indexed
            columns — avoiding index chain updates.
          </p>
        </div>
      </ThemeCard>

      {/* Buffer Manager Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Layers className="w-6 h-6 text-cyan-600" />
          <span>Buffer Manager (Cache)</span>
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Disk I/O is the slowest operation in computing (~10ms for HDD, ~0.1ms for SSD). The Buffer
          Manager caches frequently accessed data pages in RAM. A <strong>cache hit</strong> serves
          data in ~100ns — that&apos;s 1,000× faster than SSD and 100,000× faster than HDD.
        </p>
        <BufferManager2D />

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
            <h4 className="font-semibold text-cyan-800 text-sm mb-2">Eviction Policies</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>
                <strong>LRU (Oracle):</strong> Touch-count based. Frequently accessed blocks stay in
                the hot end; cold blocks evicted first.
              </li>
              <li>
                <strong>Clock-Sweep (PostgreSQL):</strong> Circular scan with usage counters. On
                sweep, decrement counter; evict pages with counter=0. Efficient O(1) amortized.
              </li>
              <li>
                <strong>Ring Buffer (PG):</strong> Large sequential scans use a small ring buffer to
                avoid polluting shared buffers with one-time data.
              </li>
            </ul>
          </div>
          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
            <h4 className="font-semibold text-cyan-800 text-sm mb-2">Write Strategies</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>
                <strong>Write-Back:</strong> Dirty pages stay in cache; written to disk lazily by
                background writer. Maximizes cache utilization.
              </li>
              <li>
                <strong>Checkpoint:</strong> Periodic flush of all dirty pages to disk. Creates a
                recovery point. PostgreSQL: checkpoint_timeout (default 5 min).
              </li>
              <li>
                <strong>Direct I/O (Oracle):</strong> Oracle bypasses the OS page cache entirely,
                managing all caching in SGA for full control.
              </li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* Storage Components */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Access Methods</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-100">
            <h3 className="font-bold text-teal-800 mb-2 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Heap Files</span>
            </h3>
            <p className="text-xs text-gray-700 mb-2">
              Rows stored in insertion order across 8 KB pages. No inherent ordering.
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>
                • <strong>Sequential Scan:</strong> Read every page. O(N). Best for large fractions
                of a table.
              </li>
              <li>
                • <strong>Bitmap Scan:</strong> Build a bitmap of qualifying pages from an index,
                then fetch pages in physical order — minimizes random I/O.
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>B-Tree Indexes</span>
            </h3>
            <p className="text-xs text-gray-700 mb-2">
              Balanced tree with sorted keys. O(log N) lookup. Each leaf page links to next for
              efficient range scans.
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>
                • <strong>Fill Factor:</strong> Leave space (default 90%) for future inserts to
                avoid page splits.
              </li>
              <li>
                • <strong>Deduplication (PG 13+):</strong> Store duplicate keys once with a posting
                list of TIDs.
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-2 flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>LSM Trees</span>
            </h3>
            <p className="text-xs text-gray-700 mb-2">
              Log-Structured Merge Trees. Optimized for write-heavy workloads. Used by RocksDB,
              Cassandra, LevelDB.
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>
                • <strong>Memtable:</strong> In-memory sorted buffer. When full, flushed to disk as
                an SSTable.
              </li>
              <li>
                • <strong>Compaction:</strong> Background merge of SSTables to reclaim space and
                maintain read performance.
              </li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* Concurrency Control Deep Dive */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Database className="w-6 h-6 text-cyan-600" />
          <span>Concurrency Control Mechanisms</span>
        </h2>

        <div className="space-y-4">
          {/* 2PL */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-2">Two-Phase Locking (2PL)</h3>
            <p className="text-sm text-gray-700 mb-3">
              The classic approach guaranteeing serializability. Has two strict phases:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 text-xs text-gray-700">
                <p className="font-semibold text-blue-700 mb-1">Growing Phase</p>
                <p>
                  Transaction acquires all locks it needs. Can acquire new locks but
                  <strong> cannot release any</strong>.
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-xs text-gray-700">
                <p className="font-semibold text-blue-700 mb-1">Shrinking Phase</p>
                <p>
                  Transaction releases locks. Can release but{' '}
                  <strong>cannot acquire new ones</strong>. In <strong>Strict 2PL</strong> (used by
                  most DBMS), all locks held until commit.
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              Strict 2PL prevents cascading aborts but reduces concurrency. That&apos;s why modern
              DBMS prefer MVCC for reads and 2PL only for writes.
            </p>
          </div>

          {/* MVCC */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-100">
            <h3 className="font-bold text-teal-800 mb-2">
              MVCC (Multi-Version Concurrency Control)
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              <strong>Readers never block writers; writers never block readers.</strong> Each
              transaction sees a consistent snapshot of the database as of its start time.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 text-xs">
                <p className="font-semibold text-teal-700 mb-1">Oracle Approach</p>
                <p className="text-gray-700">
                  Old row versions stored in <strong>UNDO tablespace</strong>. Current version
                  in-place in the data block. Reads reconstruct old versions from UNDO chain if
                  needed.
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-xs">
                <p className="font-semibold text-teal-700 mb-1">PostgreSQL Approach</p>
                <p className="text-gray-700">
                  Old and new versions both live <strong>in the heap page</strong>. Each tuple has
                  xmin (creating txn) and xmax (deleting txn). Visibility check: xmin committed
                  &amp;&amp; xmax not committed.
                </p>
              </div>
            </div>
          </div>

          {/* Optimistic */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
            <h3 className="font-bold text-amber-800 mb-2">Optimistic Concurrency Control (OCC)</h3>
            <p className="text-sm text-gray-700 mb-2">
              No locks during operation — validate at commit. Three phases: <strong>Read</strong>{' '}
              (work on private copies), <strong>Validate</strong> (check for conflicts),{' '}
              <strong>Write</strong> (if valid, apply changes).
            </p>
            <p className="text-xs text-gray-500 italic">
              Best for low-contention workloads (mostly reads). Used by Hekaton (SQL Server
              In-Memory), and application-level patterns (HTTP ETags, compare-and-swap).
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Lock Manager */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Lock className="w-6 h-6 text-cyan-600" />
          <span>Lock Manager &amp; Deadlock Detection</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Lock Hierarchy</h3>
            <div className="space-y-2">
              {[
                { level: 'Database', desc: 'Prevents DROP DATABASE during use', color: 'red' },
                {
                  level: 'Table',
                  desc: 'ACCESS SHARE, ROW EXCLUSIVE, etc. (8 levels in PG)',
                  color: 'orange',
                },
                {
                  level: 'Page',
                  desc: 'SQL Server uses page locks; PG/Oracle skip this level',
                  color: 'amber',
                },
                {
                  level: 'Row',
                  desc: 'Most common — xmax marker in PG, TX lock entry in Oracle',
                  color: 'yellow',
                },
              ].map((lock, idx) => (
                <div
                  key={idx}
                  className={`bg-${lock.color}-50 rounded-lg p-3 border border-${lock.color}-200`}
                >
                  <p className="text-sm font-semibold text-gray-800">{lock.level} Lock</p>
                  <p className="text-xs text-gray-600">{lock.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-3">Lock Compatibility Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-200 px-2 py-1">Request ↓ / Hold →</th>
                    <th className="border border-gray-200 px-2 py-1">S (Shared)</th>
                    <th className="border border-gray-200 px-2 py-1">X (Exclusive)</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  <tr>
                    <td className="border border-gray-200 px-2 py-1 font-medium">S (Shared)</td>
                    <td className="border border-gray-200 px-2 py-1 text-green-600">
                      ✅ Compatible
                    </td>
                    <td className="border border-gray-200 px-2 py-1 text-red-600">❌ Blocked</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-2 py-1 font-medium">X (Exclusive)</td>
                    <td className="border border-gray-200 px-2 py-1 text-red-600">❌ Blocked</td>
                    <td className="border border-gray-200 px-2 py-1 text-red-600">❌ Blocked</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="font-bold text-red-800 text-sm flex items-center space-x-1 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Deadlock Detection</span>
              </h4>
              <p className="text-xs text-gray-700 mb-2">
                A deadlock occurs when two transactions each hold a lock the other needs:
              </p>
              <div className="font-mono text-xs text-gray-600 bg-white rounded p-2">
                <div>T1: holds lock on row A, waits for row B</div>
                <div>T2: holds lock on row B, waits for row A</div>
                <div className="text-red-600 mt-1">→ Circular wait = DEADLOCK</div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                <strong>PostgreSQL:</strong> Builds a wait-for graph; aborts the youngest
                transaction (deadlock_timeout = 1s default).
                <br />
                <strong>Oracle:</strong> Detects immediately; rolls back the statement (not the
                transaction) and raises ORA-00060.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Recovery Manager + ARIES */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Shield className="w-6 h-6 text-cyan-600" />
          <span>Recovery Manager &amp; ARIES Protocol</span>
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          The <strong>Write-Ahead Log (WAL)</strong> is the foundation of crash recovery. Every
          change is logged <em>before</em> being applied to data pages. The <strong>ARIES</strong>{' '}
          (Algorithm for Recovery and Isolation Exploiting Semantics) protocol, invented at IBM
          Research, defines how modern databases recover:
        </p>

        <div className="space-y-4">
          {/* WAL Basics */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-3">WAL (Write-Ahead Logging)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  <strong>Three Rules:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>
                    Log record written <strong>before</strong> data page change
                  </li>
                  <li>
                    All log records for a transaction flushed to disk{' '}
                    <strong>before commit returns</strong>
                  </li>
                  <li>Data pages can be written lazily (no-force policy)</li>
                </ol>
              </div>
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  <strong>Log Record Contents:</strong>
                </p>
                <ul className="text-xs space-y-1">
                  <li>
                    • <strong>LSN</strong> — Log Sequence Number (monotonically increasing)
                  </li>
                  <li>
                    • <strong>Transaction ID</strong> — which transaction made this change
                  </li>
                  <li>
                    • <strong>Page ID</strong> — which page was modified
                  </li>
                  <li>
                    • <strong>Before-image</strong> — old data (for UNDO)
                  </li>
                  <li>
                    • <strong>After-image</strong> — new data (for REDO)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ARIES Three Phases */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-bold text-blue-800 text-sm mb-2">Phase 1: Analysis</h4>
              <p className="text-xs text-gray-700">
                Scan the log forward from the last checkpoint. Rebuild the{' '}
                <strong>Dirty Page Table</strong> (which pages had uncommitted changes) and the{' '}
                <strong>Active Transaction Table</strong> (which transactions were in-flight).
              </p>
            </div>
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <h4 className="font-bold text-teal-800 text-sm mb-2">Phase 2: REDO</h4>
              <p className="text-xs text-gray-700">
                Replay <strong>all</strong> logged changes (committed and uncommitted) from the
                oldest dirty page&apos;s recLSN forward. Restores the exact state at the time of the
                crash. &ldquo;Repeating history.&rdquo;
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h4 className="font-bold text-amber-800 text-sm mb-2">Phase 3: UNDO</h4>
              <p className="text-xs text-gray-700">
                Roll back all changes from <strong>uncommitted transactions</strong> by applying
                before-images in reverse order. Writes <strong>CLR</strong> (Compensation Log
                Records) to make UNDO idempotent — safe to crash during recovery.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-800 text-sm mb-2">PostgreSQL WAL Specifics</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>
              • WAL segments are 16 MB files in{' '}
              <code className="bg-white px-1 rounded">pg_wal/</code> directory
            </li>
            <li>
              • <code className="bg-white px-1 rounded">wal_level</code>: minimal, replica
              (default), logical
            </li>
            <li>
              • Archived WAL + base backup = Point-in-Time Recovery (PITR) to any LSN or timestamp
            </li>
            <li>
              • <code className="bg-white px-1 rounded">pg_waldump</code> utility to inspect WAL
              contents
            </li>
          </ul>
        </div>
      </ThemeCard>
    </div>
  );
};

export default StorageEngine;
