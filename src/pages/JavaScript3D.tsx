import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
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
  }, [robot, clip]);
  return (
    <section className="mt-2 rounded-lg bg-gray-100 p-3">
      <h2 className="mb-2 text-lg font-semibold">3D Visualization: Call Stack Assembly Line</h2>
      <ThreeCanvas ref={ref} models={[model, robot]} />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500"
          onClick={() => model.pushFrame('fn')}
        >
          Push Frame
        </button>
        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={() => model.popFrame()}
        >
          Pop Frame
        </button>
        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={() => ref.current?.getEngine()?.setLightingPreset('day')}
        >
          Daylight
        </button>
        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={() => ref.current?.getEngine()?.setLightingPreset('factory')}
        >
          Factory
        </button>
        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={() => ref.current?.getEngine()?.setLightingPreset('studio')}
        >
          Studio
        </button>
        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={() =>
            ref.current
              ?.getEngine()
              ?.focusCamera(new THREE.Vector3(6.5, 5.5, 10), new THREE.Vector3(0, 0, 0))
          }
        >
          Focus Assembly
        </button>
        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={() =>
            ref.current
              ?.getEngine()
              ?.focusCamera(new THREE.Vector3(4.5, 4.8, 7.5), new THREE.Vector3(3.2, 0.8, -2.0))
          }
        >
          Focus Robot
        </button>
        {clips.length > 0 && (
          <label className="ml-auto inline-flex items-center gap-2 text-sm">
            <span>Robot Clip</span>
            <select
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
              value={clip}
              onChange={(e) => {
                const name = e.target.value as string;
                setClip(name);
                robot.play?.(name, 0.25);
              }}
            >
              {clips.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </section>
  );
};

export default JavaScript3D;
