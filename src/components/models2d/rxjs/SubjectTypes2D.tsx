import React, { useState, useRef } from 'react';
import { Play, Pause, RotateCcw, UserPlus } from 'lucide-react';

interface SubjectValue {
  id: string;
  time: number;
  value: string | number;
  type: 'next' | 'complete' | 'error';
}

interface Subscriber {
  id: string;
  name: string;
  subscribeTime: number;
  unsubscribeTime?: number;
  color: string;
  active: boolean;
  receivedValues: SubjectValue[];
}

type SubjectType = 'Subject' | 'BehaviorSubject' | 'ReplaySubject' | 'AsyncSubject';

interface SubjectTypes2DProps {
  subjectType?: SubjectType;
  initialValues?: SubjectValue[];
  initialSubscribers?: Subscriber[];
  replayBufferSize?: number;
  autoPlay?: boolean;
  animationSpeed?: number;
  width?: number;
  height?: number;
  className?: string;
}

const SubjectTypes2D: React.FC<SubjectTypes2DProps> = ({
  subjectType: initialSubjectType = 'Subject',
  initialValues = [
    { id: '1', time: 1000, value: 'A', type: 'next' },
    { id: '2', time: 2000, value: 'B', type: 'next' },
    { id: '3', time: 3000, value: 'C', type: 'next' },
    { id: '4', time: 4500, value: 'D', type: 'next' },
    { id: '5', time: 6000, value: 'complete', type: 'complete' },
  ],
  initialSubscribers = [
    {
      id: 'sub1',
      name: 'Sub 1',
      subscribeTime: 0,
      color: '#3b82f6',
      active: true,
      receivedValues: [],
    },
    {
      id: 'sub2',
      name: 'Sub 2',
      subscribeTime: 1500,
      color: '#10b981',
      active: true,
      receivedValues: [],
    },
    {
      id: 'sub3',
      name: 'Sub 3',
      subscribeTime: 3500,
      color: '#f59e0b',
      active: true,
      receivedValues: [],
    },
  ],
  replayBufferSize = 2,
  autoPlay = true,
  animationSpeed = 1,
  width = 900,
  height = 500,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [subjectType, setSubjectType] = useState<SubjectType>(initialSubjectType);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [emittedValues, setEmittedValues] = useState<SubjectValue[]>([]);
  const intervalRef = useRef<number | null>(null);

  const totalDuration = 7000; // 7 seconds
  const timelineWidth = width - 200;
  const startX = 100;
  const centerY = 120;
  const subscriberRadius = 60;

  React.useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime((prevTime) => {
          const nextTime = prevTime + 50 * animationSpeed;
          if (nextTime >= totalDuration) {
            return 0;
          }
          return nextTime;
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

  // Update emitted values and subscriber values based on current time
  React.useEffect(() => {
    const currentEmitted = initialValues.filter((v) => v.time <= currentTime);
    setEmittedValues(currentEmitted);

    // Update each subscriber's received values based on subject type
    setSubscribers((prev) =>
      prev.map((subscriber) => {
        if (!subscriber.active) return subscriber;

        let receivedValues: SubjectValue[] = [];

        switch (subjectType) {
          case 'Subject':
            // Basic Subject: Only values emitted after subscription
            receivedValues = currentEmitted.filter((v) => v.time >= subscriber.subscribeTime);
            break;

          case 'BehaviorSubject': {
            // BehaviorSubject: Current value + values after subscription
            const valuesAfterSub = currentEmitted.filter((v) => v.time >= subscriber.subscribeTime);
            const latestBeforeSub = currentEmitted
              .filter((v) => v.time < subscriber.subscribeTime && v.type === 'next')
              .slice(-1);
            receivedValues = [...latestBeforeSub, ...valuesAfterSub];
            break;
          }

          case 'ReplaySubject': {
            // ReplaySubject: Last N values + values after subscription
            const valuesAfterSubReplay = currentEmitted.filter(
              (v) => v.time >= subscriber.subscribeTime
            );
            const replayValues = currentEmitted
              .filter((v) => v.time < subscriber.subscribeTime && v.type === 'next')
              .slice(-replayBufferSize);
            receivedValues = [...replayValues, ...valuesAfterSubReplay];
            break;
          }

          case 'AsyncSubject':
            // AsyncSubject: Only the final value when complete
            if (
              currentEmitted.some((v) => v.type === 'complete') &&
              subscriber.subscribeTime < currentTime
            ) {
              const lastValue = currentEmitted.filter((v) => v.type === 'next').slice(-1);
              const completion = currentEmitted.filter((v) => v.type === 'complete');
              receivedValues = [...lastValue, ...completion];
            }
            break;
        }

        return { ...subscriber, receivedValues };
      })
    );
  }, [currentTime, subjectType, replayBufferSize, initialValues]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleSubjectTypeChange = (type: SubjectType) => {
    setSubjectType(type);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const addSubscriber = () => {
    const colors = ['#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];
    const newId = `sub${subscribers.length + 1}`;
    const newSubscriber: Subscriber = {
      id: newId,
      name: `Sub ${subscribers.length + 1}`,
      subscribeTime: currentTime,
      color: colors[subscribers.length % colors.length],
      active: true,
      receivedValues: [],
    };
    setSubscribers((prev) => [...prev, newSubscriber]);
  };

  const toggleSubscriber = (subscriberId: string) => {
    setSubscribers((prev) =>
      prev.map((sub) => (sub.id === subscriberId ? { ...sub, active: !sub.active } : sub))
    );
  };

  const getTimelinePosition = (time: number) => {
    return startX + (time / totalDuration) * timelineWidth;
  };

  const getSubscriberPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 150;
    return {
      x: width / 2 + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  };

  const getSubjectTypeColor = (type: SubjectType) => {
    switch (type) {
      case 'Subject':
        return '#6b7280';
      case 'BehaviorSubject':
        return '#3b82f6';
      case 'ReplaySubject':
        return '#8b5cf6';
      case 'AsyncSubject':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getSubjectTypeDescription = (type: SubjectType) => {
    switch (type) {
      case 'Subject':
        return 'Basic multicast observable. No replay behavior.';
      case 'BehaviorSubject':
        return 'Stores current value. New subscribers get the latest value immediately.';
      case 'ReplaySubject':
        return `Stores last ${replayBufferSize} values. New subscribers get replayed values.`;
      case 'AsyncSubject':
        return 'Only emits the final value when the sequence completes.';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Subject Types Behavior</h3>
          <p className="text-sm text-gray-600">
            Compare how different Subject types handle subscription timing and value replay
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={addSubscriber}
            className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
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

      {/* Subject Type Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {(['Subject', 'BehaviorSubject', 'ReplaySubject', 'AsyncSubject'] as SubjectType[]).map(
            (type) => (
              <button
                key={type}
                onClick={() => handleSubjectTypeChange(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  subjectType === type
                    ? `bg-${getSubjectTypeColor(type).slice(1)} border-${getSubjectTypeColor(type).slice(1)} text-white`
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: subjectType === type ? getSubjectTypeColor(type) : undefined,
                  borderColor: subjectType === type ? getSubjectTypeColor(type) : undefined,
                }}
              >
                {type}
              </button>
            )
          )}
        </div>
        <p className="text-sm text-gray-600">{getSubjectTypeDescription(subjectType)}</p>
      </div>

      {/* Visualization */}
      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          {/* Time Progress Indicator */}
          <line
            x1={getTimelinePosition(currentTime)}
            y1={30}
            x2={getTimelinePosition(currentTime)}
            y2={70}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="4,4"
          />

          {/* Main Timeline */}
          <g>
            <text x={startX} y={25} fontSize="12" fontWeight="bold" fill="#374151">
              Subject Timeline
            </text>

            {/* Timeline base */}
            <line
              x1={startX}
              y1={50}
              x2={startX + timelineWidth}
              y2={50}
              stroke="#374151"
              strokeWidth="3"
            />

            {/* Time markers */}
            {[0, 1000, 2000, 3000, 4000, 5000, 6000, 7000].map((time) => (
              <g key={time}>
                <line
                  x1={getTimelinePosition(time)}
                  y1={45}
                  x2={getTimelinePosition(time)}
                  y2={55}
                  stroke="#6b7280"
                  strokeWidth="2"
                />
                <text
                  x={getTimelinePosition(time)}
                  y={75}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {time}ms
                </text>
              </g>
            ))}

            {/* Subject emissions */}
            {initialValues.map((value) => (
              <g key={value.id}>
                <circle
                  cx={getTimelinePosition(value.time)}
                  cy={50}
                  r="8"
                  fill={
                    value.type === 'complete'
                      ? '#10b981'
                      : value.type === 'error'
                        ? '#ef4444'
                        : getSubjectTypeColor(subjectType)
                  }
                  stroke="white"
                  strokeWidth="2"
                  opacity={currentTime >= value.time ? 1 : 0.3}
                />
                <text
                  x={getTimelinePosition(value.time)}
                  y={55}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  {value.type === 'complete' ? '|' : value.type === 'error' ? 'X' : value.value}
                </text>
              </g>
            ))}
          </g>

          {/* Central Subject Node */}
          <g>
            <circle
              cx={width / 2}
              cy={centerY}
              r="40"
              fill={getSubjectTypeColor(subjectType)}
              stroke="white"
              strokeWidth="4"
              opacity="0.9"
            />
            <text
              x={width / 2}
              y={centerY - 5}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="white"
            >
              {subjectType}
            </text>
            <text x={width / 2} y={centerY + 8} textAnchor="middle" fontSize="8" fill="white">
              Subject
            </text>

            {/* Buffer visualization for ReplaySubject */}
            {subjectType === 'ReplaySubject' && (
              <g>
                <rect
                  x={width / 2 - 25}
                  y={centerY + 50}
                  width="50"
                  height="20"
                  fill="#8b5cf6"
                  rx="10"
                  opacity="0.8"
                />
                <text
                  x={width / 2}
                  y={centerY + 63}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  Buffer: {replayBufferSize}
                </text>
              </g>
            )}

            {/* Current value indicator for BehaviorSubject */}
            {subjectType === 'BehaviorSubject' && emittedValues.length > 0 && (
              <g>
                <circle
                  cx={width / 2}
                  cy={centerY - 60}
                  r="15"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.9"
                />
                <text
                  x={width / 2}
                  y={centerY - 55}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  {emittedValues.filter((v) => v.type === 'next').slice(-1)[0]?.value || ''}
                </text>
                <text
                  x={width / 2}
                  y={centerY - 75}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#3b82f6"
                  fontWeight="bold"
                >
                  Current Value
                </text>
              </g>
            )}
          </g>

          {/* Subscribers */}
          {subscribers.map((subscriber, index) => {
            const position = getSubscriberPosition(index, subscribers.length);
            const isSubscribed = currentTime >= subscriber.subscribeTime;

            return (
              <g key={subscriber.id}>
                {/* Connection line to subject */}
                {isSubscribed && subscriber.active && (
                  <line
                    x1={position.x}
                    y1={position.y}
                    x2={width / 2}
                    y2={centerY}
                    stroke={subscriber.color}
                    strokeWidth="2"
                    opacity="0.6"
                    strokeDasharray="5,5"
                  />
                )}

                {/* Subscriber node */}
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={subscriberRadius / 2}
                  fill={subscriber.active ? subscriber.color : '#d1d5db'}
                  stroke="white"
                  strokeWidth="3"
                  opacity={isSubscribed && subscriber.active ? 1 : 0.5}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => toggleSubscriber(subscriber.id)}
                />

                {/* Subscriber name */}
                <text
                  x={position.x}
                  y={position.y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="white"
                  className="pointer-events-none"
                >
                  {subscriber.name}
                </text>

                {/* Subscription time marker */}
                <text
                  x={position.x}
                  y={position.y + 45}
                  textAnchor="middle"
                  fontSize="9"
                  fill={subscriber.color}
                  fontWeight="medium"
                >
                  @{subscriber.subscribeTime}ms
                </text>

                {/* Received values */}
                <g>
                  {subscriber.receivedValues.map((value, valueIndex) => {
                    const valueY = position.y - 45 - valueIndex * 18;
                    return (
                      <g key={`${subscriber.id}-${value.id}`}>
                        <circle
                          cx={position.x}
                          cy={valueY}
                          r="8"
                          fill={
                            value.type === 'complete'
                              ? '#10b981'
                              : value.type === 'error'
                                ? '#ef4444'
                                : subscriber.color
                          }
                          stroke="white"
                          strokeWidth="1"
                          opacity="0.9"
                        />
                        <text
                          x={position.x}
                          y={valueY + 3}
                          textAnchor="middle"
                          fontSize="8"
                          fill="white"
                          fontWeight="bold"
                        >
                          {value.type === 'complete'
                            ? '|'
                            : value.type === 'error'
                              ? 'X'
                              : value.value}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </g>
            );
          })}

          {/* Legend */}
          <g transform={`translate(20, ${height - 60})`}>
            <text x="0" y="0" fontSize="12" fontWeight="bold" fill="#374151">
              Legend:
            </text>
            <circle cx="60" cy="-3" r="6" fill={getSubjectTypeColor(subjectType)} />
            <text x="72" y="0" fontSize="10" fill="#6b7280">
              Subject Value
            </text>
            <circle cx="160" cy="-3" r="6" fill="#3b82f6" />
            <text x="172" y="0" fontSize="10" fill="#6b7280">
              Subscriber
            </text>
            <line
              x1="240"
              y1="-3"
              x2="260"
              y2="-3"
              stroke="#6b7280"
              strokeWidth="2"
              strokeDasharray="3,3"
            />
            <text x="270" y="0" fontSize="10" fill="#6b7280">
              Active Connection
            </text>
          </g>
        </svg>
      </div>

      {/* Info Panel */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Current Configuration</h4>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Subject Type:</strong> {subjectType}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Active Subscribers:</strong> {subscribers.filter((s) => s.active).length}/
              {subscribers.length}
            </p>
            {subjectType === 'ReplaySubject' && (
              <p className="text-sm text-gray-600">
                <strong>Replay Buffer:</strong> {replayBufferSize} values
              </p>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Current Time</h4>
            <p className="text-sm text-gray-600 mb-2">
              {Math.round(currentTime)}ms / {totalDuration}ms
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
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

export default SubjectTypes2D;
