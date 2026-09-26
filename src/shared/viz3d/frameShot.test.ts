import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { VIEW_DIRECTIONS, boundsOf, frameShot, type Shot } from './frameShot';

const NO_PAD = { left: 0, right: 0, top: 0, bottom: 0 };
const shot: Shot = {
  boxes: [
    [
      [-4, 0, -2],
      [-1, 2, 2],
    ],
    [
      [2, 0, -3],
      [6, 1, 3],
    ],
  ],
  pad: NO_PAD,
};

/** Screen rectangle (px, centred on the viewer) of every box corner for a framing. */
function projectCorners(s: Shot, dir: [number, number, number], w: number, h: number) {
  const { target, position, zoom } = frameShot(s, dir, w, h);
  const cam = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, -100, 200);
  cam.position.copy(position);
  cam.zoom = zoom;
  cam.lookAt(target);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [min, max] of s.boxes)
    for (const x of [min[0], max[0]])
      for (const y of [min[1], max[1]])
        for (const z of [min[2], max[2]]) {
          const p = new THREE.Vector3(x, y, z).project(cam);
          xs.push((p.x * w) / 2);
          ys.push((p.y * h) / 2);
        }
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

describe('frameShot', () => {
  it('fits every box corner inside the viewer and touches one pair of edges', () => {
    const [w, h] = [800, 500];
    const r = projectCorners(shot, VIEW_DIRECTIONS.iso, w, h);
    for (const v of [r.minX, r.maxX]) expect(Math.abs(v)).toBeLessThanOrEqual(w / 2 + 0.01);
    for (const v of [r.minY, r.maxY]) expect(Math.abs(v)).toBeLessThanOrEqual(h / 2 + 0.01);
    const fillsWidth = Math.abs(r.maxX - r.minX - w) < 0.5;
    const fillsHeight = Math.abs(r.maxY - r.minY - h) < 0.5;
    expect(fillsWidth || fillsHeight).toBe(true);
  });

  it('keeps the label padding clear', () => {
    const [w, h] = [800, 500];
    const pad = { left: 100, right: 20, top: 40, bottom: 60 };
    const r = projectCorners({ ...shot, pad }, VIEW_DIRECTIONS.iso, w, h);
    expect(r.minX).toBeGreaterThanOrEqual(-w / 2 + pad.left - 0.01);
    expect(r.maxX).toBeLessThanOrEqual(w / 2 - pad.right + 0.01);
    expect(r.maxY).toBeLessThanOrEqual(h / 2 - pad.top + 0.01);
    expect(r.minY).toBeGreaterThanOrEqual(-h / 2 + pad.bottom - 0.01);
  });

  it('frames the same shot from each preset direction, with a different target', () => {
    const iso = frameShot(shot, VIEW_DIRECTIONS.iso, 800, 500);
    const front = frameShot(shot, VIEW_DIRECTIONS.front, 800, 500);
    const top = frameShot(shot, VIEW_DIRECTIONS.top, 800, 500);
    expect(iso.target.distanceTo(front.target)).toBeGreaterThan(0.01);
    expect(iso.target.distanceTo(top.target)).toBeGreaterThan(0.01);
    expect(front.position.clone().sub(front.target).toArray()).toEqual(
      VIEW_DIRECTIONS.front.map((v) => expect.closeTo(v, 6))
    );
    for (const dir of Object.values(VIEW_DIRECTIONS)) {
      const r = projectCorners(shot, dir, 800, 500);
      expect(r.maxX - r.minX).toBeLessThanOrEqual(800.5);
      expect(r.maxY - r.minY).toBeLessThanOrEqual(500.5);
    }
  });

  it('keeps the target inside the scene bounds', () => {
    const [min, max] = boundsOf(shot.boxes, 3);
    const box = new THREE.Box3(new THREE.Vector3(...min), new THREE.Vector3(...max));
    for (const dir of Object.values(VIEW_DIRECTIONS)) {
      const { target } = frameShot(
        { ...shot, pad: { left: 80, right: 60, top: 40, bottom: 60 } },
        dir,
        800,
        500
      );
      expect(box.containsPoint(target)).toBe(true);
    }
  });
});

describe('boundsOf', () => {
  it('unions the boxes and grows them by the margin', () => {
    expect(boundsOf(shot.boxes, 1)).toEqual([
      [-5, -1, -4],
      [7, 3, 4],
    ]);
  });
});
