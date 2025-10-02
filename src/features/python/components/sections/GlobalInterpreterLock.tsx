import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';

const GlobalInterpreterLock: React.FC = () => {
  const [gilLocked, setGilLocked] = useState<boolean>(true);
  const [threads, setThreads] = useState<
    Array<{ id: number; status: 'waiting' | 'running' | 'blocked'; task: string }>
  >([
    { id: 1, status: 'running', task: 'CPU-bound calculation' },
    { id: 2, status: 'waiting', task: 'I/O operation' },
    { id: 3, status: 'waiting', task: 'Network request' },
  ]);

  const toggleGil = () => {
    setGilLocked(!gilLocked);
    if (!gilLocked) {
      // When unlocking, allow one thread to run
      setThreads((prev) =>
        prev.map((thread) =>
          thread.status === 'waiting' ? { ...thread, status: 'running' as const } : thread
        )
      );
    } else {
      // When locking, block all threads except one
      setThreads((prev) =>
        prev.map((thread, index) =>
          index === 0
            ? { ...thread, status: 'running' as const }
            : { ...thread, status: 'waiting' as const }
        )
      );
    }
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Global Interpreter Lock</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Understanding Python's GIL and its impact on concurrency and performance
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: 'CPython', label: 'GIL Implementation' },
          { value: 'Threading', label: 'Concurrency Limitation' },
          { value: 'Multiprocessing', label: 'Alternative Solution' },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  // Interactive GIL demonstration
  const gilDemo = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">GIL Threading Demo</h3>
        <button
          onClick={toggleGil}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            gilLocked
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {gilLocked ? '🔒 GIL Locked' : '🔓 GIL Unlocked'}
        </button>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="mb-4">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              gilLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {gilLocked ? '🔒 GIL Active' : '🔓 GIL Released'}
          </div>
        </div>

        <div className="space-y-3">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                thread.status === 'running'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : thread.status === 'waiting'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-red-500 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      thread.status === 'running'
                        ? 'bg-green-500 animate-pulse'
                        : thread.status === 'waiting'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                  ></div>
                  <div>
                    <div className="font-medium text-gray-900">Thread {thread.id}</div>
                    <div className="text-sm text-gray-600">{thread.task}</div>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    thread.status === 'running'
                      ? 'bg-green-100 text-green-800'
                      : thread.status === 'waiting'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {thread.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800 text-sm">
            <strong>Demo:</strong>{' '}
            {gilLocked
              ? 'With GIL locked, only one thread can execute Python bytecode at a time, even on multi-core systems.'
              : 'When GIL is released (during I/O), other threads can run, but only one can hold the GIL for Python code execution.'}
          </p>
        </div>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* GIL Overview */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">What is the Global Interpreter Lock?</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            The Global Interpreter Lock (GIL) is a mutex that protects access to Python objects,
            preventing multiple native threads from executing Python bytecodes simultaneously in a
            single process. This lock is necessary because CPython's memory management is not
            thread-safe.
          </p>
          <p>
            While the GIL allows for easy development and prevents race conditions in Python code,
            it also means that Python threads cannot take advantage of multiple CPU cores for
            CPU-bound tasks. This has led to the common misconception that Python is not suitable
            for concurrent programming.
          </p>
        </div>
      </ThemeCard>

      {/* Interactive GIL Demo */}
      <ThemeCard>{gilDemo}</ThemeCard>

      {/* Why the GIL Exists */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Why Does the GIL Exist?</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-green-600">Benefits of the GIL</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>
                  <strong>Thread Safety:</strong> Prevents race conditions in Python objects
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>
                  <strong>Simple Development:</strong> No need for complex locking mechanisms
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>
                  <strong>C Extension Safety:</strong> Protects C extensions from threading issues
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>
                  <strong>Reference Counting:</strong> Makes reference counting thread-safe
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-red-600">Costs of the GIL</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>
                  <strong>No Parallel CPU:</strong> Threads can't use multiple cores for CPU work
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>
                  <strong>Context Switching:</strong> Overhead when switching between threads
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>
                  <strong>I/O Blocking:</strong> I/O operations still block other threads
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>
                  <strong>Performance Myth:</strong> Python is often called "slow" because of GIL
                </span>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* GIL Behavior */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">When is the GIL Released?</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                GIL Released During
              </h4>
              <div className="space-y-1 text-sm text-green-800">
                <div>• I/O operations (file, network, database)</div>
                <div>• Time.sleep() calls</div>
                <div>• Some C extension operations</div>
                <div>• Compression/decompression</div>
                <div>• Hashing operations</div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                <span className="text-red-600 mr-2">❌</span>
                GIL Held During
              </h4>
              <div className="space-y-1 text-sm text-red-800">
                <div>• Pure Python code execution</div>
                <div>• CPU-bound computations</div>
                <div>• Most built-in operations</div>
                <div>• List/dict operations</div>
                <div>• Mathematical calculations</div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Alternatives to Threading */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Alternatives to Threading</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">🔀</div>
            <h4 className="font-semibold text-blue-900 mb-1">Multiprocessing</h4>
            <p className="text-xs text-blue-800">Separate processes with true parallelism</p>
            <div className="mt-2 text-xs bg-blue-100 p-2 rounded">
              <code>from multiprocessing import Process</code>
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-semibold text-green-900 mb-1">Asyncio</h4>
            <p className="text-xs text-green-800">Single-threaded concurrency for I/O</p>
            <div className="mt-2 text-xs bg-green-100 p-2 rounded">
              <code>import asyncio</code>
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">🐍</div>
            <h4 className="font-semibold text-purple-900 mb-1">Alternative Interpreters</h4>
            <p className="text-xs text-purple-800">Jython, IronPython, PyPy (no GIL)</p>
            <div className="mt-2 text-xs bg-purple-100 p-2 rounded">
              <code>PyPy, Jython</code>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Best Practices */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">GIL Best Practices</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">For CPU-bound Tasks</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div>
                  • Use <code>multiprocessing</code> instead of <code>threading</code>
                </div>
                <div>
                  • Consider <code>concurrent.futures.ProcessPoolExecutor</code>
                </div>
                <div>• Profile to identify actual bottlenecks</div>
                <div>• Consider Cython or C extensions for performance-critical code</div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">For I/O-bound Tasks</h4>
              <div className="space-y-2 text-sm text-green-800">
                <div>• Threading works well for I/O operations</div>
                <div>
                  • Use <code>asyncio</code> for high-concurrency I/O
                </div>
                <div>
                  • Consider <code>concurrent.futures.ThreadPoolExecutor</code>
                </div>
                <div>• GIL is released during I/O, allowing concurrency</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Performance Tips</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-yellow-800">
              <div>
                <h5 className="font-medium mb-1">Avoid Unnecessary Threading</h5>
                <p>Don't use threads for CPU-bound work - use processes instead</p>
              </div>
              <div>
                <h5 className="font-medium mb-1">Use Thread Pools</h5>
                <p>Reuse threads with ThreadPoolExecutor to avoid creation overhead</p>
              </div>
              <div>
                <h5 className="font-medium mb-1">Profile First</h5>
                <p>Use cProfile to identify if threading/GIL is actually your bottleneck</p>
              </div>
              <div>
                <h5 className="font-medium mb-1">Consider Alternatives</h5>
                <p>Asyncio, multiprocessing, or even different Python implementations</p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Global Interpreter Lock</h3>
        <div className="text-sm text-gray-600 space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">What is GIL?</h4>
            <p>Mutex protecting Python objects</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Threading Impact</h4>
            <p>Limits parallel CPU execution</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Alternatives</h4>
            <p>Multiprocessing, asyncio</p>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">GIL Behavior</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>Blocks multiple threads</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Released during I/O</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Alternatives available</span>
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
