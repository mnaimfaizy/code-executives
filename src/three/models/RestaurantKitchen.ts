import * as THREE from 'three';
import type { IModel } from '../core/types';
import { TimedTween, TweenScheduler } from '../core/anim';

export interface RestaurantKitchenOptions {
  stationWidth?: number;
  stationDepth?: number;
  origin?: THREE.Vector3;
}

/**
 * 🍽️ Restaurant Kitchen Call Stack Visualization
 *
 * Visual metaphor: A busy restaurant kitchen where order tickets stack up at the order station.
 * - Kitchen: The Call Stack environment
 * - Order Tickets: Stack frames (function calls)
 * - Order Station: Where tickets accumulate (LIFO - Last In, First Out)
 * - Head Chef: Manages the order flow
 * - Kitchen Staff: Execute the functions
 * - Completed Orders: Functions returning/popping from stack
 *
 * pushFrame: New order ticket arrives and goes to the top of the stack
 * popFrame: Top order is completed and removed from the stack
 */
export class RestaurantKitchen implements IModel {
  private group = new THREE.Group();
  private scheduler = new TweenScheduler();
  private orderTickets: THREE.Mesh[] = [];
  private stackHeight = 0;
  private kitchenLights: THREE.PointLight[] = [];

  private opts: Required<RestaurantKitchenOptions> = {
    stationWidth: 3,
    stationDepth: 2,
    origin: new THREE.Vector3(0, 0, 0),
  };

  constructor(opts?: RestaurantKitchenOptions) {
    if (opts?.stationWidth) this.opts.stationWidth = opts.stationWidth;
    if (opts?.stationDepth) this.opts.stationDepth = opts.stationDepth;
    if (opts?.origin) this.opts.origin = opts.origin;
  }

  init(scene: THREE.Scene): void {
    scene.add(this.group);
    this.group.position.copy(this.opts.origin);
    this.buildKitchen();
    this.buildOrderStation();
    this.buildKitchenEquipment();
    this.addKitchenLighting();
  }

  update(dt: number): void {
    this.scheduler.update(dt);

    // Animate kitchen lights for atmosphere
    const time = Date.now() * 0.001;
    this.kitchenLights.forEach((light, i) => {
      const offset = i * 0.7;
      light.intensity = 0.8 + Math.sin(time + offset) * 0.1;
    });
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
    this.orderTickets = [];
    this.kitchenLights = [];
  }

  /**
   * Add new order ticket to the top of the stack
   */
  pushFrame(functionName = 'order') {
    const ticket = this.createOrderTicket(functionName);
    const { origin } = this.opts;

    // Start ticket from the side (new order coming in)
    const entryPos = origin.clone().add(new THREE.Vector3(-2, 1, 0));
    ticket.position.copy(entryPos);
    this.group.add(ticket);

    // Animate ticket sliding to the order station
    const stationPos = origin.clone().add(new THREE.Vector3(0, 0.1 + this.stackHeight * 0.15, 0));

    const slideIn = new TimedTween(
      0.8,
      (t) => {
        ticket.position.lerpVectors(entryPos, stationPos, t);
        // Add slight bounce effect
        ticket.position.y = stationPos.y + Math.sin(t * Math.PI) * 0.1;
      },
      () => {
        // Settle the ticket
        ticket.position.copy(stationPos);
        this.orderTickets.push(ticket);
        this.stackHeight++;

        // Add small "plop" effect
        const finalTween = new TimedTween(
          0.3,
          (t) => {
            const bounce = Math.sin(t * Math.PI * 2) * 0.02;
            ticket.position.y = stationPos.y + bounce;
          },
          () => {
            ticket.position.y = stationPos.y;
          }
        );
        this.scheduler.add(finalTween);
      }
    );

    this.scheduler.add(slideIn);
  }

  /**
   * Remove top order ticket from the stack (order completed)
   */
  popFrame() {
    if (!this.orderTickets.length) return;

    const ticket = this.orderTickets.pop()!;
    this.stackHeight--;

    const startPos = ticket.position.clone();
    const exitPos = this.opts.origin.clone().add(new THREE.Vector3(3, 1, 0));

    // Animate ticket sliding out (order completed)
    const slideOut = new TimedTween(
      0.9,
      (t) => {
        ticket.position.lerpVectors(startPos, exitPos, t);
        // Add slight upward arc as it "gets served"
        ticket.position.y = startPos.y + Math.sin(t * Math.PI) * 0.3;
      },
      () => {
        // Remove the completed order
        ticket.parent?.remove(ticket);
        ticket.geometry.dispose();
        if (Array.isArray(ticket.material)) {
          ticket.material.forEach((m) => m.dispose());
        } else {
          (ticket.material as THREE.Material).dispose();
        }
      }
    );

    this.scheduler.add(slideOut);
  }

  /**
   * Reset the kitchen (clear all orders)
   */
  reset() {
    // Clear all existing tickets
    this.orderTickets.forEach((ticket) => {
      ticket.parent?.remove(ticket);
      ticket.geometry.dispose();
      if (Array.isArray(ticket.material)) {
        ticket.material.forEach((m) => m.dispose());
      } else {
        (ticket.material as THREE.Material).dispose();
      }
    });

    this.orderTickets = [];
    this.stackHeight = 0;
  }

  private buildKitchen() {
    // Kitchen floor (checkered pattern)
    const floorGeometry = new THREE.PlaneGeometry(12, 8);
    const floorTexture = this.createCheckerboardTexture();
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

    // Kitchen walls (partial walls for better viewing)
    this.buildKitchenWalls();
  }

  private buildOrderStation() {
    const { origin } = this.opts;

    // Order station counter
    const counterGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
    const counterMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513, // Brown wood
      roughness: 0.7,
      metalness: 0.1,
    });

    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.copy(origin.clone().add(new THREE.Vector3(0, 0.4, 0)));
    counter.castShadow = true;
    counter.receiveShadow = true;
    this.group.add(counter);

    // Order spike (where tickets get stacked)
    const spikeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.6);
    const spikeMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.2,
    });

    const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
    spike.position.copy(origin.clone().add(new THREE.Vector3(0, 1.1, 0)));
    spike.castShadow = true;
    this.group.add(spike);

    // Order station nameplate
    const nameplateGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.2);
    const nameplateMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
    });

    const nameplate = new THREE.Mesh(nameplateGeometry, nameplateMaterial);
    nameplate.position.copy(origin.clone().add(new THREE.Vector3(0, 0.85, 0.4)));
    nameplate.castShadow = true;
    this.group.add(nameplate);
  }

  private buildKitchenEquipment() {
    const { origin } = this.opts;

    // Stove/cooking station
    const stoveGeometry = new THREE.BoxGeometry(2, 0.9, 1.2);
    const stoveMaterial = new THREE.MeshStandardMaterial({
      color: 0x36454f, // Charcoal
      metalness: 0.6,
      roughness: 0.3,
    });

    const stove = new THREE.Mesh(stoveGeometry, stoveMaterial);
    stove.position.copy(origin.clone().add(new THREE.Vector3(-3, 0.45, -1)));
    stove.castShadow = true;
    stove.receiveShadow = true;
    this.group.add(stove);

    // Prep station
    const prepGeometry = new THREE.BoxGeometry(1.8, 0.8, 1);
    const prepMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0, // Silver prep surface
      metalness: 0.8,
      roughness: 0.2,
    });

    const prep = new THREE.Mesh(prepGeometry, prepMaterial);
    prep.position.copy(origin.clone().add(new THREE.Vector3(3, 0.4, -1)));
    prep.castShadow = true;
    prep.receiveShadow = true;
    this.group.add(prep);

    // Hanging utensils
    this.addHangingUtensils();
  }

  private buildKitchenWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5dc, // Beige
      roughness: 0.9,
      metalness: 0.0,
    });

    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(12, 3);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 1.5, -4);
    backWall.receiveShadow = true;
    this.group.add(backWall);

    // Side walls (partial for better viewing)
    const sideWallGeometry = new THREE.PlaneGeometry(8, 3);

    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-6, 1.5, 0);
    leftWall.receiveShadow = true;
    this.group.add(leftWall);
  }

  private addHangingUtensils() {
    const { origin } = this.opts;

    // Simple utensil representations
    const utensilPositions = [
      new THREE.Vector3(-2, 2.2, -2),
      new THREE.Vector3(-1.5, 2.2, -2),
      new THREE.Vector3(-1, 2.2, -2),
    ];

    utensilPositions.forEach((pos, i) => {
      const utensilGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4);
      const utensilMaterial = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x444444 : 0x8b4513,
        metalness: 0.7,
        roughness: 0.3,
      });

      const utensil = new THREE.Mesh(utensilGeometry, utensilMaterial);
      utensil.position.copy(origin.clone().add(pos));
      utensil.castShadow = true;
      this.group.add(utensil);
    });
  }

  private addKitchenLighting() {
    // Warm kitchen lighting
    const positions = [
      new THREE.Vector3(-2, 2.5, 0),
      new THREE.Vector3(2, 2.5, 0),
      new THREE.Vector3(0, 2.5, -2),
    ];

    positions.forEach((pos) => {
      const light = new THREE.PointLight(0xfff8dc, 0.8, 8); // Warm light
      light.position.copy(this.opts.origin.clone().add(pos));
      light.castShadow = true;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      this.group.add(light);
      this.kitchenLights.push(light);
    });
  }

  private createOrderTicket(functionName: string): THREE.Mesh {
    // Create a ticket-like shape
    const ticketGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.6);

    // Color based on function name hash for consistency
    const colors = [
      0xffe4b5, // Moccasin
      0xffa07a, // Light Salmon
      0x98fb98, // Pale Green
      0x87ceeb, // Sky Blue
      0xdda0dd, // Plum
      0xf0e68c, // Khaki
    ];

    let hash = 0;
    for (let i = 0; i < functionName.length; i++) {
      hash = functionName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;

    const ticketMaterial = new THREE.MeshStandardMaterial({
      color: colors[colorIndex],
      roughness: 0.8,
      metalness: 0.1,
    });

    const ticket = new THREE.Mesh(ticketGeometry, ticketMaterial);
    ticket.castShadow = true;
    ticket.userData.functionName = functionName;

    return ticket;
  }

  private createCheckerboardTexture(): THREE.Texture {
    // Create a simple checkerboard pattern for the kitchen floor
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    const tileSize = 8;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#FFFFFF' : '#E0E0E0';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 3);

    return texture;
  }

  /**
   * Get current stack height
   */
  getStackHeight(): number {
    return this.stackHeight;
  }

  /**
   * Get current order tickets (for debugging/info)
   */
  getOrderTickets(): string[] {
    return this.orderTickets.map((ticket) => ticket.userData.functionName || 'order');
  }
}
