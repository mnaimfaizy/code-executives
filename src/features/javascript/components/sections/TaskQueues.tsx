import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Clock,
  Code2,
  RefreshCw,
  Zap,
  Activity,
  GitMerge,
} from 'lucide-react';
import TwoDLayout from '../../../../components/TwoDLayout';
import { type Speed } from '../../../../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../../../../components/shared/OutputPanel';
import Editor from '../../../../components/shared/Editor';
import useRunner from '../../../../hooks/useRunner';

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

// ─── Color map ───────────────────────────────────────────────────────────────
const colorCls: Record<string, { bg: string; border: string; text: string; num: string }> = {
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', num: 'bg-red-600' },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    num: 'bg-green-600',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    num: 'bg-amber-500',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    num: 'bg-purple-600',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-800',
    num: 'bg-slate-500',
  },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', num: 'bg-blue-600' },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    num: 'bg-indigo-600',
  },
};

// ─── Queue type cards data ────────────────────────────────────────────────────
const queueCards = [
  {
    type: 'script',
    label: 'Script / Synchronous',
    color: 'red',
    priority: 1,
    icon: <Code2 className="w-5 h-5" />,
    description:
      'The initial execution of the script itself. All top-level synchronous code runs to completion before anything else. No queue — it runs immediately on the Call Stack.',
    sources: ['Top-level module code', 'Inline <script> tags', 'eval() calls'],
    rule: 'Runs first, cannot be deferred or interrupted.',
  },
  {
    type: 'microtask',
    label: 'Microtask Queue',
    color: 'green',
    priority: 2,
    icon: <Zap className="w-5 h-5" />,
    description:
      'The highest-priority async queue. Drained completely after every synchronous task — including newly enqueued microtasks added during drainage.',
    sources: [
      'Promise.then / catch / finally',
      'await continuations',
      'queueMicrotask()',
      'MutationObserver',
    ],
    rule: 'ALL microtasks drain before ANY macrotask runs.',
  },
  {
    type: 'macrotask',
    label: 'Macrotask Queue',
    color: 'amber',
    priority: 3,
    icon: <Clock className="w-5 h-5" />,
    description:
      'Lower-priority queue processed one task at a time. After each macrotask, the microtask queue is fully drained again before the next macrotask begins.',
    sources: [
      'setTimeout / setInterval',
      'setImmediate (Node.js)',
      'DOM event callbacks',
      'I/O callbacks',
      'MessageChannel',
    ],
    rule: 'ONE macrotask per event loop tick, then drain microtasks again.',
  },
  {
    type: 'animation',
    label: 'Animation Frame Queue',
    color: 'purple',
    priority: 4,
    icon: <RefreshCw className="w-5 h-5" />,
    description:
      'Browser-only queue that fires just before the browser repaints. Ideal for smooth visual updates — tied to the display refresh rate (~60 fps).',
    sources: ['requestAnimationFrame()', 'IntersectionObserver callbacks'],
    rule: 'Fires once per frame after microtasks, before the browser paints.',
  },
  {
    type: 'idle',
    label: 'Idle Callback Queue',
    color: 'slate',
    priority: 5,
    icon: <Activity className="w-5 h-5" />,
    description:
      'Lowest priority. Callbacks run only when the browser has free time between frames. Can be deferred indefinitely if the main thread stays busy.',
    sources: ['requestIdleCallback()'],
    rule: 'Only runs when the browser is idle. Do non-critical background work here.',
  },
];

// ─── Processing rules ─────────────────────────────────────────────────────────
const processingRules = [
  {
    step: '1',
    color: 'red',
    label: 'Run Sync Code',
    description: 'Execute all top-level synchronous code on the Call Stack to completion.',
    icon: <Code2 className="w-5 h-5" />,
  },
  {
    step: '2',
    color: 'green',
    label: 'Drain Microtasks',
    description: 'Process EVERY microtask, including ones queued during this drain.',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    step: '3',
    color: 'amber',
    label: 'One Macrotask',
    description: 'Pick exactly ONE macrotask from the queue and execute it.',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    step: '4',
    color: 'purple',
    label: 'Animation Frames',
    description: '(Browser) Run requestAnimationFrame callbacks before repainting.',
    icon: <RefreshCw className="w-5 h-5" />,
  },
  {
    step: '→',
    color: 'indigo',
    label: 'Repeat',
    description: 'Go back to step 2 — drain microtasks again before the next macrotask.',
    icon: <GitMerge className="w-5 h-5" />,
  },
];

// ─── Code scenarios ───────────────────────────────────────────────────────────
const scenarios = [
  {
    id: 'basic-priority',
    title: 'All Queue Types',
    description: 'See all five queue types fire in priority order in a single tick.',
    code: `console.log('1 sync start');

// Macrotask
setTimeout(() => console.log('5 macrotask: setTimeout'), 0);

// Microtasks
Promise.resolve().then(() => console.log('3 microtask: Promise.then'));
queueMicrotask(() => console.log('4 microtask: queueMicrotask'));

console.log('2 sync end');

// Output order:
// 1 sync start
// 2 sync end
// 3 microtask: Promise.then
// 4 microtask: queueMicrotask
// 5 macrotask: setTimeout`,
    output: [
      '1 sync start',
      '2 sync end',
      '3 microtask: Promise.then',
      '4 microtask: queueMicrotask',
      '5 macrotask: setTimeout',
    ],
    explanation:
      'Synchronous code always runs first. All microtasks (Promises, queueMicrotask) drain completely before the macrotask (setTimeout) fires — even with a 0 ms delay.',
  },
  {
    id: 'microtask-starvation',
    title: 'Microtask Starvation',
    description: 'Endless microtask chains prevent macrotasks from ever running.',
    code: `let count = 0;

function scheduleMicrotask() {
  if (count < 5) {
    count++;
    Promise.resolve().then(() => {
      console.log(\`microtask #\${count}\`);
      scheduleMicrotask(); // schedules another!
    });
  } else {
    console.log('microtasks done');
  }
}

setTimeout(() => console.log('macrotask (never starved here)'), 0);
scheduleMicrotask();

// Output:
// microtask #1 through #5 all run
// microtask #5
// microtasks done
// macrotask (never starved here)`,
    output: [
      'microtask #1',
      'microtask #2',
      'microtask #3',
      'microtask #4',
      'microtask #5',
      'microtasks done',
      'macrotask (never starved here)',
    ],
    explanation:
      'Each Promise.then() enqueues a new microtask during the drain pass. They ALL run before the setTimeout macrotask. In an infinite chain this would starve the macrotask queue entirely.',
  },
  {
    id: 'raf',
    title: 'requestAnimationFrame',
    description: 'rAF fires after microtasks but before the next frame paint.',
    code: `// rAF fires after all microtasks are drained,
// just before the browser repaints.

requestAnimationFrame(() => {
  console.log('3 rAF callback (before paint)');
});

Promise.resolve().then(() => {
  console.log('2 microtask: runs before rAF');
});

console.log('1 sync: runs first');

// Output:
// 1 sync: runs first
// 2 microtask: runs before rAF
// 3 rAF callback (before paint)`,
    output: ['1 sync: runs first', '2 microtask: runs before rAF', '3 rAF callback (before paint)'],
    explanation:
      'requestAnimationFrame is not a macrotask — it fires in a separate "animation frame" slot after microtasks drain, tied to the display refresh rate (~60 fps).',
  },
  {
    id: 'nested-macrotasks',
    title: 'Microtasks Between Macrotasks',
    description: 'Microtask queue is re-drained after EVERY macrotask.',
    code: `setTimeout(() => {
  console.log('macrotask 1');
  Promise.resolve().then(() => console.log('  micro after macro 1'));
}, 0);

setTimeout(() => {
  console.log('macrotask 2');
  Promise.resolve().then(() => console.log('  micro after macro 2'));
}, 0);

// Output:
// macrotask 1
//   micro after macro 1  ← drained before macrotask 2
// macrotask 2
//   micro after macro 2`,
    output: ['macrotask 1', '  micro after macro 1', 'macrotask 2', '  micro after macro 2'],
    explanation:
      'After macrotask 1 runs, the microtask queue is fully drained before macrotask 2 starts. This is why Promises scheduled inside setTimeout callbacks still run promptly.',
  },
];

// ─── Gotchas ──────────────────────────────────────────────────────────────────
const gotchas = [
  {
    title: 'Infinite microtask chain = frozen UI',
    severity: 'high',
    description:
      'If a microtask always enqueues another microtask, the event loop can never escape the microtask drain phase — the browser appears completely frozen with no rendering or input processing.',
    fix: 'Break long async chains with setTimeout(fn, 0) or requestIdleCallback() to yield control back to the browser between chunks of work.',
  },
  {
    title: 'Assuming setTimeout(fn, 0) is "immediate"',
    severity: 'medium',
    description:
      "Zero-delay timers are macrotasks. They always run after ALL pending microtasks AND after the browser has had the chance to render. They're also subject to a minimum ~4 ms browser clamp.",
    fix: 'Use queueMicrotask(fn) or Promise.resolve().then(fn) for near-immediate async scheduling. Use setTimeout for genuine deferred/background work.',
  },
  {
    title: 'DOM events fire as macrotasks',
    severity: 'medium',
    description:
      'Click, keydown, and other DOM event callbacks are macrotasks. If you queue a Promise inside a click handler, the .then() callback runs before the next DOM event — but after the current handler completes.',
    fix: 'This ordering is usually correct, but be mindful when mixing Promises and multiple event listeners on the same element.',
  },
  {
    title: 'Node.js process.nextTick vs Promise',
    severity: 'medium',
    description:
      'In Node.js, process.nextTick() callbacks run before Promise microtasks, at the end of the current operation — even before the regular microtask queue. This is a Node-specific priority above standard microtasks.',
    fix: 'Prefer Promise.resolve().then() for portable code. Reserve process.nextTick() only when you specifically need it to run before Promise callbacks.',
  },
];

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
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('js');
  const [source, setSource] = useState<string>(DEFAULT_JS);
  const [output, setOutput] = useState<OutputLine[]>([
    { text: 'Task queues ready.', kind: 'info' },
  ]);
  const [speed, setSpeed] = useState<Speed>('slow');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentQueue, setCurrentQueue] = useState<TaskType | undefined>();
  const [processingTask, setProcessingTask] = useState<Task | undefined>();
  const [activeScenario, setActiveScenario] = useState(0);
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
    <section className="mb-8">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-8 mb-8 border border-amber-200 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Task Queues &amp; Priority System
          </h1>
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            JavaScript's concurrency model relies on multiple task queues with strict priority
            rules. Understanding these queues — and the order the Event Loop processes them — is
            essential for writing predictable, high-performance async code.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              {
                label: 'Script (Sync)',
                cls: 'bg-red-100 text-red-800',
                icon: <Code2 className="w-4 h-4" />,
              },
              {
                label: 'Microtask Queue',
                cls: 'bg-green-100 text-green-800',
                icon: <Zap className="w-4 h-4" />,
              },
              {
                label: 'Macrotask Queue',
                cls: 'bg-amber-100 text-amber-800',
                icon: <Clock className="w-4 h-4" />,
              },
              {
                label: 'Animation Frames',
                cls: 'bg-purple-100 text-purple-800',
                icon: <RefreshCw className="w-4 h-4" />,
              },
              {
                label: 'Idle Callbacks',
                cls: 'bg-slate-100 text-slate-800',
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

      {/* ── How task queues work ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">How Task Queues Work</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">The Scheduling Mechanism</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              When JavaScript code triggers an asynchronous operation — a timer, a network request,
              a Promise resolution — the resulting callback doesn't execute immediately. Instead
              it's placed in a <strong>queue</strong> based on its type.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The Event Loop continuously checks these queues and moves callbacks onto the Call
              Stack when it's empty. The order in which queues are checked is determined by a strict{' '}
              <strong>priority hierarchy</strong> that JavaScript engines implement consistently
              across browsers and runtimes.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Priority Hierarchy</h3>
            <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
              <div className="space-y-2">
                {[
                  {
                    n: '1',
                    label: 'Script (Sync)',
                    sub: 'Runs immediately — no queue',
                    color: 'red',
                  },
                  {
                    n: '2',
                    label: 'Microtasks',
                    sub: 'ALL drain before any macrotask',
                    color: 'green',
                  },
                  { n: '3', label: 'Macrotasks', sub: 'ONE per loop tick', color: 'amber' },
                  {
                    n: '4',
                    label: 'Animation Frames',
                    sub: 'Before browser paint',
                    color: 'purple',
                  },
                  {
                    n: '5',
                    label: 'Idle Callbacks',
                    sub: 'Only when browser is free',
                    color: 'slate',
                  },
                ].map(({ n, label, sub, color }) => {
                  const c = colorCls[color];
                  return (
                    <div
                      key={label}
                      className={`flex items-center gap-3 ${c.bg} ${c.border} border rounded-lg p-2.5`}
                    >
                      <span
                        className={`w-6 h-6 ${c.num} text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0`}
                      >
                        {n}
                      </span>
                      <div>
                        <span className={`font-semibold ${c.text} text-sm`}>{label}</span>
                        <span className="text-gray-500 text-xs ml-2">— {sub}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Processing rules timeline */}
        <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-5">The Processing Rules</h3>
          <div className="flex flex-wrap gap-3">
            {processingRules.map(({ step, label, color, description, icon }) => {
              const c = colorCls[color];
              return (
                <div
                  key={step}
                  className={`flex-1 min-w-36 ${c.bg} ${c.border} border rounded-xl p-4`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-7 h-7 ${c.num} text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0`}
                    >
                      {step}
                    </span>
                    <span className={`font-semibold ${c.text} text-sm`}>{label}</span>
                  </div>
                  <div className={`${c.text} mb-1`}>{icon}</div>
                  <p className="text-xs text-gray-600">{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Queue types deep-dive ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Queue Types in Detail</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {queueCards.map((q) => {
            const c = colorCls[q.color];
            return (
              <div
                key={q.type}
                className={`${c.bg} ${c.border} border rounded-xl p-5 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`w-9 h-9 ${c.num} text-white rounded-lg flex items-center justify-center shrink-0`}
                  >
                    {q.icon}
                  </span>
                  <div>
                    <h3 className={`font-semibold ${c.text} text-base`}>{q.label}</h3>
                    <span
                      className={`text-xs font-bold ${c.num.replace('bg-', 'text-')} px-1.5 py-0.5 rounded ${c.bg}`}
                    >
                      Priority {q.priority}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{q.description}</p>
                <div className="bg-white rounded-lg p-3 border border-gray-200 mb-2">
                  <div className={`text-xs font-semibold ${c.text} mb-1.5`}>Sources:</div>
                  <ul className="space-y-0.5">
                    {q.sources.map((s) => (
                      <li key={s} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" />
                        <code className="font-mono">{s}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className={`text-xs font-medium ${c.text} italic`}>{q.rule}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Code scenarios ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          <Code2 className="inline w-7 h-7 mr-2 text-amber-600" />
          Execution Order Scenarios
        </h2>
        <p className="text-gray-600 mb-6">
          Choose a scenario to see the exact console output order and understand which queue each
          callback belongs to.
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(i)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeScenario === i
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-gray-800 text-sm">
                {scenarios[activeScenario].title}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{scenarios[activeScenario].description}</p>
            <pre className="bg-gray-900 text-green-400 rounded-xl p-5 text-xs overflow-x-auto leading-relaxed font-mono">
              {scenarios[activeScenario].code}
            </pre>
          </div>
          <div>
            <div className="font-semibold text-gray-800 text-sm mb-3">
              Console Output (in order)
            </div>
            <div className="space-y-2 mb-4">
              {scenarios[activeScenario].output.map((line, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
                >
                  <span className="w-5 h-5 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </span>
                  <code className="text-sm text-gray-800 font-mono">{line}</code>
                </div>
              ))}
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>Why this order?</strong> {scenarios[activeScenario].explanation}
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive 2D Visualization ───────────────────────────────────── */}
      <div className="mb-8">
        <TwoDLayout
          title="2D Visualization: Task Queues"
          editor={editor}
          output={outputPanel}
          canvas={canvas2D}
        />
      </div>

      {/* ── Common Gotchas ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          <AlertTriangle className="inline w-7 h-7 mr-2 text-amber-500" />
          Common Gotchas
        </h2>
        <p className="text-gray-600 mb-6">
          These are the task-queue pitfalls that cause subtle bugs and unexpected execution
          ordering.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {gotchas.map((g) => (
            <div
              key={g.title}
              className={`border rounded-xl p-5 ${
                g.severity === 'high' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
              }`}
            >
              <div className="flex items-start gap-3 mb-2">
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    g.severity === 'high' ? 'text-red-500' : 'text-amber-500'
                  }`}
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{g.title}</h3>
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      g.severity === 'high'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-amber-200 text-amber-800'
                    }`}
                  >
                    {g.severity} severity
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">{g.description}</p>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <span className="text-xs font-semibold text-green-700">Fix: </span>
                <span className="text-xs text-gray-700">{g.fix}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TaskQueues;
