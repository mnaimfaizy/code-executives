import React, { useState } from 'react';
import { Box, Layers, Zap, Eye, RotateCcw, Maximize2, Activity, Cpu } from 'lucide-react';
import TreeVisualization3D from '../../../../components/models3d/TreeVisualization3D';

const Visualizations3D: React.FC = () => {
  const [activeVisualization, setActiveVisualization] = useState<'tree' | 'heap' | 'graph'>('tree');

  const visualizations = [
    {
      id: 'tree' as const,
      title: '3D Binary Tree',
      description:
        'Interactive 3D representation of binary tree structures with traversal animations',
      icon: <Layers className="w-5 h-5" />,
      color: '#3B82F6',
      features: [
        'Interactive rotation',
        'Zoom controls',
        'Traversal animation',
        'Node highlighting',
      ],
    },
    {
      id: 'heap' as const,
      title: '3D Memory Heap',
      description: 'Visualization of memory allocation and garbage collection in 3D space',
      icon: <Activity className="w-5 h-5" />,
      color: '#10B981',
      features: [
        'Memory blocks',
        'Allocation patterns',
        'GC visualization',
        'Memory fragmentation',
      ],
    },
    {
      id: 'graph' as const,
      title: '3D Graph Networks',
      description: 'Complex network visualizations with force-directed layouts in 3D',
      icon: <Cpu className="w-5 h-5" />,
      color: '#F59E0B',
      features: ['Force simulation', 'Node clustering', 'Edge bundling', 'Network metrics'],
    },
  ];

  const selectedViz = visualizations.find((v) => v.id === activeVisualization)!;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-indigo-600">
          <Box className="w-8 h-8" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            3D Visualizations
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience data structures in three dimensions. Interactive 3D models bring complex
          algorithms and memory patterns to life with immersive visualizations.
        </p>
      </div>

      {/* Visualization Selector */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
          {visualizations.map((viz) => (
            <button
              key={viz.id}
              onClick={() => setActiveVisualization(viz.id)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                activeVisualization === viz.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${viz.color}20` }}>
                  <div style={{ color: viz.color }}>{viz.icon}</div>
                </div>
                <h3 className="font-semibold text-gray-900">{viz.title}</h3>
              </div>

              <p className="text-sm text-gray-600 mb-4">{viz.description}</p>

              <div className="space-y-1">
                {viz.features.map((feature, index) => (
                  <div key={index} className="text-xs text-gray-500 flex items-center">
                    <div className="w-1 h-1 rounded-full bg-gray-400 mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Visualization */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${selectedViz.color}20` }}>
              <div style={{ color: selectedViz.color }}>{selectedViz.icon}</div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedViz.title}</h2>
              <p className="text-gray-600">{selectedViz.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Maximize2 className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">Fullscreen available</span>
          </div>
        </div>

        {/* 3D Visualization Container */}
        {activeVisualization === 'tree' && <TreeVisualization3D isActive={true} className="mb-6" />}

        {activeVisualization === 'heap' && (
          <div className="h-96 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg border-2 border-dashed border-green-300 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Activity className="w-16 h-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-green-900">
                  3D Memory Heap Visualization
                </h3>
                <p className="text-green-700 mt-2">
                  Coming Soon - Advanced memory management visualization
                </p>
              </div>
            </div>
          </div>
        )}

        {activeVisualization === 'graph' && (
          <div className="h-96 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg border-2 border-dashed border-yellow-300 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Cpu className="w-16 h-16 text-yellow-600 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-yellow-900">3D Graph Networks</h3>
                <p className="text-yellow-700 mt-2">
                  Coming Soon - Interactive network topology visualization
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-gray-900 text-sm">Interactive Controls</h4>
            </div>
            <p className="text-xs text-gray-600">
              Drag to rotate, scroll to zoom, click to interact with 3D elements
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <h4 className="font-semibold text-gray-900 text-sm">Real-time Animation</h4>
            </div>
            <p className="text-xs text-gray-600">
              Watch algorithms execute step-by-step in smooth 3D animations
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <RotateCcw className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-gray-900 text-sm">Multiple Perspectives</h4>
            </div>
            <p className="text-xs text-gray-600">
              View data structures from any angle to understand spatial relationships
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <h4 className="font-semibold text-gray-900 text-sm">Depth Visualization</h4>
            </div>
            <p className="text-xs text-gray-600">
              See how data structures utilize 3D space for optimal organization
            </p>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Box className="w-4 h-4 mr-2" />
            3D Implementation Notes
          </h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div>• Uses Canvas 2D with pseudo-3D projection for optimal performance</div>
            <div>• Interactive mouse controls for rotation and zoom navigation</div>
            <div>• Depth-based rendering ensures proper visual layering</div>
            <div>• Optimized for smooth animations on various device capabilities</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizations3D;
