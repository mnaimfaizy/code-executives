import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '../../three';
import type { ThreeCanvasHandle } from '../../three/react/ThreeCanvas';
import { MemoryHeapLibrary } from '../../three/models/MemoryHeapLibrary';

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

    useEffect(() => {
      // Initialize the library model
      const library = new MemoryHeapLibrary({
        position: new THREE.Vector3(0, 0, 0),
        scale: 1
      });
      libraryRef.current = library;

      // Get the engine and add the model
      const engine = canvasRef.current?.getEngine();
      if (engine) {
        engine.addModel(library);
        
        // Set up camera for optimal viewing using engine's focusCamera method
        engine.focusCamera(
          library.getOptimalCameraPosition(),
          library.getFocusPosition()
        );
      }

      return () => {
        if (engine && library) {
          engine.removeModel(library);
        }
        libraryRef.current = null;
      };
    }, []);

    useImperativeHandle(ref, () => ({
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
          engine.focusCamera(
            library.getOptimalCameraPosition(),
            library.getFocusPosition()
          );
        }
      }
    }), []);

    return (
      <div className={className}>
        <ThreeCanvas
          ref={canvasRef}
          models={[]} // Models are added programmatically
          background={0x1a1a2e} // Dark blue background for library atmosphere
          className="w-full h-full"
        />
        
        {/* 3D Controls Info Overlay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          <div>🖱️ Left Click + Drag: Rotate</div>
          <div>🔍 Scroll: Zoom</div>
          <div>🎯 Right Click + Drag: Pan</div>
        </div>
        
        {/* Memory Operations Legend */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-3 py-2 rounded">
          <div className="font-semibold mb-1">Memory Objects:</div>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span>User Objects</span>
          </div>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>Settings</span>
          </div>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <span>Cache</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-pink-400 rounded"></div>
            <span>Lists/Arrays</span>
          </div>
        </div>
      </div>
    );
  }
);

MemoryHeap3D.displayName = 'MemoryHeap3D';

export default MemoryHeap3D;