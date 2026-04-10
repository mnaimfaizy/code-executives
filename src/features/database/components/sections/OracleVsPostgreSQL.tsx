import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import {
  GitCompare,
  Database,
  Cpu,
  HardDrive,
  RefreshCw,
  Server,
  Search,
  Shield,
  TrendingUp,
  BarChart3,
  Layers,
  Zap,
} from 'lucide-react';
import MVCCComparison2D from '../visualizations/2d/MVCCComparison2D';

const OracleVsPostgreSQL: React.FC = () => {
  const navigateToSection = (sectionName: string): void => {
    window.location.href = `/database?section=${encodeURIComponent(sectionName)}`;
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-teal-100 p-4 rounded-full">
          <GitCompare className="w-16 h-16 text-teal-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Oracle vs PostgreSQL</h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Oracle Database and PostgreSQL are two of the most powerful relational engines in the world.
        Oracle dominates enterprise with its SGA, UNDO tablespace, and RAC clustering; PostgreSQL
        offers a radically different open-source approach with shared buffers, inline MVCC, and
        Autovacuum. Understanding both makes you stronger at either.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">1979</p>
          <p className="text-xs text-blue-600">Oracle first release</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
          <p className="text-2xl font-bold text-emerald-700">1986</p>
          <p className="text-xs text-emerald-600">PostgreSQL (POSTGRES) began</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">#1</p>
          <p className="text-xs text-blue-600">DB-Engines RDBMS ranking</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
          <p className="text-2xl font-bold text-emerald-700">#1</p>
          <p className="text-xs text-emerald-600">Most loved DB (Stack Overflow)</p>
        </div>
      </div>
    </div>
  );

  const mainContent = (
    <>
      {/* Memory Architecture */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Cpu className="w-6 h-6 text-teal-600" />
          <span>Memory Architecture</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Oracle SGA */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Oracle — System Global Area (SGA)</span>
            </h3>
            <p className="text-xs text-gray-500 mb-3 italic">
              Typically sized at 40–70% of total RAM via SGA_TARGET / MEMORY_TARGET automatic
              management
            </p>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="bg-white/80 rounded-lg p-3">
                <p className="font-semibold text-blue-700 mb-1">Database Buffer Cache</p>
                <p>
                  Caches data blocks (default 8 KB) from disk. Uses touch-count based LRU with
                  separate hot/cold lists. Oracle manages <strong>all</strong> I/O through SGA —
                  bypassing the OS page cache via Direct I/O.
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="font-semibold text-blue-700 mb-1">Shared Pool</p>
                <p>
                  <strong>Library Cache</strong> stores parsed SQL plans (cursor sharing across
                  sessions reduces hard parses). <strong>Data Dictionary Cache</strong> stores
                  metadata. <strong>Result Cache</strong> (11g+) can cache query results directly.
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="font-semibold text-blue-700 mb-1">Redo Log Buffer</p>
                <p>
                  Circular buffer (default 1–16 MB) for redo entries before LGWR flushes to disk.
                  Write-ahead logging ensures durability before commit returns.
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="font-semibold text-blue-700 mb-1">PGA (per-process)</p>
                <p>
                  Private memory per server process: <strong>SQL Work Areas</strong> (sort, hash
                  join), <strong>Session Memory</strong>, and <strong>Private SQL Area</strong>.
                  Sized via PGA_AGGREGATE_TARGET.
                </p>
              </div>
            </div>
          </div>

          {/* PostgreSQL */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>PostgreSQL — Shared Memory</span>
            </h3>
            <p className="text-xs text-gray-500 mb-3 italic">
              Typically 25% of RAM for shared_buffers; relies on OS page cache for remainder
            </p>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="bg-white/80 rounded-lg p-3">
                <p className="font-semibold text-emerald-700 mb-1">Shared Buffers</p>
                <p>
                  Single shared memory pool caching 8 KB pages. Uses <strong>clock-sweep</strong>{' '}
                  eviction (a variant of second-chance LRU). Unlike Oracle, PostgreSQL intentionally{' '}
                  <em>double-buffers</em> — pages exist in both shared_buffers and the OS page
                  cache.
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="font-semibold text-emerald-700 mb-1">WAL Buffers</p>
                <p>
                  Buffer for Write-Ahead Log entries (default ~64 KB, auto-tuned to 1/32 of
                  shared_buffers). WAL writer flushes periodically; forced flush at commit.
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="font-semibold text-emerald-700 mb-1">
                  work_mem &amp; maintenance_work_mem
                </p>
                <p>
                  <strong>work_mem</strong>: per-operation memory for sorts and hash joins (default
                  4 MB). A single query with multiple sort/hash nodes uses <em>multiple</em>{' '}
                  work_mem allocations. <strong>maintenance_work_mem</strong>: for VACUUM, CREATE
                  INDEX (default 64 MB).
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="font-semibold text-emerald-700 mb-1">
                  OS Page Cache (Double Buffering)
                </p>
                <p>
                  PostgreSQL relies heavily on the OS page cache as a second-level buffer. On Linux,
                  effective cache = shared_buffers + free RAM. This is why setting shared_buffers{' '}
                  {'>'} 40% of RAM often hurts performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Process Model */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Server className="w-6 h-6 text-teal-600" />
          <span>Process Model</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-3">
              Oracle — Thread-Based (since 12c on Linux)
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Oracle uses a <strong>multi-threaded architecture</strong> where server processes
                share the SGA. On Linux from 12c, Oracle can use threads within a single OS process
                (threaded execution mode):
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>DBWn</strong> — Writes dirty blocks from buffer cache to disk
                </li>
                <li>
                  <strong>LGWR</strong> — Writes redo log buffer to redo log files at commit
                </li>
                <li>
                  <strong>CKPT</strong> — Triggers checkpoints; updates datafile headers
                </li>
                <li>
                  <strong>SMON</strong> — System Monitor: crash recovery, space reclamation
                </li>
                <li>
                  <strong>PMON</strong> — Process Monitor: cleans up failed connections
                </li>
                <li>
                  <strong>ARCn</strong> — Archiver: copies filled redo logs (archive mode)
                </li>
                <li>
                  <strong>MMON</strong> — Manageability Monitor: AWR snapshots, alerts
                </li>
                <li>
                  <strong>CJQ0</strong> — Job Scheduler coordinator
                </li>
              </ul>
              <div className="bg-blue-100/50 rounded p-2 mt-2">
                <p className="text-xs">
                  <strong>Connection capacity:</strong> Oracle handles 10,000+ concurrent sessions
                  natively via Shared Server mode or dedicated server processes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-3">PostgreSQL — Process-per-Connection</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                PostgreSQL forks a <strong>dedicated backend process</strong> per client connection.
                Each backend has its own memory space (~5–10 MB per idle connection):
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>Postmaster</strong> — Main daemon; accepts connections & forks backends
                </li>
                <li>
                  <strong>Backend</strong> — One per connection; handles all SQL for that session
                </li>
                <li>
                  <strong>WAL Writer</strong> — Flushes WAL buffers to disk periodically
                </li>
                <li>
                  <strong>Background Writer</strong> — Writes dirty pages to disk ahead of need
                </li>
                <li>
                  <strong>Autovacuum Launcher</strong> — Spawns workers to vacuum dead tuples
                </li>
                <li>
                  <strong>Checkpointer</strong> — Periodic checkpoint to ensure durability
                </li>
                <li>
                  <strong>Stats Collector</strong> — Gathers table/index usage statistics
                </li>
                <li>
                  <strong>WAL Sender/Receiver</strong> — Handles streaming replication
                </li>
              </ul>
              <div className="bg-emerald-100/50 rounded p-2 mt-2">
                <p className="text-xs">
                  <strong>Connection capacity:</strong> Default max_connections=100. Production
                  setups use <strong>PgBouncer</strong> (transaction pooling) to fan 10,000+ app
                  connections into ~100 backend processes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Query Optimizer Comparison */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Search className="w-6 h-6 text-teal-600" />
          <span>Query Optimizer & Execution</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-3">Oracle — Cost-Based Optimizer (CBO)</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>
                  <strong>Optimizer Hints</strong> — allows DBA to override plan choices (e.g.,{' '}
                  <code className="bg-white px-1 rounded text-xs">/*+ INDEX(t idx1) */</code>)
                </li>
                <li>
                  <strong>Adaptive Plans</strong> (12c+) — starts execution with one plan, can
                  switch join method mid-query if cardinality estimates are wrong
                </li>
                <li>
                  <strong>SQL Plan Management</strong> — captures and evolves plan baselines over
                  time to prevent plan regression
                </li>
                <li>
                  <strong>Parallel Execution</strong> — automatically parallelizes large scans,
                  joins, and DML across multiple server processes
                </li>
                <li>
                  <strong>Materialized View Rewriting</strong> — transparently rewrites queries to
                  use pre-aggregated materialized views
                </li>
                <li>
                  <strong>In-Memory Column Store</strong> (12c+) — dual-format: row store on disk,
                  columnar in memory for analytics
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-3">
              PostgreSQL — Advanced Open-Source CBO
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>
                  <strong>No Hints</strong> — by design. PostgreSQL trusts its statistics and cost
                  model; workarounds via{' '}
                  <code className="bg-white px-1 rounded text-xs">SET enable_*</code> GUCs
                </li>
                <li>
                  <strong>Genetic Query Optimizer (GEQO)</strong> — for queries joining 12+ tables,
                  uses genetic algorithm instead of exhaustive search
                </li>
                <li>
                  <strong>JIT Compilation</strong> (v11+) — LLVM-based just-in-time compilation of
                  expressions, tuple deforming, and aggregates for CPU-bound queries
                </li>
                <li>
                  <strong>Parallel Query</strong> (v9.6+) — parallel seq scan, hash join, merge
                  join, and aggregates. Controlled by max_parallel_workers_per_gather
                </li>
                <li>
                  <strong>Incremental Sort</strong> (v13+) — exploits partially sorted input to
                  avoid full re-sort for ORDER BY with multiple columns
                </li>
                <li>
                  <strong>Multicolumn Statistics</strong> (v10+) — CREATE STATISTICS for correlated
                  columns to improve cardinality estimates
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
          <h4 className="font-bold text-amber-800 mb-3">
            <Zap className="w-5 h-5 inline mr-1" />
            Key Optimizer Difference
          </h4>
          <p className="text-sm text-gray-700">
            Oracle&apos;s optimizer is <strong>more interventionist</strong> — DBAs can pin plans,
            use hints, and create SQL profiles. PostgreSQL&apos;s philosophy is{' '}
            <strong>&quot;fix the statistics, not the query&quot;</strong> — if the plan is wrong,
            you update statistics (ANALYZE), add indexes, or adjust cost parameters
            (random_page_cost, effective_cache_size) rather than forcing a specific plan.
          </p>
        </div>
      </ThemeCard>

      {/* Indexing Strategies */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Layers className="w-6 h-6 text-teal-600" />
          <span>Indexing Strategies</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-teal-50">
              <tr>
                <th className="border border-teal-200 px-3 py-2 text-left text-teal-800">
                  Index Type
                </th>
                <th className="border border-teal-200 px-3 py-2 text-center text-blue-700">
                  Oracle
                </th>
                <th className="border border-teal-200 px-3 py-2 text-center text-emerald-700">
                  PostgreSQL
                </th>
                <th className="border border-teal-200 px-3 py-2 text-left text-gray-700">
                  Use Case
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {[
                ['B-Tree', '✅', '✅', 'Default; equality & range queries'],
                ['Bitmap', '✅', '✅ (runtime only)', 'Low cardinality; AND/OR filters'],
                ['Hash', '❌ (deprecated)', '✅', 'Equality-only lookups (no range)'],
                ['GiST', '❌', '✅', 'Geometric data, full-text, range types'],
                ['GIN', '❌', '✅', 'JSONB, full-text search, arrays'],
                ['BRIN', '❌', '✅', 'Very large tables with natural ordering'],
                ['SP-GiST', '❌', '✅', 'Partitioned search spaces (quad-trees)'],
                ['Function-based', '✅', '✅', 'Index on expression (e.g., LOWER(name))'],
                ['Partial Index', '❌', '✅', 'Index only rows matching a WHERE clause'],
                ['Covering Index', '✅ (IOT)', '✅ (INCLUDE)', 'Index-only scans; no heap access'],
                ['Spatial (R-Tree)', '✅ (Spatial option)', '✅ (PostGIS)', 'Geospatial queries'],
                ['Reverse Key', '✅', '❌', 'Avoids right-side B-tree contention for sequences'],
              ].map(([type, oracle, pg, use], idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-200 px-3 py-2 font-medium">{type}</td>
                  <td className="border border-gray-200 px-3 py-2 text-center">{oracle}</td>
                  <td className="border border-gray-200 px-3 py-2 text-center">{pg}</td>
                  <td className="border border-gray-200 px-3 py-2 text-xs">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          PostgreSQL&apos;s extensible index API (GiST, GIN, BRIN, SP-GiST) is one of its strongest
          technical advantages. Oracle compensates with domain indexes and bitmap star
          transformations for data warehousing.
        </p>
      </ThemeCard>

      {/* MVCC Interactive Comparison */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 text-teal-600" />
          <span>MVCC: Undo/Redo vs Dead Tuples</span>
        </h2>
        <p className="text-gray-600 mb-4">
          The most fundamental architectural difference between Oracle and PostgreSQL lies in how
          they implement Multi-Version Concurrency Control. Explore both approaches below.
        </p>
        <MVCCComparison2D />

        {/* MVCC Performance Implications */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-bold text-blue-800 text-sm mb-2">Oracle MVCC Trade-offs</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>✅ No table bloat — old versions live in UNDO tablespace</li>
              <li>✅ No vacuum needed — UNDO is automatically reclaimed</li>
              <li>✅ Reads never block writes (and vice versa)</li>
              <li>
                ⚠️ ORA-01555 &quot;Snapshot too old&quot; if UNDO is reclaimed before long query
                finishes
              </li>
              <li>⚠️ UNDO tablespace sizing critical for write-heavy workloads</li>
            </ul>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <h4 className="font-bold text-emerald-800 text-sm mb-2">PostgreSQL MVCC Trade-offs</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>✅ No separate UNDO management — simpler architecture</li>
              <li>
                ✅ No &quot;snapshot too old&quot; errors (dead tuples persist until vacuumed)
              </li>
              <li>✅ Reads never block writes (and vice versa)</li>
              <li>⚠️ Table bloat from dead tuples requires regular Autovacuum</li>
              <li>
                ⚠️ Transaction ID wraparound requires aggressive freezing (every ~2 billion txns)
              </li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* Commit Flow */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <HardDrive className="w-6 h-6 text-teal-600" />
          <span>Commit Flow Comparison</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-3">Oracle Commit</h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
              <li>
                User issues <code className="bg-white px-1 rounded text-blue-600">COMMIT</code>
              </li>
              <li>LGWR flushes redo log buffer to redo log files on disk</li>
              <li>
                Commit completes — <strong>data blocks may still be dirty in cache</strong>
              </li>
              <li>DBWn lazily writes dirty blocks to datafiles later</li>
              <li>UNDO marks old versions as available for reuse</li>
            </ol>
            <p className="text-xs text-blue-600 mt-3 italic">
              &ldquo;Commit is fast because only the redo log needs to hit disk.&rdquo;
            </p>
          </div>

          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-3">PostgreSQL Commit</h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
              <li>
                User issues <code className="bg-white px-1 rounded text-emerald-600">COMMIT</code>
              </li>
              <li>WAL Writer flushes WAL buffer to WAL segment files on disk</li>
              <li>
                Commit completes — new tuple version has{' '}
                <code className="bg-white px-1 rounded">xmax = 0</code>
              </li>
              <li>Background Writer lazily writes dirty pages to data directory</li>
              <li>Autovacuum later removes dead tuples and freezes old xids</li>
            </ol>
            <p className="text-xs text-emerald-600 mt-3 italic">
              &ldquo;Commit is fast because only the WAL needs to hit disk.&rdquo;
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Security Comparison */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Shield className="w-6 h-6 text-teal-600" />
          <span>Security & Compliance</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-3">Oracle Security Model</h3>
            <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside ml-2">
              <li>
                <strong>TDE</strong> — Transparent Data Encryption (tablespace & column level)
              </li>
              <li>
                <strong>Database Vault</strong> — prevents DBA from viewing app data
              </li>
              <li>
                <strong>Label Security</strong> — row-level classification labels (UNCLASSIFIED →
                TOP SECRET)
              </li>
              <li>
                <strong>Real Application Security</strong> — fine-grained access within the DB
                engine
              </li>
              <li>
                <strong>Audit Vault</strong> — centralized audit trail with tamper-proof storage
              </li>
              <li>
                <strong>Data Masking</strong> — built-in static & dynamic data masking
              </li>
              <li>EAL4+ Common Criteria certification</li>
            </ul>
          </div>

          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-3">PostgreSQL Security Model</h3>
            <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside ml-2">
              <li>
                <strong>Row-Level Security (RLS)</strong> — CREATE POLICY for row-level access
                control
              </li>
              <li>
                <strong>Column-level privileges</strong> — GRANT SELECT(col) on specific columns
              </li>
              <li>
                <strong>pgcrypto</strong> — extension for column-level encryption functions
              </li>
              <li>
                <strong>SSL/TLS</strong> — encrypted client connections (SCRAM-SHA-256 auth)
              </li>
              <li>
                <strong>pgAudit</strong> — extension for detailed audit logging
              </li>
              <li>
                <strong>SELinux integration</strong> — sepgsql for mandatory access control
              </li>
              <li>EAL2+ Common Criteria certification (with external hardening)</li>
            </ul>
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mt-4">
          <p className="text-sm text-gray-700">
            <strong>Key difference:</strong> Oracle bundles enterprise security features in paid
            options (Advanced Security, Database Vault). PostgreSQL achieves comparable security via
            extensions and OS integration, but requires more DBA assembly and expertise.
          </p>
        </div>
      </ThemeCard>

      {/* Scalability & HA */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-teal-600" />
          <span>Scalability & High Availability</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-3">
                Oracle RAC (Real Application Clusters)
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Shared-disk architecture:</strong> Multiple Oracle instances on different
                servers access the <em>same</em> storage (ASM/SAN). All nodes read/write the same
                datafiles — coordination via Cache Fusion protocol (interconnect).
              </p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside ml-2">
                <li>Active-active clustering (all nodes serve queries)</li>
                <li>Automatic failover in seconds</li>
                <li>Linear read scalability; write scalability limited by interconnect</li>
                <li>Data Guard for disaster recovery (async/sync standby)</li>
                <li>GoldenGate for heterogeneous replication</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-gray-600">
                <strong>Oracle Sharding</strong> (12.2+): Native sharding for horizontal scale.
                Supports hash, range, and list sharding with automatic data placement. Distributed
                transactions across shards via 2PC.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-3">PostgreSQL HA Ecosystem</h3>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Shared-nothing architecture:</strong> Each node has its own data copy.
                Relies on streaming replication and external tooling:
              </p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside ml-2">
                <li>
                  <strong>Patroni</strong> — HA orchestrator with automatic leader election via
                  etcd/ZooKeeper
                </li>
                <li>
                  <strong>Citus</strong> — distributed PostgreSQL for horizontal read/write scaling
                </li>
                <li>
                  <strong>pg_basebackup</strong> — built-in streaming replication setup
                </li>
                <li>
                  <strong>Logical Replication</strong> (v10+) — table-level pub/sub replication
                </li>
                <li>
                  <strong>Synchronous Replication</strong> — zero data loss with synchronous_commit
                </li>
              </ul>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
              <p className="text-xs text-gray-600">
                <strong>Read Replicas:</strong> PostgreSQL excels at read scaling via streaming
                replicas. Hot standby serves read-only queries. Typical setups: 1 primary + N
                replicas with PgBouncer load balancing reads.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Workload Recommendations */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-teal-600" />
          <span>When to Choose Which?</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3">Choose Oracle When:</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">●</span>
                <span>Multi-petabyte data warehouses with complex analytics</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">●</span>
                <span>Mission-critical systems requiring RAC active-active clustering</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">●</span>
                <span>
                  Regulatory environments requiring Oracle Database Vault & Label Security
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">●</span>
                <span>Legacy ERP/CRM systems (SAP, PeopleSoft, E-Business Suite)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">●</span>
                <span>Need for in-memory columnar + Exadata hardware optimization</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
            <h3 className="font-bold text-emerald-800 mb-3">Choose PostgreSQL When:</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 mt-0.5">●</span>
                <span>Startups & SaaS with rapid iteration and cost sensitivity</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 mt-0.5">●</span>
                <span>
                  Applications requiring JSONB, full-text search, and geospatial (PostGIS)
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 mt-0.5">●</span>
                <span>Cloud-native environments (AWS RDS/Aurora, Google Cloud SQL, Azure)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 mt-0.5">●</span>
                <span>
                  Extensibility needs: custom types, operators, index methods, foreign data wrappers
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 mt-0.5">●</span>
                <span>Open-source mandate or vendor lock-in avoidance</span>
              </li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* Comprehensive Comparison Table */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Architecture Comparison Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-teal-50">
              <tr>
                <th className="border border-teal-200 px-4 py-2 text-left text-teal-800">Aspect</th>
                <th className="border border-teal-200 px-4 py-2 text-left text-blue-700">Oracle</th>
                <th className="border border-teal-200 px-4 py-2 text-left text-emerald-700">
                  PostgreSQL
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {[
                [
                  'MVCC Strategy',
                  'Undo tablespace (separate storage)',
                  'Inline versioning (dead tuples)',
                ],
                [
                  'Buffer Cache',
                  'SGA (direct I/O, bypasses OS cache)',
                  'shared_buffers + OS page cache (double buffering)',
                ],
                [
                  'Write-Ahead Log',
                  'Redo Logs (circular, archivable via ARCn)',
                  'WAL segments (16 MB files, pg_wal directory)',
                ],
                [
                  'Process Model',
                  'Multi-threaded (threaded execution since 12c)',
                  'Process-per-connection (fork + PgBouncer)',
                ],
                [
                  'Connection Pooling',
                  'Built-in Shared Servers / DRCP',
                  'External (PgBouncer / Pgpool-II)',
                ],
                [
                  'Dead Space Cleanup',
                  'UNDO auto-managed (no table bloat)',
                  'Autovacuum daemon (must tune thresholds)',
                ],
                [
                  'Clustering',
                  'RAC (shared-disk, active-active)',
                  'Patroni + Citus (shared-nothing)',
                ],
                ['Optimizer Hints', '100+ hint types supported', 'Not supported (by design)'],
                [
                  'Partitioning',
                  'Range, List, Hash, Composite, Interval',
                  'Range, List, Hash (declarative since v10)',
                ],
                [
                  'JSON Support',
                  'JSON/BSON with SODA API',
                  'JSONB with GIN indexes (binary, indexable)',
                ],
                [
                  'Full-Text Search',
                  'Oracle Text (domain index)',
                  'Built-in tsvector/tsquery + GIN/GiST',
                ],
                [
                  'Max DB Size',
                  '8 EB (with BIGFILE tablespace)',
                  'Unlimited (file system dependent, 32 TB/table)',
                ],
                [
                  'SQL Standard',
                  'Proprietary extensions + SQL:2016',
                  '170/177 SQL:2023 mandatory features',
                ],
                [
                  'Replication',
                  'Data Guard + GoldenGate',
                  'Streaming + Logical + Bidirectional (v16)',
                ],
                [
                  'License',
                  'Commercial ($47,500/processor core)',
                  'PostgreSQL License (free, permissive)',
                ],
              ].map(([aspect, oracle, pg], idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-200 px-4 py-2 font-medium">{aspect}</td>
                  <td className="border border-gray-200 px-4 py-2">{oracle}</td>
                  <td className="border border-gray-200 px-4 py-2">{pg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <ThemeCard>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Related Sections</h3>
      <div className="space-y-2">
        <NavigationCard
          title="Transactions & ACID"
          description="ACID guarantees and MVCC deep dive"
          colorScheme="teal"
          onClick={() => navigateToSection('Transactions & ACID')}
        />
        <NavigationCard
          title="Storage Engine"
          description="Buffer Manager, WAL, Lock Manager"
          colorScheme="teal"
          onClick={() => navigateToSection('Storage Engine')}
        />
        <NavigationCard
          title="Query Processor"
          description="Parser, Optimizer, Execution"
          colorScheme="teal"
          onClick={() => navigateToSection('Query Processor')}
        />
        <NavigationCard
          title="SQL vs NoSQL vs Vector"
          description="Compare paradigms & use cases"
          colorScheme="teal"
          onClick={() => navigateToSection('SQL vs NoSQL vs Vector')}
        />
      </div>
    </ThemeCard>
  );

  return (
    <>
      <SectionLayout
        section="database"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Explore All Visualizations"
        description="See these concepts come alive with interactive animations and step-by-step walkthroughs."
        buttonText="Visualization Hub"
        colorScheme="teal"
        onButtonClick={() => navigateToSection('Visualization')}
      />
    </>
  );
};

export default OracleVsPostgreSQL;
