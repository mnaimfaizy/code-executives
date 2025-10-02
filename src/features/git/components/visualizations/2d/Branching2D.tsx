import React, { useState } from 'react';
import { GitBranch, Play, RotateCcw } from 'lucide-react';

interface Branching2DProps {
  activeOperation: string;
  activeStrategy: string;
  onOperationChange: (operation: string) => void;
  onStrategyChange: (strategy: string) => void;
}

const Branching2D: React.FC<Branching2DProps> = ({
  activeOperation,
  activeStrategy,
  onOperationChange,
  onStrategyChange,
}) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const commits = [
    { id: 'c1', x: 100, y: 150, branch: 'main', message: 'Initial commit' },
    { id: 'c2', x: 200, y: 150, branch: 'main', message: 'Add homepage' },
    { id: 'c3', x: 300, y: 150, branch: 'main', message: 'Update styles' },
    { id: 'c4', x: 300, y: 100, branch: 'feature', message: 'Add login form' },
    { id: 'c5', x: 400, y: 100, branch: 'feature', message: 'Add validation' },
    { id: 'c6', x: 500, y: 100, branch: 'feature', message: 'Fix styling' },
    { id: 'c7', x: 400, y: 150, branch: 'main', message: 'Merge feature' },
  ];

  const branches = [
    { name: 'main', color: '#3b82f6', y: 150 },
    { name: 'feature', color: '#22c55e', y: 100 },
  ];

  const operations = [
    {
      id: 'create',
      title: 'Create Branch',
      description: 'git branch feature',
      commits: ['c1', 'c2', 'c3'],
    },
    {
      id: 'switch',
      title: 'Switch Branch',
      description: 'git checkout feature',
      commits: ['c1', 'c2', 'c3'],
    },
    {
      id: 'merge',
      title: 'Merge Branch',
      description: 'git merge feature',
      commits: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'],
    },
  ];

  const startAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(0);

    const interval = setInterval(() => {
      setAnimationStep((prev) => {
        if (prev >= 6) {
          setIsAnimating(false);
          clearInterval(interval);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setAnimationStep(0);
  };

  const getVisibleCommits = () => {
    if (!isAnimating) {
      return commits.slice(0, 7); // Show all commits when not animating
    }

    switch (animationStep) {
      case 0:
      case 1:
        return commits.slice(0, 3); // c1, c2, c3
      case 2:
        return commits.slice(0, 4); // Add c4
      case 3:
        return commits.slice(0, 5); // Add c5
      case 4:
        return commits.slice(0, 6); // Add c6
      case 5:
      case 6:
        return commits.slice(0, 7); // Add merge commit c7
      default:
        return commits.slice(0, 3);
    }
  };

  const getCurrentBranch = () => {
    if (!isAnimating) return 'main';
    return animationStep >= 2 && animationStep <= 4 ? 'feature' : 'main';
  };

  const getBranchConnections = () => {
    const connections = [];
    const visibleCommits = getVisibleCommits();

    // Main branch connections
    for (let i = 0; i < visibleCommits.length - 1; i++) {
      const current = visibleCommits[i];
      const next = visibleCommits[i + 1];

      if (current.branch === 'main' && next.branch === 'main') {
        connections.push({
          from: current,
          to: next,
          color: '#3b82f6',
          type: 'main',
        });
      }
    }

    // Feature branch connections
    if (visibleCommits.length > 3) {
      // Branch creation from c3
      connections.push({
        from: visibleCommits[2], // c3
        to: visibleCommits[3], // c4 (first feature commit)
        color: '#22c55e',
        type: 'branch',
      });

      // Feature branch chain
      for (let i = 3; i < Math.min(6, visibleCommits.length - 1); i++) {
        connections.push({
          from: visibleCommits[i],
          to: visibleCommits[i + 1],
          color: '#22c55e',
          type: 'feature',
        });
      }

      // Merge connection
      if (visibleCommits.length > 6) {
        connections.push({
          from: visibleCommits[5], // c6 (last feature commit)
          to: visibleCommits[6], // c7 (merge commit)
          color: '#f97316',
          type: 'merge',
        });
        connections.push({
          from: visibleCommits[2], // c3 (main branch)
          to: visibleCommits[6], // c7 (merge commit)
          color: '#f97316',
          type: 'merge',
        });
      }
    }

    return connections;
  };

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={startAnimation}
          disabled={isAnimating}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          Animate Workflow
        </button>
        <button
          onClick={resetAnimation}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Current Branch Indicator */}
      {isAnimating && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-lg border border-orange-300">
            <GitBranch className="w-4 h-4 text-orange-600" />
            <span className="text-orange-800 font-medium">
              Current branch: <code className="font-mono">{getCurrentBranch()}</code>
            </span>
          </div>
        </div>
      )}

      {/* Branch Visualization */}
      <div className="relative">
        <svg
          viewBox="0 0 700 300"
          className="w-full h-72 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 via-white to-green-50"
        >
          {/* Branch Lines */}
          {branches.map((branch) => (
            <line
              key={branch.name}
              x1={50}
              y1={branch.y}
              x2={650}
              y2={branch.y}
              stroke={branch.color}
              strokeWidth="2"
              strokeDasharray={branch.name === 'feature' ? '5,5' : 'none'}
              opacity="0.3"
            />
          ))}

          {/* Branch Labels */}
          {branches.map((branch) => (
            <g key={`label-${branch.name}`}>
              <rect
                x={10}
                y={branch.y - 12}
                width={35}
                height={24}
                rx="4"
                fill={branch.color}
                opacity="0.1"
              />
              <text
                x={27}
                y={branch.y + 5}
                textAnchor="middle"
                className="text-sm font-medium"
                fill={branch.color}
              >
                {branch.name}
              </text>
            </g>
          ))}

          {/* Connections */}
          {getBranchConnections().map((conn, index) => (
            <g key={index}>
              <defs>
                <marker
                  id={`arrow-${index}`}
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill={conn.color} />
                </marker>
              </defs>

              <line
                x1={conn.from.x + 15}
                y1={conn.from.y}
                x2={conn.to.x - 15}
                y2={conn.to.y}
                stroke={conn.color}
                strokeWidth={conn.type === 'merge' ? '3' : '2'}
                markerEnd={`url(#arrow-${index})`}
                className={`transition-all duration-500 ${
                  conn.type === 'merge' ? 'animate-pulse' : ''
                }`}
              />
            </g>
          ))}

          {/* Commits */}
          {getVisibleCommits().map((commit, index) => {
            const isRecent = isAnimating && index === getVisibleCommits().length - 1;
            const branchColor = branches.find((b) => b.name === commit.branch)?.color || '#gray';

            return (
              <g key={commit.id}>
                {/* Commit Circle */}
                <circle
                  cx={commit.x}
                  cy={commit.y}
                  r="12"
                  fill={branchColor}
                  stroke="white"
                  strokeWidth="2"
                  className={`${isRecent ? 'animate-pulse' : ''} transition-all duration-300`}
                />

                {/* Commit ID */}
                <text
                  x={commit.x}
                  y={commit.y + 4}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white"
                >
                  {commit.id.slice(1)}
                </text>

                {/* Commit Message */}
                <text
                  x={commit.x}
                  y={commit.y + 35}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {commit.message}
                </text>

                {/* Recent commit highlight */}
                {isRecent && (
                  <circle
                    cx={commit.x}
                    cy={commit.y}
                    r="18"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}

          {/* Animation Step Indicators */}
          {isAnimating && (
            <g>
              <rect x={50} y={20} width={300} height={30} rx="15" fill="#f97316" opacity="0.1" />
              <text
                x={200}
                y={40}
                textAnchor="middle"
                className="text-sm font-bold fill-orange-700"
              >
                {animationStep === 0 && 'Initial state: main branch'}
                {animationStep === 1 && 'git branch feature (branch created)'}
                {animationStep === 2 && 'git checkout feature + first commit'}
                {animationStep === 3 && 'Second commit on feature branch'}
                {animationStep === 4 && 'Third commit on feature branch'}
                {animationStep === 5 && 'git checkout main'}
                {animationStep === 6 && 'git merge feature (merge commit created)'}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Operation Tabs */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {operations.map((op) => (
          <button
            key={op.id}
            onClick={() => onOperationChange(op.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
              activeOperation === op.id
                ? 'border-orange-300 bg-orange-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <h4 className="text-lg font-bold text-gray-900 mb-2">{op.title}</h4>
            <code className="text-sm text-gray-600 font-mono">{op.description}</code>
          </button>
        ))}
      </div>

      {/* Merge Strategy Selector */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-lg font-bold text-gray-900 mb-3">Merge Strategy Comparison</h4>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {[
            {
              id: 'merge',
              title: 'Merge Commit',
              command: 'git merge feature',
              description: 'Creates a merge commit preserving branch history',
              pros: ['Preserves branch context', 'Clear merge history', 'Safe for shared branches'],
              cons: ['More complex history', 'Extra merge commits'],
            },
            {
              id: 'squash',
              title: 'Squash Merge',
              command: 'git merge --squash feature',
              description: 'Combines all branch commits into one commit',
              pros: ['Clean linear history', 'Single commit per feature', 'Easy to revert'],
              cons: ['Loses individual commit history', 'No branch context'],
            },
            {
              id: 'rebase',
              title: 'Rebase & Merge',
              command: 'git rebase main && git merge',
              description: 'Replays commits on main branch tip',
              pros: ['Linear history', 'Preserves individual commits', 'Clean timeline'],
              cons: ['Rewrites commit history', 'Dangerous for shared branches'],
            },
          ].map((strategy) => (
            <div
              key={strategy.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                activeStrategy === strategy.id
                  ? 'border-orange-300 bg-orange-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => onStrategyChange(strategy.id)}
            >
              <h5 className="font-bold text-gray-900 mb-2">{strategy.title}</h5>
              <code className="text-xs bg-gray-900 text-orange-400 px-2 py-1 rounded block mb-2">
                {strategy.command}
              </code>
              <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>

              <div className="space-y-2">
                <div>
                  <h6 className="text-xs font-semibold text-green-700 mb-1">Pros:</h6>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {strategy.pros.map((pro, idx) => (
                      <li key={idx}>• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-red-700 mb-1">Cons:</h6>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {strategy.cons.map((con, idx) => (
                      <li key={idx}>• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Animation Status */}
      {isAnimating && (
        <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-orange-900">
                Step {animationStep + 1} of 7: Branch Workflow
              </h4>
              <p className="text-orange-700">
                {animationStep === 0 && 'Starting with a main branch containing initial commits'}
                {animationStep === 1 &&
                  'Creating a new feature branch from the current main branch'}
                {animationStep === 2 && 'Switching to feature branch and making first commit'}
                {animationStep === 3 && 'Adding more changes to the feature branch'}
                {animationStep === 4 && 'Completing feature development with final commit'}
                {animationStep === 5 && 'Switching back to main branch to prepare for merge'}
                {animationStep === 6 && 'Merging feature branch back into main with merge commit'}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold text-orange-800 mb-2">Current Command:</h5>
              <code className="bg-gray-900 text-orange-400 px-3 py-2 rounded block text-sm">
                {animationStep === 0 && '# Initial state'}
                {animationStep === 1 && 'git branch feature'}
                {animationStep === 2 && 'git checkout feature && git commit'}
                {animationStep === 3 && 'git commit -m "Second feature commit"'}
                {animationStep === 4 && 'git commit -m "Third feature commit"'}
                {animationStep === 5 && 'git checkout main'}
                {animationStep === 6 && 'git merge feature'}
              </code>
            </div>

            <div>
              <h5 className="font-semibold text-orange-800 mb-2">What's Happening:</h5>
              <p className="text-sm text-orange-700">
                {animationStep === 0 &&
                  'We start with a main branch that has some commits representing the project history.'}
                {animationStep === 1 &&
                  "A new branch pointer is created, but we haven't switched to it yet."}
                {animationStep === 2 &&
                  'We switch to the feature branch and start making commits specific to our feature.'}
                {animationStep === 3 &&
                  'Feature development continues with additional commits building on previous work.'}
                {animationStep === 4 &&
                  'We complete the feature implementation with a final commit.'}
                {animationStep === 5 &&
                  'We switch back to main branch to integrate our completed feature.'}
                {animationStep === 6 &&
                  'A merge commit is created that combines the feature branch into main.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branching2D;
