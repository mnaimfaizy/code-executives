import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Search,
  RotateCcw,
  GitBranch,
  Lock,
  Zap,
} from 'lucide-react';

const Troubleshooting: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('conflicts');
  const [searchTerm, setSearchTerm] = useState('');

  const troubleshootingCategories = {
    conflicts: {
      name: 'Merge Conflicts',
      icon: AlertTriangle,
      color: 'red',
      issues: [
        {
          problem: 'Merge conflict during pull/merge',
          symptoms: ['CONFLICT (content): Merge conflict in file.txt', 'Automatic merge failed'],
          cause: 'Two branches modified the same lines in a file',
          solution: [
            'Open conflicted files and look for conflict markers (<<<<<<< HEAD)',
            'Choose which changes to keep or combine both',
            'Remove conflict markers (<<<<<<< ======= >>>>>>>)',
            'Stage resolved files with git add',
            'Complete merge with git commit',
          ],
          commands: [
            'git status # See conflicted files',
            'vim file.txt # Edit and resolve conflicts',
            'git add file.txt # Stage resolved file',
            'git commit # Complete the merge',
          ],
          prevention: 'Pull frequently, communicate with team, use feature branches',
        },
        {
          problem: 'Rebase conflicts',
          symptoms: ['CONFLICT (content): Merge conflict in file.txt', 'could not apply abc123'],
          cause: 'Rebasing commits that conflict with target branch',
          solution: [
            'Edit conflicted files to resolve conflicts',
            'Stage resolved files with git add',
            'Continue rebase with git rebase --continue',
            'Repeat until all commits are applied',
          ],
          commands: [
            'git rebase --continue # After resolving conflicts',
            'git rebase --abort # Cancel rebase',
            'git rebase --skip # Skip problematic commit',
          ],
          prevention: 'Keep feature branches up to date, rebase frequently',
        },
      ],
    },
    history: {
      name: 'History Issues',
      icon: RotateCcw,
      color: 'yellow',
      issues: [
        {
          problem: 'Accidentally committed wrong files',
          symptoms: ['Wrong files in last commit', 'Sensitive data committed'],
          cause: 'Added files without checking, forgot to use .gitignore',
          solution: [
            'For last commit: git reset --soft HEAD~1',
            'Unstage wrong files, fix .gitignore',
            'Stage correct files and recommit',
            'For published commits: create new commit to fix',
          ],
          commands: [
            'git reset --soft HEAD~1 # Undo last commit',
            'git rm --cached file.txt # Unstage file',
            'git commit --amend # Modify last commit',
          ],
          prevention: 'Use git status before committing, maintain good .gitignore',
        },
        {
          problem: 'Lost commits after reset',
          symptoms: ['Commits disappeared', "Can't find previous work"],
          cause: 'Used git reset --hard without backup',
          solution: [
            'Check reflog: git reflog',
            'Find lost commit hash',
            'Create new branch: git branch recovery <hash>',
            'Or reset to commit: git reset --hard <hash>',
          ],
          commands: [
            'git reflog # Show recent HEAD movements',
            'git branch recovery abc123 # Create branch from lost commit',
            'git reset --hard HEAD@{2} # Reset to reflog entry',
          ],
          prevention: 'Create backup branches before dangerous operations',
        },
      ],
    },
    remote: {
      name: 'Remote Issues',
      icon: GitBranch,
      color: 'blue',
      issues: [
        {
          problem: 'Push rejected (non-fast-forward)',
          symptoms: ['! [rejected] main -> main (non-fast-forward)', 'Updates were rejected'],
          cause: "Remote has commits you don't have locally",
          solution: [
            'Pull remote changes: git pull origin main',
            'Resolve any conflicts if they occur',
            'Push again: git push origin main',
            'Alternative: git pull --rebase for cleaner history',
          ],
          commands: [
            'git pull origin main # Fetch and merge',
            'git pull --rebase origin main # Fetch and rebase',
            'git push origin main # Push after update',
          ],
          prevention: 'Pull frequently, coordinate with team on shared branches',
        },
        {
          problem: 'Authentication failed',
          symptoms: ['Authentication failed', 'Permission denied', '403 Forbidden'],
          cause: 'Invalid credentials, expired tokens, wrong permissions',
          solution: [
            'Check if you have access to the repository',
            'Update credentials or personal access token',
            'Verify remote URL is correct',
            'Use HTTPS or SSH depending on setup',
          ],
          commands: [
            'git remote -v # Check remote URLs',
            'git remote set-url origin <new-url> # Update remote URL',
            'git config --global user.name "Your Name" # Set username',
          ],
          prevention: 'Keep credentials updated, use SSH keys for authentication',
        },
      ],
    },
    workspace: {
      name: 'Workspace Issues',
      icon: Lock,
      color: 'purple',
      issues: [
        {
          problem: 'Untracked files causing issues',
          symptoms: ['Files not appearing in status', 'Changes not being tracked'],
          cause: 'Files ignored by .gitignore or not added to Git',
          solution: [
            'Check .gitignore for patterns excluding your files',
            'Use git add -f to force add ignored files',
            'Check if file is actually in repository',
            'Verify file permissions and location',
          ],
          commands: [
            'git status --ignored # Show ignored files',
            'git check-ignore file.txt # Check why file is ignored',
            'git add -f file.txt # Force add ignored file',
          ],
          prevention: 'Understand .gitignore patterns, review status regularly',
        },
        {
          problem: 'Working directory not clean',
          symptoms: ['Please commit your changes or stash them', 'Working tree is dirty'],
          cause: 'Uncommitted changes blocking Git operations',
          solution: [
            'Commit changes: git add . && git commit -m "message"',
            'Stash changes: git stash',
            'Discard changes: git checkout -- .',
            'Then proceed with original operation',
          ],
          commands: [
            'git stash # Save changes temporarily',
            'git stash pop # Restore stashed changes',
            'git checkout -- . # Discard all changes',
          ],
          prevention: 'Commit changes regularly, use feature branches',
        },
      ],
    },
  };

  const currentCategory =
    troubleshootingCategories[selectedCategory as keyof typeof troubleshootingCategories];

  const filteredIssues = currentCategory.issues.filter(
    (issue) =>
      issue.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.symptoms.some((symptom) => symptom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryColor = (color: string) => {
    const colors = {
      red: 'border-red-200 bg-red-50 text-red-700',
      yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700',
    };
    return colors[color as keyof typeof colors] || colors.red;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Git Troubleshooting Guide</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Comprehensive solutions to common Git problems. Search for your issue or browse by
          category to find step-by-step solutions.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for Git problems, error messages, or symptoms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
        />
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {Object.entries(troubleshootingCategories).map(([key, category]) => {
          const IconComponent = category.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                selectedCategory === key
                  ? getCategoryColor(category.color) + ' ring-2 ring-orange-300'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{category.name}</span>
              <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                {category.issues.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Emergency Actions */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <Zap className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-red-800 mb-2">🚨 Emergency Recovery Commands</h3>
            <p className="text-red-700 mb-3">
              If you're in a panic and need to quickly undo something, try these safe commands
              first:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-red-800 mb-1">Undo Last Commit (Keep Changes):</h4>
                <code className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm block">
                  git reset --soft HEAD~1
                </code>
              </div>
              <div>
                <h4 className="font-bold text-red-800 mb-1">Save Work and Reset:</h4>
                <code className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm block">
                  git stash && git status
                </code>
              </div>
              <div>
                <h4 className="font-bold text-red-800 mb-1">Abort Current Operation:</h4>
                <code className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm block">
                  git merge --abort
                </code>
              </div>
              <div>
                <h4 className="font-bold text-red-800 mb-1">Find Lost Commits:</h4>
                <code className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm block">
                  git reflog --oneline -10
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-6">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No issues found</h3>
            <p className="text-gray-500">Try a different search term or browse other categories.</p>
          </div>
        ) : (
          filteredIssues.map((issue, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                {/* Problem Header */}
                <div className="flex items-start gap-4 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{issue.problem}</h3>
                    <p className="text-gray-600 mb-3">
                      <strong>Cause:</strong> {issue.cause}
                    </p>

                    {/* Symptoms */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">🔍 Symptoms:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {issue.symptoms.map((symptom, idx) => (
                          <li key={idx} className="text-gray-700">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">{symptom}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Solution Steps */}
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-green-900 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Solution Steps:
                    </h4>
                    <ol className="list-decimal list-inside space-y-2">
                      {issue.solution.map((step, idx) => (
                        <li key={idx} className="text-gray-700 text-sm leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Commands */}
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-3">💻 Commands:</h4>
                    <div className="space-y-2">
                      {issue.commands.map((command, idx) => (
                        <div key={idx} className="bg-gray-100 rounded p-3">
                          <code className="text-sm text-gray-800 block">{command}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Prevention */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">🛡️ Prevention:</h4>
                  <p className="text-blue-800 text-sm">{issue.prevention}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Additional Resources */}
      <div className="mt-12 bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Resources</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Diagnostic Commands</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <code className="bg-gray-100 px-1 rounded">git status</code> - Check repository
                state
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">git log --oneline -10</code> - Recent
                commits
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">git reflog</code> - Command history
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">git remote -v</code> - Remote
                repositories
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-2">Safe Recovery</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <code className="bg-gray-100 px-1 rounded">git stash</code> - Save work temporarily
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">git branch backup</code> - Create backup
                branch
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">git checkout -b fix-branch</code> - New
                branch for fixes
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">git reset --soft HEAD~1</code> - Gentle
                undo
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-2">Getting Help</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <code className="bg-gray-100 px-1 rounded">git help &lt;command&gt;</code> - Command
                documentation
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">git &lt;command&gt; --help</code> - Quick
                help
              </li>
              <li>Stack Overflow Git questions</li>
              <li>Git official documentation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Troubleshooting;
