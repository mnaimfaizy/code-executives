import React, { useState } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import StatsGrid from '../../../../components/shared/StatsGrid';

const MemoryManagement: React.FC = () => {
  const [refCount, setRefCount] = useState<number>(1);
  const [objects, setObjects] = useState<Array<{ id: number; refs: number; color: string }>>([
    { id: 1, refs: 1, color: 'bg-blue-500' },
    { id: 2, refs: 2, color: 'bg-green-500' },
    { id: 3, refs: 0, color: 'bg-red-500' },
  ]);
  const [gcPhase, setGcPhase] = useState<'idle' | 'marking' | 'sweeping' | 'collecting'>('idle');

  // Simulate garbage collection
  const runGarbageCollection = () => {
    setGcPhase('marking');
    setTimeout(() => setGcPhase('sweeping'), 1000);
    setTimeout(() => setGcPhase('collecting'), 2000);
    setTimeout(() => {
      setObjects((prev) => prev.filter((obj) => obj.refs > 0));
      setGcPhase('idle');
    }, 3000);
  };

  // Hero content with title, description, and stats
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
          { value: 'Reference', label: 'Counting GC' },
          { value: 'Automatic', label: 'Memory Management' },
          { value: 'Cyclic', label: 'GC for Cycles' },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  // Interactive reference counting demo
  const referenceCountingDemo = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Reference Counting Demo</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setRefCount(Math.max(0, refCount - 1))}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            - Reference
          </button>
          <button
            onClick={() => setRefCount(refCount + 1)}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            + Reference
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center space-x-4 mb-4">
          <div
            className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl ${
              refCount > 0 ? 'bg-blue-500' : 'bg-red-500'
            }`}
          >
            📦
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Object</h4>
            <p className="text-sm text-gray-600">
              Reference Count: <span className="font-bold">{refCount}</span>
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {Array.from({ length: refCount }, (_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Reference {i + 1}</span>
            </div>
          ))}
        </div>

        {refCount === 0 && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
            <p className="text-red-800 text-sm">
              <strong>Object deallocated!</strong> When reference count reaches zero, the object is
              immediately freed.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Garbage collection visualization
  const garbageCollectionDemo = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Garbage Collection Demo</h3>
        <button
          onClick={runGarbageCollection}
          disabled={gcPhase !== 'idle'}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
        >
          {gcPhase === 'idle' ? '🗑️ Run GC' : `🔄 ${gcPhase}...`}
        </button>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {objects.map((obj) => (
            <div
              key={obj.id}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                obj.refs === 0 && gcPhase === 'collecting'
                  ? 'border-red-500 bg-red-100 opacity-50'
                  : gcPhase === 'marking'
                    ? 'border-yellow-500 bg-yellow-100'
                    : gcPhase === 'sweeping'
                      ? 'border-orange-500 bg-orange-100'
                      : 'border-gray-300 bg-white'
              }`}
            >
              <div className="text-center">
                <div className={`w-8 h-8 rounded mx-auto mb-2 ${obj.color}`}></div>
                <div className="text-xs font-medium">Object {obj.id}</div>
                <div className="text-xs text-gray-600">Refs: {obj.refs}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-gray-600">
          {gcPhase === 'idle' && 'Objects with 0 references will be collected'}
          {gcPhase === 'marking' && '🔍 Marking reachable objects...'}
          {gcPhase === 'sweeping' && '🧹 Sweeping unreachable objects...'}
          {gcPhase === 'collecting' && '♻️ Collecting garbage...'}
        </div>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* Memory Management Overview */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">🧠</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Python's Memory Model</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Python uses automatic memory management, meaning developers don't need to manually
            allocate and deallocate memory. This is handled by a combination of reference counting
            and cyclic garbage collection.
          </p>
          <p>
            Every object in Python has a reference count that tracks how many references point to
            it. When the count reaches zero, the object is immediately deallocated. For cyclic
            references (like objects that reference each other), Python uses a separate garbage
            collector.
          </p>
        </div>
      </ThemeCard>

      {/* Interactive Reference Counting */}
      <ThemeCard>{referenceCountingDemo}</ThemeCard>

      {/* Garbage Collection */}
      <ThemeCard>{garbageCollectionDemo}</ThemeCard>

      {/* Memory Management Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reference Counting */}
        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-blue-500 mr-2">🔢</span>
            Reference Counting
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-semibold text-blue-900 mb-1">How it Works</h4>
              <p>Each object maintains a count of references pointing to it</p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-semibold text-blue-900 mb-1">Immediate Cleanup</h4>
              <p>Objects are deallocated as soon as their reference count reaches zero</p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-semibold text-blue-900 mb-1">Performance</h4>
              <p>Fast deallocation but overhead for every reference operation</p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-semibold text-blue-900 mb-1">Limitations</h4>
              <p>Cannot handle cyclic references (A→B→A)</p>
            </div>
          </div>
        </ThemeCard>

        {/* Cyclic Garbage Collection */}
        <ThemeCard>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-purple-500 mr-2">🔄</span>
            Cyclic GC
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-purple-50 p-3 rounded">
              <h4 className="font-semibold text-purple-900 mb-1">Purpose</h4>
              <p>Handles reference cycles that reference counting cannot detect</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <h4 className="font-semibold text-purple-900 mb-1">Generations</h4>
              <p>Uses three generations (0, 1, 2) based on object age</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <h4 className="font-semibold text-purple-900 mb-1">Mark & Sweep</h4>
              <p>Traverses object graphs to find unreachable cycles</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <h4 className="font-semibold text-purple-900 mb-1">Thresholds</h4>
              <p>Runs when allocation/deallocation thresholds are exceeded</p>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* Memory Allocation Strategies */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Memory Allocation Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">🏗️</div>
            <h4 className="font-semibold text-green-900 mb-1">Arena Allocator</h4>
            <p className="text-xs text-green-800">Large memory blocks for efficiency</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">📦</div>
            <h4 className="font-semibold text-blue-900 mb-1">Pool Allocator</h4>
            <p className="text-xs text-blue-800">Fixed-size object pools</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl mb-2">🔧</div>
            <h4 className="font-semibold text-orange-900 mb-1">Specialized</h4>
            <p className="text-xs text-orange-800">Custom allocators for specific types</p>
          </div>
        </div>
      </ThemeCard>

      {/* Common Memory Issues */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Common Memory Issues & Solutions</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                <span className="text-red-600 mr-2">⚠️</span>
                Memory Leaks
              </h4>
              <p className="text-sm text-red-800 mb-2">
                Objects that are no longer needed but still referenced
              </p>
              <div className="text-xs bg-red-100 p-2 rounded">
                <strong>Solution:</strong> Use weak references, explicit cleanup, avoid circular
                references
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                <span className="text-yellow-600 mr-2">🐌</span>
                GC Pauses
              </h4>
              <p className="text-sm text-yellow-800 mb-2">
                Garbage collection can cause application pauses
              </p>
              <div className="text-xs bg-yellow-100 p-2 rounded">
                <strong>Solution:</strong> Tune GC thresholds, use gc.disable() for
                performance-critical code
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Best Practices</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <h5 className="font-medium mb-1">Use Context Managers</h5>
                <p className="text-blue-800">Ensure proper cleanup with `with` statements</p>
              </div>
              <div>
                <h5 className="font-medium mb-1">Avoid Circular References</h5>
                <p className="text-blue-800">Use weak references when possible</p>
              </div>
              <div>
                <h5 className="font-medium mb-1">Profile Memory Usage</h5>
                <p className="text-blue-800">Use `tracemalloc` and `memory_profiler`</p>
              </div>
              <div>
                <h5 className="font-medium mb-1">Explicit Cleanup</h5>
                <p className="text-blue-800">Call `close()` or `cleanup()` methods</p>
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">Memory Management</h3>
        <div className="text-sm text-gray-600 space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Reference Counting</h4>
            <p>Immediate deallocation when refs = 0</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Cyclic GC</h4>
            <p>Handles reference cycles</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Memory Allocators</h4>
            <p>Efficient memory management</p>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Interactive Demos</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Reference Counting</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Garbage Collection</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Memory Allocation</span>
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
