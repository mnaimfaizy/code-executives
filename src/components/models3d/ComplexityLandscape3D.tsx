import React, { useMemo } from 'react';
import ThreeCanvas from '../../three/react/ThreeCanvas';
import { ComplexityLandscape3D } from '../../three/models/ComplexityLandscape3D';
import type { AlgorithmDescription } from '../../types/bigo';

interface ComplexityLandscapeProps {
  algorithms?: AlgorithmDescription[];
  showAxes?: boolean;
  showGrid?: boolean;
  interactive?: boolean;
  className?: string;
  onAlgorithmSelect?: (algorithm: AlgorithmDescription) => void;
}

const ComplexityLandscape: React.FC<ComplexityLandscapeProps> = ({
  algorithms,
  showAxes = true,
  showGrid = true,
  interactive = false,
  className = '',
  onAlgorithmSelect,
}) => {
  const model = useMemo(() => {
    return new ComplexityLandscape3D({
      algorithms,
      showAxes,
      showGrid,
      interactive,
      onAlgorithmSelect,
    });
  }, [algorithms, showAxes, showGrid, interactive, onAlgorithmSelect]);

  return (
    <div
      className={`relative w-full h-96 bg-gradient-to-br from-slate-900 to-gray-900 rounded-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-white mb-1">3D Complexity Landscape</h3>
        <p className="text-sm text-gray-300">Algorithms visualized in complexity space</p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-3">
        <h4 className="text-sm font-bold text-white mb-2">Complexity Colors</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-300">O(1) - Constant</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-300">O(log n) - Logarithmic</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-300">O(n) - Linear</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-300">O(n log n) - Linearithmic</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-300">O(n²) - Quadratic</span>
          </div>
        </div>
      </div>

      {/* Axis Labels */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-2">
        <div className="text-xs text-gray-300 space-y-1">
          <div>
            <span className="font-bold text-blue-400">X:</span> Time Complexity
          </div>
          <div>
            <span className="font-bold text-green-400">Y:</span> Space Complexity
          </div>
          <div>
            <span className="font-bold text-purple-400">Z:</span> Efficiency Score
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <ThreeCanvas models={[model]} background={0x1a1a2e} className="w-full h-full" />

      {/* Instructions */}
      {interactive && (
        <div className="absolute bottom-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-3 max-w-xs">
          <p className="text-xs text-gray-300">
            🖱️ <strong>Click and drag</strong> to rotate the view
            <br />
            🔍 <strong>Scroll</strong> to zoom in/out
            <br />
            🎯 <strong>Hover</strong> over points for algorithm details
          </p>
        </div>
      )}
    </div>
  );
};

export default ComplexityLandscape;
