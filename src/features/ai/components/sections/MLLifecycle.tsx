import React, { useState, useEffect, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import {
  RefreshCw,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';

const PHASES = [
  {
    id: 'define',
    label: 'Problem\nDefinition',
    emoji: '🎯',
    color: '#e11d48',
    lightColor: '#ffe4e6',
  },
  { id: 'data', label: 'Data\nPreparation', emoji: '🧹', color: '#c026d3', lightColor: '#fae8ff' },
  { id: 'train', label: 'Model\nTraining', emoji: '🏋️', color: '#7c3aed', lightColor: '#ede9fe' },
  { id: 'eval', label: 'Model\nEvaluation', emoji: '📊', color: '#2563eb', lightColor: '#dbeafe' },
  {
    id: 'deploy',
    label: 'Model\nDeployment',
    emoji: '🚀',
    color: '#059669',
    lightColor: '#d1fae5',
  },
  {
    id: 'monitor',
    label: 'Monitoring\n& Maintenance',
    emoji: '👁️',
    color: '#d97706',
    lightColor: '#fef3c7',
  },
];

const PHASE_DETAILS: Record<
  string,
  {
    title: string;
    description: string;
    simpleExplanation: string;
    realWorldExample: string;
    outputs: string[];
    infra: string;
  }
> = {
  define: {
    title: 'Problem Definition',
    description:
      'Identify the specific task the AI must solve, define success metrics, and establish baseline performance requirements. This is where you ask: "What exactly do we want the AI to do?" — without a clear problem, even the best model is useless.',
    simpleExplanation:
      'Deciding what question you want the AI to answer. Like choosing what subject to study before opening a textbook.',
    realWorldExample:
      'Netflix asking: "Can we predict which shows a user will enjoy?" or a hospital asking: "Can we detect tumors in X-ray images?"',
    outputs: ['Project Roadmap', 'KPIs & Metrics', 'Data Requirements'],
    infra: 'Collaboration Platforms',
  },
  data: {
    title: 'Data Preparation',
    description:
      'Gather raw data, clean it, handle missing values, and transform it into a format digestible by mathematical models. This is often the most time-consuming phase — data scientists spend ~80% of their time here. Garbage in = garbage out.',
    simpleExplanation:
      'Collecting and cleaning ingredients before cooking. If your eggs are rotten, no recipe can save the cake!',
    realWorldExample:
      'Collecting 10 million photos of cats and dogs, removing blurry images, ensuring each photo is labeled correctly, and resizing them all to the same dimensions.',
    outputs: ['Clean Datasets', 'Feature Store', 'Data Versioning'],
    infra: 'Data Lakes & Feature Stores',
  },
  train: {
    title: 'Model Training',
    description:
      'Select optimal architecture, feed prepared data, and iteratively refine hyperparameters to learn underlying patterns. The model sees examples, makes predictions, checks errors, and adjusts — millions of times.',
    simpleExplanation:
      'Like a student doing practice problems over and over. Each wrong answer helps them learn the right approach.',
    realWorldExample:
      'Training GPT-4 required thousands of GPUs running for months, processing hundreds of billions of words from books, websites, and articles.',
    outputs: ['Trained Weights', 'Hyperparameters', 'Training Logs'],
    infra: 'GPU/TPU Clusters',
  },
  eval: {
    title: 'Model Evaluation',
    description:
      'Rigorously test the trained model against unseen data to validate generalization. This is like a final exam — you test with questions the model has NEVER seen to make sure it actually learned the concepts, not just memorized answers.',
    simpleExplanation:
      'Giving the student a practice test with brand new questions to see if they really understand the material.',
    realWorldExample:
      'Testing a self-driving car model on road conditions from cities it was never trained on — rain, snow, night driving.',
    outputs: ['Accuracy Metrics', 'Confusion Matrix', 'Error Analysis'],
    infra: 'Model Registry',
  },
  deploy: {
    title: 'Model Deployment',
    description:
      'Package the validated model and deploy it behind an API endpoint so real users can use it. This is where the model goes from a lab experiment to a real product millions of people can interact with.',
    simpleExplanation:
      "Publishing a finished book — moving it from the author's desk to bookstore shelves where anyone can read it.",
    realWorldExample:
      "When you ask Siri a question, your voice is sent to Apple's servers where a deployed speech recognition model converts it to text in milliseconds.",
    outputs: ['API Endpoint', 'Docker Container', 'Scaling Config'],
    infra: 'Kubernetes / Cloud',
  },
  monitor: {
    title: 'Monitoring & Maintenance',
    description:
      'Continuously track model accuracy, detect data drift (when the real world changes and the model becomes outdated), and trigger retraining when performance degrades. Models are not "set and forget" — they need ongoing care.',
    simpleExplanation:
      'Like maintaining a car — regular check-ups, oil changes, and tire rotations to keep it running smoothly.',
    realWorldExample:
      'A fraud detection model trained in 2020 may miss new scam patterns in 2024. Monitoring detects the drop in accuracy and triggers retraining with fresh data.',
    outputs: ['Drift Alerts', 'Performance Logs', 'Retrain Triggers'],
    infra: 'Feedback Loops & Schedulers',
  },
};

const MLLifecycle: React.FC = () => {
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [animatingPhase, setAnimatingPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);
  const [pulseOpacity, setPulseOpacity] = useState(1);

  const cx = 300;
  const cy = 240;
  const radius = 160;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAnimatingPhase((prev) => {
        const next = (prev + 1) % PHASES.length;
        setActivePhase(PHASES[next].id);
        return next;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  useEffect(() => {
    let frame: number;
    let start: number;
    const animate = (ts: number): void => {
      if (!start) start = ts;
      const elapsed = (ts - start) % 2000;
      setPulseOpacity(0.4 + 0.6 * Math.abs(Math.sin((elapsed / 2000) * Math.PI)));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const getNodePosition = useCallback(
    (index: number): { x: number; y: number } => {
      const angle = (index / PHASES.length) * 2 * Math.PI - Math.PI / 2;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    },
    [cx, cy, radius]
  );

  const detail = activePhase ? PHASE_DETAILS[activePhase] : null;

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">The Machine Learning Lifecycle</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Building an AI system isn&apos;t just about &quot;training a model.&quot; It&apos;s a
        structured journey with 6 critical phases — and they repeat in a loop, just like how
        software gets version updates.
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
            <p className="text-gray-700 leading-relaxed">
              Building AI is like baking a cake. First you <strong>decide what cake</strong> to make
              (problem definition). Then you <strong>buy and prepare ingredients</strong> (data
              preparation). You <strong>mix and bake</strong> (training). You{' '}
              <strong>taste-test it</strong> (evaluation). You{' '}
              <strong>serve it at the party</strong> (deployment). And afterward, you{' '}
              <strong>ask guests if they liked it</strong> so you can improve next time
              (monitoring). Then the cycle repeats with the next cake!
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Lifecycle Visualization */}
      <ThemeCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Interactive Lifecycle Pipeline</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const prev = (animatingPhase - 1 + PHASES.length) % PHASES.length;
                setAnimatingPhase(prev);
                setActivePhase(PHASES[prev].id);
                setIsPlaying(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Previous phase"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={() => {
                const next = (animatingPhase + 1) % PHASES.length;
                setAnimatingPhase(next);
                setActivePhase(PHASES[next].id);
                setIsPlaying(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Next phase"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setActivePhase(null);
                setAnimatingPhase(0);
                setIsPlaying(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-3 mb-4 bg-gray-50 rounded-lg p-3">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Speed:</span>
          <input
            type="range"
            min={500}
            max={3000}
            step={250}
            value={3500 - speed}
            onChange={(e) => setSpeed(3500 - Number(e.target.value))}
            className="flex-1 accent-rose-500"
          />
          <span className="text-sm text-gray-500 whitespace-nowrap w-12 text-right">
            {speed <= 750 ? '🐇 Fast' : speed <= 1500 ? '🚶 Med' : '🐢 Slow'}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-3 italic">
          💡 Click any phase in the circle to see its details. Use ⏮⏭ to step through phases one
          by one.
        </p>

        <div className="relative bg-gradient-to-br from-gray-50 to-rose-50/30 rounded-xl p-4 border border-rose-100">
          <svg
            viewBox="0 0 600 480"
            className="w-full h-auto"
            role="img"
            aria-label="ML Lifecycle circular diagram"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
              </marker>
            </defs>

            {/* Connection arrows between phases */}
            {PHASES.map((_, i) => {
              const from = getNodePosition(i);
              const to = getNodePosition((i + 1) % PHASES.length);
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              const offsetX = (midX - cx) * 0.15;
              const offsetY = (midY - cy) * 0.15;
              const isActive = animatingPhase === i && isPlaying;

              return (
                <path
                  key={`arrow-${i}`}
                  d={`M ${from.x} ${from.y} Q ${midX + offsetX} ${midY + offsetY} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={isActive ? PHASES[i].color : '#d1d5db'}
                  strokeWidth={isActive ? 3 : 1.5}
                  strokeDasharray={isActive ? '' : '6 4'}
                  markerEnd="url(#arrowhead)"
                  className="transition-all duration-500"
                />
              );
            })}

            {/* Feedback loop arrow (Monitor -> Data) */}
            <path
              d={`M ${getNodePosition(5).x - 20} ${getNodePosition(5).y + 10}
                  C ${cx - radius * 1.4} ${cy + radius * 0.8},
                    ${cx - radius * 1.4} ${cy - radius * 0.5},
                    ${getNodePosition(1).x - 20} ${getNodePosition(1).y - 10}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="8 4"
              opacity={pulseOpacity}
              markerEnd="url(#arrowhead)"
            />
            <text
              x={cx - radius * 1.35}
              y={cy + 15}
              textAnchor="middle"
              className="text-[10px] font-semibold"
              fill="#d97706"
              transform={`rotate(-90, ${cx - radius * 1.35}, ${cy + 15})`}
            >
              Feedback Loop
            </text>

            {/* Phase nodes */}
            {PHASES.map((phase, i) => {
              const pos = getNodePosition(i);
              const isActive = activePhase === phase.id || (isPlaying && animatingPhase === i);

              return (
                <g
                  key={phase.id}
                  onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
                  className="cursor-pointer"
                  role="button"
                  aria-label={`Phase: ${phase.label.replace('\n', ' ')}`}
                >
                  {/* Glow ring when active */}
                  {isActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={48}
                      fill="none"
                      stroke={phase.color}
                      strokeWidth={2}
                      opacity={0.4}
                      filter="url(#glow)"
                    />
                  )}
                  {/* Node circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={42}
                    fill={isActive ? phase.lightColor : 'white'}
                    stroke={phase.color}
                    strokeWidth={isActive ? 3 : 2}
                    className="transition-all duration-300"
                  />
                  {/* Emoji */}
                  <text x={pos.x} y={pos.y - 8} textAnchor="middle" className="text-lg">
                    {phase.emoji}
                  </text>
                  {/* Label */}
                  {phase.label.split('\n').map((line, li) => (
                    <text
                      key={li}
                      x={pos.x}
                      y={pos.y + 10 + li * 12}
                      textAnchor="middle"
                      className="text-[9px] font-semibold"
                      fill={phase.color}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}

            {/* Center label */}
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              className="text-sm font-bold"
              fill="#374151"
            >
              ML
            </text>
            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              className="text-sm font-bold"
              fill="#374151"
            >
              Lifecycle
            </text>
          </svg>
        </div>

        {/* Detail panel */}
        {detail && (
          <div className="mt-6 p-5 bg-gradient-to-r from-rose-50 to-fuchsia-50 rounded-xl border border-rose-200 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{detail.title}</h3>
            <p className="text-gray-700 mb-3 leading-relaxed">{detail.description}</p>

            {/* Simple explanation callout */}
            <div className="bg-amber-50 rounded-lg p-3 mb-4 border border-amber-200">
              <p className="text-sm text-gray-700">
                <strong>🧒 In simple terms:</strong> {detail.simpleExplanation}
              </p>
            </div>

            {/* Real-world example */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>🌍 Real-world example:</strong> {detail.realWorldExample}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 text-sm mb-2">Key Outputs</h4>
                <div className="flex flex-wrap gap-2">
                  {detail.outputs.map((o) => (
                    <span
                      key={o}
                      className="px-3 py-1 bg-white rounded-full text-xs font-medium text-rose-700 border border-rose-200"
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm mb-2">Infrastructure</h4>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-fuchsia-700 border border-fuchsia-200">
                  {detail.infra}
                </span>
              </div>
            </div>
          </div>
        )}

        {!detail && (
          <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <p className="text-gray-500">
              👆 Click on any phase in the circle above to see detailed information, or use the
              play/step controls.
            </p>
          </div>
        )}
      </ThemeCard>

      {/* Phases Comparison Table */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Phases at a Glance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-rose-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b border-rose-200">
                  Phase
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b border-rose-200">
                  Goal
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b border-rose-200">
                  Time Spent
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b border-rose-200">
                  Who Does It
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['🎯 Problem Definition', 'Define what to solve', '~5%', 'Product + Data Science'],
                ['🧹 Data Preparation', 'Clean & organize data', '~60%', 'Data Engineers'],
                ['🏋️ Training', 'Teach the model', '~15%', 'ML Engineers'],
                ['📊 Evaluation', 'Test on new data', '~10%', 'ML Engineers + QA'],
                ['🚀 Deployment', 'Ship to production', '~5%', 'MLOps / DevOps'],
                ['👁️ Monitoring', 'Watch for degradation', '~5%', 'MLOps + Alerts'],
              ].map(([phase, goal, time, who], i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-800 border-b border-gray-100">
                    {phase}
                  </td>
                  <td className="px-4 py-3 text-gray-600 border-b border-gray-100">{goal}</td>
                  <td className="px-4 py-3 text-gray-600 border-b border-gray-100">{time}</td>
                  <td className="px-4 py-3 text-gray-600 border-b border-gray-100">{who}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3 italic">
          ⚠️ Notice that Data Preparation takes ~60% of the time! Most beginners think training is
          the hard part, but in reality, getting clean data is the biggest challenge.
        </p>
      </ThemeCard>

      {/* Analogy */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🏃 The Analogy: Professional Athlete&apos;s Journey
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Imagine the complete career of an Olympic sprinter. Every phase of the ML lifecycle maps
          perfectly to their journey:
        </p>
        <div className="space-y-3 mb-6">
          {[
            {
              phase: 'Problem Definition',
              athlete:
                'Deciding which race to compete in — the 100-meter dash. What does "winning" mean? Breaking 10 seconds? Medaling? You need a clear goal before any training begins.',
              color: 'rose',
            },
            {
              phase: 'Data Preparation',
              athlete:
                'The athlete\'s diet, sleep schedule, and conditioning routine. Just like "garbage in, garbage out" in AI — bad nutrition leads to poor performance no matter how hard you train.',
              color: 'fuchsia',
            },
            {
              phase: 'Training',
              athlete:
                "Daily practice on the track. Running the same drill hundreds of times, making tiny adjustments to form to shave off milliseconds. The athlete's muscles (like model weights) improve with each repetition.",
              color: 'violet',
            },
            {
              phase: 'Evaluation',
              athlete:
                'The trial race before the Olympics — a qualifying event with new competitors the athlete has never raced against. This reveals whether the training generalized or was specific to one track.',
              color: 'blue',
            },
            {
              phase: 'Deployment',
              athlete:
                'The Olympic final itself — performing under real conditions with real pressure, in front of millions of people. This is where all the preparation is put to the ultimate test.',
              color: 'emerald',
            },
            {
              phase: 'Monitoring',
              athlete:
                'Post-race physical therapy, off-season adjustments, and re-evaluating technique. Even gold medalists need to adapt — new competitors emerge, injuries happen, and performance can degrade without maintenance.',
              color: 'amber',
            },
          ].map((item) => (
            <div
              key={item.phase}
              className={`flex items-start gap-3 p-4 bg-${item.color}-50 rounded-lg border border-${item.color}-200`}
            >
              <ChevronRight className={`w-5 h-5 text-${item.color}-600 mt-0.5 flex-shrink-0`} />
              <div>
                <span className={`font-semibold text-${item.color}-800`}>{item.phase}:</span>
                <span className="text-gray-700 ml-1">{item.athlete}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Key takeaway */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
          <h3 className="font-bold text-emerald-900 mb-2">🎯 Key Takeaway</h3>
          <p className="text-gray-700 leading-relaxed">
            The ML lifecycle is <strong>never truly finished</strong>. Just like an athlete
            constantly trains, evaluates, and adjusts, AI models need continuous monitoring and
            retraining. The feedback loop (monitoring → data preparation) is what separates
            production-grade AI from toy experiments.
          </p>
        </div>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default MLLifecycle;
