import React, { useEffect, useRef, useState } from 'react';
import TwoDLayout from '../../components/TwoDLayout';
import ModeTabs from '../../components/shared/ModeTabs';
import { type Speed } from '../../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../../components/shared/OutputPanel';
import Editor from '../../components/shared/Editor';
import useRunner from '../../hooks/useRunner';

type TaskType = 'script' | 'microtask' | 'macrotask' | 'animation' | 'idle';
type TaskSource =
  | 'script'
  | 'promise'
  | 'timer'
  | 'dom-event'
  | 'network'
  | 'animation-frame'
  | 'idle-callback';

type Task = {
  id: number;
  type: TaskType;
  source: TaskSource;
  description: string;
  priority: number;
  timestamp: number;
};

type Instruction =
  | { type: 'queue-task'; task: Task }
  | { type: 'process-queue'; queueType: TaskType }
  | { type: 'execute-task'; task: Task }
  | { type: 'show-priority'; priorities: TaskType[] };

type Compiled = { program: Instruction[] };

const TASK_PRIORITIES = {
  script: 1, // Immediate execution
  microtask: 2, // Promise.then(), queueMicrotask()
  macrotask: 3, // setTimeout(), DOM events
  animation: 4, // requestAnimationFrame()
  idle: 5, // requestIdleCallback()
};

const TASK_COLORS = {
  script: '#dc2626',
  microtask: '#059669',
  macrotask: '#d97706',
  animation: '#7c3aed',
  idle: '#64748b',
};

const TASK_DESCRIPTIONS = {
  script: 'Synchronous JavaScript execution',
  microtask: 'Promise callbacks, queueMicrotask()',
  macrotask: 'Timers, DOM events, I/O callbacks',
  animation: 'requestAnimationFrame() callbacks',
  idle: 'requestIdleCallback() during browser idle time',
};

const DEFAULT_JS = `// Task Queues and Priority Demonstration
console.log('1. Script execution (highest priority)');

// Microtasks (Promise callbacks)
Promise.resolve().then(() => {
  console.log('3. Microtask: Promise.then()');
});

queueMicrotask(() => {
  console.log('4. Microtask: queueMicrotask()');
});

// Macrotasks (Timer callbacks)
setTimeout(() => {
  console.log('5. Macrotask: setTimeout()');
}, 0);

setImmediate(() => {
  console.log('6. Macrotask: setImmediate()');
});

// Animation frame (browser only)
if (typeof requestAnimationFrame !== 'undefined') {
  requestAnimationFrame(() => {
    console.log('7. Animation: requestAnimationFrame()');
  });
}

// Idle callback (browser only)
if (typeof requestIdleCallback !== 'undefined') {
  requestIdleCallback(() => {
    console.log('8. Idle: requestIdleCallback()');
  });
}

console.log('2. More script execution');

// Demonstrate priority: script > microtasks > macrotasks > animation > idle`;

const DEFAULT_DSL = `// Task Queues simulation DSL
// queue-task <id> <type> <source> <description>
// process-queue <queue-type>
// execute-task <task-id>
// show-priority <task-types>

queue-task 1 script script "console.log execution"
queue-task 2 microtask promise "Promise.then callback"
queue-task 3 macrotask timer "setTimeout callback"
queue-task 4 animation animation-frame "RAF callback"
queue-task 5 idle idle-callback "Idle work"

show-priority script microtask macrotask animation idle

process-queue script
process-queue microtask
process-queue macrotask
process-queue animation
process-queue idle`;

// Task Queues Visualization
const TaskQueues2D: React.FC<{
  tasks: Task[];
  currentQueue?: TaskType;
  processingTask?: Task;
}> = ({ tasks, currentQueue, processingTask }) => {
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

    // Draw priority hierarchy
    ctx.fillStyle = '#1e293b';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Task Queue Priority System', width / 2, 25);

    // Draw execution flow
    const flowY = 50;
    const flowSteps = [
      { name: 'Call Stack', color: '#dc2626' },
      { name: 'Microtasks', color: '#059669' },
      { name: 'Macrotasks', color: '#d97706' },
      { name: 'Animation', color: '#7c3aed' },
      { name: 'Idle', color: '#64748b' },
    ];

    const stepWidth = (width - 40) / flowSteps.length;
    flowSteps.forEach((step, index) => {
      const x = 20 + index * stepWidth;
      const isActive =
        currentQueue === step.name.toLowerCase() ||
        (step.name === 'Call Stack' && currentQueue === 'script');

      // Draw step box
      ctx.fillStyle = isActive ? step.color : step.color + '40';
      ctx.fillRect(x, flowY, stepWidth - 10, 40);

      ctx.strokeStyle = step.color;
      ctx.lineWidth = isActive ? 3 : 1;
      ctx.strokeRect(x, flowY, stepWidth - 10, 40);

      // Draw step label
      ctx.fillStyle = isActive ? '#ffffff' : '#1e293b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(step.name, x + (stepWidth - 10) / 2, flowY + 25);

      // Draw arrow to next step
      if (index < flowSteps.length - 1) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + stepWidth - 10, flowY + 20);
        ctx.lineTo(x + stepWidth, flowY + 20);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(x + stepWidth - 5, flowY + 15);
        ctx.lineTo(x + stepWidth, flowY + 20);
        ctx.lineTo(x + stepWidth - 5, flowY + 25);
        ctx.stroke();
      }
    });

    // Draw task queues
    const queueStartY = 120;
    const queueHeight = (height - queueStartY - 100) / Object.keys(TASK_PRIORITIES).length;

    Object.entries(TASK_PRIORITIES).forEach(([queueType, priority], index) => {
      const y = queueStartY + index * queueHeight;
      const queueTasks = tasks.filter((t) => t.type === queueType);
      const isActiveQueue = currentQueue === queueType;

      // Draw queue container
      ctx.fillStyle = isActiveQueue ? TASK_COLORS[queueType as TaskType] + '20' : '#f8fafc';
      ctx.fillRect(10, y, width - 20, queueHeight - 5);

      ctx.strokeStyle = TASK_COLORS[queueType as TaskType];
      ctx.lineWidth = isActiveQueue ? 2 : 1;
      ctx.strokeRect(10, y, width - 20, queueHeight - 5);

      // Queue label
      ctx.fillStyle = TASK_COLORS[queueType as TaskType];
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${queueType.toUpperCase()} QUEUE (Priority ${priority})`, 15, y + 15);

      // Queue description
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText(TASK_DESCRIPTIONS[queueType as TaskType], 15, y + 30);

      // Draw tasks in queue
      queueTasks.forEach((task, taskIndex) => {
        const taskX = 200 + taskIndex * 100;
        const taskY = y + 10;
        const taskWidth = 90;
        const taskHeight = queueHeight - 25;

        const isProcessing = processingTask?.id === task.id;

        // Draw task box
        ctx.fillStyle = isProcessing ? '#fbbf24' : TASK_COLORS[task.type];
        ctx.fillRect(taskX, taskY, taskWidth, taskHeight);

        ctx.strokeStyle = isProcessing ? '#f59e0b' : '#64748b';
        ctx.lineWidth = isProcessing ? 2 : 1;
        ctx.strokeRect(taskX, taskY, taskWidth, taskHeight);

        // Task details
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Task ${task.id}`, taskX + taskWidth / 2, taskY + 15);
        ctx.fillText(task.source, taskX + taskWidth / 2, taskY + 28);

        if (isProcessing) {
          ctx.fillStyle = '#92400e';
          ctx.fillText('EXECUTING', taskX + taskWidth / 2, taskY + 40);
        }
      });

      // Show task count
      ctx.fillStyle = '#1e293b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${queueTasks.length} tasks`, width - 15, y + 15);
    });

    // Draw processing statistics
    const statsY = height - 80;
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Queue Statistics:', 10, statsY);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.timestamp < Date.now()).length;

    ctx.font = '11px sans-serif';
    ctx.fillText(`Total tasks: ${totalTasks}`, 10, statsY + 20);
    ctx.fillText(`Completed: ${completedTasks}`, 10, statsY + 35);
    ctx.fillText(`Pending: ${totalTasks - completedTasks}`, 10, statsY + 50);

    // Event Loop rule
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Rule: Complete all microtasks before next macrotask', width - 10, statsY + 20);
  }, [tasks, currentQueue, processingTask]);

  return (
    <canvas ref={canvasRef} className="h-full w-full" style={{ width: '100%', height: '100%' }} />
  );
};

const TaskQueues: React.FC = () => {
  const [mode, setMode] = useState<'2D' | '3D'>('2D');
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('js');
  const [source, setSource] = useState<string>(DEFAULT_JS);
  const [output, setOutput] = useState<OutputLine[]>([
    { text: 'Task queues ready.', kind: 'info' },
  ]);
  const [speed, setSpeed] = useState<Speed>('slow');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentQueue, setCurrentQueue] = useState<TaskType | undefined>();
  const [processingTask, setProcessingTask] = useState<Task | undefined>();
  const compiledRef = useRef<Compiled | null>(null);
  const taskIdCounter = useRef(1);

  const log = (msg: string, opts?: { kind?: OutputLine['kind'] }) =>
    setOutput((o) => [...o, { text: msg, kind: opts?.kind }]);

  const reset = () => {
    setTasks([]);
    setCurrentQueue(undefined);
    setProcessingTask(undefined);
    setOutput([{ text: 'Task queues reset.', kind: 'info' }]);
    compiledRef.current = null;
    taskIdCounter.current = 1;
  };

  const ensureCompiled = (): Compiled => {
    if (compiledRef.current) return compiledRef.current;

    try {
      if (inputMode === 'js') {
        // Analyze JavaScript code for different types of async operations
        const program: Instruction[] = [];

        // Queue initial tasks based on code analysis
        if (source.includes('console.log')) {
          program.push({
            type: 'queue-task',
            task: {
              id: taskIdCounter.current++,
              type: 'script',
              source: 'script',
              description: 'console.log execution',
              priority: TASK_PRIORITIES.script,
              timestamp: Date.now(),
            },
          });
        }

        if (source.includes('Promise.resolve') || source.includes('.then')) {
          program.push({
            type: 'queue-task',
            task: {
              id: taskIdCounter.current++,
              type: 'microtask',
              source: 'promise',
              description: 'Promise.then callback',
              priority: TASK_PRIORITIES.microtask,
              timestamp: Date.now() + 100,
            },
          });
        }

        if (source.includes('queueMicrotask')) {
          program.push({
            type: 'queue-task',
            task: {
              id: taskIdCounter.current++,
              type: 'microtask',
              source: 'promise',
              description: 'queueMicrotask callback',
              priority: TASK_PRIORITIES.microtask,
              timestamp: Date.now() + 150,
            },
          });
        }

        if (source.includes('setTimeout')) {
          program.push({
            type: 'queue-task',
            task: {
              id: taskIdCounter.current++,
              type: 'macrotask',
              source: 'timer',
              description: 'setTimeout callback',
              priority: TASK_PRIORITIES.macrotask,
              timestamp: Date.now() + 200,
            },
          });
        }

        if (source.includes('requestAnimationFrame')) {
          program.push({
            type: 'queue-task',
            task: {
              id: taskIdCounter.current++,
              type: 'animation',
              source: 'animation-frame',
              description: 'requestAnimationFrame callback',
              priority: TASK_PRIORITIES.animation,
              timestamp: Date.now() + 300,
            },
          });
        }

        if (source.includes('requestIdleCallback')) {
          program.push({
            type: 'queue-task',
            task: {
              id: taskIdCounter.current++,
              type: 'idle',
              source: 'idle-callback',
              description: 'requestIdleCallback',
              priority: TASK_PRIORITIES.idle,
              timestamp: Date.now() + 400,
            },
          });
        }

        // Show priority order
        program.push({
          type: 'show-priority',
          priorities: ['script', 'microtask', 'macrotask', 'animation', 'idle'],
        });

        // Process queues in priority order
        ['script', 'microtask', 'macrotask', 'animation', 'idle'].forEach((queueType) => {
          program.push({ type: 'process-queue', queueType: queueType as TaskType });
        });

        compiledRef.current = { program };
        return compiledRef.current;
      } else {
        // DSL mode - parse instructions
        const lines = source.split('\n').filter((l) => l.trim() && !l.trim().startsWith('//'));
        const program: Instruction[] = [];

        for (const line of lines) {
          const [cmd, ...rest] = line.trim().split(/\s+/);
          if (cmd === 'queue-task') {
            const [id, type, source, ...descParts] = rest;
            const task: Task = {
              id: parseInt(id),
              type: type as TaskType,
              source: source as TaskSource,
              description: descParts.join(' ').replace(/"/g, ''),
              priority: TASK_PRIORITIES[type as TaskType],
              timestamp: Date.now(),
            };
            program.push({ type: 'queue-task', task });
          } else if (cmd === 'process-queue') {
            program.push({ type: 'process-queue', queueType: rest[0] as TaskType });
          } else if (cmd === 'execute-task') {
            const taskId = parseInt(rest[0]);
            // This would need to find the task by ID
            program.push({ type: 'execute-task', task: { id: taskId } as Task });
          } else if (cmd === 'show-priority') {
            program.push({ type: 'show-priority', priorities: rest as TaskType[] });
          }
        }

        compiledRef.current = { program };
        return compiledRef.current;
      }
    } catch (e) {
      log(`Task queues error: ${e instanceof Error ? e.message : String(e)}`, { kind: 'error' });
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
      if (ins.type === 'queue-task') {
        setTasks((tasks) => [...tasks, ins.task]);
        log(`Queued ${ins.task.type}: ${ins.task.description}`, { kind: 'info' });
      } else if (ins.type === 'process-queue') {
        setCurrentQueue(ins.queueType);
        log(`Processing ${ins.queueType} queue`, { kind: 'info' });
      } else if (ins.type === 'execute-task') {
        setProcessingTask(ins.task);
        log(`Executing task ${ins.task.id}: ${ins.task.description}`, { kind: 'log' });
        // Remove task after execution
        setTimeout(() => {
          setTasks((tasks) => tasks.filter((t) => t.id !== ins.task.id));
          setProcessingTask(undefined);
        }, 1000);
      } else if (ins.type === 'show-priority') {
        log(`Priority order: ${ins.priorities.join(' > ')}`, { kind: 'info' });
      }
    },
    getIntervalMs: (s) => (s === 'very-slow' ? 2000 : s === 'slow' ? 1200 : 600),
    onComplete: () => {
      setCurrentQueue(undefined);
      setProcessingTask(undefined);
      log('Task queue processing complete.', { kind: 'info' });
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
      title="Async Code"
      selectId="taskqueues-input-mode-select"
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
      placeholderJs="Write async JavaScript to see task queue prioritization"
      placeholderDsl="Use: queue-task, process-queue, execute-task, show-priority"
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
      {/* Priority Legend */}
      <div className="rounded-md border border-gray-300 p-3" style={{ height: '25%' }}>
        <h4 className="mb-2 text-sm font-semibold">Task Priority System</h4>
        <div className="grid grid-cols-5 gap-1 text-xs">
          {Object.entries(TASK_PRIORITIES).map(([type, priority]) => (
            <div
              key={type}
              className="rounded p-2 text-center"
              style={{
                backgroundColor: TASK_COLORS[type as TaskType] + '20',
                color: TASK_COLORS[type as TaskType],
              }}
            >
              <div className="font-semibold">
                {priority}. {type.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-600">
          <strong>Event Loop Rule:</strong> Execute all microtasks before processing next macrotask
        </div>
      </div>

      {/* Task Queues Visualization */}
      <div className="flex-1 rounded-md border border-gray-300">
        <div className="p-2">
          <h4 className="text-sm font-semibold">Task Queues & Processing Order</h4>
        </div>
        <div className="h-full">
          <TaskQueues2D tasks={tasks} currentQueue={currentQueue} processingTask={processingTask} />
        </div>
      </div>
    </div>
  );

  return (
    <section className="mb-4">
      <h2 className="text-base font-semibold">Task Queues & Priority System</h2>

      {/* Runtime Context Introduction */}
      <div className="mb-4 rounded-lg bg-amber-50 p-3">
        <h3 className="mb-2 text-sm font-semibold text-amber-900">Role in JavaScript Runtime</h3>
        <p className="mb-2 text-xs text-amber-800">
          Task Queues are the scheduling mechanism that manages when different types of asynchronous
          operations execute. The Runtime maintains multiple queues with different priorities, and
          the Event Loop processes them according to strict priority rules to ensure predictable
          execution order.
        </p>
        <p className="text-xs text-amber-700">
          <strong>Priority System:</strong> Script Tasks → Microtasks → Macrotasks → Animation
          Frames → Idle Tasks
        </p>
      </div>

      {/* Theory Section */}
      <div className="mb-3">
        <h3 className="mb-2 text-sm font-semibold">Queue Priority & Processing Rules</h3>
        <p className="mb-2 text-sm text-gray-700">
          The Event Loop follows strict priority rules when processing task queues. This ensures
          that critical operations like Promise resolutions happen before less critical operations
          like timer callbacks.
        </p>
        <div className="mb-2 grid grid-cols-1 gap-2 text-xs text-gray-600 md:grid-cols-2">
          <div>
            <strong>Queue Types:</strong>
            <ul className="ml-3 list-disc">
              <li>
                <strong>Script Tasks:</strong> Initial script execution
              </li>
              <li>
                <strong>Microtask Queue:</strong> Promise.then(), queueMicrotask()
              </li>
              <li>
                <strong>Macrotask Queue:</strong> setTimeout(), DOM events
              </li>
              <li>
                <strong>Animation Queue:</strong> requestAnimationFrame()
              </li>
            </ul>
          </div>
          <div>
            <strong>Processing Rules:</strong>
            <ul className="ml-3 list-disc">
              <li>Execute all synchronous script first</li>
              <li>Process ALL microtasks before next macrotask</li>
              <li>Process ONE macrotask per loop iteration</li>
              <li>Handle animation frames before rendering</li>
            </ul>
          </div>
        </div>
      </div>

      <ModeTabs mode={mode} onChange={setMode} />

      {mode === '2D' ? (
        <div className="mt-2">
          <TwoDLayout
            title="2D Visualization: Task Queues"
            editor={editor}
            output={outputPanel}
            canvas={canvas2D}
          />
        </div>
      ) : (
        <div className="mt-2 text-sm text-gray-600">
          3D visualization for Task Queues is coming soon.
        </div>
      )}
    </section>
  );
};

export default TaskQueues;
