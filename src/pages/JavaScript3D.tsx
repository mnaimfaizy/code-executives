import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import ThreeCanvas, { type ThreeCanvasHandle } from '../three/react/ThreeCanvas';
import { CallStackAssemblyLine } from '../three/models/CallStackAssemblyLine';
import { RobotActor } from '../three/models/RobotActor';

const JavaScript3D: React.FC = () => {
  const model = useMemo(() => new CallStackAssemblyLine(), []);
  const robot = useMemo(() => new RobotActor(), []);
  const ref = useRef<ThreeCanvasHandle | null>(null);
  const [clips, setClips] = useState<string[]>([]);
  const [clip, setClip] = useState<string>('');

  useEffect(() => {
    // poll once after mount for available robot clips
    const id = setTimeout(() => {
      const names = robot.getClips?.() ?? [];
      setClips(names);
      if (names.length && !clip) setClip(names[0]);
    }, 500);
    return () => clearTimeout(id);
  }, [robot]);
  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        3D Visualization: Call Stack Assembly Line
      </Typography>
      <ThreeCanvas ref={ref} models={[model, robot]} />
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button variant="contained" onClick={() => model.pushFrame('fn')}>
          Push Frame
        </Button>
        <Button variant="outlined" onClick={() => model.popFrame()}>
          Pop Frame
        </Button>
        <Button
          variant="outlined"
          onClick={() => ref.current?.getEngine()?.setLightingPreset('day')}
        >
          Daylight
        </Button>
        <Button
          variant="outlined"
          onClick={() => ref.current?.getEngine()?.setLightingPreset('factory')}
        >
          Factory
        </Button>
        <Button
          variant="outlined"
          onClick={() => ref.current?.getEngine()?.setLightingPreset('studio')}
        >
          Studio
        </Button>
        <Button
          variant="text"
          onClick={() =>
            ref.current?.getEngine()?.focusCamera(
              // focus on conveyor
              new THREE.Vector3(6.5, 5.5, 10),
              new THREE.Vector3(0, 0, 0)
            )
          }
        >
          Focus Assembly
        </Button>
        <Button
          variant="text"
          onClick={() =>
            ref.current
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
  );
};

export default JavaScript3D;
