import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // @ts-expect-error - Vitest config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/types',
      ],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Three.js and related libraries
          'three-vendor': ['three'],
          // Separate Python 3D visualizations
          'python-3d': [
            './src/components/models3d/python/PythonVM3D',
            './src/components/models3d/python/MemoryProfiler3D',
            './src/components/models3d/python/CallGraph3D',
          ],
          // Separate other 3D visualizations
          'three-visualizations': [
            './src/components/models3d/ComplexityLandscape3D',
            './src/components/models3d/EventLoop3D',
            './src/components/models3d/MemoryHeap3D',
            './src/components/models3d/TreeVisualization3D',
          ],
          // Group shared utilities
          'shared-utils': ['./src/utils/theme', './src/utils/instrument'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
});
