import React, { useState, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Play, RefreshCw, Lightbulb } from 'lucide-react';

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
        How does an AI know it made a mistake? The <strong>forward pass</strong> makes a prediction,
        and the <strong>loss function</strong> measures exactly how wrong that prediction was. The
        entire goal of training is to make this number as small as possible.
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
              Imagine playing a game where you throw a ball at a target with your eyes closed. After
              each throw, your friend tells you: <em>&quot;You were 20 inches away!&quot;</em> or{' '}
              <em>&quot;Only 3 inches that time!&quot;</em>
            </p>
            <p className="text-gray-700 leading-relaxed">
              That distance measurement IS the loss function. It&apos;s just a{' '}
              <strong>number that tells you how wrong you were</strong>. The goal is to get that
              number to zero — a perfect bullseye!
            </p>
          </div>
        </div>
      </div>

      {/* How forward pass works */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔄 What Is a &quot;Forward Pass&quot;?
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          A forward pass is when you feed data into the neural network and it produces a prediction.
          The data flows <em>forward</em> from input → through hidden layers → to output.
        </p>
        <div className="flex items-center gap-2 justify-center mb-4 flex-wrap">
          {[
            {
              label: 'Input Data',
              color: 'bg-blue-100 text-blue-800',
              desc: '(e.g., a photo)',
            },
            { label: '→', color: 'text-gray-400', desc: '' },
            {
              label: 'Network computes',
              color: 'bg-purple-100 text-purple-800',
              desc: '(weights × inputs + bias)',
            },
            { label: '→', color: 'text-gray-400', desc: '' },
            {
              label: 'Prediction',
              color: 'bg-rose-100 text-rose-800',
              desc: '(e.g., "cat")',
            },
            { label: '→', color: 'text-gray-400', desc: '' },
            {
              label: 'Compare to Truth',
              color: 'bg-amber-100 text-amber-800',
              desc: '(was actually "dog")',
            },
            { label: '=', color: 'text-gray-400 font-bold text-xl', desc: '' },
            { label: 'Loss!', color: 'bg-red-100 text-red-800 font-bold', desc: '' },
          ].map((item, i) =>
            item.desc === '' && item.label.length <= 2 ? (
              <span key={i} className={`${item.color} text-lg`}>
                {item.label}
              </span>
            ) : (
              <div key={i} className={`${item.color} px-3 py-2 rounded-lg text-sm`}>
                {item.label}
                {item.desc && <div className="text-[10px] opacity-75">{item.desc}</div>}
              </div>
            )
          )}
        </div>
      </ThemeCard>
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
          🏹 The Analogy: Blindfolded Archery Tournament
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Imagine a child learning archery while blindfolded. They can&apos;t see the target, but
          after each shot, a referee shouts out exactly how far the arrow landed from the bullseye.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2 text-sm">🏹 Arrow = Forward Pass</h4>
            <p className="text-xs text-gray-700">
              Each arrow shot is one prediction. The archer uses their current stance, arm angle,
              and strength (weights and biases) to aim.
            </p>
          </div>
          <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
            <h4 className="font-bold text-rose-800 mb-2 text-sm">📏 Distance = Loss</h4>
            <p className="text-xs text-gray-700">
              The referee measures how far the arrow is from the bullseye. &quot;20 inches
              away!&quot; — that&apos;s the loss value. Zero means a perfect hit.
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h4 className="font-bold text-emerald-800 mb-2 text-sm">🎯 Goal = Minimize</h4>
            <p className="text-xs text-gray-700">
              The archer adjusts their aim each round, trying to reduce the distance. Over hundreds
              of shots, they get closer and closer to the bullseye.
            </p>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mean Absolute Error (MAE)</h2>
        <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 rounded-xl p-6 border border-rose-200 mb-4">
          <div className="text-center mb-4">
            <span className="font-mono text-lg text-gray-800">
              MAE = (1/n) × Σ |y<sub>actual</sub> − y<sub>predicted</sub>|
            </span>
          </div>
          <p className="text-sm text-gray-700 text-center mb-4">
            The average distance between where you aimed and where you should have aimed — across
            ALL your shots.
          </p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mb-4">
          <h4 className="font-bold text-amber-800 mb-2">🧒 In everyday terms:</h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            Imagine 5 students took a test. The teacher predicted their scores: 70, 80, 90, 60, 85.
            Their actual scores were: 75, 78, 95, 55, 90. The differences are: 5, 2, 5, 5, 5. The
            MAE is (5+2+5+5+5)/5 = <strong>4.4 points</strong>. That means on average, the
            predictions were off by about 4.4 points.
          </p>
        </div>

        {/* Other loss functions mentioned */}
        <h3 className="text-lg font-bold text-gray-900 mb-3">Other Common Loss Functions</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-1 text-sm">MSE (Mean Squared Error)</h4>
            <p className="text-xs text-gray-600 mb-1">
              Like MAE, but squares each error — so big mistakes are punished much more heavily.
            </p>
            <div className="font-mono text-[10px] text-gray-500">
              MSE = (1/n) × Σ (actual − predicted)²
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-1 text-sm">Cross-Entropy Loss</h4>
            <p className="text-xs text-gray-600 mb-1">
              Used for classification (cat vs dog). Measures how surprised the model is by the
              actual answer — high surprise = high loss.
            </p>
            <div className="font-mono text-[10px] text-gray-500">
              Used by: image classifiers, language models
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Key takeaway */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
        <h3 className="font-bold text-emerald-900 mb-2">🎯 Key Takeaway</h3>
        <p className="text-gray-700 leading-relaxed">
          The loss function is the <strong>only way a model knows it&apos;s wrong</strong>. Without
          a loss function, a neural network has no feedback and cannot learn. Different tasks use
          different loss functions, but they all answer the same question: &quot;How far off was my
          prediction?&quot;
        </p>
      </div>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default LossFunctions;
