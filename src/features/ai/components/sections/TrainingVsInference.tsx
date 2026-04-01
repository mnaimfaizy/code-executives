import React, { useState, useEffect, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Play, Pause, Lightbulb } from 'lucide-react';

const TrainingVsInference: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [inferenceActive, setInferenceActive] = useState(false);
  const [inferenceTimer, setInferenceTimer] = useState<number | null>(null);

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setEpoch((e) => (e + 1) % 100);
    }, 200);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const runInference = useCallback(() => {
    setInferenceActive(true);
    setInferenceTimer(0);
    const start = performance.now();
    const tick = (): void => {
      const elapsed = performance.now() - start;
      setInferenceTimer(Math.round(elapsed));
      if (elapsed < 800) {
        requestAnimationFrame(tick);
      } else {
        setInferenceTimer(12); // simulated final latency
      }
    };
    requestAnimationFrame(tick);
    setTimeout(() => setInferenceActive(false), 2000);
  }, []);

  const gearRotation = epoch * 3.6;

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Training vs. Inference</h1>
      <p className="text-xl text-gray-700 leading-relaxed mb-3">
        These are the two fundamentally different phases of every AI system. Training is when the
        model <strong>learns</strong> — it&apos;s slow, expensive, and happens once (or rarely).
        Inference is when the model <strong>answers questions</strong> — it&apos;s fast, cheap, and
        happens millions of times per day. Understanding the difference is critical for anyone
        building or using AI in production.
      </p>
      <p className="text-lg text-gray-600 leading-relaxed">
        Click the buttons below to see both phases in action, side by side.
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
              Think of learning to ride a bike. <strong>Training</strong> is the weeks of practice
              with wobbling, falling, and scraping your knees — it&apos;s hard and takes a long
              time. <strong>Inference</strong> is when you can finally just hop on and ride to
              school without thinking about it. You already learned; now you just <em>do</em>. AI
              works the same way!
            </p>
          </div>
        </div>
      </div>
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Factory vs. Vending Machine</h2>
        <p className="text-sm text-gray-600 mb-4">
          Training is a massive, expensive factory grinding through data. Inference is a sleek
          vending machine dispensing instant predictions.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Training side */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-amber-900">🏭 Training Factory</h3>
              <button
                onClick={() => setIsAnimating((a) => !a)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-200 text-amber-800 rounded-lg hover:bg-amber-300 transition-colors"
              >
                {isAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isAnimating ? 'Stop' : 'Run'}
              </button>
            </div>

            <svg viewBox="0 0 280 200" className="w-full h-auto">
              {/* Factory building */}
              <rect
                x={20}
                y={40}
                width={240}
                height={120}
                rx={8}
                fill="#fef3c7"
                stroke="#d97706"
                strokeWidth={2}
              />

              {/* Chimney smoke */}
              {isAnimating && (
                <>
                  <circle cx={220} cy={25} r={8} fill="#d1d5db" opacity={0.6}>
                    <animate
                      attributeName="cy"
                      values="25;5;-15"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0.3;0"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx={230} cy={20} r={6} fill="#d1d5db" opacity={0.4}>
                    <animate
                      attributeName="cy"
                      values="20;0;-20"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.4;0.2;0"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
              <rect x={210} y={20} width={20} height={20} fill="#92400e" rx={2} />

              {/* Data truck */}
              <g transform={`translate(${isAnimating ? -(epoch % 40) * 2 + 80 : 30}, 0)`}>
                <rect x={10} y={55} width={40} height={20} rx={3} fill="#3b82f6" />
                <text
                  x={30}
                  y={68}
                  textAnchor="middle"
                  fill="white"
                  className="text-[7px] font-bold"
                >
                  DATA
                </text>
                <circle cx={18} cy={78} r={4} fill="#374151" />
                <circle cx={42} cy={78} r={4} fill="#374151" />
              </g>

              {/* Gears */}
              <g transform={`translate(140, 105) rotate(${isAnimating ? gearRotation : 0})`}>
                <circle cx={0} cy={0} r={18} fill="none" stroke="#92400e" strokeWidth={4} />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                  <rect
                    key={a}
                    x={-4}
                    y={-22}
                    width={8}
                    height={8}
                    fill="#92400e"
                    transform={`rotate(${a})`}
                  />
                ))}
              </g>
              <text
                x={140}
                y={140}
                textAnchor="middle"
                fill="#92400e"
                className="text-[8px] font-bold"
              >
                Epoch {epoch}
              </text>

              {/* GPU meter */}
              <rect
                x={30}
                y={170}
                width={100}
                height={12}
                rx={6}
                fill="#fecaca"
                stroke="#ef4444"
                strokeWidth={1}
              />
              <rect
                x={30}
                y={170}
                width={isAnimating ? 95 : 20}
                height={12}
                rx={6}
                fill="#ef4444"
                className="transition-all duration-500"
              />
              <text
                x={80}
                y={179}
                textAnchor="middle"
                fill="white"
                className="text-[7px] font-bold"
              >
                GPU: {isAnimating ? '98%' : '12%'}
              </text>

              {/* Cost label */}
              <text
                x={200}
                y={180}
                textAnchor="middle"
                fill="#dc2626"
                className="text-[9px] font-bold"
              >
                💰 $$$$ / hour
              </text>
            </svg>
          </div>

          {/* Inference side */}
          <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-4 border-2 border-emerald-200 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-emerald-900">🤖 Inference API</h3>
              <button
                onClick={runInference}
                disabled={inferenceActive}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-200 text-emerald-800 rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-40"
              >
                <Play className="w-3 h-3" /> Run Query
              </button>
            </div>

            <svg viewBox="0 0 280 200" className="w-full h-auto">
              {/* Sleek machine */}
              <rect
                x={60}
                y={30}
                width={160}
                height={130}
                rx={12}
                fill="#d1fae5"
                stroke="#10b981"
                strokeWidth={2}
              />
              <rect
                x={80}
                y={50}
                width={120}
                height={30}
                rx={6}
                fill="#f0fdf4"
                stroke="#86efac"
                strokeWidth={1}
              />
              <text
                x={140}
                y={70}
                textAnchor="middle"
                fill="#047857"
                className="text-[9px] font-bold"
              >
                FROZEN MODEL
              </text>

              {/* Input coin */}
              {inferenceActive && (
                <g>
                  <circle cx={140} cy={20} r={10} fill="#3b82f6" stroke="#1d4ed8" strokeWidth={1.5}>
                    <animate attributeName="cy" values="5;45" dur="0.3s" fill="freeze" />
                  </circle>
                  <text
                    x={140}
                    y={24}
                    textAnchor="middle"
                    fill="white"
                    className="text-[7px] font-bold"
                  >
                    <animate attributeName="y" values="9;49" dur="0.3s" fill="freeze" />Q
                  </text>
                </g>
              )}

              {/* Output product */}
              {inferenceActive && inferenceTimer !== null && inferenceTimer >= 300 && (
                <g>
                  <rect x={110} y={170} width={60} height={20} rx={4} fill="#10b981">
                    <animate attributeName="y" values="155;170" dur="0.2s" fill="freeze" />
                  </rect>
                  <text
                    x={140}
                    y={183}
                    textAnchor="middle"
                    fill="white"
                    className="text-[7px] font-bold"
                  >
                    Prediction
                  </text>
                </g>
              )}

              {/* Latency display */}
              <rect
                x={85}
                y={95}
                width={110}
                height={25}
                rx={4}
                fill="white"
                stroke="#d1d5db"
                strokeWidth={1}
              />
              <text
                x={140}
                y={112}
                textAnchor="middle"
                fill={inferenceActive ? '#10b981' : '#9ca3af'}
                className="text-[10px] font-mono font-bold"
              >
                ⏱ {inferenceTimer !== null ? `${inferenceTimer}ms` : '— ms'}
              </text>

              {/* GPU meter — light */}
              <rect
                x={30}
                y={170}
                width={60}
                height={12}
                rx={6}
                fill="#d1fae5"
                stroke="#10b981"
                strokeWidth={1}
              />
              <rect
                x={30}
                y={170}
                width={inferenceActive ? 15 : 8}
                height={12}
                rx={6}
                fill="#10b981"
              />
              <text
                x={60}
                y={179}
                textAnchor="middle"
                fill="#047857"
                className="text-[7px] font-bold"
              >
                GPU: 5%
              </text>

              {/* Cost */}
              <text
                x={240}
                y={180}
                textAnchor="middle"
                fill="#047857"
                className="text-[9px] font-bold"
              >
                💰 $ / hour
              </text>
            </svg>
          </div>
        </div>
      </ThemeCard>

      {/* Comparison table */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Side-by-Side Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 px-3 text-gray-600 font-medium">Feature</th>
                <th className="text-left py-2 px-3 text-amber-700 font-bold">Training</th>
                <th className="text-left py-2 px-3 text-emerald-700 font-bold">Inference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Objective', 'Build model; learn patterns', 'Use frozen model; make predictions'],
                ['Math', 'Forward + Backward passes (iterative)', 'Single forward pass only'],
                ['Data', 'Massive batches of labeled data', 'Individual live unlabeled data'],
                ['Hardware', 'GPU/TPU clusters (expensive)', 'Optimized lighter GPUs/CPUs'],
                ['KPI', 'Accuracy, Loss Minimization', 'Latency (ms), Throughput, Cost'],
                ['Duration', 'Days to weeks', 'Milliseconds per query'],
              ].map(([feature, training, inference]) => (
                <tr key={feature} className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-900">{feature}</td>
                  <td className="py-2 px-3 text-gray-700">{training}</td>
                  <td className="py-2 px-3 text-gray-700">{inference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🏃 The Marathon Metaphor</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Training a model is like an athlete preparing for a marathon. Inference is race day.
          Here&apos;s why this metaphor captures the essence of both phases perfectly:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <h3 className="font-bold text-amber-900 mb-2">🏋️ Training = Preparation</h3>
            <ul className="text-sm text-gray-700 space-y-2 leading-relaxed">
              <li>
                • <strong>Months of effort:</strong> Lifting weights, running 20 miles daily, strict
                diet
              </li>
              <li>
                • <strong>Constantly breaking down:</strong> Muscles tear to grow back stronger
                (like adjusting weights through backprop)
              </li>
              <li>
                • <strong>Needs a coach:</strong> Someone to check form and give feedback (like the
                loss function)
              </li>
              <li>
                • <strong>Immense cost:</strong> Gym membership, nutrition, time off work (like GPU
                clusters costing $10K+/day)
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-4 border border-emerald-200">
            <h3 className="font-bold text-emerald-900 mb-2">🏅 Inference = Race Day</h3>
            <ul className="text-sm text-gray-700 space-y-2 leading-relaxed">
              <li>
                • <strong>Preparation is done:</strong> The runner steps to the starting line
              </li>
              <li>
                • <strong>No more learning:</strong> Not building new muscle mid-race — just
                executing
              </li>
              <li>
                • <strong>Speed matters:</strong> Every millisecond counts (latency is critical)
              </li>
              <li>
                • <strong>Low cost per run:</strong> Some water and a pair of shoes (like a small
                API server)
              </li>
            </ul>
          </div>
        </div>
      </ThemeCard>

      {/* Real-world examples */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-200 mb-4">
        <h3 className="font-bold text-violet-900 mb-3">🌍 Real-World Examples</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              app: 'ChatGPT',
              training: 'Trained on trillions of words over months using thousands of GPUs',
              inference: 'Generates your response in ~1 second',
            },
            {
              app: 'Google Translate',
              training: 'Learned from billions of translated sentence pairs',
              inference: 'Translates your text in milliseconds',
            },
            {
              app: 'Spotify Recommend',
              training: 'Analyzed listening patterns of 600M+ users',
              inference: 'Picks your next song in <100ms',
            },
          ].map(({ app, training, inference }) => (
            <div key={app} className="bg-white/60 rounded-lg p-3 border border-violet-100">
              <h4 className="font-bold text-sm text-gray-900 mb-2">{app}</h4>
              <p className="text-xs text-amber-700 mb-1">
                <strong>Training:</strong> {training}
              </p>
              <p className="text-xs text-emerald-700">
                <strong>Inference:</strong> {inference}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Key takeaway */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
        <h3 className="font-bold text-emerald-900 mb-2">🎯 Key Takeaway</h3>
        <p className="text-gray-700 leading-relaxed">
          Training and inference are like building a car vs. driving it. You wouldn&apos;t redesign
          the engine every time you drive to work. The model trains once (or periodically), freezes
          its learned weights, and then serves predictions at lightning speed. Most of the AI you
          interact with daily — search engines, voice assistants, recommendation feeds — is running{' '}
          <strong>inference</strong>, not training.
        </p>
      </div>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default TrainingVsInference;
