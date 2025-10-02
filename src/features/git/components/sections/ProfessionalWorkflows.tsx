import React, { useState } from 'react';
import {
  GitBranch,
  GitPullRequest,
  Users,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Settings,
} from 'lucide-react';
import Collaboration2D from '../visualizations/2d/Collaboration2D';

const ProfessionalWorkflows: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<string>('gitflow');

  const workflows = [
    {
      id: 'gitflow',
      name: 'Git Flow',
      icon: <GitBranch className="w-6 h-6" />,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      description: 'Structured branching model for releases',
      bestFor: 'Large teams, scheduled releases, enterprise projects',
      branches: ['master', 'develop', 'feature/*', 'release/*', 'hotfix/*'],
      pros: [
        'Clear separation of concerns',
        'Supports parallel development',
        'Good for scheduled releases',
        'Well-documented process',
      ],
      cons: [
        'Complex for small teams',
        'Can slow down development',
        'Requires discipline',
        'Many long-lived branches',
      ],
      workflow: [
        'Create feature branch from develop',
        'Work on feature and commit',
        'Merge feature back to develop',
        'Create release branch when ready',
        'Test and fix on release branch',
        'Merge release to master and develop',
        'Tag release on master',
        'Create hotfix from master if needed',
      ],
    },
    {
      id: 'github',
      name: 'GitHub Flow',
      icon: <GitPullRequest className="w-6 h-6" />,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      borderColor: 'border-green-300',
      description: 'Simple flow with pull requests',
      bestFor: 'Continuous deployment, web applications, small to medium teams',
      branches: ['main', 'feature branches'],
      pros: [
        'Simple and lightweight',
        'Fast deployment cycle',
        'Easy to understand',
        'Great for continuous deployment',
      ],
      cons: [
        'Less suitable for releases',
        'Requires good CI/CD',
        'Main branch must be stable',
        'Limited release management',
      ],
      workflow: [
        'Create feature branch from main',
        'Work on feature and commit',
        'Open pull request',
        'Code review and discussion',
        'Merge to main after approval',
        'Deploy main branch',
        'Delete feature branch',
      ],
    },
    {
      id: 'gitlab',
      name: 'GitLab Flow',
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      description: 'Environment-based branching',
      bestFor: 'Multi-environment deployments, staged releases',
      branches: ['master', 'staging', 'production', 'feature/*'],
      pros: [
        'Environment-specific branches',
        'Clear deployment pipeline',
        'Good for staged releases',
        'Combines benefits of other flows',
      ],
      cons: [
        'More complex than GitHub Flow',
        'Requires multiple environments',
        'Can have merge conflicts',
        'Needs good CI/CD setup',
      ],
      workflow: [
        'Create feature branch from master',
        'Work and commit on feature',
        'Merge to master via MR',
        'Deploy master to staging',
        'Test on staging environment',
        'Merge master to production',
        'Deploy production branch',
      ],
    },
  ];

  const collaborationPatterns = [
    {
      title: 'Fork and Pull Request',
      description: 'External contributors fork repository and submit pull requests',
      icon: <Users className="w-6 h-6 text-blue-500" />,
      steps: [
        'Fork the repository',
        'Clone your fork locally',
        'Create feature branch',
        'Make changes and commit',
        'Push to your fork',
        'Create pull request to original repo',
      ],
      bestFor: 'Open source projects, external contributors',
    },
    {
      title: 'Feature Branch Workflow',
      description: 'Team members create feature branches in shared repository',
      icon: <GitBranch className="w-6 h-6 text-green-500" />,
      steps: [
        'Pull latest changes from main',
        'Create feature branch',
        'Work on feature locally',
        'Push feature branch to origin',
        'Create pull request',
        'Review, approve, and merge',
      ],
      bestFor: 'Internal teams, private repositories',
    },
    {
      title: 'Centralized Workflow',
      description: 'Everyone commits directly to main branch',
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      steps: [
        'Pull latest changes',
        'Make changes locally',
        'Commit changes',
        'Push to main branch',
        'Resolve conflicts if any',
      ],
      bestFor: 'Small teams, simple projects, prototypes',
    },
  ];

  const codeReviewBestPractices = [
    {
      title: 'Keep PRs Small',
      description: 'Smaller pull requests are easier to review and less likely to have issues',
      tip: 'Aim for 200-400 lines of code per PR',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      title: 'Write Clear Descriptions',
      description: "Explain what the PR does, why it's needed, and how to test it",
      tip: 'Use PR templates to ensure consistency',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      title: 'Review Code, Not People',
      description: 'Focus on the code and provide constructive feedback',
      tip: 'Use "we" instead of "you" in comments',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      title: 'Test Before Approving',
      description: "Actually test the changes, don't just read the code",
      tip: 'Check out the branch locally if needed',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
  ];

  const activeWorkflowData = workflows.find((w) => w.id === activeWorkflow) || workflows[0];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Professional Git Workflows</h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-6">
          Professional development requires structured workflows that enable teams to collaborate
          effectively, maintain code quality, and deliver reliable software. Explore the most
          popular Git workflows used by successful development teams.
        </p>
      </div>

      {/* Workflow Selection */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 mb-12 border border-orange-200">
        <div className="flex items-center mb-6">
          <div className="bg-orange-500 rounded-full p-3 mr-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Popular Workflows</h2>
            <p className="text-gray-600">Choose a workflow to explore its structure and benefits</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <button
              key={workflow.id}
              onClick={() => setActiveWorkflow(workflow.id)}
              className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                activeWorkflow === workflow.id
                  ? `${workflow.borderColor} ${workflow.lightColor} shadow-lg transform scale-105`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${workflow.color} text-white`}
              >
                {workflow.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{workflow.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
              <p className="text-xs text-gray-500">Best for: {workflow.bestFor}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Workflow Visualization */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Workflow Visualization</h2>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <Collaboration2D activeWorkflow={activeWorkflow} onWorkflowChange={setActiveWorkflow} />
        </div>
      </div>

      {/* Workflow Details */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div
          className={`${activeWorkflowData.lightColor} rounded-xl p-8 border ${activeWorkflowData.borderColor}`}
        >
          <div className="flex items-center mb-6">
            <div className={`${activeWorkflowData.color} rounded-full p-3 mr-4 text-white`}>
              {activeWorkflowData.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{activeWorkflowData.name}</h3>
              <p className="text-gray-600">{activeWorkflowData.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Branch Structure</h4>
              <div className="space-y-2">
                {activeWorkflowData.branches.map((branch, index) => (
                  <div key={index} className="flex items-center">
                    <GitBranch className="w-4 h-4 text-gray-500 mr-2" />
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {branch}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Best For</h4>
              <p className="text-gray-700">{activeWorkflowData.bestFor}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Workflow Steps</h3>
            <div className="space-y-3">
              {activeWorkflowData.workflow.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                >
                  <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-4 mt-1">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pros and Cons */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-green-50 rounded-xl p-8 border border-green-200">
          <h3 className="text-2xl font-bold text-green-900 mb-6">Advantages</h3>
          <ul className="space-y-3">
            {activeWorkflowData.pros.map((pro, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-green-800">{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 rounded-xl p-8 border border-red-200">
          <h3 className="text-2xl font-bold text-red-900 mb-6">Considerations</h3>
          <ul className="space-y-3">
            {activeWorkflowData.cons.map((con, index) => (
              <li key={index} className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <span className="text-red-800">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Collaboration Patterns */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Team Collaboration Patterns</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {collaborationPatterns.map((pattern, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                {pattern.icon}
                <h3 className="text-xl font-bold text-gray-900 ml-3">{pattern.title}</h3>
              </div>

              <p className="text-gray-700 mb-4">{pattern.description}</p>

              <div className="space-y-2 mb-4">
                {pattern.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                    {step}
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-600">
                  <strong>Best for:</strong> {pattern.bestFor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Review Best Practices */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Code Review Best Practices</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {codeReviewBestPractices.map((practice, index) => (
            <div
              key={index}
              className="flex items-start bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
            >
              <div className="mr-4 mt-1">{practice.icon}</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{practice.title}</h3>
                <p className="text-gray-700 mb-3">{practice.description}</p>
                <div className="bg-blue-50 rounded p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> {practice.tip}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Tips */}
        <div className="mt-8 bg-orange-50 rounded-lg p-6 border border-orange-200">
          <h3 className="text-xl font-bold text-orange-900 mb-4">Quick Review Checklist</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li className="flex items-center text-orange-800">
                <ArrowRight className="w-4 h-4 mr-2" />
                Does the code solve the problem?
              </li>
              <li className="flex items-center text-orange-800">
                <ArrowRight className="w-4 h-4 mr-2" />
                Is the code readable and maintainable?
              </li>
              <li className="flex items-center text-orange-800">
                <ArrowRight className="w-4 h-4 mr-2" />
                Are there adequate tests?
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-center text-orange-800">
                <ArrowRight className="w-4 h-4 mr-2" />
                Does it follow coding standards?
              </li>
              <li className="flex items-center text-orange-800">
                <ArrowRight className="w-4 h-4 mr-2" />
                Are there any security concerns?
              </li>
              <li className="flex items-center text-orange-800">
                <ArrowRight className="w-4 h-4 mr-2" />
                Is the documentation updated?
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalWorkflows;
