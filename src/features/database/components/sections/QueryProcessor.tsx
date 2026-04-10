import React from 'react';
import ThemeCard from '../../../../components/shared/ThemeCard';
import QueryProcessor2D from '../visualizations/2d/QueryProcessor2D';
import { Database, Search, Zap, GitMerge, BarChart3, RefreshCw, ArrowDownUp } from 'lucide-react';

const QueryProcessor: React.FC = () => {
  return (
    <div className="space-y-6">
      <ThemeCard>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-teal-100 p-3 rounded-full">
            <Database className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">The Query Processor</h1>
        </div>
        <p className="text-gray-700 mb-6 leading-relaxed">
          The Query Processor is the &quot;brain&quot; of the DBMS, responsible for translating
          human-readable SQL into executable machine actions. It operates in three critical stages:
          parsing, optimization, and execution. The optimizer alone is often the largest and most
          complex component in the entire database engine.
        </p>

        {/* Interactive Pipeline Visualization */}
        <QueryProcessor2D />

        <div className="space-y-6 mt-6">
          {/* Stage 1: Parser */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm">
                1
              </div>
              <h3 className="text-xl font-bold text-blue-800">Parser &amp; Rewriter</h3>
            </div>
            <p className="text-gray-700 mb-3">
              The parser performs <strong>lexical analysis</strong> (tokenization),{' '}
              <strong>syntax validation</strong> (Is the SQL grammar correct?), and{' '}
              <strong>semantic analysis</strong> (Do the referenced tables and columns exist?).
              After parsing, the <strong>query rewriter</strong> transforms the query:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-3">
              <div className="bg-white/80 rounded-lg p-3 text-sm text-gray-700">
                <p className="font-semibold text-blue-700 mb-1">Rewrite Rules</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • <strong>View expansion</strong> — inline view definitions
                  </li>
                  <li>
                    • <strong>Subquery flattening</strong> — convert correlated subqueries to joins
                  </li>
                  <li>
                    • <strong>Predicate pushdown</strong> — push WHERE filters closer to base tables
                  </li>
                  <li>
                    • <strong>Constant folding</strong> — evaluate constant expressions at parse
                    time
                  </li>
                </ul>
              </div>
              <div className="bg-white/80 rounded-lg p-3 text-sm text-gray-700">
                <p className="font-semibold text-blue-700 mb-1">Security Checks</p>
                <ul className="space-y-1 text-xs">
                  <li>• Row-level security policy injection (PostgreSQL RLS)</li>
                  <li>• Virtual Private Database predicate addition (Oracle VPD)</li>
                  <li>• Column-level privilege verification</li>
                  <li>• Audit policy trigger insertion</li>
                </ul>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 font-mono text-sm">
              <div className="text-gray-500 mb-2">-- Input SQL:</div>
              <div className="text-blue-700">
                SELECT name, salary FROM employees WHERE department = &apos;Engineering&apos;;
              </div>
              <div className="text-gray-500 mt-3 mb-2">-- Parser output: Abstract Syntax Tree</div>
              <div className="text-green-700">
                ✓ Tokenize → ✓ Grammar check → ✓ &apos;employees&apos; exists → ✓ Columns valid → ✓
                RLS/VPD injected → AST ready
              </div>
            </div>
          </div>

          {/* Stage 2: Optimizer */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-teal-200 rounded-lg flex items-center justify-center text-teal-700 font-bold text-sm">
                2
              </div>
              <h3 className="text-xl font-bold text-teal-800">Query Optimizer</h3>
            </div>
            <p className="text-gray-700 mb-3">
              The most sophisticated component. For a query joining <em>N</em> tables, there are{' '}
              <em>N!</em> possible join orderings — the optimizer must prune this search space
              intelligently. It uses <strong>dynamic programming</strong> for small joins (≤ 12
              tables in PostgreSQL) or <strong>genetic algorithms</strong> (GEQO) for larger ones.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Search className="w-4 h-4 text-teal-600" />
                  <h4 className="font-semibold text-gray-800 text-sm">Cost Model Components</h4>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>
                    • <strong>seq_page_cost</strong> = 1.0 (baseline: sequential disk read)
                  </li>
                  <li>
                    • <strong>random_page_cost</strong> = 4.0 (random I/O ~4× slower)
                  </li>
                  <li>
                    • <strong>cpu_tuple_cost</strong> = 0.01 (per-row CPU work)
                  </li>
                  <li>
                    • <strong>cpu_index_tuple_cost</strong> = 0.005
                  </li>
                  <li>
                    • <strong>effective_cache_size</strong> (how much data is cached)
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-teal-600" />
                  <h4 className="font-semibold text-gray-800 text-sm">Optimization Phases</h4>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>
                    1. <strong>Scan path selection</strong> — seq scan vs index scan vs bitmap
                  </li>
                  <li>
                    2. <strong>Join ordering</strong> — which tables to join first
                  </li>
                  <li>
                    3. <strong>Join method</strong> — nested loop, hash, merge
                  </li>
                  <li>
                    4. <strong>Aggregation strategy</strong> — sort vs hash vs mixed
                  </li>
                  <li>
                    5. <strong>Parallel plan</strong> — workers_planned for parallelism
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stage 3: Execution Engine */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 font-bold text-sm">
                3
              </div>
              <h3 className="text-xl font-bold text-emerald-800">Execution Engine</h3>
            </div>
            <p className="text-gray-700 mb-3">
              Uses the <strong>Volcano / Iterator model</strong>: each plan node implements{' '}
              <code className="bg-white px-1 rounded text-xs">Open()</code>,{' '}
              <code className="bg-white px-1 rounded text-xs">Next()</code>,{' '}
              <code className="bg-white px-1 rounded text-xs">Close()</code>. Rows are pulled from
              bottom to top of the plan tree. This enables <em>pipelining</em> — most nodes never
              materialize full result sets.
            </p>
            <div className="bg-white rounded-lg p-4 font-mono text-sm">
              <div className="text-gray-500 mb-1">Execution Plan Tree:</div>
              <div className="text-emerald-700 space-y-1">
                <div>Project (name, salary)</div>
                <div>&nbsp;&nbsp;└─ Filter (dept = &apos;Engineering&apos;)</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ Index Scan (idx_dept) → 42 rows, 0.8ms</div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Join Algorithms Deep Dive */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <GitMerge className="w-6 h-6 text-teal-600" />
          <span>Join Algorithms Explained</span>
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Joins are the most expensive operations in SQL. Understanding when and why the optimizer
          picks each algorithm is critical for performance tuning.
        </p>

        <div className="space-y-5">
          {/* Nested Loop Join */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-2">1. Nested Loop Join</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <p className="text-sm text-gray-700 mb-2">
                  For each row in the <strong>outer table</strong>, scan the{' '}
                  <strong>inner table</strong> to find matching rows. With an index on the inner
                  table&apos;s join column, each inner lookup is O(log n) instead of O(n).
                </p>
                <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-x-auto">
                  <div className="text-gray-500">-- Pseudocode:</div>
                  <div className="text-blue-700">for each row r in outer_table:</div>
                  <div className="text-blue-700 ml-4">for each row s in inner_table:</div>
                  <div className="text-blue-700 ml-8">if r.key == s.key:</div>
                  <div className="text-blue-700 ml-12">emit (r, s)</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 text-xs">
                <p className="font-semibold text-blue-700 mb-1">Performance</p>
                <ul className="text-gray-600 space-y-1">
                  <li>
                    • <strong>No index:</strong> O(N × M)
                  </li>
                  <li>
                    • <strong>With index:</strong> O(N × log M)
                  </li>
                  <li>
                    • <strong>Best for:</strong> Small outer + indexed inner
                  </li>
                  <li>
                    • <strong>Memory:</strong> Minimal (one row buffer)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Hash Join */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-100">
            <h3 className="font-bold text-teal-800 mb-2">2. Hash Join</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Build phase:</strong> Hash the smaller table&apos;s join key into an
                  in-memory hash table. <strong>Probe phase:</strong> Scan the larger table and
                  probe the hash table for matches. Falls back to <strong>Grace Hash Join</strong>{' '}
                  (partitioned to disk) if the hash table exceeds work_mem.
                </p>
                <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-x-auto">
                  <div className="text-gray-500">
                    -- Phase 1: Build hash table from smaller table
                  </div>
                  <div className="text-teal-700">hash_table = build_hash(smaller_table, key)</div>
                  <div className="text-gray-500 mt-1">-- Phase 2: Probe with larger table</div>
                  <div className="text-teal-700">for each row r in larger_table:</div>
                  <div className="text-teal-700 ml-4">matches = hash_table.lookup(r.key)</div>
                  <div className="text-teal-700 ml-4">for each match: emit (r, match)</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 text-xs">
                <p className="font-semibold text-teal-700 mb-1">Performance</p>
                <ul className="text-gray-600 space-y-1">
                  <li>
                    • <strong>In-memory:</strong> O(N + M)
                  </li>
                  <li>
                    • <strong>Spill to disk:</strong> O(N + M) with extra I/O
                  </li>
                  <li>
                    • <strong>Best for:</strong> Large equi-joins, no useful index
                  </li>
                  <li>
                    • <strong>Memory:</strong> work_mem per hash table
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Merge Join */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-2">3. Sort-Merge Join</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <p className="text-sm text-gray-700 mb-2">
                  Both inputs are sorted on the join key, then merged like a zipper. If inputs are
                  already sorted (from an index or previous sort), the sort step is free. Excellent
                  for range join conditions and merge-joinable operators.
                </p>
                <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-x-auto">
                  <div className="text-gray-500">-- Both sorted on join key:</div>
                  <div className="text-emerald-700">advance(left), advance(right)</div>
                  <div className="text-emerald-700">while left and right not exhausted:</div>
                  <div className="text-emerald-700 ml-4">if left.key == right.key: emit match</div>
                  <div className="text-emerald-700 ml-4">
                    elif left.key {'<'} right.key: advance(left)
                  </div>
                  <div className="text-emerald-700 ml-4">else: advance(right)</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 text-xs">
                <p className="font-semibold text-emerald-700 mb-1">Performance</p>
                <ul className="text-gray-600 space-y-1">
                  <li>
                    • <strong>Pre-sorted:</strong> O(N + M)
                  </li>
                  <li>
                    • <strong>Needs sort:</strong> O(N log N + M log M)
                  </li>
                  <li>
                    • <strong>Best for:</strong> Large sorted datasets, range joins
                  </li>
                  <li>
                    • <strong>Memory:</strong> Minimal (streaming)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Cardinality Estimation */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-teal-600" />
          <span>Cardinality Estimation &amp; Statistics</span>
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          The optimizer&apos;s effectiveness depends on{' '}
          <strong>accurate row count estimates</strong>. Wrong estimates → wrong join order →
          catastrophic performance. PostgreSQL&apos;s{' '}
          <code className="bg-gray-100 px-1 rounded text-sm">pg_statistic</code> and Oracle&apos;s{' '}
          <code className="bg-gray-100 px-1 rounded text-sm">USER_TAB_COL_STATISTICS</code> store
          these histograms:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">Statistics Collected</h4>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li>
                <strong>n_distinct</strong> — number of unique values in a column
              </li>
              <li>
                <strong>most_common_vals</strong> — top-N values and their frequencies
              </li>
              <li>
                <strong>histogram_bounds</strong> — equal-height histogram for range selectivity
              </li>
              <li>
                <strong>correlation</strong> — physical ordering vs logical ordering (drives index
                scan cost)
              </li>
              <li>
                <strong>null_frac</strong> — fraction of NULL values
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">When Estimates Go Wrong</h4>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li>
                <strong>Correlated columns</strong> — optimizer assumes independence between
                predicates (city=&apos;SF&apos; AND state=&apos;CA&apos;)
              </li>
              <li>
                <strong>Stale statistics</strong> — table grew 10× since last ANALYZE
              </li>
              <li>
                <strong>Skewed data</strong> — a few values have millions of rows; others have 1
              </li>
              <li>
                <strong>Complex expressions</strong> — optimizer uses flat 0.1% default selectivity
              </li>
              <li>
                <strong>Fix:</strong> Run ANALYZE, create extended statistics (PG 10+), or SQL
                Profiles (Oracle)
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
          <p className="text-sm text-gray-700">
            <strong>Pro tip:</strong> Compare estimated vs actual rows in{' '}
            <code className="bg-white px-1 rounded text-xs">EXPLAIN (ANALYZE, BUFFERS)</code>. If{' '}
            <em>rows=1000</em> but <em>actual rows=1,000,000</em> — you have a cardinality
            estimation problem. Run{' '}
            <code className="bg-white px-1 rounded text-xs">ANALYZE tablename</code> and consider
            <code className="bg-white px-1 rounded text-xs">CREATE STATISTICS</code> for correlated
            columns.
          </p>
        </div>
      </ThemeCard>

      {/* Plan Caching */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 text-teal-600" />
          <span>Plan Caching &amp; Prepared Statements</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-2">Oracle — Library Cache (SGA)</h3>
            <p className="text-sm text-gray-700 mb-2">
              Oracle aggressively caches parsed SQL in the <strong>Library Cache</strong> (part of
              the Shared Pool in SGA). Identical SQL text → cache hit → skip parsing + optimization.
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>
                • <strong>Cursor Sharing:</strong> EXACT (default), SIMILAR, FORCE
              </li>
              <li>
                • <strong>Bind Variable Peeking:</strong> optimizer peeks at first bind value to
                choose plan
              </li>
              <li>
                • <strong>Adaptive Cursor Sharing (11g+):</strong> multiple plans for different bind
                values
              </li>
              <li>
                • <strong>SQL Plan Management:</strong> capture plan baselines to prevent regression
              </li>
            </ul>
          </div>

          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-2">PostgreSQL — Per-Session Cache</h3>
            <p className="text-sm text-gray-700 mb-2">
              PostgreSQL caches plans <strong>per connection</strong> in the backend process memory.
              No cross-session plan sharing (no global library cache).
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>
                • <strong>PREPARE / EXECUTE:</strong> manual prepared statements
              </li>
              <li>
                • <strong>Generic vs Custom Plans:</strong> after 5 executions, PG decides whether a
                generic plan (parameterized) is close enough to custom plans
              </li>
              <li>
                • <strong>plan_cache_mode:</strong> force_generic_plan or force_custom_plan GUC
              </li>
              <li>
                • <strong>pg_prepared_statements:</strong> view active cached plans per session
              </li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* EXPLAIN query example */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <ArrowDownUp className="w-6 h-6 text-teal-600" />
          <span>Reading Execution Plans</span>
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Use{' '}
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
          </code>{' '}
          in PostgreSQL or{' '}
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">EXPLAIN PLAN / DBMS_XPLAN</code>{' '}
          in Oracle to see exactly how the optimizer processes your query:
        </p>
        <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm overflow-x-auto">
          <div className="text-green-400">EXPLAIN (ANALYZE, BUFFERS)</div>
          <div className="text-blue-300">SELECT e.name, d.dept_name</div>
          <div className="text-blue-300">
            FROM employees e JOIN departments d ON e.dept_id = d.id
          </div>
          <div className="text-blue-300">WHERE d.dept_name = &apos;Engineering&apos;;</div>
          <div className="mt-3 text-gray-400">-- Output:</div>
          <div className="text-yellow-300">
            Hash Join (cost=1.07..24.63 rows=42 width=36) (actual time=0.031..0.158 rows=42)
          </div>
          <div className="text-yellow-300 ml-4">Hash Cond: (e.dept_id = d.id)</div>
          <div className="text-yellow-300 ml-4">Buffers: shared hit=8</div>
          <div className="text-yellow-300 ml-4">
            → Seq Scan on employees e (rows=1000) (actual rows=1000)
          </div>
          <div className="text-yellow-300 ml-4">→ Hash (rows=1 width=4)</div>
          <div className="text-yellow-300 ml-8">
            → Index Scan on departments d (rows=1) (actual rows=1)
          </div>
          <div className="text-yellow-300 ml-12">Filter: (dept_name = &apos;Engineering&apos;)</div>
          <div className="text-yellow-300 mt-2 ml-4">
            Planning Time: 0.12 ms &nbsp; Execution Time: 0.19 ms
          </div>
        </div>
        <div className="mt-3 bg-teal-50 rounded-lg p-3 border border-teal-100">
          <p className="text-xs text-gray-700">
            <strong>Key metrics to watch:</strong> (1) <em>estimated rows</em> vs{' '}
            <em>actual rows</em> — large divergence = bad statistics. (2){' '}
            <em>Buffers: shared hit</em> vs <em>shared read</em> — reads mean cache misses. (3){' '}
            <em>loops</em> — nested loop iterations (multiply actual rows × loops for true row
            count).
          </p>
        </div>
      </ThemeCard>
    </div>
  );
};

export default QueryProcessor;
