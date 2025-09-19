import React, { useState } from 'react';
import { RotateCcw, GitBranch, AlertTriangle, Shield, Code, Eye, Play } from 'lucide-react';
import History2D from '../../components/models2d/git/History2D';

const HistoryManagement: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState('reset');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const operations = {
    reset: {
      name: 'Git Reset',
      icon: RotateCcw,
      danger: 'high',
      description: 'Move HEAD and branch pointer, optionally modify staging and working directory',
      variants: [
        {
          command: 'git reset --soft HEAD~1',
          effect: 'Undo last commit, keep changes staged',
          safety: 'safe',
        },
        {
          command: 'git reset --mixed HEAD~1',
          effect: 'Undo last commit, unstage changes',
          safety: 'safe',
        },
        {
          command: 'git reset --hard HEAD~1',
          effect: 'Undo last commit, discard all changes',
          safety: 'dangerous',
        },
      ],
    },
    revert: {
      name: 'Git Revert',
      icon: Shield,
      danger: 'low',
      description: 'Create new commits that undo previous commits without rewriting history',
      variants: [
        {
          command: 'git revert HEAD',
          effect: 'Create commit that undoes last commit',
          safety: 'safe',
        },
        {
          command: 'git revert HEAD~2..HEAD',
          effect: 'Revert multiple commits in range',
          safety: 'safe',
        },
        {
          command: 'git revert -m 1 <merge-commit>',
          effect: 'Revert a merge commit',
          safety: 'safe',
        },
      ],
    },
    rebase: {
      name: 'Interactive Rebase',
      icon: GitBranch,
      danger: 'medium',
      description: 'Rewrite commit history by modifying, reordering, or combining commits',
      variants: [
        {
          command: 'git rebase -i HEAD~3',
          effect: 'Interactive rebase of last 3 commits',
          safety: 'moderate',
        },
        {
          command: 'git rebase --onto main feature~5',
          effect: 'Move commits to different base',
          safety: 'moderate',
        },
        {
          command: 'git rebase --continue',
          effect: 'Continue after resolving conflicts',
          safety: 'safe',
        },
      ],
    },
    cherrypick: {
      name: 'Cherry Pick',
      icon: Code,
      danger: 'low',
      description: 'Apply changes from specific commits to current branch',
      variants: [
        {
          command: 'git cherry-pick <commit-hash>',
          effect: 'Apply single commit to current branch',
          safety: 'safe',
        },
        {
          command: 'git cherry-pick A..B',
          effect: 'Apply range of commits',
          safety: 'safe',
        },
        {
          command: 'git cherry-pick --no-commit <hash>',
          effect: 'Apply changes without committing',
          safety: 'safe',
        },
      ],
    },
    reflog: {
      name: 'Reflog Recovery',
      icon: Eye,
      danger: 'low',
      description: 'View and recover from Git reference log - your safety net',
      variants: [
        {
          command: 'git reflog',
          effect: 'Show all recent HEAD movements',
          safety: 'safe',
        },
        {
          command: 'git reflog expire --expire=90.days.ago --all',
          effect: 'Clean old reflog entries',
          safety: 'moderate',
        },
        {
          command: 'git reset --hard HEAD@{2}',
          effect: 'Recover to previous state',
          safety: 'dangerous',
        },
      ],
    },
  };

  const currentOp = operations[activeOperation as keyof typeof operations];

  const getSafetyColor = (safety: string) => {
    switch (safety) {
      case 'safe':
        return 'text-green-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'dangerous':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDangerColor = (danger: string) => {
    switch (danger) {
      case 'low':
        return 'border-green-200 bg-green-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'high':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">History Management</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Master advanced Git history manipulation techniques: reset, revert, rebase, cherry-pick,
          and recovery operations. Learn when to use each tool and how to work safely with Git
          history.
        </p>
      </div>

      {/* Safety Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ History Rewriting Safety</h3>
            <p className="text-yellow-700 mb-3">
              Some Git operations rewrite history and can be dangerous, especially on shared
              branches. Always consider the impact on team members and follow these guidelines:
            </p>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              <li>
                <strong>Never rewrite published history</strong> that others might have based work
                on
              </li>
              <li>
                <strong>Use protective operations</strong> like revert instead of reset on shared
                branches
              </li>
              <li>
                <strong>Communicate with your team</strong> before performing destructive operations
              </li>
              <li>
                <strong>Keep backups</strong> and use reflog to recover from mistakes
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Operation Selector */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {Object.entries(operations).map(([key, op]) => {
          const IconComponent = op.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveOperation(key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                activeOperation === key
                  ? getDangerColor(op.danger) + ' ring-2 ring-orange-300'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{op.name}</span>
              {op.danger === 'high' && <AlertTriangle className="w-4 h-4 text-red-500" />}
            </button>
          );
        })}
      </div>

      {/* Current Operation Details */}
      <div className={`rounded-lg border-2 p-6 mb-8 ${getDangerColor(currentOp.danger)}`}>
        <div className="flex items-center gap-3 mb-4">
          <currentOp.icon className="w-6 h-6" />
          <h3 className="text-2xl font-bold text-gray-900">{currentOp.name}</h3>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentOp.danger === 'high'
                ? 'bg-red-100 text-red-800'
                : currentOp.danger === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
            }`}
          >
            {currentOp.danger === 'high'
              ? 'High Risk'
              : currentOp.danger === 'medium'
                ? 'Moderate Risk'
                : 'Low Risk'}
          </div>
        </div>

        <p className="text-lg text-gray-700 mb-6">{currentOp.description}</p>

        {/* Command Variants */}
        <div className="grid gap-4">
          <h4 className="text-lg font-bold text-gray-900 mb-3">Common Usage Patterns:</h4>
          {currentOp.variants.map((variant, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-800 inline-block mb-2">
                    {variant.command}
                  </code>
                  <p className="text-gray-600 text-sm">{variant.effect}</p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${getSafetyColor(variant.safety)} bg-opacity-10`}
                >
                  {variant.safety}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Interactive History Visualization</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Play className="w-4 h-4" />
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>

        <History2D
          activeOperation={activeOperation}
          onOperationChange={setActiveOperation}
          showAdvanced={showAdvanced}
        />
      </div>

      {/* Best Practices */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <h3 className="text-xl font-bold text-green-900 mb-4">✅ Safe Practices</h3>
          <ul className="space-y-3 text-green-800">
            <li className="flex items-start gap-2">
              <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Use revert for shared branches instead of reset</span>
            </li>
            <li className="flex items-start gap-2">
              <Eye className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Check reflog regularly to understand your history</span>
            </li>
            <li className="flex items-start gap-2">
              <GitBranch className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Create backup branches before major operations</span>
            </li>
            <li className="flex items-start gap-2">
              <Code className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Test interactive rebases on feature branches first</span>
            </li>
          </ul>
        </div>

        <div className="bg-red-50 rounded-lg border border-red-200 p-6">
          <h3 className="text-xl font-bold text-red-900 mb-4">❌ Dangerous Practices</h3>
          <ul className="space-y-3 text-red-800">
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Never use --hard reset on shared branches</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Don't rebase commits that others have pulled</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Avoid force pushing without team coordination</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Don't modify history of release or main branches</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Recovery Section */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4">🔧 Recovery Techniques</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-blue-800 mb-2">When Things Go Wrong:</h4>
            <ul className="space-y-2 text-blue-700 text-sm">
              <li>
                • Check <code className="bg-blue-100 px-1 rounded">git reflog</code> to see recent
                actions
              </li>
              <li>
                • Use{' '}
                <code className="bg-blue-100 px-1 rounded">git reset --hard HEAD@{'{n}'}</code> to
                go back
              </li>
              <li>
                • Find lost commits with{' '}
                <code className="bg-blue-100 px-1 rounded">git fsck --lost-found</code>
              </li>
              <li>• Create new branch from lost commit hash</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-blue-800 mb-2">Prevention Strategies:</h4>
            <ul className="space-y-2 text-blue-700 text-sm">
              <li>• Always work on feature branches for experiments</li>
              <li>
                • Use <code className="bg-blue-100 px-1 rounded">git stash</code> to save work in
                progress
              </li>
              <li>• Make frequent commits with descriptive messages</li>
              <li>• Keep local and remote repositories in sync</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryManagement;
