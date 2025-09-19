import React, { useState } from 'react';
import { FileText, GitBranch, Database, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';
import ThreeTree2D from '../../components/models2d/git/ThreeTree2D';

const ThreeTreeModel: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    {
      id: 'working',
      title: 'Working Directory',
      description: 'Files as they exist on your filesystem',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'staging',
      title: 'Staging Area (Index)',
      description: 'Snapshot of changes ready to commit',
      icon: <GitBranch className="w-6 h-6" />,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'repository',
      title: 'Repository (.git)',
      description: 'Permanent storage of committed snapshots',
      icon: <Database className="w-6 h-6" />,
      color: 'bg-green-100 text-green-800',
    },
  ];

  const commands = [
    {
      command: 'git add',
      description: 'Moves changes from Working Directory → Staging Area',
      example: 'git add filename.txt',
    },
    {
      command: 'git commit',
      description: 'Moves staged changes from Staging Area → Repository',
      example: 'git commit -m "Add new feature"',
    },
    {
      command: 'git reset',
      description: 'Moves changes backward through the trees',
      example: 'git reset HEAD filename.txt',
    },
    {
      command: 'git checkout',
      description: 'Updates Working Directory from Repository',
      example: 'git checkout -- filename.txt',
    },
  ];

  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/git?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  return (
    <section className="mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-2xl p-8 mb-8 border border-orange-200 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-orange-100 p-4 rounded-full">
              <Database className="w-16 h-16 text-orange-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Git's Three-Tree Model</h1>
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            Understanding Git's three-tree architecture is the foundation of mastering version
            control. Git manages your code through three distinct areas, each serving a specific
            purpose in the workflow from editing to permanent storage.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
              📁 Working Directory
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
              📋 Staging Area
            </span>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
              💾 Repository
            </span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
              🔄 Git Commands
            </span>
          </div>
        </div>
      </div>

      {/* Core Concept Overview */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 mb-12 border border-orange-200">
        <div className="flex items-center mb-6">
          <div className="bg-orange-500 rounded-full p-3 mr-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">The Three Trees</h2>
            <p className="text-gray-600">
              Git's fundamental architecture for managing code changes
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {workflowSteps.map((step, index) => (
            <div
              key={step.id}
              className={`p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                activeStep === index
                  ? 'border-orange-300 bg-white shadow-lg transform scale-105'
                  : 'border-gray-200 bg-white/50 hover:border-orange-200'
              }`}
              onClick={() => setActiveStep(index)}
            >
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${step.color}`}
              >
                {step.icon}
                <span className="ml-2">{step.title}</span>
              </div>
              <p className="text-gray-700 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Visualization */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Interactive Three-Tree Flow</h2>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <ThreeTree2D activeStep={activeStep} onStepChange={setActiveStep} />
        </div>
      </div>

      {/* Detailed Explanations */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Understanding Each Tree</h2>

          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-blue-900">Working Directory</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Your project files as they exist on your filesystem. This is where you make actual
              changes to your code - editing, creating, and deleting files.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                Contains your actual project files
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                Where you edit and modify code
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                Files can be tracked, untracked, or ignored
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
            <div className="flex items-center mb-4">
              <GitBranch className="w-6 h-6 text-yellow-600 mr-3" />
              <h3 className="text-xl font-bold text-yellow-900">Staging Area (Index)</h3>
            </div>
            <p className="text-gray-700 mb-4">
              A middle ground between your working directory and repository. It holds a snapshot of
              changes that will be included in your next commit.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-yellow-500 mr-2" />
                Prepares changes for commit
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-yellow-500 mr-2" />
                Allows selective staging of changes
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-yellow-500 mr-2" />
                Binary file stored in .git/index
              </li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-green-900">Repository (.git)</h3>
            </div>
            <p className="text-gray-700 mb-4">
              The permanent storage of your project's history. Contains all committed snapshots,
              branches, tags, and metadata about your project.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Permanent storage of commits
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Contains full project history
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Cryptographically secure with SHA-1
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Essential Commands</h2>

          {commands.map((cmd, index) => (
            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-3">
                <code className="bg-gray-900 text-orange-400 px-3 py-1 rounded text-sm font-mono">
                  {cmd.command}
                </code>
                <ArrowRight className="w-4 h-4 text-gray-400 mx-3" />
              </div>
              <p className="text-gray-700 mb-3">{cmd.description}</p>
              <div className="bg-gray-50 rounded p-3">
                <code className="text-sm text-gray-800 font-mono">{cmd.example}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Insights</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <div className="bg-orange-500 rounded-full p-2 mr-4 mt-1">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">State Management</h3>
              <p className="text-gray-700">
                Git commands move data between these three trees. Understanding this flow helps you
                predict what each command will do and recover from mistakes.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-orange-500 rounded-full p-2 mr-4 mt-1">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Selective Staging</h3>
              <p className="text-gray-700">
                The staging area allows you to craft commits precisely, including only the changes
                you want while leaving other modifications for later commits.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps Navigation */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Continue Your Git Journey</h2>
        <p className="text-xl text-gray-700 mb-6">
          Now that you understand the three-tree model, explore how Git objects work together to
          create this powerful architecture.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigateToSection('Object Model')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center mb-2">
              <Database className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                Object Model
              </h3>
            </div>
            <p className="text-sm text-gray-600">Learn about blobs, trees, commits, and tags</p>
          </button>

          <button
            onClick={() => navigateToSection('Core Workflow')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center mb-2">
              <GitBranch className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                Core Workflow
              </h3>
            </div>
            <p className="text-sm text-gray-600">Master essential Git commands and operations</p>
          </button>

          <button
            onClick={() => navigateToSection('Branching & Merging')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center mb-2">
              <ArrowRight className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                Branching & Merging
              </h3>
            </div>
            <p className="text-sm text-gray-600">Explore parallel development workflows</p>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ThreeTreeModel;
