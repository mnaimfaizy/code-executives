import React, { useState } from 'react';
import { GitBranch, Eye, Play, RotateCcw, Download, BookOpen, Zap } from 'lucide-react';
import GitArchitecture2D from '../../components/models2d/git/GitArchitecture2D';
import ThreeTree2D from '../../components/models2d/git/ThreeTree2D';
import ObjectModel2D from '../../components/models2d/git/ObjectModel2D';
import Workflow2D from '../../components/models2d/git/Workflow2D';
import Branching2D from '../../components/models2d/git/Branching2D';
import Collaboration2D from '../../components/models2d/git/Collaboration2D';
import History2D from '../../components/models2d/git/History2D';

const Visualization: React.FC = () => {
  const [selectedVisualization, setSelectedVisualization] = useState('architecture');

  const visualizations = {
    architecture: {
      name: 'Git Architecture',
      description: 'Core components and their relationships',
      component: GitArchitecture2D,
      color: 'blue',
    },
    threetree: {
      name: 'Three Tree Model',
      description: 'Working Directory, Staging Area, Repository',
      component: ThreeTree2D,
      color: 'green',
    },
    objects: {
      name: 'Object Model',
      description: 'Commits, trees, and blobs visualization',
      component: ObjectModel2D,
      color: 'purple',
    },
    workflow: {
      name: 'Core Workflow',
      description: 'Add, commit, push cycle demonstration',
      component: Workflow2D,
      color: 'orange',
    },
    branching: {
      name: 'Branching & Merging',
      description: 'Branch operations and merge strategies',
      component: Branching2D,
      color: 'red',
    },
    collaboration: {
      name: 'Team Collaboration',
      description: 'Multi-developer workflow patterns',
      component: Collaboration2D,
      color: 'indigo',
    },
    history: {
      name: 'History Management',
      description: 'Rebase, reset, and history manipulation',
      component: History2D,
      color: 'yellow',
    },
  };

  const getCurrentVisualization = () => {
    return visualizations[selectedVisualization as keyof typeof visualizations];
  };

  const getColorClasses = (color: string, isSelected: boolean = false) => {
    const colors = {
      blue: isSelected
        ? 'bg-blue-100 border-blue-500 text-blue-700'
        : 'hover:bg-blue-50 border-blue-200',
      green: isSelected
        ? 'bg-green-100 border-green-500 text-green-700'
        : 'hover:bg-green-50 border-green-200',
      purple: isSelected
        ? 'bg-purple-100 border-purple-500 text-purple-700'
        : 'hover:bg-purple-50 border-purple-200',
      orange: isSelected
        ? 'bg-orange-100 border-orange-500 text-orange-700'
        : 'hover:bg-orange-50 border-orange-200',
      red: isSelected ? 'bg-red-100 border-red-500 text-red-700' : 'hover:bg-red-50 border-red-200',
      indigo: isSelected
        ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
        : 'hover:bg-indigo-50 border-indigo-200',
      yellow: isSelected
        ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
        : 'hover:bg-yellow-50 border-yellow-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const currentViz = getCurrentVisualization();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Git Visualization Playground</h2>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          Interactive visualizations to help you understand Git concepts. Select different views to
          explore how Git works internally and how various operations affect your repository.
        </p>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <Eye className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Visual Learning</h3>
          <p className="text-gray-600 text-sm">
            See Git concepts in action with animated, interactive diagrams that make complex
            operations clear and understandable.
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <Play className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Interactive Demos</h3>
          <p className="text-gray-600 text-sm">
            Click through step-by-step demos of Git operations to understand how commands affect
            your repository state.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <Zap className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Real-time Updates</h3>
          <p className="text-gray-600 text-sm">
            Watch how Git's internal state changes in real-time as you perform operations, building
            intuitive understanding.
          </p>
        </div>
      </div>

      {/* Visualization Selector */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Choose a Visualization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(visualizations).map(([key, viz]) => (
            <button
              key={key}
              onClick={() => setSelectedVisualization(key)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedVisualization === key
                  ? getColorClasses(viz.color, true)
                  : `bg-white border-gray-200 ${getColorClasses(viz.color, false)}`
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <GitBranch className="w-5 h-5" />
                <h4 className="font-bold text-sm">{viz.name}</h4>
              </div>
              <p className="text-xs opacity-80">{viz.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Current Visualization */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{currentViz.name}</h3>
            <p className="text-gray-600">{currentViz.description}</p>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Reset</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">Guide</span>
            </button>
          </div>
        </div>

        {/* Visualization Component */}
        <div className="bg-gray-50 rounded-xl p-6 min-h-[400px]">
          {selectedVisualization === 'architecture' && (
            <GitArchitecture2D activeDemo={0} onAnimationStateChange={() => {}} />
          )}
          {selectedVisualization === 'threetree' && (
            <ThreeTree2D activeStep={0} onStepChange={() => {}} />
          )}
          {selectedVisualization === 'objects' && (
            <ObjectModel2D selectedObject="commit" onObjectSelect={() => {}} />
          )}
          {selectedVisualization === 'workflow' && (
            <Workflow2D activeCommand={0} onCommandChange={() => {}} />
          )}
          {selectedVisualization === 'branching' && (
            <Branching2D
              activeOperation="merge"
              activeStrategy="merge"
              onOperationChange={() => {}}
              onStrategyChange={() => {}}
            />
          )}
          {selectedVisualization === 'collaboration' && (
            <Collaboration2D activeWorkflow="gitflow" onWorkflowChange={() => {}} />
          )}
          {selectedVisualization === 'history' && (
            <History2D activeOperation="rebase" onOperationChange={() => {}} showAdvanced={false} />
          )}
        </div>

        {/* Controls and Info */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-bold text-gray-900 mb-3">How to Use This Visualization</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Click on elements to see detailed information</li>
              <li>• Use the step controls to advance through operations</li>
              <li>• Hover over components to see their relationships</li>
              <li>• Reset at any time to start over</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-bold text-gray-900 mb-3">Learning Objectives</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {selectedVisualization === 'architecture' && (
                <>
                  <div>• Understand Git's core components</div>
                  <div>• Learn how data flows between areas</div>
                  <div>• See the relationship between commands and state</div>
                </>
              )}
              {selectedVisualization === 'threetree' && (
                <>
                  <div>• Master the three-tree architecture</div>
                  <div>• Understand staging area concept</div>
                  <div>• Learn how commits capture snapshots</div>
                </>
              )}
              {selectedVisualization === 'objects' && (
                <>
                  <div>• Explore Git's object database</div>
                  <div>• Understand commit, tree, and blob objects</div>
                  <div>• See how objects reference each other</div>
                </>
              )}
              {selectedVisualization === 'workflow' && (
                <>
                  <div>• Practice the basic Git workflow</div>
                  <div>• Understand add, commit, push sequence</div>
                  <div>• Learn about working directory states</div>
                </>
              )}
              {selectedVisualization === 'branching' && (
                <>
                  <div>• Master branch creation and switching</div>
                  <div>• Understand merge vs rebase</div>
                  <div>• Learn conflict resolution strategies</div>
                </>
              )}
              {selectedVisualization === 'collaboration' && (
                <>
                  <div>• Understand remote repository concepts</div>
                  <div>• Learn team workflow patterns</div>
                  <div>• Practice pull request workflows</div>
                </>
              )}
              {selectedVisualization === 'history' && (
                <>
                  <div>• Master history manipulation commands</div>
                  <div>• Understand rebase vs merge</div>
                  <div>• Learn safe history rewriting practices</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 p-6">
        <div className="flex items-start gap-4">
          <Download className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Practice What You've Learned</h3>
            <p className="text-gray-700 mb-4">
              Ready to apply these concepts? Here are some recommended next steps to reinforce your
              understanding:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Beginner Practice</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Create a practice repository</li>
                  <li>• Make commits and explore the object model</li>
                  <li>• Practice basic branching and merging</li>
                  <li>• Experiment with the staging area</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Advanced Practice</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Practice interactive rebasing</li>
                  <li>• Experiment with different merge strategies</li>
                  <li>• Try collaborative workflows with remotes</li>
                  <li>• Practice conflict resolution scenarios</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualization;
