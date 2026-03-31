import React, { useState, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { ArrowRight, RotateCcw } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  value: number | null;
  grad: number | null;
  op?: string;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
}

const initialNodes: GraphNode[] = [
  { id: 'x', label: 'x', x: 60, y: 80, value: 2, grad: null },
  { id: 'w', label: 'w', x: 60, y: 220, value: 3, grad: null },
  { id: 'b', label: 'b', x: 240, y: 220, value: 1, grad: null },
  { id: 'mul', label: '×', x: 170, y: 140, value: null, grad: null, op: 'mul' },
  { id: 'add', label: '+', x: 320, y: 140, value: null, grad: null, op: 'add' },
  { id: 'sq', label: '²', x: 470, y: 140, value: null, grad: null, op: 'sq' },
  { id: 'loss', label: 'Loss', x: 600, y: 140, value: null, grad: null },
];

const edges: Edge[] = [
  { from: 'x', to: 'mul' },
  { from: 'w', to: 'mul' },
  { from: 'mul', to: 'add' },
  { from: 'b', to: 'add' },
  { from: 'add', to: 'sq' },
  { from: 'sq', to: 'loss' },
];

const Backpropagation: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [phase, setPhase] = useState<'idle' | 'forward' | 'backward'>('idle');
  const [step, setStep] = useState(0);
  const [activeEdge, setActiveEdge] = useState<string | null>(null);

  const runForward = useCallback(() => {
    const n = initialNodes.map((nd) => ({ ...nd }));
    // x=2, w=3: mul = 6
    const x = n.find((nd) => nd.id === 'x')!.value!;
    const w = n.find((nd) => nd.id === 'w')!.value!;
    const b = n.find((nd) => nd.id === 'b')!.value!;
    const mul = x * w;
    const add = mul + b;
    const sq = add * add;
    n.find((nd) => nd.id === 'mul')!.value = mul;
    n.find((nd) => nd.id === 'add')!.value = add;
    n.find((nd) => nd.id === 'sq')!.value = sq;
    n.find((nd) => nd.id === 'loss')!.value = sq;
    setNodes(n);
    setPhase('forward');
    setStep(0);
    setActiveEdge(null);
  }, []);

  const backSteps: {
    nodeId: string;
    grad: number;
    edge: string;
    explanation: string;
  }[] = [
    { nodeId: 'loss', grad: 1, edge: '', explanation: 'dL/dL = 1 (by definition)' },
    {
      nodeId: 'sq',
      grad: 2 * (nodes.find((n) => n.id === 'add')?.value ?? 7),
      edge: 'sq->loss',
      explanation: `dL/d(sq_input) = 2×${nodes.find((n) => n.id === 'add')?.value ?? 7} = ${2 * (nodes.find((n) => n.id === 'add')?.value ?? 7)}`,
    },
    {
      nodeId: 'add',
      grad: 2 * (nodes.find((n) => n.id === 'add')?.value ?? 7),
      edge: 'add->sq',
      explanation: `dL/d(add) = ${2 * (nodes.find((n) => n.id === 'add')?.value ?? 7)} × 1 (chain rule)`,
    },
    {
      nodeId: 'b',
      grad: 2 * (nodes.find((n) => n.id === 'add')?.value ?? 7),
      edge: 'b->add',
      explanation: `dL/db = ${2 * (nodes.find((n) => n.id === 'add')?.value ?? 7)} (+ passes gradient through)`,
    },
    {
      nodeId: 'mul',
      grad: 2 * (nodes.find((n) => n.id === 'add')?.value ?? 7),
      edge: 'mul->add',
      explanation: `dL/d(mul) = ${2 * (nodes.find((n) => n.id === 'add')?.value ?? 7)} (+ passes gradient through)`,
    },
    {
      nodeId: 'w',
      grad:
        2 *
        (nodes.find((n) => n.id === 'add')?.value ?? 7) *
        (nodes.find((n) => n.id === 'x')?.value ?? 2),
      edge: 'w->mul',
      explanation: `dL/dw = ${2 * (nodes.find((n) => n.id === 'add')?.value ?? 7)} × x = ${2 * (nodes.find((n) => n.id === 'add')?.value ?? 7) * (nodes.find((n) => n.id === 'x')?.value ?? 2)}`,
    },
    {
      nodeId: 'x',
      grad:
        2 *
        (nodes.find((n) => n.id === 'add')?.value ?? 7) *
        (nodes.find((n) => n.id === 'w')?.value ?? 3),
      edge: 'x->mul',
      explanation: `dL/dx = ${2 * (nodes.find((n) => n.id === 'add')?.value ?? 7)} × w = ${2 * (nodes.find((n) => n.id === 'add')?.value ?? 7) * (nodes.find((n) => n.id === 'w')?.value ?? 3)}`,
    },
  ];

  const stepBackward = useCallback(() => {
    if (phase !== 'forward' && phase !== 'backward') return;
    setPhase('backward');
    const nextStep = step + 1;
    if (nextStep > backSteps.length) return;

    const bs = backSteps[nextStep - 1];
    setNodes((prev) => prev.map((n) => (n.id === bs.nodeId ? { ...n, grad: bs.grad } : n)));
    setActiveEdge(bs.edge);
    setStep(nextStep);
  }, [phase, step, backSteps]);

  const handleReset = useCallback(() => {
    setNodes(initialNodes);
    setPhase('idle');
    setStep(0);
    setActiveEdge(null);
  }, []);

  const getNodeColor = (node: GraphNode): string => {
    if (phase === 'backward' && node.grad !== null) return '#fecdd3';
    if (phase === 'forward' && node.value !== null) return '#dbeafe';
    return '#f3f4f6';
  };

  const currentExplanation =
    step > 0 && step <= backSteps.length ? backSteps[step - 1].explanation : null;

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Backpropagation</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Gradient descent tells the network to step downhill. Backpropagation efficiently computes{' '}
        <strong>which direction is "downhill"</strong> for every single parameter — by reversing the
        chain of computation.
      </p>
    </div>
  );

  const mainContent = (
    <>
      <ThemeCard>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-gray-900">Computation Graph</h2>
          <div className="flex gap-2">
            <button
              onClick={runForward}
              disabled={phase === 'forward' || phase === 'backward'}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-40"
            >
              <ArrowRight className="w-4 h-4" /> Forward Pass
            </button>
            <button
              onClick={stepBackward}
              disabled={phase !== 'forward' && phase !== 'backward'}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors disabled:opacity-40"
            >
              ← Step Backward
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          Run the forward pass first, then click "Step Backward" repeatedly to watch gradients flow
          in reverse through the graph.
        </p>

        <div className="bg-gradient-to-br from-slate-50 to-rose-50/30 rounded-xl p-4 border border-rose-100">
          <svg viewBox="0 0 680 300" className="w-full h-auto">
            {/* Edges */}
            {edges.map((edge) => {
              const fromN = nodes.find((n) => n.id === edge.from)!;
              const toN = nodes.find((n) => n.id === edge.to)!;
              const edgeKey = `${edge.from}->${edge.to}`;
              const isActiveBack = activeEdge === edgeKey;
              return (
                <g key={edgeKey}>
                  {/* Forward arrow */}
                  <line
                    x1={fromN.x + 30}
                    y1={fromN.y}
                    x2={toN.x - 30}
                    y2={toN.y}
                    stroke={phase === 'backward' ? '#d1d5db' : '#6b7280'}
                    strokeWidth={phase === 'backward' ? 1 : 2}
                    markerEnd="url(#arrowFwd)"
                  />
                  {/* Backward pulse */}
                  {isActiveBack && (
                    <line
                      x1={toN.x - 30}
                      y1={toN.y - 12}
                      x2={fromN.x + 30}
                      y2={fromN.y - 12}
                      stroke="#e11d48"
                      strokeWidth={2.5}
                      strokeDasharray="6 3"
                      markerEnd="url(#arrowBack)"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="18"
                        to="0"
                        dur="0.8s"
                        repeatCount="indefinite"
                      />
                    </line>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => (
              <g key={node.id}>
                <rect
                  x={node.x - 28}
                  y={node.y - 28}
                  width={56}
                  height={56}
                  rx={node.op ? 8 : 12}
                  fill={getNodeColor(node)}
                  stroke={phase === 'backward' && node.grad !== null ? '#e11d48' : '#9ca3af'}
                  strokeWidth={phase === 'backward' && node.grad !== null ? 2 : 1}
                />
                <text
                  x={node.x}
                  y={node.y - 6}
                  textAnchor="middle"
                  fill="#1f2937"
                  className="text-[12px] font-bold"
                >
                  {node.label}
                </text>
                {/* Value */}
                {node.value !== null && (
                  <text
                    x={node.x}
                    y={node.y + 12}
                    textAnchor="middle"
                    fill="#2563eb"
                    className="text-[10px] font-mono"
                  >
                    ={node.value}
                  </text>
                )}
                {/* Gradient badge */}
                {node.grad !== null && (
                  <g>
                    <rect
                      x={node.x - 20}
                      y={node.y - 48}
                      width={40}
                      height={18}
                      rx={4}
                      fill="#e11d48"
                    />
                    <text
                      x={node.x}
                      y={node.y - 35}
                      textAnchor="middle"
                      fill="white"
                      className="text-[9px] font-mono font-bold"
                    >
                      ∇={node.grad}
                    </text>
                  </g>
                )}
              </g>
            ))}

            {/* Arrow markers */}
            <defs>
              <marker
                id="arrowFwd"
                viewBox="0 0 10 10"
                refX={8}
                refY={5}
                markerWidth={6}
                markerHeight={6}
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
              </marker>
              <marker
                id="arrowBack"
                viewBox="0 0 10 10"
                refX={8}
                refY={5}
                markerWidth={6}
                markerHeight={6}
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
              </marker>
            </defs>
          </svg>

          {/* Explanation */}
          {currentExplanation && (
            <div className="mt-3 bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-800 font-mono animate-pulse">
              Step {step}: {currentExplanation}
            </div>
          )}
        </div>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🏭 The Corporate Chain of Command</h2>
        <div className="space-y-3">
          {[
            {
              team: 'Factory Floor (Layer 1)',
              role: 'Molds plastic parts — receives the biggest blame if raw materials were wrong.',
            },
            {
              team: 'Assembly Team (Layer 2)',
              role: 'Assembles components — "We used what Floor gave us!"',
            },
            {
              team: 'Packaging (Output Layer)',
              role: 'Boxes the product — closest to the output error.',
            },
            {
              team: 'QC Boss (Loss Function)',
              role: 'Inspects the final product and traces the blame backward.',
            },
          ].map(({ team, role }) => (
            <div
              key={team}
              className="flex gap-3 items-start bg-gradient-to-r from-rose-50 to-white rounded-lg p-3 border border-rose-100"
            >
              <div className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <div>
                <span className="font-bold text-gray-900 text-sm">{team}</span>
                <p className="text-xs text-gray-600">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">The Chain Rule</h2>
        <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 rounded-xl p-6 border border-rose-200 text-center">
          <p className="font-mono text-lg text-gray-800 mb-2">
            ∂L/∂w = (∂L/∂ŷ) × (∂ŷ/∂z) × (∂z/∂w)
          </p>
          <p className="text-sm text-gray-600">
            Multiply local gradients together as you traverse backward through the computation
            graph. Each node only needs to know its own local derivative.
          </p>
        </div>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default Backpropagation;
