import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Group,
  Color,
} from 'three';
import type { IModel } from '../../../three/core/types';
import VisualizationControls from '../../shared/VisualizationControls';

interface PythonVM3DProps {
  activeStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface EducationalStep {
  title: string;
  description: string;
  focusComponent: 'bytecode' | 'stack' | 'heap' | 'all';
  details: string[];
}

class PythonVMModel implements IModel {
  private group: Group;
  private bytecodeCube: Mesh;
  private stackCylinder: Mesh;
  private heapSphere: Mesh;
  private time = 0;
  private highlightedComponent: 'bytecode' | 'stack' | 'heap' | 'all' | null = null;
  private lastHighlightedComponent: 'bytecode' | 'stack' | 'heap' | 'all' | null = null;

  constructor() {
    this.group = new Group();

    // Bytecode cube (represents compiled Python bytecode) - reduced geometry complexity
    const bytecodeGeometry = new BoxGeometry(2, 2, 2, 1, 1, 1);
    const bytecodeMaterial = new MeshBasicMaterial({ color: 0x3b82f6, wireframe: true });
    this.bytecodeCube = new Mesh(bytecodeGeometry, bytecodeMaterial);
    this.bytecodeCube.position.set(-3, 0, 0);
    this.bytecodeCube.userData = { type: 'bytecode', name: 'Bytecode' };
    this.group.add(this.bytecodeCube);

    // Stack cylinder (represents call stack) - reduced geometry complexity
    const stackGeometry = new BoxGeometry(1, 3, 1, 1, 1, 1);
    const stackMaterial = new MeshBasicMaterial({ color: 0x10b981, wireframe: true });
    this.stackCylinder = new Mesh(stackGeometry, stackMaterial);
    this.stackCylinder.position.set(0, 0, 0);
    this.stackCylinder.userData = { type: 'stack', name: 'Call Stack' };
    this.group.add(this.stackCylinder);

    // Heap sphere (represents heap memory) - reduced geometry complexity
    const heapGeometry = new BoxGeometry(2.5, 2.5, 2.5, 1, 1, 1);
    const heapMaterial = new MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true });
    this.heapSphere = new Mesh(heapGeometry, heapMaterial);
    this.heapSphere.position.set(3, 0, 0);
    this.heapSphere.userData = { type: 'heap', name: 'Heap Memory' };
    this.group.add(this.heapSphere);
  }

  setHighlightedComponent(component: 'bytecode' | 'stack' | 'heap' | 'all' | null): void {
    this.highlightedComponent = component;
    // Only update materials if the highlight actually changed
    if (this.lastHighlightedComponent !== component) {
      this.updateMaterials();
      this.lastHighlightedComponent = component;
    }
  }

  private updateMaterials(): void {
    const isBytecodeHighlighted =
      this.highlightedComponent === 'bytecode' || this.highlightedComponent === 'all';
    const isStackHighlighted =
      this.highlightedComponent === 'stack' || this.highlightedComponent === 'all';
    const isHeapHighlighted =
      this.highlightedComponent === 'heap' || this.highlightedComponent === 'all';

    (this.bytecodeCube.material as MeshBasicMaterial).color.setHex(
      isBytecodeHighlighted ? 0x60a5fa : 0x3b82f6
    );
    (this.stackCylinder.material as MeshBasicMaterial).color.setHex(
      isStackHighlighted ? 0x34d399 : 0x10b981
    );
    (this.heapSphere.material as MeshBasicMaterial).color.setHex(
      isHeapHighlighted ? 0xa78bfa : 0x8b5cf6
    );
  }

  init(scene: Scene): void {
    scene.add(this.group);
  }

  update(dt: number): void {
    this.time += dt;

    // Animate the components with optimized calculations
    this.bytecodeCube.rotation.x = this.time * 0.5;
    this.bytecodeCube.rotation.y = this.time * 0.3;

    this.stackCylinder.rotation.y = this.time * 0.2;
    this.stackCylinder.position.y = Math.sin(this.time) * 0.5;

    this.heapSphere.rotation.x = this.time * 0.4;
    this.heapSphere.rotation.z = this.time * 0.6;
  }

  dispose(): void {
    // Comprehensive cleanup of all Three.js resources
    this.group.traverse((child) => {
      if (child instanceof Mesh) {
        // Dispose geometry
        if (child.geometry) {
          child.geometry.dispose();
        }

        // Dispose materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              if (material instanceof MeshBasicMaterial) {
                // Dispose textures that exist on MeshBasicMaterial
                if (material.map) material.map.dispose();
                if (material.alphaMap) material.alphaMap.dispose();
                if (material.aoMap) material.aoMap.dispose();
                if (material.envMap) material.envMap.dispose();
                if (material.lightMap) material.lightMap.dispose();
              }
              material.dispose();
            });
          } else {
            if (child.material instanceof MeshBasicMaterial) {
              // Dispose textures that exist on MeshBasicMaterial
              if (child.material.map) child.material.map.dispose();
              if (child.material.alphaMap) child.material.alphaMap.dispose();
              if (child.material.aoMap) child.material.aoMap.dispose();
              if (child.material.envMap) child.material.envMap.dispose();
              if (child.material.lightMap) child.material.lightMap.dispose();
            }
            child.material.dispose();
          }
        }
      }
    });

    // Clear the group
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
  }
}

const PythonVM3D: React.FC<PythonVM3DProps> = ({
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
  const modelRef = useRef<PythonVMModel | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const educationalSteps = useMemo<EducationalStep[]>(
    () => [
      {
        title: 'Python Virtual Machine Overview',
        description: "The PVM is Python's runtime engine that executes compiled bytecode",
        focusComponent: 'all',
        details: [
          'Executes platform-independent bytecode instructions',
          'Manages memory allocation and garbage collection',
          'Handles function calls and returns through the call stack',
          'Provides the runtime environment for Python programs',
        ],
      },
      {
        title: 'Bytecode Execution',
        description: 'Compiled Python code in bytecode format (.pyc files)',
        focusComponent: 'bytecode',
        details: [
          'Platform-independent intermediate representation',
          'Generated by the Python compiler from source code',
          'Contains opcodes and operands for execution',
          'Optimized for fast interpretation by the PVM',
        ],
      },
      {
        title: 'Call Stack Management',
        description: 'Manages function calls, local variables, and execution context',
        focusComponent: 'stack',
        details: [
          'LIFO (Last In, First Out) data structure',
          'Stores function call frames and local variables',
          'Manages execution flow and return addresses',
          'Automatic cleanup when functions complete',
        ],
      },
      {
        title: 'Heap Memory Allocation',
        description: 'Dynamic memory for objects, data structures, and complex types',
        focusComponent: 'heap',
        details: [
          'Stores dynamically allocated objects and data',
          "Managed by Python's garbage collector",
          'Contains references from stack variables',
          'Grows and shrinks as needed during execution',
        ],
      },
      {
        title: 'Memory Management',
        description: 'How Python handles memory allocation and cleanup',
        focusComponent: 'all',
        details: [
          'Reference counting for automatic memory management',
          'Garbage collection for cyclic references',
          'Stack for fast, temporary allocations',
          'Heap for persistent object storage',
        ],
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
    const newStep = Math.min(educationalSteps.length - 1, currentStep + 1);
    setCurrentStep(newStep);
    if (onStepChange) onStepChange(newStep);
  }, [currentStep, educationalSteps.length, onStepChange]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  // Auto-play effect
  useEffect(() => {
    let interval: number;

    if (isPlaying && currentStep < educationalSteps.length - 1) {
      interval = window.setInterval(() => {
        const nextStep = currentStep + 1;
        if (nextStep < educationalSteps.length) {
          setCurrentStep(nextStep);
          if (onStepChange) onStepChange(nextStep);
        } else {
          setIsPlaying(false);
        }
      }, 3000 / speed); // Base 3 seconds, adjusted by speed
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, educationalSteps.length, speed, onStepChange]);

  // Update model highlighting when step changes
  useEffect(() => {
    if (modelRef.current) {
      const step = educationalSteps[currentStep];
      modelRef.current.setHighlightedComponent(step.focusComponent);
    }
  }, [currentStep, educationalSteps]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Scene setup
    const scene = new Scene();
    scene.background = new Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 8);
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
    const model = new PythonVMModel();
    model.init(scene);
    modelRef.current = model;

    // Animation loop with visibility detection and performance optimizations
    let lastTime = 0;
    let isVisible = true;
    let animationId: number;

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) * 0.001; // Convert to seconds
      lastTime = currentTime;

      // Only update if component is visible and animation is needed
      if (isVisible && modelRef.current) {
        modelRef.current.update(deltaTime);
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

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">🚀 Python Virtual Machine</h3>
          <p className="text-gray-300">3D visualization of Python's execution engine</p>
        </div>

        <div
          ref={containerRef}
          className="w-full h-96 bg-black rounded-lg border border-gray-700 relative"
          style={{ minHeight: '400px' }}
        />

        {/* Educational Controls */}
        <VisualizationControls
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={educationalSteps.length}
          speed={speed}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onStepBack={handleStepBack}
          onStepForward={handleStepForward}
          onSpeedChange={handleSpeedChange}
          className="mt-6"
        />

        {/* Current Step Educational Content */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white text-lg">
              {educationalSteps[currentStep]?.title}
            </h4>
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {educationalSteps.length}
            </span>
          </div>

          <p className="text-gray-300 mb-4">{educationalSteps[currentStep]?.description}</p>

          {/* Key Details */}
          <div className="grid gap-2">
            {educationalSteps[currentStep]?.details.map((detail, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Component Legend */}
        <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
          <div
            className={`p-3 rounded-lg border transition-all duration-300 ${
              educationalSteps[currentStep]?.focusComponent === 'bytecode' ||
              educationalSteps[currentStep]?.focusComponent === 'all'
                ? 'bg-blue-900/70 border-blue-400 shadow-lg shadow-blue-500/20'
                : 'bg-blue-900/50 border-blue-500/30'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`w-3 h-3 rounded transition-colors duration-300 ${
                  educationalSteps[currentStep]?.focusComponent === 'bytecode' ||
                  educationalSteps[currentStep]?.focusComponent === 'all'
                    ? 'bg-blue-300'
                    : 'bg-blue-400'
                }`}
              ></div>
              <span className="font-semibold text-blue-300">Bytecode</span>
            </div>
            <p className="text-blue-200 text-xs">Compiled Python instructions executed by the VM</p>
          </div>

          <div
            className={`p-3 rounded-lg border transition-all duration-300 ${
              educationalSteps[currentStep]?.focusComponent === 'stack' ||
              educationalSteps[currentStep]?.focusComponent === 'all'
                ? 'bg-green-900/70 border-green-400 shadow-lg shadow-green-500/20'
                : 'bg-green-900/50 border-green-500/30'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`w-3 h-3 rounded transition-colors duration-300 ${
                  educationalSteps[currentStep]?.focusComponent === 'stack' ||
                  educationalSteps[currentStep]?.focusComponent === 'all'
                    ? 'bg-green-300'
                    : 'bg-green-400'
                }`}
              ></div>
              <span className="font-semibold text-green-300">Call Stack</span>
            </div>
            <p className="text-green-200 text-xs">Function calls and local variables management</p>
          </div>

          <div
            className={`p-3 rounded-lg border transition-all duration-300 ${
              educationalSteps[currentStep]?.focusComponent === 'heap' ||
              educationalSteps[currentStep]?.focusComponent === 'all'
                ? 'bg-purple-900/70 border-purple-400 shadow-lg shadow-purple-500/20'
                : 'bg-purple-900/50 border-purple-500/30'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`w-3 h-3 rounded transition-colors duration-300 ${
                  educationalSteps[currentStep]?.focusComponent === 'heap' ||
                  educationalSteps[currentStep]?.focusComponent === 'all'
                    ? 'bg-purple-300'
                    : 'bg-purple-400'
                }`}
              ></div>
              <span className="font-semibold text-purple-300">Heap Memory</span>
            </div>
            <p className="text-purple-200 text-xs">Dynamic object allocation and storage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonVM3D;
