import React, { useState, useMemo, useCallback } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface PlaygroundComponent {
  id: string;
  name: string;
  type: 'server' | 'client';
  code: string;
  props?: Record<string, unknown>;
  children?: string[];
}

interface TreeNode {
  component: PlaygroundComponent;
  children: TreeNode[];
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PlaygroundState {
  components: PlaygroundComponent[];
  selectedComponent: string | null;
  draggedComponent: string | null;
  output: string;
  errors: string[];
}

interface ComponentPlaygroundProps extends BaseNextJSVisualizationProps {
  initialComponents?: PlaygroundComponent[];
}

const ComponentPlayground: React.FC<ComponentPlaygroundProps> = ({
  initialComponents,
  className = '',
}) => {
  const [playgroundState, setPlaygroundState] = useState<PlaygroundState>({
    components: initialComponents || [
      {
        id: 'page',
        name: 'Page',
        type: 'server',
        code: 'export default function Page() {\n  return <div>Page Content</div>;\n}',
        children: [],
      },
      {
        id: 'header',
        name: 'Header',
        type: 'client',
        code: "'use client';\n\nexport function Header() {\n  return <header>Header</header>;\n}",
        children: [],
      },
      {
        id: 'counter',
        name: 'Counter',
        type: 'client',
        code: "'use client';\n\nimport { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Count: {count}\n    </button>\n  );\n}",
        children: [],
      },
      {
        id: 'list',
        name: 'ItemList',
        type: 'server',
        code: 'export function ItemList({ items }) {\n  return (\n    <ul>\n      {items.map(item => <li key={item}>{item}</li>)}\n    </ul>\n  );\n}',
        props: { items: ['Apple', 'Banana', 'Cherry'] },
        children: [],
      },
    ],
    selectedComponent: null,
    draggedComponent: null,
    output: '',
    errors: [],
  });

  // Generate component tree visualization
  const componentTree = useMemo(() => {
    const buildTree = (componentId: string, visited = new Set<string>()): TreeNode | null => {
      if (visited.has(componentId)) return null;
      visited.add(componentId);

      const component = playgroundState.components.find((c) => c.id === componentId);
      if (!component) return null;

      const children =
        component.children
          ?.map((childId) => buildTree(childId, visited))
          .filter((child): child is TreeNode => child !== null) || [];

      return {
        component,
        children,
        x: 0,
        y: 0,
        width: 120,
        height: 60,
      };
    };

    return buildTree('page');
  }, [playgroundState.components]);

  // Calculate positions for tree layout
  const calculatePositions = useCallback(
    (node: TreeNode | null, level = 0, index = 0, parentX = 200): TreeNode | null => {
      if (!node) return null;

      const children = node.children || [];
      const levelSpacing = 100;
      const siblingSpacing = 140;

      const x = parentX + (index - (children.length - 1) / 2) * siblingSpacing;
      const y = level * levelSpacing + 50;

      const positionedChildren = children
        .map((child: TreeNode, childIndex: number) =>
          calculatePositions(child, level + 1, childIndex, x)
        )
        .filter((child): child is TreeNode => child !== null);

      return {
        ...node,
        x,
        y,
        children: positionedChildren,
      };
    },
    []
  );

  const positionedTree = useMemo(
    () => calculatePositions(componentTree),
    [calculatePositions, componentTree]
  );

  // Render component node
  const renderNode = (node: TreeNode) => {
    if (!node) return null;

    const { component, x, y, width, height, children } = node;
    const isSelected = playgroundState.selectedComponent === component.id;
    const hasChildren = children && children.length > 0;

    return (
      <g key={component.id}>
        {/* Connection lines */}
        {hasChildren &&
          children.map((child: TreeNode) => (
            <line
              key={`line-${component.id}-${child.component.id}`}
              x1={x + width / 2}
              y1={y + height}
              x2={child.x + child.width / 2}
              y2={child.y}
              stroke="#d1d5db"
              strokeWidth="2"
            />
          ))}

        {/* Node */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={component.type === 'server' ? '#10b981' : '#3b82f6'}
          stroke={isSelected ? '#ef4444' : '#374151'}
          strokeWidth={isSelected ? 3 : 1}
          rx="8"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() =>
            setPlaygroundState((prev) => ({
              ...prev,
              selectedComponent: prev.selectedComponent === component.id ? null : component.id,
            }))
          }
        />

        {/* Component icon */}
        <text x={x + 15} y={y + 20} fontSize="16" fill="white">
          {component.type === 'server' ? '🖥️' : '💻'}
        </text>

        {/* Component name */}
        <text
          x={x + width / 2}
          y={y + 35}
          textAnchor="middle"
          fontSize="11"
          fill="white"
          fontWeight="bold"
        >
          {component.name}
        </text>

        {/* Component type */}
        <text
          x={x + width / 2}
          y={y + 48}
          textAnchor="middle"
          fontSize="9"
          fill="white"
          opacity="0.9"
        >
          {component.type.toUpperCase()}
        </text>

        {/* Render children */}
        {children && children.map((child: TreeNode) => renderNode(child))}
      </g>
    );
  };

  // Add new component
  const addComponent = (type: 'server' | 'client') => {
    const newId = `component-${Date.now()}`;
    const newComponent: PlaygroundComponent = {
      id: newId,
      name: type === 'server' ? 'NewServerComponent' : 'NewClientComponent',
      type,
      code:
        type === 'server'
          ? `export function ${newId}() {\n  return <div>New Server Component</div>;\n}`
          : `'use client';\n\nexport function ${newId}() {\n  return <div>New Client Component</div>;\n}`,
      children: [],
    };

    setPlaygroundState((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));
  };

  // Update component code
  const updateComponentCode = (componentId: string, newCode: string) => {
    setPlaygroundState((prev) => ({
      ...prev,
      components: prev.components.map((comp) =>
        comp.id === componentId ? { ...comp, code: newCode } : comp
      ),
    }));
  };

  // Add child to component
  const addChildToComponent = (parentId: string, childId: string) => {
    setPlaygroundState((prev) => ({
      ...prev,
      components: prev.components.map((comp) =>
        comp.id === parentId ? { ...comp, children: [...(comp.children || []), childId] } : comp
      ),
    }));
  };

  // Remove component
  const removeComponent = (componentId: string) => {
    setPlaygroundState((prev) => ({
      ...prev,
      components: prev.components
        .filter((comp) => comp.id !== componentId)
        .map((comp) => ({
          ...comp,
          children: comp.children?.filter((childId) => childId !== componentId) || [],
        })),
      selectedComponent: prev.selectedComponent === componentId ? null : prev.selectedComponent,
    }));
  };

  // Generate output code
  const generateOutput = () => {
    const buildComponentCode = (componentId: string, indent = 0): string => {
      const component = playgroundState.components.find((c) => c.id === componentId);
      if (!component) return '';

      const indentStr = '  '.repeat(indent);
      let code = '';

      // Add imports for client components
      if (component.type === 'client') {
        code += `${indentStr}import { ${component.name} } from './${component.name}';\n`;
      }

      // Add component usage
      code += `${indentStr}<${component.name}`;
      if (component.props) {
        Object.entries(component.props).forEach(([key, value]) => {
          code += ` ${key}={${JSON.stringify(value)}}`;
        });
      }
      code += '>\n';

      // Add children
      component.children?.forEach((childId) => {
        code += buildComponentCode(childId, indent + 1);
      });

      code += `${indentStr}</${component.name}>\n`;

      return code;
    };

    const pageComponent = playgroundState.components.find((c) => c.id === 'page');
    if (!pageComponent) return '';

    let output = `// Generated Page Component\n`;
    output += `import React from 'react';\n\n`;
    output += pageComponent.code.replace(
      'export default function Page()',
      'function PageContent()'
    );
    output += '\n\n';
    output += 'export default function Page() {\n';
    output += '  return (\n';
    output += buildComponentCode('page', 2);
    output += '  );\n';
    output += '}\n';

    setPlaygroundState((prev) => ({ ...prev, output }));
  };

  const selectedComponent = playgroundState.components.find(
    (c) => c.id === playgroundState.selectedComponent
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Component Composition Playground</h3>
        <p className="text-gray-600">Experiment with server and client component combinations</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => addComponent('server')}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
        >
          + Add Server Component
        </button>
        <button
          onClick={() => addComponent('client')}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          + Add Client Component
        </button>
        <button
          onClick={generateOutput}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
        >
          Generate Code
        </button>
      </div>

      {/* Main Playground Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component Tree Visualization */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Component Tree</h4>
          <div className="relative overflow-x-auto">
            <svg
              width="400"
              height="300"
              viewBox="0 0 400 300"
              className="w-full h-auto border border-gray-100 rounded"
            >
              {positionedTree && renderNode(positionedTree)}
            </svg>
          </div>

          {/* Component List */}
          <div className="mt-4 space-y-2">
            <h5 className="font-medium text-gray-900">Available Components:</h5>
            {playgroundState.components.map((component) => (
              <div
                key={component.id}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                  playgroundState.selectedComponent === component.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() =>
                  setPlaygroundState((prev) => ({
                    ...prev,
                    selectedComponent:
                      prev.selectedComponent === component.id ? null : component.id,
                  }))
                }
              >
                <div className="flex items-center space-x-2">
                  <span>{component.type === 'server' ? '🖥️' : '💻'}</span>
                  <span className="font-medium">{component.name}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      component.type === 'server'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {component.type}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeComponent(component.id);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Component Editor */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {selectedComponent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">
                  Edit {selectedComponent.name}
                </h4>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedComponent.type === 'server'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedComponent.type.toUpperCase()}
                </span>
              </div>

              {/* Code Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Component Code:
                </label>
                <textarea
                  value={selectedComponent.code}
                  onChange={(e) => updateComponentCode(selectedComponent.id, e.target.value)}
                  className="w-full h-48 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none"
                  placeholder="Enter component code..."
                />
              </div>

              {/* Props Editor */}
              {selectedComponent.type === 'server' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Props (JSON):
                  </label>
                  <textarea
                    value={JSON.stringify(selectedComponent.props || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const props = JSON.parse(e.target.value);
                        setPlaygroundState((prev) => ({
                          ...prev,
                          components: prev.components.map((comp) =>
                            comp.id === selectedComponent.id ? { ...comp, props } : comp
                          ),
                        }));
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    className="w-full h-24 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none"
                    placeholder='{"key": "value"}'
                  />
                </div>
              )}

              {/* Add Child */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Child Component:
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addChildToComponent(selectedComponent.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  defaultValue=""
                >
                  <option value="">Select a component...</option>
                  {playgroundState.components
                    .filter(
                      (comp) =>
                        comp.id !== selectedComponent.id &&
                        !selectedComponent.children?.includes(comp.id)
                    )
                    .map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.name} ({comp.type})
                      </option>
                    ))}
                </select>
              </div>

              {/* Children List */}
              {selectedComponent.children && selectedComponent.children.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Children:</label>
                  <div className="space-y-1">
                    {selectedComponent.children.map((childId) => {
                      const child = playgroundState.components.find((c) => c.id === childId);
                      return (
                        <div
                          key={childId}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm">
                            {child?.name} ({child?.type})
                          </span>
                          <button
                            onClick={() => {
                              setPlaygroundState((prev) => ({
                                ...prev,
                                components: prev.components.map((comp) =>
                                  comp.id === selectedComponent.id
                                    ? {
                                        ...comp,
                                        children:
                                          comp.children?.filter((id) => id !== childId) || [],
                                      }
                                    : comp
                                ),
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-4">🎮</div>
              <p>Select a component from the tree to edit it</p>
            </div>
          )}
        </div>
      </div>

      {/* Generated Output */}
      {playgroundState.output && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Generated Page Code</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap overflow-x-auto">
              {playgroundState.output}
            </pre>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {playgroundState.components.filter((c) => c.type === 'server').length}
          </div>
          <div className="text-sm text-gray-600">Server Components</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {playgroundState.components.filter((c) => c.type === 'client').length}
          </div>
          <div className="text-sm text-gray-600">Client Components</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {playgroundState.components.length}
          </div>
          <div className="text-sm text-gray-600">Total Components</div>
        </div>
      </div>
    </div>
  );
};

export default ComponentPlayground;
