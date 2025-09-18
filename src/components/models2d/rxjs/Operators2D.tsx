import React, { useState, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Plus, Download, Settings, X } from 'lucide-react';

interface MarbleData {
  id: string;
  time: number;
  value: string | number;
  type: 'next' | 'error' | 'complete';
  color?: string;
}

type ConfigValue = string | number | boolean;

interface OperatorConfig {
  [key: string]: {
    type: 'number' | 'string' | 'boolean';
    default: ConfigValue;
    min?: number;
    max?: number;
    options?: string[];
  };
}

interface OperatorDefinition {
  id: string;
  name: string;
  category: 'transformation' | 'filtering' | 'combination' | 'utility' | 'creation';
  description: string;
  syntax: string;
  transform: (marbles: MarbleData[], config?: Record<string, ConfigValue>) => MarbleData[];
  config?: OperatorConfig;
}

interface OperatorChain {
  id: string;
  operator: OperatorDefinition;
  config: Record<string, ConfigValue>;
}

interface Operators2DProps {
  autoPlay?: boolean;
  animationSpeed?: number;
  width?: number;
  height?: number;
  className?: string;
}

const Operators2D: React.FC<Operators2DProps> = ({
  autoPlay = true,
  animationSpeed = 1,
  width = 1000,
  height = 600,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('transformation');
  const [operatorChain, setOperatorChain] = useState<OperatorChain[]>([]);
  const [showConfig, setShowConfig] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('1,2,3,4,5');
  const intervalRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const totalDuration = 6000; // 6 seconds
  const timelineWidth = width - 200;
  const startX = 100;
  const streamHeight = 100;

  // Define available operators
  const operatorDefinitions: OperatorDefinition[] = [
    // Transformation Operators
    {
      id: 'map',
      name: 'map',
      category: 'transformation',
      description: 'Transform each emitted value',
      syntax: 'map(x => x * multiplier)',
      transform: (marbles, config = { multiplier: 2 }) =>
        marbles.map((marble) => ({
          ...marble,
          value:
            marble.type === 'next'
              ? typeof marble.value === 'number'
                ? marble.value * Number(config.multiplier)
                : `${marble.value}_mapped`
              : marble.value,
          id: `${marble.id}_mapped`,
        })),
      config: {
        multiplier: { type: 'number', default: 2, min: 0.1, max: 10 },
      },
    },
    {
      id: 'pluck',
      name: 'pluck',
      category: 'transformation',
      description: 'Extract a property from objects',
      syntax: 'pluck(property)',
      transform: (marbles, config = { property: 'name' }) =>
        marbles.map((marble) => ({
          ...marble,
          value: marble.type === 'next' ? `${config.property}` : marble.value,
          id: `${marble.id}_plucked`,
        })),
      config: {
        property: { type: 'string', default: 'name', options: ['name', 'id', 'value', 'data'] },
      },
    },
    {
      id: 'scan',
      name: 'scan',
      category: 'transformation',
      description: 'Accumulate values over time',
      syntax: 'scan((acc, value) => acc + value, 0)',
      transform: (marbles) => {
        let accumulator = 0;
        return marbles.map((marble) => {
          if (marble.type === 'next' && typeof marble.value === 'number') {
            accumulator += marble.value;
            return { ...marble, value: accumulator, id: `${marble.id}_scanned` };
          }
          return marble;
        });
      },
    },

    // Filtering Operators
    {
      id: 'filter',
      name: 'filter',
      category: 'filtering',
      description: 'Filter values based on a condition',
      syntax: 'filter(x => x > threshold)',
      transform: (marbles, config = { threshold: 2 }) =>
        marbles.filter(
          (marble) =>
            marble.type !== 'next' ||
            (typeof marble.value === 'number'
              ? marble.value > Number(config.threshold)
              : marble.value.toString().length > Number(config.threshold))
        ),
      config: {
        threshold: { type: 'number', default: 2, min: 0, max: 10 },
      },
    },
    {
      id: 'take',
      name: 'take',
      category: 'filtering',
      description: 'Take only the first N values',
      syntax: 'take(count)',
      transform: (marbles, config = { count: 3 }) => {
        let taken = 0;
        return marbles.reduce((acc: MarbleData[], marble) => {
          if (marble.type === 'next' && taken < Number(config.count)) {
            taken++;
            acc.push({ ...marble, id: `${marble.id}_taken` });
          } else if (marble.type !== 'next') {
            acc.push(marble);
          }
          return acc;
        }, []);
      },
      config: {
        count: { type: 'number', default: 3, min: 1, max: 10 },
      },
    },
    {
      id: 'skip',
      name: 'skip',
      category: 'filtering',
      description: 'Skip the first N values',
      syntax: 'skip(count)',
      transform: (marbles, config = { count: 2 }) => {
        let skipped = 0;
        return marbles.reduce((acc: MarbleData[], marble) => {
          if (marble.type === 'next' && skipped < Number(config.count)) {
            skipped++;
          } else {
            acc.push({ ...marble, id: `${marble.id}_skipped` });
          }
          return acc;
        }, []);
      },
      config: {
        count: { type: 'number', default: 2, min: 1, max: 10 },
      },
    },
    {
      id: 'distinct',
      name: 'distinct',
      category: 'filtering',
      description: 'Emit only distinct values',
      syntax: 'distinct()',
      transform: (marbles) => {
        const seen = new Set();
        return marbles.filter((marble) => {
          if (marble.type !== 'next') return true;
          if (seen.has(marble.value)) return false;
          seen.add(marble.value);
          return true;
        });
      },
    },

    // Utility Operators
    {
      id: 'delay',
      name: 'delay',
      category: 'utility',
      description: 'Delay emissions by specified time',
      syntax: 'delay(milliseconds)',
      transform: (marbles, config = { delay: 1000 }) =>
        marbles.map((marble) => ({
          ...marble,
          time: marble.time + Number(config.delay),
          id: `${marble.id}_delayed`,
        })),
      config: {
        delay: { type: 'number', default: 1000, min: 100, max: 3000 },
      },
    },
    {
      id: 'tap',
      name: 'tap',
      category: 'utility',
      description: 'Perform side effects without changing values',
      syntax: 'tap(value => console.log(value))',
      transform: (marbles) => marbles.map((marble) => ({ ...marble, id: `${marble.id}_tapped` })),
    },
  ];

  const getOperatorsByCategory = (category: string) =>
    operatorDefinitions.filter((op) => op.category === category);

  const categories = [
    { id: 'transformation', name: 'Transformation', color: 'blue', icon: '🔄' },
    { id: 'filtering', name: 'Filtering', color: 'green', icon: '🔍' },
    { id: 'utility', name: 'Utility', color: 'orange', icon: '🛠️' },
  ];

  // Parse input values
  const parseInput = useCallback((): MarbleData[] => {
    try {
      const values = customInput.split(',').map((v) => v.trim());
      const inputValues = values.map((value, index) => ({
        id: `input_${index}`,
        time: (index + 1) * 800,
        value: isNaN(Number(value)) ? value : Number(value),
        type: 'next' as const,
      }));

      const completeMarble: MarbleData = {
        id: 'complete',
        time: (values.length + 1) * 800,
        value: 'complete',
        type: 'complete',
      };

      return [...inputValues, completeMarble];
    } catch {
      return [
        { id: 'input_0', time: 800, value: 1, type: 'next' },
        { id: 'input_1', time: 1600, value: 2, type: 'next' },
        { id: 'input_2', time: 2400, value: 3, type: 'next' },
        { id: 'complete', time: 3200, value: 'complete', type: 'complete' },
      ];
    }
  }, [customInput]);

  // Apply operator chain to input
  const applyOperatorChain = useCallback(
    (inputMarbles: MarbleData[]): MarbleData[][] => {
      const streams = [inputMarbles];
      let currentStream = inputMarbles;

      for (const chainItem of operatorChain) {
        const transformedStream = chainItem.operator.transform(currentStream, chainItem.config);
        streams.push(transformedStream);
        currentStream = transformedStream;
      }

      return streams;
    },
    [operatorChain]
  );

  const inputMarbles = parseInput();
  const allStreams = applyOperatorChain(inputMarbles);

  // Animation logic
  React.useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime((prevTime) => {
          const nextTime = prevTime + 50 * animationSpeed;
          return nextTime >= totalDuration ? 0 : nextTime;
        });
      }, 50);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, animationSpeed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const addOperator = (operator: OperatorDefinition) => {
    const defaultConfig: Record<string, ConfigValue> = {};
    if (operator.config) {
      Object.entries(operator.config).forEach(([key, configDef]) => {
        defaultConfig[key] = configDef.default;
      });
    }

    const newChainItem: OperatorChain = {
      id: `${operator.id}_${Date.now()}`,
      operator,
      config: defaultConfig,
    };

    setOperatorChain((prev) => [...prev, newChainItem]);
    setCurrentTime(0);
  };

  const removeOperator = (chainId: string) => {
    setOperatorChain((prev) => prev.filter((item) => item.id !== chainId));
    setCurrentTime(0);
  };

  const updateOperatorConfig = (chainId: string, configKey: string, value: ConfigValue) => {
    setOperatorChain((prev) =>
      prev.map((item) =>
        item.id === chainId ? { ...item, config: { ...item.config, [configKey]: value } } : item
      )
    );
    setCurrentTime(0);
  };

  const getTimelinePosition = (time: number) => {
    return startX + Math.min(time / totalDuration, 1) * timelineWidth;
  };

  const exportDiagram = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = 'operators-chain.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    }
  };

  const getStreamColor = (streamIndex: number) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return colors[streamIndex % colors.length];
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Interactive RxJS Operators Pipeline
          </h3>
          <p className="text-sm text-gray-600">
            Build operator chains and see real-time transformations of your data stream
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={exportDiagram}
            className="flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className="flex items-center justify-center w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center justify-center w-10 h-10 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input Configuration */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Input Values (comma-separated):
        </label>
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="1,2,3,4,5"
        />
      </div>

      {/* Operator Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Available Operators</h4>
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-500 text-white`
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === category.id
                      ? category.color === 'blue'
                        ? '#3b82f6'
                        : category.color === 'green'
                          ? '#10b981'
                          : '#f59e0b'
                      : undefined,
                }}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {getOperatorsByCategory(selectedCategory).map((operator) => (
            <div
              key={operator.id}
              className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => addOperator(operator)}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-900">{operator.name}()</h5>
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-600 mb-1">{operator.description}</p>
              <code className="text-xs text-purple-600 bg-purple-50 px-1 py-0.5 rounded">
                {operator.syntax}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Current Operator Chain */}
      {operatorChain.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Operator Chain</h4>
          <div className="flex flex-wrap gap-2">
            {operatorChain.map((chainItem, index) => (
              <div
                key={chainItem.id}
                className="flex items-center bg-purple-100 border border-purple-200 rounded-lg px-3 py-2"
              >
                <span className="text-sm font-medium text-purple-800">
                  {index + 1}. {chainItem.operator.name}()
                </span>
                {chainItem.operator.config && (
                  <button
                    onClick={() => setShowConfig(showConfig === chainItem.id ? null : chainItem.id)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => removeOperator(chainItem.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Configuration Panel */}
          {showConfig && (
            <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg">
              {(() => {
                const chainItem = operatorChain.find((item) => item.id === showConfig);
                if (!chainItem?.operator.config) return null;

                return (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">
                      Configure {chainItem.operator.name}()
                    </h5>
                    <div className="space-y-3">
                      {Object.entries(chainItem.operator.config).map(([key, configDef]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {key}
                          </label>
                          {configDef.type === 'number' ? (
                            <input
                              type="number"
                              value={Number(chainItem.config[key])}
                              onChange={(e) =>
                                updateOperatorConfig(chainItem.id, key, Number(e.target.value))
                              }
                              min={configDef.min}
                              max={configDef.max}
                              step="0.1"
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : configDef.type === 'string' && configDef.options ? (
                            <select
                              value={String(chainItem.config[key])}
                              onChange={(e) =>
                                updateOperatorConfig(chainItem.id, key, e.target.value)
                              }
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                            >
                              {configDef.options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={String(chainItem.config[key])}
                              onChange={(e) =>
                                updateOperatorConfig(chainItem.id, key, e.target.value)
                              }
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Visualization */}
      <div className="relative">
        <svg ref={svgRef} width={width} height={height} className="overflow-visible">
          {/* Time Progress Indicator */}
          <line
            x1={getTimelinePosition(currentTime)}
            y1={20}
            x2={getTimelinePosition(currentTime)}
            y2={height - 20}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity="0.8"
          />

          {/* Stream Visualizations */}
          {allStreams.map((stream, streamIndex) => {
            const yPos = 80 + streamIndex * streamHeight;
            const streamColor = getStreamColor(streamIndex);
            const streamName =
              streamIndex === 0
                ? 'Input Stream'
                : `After ${operatorChain[streamIndex - 1]?.operator.name}()`;

            return (
              <g key={streamIndex}>
                {/* Stream label */}
                <text x={20} y={yPos - 10} fontSize="12" fontWeight="bold" fill={streamColor}>
                  {streamName}
                </text>

                {/* Timeline */}
                <line
                  x1={startX}
                  y1={yPos}
                  x2={startX + timelineWidth}
                  y2={yPos}
                  stroke={streamColor}
                  strokeWidth="3"
                />

                {/* Time markers (only for first stream) */}
                {streamIndex === 0 &&
                  [0, 1000, 2000, 3000, 4000, 5000, 6000].map((time) => (
                    <g key={time}>
                      <line
                        x1={getTimelinePosition(time)}
                        y1={yPos - 5}
                        x2={getTimelinePosition(time)}
                        y2={yPos + 5}
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                      <text
                        x={getTimelinePosition(time)}
                        y={yPos + 20}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#6b7280"
                      >
                        {time}ms
                      </text>
                    </g>
                  ))}

                {/* Marbles */}
                {stream.map((marble) => {
                  const marbleX = getTimelinePosition(marble.time);
                  const isVisible = currentTime >= marble.time;
                  const marbleColor =
                    marble.type === 'complete'
                      ? '#10b981'
                      : marble.type === 'error'
                        ? '#ef4444'
                        : streamColor;

                  if (marbleX > startX + timelineWidth) return null;

                  return (
                    <g key={marble.id}>
                      <circle
                        cx={marbleX}
                        cy={yPos}
                        r="12"
                        fill={marbleColor}
                        stroke="white"
                        strokeWidth="2"
                        opacity={isVisible ? 1 : 0.3}
                      />

                      <text
                        x={marbleX}
                        y={yPos + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="white"
                      >
                        {marble.type === 'complete'
                          ? '|'
                          : marble.type === 'error'
                            ? 'X'
                            : marble.value}
                      </text>

                      {/* Animation ring */}
                      {isVisible && (
                        <circle
                          cx={marbleX}
                          cy={yPos}
                          r="12"
                          fill="none"
                          stroke={marbleColor}
                          strokeWidth="2"
                          opacity="0"
                        >
                          <animate attributeName="r" values="12;18;12" dur="0.6s" begin="0s" />
                          <animate
                            attributeName="opacity"
                            values="0.8;0;0.8"
                            dur="0.6s"
                            begin="0s"
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}

                {/* Operator visualization between streams */}
                {streamIndex > 0 && operatorChain[streamIndex - 1] && (
                  <g>
                    <rect
                      x={startX + timelineWidth / 2 - 80}
                      y={yPos - streamHeight / 2 - 10}
                      width="160"
                      height="20"
                      fill="#8b5cf6"
                      rx="10"
                      opacity="0.9"
                    />
                    <text
                      x={startX + timelineWidth / 2}
                      y={yPos - streamHeight / 2 + 3}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="white"
                    >
                      {operatorChain[streamIndex - 1].operator.name}()
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Info Panel */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">How to Use</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Select operator categories and click operators to add them to your chain</li>
          <li>• Configure operators using the settings icon in the chain</li>
          <li>• Modify input values to see how operators transform different data</li>
          <li>• Watch the real-time animation to understand operator behavior</li>
          <li>• Export your operator chain diagram for documentation</li>
        </ul>
      </div>
    </div>
  );
};

export default Operators2D;
