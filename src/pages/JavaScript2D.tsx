import React, { useMemo, useRef, useState } from 'react';
import { Box, Button, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
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
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#22c55e',
              boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)',
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'rgba(51, 65, 85, 0.9)',
              letterSpacing: '0.02em',
            }}
          >
            Stack Operations
          </Typography>
        </Box>
        <Tooltip title="Run All Commands" arrow>
          <IconButton
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s',
            }}
            onClick={run}
          >
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Step Through" arrow>
          <IconButton
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s',
            }}
            onClick={step}
          >
            <SkipNextIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset Stack" arrow>
          <IconButton
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s',
            }}
            onClick={reset}
          >
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
        placeholder="// Type instructions: push <label> | pop
push main
push calculateSum
pop"
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            fontSize: '14px',
            lineHeight: 1.5,
            '& fieldset': {
              borderColor: 'rgba(203, 213, 225, 0.5)',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(102, 126, 234, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#667eea',
              borderWidth: '2px',
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '16px',
          },
        }}
      />
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          sx={{
            borderColor: 'rgba(102, 126, 234, 0.3)',
            color: '#667eea',
            '&:hover': {
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
            },
          }}
          onClick={() => setSource(DEFAULT_PROGRAM)}
        >
          📝 Load Example
        </Button>
        <Button
          size="small"
          variant="outlined"
          sx={{
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            '&:hover': {
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
            },
          }}
          onClick={() => setSource('')}
        >
          🗑️ Clear
        </Button>
      </Box>
    </Box>
  );

  const outputPanel = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#22c55e',
              boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)',
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'rgba(34, 197, 94, 0.9)',
              letterSpacing: '0.02em',
            }}
          >
            Execution Log
          </Typography>
        </Box>
        <Box
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 1,
            bgcolor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(34, 197, 94, 0.8)',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          >
            {output.split('\n').length - 1} operations
          </Typography>
        </Box>
      </Stack>
      <Box
        sx={{
          flex: 1,
          bgcolor: '#1a1a1a',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: 2,
          p: 2,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: '13px',
          lineHeight: 1.6,
          color: '#22c55e',
          whiteSpace: 'pre-wrap',
          overflowY: 'auto',
          position: 'relative',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(34, 197, 94, 0.3)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(34, 197, 94, 0.5)',
            },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.4) 50%, transparent 100%)',
          },
        }}
      >
        {output || (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'rgba(34, 197, 94, 0.5)',
              fontSize: '12px',
            }}
          >
            💡 Output will appear here when you run commands
          </Box>
        )}
      </Box>
    </Box>
  );

  const canvas = (
    <Box sx={{ height: '100%', position: 'relative', p: 2 }}>
      <CallStack2D ref={stackRef} />
    </Box>
  );

  return (
    <Box
      sx={{
        mt: 2,
        px: { xs: 1, sm: 2, md: 3 },
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
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
