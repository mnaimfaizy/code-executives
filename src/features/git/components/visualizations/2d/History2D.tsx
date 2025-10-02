import React, { useState } from 'react';
import { RotateCcw, GitBranch, Shield, Code, Eye, Play } from 'lucide-react';

interface History2DProps {
  activeOperation: string;
  onOperationChange: (operation: string) => void;
  showAdvanced: boolean;
}

const History2D: React.FC<History2DProps> = ({
  activeOperation,
  onOperationChange,
  showAdvanced,
}) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [headPosition, setHeadPosition] = useState(3); // Starting at commit D
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [revertCommit, setRevertCommit] = useState<string | null>(null);

  const operations = {
    reset: { name: 'Git Reset', icon: RotateCcw, color: '#dc2626', maxSteps: 4 },
    revert: { name: 'Git Revert', icon: Shield, color: '#16a34a', maxSteps: 5 },
    rebase: { name: 'Interactive Rebase', icon: GitBranch, color: '#ca8a04', maxSteps: 6 },
    cherrypick: { name: 'Cherry Pick', icon: Code, color: '#7c3aed', maxSteps: 4 },
    reflog: { name: 'Reflog Recovery', icon: Eye, color: '#0ea5e9', maxSteps: 5 },
  };

  const currentOp = operations[activeOperation as keyof typeof operations];

  const commits = [
    { id: 'A', x: 120, y: 150, message: 'Initial commit', hash: 'abc123', author: 'Alice' },
    { id: 'B', x: 220, y: 150, message: 'Add feature X', hash: 'def456', author: 'Bob' },
    { id: 'C', x: 320, y: 150, message: 'Fix critical bug', hash: 'ghi789', author: 'Carol' },
    { id: 'D', x: 420, y: 150, message: 'Update docs', hash: 'jkl012', author: 'Dave' },
  ];

  // Additional commits for different operations (used in visualization)
  // const extraCommits = [
  //   { id: 'E', x: 520, y: 150, message: 'Revert commit', hash: 'mno345', author: 'System' },
  //   { id: 'F', x: 320, y: 100, message: 'Cherry-picked', hash: 'pqr678', author: 'Carol' },
  // ];

  const startAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(0);
    setHeadPosition(3); // Reset to commit D
    setSelectedCommit(null);
    setRevertCommit(null);

    const interval = setInterval(() => {
      setAnimationStep((prev) => {
        const maxSteps = currentOp?.maxSteps || 4;
        if (prev >= maxSteps - 1) {
          setIsAnimating(false);
          clearInterval(interval);
          return 0;
        }

        // Update state based on operation and step
        const nextStep = prev + 1;

        if (activeOperation === 'reset' && nextStep <= 2) {
          setHeadPosition(3 - nextStep);
        } else if (activeOperation === 'revert' && nextStep === 1) {
          setSelectedCommit('B');
        } else if (activeOperation === 'revert' && nextStep === 3) {
          setRevertCommit('E');
        } else if (activeOperation === 'cherrypick' && nextStep === 1) {
          setSelectedCommit('C');
        }

        return nextStep;
      });
    }, 2000);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setAnimationStep(0);
    setHeadPosition(3);
    setSelectedCommit(null);
    setRevertCommit(null);
  };

  const getCommitOpacity = (index: number) => {
    if (!isAnimating) return 1;

    if (activeOperation === 'reset') {
      return index > headPosition ? 0.3 : 1;
    }

    if (activeOperation === 'revert' && selectedCommit === commits[index].id) {
      return 0.7;
    }

    return 1;
  };

  const getCommitScale = (commitId: string) => {
    if (selectedCommit === commitId) {
      return 1.3;
    }
    return 1;
  };

  const shouldShowRevertCommit = () => {
    return activeOperation === 'revert' && revertCommit && animationStep >= 3;
  };

  const shouldShowCherryPick = () => {
    return activeOperation === 'cherrypick' && selectedCommit && animationStep >= 2;
  };

  const getHeadXPosition = () => {
    if (activeOperation === 'reset' && isAnimating) {
      return commits[headPosition]?.x || 120;
    }
    return commits[3].x; // Default to commit D
  };

  return (
    <div className="w-full">
      {/* Operation Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {Object.entries(operations).map(([key, op]) => {
          const IconComponent = op.icon;
          return (
            <button
              key={key}
              onClick={() => onOperationChange(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeOperation === key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {op.name}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={startAnimation}
          disabled={isAnimating}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          Animate {currentOp.name}
        </button>
        <button
          onClick={resetAnimation}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Timeline Visualization */}
      <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-lg font-bold text-gray-800 mb-3">📅 Git History Timeline</h4>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Normal Commit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Selected/Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Unreachable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>New Commit</span>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="relative">
        <svg
          viewBox="0 0 600 280"
          className="w-full h-80 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 via-white to-purple-50 shadow-sm"
        >
          {/* Timeline background */}
          <rect
            x={40}
            y={80}
            width={520}
            height={120}
            rx="10"
            fill="rgba(59, 130, 246, 0.05)"
            stroke="#e5e7eb"
          />

          {/* Branch Line */}
          <line x1={70} y1={150} x2={550} y2={150} stroke="#2563eb" strokeWidth="3" opacity="0.7" />
          <text x={75} y={140} className="text-sm font-semibold fill-blue-600">
            main branch
          </text>

          {/* Time indicators */}
          <text x={120} y={75} className="text-xs fill-gray-500 font-medium">
            Jan 1
          </text>
          <text x={220} y={75} className="text-xs fill-gray-500 font-medium">
            Jan 15
          </text>
          <text x={320} y={75} className="text-xs fill-gray-500 font-medium">
            Feb 1
          </text>
          <text x={420} y={75} className="text-xs fill-gray-500 font-medium">
            Feb 15
          </text>

          {/* Commits */}
          {commits.map((commit, index) => (
            <g
              key={commit.id}
              style={{
                opacity: getCommitOpacity(index),
                transform: `scale(${getCommitScale(commit.id)})`,
              }}
              className="transition-all duration-500 cursor-pointer"
              onClick={() => setSelectedCommit(commit.id)}
            >
              {/* Commit circle */}
              <circle
                cx={commit.x}
                cy={commit.y}
                r="15"
                fill={selectedCommit === commit.id ? '#f97316' : currentOp.color}
                stroke="white"
                strokeWidth="3"
                className={selectedCommit === commit.id ? 'animate-pulse' : ''}
              />

              {/* Commit ID */}
              <text
                x={commit.x}
                y={commit.y + 4}
                textAnchor="middle"
                className="text-sm font-bold fill-white pointer-events-none"
              >
                {commit.id}
              </text>

              {/* Commit hash */}
              <text
                x={commit.x}
                y={commit.y + 35}
                textAnchor="middle"
                className="text-xs fill-gray-500 pointer-events-none"
              >
                {commit.hash}
              </text>

              {/* Commit message */}
              <text
                x={commit.x}
                y={commit.y + 50}
                textAnchor="middle"
                className="text-xs fill-gray-700 font-medium pointer-events-none"
              >
                {commit.message}
              </text>

              {/* Author */}
              <text
                x={commit.x}
                y={commit.y + 65}
                textAnchor="middle"
                className="text-xs fill-gray-400 pointer-events-none"
              >
                by {commit.author}
              </text>

              {/* Selection highlight */}
              {selectedCommit === commit.id && (
                <circle
                  cx={commit.x}
                  cy={commit.y}
                  r="22"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-spin"
                  style={{ animationDuration: '3s' }}
                />
              )}
            </g>
          ))}

          {/* Revert commit (for revert operation) */}
          {shouldShowRevertCommit() && (
            <g className="transition-all duration-500">
              <circle
                cx={520}
                cy={150}
                r="15"
                fill="#16a34a"
                stroke="white"
                strokeWidth="3"
                className="animate-pulse"
              />
              <text x={520} y={154} textAnchor="middle" className="text-sm font-bold fill-white">
                E
              </text>
              <text x={520} y={185} textAnchor="middle" className="text-xs fill-gray-500">
                mno345
              </text>
              <text
                x={520}
                y={200}
                textAnchor="middle"
                className="text-xs fill-gray-700 font-medium"
              >
                Revert "Add feature X"
              </text>

              {/* Arrow pointing to reverted commit */}
              <path
                d={`M 500 140 Q 360 120 240 140`}
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                strokeDasharray="5,5"
                markerEnd="url(#arrowhead-green)"
              />
            </g>
          )}

          {/* Cherry-pick visualization */}
          {shouldShowCherryPick() && (
            <g className="transition-all duration-500">
              <circle
                cx={320}
                cy={100}
                r="15"
                fill="#7c3aed"
                stroke="white"
                strokeWidth="3"
                className="animate-pulse"
              />
              <text x={320} y={104} textAnchor="middle" className="text-sm font-bold fill-white">
                C'
              </text>
              <text
                x={320}
                y={85}
                textAnchor="middle"
                className="text-xs fill-gray-700 font-medium"
              >
                Cherry-picked
              </text>

              {/* Arrow from original commit */}
              <path
                d={`M 320 130 L 320 115`}
                stroke="#7c3aed"
                strokeWidth="2"
                markerEnd="url(#arrowhead-purple)"
              />
            </g>
          )}

          {/* HEAD pointer */}
          <g className="transition-all duration-500">
            <polygon
              points={`${getHeadXPosition() - 10},130 ${getHeadXPosition()},140 ${getHeadXPosition() - 10},150`}
              fill="#f97316"
            />
            <text x={getHeadXPosition() - 20} y={125} className="text-xs font-bold fill-orange-600">
              HEAD
            </text>
          </g>

          {/* Arrow markers */}
          <defs>
            <marker
              id="arrowhead-green"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#16a34a" />
            </marker>
            <marker
              id="arrowhead-purple"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#7c3aed" />
            </marker>
          </defs>

          {/* Current operation label */}
          <rect x={450} y={20} width={140} height={40} rx="5" fill="white" stroke="#e5e7eb" />
          <text x={460} y={35} className="text-sm font-bold fill-gray-800">
            {currentOp.name}
          </text>
          <text x={460} y={50} className="text-xs fill-gray-600">
            {isAnimating ? `Step ${animationStep + 1}` : 'Click animate to start'}
          </text>

          {/* Animation progress bar */}
          {isAnimating && (
            <g>
              <rect x={70} y={250} width={480} height={8} rx="4" fill="#e5e7eb" />
              <rect
                x={70}
                y={250}
                width={480 * ((animationStep + 1) / (currentOp?.maxSteps || 4))}
                height={8}
                rx="4"
                fill="#f97316"
                className="transition-all duration-500"
              />
              <text
                x={315}
                y={245}
                textAnchor="middle"
                className="text-xs fill-gray-600 font-medium"
              >
                Progress: {animationStep + 1} / {currentOp?.maxSteps || 4}
              </text>
            </g>
          )}

          {/* Operation status indicator */}
          <g>
            <rect
              x={450}
              y={20}
              width={140}
              height={50}
              rx="8"
              fill="white"
              stroke="#d1d5db"
              strokeWidth="2"
            />
            <circle
              cx={470}
              cy={35}
              r="6"
              fill={isAnimating ? '#f97316' : '#6b7280'}
              className={isAnimating ? 'animate-pulse' : ''}
            />
            <text x={485} y={38} className="text-sm font-bold fill-gray-800">
              {currentOp.name}
            </text>
            <text x={485} y={55} className="text-xs fill-gray-600">
              {isAnimating
                ? `Step ${animationStep + 1}/${currentOp?.maxSteps || 4}`
                : 'Ready to start'}
            </text>
          </g>
        </svg>
      </div>

      {/* Current Step Description */}
      <div className="mt-6">
        {isAnimating && (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold">
                {animationStep + 1}
              </div>
              <div>
                <h4 className="text-lg font-bold text-orange-900">
                  Step {animationStep + 1}: {currentOp.name} Operation
                </h4>
                <p className="text-orange-800 mb-3">
                  {activeOperation === 'reset' &&
                    animationStep === 0 &&
                    'Analyzing current position and target commit for reset operation'}
                  {activeOperation === 'reset' &&
                    animationStep === 1 &&
                    'Moving HEAD pointer to commit B - commits C and D become unreachable'}
                  {activeOperation === 'reset' &&
                    animationStep === 2 &&
                    'Moving HEAD pointer to commit A - commits B, C, and D are now unreachable'}
                  {activeOperation === 'reset' &&
                    animationStep === 3 &&
                    'Reset complete - working directory and staging area updated to match commit A'}

                  {activeOperation === 'revert' &&
                    animationStep === 0 &&
                    'Analyzing commit B to understand what changes need to be undone'}
                  {activeOperation === 'revert' &&
                    animationStep === 1 &&
                    'Commit B selected for reversion - examining its changes'}
                  {activeOperation === 'revert' &&
                    animationStep === 2 &&
                    "Calculating inverse changes needed to undo commit B's modifications"}
                  {activeOperation === 'revert' &&
                    animationStep === 3 &&
                    'Creating new commit E that undoes changes from commit B'}
                  {activeOperation === 'revert' &&
                    animationStep === 4 &&
                    "Revert complete - history preserved, commit B's changes are undone safely"}

                  {activeOperation === 'rebase' &&
                    animationStep === 0 &&
                    'Starting interactive rebase - preparing to modify commit history'}
                  {activeOperation === 'rebase' &&
                    animationStep === 1 &&
                    'Analyzing commit sequence and identifying commits to modify'}
                  {activeOperation === 'rebase' &&
                    animationStep === 2 &&
                    'Applying commits one by one with potential modifications'}
                  {activeOperation === 'rebase' &&
                    animationStep === 3 &&
                    'Reordering and combining commits as specified in rebase plan'}
                  {activeOperation === 'rebase' &&
                    animationStep === 4 &&
                    'Resolving any conflicts that arise during the rebase process'}
                  {activeOperation === 'rebase' &&
                    animationStep === 5 &&
                    'Rebase complete - commit history has been rewritten with cleaner structure'}

                  {activeOperation === 'cherrypick' &&
                    animationStep === 0 &&
                    'Identifying commit C with the specific changes we want to apply'}
                  {activeOperation === 'cherrypick' &&
                    animationStep === 1 &&
                    'Commit C selected - analyzing its changes for cherry-picking'}
                  {activeOperation === 'cherrypick' &&
                    animationStep === 2 &&
                    "Creating new commit C' with the same changes as commit C"}
                  {activeOperation === 'cherrypick' &&
                    animationStep === 3 &&
                    "Cherry-pick complete - commit C's changes applied to current branch"}

                  {activeOperation === 'reflog' &&
                    animationStep === 0 &&
                    "Opening reflog - Git's record of all HEAD movements and operations"}
                  {activeOperation === 'reflog' &&
                    animationStep === 1 &&
                    'Displaying chronological history of all repository state changes'}
                  {activeOperation === 'reflog' &&
                    animationStep === 2 &&
                    'Locating lost commits that are no longer reachable from any branch'}
                  {activeOperation === 'reflog' &&
                    animationStep === 3 &&
                    'Identifying the commit hash needed for recovery operation'}
                  {activeOperation === 'reflog' &&
                    animationStep === 4 &&
                    'Recovery complete - previously lost work has been restored'}
                </p>

                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <h5 className="font-semibold text-orange-800 mb-2">💡 What's Happening:</h5>
                  <div className="text-sm text-orange-700 space-y-1">
                    {activeOperation === 'reset' && (
                      <>
                        <p>
                          • <strong>--soft:</strong> Moves HEAD only, keeps staging and working
                          directory
                        </p>
                        <p>
                          • <strong>--mixed:</strong> Moves HEAD and resets staging, keeps working
                          directory
                        </p>
                        <p>
                          • <strong>--hard:</strong> Moves HEAD and resets both staging and working
                          directory
                        </p>
                        <p>
                          • ⚠️ Commits become unreachable but may still exist in reflog for ~90 days
                        </p>
                      </>
                    )}
                    {activeOperation === 'revert' && (
                      <>
                        <p>• Creates a new commit that undoes the changes from the target commit</p>
                        <p>• Original history remains intact - safe for shared branches</p>
                        <p>• For merge commits, use -m flag to specify which parent to revert to</p>
                        <p>• ✅ Safe operation - can be used on public/shared branches</p>
                      </>
                    )}
                    {activeOperation === 'rebase' && (
                      <>
                        <p>• Replays commits on top of a different base commit</p>
                        <p>• Can modify commit messages, combine commits, or reorder them</p>
                        <p>• Creates new commit hashes even for unchanged commits</p>
                        <p>• ⚠️ Never rebase commits that have been pushed to shared branches</p>
                      </>
                    )}
                    {activeOperation === 'cherrypick' && (
                      <>
                        <p>• Applies the changes from a specific commit to the current branch</p>
                        <p>• Creates a new commit with the same changes but different hash</p>
                        <p>• Useful for applying bug fixes across multiple branches</p>
                        <p>
                          • ✅ Generally safe, but watch for duplicate commits in merge scenarios
                        </p>
                      </>
                    )}
                    {activeOperation === 'reflog' && (
                      <>
                        <p>• Local log of all HEAD movements in your repository</p>
                        <p>• Shows commits even after they become unreachable</p>
                        <p>• Entries expire after ~90 days (configurable)</p>
                        <p>• 🔧 Essential tool for recovering from mistakes</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Operation Info */}
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-lg font-bold text-gray-900 mb-3">How {currentOp.name} Works</h4>
          <div className="space-y-2 text-sm text-gray-700">
            {activeOperation === 'reset' && (
              <>
                <p>• Moves HEAD and branch pointer to specified commit</p>
                <p>• Can modify staging area and working directory</p>
                <p>• May make commits unreachable (dangerous)</p>
              </>
            )}
            {activeOperation === 'revert' && (
              <>
                <p>• Creates new commits that undo previous changes</p>
                <p>• Does not rewrite existing history</p>
                <p>• Safe for shared/public branches</p>
              </>
            )}
            {activeOperation === 'rebase' && (
              <>
                <p>• Replays commits on top of a new base</p>
                <p>• Can modify, reorder, or combine commits</p>
                <p>• Creates linear, clean history</p>
              </>
            )}
            {activeOperation === 'cherrypick' && (
              <>
                <p>• Applies specific commits to current branch</p>
                <p>• Creates new commits with same changes</p>
                <p>• Useful for selective bug fixes</p>
              </>
            )}
            {activeOperation === 'reflog' && (
              <>
                <p>• Local log of all HEAD movements</p>
                <p>• Helps recover lost commits</p>
                <p>• Available for about 90 days by default</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-lg font-bold text-gray-900 mb-3">Safety Level</h4>
          <div className="space-y-3 text-sm">
            {activeOperation === 'reset' && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-red-700 font-medium">High Risk - Can lose work</span>
              </div>
            )}
            {activeOperation === 'revert' && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-green-700 font-medium">Low Risk - Safe operation</span>
              </div>
            )}
            {activeOperation === 'rebase' && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-yellow-700 font-medium">Medium Risk - Rewrites history</span>
              </div>
            )}
            {activeOperation === 'cherrypick' && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-green-700 font-medium">Low Risk - Safe operation</span>
              </div>
            )}
            {activeOperation === 'reflog' && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-blue-700 font-medium">Recovery Tool - No risk</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Operation Comparison Matrix */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-gray-200">
        <h4 className="text-xl font-bold text-gray-900 mb-6">🔍 History Operation Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-3 px-4 font-bold">Operation</th>
                <th className="text-left py-3 px-4 font-bold">Safety</th>
                <th className="text-left py-3 px-4 font-bold">History Impact</th>
                <th className="text-left py-3 px-4 font-bold">Use Case</th>
                <th className="text-left py-3 px-4 font-bold">Shared Branches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className={activeOperation === 'reset' ? 'bg-red-50' : 'bg-white'}>
                <td className="py-3 px-4 font-medium">Git Reset</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                    High Risk
                  </span>
                </td>
                <td className="py-3 px-4">Rewrites history</td>
                <td className="py-3 px-4">Undo local commits</td>
                <td className="py-3 px-4">❌ Never</td>
              </tr>
              <tr className={activeOperation === 'revert' ? 'bg-green-50' : 'bg-white'}>
                <td className="py-3 px-4 font-medium">Git Revert</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                    Safe
                  </span>
                </td>
                <td className="py-3 px-4">Preserves history</td>
                <td className="py-3 px-4">Undo public commits</td>
                <td className="py-3 px-4">✅ Yes</td>
              </tr>
              <tr className={activeOperation === 'rebase' ? 'bg-yellow-50' : 'bg-white'}>
                <td className="py-3 px-4 font-medium">Rebase</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                    Medium Risk
                  </span>
                </td>
                <td className="py-3 px-4">Rewrites history</td>
                <td className="py-3 px-4">Clean up commits</td>
                <td className="py-3 px-4">⚠️ Private only</td>
              </tr>
              <tr className={activeOperation === 'cherrypick' ? 'bg-purple-50' : 'bg-white'}>
                <td className="py-3 px-4 font-medium">Cherry Pick</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                    Safe
                  </span>
                </td>
                <td className="py-3 px-4">Adds new commits</td>
                <td className="py-3 px-4">Apply specific fixes</td>
                <td className="py-3 px-4">✅ Yes</td>
              </tr>
              <tr className={activeOperation === 'reflog' ? 'bg-blue-50' : 'bg-white'}>
                <td className="py-3 px-4 font-medium">Reflog</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    Recovery Tool
                  </span>
                </td>
                <td className="py-3 px-4">Read-only view</td>
                <td className="py-3 px-4">Recover lost work</td>
                <td className="py-3 px-4">📋 Information only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Examples */}
      {showAdvanced && (
        <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            💻 Command Examples & Best Practices
          </h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-orange-500 text-white text-xs flex items-center justify-center">
                  $
                </span>
                Common Commands:
              </h5>
              <div className="space-y-3 text-sm">
                {activeOperation === 'reset' && (
                  <>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git reset --soft HEAD~1
                      </code>
                      <p className="text-gray-600 mt-1">Undo last commit, keep changes staged</p>
                    </div>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git reset --hard HEAD~2
                      </code>
                      <p className="text-gray-600 mt-1">Remove last 2 commits completely</p>
                    </div>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git reset --mixed abc123
                      </code>
                      <p className="text-gray-600 mt-1">
                        Reset to specific commit, unstage changes
                      </p>
                    </div>
                  </>
                )}
                {activeOperation === 'revert' && (
                  <>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git revert HEAD
                      </code>
                      <p className="text-gray-600 mt-1">Safely undo the last commit</p>
                    </div>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git revert HEAD~2..HEAD
                      </code>
                      <p className="text-gray-600 mt-1">Revert a range of commits</p>
                    </div>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git revert -m 1 abc123
                      </code>
                      <p className="text-gray-600 mt-1">Revert a merge commit</p>
                    </div>
                  </>
                )}
                {activeOperation === 'rebase' && (
                  <>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git rebase -i HEAD~3
                      </code>
                      <p className="text-gray-600 mt-1">Interactive rebase last 3 commits</p>
                    </div>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git rebase main
                      </code>
                      <p className="text-gray-600 mt-1">Rebase current branch onto main</p>
                    </div>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git rebase --onto main dev~2
                      </code>
                      <p className="text-gray-600 mt-1">Advanced rebase with specific range</p>
                    </div>
                  </>
                )}
                {activeOperation === 'cherrypick' && (
                  <>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git cherry-pick abc123
                      </code>
                      <p className="text-gray-600 mt-1">Apply specific commit to current branch</p>
                    </div>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git cherry-pick abc123..def456
                      </code>
                      <p className="text-gray-600 mt-1">Cherry-pick a range of commits</p>
                    </div>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git cherry-pick -x abc123
                      </code>
                      <p className="text-gray-600 mt-1">Record original commit in message</p>
                    </div>
                  </>
                )}
                {activeOperation === 'reflog' && (
                  <>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git reflog
                      </code>
                      <p className="text-gray-600 mt-1">Show all HEAD movements</p>
                    </div>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git reflog --oneline -10
                      </code>
                      <p className="text-gray-600 mt-1">Show last 10 reflog entries</p>
                    </div>
                    <div>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
                        git reset --hard HEAD@{'{2}'}
                      </code>
                      <p className="text-gray-600 mt-1">Recover using reflog reference</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-blue-500 text-white text-xs flex items-center justify-center">
                  !
                </span>
                Best Practices & Tips:
              </h5>
              <ul className="space-y-2 text-sm text-gray-700">
                {activeOperation === 'reset' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">⚠️</span>
                      <span>
                        <strong>Never reset shared/public branches</strong> - it rewrites history
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✅</span>
                      <span>
                        Use <code>--soft</code> for gentle undo operations that preserve changes
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">💡</span>
                      <span>
                        Create backup branches before using <code>--hard</code>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">🔍</span>
                      <span>Check reflog before major resets to understand impact</span>
                    </li>
                  </>
                )}
                {activeOperation === 'revert' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✅</span>
                      <span>
                        <strong>Preferred method for public branches</strong> - safe and traceable
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">💡</span>
                      <span>Write clear revert commit messages explaining why</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">⚠️</span>
                      <span>Test thoroughly after reverting merge commits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">🔍</span>
                      <span>Consider the impact on feature branches and deployments</span>
                    </li>
                  </>
                )}
                {activeOperation === 'rebase' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">⚠️</span>
                      <span>
                        <strong>Only rebase private/local branches</strong> - golden rule!
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✅</span>
                      <span>
                        Use interactive mode (<code>-i</code>) for commit cleanup
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">💡</span>
                      <span>Understand the golden rule: never rebase shared commits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">🤝</span>
                      <span>Communicate with team before rebasing shared work</span>
                    </li>
                  </>
                )}
                {activeOperation === 'cherrypick' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✅</span>
                      <span>Prefer merging entire branches when possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">⚠️</span>
                      <span>Watch for duplicate commits in future merges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">💡</span>
                      <span>
                        Use <code>-x</code> flag to record original commit reference
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">🧪</span>
                      <span>Test thoroughly after cherry-picking complex changes</span>
                    </li>
                  </>
                )}
                {activeOperation === 'reflog' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✅</span>
                      <span>Check reflog before major operations for safety</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">💡</span>
                      <span>Reflog entries expire after ~90 days (configurable)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">🆘</span>
                      <span>Essential tool for emergency recovery situations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">💾</span>
                      <span>Keep backups of important work beyond reflog expiry</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History2D;
