import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, RotateCcw, StepForward } from 'lucide-react';
import TwoDLayout from '../components/TwoDLayout';
import MemoryHeap2D, { type MemoryHeap2DHandle } from '../components/models2d/MemoryHeap2D';
import {
  instrumentCode,
  colorForLabel,
  resetLabelColors,
  type FunctionInfo,
} from '../utils/instrument';

type Instruction =
  | { type: 'alloc'; label: string; size?: number; caller?: string }
  | { type: 'free'; label?: string; caller?: string };

type OutputLine = {
  text: string;
  label?: string;
  kind?: 'alloc' | 'free' | 'log' | 'info' | 'error';
};

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
  const [speed, setSpeed] = useState<'very-slow' | 'slow' | 'normal'>('very-slow');
  const [running, setRunning] = useState<boolean>(false);
  const runnerRef = useRef<number | null>(null);
  const compiledRef = useRef<Compiled | null>(null);
  const lastSrcRef = useRef<string>('');

  const log = (msg: string, opts?: { label?: string; kind?: OutputLine['kind'] }) =>
    setOutput((o) => [...o, { text: msg, label: opts?.label, kind: opts?.kind }]);

  const getIntervalMs = () => {
    switch (speed) {
      case 'very-slow':
        return 1600;
      case 'slow':
        return 1000;
      case 'normal':
      default:
        return 450;
    }
  };

  const stopRunner = () => {
    if (runnerRef.current) {
      clearInterval(runnerRef.current);
      runnerRef.current = null;
    }
    setRunning(false);
  };

  const reset = () => {
    stopRunner();
    heapRef.current?.reset();
    setIp(0);
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
    if (running) return;
    const { program } = ensureCompiled();
    if (ip >= program.length) {
      log('Program complete.', { kind: 'info' });
      return;
    }
    const ins = program[ip];
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
    setIp((n) => n + 1);
  };

  const run = () => {
    if (running) {
      stopRunner();
      return;
    }
    const { program } = ensureCompiled();
    if (ip >= program.length) {
      log('Program already complete. Reset to run again.', { kind: 'info' });
      return;
    }
    let i = ip;
    setRunning(true);
    runnerRef.current = window.setInterval(() => {
      if (i >= program.length) {
        stopRunner();
        log('Program complete.', { kind: 'info' });
        return;
      }
      const ins = program[i++];
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
      setIp(i);
    }, getIntervalMs());
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (runnerRef.current) clearInterval(runnerRef.current);
    };
  }, []);

  const renderHighlighted = () => {
    const compiled = compiledRef.current;
    const functions = compiled?.functions ?? [];
    if (!functions.length) return null;
    const segments: Array<{ text: string; color?: string; emphasize?: boolean }> = [];
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
    return (
      <div className="min-h-0 flex-1 overflow-auto whitespace-pre rounded-md border border-dashed border-gray-300 bg-white p-2 font-mono text-sm">
        {segments.map((seg, idx) =>
          seg.color ? (
            <span
              key={idx}
              style={{
                backgroundColor: seg.color,
                color: '#0b1020',
                borderRadius: 4,
                boxShadow: seg.emphasize ? '0 0 0 2px rgba(0,0,0,0.15) inset' : undefined,
              }}
            >
              {seg.text}
            </span>
          ) : (
            <span key={idx}>{seg.text}</span>
          )
        )}
      </div>
    );
  };

  const showHighlighted = inputMode === 'js' && (running || ip > 0);

  const editor = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="mb-2 rounded-md border border-gray-200 bg-gray-100 p-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 text-sm font-semibold">Editor</div>
          <label className="text-xs text-gray-600" htmlFor="heap-input-mode-select">
            Input
          </label>
          <select
            id="heap-input-mode-select"
            className="min-w-40 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
            value={inputMode}
            onChange={(e) => {
              const mode = e.target.value as 'js' | 'dsl';
              setInputMode(mode);
              setSource(mode === 'js' ? DEFAULT_JS : DEFAULT_DSL);
              compiledRef.current = null;
              lastSrcRef.current = '';
              setIp(0);
              heapRef.current?.reset();
              setOutput([{ text: 'Mode changed.', kind: 'info' }]);
              resetLabelColors();
            }}
          >
            <option value="js">JavaScript</option>
            <option value="dsl">Simple DSL</option>
          </select>
          <div className="mx-2 h-5 w-px bg-gray-300" />
          <button
            title={running ? 'Stop' : 'Run'}
            onClick={run}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
          >
            {running ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            title="Step"
            onClick={step}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
          >
            <StepForward className="h-4 w-4" />
          </button>
          <button
            title="Reset"
            onClick={reset}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-700 text-white hover:bg-gray-600"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <label className="ml-2 text-xs text-gray-600" htmlFor="heap-speed-select">
            Speed
          </label>
          <select
            id="heap-speed-select"
            className="min-w-36 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
            value={speed}
            onChange={(e) => setSpeed(e.target.value as 'very-slow' | 'slow' | 'normal')}
          >
            <option value="very-slow">Very Slow</option>
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-auto">
          {showHighlighted ? (
            renderHighlighted()
          ) : (
            <textarea
              value={source}
              onChange={(e) => {
                const val = e.target.value;
                setSource(val);
                compiledRef.current = null;
                lastSrcRef.current = '';
                setIp(0);
                heapRef.current?.reset();
                setOutput([{ text: 'Program updated.', kind: 'info' }]);
                resetLabelColors();
              }}
              className="h-full min-h-64 w-full resize-none rounded-md border border-gray-300 p-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              placeholder={
                inputMode === 'js'
                  ? 'Write JavaScript. Use alloc(label, size?) and free(label?) to emit heap events.'
                  : 'Type instructions: alloc <label> [size] | free [label]'
              }
              rows={12}
            />
          )}
        </div>
        <div className="my-2 h-px bg-gray-200" />
        <div className="flex flex-row gap-2">
          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            onClick={() => {
              const sample = inputMode === 'js' ? DEFAULT_JS : DEFAULT_DSL;
              setSource(sample);
              compiledRef.current = null;
              lastSrcRef.current = '';
              setIp(0);
              heapRef.current?.reset();
              setOutput([{ text: 'Loaded example.', kind: 'info' }]);
              resetLabelColors();
            }}
          >
            Load Example
          </button>
          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            onClick={() => setSource('')}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );

  const outputPanel = (
    <div className="flex h-full flex-col">
      <div className="mb-2 rounded-md border border-gray-200 bg-gray-100 px-2 py-1">
        <div className="text-sm font-semibold">Output</div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto whitespace-pre rounded-md border border-gray-300 bg-gray-50 p-2 font-mono text-sm">
        {output.map((line, idx) => {
          const color = line.label ? colorForLabel(line.label) : undefined;
          return (
            <div
              key={idx}
              className="mb-0.5 inline-flex items-center gap-2 rounded-md px-1 py-0.5"
              style={{
                backgroundColor: color ?? 'transparent',
                color: color ? '#0b1020' : undefined,
              }}
            >
              <span>{line.text}</span>
            </div>
          );
        })}
      </div>
    </div>
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

      <div className="mt-2 border-b">
        <nav className="flex gap-2">
          {(['2D', '3D'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm ${
                mode === m
                  ? 'border-indigo-600 font-medium text-indigo-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              {m}
            </button>
          ))}
        </nav>
      </div>

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
