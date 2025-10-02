import { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '../../../../../three';
import type { ThreeCanvasHandle } from '../../../../../three/react/ThreeCanvas';
import { MemoryHeapLibrary } from '../../../../../three/models/MemoryHeapLibrary';

export interface MemoryHeap3DHandle {
  allocateObject(id: string, type?: string, size?: number): Promise<void>;
  deallocateObject(id?: string): Promise<void>;
  highlightObject(id: string, highlight: boolean): void;
  addReference(id: string): void;
  removeReference(id: string): void;
  reset(): void;
  focusCamera(): void;
}

export interface MemoryHeap3DProps {
  className?: string;
}

const MemoryHeap3D = forwardRef<MemoryHeap3DHandle, MemoryHeap3DProps>(
  ({ className = 'h-full w-full' }, ref) => {
    const canvasRef = useRef<ThreeCanvasHandle>(null);
    const libraryRef = useRef<MemoryHeapLibrary | null>(null);
    const [library] = useState(
      () =>
        new MemoryHeapLibrary({
          position: new THREE.Vector3(0, 0, 0),
          scale: 1,
        })
    );

    useEffect(() => {
      libraryRef.current = library;

      // Wait for next tick to ensure canvas is ready
      const timer = setTimeout(() => {
        const engine = canvasRef.current?.getEngine();
        if (engine && library) {
          // Set up camera for optimal viewing using engine's focusCamera method
          engine.focusCamera(library.getOptimalCameraPosition(), library.getFocusPosition());
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        libraryRef.current = null;
      };
    }, [library]);

    useImperativeHandle(
      ref,
      () => ({
        async allocateObject(id: string, type?: string, size?: number): Promise<void> {
          if (libraryRef.current) {
            await libraryRef.current.allocateObject(id, type, size);
          }
        },

        async deallocateObject(id?: string): Promise<void> {
          if (libraryRef.current) {
            await libraryRef.current.deallocateObject(id);
          }
        },

        highlightObject(id: string, highlight: boolean): void {
          if (libraryRef.current) {
            libraryRef.current.highlightObject(id, highlight);
          }
        },

        addReference(id: string): void {
          if (libraryRef.current) {
            libraryRef.current.addReference(id);
          }
        },

        removeReference(id: string): void {
          if (libraryRef.current) {
            libraryRef.current.removeReference(id);
          }
        },

        reset(): void {
          if (libraryRef.current) {
            libraryRef.current.reset();
          }
        },

        focusCamera(): void {
          const engine = canvasRef.current?.getEngine();
          const library = libraryRef.current;
          if (engine && library) {
            // Use engine's built-in focusCamera method
            engine.focusCamera(library.getOptimalCameraPosition(), library.getFocusPosition());
          }
        },
      }),
      []
    );

    return (
      <ThreeCanvas
        ref={canvasRef}
        models={[library]} // Pass library as model
        background={0xf5f5dc} // Warm beige background for library atmosphere
        className={className}
      />
    );
  }
);

MemoryHeap3D.displayName = 'MemoryHeap3D';

export default MemoryHeap3D;
