import React, { useState, useEffect } from 'react';
import { FileText, Folder, GitCommit, Tag, Hash } from 'lucide-react';

interface ObjectModel2DProps {
  selectedObject: string;
  onObjectSelect: (objectType: string) => void;
}

const objects = {
  commit: {
    x: 400,
    y: 50,
    icon: <GitCommit className="w-6 h-6" />,
    color: '#f97316',
    label: 'Commit',
    hash: 'a94a8fe',
    connections: ['tree', 'parent'],
  },
  tree: {
    x: 200,
    y: 150,
    icon: <Folder className="w-6 h-6" />,
    color: '#22c55e',
    label: 'Tree',
    hash: '4b825dc',
    connections: ['blob1', 'blob2', 'subtree'],
  },
  parent: {
    x: 600,
    y: 150,
    icon: <GitCommit className="w-6 h-6" />,
    color: '#f97316',
    label: 'Parent Commit',
    hash: 'f1d2d2f',
    connections: [],
  },
  blob1: {
    x: 50,
    y: 250,
    icon: <FileText className="w-5 h-5" />,
    color: '#3b82f6',
    label: 'hello.txt',
    hash: 'ce01362',
    connections: [],
  },
  blob2: {
    x: 150,
    y: 250,
    icon: <FileText className="w-5 h-5" />,
    color: '#3b82f6',
    label: 'world.txt',
    hash: 'b25c15f',
    connections: [],
  },
  subtree: {
    x: 300,
    y: 250,
    icon: <Folder className="w-5 h-5" />,
    color: '#22c55e',
    label: 'src/',
    hash: '8f94139',
    connections: ['blob3'],
  },
  blob3: {
    x: 350,
    y: 320,
    icon: <FileText className="w-4 h-4" />,
    color: '#3b82f6',
    label: 'main.js',
    hash: '1a2b3c4',
    connections: [],
  },
  tag: {
    x: 500,
    y: 50,
    icon: <Tag className="w-6 h-6" />,
    color: '#a855f7',
    label: 'Tag v1.0',
    hash: 'f7c3bc1',
    connections: ['commit'],
  },
};

const connections = [
  { from: 'commit', to: 'tree', label: 'points to' },
  { from: 'commit', to: 'parent', label: 'parent' },
  { from: 'tree', to: 'blob1', label: 'contains' },
  { from: 'tree', to: 'blob2', label: 'contains' },
  { from: 'tree', to: 'subtree', label: 'contains' },
  { from: 'subtree', to: 'blob3', label: 'contains' },
  { from: 'tag', to: 'commit', label: 'tags' },
];

const ObjectModel2D: React.FC<ObjectModel2DProps> = ({ selectedObject, onObjectSelect }) => {
  const [highlightedConnections, setHighlightedConnections] = useState<string[]>([]);
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (selectedObject && objects[selectedObject as keyof typeof objects]) {
      const obj = objects[selectedObject as keyof typeof objects];
      const incomingConnections = connections
        .filter((conn) => conn.to === selectedObject)
        .map((conn) => conn.from);
      const highlighted = [...obj.connections, ...incomingConnections];
      setHighlightedConnections(highlighted);
    } else {
      setHighlightedConnections([]);
    }
  }, [selectedObject]);

  const startDemo = () => {
    setIsAnimating(true);
    setAnimationStep(0);

    const demoSequence = ['commit', 'tree', 'blob1', 'blob2', 'subtree', 'blob3', 'parent', 'tag'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < demoSequence.length) {
        onObjectSelect(demoSequence[currentIndex]);
        setAnimationStep(currentIndex);
        currentIndex++;
      } else {
        setIsAnimating(false);
        clearInterval(interval);
        onObjectSelect('commit'); // End on commit
      }
    }, 1500);
  };

  const resetDemo = () => {
    setIsAnimating(false);
    setAnimationStep(0);
    onObjectSelect('commit');
  };

  const isHighlighted = (objectId: string) => {
    return selectedObject === objectId || highlightedConnections.includes(objectId);
  };

  const isConnectionHighlighted = (from: string, to: string) => {
    return (
      (selectedObject === from && highlightedConnections.includes(to)) ||
      (selectedObject === to && highlightedConnections.includes(from))
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Git Object Graph</h3>
        <p className="text-gray-600">Click on objects to explore their relationships</p>

        {/* Demo Controls */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={startDemo}
            disabled={isAnimating}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnimating ? 'Running Demo...' : 'Start Demo'}
          </button>
          <button
            onClick={resetDemo}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 700 400"
          className="w-full h-96 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white"
        >
          {/* Connection Lines */}
          {connections.map((conn, index) => {
            const fromObj = objects[conn.from as keyof typeof objects];
            const toObj = objects[conn.to as keyof typeof objects];
            const isHighlighted = isConnectionHighlighted(conn.from, conn.to);

            return (
              <g key={`connection-${index}`}>
                <defs>
                  <marker
                    id={`arrowhead-${index}`}
                    markerWidth="8"
                    markerHeight="6"
                    refX="8"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 8 3, 0 6"
                      className={`${
                        isHighlighted ? 'fill-orange-500' : 'fill-gray-400'
                      } transition-colors duration-300`}
                    />
                  </marker>
                </defs>

                <line
                  x1={fromObj.x + 20}
                  y1={fromObj.y + 20}
                  x2={toObj.x + 20}
                  y2={toObj.y + 20}
                  className={`${
                    isHighlighted ? 'stroke-orange-500 stroke-2' : 'stroke-gray-300 stroke-1'
                  } transition-all duration-300`}
                  markerEnd={`url(#arrowhead-${index})`}
                />

                {/* Connection Label */}
                {isHighlighted && (
                  <text
                    x={(fromObj.x + toObj.x) / 2 + 20}
                    y={(fromObj.y + toObj.y) / 2 + 15}
                    textAnchor="middle"
                    className="text-xs fill-orange-700 font-medium"
                  >
                    {conn.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Object Nodes */}
          {Object.entries(objects).map(([id, obj]) => {
            const isSelected = selectedObject === id;
            const isConnected = isHighlighted(id);

            return (
              <g key={id}>
                {/* Object Circle */}
                <circle
                  cx={obj.x + 20}
                  cy={obj.y + 20}
                  r="25"
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'fill-orange-100 stroke-orange-500 stroke-3'
                      : isConnected
                        ? 'fill-white stroke-orange-300 stroke-2'
                        : 'fill-white stroke-gray-300 stroke-1 hover:stroke-gray-400'
                  }`}
                  onClick={() => onObjectSelect(id)}
                />

                {/* Object Icon */}
                <foreignObject
                  x={obj.x + 12}
                  y={obj.y + 12}
                  width="16"
                  height="16"
                  className="pointer-events-none"
                >
                  <div
                    className={`flex items-center justify-center w-4 h-4 ${
                      isSelected || isConnected ? 'text-orange-600' : 'text-gray-600'
                    } transition-colors duration-300`}
                  >
                    {obj.icon}
                  </div>
                </foreignObject>

                {/* Object Label */}
                <text
                  x={obj.x + 20}
                  y={obj.y + 60}
                  textAnchor="middle"
                  className={`text-sm font-medium pointer-events-none ${
                    isSelected || isConnected ? 'fill-orange-700' : 'fill-gray-700'
                  } transition-colors duration-300`}
                >
                  {obj.label}
                </text>

                {/* Object Hash */}
                <text
                  x={obj.x + 20}
                  y={obj.y + 75}
                  textAnchor="middle"
                  className={`text-xs font-mono pointer-events-none ${
                    isSelected || isConnected ? 'fill-orange-600' : 'fill-gray-500'
                  } transition-colors duration-300`}
                >
                  {obj.hash}
                </text>

                {/* Selection Ring */}
                {isSelected && (
                  <circle
                    cx={obj.x + 20}
                    cy={obj.y + 20}
                    r="30"
                    className="fill-none stroke-orange-400 stroke-2 animate-pulse"
                    style={{
                      opacity: isAnimating ? 0.5 + animationStep * 0.1 : 1,
                      strokeDasharray: animationStep > 0 ? '5,5' : 'none',
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Object Type Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            type: 'blob',
            icon: <FileText className="w-4 h-4" />,
            color: '#3b82f6',
            name: 'Blob',
            description: 'File content',
          },
          {
            type: 'tree',
            icon: <Folder className="w-4 h-4" />,
            color: '#22c55e',
            name: 'Tree',
            description: 'Directory',
          },
          {
            type: 'commit',
            icon: <GitCommit className="w-4 h-4" />,
            color: '#f97316',
            name: 'Commit',
            description: 'Snapshot',
          },
          {
            type: 'tag',
            icon: <Tag className="w-4 h-4" />,
            color: '#a855f7',
            name: 'Tag',
            description: 'Label',
          },
        ].map((item) => (
          <div
            key={item.type}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
              selectedObject === item.type
                ? 'border-orange-300 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => onObjectSelect(item.type)}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full text-white"
              style={{ backgroundColor: item.color }}
            >
              {item.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Object Details */}
      {selectedObject && objects[selectedObject as keyof typeof objects] && (
        <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full text-white"
              style={{ backgroundColor: objects[selectedObject as keyof typeof objects].color }}
            >
              {objects[selectedObject as keyof typeof objects].icon}
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">
                {objects[selectedObject as keyof typeof objects].label}
              </h4>
              <code className="text-sm text-gray-600 font-mono">
                {objects[selectedObject as keyof typeof objects].hash}
              </code>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold text-gray-800 mb-2">Object Type Details:</h5>
              <p className="text-sm text-gray-700">
                {selectedObject === 'commit' &&
                  'Commits store snapshots of your repository at specific points in time. They contain metadata like author, timestamp, and message, plus pointers to the project tree and parent commits.'}
                {selectedObject === 'tree' &&
                  'Trees represent directories in your repository. They contain lists of files and subdirectories, with each entry pointing to blob or subtree objects.'}
                {selectedObject === 'parent' &&
                  'Parent commits represent the previous state of the repository. Most commits have one parent, but merge commits can have multiple parents.'}
                {(selectedObject === 'blob1' ||
                  selectedObject === 'blob2' ||
                  selectedObject === 'blob3') &&
                  'Blobs store the actual file content. The blob hash is calculated from the file contents, so identical files always have the same hash regardless of filename or location.'}
                {selectedObject === 'subtree' &&
                  'Subtrees are tree objects that represent subdirectories. They work exactly like root trees but represent nested folder structures.'}
                {selectedObject === 'tag' &&
                  'Tags are references that point to specific commits, usually used to mark release versions. They can store additional metadata like tagger information and messages.'}
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">Connections:</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                {connections
                  .filter((conn) => conn.from === selectedObject || conn.to === selectedObject)
                  .map((conn, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-orange-600">→</span>
                      {conn.from === selectedObject
                        ? `${conn.label} ${objects[conn.to as keyof typeof objects]?.label}`
                        : `${objects[conn.from as keyof typeof objects]?.label} ${conn.label} this object`}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Hash Explanation */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Hash className="w-5 h-5 text-orange-500" />
          <h4 className="text-lg font-bold text-gray-900">Object Identification</h4>
        </div>
        <p className="text-gray-700 text-sm">
          Each object is identified by its SHA-1 hash (shown as abbreviated 7-character prefixes).
          The hash is computed from the object's content, ensuring identical content always produces
          the same identifier across all Git repositories.
        </p>

        <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">Key Properties:</h5>
            <ul className="text-gray-700 space-y-1">
              <li>• Content-based addressing</li>
              <li>• Immutable once created</li>
              <li>• Globally unique identifiers</li>
              <li>• Enables deduplication</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">Benefits:</h5>
            <ul className="text-gray-700 space-y-1">
              <li>• Integrity verification</li>
              <li>• Efficient storage</li>
              <li>• Fast comparisons</li>
              <li>• Distributed synchronization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectModel2D;
