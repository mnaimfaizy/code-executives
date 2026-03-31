import React, { useState, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Play, RefreshCw } from 'lucide-react';

const LossFunctions: React.FC = () => {
  const [arrows, setArrows] = useState<{ x: number; y: number }[]>([]);
  const [totalLoss, setTotalLoss] = useState(0);
  const trueX = 300;
  const trueY = 200;

  const shootArrow = useCallback(() => {
    const spread = 120 - arrows.length * 8;
    const actualSpread = Math.max(20, spread);
    const newX = trueX + (Math.random() - 0.5) * actualSpread * 2;
    const newY = trueY + (Math.random() - 0.5) * actualSpread * 2;
    const dist = Math.sqrt((newX - trueX) ** 2 + (newY - trueY) ** 2);
    setArrows((prev) => [...prev, { x: newX, y: newY }]);
    setTotalLoss((prev) => prev + dist);
  }, [arrows.length]);

  const shootBatch = useCallback(() => {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => shootArrow(), i * 100);
    }
  }, [shootArrow]);

  const handleReset = useCallback(() => {
    setArrows([]);
    setTotalLoss(0);
  }, []);

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Forward Pass & Loss Functions</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        The forward pass generates a prediction. The loss function measures exactly how wrong that
        prediction is. The goal: minimize the loss to zero.
      </p>
    </div>
  );

  const mainContent = (
    <>
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">The Prediction Target</h2>
          <div className="flex gap-2">
            <button
              onClick={shootArrow}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
            >
              <Play className="w-4 h-4" /> Shoot
            </button>
            <button
              onClick={shootBatch}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-fuchsia-100 text-fuchsia-700 rounded-lg hover:bg-fuchsia-200 transition-colors"
            >
              Run Batch (10)
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-rose-50/30 rounded-xl p-4 border border-rose-100">
          {/* Stats bar */}
          <div className="flex justify-between items-center mb-4 bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-sm">
              <span className="text-gray-500">Predictions:</span>{' '}
              <span className="font-bold text-gray-900">{arrows.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Total Error:</span>{' '}
              <span className="font-bold text-rose-600">{totalLoss.toFixed(1)}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Mean Error (MAE):</span>{' '}
              <span className="font-bold text-fuchsia-600">
                {arrows.length > 0 ? (totalLoss / arrows.length).toFixed(1) : '—'}
              </span>
            </div>
          </div>

          <svg viewBox="0 0 600 400" className="w-full h-auto">
            {/* Concentric target rings */}
            {[140, 110, 80, 50, 20].map((r, i) => (
              <circle
                key={i}
                cx={trueX}
                cy={trueY}
                r={r}
                fill="none"
                stroke={i % 2 === 0 ? '#fecdd3' : '#fff1f2'}
                strokeWidth={r === 140 ? 30 : 30}
              />
            ))}
            <circle cx={trueX} cy={trueY} r={8} fill="#e11d48" />
            <text
              x={trueX}
              y={trueY + 22}
              textAnchor="middle"
              fill="#e11d48"
              className="text-[10px] font-bold"
            >
              True Value
            </text>

            {/* Error lines and arrows */}
            {arrows.map((a, i) => {
              const dist = Math.sqrt((a.x - trueX) ** 2 + (a.y - trueY) ** 2);
              return (
                <g key={i}>
                  <line
                    x1={trueX}
                    y1={trueY}
                    x2={a.x}
                    y2={a.y}
                    stroke="#e11d48"
                    strokeWidth={1}
                    strokeDasharray="4 2"
                    opacity={0.5}
                  />
                  <circle cx={a.x} cy={a.y} r={4} fill="#7c3aed" stroke="#fff" strokeWidth={1} />
                  <text
                    x={(trueX + a.x) / 2 + 8}
                    y={(trueY + a.y) / 2 - 5}
                    fill="#e11d48"
                    className="text-[8px] font-mono"
                    opacity={0.8}
                  >
                    {dist.toFixed(1)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🏹 The Analogy: Blindfolded Archery
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Imagine a blindfolded archer shooting at a target. Each arrow is a{' '}
          <strong>forward pass</strong> — a guess based on the current stance and arm angle (weights
          and biases).
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          When the arrow lands, a referee measures the exact distance from the arrow to the
          bullseye. That distance is the <strong>loss function</strong>. If the arrow is 20 inches
          away, the loss is 20. If it hits the bullseye, the loss is zero.
        </p>
        <p className="text-gray-700 leading-relaxed">
          The archer's only goal: reduce that distance measurement to zero on the next shot.
        </p>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mean Absolute Error (MAE)</h2>
        <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 rounded-xl p-6 border border-rose-200">
          <div className="text-center mb-4">
            <span className="font-mono text-lg text-gray-800">
              MAE = (1/n) × Σ |y<sub>actual</sub> − y<sub>predicted</sub>|
            </span>
          </div>
          <p className="text-sm text-gray-700 text-center">
            The average of the absolute differences between predicted and actual values. A single
            positive number — the closer to zero, the better the model performs.
          </p>
        </div>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default LossFunctions;
