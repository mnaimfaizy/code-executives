import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from '../sections/Introduction';
import JavaScriptHistory from '../sections/JavaScriptHistory';
import EngineRuntimeComparison from '../sections/EngineRuntimeComparison';
import Engine from '../sections/Engine';
import EventLoop from '../sections/EventLoop';
import MemoryManagement from '../sections/MemoryManagement';
import MemoryLeaks from '../sections/MemoryLeaks';
import Visualization from '../sections/Visualization';
import CallStack from '../sections/CallStack';
import MemoryHeap from '../sections/MemoryHeap';
import ParserAST from '../sections/ParserAST';
import JITCompilation from '../sections/JITCompilation';
import GarbageCollection from '../sections/GarbageCollection';
import JavaScriptRuntime from '../sections/JavaScriptRuntime';
import WebAPIs from '../sections/WebAPIs';
import TaskQueues from '../sections/TaskQueues';
import V8Runtime from '../sections/V8Runtime';

const sectionComponents: Record<string, React.ReactNode> = {
  Introduction: <Introduction />,
  'JavaScript History': <JavaScriptHistory />,
  'Engine & Runtime Comparison': <EngineRuntimeComparison />,
  'JavaScript Engine': <Engine />,
  // Engine sub-sections
  'Call Stack & Execution': <CallStack />,
  'Memory Heap & Objects': <MemoryHeap />,
  'Parser & AST Generation': <ParserAST />,
  'JIT Compilation Pipeline': <JITCompilation />,
  'Garbage Collection': <GarbageCollection />,
  // Runtime sections
  'JavaScript Runtime': <JavaScriptRuntime />,
  'Event Loop & Coordination': <EventLoop />,
  'Web APIs & Platform': <WebAPIs />,
  'Task Queues & Priority': <TaskQueues />,
  'V8 Runtime Features': <V8Runtime />,
  // Other sections
  'Memory Management': <MemoryManagement />,
  'Memory Leaks': <MemoryLeaks />,
  Visualization: <Visualization />,
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const JavaScriptPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  return <div className="p-4 sm:p-6">{sectionComponents[section] || <Introduction />}</div>;
};

export default JavaScriptPage;
