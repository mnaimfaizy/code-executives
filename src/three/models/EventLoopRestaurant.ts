import * as THREE from 'three';
import type { IModel } from '../core/types';
import { TimedTween, TweenScheduler } from '../core/anim';

export interface EventLoopRestaurantOptions {
  origin?: THREE.Vector3;
  scale?: number;
}

/**
 * 🍽️ Event Loop Restaurant Kitchen Visualization
 *
 * Visual metaphor: A busy restaurant kitchen representing JavaScript's Event Loop
 *
 * Kitchen Layout:
 * - Call Stack: Order execution station (LIFO stack where orders are prepared)
 * - Event Loop: Head chef coordinating the kitchen
 * - Microtask Queue: VIP orders counter (high-priority, processed first)
 * - Macrotask Queue: Regular orders waiting area (processed after VIP orders)
 * - Web APIs: Kitchen equipment (ovens, timers where async work happens)
 *
 * Operation Flow:
 * 1. Synchronous code executes immediately at the order station
 * 2. When stack is empty, Event Loop checks VIP orders first
 * 3. ALL VIP orders are processed before any regular orders
 * 4. Then ONE regular order is processed
 * 5. Cycle repeats
 */
export class EventLoopRestaurant implements IModel {
  private group = new THREE.Group();
  private scheduler = new TweenScheduler();

  // Kitchen components
  private callStackOrders: THREE.Mesh[] = [];
  private microtaskOrders: THREE.Mesh[] = [];
  private macrotaskOrders: THREE.Mesh[] = [];
  private headChef: THREE.Group | null = null;
  private kitchenLights: THREE.PointLight[] = [];
  private statusLight: THREE.Mesh | null = null;

  // Positions and measurements
  private callStackPosition = new THREE.Vector3(0, 0, 0);
  private microtaskPosition = new THREE.Vector3(-4, 0, 2);
  private macrotaskPosition = new THREE.Vector3(-4, 0, -2);
  private eventLoopPosition = new THREE.Vector3(2, 0, 0);
  private webAPIPosition = new THREE.Vector3(4, 0, 0);

  private opts: Required<EventLoopRestaurantOptions> = {
    origin: new THREE.Vector3(0, 0, 0),
    scale: 1,
  };

  constructor(opts?: EventLoopRestaurantOptions) {
    if (opts?.origin) this.opts.origin = opts.origin;
    if (opts?.scale) this.opts.scale = opts.scale;
  }

  init(scene: THREE.Scene): void {
    console.log('EventLoopRestaurant: Initializing model');
    scene.add(this.group);
    this.group.position.copy(this.opts.origin);
    this.group.scale.setScalar(this.opts.scale);

    // Build basic Event Loop kitchen
    this.buildBasicKitchen();
    this.buildCallStackStation();
    this.buildTaskQueues();
    this.buildEventLoopChef();

    // Build additional kitchen components
    this.buildKitchenEnvironment();
    this.buildMicrotaskCounter();
    this.buildMacrotaskArea();
    this.buildEventLoopStation();
    this.buildWebAPIEquipment();
    this.addKitchenLighting();
    this.addInformationSigns();

    console.log(
      'EventLoopRestaurant: Model initialized with',
      this.group.children.length,
      'children'
    );
  }

  update(dt: number): void {
    this.scheduler.update(dt);

    // Animate kitchen ambiance
    const time = Date.now() * 0.001;
    this.kitchenLights.forEach((light, i) => {
      const offset = i * 0.7;
      light.intensity = 0.8 + Math.sin(time + offset) * 0.1;
    });

    // Animate head chef
    if (this.headChef) {
      this.headChef.rotation.y = Math.sin(time * 0.5) * 0.1;
      this.headChef.position.y = 0.8 + Math.sin(time * 2) * 0.02;
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
    this.callStackOrders = [];
    this.microtaskOrders = [];
    this.macrotaskOrders = [];
    this.kitchenLights = [];
  }

  /**
   * Add order to call stack (synchronous execution)
   */
  pushToCallStack(taskName: string): void {
    const order = this.createOrder(taskName, 'stack');
    const stackHeight = this.callStackOrders.length;

    // Start from side entrance
    const entryPos = this.callStackPosition.clone().add(new THREE.Vector3(-2, 1, 0));
    order.position.copy(entryPos);
    this.group.add(order);

    // Animate to stack position
    const targetPos = this.callStackPosition
      .clone()
      .add(new THREE.Vector3(0, 0.1 + stackHeight * 0.15, 0));

    const slideIn = new TimedTween(
      0.6,
      (t) => {
        order.position.lerpVectors(entryPos, targetPos, t);
        order.position.y = targetPos.y + Math.sin(t * Math.PI) * 0.1;
      },
      () => {
        order.position.copy(targetPos);
        this.callStackOrders.push(order);
      }
    );

    this.scheduler.add(slideIn);
  }

  /**
   * Remove order from call stack (task completed)
   */
  popFromCallStack(): void {
    if (this.callStackOrders.length === 0) return;

    const order = this.callStackOrders.pop()!;
    const startPos = order.position.clone();
    const exitPos = this.callStackPosition.clone().add(new THREE.Vector3(3, 1, 0));

    const slideOut = new TimedTween(
      0.8,
      (t) => {
        order.position.lerpVectors(startPos, exitPos, t);
        order.position.y = startPos.y + Math.sin(t * Math.PI) * 0.3;
        order.rotation.y = t * Math.PI * 2;
      },
      () => {
        this.removeOrder(order);
      }
    );

    this.scheduler.add(slideOut);
  }

  /**
   * Add order to microtask queue (high priority)
   */
  addToMicrotaskQueue(taskName: string): void {
    const order = this.createOrder(taskName, 'microtask');
    const queuePosition = this.microtaskOrders.length;

    const entryPos = this.microtaskPosition.clone().add(new THREE.Vector3(-1, 1, 0));
    order.position.copy(entryPos);
    this.group.add(order);

    const targetPos = this.microtaskPosition
      .clone()
      .add(new THREE.Vector3(0, 0.1, queuePosition * 0.3));

    const slideIn = new TimedTween(
      0.5,
      (t) => {
        order.position.lerpVectors(entryPos, targetPos, t);
      },
      () => {
        this.microtaskOrders.push(order);
      }
    );

    this.scheduler.add(slideIn);
  }

  /**
   * Remove order from microtask queue to call stack
   */
  processMicrotask(): void {
    if (this.microtaskOrders.length === 0) return;

    const order = this.microtaskOrders.shift()!;

    // Rearrange remaining orders
    this.rearrangeMicrotasks();

    // Move to call stack
    const targetPos = this.callStackPosition
      .clone()
      .add(new THREE.Vector3(0, 0.1 + this.callStackOrders.length * 0.15, 0));
    const startPos = order.position.clone();

    const moveToStack = new TimedTween(
      0.7,
      (t) => {
        order.position.lerpVectors(startPos, targetPos, t);
        // Add golden trail effect for VIP orders
        order.material = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          emissive: 0x332200,
          emissiveIntensity: 0.2 + t * 0.3,
        });
      },
      () => {
        this.callStackOrders.push(order);
      }
    );

    this.scheduler.add(moveToStack);
  }

  /**
   * Add order to macrotask queue (regular priority)
   */
  addToMacrotaskQueue(taskName: string): void {
    const order = this.createOrder(taskName, 'macrotask');
    const queuePosition = this.macrotaskOrders.length;

    const entryPos = this.macrotaskPosition.clone().add(new THREE.Vector3(-1, 1, 0));
    order.position.copy(entryPos);
    this.group.add(order);

    const targetPos = this.macrotaskPosition
      .clone()
      .add(new THREE.Vector3(0, 0.1, queuePosition * 0.3));

    const slideIn = new TimedTween(
      0.6,
      (t) => {
        order.position.lerpVectors(entryPos, targetPos, t);
      },
      () => {
        this.macrotaskOrders.push(order);
      }
    );

    this.scheduler.add(slideIn);
  }

  /**
   * Remove order from macrotask queue to call stack
   */
  processMacrotask(): void {
    if (this.macrotaskOrders.length === 0) return;

    const order = this.macrotaskOrders.shift()!;

    // Rearrange remaining orders
    this.rearrangeMacrotasks();

    // Move to call stack
    const targetPos = this.callStackPosition
      .clone()
      .add(new THREE.Vector3(0, 0.1 + this.callStackOrders.length * 0.15, 0));
    const startPos = order.position.clone();

    const moveToStack = new TimedTween(
      0.8,
      (t) => {
        order.position.lerpVectors(startPos, targetPos, t);
      },
      () => {
        this.callStackOrders.push(order);
      }
    );

    this.scheduler.add(moveToStack);
  }

  /**
   * Update Event Loop status light
   */
  setEventLoopStatus(status: 'executing' | 'microtasks' | 'macrotask' | 'idle'): void {
    if (!this.statusLight) return;

    const colors = {
      executing: 0xff0000, // Red - busy executing
      microtasks: 0xffd700, // Gold - processing VIP orders
      macrotask: 0x00ff00, // Green - processing regular orders
      idle: 0x888888, // Gray - waiting
    };

    (this.statusLight.material as THREE.MeshStandardMaterial).color.setHex(colors[status]);
    (this.statusLight.material as THREE.MeshStandardMaterial).emissive.setHex(colors[status]);
    (this.statusLight.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
  }

  /**
   * Reset entire kitchen
   */
  reset(): void {
    [...this.callStackOrders, ...this.microtaskOrders, ...this.macrotaskOrders].forEach((order) =>
      this.removeOrder(order)
    );

    this.callStackOrders = [];
    this.microtaskOrders = [];
    this.macrotaskOrders = [];

    this.setEventLoopStatus('idle');
  }

  /**
   * Get current state for debugging
   */
  getState() {
    return {
      callStack: this.callStackOrders.map((o) => o.userData.taskName),
      microtasks: this.microtaskOrders.map((o) => o.userData.taskName),
      macrotasks: this.macrotaskOrders.map((o) => o.userData.taskName),
    };
  }

  private buildKitchenEnvironment(): void {
    // Kitchen floor with tile pattern
    const floorGeometry = new THREE.PlaneGeometry(16, 12);
    const floorTexture = this.createKitchenFloorTexture();
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.8,
      metalness: 0.1,
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.001;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Kitchen walls
    this.buildWalls();
  }

  private buildCallStackStation(): void {
    // Order execution station (Call Stack)
    const stationGeometry = new THREE.BoxGeometry(2, 0.8, 1.5);
    const stationMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.7,
    });

    const station = new THREE.Mesh(stationGeometry, stationMaterial);
    station.position.copy(this.callStackPosition.clone().add(new THREE.Vector3(0, 0.4, 0)));
    station.castShadow = true;
    station.receiveShadow = true;
    this.group.add(station);

    // Stack spike for orders
    const spikeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1);
    const spikeMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
    });

    const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
    spike.position.copy(this.callStackPosition.clone().add(new THREE.Vector3(0, 1.3, 0)));
    this.group.add(spike);
  }

  private buildMicrotaskCounter(): void {
    // VIP orders counter (Microtask Queue)
    const counterGeometry = new THREE.BoxGeometry(1.5, 0.8, 2);
    const counterMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.6,
      metalness: 0.3,
    });

    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.copy(this.microtaskPosition.clone().add(new THREE.Vector3(0, 0.4, 0)));
    counter.castShadow = true;
    this.group.add(counter);

    // VIP sign
    this.createSign(
      'VIP ORDERS\n(Microtasks)',
      this.microtaskPosition.clone().add(new THREE.Vector3(0, 1.5, 0)),
      0xffd700
    );
  }

  private buildMacrotaskArea(): void {
    // Regular orders waiting area (Macrotask Queue)
    const areaGeometry = new THREE.BoxGeometry(1.5, 0.8, 2);
    const areaMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      roughness: 0.7,
    });

    const area = new THREE.Mesh(areaGeometry, areaMaterial);
    area.position.copy(this.macrotaskPosition.clone().add(new THREE.Vector3(0, 0.4, 0)));
    area.castShadow = true;
    this.group.add(area);

    // Regular orders sign
    this.createSign(
      'REGULAR ORDERS\n(Macrotasks)',
      this.macrotaskPosition.clone().add(new THREE.Vector3(0, 1.5, 0)),
      0x87ceeb
    );
  }

  private buildEventLoopStation(): void {
    // Head chef station (Event Loop)
    const chefBaseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1);
    const chefBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
    });

    const chefBase = new THREE.Mesh(chefBaseGeometry, chefBaseMaterial);
    chefBase.position.copy(this.eventLoopPosition.clone().add(new THREE.Vector3(0, 0.05, 0)));
    this.group.add(chefBase);

    // Head chef figure
    this.headChef = new THREE.Group();

    // Chef body
    const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.6);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White chef coat
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    this.headChef.add(body);

    // Chef head
    const headGeometry = new THREE.SphereGeometry(0.12);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac }); // Skin tone
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.82;
    this.headChef.add(head);

    // Chef hat
    const hatGeometry = new THREE.CylinderGeometry(0.12, 0.08, 0.25);
    const hatMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const hat = new THREE.Mesh(hatGeometry, hatMaterial);
    hat.position.y = 1.05;
    this.headChef.add(hat);

    this.headChef.position.copy(this.eventLoopPosition.clone().add(new THREE.Vector3(0, 0.1, 0)));
    this.group.add(this.headChef);

    // Status light
    const lightGeometry = new THREE.SphereGeometry(0.1);
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      emissive: 0x444444,
    });

    this.statusLight = new THREE.Mesh(lightGeometry, lightMaterial);
    this.statusLight.position.copy(
      this.eventLoopPosition.clone().add(new THREE.Vector3(0, 1.8, 0))
    );
    this.group.add(this.statusLight);

    // Event Loop sign
    this.createSign(
      'EVENT LOOP\n(Head Chef)',
      this.eventLoopPosition.clone().add(new THREE.Vector3(0, 2.2, 0)),
      0x6366f1
    );
  }

  private buildWebAPIEquipment(): void {
    // Oven (setTimeout/setInterval)
    const ovenGeometry = new THREE.BoxGeometry(1, 1.2, 0.8);
    const ovenMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.6,
    });

    const oven = new THREE.Mesh(ovenGeometry, ovenMaterial);
    oven.position.copy(this.webAPIPosition.clone().add(new THREE.Vector3(0, 0.6, 1)));
    oven.castShadow = true;
    this.group.add(oven);

    // Prep station (Promise handlers)
    const prepGeometry = new THREE.BoxGeometry(1.2, 0.8, 1);
    const prepMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.8,
    });

    const prep = new THREE.Mesh(prepGeometry, prepMaterial);
    prep.position.copy(this.webAPIPosition.clone().add(new THREE.Vector3(0, 0.4, -1)));
    prep.castShadow = true;
    this.group.add(prep);

    // Web APIs sign
    this.createSign(
      'WEB APIs\n(Kitchen Equipment)',
      this.webAPIPosition.clone().add(new THREE.Vector3(0, 1.8, 0)),
      0x10b981
    );
  }

  private addKitchenLighting(): void {
    const lightPositions = [
      new THREE.Vector3(-2, 3, 0),
      new THREE.Vector3(2, 3, 0),
      new THREE.Vector3(0, 3, 2),
      new THREE.Vector3(0, 3, -2),
    ];

    lightPositions.forEach((pos) => {
      const light = new THREE.PointLight(0xfff8dc, 0.8, 10);
      light.position.copy(pos);
      light.castShadow = true;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      this.group.add(light);
      this.kitchenLights.push(light);
    });
  }

  private addInformationSigns(): void {
    // Call Stack sign
    this.createSign(
      'CALL STACK\n(Order Station)',
      this.callStackPosition.clone().add(new THREE.Vector3(0, 2, 0)),
      0x6366f1
    );
  }

  private createSign(_text: string, position: THREE.Vector3, color: number): void {
    const signGeometry = new THREE.PlaneGeometry(1.2, 0.6);
    const signMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });

    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.copy(position);
    sign.lookAt(position.x, position.y, position.z + 1);
    this.group.add(sign);

    // Add colored border
    const borderGeometry = new THREE.PlaneGeometry(1.25, 0.65);
    const borderMaterial = new THREE.MeshStandardMaterial({ color });
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.position.copy(position.clone().add(new THREE.Vector3(0, 0, -0.001)));
    border.lookAt(position.x, position.y, position.z + 1);
    this.group.add(border);
  }

  private createOrder(taskName: string, type: 'stack' | 'microtask' | 'macrotask'): THREE.Mesh {
    const orderGeometry = new THREE.BoxGeometry(0.4, 0.08, 0.6);

    const colors = {
      stack: 0x6366f1, // Blue for call stack
      microtask: 0xffd700, // Gold for VIP orders
      macrotask: 0x87ceeb, // Sky blue for regular orders
    };

    const orderMaterial = new THREE.MeshStandardMaterial({
      color: colors[type],
      roughness: 0.8,
    });

    const order = new THREE.Mesh(orderGeometry, orderMaterial);
    order.castShadow = true;
    order.userData = { taskName, type };

    return order;
  }

  private removeOrder(order: THREE.Mesh): void {
    order.parent?.remove(order);
    order.geometry.dispose();
    if (Array.isArray(order.material)) {
      order.material.forEach((m) => m.dispose());
    } else {
      (order.material as THREE.Material).dispose();
    }
  }

  private rearrangeMicrotasks(): void {
    this.microtaskOrders.forEach((order, index) => {
      const targetPos = this.microtaskPosition.clone().add(new THREE.Vector3(0, 0.1, index * 0.3));
      const moveOrder = new TimedTween(0.3, (t) => {
        order.position.lerp(targetPos, t);
      });
      this.scheduler.add(moveOrder);
    });
  }

  private rearrangeMacrotasks(): void {
    this.macrotaskOrders.forEach((order, index) => {
      const targetPos = this.macrotaskPosition.clone().add(new THREE.Vector3(0, 0.1, index * 0.3));
      const moveOrder = new TimedTween(0.3, (t) => {
        order.position.lerp(targetPos, t);
      });
      this.scheduler.add(moveOrder);
    });
  }

  private buildWalls(): void {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5dc,
      roughness: 0.9,
    });

    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(16, 4);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 2, -6);
    backWall.receiveShadow = true;
    this.group.add(backWall);

    // Side walls (partial)
    const sideWallGeometry = new THREE.PlaneGeometry(12, 4);

    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-8, 2, 0);
    leftWall.receiveShadow = true;
    this.group.add(leftWall);
  }

  private createKitchenFloorTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Create kitchen tile pattern
    const tileSize = 16;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#f8f8f8' : '#e8e8e8';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

        // Add grout lines
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(x * tileSize - 1, y * tileSize - 1, tileSize + 2, 2);
        ctx.fillRect(x * tileSize - 1, y * tileSize - 1, 2, tileSize + 2);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 4);

    return texture;
  }

  /**
   * Get optimal camera position for viewing the kitchen
   */
  getOptimalCameraPosition(): THREE.Vector3 {
    return new THREE.Vector3(8, 6, 8);
  }

  /**
   * Get focus position for camera
   */
  getFocusPosition(): THREE.Vector3 {
    return new THREE.Vector3(0, 0, 0);
  }

  private buildBasicKitchen(): void {
    // Kitchen floor
    const floorGeometry = new THREE.PlaneGeometry(12, 8);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8f8f8,
      roughness: 0.8,
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Simple back wall
    const wallGeometry = new THREE.PlaneGeometry(12, 4);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5dc,
      roughness: 0.9,
    });

    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 2, -4);
    backWall.receiveShadow = true;
    this.group.add(backWall);
  }

  private buildTaskQueues(): void {
    // Microtask Queue (VIP Counter) - Yellow/Gold
    const microGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
    const microMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.6,
    });

    const microCounter = new THREE.Mesh(microGeometry, microMaterial);
    microCounter.position.copy(this.microtaskPosition.clone().add(new THREE.Vector3(0, 0.4, 0)));
    microCounter.castShadow = true;
    this.group.add(microCounter);

    // Macrotask Queue (Regular Counter) - Blue
    const macroGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
    const macroMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      roughness: 0.7,
    });

    const macroCounter = new THREE.Mesh(macroGeometry, macroMaterial);
    macroCounter.position.copy(this.macrotaskPosition.clone().add(new THREE.Vector3(0, 0.4, 0)));
    macroCounter.castShadow = true;
    this.group.add(macroCounter);
  }

  private buildEventLoopChef(): void {
    // Simple chef representation
    const chefGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2);
    const chefMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White chef coat
      roughness: 0.7,
    });

    const chef = new THREE.Mesh(chefGeometry, chefMaterial);
    chef.position.copy(this.eventLoopPosition.clone().add(new THREE.Vector3(0, 0.6, 0)));
    chef.castShadow = true;
    this.group.add(chef);

    // Chef hat
    const hatGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.3);
    const hatMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
    });

    const hat = new THREE.Mesh(hatGeometry, hatMaterial);
    hat.position.copy(chef.position.clone().add(new THREE.Vector3(0, 0.75, 0)));
    hat.castShadow = true;
    this.group.add(hat);
  }
}
