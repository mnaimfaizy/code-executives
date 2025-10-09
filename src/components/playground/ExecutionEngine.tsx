// src/components/playground/ExecutionEngine.tsx
// Execution engine with step-by-step debugging capabilities

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Eye } from 'lucide-react';
import { instrumentCode, type StackEvent } from '../../utils/instrument';
import { memoryMonitor, performanceMonitor } from '../../utils/memoryMonitor';
import type {
  ExecutionEngineProps,
  ExecutionResult,
  InstrumentedOperation,
  TestCase,
  ComplexityClass,
  DataStructureType,
} from '../../types/playground';

export interface DebugState {
  isDebugging: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  currentOperation: InstrumentedOperation | null;
  executionStack: InstrumentedOperation[];
  dataStructureState: Record<string, unknown>;
  variables: Record<string, unknown>;
  callStack: string[];
}

export interface ExecutionEnginePropsExtended extends ExecutionEngineProps {
  debugMode?: boolean;
  onDebugStateChange?: (state: DebugState) => void;
  onStep?: (operation: InstrumentedOperation, state: DebugState) => void;
}

const ExecutionEngine: React.FC<ExecutionEnginePropsExtended> = ({
  code,
  onResult,
  onOperation,
  debugMode = false,
  onDebugStateChange,
  onStep,
  className = '',
}) => {
  const [debugState, setDebugState] = useState<DebugState>({
    isDebugging: false,
    isPaused: false,
    currentStep: 0,
    totalSteps: 0,
    currentOperation: null,
    executionStack: [],
    dataStructureState: {},
    variables: {},
    callStack: [],
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const instrumentationRef = useRef<ReturnType<typeof instrumentCode> | null>(null);
  const stackEventsRef = useRef<StackEvent[]>([]);
  const memoryStatsRef = useRef<ReturnType<typeof memoryMonitor.getBrowserMemoryInfo>>(null);

  // Helper function to get educational explanations for operations
  const getOperationExplanation = useCallback((operation: InstrumentedOperation): string => {
    const explanations: Record<string, string> = {
      access: `Accessing element at index ${operation.indices?.[0] || 'unknown'}. This is an O(1) operation for arrays.`,
      insert: `Inserting value ${operation.values?.[0] || 'unknown'} into the data structure. Time complexity depends on the structure.`,
      delete: `Removing element from the data structure. This operation may require shifting elements in arrays.`,
      search: `Searching for value ${operation.values?.[0] || 'unknown'}. Linear search is O(n), binary search is O(log n).`,
      swap: `Swapping elements at indices ${operation.indices?.join(' and ') || 'unknown'}. Used in sorting algorithms.`,
      compare: `Comparing values ${operation.values?.join(' and ') || 'unknown'}. Fundamental operation in sorting and searching.`,
      traverse:
        'Iterating through all elements in the data structure. Always O(n) time complexity.',
    };

    const dataStructureExplanations: Record<string, string> = {
      Array:
        'Contiguous memory block with O(1) access by index, but O(n) insertions/deletions in the middle.',
      LinkedList:
        'Nodes connected by pointers. O(1) insertions/deletions at ends, O(n) access by index.',
      Stack: 'LIFO structure. Push/pop operations are O(1), access to middle elements is O(n).',
      Queue:
        'FIFO structure. Enqueue/dequeue operations are O(1), access to middle elements is O(n).',
    };

    const baseExplanation =
      explanations[operation.type] || `Performing ${operation.type} operation.`;
    const dataStructureInfo = dataStructureExplanations[operation.dataStructure] || '';

    return `${baseExplanation} ${dataStructureInfo}`;
  }, []);

  const updateDebugState = useCallback(
    (updates: Partial<DebugState>) => {
      setDebugState((prev) => {
        const newState = { ...prev, ...updates };
        onDebugStateChange?.(newState);
        return newState;
      });
    },
    [onDebugStateChange]
  );

  // Mock execution with debugging support
  const executeWithDebugging = useCallback(
    async (testCase?: TestCase): Promise<ExecutionResult> => {
      setIsExecuting(true);
      updateDebugState({
        isDebugging: true,
        isPaused: debugMode,
        currentStep: 0,
        executionStack: [],
        dataStructureState: {},
        variables: {},
        callStack: [],
      });

      try {
        // Start monitoring
        performanceMonitor.startMonitoring();

        // Instrument the code for real execution tracking
        const instrumentation = instrumentCode(code || '');
        instrumentationRef.current = instrumentation;
        stackEventsRef.current = [];

        // Track operations during execution
        const operations: InstrumentedOperation[] = [];
        let step = 0;
        const startTime = performance.now();

        // Enhanced operation tracking with real instrumentation
        const trackOperation = (type: string, details: Record<string, unknown>) => {
          const operation: InstrumentedOperation = {
            id: `${type}-${Date.now()}-${step}`,
            type: type as
              | 'access'
              | 'insert'
              | 'delete'
              | 'search'
              | 'swap'
              | 'compare'
              | 'traverse'
              | 'function-call'
              | 'function-return',
            dataStructure: (details.dataStructure as DataStructureType) || 'Array',
            indices: details.indices as number[] | undefined,
            values: details.values as unknown[] | undefined,
            timestamp: Date.now(),
            lineNumber: (details.lineNumber as number) || 1,
            functionName: (details.functionName as string) || 'main',
            complexity: (details.complexity as {
              time: ComplexityClass;
              space: ComplexityClass;
              explanation: string;
            }) || {
              time: 'O(1)',
              space: 'O(1)',
              explanation: `${type} operation`,
            },
          };

          operations.push(operation);
          onOperation(operation);

          setDebugState((prev) => ({
            ...prev,
            currentStep: step + 1,
            currentOperation: operation,
            executionStack: [...prev.executionStack, operation],
            dataStructureState: {
              ...prev.dataStructureState,
              [(operation.dataStructure as string).toLowerCase()]: details.state || {},
            },
            variables: {
              ...prev.variables,
              ...(details.variables as Record<string, unknown>),
            },
            callStack: [...prev.callStack, operation.functionName || 'main'],
          }));

          step++;
        };

        // Execute instrumented code with hooks
        instrumentation.run({
          __push: (label: string) => {
            stackEventsRef.current.push({ type: 'push', label });
            trackOperation('function-call', {
              dataStructure: 'CallStack',
              functionName: label,
              complexity: { time: 'O(1)', space: 'O(1)', explanation: 'Function call' },
            });
          },
          __pop: (label: string) => {
            stackEventsRef.current.push({ type: 'pop', label });
            trackOperation('function-return', {
              dataStructure: 'CallStack',
              functionName: label,
              complexity: { time: 'O(1)', space: 'O(1)', explanation: 'Function return' },
            });
          },
        });

        // Enhanced mock operations for data structure visualization
        const mockOperations: InstrumentedOperation[] = [
          {
            id: '1',
            type: 'access',
            dataStructure: 'Array',
            indices: [0],
            values: [5],
            timestamp: Date.now(),
            lineNumber: 1,
            functionName: 'main',
            complexity: {
              time: 'O(1)',
              space: 'O(1)',
              explanation: 'Array access by index',
            },
          },
          {
            id: '2',
            type: 'compare',
            dataStructure: 'Array',
            values: [5, 3],
            timestamp: Date.now() + 100,
            lineNumber: 2,
            functionName: 'main',
            complexity: {
              time: 'O(1)',
              space: 'O(1)',
              explanation: 'Value comparison',
            },
          },
          {
            id: '3',
            type: 'swap',
            dataStructure: 'Array',
            indices: [0, 1],
            values: [3, 5],
            timestamp: Date.now() + 200,
            lineNumber: 3,
            functionName: 'main',
            complexity: {
              time: 'O(1)',
              space: 'O(1)',
              explanation: 'Array element swap',
            },
          },
        ];

        // Add mock operations for demonstration
        for (const operation of mockOperations) {
          if (debugMode && debugState.isPaused) {
            await new Promise((resolve) => {
              const checkPaused = () => {
                if (!debugState.isPaused) {
                  resolve(void 0);
                } else {
                  setTimeout(checkPaused, 100);
                }
              };
              checkPaused();
            });
          }

          operations.push(operation);
          onOperation(operation);

          setDebugState((prev) => ({
            ...prev,
            currentStep: step + 1,
            currentOperation: operation,
            executionStack: [...prev.executionStack, operation],
            dataStructureState: {
              ...prev.dataStructureState,
              array: operation.values,
            },
            variables: {
              ...prev.variables,
              i: step,
              arr: operation.values,
            },
            callStack: ['main'],
          }));

          onStep?.(operation, debugState);
          step++;

          // Simulate execution time
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // Get memory stats
        const memoryInfo = memoryMonitor.getBrowserMemoryInfo();
        memoryStatsRef.current = memoryInfo;

        const finalResult: ExecutionResult = {
          success: true,
          output: testCase ? 'Mock output for test case' : 'Code executed successfully',
          executionTime,
          memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0, // Convert to MB
          operations,
        };

        onResult(finalResult);
        return finalResult;
      } catch (error) {
        const errorObj = {
          type: 'runtime' as const,
          message: error instanceof Error ? error.message : 'Unknown execution error',
        };

        const result: ExecutionResult = {
          success: false,
          output: '',
          executionTime: 0,
          memoryUsage: 0,
          operations: [],
          error: errorObj,
        };

        onResult(result);
        return result;
      } finally {
        setIsExecuting(false);
        updateDebugState({ isDebugging: false });

        // Stop monitoring
        performanceMonitor.stopMonitoring();
        memoryMonitor.stopMonitoring();
      }
    },
    [code, debugMode, onOperation, onResult, onStep, updateDebugState, debugState]
  );

  const stepForward = useCallback(() => {
    if (debugState.isPaused && debugState.currentStep < debugState.totalSteps) {
      updateDebugState({ isPaused: false });
    }
  }, [debugState.isPaused, debugState.currentStep, debugState.totalSteps, updateDebugState]);

  const pauseExecution = useCallback(() => {
    updateDebugState({ isPaused: true });
  }, [updateDebugState]);

  const resumeExecution = useCallback(() => {
    updateDebugState({ isPaused: false });
  }, [updateDebugState]);

  const clearDebugSession = useCallback(() => {
    try {
      localStorage.removeItem('code-executives-debug-session');
    } catch (error) {
      console.warn('Failed to clear debug session:', error);
    }
  }, []);

  // Session persistence for debugging states
  const saveDebugSession = useCallback(
    (state: DebugState) => {
      try {
        const sessionData = {
          debugState: state,
          code: code,
          timestamp: Date.now(),
        };
        localStorage.setItem('code-executives-debug-session', JSON.stringify(sessionData));
      } catch (error) {
        console.warn('Failed to save debug session:', error);
      }
    },
    [code]
  );

  const loadDebugSession = useCallback(() => {
    try {
      const saved = localStorage.getItem('code-executives-debug-session');
      if (saved) {
        const sessionData = JSON.parse(saved);
        // Only restore if the code matches
        if (sessionData.code === code) {
          return sessionData.debugState as DebugState;
        }
      }
    } catch (error) {
      console.warn('Failed to load debug session:', error);
    }
    return null;
  }, [code]);

  const resetExecution = useCallback(() => {
    updateDebugState({
      isDebugging: false,
      isPaused: false,
      currentStep: 0,
      currentOperation: null,
      executionStack: [],
      dataStructureState: {},
      variables: {},
      callStack: [],
    });
    clearDebugSession();
  }, [updateDebugState, clearDebugSession]);

  // Auto-save debug state changes
  useEffect(() => {
    if (debugState.isDebugging) {
      saveDebugSession(debugState);
    }
  }, [debugState, saveDebugSession]);

  // Load session on mount
  useEffect(() => {
    const savedState = loadDebugSession();
    if (savedState) {
      setDebugState(savedState);
      onDebugStateChange?.(savedState);
    }
  }, [loadDebugSession, onDebugStateChange]);

  if (!debugMode) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-600">Execution Engine - Standard execution mode</p>
        <button
          onClick={() => executeWithDebugging()}
          disabled={isExecuting}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                   text-white rounded-lg transition-colors"
        >
          {isExecuting ? 'Executing...' : 'Execute Code'}
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Debug Controls */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Eye className="w-5 h-5" />
          <span>Debug Controls</span>
        </h3>

        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={stepForward}
            disabled={
              !debugState.isPaused || debugState.currentStep >= debugState.totalSteps || isExecuting
            }
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                     text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
          >
            <SkipForward className="w-4 h-4" />
            <span>Step</span>
          </button>

          <button
            onClick={debugState.isPaused ? resumeExecution : pauseExecution}
            disabled={!debugState.isDebugging || isExecuting}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400
                     text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
          >
            {debugState.isPaused ? (
              <>
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            )}
          </button>

          <button
            onClick={resetExecution}
            disabled={isExecuting}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400
                     text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Debug Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Step:</span>
            <span className="ml-2 font-medium text-gray-900">
              {debugState.currentStep} / {debugState.totalSteps}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span
              className={`ml-2 font-medium ${
                debugState.isDebugging
                  ? debugState.isPaused
                    ? 'text-yellow-600'
                    : 'text-green-600'
                  : 'text-gray-500'
              }`}
            >
              {debugState.isDebugging ? (debugState.isPaused ? 'Paused' : 'Running') : 'Idle'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Call Stack:</span>
            <span className="ml-2 font-medium text-gray-900">{debugState.callStack.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Variables:</span>
            <span className="ml-2 font-medium text-gray-900">
              {Object.keys(debugState.variables).length}
            </span>
          </div>
        </div>
      </div>

      {/* Current Operation */}
      {debugState.currentOperation && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <span>Current Operation</span>
            <div className="group relative">
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {getOperationExplanation(debugState.currentOperation)}
              </div>
            </div>
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-medium text-gray-900">
                {debugState.currentOperation.type}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Data Structure:</span>
              <span className="ml-2 font-medium text-gray-900">
                {debugState.currentOperation.dataStructure}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Line:</span>
              <span className="ml-2 font-medium text-gray-900">
                {debugState.currentOperation.lineNumber}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Function:</span>
              <span className="ml-2 font-medium text-gray-900">
                {debugState.currentOperation.functionName}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Variables and Data Structures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Variables */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-2">Variables</h4>
          <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
            {Object.entries(debugState.variables).length > 0 ? (
              Object.entries(debugState.variables).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-blue-600 font-medium">{key}:</span>
                  <span className="text-gray-900">{JSON.stringify(value)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No variables</p>
            )}
          </div>
        </div>

        {/* Data Structure State */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-2">Data Structures</h4>
          <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
            {Object.entries(debugState.dataStructureState).length > 0 ? (
              Object.entries(debugState.dataStructureState).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-purple-600 font-medium">{key}:</span>
                  <span className="text-gray-900">{JSON.stringify(value)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No data structures</p>
            )}
          </div>
        </div>
      </div>

      {/* Educational Explanations */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Debugging Guide</span>
        </h4>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="bg-white rounded p-3">
            <h5 className="font-medium mb-1">What is Debugging?</h5>
            <p>
              Debugging is the process of finding and fixing errors in your code. Step-by-step
              execution helps you understand exactly what your algorithm is doing at each moment.
            </p>
          </div>

          <div className="bg-white rounded p-3">
            <h5 className="font-medium mb-1">Key Concepts:</h5>
            <ul className="space-y-1 ml-4">
              <li>
                <strong>Variables:</strong> Store data values that change during execution
              </li>
              <li>
                <strong>Data Structures:</strong> Organized ways to store and access data
              </li>
              <li>
                <strong>Call Stack:</strong> Tracks function calls and returns
              </li>
              <li>
                <strong>Time Complexity:</strong> How execution time grows with input size
              </li>
            </ul>
          </div>

          <div className="bg-white rounded p-3">
            <h5 className="font-medium mb-1">Common Operations:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <strong className="text-green-600">Access:</strong> Reading a value (O(1) for
                arrays)
              </div>
              <div>
                <strong className="text-blue-600">Insert:</strong> Adding new elements
              </div>
              <div>
                <strong className="text-red-600">Delete:</strong> Removing elements
              </div>
              <div>
                <strong className="text-purple-600">Search:</strong> Finding specific values
              </div>
            </div>
          </div>

          <div className="bg-white rounded p-3">
            <h5 className="font-medium mb-1">Pro Tips:</h5>
            <ul className="space-y-1 ml-4">
              <li>• Watch how data structures change with each operation</li>
              <li>• Pay attention to loop variables and array indices</li>
              <li>• Understand why certain operations are faster than others</li>
              <li>• Use the visualization to see the algorithm in action</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionEngine;
