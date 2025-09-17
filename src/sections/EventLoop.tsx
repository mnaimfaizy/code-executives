import React, { useState } from 'react';
import EventLoop2D from '../components/models2d/EventLoop2D';
import ModeTabs from '../components/shared/ModeTabs';

const initialStack = ['main()', 'console.log()'];
const initialMicrotasks = ['Promise.then()', 'async/await'];
const initialMacrotasks = ['setTimeout()', 'DOM Event'];

interface SimulationState {
  phase: 'executing' | 'microtasks' | 'macrotask' | 'idle';
  nextTask?: string;
  nextSource?: 'micro' | 'macro';
}

const EventLoop: React.FC = () => {
  const [mode, setMode] = useState<'2D' | '3D'>('2D');
  const [callStack, setCallStack] = useState<string[]>(initialStack);
  const [microtasks, setMicrotasks] = useState<string[]>(initialMicrotasks);
  const [macrotasks, setMacrotasks] = useState<string[]>(initialMacrotasks);
  const [step, setStep] = useState<number>(0);
  const [simulationState, setSimulationState] = useState<SimulationState>({ phase: 'executing' });
  const [animating, setAnimating] = useState<
    | {
        type: 'pop' | 'push' | 'source';
        label?: string;
        source?: 'micro' | 'macro';
      }
    | undefined
  >();

  // Proper Event Loop simulation logic
  const nextStep = () => {
    setStep((prev) => prev + 1);

    // Clear previous animation
    setAnimating(undefined);

    setTimeout(() => {
      if (callStack.length > 0) {
        // Phase 1: Execute synchronous code (pop from call stack)
        const poppedTask = callStack[callStack.length - 1];
        setAnimating({ type: 'pop', label: poppedTask });
        setSimulationState({ phase: 'executing' });

        setTimeout(() => {
          setCallStack((stack) => stack.slice(0, -1));
          setAnimating(undefined);
        }, 500);
      } else if (microtasks.length > 0) {
        // Phase 2: Process ALL microtasks when call stack is empty
        const nextMicrotask = microtasks[0];
        setAnimating({ type: 'source', label: nextMicrotask, source: 'micro' });
        setSimulationState({
          phase: 'microtasks',
          nextTask: nextMicrotask,
          nextSource: 'micro',
        });

        setTimeout(() => {
          setCallStack((stack) => [...stack, nextMicrotask]);
          setMicrotasks((q) => q.slice(1));
          setAnimating({ type: 'push', label: nextMicrotask });

          setTimeout(() => {
            setAnimating(undefined);
          }, 300);
        }, 500);
      } else if (macrotasks.length > 0) {
        // Phase 3: Process ONE macrotask after all microtasks are done
        const nextMacrotask = macrotasks[0];
        setAnimating({ type: 'source', label: nextMacrotask, source: 'macro' });
        setSimulationState({
          phase: 'macrotask',
          nextTask: nextMacrotask,
          nextSource: 'macro',
        });

        setTimeout(() => {
          setCallStack((stack) => [...stack, nextMacrotask]);
          setMacrotasks((q) => q.slice(1));
          setAnimating({ type: 'push', label: nextMacrotask });

          setTimeout(() => {
            setAnimating(undefined);
          }, 300);
        }, 500);
      } else {
        // Phase 4: Idle state - nothing to process
        setSimulationState({ phase: 'idle' });
      }
    }, 100);
  };

  return (
    <section className="mb-4">
      <h2 className="text-base font-semibold">Event Loop & Concurrency Model</h2>

      {/* Runtime Context Introduction */}
      <div className="mb-4 rounded-lg bg-yellow-50 p-3">
        <h3 className="mb-2 text-sm font-semibold text-yellow-900">Role in JavaScript Runtime</h3>
        <p className="mb-2 text-xs text-yellow-800">
          The Event Loop is the heart of JavaScript's concurrency model in the Runtime. It
          coordinates between the Engine (Call Stack, Heap) and Runtime-specific APIs (Web APIs,
          Node.js APIs) to manage asynchronous operations without blocking the main thread.
        </p>
        <p className="text-xs text-yellow-700">
          <strong>Runtime Integration:</strong> Call Stack ↔ Event Loop ↔ Web APIs ↔ Task Queues
          → Non-blocking Execution
        </p>
      </div>

      {/* Theory Section */}
      <div className="mb-3">
        <h3 className="mb-2 text-sm font-semibold">Concurrency Model</h3>
        <p className="mb-2 text-sm text-gray-700">
          The Event Loop enables JavaScript's "run-to-completion" concurrency model. Each task runs
          completely before the next task starts, eliminating race conditions while providing
          asynchronous capabilities.
        </p>
        <div className="mb-2 grid grid-cols-1 gap-2 text-xs text-gray-600 md:grid-cols-2">
          <div>
            <strong>Loop Phases:</strong>
            <ul className="ml-3 list-disc">
              <li>
                <strong>Execute:</strong> Run all synchronous code on Call Stack
              </li>
              <li>
                <strong>Microtasks:</strong> Process ALL pending microtasks
              </li>
              <li>
                <strong>Macrotask:</strong> Process ONE macrotask
              </li>
              <li>
                <strong>Repeat:</strong> Continue the cycle
              </li>
            </ul>
          </div>
          <div>
            <strong>Task Priorities:</strong>
            <ul className="ml-3 list-disc">
              <li>
                <strong>Synchronous:</strong> Immediate execution
              </li>
              <li>
                <strong>Microtasks:</strong> Promise.then(), queueMicrotask()
              </li>
              <li>
                <strong>Macrotasks:</strong> setTimeout(), DOM events
              </li>
              <li>
                <strong>Idle:</strong> Background tasks
              </li>
            </ul>
          </div>
        </div>
      </div>
      <ModeTabs mode={mode} onChange={setMode} />
      {mode === '2D' ? (
        <div className="mt-2">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full">
            <div className="flex-1 min-w-0 w-full">
              <div className="rounded-md border border-gray-300 bg-white shadow-sm">
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
              {/* Legend for queues and stack */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span
                  className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold"
                  style={{ backgroundColor: '#818cf8', color: '#fff' }}
                >
                  Call Stack
                </span>
                <span
                  className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold"
                  style={{ backgroundColor: '#a5b4fc', color: '#312e81' }}
                >
                  Microtask Queue
                </span>
                <span
                  className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold"
                  style={{ backgroundColor: '#fde68a', color: '#92400e' }}
                >
                  Macrotask Queue
                </span>
              </div>
            </div>
            <div className="w-full lg:w-80 bg-white bg-opacity-95 rounded-xl shadow-lg p-5 text-sm text-indigo-900 font-medium leading-relaxed">
              <div className="font-bold text-lg mb-3 text-indigo-800">Event Loop Explained</div>
              <div className="space-y-2 mb-4">
                <p>
                  The Event Loop manages JavaScript's asynchronous tasks, providing the illusion of
                  concurrency in a single-threaded environment.
                </p>

                <div className="space-y-1">
                  <div>
                    <span className="font-semibold text-indigo-700">Call Stack:</span> Executes
                    synchronous code (LIFO)
                  </div>
                  <div>
                    <span className="font-semibold text-blue-700">Microtask Queue:</span>{' '}
                    High-priority async tasks (Promises, async/await)
                  </div>
                  <div>
                    <span className="font-semibold text-amber-700">Macrotask Queue:</span>{' '}
                    Lower-priority async tasks (setTimeout, DOM events)
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-700">Event Loop:</span> Transfers
                    tasks from queues to Call Stack when stack is empty
                  </div>
                </div>

                <div className="mt-3">
                  <div className="font-semibold mb-1">Execution Order:</div>
                  <ol className="text-xs space-y-1 list-decimal list-inside">
                    <li>Run all synchronous code in Call Stack</li>
                    <li>When stack is empty, process ALL microtasks</li>
                    <li>Then process ONE macrotask</li>
                    <li>Repeat the cycle</li>
                  </ol>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-700">
                  <div className="font-bold">Step {step}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span>Phase:</span>
                    <span
                      className={`font-semibold ${
                        simulationState.phase === 'executing'
                          ? 'text-red-600'
                          : simulationState.phase === 'microtasks'
                            ? 'text-amber-600'
                            : simulationState.phase === 'macrotask'
                              ? 'text-green-600'
                              : 'text-gray-500'
                      }`}
                    >
                      {simulationState.phase === 'executing'
                        ? 'Executing Call Stack'
                        : simulationState.phase === 'microtasks'
                          ? 'Processing Microtasks'
                          : simulationState.phase === 'macrotask'
                            ? 'Processing Macrotask'
                            : 'Idle'}
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
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                    }`}
                  >
                    {simulationState.phase === 'idle' ? 'Finished' : 'Next Step'}
                  </button>
                  <button
                    onClick={() => {
                      setCallStack(initialStack);
                      setMicrotasks(initialMicrotasks);
                      setMacrotasks(initialMacrotasks);
                      setStep(0);
                      setSimulationState({ phase: 'executing' });
                      setAnimating(undefined);
                    }}
                    className="px-4 py-2 rounded-lg font-semibold text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-800 cursor-pointer transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-2 rounded-lg bg-gray-100 p-3">
          <h3 className="mb-2 text-lg font-semibold">3D Visualization: Event Loop (Coming Soon)</h3>
          <div className="text-gray-600">3D visualization is under development.</div>
        </div>
      )}
    </section>
  );
};

export default EventLoop;
