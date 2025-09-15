import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
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
import CallStack2D, { type CallStack2DHandle } from '../components/models2d/CallStack2D';
import ThreeCanvas, { type ThreeCanvasHandle } from '../three/react/ThreeCanvas';
import { CallStackAssemblyLine } from '../three/models/CallStackAssemblyLine';
import { RobotActor } from '../three/models/RobotActor';
import {
  instrumentCode,
  colorForLabel,
  resetLabelColors,
  getLabelColorMap,
  setLabelColorMap,
  type FunctionInfo,
} from '../utils/instrument';

type Instruction = { type: 'push' | 'pop'; label?: string };
type OutputLine = {
  text: string;
  label?: string;
  kind?: 'push' | 'pop' | 'log' | 'info' | 'error';
};
type Compiled = { program: Instruction[]; functions: FunctionInfo[] };

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

function getErrMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const maybe = (e as { message?: unknown }).message;
    return typeof maybe === 'string' ? maybe : String(maybe);
  }
  return String(e);
}

const DEFAULT_DSL = `push main
push foo
push bar
pop
push baz
pop
pop`;

const DEFAULT_JS = `// Write JavaScript. We'll instrument function bodies to emit push/pop events.
function main() {
  foo();
  bar();
}

function foo() {
  baz();
}

function bar() {
  // work
}

function baz() {
  // work
}

main();`;

const CallStack: React.FC = () => {
  const [mode, setMode] = useState<'2D' | '3D'>('2D');

  // 2D state
  const stackRef = useRef<CallStack2DHandle | null>(null);
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('js');
  const [source, setSource] = useState<string>(DEFAULT_JS);
  const [output, setOutput] = useState<OutputLine[]>([{ text: 'Ready.', kind: 'info' }]);
  const [ip, setIp] = useState<number>(0);
  const [speed, setSpeed] = useState<'very-slow' | 'slow' | 'normal'>('very-slow');
  const [running, setRunning] = useState<boolean>(false);
  const runnerRef = useRef<number | null>(null);
  const compiledRef = useRef<Compiled | null>(null);
  const lastSrcRef = useRef<string>('');
  const [stackLabels, setStackLabels] = useState<string[]>([]);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const log = (msg: string, opts?: { label?: string; kind?: OutputLine['kind'] }) =>
    setOutput((o) => [...o, { text: msg, label: opts?.label, kind: opts?.kind }]);
  const reset = () => {
    if (runnerRef.current) {
      clearInterval(runnerRef.current);
      runnerRef.current = null;
    }
    setRunning(false);
    stackRef.current?.reset();
    setIp(0);
    setOutput([{ text: 'Reset.', kind: 'info' }]);
    compiledRef.current = null;
    resetLabelColors();
    setStackLabels([]);
  };
  const ensureCompiled = (): Compiled => {
    if (compiledRef.current && lastSrcRef.current === source) return compiledRef.current;
    try {
      if (inputMode === 'dsl') {
        const program = parseProgram(source);
        compiledRef.current = { program, functions: [] };
        lastSrcRef.current = source;
        // do not log here to keep output clean for stepping
        return compiledRef.current;
      }
      // JS mode: instrument and run once to collect events without mutating the UI
      const instrumented = instrumentCode(source);
      // Capture console output while collecting events
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
        log(line, { kind: 'log' });
        // forward to original console for debug
        try {
          (origLog as unknown as (...data: unknown[]) => void)(...args);
        } catch {
          // ignore forwarding errors
        }
      };
      const getErrMsg = (e: unknown): string => {
        if (e instanceof Error) return e.message;
        if (typeof e === 'object' && e !== null && 'message' in e) {
          const maybe = (e as { message?: unknown }).message;
          return typeof maybe === 'string' ? maybe : String(maybe);
        }
        return String(e);
      };
      try {
        instrumented.run({ __push: () => {}, __pop: () => {} });
      } catch (err: unknown) {
        log(`Error: ${getErrMsg(err)}`, { kind: 'error' });
      } finally {
        console.log = origLog;
      }
      const program: Instruction[] = instrumented.events.map((e) => ({
        type: e.type,
        label: e.label,
      }));
      compiledRef.current = { program, functions: instrumented.functions };
      lastSrcRef.current = source;
      return compiledRef.current;
    } catch (e: unknown) {
      log(`Compile error: ${getErrMsg(e)}`, { kind: 'error' });
      compiledRef.current = { program: [], functions: [] };
      lastSrcRef.current = source;
      return compiledRef.current;
    }
  };
  const step = () => {
    if (running) return; // ignore step while running
    const { program } = ensureCompiled();
    if (ip >= program.length) {
      log('Program complete.', { kind: 'info' });
      return;
    }
    const ins = program[ip];
    if (ins.type === 'push') {
      stackRef.current?.push(ins.label || 'fn');
      log(`push(${ins.label || 'fn'})`, { label: ins.label || 'fn', kind: 'push' });
      setStackLabels((s) => [...s, ins.label || 'fn']);
    } else {
      stackRef.current?.pop();
      const lbl = ins.label ?? stackLabels[stackLabels.length - 1]; // use current top for DSL
      log(`pop(${lbl ?? ''})`.trim(), { label: lbl, kind: 'pop' });
      setStackLabels((s) => s.slice(0, -1));
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
      if (ins.type === 'push') {
        stackRef.current?.push(ins.label || 'fn');
        log(`push(${ins.label || 'fn'})`, { label: ins.label || 'fn', kind: 'push' });
        setStackLabels((s) => [...s, ins.label || 'fn']);
      } else {
        stackRef.current?.pop();
        const lbl = ins.label ?? stackLabels[stackLabels.length - 1];
        log(`pop(${lbl ?? ''})`.trim(), { label: lbl, kind: 'pop' });
        setStackLabels((s) => s.slice(0, -1));
      }
      setIp(i);
    }, getIntervalMs());
  };

  // Cleanup runner on unmount or when switching away from 2D mode
  useEffect(() => {
    return () => {
      if (runnerRef.current) clearInterval(runnerRef.current);
    };
  }, []);
  // Load persisted colors once
  useEffect(() => {
    try {
      const raw = localStorage.getItem('labelColors');
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        setLabelColorMap(parsed);
      }
    } catch {
      // ignore persistence errors
    }
  }, []);
  // Persist colors occasionally: when IP resets to 0 (after reset/clear) and when stepping/running advances
  useEffect(() => {
    try {
      const map = getLabelColorMap();
      localStorage.setItem('labelColors', JSON.stringify(map));
    } catch {
      // ignore persistence errors
    }
  }, [ip, running]);
  useEffect(() => {
    if (mode !== '2D' && running) stopRunner();
  }, [mode, running]);

  const renderHighlighted = () => {
    const compiled = compiledRef.current;
    const functions = compiled?.functions ?? [];
    if (!functions.length) return null;
    const segments: Array<{ text: string; color?: string; emphasize?: boolean }> = [];
    const sortedFns = [...functions].sort((a, b) => a.bodyStart - b.bodyStart);
    let cursor = 0;
    const src = source;
    const active = stackLabels[stackLabels.length - 1];
    for (const fn of sortedFns) {
      if (fn.bodyStart > cursor) {
        segments.push({ text: src.slice(cursor, fn.bodyStart) });
      }
      const bodyText = src.slice(fn.bodyStart, fn.bodyEnd);
      segments.push({
        text: bodyText,
        color: colorForLabel(fn.label),
        emphasize: active === fn.label,
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
  };

  const showHighlighted = running || ip > 0;

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
                // swap example program and invalidate compiled
                setSource(mode === 'js' ? DEFAULT_JS : DEFAULT_DSL);
                compiledRef.current = null;
                setIp(0);
                stackRef.current?.reset();
                setOutput([{ text: 'Mode changed.', kind: 'info' }]);
                resetLabelColors();
              }}
            >
              <MenuItem value="js">JavaScript</MenuItem>
              <MenuItem value="dsl">Simple DSL</MenuItem>
            </Select>
          </FormControl>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
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
      <Box
        sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {showHighlighted && inputMode === 'js' ? (
            renderHighlighted()
          ) : (
            <TextField
              value={source}
              onChange={(e) => setSource(e.target.value)}
              multiline
              fullWidth
              placeholder={
                inputMode === 'js'
                  ? 'Write JavaScript. Define and call functions; function bodies will be instrumented.'
                  : 'Type instructions: push <label> | pop'
              }
              variant="outlined"
              sx={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                '& .MuiInputBase-root': { alignItems: 'start' },
                '& textarea': { overflow: 'auto' },
              }}
            />
          )}
        </Box>
        <Divider sx={{ my: 1 }} />
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            onClick={() => {
              const sample = inputMode === 'js' ? DEFAULT_JS : DEFAULT_DSL;
              setSource(sample);
              compiledRef.current = null;
              setIp(0);
              setStackLabels([]);
              stackRef.current?.reset();
              setOutput([{ text: 'Loaded example.', kind: 'info' }]);
              resetLabelColors();
            }}
          >
            Load Example
          </Button>
          <Button size="small" onClick={() => setSource('')}>
            Clear
          </Button>
          <Button
            size="small"
            onClick={() => {
              compiledRef.current = null;
              setIp(0);
              setStackLabels([]);
              stackRef.current?.reset();
              setOutput([{ text: 'Compiled program cleared.', kind: 'info' }]);
              resetLabelColors();
            }}
          >
            Clear Compiled
          </Button>
          <Button size="small" onClick={() => setShowLegend((v) => !v)}>
            {showLegend ? 'Hide Legend' : 'Show Legend'}
          </Button>
        </Stack>
      </Box>
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
        <CallStack2D ref={stackRef} colorFor={colorForLabel} />
      </Box>
      {/* Legend */}
      {showLegend && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {(compiledRef.current?.functions ?? [])
            .map((f) => f.label)
            .filter((v, i, a) => a.indexOf(v) === i)
            .slice(0, 12)
            .map((label) => (
              <Box
                key={label}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: colorForLabel(label),
                  color: '#0b1020',
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: 0.5,
                    bgcolor: '#0b1020',
                    opacity: 0.2,
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {label}
                </Typography>
              </Box>
            ))}
        </Box>
      )}
    </Box>
  );

  // 3D state
  const model = useMemo(() => new CallStackAssemblyLine(), []);
  const robot = useMemo(() => new RobotActor(), []);
  const ref3D = useRef<ThreeCanvasHandle | null>(null);
  const [clips, setClips] = useState<string[]>([]);
  const [clip, setClip] = useState<string>('');
  useEffect(() => {
    const id = setTimeout(() => {
      const names = robot.getClips?.() ?? [];
      setClips(names);
      if (names.length && !clip) setClip(names[0]);
    }, 500);
    return () => clearTimeout(id);
  }, [robot, clip]);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Call Stack
      </Typography>
      <Typography variant="body1" paragraph>
        The Call Stack is a LIFO (Last-In, First-Out) data structure that keeps track of the
        execution flow of a program. When a function is called, an entry is pushed onto the top of
        the stack, and when the function completes its execution, it is popped off. This mechanism
        underpins JavaScript's synchronous, single-threaded nature, as only one function can be on
        top of the stack and actively executing at any given moment.
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        In contrast to the Call Stack, the Memory Heap is an unstructured memory pool where
        dynamically allocated objects and variables are stored. While the Call Stack manages the
        execution order of the code, the Memory Heap stores the data your application needs.
      </Typography>

      {/* Local tabs for this section */}
      <Tabs value={mode} onChange={(_, val) => setMode(val)} aria-label="2D/3D Mode Switch">
        <Tab label="2D" value="2D" />
        <Tab label="3D" value="3D" />
      </Tabs>

      {mode === '2D' ? (
        <Box sx={{ mt: 2 }}>
          <TwoDLayout
            title="2D Visualization: Call Stack"
            editor={editor}
            output={outputPanel}
            canvas={canvas2D}
          />
        </Box>
      ) : (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            3D Visualization: Call Stack Assembly Line
          </Typography>
          <ThreeCanvas ref={ref3D} models={[model, robot]} />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button variant="contained" onClick={() => model.pushFrame('fn')}>
              Push Frame
            </Button>
            <Button variant="outlined" onClick={() => model.popFrame()}>
              Pop Frame
            </Button>
            <Button
              variant="outlined"
              onClick={() => ref3D.current?.getEngine()?.setLightingPreset('day')}
            >
              Daylight
            </Button>
            <Button
              variant="outlined"
              onClick={() => ref3D.current?.getEngine()?.setLightingPreset('factory')}
            >
              Factory
            </Button>
            <Button
              variant="outlined"
              onClick={() => ref3D.current?.getEngine()?.setLightingPreset('studio')}
            >
              Studio
            </Button>
            <Button
              variant="text"
              onClick={() =>
                ref3D.current
                  ?.getEngine()
                  ?.focusCamera(new THREE.Vector3(6.5, 5.5, 10), new THREE.Vector3(0, 0, 0))
              }
            >
              Focus Assembly
            </Button>
            <Button
              variant="text"
              onClick={() =>
                ref3D.current
                  ?.getEngine()
                  ?.focusCamera(new THREE.Vector3(4.5, 4.8, 7.5), new THREE.Vector3(3.2, 0.8, -2.0))
              }
            >
              Focus Robot
            </Button>
            {clips.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="robot-clip-label">Robot Clip</InputLabel>
                <Select
                  labelId="robot-clip-label"
                  label="Robot Clip"
                  value={clip}
                  onChange={(e) => {
                    const name = e.target.value as string;
                    setClip(name);
                    robot.play?.(name, 0.25);
                  }}
                >
                  {clips.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default CallStack;
