import React, { useState, useEffect } from 'react';
import {
  FolderPlus,
  Plus,
  GitCommit,
  Upload,
  Download,
  Play,
  RotateCcw,
  Server,
} from 'lucide-react';

interface Workflow2DProps {
  activeCommand: number;
  onCommandChange: (command: number) => void;
}

const Workflow2D: React.FC<Workflow2DProps> = ({ activeCommand, onCommandChange }) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const commands = [
    {
      id: 'init',
      title: 'git init',
      icon: <FolderPlus className="w-6 h-6" />,
      color: '#9333ea',
      description: 'Initialize repository',
      longDescription:
        'Creates a new Git repository in the current directory. This sets up the .git folder with all necessary Git metadata and configuration files.',
      affected: ['working', 'staging', 'local'],
    },
    {
      id: 'add',
      title: 'git add',
      icon: <Plus className="w-6 h-6" />,
      color: '#3b82f6',
      description: 'Stage changes',
      longDescription:
        'Moves modified files from the Working Directory to the Staging Area. This prepares changes for the next commit.',
      affected: ['working', 'staging'],
    },
    {
      id: 'commit',
      title: 'git commit',
      icon: <GitCommit className="w-6 h-6" />,
      color: '#22c55e',
      description: 'Create commit',
      longDescription:
        'Creates a permanent snapshot of staged changes in the Local Repository. Each commit has a unique hash and stores project state.',
      affected: ['staging', 'local'],
    },
    {
      id: 'push',
      title: 'git push',
      icon: <Upload className="w-6 h-6" />,
      color: '#f97316',
      description: 'Upload to remote',
      longDescription:
        'Sends local commits to the Remote Repository. This shares your changes with other team members and backs up your work.',
      affected: ['local', 'remote'],
    },
    {
      id: 'pull',
      title: 'git pull',
      icon: <Download className="w-6 h-6" />,
      color: '#ef4444',
      description: 'Download from remote',
      longDescription:
        'Fetches and merges changes from the Remote Repository to your Local Repository. This synchronizes your copy with the latest changes.',
      affected: ['remote', 'local'],
    },
  ];

  const areas = [
    { id: 'working', title: 'Working Directory', x: 50, y: 150, color: '#3b82f6' },
    { id: 'staging', title: 'Staging Area', x: 250, y: 150, color: '#eab308' },
    { id: 'local', title: 'Local Repository', x: 450, y: 150, color: '#22c55e' },
    { id: 'remote', title: 'Remote Repository', x: 650, y: 150, color: '#ef4444' },
  ];

  const startAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(0);

    const interval = setInterval(() => {
      setAnimationStep((prev) => {
        if (prev >= 4) {
          setIsAnimating(false);
          clearInterval(interval);
          return 0;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setAnimationStep(0);
  };

  useEffect(() => {
    onCommandChange(animationStep);
  }, [animationStep, onCommandChange]);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={startAnimation}
          disabled={isAnimating}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          Start Workflow
        </button>
        <button
          onClick={resetAnimation}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Workflow Visualization */}
      <div className="relative">
        <svg
          viewBox="0 0 800 350"
          className="w-full h-80 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 via-white to-red-50"
        >
          {/* Area Containers */}
          {areas.map((area) => {
            const currentCommand = commands[animationStep];
            const isActive = currentCommand && currentCommand.affected.includes(area.id);

            return (
              <g key={area.id}>
                {/* Area Background */}
                <rect
                  x={area.x - 60}
                  y={area.y - 40}
                  width={120}
                  height={180}
                  rx="12"
                  className={`${
                    isActive
                      ? 'fill-orange-100 stroke-orange-300 stroke-2'
                      : 'fill-gray-50 stroke-gray-300 stroke-1'
                  } transition-all duration-300`}
                />

                {/* Area Icon */}
                <rect
                  x={area.x - 20}
                  y={area.y - 20}
                  width={40}
                  height={40}
                  rx="20"
                  fill={area.color}
                  className={`${isActive ? 'opacity-100' : 'opacity-70'} transition-opacity duration-300`}
                />

                {/* Area Title */}
                <text
                  x={area.x}
                  y={area.y + 50}
                  textAnchor="middle"
                  className={`text-sm font-bold ${
                    isActive ? 'fill-orange-700' : 'fill-gray-700'
                  } transition-colors duration-300`}
                >
                  {area.title}
                </text>

                {/* Files/Content Representation */}
                {area.id !== 'remote' && (
                  <>
                    <rect
                      x={area.x - 30}
                      y={area.y + 70}
                      width={60}
                      height={8}
                      rx="2"
                      className={`${
                        isActive ? 'fill-orange-300' : 'fill-gray-300'
                      } transition-colors duration-300`}
                    />
                    <rect
                      x={area.x - 20}
                      y={area.y + 85}
                      width={40}
                      height={8}
                      rx="2"
                      className={`${
                        isActive ? 'fill-orange-300' : 'fill-gray-300'
                      } transition-colors duration-300`}
                    />
                  </>
                )}

                {/* Remote server icon */}
                {area.id === 'remote' && (
                  <foreignObject x={area.x - 12} y={area.y + 65} width="24" height="24">
                    <Server
                      className={`w-6 h-6 ${
                        isActive ? 'text-orange-600' : 'text-gray-400'
                      } transition-colors duration-300`}
                    />
                  </foreignObject>
                )}
              </g>
            );
          })}

          {/* Flow Arrows */}
          {[
            { from: areas[0], to: areas[1], commandIndex: 1 }, // working -> staging
            { from: areas[1], to: areas[2], commandIndex: 2 }, // staging -> local
            { from: areas[2], to: areas[3], commandIndex: 3 }, // local -> remote
            { from: areas[3], to: areas[2], commandIndex: 4 }, // remote -> local (pull)
          ].map((flow, index) => {
            const isActive = animationStep === flow.commandIndex;
            const arrowId = `arrow-${index}`;

            return (
              <g key={index}>
                <defs>
                  <marker
                    id={arrowId}
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      className={`${
                        isActive ? 'fill-orange-500' : 'fill-gray-400'
                      } transition-colors duration-300`}
                    />
                  </marker>
                </defs>

                <line
                  x1={flow.from.x + (flow.commandIndex === 4 ? -40 : 40)}
                  y1={flow.from.y + (flow.commandIndex === 4 ? -10 : 0)}
                  x2={flow.to.x + (flow.commandIndex === 4 ? 40 : -40)}
                  y2={flow.to.y + (flow.commandIndex === 4 ? -10 : 0)}
                  className={`${
                    isActive ? 'stroke-orange-500 stroke-3' : 'stroke-gray-400 stroke-1'
                  } transition-all duration-300`}
                  markerEnd={`url(#${arrowId})`}
                />

                {/* Command Label */}
                {isActive && (
                  <text
                    x={(flow.from.x + flow.to.x) / 2}
                    y={(flow.from.y + flow.to.y) / 2 + (flow.commandIndex === 4 ? -15 : 5)}
                    textAnchor="middle"
                    className="text-sm fill-orange-700 font-bold"
                  >
                    {commands[flow.commandIndex].title}
                  </text>
                )}
              </g>
            );
          })}

          {/* Init Special Effect */}
          {animationStep === 0 && (
            <g>
              <circle
                cx={250}
                cy={250}
                r="30"
                className="fill-purple-200 stroke-purple-400 stroke-2 animate-pulse"
              />
              <text
                x={250}
                y={255}
                textAnchor="middle"
                className="text-sm fill-purple-700 font-bold"
              >
                git init
              </text>
            </g>
          )}

          {/* Data Flow Animation */}
          {isAnimating && animationStep > 0 && (
            <circle
              cx={areas[Math.max(0, animationStep - 1)].x + 40}
              cy={areas[Math.max(0, animationStep - 1)].y}
              r="5"
              className="fill-orange-500 animate-pulse"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0,0; ${
                  areas[Math.min(3, animationStep)].x - areas[Math.max(0, animationStep - 1)].x - 40
                },0`}
                dur="1s"
                repeatCount="1"
              />
            </circle>
          )}
        </svg>
      </div>

      {/* Command Details */}
      <div className="mt-8 grid md:grid-cols-5 gap-4">
        {commands.map((cmd, index) => (
          <div
            key={cmd.id}
            className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
              animationStep === index
                ? 'border-orange-300 bg-orange-50 shadow-lg'
                : activeCommand === index
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => onCommandChange(index)}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-white"
                style={{ backgroundColor: cmd.color }}
              >
                <div className="scale-75">{cmd.icon}</div>
              </div>
              <code className="text-xs font-mono text-gray-800">{cmd.title}</code>
            </div>
            <p className="text-xs text-gray-600">{cmd.description}</p>
          </div>
        ))}
      </div>

      {/* Current Step Info */}
      <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
        <div className="flex items-start gap-4">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full text-white flex-shrink-0"
            style={{ backgroundColor: commands[animationStep].color }}
          >
            {commands[animationStep].icon}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-orange-900 mb-2">
              Step {animationStep + 1}: {commands[animationStep].title}
            </h4>
            <p className="text-orange-800 mb-3">{commands[animationStep].longDescription}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-orange-800 mb-2">Affected Areas:</h5>
                <div className="flex gap-2">
                  {commands[animationStep].affected.map((areaId) => {
                    const area = areas.find((a) => a.id === areaId);
                    return area ? (
                      <span
                        key={areaId}
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: area.color }}
                      >
                        {area.title}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-orange-800 mb-2">Common Usage:</h5>
                <code className="bg-gray-900 text-orange-400 px-3 py-1 rounded text-sm font-mono block">
                  {animationStep === 0 && 'git init'}
                  {animationStep === 1 && 'git add . # or git add <filename>'}
                  {animationStep === 2 && 'git commit -m "Your message"'}
                  {animationStep === 3 && 'git push origin main'}
                  {animationStep === 4 && 'git pull origin main'}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Tips */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-bold text-gray-800 mb-3">💡 Workflow Tips</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h5 className="font-semibold mb-2">Best Practices:</h5>
            <ul className="space-y-1">
              <li>• Commit frequently with clear messages</li>
              <li>• Pull before pushing to avoid conflicts</li>
              <li>• Review staged changes before committing</li>
              <li>• Use descriptive commit messages</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Common Sequence:</h5>
            <ol className="space-y-1">
              <li>1. Edit files in working directory</li>
              <li>2. Stage changes with git add</li>
              <li>3. Commit staged changes</li>
              <li>4. Push commits to remote</li>
              <li>5. Pull updates from remote</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workflow2D;
