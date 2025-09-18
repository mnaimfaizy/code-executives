import React, { useEffect, useRef, useState } from 'react';
import TwoDLayout from '../../components/TwoDLayout';
import ModeTabs from '../../components/shared/ModeTabs';
import { type Speed } from '../../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../../components/shared/OutputPanel';
import Editor from '../../components/shared/Editor';
import useRunner from '../../hooks/useRunner';

type GCPhase = 'mark' | 'sweep' | 'compact' | 'idle';
type ObjectState = 'reachable' | 'unreachable' | 'collected';
type Generation = 'young' | 'old';

type GCObject = {
  id: string;
  state: ObjectState;
  generation: Generation;
  size: number;
  references: string[];
  x: number;
  y: number;
};

type Instruction =
  | { type: 'allocate'; id: string; size: number; generation: Generation }
  | { type: 'reference'; from: string; to: string }
  | { type: 'unreference'; from: string; to: string }
  | { type: 'gc-start'; phase: GCPhase; generation?: Generation }
  | { type: 'mark'; id: string }
  | { type: 'sweep'; id: string }
  | { type: 'compact'; objects: string[] };

type Compiled = { program: Instruction[] };

const DEFAULT_JS = `// Garbage Collection demonstration
let globalRef = null;

function createObjects() {
  // Young generation objects
  let obj1 = { data: "temp1" };
  let obj2 = { data: "temp2", ref: obj1 };
  
  // Create circular reference
  obj1.back = obj2;
  
  // Some objects become unreachable
  let temp = { data: "unreachable" };
  temp = null;
  
  // Keep reference to survive collection
  globalRef = obj2;
  
  return obj1; // This will be collected when function returns
}

// Trigger allocation and collection cycles
for (let i = 0; i < 5; i++) {
  createObjects();
  // Force GC cycle
  if (typeof gc === 'function') gc();
}`;

const DEFAULT_DSL = `// Garbage Collection simulation DSL
// allocate <id> <size> <generation>
// reference <from> <to>
// unreference <from> <to>  
// gc-start <phase> [generation]
// mark <id>
// sweep <id>
// compact <object-ids>

allocate obj1 100 young
allocate obj2 150 young
allocate obj3 200 old
reference obj1 obj2
reference obj2 obj3
unreference obj1 obj2
gc-start mark young
mark obj2
mark obj3  
gc-start sweep young
sweep obj1
gc-start compact
compact obj2 obj3`;

// Garbage Collection Visualization
const GarbageCollection2D: React.FC<{
  objects: GCObject[];
  currentPhase?: GCPhase;
  generation?: Generation;
}> = ({ objects, currentPhase, generation }) => {
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

    // Draw generation boundaries
    const youngHeight = height * 0.6;
    const oldHeight = height * 0.4;

    // Young generation area
    ctx.fillStyle = generation === 'young' && currentPhase ? '#fef3c7' : '#fafaf9';
    ctx.fillRect(0, 0, width, youngHeight);
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, youngHeight);

    // Old generation area
    ctx.fillStyle = generation === 'old' && currentPhase ? '#dbeafe' : '#f5f5f5';
    ctx.fillRect(0, youngHeight, width, oldHeight);
    ctx.strokeRect(0, youngHeight, width, oldHeight);

    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Young Generation (Nursery)', 10, 20);
    ctx.fillText('Old Generation (Tenured)', 10, youngHeight + 20);

    // GC Phase indicator
    if (currentPhase) {
      ctx.fillStyle = '#1f2937';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'right';
      const phaseText = `GC Phase: ${currentPhase.toUpperCase()}${generation ? ` (${generation})` : ''}`;
      ctx.fillText(phaseText, width - 10, 20);
    }

    // Draw objects
    objects.forEach((obj) => {
      const x = obj.x * width;
      const y =
        obj.generation === 'young'
          ? 50 + obj.y * (youngHeight - 100)
          : youngHeight + 50 + obj.y * (oldHeight - 100);

      const size = Math.max(20, Math.min(40, obj.size / 5));

      // Object color based on state
      let color = '#94a3b8'; // default
      if (obj.state === 'reachable') {
        color = obj.generation === 'young' ? '#22c55e' : '#3b82f6';
      } else if (obj.state === 'unreachable') {
        color = '#ef4444';
      } else if (obj.state === 'collected') {
        color = '#6b7280';
      }

      // Draw object
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw object ID
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(obj.id, x, y + 3);

      // Draw size
      ctx.font = '8px sans-serif';
      ctx.fillText(`${obj.size}B`, x, y + 15);
    });

    // Draw references
    objects.forEach((obj) => {
      obj.references.forEach((refId) => {
        const refObj = objects.find((o) => o.id === refId);
        if (!refObj) return;

        const fromX = obj.x * width;
        const fromY =
          obj.generation === 'young'
            ? 50 + obj.y * (youngHeight - 100)
            : youngHeight + 50 + obj.y * (oldHeight - 100);

        const toX = refObj.x * width;
        const toY =
          refObj.generation === 'young'
            ? 50 + refObj.y * (youngHeight - 100)
            : youngHeight + 50 + refObj.y * (oldHeight - 100);

        // Draw arrow
        ctx.strokeStyle = obj.state === 'reachable' ? '#059669' : '#9ca3af';
        ctx.lineWidth = obj.state === 'reachable' ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const arrowLength = 8;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
          toX - arrowLength * Math.cos(angle - Math.PI / 6),
          toY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(toX, toY);
        ctx.lineTo(
          toX - arrowLength * Math.cos(angle + Math.PI / 6),
          toY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      });
    });

    // Draw GC stats
    const reachableCount = objects.filter((o) => o.state === 'reachable').length;
    const unreachableCount = objects.filter((o) => o.state === 'unreachable').length;
    const collectedCount = objects.filter((o) => o.state === 'collected').length;
    const totalMemory = objects.reduce((sum, o) => sum + (o.state !== 'collected' ? o.size : 0), 0);

    ctx.fillStyle = '#1f2937';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Reachable: ${reachableCount}`, 10, height - 60);
    ctx.fillText(`Unreachable: ${unreachableCount}`, 10, height - 45);
    ctx.fillText(`Collected: ${collectedCount}`, 10, height - 30);
    ctx.fillText(`Memory: ${totalMemory}B`, 10, height - 15);
  }, [objects, currentPhase, generation]);

  return (
    <canvas ref={canvasRef} className="h-full w-full" style={{ width: '100%', height: '100%' }} />
  );
};

const GarbageCollection: React.FC = () => {
  const [mode, setMode] = useState<'2D' | '3D'>('2D');
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('js');
  const [source, setSource] = useState<string>(DEFAULT_JS);
  const [output, setOutput] = useState<OutputLine[]>([
    { text: 'Ready for GC simulation.', kind: 'info' },
  ]);
  const [speed, setSpeed] = useState<Speed>('slow');
  const [objects, setObjects] = useState<GCObject[]>([]);
  const [currentPhase, setCurrentPhase] = useState<GCPhase | undefined>();
  const [generation, setGeneration] = useState<Generation | undefined>();
  const compiledRef = useRef<Compiled | null>(null);

  const log = (msg: string, opts?: { kind?: OutputLine['kind'] }) =>
    setOutput((o) => [...o, { text: msg, kind: opts?.kind }]);

  const reset = () => {
    setObjects([]);
    setCurrentPhase(undefined);
    setGeneration(undefined);
    setOutput([{ text: 'Reset.', kind: 'info' }]);
    compiledRef.current = null;
  };

  const ensureCompiled = (): Compiled => {
    if (compiledRef.current) return compiledRef.current;

    try {
      if (inputMode === 'js') {
        // Simulate GC behavior based on code analysis
        const program: Instruction[] = [];

        // Create some initial objects
        program.push({ type: 'allocate', id: 'obj1', size: 100, generation: 'young' });
        program.push({ type: 'allocate', id: 'obj2', size: 150, generation: 'young' });
        program.push({ type: 'allocate', id: 'global', size: 200, generation: 'old' });

        // Create references
        program.push({ type: 'reference', from: 'obj1', to: 'obj2' });
        program.push({ type: 'reference', from: 'global', to: 'obj2' });

        // Simulate function scope ending (obj1 becomes unreachable)
        program.push({ type: 'unreference', from: 'obj1', to: 'obj2' });

        // Trigger GC cycle
        program.push({ type: 'gc-start', phase: 'mark', generation: 'young' });
        program.push({ type: 'mark', id: 'global' });
        program.push({ type: 'mark', id: 'obj2' });

        program.push({ type: 'gc-start', phase: 'sweep', generation: 'young' });
        program.push({ type: 'sweep', id: 'obj1' });

        program.push({ type: 'gc-start', phase: 'compact' });
        program.push({ type: 'compact', objects: ['obj2', 'global'] });

        compiledRef.current = { program };
        return compiledRef.current;
      } else {
        // DSL mode - parse instructions
        const lines = source.split('\n').filter((l) => l.trim() && !l.trim().startsWith('//'));
        const program: Instruction[] = [];

        for (const line of lines) {
          const [cmd, ...rest] = line.trim().split(/\s+/);
          if (cmd === 'allocate') {
            program.push({
              type: 'allocate',
              id: rest[0],
              size: parseInt(rest[1]),
              generation: rest[2] as Generation,
            });
          } else if (cmd === 'reference') {
            program.push({ type: 'reference', from: rest[0], to: rest[1] });
          } else if (cmd === 'unreference') {
            program.push({ type: 'unreference', from: rest[0], to: rest[1] });
          } else if (cmd === 'gc-start') {
            program.push({
              type: 'gc-start',
              phase: rest[0] as GCPhase,
              generation: rest[1] as Generation | undefined,
            });
          } else if (cmd === 'mark') {
            program.push({ type: 'mark', id: rest[0] });
          } else if (cmd === 'sweep') {
            program.push({ type: 'sweep', id: rest[0] });
          } else if (cmd === 'compact') {
            program.push({ type: 'compact', objects: rest });
          }
        }

        compiledRef.current = { program };
        return compiledRef.current;
      }
    } catch (e) {
      log(`GC simulation error: ${e instanceof Error ? e.message : String(e)}`, { kind: 'error' });
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
      if (ins.type === 'allocate') {
        const newObj: GCObject = {
          id: ins.id,
          state: 'reachable',
          generation: ins.generation,
          size: ins.size,
          references: [],
          x: Math.random() * 0.8 + 0.1,
          y: Math.random() * 0.8 + 0.1,
        };
        setObjects((objs) => [...objs, newObj]);
        log(`Allocated ${ins.id} (${ins.size}B, ${ins.generation})`, { kind: 'info' });
      } else if (ins.type === 'reference') {
        setObjects((objs) =>
          objs.map((obj) =>
            obj.id === ins.from ? { ...obj, references: [...obj.references, ins.to] } : obj
          )
        );
        log(`Reference: ${ins.from} → ${ins.to}`, { kind: 'log' });
      } else if (ins.type === 'unreference') {
        setObjects((objs) =>
          objs.map((obj) =>
            obj.id === ins.from
              ? { ...obj, references: obj.references.filter((ref) => ref !== ins.to) }
              : obj
          )
        );
        log(`Unreference: ${ins.from} ↛ ${ins.to}`, { kind: 'log' });
      } else if (ins.type === 'gc-start') {
        setCurrentPhase(ins.phase);
        setGeneration(ins.generation);
        log(`GC ${ins.phase} phase started${ins.generation ? ` (${ins.generation})` : ''}`, {
          kind: 'info',
        });
      } else if (ins.type === 'mark') {
        setObjects((objs) =>
          objs.map((obj) =>
            obj.id === ins.id ? { ...obj, state: 'reachable' as ObjectState } : obj
          )
        );
        log(`Marked ${ins.id} as reachable`, { kind: 'info' });
      } else if (ins.type === 'sweep') {
        setObjects((objs) =>
          objs.map((obj) =>
            obj.id === ins.id ? { ...obj, state: 'collected' as ObjectState } : obj
          )
        );
        log(`Swept ${ins.id} (collected)`, { kind: 'info' });
      } else if (ins.type === 'compact') {
        log(`Compacted objects: ${ins.objects.join(', ')}`, { kind: 'info' });
        // Reset positions for compacted objects
        setObjects((objs) =>
          objs.map((obj) =>
            ins.objects.includes(obj.id)
              ? { ...obj, x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.8 + 0.1 }
              : obj
          )
        );
      }
    },
    getIntervalMs: (s) => (s === 'very-slow' ? 2000 : s === 'slow' ? 1200 : 600),
    onComplete: () => {
      setCurrentPhase(undefined);
      setGeneration(undefined);
      log('GC cycle complete.', { kind: 'info' });
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
      title="Source Code"
      selectId="gc-input-mode-select"
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
      placeholderJs="Write JavaScript to see garbage collection in action"
      placeholderDsl="Use GC commands: allocate, reference, gc-start, mark, sweep, compact"
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
      {/* GC Algorithm Info */}
      <div className="rounded-md border border-gray-300 p-3" style={{ height: '25%' }}>
        <h4 className="mb-2 text-sm font-semibold">GC Algorithm: Generational Mark & Sweep</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <strong>Young Generation:</strong> Fast allocation, frequent collection
          </div>
          <div>
            <strong>Old Generation:</strong> Long-lived objects, infrequent collection
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          <strong>Current Phase:</strong> {currentPhase || 'Idle'}
          {generation && ` (${generation})`}
        </div>
      </div>

      {/* Memory Layout Visualization */}
      <div className="flex-1 rounded-md border border-gray-300">
        <div className="p-2">
          <h4 className="text-sm font-semibold">Memory Layout & Object Graph</h4>
        </div>
        <div className="h-full">
          <GarbageCollection2D
            objects={objects}
            currentPhase={currentPhase}
            generation={generation}
          />
        </div>
      </div>
    </div>
  );

  return (
    <section className="mb-4">
      <h2 className="text-base font-semibold">Garbage Collection</h2>

      {/* Engine Context Introduction */}
      <div className="mb-4 rounded-lg bg-red-50 p-3">
        <h3 className="mb-2 text-sm font-semibold text-red-900">Role in JavaScript Engine</h3>
        <p className="mb-2 text-xs text-red-800">
          Garbage Collection is the engine's automatic memory management system. It tracks object
          reachability, reclaims unused memory, and prevents memory leaks without manual
          intervention.
        </p>
        <p className="text-xs text-red-700">
          <strong>Engine Integration:</strong> Heap Allocation → Reachability Analysis → Mark &
          Sweep → Memory Compaction
        </p>
      </div>

      {/* Theory Section */}
      <div className="mb-3">
        <h3 className="mb-2 text-sm font-semibold">Generational Garbage Collection</h3>
        <p className="mb-2 text-sm text-gray-700">
          Modern engines use generational GC based on the weak generational hypothesis: most objects
          die young. This allows frequent collection of short-lived objects while minimizing
          collection of long-lived ones.
        </p>
        <div className="mb-2 grid grid-cols-1 gap-2 text-xs text-gray-600 md:grid-cols-2">
          <div>
            <strong>Collection Phases:</strong>
            <ul className="ml-3 list-disc">
              <li>
                <strong>Mark:</strong> Identify reachable objects from roots
              </li>
              <li>
                <strong>Sweep:</strong> Free memory of unreachable objects
              </li>
              <li>
                <strong>Compact:</strong> Reduce fragmentation
              </li>
              <li>
                <strong>Concurrent:</strong> Run alongside application
              </li>
            </ul>
          </div>
          <div>
            <strong>GC Roots:</strong>
            <ul className="ml-3 list-disc">
              <li>Global variables</li>
              <li>Call stack references</li>
              <li>Native objects</li>
              <li>Persistent handles</li>
            </ul>
          </div>
        </div>
      </div>

      <ModeTabs mode={mode} onChange={setMode} />

      {mode === '2D' ? (
        <div className="mt-2">
          <TwoDLayout
            title="2D Visualization: Garbage Collection"
            editor={editor}
            output={outputPanel}
            canvas={canvas2D}
          />
        </div>
      ) : (
        <div className="mt-2 text-sm text-gray-600">
          3D visualization for Garbage Collection is coming soon.
        </div>
      )}
    </section>
  );
};

export default GarbageCollection;
