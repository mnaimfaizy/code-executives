import React, { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';

// Lazy load all section components for better code splitting
const Introduction = lazy(() => import('./components/sections/Introduction'));
const JavaScriptHistory = lazy(() => import('./components/sections/JavaScriptHistory'));
const EngineRuntimeComparison = lazy(() => import('./components/sections/EngineRuntimeComparison'));
const Engine = lazy(() => import('./components/sections/Engine'));
const EventLoop = lazy(() => import('./components/sections/EventLoop'));
const MemoryManagement = lazy(() => import('./components/sections/MemoryManagement'));
const MemoryLeaks = lazy(() => import('./components/sections/MemoryLeaks'));
const Visualization = lazy(() => import('./components/sections/Visualization'));
const CallStack = lazy(() => import('./components/sections/CallStack'));
const MemoryHeap = lazy(() => import('./components/sections/MemoryHeap'));
const ParserAST = lazy(() => import('./components/sections/ParserAST'));
const JITCompilation = lazy(() => import('./components/sections/JITCompilation'));
const GarbageCollection = lazy(() => import('./components/sections/GarbageCollection'));
const JavaScriptRuntime = lazy(() => import('./components/sections/JavaScriptRuntime'));
const WebAPIs = lazy(() => import('./components/sections/WebAPIs'));
const TaskQueues = lazy(() => import('./components/sections/TaskQueues'));
const V8Runtime = lazy(() => import('./components/sections/V8Runtime'));

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'JavaScript History': JavaScriptHistory,
  'Engine & Runtime Comparison': EngineRuntimeComparison,
  'JavaScript Engine': Engine,
  // Engine sub-sections
  'Call Stack & Execution': CallStack,
  'Memory Heap & Objects': MemoryHeap,
  'Parser & AST Generation': ParserAST,
  'JIT Compilation Pipeline': JITCompilation,
  'Garbage Collection': GarbageCollection,
  // Runtime sections
  'JavaScript Runtime': JavaScriptRuntime,
  'Event Loop & Coordination': EventLoop,
  'Web APIs & Platform': WebAPIs,
  'Task Queues & Priority': TaskQueues,
  'V8 Runtime Features': V8Runtime,
  // Other sections
  'Memory Management': MemoryManagement,
  'Memory Leaks': MemoryLeaks,
  Visualization,
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const JavaScriptPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;
  return (
    <div className="p-4 sm:p-6">
      <Suspense
        fallback={
          <div className="space-y-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-96 bg-gray-200 rounded-xl" />
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  );
};

export default JavaScriptPage;
