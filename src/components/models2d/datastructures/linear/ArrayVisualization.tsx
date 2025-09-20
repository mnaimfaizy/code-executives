import React, { useState, useCallback } from 'react';
import { Plus, Minus, Search } from 'lucide-react';
import type { ArrayElement, DataStructureOperation } from '../../../../types/datastructures';
import {
  useVisualizationState,
  useVisualizationInteraction,
} from '../../../../hooks/useDataStructures';

interface ArrayVisualizationProps {
  isActive?: boolean;
  maxSize?: number;
  initialData?: number[];
  showIndices?: boolean;
  showMemoryAddresses?: boolean;
  className?: string;
}

/**
 * Interactive Array Visualization Component
 * Demonstrates array operations with memory layout visualization
 */
export const ArrayVisualization: React.FC<ArrayVisualizationProps> = ({
  maxSize = 10,
  initialData = [42, 17, 89, 3, 56],
  showIndices = true,
  showMemoryAddresses = false,
  className = '',
}) => {
  // Convert initial data to ArrayElement format
  const initialElements: ArrayElement[] = initialData.map((value, index) => ({
    id: `element-${index}`,
    value,
    index,
    position: { x: index * 80, y: 0 },
    highlighted: false,
    color: '#3B82F6',
  }));

  const { state, actions } = useVisualizationState(initialElements);
  const { selectedElement, handleElementClick, clearSelection } = useVisualizationInteraction();

  // Local state for operations
  const [newValue, setNewValue] = useState<string>('');
  const [insertIndex, setInsertIndex] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [accessIndex, setAccessIndex] = useState<string>('');
  const [currentOperation, setCurrentOperation] = useState<string>('');

  // Animation state
  const [animatingElements, setAnimatingElements] = useState<Set<string>>(new Set());

  // Handle array operations
  const handleInsert = useCallback(
    (index: number, value: number) => {
      if (index < 0 || index > state.data.length || state.data.length >= maxSize) return;

      setCurrentOperation('insert');

      const newElements = [...state.data];

      // Animate shifting elements to the right
      const elementsToShift = newElements.slice(index);
      setAnimatingElements(new Set(elementsToShift.map((el) => el.id)));

      setTimeout(() => {
        // Update indices for shifted elements
        for (let i = newElements.length - 1; i >= index; i--) {
          newElements[i + 1] = {
            ...newElements[i],
            id: `element-${i + 1}`,
            index: i + 1,
            position: { x: (i + 1) * 80, y: 0 },
          };
        }

        // Insert new element
        const newElement: ArrayElement = {
          id: `element-${index}`,
          value,
          index,
          position: { x: index * 80, y: 0 },
          highlighted: true,
          color: '#10B981',
        };

        newElements[index] = newElement;

        const operation: DataStructureOperation = {
          type: 'insert',
          index,
          value,
          description: `Insert ${value} at index ${index}`,
          complexity: { time: 'O(n)', space: 'O(1)' },
        };

        actions.updateData(newElements, operation);
        setAnimatingElements(new Set());

        // Clear highlight after animation
        setTimeout(() => {
          const updatedElements = newElements.map((el) => ({
            ...el,
            highlighted: false,
            color: '#3B82F6',
          }));
          actions.updateData(updatedElements);
          setCurrentOperation('');
        }, 1000);
      }, 500);
    },
    [state.data, maxSize, actions]
  );

  const handleDelete = useCallback(
    (index: number) => {
      if (index < 0 || index >= state.data.length) return;

      setCurrentOperation('delete');
      const newElements = [...state.data];

      // Highlight element to be deleted
      newElements[index] = { ...newElements[index], highlighted: true, color: '#EF4444' };
      actions.updateData(newElements);

      setTimeout(() => {
        // Remove element and shift remaining elements
        const updatedElements = newElements
          .filter((_, i) => i !== index)
          .map((el, i) => ({
            ...el,
            id: `element-${i}`,
            index: i,
            position: { x: i * 80, y: 0 },
            highlighted: false,
            color: '#3B82F6',
          }));

        const operation: DataStructureOperation = {
          type: 'delete',
          index,
          description: `Delete element at index ${index}`,
          complexity: { time: 'O(n)', space: 'O(1)' },
        };

        actions.updateData(updatedElements, operation);
        setCurrentOperation('');
      }, 1000);
    },
    [state.data, actions]
  );

  const handleAccess = useCallback(
    (index: number) => {
      if (index < 0 || index >= state.data.length) return;

      setCurrentOperation('access');
      const newElements = [...state.data];

      // Highlight accessed element
      newElements[index] = { ...newElements[index], highlighted: true, color: '#F59E0B' };

      const operation: DataStructureOperation = {
        type: 'access',
        index,
        description: `Access element at index ${index} → ${newElements[index].value}`,
        complexity: { time: 'O(1)', space: 'O(1)' },
      };

      actions.updateData(newElements, operation);

      // Clear highlight after animation
      setTimeout(() => {
        const updatedElements = newElements.map((el) => ({
          ...el,
          highlighted: false,
          color: '#3B82F6',
        }));
        actions.updateData(updatedElements);
        setCurrentOperation('');
      }, 1500);
    },
    [state.data, actions]
  );

  const handleSearch = useCallback(
    (value: number) => {
      setCurrentOperation('search');

      let foundIndex = -1;
      const searchSteps: ArrayElement[][] = [];

      // Create animation steps for linear search
      for (let i = 0; i < state.data.length; i++) {
        const stepElements = state.data.map((el, idx) => ({
          ...el,
          highlighted: idx <= i,
          color:
            idx === i
              ? el.value === value
                ? '#10B981'
                : '#F59E0B'
              : idx < i
                ? '#9CA3AF'
                : '#3B82F6',
        }));

        searchSteps.push(stepElements);

        if (state.data[i].value === value && foundIndex === -1) {
          foundIndex = i;
        }
      }

      // Animate through search steps
      let currentStep = 0;
      const animateSearch = () => {
        if (currentStep < searchSteps.length) {
          actions.updateData(searchSteps[currentStep]);
          currentStep++;
          setTimeout(animateSearch, 800);
        } else {
          const operation: DataStructureOperation = {
            type: 'search',
            value,
            description:
              foundIndex >= 0
                ? `Found ${value} at index ${foundIndex}`
                : `${value} not found in array`,
            complexity: { time: 'O(n)', space: 'O(1)' },
          };

          actions.updateData(searchSteps[searchSteps.length - 1], operation);

          // Reset after showing result
          setTimeout(() => {
            const resetElements = state.data.map((el) => ({
              ...el,
              highlighted: false,
              color: '#3B82F6',
            }));
            actions.updateData(resetElements);
            setCurrentOperation('');
          }, 2000);
        }
      };

      animateSearch();
    },
    [state.data, actions]
  );

  // Memory address calculation (simplified)
  const getMemoryAddress = (index: number): string => {
    const baseAddress = 0x1000;
    const elementSize = 4; // 4 bytes for integer
    return `0x${(baseAddress + index * elementSize).toString(16).toUpperCase()}`;
  };

  // Handle form submissions
  const handleInsertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const index = parseInt(insertIndex);
    const value = parseInt(newValue);
    if (!isNaN(index) && !isNaN(value)) {
      handleInsert(index, value);
      setInsertIndex('');
      setNewValue('');
    }
  };

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const index = parseInt(accessIndex);
    if (!isNaN(index)) {
      handleAccess(index);
      setAccessIndex('');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(searchValue);
    if (!isNaN(value)) {
      handleSearch(value);
      setSearchValue('');
    }
  };

  const cellWidth = 70;
  const cellHeight = 50;
  const svgWidth = Math.max(800, (state.data.length + 2) * 80);
  const svgHeight = showMemoryAddresses ? 200 : 150;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Array Visualization</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Interactive array with memory layout demonstration
          </p>
        </div>

        {/* Current Operation Status */}
        {currentOperation && (
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {currentOperation}...
          </div>
        )}
      </div>

      {/* Array Visualization */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
        <svg width={svgWidth} height={svgHeight} className="w-full h-auto">
          {/* Memory Layout Background */}
          <defs>
            <pattern id="memoryGrid" width="80" height="20" patternUnits="userSpaceOnUse">
              <rect width="80" height="20" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
            </pattern>
          </defs>

          <rect width={svgWidth} height={svgHeight} fill="url(#memoryGrid)" opacity="0.3" />

          {/* Array Elements */}
          {state.data.map((element, index) => {
            const x = 50 + index * 80;
            const y = showMemoryAddresses ? 60 : 40;
            const isAnimating = animatingElements.has(element.id);
            const isSelected = selectedElement === element.id;

            return (
              <g key={element.id} className="array-element">
                {/* Memory Address (if enabled) */}
                {showMemoryAddresses && (
                  <text
                    x={x + cellWidth / 2}
                    y={y - 20}
                    textAnchor="middle"
                    className="text-xs font-mono fill-gray-500"
                  >
                    {getMemoryAddress(index)}
                  </text>
                )}

                {/* Array Cell */}
                <rect
                  x={x}
                  y={y}
                  width={cellWidth}
                  height={cellHeight}
                  fill={element.highlighted ? element.color : isSelected ? '#DBEAFE' : 'white'}
                  stroke={element.highlighted ? element.color : isSelected ? '#3B82F6' : '#D1D5DB'}
                  strokeWidth={element.highlighted || isSelected ? 2 : 1}
                  rx={4}
                  className={`cursor-pointer transition-all duration-300 ${
                    isAnimating ? 'animate-pulse' : ''
                  }`}
                  onClick={() => handleElementClick(element.id)}
                />

                {/* Value */}
                <text
                  x={x + cellWidth / 2}
                  y={y + cellHeight / 2 + 5}
                  textAnchor="middle"
                  className={`text-sm font-semibold ${
                    element.highlighted ? 'fill-white' : 'fill-gray-900'
                  }`}
                >
                  {element.value}
                </text>

                {/* Index (if enabled) */}
                {showIndices && (
                  <text
                    x={x + cellWidth / 2}
                    y={y + cellHeight + 15}
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    [{index}]
                  </text>
                )}
              </g>
            );
          })}

          {/* Array Label */}
          <text
            x={20}
            y={showMemoryAddresses ? 90 : 70}
            className="text-sm font-semibold fill-gray-700"
          >
            Array:
          </text>
        </svg>
      </div>

      {/* Operation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Insert Operation */}
        <form onSubmit={handleInsertSubmit} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Insert Element
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={!!currentOperation}
            />
            <input
              type="number"
              value={insertIndex}
              onChange={(e) => setInsertIndex(e.target.value)}
              placeholder="Index"
              min={0}
              max={state.data.length}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={!!currentOperation}
            />
          </div>
          <button
            type="submit"
            disabled={!!currentOperation || state.data.length >= maxSize}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Insert</span>
          </button>
        </form>

        {/* Access Operation */}
        <form onSubmit={handleAccessSubmit} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Access Element
          </label>
          <input
            type="number"
            value={accessIndex}
            onChange={(e) => setAccessIndex(e.target.value)}
            placeholder="Index"
            min={0}
            max={state.data.length - 1}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            disabled={!!currentOperation}
          />
          <button
            type="submit"
            disabled={!!currentOperation || state.data.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Access</span>
          </button>
        </form>

        {/* Search Operation */}
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Search Element
          </label>
          <input
            type="number"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Value"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            disabled={!!currentOperation}
          />
          <button
            type="submit"
            disabled={!!currentOperation || state.data.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        {/* Delete Operation */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Delete Element
          </label>
          <p className="text-xs text-gray-500">Click an element to delete it</p>
          <button
            onClick={() => {
              if (selectedElement) {
                const elementIndex = state.data.findIndex((el) => el.id === selectedElement);
                if (elementIndex >= 0) {
                  handleDelete(elementIndex);
                  clearSelection();
                }
              }
            }}
            disabled={!!currentOperation || !selectedElement}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
          >
            <Minus className="w-4 h-4" />
            <span>Delete Selected</span>
          </button>
        </div>
      </div>

      {/* Complexity Information */}
      {state.currentOperation && (
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              Operation: {state.currentOperation.description}
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Time Complexity:</span>
              <span className="ml-2 font-mono text-blue-900 dark:text-blue-100">
                {state.currentOperation.complexity.time}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">
                Space Complexity:
              </span>
              <span className="ml-2 font-mono text-blue-900 dark:text-blue-100">
                {state.currentOperation.complexity.space}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showIndices}
            onChange={() => {
              /* Will be handled by parent component */
            }}
            className="rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Show Indices</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showMemoryAddresses}
            onChange={() => {
              /* Will be handled by parent component */
            }}
            className="rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Show Memory Addresses</span>
        </label>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Size: {state.data.length}/{maxSize}
        </div>
      </div>
    </div>
  );
};

export default ArrayVisualization;
