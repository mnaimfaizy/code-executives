import React, { useEffect, useRef, useState } from 'react';
import TwoDLayout from '../components/TwoDLayout';
import MemoryHeap2D, { type MemoryHeap2DHandle } from '../components/models2d/MemoryHeap2D';
import {
  instrumentCode,
  colorForLabel,
  resetLabelColors,
  type FunctionInfo,
} from '../utils/instrument';
import ModeTabs from '../components/shared/ModeTabs';
import { type Speed } from '../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../components/shared/OutputPanel';
import InstrumentedSource, { type Segment } from '../components/shared/InstrumentedSource';
import Editor from '../components/shared/Editor';
import useRunner from '../hooks/useRunner';

type Instruction =
  | { type: 'alloc'; label: string; size?: number; caller?: string }
  | { type: 'free'; label?: string; caller?: string };

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
    if (cmd === 'alloc') {
      const label = rest[0] || 'obj';
      const size = rest[1] ? Number(rest[1]) : undefined;
      program.push({ type: 'alloc', label, size });
    } else if (cmd === 'free') {
      const label = rest[0];
      program.push({ type: 'free', label });
    }
  }
  return program;
}

const DEFAULT_DSL = `// Simple heap DSL
// alloc <label> [size]
// free [label]
alloc user 3
alloc settings 2
alloc list 5
free settings
alloc cache 4`;

const DEFAULT_JS = `// Write JavaScript. Use alloc(label, size?) and free(label?) to emit heap events.
function createUser(name) {
  // Allocate a user object
  alloc('user', 3);
  return { name };
}

function loadSettings() {
  alloc('settings', 2);
}

function main() {
  console.log('Starting heap demo');
  const u = createUser('Ada');
  loadSettings();
  free('settings');
  alloc('cache', 4);
}

main();`;

const MemoryHeap: React.FC = () => {
  const [mode, setMode] = useState<'2D' | '3D'>('2D');
  const heapRef = useRef<MemoryHeap2DHandle | null>(null);
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('js');
  const [source, setSource] = useState<string>(DEFAULT_JS);
  const [output, setOutput] = useState<OutputLine[]>([{ text: 'Ready.', kind: 'info' }]);
  const [ip, setIp] = useState<number>(0);
  const [speed, setSpeed] = useState<Speed>('very-slow');
  const [running] = useState<boolean>(false); // kept for minimal UI logic compatibility if needed
  const runnerRef = useRef<number | null>(null);
  const compiledRef = useRef<Compiled | null>(null);
  const lastSrcRef = useRef<string>('');

  const log = (msg: string, opts?: { label?: string; kind?: OutputLine['kind'] }) =>
    setOutput((o) => [...o, { text: msg, label: opts?.label, kind: opts?.kind }]);

  // interval timing now handled by useRunner

  const {
    toggleRun,
    step: runnerStep,
    reset: runnerReset,
    setSpeed: setRunnerSpeed,
  } = useRunner<Instruction>({
    getProgram: () => ensureCompiled().program,
    apply: (ins) => {
      if (ins.type === 'alloc') {
        heapRef.current?.alloc(ins.label, ins.size);
        log(`alloc(${ins.label}${ins.size != null ? `, ${ins.size}` : ''})`, {
          label: ins.label,
          kind: 'alloc',
        });
      } else {
        const target = ins.label ?? heapRef.current?.getObjects().slice(-1)[0]?.id ?? '';
        heapRef.current?.free(target);
        log(`free(${ins.label ?? ''})`.trim(), { label: ins.label, kind: 'free' });
      }
    },
    getIntervalMs: (s) => (s === 'very-slow' ? 1600 : s === 'slow' ? 1000 : 450),
    onComplete: () => log('Program complete.', { kind: 'info' }),
  });

  // Bridge local state for compatibility
  useEffect(() => {
    setRunnerSpeed(speed);
  }, [speed, setRunnerSpeed]);

  const reset = () => {
    runnerReset();
    heapRef.current?.reset();
    setOutput([{ text: 'Reset.', kind: 'info' }]);
    compiledRef.current = null;
    resetLabelColors();
  };

  const ensureCompiled = (): Compiled => {
    if (compiledRef.current && lastSrcRef.current === source) return compiledRef.current;
    try {
      if (inputMode === 'dsl') {
        const program = parseProgram(source);
        compiledRef.current = { program, functions: [] };
        lastSrcRef.current = source;
        return compiledRef.current;
      }
      // JavaScript mode: instrument, execute once to collect events
      const instrumented = instrumentCode(source);
      const events: Instruction[] = [];
      const callStack: string[] = [];
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
        try {
          (origLog as unknown as (...data: unknown[]) => void)(...args);
        } catch {
          // ignore forwarding errors
        }
      };
      try {
        const fn = new Function(
          '__push',
          '__pop',
          'alloc',
          'free',
          `'use strict';\n${instrumented.transpiled}`
        ) as (
          __push: (l: string) => void,
          __pop: (l: string) => void,
          alloc: (l: string, s?: number) => void,
          free: (l?: string) => void
        ) => unknown;
        const __push = (l: string) => {
          callStack.push(l);
        };
        const __pop = (l: string) => {
          if (callStack.length && callStack[callStack.length - 1] === l) callStack.pop();
          else callStack.pop();
        };
        const alloc = (label: string, size?: number) => {
          const caller = callStack[callStack.length - 1];
          events.push({ type: 'alloc', label, size, caller });
        };
        const free = (label?: string) => {
          const caller = callStack[callStack.length - 1];
          events.push({ type: 'free', label, caller });
        };
        fn(__push, __pop, alloc, free);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`Error: ${msg}`, { kind: 'error' });
      } finally {
        console.log = origLog;
      }
      compiledRef.current = { program: events, functions: instrumented.functions };
      lastSrcRef.current = source;
      return compiledRef.current;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      log(`Compile error: ${msg}`, { kind: 'error' });
      compiledRef.current = { program: [], functions: [] };
      lastSrcRef.current = source;
      return compiledRef.current;
    }
  };

  const step = () => {
    runnerStep();
    setIp((n) => n + 1);
  };

  const run = () => {
    toggleRun();
  };

  // Cleanup on unmount
  useEffect(() => {
    const id = runnerRef.current;
    return () => {
      if (id) clearInterval(id);
    };
  }, []);

  const buildSegments = (): Segment[] => {
    const compiled = compiledRef.current;
    const functions = compiled?.functions ?? [];
    if (!functions.length) return [];
    const segments: Segment[] = [];
    const sortedFns = [...functions].sort((a, b) => a.bodyStart - b.bodyStart);
    let cursor = 0;
    const src = source;
    const program = compiled?.program ?? [];
    const activeCaller = program[Math.min(ip, Math.max(0, program.length - 1))]?.caller;
    for (const fn of sortedFns) {
      if (fn.bodyStart > cursor) segments.push({ text: src.slice(cursor, fn.bodyStart) });
      const bodyText = src.slice(fn.bodyStart, fn.bodyEnd);
      segments.push({
        text: bodyText,
        color: colorForLabel(fn.label),
        emphasize: activeCaller === fn.label,
      });
      cursor = fn.bodyEnd;
    }
    if (cursor < src.length) segments.push({ text: src.slice(cursor) });
    return segments;
  };

  const showHighlighted = inputMode === 'js' && (running || ip > 0);

  const editor = (
    <Editor
      title="Editor"
      selectId="heap-input-mode-select"
      inputMode={inputMode}
      onInputModeChange={(mode) => {
        setInputMode(mode);
        setSource(mode === 'js' ? DEFAULT_JS : DEFAULT_DSL);
        compiledRef.current = null;
        lastSrcRef.current = '';
        setIp(0);
        heapRef.current?.reset();
        setOutput([{ text: 'Mode changed.', kind: 'info' }]);
        resetLabelColors();
      }}
      source={source}
      onSourceChange={(val) => {
        setSource(val);
        compiledRef.current = null;
        lastSrcRef.current = '';
        setIp(0);
        heapRef.current?.reset();
        setOutput([{ text: 'Program updated.', kind: 'info' }]);
        resetLabelColors();
      }}
      placeholderJs="Write JavaScript. Use alloc(label, size?) and free(label?) to emit heap events."
      placeholderDsl="Type instructions: alloc <label> [size] | free [label]"
      showHighlighted={showHighlighted}
      renderHighlighted={() => <InstrumentedSource segments={buildSegments()} />}
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
        lastSrcRef.current = '';
        setIp(0);
        heapRef.current?.reset();
        setOutput([{ text: 'Loaded example.', kind: 'info' }]);
        resetLabelColors();
      }}
      onClear={() => setSource('')}
    />
  );

  const outputPanel = (
    <OutputPanel
      lines={output}
      colorForLabel={(l?: string) => (l ? colorForLabel(l) : undefined)}
    />
  );

  const canvas2D = (
    <div className="h-full p-2">
      <div className="h-full rounded-md border border-gray-300">
        <MemoryHeap2D ref={heapRef} colorFor={colorForLabel} />
      </div>
    </div>
  );

  return (
    <section className="mb-4">
      <h2 className="text-base font-semibold">Memory Heap</h2>
      <p className="mb-2 text-sm text-gray-700">
        The Memory Heap is an unstructured region of memory where objects, strings, and functions
        are dynamically allocated.
      </p>
      <p className="mb-2 text-xs text-gray-600">
        In JavaScript, garbage collection cleans memory that is no longer reachable from roots.
      </p>

      <ModeTabs mode={mode} onChange={setMode} />

      {mode === '2D' ? (
        <div className="mt-2">
          <TwoDLayout
            title="2D Visualization: Memory Heap"
            editor={editor}
            output={outputPanel}
            canvas={canvas2D}
          />
        </div>
      ) : (
        <div className="mt-2 text-sm text-gray-600">
          3D visualization for Memory Heap is coming soon.
        </div>
      )}
    </section>
  );
};

export default MemoryHeap;
