import * as THREE from 'three';
import type { IModel } from '../core/types';
import { RobotActor } from './RobotActor';

export interface HeapObject {
  id: string;
  type: string;
  size: number;
  position: THREE.Vector3;
  mesh: THREE.Mesh;
  references: number;
  highlighted: boolean;
}

export interface LibraryOptions {
  position?: THREE.Vector3;
  scale?: number;
}

export class MemoryHeapLibrary implements IModel {
  private group = new THREE.Group();
  private robot: RobotActor;
  private shelves: THREE.Group[] = [];
  private objects: Map<string, HeapObject> = new Map();
  private referenceArrows: THREE.Group[] = [];
  private position: THREE.Vector3;
  private scale: number;
  
  // Material library for different object types
  private materials = {
    user: new THREE.MeshStandardMaterial({ color: 0x4fc3f7, metalness: 0.1, roughness: 0.3 }),
    settings: new THREE.MeshStandardMaterial({ color: 0x81c784, metalness: 0.1, roughness: 0.3 }),
    cache: new THREE.MeshStandardMaterial({ color: 0xffb74d, metalness: 0.1, roughness: 0.3 }),
    list: new THREE.MeshStandardMaterial({ color: 0xf06292, metalness: 0.1, roughness: 0.3 }),
    default: new THREE.MeshStandardMaterial({ color: 0x9e9e9e, metalness: 0.1, roughness: 0.3 })
  };

  private highlightMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffff00, 
    metalness: 0.2, 
    roughness: 0.2,
    emissive: 0x444400,
    emissiveIntensity: 0.3
  });

  constructor(opts: LibraryOptions = {}) {
    this.position = opts.position ? opts.position.clone() : new THREE.Vector3(0, 0, 0);
    this.scale = opts.scale ?? 1;
    this.robot = new RobotActor({ 
      position: new THREE.Vector3(-2, 0, 1),
      scale: 0.8 
    });
  }

  init(scene: THREE.Scene): void {
    scene.add(this.group);
    this.group.position.copy(this.position);
    this.group.scale.setScalar(this.scale);

    // Initialize robot
    this.robot.init(scene);

    // Create library environment
    this.createLibraryEnvironment();
    this.createShelves();
    this.setupLighting(scene);
  }

  update(dt: number): void {
    this.robot.update(dt);
    this.updateReferences();
    this.animateHighlights(dt);
  }

  dispose(): void {
    this.group.parent?.remove(this.group);
    this.robot.dispose();
    
    // Dispose materials
    Object.values(this.materials).forEach(mat => mat.dispose());
    this.highlightMaterial.dispose();
    
    // Dispose geometries and meshes
    this.group.traverse((obj) => {
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
      const m = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (m) {
        if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
        else m.dispose();
      }
    });
  }

  // Public API for memory operations
  async allocateObject(id: string, type: string = 'default', size: number = 1): Promise<void> {
    if (this.objects.has(id)) {
      console.warn(`Object ${id} already exists`);
      return;
    }

    const shelf = this.findAvailableShelf();
    const position = this.getNextPosition(shelf);
    
    // Create book (object) mesh
    const bookGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.2);
    const material = this.materials[type as keyof typeof this.materials] || this.materials.default;
    const bookMesh = new THREE.Mesh(bookGeometry, material);
    
    bookMesh.position.copy(position);
    bookMesh.castShadow = true;
    bookMesh.receiveShadow = true;
    
    this.group.add(bookMesh);

    // Store object data
    const heapObject: HeapObject = {
      id,
      type,
      size,
      position: position.clone(),
      mesh: bookMesh,
      references: 1,
      highlighted: false
    };
    
    this.objects.set(id, heapObject);

    // Animate robot placing the book
    await this.animateRobotToPosition(position);
    this.robot.play('Reaching', 0.3);
    
    // Animate book appearing
    bookMesh.scale.setScalar(0);
    this.animateObjectScale(bookMesh, 1, 0.5);
    
    await this.delay(800);
    this.robot.play('Idle', 0.3);
  }

  async deallocateObject(id?: string): Promise<void> {
    let targetId = id;
    
    // If no ID specified, remove the most recently allocated object
    if (!targetId) {
      const objectIds = Array.from(this.objects.keys());
      targetId = objectIds[objectIds.length - 1];
    }
    
    if (!targetId || !this.objects.has(targetId)) {
      console.warn(`Object ${targetId} not found for deallocation`);
      return;
    }

    const heapObject = this.objects.get(targetId)!;
    
    // Animate robot walking to the object
    await this.animateRobotToPosition(heapObject.position);
    this.robot.play('Reaching', 0.3);
    
    // Highlight object being removed
    this.highlightObject(targetId, true);
    await this.delay(500);
    
    // Animate object disappearing
    this.animateObjectScale(heapObject.mesh, 0, 0.5);
    
    await this.delay(600);
    
    // Remove from scene and tracking
    this.group.remove(heapObject.mesh);
    heapObject.mesh.geometry.dispose();
    this.objects.delete(targetId);
    
    this.robot.play('Idle', 0.3);
  }

  highlightObject(id: string, highlight: boolean): void {
    const obj = this.objects.get(id);
    if (!obj) return;
    
    obj.highlighted = highlight;
    obj.mesh.material = highlight ? this.highlightMaterial : 
      this.materials[obj.type as keyof typeof this.materials] || this.materials.default;
  }

  addReference(id: string): void {
    const obj = this.objects.get(id);
    if (obj) {
      obj.references++;
      this.updateReferenceVisualization(id);
    }
  }

  removeReference(id: string): void {
    const obj = this.objects.get(id);
    if (obj && obj.references > 0) {
      obj.references--;
      this.updateReferenceVisualization(id);
    }
  }

  getObjects(): HeapObject[] {
    return Array.from(this.objects.values());
  }

  reset(): void {
    // Clear all objects
    this.objects.forEach((obj) => {
      this.group.remove(obj.mesh);
      obj.mesh.geometry.dispose();
    });
    this.objects.clear();
    
    // Clear reference arrows
    this.referenceArrows.forEach(arrow => this.group.remove(arrow));
    this.referenceArrows = [];
    
    // Reset robot
    this.robot.play('Idle', 0.3);
  }

  // Camera control helpers
  getFocusPosition(): THREE.Vector3 {
    return new THREE.Vector3(0, 2, 3);
  }

  getOptimalCameraPosition(): THREE.Vector3 {
    return new THREE.Vector3(4, 3, 4);
  }

  private createLibraryEnvironment(): void {
    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(8, 6);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8d6e63,
      roughness: 0.8,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Create walls for library atmosphere
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xd7ccc8,
      roughness: 0.9,
      metalness: 0.0
    });

    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(8, 4);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 2, -3);
    backWall.receiveShadow = true;
    this.group.add(backWall);

    // Side walls
    const sideWallGeometry = new THREE.PlaneGeometry(6, 4);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-4, 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    this.group.add(leftWall);
  }

  private createShelves(): void {
    const shelfMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x5d4037,
      roughness: 0.7,
      metalness: 0.1
    });

    // Create multiple shelving units
    for (let unit = 0; unit < 3; unit++) {
      const shelfGroup = new THREE.Group();
      
      // Position shelving units
      shelfGroup.position.set(-2 + unit * 2, 0, -2.5);
      
      // Create shelves (5 levels)
      for (let level = 0; level < 5; level++) {
        const shelfGeometry = new THREE.BoxGeometry(1.8, 0.05, 0.4);
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.y = 0.4 + level * 0.4;
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        shelfGroup.add(shelf);
      }
      
      // Shelf supports
      const supportGeometry = new THREE.BoxGeometry(0.05, 2.2, 0.4);
      const leftSupport = new THREE.Mesh(supportGeometry, shelfMaterial);
      leftSupport.position.set(-0.875, 1.1, 0);
      leftSupport.castShadow = true;
      shelfGroup.add(leftSupport);
      
      const rightSupport = new THREE.Mesh(supportGeometry, shelfMaterial);
      rightSupport.position.set(0.875, 1.1, 0);
      rightSupport.castShadow = true;
      shelfGroup.add(rightSupport);
      
      this.shelves.push(shelfGroup);
      this.group.add(shelfGroup);
    }
  }

  private setupLighting(scene: THREE.Scene): void {
    // Ambient library lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main directional light (sunlight through windows)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 8, 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 20;
    directionalLight.shadow.camera.left = -8;
    directionalLight.shadow.camera.right = 8;
    directionalLight.shadow.camera.top = 8;
    directionalLight.shadow.camera.bottom = -8;
    scene.add(directionalLight);

    // Warm spotlight for cozy atmosphere
    const spotLight = new THREE.SpotLight(0xfff4e6, 0.6);
    spotLight.position.set(0, 6, 2);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.3;
    spotLight.castShadow = true;
    scene.add(spotLight);
  }

  private findAvailableShelf(): THREE.Group {
    // Simple implementation: return first shelf
    // Could be enhanced to find shelf with available space
    return this.shelves[0] || this.shelves[0];
  }

  private getNextPosition(shelf: THREE.Group): THREE.Vector3 {
    const objectCount = Array.from(this.objects.values()).length;
    const shelfIndex = Math.floor(objectCount / 8); // 8 objects per shelf
    const positionIndex = objectCount % 8;
    
    const basePosition = shelf.position.clone();
    basePosition.x += -0.7 + (positionIndex * 0.2);
    basePosition.y += 0.6 + (shelfIndex * 0.4);
    basePosition.z += 0.1;
    
    return basePosition;
  }

  private async animateRobotToPosition(targetPosition: THREE.Vector3): Promise<void> {
    this.robot.play('Walking', 0.3);
    
    // Simple animation towards target (could be enhanced with pathfinding)
    // For now, just animate for a fixed duration to simulate movement
    console.log(`Robot moving to position:`, targetPosition);
    
    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = 1000; // 1 second
      
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress >= 1) {
          resolve();
          return;
        }
        
        requestAnimationFrame(animate);
      };
      
      animate();
    });
  }

  private animateObjectScale(mesh: THREE.Mesh, targetScale: number, duration: number): void {
    const startScale = mesh.scale.x;
    const startTime = performance.now();
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
      
      const currentScale = startScale + (targetScale - startScale) * easeOut;
      mesh.scale.setScalar(currentScale);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  private updateReferences(): void {
    // Update reference arrow visualizations
    this.objects.forEach((obj) => {
      if (obj.references > 0) {
        // Object is referenced - show as active
        if (obj.highlighted) {
          obj.mesh.material = this.highlightMaterial;
        }
      } else {
        // Object is unreferenced - could be garbage collected
        obj.mesh.material = new THREE.MeshStandardMaterial({ 
          color: 0x666666, 
          transparent: true, 
          opacity: 0.5 
        });
      }
    });
  }

  private updateReferenceVisualization(id: string): void {
    // Create or update reference arrows (simplified implementation)
    const obj = this.objects.get(id);
    if (!obj) return;
    
    // Visual feedback for reference changes could be added here
    if (obj.references > 0) {
      this.highlightObject(id, true);
      setTimeout(() => this.highlightObject(id, false), 1000);
    }
  }

  private animateHighlights(_dt: number): void {
    // Animate highlighted objects with a subtle glow effect
    // _dt parameter reserved for future frame-based animations
    this.objects.forEach((obj) => {
      if (obj.highlighted && obj.mesh.material === this.highlightMaterial) {
        const time = performance.now() * 0.003;
        this.highlightMaterial.emissiveIntensity = 0.3 + Math.sin(time) * 0.2;
      }
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}