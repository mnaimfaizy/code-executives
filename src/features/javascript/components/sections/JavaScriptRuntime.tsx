import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Globe,
  Layers,
  Radio,
  Server,
  Zap,
  ArrowRight,
  GitBranch,
  Clock,
  RefreshCw,
  Shield,
  Package,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import TwoDLayout from '../../../../components/TwoDLayout';
import { type Speed } from '../../../../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../../../../components/shared/OutputPanel';
import Editor from '../../../../components/shared/Editor';
import useRunner from '../../../../hooks/useRunner';

type RuntimeEnvironment = 'browser' | 'node' | 'deno' | 'bun';
type RuntimeComponent = 'event-loop' | 'web-apis' | 'task-queues' | 'heap' | 'call-stack';

type Instruction =
  | { type: 'init-runtime'; environment: RuntimeEnvironment }
  | { type: 'activate-component'; component: RuntimeComponent; description: string }
  | { type: 'api-call'; api: string; environment: RuntimeEnvironment }
  | { type: 'queue-task'; taskType: 'macro' | 'micro'; source: string }
  | { type: 'process-task'; taskType: 'macro' | 'micro' };

type Compiled = { program: Instruction[] };

const RUNTIME_ENVIRONMENTS = {
  browser: {
    name: 'Browser Runtime',
    apis: ['DOM APIs', 'Fetch API', 'Timer APIs', 'WebGL', 'WebWorkers'],
    color: '#3b82f6',
  },
  node: {
    name: 'Node.js Runtime',
    apis: ['File System', 'HTTP Server', 'Process APIs', 'Buffer', 'Streams'],
    color: '#22c55e',
  },
  deno: {
    name: 'Deno Runtime',
    apis: ['Web Standards', 'TypeScript', 'Security APIs', 'Built-in Testing'],
    color: '#8b5cf6',
  },
  bun: {
    name: 'Bun Runtime',
    apis: ['Fast bundling', 'Native APIs', 'Package Manager', 'Test Runner'],
    color: '#f59e0b',
  },
};

const DEFAULT_JS = `// JavaScript Runtime Environment Demo
console.log('Runtime initialization...');

// Web APIs in different environments
if (typeof window !== 'undefined') {
  // Browser environment
  setTimeout(() => {
    console.log('Timer API executed');
  }, 1000);
  
  fetch('/api/data')
    .then(response => response.json())
    .then(data => console.log('Fetch API result:', data));
    
} else if (typeof process !== 'undefined') {
  // Node.js environment
  const fs = require('fs');
  process.nextTick(() => {
    console.log('Process nextTick executed');
  });
}

// Event Loop interaction
Promise.resolve().then(() => {
  console.log('Microtask executed');
});

console.log('Synchronous code completed');`;

const DEFAULT_DSL = `// Runtime Environment simulation DSL
// init-runtime <environment>
// activate-component <component> <description>
// api-call <api> <environment>
// queue-task <taskType> <source>
// process-task <taskType>

init-runtime browser
activate-component event-loop "Event loop starts processing"
activate-component web-apis "Web APIs become available"
api-call setTimeout browser
queue-task macro "Timer callback"
queue-task micro "Promise resolution"
process-task micro
process-task macro`;

// Runtime Architecture Visualization
const Runtime2D: React.FC<{
  activeEnvironment?: RuntimeEnvironment;
  activeComponent?: RuntimeComponent;
  taskQueue?: Array<{ type: 'macro' | 'micro'; source: string; id: number }>;
}> = ({ activeEnvironment, activeComponent, taskQueue = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Draw runtime environment selection
    if (activeEnvironment) {
      const env = RUNTIME_ENVIRONMENTS[activeEnvironment];
      ctx.fillStyle = env.color;
      ctx.fillRect(10, 10, width - 20, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(env.name, width / 2, 35);
    }

    // Draw runtime architecture
    const components = [
      { name: 'Call Stack', x: 50, y: 80, w: 120, h: 80, id: 'call-stack' },
      { name: 'Heap Memory', x: 50, y: 180, w: 120, h: 80, id: 'heap' },
      { name: 'Event Loop', x: 200, y: 130, w: 120, h: 80, id: 'event-loop' },
      { name: 'Web APIs', x: 350, y: 80, w: 120, h: 80, id: 'web-apis' },
      { name: 'Task Queues', x: 350, y: 180, w: 120, h: 80, id: 'task-queues' },
    ];

    components.forEach((comp) => {
      const isActive = activeComponent === comp.id;

      // Draw component box
      ctx.fillStyle = isActive ? '#3b82f6' : '#e2e8f0';
      ctx.fillRect(comp.x, comp.y, comp.w, comp.h);

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(comp.x, comp.y, comp.w, comp.h);

      // Draw component label
      ctx.fillStyle = isActive ? '#ffffff' : '#1e293b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(comp.name, comp.x + comp.w / 2, comp.y + comp.h / 2 + 4);
    });

    // Draw connections between components
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;

    // Call Stack <-> Event Loop
    ctx.beginPath();
    ctx.moveTo(170, 120);
    ctx.lineTo(200, 140);
    ctx.stroke();

    // Event Loop <-> Web APIs
    ctx.beginPath();
    ctx.moveTo(320, 140);
    ctx.lineTo(350, 120);
    ctx.stroke();

    // Event Loop <-> Task Queues
    ctx.beginPath();
    ctx.moveTo(320, 170);
    ctx.lineTo(350, 200);
    ctx.stroke();

    // Heap <-> Call Stack
    ctx.beginPath();
    ctx.moveTo(110, 180);
    ctx.lineTo(110, 160);
    ctx.stroke();

    // Draw task queue visualization
    if (taskQueue.length > 0) {
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Active Tasks:', 10, height - 60);

      taskQueue.forEach((task, index) => {
        const y = height - 40 + index * 15;
        const color = task.type === 'micro' ? '#22c55e' : '#f59e0b';

        ctx.fillStyle = color;
        ctx.fillRect(10, y - 10, 8, 8);

        ctx.fillStyle = '#1e293b';
        ctx.fillText(`${task.type}: ${task.source}`, 25, y - 2);
      });
    }

    // Draw environment-specific APIs
    if (activeEnvironment && activeComponent === 'web-apis') {
      const env = RUNTIME_ENVIRONMENTS[activeEnvironment];
      const apiY = 300;

      ctx.fillStyle = '#1e293b';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${env.name} APIs:`, 10, apiY);

      env.apis.forEach((api, index) => {
        ctx.fillStyle = env.color;
        ctx.fillRect(10, apiY + 20 + index * 25, 8, 8);

        ctx.fillStyle = '#1e293b';
        ctx.font = '12px sans-serif';
        ctx.fillText(api, 25, apiY + 28 + index * 25);
      });
    }

    // Runtime vs Engine distinction
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Runtime = Engine + Environment APIs + Event System', width - 10, height - 10);
  }, [activeEnvironment, activeComponent, taskQueue]);

  return (
    <canvas ref={canvasRef} className="h-full w-full" style={{ width: '100%', height: '100%' }} />
  );
};

const RuntimeVisualizationSection: React.FC = () => {
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('js');
  const [source, setSource] = useState<string>(DEFAULT_JS);
  const [output, setOutput] = useState<OutputLine[]>([{ text: 'Runtime ready.', kind: 'info' }]);
  const [speed, setSpeed] = useState<Speed>('slow');
  const [activeEnvironment, setActiveEnvironment] = useState<RuntimeEnvironment>('browser');
  const [activeComponent, setActiveComponent] = useState<RuntimeComponent | undefined>();
  const [taskQueue, setTaskQueue] = useState<
    Array<{ type: 'macro' | 'micro'; source: string; id: number }>
  >([]);
  const compiledRef = useRef<Compiled | null>(null);
  const taskIdCounter = useRef(0);

  const log = (msg: string, opts?: { kind?: OutputLine['kind'] }) =>
    setOutput((o) => [...o, { text: msg, kind: opts?.kind }]);

  const reset = () => {
    setActiveEnvironment('browser');
    setActiveComponent(undefined);
    setTaskQueue([]);
    setOutput([{ text: 'Runtime reset.', kind: 'info' }]);
    compiledRef.current = null;
    taskIdCounter.current = 0;
  };

  const ensureCompiled = (): Compiled => {
    if (compiledRef.current) return compiledRef.current;

    try {
      if (inputMode === 'js') {
        // Analyze JavaScript code to simulate runtime behavior
        const program: Instruction[] = [{ type: 'init-runtime', environment: 'browser' }];

        // Check for different runtime features
        if (source.includes('setTimeout') || source.includes('setInterval')) {
          program.push({
            type: 'activate-component',
            component: 'web-apis',
            description: 'Timer APIs activated',
          });
          program.push({ type: 'api-call', api: 'setTimeout', environment: 'browser' });
          program.push({ type: 'queue-task', taskType: 'macro', source: 'Timer callback' });
        }

        if (source.includes('fetch')) {
          program.push({ type: 'api-call', api: 'fetch', environment: 'browser' });
          program.push({ type: 'queue-task', taskType: 'macro', source: 'Fetch response' });
        }

        if (source.includes('Promise')) {
          program.push({ type: 'queue-task', taskType: 'micro', source: 'Promise.resolve()' });
        }

        if (source.includes('process.nextTick')) {
          program.push({ type: 'init-runtime', environment: 'node' });
          program.push({ type: 'api-call', api: 'process.nextTick', environment: 'node' });
          program.push({ type: 'queue-task', taskType: 'micro', source: 'nextTick callback' });
        }

        // Event loop processing
        program.push({
          type: 'activate-component',
          component: 'event-loop',
          description: 'Processing task queues',
        });
        program.push({ type: 'process-task', taskType: 'micro' });
        program.push({ type: 'process-task', taskType: 'macro' });

        compiledRef.current = { program };
        return compiledRef.current;
      } else {
        // DSL mode - parse instructions
        const lines = source.split('\n').filter((l) => l.trim() && !l.trim().startsWith('//'));
        const program: Instruction[] = [];

        for (const line of lines) {
          const [cmd, ...rest] = line.trim().split(/\s+/);
          if (cmd === 'init-runtime') {
            program.push({ type: 'init-runtime', environment: rest[0] as RuntimeEnvironment });
          } else if (cmd === 'activate-component') {
            program.push({
              type: 'activate-component',
              component: rest[0] as RuntimeComponent,
              description: rest.slice(1).join(' ').replace(/"/g, ''),
            });
          } else if (cmd === 'api-call') {
            program.push({
              type: 'api-call',
              api: rest[0],
              environment: rest[1] as RuntimeEnvironment,
            });
          } else if (cmd === 'queue-task') {
            program.push({
              type: 'queue-task',
              taskType: rest[0] as 'macro' | 'micro',
              source: rest.slice(1).join(' ').replace(/"/g, ''),
            });
          } else if (cmd === 'process-task') {
            program.push({ type: 'process-task', taskType: rest[0] as 'macro' | 'micro' });
          }
        }

        compiledRef.current = { program };
        return compiledRef.current;
      }
    } catch (e) {
      log(`Runtime simulation error: ${e instanceof Error ? e.message : String(e)}`, {
        kind: 'error',
      });
      compiledRef.current = { program: [] };
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
      if (ins.type === 'init-runtime') {
        setActiveEnvironment(ins.environment);
        log(`Initialized ${RUNTIME_ENVIRONMENTS[ins.environment].name}`, { kind: 'info' });
      } else if (ins.type === 'activate-component') {
        setActiveComponent(ins.component);
        log(`${ins.component}: ${ins.description}`, { kind: 'info' });
      } else if (ins.type === 'api-call') {
        log(`${ins.environment} API call: ${ins.api}`, { kind: 'log' });
      } else if (ins.type === 'queue-task') {
        const task = {
          type: ins.taskType,
          source: ins.source,
          id: taskIdCounter.current++,
        };
        setTaskQueue((queue) => [...queue, task]);
        log(`Queued ${ins.taskType}task: ${ins.source}`, { kind: 'info' });
      } else if (ins.type === 'process-task') {
        setTaskQueue((queue) => {
          const taskIndex = queue.findIndex((t) => t.type === ins.taskType);
          if (taskIndex >= 0) {
            const task = queue[taskIndex];
            log(`Processed ${ins.taskType}task: ${task.source}`, { kind: 'info' });
            return queue.filter((_, i) => i !== taskIndex);
          }
          return queue;
        });
      }
    },
    getIntervalMs: (s) => (s === 'very-slow' ? 2000 : s === 'slow' ? 1200 : 600),
    onComplete: () => {
      setActiveComponent(undefined);
      log('Runtime cycle complete.', { kind: 'info' });
    },
  });

  useEffect(() => {
    setRunnerSpeed(speed);
  }, [speed, setRunnerSpeed]);

  const step = () => {
    runnerStep();
  };

  const run = () => {
    toggleRun();
  };

  const editor = (
    <Editor
      title="Runtime Code"
      selectId="runtime-input-mode-select"
      inputMode={inputMode}
      onInputModeChange={(mode) => {
        setInputMode(mode);
        setSource(mode === 'js' ? DEFAULT_JS : DEFAULT_DSL);
        reset();
      }}
      source={source}
      onSourceChange={(val) => {
        setSource(val);
        compiledRef.current = null;
      }}
      placeholderJs="Write JavaScript to see runtime environment interaction"
      placeholderDsl="Use runtime commands: init-runtime, activate-component, api-call, queue-task"
      showHighlighted={false}
      running={false}
      speed={speed}
      onRunToggle={run}
      onStep={step}
      onReset={reset}
      onSpeedChange={(s) => setSpeed(s)}
      onLoadExample={() => {
        const sample = inputMode === 'js' ? DEFAULT_JS : DEFAULT_DSL;
        setSource(sample);
        reset();
      }}
      onClear={() => setSource('')}
    />
  );

  const outputPanel = <OutputPanel lines={output} colorForLabel={() => undefined} />;

  const canvas2D = (
    <div className="flex h-full flex-col gap-2 p-2">
      {/* Runtime Environment Selector */}
      <div className="rounded-md border border-gray-300 p-3" style={{ height: '25%' }}>
        <h4 className="mb-2 text-sm font-semibold">Runtime Environments</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(RUNTIME_ENVIRONMENTS).map(([key, env]) => (
            <div
              key={key}
              className={`cursor-pointer rounded p-2 ${
                activeEnvironment === key ? 'border-2' : 'border border-gray-200'
              }`}
              style={{ borderColor: activeEnvironment === key ? env.color : '#e5e7eb' }}
              onClick={() => setActiveEnvironment(key as RuntimeEnvironment)}
            >
              <div className="font-semibold" style={{ color: env.color }}>
                {env.name}
              </div>
              <div className="text-gray-600">{env.apis.length} APIs available</div>
            </div>
          ))}
        </div>
      </div>

      {/* Runtime Architecture Visualization */}
      <div className="flex-1 rounded-md border border-gray-300">
        <div className="p-2">
          <h4 className="text-sm font-semibold">Runtime Architecture</h4>
        </div>
        <div className="h-full">
          <Runtime2D
            activeEnvironment={activeEnvironment}
            activeComponent={activeComponent}
            taskQueue={taskQueue}
          />
        </div>
      </div>
    </div>
  );

  return (
    <section className="mb-4">
      <div className="mt-2">
        <TwoDLayout
          title="2D Visualization: JavaScript Runtime"
          editor={editor}
          output={outputPanel}
          canvas={canvas2D}
        />
      </div>
    </section>
  );
};

// ─── Sub-section navigation cards ───────────────────────────────────────────
const runtimeSubSections = [
  {
    id: 'Event Loop & Coordination',
    title: 'Event Loop & Coordination',
    description:
      'How JavaScript orchestrates async operations — microtask queue, macrotask queue, and the tick cycle.',
    icon: <RefreshCw className="w-5 h-5" />,
    color: 'yellow',
    tags: ['Microtasks', 'Macrotasks', 'Concurrency'],
  },
  {
    id: 'Web APIs & Platform',
    title: 'Web APIs & Platform',
    description:
      'Browser and server-side platform APIs that extend the engine — DOM, Fetch, File System, Timers, and more.',
    icon: <Globe className="w-5 h-5" />,
    color: 'blue',
    tags: ['DOM', 'Fetch', 'Timers', 'fs'],
  },
  {
    id: 'Task Queues & Priority',
    title: 'Task Queues & Priority',
    description:
      'Deep dive into Promise microtasks, setTimeout macrotasks, and queueMicrotask scheduling order.',
    icon: <Layers className="w-5 h-5" />,
    color: 'purple',
    tags: ['Priority', 'Scheduling', 'Promises'],
  },
  {
    id: 'V8 Runtime Features',
    title: 'V8 Runtime Features',
    description:
      'V8-specific runtime optimisations: hidden classes, inline caches, shape transitions, and deoptimisation.',
    icon: <Zap className="w-5 h-5" />,
    color: 'green',
    tags: ['Hidden Classes', 'IC', 'Deopt'],
  },
];

const colorMap: Record<
  string,
  { bg: string; border: string; icon: string; tag: string; btn: string }
> = {
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'bg-yellow-100 text-yellow-600',
    tag: 'bg-yellow-100 text-yellow-700',
    btn: 'bg-yellow-500 hover:bg-yellow-600',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'bg-blue-100 text-blue-600',
    tag: 'bg-blue-100 text-blue-700',
    btn: 'bg-blue-500 hover:bg-blue-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'bg-purple-100 text-purple-600',
    tag: 'bg-purple-100 text-purple-700',
    btn: 'bg-purple-500 hover:bg-purple-600',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'bg-green-100 text-green-600',
    tag: 'bg-green-100 text-green-700',
    btn: 'bg-green-500 hover:bg-green-600',
  },
};

// ─── Runtime comparison data ─────────────────────────────────────────────────
const runtimeRows = [
  {
    feature: 'JavaScript Engine',
    browser: 'V8 / SpiderMonkey',
    node: 'V8',
    deno: 'V8',
    bun: 'JavaScriptCore',
  },
  { feature: 'TypeScript built-in', browser: false, node: false, deno: true, bun: true },
  { feature: 'DOM / Web APIs', browser: true, node: false, deno: 'Partial', bun: 'Partial' },
  { feature: 'Fetch API', browser: true, node: 'v18+', deno: true, bun: true },
  { feature: 'File System API', browser: false, node: true, deno: true, bun: true },
  { feature: 'HTTP Server built-in', browser: false, node: true, deno: true, bun: true },
  {
    feature: 'Package Manager',
    browser: 'N/A',
    node: 'npm/pnpm/yarn',
    deno: 'jsr/npm',
    bun: 'bun (built-in)',
  },
  { feature: 'Secure-by-default', browser: 'Same-origin', node: false, deno: true, bun: false },
  { feature: 'Startup speed', browser: '—', node: 'Fast', deno: 'Fast', bun: 'Fastest' },
];

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) return <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />;
  if (value === false) return <XCircle className="w-4 h-4 text-red-400 mx-auto" />;
  return <span className="text-xs text-gray-700">{value as string}</span>;
}

// ─── Main exported page ───────────────────────────────────────────────────────
const JavaScriptRuntime: React.FC = () => {
  const navigate = useNavigate();

  const navigateTo = (sectionId: string) =>
    navigate(`/javascript?section=${encodeURIComponent(sectionId)}`);

  return (
    <section className="mb-8">
      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border border-indigo-200 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">JavaScript Runtime Environment</h1>
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            Beyond the engine lies the runtime — the complete execution environment that powers
            every JavaScript application. Discover how Browser, Node.js, Deno, and Bun each wrap the
            same core engine with radically different platform capabilities.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              {
                label: 'Event Loop',
                icon: <RefreshCw className="w-4 h-4" />,
                cls: 'bg-yellow-100 text-yellow-800',
              },
              {
                label: 'Web APIs',
                icon: <Globe className="w-4 h-4" />,
                cls: 'bg-blue-100 text-blue-800',
              },
              {
                label: 'Task Queues',
                icon: <Layers className="w-4 h-4" />,
                cls: 'bg-purple-100 text-purple-800',
              },
              {
                label: 'V8 Optimisations',
                icon: <Zap className="w-4 h-4" />,
                cls: 'bg-green-100 text-green-800',
              },
              {
                label: 'Node.js / Deno / Bun',
                icon: <Server className="w-4 h-4" />,
                cls: 'bg-orange-100 text-orange-800',
              },
            ].map(({ label, icon, cls }) => (
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

      {/* ── Runtime vs Engine ── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Runtime vs Engine</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              What is a JavaScript Runtime?
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              The JavaScript <strong>Runtime</strong> is everything the engine (V8, SpiderMonkey,
              JavaScriptCore) needs to actually run real-world code: a host environment that injects
              platform-specific APIs, wires up an event loop, and manages I/O callbacks.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Think of the engine as the car's combustion unit — it converts fuel (code) into
              movement (execution). The runtime is the whole car: steering wheel (APIs), dashboard
              (event system), gearbox (task queues), and wheels (I/O drivers).
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">The Simple Formula</h3>
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200 text-center">
              <p className="text-lg font-mono font-semibold text-indigo-900 mb-4">
                Runtime = Engine + Host APIs + Event Loop + Task Queues + I/O
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Engine', sub: 'Parse · Compile · Execute', color: 'blue' },
                  { label: 'Host APIs', sub: 'DOM · Fetch · fs · timers', color: 'purple' },
                  { label: 'Event Loop', sub: 'Tick · Drain · Repeat', color: 'yellow' },
                  { label: 'Task Queues', sub: 'Micro · Macro · Priority', color: 'green' },
                ].map(({ label, sub, color }) => (
                  <div
                    key={label}
                    className={`bg-${color}-50 border border-${color}-200 rounded-lg p-3`}
                  >
                    <div className={`font-bold text-${color}-800 text-sm`}>{label}</div>
                    <div className={`text-${color}-600 text-xs mt-1`}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Core architecture principles */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Architecture Principles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Activity className="w-4 h-4" />,
                title: 'Non-Blocking I/O',
                body: 'All I/O is asynchronous. The runtime hands off work to the OS and resumes execution via callbacks, enabling high concurrency on a single thread.',
              },
              {
                icon: <Radio className="w-4 h-4" />,
                title: 'Event-Driven Model',
                body: 'The event loop processes one callback at a time from the task queue, guaranteeing that JavaScript code is never interrupted mid-execution.',
              },
              {
                icon: <GitBranch className="w-4 h-4" />,
                title: 'Platform Abstraction',
                body: 'Each runtime abstracts the underlying OS (file system, networking, processes) through a unified API surface, hiding platform differences.',
              },
              {
                icon: <Clock className="w-4 h-4" />,
                title: 'Micro/Macro Scheduling',
                body: 'Promise callbacks are microtasks (run before the next tick), while setTimeout/setInterval are macrotasks (run once per tick per item).',
              },
            ].map(({ icon, title, body }) => (
              <div key={title}>
                <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                  {icon} {title}
                </h4>
                <p className="text-sm text-gray-700">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Interactive 2D Visualization ── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Interactive Runtime Simulation</h2>
        <p className="text-gray-600 mb-6">
          Write JavaScript or use the Runtime DSL to simulate how different runtime environments
          initialise, activate platform components, and work through their task queues.
        </p>
        <RuntimeVisualizationSection />
      </div>

      {/* ── Sub-section Navigation ── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore Runtime Sub-topics</h2>
        <p className="text-gray-600 mb-6">
          Each sub-section dives deeper into one aspect of the JavaScript Runtime with its own
          interactive visualisation and code runner.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {runtimeSubSections.map((sec) => {
            const c = colorMap[sec.color];
            return (
              <div
                key={sec.id}
                className={`${c.bg} ${c.border} border rounded-xl p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span
                        className={`w-8 h-8 ${c.icon} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        {sec.icon}
                      </span>
                      {sec.title}
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">{sec.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {sec.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`${c.tag} text-xs px-2 py-0.5 rounded-full font-medium`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => navigateTo(sec.id)}
                    className={`ml-4 ${c.btn} text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1`}
                  >
                    Explore <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Runtime Comparison Table ── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Runtime Comparison</h2>
        <p className="text-gray-600 mb-6">
          All four major JavaScript runtimes share the V8 or JSC engine but differ significantly in
          their API surface, security model, and ecosystem.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-700">Feature</th>
                {[
                  {
                    label: 'Browser',
                    color: 'text-blue-700',
                    bg: 'bg-blue-50',
                    icon: <Globe className="w-4 h-4 inline mr-1" />,
                  },
                  {
                    label: 'Node.js',
                    color: 'text-green-700',
                    bg: 'bg-green-50',
                    icon: <Server className="w-4 h-4 inline mr-1" />,
                  },
                  {
                    label: 'Deno',
                    color: 'text-purple-700',
                    bg: 'bg-purple-50',
                    icon: <Shield className="w-4 h-4 inline mr-1" />,
                  },
                  {
                    label: 'Bun',
                    color: 'text-orange-700',
                    bg: 'bg-orange-50',
                    icon: <Package className="w-4 h-4 inline mr-1" />,
                  },
                ].map(({ label, color, bg, icon }) => (
                  <th key={label} className={`p-4 text-center font-semibold ${color} ${bg}`}>
                    {icon}
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runtimeRows.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-4 font-medium text-gray-800">{row.feature}</td>
                  <td className="p-4 text-center">
                    <CellValue value={row.browser} />
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={row.node} />
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={row.deno} />
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={row.bun} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Key Takeaways ── */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Takeaways</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Same Engine, Different World',
              body: 'V8 executes the same ECMAScript inside Chrome and Node.js, but the surrounding runtime APIs are completely different — there is no DOM in Node.js, and no fs module in the browser.',
            },
            {
              title: 'Async Without Threads',
              body: 'JavaScript achieves high I/O throughput without multi-threading by delegating blocking work to the OS and resuming through the event loop — one callback at a time.',
            },
            {
              title: 'Microtasks First',
              body: 'Promise callbacks always run before the next macrotask, regardless of when they are scheduled. Mastering this ordering is essential for predictable async code.',
            },
          ].map(({ title, body }) => (
            <div key={title} className="bg-white rounded-lg p-5 shadow-sm border border-indigo-100">
              <h3 className="font-semibold text-indigo-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JavaScriptRuntime;
