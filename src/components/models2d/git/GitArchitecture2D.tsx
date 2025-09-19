import React, { useEffect, useState } from 'react';
import { Server, GitBranch, Shield } from 'lucide-react';

interface GitArchitecture2DProps {
  activeDemo: number;
  onAnimationStateChange: (isAnimating: boolean) => void;
}

interface NetworkNode {
  id: string;
  name: string;
  type: 'central' | 'developer' | 'remote';
  x: number;
  y: number;
  status: 'idle' | 'active' | 'syncing' | 'offline';
  hasFullHistory: boolean;
  icon: string;
}

interface DataFlow {
  from: string;
  to: string;
  type: 'push' | 'pull' | 'sync' | 'commit';
  active: boolean;
}

const GitArchitecture2D: React.FC<GitArchitecture2DProps> = ({
  activeDemo,
  onAnimationStateChange,
}) => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [dataFlows, setDataFlows] = useState<DataFlow[]>([]);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'demo' | 'complete'>('idle');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    onAnimationStateChange(true);
    setAnimationPhase('idle');
    setCurrentStep(0);

    const updateAnimationStep = (step: number) => {
      setNodes((prevNodes) => {
        return prevNodes.map((node) => {
          switch (activeDemo) {
            case 0: // Comparison demo
              if (step < 2) {
                // Show centralized issues
                if (node.id === 'central-server' && step === 1) {
                  return { ...node, status: 'offline' as const };
                }
                if ((node.id === 'dev1-cent' || node.id === 'dev2-cent') && step === 1) {
                  return { ...node, status: 'offline' as const };
                }
              } else {
                // Show distributed benefits
                if (node.id === 'central-server') {
                  return { ...node, status: 'offline' as const };
                }
                if (node.id.includes('dist')) {
                  return { ...node, status: step === 2 ? ('active' as const) : ('idle' as const) };
                }
              }
              break;

            case 1: // Collaboration demo
              if (step === 0) {
                return node.id === 'dev1' ? { ...node, status: 'active' as const } : node;
              } else if (step === 1) {
                return node.id === 'dev2'
                  ? { ...node, status: 'active' as const }
                  : node.id === 'dev1'
                    ? { ...node, status: 'idle' as const }
                    : node;
              } else if (step === 2) {
                return node.id === 'github'
                  ? { ...node, status: 'syncing' as const }
                  : node.id === 'dev2'
                    ? { ...node, status: 'idle' as const }
                    : node;
              } else if (step === 3) {
                return node.id === 'dev3'
                  ? { ...node, status: 'active' as const }
                  : node.id === 'github'
                    ? { ...node, status: 'idle' as const }
                    : node;
              }
              break;

            case 2: // Offline demo
              if (step === 0) {
                return node.id === 'laptop' ? { ...node, status: 'active' as const } : node;
              } else if (step === 1) {
                return node.id === 'local-commits' ? { ...node, status: 'active' as const } : node;
              } else if (step === 4) {
                return node.id === 'remote'
                  ? { ...node, status: 'syncing' as const }
                  : node.id === 'laptop'
                    ? { ...node, status: 'idle' as const }
                    : node;
              }
              break;

            case 3: // Backup demo
              if (step === 1) {
                return node.id === 'backup1' ? { ...node, status: 'syncing' as const } : node;
              } else if (step === 2) {
                return node.id === 'backup2'
                  ? { ...node, status: 'syncing' as const }
                  : node.id === 'backup1'
                    ? { ...node, status: 'idle' as const }
                    : node;
              } else if (step === 3) {
                return node.id === 'dev-local'
                  ? { ...node, status: 'active' as const }
                  : node.id === 'backup2'
                    ? { ...node, status: 'idle' as const }
                    : node;
              }
              break;
          }
          return node;
        });
      });

      // Update data flows based on demo and step
      setDataFlows(() => {
        const newFlows: DataFlow[] = [];

        switch (activeDemo) {
          case 1: // Collaboration
            if (step === 0) {
              newFlows.push({ from: 'dev1', to: 'github', type: 'push', active: true });
            } else if (step === 2) {
              newFlows.push({ from: 'github', to: 'dev2', type: 'pull', active: true });
            } else if (step === 3) {
              newFlows.push({ from: 'dev3', to: 'github', type: 'push', active: true });
            }
            break;

          case 2: // Offline
            if (step === 4) {
              newFlows.push({ from: 'laptop', to: 'remote', type: 'sync', active: true });
            }
            break;

          case 3: // Backup
            if (step === 1) {
              newFlows.push({ from: 'origin', to: 'backup1', type: 'sync', active: true });
            } else if (step === 2) {
              newFlows.push({ from: 'origin', to: 'backup2', type: 'sync', active: true });
            }
            break;
        }

        return newFlows;
      });
    };

    const setupDemo = () => {
      switch (activeDemo) {
        case 0: // Centralized vs Distributed Comparison
          setupComparisonDemo();
          break;
        case 1: // Distributed Collaboration
          setupCollaborationDemo();
          break;
        case 2: // Offline Capabilities
          setupOfflineDemo();
          break;
        case 3: // Backup and Redundancy
          setupBackupDemo();
          break;
        default:
          setupComparisonDemo();
      }

      // Start animation sequence after setup
      setTimeout(() => {
        startAnimationSequence();
      }, 800);
    };

    const startAnimationSequence = () => {
      setAnimationPhase('demo');
      setCurrentStep(0);

      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = prev + 1;
          if (nextStep >= 6) {
            // 6 steps in total
            setAnimationPhase('complete');
            clearInterval(stepInterval);

            // Update flows and nodes based on current step
            updateAnimationStep(nextStep - 1);

            setTimeout(() => {
              setAnimationPhase('idle');
              setCurrentStep(0);
              onAnimationStateChange(false);
            }, 3000);

            return 0;
          }

          // Update animation for current step
          updateAnimationStep(nextStep - 1);
          return nextStep;
        });
      }, 2000);
    };

    setupDemo();
  }, [activeDemo, onAnimationStateChange]);

  const setupComparisonDemo = () => {
    const centralizedNodes: NetworkNode[] = [
      {
        id: 'central-server',
        name: 'Central Server',
        type: 'central',
        x: 130,
        y: 80,
        status: 'idle',
        hasFullHistory: true,
        icon: '🏛️',
      },
      {
        id: 'dev1-cent',
        name: 'Developer 1',
        type: 'developer',
        x: 50,
        y: 160,
        status: 'idle',
        hasFullHistory: false,
        icon: '👨‍💻',
      },
      {
        id: 'dev2-cent',
        name: 'Developer 2',
        type: 'developer',
        x: 210,
        y: 160,
        status: 'idle',
        hasFullHistory: false,
        icon: '👩‍💻',
      },
    ];

    const distributedNodes: NetworkNode[] = [
      {
        id: 'remote-repo',
        name: 'Remote Repository',
        type: 'remote',
        x: 400,
        y: 80,
        status: 'idle',
        hasFullHistory: true,
        icon: '☁️',
      },
      {
        id: 'dev1-dist',
        name: 'Developer 1',
        type: 'developer',
        x: 320,
        y: 160,
        status: 'idle',
        hasFullHistory: true,
        icon: '👨‍💻',
      },
      {
        id: 'dev2-dist',
        name: 'Developer 2',
        type: 'developer',
        x: 480,
        y: 160,
        status: 'idle',
        hasFullHistory: true,
        icon: '👩‍💻',
      },
    ];

    setNodes([...centralizedNodes, ...distributedNodes]);
    setDataFlows([]);
  };

  const setupCollaborationDemo = () => {
    const collaborationNodes: NetworkNode[] = [
      {
        id: 'github',
        name: 'GitHub',
        type: 'remote',
        x: 260,
        y: 60,
        status: 'idle',
        hasFullHistory: true,
        icon: '🐙',
      },
      {
        id: 'dev1',
        name: 'Alice',
        type: 'developer',
        x: 120,
        y: 160,
        status: 'idle',
        hasFullHistory: true,
        icon: '👩‍💻',
      },
      {
        id: 'dev2',
        name: 'Bob',
        type: 'developer',
        x: 400,
        y: 160,
        status: 'idle',
        hasFullHistory: true,
        icon: '👨‍💻',
      },
      {
        id: 'dev3',
        name: 'Charlie',
        type: 'developer',
        x: 180,
        y: 240,
        status: 'idle',
        hasFullHistory: true,
        icon: '👨‍💻',
      },
      {
        id: 'dev4',
        name: 'Diana',
        type: 'developer',
        x: 340,
        y: 240,
        status: 'idle',
        hasFullHistory: true,
        icon: '👩‍💻',
      },
    ];

    setNodes(collaborationNodes);
    setDataFlows([]);
  };

  const setupOfflineDemo = () => {
    const offlineNodes: NetworkNode[] = [
      {
        id: 'remote',
        name: 'Remote Server',
        type: 'remote',
        x: 400,
        y: 100,
        status: 'idle',
        hasFullHistory: true,
        icon: '☁️',
      },
      {
        id: 'laptop',
        name: 'Laptop (Offline)',
        type: 'developer',
        x: 120,
        y: 100,
        status: 'offline',
        hasFullHistory: true,
        icon: '💻',
      },
      {
        id: 'local-commits',
        name: 'Local History',
        type: 'developer',
        x: 120,
        y: 180,
        status: 'active',
        hasFullHistory: true,
        icon: '📚',
      },
    ];

    setNodes(offlineNodes);
    setDataFlows([]);
  };

  const setupBackupDemo = () => {
    const backupNodes: NetworkNode[] = [
      {
        id: 'origin',
        name: 'Origin',
        type: 'remote',
        x: 260,
        y: 60,
        status: 'idle',
        hasFullHistory: true,
        icon: '🏠',
      },
      {
        id: 'backup1',
        name: 'Backup 1',
        type: 'remote',
        x: 120,
        y: 140,
        status: 'idle',
        hasFullHistory: true,
        icon: '💾',
      },
      {
        id: 'backup2',
        name: 'Backup 2',
        type: 'remote',
        x: 400,
        y: 140,
        status: 'idle',
        hasFullHistory: true,
        icon: '💾',
      },
      {
        id: 'dev-local',
        name: 'Developer',
        type: 'developer',
        x: 260,
        y: 220,
        status: 'idle',
        hasFullHistory: true,
        icon: '👨‍💻',
      },
    ];

    setNodes(backupNodes);
    setDataFlows([]);
  };

  const getNodeColor = (node: NetworkNode): string => {
    if (node.status === 'offline') return '#9CA3AF';
    if (node.status === 'active') return '#F59E0B';
    if (node.status === 'syncing') return '#10B981';
    if (node.type === 'central') return '#EF4444';
    if (node.type === 'remote') return '#3B82F6';
    return '#8B5CF6';
  };

  const getDemoTitle = (): string => {
    const titles = [
      'Centralized vs Distributed Architecture',
      'Distributed Team Collaboration',
      'Offline Development Capabilities',
      'Built-in Backup and Redundancy',
    ];
    return titles[activeDemo] || titles[0];
  };

  const getCurrentStepDescription = (): string => {
    if (activeDemo === 0) {
      // Centralized vs Distributed
      const steps = [
        'Traditional centralized systems require constant server connectivity',
        'Single point of failure can halt entire team productivity',
        "Git's distributed model gives everyone a complete repository copy",
        'Each developer can work independently with full history',
        'Multiple backup copies exist naturally across the team',
        "Network issues don't prevent local development work",
      ];
      return steps[currentStep] || '';
    }

    if (activeDemo === 1) {
      // Collaboration
      const steps = [
        'Each team member clones the complete project repository',
        'Developers work on features in their local repositories',
        'Changes are committed locally without affecting others',
        'Developers push completed features to shared repository',
        'Team members pull updates to stay synchronized',
        'Parallel development with seamless integration',
      ];
      return steps[currentStep] || '';
    }

    if (activeDemo === 2) {
      // Offline
      const steps = [
        'Developer works offline with full Git functionality',
        'Complete project history available locally',
        'Commits, branches, and merges work without network',
        'Local repository maintains all version control features',
        'Work continues productively during network outages',
        'Sync with remote when connectivity returns',
      ];
      return steps[currentStep] || '';
    }

    if (activeDemo === 3) {
      // Backup
      const steps = [
        'Original repository serves as primary source',
        'Multiple backup repositories can be maintained',
        "Each developer's local copy is also a backup",
        'Distributed nature provides inherent redundancy',
        'No single point of failure in the system',
        'Easy recovery from any complete repository copy',
      ];
      return steps[currentStep] || '';
    }

    return '';
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Architecture Visualization */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{getDemoTitle()}</h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-600">Phase: </span>
              <span className="font-semibold text-orange-600 capitalize">{animationPhase}</span>
            </div>
            {animationPhase === 'demo' && (
              <div className="text-sm">
                <span className="text-gray-600">Step: </span>
                <span className="font-semibold text-green-600">{currentStep + 1}/6</span>
              </div>
            )}
          </div>
        </div>

        <svg
          viewBox="0 0 520 300"
          className="w-full h-80 border-2 border-gray-200 rounded-lg bg-white"
        >
          {/* Background Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F3F4F6" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Section Labels for Comparison Demo */}
          {activeDemo === 0 && (
            <>
              <text
                x="130"
                y="30"
                textAnchor="middle"
                className="text-sm font-semibold"
                fill="#EF4444"
              >
                Centralized VCS
              </text>
              <text
                x="400"
                y="30"
                textAnchor="middle"
                className="text-sm font-semibold"
                fill="#3B82F6"
              >
                Distributed Git
              </text>
              <line
                x1="260"
                y1="40"
                x2="260"
                y2="280"
                stroke="#D1D5DB"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </>
          )}

          {/* Network Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              {/* Node Circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.type === 'central' || node.type === 'remote' ? 25 : 20}
                fill={getNodeColor(node)}
                stroke={node.status === 'active' ? '#F59E0B' : '#FFFFFF'}
                strokeWidth={node.status === 'active' ? 3 : 2}
                opacity={node.status === 'offline' ? 0.5 : 1}
              />

              {/* Node Icon */}
              <text
                x={node.x}
                y={node.y + 6}
                textAnchor="middle"
                className="text-lg"
                opacity={node.status === 'offline' ? 0.5 : 1}
              >
                {node.icon}
              </text>

              {/* Node Label */}
              <text
                x={node.x}
                y={node.y + 40}
                textAnchor="middle"
                className="text-xs font-medium"
                fill={node.status === 'offline' ? '#9CA3AF' : '#374151'}
              >
                {node.name}
              </text>

              {/* Full History Indicator */}
              {node.hasFullHistory && (
                <circle
                  cx={node.x + 18}
                  cy={node.y - 18}
                  r="8"
                  fill="#10B981"
                  stroke="white"
                  strokeWidth="2"
                >
                  <title>Complete History</title>
                </circle>
              )}

              {/* Active Animation */}
              {node.status === 'active' && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="30"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  opacity="0.6"
                >
                  <animate attributeName="r" values="25;35;25" dur="2s" repeatCount="indefinite" />
                  <animate
                    attributeName="opacity"
                    values="0.6;0.2;0.6"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Offline Indicator */}
              {node.status === 'offline' && (
                <g>
                  <line
                    x1={node.x - 15}
                    y1={node.y - 15}
                    x2={node.x + 15}
                    y2={node.y + 15}
                    stroke="#EF4444"
                    strokeWidth="3"
                  />
                  <line
                    x1={node.x + 15}
                    y1={node.y - 15}
                    x2={node.x - 15}
                    y2={node.y + 15}
                    stroke="#EF4444"
                    strokeWidth="3"
                  />
                </g>
              )}
            </g>
          ))}

          {/* Data Flow Lines */}
          {dataFlows.map((flow, index) => {
            const fromNode = nodes.find((n) => n.id === flow.from);
            const toNode = nodes.find((n) => n.id === flow.to);

            if (!fromNode || !toNode) return null;

            return (
              <line
                key={index}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={flow.active ? '#F59E0B' : '#D1D5DB'}
                strokeWidth={flow.active ? '3' : '2'}
                strokeDasharray={flow.active ? 'none' : '5,5'}
                opacity={flow.active ? 1 : 0.6}
                markerEnd="url(#arrowhead)"
              />
            );
          })}

          {/* Arrow Marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#F59E0B" />
            </marker>
          </defs>

          {/* Legend */}
          <g transform="translate(20, 250)">
            <rect
              x="0"
              y="0"
              width="200"
              height="40"
              fill="white"
              stroke="#D1D5DB"
              rx="4"
              opacity="0.9"
            />
            <circle cx="15" cy="15" r="6" fill="#10B981" />
            <text x="25" y="20" className="text-xs" fill="#374151">
              Complete History
            </text>
            <circle cx="15" cy="30" r="6" fill="#9CA3AF" />
            <text x="25" y="35" className="text-xs" fill="#374151">
              Partial/No History
            </text>
          </g>
        </svg>
      </div>

      {/* Current Step Description */}
      {animationPhase === 'demo' && (
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Step</h3>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800">{getCurrentStepDescription()}</p>
          </div>
        </div>
      )}

      {/* Architecture Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
            <Server className="w-5 h-5 mr-2" />
            Centralized VCS Limitations
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-1">•</span>
              <span>Single point of failure</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-1">•</span>
              <span>Requires constant network connectivity</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-1">•</span>
              <span>Limited offline capabilities</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-1">•</span>
              <span>Slower operations due to network dependency</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
            <GitBranch className="w-5 h-5 mr-2" />
            Distributed Git Advantages
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">•</span>
              <span>No single point of failure</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">•</span>
              <span>Full functionality offline</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">•</span>
              <span>Every clone is a complete backup</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">•</span>
              <span>Fast local operations</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Shield className="w-5 h-5 text-orange-600 mr-2" />
          Key Architectural Insights
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">🔒 Security Through Distribution</h4>
            <p className="text-sm text-gray-700 mb-4">
              With every developer having a complete copy, your project is naturally protected
              against data loss from server failures or corruption.
            </p>

            <h4 className="font-semibold text-orange-700 mb-2">⚡ Performance Benefits</h4>
            <p className="text-sm text-gray-700">
              Most Git operations are local, making them incredibly fast compared to
              network-dependent centralized systems.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">🌐 Flexible Workflows</h4>
            <p className="text-sm text-gray-700 mb-4">
              Distributed architecture enables various workflow patterns - centralized,
              integration-manager, or dictator-lieutenant models.
            </p>

            <h4 className="font-semibold text-orange-700 mb-2">🚀 Scalability</h4>
            <p className="text-sm text-gray-700">
              Git scales efficiently for projects of any size, from small scripts to massive
              codebases with millions of lines of code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitArchitecture2D;
