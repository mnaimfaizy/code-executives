import React, { useState, useEffect, useCallback, useMemo } from 'react';
import VisualizationControls from '../../../../../components/shared/VisualizationControls';

interface NeuronNode {
  x: number;
  y: number;
  label: string;
  value?: number;
  activated?: boolean;
}

interface Connection {
  from: number[];
  to: number[];
  weight?: number;
  active?: boolean;
}

interface MLStep {
  title: string;
  description: string;
  layers: NeuronNode[][];
  connections: Connection[];
  highlightLayer?: number;
  flowDirection?: 'forward' | 'backward';
  annotations: string[];
}

const NeuralNetwork2D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const layerColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];
  const layerLabels = ['Input', 'Hidden 1', 'Hidden 2', 'Output'];

  const buildLayers = (
    sizes: number[],
    activated: number[][] = [],
    values: number[][] = []
  ): NeuronNode[][] => {
    const xPositions = [100, 250, 400, 550];
    return sizes.map((size, li) => {
      const yStart = (300 - size * 50) / 2 + 30;
      return Array.from({ length: size }, (_, ni) => ({
        x: xPositions[li],
        y: yStart + ni * 50,
        label: `${layerLabels[li][0]}${ni + 1}`,
        activated: activated[li]?.includes(ni) ?? false,
        value: values[li]?.[ni],
      }));
    });
  };

  const steps = useMemo<MLStep[]>(
    () => [
      {
        title: 'Neural Network Architecture',
        description:
          'A neural network is layers of interconnected neurons that learn patterns from data',
        layers: buildLayers([3, 4, 4, 2]),
        connections: [
          { from: [0], to: [1] },
          { from: [1], to: [2] },
          { from: [2], to: [3] },
        ],
        annotations: [
          'Input layer: receives raw features (e.g., pixel values, numbers)',
          'Hidden layers: learn intermediate representations',
          'Output layer: produces predictions (e.g., class probabilities)',
          'Each connection has a learnable weight',
        ],
      },
      {
        title: 'Forward Pass',
        description: 'Data flows through the network, layer by layer, producing a prediction',
        layers: buildLayers([3, 4, 4, 2], [[0, 1, 2], [], [], []], [[0.5, 0.8, 0.2], [], [], []]),
        connections: [
          { from: [0], to: [1], active: true },
          { from: [1], to: [2] },
          { from: [2], to: [3] },
        ],
        highlightLayer: 0,
        flowDirection: 'forward',
        annotations: [
          '1. Input data enters the first layer',
          '2. Each neuron computes: z = Σ(weight × input) + bias',
          '3. Apply activation function: a = σ(z)',
          'Common activations: ReLU, Sigmoid, Tanh',
        ],
      },
      {
        title: 'Hidden Layer Activation',
        description: 'Neurons apply weighted sums and activation functions',
        layers: buildLayers(
          [3, 4, 4, 2],
          [[0, 1, 2], [0, 1, 2, 3], [], []],
          [[0.5, 0.8, 0.2], [0.7, 0.3, 0.9, 0.1], [], []]
        ),
        connections: [
          { from: [0], to: [1], active: true },
          { from: [1], to: [2], active: true },
          { from: [2], to: [3] },
        ],
        highlightLayer: 1,
        flowDirection: 'forward',
        annotations: [
          'ReLU(x) = max(0, x) — most popular activation',
          'Introduces non-linearity so network can learn complex patterns',
          'Without activation, network is just linear transformation',
          'Each hidden layer learns progressively abstract features',
        ],
      },
      {
        title: 'Output & Loss',
        description: 'The network produces a prediction and we compute the loss',
        layers: buildLayers(
          [3, 4, 4, 2],
          [
            [0, 1, 2],
            [0, 1, 2, 3],
            [0, 1, 2, 3],
            [0, 1],
          ],
          [
            [0.5, 0.8, 0.2],
            [0.7, 0.3, 0.9, 0.1],
            [0.6, 0.4, 0.8, 0.2],
            [0.85, 0.15],
          ]
        ),
        connections: [
          { from: [0], to: [1], active: true },
          { from: [1], to: [2], active: true },
          { from: [2], to: [3], active: true },
        ],
        highlightLayer: 3,
        flowDirection: 'forward',
        annotations: [
          'Output: [0.85, 0.15] → 85% class A, 15% class B',
          'Softmax converts raw scores to probabilities',
          'Loss = -log(predicted probability of correct class)',
          'Goal: minimize the loss function through training',
        ],
      },
      {
        title: 'Backpropagation',
        description: 'Gradients flow backward to update weights and reduce error',
        layers: buildLayers(
          [3, 4, 4, 2],
          [
            [0, 1, 2],
            [0, 1, 2, 3],
            [0, 1, 2, 3],
            [0, 1],
          ]
        ),
        connections: [
          { from: [0], to: [1] },
          { from: [1], to: [2] },
          { from: [2], to: [3], active: true },
        ],
        highlightLayer: 3,
        flowDirection: 'backward',
        annotations: [
          'Compute gradient of loss w.r.t. each weight',
          'Chain rule: ∂Loss/∂w = ∂Loss/∂a × ∂a/∂z × ∂z/∂w',
          'Gradients propagate backward through the network',
          'Update: w_new = w_old − learning_rate × gradient',
        ],
      },
      {
        title: 'Training Loop',
        description: 'Repeat forward pass → loss → backward pass → update weights',
        layers: buildLayers(
          [3, 4, 4, 2],
          [
            [0, 1, 2],
            [0, 1, 2, 3],
            [0, 1, 2, 3],
            [0, 1],
          ]
        ),
        connections: [
          { from: [0], to: [1], active: true },
          { from: [1], to: [2], active: true },
          { from: [2], to: [3], active: true },
        ],
        annotations: [
          'Epoch: one complete pass through all training data',
          'Batch: subset of data processed at once (mini-batch SGD)',
          'Learning rate: controls step size of weight updates',
          'Training converges when loss stops decreasing',
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handlePlayPause = useCallback(() => setIsPlaying((p) => !p), []);
  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);
  const handleStepBack = useCallback(() => setCurrentStep((s) => Math.max(0, s - 1)), []);
  const handleStepForward = useCallback(
    () => setCurrentStep((s) => Math.min(steps.length - 1, s + 1)),
    [steps.length]
  );
  const handleSpeedChange = useCallback((s: number) => setSpeed(s), []);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) return;
    const interval = window.setInterval(() => {
      setCurrentStep((s) => {
        if (s >= steps.length - 1) {
          setIsPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 4500 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Step info */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-100">
        <h4 className="font-bold text-gray-900 text-lg">{step.title}</h4>
        <p className="text-gray-600 text-sm mt-1">{step.description}</p>
      </div>

      {/* Neural network SVG */}
      <div className="bg-white rounded-lg border border-gray-200 p-2 overflow-x-auto">
        <svg viewBox="0 0 650 320" className="w-full" style={{ maxHeight: '320px' }}>
          {/* Layer labels */}
          {layerLabels.map((label, i) => (
            <text
              key={label}
              x={[100, 250, 400, 550][i]}
              y={15}
              fontSize="11"
              fill={step.highlightLayer === i ? layerColors[i] : '#9ca3af'}
              textAnchor="middle"
              fontWeight={step.highlightLayer === i ? 'bold' : 'normal'}
            >
              {label}
            </text>
          ))}

          {/* Connections between layers */}
          {step.layers.map((layer, li) => {
            if (li >= step.layers.length - 1) return null;
            const nextLayer = step.layers[li + 1];
            const conn = step.connections[li];
            const isActive = conn?.active;
            const isBackward = step.flowDirection === 'backward';

            return layer.map((neuron, ni) =>
              nextLayer.map((next, nj) => {
                const opacity = isActive ? 0.6 : 0.15;
                const color =
                  isBackward && isActive ? '#ef4444' : isActive ? layerColors[li] : '#d1d5db';
                const width = isActive ? 1.5 : 0.5;
                return (
                  <line
                    key={`${li}-${ni}-${nj}`}
                    x1={neuron.x + 16}
                    y1={neuron.y}
                    x2={next.x - 16}
                    y2={next.y}
                    stroke={color}
                    strokeWidth={width}
                    opacity={opacity}
                    className="transition-all duration-500"
                  />
                );
              })
            );
          })}

          {/* Flow direction arrows */}
          {step.flowDirection && (
            <>
              {step.flowDirection === 'forward' ? (
                <g>
                  <defs>
                    <marker
                      id="fwdArrow"
                      markerWidth="8"
                      markerHeight="6"
                      refX="8"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" opacity="0.5" />
                    </marker>
                  </defs>
                  <line
                    x1="60"
                    y1="300"
                    x2="580"
                    y2="300"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="6,3"
                    markerEnd="url(#fwdArrow)"
                    opacity="0.5"
                  />
                  <text
                    x="320"
                    y="315"
                    fontSize="10"
                    fill="#3b82f6"
                    textAnchor="middle"
                    opacity="0.6"
                  >
                    Forward Pass →
                  </text>
                </g>
              ) : (
                <g>
                  <defs>
                    <marker
                      id="bwdArrow"
                      markerWidth="8"
                      markerHeight="6"
                      refX="0"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="8 0, 0 3, 8 6" fill="#ef4444" opacity="0.5" />
                    </marker>
                  </defs>
                  <line
                    x1="580"
                    y1="300"
                    x2="60"
                    y2="300"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="6,3"
                    markerEnd="url(#bwdArrow)"
                    opacity="0.5"
                  />
                  <text
                    x="320"
                    y="315"
                    fontSize="10"
                    fill="#ef4444"
                    textAnchor="middle"
                    opacity="0.6"
                  >
                    ← Backpropagation
                  </text>
                </g>
              )}
            </>
          )}

          {/* Neurons */}
          {step.layers.map((layer, li) =>
            layer.map((neuron, ni) => (
              <g key={`n-${li}-${ni}`}>
                {/* Glow for activated */}
                {neuron.activated && (
                  <circle
                    cx={neuron.x}
                    cy={neuron.y}
                    r="18"
                    fill={layerColors[li]}
                    opacity="0.15"
                    className="transition-all duration-500"
                  />
                )}
                {/* Neuron circle */}
                <circle
                  cx={neuron.x}
                  cy={neuron.y}
                  r="14"
                  fill={neuron.activated ? layerColors[li] : 'white'}
                  stroke={layerColors[li]}
                  strokeWidth={neuron.activated ? 2 : 1.5}
                  className="transition-all duration-500"
                />
                {/* Value text */}
                {neuron.value !== undefined ? (
                  <text
                    x={neuron.x}
                    y={neuron.y + 4}
                    fontSize="8"
                    fill={neuron.activated ? 'white' : layerColors[li]}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {neuron.value.toFixed(1)}
                  </text>
                ) : (
                  <text
                    x={neuron.x}
                    y={neuron.y + 3}
                    fontSize="7"
                    fill={neuron.activated ? 'white' : '#9ca3af'}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {neuron.label}
                  </text>
                )}
              </g>
            ))
          )}
        </svg>
      </div>

      {/* Annotations */}
      <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
        <h5 className="font-semibold text-pink-800 mb-2">🧠 How It Works</h5>
        <ul className="space-y-1">
          {step.annotations.map((note, i) => (
            <li key={i} className="text-sm text-pink-700 flex items-start gap-2">
              <span className="text-pink-500 mt-0.5">•</span>
              {note}
            </li>
          ))}
        </ul>
      </div>

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
      />
    </div>
  );
};

export default React.memo(NeuralNetwork2D);
