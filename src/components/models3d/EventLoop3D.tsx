import { useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '../../three';
import type { ThreeCanvasHandle } from '../../three/react/ThreeCanvas';
import { EventLoopRestaurant } from '../../three/models/EventLoopRestaurant';

// Type for simplified restaurant
type SimpleEventLoopRestaurant = {
  group: THREE.Group;
  callStackOrders: THREE.Mesh[];
  microtaskOrders: THREE.Mesh[];
  macrotaskOrders: THREE.Mesh[];
  init(scene: THREE.Scene): void;
  buildSimpleKitchen(): void;
  addCallStackOrder(taskName: string): void;
  processCallStackOrder(): void;
  addMicrotaskOrder(taskName: string): void;
  processMicrotaskOrder(): void;
  addMacrotaskOrder(taskName: string): void;
  processMacrotaskOrder(): void;
  pushToCallStack(taskName: string): void;
  popFromCallStack(): void;
  addToMicrotaskQueue(taskName: string): void;
  processMicrotask(): void;
  addToMacrotaskQueue(taskName: string): void;
  processMacrotask(): void;
  setEventLoopStatus(status: string): void;
  reset(): void;
  getState(): { callStack: string[]; microtasks: string[]; macrotasks: string[] };
  getOptimalCameraPosition(): THREE.Vector3;
  getFocusPosition(): THREE.Vector3;
};

export interface EventLoop3DHandle {
  pushToCallStack(taskName: string): void;
  popFromCallStack(): void;
  addToMicrotaskQueue(taskName: string): void;
  processMicrotask(): void;
  addToMacrotaskQueue(taskName: string): void;
  processMacrotask(): void;
  setEventLoopStatus(status: 'executing' | 'microtasks' | 'macrotask' | 'idle'): void;
  reset(): void;
  focusCamera(): void;
  getState(): {
    callStack: string[];
    microtasks: string[];
    macrotasks: string[];
  };
}

export interface EventLoop3DProps {
  className?: string;
  callStack?: string[];
  microtasks?: string[];
  macrotasks?: string[];
  animating?: {
    type: 'pop' | 'push' | 'source';
    label?: string;
    source?: 'micro' | 'macro';
  };
  activeLight?: 'green' | 'yellow' | 'red';
  activeBlock?: 'stack' | 'micro' | 'macro' | 'eventloop';
}

const EventLoop3D = forwardRef<EventLoop3DHandle, EventLoop3DProps>(
  (
    {
      className = 'h-full w-full relative',
      // callStack = [],
      // microtasks = [],
      // macrotasks = [],
      // animating,
      // activeLight,
    },
    ref
  ) => {
    const canvasRef = useRef<ThreeCanvasHandle>(null);
    const restaurantRef = useRef<EventLoopRestaurant | SimpleEventLoopRestaurant | null>(null);

    // Create a simplified EventLoopRestaurant that avoids shader compilation issues
    const restaurant = useMemo(() => {
      class SimpleEventLoopRestaurant {
        group = new THREE.Group();
        callStackOrders: THREE.Mesh[] = [];
        microtaskOrders: THREE.Mesh[] = [];
        macrotaskOrders: THREE.Mesh[] = [];

        init(scene: THREE.Scene) {
          console.log('SimpleEventLoopRestaurant: Initializing');

          // Create simple kitchen layout using basic materials
          this.buildSimpleKitchen();

          scene.add(this.group);
          console.log(
            'SimpleEventLoopRestaurant: Initialized with',
            this.group.children.length,
            'children'
          );
        }

        buildSimpleKitchen() {
          // Create a simple floor
          const floorGeometry = new THREE.PlaneGeometry(10, 10);
          const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
          const floor = new THREE.Mesh(floorGeometry, floorMaterial);
          floor.rotation.x = -Math.PI / 2;
          this.group.add(floor);

          // Create call stack station (blue box)
          const stackGeometry = new THREE.BoxGeometry(2, 0.5, 1);
          const stackMaterial = new THREE.MeshBasicMaterial({ color: 0x6366f1 });
          const stackStation = new THREE.Mesh(stackGeometry, stackMaterial);
          stackStation.position.set(0, 0.25, 0);
          this.group.add(stackStation);

          // Create microtask queue (yellow box)
          const microGeometry = new THREE.BoxGeometry(1, 0.3, 2);
          const microMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
          const microStation = new THREE.Mesh(microGeometry, microMaterial);
          microStation.position.set(-3, 0.15, 2);
          this.group.add(microStation);

          // Create macrotask queue (light blue box)
          const macroGeometry = new THREE.BoxGeometry(1, 0.3, 2);
          const macroMaterial = new THREE.MeshBasicMaterial({ color: 0x87ceeb });
          const macroStation = new THREE.Mesh(macroGeometry, macroMaterial);
          macroStation.position.set(-3, 0.15, -2);
          this.group.add(macroStation);

          // Create event loop (green sphere)
          const loopGeometry = new THREE.SphereGeometry(0.5);
          const loopMaterial = new THREE.MeshBasicMaterial({ color: 0x10b981 });
          const eventLoop = new THREE.Mesh(loopGeometry, loopMaterial);
          eventLoop.position.set(2, 0.5, 0);
          this.group.add(eventLoop);
        }

        update() {}

        dispose() {
          this.group.parent?.remove(this.group);
        }

        // Event Loop Restaurant methods
        pushToCallStack(taskName: string) {
          console.log('Simple pushToCallStack:', taskName);
          const order = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.1, 0.3),
            new THREE.MeshBasicMaterial({ color: 0xff6b6b })
          );
          const stackHeight = this.callStackOrders.length;
          order.position.set(0, 0.5 + stackHeight * 0.15, 0);
          this.group.add(order);
          this.callStackOrders.push(order);
        }

        popFromCallStack() {
          console.log('Simple popFromCallStack');
          if (this.callStackOrders.length > 0) {
            const order = this.callStackOrders.pop()!;
            this.group.remove(order);
          }
        }

        addToMicrotaskQueue(taskName: string) {
          console.log('Simple addToMicrotaskQueue:', taskName);
          const order = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.1, 0.2),
            new THREE.MeshBasicMaterial({ color: 0xffeb3b })
          );
          const queueLength = this.microtaskOrders.length;
          order.position.set(-3, 0.3, 2 + queueLength * 0.3);
          this.group.add(order);
          this.microtaskOrders.push(order);
        }

        processMicrotask() {
          console.log('Simple processMicrotask');
          if (this.microtaskOrders.length > 0) {
            const order = this.microtaskOrders.shift()!;
            this.group.remove(order);
          }
        }

        addToMacrotaskQueue(taskName: string) {
          console.log('Simple addToMacrotaskQueue:', taskName);
          const order = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.1, 0.2),
            new THREE.MeshBasicMaterial({ color: 0x2196f3 })
          );
          const queueLength = this.macrotaskOrders.length;
          order.position.set(-3, 0.3, -2 - queueLength * 0.3);
          this.group.add(order);
          this.macrotaskOrders.push(order);
        }

        processMacrotask() {
          console.log('Simple processMacrotask');
          if (this.macrotaskOrders.length > 0) {
            const order = this.macrotaskOrders.shift()!;
            this.group.remove(order);
          }
        }

        setEventLoopStatus(status: string) {
          console.log('Simple setEventLoopStatus:', status);
        }

        reset() {
          console.log('Simple reset');
          // Remove all orders
          [...this.callStackOrders, ...this.microtaskOrders, ...this.macrotaskOrders].forEach(
            (order) => {
              this.group.remove(order);
            }
          );
          this.callStackOrders = [];
          this.microtaskOrders = [];
          this.macrotaskOrders = [];
        }

        getOptimalCameraPosition() {
          return new THREE.Vector3(8, 6, 8);
        }

        getFocusPosition() {
          return new THREE.Vector3(0, 0, 0);
        }
      }

      return new SimpleEventLoopRestaurant();
    }, []);

    useEffect(() => {
      restaurantRef.current = restaurant as unknown as EventLoopRestaurant;
      console.log('EventLoop3D: Restaurant ref set');

      // Camera setup for restaurant
      const timer = setTimeout(() => {
        const engine = canvasRef.current?.getEngine();
        console.log('EventLoop3D: Engine available:', !!engine);
        if (engine && restaurant) {
          console.log('EventLoop3D: Setting up camera');
          // Use restaurant's camera settings
          engine.focusCamera(restaurant.getOptimalCameraPosition(), restaurant.getFocusPosition());
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        restaurantRef.current = null;
      };
    }, [restaurant]);

    // TODO: Handle animation states and active light changes when state management is restored

    useImperativeHandle(
      ref,
      () => ({
        pushToCallStack(taskName: string): void {
          console.log('3D pushToCallStack:', taskName);
          restaurantRef.current?.pushToCallStack(taskName);
        },
        popFromCallStack(): void {
          console.log('3D popFromCallStack');
          restaurantRef.current?.popFromCallStack();
        },
        addToMicrotaskQueue(taskName: string): void {
          console.log('3D addToMicrotaskQueue:', taskName);
          restaurantRef.current?.addToMicrotaskQueue(taskName);
        },
        processMicrotask(): void {
          console.log('3D processMicrotask');
          restaurantRef.current?.processMicrotask();
        },
        addToMacrotaskQueue(taskName: string): void {
          console.log('3D addToMacrotaskQueue:', taskName);
          restaurantRef.current?.addToMacrotaskQueue(taskName);
        },
        processMacrotask(): void {
          console.log('3D processMacrotask');
          restaurantRef.current?.processMacrotask();
        },
        setEventLoopStatus(status: 'executing' | 'microtasks' | 'macrotask' | 'idle'): void {
          console.log('3D setEventLoopStatus:', status);
          restaurantRef.current?.setEventLoopStatus(status);
        },
        reset(): void {
          console.log('3D reset');
          restaurantRef.current?.reset();
        },
        focusCamera(): void {
          console.log('3D focusCamera');
          const engine = canvasRef.current?.getEngine();
          if (engine && restaurant) {
            engine.focusCamera(
              restaurant.getOptimalCameraPosition(),
              restaurant.getFocusPosition()
            );
          }
        },
        getState() {
          return (
            restaurantRef.current?.getState() || { callStack: [], microtasks: [], macrotasks: [] }
          );
        },
      }),
      [restaurant]
    );

    // Memoize the models array to prevent unnecessary re-renders
    const models = useMemo(() => [restaurant], [restaurant]);

    return (
      <div className={className}>
        <ThreeCanvas
          ref={canvasRef}
          models={models}
          background={0xf0f8ff} // Light blue sky background for restaurant atmosphere
          className="w-full h-full"
        />
      </div>
    );
  }
);

EventLoop3D.displayName = 'EventLoop3D';

export default EventLoop3D;
