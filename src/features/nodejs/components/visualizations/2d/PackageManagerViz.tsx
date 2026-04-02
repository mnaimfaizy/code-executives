import React, { useState } from 'react';

interface PackageManagerVizProps {
  className?: string;
}

const PackageManagerViz: React.FC<PackageManagerVizProps> = ({ className = '' }) => {
  const [activePM, setActivePM] = useState<'npm' | 'yarn' | 'pnpm'>('npm');
  const [showInstall, setShowInstall] = useState(false);

  const managers = {
    npm: {
      color: '#cb3837',
      label: 'npm',
      icon: '📦',
      speed: 35,
      disk: 90,
      packages: ['react@19', 'react@19', 'react@19', 'lodash@4', 'lodash@4', 'express@5'],
      strategy: 'Copies packages into every project',
      installTime: '42s',
      diskUsage: '380 MB',
    },
    yarn: {
      color: '#2c8ebb',
      label: 'Yarn (PnP)',
      icon: '🧶',
      speed: 70,
      disk: 25,
      packages: ['react@19', 'lodash@4', 'express@5'],
      strategy: "Plug'n'Play — No node_modules folder",
      installTime: '18s',
      diskUsage: '95 MB',
    },
    pnpm: {
      color: '#f69220',
      label: 'pnpm',
      icon: '⚡',
      speed: 90,
      disk: 10,
      packages: ['react@19 →', 'lodash@4 →', 'express@5 →'],
      strategy: 'Content-addressable store + hard links',
      installTime: '8s',
      diskUsage: '42 MB',
    },
  };

  const pm = managers[activePM];

  return (
    <div className={`relative w-full ${className}`}>
      <div
        style={{
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1a2e 50%, #0f172a 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* PM Selector tabs */}
        <div className="flex items-center justify-center gap-2 pt-4 px-4">
          {(Object.keys(managers) as Array<'npm' | 'yarn' | 'pnpm'>).map((key) => (
            <button
              key={key}
              onClick={() => {
                setActivePM(key);
                setShowInstall(false);
              }}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
              style={{
                background:
                  activePM === key ? `${managers[key].color}30` : 'rgba(255,255,255,0.05)',
                color: activePM === key ? managers[key].color : 'rgba(255,255,255,0.5)',
                border: `1px solid ${activePM === key ? `${managers[key].color}50` : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {managers[key].icon} {managers[key].label}
            </button>
          ))}
        </div>

        <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
          <defs>
            <filter id="pkg-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Title */}
          <text x={320} y={28} textAnchor="middle" fill="white" fontSize="16" fontWeight="700">
            📦 Package Manager Architecture: {pm.label}
          </text>
          <text x={320} y={46} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">
            {pm.strategy}
          </text>

          {/* Registry (source) */}
          <g>
            <rect
              x={20}
              y={70}
              width={120}
              height={100}
              rx={10}
              fill="rgba(99,102,241,0.1)"
              stroke="rgba(99,102,241,0.3)"
              strokeWidth="1.5"
            />
            <text x={80} y={95} textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="700">
              🌐 npm Registry
            </text>
            <text x={80} y={112} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">
              2M+ packages
            </text>
            <text x={80} y={125} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">
              npmjs.com
            </text>

            {/* Download indicator */}
            <rect x={30} y={140} width={100} height={20} rx={4} fill="rgba(99,102,241,0.1)" />
            <text x={80} y={154} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">
              {showInstall ? '⬇ Downloading...' : 'Ready'}
            </text>
          </g>

          {/* Flow arrow */}
          <g>
            <line
              x1={140}
              y1={120}
              x2={175}
              y2={120}
              stroke={pm.color}
              strokeWidth="2"
              strokeDasharray={showInstall ? '0' : '4,4'}
              style={{
                animation: showInstall ? 'flowRight 1s linear infinite' : 'none',
              }}
            />
          </g>

          {activePM === 'npm' && (
            <>
              {/* npm: Multiple node_modules folders */}
              {[0, 1, 2].map((projIdx) => (
                <g key={`proj-${projIdx}`}>
                  {/* Project folder */}
                  <rect
                    x={180 + projIdx * 155}
                    y={70}
                    width={140}
                    height={200}
                    rx={10}
                    fill="rgba(203,56,55,0.06)"
                    stroke={`rgba(203,56,55,${projIdx === 0 ? 0.4 : 0.2})`}
                    strokeWidth="1.5"
                  />
                  <text
                    x={250 + projIdx * 155}
                    y={90}
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                    fontWeight="600"
                  >
                    📁 Project {projIdx + 1}
                  </text>

                  {/* node_modules */}
                  <rect
                    x={190 + projIdx * 155}
                    y={100}
                    width={120}
                    height={130}
                    rx={6}
                    fill="rgba(203,56,55,0.08)"
                    stroke="rgba(203,56,55,0.2)"
                    strokeWidth="1"
                  />
                  <text
                    x={250 + projIdx * 155}
                    y={115}
                    textAnchor="middle"
                    fill="#cb3837"
                    fontSize="7"
                    fontWeight="600"
                  >
                    node_modules/
                  </text>

                  {/* Duplicate packages */}
                  {pm.packages.slice(0, 2).map((pkg, i) => (
                    <g key={`pkg-${projIdx}-${i}`}>
                      <rect
                        x={198 + projIdx * 155}
                        y={125 + i * 28}
                        width={104}
                        height={22}
                        rx={4}
                        fill="rgba(203,56,55,0.15)"
                        stroke="rgba(203,56,55,0.25)"
                        strokeWidth="0.5"
                      />
                      <text
                        x={250 + projIdx * 155}
                        y={140 + i * 28}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.6)"
                        fontSize="7"
                      >
                        📦 {pkg}
                      </text>
                    </g>
                  ))}

                  {/* Disk usage warning */}
                  <text
                    x={250 + projIdx * 155}
                    y={240}
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize="7"
                  >
                    ~127 MB each
                  </text>
                </g>
              ))}

              {/* Duplication warning */}
              <g>
                <rect
                  x={180}
                  y={285}
                  width={440}
                  height={35}
                  rx={8}
                  fill="rgba(239,68,68,0.1)"
                  stroke="rgba(239,68,68,0.3)"
                  strokeWidth="1"
                />
                <text
                  x={400}
                  y={305}
                  textAnchor="middle"
                  fill="#fca5a5"
                  fontSize="9"
                  fontWeight="600"
                >
                  ⚠️ Same packages copied 3x — {pm.diskUsage} total wasted disk space
                </text>
              </g>
            </>
          )}

          {activePM === 'yarn' && (
            <>
              {/* Yarn PnP: .pnp.cjs file */}
              <g>
                <rect
                  x={180}
                  y={70}
                  width={220}
                  height={200}
                  rx={10}
                  fill="rgba(44,139,187,0.06)"
                  stroke="rgba(44,139,187,0.4)"
                  strokeWidth="1.5"
                />
                <text
                  x={290}
                  y={90}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="600"
                >
                  📁 Project Root
                </text>

                {/* .pnp.cjs file */}
                <rect
                  x={195}
                  y={100}
                  width={190}
                  height={40}
                  rx={6}
                  fill="rgba(44,139,187,0.15)"
                  stroke="rgba(44,139,187,0.4)"
                  strokeWidth="1.5"
                />
                <text
                  x={290}
                  y={118}
                  textAnchor="middle"
                  fill="#2c8ebb"
                  fontSize="10"
                  fontWeight="700"
                >
                  📝 .pnp.cjs
                </text>
                <text x={290} y={132} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">
                  Resolution map (no node_modules!)
                </text>

                {/* Crossed out node_modules */}
                <g>
                  <rect
                    x={215}
                    y={150}
                    width={150}
                    height={24}
                    rx={4}
                    fill="rgba(239,68,68,0.1)"
                    stroke="rgba(239,68,68,0.2)"
                    strokeWidth="1"
                  />
                  <text
                    x={290}
                    y={166}
                    textAnchor="middle"
                    fill="rgba(239,68,68,0.5)"
                    fontSize="9"
                    textDecoration="line-through"
                  >
                    ❌ node_modules/
                  </text>
                </g>

                {/* Zero installs indicator */}
                <rect
                  x={210}
                  y={190}
                  width={160}
                  height={35}
                  rx={8}
                  fill="rgba(16,185,129,0.1)"
                  stroke="rgba(16,185,129,0.3)"
                  strokeWidth="1"
                />
                <text
                  x={290}
                  y={210}
                  textAnchor="middle"
                  fill="#6ee7b7"
                  fontSize="9"
                  fontWeight="600"
                >
                  ✨ Zero Installs
                </text>
                <text x={290} y={221} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
                  Commit .pnp.cjs to git
                </text>
              </g>

              {/* Global Cache */}
              <g>
                <rect
                  x={430}
                  y={70}
                  width={190}
                  height={200}
                  rx={10}
                  fill="rgba(44,139,187,0.06)"
                  stroke="rgba(44,139,187,0.25)"
                  strokeWidth="1.5"
                />
                <text
                  x={525}
                  y={90}
                  textAnchor="middle"
                  fill="#2c8ebb"
                  fontSize="10"
                  fontWeight="700"
                >
                  📚 Global Cache
                </text>

                {pm.packages.map((pkg, i) => (
                  <g key={`yarn-pkg-${i}`}>
                    <rect
                      x={440}
                      y={100 + i * 32}
                      width={170}
                      height={26}
                      rx={4}
                      fill="rgba(44,139,187,0.1)"
                      stroke="rgba(44,139,187,0.2)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={525}
                      y={117 + i * 32}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.6)"
                      fontSize="8"
                    >
                      📦 {pkg}
                    </text>
                  </g>
                ))}

                {/* .zip archives */}
                <text x={525} y={220} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
                  Stored as .zip archives
                </text>
              </g>

              {/* Lookup arrow */}
              <line
                x1={400}
                y1={120}
                x2={430}
                y2={120}
                stroke="#2c8ebb"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />
              <text x={415} y={112} textAnchor="middle" fill="#2c8ebb" fontSize="7">
                lookup
              </text>
            </>
          )}

          {activePM === 'pnpm' && (
            <>
              {/* Global content-addressable store */}
              <g>
                <rect
                  x={180}
                  y={70}
                  width={160}
                  height={200}
                  rx={10}
                  fill="rgba(246,146,32,0.06)"
                  stroke="rgba(246,146,32,0.4)"
                  strokeWidth="1.5"
                />
                <text
                  x={260}
                  y={90}
                  textAnchor="middle"
                  fill="#f69220"
                  fontSize="10"
                  fontWeight="700"
                >
                  🗄️ Global Store
                </text>
                <text x={260} y={104} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
                  Content-addressable
                </text>

                {/* Single copies */}
                {['react@19', 'lodash@4', 'express@5'].map((pkg, i) => (
                  <g key={`pnpm-store-${i}`}>
                    <rect
                      x={190}
                      y={115 + i * 40}
                      width={140}
                      height={30}
                      rx={5}
                      fill="rgba(246,146,32,0.15)"
                      stroke="rgba(246,146,32,0.3)"
                      strokeWidth="1"
                      filter="url(#pkg-glow)"
                    />
                    <text
                      x={260}
                      y={134 + i * 40}
                      textAnchor="middle"
                      fill="white"
                      fontSize="9"
                      fontWeight="600"
                    >
                      📦 {pkg}
                    </text>
                  </g>
                ))}

                <text
                  x={260}
                  y={250}
                  textAnchor="middle"
                  fill="#10b981"
                  fontSize="8"
                  fontWeight="600"
                >
                  ✓ Single copy on disk
                </text>
              </g>

              {/* Hard links to projects */}
              {[0, 1].map((projIdx) => (
                <g key={`pnpm-proj-${projIdx}`}>
                  {/* Project */}
                  <rect
                    x={410}
                    y={75 + projIdx * 110}
                    width={210}
                    height={95}
                    rx={10}
                    fill="rgba(255,255,255,0.03)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                  <text
                    x={515}
                    y={95 + projIdx * 110}
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                    fontWeight="600"
                  >
                    📁 Project {projIdx + 1}
                  </text>

                  {/* Symlinked node_modules */}
                  <rect
                    x={420}
                    y={102 + projIdx * 110}
                    width={190}
                    height={20}
                    rx={4}
                    fill="rgba(6,182,212,0.1)"
                    stroke="rgba(6,182,212,0.2)"
                    strokeWidth="0.5"
                  />
                  <text
                    x={515}
                    y={115 + projIdx * 110}
                    textAnchor="middle"
                    fill="#67e8f9"
                    fontSize="7"
                  >
                    node_modules/ (symlinks → store)
                  </text>

                  {/* Packages as symlinks */}
                  {['react', 'lodash', 'express'].map((pkg, i) => (
                    <g key={`sym-${projIdx}-${i}`}>
                      <rect
                        x={420 + i * 65}
                        y={128 + projIdx * 110}
                        width={58}
                        height={18}
                        rx={3}
                        fill="rgba(6,182,212,0.1)"
                        stroke="rgba(6,182,212,0.15)"
                        strokeWidth="0.5"
                        strokeDasharray="3,2"
                      />
                      <text
                        x={449 + i * 65}
                        y={140 + projIdx * 110}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.5)"
                        fontSize="6"
                      >
                        🔗 {pkg}
                      </text>
                    </g>
                  ))}

                  {/* Hard link arrows */}
                  <line
                    x1={340}
                    y1={135 + projIdx * 50}
                    x2={410}
                    y2={115 + projIdx * 110}
                    stroke="#f69220"
                    strokeWidth="1"
                    strokeDasharray="4,3"
                    opacity={0.5}
                  />
                </g>
              ))}

              {/* Disk savings */}
              <g>
                <rect
                  x={410}
                  y={285}
                  width={210}
                  height={35}
                  rx={8}
                  fill="rgba(16,185,129,0.1)"
                  stroke="rgba(16,185,129,0.3)"
                  strokeWidth="1"
                />
                <text
                  x={515}
                  y={305}
                  textAnchor="middle"
                  fill="#6ee7b7"
                  fontSize="9"
                  fontWeight="600"
                >
                  🎯 80% disk savings vs npm
                </text>
              </g>
            </>
          )}

          {/* Performance bars */}
          <g>
            <rect
              x={20}
              y={330}
              width={600}
              height={60}
              rx={10}
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />

            {/* Speed bar */}
            <text x={40} y={350} fill="rgba(255,255,255,0.5)" fontSize="8">
              Install Speed
            </text>
            <rect x={130} y={342} width={200} height={10} rx={5} fill="rgba(255,255,255,0.05)" />
            <rect
              x={130}
              y={342}
              width={pm.speed * 2}
              height={10}
              rx={5}
              fill={pm.color}
              style={{ transition: 'width 0.5s ease' }}
            />
            <text x={340} y={351} fill="rgba(255,255,255,0.5)" fontSize="8">
              {pm.installTime}
            </text>

            {/* Disk bar */}
            <text x={40} y={375} fill="rgba(255,255,255,0.5)" fontSize="8">
              Disk Usage
            </text>
            <rect x={130} y={367} width={200} height={10} rx={5} fill="rgba(255,255,255,0.05)" />
            <rect
              x={130}
              y={367}
              width={pm.disk * 2}
              height={10}
              rx={5}
              fill={pm.disk > 60 ? '#ef4444' : pm.disk > 30 ? '#f59e0b' : '#10b981'}
              style={{ transition: 'width 0.5s ease' }}
            />
            <text x={340} y={376} fill="rgba(255,255,255,0.5)" fontSize="8">
              {pm.diskUsage}
            </text>

            {/* Legend */}
            <g>
              {(Object.keys(managers) as Array<'npm' | 'yarn' | 'pnpm'>).map((key, i) => (
                <g key={`legend-${key}`}>
                  <circle cx={420 + i * 75} cy={350} r={4} fill={managers[key].color} />
                  <text x={428 + i * 75} y={353} fill="rgba(255,255,255,0.5)" fontSize="8">
                    {managers[key].label}
                  </text>
                </g>
              ))}
            </g>
          </g>
        </svg>

        {/* Install simulation */}
        <div className="flex items-center justify-center gap-3 pb-4 px-4">
          <button
            onClick={() => {
              setShowInstall(true);
              setTimeout(() => setShowInstall(false), 2000);
            }}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              background: `${pm.color}30`,
              color: pm.color,
              border: `1px solid ${pm.color}50`,
            }}
          >
            ▶ Simulate Install
          </button>
        </div>
      </div>

      <style>{`
        @keyframes flowRight {
          0% { stroke-dashoffset: 20; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default PackageManagerViz;
