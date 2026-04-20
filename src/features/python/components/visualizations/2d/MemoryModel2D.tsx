import React, { useState, useEffect, useMemo, useCallback } from 'react';
import VisualizationControls from '../../../../../components/shared/VisualizationControls';

interface MemoryModel2DProps {
  activeStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface MemoryObject {
  id: string;
  label: string;
  refCount: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  gen?: number;
  alive?: boolean;
}

interface Reference {
  from: string;
  to: string;
  color: string;
  label?: string;
}

interface StepData {
  title: string;
  description: string;
  code: string;
  stackVars: Array<{ name: string; value: string; pointsTo?: string }>;
  heapObjects: MemoryObject[];
  references: Reference[];
  gcHighlight?: 'gen0' | 'gen1' | 'gen2' | 'sweep' | 'pools';
  showPools?: boolean;
}

const MemoryModel2D: React.FC<MemoryModel2DProps> = ({
  activeStep = 0,
  onStepChange,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(activeStep);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [animPhase, setAnimPhase] = useState(0);

  const steps: StepData[] = useMemo(
    () => [
      {
        title: '1. Object Creation & Reference Counting',
        description:
          'Every Python object has a reference count. When you assign a variable, Python creates an object on the heap and the variable on the stack points to it.',
        code: 'x = 42          # ref count: 1\ny = "hello"     # ref count: 1\ndata = [1, 2, 3] # ref count: 1',
        stackVars: [
          { name: 'x', value: '42', pointsTo: 'int_42' },
          { name: 'y', value: '"hello"', pointsTo: 'str_hello' },
          { name: 'data', value: '[...]', pointsTo: 'list_123' },
        ],
        heapObjects: [
          {
            id: 'int_42',
            label: 'int(42)',
            refCount: 1,
            x: 380,
            y: 75,
            w: 110,
            h: 40,
            color: '#3B82F6',
            alive: true,
          },
          {
            id: 'str_hello',
            label: 'str("hello")',
            refCount: 1,
            x: 380,
            y: 155,
            w: 110,
            h: 40,
            color: '#8B5CF6',
            alive: true,
          },
          {
            id: 'list_123',
            label: 'list [1,2,3]',
            refCount: 1,
            x: 380,
            y: 235,
            w: 110,
            h: 40,
            color: '#10B981',
            alive: true,
          },
        ],
        references: [
          { from: 'x', to: 'int_42', color: '#3B82F6' },
          { from: 'y', to: 'str_hello', color: '#8B5CF6' },
          { from: 'data', to: 'list_123', color: '#10B981' },
        ],
      },
      {
        title: '2. Reference Count Increases',
        description:
          'When multiple variables reference the same object, the reference count increases. The object stays alive as long as ref count > 0.',
        code: 'a = x           # x ref count: 2\nb = x           # x ref count: 3\nalias = data    # data ref count: 2',
        stackVars: [
          { name: 'x', value: '42', pointsTo: 'int_42' },
          { name: 'a', value: '42', pointsTo: 'int_42' },
          { name: 'b', value: '42', pointsTo: 'int_42' },
          { name: 'data', value: '[...]', pointsTo: 'list_123' },
          { name: 'alias', value: '[...]', pointsTo: 'list_123' },
        ],
        heapObjects: [
          {
            id: 'int_42',
            label: 'int(42)',
            refCount: 3,
            x: 380,
            y: 95,
            w: 110,
            h: 50,
            color: '#3B82F6',
            alive: true,
          },
          {
            id: 'list_123',
            label: 'list [1,2,3]',
            refCount: 2,
            x: 380,
            y: 215,
            w: 110,
            h: 50,
            color: '#10B981',
            alive: true,
          },
        ],
        references: [
          { from: 'x', to: 'int_42', color: '#3B82F6' },
          { from: 'a', to: 'int_42', color: '#60A5FA' },
          { from: 'b', to: 'int_42', color: '#93C5FD' },
          { from: 'data', to: 'list_123', color: '#10B981' },
          { from: 'alias', to: 'list_123', color: '#6EE7B7' },
        ],
      },
      {
        title: '3. Reference Count Decreases & Deallocation',
        description:
          'When a variable is deleted or goes out of scope, the reference count decreases. When it reaches 0, the object is immediately deallocated.',
        code: 'del a           # x ref count: 2\ndel b           # x ref count: 1\ntemp = "gone"   # created then...\ndel temp        # ref=0 → freed!',
        stackVars: [
          { name: 'x', value: '42', pointsTo: 'int_42' },
          { name: 'data', value: '[...]', pointsTo: 'list_123' },
        ],
        heapObjects: [
          {
            id: 'int_42',
            label: 'int(42)',
            refCount: 1,
            x: 380,
            y: 95,
            w: 110,
            h: 50,
            color: '#3B82F6',
            alive: true,
          },
          {
            id: 'list_123',
            label: 'list [1,2,3]',
            refCount: 1,
            x: 380,
            y: 215,
            w: 110,
            h: 50,
            color: '#10B981',
            alive: true,
          },
          {
            id: 'str_gone',
            label: 'str("gone")',
            refCount: 0,
            x: 380,
            y: 305,
            w: 110,
            h: 40,
            color: '#EF4444',
            alive: false,
          },
        ],
        references: [
          { from: 'x', to: 'int_42', color: '#3B82F6' },
          { from: 'data', to: 'list_123', color: '#10B981' },
        ],
      },
      {
        title: '4. Circular References — The Problem',
        description:
          'Reference counting alone cannot detect circular references. Objects that reference each other keep ref counts > 0 even when unreachable from the program.',
        code: 'class Node:\n    def __init__(self):\n        self.ref = None\n\na = Node(); b = Node()\na.ref = b  # b.refcount = 2\nb.ref = a  # a.refcount = 2\ndel a; del b  # both refcount=1\n# Memory leaked without cyclic GC!',
        stackVars: [],
        heapObjects: [
          {
            id: 'node_a',
            label: 'Node A',
            refCount: 1,
            x: 360,
            y: 120,
            w: 100,
            h: 50,
            color: '#F59E0B',
            alive: true,
          },
          {
            id: 'node_b',
            label: 'Node B',
            refCount: 1,
            x: 460,
            y: 230,
            w: 100,
            h: 50,
            color: '#F59E0B',
            alive: true,
          },
        ],
        references: [
          { from: 'node_a_ref', to: 'node_b', color: '#EF4444', label: 'a.ref' },
          { from: 'node_b_ref', to: 'node_a', color: '#EF4444', label: 'b.ref' },
        ],
      },
      {
        title: '5. Generational Garbage Collector',
        description:
          "Python's cyclic GC uses 3 generations. New objects start in Gen 0. Objects that survive a GC cycle promote to Gen 1, then Gen 2. Younger generations are collected more frequently.",
        code: 'import gc\nprint(gc.get_threshold())\n# (700, 10, 10)\n# Gen 0: every 700 allocs\n# Gen 1: every 10 Gen-0 cycles\n# Gen 2: every 10 Gen-1 cycles',
        stackVars: [],
        heapObjects: [
          {
            id: 'gen0_1',
            label: 'new obj',
            refCount: 1,
            x: 340,
            y: 85,
            w: 75,
            h: 32,
            color: '#10B981',
            gen: 0,
            alive: true,
          },
          {
            id: 'gen0_2',
            label: 'new obj',
            refCount: 0,
            x: 430,
            y: 85,
            w: 75,
            h: 32,
            color: '#EF4444',
            gen: 0,
            alive: false,
          },
          {
            id: 'gen0_3',
            label: 'new obj',
            refCount: 1,
            x: 520,
            y: 85,
            w: 75,
            h: 32,
            color: '#10B981',
            gen: 0,
            alive: true,
          },
          {
            id: 'gen1_1',
            label: 'survived',
            refCount: 2,
            x: 340,
            y: 175,
            w: 75,
            h: 32,
            color: '#3B82F6',
            gen: 1,
            alive: true,
          },
          {
            id: 'gen1_2',
            label: 'survived',
            refCount: 1,
            x: 430,
            y: 175,
            w: 75,
            h: 32,
            color: '#3B82F6',
            gen: 1,
            alive: true,
          },
          {
            id: 'gen2_1',
            label: 'long-lived',
            refCount: 5,
            x: 340,
            y: 265,
            w: 75,
            h: 32,
            color: '#8B5CF6',
            gen: 2,
            alive: true,
          },
          {
            id: 'gen2_2',
            label: 'long-lived',
            refCount: 3,
            x: 430,
            y: 265,
            w: 75,
            h: 32,
            color: '#8B5CF6',
            gen: 2,
            alive: true,
          },
          {
            id: 'gen2_3',
            label: 'long-lived',
            refCount: 8,
            x: 520,
            y: 265,
            w: 75,
            h: 32,
            color: '#8B5CF6',
            gen: 2,
            alive: true,
          },
        ],
        references: [],
        gcHighlight: 'gen0',
      },
      {
        title: '6. Mark & Sweep in Action',
        description:
          'The cyclic GC uses mark-and-sweep: it traces all reachable objects from root references (green), then sweeps unreachable objects (red) for deallocation.',
        code: '# GC traces from roots:\n# root → obj1 → obj3  (reachable)\n# root → obj2         (reachable)\n# obj4 → obj5 → obj4  (unreachable cycle)\n# obj6                (unreachable)',
        stackVars: [{ name: 'root', value: '→', pointsTo: 'obj_1' }],
        heapObjects: [
          {
            id: 'obj_1',
            label: 'obj1',
            refCount: 1,
            x: 345,
            y: 80,
            w: 70,
            h: 35,
            color: '#10B981',
            alive: true,
          },
          {
            id: 'obj_2',
            label: 'obj2',
            refCount: 1,
            x: 445,
            y: 80,
            w: 70,
            h: 35,
            color: '#10B981',
            alive: true,
          },
          {
            id: 'obj_3',
            label: 'obj3',
            refCount: 1,
            x: 540,
            y: 80,
            w: 70,
            h: 35,
            color: '#10B981',
            alive: true,
          },
          {
            id: 'obj_4',
            label: 'obj4',
            refCount: 1,
            x: 345,
            y: 205,
            w: 70,
            h: 35,
            color: '#EF4444',
            alive: false,
          },
          {
            id: 'obj_5',
            label: 'obj5',
            refCount: 1,
            x: 445,
            y: 205,
            w: 70,
            h: 35,
            color: '#EF4444',
            alive: false,
          },
          {
            id: 'obj_6',
            label: 'obj6',
            refCount: 0,
            x: 540,
            y: 205,
            w: 70,
            h: 35,
            color: '#EF4444',
            alive: false,
          },
        ],
        references: [{ from: 'root', to: 'obj_1', color: '#10B981' }],
        gcHighlight: 'sweep',
      },
      {
        title: '7. Python Memory Allocator (pymalloc)',
        description:
          'Python uses a 3-level allocator: Arenas (256KB) → Pools (4KB) → Blocks (8-512 bytes). Small objects use pymalloc for speed; large objects go to the OS.',
        code: '# Memory hierarchy:\n# Arena (256 KB) → Pool (4 KB) → Block\n#\n# Block sizes: 8, 16, 24, ... 512 bytes\n# Objects > 512 bytes → malloc()\nimport sys\nprint(sys.getallocatedblocks())',
        stackVars: [],
        heapObjects: [],
        references: [],
        showPools: true,
      },
      {
        title: '8. Memory Profiling & Optimization',
        description:
          'Python provides tracemalloc, gc module, and weakref for monitoring and optimizing memory. Understanding these helps build efficient applications.',
        code: 'import tracemalloc\ntracemalloc.start()\n\n# ... your code ...\n\nsnapshot = tracemalloc.take_snapshot()\nfor stat in snapshot.statistics("lineno")[:5]:\n    print(stat)\n\nimport gc\ngc.collect()  # Force collection',
        stackVars: [
          { name: 'snapshot', value: 'Snapshot', pointsTo: 'snap' },
          { name: 'gc', value: 'module' },
        ],
        heapObjects: [
          {
            id: 'snap',
            label: 'Snapshot',
            refCount: 1,
            x: 380,
            y: 90,
            w: 120,
            h: 40,
            color: '#3B82F6',
            alive: true,
          },
          {
            id: 'stats',
            label: 'Stats[]',
            refCount: 1,
            x: 380,
            y: 170,
            w: 120,
            h: 40,
            color: '#8B5CF6',
            alive: true,
          },
          {
            id: 'trace1',
            label: 'file.py:12',
            refCount: 1,
            x: 350,
            y: 250,
            w: 90,
            h: 32,
            color: '#10B981',
            alive: true,
          },
          {
            id: 'trace2',
            label: 'file.py:45',
            refCount: 1,
            x: 460,
            y: 250,
            w: 90,
            h: 32,
            color: '#F59E0B',
            alive: true,
          },
        ],
        references: [{ from: 'snapshot', to: 'snap', color: '#3B82F6' }],
      },
    ],
    []
  );

  useEffect(() => {
    setCurrentStep(activeStep);
  }, [activeStep]);

  // Animation pulse
  useEffect(() => {
    const interval = window.setInterval(() => {
      setAnimPhase((p) => (p + 1) % 60);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = useCallback(() => setIsPlaying((p) => !p), []);
  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    onStepChange?.(0);
  }, [onStepChange]);
  const handleStepBack = useCallback(() => {
    const s = Math.max(0, currentStep - 1);
    setCurrentStep(s);
    onStepChange?.(s);
  }, [currentStep, onStepChange]);
  const handleStepForward = useCallback(() => {
    const s = Math.min(steps.length - 1, currentStep + 1);
    setCurrentStep(s);
    onStepChange?.(s);
  }, [currentStep, steps.length, onStepChange]);
  const handleSpeedChange = useCallback((s: number) => setSpeed(s), []);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) return;
    const id = window.setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          setIsPlaying(false);
          return prev;
        }
        onStepChange?.(next);
        return next;
      });
    }, 3000 / speed);
    return () => clearInterval(id);
  }, [isPlaying, currentStep, steps.length, speed, onStepChange]);

  const step = steps[currentStep];
  const pulse = Math.sin(animPhase * 0.15) * 0.15 + 0.85;

  const getStackVarY = (index: number): number => 80 + index * 48;
  const getStackVarCenter = (index: number): { x: number; y: number } => ({
    x: 165,
    y: getStackVarY(index) + 16,
  });
  const getObjCenter = (obj: MemoryObject): { x: number; y: number } => ({
    x: obj.x + obj.w / 2,
    y: obj.y + obj.h / 2,
  });

  const renderPools = (): React.ReactNode => (
    <g>
      <rect
        x="310"
        y="40"
        width="280"
        height="290"
        rx="10"
        fill="#F0F9FF"
        stroke="#3B82F6"
        strokeWidth="2.5"
        strokeDasharray="8 4"
      />
      <text x="450" y="62" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1E40AF">
        Arena (256 KB)
      </text>
      <rect
        x="325"
        y="75"
        width="120"
        height="110"
        rx="6"
        fill="#EDE9FE"
        stroke="#7C3AED"
        strokeWidth="1.5"
      />
      <text x="385" y="92" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#5B21B6">
        Pool (4 KB)
      </text>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={`b1_${i}`}
          x={335 + (i % 3) * 34}
          y={100 + Math.floor(i / 3) * 34}
          width="28"
          height="28"
          rx="3"
          fill={i < 4 ? '#A78BFA' : '#E5E7EB'}
          stroke={i < 4 ? '#7C3AED' : '#9CA3AF'}
          strokeWidth="1"
          opacity={i < 4 ? pulse : 0.5}
        />
      ))}
      <text x="385" y="178" textAnchor="middle" fontSize="8" fill="#6B7280">
        8-byte blocks
      </text>
      <rect
        x="455"
        y="75"
        width="120"
        height="110"
        rx="6"
        fill="#ECFDF5"
        stroke="#059669"
        strokeWidth="1.5"
      />
      <text x="515" y="92" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#065F46">
        Pool (4 KB)
      </text>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={`b2_${i}`}
          x={468 + (i % 2) * 48}
          y={100 + Math.floor(i / 2) * 34}
          width="40"
          height="28"
          rx="3"
          fill={i < 3 ? '#6EE7B7' : '#E5E7EB'}
          stroke={i < 3 ? '#059669' : '#9CA3AF'}
          strokeWidth="1"
          opacity={i < 3 ? pulse : 0.5}
        />
      ))}
      <text x="515" y="178" textAnchor="middle" fontSize="8" fill="#6B7280">
        64-byte blocks
      </text>
      <rect
        x="325"
        y="195"
        width="250"
        height="65"
        rx="6"
        fill="#FFF7ED"
        stroke="#EA580C"
        strokeWidth="1.5"
      />
      <text x="450" y="212" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#9A3412">
        Pool (4 KB)
      </text>
      {[0, 1, 2].map((i) => (
        <rect
          key={`b3_${i}`}
          x={340 + i * 75}
          y={220}
          width="60"
          height="28"
          rx="3"
          fill={i < 2 ? '#FDBA74' : '#E5E7EB'}
          stroke={i < 2 ? '#EA580C' : '#9CA3AF'}
          strokeWidth="1"
          opacity={i < 2 ? pulse : 0.5}
        />
      ))}
      <text x="450" y="260" textAnchor="middle" fontSize="8" fill="#6B7280">
        512-byte blocks
      </text>
      <text x="450" y="300" textAnchor="middle" fontSize="9" fill="#6B7280">
        {'Objects > 512 bytes → OS malloc()'}
      </text>
      <rect x="320" y="315" width="12" height="12" rx="2" fill="#A78BFA" />
      <text x="337" y="325" fontSize="9" fill="#6B7280">
        Used
      </text>
      <rect x="380" y="315" width="12" height="12" rx="2" fill="#E5E7EB" />
      <text x="397" y="325" fontSize="9" fill="#6B7280">
        Free
      </text>
    </g>
  );

  const renderGenerations = (): React.ReactNode => (
    <g>
      <rect
        x="310"
        y="55"
        width="280"
        height="60"
        rx="6"
        fill="#ECFDF5"
        stroke="#10B981"
        strokeWidth="2"
        opacity={step.gcHighlight === 'gen0' ? 1 : 0.6}
      />
      <text x="320" y="73" fontSize="11" fontWeight="bold" fill="#065F46">
        Gen 0 (Young)
      </text>
      <text x="320" y="86" fontSize="8" fill="#059669">
        Collected most frequently — threshold: 700
      </text>
      <rect
        x="310"
        y="145"
        width="280"
        height="60"
        rx="6"
        fill="#EFF6FF"
        stroke="#3B82F6"
        strokeWidth="2"
        opacity={0.7}
      />
      <text x="320" y="163" fontSize="11" fontWeight="bold" fill="#1E40AF">
        Gen 1 (Middle)
      </text>
      <text x="320" y="176" fontSize="8" fill="#3B82F6">
        Collected less often — threshold: 10
      </text>
      <rect
        x="310"
        y="235"
        width="280"
        height="60"
        rx="6"
        fill="#F5F3FF"
        stroke="#8B5CF6"
        strokeWidth="2"
        opacity={0.7}
      />
      <text x="320" y="253" fontSize="11" fontWeight="bold" fill="#5B21B6">
        Gen 2 (Old)
      </text>
      <text x="320" y="266" fontSize="8" fill="#7C3AED">
        Collected rarely — threshold: 10
      </text>
      <defs>
        <marker id="promo-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#6B7280" />
        </marker>
      </defs>
      <line
        x1="450"
        y1="115"
        x2="450"
        y2="142"
        stroke="#6B7280"
        strokeWidth="1.5"
        markerEnd="url(#promo-arrow)"
        strokeDasharray="4 2"
      />
      <text x="465" y="132" fontSize="8" fill="#6B7280">
        promote
      </text>
      <line
        x1="450"
        y1="205"
        x2="450"
        y2="232"
        stroke="#6B7280"
        strokeWidth="1.5"
        markerEnd="url(#promo-arrow)"
        strokeDasharray="4 2"
      />
      <text x="465" y="222" fontSize="8" fill="#6B7280">
        promote
      </text>
    </g>
  );

  const renderCircularRefs = (): React.ReactNode => {
    const a = { x: 360, y: 120 };
    const b = { x: 460, y: 230 };
    return (
      <g>
        <rect
          x="330"
          y="90"
          width="260"
          height="220"
          rx="10"
          fill="#FEF2F2"
          stroke="#EF4444"
          strokeWidth="1.5"
          strokeDasharray="6 3"
          opacity={0.6}
        />
        <text x="460" y="300" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#DC2626">
          ⚠ Unreachable cycle — needs cyclic GC!
        </text>
        <path
          d={`M ${a.x + 100} ${a.y + 25} Q ${a.x + 150} ${(a.y + b.y) / 2} ${b.x + 100} ${b.y}`}
          fill="none"
          stroke="#EF4444"
          strokeWidth="2.5"
          markerEnd="url(#ref-arrow-red)"
          opacity={pulse}
        />
        <text x={a.x + 140} y={(a.y + b.y) / 2 - 5} fontSize="9" fill="#DC2626" fontWeight="bold">
          a.ref
        </text>
        <path
          d={`M ${b.x} ${b.y + 25} Q ${b.x - 70} ${(a.y + b.y) / 2 + 20} ${a.x} ${a.y + 50}`}
          fill="none"
          stroke="#EF4444"
          strokeWidth="2.5"
          markerEnd="url(#ref-arrow-red)"
          opacity={pulse}
        />
        <text x={b.x - 65} y={(a.y + b.y) / 2 + 35} fontSize="9" fill="#DC2626" fontWeight="bold">
          b.ref
        </text>
      </g>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 rounded-xl p-5 shadow-lg border border-blue-100">
        <svg
          viewBox="0 0 620 345"
          className="w-full border-2 border-blue-100 rounded-lg bg-white/90 backdrop-blur-sm mb-4"
          style={{ minHeight: '280px' }}
        >
          <defs>
            <linearGradient id="mm-stackGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EEF2FF" />
              <stop offset="100%" stopColor="#E0E7FF" />
            </linearGradient>
            <linearGradient id="mm-heapGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FAF5FF" />
              <stop offset="100%" stopColor="#F3E8FF" />
            </linearGradient>
            <marker id="ref-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#6366F1" />
            </marker>
            <marker
              id="ref-arrow-red"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#EF4444" />
            </marker>
            <marker
              id="ref-arrow-green"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#10B981" />
            </marker>
            <filter id="mm-shadow">
              <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* Stack Region */}
          {step.stackVars.length > 0 && (
            <g>
              <rect
                x="30"
                y="40"
                width="200"
                height={Math.max(step.stackVars.length * 48 + 50, 270)}
                rx="10"
                fill="url(#mm-stackGrad)"
                stroke="#818CF8"
                strokeWidth="1.5"
                filter="url(#mm-shadow)"
              />
              <text
                x="130"
                y="62"
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#3730A3"
              >
                STACK (Call Frame)
              </text>
              {step.stackVars.map((v, i) => {
                const y = getStackVarY(i);
                return (
                  <g key={v.name}>
                    <rect
                      x="50"
                      y={y}
                      width="160"
                      height="36"
                      rx="5"
                      fill="white"
                      stroke="#A5B4FC"
                      strokeWidth="1"
                    />
                    <text x="62" y={y + 15} fontSize="10" fontWeight="bold" fill="#4338CA">
                      {v.name}
                    </text>
                    <text x="62" y={y + 28} fontSize="9" fill="#6B7280">
                      {v.value}
                    </text>
                    {v.pointsTo && (
                      <circle cx="195" cy={y + 18} r="5" fill="#6366F1" opacity="0.7" />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Heap Region */}
          {!step.showPools && step.gcHighlight !== 'gen0' && (
            <g>
              <rect
                x="300"
                y="40"
                width="295"
                height="280"
                rx="10"
                fill="url(#mm-heapGrad)"
                stroke="#C084FC"
                strokeWidth="1.5"
                filter="url(#mm-shadow)"
              />
              <text
                x="447"
                y="62"
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#6B21A8"
              >
                HEAP (Objects)
              </text>
            </g>
          )}

          {step.showPools && renderPools()}
          {step.gcHighlight === 'gen0' && renderGenerations()}

          {/* Heap objects */}
          {step.heapObjects.map((obj) => (
            <g key={obj.id}>
              <rect
                x={obj.x}
                y={obj.y}
                width={obj.w}
                height={obj.h}
                rx="6"
                fill={obj.alive ? obj.color : '#FCA5A5'}
                stroke={obj.alive ? obj.color : '#EF4444'}
                strokeWidth={obj.alive ? 1.5 : 2}
                opacity={obj.alive === false ? 0.5 * pulse : 0.9}
                filter="url(#mm-shadow)"
              />
              <text
                x={obj.x + obj.w / 2}
                y={obj.y + obj.h / 2 - (obj.refCount !== undefined ? 3 : 0)}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="white"
              >
                {obj.label}
              </text>
              {obj.refCount !== undefined && (
                <text
                  x={obj.x + obj.w / 2}
                  y={obj.y + obj.h / 2 + 10}
                  textAnchor="middle"
                  fontSize="8"
                  fill="white"
                  opacity="0.9"
                >
                  refs: {obj.refCount}
                </text>
              )}
              {obj.alive === false && !step.gcHighlight && (
                <text
                  x={obj.x + obj.w / 2}
                  y={obj.y + obj.h / 2 + 2}
                  textAnchor="middle"
                  fontSize="20"
                  fill="white"
                  opacity={pulse}
                >
                  ✕
                </text>
              )}
            </g>
          ))}

          {/* Reference arrows */}
          {step.references.map((ref, i) => {
            const varIdx = step.stackVars.findIndex((v) => v.name === ref.from);
            const obj = step.heapObjects.find((o) => o.id === ref.to);
            if (varIdx >= 0 && obj) {
              const from = getStackVarCenter(varIdx);
              const to = getObjCenter(obj);
              return (
                <line
                  key={`ref_${i}`}
                  x1={from.x + 35}
                  y1={from.y}
                  x2={to.x - obj.w / 2 - 2}
                  y2={to.y}
                  stroke={ref.color}
                  strokeWidth="2"
                  markerEnd="url(#ref-arrow)"
                  opacity="0.7"
                  strokeDasharray={i > 0 ? '4 2' : undefined}
                />
              );
            }
            return null;
          })}

          {/* Mark & Sweep arrows (step 6) */}
          {step.gcHighlight === 'sweep' && (
            <g>
              <line
                x1="200"
                y1="96"
                x2="343"
                y2="96"
                stroke="#10B981"
                strokeWidth="2"
                markerEnd="url(#ref-arrow-green)"
              />
              <line
                x1="417"
                y1="96"
                x2="538"
                y2="96"
                stroke="#10B981"
                strokeWidth="1.5"
                markerEnd="url(#ref-arrow-green)"
                strokeDasharray="4 2"
              />
              <path
                d="M 417 222 Q 430 190 443 222"
                fill="none"
                stroke="#EF4444"
                strokeWidth="1.5"
                markerEnd="url(#ref-arrow-red)"
              />
              <path
                d="M 443 222 Q 430 255 417 222"
                fill="none"
                stroke="#EF4444"
                strokeWidth="1.5"
                markerEnd="url(#ref-arrow-red)"
              />
              <rect
                x="325"
                y="190"
                width="300"
                height="60"
                rx="6"
                fill="none"
                stroke="#EF4444"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                opacity={pulse}
              />
              <text
                x="475"
                y="262"
                textAnchor="middle"
                fontSize="9"
                fill="#DC2626"
                fontWeight="bold"
              >
                🧹 Sweep zone — deallocate!
              </text>
            </g>
          )}

          {currentStep === 3 && renderCircularRefs()}
        </svg>

        <VisualizationControls
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={steps.length}
          speed={speed}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onStepBack={handleStepBack}
          onStepForward={handleStepForward}
          onSpeedChange={handleSpeedChange}
          className="mb-4"
        />

        <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full">
              {currentStep + 1}
            </span>
            <h4 className="font-bold text-gray-800">{step.title}</h4>
          </div>
          <p className="text-gray-600 text-sm mb-3">{step.description}</p>
          <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
            <pre className="text-sm font-mono">
              {step.code.split('\n').map((line, i) => (
                <div key={i} className="leading-relaxed">
                  {line.startsWith('#') ? (
                    <span className="text-gray-500">{line}</span>
                  ) : (
                    <span className="text-green-400">{line}</span>
                  )}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryModel2D;
