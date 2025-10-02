import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Users,
  Building2,
  Package,
  Settings,
  Database,
  ArrowRight,
  Plus,
  Trash2,
  Zap,
  Globe,
  Server,
  Code,
  Layers,
  Target,
  Play,
  Pause,
  Download,
  Info,
} from 'lucide-react';

interface C4Element {
  id: string;
  type: 'person' | 'system' | 'container' | 'component' | 'database';
  name: string;
  description: string;
  technology?: string;
  x: number;
  y: number;
  level: 'context' | 'container' | 'component' | 'code';
  width: number;
  height: number;
}

interface C4Relationship {
  id: string;
  from: string;
  to: string;
  description: string;
  technology?: string;
  style: 'solid' | 'dashed' | 'dotted';
}

interface C4ModelBuilder2DProps {
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

const C4ModelBuilder2D: React.FC<C4ModelBuilder2DProps> = React.memo(({ className = '' }) => {
  const [elements, setElements] = useState<C4Element[]>([]);
  const [relationships, setRelationships] = useState<C4Relationship[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<
    'context' | 'container' | 'component' | 'code'
  >('context');
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [showRelationships, setShowRelationships] = useState(true);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<SVGSVGElement>(null);

  const elementTypes = useMemo(
    () => ({
      person: {
        icon: Users,
        emoji: '👥',
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-800',
        level: 'context' as const,
        description: 'External users or actors',
        defaultName: 'User',
        defaultTech: '',
      },
      system: {
        icon: Building2,
        emoji: '🏢',
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300',
        textColor: 'text-green-800',
        level: 'context' as const,
        description: 'Software systems',
        defaultName: 'System',
        defaultTech: 'Web App',
      },
      container: {
        icon: Package,
        emoji: '📦',
        color: 'purple',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-300',
        textColor: 'text-purple-800',
        level: 'container' as const,
        description: 'Applications and data stores',
        defaultName: 'Container',
        defaultTech: 'Node.js',
      },
      component: {
        icon: Settings,
        emoji: '⚙️',
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-800',
        level: 'component' as const,
        description: 'Logical components',
        defaultName: 'Component',
        defaultTech: 'Service',
      },
      database: {
        icon: Database,
        emoji: '🗄️',
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-800',
        level: 'container' as const,
        description: 'Data storage systems',
        defaultName: 'Database',
        defaultTech: 'PostgreSQL',
      },
    }),
    []
  );

  const levelConfigs = useMemo(
    () => ({
      context: {
        name: 'Context',
        description: 'System Context - Shows the system and its environment',
        icon: Globe,
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        example: 'High-level overview showing users, systems, and external dependencies',
      },
      container: {
        name: 'Container',
        description: 'Container - Shows high-level technology choices',
        icon: Server,
        color: 'purple',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-800',
        example: 'Technology stack: web apps, mobile apps, databases, message queues',
      },
      component: {
        name: 'Component',
        description: 'Component - Shows components and their relationships',
        icon: Settings,
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        example: 'Business logic components and their interactions within containers',
      },
      code: {
        name: 'Code',
        description: 'Code - Shows implementation details and classes',
        icon: Code,
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        example: 'Class diagrams, interfaces, and detailed implementation',
      },
    }),
    []
  );

  const sampleDiagrams = useMemo(
    () => ({
      context: [
        { type: 'person', name: 'Customer', x: 50, y: 150 },
        { type: 'system', name: 'E-commerce Platform', x: 250, y: 100 },
        { type: 'system', name: 'Payment Gateway', x: 450, y: 150 },
      ],
      container: [
        { type: 'container', name: 'Web App', x: 100, y: 100 },
        { type: 'container', name: 'Mobile App', x: 350, y: 100 },
        { type: 'database', name: 'PostgreSQL', x: 225, y: 250 },
      ],
      component: [
        { type: 'component', name: 'Order Service', x: 50, y: 100 },
        { type: 'component', name: 'Payment Service', x: 250, y: 100 },
        { type: 'component', name: 'Inventory Service', x: 450, y: 100 },
      ],
      code: [
        { type: 'component', name: 'OrderController', x: 100, y: 100 },
        { type: 'component', name: 'OrderService', x: 300, y: 100 },
        { type: 'component', name: 'OrderRepository', x: 200, y: 250 },
      ],
    }),
    []
  );

  const addElement = useCallback(
    (type: C4Element['type']) => {
      const config = elementTypes[type];
      const newElement: C4Element = {
        id: `element-${Date.now()}`,
        type,
        name: `${config.defaultName} ${elements.filter((e) => e.type === type).length + 1}`,
        description: config.description,
        technology: config.defaultTech || undefined,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        level: config.level,
        width: 140,
        height: 80,
      };
      setElements((prev) => [...prev, newElement]);
    },
    [elements, elementTypes]
  );

  const loadSampleDiagram = useCallback(() => {
    const sampleElements = sampleDiagrams[selectedLevel].map((sample, index) => ({
      id: `sample-${selectedLevel}-${index}`,
      type: sample.type as C4Element['type'],
      name: sample.name,
      description: elementTypes[sample.type as keyof typeof elementTypes].description,
      technology: elementTypes[sample.type as keyof typeof elementTypes].defaultTech,
      x: sample.x,
      y: sample.y,
      level: selectedLevel,
      width: 140,
      height: 80,
    }));

    setElements(sampleElements);

    // Add some sample relationships
    if (selectedLevel === 'context') {
      setRelationships([
        {
          id: 'sample-rel-1',
          from: 'sample-context-0',
          to: 'sample-context-1',
          description: 'Uses',
          technology: 'HTTPS',
          style: 'solid',
        },
        {
          id: 'sample-rel-2',
          from: 'sample-context-1',
          to: 'sample-context-2',
          description: 'Processes payments',
          technology: 'API',
          style: 'solid',
        },
      ]);
    }
  }, [selectedLevel, sampleDiagrams, elementTypes]);

  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id));
      setRelationships((prev) => prev.filter((rel) => rel.from !== id && rel.to !== id));
      if (selectedElement === id) setSelectedElement(null);
    },
    [selectedElement]
  );

  const startConnection = useCallback((elementId: string) => {
    setConnectingFrom(elementId);
  }, []);

  const completeConnection = useCallback(
    (targetId: string) => {
      if (connectingFrom && connectingFrom !== targetId) {
        const newRelationship: C4Relationship = {
          id: `relationship-${Date.now()}`,
          from: connectingFrom,
          to: targetId,
          description: 'Uses',
          technology: 'HTTP',
          style: 'solid',
        };
        setRelationships((prev) => [...prev, newRelationship]);
      }
      setConnectingFrom(null);
    },
    [connectingFrom]
  );

  const deleteRelationship = useCallback((id: string) => {
    setRelationships((prev) => prev.filter((rel) => rel.id !== id));
  }, []);

  const filteredElements = useMemo(
    () => elements.filter((el) => el.level === selectedLevel),
    [elements, selectedLevel]
  );

  const getElementById = useCallback(
    (id: string) => elements.find((el) => el.id === id),
    [elements]
  );

  const handleMouseDown = useCallback((elementId: string, event: React.MouseEvent) => {
    setDraggedElement(elementId);
    setSelectedElement(elementId);
    event.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (draggedElement && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left - 70; // 70 is half element width
        const y = event.clientY - rect.top - 40; // 40 is half element height

        setElements((prev) =>
          prev.map((el) =>
            el.id === draggedElement
              ? {
                  ...el,
                  x: Math.max(0, Math.min(x, 600 - el.width)),
                  y: Math.max(0, Math.min(y, 400 - el.height)),
                }
              : el
          )
        );
      }
    },
    [draggedElement]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedElement(null);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        // Animation logic removed for simplicity
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentLevelConfig = levelConfigs[selectedLevel];

  return (
    <div
      className={`relative w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-2xl p-8 ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">🏗️ C4 Model Builder</h2>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          Create interactive software architecture diagrams using the C4 model methodology. Build
          from high-level context down to detailed code components.
        </p>
      </div>

      {/* Level Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-2xl p-2 shadow-xl flex space-x-2 border border-gray-200">
          {Object.entries(levelConfigs).map(([level, config]) => {
            const IconComponent = config.icon;
            const isActive = selectedLevel === level;
            return (
              <button
                key={level}
                onClick={() => setSelectedLevel(level as keyof typeof levelConfigs)}
                className={`px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-3 ${
                  isActive
                    ? `bg-${config.color}-500 text-white shadow-lg transform scale-105`
                    : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-bold">{config.name}</div>
                  <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {config.description.split(' - ')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Level Info */}
      <div
        className={`${currentLevelConfig.bgColor} ${currentLevelConfig.borderColor} border-2 rounded-xl p-6 mb-6 shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg bg-${currentLevelConfig.color}-100`}>
              <currentLevelConfig.icon className={`w-8 h-8 text-${currentLevelConfig.color}-600`} />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${currentLevelConfig.textColor}`}>
                {currentLevelConfig.name} Level
              </h3>
              <p className="text-gray-600 mt-1">{currentLevelConfig.description}</p>
              <p className="text-sm text-gray-500 mt-2">{currentLevelConfig.example}</p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="flex items-center space-x-2">
            {Object.keys(levelConfigs).map((level, index) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  level === selectedLevel
                    ? `bg-${currentLevelConfig.color}-500 scale-125`
                    : index < Object.keys(levelConfigs).indexOf(selectedLevel)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Toolbar */}
        <div className="space-y-4">
          {/* Element Palette */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add Elements
            </h4>
            <div className="space-y-2">
              {Object.entries(elementTypes)
                .filter(([, config]) => config.level === selectedLevel)
                .map(([type, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => addElement(type as C4Element['type'])}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 hover:shadow-md ${
                        config.borderColor
                      } ${config.bgColor} hover:bg-opacity-70`}
                    >
                      <IconComponent className={`w-5 h-5 text-${config.color}-600`} />
                      <div className="text-left">
                        <div className={`font-medium text-${config.color}-800`}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </div>
                        <div className="text-xs text-gray-600">{config.description}</div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </h4>
            <div className="space-y-2">
              <button
                onClick={loadSampleDiagram}
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Load Sample</span>
              </button>
              <button
                onClick={() => setElements([])}
                className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Controls
            </h4>
            <div className="space-y-3">
              <button
                onClick={() => setShowRelationships(!showRelationships)}
                className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  showRelationships
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showRelationships ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>Relationships</span>
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Stop' : 'Play'} Animation</span>
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Statistics
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Elements:</span>
                <span className="font-semibold text-gray-900">{filteredElements.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Relationships:</span>
                <span className="font-semibold text-gray-900">{relationships.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Level:</span>
                <span className="font-semibold text-gray-900">{currentLevelConfig.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {/* Canvas Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Layers className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">
                    {currentLevelConfig.name} Diagram Canvas
                  </span>
                  {isPlaying && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Animating</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Drag elements to reposition • Click to select • Right-click for options
                </div>
              </div>
            </div>

            {/* SVG Canvas */}
            <div className="relative">
              <svg
                ref={canvasRef}
                viewBox="0 0 800 500"
                className="w-full h-96 cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Grid Background */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1" />
                  </pattern>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                  </marker>
                  <marker
                    id="arrowhead-dashed"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                  </marker>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Relationships */}
                {showRelationships &&
                  relationships.map((relationship) => {
                    const fromElement = getElementById(relationship.from);
                    const toElement = getElementById(relationship.to);

                    if (
                      !fromElement ||
                      !toElement ||
                      fromElement.level !== selectedLevel ||
                      toElement.level !== selectedLevel
                    ) {
                      return null;
                    }

                    const fromX = fromElement.x + fromElement.width / 2;
                    const fromY = fromElement.y + fromElement.height / 2;
                    const toX = toElement.x + toElement.width / 2;
                    const toY = toElement.y + toElement.height / 2;

                    const midX = (fromX + toX) / 2;
                    const midY = (fromY + toY) / 2;

                    return (
                      <g key={relationship.id}>
                        {/* Connection Line */}
                        <line
                          x1={fromX}
                          y1={fromY}
                          x2={toX}
                          y2={toY}
                          stroke={relationship.style === 'solid' ? '#6b7280' : '#9ca3af'}
                          strokeWidth="2"
                          strokeDasharray={
                            relationship.style === 'dashed'
                              ? '5,5'
                              : relationship.style === 'dotted'
                                ? '2,2'
                                : 'none'
                          }
                          markerEnd={`url(#arrowhead${relationship.style === 'dashed' ? '-dashed' : ''})`}
                          className="transition-all duration-200 hover:stroke-blue-500"
                        />

                        {/* Relationship Label */}
                        <rect
                          x={midX - 40}
                          y={midY - 15}
                          width="80"
                          height="30"
                          fill="white"
                          stroke="#e5e7eb"
                          strokeWidth="1"
                          rx="4"
                        />
                        <text
                          x={midX}
                          y={midY - 2}
                          textAnchor="middle"
                          className="text-xs font-medium fill-gray-900"
                        >
                          {relationship.description}
                        </text>
                        {relationship.technology && (
                          <text
                            x={midX}
                            y={midY + 10}
                            textAnchor="middle"
                            className="text-xs fill-gray-500"
                          >
                            [{relationship.technology}]
                          </text>
                        )}

                        {/* Delete Relationship */}
                        <circle
                          cx={midX}
                          cy={midY}
                          r="10"
                          fill="white"
                          stroke="#ef4444"
                          strokeWidth="2"
                          className="cursor-pointer hover:fill-red-50 opacity-0 hover:opacity-100 transition-opacity"
                          onClick={() => deleteRelationship(relationship.id)}
                        />
                        <text
                          x={midX}
                          y={midY + 3}
                          textAnchor="middle"
                          className="text-xs fill-red-600 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                          onClick={() => deleteRelationship(relationship.id)}
                        >
                          ×
                        </text>
                      </g>
                    );
                  })}

                {/* Connection Preview */}
                {connectingFrom && (
                  <line
                    x1={
                      getElementById(connectingFrom)?.x ? getElementById(connectingFrom)!.x + 70 : 0
                    }
                    y1={
                      getElementById(connectingFrom)?.y ? getElementById(connectingFrom)!.y + 40 : 0
                    }
                    x2={400}
                    y2={250}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.7"
                  />
                )}

                {/* Elements */}
                {filteredElements.map((element) => {
                  const config = elementTypes[element.type];
                  const IconComponent = config.icon;
                  const isSelected = selectedElement === element.id;
                  const isDragged = draggedElement === element.id;
                  const isConnecting = connectingFrom === element.id;

                  return (
                    <g key={element.id}>
                      {/* Element Container */}
                      <rect
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                        fill={isConnecting ? '#dbeafe' : isSelected ? '#fef3c7' : 'white'}
                        stroke={isConnecting ? '#3b82f6' : isSelected ? '#f59e0b' : '#d1d5db'}
                        strokeWidth={isSelected ? '3' : '2'}
                        rx="8"
                        className={`cursor-move transition-all duration-200 ${
                          isDragged ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'
                        }`}
                        onMouseDown={(e) => handleMouseDown(element.id, e)}
                        onClick={() => {
                          if (!draggedElement) {
                            if (connectingFrom && connectingFrom !== element.id) {
                              completeConnection(element.id);
                            } else {
                              setSelectedElement(element.id);
                            }
                          }
                        }}
                      />

                      {/* Element Icon */}
                      <foreignObject x={element.x + 12} y={element.y + 12} width="24" height="24">
                        <div className="flex items-center justify-center w-full h-full">
                          <IconComponent className={`w-6 h-6 text-${config.color}-600`} />
                        </div>
                      </foreignObject>

                      {/* Element Name */}
                      <text
                        x={element.x + element.width / 2}
                        y={element.y + 35}
                        textAnchor="middle"
                        className="text-sm font-semibold fill-gray-900"
                      >
                        {element.name}
                      </text>

                      {/* Technology */}
                      {element.technology && (
                        <text
                          x={element.x + element.width / 2}
                          y={element.y + 50}
                          textAnchor="middle"
                          className="text-xs fill-gray-600"
                        >
                          [{element.technology}]
                        </text>
                      )}

                      {/* Action Buttons */}
                      <g className="opacity-0 hover:opacity-100 transition-opacity">
                        {/* Connect Button */}
                        <circle
                          cx={element.x + element.width - 20}
                          cy={element.y + 20}
                          r="12"
                          fill="#3b82f6"
                          className="cursor-pointer hover:fill-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            startConnection(element.id);
                          }}
                        />
                        <foreignObject
                          x={element.x + element.width - 26}
                          y={element.y + 14}
                          width="12"
                          height="12"
                        >
                          <ArrowRight className="w-3 h-3 text-white" />
                        </foreignObject>

                        {/* Delete Button */}
                        <circle
                          cx={element.x + element.width - 20}
                          cy={element.y + element.height - 20}
                          r="12"
                          fill="#ef4444"
                          className="cursor-pointer hover:fill-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(element.id);
                          }}
                        />
                        <foreignObject
                          x={element.x + element.width - 26}
                          y={element.y + element.height - 26}
                          width="12"
                          height="12"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </foreignObject>
                      </g>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <rect
                          x={element.x - 4}
                          y={element.y - 4}
                          width={element.width + 8}
                          height={element.height + 8}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="animate-pulse"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Element Details Panel */}
          {selectedElement && (
            <div className="mt-4 bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Element Details
                </h4>
                <button
                  onClick={() => setSelectedElement(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {(() => {
                const element = getElementById(selectedElement);
                if (!element) return null;

                const config = elementTypes[element.type];
                const IconComponent = config.icon;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <IconComponent className={`w-6 h-6 text-${config.color}-600`} />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">{element.name}</h5>
                        <p className="text-sm text-gray-600">{config.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium">{element.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Level:</span>
                        <span className="ml-2 font-medium">{element.level}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Technology:</span>
                        <span className="ml-2 font-medium">{element.technology || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Position:</span>
                        <span className="ml-2 font-medium">
                          ({Math.round(element.x)}, {Math.round(element.y)})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h4 className="font-semibold text-gray-900 mb-2">Getting Started</h4>
            <p className="text-sm text-gray-600">
              Choose a C4 level, add elements from the palette, and connect them to show
              relationships.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔗</div>
            <h4 className="font-semibold text-gray-900 mb-2">Building Relationships</h4>
            <p className="text-sm text-gray-600">
              Click the arrow button on elements to create connections. Use different line styles
              for various relationship types.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <h4 className="font-semibold text-gray-900 mb-2">Progressive Refinement</h4>
            <p className="text-sm text-gray-600">
              Start with Context level for big picture, then drill down to Components and Code
              levels for details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default C4ModelBuilder2D;
