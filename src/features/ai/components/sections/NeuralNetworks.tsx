import React, { useState, useMemo, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { RefreshCw } from 'lucide-react';

const LAYER_SIZES = [3, 4, 4, 2];
const NODE_RADIUS = 20;

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
  const inputs = [0.8, 0.4, 0.6];

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
    const acts: number[][] = [inputs];
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
  }, [weights, biases, inputs]);

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
        Explore how data flows through interconnected layers of neurons. Adjust weights and biases
        to see how they affect the network's output in real-time.
      </p>
    </div>
  );

  const mainContent = (
    <>
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
        <p className="text-gray-600 mb-4 text-sm">
          Click on any connection line to adjust its weight with a slider. Scroll on a node to
          adjust its bias. Watch how changes cascade through the network.
        </p>

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
            {inputs.map((val, i) => (
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
          Imagine children rating how delicious a pizza is. The <strong>inputs</strong> are
          ingredients: cheese, pepperoni, pineapple. The <strong>weights</strong> represent how much
          each child cares about each ingredient — a pepperoni lover has a massive "pepperoni
          weight."
        </p>
        <p className="text-gray-700 leading-relaxed">
          The <strong>bias</strong> is the child's baseline mood. If they're starving (positive
          bias), they'll rate any pizza highly. The network's training is figuring out the exact
          preferences (weights) and moods (biases) of millions of children so their combined votes
          perfectly predict the quality of any pizza.
        </p>
      </ThemeCard>

      {/* Component reference table */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Neural Network Components</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-rose-50">
                <th className="text-left p-3 font-semibold text-gray-800">Component</th>
                <th className="text-left p-3 font-semibold text-gray-800">Purpose</th>
                <th className="text-left p-3 font-semibold text-gray-800">Learnable?</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="p-3 font-mono text-rose-700">Inputs (x)</td>
                <td className="p-3 text-gray-600">Raw data features from the environment</td>
                <td className="p-3 text-gray-500">No (fixed by dataset)</td>
              </tr>
              <tr className="border-t border-gray-100 bg-gray-50">
                <td className="p-3 font-mono text-rose-700">Weights (w)</td>
                <td className="p-3 text-gray-600">Importance of a specific input signal</td>
                <td className="p-3 text-green-600 font-semibold">Yes (learned)</td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="p-3 font-mono text-rose-700">Biases (b)</td>
                <td className="p-3 text-gray-600">Baseline activation threshold</td>
                <td className="p-3 text-green-600 font-semibold">Yes (learned)</td>
              </tr>
              <tr className="border-t border-gray-100 bg-gray-50">
                <td className="p-3 font-mono text-rose-700">Activation fn</td>
                <td className="p-3 text-gray-600">Enables non-linear pattern learning</td>
                <td className="p-3 text-gray-500">No (architectural choice)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default NeuralNetworks;
