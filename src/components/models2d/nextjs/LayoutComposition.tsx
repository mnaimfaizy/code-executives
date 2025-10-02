import React, { useState, useEffect } from 'react';
import type { BaseNextJSVisualizationProps, ComponentElement } from '../../../types/nextjs';

interface LayoutCompositionProps extends BaseNextJSVisualizationProps {
  showNestedLayouts?: boolean;
  showSharedUI?: boolean;
  highlightActiveRoute?: boolean;
}

const LayoutComposition: React.FC<LayoutCompositionProps> = ({
  isActive = false,
  highlightActiveRoute = true,
  className = '',
  interactive = true,
}) => {
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  const [animationStep, setAnimationStep] = useState(0);

  // Layout structure data
  const layoutStructure: ComponentElement[] = [
    {
      id: 'root-layout',
      type: 'component',
      componentType: 'server',
      position: { x: 50, y: 50 },
      props: { children: 'header,main,footer' },
      metadata: { level: 0, isLayout: true },
    },
    {
      id: 'header',
      type: 'component',
      componentType: 'client',
      position: { x: 50, y: 120 },
      props: { navigation: 'true' },
      parent: 'root-layout',
      metadata: { level: 1, isShared: true },
    },
    {
      id: 'dashboard-layout',
      type: 'component',
      componentType: 'server',
      position: { x: 200, y: 120 },
      props: { children: 'sidebar,content' },
      parent: 'root-layout',
      metadata: { level: 1, isLayout: true, route: '/dashboard' },
    },
    {
      id: 'sidebar',
      type: 'component',
      componentType: 'client',
      position: { x: 200, y: 190 },
      props: { menu: 'true' },
      parent: 'dashboard-layout',
      metadata: { level: 2, isShared: true },
    },
    {
      id: 'content',
      type: 'component',
      componentType: 'server',
      position: { x: 350, y: 190 },
      props: { page: 'dashboard' },
      parent: 'dashboard-layout',
      metadata: { level: 2, isPage: true },
    },
    {
      id: 'footer',
      type: 'component',
      componentType: 'server',
      position: { x: 50, y: 260 },
      props: { copyright: 'true' },
      parent: 'root-layout',
      metadata: { level: 1, isShared: true },
    },
  ];

  const routes = ['/dashboard', '/dashboard/analytics', '/dashboard/settings'];

  useEffect(() => {
    if (isActive && animationStep < routes.length) {
      const timer = setTimeout(() => {
        setAnimationStep((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive, animationStep, routes.length]);

  const handleRouteClick = (route: string) => {
    if (interactive) {
      setCurrentRoute(route);
      setAnimationStep(0);
    }
  };

  const getComponentColor = (component: ComponentElement) => {
    if (component.componentType === 'server') return '#3b82f6'; // blue
    if (component.componentType === 'client') return '#10b981'; // green
    return '#6b7280'; // gray
  };

  const isHighlighted = (component: ComponentElement) => {
    if (!highlightActiveRoute) return false;
    return (
      component.metadata?.route === currentRoute ||
      (currentRoute.startsWith('/dashboard') && component.metadata?.route === '/dashboard')
    );
  };

  const renderComponent = (component: ComponentElement) => {
    const color = getComponentColor(component);
    const highlighted = isHighlighted(component);
    const isLayout = component.metadata?.isLayout;
    const isShared = component.metadata?.isShared;

    return (
      <g key={component.id}>
        {/* Connection lines */}
        {component.parent && (
          <line
            x1={layoutStructure.find((c) => c.id === component.parent)?.position?.x || 0}
            y1={layoutStructure.find((c) => c.id === component.parent)?.position?.y || 0}
            x2={component.position?.x || 0}
            y2={component.position?.y || 0}
            stroke="#d1d5db"
            strokeWidth="2"
            strokeDasharray={isLayout ? '5,5' : 'none'}
          />
        )}

        {/* Component rectangle */}
        <rect
          x={(component.position?.x || 0) - 60}
          y={(component.position?.y || 0) - 20}
          width="120"
          height="40"
          fill={highlighted ? color : '#f9fafb'}
          stroke={color}
          strokeWidth={highlighted ? '3' : '2'}
          rx="6"
          className={interactive ? 'cursor-pointer hover:fill-blue-50' : ''}
          onClick={() =>
            component.metadata?.route &&
            typeof component.metadata.route === 'string' &&
            handleRouteClick(component.metadata.route)
          }
        />

        {/* Component label */}
        <text
          x={component.position?.x || 0}
          y={(component.position?.y || 0) - 5}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill={highlighted ? 'white' : '#374151'}
        >
          {component.id.replace('-', ' ')}
        </text>

        {/* Component type indicator */}
        <text
          x={component.position?.x || 0}
          y={(component.position?.y || 0) + 10}
          textAnchor="middle"
          fontSize="10"
          fill={highlighted ? 'white' : color}
        >
          {component.componentType}
        </text>

        {/* Badges */}
        {isLayout && (
          <rect
            x={(component.position?.x || 0) + 45}
            y={(component.position?.y || 0) - 25}
            width="30"
            height="15"
            fill="#fbbf24"
            rx="3"
          />
        )}
        {isShared && (
          <rect
            x={(component.position?.x || 0) - 75}
            y={(component.position?.y || 0) - 25}
            width="30"
            height="15"
            fill="#8b5cf6"
            rx="3"
          />
        )}

        {isLayout && (
          <text
            x={(component.position?.x || 0) + 60}
            y={(component.position?.y || 0) - 15}
            textAnchor="middle"
            fontSize="8"
            fill="white"
            fontWeight="bold"
          >
            LAYOUT
          </text>
        )}
        {isShared && (
          <text
            x={(component.position?.x || 0) - 60}
            y={(component.position?.y || 0) - 15}
            textAnchor="middle"
            fontSize="8"
            fill="white"
            fontWeight="bold"
          >
            SHARED
          </text>
        )}
      </g>
    );
  };

  return (
    <div className={`relative w-full h-96 bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Layout Composition</h3>
        <p className="text-sm text-gray-600">
          See how nested layouts and shared UI components work together in Next.js App Router
        </p>
      </div>

      {/* Route selector */}
      {interactive && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            {routes.map((route) => (
              <button
                key={route}
                onClick={() => handleRouteClick(route)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  currentRoute === route
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {route}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Visualization */}
      <div className="p-4">
        <svg viewBox="0 0 500 300" className="w-full h-64">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Render all components */}
          {layoutStructure.map(renderComponent)}

          {/* Legend */}
          <g transform="translate(20, 20)">
            <rect x="0" y="0" width="15" height="15" fill="#3b82f6" rx="2" />
            <text x="20" y="12" fontSize="12" fill="#374151">
              Server Component
            </text>

            <rect x="0" y="20" width="15" height="15" fill="#10b981" rx="2" />
            <text x="20" y="32" fontSize="12" fill="#374151">
              Client Component
            </text>

            <rect x="0" y="40" width="15" height="15" fill="#fbbf24" rx="2" />
            <text x="20" y="52" fontSize="12" fill="#374151">
              Layout
            </text>

            <rect x="0" y="60" width="15" height="15" fill="#8b5cf6" rx="2" />
            <text x="20" y="72" fontSize="12" fill="#374151">
              Shared UI
            </text>
          </g>
        </svg>
      </div>

      {/* Explanation */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          <strong>Current Route:</strong>{' '}
          <code className="bg-white px-2 py-1 rounded text-xs">{currentRoute}</code>
          <br />
          <strong>Active Components:</strong> Root layout,{' '}
          {currentRoute.includes('/dashboard') ? 'dashboard layout, ' : ''}
          shared header/sidebar, and page content
        </div>
      </div>
    </div>
  );
};

// Memoize layout composition to reduce unnecessary re-renders
export default React.memo(LayoutComposition);
