import React, { useState } from 'react';
import {
  GitBranch,
  GitMerge,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Settings,
} from 'lucide-react';
import Branching2D from '../visualizations/2d/Branching2D';

const BranchingMerging: React.FC = () => {
  const [activeStrategy, setActiveStrategy] = useState<string>('merge');
  const [activeBranch, setActiveBranch] = useState<string>('feature');

  const branchOperations = [
    {
      id: 'create',
      command: 'git branch',
      title: 'Create Branch',
      icon: <GitBranch className="w-6 h-6" />,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      description: 'Create a new branch for parallel development',
      usage: 'git branch <branch-name>',
      example: 'git branch feature/user-auth',
      whatHappens: [
        'Creates a new branch pointer at current commit',
        'Does not switch to the new branch',
        'Branch is local until pushed to remote',
        'Allows parallel development tracks',
      ],
    },
    {
      id: 'switch',
      command: 'git checkout / git switch',
      title: 'Switch Branch',
      icon: <ArrowRight className="w-6 h-6" />,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      borderColor: 'border-green-300',
      description: 'Move between different branches',
      usage: 'git checkout <branch-name>',
      example: 'git checkout feature/user-auth',
      whatHappens: [
        'Updates HEAD to point to target branch',
        'Updates working directory to match branch',
        'Stages and working directory must be clean',
        'Can create and switch in one command with -b',
      ],
    },
    {
      id: 'merge',
      command: 'git merge',
      title: 'Merge Branches',
      icon: <GitMerge className="w-6 h-6" />,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      description: 'Combine changes from different branches',
      usage: 'git merge <branch-name>',
      example: 'git merge feature/user-auth',
      whatHappens: [
        'Combines histories of two branches',
        'Creates merge commit if needed',
        'May require conflict resolution',
        'Preserves both branch histories',
      ],
    },
  ];

  const mergeStrategies = [
    {
      id: 'merge',
      title: 'Merge Commit',
      icon: <GitMerge className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: 'Creates a merge commit that combines both branches',
      pros: ['Preserves complete history', 'Shows branch structure', 'Non-destructive'],
      cons: ['Can create complex history', 'Extra merge commits'],
      when: 'Default strategy, good for feature branches',
      command: 'git merge feature-branch',
    },
    {
      id: 'squash',
      title: 'Squash Merge',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-yellow-500',
      description: 'Combines all commits from branch into single commit',
      pros: ['Clean linear history', 'Single commit per feature', 'Easy to understand'],
      cons: ['Loses individual commit history', 'Harder to debug'],
      when: 'For clean history with many small commits',
      command: 'git merge --squash feature-branch',
    },
    {
      id: 'rebase',
      title: 'Rebase',
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: 'Replays commits from branch on top of target',
      pros: ['Linear history', 'No merge commits', 'Clean project history'],
      cons: ['Rewrites history', 'Can be complex with conflicts'],
      when: 'For maintaining linear history',
      command: 'git rebase main',
    },
  ];

  const conflictResolution = [
    {
      step: 1,
      title: 'Identify Conflicts',
      description: 'Git marks conflicted files with conflict markers',
      example: '<<<<<<< HEAD\ncurrent code\n=======\nincoming code\n>>>>>>> branch',
    },
    {
      step: 2,
      title: 'Resolve Conflicts',
      description: 'Edit files to resolve conflicts manually',
      example: 'Remove markers and choose final version',
    },
    {
      step: 3,
      title: 'Stage Resolution',
      description: 'Add resolved files to staging area',
      example: 'git add resolved-file.js',
    },
    {
      step: 4,
      title: 'Complete Merge',
      description: 'Commit the merge resolution',
      example: 'git commit -m "Resolve merge conflicts"',
    },
  ];

  const branchingBestPractices = [
    {
      title: 'Use Descriptive Names',
      description: 'Use clear, descriptive branch names that indicate purpose',
      example: 'feature/user-authentication, bugfix/header-styling, hotfix/security-patch',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      title: 'Keep Branches Focused',
      description: 'One feature or fix per branch for easier review and testing',
      example: 'Separate login functionality from password reset feature',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      title: 'Regular Integration',
      description: 'Merge or rebase regularly to avoid large conflicts',
      example: 'Sync with main branch weekly or before major changes',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      title: 'Clean Up Old Branches',
      description: 'Delete merged branches to keep repository organized',
      example: 'git branch -d feature/completed-feature',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
  ];

  const activeOperation =
    branchOperations.find((op) => op.id === activeBranch) || branchOperations[0];
  const activeStrategyData =
    mergeStrategies.find((s) => s.id === activeStrategy) || mergeStrategies[0];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Branching & Merging</h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-6">
          Git's branching model is one of its most powerful features, enabling parallel development,
          experimentation, and collaboration. Master branches to unlock Git's full potential for
          managing complex projects and team workflows.
        </p>
      </div>

      {/* Branch Operations Overview */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 mb-12 border border-orange-200">
        <div className="flex items-center mb-6">
          <div className="bg-orange-500 rounded-full p-3 mr-4">
            <GitBranch className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Branch Operations</h2>
            <p className="text-gray-600">Essential commands for working with branches</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {branchOperations.map((operation) => (
            <button
              key={operation.id}
              onClick={() => setActiveBranch(operation.id)}
              className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                activeBranch === operation.id
                  ? `${operation.borderColor} ${operation.lightColor} shadow-lg transform scale-105`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${operation.color} text-white`}
              >
                {operation.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{operation.title}</h3>
              <code className="text-sm text-gray-600 font-mono">{operation.command}</code>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Branching Visualization */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Interactive Branch Visualization</h2>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <Branching2D
            activeOperation={activeBranch}
            activeStrategy={activeStrategy}
            onOperationChange={setActiveBranch}
            onStrategyChange={setActiveStrategy}
          />
        </div>
      </div>

      {/* Operation Details */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div
          className={`${activeOperation.lightColor} rounded-xl p-8 border ${activeOperation.borderColor}`}
        >
          <div className="flex items-center mb-6">
            <div className={`${activeOperation.color} rounded-full p-3 mr-4 text-white`}>
              {activeOperation.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{activeOperation.title}</h3>
              <code className="text-lg text-gray-700 font-mono">{activeOperation.command}</code>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{activeOperation.description}</p>

          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Usage</h4>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                {activeOperation.usage}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Example</h4>
              <div className="bg-gray-100 p-3 rounded-lg">
                <code className="text-sm text-gray-800 font-mono">{activeOperation.example}</code>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">What Happens</h3>

          {activeOperation.whatHappens.map((item, index) => (
            <div
              key={index}
              className="flex items-start bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
            >
              <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-4 mt-1">
                {index + 1}
              </div>
              <p className="text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Merge Strategies */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Merge Strategies</h2>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {mergeStrategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => setActiveStrategy(strategy.id)}
              className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                activeStrategy === strategy.id
                  ? 'border-orange-300 bg-orange-50 shadow-lg transform scale-105'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${strategy.color} text-white`}
              >
                {strategy.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{strategy.title}</h3>
              <p className="text-sm text-gray-600">{strategy.description}</p>
            </button>
          ))}
        </div>

        {/* Strategy Details */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className={`${activeStrategyData.color} rounded-full p-3 mr-4 text-white`}>
                  {activeStrategyData.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{activeStrategyData.title}</h3>
              </div>

              <p className="text-gray-700 mb-6">{activeStrategyData.description}</p>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2">When to Use</h4>
                <p className="text-gray-600">{activeStrategyData.when}</p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Command</h4>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                  {activeStrategyData.command}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-green-700 mb-3">Pros</h4>
                <ul className="space-y-2">
                  {activeStrategyData.pros.map((pro, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-gray-700">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-bold text-red-700 mb-3">Cons</h4>
                <ul className="space-y-2">
                  {activeStrategyData.cons.map((con, index) => (
                    <li key={index} className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-gray-700">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Resolution */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Conflict Resolution</h2>
        <div className="bg-red-50 rounded-xl p-8 border border-red-200 mb-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
            <h3 className="text-xl font-bold text-red-900">When Conflicts Occur</h3>
          </div>
          <p className="text-red-800">
            Conflicts happen when Git cannot automatically merge changes because the same lines were
            modified differently in both branches. Don't panic - conflicts are normal and
            resolvable!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {conflictResolution.map((step) => (
            <div
              key={step.step}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center mb-4">
                <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                  {step.step}
                </div>
                <h4 className="text-lg font-bold text-gray-900">{step.title}</h4>
              </div>
              <p className="text-gray-700 mb-4">{step.description}</p>
              <div className="bg-gray-50 rounded p-3">
                <code className="text-xs text-gray-800 font-mono whitespace-pre-wrap">
                  {step.example}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Branching Best Practices</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {branchingBestPractices.map((practice, index) => (
            <div
              key={index}
              className="flex items-start bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
            >
              <div className="mr-4 mt-1">{practice.icon}</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{practice.title}</h3>
                <p className="text-gray-700 mb-3">{practice.description}</p>
                <div className="bg-gray-50 rounded p-3">
                  <code className="text-sm text-gray-600 font-mono">{practice.example}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BranchingMerging;
