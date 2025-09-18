import React, { useEffect, useRef, useState } from 'react';
import TwoDLayout from '../../components/TwoDLayout';
import ModeTabs from '../../components/shared/ModeTabs';
import { type Speed } from '../../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../../components/shared/OutputPanel';
import Editor from '../../components/shared/Editor';
import useRunner from '../../hooks/useRunner';

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
  const [mode, setMode] = useState<'2D' | '3D'>('2D');
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('js');
  const [source, setSource] = useState<string>(DEFAULT_JS);
  const [output, setOutput] = useState<OutputLine[]>([{ text: 'Web APIs ready.', kind: 'info' }]);
  const [speed, setSpeed] = useState<Speed>('slow');
  const [selectedEnvironment, setSelectedEnvironment] = useState<RuntimeEnvironment>('browser');
  const [highlightedAPI, setHighlightedAPI] = useState<string>('');
  const [activeAPIs, setActiveAPIs] = useState<WebAPI[]>([]);
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
    <section className="mb-4">
      <h2 className="text-base font-semibold">Web APIs & Runtime Integration</h2>

      {/* Runtime Context Introduction */}
      <div className="mb-4 rounded-lg bg-emerald-50 p-3">
        <h3 className="mb-2 text-sm font-semibold text-emerald-900">Role in JavaScript Runtime</h3>
        <p className="mb-2 text-xs text-emerald-800">
          Web APIs are the bridge between JavaScript code and the underlying platform capabilities.
          They're provided by the Runtime environment (not the Engine) and enable access to DOM,
          network, file system, and other platform-specific features through standardized JavaScript
          interfaces.
        </p>
        <p className="text-xs text-emerald-700">
          <strong>Runtime Architecture:</strong> JavaScript Engine + Web APIs + Event Loop =
          Complete Runtime Environment
        </p>
      </div>

      {/* Theory Section */}
      <div className="mb-3">
        <h3 className="mb-2 text-sm font-semibold">API Integration Model</h3>
        <p className="mb-2 text-sm text-gray-700">
          Web APIs extend JavaScript's capabilities beyond pure computation. They provide
          asynchronous interfaces to platform services, with results delivered back through the
          Event Loop and task queues.
        </p>
        <div className="mb-2 grid grid-cols-1 gap-2 text-xs text-gray-600 md:grid-cols-2">
          <div>
            <strong>Browser APIs:</strong>
            <ul className="ml-3 list-disc">
              <li>
                <strong>DOM API:</strong> Document structure manipulation
              </li>
              <li>
                <strong>Fetch API:</strong> HTTP requests and responses
              </li>
              <li>
                <strong>Storage APIs:</strong> Local and session storage
              </li>
              <li>
                <strong>Media APIs:</strong> Audio, video, WebGL
              </li>
            </ul>
          </div>
          <div>
            <strong>Node.js APIs:</strong>
            <ul className="ml-3 list-disc">
              <li>
                <strong>File System:</strong> Read/write files and directories
              </li>
              <li>
                <strong>HTTP/HTTPS:</strong> Server and client functionality
              </li>
              <li>
                <strong>Process:</strong> System process interaction
              </li>
              <li>
                <strong>Streams:</strong> Data processing pipelines
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ModeTabs mode={mode} onChange={setMode} />

      {mode === '2D' ? (
        <div className="mt-2">
          <TwoDLayout
            title="2D Visualization: Web APIs"
            editor={editor}
            output={outputPanel}
            canvas={canvas2D}
          />
        </div>
      ) : (
        <div className="mt-2 text-sm text-gray-600">
          3D visualization for Web APIs is coming soon.
        </div>
      )}
    </section>
  );
};

export default WebAPIs;
