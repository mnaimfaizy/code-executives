import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Eye, EyeOff } from 'lucide-react';

interface EmissionData {
  id: string;
  time: number;
  value: string | number;
  type: 'next' | 'error' | 'complete';
}

interface SubscriberData {
  id: string;
  name: string;
  subscribeTime: number;
  unsubscribeTime?: number;
  color: string;
  active: boolean;
}

interface Observable2DProps {
  observableType?: 'hot' | 'cold';
  emissions?: EmissionData[];
  subscribers?: SubscriberData[];
  autoPlay?: boolean;
  animationSpeed?: number;
  width?: number;
  height?: number;
  className?: string;
}

const Observable2D: React.FC<Observable2DProps> = ({
  observableType = 'cold',
  emissions: initialEmissions = [
    { id: '1', time: 1000, value: 'A', type: 'next' },
    { id: '2', time: 2000, value: 'B', type: 'next' },
    { id: '3', time: 3000, value: 'C', type: 'next' },
    { id: '4', time: 4000, value: 'D', type: 'complete' },
  ],
  subscribers: initialSubscribers = [
    { id: 'sub1', name: 'Observer 1', subscribeTime: 0, color: '#3b82f6', active: true },
    { id: 'sub2', name: 'Observer 2', subscribeTime: 1500, color: '#10b981', active: true },
    { id: 'sub3', name: 'Observer 3', subscribeTime: 2500, color: '#f59e0b', active: false },
  ],
  autoPlay = true,
  animationSpeed = 1,
  width = 800,
  height = 400,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [observableTypeState, setObservableTypeState] = useState(observableType);
  const [subscribersState, setSubscribersState] = useState(initialSubscribers);
  const intervalRef = useRef<number | null>(null);

  const totalDuration = 5000; // 5 seconds
  const timelineWidth = width - 200;
  const subscriberHeight = 40;
  const startX = 100;
  const startY = 80;

  useEffect(() => {
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
  }, [isPlaying, animationSpeed, totalDuration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleTypeToggle = () => {
    setObservableTypeState(observableTypeState === 'hot' ? 'cold' : 'hot');
    handleReset();
  };

  const toggleSubscriber = (subscriberId: string) => {
    setSubscribersState((prev) =>
      prev.map((sub) => (sub.id === subscriberId ? { ...sub, active: !sub.active } : sub))
    );
  };

  const addSubscriber = () => {
    const newId = `sub${subscribersState.length + 1}`;
    const colors = ['#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];
    const color = colors[subscribersState.length % colors.length];

    const newSubscriber: SubscriberData = {
      id: newId,
      name: `Observer ${subscribersState.length + 1}`,
      subscribeTime: currentTime,
      color,
      active: true,
    };

    setSubscribersState((prev) => [...prev, newSubscriber]);
  };

  const getTimelinePosition = (time: number) => {
    return startX + (time / totalDuration) * timelineWidth;
  };

  const getEmissionOpacity = (emission: EmissionData, subscriber: SubscriberData) => {
    if (!subscriber.active) return 0.1;

    if (observableTypeState === 'hot') {
      // Hot observable: all active subscribers see all emissions after their subscription
      return subscriber.subscribeTime <= emission.time && currentTime >= emission.time ? 1 : 0.3;
    } else {
      // Cold observable: each subscriber gets their own stream starting from subscription
      const relativeEmissionTime = subscriber.subscribeTime + emission.time;
      return currentTime >= relativeEmissionTime ? 1 : 0.3;
    }
  };

  const getSubscriberStreamStart = (subscriber: SubscriberData) => {
    if (observableTypeState === 'hot') {
      return getTimelinePosition(subscriber.subscribeTime);
    }
    return startX;
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Observable Lifecycle Visualization
          </h3>
          <p className="text-sm text-gray-600">
            Visualize how {observableTypeState} observables emit values to subscribers over time
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleTypeToggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              observableTypeState === 'hot'
                ? 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100'
                : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
            }`}
          >
            {observableTypeState === 'hot' ? '🔥 Hot' : '❄️ Cold'}
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

          <button
            onClick={addSubscriber}
            className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visualization */}
      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          {/* Time Progress Indicator */}
          <line
            x1={getTimelinePosition(currentTime)}
            y1={startY - 20}
            x2={getTimelinePosition(currentTime)}
            y2={height - 40}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="4,4"
          >
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
          </line>

          {/* Main Timeline */}
          <g>
            {/* Timeline base */}
            <line
              x1={startX}
              y1={startY}
              x2={startX + timelineWidth}
              y2={startY}
              stroke="#374151"
              strokeWidth="3"
            />

            {/* Time markers */}
            {[0, 1000, 2000, 3000, 4000, 5000].map((time) => (
              <g key={time}>
                <line
                  x1={getTimelinePosition(time)}
                  y1={startY - 5}
                  x2={getTimelinePosition(time)}
                  y2={startY + 5}
                  stroke="#6b7280"
                  strokeWidth="2"
                />
                <text
                  x={getTimelinePosition(time)}
                  y={startY + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {time}ms
                </text>
              </g>
            ))}

            {/* Emissions on main timeline */}
            {initialEmissions.map((emission) => (
              <g key={emission.id}>
                <circle
                  cx={getTimelinePosition(emission.time)}
                  cy={startY}
                  r="8"
                  fill={
                    emission.type === 'complete'
                      ? '#10b981'
                      : emission.type === 'error'
                        ? '#ef4444'
                        : '#6366f1'
                  }
                  stroke="white"
                  strokeWidth="2"
                  opacity={currentTime >= emission.time ? 1 : 0.3}
                />
                <text
                  x={getTimelinePosition(emission.time)}
                  y={startY + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  {emission.type === 'complete'
                    ? '|'
                    : emission.type === 'error'
                      ? 'X'
                      : emission.value}
                </text>
              </g>
            ))}
          </g>

          {/* Subscriber Timelines */}
          {subscribersState.map((subscriber, index) => {
            const yPos = startY + 100 + index * (subscriberHeight + 20);

            return (
              <g key={subscriber.id}>
                {/* Subscriber timeline */}
                <line
                  x1={getSubscriberStreamStart(subscriber)}
                  y1={yPos}
                  x2={startX + timelineWidth}
                  y2={yPos}
                  stroke={subscriber.active ? subscriber.color : '#d1d5db'}
                  strokeWidth="2"
                  opacity={subscriber.active ? 0.8 : 0.3}
                  strokeDasharray={subscriber.active ? 'none' : '5,5'}
                />

                {/* Subscription point */}
                <circle
                  cx={getTimelinePosition(subscriber.subscribeTime)}
                  cy={yPos}
                  r="6"
                  fill={subscriber.color}
                  stroke="white"
                  strokeWidth="2"
                  opacity={subscriber.active ? 1 : 0.3}
                />

                {/* Subscriber label */}
                <text
                  x={20}
                  y={yPos + 4}
                  fontSize="12"
                  fill={subscriber.active ? subscriber.color : '#9ca3af'}
                  fontWeight="medium"
                >
                  {subscriber.name}
                </text>

                {/* Toggle button */}
                <foreignObject x={startX + timelineWidth + 20} y={yPos - 12} width="24" height="24">
                  <button
                    onClick={() => toggleSubscriber(subscriber.id)}
                    className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                      subscriber.active
                        ? 'bg-green-100 hover:bg-green-200 text-green-600'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-400'
                    }`}
                  >
                    {subscriber.active ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </button>
                </foreignObject>

                {/* Emissions for this subscriber */}
                {initialEmissions.map((emission) => {
                  const emissionX =
                    observableTypeState === 'hot'
                      ? getTimelinePosition(emission.time)
                      : getTimelinePosition(subscriber.subscribeTime + emission.time);

                  const shouldShow =
                    observableTypeState === 'hot'
                      ? subscriber.subscribeTime <= emission.time
                      : true;

                  if (!shouldShow || emissionX > startX + timelineWidth) return null;

                  return (
                    <g key={`${subscriber.id}-${emission.id}`}>
                      <circle
                        cx={emissionX}
                        cy={yPos}
                        r="6"
                        fill={
                          emission.type === 'complete'
                            ? '#10b981'
                            : emission.type === 'error'
                              ? '#ef4444'
                              : subscriber.color
                        }
                        stroke="white"
                        strokeWidth="1"
                        opacity={getEmissionOpacity(emission, subscriber)}
                      />
                      <text
                        x={emissionX}
                        y={yPos + 3}
                        textAnchor="middle"
                        fontSize="8"
                        fill="white"
                        fontWeight="bold"
                      >
                        {emission.type === 'complete'
                          ? '|'
                          : emission.type === 'error'
                            ? 'X'
                            : emission.value}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Legend */}
          <g transform={`translate(${startX}, ${height - 60})`}>
            <text x="0" y="0" fontSize="12" fontWeight="bold" fill="#374151">
              Legend:
            </text>
            <circle cx="60" cy="-3" r="4" fill="#6366f1" />
            <text x="70" y="0" fontSize="10" fill="#6b7280">
              Data
            </text>
            <circle cx="110" cy="-3" r="4" fill="#10b981" />
            <text x="120" y="0" fontSize="10" fill="#6b7280">
              Complete
            </text>
            <circle cx="180" cy="-3" r="4" fill="#ef4444" />
            <text x="190" y="0" fontSize="10" fill="#6b7280">
              Error
            </text>
            <text x="230" y="0" fontSize="10" fill="#6b7280">
              {observableTypeState === 'hot'
                ? 'Hot: Shared stream timeline'
                : 'Cold: Individual streams per subscriber'}
            </text>
          </g>
        </svg>
      </div>

      {/* Info Panel */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              {observableTypeState === 'hot' ? '🔥 Hot Observable' : '❄️ Cold Observable'}
            </h4>
            <p className="text-sm text-gray-600">
              {observableTypeState === 'hot'
                ? 'Emits values regardless of subscribers. Late subscribers miss early emissions.'
                : 'Creates a new execution for each subscriber. All subscribers get the full sequence.'}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Current Time</h4>
            <p className="text-sm text-gray-600">
              {Math.round(currentTime)}ms / {totalDuration}ms
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / totalDuration) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Observable2D;
