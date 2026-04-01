import React, { useState, useMemo, useCallback } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Eye, EyeOff, Lightbulb } from 'lucide-react';

// Generate a smooth U-shape with noise
const generateData = (
  seed: number
): { train: { x: number; y: number }[]; test: { x: number; y: number }[] } => {
  const rng = (s: number): number => {
    const x = Math.sin(s * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  const train: { x: number; y: number }[] = [];
  const test: { x: number; y: number }[] = [];
  for (let i = 0; i < 20; i++) {
    const t = (i / 19) * 2 - 1; // -1 to 1
    const y = 0.8 * t * t + 0.1 * t + 0.15 * (rng(seed + i) - 0.5);
    train.push({ x: t, y });
  }
  for (let i = 0; i < 12; i++) {
    const t = ((i + 0.5) / 12) * 2 - 1;
    const y = 0.8 * t * t + 0.1 * t + 0.12 * (rng(seed + 100 + i) - 0.5);
    test.push({ x: t, y });
  }
  return { train, test };
};

const fitPoly = (data: { x: number; y: number }[], degree: number): number[] => {
  // Simple polynomial fit via normal equations (this is a simplified version)
  const n = data.length;
  const m = degree + 1;
  // Build Vandermonde
  const X: number[][] = data.map((d) => {
    const row: number[] = [];
    for (let j = 0; j < m; j++) row.push(Math.pow(d.x, j));
    return row;
  });
  const Y = data.map((d) => d.y);

  // X^T X
  const XtX: number[][] = Array.from({ length: m }, () => Array(m).fill(0));
  const XtY: number[] = Array(m).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      XtY[j] += X[i][j] * Y[i];
      for (let k = 0; k < m; k++) {
        XtX[j][k] += X[i][j] * X[i][k];
      }
    }
  }

  // Regularize slightly to avoid singularity
  for (let j = 0; j < m; j++) XtX[j][j] += 0.0001;

  // Gaussian elimination
  const aug: number[][] = XtX.map((row, i) => [...row, XtY[i]]);
  for (let col = 0; col < m; col++) {
    let maxRow = col;
    for (let row = col + 1; row < m; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    if (Math.abs(aug[col][col]) < 1e-12) continue;
    for (let row = 0; row < m; row++) {
      if (row === col) continue;
      const f = aug[row][col] / aug[col][col];
      for (let j = col; j <= m; j++) aug[row][j] -= f * aug[col][j];
    }
  }

  return aug.map((row, i) => row[m] / (row[i] || 1));
};

const evalPoly = (coeffs: number[], x: number): number =>
  coeffs.reduce((sum, c, i) => sum + c * Math.pow(x, i), 0);

const Generalization: React.FC = () => {
  const [degree, setDegree] = useState(2);
  const [showTest, setShowTest] = useState(false);

  const { train, test } = useMemo(() => generateData(42), []);

  const coeffs = useMemo(() => fitPoly(train, degree), [train, degree]);

  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = -100; i <= 100; i++) {
      const x = i / 100; // -1 to 1
      const y = evalPoly(coeffs, x);
      const sx = 80 + (x + 1) * 220;
      const sy = 320 - (y + 0.2) * 280;
      pts.push(`${sx},${Math.max(20, Math.min(380, sy))}`);
    }
    return pts.join(' ');
  }, [coeffs]);

  const toSvg = useCallback(
    (pt: { x: number; y: number }) => ({
      sx: 80 + (pt.x + 1) * 220,
      sy: 320 - (pt.y + 0.2) * 280,
    }),
    []
  );

  // Compute errors
  const trainError = useMemo(() => {
    const e =
      train.reduce((sum, pt) => sum + Math.abs(pt.y - evalPoly(coeffs, pt.x)), 0) / train.length;
    return e;
  }, [train, coeffs]);

  const testError = useMemo(() => {
    const e =
      test.reduce((sum, pt) => sum + Math.abs(pt.y - evalPoly(coeffs, pt.x)), 0) / test.length;
    return e;
  }, [test, coeffs]);

  const fitLabel =
    degree <= 1
      ? { text: 'Underfitting (High Bias)', color: 'text-blue-600 bg-blue-50 border-blue-200' }
      : degree <= 3
        ? { text: 'Best Fit', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
        : degree <= 7
          ? { text: 'Slight Overfitting', color: 'text-amber-600 bg-amber-50 border-amber-200' }
          : { text: 'Overfitting (High Variance)', color: 'text-red-600 bg-red-50 border-red-200' };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Generalization</h1>
      <p className="text-xl text-gray-700 leading-relaxed mb-3">
        The whole point of machine learning is to make good predictions on{' '}
        <strong>data the model has never seen before</strong>. A model that aces its homework but
        fails every test has <strong>memorized the noise</strong> instead of learning the pattern.
        This section explores the tightrope walk between underfitting and overfitting — known as the{' '}
        <strong>Bias-Variance Tradeoff</strong>.
      </p>
      <p className="text-lg text-gray-600 leading-relaxed">
        Use the interactive slider below to see exactly what happens when a model is too simple,
        just right, or way too complex.
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
              Imagine studying for a math test. You could memorize every single practice problem —
              but if the teacher changes the numbers, you&apos;d be lost. Or you could learn{' '}
              <strong>how to do the math</strong>, and then you can solve <em>any</em> problem.
              That&apos;s what &quot;generalization&quot; means: learning the rules, not just the
              answers.
            </p>
          </div>
        </div>
      </div>
      <ThemeCard>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-gray-900">Interactive Curve Fitter</h2>
          <button
            onClick={() => setShowTest((s) => !s)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showTest
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showTest ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showTest ? 'Hide' : 'Show'} Test Data
          </button>
        </div>

        {/* Fit label */}
        <div
          className={`inline-block px-3 py-1 rounded-full text-sm font-bold border mb-3 ${fitLabel.color}`}
        >
          {fitLabel.text}
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-rose-50/30 rounded-xl p-4 border border-rose-100">
          <svg viewBox="0 0 560 400" className="w-full h-auto">
            {/* Axes */}
            <line x1={70} y1={350} x2={530} y2={350} stroke="#d1d5db" strokeWidth={1} />
            <line x1={70} y1={20} x2={70} y2={350} stroke="#d1d5db" strokeWidth={1} />
            <text x={300} y={390} textAnchor="middle" fill="#9ca3af" className="text-[10px]">
              Input Feature (x)
            </text>
            <text
              x={25}
              y={190}
              textAnchor="middle"
              fill="#9ca3af"
              className="text-[10px]"
              transform="rotate(-90,25,190)"
            >
              Output (y)
            </text>

            {/* Fitted curve */}
            <polyline
              points={curvePath}
              fill="none"
              stroke="#e11d48"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />

            {/* Training data */}
            {train.map((pt, i) => {
              const { sx, sy } = toSvg(pt);
              return (
                <circle
                  key={`tr-${i}`}
                  cx={sx}
                  cy={sy}
                  r={5}
                  fill="#3b82f6"
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              );
            })}

            {/* Test data */}
            {showTest &&
              test.map((pt, i) => {
                const { sx, sy } = toSvg(pt);
                return (
                  <g key={`te-${i}`}>
                    <circle cx={sx} cy={sy} r={5} fill="#10b981" stroke="#fff" strokeWidth={1.5} />
                    {/* Error line to curve */}
                    <line
                      x1={sx}
                      y1={sy}
                      x2={sx}
                      y2={320 - (evalPoly(coeffs, pt.x) + 0.2) * 280}
                      stroke="#10b981"
                      strokeWidth={1}
                      strokeDasharray="3 2"
                      opacity={0.5}
                    />
                  </g>
                );
              })}

            {/* Legend */}
            <circle cx={400} cy={25} r={5} fill="#3b82f6" />
            <text x={410} y={29} fill="#3b82f6" className="text-[9px] font-medium">
              Training Data
            </text>
            {showTest && (
              <>
                <circle cx={400} cy={42} r={5} fill="#10b981" />
                <text x={410} y={46} fill="#10b981" className="text-[9px] font-medium">
                  Test Data (Unseen)
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Poly degree slider */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 mt-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              Model Complexity (Polynomial Degree): <span className="font-bold">{degree}</span>
            </label>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            step={1}
            value={degree}
            onChange={(e) => setDegree(parseInt(e.target.value))}
            className="w-full accent-rose-500"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>1 (straight line)</span>
            <span>2-3 (smooth curve)</span>
            <span>15 (wild zig-zag)</span>
          </div>
        </div>

        {/* Error display */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
            <div className="text-xs text-blue-600 mb-1">Training Error (MAE)</div>
            <div className="text-xl font-bold text-blue-800">{trainError.toFixed(4)}</div>
          </div>
          <div
            className={`rounded-lg p-3 border text-center ${showTest ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}
          >
            <div className={`text-xs mb-1 ${showTest ? 'text-emerald-600' : 'text-gray-400'}`}>
              Test Error (MAE)
            </div>
            <div className={`text-xl font-bold ${showTest ? 'text-emerald-800' : 'text-gray-300'}`}>
              {showTest ? testError.toFixed(4) : '—'}
            </div>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 The School Exam</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Think of training data as practice problems and test data as the real exam. Three types of
          students show exactly what underfitting, overfitting, and good generalization look like:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              student: 'The Underfitter',
              emoji: '😴',
              behavior:
                "Doesn't study at all. Assumes every answer is 'C'. Fails both practice and exam. The model is too simple to capture the pattern.",
              result: 'Practice: ❌ | Exam: ❌',
              color: 'from-blue-50 to-blue-100 border-blue-200',
            },
            {
              student: 'The Overfitter',
              emoji: '🤓',
              behavior:
                'Photographic memory. Memorizes all 100 practice answers word-for-word, including typos. Aces practice, but when the numbers change on the real exam — total confusion.',
              result: 'Practice: ✅ | Exam: ❌',
              color: 'from-red-50 to-red-100 border-red-200',
            },
            {
              student: 'The Best Fit',
              emoji: '🧠',
              behavior:
                'Studies the formulas and underlying rules. Might miss one tricky practice question, but understands the concepts well enough to handle new problems.',
              result: 'Practice: ✅ | Exam: ✅',
              color: 'from-emerald-50 to-emerald-100 border-emerald-200',
            },
          ].map(({ student, emoji, behavior, result, color }) => (
            <div key={student} className={`bg-gradient-to-b ${color} rounded-xl p-4 border`}>
              <div className="text-3xl text-center mb-2">{emoji}</div>
              <h3 className="font-bold text-sm text-center text-gray-900 mb-2">{student}</h3>
              <p className="text-xs text-gray-700 leading-relaxed mb-3">{behavior}</p>
              <div className="text-xs font-mono text-center font-bold text-gray-800 bg-white/60 rounded-lg p-1">
                {result}
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Bias-Variance table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <h3 className="text-lg font-bold text-gray-900 p-4 pb-2">⚖️ The Bias-Variance Tradeoff</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 text-left font-bold text-gray-900">Concept</th>
              <th className="p-3 text-left font-bold text-blue-700">High Bias (Underfitting)</th>
              <th className="p-3 text-left font-bold text-red-700">High Variance (Overfitting)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Model complexity', 'Too simple (straight line)', 'Too complex (wild zig-zag)'],
              ['Training error', 'High', 'Very low (nearly zero)'],
              ['Test error', 'High', 'Very high'],
              ['What it learned', 'Nothing useful', 'Noise + signal together'],
              ['Real-world analogy', 'Guessing randomly', 'Memorizing the textbook'],
              [
                'Fix by...',
                'Adding more features/complexity',
                'Regularization, more data, early stopping',
              ],
            ].map(([concept, bias, variance]) => (
              <tr key={concept} className="border-b last:border-0">
                <td className="p-3 font-medium text-gray-900">{concept}</td>
                <td className="p-3 text-gray-700">{bias}</td>
                <td className="p-3 text-gray-700">{variance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Regularization note */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-200 mb-4">
        <h3 className="font-bold text-violet-900 mb-2">🛡️ How Do We Prevent Overfitting?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              name: 'More Training Data',
              desc: 'More examples make it harder to memorize patterns.',
            },
            {
              name: 'Regularization (L1/L2)',
              desc: 'Penalizes overly large weights — forces simplicity.',
            },
            {
              name: 'Early Stopping',
              desc: 'Stop training before the model starts memorizing noise.',
            },
            {
              name: 'Dropout',
              desc: 'Randomly disable neurons during training — forces redundancy.',
            },
          ].map(({ name, desc }) => (
            <div key={name} className="bg-white/60 rounded-lg p-3 border border-violet-100">
              <span className="font-bold text-sm text-gray-900">{name}</span>
              <p className="text-xs text-gray-600 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key takeaway */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
        <h3 className="font-bold text-emerald-900 mb-2">🎯 Key Takeaway</h3>
        <p className="text-gray-700 leading-relaxed">
          The goal of machine learning is not to get <strong>zero error on training data</strong> —
          it&apos;s to get <strong>low error on data the model has never seen</strong>. Use the
          slider above to see this in action: as you increase the degree past 3, the training error
          drops to near zero, but the test error starts climbing. The sweet spot is a model
          that&apos;s complex enough to capture the pattern, but simple enough to ignore the noise.
        </p>
      </div>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default Generalization;
