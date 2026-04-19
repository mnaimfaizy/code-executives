import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import MemoryModel2D from '../visualizations/2d/MemoryModel2D';
import PythonCodeBlock from '../shared/PythonCodeBlock';

const codeExamples: Record<string, { code: string; title: string; output?: string }> = {
  refcount: {
    title: 'Reference Counting with sys.getrefcount()',
    code: `import sys

a = [1, 2, 3]
print(sys.getrefcount(a))  # 2 (a + getrefcount arg)

b = a                       # another reference
print(sys.getrefcount(a))  # 3

c = a
print(sys.getrefcount(a))  # 4

del b                       # remove one reference
print(sys.getrefcount(a))  # 3

del c
print(sys.getrefcount(a))  # 2 (back to a + arg)`,
    output: `2\n3\n4\n3\n2`,
  },
  gc_module: {
    title: 'Controlling the Garbage Collector',
    code: `import gc

# Check current thresholds
print(gc.get_threshold())  # (700, 10, 10)

# Get GC statistics per generation
for i, stats in enumerate(gc.get_stats()):
    print(f"Gen {i}: {stats['collections']} collections, "
          f"{stats['collected']} collected")

# Manually trigger collection
collected = gc.collect()
print(f"Collected {collected} objects")

# Disable GC for performance-critical code
gc.disable()
# ... performance-critical section ...
gc.enable()

# Find objects with circular references
gc.set_debug(gc.DEBUG_SAVEALL)
gc.collect()
print(f"Uncollectable: {gc.garbage}")`,
    output: `(700, 10, 10)\nGen 0: 85 collections, 1204 collected\nGen 1: 7 collections, 34 collected\nGen 2: 1 collections, 0 collected\nCollected 0 objects\nUncollectable: []`,
  },
  weakref: {
    title: 'Weak References — Avoiding Memory Leaks',
    code: `import weakref

class ExpensiveObject:
    def __init__(self, name):
        self.name = name
    def __repr__(self):
        return f"ExpensiveObject({self.name!r})"
    def __del__(self):
        print(f"{self.name} is being destroyed")

# Strong reference keeps object alive
obj = ExpensiveObject("data")
strong_ref = obj

# Weak reference does NOT increase ref count
weak_ref = weakref.ref(obj)
print(weak_ref())  # ExpensiveObject('data')

del obj             # still alive (strong_ref exists)
print(weak_ref())  # ExpensiveObject('data')

del strong_ref      # NOW destroyed (ref count = 0)
print(weak_ref())  # None (object was collected)

# WeakValueDictionary for caches
cache = weakref.WeakValueDictionary()
obj2 = ExpensiveObject("cached")
cache["key"] = obj2
print("key" in cache)  # True
del obj2
print("key" in cache)  # False (auto-removed)`,
    output: `ExpensiveObject('data')\nExpensiveObject('data')\ndata is being destroyed\nNone\nTrue\ncached is being destroyed\nFalse`,
  },
  tracemalloc: {
    title: 'Memory Profiling with tracemalloc',
    code: `import tracemalloc

# Start tracing memory allocations
tracemalloc.start()

# Your code that uses memory
data = [i ** 2 for i in range(10000)]
big_dict = {str(i): i for i in range(5000)}
nested = [[j for j in range(100)] for _ in range(100)]

# Take a snapshot
snapshot = tracemalloc.take_snapshot()

# Display top 5 memory consumers
print("Top 5 memory allocations:")
for stat in snapshot.statistics("lineno")[:5]:
    print(f"  {stat}")

# Compare two snapshots to find leaks
snapshot1 = tracemalloc.take_snapshot()
more_data = [0] * 1000000  # allocate more
snapshot2 = tracemalloc.take_snapshot()

diff = snapshot2.compare_to(snapshot1, "lineno")
print("\\nMemory changes:")
for stat in diff[:3]:
    print(f"  {stat}")

# Current and peak memory usage
current, peak = tracemalloc.get_traced_memory()
print(f"\\nCurrent: {current / 1024:.1f} KB")
print(f"Peak:    {peak / 1024:.1f} KB")

tracemalloc.stop()`,
    output: `Top 5 memory allocations:\n  <script>:5: size=352 KiB, count=10001\n  <script>:6: size=234 KiB, count=5001\n  <script>:7: size=89 KiB, count=101\n\nMemory changes:\n  <script>:14: size=7813 KiB, count=1\n\nCurrent: 8512.3 KB\nPeak:    8520.1 KB`,
  },
};

const MemoryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('refcount');
  const [refCount, setRefCount] = useState<number>(3);
  const [objects, setObjects] = useState<
    Array<{ id: number; refs: number; color: string; label: string }>
  >([
    { id: 1, refs: 2, color: 'bg-blue-500', label: 'list obj' },
    { id: 2, refs: 1, color: 'bg-green-500', label: 'dict obj' },
    { id: 3, refs: 0, color: 'bg-amber-500', label: 'str obj' },
    { id: 4, refs: 3, color: 'bg-purple-500', label: 'class obj' },
    { id: 5, refs: 0, color: 'bg-red-500', label: 'temp obj' },
  ]);
  const [gcPhase, setGcPhase] = useState<'idle' | 'marking' | 'sweeping' | 'collecting'>('idle');

  const runGarbageCollection = (): void => {
    setGcPhase('marking');
    setTimeout(() => setGcPhase('sweeping'), 1200);
    setTimeout(() => setGcPhase('collecting'), 2400);
    setTimeout(() => {
      setObjects((prev) => prev.filter((obj) => obj.refs > 0));
      setGcPhase('idle');
    }, 3600);
  };

  const resetGC = (): void => {
    setObjects([
      { id: 1, refs: 2, color: 'bg-blue-500', label: 'list obj' },
      { id: 2, refs: 1, color: 'bg-green-500', label: 'dict obj' },
      { id: 3, refs: 0, color: 'bg-amber-500', label: 'str obj' },
      { id: 4, refs: 3, color: 'bg-purple-500', label: 'class obj' },
      { id: 5, refs: 0, color: 'bg-red-500', label: 'temp obj' },
    ]);
    setGcPhase('idle');
  };

  const tabs = [
    { key: 'refcount', label: 'sys.getrefcount()' },
    { key: 'gc_module', label: 'gc Module' },
    { key: 'weakref', label: 'weakref' },
    { key: 'tracemalloc', label: 'tracemalloc' },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Python Memory Management</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          How Python handles memory allocation, garbage collection, and object lifecycle
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: 'Reference', label: 'Counting (Primary)' },
          { value: 'Generational', label: 'Cyclic GC (3 gens)' },
          { value: 'pymalloc', label: 'Arena → Pool → Block' },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  const mainContent = (
    <>
      {/* Memory Model Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
            🧠
          </span>
          Interactive Memory Model
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          Step through Python&apos;s memory management: from object creation and reference counting,
          through circular reference detection, to generational garbage collection and the pymalloc
          allocator.
        </p>
        <MemoryModel2D />
      </ThemeCard>

      {/* Interactive Reference Counting Demo */}
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-blue-500">🔢</span>
            Reference Counting Demo
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setRefCount(Math.max(0, refCount - 1))}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              − del ref
            </button>
            <button
              onClick={() => setRefCount(refCount + 1)}
              className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              + new ref
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
          {/* Object display */}
          <div className="flex items-center gap-6 mb-5">
            <div
              className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center text-white font-bold transition-all duration-300 shadow-lg ${refCount > 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 scale-100' : 'bg-gradient-to-br from-red-500 to-red-700 scale-90 opacity-60'}`}
            >
              <span className="text-2xl">📦</span>
              <span className="text-xs mt-0.5">Object</span>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Reference Count</div>
              <div
                className={`text-4xl font-bold transition-colors ${refCount > 0 ? 'text-blue-700' : 'text-red-600'}`}
              >
                {refCount}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {refCount > 2
                  ? 'Multiple references — shared object'
                  : refCount > 0
                    ? 'Active — object in use'
                    : 'Zero — deallocated immediately!'}
              </div>
            </div>
          </div>

          {/* Reference arrows */}
          <div className="flex flex-wrap gap-2 mb-3">
            {Array.from({ length: refCount }, (_, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm"
              >
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700 font-medium">
                  {i === 0
                    ? 'variable_a'
                    : i === 1
                      ? 'variable_b'
                      : i === 2
                        ? 'list_item'
                        : `ref_${i + 1}`}
                </span>
                <span className="text-blue-400">→</span>
              </div>
            ))}
          </div>

          {refCount === 0 && (
            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg animate-pulse">
              <p className="text-red-800 text-sm font-medium">
                💀 Object deallocated! Memory returned to pymalloc pool.
              </p>
            </div>
          )}
        </div>
      </ThemeCard>

      {/* Garbage Collection Demo */}
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-purple-500">♻️</span>
            Garbage Collection Simulation
          </h3>
          <div className="flex gap-2">
            <button
              onClick={resetGC}
              disabled={gcPhase !== 'idle'}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              ↻ Reset
            </button>
            <button
              onClick={runGarbageCollection}
              disabled={gcPhase !== 'idle'}
              className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              {gcPhase === 'idle' ? '🗑️ Run gc.collect()' : `⏳ ${gcPhase}...`}
            </button>
          </div>
        </div>

        {/* Phase indicator */}
        <div className="flex gap-1 mb-4">
          {(['idle', 'marking', 'sweeping', 'collecting'] as const).map((phase) => (
            <div
              key={phase}
              className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                phase === gcPhase
                  ? phase === 'marking'
                    ? 'bg-yellow-400'
                    : phase === 'sweeping'
                      ? 'bg-orange-400'
                      : phase === 'collecting'
                        ? 'bg-red-400'
                        : 'bg-gray-200'
                  : (['idle', 'marking', 'sweeping', 'collecting'] as const).indexOf(phase) <
                      (['idle', 'marking', 'sweeping', 'collecting'] as const).indexOf(gcPhase)
                    ? 'bg-green-300'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-100">
          <div className="grid grid-cols-5 gap-3 mb-4">
            {objects.map((obj) => (
              <div
                key={obj.id}
                className={`p-3 rounded-xl border-2 transition-all duration-500 text-center ${
                  obj.refs === 0 && gcPhase === 'collecting'
                    ? 'border-red-400 bg-red-100 scale-75 opacity-30'
                    : obj.refs === 0 && gcPhase === 'sweeping'
                      ? 'border-red-400 bg-red-50 scale-95'
                      : gcPhase === 'marking'
                        ? obj.refs > 0
                          ? 'border-green-400 bg-green-50'
                          : 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-200 bg-white'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg mx-auto mb-2 ${obj.color} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {obj.refs === 0 && gcPhase !== 'idle' ? '✕' : obj.refs}
                </div>
                <div className="text-xs font-medium text-gray-800">{obj.label}</div>
                <div className="text-xs text-gray-500">refs: {obj.refs}</div>
              </div>
            ))}
          </div>

          <div
            className={`text-center text-sm font-medium p-2 rounded-lg ${
              gcPhase === 'idle'
                ? 'text-gray-600 bg-gray-50'
                : gcPhase === 'marking'
                  ? 'text-yellow-800 bg-yellow-100'
                  : gcPhase === 'sweeping'
                    ? 'text-orange-800 bg-orange-100'
                    : 'text-red-800 bg-red-100'
            }`}
          >
            {gcPhase === 'idle' && '💤 GC idle — objects with refs=0 will be collected'}
            {gcPhase === 'marking' &&
              '🔍 Phase 1: Marking reachable objects (green) and unreachable (yellow)...'}
            {gcPhase === 'sweeping' && '🧹 Phase 2: Sweeping — identifying objects to free...'}
            {gcPhase === 'collecting' && '♻️ Phase 3: Collecting — freeing unreachable objects!'}
          </div>
        </div>
      </ThemeCard>

      {/* Code Examples */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-indigo-500">💻</span>
          Memory Management in Practice
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <PythonCodeBlock
          code={codeExamples[activeTab].code}
          title={codeExamples[activeTab].title}
          output={codeExamples[activeTab].output}
          showLineNumbers
        />
      </ThemeCard>

      {/* Memory Management Internals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-blue-500">🔢</span>
            Reference Counting
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-semibold text-blue-900 mb-1">How It Works</h4>
              <p>
                Every PyObject has a <code className="bg-blue-100 px-1 rounded">ob_refcnt</code>{' '}
                field. Incremented on assignment, decremented on{' '}
                <code className="bg-blue-100 px-1 rounded">del</code> or scope exit.
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-semibold text-blue-900 mb-1">Immediate Cleanup</h4>
              <p>
                When <code className="bg-blue-100 px-1 rounded">ob_refcnt</code> reaches 0,{' '}
                <code className="bg-blue-100 px-1 rounded">tp_dealloc</code> is called immediately —
                no waiting for GC.
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-semibold text-blue-900 mb-1">Thread Safety</h4>
              <p>
                The GIL protects refcount updates. This is why the GIL exists — to keep reference
                counting thread-safe.
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
              <h4 className="font-semibold text-amber-900 mb-1">⚠️ Limitation</h4>
              <p>
                Cannot detect circular references:{' '}
                <code className="bg-amber-100 px-1 rounded">a.ref = b; b.ref = a</code> — both stay
                at refcount=1 forever.
              </p>
            </div>
          </div>
        </ThemeCard>

        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-purple-500">🔄</span>
            Generational Cyclic GC
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
              <h4 className="font-semibold text-purple-900 mb-1">3 Generations</h4>
              <p>
                Gen 0 (young, frequent), Gen 1 (middle), Gen 2 (old, rare). New objects start in Gen
                0.
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
              <h4 className="font-semibold text-purple-900 mb-1">Thresholds: (700, 10, 10)</h4>
              <p>
                Gen 0 runs after 700 alloc−dealloc. Gen 1 after 10 Gen-0 runs. Gen 2 after 10 Gen-1
                runs.
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
              <h4 className="font-semibold text-purple-900 mb-1">Mark & Sweep</h4>
              <p>
                Traces from root set, identifies unreachable cycles, decrements internal refcounts
                to detect garbage.
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
              <h4 className="font-semibold text-green-900 mb-1">✅ Promotion</h4>
              <p>
                Objects surviving a collection cycle promote to the next generation — long-lived
                objects are checked less often.
              </p>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* pymalloc Architecture */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-cyan-500">🏗️</span>
          pymalloc Memory Allocator Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 text-center">
            <div className="text-3xl mb-2">🏟️</div>
            <h4 className="font-bold text-blue-900 mb-1">Arena</h4>
            <p className="text-sm text-blue-800 font-medium">256 KB</p>
            <p className="text-xs text-blue-700 mt-1">
              Allocated from OS via mmap/VirtualAlloc. Contains multiple pools.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 text-center">
            <div className="text-3xl mb-2">🏊</div>
            <h4 className="font-bold text-purple-900 mb-1">Pool</h4>
            <p className="text-sm text-purple-800 font-medium">4 KB (one page)</p>
            <p className="text-xs text-purple-700 mt-1">
              Each pool serves one block size class. Pools are reused efficiently.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 text-center">
            <div className="text-3xl mb-2">🧱</div>
            <h4 className="font-bold text-green-900 mb-1">Block</h4>
            <p className="text-sm text-green-800 font-medium">8–512 bytes</p>
            <p className="text-xs text-green-700 mt-1">
              Fixed-size chunks. 64 size classes (8, 16, 24, ..., 512). Objects &gt;512 use malloc.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Why pymalloc is fast</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <p>
                <strong>No system calls</strong> for small objects — uses pre-allocated pools
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <p>
                <strong>Size class matching</strong> — minimal internal fragmentation
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <p>
                <strong>Free list per pool</strong> — O(1) alloc and dealloc
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <p>
                <strong>Cache-friendly</strong> — pools fit in CPU cache lines
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Common Issues & Best Practices */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          Common Memory Issues & Solutions
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-1.5">
                <span>🔴</span> Memory Leaks
              </h4>
              <p className="text-sm text-red-800 mb-2">
                Circular references, global caches that grow unbounded, or forgotten event
                listeners.
              </p>
              <div className="text-xs bg-red-100 p-2 rounded-lg">
                <strong>Fix:</strong> Use <code>weakref</code>, implement <code>__del__</code>, use
                context managers, profile with <code>tracemalloc</code>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-1.5">
                <span>🟡</span> GC Pauses
              </h4>
              <p className="text-sm text-amber-800 mb-2">
                Full Gen-2 collections can cause latency spikes in real-time applications.
              </p>
              <div className="text-xs bg-amber-100 p-2 rounded-lg">
                <strong>Fix:</strong> Tune thresholds with <code>gc.set_threshold()</code>, disable
                GC in hot paths, use <code>gc.freeze()</code> in 3.7+
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-1.5">
                <span>🟠</span> Memory Fragmentation
              </h4>
              <p className="text-sm text-orange-800 mb-2">
                Arenas can&apos;t be freed until all pools are empty. RSS stays high even after
                freeing objects.
              </p>
              <div className="text-xs bg-orange-100 p-2 rounded-lg">
                <strong>Fix:</strong> Reuse objects, use <code>__slots__</code> on classes, prefer
                arrays/numpy over lists of objects
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
                <span>🔵</span> Large Object Overhead
              </h4>
              <p className="text-sm text-blue-800 mb-2">
                Objects &gt;512 bytes bypass pymalloc and use system malloc, which is slower.
              </p>
              <div className="text-xs bg-blue-100 p-2 rounded-lg">
                <strong>Fix:</strong> Use <code>numpy</code> arrays for large numeric data,
                memory-map files with <code>mmap</code>, use generators instead of lists
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-semibold text-green-900 mb-3">✅ Best Practices Checklist</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">1.</span>
                <div>
                  <h5 className="font-medium text-green-900">Use Context Managers</h5>
                  <p className="text-green-800 text-xs">
                    Ensure cleanup with <code>with</code> statements for files, connections, locks
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">2.</span>
                <div>
                  <h5 className="font-medium text-green-900">Use __slots__ on Classes</h5>
                  <p className="text-green-800 text-xs">
                    Reduces per-instance memory by ~40% — no __dict__ overhead
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">3.</span>
                <div>
                  <h5 className="font-medium text-green-900">Prefer Generators</h5>
                  <p className="text-green-800 text-xs">
                    Use <code>yield</code> for large sequences — O(1) memory vs O(n)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">4.</span>
                <div>
                  <h5 className="font-medium text-green-900">Profile Regularly</h5>
                  <p className="text-green-800 text-xs">
                    Use <code>tracemalloc</code>, <code>memory_profiler</code>,{' '}
                    <code>objgraph</code> to find leaks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Memory Architecture</h3>
        <div className="text-sm text-gray-600 space-y-3">
          <div className="bg-blue-50 p-2.5 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-0.5">Reference Counting</h4>
            <p className="text-xs">Primary mechanism. Immediate deallocation at refcount=0.</p>
          </div>
          <div className="bg-purple-50 p-2.5 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-0.5">Cyclic GC</h4>
            <p className="text-xs">
              Handles circular refs. 3 generations with configurable thresholds.
            </p>
          </div>
          <div className="bg-cyan-50 p-2.5 rounded-lg">
            <h4 className="font-medium text-cyan-900 mb-0.5">pymalloc</h4>
            <p className="text-xs">Arena → Pool → Block. Fast allocation for objects ≤512 bytes.</p>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Numbers</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
            <span className="text-gray-600">GC Generations</span>
            <span className="font-bold text-blue-700">3</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
            <span className="text-gray-600">Gen 0 Threshold</span>
            <span className="font-bold text-green-700">700</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
            <span className="text-gray-600">Arena Size</span>
            <span className="font-bold text-purple-700">256 KB</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
            <span className="text-gray-600">Pool Size</span>
            <span className="font-bold text-indigo-700">4 KB</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
            <span className="text-gray-600">Block Sizes</span>
            <span className="font-bold text-cyan-700">8–512 B</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-gray-600">Size Classes</span>
            <span className="font-bold text-amber-700">64</span>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Useful Tools</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span className="text-blue-500">📊</span>
            <div>
              <span className="font-medium">tracemalloc</span>
              <span className="text-gray-500 ml-1">— allocation tracing</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span className="text-purple-500">🔄</span>
            <div>
              <span className="font-medium">gc module</span>
              <span className="text-gray-500 ml-1">— GC control</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span className="text-green-500">🔗</span>
            <div>
              <span className="font-medium">weakref</span>
              <span className="text-gray-500 ml-1">— non-owning refs</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span className="text-amber-500">📈</span>
            <div>
              <span className="font-medium">sys.getsizeof()</span>
              <span className="text-gray-500 ml-1">— object sizes</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span className="text-red-500">🔍</span>
            <div>
              <span className="font-medium">objgraph</span>
              <span className="text-gray-500 ml-1">— reference graphs</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span className="text-cyan-500">🧪</span>
            <div>
              <span className="font-medium">memory_profiler</span>
              <span className="text-gray-500 ml-1">— line-by-line</span>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  return (
    <SectionLayout
      section="python"
      hero={heroContent}
      mainContent={mainContent}
      sidebar={sidebarContent}
    />
  );
};

export default MemoryManagement;
