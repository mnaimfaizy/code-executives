import React, { useState } from 'react';
import {
  FolderPlus,
  Plus,
  GitCommit,
  Upload,
  Download,
  Terminal,
  CheckCircle,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import Workflow2D from '../visualizations/2d/Workflow2D';

const CoreWorkflow: React.FC = () => {
  const [activeCommand, setActiveCommand] = useState(0);

  const workflowSteps = [
    {
      id: 'init',
      command: 'git init',
      title: 'Initialize Repository',
      icon: <FolderPlus className="w-6 h-6" />,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      description: 'Creates a new Git repository in the current directory',
      usage: 'git init [project-name]',
      example: 'git init my-project',
      whatHappens: [
        'Creates a .git directory with Git metadata',
        'Initializes an empty repository',
        'Sets up the three-tree architecture',
        'Creates the default branch (usually main/master)',
      ],
    },
    {
      id: 'add',
      command: 'git add',
      title: 'Stage Changes',
      icon: <Plus className="w-6 h-6" />,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      description: 'Moves changes from working directory to staging area',
      usage: 'git add <file>',
      example: 'git add index.html',
      whatHappens: [
        'Copies file content to staging area',
        'Prepares changes for the next commit',
        'Can stage individual files or all changes',
        'Updates the index with new file states',
      ],
    },
    {
      id: 'commit',
      command: 'git commit',
      title: 'Create Commit',
      icon: <GitCommit className="w-6 h-6" />,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      borderColor: 'border-green-300',
      description: 'Saves staged changes to the repository permanently',
      usage: 'git commit -m "message"',
      example: 'git commit -m "Add homepage"',
      whatHappens: [
        'Creates a commit object with staged changes',
        'Generates unique SHA-1 hash for the commit',
        'Links to parent commit (if any)',
        'Stores commit metadata (author, date, message)',
      ],
    },
    {
      id: 'push',
      command: 'git push',
      title: 'Upload Changes',
      icon: <Upload className="w-6 h-6" />,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      description: 'Uploads local commits to a remote repository',
      usage: 'git push <remote> <branch>',
      example: 'git push origin main',
      whatHappens: [
        'Sends commit objects to remote repository',
        'Updates remote branch references',
        'Shares changes with other developers',
        'May require authentication',
      ],
    },
    {
      id: 'pull',
      command: 'git pull',
      title: 'Download Changes',
      icon: <Download className="w-6 h-6" />,
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      borderColor: 'border-red-300',
      description: 'Downloads and merges changes from remote repository',
      usage: 'git pull <remote> <branch>',
      example: 'git pull origin main',
      whatHappens: [
        'Fetches commits from remote repository',
        'Merges remote changes into local branch',
        'Updates working directory with new changes',
        'May create merge commits if necessary',
      ],
    },
  ];

  const practicalScenarios = [
    {
      title: 'Starting a New Project',
      steps: [
        { command: 'mkdir my-project && cd my-project', description: 'Create project directory' },
        { command: 'git init', description: 'Initialize Git repository' },
        { command: 'echo "# My Project" > README.md', description: 'Create first file' },
        { command: 'git add README.md', description: 'Stage the file' },
        { command: 'git commit -m "Initial commit"', description: 'Create first commit' },
      ],
    },
    {
      title: 'Daily Development Workflow',
      steps: [
        { command: 'git pull origin main', description: 'Get latest changes' },
        { command: '# Edit files...', description: 'Make your changes' },
        { command: 'git add .', description: 'Stage all changes' },
        { command: 'git commit -m "Add feature X"', description: 'Commit changes' },
        { command: 'git push origin main', description: 'Share changes' },
      ],
    },
  ];

  const activeStep = workflowSteps[activeCommand];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Core Git Workflow</h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-6">
          Master the five essential Git commands that form the foundation of version control. These
          commands represent the basic cycle of Git development: initialize, stage, commit, and
          synchronize with remote repositories.
        </p>
      </div>

      {/* Command Overview */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 mb-12 border border-orange-200">
        <div className="flex items-center mb-6">
          <div className="bg-orange-500 rounded-full p-3 mr-4">
            <Terminal className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Essential Commands</h2>
            <p className="text-gray-600">Click on each command to explore its usage and effects</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          {workflowSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveCommand(index)}
              className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                activeCommand === index
                  ? `${step.borderColor} ${step.lightColor} shadow-lg transform scale-105`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${step.color} text-white`}
              >
                {step.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{step.title}</h3>
              <code className="text-xs text-gray-600 font-mono">{step.command}</code>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Workflow Visualization */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Workflow Visualization</h2>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <Workflow2D activeCommand={activeCommand} onCommandChange={setActiveCommand} />
        </div>
      </div>

      {/* Command Details */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div className={`${activeStep.lightColor} rounded-xl p-8 border ${activeStep.borderColor}`}>
          <div className="flex items-center mb-6">
            <div className={`${activeStep.color} rounded-full p-3 mr-4 text-white`}>
              {activeStep.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{activeStep.title}</h3>
              <code className="text-lg text-gray-700 font-mono">{activeStep.command}</code>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{activeStep.description}</p>

          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Usage</h4>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                {activeStep.usage}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Example</h4>
              <div className="bg-gray-100 p-3 rounded-lg">
                <code className="text-sm text-gray-800 font-mono">{activeStep.example}</code>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">
            What Happens When You Run This Command
          </h3>

          {activeStep.whatHappens.map((item, index) => (
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

      {/* Practical Scenarios */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Practical Scenarios</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {practicalScenarios.map((scenario, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <GitBranch className="w-6 h-6 text-orange-500 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">{scenario.title}</h3>
              </div>

              <div className="space-y-4">
                {scenario.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="border-l-4 border-orange-200 pl-4">
                    <div className="bg-gray-50 rounded p-3 mb-2">
                      <code className="text-sm text-gray-800 font-mono">{step.command}</code>
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {stepIndex < scenario.steps.length - 1 && (
                      <div className="flex justify-center my-2">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Practices</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-orange-500 rounded-full p-2 mr-4 mt-1">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Commit Often</h3>
                <p className="text-gray-700">
                  Make small, focused commits frequently. This makes it easier to track changes,
                  debug issues, and collaborate with others.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-orange-500 rounded-full p-2 mr-4 mt-1">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Write Clear Messages</h3>
                <p className="text-gray-700">
                  Use descriptive commit messages that explain what and why, not just what. Follow
                  the convention: "Verb + what you did".
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-orange-500 rounded-full p-2 mr-4 mt-1">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pull Before Push</h3>
                <p className="text-gray-700">
                  Always pull the latest changes before pushing to avoid conflicts and ensure your
                  changes integrate smoothly.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-orange-500 rounded-full p-2 mr-4 mt-1">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Review Before Staging</h3>
                <p className="text-gray-700">
                  Use git status and git diff to review changes before staging. Only commit code
                  that you've reviewed and tested.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreWorkflow;
