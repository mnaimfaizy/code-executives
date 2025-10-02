import React, { useState } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface ComponentContent {
  type: string;
  name: string;
  props: Record<string, unknown>;
  children: string[];
}

interface ReferenceContent {
  type: string;
  module: string;
  export: string;
}

interface RSCPayload {
  id: string;
  type: 'component' | 'data' | 'reference';
  name: string;
  content: unknown;
  size: number;
  serialized: string;
}

interface PayloadViewerProps extends BaseNextJSVisualizationProps {
  payload?: RSCPayload[];
  showRaw?: boolean;
}

const PayloadViewer: React.FC<PayloadViewerProps> = ({
  payload: initialPayload,
  showRaw = true,
  className = '',
}) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');

  // Generate sample RSC payload
  const generateSamplePayload = (): RSCPayload[] => [
    {
      id: 'page-component',
      type: 'component',
      name: 'Page',
      content: {
        type: 'function',
        name: 'Page',
        props: {},
        children: ['$1', '$2', '$3'],
      },
      size: 245,
      serialized: `0:{"type":"function","name":"Page","props":{},"children":["$1","$2","$3"]}`,
    },
    {
      id: 'header-component',
      type: 'component',
      name: 'Header',
      content: {
        type: 'function',
        name: 'Header',
        props: { user: { name: 'John Doe', avatar: '/avatar.jpg' } },
        children: [],
      },
      size: 156,
      serialized: `1:{"type":"function","name":"Header","props":{"user":{"name":"John Doe","avatar":"/avatar.jpg"}},"children":[]}`,
    },
    {
      id: 'posts-data',
      type: 'data',
      name: 'Posts Array',
      content: [
        { id: 1, title: 'First Post', content: 'Hello World', author: 'John' },
        { id: 2, title: 'Second Post', content: 'React is great', author: 'Jane' },
        { id: 3, title: 'Third Post', content: 'Next.js rocks', author: 'Bob' },
      ],
      size: 387,
      serialized: `2:[{"id":1,"title":"First Post","content":"Hello World","author":"John"},{"id":2,"title":"Second Post","content":"React is great","author":"Jane"},{"id":3,"title":"Third Post","content":"Next.js rocks","author":"Bob"}]`,
    },
    {
      id: 'user-data',
      type: 'data',
      name: 'User Object',
      content: {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      },
      size: 198,
      serialized: `3:{"id":123,"name":"John Doe","email":"john@example.com","preferences":{"theme":"dark","notifications":true}}`,
    },
    {
      id: 'component-ref',
      type: 'reference',
      name: 'InteractiveCounter',
      content: {
        type: 'client-reference',
        module: './components/Counter',
        export: 'default',
      },
      size: 89,
      serialized: `4:{"type":"client-reference","module":"./components/Counter","export":"default"}`,
    },
  ];

  const payload = initialPayload || generateSamplePayload();
  const selectedItemData = payload.find((item) => item.id === selectedItem);
  const totalSize = payload.reduce((acc, item) => acc + item.size, 0);

  const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  };

  const isArray = (value: unknown): value is unknown[] => {
    return Array.isArray(value);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'component':
        return '📦';
      case 'data':
        return '📊';
      case 'reference':
        return '🔗';
      default:
        return '📄';
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'component':
        return 'bg-blue-100 text-blue-800';
      case 'data':
        return 'bg-green-100 text-green-800';
      case 'reference':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">RSC Payload Inspector</h3>
        <p className="text-gray-600">
          Explore React Server Components payload structure and serialization
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'visual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Visual View
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'raw'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Raw Payload
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <>
          {/* Payload Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payload.map((item) => (
              <div
                key={item.id}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedItem === item.id ? 'ring-2 ring-blue-500' : 'border-gray-200'
                }`}
                onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
              >
                {/* Item Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getItemIcon(item.type)}</span>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getItemColor(item.type)}`}
                  >
                    {item.type}
                  </span>
                </div>

                {/* Size */}
                <div className="text-sm text-gray-600 mb-3">
                  Size: <span className="font-medium">{item.size} bytes</span>
                </div>

                {/* Content Preview */}
                <div className="text-xs text-gray-500 mb-3">
                  {item.type === 'data' && isArray(item.content) && (
                    <span>{item.content.length} items</span>
                  )}
                  {item.type === 'data' && isObject(item.content) && (
                    <span>Object with {Object.keys(item.content).length} properties</span>
                  )}
                  {item.type === 'component' && isObject(item.content) && (
                    <span>
                      Component with{' '}
                      {(item.content as unknown as ComponentContent).children?.length || 0} children
                    </span>
                  )}
                  {item.type === 'reference' && isObject(item.content) && (
                    <span>
                      Client reference to {(item.content as unknown as ReferenceContent).module}
                    </span>
                  )}
                </div>

                {/* Expand Indicator */}
                <div className="text-center">
                  <span className="text-xs text-gray-400">
                    {selectedItem === item.id ? '▼' : '▶'} Click to inspect
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed View */}
          {selectedItemData && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-gray-900 flex items-center space-x-3">
                  <span className="text-lg">{getItemIcon(selectedItemData.type)}</span>
                  <span>{selectedItemData.name}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getItemColor(selectedItemData.type)}`}
                  >
                    {selectedItemData.type}
                  </span>
                </h4>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Content Structure */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pretty Printed Content */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Content Structure</h5>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(selectedItemData.content, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Serialized Form */}
                {showRaw && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Serialized Payload</h5>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-2">RSC Protocol Format:</div>
                      <pre className="text-sm font-mono text-gray-800 break-all">
                        {selectedItemData.serialized}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Item Analysis */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Payload Analysis</h5>
                <div className="text-sm text-blue-800 space-y-1">
                  {selectedItemData.type === 'component' && (
                    <>
                      <p>
                        • <strong>Server Component:</strong> Rendered on server, sent as serialized
                        structure
                      </p>
                      <p>
                        • <strong>Children References:</strong> Uses IDs to reference other payload
                        items
                      </p>
                      <p>
                        • <strong>Props:</strong> Serializable props passed to component
                      </p>
                    </>
                  )}
                  {selectedItemData.type === 'data' && (
                    <>
                      <p>
                        • <strong>Data Payload:</strong> Server-fetched data sent to client
                      </p>
                      <p>
                        • <strong>Serializable:</strong> Must be JSON-serializable (no functions,
                        dates, etc.)
                      </p>
                      <p>
                        • <strong>Size Impact:</strong> Affects network payload and hydration time
                      </p>
                    </>
                  )}
                  {selectedItemData.type === 'reference' && (
                    <>
                      <p>
                        • <strong>Client Reference:</strong> Pointer to client component code
                      </p>
                      <p>
                        • <strong>Module Path:</strong> Relative path to client component
                      </p>
                      <p>
                        • <strong>Hydration:</strong> Client will hydrate this as interactive
                        component
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Raw Payload View */
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Complete RSC Payload</h4>

          {/* Raw Payload Stream */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-2">Raw RSC Protocol Stream:</div>
            <pre className="text-sm font-mono text-gray-800 break-all whitespace-pre-wrap">
              {payload.map((item) => item.serialized).join('\n')}
            </pre>
          </div>

          {/* Payload Breakdown */}
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">Payload Breakdown</h5>
            {payload.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span>{getItemIcon(item.type)}</span>
                    <span className="font-medium">{item.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getItemColor(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{item.size} bytes</span>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono text-gray-800 break-all">
                  {item.serialized}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RSC Protocol Explanation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-green-900 mb-4">RSC Protocol Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-green-900 mb-2">How It Works</h5>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Server renders components to serializable format</li>
              <li>• Client receives compact payload stream</li>
              <li>• References connect components and data</li>
              <li>• Client hydrates interactive elements</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-green-900 mb-2">Benefits</h5>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Reduced bundle size for client</li>
              <li>• Faster initial page loads</li>
              <li>• Server-side data fetching</li>
              <li>• Automatic code splitting</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {payload.filter((p) => p.type === 'component').length}
          </div>
          <div className="text-sm text-gray-600">Components</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {payload.filter((p) => p.type === 'data').length}
          </div>
          <div className="text-sm text-gray-600">Data Items</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {payload.filter((p) => p.type === 'reference').length}
          </div>
          <div className="text-sm text-gray-600">References</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{totalSize}</div>
          <div className="text-sm text-gray-600">Total Bytes</div>
        </div>
      </div>
    </div>
  );
};

export default PayloadViewer;
