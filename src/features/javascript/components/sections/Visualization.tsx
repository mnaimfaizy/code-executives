import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Layers,
  RefreshCw,
} from 'lucide-react';
import Engine2D from '../visualizations/2d/Engine2D';
import EventLoop2D from '../visualizations/2d/EventLoop2D';
import CallStack2D, { type StackFrame } from '../visualizations/2d/CallStack2D';
import MemoryHeap2D, { type HeapObject } from '../visualizations/2d/MemoryHeap2D';
import MemoryManagement2D from '../visualizations/2d/MemoryManagement2D';
import MemoryLeaks2D from '../visualizations/2d/MemoryLeaks2D';

// ─── Visualization catalogue ───────────────────────────────────────────────────
const vizCatalogue = [
  {
    id: 'engine',
    title: 'V8 Engine Pipeline',
    description:
      "Step through V8's compilation pipeline: parsing, Ignition bytecode, TurboFan JIT optimization, and memory architecture.",
    icon: <Cpu className="w-6 h-6" />,
    color: 'indigo',
    demos: [
      'V8 Architecture',
      'Parsing & AST',
      'Ignition Bytecode',
      'TurboFan JIT',
      'Memory Layout',
    ],
  },
  {
    id: 'eventloop',
    title: 'Event Loop',
    description:
      'Visualize how the Event Loop moves callbacks between the Call Stack, Microtask Queue, and Macrotask Queue.',
    icon: <RefreshCw className="w-6 h-6" />,
    color: 'blue',
    demos: ['Sync Execution', 'Promise Queued', 'Microtasks Draining', 'Macrotask Running', 'Idle'],
  },
  {
    id: 'callstack',
    title: 'Call Stack',
    description:
      'Watch the Call Stack grow and shrink as functions are called and return, including recursive call scenarios.',
    icon: <Layers className="w-6 h-6" />,
    color: 'violet',
    demos: [
      'main()',
      '+ greet()',
      '+ console.log()',
      'log returns',
      'greet returns',
      'Stack empty',
    ],
  },
  {
    id: 'heap',
    title: 'Memory Heap',
    description:
      'Observe how objects are allocated in the heap, how references keep them alive, and what happens after GC.',
    icon: <BarChart2 className="w-6 h-6" />,
    color: 'cyan',
    demos: [
      'Empty heap',
      'Allocate objects',
      'Add more objects',
      'Mark unreachable',
      'After GC sweep',
    ],
  },
  {
    id: 'gc',
    title: 'Garbage Collection',
    description:
      "See V8's Orinoco GC in action: allocation, young-gen scavenge, promotion, mark, sweep, and compaction.",
    icon: <Activity className="w-6 h-6" />,
    color: 'emerald',
    demos: ['Allocation', 'Young Gen GC', 'Promotion', 'Mark Phase', 'Sweep Phase', 'Compaction'],
  },
  {
    id: 'leaks',
    title: 'Memory Leaks',
    description:
      'Explore the five most common memory leak patterns with animated visualizations of growing heap pressure.',
    icon: <AlertTriangle className="w-6 h-6" />,
    color: 'rose',
    demos: [
      'Event Listener Leak',
      'Circular Reference',
      'Global Variable',
      'Detached DOM Node',
      'Timer Leak',
    ],
  },
];

const colorMap: Record<
  string,
  { bg: string; border: string; text: string; badge: string; btn: string; activeBorder: string }
> = {
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-700',
    btn: 'bg-indigo-600 hover:bg-indigo-700',
    activeBorder: 'border-indigo-500 ring-2 ring-indigo-300',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    btn: 'bg-blue-600 hover:bg-blue-700',
    activeBorder: 'border-blue-500 ring-2 ring-blue-300',
  },
  violet: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
    btn: 'bg-violet-600 hover:bg-violet-700',
    activeBorder: 'border-violet-500 ring-2 ring-violet-300',
  },
  cyan: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    badge: 'bg-cyan-100 text-cyan-700',
    btn: 'bg-cyan-600 hover:bg-cyan-700',
    activeBorder: 'border-cyan-500 ring-2 ring-cyan-300',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-300',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    btn: 'bg-rose-600 hover:bg-rose-700',
    activeBorder: 'border-rose-500 ring-2 ring-rose-300',
  },
};

// ─── Event Loop preset states ─────────────────────────────────────────────────
const eventLoopStates = [
  {
    callStack: ['main()', 'console.log("sync")'],
    microtasks: [],
    macrotasks: ['setTimeout cb'],
    activeBlock: 'stack' as const,
    activeLight: 'green' as const,
  },
  {
    callStack: ['main()'],
    microtasks: ['promise.then()', 'promise.then() #2'],
    macrotasks: ['setTimeout cb'],
    activeBlock: 'micro' as const,
    activeLight: 'yellow' as const,
  },
  {
    callStack: ['main()', 'promise.then()'],
    microtasks: ['promise.then() #2'],
    macrotasks: ['setTimeout cb'],
    activeBlock: 'micro' as const,
    activeLight: 'green' as const,
  },
  {
    callStack: ['setTimeout cb'],
    microtasks: [],
    macrotasks: [],
    activeBlock: 'macro' as const,
    activeLight: 'green' as const,
  },
  {
    callStack: [],
    microtasks: [],
    macrotasks: [],
    activeBlock: 'eventloop' as const,
    activeLight: 'red' as const,
  },
];

// ─── Call Stack preset frames ─────────────────────────────────────────────────
const callStackStates: StackFrame[][] = [
  [{ id: '1', label: 'main()' }],
  [
    { id: '1', label: 'main()' },
    { id: '2', label: 'greet("Alice")' },
  ],
  [
    { id: '1', label: 'main()' },
    { id: '2', label: 'greet("Alice")' },
    { id: '3', label: 'console.log(...)' },
  ],
  [
    { id: '1', label: 'main()' },
    { id: '2', label: 'greet("Alice")' },
  ],
  [{ id: '1', label: 'main()' }],
  [],
];

// ─── Memory Heap preset objects ────────────────────────────────────────────────
const heapStates: HeapObject[][] = [
  [],
  [
    { id: 'u1', label: 'user: {}' },
    { id: 'a1', label: 'arr: []' },
  ],
  [
    { id: 'u1', label: 'user: {}' },
    { id: 'a1', label: 'arr: [1,2,3]' },
    { id: 'f1', label: 'fn: greet' },
    { id: 'o1', label: 'opts: {}' },
  ],
  [
    { id: 'u1', label: 'user: {}' },
    { id: 'a1', label: 'arr: [1,2,3]' },
    { id: 'f1', label: 'fn: greet' },
    { id: 'o1', label: 'opts: {}' },
  ],
  [
    { id: 'u1', label: 'user: {}' },
    { id: 'a1', label: 'arr: [1,2,3]' },
  ],
];

const Visualization: React.FC = () => {
  const [activeViz, setActiveViz] = useState(0);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const viz = vizCatalogue[activeViz];
  const c = colorMap[viz.color];
  const maxSteps = viz.demos.length;

  const handleSelectViz = (i: number) => {
    setActiveViz(i);
    setStep(0);
    setIsAnimating(false);
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));
  const next = () => setStep((s) => Math.min(maxSteps - 1, s + 1));

  // ── Render the active visualization ───────────────────────────────────────
  const renderViz = () => {
    switch (viz.id) {
      case 'engine':
        return <Engine2D activeDemo={step} onAnimationStateChange={setIsAnimating} />;
      case 'eventloop': {
        const state = eventLoopStates[Math.min(step, eventLoopStates.length - 1)];
        return (
          <EventLoop2D
            callStack={state.callStack}
            microtasks={state.microtasks}
            macrotasks={state.macrotasks}
            activeBlock={state.activeBlock}
            activeLight={state.activeLight}
          />
        );
      }
      case 'callstack':
        return <CallStack2D frames={callStackStates[Math.min(step, callStackStates.length - 1)]} />;
      case 'heap':
        return <MemoryHeap2D objects={heapStates[Math.min(step, heapStates.length - 1)]} />;
      case 'gc':
        return <MemoryManagement2D activeStep={step} onAnimationStateChange={setIsAnimating} />;
      case 'leaks':
        return <MemoryLeaks2D activeExample={step} onAnimationStateChange={setIsAnimating} />;
      default:
        return null;
    }
  };

  return (
    <section className="mb-8">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-br from-indigo-50 via-blue-50 to-violet-50 rounded-2xl p-8 mb-8 border border-indigo-200 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            JavaScript Visualization Gallery
          </h1>
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            Interactive 2D visualizations for every major JavaScript runtime concept. Select a topic
            and step through the animation to see exactly what happens inside the engine.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {vizCatalogue.map(({ id, title, icon, color }) => {
              const cc = colorMap[color];
              return (
                <span
                  key={id}
                  className={`inline-flex items-center gap-2 ${cc.badge} px-4 py-2 rounded-full text-sm font-semibold`}
                >
                  {icon} {title}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Viz selector grid ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Choose a Visualization</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {vizCatalogue.map(({ id, title, icon, color, description }, i) => {
            const cc = colorMap[color];
            const isActive = activeViz === i;
            return (
              <button
                key={id}
                onClick={() => handleSelectViz(i)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                  isActive
                    ? `${cc.bg} ${cc.activeBorder}`
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
                title={description}
              >
                <span className={`${isActive ? cc.text : 'text-gray-500'}`}>{icon}</span>
                <span
                  className={`text-xs font-semibold leading-tight ${isActive ? cc.text : 'text-gray-700'}`}
                >
                  {title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active visualization panel ─────────────────────────────────────── */}
      <div className={`bg-white rounded-xl shadow-lg border-2 ${c.border} overflow-hidden mb-8`}>
        {/* Panel header */}
        <div
          className={`${c.bg} border-b ${c.border} px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4`}
        >
          <div className="flex items-center gap-3 flex-1">
            <span className={`${c.text}`}>{viz.icon}</span>
            <div>
              <h3 className={`font-bold text-gray-900 text-lg`}>{viz.title}</h3>
              <p className="text-sm text-gray-600">{viz.description}</p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 shrink-0">
            {viz.demos.map((demo, i) => (
              <button
                key={demo}
                onClick={() => setStep(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  step === i
                    ? c.btn.split(' ')[0].replace('bg-', 'bg-')
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={demo}
              />
            ))}
          </div>
        </div>

        {/* Visualization canvas */}
        <div className="p-4 bg-white min-h-64">{renderViz()}</div>

        {/* Controls bar */}
        <div
          className={`${c.bg} border-t ${c.border} px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              disabled={step === 0 || isAnimating}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={next}
              disabled={step === maxSteps - 1 || isAnimating}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${c.btn}`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setStep(0);
                setIsAnimating(false);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
              title="Reset to first step"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Step label */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${c.badge} px-2.5 py-1 rounded-full`}>
              Step {step + 1} / {maxSteps}
            </span>
            <span className={`font-semibold ${c.text} text-sm`}>{viz.demos[step]}</span>
          </div>
        </div>
      </div>

      {/* ── All demos quick-reference grid ────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Visualization Reference</h2>
        <p className="text-gray-600 mb-6">
          A summary of each visualization topic, the concepts it covers, and what to look for.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              id: 'engine',
              color: 'indigo',
              icon: <Cpu className="w-5 h-5" />,
              title: 'V8 Engine Pipeline',
              concepts: [
                'Source → AST → Bytecode → Machine code',
                'Ignition interprets bytecode',
                'TurboFan speculatively JITs hot code',
                'Memory heap layout (Young / Old gen)',
              ],
              tip: 'Watch steps 2-3 to understand why consistent types matter for TurboFan.',
            },
            {
              id: 'eventloop',
              color: 'blue',
              icon: <RefreshCw className="w-5 h-5" />,
              title: 'Event Loop',
              concepts: [
                'Call Stack executes synchronous code',
                'Microtask queue drains fully before macrotask',
                'One macrotask per loop tick',
                'Traffic light = current loop phase',
              ],
              tip: "Notice all microtasks run before the setTimeout callback — this is why Promises resolve 'sooner'.",
            },
            {
              id: 'callstack',
              color: 'violet',
              icon: <Layers className="w-5 h-5" />,
              title: 'Call Stack',
              concepts: [
                'LIFO (last-in, first-out) stack structure',
                'Each function call pushes a frame',
                'Returning pops the frame',
                'Empty stack = all sync code done',
              ],
              tip: 'A stack overflow error means too many frames stacked (usually infinite recursion).',
            },
            {
              id: 'heap',
              color: 'cyan',
              icon: <BarChart2 className="w-5 h-5" />,
              title: 'Memory Heap',
              concepts: [
                'Objects allocated dynamically at runtime',
                'References keep objects reachable',
                'Unreachable objects are GC candidates',
                'GC sweep frees unreferenced memory',
              ],
              tip: 'Watch step 4 — objects with no references are removed, freeing heap space.',
            },
            {
              id: 'gc',
              color: 'emerald',
              icon: <Activity className="w-5 h-5" />,
              title: 'Garbage Collection',
              concepts: [
                'Young gen Scavenger is fast and frequent',
                'Objects surviving 2+ GCs are promoted',
                'Mark phase traverses live object graph',
                'Sweep phase reclaims unmarked memory',
                'Compaction reduces heap fragmentation',
              ],
              tip: 'Most objects die young — the Scavenger handles them cheaply without scanning the whole heap.',
            },
            {
              id: 'leaks',
              color: 'rose',
              icon: <AlertTriangle className="w-5 h-5" />,
              title: 'Memory Leaks',
              concepts: [
                'Event listeners prevent GC of attached objects',
                'Circular references block collection',
                'Accidental globals are never freed',
                'Detached DOM nodes stay in memory',
                'Uncleared timers keep callbacks alive',
              ],
              tip: 'Always call removeEventListener and clearInterval/clearTimeout in cleanup code.',
            },
          ].map((item) => {
            const cc = colorMap[item.color];
            return (
              <div
                key={item.id}
                className={`${cc.bg} ${cc.border} border rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => handleSelectViz(vizCatalogue.findIndex((v) => v.id === item.id))}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`w-9 h-9 ${cc.badge} rounded-lg flex items-center justify-center shrink-0`}
                  >
                    {item.icon}
                  </span>
                  <h3 className={`font-semibold ${cc.text} text-base`}>{item.title}</h3>
                </div>
                <ul className="space-y-1 mb-3">
                  {item.concepts.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-xs text-gray-700">
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cc.badge.split(' ')[0]}`}
                      />
                      {c}
                    </li>
                  ))}
                </ul>
                <p className={`text-xs font-medium ${cc.text} italic`}>{item.tip}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Visualization;
