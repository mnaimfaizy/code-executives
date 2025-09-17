import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { IModel } from './types';

export interface EngineOptions {
  /** device pixel ratio clamp */
  dpr?: number;
  /** background color */
  background?: number;
}

export class Engine {
  // Minimal scene+loop host for multiple models.
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
  readonly renderer: THREE.WebGLRenderer;
  private controls: OrbitControls | null = null;
  private container: HTMLElement;
  private models: IModel[] = [];
  private clock = new THREE.Clock();
  private cleanupFns: Array<() => void> = [];
  private running = false;
  // shared lights
  private hemi!: THREE.HemisphereLight;
  private dir!: THREE.DirectionalLight;
  private ambient!: THREE.AmbientLight;

  constructor(container: HTMLElement, opts: EngineOptions = {}) {
    this.container = container;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.dpr ?? 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.background = new THREE.Color(opts.background || 0xffffff);
    container.appendChild(this.renderer.domElement);

    this.camera.position.set(7.5, 6.5, 10.5);
    this.camera.lookAt(0, 0, 0);
    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 30;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.onResize();
    const resize = () => this.onResize();
    window.addEventListener('resize', resize);
    this.cleanupFns.push(() => window.removeEventListener('resize', resize));

    // Shared lights
    this.hemi = new THREE.HemisphereLight(0xffffff, 0xb0d0ff, 0.95);
    this.hemi.position.set(0, 20, 0);
    this.scene.add(this.hemi);

    this.dir = new THREE.DirectionalLight(0xffffff, 1.2);
    this.dir.position.set(8, 12, 6);
    this.dir.castShadow = true;
    this.dir.shadow.mapSize.set(2048, 2048);
    this.dir.shadow.camera.near = 0.5;
    this.dir.shadow.camera.far = 50;
    this.dir.shadow.camera.left = -15;
    this.dir.shadow.camera.right = 15;
    this.dir.shadow.camera.top = 15;
    this.dir.shadow.camera.bottom = -15;
    this.scene.add(this.dir);

    this.ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambient);
  }

  addModel(model: IModel) {
    this.models.push(model);
    model.init(this.scene);
  }

  removeModel(model: IModel) {
    const i = this.models.indexOf(model);
    if (i >= 0) {
      this.models.splice(i, 1);
      model.dispose();
    }
  }

  clearModels() {
    for (const m of this.models) m.dispose();
    this.models = [];
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.getDelta(); // reset
    const loop = () => {
      if (!this.running) return;
      const dt = this.clock.getDelta();
      for (const m of this.models) m.update(dt);
      if (this.controls) this.controls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }

  dispose() {
    this.stop();
    this.clearModels();
    for (const fn of this.cleanupFns) fn();
    this.cleanupFns = [];
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }

  private onResize() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // Lighting presets
  setLightingPreset(preset: 'day' | 'factory' | 'studio') {
    if (!this.hemi || !this.dir || !this.ambient) return;
    switch (preset) {
      case 'factory':
        this.scene.background = new THREE.Color(0xfffbf4); // warm off-white
        this.hemi.color.set(0xfff0d6);
        this.hemi.groundColor.set(0x8aa6b7);
        this.hemi.intensity = 0.9;
        this.dir.color.set(0xffe4b5);
        this.dir.intensity = 1.1;
        this.ambient.color.set(0xfff1dc);
        this.ambient.intensity = 0.45;
        break;
      case 'studio':
        this.scene.background = new THREE.Color(0xf3f4f6); // light gray
        this.hemi.color.set(0xffffff);
        this.hemi.groundColor.set(0xbcc4d1);
        this.hemi.intensity = 0.7;
        this.dir.color.set(0xffffff);
        this.dir.intensity = 1.5;
        this.ambient.color.set(0xffffff);
        this.ambient.intensity = 0.25;
        break;
      case 'day':
      default:
        this.scene.background = new THREE.Color(0xffffff);
        this.hemi.color.set(0xffffff);
        this.hemi.groundColor.set(0xb0d0ff);
        this.hemi.intensity = 0.95;
        this.dir.color.set(0xffffff);
        this.dir.intensity = 1.2;
        this.ambient.color.set(0xffffff);
        this.ambient.intensity = 0.4;
        break;
    }
  }

  // Quick camera focus helper
  focusCamera(position: THREE.Vector3, target: THREE.Vector3) {
    this.camera.position.copy(position);
    this.camera.lookAt(target);
    if (this.controls) {
      this.controls.target.copy(target);
      this.controls.update();
    }
  }
}
