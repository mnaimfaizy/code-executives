import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from './components/sections/Introduction';
import JavaScriptHistory from './components/sections/JavaScriptHistory';
import EngineRuntimeComparison from './components/sections/EngineRuntimeComparison';
import Engine from './components/sections/Engine';
import EventLoop from './components/sections/EventLoop';
import MemoryManagement from './components/sections/MemoryManagement';
import MemoryLeaks from './components/sections/MemoryLeaks';
import Visualization from './components/sections/Visualization';
import CallStack from './components/sections/CallStack';
import MemoryHeap from './components/sections/MemoryHeap';
import ParserAST from './components/sections/ParserAST';
import JITCompilation from './components/sections/JITCompilation';
import GarbageCollection from './components/sections/GarbageCollection';
import JavaScriptRuntime from './components/sections/JavaScriptRuntime';
import WebAPIs from './components/sections/WebAPIs';
import TaskQueues from './components/sections/TaskQueues';
import V8Runtime from './components/sections/V8Runtime';

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
      <Component />
    </div>
  );
};

export default JavaScriptPage;
