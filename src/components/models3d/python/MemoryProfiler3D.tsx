import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
  AmbientLight,
  DirectionalLight,
  Group,
} from 'three';
import VisualizationControls from '../../shared/VisualizationControls';

interface MemoryProfiler3DProps {
  activeStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface MemoryObject {
  id: string;
  type: 'int' | 'str' | 'list' | 'dict' | 'function';
  size: number;
  references: number;
  x: number;
  y: number;
  z: number;
  color: string;
}

interface AllocationStep {
  title: string;
  description: string;
  objects: MemoryObject[];
  explanation: string[];
  codeSnippet: string;
  focusType?: string;
}

class MemoryProfilerModel {
  private scene: Scene;
  private objects: Map<string, Mesh> = new Map();
  private group: Group;

  constructor(scene: Scene) {
    this.scene = scene;
    this.group = new Group();
    this.scene.add(this.group);

    // Add lights
    const ambientLight = new AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(directionalLight);
  }

  updateObjects(objects: MemoryObject[]) {
    // Remove existing objects
    this.group.children.forEach((child) => {
      this.group.remove(child);
      if (child instanceof Mesh) {
        child.geometry.dispose();
        (child.material as MeshLambertMaterial).dispose();
      }
    });
    this.objects.clear();

    // Add new objects with optimized geometry (reduced segments)
    objects.forEach((obj) => {
      const geometry = new BoxGeometry(
        Math.max(0.5, obj.size * 0.1),
        Math.max(0.5, obj.size * 0.1),
        Math.max(0.5, obj.references * 0.2),
        1,
        1,
        1 // Reduced segments for better performance
      );

      const material = new MeshLambertMaterial({
        color: parseInt(obj.color.replace('#', ''), 16),
        transparent: true,
        opacity: 0.8,
      });

      const mesh = new Mesh(geometry, material);
      mesh.position.set(obj.x, obj.y, obj.z);
      mesh.userData = { id: obj.id, type: obj.type };

      this.group.add(mesh);
      this.objects.set(obj.id, mesh);
    });
  }

  highlightType(type: string) {
    this.objects.forEach((mesh) => {
      const material = mesh.material as MeshLambertMaterial;
      if (mesh.userData.type === type) {
        material.emissive.setHex(0x444444);
        mesh.scale.setScalar(1.2);
      } else {
        material.emissive.setHex(0x000000);
        mesh.scale.setScalar(1.0);
      }
    });
  }

  resetHighlights() {
    this.objects.forEach((mesh) => {
      const material = mesh.material as MeshLambertMaterial;
      material.emissive.setHex(0x000000);
      mesh.scale.setScalar(1.0);
    });
  }

  animate(deltaTime: number) {
    // Gentle rotation for visual appeal
    this.group.rotation.y += deltaTime * 0.1;
  }

  dispose() {
    // Comprehensive cleanup
    this.objects.forEach((mesh) => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material instanceof MeshLambertMaterial) {
        // Dispose textures
        if (mesh.material.map) mesh.material.map.dispose();
        if (mesh.material.alphaMap) mesh.material.alphaMap.dispose();
        if (mesh.material.aoMap) mesh.material.aoMap.dispose();
        if (mesh.material.envMap) mesh.material.envMap.dispose();
        if (mesh.material.lightMap) mesh.material.lightMap.dispose();
        mesh.material.dispose();
      }
    });
    this.objects.clear();

    // Dispose lights
    this.scene.children.forEach((child) => {
      if (child instanceof AmbientLight || child instanceof DirectionalLight) {
        // Lights don't have dispose method, just remove them
      }
    });

    this.scene.remove(this.group);
  }
}

const MemoryProfiler3D: React.FC<MemoryProfiler3DProps> = ({
  activeStep = 0,
  onStepChange,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(activeStep);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const modelRef = useRef<MemoryProfilerModel | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const allocationSteps = useMemo<AllocationStep[]>(
    () => [
      {
        title: 'Memory Allocation Basics',
        description: 'Creating objects and observing memory usage patterns',
        objects: [
          { id: 'int1', type: 'int', size: 28, references: 1, x: -2, y: 1, z: 0, color: '#3B82F6' },
          { id: 'str1', type: 'str', size: 50, references: 1, x: 0, y: 1, z: 0, color: '#10B981' },
          {
            id: 'list1',
            type: 'list',
            size: 64,
            references: 1,
            x: 2,
            y: 1,
            z: 0,
            color: '#F59E0B',
          },
        ],
        explanation: [
          'Different object types have different memory footprints',
          'Integers: 28 bytes, Strings: variable size, Lists: 64 + element overhead',
          'Reference counting tracks object usage',
        ],
        codeSnippet: `a = 42          # 28 bytes\nb = "hello"     # 50 bytes\nc = [1, 2, 3]   # 64 bytes`,
      },
      {
        title: 'Reference Sharing',
        description: 'Multiple variables referencing the same object',
        objects: [
          {
            id: 'shared_obj',
            type: 'list',
            size: 64,
            references: 3,
            x: 0,
            y: 0,
            z: 0,
            color: '#F59E0B',
          },
          { id: 'ref1', type: 'int', size: 28, references: 1, x: -2, y: 1, z: 0, color: '#3B82F6' },
          { id: 'ref2', type: 'int', size: 28, references: 1, x: 2, y: 1, z: 0, color: '#3B82F6' },
        ],
        explanation: [
          'Multiple variables can reference the same object',
          'Reference count increases with each new reference',
          'Memory is not duplicated - only references are copied',
          'Efficient for large objects',
        ],
        codeSnippet: `big_list = [1, 2, 3, 4, 5]\ncopy1 = big_list\ncopy2 = big_list\n# All point to same object`,
      },
      {
        title: 'Memory Fragmentation',
        description: 'How object deallocation creates memory gaps',
        objects: [
          {
            id: 'obj1',
            type: 'dict',
            size: 240,
            references: 1,
            x: -3,
            y: 0,
            z: 0,
            color: '#8B5CF6',
          },
          { id: 'gap', type: 'int', size: 0, references: 0, x: -1, y: 0, z: 0, color: '#6B7280' },
          {
            id: 'obj2',
            type: 'dict',
            size: 240,
            references: 1,
            x: 1,
            y: 0,
            z: 0,
            color: '#8B5CF6',
          },
          {
            id: 'obj3',
            type: 'function',
            size: 136,
            references: 1,
            x: 3,
            y: 0,
            z: 0,
            color: '#EF4444',
          },
        ],
        explanation: [
          'Objects are allocated in heap memory',
          'Deallocation creates gaps (fragmentation)',
          'Small allocations may not fit in existing gaps',
          'Can lead to inefficient memory usage',
        ],
        codeSnippet: `d1 = {'a': 1, 'b': 2}  # Allocate\nd2 = {'x': 10, 'y': 20}  # Allocate\ndel d1  # Deallocate (creates gap)\nf = lambda x: x * 2  # May not fit in gap`,
      },
      {
        title: 'Garbage Collection',
        description: 'Automatic cleanup of unreachable objects',
        objects: [
          {
            id: 'reachable',
            type: 'list',
            size: 64,
            references: 1,
            x: -2,
            y: 0,
            z: 0,
            color: '#10B981',
          },
          {
            id: 'unreachable',
            type: 'dict',
            size: 240,
            references: 0,
            x: 2,
            y: 0,
            z: 0,
            color: '#EF4444',
          },
        ],
        explanation: [
          'Reference counting detects unreachable objects',
          'Garbage collector reclaims memory automatically',
          'Prevents memory leaks in most cases',
          'Handles cyclic references through generational GC',
        ],
        codeSnippet: `reachable = [1, 2, 3]\nunreachable = {'a': 1}\ndel unreachable  # Becomes garbage\n# GC will reclaim memory`,
      },
      {
        title: 'Memory Optimization',
        description: 'Techniques for efficient memory usage',
        objects: [
          {
            id: 'optimized',
            type: 'list',
            size: 32,
            references: 1,
            x: 0,
            y: 0,
            z: 0,
            color: '#10B981',
          },
          {
            id: 'wasteful',
            type: 'list',
            size: 128,
            references: 1,
            x: -2,
            y: 0,
            z: 0,
            color: '#F59E0B',
          },
        ],
        explanation: [
          'Use appropriate data structures for the task',
          'Avoid unnecessary object creation',
          'Consider memory vs performance trade-offs',
          'Profile memory usage to identify bottlenecks',
        ],
        codeSnippet: `# Efficient: generator expression\nsquares = (x*x for x in range(1000))\n\n# Less efficient: list comprehension\nsquares = [x*x for x in range(1000)]`,
      },
    ],
    []
  );

  // Control handlers
  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (onStepChange) onStepChange(0);
  }, [onStepChange]);

  const handleStepBack = useCallback(() => {
    const newStep = Math.max(0, currentStep - 1);
    setCurrentStep(newStep);
    if (onStepChange) onStepChange(newStep);
  }, [currentStep, onStepChange]);

  const handleStepForward = useCallback(() => {
    const newStep = Math.min(allocationSteps.length - 1, currentStep + 1);
    setCurrentStep(newStep);
    if (onStepChange) onStepChange(newStep);
  }, [currentStep, allocationSteps.length, onStepChange]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  // Auto-play effect
  useEffect(() => {
    let interval: number;

    if (isPlaying && currentStep < allocationSteps.length - 1) {
      interval = window.setInterval(() => {
        const nextStep = currentStep + 1;
        if (nextStep < allocationSteps.length) {
          setCurrentStep(nextStep);
          if (onStepChange) onStepChange(nextStep);
        } else {
          setIsPlaying(false);
        }
      }, 3500 / speed);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, allocationSteps.length, speed, onStepChange]);

  // Update model when step changes
  useEffect(() => {
    if (modelRef.current) {
      const step = allocationSteps[currentStep];
      modelRef.current.updateObjects(step.objects);

      if (step.focusType) {
        modelRef.current.highlightType(step.focusType);
      } else {
        modelRef.current.resetHighlights();
      }
    }
  }, [currentStep, allocationSteps]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Scene setup
    const scene = new Scene();
    scene.background = new Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera setup
    const camera = new PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup with performance optimizations
    const renderer = new WebGLRenderer({
      antialias: false, // Disable antialiasing for better performance
      powerPreference: 'low-power', // Prefer low power GPU
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Model setup
    const model = new MemoryProfilerModel(scene);
    modelRef.current = model;

    // Animation loop with visibility detection and performance optimizations
    let lastTime = 0;
    let isVisible = true;
    let animationId: number;

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) * 0.001;
      lastTime = currentTime;

      // Only update if component is visible
      if (isVisible && modelRef.current) {
        modelRef.current.animate(deltaTime);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationId = requestAnimationFrame(animate);
    };

    // Start animation
    animationId = requestAnimationFrame(animate);
    animationFrameRef.current = animationId;

    // Visibility detection for performance
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle resize
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (modelRef.current) {
        modelRef.current.dispose();
      }

      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    setCurrentStep(activeStep);
  }, [activeStep]);

  const currentAllocationStep = allocationSteps[currentStep];

  const getObjectTypeColor = (type: string) => {
    switch (type) {
      case 'int':
        return '#3B82F6';
      case 'str':
        return '#10B981';
      case 'list':
        return '#F59E0B';
      case 'dict':
        return '#8B5CF6';
      case 'function':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getObjectTypeIcon = (type: string) => {
    switch (type) {
      case 'int':
        return '🔢';
      case 'str':
        return '📝';
      case 'list':
        return '📋';
      case 'dict':
        return '📚';
      case 'function':
        return '⚙️';
      default:
        return '❓';
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">📊 Memory Profiler</h3>
          <p className="text-gray-300">
            3D visualization of Python memory allocation and management
          </p>
        </div>

        <div
          ref={containerRef}
          className="w-full h-96 bg-slate-950 rounded-lg border border-slate-700 relative mb-6"
          style={{ minHeight: '400px' }}
        />

        {/* Controls */}
        <VisualizationControls
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={allocationSteps.length}
          speed={speed}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onStepBack={handleStepBack}
          onStepForward={handleStepForward}
          onSpeedChange={handleSpeedChange}
          className="mb-6"
        />

        {/* Educational Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Main explanation */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white text-lg">{currentAllocationStep?.title}</h4>
              <span className="text-sm text-gray-400">Step {currentStep + 1}</span>
            </div>

            <p className="text-gray-300 mb-4">{currentAllocationStep?.description}</p>

            {/* Key Points */}
            <div className="grid gap-2">
              {currentAllocationStep?.explanation.map((point, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300 text-sm">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Code example and object details */}
          <div className="space-y-4">
            {/* Code example */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h5 className="font-semibold text-white mb-3">Code Example</h5>
              <pre className="text-blue-400 text-sm font-mono bg-gray-800 p-3 rounded border border-gray-700 overflow-x-auto">
                <code>{currentAllocationStep?.codeSnippet}</code>
              </pre>
            </div>

            {/* Object Legend */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h5 className="font-semibold text-white mb-3">Memory Objects</h5>
              <div className="grid grid-cols-2 gap-3">
                {['int', 'str', 'list', 'dict', 'function'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: getObjectTypeColor(type) }}
                    ></div>
                    <span className="text-xs text-gray-300">
                      {getObjectTypeIcon(type)} {type}
                    </span>
                  </div>
                ))}
              </div>

              {/* Current objects info */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <h6 className="font-medium text-white mb-2">Active Objects:</h6>
                <div className="space-y-1">
                  {currentAllocationStep?.objects
                    .filter((obj) => obj.references > 0)
                    .map((obj) => (
                      <div key={obj.id} className="flex justify-between text-xs">
                        <span className="text-gray-300">
                          {getObjectTypeIcon(obj.type)} {obj.id}
                        </span>
                        <span className="text-blue-400">
                          {obj.size}B, {obj.references} ref{obj.references !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryProfiler3D;
