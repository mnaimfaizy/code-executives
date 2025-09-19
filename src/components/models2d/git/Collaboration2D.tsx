import React, { useState } from 'react';
import { GitBranch, GitMerge, Users, Play, RotateCcw } from 'lucide-react';

interface Collaboration2DProps {
  activeWorkflow: string;
  onWorkflowChange: (workflow: string) => void;
}

const Collaboration2D: React.FC<Collaboration2DProps> = ({ activeWorkflow, onWorkflowChange }) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const workflows = {
    gitflow: {
      name: 'Git Flow',
      branches: [
        { name: 'master', y: 50, color: '#dc2626', commits: [1, 7, 10] },
        { name: 'develop', y: 100, color: '#2563eb', commits: [1, 2, 5, 6, 8, 9] },
        { name: 'feature/auth', y: 150, color: '#16a34a', commits: [2, 3, 4, 5] },
        { name: 'release/1.0', y: 200, color: '#ca8a04', commits: [6, 7] },
        { name: 'hotfix/bug', y: 250, color: '#dc2626', commits: [8, 9, 10] },
      ],
      description: 'Structured workflow with multiple long-lived branches',
    },
    github: {
      name: 'GitHub Flow',
      branches: [
        { name: 'main', y: 100, color: '#2563eb', commits: [1, 4, 7, 10] },
        { name: 'feature/login', y: 150, color: '#16a34a', commits: [2, 3, 4] },
        { name: 'feature/dashboard', y: 200, color: '#16a34a', commits: [5, 6, 7] },
        { name: 'feature/api', y: 250, color: '#16a34a', commits: [8, 9, 10] },
      ],
      description: 'Simple flow with feature branches and pull requests',
    },
    gitlab: {
      name: 'GitLab Flow',
      branches: [
        { name: 'master', y: 50, color: '#2563eb', commits: [1, 2, 5, 8] },
        { name: 'staging', y: 100, color: '#ca8a04', commits: [1, 2, 5, 8] },
        { name: 'production', y: 150, color: '#dc2626', commits: [1, 5] },
        { name: 'feature/new', y: 200, color: '#16a34a', commits: [2, 3, 4, 5] },
        { name: 'feature/update', y: 250, color: '#16a34a', commits: [6, 7, 8] },
      ],
      description: 'Environment branches with staged deployments',
    },
  };

  const currentWorkflow = workflows[activeWorkflow as keyof typeof workflows];

  const startAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(0);

    const interval = setInterval(() => {
      setAnimationStep((prev) => {
        if (prev >= 9) {
          setIsAnimating(false);
          clearInterval(interval);
          return 0;
        }
        return prev + 1;
      });
    }, 1200);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setAnimationStep(0);
  };

  const getVisibleCommits = () => {
    if (!isAnimating) return 10;
    return Math.min(animationStep + 1, 10);
  };

  const getCommitPosition = (commitId: number) => {
    const baseX = 80;
    const spacing = 50;
    return baseX + (commitId - 1) * spacing;
  };

  const getBranchConnections = () => {
    const connections = [];
    const visibleCommits = getVisibleCommits();

    // Add connections based on workflow type
    if (activeWorkflow === 'gitflow' && visibleCommits >= 2) {
      // Feature branching from develop
      if (visibleCommits >= 2) {
        connections.push({
          from: { x: getCommitPosition(2), y: 100 },
          to: { x: getCommitPosition(2), y: 150 },
          type: 'branch',
          color: '#16a34a',
        });
      }
      // Feature merge back to develop
      if (visibleCommits >= 5) {
        connections.push({
          from: { x: getCommitPosition(5), y: 150 },
          to: { x: getCommitPosition(5), y: 100 },
          type: 'merge',
          color: '#16a34a',
        });
      }
      // Release branch from develop
      if (visibleCommits >= 6) {
        connections.push({
          from: { x: getCommitPosition(6), y: 100 },
          to: { x: getCommitPosition(6), y: 200 },
          type: 'branch',
          color: '#ca8a04',
        });
      }
      // Release to master
      if (visibleCommits >= 7) {
        connections.push({
          from: { x: getCommitPosition(7), y: 200 },
          to: { x: getCommitPosition(7), y: 50 },
          type: 'merge',
          color: '#ca8a04',
        });
      }
    }

    return connections;
  };

  return (
    <div className="w-full">
      {/* Workflow Selector */}
      <div className="flex justify-center gap-4 mb-6">
        {Object.entries(workflows).map(([key, workflow]) => (
          <button
            key={key}
            onClick={() => onWorkflowChange(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeWorkflow === key
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {workflow.name}
          </button>
        ))}
      </div>

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

      {/* Workflow Description */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{currentWorkflow.name}</h3>
        <p className="text-gray-600">{currentWorkflow.description}</p>
      </div>

      {/* Workflow Visualization */}
      <div className="relative">
        <svg
          viewBox="0 0 600 320"
          className="w-full h-80 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 via-white to-green-50"
        >
          {/* Branch Lines */}
          {currentWorkflow.branches.map((branch) => (
            <g key={branch.name}>
              {/* Branch Line */}
              <line
                x1={50}
                y1={branch.y}
                x2={550}
                y2={branch.y}
                stroke={branch.color}
                strokeWidth="2"
                opacity="0.3"
                strokeDasharray={branch.name.includes('/') ? '5,5' : 'none'}
              />

              {/* Branch Label */}
              <rect
                x={10}
                y={branch.y - 10}
                width={35}
                height={20}
                rx="3"
                fill={branch.color}
                opacity="0.1"
              />
              <text
                x={27}
                y={branch.y + 4}
                textAnchor="middle"
                className="text-xs font-medium"
                fill={branch.color}
              >
                {branch.name.length > 8 ? branch.name.substring(0, 8) + '...' : branch.name}
              </text>
            </g>
          ))}

          {/* Branch Connections */}
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
                x1={conn.from.x}
                y1={conn.from.y}
                x2={conn.to.x}
                y2={conn.to.y}
                stroke={conn.color}
                strokeWidth="2"
                markerEnd={`url(#arrow-${index})`}
                className="animate-pulse"
              />

              {/* Connection Label */}
              <text
                x={(conn.from.x + conn.to.x) / 2 + 10}
                y={(conn.from.y + conn.to.y) / 2}
                className="text-xs font-medium"
                fill={conn.color}
              >
                {conn.type}
              </text>
            </g>
          ))}

          {/* Commits */}
          {currentWorkflow.branches.map((branch) =>
            branch.commits
              .filter((commitId) => commitId <= getVisibleCommits())
              .map((commitId) => {
                const x = getCommitPosition(commitId);
                const isRecent = isAnimating && commitId === getVisibleCommits();

                return (
                  <g key={`${branch.name}-${commitId}`}>
                    {/* Commit Circle */}
                    <circle
                      cx={x}
                      cy={branch.y}
                      r="8"
                      fill={branch.color}
                      stroke="white"
                      strokeWidth="2"
                      className={`${isRecent ? 'animate-pulse' : ''} transition-all duration-300`}
                    />

                    {/* Commit ID */}
                    <text
                      x={x}
                      y={branch.y + 3}
                      textAnchor="middle"
                      className="text-xs font-bold fill-white"
                    >
                      {commitId}
                    </text>

                    {/* Recent commit highlight */}
                    {isRecent && (
                      <circle
                        cx={x}
                        cy={branch.y}
                        r="12"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    )}
                  </g>
                );
              })
          )}

          {/* Legend */}
          <g>
            <rect x={450} y={10} width={140} height={80} rx="5" fill="white" stroke="#e5e7eb" />
            <text x={460} y={25} className="text-xs font-bold fill-gray-800">
              Legend
            </text>

            <circle cx={465} cy={35} r="4" fill="#2563eb" />
            <text x={475} y={39} className="text-xs fill-gray-700">
              Main/Master
            </text>

            <circle cx={465} cy={50} r="4" fill="#16a34a" />
            <text x={475} y={54} className="text-xs fill-gray-700">
              Feature
            </text>

            <circle cx={465} y={65} r="4" fill="#ca8a04" />
            <text x={475} y={69} className="text-xs fill-gray-700">
              Release/Staging
            </text>

            <circle cx={465} cy={80} r="4" fill="#dc2626" />
            <text x={475} y={84} className="text-xs fill-gray-700">
              Production/Hotfix
            </text>
          </g>

          {/* Animation Progress */}
          {isAnimating && (
            <g>
              <rect x={50} y={290} width={500} height={20} rx="10" fill="#f3f4f6" />
              <rect
                x={50}
                y={290}
                width={50 * getVisibleCommits()}
                height={20}
                rx="10"
                fill="#f97316"
              />
              <text
                x={300}
                y={304}
                textAnchor="middle"
                className="text-sm font-medium fill-gray-700"
              >
                Step {getVisibleCommits()} of 10
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Workflow Steps */}
      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center mb-2">
            <GitBranch className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="text-lg font-bold text-blue-900">Branch Creation</h4>
          </div>
          <p className="text-sm text-blue-800">
            Create feature branches from main development line
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="text-lg font-bold text-green-900">Collaboration</h4>
          </div>
          <p className="text-sm text-green-800">
            Multiple developers work on different features simultaneously
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center mb-2">
            <GitMerge className="w-5 h-5 text-orange-600 mr-2" />
            <h4 className="text-lg font-bold text-orange-900">Integration</h4>
          </div>
          <p className="text-sm text-orange-800">
            Features are reviewed and merged back to main branches
          </p>
        </div>
      </div>

      {/* Workflow Comparison */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 className="text-xl font-bold text-gray-900 mb-4">Workflow Comparison</h4>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 border">
            <h5 className="font-bold text-gray-800 mb-2">Git Flow</h5>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Best for:</strong> Large teams, scheduled releases
              </p>
              <p>
                <strong>Branches:</strong> master, develop, feature, release, hotfix
              </p>
              <p>
                <strong>Pros:</strong> Structured, supports multiple environments
              </p>
              <p>
                <strong>Cons:</strong> Complex, slower integration
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <h5 className="font-bold text-gray-800 mb-2">GitHub Flow</h5>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Best for:</strong> Continuous deployment, small teams
              </p>
              <p>
                <strong>Branches:</strong> main, feature branches
              </p>
              <p>
                <strong>Pros:</strong> Simple, fast integration
              </p>
              <p>
                <strong>Cons:</strong> Requires good CI/CD, less structured
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <h5 className="font-bold text-gray-800 mb-2">GitLab Flow</h5>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Best for:</strong> Multiple environments, staged deployments
              </p>
              <p>
                <strong>Branches:</strong> master, staging, production, features
              </p>
              <p>
                <strong>Pros:</strong> Environment control, clear promotion path
              </p>
              <p>
                <strong>Cons:</strong> More complex than GitHub Flow
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Step Info */}
      {isAnimating && (
        <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white font-bold text-lg">
              {getVisibleCommits()}
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-orange-900 mb-2">
                Step {getVisibleCommits()}: {currentWorkflow.name} Progress
              </h4>
              <p className="text-orange-800 mb-4">
                {activeWorkflow === 'gitflow' && (
                  <>
                    {getVisibleCommits() === 1 &&
                      'Starting with master branch - production-ready code'}
                    {getVisibleCommits() === 2 &&
                      'Develop branch created - integration branch for features'}
                    {getVisibleCommits() === 3 && 'Feature branch starts - isolated development'}
                    {getVisibleCommits() === 4 &&
                      'Feature development continues - adding functionality'}
                    {getVisibleCommits() === 5 &&
                      'Feature complete - ready to merge back to develop'}
                    {getVisibleCommits() === 6 &&
                      'Release branch created - preparing for production'}
                    {getVisibleCommits() === 7 && 'Release merged to master - new version deployed'}
                    {getVisibleCommits() === 8 && 'Hotfix branch created - fixing critical bug'}
                    {getVisibleCommits() === 9 && 'Hotfix development - quick fix for production'}
                    {getVisibleCommits() === 10 && 'Hotfix merged - bug fixed in production'}
                  </>
                )}
                {activeWorkflow === 'github' && (
                  <>
                    {getVisibleCommits() === 1 && 'Main branch - production-ready code'}
                    {getVisibleCommits() === 2 && 'Feature branch created - isolated development'}
                    {getVisibleCommits() === 3 &&
                      'Feature development - building new functionality'}
                    {getVisibleCommits() === 4 &&
                      'Feature merged via PR - code reviewed and integrated'}
                    {getVisibleCommits() === 5 && 'New feature branch - parallel development'}
                    {getVisibleCommits() === 6 && 'Dashboard feature development continues'}
                    {getVisibleCommits() === 7 && 'Dashboard merged - feature complete'}
                    {getVisibleCommits() === 8 && 'API feature starts - backend development'}
                    {getVisibleCommits() === 9 && 'API development continues - building endpoints'}
                    {getVisibleCommits() === 10 &&
                      'API feature complete - full functionality added'}
                  </>
                )}
                {activeWorkflow === 'gitlab' && (
                  <>
                    {getVisibleCommits() === 1 && 'Master branch - main development line'}
                    {getVisibleCommits() === 2 &&
                      'Feature branch created - new functionality development'}
                    {getVisibleCommits() === 3 &&
                      'Feature development continues - building components'}
                    {getVisibleCommits() === 4 && 'Feature development nearing completion'}
                    {getVisibleCommits() === 5 &&
                      'Feature merged to master and promoted to staging'}
                    {getVisibleCommits() === 6 && 'New feature branch - parallel development'}
                    {getVisibleCommits() === 7 &&
                      'Update feature development - improving existing code'}
                    {getVisibleCommits() === 8 &&
                      'Update merged - staging and production promotion'}
                    {getVisibleCommits() === 9 && 'Production deployment - tested features go live'}
                    {getVisibleCommits() === 10 &&
                      'Complete workflow cycle - from dev to production'}
                  </>
                )}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-orange-800 mb-2">Team Activities:</h5>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Multiple developers working in parallel</li>
                    <li>• Code reviews through pull/merge requests</li>
                    <li>• Continuous integration and testing</li>
                    <li>• Staged deployment process</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-orange-800 mb-2">Quality Gates:</h5>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Automated testing on feature branches</li>
                    <li>• Peer review before integration</li>
                    <li>• Staging environment validation</li>
                    <li>• Production deployment approval</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Collaboration Tips */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-lg font-bold text-blue-900 mb-3">
          🤝 Team Collaboration Best Practices
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h5 className="font-semibold mb-2">Communication:</h5>
            <ul className="space-y-1">
              <li>• Use descriptive branch names</li>
              <li>• Write clear commit messages</li>
              <li>• Link commits to issues/tickets</li>
              <li>• Document major changes</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Code Quality:</h5>
            <ul className="space-y-1">
              <li>• Require code reviews</li>
              <li>• Run automated tests</li>
              <li>• Use linting and formatting</li>
              <li>• Keep branches up to date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collaboration2D;
