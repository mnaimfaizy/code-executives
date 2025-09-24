// Memory monitoring utilities for Three.js applications
import type { WebGLRenderer } from 'three';
export interface MemoryStats {
  geometries: number;
  textures: number;
  materials: number;
  renderTargets: number;
  programs: number;
  info: {
    memory: {
      geometries: number;
      textures: number;
    };
    render: {
      calls: number;
      triangles: number;
      points: number;
      lines: number;
    };
    programs: number;
  };
}

export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private memoryStats: MemoryStats | null = null;
  private monitoring = false;

  private constructor() {}

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  startMonitoring(renderer: WebGLRenderer): void {
    if (this.monitoring) return;

    this.monitoring = true;
    console.log('🧠 Memory monitoring started');

    // Log initial memory stats
    this.logMemoryStats(renderer);
  }

  stopMonitoring(): void {
    if (!this.monitoring) return;

    this.monitoring = false;
    console.log('🧠 Memory monitoring stopped');
  }

  logMemoryStats(renderer: WebGLRenderer): void {
    if (!renderer || !renderer.info) return;

    const info = renderer.info;
    const stats: MemoryStats = {
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      materials: 0, // Not directly available
      renderTargets: 0, // Not directly available
      programs: Array.isArray(info.programs) ? info.programs.length : info.programs || 0,
      info: {
        memory: {
          geometries: info.memory.geometries,
          textures: info.memory.textures,
        },
        render: {
          calls: info.render.calls,
          triangles: info.render.triangles,
          points: info.render.points,
          lines: info.render.lines,
        },
        programs: Array.isArray(info.programs) ? info.programs.length : info.programs || 0,
      },
    };

    this.memoryStats = stats;

    if (this.monitoring) {
      console.group('📊 Three.js Memory Stats');
      console.log(`Geometries: ${stats.geometries}`);
      console.log(`Textures: ${stats.textures}`);
      console.log(`Programs: ${stats.programs}`);
      console.log(`Render Calls: ${stats.info.render.calls}`);
      console.log(`Triangles: ${stats.info.render.triangles}`);
      console.groupEnd();
    }
  }

  getMemoryStats(): MemoryStats | null {
    return this.memoryStats;
  }

  // Check for potential memory leaks
  checkForLeaks(renderer: WebGLRenderer, previousStats?: MemoryStats): boolean {
    if (!renderer || !renderer.info || !previousStats) return false;

    const current = renderer.info;
    const hasLeak =
      current.memory.geometries > previousStats.geometries + 10 || // Allow some tolerance
      current.memory.textures > previousStats.textures + 5; // Allow some tolerance

    if (hasLeak && this.monitoring) {
      console.warn('🚨 Potential memory leak detected!');
      console.warn('Previous:', previousStats);
      console.warn('Current:', current);
    }

    return hasLeak;
  }

  forceGC(): void {
    if ('gc' in window) {
      (window as { gc: () => void }).gc();
      console.log('🗑️ Forced garbage collection');
    }
  }

  getBrowserMemoryInfo(): {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null {
    if ('memory' in performance) {
      return (
        performance as {
          memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
        }
      ).memory;
    }
    return null;
  }

  logBrowserMemory(): void {
    const memInfo = this.getBrowserMemoryInfo();
    if (memInfo && this.monitoring) {
      console.group('🌐 Browser Memory Info');
      console.log(`Used JS Heap: ${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Total JS Heap: ${(memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Heap Limit: ${(memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
      console.groupEnd();
    }
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private monitoring = false;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(): void {
    if (this.monitoring) return;

    this.monitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    console.log('⚡ Performance monitoring started');
  }

  stopMonitoring(): void {
    if (!this.monitoring) return;

    this.monitoring = false;
    console.log('⚡ Performance monitoring stopped');
  }

  updateFrame(): void {
    if (!this.monitoring) return;

    this.frameCount++;
    const currentTime = performance.now();

    if (currentTime - this.lastTime >= 1000) {
      // Update every second
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;

      if (this.fps < 30) {
        console.warn(`🐌 Low FPS detected: ${this.fps}`);
      } else if (this.monitoring) {
        console.log(`🎮 FPS: ${this.fps}`);
      }
    }
  }

  getFPS(): number {
    return this.fps;
  }

  // Measure function execution time
  measureExecutionTime<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    if (this.monitoring) {
      console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
    }

    return result;
  }
}

// Export singleton instances
export const memoryMonitor = MemoryMonitor.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();
