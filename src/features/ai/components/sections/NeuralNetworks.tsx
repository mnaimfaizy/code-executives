import React, { useState, useMemo, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { RefreshCw, Lightbulb } from 'lucide-react';

const LAYER_SIZES = [3, 4, 4, 2];
const NODE_RADIUS = 20;
const INPUTS = [0.8, 0.4, 0.6];

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function valueToColor(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  const r = Math.round(225 * clamped);
  const b = Math.round(225 * (1 - clamped));
  return `rgb(${r}, 60, ${b})`;
}

const NeuralNetworks: React.FC = () => {
  const [weights, setWeights] = useState<number[][][]>(() => {
    const w: number[][][] = [];
    for (let l = 0; l < LAYER_SIZES.length - 1; l++) {
      const layerWeights: number[][] = [];
      for (let i = 0; i < LAYER_SIZES[l]; i++) {
        const row: number[] = [];
        for (let j = 0; j < LAYER_SIZES[l + 1]; j++) {
          row.push(Math.random() * 2 - 1);
        }
        layerWeights.push(row);
      }
      w.push(layerWeights);
    }
    return w;
  });

  const [biases, setBiases] = useState<number[][]>(() => {
    const b: number[][] = [];
    for (let l = 1; l < LAYER_SIZES.length; l++) {
      const layerBiases: number[] = [];
      for (let j = 0; j < LAYER_SIZES[l]; j++) {
        layerBiases.push(Math.random() * 2 - 1);
      }
      b.push(layerBiases);
    }
    return b;
  });

  const [selectedEdge, setSelectedEdge] = useState<{ l: number; i: number; j: number } | null>(
    null
  );

  const nodePositions = useMemo(() => {
    const positions: { x: number; y: number }[][] = [];
    const width = 560;
    const height = 340;
    const layerSpacing = width / (LAYER_SIZES.length + 1);

    for (let l = 0; l < LAYER_SIZES.length; l++) {
      const layerPositions: { x: number; y: number }[] = [];
      const nodeSpacing = height / (LAYER_SIZES[l] + 1);
      for (let n = 0; n < LAYER_SIZES[l]; n++) {
        layerPositions.push({
          x: layerSpacing * (l + 1),
          y: nodeSpacing * (n + 1),
        });
      }
      positions.push(layerPositions);
    }
    return positions;
  }, []);

  const activations = useMemo(() => {
    const acts: number[][] = [INPUTS];
    for (let l = 0; l < weights.length; l++) {
      const layerActs: number[] = [];
      for (let j = 0; j < LAYER_SIZES[l + 1]; j++) {
        let sum = biases[l][j];
        for (let i = 0; i < LAYER_SIZES[l]; i++) {
          sum += acts[l][i] * weights[l][i][j];
        }
        layerActs.push(sigmoid(sum));
      }
      acts.push(layerActs);
    }
    return acts;
  }, [weights, biases]);

  const handleWeightChange = useCallback((l: number, i: number, j: number, value: number) => {
    setWeights((prev) => {
      const next = prev.map((layer) => layer.map((row) => [...row]));
      next[l][i][j] = value;
      return next;
    });
  }, []);

  const handleBiasChange = useCallback((l: number, j: number, delta: number) => {
    setBiases((prev) => {
      const next = prev.map((layer) => [...layer]);
      next[l][j] = Math.max(-3, Math.min(3, next[l][j] + delta));
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setWeights(() => {
      const w: number[][][] = [];
      for (let l = 0; l < LAYER_SIZES.length - 1; l++) {
        const layerWeights: number[][] = [];
        for (let i = 0; i < LAYER_SIZES[l]; i++) {
          const row: number[] = [];
          for (let j = 0; j < LAYER_SIZES[l + 1]; j++) {
            row.push(Math.random() * 2 - 1);
          }
          layerWeights.push(row);
        }
        w.push(layerWeights);
      }
      return w;
    });
    setBiases(() => {
      const b: number[][] = [];
      for (let l = 1; l < LAYER_SIZES.length; l++) {
        const layerBiases: number[] = [];
        for (let j = 0; j < LAYER_SIZES[l]; j++) {
          layerBiases.push(Math.random() * 2 - 1);
        }
        b.push(layerBiases);
      }
      return b;
    });
    setSelectedEdge(null);
  }, []);

  const layerLabels = ['Input', 'Hidden 1', 'Hidden 2', 'Output'];

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Neural Networks: Weights & Biases</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        A neural network is the brain-inspired architecture that powers almost all modern AI — from
        ChatGPT to self-driving cars. It&apos;s built from layers of simple math operations that,
        when stacked together, can learn incredibly complex patterns.
      </p>
    </div>
  );

  const mainContent = (
    <>
      {/* Simple explanation */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">Explain Like I&apos;m 10 🧒</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Imagine a team of friends playing a guessing game. You whisper three numbers to the
              first row of friends. Each friend{' '}
              <strong>multiplies your number by how important they think it is</strong> (that&apos;s
              the <em>weight</em>), then adds their personal opinion (that&apos;s the <em>bias</em>
              ), and passes the result to the next row.
            </p>
            <p className="text-gray-700 leading-relaxed">
              After going through several rows, the last row gives you a final answer. If the answer
              is wrong, everyone adjusts their importance multipliers a tiny bit. After millions of
              rounds, <strong>the team gets incredibly accurate</strong>. That&apos;s a neural
              network!
            </p>
          </div>
        </div>
      </div>

      {/* What's happening mathematically */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📐 The Math Behind Each Neuron</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Every single neuron (circle) in the network does just three things:
        </p>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
            <div className="text-2xl mb-2">✖️</div>
            <h4 className="font-bold text-blue-800 mb-1">1. Multiply</h4>
            <p className="text-sm text-gray-600">Each input × its weight</p>
            <div className="font-mono text-xs text-blue-600 mt-2 bg-white rounded p-2">
              x₁·w₁ + x₂·w₂ + x₃·w₃
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 text-center">
            <div className="text-2xl mb-2">➕</div>
            <h4 className="font-bold text-purple-800 mb-1">2. Add Bias</h4>
            <p className="text-sm text-gray-600">Add the neuron&apos;s baseline</p>
            <div className="font-mono text-xs text-purple-600 mt-2 bg-white rounded p-2">
              sum + b = z
            </div>
          </div>
          <div className="bg-rose-50 rounded-lg p-4 border border-rose-200 text-center">
            <div className="text-2xl mb-2">🔄</div>
            <h4 className="font-bold text-rose-800 mb-1">3. Activate</h4>
            <p className="text-sm text-gray-600">Squash result to 0-1 range</p>
            <div className="font-mono text-xs text-rose-600 mt-2 bg-white rounded p-2">
              σ(z) = 1/(1+e⁻ᶻ)
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Why the activation function?</strong> Without it, stacking layers would just be
            one big multiplication — you could simplify the whole network to a single layer. The
            activation function (like sigmoid) introduces a &quot;curve&quot; that lets the network
            learn complex, non-linear patterns like shapes in images or context in text.
          </p>
        </div>
      </ThemeCard>
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Interactive Neural Network</h2>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Randomize
          </button>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
          <p className="text-sm text-gray-700">
            <strong>🎮 How to interact:</strong>
          </p>
          <ul className="text-sm text-gray-600 mt-1 space-y-1">
            <li>
              • <strong>Click a connection line</strong> to select it, then use the slider to adjust
              its weight
            </li>
            <li>
              • <strong>Scroll on a node</strong> (middle layers) to change its bias value
            </li>
            <li>• Watch how inputs (left) flow through the network and produce outputs (right)</li>
            <li>
              • <strong>Green lines</strong> = positive influence, <strong>Red lines</strong> =
              negative influence, <strong>Thicker</strong> = stronger
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-xl p-4 relative">
          <svg viewBox="0 0 600 380" className="w-full h-auto">
            {/* Layer labels */}
            {nodePositions.map((layer, l) => (
              <text
                key={`label-${l}`}
                x={layer[0].x}
                y={20}
                textAnchor="middle"
                className="text-[10px] font-semibold"
                fill="#9ca3af"
              >
                {layerLabels[l]}
              </text>
            ))}

            {/* Edges */}
            {weights.map((layer, l) =>
              layer.map((row, i) =>
                row.map((w, j) => {
                  const from = nodePositions[l][i];
                  const to = nodePositions[l + 1][j];
                  const absW = Math.abs(w);
                  const isSelected =
                    selectedEdge?.l === l && selectedEdge?.i === i && selectedEdge?.j === j;

                  return (
                    <line
                      key={`edge-${l}-${i}-${j}`}
                      x1={from.x + NODE_RADIUS}
                      y1={from.y}
                      x2={to.x - NODE_RADIUS}
                      y2={to.y}
                      stroke={w >= 0 ? '#34d399' : '#f87171'}
                      strokeWidth={Math.max(0.5, absW * 3)}
                      opacity={isSelected ? 1 : 0.25 + absW * 0.5}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => setSelectedEdge(isSelected ? null : { l, i, j })}
                    />
                  );
                })
              )
            )}

            {/* Nodes */}
            {nodePositions.map((layer, l) =>
              layer.map((pos, n) => {
                const activation = activations[l][n];
                return (
                  <g
                    key={`node-${l}-${n}`}
                    onWheel={(e) => {
                      e.preventDefault();
                      if (l > 0) {
                        handleBiasChange(l - 1, n, e.deltaY > 0 ? -0.2 : 0.2);
                      }
                    }}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={NODE_RADIUS}
                      fill={valueToColor(activation)}
                      stroke="white"
                      strokeWidth={1.5}
                      opacity={0.9}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      className="text-[10px] font-mono font-bold"
                    >
                      {activation.toFixed(2)}
                    </text>
                    {l > 0 && (
                      <text
                        x={pos.x}
                        y={pos.y + NODE_RADIUS + 12}
                        textAnchor="middle"
                        fill="#9ca3af"
                        className="text-[8px] font-mono"
                      >
                        b={biases[l - 1][n].toFixed(1)}
                      </text>
                    )}
                  </g>
                );
              })
            )}

            {/* Input labels */}
            {INPUTS.map((val, i) => (
              <text
                key={`input-${i}`}
                x={nodePositions[0][i].x - NODE_RADIUS - 10}
                y={nodePositions[0][i].y + 4}
                textAnchor="end"
                fill="#6b7280"
                className="text-[9px] font-mono"
              >
                x{i + 1}={val}
              </text>
            ))}

            {/* Output labels */}
            {activations[activations.length - 1].map((val, i) => (
              <text
                key={`output-${i}`}
                x={nodePositions[nodePositions.length - 1][i].x + NODE_RADIUS + 10}
                y={nodePositions[nodePositions.length - 1][i].y + 4}
                textAnchor="start"
                fill={valueToColor(val)}
                className="text-[11px] font-bold font-mono"
              >
                {val >= 0.5 ? '●' : '○'} {val.toFixed(3)}
              </text>
            ))}
          </svg>

          {/* Weight slider */}
          {selectedEdge && (
            <div className="mt-3 bg-white/10 rounded-lg p-3 flex items-center gap-4 backdrop-blur-sm">
              <span className="text-white text-sm font-mono whitespace-nowrap">
                w[{selectedEdge.l}][{selectedEdge.i}→{selectedEdge.j}]
              </span>
              <input
                type="range"
                min={-3}
                max={3}
                step={0.1}
                value={weights[selectedEdge.l][selectedEdge.i][selectedEdge.j]}
                onChange={(e) =>
                  handleWeightChange(
                    selectedEdge.l,
                    selectedEdge.i,
                    selectedEdge.j,
                    parseFloat(e.target.value)
                  )
                }
                className="flex-1 accent-rose-500"
              />
              <span className="text-white text-sm font-mono w-12 text-right">
                {weights[selectedEdge.l][selectedEdge.i][selectedEdge.j].toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
          <div className="bg-green-50 rounded-lg p-2 border border-green-200">
            <div className="w-8 h-1 bg-green-400 mx-auto mb-1 rounded"></div>
            <span className="text-green-700 text-xs">Positive Weight</span>
          </div>
          <div className="bg-red-50 rounded-lg p-2 border border-red-200">
            <div className="w-8 h-1 bg-red-400 mx-auto mb-1 rounded"></div>
            <span className="text-red-700 text-xs">Negative Weight</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
            <div className="flex justify-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ background: valueToColor(0) }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: valueToColor(0.5) }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: valueToColor(1) }}></div>
            </div>
            <span className="text-gray-700 text-xs">Cold → Hot (Activation)</span>
          </div>
        </div>
      </ThemeCard>

      {/* Analogy */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🍕 The Analogy: Pizza Taste Test</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Imagine 100 children rating how delicious different pizzas are. Each pizza has three
          toppings (inputs): <strong>cheese amount</strong>, <strong>pepperoni count</strong>, and{' '}
          <strong>pineapple slices</strong>.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
            <h4 className="font-bold text-rose-800 mb-2">Weights = Preferences</h4>
            <p className="text-sm text-gray-700">
              Each child has different taste preferences. A pepperoni lover has a{' '}
              <strong>high pepperoni weight</strong> (like +2.5), while a pineapple hater has a{' '}
              <strong>negative pineapple weight</strong> (like -1.5). These weights represent how
              much each topping matters to each child&apos;s final score.
            </p>
          </div>
          <div className="bg-fuchsia-50 rounded-lg p-4 border border-fuchsia-200">
            <h4 className="font-bold text-fuchsia-800 mb-2">Bias = Base Mood</h4>
            <p className="text-sm text-gray-700">
              Some children are always hungry (positive bias = rate any pizza highly). Others are
              picky (negative bias = start with low expectations). The bias shifts the entire
              scoring up or down regardless of toppings.
            </p>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          <strong>Training the network</strong> means figuring out the exact preferences (weights)
          and moods (biases) of millions of children, so that their combined votes perfectly predict
          the quality of any pizza — even one they&apos;ve never tasted!
        </p>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
          <p className="text-sm text-gray-700">
            <strong>🎯 Key insight:</strong> A single neuron is simple — just multiply, add, and
            squash. But when you connect thousands of neurons in layers, they can recognize faces,
            translate languages, and play chess. Complexity emerges from simplicity!
          </p>
        </div>
      </ThemeCard>

      {/* Component reference table */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Neural Network Components</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Here&apos;s a quick reference for the four key building blocks of every neural network:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-rose-50">
                <th className="text-left p-3 font-semibold text-gray-800 border-b border-rose-200">
                  Component
                </th>
                <th className="text-left p-3 font-semibold text-gray-800 border-b border-rose-200">
                  What It Is
                </th>
                <th className="text-left p-3 font-semibold text-gray-800 border-b border-rose-200">
                  Everyday Analogy
                </th>
                <th className="text-left p-3 font-semibold text-gray-800 border-b border-rose-200">
                  Learnable?
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="p-3 font-mono text-rose-700">Inputs (x)</td>
                <td className="p-3 text-gray-600">Raw data features fed into the network</td>
                <td className="p-3 text-gray-500 italic">Pizza toppings</td>
                <td className="p-3 text-gray-500">No (fixed)</td>
              </tr>
              <tr className="border-t border-gray-100 bg-gray-50">
                <td className="p-3 font-mono text-rose-700">Weights (w)</td>
                <td className="p-3 text-gray-600">How important each input is to the neuron</td>
                <td className="p-3 text-gray-500 italic">How much a child likes each topping</td>
                <td className="p-3 text-green-600 font-semibold">✓ Yes</td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="p-3 font-mono text-rose-700">Biases (b)</td>
                <td className="p-3 text-gray-600">Baseline activation regardless of input</td>
                <td className="p-3 text-gray-500 italic">
                  The child&apos;s hunger level (base mood)
                </td>
                <td className="p-3 text-green-600 font-semibold">✓ Yes</td>
              </tr>
              <tr className="border-t border-gray-100 bg-gray-50">
                <td className="p-3 font-mono text-rose-700">Activation fn</td>
                <td className="p-3 text-gray-600">Introduces non-linearity (sigmoid, ReLU)</td>
                <td className="p-3 text-gray-500 italic">
                  &quot;Am I excited enough to pass it on?&quot;
                </td>
                <td className="p-3 text-gray-500">No (chosen by engineer)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ThemeCard>

      {/* Brief history */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-200">
        <h3 className="font-bold text-violet-900 mb-2">📜 Brief History</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          The first artificial neuron (the &quot;Perceptron&quot;) was invented by Frank Rosenblatt
          in <strong>1957</strong>. It could only solve simple problems. It took until the 2010s —
          with massive data and powerful GPUs — for neural networks with many layers (&quot;deep
          learning&quot;) to become practical. GPT-4 has over <strong>175 billion</strong>{' '}
          parameters (weights + biases), but each neuron still does the same simple
          multiply-add-activate operation shown above.
        </p>
      </div>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default NeuralNetworks;
