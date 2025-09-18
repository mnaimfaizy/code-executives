import React, { useEffect, useRef, useState } from 'react';
import TwoDLayout from '../../components/TwoDLayout';
import ModeTabs from '../../components/shared/ModeTabs';
import { type Speed } from '../../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../../components/shared/OutputPanel';
import Editor from '../../components/shared/Editor';
import useRunner from '../../hooks/useRunner';

type OptimizationTier = 'interpreted' | 'baseline' | 'optimized' | 'deoptimized';

type Instruction =
  | { type: 'interpret'; code: string; tier: OptimizationTier }
  | { type: 'compile'; tier: OptimizationTier; reason: string }
  | { type: 'optimize'; from: OptimizationTier; to: OptimizationTier; reason: string }
  | { type: 'deoptimize'; reason: string };

type CompilationStage = {
  name: string;
  tier: OptimizationTier;
  performance: number; // relative performance multiplier
  compilationTime: number; // ms
  codeSize: number; // relative size
};

type Compiled = { program: Instruction[] };

const COMPILATION_STAGES: CompilationStage[] = [
  { name: 'Interpreter', tier: 'interpreted', performance: 1, compilationTime: 0, codeSize: 1 },
  { name: 'Baseline JIT', tier: 'baseline', performance: 3, compilationTime: 50, codeSize: 2 },
  {
    name: 'Optimizing JIT',
    tier: 'optimized',
    performance: 10,
    compilationTime: 200,
    codeSize: 0.8,
  },
];

const DEFAULT_JS = `// Hot function that will trigger JIT compilation
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Call multiple times to trigger optimization
for (let i = 0; i < 1000; i++) {
  fibonacci(10);
}

// Type change that might cause deoptimization
fibonacci("5");`;

const DEFAULT_DSL = `// JIT Compilation simulation DSL
// interpret <code>
// compile <tier> <reason>
// optimize <from-tier> <to-tier> <reason>
// deoptimize <reason>

interpret function hot() { return 42; }
compile baseline hot-function-detected
optimize baseline optimized high-call-frequency
deoptimize type-change-detected`;

// JIT Compilation Pipeline Visualization
const JITCompilation2D: React.FC<{
  currentTier?: OptimizationTier;
  stages?: CompilationStage[];
  executionCount?: number;
}> = ({ currentTier, stages = COMPILATION_STAGES, executionCount = 0 }) => {
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

    // Draw compilation pipeline
    const stageWidth = (width - 60) / stages.length;
    const stageHeight = 80;
    const startY = 60;

    stages.forEach((stage, index) => {
      const x = 30 + index * stageWidth;
      const isActive = currentTier === stage.tier;

      // Draw stage box
      ctx.fillStyle = isActive ? '#3b82f6' : '#e2e8f0';
      ctx.fillRect(x, startY, stageWidth - 10, stageHeight);

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, startY, stageWidth - 10, stageHeight);

      // Draw stage label
      ctx.fillStyle = isActive ? '#ffffff' : '#1e293b';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stage.name, x + (stageWidth - 10) / 2, startY + 25);

      // Draw tier
      ctx.font = '10px sans-serif';
      ctx.fillStyle = isActive ? '#e0f2fe' : '#64748b';
      ctx.fillText(`Tier: ${stage.tier}`, x + (stageWidth - 10) / 2, startY + 40);

      // Draw performance info
      ctx.fillText(`${stage.performance}x faster`, x + (stageWidth - 10) / 2, startY + 55);
      ctx.fillText(`${stage.compilationTime}ms compile`, x + (stageWidth - 10) / 2, startY + 70);

      // Draw arrow to next stage
      if (index < stages.length - 1) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + stageWidth - 10, startY + stageHeight / 2);
        ctx.lineTo(x + stageWidth, startY + stageHeight / 2);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(x + stageWidth - 5, startY + stageHeight / 2 - 5);
        ctx.lineTo(x + stageWidth, startY + stageHeight / 2);
        ctx.lineTo(x + stageWidth - 5, startY + stageHeight / 2 + 5);
        ctx.stroke();
      }
    });

    // Draw execution counter
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Execution Count: ${executionCount}`, 10, 20);

    // Draw performance graph
    const graphY = startY + stageHeight + 40;
    const graphHeight = 60;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, graphY, width - 60, graphHeight);

    ctx.fillStyle = '#1e293b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Performance Over Time', 30, graphY - 10);

    // Draw performance bars
    stages.forEach((stage, index) => {
      const barX = 35 + index * ((width - 70) / stages.length);
      const barWidth = (width - 70) / stages.length - 10;
      const barHeight = (stage.performance / 10) * (graphHeight - 10);

      ctx.fillStyle = currentTier === stage.tier ? '#3b82f6' : '#94a3b8';
      ctx.fillRect(barX, graphY + graphHeight - barHeight - 5, barWidth, barHeight);

      ctx.fillStyle = '#1e293b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${stage.performance}x`, barX + barWidth / 2, graphY + graphHeight + 15);
    });
  }, [currentTier, stages, executionCount]);

  return (
    <canvas ref={canvasRef} className="h-full w-full" style={{ width: '100%', height: '100%' }} />
  );
};

const JITCompilation: React.FC = () => {
  const [mode, setMode] = useState<'2D' | '3D'>('2D');
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('js');
  const [source, setSource] = useState<string>(DEFAULT_JS);
  const [output, setOutput] = useState<OutputLine[]>([{ text: 'Ready to compile.', kind: 'info' }]);
  const [speed, setSpeed] = useState<Speed>('slow');
  const [currentTier, setCurrentTier] = useState<OptimizationTier>('interpreted');
  const [executionCount, setExecutionCount] = useState<number>(0);
  const compiledRef = useRef<Compiled | null>(null);

  const log = (msg: string, opts?: { kind?: OutputLine['kind'] }) =>
    setOutput((o) => [...o, { text: msg, kind: opts?.kind }]);

  const reset = () => {
    setCurrentTier('interpreted');
    setExecutionCount(0);
    setOutput([{ text: 'Reset.', kind: 'info' }]);
    compiledRef.current = null;
  };

  const ensureCompiled = (): Compiled => {
    if (compiledRef.current) return compiledRef.current;

    try {
      if (inputMode === 'js') {
        // Simulate JIT compilation decisions based on code patterns
        const program: Instruction[] = [{ type: 'interpret', code: source, tier: 'interpreted' }];

        // Detect loops (hot code)
        if (source.includes('for') || source.includes('while')) {
          program.push({ type: 'compile', tier: 'baseline', reason: 'hot-loop-detected' });
          program.push({
            type: 'optimize',
            from: 'baseline',
            to: 'optimized',
            reason: 'high-execution-count',
          });
        }

        // Detect type instability
        if (source.includes('"') && source.includes('fibonacci')) {
          program.push({ type: 'deoptimize', reason: 'type-change-detected' });
        }

        compiledRef.current = { program };
        return compiledRef.current;
      } else {
        // DSL mode - parse instructions
        const lines = source.split('\n').filter((l) => l.trim() && !l.trim().startsWith('//'));
        const program: Instruction[] = [];

        for (const line of lines) {
          const [cmd, ...rest] = line.trim().split(/\s+/);
          if (cmd === 'interpret') {
            const code = rest.join(' ');
            program.push({ type: 'interpret', code, tier: 'interpreted' });
          } else if (cmd === 'compile') {
            const tier = rest[0] as OptimizationTier;
            const reason = rest.slice(1).join(' ');
            program.push({ type: 'compile', tier, reason });
          } else if (cmd === 'optimize') {
            const from = rest[0] as OptimizationTier;
            const to = rest[1] as OptimizationTier;
            const reason = rest.slice(2).join(' ');
            program.push({ type: 'optimize', from, to, reason });
          } else if (cmd === 'deoptimize') {
            const reason = rest.join(' ');
            program.push({ type: 'deoptimize', reason });
          }
        }

        compiledRef.current = { program };
        return compiledRef.current;
      }
    } catch (e) {
      log(`Compilation error: ${e instanceof Error ? e.message : String(e)}`, { kind: 'error' });
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
      if (ins.type === 'interpret') {
        setCurrentTier('interpreted');
        setExecutionCount((count) => count + 1);
        log(`Interpreting: ${ins.code.substring(0, 30)}...`, { kind: 'info' });
      } else if (ins.type === 'compile') {
        setCurrentTier(ins.tier);
        log(`Compiling to ${ins.tier}: ${ins.reason}`, { kind: 'info' });
      } else if (ins.type === 'optimize') {
        setCurrentTier(ins.to);
        log(`Optimizing ${ins.from} → ${ins.to}: ${ins.reason}`, { kind: 'info' });
      } else if (ins.type === 'deoptimize') {
        setCurrentTier('interpreted');
        log(`Deoptimizing: ${ins.reason}`, { kind: 'error' });
      }
    },
    getIntervalMs: (s) => (s === 'very-slow' ? 2500 : s === 'slow' ? 1500 : 800),
    onComplete: () => log('JIT compilation cycle complete.', { kind: 'info' }),
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
      title="Source Code"
      selectId="jit-input-mode-select"
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
      placeholderJs="Write JavaScript code to see JIT compilation in action"
      placeholderDsl="Use: interpret <code> | compile <tier> <reason> | optimize <from> <to> <reason>"
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
      {/* Compilation Tiers Info */}
      <div className="rounded-md border border-gray-300 p-3" style={{ height: '30%' }}>
        <h4 className="mb-2 text-sm font-semibold">Optimization Tiers</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {COMPILATION_STAGES.map((stage) => (
            <div
              key={stage.tier}
              className={`rounded p-2 ${
                currentTier === stage.tier ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'
              }`}
            >
              <div className="font-semibold">{stage.name}</div>
              <div>Performance: {stage.performance}x</div>
              <div>Compile Time: {stage.compilationTime}ms</div>
              <div>Code Size: {(stage.codeSize * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* JIT Pipeline Visualization */}
      <div className="flex-1 rounded-md border border-gray-300">
        <div className="p-2">
          <h4 className="text-sm font-semibold">JIT Compilation Pipeline</h4>
        </div>
        <div className="h-full">
          <JITCompilation2D
            currentTier={currentTier}
            stages={COMPILATION_STAGES}
            executionCount={executionCount}
          />
        </div>
      </div>
    </div>
  );

  return (
    <section className="mb-4">
      <h2 className="text-base font-semibold">Just-In-Time (JIT) Compilation</h2>

      {/* Engine Context Introduction */}
      <div className="mb-4 rounded-lg bg-orange-50 p-3">
        <h3 className="mb-2 text-sm font-semibold text-orange-900">Role in JavaScript Engine</h3>
        <p className="mb-2 text-xs text-orange-800">
          JIT Compilation bridges the gap between interpretation and ahead-of-time compilation. The
          engine starts with interpretation for fast startup, then progressively compiles hot code
          paths for optimal performance.
        </p>
        <p className="text-xs text-orange-700">
          <strong>Engine Integration:</strong> AST → Bytecode → Interpreter → Baseline JIT →
          Optimizing JIT → Native Code
        </p>
      </div>

      {/* Theory Section */}
      <div className="mb-3">
        <h3 className="mb-2 text-sm font-semibold">JIT Compilation Strategy</h3>
        <p className="mb-2 text-sm text-gray-700">
          Modern JavaScript engines use tiered compilation: starting with fast interpretation and
          progressively optimizing frequently executed code. This balances startup time with peak
          performance.
        </p>
        <div className="mb-2 grid grid-cols-1 gap-2 text-xs text-gray-600 md:grid-cols-2">
          <div>
            <strong>Compilation Tiers:</strong>
            <ul className="ml-3 list-disc">
              <li>
                <strong>Interpreter:</strong> Fast startup, slower execution
              </li>
              <li>
                <strong>Baseline JIT:</strong> Quick compilation, moderate optimization
              </li>
              <li>
                <strong>Optimizing JIT:</strong> Slow compilation, aggressive optimization
              </li>
              <li>
                <strong>Deoptimization:</strong> Fallback when assumptions fail
              </li>
            </ul>
          </div>
          <div>
            <strong>Optimization Triggers:</strong>
            <ul className="ml-3 list-disc">
              <li>High execution frequency</li>
              <li>Hot loop detection</li>
              <li>Type stability analysis</li>
              <li>Inline caching effectiveness</li>
            </ul>
          </div>
        </div>
      </div>

      <ModeTabs mode={mode} onChange={setMode} />

      {mode === '2D' ? (
        <div className="mt-2">
          <TwoDLayout
            title="2D Visualization: JIT Compilation"
            editor={editor}
            output={outputPanel}
            canvas={canvas2D}
          />
        </div>
      ) : (
        <div className="mt-2 text-sm text-gray-600">
          3D visualization for JIT Compilation is coming soon.
        </div>
      )}
    </section>
  );
};

export default JITCompilation;
