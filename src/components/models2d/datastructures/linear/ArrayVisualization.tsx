import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Plus,
  Minus,
  Search,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Code,
  Zap,
  Lightbulb,
} from 'lucide-react';
import type {
  ArrayElement,
  Array2DElement,
  SparseArrayElement,
  DataStructureOperation,
} from '../../../../types/datastructures';
import {
  useVisualizationState,
  useVisualizationInteraction,
} from '../../../../hooks/useDataStructures';

interface ArrayVisualizationProps {
  isActive?: boolean;
  maxSize?: number;
  initialData?: number[];
  className?: string;
  debugState?: {
    isDebugging: boolean;
    dataStructureState: Record<string, unknown>;
    currentOperation?: {
      type: string;
      indices?: number[];
      values?: unknown[];
    };
  };
}

/**
 * Enhanced Interactive Array Visualization Component
 * Demonstrates array operations with memory layout, multiple array types, and educational examples
 */
export const ArrayVisualization: React.FC<ArrayVisualizationProps> = ({
  maxSize = 12,
  initialData = [42, 17, 89, 3, 56],
  className = '',
  debugState,
}) => {
  // Component state
  const [newValue, setNewValue] = useState<string>('');
  const [insertIndex, setInsertIndex] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [accessIndex, setAccessIndex] = useState<string>('');
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [arrayType, setArrayType] = useState<'static' | 'dynamic' | '2d' | 'sparse'>('static');
  const [showCode, setShowCode] = useState(false);
  const [currentExample, setCurrentExample] = useState<string>('default');

  // 2D Array state
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(4);
  const [insertRow, setInsertRow] = useState<string>('');
  const [insertCol, setInsertCol] = useState<string>('');
  const [accessRow, setAccessRow] = useState<string>('');
  const [accessCol, setAccessCol] = useState<string>('');

  // Sparse Array state
  const [sparseDefaultValue, setSparseDefaultValue] = useState<number>(0);
  const [sparseSize, setSparseSize] = useState<number>(10);

  // Animation state
  const [animatingElements, setAnimatingElements] = useState<Set<string>>(new Set());

  // Display options state
  const [showIndices, setShowIndices] = useState<boolean>(true);
  const [showMemoryAddresses, setShowMemoryAddresses] = useState<boolean>(false);

  // Convert initial data to appropriate format based on array type
  const initialElements = useMemo(() => {
    switch (arrayType) {
      case '2d': {
        // Pad initialData to rows * cols with zeros
        const matrixSize = rows * cols;
        const paddedData = [...initialData.slice(0, matrixSize)];
        while (paddedData.length < matrixSize) {
          paddedData.push(0);
        }
        const matrixData: Array2DElement[] = [];
        let index = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const value = paddedData[index];
            matrixData.push({
              id: `element-${r}-${c}`,
              value,
              row: r,
              col: c,
              index,
              position: { x: c * 70, y: r * 60 },
              highlighted: false,
              color: '#3B82F6',
            });
            index++;
          }
        }
        return matrixData;
      }

      case 'sparse': {
        // Create sparse array (only store non-default values)
        // Use initialData but ensure we have some non-default values for demonstration
        const demoData = initialData.length > 0 ? initialData : [5, 0, 0, 12, 0, 8, 0, 15, 0, 3];
        const sparseData: SparseArrayElement[] = [];
        demoData.forEach((value, idx) => {
          if (value !== sparseDefaultValue && idx < sparseSize) {
            sparseData.push({
              id: `sparse-${idx}`,
              value,
              index: sparseData.length, // index in sparse array
              originalIndex: idx, // original position
              position: { x: sparseData.length * 80, y: 0 },
              highlighted: false,
              color: '#3B82F6',
            });
          }
        });
        return sparseData;
      }

      default: // 'static' or 'dynamic'
        return initialData.map((value, index) => ({
          id: `element-${index}`,
          value,
          index,
          position: { x: index * 80, y: 0 },
          highlighted: false,
          color: '#3B82F6',
        })) as ArrayElement[];
    }
  }, [initialData, arrayType, rows, cols, sparseDefaultValue, sparseSize]);

  const { state, actions } = useVisualizationState(initialElements);
  const { selectedElement, handleElementClick, clearSelection } = useVisualizationInteraction();

  // Update data when initialElements changes (e.g., when array type changes)
  React.useEffect(() => {
    actions.updateData(initialElements);
    clearSelection();
  }, [initialElements, actions, clearSelection]);

  // Use debug state if debugging is active
  const currentData = useMemo(() => {
    if (debugState?.isDebugging && debugState.dataStructureState.array) {
      const debugArray = debugState.dataStructureState.array as number[];
      if (Array.isArray(debugArray)) {
        return debugArray.map((value, index) => ({
          id: `debug-element-${index}`,
          value,
          index,
          position: { x: index * 80, y: 0 },
          highlighted: debugState.currentOperation?.indices?.includes(index) || false,
          color: debugState.currentOperation?.indices?.includes(index) ? '#F59E0B' : '#3B82F6',
        })) as ArrayElement[];
      }
    }
    return state.data;
  }, [debugState, state.data]);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);

  // Mouse-based drag and drop handlers for SVG
  const handleMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    setIsDragging(true);
    setDragStartIndex(index);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(() => {
    // Drag over logic removed for simplicity
  }, []);

  const handleMouseUp = useCallback(
    (_e: React.MouseEvent, dropIndex: number) => {
      if (isDragging && dragStartIndex !== null && dragStartIndex !== dropIndex) {
        // Perform the move operation
        const newData = [...currentData];
        const [draggedItem] = newData.splice(dragStartIndex, 1);
        newData.splice(dropIndex, 0, draggedItem);

        // Update indices and positions
        const updatedData = newData.map((el, index) => ({
          ...el,
          id: `element-${index}`,
          index,
          position: { x: index * 80, y: 0 },
        }));

        actions.updateData(updatedData, {
          type: 'custom',
          description: `Moved element from index ${dragStartIndex} to ${dropIndex}`,
          complexity: { time: 'O(n)', space: 'O(1)' },
        });
      }

      setIsDragging(false);
      setDragStartIndex(null);
    },
    [isDragging, dragStartIndex, currentData, actions]
  );

  // Global mouse up handler to handle drag end outside elements
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragStartIndex(null);
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

  // Update visualization when debug state changes
  React.useEffect(() => {
    if (debugState?.isDebugging && debugState.dataStructureState.array) {
      const debugArray = debugState.dataStructureState.array as number[];
      if (Array.isArray(debugArray)) {
        const debugElements = debugArray.map((value, index) => ({
          id: `debug-element-${index}`,
          value,
          index,
          position: { x: index * 80, y: 0 },
          highlighted: debugState.currentOperation?.indices?.includes(index) || false,
          color: debugState.currentOperation?.indices?.includes(index) ? '#F59E0B' : '#3B82F6',
        })) as ArrayElement[];
        actions.updateData(debugElements);
      }
    }
  }, [debugState, actions]);

  // Enhanced examples with real-world analogies
  const examples = useMemo(
    () => ({
      default: {
        data: [42, 17, 89, 3, 56],
        description: 'Basic integer array',
        analogy: 'A simple list of numbers',
        icon: '📊',
      },
      grades: {
        data: [95, 87, 92, 78, 88, 96, 83],
        description: 'Student test scores (0-100)',
        analogy: '📚 Report card grades',
        icon: '🎓',
      },
      temperatures: {
        data: [72, 68, 75, 71, 69, 73, 70],
        description: 'Daily temperatures (°F)',
        analogy: '🌡️ Weather forecast data',
        icon: '🌤️',
      },
      fibonacci: {
        data: [0, 1, 1, 2, 3, 5, 8, 13],
        description: 'Fibonacci sequence',
        analogy: '🐰 Rabbit population growth',
        icon: '🔢',
      },
      primes: {
        data: [2, 3, 5, 7, 11, 13, 17, 19],
        description: 'Prime numbers',
        analogy: '🔍 Building blocks of math',
        icon: '🧮',
      },
      shopping: {
        data: [29, 15, 89, 45, 12, 67],
        description: 'Shopping cart prices ($)',
        analogy: '🛒 Items in your cart',
        icon: '🛍️',
      },
      scores: {
        data: [1500, 2300, 1800, 2100, 1900],
        description: 'Video game high scores',
        analogy: '🎮 Leaderboard rankings',
        icon: '🏆',
      },
      pixels: {
        data: [255, 128, 64, 192, 96, 160, 224],
        description: 'Image pixel values (0-255)',
        analogy: '🎨 Digital photo colors',
        icon: '🖼️',
      },
      inventory: {
        data: [5, 12, 3, 8, 15, 2, 9],
        description: 'Store inventory counts',
        analogy: '🏪 Stock in warehouse',
        icon: '📦',
      },
      playlist: {
        data: [1, 3, 7, 2, 5, 8, 4],
        description: 'Music playlist track numbers',
        analogy: '🎵 Song queue order',
        icon: '🎶',
      },
      sensors: {
        data: [23, 45, 67, 12, 89, 34, 56],
        description: 'IoT sensor readings',
        analogy: '📡 Smart home data',
        icon: '🏠',
      },
    }),
    []
  );

  // Load example data
  const loadExample = useCallback(
    (exampleKey: string) => {
      const example = examples[exampleKey as keyof typeof examples];
      if (example) {
        let newElements: ArrayElement[] | Array2DElement[] | SparseArrayElement[];

        switch (arrayType) {
          case '2d': {
            // Create 2D matrix from example data
            const matrixSize = rows * cols;
            const paddedData = [...example.data.slice(0, matrixSize)];
            while (paddedData.length < matrixSize) {
              paddedData.push(0);
            }
            const matrixData: Array2DElement[] = [];
            let index = 0;
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                const value = paddedData[index];
                matrixData.push({
                  id: `element-${r}-${c}`,
                  value,
                  row: r,
                  col: c,
                  index,
                  position: { x: c * 70, y: r * 60 },
                  highlighted: false,
                  color: '#3B82F6',
                });
                index++;
              }
            }
            newElements = matrixData;
            break;
          }

          case 'sparse': {
            // Create sparse array - only store non-default values
            const sparseData: SparseArrayElement[] = [];
            example.data.forEach((value, idx) => {
              if (value !== sparseDefaultValue && idx < sparseSize) {
                sparseData.push({
                  id: `sparse-${idx}`,
                  value,
                  index: sparseData.length, // index in sparse array
                  originalIndex: idx, // original position
                  position: { x: idx * 80, y: 0 }, // position based on original index
                  highlighted: false,
                  color: '#3B82F6',
                });
              }
            });
            newElements = sparseData;
            break;
          }

          default: {
            // static or dynamic - create 1D elements
            newElements = example.data.map((value, index) => ({
              id: `element-${index}`,
              value,
              index,
              position: { x: index * 80, y: 0 },
              highlighted: false,
              color: '#3B82F6',
            })) as ArrayElement[];
            break;
          }
        }

        actions.updateData(newElements);
        setCurrentExample(exampleKey);
        clearSelection();
      }
    },
    [examples, actions, clearSelection, arrayType, rows, cols, sparseDefaultValue, sparseSize]
  );

  // Handle array operations
  const handleInsert = useCallback(
    (index: number, value: number, row?: number, col?: number) => {
      if (arrayType === '2d') {
        // Handle 2D array insert
        if (row === undefined || col === undefined) return;
        if (row < 0 || row >= rows || col < 0 || col >= cols) return;

        setCurrentOperation('insert');
        const newElements = [...state.data];

        // Find the element at the specified position
        const existingElement = newElements.find(
          (el) => (el as Array2DElement).row === row && (el as Array2DElement).col === col
        ) as Array2DElement;

        if (existingElement) {
          // Update existing element
          existingElement.value = value;
          existingElement.highlighted = true;
          existingElement.color = '#10B981';
        } else {
          // Add new element (for sparse-like behavior, but we'll keep it simple)
          const newElement: Array2DElement = {
            id: `element-${row}-${col}`,
            value,
            row,
            col,
            index: row * cols + col,
            position: { x: col * 70, y: row * 60 },
            highlighted: true,
            color: '#10B981',
          };
          newElements.push(newElement);
        }

        const operation: DataStructureOperation = {
          type: 'insert',
          index: row * cols + col,
          value,
          description: `Insert ${value} at position [${row},${col}]`,
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
        }, 1000);
      } else {
        // Handle 1D array insert
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
      }
    },
    [state.data, maxSize, actions, arrayType, rows, cols]
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
    (index: number, row?: number, col?: number) => {
      if (arrayType === '2d') {
        // Handle 2D array access
        if (row === undefined || col === undefined) return;
        if (row < 0 || row >= rows || col < 0 || col >= cols) return;

        setCurrentOperation('access');
        const element = state.data.find(
          (el) => (el as Array2DElement).row === row && (el as Array2DElement).col === col
        ) as Array2DElement;

        if (element) {
          const newElements = [...state.data];
          const elementIndex = newElements.findIndex(
            (el) => (el as Array2DElement).row === row && (el as Array2DElement).col === col
          );

          if (elementIndex >= 0) {
            newElements[elementIndex] = {
              ...newElements[elementIndex],
              highlighted: true,
              color: '#F59E0B',
            };

            const operation: DataStructureOperation = {
              type: 'access',
              index: row * cols + col,
              description: `Access element at position [${row},${col}] → ${element.value}`,
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
          }
        }
      } else {
        // Handle 1D array access
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
      }
    },
    [state.data, actions, arrayType, rows, cols]
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
    const value = parseInt(newValue);
    if (!isNaN(value)) {
      if (arrayType === '2d') {
        const row = parseInt(insertRow);
        const col = parseInt(insertCol);
        if (!isNaN(row) && !isNaN(col)) {
          handleInsert(0, value, row, col); // index not used for 2D
          setInsertRow('');
          setInsertCol('');
        }
      } else {
        const index = parseInt(insertIndex);
        if (!isNaN(index)) {
          handleInsert(index, value);
        }
      }
      setNewValue('');
      setInsertIndex('');
    }
  };

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (arrayType === '2d') {
      const row = parseInt(accessRow);
      const col = parseInt(accessCol);
      if (!isNaN(row) && !isNaN(col)) {
        handleAccess(0, row, col); // index not used for 2D
        setAccessRow('');
        setAccessCol('');
      }
    } else {
      const index = parseInt(accessIndex);
      if (!isNaN(index)) {
        handleAccess(index);
        setAccessIndex('');
      }
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

  // Generate code example based on current operation
  const getCodeExample = () => {
    const arrayName = 'myArray';
    const currentData = state.data.map((el) => el.value);

    switch (currentOperation) {
      case 'insert':
        return `// Insert element at specific index
let ${arrayName} = [${currentData.slice(0, -1).join(', ')}];
${arrayName}.splice(${insertIndex}, 0, ${newValue});
// Result: [${currentData.join(', ')}]`;

      case 'delete':
        return `// Delete element at index
let ${arrayName} = [${currentData.join(', ')}];
const deleted = ${arrayName}.splice(${selectedElement ? state.data.findIndex((el) => el.id === selectedElement) : 0}, 1);
// Result: [${currentData.filter((_, i) => i !== (selectedElement ? state.data.findIndex((el) => el.id === selectedElement) : 0)).join(', ')}]`;

      case 'access':
        return `// Access element by index (O(1))
let ${arrayName} = [${currentData.join(', ')}];
const value = ${arrayName}[${accessIndex}];
// Result: ${currentData[parseInt(accessIndex)] || 'undefined'}`;

      case 'search':
        return `// Linear search (O(n))
let ${arrayName} = [${currentData.join(', ')}];
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}
const index = linearSearch(${arrayName}, ${searchValue});
// Result: ${currentData.indexOf(parseInt(searchValue))}`;

      default:
        return `// Array declaration and basic operations
let ${arrayName} = [${currentData.join(', ')}];

// Access: O(1)
const firstElement = ${arrayName}[0];

// Insert: O(n)
${arrayName}.push(99);

// Delete: O(n)
${arrayName}.pop();

// Length
console.log(${arrayName}.length); // ${currentData.length}`;
    }
  };

  // Cell dimensions
  const cellWidth = 60;
  const cellHeight = 45;

  // Calculate SVG dimensions based on array type
  const getSvgDimensions = () => {
    const indexHeight = showIndices ? 20 : 0; // Extra space for index text
    const memoryHeight = showMemoryAddresses ? 20 : 0; // Extra space for memory addresses

    switch (arrayType) {
      case '2d': {
        const gridWidth = cols * (cellWidth + 10) + 40;
        const gridHeight = rows * (cellHeight + 10) + 80 + indexHeight + memoryHeight;
        return { width: Math.min(800, Math.max(400, gridWidth)), height: gridHeight };
      }

      case 'sparse': {
        const sparseWidth = Math.min(800, Math.max(400, sparseSize * (cellWidth + 10) + 40));
        const sparseHeight = cellHeight + 40 + indexHeight + memoryHeight;
        return { width: sparseWidth, height: sparseHeight };
      }

      default: {
        // static or dynamic
        const linearWidth = Math.min(
          800,
          Math.max(400, (state.data.length + 1) * (cellWidth + 10))
        );
        const linearHeight = cellHeight + 40 + indexHeight + memoryHeight;
        return { width: linearWidth, height: linearHeight };
      }
    }
  };

  const { width: svgWidth, height: svgHeight } = getSvgDimensions();

  return (
    <div
      className={`bg-white border border-blue-200 rounded-xl p-4 sm:p-6 lg:p-8 space-y-6 ${className}`}
      aria-label="Array Visualization"
    >
      {/* Sticky Header with Array Type Selection and Controls */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-blue-100 pb-2 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
            Interactive Array Visualization
          </h3>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Explore different array types and operations with real-time animations
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <select
            value={arrayType}
            onChange={(e) => setArrayType(e.target.value as 'static' | 'dynamic' | '2d' | 'sparse')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            aria-label="Array Type"
          >
            <option value="static">Static Array</option>
            <option value="dynamic">Dynamic Array</option>
            <option value="2d">2D Array</option>
            <option value="sparse">Sparse Array</option>
          </select>
          {arrayType === '2d' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Rows:</span>
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={10}
                className="w-12 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                aria-label="Rows"
              />
              <span className="text-sm text-gray-600">Cols:</span>
              <input
                type="number"
                value={cols}
                onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={10}
                className="w-12 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                aria-label="Columns"
              />
            </div>
          )}
          {arrayType === 'sparse' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Default:</span>
              <input
                type="number"
                value={sparseDefaultValue}
                onChange={(e) => setSparseDefaultValue(parseInt(e.target.value) || 0)}
                className="w-12 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                aria-label="Sparse Default Value"
              />
              <span className="text-sm text-gray-600">Size:</span>
              <input
                type="number"
                value={sparseSize}
                onChange={(e) => setSparseSize(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={20}
                className="w-12 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                aria-label="Sparse Size"
              />
            </div>
          )}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
              showCode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label="Toggle Code Example"
          >
            <Code className="w-4 h-4" />
            <span>Code</span>
          </button>
        </div>
      </div>

      {/* Enhanced Examples Section */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-500" />
          Real-World Examples - Click to Explore!
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Object.entries(examples).map(([key, example]) => (
            <button
              key={key}
              onClick={() => loadExample(key)}
              className={`group p-3 sm:p-4 rounded-xl text-left transition-all duration-200 hover:scale-105 ${
                currentExample === key
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg ring-2 ring-blue-300'
                  : 'bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 border border-blue-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">{example.icon}</span>
                <div
                  className={`font-semibold text-sm capitalize ${
                    currentExample === key
                      ? 'text-white'
                      : 'text-gray-800 group-hover:text-blue-800'
                  }`}
                >
                  {key}
                </div>
              </div>
              <div
                className={`text-xs leading-tight ${
                  currentExample === key
                    ? 'text-blue-100'
                    : 'text-gray-600 group-hover:text-gray-700'
                }`}
              >
                {example.analogy}
              </div>
              <div
                className={`text-xs mt-1 font-medium ${
                  currentExample === key ? 'text-blue-200' : 'text-blue-600'
                }`}
              >
                {example.data.length} items
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 p-3 bg-white/70 rounded-lg border border-blue-200">
          <div className="flex items-center text-sm">
            <span className="font-medium text-blue-900 mr-2">Current Example:</span>
            <span className="text-blue-800">
              {examples[currentExample as keyof typeof examples]?.analogy}
            </span>
            <span className="mx-2 text-blue-400">•</span>
            <span className="text-blue-700">
              {examples[currentExample as keyof typeof examples]?.description}
            </span>
          </div>
        </div>
      </div>

      {/* Code Example Pane */}
      {showCode && (
        <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">JavaScript Code Example</h4>
            <button onClick={() => setShowCode(false)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>
          <pre className="whitespace-pre-wrap">{getCodeExample()}</pre>
        </div>
      )}

      {/* Array Visualization with Controls */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side: Array Visualization */}
        <div className="xl:col-span-2">
          <div
            className={`border border-gray-200 rounded-lg p-6 ${
              arrayType === 'static'
                ? 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
                : arrayType === 'dynamic'
                  ? 'bg-gradient-to-br from-green-50 via-white to-emerald-50'
                  : arrayType === '2d'
                    ? 'bg-gradient-to-br from-purple-50 via-white to-violet-50'
                    : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'
            }`}
          >
            {/* Array Type Header with proper spacing */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      arrayType === 'static'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : arrayType === 'dynamic'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : arrayType === '2d'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                    }`}
                  >
                    {arrayType === 'static'
                      ? '🔒 Static Array'
                      : arrayType === 'dynamic'
                        ? '🔄 Dynamic Array'
                        : arrayType === '2d'
                          ? '📊 2D Array'
                          : '🎯 Sparse Array'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {arrayType === '2d'
                      ? `${rows}×${cols} matrix`
                      : arrayType === 'sparse'
                        ? `${currentData.length} stored values (default: ${sparseDefaultValue})`
                        : `${currentData.length} elements`}
                  </div>
                </div>
              </div>
            </div>

            <svg
              width={svgWidth}
              height={svgHeight}
              className="w-full h-auto"
              aria-label="Array SVG"
            >
              {/* Memory Layout Background */}
              <defs>
                <pattern id="memoryGrid" width="80" height="20" patternUnits="userSpaceOnUse">
                  <rect width="80" height="20" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
                </pattern>
              </defs>

              <rect width={svgWidth} height={svgHeight} fill="url(#memoryGrid)" opacity="0.3" />

              {/* Render based on array type */}
              {arrayType === '2d' ? (
                /* 2D Array (Matrix) Visualization */
                <>
                  {/* Group elements by row for true matrix rendering */}
                  {Array.from({ length: rows }).map((_, r) => (
                    <g key={`row-${r}`}>
                      {Array.from({ length: cols }).map((_, c) => {
                        const el = state.data.find(
                          (e) => (e as Array2DElement).row === r && (e as Array2DElement).col === c
                        ) as Array2DElement | undefined;
                        if (!el) return null;
                        const x = 30 + c * (cellWidth + 10);
                        const y = 40 + r * (cellHeight + 10);
                        const isAnimating = animatingElements.has(el.id);
                        const isSelected = selectedElement === el.id;
                        return (
                          <g key={el.id} className="array-element">
                            {/* Memory Address (if enabled) */}
                            {showMemoryAddresses && (
                              <text
                                x={x + cellWidth / 2}
                                y={y - 18}
                                textAnchor="middle"
                                className="text-xs font-mono font-medium fill-gray-600"
                              >
                                {getMemoryAddress(el.index)}
                              </text>
                            )}
                            {/* Array Cell */}
                            <rect
                              x={x}
                              y={y}
                              width={cellWidth}
                              height={cellHeight}
                              fill={el.highlighted ? el.color : isSelected ? '#DBEAFE' : 'white'}
                              stroke={
                                el.highlighted ? el.color : isSelected ? '#3B82F6' : '#D1D5DB'
                              }
                              strokeWidth={el.highlighted || isSelected ? 2 : 1}
                              rx={4}
                              className={`cursor-pointer transition-all duration-300 ${isAnimating ? 'shadow-lg ring-2 ring-blue-400' : ''}`}
                              onClick={() => handleElementClick(el.id)}
                              aria-label={`Array cell [${el.row},${el.col}] value ${el.value}`}
                            >
                              <title>{`Value: ${el.value}\nIndex: [${el.row},${el.col}]${showMemoryAddresses ? `\nMemory: ${getMemoryAddress(el.index)}` : ''}`}</title>
                            </rect>
                            {/* Value */}
                            <text
                              x={x + cellWidth / 2}
                              y={y + cellHeight / 2 + 5}
                              textAnchor="middle"
                              className={`text-sm font-semibold ${el.highlighted ? 'fill-white' : 'fill-gray-900'}`}
                            >
                              {el.value}
                            </text>
                            {/* Index (if enabled) */}
                            {showIndices && (
                              <text
                                x={x + cellWidth / 2}
                                y={y + cellHeight + 18}
                                textAnchor="middle"
                                className="text-xs font-medium fill-gray-700"
                              >
                                [{el.row},{el.col}]
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  ))}
                </>
              ) : arrayType === 'sparse' ? (
                /* Sparse Array Visualization */
                <>
                  {/* Show original array indices */}
                  {Array.from({ length: sparseSize }, (_, i) => i).map((originalIndex) => {
                    const sparseElement = currentData.find(
                      (el) => (el as SparseArrayElement).originalIndex === originalIndex
                    ) as SparseArrayElement;
                    const hasValue = sparseElement !== undefined;
                    const x = 30 + originalIndex * (cellWidth + 10);
                    const y = showMemoryAddresses ? 55 : 35;
                    const isSelected = hasValue && selectedElement === sparseElement.id;

                    return (
                      <g key={`original-${originalIndex}`}>
                        {/* Memory Address (if enabled) */}
                        {showMemoryAddresses && (
                          <text
                            x={x + cellWidth / 2}
                            y={y - 22}
                            textAnchor="middle"
                            className="text-xs font-mono font-medium fill-gray-600"
                          >
                            {getMemoryAddress(originalIndex)}
                          </text>
                        )}

                        {/* Array Cell */}
                        <rect
                          x={x}
                          y={y}
                          width={cellWidth}
                          height={cellHeight}
                          fill={
                            hasValue
                              ? sparseElement.highlighted
                                ? sparseElement.color
                                : 'white'
                              : '#F3F4F6'
                          }
                          stroke={
                            hasValue
                              ? sparseElement.highlighted
                                ? sparseElement.color
                                : '#D1D5DB'
                              : '#E5E7EB'
                          }
                          strokeWidth={hasValue && sparseElement.highlighted ? 2 : 1}
                          rx={4}
                          className={`transition-all duration-300 ${isSelected ? 'shadow-lg ring-2 ring-blue-400' : ''}`}
                          aria-label={`Sparse cell [${originalIndex}] value ${hasValue ? sparseElement.value : sparseDefaultValue}`}
                        >
                          <title>{`Value: ${hasValue ? sparseElement.value : sparseDefaultValue}\nIndex: [${originalIndex}]${showMemoryAddresses ? `\nMemory: ${getMemoryAddress(originalIndex)}` : ''}`}</title>
                        </rect>

                        {/* Value or Default */}
                        <text
                          x={x + cellWidth / 2}
                          y={y + cellHeight / 2 + 5}
                          textAnchor="middle"
                          className={`text-sm font-semibold ${hasValue && sparseElement.highlighted ? 'fill-white' : hasValue ? 'fill-gray-900' : 'fill-gray-400'}`}
                        >
                          {hasValue ? sparseElement.value : sparseDefaultValue}
                        </text>

                        {/* Index (if enabled) */}
                        {showIndices && (
                          <text
                            x={x + cellWidth / 2}
                            y={y + cellHeight + 18}
                            textAnchor="middle"
                            className="text-xs font-medium fill-gray-700"
                          >
                            [{originalIndex}]
                          </text>
                        )}
                      </g>
                    );
                  })}
                </>
              ) : (
                /* 1D Array (Static/Dynamic) Visualization */
                <>
                  {currentData.map((element, index) => {
                    const x = 30 + index * (cellWidth + 10);
                    const y = showMemoryAddresses ? 55 : 35;
                    const isAnimating = animatingElements.has(element.id);
                    const isSelected = selectedElement === element.id;

                    return (
                      <g key={element.id} className="array-element">
                        {/* Memory Address (if enabled) */}
                        {showMemoryAddresses && (
                          <text
                            x={x + cellWidth / 2}
                            y={y - 22}
                            textAnchor="middle"
                            className="text-xs font-mono font-medium fill-gray-600"
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
                          fill={
                            element.highlighted ? element.color : isSelected ? '#DBEAFE' : 'white'
                          }
                          stroke={
                            element.highlighted ? element.color : isSelected ? '#3B82F6' : '#D1D5DB'
                          }
                          strokeWidth={element.highlighted || isSelected ? 2 : 1}
                          rx={4}
                          className={`cursor-pointer transition-all duration-300 ${isAnimating ? 'shadow-lg ring-2 ring-blue-400' : ''}`}
                          onClick={() => handleElementClick(element.id)}
                          onMouseDown={(e) => handleMouseDown(e, index)}
                          onMouseMove={() => handleMouseMove()}
                          onMouseUp={(e) => handleMouseUp(e, index)}
                          aria-label={`Array cell [${index}] value ${element.value}`}
                        >
                          <title>{`Value: ${element.value}\nIndex: [${index}]${showMemoryAddresses ? `\nMemory: ${getMemoryAddress(index)}` : ''}`}</title>
                        </rect>

                        {/* Value */}
                        <text
                          x={x + cellWidth / 2}
                          y={y + cellHeight / 2 + 5}
                          textAnchor="middle"
                          className={`text-sm font-semibold ${element.highlighted ? 'fill-white' : 'fill-gray-900'}`}
                        >
                          {element.value}
                        </text>

                        {/* Index (if enabled) */}
                        {showIndices && (
                          <text
                            x={x + cellWidth / 2}
                            y={y + cellHeight + 18}
                            textAnchor="middle"
                            className="text-xs font-medium fill-gray-700"
                          >
                            [{index}]
                          </text>
                        )}
                      </g>
                    );
                  })}
                </>
              )}
            </svg>

            {/* Summary Bar Below Visualization */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 text-blue-900 text-sm font-medium">
                <span>
                  Type: <span className="font-bold capitalize">{arrayType}</span>
                </span>
                <span>
                  Size: <span className="font-bold">{currentData.length}</span>
                </span>
                <span>
                  Max Size: <span className="font-bold">{maxSize}</span>
                </span>
              </div>
              {state.currentOperation && (
                <div className="text-blue-800 text-sm">
                  Last Operation:{' '}
                  <span className="font-bold">{state.currentOperation.description}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Controls */}
        <div className="xl:col-span-1 space-y-6">
          {/* Animation Controls */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <Play className="w-4 h-4 mr-2" />
              Animation Controls
            </h4>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => actions.prevStep()}
                  disabled={!state.history || state.currentStep === 0}
                  className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  title="Previous Step"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={state.isPlaying ? actions.pause : actions.play}
                  className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  title={state.isPlaying ? 'Pause' : 'Play'}
                >
                  {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => actions.nextStep()}
                  disabled={!state.history || state.currentStep >= state.totalSteps - 1}
                  className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  title="Next Step"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={actions.reset}
                  className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">Speed:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={state.speed}
                    onChange={(e) => actions.setSpeed(parseFloat(e.target.value))}
                    className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 min-w-[2rem]">{state.speed}x</span>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600 font-medium">
                Step {state.currentStep + 1} of {state.totalSteps}
              </div>
            </div>
          </div>

          {/* Operation Controls */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Array Operations
            </h4>

            {/* Insert Operation */}
            <form
              onSubmit={handleInsertSubmit}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <label className="block font-medium text-gray-800 text-sm">Insert Element</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!!currentOperation}
                />
                {arrayType === '2d' ? (
                  <>
                    <input
                      type="number"
                      value={insertRow}
                      onChange={(e) => setInsertRow(e.target.value)}
                      placeholder="Row"
                      min={0}
                      max={rows - 1}
                      className="w-12 px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!!currentOperation}
                    />
                    <input
                      type="number"
                      value={insertCol}
                      onChange={(e) => setInsertCol(e.target.value)}
                      placeholder="Col"
                      min={0}
                      max={cols - 1}
                      className="w-12 px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!!currentOperation}
                    />
                  </>
                ) : (
                  <input
                    type="number"
                    value={insertIndex}
                    onChange={(e) => setInsertIndex(e.target.value)}
                    placeholder="Index"
                    min={0}
                    max={arrayType === 'sparse' ? sparseSize - 1 : state.data.length}
                    className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!!currentOperation}
                  />
                )}
              </div>
              <button
                type="submit"
                disabled={
                  !!currentOperation || (arrayType !== 'sparse' && state.data.length >= maxSize)
                }
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Plus className="w-4 h-4" />
                <span>Insert</span>
              </button>
            </form>

            {/* Access Operation */}
            <form
              onSubmit={handleAccessSubmit}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <label className="block font-medium text-gray-800 text-sm">Access Element</label>
              {arrayType === '2d' ? (
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={accessRow}
                    onChange={(e) => setAccessRow(e.target.value)}
                    placeholder="Row"
                    min={0}
                    max={rows - 1}
                    className="flex-1 px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!!currentOperation}
                  />
                  <input
                    type="number"
                    value={accessCol}
                    onChange={(e) => setAccessCol(e.target.value)}
                    placeholder="Col"
                    min={0}
                    max={cols - 1}
                    className="flex-1 px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!!currentOperation}
                  />
                </div>
              ) : (
                <input
                  type="number"
                  value={accessIndex}
                  onChange={(e) => setAccessIndex(e.target.value)}
                  placeholder="Index"
                  min={0}
                  max={arrayType === 'sparse' ? sparseSize - 1 : state.data.length - 1}
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!!currentOperation}
                />
              )}
              <button
                type="submit"
                disabled={!!currentOperation || state.data.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Zap className="w-4 h-4" />
                <span>Access</span>
              </button>
            </form>

            {/* Search Operation */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <label className="block font-medium text-gray-800 text-sm">Search Element</label>
              <input
                type="number"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Value"
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!!currentOperation}
              />
              <button
                type="submit"
                disabled={!!currentOperation || state.data.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </form>

            {/* Delete Operation */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <label className="block font-medium text-gray-800 text-sm">Delete Element</label>
              <p className="text-xs text-gray-600">
                {arrayType === '2d'
                  ? 'Click an element to delete it'
                  : arrayType === 'sparse'
                    ? 'Click a stored value to remove it'
                    : 'Click an element to delete it'}
              </p>
              <button
                onClick={() => {
                  if (selectedElement) {
                    if (arrayType === '2d') {
                      const element = state.data.find(
                        (el) => el.id === selectedElement
                      ) as Array2DElement;
                      if (element) {
                        // For 2D arrays, we need to implement delete logic
                        // For now, just clear selection
                        clearSelection();
                      }
                    } else {
                      const elementIndex = state.data.findIndex((el) => el.id === selectedElement);
                      if (elementIndex >= 0) {
                        handleDelete(elementIndex);
                        clearSelection();
                      }
                    }
                  }
                }}
                disabled={!!currentOperation || !selectedElement}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Minus className="w-4 h-4" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complexity Information */}
      {state.currentOperation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-blue-900">
              Operation: {state.currentOperation.description}
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <span className="font-medium text-blue-800">Time Complexity:</span>
              <span className="ml-2 font-mono text-blue-900 text-lg">
                {state.currentOperation.complexity.time}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Space Complexity:</span>
              <span className="ml-2 font-mono text-blue-900 text-lg">
                {state.currentOperation.complexity.space}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Educational Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-blue-900 mb-4">
          Understanding{' '}
          {arrayType === '2d' ? '2D Arrays' : arrayType === 'sparse' ? 'Sparse Arrays' : 'Arrays'}
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h5 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">
              Key Characteristics
            </h5>
            <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
              {arrayType === '2d' ? (
                <>
                  <li>
                    • <strong>Matrix Structure:</strong> Elements arranged in rows and columns
                  </li>
                  <li>
                    • <strong>2D Indexing:</strong> Access with [row][column] or [row*cols+column]
                  </li>
                  <li>
                    • <strong>Contiguous Memory:</strong> Stored in row-major or column-major order
                  </li>
                  <li>
                    • <strong>O(1) Access:</strong> Direct access to any element by coordinates
                  </li>
                </>
              ) : arrayType === 'sparse' ? (
                <>
                  <li>
                    • <strong>Space Efficient:</strong> Only stores non-default values
                  </li>
                  <li>
                    • <strong>Default Values:</strong> Assumes most elements have the same default
                    value
                  </li>
                  <li>
                    • <strong>Index Mapping:</strong> Maintains mapping between logical and physical
                    indices
                  </li>
                  <li>
                    • <strong>Memory Savings:</strong> Significant space reduction for sparse data
                  </li>
                </>
              ) : (
                <>
                  <li>
                    • <strong>Contiguous Memory:</strong> Elements stored in adjacent memory
                    locations
                  </li>
                  <li>
                    • <strong>Fixed Size:</strong>{' '}
                    {arrayType === 'static'
                      ? 'Cannot change size after creation'
                      : 'Can resize dynamically'}
                  </li>
                  <li>
                    • <strong>O(1) Access:</strong> Direct access to any element by index
                  </li>
                  <li>
                    • <strong>O(n) Insert/Delete:</strong> May require shifting elements
                  </li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">
              Real-World Applications
            </h5>
            <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
              {arrayType === '2d' ? (
                <>
                  <li>
                    • <strong>Images:</strong> Pixel matrices in digital images
                  </li>
                  <li>
                    • <strong>Spreadsheets:</strong> Data organized in rows and columns
                  </li>
                  <li>
                    • <strong>Matrices:</strong> Mathematical computations and transformations
                  </li>
                  <li>
                    • <strong>Games:</strong> 2D game boards and tile-based worlds
                  </li>
                </>
              ) : arrayType === 'sparse' ? (
                <>
                  <li>
                    • <strong>Large Datasets:</strong> Scientific data with many zero/default values
                  </li>
                  <li>
                    • <strong>Recommendation Systems:</strong> User-item matrices with sparse
                    ratings
                  </li>
                  <li>
                    • <strong>Text Analysis:</strong> Document-term matrices with few non-zero
                    entries
                  </li>
                  <li>
                    • <strong>Graph Algorithms:</strong> Adjacency matrices for sparse graphs
                  </li>
                </>
              ) : (
                <>
                  <li>
                    • <strong>Databases:</strong> Storing tabular data efficiently
                  </li>
                  <li>
                    • <strong>Images:</strong> Pixel arrays in digital images
                  </li>
                  <li>
                    • <strong>Buffers:</strong> Temporary storage for I/O operations
                  </li>
                  <li>
                    • <strong>Algorithms:</strong> Foundation for sorting and searching
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-200">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={showIndices}
            onChange={(e) => setShowIndices(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-700">Show Indices</span>
        </label>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={showMemoryAddresses}
            onChange={(e) => setShowMemoryAddresses(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-700">Show Memory Addresses</span>
        </label>
        <div className="text-gray-600">
          Size: {currentData.length}/{maxSize}
        </div>
      </div>
    </div>
  );
};

export default ArrayVisualization;
