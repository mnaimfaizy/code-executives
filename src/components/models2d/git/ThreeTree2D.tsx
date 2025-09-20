import React, { useState, useEffect } from 'react';
import { FileText, GitBranch, Database, Play, RotateCcw } from 'lucide-react';
import { getSectionTheme } from '../../../utils/theme';

interface ThreeTree2DProps {
  activeStep: number;
  onStepChange: (step: number) => void;
}

const ThreeTree2D: React.FC<ThreeTree2DProps> = ({ activeStep, onStepChange }) => {
  const theme = getSectionTheme('git');
  const [animationStep, setAnimationStep] = useState(activeStep);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fileStates, setFileStates] = useState({
    working: ['index.html', 'style.css', 'script.js'],
    staging: [] as string[],
    repository: [] as string[],
  });

  const trees = [
    {
      id: 'working',
      title: 'Working Directory',
      icon: <FileText className="w-8 h-8" />,
      color: `bg-[${theme.primary}]`,
      lightColor: `bg-[${theme.primary}10]`,
      borderColor: `border-[${theme.border}]`,
      description: 'Your local files that you edit',
    },
    {
      id: 'staging',
      title: 'Staging Area',
      icon: <GitBranch className="w-8 h-8" />,
      color: `bg-[${theme.secondary}]`,
      lightColor: `bg-[${theme.secondary}10]`,
      borderColor: `border-[${theme.border}]`,
      description: 'Files prepared for next commit',
    },
    {
      id: 'repository',
      title: 'Repository',
      icon: <Database className="w-8 h-8" />,
      color: `bg-[${theme.accent}]`,
      lightColor: `bg-[${theme.accent}10]`,
      borderColor: `border-[${theme.border}]`,
      description: 'Committed versions of files',
    },
  ];

  const operations = [
    {
      command: 'git add',
      description: 'Stage files for commit',
      fullDescription: 'Moves modified files from Working Directory to Staging Area',
    },
    {
      command: 'git commit',
      description: 'Save changes to repository',
      fullDescription: 'Creates a permanent snapshot from Staging Area in Repository',
    },
    {
      command: 'git reset',
      description: 'Unstage files',
      fullDescription: 'Moves files back from Staging Area to Working Directory',
    },
  ];

  const startAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(0);
    onStepChange(0);

    // Reset file states to initial
    setFileStates({
      working: ['index.html', 'style.css', 'script.js'],
      staging: [],
      repository: [],
    });

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;

      if (currentStep === 1) {
        // Step 1: git add - move files to staging
        setFileStates((prev) => ({
          ...prev,
          staging: ['index.html', 'style.css'],
        }));
        setAnimationStep(1);
        onStepChange(1);
      } else if (currentStep === 2) {
        // Step 2: git commit - move files to repository
        setFileStates((prev) => ({
          ...prev,
          repository: ['index.html', 'style.css'],
        }));
        setAnimationStep(2);
        onStepChange(2);
      } else if (currentStep >= 3) {
        // Animation complete
        setIsAnimating(false);
        clearInterval(interval);
      }
    }, 2000);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setAnimationStep(0);
    onStepChange(0);
    setFileStates({
      working: ['index.html', 'style.css', 'script.js'],
      staging: [],
      repository: [],
    });
  };

  const handleStepClick = (step: number) => {
    if (isAnimating) return;

    setAnimationStep(step);
    onStepChange(step);

    // Update file states based on step
    if (step === 0) {
      setFileStates({
        working: ['index.html', 'style.css', 'script.js'],
        staging: [],
        repository: [],
      });
    } else if (step === 1) {
      setFileStates({
        working: ['index.html', 'style.css', 'script.js'],
        staging: ['index.html', 'style.css'],
        repository: [],
      });
    } else if (step === 2) {
      setFileStates({
        working: ['index.html', 'style.css', 'script.js'],
        staging: ['index.html', 'style.css'],
        repository: ['index.html', 'style.css'],
      });
    }
  };

  useEffect(() => {
    setAnimationStep(activeStep);
  }, [activeStep]);

  const getFilesForTree = (treeId: string): string[] => {
    switch (treeId) {
      case 'working':
        return fileStates.working;
      case 'staging':
        return fileStates.staging;
      case 'repository':
        return fileStates.repository;
      default:
        return [];
    }
  };

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={startAnimation}
          disabled={isAnimating}
          className={`flex items-center gap-2 px-4 py-2 bg-[${theme.primary}] text-white rounded-lg hover:bg-[${theme.secondary}] disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        >
          <Play className="w-4 h-4" />
          Start Animation
        </button>
        <button
          onClick={resetAnimation}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Three Trees Visualization */}
      <div className="relative">
        <svg
          viewBox="0 0 800 400"
          className="w-full h-80 border border-gray-200 rounded-lg bg-gray-50"
        >
          {/* Tree Containers */}
          {trees.map((tree, index) => {
            const x = 100 + index * 250;
            const y = 50;
            const isActive = activeStep === index;
            const isAnimating = animationStep === index;

            return (
              <g key={tree.id}>
                {/* Tree Container */}
                <rect
                  x={x - 50}
                  y={y}
                  width={180}
                  height={250}
                  className={`${tree.lightColor} ${tree.borderColor} ${
                    isActive ? 'stroke-2 opacity-100' : 'stroke-1 opacity-70'
                  } transition-all duration-300`}
                  rx="12"
                  stroke="currentColor"
                  fill="currentColor"
                />

                {/* Tree Header */}
                <circle
                  cx={x + 40}
                  cy={y + 30}
                  r="20"
                  className={`${tree.color} ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-300`}
                  fill="currentColor"
                />

                {/* Tree Title */}
                <text
                  x={x + 40}
                  y={y + 60}
                  textAnchor="middle"
                  className="text-sm font-bold fill-gray-800"
                >
                  {tree.title}
                </text>

                {/* Files */}
                {getFilesForTree(tree.id).map((file, fileIndex) => {
                  const fileY = y + 90 + fileIndex * 35;
                  const shouldHighlight =
                    isAnimating &&
                    ((animationStep === 1 && index <= 1) || (animationStep === 2 && index >= 1));

                  return (
                    <g key={`${tree.id}-${file}`}>
                      <rect
                        x={x - 30}
                        y={fileY - 10}
                        width={140}
                        height={25}
                        className={`${
                          shouldHighlight
                            ? 'fill-orange-200 stroke-orange-400'
                            : 'fill-white stroke-gray-300'
                        } transition-all duration-500`}
                        rx="4"
                        stroke="currentColor"
                      />
                      <text
                        x={x + 40}
                        y={fileY + 5}
                        textAnchor="middle"
                        className="text-xs fill-gray-700"
                      >
                        {file}
                      </text>
                    </g>
                  );
                })}

                {/* Animation Arrows */}
                {index < 2 && (
                  <g>
                    <defs>
                      <marker
                        id={`arrowhead-${index}`}
                        markerWidth="10"
                        markerHeight="7"
                        refX="10"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          className={`${
                            animationStep === index ? `fill-[${theme.primary}]` : 'fill-gray-400'
                          } transition-colors duration-300`}
                        />
                      </marker>
                    </defs>

                    <line
                      x1={x + 130}
                      y1={y + 125}
                      x2={x + 170}
                      y2={y + 125}
                      className={`${
                        animationStep === index
                          ? `stroke-[${theme.primary}] stroke-2`
                          : 'stroke-gray-400 stroke-1'
                      } transition-all duration-300`}
                      markerEnd={`url(#arrowhead-${index})`}
                    />

                    {/* Command Label */}
                    <rect
                      x={x + 135}
                      y={y + 105}
                      width={80}
                      height={20}
                      className={`${
                        animationStep === index
                          ? `fill-[${theme.primary}10] stroke-[${theme.primary}]`
                          : 'fill-gray-100 stroke-gray-300'
                      } transition-all duration-300`}
                      rx="4"
                      stroke="currentColor"
                    />
                    <text
                      x={x + 175}
                      y={y + 118}
                      textAnchor="middle"
                      className={`text-xs font-mono ${
                        animationStep === index ? `fill-[${theme.primary}]` : 'fill-gray-600'
                      } transition-colors duration-300`}
                    >
                      {operations[index]?.command}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Operation Descriptions */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {operations.map((op, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              animationStep === index
                ? `border-[${theme.primary}] bg-[${theme.primary}10] shadow-lg`
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <code
                className={`bg-gray-900 text-[${theme.primary}] px-2 py-1 rounded text-xs font-mono`}
              >
                {op.command}
              </code>
            </div>
            <p className="text-sm text-gray-600">{op.description}</p>
          </div>
        ))}
      </div>

      {/* Interactive Step Controls */}
      <div className="mt-6">
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((step) => (
            <button
              key={step}
              onClick={() => handleStepClick(step)}
              disabled={isAnimating}
              className={`w-3 h-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
                animationStep === step
                  ? `bg-[${theme.primary}] scale-125`
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={`Step ${step + 1}`}
            />
          ))}
        </div>
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600">
            {animationStep === 0 && 'Initial state: Files in working directory'}
            {animationStep === 1 && 'After git add: Files staged for commit'}
            {animationStep === 2 && 'After git commit: Files saved in repository'}
          </p>
        </div>
      </div>

      {/* Current Tree Description */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">
          {trees[Math.min(animationStep, trees.length - 1)]?.title}
        </h4>
        <p className="text-sm text-gray-600">
          {trees[Math.min(animationStep, trees.length - 1)]?.description}
        </p>
      </div>
    </div>
  );
};

export default ThreeTree2D;
