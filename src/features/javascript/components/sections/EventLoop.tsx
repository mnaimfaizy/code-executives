import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Layers,
  Zap,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Activity,
  GitMerge,
  Code2,
  BookOpen,
} from 'lucide-react';
import EventLoop2D from '../visualizations/2d/EventLoop2D';

const initialStack = ['main()', 'console.log()'];
const initialMicrotasks = ['Promise.then()', 'async/await'];
const initialMacrotasks = ['setTimeout()', 'DOM Event'];

interface SimulationState {
  phase: 'executing' | 'microtasks' | 'macrotask' | 'idle';
  nextTask?: string;
  nextSource?: 'micro' | 'macro';
}

// ─── Scenarios for code demonstration ────────────────────────────────────────
const scenarios = [
  {
    id: 'basic',
    title: 'Promise vs setTimeout',
    description: 'Microtasks always run before the next macrotask.',
    code: `console.log('1 – sync start');

setTimeout(() => console.log('4 – macrotask'), 0);

Promise.resolve()
  .then(() => console.log('2 – microtask A'))
  .then(() => console.log('3 – microtask B'));

console.log('end of sync');

// Output order:
// 1 – sync start
// end of sync
// 2 – microtask A
// 3 – microtask B
// 4 – macrotask`,
    output: [
      '1 – sync start',
      'end of sync',
      '2 – microtask A',
      '3 – microtask B',
      '4 – macrotask',
    ],
  },
  {
    id: 'nested',
    title: 'Nested Promises',
    description: 'Each .then() schedules a new microtask — they all drain before any macrotask.',
    code: `Promise.resolve()
  .then(() => {
    console.log('microtask 1');
    return Promise.resolve();
  })
  .then(() => console.log('microtask 2'))
  .then(() => console.log('microtask 3'));

setTimeout(() => console.log('macrotask'), 0);

// Output:
// microtask 1
// microtask 2
// microtask 3
// macrotask`,
    output: ['microtask 1', 'microtask 2', 'microtask 3', 'macrotask'],
  },
  {
    id: 'async-await',
    title: 'async/await Order',
    description: 'await suspends the async function and schedules the rest as a microtask.',
    code: `async function fetchData() {
  console.log('A – fetchData start');
  await Promise.resolve(); // suspends here
  console.log('C – fetchData resume');
}

console.log('1 – before call');
fetchData();
console.log('B – after call (sync)');

// Output:
// 1 – before call
// A – fetchData start
// B – after call (sync)
// C – fetchData resume`,
    output: [
      '1 – before call',
      'A – fetchData start',
      'B – after call (sync)',
      'C – fetchData resume',
    ],
  },
  {
    id: 'queueMicrotask',
    title: 'queueMicrotask',
    description: 'queueMicrotask() is lower priority than Promise.then() within the same tick.',
    code: `queueMicrotask(() => console.log('queueMicrotask'));
Promise.resolve().then(() => console.log('Promise.then'));
setTimeout(() => console.log('setTimeout'), 0);

// Output:
// Promise.then
// queueMicrotask
// setTimeout`,
    output: ['Promise.then', 'queueMicrotask', 'setTimeout'],
  },
];

// ─── Gotchas ────────────────────────────────────────────────────────────────
const gotchas = [
  {
    title: 'Starving the macrotask queue',
    severity: 'high',
    description:
      'If microtasks keep enqueuing more microtasks, macrotasks (and UI rendering) will never run — the page appears frozen.',
    fix: 'Break heavy microtask chains with setTimeout(fn, 0) to yield back to the browser.',
  },
  {
    title: 'setTimeout(fn, 0) is NOT immediate',
    severity: 'medium',
    description:
      'Zero-delay timers still run after ALL pending microtasks of the current tick. They are also subject to a minimum 4 ms clamp in browsers.',
    fix: 'Use Promise.resolve().then(fn) or queueMicrotask(fn) if you need truly immediate async execution.',
  },
  {
    title: 'Forgetting await in async functions',
    severity: 'high',
    description:
      'Without await, an async function returns a Promise immediately and synchronous code continues. The callee logic runs later — this is a common ordering bug.',
    fix: 'Always await async operations, or explicitly handle the returned Promise with .then().',
  },
  {
    title: 'Long synchronous tasks block everything',
    severity: 'high',
    description:
      'JavaScript is single-threaded. A long loop or computation blocks the event loop entirely — no callbacks, no I/O, no rendering during that time.',
    fix: 'Break work into chunks using setTimeout, requestIdleCallback, or move to a Web Worker.',
  },
];

// ─── Loop phase data ─────────────────────────────────────────────────────────
const loopPhases = [
  {
    number: '1',
    label: 'Execute Sync Code',
    color: 'indigo',
    description: 'Run each frame on the Call Stack to completion.',
    icon: <Activity className="w-5 h-5" />,
  },
  {
    number: '2',
    label: 'Drain Microtasks',
    color: 'blue',
    description: 'Process ALL queued microtasks — including any newly enqueued ones.',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    number: '3',
    label: 'One Macrotask',
    color: 'amber',
    description: 'Dequeue and execute exactly ONE macrotask from the macrotask queue.',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    number: '4',
    label: 'Render / Paint',
    color: 'green',
    description: '(Browser only) Run requestAnimationFrame callbacks and repaint if needed.',
    icon: <RefreshCw className="w-5 h-5" />,
  },
  {
    number: '→',
    label: 'Repeat',
    color: 'purple',
    description: 'Go back to step 2 — drain microtasks again before the next macrotask.',
    icon: <GitMerge className="w-5 h-5" />,
  },
];

const colorCls: Record<string, { bg: string; border: string; text: string; num: string }> = {
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    num: 'bg-indigo-600',
  },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', num: 'bg-blue-600' },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    num: 'bg-amber-500',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    num: 'bg-green-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    num: 'bg-purple-600',
  },
};

// ─── Main component ───────────────────────────────────────────────────────────
const EventLoop: React.FC = () => {
  const navigate = useNavigate();
  const [callStack, setCallStack] = useState<string[]>(initialStack);
  const [microtasks, setMicrotasks] = useState<string[]>(initialMicrotasks);
  const [macrotasks, setMacrotasks] = useState<string[]>(initialMacrotasks);
  const [step, setStep] = useState<number>(0);
  const [simulationState, setSimulationState] = useState<SimulationState>({ phase: 'executing' });
  const [animating, setAnimating] = useState<
    { type: 'pop' | 'push' | 'source'; label?: string; source?: 'micro' | 'macro' } | undefined
  >();
  const [activeScenario, setActiveScenario] = useState(0);

  // ── Simulation step logic ─────────────────────────────────────────────────
  const nextStep = () => {
    setStep((prev) => prev + 1);
    setAnimating(undefined);

    setTimeout(() => {
      if (callStack.length > 0) {
        const poppedTask = callStack[callStack.length - 1];
        setAnimating({ type: 'pop', label: poppedTask });
        setSimulationState({ phase: 'executing' });
        setTimeout(() => {
          setCallStack((stack) => stack.slice(0, -1));
          setAnimating(undefined);
        }, 500);
      } else if (microtasks.length > 0) {
        const nextMicrotask = microtasks[0];
        setAnimating({ type: 'source', label: nextMicrotask, source: 'micro' });
        setSimulationState({ phase: 'microtasks', nextTask: nextMicrotask, nextSource: 'micro' });
        setTimeout(() => {
          setCallStack((stack) => [...stack, nextMicrotask]);
          setMicrotasks((q) => q.slice(1));
          setAnimating({ type: 'push', label: nextMicrotask });
          setTimeout(() => setAnimating(undefined), 300);
        }, 500);
      } else if (macrotasks.length > 0) {
        const nextMacrotask = macrotasks[0];
        setAnimating({ type: 'source', label: nextMacrotask, source: 'macro' });
        setSimulationState({ phase: 'macrotask', nextTask: nextMacrotask, nextSource: 'macro' });
        setTimeout(() => {
          setCallStack((stack) => [...stack, nextMacrotask]);
          setMacrotasks((q) => q.slice(1));
          setAnimating({ type: 'push', label: nextMacrotask });
          setTimeout(() => setAnimating(undefined), 300);
        }, 500);
      } else {
        setSimulationState({ phase: 'idle' });
      }
    }, 100);
  };

  const reset = () => {
    setCallStack(initialStack);
    setMicrotasks(initialMicrotasks);
    setMacrotasks(initialMacrotasks);
    setStep(0);
    setSimulationState({ phase: 'executing' });
    setAnimating(undefined);
  };

  const scenario = scenarios[activeScenario];

  return (
    <section className="mb-8">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-2xl p-8 mb-8 border border-yellow-200 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Event Loop &amp; Concurrency Model
          </h1>
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            JavaScript is single-threaded yet handles thousands of concurrent operations. The Event
            Loop is the ingenious mechanism that makes this possible — orchestrating the Call Stack,
            Microtask Queue, and Macrotask Queue into a seamless concurrency model.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              {
                label: 'Call Stack',
                cls: 'bg-indigo-100 text-indigo-800',
                icon: <Layers className="w-4 h-4" />,
              },
              {
                label: 'Microtask Queue',
                cls: 'bg-blue-100 text-blue-800',
                icon: <Zap className="w-4 h-4" />,
              },
              {
                label: 'Macrotask Queue',
                cls: 'bg-amber-100 text-amber-800',
                icon: <Clock className="w-4 h-4" />,
              },
              {
                label: 'Run-to-Completion',
                cls: 'bg-green-100 text-green-800',
                icon: <CheckCircle2 className="w-4 h-4" />,
              },
              {
                label: 'Non-blocking I/O',
                cls: 'bg-purple-100 text-purple-800',
                icon: <Activity className="w-4 h-4" />,
              },
            ].map(({ label, cls, icon }) => (
              <span
                key={label}
                className={`inline-flex items-center gap-2 ${cls} px-4 py-2 rounded-full text-sm font-semibold`}
              >
                {icon} {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Concurrency model overview ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          How JavaScript Achieves Concurrency
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Single Thread, Many Tasks</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              JavaScript has exactly <strong>one call stack</strong> — it can only do one thing at a
              time. Yet modern web apps stream data, handle user events, and run timers, all
              "simultaneously". The Event Loop is the scheduler that makes this illusion real.
            </p>
            <p className="text-gray-700 leading-relaxed">
              When an async operation (fetch, timer, I/O) completes, its callback is placed into a
              queue. The Event Loop continuously checks whether the Call Stack is empty, and if so,
              moves the next callback onto the stack for execution.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Run-to-Completion Guarantee
            </h3>
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
              <p className="text-gray-700 mb-4 leading-relaxed">
                Once a function starts executing, <strong>nothing can interrupt it</strong> until it
                returns. There are no thread preemption or race conditions in JavaScript — each task
                runs completely before the next one begins.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Synchronous', sub: 'Runs immediately', color: 'indigo' },
                  { label: 'Microtasks', sub: 'Before next tick', color: 'blue' },
                  { label: 'Macrotasks', sub: 'One per tick', color: 'amber' },
                  { label: 'Rendering', sub: 'After microtasks', color: 'green' },
                ].map(({ label, sub, color }) => {
                  const c = colorCls[color];
                  return (
                    <div key={label} className={`${c.bg} ${c.border} border rounded-lg p-3`}>
                      <div className={`font-bold ${c.text} text-sm`}>{label}</div>
                      <div className="text-gray-600 text-xs mt-1">{sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Loop phases timeline */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-5">The Loop Phases</h3>
          <div className="flex flex-wrap gap-3">
            {loopPhases.map(({ number, label, color, description, icon }) => {
              const c = colorCls[color];
              return (
                <div
                  key={label}
                  className={`flex-1 min-w-40 ${c.bg} ${c.border} border rounded-xl p-4`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-7 h-7 ${c.num} text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0`}
                    >
                      {number}
                    </span>
                    <span className={`font-semibold ${c.text} text-sm`}>{label}</span>
                  </div>
                  <div
                    className={`${c.num.replace('bg-', 'text-').replace('-600', '-700').replace('-500', '-700')} mb-1`}
                  >
                    {icon}
                  </div>
                  <p className="text-xs text-gray-600">{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Queue types deep-dive ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Queues in Detail</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Call Stack */}
          <div className="border border-indigo-200 rounded-xl p-6 bg-indigo-50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 bg-indigo-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-semibold text-indigo-900">Call Stack</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              A LIFO (Last-In-First-Out) stack of execution contexts. Every function call pushes a
              new frame; returning pops it. When the stack is empty, the Event Loop checks the
              queues.
            </p>
            <div className="bg-white rounded-lg p-3 border border-indigo-200">
              <div className="text-xs font-semibold text-indigo-700 mb-2">
                Stack frames include:
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Local variable bindings</li>
                <li>• Return address</li>
                <li>
                  • <code className="bg-indigo-50 px-1 rounded">this</code> binding
                </li>
                <li>• Arguments object</li>
              </ul>
            </div>
          </div>

          {/* Microtask Queue */}
          <div className="border border-blue-200 rounded-xl p-6 bg-blue-50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-semibold text-blue-900">Microtask Queue</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              High-priority queue drained <strong>completely</strong> after every synchronous task,
              before any macrotask. Newly enqueued microtasks are processed in the same drain pass.
            </p>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="text-xs font-semibold text-blue-700 mb-2">Sources:</div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>
                  • <code className="bg-blue-50 px-1 rounded">Promise.then/catch/finally</code>
                </li>
                <li>
                  • <code className="bg-blue-50 px-1 rounded">await</code> continuations
                </li>
                <li>
                  • <code className="bg-blue-50 px-1 rounded">queueMicrotask()</code>
                </li>
                <li>
                  • <code className="bg-blue-50 px-1 rounded">MutationObserver</code>
                </li>
              </ul>
            </div>
          </div>

          {/* Macrotask Queue */}
          <div className="border border-amber-200 rounded-xl p-6 bg-amber-50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 bg-amber-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-semibold text-amber-900">Macrotask Queue</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Lower-priority queue. Only <strong>one macrotask</strong> is dequeued per event loop
              tick — then microtasks are drained again before the next macrotask is picked up.
            </p>
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <div className="text-xs font-semibold text-amber-700 mb-2">Sources:</div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>
                  • <code className="bg-amber-50 px-1 rounded">setTimeout / setInterval</code>
                </li>
                <li>
                  • <code className="bg-amber-50 px-1 rounded">setImmediate</code> (Node.js)
                </li>
                <li>• DOM event callbacks</li>
                <li>• I/O callbacks (Node.js)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive simulation ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Interactive Simulation</h2>
        <p className="text-gray-600 mb-6">
          Step through the event loop tick-by-tick and watch tasks move between the Call Stack,
          Microtask Queue, and Macrotask Queue.
        </p>
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          <div className="flex-1 min-w-0 w-full">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <EventLoop2D
                callStack={callStack}
                microtasks={microtasks}
                macrotasks={macrotasks}
                animating={animating}
                activeLight={
                  simulationState.phase === 'executing'
                    ? 'red'
                    : simulationState.phase === 'microtasks'
                      ? 'yellow'
                      : simulationState.phase === 'macrotask'
                        ? 'green'
                        : undefined
                }
                activeBlock={
                  simulationState.phase === 'executing'
                    ? 'stack'
                    : simulationState.phase === 'microtasks'
                      ? 'micro'
                      : simulationState.phase === 'macrotask'
                        ? 'macro'
                        : simulationState.phase === 'idle'
                          ? 'eventloop'
                          : undefined
                }
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: 'Call Stack', bg: '#818cf8', color: '#fff' },
                { label: 'Microtask Queue', bg: '#a5b4fc', color: '#312e81' },
                { label: 'Macrotask Queue', bg: '#fde68a', color: '#92400e' },
              ].map(({ label, bg, color }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold"
                  style={{ backgroundColor: bg, color }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div className="w-full lg:w-80 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow border border-indigo-200 p-5 text-sm text-indigo-900 font-medium leading-relaxed">
            <div className="font-bold text-lg mb-3 text-indigo-800">Event Loop Explained</div>
            <div className="space-y-2 mb-4">
              <p className="text-gray-700 text-xs">
                The Event Loop manages JavaScript's async tasks, providing the illusion of
                concurrency in a single-threaded environment.
              </p>
              <div className="space-y-1.5 text-xs">
                {[
                  {
                    label: 'Call Stack',
                    color: 'text-indigo-700',
                    desc: 'Executes synchronous code (LIFO)',
                  },
                  {
                    label: 'Microtask Queue',
                    color: 'text-blue-700',
                    desc: 'High-priority — Promise, async/await',
                  },
                  {
                    label: 'Macrotask Queue',
                    color: 'text-amber-700',
                    desc: 'Lower-priority — setTimeout, DOM events',
                  },
                  {
                    label: 'Event Loop',
                    color: 'text-indigo-700',
                    desc: 'Moves tasks from queues when stack is empty',
                  },
                ].map(({ label, color, desc }) => (
                  <div key={label}>
                    <span className={`font-semibold ${color}`}>{label}:</span>{' '}
                    <span className="text-gray-600">{desc}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="font-semibold mb-1 text-xs">Execution Order:</div>
                <ol className="text-xs space-y-1 list-decimal list-inside text-gray-600">
                  <li>Run all synchronous code on the Call Stack</li>
                  <li>When stack is empty, drain ALL microtasks</li>
                  <li>Process ONE macrotask</li>
                  <li>Repeat the cycle</li>
                </ol>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-indigo-200 mb-3 text-xs text-gray-700">
              <div className="font-bold text-indigo-800">Step {step}</div>
              <div className="flex items-center gap-2 mt-1">
                <span>Phase:</span>
                <span
                  className={`font-semibold ${
                    simulationState.phase === 'executing'
                      ? 'text-red-600'
                      : simulationState.phase === 'microtasks'
                        ? 'text-blue-600'
                        : simulationState.phase === 'macrotask'
                          ? 'text-amber-600'
                          : 'text-gray-500'
                  }`}
                >
                  {simulationState.phase === 'executing'
                    ? 'Executing Call Stack'
                    : simulationState.phase === 'microtasks'
                      ? 'Draining Microtasks'
                      : simulationState.phase === 'macrotask'
                        ? 'Processing Macrotask'
                        : 'Idle — loop complete'}
                </span>
              </div>
              {simulationState.nextTask && (
                <div className="mt-1 text-indigo-700">
                  <span className="font-medium">Next:</span> {simulationState.nextTask}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={nextStep}
                disabled={simulationState.phase === 'idle'}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  simulationState.phase === 'idle'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                }`}
              >
                {simulationState.phase === 'idle' ? 'Finished' : 'Next Step'}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-800 cursor-pointer transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Code scenarios ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          <Code2 className="inline w-7 h-7 mr-2 text-indigo-600" />
          Execution Order Scenarios
        </h2>
        <p className="text-gray-600 mb-6">
          Choose a scenario to see the exact console output order and understand why.
        </p>

        {/* Tab strip */}
        <div className="flex flex-wrap gap-2 mb-6">
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(i)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeScenario === i
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Code panel */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-gray-800 text-sm">{scenario.title}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
            <pre className="bg-gray-900 text-green-400 rounded-xl p-5 text-xs overflow-x-auto leading-relaxed font-mono">
              {scenario.code}
            </pre>
          </div>

          {/* Output panel */}
          <div>
            <div className="font-semibold text-gray-800 text-sm mb-3">
              Console Output (in order)
            </div>
            <div className="space-y-2">
              {scenario.output.map((line, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
                >
                  <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <code className="text-sm text-gray-800 font-mono">{line}</code>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              <strong>Why this order?</strong>{' '}
              {activeScenario === 0 &&
                'Synchronous code runs first, then all microtasks drain before the macrotask (setTimeout) fires.'}
              {activeScenario === 1 &&
                'Each .then() enqueues a new microtask. All three drain before the setTimeout macrotask.'}
              {activeScenario === 2 &&
                'await suspends execution as a microtask. The caller continues synchronously, then the resumed async function runs.'}
              {activeScenario === 3 &&
                'Promise.then() enqueues before queueMicrotask() in the same synchronous block, so it runs first within the microtask drain.'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Common Gotchas ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          <AlertTriangle className="inline w-7 h-7 mr-2 text-amber-500" />
          Common Gotchas
        </h2>
        <p className="text-gray-600 mb-6">
          These are the event-loop pitfalls that trip up even experienced JavaScript developers.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {gotchas.map((g) => (
            <div
              key={g.title}
              className={`border rounded-xl p-5 ${
                g.severity === 'high' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    g.severity === 'high' ? 'text-red-500' : 'text-amber-500'
                  }`}
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{g.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      g.severity === 'high'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {g.severity === 'high' ? 'High impact' : 'Medium impact'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">{g.description}</p>
              <div className="bg-white border border-green-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Fix:
                </div>
                <p className="text-xs text-gray-700">{g.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Key takeaways ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-8 border border-yellow-200 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Takeaways</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Microtasks before Macrotasks',
              body: 'Every time the call stack empties, ALL pending microtasks drain first. Only after the microtask queue is completely empty does the event loop pick up the next macrotask.',
            },
            {
              title: 'Run-to-Completion',
              body: 'No function can ever be interrupted once it starts. The event loop only advances when the call stack is empty. There are no thread-level race conditions in JavaScript.',
            },
            {
              title: 'Yielding to the Browser',
              body: 'Heavy synchronous work blocks rendering and input. Use setTimeout or requestIdleCallback to yield back to the browser and keep the UI responsive.',
            },
          ].map(({ title, body }) => (
            <div key={title} className="bg-white rounded-lg p-5 shadow-sm border border-yellow-100">
              <h3 className="font-semibold text-amber-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => navigate('/javascript?section=Web%20APIs%20%26%20Platform')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Next: Web APIs &amp; Platform <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate('/javascript?section=Task%20Queues%20%26%20Priority')}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Task Queues &amp; Priority <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate('/javascript?section=JavaScript%20Runtime')}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          ← Back to JavaScript Runtime
        </button>
      </div>
    </section>
  );
};

export default EventLoop;
