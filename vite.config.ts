import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import type { Plugin } from 'vite';

const copyQuizBanksPlugin = (): Plugin => {
  let quizBanksSourceDir = '';
  let quizBanksOutputDir = '';

  return {
    name: 'copy-quiz-banks',
    apply: 'build',
    configResolved(config) {
      quizBanksSourceDir = resolve(config.root, 'quiz-banks');
      quizBanksOutputDir = resolve(config.root, config.build.outDir, 'quiz-banks');
    },
    closeBundle() {
      if (!existsSync(quizBanksSourceDir)) {
        return;
      }

      cpSync(quizBanksSourceDir, quizBanksOutputDir, { recursive: true });
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copyQuizBanksPlugin(),
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
          if (id.includes('node_modules')) {
            if (id.includes('three')) {
              return 'vendor-three';
            }
            if (id.includes('monaco-editor')) {
              return 'vendor-monaco';
            }
            if (id.includes('@xyflow')) {
              return 'vendor-xyflow';
            }

            // Let Rollup group the rest of node_modules automatically.
            // The previous manual vendor splitting created circular chunk dependencies
            // that broke the production preview runtime.
            return undefined;
          }

          if (id.includes('/src/components/models3d/python/')) {
            return 'python-3d';
          }

          if (id.includes('/src/components/models3d/')) {
            return 'models-3d';
          }

          return undefined;
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
