import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Introduction from '../sections/Introduction';
import EngineRuntime from '../sections/EngineRuntime';
import ExecutionModel from '../sections/ExecutionModel';
import EventLoop from '../sections/EventLoop';
import MemoryManagement from '../sections/MemoryManagement';
import Visualization from '../sections/Visualization';
import JavaScript2D from './JavaScript2D';
import JavaScript3D from './JavaScript3D';

const sectionComponents: Record<string, React.ReactNode> = {
  Introduction: <Introduction />,
  'Engine & Runtime': <EngineRuntime />,
  'Execution Model': <ExecutionModel />,
  'Event Loop': <EventLoop />,
  'Memory Management': <MemoryManagement />,
  Visualization: <Visualization />,
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const JavaScriptPage: React.FC = () => {
  const [mode, setMode] = useState<'2D' | '3D'>('2D');
  const query = useQuery();
  const section = query.get('section') || 'Introduction';

  return (
    <Box sx={{ p: 3 }}>
      <Tabs value={mode} onChange={(_, val) => setMode(val)} aria-label="2D/3D Mode Switch">
        <Tab label="2D Mode" value="2D" />
        <Tab label="3D Mode" value="3D" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {sectionComponents[section] || <Introduction />}
        {mode === '2D' ? <JavaScript2D /> : <JavaScript3D />}
      </Box>
    </Box>
  );
};

export default JavaScriptPage;
