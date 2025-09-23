import React, { useState } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../types/nextjs';

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  path: string;
  url?: string;
  children?: FileNode[];
  level: number;
}

const RoutingFlow2D: React.FC<BaseNextJSVisualizationProps> = ({
  animationSpeed = 1000,
  interactive = true,
  className = '',
}) => {
  const [routerType, setRouterType] = useState<'pages' | 'app'>('app');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [animatingNodes, setAnimatingNodes] = useState<Set<string>>(new Set());

  // Sample file structure for demonstration
  const fileStructure: Record<'pages' | 'app', FileNode[]> = {
    pages: [
      {
        id: 'pages-root',
        name: 'pages',
        type: 'folder',
        path: 'pages',
        level: 0,
        children: [
          {
            id: 'index',
            name: 'index.js',
            type: 'file',
            path: 'pages/index.js',
            url: '/',
            level: 1,
          },
          {
            id: 'about',
            name: 'about.js',
            type: 'file',
            path: 'pages/about.js',
            url: '/about',
            level: 1,
          },
          {
            id: 'blog',
            name: 'blog',
            type: 'folder',
            path: 'pages/blog',
            level: 1,
            children: [
              {
                id: 'blog-index',
                name: 'index.js',
                type: 'file',
                path: 'pages/blog/index.js',
                url: '/blog',
                level: 2,
              },
              {
                id: 'blog-slug',
                name: '[slug].js',
                type: 'file',
                path: 'pages/blog/[slug].js',
                url: '/blog/:slug',
                level: 2,
              },
            ],
          },
        ],
      },
    ],
    app: [
      {
        id: 'app-root',
        name: 'app',
        type: 'folder',
        path: 'app',
        level: 0,
        children: [
          {
            id: 'layout',
            name: 'layout.js',
            type: 'file',
            path: 'app/layout.js',
            level: 1,
          },
          {
            id: 'page',
            name: 'page.js',
            type: 'file',
            path: 'app/page.js',
            url: '/',
            level: 1,
          },
          {
            id: 'about-folder',
            name: 'about',
            type: 'folder',
            path: 'app/about',
            level: 1,
            children: [
              {
                id: 'about-page',
                name: 'page.js',
                type: 'file',
                path: 'app/about/page.js',
                url: '/about',
                level: 2,
              },
            ],
          },
          {
            id: 'blog-folder',
            name: 'blog',
            type: 'folder',
            path: 'app/blog',
            level: 1,
            children: [
              {
                id: 'blog-layout',
                name: 'layout.js',
                type: 'file',
                path: 'app/blog/layout.js',
                level: 2,
              },
              {
                id: 'blog-page',
                name: 'page.js',
                type: 'file',
                path: 'app/blog/page.js',
                url: '/blog',
                level: 2,
              },
              {
                id: 'blog-slug-folder',
                name: '[slug]',
                type: 'folder',
                path: 'app/blog/[slug]',
                level: 2,
                children: [
                  {
                    id: 'blog-slug-page',
                    name: 'page.js',
                    type: 'file',
                    path: 'app/blog/[slug]/page.js',
                    url: '/blog/:slug',
                    level: 3,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const handleNodeClick = (nodeId: string) => {
    if (!interactive) return;

    setSelectedNode(nodeId);
    setAnimatingNodes(new Set([nodeId]));

    // Clear animation after timeout
    setTimeout(() => {
      setAnimatingNodes(new Set());
    }, animationSpeed);
  };

  const renderFileTree = (nodes: FileNode[], level = 0): React.ReactNode => {
    return nodes.map((node) => (
      <div key={node.id} className="select-none">
        <div
          className={`
            flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-300
            ${selectedNode === node.id ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50'}
            ${animatingNodes.has(node.id) ? 'animate-pulse bg-blue-50' : ''}
          `}
          style={{ marginLeft: level * 20 }}
          onClick={() => handleNodeClick(node.id)}
        >
          <div className="flex items-center space-x-2 flex-1">
            {node.type === 'folder' ? (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5a2 2 0 012 2v2H2V6zM2 10v6a2 2 0 002 2h10a2 2 0 002-2V10H2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span
              className={`text-sm font-medium ${node.type === 'folder' ? 'text-blue-700' : 'text-gray-700'}`}
            >
              {node.name}
            </span>
          </div>

          {node.url && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L13 7.414V15a1 1 0 11-2 0V7.414l-2.293 2.293a1 1 0 01-1.414-1.414l4-4z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h2a1 1 0 010 2H4v10h2a1 1 0 102 0H4a1 1 0 01-1-1V4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-mono text-green-600 bg-green-50 px-2 py-1 rounded">
                {node.url}
              </span>
            </div>
          )}
        </div>

        {node.children && (
          <div className="ml-4 border-l border-gray-200 pl-4">
            {renderFileTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Router Type Selector */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">File Structure → URL Mapping</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setRouterType('pages')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              routerType === 'pages'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pages Router
          </button>
          <button
            onClick={() => setRouterType('app')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              routerType === 'app'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            App Router
          </button>
        </div>
      </div>

      {/* File Tree Visualization */}
      <div className="bg-gray-50 rounded-lg p-4 min-h-[300px]">
        {renderFileTree(fileStructure[routerType])}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5a2 2 0 012 2v2H2V6zM2 10v6a2 2 0 002 2h10a2 2 0 002-2V10H2z" />
          </svg>
          <span>Folder</span>
        </div>
        <div className="flex items-center space-x-2">
          <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>File</span>
        </div>
        <div className="flex items-center space-x-2">
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L13 7.414V15a1 1 0 11-2 0V7.414l-2.293 2.293a1 1 0 01-1.414-1.414l4-4z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h2a1 1 0 010 2H4v10h2a1 1 0 102 0H4a1 1 0 01-1-1V4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Route URL</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Interactive:</strong> Click on files and folders to see how they map to URLs.
          Switch between router types to compare the different approaches.
        </p>
      </div>
    </div>
  );
};

export default RoutingFlow2D;
