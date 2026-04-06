import React, { useState, useCallback, useMemo } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { ArrowRight, RotateCcw, Lightbulb } from 'lucide-react';

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

  const xValue = nodes.find((node) => node.id === 'x')?.value ?? 2;
  const wValue = nodes.find((node) => node.id === 'w')?.value ?? 3;
  const addValue = nodes.find((node) => node.id === 'add')?.value ?? 7;
  const addGradient = 2 * addValue;

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
  }[] = useMemo(
    () => [
      { nodeId: 'loss', grad: 1, edge: '', explanation: 'dL/dL = 1 (by definition)' },
      {
        nodeId: 'sq',
        grad: addGradient,
        edge: 'sq->loss',
        explanation: `dL/d(sq_input) = 2×${addValue} = ${addGradient}`,
      },
      {
        nodeId: 'add',
        grad: addGradient,
        edge: 'add->sq',
        explanation: `dL/d(add) = ${addGradient} × 1 (chain rule)`,
      },
      {
        nodeId: 'b',
        grad: addGradient,
        edge: 'b->add',
        explanation: `dL/db = ${addGradient} (+ passes gradient through)`,
      },
      {
        nodeId: 'mul',
        grad: addGradient,
        edge: 'mul->add',
        explanation: `dL/d(mul) = ${addGradient} (+ passes gradient through)`,
      },
      {
        nodeId: 'w',
        grad: addGradient * xValue,
        edge: 'w->mul',
        explanation: `dL/dw = ${addGradient} × x = ${addGradient * xValue}`,
      },
      {
        nodeId: 'x',
        grad: addGradient * wValue,
        edge: 'x->mul',
        explanation: `dL/dx = ${addGradient} × w = ${addGradient * wValue}`,
      },
    ],
    [addGradient, addValue, wValue, xValue]
  );

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
      <p className="text-xl text-gray-700 leading-relaxed mb-3">
        In the previous section, gradient descent told the network to &quot;step downhill.&quot; But
        how does the network figure out which direction is downhill for <em>every single one</em> of
        its millions of parameters? That&apos;s the job of backpropagation — the clever algorithm
        that <strong>traces the error backward</strong> through the computation graph, assigning
        blame to each parameter along the way.
      </p>
      <p className="text-lg text-gray-600 leading-relaxed">
        Without backpropagation, training would take exponentially longer. It&apos;s the reason
        modern deep learning is practical at all.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* ELI10 box */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200 mb-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 mb-1">Explain Like I&apos;m 10</h3>
            <p className="text-gray-700 leading-relaxed">
              Imagine you&apos;re in a relay race team. You drop the baton and your team loses. The
              coach doesn&apos;t just shout at the last runner — they watch the replay and figure
              out <strong>who dropped it and when</strong>. Backpropagation is that instant replay:
              it rewinds through every calculation the model made and tells each part exactly how
              much it messed up. Then every part can fix its own mistake for next time.
            </p>
          </div>
        </div>
      </div>
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
          <strong>How to use:</strong> Click &quot;Forward Pass&quot; to push values left → right.
          Then click &quot;Step Backward&quot; repeatedly to watch gradients flow right → left
          through the graph. Red badges show each node&apos;s gradient (how much it contributed to
          the error). Try &quot;Auto Backward&quot; to watch the full replay automatically!
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
        <p className="text-gray-700 leading-relaxed mb-4">
          Think of a neural network as a factory with multiple departments. When a defective product
          ships, the QC boss doesn&apos;t fire everyone — they trace the assembly line backward to
          figure out <em>who</em> is responsible and <em>how much</em>.
        </p>
        <div className="space-y-3 mb-4">
          {[
            {
              team: 'QC Boss (Loss Function)',
              emoji: '🔍',
              role: 'Inspects the final product, measures how bad the defect is, and starts the blame investigation.',
            },
            {
              team: 'Packaging (Output Layer)',
              emoji: '📦',
              role: 'Closest to the output — gets feedback first. "The label was crooked? That\'s on me."',
            },
            {
              team: 'Assembly Team (Hidden Layers)',
              emoji: '🔧',
              role: 'Middle of the chain. Receives proportional blame: "I used what the floor gave me, but I also bent it wrong."',
            },
            {
              team: 'Factory Floor (Input Layer)',
              emoji: '🏗️',
              role: 'The first to touch raw materials. Gets the smallest blame — but still adjusts for next time.',
            },
          ].map(({ team, emoji, role }) => (
            <div
              key={team}
              className="flex gap-3 items-start bg-gradient-to-r from-rose-50 to-white rounded-lg p-3 border border-rose-100"
            >
              <div className="text-xl shrink-0">{emoji}</div>
              <div>
                <span className="font-bold text-gray-900 text-sm">{team}</span>
                <p className="text-xs text-gray-600">{role}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
          <p className="text-sm text-gray-700">
            <strong>Key insight:</strong> Each department only needs to know two things — what it
            received and what it sent out. It computes its <em>local gradient</em> and passes the
            blame upstream. This is why backprop is so efficient: no department needs to understand
            the entire factory!
          </p>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">The Chain Rule</h2>
        <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 rounded-xl p-6 border border-rose-200 text-center mb-4">
          <p className="font-mono text-lg text-gray-800 mb-2">
            ∂L/∂w = (∂L/∂ŷ) × (∂ŷ/∂z) × (∂z/∂w)
          </p>
          <p className="text-sm text-gray-600">
            Multiply local gradients together as you traverse backward through the computation
            graph. Each node only needs to know its own local derivative.
          </p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <h4 className="font-bold text-amber-800 mb-2">🧒 In plain English:</h4>
          <p className="text-sm text-gray-700 leading-relaxed mb-2">
            Suppose you increase <strong>w</strong> by a tiny amount. That changes{' '}
            <strong>z</strong> a little. That change in z changes <strong>ŷ</strong> a little. And
            that change in ŷ changes the <strong>loss</strong> a little. The chain rule multiplies
            all these &quot;a little&quot; effects together to get the total effect of changing w on
            the loss.
          </p>
          <p className="text-sm text-gray-700">
            It&apos;s like a row of dominoes — each one tips the next, and the chain rule tells you
            how hard the last domino falls based on how hard you pushed the first one.
          </p>
        </div>
      </ThemeCard>

      {/* Forward vs Backward summary */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 text-left font-bold text-gray-900">Aspect</th>
              <th className="p-3 text-left font-bold text-blue-700">Forward Pass →</th>
              <th className="p-3 text-left font-bold text-rose-700">Backward Pass ←</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Direction', 'Input → Output', 'Output → Input'],
              ['What flows', 'Data values', 'Gradients (blame)'],
              ['Purpose', 'Compute prediction', 'Compute how to improve'],
              ['When', 'Every training step', 'Every training step (after forward)'],
              ['Result', 'A prediction + loss value', 'Updated weights'],
            ].map(([aspect, forward, backward]) => (
              <tr key={aspect} className="border-b last:border-0">
                <td className="p-3 font-medium text-gray-900">{aspect}</td>
                <td className="p-3 text-gray-700">{forward}</td>
                <td className="p-3 text-gray-700">{backward}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key takeaway */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
        <h3 className="font-bold text-emerald-900 mb-2">🎯 Key Takeaway</h3>
        <p className="text-gray-700 leading-relaxed">
          Backpropagation is not a separate algorithm from gradient descent — it&apos;s the{' '}
          <strong>efficient way to compute</strong> the gradients that gradient descent needs. It
          works by applying the chain rule backward through the computation graph, so each node only
          computes its own local derivative. This makes training networks with millions of
          parameters practical on modern hardware.
        </p>
      </div>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default Backpropagation;
