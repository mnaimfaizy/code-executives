import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import TwoDLayout from '../components/TwoDLayout';
import CallStack2D, { type CallStack2DHandle } from '../components/models2d/CallStack2D';

type Instruction = { type: 'push' | 'pop'; label?: string };

// Tiny DSL: lines of `push label` or `pop`.
function parseProgram(src: string): Instruction[] {
  const lines = src
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean);
  const program: Instruction[] = [];
  for (const line of lines) {
    const [cmd, ...rest] = line.split(/\s+/);
    if (cmd === 'push') {
      const label = rest.join(' ') || 'fn';
      program.push({ type: 'push', label });
    } else if (cmd === 'pop') {
      program.push({ type: 'pop' });
    }
  }
  return program;
}

const DEFAULT_PROGRAM = `push main
push foo
push bar
pop
push baz
pop
pop`;

const JavaScript2D: React.FC = () => {
  const stackRef = useRef<CallStack2DHandle | null>(null);
  const [source, setSource] = useState<string>(DEFAULT_PROGRAM);
  const [output, setOutput] = useState<string>('Ready.');
  const [ip, setIp] = useState<number>(0); // instruction pointer
  const program = useMemo(() => parseProgram(source), [source]);

  const log = (msg: string) => setOutput((o) => (o ? o + '\n' + msg : msg));

  const reset = () => {
    stackRef.current?.reset();
    setIp(0);
    setOutput('Reset.');
  };

  const step = () => {
    if (ip >= program.length) {
      log('Program complete.');
      return;
    }
    const ins = program[ip];
    if (ins.type === 'push') {
      stackRef.current?.push(ins.label || 'fn');
      log(`push(${ins.label || 'fn'})`);
    } else if (ins.type === 'pop') {
      stackRef.current?.pop();
      log('pop()');
    }
    setIp((n) => n + 1);
  };

  const run = () => {
    if (ip >= program.length) {
      log('Program already complete. Reset to run again.');
      return;
    }
    // simple timed runner
    const interval = 450; // ms
    let i = ip;
    const id = setInterval(() => {
      if (i >= program.length) {
        clearInterval(id);
        log('Program complete.');
        return;
      }
      const ins = program[i++];
      if (ins.type === 'push') {
        stackRef.current?.push(ins.label || 'fn');
        log(`push(${ins.label || 'fn'})`);
      } else {
        stackRef.current?.pop();
        log('pop()');
      }
      setIp(i);
    }, interval);
  };

  const editor = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ flex: 1 }}>
          Editor
        </Typography>
        <Tooltip title="Run">
          <IconButton color="primary" onClick={run}>
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Step">
          <IconButton color="primary" onClick={step}>
            <SkipNextIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset">
          <IconButton color="inherit" onClick={reset}>
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <TextField
        value={source}
        onChange={(e) => setSource(e.target.value)}
        multiline
        minRows={8}
        maxRows={18}
        fullWidth
        placeholder="Type instructions: push <label> | pop"
        sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', flex: 1 }}
      />
      <Divider sx={{ my: 1 }} />
      <Stack direction="row" spacing={1}>
        <Button size="small" onClick={() => setSource(DEFAULT_PROGRAM)}>
          Load Example
        </Button>
        <Button size="small" onClick={() => setSource('')}>
          Clear
        </Button>
      </Stack>
    </Box>
  );

  const outputPanel = (
    <Box
      sx={{
        height: '100%',
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'grey.300',
        borderRadius: 1,
        p: 1,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        whiteSpace: 'pre-wrap',
        overflowY: 'auto',
      }}
    >
      {output}
    </Box>
  );

  const canvas = (
    <Box sx={{ height: '100%', border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
      <CallStack2D ref={stackRef} />
    </Box>
  );

  return (
    <Box sx={{ mt: 2 }}>
      {/* Theory heading for reusability across 2D models is placed in the Section above this page */}
      <TwoDLayout
        title="2D Visualization: Call Stack"
        editor={editor}
        output={outputPanel}
        canvas={canvas}
      />
    </Box>
  );
};

export default JavaScript2D;
