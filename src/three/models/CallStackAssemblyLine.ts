import * as THREE from 'three';
import type { IModel } from '../core/types';
import { TimedTween, TweenScheduler } from '../core/anim';

export interface CallStackOptions {
  length?: number; // conveyor length
  width?: number; // belt width
  origin?: THREE.Vector3; // start position of belt
}

/**
 * Visual metaphor: A conveyor belt feeds crates (stack frames) to a lift that stacks them vertically.
 * pushFrame: a crate travels along the belt and gets lifted onto the stack.
 * popFrame: the top crate is lifted down and exits via the belt.
 */
export class CallStackAssemblyLine implements IModel {
  private group = new THREE.Group();
  private scheduler = new TweenScheduler();
  private frames: THREE.Mesh[] = [];
  private stackHeight = 0; // number of crates in stack
  // No discrete rollers; visual pulleys and a textured belt convey motion
  private beltMat: THREE.MeshStandardMaterial | null = null;
  private opts: Required<CallStackOptions> = {
    length: 8,
    width: 2,
    origin: new THREE.Vector3(-4, 0, 0),
  };

  constructor(opts?: CallStackOptions) {
    if (opts?.length) this.opts.length = opts.length;
    if (opts?.width) this.opts.width = opts.width;
    if (opts?.origin) this.opts.origin = opts.origin;
  }

  init(scene: THREE.Scene): void {
    scene.add(this.group);
    this.group.position.set(0, 0, 0);
    this.buildConveyor();
    this.buildLift();
  }

  update(dt: number): void {
    this.scheduler.update(dt);
    // Animate belt map offset to suggest motion
    if (this.beltMat && this.beltMat.map) {
      const tex = this.beltMat.map as THREE.Texture;
      tex.offset.x = (tex.offset.x + dt * 0.25) % 1;
    }
  }

  dispose(): void {
    this.group.parent?.remove(this.group);
    this.group.traverse((obj) => {
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
      const m = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (m) {
        if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
        else m.dispose();
      }
    });
    this.frames = [];
  }

  pushFrame(label = 'fn') {
    const crate = this.createCrate(label);
    const { origin, length } = this.opts;
    const entry = origin.clone();
    const exit = origin.clone().add(new THREE.Vector3(length, 0, 0));
    crate.position.copy(entry);
    this.group.add(crate);

    // Travel along belt to lift (assume lift at end)
    const travel = new TimedTween(
      1.2,
      (t) => {
        crate.position.lerpVectors(entry, exit, t);
      },
      () => {
        // Lift up to stack position
        const targetY = 0.6 + this.stackHeight * 0.7;
        const start = crate.position.clone();
        const end = crate.position.clone().setY(targetY);
        this.scheduler.add(
          new TimedTween(
            0.6,
            (tt) => {
              crate.position.lerpVectors(start, end, tt);
            },
            () => {
              this.frames.push(crate);
              this.stackHeight++;
            }
          )
        );
      }
    );
    this.scheduler.add(travel);
  }

  popFrame() {
    if (!this.frames.length) return;
    const crate = this.frames.pop()!;
    this.stackHeight--;
    const top = crate.position.clone();
    const down = top.clone();
    down.y = 0.0;
    // Lower then move out
    this.scheduler.add(
      new TimedTween(
        0.5,
        (t) => {
          crate.position.lerpVectors(top, down, t);
        },
        () => {
          const { origin, length } = this.opts;
          const exit = origin.clone().add(new THREE.Vector3(length + 2, 0, 0));
          const beltPos = origin.clone().add(new THREE.Vector3(length, 0, 0));
          const start = beltPos;
          this.scheduler.add(
            new TimedTween(
              0.9,
              (tt) => {
                crate.position.lerpVectors(start, exit, tt);
              },
              () => {
                crate.parent?.remove(crate);
                crate.geometry.dispose();
                if (Array.isArray(crate.material)) crate.material.forEach((m) => m.dispose());
                else (crate.material as THREE.Material).dispose();
              }
            )
          );
        }
      )
    );
  }

  private buildConveyor() {
    const { origin, length, width } = this.opts;
    // Belt base with moving texture stripes
    const beltGeom = new THREE.BoxGeometry(length, 0.08, width);
    const beltSvg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='32' viewBox='0 0 128 32'>` +
      `<rect width='128' height='32' fill='#2b2f35'/>` +
      `<rect y='15' width='128' height='2' fill='#3a3f47'/>` +
      `<g fill='#1f2328'>` +
      `<rect x='0' y='0' width='2' height='32'/>` +
      `<rect x='16' y='0' width='2' height='32'/>` +
      `<rect x='32' y='0' width='2' height='32'/>` +
      `<rect x='48' y='0' width='2' height='32'/>` +
      `<rect x='64' y='0' width='2' height='32'/>` +
      `<rect x='80' y='0' width='2' height='32'/>` +
      `<rect x='96' y='0' width='2' height='32'/>` +
      `<rect x='112' y='0' width='2' height='32'/>` +
      `</g>` +
      `</svg>`;
    const beltTex = new THREE.TextureLoader().load(
      'data:image/svg+xml;utf8,' + encodeURIComponent(beltSvg)
    );
    beltTex.wrapS = THREE.RepeatWrapping;
    beltTex.wrapT = THREE.ClampToEdgeWrapping;
    beltTex.repeat.set(8, 1);
    const beltMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.85,
      metalness: 0.25,
      map: beltTex,
    });
    this.beltMat = beltMat;
    const belt = new THREE.Mesh(beltGeom, beltMat);
    belt.position.copy(origin.clone().add(new THREE.Vector3(length / 2, 0.05, 0)));
    belt.receiveShadow = true;
    this.group.add(belt);

    // End pulleys (visuals only)
    const pulleyGeom = new THREE.CylinderGeometry(width * 0.45, width * 0.45, 0.25, 32);
    const pulleyMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      metalness: 0.8,
      roughness: 0.25,
    });
    const pulleyStart = new THREE.Mesh(pulleyGeom, pulleyMat);
    pulleyStart.rotation.z = Math.PI / 2; // axis along X
    pulleyStart.position.copy(origin.clone().add(new THREE.Vector3(0, 0.22, 0)));
    pulleyStart.castShadow = true;
    this.group.add(pulleyStart);
    const pulleyEnd = new THREE.Mesh(pulleyGeom, pulleyMat);
    pulleyEnd.rotation.z = Math.PI / 2;
    pulleyEnd.position.copy(origin.clone().add(new THREE.Vector3(length, 0.22, 0)));
    pulleyEnd.castShadow = true;
    this.group.add(pulleyEnd);

    // Side rails
    const railGeom = new THREE.BoxGeometry(length, 0.15, 0.05);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x4b5563,
      metalness: 0.6,
      roughness: 0.4,
    });
    const leftRail = new THREE.Mesh(railGeom, railMat);
    leftRail.position.copy(
      origin.clone().add(new THREE.Vector3(length / 2, 0.15, width / 2 + 0.03))
    );
    leftRail.castShadow = true;
    this.group.add(leftRail);
    const rightRail = new THREE.Mesh(railGeom, railMat);
    rightRail.position.copy(
      origin.clone().add(new THREE.Vector3(length / 2, 0.15, -width / 2 - 0.03))
    );
    rightRail.castShadow = true;
    this.group.add(rightRail);

    // Support legs
    const legGeom = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x374151 });
    const legCount = 4;
    for (let i = 0; i < legCount; i++) {
      const x = ((i + 0.5) / legCount) * length;
      const legL = new THREE.Mesh(legGeom, legMat);
      legL.position.copy(origin.clone().add(new THREE.Vector3(x, 0.4, width / 2 - 0.05)));
      legL.castShadow = true;
      this.group.add(legL);
      const legR = new THREE.Mesh(legGeom, legMat);
      legR.position.copy(origin.clone().add(new THREE.Vector3(x, 0.4, -width / 2 + 0.05)));
      legR.castShadow = true;
      this.group.add(legR);
    }

    // Motor housing near end
    const motor = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.5, width + 0.4),
      new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 0.7, roughness: 0.3 })
    );
    motor.position.copy(origin.clone().add(new THREE.Vector3(length + 0.45, 0.35, 0)));
    motor.castShadow = true;
    this.group.add(motor);

    // Floor + dark grid overlay (daylight background handled by Engine)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x12161b })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.001;
    floor.receiveShadow = true;
    this.group.add(floor);

    const grid = new THREE.GridHelper(30, 30, 0x2f3741, 0x2f3741);
    // Lift grid slightly to avoid z-fighting
    grid.position.set(0, 0.0001, 0);
    this.group.add(grid);
  }

  private buildLift() {
    const { origin, length, width } = this.opts;
    const basePos = origin.clone().add(new THREE.Vector3(length, 0, 0));
    const mast = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 4, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    mast.position.copy(basePos.clone().add(new THREE.Vector3(0, 2, width * 0.45)));
    mast.castShadow = true;
    this.group.add(mast);

    const fork = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.1, width),
      new THREE.MeshStandardMaterial({ color: 0x60a5fa })
    );
    // Fork starts slightly above belt height to clearly carry crates
    fork.position.copy(basePos.clone().add(new THREE.Vector3(0, 0.15, 0)));
    fork.castShadow = true;
    this.group.add(fork);
  }

  private createCrate(label: string) {
    const geom = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffa500 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.userData.label = label;
    return mesh;
  }

  /**
   * Get current stack height
   */
  getStackHeight(): number {
    return this.stackHeight;
  }

  /**
   * Reset the assembly line (clear all crates)
   */
  reset(): void {
    // Clear all existing crates
    this.frames.forEach((crate) => {
      crate.parent?.remove(crate);
      crate.geometry.dispose();
      if (Array.isArray(crate.material)) {
        crate.material.forEach((m) => m.dispose());
      } else {
        (crate.material as THREE.Material).dispose();
      }
    });

    this.frames = [];
    this.stackHeight = 0;
  }
}
