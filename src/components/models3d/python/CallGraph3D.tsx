import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  Mesh,
  SphereGeometry,
  CylinderGeometry,
  MeshLambertMaterial,
  AmbientLight,
  DirectionalLight,
  Group,
  Vector3,
} from 'three';
import VisualizationControls from '../../shared/VisualizationControls';

interface CallGraph3DProps {
  activeStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface FunctionNode {
  id: string;
  name: string;
  calls: number;
  x: number;
  y: number;
  z: number;
  color: string;
  isActive: boolean;
}

interface FunctionCall {
  from: string;
  to: string;
  weight: number;
}

interface ExecutionStep {
  title: string;
  description: string;
  nodes: FunctionNode[];
  calls: FunctionCall[];
  explanation: string[];
  codeSnippet: string;
  focusNode?: string;
}

class CallGraphModel {
  private scene: Scene;
  private nodes: Map<string, Mesh> = new Map();
  private edges: Mesh[] = [];
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

  updateGraph(nodes: FunctionNode[], calls: FunctionCall[]) {
    // Clear existing graph
    this.clearGraph();

    // Add nodes with optimized geometry (reduced segments)
    nodes.forEach((node) => {
      const geometry = new SphereGeometry(Math.max(0.3, node.calls * 0.05), 8, 6); // Reduced segments
      const material = new MeshLambertMaterial({
        color: parseInt(node.color.replace('#', ''), 16),
        transparent: true,
        opacity: node.isActive ? 1.0 : 0.6,
      });

      const mesh = new Mesh(geometry, material);
      mesh.position.set(node.x, node.y, node.z);
      mesh.userData = { id: node.id, name: node.name };

      this.group.add(mesh);
      this.nodes.set(node.id, mesh);
    });

    // Add edges with optimized geometry (reduced segments)
    calls.forEach((call) => {
      const fromNode = this.nodes.get(call.from);
      const toNode = this.nodes.get(call.to);

      if (fromNode && toNode) {
        const fromPos = fromNode.position;
        const toPos = toNode.position;

        const direction = new Vector3().subVectors(toPos, fromPos);
        const length = direction.length();
        const geometry = new CylinderGeometry(0.05, 0.05, length, 6); // Reduced segments

        const material = new MeshLambertMaterial({
          color: 0x888888,
          transparent: true,
          opacity: 0.7,
        });

        const mesh = new Mesh(geometry, material);

        // Position cylinder between nodes
        const midpoint = new Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5);
        mesh.position.copy(midpoint);

        // Orient cylinder to point from source to target
        mesh.lookAt(toPos);
        mesh.rotateX(Math.PI / 2);

        this.group.add(mesh);
        this.edges.push(mesh);
      }
    });
  }

  highlightNode(nodeId: string) {
    this.nodes.forEach((mesh, id) => {
      const material = mesh.material as MeshLambertMaterial;
      if (id === nodeId) {
        material.emissive.setHex(0x444444);
        mesh.scale.setScalar(1.5);
      } else {
        material.emissive.setHex(0x000000);
        mesh.scale.setScalar(1.0);
      }
    });
  }

  resetHighlights() {
    this.nodes.forEach((mesh) => {
      const material = mesh.material as MeshLambertMaterial;
      material.emissive.setHex(0x000000);
      mesh.scale.setScalar(1.0);
    });
  }

  animate() {
    // Gentle floating animation
    this.nodes.forEach((mesh) => {
      mesh.position.y += Math.sin(Date.now() * 0.001 + mesh.position.x) * 0.001;
    });
  }

  private clearGraph() {
    // Remove nodes
    this.nodes.forEach((mesh) => {
      this.group.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as MeshLambertMaterial).dispose();
    });
    this.nodes.clear();

    // Remove edges
    this.edges.forEach((mesh) => {
      this.group.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as MeshLambertMaterial).dispose();
    });
    this.edges = [];
  }

  dispose() {
    // Comprehensive cleanup
    this.nodes.forEach((mesh) => {
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
    this.nodes.clear();

    this.edges.forEach((mesh) => {
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
    this.edges = [];

    // Dispose lights
    this.scene.children.forEach((child) => {
      if (child instanceof AmbientLight || child instanceof DirectionalLight) {
        // Lights don't have dispose method, just remove them
      }
    });

    this.scene.remove(this.group);
  }
}

const CallGraph3D: React.FC<CallGraph3DProps> = ({
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
  const modelRef = useRef<CallGraphModel | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const executionSteps = useMemo<ExecutionStep[]>(
    () => [
      {
        title: 'Simple Function Calls',
        description: 'Basic function call relationships in a linear execution',
        nodes: [
          {
            id: 'main',
            name: 'main',
            calls: 1,
            x: 0,
            y: 0,
            z: 0,
            color: '#3B82F6',
            isActive: true,
          },
          {
            id: 'func_a',
            name: 'func_a',
            calls: 1,
            x: 2,
            y: 1,
            z: 0,
            color: '#10B981',
            isActive: false,
          },
          {
            id: 'func_b',
            name: 'func_b',
            calls: 1,
            x: 2,
            y: -1,
            z: 0,
            color: '#F59E0B',
            isActive: false,
          },
        ],
        calls: [
          { from: 'main', to: 'func_a', weight: 1 },
          { from: 'func_a', to: 'func_b', weight: 1 },
        ],
        explanation: [
          'Functions form a call graph showing execution flow',
          'Each node represents a function, edges show calls',
          'Node size indicates call frequency',
          'Linear execution creates simple call chains',
        ],
        codeSnippet: `def func_b():\n    return "world"\n\ndef func_a():\n    return "hello " + func_b()\n\ndef main():\n    result = func_a()\n    print(result)`,
      },
      {
        title: 'Recursive Calls',
        description: 'Functions that call themselves, creating cycles in the graph',
        nodes: [
          {
            id: 'factorial',
            name: 'factorial',
            calls: 5,
            x: 0,
            y: 0,
            z: 0,
            color: '#8B5CF6',
            isActive: true,
          },
          {
            id: 'factorial_4',
            name: 'factorial(4)',
            calls: 1,
            x: 1.5,
            y: 1,
            z: 0,
            color: '#8B5CF6',
            isActive: false,
          },
          {
            id: 'factorial_3',
            name: 'factorial(3)',
            calls: 1,
            x: 2.5,
            y: 0.5,
            z: 0,
            color: '#8B5CF6',
            isActive: false,
          },
          {
            id: 'factorial_2',
            name: 'factorial(2)',
            calls: 1,
            x: 3.5,
            y: 0,
            z: 0,
            color: '#8B5CF6',
            isActive: false,
          },
        ],
        calls: [
          { from: 'factorial', to: 'factorial_4', weight: 1 },
          { from: 'factorial_4', to: 'factorial_3', weight: 1 },
          { from: 'factorial_3', to: 'factorial_2', weight: 1 },
        ],
        explanation: [
          'Recursion creates multiple instances of the same function',
          'Each recursive call adds a new node to the graph',
          'Call stack depth limits recursion depth',
          'Base case terminates the recursive chain',
        ],
        codeSnippet: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nresult = factorial(4)`,
      },
      {
        title: 'Complex Call Patterns',
        description: 'Multiple functions calling each other in complex patterns',
        nodes: [
          {
            id: 'process_data',
            name: 'process_data',
            calls: 3,
            x: 0,
            y: 0,
            z: 0,
            color: '#3B82F6',
            isActive: true,
          },
          {
            id: 'validate',
            name: 'validate',
            calls: 2,
            x: -2,
            y: 1,
            z: 0,
            color: '#10B981',
            isActive: false,
          },
          {
            id: 'transform',
            name: 'transform',
            calls: 2,
            x: 2,
            y: 1,
            z: 0,
            color: '#F59E0B',
            isActive: false,
          },
          {
            id: 'save',
            name: 'save',
            calls: 1,
            x: 0,
            y: -2,
            z: 0,
            color: '#EF4444',
            isActive: false,
          },
          { id: 'log', name: 'log', calls: 4, x: 0, y: 2, z: 0, color: '#8B5CF6', isActive: false },
        ],
        calls: [
          { from: 'process_data', to: 'validate', weight: 2 },
          { from: 'process_data', to: 'transform', weight: 2 },
          { from: 'process_data', to: 'save', weight: 1 },
          { from: 'validate', to: 'log', weight: 1 },
          { from: 'transform', to: 'log', weight: 1 },
          { from: 'save', to: 'log', weight: 1 },
        ],
        explanation: [
          'Real applications have complex call graphs',
          'Functions can call multiple other functions',
          'Some functions are called frequently (hubs)',
          'Understanding call graphs helps with optimization',
        ],
        codeSnippet: `def process_data(data):\n    if validate(data):\n        transformed = transform(data)\n        log("Data processed")\n        save(transformed)\n        log("Data saved")`,
      },
      {
        title: 'Call Graph Analysis',
        description: 'Analyzing call graphs for performance and debugging',
        nodes: [
          {
            id: 'hotspot',
            name: 'hotspot',
            calls: 10,
            x: 0,
            y: 0,
            z: 0,
            color: '#EF4444',
            isActive: true,
          },
          {
            id: 'frequent',
            name: 'frequent',
            calls: 7,
            x: -2,
            y: 1,
            z: 0,
            color: '#F59E0B',
            isActive: false,
          },
          {
            id: 'rare',
            name: 'rare',
            calls: 1,
            x: 2,
            y: 1,
            z: 0,
            color: '#10B981',
            isActive: false,
          },
          {
            id: 'leaf',
            name: 'leaf',
            calls: 2,
            x: 0,
            y: -2,
            z: 0,
            color: '#8B5CF6',
            isActive: false,
          },
        ],
        calls: [
          { from: 'hotspot', to: 'frequent', weight: 5 },
          { from: 'hotspot', to: 'rare', weight: 1 },
          { from: 'frequent', to: 'leaf', weight: 2 },
        ],
        explanation: [
          'Hotspots are frequently called functions',
          'Large nodes indicate performance bottlenecks',
          "Leaf nodes are functions that don't call others",
          'Call graph analysis guides optimization efforts',
        ],
        codeSnippet: `# Profiling shows:\n# hotspot() called 10 times\n# frequent() called 7 times\n# rare() called 1 time\n# leaf() called 2 times`,
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
    const newStep = Math.min(executionSteps.length - 1, currentStep + 1);
    setCurrentStep(newStep);
    if (onStepChange) onStepChange(newStep);
  }, [currentStep, executionSteps.length, onStepChange]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  // Auto-play effect
  useEffect(() => {
    let interval: number;

    if (isPlaying && currentStep < executionSteps.length - 1) {
      interval = window.setInterval(() => {
        const nextStep = currentStep + 1;
        if (nextStep < executionSteps.length) {
          setCurrentStep(nextStep);
          if (onStepChange) onStepChange(nextStep);
        } else {
          setIsPlaying(false);
        }
      }, 4000 / speed);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, executionSteps.length, speed, onStepChange]);

  // Update model when step changes
  useEffect(() => {
    if (modelRef.current) {
      const step = executionSteps[currentStep];
      modelRef.current.updateGraph(step.nodes, step.calls);

      if (step.focusNode) {
        modelRef.current.highlightNode(step.focusNode);
      } else {
        modelRef.current.resetHighlights();
      }
    }
  }, [currentStep, executionSteps]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Scene setup
    const scene = new Scene();
    scene.background = new Color(0x0f0f23);
    sceneRef.current = scene;

    // Camera setup
    const camera = new PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 10);
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
    const model = new CallGraphModel(scene);
    modelRef.current = model;

    // Animation loop with visibility detection and performance optimizations
    let isVisible = true;
    let animationId: number;

    const animate = () => {
      // Only update if component is visible
      if (isVisible && modelRef.current) {
        modelRef.current.animate();
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

  const currentExecutionStep = executionSteps[currentStep];

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">🔗 Function Call Graph</h3>
          <p className="text-gray-300">
            3D visualization of function call relationships and execution flow
          </p>
        </div>

        <div
          ref={containerRef}
          className="w-full h-96 bg-indigo-950 rounded-lg border border-indigo-700 relative mb-6"
          style={{ minHeight: '400px' }}
        />

        {/* Controls */}
        <VisualizationControls
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={executionSteps.length}
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
          <div className="bg-indigo-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white text-lg">{currentExecutionStep?.title}</h4>
              <span className="text-sm text-gray-400">Step {currentStep + 1}</span>
            </div>

            <p className="text-gray-300 mb-4">{currentExecutionStep?.description}</p>

            {/* Key Points */}
            <div className="grid gap-2">
              {currentExecutionStep?.explanation.map((point, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300 text-sm">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Code example and graph info */}
          <div className="space-y-4">
            {/* Code example */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h5 className="font-semibold text-white mb-3">Code Example</h5>
              <pre className="text-purple-400 text-sm font-mono bg-gray-800 p-3 rounded border border-gray-700 overflow-x-auto">
                <code>{currentExecutionStep?.codeSnippet}</code>
              </pre>
            </div>

            {/* Graph Statistics */}
            <div className="bg-indigo-800/50 rounded-lg p-4">
              <h5 className="font-semibold text-white mb-3">Graph Statistics</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Functions:</span>
                  <span className="text-white ml-2">{currentExecutionStep?.nodes.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Calls:</span>
                  <span className="text-white ml-2">{currentExecutionStep?.calls.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Calls:</span>
                  <span className="text-white ml-2">
                    {currentExecutionStep?.nodes.reduce((sum, node) => sum + node.calls, 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Most Active:</span>
                  <span className="text-white ml-2">
                    {
                      currentExecutionStep?.nodes.reduce((max, node) =>
                        node.calls > max.calls ? node : max
                      ).name
                    }
                  </span>
                </div>
              </div>

              {/* Node Legend */}
              <div className="mt-4 pt-4 border-t border-indigo-700">
                <h6 className="font-medium text-white mb-2">Node Meanings:</h6>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Function</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-3 bg-gray-400"></div>
                    <span className="text-gray-300">Call</span>
                  </div>
                  <div className="text-gray-400">Size = Call Frequency</div>
                  <div className="text-gray-400">Edges = Relationships</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallGraph3D;
