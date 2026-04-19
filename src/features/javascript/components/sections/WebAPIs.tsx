import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Code2,
  Globe,
  HardDrive,
  Monitor,
  Network,
  Server,
  Shield,
  Timer,
  Layers,
  ArrowRight,
} from 'lucide-react';
import TwoDLayout from '../../../../components/TwoDLayout';
import { type Speed } from '../../../../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../../../../components/shared/OutputPanel';
import Editor from '../../../../components/shared/Editor';
import useRunner from '../../../../hooks/useRunner';

type RuntimeEnvironment = 'browser' | 'node' | 'deno' | 'bun';
type APICategory = 'dom' | 'timing' | 'network' | 'storage' | 'media' | 'system';

type WebAPI = {
  name: string;
  category: APICategory;
  environment: RuntimeEnvironment[];
  description: string;
  example: string;
  color: string;
};

type Instruction =
  | { type: 'select-environment'; environment: RuntimeEnvironment }
  | { type: 'highlight-api'; api: string }
  | { type: 'call-api'; api: string; environment: RuntimeEnvironment; result: string }
  | { type: 'show-integration'; api: string; integration: string };

type Compiled = { program: Instruction[] };

const WEB_APIS: WebAPI[] = [
  // Browser APIs
  {
    name: 'DOM API',
    category: 'dom',
    environment: ['browser'],
    description: 'Manipulate HTML document structure and elements',
    example: "document.querySelector('#app')",
    color: '#3b82f6',
  },
  {
    name: 'Fetch API',
    category: 'network',
    environment: ['browser', 'deno'],
    description: 'Make HTTP requests for data fetching',
    example: "fetch('/api/data')",
    color: '#10b981',
  },
  {
    name: 'Timer APIs',
    category: 'timing',
    environment: ['browser', 'node', 'deno', 'bun'],
    description: 'Schedule delayed or repeated function execution',
    example: 'setTimeout(callback, 1000)',
    color: '#f59e0b',
  },
  {
    name: 'LocalStorage',
    category: 'storage',
    environment: ['browser'],
    description: 'Store data persistently in browser',
    example: "localStorage.setItem('key', 'value')",
    color: '#8b5cf6',
  },
  {
    name: 'WebGL API',
    category: 'media',
    environment: ['browser'],
    description: '3D graphics rendering in web browsers',
    example: "canvas.getContext('webgl')",
    color: '#ef4444',
  },

  // Node.js APIs
  {
    name: 'File System',
    category: 'system',
    environment: ['node', 'deno', 'bun'],
    description: 'Read and write files on the filesystem',
    example: "fs.readFile('data.txt')",
    color: '#22c55e',
  },
  {
    name: 'HTTP Server',
    category: 'network',
    environment: ['node', 'deno', 'bun'],
    description: 'Create HTTP servers and handle requests',
    example: 'http.createServer(handler)',
    color: '#14b8a6',
  },
  {
    name: 'Process APIs',
    category: 'system',
    environment: ['node', 'bun'],
    description: 'Access process information and environment',
    example: 'process.env.NODE_ENV',
    color: '#64748b',
  },

  // Deno APIs
  {
    name: 'Deno.readTextFile',
    category: 'system',
    environment: ['deno'],
    description: 'Secure file reading with permissions',
    example: "await Deno.readTextFile('./file.txt')",
    color: '#7c3aed',
  },

  // Bun APIs
  {
    name: 'Bun.file',
    category: 'system',
    environment: ['bun'],
    description: 'Fast file operations with native performance',
    example: "Bun.file('package.json')",
    color: '#f97316',
  },
];

const ENVIRONMENT_COLORS = {
  browser: '#3b82f6',
  node: '#22c55e',
  deno: '#8b5cf6',
  bun: '#f59e0b',
};

const DEFAULT_JS = `// Web APIs in different runtime environments

// Browser-specific APIs
if (typeof window !== 'undefined') {
  // DOM manipulation
  const element = document.getElementById('app');
  
  // Fetch API for network requests
  fetch('/api/users')
    .then(response => response.json())
    .then(data => console.log('Users:', data));
  
  // Local storage for persistence
  localStorage.setItem('theme', 'dark');
  
  // Timer APIs (available in all environments)
  setTimeout(() => {
    console.log('Timer executed in browser');
  }, 1000);
}

// Node.js-specific APIs  
if (typeof process !== 'undefined') {
  const fs = require('fs');
  const http = require('http');
  
  // File system operations
  fs.readFile('package.json', 'utf8', (err, data) => {
    if (!err) console.log('Package data:', data);
  });
  
  // HTTP server creation
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello from Node.js!');
  });
}

// Universal APIs (work across runtimes)
console.log('This works in all JavaScript runtimes');`;

const DEFAULT_DSL = `// Web APIs demonstration DSL
// select-environment <environment>
// highlight-api <api-name>
// call-api <api-name> <environment> <result>
// show-integration <api-name> <integration-description>

select-environment browser
highlight-api "DOM API"
call-api "DOM API" browser "element-selected"
show-integration "DOM API" "DOM-changes-trigger-rerender"

select-environment node
highlight-api "File System"
call-api "File System" node "file-read-complete"
show-integration "File System" "async-IO-via-libuv"`;

// ─── API Lifecycle steps ────────────────────────────────────────────────────
const apiLifecycleSteps = [
  {
    step: '1',
    label: 'JS Call',
    color: 'indigo',
    description: 'JavaScript code calls a Web API (e.g. fetch(), setTimeout()).',
  },
  {
    step: '2',
    label: 'Handed Off',
    color: 'blue',
    description: 'The call is handed to the Runtime environment — not the JS Engine.',
  },
  {
    step: '3',
    label: 'Platform Work',
    color: 'teal',
    description: 'The OS/Browser handles the I/O, timer, or network operation natively.',
  },
  {
    step: '4',
    label: 'Callback Queued',
    color: 'amber',
    description: 'On completion, the callback is pushed onto the Task Queue.',
  },
  {
    step: '5',
    label: 'Event Loop',
    color: 'green',
    description: 'The Event Loop picks up the callback when the Call Stack is empty.',
  },
];

// ─── API category cards ──────────────────────────────────────────────────────
const apiCategories = [
  {
    id: 'dom',
    label: 'DOM API',
    color: 'blue',
    icon: <Monitor className="w-5 h-5" />,
    envs: ['browser'],
    description:
      'Provides a structured, tree-based representation of HTML/XML documents. Every element, attribute, and text node can be read and manipulated programmatically.',
    examples: ['document.querySelector()', 'element.addEventListener()', 'node.appendChild()'],
    detail: 'Triggers synchronous rendering re-calculations; batch updates with DocumentFragment.',
  },
  {
    id: 'network',
    label: 'Network APIs',
    color: 'green',
    icon: <Network className="w-5 h-5" />,
    envs: ['browser', 'deno', 'node (v18+)'],
    description:
      'Enable asynchronous HTTP communication. fetch() returns a Promise and feeds callbacks through the microtask queue when the response arrives.',
    examples: ['fetch(url)', 'XMLHttpRequest', 'WebSocket'],
    detail:
      'All network callbacks are async — the engine continues executing synchronous code while the request is in-flight.',
  },
  {
    id: 'timing',
    label: 'Timer APIs',
    color: 'amber',
    icon: <Timer className="w-5 h-5" />,
    envs: ['browser', 'node', 'deno', 'bun'],
    description:
      'Schedule code to run after a delay or at a recurring interval. Timers are macrotasks — they always run after all pending microtasks drain.',
    examples: ['setTimeout(fn, ms)', 'setInterval(fn, ms)', 'clearTimeout(id)'],
    detail:
      'Browsers enforce a minimum ~4 ms clamp even for setTimeout(fn, 0). Use queueMicrotask() for near-immediate async execution.',
  },
  {
    id: 'storage',
    label: 'Storage APIs',
    color: 'purple',
    icon: <HardDrive className="w-5 h-5" />,
    envs: ['browser'],
    description:
      'Persist data on the client side across page loads. localStorage is synchronous and blocks the main thread; IndexedDB is fully asynchronous.',
    examples: ['localStorage.setItem()', 'sessionStorage.getItem()', 'indexedDB.open()'],
    detail:
      'Prefer IndexedDB or the Cache API for large datasets. Synchronous localStorage reads block the event loop.',
  },
  {
    id: 'system',
    label: 'System APIs',
    color: 'emerald',
    icon: <Server className="w-5 h-5" />,
    envs: ['node', 'deno', 'bun'],
    description:
      'Server-side runtimes expose file system, process, and stream APIs. All I/O operations go through libuv (Node) or equivalent async I/O layers.',
    examples: ['fs.readFile()', 'process.env', 'http.createServer()'],
    detail:
      "Non-blocking I/O via libuv thread pool means file reads don't stall the JS event loop.",
  },
  {
    id: 'security',
    label: 'Security & Permissions',
    color: 'red',
    icon: <Shield className="w-5 h-5" />,
    envs: ['browser', 'deno'],
    description:
      'APIs operate within a security sandbox. Browsers enforce same-origin policy and CORS. Deno requires explicit capability flags for each API category.',
    examples: ['CORS headers', 'Content-Security-Policy', 'Deno --allow-net'],
    detail: 'Never expose server-side API keys through browser-accessible Web API calls.',
  },
];

const colorCls: Record<string, { bg: string; border: string; text: string; num: string }> = {
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    num: 'bg-indigo-600',
  },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', num: 'bg-blue-600' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', num: 'bg-teal-600' },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    num: 'bg-amber-500',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    num: 'bg-green-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    num: 'bg-purple-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    num: 'bg-emerald-600',
  },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', num: 'bg-red-600' },
};

// ─── Environments comparison ──────────────────────────────────────────────────
const environments = [
  {
    id: 'browser' as RuntimeEnvironment,
    label: 'Browser',
    color: '#3b82f6',
    colorCls: 'blue',
    icon: <Globe className="w-5 h-5" />,
    tagline: 'User-facing UI & web interactions',
    apis: ['DOM API', 'Fetch API', 'Timer APIs', 'LocalStorage', 'WebGL / Canvas', 'WebSockets'],
    missing: ['File System', 'HTTP Server', 'Process APIs'],
  },
  {
    id: 'node' as RuntimeEnvironment,
    label: 'Node.js',
    color: '#22c55e',
    colorCls: 'green',
    icon: <Server className="w-5 h-5" />,
    tagline: 'Server-side JavaScript with libuv I/O',
    apis: ['File System', 'HTTP/HTTPS', 'Process APIs', 'Streams', 'Timer APIs', 'Crypto'],
    missing: ['DOM API', 'LocalStorage', 'WebGL'],
  },
  {
    id: 'deno' as RuntimeEnvironment,
    label: 'Deno',
    color: '#8b5cf6',
    colorCls: 'purple',
    icon: <Shield className="w-5 h-5" />,
    tagline: 'Secure-by-default with permission flags',
    apis: [
      'Fetch API (built-in)',
      'Deno.readTextFile()',
      'Timer APIs',
      'WebSockets',
      'Streams API',
    ],
    missing: ['DOM API', 'require() / CommonJS'],
  },
  {
    id: 'bun' as RuntimeEnvironment,
    label: 'Bun',
    color: '#f59e0b',
    colorCls: 'amber',
    icon: <Layers className="w-5 h-5" />,
    tagline: 'Fast all-in-one JS runtime & bundler',
    apis: ['Bun.file()', 'Fetch API', 'Timer APIs', 'SQLite (built-in)', 'HTTP Server'],
    missing: ['DOM API', 'Deno-style permissions'],
  },
];

// ─── Code scenarios ───────────────────────────────────────────────────────────
const scenarios = [
  {
    id: 'fetch',
    title: 'Fetch API',
    description: 'fetch() is async and non-blocking — it hands the request to the Runtime.',
    env: 'Browser / Deno / Node 18+',
    code: `// Fetch is handed to the browser's network layer.
// JS engine continues executing while request is in-flight.

console.log('1 – before fetch');

fetch('https://api.example.com/users')
  .then(res => res.json())          // microtask when response arrives
  .then(data => {
    console.log('3 – data:', data); // microtask (chained .then)
  });

console.log('2 – after fetch (sync continues!)');

// Console output:
// 1 – before fetch
// 2 – after fetch (sync continues!)
// 3 – data: [...]  ← arrives later via microtask`,
    output: ['1 – before fetch', '2 – after fetch (sync continues!)', '3 – data: [...]'],
    note: 'fetch() immediately returns a Promise. The network I/O happens off the JS thread. .then() callbacks arrive as microtasks when the response resolves.',
  },
  {
    id: 'timer',
    title: 'Timer APIs',
    description: 'setTimeout callbacks are macrotasks — they run after all microtasks drain.',
    env: 'All Runtimes',
    code: `// setTimeout is a macrotask — it runs after microtasks.
console.log('sync: start');

setTimeout(() => console.log('macro: timeout'), 0);

Promise.resolve().then(() => console.log('micro: promise'));

console.log('sync: end');

// Console output:
// sync: start
// sync: end
// micro: promise   ← microtask runs first
// macro: timeout   ← macrotask runs last`,
    output: ['sync: start', 'sync: end', 'micro: promise', 'macro: timeout'],
    note: 'Even with a 0 ms delay, setTimeout is a macrotask and will always run after all pending microtasks (Promises) are drained.',
  },
  {
    id: 'dom',
    title: 'DOM API',
    description: 'DOM manipulation is synchronous — changes reflect immediately in the JS context.',
    env: 'Browser only',
    code: `// DOM reads/writes are synchronous in JavaScript,
// but rendering (painting) is batched by the browser.

const el = document.getElementById('app');
el.textContent = 'Hello, World!'; // synchronous

// Reading layout properties forces synchronous reflow
const height = el.offsetHeight;   // forces layout recalc

// Multiple writes before read = browser batches them
el.style.color = 'red';           // write
el.style.fontSize = '24px';       // write
// Both writes are painted in a single browser frame

console.log('DOM update complete');`,
    output: ['DOM update complete'],
    note: 'Writing to the DOM is synchronous in JS, but the browser batches visual repaints. Reading layout properties (offsetHeight, getBoundingClientRect) forces a synchronous layout recalculation — avoid alternating reads and writes in loops.',
  },
  {
    id: 'fs',
    title: 'File System (Node.js)',
    description: 'File I/O is handled by libuv — non-blocking in the async form.',
    env: 'Node.js / Deno / Bun',
    code: `const fs = require('fs');

console.log('1 – before readFile');

// Async version: callback is queued as a macrotask
fs.readFile('package.json', 'utf8', (err, data) => {
  if (err) throw err;
  console.log('3 – file contents received');
  console.log('   size:', data.length, 'chars');
});

console.log('2 – after readFile (non-blocking)');

// Console output:
// 1 – before readFile
// 2 – after readFile (non-blocking)
// 3 – file contents received  ← I/O callback via event loop`,
    output: [
      '1 – before readFile',
      '2 – after readFile (non-blocking)',
      '3 – file contents received',
    ],
    note: "fs.readFile() uses libuv's thread pool for I/O — the JS event loop is never blocked. The callback arrives as a macrotask once the OS completes the read.",
  },
];

// ─── Gotchas ──────────────────────────────────────────────────────────────────
const gotchas = [
  {
    title: 'CORS blocks cross-origin Fetch',
    severity: 'high',
    description:
      "By default, browsers block fetch() responses from different origins unless the server sends the correct Access-Control-Allow-Origin header. This is a browser security policy — it doesn't apply in Node.js.",
    fix: 'Configure CORS headers on your server, or use a proxy for development. Never disable CORS entirely in production.',
  },
  {
    title: 'API availability varies by runtime',
    severity: 'medium',
    description:
      "Code using document, window, or localStorage will throw ReferenceError in Node.js. Conversely, require() and process.env don't exist in browsers. Always guard environment-specific API calls.",
    fix: "Check typeof window !== 'undefined' for browser APIs, or use runtime detection libraries. Better yet, design isomorphic code that uses only universal APIs.",
  },
  {
    title: 'Synchronous localStorage blocks the thread',
    severity: 'medium',
    description:
      'localStorage.getItem() is synchronous and runs on the main thread. Large reads or frequent writes cause measurable jank. The API was designed for small key-value pairs.',
    fix: 'Use IndexedDB (via idb wrapper) or the Origin Private File System for large data. Defer expensive storage operations with requestIdleCallback.',
  },
  {
    title: "setTimeout(fn, 0) isn't immediate",
    severity: 'low',
    description:
      'A 0 ms setTimeout is still a macrotask — it runs after all pending microtasks AND after the browser has had the chance to render. In practice browsers clamp it to a minimum of ~4 ms.',
    fix: 'Use queueMicrotask(fn) or Promise.resolve().then(fn) when you need truly near-immediate async scheduling.',
  },
];

// Web APIs Architecture Visualization
const WebAPIs2D: React.FC<{
  selectedEnvironment?: RuntimeEnvironment;
  highlightedAPI?: string;
  activeAPIs?: WebAPI[];
}> = ({ selectedEnvironment, highlightedAPI, activeAPIs = [] }) => {
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

    // Draw environment header
    if (selectedEnvironment) {
      const envColor = ENVIRONMENT_COLORS[selectedEnvironment];
      ctx.fillStyle = envColor;
      ctx.fillRect(0, 0, width, 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${selectedEnvironment.toUpperCase()} Runtime Environment`, width / 2, 25);
    }

    // Draw runtime architecture
    const runtimeY = 60;
    const runtimeHeight = 80;

    // JavaScript Engine box
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(50, runtimeY, 150, runtimeHeight);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, runtimeY, 150, runtimeHeight);

    ctx.fillStyle = '#1e293b';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JavaScript Engine', 125, runtimeY + 25);
    ctx.font = '11px sans-serif';
    ctx.fillText('(V8, SpiderMonkey)', 125, runtimeY + 40);
    ctx.fillText('Call Stack + Heap', 125, runtimeY + 55);

    // Web APIs box
    ctx.fillStyle = selectedEnvironment
      ? ENVIRONMENT_COLORS[selectedEnvironment] + '20'
      : '#f1f5f9';
    ctx.fillRect(250, runtimeY, 150, runtimeHeight);
    ctx.strokeStyle = selectedEnvironment ? ENVIRONMENT_COLORS[selectedEnvironment] : '#64748b';
    ctx.strokeRect(250, runtimeY, 150, runtimeHeight);

    ctx.fillStyle = '#1e293b';
    ctx.font = '14px sans-serif';
    ctx.fillText('Web APIs', 325, runtimeY + 25);
    ctx.font = '11px sans-serif';
    ctx.fillText('Runtime Environment', 325, runtimeY + 40);
    ctx.fillText('Platform APIs', 325, runtimeY + 55);

    // Event Loop connector
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, runtimeY + runtimeHeight / 2);
    ctx.lineTo(250, runtimeY + runtimeHeight / 2);
    ctx.stroke();

    // Arrow
    ctx.beginPath();
    ctx.moveTo(240, runtimeY + runtimeHeight / 2 - 5);
    ctx.lineTo(250, runtimeY + runtimeHeight / 2);
    ctx.lineTo(240, runtimeY + runtimeHeight / 2 + 5);
    ctx.stroke();

    // Draw available APIs for selected environment
    if (selectedEnvironment) {
      const availableAPIs = WEB_APIS.filter((api) => api.environment.includes(selectedEnvironment));
      const startY = runtimeY + runtimeHeight + 30;

      ctx.fillStyle = '#1e293b';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Available APIs in ${selectedEnvironment}:`, 20, startY);

      availableAPIs.forEach((api, index) => {
        const y = startY + 30 + index * 35;
        const isHighlighted = highlightedAPI === api.name;

        // API box
        ctx.fillStyle = isHighlighted ? api.color : api.color + '40';
        ctx.fillRect(20, y - 15, width - 40, 25);

        ctx.strokeStyle = api.color;
        ctx.lineWidth = isHighlighted ? 3 : 1;
        ctx.strokeRect(20, y - 15, width - 40, 25);

        // API name
        ctx.fillStyle = isHighlighted ? '#ffffff' : '#1e293b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(api.name, 30, y - 2);

        // API description
        ctx.fillStyle = isHighlighted ? '#f1f5f9' : '#64748b';
        ctx.font = '10px sans-serif';
        ctx.fillText(api.description, 30, y + 8);

        // Category badge
        ctx.fillStyle = api.color;
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(api.category.toUpperCase(), width - 30, y - 2);
      });
    }

    // Draw integration flow if API is highlighted
    if (highlightedAPI && selectedEnvironment) {
      const api = WEB_APIS.find((a) => a.name === highlightedAPI);
      if (api) {
        const flowY = height - 60;

        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(10, flowY - 10, width - 20, 50);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, flowY - 10, width - 20, 50);

        ctx.fillStyle = '#92400e';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Integration Flow:`, 20, flowY + 5);
        ctx.fillText(
          `JavaScript Code → ${api.name} → ${selectedEnvironment} Runtime → System/Browser`,
          20,
          flowY + 20
        );

        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#78350f';
        ctx.fillText(`Example: ${api.example}`, 20, flowY + 32);
      }
    }
  }, [selectedEnvironment, highlightedAPI, activeAPIs]);

  return (
    <canvas ref={canvasRef} className="h-full w-full" style={{ width: '100%', height: '100%' }} />
  );
};

const WebAPIs: React.FC = () => {
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('js');
  const [source, setSource] = useState<string>(DEFAULT_JS);
  const [output, setOutput] = useState<OutputLine[]>([{ text: 'Web APIs ready.', kind: 'info' }]);
  const [speed, setSpeed] = useState<Speed>('slow');
  const [selectedEnvironment, setSelectedEnvironment] = useState<RuntimeEnvironment>('browser');
  const [highlightedAPI, setHighlightedAPI] = useState<string>('');
  const [activeAPIs, setActiveAPIs] = useState<WebAPI[]>([]);
  const [activeScenario, setActiveScenario] = useState(0);
  const compiledRef = useRef<Compiled | null>(null);

  const log = (msg: string, opts?: { kind?: OutputLine['kind'] }) =>
    setOutput((o) => [...o, { text: msg, kind: opts?.kind }]);

  const reset = () => {
    setSelectedEnvironment('browser');
    setHighlightedAPI('');
    setActiveAPIs([]);
    setOutput([{ text: 'Web APIs reset.', kind: 'info' }]);
    compiledRef.current = null;
  };

  const ensureCompiled = (): Compiled => {
    if (compiledRef.current) return compiledRef.current;

    try {
      if (inputMode === 'js') {
        // Analyze JavaScript code for API usage
        const program: Instruction[] = [];

        // Detect environment
        if (source.includes('window') || source.includes('document')) {
          program.push({ type: 'select-environment', environment: 'browser' });
        } else if (source.includes('process') || source.includes('require')) {
          program.push({ type: 'select-environment', environment: 'node' });
        }

        // Detect API calls
        const apiDetections = [
          { regex: /document\.|DOM/, api: 'DOM API' },
          { regex: /fetch\(/, api: 'Fetch API' },
          { regex: /setTimeout|setInterval/, api: 'Timer APIs' },
          { regex: /localStorage|sessionStorage/, api: 'LocalStorage' },
          { regex: /fs\.|readFile|writeFile/, api: 'File System' },
          { regex: /http\.|createServer/, api: 'HTTP Server' },
          { regex: /process\./, api: 'Process APIs' },
        ];

        apiDetections.forEach(({ regex, api }) => {
          if (regex.test(source)) {
            program.push({ type: 'highlight-api', api });
            const env =
              api.includes('DOM') || api.includes('Fetch') || api.includes('Storage')
                ? 'browser'
                : 'node';
            program.push({ type: 'call-api', api, environment: env, result: 'executed' });
          }
        });

        compiledRef.current = { program };
        return compiledRef.current;
      } else {
        // DSL mode - parse instructions
        const lines = source.split('\n').filter((l) => l.trim() && !l.trim().startsWith('//'));
        const program: Instruction[] = [];

        for (const line of lines) {
          const [cmd, ...rest] = line.trim().split(/\s+/);
          if (cmd === 'select-environment') {
            program.push({
              type: 'select-environment',
              environment: rest[0] as RuntimeEnvironment,
            });
          } else if (cmd === 'highlight-api') {
            const api = rest.join(' ').replace(/"/g, '');
            program.push({ type: 'highlight-api', api });
          } else if (cmd === 'call-api') {
            const api = rest[0].replace(/"/g, '');
            const environment = rest[1] as RuntimeEnvironment;
            const result = rest[2];
            program.push({ type: 'call-api', api, environment, result });
          } else if (cmd === 'show-integration') {
            const api = rest[0].replace(/"/g, '');
            const integration = rest.slice(1).join(' ').replace(/"/g, '');
            program.push({ type: 'show-integration', api, integration });
          }
        }

        compiledRef.current = { program };
        return compiledRef.current;
      }
    } catch (e) {
      log(`Web APIs error: ${e instanceof Error ? e.message : String(e)}`, { kind: 'error' });
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
      if (ins.type === 'select-environment') {
        setSelectedEnvironment(ins.environment);
        log(`Selected ${ins.environment} runtime environment`, { kind: 'info' });
      } else if (ins.type === 'highlight-api') {
        setHighlightedAPI(ins.api);
        log(`Highlighted API: ${ins.api}`, { kind: 'info' });
      } else if (ins.type === 'call-api') {
        log(`${ins.environment}: ${ins.api} → ${ins.result}`, { kind: 'log' });
      } else if (ins.type === 'show-integration') {
        log(`Integration: ${ins.api} - ${ins.integration}`, { kind: 'info' });
      }
    },
    getIntervalMs: (s) => (s === 'very-slow' ? 2000 : s === 'slow' ? 1200 : 600),
    onComplete: () => {
      log('Web APIs demonstration complete.', { kind: 'info' });
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
      selectId="webapis-input-mode-select"
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
      placeholderJs="Write JavaScript to see Web APIs in different runtime environments"
      placeholderDsl="Use: select-environment, highlight-api, call-api, show-integration"
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
      {/* Environment Selector */}
      <div className="rounded-md border border-gray-300 p-3" style={{ height: '20%' }}>
        <h4 className="mb-2 text-sm font-semibold">Runtime Environment</h4>
        <div className="flex gap-2">
          {Object.entries(ENVIRONMENT_COLORS).map(([env, color]) => (
            <button
              key={env}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                selectedEnvironment === env ? 'text-white' : 'text-gray-700'
              }`}
              style={{
                backgroundColor: selectedEnvironment === env ? color : color + '20',
                border: `1px solid ${color}`,
              }}
              onClick={() => setSelectedEnvironment(env as RuntimeEnvironment)}
            >
              {env.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Web APIs Visualization */}
      <div className="flex-1 rounded-md border border-gray-300">
        <div className="p-2">
          <h4 className="text-sm font-semibold">Web APIs Architecture</h4>
        </div>
        <div className="h-full">
          <WebAPIs2D
            selectedEnvironment={selectedEnvironment}
            highlightedAPI={highlightedAPI}
            activeAPIs={activeAPIs}
          />
        </div>
      </div>
    </div>
  );

  return (
    <section className="mb-8">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-8 mb-8 border border-emerald-200 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Web APIs &amp; Runtime Integration
          </h1>
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            Web APIs are the bridge between JavaScript code and the underlying platform. Provided by
            the <strong>Runtime environment</strong> — not the engine — they give JS access to the
            DOM, network, file system, timers, and more through standardized async interfaces.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              {
                label: 'DOM API',
                cls: 'bg-blue-100 text-blue-800',
                icon: <Monitor className="w-4 h-4" />,
              },
              {
                label: 'Fetch API',
                cls: 'bg-green-100 text-green-800',
                icon: <Network className="w-4 h-4" />,
              },
              {
                label: 'Timer APIs',
                cls: 'bg-amber-100 text-amber-800',
                icon: <Timer className="w-4 h-4" />,
              },
              {
                label: 'File System',
                cls: 'bg-emerald-100 text-emerald-800',
                icon: <HardDrive className="w-4 h-4" />,
              },
              {
                label: 'Storage APIs',
                cls: 'bg-purple-100 text-purple-800',
                icon: <HardDrive className="w-4 h-4" />,
              },
              {
                label: 'Security Sandbox',
                cls: 'bg-red-100 text-red-800',
                icon: <Shield className="w-4 h-4" />,
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

      {/* ── How Web APIs work ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">How Web APIs Work</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Outside the Engine</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              The JavaScript Engine (V8, SpiderMonkey) only understands pure JavaScript — it has no
              concept of the DOM, HTTP, or the file system. Web APIs are provided by the{' '}
              <strong>host environment</strong> (browser, Node.js, Deno) through bindings exposed to
              JS code.
            </p>
            <p className="text-gray-700 leading-relaxed">
              When JavaScript calls <code className="bg-gray-100 px-1 rounded">fetch()</code> or{' '}
              <code className="bg-gray-100 px-1 rounded">setTimeout()</code>, the work is
              <strong> delegated to the runtime</strong>, which uses native OS threads or browser
              internals. The JS thread remains free to continue executing synchronous code.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Runtime Architecture</h3>
            <div className="bg-linear-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
              {/* Architecture mini-diagram */}
              <div className="flex items-stretch gap-2 text-xs">
                <div className="flex-1 bg-indigo-100 border border-indigo-300 rounded-lg p-3 text-center">
                  <div className="font-bold text-indigo-800 mb-1">JS Engine</div>
                  <div className="text-indigo-700">V8 / SpiderMonkey</div>
                  <div className="text-indigo-600 mt-1">Call Stack + Heap</div>
                </div>
                <div className="flex items-center text-gray-400">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div className="flex-1 bg-emerald-100 border border-emerald-300 rounded-lg p-3 text-center">
                  <div className="font-bold text-emerald-800 mb-1">Web APIs</div>
                  <div className="text-emerald-700">Runtime layer</div>
                  <div className="text-emerald-600 mt-1">DOM · Fetch · Timers</div>
                </div>
                <div className="flex items-center text-gray-400">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div className="flex-1 bg-amber-100 border border-amber-300 rounded-lg p-3 text-center">
                  <div className="font-bold text-amber-800 mb-1">Event Loop</div>
                  <div className="text-amber-700">Callback queue</div>
                  <div className="text-amber-600 mt-1">Task scheduling</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600 text-center">
                JS Engine + Web APIs + Event Loop = Complete Runtime Environment
              </div>
            </div>
          </div>
        </div>

        {/* API Lifecycle */}
        <div className="bg-linear-to-r from-emerald-50 to-teal-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-5">API Call Lifecycle</h3>
          <div className="flex flex-wrap gap-3">
            {apiLifecycleSteps.map(({ step, label, color, description }) => {
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
                  <p className="text-xs text-gray-600">{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── API Categories ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">API Categories in Depth</h2>
        <p className="text-gray-600 mb-6">
          Web APIs are grouped by purpose. Availability varies significantly across browser,
          Node.js, Deno, and Bun runtimes.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {apiCategories.map((cat) => {
            const c = colorCls[cat.color];
            return (
              <div
                key={cat.id}
                className={`${c.bg} ${c.border} border rounded-xl p-5 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`w-9 h-9 ${c.num} text-white rounded-lg flex items-center justify-center shrink-0`}
                  >
                    {cat.icon}
                  </span>
                  <div>
                    <h3 className={`font-semibold ${c.text} text-base`}>{cat.label}</h3>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {cat.envs.map((e) => (
                        <span
                          key={e}
                          className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-600"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{cat.description}</p>
                <div className="bg-white rounded-lg p-3 border border-gray-200 mb-2">
                  <div className={`text-xs font-semibold ${c.text} mb-1.5`}>Common methods:</div>
                  <ul className="space-y-0.5">
                    {cat.examples.map((ex) => (
                      <li key={ex}>
                        <code className={`text-xs ${c.bg} px-1.5 py-0.5 rounded font-mono`}>
                          {ex}
                        </code>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-gray-500 italic">{cat.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Environment Comparison ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Runtime Environments Compared</h2>
        <p className="text-gray-600 mb-6">
          Each JavaScript runtime exposes a different set of Web APIs. Code that works in the
          browser may not work in Node.js, and vice versa.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {environments.map((env) => {
            const c = colorCls[env.colorCls];
            return (
              <div
                key={env.id}
                className={`${c.bg} ${c.border} border rounded-xl p-5 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: env.color }}
                  >
                    {env.icon}
                  </span>
                  <div>
                    <h3 className={`font-bold ${c.text} text-base`}>{env.label}</h3>
                    <p className="text-xs text-gray-500">{env.tagline}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-700 mb-1.5">Available APIs:</div>
                  <ul className="space-y-1">
                    {env.apis.map((api) => (
                      <li key={api} className="flex items-center gap-1.5 text-xs text-gray-700">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: env.color }}
                        />
                        {api}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Not available:</div>
                  <ul className="space-y-0.5">
                    {env.missing.map((m) => (
                      <li key={m} className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Code scenarios ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          <Code2 className="inline w-7 h-7 mr-2 text-emerald-600" />
          API Usage Scenarios
        </h2>
        <p className="text-gray-600 mb-6">
          Select a scenario to understand how each Web API integrates with the event loop and what
          the execution order looks like.
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(i)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeScenario === i
                  ? 'bg-emerald-600 text-white'
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
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-gray-800 text-sm">
                {scenarios[activeScenario].title}
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-auto">
                {scenarios[activeScenario].env}
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
                  <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-xs flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </span>
                  <code className="text-sm text-gray-800 font-mono">{line}</code>
                </div>
              ))}
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
              <strong>Key insight:</strong> {scenarios[activeScenario].note}
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive 2D Visualization ───────────────────────────────────── */}
      <div className="mb-8">
        <TwoDLayout
          title="2D Visualization: Web APIs"
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
          These are the Web API pitfalls that catch developers off-guard when moving between
          runtimes or writing async code.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {gotchas.map((g) => (
            <div
              key={g.title}
              className={`border rounded-xl p-5 ${
                g.severity === 'high'
                  ? 'border-red-200 bg-red-50'
                  : g.severity === 'medium'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-yellow-200 bg-yellow-50'
              }`}
            >
              <div className="flex items-start gap-3 mb-2">
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    g.severity === 'high'
                      ? 'text-red-500'
                      : g.severity === 'medium'
                        ? 'text-amber-500'
                        : 'text-yellow-500'
                  }`}
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{g.title}</h3>
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      g.severity === 'high'
                        ? 'bg-red-200 text-red-800'
                        : g.severity === 'medium'
                          ? 'bg-amber-200 text-amber-800'
                          : 'bg-yellow-200 text-yellow-800'
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

export default WebAPIs;
