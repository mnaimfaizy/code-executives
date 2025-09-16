import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import TwoDLayout from '../components/TwoDLayout';
import MemoryHeap2D, { type MemoryHeap2DHandle } from '../components/models2d/MemoryHeap2D';
import {
  colorForLabel,
  resetLabelColors,
  instrumentCode,
  type FunctionInfo,
} from '../utils/instrument';

type Instruction =
  | { type: 'alloc'; label: string; size?: number; caller?: string }
  | { type: 'free'; label?: string; caller?: string };

type OutputLine = {
  text: string;
  label?: string;
  kind?: 'alloc' | 'free' | 'log' | 'info' | 'error';
};

function parseProgram(src: string): Instruction[] {
  const lines = src
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean);
  const program: Instruction[] = [];
  for (const line of lines) {
    const [cmd, ...rest] = line.split(/\s+/);
    if (cmd === 'alloc') {
      const label = rest[0] || 'obj';
      const size = rest[1] ? Number(rest[1]) : undefined;
      program.push({ type: 'alloc', label, size });
    } else if (cmd === 'free') {
      const label = rest[0];
      program.push({ type: 'free', label });
    }
  }
  return program;
}

const DEFAULT_DSL = `// Simple heap DSL
// alloc <label> [size]
// free [label]
alloc user 3
alloc settings 2
alloc list 5
free settings
alloc cache 4`;

const DEFAULT_JS = `// Write JavaScript. Use alloc(label, size?) and free(label?) to emit heap events.
function main() {
  console.log('Starting heap demo');
  alloc('settings', 2);
  addUser('alice');
  addUser('bob');
  free('settings');
  alloc('cache', 4);
}

function addUser(name) {
  alloc('user:' + name, 3);
}

main();`;

const MemoryHeap: React.FC = () => {
  const [mode, setMode] = useState<'2D' | '3D'>('2D');

  const heapRef = useRef<MemoryHeap2DHandle | null>(null);
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('dsl');
  const [source, setSource] = useState<string>(DEFAULT_DSL);
  const [output, setOutput] = useState<OutputLine[]>([{ text: 'Ready.', kind: 'info' }]);
  const [ip, setIp] = useState<number>(0);
  const [speed, setSpeed] = useState<'very-slow' | 'slow' | 'normal'>('very-slow');
  const [running, setRunning] = useState<boolean>(false);
  const runnerRef = useRef<number | null>(null);
  const compiledRef = useRef<{ program: Instruction[]; functions?: FunctionInfo[] } | null>(null);
  const lastSrcRef = useRef<string>('');

  const log = (msg: string, opts?: { label?: string; kind?: OutputLine['kind'] }) =>
    setOutput((o) => [...o, { text: msg, label: opts?.label, kind: opts?.kind }]);

  const reset = () => {
    if (runnerRef.current) {
      clearInterval(runnerRef.current);
      runnerRef.current = null;
    }
    setRunning(false);
    heapRef.current?.reset();
    setIp(0);
    setOutput([{ text: 'Reset.', kind: 'info' }]);
    compiledRef.current = null;
    lastSrcRef.current = '';
    resetLabelColors();
  };

  useEffect(() => {
    return () => {
      if (runnerRef.current) clearInterval(runnerRef.current);
    };
  }, []);

  const ensureCompiled = (): { program: Instruction[]; functions?: FunctionInfo[] } => {
    if (compiledRef.current && lastSrcRef.current === source) return compiledRef.current;
    try {
      if (inputMode === 'dsl') {
        const program = parseProgram(source);
        compiledRef.current = { program, functions: [] };
        lastSrcRef.current = source;
        return compiledRef.current;
      }
      // JavaScript mode: instrument to collect function boundaries, then execute transpiled in sandbox once
      const instrumented = instrumentCode(source);
      const events: Instruction[] = [];
      const callStack: string[] = [];
      const origLog = console.log;
      const toStr = (a: unknown) => {
        if (typeof a === 'string') return a;
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      };
      console.log = (...args: unknown[]) => {
        const line = args.map((a) => toStr(a)).join(' ');
        setOutput((o) => [...o, { text: line, kind: 'log' }]);
        try {
          (origLog as unknown as (...data: unknown[]) => void)(...args);
        } catch {
          // ignore forwarding errors
        }
      };
      try {
        const fn = new Function(
          '__push',
          '__pop',
          'alloc',
          'free',
          `'use strict';\n${instrumented.transpiled}`
        ) as (
          __push: (l: string) => void,
          __pop: (l: string) => void,
          alloc: (l: string, s?: number) => void,
          free: (l?: string) => void
        ) => unknown;
        const __push = (l: string) => {
          callStack.push(l);
        };
        const __pop = (l: string) => {
          // pop the matching label if present; fallback to pop last
          if (callStack.length && callStack[callStack.length - 1] === l) callStack.pop();
          else callStack.pop();
        };
        const alloc = (label: string, size?: number) => {
          const caller = callStack[callStack.length - 1];
          events.push({ type: 'alloc', label, size, caller });
        };
        const free = (label?: string) => {
          const caller = callStack[callStack.length - 1];
          events.push({ type: 'free', label, caller });
        };
        fn(__push, __pop, alloc, free);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setOutput((o) => [...o, { text: `Error: ${msg}`, kind: 'error' }]);
      } finally {
        console.log = origLog;
      }
      compiledRef.current = { program: events, functions: instrumented.functions };
      lastSrcRef.current = source;
      return compiledRef.current;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setOutput((o) => [...o, { text: `Compile error: ${msg}`, kind: 'error' }]);
      compiledRef.current = { program: [], functions: [] };
      lastSrcRef.current = source;
      return compiledRef.current;
    }
  };

  const step = () => {
    if (running) return;
    const { program } = ensureCompiled();
    if (ip >= program.length) {
      log('Program complete.', { kind: 'info' });
      return;
    }
    const ins = program[ip];
    if (ins.type === 'alloc') {
      heapRef.current?.alloc(ins.label, ins.size);
      log(`alloc(${ins.label}${ins.size ? `, ${ins.size}` : ''})`, {
        label: ins.label,
        kind: 'alloc',
      });
    } else if (ins.type === 'free') {
      if (ins.label) {
        heapRef.current?.free(ins.label);
        log(`free(${ins.label})`, { label: ins.label, kind: 'free' });
      } else {
        heapRef.current?.free(''); // frees last
        log('free()', { kind: 'free' });
      }
    }
    setIp((n) => n + 1);
  };

  const getIntervalMs = () => {
    switch (speed) {
      case 'very-slow':
        return 1600;
      case 'slow':
        return 1000;
      case 'normal':
      default:
        return 450;
    }
  };

  const stopRunner = () => {
    if (runnerRef.current) {
      clearInterval(runnerRef.current);
      runnerRef.current = null;
    }
    setRunning(false);
  };

  const run = () => {
    if (running) {
      stopRunner();
      return;
    }
    const { program } = ensureCompiled();
    if (ip >= program.length) {
      log('Program already complete. Reset to run again.', { kind: 'info' });
      return;
    }
    let i = ip;
    setRunning(true);
    runnerRef.current = window.setInterval(() => {
      if (i >= program.length) {
        stopRunner();
        log('Program complete.', { kind: 'info' });
        return;
      }
      const ins = program[i++];
      if (ins.type === 'alloc') {
        heapRef.current?.alloc(ins.label, ins.size);
        log(`alloc(${ins.label}${ins.size ? `, ${ins.size}` : ''})`, {
          label: ins.label,
          kind: 'alloc',
        });
      } else if (ins.type === 'free') {
        if (ins.label) {
          heapRef.current?.free(ins.label);
          log(`free(${ins.label})`, { label: ins.label, kind: 'free' });
        } else {
          heapRef.current?.free('');
          log('free()', { kind: 'free' });
        }
      }
      setIp(i);
    }, getIntervalMs());
  };

  const editor = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          mb: 1,
          p: 1,
          border: '1px solid',
          borderColor: 'grey.200',
          bgcolor: 'grey.100',
          borderRadius: 1.5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
            Editor
          </Typography>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="input-mode-label">Input</InputLabel>
            <Select
              labelId="input-mode-label"
              label="Input"
              value={inputMode}
              onChange={(e) => {
                const mode = e.target.value as 'js' | 'dsl';
                setInputMode(mode);
                setSource(mode === 'js' ? DEFAULT_JS : DEFAULT_DSL);
                compiledRef.current = null;
                lastSrcRef.current = '';
                setIp(0);
                heapRef.current?.reset();
                setOutput([{ text: 'Mode changed.', kind: 'info' }]);
                resetLabelColors();
              }}
            >
              <MenuItem value="js">JavaScript</MenuItem>
              <MenuItem value="dsl">Simple DSL</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title={running ? 'Stop' : 'Run'}>
            <IconButton color="primary" onClick={run}>
              {running ? <StopIcon /> : <PlayArrowIcon />}
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
          <FormControl size="small" sx={{ minWidth: 140, ml: 1 }}>
            <InputLabel id="speed-label">Speed</InputLabel>
            <Select
              labelId="speed-label"
              label="Speed"
              value={speed}
              onChange={(e) => setSpeed(e.target.value as 'very-slow' | 'slow' | 'normal')}
            >
              <MenuItem value="very-slow">Very Slow</MenuItem>
              <MenuItem value="slow">Slow</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {(() => {
          const compiled = compiledRef.current;
          const functions = compiled?.functions ?? [];
          const showHighlighted = inputMode === 'js' && (running || ip > 0) && functions.length > 0;
          if (showHighlighted) {
            const segments: Array<{ text: string; color?: string; emphasize?: boolean }> = [];
            const sortedFns = [...functions].sort((a, b) => a.bodyStart - b.bodyStart);
            let cursor = 0;
            const src = source;
            const { program } = compiled!;
            const activeCaller = program[Math.min(ip, Math.max(0, program.length - 1))]?.caller;
            for (const fn of sortedFns) {
              if (fn.bodyStart > cursor) segments.push({ text: src.slice(cursor, fn.bodyStart) });
              const bodyText = src.slice(fn.bodyStart, fn.bodyEnd);
              segments.push({
                text: bodyText,
                color: colorForLabel(fn.label),
                emphasize: activeCaller === fn.label,
              });
              cursor = fn.bodyEnd;
            }
            if (cursor < src.length) segments.push({ text: src.slice(cursor) });
            return (
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflow: 'auto',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  whiteSpace: 'pre',
                  p: 1,
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: 'grey.300',
                  bgcolor: 'white',
                }}
              >
                {segments.map((seg, idx) =>
                  seg.color ? (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: seg.color,
                        color: '#0b1020',
                        borderRadius: 4,
                        boxShadow: seg.emphasize ? '0 0 0 2px rgba(0,0,0,0.15) inset' : undefined,
                      }}
                    >
                      {seg.text}
                    </span>
                  ) : (
                    <span key={idx}>{seg.text}</span>
                  )
                )}
              </Box>
            );
          }
          return (
            <TextField
              value={source}
              onChange={(e) => {
                const val = e.target.value;
                setSource(val);
                compiledRef.current = null;
                lastSrcRef.current = '';
                setIp(0);
                heapRef.current?.reset();
                setOutput([{ text: 'Program updated.', kind: 'info' }]);
                resetLabelColors();
              }}
              multiline
              fullWidth
              placeholder={
                inputMode === 'js'
                  ? 'Write JavaScript. Use alloc(label, size?) and free(label?) to emit heap events.'
                  : 'Type instructions: alloc <label> [size] | free [label]'
              }
              variant="outlined"
              sx={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                '& .MuiInputBase-root': { alignItems: 'start' },
                '& textarea': { overflow: 'auto' },
              }}
            />
          );
        })()}
      </Box>
      <Divider sx={{ my: 1 }} />
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          onClick={() => {
            const sample = inputMode === 'js' ? DEFAULT_JS : DEFAULT_DSL;
            setSource(sample);
            compiledRef.current = null;
            lastSrcRef.current = '';
            setIp(0);
            heapRef.current?.reset();
            setOutput([{ text: 'Loaded example.', kind: 'info' }]);
            resetLabelColors();
          }}
        >
          Load Example
        </Button>
        <Button size="small" onClick={() => setSource('')}>
          Clear
        </Button>
      </Stack>
    </Box>
  );

  const outputPanel = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          mb: 1,
          p: 0.75,
          border: '1px solid',
          borderColor: 'grey.200',
          bgcolor: 'grey.100',
          borderRadius: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Output
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          bgcolor: 'grey.50',
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1,
          p: 1,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          whiteSpace: 'pre',
          overflowY: 'auto',
        }}
      >
        {output.map((line, idx) => {
          const color = line.label ? colorForLabel(line.label) : undefined;
          return (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.25,
                px: 0.5,
                py: 0.25,
                borderRadius: 0.75,
                bgcolor: color ? color : 'transparent',
                color: color ? '#0b1020' : 'inherit',
              }}
            >
              <Typography variant="body2" component="span" sx={{ fontFamily: 'inherit' }}>
                {line.text}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  const canvas2D = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ flex: 1, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
        <MemoryHeap2D ref={heapRef} colorFor={colorForLabel} />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Memory Heap
      </Typography>
      <Typography variant="body1" paragraph>
        The Memory Heap is an unstructured memory pool where dynamically allocated objects and
        variables are stored. While the Call Stack manages the execution order of the code, the
        Memory Heap stores the data your application needs.
      </Typography>

      <Tabs value={mode} onChange={(_, val) => setMode(val)} aria-label="2D/3D Mode Switch">
        <Tab label="2D" value="2D" />
        <Tab label="3D" value="3D" />
      </Tabs>

      {mode === '2D' ? (
        <Box sx={{ mt: 2 }}>
          <TwoDLayout
            title="2D Visualization: Memory Heap"
            editor={editor}
            output={outputPanel}
            canvas={canvas2D}
          />
        </Box>
      ) : (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            3D Visualization: Memory Heap
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The 3D heap visualization is coming soon. For now, explore the 2D model and logs.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MemoryHeap;
