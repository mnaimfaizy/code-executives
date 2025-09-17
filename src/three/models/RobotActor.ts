import * as THREE from 'three';
import type { IModel } from '../core/types';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface RobotActorOptions {
  url?: string;
  position?: THREE.Vector3;
  scale?: number;
}

export class RobotActor implements IModel {
  private group = new THREE.Group();
  private mixer: THREE.AnimationMixer | null = null;
  private actions: THREE.AnimationAction[] = [];
  private actionMap: Map<string, THREE.AnimationAction> = new Map();
  private currentAction: THREE.AnimationAction | null = null;
  private url: string;
  private position: THREE.Vector3;
  private scale: number;
  private loaded = false;
  private pendingPlay: string | null = null;

  constructor(opts: RobotActorOptions = {}) {
    const base = import.meta.env.BASE_URL || '/';
    // Use BASE_URL so assets resolve correctly when the app is served from a subpath
    this.url = opts.url || `${base}models/robot/RobotExpressive.glb`;
    this.position = opts.position ? opts.position.clone() : new THREE.Vector3(3.2, 0, -2.0);
    this.scale = opts.scale ?? 0.4;
  }

  init(scene: THREE.Scene): void {
    scene.add(this.group);
    const loader = new GLTFLoader();
    loader.load(
      this.url,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) {
            const m = o as THREE.Mesh;
            m.castShadow = true;
            m.receiveShadow = true;
          }
        });
        model.position.copy(this.position);
        model.scale.setScalar(this.scale);
        this.group.add(model);

        if (gltf.animations && gltf.animations.length) {
          this.mixer = new THREE.AnimationMixer(model);
          this.actions = gltf.animations.map((clip) => this.mixer!.clipAction(clip));
          this.actionMap.clear();
          for (const action of this.actions) {
            if (action.getClip()?.name) this.actionMap.set(action.getClip().name, action);
          }
          // Prefer an "Idle" clip if available, else the first
          const defaultName = this.actionMap.has('Idle') ? 'Idle' : this.actions[0].getClip().name;
          this.internalPlay(defaultName, 0);
        }

        this.loaded = true;
        if (this.pendingPlay) {
          this.internalPlay(this.pendingPlay, 0.2);
          this.pendingPlay = null;
        }
      },
      undefined,
      (err) => {
        console.error('RobotActor: failed to load', this.url, err);
        this.addMissingPlaceholder();
        console.warn(
          [
            'RobotActor fallback: Showing placeholder box because the GLB could not be loaded.',
            'To fix: Place RobotExpressive.glb at public/models/robot/RobotExpressive.glb',
            `Or pass a custom url to RobotActor({ url: "<path-to-your.glb>" })`,
          ].join('\n')
        );
      }
    );
  }

  update(dt: number): void {
    if (this.mixer) this.mixer.update(dt);
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
    this.mixer = null;
    this.actions = [];
    this.actionMap.clear();
    this.currentAction = null;
  }

  private addMissingPlaceholder() {
    // Create a simple placeholder so the scene isn't empty when asset is missing
    const geo = new THREE.BoxGeometry(0.6, 1.2, 0.4);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff5577, metalness: 0.2, roughness: 0.6 });
    const box = new THREE.Mesh(geo, mat);
    box.castShadow = true;
    box.receiveShadow = true;
    box.position.copy(this.position.clone().add(new THREE.Vector3(0, 0.6 * this.scale, 0)));
    box.scale.setScalar(this.scale);
    this.group.add(box);

    // A subtle spinning animation via manual update if no mixer
    const spin = (dt: number) => {
      box.rotation.y += dt * 0.8;
    };
    // Monkey patch update to include spin when no mixer
    const originalUpdate = this.update.bind(this);
    this.update = (dt: number) => {
      originalUpdate(dt);
      spin(dt);
    };
  }

  // Public API
  play(name: string, fade: number = 0.2): boolean {
    if (!this.loaded) {
      this.pendingPlay = name;
      return false;
    }
    return this.internalPlay(name, fade);
  }

  getClips(): string[] {
    return Array.from(this.actionMap.keys());
  }

  setScale(s: number) {
    this.scale = s;
    this.group.scale.setScalar(1); // group remains neutral
    // Update children scales (model or placeholder)
    this.group.children.forEach((c) => c.scale.setScalar(s));
  }

  setPosition(v: THREE.Vector3) {
    this.position.copy(v);
    this.group.children.forEach((c) => c.position.copy(v));
  }

  private internalPlay(name: string, fade: number): boolean {
    const next = this.actionMap.get(name);
    if (!next) return false;
    if (this.currentAction === next) return true;
    next.reset().play();
    if (this.currentAction) {
      this.currentAction.crossFadeTo(next, fade, false);
    }
    this.currentAction = next;
    return true;
  }
}
