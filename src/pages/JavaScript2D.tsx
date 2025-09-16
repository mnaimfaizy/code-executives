import React, { useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, StepForward } from 'lucide-react';
import TwoDLayout from '../components/TwoDLayout';
import CallStack2D, { type CallStack2DHandle } from '../components/models2d/CallStack2D';

type Instruction = { type: 'push' | 'pop'; label?: string };

// Tiny DSL: lines of `push label` or `pop`.
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

const DEFAULT_PROGRAM = `push main
push foo
push bar
pop
push baz
pop
pop`;

const JavaScript2D: React.FC = () => {
  const stackRef = useRef<CallStack2DHandle | null>(null);
  const [source, setSource] = useState<string>(DEFAULT_PROGRAM);
  const [output, setOutput] = useState<string>('Ready.');
  const [ip, setIp] = useState<number>(0); // instruction pointer
  const program = useMemo(() => parseProgram(source), [source]);

  const log = (msg: string) => setOutput((o) => (o ? o + '\n' + msg : msg));

  const reset = () => {
    stackRef.current?.reset();
    setIp(0);
    setOutput('Reset.');
  };

  const step = () => {
    if (ip >= program.length) {
      log('Program complete.');
      return;
    }
    const ins = program[ip];
    if (ins.type === 'push') {
      stackRef.current?.push(ins.label || 'fn');
      log(`push(${ins.label || 'fn'})`);
    } else if (ins.type === 'pop') {
      stackRef.current?.pop();
      log('pop()');
    }
    setIp((n) => n + 1);
  };

  const run = () => {
    if (ip >= program.length) {
      log('Program already complete. Reset to run again.');
      return;
    }
    // simple timed runner
    const interval = 450; // ms
    let i = ip;
    const id = setInterval(() => {
      if (i >= program.length) {
        clearInterval(id);
        log('Program complete.');
        return;
      }
      const ins = program[i++];
      if (ins.type === 'push') {
        stackRef.current?.push(ins.label || 'fn');
        log(`push(${ins.label || 'fn'})`);
      } else {
        stackRef.current?.pop();
        log('pop()');
      }
      setIp(i);
    }, interval);
  };

  const editor = (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          <span className="text-sm font-semibold tracking-wide text-slate-800">
            Stack Operations
          </span>
        </div>
        <button
          title="Run All Commands"
          onClick={run}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Play className="h-4 w-4" />
        </button>
        <button
          title="Step Through"
          onClick={step}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <StepForward className="h-4 w-4" />
        </button>
        <button
          title="Reset Stack"
          onClick={reset}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      <textarea
        value={source}
        onChange={(e) => setSource(e.target.value)}
        rows={10}
        placeholder={'// Type instructions: push <label> | pop\npush main\npush calculateSum\npop'}
        className="flex-1 resize-none rounded-md border border-slate-300 p-4 font-mono text-sm leading-relaxed outline-none ring-indigo-500 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => setSource(DEFAULT_PROGRAM)}
          className="inline-flex items-center rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
        >
          📝 Load Example
        </button>
        <button
          onClick={() => setSource('')}
          className="inline-flex items-center rounded-md border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );

  const outputPanel = (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          <span className="text-sm font-semibold tracking-wide text-green-600">Execution Log</span>
        </div>
        <div className="rounded-md border border-green-300/40 bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
          {output.split('\n').length - 1} operations
        </div>
      </div>
      <div className="relative flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-green-300/30 bg-[#1a1a1a] p-2 font-mono text-[13px] leading-6 text-green-500">
        {output || (
          <div className="flex h-full items-center justify-center text-xs text-green-400/70">
            💡 Output will appear here when you run commands
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />
      </div>
    </div>
  );

  const canvas = (
    <div className="relative h-full p-2">
      <CallStack2D ref={stackRef} />
    </div>
  );

  return (
    <div className="mt-2 max-w-full overflow-hidden px-2 sm:px-4 md:px-6">
      {/* Theory heading for reusability across 2D models is placed in the Section above this page */}
      <TwoDLayout
        title="2D Visualization: Call Stack"
        editor={editor}
        output={outputPanel}
        canvas={canvas}
      />
    </div>
  );
};

export default JavaScript2D;
