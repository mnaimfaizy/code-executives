import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import TwoDLayout from '../components/TwoDLayout';
import CallStack2D, { type CallStack2DHandle } from '../components/models2d/CallStack2D';
import ThreeCanvas, { type ThreeCanvasHandle } from '../three/react/ThreeCanvas';
import { CallStackAssemblyLine } from '../three/models/CallStackAssemblyLine';
import { RestaurantKitchen } from '../three/models/RestaurantKitchen';
import { RobotActor } from '../three/models/RobotActor';
import ThreeDLayout from '../components/ThreeDLayout';
import CallStackControlPanel from '../components/shared/CallStackControlPanel';
import {
  instrumentCode,
  colorForLabel,
  resetLabelColors,
  getLabelColorMap,
  setLabelColorMap,
  type FunctionInfo,
} from '../utils/instrument';
import ModeTabs from '../components/shared/ModeTabs';
import { type Speed } from '../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../components/shared/OutputPanel';
import InstrumentedSource, { type Segment } from '../components/shared/InstrumentedSource';
import Editor from '../components/shared/Editor';
import useRunner from '../hooks/useRunner';

type Instruction = { type: 'push' | 'pop'; label?: string };
// Using shared OutputLine (kind is a loose string)
type Compiled = { program: Instruction[]; functions: FunctionInfo[] };

function parseProgram(src: string): Instruction[] {
  const lines = src
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean);
  const program: Instruction[] = [];
  for (const line of lines) {
    const [cmd, ...rest] = line.split(/\s+/);
    if (cmd === 'push') {
      const label = rest.join(' ') || 'fn';
      program.push({ type: 'push', label });
    } else if (cmd === 'pop') {
      program.push({ type: 'pop' });
    }
  }
  return program;
}

function getErrMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const maybe = (e as { message?: unknown }).message;
    return typeof maybe === 'string' ? maybe : String(maybe);
  }
  return String(e);
}

const DEFAULT_DSL = `push main
push foo
push bar
pop
push baz
pop
pop`;

const DEFAULT_JS = `// Write JavaScript. We'll instrument function bodies to emit push/pop events.
function main() {
  foo();
  bar();
}

function foo() {
  baz();
}

function bar() {
  // work
}

function baz() {
  // work
}

main();`;

const CallStack: React.FC = () => {
  const [mode, setMode] = useState<'2D' | '3D'>('2D');

  // 2D state
  const stackRef = useRef<CallStack2DHandle | null>(null);
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('js');
  const [source, setSource] = useState<string>(DEFAULT_JS);
  const [output, setOutput] = useState<OutputLine[]>([{ text: 'Ready.', kind: 'info' }]);
  const [ip, setIp] = useState<number>(0);
  const [speed, setSpeed] = useState<Speed>('very-slow');
  const [running, setRunning] = useState<boolean>(false);
  const runnerRef = useRef<number | null>(null);
  const compiledRef = useRef<Compiled | null>(null);
  const lastSrcRef = useRef<string>('');
  const [stackLabels, setStackLabels] = useState<string[]>([]);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const log = (msg: string, opts?: { label?: string; kind?: OutputLine['kind'] }) =>
    setOutput((o) => [...o, { text: msg, label: opts?.label, kind: opts?.kind }]);
  const reset = () => {
    if (runnerRef.current) {
      clearInterval(runnerRef.current);
      runnerRef.current = null;
    }
    setRunning(false);
    stackRef.current?.reset();
    setIp(0);
    setOutput([{ text: 'Reset.', kind: 'info' }]);
    compiledRef.current = null;
    resetLabelColors();
    setStackLabels([]);
  };
  const ensureCompiled = (): Compiled => {
    if (compiledRef.current && lastSrcRef.current === source) return compiledRef.current;
    try {
      if (inputMode === 'dsl') {
        const program = parseProgram(source);
        compiledRef.current = { program, functions: [] };
        lastSrcRef.current = source;
        // do not log here to keep output clean for stepping
        return compiledRef.current;
      }
      // JS mode: instrument and run once to collect events without mutating the UI
      const instrumented = instrumentCode(source);
      // Capture console output while collecting events
      const origLog = console.log;
      const toStr = (a: unknown) => {
        if (typeof a === 'string') return a;
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      };
      console.log = (...args: unknown[]) => {
        const line = args.map((a) => toStr(a)).join(' ');
        log(line, { kind: 'log' });
        // forward to original console for debug
        try {
          (origLog as unknown as (...data: unknown[]) => void)(...args);
        } catch {
          // ignore forwarding errors
        }
      };
      const getErrMsg = (e: unknown): string => {
        if (e instanceof Error) return e.message;
        if (typeof e === 'object' && e !== null && 'message' in e) {
          const maybe = (e as { message?: unknown }).message;
          return typeof maybe === 'string' ? maybe : String(maybe);
        }
        return String(e);
      };
      try {
        instrumented.run({ __push: () => {}, __pop: () => {} });
      } catch (err: unknown) {
        log(`Error: ${getErrMsg(err)}`, { kind: 'error' });
      } finally {
        console.log = origLog;
      }
      const program: Instruction[] = instrumented.events.map((e) => ({
        type: e.type,
        label: e.label,
      }));
      compiledRef.current = { program, functions: instrumented.functions };
      lastSrcRef.current = source;
      return compiledRef.current;
    } catch (e: unknown) {
      log(`Compile error: ${getErrMsg(e)}`, { kind: 'error' });
      compiledRef.current = { program: [], functions: [] };
      lastSrcRef.current = source;
      return compiledRef.current;
    }
  };
  const {
    toggleRun,
    step: runnerStep,
    setSpeed: setRunnerSpeed,
  } = useRunner<Instruction>({
    getProgram: () => ensureCompiled().program,
    apply: (ins) => {
      if (ins.type === 'push') {
        const lbl = ins.label || 'fn';
        stackRef.current?.push(lbl);
        log(`push(${lbl})`, { label: lbl, kind: 'push' });
        setStackLabels((s) => [...s, lbl]);
      } else {
        stackRef.current?.pop();
        const lbl = ins.label ?? stackLabels[stackLabels.length - 1];
        log(`pop(${lbl ?? ''})`.trim(), { label: lbl, kind: 'pop' });
        setStackLabels((s) => s.slice(0, -1));
      }
    },
    getIntervalMs: (s) => (s === 'very-slow' ? 1600 : s === 'slow' ? 1000 : 450),
    onComplete: () => log('Program complete.', { kind: 'info' }),
  });

  useEffect(() => {
    setRunnerSpeed(speed);
  }, [speed, setRunnerSpeed]);

  const step = () => {
    runnerStep();
    setIp((n) => n + 1);
  };
  // interval handled by useRunner

  const run = () => {
    toggleRun();
  };

  // Cleanup runner on unmount or when switching away from 2D mode
  useEffect(() => {
    const id = runnerRef.current;
    return () => {
      if (id) clearInterval(id);
    };
  }, []);
  // Load persisted colors once
  useEffect(() => {
    try {
      const raw = localStorage.getItem('labelColors');
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        setLabelColorMap(parsed);
      }
    } catch {
      // ignore persistence errors
    }
  }, []);
  // Persist colors occasionally: when IP resets to 0 (after reset/clear) and when stepping/running advances
  useEffect(() => {
    try {
      const map = getLabelColorMap();
      localStorage.setItem('labelColors', JSON.stringify(map));
    } catch {
      // ignore persistence errors
    }
  }, [ip, running]);
  useEffect(() => {
    // When leaving 2D mode, just stop toggling run via toolbar. No extra action needed here.
  }, [mode]);

  // highlighting is built inline when rendering InstrumentedSource

  const showHighlighted = running || ip > 0;

  const editor = (
    <Editor
      title="Editor"
      selectId="input-mode-select"
      inputMode={inputMode}
      onInputModeChange={(mode) => {
        setInputMode(mode);
        setSource(mode === 'js' ? DEFAULT_JS : DEFAULT_DSL);
        compiledRef.current = null;
        setIp(0);
        stackRef.current?.reset();
        setOutput([{ text: 'Mode changed.', kind: 'info' }]);
        resetLabelColors();
      }}
      source={source}
      onSourceChange={(val) => setSource(val)}
      placeholderJs="Write JavaScript. Define and call functions; function bodies will be instrumented."
      placeholderDsl="Type instructions: push <label> | pop"
      showHighlighted={showHighlighted && inputMode === 'js'}
      renderHighlighted={() => (
        <InstrumentedSource
          segments={(() => {
            const compiled = compiledRef.current;
            const functions = compiled?.functions ?? [];
            if (!functions.length) return [] as Segment[];
            const segments: Segment[] = [];
            const sortedFns = [...functions].sort((a, b) => a.bodyStart - b.bodyStart);
            let cursor = 0;
            const src = source;
            const active = stackLabels[stackLabels.length - 1];
            for (const fn of sortedFns) {
              if (fn.bodyStart > cursor) {
                segments.push({ text: src.slice(cursor, fn.bodyStart) });
              }
              const bodyText = src.slice(fn.bodyStart, fn.bodyEnd);
              segments.push({
                text: bodyText,
                color: colorForLabel(fn.label),
                emphasize: active === fn.label,
              });
              cursor = fn.bodyEnd;
            }
            if (cursor < src.length) segments.push({ text: src.slice(cursor) });
            return segments;
          })()}
        />
      )}
      running={running}
      speed={speed}
      onRunToggle={run}
      onStep={step}
      onReset={reset}
      onSpeedChange={(s) => setSpeed(s)}
      onLoadExample={() => {
        const sample = inputMode === 'js' ? DEFAULT_JS : DEFAULT_DSL;
        setSource(sample);
        compiledRef.current = null;
        setIp(0);
        setStackLabels([]);
        stackRef.current?.reset();
        setOutput([{ text: 'Loaded example.', kind: 'info' }]);
        resetLabelColors();
      }}
      onClear={() => setSource('')}
      extraButtons={
        <>
          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            onClick={() => {
              compiledRef.current = null;
              setIp(0);
              setStackLabels([]);
              stackRef.current?.reset();
              setOutput([{ text: 'Compiled program cleared.', kind: 'info' }]);
              resetLabelColors();
            }}
          >
            Clear Compiled
          </button>
          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            onClick={() => setShowLegend((v) => !v)}
          >
            {showLegend ? 'Hide Legend' : 'Show Legend'}
          </button>
        </>
      }
    />
  );
  const outputPanel = (
    <OutputPanel
      lines={output}
      colorForLabel={(l?: string) => (l ? colorForLabel(l) : undefined)}
    />
  );
  const canvas2D = (
    <div className="flex h-full flex-col gap-2">
      {showLegend && (
        <div className="flex flex-wrap gap-2">
          {(compiledRef.current?.functions ?? [])
            .map((f) => f.label)
            .filter((v, i, a) => a.indexOf(v) === i)
            .slice(0, 12)
            .map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold"
                style={{ backgroundColor: colorForLabel(label), color: '#0b1020' }}
              >
                <span className="h-2 w-2 rounded bg-black/20" />
                {label}
              </span>
            ))}
        </div>
      )}
      <div className="rounded-md border border-gray-300">
        <CallStack2D ref={stackRef} colorFor={colorForLabel} />
      </div>
    </div>
  );

  // 3D state
  const kitchenModel = useMemo(() => new RestaurantKitchen(), []);
  const assemblyModel = useMemo(() => new CallStackAssemblyLine(), []);
  const robot = useMemo(() => new RobotActor(), []);
  const ref3D = useRef<ThreeCanvasHandle | null>(null);
  const [outputLines3D, setOutputLines3D] = useState<OutputLine[]>([
    { text: 'Kitchen ready!', kind: 'info' },
  ]);
  const [running3D, setRunning3D] = useState<boolean>(false);
  const [speed3D, setSpeed3D] = useState<Speed>('very-slow');
  const [currentModel, setCurrentModel] = useState<'kitchen' | 'assembly'>('kitchen');

  const activeModel = currentModel === 'kitchen' ? kitchenModel : assemblyModel;

  const log3D = (msg: string, opts?: { label?: string; kind?: OutputLine['kind'] }) =>
    setOutputLines3D((o) => [...o, { text: msg, label: opts?.label, kind: opts?.kind }]);

  const reset3D = () => {
    setRunning3D(false);
    activeModel.reset?.();
    setOutputLines3D([{ text: 'Kitchen reset!', kind: 'info' }]);
  };

  const step3D = () => {
    // Simulate a function call and return cycle
    const functions = ['main', 'processOrder', 'cookPasta', 'serveDish', 'calculateTotal'];
    const randomFunc = functions[Math.floor(Math.random() * functions.length)];

    if (Math.random() > 0.5 && activeModel.getStackHeight?.() > 0) {
      // Pop (complete order)
      activeModel.popFrame();
      log3D(`Order completed: ${randomFunc}()`, { label: randomFunc, kind: 'pop' });
    } else {
      // Push (new order)
      activeModel.pushFrame(randomFunc);
      log3D(`New order: ${randomFunc}()`, { label: randomFunc, kind: 'push' });
    }
  };

  const runDemo3D = () => {
    if (running3D) return;
    setRunning3D(true);
    log3D('Starting kitchen demo...', { kind: 'info' });

    // Simulate a function call sequence
    const demoSequence = [
      { action: 'push', name: 'main' },
      { action: 'push', name: 'processOrder' },
      { action: 'push', name: 'cookPasta' },
      { action: 'pop', name: 'cookPasta' },
      { action: 'push', name: 'serveDish' },
      { action: 'pop', name: 'serveDish' },
      { action: 'pop', name: 'processOrder' },
      { action: 'pop', name: 'main' },
    ];

    let stepIndex = 0;
    const interval = setInterval(
      () => {
        if (stepIndex >= demoSequence.length) {
          clearInterval(interval);
          setRunning3D(false);
          log3D('Kitchen demo complete!', { kind: 'info' });
          return;
        }

        const step = demoSequence[stepIndex];
        if (step.action === 'push') {
          activeModel.pushFrame(step.name);
          log3D(`New order: ${step.name}()`, { label: step.name, kind: 'push' });
        } else {
          activeModel.popFrame();
          log3D(`Order completed: ${step.name}()`, { label: step.name, kind: 'pop' });
        }

        stepIndex++;
      },
      speed3D === 'very-slow' ? 1600 : speed3D === 'slow' ? 1000 : 450
    );
  };

  const focusCamera3D = () => {
    if (currentModel === 'kitchen') {
      ref3D.current
        ?.getEngine()
        ?.focusCamera(new THREE.Vector3(4, 3, 5), new THREE.Vector3(0, 0.5, 0));
    } else {
      ref3D.current
        ?.getEngine()
        ?.focusCamera(new THREE.Vector3(6.5, 5.5, 10), new THREE.Vector3(0, 0, 0));
    }
  };

  return (
    <section className="mb-4">
      <h2 className="text-base font-semibold">Call Stack & Execution Context</h2>

      {/* Engine Context Introduction */}
      <div className="mb-4 rounded-lg bg-indigo-50 p-3">
        <h3 className="mb-2 text-sm font-semibold text-indigo-900">Role in JavaScript Engine</h3>
        <p className="mb-2 text-xs text-indigo-800">
          The Call Stack is the engine's execution orchestrator, managing function calls through a
          precise LIFO (Last-In, First-Out) system. It creates, maintains, and destroys execution
          contexts while tracking the program's execution flow and managing scope chains.
        </p>
        <p className="text-xs text-indigo-700">
          <strong>Engine Integration:</strong> Parser → AST → Bytecode → Call Stack Execution →
          Memory Heap → Garbage Collection
        </p>
      </div>

      {/* Theory Section */}
      <div className="mb-3">
        <h3 className="mb-2 text-sm font-semibold">Call Stack Management</h3>
        <p className="mb-2 text-sm text-gray-700">
          The Call Stack operates as a structured memory region where each function call creates a
          new stack frame. These frames contain execution contexts with variable environments, scope
          chains, and 'this' bindings, enabling proper function isolation and execution flow
          control.
        </p>
        <div className="mb-2 grid grid-cols-1 gap-2 text-xs text-gray-600 md:grid-cols-2">
          <div>
            <strong>Stack Frame Components:</strong>
            <ul className="ml-3 list-disc">
              <li>Function parameters & arguments</li>
              <li>Local variables & declarations</li>
              <li>Return address & caller info</li>
              <li>Execution context & scope chain</li>
              <li>'this' binding & closure references</li>
            </ul>
          </div>
          <div>
            <strong>Stack Operations:</strong>
            <ul className="ml-3 list-disc">
              <li>
                <strong>Push:</strong> Function invocation
              </li>
              <li>
                <strong>Pop:</strong> Function return/completion
              </li>
              <li>
                <strong>Unwind:</strong> Exception propagation
              </li>
              <li>
                <strong>Overflow:</strong> Stack size limit exceeded
              </li>
              <li>
                <strong>Trace:</strong> Error stack generation
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-xs text-yellow-800">
            <strong>💡 Key Insight:</strong> The Call Stack's LIFO nature ensures that function
            calls complete in reverse order of invocation, maintaining proper scope resolution and
            enabling features like recursion and nested function calls.
          </p>
        </div>
      </div>

      <ModeTabs mode={mode} onChange={setMode} />

      {mode === '2D' ? (
        <div className="mt-2">
          <TwoDLayout
            title="2D Visualization: Call Stack"
            editor={editor}
            output={outputPanel}
            canvas={canvas2D}
          />
        </div>
      ) : (
        <div className="mt-2">
          <ThreeDLayout
            title="3D Visualization: Restaurant Kitchen Call Stack"
            canvas={
              <ThreeCanvas
                ref={ref3D}
                models={currentModel === 'kitchen' ? [kitchenModel] : [assemblyModel, robot]}
              />
            }
            controlPanel={
              <CallStackControlPanel
                running={running3D}
                speed={speed3D}
                onRunToggle={runDemo3D}
                onStep={step3D}
                onReset={reset3D}
                onSpeedChange={setSpeed3D}
                onFocusCamera={focusCamera3D}
                outputLines={outputLines3D}
                colorForLabel={(label?: string) => (label ? colorForLabel(label) : undefined)}
                currentModel={currentModel}
                onModelSwitch={() =>
                  setCurrentModel(currentModel === 'kitchen' ? 'assembly' : 'kitchen')
                }
              />
            }
            scenarioDescription={
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-orange-900 mb-2">
                    🍽️ The Restaurant Kitchen & Order Management
                  </h4>
                  <p className="text-sm text-orange-800 mb-3">
                    Welcome to our bustling restaurant kitchen! Watch as order tickets stack up at
                    the order station, demonstrating how JavaScript manages function calls through
                    the Call Stack. Each new order (function call) goes to the top of the stack, and
                    orders are completed in LIFO order (Last In, First Out).
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <h5 className="font-semibold text-orange-900 mb-2">
                        🏪 The Kitchen Metaphor
                      </h5>
                      <ul className="space-y-1 text-orange-700">
                        <li>
                          <strong>Kitchen:</strong> JavaScript Call Stack
                        </li>
                        <li>
                          <strong>Order Station:</strong> Stack memory region
                        </li>
                        <li>
                          <strong>Order Tickets:</strong> Function calls (stack frames)
                        </li>
                        <li>
                          <strong>Order Spike:</strong> Stack pointer
                        </li>
                        <li>
                          <strong>Kitchen Staff:</strong> JavaScript engine
                        </li>
                        <li>
                          <strong>Completed Orders:</strong> Returned functions
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-semibold text-orange-900 mb-2">🎬 Kitchen Operations</h5>
                      <ul className="space-y-1 text-orange-700">
                        <li>
                          <strong>New Order:</strong> Function call (push to stack)
                        </li>
                        <li>
                          <strong>Order Processing:</strong> Function execution
                        </li>
                        <li>
                          <strong>Order Complete:</strong> Function return (pop from stack)
                        </li>
                        <li>
                          <strong>Rush Hour:</strong> Deep call chains
                        </li>
                        <li>
                          <strong>Kitchen Reset:</strong> Stack cleared
                        </li>
                        <li>
                          <strong>Order Colors:</strong> Different function types
                        </li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-sm text-orange-700 mt-3">
                    <strong>💡 Try it:</strong> Use the controls on the right to add new orders
                    (function calls) and complete them. Notice how orders are processed in LIFO
                    order - the last order received is the first one completed! You can also switch
                    between Kitchen and Assembly Line views using the control panel.
                  </p>
                </div>
              </div>
            }
          />
        </div>
      )}
    </section>
  );
};

export default CallStack;
