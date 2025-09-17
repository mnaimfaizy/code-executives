import React from 'react';

const VIEWBOX_W = 800;
const VIEWBOX_H = 420;

interface EventLoop2DProps {
  callStack: string[];
  microtasks: string[];
  macrotasks: string[];
  animating?: {
    type: 'pop' | 'push' | 'source';
    label?: string;
    source?: 'micro' | 'macro';
  };
  activeLight?: 'green' | 'yellow' | 'red';
  activeBlock?: 'stack' | 'micro' | 'macro' | 'eventloop';
}

const EventLoop2D: React.FC<EventLoop2DProps> = ({
  callStack,
  microtasks,
  macrotasks,
  animating,
  activeLight,
  activeBlock,
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'stretch',
        position: 'relative',
      }}
    >
      {/* Tooltip element moved outside SVG */}
      <div
        id="eventloop-tooltip"
        style={{
          position: 'absolute',
          display: 'none',
          background: 'rgba(30,41,59,0.95)',
          color: 'white',
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '15px',
          pointerEvents: 'none',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          maxWidth: '300px',
          wordWrap: 'break-word',
        }}
      />
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        style={{ width: '100%', height: '100%', background: '#f8fafc', borderRadius: 24 }}
      >
        {/* Title */}
        <text
          x={40}
          y={48}
          fontSize="32"
          fontWeight="700"
          fill="#6366f1"
          style={{ letterSpacing: 1 }}
        >
          Event Loop
        </text>
        <text x={40} y={78} fontSize="16" fill="#64748b">
          JavaScript Execution Model Visualization
        </text>

        {/* Layout variables for lower positioning */}
        {(() => {
          // Move blocks lower and center EventLoop
          const baseY = 160;
          const stackX = 80;
          const queueX = 550;
          const blockW = 120;
          const blockH = 48;
          const stackY = baseY;
          const microY = baseY + 110;
          const macroY = baseY - 110;
          const eventLoopX = (stackX + blockW + queueX) / 2 + 25;
          const eventLoopY = baseY + 70;
          return (
            <g>
              {/* Call Stack */}
              <g>
                <rect
                  x={stackX}
                  y={stackY}
                  width={blockW}
                  height={blockH * 4}
                  rx={18}
                  fill="#eef2ff"
                  stroke={activeBlock === 'stack' ? '#22c55e' : '#6366f1'}
                  strokeWidth={activeBlock === 'stack' ? 6 : 3}
                  style={{
                    filter:
                      activeBlock === 'stack'
                        ? 'drop-shadow(0 0 16px #22c55e88)'
                        : 'drop-shadow(0 2px 8px #6366f133)',
                  }}
                  onMouseOver={(e) => {
                    const tooltip = document.getElementById('eventloop-tooltip');
                    if (tooltip) {
                      tooltip.textContent = 'Call Stack: Executes synchronous code (LIFO).';
                      tooltip.style.display = 'block';
                      const rect = e.currentTarget.getBoundingClientRect();
                      tooltip.style.left = `${rect.right + 12}px`;
                      tooltip.style.top = `${rect.top}px`;
                    }
                  }}
                  onMouseOut={() => {
                    const tooltip = document.getElementById('eventloop-tooltip');
                    if (tooltip) tooltip.style.display = 'none';
                  }}
                />
                <text
                  x={stackX + blockW / 2}
                  y={stackY - 22}
                  textAnchor="middle"
                  fontSize="22"
                  fontWeight="700"
                  fill="#6366f1"
                  style={{ letterSpacing: 1 }}
                >
                  Call Stack
                </text>
                {callStack.map((item, i) => (
                  <g key={item}>
                    <rect
                      x={stackX + 8}
                      y={stackY + blockH * (3 - i) + 8}
                      width={blockW - 16}
                      height={blockH - 16}
                      rx={10}
                      fill="#6366f1"
                      opacity={
                        animating?.type === 'pop' && animating.label === item
                          ? 0.3
                          : animating?.type === 'push' && animating.label === item
                            ? 1
                            : 0.95 - i * 0.15
                      }
                      style={{
                        transition: 'all 0.5s ease-in-out',
                        transform:
                          animating?.type === 'pop' && animating.label === item
                            ? 'translateY(-20px) scale(0.9)'
                            : animating?.type === 'push' && animating.label === item
                              ? 'scale(1.1)'
                              : 'none',
                        filter:
                          animating?.type === 'push' && animating.label === item
                            ? 'drop-shadow(0 0 12px #6366f1aa)'
                            : 'none',
                      }}
                    />
                    <text
                      x={stackX + blockW / 2}
                      y={stackY + blockH * (3 - i) + 32}
                      textAnchor="middle"
                      fontSize="15"
                      fontWeight="600"
                      fill="white"
                      style={{
                        transition: 'opacity 0.5s',
                        opacity: animating?.type === 'pop' && animating.label === item ? 0.3 : 1,
                      }}
                    >
                      {item}
                    </text>
                  </g>
                ))}
              </g>

              {/* Microtask Queue */}
              <g>
                <rect
                  x={queueX}
                  y={microY}
                  width={blockW}
                  height={blockH * 2}
                  rx={18}
                  fill="#e0e7ff"
                  stroke={activeBlock === 'micro' ? '#22c55e' : '#3b82f6'}
                  strokeWidth={activeBlock === 'micro' ? 6 : 3}
                  style={{
                    filter:
                      activeBlock === 'micro'
                        ? 'drop-shadow(0 0 16px #22c55e88)'
                        : 'drop-shadow(0 2px 8px #3b82f633)',
                  }}
                  onMouseOver={(e) => {
                    const tooltip = document.getElementById('eventloop-tooltip');
                    if (tooltip) {
                      tooltip.textContent =
                        'Microtask Queue: High-priority async tasks (Promises, async/await).';
                      tooltip.style.display = 'block';
                      const rect = e.currentTarget.getBoundingClientRect();
                      tooltip.style.left = `${rect.left - 320}px`;
                      tooltip.style.top = `${rect.top}px`;
                    }
                  }}
                  onMouseOut={() => {
                    const tooltip = document.getElementById('eventloop-tooltip');
                    if (tooltip) tooltip.style.display = 'none';
                  }}
                />
                <text
                  x={queueX + blockW / 2}
                  y={microY + 120}
                  textAnchor="middle"
                  fontSize="22"
                  fontWeight="700"
                  fill="#3b82f6"
                  style={{ letterSpacing: 1 }}
                >
                  Microtask Queue
                </text>
                {microtasks.map((item, i) => (
                  <g key={item}>
                    <rect
                      x={queueX + 8}
                      y={microY + blockH * i + 8}
                      width={blockW - 16}
                      height={blockH - 16}
                      rx={10}
                      fill="#3b82f6"
                      opacity={
                        animating?.type === 'source' &&
                        animating.source === 'micro' &&
                        animating.label === item
                          ? 0.5
                          : 0.95 - i * 0.2
                      }
                      style={{
                        transition: 'all 0.5s ease-in-out',
                        transform:
                          animating?.type === 'source' &&
                          animating.source === 'micro' &&
                          animating.label === item
                            ? 'translateX(-30px) scale(1.1)'
                            : 'none',
                        filter:
                          animating?.type === 'source' &&
                          animating.source === 'micro' &&
                          animating.label === item
                            ? 'drop-shadow(0 0 12px #3b82f6aa)'
                            : 'none',
                      }}
                    />
                    <text
                      x={queueX + blockW / 2}
                      y={microY + blockH * i + 32}
                      textAnchor="middle"
                      fontSize="15"
                      fontWeight="600"
                      fill="white"
                      style={{
                        transition: 'all 0.5s',
                        opacity:
                          animating?.type === 'source' &&
                          animating.source === 'micro' &&
                          animating.label === item
                            ? 0.7
                            : 1,
                        transform:
                          animating?.type === 'source' &&
                          animating.source === 'micro' &&
                          animating.label === item
                            ? 'translateX(-30px)'
                            : 'none',
                      }}
                    >
                      {item}
                    </text>
                  </g>
                ))}
              </g>

              {/* Macrotask Queue */}
              <g>
                <rect
                  x={queueX}
                  y={macroY}
                  width={blockW}
                  height={blockH * 2}
                  rx={18}
                  fill="#fef9c3"
                  stroke={activeBlock === 'macro' ? '#22c55e' : '#f59e0b'}
                  strokeWidth={activeBlock === 'macro' ? 6 : 3}
                  style={{
                    filter:
                      activeBlock === 'macro'
                        ? 'drop-shadow(0 0 16px #22c55e88)'
                        : 'drop-shadow(0 2px 8px #f59e0b33)',
                  }}
                  onMouseOver={(e) => {
                    const tooltip = document.getElementById('eventloop-tooltip');
                    if (tooltip) {
                      tooltip.textContent =
                        'Macrotask Queue: Lower-priority async tasks (setTimeout, DOM events).';
                      tooltip.style.display = 'block';
                      const rect = e.currentTarget.getBoundingClientRect();
                      tooltip.style.left = `${rect.left - 320}px`;
                      tooltip.style.top = `${rect.top}px`;
                    }
                  }}
                  onMouseOut={() => {
                    const tooltip = document.getElementById('eventloop-tooltip');
                    if (tooltip) tooltip.style.display = 'none';
                  }}
                />
                <text
                  x={queueX + blockW / 2}
                  y={macroY - 15}
                  textAnchor="middle"
                  fontSize="22"
                  fontWeight="700"
                  fill="#f59e0b"
                  style={{ letterSpacing: 1 }}
                >
                  Macrotask Queue
                </text>
                {macrotasks.map((item, i) => (
                  <g key={item}>
                    <rect
                      x={queueX + 8}
                      y={macroY + blockH * i + 8}
                      width={blockW - 16}
                      height={blockH - 16}
                      rx={10}
                      fill="#f59e0b"
                      opacity={
                        animating?.type === 'source' &&
                        animating.source === 'macro' &&
                        animating.label === item
                          ? 0.5
                          : 0.95 - i * 0.2
                      }
                      style={{
                        transition: 'all 0.5s ease-in-out',
                        transform:
                          animating?.type === 'source' &&
                          animating.source === 'macro' &&
                          animating.label === item
                            ? 'translateX(-30px) scale(1.1)'
                            : 'none',
                        filter:
                          animating?.type === 'source' &&
                          animating.source === 'macro' &&
                          animating.label === item
                            ? 'drop-shadow(0 0 12px #f59e0baa)'
                            : 'none',
                      }}
                    />
                    <text
                      x={queueX + blockW / 2}
                      y={macroY + blockH * i + 32}
                      textAnchor="middle"
                      fontSize="15"
                      fontWeight="600"
                      fill="white"
                      style={{
                        transition: 'all 0.5s',
                        opacity:
                          animating?.type === 'source' &&
                          animating.source === 'macro' &&
                          animating.label === item
                            ? 0.7
                            : 1,
                        transform:
                          animating?.type === 'source' &&
                          animating.source === 'macro' &&
                          animating.label === item
                            ? 'translateX(-30px)'
                            : 'none',
                      }}
                    >
                      {item}
                    </text>
                  </g>
                ))}
              </g>

              {/* Event Loop (machine/bridge/traffic light with gears) */}
              <g>
                {/* Machine body: rounded rectangle */}
                <rect
                  x={eventLoopX - 40}
                  y={eventLoopY - 40}
                  width={80}
                  height={80}
                  rx={24}
                  fill="#e0e7ff"
                  stroke={activeBlock === 'eventloop' ? '#22c55e' : '#6366f1'}
                  strokeWidth={activeBlock === 'eventloop' ? 6 : 4}
                  style={{
                    filter:
                      activeBlock === 'eventloop'
                        ? 'drop-shadow(0 0 16px #22c55e88)'
                        : 'drop-shadow(0 2px 8px #6366f133)',
                  }}
                  onMouseOver={(e) => {
                    const tooltip = document.getElementById('eventloop-tooltip');
                    if (tooltip) {
                      tooltip.textContent =
                        'Event Loop: Transfers tasks from queues to Call Stack when stack is empty, prioritizing microtasks.';
                      tooltip.style.display = 'block';
                      const rect = e.currentTarget.getBoundingClientRect();
                      tooltip.style.left = `${rect.left - 150}px`;
                      tooltip.style.top = `${rect.bottom + 12}px`;
                    }
                  }}
                  onMouseOut={() => {
                    const tooltip = document.getElementById('eventloop-tooltip');
                    if (tooltip) tooltip.style.display = 'none';
                  }}
                />
                {/* Bridge element */}
                <rect
                  x={eventLoopX - 60}
                  y={eventLoopY - 10}
                  width={120}
                  height={20}
                  rx={10}
                  fill="#6366f1"
                  opacity={0.15}
                />
                {/* Gears */}
                <g>
                  <circle
                    cx={eventLoopX - 30}
                    cy={eventLoopY + 30}
                    r={10}
                    fill="#6366f1"
                    opacity={0.25}
                  />
                  <circle
                    cx={eventLoopX + 30}
                    cy={eventLoopY + 30}
                    r={8}
                    fill="#6366f1"
                    opacity={0.18}
                  />
                  {/* Simple gear teeth */}
                  <rect
                    x={eventLoopX - 40}
                    y={eventLoopY + 28}
                    width={20}
                    height={4}
                    rx={2}
                    fill="#6366f1"
                    opacity={0.18}
                  />
                  <rect
                    x={eventLoopX + 20}
                    y={eventLoopY + 28}
                    width={16}
                    height={4}
                    rx={2}
                    fill="#6366f1"
                    opacity={0.12}
                  />
                </g>
                {/* Animated traffic lights: highlight active light */}
                <circle
                  cx={eventLoopX}
                  cy={eventLoopY - 16}
                  r={10}
                  fill={activeLight === 'green' ? '#22c55e' : '#a7f3d0'}
                  stroke="#6366f1"
                  strokeWidth="2"
                  style={{
                    filter: activeLight === 'green' ? 'drop-shadow(0 0 8px #22c55e)' : undefined,
                  }}
                />
                <circle
                  cx={eventLoopX}
                  cy={eventLoopY}
                  r={10}
                  fill={activeLight === 'yellow' ? '#f59e0b' : '#fef9c3'}
                  stroke="#6366f1"
                  strokeWidth="2"
                  style={{
                    filter: activeLight === 'yellow' ? 'drop-shadow(0 0 8px #f59e0b)' : undefined,
                  }}
                />
                <circle
                  cx={eventLoopX}
                  cy={eventLoopY + 16}
                  r={10}
                  fill={activeLight === 'red' ? '#ef4444' : '#fee2e2'}
                  stroke="#6366f1"
                  strokeWidth="2"
                  style={{
                    filter: activeLight === 'red' ? 'drop-shadow(0 0 8px #ef4444)' : undefined,
                  }}
                />
                {/* Event Loop label */}
                <text
                  x={eventLoopX}
                  y={eventLoopY + 60}
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="700"
                  fill="#6366f1"
                  style={{ letterSpacing: 1 }}
                >
                  Event Loop
                </text>
              </g>

              {/* Flow arrows showing task movement */}
              <g opacity="0.6">
                {/* Macro to EventLoop */}
                <path
                  d={`M${queueX + blockW / 2},${macroY + blockH + 20} Q${queueX + blockW / 2 + 40},${macroY + blockH + 40} ${eventLoopX + 30},${eventLoopY - 10}`}
                  stroke="#f59e0b"
                  strokeWidth="3"
                  fill="none"
                  markerEnd="url(#arrowhead-macro)"
                  strokeDasharray="8,4"
                />
                {/* Micro to EventLoop */}
                <path
                  d={`M${queueX + blockW / 2},${microY - 20} Q${queueX + blockW / 2 + 50},${microY - 50} ${eventLoopX + 30},${eventLoopY + 10}`}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  fill="none"
                  markerEnd="url(#arrowhead-micro)"
                  strokeDasharray="8,4"
                />
                {/* EventLoop to CallStack */}
                <path
                  d={`M${eventLoopX - 30},${eventLoopY} Q${eventLoopX - 60},${eventLoopY} ${stackX + blockW + 20},${stackY + blockH * 2}`}
                  stroke="#6366f1"
                  strokeWidth="3"
                  fill="none"
                  markerEnd="url(#arrowhead-stack)"
                  strokeDasharray="8,4"
                />
              </g>

              {/* Arrowhead markers */}
              <defs>
                <marker
                  id="arrowhead-macro"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="0,0 10,5 0,10" fill="#f59e0b" />
                </marker>
                <marker
                  id="arrowhead-micro"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="0,0 10,5 0,10" fill="#3b82f6" />
                </marker>
                <marker
                  id="arrowhead-stack"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="0,0 10,5 0,10" fill="#6366f1" />
                </marker>
              </defs>
            </g>
          );
        })()}
      </svg>
      {/* ...existing code... */}
    </div>
  );
};

export default EventLoop2D;
