// src/components/playground/VisualizationSelector.tsx
// Component for selecting which data structure visualization to show

import React from 'react';
import { Eye, Database, Hash, List, GitBranch, Network } from 'lucide-react';
import type { VisualizationSelectorProps, DataStructureType } from '../../types/playground';

const VisualizationSelector: React.FC<VisualizationSelectorProps> = ({
  options,
  selected,
  onSelect,
  disabled = false,
  className = '',
}) => {
  // Icon mapping for data structures
  const getIcon = (type: DataStructureType) => {
    switch (type) {
      case 'Array':
        return <List className="w-5 h-5" />;
      case 'LinkedList':
        return <List className="w-5 h-5" />;
      case 'Stack':
        return <Database className="w-5 h-5" />;
      case 'Queue':
        return <Database className="w-5 h-5" />;
      case 'HashTable':
        return <Hash className="w-5 h-5" />;
      case 'BinaryTree':
        return <GitBranch className="w-5 h-5" />;
      case 'BinarySearchTree':
        return <GitBranch className="w-5 h-5" />;
      case 'AVLTree':
        return <GitBranch className="w-5 h-5" />;
      case 'Heap':
        return <Database className="w-5 h-5" />;
      case 'Graph':
        return <Network className="w-5 h-5" />;
      default:
        return <Eye className="w-5 h-5" />;
    }
  };

  // Display name mapping
  const getDisplayName = (type: DataStructureType): string => {
    switch (type) {
      case 'BinarySearchTree':
        return 'Binary Search Tree';
      case 'AVLTree':
        return 'AVL Tree';
      default:
        return type;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <Eye className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-900">Visualization</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            disabled={disabled}
            className={`p-3 rounded-lg border transition-all text-left ${
              selected === option
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`${selected === option ? 'text-blue-600' : 'text-gray-500'}`}>
                {getIcon(option)}
              </div>
              <div>
                <div className="text-sm font-medium">{getDisplayName(option)}</div>
                <div className="text-xs text-gray-500">
                  {selected === option ? 'Active' : 'Click to select'}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {options.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No visualizations available for this problem</p>
        </div>
      )}
    </div>
  );
};

export default VisualizationSelector;
