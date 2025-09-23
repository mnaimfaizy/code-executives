import React, { useState } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../types/nextjs';

interface RouteTransitionProps extends BaseNextJSVisualizationProps {
  showAnimation?: boolean;
  transitionSpeed?: number;
}

interface RouteState {
  path: string;
  component: string;
  isActive: boolean;
  transitionPhase: 'idle' | 'leaving' | 'entering' | 'active';
}

const RouteTransition: React.FC<RouteTransitionProps> = ({
  showAnimation = true,
  transitionSpeed = 1000,
  className = '',
  interactive = true,
}) => {
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  const [transitioning, setTransitioning] = useState(false);
  const [routeHistory, setRouteHistory] = useState<string[]>(['/dashboard']);

  const routes: RouteState[] = [
    {
      path: '/dashboard',
      component: 'DashboardPage',
      isActive: currentRoute === '/dashboard',
      transitionPhase: 'idle',
    },
    {
      path: '/dashboard/analytics',
      component: 'AnalyticsPage',
      isActive: currentRoute === '/dashboard/analytics',
      transitionPhase: 'idle',
    },
    {
      path: '/dashboard/settings',
      component: 'SettingsPage',
      isActive: currentRoute === '/dashboard/settings',
      transitionPhase: 'idle',
    },
    {
      path: '/profile',
      component: 'ProfilePage',
      isActive: currentRoute === '/profile',
      transitionPhase: 'idle',
    },
  ];

  const handleRouteChange = (newRoute: string) => {
    if (transitioning || !interactive) return;

    setTransitioning(true);
    setRouteHistory((prev) => [...prev.slice(-4), newRoute]); // Keep last 5 routes

    // Animate transition
    setTimeout(() => {
      setCurrentRoute(newRoute);
      setTransitioning(false);
    }, transitionSpeed);
  };

  const getRoutePosition = (index: number) => {
    const baseX = 100;
    const spacing = 150;
    return { x: baseX + index * spacing, y: 150 };
  };

  const getTransitionStyle = (route: RouteState) => {
    if (!showAnimation) return {};

    if (transitioning) {
      if (route.path === currentRoute) {
        return { opacity: 0.3, transform: 'translateX(-20px)' };
      }
    }

    return route.isActive ? { opacity: 1, transform: 'scale(1.05)' } : { opacity: 0.6 };
  };

  const renderRouteNode = (route: RouteState, index: number) => {
    const position = getRoutePosition(index);
    const isActive = route.isActive;
    const style = getTransitionStyle(route);

    return (
      <g key={route.path} style={style}>
        {/* Route node */}
        <rect
          x={position.x - 60}
          y={position.y - 25}
          width="120"
          height="50"
          fill={isActive ? '#3b82f6' : '#f9fafb'}
          stroke={isActive ? '#1d4ed8' : '#d1d5db'}
          strokeWidth={isActive ? '3' : '2'}
          rx="8"
          className={
            interactive ? 'cursor-pointer hover:fill-blue-50 transition-all duration-300' : ''
          }
          onClick={() => handleRouteChange(route.path)}
        />

        {/* Route path */}
        <text
          x={position.x}
          y={position.y - 5}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill={isActive ? 'white' : '#374151'}
        >
          {route.path}
        </text>

        {/* Component name */}
        <text
          x={position.x}
          y={position.y + 12}
          textAnchor="middle"
          fontSize="10"
          fill={isActive ? 'white' : '#6b7280'}
        >
          {route.component}
        </text>

        {/* Active indicator */}
        {isActive && (
          <circle
            cx={position.x}
            cy={position.y - 35}
            r="6"
            fill="#10b981"
            className="animate-pulse"
          />
        )}
      </g>
    );
  };

  const renderNavigationFlow = () => {
    const positions = routes.map((_, index) => getRoutePosition(index));

    return (
      <g>
        {/* Navigation arrows */}
        {positions.slice(0, -1).map((pos, index) => (
          <g key={`arrow-${index}`}>
            <line
              x1={pos.x + 60}
              y1={pos.y}
              x2={positions[index + 1].x - 60}
              y2={positions[index + 1].y}
              stroke="#d1d5db"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          </g>
        ))}

        {/* Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
          </marker>
        </defs>
      </g>
    );
  };

  const renderHistory = () => {
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Navigation History</h4>
        <div className="flex flex-wrap gap-2">
          {routeHistory.slice(-5).map((route, index) => (
            <span
              key={`${route}-${index}`}
              className={`px-2 py-1 text-xs rounded-md ${
                index === routeHistory.length - 1
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {route}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative w-full h-96 bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Route Transitions</h3>
        <p className="text-sm text-gray-600">
          See how Next.js handles client-side navigation and route transitions
        </p>
      </div>

      {/* Controls */}
      {interactive && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2 flex-wrap">
            {routes.map((route) => (
              <button
                key={route.path}
                onClick={() => handleRouteChange(route.path)}
                disabled={transitioning}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  route.isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                }`}
              >
                {route.path}
              </button>
            ))}
          </div>
          {transitioning && (
            <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Transitioning...
            </div>
          )}
        </div>
      )}

      {/* Visualization */}
      <div className="p-4">
        <svg viewBox="0 0 700 250" className="w-full h-48">
          {/* Background */}
          <rect width="100%" height="100%" fill="#fafafa" />

          {/* Navigation flow */}
          {renderNavigationFlow()}

          {/* Route nodes */}
          {routes.map(renderRouteNode)}

          {/* Current route indicator */}
          <g transform="translate(50, 50)">
            <rect x="0" y="0" width="200" height="30" fill="#f0f9ff" stroke="#0ea5e9" rx="4" />
            <text x="10" y="20" fontSize="12" fill="#0c4a6e">
              Current Route: <tspan fontWeight="bold">{currentRoute}</tspan>
            </text>
          </g>
        </svg>
      </div>

      {/* History */}
      {renderHistory()}

      {/* Explanation */}
      <div className="p-4 bg-blue-50 border-t border-blue-200">
        <div className="text-sm text-blue-800">
          <strong>How it works:</strong> Next.js automatically handles client-side navigation. When
          you click a link, it prefetches the route, updates the URL, and renders the new page
          without a full browser refresh.
        </div>
      </div>
    </div>
  );
};

export default RouteTransition;
