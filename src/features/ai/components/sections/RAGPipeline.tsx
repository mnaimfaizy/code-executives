import React, { useState, useCallback, useEffect } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Play, RotateCcw, Search } from 'lucide-react';

const stages = [
  { id: 'query', label: 'User Query', x: 60, y: 180, color: '#3b82f6', icon: '💬' },
  { id: 'embed', label: 'Embed Query', x: 180, y: 180, color: '#8b5cf6', icon: '🔢' },
  { id: 'vectordb', label: 'Vector DB', x: 310, y: 180, color: '#06b6d4', icon: '🗄️' },
  { id: 'retrieve', label: 'Retrieved Context', x: 440, y: 180, color: '#10b981', icon: '📄' },
  { id: 'augment', label: 'Super Prompt', x: 540, y: 120, color: '#f59e0b', icon: '⚡' },
  { id: 'llm', label: 'LLM Generate', x: 540, y: 250, color: '#e11d48', icon: '🤖' },
];

const RAGPipeline: React.FC = () => {
  const [activeStage, setActiveStage] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queryText] = useState('How many vacation days do I get?');

  const stageExplanations = [
    'User types a natural language question into the search bar.',
    'The query is converted into a numerical vector (embedding) using the same embedding model used during ingestion.',
    'The query vector dives into the Vector Database. A similarity search finds the closest matching document chunks.',
    'The top 3 most relevant text chunks are retrieved and converted back to readable English.',
    'The original query is combined with the retrieved context to form an augmented "Super Prompt."',
    'The LLM generates a precise, factual answer based strictly on the provided context — no hallucination.',
  ];

  useEffect(() => {
    if (!isPlaying) return;
    if (activeStage >= stages.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timeout = setTimeout(() => {
      setActiveStage((s) => s + 1);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [isPlaying, activeStage]);

  const handlePlay = useCallback(() => {
    setActiveStage(0);
    setIsPlaying(true);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setActiveStage(-1);
  }, []);

  const retrievedChunks = [
    {
      id: 1,
      text: 'Section 4.2: Full-time employees accrue 15 days of paid time off per calendar year.',
    },
    { id: 2, text: 'Section 4.3: After 5 years of service, PTO increases to 20 days annually.' },
    { id: 3, text: 'Section 4.5: Unused PTO may be carried over up to a maximum of 5 days.' },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">RAG Pipeline</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Retrieval-Augmented Generation eliminates hallucinations by giving the LLM an{' '}
        <strong>open-book</strong> advantage — retrieving real facts from a vector database before
        generating an answer.
      </p>
    </div>
  );

  const mainContent = (
    <>
      <ThemeCard>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-gray-900">RAG Pipeline Animation</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors disabled:opacity-40"
            >
              <Play className="w-4 h-4" /> Run Pipeline
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Query bar */}
        <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-gray-200 mb-4">
          <Search className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{queryText}</span>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-xl p-4 border border-slate-700">
          <svg viewBox="0 0 640 350" className="w-full h-auto">
            {/* Connection lines */}
            {stages.slice(0, -2).map((s, i) => {
              const next = stages[i + 1];
              const isActive = activeStage > i;
              return (
                <line
                  key={`line-${i}`}
                  x1={s.x + 35}
                  y1={s.y}
                  x2={next.x - 35}
                  y2={next.y}
                  stroke={isActive ? '#f43f5e' : '#374151'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  strokeDasharray={isActive ? 'none' : '6 3'}
                />
              );
            })}
            {/* Retrieved → Super Prompt */}
            {(() => {
              const from = stages[3];
              const to = stages[4];
              const isActive = activeStage >= 4;
              return (
                <line
                  x1={from.x + 35}
                  y1={from.y}
                  x2={to.x - 35}
                  y2={to.y}
                  stroke={isActive ? '#f43f5e' : '#374151'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  strokeDasharray={isActive ? 'none' : '6 3'}
                />
              );
            })()}
            {/* Super Prompt → LLM */}
            {(() => {
              const from = stages[4];
              const to = stages[5];
              const isActive = activeStage >= 5;
              return (
                <line
                  x1={from.x}
                  y1={from.y + 30}
                  x2={to.x}
                  y2={to.y - 30}
                  stroke={isActive ? '#f43f5e' : '#374151'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  strokeDasharray={isActive ? 'none' : '6 3'}
                />
              );
            })()}
            {/* Also connect query to augment */}
            {activeStage >= 4 && (
              <path
                d={`M ${stages[0].x + 35} ${stages[0].y - 20} Q 300 50 ${stages[4].x - 35} ${stages[4].y}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.6}
              />
            )}

            {/* Animated pulse traveling along active connection */}
            {activeStage >= 0 && activeStage < stages.length && (
              <circle r={5} fill="#f43f5e" opacity={0.8}>
                <animateMotion
                  dur="0.8s"
                  repeatCount="1"
                  path={
                    activeStage < 4
                      ? `M${stages[activeStage].x},${stages[activeStage].y} L${stages[Math.min(activeStage + 1, stages.length - 1)].x},${stages[Math.min(activeStage + 1, stages.length - 1)].y}`
                      : activeStage === 4
                        ? `M${stages[3].x},${stages[3].y} L${stages[4].x},${stages[4].y}`
                        : `M${stages[4].x},${stages[4].y + 30} L${stages[5].x},${stages[5].y - 30}`
                  }
                />
              </circle>
            )}

            {/* Stage nodes */}
            {stages.map((s, i) => {
              const isActive = i <= activeStage;
              const isCurrent = i === activeStage;
              return (
                <g key={s.id}>
                  {isCurrent && (
                    <circle cx={s.x} cy={s.y} r={38} fill={s.color} opacity={0.15}>
                      <animate
                        attributeName="r"
                        values="36;44;36"
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={30}
                    fill={isActive ? s.color : '#1f2937'}
                    stroke={s.color}
                    strokeWidth={isActive ? 3 : 1.5}
                    opacity={isActive ? 1 : 0.5}
                  />
                  <text x={s.x} y={s.y + 2} textAnchor="middle" className="text-[16px]">
                    {s.icon}
                  </text>
                  <text
                    x={s.x}
                    y={s.y + 48}
                    textAnchor="middle"
                    fill={isActive ? s.color : '#6b7280'}
                    className="text-[9px] font-bold"
                  >
                    {s.label}
                  </text>
                </g>
              );
            })}

            {/* Floating numbers animation during embed stage */}
            {activeStage === 1 && (
              <g>
                {['0.42', '-0.18', '0.91', '0.33', '-0.67'].map((n, i) => (
                  <text
                    key={i}
                    x={130 + i * 18}
                    y={155}
                    fill="#a78bfa"
                    className="text-[8px] font-mono"
                    opacity={0.8}
                  >
                    <animate
                      attributeName="opacity"
                      values="0;0.8;0"
                      dur="1.2s"
                      begin={`${i * 0.15}s`}
                      repeatCount="indefinite"
                    />
                    {n}
                  </text>
                ))}
              </g>
            )}

            {/* Vector DB search animation */}
            {activeStage === 2 && (
              <>
                {[0, 1, 2, 3, 4].map((i) => (
                  <rect
                    key={i}
                    x={280}
                    y={145 + i * 14}
                    width={60}
                    height={10}
                    rx={2}
                    fill={i < 3 ? '#06b6d4' : '#1f2937'}
                    stroke="#06b6d4"
                    strokeWidth={0.5}
                    opacity={0.6}
                  >
                    <animate
                      attributeName="opacity"
                      values="0.3;0.8;0.3"
                      dur="0.8s"
                      begin={`${i * 0.1}s`}
                      repeatCount="indefinite"
                    />
                  </rect>
                ))}
              </>
            )}
          </svg>
        </div>

        {/* Stage explanation */}
        {activeStage >= 0 && (
          <div
            className="mt-3 rounded-lg p-3 text-sm border"
            style={{
              backgroundColor: stages[activeStage].color + '10',
              borderColor: stages[activeStage].color + '40',
              color: stages[activeStage].color,
            }}
          >
            <strong>Stage {activeStage + 1}:</strong> {stageExplanations[activeStage]}
          </div>
        )}
      </ThemeCard>

      {/* Retrieved chunks */}
      {activeStage >= 3 && (
        <ThemeCard>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Retrieved Context</h2>
          <div className="space-y-3">
            {retrievedChunks.map((chunk) => (
              <div
                key={chunk.id}
                className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-lg p-3 border border-emerald-200"
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                    Chunk {chunk.id}
                  </span>
                  <p className="text-sm text-gray-700">{chunk.text}</p>
                </div>
                <div className="mt-1 text-right">
                  <span className="text-xs text-emerald-600 font-mono">
                    similarity: {(0.95 - chunk.id * 0.05).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ThemeCard>
      )}

      {/* Final answer */}
      {activeStage >= 5 && (
        <ThemeCard>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🤖 LLM Response</h2>
          <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 rounded-xl p-4 border border-rose-200">
            <p className="text-gray-800 leading-relaxed">
              Full-time employees receive <strong>15 days</strong> of paid time off per year. After
              5 years of service this increases to <strong>20 days</strong>. Up to{' '}
              <strong>5 unused days</strong> can be carried over to the next year.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">
                ✓ Grounded in retrieved context
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                ✓ No hallucination
              </span>
            </div>
          </div>
        </ThemeCard>
      )}

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Similarity Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              name: 'Cosine Similarity',
              desc: 'Measures the angle between two vectors. Best for semantic similarity regardless of document length.',
              icon: '📐',
            },
            {
              name: 'Euclidean Distance',
              desc: 'Straight-line distance between points. Best for exact matches in low-dimensional space.',
              icon: '📏',
            },
            {
              name: 'Dot Product',
              desc: 'Multiplies vectors to measure alignment. Fast retrieval with normalized vectors.',
              icon: '✖️',
            },
          ].map(({ name, desc, icon }) => (
            <div key={name} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl mb-2">{icon}</div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">{name}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 The Smart Librarian</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          The LLM is a brilliant, fast-talking student taking an exam — but hasn't read your company
          rulebook. Without RAG, it <strong>confidently guesses</strong> (hallucination).
        </p>
        <p className="text-gray-700 leading-relaxed">
          RAG gives the student an <strong>open-book advantage</strong>. The Vector Database is the
          library's master index; the Retriever is an incredibly smart librarian who finds pages by{' '}
          <em>meaning</em>, not keywords. You ask "rules about leaving early" → the librarian brings
          back pages about "flexible hours" and "PTO." The student gives a perfectly accurate answer
          without guessing.
        </p>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default RAGPipeline;
