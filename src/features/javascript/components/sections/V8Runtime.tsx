import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Code2,
  Cpu,
  Layers,
  TrendingUp,
  TrendingDown,
  Trash2,
  Zap,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import TwoDLayout from '../../../../components/TwoDLayout';
import { type Speed } from '../../../../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../../../../components/shared/OutputPanel';
import Editor from '../../../../components/shared/Editor';
import useRunner from '../../../../hooks/useRunner';

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

// ─── Color map ────────────────────────────────────────────────────────────────
const colorCls: Record<string, { bg: string; border: string; text: string; num: string }> = {
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    num: 'bg-purple-600',
  },
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
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', num: 'bg-red-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', num: 'bg-blue-600' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-800', num: 'bg-cyan-600' },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    num: 'bg-indigo-600',
  },
};

// ─── Compilation pipeline steps ───────────────────────────────────────────────
const pipelineSteps = [
  {
    step: '1',
    color: 'purple',
    label: 'Parse & AST',
    icon: <Code2 className="w-5 h-5" />,
    description:
      'The source code is tokenized and parsed into an Abstract Syntax Tree (AST). The parser validates syntax and builds a structured tree representation.',
    detail: 'Lazy parsing: V8 only fully parses functions when they are first called.',
  },
  {
    step: '2',
    color: 'green',
    label: 'Ignition',
    icon: <Zap className="w-5 h-5" />,
    description:
      'The AST is compiled to bytecode by the Ignition interpreter. Bytecode is compact and platform-independent. Functions start executing here with type-feedback collection.',
    detail: 'Ignition collects "type feedback" to help TurboFan make optimization assumptions.',
  },
  {
    step: '3',
    color: 'amber',
    label: 'Maglev',
    icon: <TrendingUp className="w-5 h-5" />,
    description:
      'Mid-tier optimizing compiler (added in V8 v11). Compiles hot functions faster than TurboFan with lower overhead, filling the gap between Ignition and TurboFan.',
    detail:
      'Maglev generates native code much faster than TurboFan at moderate optimization level.',
  },
  {
    step: '4',
    color: 'red',
    label: 'TurboFan',
    icon: <Cpu className="w-5 h-5" />,
    description:
      "V8's high-tier optimizing JIT compiler. Uses type feedback from Ignition to generate highly optimized machine code. Applies speculative optimizations for maximum throughput.",
    detail: 'TurboFan performs escape analysis, inlining, loop peeling, and register allocation.',
  },
  {
    step: '↩',
    color: 'blue',
    label: 'Deoptimize',
    icon: <TrendingDown className="w-5 h-5" />,
    description:
      'When a speculative optimization assumption fails (e.g., type change), V8 "deoptimizes" back to Ignition bytecode. The function re-warms and may be re-optimized later.',
    detail: 'Frequent deoptimizations are a major performance red flag to watch for in profilers.',
  },
];

// ─── Optimization techniques cards ────────────────────────────────────────────
const optimizationTechniques = [
  {
    name: 'Hidden Classes',
    color: 'purple',
    icon: <Layers className="w-5 h-5" />,
    description:
      'V8 creates internal "hidden classes" (shapes) for objects with the same property layout. Objects sharing a hidden class share optimized property-access code.',
    code: `// V8 creates the SAME hidden class for both:
const a = { x: 1, y: 2 };
const b = { x: 3, y: 4 };

// DIFFERENT hidden class — always add in same order:
const c = { x: 1, y: 2 };
const d = { y: 2, x: 1 }; // different shape!`,
    tip: 'Always initialize object properties in the same order, and avoid adding properties after construction.',
  },
  {
    name: 'Inline Caching (IC)',
    color: 'green',
    icon: <Zap className="w-5 h-5" />,
    description:
      "V8 caches the result of property lookups at call sites. A 'monomorphic' IC (one shape seen) is fastest; 'polymorphic' (2-4 shapes) is slower; 'megamorphic' (5+ shapes) is slowest.",
    code: `function getX(obj) {
  return obj.x; // IC records the hidden class
}

// Monomorphic (fast): always same shape
getX({ x: 1, y: 2 });
getX({ x: 2, y: 3 });

// Megamorphic (slow): too many shapes
getX({ x: 1 });
getX({ x: 1, y: 2, z: 3 });`,
    tip: 'Keep functions monomorphic — call them with objects of the same shape.',
  },
  {
    name: 'Escape Analysis',
    color: 'amber',
    icon: <BarChart2 className="w-5 h-5" />,
    description:
      "If TurboFan can prove an object doesn't 'escape' the function (isn't stored externally), it allocates it on the stack instead of the heap — avoiding GC pressure entirely.",
    code: `function sum(arr) {
  // If 'result' doesn't escape, V8 may
  // stack-allocate it (no GC pressure)
  const result = { value: 0 };
  for (const n of arr) result.value += n;
  return result.value; // only primitive escapes
}`,
    tip: 'Short-lived objects that stay local to a function are prime candidates for stack allocation.',
  },
  {
    name: 'Orinoco GC',
    color: 'cyan',
    icon: <Trash2 className="w-5 h-5" />,
    description:
      "V8's Orinoco garbage collector uses generational collection (Young/Old generations), parallel and concurrent marking, and incremental sweeping to minimize main-thread pauses.",
    code: `// Young generation (Scavenger, fast)
// Objects promoted after surviving 2 GC cycles

// Old generation (Major GC, slower)
// Long-lived objects — minimize allocations here

// Avoid allocating in tight hot loops:
// SLOW: creates GC pressure
for (let i = 0; i < 1e6; i++) {
  process({ x: i, y: i * 2 }); // new obj each time
}`,
    tip: 'Avoid allocating objects inside hot loops. Reuse objects or use typed arrays for numerical data.',
  },
  {
    name: 'Function Inlining',
    color: 'indigo',
    icon: <RefreshCw className="w-5 h-5" />,
    description:
      "TurboFan replaces a function call with the function's body at the call site when the function is small and frequently called. This eliminates call overhead and enables further optimization.",
    code: `// V8 may inline small helpers:
function square(x) { return x * x; }

function sumSquares(arr) {
  let sum = 0;
  for (const n of arr) {
    // 'square(n)' may be inlined to 'n * n'
    sum += square(n);
  }
  return sum;
}`,
    tip: 'Keep hot helper functions small and side-effect-free to maximize inlining opportunities.',
  },
  {
    name: 'Type Speculation',
    color: 'red',
    icon: <TrendingUp className="w-5 h-5" />,
    description:
      'TurboFan assumes types stay consistent based on Ignition feedback. It generates fast paths for the expected types and adds deoptimization guards for unexpected types.',
    code: `function add(a, b) {
  return a + b; // V8 assumes numbers here
}

// Fast: TurboFan generates integer add
add(1, 2);
add(3, 4);

// Deoptimizes! Type assumption broke.
add("hello", "world"); // now string concat`,
    tip: 'Avoid calling functions with mixed types. TypeScript helps enforce consistent types.',
  },
];

// ─── Code scenarios ────────────────────────────────────────────────────────────
const scenarios = [
  {
    id: 'hidden-class',
    title: 'Hidden Classes',
    description: 'Property insertion order affects the hidden class V8 creates.',
    code: `// GOOD: same insertion order = same hidden class
function makePoint(x, y) {
  return { x, y }; // always x first, then y
}
const p1 = makePoint(1, 2);
const p2 = makePoint(3, 4);
// p1 and p2 share a hidden class → fast IC

// BAD: different order = different hidden class
const a = {};
a.x = 1; a.y = 2; // shape A

const b = {};
b.y = 2; b.x = 1; // shape B ← different!

// BAD: adding properties after construction
const c = { x: 1 };
c.y = 2; // creates a new hidden class transition`,
    output: [
      '// p1 and p2: same hidden class (fast)',
      '// a and b: different hidden classes (slower IC)',
      '// c: hidden class transition on y addition',
    ],
    note: 'Always define all object properties upfront in the constructor/factory function, in the same order, to maximize hidden class sharing.',
  },
  {
    id: 'type-consistency',
    title: 'Type Consistency',
    description: 'Mixed types cause deoptimization from TurboFan back to Ignition.',
    code: `function multiply(a, b) {
  return a * b;
}

// Warm up with consistent types (integers)
for (let i = 0; i < 10000; i++) {
  multiply(i, i + 1);
}
// V8 now has TurboFan-optimized code for int*int

// Deoptimization trigger:
multiply(1.5, 2.5);   // float — minor deopt
multiply("3", 4);     // type confusion — major deopt
multiply(null, 0);    // coercion — deopt

// After deopt, function re-warms in Ignition`,
    output: [
      '// 10000 × int*int → TurboFan optimized',
      '// multiply(1.5, 2.5) → minor deopt (floats)',
      '// multiply("3", 4) → major deopt (coercion)',
      '// Function re-warms in Ignition bytecode',
    ],
    note: 'Use TypeScript or JSDoc to enforce consistent types. Profile with --trace-deopt to find deoptimization hotspots in Node.js.',
  },
  {
    id: 'gc-pressure',
    title: 'GC Pressure',
    description: 'Excessive allocations in hot loops trigger frequent garbage collection.',
    code: `// BAD: allocates a new object on every iteration
function processItemsSlow(items) {
  return items.map(item => ({
    id: item.id,
    value: item.value * 2,
    label: \`item-\${item.id}\`
  }));
}

// BETTER: reuse a pre-allocated buffer
const buffer = new Float64Array(1000);
function processItemsFast(items) {
  for (let i = 0; i < items.length; i++) {
    buffer[i] = items[i].value * 2;
  }
  return buffer.subarray(0, items.length);
}

// BETTER for transformation: preallocate result
function processWithPrealloc(items) {
  const result = new Array(items.length);
  for (let i = 0; i < items.length; i++) {
    result[i] = items[i].value * 2; // no new {}
  }
  return result;
}`,
    output: [
      '// Slow: N new objects → N GC allocations per call',
      '// Fast: typed array, zero GC pressure',
      '// Medium: preallocated array, minimal pressure',
    ],
    note: 'Use typed arrays (Float64Array, Int32Array) for numerical hot paths. Avoid short-lived object allocation inside loops called millions of times.',
  },
  {
    id: 'deopt-trace',
    title: 'Detecting Deoptimizations',
    description: 'How to identify deoptimization in Node.js with built-in flags.',
    code: `// Run with: node --trace-deopt --trace-opt app.js

function hotPath(x) {
  return x * x + Math.sqrt(x);
}

// Warm up (Ignition → TurboFan)
for (let i = 0; i < 50000; i++) hotPath(i);
// [opt] hotPath

// Force deopt by passing wrong type
hotPath("not-a-number");
// [deopt] hotPath reason: not a heap number

// Re-warm (Ignition again)
for (let i = 0; i < 50000; i++) hotPath(i);
// [opt] hotPath (re-optimized)

// Useful Node.js profiling flags:
// --prof             → generate V8 profiling log
// --trace-opt        → log optimizations
// --trace-deopt      → log deoptimizations
// --allow-natives-syntax → %OptimizeFunctionOnNextCall()`,
    output: [
      '[ignition] hotPath compiled to bytecode',
      '[turbofan] hotPath optimized after 50k calls',
      '[deopt]    hotPath: not a heap number',
      '[ignition] hotPath back to bytecode',
      '[turbofan] hotPath re-optimized',
    ],
    note: "Run Node.js with --trace-deopt to see every deoptimization in real time. The 'reason' field tells you exactly what assumption failed.",
  },
];

// ─── Gotchas ───────────────────────────────────────────────────────────────────
const gotchas = [
  {
    title: 'Polymorphic / Megamorphic call sites',
    severity: 'high',
    description:
      'When a function is called with objects of 5+ different hidden classes, its inline cache goes megamorphic — V8 stops caching and falls back to generic property lookup every time.',
    fix: 'Avoid passing objects with different shapes to the same function. Use a single canonical shape or class. TypeScript interfaces help enforce this.',
  },
  {
    title: 'Adding properties after construction',
    severity: 'high',
    description:
      "Every time you add a property to an object after it's been created, V8 creates a new hidden class transition. Object literals with all properties upfront share a single hidden class.",
    fix: 'Define ALL properties in the constructor or object literal. If you must add later, do it in a consistent order across all code paths.',
  },
  {
    title: 'delete operator breaks hidden classes',
    severity: 'medium',
    description:
      "Using delete obj.prop forces V8 to convert the object to 'dictionary mode' — a slower hash-table representation that foregoes hidden class optimizations entirely.",
    fix: 'Instead of delete, set the property to null or undefined. Use Map for dynamic key-value collections.',
  },
  {
    title: 'Allocating in hot loops',
    severity: 'high',
    description:
      'Creating new objects or arrays inside tight loops that run millions of times puts enormous pressure on the garbage collector. Even minor GC pauses accumulate into significant latency.',
    fix: 'Pre-allocate outside the loop. Use typed arrays for numeric data. Consider object pooling for complex objects that are frequently created and discarded.',
  },
];

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
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('js');
  const [source, setSource] = useState<string>(DEFAULT_JS);
  const [output, setOutput] = useState<OutputLine[]>([{ text: 'V8 Runtime ready.', kind: 'info' }]);
  const [speed, setSpeed] = useState<Speed>('slow');
  const [activeScenario, setActiveScenario] = useState(0);
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
    <section className="mb-8">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-br from-red-50 via-orange-50 to-amber-50 rounded-2xl p-8 mb-8 border border-red-200 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">V8 JavaScript Runtime</h1>
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            V8 is Google's high-performance JavaScript and WebAssembly engine powering Chrome and
            Node.js. It features a multi-tier JIT compilation pipeline, sophisticated optimization
            techniques, and an advanced generational garbage collector — all working together to
            make JavaScript as fast as possible.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              {
                label: 'Ignition Bytecode',
                cls: 'bg-purple-100 text-purple-800',
                icon: <Code2 className="w-4 h-4" />,
              },
              {
                label: 'Maglev JIT',
                cls: 'bg-green-100 text-green-800',
                icon: <Zap className="w-4 h-4" />,
              },
              {
                label: 'TurboFan JIT',
                cls: 'bg-amber-100 text-amber-800',
                icon: <Cpu className="w-4 h-4" />,
              },
              {
                label: 'Hidden Classes',
                cls: 'bg-indigo-100 text-indigo-800',
                icon: <Layers className="w-4 h-4" />,
              },
              {
                label: 'Orinoco GC',
                cls: 'bg-cyan-100 text-cyan-800',
                icon: <Trash2 className="w-4 h-4" />,
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

      {/* ── Compilation Pipeline ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">The Compilation Pipeline</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">How V8 Executes Code</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              V8 uses an adaptive multi-tier compilation strategy. Rather than compiling all code
              upfront, it starts fast with bytecode interpretation and progressively optimizes only
              the code that is actually "hot" (frequently executed).
            </p>
            <p className="text-gray-700 leading-relaxed">
              This approach gives the best of both worlds: near-instant startup (Ignition) and
              near-native execution speed for hot paths (TurboFan). The optimizer relies heavily on
              runtime type feedback — speculating on types to generate faster machine code.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Why JIT Beats Interpretation
            </h3>
            <div className="bg-linear-to-r from-red-50 to-amber-50 rounded-xl p-5 border border-red-200">
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex gap-2">
                  <BarChart2 className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span>
                    <strong>Interpreter:</strong> Decode and execute each bytecode instruction every
                    time. Simple but slow for hot code.
                  </span>
                </div>
                <div className="flex gap-2">
                  <Zap className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>JIT Compiler:</strong> Compiles hot bytecode to native machine code
                    once. Subsequent calls run at CPU speed.
                  </span>
                </div>
                <div className="flex gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>
                    <strong>Speculative JIT:</strong> Makes type assumptions to generate even faster
                    code, with a fallback deoptimization path.
                  </span>
                </div>
                <div className="flex gap-2">
                  <RefreshCw className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>Adaptive:</strong> Only JIT-compile hot functions. Cold code stays as
                    bytecode to save compile time and memory.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline steps */}
        <div className="bg-linear-to-r from-red-50 to-amber-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-5">Pipeline Stages</h3>
          <div className="flex flex-wrap gap-3">
            {pipelineSteps.map(({ step, color, label, icon, description, detail }) => {
              const c = colorCls[color];
              return (
                <div
                  key={label}
                  className={`flex-1 min-w-40 ${c.bg} ${c.border} border rounded-xl p-4`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-7 h-7 ${c.num} text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0`}
                    >
                      {step}
                    </span>
                    <span className={`font-semibold ${c.text} text-sm`}>{label}</span>
                  </div>
                  <div className={`${c.text} mb-2`}>{icon}</div>
                  <p className="text-xs text-gray-700 mb-2">{description}</p>
                  <p className={`text-xs font-medium ${c.text} italic`}>{detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Optimization Techniques ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Optimization Techniques</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {optimizationTechniques.map((t) => {
            const c = colorCls[t.color];
            return (
              <div
                key={t.name}
                className={`${c.bg} ${c.border} border rounded-xl p-5 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`w-9 h-9 ${c.num} text-white rounded-lg flex items-center justify-center shrink-0`}
                  >
                    {t.icon}
                  </span>
                  <h3 className={`font-semibold ${c.text} text-base`}>{t.name}</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">{t.description}</p>
                <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto font-mono leading-relaxed mb-2">
                  {t.code}
                </pre>
                <p className={`text-xs font-medium ${c.text} italic`}>{t.tip}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Code scenarios ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          <Code2 className="inline w-7 h-7 mr-2 text-red-600" />
          V8 Optimization Scenarios
        </h2>
        <p className="text-gray-600 mb-6">
          Explore real examples of how V8 optimization and deoptimization works, and what to do
          about it.
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(i)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeScenario === i
                  ? 'bg-red-500 text-white'
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
              <BookOpen className="w-4 h-4 text-red-600" />
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
            <div className="font-semibold text-gray-800 text-sm mb-3">V8 Behavior</div>
            <div className="space-y-2 mb-4">
              {scenarios[activeScenario].output.map((line, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
                >
                  <span className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </span>
                  <code className="text-sm text-gray-800 font-mono">{line}</code>
                </div>
              ))}
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              <strong>Key insight:</strong> {scenarios[activeScenario].note}
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive 2D Visualization ───────────────────────────────────── */}
      <div className="mb-8">
        <TwoDLayout
          title="2D Visualization: V8 Runtime"
          editor={editor}
          output={outputPanel}
          canvas={canvas2D}
        />
      </div>

      {/* ── Common Gotchas ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          <AlertTriangle className="inline w-7 h-7 mr-2 text-amber-500" />
          Common V8 Performance Pitfalls
        </h2>
        <p className="text-gray-600 mb-6">
          These patterns trigger deoptimizations or GC pressure and can silently kill hot-path
          performance.
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

export default V8Runtime;
