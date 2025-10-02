import React, { useState } from 'react';
import GitArchitecture2D from '../visualizations/2d/GitArchitecture2D';
import { Server, GitBranch, Shield, Zap, Users, Globe, Database, Clock } from 'lucide-react';

const Architecture: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const architectureDemos = [
    {
      id: 0,
      title: 'Centralized vs Distributed',
      description: "Compare traditional centralized systems with Git's distributed approach",
      icon: '🏗️',
    },
    {
      id: 1,
      title: 'Team Collaboration',
      description: 'See how multiple developers work together seamlessly',
      icon: '👥',
    },
    {
      id: 2,
      title: 'Offline Capabilities',
      description: "Understand Git's powerful offline development features",
      icon: '💻',
    },
    {
      id: 3,
      title: 'Backup & Redundancy',
      description: 'Explore built-in backup through distributed architecture',
      icon: '💾',
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
              <Server className="w-16 h-16 text-orange-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Git Architecture: Distributed by Design
          </h1>
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            Understand how Git's revolutionary distributed architecture transformed software
            development by eliminating single points of failure and enabling powerful collaboration
            workflows that work anywhere, anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
              🌐 Distributed Network
            </span>
            <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold">
              🔒 No Single Point of Failure
            </span>
            <span className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-semibold">
              💻 Full Offline Capability
            </span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
              📚 Complete History Everywhere
            </span>
          </div>
        </div>
      </div>

      {/* Core Architecture Concepts */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Understanding Distributed Architecture
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Server className="w-6 h-6 text-red-600 mr-2" />
              Traditional Centralized VCS
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Traditional version control systems like SVN and CVS use a centralized model where all
              project history is stored on a single server. Developers check out working copies but
              don't have access to the complete project history locally.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Key Limitations:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Single point of failure</li>
                <li>• Network dependency for most operations</li>
                <li>• Limited offline capabilities</li>
                <li>• Slower performance due to server communication</li>
                <li>• Difficult branching and merging</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <GitBranch className="w-6 h-6 text-green-600 mr-2" />
              Git's Distributed Model
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Git implements a distributed version control system where every clone is a complete
              repository with full history. This fundamental difference enables powerful
              capabilities and eliminates many traditional VCS limitations.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Key Advantages:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• No single point of failure</li>
                <li>• Full functionality offline</li>
                <li>• Fast local operations</li>
                <li>• Every clone is a backup</li>
                <li>• Powerful branching and merging</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Distributed Benefits */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Why Distributed Architecture Matters
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Resilience</h4>
              <p className="text-sm text-gray-600">
                Multiple complete copies provide automatic backup and eliminate single points of
                failure
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Performance</h4>
              <p className="text-sm text-gray-600">
                Local operations are blazingly fast since they don't require network communication
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Collaboration</h4>
              <p className="text-sm text-gray-600">
                Flexible workflows support various team structures and development patterns
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Architecture Visualization */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Interactive Architecture Demo</h2>
          <div className="flex items-center space-x-4">
            <select
              value={activeDemo}
              onChange={(e) => setActiveDemo(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {architectureDemos.map((demo) => (
                <option key={demo.id} value={demo.id}>
                  {demo.icon} {demo.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {architectureDemos[activeDemo].icon} {architectureDemos[activeDemo].title}
            </h3>
            <p className="text-gray-700">{architectureDemos[activeDemo].description}</p>
          </div>
        </div>

        {/* 2D Visualization Component */}
        <GitArchitecture2D activeDemo={activeDemo} onAnimationStateChange={setIsAnimating} />

        {isAnimating && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-3"></div>
              <span className="text-orange-800 font-medium">
                Demonstrating architecture concepts...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Distributed Workflow Patterns */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Distributed Workflow Patterns</h2>

        <div className="grid gap-6">
          {/* Centralized Workflow */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <Server className="w-6 h-6 text-blue-600 mr-2" />
              Centralized Workflow
            </h3>
            <p className="text-gray-700 mb-4">
              Similar to traditional VCS but with Git's distributed benefits. All developers push to
              and pull from a single shared repository, maintaining a linear history.
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Best For:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Small teams transitioning from SVN</li>
                    <li>• Simple projects with linear development</li>
                    <li>• Teams preferring straightforward workflows</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Key Benefits:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Familiar to SVN users</li>
                    <li>• Simple to understand and implement</li>
                    <li>• Git's performance and reliability</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Integration-Manager Workflow */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <Users className="w-6 h-6 text-green-600 mr-2" />
              Integration-Manager Workflow
            </h3>
            <p className="text-gray-700 mb-4">
              Developers work in private repositories and submit changes to an integration manager
              who merges contributions into the official repository. Used by many open-source
              projects.
            </p>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Best For:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Open-source projects</li>
                    <li>• Projects with external contributors</li>
                    <li>• Teams requiring code review</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Key Benefits:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Quality control through review</li>
                    <li>• Clear contribution process</li>
                    <li>• Scalable for large projects</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Dictator and Lieutenants */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <Globe className="w-6 h-6 text-purple-600 mr-2" />
              Dictator and Lieutenants
            </h3>
            <p className="text-gray-700 mb-4">
              Hierarchical workflow where lieutenants manage specific subsystems and a dictator
              integrates all changes. Used by the Linux kernel and other large-scale projects.
            </p>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Best For:</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Very large projects</li>
                    <li>• Complex systems with subsystems</li>
                    <li>• Projects with clear hierarchy</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Key Benefits:</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Scales to massive projects</li>
                    <li>• Clear responsibility areas</li>
                    <li>• Parallel development streams</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Deep Dive */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 mb-8 border border-orange-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Technical Architecture Details</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Database className="w-6 h-6 text-orange-600 mr-2" />
              Repository Structure
            </h3>
            <p className="text-gray-700 mb-4">
              Each Git repository contains the complete project history in the `.git` directory.
              This includes all commits, branches, tags, and configuration information.
            </p>
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <pre className="text-sm text-gray-800 font-mono">
                {`.git/
├── objects/     # Git object database
├── refs/        # Branch and tag references
├── HEAD         # Current branch pointer
├── config       # Repository configuration
├── index        # Staging area
└── hooks/       # Custom scripts`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="w-6 h-6 text-orange-600 mr-2" />
              Performance Characteristics
            </h3>
            <p className="text-gray-700 mb-4">
              Git's distributed architecture provides significant performance advantages through
              local operations and efficient data structures.
            </p>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-orange-200">
                <h4 className="font-semibold text-orange-700 text-sm">Local Operations</h4>
                <p className="text-xs text-gray-600">
                  Most commands execute instantly using local data
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-orange-200">
                <h4 className="font-semibold text-orange-700 text-sm">Efficient Storage</h4>
                <p className="text-xs text-gray-600">Delta compression and object deduplication</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-orange-200">
                <h4 className="font-semibold text-orange-700 text-sm">Smart Transfers</h4>
                <p className="text-xs text-gray-600">Only send/receive necessary changes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Explore Git's Architecture</h2>
        <p className="text-xl text-gray-700 mb-6">
          Now that you understand Git's distributed architecture, dive deeper into the specific
          components and workflows that make it so powerful.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigateToSection('Three-Tree Model')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center mb-2">
              <GitBranch className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                Three-Tree Model
              </h3>
            </div>
            <p className="text-sm text-gray-600">Working Directory, Staging Area, Repository</p>
          </button>

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
            <p className="text-sm text-gray-600">Blobs, Trees, Commits, and Tags</p>
          </button>

          <button
            onClick={() => navigateToSection('Core Workflow')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center mb-2">
              <Clock className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                Core Workflow
              </h3>
            </div>
            <p className="text-sm text-gray-600">Essential Git commands and operations</p>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Architecture;
