import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from '../sections/javascript/Introduction';
import JavaScriptHistory from '../sections/javascript/JavaScriptHistory';
import EngineRuntimeComparison from '../sections/javascript/EngineRuntimeComparison';
import Engine from '../sections/javascript/Engine';
import EventLoop from '../sections/javascript/EventLoop';
import MemoryManagement from '../sections/javascript/MemoryManagement';
import MemoryLeaks from '../sections/javascript/MemoryLeaks';
import Visualization from '../sections/javascript/Visualization';
import CallStack from '../sections/javascript/CallStack';
import MemoryHeap from '../sections/javascript/MemoryHeap';
import ParserAST from '../sections/javascript/ParserAST';
import JITCompilation from '../sections/javascript/JITCompilation';
import GarbageCollection from '../sections/javascript/GarbageCollection';
import JavaScriptRuntime from '../sections/javascript/JavaScriptRuntime';
import WebAPIs from '../sections/javascript/WebAPIs';
import TaskQueues from '../sections/javascript/TaskQueues';
import V8Runtime from '../sections/javascript/V8Runtime';

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
