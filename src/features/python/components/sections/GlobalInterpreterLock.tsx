import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';
import GILVisualization from '../visualizations/2d/GILVisualization';
import PythonCodeBlock from '../shared/PythonCodeBlock';

// ---------------------------------------------------------------------------
// Code Examples
// ---------------------------------------------------------------------------

const CODE_THREADING_BASIC = `import threading
import time

counter = 0

def increment():
    global counter
    for _ in range(1_000_000):
        counter += 1   # NOT atomic!

t1 = threading.Thread(target=increment)
t2 = threading.Thread(target=increment)

t1.start(); t2.start()
t1.join();  t2.join()

print(counter)  # Expected: 2,000,000
# Actual: ~1,500,000 (race condition!)`;

const CODE_THREADING_LOCK = `import threading

lock = threading.Lock()
counter = 0

def safe_increment():
    global counter
    for _ in range(1_000_000):
        with lock:           # acquire GIL + lock
            counter += 1     # thread-safe

t1 = threading.Thread(target=safe_increment)
t2 = threading.Thread(target=safe_increment)
t1.start(); t2.start()
t1.join();  t2.join()
print(counter)  # Always 2,000,000`;

const CODE_GIL_INTERVAL = `import sys

# Default: 5ms (0.005 seconds)
print(sys.getswitchinterval())  # 0.005

# You can change it (rarely needed)
sys.setswitchinterval(0.001)  # 1ms

# Python 3.2+ uses time-based switching
# Before 3.2: switched every 100 bytecode ops`;

const CODE_CPU_BOUND = `import threading, time

def cpu_work():
    """CPU-bound: sum 10 million numbers"""
    return sum(range(10**7))

# Single-threaded
start = time.perf_counter()
cpu_work(); cpu_work()
single = time.perf_counter() - start

# Multi-threaded (2 threads)
start = time.perf_counter()
t1 = threading.Thread(target=cpu_work)
t2 = threading.Thread(target=cpu_work)
t1.start(); t2.start()
t1.join();  t2.join()
threaded = time.perf_counter() - start

print(f"Single: {single:.3f}s")
print(f"Threaded: {threaded:.3f}s")`;

const CODE_CPU_BOUND_OUTPUT = `Single: 0.312s
Threaded: 0.387s   # SLOWER due to GIL contention!`;

const CODE_IO_BOUND = `import threading, time, urllib.request

def download(url):
    """I/O-bound: GIL released during network I/O"""
    urllib.request.urlopen(url).read()

urls = [
    "https://example.com",
    "https://example.com",
    "https://example.com",
]

# Sequential
start = time.perf_counter()
for url in urls:
    download(url)
sequential = time.perf_counter() - start

# Threaded — GIL released during I/O!
start = time.perf_counter()
threads = [threading.Thread(target=download, args=(u,))
           for u in urls]
for t in threads: t.start()
for t in threads: t.join()
threaded = time.perf_counter() - start

print(f"Sequential: {sequential:.2f}s")
print(f"Threaded:   {threaded:.2f}s")`;

const CODE_IO_BOUND_OUTPUT = `Sequential: 1.82s
Threaded:   0.65s   # ~3x FASTER for I/O!`;

const CODE_MULTIPROCESSING = `from multiprocessing import Pool
import time

def cpu_work(n):
    return sum(range(n))

if __name__ == "__main__":
    nums = [10**7] * 4  # 4 tasks

    # Single process
    start = time.perf_counter()
    results = [cpu_work(n) for n in nums]
    single = time.perf_counter() - start

    # 4 processes (4 cores)
    start = time.perf_counter()
    with Pool(4) as pool:
        results = pool.map(cpu_work, nums)
    multi = time.perf_counter() - start

    print(f"Single:  {single:.3f}s")
    print(f"4 procs: {multi:.3f}s")`;

const CODE_MULTIPROCESSING_OUTPUT = `Single:  1.24s
4 procs: 0.35s   # ~3.5x faster with 4 cores!`;

const CODE_ASYNCIO = `import asyncio
import aiohttp
import time

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.text()

async def main():
    urls = ["https://example.com"] * 10
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, u) for u in urls]
        results = await asyncio.gather(*tasks)
    print(f"Fetched {len(results)} pages")

start = time.perf_counter()
asyncio.run(main())
elapsed = time.perf_counter() - start
print(f"Async: {elapsed:.2f}s")  # ~0.3s`;

const CODE_CONCURRENT_FUTURES = `from concurrent.futures import (
    ThreadPoolExecutor,
    ProcessPoolExecutor,
)

def io_task(url):
    import urllib.request
    return urllib.request.urlopen(url).read()

def cpu_task(n):
    return sum(range(n))

# Thread pool for I/O-bound work
with ThreadPoolExecutor(max_workers=10) as ex:
    urls = ["https://example.com"] * 10
    results = list(ex.map(io_task, urls))

# Process pool for CPU-bound work
with ProcessPoolExecutor(max_workers=4) as ex:
    nums = [10**7] * 4
    results = list(ex.map(cpu_task, nums))`;

const CODE_PEP703 = `# Python 3.13+ free-threaded build
# Install: python3.13t (note the 't' suffix)
# Or set: PYTHON_GIL=0

import sys
import threading

# Check if GIL is enabled
print(sys._is_gil_enabled())  # False!

# Now threads run truly in parallel
def cpu_work():
    return sum(range(10**7))

threads = [threading.Thread(target=cpu_work)
           for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
# Actually uses all 4 CPU cores!`;

const CODE_C_EXTENSION = `# C extensions can release the GIL manually
# using Py_BEGIN_ALLOW_THREADS macro

# NumPy releases GIL for array operations
import numpy as np
import threading

def numpy_work():
    a = np.random.rand(10_000_000)
    return np.sort(a)  # GIL released!

# This IS parallel even with threads
threads = [threading.Thread(target=numpy_work)
           for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()`;

// ---------------------------------------------------------------------------
// Tabbed code example data
// ---------------------------------------------------------------------------

interface CodeTab {
  id: string;
  label: string;
  code: string;
  output?: string;
  highlightLines?: number[];
}

const threadingTabs: CodeTab[] = [
  { id: 'race', label: 'Race Condition', code: CODE_THREADING_BASIC, highlightLines: [8, 9] },
  { id: 'lock', label: 'Thread Lock', code: CODE_THREADING_LOCK, highlightLines: [7, 8] },
  { id: 'interval', label: 'Switch Interval', code: CODE_GIL_INTERVAL, highlightLines: [3, 6] },
];

const solutionTabs: CodeTab[] = [
  {
    id: 'multiprocessing',
    label: 'multiprocessing',
    code: CODE_MULTIPROCESSING,
    output: CODE_MULTIPROCESSING_OUTPUT,
    highlightLines: [12, 13],
  },
  {
    id: 'asyncio',
    label: 'asyncio',
    code: CODE_ASYNCIO,
    highlightLines: [6, 7, 8],
  },
  {
    id: 'futures',
    label: 'concurrent.futures',
    code: CODE_CONCURRENT_FUTURES,
    highlightLines: [12, 13, 17, 18],
  },
  {
    id: 'cext',
    label: 'C Extensions',
    code: CODE_C_EXTENSION,
    highlightLines: [7, 8, 9],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const GlobalInterpreterLock: React.FC = () => {
  const [activeThreadingTab, setActiveThreadingTab] = useState('race');
  const [activeSolutionTab, setActiveSolutionTab] = useState('multiprocessing');

  const currentThreading =
    threadingTabs.find((t) => t.id === activeThreadingTab) ?? threadingTabs[0];
  const currentSolution = solutionTabs.find((t) => t.id === activeSolutionTab) ?? solutionTabs[0];

  // ---------------------------------------------------------------------------
  // Hero
  // ---------------------------------------------------------------------------
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Global Interpreter Lock (GIL)</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          The GIL is a mutex inside CPython that allows only one thread to execute Python bytecode
          at a time — even on multi-core machines. Understanding it is key to writing fast
          concurrent Python.
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '5 ms', label: 'Default switch interval' },
          { value: '1 Thread', label: 'Executes bytecode at a time' },
          { value: 'PEP 703', label: 'Free-threaded Python 3.13+' },
          { value: '4 Solutions', label: 'multiprocessing, asyncio, …' },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  // ---------------------------------------------------------------------------
  // Main content
  // ---------------------------------------------------------------------------
  const mainContent = (
    <>
      {/* 1 — Interactive Visualization */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive GIL Walkthrough</h2>
        <p className="text-gray-600 mb-4">
          Step through 8 scenarios to see how the GIL affects thread execution, I/O,
          multiprocessing, asyncio, and the upcoming free-threaded mode.
        </p>
        <GILVisualization />
      </ThemeCard>

      {/* 2 — What is the GIL */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">1</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">What is the GIL?</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            The <strong>Global Interpreter Lock</strong> is a per-interpreter mutex in CPython.
            Before any thread can execute Python bytecode, it must acquire the GIL. This means only
            one thread runs Python code at any given moment — even on a 16-core machine.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Why does it exist?</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  <strong>Reference counting:</strong> CPython tracks every object with a reference
                  count. Without the GIL, concurrent increments / decrements would corrupt memory.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  <strong>C extension safety:</strong> Thousands of C libraries assume
                  single-threaded access to Python objects. The GIL guarantees that.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  <strong>Simplicity:</strong> Single-threaded programs are never slowed by
                  fine-grained per-object locks.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* 3 — Threading & the GIL */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">2</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Threading &amp; the GIL</h2>
        </div>
        <p className="text-gray-600 mb-4">
          The GIL makes Python threading safe for internal interpreter state, but it does NOT make
          your own code thread-safe. Race conditions still happen with shared mutable data.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {threadingTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveThreadingTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeThreadingTab === tab.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <PythonCodeBlock
          code={currentThreading.code}
          title={currentThreading.label}
          highlightLines={currentThreading.highlightLines}
          showLineNumbers
        />
      </ThemeCard>

      {/* 4 — CPU-bound vs I/O-bound */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">3</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">CPU-Bound vs I/O-Bound</h2>
        </div>
        <p className="text-gray-600 mb-4">
          The GIL's impact depends entirely on the workload type. I/O-bound code benefits from
          threading because the GIL is released during I/O. CPU-bound code does not.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                !
              </span>
              CPU-Bound (GIL bottleneck)
            </h4>
            <ul className="space-y-1 text-sm text-red-800">
              <li>
                • Threading is <strong>slower</strong> than sequential
              </li>
              <li>• Context-switch overhead with no parallelism</li>
              <li>• Use multiprocessing or C extensions</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                ✓
              </span>
              I/O-Bound (GIL released)
            </h4>
            <ul className="space-y-1 text-sm text-green-800">
              <li>
                • Threading is <strong>faster</strong> (overlapping I/O)
              </li>
              <li>• GIL released during file / network / DB ops</li>
              <li>• Also consider asyncio for high concurrency</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <PythonCodeBlock
            code={CODE_CPU_BOUND}
            title="CPU-Bound Benchmark"
            output={CODE_CPU_BOUND_OUTPUT}
            highlightLines={[4, 5]}
            showLineNumbers
          />
          <PythonCodeBlock
            code={CODE_IO_BOUND}
            title="I/O-Bound Benchmark"
            output={CODE_IO_BOUND_OUTPUT}
            highlightLines={[4, 5]}
            showLineNumbers
          />
        </div>
      </ThemeCard>

      {/* 5 — Solutions & Alternatives */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">4</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Solutions &amp; Alternatives</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Python provides multiple ways to achieve concurrency and parallelism despite the GIL.
          Choose the right tool for your workload.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {solutionTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSolutionTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeSolutionTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <PythonCodeBlock
          code={currentSolution.code}
          title={currentSolution.label}
          output={currentSolution.output}
          highlightLines={currentSolution.highlightLines}
          showLineNumbers
        />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              title: 'multiprocessing',
              desc: 'True parallelism. Each process has its own GIL.',
              when: 'CPU-bound',
              color: 'blue',
            },
            {
              title: 'asyncio',
              desc: 'Single-thread event loop. No GIL switching overhead.',
              when: 'High-concurrency I/O',
              color: 'green',
            },
            {
              title: 'concurrent.futures',
              desc: 'High-level API for both thread & process pools.',
              when: 'Either workload',
              color: 'purple',
            },
            {
              title: 'C Extensions',
              desc: 'NumPy, Cython, etc. release GIL for heavy math.',
              when: 'Numeric / array ops',
              color: 'orange',
            },
          ].map((item) => (
            <div
              key={item.title}
              className={`bg-${item.color}-50 border border-${item.color}-200 rounded-lg p-3`}
            >
              <h5 className={`font-semibold text-${item.color}-900 text-sm mb-1`}>{item.title}</h5>
              <p className={`text-${item.color}-800 text-xs mb-2`}>{item.desc}</p>
              <span
                className={`inline-block text-xs bg-${item.color}-100 text-${item.color}-700 px-2 py-0.5 rounded-full`}
              >
                Best for: {item.when}
              </span>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* 6 — PEP 703 / Free-Threaded Python */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">5</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            The Future: Free-Threaded Python (PEP 703)
          </h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Python 3.13 (released Oct 2024) ships an <strong>experimental</strong> free-threaded
            build that removes the GIL entirely. Threads can now execute Python bytecode truly in
            parallel on multiple cores.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">Key facts about PEP 703</h4>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>
                  Install via <code className="bg-purple-100 px-1 rounded">python3.13t</code> (the
                  &ldquo;t&rdquo; suffix)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>
                  Reference counting replaced with biased reference counting + deferred RC
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Per-object locks replace the single GIL for thread safety</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>
                  C extensions need updates — check with{' '}
                  <code className="bg-purple-100 px-1 rounded">sys._is_gil_enabled()</code>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>
                  Expected to become the default in Python 3.16+ after a transition period
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <PythonCodeBlock
            code={CODE_PEP703}
            title="Free-Threaded Python 3.13+"
            highlightLines={[6, 7]}
            showLineNumbers
          />
        </div>
      </ThemeCard>

      {/* 7 — Decision Flowchart */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">6</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Decision Guide</h2>
        </div>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="space-y-4">
            {[
              {
                q: 'Is your workload CPU-bound or I/O-bound?',
                answers: [
                  {
                    label: 'CPU-bound',
                    arrow: 'Use multiprocessing or ProcessPoolExecutor',
                    color: 'blue',
                  },
                  { label: 'I/O-bound', arrow: 'Continue below ↓', color: 'green' },
                ],
              },
              {
                q: 'How many concurrent connections do you need?',
                answers: [
                  { label: '< 100', arrow: 'Use threading or ThreadPoolExecutor', color: 'yellow' },
                  { label: '100+', arrow: 'Use asyncio with aiohttp / httpx', color: 'purple' },
                ],
              },
              {
                q: 'Do you need both CPU and I/O parallelism?',
                answers: [
                  { label: 'Yes', arrow: 'Combine ProcessPool + asyncio', color: 'orange' },
                  { label: 'Can wait', arrow: 'Try free-threaded Python 3.13t', color: 'indigo' },
                ],
              },
            ].map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white">
                <p className="font-semibold text-gray-900 mb-3">
                  Step {i + 1}: {item.q}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.answers.map((a) => (
                    <div
                      key={a.label}
                      className={`bg-${a.color}-50 border border-${a.color}-200 rounded-lg p-3`}
                    >
                      <span className={`font-medium text-${a.color}-900 text-sm`}>{a.label}</span>
                      <p className={`text-${a.color}-700 text-xs mt-1`}>→ {a.arrow}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ThemeCard>

      {/* CTA */}
      <CTASection
        title="Master Python Concurrency"
        description="Now that you understand the GIL, explore multiprocessing, asyncio, and the new free-threaded mode to write truly parallel Python."
        buttonText="Explore Advanced Concurrency →"
        onButtonClick={() => {
          window.location.href = '/python?section=AdvancedConcepts';
        }}
        colorScheme="blue"
      />
    </>
  );

  // ---------------------------------------------------------------------------
  // Sidebar
  // ---------------------------------------------------------------------------
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">GIL at a Glance</h3>
        <div className="space-y-3 text-sm">
          {[
            { label: 'What', value: 'Per-interpreter mutex' },
            { label: 'Why', value: 'Reference counting safety' },
            { label: 'Impact', value: 'One thread executes bytecode' },
            { label: 'Switch', value: 'Every 5ms (Python 3.2+)' },
            { label: 'I/O', value: 'GIL released automatically' },
            { label: 'Future', value: 'PEP 703 removes it' },
          ].map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className="font-medium text-gray-900">{item.label}</span>
              <span className="text-gray-600 text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">When GIL is Released</h3>
        <div className="space-y-2">
          {[
            { icon: '✅', text: 'File I/O (read / write)', released: true },
            { icon: '✅', text: 'Network I/O (HTTP, DB)', released: true },
            { icon: '✅', text: 'time.sleep()', released: true },
            { icon: '✅', text: 'NumPy array operations', released: true },
            { icon: '✅', text: 'Compression (zlib, bz2)', released: true },
            { icon: '❌', text: 'Pure Python loops', released: false },
            { icon: '❌', text: 'List / dict operations', released: false },
            { icon: '❌', text: 'Math calculations', released: false },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded ${
                item.released ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Cheat Sheet</h3>
        <div className="space-y-3 text-xs">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="font-semibold text-blue-900 mb-1">CPU-bound</p>
            <code className="text-blue-700">multiprocessing.Pool()</code>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <p className="font-semibold text-green-900 mb-1">I/O-bound (few)</p>
            <code className="text-green-700">ThreadPoolExecutor()</code>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <p className="font-semibold text-purple-900 mb-1">I/O-bound (many)</p>
            <code className="text-purple-700">asyncio.gather()</code>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
            <p className="font-semibold text-orange-900 mb-1">No-GIL (3.13+)</p>
            <code className="text-orange-700">python3.13t script.py</code>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Common Misconceptions</h3>
        <div className="space-y-3 text-xs text-gray-700">
          <div>
            <p className="font-medium text-red-700 mb-1">
              &ldquo;Python can&rsquo;t do concurrency&rdquo;
            </p>
            <p>
              Wrong. asyncio and threading work great for I/O. multiprocessing provides true
              parallelism for CPU work.
            </p>
          </div>
          <div>
            <p className="font-medium text-red-700 mb-1">
              &ldquo;The GIL makes threading useless&rdquo;
            </p>
            <p>Only for CPU-bound work. I/O-bound threads overlap waiting time effectively.</p>
          </div>
          <div>
            <p className="font-medium text-red-700 mb-1">
              &ldquo;The GIL makes code thread-safe&rdquo;
            </p>
            <p>
              It protects interpreter internals, not your data. You still need locks for shared
              mutable state.
            </p>
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

export default GlobalInterpreterLock;
