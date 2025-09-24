// src/components/models2d/bigo/metaphors/PNPSpaceVisualization.tsx
// Interactive visualization of P, NP, NP-complete, and NP-hard problem spaces

import React, { useState } from 'react';

interface PNPSpaceVisualizationProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface Problem {
  name: string;
  category: 'P' | 'NP' | 'NPC' | 'NPH';
  x: number;
  y: number;
  description: string;
}

const PNPSpaceVisualization: React.FC<PNPSpaceVisualizationProps> = ({ className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState<'P' | 'NP' | 'NPC' | 'NPH' | null>(null);
  const [hoveredProblem, setHoveredProblem] = useState<string | null>(null);

  const problems: Problem[] = [
    // P problems (efficiently solvable)
    {
      name: 'Sorting',
      category: 'P',
      x: 100,
      y: 80,
      description: 'Can be solved in O(n log n) time',
    },
    {
      name: 'Shortest Path',
      category: 'P',
      x: 150,
      y: 120,
      description: "Dijkstra's algorithm: O((V+E) log V)",
    },
    {
      name: 'Minimum Spanning Tree',
      category: 'P',
      x: 200,
      y: 100,
      description: 'Kruskal/Prim: O(E log V)',
    },
    {
      name: 'Linear Programming',
      category: 'P',
      x: 250,
      y: 140,
      description: 'Interior point methods',
    },

    // NP problems (verifiable in polynomial time)
    {
      name: 'Graph Coloring',
      category: 'NP',
      x: 120,
      y: 200,
      description: 'Check if graph is k-colorable',
    },
    {
      name: 'Hamiltonian Path',
      category: 'NP',
      x: 180,
      y: 220,
      description: 'Find path visiting each vertex once',
    },
    {
      name: 'Subset Sum',
      category: 'NP',
      x: 280,
      y: 180,
      description: 'Find subset summing to target',
    },

    // NP-complete problems
    {
      name: 'Traveling Salesman',
      category: 'NPC',
      x: 150,
      y: 280,
      description: 'Shortest route visiting all cities',
    },
    {
      name: 'Knapsack',
      category: 'NPC',
      x: 220,
      y: 300,
      description: 'Maximize value within weight limit',
    },
    { name: 'SAT', category: 'NPC', x: 300, y: 260, description: 'Boolean satisfiability problem' },
    {
      name: 'Clique',
      category: 'NPC',
      x: 180,
      y: 340,
      description: 'Find largest complete subgraph',
    },

    // NP-hard problems
    { name: 'Haltng Problem', category: 'NPH', x: 320, y: 320, description: 'Undecidable problem' },
    { name: 'Tiling', category: 'NPH', x: 260, y: 360, description: 'Wang tiles completeness' },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'P':
        return '#10b981'; // green
      case 'NP':
        return '#3b82f6'; // blue
      case 'NPC':
        return '#f59e0b'; // amber
      case 'NPH':
        return '#ef4444'; // red
      default:
        return '#6b7280';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'P':
        return 'P (Polynomial)';
      case 'NP':
        return 'NP (Nondeterministic Polynomial)';
      case 'NPC':
        return 'NP-Complete';
      case 'NPH':
        return 'NP-Hard';
      default:
        return category;
    }
  };

  const filteredProblems = selectedCategory
    ? problems.filter((p) => p.category === selectedCategory)
    : problems;

  return (
    <div
      className={`relative w-full h-96 bg-white rounded-lg border-2 border-gray-200 p-4 ${className}`}
    >
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">P vs NP Problem Space</h3>
        <p className="text-sm text-gray-600">
          Explore the complexity classes and famous computational problems
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center space-x-2 mb-4">
        {(['P', 'NP', 'NPC', 'NPH'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-opacity-100 text-white'
                : 'bg-opacity-20 text-gray-700 hover:bg-opacity-40'
            }`}
            style={{
              backgroundColor:
                selectedCategory === category
                  ? getCategoryColor(category)
                  : `${getCategoryColor(category)}33`,
            }}
          >
            {category}
          </button>
        ))}
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300"
          >
            Show All
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getCategoryColor('P') }}
          ></div>
          <span>
            <strong>P:</strong> Efficiently solvable
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getCategoryColor('NP') }}
          ></div>
          <span>
            <strong>NP:</strong> Verifiable in polynomial time
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getCategoryColor('NPC') }}
          ></div>
          <span>
            <strong>NP-C:</strong> Hardest NP problems
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getCategoryColor('NPH') }}
          ></div>
          <span>
            <strong>NP-H:</strong> At least as hard as NP
          </span>
        </div>
      </div>

      {/* Visualization */}
      <div className="relative mb-4" style={{ height: '240px' }}>
        <svg width="400" height="240" className="border border-gray-300 rounded">
          {/* Problem space regions */}
          <defs>
            <pattern id="pPattern" patternUnits="userSpaceOnUse" width="20" height="20">
              <rect width="20" height="20" fill="#10b981" fillOpacity="0.1" />
              <circle cx="10" cy="10" r="2" fill="#10b981" fillOpacity="0.3" />
            </pattern>
            <pattern id="npPattern" patternUnits="userSpaceOnUse" width="20" height="20">
              <rect width="20" height="20" fill="#3b82f6" fillOpacity="0.1" />
              <rect x="0" y="0" width="10" height="10" fill="#3b82f6" fillOpacity="0.2" />
              <rect x="10" y="10" width="10" height="10" fill="#3b82f6" fillOpacity="0.2" />
            </pattern>
            <pattern id="npcPattern" patternUnits="userSpaceOnUse" width="20" height="20">
              <rect width="20" height="20" fill="#f59e0b" fillOpacity="0.1" />
              <polygon points="10,2 18,10 10,18 2,10" fill="#f59e0b" fillOpacity="0.3" />
            </pattern>
            <pattern id="nphPattern" patternUnits="userSpaceOnUse" width="20" height="20">
              <rect width="20" height="20" fill="#ef4444" fillOpacity="0.1" />
              <path
                d="M2,2 L18,18 M18,2 L2,18"
                stroke="#ef4444"
                strokeWidth="1"
                fillOpacity="0.3"
              />
            </pattern>
          </defs>

          {/* Background regions */}
          <rect x="0" y="0" width="150" height="120" fill="url(#pPattern)" />
          <rect x="150" y="0" width="250" height="120" fill="url(#npPattern)" />
          <rect x="150" y="120" width="250" height="120" fill="url(#npcPattern)" />
          <rect x="0" y="120" width="150" height="120" fill="url(#nphPattern)" />

          {/* Region labels */}
          <text x="75" y="60" textAnchor="middle" className="text-sm font-bold fill-gray-700">
            P
          </text>
          <text x="275" y="60" textAnchor="middle" className="text-sm font-bold fill-gray-700">
            NP
          </text>
          <text x="275" y="180" textAnchor="middle" className="text-sm font-bold fill-gray-700">
            NP-Complete
          </text>
          <text x="75" y="180" textAnchor="middle" className="text-sm font-bold fill-gray-700">
            NP-Hard
          </text>

          {/* Problems */}
          {filteredProblems.map((problem, index) => (
            <g key={index}>
              <circle
                cx={problem.x}
                cy={problem.y}
                r="8"
                fill={getCategoryColor(problem.category)}
                stroke="#ffffff"
                strokeWidth="2"
                className="cursor-pointer hover:r-10 transition-all"
                onMouseEnter={() => setHoveredProblem(problem.name)}
                onMouseLeave={() => setHoveredProblem(null)}
              />
              <text
                x={problem.x}
                y={problem.y}
                textAnchor="middle"
                dy="0.35em"
                className="text-xs font-bold fill-white pointer-events-none"
              >
                {problem.name.split(' ')[0]}
              </text>
            </g>
          ))}

          {/* Hover tooltip */}
          {hoveredProblem && (
            <g>
              <rect
                x={problems.find((p) => p.name === hoveredProblem)!.x + 10}
                y={problems.find((p) => p.name === hoveredProblem)!.y - 30}
                width="120"
                height="40"
                fill="#333333"
                fillOpacity="0.9"
                rx="4"
              />
              <text
                x={problems.find((p) => p.name === hoveredProblem)!.x + 70}
                y={problems.find((p) => p.name === hoveredProblem)!.y - 15}
                textAnchor="middle"
                className="text-xs fill-white"
              >
                {hoveredProblem}
              </text>
              <text
                x={problems.find((p) => p.name === hoveredProblem)!.x + 70}
                y={problems.find((p) => p.name === hoveredProblem)!.y - 5}
                textAnchor="middle"
                className="text-xs fill-gray-300"
              >
                {problems.find((p) => p.name === hoveredProblem)!.description.substring(0, 20)}...
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Current Selection Info */}
      {selectedCategory && (
        <div className="text-center text-sm text-gray-600 mb-2">
          <strong>{getCategoryName(selectedCategory)}:</strong>{' '}
          {selectedCategory === 'P'
            ? 'Problems solvable in polynomial time'
            : selectedCategory === 'NP'
              ? 'Problems verifiable in polynomial time'
              : selectedCategory === 'NPC'
                ? 'Hardest NP problems (can reduce any NP problem to these)'
                : 'Problems at least as hard as the hardest NP problems'}
        </div>
      )}

      {/* Key Insight */}
      <div className="text-xs text-gray-600 text-center">
        <p>
          <strong>Key Question:</strong> Does P = NP? If yes, every efficiently verifiable problem
          is also efficiently solvable. Most computer scientists believe P ≠ NP.
        </p>
      </div>
    </div>
  );
};

export default PNPSpaceVisualization;
