// Memory monitoring utilities
export interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private monitoring = false;

  private constructor() {}

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  startMonitoring(): void {
    if (this.monitoring) return;
    this.monitoring = true;
    console.log('🧠 Memory monitoring started');
  }

  stopMonitoring(): void {
    if (!this.monitoring) return;
    this.monitoring = false;
    console.log('🧠 Memory monitoring stopped');
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
