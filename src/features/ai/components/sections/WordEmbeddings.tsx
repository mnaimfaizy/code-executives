import React, { useState, useMemo, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Search } from 'lucide-react';

interface WordPoint {
  word: string;
  x: number;
  y: number;
  category: string;
}

const words: WordPoint[] = [
  // Royalty cluster
  { word: 'King', x: 350, y: 80, category: 'royalty' },
  { word: 'Queen', x: 410, y: 100, category: 'royalty' },
  { word: 'Prince', x: 370, y: 120, category: 'royalty' },
  { word: 'Princess', x: 430, y: 130, category: 'royalty' },
  { word: 'Crown', x: 390, y: 60, category: 'royalty' },

  // Gender
  { word: 'Man', x: 200, y: 90, category: 'gender' },
  { word: 'Woman', x: 260, y: 110, category: 'gender' },
  { word: 'Boy', x: 180, y: 130, category: 'gender' },
  { word: 'Girl', x: 240, y: 150, category: 'gender' },

  // Emotions cluster
  { word: 'Happy', x: 100, y: 260, category: 'emotion' },
  { word: 'Joyful', x: 130, y: 290, category: 'emotion' },
  { word: 'Glad', x: 80, y: 300, category: 'emotion' },
  { word: 'Excited', x: 150, y: 310, category: 'emotion' },
  { word: 'Sad', x: 420, y: 320, category: 'emotion' },
  { word: 'Gloomy', x: 450, y: 340, category: 'emotion' },
  { word: 'Melancholy', x: 390, y: 350, category: 'emotion' },

  // Food
  { word: 'Apple', x: 80, y: 170, category: 'food' },
  { word: 'Orange', x: 100, y: 200, category: 'food' },
  { word: 'Banana', x: 60, y: 220, category: 'food' },
  { word: 'Pizza', x: 140, y: 180, category: 'food' },

  // Transportation
  { word: 'Car', x: 460, y: 200, category: 'transport' },
  { word: 'Airplane', x: 500, y: 180, category: 'transport' },
  { word: 'Train', x: 480, y: 230, category: 'transport' },
  { word: 'Bicycle', x: 440, y: 250, category: 'transport' },
];

const categoryColors: Record<string, { fill: string; glow: string; label: string }> = {
  royalty: { fill: '#f59e0b', glow: '#fbbf24', label: 'Royalty' },
  gender: { fill: '#8b5cf6', glow: '#a78bfa', label: 'Gender' },
  emotion: { fill: '#ec4899', glow: '#f472b6', label: 'Emotions' },
  food: { fill: '#10b981', glow: '#34d399', label: 'Food' },
  transport: { fill: '#3b82f6', glow: '#60a5fa', label: 'Transport' },
};

const cosineSim = (a: WordPoint, b: WordPoint): number => {
  const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  return Math.max(0, 1 - dist / 500);
};

const WordEmbeddings: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showArithmetic, setShowArithmetic] = useState(false);

  const selectedWord = useMemo(() => words.find((w) => w.word === selected) ?? null, [selected]);

  const neighbors = useMemo(() => {
    if (!selectedWord) return [];
    return words
      .filter((w) => w.word !== selected)
      .map((w) => ({ word: w, sim: cosineSim(selectedWord, w) }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 4);
  }, [selectedWord, selected]);

  const handleWordClick = useCallback((word: string) => {
    setSelected((prev) => (prev === word ? null : word));
    setShowArithmetic(false);
  }, []);

  const kingW = words.find((w) => w.word === 'King')!;
  const manW = words.find((w) => w.word === 'Man')!;
  const womanW = words.find((w) => w.word === 'Woman')!;
  const queenW = words.find((w) => w.word === 'Queen')!;

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Word Embeddings</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        Words become <strong>coordinates in a semantic galaxy</strong>. Similar meanings cluster
        together. And with vector arithmetic, <em>King − Man + Woman = Queen</em>.
      </p>
    </div>
  );

  const mainContent = (
    <>
      <ThemeCard>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-gray-900">Semantic Galaxy</h2>
          <button
            onClick={() => {
              setShowArithmetic((s) => !s);
              setSelected(null);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showArithmetic
                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                : 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200'
            }`}
          >
            <Search className="w-4 h-4" />
            {showArithmetic ? 'Hide' : 'Show'} Vector Arithmetic
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          Click any word to see its nearest semantic neighbors and cosine similarity scores.
        </p>

        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-xl p-4 border border-slate-700">
          <svg viewBox="0 0 580 400" className="w-full h-auto">
            {/* Stars background */}
            {Array.from({ length: 40 }, (_, i) => (
              <circle
                key={`star-${i}`}
                cx={(i * 137.5) % 580}
                cy={(i * 73.7) % 400}
                r={0.8}
                fill="white"
                opacity={0.3 + (i % 3) * 0.2}
              />
            ))}

            {/* Cluster halos */}
            {Object.entries(
              words.reduce<Record<string, { xs: number[]; ys: number[] }>>((acc, w) => {
                if (!acc[w.category]) acc[w.category] = { xs: [], ys: [] };
                acc[w.category].xs.push(w.x);
                acc[w.category].ys.push(w.y);
                return acc;
              }, {})
            ).map(([cat, { xs, ys }]) => {
              const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
              const cy = ys.reduce((a, b) => a + b, 0) / ys.length;
              const r =
                Math.max(...xs.map((x) => Math.abs(x - cx)), ...ys.map((y) => Math.abs(y - cy))) +
                30;
              return (
                <circle
                  key={cat}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={categoryColors[cat].fill}
                  opacity={0.06}
                />
              );
            })}

            {/* Neighbor connections */}
            {selectedWord &&
              neighbors.map(({ word: nw, sim }) => (
                <g key={nw.word}>
                  <line
                    x1={selectedWord.x}
                    y1={selectedWord.y}
                    x2={nw.x}
                    y2={nw.y}
                    stroke={categoryColors[selectedWord.category].glow}
                    strokeWidth={sim * 3}
                    opacity={0.7}
                    strokeDasharray="4 2"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="12"
                      to="0"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </line>
                  <text
                    x={(selectedWord.x + nw.x) / 2 + 10}
                    y={(selectedWord.y + nw.y) / 2 - 5}
                    fill={categoryColors[selectedWord.category].glow}
                    className="text-[8px] font-mono"
                    opacity={0.9}
                  >
                    {sim.toFixed(2)}
                  </text>
                </g>
              ))}

            {/* Vector arithmetic arrows */}
            {showArithmetic && (
              <g>
                {/* King → Man (subtract) */}
                <line
                  x1={kingW.x}
                  y1={kingW.y}
                  x2={manW.x}
                  y2={manW.y}
                  stroke="#ef4444"
                  strokeWidth={2}
                  markerEnd="url(#arrowRed)"
                />
                <text
                  x={(kingW.x + manW.x) / 2 + 10}
                  y={(kingW.y + manW.y) / 2 - 8}
                  fill="#ef4444"
                  className="text-[9px] font-bold"
                >
                  − Man
                </text>

                {/* + Woman */}
                <line
                  x1={manW.x}
                  y1={manW.y}
                  x2={womanW.x}
                  y2={womanW.y}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                />

                {/* Woman → Queen (result) */}
                <line
                  x1={womanW.x}
                  y1={womanW.y}
                  x2={queenW.x}
                  y2={queenW.y}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  markerEnd="url(#arrowGreen)"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="18"
                    to="0"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </line>
                <text
                  x={(womanW.x + queenW.x) / 2 + 10}
                  y={(womanW.y + queenW.y) / 2 - 8}
                  fill="#10b981"
                  className="text-[9px] font-bold"
                >
                  + Woman = Queen!
                </text>

                {/* Highlight glow on Queen */}
                <circle cx={queenW.x} cy={queenW.y} r={20} fill="#10b981" opacity={0.15}>
                  <animate
                    attributeName="r"
                    values="18;24;18"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )}

            {/* Word points */}
            {words.map((w) => {
              const isSelected = w.word === selected;
              const col = categoryColors[w.category];
              return (
                <g key={w.word} onClick={() => handleWordClick(w.word)} className="cursor-pointer">
                  {isSelected && (
                    <circle cx={w.x} cy={w.y} r={16} fill={col.fill} opacity={0.2}>
                      <animate
                        attributeName="r"
                        values="14;20;14"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <circle
                    cx={w.x}
                    cy={w.y}
                    r={isSelected ? 6 : 4}
                    fill={col.fill}
                    stroke="white"
                    strokeWidth={1}
                  />
                  <text
                    x={w.x}
                    y={w.y - 10}
                    textAnchor="middle"
                    fill={col.glow}
                    className={`text-[9px] ${isSelected ? 'font-bold' : 'font-medium'}`}
                  >
                    {w.word}
                  </text>
                </g>
              );
            })}

            {/* Legend */}
            {Object.entries(categoryColors).map(([cat, col], i) => (
              <g key={cat} transform={`translate(10, ${360 + i * 0})`}>
                <circle cx={10 + i * 100} cy={385} r={4} fill={col.fill} />
                <text x={18 + i * 100} y={389} fill={col.glow} className="text-[8px]">
                  {col.label}
                </text>
              </g>
            ))}

            {/* Defs */}
            <defs>
              <marker
                id="arrowRed"
                viewBox="0 0 10 10"
                refX={8}
                refY={5}
                markerWidth={5}
                markerHeight={5}
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
              </marker>
              <marker
                id="arrowGreen"
                viewBox="0 0 10 10"
                refX={8}
                refY={5}
                markerWidth={5}
                markerHeight={5}
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Selected word info */}
        {selectedWord && (
          <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: categoryColors[selectedWord.category].fill }}
              />
              <span className="font-bold text-gray-900">{selectedWord.word}</span>
              <span className="text-xs text-gray-500">
                ({categoryColors[selectedWord.category].label})
              </span>
            </div>
            <div className="text-xs text-gray-600">
              <span className="font-medium">Nearest neighbors:</span>{' '}
              {neighbors.map((n) => `${n.word.word} (${n.sim.toFixed(2)})`).join(', ')}
            </div>
          </div>
        )}
      </ThemeCard>

      {showArithmetic && (
        <ThemeCard>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vector Arithmetic on Language</h2>
          <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 rounded-xl p-6 border border-rose-200 text-center">
            <p className="font-mono text-xl text-gray-800 mb-3">
              <span className="text-amber-600">King</span>
              <span className="text-gray-400"> − </span>
              <span className="text-purple-600">Man</span>
              <span className="text-gray-400"> + </span>
              <span className="text-purple-600">Woman</span>
              <span className="text-gray-400"> ≈ </span>
              <span className="text-amber-600 font-bold">Queen</span>
            </p>
            <p className="text-sm text-gray-600">
              The model has mathematically encoded abstract concepts of gender and royalty as
              directional vectors. Subtracting "maleness" and adding "femaleness" navigates to the
              correct answer.
            </p>
          </div>
        </ThemeCard>
      )}

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 The Magical Library</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Imagine a massive library where books automatically slide across the room to group near
          books with similar <em>meaning</em> — not alphabetically. Drop a book about "Apples" and
          it slides next to "Oranges" and "Bananas," far from "Airplanes."
        </p>
        <p className="text-gray-700 leading-relaxed">
          Each word's embedding is its <strong>GPS coordinate</strong> in this meaning-based space.
          And because meaning maps to position, you can navigate using math.
        </p>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default WordEmbeddings;
