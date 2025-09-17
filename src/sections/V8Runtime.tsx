import React, { useEffect, useRef, useState } from 'react';
import TwoDLayout from '../components/TwoDLayout';
import ModeTabs from '../components/shared/ModeTabs';
import { type Speed } from '../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../components/shared/OutputPanel';
import Editor from '../components/shared/Editor';
import useRunner from '../hooks/useRunner';

type V8Phase = 'parse' | 'ignition' | 'turbofan' | 'orinoco' | 'heap' | 'optimize';
type CompilationTier = 'ignition' | 'turbofan' | 'maglev';

type V8Operation =
  | { type: 'parse'; code: string; ast_nodes: number }
  | { type: 'compile'; tier: CompilationTier; function_name: string; optimizations: string[] }
  | { type: 'execute'; tier: CompilationTier; instructions: number; time_ms: number }
  | { type: 'optimize'; from: CompilationTier; to: CompilationTier; reason: string }
  | { type: 'deoptimize'; function_name: string; reason: string }
  | { type: 'gc'; gc_type: 'minor' | 'major'; collected_mb: number; duration_ms: number }
  | { type: 'heap-snapshot'; used_mb: number; allocated_mb: number; fragmentation: number };

type V8Stats = {
  parsed_functions: number;
  ignition_functions: number;
  turbofan_functions: number;
  deoptimizations: number;
  gc_cycles: number;
  heap_size_mb: number;
  compilation_time_ms: number;
};

type Instruction = V8Operation;
type Compiled = { program: Instruction[] };

const V8_TIERS = {
  ignition: {
    color: '#059669',
    name: 'Ignition Interpreter',
    description: 'Bytecode interpreter for quick startup',
  },
  maglev: {
    color: '#d97706',
    name: 'Maglev Compiler',
    description: 'Mid-tier optimizing compiler',
  },
  turbofan: {
    color: '#dc2626',
    name: 'TurboFan Compiler',
    description: 'High-tier optimizing compiler',
  },
};

const OPTIMIZATION_REASONS = [
  'Hot function detected',
  'Type speculation successful',
  'Inline cache optimization',
  'Loop optimization opportunity',
  'Escape analysis benefits',
];

const DEOPTIMIZATION_REASONS = [
  'Type assumption failed',
  'Hidden class changed',
  'Function redefined',
  'Speculation failed',
  'Inline cache miss',
];

const DEFAULT_JS = `// V8 Runtime Optimization Example
function hotFunction(x, y) {
  // This function will be called many times
  // V8 will optimize it through compilation tiers
  return x * y + Math.sqrt(x);
}

// Trigger parsing and initial compilation
console.log('Starting V8 optimization demo');

// Cold start - Ignition interpreter
let result = hotFunction(5, 10);

// Warm up - trigger Maglev compilation  
for (let i = 0; i < 100; i++) {
  result += hotFunction(i, i + 1);
}

// Hot code - trigger TurboFan optimization
for (let i = 0; i < 10000; i++) {
  result += hotFunction(i, i * 2);
}

console.log('Final result:', result);

// Trigger deoptimization by changing types
hotFunction("string", "another"); // Type mismatch!

// Memory pressure - trigger garbage collection
let bigArray = new Array(1000000).fill(0);
bigArray = null; // Allow GC`;

const DEFAULT_DSL = `// V8 Runtime Operations DSL
// parse <code> <ast-nodes>
// compile <tier> <function> <optimizations...>
// execute <tier> <instructions> <time-ms>
// optimize <from-tier> <to-tier> <reason>
// deoptimize <function> <reason>
// gc <type> <collected-mb> <duration-ms>
// heap-snapshot <used-mb> <allocated-mb> <fragmentation>

parse "function hotFunction(x, y) { return x * y; }" 15
compile ignition hotFunction basic-types
execute ignition 50 2.5

compile maglev hotFunction type-speculation inline-cache
execute maglev 35 1.8

optimize ignition turbofan "Hot function detected"
compile turbofan hotFunction advanced-opts escape-analysis
execute turbofan 20 0.9

deoptimize hotFunction "Type assumption failed"
compile ignition hotFunction 
execute ignition 60 3.2

gc minor 5.2 1.5
gc major 25.8 12.3

heap-snapshot 45.6 128.0 0.15`;

// V8 Runtime Visualization
const V8Runtime2D: React.FC<{
  stats: V8Stats;
  currentPhase?: V8Phase;
  recentOperations: V8Operation[];
}> = ({ stats, currentPhase, recentOperations }) => {
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

    // Draw V8 Runtime title
    ctx.fillStyle = '#1e293b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('V8 JavaScript Runtime Architecture', width / 2, 25);

    // Draw compilation pipeline
    const pipelineY = 50;
    const tiers = Object.entries(V8_TIERS);
    const tierWidth = (width - 60) / tiers.length;

    tiers.forEach(([tier, config], index) => {
      const x = 30 + index * tierWidth;
      const isActive = currentPhase === tier;

      // Draw tier box
      ctx.fillStyle = isActive ? config.color : config.color + '30';
      ctx.fillRect(x, pipelineY, tierWidth - 20, 60);

      ctx.strokeStyle = config.color;
      ctx.lineWidth = isActive ? 3 : 1;
      ctx.strokeRect(x, pipelineY, tierWidth - 20, 60);

      // Tier name
      ctx.fillStyle = isActive ? '#ffffff' : '#1e293b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(config.name, x + (tierWidth - 20) / 2, pipelineY + 25);

      // Tier description
      ctx.fillStyle = isActive ? '#f1f5f9' : '#64748b';
      ctx.font = '9px sans-serif';
      ctx.fillText(config.description, x + (tierWidth - 20) / 2, pipelineY + 40);

      // Function count
      let count = 0;
      if (tier === 'ignition') count = stats.ignition_functions;
      else if (tier === 'turbofan') count = stats.turbofan_functions;

      ctx.fillStyle = config.color;
      ctx.font = '11px sans-serif';
      ctx.fillText(`${count} functions`, x + (tierWidth - 20) / 2, pipelineY + 55);

      // Draw optimization arrows
      if (index < tiers.length - 1) {
        const nextX = x + tierWidth;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + tierWidth - 20, pipelineY + 30);
        ctx.lineTo(nextX - 10, pipelineY + 30);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(nextX - 15, pipelineY + 25);
        ctx.lineTo(nextX - 10, pipelineY + 30);
        ctx.lineTo(nextX - 15, pipelineY + 35);
        ctx.stroke();

        // Optimization label
        ctx.fillStyle = '#64748b';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('optimize', x + tierWidth - 10, pipelineY + 45);
      }
    });

    // Draw V8 Components
    const componentsY = 140;
    const componentHeight = 80;

    const components = [
      { name: 'Parser & AST', color: '#8b5cf6', active: currentPhase === 'parse' },
      { name: 'Ignition Interpreter', color: '#059669', active: currentPhase === 'ignition' },
      { name: 'TurboFan JIT', color: '#dc2626', active: currentPhase === 'turbofan' },
      { name: 'Orinoco GC', color: '#0891b2', active: currentPhase === 'orinoco' },
    ];

    const compWidth = (width - 40) / components.length;
    components.forEach((comp, index) => {
      const x = 20 + index * compWidth;

      ctx.fillStyle = comp.active ? comp.color : comp.color + '20';
      ctx.fillRect(x, componentsY, compWidth - 10, componentHeight);

      ctx.strokeStyle = comp.color;
      ctx.lineWidth = comp.active ? 2 : 1;
      ctx.strokeRect(x, componentsY, compWidth - 10, componentHeight);

      ctx.fillStyle = comp.active ? '#ffffff' : '#1e293b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(comp.name, x + (compWidth - 10) / 2, componentsY + 20);

      // Component-specific stats
      ctx.fillStyle = comp.active ? '#f1f5f9' : '#64748b';
      ctx.font = '9px sans-serif';

      if (comp.name.includes('Parser')) {
        ctx.fillText(
          `${stats.parsed_functions} parsed`,
          x + (compWidth - 10) / 2,
          componentsY + 35
        );
        ctx.fillText(
          `${stats.compilation_time_ms.toFixed(1)}ms`,
          x + (compWidth - 10) / 2,
          componentsY + 50
        );
      } else if (comp.name.includes('Ignition')) {
        ctx.fillText(
          `${stats.ignition_functions} functions`,
          x + (compWidth - 10) / 2,
          componentsY + 35
        );
        ctx.fillText('Bytecode exec', x + (compWidth - 10) / 2, componentsY + 50);
      } else if (comp.name.includes('TurboFan')) {
        ctx.fillText(
          `${stats.turbofan_functions} optimized`,
          x + (compWidth - 10) / 2,
          componentsY + 35
        );
        ctx.fillText(`${stats.deoptimizations} deopt`, x + (compWidth - 10) / 2, componentsY + 50);
      } else if (comp.name.includes('Orinoco')) {
        ctx.fillText(`${stats.gc_cycles} cycles`, x + (compWidth - 10) / 2, componentsY + 35);
        ctx.fillText(
          `${stats.heap_size_mb.toFixed(1)}MB heap`,
          x + (compWidth - 10) / 2,
          componentsY + 50
        );
      }
    });

    // Draw heap visualization
    const heapY = 250;
    const heapHeight = 60;
    const heapUsage = Math.min(stats.heap_size_mb / 100, 1); // Normalize to 100MB max

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(20, heapY, width - 40, heapHeight);

    ctx.fillStyle =
      stats.heap_size_mb > 80 ? '#dc2626' : stats.heap_size_mb > 50 ? '#d97706' : '#059669';
    ctx.fillRect(20, heapY, (width - 40) * heapUsage, heapHeight);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, heapY, width - 40, heapHeight);

    ctx.fillStyle = '#1e293b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('V8 Heap Memory', 25, heapY + 15);

    ctx.font = '10px sans-serif';
    ctx.fillText(`${stats.heap_size_mb.toFixed(1)} MB used`, 25, heapY + 30);
    ctx.fillText(`${stats.gc_cycles} GC cycles`, 25, heapY + 45);

    // Draw recent operations log
    const logY = 330;

    ctx.fillStyle = '#1e293b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Recent V8 Operations:', 20, logY);

    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#475569';

    const visibleOps = recentOperations.slice(-8);
    visibleOps.forEach((op, index) => {
      const y = logY + 20 + index * 15;
      let text = '';
      let color = '#64748b';

      if (op.type === 'parse') {
        text = `Parsed code: ${op.ast_nodes} AST nodes`;
        color = '#8b5cf6';
      } else if (op.type === 'compile') {
        text = `Compiled ${op.function_name} to ${op.tier} (${op.optimizations.join(', ')})`;
        color = V8_TIERS[op.tier].color;
      } else if (op.type === 'execute') {
        text = `Executed ${op.instructions} instructions in ${op.time_ms}ms (${op.tier})`;
        color = V8_TIERS[op.tier].color;
      } else if (op.type === 'optimize') {
        text = `Optimized ${op.from} → ${op.to}: ${op.reason}`;
        color = '#059669';
      } else if (op.type === 'deoptimize') {
        text = `Deoptimized ${op.function_name}: ${op.reason}`;
        color = '#dc2626';
      } else if (op.type === 'gc') {
        text = `GC ${op.gc_type}: collected ${op.collected_mb}MB in ${op.duration_ms}ms`;
        color = '#0891b2';
      }

      ctx.fillStyle = color;
      ctx.fillText(`• ${text}`, 25, y);
    });

    // Draw performance metrics
    const metricsX = width - 200;
    const metricsY = logY;

    ctx.fillStyle = '#1e293b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Performance Metrics:', metricsX, metricsY);

    const metrics = [
      `Functions parsed: ${stats.parsed_functions}`,
      `Ignition compiled: ${stats.ignition_functions}`,
      `TurboFan optimized: ${stats.turbofan_functions}`,
      `Deoptimizations: ${stats.deoptimizations}`,
      `Compilation time: ${stats.compilation_time_ms.toFixed(1)}ms`,
      `GC cycles: ${stats.gc_cycles}`,
      `Heap size: ${stats.heap_size_mb.toFixed(1)}MB`,
    ];

    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#475569';
    metrics.forEach((metric, index) => {
      ctx.fillText(metric, metricsX, metricsY + 20 + index * 12);
    });
  }, [stats, currentPhase, recentOperations]);

  return (
    <canvas ref={canvasRef} className="h-full w-full" style={{ width: '100%', height: '100%' }} />
  );
};

const V8Runtime: React.FC = () => {
  const [mode, setMode] = useState<'2D' | '3D'>('2D');
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('js');
  const [source, setSource] = useState<string>(DEFAULT_JS);
  const [output, setOutput] = useState<OutputLine[]>([{ text: 'V8 Runtime ready.', kind: 'info' }]);
  const [speed, setSpeed] = useState<Speed>('slow');
  const [stats, setStats] = useState<V8Stats>({
    parsed_functions: 0,
    ignition_functions: 0,
    turbofan_functions: 0,
    deoptimizations: 0,
    gc_cycles: 0,
    heap_size_mb: 12.5,
    compilation_time_ms: 0,
  });
  const [currentPhase, setCurrentPhase] = useState<V8Phase | undefined>();
  const [recentOperations, setRecentOperations] = useState<V8Operation[]>([]);
  const compiledRef = useRef<Compiled | null>(null);

  const log = (msg: string, opts?: { kind?: OutputLine['kind'] }) =>
    setOutput((o) => [...o, { text: msg, kind: opts?.kind }]);

  const reset = () => {
    setStats({
      parsed_functions: 0,
      ignition_functions: 0,
      turbofan_functions: 0,
      deoptimizations: 0,
      gc_cycles: 0,
      heap_size_mb: 12.5,
      compilation_time_ms: 0,
    });
    setCurrentPhase(undefined);
    setRecentOperations([]);
    setOutput([{ text: 'V8 Runtime reset.', kind: 'info' }]);
    compiledRef.current = null;
  };

  const ensureCompiled = (): Compiled => {
    if (compiledRef.current) return compiledRef.current;

    try {
      if (inputMode === 'js') {
        // Analyze JavaScript for V8 operations
        const program: Instruction[] = [];

        // Parse phase
        const functionMatches = source.match(/function\s+\w+/g) || [];
        const astNodes = source.length / 10; // Rough estimate
        program.push({
          type: 'parse',
          code: source.slice(0, 50) + '...',
          ast_nodes: Math.round(astNodes),
        });

        // Compile functions to Ignition
        functionMatches.forEach((match, index) => {
          const funcName = match.split(' ')[1] || `function${index}`;
          program.push({
            type: 'compile',
            tier: 'ignition',
            function_name: funcName,
            optimizations: ['basic-types', 'bytecode-gen'],
          });

          // Execute in Ignition
          program.push({
            type: 'execute',
            tier: 'ignition',
            instructions: 50 + Math.random() * 50,
            time_ms: 2 + Math.random() * 3,
          });
        });

        // Optimization to TurboFan for hot functions
        if (source.includes('for') && functionMatches.length > 0) {
          const hotFunc = functionMatches[0]?.split(' ')[1] || 'hotFunction';
          program.push({
            type: 'optimize',
            from: 'ignition',
            to: 'turbofan',
            reason: OPTIMIZATION_REASONS[0],
          });

          program.push({
            type: 'compile',
            tier: 'turbofan',
            function_name: hotFunc,
            optimizations: ['type-speculation', 'inline-cache', 'escape-analysis'],
          });

          program.push({
            type: 'execute',
            tier: 'turbofan',
            instructions: 20 + Math.random() * 30,
            time_ms: 0.5 + Math.random() * 1,
          });
        }

        // Deoptimization if type changes detected
        if (source.includes('string') && source.includes('number')) {
          program.push({
            type: 'deoptimize',
            function_name: functionMatches[0]?.split(' ')[1] || 'function',
            reason: DEOPTIMIZATION_REASONS[0],
          });
        }

        // Garbage collection
        if (source.includes('Array') || source.includes('new ')) {
          program.push({
            type: 'gc',
            gc_type: 'minor',
            collected_mb: 2 + Math.random() * 8,
            duration_ms: 1 + Math.random() * 3,
          });

          if (source.includes('1000000')) {
            program.push({
              type: 'gc',
              gc_type: 'major',
              collected_mb: 15 + Math.random() * 20,
              duration_ms: 8 + Math.random() * 15,
            });
          }
        }

        // Heap snapshot
        program.push({
          type: 'heap-snapshot',
          used_mb: 45 + Math.random() * 30,
          allocated_mb: 128,
          fragmentation: 0.1 + Math.random() * 0.2,
        });

        compiledRef.current = { program };
        return compiledRef.current;
      } else {
        // DSL mode - parse V8 operations
        const lines = source.split('\n').filter((l) => l.trim() && !l.trim().startsWith('//'));
        const program: Instruction[] = [];

        for (const line of lines) {
          const [cmd, ...rest] = line.trim().split(/\s+/);

          if (cmd === 'parse') {
            const code = rest.slice(0, -1).join(' ').replace(/"/g, '');
            const astNodes = parseInt(rest[rest.length - 1]);
            program.push({ type: 'parse', code, ast_nodes: astNodes });
          } else if (cmd === 'compile') {
            const [tier, functionName, ...opts] = rest;
            program.push({
              type: 'compile',
              tier: tier as CompilationTier,
              function_name: functionName,
              optimizations: opts,
            });
          } else if (cmd === 'execute') {
            const [tier, instructions, timeMs] = rest;
            program.push({
              type: 'execute',
              tier: tier as CompilationTier,
              instructions: parseInt(instructions),
              time_ms: parseFloat(timeMs),
            });
          } else if (cmd === 'optimize') {
            const [from, to, ...reasonParts] = rest;
            program.push({
              type: 'optimize',
              from: from as CompilationTier,
              to: to as CompilationTier,
              reason: reasonParts.join(' ').replace(/"/g, ''),
            });
          } else if (cmd === 'deoptimize') {
            const [functionName, ...reasonParts] = rest;
            program.push({
              type: 'deoptimize',
              function_name: functionName,
              reason: reasonParts.join(' ').replace(/"/g, ''),
            });
          } else if (cmd === 'gc') {
            const [gcType, collectedMb, durationMs] = rest;
            program.push({
              type: 'gc',
              gc_type: gcType as 'minor' | 'major',
              collected_mb: parseFloat(collectedMb),
              duration_ms: parseFloat(durationMs),
            });
          } else if (cmd === 'heap-snapshot') {
            const [usedMb, allocatedMb, fragmentation] = rest;
            program.push({
              type: 'heap-snapshot',
              used_mb: parseFloat(usedMb),
              allocated_mb: parseFloat(allocatedMb),
              fragmentation: parseFloat(fragmentation),
            });
          }
        }

        compiledRef.current = { program };
        return compiledRef.current;
      }
    } catch (e) {
      log(`V8 Runtime error: ${e instanceof Error ? e.message : String(e)}`, { kind: 'error' });
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
    apply: (op) => {
      setRecentOperations((ops) => [...ops, op]);

      if (op.type === 'parse') {
        setCurrentPhase('parse');
        setStats((s) => ({ ...s, parsed_functions: s.parsed_functions + 1 }));
        log(`Parsed code with ${op.ast_nodes} AST nodes`, { kind: 'info' });
      } else if (op.type === 'compile') {
        setCurrentPhase(op.tier === 'ignition' ? 'ignition' : 'turbofan');
        if (op.tier === 'ignition') {
          setStats((s) => ({ ...s, ignition_functions: s.ignition_functions + 1 }));
        } else if (op.tier === 'turbofan') {
          setStats((s) => ({ ...s, turbofan_functions: s.turbofan_functions + 1 }));
        }
        log(`Compiled ${op.function_name} to ${op.tier} (${op.optimizations.join(', ')})`, {
          kind: 'info',
        });
      } else if (op.type === 'execute') {
        log(`Executed ${op.instructions} instructions in ${op.time_ms.toFixed(1)}ms (${op.tier})`, {
          kind: 'log',
        });
        setStats((s) => ({ ...s, compilation_time_ms: s.compilation_time_ms + op.time_ms }));
      } else if (op.type === 'optimize') {
        setCurrentPhase('optimize');
        log(`Optimized ${op.from} → ${op.to}: ${op.reason}`, { kind: 'info' });
      } else if (op.type === 'deoptimize') {
        setStats((s) => ({ ...s, deoptimizations: s.deoptimizations + 1 }));
        log(`Deoptimized ${op.function_name}: ${op.reason}`, { kind: 'error' });
      } else if (op.type === 'gc') {
        setCurrentPhase('orinoco');
        setStats((s) => ({
          ...s,
          gc_cycles: s.gc_cycles + 1,
          heap_size_mb: Math.max(5, s.heap_size_mb - op.collected_mb),
        }));
        log(
          `GC ${op.gc_type}: collected ${op.collected_mb.toFixed(1)}MB in ${op.duration_ms.toFixed(1)}ms`,
          { kind: 'info' }
        );
      } else if (op.type === 'heap-snapshot') {
        setCurrentPhase('heap');
        setStats((s) => ({ ...s, heap_size_mb: op.used_mb }));
        log(
          `Heap snapshot: ${op.used_mb.toFixed(1)}MB used, ${(op.fragmentation * 100).toFixed(1)}% fragmented`,
          { kind: 'info' }
        );
      }
    },
    getIntervalMs: (s) => (s === 'very-slow' ? 2500 : s === 'slow' ? 1500 : 800),
    onComplete: () => {
      setCurrentPhase(undefined);
      log('V8 Runtime simulation complete.', { kind: 'info' });
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
      title="JavaScript Code"
      selectId="v8runtime-input-mode-select"
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
      placeholderJs="Write JavaScript to see V8 compilation and optimization"
      placeholderDsl="Use: parse, compile, execute, optimize, deoptimize, gc, heap-snapshot"
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
      {/* V8 Architecture Overview */}
      <div className="rounded-md border border-gray-300 p-3" style={{ height: '20%' }}>
        <h4 className="mb-2 text-sm font-semibold">V8 Compilation Tiers</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {Object.entries(V8_TIERS).map(([tier, config]) => (
            <div
              key={tier}
              className="rounded p-2 text-center"
              style={{ backgroundColor: config.color + '20', color: config.color }}
            >
              <div className="font-semibold">{config.name}</div>
              <div className="text-xs">{config.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* V8 Runtime Visualization */}
      <div className="flex-1 rounded-md border border-gray-300">
        <div className="p-2">
          <h4 className="text-sm font-semibold">V8 Runtime Operations & Performance</h4>
        </div>
        <div className="h-full">
          <V8Runtime2D
            stats={stats}
            currentPhase={currentPhase}
            recentOperations={recentOperations}
          />
        </div>
      </div>
    </div>
  );

  return (
    <section className="mb-4">
      <h2 className="text-base font-semibold">V8 JavaScript Runtime</h2>

      {/* Runtime Context Introduction */}
      <div className="mb-4 rounded-lg bg-blue-50 p-3">
        <h3 className="mb-2 text-sm font-semibold text-blue-900">V8 Runtime Architecture</h3>
        <p className="mb-2 text-xs text-blue-800">
          V8 is Google's high-performance JavaScript runtime that powers Chrome and Node.js. It
          features a multi-tier compilation system, advanced garbage collection, and sophisticated
          optimization techniques that make JavaScript execution fast and efficient.
        </p>
        <p className="text-xs text-blue-700">
          <strong>Key Features:</strong> Just-In-Time compilation, Hidden Classes, Inline Caching,
          Orinoco GC
        </p>
      </div>

      {/* Theory Section */}
      <div className="mb-3">
        <h3 className="mb-2 text-sm font-semibold">V8 Compilation Pipeline & Optimizations</h3>
        <p className="mb-2 text-sm text-gray-700">
          V8 uses a multi-tier compilation strategy that balances fast startup with optimal runtime
          performance. Code flows through different compilation tiers based on usage patterns and
          profiling data.
        </p>
        <div className="mb-2 grid grid-cols-1 gap-2 text-xs text-gray-600 md:grid-cols-2">
          <div>
            <strong>Compilation Tiers:</strong>
            <ul className="ml-3 list-disc">
              <li>
                <strong>Ignition:</strong> Bytecode interpreter for fast startup
              </li>
              <li>
                <strong>Maglev:</strong> Mid-tier optimizing compiler
              </li>
              <li>
                <strong>TurboFan:</strong> High-tier optimizing compiler
              </li>
              <li>
                <strong>Deoptimization:</strong> Fallback when assumptions fail
              </li>
            </ul>
          </div>
          <div>
            <strong>Optimization Techniques:</strong>
            <ul className="ml-3 list-disc">
              <li>Type speculation and feedback</li>
              <li>Hidden classes for object layout</li>
              <li>Inline caching for property access</li>
              <li>Escape analysis and allocation optimization</li>
            </ul>
          </div>
        </div>
      </div>

      <ModeTabs mode={mode} onChange={setMode} />

      {mode === '2D' ? (
        <div className="mt-2">
          <TwoDLayout
            title="2D Visualization: V8 Runtime"
            editor={editor}
            output={outputPanel}
            canvas={canvas2D}
          />
        </div>
      ) : (
        <div className="mt-2 text-sm text-gray-600">
          3D visualization for V8 Runtime is coming soon.
        </div>
      )}
    </section>
  );
};

export default V8Runtime;
