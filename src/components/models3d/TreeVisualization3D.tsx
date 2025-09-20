import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { RotateCcw, Play, Pause, SkipBack, Eye } from 'lucide-react';

interface Node3D {
  id: string;
  value: number;
  position: [number, number, number];
  color: string;
  connections: string[];
}

interface TreeVisualization3DProps {
  isActive?: boolean;
  className?: string;
}

const TreeVisualization3D: React.FC<TreeVisualization3DProps> = ({
  isActive = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [rotationX, setRotationX] = useState(0.2);
  const [rotationY, setRotationY] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Sample binary tree data
  const treeData: Node3D[] = useMemo(
    () => [
      {
        id: 'root',
        value: 50,
        position: [0, 0, 0],
        color: '#3B82F6',
        connections: ['left1', 'right1'],
      },
      {
        id: 'left1',
        value: 30,
        position: [-2, -1.5, 0],
        color: '#10B981',
        connections: ['left2', 'right2'],
      },
      {
        id: 'right1',
        value: 70,
        position: [2, -1.5, 0],
        color: '#10B981',
        connections: ['left3', 'right3'],
      },
      { id: 'left2', value: 20, position: [-3, -3, 0], color: '#F59E0B', connections: [] },
      { id: 'right2', value: 40, position: [-1, -3, 0], color: '#F59E0B', connections: [] },
      { id: 'left3', value: 60, position: [1, -3, 0], color: '#F59E0B', connections: [] },
      { id: 'right3', value: 80, position: [3, -3, 0], color: '#F59E0B', connections: [] },
    ],
    []
  );

  // Simple 3D rendering using Canvas 2D (pseudo-3D)
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Transform 3D coordinates to 2D with rotation
    const project3D = (x: number, y: number, z: number) => {
      // Apply rotation
      const cosX = Math.cos(rotationX),
        sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY),
        sinY = Math.sin(rotationY);

      // Rotate around X axis
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;

      // Rotate around Y axis
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;

      // Project to 2D with perspective
      const distance = 5;
      const scale = (distance / (distance + z2)) * zoom * 50;

      return {
        x: centerX + x2 * scale,
        y: centerY + y1 * scale,
        z: z2,
        scale,
      };
    };

    // Draw connections (edges)
    treeData.forEach((node) => {
      node.connections.forEach((connectionId) => {
        const targetNode = treeData.find((n) => n.id === connectionId);
        if (targetNode) {
          const from = project3D(...node.position);
          const to = project3D(...targetNode.position);

          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.strokeStyle = '#6B7280';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    });

    // Sort nodes by z-coordinate for proper depth rendering
    const sortedNodes = [...treeData]
      .map((node) => ({ ...node, projected: project3D(...node.position) }))
      .sort((a, b) => b.projected.z - a.projected.z);

    // Draw nodes
    sortedNodes.forEach((node, index) => {
      const { projected } = node;
      const radius = Math.max(15, projected.scale * 0.8);

      // Draw node shadow
      ctx.beginPath();
      ctx.arc(projected.x + 2, projected.y + 2, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fill();

      // Draw node
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, radius, 0, 2 * Math.PI);

      // Animate nodes based on step
      const isAnimated = index <= currentStep;
      ctx.fillStyle = isAnimated ? node.color : '#E5E7EB';
      ctx.fill();

      ctx.strokeStyle = isAnimated ? '#1F2937' : '#9CA3AF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw value
      ctx.fillStyle = isAnimated ? 'white' : '#6B7280';
      ctx.font = `bold ${Math.max(12, radius * 0.6)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.value.toString(), projected.x, projected.y);
    });

    // Draw traversal information
    if (currentStep < treeData.length) {
      const currentNode = treeData[currentStep];
      const projected = project3D(...currentNode.position);

      // Highlight current node
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, Math.max(15, projected.scale * 0.8) + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw info box
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(10, 10, 200, 60);
      ctx.fillStyle = 'white';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`Current Node: ${currentNode.value}`, 20, 30);
      ctx.fillText(`Step: ${currentStep + 1} / ${treeData.length}`, 20, 50);
    }
  }, [currentStep, rotationX, rotationY, zoom, treeData]);

  // Animation loop
  useEffect(() => {
    if (isPlaying && isActive) {
      const animate = () => {
        setRotationY((prev) => prev + 0.01);
        drawScene();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      drawScene();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isActive, currentStep, rotationX, rotationY, zoom, drawScene]);

  // Auto-advance steps
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= treeData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isPlaying, treeData.length]);

  const resetAnimation = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setRotationX(0.2);
    setRotationY(0);
    setZoom(1);
  };

  return (
    <div className={`relative bg-gray-100 dark:bg-gray-900 rounded-lg ${className}`}>
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-96 rounded-lg cursor-pointer"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startY = e.clientY;
          const startRotX = rotationX;
          const startRotY = rotationY;

          const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            setRotationX(startRotX - deltaY * 0.01);
            setRotationY(startRotY + deltaX * 0.01);
          };

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
        onWheel={(e) => {
          e.preventDefault();
          setZoom((prev) => Math.max(0.5, Math.min(3, prev - e.deltaY * 0.001)));
        }}
      />

      {/* Controls */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
        <button
          onClick={resetAnimation}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm
                   border border-gray-200 dark:border-gray-700
                   hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Reset"
        >
          <SkipBack className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm
                   border border-gray-200 dark:border-gray-700
                   hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        <button
          onClick={() => setRotationY((prev) => prev + Math.PI / 4)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm
                   border border-gray-200 dark:border-gray-700
                   hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Rotate"
        >
          <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Info Panel */}
      <div
        className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm
                      border border-gray-200 dark:border-gray-700 max-w-xs"
      >
        <div className="flex items-center space-x-2 mb-2">
          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">3D Binary Tree</h4>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>• Drag to rotate view</div>
          <div>• Scroll to zoom in/out</div>
          <div>• Play to animate traversal</div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm
                      border border-gray-200 dark:border-gray-700"
      >
        <div className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Node Types</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Root</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Internal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Leaf</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualization3D;
