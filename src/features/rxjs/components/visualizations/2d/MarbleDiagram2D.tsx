import React, { useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Download, Settings } from 'lucide-react';

interface MarbleData {
  id: string;
  time: number;
  value: string | number;
  type: 'next' | 'error' | 'complete';
  color?: string;
}

interface StreamData {
  id: string;
  name: string;
  marbles: MarbleData[];
  color: string;
}

interface OperatorConfig {
  name: string;
  transform: (marbles: MarbleData[]) => MarbleData[];
  description: string;
}

interface MarbleDiagram2DProps {
  streams?: StreamData[];
  operators?: OperatorConfig[];
  autoPlay?: boolean;
  animationSpeed?: number;
  width?: number;
  height?: number;
  className?: string;
  onMarbleClick?: (marble: MarbleData) => void;
  onOperatorSelect?: (operator: string) => void;
  showGrid?: boolean;
  timeScale?: number;
}

const MarbleDiagram2D: React.FC<MarbleDiagram2DProps> = ({
  streams: initialStreams = [
    {
      id: 'input',
      name: 'Input Stream',
      marbles: [
        { id: '1', time: 1000, value: 1, type: 'next' },
        { id: '2', time: 2000, value: 2, type: 'next' },
        { id: '3', time: 3000, value: 3, type: 'next' },
        { id: '4', time: 4000, value: 4, type: 'next' },
        { id: '5', time: 5000, value: 'complete', type: 'complete' },
      ],
      color: '#3b82f6',
    },
  ],
  operators: availableOperators = [
    {
      name: 'map(x => x * 2)',
      transform: (marbles) =>
        marbles.map((marble) => ({
          ...marble,
          value: marble.type === 'next' ? Number(marble.value) * 2 : marble.value,
          id: `${marble.id}_mapped`,
        })),
      description: 'Transforms each value by multiplying by 2',
    },
    {
      name: 'filter(x => x > 2)',
      transform: (marbles) =>
        marbles.filter((marble) => marble.type !== 'next' || Number(marble.value) > 2),
      description: 'Filters values greater than 2',
    },
    {
      name: 'take(3)',
      transform: (marbles) => {
        let count = 0;
        return marbles.reduce((acc: MarbleData[], marble) => {
          if (marble.type === 'next' && count < 3) {
            count++;
            acc.push(marble);
          } else if (marble.type !== 'next') {
            acc.push(marble);
          }
          return acc;
        }, []);
      },
      description: 'Takes only the first 3 values',
    },
  ],
  autoPlay = true,
  animationSpeed = 1,
  width = 800,
  height = 400,
  className = '',
  onMarbleClick,
  onOperatorSelect,
  showGrid = true,
  timeScale = 5000,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedOperator, setSelectedOperator] = useState<OperatorConfig | null>(null);
  const [streams] = useState(initialStreams);
  const [showSettings, setShowSettings] = useState(false);
  const [currentAnimationSpeed, setCurrentAnimationSpeed] = useState(animationSpeed);
  const [currentShowGrid, setCurrentShowGrid] = useState(showGrid);
  const intervalRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const streamHeight = 80;
  const timelineStart = 100;
  const timelineWidth = width - 200;

  // Create output stream based on selected operator
  const outputStream: StreamData | null = selectedOperator
    ? {
        id: 'output',
        name: `Output (${selectedOperator.name})`,
        marbles: selectedOperator.transform(streams[0]?.marbles || []),
        color: '#10b981',
      }
    : null;

  const allStreams = outputStream ? [...streams, outputStream] : streams;

  React.useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime((prevTime) => {
          const nextTime = prevTime + 50 * currentAnimationSpeed;
          return nextTime >= timeScale ? 0 : nextTime;
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
  }, [isPlaying, currentAnimationSpeed, timeScale]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleOperatorSelect = (operator: OperatorConfig) => {
    setSelectedOperator(operator);
    if (onOperatorSelect) {
      onOperatorSelect(operator.name);
    }
    setCurrentTime(0);
  };

  const handleMarbleClick = (marble: MarbleData) => {
    if (onMarbleClick) {
      onMarbleClick(marble);
    }
  };

  const getTimelinePosition = (time: number) => {
    return timelineStart + (time / timeScale) * timelineWidth;
  };

  const exportDiagram = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = 'marble-diagram.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Marble Diagrams</h3>
          <p className="text-sm text-gray-600">
            Visualize stream behavior over time and see how operators transform data
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
              showSettings
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

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

      {/* Operator Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedOperator(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              !selectedOperator
                ? 'bg-gray-800 border-gray-800 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            No Operator
          </button>
          {availableOperators.map((operator) => (
            <button
              key={operator.name}
              onClick={() => handleOperatorSelect(operator)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedOperator?.name === operator.name
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {operator.name}
            </button>
          ))}
        </div>
        {selectedOperator && (
          <p className="text-sm text-gray-600 mt-2">{selectedOperator.description}</p>
        )}
      </div>

      {/* Visualization */}
      <div className="relative">
        <svg ref={svgRef} width={width} height={height} className="overflow-visible">
          {/* Grid */}
          {currentShowGrid && (
            <defs>
              <pattern id="grid" width="50" height="20" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </defs>
          )}

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

          {/* Stream Timelines */}
          {allStreams.map((stream, streamIndex) => {
            const yPos = 60 + streamIndex * streamHeight;

            return (
              <g key={stream.id}>
                {/* Stream label */}
                <text x={20} y={yPos + 5} fontSize="14" fontWeight="bold" fill={stream.color}>
                  {stream.name}
                </text>

                {/* Timeline */}
                <line
                  x1={timelineStart}
                  y1={yPos}
                  x2={timelineStart + timelineWidth}
                  y2={yPos}
                  stroke={stream.color}
                  strokeWidth="3"
                />

                {/* Time markers */}
                {[0, 1000, 2000, 3000, 4000, 5000].map((time) => (
                  <g key={time}>
                    <line
                      x1={getTimelinePosition(time)}
                      y1={yPos - 5}
                      x2={getTimelinePosition(time)}
                      y2={yPos + 5}
                      stroke="#9ca3af"
                      strokeWidth="1"
                    />
                    {streamIndex === 0 && (
                      <text
                        x={getTimelinePosition(time)}
                        y={yPos + 20}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#6b7280"
                      >
                        {time}ms
                      </text>
                    )}
                  </g>
                ))}

                {/* Marbles */}
                {stream.marbles.map((marble) => {
                  const marbleX = getTimelinePosition(marble.time);
                  const isVisible = currentTime >= marble.time;
                  const marbleColor =
                    marble.type === 'complete'
                      ? '#10b981'
                      : marble.type === 'error'
                        ? '#ef4444'
                        : marble.color || stream.color;

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
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleMarbleClick(marble)}
                      />

                      {/* Marble value */}
                      <text
                        x={marbleX}
                        y={yPos + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="white"
                        className="pointer-events-none"
                      >
                        {marble.type === 'complete'
                          ? '|'
                          : marble.type === 'error'
                            ? 'X'
                            : marble.value}
                      </text>

                      {/* Marble animation */}
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

                {/* Operator visualization */}
                {selectedOperator && streamIndex === 0 && (
                  <g>
                    <rect
                      x={timelineStart + timelineWidth / 2 - 60}
                      y={yPos + 25}
                      width="120"
                      height="30"
                      fill="#8b5cf6"
                      rx="15"
                      opacity="0.9"
                    />
                    <text
                      x={timelineStart + timelineWidth / 2}
                      y={yPos + 44}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="white"
                    >
                      {selectedOperator.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Legend */}
          <g transform={`translate(${timelineStart}, ${height - 40})`}>
            <text x="0" y="0" fontSize="12" fontWeight="bold" fill="#374151">
              Legend:
            </text>
            <circle cx="60" cy="-3" r="6" fill="#3b82f6" />
            <text x="72" y="0" fontSize="10" fill="#6b7280">
              Data
            </text>
            <circle cx="110" cy="-3" r="6" fill="#10b981" />
            <text x="122" y="0" fontSize="10" fill="#6b7280">
              Complete
            </text>
            <circle cx="180" cy="-3" r="6" fill="#ef4444" />
            <text x="192" y="0" fontSize="10" fill="#6b7280">
              Error
            </text>
          </g>
        </svg>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-3">Visualization Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animation Speed
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={currentAnimationSpeed}
                onChange={(e) => setCurrentAnimationSpeed(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{currentAnimationSpeed}x</span>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={currentShowGrid}
                  onChange={(e) => setCurrentShowGrid(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Show Grid</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">How to Use</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click operators to see how they transform the input stream</li>
          <li>• Click marbles to inspect their values</li>
          <li>• Use play/pause controls to control the animation</li>
          <li>• Export the diagram as SVG for documentation</li>
        </ul>
      </div>
    </div>
  );
};

export default MarbleDiagram2D;
