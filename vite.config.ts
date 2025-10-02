import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import type { Plugin } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Bundle analyzer - generates stats.html
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }) as Plugin,
  ],
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
        manualChunks(id) {
          // Vendor chunks - split by library size
          if (id.includes('node_modules')) {
            // Three.js and related (large library)
            if (id.includes('three')) {
              return 'vendor-three';
            }
            // React ecosystem (core libraries)
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Lucide icons (medium-sized)
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Other node_modules
            return 'vendor-misc';
          }

          // Feature-based chunks (lazy loaded via routes)
          // These will be automatically split by Vite's dynamic imports

          // Shared components - split by type
          if (id.includes('/src/components/shared/')) {
            return 'shared-components';
          }

          // Python 3D visualizations (heavy)
          if (id.includes('/src/components/models3d/python/')) {
            return 'python-3d';
          }

          // Other 3D visualizations
          if (id.includes('/src/components/models3d/')) {
            return 'models-3d';
          }

          // 2D visualizations - keep with features for better initial load
          // No manual chunking needed, will be in feature bundles

          // Shared utilities
          if (id.includes('/src/utils/')) {
            return 'shared-utils';
          }

          // Context providers
          if (id.includes('/src/shared/contexts/')) {
            return 'shared-contexts';
          }

          // Hooks
          if (id.includes('/src/hooks/') || id.includes('/src/shared/hooks/')) {
            return 'shared-hooks';
          }
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500, // Warn for chunks > 500KB
    target: 'esnext',
    minify: 'esbuild',
    // Enable source maps for production debugging
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    exclude: ['three'], // Three.js has its own optimization
  },
});
