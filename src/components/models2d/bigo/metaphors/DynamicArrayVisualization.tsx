// src/components/models2d/bigo/metaphors/DynamicArrayVisualization.tsx
// Interactive visualization of amortized analysis using dynamic arrays

import React, { useState, useEffect } from 'react';

interface DynamicArrayVisualizationProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface ArrayElement {
  value: number;
  isNew: boolean;
  isResizing: boolean;
}

const DynamicArrayVisualization: React.FC<DynamicArrayVisualizationProps> = ({
  className = '',
}) => {
  const [elements, setElements] = useState<ArrayElement[]>([]);
  const [capacity, setCapacity] = useState(4);
  const [size, setSize] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [amortizedCost, setAmortizedCost] = useState(0);

  // Initialize with some elements
  useEffect(() => {
    const initialElements: ArrayElement[] = [];
    for (let i = 0; i < 3; i++) {
      initialElements.push({ value: i + 1, isNew: false, isResizing: false });
    }
    setElements(initialElements);
    setSize(3);
    setTotalCost(3); // Cost of initial insertions
    setAmortizedCost(3 / 3); // 1.0
  }, []);

  const addElement = () => {
    if (size >= capacity) {
      // Need to resize
      setIsResizing(true);
      const newCapacity = capacity * 2;
      const newElements = [...elements];

      // Copy all existing elements (this costs O(n))
      for (let i = 0; i < elements.length; i++) {
        newElements[i] = { ...newElements[i], isResizing: true };
      }

      setTimeout(() => {
        // Add the new element
        newElements.push({ value: size + 1, isNew: true, isResizing: false });
        setElements(newElements);
        setCapacity(newCapacity);
        setSize(size + 1);
        setTotalCost(totalCost + capacity + 1); // Copy cost + insertion cost
        setAmortizedCost((totalCost + capacity + 1) / (size + 1));
        setIsResizing(false);
      }, 1000);
    } else {
      // Simple insertion
      const newElements = [...elements, { value: size + 1, isNew: true, isResizing: false }];
      setElements(newElements);
      setSize(size + 1);
      setTotalCost(totalCost + 1);
      setAmortizedCost((totalCost + 1) / (size + 1));
    }
  };

  const reset = () => {
    setElements([]);
    setCapacity(4);
    setSize(0);
    setIsResizing(false);
    setTotalCost(0);
    setAmortizedCost(0);
  };

  return (
    <div
      className={`relative w-full h-96 bg-white rounded-lg border-2 border-gray-200 p-4 ${className}`}
    >
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          Dynamic Array: Amortized O(1) Insertion
        </h3>
        <p className="text-sm text-gray-600">
          Watch how resizing costs are amortized over many operations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-blue-600">{size}</div>
          <div className="text-gray-600">Size</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-green-600">{capacity}</div>
          <div className="text-gray-600">Capacity</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-purple-600">{totalCost}</div>
          <div className="text-gray-600">Total Cost</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-orange-600">{amortizedCost.toFixed(2)}</div>
          <div className="text-gray-600">Avg Cost</div>
        </div>
      </div>

      {/* Array Visualization */}
      <div className="mb-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Array:</span>
          <div className="flex space-x-1">
            {Array.from({ length: capacity }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-8 border-2 rounded flex items-center justify-center text-xs font-bold
                  ${
                    i < size
                      ? elements[i]?.isResizing
                        ? 'bg-yellow-200 border-yellow-400 animate-pulse'
                        : elements[i]?.isNew
                          ? 'bg-green-200 border-green-400'
                          : 'bg-blue-100 border-blue-300'
                      : 'bg-gray-100 border-gray-300'
                  }`}
              >
                {i < size ? elements[i]?.value : ''}
              </div>
            ))}
          </div>
        </div>

        {isResizing && (
          <div className="text-center text-sm text-orange-600 font-medium animate-pulse">
            🔄 Resizing array from {capacity} to {capacity * 2} capacity...
          </div>
        )}
      </div>

      {/* Cost Visualization */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Operation Costs:</div>
        <div className="flex space-x-1">
          {Array.from({ length: Math.min(size, 20) }, (_, i) => {
            const cost = i + 1 <= capacity / 2 ? 1 : capacity / 2;
            return (
              <div
                key={i}
                className="flex flex-col items-center"
                title={`Operation ${i + 1}: Cost ${cost}`}
              >
                <div
                  className={`w-3 ${cost > 1 ? 'bg-red-400' : 'bg-green-400'} rounded-t`}
                  style={{ height: `${Math.min(cost * 10, 40)}px` }}
                ></div>
                <div className="text-xs text-gray-500 mt-1">{i + 1}</div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center space-x-4 mt-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>O(1) insertion</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>O(n) resize</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={addElement}
          disabled={isResizing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isResizing ? 'Resizing...' : 'Add Element'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
        >
          Reset
        </button>
      </div>

      {/* Explanation */}
      <div className="mt-4 text-xs text-gray-600 text-center">
        <p>
          <strong>Amortized Analysis:</strong> Even though some operations cost O(n), the average
          cost per operation is O(1) when spread over many insertions.
        </p>
      </div>
    </div>
  );
};

export default DynamicArrayVisualization;
