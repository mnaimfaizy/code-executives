import React, { useEffect, useRef, useState } from 'react';
import {
  Layers,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  Lightbulb,
  GitMerge,
  LayoutList,
  Cpu,
} from 'lucide-react';
import TwoDLayout from '../../../../components/TwoDLayout';
import CallStack2D, { type CallStack2DHandle } from '../visualizations/2d/CallStack2D';
import {
  instrumentCode,
  colorForLabel,
  resetLabelColors,
  getLabelColorMap,
  setLabelColorMap,
  type FunctionInfo,
} from '../../../../utils/instrument';
import { type Speed } from '../../../../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../../../../components/shared/OutputPanel';
import InstrumentedSource, { type Segment } from '../../../../components/shared/InstrumentedSource';
import Editor from '../../../../components/shared/Editor';
import useRunner from '../../../../hooks/useRunner';

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

  return (
    <section className="mb-4">
      {/* Hero Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Layers className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            Call Stack & Execution Context
          </h2>
          <p className="text-xs text-gray-500">
            LIFO execution orchestrator · scope management · stack frames
          </p>
        </div>
      </div>

      {/* Engine Context Introduction */}
      <div className="mb-4 rounded-xl bg-indigo-50 border border-indigo-100 p-4">
        <h3 className="mb-2 text-sm font-semibold text-indigo-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          Role in JavaScript Engine
        </h3>
        <p className="mb-3 text-xs text-indigo-800 leading-relaxed">
          The Call Stack is the engine's execution orchestrator, managing function calls through a
          precise LIFO (Last-In, First-Out) system. It creates, maintains, and destroys execution
          contexts while tracking the program's execution flow and managing scope chains.
        </p>
        <div className="flex flex-wrap items-center gap-1 text-xs text-indigo-700 font-medium">
          <strong className="text-indigo-800">Engine Integration:</strong>
          {[
            'Parser',
            'AST',
            'Bytecode',
            'Call Stack Execution',
            'Memory Heap',
            'Garbage Collection',
          ].map((step, i, arr) => (
            <React.Fragment key={step}>
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{step}</span>
              {i < arr.length - 1 && <span className="text-indigo-400">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Theory Section */}
      <div className="mb-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-gray-900 flex items-center gap-2">
          <LayoutList className="w-4 h-4 text-gray-600" />
          Call Stack Management
        </h3>
        <p className="mb-3 text-sm text-gray-700 leading-relaxed">
          The Call Stack operates as a structured memory region where each function call creates a
          new stack frame. These frames contain execution contexts with variable environments, scope
          chains, and <code className="bg-gray-100 px-1 rounded text-xs">this</code> bindings,
          enabling proper function isolation and execution flow control.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <GitMerge className="w-3.5 h-3.5 text-indigo-500" />
              Stack Frame Components
            </p>
            <ul className="text-xs text-gray-700 space-y-1.5">
              {[
                'Function parameters & arguments',
                'Local variables & declarations',
                'Return address & caller info',
                'Execution context & scope chain',
                "'this' binding & closure references",
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="mt-0.5 w-3.5 h-3.5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              Stack Operations
            </p>
            <ul className="text-xs text-gray-700 space-y-1.5">
              {[
                {
                  op: 'Push',
                  desc: 'Function invocation',
                  icon: <ArrowDown className="w-3 h-3 text-green-600" />,
                },
                {
                  op: 'Pop',
                  desc: 'Function return/completion',
                  icon: <ArrowUp className="w-3 h-3 text-blue-600" />,
                },
                {
                  op: 'Unwind',
                  desc: 'Exception propagation',
                  icon: <AlertTriangle className="w-3 h-3 text-yellow-600" />,
                },
                {
                  op: 'Overflow',
                  desc: 'Stack size limit exceeded',
                  icon: <AlertTriangle className="w-3 h-3 text-red-600" />,
                },
                {
                  op: 'Trace',
                  desc: 'Error stack generation',
                  icon: <Layers className="w-3 h-3 text-gray-500" />,
                },
              ].map(({ op, desc, icon }) => (
                <li key={op} className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">{icon}</span>
                  <span>
                    <strong>{op}:</strong> {desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Key Insight:</strong> The Call Stack's LIFO nature ensures that function calls
            complete in reverse order of invocation, maintaining proper scope resolution and
            enabling features like recursion and nested function calls.
          </p>
        </div>
      </div>

      <div className="mt-2">
        <TwoDLayout
          title="2D Visualization: Call Stack"
          editor={editor}
          output={outputPanel}
          canvas={canvas2D}
        />
      </div>
    </section>
  );
};

export default CallStack;
