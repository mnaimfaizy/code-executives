import React from 'react';
import { useLocation } from 'react-router-dom';
import Introduction from '../sections/Introduction';
import JavaScriptHistory from '../sections/JavaScriptHistory';
import EngineRuntimeComparison from '../sections/EngineRuntimeComparison';
import Engine from '../sections/Engine';
import ExecutionModel from '../sections/ExecutionModel';
import EventLoop from '../sections/EventLoop';
import MemoryManagement from '../sections/MemoryManagement';
import MemoryLeaks from '../sections/MemoryLeaks';
import Visualization from '../sections/Visualization';
import CallStack from '../sections/CallStack';
import MemoryHeap from '../sections/MemoryHeap';
import ParserAST from '../sections/ParserAST';
import JITCompilation from '../sections/JITCompilation';
import GarbageCollection from '../sections/GarbageCollection';

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
  // Other sections
  'Execution Model': <ExecutionModel />,
  'Event Loop': <EventLoop />,
  'Call Stack': <CallStack />,
  'Memory Management': <MemoryManagement />,
  'Memory Leaks': <MemoryLeaks />,
  'Memory Heap': <MemoryHeap />,
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
