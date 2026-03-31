import React, { useState, useCallback, useRef, useEffect } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import { Play, RotateCcw, Pause } from 'lucide-react';

// Rastrigin-like loss landscape for interesting topology
const lossAt = (x: number, y: number): number => {
  const nx = (x - 300) / 60;
  const ny = (y - 200) / 60;
  return (
    0.5 * (nx * nx + ny * ny) +
    2 * Math.cos(2 * Math.PI * nx * 0.6) +
    2 * Math.cos(2 * Math.PI * ny * 0.6)
  );
};

const gradAt = (x: number, y: number): [number, number] => {
  const eps = 0.5;
  const dx = (lossAt(x + eps, y) - lossAt(x - eps, y)) / (2 * eps);
  const dy = (lossAt(x, y + eps) - lossAt(x, y - eps)) / (2 * eps);
  return [dx, dy];
};

const GradientDescent: React.FC = () => {
  const [ballPos, setBallPos] = useState<{ x: number; y: number } | null>(null);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [lr, setLr] = useState(0.5);
  const [isRunning, setIsRunning] = useState(false);
  const animRef = useRef<number | null>(null);
  const ballRef = useRef(ballPos);
  ballRef.current = ballPos;

  // Generate contour data
  const contourLines: React.ReactNode[] = [];
  const levels = [-3, -2, -1, 0, 1, 2, 3, 4, 6, 8, 10, 14];
  const colors = [
    '#1e3a5f',
    '#1e4d7a',
    '#1a6b9a',
    '#2588b8',
    '#3ba5d0',
    '#60c0de',
    '#86d4e8',
    '#b0e4f0',
    '#d4f0f8',
    '#e8f7fb',
    '#f5e6d0',
    '#f0c8a0',
  ];

  for (let gy = 10; gy < 400; gy += 4) {
    for (let gx = 10; gx < 590; gx += 4) {
      const v = lossAt(gx, gy);
      let idx = levels.findIndex((l) => v < l);
      if (idx === -1) idx = levels.length - 1;
      contourLines.push(
        <rect
          key={`${gx}-${gy}`}
          x={gx}
          y={gy}
          width={4}
          height={4}
          fill={colors[Math.min(idx, colors.length - 1)]}
          opacity={0.85}
        />
      );
    }
  }

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (isRunning) return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const scaleX = 600 / rect.width;
      const scaleY = 400 / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      setBallPos({ x, y });
      setPath([{ x, y }]);
    },
    [isRunning]
  );

  const stepDescent = useCallback(() => {
    if (!ballRef.current) return false;
    const { x, y } = ballRef.current;
    const [gx, gy] = gradAt(x, y);
    const mag = Math.sqrt(gx * gx + gy * gy);
    if (mag < 0.001) return false;

    const step = lr * 30;
    const nx = x - gx * step;
    const ny = y - gy * step;

    // Check bounds — divergence
    if (nx < 0 || nx > 600 || ny < 0 || ny > 400) {
      setBallPos({ x: Math.max(0, Math.min(600, nx)), y: Math.max(0, Math.min(400, ny)) });
      setPath((p) => [
        ...p,
        { x: Math.max(0, Math.min(600, nx)), y: Math.max(0, Math.min(400, ny)) },
      ]);
      return false; // diverged
    }

    setBallPos({ x: nx, y: ny });
    setPath((p) => [...p, { x: nx, y: ny }]);
    return true;
  }, [lr]);

  useEffect(() => {
    if (!isRunning) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let stepCount = 0;
    const animate = (): void => {
      stepCount++;
      const ok = stepDescent();
      if (!ok || stepCount > 500) {
        setIsRunning(false);
        return;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    const timeout = setTimeout(() => {
      animRef.current = requestAnimationFrame(animate);
    }, 60);

    return () => {
      clearTimeout(timeout);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, stepDescent]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setBallPos(null);
    setPath([]);
  }, []);

  const lrLabel =
    lr < 0.2
      ? 'Very Low — Slow convergence'
      : lr < 0.6
        ? 'Good — Balanced'
        : lr < 1.2
          ? 'High — Risk of overshoot'
          : 'Extreme — Likely divergence!';
  const lrColor =
    lr < 0.2
      ? 'text-blue-600'
      : lr < 0.6
        ? 'text-emerald-600'
        : lr < 1.2
          ? 'text-amber-600'
          : 'text-red-600';

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Gradient Descent</h1>
      <p className="text-xl text-gray-700 leading-relaxed">
        The blindfolded hiker descends a misty mountain. Each step follows the steepest downhill
        slope — the <strong>negative gradient</strong>. The stride length — the{' '}
        <strong>learning rate</strong> — makes all the difference.
      </p>
    </div>
  );

  const mainContent = (
    <>
      <ThemeCard>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-gray-900">Interactive Loss Landscape</h2>
          <div className="flex gap-2">
            <button
              onClick={() => (ballPos ? setIsRunning((r) => !r) : undefined)}
              disabled={!ballPos}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors disabled:opacity-40"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pause' : 'Start Descent'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          Click anywhere on the landscape to drop the ball, then adjust the learning rate and start
          descent.
        </p>

        {/* Learning rate slider */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              Learning Rate (α): <span className="font-bold">{lr.toFixed(2)}</span>
            </label>
            <span className={`text-xs font-medium ${lrColor}`}>{lrLabel}</span>
          </div>
          <input
            type="range"
            min={0.05}
            max={2}
            step={0.05}
            value={lr}
            onChange={(e) => setLr(parseFloat(e.target.value))}
            className="w-full accent-rose-500"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>0.05 (tiny steps)</span>
            <span>1.0 (moderate)</span>
            <span>2.0 (huge leaps)</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden border border-slate-700">
          <svg
            viewBox="0 0 600 400"
            className="w-full h-auto cursor-crosshair"
            onClick={handleSvgClick}
          >
            {/* Contour heatmap */}
            {contourLines}

            {/* Global minimum indicator */}
            <circle
              cx={300}
              cy={200}
              r={6}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="3 2"
            />
            <text
              x={300}
              y={188}
              textAnchor="middle"
              fill="#fbbf24"
              className="text-[9px] font-bold"
            >
              Global Min
            </text>

            {/* Descent path */}
            {path.length > 1 && (
              <polyline
                points={path.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeLinejoin="round"
                opacity={0.9}
              />
            )}

            {/* Path dots */}
            {path.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={1.5} fill="#fbbf24" opacity={0.6} />
            ))}

            {/* Ball */}
            {ballPos && (
              <g>
                <circle cx={ballPos.x} cy={ballPos.y} r={10} fill="#f43f5e" opacity={0.3}>
                  <animate
                    attributeName="r"
                    values="10;16;10"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx={ballPos.x}
                  cy={ballPos.y}
                  r={6}
                  fill="#f43f5e"
                  stroke="#fff"
                  strokeWidth={2}
                />
              </g>
            )}

            {/* Legend */}
            <rect x={10} y={360} width={180} height={30} rx={6} fill="rgba(0,0,0,0.6)" />
            <text x={20} y={380} fill="#60c0de" className="text-[9px]">
              Deep Blue = Low Loss
            </text>
            <text x={110} y={380} fill="#f0c8a0" className="text-[9px]">
              Warm = High Loss
            </text>
          </svg>
        </div>

        {/* Info strip */}
        {ballPos && (
          <div className="mt-3 flex gap-4 text-sm bg-white rounded-lg p-2 border border-gray-200">
            <span className="text-gray-500">
              Steps: <strong className="text-gray-900">{path.length}</strong>
            </span>
            <span className="text-gray-500">
              Loss:{' '}
              <strong className="text-rose-600">{lossAt(ballPos.x, ballPos.y).toFixed(3)}</strong>
            </span>
            <span className="text-gray-500">
              Position: ({ballPos.x.toFixed(0)}, {ballPos.y.toFixed(0)})
            </span>
          </div>
        )}
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Rule</h2>
        <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 rounded-xl p-6 border border-rose-200 text-center">
          <p className="font-mono text-lg text-gray-800 mb-2">
            θ<sub>new</sub> = θ<sub>old</sub> − α × ∇L(θ)
          </p>
          <p className="text-sm text-gray-600">
            Move the parameters (θ) in the direction opposite to the gradient (∇L), scaled by the
            learning rate (α).
          </p>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">⛰️ The Blindfolded Hiker</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: 'Tiny Steps (α ≈ 0.01)',
              desc: 'The hiker inch-crawls safely downhill. Guaranteed to reach the bottom — but it takes three weeks.',
              color: 'bg-blue-50 border-blue-200 text-blue-800',
            },
            {
              label: 'Good Stride (α ≈ 0.1)',
              desc: 'Confident walking pace. Reaches the valley floor quickly without overshooting. The sweet spot.',
              color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
            },
            {
              label: 'Flying Leaps (α > 1)',
              desc: 'The hiker launches off the opposite hillside. Each step makes things worse. Total divergence.',
              color: 'bg-red-50 border-red-200 text-red-800',
            },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl p-4 border ${item.color}`}>
              <h3 className="font-bold mb-1 text-sm">{item.label}</h3>
              <p className="text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  return <SectionLayout section="ai" hero={heroContent} mainContent={mainContent} />;
};

export default GradientDescent;
