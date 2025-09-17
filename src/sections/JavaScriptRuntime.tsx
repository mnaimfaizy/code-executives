import React, { useEffect, useRef, useState } from 'react';
import TwoDLayout from '../components/TwoDLayout';
import ModeTabs from '../components/shared/ModeTabs';
import { type Speed } from '../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../components/shared/OutputPanel';
import Editor from '../components/shared/Editor';
import useRunner from '../hooks/useRunner';

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

const JavaScriptRuntime: React.FC = () => {
  const [mode, setMode] = useState<'2D' | '3D'>('2D');
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
      <h2 className="text-base font-semibold">JavaScript Runtime Environment</h2>

      {/* Runtime Context Introduction */}
      <div className="mb-4 rounded-lg bg-indigo-50 p-3">
        <h3 className="mb-2 text-sm font-semibold text-indigo-900">Runtime vs Engine</h3>
        <p className="mb-2 text-xs text-indigo-800">
          The JavaScript Runtime is the complete execution environment that includes the Engine plus
          additional APIs, event systems, and I/O capabilities. Different runtimes (Browser,
          Node.js, Deno, Bun) provide different sets of APIs and capabilities while sharing the same
          core JavaScript Engine.
        </p>
        <p className="text-xs text-indigo-700">
          <strong>Runtime = Engine + Web APIs + Event Loop + Task Queues + I/O Systems</strong>
        </p>
      </div>

      {/* Theory Section */}
      <div className="mb-3">
        <h3 className="mb-2 text-sm font-semibold">Runtime Architecture</h3>
        <p className="mb-2 text-sm text-gray-700">
          JavaScript runtimes provide the execution environment for JavaScript code. They integrate
          the JavaScript engine with platform-specific APIs, event systems, and I/O operations to
          create complete application platforms.
        </p>
        <div className="mb-2 grid grid-cols-1 gap-2 text-xs text-gray-600 md:grid-cols-2">
          <div>
            <strong>Runtime Components:</strong>
            <ul className="ml-3 list-disc">
              <li>
                <strong>JavaScript Engine:</strong> Core execution (V8, SpiderMonkey)
              </li>
              <li>
                <strong>Web APIs:</strong> Platform-specific functionality
              </li>
              <li>
                <strong>Event Loop:</strong> Asynchronous operation coordination
              </li>
              <li>
                <strong>Task Queues:</strong> Callback and promise scheduling
              </li>
            </ul>
          </div>
          <div>
            <strong>Runtime Types:</strong>
            <ul className="ml-3 list-disc">
              <li>
                <strong>Browser:</strong> DOM, Fetch, Timers, WebGL
              </li>
              <li>
                <strong>Node.js:</strong> File System, HTTP, Process APIs
              </li>
              <li>
                <strong>Deno:</strong> Web Standards, Security, TypeScript
              </li>
              <li>
                <strong>Bun:</strong> Fast bundling, Native performance
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ModeTabs mode={mode} onChange={setMode} />

      {mode === '2D' ? (
        <div className="mt-2">
          <TwoDLayout
            title="2D Visualization: JavaScript Runtime"
            editor={editor}
            output={outputPanel}
            canvas={canvas2D}
          />
        </div>
      ) : (
        <div className="mt-2 text-sm text-gray-600">
          3D visualization for JavaScript Runtime is coming soon.
        </div>
      )}
    </section>
  );
};

export default JavaScriptRuntime;
